---
name: doc-to-markdown
description: Converts DOCX/PDF/PPTX to high-quality Markdown with automatic post-processing. Fixes pandoc grid tables, simple tables, image paths, CJK bold spacing, attribute noise, and code blocks; for PDFs also strips OCR garbage blocks, repeated headers/footers/watermarks, and absolute image paths from pymupdf4llm output. Benchmarked best-in-class (7.6/10) against Docling, MarkItDown, Pandoc raw, and Mammoth. Trigger on "convert document", "docx to markdown", "parse word", "doc to markdown", "解析word", "转换文档".
---
# 文档转 Markdown

通过智能多工具编排和自动 DOCX 后处理，将文档转换为高质量的 Markdown。

**架构**：Pandoc（业界领先的提取能力）+ 8 项后处理修复（我们的增值功能）。

## 快速开始

```bash
# DOCX → Markdown（一个命令，无需手动修复）
uv run --with pymupdf4llm --with markitdown scripts/convert.py document.docx -o output.md --assets-dir ./media

# PDF → Markdown
uv run --with pymupdf4llm --with markitdown scripts/convert.py document.pdf -o output.md

# 运行测试
uv run --with pytest pytest scripts/test_convert.py -v
```

## 双模式

| 模式 | 速度 | 质量 | 使用场景 |
|------|-------|---------|----------|
| **快速**（默认） | 快 | 良好 | 草稿、简单文档 |
| **重型** | 较慢 | 最佳 | 最终文档、复杂布局 |

## 工具选择

| 格式 | 快速模式 | 重型模式 |
|--------|-----------|------------|
| PDF | pymupdf4llm | pymupdf4llm + markitdown |
| DOCX | pandoc + 后处理 | pandoc + markitdown |
| PPTX | markitdown | markitdown + pandoc |
| XLSX | markitdown | markitdown |

## DOCX 后处理（自动）

通过 pandoc 转换 DOCX 时，会自动应用 8 项清理：

| 问题 | 修复方式 | 测试覆盖 |
|---------|-----|---------------|
| 网格表格（`+:---+`） | 单列 → 块引用，多列 → 管道表格 | `TestPostprocessPipeline` |
| 简单表格（`  ---- ----`） | 多列图片 → 带标题的管道表格 | `TestSimpleTable` |
| 图片路径嵌套（`media/media/`） | 展平为 `media/`，绝对路径 → 相对路径 | `test_stats_tracking` |
| Pandoc 属性（`{width="..."}`） | 移除 | `test_pandoc_attributes_removed` |
| CJK 粗体间距（`**粗体**中文`） | 在 CJK 粗体片段的 `**` 周围添加空格 | `TestCjkBoldSpacing`（15 个案例） |
| 缩进的破折号代码块 | → 带语言检测的围栏式 ``` | `test_code_block_with_language` |
| 转义括号（`\[...\]`） | → `[...]` | `test_escaped_brackets_fixed` |
| 双括号链接（`[[text]](url)`） | → `[text](url)` | `test_double_bracket_links_fixed` |

## PDF 后处理（自动，自 2026-08-30 起）

通过 pymupdf4llm 转换 PDF 时，会自动应用 3 项清理（使用 `--no-postprocess` 跳过）：

| 问题 | 修复方式 | 测试覆盖 |
|---------|-----|---------------|
| 图片区域中的 Tesseract OCR 垃圾内容（`<!-- Start of picture text -->...`） | 移除区块；保留图片本身 | `TestStripOcrPictureText` |
| 重复的页眉/页脚/水印行（在至少 60% 的页面上出现相同的规范化行，包括对角水印） | 通过 pymupdf 跨页面扫描检测，并从 markdown 中移除；加粗包裹以及与页码合并的变体也能被捕获 | `TestRepeatingLines` |
| 绝对图片路径（`![](/abs/tmp/assets/...)`） | 重写为相对于输出 markdown 文件的路径（实现可移植输出） | `TestImagePathsRelative` |

当某个引擎失败且合并结果原本会静默降级为单引擎输出时，重型模式还会在 stderr 上额外打印醒目的 `⚠️ HEAVY MODE DEGRADED` 警告。

**已知限制（根据 2026-08-30 对一份 62 页中文研究报告的转换结果总结）：**
- pymupdf4llm 可能会输出重复段落（源文本层中实际上只有一份）——不会自动修复；请抽查。
- 带点线的目录页会被识别为表格——如果目录内容很重要，请手动重写目录。
- 跨页表格不会合并（每页的片段都会保留各自的表头行）——请手动合并。
- 被对角线水印覆盖的表格单元格中可能包含水印字符碎片（`dn`、`uFE`……）；重复行去除器只会移除完整的行，不会移除单元格内部的碎片。水印较多的 PDF 需要按单元格重建（收集每个单元格边界框内的非水印文本片段）。
- 复杂的信息图（图像中包含大量文本）只会被提取为图像；要转录图像中的文字，需要执行 VLM 流程，而不是使用此工具。

### CJK 粗体间距 — 原因与方法

DOCX 使用运行级样式（CJK 文本中的粗体/普通文本运行之间没有空格）。Markdown 渲染器需要在 `**` 两侧留有空白，才能识别粗体边界。

**规则**：如果 `**content**` 跨度中包含任何 CJK 字符，请确保其两侧都有空格——除非两侧已经有空格，或位于行首/行尾。此规则可以处理 CJK 标点、表情符号相邻以及混合内容的情况。

```
Before: 打开**飞书**，就可以    → 某些渲染器无法正确显示粗体
After:  打开 **飞书** ，就可以  → 所有渲染器都能正确显示
```

## 重型模式工作流

重型模式会并行运行多个工具，并选择最佳片段：

1. **并行执行**：同时运行所有适用的工具
2. **片段分析**：将每个输出解析为片段（表格、标题、图像、段落）
3. **质量评分**：根据完整性和结构为每个片段评分
4. **智能合并**：从各工具的输出中为每个片段选择最佳版本

### 合并标准

| 片段类型 | 选择标准 |
|--------------|-------------------|
| 表格 | 行数/列数更多，且包含正确的表头分隔线 |
| 图像 | 存在替代文本，且优先选择本地路径 |
| 标题 | 层级正确，长度恰当 |
| 列表 | 条目更多，且保留嵌套结构 |
| 段落 | 内容完整性 |

## 图像提取

```bash
# Extract images with metadata
uv run --with pymupdf scripts/extract_pdf_images.py document.pdf -o ./extracted-images

