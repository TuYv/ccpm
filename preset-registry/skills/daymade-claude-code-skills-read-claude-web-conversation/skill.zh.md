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
  claude.ai. For LOCAL Claude Code sessions use read-claude-code-history; for
  an exported .txt/.json file use claude-export-txt-better.
---
# 读取 Claude.ai Web 对话

将 Claude.ai **Web** 对话提取为完整、结构化的转录内容——包括每条消息和每次工具调用，而不只是当前屏幕上显示的内容。

已根据截至 2026 年 7 月的 Claude.ai Web API 进行验证。这些是 Claude.ai 前端调用的同一组私有 JSON 端点；它们不是有文档记录且版本稳定的公共 API，因此如果请求返回 404，请从 Network 选项卡中重新推导请求结构（参见 [references/claude-web-api-extraction.md](references/claude-web-api-extraction.md)）。

## 此 skill 与其同类 skill 的区别

根据你手头的*来源*进行选择，而不是根据“conversation”这个词：

| 来源 | 使用 |
|--------|-----|
| 一个实时的 **`claude.ai/chat/…`** 或 **`claude.ai/share/…`** URL | **此 skill** |
| 本地 Claude Code 会话（`~/.claude/projects/*.jsonl`） | `read-claude-code-history` |
| 已导出的 `.txt` / `.json` 对话文件 | `claude-export-txt-better` |

## 为什么显而易见的方法会失败（请先阅读）

有四个陷阱，**而且每一个都会静默失败**——你会得到看起来像完整导出的内容，只有在你碰巧知道对话实际有多长时，才会注意到丢失了内容。默认假设你正在被欺骗；第 4 步中的保真度检查门正是为了让这些谎言暴露出来。

1. **登录墙。** `curl` 和 `WebFetch` 不会获得身份验证重定向——它们得到的是 Cloudflare challenge 页面（HTTP 403，`Just a moment...`）。修改请求头无法解决这个问题；该页面受用户 Chrome 中会话的限制。**这里绝不要使用 curl，即使只是“检查一下”也不行。**
2. **虚拟滚动。** 即使打开了对话，`get_page_text` 和 DOM 抓取仍然只能看到当前渲染的少数几条消息——通常只有最后一条。一个包含 40 条消息的线程，返回结果可能只有 1 条。
3. **默认渲染会折叠工具调用。** API 的默认渲染会将每次工具调用都转换为“当前设备不支持”的占位符。在研究/代理对话中，工具块才是内容本身：在一个真实对话上的测量结果显示，默认渲染在设置 `render_all_tools=true` 时返回了 **9.4k 个字符，而不是 173k**——只有 5%。始终请求完整渲染。
4. **形状类似 /chat/ 的渲染器会静默丢弃 /share/ 块。** share payload 会将 web_search 命中项作为 `knowledge` 项返回，而不是 `text` 项。只了解 `text` 的渲染器会为这些项返回空字符串，且不会报告错误——同一个真实对话的渲染结果从 146k 个字符变成了 **8k（保留率为 4.8%）**，看起来却完全正常。

**可靠路径：**在用户已登录的页面内部运行 JavaScript，让 `fetch` 继承会话 cookie，然后通过保真度检查门在本地进行渲染。

## 第 0 步——选择注入通道

有三种通道可以在用户页面内部执行 JS。它们的区别只在于连接方式，而且每种通道都会以自己的方式失败，因此请按以下顺序选择并进行**验证**，不要想当然。

| 顺序 | 通道 | 使用时机 | 失败时 |
|-------|---------|----------|-----------|
| 1 | **claude-in-chrome extension** | `list_connected_browsers` 返回浏览器时 | 返回 `[]` → 扩展中的 claude.ai 登录账号与 Claude Code 账号不一致。这是**结构性问题**——重试、重新安装和 `switch_browser` 都无法解决。立即继续下一项。 |
| 2 | **CDP**（`scripts/cdp_channel.py probe`） | probe 表示 `available: true` 时——这是目前最好的通道 | 通常不可用，而这属于**正常情况，并非故障**——见下文。Probe 成本很低；相信它的结果并继续下一项。 |
| 3 | **AppleScript**（仅限 macOS） | 扩展无法配对时的现实后备方案 | 参见下面的路由陷阱——在责怪用户之前先检查这一点 |
| ✗ | **curl / WebFetch** | **绝不要使用** | Cloudflare 403。没有任何请求头可以解决这个问题。 |

