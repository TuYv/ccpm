---
name: docx-creator
description: >-
  Produce Word (.docx) and export existing Word/WPS manuscripts to PDF (Word 转 PDF / 试读版 /
  排版修复), preserving revisions, tables and images. Especially for Chinese documents, drive
  minimax-skills:minimax-docx OpenXML correctly. Use whenever the deliverable is a .docx
  file: 生成 Word 文档 / 做一份 docx / 写合同 docx / 起草协议 / 正式文书 / 公文 / offer / 劳动合同 /
  把 markdown 转成 Word / Word 排版 / 中文排版 / 签字栏 / 盖章版 / 甲方乙方, or any plain
  "give me a Word file" request. This skill adds the layer minimax-docx does not ship: a verified
  markdown-to-docx OpenXML generator, alignment rules for info and signature blocks, list numbering,
  CJK font dual-slot setup, and a mandatory LibreOffice-to-PDF-to-PNG visual verification chain
  (qlmanage thumbnails are banned — they hide exactly the bugs that matter). Engine belongs to
  minimax-docx; correct usage and field-tested workarounds belong here. For Markdown → PDF use
  daymade-docs:pdf-creator.
---
# DOCX 创建器

基于 **`minimax-skills:minimax-docx`** 的薄增量层。不是文档引擎。

> **请先阅读此处。** OpenXML SDK 能力位于 `minimax-docx` 中。此 skill
> 不包含任何引擎代码。它包含的是经过完整调试后才了解到的部分：
> 该引擎的 CLI 在哪里开始变得不可用、如何正确驱动其 SDK 来处理中文正式
> 文档，以及如何验证输出，从而避免交付一个在你看来正常、但在 Word 中已经损坏的文件。

## 分工

| 层级 | 负责方 | 包含内容 |
|---|---|---|
| OpenXML SDK (`DocumentFormat.OpenXml`)、`WordprocessingDocument` API、XSD 验证器、样式模板、OpenXML 百科 | **`minimax-skills:minimax-docx`** | 引擎与参考文档。此处绝不重复。 |
| CLI 的表达能力上限在哪里，以及何时应放弃 CLI 改用 C# | **此 skill** | ISSUE-001、ISSUE-002 |
| 面向中文正式文档、经过验证的 markdown-to-docx 生成器 | **此 skill** | `scripts/Program.cs` |
| OpenXML 容易出错的中文正式文档排版规则 | **此 skill** | 下方硬性规则 + ISSUE-004…007 |
| 真正的端到端视觉验证链路 | **此 skill** | `references/verification_protocol.md` |

请在 marketplace 安装路径中定位该引擎，通常位于
`~/.claude/plugins/marketplaces/minimax-skills/skills/minimax-docx/`。

对于此 skill 未涵盖的结构性内容——图像、
修订、批注、目录、多节布局、模板应用——请**直接阅读 minimax-docx**。其
`minimax-docx/references/` 文件夹（`cjk_typography.md`、`openxml_element_order.md`、
`openxml_units.md`、`troubleshooting.md`）及其 `Samples/*.cs` 是 SDK 模式的权威来源。请勿在此处重新发明这些内容。

## 路由：此文档应选择哪条路径？

| 情况 | 路径 |
|---|---|
| 中文合同 / 协议 / 公文 / 任何包含甲乙方信息块、编号条款、签名块、表格的文档 | **通过 `scripts/Program.cs` 使用 C# OpenXML**（此 skill） |
| 仅包含普通正文、标题和段落，不含加粗 / 列表 / 表格 | minimax-docx CLI `create --content-json` 已足够 |
| 填写或编辑**现有** `.docx` | minimax-docx 流程 B（`edit-content`），加上此 skill 的布局与验证指南 |
| 匹配现有 `.docx` 的格式 | minimax-docx 流程 C（`apply-template`） |
| 现有 Word/WPS → 修复布局 / 选定摘录 → PDF | 保留 Word 源文件；遵循 `references/word-to-pdf.md` 和 `references/verification_protocol.md` |
| Markdown → PDF | `daymade-docs:pdf-creator` |

经验法则：CLI 的 `--content-json` 恰好只理解三种块类型
（`heading`、`paragraph`、`pagebreak`）。加粗、列表、表格、边框、页脚、字体、
对齐方式——这些都无法表达。中文合同需要全部这些功能。参见 ISSUE-001。

## 快速开始

该生成器读取 markdown 并写入格式化的 `.docx`。将其复制到文档旁边，以便
构建产物保留在 skill 目录之外：

