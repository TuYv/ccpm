---
name: docx-creator
description: >-
  Produce production-grade Word (.docx) documents — especially Chinese ones — by driving the
  minimax-skills:minimax-docx OpenXML engine correctly. Use whenever the deliverable is a .docx
  file: 生成 Word 文档 / 做一份 docx / 写合同 docx / 起草协议 / 正式文书 / 公文 / offer / 劳动合同 /
  把 markdown 转成 Word / Word 排版 / 中文排版 / 签字栏 / 盖章版 / 甲方乙方, or any plain
  "give me a Word file" request. This skill adds the layer minimax-docx does not ship: a verified
  markdown-to-docx OpenXML generator, the alignment-layering rule that stops justified text from
  stretching 甲方/乙方 info blocks and signature blocks into garbage, per-list numbering restart,
  CJK font dual-slot setup, and a mandatory LibreOffice-to-PDF-to-PNG visual verification chain
  (qlmanage thumbnails are banned — they hide exactly the bugs that matter). Engine belongs to
  minimax-docx; correct usage and the field-tested workarounds belong here. For PDF output use
  daymade-docs:pdf-creator instead — the two pipelines are intentionally orthogonal.
---
# DOCX 创建器

基于 **`minimax-skills:minimax-docx`** 的轻量增量层。它不是文档引擎。

> **请先阅读此部分。** OpenXML SDK 功能位于 `minimax-docx` 中。本技能不包含
> 任何引擎代码。它所包含的是经过一整个调试过程才总结出的经验：
> 该引擎的 CLI 在何处达到可用性极限、如何正确使用其 SDK 生成中文正式
> 文档，以及如何验证输出，避免交付一个在你看来正常、但在 Word 中显示异常的文件。

## 职责划分

| 层 | 负责人 | 包含的内容 |
|---|---|---|
| OpenXML SDK (`DocumentFormat.OpenXml`)、`WordprocessingDocument` API、XSD 验证器、样式模板、OpenXML 百科全书 | **`minimax-skills:minimax-docx`** | 引擎 + 参考文档。绝不在此重复。 |
| CLI 的表达能力上限在哪里，以及何时应放弃它并改用 C# | **本技能** | ISSUE-001、ISSUE-002 |
| 已验证的中文正式文档 markdown-to-docx 生成器 | **本技能** | `scripts/Program.cs` |
| OpenXML 容易设置错误的中文正式文档排版规则 | **本技能** | 下方的硬性规则 + ISSUE-004…007 |
| 真正的端到端可视化验证链 | **本技能** | `references/verification_protocol.md` |

请在市场安装路径中查找该引擎，通常位于
`~/.claude/plugins/marketplaces/minimax-skills/skills/minimax-docx/`。

对于本技能未涵盖的任何结构性内容，**请直接阅读 minimax-docx**——包括图片、
修订、批注、目录、多节布局和模板应用。其
`minimax-docx/references/` 文件夹（`cjk_typography.md`、`openxml_element_order.md`、
`openxml_units.md`、`troubleshooting.md`）及其 `Samples/*.cs` 是 SDK
模式的权威参考。不要在此重复造轮子。

## 路由：此文档应采用哪条路径？

| 情况 | 路径 |
|---|---|
| 中文合同 / 协议 / 公文 / 任何包含甲乙方信息块、编号条款、签字区、表格的文档 | **通过 `scripts/Program.cs` 使用 C# OpenXML**（本技能） |
| 仅含普通正文、标题和段落，不包含粗体 / 列表 / 表格 | 使用 minimax-docx CLI `create --content-json` 即可 |
| 填充或编辑**现有的** .docx | minimax-docx 流程 B（`edit-content`）——本技能没有可补充的内容 |
| 匹配现有 .docx 的格式 | minimax-docx 流程 C（`apply-template`） |
| 输出应为 **PDF**，而不是 Word | `daymade-docs:pdf-creator`——技能选错了，请在此停止 |