**⚠️ 预期 CDP 不可用，绝不要试图强行启用它。** 从 Chrome 136
（2025 年 4 月）开始，调试端口在*默认用户数据目录*上会被*忽略*——这是针对利用 CDP 窃取 Cookie 的恶意软件而进行的刻意加固。你仍可能发现有监听中的套接字，以及磁盘上过期的 `DevToolsActivePort`，但 WebSocket 握手始终得不到响应，并且 `/json/*` 返回 404。

**而且它的可用性会反复变化。** 在 Chrome 150 上、同一台机器、同一个浏览器会话中已验证：端点先是正常工作，随后完全停止响应，然后又再次响应——期间没有重启。因此**每次都要进行探测，绝不要缓存判断结果**。CDP“五分钟前还能用”并不能证明它现在还能用，而“CDP 曾经失败过一次”也不能证明这台机器无法使用它。探测之所以成本低，正是因为你可以放心重复询问。

接下来你很容易掉进一个陷阱。网上的每个修复方案都会说“使用 `--user-data-dir=/tmp/whatever` 重新启动 Chrome”。**对于此 Skill，这不仅毫无用处，反而更糟：新建的配置文件处于未登录状态，而未登录的浏览器无法读取用户的任何一条对话。** 你需要的会话恰恰位于 Chrome 拒绝暴露的那个配置文件中。因此，进行探测、接受结果，然后回退——绝不要为了追逐某个端口而重新配置或重新启动用户的浏览器。

当 Chrome 是在非默认的 `--user-data-dir` 上**有意启动**，并且已登录 claude.ai 时，CDP **确实可以工作**。这种情况确实会发生；一旦发生，此通道就完全优于其他通道（无需切换菜单选项，不受下面 Apple Events 捕获问题的影响，可以枚举所有标签页，并将完整载荷返回到 stdout）。这就是为什么在进入后续通道之前，值得先进行一次成本低廉的探测。

