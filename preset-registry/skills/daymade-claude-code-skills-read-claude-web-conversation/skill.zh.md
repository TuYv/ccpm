---
name: read-claude-web-conversation
description: >-
  Read or export the COMPLETE transcript of a Claude.ai web conversation — both
  private claude.ai/chat/... and public claude.ai/share/... links — by calling
  Claude.ai's internal API from inside the user's logged-in Chrome, and download its
  FILES too (uploads, deliverables). Use whenever the user pastes a claude.ai
  conversation or share link and asks to read, summarize, export, archive, or extract
  it — "read this Claude conversation", "导出这个网页版对话", "把这个对话拉到本地". Every naive
  approach fails SILENTLY: curl/WebFetch hit a Cloudflare challenge; get_page_text
  sees only the last message; the default API rendering collapses tool calls into
  placeholders (~5% of it); a share payload uses block shapes a /chat/-only renderer
  drops without error. Works even when the claude-in-chrome extension cannot pair
  (different account), via CDP or a macOS AppleScript fallback. Scope: ONLINE
  claude.ai. For LOCAL Claude Code sessions use claude-code-history-files-finder; for
  an exported .txt/.json file use claude-export-txt-better.
---
# 读取 Claude.ai 网页对话

将 Claude.ai **网页**对话提取为完整的结构化记录——包含每条消息和每次工具调用，而不仅仅是当前屏幕上显示的内容。

已根据截至 2026 年 7 月的 Claude.ai 网页 API 进行验证。这些是 Claude.ai 前端调用的同一组私有 JSON 端点；它们并非有正式文档或版本稳定的公共 API，因此，如果请求返回 404，请从 Network 标签页重新推导其结构（参见 [references/claude-web-api-extraction.md](references/claude-web-api-extraction.md)）。

## 此技能与同类技能的区别

请根据*你持有的来源*进行选择，而不是根据“conversation”一词：

| 来源 | 使用 |
|--------|-----|
| 实时的 **`claude.ai/chat/…`** 或 **`claude.ai/share/…`** URL | **此技能** |
| 本地 Claude Code 会话（`~/.claude/projects/*.jsonl`） | `claude-code-history-files-finder` |
| 已导出的 `.txt` / `.json` 对话文件 | `claude-export-txt-better` |

## 为什么显而易见的方法会失败（请先阅读本节）

这里有四个陷阱，而且**每一个都会静默失败**——你得到的内容看起来像是完整导出，只有当你碰巧知道对话实际有多长时，才会发现内容有所缺失。默认应假定你得到的结果是在欺骗你；第 4 步中的保真度门禁正是为了让这些谎言变得可察觉。

1. **登录墙。** `curl` 和 `WebFetch` 不会得到身份验证重定向——它们得到的是 Cloudflare 质询页面（HTTP 403，`Just a moment...`）。无论如何调整请求头都无法解决此问题；该页面受用户 Chrome 中现有会话的限制。**绝不要在这里使用 curl，即使只是为了“检查一下”也不行。**
2. **虚拟滚动。** 即使对话已经打开，`get_page_text` 和 DOM 抓取仍然只能看到当前渲染的少量消息——通常只有最后一条。包含 40 条消息的对话线程可能只返回 1 条。
3. **默认渲染会折叠工具调用。** API 的默认渲染会将每个工具调用都转换成“你当前的设备不支持”占位符。在研究型/代理型对话中，工具块本身就是内容：在一次真实测量中，默认渲染仅返回 **9.4k 个字符，而使用 `render_all_tools=true` 时为 173k**——只有 5%。始终请求完整渲染。
4. **仅适配 /chat/ 结构的渲染器会静默丢弃 /share/ 块。** share 载荷会将 web_search 命中结果作为 `knowledge` 项而非 `text` 项返回。只识别 `text` 的渲染器会为这些项返回空字符串，并且不会报告任何错误——同一段真实对话被渲染为 **8k 个字符，而非 146k（保留率为 4.8%）**，同时表面上看起来完全正常。

