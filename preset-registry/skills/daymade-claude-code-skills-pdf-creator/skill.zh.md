---
name: pdf-creator
description: Convert markdown files to professional PDF documents with proper Chinese font support, theme system, and visual self-check. Use whenever the user asks to create PDFs, convert markdown to PDF, generate printable documents, or needs documents formatted for print or mobile reading. This skill MUST be used instead of manual pandoc/Chrome invocations — it handles CJK typography, Chrome header/footer suppression, and mandatory visual verification that manual approaches miss. **Scope — markdown → PDF only.** For Word (.docx) output use `daymade-docs:docx-creator`; this skill does not produce docx and the two pipelines are intentionally orthogonal.
---
# PDF 创建器

从 Markdown 创建支持中文字体和主题系统的专业 PDF 文档。

## 快速开始

下面所有 `scripts/…` 路径均**相对于此 skill 自身的目录**——请从该目录运行命令，或替换为绝对路径。从存放 markdown 的目录运行会失败，并显示 `Failed to spawn: 'scripts/md_to_pdf.py'`。可以省略输出路径，程序会根据输入文件的基本名称生成输出路径（`input.md` → `input.pdf`，输出到输入文件所在目录）。

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

## 主题

存储于 `themes/*.css` 中。每个主题都是独立的 CSS 文件。

| 主题 | 页面尺寸 | 字体 | 颜色 | 适用场景 |
|-------|-----------|------|-------|----------|
| `default` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 法律文档、合同、正式报告 |
| `cjk-auto` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 列内容长度不均的表格（课程表、明细列表） |
| `warm-terra` | A4 | PingFang SC | 赤陶色（#d97756）+ 暖色中性色 | 课程大纲、培训材料、工作坊 |
| `warm-terra-menu` | A4 | PingFang SC | 赤陶色（#d97756）+ 暖色中性色 | 针对模块菜单/列表优化的 warm-terra 变体：两列长文本表格会换行，避免第一列溢出；Menlo unicode-range 可避免 CJK 行内代码在 Preview/Adobe 中显示为空白 |
| `mobile` | 148mm × 210mm | PingFang SC | 赤陶色 + 暖色中性色 | 手机阅读、微信分享、随时查阅 |

创建新主题：复制 `themes/default.css`，进行修改，然后保存为 `themes/your-theme.css`。

## 打印版与手机版：选择合适的主题

| 场景 | 推荐主题 | 原因 |
|----------|-------------------|-----|
| 在 A4 纸上打印、讲义、合同 | `default` | 标准页面尺寸，正式的排版 |
| 培训材料、课程大纲 | `warm-terra` | 暖色强调色，适合工作坊场景阅读 |
| 通过微信发送、在手机上阅读 | `mobile` | 窄页面（148mm）、15px 字体、1.9 的行高——在小屏幕上阅读更舒适 |
| 同时需要打印版和手机版 | 使用不同主题运行两次 | 此 skill 运行速度快，可以生成两个版本 |

**决策规则：**如果用户未指定，则培训/课程内容默认使用 `warm-terra`，正式文档默认使用 `default`——但当文档中的表格列内容长度不均时（课程表、明细列表），应选择 `cjk-auto` 而不是 `default`，因为该主题的 `table-layout: auto` 正是为此而存在的。只有在输出渠道不明确时，才询问“是否需要手机版？”

## 后端

脚本会根据 **内容 × 主题** 自动检测最佳可用后端——主题这一半很重要，因为 CJK 之所以曾经需要 Chrome，原因在于主题的字体栈属性，而不是文本是否为中文：

- **CJK + Songti/Heiti 主题**（`default`、`cjk-auto`）→ **weasyprint**。这些主题嵌入 CID TrueType，所有阅读器都能渲染，因此 Chrome 没有任何收益，反而会产生下文所述的裁剪问题。
- **CJK + PingFang 主题**（`warm-terra`、`mobile`、`warm-terra-menu`，以及不在安全列表中的任何主题）→ **Chrome**。weasyprint 会将 PingFang SC 子集嵌入为 CID Type 0C OpenType，macOS Preview / Adobe Reader 无法渲染——即使 Chrome 自带的 PDF 查看器显示正常，接收者的设备上仍会出现乱码。
- **非 CJK 内容** → **weasyprint**（速度更快，无需启动浏览器）。