**尝试通道 1** 时，在一次 ToolSearch 调用中加载扩展的工具
（这些工具是延迟加载的；该 API 路径不需要 `get_page_text` / `read_page`）：

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool
```

然后调用 `list_connected_browsers`。空列表表示账户不匹配——转到通道 2，而不是重试。

**尝试通道 2：**

```bash
uv run --with websockets python scripts/cdp_channel.py probe
```

`probe` 会同时回答三个问题：CDP 是否可用、它是否指向用户的*真实*浏览器（页面数量，以及当前是否已打开任何 claude.ai 标签页），以及是否正在运行**多个 Chrome 实例**。它的输出将决定下面的所有操作——包括 AppleScript 决策，因为只有 `chrome_instances.automation` 列表才能告诉你 Apple Events 是否确实会触达正确的浏览器。

退出代码是一份契约，因此你永远不必猜测是否应该回退：

| code | 含义 | 应采取的操作 |
|------|---------|-----------|
| 0 | 成功 | 继续 |
| 1 | 输入错误（无法读取 `--js` 等） | 修正调用 |
| 2 | `TAB_NOT_FOUND` | 使用 `open`，或请求用户打开页面 |
| **3** | **CDP 不可用** | **回退到其他通道——这是正常结果** |
| 4 | 浏览器返回错误 | 命令有误，或标签页在调用过程中消失；回退不会有帮助 |

Exit 3 仍然会输出 `chrome_instances`，因为这一部分不需要调试端口。  
这是路由事实，而不是错误：读取它，继续进入通道 3，不要向用户提及调试端口。

### AppleScript 路由陷阱（在责怪用户之前请先阅读）

AppleScript 通过 *bundle id* 定位 Chrome。如果正在运行第二个 Chrome 实例——chrome-devtools-mcp、puppeteer、playwright，或任何使用其自身 `--user-data-dir` 启动的实例——Apple Events 可能会转而落到**那个**实例上，而 macOS 没有办法让你按 pid 定位第一个实例。没有解决办法。

真正危险的是它呈现出来的样子：自动化配置文件关闭了“允许来自 Apple Events 的 JavaScript”，因此你的 JS 尝试会失败，并显示 **"Executing JavaScript through AppleScript is turned off"** ——然后你会得出结论，认为用户忘记打开某个菜单开关，接着让他们去打开它，而实际上他们真正使用的浏览器从始至终都是启用状态。确实观察到过这种情况：AppleScript 报告 `windows=1 tabs=1`，而用户实际的 Chrome 中打开了 35 个标签页。

因此，在回退到 AppleScript 之前，运行 `probe`（或从 `cdp_channel.py` 调用 `chrome_instances()`）并读取 `automation` 列表。如果它不为空，就直白地说明——*“有一个自动化 Chrome 正在占用 Apple Events 路由，因此 AppleScript 会命中错误的浏览器”*——然后使用 CDP，或者询问是否可以关闭该实例。不要转述一个你无法归因的开关错误。

通道详情和 base64 二进制桥接：[references/applescript_fallback_channel.md](references/applescript_fallback_channel.md)。

## 步骤 1——识别账户情况（这决定了你究竟能获取什么）

**你能获取多少对话内容，取决于浏览器登录的是哪个账户。**尽早确认这一点——这决定了你拿到的是完整存档，还是存在无法恢复的缺失部分；用户有权在你交付之前知道他们将获得哪一种结果。

| 情况 | 信号 | 你能获取的内容 |
|------|--------|------------------|
| **A · 未登录** | `/api/organizations` 未返回任何组织 | 对于 `/chat/` 链接，什么也获取不到。停止操作，并要求用户在 Chrome 中登录 claude.ai——绝不要自动执行登录。 |
| **B · 已登录，且对话属于此账户** | `GET .../chat_conversations/<conversation-id>` 返回 200 | **全部内容**，包括已上传附件的内容。只要此路径可用，就优先使用它。 |
| **C · 已登录，但这是他人的分享链接** | 对话获取请求返回 404；快照中的 `creator` ≠ 此账户 | 仅能获取快照。**平台会移除每个涉及分享者上传内容的工具调用的参数和结果。**无法从该链接恢复。 |

对于 `/share/…` 链接，快照载荷本身会告诉你属于哪种情况：其中包含 `conversation_uuid`（原始对话的 UUID）和 `creator`。因此先获取快照，然后使用该 `conversation_uuid` **尝试获取原始对话**——如果返回 200，说明属于情况 B，应从那里重新导出，因为快照的内容损失严格更多。如果返回 404，则属于情况 C：明确说出来，并让渲染步骤在对话记录标题中披露缺失部分（它会自动完成这件事）。

Case C 的这些缺口确实存在，而且值得准确命名，因为它们看起来像是导出功能中的 bug，实际上并不是：上传文件的 `view` 会保留文件名，但会丢失其 `path` 以及文件的全部内容。用户自己的文件副本通常就在他们的磁盘上——导出并没有损坏，只是无法替一个平台拒绝分享的文件发声。

## 第 2 步 — 打开对话

扩展：使用 `{ "createIfEmpty": true }` 调用 `tabs_context_mcp`，然后执行 `navigate`。  
CDP：`cdp_channel.py open --url <url>`（复用现有标签页；等待 Cloudflare 中间页结束，浏览器会自行清除该页面）。

无论采用哪种方式，都要确认页面确实已加载并且已登录——标签页标题应当是对话的名称，而不是“Log in”。如果进入登录页面，请停止并告知用户；不要自动执行登录。

## 第 3 步 — 获取负载

**始终请求完整的工具渲染结果。** 如果没有使用 `render_all_tools=true`，分析内容所在的位置会变成占位符（上文陷阱 3）。

| 链接类型 | 端点 |
|-----------|----------|
| `/chat/<conversation-id>` | `GET /api/organizations/<org-uuid>/chat_conversations/<conversation-id>?tree=True&rendering_mode=messages&render_all_tools=true` |
| `/share/<snapshot-id>` | `GET /api/chat_snapshots/<snapshot-id>?rendering_mode=messages&render_all_tools=true` |

请注意，分享端点使用的是 URL 中的 **快照 ID**，而不是对话 ID——将快照 ID 传给 `chat_conversations` 会返回 404；这个 404 表示“ID 错误”，而不是“你无权访问”。两类 ID 都是不透明的；始终从已打开的 URL 中推导它们，不要硬编码。

- **扩展通道** → 在页面中运行 [scripts/export_conversation.js](scripts/export_conversation.js)（其文件头中有触发并轮询的说明），然后通过约 16k 大小的 `.slice()` 窗口分页读取 `window.__claudeExport.rawJson`。
- **CDP 通道** → 运行 [scripts/fetch_cdp.js](scripts/fetch_cdp.js)，它会直接以 Promise 的形式返回完整的对话 JSON，因此 `cdp_channel.py eval` 可以在一次调用中解析该 Promise，并将结果流式写入文件：
  ```bash
  uv run --with websockets python scripts/cdp_channel.py eval \
      --match <conversation-or-snapshot-id> --js scripts/fetch_cdp.js --out conversation.json
  ```
  `awaitPromise` 会在一次调用中解析异步 fetch，返回值会通过 stdout 输出，因此多兆字节的负载无需跨越上下文窗口。
- **AppleScript 通道** → 通过 [scripts/runjs.applescript](scripts/runjs.applescript) 运行 [scripts/export_conversation.js](scripts/export_conversation.js)，然后轮询并读出 `window.__claudeExport.rawJson`（触发并轮询；请参阅通道参考）。

对于没有工具调用的普通聊天，如果你只需要立即获取文本，[references/claude-web-api-extraction.md](references/claude-web-api-extraction.md) 中的内联代码片段可以在页面内通过一次调用组装出对话记录。

## 第 4 步 — 通过保真度门禁在本地渲染

```bash
uv run python scripts/render_transcript.py conversation.json -o transcript.md \
    --source-url <url>
