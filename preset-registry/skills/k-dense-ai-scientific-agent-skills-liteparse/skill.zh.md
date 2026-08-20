---
name: liteparse
description: Local document and PDF parsing with spatial text and bounding boxes. Use for extracting text from PDFs, DOCX, Office files, and images; OCR on scans; layout-preserved JSON for RAG; batch-ingesting paper folders; or page screenshots for multimodal agents — even when the user does not name liteparse. Prefer over MarkItDown when you need bboxes, fast local parsing, or PNG page renders; prefer over the pdf skill for merge/split/forms.
license: Apache-2.0
allowed-tools: Read Write Edit Bash
compatibility: Python 3.10+. Optional LibreOffice (Office formats) and ImageMagick (images). Bundled Tesseract for OCR. All processing is local — no cloud API required.
metadata:
  version: "1.0"
  skill-author: K-Dense Inc.
---
# LiteParse — 本地文档解析

## 概述

LiteParse 是一个快速、开源的文档解析器（Rust 核心，提供 Python/Node 绑定），专注于带边界框的**本地、布局感知型文本提取**。它不生成 Markdown，也不调用云端 LLM。输出为**纯文本**（保留布局）或**结构化 JSON**，其中包含每页的 `text_items`（位置、字体元数据、可选置信度）。

**版本说明：**示例面向 **liteparse 2.0.0**（PyPI，2026 年 5 月）。上游 V1 分支为旧版；本技能仅记录 **V2 / main**。

如需了解与 MarkItDown、`pdf` 技能或 LlamaParse 之间的解析器选择，请参阅 `references/choosing_a_parser.md`。

## 何时使用本技能

在以下情况下使用 LiteParse：

- 对 PDF 或已转换的 Office/图像文件进行**快速本地解析**，无需云端依赖
- 获取带边界框的**空间文本**，用于布局感知型 RAG、引文定位或图表区域逻辑
- 对扫描版 PDF 或图像执行 **OCR**（内置 Tesseract，或用户自行运行的 HTTP OCR 服务器）
- 为必须查看图表、插图或手写内容的多模态代理生成**页面截图**（PNG）
- **批量摄取**文献文件夹、补充 PDF 或协议库
- 处理 **页面子集**或**受密码保护的** PDF

## 不应使用的情况