路由由 `scripts/tests/test_backend_routing.py` 固定。如果你自行添加主题，在将其加入 `md_to_pdf.py` 中的 `_WEASYPRINT_SAFE_CJK_THEMES` 之前，都会被视为 PingFang 类主题——只有在确认其 CJK 字体是 CID TrueType 后，才能执行此操作。

| 后端 | 安装 | 优点 | 缺点 |
|---------|---------|------|------|
| `weasyprint` | `pip install weasyprint` | CSS 渲染精准，无需浏览器，不会裁剪溢出内容 | 将 PingFang SC 子集化为 CID Type 0C — 在 Preview/Adobe 中无法阅读 |
| `chrome` | 已安装 Google Chrome | 零 Python 依赖，能正确渲染 PingFang | **会裁剪超出 @page 框的所有内容**（见下文） |

使用 `--backend chrome` 或 `--backend weasyprint` 覆盖默认设置；显式指定的标志始终优先于自动检测。

**主题不会告诉你实际运行的是哪个后端。** 当 weasyprint 无法导入时，`default` / `cjk-auto` 的渲染会回退到 Chrome——同时在 stderr 上输出警告，但退出码仍为 0。读取 `Generated:` 行中的 `backend=` 字段，即可确认实际使用的后端；决定是否适用下方仅针对 Chrome 的步骤的是该字段，而不是主题名称。

### Chrome 会裁剪，而不仅仅是溢出

Chrome 会在 `@page` 内容框处使用 `re W* n` 裁剪路径包裹每一页。超出该框的内容仍然存在于 PDF 的对象层中，但**永远不会被绘制**。在 `margin: 2.5cm 2cm 2cm 2cm` 的 A4 页面上测得：裁剪路径终止于 **538.90pt**，而表格右边框位于 **545.18pt**——因此边框会被悄无声息地截断。

**这不是“宽表格”问题——在 `default` 和 `cjk-auto` 下，每个表格都会出现该问题。** 这些主题设置了 `table { table-layout: fixed; width: 100% }`，因此一个两列表格和一个十列表格都会跨越相同的完整内容宽度，并将其右边框定位在相同的 545.18pt 处。测量结果表明：简单的 `| 周一 | 周二 |` 表格与六列表格的费用明细表发生了完全相同的裁剪。内容宽度并不重要；真正越过边界的是主题自身的 `width: 100%` 加上单元格内边距。

溢出本身是**设计如此**：CJK 排版层会设置 `overflow-wrap: normal`，正是为了让内容溢出，而不是在词元中间断开（见下方的“CJK Typography”）。这一权衡在 weasyprint 下是安全的，但在 Chrome 下会造成破坏性后果。

**之所以这个问题在反复交付后仍然存在，并不是因为预览在撒谎——而是因为这个症状看起来像是有意为之。** 最后一列的文本完整且间距正确；消失的只有一条极细边框，看起来就像一种样式选择。同时，下面的视觉检查清单会让你下意识地寻找*被截断的文本*，而这里恰恰没有发生这种情况。

栅格化器确实会遵守裁剪区域，因此这个脚本已经生成的预览 PNG（`pdftoppm`，130 dpi）能够显示该缺陷，400 dpi 的渲染结果也能显示——在 400 dpi 下，跨越预期边框的 25 个像素列完全没有任何墨迹。但任何读取坐标而不是像素的检查都**无法**显示它——`pdfplumber` 仍然会报告位于 545.18pt 的矩形，因为该对象确实存在。

与其依赖人工注意到缺失的极细边框，不如运行检查。**它有两种形式，而对于 Chrome 渲染的 PDF，只有第二种才算判定结果。**

```bash
# Form 1 — one file. Compares ink against the PDF's own object layer.
uv run --with pdfplumber --with pillow --with numpy scripts/check_table_borders.py out.pdf
```

形式 1 会获取每个检测到的表格的列边界，统计这些边界中实际在 `pdftoppm` 栅格中有墨迹的数量；如果某个边界存在于 PDF 中、但在纸面上不存在，它就会以该边界为名返回非零退出码。它会报告测量了多少个表格；如果一个表格也没有找到，它会显示 `NOTHING CHECKED`，而不是 `PASS`——一个无法检测到其中表格的文档并没有通过检查，而是被跳过了。

