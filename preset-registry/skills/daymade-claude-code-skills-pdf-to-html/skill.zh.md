---
name: pdf-to-html
description: Converts a PDF into one self-contained, readable HTML file that preserves images, tables, charts and reading order — optionally translating it into another language while keeping every figure. Uses structured extraction (PyMuPDF), font-size-driven layout, compressed base64-inlined images (a single portable file), and mandatory headless-Chrome visual verification. Use whenever someone wants to READ a PDF as a web page or clean document, turn a PDF into HTML, or translate a PDF into another language while keeping its images/tables/charts intact — e.g. "PDF 转 HTML", "把这个 PDF 转成中文网页版", "make this report readable", "translate this PDF but don't lose the charts", "I just want to read this PDF on my phone". Distinct from doc-to-markdown (plain Markdown text) and pdf-creator (Markdown→PDF) — this one produces a styled, image-faithful HTML reading experience.
---
# PDF 转 HTML

将 PDF 转换为单个、自包含且易于阅读的 HTML 文件——保留图像、表格、图表和阅读顺序——还可选择进行翻译，同时保持每幅图的位置不变。

该流程为**提取 → 查看 →（翻译）→ 构建 → 验证**。中间的“查看”和最后的“验证”步骤才是真正确保忠实还原的关键：PDF 是一种版面布局，而不仅仅是文本流，因此在构建之前要阅读渲染后的页面，并在交付之前检查渲染后的 HTML。

此技能以内联方式运行（不使用 `context: fork`）：翻译过程会编排一个 Dynamic Workflow，而子代理无法启动该工作流。

## 何时使用／不使用

- 当目标是将 PDF 作为 HTML／网页进行*阅读*、将 PDF 转换为带样式的 HTML 文档，或将 PDF 翻译为另一种语言并保留其中的图和表时，**使用此技能**。
- 如果需要的是纯 Markdown 文本（无样式，图可选），请改用 **doc-to-markdown**。
- 如果需要反向转换（Markdown → PDF），请改用 **pdf-creator**。

## 不适用的场景

- **扫描版／仅图像的 PDF**（没有文本层）：先执行 OCR（例如使用 `ocrmypdf`），然后再使用此技能。
- **复杂的多列表格**：单元格中的*文本*会得到保留且可读，但列对齐可能会被展平成文本流——PyMuPDF 将表格读取为文本块，而不是网格，因此网格线会丢失。PDF 中以*图像*形式存在的表格则会作为图像保留下来。如果表格的网格结构至关重要，请使用 **doc-to-markdown**（pandoc 会重新构建真正的表格），或单独转换该页面。
- **像素级完全复刻**：输出是保留图像和阅读顺序的整洁*重排版*，而不是原始页面布局的 1:1 副本。
- **改写**：此技能会进行翻译和重新排版；不会总结、添加 TL;DR 或发表编辑性意见。忠实还原才是重点（参见下文的“忠实度”）。

## 依赖项

`uv`（使用内联依赖运行 Python）、Google Chrome 或 Chromium（用于视觉验证）。Python 软件包通过 `uv run --with` 提供：PyMuPDF、Pillow、numpy。除 Chrome 和 uv 外，无需预先安装任何其他内容。

## 工作流

复制以下检查清单，并在执行过程中逐项勾选：

```
- [ ] 1. Extract structure + render pages   (extract_pdf.py)
- [ ] 2. Read pages/*.png — SEE the layout, find content vs decorative images
- [ ] 3. (only if translating) run the translation workflow
- [ ] 4. Build the single-file HTML          (build_html.py)
- [ ] 5. Verify visually                      (verify_render.py → Read every segment)
- [ ] 6. Deliver the .html
```

### 1. 提取

```bash
uv run --with pymupdf python scripts/extract_pdf.py input.pdf
```

生成 `input-build/`，其中包含 `structure.json`（含字号的文本块，以及标记为 `decorative` 的图像块）、`images/` 和 `pages/`（每页一个 PNG 文件）。