经验法则：CLI 的 `--content-json` 仅支持三种块类型
（`heading`、`paragraph`、`pagebreak`）。粗体、列表、表格、边框、页脚、字体、
对齐方式——这些都无法表达。而中文合同需要所有这些功能。请参阅 ISSUE-001。

## 快速开始

生成器读取 markdown 并写入格式化的 .docx。请将其复制到文档旁边，以便
构建产物不会进入技能目录：

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

完整的命令详情和故障排除说明：`scripts/README.md`。
完整的验证步骤和通过/失败标准：`references/verification_protocol.md`。

## 硬性规则（违反即需返工）

### 1. 对齐方式分层处理——这是代价最高的一项

切勿将整个文档设为两端对齐。三个层级，三种对齐方式：

| 内容 | 对齐方式 | 原因 |
|---|---|---|
| 文档标题（H1） | 居中 | 惯例 |
| 条款标题（H2+） | 左对齐 | 惯例 |
| **信息块和签字盖章块**——甲方/乙方/统一社会信用代码/法定代表人/日期，即行与行之间通过 Markdown 软换行或硬换行连接的任何段落 | **左对齐** | 两端对齐会拉伸**除段落最后一行之外的每一行**。多行信息块属于*一个*段落，因此除最后一行外，其他所有行都会被拉开，产生巨大的字符间距。 |
| 普通正文 | 两端对齐（`Both`） | 右侧边缘整齐 |

此规则可由机器检查，因此不要依靠目测：如果 Markdown 段落的内联树
包含 `LineBreakInline`，则将该段落设为左对齐；否则设为两端对齐。该逻辑在
`Main` 的块分派 switch 的 `case ParagraphBlock p:` 分支中实现，换行检测则在
`InlineRuns` 中实现。（此处特意不提供行号——文件每次增长时行号都会变化；
请改用 `scripts/README.md` 中的函数名查找表。）完整说明：ISSUE-004。

### 2. 每个列表都从 1 重新开始

每个 Markdown 列表都必须获得其**专属**的 `NumId`，以及一个包含
`StartOverrideNumberingValue = 1` 的 `LevelOverride`。如果跨条款复用同一个 `NumId`，
第 3 条的列表会悄然从 4 继续编号。该逻辑分布在 `case ListBlock lb:` 分支和
`NumberingDefinitionsPart` 设置中实现——两处位置均请参阅 `scripts/README.md` 的查找表。
这里还涉及两个 SDK 陷阱（类名错误、元素顺序错误）——ISSUE-005、ISSUE-006。

### 3. CJK 字体需要同时设置两个字体槽

文本运行必须设置 `RunFonts { Ascii, HighAnsi, EastAsia }`。仅设置拉丁字体槽会使
中文字符使用 Word 的回退字体，导致文档采用阅读者机器所选择的任意字体进行渲染。
内置默认值：拉丁文字使用 `Times New Roman`；东亚文字的正文使用宋体，标题使用
黑体。中文**粗体文本运行改用黑体**——宋体没有真正的粗体字重，而渲染器合成的粗体
会使多笔画字符变得模糊（ISSUE-014）。字号使用 OpenXML 半磅值——正文 21（10.5pt，
常用中文公文正文字号），H1 36（18pt），条款标题 28（14pt）。正文段落还应设置
2 字符的首行缩进（10.5pt 下为 `420` twips——调整正文字号时必须同步调整此值）。
ISSUE-007。

### 4. 页面和表格基础设置

A4 纸张尺寸为 11906 × 16838 twips，页边距为 1440 twips；页码应放在居中的页脚
`PAGE` 字段中。表格需要设置全部六种边框（`top`/`bottom`/`left`/`right`/`insideH`/`insideV`，
并按此 ECMA-376 顺序排列——ISSUE-013），还需要一个 `tblGrid`（ISSUE-012）——边框设置不全
会导致单元格在打印时看起来没有边框；缺少 `tblGrid` 则会使文件无法通过严格验证，即使
LibreOffice 会掩盖这个问题。该逻辑在 `BuildTable` 以及 `Main` 中的
`SectionProperties`/`FooterPart` 设置中实现——请参阅 `scripts/README.md` 的查找表。

## 验证不是可选项

