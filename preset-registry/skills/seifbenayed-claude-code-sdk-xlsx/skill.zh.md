---
name: xlsx
description: "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."
allowed-tools: Spreadsheet,Read,Write,Glob,Grep
---
# 输出要求

## 所有 Excel 文件

### 专业字体
- 除非用户另有指示，所有交付成果均使用统一的专业字体（如 Arial、Times New Roman）

### 零公式错误
- 每个 Excel 模型交付时必须做到零公式错误（#REF!、#DIV/0!、#VALUE!、#N/A、#NAME?）
- **务必使用以下方式验证**：`Spreadsheet { action: "check_errors", file_path: "output.xlsx" }`

### 保留现有模板（更新模板时）
- 修改文件时，须研究并精确匹配现有的格式、样式和惯例
- 绝不将标准化格式强加于已有固定模式的文件
- 现有模板惯例始终优先于这些指南

## 财务模型

### 颜色编码标准
除非用户或现有模板另有说明

#### 行业标准颜色惯例
- **蓝色文本（RGB: 0,0,255）**：硬编码输入，以及用户会在情景分析中更改的数字
- **黑色文本（RGB: 0,0,0）**：所有公式和计算
- **绿色文本（RGB: 0,128,0）**：从同一工作簿中其他工作表引用数据的链接
- **红色文本（RGB: 255,0,0）**：指向其他文件的外部链接
- **黄色背景（RGB: 255,255,0）**：需要重点关注的关键假设或需要更新的单元格

### 数字格式标准

#### 必需的格式规则
- **年份**：格式化为文本字符串（例如 "2024" 而非 "2,024"）
- **货币**：使用 $#,##0 格式；必须在表头中注明单位（"Revenue ($mm)"）
- **零值**：使用数字格式将所有零显示为 "-"，包括百分比在内（例如 "$#,##0;($#,##0);-"）
- **百分比**：默认使用 0.0% 格式（一位小数）
- **倍数**：估值倍数（EV/EBITDA、P/E）采用 0.0x 格式
- **负数**：使用括号 (123) 而非减号 -123

### 公式构建规则

#### 假设的放置
- 将所有假设（增长率、利润率、倍数等）放入独立的假设单元格
- 在公式中使用单元格引用，而非硬编码值
- 示例：使用 =B5*(1+$B$6) 而非 =B5*1.05

#### 公式错误预防
- 验证所有单元格引用是否正确
- 检查区域范围是否存在差一（off-by-one）错误
- 确保所有预测期间的公式保持一致
- 使用边界情况（零值、负数）进行测试
- 验证不存在非预期的循环引用

#### 硬编码的文档记录要求
- 在单元格中添加批注，或写在旁边的单元格中（若位于表格末尾）。格式："Source: [System/Document], [Date], [Specific Reference], [URL if applicable]"
- 示例：
  - "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
  - "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity"

# 工作流程

## 所有操作均使用 Spreadsheet 工具

`Spreadsheet` 工具原生处理所有操作——无需 Python、无需 Bash、无需任何依赖。

### 可用操作
- 读取：`inspect`、`list_sheets`、`get_sheet_info`、`read_range`
- 写入：`write_range`、`append_rows`、`set_cell`（支持公式：`value: "=SUM(A1:A10)"`）
- 搜索：`find_text`
- 验证：`check_errors`、`inspect_formulas`
- 格式设置：`format_cells`、`set_column_width`
- 结构：`create`、`add_sheet`
- 导出：`export_csv`

不要使用 Python/Bash 进行电子表格操作。Spreadsheet 工具是唯一可信来源。

## 常见工作流程

### 1. 检查现有文件
```
Spreadsheet { action: "inspect", file_path: "data.xlsx" }
Spreadsheet { action: "list_sheets", file_path: "data.xlsx" }
Spreadsheet { action: "read_range", file_path: "data.xlsx", sheet: "Summary", range: "A1:F20" }
```

