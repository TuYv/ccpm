---
name: pdf-creator
description: Convert markdown files to professional PDF documents with proper Chinese font support, theme system, and visual self-check. Use for Markdown → PDF, printable Markdown documents, and Markdown formatted for print or mobile reading. Prefer its CJK typography, header/footer suppression, and visual verification over manual pandoc/Chrome commands. Scope is Markdown → PDF only. Existing Word/WPS → PDF, including manuscript excerpts and layout repair, routes to daymade-docs:docx-creator; do not round-trip an authoritative Word manuscript through Markdown. Word output also routes to docx-creator.
---
# PDF Creator

从 markdown 创建支持中文字体和主题系统的专业 PDF 文档。

对于现有的 `.docx` 源文件，请改用 `docx-creator/references/word-to-pdf.md`。
根据权威输入以及输出后缀进行选择。

## Quick Start

以下每个 `scripts/…` 路径都**相对于此 skill 自身的目录**，请从该目录运行命令，或替换为绝对路径。从存放 markdown 的目录运行会失败，并显示 `Failed to spawn: 'scripts/md_to_pdf.py'`。可以省略输出路径，程序会根据输入文件的基本名称生成输出路径（`input.md` → `input.pdf`，并保存在输入文件所在目录）。

```bash
# Default theme (formal: Songti SC + black/grey, A4 print)
uv run --with weasyprint scripts/md_to_pdf.py input.md output.pdf

# Warm theme (training: PingFang SC + terra cotta)
uv run --with weasyprint scripts/md_to_pdf.py input.md --theme warm-terra

# Mobile theme (narrow page, large font — for phone reading / WeChat sharing)
uv run --with weasyprint scripts/md_to_pdf.py input.md --theme mobile

# Batch convert all markdown files with a specific theme
uv run --with weasyprint scripts/batch_convert.py *.md --theme warm-terra --no-preview

# No weasyprint? Use Chrome backend (auto-detected if weasyprint unavailable)
python scripts/md_to_pdf.py input.md --theme warm-terra --backend chrome

# List available themes
python scripts/md_to_pdf.py --list-themes dummy.md
```

## Themes

存储于 `themes/*.css` 中。每个主题都是独立的 CSS 文件。

