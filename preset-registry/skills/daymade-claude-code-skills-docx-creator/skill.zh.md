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

**`minimax-skills:minimax-docx`** 之上的轻量增量层。它不是文档引擎。

> **请先阅读这里。** OpenXML SDK 能力位于 `minimax-docx` 中。本技能不包含任何引擎代码。
> 它所包含的，是经过一整个调试过程才总结出的内容：该引擎的 CLI 在哪里达到能力极限、
> 如何正确使用其 SDK 处理中文正式文档，以及如何验证输出，避免交付一个在你看来正常、
> 但在 Word 中显示异常的文件。

## 职责划分

| 层级 | 负责人 | 包含的内容 |
|---|---|---|
| OpenXML SDK (`DocumentFormat.OpenXml`)、`WordprocessingDocument` API、XSD 验证器、样式模板、OpenXML 百科资料 | **`minimax-skills:minimax-docx`** | 引擎 + 参考文档。绝不在此处重复。 |
| CLI 的表达能力上限在哪里，以及何时应放弃它而改用 C# | **本技能** | ISSUE-001、ISSUE-002 |
| 经过验证、用于中文正式文档的 markdown-to-docx 生成器 | **本技能** | `scripts/Program.cs` |
| OpenXML 很容易配置错误的中文正式文档排版规则 | **本技能** | 下文的硬性规则 + ISSUE-004…007 |
| 真正的端到端可视化验证链路 | **本技能** | `references/verification_protocol.md` |

请在插件市场的安装路径中查找该引擎，通常为
`~/.claude/plugins/marketplaces/minimax-skills/skills/minimax-docx/`。

对于本技能未涵盖的任何结构性内容，**请直接阅读 minimax-docx**——包括图片、
修订、批注、目录、多节布局、模板应用。其 `minimax-docx/references/` 文件夹
（`cjk_typography.md`、`openxml_element_order.md`、`openxml_units.md`、
`troubleshooting.md`）及其 `Samples/*.cs` 是 SDK 模式的权威参考。
不要在这里重新实现它们。

## 路由：此文档应选择哪条路径？

| 情况 | 路径 |
|---|---|
| 中文合同 / 协议 / 公文 / 任何包含甲乙方信息块、编号条款、签字区、表格的文档 | **通过 `scripts/Program.cs` 使用 C# OpenXML**（本技能） |
| 仅包含普通正文、标题和段落，没有加粗 / 列表 / 表格 | 使用 minimax-docx CLI `create --content-json` 即可 |
| 填充或编辑**现有的** .docx | minimax-docx 流程 B（`edit-content`）——本技能没有可补充的内容 |
| 匹配现有 .docx 的格式 | minimax-docx 流程 C（`apply-template`） |
| 输出应为 **PDF**，而不是 Word | `daymade-docs:pdf-creator`——技能选择错误，到此为止 |

经验法则：CLI 的 `--content-json` 只支持三种块类型
（`heading`、`paragraph`、`pagebreak`）。加粗、列表、表格、边框、页脚、字体、
对齐——这些全都无法表达。而中文合同需要其中所有功能。参见 ISSUE-001。

## 快速开始

生成器读取 markdown 并写入格式化的 .docx。请将它复制到文档旁边，以免构建产物留在技能目录中：

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

完整的命令详情和故障排除方法：`scripts/README.md`。
完整的验证步骤和通过/失败标准：`references/verification_protocol.md`。

## 硬性规则（违反其中任何一条都意味着需要返工）

### 1. 对齐是分层的——这是代价最高的一项

绝不要对整个文档使用两端对齐。三个层级，三种对齐方式：

| 内容 | 对齐方式 | 原因 |
|---|---|---|
| 文档标题（H1） | 居中 | 惯例 |
| 条款标题（H2+） | 左对齐 | 惯例 |
| **信息块和签名块**——甲方/乙方/统一社会信用代码/法定代表人/日期，即任何行之间通过 Markdown 软换行或硬换行连接的段落 | **左对齐** | 两端对齐会拉伸**除段落最后一行之外的每一行**。多行信息块是*一个*段落，因此除最后一行外，所有行都会被拉开，产生巨大的字符间距。 |
| 普通正文 | 两端对齐（`Both`） | 使右边缘整齐 |

该规则可通过机器检查，因此不要依靠目测：如果 Markdown 段落的内联树
包含 `LineBreakInline`，则将该段落左对齐；否则使用两端对齐。此逻辑实现在
`Main` 的块分派 switch 中的 `case ParagraphBlock p:` 分支内，换行检测则位于
`InlineRuns` 中。（此处有意不提供行号——文件每次增长时行号都会变化；
请改为参阅 `scripts/README.md` 中按函数名查找的对照表。）完整说明：ISSUE-004。

### 2. 每个列表都从 1 重新开始

每个 Markdown 列表都必须拥有其**自己的** `NumId`，并附带一个包含
`StartOverrideNumberingValue = 1` 的 `LevelOverride`。如果跨条款复用同一个 `NumId`，
第 3 条中的列表会悄无声息地从 4 继续编号。此逻辑由 `case ListBlock lb:` 分支和
`NumberingDefinitionsPart` 设置共同实现——两者均可参阅 `scripts/README.md` 中的对照表。
其中还涉及两个 SDK 陷阱（类名错误、元素顺序错误）——ISSUE-005、ISSUE-006。

### 3. CJK 字体需要同时设置两个字槽