这些边界来自单元格网格，而不是原始的垂直边缘，因为 `<hr>` 的端帽和行内 `<code>` 跨度的背景，看起来与基于边缘的读取器所识别的列线完全一样。在一组来自真实知识库、由 WeasyPrint 生成的 49 份 PDF 上进行测量时，其中 46 份的几何结构被基于边缘的版本检查；该版本在这 46 份中有 34 份检查失败。残余限制：对于其他工具生成的 PDF，`pdfplumber` 有时会把装饰元素拼装成一个实际上并不存在的表格，而检查会为这个表格报告边线。对于不是由此 skill 生成的 PDF，应将检查失败视为提示你进行查看，而不是判定结果。

**它无法单独判定 Chrome 渲染结果通过，因为裁剪会以两种不同的方式破坏证据。** Chrome 会保留*跨越*裁剪区域的几何对象——形式 1 能捕获这种情况，因为该边线按约定应该存在，却没有被绘制——但会丢弃完全位于裁剪区域*之外*的几何对象；而从未写入对象层的边线，自然也不会被查找。实际测量表明：一个使用垂直边线样式、且没有单元格填充的表格，会打印出 `5/5 promised rules painted — PASS`，但其右边框确实已经消失。附带的主题只是碰巧避开了这个问题；它们的单元格背景填充会跨越裁剪区域，并在边框所在位置留下一个边缘，供形式 1 找到。

因此，当主题选择 Chrome 且文档包含表格时，应使用另一个后端渲染相同的源文件并进行比较：

```bash
# Form 2 — render a reference with the other backend, then compare.
# Use the SAME --theme as the deliverable; only the backend differs.
uv run --with weasyprint scripts/md_to_pdf.py doc.md /tmp/ref.pdf \
  --theme warm-terra --backend weasyprint --no-preview
uv run --with pdfplumber --with pillow --with numpy \
  scripts/check_table_borders.py out.pdf --reference /tmp/ref.pdf
```

退出代码：`0` 表示通过，`1` 表示至少有一项检查未通过，`2` 表示检查无法运行，`3` 表示未检测到表格，因此没有任何内容可供测量。**`3` 不代表通过**：如果文档确实包含表格，则说明其样式没有绘制出 `pdfplumber` 能找到的线条，因此该检查无法对其作出判断——请改为自行读取表格右边缘处的栅格图像，并在交接说明中指出该门禁未运行。`pdfplumber` 在处理子集 CJK 字体时会输出 `Could not get FontBBox from font descriptor`；这是解析器噪声，不是问题发现。

参考文件是测量标尺，而不是交付物——它很可能也存在最初促使该主题改用 Chrome 的 CID Type 0C 问题，但这不会影响其几何结构。

**两个文件都会进行墨迹检查，并且规则数量会双向比较**，因此传入文件的顺序无法决定是否会检查损坏的文件。这一点的重要性超出表面理解：对于 Chrome *裁剪掉* 而非*丢弃*的边框，两个渲染结果具有相同的规则数量——几何结构仍然存在，只是没有被绘制出来——因此数量比较无法发现任何问题，只有对右侧文件进行的墨迹检查才能找到它。在此前也对参考文件进行墨迹检查之前，将被裁剪的文件作为 `--reference` 传入会得到无条件的 PASS。

双向进行数量比较：规则数量少于参考文件，表示渲染器丢弃了一些规则；数量更多，则表示参数顺序颠倒，或者两个文件并非同一文档。比较数量而不是位置，并且按整个文档而不是逐页比较，因为两个后端会以不同方式拆分同一份源文件——在一张包含 60 行 CJK 内容的表格上进行测量时，行内容决定了分页断点的位置：`default` 为 5 页对 3 页，`warm-terra-menu` 为 3 页对 15 页，而规则数量始终完全相同。

在 5 个主题、单页和多页、两种参数顺序的组合上完成校准，共运行 20 次：其中不包含被裁剪文件的 12 对样本在两种顺序下都通过，包含被裁剪文件的 8 对样本在两种顺序下都被捕获。另行使用 14 份真实 Markdown 文档 × 2 个主题，共运行 28 次单文件测试，误报次数为零。