| 任务 | 改用 |
|------|-------------|
| 用于 LLM 摄取的 Markdown（EPUB、音频、YouTube、HTML） | `markitdown` 技能 |
| 合并/拆分 PDF、表单、水印、旋转 | `pdf` 技能 |
| 密集表格、手写内容、生产级云端流水线 | [LlamaParse](https://docs.cloud.llamaindex.ai/llamaparse/overview)（云端；需单独注册） |

## 安装

```bash
uv pip install "liteparse==2.0.0"
```

这将安装 Python 绑定和 **`lit`** CLI。验证：

```bash
lit --help
python -c "import liteparse; print(liteparse.__version__)"
```

**可选系统工具**（用于非 PDF 输入）：

- **LibreOffice** — Word、Excel、PowerPoint、OpenDocument、CSV/TSV
- **ImageMagick** — PNG、JPEG、TIFF、WebP、SVG 等

安装命令位于 `references/ocr_and_formats.md`。

**Node.js / TypeScript**（可选）：`npm i @llamaindex/liteparse` — 请参阅 `references/api_reference.md`。

---

## 快速开始

### Python

```python
from liteparse import LiteParse

parser = LiteParse(quiet=True)
result = parser.parse("paper.pdf")
print(result.text)

for page in result.pages:
    print(f"Page {page.page_num}: {len(page.text_items)} items")
```

### CLI

```bash
# 保留布局的文本（默认）
lit parse paper.pdf

# 包含边界框的结构化 JSON
lit parse paper.pdf --format json -o paper.json

# 在原生文本 PDF 上禁用 OCR（更快）
lit parse paper.pdf --no-ocr
```

---

## 核心工作流

### 1. 解析为保留布局的文本

最适合快速获取完整文档文本，或提供给不需要坐标的分块器。

```python
parser = LiteParse(ocr_enabled=True, quiet=True)
result = parser.parse("document.pdf")
full_text = result.text
```

```bash
lit parse document.pdf -o output.txt
```

### 2. 解析为结构化 JSON（边界框）

适用于构建布局感知型 RAG、突出显示源区域，或将文本与截图结合使用。

```python
import json
from liteparse import LiteParse

parser = LiteParse(output_format="json", quiet=True)
result = parser.parse("document.pdf")

# Programmatic access
for page in result.pages:
    for item in page.text_items:
        bbox = (item.x, item.y, item.width, item.height)
        # item.text, item.confidence, item.font_name, item.font_size
```

```bash
lit parse document.pdf --format json -o document.json
```

JSON 字段布局：`references/output_formats.md`。

### 3. 解析指定页面

```python
parser = LiteParse(target_pages="1-5,10,15-20", quiet=True)
result = parser.parse("long_paper.pdf")
```

```bash
lit parse long_paper.pdf --target-pages "1-5,10"
```

### 4. 从字节或 stdin 解析

适用于上传、S3 下载或通过管道传输远程 PDF。

```python
with open("document.pdf", "rb") as f:
    result = parser.parse(f.read())
```

```bash
curl -sL https://example.com/report.pdf | lit parse -
```

### 5. 面向多模态智能体的页面截图

截图可捕获仅靠文本提取会遗漏的视觉内容（图形、复杂表格、手写内容）。

```python
from pathlib import Path

parser = LiteParse(dpi=150, quiet=True)
shots = parser.screenshot("document.pdf", page_numbers=[1, 2, 3])
out = Path("screenshots")
out.mkdir(exist_ok=True)
for s in shots:
    (out / f"page_{s.page_num}.png").write_bytes(s.image_bytes)
```

```bash
lit screenshot document.pdf --target-pages "1,3,5" -o ./screenshots
lit screenshot document.pdf --dpi 300 -o ./screenshots
```

当智能体需要同一页面的坐标和像素信息时，请结合使用 **JSON 解析 + 截图**。

### 6. 批量解析目录

对于大型语料库，建议使用 CLI（并行 OCR 工作器）或附带的脚本。

```bash
lit batch-parse ./papers ./parsed --format json --recursive
lit batch-parse ./papers ./parsed --extension .pdf --no-ocr
```

```bash
python scripts/batch_parse_dir.py ./papers ./parsed --format json --recursive
```

有关不进行网络调用的 Python 批处理封装，请参阅 `scripts/batch_parse_dir.py`。

### 7. OCR 配置

OCR **默认启用**。Tesseract 已内置；基本的英文 OCR 无需额外安装。

```python
parser = LiteParse(
    ocr_enabled=True,
    ocr_language="eng",       # Tesseract codes: fra, deu, etc.
    num_workers=4,            # parallel OCR (default: CPU cores - 1)
    dpi=150,                  # higher DPI → better OCR, slower
)
```

```bash
lit parse scan.pdf --ocr-language fra
lit parse scan.pdf --no-ocr
lit parse scan.pdf --ocr-server-url http://localhost:8080/ocr
```

**离线 / 隔离网络环境：**将 `TESSDATA_PREFIX` 设置为包含 `.traineddata` 文件的目录，或传入 `--tessdata-path`。详情请参阅：`references/ocr_and_formats.md`。

### 8. 加密 PDF

```python
parser = LiteParse(password="secret", quiet=True)
result = parser.parse("protected.pdf")
```

```bash
lit parse protected.pdf --password secret
```

### 9. 按短语搜索文本项

合并相邻项目，并返回短语（例如章节标题）的组合边界框。

```python
from liteparse import search_items

page = result.get_page(1)
matches = search_items(page.text_items, "Materials and Methods", case_sensitive=False)
```

---

## 多格式输入

| 类别 | 扩展名（示例） | 要求 |
|----------|----------------------|-------------|
| PDF | `.pdf` | 原生支持 |
| Office | `.docx`, `.xlsx`, `.pptx`, `.doc`, `.odt`, … | LibreOffice |
| 图像 | `.png`, `.jpg`, `.tiff`, `.webp`, `.svg`, … | ImageMagick |

文件会在内部转换为 PDF，然后进行解析。如果缺少转换工具，解析会因可操作的错误而失败，请安装依赖项后重试。

---

## 性能提示

- 数字原生 PDF 使用 **`--no-ocr`**，可获得最大幅度的加速
- **`target_pages`**，仅解析方法或补充材料章节
- **`num_workers`**，将 OCR 扩展到多个 CPU 核心
- **`max_pages`**，限制超大文件的页数（默认值为 1000）
- **`lit batch-parse`**，使用 `--recursive` 和 `--extension` 进行目录级任务
- 当 OCR 质量已足够时，降低 **`dpi`**（例如设为 100）

---

## 参考文件

| 文件 | 适用场景 |
|------|-----------|
| `references/choosing_a_parser.md` | 不确定应使用 LiteParse、MarkItDown、pdf 还是 LlamaParse |
| `references/api_reference.md` | Python/TypeScript API、类型、`search_items` |
| `references/cli_reference.md` | 完整的 `lit` 命令标志 |
| `references/output_formats.md` | JSON schema、边界框、置信度分数 |
| `references/ocr_and_formats.md` | Tesseract、HTTP OCR、LibreOffice、ImageMagick |

---

## 故障排除

| 问题 | 解决方法 |
|-------|-----|
| Office 文件失败 | 安装 LibreOffice；确保 `soffice` 位于 PATH 中（Windows：添加 LibreOffice 的 `program` 目录） |
| 图像失败 | 安装 ImageMagick；验证 `convert` 或 `magick` 可正常工作 |
| OCR 质量较差 | 增加 `--dpi`；尝试 `--ocr-language`；或使用 HTTP OCR 服务器 |
| OCR 较慢 | 如果不需要则使用 `--no-ocr`；减少页数；增加 `num_workers` |
| 隔离网络环境中的 OCR | `export TESSDATA_PREFIX=/path/to/tessdata` 或使用 `--tessdata-path` |
| 字节数据出现 `ParseError` | 确保输入是有效的 PDF 字节数据（Office 字节数据需要文件路径加转换） |

---

## 资源

- **GitHub**: https://github.com/run-llama/liteparse
- **文档**: https://developers.llamaindex.ai/liteparse/
- **PyPI**: https://pypi.org/project/liteparse/2.0.0/
- **npm**: https://www.npmjs.com/package/@llamaindex/liteparse
- **OCR API 规范**: https://github.com/run-llama/liteparse/blob/main/OCR_API_SPEC.md