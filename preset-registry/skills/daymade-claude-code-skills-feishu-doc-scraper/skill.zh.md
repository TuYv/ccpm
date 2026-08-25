---
name: feishu-doc-scraper
description: Extract Feishu (Lark) Docs, Wiki pages/collections, spreadsheets, and Minutes (妙记) transcripts into faithful local Markdown via the lark-cli API (no LLM rewriting of the body; browser-DOM fallback when lark-cli can't reach the content). Use whenever the source is a Feishu/Lark URL and fidelity matters — 导出飞书文档/合集/妙记转写, 把飞书 wiki/知识库转 markdown, archiving a Feishu collection, exporting a 妙记 transcript, or saving a Feishu page — even if the user only says clipping, archiving, converting, or "save this". Also covers the owner-exported .docx → faithful Markdown path.
compatibility: Primary path needs the `lark-cli` binary (npm `@larksuite/cli`; verified 1.0.32, 2026-05, and re-verified 1.0.80, 2026-08 — the `.data.markdown` field is null on 1.0.80 and the pandoc/`source.html` path in step 3 is load-bearing there) authenticated to the target tenant. Fallback path needs a browser automation surface with an authenticated session (Chrome DevTools MCP / Browser Use / Computer Use). docx path needs `python-docx` and a docx→md converter (the bundled doc-to-markdown skill or pandoc).
argument-hint: "[feishu-url-or-output-path]"
---
# 飞书文档抓取器

将飞书/Lark 源内容提取为忠实的本地 Markdown。**优先使用 lark-cli API**——它以编程方式提取正文（不经过模型改写），遍历集合的引用图，并根据错误代码读取权限边界，而不是进行猜测。将浏览器渲染页面视为*备用方案*，而不是事实来源：在实际的集合抓取工作中，API 路径始终能够完成全部工作，而浏览器路径从不需要使用。

## 范围（请先阅读）

此技能的契约是**逐个来源生成忠实的 Markdown，并记录已提取的内容**。它不负责决定生成文件的命名方式、如何建立索引、如何与现有笔记去重，或如何将文件组织进知识库——这些属于宿主 PKM / 用户自己的约定。当用户希望将输出归档到 vault 时，应先完成提取，再将干净的 Markdown 交给其整理工作流。

**提取与持久化存储是两个独立的决策。**下载的 MP4/XLSX/DOCX/图像只是工作副本，并不能证明该文件应当属于 Git 或 Git LFS。对于知识库归档，默认采用：

- Git：忠实的 Markdown，以及结构化的 CSV/JSON/HTML、源定位信息、修订/权限状态、字节数、MIME 类型和哈希值。
- 平台原始文件：当稳定的文档/文件 token 仍可检索时，飞书仍是原始二进制附件的记录来源。本地下载是可选缓存，在全新克隆中可能不存在。
- OSS/对象存储：仅当归档需要独立的持久副本，或平台源不是可靠的长期检索路径时使用。上传是单独的授权操作，不是提取器自行选择的备用方案。

在归档之前，应在 artifact manifest 中声明这一拆分，并运行随附的存储验证器。完整的 schema 和示例见 **[references/archive-storage-contract.md](references/archive-storage-contract.md)**。

## 选择路径

```
源是否为飞书/Lark URL（wiki / docx / sheets / minutes / base）？
├── 是 → 是否已安装 lark-cli 并完成该租户的身份验证？
│        ├── 是 → 路径 A：lark-cli API 提取（主要路径——从这里开始）
│        │         └── 遇到代码 131006 / 99991679（权限被拒绝）？
│        │              └── 路径 B：所有者导出的 .docx → 忠实 Markdown
│        └── 否 → 先安装/验证 lark-cli（这值得这么做）；只有在
│                  确实无法做到时 → 路径 D：浏览器 DOM 备用方案
├── URL 是 Minutes / 妙记链接，或文档引用了其中一个 → 路径 C：Minutes 转录
└── 交付给你的是导出的 .docx（而不是 URL）→ 路径 B
```

⚠️ **`base`（Bitable）在路径 A 中实际上尚未实现**——提取器只记录 token（`DISPATCH["url-base"]`：*"Bitable API (outside this skill) — record token"*），下面的步骤 2 也没有对应的行。此处列出它只是为了完整涵盖飞书 URL 可能的类型，并不表示路径 A 能够端到端地提取 Bitable 内容。

集合/中心文档本质上只是一个正文中引用了其他文档的 docx——**路径 A 通过递归遍历引用图来处理它**，而不是在浏览器中逐页访问。

## 路径 A — lark-cli API 提取（主要路径）

完整的命令目录、递归引擎、跨租户和个人空间的细节：**[references/lark-cli-api-extraction.md](references/lark-cli-api-extraction.md)**。常见情况下的核心步骤如下：

**1. 对飞书国内域名禁用代理。** 飞书的 `*.feishu.cn` 端点在中国大陆应直连；通过本地代理路由这些端点会导致凭据经由代理泄露，并遭到 DNS 劫持。lark-cli 本身也会对此发出警告。始终执行：

```bash
export LARK_CLI_NO_PROXY=1
```

这与任何“Claude/Anthropic 域名必须使用代理”的规则并不冲突——飞书是不同的主机，应当直连。

**2. 对 URL 进行分类，然后解析为可获取的文档 token。**

- `…/wiki/<node_token>` — wiki 节点 token **不是**文档 token。请先解析：
  ```bash
  lark-cli wiki spaces get_node --params '{"token":"<node_token>"}'
  # → .data.node.obj_token  and  .data.node.obj_type  (e.g. "docx")
  ```
- `…/docx/<doc_token>` — 已经是文档 token，可以直接获取。
- `…/sheets/<token>` — 电子表格，请使用 sheets 命令（见参考文档）。
- `…/minutes/<token>` — Minutes，请转到**路径 C**。

**3. 通过程序获取正文——绝不能通过模型获取。** body 字段在不同版本的 lark-cli 中发生过变化，因此应同时探测两种位置，而不是将其中一种写死（这样无论安装的是哪个版本都能正常工作）：

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

⚠️ **`<sanitized-title>` 必须为每个文档使用不同的名称，绝不能在多次获取中重复使用字面字符串 `"source"`。** 第 4 步会在同一工作目录中获取多个文档（先获取中心文档，然后获取它引用的每个子文档）——如果使用这个完全相同的片段，并将 `source.md`/`source.html` 硬编码，那么第二次获取会悄悄覆盖第一个文档已保存的正文，甚至在你来得及检查它之前就发生覆盖。本节其余部分仍使用“`source.html`”/“`source.md`”作为简写，表示*你当前正在查看的某个文档自身已保存的文件*——而不是整个集合共用的一个文件名。

⚠️ **在此 pandoc 分支中，`pandoc -f html -t gfm` 会静默移除飞书的多个自定义嵌入标签——已通过真实文档验证，验证日期为 2026-08-16/17；而且查看层级越深，损坏越严重：**
- **whiteboard**（`<whiteboard token="…">`，一种内联图表块）会无任何痕迹地消失。在一份真实文档中已确认：`.data.document.content` 中有 3 个原始标签，而经过 pandoc 转换的 `source.md` 中没有任何痕迹（`grep -c whiteboard` 在原始 HTML 中找到 3 处，在转换后的 Markdown 中找到 0 处）。
- **mention-doc**——其真实的原始标签是 `<cite doc-id="…" file-type="wiki|docx" title="…" type="doc"></cite>`，而不是此 skill 原先假设的 `<mention-doc token="…" type="…">Title</mention-doc>` 形式——同样会无任何痕迹地消失；而且情况比仅丢失 token/type 更糟：标题存储在 `title="…"` 属性中，标签体为空，因此 pandoc 会丢弃整个元素，甚至连单独的标题文本也不会保留。
- **sheet** 目前尚未确认具体情况（没有找到真实的工作表引用文档进行测试）——在得到证实之前，应将其视为同样可能静默消失。
- **image**——其真实的原始标签是标准的 `<img src="<drive-token>" alt="…" …>`，而不是 `<image token="…">`——不会消失：pandoc 基本会原样保留原始 `<img>` 元素（`src`/`id`/`href`/`width`/`height`/`alt` 会保留；`name=` 会被丢弃；`mime=`/`scale=` 会被重命名为 `data-mime=`/`data-scale=`）。
- **lark-table** 事实证明根本不是普通 docx 表格使用的真实标签——普通 docx 表格使用的是原生 `<table>` HTML，pandoc 通常会完整转换它们（对于单段落单元格，会生成整洁的 GFM 管道表格语法；对于多段落单元格，则会生成原始的 `<table>` HTML 块）——因此它不属于这类会静默丢失的内容。

由于这种损失是真实存在且取决于类型，**只要走了这个 pandoc 分支，提取（步骤 4）和残留标签检查（步骤 5）就必须针对 `source.html` 执行，绝不能针对 `source.md`。** 对于 `.data.markdown` 分支（≤1.0.32），如果它仍然可以被触发，标签已经作为字面文本直接保留在 `source.md` 中，因此在那里检查 `source.md` 仍然是正确的——这一注意事项仅适用于 pandoc 回退分支，而该分支是**当前默认分支**：在检查过的所有真实文档中，`.data.markdown` 都是 `null`（11/11——当前安装的 lark-cli 1.0.80 上新抓取的 3/3，以及 2026-07-25 归档抓取的 8/8），因此尚未确认任何当前 lark-cli 构建版本是否仍可触发旧分支。

`--format markdown` **不是有效值**（lark-cli 会发出警告并回退到 json）。保持 stdout 和 stderr 分离——一行无害的 `[deprecated]` 会输出到 stderr，而在实际使用中，将 `2>/dev/null` 和 `jq` 一起管道连接会产生错误的 `Exit code 5`。正文必须通过 `jq`/`pandoc` 写入磁盘，绝不能由模型重新输入或总结——改写会悄无声息地破坏源文本，这是最重要的保真规则。 （pandoc 只会将 HTML 结构重新渲染为 Markdown；它不会改写正文——上文所述的标签剥离属于结构损失，而不是正文保真度损失，这正是 `source.html` 必须保留在磁盘上，并作为富媒体引用的权威来源的原因。）

**4. 如果它是一个集合/枢纽，请遵循引用图（BFS）。** 枢纽正文包含 `<mention-doc>`（真实原始标签：`<cite doc-id="…">`）、`<sheet>`、`<image>`（真实原始标签：`<img src="…">`）标签、`<whiteboard token="…">` 块，以及跨租户 / Minutes / Tencent-Meeting URL。提取每个引用，按类型分派并抓取，然后**对每个新抓取的文档重复此过程，直到不再有新的引用**（叶节点）——**但 `whiteboard` 永远不会被抓取或递归处理**：它是内联视觉内容，而不是指向另一篇文档的链接（见下方专门的说明）。使用随附的提取器，以免有任何内容被静默遗漏（遗漏一个引用 = 缺少一篇文档，这是枢纽抓取失败的头号原因）：

```bash
python3 scripts/feishu_extract_refs.py "<sanitized-title>.html"   # → JSON list of {type, ref, title, dispatch}
```

每个抓取到的文档运行一次——先运行根文档，然后运行每个新抓取的子文档——使用该文档自己的 `<sanitized-title>.html`（参见步骤 3 的命名注意事项）。提取器只是进行纯正则扫描——对于同一文档的 `.html` 或 `.md`，它都可以工作，因为它只检查文件文本中是否包含这些标签——但**如果两者都存在，应以 `.html` 为准**；只有在该文档从未保存过 `.html` 时，才回退到 `.md`（即步骤 3 中的 `.data.markdown` 分支）。递归循环、分派表，以及跨租户 / `my.feishu.cn` 个人空间规则，见引用部分。

**白板块不是可跟随的引用——应在原位置导出并阅读。** `whiteboard token="…"` 标签是飞书原生的图表/流程图块，内联在当前文档中——它不是指向另一篇文档的指针，因此不要像处理 `mention-doc`/`sheet` 那样对它进行递归/抓取。必须通过视觉方式理解它：仅凭原始节点坐标/文本片段列表，无法可靠地还原流程图的含义。导出预览图并实际查看它：

```bash
lark-cli whiteboard +export --whiteboard-token <token> --output-type preview --output <path>.jpg --overwrite
```

然后对生成的 `.jpg` 使用 Read 工具，以查看图表的实际内容。也可以使用 `--output-type raw`（结构化节点 JSON——可用于交叉核对/搜索索引，但不能替代查看渲染后的图像）；此外还存在 `svg` 和 `source` 输出类型。输出路径必须具有与命令实际生成格式相匹配的真实图像扩展名（如果实际格式是 `.jpg`，却要求输出为 `.png`，命令会报错——请根据命令报告的格式匹配扩展名，或者按照其自身的 `--help` 说明省略扩展名）。默认情况下，预览图是**工作缓存**：在 artifact manifest 中记录 whiteboard token、观测到的 MIME/字节数/hash，以及可选的缓存路径；不要将 JPEG 静默提升到 Git/LFS。如果持久化归档需要独立的二进制副本，请明确将其路由到 OSS。这一点很重要，因为图表通常包含文档纯文本部分中没有的、与决策相关的内容——例如，泳道图/流程图可能包含逐角色的步骤，以及其他地方完全没有记录的具体数值阈值。若不打开这些内容块，却将文档视为“已完全提取”，就会静默丢弃最有可能承载其实际运行逻辑的内容。

**5. 最终残留标签检查（验收门禁——对每个获取的文档执行，而不仅仅是集合）。** 没有跨文档引用的单个文档仍然需要执行此检查：内联的 `whiteboard` 或未解析的引用标签可能在完全没有其他文档参与的情况下出现（2026-08-16 的一次真实单文档提取中就发生了这种情况——没有 hub，没有递归，只有 3 个未读取的 whiteboard）。每个富媒体引用都必须已经解析并渲染。请对整个工作目录递归执行，而不是只检查单个文件——一个集合中每个文档都有一对 `<sanitized-title>.html`/`.md` 文件（步骤 3），而 pandoc 转换得到的 `.md` 可能会自行报告“干净”，但真实标签已经被静默丢弃（参见步骤 3 的提示），因此扫描必须覆盖磁盘上的每个 `.html`：

```bash
grep -rlE '<(lark-table|lark-tr|sheet token=|mention-doc|cite doc-id=|whiteboard token=|view type=)' . \
  && echo "UNRESOLVED — keep recursing" || echo "clean"
```

该模式中的 `lark-tr` 和 `view type=` 是尚未通过真实 HTML 验证的预先存在术语——不同于其他五项，它们在 `feishu_extract_refs.py` 中没有对应的 regex，也没有 dispatch 条目，因此命中这些标签并没有结构化工具支持；应将其视为“停止并手动检查原始标签”，而不是视为提取器已经能够理解的内容。

⚠️ **对于每个文档保存的 `.html`，“为空”不是字面意义上的停止条件——应将每个命中项视为工作列表项，而不是视为循环失败。** 每个 `<sanitized-title>.html` 都是*该*文档的不可变原始捕获（获取完成后，此 skill 不会在原位置重写文档自身的文件——参见步骤 3 中关于每个文档命名的注意事项），因此，一个确实引用了 N 个其他文档或 M 个图表的父文档，即使所有这些引用都已正确处理，其自身文件仍会永久显示 N+M 个匹配项——试图让整个目录中的 grep 结果字面上归零，对于真实的 hub 文档来说永远不会终止。相反，对于每个匹配项，请验证对应 artifact 是否存在于磁盘上：`mention-doc`/`cite doc-id=`/`sheet` 命中项在被引用的子文档确实已获取并保存后即视为已解析（步骤 3，应用于该子文档）；`whiteboard` 命中项在其预览 `.jpg` 已导出并完成 Read 后即视为已解析（步骤 4）——**绝不能**通过获取另一份文档来处理，因为它不是可跟随的引用。只有当每个匹配项都对应到一个已在磁盘上验证存在的 artifact 后，才停止。（在 `.data.markdown` fallback 分支中，获取的正文本身就是交付的 Markdown，而不是不可变的原始捕获，因此字面上的空结果仍然是更简单的信号——但在当前任何 lark-cli 构建版本中都尚未确认该分支可达，参见步骤 3。）

## 路径 B — 权限被拒 → 文档所有者导出的 .docx

`lark-cli wiki spaces get_node` 返回 `code 131006 … node permission denied, user needs read permission`（或获取内容时返回该错误）说明这是 **飞书侧的硬性边界**。lark-cli、匿名 curl 和浏览器都会失败——这一点已经过了穷尽验证；不要再花时间尝试绕过它。唯一正确的做法：请权限持有者将文档导出为 `.docx`，通过带外方式发回，然后以高保真方式转换（恢复 font-size→heading 和 `w:shd`→highlight，再进行视觉验证）。完整流程：**[references/docx-export-to-markdown.md](references/docx-export-to-markdown.md)**。

## 路径 C — 飞书妙记转写文本

`lark-cli minutes` 只能返回元数据并下载音频/视频——它**无法导出文本转写**。转写文本来自通过 `lark-cli api` 调用的原生端点，并且需要通过设备流登录授予额外 scope。原生 AI 转写的效果远好于下载媒体后重新运行 ASR——绝不要采用后者。端点、scope 名称、设备流超时陷阱，以及按每分钟（而非每个租户）生效的权限行为：**[references/feishu-minutes-transcript.md](references/feishu-minutes-transcript.md)**。

## 路径 D — 浏览器 DOM 回退方案（最后手段）

仅在 lark-cli 确实无法触达内容时使用（无法安装，且文档并非因权限而无法访问）。这是旧的虚拟滚动 / 目录驱动的 DOM 抓取流程。它速度更慢，依赖已连接的浏览器界面（浏览器内扩展经常无法连接），而匿名调试 Chrome 只能告诉你页面是否可以被*公开*访问——无法读取需要登录的内容。流程：**[references/browser-dom-fallback.md](references/browser-dom-fallback.md)**。经过实战验证的 DOM 规则（虚拟滚动、`data-block-id` 排序、表格/项目符号提取、图像流）：**[references/browser-failure-rules.md](references/browser-failure-rules.md)**。

## 硬性规则

违反以下规则会悄无声息地破坏输出。这些规则各有原因——应遵循其原因，而不只是机械遵守字面要求。

- **绝不要让文档正文经过模型。** 使用 `jq`/`cat`/脚本直接提取到磁盘。模型对源文本进行转述这一问题之后无法被察觉，并且会破坏保真度。这正是路径 A 在结构上优于浏览器路径的原因。
- 对于 `*.feishu.cn`，使用 **`export LARK_CLI_NO_PROXY=1`**。否则凭据会经过本地代理，DNS 也会被劫持。
- **转写文本来自平台的原生转写，绝不要重新运行 ASR。** 下载媒体并再次转写会丢失说话人标签、时间戳和准确性。
- **生成的 docx Markdown 只有在与源文档进行*视觉*核对后（渲染为图像并阅读）才算完成。** 飞书导出的 docx 使用字号加粗来表示标题，而不是 Word 标题样式，因此“无错误、字数匹配”的检查可能通过，但整个标题层级会悄无声息地变成扁平结构。文本级检查无法发现这一点。
- **不要在 docx 内嵌图像下载上死磕（grind）。** lark-cli（截至 1.0.32）无法从 docx 下载 `<image>` 标记——这一点已经过穷尽验证。登记图像标记，并注明“需要文档所有者右键 → 保存”；文本才是有价值的内容，图像则是一个已跟踪的缺口。
- **在 pandoc 回退路径上，富媒体标签验证必须针对每个文档自己的 `.html` 执行，绝不能针对其 `.md` 执行；并且每个文档都需要自己的文件名，不能共用字面量 `source.html`。** `pandoc -f html -t gfm` 会悄无声息地删除飞书的自定义嵌入标签——已在真实文档上验证：`.data.document.content` 中的 3 个原始 `whiteboard token="…"` 标签，在转换后的 `.md` 中完全没有留下痕迹（2026-08-16）。在此路径上只检查 `.md` 中是否残留标签，总会报告“干净”，即使内容已被悄无声息地丢弃；在一个 hub 的多次获取中重复使用同一个硬编码文件名（步骤 3），还会让后获取的文档悄无声息地覆盖前一个文档的原始抓取结果，使其甚至来不及接受检查。
- **绝不要将“已下载”等同于“应纳入 Git/LFS”。** 原始视频、Office 文件、PDF 和图像默认保留飞书原件及稳定定位器；本地文件只是缓存。Git 存储结构化/可搜索的派生文件及来源信息。当仅保留源文件不足以满足持久化需求时，OSS 是一条明确的持久化路径。在提交软件包前运行 `python3 scripts/check_archive_storage.py <artifact-manifest.json>`。
- **匿名 curl 返回 HTTP 200 ≠ 可访问。** 飞书登录墙会返回 200，但响应正文中包含 `accounts.feishu.cn` / `login` / `passport` / 空的 `<title>`。检查正文，绝不要根据状态码推断“公开”。
- **搜索代理报告某个文件“未找到”并不具有权威性。** 在下结论前，先对照权威来源进行核验（这是通用的推理纪律；在定位已摄取内容现有存放位置时尤其相关）。
- **对每个生成的文件执行 U+FFFD 最终检查：** `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 必须为空。替换字符意味着某个编码步骤损坏了文本。

## 验收契约

仅当以下所有条件均满足时才停止：

- 每个获取到的正文都通过 `jq`/脚本写入磁盘，而不是由模型重新输入。
- **每个获取到的文档——单个文档和文档集合同样适用**：对残留富媒体标签检查的每个命中项（Path A 第 5 步，在整个工作目录上递归运行）都映射到一个已处理的产物——每个 `mention-doc`/`cite doc-id=`/`sheet`/跨租户引用都已**跟进**到获取的叶文件，并且每个 `whiteboard` 引用都已**导出并读取**（不是跟进——whiteboard 是内嵌的视觉内容，绝不是需要递归处理的链接）。原始二进制文件随后映射到稳定的平台/OSS 定位符，以及可选的、经过验证的本地缓存；结构化/可搜索的衍生文件映射到带版本的文件。这不是仅针对文档集合的检查：独立文档也可能包含未解析的 `whiteboard`，且不涉及其他文档。每个文档自身的 `.html` 合理地会永远保留其标签（它是不可变的原始抓取内容，从未被重写——只要每个文档按照第 3 步使用了各自的文件名）；不要为了让 grep 本身变成字面意义上的零命中而继续追查。
- 工件清单通过 `python3 scripts/check_archive_storage.py <manifest>`：不得将原始二进制文件声明为 Git 存储，每个外部工件都有稳定的定位符，并且每个本地缓存都明确标记为非权威来源。
- `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 为空。
- docx 路径：已渲染为图像并与源文件进行视觉比对；标题层级和高亮均匹配（参见 docx reference 的检查清单）。
- 仅浏览器回退路径：目录覆盖率 + 缩放检查（参见 browser-failure-rules.md）。
- 每个输出文件的 frontmatter 都记录了 `source`（原始 URL/token）；如果应用了任何后处理，还要记录一行 `post_process` provenance——确切的 YAML 结构和字段列表见 **[references/lark-cli-api-extraction.md, Step 7](references/lark-cli-api-extraction.md)**（Path A 上述 5 个编号步骤中未展示，因为这是每个文件的收尾步骤，而不是获取/递归/检查循环的一部分）。
- 权限缺口（尚未导出的 131006 文档、无法下载的图像）都明确列出给用户——透明地说明缺口胜过无声地遗漏。

## 不要尝试

已验证的死路——重试只会浪费会话。包含失败模式和根本原因的完整表格见：**[references/permission-and-failure-boundaries.md](references/permission-and-failure-boundaries.md)**。主要包括：

- 以任何方式绕过 `131006` 权限拒绝（lark-cli / curl / 匿名浏览器）——这是服务端边界。
- 通过 `docs +media-download`、`api …/drive/v1/medias/<t>/download`（无论是否带有 `extra`），或 `schema drive.medias.download` 下载 docx 内嵌图像——这些方式都不起作用；lark-cli 甚至会将真实的 HTTP 400 错误误报为“empty JSON”。
- 使用 `WebFetch` 请求 `open.feishu.cn/document/server-docs/...` 获取 API 规范——后端不稳定；改用 `open.feishu.cn/llms-docs/zh-CN/llms-<module>.txt`（对 LLM 友好且稳定）。
- AppleScript/JXA `executeJavaScript`、端口 9222 上的 Chrome CDP——在此环境中已被禁用/为空（仅限浏览器路径）。
- 使用 `minimax-docx` 将 docx 转换为 md——它是一个 docx *创作*工具；应使用 doc-to-markdown skill。

## 捆绑资源

- `scripts/feishu_extract_refs.py` — 确定性的引用令牌提取器；递归引擎的核心。对每个获取到的文档运行一次，处理该文档自身的 `<sanitized-title>.html`（优先于 `.md` — 第 3 步），将 `<mention-doc>`/`<sheet>`/`<image>`/`<whiteboard>`/跨租户/Minutes/Tencent-Meeting 引用枚举为 JSON。
- `scripts/restore_docx_headings.py` — 用于 Path B：通过 python-docx 读取真实字号，将其映射到标题层级，并将 `w:shd` 高亮恢复为 Obsidian 的 `==…==`，无需重新输入正文。
- `scripts/feishu_dom_capture.js` — Path D：可注入的端到端浏览器 DOM 捕获工具。
- `scripts/download_feishu_images.py` — Path D：浏览器自动化不可用时的 SSR 图像提取工具。
- `scripts/build_feishu_markdown.py` — Path D：将捕获清单渲染为 Markdown。
- `scripts/check_heading_coverage.py` — 覆盖率验证工具（适用于两条路径）。
- `scripts/check_archive_storage.py` — 针对源文件/Git/OSS 存储分离的默认拒绝验证器；阻止将原始二进制文件声明为 Git 构件。
- `references/lark-cli-api-extraction.md` — Path A 完整参考（命令、递归、表格、跨租户）。
- `references/feishu-minutes-transcript.md` — Path C 原生转录 API + 作用域授权。
- `references/permission-and-failure-boundaries.md` — 错误代码 + 完整的禁止尝试表。
- `references/docx-export-to-markdown.md` — Path B 忠实转换流程。
- `references/browser-dom-fallback.md` + `references/browser-failure-rules.md` — Path D。
- `references/capture-manifest.md` — `build_feishu_markdown.py` 的清单结构。
- `references/archive-storage-contract.md` — 结构化 Git 构件、平台原始文件、可选缓存和 OSS 副本的持久化存储契约。

## 下一步

提取完成后，干净的 Markdown 通常会进入用户自己的知识库摄取流程（归档、索引、去重）——这有意不在本 skill 的范围内。如果源文件经过了 Path B（docx），则 doc-to-markdown skill 已经是该流程的一部分。提供交接选项；不要自动整理：

```
Extraction complete: [N] sources → faithful Markdown ([M] permission/image gaps listed).

Options:
A) Hand off to your PKM/organizing workflow — file & index these (Recommended if part of a vault)
B) Run /daymade-docs:docs-cleaner — consolidate redundant content across the extracted files
C) Stop here — the faithful Markdown is the deliverable
```