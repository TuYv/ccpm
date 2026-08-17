---
name: docx-format-replicator
description: Extract formatting from existing Word documents and generate new documents with the same format but different content. Use this skill when users need to create multiple documents with consistent formatting, replicate document templates, or maintain corporate document standards across different content.
metadata:
  author: iamzhihuix
  version: "1.0.0"
---
# DOCX 格式复刻器

## 概述

从现有 Word 文档（.docx）中提取格式信息，并使用这些信息生成格式相同但内容不同的新文档。此技能可用于创建文档模板、在多个文档之间保持格式一致，以及复刻复杂的 Word 文档结构。

## 何时使用此技能

当用户有以下需求时，请使用此技能：
- 希望从现有 Word 文档中提取格式
- 需要创建多个格式相同的文档
- 拥有一个模板文档，并希望使用新内容生成类似文档
- 要求“复刻”“复制格式”“使用相同样式”或“创建类似的文档”
- 提及文档模板、企业标准或格式一致性

## 工作流程

### 第 1 步：从模板中提取格式

从现有 Word 文档中提取格式信息，以创建可复用的格式配置。

```bash
python scripts/extract_format.py <template.docx> <output.json>
```

**示例**：
```bash
python scripts/extract_format.py "HY研制任务书.docx" format_template.json
```

**提取的内容**：
- 样式定义（字体、字号、颜色、对齐方式）
- 段落和字符样式
- 编号方案（1、1.1、1.1.1 等）
- 表格结构和样式
- 页眉和页脚配置

**输出**：包含所有格式信息的 JSON 文件（详情请参阅 `references/format_config_schema.md`）

### 第 2 步：准备内容数据

创建一个包含新文档实际内容的 JSON 文件。内容必须遵循 `references/content_data_schema.md` 中定义的结构。

**内容结构**：
```json
{
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "version": "1.0",
    "date": "2025-01-15"
  },
  "sections": [
    {
      "type": "heading",
      "content": "Section Title",
      "level": 1,
      "number": "1"
    },
    {
      "type": "paragraph",
      "content": "Paragraph text content."
    },
    {
      "type": "table",
      "rows": 3,
      "cells": [
        ["Header 1", "Header 2"],
        ["Data 1", "Data 2"]
      ]
    }
  ]
}
```

**支持的章节类型**：
- `heading` - 带有可选编号的标题
- `paragraph` - 文本段落
- `table` - 可配置行和列的表格
- `page_break` - 分页符

完整示例请参阅 `assets/example_content.json`。

### 第 3 步：生成新文档

使用提取的格式和准备好的内容生成新的 Word 文档。

```bash
python scripts/generate_document.py <format.json> <content.json> <output.docx>
```

**示例**：
```bash
python scripts/generate_document.py format_template.json new_content.json output_document.docx
```

**结果**：一个新的 .docx 文件，其中模板的格式已应用于新内容。

## 完整工作流程示例

用户提出：“我有一份研究任务文档。我需要再创建 5 份格式相同但内容不同的文档。”

1. **提取格式**：
```bash
python scripts/extract_format.py research_task_template.docx template_format.json
```

2. **创建内容文件**，每个新文档对应一个文件（content1.json、content2.json 等）

3. **生成文档**：
```bash
python scripts/generate_document.py template_format.json content1.json document1.docx
python scripts/generate_document.py template_format.json content2.json document2.docx
# ... repeat for all documents
```

## 常见用例

### 企业文档模板

从公司模板中提取格式，并生成具有一致品牌风格的报告、提案或规范。

```bash
# One-time: Extract company template
python scripts/extract_format.py "Company Template.docx" company_format.json

# For each new document:
python scripts/generate_document.py company_format.json new_report.json "Monthly Report.docx"
```

### 技术文档系列

创建多个格式完全一致的技术文档（规范、测试计划、手册）。

```bash
# Extract from specification template
python scripts/extract_format.py spec_template.docx spec_format.json

# Generate multiple specs
python scripts/generate_document.py spec_format.json product_a_spec.json "Product A Spec.docx"
python scripts/generate_document.py spec_format.json product_b_spec.json "Product B Spec.docx"
```

### 研究任务文档

随附的示例模板（`assets/hy_template_format.json`）展示了完整的研究任务文档格式，其中包含：
- 页眉中的审批/审核表
- 多级编号（1、1.1、1.1.1）
- 技术规范表格
- 结构化章节

可将其作为创建类似技术文档的起点。

## 高级用法

### 自定义提取

修改 `scripts/extract_format.py`，以提取默认情况下未涵盖的其他属性：
- 自定义 XML 元素
- 高级表格功能（合并单元格、边框）
- 嵌入对象
- 自定义属性

### 扩展内容类型

在 `scripts/generate_document.py` 中添加新的章节类型：
- 带说明文字的图片
- 项目符号列表或编号列表
- 脚注和尾注
- 自定义内容块

有关扩展指南，请参阅 `references/content_data_schema.md`。

### 批量处理

创建一个包装脚本来生成多个文档：

```python
import json
import subprocess

format_file = "template_format.json"
content_files = ["content1.json", "content2.json", "content3.json"]

for i, content_file in enumerate(content_files, 1):
    output = f"document_{i}.docx"
    subprocess.run([
        "python", "scripts/generate_document.py",
        format_file, content_file, output
    ])
```

## 依赖项

这些脚本需要：
- Python 3.7+
- `python-docx` 库：`pip install python-docx`

核心功能无需其他依赖项。

## 资源

### scripts/

- **extract_format.py** - 从 Word 文档中提取格式
- **generate_document.py** - 根据格式和内容生成新文档

两个脚本均提供内置帮助：
```bash
python scripts/extract_format.py --help
python scripts/generate_document.py --help
```

### references/

- **format_config_schema.md** - 格式配置文件的完整模式
- **content_data_schema.md** - 内容数据文件的完整模式

阅读这些文件，了解有关文件结构和可用选项的详细信息。

### assets/

- **hy_template_format.json** - 从技术研究任务文档中提取的格式示例
- **example_content.json** - 展示所有章节类型的内容数据示例

创建自己的格式和内容文件时，请将这些文件用作参考。

## 故障排除

**输出中缺少样式**：确保内容数据中的样式 ID 与格式配置中的样式 ID 一致。检查 `format.json` 中可用的样式 ID。

**表格格式问题**：确认内容数据与格式配置中的表格尺寸（行数/列数）一致。有关表格结构，请参阅 `format_config_schema.md`。

**字体无法正确显示**：某些字体可能并非在所有系统上都可用。请检查引用的字体是否已安装。

**缺少依赖项**：安装所需的 Python 软件包：
```bash
pip install python-docx
```

## 提示

1. **先使用示例进行测试**：在提取自己的格式之前，先使用随附的 `hy_template_format.json` 和 `example_content.json` 来了解工作流程。

2. **从简单内容开始**：先从基本标题和段落开始，然后再添加表格和复杂格式。

3. **验证 JSON**：生成文档之前，使用 JSON 验证工具检查内容数据文件。

4. **保留格式配置**：存储提取出的格式配置，以便在多个项目中重复使用。

5. **版本控制**：对格式配置和内容数据都进行版本控制，以实现可复现的文档生成。