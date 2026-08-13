---
name: pptx
description: "Use this skill any time a .pptx or .potx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx or .potx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates (.potx), layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx or .potx filename, regardless of what they plan to do with the content afterward. If a .pptx or .potx file needs to be opened, created, or touched, use this skill."
license: Proprietary. LICENSE.txt has complete terms
---
# PPTX 的创建、编辑与分析

`.pptx` 是一个由 XML 文件组成的 ZIP 压缩包。按任务选择方法：

| 任务 | 方法 |
|---|---|
| **创建** 新文稿 | 编写 `pptxgenjs` 脚本——请参见下方注意事项 |
| **编辑** 现有文稿，或基于模板构建 | 解压 → 编辑 `ppt/slides/slideN.xml` → 压缩 |
| **读取** 内容 | `markitdown deck.pptx`（每页幻灯片在 `<!-- Slide number: N -->` 标记下对应一个区块）；可视化网格：`python scripts/thumbnail.py deck.pptx` |

## 脚本

路径相对于本 skill 目录。其余内容均为纯 Python、`node` 或 shell。

| 脚本 | 作用 |
|---|---|
| `scripts/thumbnail.py deck.pptx [prefix]` | 每张幻灯片的带标签网格，用于挑选模板布局。仅支持 `.pptx`。传入 `prefix`（默认为 `thumbnails`，会覆盖同目录下其他文稿生成的网格） |
| `scripts/add_slide.py unpacked/ slide2.xml [--after slideN.xml]` | 复制一张幻灯片（或 `slideLayoutN.xml`），并完整处理包内所需登记信息。也可直接对 `.pptx` 使用 `-o out.pptx` |
| `scripts/clean.py unpacked/` | 删除不再被引用的幻灯片、媒体与关系。请在 `<p:sldIdLst>` 稳定之后运行 |
| `scripts/office/validate.py deck.pptx [--original src.pptx]` | 模式、关系、内容类型、图表和幻灯片检查；每个报错都会给出修复方式。模板派生文稿请传 `--original`，它会将模式检查以模板为基准，避免模板自身的 XSD 错误被误判为你的问题 |
| `scripts/office/soffice.py --headless --convert-to pdf deck.pptx` | LibreOffice 包装脚本——沙箱中直接调用裸 `soffice` 会卡住 |

## 使用 pptxgenjs 创建——注意事项

`pptxgenjs` 已预装——不要先运行 `npm install`；直接编写脚本并用 `require('pptxgenjs')` 引入。只有在 require 失败时才执行：`npm install pptxgenjs`。模型知道该 API；以下是容易踩坑的点：

