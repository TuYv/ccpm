---
name: xlsx
description: "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .xltx, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."
license: Proprietary. LICENSE.txt has complete terms
---
# XLSX 创建、编辑与分析

| 任务 | 方法 |
|---|---|
| 使用公式/格式化**创建**或**编辑** | `openpyxl` — 见下方注意事项 |
| **大规模数据** 导入导出 | `pandas`（`read_excel`、`to_excel`） |
| 快速查看工作表 | `markitdown file.xlsx` — 每个工作表对应 `## SheetName`；也可读取 `.xlsm`。不显示单元格坐标，因此不要据此安排编辑 |
| **读取**模型（公式*及*值） | 两次 `load_workbook` 调用 — 见下方注意事项 |

> `openpyxl`、`pandas` 和 `markitdown` 已预装——不要先运行 `pip install`；直接编写脚本并导入它们。只有当导入失败（或缺少 `markitdown` 命令）时，才 `pip install` 缺失的包。

> 下面的脚本路径均相对于本 skill 的目录。

## 每个输出的要求

- **专业字体**（Arial、Times New Roman）贯穿全表，除非用户另有说明。  
- **零公式错误。** 绝不能在 `recalc.py` 报告 `errors_found` 时提交。如果你认为错误是你接手前就存在的，请验证：使用 `data_only=True` 加载*原始文件*并查看对应单元格。你引入的错误看起来会与继承的错误完全一致。  
- **始终使用公式，不要写死结果。** 写 `sheet['B10'] = '=SUM(B2:B9)'`，而不是 Python 计算后的总数。输入变化时表格必须能自动重算。  
- **严格按用户规格执行。** 工作表名、列头、以及用户给出的公式必须完全一致。即使更优雅，但计算内容不同的重构也会失败。  
- **在读者可见处记录每个假设和硬编码数值**——可以用单元格批注，或在表格末尾相邻单元格注明。若存在真实来源，请引用来源（`来源：Company 10-K，FY2024，第45页，Revenue Note，[SEC EDGAR URL]`）；若数值来自用户，需明确说明。  
- **若你创建一个供他人填写的工作簿**，需要一个简短图例说明可编辑单元格，并给出一行合理示例值展示预期格式。不要把这种示例行加到你被要求编辑的现有文件中。  
- **编辑现有文件：必须完全匹配其既有约定。** 它们优先于本节所有规则。先找到指定输入单元格——通常有特定字体颜色、填充或底纹标记——仅在这些单元格中填写内容，并保持现有公式不变。

## 重新计算（文件包含公式时必需）

`openpyxl` 将公式写为字符串且**不带缓存值**。在重算前，任何读取缓存值的方式都会把公式单元格读成 `None`，包括 `pandas`、`load_workbook(data_only=True)` 以及大多数预览器。

```bash
python scripts/recalc.py output.xlsx [timeout_seconds]   # default 30
```

LibreOffice 会计算全部公式，文件会被**原地重写**，并返回 JSON：`status`（`success` | `errors_found`）、`total_formulas`、`total_errors`，以及每种错误最多列出 100 个单元格的 `error_summary`（`locations_truncated` 表示有多少被省略——请以 `total_errors` 为准，不要以列表长度为准）。按其提示修复后再运行一次。若 JSON 返回 `error` 键而非 `status`，表示未进行任何重算；并且只有这种情况会以非零码退出，`errors_found` 仍然是退出码 0，所以不要把“成功退出”误当作“工作簿无误”。

**绿色的重算结果只能说明公式可执行**，不能说明公式就是正确的。上下偏移一格或引用到错误行也会得到无错误但数值错误的文件。先写 2–3 个公式并检查其是否提取到预期值，再继续扩展表格。

**若工作簿链接到其他文件**，在用 openpyxl 重保存后再重算会丢失这些链接。此类公式会表现为 `='[1]Returns Analysis'!$B$2`，其中 `[1]` 是外部引用列表中的索引，指向磁盘上的**另一个文件**，不是工作表。由于该文件在当前环境通常不存在，单元格的缓存值往往是唯一可见数据。openpyxl 在保存时会移除该值；LibreOffice 之后会尝试真实解析该引用，失败后写出 `#NAME?` 并删除全部链接。`recalc.py` 在此状态下会拒绝运行——在覆盖保存前先从原文件中拷贝这些单元格的值（`--force` 可覆盖，并接受数据丢失）。