| 主题 | 页面尺寸 | 字体 | 颜色 | 适用场景 |
|-------|-----------|------|-------|----------|
| `default` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 法律文档、合同、正式报告 |
| `cjk-auto` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 列内容不均匀的表格（课程安排、明细列表） |
| `warm-terra` | A4 | PingFang SC | Terra cotta (#d97756) + 暖色中性色 | 课程大纲、培训材料、工作坊 |
| `warm-terra-menu` | A4 | PingFang SC | Terra cotta (#d97756) + 暖色中性色 | 针对模块菜单/列表优化的 warm-terra 变体：包含长文本的两列表格会换行，避免第一列溢出；Menlo unicode-range 可确保 CJK 行内代码不会在 Preview/Adobe 中渲染为空白 |
| `mobile` | 148mm × 210mm | PingFang SC | Terra cotta + 暖色中性色 | 手机阅读、微信分享、移动场景下的参考资料 |

要创建新主题：复制 `themes/default.css`，进行修改，然后保存为 `themes/your-theme.css`。

## Print vs Mobile: Choose the Right Theme

| 场景 | 推荐主题 | 原因 |
|----------|-------------------|-----|
| 在 A4 纸张上打印、讲义、合同 | `default` | 标准页面尺寸，正式的排版 |
| 培训材料、课程大纲 | `warm-terra` | 暖色强调色，适合工作坊场景阅读 |
| 通过微信发送、在手机上阅读 | `mobile` | 窄页面（148mm）、15px 字体、1.9 的行高，在小屏幕上阅读舒适 |
| 同时需要打印版和移动版 | 使用不同主题运行两次 | 此 skill 运行速度快，可以生成两个版本 |

**决策规则：**如果用户未作说明，则培训/课程内容默认使用 `warm-terra`，正式文档默认使用 `default`；但当文档表格的各列内容长度不均衡时（时间表、明细列表），应优先选择 `cjk-auto` 而不是 `default`，因为该主题设置 `table-layout: auto` 正是为此用途。仅当输出渠道不明确时，才询问“是否需要手机版？”

## 后端

脚本会根据**内容 × 主题**自动检测最佳可用后端——主题这一半很重要，因为 CJK 之所以需要 Chrome，是由主题字体栈的属性决定的，而不是因为文本是中文：

- **CJK + Songti/Heiti 主题**（`default`、`cjk-auto`）→ **weasyprint**。这些主题会嵌入 CID TrueType，所有阅读器都能渲染，因此 Chrome 没有任何收益，反而会产生下文所述的裁剪问题。
- **CJK + PingFang 主题**（`warm-terra`、`mobile`、`warm-terra-menu`，以及不在安全列表中的任何主题）→ **Chrome**。weasyprint 会将 PingFang SC 子集嵌入为 CID Type 0C OpenType，macOS Preview / Adobe Reader 无法渲染——即使 Chrome 自己的 PDF 查看器显示正常，接收者设备上仍会出现乱码。
- **非 CJK 内容** → **weasyprint**（速度更快，无需启动浏览器）。

路由由 `scripts/tests/test_backend_routing.py` 固定。你自行添加的主题会被视为 PingFang 类主题，直到将其添加到 `md_to_pdf.py` 中的 `_WEASYPRINT_SAFE_CJK_THEMES`；只有确认其 CJK 字体使用 CID TrueType 后，才应执行此操作。

| 后端 | 安装 | 优点 | 缺点 |
|---------|---------|------|------|
| `weasyprint` | `pip install weasyprint` | CSS 渲染精准，无需浏览器，不会裁剪溢出内容 | 会将 PingFang SC 子集化为 CID Type 0C，在 Preview/Adobe 中无法读取 |
| `chrome` | 已安装 Google Chrome | 零 Python 依赖，能正确渲染 PingFang | **会裁剪超出 @page 框的所有内容**（见下文） |

可使用 `--backend chrome` 或 `--backend weasyprint` 覆盖；显式指定的标志始终优先于自动检测结果。

**主题不会告诉你实际运行的是哪个后端。**当 weasyprint 无法导入时，`default` / `cjk-auto` 渲染会回退到 Chrome——stderr 中会显示警告，但退出码仍为 0。读取 `Generated:` 行中的 `backend=` 字段，即可确认实际使用的后端；决定是否应用下面仅适用于 Chrome 的步骤的是该字段，而不是主题名称。

### Chrome 会裁剪，而不只是溢出

Chrome 会在 `@page` 内容框处为每页包裹一个 `re W* n` 裁剪路径。超出该框的内容仍位于 PDF 的对象层中，但**永远不会被绘制**。在 A4 页面、使用 `margin: 2.5cm 2cm 2cm 2cm` 时测得：裁剪路径结束于 **538.90pt**，而表格右边框位于 **545.18pt** ——因此边框会被静默截断。

**这不是“宽表格”问题——在 `default` 和 `cjk-auto` 下，每个表格都会受到影响。**这些主题设置了 `table { table-layout: fixed; width: 100% }`，因此两列表格与十列表格会占据相同的完整内容宽度，其右边框也都会落在相同的 545.18pt 位置。实测表明：简单的 `| 周一 | 周二 |` 表格与六列费用明细表的裁剪情况完全相同。内容宽度并不重要；真正越过边界的是主题自身的 `width: 100%` 加上单元格内边距。

溢出本身是**有意设计的**：CJK 排版层将 `overflow-wrap: normal` 设置为特定值，使内容溢出，而不是在令牌中间断开（见下文“CJK 排版”）。这一权衡在 weasyprint 下是安全的，在 Chrome 下则会造成破坏性后果。

**之所以这个问题在多次交付中一直存在，并不是因为预览会说谎，而是因为这种症状看起来像是刻意为之。** 最后一列的文本是完整的，间距也正确；消失的只有一条极细的边框，看起来就像一种样式选择。同时，下面的视觉检查清单会让你下意识地寻找*被截断的文本*，而这里恰恰没有发生这种情况。

光栅化器确实会遵守裁剪，因此这个脚本已经生成的预览 PNG（130 dpi 的 `pdftoppm`）能够显示该缺陷，400 dpi 的渲染结果也同样如此；在 400 dpi 下，横跨预期边框的 25 个像素列完全没有墨迹。无法显示该缺陷的是任何读取坐标而不是像素的检查：`pdfplumber` 仍会在 545.18pt 处报告一个 rect，因为该对象确实存在。

不要依赖人工注意到缺失的细线边框，请运行检查。**它有两种形式，而对于 Chrome 渲染的 PDF，只有第二种形式可以作为判定依据。**

```bash
# Form 1 — one file. Compares ink against the PDF's own object layer.
uv run --with pdfplumber --with pillow --with numpy scripts/check_table_borders.py out.pdf
```

形式 1 会获取每个检测到的表格的列边界，统计这些边界中实际在 `pdftoppm` 光栅图像中有墨迹的数量；如果 PDF 中存在某个边界，但纸面上没有该边界，它会报告该边界并以非零状态退出。它会报告测量了多少个表格；如果没有找到任何表格，它会输出 `NOTHING CHECKED`，而不是 `PASS`：无法检测出其表格的文档并没有通过检查，而是被跳过了。

这些边界来自单元格网格，而不是原始的垂直边缘，因为 `<hr>` 的端帽和行内 `<code>` 跨度的背景，看起来与基于边缘的读取器识别出的列线完全相同。在对真实知识库生成的 49 份 WeasyPrint PDF 进行测量时，其中 46 份的几何结构曾被基于边缘的版本检查；该版本在这 46 份中有 34 份检查失败。剩余限制：对于其他工具生成的 PDF，`pdfplumber` 有时会把装饰元素拼装成一个实际上并不存在的表格，而检查会为该表格报告边线。对于并非由此 skill 生成的 PDF，应将失败视为提示你进行检查，而不是最终判定。

**它无法单独让 Chrome 渲染结果通过检查，因为裁剪会以两种不同的方式破坏证据。** Chrome 会保留*横跨*裁剪范围的几何对象，形式 1 可以捕获这种情况，因为该规则按约定应当存在却没有被绘制；但 Chrome 会丢弃完全位于裁剪范围*外部*的几何对象，而从未写入对象层的规则也就永远不会被检查。实测表明：一个使用垂直边线样式且没有单元格填充的表格，会打印出 `5/5 promised rules painted — PASS`，但其右边框实际上已经消失。内置主题只是碰巧避开了这个问题；它们的单元格背景填充会横跨裁剪范围，从而在边框所在位置留下边缘，供形式 1 查找。

因此，当主题将渲染路由到 Chrome 且文档包含表格时，请使用另一个后端渲染相同的源文件并进行比较：

```bash
# 形式 2 — 使用另一个后端渲染参考文件，然后进行比较。
# 使用与交付文件相同的 --theme；只有后端不同。
uv run --with weasyprint scripts/md_to_pdf.py doc.md /tmp/ref.pdf \
  --theme warm-terra --backend weasyprint --no-preview
uv run --with pdfplumber --with pillow --with numpy \
  scripts/check_table_borders.py out.pdf --reference /tmp/ref.pdf
```

退出代码：`0` 表示通过，`1` 表示至少有一项检查未通过，`2` 表示无法运行检查，`3` 表示未检测到表格，因此没有测量结果。**`3` 不算通过**：如果文档确实包含表格，说明其样式没有绘制出 `pdfplumber` 能找到的线条，因此该检查无法对其作出判断——请改为自行读取表格右边缘处的栅格图像，并在交接说明中注明该门禁未运行。`pdfplumber` 在处理子集 CJK 字体时会输出 `Could not get FontBBox from font descriptor`；这是解析器噪声，不是发现的问题。

参考文件是测量标尺，绝不是交付文件——它很可能存在最初促使该主题改用 Chrome 的 CID Type 0C 问题，但这不会影响其几何结构。

**两个文件都会进行墨迹检查，并且会双向比较线条数量**，因此传入文件的顺序无法决定是否检查受损文件。这一点比听起来更重要：对于 Chrome *裁剪掉* 而不是*丢弃*的边框，两次渲染的线条数量**相同**——几何结构仍然存在，只是没有被绘制出来——因此线条数量比较无法发现问题，只有对右侧文件进行的墨迹检查才能找到它。在参考文件也进行墨迹检查之前，将被裁剪的文件作为 `--reference` 传入会得到无条件的 PASS。

双向的数量比较规则如下：线条数量少于参考文件，表示渲染器丢弃了一些线条；数量更多，表示参数顺序颠倒，或两个文件不是同一份文档。比较数量而不是位置，并且进行整份文档范围的比较而不是逐页比较，因为两个后端会以不同方式拆分同一份源文件——在一张包含 60 行 CJK 内容的表格上测得，该表格的行内容决定了分页位置：`default` 主题下为 5 页与 3 页，`warm-terra-menu` 主题下为 3 页与 15 页，而线条数量始终相同。

通过 5 个主题、单页和多页场景以及两种参数顺序进行校准，共运行 20 次：其中 12 对不包含被裁剪文件的样本在两种顺序下都通过，包含被裁剪文件的 8 对样本在两种顺序下都被捕获。除此之外，对 14 份真实 Markdown 文档分别使用 2 个主题进行测试，共 28 次单文件运行，误报为零。

## 批量转换

```bash
# 默认主题，同一目录
uv run --with weasyprint scripts/batch_convert.py *.md

# 指定主题、输出目录，为提高速度跳过预览
uv run --with weasyprint scripts/batch_convert.py *.md --theme warm-terra --output-dir ./pdfs --no-preview

# 适合手机阅读的移动主题
uv run --with weasyprint scripts/batch_convert.py *.md --theme mobile --output-dir ./mobile-pdfs --no-preview

# 边框检查一次处理多个文件，因此批量转换仍会经过门禁检查
uv run --with pdfplumber --with pillow --with numpy \
  scripts/check_table_borders.py ./pdfs/*.pdf
```

`--no-preview` 会关闭视觉自检，这是批处理的意义所在，但不会关闭这项义务。按照上面的方式对输出执行边框检查。这需要多个文件；`--reference` 不需要，因此一批使用 Chrome 渲染且包含表格的文档，需要每个文档分别运行一对命令。

## 反模式：不要手动调用 pandoc + Chrome

**此技能存在的原因：** 手动执行 `pandoc input.md -o out.html` + `chrome --headless --print-to-pdf` 的工作流会以难以察觉的方式静默失败：

| 手动步骤 | 会出现的问题 | 此技能的修复方式 |
|---|---|---|
| `pandoc -o out.html` | 没有支持 CJK 的 CSS → 中文显示为方框或空白 | 注入 CJK 字体栈 + 排版修补 |
| Chrome `--print-to-pdf` | 出现默认页眉/页脚（文件名、日期、URL、页码） | 传递 `--no-pdf-header-footer` |
| 没有渲染后检查 | 假定“退出代码为 0”就表示成功；渲染错误被隐藏 | 自动生成每页 PNG 预览 + 排版 lint |
| 没有主题系统 | 一套方案适用于所有场景；无法在手机上阅读 | 三种经过整理的主题（default / warm-terra / mobile） |
| 缺少 `batch_convert.py` | 编写临时循环，使用不一致的标志 | 内置支持 `--theme` 的批处理模式 |

**规则：** 对于 Markdown → PDF，请使用此技能，而不要手动执行 pandoc/Chrome 命令。  
对于现有的 Word/WPS → PDF，请使用上面的 docx-creator 路径。

## 故障排除

**中文字符显示为方框**：确保已安装中文字体（Songti SC、PingFang SC 等）。

**weasyprint 导入错误**：使用 `uv run --with weasyprint` 运行，或改用 `--backend chrome`。

**CJK 文本在代码块中乱码（weasyprint）**：脚本会自动检测包含中日韩字符的代码块，并将其转换为使用支持 CJK 字体的样式化 div。如果仍然存在问题，请使用具有原生 CJK 支持的 `--backend chrome`；但如果文档包含任何表格，请使用 `scripts/check_table_borders.py <the chrome pdf> --reference <a weasyprint render of the same source>` 清理结果——先写 subject，再写 flag——因为 Chrome 会裁剪超出 `@page` 框的表格边框，而单文件形式无法识别 Chrome 丢弃的边框，而不是被裁剪的边框（参见上面的“Chrome 会裁剪，而不仅仅是溢出”）。或者，在生成 PDF 之前将代码块转换为 Markdown 表格。

**出现 Chrome 页眉/页脚**：脚本会传递 `--no-pdf-header-footer`。如果仍然出现，可能是你的 Chrome 版本不支持此标志——请更新 Chrome。**注意：** 如果你绕过此技能并使用了手动 Chrome headless，这是第一个症状——请参见上面的“反模式”部分。

**包含混合 CJK + ASCII 的行内代码在 macOS Preview 中显示空白**（例如 `` `Terminal/终端` `` 只渲染 `Terminal/`，CJK 部分缺失）：weasyprint 会将 PingFang SC 子集嵌入为 **OpenType (CID Type 0C)**，而严格的 PDF 阅读器（macOS Preview / Adobe Reader）无法渲染它。Chrome 的 PDF 查看器会自动回退，从而掩盖该问题。默认主题中已经修复：代码字体的 font-family 链会在 OpenType 字体（PingFang SC）之前，优先使用 **CID TrueType** CJK 字体（Songti SC / Heiti SC）。验证方法：使用 `pdfplumber` + 检查 CJK 字符的 `font['fontname']`——如果其中任何字符引用了 `PingFang-SC`（CID Type 0C OT），阅读器很可能无法渲染。重新排列字体链，将 CID TrueType 放在前面。

**带有短标签的表格第 1 列会在中间断行**（例如 `4/28（周|二）下|午`）：pandoc 会根据 Markdown 分隔行中的短横线数量自动生成 `<colgroup><col style="width:X%">`。对于 `| ----- | --- | --- | -------- |`（短横线宽度不均），pandoc 会将第 1 列分配为约 17% 的宽度，对于 9 个字符的 CJK 标签来说过窄。内联 `style=""` 在相同 specificity 下优先级高于外部 CSS，因此 `td:first-child { width:... }` 会被静默覆盖。修复已加入默认主题：`table colgroup col { width: auto !important }` 会抵消 pandoc 的提示，使 `table-layout: fixed` 能够平均分配宽度（对于 4 列表格，每列 25%）。验证方式：`pandoc input.md -t html | grep colgroup` ——如果显示 `<col style="width:X%">`，则此问题适用。**范围：**该中和规则仅存在于 `default.css` 中；`warm-terra` 和 `mobile` 主题采用不同策略（对 th/td 使用 nowrap，并允许最后一列换行；以及分别使用完整流式换行），因此有意省略了该规则。该中和规则由 `scripts/tests/test_cjk_tables.py::test_default_theme_neutralizes_pandoc_colgroup_hint` 锁定。

## 视觉自检（强制执行，不得跳过）

**这不是可选项。**每次生成 PDF 后，脚本会自动：

1. 通过 `pdftoppm`（poppler-utils）将每一页转换为 PNG，并写入**系统临时目录**下的 `<pdf-name>/` 子目录（**不会**写在 PDF 旁边；预览图只是一次性自检产物，绝不能残留在工作树或 git 仓库中）。运行结束后会打印确切路径：`Previews: <path>/page-NN.png`；文件名为 `page-1.png`、`page-2.png`……不带前导零
2. 打印结构化的自检清单，提醒调用方检查每一页
3. 运行排版 lint，以检测 CJK 换行反模式

**为什么必须执行：**“PDF 已干净生成”≠“渲染结果符合 Markdown 意图”。常见的静默失败包括：

- 段落合并为一段（连续的非空行会触发 CommonMark 软换行）
- 表格溢出页面边距
- 表格缺少右边框，但文本仍然完整（Chrome 裁剪，这是此列表中唯一一个看起来不像失败的情况；由 `scripts/check_table_borders.py` 判定，并且对于 Chrome 渲染，只有其 `--reference` 形式可以作为裁决）
- 缺少 CJK / emoji 字形
- 代码块乱码
- Chrome 默认页眉/页脚（如果绕过了此 skill）

**工作流**，在生成和交付之间的暂停点执行以下两个步骤，且第二步不能由第一步替代：

1. **阅读页面。**在打印出的 `Previews:` 路径下使用 **Read** 读取每个 `page-N.png`，并对照 Markdown 源文件进行核验。如果任何内容的渲染结果与意图不同，**修复 Markdown**（使用 `- ` 形式的真实列表，而不是伪列表；插入空行；重构表格），然后重新运行。脚本不会静默“修复”非标准 Markdown ——那样会掩盖源文件错误，导致同一 Markdown 在其他处理器（Obsidian、GitHub、VS Code 预览）中仍然错误渲染。

2. **如果文档包含任何表格，请对 PDF 运行 `scripts/check_table_borders.py`**；如果渲染经过 Chrome，请运行其 `--reference` 形式，因为在那里只有该形式可以作为裁决（两种形式都在上文“Chrome 会裁剪，而不只是溢出”中有所说明）。第 1 步不能替代此步骤。缺少边框看起来像一种样式选择，而第 1 步中的清单会让你重点寻找文本被截断的情况，恰恰不会发生这种情况。不要仅凭第 1 步就交付包含表格的 PDF。

这两个步骤都无法捕获所有问题。PNG 来自 `pdftoppm`，它会渲染 CID Type 0C 字体，而 macOS Preview 和 Adobe Reader 会将这类字体显示为空白。因此，字体嵌入缺陷可能在步骤 1 中看起来完全正常，却在接收者的机器上无法阅读。该问题通过主题路由处理，而不是通过目视检查处理（参见“Backends”）；需要手动运行的检查位于 Troubleshooting 下的“Inline code with mixed CJK + ASCII”。

在批处理或非交互式运行中，使用 `--no-preview` **禁用**：

```bash
python scripts/md_to_pdf.py input.md output.pdf --no-preview
```

**需要** `pdftoppm`（macOS 上使用 `brew install poppler` 安装）。如果未安装，脚本会记录提示并跳过预览生成，但仍会生成 PDF。

## CJK 排版（默认行为）

脚本会自动应用两层 CJK 感知处理机制，**不会修改用户的 markdown 源文件或主题 CSS 文件**：

### 第 1 层：CSS 修补（自动注入，解决约 80% 的情况）

`_load_theme()` 会将 CJK 排版 CSS 修补内容追加到已加载的主题 CSS 中。该修补内容包括：

- `table { table-layout: fixed; width: 100% }` — 等宽列可防止 weasyprint 自动布局在相邻列内容多出 5 倍时，将其中一列压缩到约 10% 的宽度
- `td, th { word-break: keep-all; overflow-wrap: normal; line-break: strict }` — 不要将 CJK 字符拆开。`overflow-wrap: normal`（而不是 `break-word`）所编码的有意取舍是：允许内容略微溢出，而不是退回到词中间换行；其理由记录在 `md_to_pdf.py` 中的 `CJK typography patch (auto-injected` 注释块内，并由 `scripts/tests/test_cjk_tables.py` 固化
- `th { white-space: nowrap }` — 让较短的表头保持单行，从而使列宽更可预测

这会在不触碰用户源文件的情况下，静默修复最常见的反模式（单元格内容被强制拆分在 CJK 字符之间，导致每行只有一个字符）。用户磁盘上的主题 CSS 文件永远不会被修改。

### 第 2 层：排版 lint（渲染后检测，捕获其余问题）

生成 PDF 后，脚本会按页运行 `pdftotext -layout`，并依据“中文文案排版指北”（中文排版风格指南）扫描已知的 CJK 反模式：

- 单独一个 CJK 字符占据一行（即使经过第 1 层处理，单元格仍然过窄）
- 行尾是 `（`，下一行才出现后续内容（括号对断裂）
- 行首是 `）`（从前一组括号对中断裂而来）
- 以表示语意未完的标点 `、，；：` 结尾的短行

检测结果会输出到 stderr，并包含页码和行位置。它们是**警告，而不是错误**，PDF 仍会生成。作者看到检测结果后，可以自行决定：

1. 接受（例如，长文档中偶尔出现一个孤立字符可能是可以接受的）
2. 缩短有问题的单元格内容，使其适应列宽
3. 重构（例如，将较长的内容移到表格下方的段落中）

### 为什么不静默地自动修复所有问题？

第 2 层有意不修改 markdown。根据 CLAUDE.md 中“禁止隐式行为”的规则，静默重写非标准 markdown（例如将伪列表扩展为真正的列表）会掩盖源文件有误这一信号，导致相同的 markdown 在其他处理器中渲染错误。第 1 层是可接受的，因为它修补的是已有标准 markdown 的**渲染行为**（标准表格恰好被 weasyprint 以不完善的方式渲染 CJK 内容），而不是 markdown 源文件本身。

### 已知限制

当单元格内容仅略长于可用列宽时（例如，等分后，在宽度为 9 个字符的单元格中包含 10 个 CJK 字符），weasyprint 即使设置了 `keep-all`，仍会退回到强制换行。第 1 层无法修复此问题，第 2 层会捕获该问题，并提示作者缩短单元格内容或重新组织结构。