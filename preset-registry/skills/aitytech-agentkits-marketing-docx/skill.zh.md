---
name: document-skills/docx
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: document
difficulty: intermediate
description: "Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"
license: Proprietary. LICENSE.txt has complete terms
triggers:
  - Word document
  - DOCX
  - Word file
  - create document
  - edit Word
prerequisites: []
related_skills:
  - document-skills/pdf
  - document-skills/pptx
agents:
  - docs-manager
  - copywriter
mcp_integrations:
  optional: []
success_metrics: []
---
# DOCX 创建、编辑与分析

## 语言与质量标准

**关键要求**：使用与用户相同的语言回复。如果用户使用越南语，则使用越南语回复。如果用户使用西班牙语，则使用西班牙语回复。

**标准**：提高 token 效率，可牺牲语法以求简洁，在末尾列出尚未解决的问题。

---

## 概述

用户可能会要求你创建、编辑或分析 .docx 文件的内容。.docx 文件本质上是一个 ZIP 归档，其中包含 XML 文件和其他可供读取或编辑的资源。针对不同任务，你可以使用不同的工具和工作流。

## 工作流决策树

### 读取/分析内容
使用下方的“文本提取”或“原始 XML 访问”部分

### 创建新文档
使用“创建新的 Word 文档”工作流

### 编辑现有文档
- **你自己的文档 + 简单更改**
  使用“基础 OOXML 编辑”工作流

- **他人的文档**
  使用**“修订工作流”**（建议默认使用）

- **法律、学术、商业或政府文档**
  使用**“修订工作流”**（必须使用）

## 读取和分析内容

### 文本提取
如果只需读取文档的文本内容，应使用 pandoc 将文档转换为 markdown。Pandoc 对保留文档结构提供了出色支持，并且可以显示修订内容：

```bash
# Convert document to markdown with tracked changes
pandoc --track-changes=all path-to-file.docx -o output.md
# Options: --track-changes=accept/reject/all
```

### 原始 XML 访问
以下内容需要原始 XML 访问：批注、复杂格式、文档结构、嵌入式媒体和元数据。对于其中任何功能，都需要解压文档并读取其原始 XML 内容。

#### 解压文件
`python ooxml/scripts/unpack.py <office_file> <output_directory>`

#### 关键文件结构
* `word/document.xml` - 文档主要内容
* `word/comments.xml` - document.xml 中引用的批注
* `word/media/` - 嵌入的图像和媒体文件
* 修订内容使用 `<w:ins>`（插入）和 `<w:del>`（删除）标签

## 创建新的 Word 文档

从头创建新的 Word 文档时，请使用 **docx-js**，它支持使用 JavaScript/TypeScript 创建 Word 文档。

### 工作流
1. **强制要求——阅读整个文件**：从头到尾完整阅读 [`docx-js.md`](docx-js.md)（约 500 行）。**阅读此文件时绝不能设置任何范围限制。** 在继续创建文档之前，请阅读完整文件内容，以了解详细语法、关键格式规则和最佳实践。
2. 使用 Document、Paragraph、TextRun 组件创建 JavaScript/TypeScript 文件（可以假定所有依赖项均已安装；如果没有，请参阅下方的依赖项部分）
3. 使用 Packer.toBuffer() 导出为 .docx

## 编辑现有 Word 文档

编辑现有 Word 文档时，请使用 **Document library**（用于 OOXML 操作的 Python 库）。该库会自动处理基础设施设置，并提供文档操作方法。对于复杂场景，可以通过该库直接访问底层 DOM。

### 工作流程
1. **强制要求——阅读整个文件**：从头到尾完整阅读 [`ooxml.md`](ooxml.md)（约 600 行）。**读取此文件时绝不要设置任何范围限制。** 阅读完整的文件内容，以了解用于直接编辑文档文件的 Document 库 API 和 XML 模式。
2. 解包文档：`python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. 使用 Document 库创建并运行 Python 脚本（请参阅 ooxml.md 中的“Document 库”部分）
4. 打包最终文档：`python ooxml/scripts/pack.py <input_directory> <office_file>`

Document 库既提供用于常见操作的高级方法，也提供适用于复杂场景的直接 DOM 访问能力。

## 文档审阅的修订工作流程

此工作流程允许你先使用 Markdown 规划全面的修订，然后再在 OOXML 中实施。**关键要求**：为确保修订完整，必须系统地实施所有更改。

**批处理策略**：将相关更改分成若干批次，每批包含 3 至 10 项更改。这样既能提高效率，又便于调试。在进入下一批之前测试每一批更改。

**原则：最小化、精确的编辑**
实施修订时，只标记实际发生变化的文本。重复未更改的文本会增加审阅难度，并且显得不专业。将替换内容拆分为：[未更改的文本] + [删除] + [插入] + [未更改的文本]。通过从原文中提取 `<w:r>` 元素并复用它，保留未更改文本对应的原始 run 的 RSID。

示例——将句子中的“30 days”改为“60 days”：
```python
# BAD - Replaces entire sentence
'<w:del><w:r><w:delText>The term is 30 days.</w:delText></w:r></w:del><w:ins><w:r><w:t>The term is 60 days.</w:t></w:r></w:ins>'