文本 run 必须设置 `RunFonts { Ascii, HighAnsi, EastAsia }`。如果只设置拉丁字槽，
中文字符就会使用 Word 的后备字体，文档最终会采用阅读者机器上自行选择的字体进行渲染。
内置默认值：拉丁文字使用 `Times New Roman`；东亚文字的正文使用宋体，标题使用黑体。
字号采用 OpenXML 半磅值——正文 24（12pt），H1 36（18pt），条款标题 28
（14pt）。ISSUE-007。

### 4. 页面和表格基础要求

A4 尺寸为 11906 × 16838 twip，页边距为 1440 twip；页码放在居中的页脚
`PAGE` 字段中。表格需要全部六种边框（`top`/`bottom`/`left`/`right`/`insideH`/`insideV`，
并按该 ECMA-376 顺序排列——ISSUE-013），还需要一个 `tblGrid`（ISSUE-012）——边框设置不足
会导致单元格在打印时看起来没有边框；省略 `tblGrid` 会使文件无法通过严格验证，即使
LibreOffice 会掩盖这一问题。此逻辑实现在 `BuildTable` 中，以及 `Main` 内的
`SectionProperties`/`FooterPart` 设置中——请参阅 `scripts/README.md` 中的对照表。

## 验证不是可选项

**禁止使用 `qlmanage` 缩略图作为视觉验证依据。** macOS 快速查看使用的渲染引擎与 Word
不同，即使文档中的信息块被拉伸得四分五裂，它仍可能显示出看似整洁的页面。曾有一份文档
根据 qlmanage 的证据被宣布为“验证完美”，但在 Word 中打开时版式却是损坏的——这正是
制定此规则的原因。ISSUE-008。

**必需流程：** 生成 → XSD 验证 → `soffice --headless --convert-to pdf` →
`pdftoppm -png` → 使用 `Read` 检查每一页图像 → 检查五种失败模式
（信息块未被拉伸 / 每个列表均从 1 重新开始 / 表格边框存在 / 签名
块完整 / 无孤立分页）→ **如果已安装 Microsoft Word.app，请用它打开实际
文件，检查标题栏中是否出现“兼容性模式”，并检查每一页**。详细信息、先决条件
以及“哪些情况算作失败”的列表见：`references/verification_protocol.md`。

**LibreOffice 渲染无异常，并不等同于“Word 能正确渲染此文件”。**
ISSUE-012 是一个真实且已复现的案例：某个文件通过了此流程中所有基于 LibreOffice
的检查——信息块正常、编号正确、表格完整——但在真正的 Word 中打开时，标题栏仍显示
“兼容性模式”，而且从未设置任何编号的段落上出现了幽灵项目符号。LibreOffice 没有
等效的回退路径，因此从结构上就无法暴露这类缺陷。这正是 ISSUE-008 的教训（宽松的
渲染器会掩盖 Word 的实际行为）在更高一层上的重演；只要可以直接使用 Word 进行检查，
就应将仅使用 LibreOffice 的验证视为不完整。

**覆盖已交付的 .docx 之前**，请检查是否存在同目录的 `~$<name>.docx`——这是 Word 的
所有者锁，意味着接收者仍打开着旧版本。覆盖操作可以成功，但他们在关闭并重新打开文件
之前，看到的仍会是过期文档。请告知他们。参见 ISSUE-011。

## 自定义

`scripts/Program.cs` 是约 260 行直观易懂的 OpenXML 代码。若要调整字体、字号、
间距、边框或新增块类型，请直接编辑该文件——这就是预期的工作流程。在添加结构性
功能（图像、目录、页眉、修订）之前，请先阅读 minimax-docx 中对应的
`Samples/*.cs`；这些模式已经过相应 SDK 版本的验证，可避免陷入反复修复编译错误的循环。

**如果要向 `RunProperties`、`ParagraphProperties`、`TableProperties`、
`TableCellProperties` 或 `TableBorders` 追加新属性：它必须遵循 ECMA-376 为该父元素
规定的子元素顺序，而不能仅仅放在 C# 中 `.Append()` 写起来最顺手的位置。** 这并非
风格偏好——如果顺序错误，就会重现 ISSUE-012/ISSUE-013：`minimax-docx validate` 仍然
报告 `PASSED`，LibreOffice 仍然可以正常渲染文件，而真正的 Word 仍会以兼容模式打开
文件，并在文档各处散布未经请求的格式。当前代码已在每个构造位置（`RunProps`、`Para`、
`BuildTable`）包含架构顺序注释——请在现有属性列表中的适当位置进行扩展，而不是追加到
列表末尾；如果添加的是全新元素，请先在 `openxml_element_order.md`（minimax-docx）中
查找它的位置，再决定 `.Append()` 调用应放在哪里。完成任何此类更改后，请重新执行验证
协议中的步骤 3a（使用真正的 Word，而不仅仅是 LibreOffice）——这是整个流程中唯一能够
捕获此类错误的检查。

## 参考资料

- `references/known_issues.md` — ISSUE-001…013：构建此流水线时遇到的每个陷阱的症状 /
  根本原因 / 修复方法 / 验证方式。调试任何问题前请先阅读。
- `references/verification_protocol.md` — 完整的端到端验证流程、其先决条件、
  通过标准，以及禁止使用的替代方案。
- `scripts/README.md` — 如何运行生成器、它支持哪些 Markdown 语法、环境
  要求。