### 2. 创建新工作簿
```
Spreadsheet { action: "create", file_path: "output.xlsx", sheets: ["Summary", "Data", "Assumptions"] }
Spreadsheet { action: "write_range", file_path: "output.xlsx", sheet: "Summary", range: "A1", values: [["Revenue","Q1","Q2","Q3","Q4"],["Product A",100,120,130,150]] }
Spreadsheet { action: "format_cells", file_path: "output.xlsx", sheet: "Summary", range: "A1:E1", format: {"bold": true, "fill": "4472C4", "color": "FFFFFF"} }
Spreadsheet { action: "set_column_width", file_path: "output.xlsx", column: "A", width: 20 }
```

### 3. 编辑现有数据
```
Spreadsheet { action: "read_range", file_path: "model.xlsx", sheet: "Input" }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Input", cell: "B5", value: "150000" }
Spreadsheet { action: "append_rows", file_path: "model.xlsx", sheet: "Data", rows: [["2026-Q1", 250, 180, 70]] }
```

### 4. 验证并修复错误
```
Spreadsheet { action: "check_errors", file_path: "output.xlsx" }
```

返回：
```json
{
  "status": "success",
  "totalErrors": 0,
  "formulaCount": 42,
  "errorSummary": {}
}
```

若发现错误，则返回：
```json
{
  "status": "errors_found",
  "totalErrors": 3,
  "formulaCount": 42,
  "errorSummary": {
    "#REF!": { "count": 2, "locations": ["Sheet1!B5", "Sheet1!C10"] },
    "#DIV/0!": { "count": 1, "locations": ["Sheet1!D15"] }
  }
}
```

修复已识别的错误并再次检查，直到返回 `status: "success"`。

### 5. 跨工作表搜索
```
Spreadsheet { action: "find_text", file_path: "report.xlsx", query: "revenue" }
```

### 6. 导出为 CSV
```
Spreadsheet { action: "export_csv", file_path: "data.xlsx", sheet: "Summary" }
```

### 7. 带公式的财务模型
```
Spreadsheet { action: "create", file_path: "model.xlsx", sheets: ["Model"] }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Model", cell: "A1", value: "Revenue" }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Model", cell: "B1", value: "Q1" }
Spreadsheet { action: "format_cells", file_path: "model.xlsx", sheet: "Model", range: "A1:B1", format: {"bold": true} }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Model", cell: "B2", value: "100" }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Model", cell: "B3", value: "=B2*1.1" }
Spreadsheet { action: "set_cell", file_path: "model.xlsx", sheet: "Model", cell: "B4", value: "=SUM(B2:B3)" }
Spreadsheet { action: "check_errors", file_path: "model.xlsx" }
```

## 格式参考

### format_cells 选项
```json
{
  "bold": true,
  "italic": false,
  "color": "FF0000",
  "fill": "FFFF00",
  "numFmt": "$#,##0",
  "alignment": { "horizontal": "center", "vertical": "center" }
}
```

### 通过 format_cells 实现财务颜色编码
```
// Blue inputs
Spreadsheet { action: "format_cells", file_path: "model.xlsx", range: "B5:B10", format: {"color": "0000FF"} }
// Yellow assumptions
Spreadsheet { action: "format_cells", file_path: "model.xlsx", range: "B2:B4", format: {"fill": "FFFF00"} }
// Bold headers
Spreadsheet { action: "format_cells", file_path: "model.xlsx", range: "A1:F1", format: {"bold": true, "fill": "4472C4", "color": "FFFFFF"} }
```

## 快速参考

| 任务 | 工具 |
|------|------|
| 读取数据 | `Spreadsheet { action: "read_range" }` |
| 写入数值 | `Spreadsheet { action: "write_range" }` 或 `set_cell` |
| 检查错误 | `Spreadsheet { action: "check_errors" }` |
| 设置单元格格式 | `Spreadsheet { action: "format_cells" }` |
| 查找文本 | `Spreadsheet { action: "find_text" }` |
| 创建文件 | `Spreadsheet { action: "create" }` |
| 添加工作表 | `Spreadsheet { action: "add_sheet" }` |
| 设置列宽 | `Spreadsheet { action: "set_column_width" }` |
| 导出 CSV | `Spreadsheet { action: "export_csv" }` |
| 查看公式 | `Spreadsheet { action: "inspect_formulas" }` |
| 公式 | `Spreadsheet { action: "set_cell", value: "=..." }` |