**可靠路径：**在用户已登录的页面*内部*运行 JavaScript，让 `fetch` 继承会话 Cookie，然后通过保真度门禁在本地进行渲染。

## 第 0 步——选择注入通道

有三种通道可以在用户页面内部执行 JS。它们的区别只在于连接方式，而且各自有不同的失败方式，因此请按以下顺序选择，并进行**验证**，不要想当然。

| 顺序 | 通道 | 使用条件 | 失败条件 |
|-------|---------|----------|-----------|
| 1 | **claude-in-chrome 扩展** | `list_connected_browsers` 返回浏览器 | 返回 `[]` → 扩展的 claude.ai 登录账号 ≠ Claude Code 账号。这是**结构性**问题——重试、重新安装和 `switch_browser` 都无效。请立即转向下一种方式。 |
| 2 | **CDP**（`scripts/cdp_channel.py probe`） | probe 显示 `available: true`——此时它是最佳通道 | 通常不可用，而这**是正常现象，并非故障**——见下文。probe 的成本很低；相信其结果并转向下一种方式。 |
| 3 | **AppleScript**（仅限 macOS） | 扩展无法配对时切实可行的后备方案 | 请参阅下文的路由陷阱——在责怪用户之前先检查这一点 |
| ✗ | **curl / WebFetch** | **永不使用** | Cloudflare 403。不存在能够解决此问题的请求头。 |

**⚠️ 应当预期 CDP 不可用，并且绝不要试图强行启用它。** 从 Chrome 136
（2025 年 4 月）开始，调试端口在*默认 user-data-dir 上会被忽略*——这是针对利用
CDP 窃取 Cookie 的恶意软件而特意实施的安全加固。你可能仍会发现一个正在监听的
套接字以及磁盘上残留的 `DevToolsActivePort`，但 WebSocket 握手始终得不到响应，
而 `/json/*` 返回 404。

**而且它的可用性会反复变化。** 已在 Chrome 150 上验证，使用同一台机器、同一个浏览器
会话：端点先是可以工作，之后完全停止响应，随后又恢复响应——期间没有重启。因此，
**每次都要探测，绝不要缓存判断结果**。“CDP 五分钟前还能用”不能证明它现在仍然可用，
而“CDP 失败过一次”也不能证明这台机器无法使用它。探测的成本很低，正因如此，你完全
可以每次都重新检查。

接下来你很可能会落入一个陷阱。网上的所有修复方法都说“使用
`--user-data-dir=/tmp/whatever` 重新启动 Chrome”。**对于此 Skill，这不仅毫无用处，
反而会让情况更糟：新配置文件处于未登录状态，而未登录的浏览器无法读取用户的任何一条
对话。** 你需要的会话恰恰存在于 Chrome 拒绝暴露的那个配置文件中。因此，执行探测，
接受探测结果，然后回退——绝不要为了追逐某个端口而重新配置或重启用户的浏览器。

当 Chrome 被特意使用非默认的 `--user-data-dir` 启动，**并且**已登录 claude.ai 时，
CDP *确实*可以工作。这种情况确实会出现，而一旦出现，此通道会全面优于其他通道
（无需切换菜单、不受下文 Apple Events 捕获问题的影响、可枚举每个标签页，并在 stdout
上返回完整负载）。这正是为什么在转入后续方案之前，值得先进行一次低成本探测。

