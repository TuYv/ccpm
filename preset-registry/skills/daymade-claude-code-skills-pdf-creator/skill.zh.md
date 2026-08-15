---
name: pdf-creator
description: Convert markdown files to professional PDF documents with proper Chinese font support, theme system, and visual self-check. Use whenever the user asks to create PDFs, convert markdown to PDF, generate printable documents, or needs documents formatted for print or mobile reading. This skill MUST be used instead of manual pandoc/Chrome invocations — it handles CJK typography, Chrome header/footer suppression, and mandatory visual verification that manual approaches miss. **Scope — markdown → PDF only.** For Word (.docx) output use `daymade-docs:docx-creator`; this skill does not produce docx and the two pipelines are intentionally orthogonal.
---
# PDF 创建器

基于 Markdown 创建支持中文字体和主题系统的专业 PDF 文档。

## 快速开始

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

存储在 `themes/*.css` 中。每个主题都是一个独立的 CSS 文件。

| 主题 | 页面尺寸 | 字体 | 颜色 | 最适合 |
|-------|-----------|------|-------|----------|
| `default` | A4 | 宋体 SC + 黑体 SC | 黑色/灰色 | 法律文档、合同、正式报告 |
| `cjk-auto` | A4 | 宋体 SC + 黑体 SC | 黑色/灰色 | 各列内容不均衡的表格（课程表、明细列表） |
| `warm-terra` | A4 | 苹方 SC | 赤陶色 (#d97756) + 暖色中性色 | 课程大纲、培训材料、工作坊 |
| `warm-terra-menu` | A4 | 苹方 SC | 赤陶色 (#d97756) + 暖色中性色 | 针对模块菜单/列表强化的 warm-terra 变体：双列长文本表格可自动换行，且第一列不会溢出；Menlo unicode-range 可避免 CJK 行内代码在“预览”/Adobe 中显示为空白 |
| `mobile` | 148mm × 210mm | 苹方 SC | 赤陶色 + 暖色中性色 | 手机阅读、微信分享、移动查阅 |

如需创建新主题：复制 `themes/default.css`，进行修改，然后另存为 `themes/your-theme.css`。

## 打印版与移动版：选择合适的主题

| 场景 | 推荐主题 | 原因 |
|----------|-------------------|-----|
| 使用 A4 纸打印、讲义、合同 | `default` | 标准页面尺寸、正式的字体排印 |
| 培训材料、课程大纲 | `warm-terra` | 暖色强调色，适合工作坊场景阅读 |
| 通过微信发送、在手机上阅读 | `mobile` | 窄页面（148mm）、15px 字体、1.9 倍行高——在小屏幕上阅读舒适 |
| 同时需要打印版和移动版 | 使用不同主题运行两次 | 该 Skill 速度很快；可同时生成两个版本 |

**判断规则：**如果用户未指定，则培训/课程内容默认使用 `warm-terra`，正式文档默认使用 `default`。仅当输出渠道不明确时，询问“是否需要手机版？”。

## 后端

脚本会**根据内容**自动检测最佳的可用后端：

- **检测到 CJK 内容** → 自动选择 **Chrome**（weasyprint 会将苹方 SC 子集嵌入为 CID Type 0C OpenType，而 macOS“预览”/Adobe Reader 无法正确渲染——即使在 Chrome 的 PDF 查看器中显示正常，在接收者的设备上也会呈现为乱码）
- **非 CJK 内容** → 自动选择 **weasyprint**（速度更快，无需启动浏览器）

| 后端 | 安装 | 优点 | 缺点 |
|---------|---------|------|------|
| `weasyprint` | `pip install weasyprint` | CSS 渲染精确，无需浏览器 | 在某些阅读器中存在 CJK 字体嵌入问题 |
| `chrome` | 已安装 Google Chrome | 无 Python 依赖，CJK 渲染可靠 | 二进制文件较大，对 CSS 的控制略弱 |

使用 `--backend chrome` 或 `--backend weasyprint` 覆盖默认设置。

## 批量转换

```bash
# Default theme, same directory
uv run --with weasyprint scripts/batch_convert.py *.md

# Specific theme, output directory, skip previews for speed
uv run --with weasyprint scripts/batch_convert.py *.md --theme warm-terra --output-dir ./pdfs --no-preview

# Mobile theme for phone reading
uv run --with weasyprint scripts/batch_convert.py *.md --theme mobile --output-dir ./mobile-pdfs --no-preview
```

## 反模式：切勿手动调用 pandoc + Chrome

**为何需要此 Skill：** 手动执行 `pandoc input.md -o out.html` + `chrome --headless --print-to-pdf` 的工作流会以难以察觉的方式静默失败：

| 手动步骤 | 出现的问题 | 此 Skill 的解决方式 |
|---|---|---|
| `pandoc -o out.html` | 没有支持 CJK 的 CSS → 中文显示为方框或空白 | 注入 CJK 字体栈和排版补丁 |
| Chrome `--print-to-pdf` | 出现默认页眉/页脚（文件名、日期、URL、页码） | 传递 `--no-pdf-header-footer` |
| 不进行渲染后检查 | 将“退出代码为 0”视为成功；渲染问题被隐藏 | 自动生成逐页 PNG 预览并进行排版检查 |
| 没有主题系统 | 一种样式适配所有场景；无法在手机上阅读 | 三种精心设计的主题（default / warm-terra / mobile） |
| 缺少 `batch_convert.py` | 编写临时循环，参数不一致 | 内置支持 `--theme` 的批处理模式 |

**规则：** 当用户要求转换为 PDF 时，始终使用此 Skill。切勿绕过它，改用手动 pandoc/Chrome 命令。

## 故障排除

**中文字符显示为方框**：确保已安装中文字体（Songti SC、PingFang SC 等）。

**weasyprint 导入错误**：使用 `uv run --with weasyprint` 运行，或改用 `--backend chrome`。

**代码块中的 CJK 文本乱码（weasyprint）**：脚本会自动检测包含中文、日文或韩文字符的代码块，并将其转换为使用支持 CJK 字体的带样式 div。如果问题仍然存在，请使用原生支持 CJK 的 `--backend chrome`。或者，在生成 PDF 前将代码块转换为 Markdown 表格。

**出现 Chrome 页眉/页脚**：脚本会传递 `--no-pdf-header-footer`。如果仍然出现，可能是你的 Chrome 版本不支持此参数——请更新 Chrome。**注意：** 如果你绕过了此 Skill 并手动使用 Chrome 无头模式，这就是第一个征兆——请参阅上面的“反模式”部分。

**macOS 预览中混合 CJK + ASCII 的行内代码显示为空白**（例如，`` `Terminal/终端` `` 仅渲染 `Terminal/`，缺少 CJK 部分）：weasyprint 会将 PingFang SC 以 **OpenType (CID Type 0C)** 格式进行子集嵌入，而严格的 PDF 阅读器（macOS 预览 / Adobe Reader）无法渲染这种格式。Chrome 的 PDF 查看器会自动回退，从而掩盖此问题。默认主题已修复此问题：代码字体族链会优先使用 **CID TrueType** CJK 字体（Songti SC / Heiti SC），而不是 OpenType 字体（PingFang SC）。验证方法：使用 `pdfplumber` 并检查 CJK 字符的 `font['fontname']`——如果其中有任何字符引用 `PingFang-SC`（CID Type 0C OT），阅读器很可能无法渲染。请重新排列字体链，将 CID TrueType 字体置于首位。

**标签较短的表格第 1 列会从中间断行**（例如 `4/28（周|二）下|午`）：pandoc 会根据 Markdown 分隔行中的连字符数量自动生成 `<colgroup><col style="width:X%">`。对于 `| ----- | --- | --- | -------- |`（连字符宽度不均），pandoc 会为第 1 列分配约 17% 的宽度——对于包含 9 个字符的 CJK 标签来说太窄。相同特异性下，内联 `style=""` 的优先级高于外部 CSS，因此 `td:first-child { width:... }` 会被悄然覆盖。修复位于默认主题中：`table colgroup col { width: auto !important }` 会抵消 pandoc 的宽度提示，让 `table-layout: fixed` 均匀分配宽度（对于 4 列表格，每列占 25%）。验证方法：`pandoc input.md -t html | grep colgroup`——如果输出中出现 `<col style="width:X%">`，则存在此问题。**适用范围：**该抵消规则仅存在于 `default.css` 中；`warm-terra` 和 `mobile` 主题采用不同的策略（前者对 th/td 禁止换行、仅允许最后一个子元素换行，后者允许完整流式换行），因此有意省略了该规则。此抵消规则由 `scripts/tests/test_cjk_tables.py::test_default_theme_neutralizes_pandoc_colgroup_hint` 测试锁定。

## 视觉自检（强制要求——不得跳过）

**这不是可选步骤。**每次生成 PDF 后，脚本都会自动执行以下操作：

1. 通过 `pdftoppm`（poppler-utils）将每一页转换为 PNG，并保存到**系统临时目录**下的 `<pdf-name>/` 子目录中（不会保存在 PDF 旁边——预览文件是用于自检的一次性产物，绝不能残留在工作树/git 仓库中）。运行结束后会以 `Previews: <path>/page-NN.png` 的形式输出确切路径
2. 输出结构化的自检清单，提醒调用者目视检查每一页
3. 运行排版 lint，检测 CJK 断行反模式

**强制执行的原因**：“PDF 已顺利生成”≠“渲染结果符合 Markdown 原意”。常见的静默失败包括：
- 段落合并成一段（连续非空行触发 CommonMark 软换行）
- 表格超出页面边距
- 缺少 CJK/emoji 字形
- 代码块乱码
- Chrome 默认页眉/页脚（绕过此 Skill 时）

**工作流**：运行脚本后，对输出的 `Previews:` 路径中的每个 `page-NN.png` 执行 `Read`，并与 Markdown 源文件进行核对。如果任何内容的渲染结果与原意不符，**修复 Markdown**（使用 `- ` 创建真正的列表，而不是伪列表；插入空行；重构表格），然后重新运行。脚本不会静默“修复”非标准 Markdown——这样做会掩盖源文件存在错误这一信号，导致同一份 Markdown 在其他处理器（Obsidian、GitHub、VS Code 预览）中仍然渲染错误。

对于批处理/非交互式运行，可使用 `--no-preview` **禁用**该功能：

```bash
python scripts/md_to_pdf.py input.md output.pdf --no-preview
```

**依赖项**：`pdftoppm`（在 macOS 上运行 `brew install poppler`）。如果未安装，脚本会记录提示并跳过预览生成，但仍会生成 PDF。

## CJK 排版（默认行为）

脚本会自动应用两层 CJK 感知处理——**不会修改用户的 Markdown 源文件或主题 CSS 文件**：

### 第 1 层：CSS 补丁（自动注入，可修复约 80% 的情况）

`_load_theme()` 会将一个 CJK 排版 CSS 补丁追加到已加载的主题 CSS 中。该补丁包括：

- `table { table-layout: fixed; width: 100% }` — 等宽列可防止相邻列的内容多出 5 倍时，weasyprint 的自动布局将某一列压缩到约 10% 的宽度
- `td, th { word-break: keep-all; overflow-wrap: normal; line-break: strict }` — 不要将 CJK 字符拆开。使用 `overflow-wrap: normal`（而非 `break-word`）是经过权衡后的有意选择：宁可让内容略微溢出，也不回退到在词元中间断行——相关理由记录在 `md_to_pdf.py` L109-146 的行内注释中，并由 `scripts/tests/test_cjk_tables.py` 锁定这一行为
- `th { white-space: nowrap }` — 让较短的表头保持在一行，以确保列宽可预测

这会在不改动用户源文件的情况下，静默修复最常见的反模式（单元格内容被强制在 CJK 字符之间换行，从而产生每行仅有一个字符的情况）。磁盘上的用户主题 CSS 文件永远不会被修改。

### 第 2 层：排版检查（渲染后检测，捕获其余问题）

生成 PDF 后，脚本会逐页运行 `pdftotext -layout`，并根据《中文文案排版指北》（中文排版风格指南）扫描已知的 CJK 反模式：

- 单个 CJK 字符独占一行（即使经过第 1 层处理，单元格仍然过窄）
- 一行以 `（` 结尾，而内容从下一行开始（括号对被拆开）
- 一行以 `）` 开头（与前面的括号对断开）
- 短行以表示语意尚未结束的标点 `、，；：` 结尾

发现的问题会连同页码和行号位置输出到 stderr。它们是**警告，而非错误**——PDF 仍会生成。作者看到问题后可决定：

1. 接受（例如，在一篇长文档中出现一个孤立字符可能是可以接受的）
2. 缩短有问题的单元格内容，使其适应列宽
3. 调整结构（例如，将较长内容移到表格下方的段落中）

### 为什么不静默地自动修复所有问题？

第 2 层有意不修改 markdown。根据 CLAUDE.md 中的“禁止隐式行为”规则：静默重写非标准 markdown（例如，将伪列表展开为真正的列表）会掩盖源文件有误这一信号，导致同一份 markdown 在其他处理器中仍然渲染错误。第 1 层是可以接受的，因为它修补的是已符合标准的 markdown 的**渲染行为**（标准表格只是恰好被 weasyprint 以不完善的方式渲染 CJK 内容），而不是 markdown 源文件本身。

### 已知限制

当单个单元格的内容仅略长于可用列宽时（例如，等分后，一个宽度只能容纳 9 个字符的单元格中包含 10 个 CJK 字符），即使设置了 `keep-all`，weasyprint 仍会回退到强制断行。第 1 层无法修复此问题——第 2 层会将其捕获，并提示作者缩短单元格内容或调整结构。