---
name: feishu-doc-scraper
description: Extract Feishu (Lark) Docs, Wiki pages/collections, spreadsheets, and Minutes (妙记) transcripts into faithful local Markdown via the lark-cli API (no LLM rewriting of the body; browser-DOM fallback when lark-cli can't reach the content). Use whenever the source is a Feishu/Lark URL and fidelity matters — 导出飞书文档/合集/妙记转写, 把飞书 wiki/知识库转 markdown, archiving a Feishu collection, exporting a 妙记 transcript, or saving a Feishu page — even if the user only says clipping, archiving, converting, or "save this". Also covers the owner-exported .docx → faithful Markdown path.
compatibility: Primary path needs the `lark-cli` binary (npm `@larksuite/cli`, verified 1.0.32, 2026-05) authenticated to the target tenant. Fallback path needs a browser automation surface with an authenticated session (Chrome DevTools MCP / Browser Use / Computer Use). docx path needs `python-docx` and a docx→md converter (the bundled doc-to-markdown skill or pandoc).
argument-hint: "[feishu-url-or-output-path]"
---
# 飞书文档抓取器

将飞书/Lark 来源提取为忠实的本地 Markdown。**优先使用 lark-cli API**——它以编程方式提取正文（不会由模型进行改写），可沿集合的引用图继续提取，并根据错误代码识别权限边界，而不是依靠猜测。应将浏览器渲染的页面视为*后备方案*，而非事实来源：在实际的集合抓取工作中，API 路径始终能够完成全部任务，而浏览器路径从未被需要过。

## 适用范围（请先阅读）

此技能的约定是：**为每个来源生成忠实的 Markdown，并记录所提取的内容**。它*不*负责决定如何命名生成的文件、如何建立索引、如何与现有笔记去重，或如何将其组织到知识库中——这些属于宿主 PKM / 用户自己的约定。仅进行忠实提取，可以使此技能保持正交性和可复用性。当用户希望将输出归档到某个库中时，应先进行提取，再将干净的 Markdown 交给其整理工作流。

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

集合/中心只是一个正文中引用了其他文档的 docx——**路径 A 会通过递归遍历引用图来处理它**，而不是在浏览器中逐个访问页面。

## 路径 A——lark-cli API 提取（主要路径）

完整的命令目录、递归引擎、跨租户和个人空间的注意事项：**[references/lark-cli-api-extraction.md](references/lark-cli-api-extraction.md)**。以下是常见场景的要点：

**1. 对飞书中国大陆域名禁用代理。** 飞书的 `*.feishu.cn` 端点在中国大陆应直接连接；通过本地代理路由这些端点会经由代理泄露凭据，并遭遇 DNS 劫持。lark-cli 本身也会对此发出警告。请始终执行：

```bash
export LARK_CLI_NO_PROXY=1
```

这与任何“Claude/Anthropic 域名必须使用代理”的规则并不冲突——飞书使用的是不同的主机，应直接连接。

**2. 对 URL 进行分类，然后将其解析为可获取的文档令牌。**

- `…/wiki/<node_token>`——wiki 节点令牌**不是**文档令牌。请先解析它：
  ```bash
  lark-cli wiki spaces get_node --params '{"token":"<node_token>"}'
  # → .data.node.obj_token  and  .data.node.obj_type  (e.g. "docx")
  ```
- `…/docx/<doc_token>`——已经是文档令牌，可直接获取。
- `…/sheets/<token>`——电子表格，请使用 sheets 命令（参见参考文档）。
- `…/minutes/<token>`——妙记，请转到**路径 C**。

**3. 通过程序获取正文——绝不要通过模型获取。** 正文字段在不同 lark-cli 版本中发生过变化，因此应同时探测这两个位置，而不是硬编码其中一个（这样无论安装的是哪个版本都能正常工作）：

```bash
lark-cli docs +fetch --doc <obj_token> --format json > /tmp/fetch.json 2> /tmp/fetch.err
# ≤1.0.32: clean Markdown in .data.markdown.
# 1.0.55: body moved to .data.document.content as HTML (.data.markdown is null).
if jq -e -r '.data.markdown // empty' /tmp/fetch.json > source.md && [ -s source.md ]; then
  : # got clean Markdown directly
else
  jq -r '.data.document.content' /tmp/fetch.json | pandoc -f html -t gfm > source.md
fi
```

`--format markdown` **不是**有效值（lark-cli 会发出警告并回退到 json）。应将 stdout 和 stderr 分开——一条无害的 `[deprecated]` 信息会输出到 stderr，而实践中同时使用 `2>/dev/null` 和 `jq` 管道会产生错误的 `Exit code 5`。正文必须通过 `jq`/`pandoc` 写入磁盘，绝不能由模型重新输入或总结——改写会在不易察觉的情况下破坏源文本，这是最重要的单项保真规则。（pandoc 只会将 HTML 结构重新渲染为 Markdown，不会改写正文，因此能够保持保真度。）

**4. 如果它是集合/中心文档，请沿引用图进行遍历（BFS）。** 中心文档正文包含 `<mention-doc>`、`<sheet>`、`<image>` 标签，以及跨租户 / Minutes / Tencent-Meeting URL。提取每一个引用，按类型分派并获取内容，而且要**对每个新获取的文档重复此过程，直到不再出现新的引用**（叶节点）。使用随附的提取器，确保不会遗漏任何内容（遗漏一个引用就意味着缺少一份文档，这是中心文档抓取失败的首要原因）：

```bash
python3 scripts/feishu_extract_refs.py source.md   # → JSON list of {type, token, title}
```

递归循环、分派表，以及跨租户/`my.feishu.cn` 个人空间规则均位于参考文档中。

**5. 最终残留标签检查（集合的验收门槛）。** 每个富媒体引用都必须已解析并渲染：

```bash
grep -rlE '<(lark-table|lark-tr|sheet token=|mention-doc|view type=)' . && echo "UNRESOLVED — keep recursing" || echo "clean"
```

停止前，检查结果必须为空。

## 路径 B——权限被拒绝 → 由所有者导出的 .docx

如果 `lark-cli wiki spaces get_node` 返回 `code 131006 … node permission denied, user needs read permission`（或 fetch 返回该错误），这就是一个**飞书侧的硬性边界**。lark-cli、匿名 curl 和浏览器均无法突破这一限制——这一点已得到全面验证；不要浪费时间尝试绕过。唯一正确的做法是：请权限持有者将文档导出为 `.docx`，通过带外方式将其发回，然后进行保真转换（恢复字号→标题和 `w:shd`→高亮，随后执行视觉验证）。完整流程：**[references/docx-export-to-markdown.md](references/docx-export-to-markdown.md)**。

## 路径 C——Feishu Minutes（妙记）转录文本

`lark-cli minutes` 只能返回元数据并下载音频/视频——它**无法**导出文本转录。转录文本来自通过 `lark-cli api` 调用的原生端点，并且需要通过设备流登录授予额外的 scope。原生 AI 转录的效果远优于下载媒体后重新运行 ASR——绝不要采用后者。端点、scope 名称、设备流超时陷阱，以及按妙记（而非按租户）生效的权限行为：**[references/feishu-minutes-transcript.md](references/feishu-minutes-transcript.md)**。

## 路径 D — 浏览器 DOM 回退方案（最后手段）

仅当 lark-cli 确实无法访问内容时使用（无法安装，且文档并非因权限而不可访问）。这是旧的虚拟滚动/TOC 驱动的 DOM 捕获工作流。它速度较慢，依赖已连接的浏览器界面（浏览器内扩展经常连接失败），而匿名调试 Chrome 只能告诉你页面是否可被*公开*访问——无法读取需要登录才能访问的内容。工作流：**[references/browser-dom-fallback.md](references/browser-dom-fallback.md)**。经过实战检验的 DOM 规则（虚拟滚动、`data-block-id` 排序、表格/项目符号提取、图像流）：**[references/browser-failure-rules.md](references/browser-failure-rules.md)**。

## 硬性规则

违反以下规则会在不易察觉的情况下毁掉输出。每条规则都有其原因——应遵循其背后的原因，而不只是字面要求。

- **绝不要让文档正文经过模型。** 使用 `jq`/`cat`/脚本直接提取到磁盘。模型对源文本的改写之后无法被检测出来，并会破坏保真度。这就是路径 A 在结构上优于浏览器路径的原因。
- **对于 `*.feishu.cn`，请设置 `export LARK_CLI_NO_PROXY=1`。** 否则凭据会经过本地代理传输，DNS 也会被劫持。
- **转录文本必须来自平台原生转录，绝不要重新执行 ASR。** 下载媒体后再次转录会丢失说话人标签、时间戳和准确性。
- **生成的 docx Markdown 在根据源文档完成*视觉*验证之前，不能算完成**（渲染为图像并检查）。飞书导出的 docx 使用字号加粗体来表示标题，而不是 Word 标题样式，因此即使“无错误、字数一致”检查通过，整个标题层级也可能在不易察觉的情况下变成扁平结构。文本级检查无法发现这一问题。
- **不要在下载 docx 嵌入图像上死磕。** lark-cli（截至 1.0.32）无法从 docx 下载 `<image>` token——这一点已经过详尽验证。登记图像 token，并注明“需要文档所有者右键单击 → 保存”；文本才是核心价值，图像属于已跟踪的缺口。
- **匿名 curl 返回 HTTP 200 ≠ 可以访问。** 飞书登录拦截页会返回 200，但响应正文中包含 `accounts.feishu.cn` / `login` / `passport` / 空的 `<title>`。应检查响应正文，绝不要根据状态码推断页面“公开”。
- **搜索代理报告文件“未找到”并非权威结论。** 在下结论前，应根据权威来源进行验证（这是通用的推断纪律；在确定已摄取内容当前所在位置时尤其相关）。
- **对生成的每个文件执行 U+FFFD 最终检查：** `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 必须无任何输出。出现替换字符意味着某个编码步骤损坏了文本。

## 验收约定

仅当所有适用条件均满足时才停止：

- 每个已获取的正文都通过 `jq`/脚本写入磁盘，而不是由模型重新输入。
- 集合：残留富媒体标签 grep（路径 A 第 5 步）无任何输出——每个 `mention-doc`/`sheet`/跨租户引用都已追踪到叶子节点。
- `LC_ALL=C grep -rl $'\xef\xbf\xbd' .` 无任何输出。
- docx 路径：已渲染为图像并与源文档进行视觉比较；标题层级和高亮一致（参见 docx 参考文档中的检查清单）。
- 仅浏览器回退方案：TOC 覆盖率 + 规模检查（参见 browser-failure-rules.md）。
- 每个输出文件的 frontmatter 都记录 `source`（原始 URL/token）；如果应用了任何后处理，还应包含一行 `post_process` 来源记录。
- 权限缺口（尚未导出的 131006 文档、无法下载的图像）已明确列出并告知用户——透明地说明缺口胜过静默遗漏。

## 请勿尝试

以下是已经验证不可行的方案——再次尝试只会浪费当前会话。包含失败模式和根本原因的完整表格见：**[references/permission-and-failure-boundaries.md](references/permission-and-failure-boundaries.md)**。其中最主要的包括：

- 试图通过任何方式（lark-cli / curl / 匿名浏览器）绕过 `131006` 权限拒绝——这是服务端边界。
- 通过 `docs +media-download`、`api …/drive/v1/medias/<t>/download`（无论是否带 `extra`）或 `schema drive.medias.download` 下载 docx 内嵌图片——这些方法均不可行；lark-cli 甚至会将实际的 HTTP 400 错误误报为“empty JSON”。
- 使用 `WebFetch` 访问 `open.feishu.cn/document/server-docs/...` 获取 API 规范——后端不稳定；请改用 `open.feishu.cn/llms-docs/zh-CN/llms-<module>.txt`（对 LLM 友好且稳定）。
- 使用 AppleScript/JXA `executeJavaScript`、通过 9222 端口使用 Chrome CDP——在此环境中已被禁用或返回空内容（仅浏览器路径）。
- 使用 `minimax-docx` 将 docx 转换为 md——它是 docx *创作*工具；请改用 doc-to-markdown skill。

## 随附资源

- `scripts/feishu_extract_refs.py` — 确定性的引用令牌提取器；递归引擎的核心。对每个已获取的正文运行此脚本，以 JSON 格式枚举 `<mention-doc>`/`<sheet>`/`<image>`/跨租户/Minutes/Tencent-Meeting 引用。
- `scripts/restore_docx_headings.py` — 用于路径 B：通过 python-docx 读取实际字体大小，将其映射到标题级别，并将 `w:shd` 高亮恢复为 Obsidian `==…==`，无需重新输入正文。
- `scripts/feishu_dom_capture.js` — 路径 D：可注入的端到端浏览器 DOM 捕获工具。
- `scripts/download_feishu_images.py` — 路径 D：浏览器自动化不可用时的 SSR 图片提取工具。
- `scripts/build_feishu_markdown.py` — 路径 D：将捕获清单渲染为 Markdown。
- `scripts/check_heading_coverage.py` — 覆盖率验证（两条路径均适用）。
- `references/lark-cli-api-extraction.md` — 路径 A 的完整参考资料（命令、递归、表格、跨租户）。
- `references/feishu-minutes-transcript.md` — 路径 C 的原生转录 API 和 scope 授权。
- `references/permission-and-failure-boundaries.md` — 错误码和完整的“请勿尝试”表格。
- `references/docx-export-to-markdown.md` — 路径 B 的忠实转换流程。
- `references/browser-dom-fallback.md` + `references/browser-failure-rules.md` — 路径 D。
- `references/capture-manifest.md` — `build_feishu_markdown.py` 所用的清单结构。

## 后续步骤

提取完成后，干净的 Markdown 通常会进入用户自己的知识库摄取流程（归档、索引、去重）——这部分有意不包含在此 skill 的范围内。如果源文件通过路径 B（docx）处理，则 doc-to-markdown skill 已经是该流程的一部分。提供移交选项；不要自动整理：

```
Extraction complete: [N] sources → faithful Markdown ([M] permission/image gaps listed).

Options:
A) Hand off to your PKM/organizing workflow — file & index these (Recommended if part of a vault)
B) Run /daymade-docs:docs-cleaner — consolidate redundant content across the extracted files
C) Stop here — the faithful Markdown is the deliverable
```