```bash
# 1. Stage the generator beside your markdown
mkdir -p _docxgen && cp <skill-dir>/scripts/Program.cs <skill-dir>/scripts/mmdocx-gen.csproj \
   <skill-dir>/scripts/.gitignore _docxgen/

# 2. Generate (first run restores DocumentFormat.OpenXml + Markdig, ~20s)
dotnet run --project _docxgen -- your-doc.md your-doc.docx

# 3. Structural validation via the engine's XSD validator (note the roll-forward env — ISSUE-003)
DOTNET_ROLL_FORWARD=Major dotnet run \
  --project ~/.claude/plugins/marketplaces/minimax-skills/skills/minimax-docx/scripts/dotnet/MiniMaxAIDocx.Cli \
  -- validate --input your-doc.docx

# 4. MANDATORY visual verification — never skip, never substitute qlmanage
soffice --headless --convert-to pdf --outdir /tmp/docxcheck your-doc.docx
pdftoppm -png -r 100 /tmp/docxcheck/your-doc.pdf /tmp/docxcheck/page
# then Read every /tmp/docxcheck/page-NN.png

# 5. MANDATORY if Microsoft Word.app is installed — LibreOffice cannot see ISSUE-012
open -a "Microsoft Word" your-doc.docx   # check the title bar for "兼容性模式", check every page
```

完整的命令详情和故障排除：`scripts/README.md`。  
完整的验证步骤以及通过/失败标准：`references/verification_protocol.md`。

## 硬性规则（违反这些规则意味着需要返工）

### 1. 对齐方式是分层的——这是代价最高的一项

绝不要让整篇文档都采用两端对齐。分为三层，使用三种对齐方式：

| 内容 | 对齐方式 | 原因 |
|---|---|---|
| 文档标题（H1） | 居中 | 约定 |
| 条款标题（H2+） | 左对齐 | 约定 |
| **信息块和签名块**——甲方/乙方/统一社会信用代码/法定代表人/日期，即任何行通过 markdown 软换行或硬换行连接的段落 | **左对齐** | 两端对齐会拉伸**除段落最后一行之外的每一行**。多行信息块是**一个**段落，因此除最后一行外的所有行都会被拉伸成巨大的字符间距。 |
| 普通正文 | 两端对齐（`Both`） | 右边缘整齐 |

该规则可以由机器检查，因此不要凭肉眼判断：如果 markdown 段落的 inline tree  
包含 `LineBreakInline`，则将该段落左对齐；否则将其设置为两端对齐。该逻辑实现在 `Main` 的块分派 switch 中的  
`case ParagraphBlock p:` 分支，换行检测位于 `InlineRuns` 中。（这里特意不提供行号——文件每次增长时行号都会变化；请改为参阅 `scripts/README.md` 中的函数名称查找表。）完整说明：ISSUE-004。

### 2. 独立列表重新开始；延续列表保留编号

每个独立的 markdown 列表都必须使用其**自己的** `NumId`，并附带一个携带  
`StartOverrideNumberingValue = 1` 的 `LevelOverride`。如果在各个条款之间复用同一个 `NumId`，条款 3 的列表就会  
静默地从 4 开始。该逻辑横跨 `case ListBlock lb:` 分支和  
`NumberingDefinitionsPart` 的设置——请参阅 `scripts/README.md` 中的查找表，了解这两处的位置。  
其中还涉及两个 SDK 陷阱（类名错误、元素顺序错误）——ISSUE-005、ISSUE-006。  
对于现有的 Word 列表，要保留有意设置的延续编号。在修改几何属性之前，先解析其 `numId` 及对应层级；  
`numId=0` 会禁用编号。手动输入的序数属于文本，而不是自动列表。参见 ISSUE-016。

### 3. CJK 字体需要同时设置两个槽位

一个 run 必须设置 `RunFonts { Ascii, HighAnsi, EastAsia }`。只设置拉丁字体槽位会让中文字符交由 Word 回退处理，  
文档最终会使用阅读者机器所选择的字体进行渲染。已提供的默认值：拉丁字体为 `Times New Roman`；正文的东亚字体为宋体，  
标题的东亚字体为黑体。中文**粗体 run 会切换字体族为黑体**——宋体没有真正的粗体字重，而渲染器合成的粗体会使多笔画字符变得模糊（ISSUE-014）。字号采用 OpenXML 半点单位——正文为 21（10.5pt，常见的中文稿件字号），H1 为 36（18pt），条款标题为 28（14pt）。正文段落还要设置 2 字符的首行缩进（10.5pt 时为 `420` twips——修改时必须与正文字号同步调整）。ISSUE-007。

### 4. 页面和表格基础设置