```

这同时处理两种 payload 形状（`/chat/` 和 `/share/`），渲染每一次工具
调用，将工具输出折叠到 `<details>` 中，并将 web_search 引用收集到
“引用来源”列表中。

**它还拒绝写入有损的 transcript。** 在输出任何内容之前，它会审计每个
块——*这个块携带了 N 个字符；渲染器是否为它输出了任何内容？*——如果某个
块携带文本却没有产生任何输出，就以 **2** 退出。这就是 trap-4 失败；没有这项
检查时它是不可见的：markdown 看起来很干净，退出代码为 0，但对话的 95% 已经
丢失。
预算基于原始 payload 计算，明确**不**经过渲染路径，因为让 gate 询问解析器
“有多少内容需要渲染”，只会确认解析器自身的盲点。

如果失败，它会指出有问题的块以及用于检查它的命令：为新的形状补充
`result_item_text()`/`render_block()` 的处理。只有在你有意识地决定可以接受
损失时，才应使用 `--allow-lossy`——这几乎从来不是正确答案，而且绝不是正确的
*第一*答案。

由**平台**清空的块（情况 C）会单独计为已披露的缺口，绝不会计为损失，并会在
transcript 标题中声明。一次干净的运行会打印自己的统计信息：

```
fidelity: 143,088/143,088 chars rendered (100.0%)
known gap: 12 tool blocks were emptied by the platform (view) — disclosed in the
           transcript header, NOT recoverable from a shared link
```

该 gate 按**条目**而不是按块进行审计——条目才是内容实际发生丢失的粒度，而按
块检查会在其中*任何*部分输出时，就将整个块计为已渲染，因此一个消失的
38k 字符条目会藏在一个 16 字符的兄弟条目之后，并得到 100% 的分数。它还涵盖
了 `content[]`-only 审计在结构上无法看到的内容：消息级的**附件正文**（粘贴的
文档位于那里，而不是某个块中）、顶层的 `text`，以及 active-path 遍历从未到达
的消息。而且，一个里面什么都没有的 payload 得分为 **0%，而不是 100%**——空
fetch 正是该 gate 所要防止的损失的极限情况。

**如果你修改了渲染器，请运行回归测试套件。** 其中的每个案例都是曾经欺骗过
旧版本 gate 的一种形状：

```bash
uv run python scripts/selftest_fidelity.py
```

### 输出格式和导航（`--toc`）

默认输出格式为 **Obsidian**，因为 Obsidian 的 Live Preview 不会渲染 HTML
`<details>`，否则可折叠的工具输出、思考内容和文件正文会以扁平的噪声形式出现。
默认情况下，它会将每个 `<details>` 块重写为原生的
`> [!info]-` 可折叠 callout：

```bash
uv run python scripts/render_transcript.py conversation.json -o transcript.md \
    --source-url <url> --toc