## 批量转换

```bash
# Default theme, same directory
uv run --with weasyprint scripts/batch_convert.py *.md

# Specific theme, output directory, skip previews for speed
uv run --with weasyprint scripts/batch_convert.py *.md --theme warm-terra --output-dir ./pdfs --no-preview

# Mobile theme for phone reading
uv run --with weasyprint scripts/batch_convert.py *.md --theme mobile --output-dir ./mobile-pdfs --no-preview

# The border check takes several files at once, so a batch is still gated
uv run --with pdfplumber --with pillow --with numpy \
  scripts/check_table_borders.py ./pdfs/*.pdf
```

`--no-preview` 会关闭视觉自检，这正是批量处理的意义所在——但它不会关闭相应的义务。请按上面的方式对输出结果运行边框检查。该检查可以一次处理多个文件；`--reference` 则不支持这一点，因此对于一批使用 Chrome 渲染且包含表格的文档，需要为每份文档分别运行一次配对检查。

## 反模式：不要手动调用 pandoc + Chrome

**为什么需要此 skill：** 手动执行 `pandoc input.md -o out.html` + `chrome --headless --print-to-pdf` 的工作流会以难以察觉的方式静默失败：

| 手动步骤 | 出现的问题 | 此 skill 的修复方式 |
|---|---|---|
| `pandoc -o out.html` | 没有支持 CJK 的 CSS → 中文显示为方框/空白 | 注入 CJK 字体栈和排版修补样式 |
| Chrome `--print-to-pdf` | 出现默认页眉/页脚（文件名、日期、URL、页码） | 传入 `--no-pdf-header-footer` |
| 没有渲染后检查 | 认为“退出代码为 0”就代表成功；隐藏了渲染问题 | 自动生成逐页 PNG 预览并执行排版检查 |
| 没有主题系统 | 采用一刀切的方案；无法在手机上阅读 | 提供三个精心设计的主题（default / warm-terra / mobile） |
| 缺少 `batch_convert.py` | 编写临时循环，使用不一致的标志 | 内置支持 `--theme` 的批量模式 |

**规则：** 当用户要求转换为 PDF 时，始终使用此 skill。绝不要使用手动 pandoc/Chrome 命令绕过它。

## 故障排查

**中文字符显示为方框**：确保已安装中文字体（Songti SC、PingFang SC 等）。

**weasyprint 导入错误**：使用 `uv run --with weasyprint` 运行，或改用 `--backend chrome`。

**代码块中的 CJK 文本乱码（weasyprint）**：脚本会自动检测包含中文/日文/韩文字符的代码块，并将其转换为使用支持 CJK 字体的样式化 div。如果仍然出现问题，请使用具有原生 CJK 支持的 `--backend chrome`——但如果文档包含任何表格，请使用 `scripts/check_table_borders.py <the chrome pdf> --reference <a weasyprint render of the same source>` 清除结果，先指定 subject，再指定 flag——因为 Chrome 会将超出 `@page` 框的表格边框裁剪掉，而不只是让其溢出；单文件形式无法识别 Chrome 丢弃的边框，而只能识别被裁剪的边框（参见上文“Chrome clips, it does not merely overflow”）。或者，在生成 PDF 之前将代码块转换为 Markdown 表格。

**出现 Chrome 页眉/页脚**：脚本会传入 `--no-pdf-header-footer`。如果仍然出现，可能是你的 Chrome 版本不支持此标志——请更新 Chrome。**注意：**如果你绕过此 skill 而使用手动 Chrome headless，这是第一个症状——请参见上文的“反模式”部分。