**要尝试通道 1**，请通过一次 ToolSearch 调用加载扩展的工具
（它们是延迟加载的；此 API 路径不需要 `get_page_text` / `read_page`）：

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool
```

然后调用 `list_connected_browsers`。空列表意味着账户不匹配——请转到通道 2，而不是
重试。

**要尝试通道 2：**

```bash
uv run --with websockets python scripts/cdp_channel.py probe
```

`probe` 会同时回答三个问题：CDP 是否可用、它是否指向用户的*真实*浏览器
（页面数量，以及已打开的任何 claude.ai 标签页），以及是否有**多个 Chrome 实例**
正在运行。其输出会决定下文的所有操作——包括 AppleScript 决策，因为
`chrome_instances.automation` 列表会告诉你 Apple Events 是否能够触达正确的浏览器。

退出代码是一项约定，因此你永远不必猜测是否应该回退：

| 代码 | 含义 | 操作 |
|------|---------|-----------|
| 0 | 成功 | 继续 |
| 1 | 输入错误（无法读取的 `--js` 等） | 修正调用 |
| 2 | `TAB_NOT_FOUND` | 使用 `open`，或请用户打开该页面 |
| **3** | **CDP 不可用** | **回退到其他通道——这是正常结果** |
| 4 | 浏览器返回错误 | 命令有误，或标签页在调用过程中消失；回退无济于事 |

退出码 3 仍会输出 `chrome_instances`，因为这部分不需要调试端口。
这是路由事实，而不是错误：读取它，继续进入通道 3，并且不要向用户提及
任何有关调试端口的内容。

### AppleScript 路由陷阱（在责怪用户之前请先阅读）

AppleScript 通过 *bundle id* 寻址 Chrome。如果有第二个 Chrome 实例正在
运行——无论是 chrome-devtools-mcp、puppeteer、playwright，还是任何使用其
自有 `--user-data-dir` 启动的实例——Apple Events 都可能转而落到**那个**
实例上，而且 macOS 不提供任何按 pid 定位第一个实例的方法。没有解决办法。

真正危险的是它的*表现方式*：自动化配置文件关闭了
“Allow JavaScript from Apple Events”，因此你的 JS 尝试会失败并显示
**"Executing JavaScript through AppleScript is turned off"**——而你会
断定用户忘记开启某个菜单选项，然后要求他们将其打开，然而他们真正使用的
浏览器其实一直启用了该选项。实际观察到的情况正是如此：AppleScript
报告 `windows=1 tabs=1`，而用户实际使用的 Chrome 打开了 35 个标签页。

因此，在回退到 AppleScript 之前，请运行 `probe`（或运行 `cdp_channel.py`
中的 `chrome_instances()`），并查看 `automation` 列表。如果该列表非空，
请明确说明——*"某个自动化 Chrome 正占用 Apple Events 路由，因此
AppleScript 会命中错误的浏览器"*——然后使用 CDP，或者询问是否可以关闭
该实例。不要转述你无法确定归因的选项开关错误。

通道详情和 base64 二进制桥接：[references/applescript_fallback_channel.md](references/applescript_fallback_channel.md)。

## 第 1 步——确定账户情形（这决定了你究竟能获取什么）

**你能获取多少对话内容，取决于浏览器登录的是谁的账户。** 请尽早确认这一点——
这决定了用户拿到的是完整归档，还是存在无法恢复缺失内容的归档；在你将归档
交给用户*之前*，他们理应知道自己拿到的是哪一种。

| 情形 | 信号 | 你能获取的内容 |
|------|--------|------------------|
| **A · 未登录** | `/api/organizations` 未返回任何组织 | 无法获取 `/chat/` 链接中的任何内容。停止操作，并要求用户在 Chrome 中登录 claude.ai——绝不要自动执行登录。 |
| **B · 已登录，且对话属于此账户** | `GET .../chat_conversations/<conversation-id>` 返回 200 | **所有内容**，包括已上传附件的内容。只要此路径可用，就应优先使用。 |
| **C · 已登录，但链接是其他人的分享链接** | 获取对话时返回 404；快照的 `creator` ≠ 此账户 | 只能获取快照。**平台会移除所有涉及分享者所上传文件的工具调用参数和结果。** 无法从该链接恢复。 |

对于 `/share/…` 链接，快照载荷本身会告诉你属于哪种情形：其中包含
`conversation_uuid`（原始对话）和 `creator`。因此，请先获取快照，然后使用该
`conversation_uuid` **尝试获取原始对话**——如果返回 200，则属于情形 B，
你应从原始对话重新导出，因为快照必然会损失更多内容。如果返回 404，则属于
情形 C：请明确说明这一点，并让渲染步骤在对话记录的标题中披露缺失内容
（它会自行完成此操作）。

情形 C 中的缺失是真实存在的，值得准确说明，因为它们看起来像是导出中的错误，
但其实并非如此：上传文件的 `view` 会保留其名称，但会丢失其 `path`
以及文件的全部内容。用户自己的该文件副本通常仍保存在其磁盘上——导出并未损坏，
它只是无法代替平台拒绝共享的文件提供内容。

## 第 2 步——打开对话

扩展：使用 `tabs_context_mcp` 并传入 `{ "createIfEmpty": true }`，然后执行 `navigate`。
CDP：`cdp_channel.py open --url <url>`（复用现有标签页；等待 Cloudflare
中间页面结束，浏览器会自行通过该页面）。

无论使用哪种方式，都要确认页面确实已加载且已登录——标签页标题应当是
对话名称，而不是“Log in”。如果进入登录页面，请停止并告知用户；
不要自动执行登录。

## 第 3 步——获取载荷

**始终请求完整的工具渲染结果。** 如果没有 `render_all_tools=true`，
原本显示分析内容的位置会变成占位符（即上面的陷阱 3）。

| 链接类型 | 端点 |
|-----------|----------|
| `/chat/<conversation-id>` | `GET /api/organizations/<org-uuid>/chat_conversations/<conversation-id>?tree=True&rendering_mode=messages&render_all_tools=true` |
| `/share/<snapshot-id>` | `GET /api/chat_snapshots/<snapshot-id>?rendering_mode=messages&render_all_tools=true` |

请注意，共享端点使用 URL 中的 **快照 ID** 作为键，它*不是*
对话 ID——将快照 ID 传给 `chat_conversations` 会返回 404，而这个
404 表示“ID 错误”，并非“你没有访问权限”。这两类 ID 都是不透明的；应始终
从打开的 URL 中获取它们，而不要硬编码。

- **扩展通道** → 在页面中运行 [scripts/export_conversation.js](scripts/export_conversation.js)
  （其文件头中包含触发后轮询的说明），然后以约 16k 的 `.slice()` 窗口分段读取
  `window.__claudeExport.rawJson`。
- **CDP 通道** → 运行 [scripts/fetch_cdp.js](scripts/fetch_cdp.js)，它会以 Promise 形式
  直接返回完整的对话 JSON，因此 `cdp_channel.py eval` 可通过一次调用解析
  该结果并将其流式写入文件：
  ```bash
  uv run --with websockets python scripts/cdp_channel.py eval \
      --match <conversation-or-snapshot-id> --js scripts/fetch_cdp.js --out conversation.json
  ```
  `awaitPromise` 会在一次调用中解析异步获取操作，并且值会通过
  stdout 返回，因此数兆字节的载荷完全不必跨越上下文窗口。
- **AppleScript 通道** → 通过 [scripts/runjs.applescript](scripts/runjs.applescript)
  运行 [scripts/export_conversation.js](scripts/export_conversation.js)，然后轮询并读取
  `window.__claudeExport.rawJson`（触发后轮询；请参阅通道参考文档）。

对于没有工具调用的普通聊天，如果你现在只需要文本，
[references/claude-web-api-extraction.md](references/claude-web-api-extraction.md)
中的内联代码片段可以通过一次调用在页面内组装出对话记录。

## 第 4 步——通过保真度检查在本地渲染

```bash
uv run python scripts/render_transcript.py conversation.json -o transcript.md \
    --source-url <url>