# Generate markdown references file
uv run --with pymupdf scripts/extract_pdf_images.py document.pdf --markdown refs.md
```

输出：
- 图像：`extracted-images/img_page1_1.png`、`extracted-images/img_page2_1.jpg`
- 元数据：`extracted-images/images_metadata.json`（页码、位置、尺寸）

## 质量验证

```bash
# Validate conversion quality
uv run --with pymupdf scripts/validate_output.py document.pdf output.md

# Generate HTML report
uv run --with pymupdf scripts/validate_output.py document.pdf output.md --report report.html
```

### 质量指标

| 指标 | 通过 | 警告 | 失败 |
|------|------|------|------|
| 文本保留率 | >95% | 85-95% | <85% |
| 表格保留率 | 100% | 90-99% | <90% |
| 图像保留率 | 100% | 80-99% | <80% |

## 手动合并输出

```bash
# Merge multiple markdown files
python scripts/merge_outputs.py output1.md output2.md -o merged.md

# Show segment attribution
python scripts/merge_outputs.py output1.md output2.md -o merged.md --verbose
```

## 路径转换（Windows/WSL）

```bash
# Windows to WSL conversion
python scripts/convert_path.py "C:\Users\<windows-user>\Documents\file.pdf"
# Output: /mnt/c/Users/<windows-user>/Documents/file.pdf
```

## 常见问题

**“No conversion tools available”**
```bash
# Install all tools
pip install pymupdf4llm
uv tool install "markitdown[pdf]"
brew install pandoc
```

**PDF 转换期间出现 FontBBox 警告**
- 无害的字体解析警告，输出仍然正确

**输出中缺少图像**
- 使用 Heavy Mode 以更好地保留图像
- 或使用 `scripts/extract_pdf_images.py` 单独提取

**输出中的表格损坏**
- 使用 Heavy Mode——它会选择最完整的表格版本
- 或使用 `scripts/validate_output.py` 进行验证

## 随附脚本

| Script | Purpose |
|--------|---------|
| `convert.py` | 支持 Quick/Heavy mode 和 DOCX 后处理的主要编排器 |
| `test_convert.py` | 覆盖所有后处理函数的 31 个测试 |
| `merge_outputs.py` | 合并多个 markdown 输出 |
| `validate_output.py` | 使用 HTML 报告进行质量验证 |
| `extract_pdf_images.py` | 带元数据的 PDF 图像提取 |
| `convert_path.py` | Windows 到 WSL 的路径转换器 |

## 参考资料

- `references/benchmark-2026-03-22.md` - 5 种工具的基准测试（Docling/MarkItDown/Pandoc/Mammoth/ours）
- `references/heavy-mode-guide.md` - Heavy Mode 详细文档
- `references/tool-comparison.md` - 工具功能对比
- `references/conversion-examples.md` - 批量操作示例

## 下一步：清理转换后的内容

将文档转换为 markdown 后，建议进行清理：

```
Conversion complete: [N] files converted to markdown.

Options:
A) Clean up docs — run /daymade-docs:docs-cleaner to consolidate redundant content (Recommended if multiple files)
B) Check facts — run /fact-checker to verify claims in the converted content
C) No thanks — the markdown conversion is sufficient
```