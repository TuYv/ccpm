---
name: docx
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files) or Word templates (.dotx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', '.dotx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx or .dotx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
license: Proprietary. LICENSE.txt has complete terms
metadata:
  version: "2.1"
  skill-author: Anthropic, PBC
  source: https://github.com/anthropics/skills/tree/main/skills/docx
---
# DOCX 创建、编辑和分析

`.docx` 是 XML 文件的 ZIP 归档。根据任务选择处理方式：

| 任务 | 方法 |
|---|---|
| **创建** 新文档 | 编写一个 `docx`（npm）脚本 — 请参阅下面的注意事项 |
| **编辑** 现有文档 | `unzip` → 编辑 `word/document.xml` → `zip`（docx-js 无法打开现有文件） |
| **读取** 内容 | `pandoc -t markdown file.docx` |

> 下面的脚本路径均相对于此 skill 的目录。

## 使用 docx-js 创建 — 注意事项

`docx` 已预安装 — 不要先运行 `npm install`；直接编写脚本并使用 `require('docx')`。只有在该 require 失败时，才运行 `npm install docx`。模型了解该 API；以下是容易踩坑的地方：

- **页面大小默认为 A4。** 对于 US Letter，请设置 `page: { size: { width: 12240, height: 15840 } }`（DXA；1440 = 1″）。
- **横向页面：** 传入纵向尺寸并设置 `orientation: PageOrientation.LANDSCAPE` — docx-js 会在内部交换宽度和高度。
- **表格需要设置双重宽度：** 在表格上设置 `columnWidths`，并在每个单元格上设置 `width`，二者都使用 `WidthType.DXA`（`PERCENTAGE` 在 Google Docs 中会失效）。列宽之和必须等于表格宽度。
- **表格底纹：** 使用 `ShadingType.CLEAR`，不要使用 `SOLID`（否则会渲染为黑色）。
- **列表：** 绝不要直接插入 `•`；使用带有 `LevelFormat.BULLET` 的 `numbering` 配置。
- **`ImageRun` 需要 `type:`**（`"png"`、`"jpg"` 等）。
- **`PageBreak` 必须位于 `Paragraph` 内部。**
- **绝不要使用 `\n`** — 使用单独的 `Paragraph` 元素。
- **目录（TOC）：** 标题必须使用内置的 `HeadingLevel.*`；自定义标题样式需要设置 `outlineLevel`，否则不会出现在目录中。
- **不要使用表格作为水平线** — 应改用段落底部边框。
- **点引导符 / 同一行右对齐：** 在 `TextRun` 内使用 `PositionalTab`（`alignment: PositionalTabAlignment.RIGHT`、`leader: PositionalTabLeader.DOT`），不要使用字面量 `.` 或空格填充。

## 验证输出

写入 `.docx` 后，将其渲染并查看：

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg   # then Read the images
```

`pdftoppm` 会根据页数的位数对页码进行零填充（`page-01.jpg`…`page-12.jpg`）。

## 编辑现有文档

必须先转换旧版 `.doc` 文件：`python scripts/office/soffice.py --headless --convert-to docx file.doc`。

```bash
unzip -q doc.docx -d unpacked/
find unpacked -type l -delete   # strip symlink entries — docx from external parties is untrusted
python scripts/merge_runs.py unpacked/   # coalesce fragmented runs so text is findable
# edit unpacked/word/document.xml in place — do NOT reformat or pretty-print
(cd unpacked && rm -f ../out.docx && zip -Xr ../out.docx .)
python scripts/office/validate.py out.docx --original doc.docx   # XSD checks; --auto-repair fixes common issues
# redlining? add --author "<the name you redlined under>" to check every edit is tracked
```

Word 会将文本拆分到许多 `<w:r>` run 中（修订 id、拼写检查标记），因此你在文档中看到的短语通常不会作为连续字符串存在于 XML 中。`merge_runs.py` 会合并 `word/document.xml` 中格式相同且相邻的 run，同时不会更改内容或渲染效果；它也接受 `.docx` 文件作为直接输入（`python scripts/merge_runs.py doc.docx -o merged.docx`）。

**跟踪更改：**进行修订标注时，使用 `--author "<the name you redlined under>"` 进行验证（需要 `--original`）——它会报告你更改但未在其周围添加 `<w:ins>`/`<w:del>` 的任何文本；这种情况很容易意外发生，并且在接受更改后的视图中不可见。使用带有 `w:id`、`w:author`、`w:date` 属性的 `<w:ins>`/`<w:del>` 包裹文本运行。在 `<w:del>` 内，文本元素是 `<w:delText>`，而不是 `<w:t>`。删除段落标记（`<w:pPr><w:rPr><w:del w:id=".." w:author=".." w:date=".."/></w:rPr></w:pPr>`）表示“将此段落合并到下一段”——因此，彻底删除一个段落需要执行上述操作，并用 `<w:del>` 包裹每个运行。`<w:del/>` 必须位于 rPr 的其他子元素之前；其顺序由架构强制规定。

要生成一份接受所有跟踪更改的干净副本：`python scripts/accept_changes.py in.docx out.docx`。

接受删除的段落标记后，应将该段落与其下方的段落连接起来，因此一个所有运行都被删除的段落会消失。Word 会这样处理；`accept_changes.py` 和 `pandoc --track-changes=accept` 则不总是如此。两者都会以相同的方式失败——它们会删除已删除的文本，却留下空段落；当该段落使用了自动编号时，空段落会显示为多余的空项目符号：

- `pandoc --track-changes=accept` 从不合并段落。
- `accept_changes.py`（LibreOffice）通常能正确合并，但删除的段落后面紧接着一个空的间隔段落时除外。

任一视图中的空项目符号都是该视图产生的结果，并非文档缺陷。请在 XML 中检查段落删除情况。

## 评论

评论需要六个相互关联的文件。使用辅助工具——如果还要编辑 `document.xml`，请使用目录模式（可避免一次解压/重新打包循环）；否则使用 `.docx` 直接模式：

```bash
# Against an already-unpacked directory (preferred when also placing markers)
python scripts/comment.py unpacked/ "Fees & expenses cap is too low"
python scripts/comment.py unpacked/ "Agreed" --parent 0

# Against a .docx directly
python scripts/comment.py contract.docx "This cap is too low" -o annotated.docx
```

该脚本会写入 `comments.xml`、`commentsExtended.xml`、`commentsIds.xml`、`commentsExtensible.xml`、关系文件以及内容类型覆盖项。评论 ID 会自动分配。随后，它会打印要添加到 `word/document.xml` 的 `<w:commentRangeStart>`/`<w:commentRangeEnd>`/`<w:commentReference>` 片段，以便将评论锚定到特定文本——在放置这些标记之前，评论虽已存在，但不可见。

## 依赖项

`docx`（npm，已预安装——仅当 `require('docx')` 失败时才安装）· `pandoc` · LibreOffice（`soffice`）· `pdftoppm`（Poppler）

---

*此 skill 由 [Anthropic](https://github.com/anthropics/skills/tree/main/skills/docx) 创建并维护。除 frontmatter 元数据外，此处原样引入；相关条款请参阅 LICENSE.txt。*