```

这同时处理两种 payload 结构（`/chat/` 和 `/share/`），渲染每一个工具调用，将工具输出折叠进 `<details>`，并把 web_search 引用汇集到“引用来源”列表中。

**它还会拒绝写出有损的对话记录。** 在输出任何内容之前，它会审计每个块——*这个块携带了 N 个字符；渲染器是否确实为它输出了任何内容？*——如果任何块携带了文本却没有产生任何输出，它就会以状态码 **2** 退出。这就是陷阱 4 的失败情形，而且如果没有这项检查，它是不可见的：markdown 看起来很干净，退出代码为 0，但 95% 的对话已经丢失。预算刻意根据原始 payload 计算，**而不是**通过渲染路径计算，因为如果一道关卡依赖解析器来判断有多少内容需要渲染，它最终只能确认解析器自身的盲区。

如果失败，它会指出有问题的块以及用于检查该块的命令：让 `result_item_text()`/`render_block()` 支持这种新结构。只有当你经过慎重考虑、确认这种损失可以接受时，才应使用 `--allow-lossy`——它几乎从来都不是正确答案，而且绝不应该是你尝试的*第一个*答案。

被**平台**清空的块（情况 C）会被单独计为已披露的缺口，而绝不会计为损失，并且会在对话记录的页眉中予以说明。一次无问题的运行会输出自己的统计结果：

```
fidelity: 143,088/143,088 chars rendered (100.0%)
known gap: 12 tool blocks were emptied by the platform (view) — disclosed in the
           transcript header, NOT recoverable from a shared link