## 选择可通过校验的公式

LibreOffice 实现的函数少于 Excel，任何它不能识别的函数都会在你交付的文件中被**硬写为** `#NAME?`。

- **优先使用 Excel 2007 时代函数**：`SUMIFS`、`INDEX`、`MATCH`、`IFERROR`、`SUMPRODUCT`，这些函数不需要前缀。  
- **六个 2007 后函数可以使用，但必须加 `_xlfn.` 前缀**，因为 openpyxl 会逐字写入 XML，而 Excel 将 2007 后的名称以该前缀存储（界面会隐藏该前缀）：`_xlfn.TEXTJOIN`、`_xlfn.CONCAT`、`_xlfn.IFS`、`_xlfn.SWITCH`、`_xlfn.MAXIFS`、`_xlfn.MINIFS`。不加前缀时都会得到 `#NAME?`。  
- **不要使用 `XLOOKUP`、`XMATCH`、`SORT`、`FILTER`、`UNIQUE` 或 `SEQUENCE`。** 运行时的 LibreOffice 在任何前缀下都无法计算它们。新版 LibreOffice 可能能算，但 openpyxl 写入的文件没有溢出元数据，因此范围内只有左上角单元格有值，`recalc.py` 会对截断结果报 `total_errors: 0`。查找请改用 `INDEX`/`MATCH`，筛选、排序和去重请在写入前用 Python 处理。  
- LibreOffice 无法解析的公式会被写回为**小写**，这在 `#NAME?` 附近是一个快速识别信号。

## openpyxl 注意事项

- **读取模型需要两次加载。** `data_only=True` 会返回带缓存值且不含公式字符串；默认模式会返回公式字符串且无值。单次读取无法同时获得二者。  
- **`data_only=True` 是破坏性的**：该工作簿会丢失公式，保存时会把每个公式替换为字面量，且是永久性的。  
- **对 openpyxl 刚写入的文件使用 `data_only=True` 会全为 `None`**——先运行 `recalc.py`。（结果为 `""` 的公式也会读回 `None`。）  
- **合并单元格：仅写左上角锚点。** 该范围内其他单元格是 `MergedCell`，其 `.value` 为只读。  
- **除非传入 `keep_vba=True` 给 `load_workbook`，否则 `.xlsm` 会丢失宏。**  
- **含空格的工作表名在跨表引用中必须加引号：** `='Assumptions Inputs'!$B$5`。未加引号会计算为 `#VALUE!`。

## 财务模型

除非用户另有说明，或现有文件已有其他设置。

**颜色：** 硬编码输入与情景杠杆用蓝色文字（`0,0,255`）· 公式用黑色 · 链接到其他工作表用绿色（`0,128,0`）· 链接到其他文件用红色（`255,0,0`）· 关键假设和用户应填写单元格用黄色填充（`255,255,0`）。

**数字格式：** 货币为 `$#,##0`，单位写在表头（如 `Revenue ($mm)`）· 0 显示为 `-`，百分比也如此（`$#,##0;($#,##0);-`）· 负数用括号表示 · 百分比用 `0.0%`，**按分数存储**（`0.15` 显示为 `15.0%`；若存 `15` 会显示为 `1500.0%`）· 估值倍数 `0.0x` · 年份按文本存储（`"2024"`，而非 `2,024`）。

**结构：** 每个假设单独放在标注清晰的单元格中，并由使用它的公式引用（如 `=B5*(1+$B$6)`，不要写 `=B5*1.05`）· 同一投影期内公式保持一致，因为单行中单元格被单独改动是最常见的静默错误 · 对分母为零的情况要做保护。

## 依赖项

`openpyxl`、`pandas`、`markitdown`（`pip` 已预装，仅在导入失败或命令缺失时安装）· LibreOffice（`soffice`，通过 `scripts/office/soffice.py` 为沙箱环境自动配置）