**禁止使用：将 `qlmanage` 缩略图作为视觉验证证据。** macOS 快速查看使用的渲染引擎与 Word 不同，即使文档中的信息块被拉伸分散，它也很可能显示出看似整洁的页面。曾有一份文档根据 qlmanage 的证据被宣布为“验证完美”，但在 Word 中打开时却是损坏的——这正是制定此规则的原因。ISSUE-008。

**必需流程：**生成 → XSD 验证 → `soffice --headless --convert-to pdf` →
`pdftoppm -png` → 对每一页图像执行 `Read` → 检查五种失败模式
（信息块未被拉伸 / 每个列表都从 1 重新开始 / 表格边框存在 / 签名
块完整 / 没有孤立分页）→ **如果安装了 Microsoft Word.app，则用它打开实际
文件，检查标题栏中是否出现“兼容性模式”，并检查每一页**。详细信息、前置条件
以及“哪些情况算作失败”的列表：`references/verification_protocol.md`。

**LibreOffice 渲染无误，并不等同于“Word 能正确渲染此文件”。**
ISSUE-012 是一个真实且已复现的案例：某个文件通过了此流程中所有基于 LibreOffice
的检查——信息块整洁、编号正确、表格完整——但在真正的 Word 中打开时，标题栏中
仍然出现“兼容性模式”，而且从未设置任何编号的段落上出现了幽灵项目符号标记。
LibreOffice 没有与之等效的回退路径，因此在结构上无法暴露此类缺陷。这是 ISSUE-008
本身的教训（宽松的渲染器会掩盖 Word 的行为）在更高一层的重演；只要可以直接使用
Word 进行检查，就应将仅使用 LibreOffice 的验证视为不完整。

**覆盖已交付的 .docx 之前**，检查是否存在同级的 `~$<name>.docx`——这是 Word 的
所有者锁，表示接收者仍打开着旧版本。覆盖操作可以成功，但在他们关闭并重新打开
文件之前，看到的仍会是旧文档。请告知他们。ISSUE-011。

## 自定义

`scripts/Program.cs` 包含约 260 行直观易懂的 OpenXML 代码。若要修改字体、
字号、间距、边框或添加新的块类型，请直接编辑该文件——这就是预期的工作流程。
在添加结构性功能（图像、目录、页眉、修订）之前，请先阅读 minimax-docx 中对应的
`Samples/*.cs`；这些模式已经过相应 SDK 版本的验证，可以避免反复陷入编译错误。

**如果向 `RunProperties`、`ParagraphProperties`、`TableProperties`、
`TableCellProperties` 或 `TableBorders` 追加新属性：它必须遵循 ECMA-376 为该
父元素规定的子元素顺序，而不能仅仅按照 C# 中 `.Append()` 写起来最自然的位置放置。**
这并非风格偏好——如果顺序错误，就会重现 ISSUE-012/ISSUE-013：`minimax-docx validate`
仍会报告 `PASSED`，LibreOffice 仍会正确渲染文件，而真正的 Word 仍会以兼容模式
打开文件，并在整个文档中散布并未要求的格式。当前代码已在每个构造位置
（`RunProps`、`Para`、`BuildTable`）附有架构顺序注释——请在现有属性列表中的
适当位置扩展，而不是追加到列表末尾；如果要添加真正的新元素，请先在
`openxml_element_order.md`（minimax-docx）中查找它的位置，再决定 `.Append()`
调用应放在哪里。完成任何此类更改后，请重新执行验证协议的第 3a 步（使用真正的
Word，而不仅仅是 LibreOffice）——这是整个流程中唯一能够发现此类错误的检查。

## 参考资料

- `references/known_issues.md` — ISSUE-001…013：构建此流水线时遇到的每个陷阱的症状 / 根本原因 / 修复方法 / 验证方式。在调试任何问题之前请先阅读。
- `references/verification_protocol.md` — 完整的端到端验证链、其前置条件、通过标准，以及禁止使用的替代方案。
- `scripts/README.md` — 如何运行生成器、其支持的 Markdown 语法，以及环境要求。