- **在添加幻灯片前设置 `pres.layout`。** 默认画布为 `LAYOUT_16x9` = **10" × 5.625"**，不是 13.3" 宽。越界坐标仍会被写入而不会被截断——形状只是不会出现在幻灯片上。(`LAYOUT_WIDE` 为 13.3" × 7.5"。)
- **十六进制颜色：不要用 `#`，不要用 8 位。** `color: "FF0000"`。`"#FF0000"` 和在十六进制中携带透明度（如 `"00000020"`）**都会损坏文件**。若需半透明：对填充和图片使用 `transparency: 0-100`，对阴影使用 `opacity: 0.0-1.0`，两者相互独立，互相设置不会生效。
- **`pptxgenjs` 会原地修改 options 对象**（首次使用时将数值转换为 EMU）。不要在两个 `add*` 调用间共用同一个 `shadow`/options 对象——每次都构建新对象。
- **阴影 `offset` 必须为 ≥ 0**，负值会损坏文件。要向上投影，请使用 `angle: 270` 且 offset 为正值。
- **`letterSpacing` 会被静默忽略**——真实可用参数是 `charSpacing`。
- **列表：**每个条目设置 `bullet: true`，不要直接使用实心圆点 `•`（否则会出现双重项目符号）。每个数组项都要设置 `breakLine: true`，最后一项除外。段落间距使用 `paraSpaceAfter` 而非 `lineSpacing`（否则会出现巨大空隙）。
- **每个输出文件都应使用一个 `new pptxgen()`**，不要复用实例。
- **`rectRadius` 仅在 `ROUNDED_RECTANGLE` 生效**，`RECTANGLE` 上无效。
- **不支持渐变填充**，请改用渐变图片作为背景。
- **文本框有内建内边距**，当文本需与形状、线条或图标在同一 x 位置对齐时请设置 `margin: 0`。
- **演讲者备注放在 `slide.addNotes("...")`**（纯文本，每张幻灯片一次），不要放在幻灯片内容文本框里。
- **保持图表为原生结构。** 能在 PowerPoint 中绘制的请全部用 `addChart()`（组合图请传 `{type, data, options}` 数组）。对于 PowerPoint 原生支持但库未暴露的特性（趋势线、误差线），请自行计算额外序列或在生成的 OOXML 上后处理——不要退回到渲染图片。仅当 PowerPoint 没有原生形式的图表类型（Sankey、network、chord）才使用图片。
- **默认图表是裸样式**——没有标题、无数据标签、配色偏旧。请设置 `showTitle` + `title`、`showValue: true` + `dataLabelPosition`、`chartColors: [...]` 为你的配色，并清理边框（`catAxisLabelColor`/`valAxisLabelColor`、`valGridLine: { color, size }`、`catGridLine: { style: "none" }`，单序列时设置 `showLegend: false`）。
- **在堆叠柱形或堆叠条形图中，`dataLabelPosition` 必须是 `ctr`、`inEnd` 或 `inBase`。** `outEnd` **会损坏文件**。
- **使用 `secondaryValAxis`/`secondaryCatAxis` 的组合系列时，`chart options` 必须同时包含 `valAxes` 和 `catAxes`，各两项。** 不写这两个时，pptxgenjs 会写入未声明的轴 *id*，PowerPoint 会**丢弃该图表**并报告文件损坏。只提供 `valAxes` 不够。
- **在 `writeFile()` 之后运行 `python scripts/office/validate.py deck.pptx`。** 它会报告上述两个图表问题以及 PowerPoint 拒绝的幻灯片 XML 缺陷，并给出每一项修复方式。修复应在生成逻辑中完成，不要手工改压缩后的 XML。
- **不要重排 `<p:presentation>` 的子节点。** pptxgenjs 会在 `<p:sldIdLst>` 后写入 `<p:notesMasterIdLst>`，并让两个 master 引用同一 theme part。PowerPoint 可正常读取——但若移动该节点，同一文稿会变成无法打开。
- **图标：**将 `react-icons` 渲染为 SVG（`ReactDOMServer.renderToStaticMarkup`），用 `sharp` 按 >=256px 栅格化，再通过 `addImage({ data: "image/png;base64," + buf.toString("base64") })` 插入——必须加 `image/png;base64,` 前缀（`react-icons`、`react`、`react-dom`、`sharp` 均已预装；仅在 require 失败时再 `npm install react-icons react react-dom sharp`）。

## 编辑现有文稿与模板

