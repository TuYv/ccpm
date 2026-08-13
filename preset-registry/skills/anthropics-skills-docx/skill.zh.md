---
name: docx
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files) or Word templates (.dotx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', '.dotx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx or .dotx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
license: Proprietary. LICENSE.txt has complete terms
---
# DOCX 创建、编辑与分析

`.docx` 是一个 XML 文件的 ZIP 压缩包。按任务类型选择方法：

| 任务 | 方法 |
|---|---|
| **新建** 文档 | 编写 `docx`（npm）脚本——详见下方注意事项 |
| **编辑**现有文档 | `unzip` → 编辑 `word/document.xml` → `zip`（docx-js 无法打开现有文件） |
| **读取**内容 | `pandoc -t markdown file.docx` |

> 下方脚本路径均相对于本 skill 的目录。

## 使用 docx-js 创建文档——注意事项

`docx` 已预装——不要先运行 `npm install`；直接编写脚本并使用 `require('docx')`。只有当该 `require` 失败时再执行：`npm install docx`。模型知道 API；这些是容易踩坑的点：

- **页面尺寸默认为 A4。** 对于 US Letter 请设置 `page: { size: { width: 12240, height: 15840 } }`（DXA；1440 = 1″）。
- **横向布局：** 传入纵向尺寸并设置 `orientation: PageOrientation.LANDSCAPE` —— docx-js 会在内部交换宽高。
- **表格需要双重宽度：** 在表格上设置 `columnWidths`，并对每个单元格设置 `width`，两者都使用 `WidthType.DXA`（`PERCENTAGE` 在 Google Docs 中会失效）。列宽必须加总等于表格宽度。
- **表格底色：** 使用 `ShadingType.CLEAR`，不要使用 `SOLID`（会渲染成黑色）。
- **列表：** 切勿直接插入 `•`；应使用带 `LevelFormat.BULLET` 的 `numbering` 配置。
- **`ImageRun` 需要 `type:`**（`"png"`、`"jpg"` 等）。
- **`PageBreak` 必须位于 `Paragraph` 内。**
- **禁止使用 `\n`**——应使用独立的 `Paragraph` 元素。
- **TOC（目录）：** 标题必须使用内置的 `HeadingLevel.*`；自定义标题样式需要设置 `outlineLevel`，否则不会显示。
- **不要用表格充当分隔线**——改用段落下边框。
- **点线引导 / 同行右对齐：** 在 `TextRun` 中使用 `PositionalTab`（`alignment: PositionalTabAlignment.RIGHT`，`leader: PositionalTabLeader.DOT`），不要使用字面 `.` 或空格填充。

## 验证输出

写完 `.docx` 后，先渲染再查看：

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg   # then Read the images
```

`pdftoppm` 会按页数宽度补零（如 `page-01.jpg`…`page-12.jpg`）。

## 编辑现有文档

旧版 `.doc` 文件必须先转换：`python scripts/office/soffice.py --headless --convert-to docx file.doc`。

```bash
unzip -q doc.docx -d unpacked/
find unpacked -type l -delete   # strip symlink entries — docx from external parties is untrusted
python scripts/merge_runs.py unpacked/   # coalesce fragmented runs so text is findable
# edit unpacked/word/document.xml in place — do NOT reformat or pretty-print
(cd unpacked && rm -f ../out.docx && zip -Xr ../out.docx .)
python scripts/office/validate.py out.docx --original doc.docx   # XSD checks; --auto-repair fixes common issues
# redlining? add --author "<the name you redlined under>" to check every edit is tracked
```

Word 会将文本拆分为多个 `<w:r>` 片段（修订 ID、拼写检查标记），因此你在文档中看到的一个短语，通常在 XML 中并不存在为连续字符串。`merge_runs.py` 会在 `word/document.xml` 中合并相邻的同样格式化的片段，且不改变内容或渲染结果；它也可以直接接受 `.docx` 文件（`python scripts/merge_runs.py doc.docx -o merged.docx`）。

**修订追踪：** 在进行修订标记时，使用 `--author "<the name you redlined under>"`（需要 `--original`）进行校验；这会报告你更改但周围没有 `<w:ins>`/`<w:del>` 的文本，这种情况很容易出现，而且在已接受视图中不可见。用 `w:id`、`w:author`、`w:date` 属性把片段包在 `<w:ins>`/`<w:del>` 中。`<w:del>` 内的文本元素是 `<w:delText>`，不是 `<w:t>`。删除段落标记（`<w:pPr><w:rPr><w:del w:id=".." w:author=".." w:date=".."/></w:rPr></w:pPr>`）表示“将此段落并入下一段”——因此要彻底删除一个段落，需要加这个标记外加对每个片段都加 `<w:del>`。`<w:del/>` 必须放在 rPr 的其他子元素之前；其顺序受 schema 强制约束。

要生成一个接受所有修订后干净的副本，请执行：`python scripts/accept_changes.py in.docx out.docx`。

接受一个删除段落标记应将该段落与下一段合并，因此当一个段落的片段都被删除时，该段落会消失。Word 会这样处理；`accept_changes.py` 与 `pandoc --track-changes=accept` 不一定始终一致。两者都会出现同一种失败：会去掉被删除文本，但保留已清空的段落，这在自动编号时会显示为多余的空白项目符号：

- `pandoc --track-changes=accept` 从不合并段落。
- `accept_changes.py`（LibreOffice）会正确合并，除非被删除段落后面紧跟一个空的占位段落。

任一视图中的空白项目符号都属于该视图的表现问题，而非文档本身缺陷。应在 XML 中检查段落删除情况。

## 评论

评论需要六个互相关联的文件。使用辅助脚本——当你还会编辑 `document.xml` 时请使用目录模式（可省去 unzip/rezip 循环），否则使用 `.docx` 直连模式：

```bash
# Against an already-unpacked directory (preferred when also placing markers)
python scripts/comment.py unpacked/ "Fees & expenses cap is too low"
python scripts/comment.py unpacked/ "Agreed" --parent 0

# Against a .docx directly
python scripts/comment.py contract.docx "This cap is too low" -o annotated.docx
```

该脚本会写入 `comments.xml`、`commentsExtended.xml`、`commentsIds.xml`、`commentsExtensible.xml`、关系定义以及内容类型覆盖。评论 ID 会自动分配。脚本随后会打印要添加到 `word/document.xml` 的 `<w:commentRangeStart>`/`<w:commentRangeEnd>`/`<w:commentReference>` 片段，以便将评论锚定到特定文本——在放置这些标记前，评论已存在但不可见。

## 依赖项

`docx`（npm，预安装——仅在 `require('docx')` 失败时安装）· `pandoc` · LibreOffice（`soffice`）· `pdftoppm`（Poppler）