```

该关卡按**每个 item** 而不是每个块进行审计——item 才是内容实际发生丢失的粒度，而按块检查时，只要一个块中的*任何*部分得到输出，整个块就会被算作已渲染，因此一个消失的 38k 字符 item 可以隐藏在一个 16 字符的同级 item 后面，仍然得到 100% 的评分。它还涵盖了仅审计 `content[]` 在结构上无法看到的内容：消息级的**附件正文**（粘贴的文档位于那里，而不是某个块中）、顶层 `text`，以及活动路径遍历从未触及的消息。此外，一个不含任何内容的 payload 得分是 **0%，而不是 100%**——空抓取正是这道关卡所要防范的内容丢失的极限情形。

**如果你修改了渲染器，请运行回归测试套件。** 其中的每个测试用例都代表一种曾经骗过旧版关卡的结构：

```bash
uv run python scripts/selftest_fidelity.py
```

### 输出格式与导航（`--toc`）

默认输出格式是 **Obsidian**，因为 Obsidian 的实时预览不会渲染 HTML `<details>`，否则可折叠的工具输出、思考内容和文件正文会以平铺的噪声形式出现。默认情况下，每个 `<details>` 块都会被改写为原生的 `> [!info]-` 可折叠标注块：

```bash
uv run python scripts/render_transcript.py conversation.json -o transcript.md \
    --source-url <url> --toc
```

如果你需要旧版 HTML `<details>` 输出，请改用 `--format markdown`。

转换**仅在保真度关卡已针对 `<details>` markdown 检查通过后**运行——这是一个纯外观层面的后处理步骤，不会改动任何 payload 字符串，因此绝不可能影响保留性证明（不要把它移到关卡之前）。`--toc` 会在开头添加带链接的目录，并插入逐消息锚点（`<a id="turn-N">`），让较长的对话易于导航。`--extract-file` 的输出绝不会被重新格式化。

其他模式保持不变：`--list-files` 会列出每个可下载文件及其所需的端点系列；`--extract-file <sandbox-path>` 会通过重放其 `create_file` 以及后续每一次 `str_replace` 来重建沙箱创建的文件；如果某项替换缺失或存在歧义，它会拒绝输出任何内容，而不是返回过时内容。

### 完成检查——只要仍有文件，渲染就尚未完成

`render_transcript.py` 在写入转录记录时会向 stderr 打印两行内容。
在宣布渲染完成之前，请将这**两行都**读完：

```
fidelity: 143,088/143,088 chars rendered (100.0%) across 7 message(s)
files: 2 downloadable file(s) in this conversation — the transcript names them but does NOT carry the bytes, so a text-only export is an INCOMPLETE archive. ...
```

`fidelity:` 行是保真度证明。`files:` 行是**完成信号**：如果它报告存在任何文件，转录记录会按名称引用这些文件，但不包含它们的字节内容——仅文本导出是不完整的归档。之所以将这一行放在与 `fidelity:` 相同的 stderr 流中，是因为完成驱动机制否则会看到 `100%` 就停止，而此时文件尚未拉取；这正是文本导出被误认为完整归档的原因。（完全没有 `files:` 行意味着该对话不包含可下载文件；渲染结果本身确实已经完整。）

**因此，当 `files:` 报告 N > 0 时，下载这些文件是此步骤的一部分，而不是可选的后续操作。** 用户说“archive / export / 拉到本地”时，要求的是完整归档；仅向他们提供转录记录，却让其中引用的文件仍未下载，等同于向他们提供不完整的归档。（`--list-files` / `--extract-file` 从不打印此通知——它们会在进入渲染分支之前返回。）

使用 [scripts/download_files.js](scripts/download_files.js) 通过正确的端点系列，清点并拉取每个上传文件、助手图像和沙箱交付物。该脚本是与通道无关的 JS；请通过获取内容时使用的同一通道运行它。CDP（一次调用，结果输出到 stdout）：

```bash
# 1. Fire the inventory/download
uv run --with websockets python scripts/cdp_channel.py eval \
    --match <conversation-or-snapshot-id> --js scripts/download_files.js