# GOOD - Only marks what changed, preserves original <w:r> for unchanged text
'<w:r w:rsidR="00AB12CD"><w:t>The term is </w:t></w:r><w:del><w:r><w:delText>30</w:delText></w:r></w:del><w:ins><w:r><w:t>60</w:t></w:r></w:ins><w:r w:rsidR="00AB12CD"><w:t> days.</w:t></w:r>'
```

### 修订工作流程

1. **获取 Markdown 表示形式**：将文档转换为 Markdown，并保留修订：
   ```bash
   pandoc --track-changes=all path-to-file.docx -o current.md
   ```

2. **识别更改并进行分组**：审阅文档并识别所需的所有更改，将它们组织成逻辑批次：

   **定位方法**（用于在 XML 中查找更改）：
   - 章节/标题编号（例如，“Section 3.2”“Article IV”）
   - 编号段落的标识符
   - 使用带有唯一上下文文本的 Grep 模式
   - 文档结构（例如，“first paragraph”“signature block”）
   - **不要使用 Markdown 行号**——它们无法映射到 XML 结构

   **批次组织方式**（每批包含 3 至 10 项相关更改）：
   - 按章节：“Batch 1: Section 2 amendments”“Batch 2: Section 5 updates”
   - 按类型：“Batch 1: Date corrections”“Batch 2: Party name changes”
   - 按复杂程度：先进行简单的文本替换，再处理复杂的结构性更改
   - 按顺序：“Batch 1: Pages 1-3”“Batch 2: Pages 4-6”

3. **阅读文档并解包**：
   - **强制要求——阅读整个文件**：从头到尾完整阅读 [`ooxml.md`](ooxml.md)（约 600 行）。**读取此文件时绝不要设置任何范围限制。**请特别注意“文档库”和“修订模式”部分。
   - **解包文档**：`python ooxml/scripts/unpack.py <file.docx> <dir>`
   - **记下建议的 RSID**：解包脚本会建议一个用于修订的 RSID。复制此 RSID，以便在步骤 4b 中使用。

4. **分批实施更改**：按逻辑对更改进行分组（按章节、类型或位置邻近程度），并在单个脚本中一起实施。这种方法：
   - 使调试更容易（批次越小，就越容易隔离错误）
   - 支持增量推进
   - 保持效率（每批包含 3-10 项更改效果较好）

   **建议的批次分组方式：**
   - 按文档章节（例如，“第 3 节更改”“定义”“终止条款”）
   - 按更改类型（例如，“日期更改”“当事方名称更新”“法律术语替换”）
   - 按位置邻近程度（例如，“第 1-3 页的更改”“文档前半部分的更改”）

   对于每一批相关更改：

   **a. 将文本映射到 XML**：在 `word/document.xml` 中使用 grep 搜索文本，以确认文本如何拆分到各个 `<w:r>` 元素中。

   **b. 创建并运行脚本**：使用 `get_node` 查找节点、实施更改，然后执行 `doc.save()`。有关模式，请参阅 ooxml.md 中的**“文档库”**部分。

   **注意**：在编写脚本前，务必立即对 `word/document.xml` 执行 grep，以获取当前行号并验证文本内容。每次运行脚本后，行号都会发生变化。

5. **打包文档**：完成所有批次后，将解包后的目录重新转换为 .docx：
   ```bash
   python ooxml/scripts/pack.py unpacked reviewed-document.docx
   ```

6. **最终验证**：对完整文档进行全面检查：
   - 将最终文档转换为 markdown：
     ```bash
     pandoc --track-changes=all reviewed-document.docx -o verification.md
     ```
   - 验证所有更改均已正确应用：
     ```bash
     grep "original phrase" verification.md  # Should NOT find it
     grep "replacement phrase" verification.md  # Should find it
     ```
   - 检查是否引入了任何非预期更改


## 将文档转换为图像

要直观分析 Word 文档，请通过以下两步流程将其转换为图像：

1. **将 DOCX 转换为 PDF**：
   ```bash
   soffice --headless --convert-to pdf document.docx
   ```

2. **将 PDF 页面转换为 JPEG 图像**：
   ```bash
   pdftoppm -jpeg -r 150 document.pdf page
   ```
   这会创建 `page-1.jpg`、`page-2.jpg` 等文件。

选项：
- `-r 150`：将分辨率设置为 150 DPI（可根据质量与大小之间的平衡进行调整）
- `-jpeg`：输出 JPEG 格式（如果更喜欢 PNG，可使用 `-png`）
- `-f N`：要转换的第一页（例如，`-f 2` 表示从第 2 页开始）
- `-l N`：要转换的最后一页（例如，`-l 5` 表示在第 5 页停止）
- `page`：输出文件的前缀

指定范围示例：
```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # Converts only pages 2-5
```

## 代码风格指南
**重要**：为 DOCX 操作生成代码时：
- 编写简洁的代码
- 避免冗长的变量名和重复操作
- 避免不必要的打印语句

## 依赖项

所需依赖项（如果尚未安装）：

- **pandoc**：`sudo apt-get install pandoc`（用于文本提取）
- **docx**：`npm install -g docx`（用于创建新文档）
- **LibreOffice**：`sudo apt-get install libreoffice`（用于转换为 PDF）
- **Poppler**：`sudo apt-get install poppler-utils`（用于通过 pdftoppm 将 PDF 转换为图像）
- **defusedxml**：`pip install defusedxml`（用于安全解析 XML）