先选布局：`python scripts/thumbnail.py template.pptx template-thumbs` 会生成带标签的每页幻灯片网格并输出已生成文件名——`template-thumbs.jpg`，超过 12 页后会拆分为 `template-thumbs-N.jpg`。**始终传入这个第二个参数，命名为文稿名。** 默认是 `thumbnails`，若两个文稿在同一目录生成缩略图会互相覆盖——先前文稿的结果会直接消失（仅用于模板分析；视觉 QA 仍需使用 [Converting to Images](#converting-to-images) 的高分辨率渲染；它仅接受 `.pptx`，因此需先将 `.potx` 复制为 `.pptx` 名称）。结合 `markitdown` 将每个内容段映射到模板幻灯片，并变换布局——不要把所有段落都放在同一“标题+要点”幻灯片上。

```bash
python3 -c "import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall('unpacked')" deck.pptx
python scripts/add_slide.py unpacked/ slide2.xml --after slide2.xml   # duplicate a slide (or slideLayoutN.xml); prints the new slide's path
# reorder / delete slides = edit <p:sldIdLst> in ppt/presentation.xml
python scripts/clean.py unpacked/                                     # after deletions: removes orphaned slides, media, rels
# edit slide content in ppt/slides/slideN.xml
(cd unpacked && rm -f ../out.pptx && zip -Xr ../out.pptx .)           # zip from INSIDE the dir; rm first or deleted parts survive
python scripts/office/validate.py out.pptx --original deck.pptx
```

- **先完成所有结构性工作——新增、删除、重排——再编辑任何幻灯片内容。** `add_slide.py` 会逐字复制幻灯片文件，因此在编辑后再复制会把已编辑内容一并克隆；`clean.py` 会删除 `<p:sldIdLst>` 中未出现的所有幻灯片，包括你刚刚写入的那一页。
- **不要手工复制幻灯片文件**——`add_slide.py` 会完成新幻灯片所需的全部注册，并报告已创建内容（如 `Created ppt/slides/slide17.xml from slide2.xml`）。它也可直接作用于文件：`add_slide.py deck.pptx slide2.xml -o out.pptx`——**请传入 `-o`，否则会原地改写输入文稿。** 复制的幻灯片仍会引用其来源的图表/SmartArt/嵌入对象部件，而非完全克隆，因此修改其中一张图表会影响另一张。
- **如果使用 `python-pptx`，有三件事做不到：** 复制幻灯片（其入口只有 `add_slide(layout)`）、通过 `text_frame.text = "..."` 保留格式（它会把段落压缩为单个未样式化 run——应改用 `run.text`），以及读取模板艺术图常用的 SVG/EMF（`add_picture` 会抛出 `UnidentifiedImageError`）。
- 旧版 `.ppt` 必须先转换：`python scripts/office/soffice.py --headless --convert-to pptx file.ppt`。`.potx` 模板会以同样方式解包与打包——输出文件请保留 `.potx` 扩展名。
- 若要复用模板中的图标或图片，复制已包含该资源的幻灯片或布局。

收到。  
先确认一下：本轮我先不做翻译，先按你的 `loadout` 规则确认要启用哪些 skill/plugin 整组或具体 skill（可不选）。可直接回复，例如：

- `仅默认`（不额外启用）
- `启用 XXX 组`
- `全部禁用`
- `启用具体列表：a,b,c`

确认后我立即给出该片段的逐段中文翻译。

如果幻灯片来自模板，请始终传入 `--original`。模板本身可能包含 XSD 拒绝的部分，因此裸跑（bare run）可能会报告你并未引发的错误——而真正的回归问题可能就藏在其中。`--original` 会基于模板对 schema 和幻灯片检查进行基线化，抑制模板本身已存在的错误。结构性检查（关系、内容类型、图表）会忽略 `--original`，并且不管怎样都会报告模板继承的问题，因此这些问题请按其自身重要性单独评估。

`pptxgenjs` 生成的图表 XML 会被 PowerPoint 拒绝打开，而其他工具都能接受：`python-pptx` 能打开这些演示文稿，LibreOffice 可以渲染它们，XSD 通过了这些文件。每个失败都会给出对应的修复项。请在生成器中修复后重新构建。

### 可视化质量检查

将幻灯片转换为图像（参见[转换为图像](#converting-to-images)）并逐张检查。长时间盯着生成代码看时，你往往会看到“期望看到的内容”而非“实际渲染效果”，因此请重新审视这些图像（如果你有一个 `subagent`，这样做会很有帮助）。需要重点关注的用户可见缺陷有：

- **文本溢出或文字在边框或幻灯片边界被截断——请优先检查此项。** 这是最常见的问题，而且总是用户可见的。（对于 Typography 渲染不稳定的字体，预览是近似值：要相信你预留的约 `~10%` 余量，而不是其看起来是否正好合适。）
- 元素重叠（文字穿过形状、线条穿过文字、元素堆叠）
- 来源引用或页脚与上方内容碰撞
- 元素过于接近（间距 `< 0.3"`）或卡片/区块几乎相互接触
- 间距不均（某处留白过大，另一处又很拥挤）
- 离幻灯片边缘的边距不足（`< 0.5"`）
- 列或类似元素对齐不一致
- 文字对比度过低（例如奶油色背景上的浅灰色文字）
- 文本替换后模板装饰位置错位，例如标题下划线按单行定位，但替换后的标题变成两行
- 图标对比度不足（例如深色图标放在深色背景上且没有对比圆圈）
- 文本框过窄导致过度换行
- 残留占位符内容

## 转换为图像

将演示文稿转换为单页图像以便视觉检查：

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 output.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

**将上面直接打印出的绝对路径直接传给查看工具。** `rm` 用于清除先前运行遗留的旧图像。`pdftoppm` 会根据页数补零：少于 10 页为 `slide-1.jpg`，10–99 页为 `slide-01.jpg`，100 页及以上为 `slide-001.jpg`。

**修复后，重新运行上述四条命令**——在 `pdftoppm` 能反映你的修改前，必须先从已编辑的 `.pptx` 重新生成 PDF。

## 依赖项

`pptxgenjs`（npm，已预装 — 仅当 `require('pptxgenjs')` 失败时再安装）· `markitdown[pptx]`、`Pillow`、`defusedxml`、`lxml`（pip — 文本导出、缩略图、清理、验证）· LibreOffice（`soffice`，通过 `scripts/office/soffice.py` 为沙箱环境自动配置）· `pdftoppm`（Poppler）