# 2. Poll until the status line is no longer 'pending' (a few seconds)
echo "window.__dlStatus" > /tmp/check_dl.js
uv run --with websockets python scripts/cdp_channel.py eval \
    --match <conversation-or-snapshot-id> --js /tmp/check_dl.js
# 3. Extract one file at a time (repeat for each name the status line listed)
echo "window.__dl['filename.png']" > /tmp/read_one.js
uv run --with websockets python scripts/cdp_channel.py eval \
    --match <conversation-or-snapshot-id> --js /tmp/read_one.js 2>/dev/null \
  | tr -d '\n' | base64 -d > filename.png
```

AppleScript 通道——当 CDP 不可用时，这是现实可行的回退方案（步骤 0 指出，默认配置文件通常会忽略 CDP），因此这里也提供了一个完整示例，而不只是一个替换指引：
```bash
# 1. Fire the inventory/download
osascript scripts/runjs.applescript scripts/download_files.js <conversation-id>
# 2. Poll until the status line is no longer 'pending' (a few seconds)
echo "window.__dlStatus" > /tmp/check_dl.js
osascript scripts/runjs.applescript /tmp/check_dl.js <conversation-id>
# 3. Extract one file at a time (repeat for each name the status line listed)
echo "window.__dl['filename.png']" > /tmp/read_one.js
osascript scripts/runjs.applescript /tmp/read_one.js <conversation-id> \
  2>/dev/null | tr -d '\n' | base64 -d > filename.png