**包含混合 CJK + ASCII 的行内代码在 macOS Preview 中显示空白**（例如 `` `Terminal/终端` `` 只渲染出 `Terminal/`，CJK 部分缺失）：weasyprint 会将 PingFang SC 子集嵌入为 **OpenType (CID Type 0C)**，而严格的 PDF 阅读器（macOS Preview / Adobe Reader）无法渲染它。Chrome 的 PDF 查看器会自动回退，因此掩盖了这个问题。修复方案已包含在默认主题中：代码字体的 `font-family` 链会优先选择 **CID TrueType** CJK 字体（Songti SC / Heiti SC），然后才是 OpenType 字体（PingFang SC）。验证方法：使用 `pdfplumber` 检查 CJK 字符的 `font['fontname']`——如果其中任何字符引用了 `PingFang-SC`（CID Type 0C OT），阅读器很可能无法正常渲染。请重新排列字体链，将 CID TrueType 字体放在前面。

**表格第 1 列的短标签在中间断开**（例如 `4/28（周|二）下|午`）：pandoc 会根据 Markdown 分隔行中的短横线数量，自动生成 `<colgroup><col style="width:X%">`。对于 `| ----- | --- | --- | -------- |`（短横线宽度不一致），pandoc 会将第 1 列分配为约 17% 的宽度——对于 9 个字符的 CJK 标签来说过窄。内联 `style=""` 与外部 CSS 具有相同优先级时会覆盖外部 CSS，因此 `td:first-child { width:... }` 会被静默遮蔽。修复方案已包含在默认主题中：`table colgroup col { width: auto !important }` 会抵消 pandoc 的提示，使 `table-layout: fixed` 均匀分配宽度（对于四列表格，每列 25%）。验证方法：`pandoc input.md -t html | grep colgroup`——如果显示 `<col style="width:X%">`，则适用此问题。**适用范围：**此抵消规则仅存在于 `default.css` 中；`warm-terra` 和 `mobile` 主题采用不同策略（对 th/td 使用 nowrap，并让最后一列换行；以及完全按流式布局换行），并有意省略了该规则。此抵消规则由 `scripts/tests/test_cjk_tables.py::test_default_theme_neutralizes_pandoc_colgroup_hint` 锁定。

## 视觉自检（强制执行——不得跳过）

**这不是可选项。** 每次生成 PDF 后，脚本都会自动：

1. 通过 `pdftoppm`（poppler-utils）将每一页转换为 PNG，并输出到**系统临时目录**下的 `<pdf-name>/` 子目录中（而不是 PDF 所在目录旁边——预览文件只是一次性自检产物，绝不能遗留在工作树 / git 仓库中）。运行结束后会打印确切路径，格式为 `Previews: <path>/page-NN.png`；文件本身的名称为 `page-1.png`、`page-2.png`，依此类推，不使用前导零
2. 打印结构化的自检清单，提醒调用者目视检查每一页
3. 运行排版检查，以检测 CJK 换行反模式

**之所以强制执行**： “PDF 已干净生成” ≠ “渲染结果符合 markdown 意图”。常见的静默失败包括：
- 段落被合并为一段（连续的非空行会触发 CommonMark 软换行）
- 表格溢出页面边距
- 表格缺少右边框，但文本仍然完整（Chrome 裁剪——这是列表中唯一一个看起来不像失败的故障；由 `scripts/check_table_borders.py` 判定，而在 Chrome 渲染中，只有其 `--reference` 形式才是最终判定依据）
- 缺少 CJK / emoji 字形
- 代码块乱码
- Chrome 默认的页眉/页脚（如果绕过了此 skill）

**工作流**，位于生成与交付之间的暂停点——分为两个步骤，且第二步无法由第一步替代：

1. **阅读页面。** 在打印出的 `Previews:` 路径处使用 `Read` 读取每个 `page-N.png`，并与 markdown 源文件进行核对。如果任何内容的渲染结果与预期不符，**修复 markdown**（使用 `- ` 表示真正的列表，而不是伪列表；插入空行；重构表格），然后重新运行。脚本不会悄悄“修复”非标准 markdown——那会掩盖源文件有问题这一信号，导致同一 markdown 在其他处理器（Obsidian、GitHub、VS Code 预览）中仍然错误渲染。

2. **如果文档包含任何表格，请在 PDF 上运行 `scripts/check_table_borders.py`**——如果渲染经过 Chrome，还要运行其 `--reference` 形式，因为在这种情况下只有该形式才是最终判定依据（两种形式都在上文“Chrome 会裁剪，而不只是溢出”中有所说明）。第一步不能替代这一步。缺失的边框看起来像是一种样式选择，而第一步中的检查清单会让你重点留意文本是否被截断；但这恰恰是不会发生的情况。不得仅凭第一步就交付包含表格的 PDF。