```

如果需要旧版的 HTML `<details>` 输出，请使用 `--format markdown`。

只有在 `<details>` markdown 通过 fidelity gate 之后，才会运行转换——这是一个
不会触碰任何 payload 字符串的外观后处理，因此绝不会影响保留证明（不要将它移到
gate 之前）。`--toc` 会添加带链接的目录，并插入每条消息的锚点
（`<a id="turn-N">`），以便浏览较长的对话。`--extract-file` 的输出绝不会被
重新格式化。

其他模式保持不变：`--list-files` 会列出每个可下载文件及其所需的端点系列；`--extract-file <sandbox-path>` 会通过重放其 `create_file` 以及之后的每个 `str_replace` 来重建沙盒创建的文件；如果缺少替换或替换存在歧义，它会拒绝输出任何内容，而不是返回过时的内容。

### 完成检查 — 仍有文件时，渲染尚未完成

`render_transcript.py` 写入转录内容时，会向 stderr 打印两行信息。
在声明渲染完成之前，请读取这两行：

```
fidelity: 143,088/143,088 chars rendered (100.0%) across 7 message(s)
files: 2 downloadable file(s) in this conversation — the transcript names them but does NOT carry the bytes, so a text-only export is an INCOMPLETE archive. ...
```

`fidelity:` 行是保留完整性的证明。`files:` 行是**完成信号**：如果它报告存在任何文件，转录内容会按名称引用这些文件，但不包含其字节数据——纯文本导出是不完整的归档。之所以让这一行与 `fidelity:` 位于同一个 stderr 流中，是因为否则完成驱动程序会看到 `100%` 后停止，文件还没被拉取，这正是文本导出被误认为完整归档的原因。（完全没有 `files:` 行意味着该对话不包含可下载文件；此时渲染本身确实已经完成。）

**因此，当 `files:` 报告 N > 0 时，下载这些文件是此步骤的一部分，而不是可选的后续操作。** 用户说“archive / export / 拉到本地”时，要求的是完整归档；在转录内容引用的文件尚未下载时就把转录交给用户，交付的是不完整的归档。（`--list-files` / `--extract-file` 从不打印此通知——它们会在进入渲染分支之前返回。）

使用 [scripts/download_files.js](scripts/download_files.js) 通过正确的端点系列列出并拉取每个上传文件、助手生成的图像和沙盒交付文件。该脚本与通道无关，是 JavaScript 脚本；请通过获取内容时使用的同一通道运行它。CDP（一次调用，结果输出到 stdout）：

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

AppleScript 通道——当 CDP 不可用时的现实备用方案（Step 0 说明在默认配置文件上通常会忽略 CDP），因此这里也提供一个完整的示例，而不仅仅是指向替代方案的说明：
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
Extension 通道：通过 `javascript_tool` 运行脚本主体，并像处理其他大型返回值一样，将 `window.__dl` 的内容按约 16k 的分片分页取出。

使用 `file <name>` 验证每个文件（magic bytes — 应为 `PNG image data`、`Microsoft Excel 2007+`，而不是 `ASCII text`），并将其字节大小与对话 JSON 中的元数据进行比较（上传文件使用 `files[].size_bytes`；交付文件使用 `download_files.js` 的状态行）。将下载文件保存到 transcript 旁边——通常使用同级的 `<transcript-basename>_附件/` 目录——并将 transcript 中的图像引用重新指向本地副本。

## 步骤 5 — 分页（仅限扩展通道）

`javascript_tool` 会截断较大的返回值。先获取 `chars` 计数，然后重新运行以返回后续窗口——保持提取内容完全一致，只更改最后的表达式：

```js
transcript.slice(14000, 32000);   // then (32000, 50000) … until you've covered `chars`
```

建议使用约 14–18k 的窗口；更大的窗口可能会再次触及限制。**CDP 和 AppleScript 通道不需要任何这些操作**——它们会将整个负载返回到 stdout，这也是在进行大型归档导出时优先选择它们的一个充分理由。

## 易错点

- **`sender` 的值是 `'human'` 和 `'assistant'`**（不是 `'user'`/`'claude'`）。
- **一条消息可以同时具有 `m.text` 和 `m.content[]`。** Agent 回合通常会在 `m.text` 中携带最终答案，同时在 `content[]` 中携带 `thinking`/`tool_use`/`tool_result` 块。应先从 `content[]` 构建，再合并 `m.text`——绝不要使用 `m.text || (content…)`，因为只要设置了 `m.text`，这种写法就会短路并丢弃所有块。如果某条消息渲染为空，请检查一条原始消息：
  `Object.keys(msgs[0])` 和 `msgs[0].content?.map(b => b.type)`。
- **`/share/` 负载的结构与 `/chat/` 不同。** `name` 为 null（标题位于 `snapshot_name` 中）；web_search 结果是 `knowledge` 项（`title`/`url`/`text`），而不是 `text` 项；并且 `citations` 挂载在文本块上。内置渲染器可以处理这三种情况——手写的渲染器通常无法处理，这就是陷阱 4。
- **工具块中为空的 `input: {}` / `content: []` 并不是错误**——在共享快照中，这是平台不提供共享者私有文件内容的表现。应说明这一点；不要将其渲染成神秘的无操作，也不要将其计为数据丢失。
- **如果 `rendering_mode=raw` 返回的正文为空或过短，请使用 `rendering_mode=messages` 重试。** 两者会公开略有不同的字段。
- **对话中的文件同样可以下载**——包括上传文件，以及 Download 卡片背后的交付文件。这里有两组端点族，所依据的键不同（图像使用 uuid；上传文件/输出文件通过 **sandbox 路径**使用 `conversations/<id>/wiggle/download-file`）。使用 uuid 猜测上传文件会得到 404，这看起来像是——但实际上并不是——“unsupported”。[scripts/download_files.js](scripts/download_files.js) 会清点对话中的文件，并通过正确的端点逐一获取。在尝试之前，不要断定任何内容不可用。
- **`tree=True` 会返回整个树**，包括因编辑和重新生成而放弃的分支。应通过 `parent_message_uuid`，从 `current_leaf_message_uuid` 开始沿活动路径遍历，这样死分支就不会泄漏到 transcript 中，也不会增加消息计数。渲染器会执行此操作；如果缺少这些字段，则回退到数组顺序（对于单链对话以及已经是线性的共享快照，这是正确的）。
- **多个组织：** `orgs[0]` 可能不是正确的组织。如果某个对话返回 404，请列出组织——`orgs.map(o => ({uuid: o.uuid, name: o.name}))`——并在得出其无法访问的结论前，遍历所有组织执行获取操作。
- **只读取——不要点击。** 此技能不需要接触对话 UI；避免在获取过程中触发导航或对话框。
- **绝不要重新启动用户的浏览器来打开调试端口。** 除了通常的原因（那是他们的浏览器，不是你的浏览器）之外，在这里这样做适得其反：Chrome 只会在**非默认**配置文件上使用该端口，而新的配置文件是**未登录**的——因此你刚启动的浏览器无法读取他们的任何对话。你会用所需的会话换取一个无法使用的端口。端口不可用是一个需要变通处理的事实，而不是需要更改的设置。

完整的端点表、逐字段响应架构、完整的导出脚本，以及故障排查表：[references/claude-web-api-extraction.md](references/claude-web-api-extraction.md)。

## 下一步

一旦转录内容已写入**并且其文件已下载**——第 4 步的完成检查中的 `files:` stderr 行会告诉你是否存在文件；只要该计数不为零，纯文本导出就仍然是不完整的——建议采取自然的后续操作。仅在用户选择后执行，绝不自动执行：

```
Got the full conversation (<N> messages, "<title>", <retention>% fidelity);
<N> files downloaded to <dir>.

Options:
A) Clean it up — run transcript-fixer if it's ASR/garbled (only if relevant)
B) Summarize / extract the decisions and action items
C) Save it to a file — tell me where
D) Nothing else — you just needed it read
```