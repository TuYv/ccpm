---
name: doc-to-markdown
description: Converts DOCX/PDF/PPTX to high-quality Markdown with automatic post-processing. Fixes pandoc grid tables, simple tables, image paths, CJK bold spacing, attribute noise, and code blocks. Benchmarked best-in-class (7.6/10) against Docling, MarkItDown, Pandoc raw, and Mammoth. Trigger on "convert document", "docx to markdown", "parse word", "doc to markdown", "解析word", "转换文档".
---
# 文档转 Markdown

通过智能的多工具编排和自动 DOCX 后处理，将文档转换为高质量 Markdown。

**架构**：Pandoc（业界领先的内容提取工具）+ 8 项后处理修复（我们的增值功能）。

## 快速开始

```bash
# DOCX → Markdown (one command, zero manual fixes)
uv run --with pymupdf4llm --with markitdown scripts/convert.py document.docx -o output.md --assets-dir ./media

# PDF → Markdown
uv run --with pymupdf4llm --with markitdown scripts/convert.py document.pdf -o output.md

# Run tests
uv run --with pytest pytest scripts/test_convert.py -v
```

## 双模式

| 模式 | 速度 | 质量 | 使用场景 |
|------|-------|---------|----------|
| **快速**（默认） | 快 | 良好 | 草稿、简单文档 |
| **重度** | 较慢 | 最佳 | 最终文档、复杂布局 |

## 工具选择

| 格式 | 快速模式 | 重度模式 |
|--------|-----------|------------|
| PDF | pymupdf4llm | pymupdf4llm + markitdown |
| DOCX | pandoc + 后处理 | pandoc + markitdown |
| PPTX | markitdown | markitdown + pandoc |
| XLSX | markitdown | markitdown |

## DOCX 后处理（自动）

通过 pandoc 转换 DOCX 时，会自动应用 8 项清理：

| 问题 | 修复方式 | 测试覆盖 |
|---------|-----|---------------|
| 网格表格（`+:---+`） | 单列 → 引用块，多列 → 管道表格 | `TestPostprocessPipeline` |
| 简单表格（`  ---- ----`） | 多列图片 → 带说明文字的管道表格 | `TestSimpleTable` |
| 图片路径嵌套（`media/media/`） | 扁平化为 `media/`，绝对路径 → 相对路径 | `test_stats_tracking` |
| Pandoc 属性（`{width="..."}`） | 移除 | `test_pandoc_attributes_removed` |
| CJK 粗体间距（`**粗体**中文`） | 在 CJK 粗体范围的 `**` 两侧添加空格 | `TestCjkBoldSpacing`（15 个用例） |
| 缩进的虚线代码块 | → 带语言检测的围栏式 ``` | `test_code_block_with_language` |
| 转义方括号（`\[...\]`） | → `[...]` | `test_escaped_brackets_fixed` |
| 双方括号链接（`[[text]](url)`） | → `[text](url)` | `test_double_bracket_links_fixed` |

### CJK 粗体间距——原因与处理方式

DOCX 使用文本片段级样式（CJK 文本中的粗体与普通文本片段之间没有空格）。Markdown 渲染器需要在 `**` 两侧留出空白，才能识别粗体边界。

**规则**：如果 `**content**` 范围内包含任何 CJK 字符，请确保其两侧都有空格——除非已有空格或位于行边界。此规则可处理与 CJK 标点、表情符号相邻以及混合内容等情况。

```
Before: 打开**飞书**，就可以    → some renderers fail to bold
After:  打开 **飞书** ，就可以  → universally renders correctly
```

## 重度模式工作流

重度模式会并行运行多个工具，并选择最佳片段：

1. **并行执行**：同时运行所有适用的工具
2. **片段分析**：将每个输出解析为片段（表格、标题、图片、段落）
3. **质量评分**：根据完整性和结构为每个片段评分
4. **智能合并**：从各工具的输出中选择每个片段的最佳版本

### 合并标准

| 分段类型 | 选择标准 |
|--------------|-------------------|
| 表格 | 行数/列数更多，表头分隔符正确 |
| 图片 | 包含替代文本，优先使用本地路径 |
| 标题 | 层级正确，长度适当 |
| 列表 | 条目更多，保留嵌套结构 |
| 段落 | 内容完整性 |

## 图片提取

```bash
# Extract images with metadata
uv run --with pymupdf scripts/extract_pdf_images.py document.pdf -o ./extracted-images

# Generate markdown references file
uv run --with pymupdf scripts/extract_pdf_images.py document.pdf --markdown refs.md
```

输出：
- 图片：`extracted-images/img_page1_1.png`、`extracted-images/img_page2_1.jpg`
- 元数据：`extracted-images/images_metadata.json`（页面、位置、尺寸）

## 质量验证

```bash
# Validate conversion quality
uv run --with pymupdf scripts/validate_output.py document.pdf output.md

# Generate HTML report
uv run --with pymupdf scripts/validate_output.py document.pdf output.md --report report.html
```

### 质量指标

| 指标 | 通过 | 警告 | 失败 |
|--------|------|------|------|
| 文本保留率 | >95% | 85-95% | <85% |
| 表格保留率 | 100% | 90-99% | <90% |
| 图片保留率 | 100% | 80-99% | <80% |

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

**"No conversion tools available"**
```bash
# Install all tools
pip install pymupdf4llm
uv tool install "markitdown[pdf]"
brew install pandoc
```

**PDF 转换期间出现 FontBBox 警告**
- 这是无害的字体解析警告，输出仍然正确

**输出中缺少图片**
- 使用重度模式以更好地保留图片
- 或使用 `scripts/extract_pdf_images.py` 单独提取

**输出中的表格损坏**
- 使用重度模式——它会选择最完整的表格版本
- 或使用 `scripts/validate_output.py` 进行验证

## 随附脚本

| 脚本 | 用途 |
|--------|---------|
| `convert.py` | 支持快速/重度模式及 DOCX 后处理的主编排器 |
| `test_convert.py` | 包含覆盖所有后处理函数的 31 项测试 |
| `merge_outputs.py` | 合并多个 Markdown 输出 |
| `validate_output.py` | 质量验证及 HTML 报告 |
| `extract_pdf_images.py` | 提取 PDF 图片及元数据 |
| `convert_path.py` | Windows 到 WSL 路径转换器 |

## 参考资料

- `references/benchmark-2026-03-22.md` - 5 工具基准测试（Docling/MarkItDown/Pandoc/Mammoth/ours）
- `references/heavy-mode-guide.md` - 重度模式详细文档
- `references/tool-comparison.md` - 工具功能对比
- `references/conversion-examples.md` - 批量操作示例

## 下一步：清理转换后的内容

将文档转换为 Markdown 后，建议进行清理：

```
Conversion complete: [N] files converted to markdown.

Options:
A) Clean up docs — run /daymade-docs:docs-cleaner to consolidate redundant content (Recommended if multiple files)
B) Check facts — run /fact-checker to verify claims in the converted content
C) No thanks — the markdown conversion is sufficient
```