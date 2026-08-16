---
name: feishu-doc-scraper
description: Extract Feishu (Lark) Docs, Wiki pages/collections, spreadsheets, and Minutes (妙记) transcripts into faithful local Markdown via the lark-cli API (no LLM rewriting of the body; browser-DOM fallback when lark-cli can't reach the content). Use whenever the source is a Feishu/Lark URL and fidelity matters — 导出飞书文档/合集/妙记转写, 把飞书 wiki/知识库转 markdown, archiving a Feishu collection, exporting a 妙记 transcript, or saving a Feishu page — even if the user only says clipping, archiving, converting, or "save this". Also covers the owner-exported .docx → faithful Markdown path.
compatibility: Primary path needs the `lark-cli` binary (npm `@larksuite/cli`; verified 1.0.32, 2026-05, and re-verified 1.0.80, 2026-08 — the `.data.markdown` field is null on 1.0.80 and the pandoc/`source.html` path in step 3 is load-bearing there) authenticated to the target tenant. Fallback path needs a browser automation surface with an authenticated session (Chrome DevTools MCP / Browser Use / Computer Use). docx path needs `python-docx` and a docx→md converter (the bundled doc-to-markdown skill or pandoc).
argument-hint: "[feishu-url-or-output-path]"
---
# 飞书文档抓取器

将飞书/Lark 来源提取为忠实的本地 Markdown。**优先使用 lark-cli API**——它以编程方式提取正文（不会由模型进行改写），会沿着集合的引用图递归处理，并根据错误码判断权限边界，而不是靠猜测。应将浏览器渲染页面视为*后备方案*，而非事实来源：在实际的集合抓取工作中，API 路径始终能够完成全部任务，而浏览器路径从未有使用的必要。

## 范围（请先阅读）

本技能的职责是提供**忠实对应每个来源的 Markdown，以及所提取内容的记录**。它*不*决定如何命名生成的文件、如何建立索引、如何与现有笔记去重，或如何将其组织进知识库——这些属于宿主 PKM / 用户自己的约定。止步于忠实提取，可以让本技能保持正交性和可复用性。当用户希望将输出归档到知识库时，应先完成提取，再将干净的 Markdown 交给其组织工作流。

## 选择路径

```
Is the source a Feishu/Lark URL (wiki / docx / sheets / minutes / base)?
├── YES → is lark-cli installed and authenticated to that tenant?
│        ├── YES → PATH A: lark-cli API extraction  (primary — start here)
│        │         └── hit code 131006 / 99991679 (permission denied)?
│        │              └── PATH B: owner-exported .docx → faithful Markdown
│        └── NO  → install/auth lark-cli first (it is worth it); only if
│                  truly impossible → PATH D: browser DOM fallback
├── the URL is a Minutes / 妙记 link, or a doc references one → PATH C: Minutes transcript
└── you were handed an exported .docx (not a URL) → PATH B
```

⚠️ **`base`（多维表格）实际上尚未在路径 A 中实现可操作化**——提取器只会记录令牌（`DISPATCH["url-base"]`：*"Bitable API (outside this skill) — record token"*），并且下方的步骤 2 中没有对应项。此处将其列出，只是为了完整说明飞书 URL 可能包含的类型，并非声称路径 A 能够端到端提取多维表格内容。

集合/中心只是正文中引用了其他文档的 docx——**路径 A 会通过递归遍历引用图来处理它**，而不是在浏览器中逐页访问。

## 路径 A——lark-cli API 提取（主要路径）

完整的命令目录、递归引擎、跨租户及个人空间注意事项：**[references/lark-cli-api-extraction.md](references/lark-cli-api-extraction.md)**。以下是常见场景下的要点：

**1. 为飞书中国大陆域名禁用代理。** 飞书的 `*.feishu.cn` 端点在中国大陆应直接连接；通过本地代理路由这些端点会导致凭据经代理泄露，并遭遇 DNS 劫持。lark-cli 本身也会对此发出警告。请始终执行：

```bash
export LARK_CLI_NO_PROXY=1
```

这与任何“Claude/Anthropic 域名必须使用代理”的规则并不冲突——飞书使用的是不同的主机，应直接连接。

**2. 对 URL 进行分类，然后将其解析为可获取的文档令牌。**

- `…/wiki/<node_token>`——wiki 节点令牌**不是**文档令牌。请先解析：
  ```bash
  lark-cli wiki spaces get_node --params '{"token":"<node_token>"}'
  # → .data.node.obj_token  and  .data.node.obj_type  (e.g. "docx")
  ```
- `…/docx/<doc_token>`——已经是文档令牌，可直接获取。
- `…/sheets/<token>`——电子表格，请使用 sheets 命令（参见参考文档）。
- `…/minutes/<token>`——妙记，请转到**路径 C**。

**3. 以编程方式获取正文——绝不要通过模型获取。** body 字段在不同 lark-cli 版本中的位置有所变化，因此应同时探测这两个位置，而不是硬编码其中一个（这样无论安装的是哪个版本都能正常工作）：

```bash
lark-cli docs +fetch --doc <obj_token> --format json > /tmp/fetch.json 2> /tmp/fetch.err
# ≤1.0.32: clean Markdown in .data.markdown.
# 1.0.55: body moved to .data.document.content as HTML (.data.markdown is null).
if jq -e -r '.data.markdown // empty' /tmp/fetch.json > "<sanitized-title>.md" && [ -s "<sanitized-title>.md" ]; then
  : # got clean Markdown directly
else
  jq -r '.data.document.content' /tmp/fetch.json > "<sanitized-title>.html"
  pandoc -f html -t gfm "<sanitized-title>.html" > "<sanitized-title>.md"
fi
```

⚠️ **每个文档都必须使用不同的 `<sanitized-title>` 名称，绝不能在多次获取时重复使用字面字符串 "source"。** 下面的第 4 步会把多个文档（先是中心文档，然后是它引用的每个子文档）获取到同一个工作目录中——如果用硬编码的 `source.md`/`source.html` 将上述代码片段原样运行两次，第二次获取就会在你有机会检查第一个文档之前，悄无声息地覆盖它已保存的正文。本节其余部分仍会使用 "`source.html`"/"`source.md`" 作为简写，表示*你当前正在查看的那个文档自身保存的文件*——而不是整个文档集合共用的同一个文件名。

⚠️ **在这个 pandoc 分支中，`pandoc -f html -t gfm` 会悄无声息地剥除飞书的多种自定义嵌入标签——已于 2026-08-16/17 使用真实文档验证，而且检查得越深入，损失越严重：**
- **whiteboard**（`<whiteboard token="…">`，一种内联图表块）会消失得无影无踪。已在真实文档上确认：`.data.document.content` 中有 3 个原始标签 → 经 pandoc 转换后的 `source.md` 中完全没有痕迹（`grep -c whiteboard` 在原始 HTML 中找到 3 处匹配，在转换后的 Markdown 中为 0）。
- **mention-doc**——其真实的原始标签是 `<cite doc-id="…" file-type="wiki|docx" title="…" type="doc"></cite>`，而不是此 skill 最初假定的 `<mention-doc token="…" type="…">Title</mention-doc>` 形式——同样会消失得无影无踪，而且损失不只是 token/type：标题位于 `title="…"` 属性中，标签主体为空，因此 pandoc 会丢弃整个元素，甚至连纯标题文本也不会保留。
- **sheet** 尚未得到任何方向的确认（没有找到包含真实 sheet 引用的文档可供测试）——在证实不会消失之前，应将其视为同样可能悄无声息地消失。
- **image**——其真实的原始标签是标准的 `<img src="<drive-token>" alt="…" …>`，而不是 `<image token="…">`——**不会**消失：pandoc 会基本完整地透传原始 `<img>` 元素（`src`/`id`/`href`/`width`/`height`/`alt` 会保留；`name=` 会被丢弃；`mime=`/`scale=` 会被重命名为 `data-mime=`/`data-scale=`）。
- **lark-table** 其实根本不是普通 docx 表格所使用的真实标签——它们使用纯 `<table>` HTML，而 pandoc 通常能够完整转换它们（对于只含单段落的单元格，会转换为整洁的 GFM 管道表格语法；对于包含多段落的单元格，则会转换为原始 `<table>` HTML 块）——不属于这种静默丢失类别。

由于这种丢失确实存在且取决于类型，**只要走了这个 pandoc 分支，提取（第 4 步）和残留标签检查（第 5 步）就必须对 `source.html` 执行，绝不能对 `source.md` 执行。** 在 `.data.markdown` 分支（≤1.0.32）上，如果它仍然能够被触发，标签会直接以字面文本形式保留在 `source.md` 中，因此在那里检查 `source.md` 仍然是正确的——此注意事项仅针对 pandoc 回退路径，而它是**当前的默认路径**：在检查过的每一份真实文档中（11/11——其中包括当前安装的 lark-cli 1.0.80 上的 3/3 次全新抓取，以及 2026-07-25 归档的 8/8 次抓取），`.data.markdown` 都是 `null`，因此尚未确认旧分支能否在任何当前的 lark-cli 构建版本上触发。

`--format markdown` **不是**有效值（lark-cli 会发出警告并回退到 json）。请将 stdout 和 stderr 分开——一条无害的 `[deprecated]` 行会写入 stderr，而在实践中，同时使用管道 `2>/dev/null` 和 `jq` 会产生错误的 `Exit code 5`。正文必须通过 `jq`/`pandoc` 写入磁盘，绝不能由模型重新输入或总结——改写会悄无声息地破坏源文本，这是最重要的保真规则。（pandoc 只会将 HTML 结构重新渲染为 Markdown；它不会改写正文——上述标签剥离属于结构性丢失，而不是正文保真度问题，因此 source.html 必须保留在磁盘上，并继续作为富媒体引用的权威来源。）

**4. 如果它是集合/中心页，请沿引用图进行遍历（BFS）。** 中心页正文包含 `<mention-doc>`（实际原始标签：`<cite doc-id="…">`）、`<sheet>`、`<image>`（实际原始标签：`<img src="…">`）标签、`<whiteboard token="…">` 块，以及跨租户 / Minutes / Tencent-Meeting URL。提取每个引用，按类型分派、抓取，并**对每个新抓取的文档重复此过程，直到不再出现新引用**（叶节点）——**但 `whiteboard` 除外，它绝不能被抓取或递归处理**：它是内联视觉内容，而不是指向另一份文档的链接（请参阅下面的专门说明）。使用随附的提取器，确保不会悄无声息地遗漏任何内容（遗漏一个引用 = 缺少一份文档，这是中心页抓取失败的首要原因）：

```bash
python3 scripts/feishu_extract_refs.py "<sanitized-title>.html"   # → JSON list of {type, ref, title, dispatch}
```

对每个抓取到的文档运行一次——先处理根文档，再处理每个新抓取的子文档——并使用该文档自己的 `<sanitized-title>.html`（请参阅第 3 步中的命名注意事项）。提取器只是执行普通的正则表达式扫描——对于给定文档，它既能处理 `.html`，也能处理 `.md`，因为它只检查文件文本中是否包含这些标签——但**当两者都存在时，应信任 `.html`**；仅当该文档从未保存过 `.html` 时（即 `.data.markdown` 分支，请参阅第 3 步），才回退到 `.md`。递归循环、分派表以及跨租户/`my.feishu.cn` 个人空间规则均位于参考资料中。

**白板块不是可跟踪的引用——请就地导出并阅读它们。** `whiteboard token="…"` 标签是飞书的原生图表/流程图块，内联在当前文档中——它不是指向另一份文档的指针，因此不要尝试像处理 `mention-doc`/`sheet` 那样递归/抓取它。必须以视觉方式理解它：仅根据原始节点坐标/文本片段列表，无法可靠还原流程图的含义。请导出预览图像并实际查看它：

```bash
lark-cli whiteboard +export --whiteboard-token <token> --output-type preview --output <path>.jpg --overwrite
```

然后对生成的 `.jpg` 使用 Read 工具，以查看图表的实际内容。还可以使用 `--output-type raw`（结构化节点 JSON——适合用于交叉检查/构建可搜索索引，但不能替代查看渲染后的图像）；此外也存在 `svg` 和 `source` 输出类型。输出路径必须使用与命令实际生成格式相匹配的真实图像扩展名（如果真实格式是 `.jpg`，但你指定了 `.png`，命令就会报错——请让扩展名与命令报告的格式一致，或按照其自身的 `--help` 省略扩展名）。这一点非常重要，因为图表经常包含文档纯文本部分中没有、但会影响决策的内容——例如，泳道图/流程图可能包含各个角色对应的步骤以及具体的数值阈值，而这些内容在文档其他地方完全没有出现。如果不打开这些块，却将文档视为“已完整提取”，就会悄无声息地丢弃最有可能承载其实际运行逻辑的内容。

**5. 最终残留标签检查（验收门槛——对每一份已获取的文档都执行此检查，而不仅仅是文档集合）。** 即使是没有跨文档引用的单个独立文档，也仍然需要执行此检查：内联 `whiteboard` 或未解析的引用标签可能在完全不涉及其他文档的情况下出现（2026-08-16 的一次真实单文档提取中正是如此——没有中心文档，没有递归，只有 3 个未读取的白板）。每个富媒体引用都必须已经解析并渲染。请对整个工作目录递归执行此检查，而不是只检查单个文件——文档集合中的每份文档都有一对 `<sanitized-title>.html`/`.md` 文件（第 3 步），而由 pandoc 转换得到的 `.md` 本身可能报告为“干净”，即使真实标签已被悄无声息地丢弃（参见第 3 步的特别说明），因此扫描必须覆盖磁盘上的每一个 `.html`：

```bash
grep -rlE '<(lark-table|lark-tr|sheet token=|mention-doc|cite doc-id=|whiteboard token=|view type=)' . \
  && echo "UNRESOLVED — keep recursing" || echo "clean"
```

该模式中的 `lark-tr` 和 `view type=` 是预先存在、但尚未通过真实 HTML 验证的术语——与其他五项不同，它们在 `feishu_extract_refs.py` 中没有对应的正则表达式，也没有分发条目，因此这里若出现匹配，应将其视为“停止并手动检查原始标签”，而不是认为提取器已经能够理解它。

⚠️ **对于每份文档保存下来的 `.html`，“为空”并不是字面意义上的停止条件——应将每个匹配项视为工作清单项，而不是循环执行失败。** 每个 `<sanitized-title>.html` 都是对*该*文档的不可变原始捕获（该技能在获取文档后，不会原地重写文档自身的文件——参见第 3 步中关于按文档命名的注意事项），因此，如果一个父文档确实引用了 N 份其他文档或 M 个图表，即使所有这些引用都已得到正确处理，其自身文件中仍会永久显示 N+M 个匹配项——对于真实的中心文档，如果执意让此 grep 在整个目录中的结果字面归零，流程将永远无法终止。正确做法是针对每个匹配项，验证对应产物是否存在于磁盘上：当引用的子文档已实际获取并保存时（将第 3 步应用于该子文档），`mention-doc`/`cite doc-id=`/`sheet` 匹配项即视为已解析；当其预览 `.jpg` 已导出并通过 Read 查看时（第 4 步），`whiteboard` 匹配项即视为已解析——**绝不能**通过获取另一份文档来解析它，因为它不是可跟随的引用。只有当每个匹配项都能对应到经过验证的磁盘产物时，才停止处理。（在 `.data.markdown` 回退分支中，获取到的正文就是作为交付物的 Markdown，而非不可变的原始捕获，此时字面意义上的空结果仍是更简单的信号——但在当前任何 `lark-cli` 构建版本中，都尚未确认该分支可以触达，参见第 3 步。）

## 路径 B — 权限被拒绝 → 由所有者导出的 .docx

`lark-cli wiki spaces get_node` 返回 `code 131006 … node permission denied, user needs read permission`（或 fetch 返回该错误）代表一道**飞书侧的硬性边界**。lark-cli、匿名 curl 和浏览器都无法突破它——这一点已经过详尽验证；不要浪费时间尝试绕过。唯一正确的做法是：请权限持有者将文档导出为 `.docx`，通过其他渠道发送回来，然后进行高保真转换（还原 font-size→heading 和 `w:shd`→highlight，再进行视觉验证）。完整流程：**[references/docx-export-to-markdown.md](references/docx-export-to-markdown.md)**。

## 路径 C — 飞书妙记转录文本

`lark-cli minutes` 只返回元数据，并且可以下载音频/视频——它**无法**导出文本转录。转录文本来自一个通过 `lark-cli api` 调用的原生端点，并且需要通过设备流登录授予额外 scope。平台原生 AI 转录远优于下载媒体后重新运行 ASR——绝不要采用后者。端点、scope 名称、设备流超时陷阱，以及按单个妙记（而非按租户）生效的权限行为：**[references/feishu-minutes-transcript.md](references/feishu-minutes-transcript.md)**。

## 路径 D — 浏览器 DOM 兜底方案（最后手段）

仅当 lark-cli 确实无法访问内容时使用（无法安装，并且文档没有权限壁垒）。这是旧的虚拟滚动 / TOC 驱动的 DOM 抓取工作流。它速度较慢，依赖已连接的浏览器界面（浏览器内扩展经常连接失败），而匿名调试 Chrome 只能告诉你页面是否可被*公开*访问——它无法读取登录后才能访问的内容。工作流：**[references/browser-dom-fallback.md](references/browser-dom-fallback.md)**。经过实战检验的 DOM 规则（虚拟滚动、`data-block-id` 排序、表格/项目符号提取、图片流）：**[references/browser-failure-rules.md](references/browser-failure-rules.md)**。

## 硬性规则

以下规则一旦违反，就会在不易察觉的情况下毁掉输出。每条规则都有其原因——请遵循其背后的原因，而不只是字面要求。

- **绝不要让文档正文经过模型。** 使用 `jq`/`cat`/脚本直接提取到磁盘。模型对源文本的改写之后无法被发现，并会破坏保真度。这正是路径 A 在结构上优于浏览器路径的原因。
- **对于 `*.feishu.cn`，设置 `export LARK_CLI_NO_PROXY=1`。** 否则，凭据会经过本地代理传输，并且 DNS 会被劫持。
- **转录文本必须来自平台的原生转录，绝不能重新运行 ASR。** 下载媒体并再次转录会损失说话人标签、时间戳和准确性。
- **生成的 docx Markdown 在与源文档完成*视觉*核验之前，都不能算完成**（渲染为图片并阅读）。飞书导出的 docx 使用字号+粗体表示标题，而不是 Word 标题样式，因此即使“无错误，字数匹配”的检查通过，整个标题层级仍可能在不易察觉的情况下被扁平化。文本级检查无法发现这一问题。
- **不要死磕 docx 内嵌图片的下载。** lark-cli（截至 1.0.32）无法从 docx 下载 `<image>` token——这一点已经过详尽验证。登记图片 token，并注明“需要文档所有者右键 → 保存”；文本才是价值所在，图片是已跟踪的缺口。
- **在 pandoc 兜底路径中，必须对每个文档自身的 `.html` 运行富媒体标签验证，绝不能针对其 `.md`；并且每个文档都需要使用自己的文件名，不能共用字面量 `source.html`。** `pandoc -f html -t gfm` 会悄无声息地移除飞书的自定义嵌入标签——已在真实文档上验证：`.data.document.content` 中的 3 个原始 `whiteboard token="…"` 标签在转换后的 `.md` 中没有留下任何痕迹（2026-08-16）。在这条路径上，如果只检查 `.md` 中是否残留标签，即使内容已被悄无声息地丢弃，也总会报告“干净”；如果在一个 hub 的多次 fetch（步骤 3）中重复使用同一个硬编码文件名，还会导致后续文档在早先文档的原始抓取结果尚未接受检查之前，悄无声息地将其覆盖。
- **匿名 curl 返回 HTTP 200 ≠ 可访问。** 飞书登录墙会返回 200，但响应正文包含 `accounts.feishu.cn` / `login` / `passport` / 空的 `<title>`。请检查响应正文，绝不要根据状态码推断“公开”。
- **搜索 agent 报告文件“未找到”并不具有权威性。** 在得出结论之前，应根据权威来源进行验证（这是通用的推断纪律；在定位已摄取内容现存位置时尤为相关）。
- **对每个生成的文件执行 U+FFFD 最终检查：** `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 的结果必须为空。出现替换字符意味着某个编码步骤破坏了文本。

## 验收契约

仅当所有适用条件均满足时才停止：

- 每个获取到的正文都通过 `jq`/脚本写入磁盘，而不是由模型重新输入。
- **每个获取到的文档——无论是单独文档还是文档集合**：富媒体标签残留检查（路径 A 第 5 步，在整个工作目录中递归运行）中的每个命中项，都对应一个经过验证的磁盘制品——每个 `mention-doc`/`cite doc-id=`/`sheet`/跨租户引用都已被**跟进**到获取完成的叶子文件，每个 `whiteboard` 引用都已被**导出并阅读**（而不是跟进——白板是内联视觉内容，绝不是可递归进入的链接）。这并非仅针对文档集合的检查：独立文档也可能包含一个未解析的 `whiteboard`，而不涉及任何其他文档。每个文档自身的 `.html` 永远保留并显示其标签是合理的（它是不可变的原始捕获，绝不会被重写——前提是按照第 3 步为每个文档分配了自己的文件名）——不要为了让 grep 的结果在字面上归零而反复追查。
- `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 的结果为空。
- docx 路径：已渲染为图像并与源文件进行视觉对比；标题层级和高亮保持一致（参见 docx 参考文档中的检查清单）。
- 仅限浏览器回退路径：目录覆盖率 + 缩放检查（参见 browser-failure-rules.md）。
- 每个输出文件的前置元数据都记录了 `source`（原始 URL/令牌），并且如果应用了任何后处理，还应包含一行 `post_process` 来源记录——确切的 YAML 结构和字段列表见 **[references/lark-cli-api-extraction.md, Step 7](references/lark-cli-api-extraction.md)**（未在上方路径 A 的 5 个编号步骤中展示，因为这是针对每个文件的收尾步骤，而不是获取/递归/检查循环的一部分）。
- 权限缺口（尚未导出的 131006 文档、无法下载的图像）应明确列给用户——透明地说明缺口胜过默默遗漏。

## 请勿尝试

以下是已验证的死路——重试只会浪费当前会话。包含失败模式和根本原因的完整表格见：**[references/permission-and-failure-boundaries.md](references/permission-and-failure-boundaries.md)**。其中最主要的包括：

- 通过任何方式（lark-cli / curl / 匿名浏览器）绕过 `131006` 权限拒绝——这是服务端边界。
- 通过 `docs +media-download`、`api …/drive/v1/medias/<t>/download`（无论是否带有 `extra`）或 `schema drive.medias.download` 下载 docx 内嵌图像——这些方法均不可行；lark-cli 甚至会将实际的 HTTP 400 错误错误报告为“empty JSON”。
- 对 `open.feishu.cn/document/server-docs/...` 下的 API 规范使用 `WebFetch`——后端不稳定；应改用 `open.feishu.cn/llms-docs/zh-CN/llms-<module>.txt`（对 LLM 友好且稳定）。
- AppleScript/JXA `executeJavaScript`、端口 9222 上的 Chrome CDP——在此环境中已禁用或返回空结果（仅适用于浏览器路径）。
- 使用 `minimax-docx` 将 docx→md——它是一个 docx *创作*工具；请改用 doc-to-markdown skill。

## 捆绑资源

- `scripts/feishu_extract_refs.py` — 确定性的引用令牌提取器；递归引擎的核心。对每个获取到的文档运行一次，并以该文档自身的 `<sanitized-title>.html` 为输入（优先于 `.md`——第 3 步），以 JSON 格式枚举 `<mention-doc>`/`<sheet>`/`<image>`/`<whiteboard>`/跨租户/Minutes/Tencent-Meeting 引用。
- `scripts/restore_docx_headings.py` — 用于路径 B：通过 python-docx 读取真实字号，将其映射到标题级别，并将 `w:shd` 高亮恢复为 Obsidian `==…==`，且无需重新输入正文文本。
- `scripts/feishu_dom_capture.js` — 路径 D：可注入的端到端浏览器 DOM 捕获工具。
- `scripts/download_feishu_images.py` — 路径 D：浏览器自动化不可用时使用的 SSR 图像提取工具。
- `scripts/build_feishu_markdown.py` — 路径 D：将捕获清单渲染为 Markdown。
- `scripts/check_heading_coverage.py` — 覆盖率验证（适用于两条路径）。
- `references/lark-cli-api-extraction.md` — 路径 A 的完整参考文档（命令、递归、表格、跨租户）。
- `references/feishu-minutes-transcript.md` — 路径 C 的原生转录 API + 范围授权。
- `references/permission-and-failure-boundaries.md` — 错误代码 + 完整的“请勿尝试”表格。
- `references/docx-export-to-markdown.md` — 路径 B 的忠实转换流程。
- `references/browser-dom-fallback.md` + `references/browser-failure-rules.md` — 路径 D。
- `references/capture-manifest.md` — `build_feishu_markdown.py` 的清单结构。

## 下一步

提取完成后，干净的 Markdown 通常会进入用户自己的知识库摄取流程（归档、索引、去重）——这被有意排除在此技能的范围之外。如果来源经过路径 B（docx），则 doc-to-markdown 技能已是该流程的一部分。提供交接选项；不要自动整理：

```
Extraction complete: [N] sources → faithful Markdown ([M] permission/image gaps listed).

Options:
A) Hand off to your PKM/organizing workflow — file & index these (Recommended if part of a vault)
B) Run /daymade-docs:docs-cleaner — consolidate redundant content across the extracted files
C) Stop here — the faithful Markdown is the deliverable
```