A4 页面为 11906 × 16838 twips，页边距为 1440 twip；页码放置在居中的页脚 `PAGE` 字段中。表格需要全部六种边框（`top`/`bottom`/`left`/`right`/`insideH`/`insideV`，顺序必须符合 ECMA-376——ISSUE-013）以及 `tblGrid`（ISSUE-012）——边框设置不完整时，单元格在打印时会看起来没有边框；省略 `tblGrid` 时，即使 LibreOffice 将其隐藏，文件也会无法通过严格验证。相关逻辑实现在 `BuildTable` 以及 `Main` 中的 `SectionProperties`/`FooterPart` 设置处——请参阅 `scripts/README.md` 中的查找表。

## 验证不是可选项

**禁止使用：将 `qlmanage` 缩略图作为视觉证明。** macOS Quick Look 使用的渲染引擎与 Word 不同，即使文档中的信息块被拉开，它也会很乐意地显示一个看起来干净的页面。曾经有一个文档基于 `qlmanage` 证据被宣称为“验证完美”，但在 Word 中打开时是损坏的——这就是本规则的来源。ISSUE-008。

**必需链路：** 生成 → XSD 验证 → `soffice --headless --convert-to pdf` →
`pdftoppm -png` → `Read` 每一页图像 → 检查五种失败模式
（信息块未被拉开 / 每个列表都从 1 重新开始 / 表格边框存在 / 签名
块完整 / 没有孤立分页）→ **如果安装了 Microsoft Word.app，则在其中打开实际
文件，并检查标题栏是否出现“兼容性模式”以及每一页**。详细信息、前置条件
以及“什么算作失败”的列表：`references/verification_protocol.md`。

**LibreOffice 渲染正常，并不等同于“Word 会正确渲染此文档”。**
ISSUE-012 是一个真实且已复现的案例：一个文件通过了该链路中所有基于 LibreOffice 的检查——信息块干净、编号正确、表格完整——但在真实 Word 中打开时，标题栏仍出现“兼容性模式”，并且从未设置任何编号的段落上出现了幽灵项目符号标记。LibreOffice 没有等价的回退路径，在结构上无法暴露这类缺陷。这是 ISSUE-008 自身教训（宽松的渲染器会隐藏 Word 的行为）在上一层的重现；只要 Word 可用于直接检查，就应将仅基于 LibreOffice 的验证视为不完整。

**在覆盖已交付的 .docx 之前**，检查是否存在同级 `~$<name>.docx`——这是 Word 的
所有者锁，表示接收者正打开着旧版本。覆盖会成功，但他们会一直看到过期文档，直到关闭并重新打开它。告知他们。ISSUE-011。

## 自定义

`scripts/Program.cs` 是大约 260 行直观的 OpenXML。要调整字体、
大小、间距、边框或新的块类型，请直接编辑它——这是预期的工作流程。在添加
结构性功能（图像、TOC、页眉、修订）之前，请先阅读 minimax-docx 中对应的
`Samples/*.cs`；这些模式已经过 SDK 版本验证，可以帮你避免编译错误循环。

**如果你向 `RunProperties`、`ParagraphProperties`、`TableProperties`、
`TableCellProperties` 或 `TableBorders` 追加新属性：它必须按照 ECMA-376 对该父级规定的子元素顺序放置，而不是放在 C# 中 `.Append()` 读起来顺手的位置。** 这不是风格偏好——顺序搞错就会复现 ISSUE-012/ISSUE-013：`minimax-docx validate` 仍然报告 `PASSED`，LibreOffice 仍然干净地渲染文件，而真实 Word 仍然会以兼容模式打开，并在整个文档中散布未经请求的格式。当前代码已经在每个构造位置（`RunProps`、`Para`、
`BuildTable`）带有 schema 顺序注释——请在原有属性列表中就地扩展，而不是追加在其后；如果你添加一个真正的新元素，请先在 `openxml_element_order.md`
（minimax-docx）中查找它的位置，再决定 `.Append()` 调用应放在哪里。在任何此类更改之后，重新运行验证协议的 Step 3a（真实 Word，而不只是 LibreOffice）——这是整条链路中唯一能够捕获这类 bug 的检查。

## 参考资料

- `references/word-to-pdf.md` — 现有 Word 源文件、摘录选择、接受的修订、布局修复和 PDF 交付；不进行 Markdown 往返转换。
- `references/known_issues.md` — 构建此流水线时遇到的每个陷阱的症状 / 根因 / 修复 / 验证。调试任何问题前请先阅读。
- `references/verification_protocol.md` — 完整的端到端验证链、其前置条件、通过标准，以及禁止使用的替代方案。
- `scripts/README.md` — 如何运行生成器、其支持的 markdown、环境要求。