### 2. 构建前先查看

阅读 `input-build/pages/*.png`。这一步并非可选：你需要查看实际版面布局，确认哪些图像属于内容、哪些属于装饰，并识别表格／图表。对于较长的 PDF，应阅读每一页；对于较短的 PDF，这一步很快就能完成。你也会在这个阶段充分理解文档，从而准确地进行翻译。

### 3. 翻译（可选）

仅当用户要求使用其他语言时才执行。阅读
[references/translation_workflow.md](references/translation_workflow.md) 并
遵循其中的流程：动态工作流会并行翻译各页面、为数据图表添加说明文字，
并统一术语。它会生成两个供第 4 步使用的覆盖文件（`units.json`、
`caps.json`）。对于任何超过一页的内容，**不要**直接手动翻译——该工作流
能够保持术语一致，而且速度快得多。

### 4. 构建

```bash
# original-language HTML
uv run --with Pillow python scripts/build_html.py input-build/structure.json --out output.html

# translated HTML (overlays from step 3)
uv run --with Pillow python scripts/build_html.py input-build/structure.json --out output.html \
    --translation input-build/units.json --captions input-build/caps.json --lang zh-CN
```

`build_html.py` 是**数据驱动的**：它根据字体大小推断标题层级（最常见的
字号 = 正文；更大的字号依次对应 h3/h2/h1），移除装饰性图片，并将内容图片
压缩为 base64 后内嵌，从而生成一个便携文件。它并非针对任何文档进行手工
调整。如果某个特定 PDF 具有异常结构（例如多栏、侧边栏，或者字号启发式
方法误判了某个图形），请阅读并调整该脚本——它很短，而且本来就是为了
针对不同文档进行编辑而设计的。

### 5. 目视验证（强制）

```bash
uv run --with Pillow --with numpy python scripts/verify_render.py output.html
```

然后**读取每个 `seg-*.png`**并检查：字体是否正常渲染（没有豆腐块）、表格/
图形是否被裁切、标题/列表的外观是否正确、所有预期图片是否都存在。文本
正确并不意味着渲染结果正确（failure_cases #7）。修复问题并重新验证，
直到结果完全正常。

也可以进行快速的结构交叉检查，但要正确统计出现次数：
`grep -o '<figure>' output.html | wc -l`——**不要**使用 `grep -c`（failure_cases #1）。

### 6. 交付

交付单个 `.html` 文件。它是自包含的（图片已内嵌），因此双击即可打开，
不会有任何内容丢失。

## 脚本

| 脚本 | 运行方式 | 用途 |
|--------|----------|---------|
| `scripts/extract_pdf.py` | `uv run --with pymupdf` | PDF → structure.json + images/ + 页面渲染图 |
| `scripts/build_html.py` | `uv run --with Pillow` | structure.json（+ 可选的翻译/说明文字）→ 单文件 HTML |
| `scripts/verify_render.py` | `uv run --with Pillow --with numpy` | 无头 Chrome 渲染 → 可读的 PNG 分段图 |

## 保真度（翻译前请阅读）

交付物看起来具有权威性，因此内容错误比外观难看更糟糕。不可妥协的规则——
以及过去出现问题的具体方式——都记录在
[references/failure_cases.md](references/failure_cases.md) 中。最容易造成
严重问题的一条是：**绝不要为真实人物使用推断出的译名，并逐字复制每个
数字/专有名词**（failure_cases #6）。每次运行翻译前都要阅读该文件；
每次运行前都要快速浏览一遍。

## 后续步骤

生成 HTML 后，建议采取自然的后续操作：

```
Conversion complete: output.html (single self-contained file).

Options:
A) Make a PDF of it — run /daymade-docs:pdf-creator if you want a print/share copy (Recommended if they need to send it)
B) Extract the text as Markdown instead — run /daymade-docs:doc-to-markdown (if they wanted editable text, not a reading page)
C) No thanks — the HTML is what I wanted
```