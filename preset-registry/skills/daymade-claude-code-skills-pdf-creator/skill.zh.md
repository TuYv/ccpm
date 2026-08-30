---
name: pdf-creator
description: Convert markdown files to professional PDF documents with proper Chinese font support, theme system, and visual self-check. Use whenever the user asks to create PDFs, convert markdown to PDF, generate printable documents, or needs documents formatted for print or mobile reading. This skill MUST be used instead of manual pandoc/Chrome invocations — it handles CJK typography, Chrome header/footer suppression, and mandatory visual verification that manual approaches miss. **Scope — markdown → PDF only.** For Word (.docx) output use `daymade-docs:docx-creator`; this skill does not produce docx and the two pipelines are intentionally orthogonal.
---
# PDF 创建器

从 markdown 创建支持中文字体和主题系统的专业 PDF 文档。

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

存储于 `themes/*.css` 中。每个主题都是一个独立的 CSS 文件。

| 主题 | 页面大小 | 字体 | 颜色 | 适用场景 |
|-------|-----------|------|-------|----------|
| `default` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 法律文档、合同、正式报告 |
| `cjk-auto` | A4 | Songti SC + Heiti SC | 黑色/灰色 | 列内容长度不均的表格（课程表、明细列表） |
| `warm-terra` | A4 | PingFang SC | Terra cotta (#d97756) + 暖色中性色 | 课程大纲、培训材料、工作坊 |
| `warm-terra-menu` | A4 | PingFang SC | Terra cotta (#d97756) + 暖色中性色 | 针对模块菜单/列表强化的 warm-terra 变体：包含长文本的两列表格会自动换行，避免第一列溢出；Menlo unicode-range 可防止 CJK 行内代码在 Preview/Adobe 中渲染为空白 |
| `mobile` | 148mm × 210mm | PingFang SC | Terra cotta + 暖色中性色 | 手机阅读、微信分享、随身参考 |

要创建新主题：复制 `themes/default.css`，进行修改，然后保存为 `themes/your-theme.css`。

## 打印版与手机版：选择合适的主题

| 场景 | 推荐主题 | 原因 |
|----------|-------------------|-----|
| 在 A4 纸上打印、讲义、合同 | `default` | 标准页面大小，正式的排版 |
| 培训材料、课程大纲 | `warm-terra` | 暖色强调色，适合工作坊场景阅读 |
| 通过微信发送、在手机上阅读 | `mobile` | 窄页面（148mm）、15px 字体、1.9 行高——在小屏幕上阅读舒适 |
| 同时需要打印版和手机版 | 使用不同主题运行两次 | 此 skill 运行速度快，可以生成两个版本 |

**决策规则：**如果用户未指定，对于培训/课程内容默认使用 `warm-terra`，对于正式文档默认使用 `default`。只有在输出渠道不明确时，才询问“是否需要手机版？”。

## 后端

脚本会根据**内容 × 主题**自动检测最佳可用后端——主题这一半很重要，因为 CJK 需要 Chrome 的原因取决于主题的字体栈，而不是文本是否为中文：

- **CJK + Songti/Heiti 主题**（`default`、`cjk-auto`）→ **weasyprint**。这些主题会嵌入 CID TrueType，所有阅读器都能渲染，因此 Chrome 没有任何收益，反而会产生下文所述的裁切问题。
- **CJK + PingFang 主题**（`warm-terra`、`mobile`、`warm-terra-menu`，以及任何不在安全列表中的主题）→ **Chrome**。weasyprint 会将 PingFang SC 子集作为 CID Type 0C OpenType 嵌入，而 macOS Preview / Adobe Reader 无法渲染它——即使 Chrome 自带的 PDF 查看器显示正常，接收者设备上仍会出现乱码。
- **非 CJK 内容** → **weasyprint**（速度更快，无需启动浏览器）。

路由由 `scripts/tests/test_backend_routing.py` 固定。你自行添加的主题在将其加入 `md_to_pdf.py` 中的 `_WEASYPRINT_SAFE_CJK_THEMES` 之前，会被视为 PingFang 类主题——只有在确认其 CJK 字体为 CID TrueType 后，才执行此操作。

| 后端 | 安装 | 优点 | 缺点 |
|---------|---------|------|------|
| `weasyprint` | `pip install weasyprint` | CSS 渲染精确，无需浏览器，不会裁剪溢出内容 | 将 PingFang SC 子集化为 CID Type 0C — 在 Preview/Adobe 中无法阅读 |
| `chrome` | 已安装 Google Chrome | 无 Python 依赖，能够正确渲染 PingFang | **会裁剪超出 @page 框的所有内容**（见下文） |

使用 `--backend chrome` 或 `--backend weasyprint` 覆盖；显式指定的标志始终优先于自动检测。

### Chrome 会裁剪，而不仅仅是溢出

Chrome 会将每一页包裹在 `@page` 内容框对应的 `re W* n` 裁剪路径中。超出该框的内容仍位于 PDF 的对象层中，但**永远不会被绘制**。在 A4 页面上使用 `margin: 2.5cm 2cm 2cm 2cm` 测得：裁剪路径在 **538.90pt** 处结束，而表格右边框位于 **545.18pt** — 因此边框会被悄无声息地截断。

**这不是“宽表格”问题 — 在 `default` 和 `cjk-auto` 下，每个表格都会出现此问题。** 这些主题设置了 `table { table-layout: fixed; width: 100% }`，因此两列表格与十列表格占据相同的完整内容宽度，并且其右边框都会落在相同的 545.18pt 位置。测量结果表明：简单的 `| 周一 | 周二 |` 表格与六列费用表的裁剪情况完全相同。内容宽度并不重要；真正越过边界的是主题自身的 `width: 100%` 加上单元格内边距。

溢出本身是**有意设计的**：CJK 排版层特意设置 `overflow-wrap: normal`，以便内容溢出，而不是在词元中间断开（见下文的“CJK Typography”）。这一取舍在 weasyprint 下是安全的，在 Chrome 下却具有破坏性。

**这一问题之所以在反复交付后仍然存在，并不是因为预览会骗人 — 而是因为其症状看起来像是刻意设计的。** 最后一列的文本是完整的，间距也正确；消失的只有一条发丝般细的边框，看起来就像一种样式选择。与此同时，下面的视觉检查清单会让你优先关注*文本被截断*的问题，而这里恰恰不会发生这种情况。

光栅化器确实会遵守裁剪规则，因此此脚本已经生成的预览 PNG 会显示该缺陷（测量于 2026-08-29：`pdftoppm -r 400` 在跨越预期边框的 25 个像素列上完全没有绘制任何墨迹）。而不会显示该缺陷的是任何读取坐标而不是像素的检查 — `pdfplumber` 仍会在 545.18pt 处报告一个矩形，因为该对象确实存在。

与其依赖观察缺失的细线边框，不如运行以下检查：

```bash
uv run --with pdfplumber --with pillow --with numpy scripts/check_table_borders.py out.pdf
```

它会统计对象层承诺存在的垂直线条数量，再统计这些线条中实际在 `pdftoppm` 光栅图像中有墨迹的数量；如果某条线存在于 PDF 中却未出现在纸面上，则会命名该线并以非零状态退出。对任何使用 `--backend chrome` 生成且包含表格的 PDF 运行此检查。

## 批量转换

```bash
# Default theme, same directory
uv run --with weasyprint scripts/batch_convert.py *.md

# Specific theme, output directory, skip previews for speed
uv run --with weasyprint scripts/batch_convert.py *.md --theme warm-terra --output-dir ./pdfs --no-preview

# Mobile theme for phone reading
uv run --with weasyprint scripts/batch_convert.py *.md --theme mobile --output-dir ./mobile-pdfs --no-preview
```

## 反模式：不要手动调用 pandoc + Chrome

**此 skill 存在的原因：** 手动执行 `pandoc input.md -o out.html` + `chrome --headless --print-to-pdf` 的工作流会以难以检测的方式静默失败：

| 手动步骤 | 会出现的问题 | 此 skill 的修复方式 |
|---|---|---|
| `pandoc -o out.html` | 没有支持 CJK 的 CSS → 中文显示为方框/空白 | 注入 CJK 字体栈 + 排版修补 |
| Chrome `--print-to-pdf` | 出现默认页眉/页脚（文件名、日期、URL、页码） | 传入 `--no-pdf-header-footer` |
| 没有渲染后检查 | 假定“退出代码 0”表示成功；隐藏渲染错误 | 自动生成逐页 PNG 预览 + 排版 lint |
| 没有主题系统 | 一刀切；无法在手机上阅读 | 三种精心设计的主题（default / warm-terra / mobile） |
| 缺少 `batch_convert.py` | 编写临时循环，标志参数不一致 | 内置支持 `--theme` 的批处理模式 |

**规则：** 当用户要求转换为 PDF 时，**始终**使用此 skill。绝不要通过手动执行 pandoc/Chrome 命令绕过它。

## 故障排除

**中文字符显示为方框**：确保已安装中文字体（Songti SC、PingFang SC 等）。

**weasyprint 导入错误**：使用 `uv run --with weasyprint` 运行，或改用 `--backend chrome`。

**CJK 文本在代码块中显示乱码（weasyprint）**：脚本会自动检测包含中文/日文/韩文字符的代码块，并将其转换为使用支持 CJK 字体的样式化 div。如果仍然存在问题，请使用具有原生 CJK 支持的 `--backend chrome`——但如果文档包含任何表格，请对结果运行 `scripts/check_table_borders.py`，因为 Chrome 会将超出 `@page` 框的表格边框裁剪掉（参见上文“Chrome 会裁剪，而不仅仅是溢出”）。或者，在生成 PDF 之前将代码块转换为 Markdown 表格。

**出现 Chrome 页眉/页脚**：脚本会传入 `--no-pdf-header-footer`。如果仍然出现，该 Chrome 版本可能不支持此标志——请更新 Chrome。**注意：** 如果你绕过此 skill 而使用了手动 Chrome headless，这是第一个症状——请参阅上面的“反模式”部分。

**包含混合 CJK + ASCII 的行内代码在 macOS Preview 中显示空白**（例如 `` `Terminal/终端` `` 只渲染出 `Terminal/`，CJK 部分缺失）：weasyprint 会将 PingFang SC 子集嵌入为 **OpenType (CID Type 0C)**，严格的 PDF 阅读器（macOS Preview / Adobe Reader）无法渲染。Chrome 的 PDF 查看器会自动回退并隐藏此问题。修复方式已包含在 default 主题中：代码字体的 `font-family` 链会优先使用 **CID TrueType** CJK 字体（Songti SC / Heiti SC），而不是 OpenType 字体（PingFang SC）。验证方法：使用 `pdfplumber` + 检查 CJK 字符的 `font['fontname']`——如果其中任何一个引用了 `PingFang-SC`（CID Type 0C OT），阅读器很可能无法正常显示。重新排列字体链，将 CID TrueType 字体放在前面。

**表格第 1 列的短标签发生居中断行**（例如 `4/28（周|二）下|午`）：pandoc 会根据 Markdown 分隔行中的短横线数量自动生成 `<colgroup><col style="width:X%">`。对于 `| ----- | --- | --- | -------- |`（短横线宽度不一致），pandoc 会将第 1 列分配为约 17% 的宽度——对于 9 个字符的 CJK 标签来说过窄。相同优先级下，行内 `style=""` 会优先于外部 CSS，因此 `td:first-child { width:... }` 会被静默覆盖。修复已加入默认主题：`table colgroup col { width: auto !important }` 会中和 pandoc 的提示，使 `table-layout: fixed` 能够均等分配宽度（对于 4 列表格，每列 25%）。验证方法：`pandoc input.md -t html | grep colgroup` ——如果输出中显示 `<col style="width:X%">`，则说明该问题适用。**范围：**该中和规则仅存在于 `default.css` 中；`warm-terra` 和 `mobile` 主题采用不同策略（对 th/td 使用 nowrap，仅允许最后一列换行；以及分别使用完整流式换行），因此有意省略了该规则。该中和规则由 `scripts/tests/test_cjk_tables.py::test_default_theme_neutralizes_pandoc_colgroup_hint` 锁定。

## 视觉自检（强制执行——不得跳过）

**这不是可选步骤。**每次生成 PDF 后，脚本都会自动：

1. 通过 `pdftoppm`（poppler-utils）将每一页转换为 PNG，并写入**系统临时目录**下的 `<pdf-name>/` 子目录（**不会**写在 PDF 旁边——预览图只是一次性自检产物，绝不能遗留在工作树或 git 仓库中）。运行结束后会打印确切路径，格式为 `Previews: <path>/page-NN.png`
2. 打印结构化的自检清单，提醒调用者检查每一页
3. 运行排版检查，以检测 CJK 断行反模式

**必须执行的原因**：“PDF 已顺利生成”≠“渲染结果符合 Markdown 的意图”。常见的静默失败包括：
- 段落合并为一段（CommonMark 对连续非空行采用软换行）
- 表格溢出页面边距
- 表格缺失右边框但文字仍然完整（Chrome 裁切——这是此列表中唯一一个看起来不像故障的故障；由 `scripts/check_table_borders.py` 判定）
- CJK / emoji 字形缺失
- 代码块乱码
- Chrome 默认的页眉/页脚（如果绕过了此技能）

**工作流：**运行脚本后，在打印出的 `Previews:` 路径中使用 `Read` 读取每个 `page-NN.png`，并与 Markdown 源文件进行核对。如果渲染结果与预期不一致，**修复 Markdown**（使用真正的 `- ` 列表，而不是伪列表；插入空行；重构表格），然后重新运行。脚本不会静默地“修复”非标准 Markdown——否则会掩盖源文件错误的信号，导致相同的 Markdown 在其他处理器（Obsidian、GitHub、VS Code 预览）中以错误方式渲染。

使用 `--no-preview` 禁用，适用于批处理 / 非交互式运行：

```bash
python scripts/md_to_pdf.py input.md output.pdf --no-preview
```

**需要** `pdftoppm`（macOS 上运行 `brew install poppler` 安装）。如果未安装，脚本会记录提示并跳过预览生成，但仍会生成 PDF。

## CJK 排版（默认行为）

该脚本会自动应用两层 CJK 感知处理——**不会修改用户的 markdown 源文件或主题 CSS 文件**：

### 第 1 层：CSS 补丁（自动注入，可修复约 80% 的情况）

`_load_theme()` 会将 CJK 排版 CSS 补丁追加到已加载的主题 CSS 中。该补丁包括：

- `table { table-layout: fixed; width: 100% }` — 等宽列可以防止 weasyprint 自动布局：当相邻列的内容多出 5 倍时，将某一列压缩到约 10% 的宽度
- `td, th { word-break: keep-all; overflow-wrap: normal; line-break: strict }` — 不要将 CJK 字符拆开。`overflow-wrap: normal`（而不是 `break-word`）所体现的有意取舍是：允许内容轻微溢出，而不是退回到词语中间断行——具体原因已记录在 `md_to_pdf.py` 中的 `CJK typography patch (auto-injected` 注释块内，并由 `scripts/tests/test_cjk_tables.py` 固化
- `th { white-space: nowrap }` — 较短的表头保持单行显示，使列宽更加可预测

这会在不触碰用户源文件的情况下，静默修复最常见的反模式（单元格内容被强制断在 CJK 字符之间，从而产生每行仅包含一个字符的情况）。用户磁盘上的主题 CSS 文件不会被修改。

### 第 2 层：排版 lint（渲染后检测，捕获其余问题）

生成 PDF 后，脚本会按页运行 `pdftotext -layout`，并根据“中文文案排版指北”（中文排版风格指南）扫描已知的 CJK 反模式：

- 单独一个 CJK 字符占据一行（即使经过第 1 层处理，单元格仍然过窄）
- 行尾为 `（`，下一行紧接着出现内容（括号对断裂）
- 行首为 `）`（与前面的括号对断开）
- 较短的行以表示语意未完的标点 `、，；：` 结尾

检测结果会以页码和行号位置的形式打印到 stderr。它们是**警告，而不是错误**——PDF 仍会生成。作者可以看到检测结果并决定：

1. 接受（例如，长文档中偶尔出现一个孤立字符可能是可以接受的）
2. 缩短有问题的单元格内容，使其适应列宽
3. 重新组织结构（例如，将较长的内容移到表格下方的段落中）

### 为什么不静默地自动修复所有问题？

第 2 层有意不修改 markdown。根据 CLAUDE.md 中的“禁止隐式行为”规则，静默重写非标准 markdown（例如将伪列表扩展为真正的列表）会掩盖源文件有问题这一信号，导致相同的 markdown 在其他处理器中渲染不正确。第 1 层是可以接受的，因为它修补的是**已符合标准的 markdown 的渲染行为**（标准表格恰好被 weasyprint 以不适用于 CJK 的方式渲染），而不是 markdown 源文件本身。

### 已知限制

当单个单元格的内容仅略长于可用列宽时（例如，等分后，一个宽度为 9 个字符的单元格中包含 10 个 CJK 字符），即使设置了 `keep-all`，weasyprint 仍会退回到强制断行。第 1 层无法解决此问题——第 2 层会捕获该问题，并提示作者缩短单元格内容或重新组织结构。