这两个步骤都无法捕获所有问题。PNG 由 `pdftoppm` 生成，而它会渲染 CID Type 0C 字体；macOS Preview 和 Adobe Reader 会将这类字体显示为空白——因此字体嵌入缺陷在第一步中可能看起来完全正常，但在接收者的机器上却无法阅读。这个问题由主题路由处理，而不是通过目视检查处理（请参阅“Backends”）；需要手动运行的检查位于“Troubleshooting”下的“Inline code with mixed CJK + ASCII”中。

批处理 / 非交互式运行时，可使用 `--no-preview` **禁用**：

```bash
python scripts/md_to_pdf.py input.md output.pdf --no-preview
```

**需要** `pdftoppm`（macOS 上可运行 `brew install poppler` 安装）。如果未安装，脚本会记录提示并跳过预览生成，但仍会生成 PDF。

## CJK 排版（默认行为）

该脚本会自动应用两层 CJK 感知处理——**不会修改用户的 markdown 源文件或主题 CSS 文件**：

### 第 1 层：CSS 补丁（自动注入，修复约 80% 的情况）

`_load_theme()` 会将 CJK 排版 CSS 补丁追加到已加载的主题 CSS 中。该补丁包括：

- `table { table-layout: fixed; width: 100% }` — 等宽列可防止 weasyprint 自动布局在相邻列内容多出 5 倍时，将其中一列压缩到约 10% 的宽度
- `td, th { word-break: keep-all; overflow-wrap: normal; line-break: strict }` — 不要将 CJK 字符拆开。`overflow-wrap: normal`（而不是 `break-word`）所编码的这一有意取舍，是允许内容略微溢出，而不是退回到词中间断行——具体原因已记录在 `md_to_pdf.py` 中的 `CJK typography patch (auto-injected` 注释块里，并由 `scripts/tests/test_cjk_tables.py` 固化
- `th { white-space: nowrap }` — 较短的表头保持单行显示，使列宽更可预测

这会在不触碰用户源文件的情况下，悄然修复最常见的反模式（单元格内容被强制拆分在 CJK 字符之间，导致每行只能显示一个字符）。用户磁盘上的主题 CSS 文件不会被修改。

### 第 2 层：排版 lint（渲染后检测，捕获其余问题）

PDF 生成后，脚本会对每一页运行 `pdftotext -layout`，并根据《中文文案排版指北》（中文排版风格指南）扫描已知的 CJK 反模式：

- 一行中单独出现一个 CJK 字符（即使经过第 1 层处理，单元格仍然过窄）
- 行尾为 `（`，下一行紧接着出现内容（括号对被拆开）
- 行首为 `）`（与前一个括号对拆开）
- 较短的行以表示语意未完的标点 `、，；：` 结尾

检测结果会以页码和行号位置的形式输出到 stderr。它们是**警告，而不是错误**——PDF 仍会生成。作者可以看到检测结果并决定：

1. 接受（例如，较长文档中出现一个孤立字符可能是可以接受的）
2. 缩短有问题的单元格内容，使其适应列宽
3. 重新组织结构（例如，将较长的内容移到表格下方的段落中）

### 为什么不静默地自动修复所有问题？

第 2 层特意不会修改 markdown。根据 CLAUDE.md 中的“禁止隐式行为”规则，静默重写非标准 markdown（例如将伪列表扩展为真正的列表）会掩盖源文件存在问题这一信号，导致同一份 markdown 在其他处理器中渲染错误。第 1 层是可接受的，因为它修补的是已符合标准的 markdown 的**渲染行为**（标准表格恰好被 weasyprint 以不理想的方式渲染 CJK 内容），而不是 markdown 源文件本身。

### 已知限制

当单个单元格的内容仅略长于可用列宽时（例如，等分后一个宽度为 9 个字符的单元格中包含 10 个 CJK 字符），即使设置了 `keep-all`，weasyprint 仍会退回到强制断行。第 1 层无法解决此问题——第 2 层会捕获该问题，并提示作者缩短单元格内容或重新组织结构。