```
扩展通道：通过 `javascript_tool` 运行脚本主体，并像处理其他大型返回结果一样，以约 16k 的分片从页面中取出 `window.__dl`。

使用 `file <name>` 验证每个文件（魔数——预期应为 `PNG image data`、
`Microsoft Excel 2007+`，而不是 `ASCII text`），并将其字节大小与对话
JSON 中的元数据进行比较（上传文件使用 `files[].size_bytes`；交付文件使用
`download_files.js` 的状态行）。将下载的文件保存在转录文本旁边——通常是一个同级的
`<transcript-basename>_附件/` 目录——并将转录文本中的图片引用重新指向本地副本。

## 第 5 步——分页（仅限扩展通道）

`javascript_tool` 会截断较大的返回值。先获取 `chars` 计数，
然后重新运行以返回后续窗口——保持获取操作完全相同，仅更改
最后的表达式：

```js
transcript.slice(14000, 32000);   // then (32000, 50000) … until you've covered `chars`
```

建议使用约 14–18k 的窗口；更大的窗口可能再次触发限制。**CDP 和
AppleScript 通道完全不需要这样做**——两者都会在 stdout 上返回完整载荷，
这也是在进行大型归档导出时优先选择它们的一个充分理由。

## 注意事项

- **`sender` 的值是 `'human'` 和 `'assistant'`**（不是 `'user'`/`'claude'`）。
- **一条消息可以同时包含 `m.text` 和 `m.content[]`。** Agent 轮次通常会将
  最终回答放在 `m.text` 中，同时在 `content[]` 中包含 `thinking`/`tool_use`/`tool_result`
  块。应先基于 `content[]` 构建内容，再合并 `m.text`——绝不要使用
  `m.text || (content…)`，因为只要设置了 `m.text`，它就会短路并丢弃所有块。
  如果某条消息渲染为空，请检查一条原始消息：
  `Object.keys(msgs[0])` 和 `msgs[0].content?.map(b => b.type)`。
- **`/share/` 载荷的结构与 `/chat/` 不同。** `name` 为 null（标题位于
  `snapshot_name` 中）；web_search 结果是 `knowledge` 项
  （`title`/`url`/`text`），而不是 `text` 项；并且 `citations` 挂载在文本
  块上。随附的渲染器能够处理这三种情况——自行编写的渲染器通常
  无法做到，这就是陷阱 4。
- **工具块上为空的 `input: {}` / `content: []` 并不是 bug**——在分享
  快照中，这是平台在隐藏分享者的私有文件内容。应明确说明这一点；
  不要将其渲染成令人费解的空操作，也不要将其计为数据丢失。
- **如果 `rendering_mode=raw` 返回空白或过短的正文，请使用
  `rendering_mode=messages` 重试。** 两者公开的字段略有不同。
- **对话中的文件同样可以下载**——包括上传文件，以及 Download 卡片背后的
  交付文件。它们分属两个端点系列，且使用不同的键（图片按 uuid；
  上传文件/输出文件则通过 `conversations/<id>/wiggle/download-file` 按**沙盒路径**获取）。
  对上传文件猜测 uuid 会返回 404，看起来像是——但其实并非——“不受支持”。
  [scripts/download_files.js](scripts/download_files.js) 会盘点对话内容，
  并通过正确的端点拉取每个文件。在尝试之前，不要断定任何文件不可用。
- **`tree=True` 会返回整棵树**，其中包括因编辑和重新生成而被放弃的分支。
  从 `current_leaf_message_uuid` 开始，通过 `parent_message_uuid` 遍历活动路径，
  以免废弃分支泄漏到转录文本中或虚增消息数量。渲染器会这样处理，并在
  缺少这些字段时回退到数组顺序（这对于单链对话是正确的，对于已经是线性结构的
  分享快照也是正确的）。
- **多个组织：** `orgs[0]` 可能不是正确的组织。如果某个对话返回
  404，请列出它们——`orgs.map(o => ({uuid: o.uuid, name: o.name}))`——并在断定
  无法访问之前，遍历各组织执行获取操作。
- **只读取——不要点击。** 此技能完全不需要操作对话 UI；
  应避免在获取过程中触发导航或对话框。
- **绝不要为了打开调试端口而重新启动用户的浏览器。** 除了通常的原因
  （这是用户的浏览器，不是你的）之外，这样做在此处还会适得其反：Chrome 只会
  在*非默认*配置文件上接受该端口，而新配置文件处于**未登录**
  状态——因此你刚刚启动的浏览器无法读取用户的任何对话。
  这相当于用你所需要的会话换取一个无用的端口。端口不可用是需要绕过的既定事实，
  而不是需要更改的设置。

完整的端点表、逐字段的响应模式、完整的导出脚本，
以及故障排除表：[references/claude-web-api-extraction.md](references/claude-web-api-extraction.md)。

## 后续步骤

写入转录文本**并下载其文件**后——步骤 4 的完成检查中输出到 `stderr` 的 `files:` 行会告诉你是否存在文件；只要该计数不为零，仅导出文本就仍未完成——建议用户进行自然的后续操作。必须由用户选择加入，绝不自动执行：

```
Got the full conversation (<N> messages, "<title>", <retention>% fidelity);
<N> files downloaded to <dir>.

Options:
A) Clean it up — run transcript-fixer if it's ASR/garbled (only if relevant)
B) Summarize / extract the decisions and action items
C) Save it to a file — tell me where
D) Nothing else — you just needed it read
```