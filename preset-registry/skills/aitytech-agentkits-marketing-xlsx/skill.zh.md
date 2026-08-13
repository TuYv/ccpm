---
name: document-skills/xlsx
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: document
difficulty: intermediate
description: "Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"
license: Proprietary. LICENSE.txt has complete terms
triggers:
  - Excel
  - XLSX
  - spreadsheet
  - create spreadsheet
  - edit Excel
prerequisites: []
related_skills:
  - analytics-attribution
agents:
  - docs-manager
  - project-manager
mcp_integrations:
  optional: []
success_metrics: []
---
# XLSX 电子表格处理

## 语言与质量标准

**关键要求**：使用与用户相同的语言回复。如果用户使用越南语，则用越南语回复。如果用户使用西班牙语，则用西班牙语回复。

**标准**：提高 Token 效率，可牺牲语法以保持简洁，并在末尾列出尚未解决的问题。

---

# 输出要求

## 所有 Excel 文件

### 零公式错误
- 交付的每个 Excel 模型都必须不存在任何公式错误（#REF!、#DIV/0!、#VALUE!、#N/A、#NAME?）

### 保留现有模板（更新模板时）
- 修改文件时，应研究并完全匹配现有格式、样式和惯例
- 切勿对已有固定模式的文件强行应用标准化格式
- 现有模板惯例始终优先于这些指南

## 财务模型

### 颜色编码标准
除非用户或现有模板另有规定

#### 行业标准颜色惯例
- **蓝色文本（RGB: 0,0,255）**：硬编码输入，以及用户会针对不同情景修改的数字
- **黑色文本（RGB: 0,0,0）**：所有公式和计算
- **绿色文本（RGB: 0,128,0）**：引用同一工作簿中其他工作表的数据
- **红色文本（RGB: 255,0,0）**：指向其他文件的外部链接
- **黄色背景（RGB: 255,255,0）**：需要关注的关键假设或需要更新的单元格

### 数字格式标准

#### 必需的格式规则
- **年份**：格式化为文本字符串（例如，使用 "2024" 而不是 "2,024"）
- **货币**：使用 $#,##0 格式；始终在标题中注明单位（"Revenue ($mm)"）
- **零值**：使用数字格式将所有零值显示为 "-"，包括百分比（例如，"$#,##0;($#,##0);-"）
- **百分比**：默认使用 0.0% 格式（一位小数）
- **倍数**：估值倍数（EV/EBITDA、P/E）使用 0.0x 格式
- **负数**：使用括号 (123)，而不是减号 -123

### 公式构建规则

#### 假设的放置
- 将所有假设（增长率、利润率、倍数等）放在单独的假设单元格中
- 在公式中使用单元格引用，而不是硬编码值
- 示例：使用 =B5*(1+$B$6)，而不是 =B5*1.05

#### 公式错误预防
- 验证所有单元格引用是否正确
- 检查区域是否存在偏移一位的错误
- 确保所有预测期间的公式保持一致
- 使用边界情况（零值、负数）进行测试
- 验证是否存在非预期的循环引用

#### 硬编码值的文档要求
- 添加批注，或记录在相邻单元格中（如果位于表格末尾）。格式："Source: [System/Document], [Date], [Specific Reference], [URL if applicable]"
- 示例：
  - "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
  - "Source: Company 10-Q, Q2 2025, Exhibit 99.1, [SEC EDGAR URL]"
  - "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity"
  - "Source: FactSet, 8/20/2025, Consensus Estimates Screen"

# XLSX 创建、编辑和分析

## 概述

用户可能会要求你创建、编辑或分析 .xlsx 文件的内容。针对不同任务，你可以使用不同的工具和工作流。

## 重要要求

**公式重算需要 LibreOffice**：你可以假定已安装 LibreOffice，以便使用 `recalc.py` 脚本重新计算公式值。该脚本会在首次运行时自动配置 LibreOffice

## 读取和分析数据

### 使用 pandas 分析数据
对于数据分析、可视化和基本操作，请使用 **pandas**，它提供了强大的数据处理能力：

```python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')  # Default: first sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict

# Analyze
df.head()      # Preview data
df.info()      # Column info
df.describe()  # Statistics

# Write Excel
df.to_excel('output.xlsx', index=False)
```

## Excel 文件工作流

## 关键要求：使用公式，而不是硬编码值

**始终使用 Excel 公式，而不是在 Python 中计算值并将其硬编码。** 这可确保电子表格保持动态并且可更新。

### ❌ 错误做法——硬编码计算值
```python
# Bad: Calculating in Python and hardcoding result
total = df['Sales'].sum()
sheet['B10'] = total  # Hardcodes 5000

# Bad: Computing growth rate in Python
growth = (df.iloc[-1]['Revenue'] - df.iloc[0]['Revenue']) / df.iloc[0]['Revenue']
sheet['C5'] = growth  # Hardcodes 0.15

# Bad: Python calculation for average
avg = sum(values) / len(values)
sheet['D20'] = avg  # Hardcodes 42.5
```

### ✅ 正确做法——使用 Excel 公式
```python
# Good: Let Excel calculate the sum
sheet['B10'] = '=SUM(B2:B9)'

# Good: Growth rate as Excel formula
sheet['C5'] = '=(C4-C2)/C2'

# Good: Average using Excel function
sheet['D20'] = '=AVERAGE(D2:D19)'
```

这适用于所有计算——总计、百分比、比率、差值等。当源数据发生变化时，电子表格应能够重新计算。

## 常见工作流
1. **选择工具**：使用 pandas 处理数据，使用 openpyxl 处理公式和格式
2. **创建/加载**：创建新工作簿或加载现有文件
3. **修改**：添加/编辑数据、公式和格式
4. **保存**：写入文件
5. **重新计算公式（使用公式时为强制要求）**：使用 recalc.py 脚本
   ```bash
   python recalc.py output.xlsx
   ```
6. **验证并修复所有错误**：
   - 脚本会返回包含错误详情的 JSON
   - 如果 `status` 为 `errors_found`，请检查 `error_summary` 以了解具体错误类型和位置
   - 修复识别出的错误，然后再次重新计算
   - 需要修复的常见错误：
     - `#REF!`：无效的单元格引用
     - `#DIV/0!`：除以零
     - `#VALUE!`：公式中的数据类型错误
     - `#NAME?`：无法识别的公式名称

### 创建新的 Excel 文件

```python
# Using openpyxl for formulas and formatting
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Add data
sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])

# Add formula
sheet['B2'] = '=SUM(A1:A10)'

# Formatting
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Column width
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

### 编辑现有 Excel 文件

```python
# Using openpyxl to preserve formulas and formatting
from openpyxl import load_workbook

# Load existing file
wb = load_workbook('existing.xlsx')
sheet = wb.active  # or wb['SheetName'] for specific sheet

# Working with multiple sheets
for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"Sheet: {sheet_name}")

# Modify cells
sheet['A1'] = 'New Value'
sheet.insert_rows(2)  # Insert row at position 2
sheet.delete_cols(3)  # Delete column 3

# Add new sheet
new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## 重新计算公式

由 openpyxl 创建或修改的 Excel 文件会将公式保存为字符串，但不包含计算结果。请使用提供的 `recalc.py` 脚本重新计算公式：

```bash
python recalc.py <excel_file> [timeout_seconds]
```

示例：
```bash
python recalc.py output.xlsx 30
```

该脚本：
- 首次运行时自动设置 LibreOffice 宏
- 重新计算所有工作表中的全部公式
- 扫描所有单元格中的 Excel 错误（#REF!、#DIV/0! 等）
- 返回包含详细错误位置和数量的 JSON
- 同时支持 Linux 和 macOS

## 公式验证清单

用于确保公式正常工作的快速检查：

### 基本验证
- [ ] **测试 2-3 个示例引用**：在构建完整模型之前，验证它们是否提取了正确的值
- [ ] **列映射**：确认 Excel 列是否匹配（例如，第 64 列是 BL，而不是 BK）
- [ ] **行偏移**：请记住 Excel 行号从 1 开始（DataFrame 第 5 行 = Excel 第 6 行）

### 常见陷阱
- [ ] **NaN 处理**：使用 `pd.notna()` 检查空值
- [ ] **最右侧的列**：FY 数据通常位于第 50 列之后
- [ ] **多个匹配项**：搜索所有出现位置，而不只是第一个
- [ ] **除以零**：在公式中使用 `/` 之前检查分母（#DIV/0!）
- [ ] **错误引用**：验证所有单元格引用是否指向预期的单元格（#REF!）
- [ ] **跨工作表引用**：链接工作表时使用正确的格式（Sheet1!A1）

### 公式测试策略
- [ ] **从小处开始**：先在 2-3 个单元格上测试公式，再大范围应用
- [ ] **验证依赖项**：检查公式引用的所有单元格是否存在
- [ ] **测试边界情况**：包括零、负数和非常大的值

### 解读 recalc.py 输出
该脚本返回包含错误详情的 JSON：
```json
{
  "status": "success",           // or "errors_found"
  "total_errors": 0,              // Total error count
  "total_formulas": 42,           // Number of formulas in file
  "error_summary": {              // Only present if errors found
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```

## 最佳实践

### 库的选择
- **pandas**：最适合数据分析、批量操作和简单的数据导出
- **openpyxl**：最适合复杂格式、公式和 Excel 特有功能

### 使用 openpyxl
- 单元格索引从 1 开始（row=1、column=1 指的是单元格 A1）
- 使用 `data_only=True` 读取计算后的值：`load_workbook('file.xlsx', data_only=True)`
- **警告**：如果使用 `data_only=True` 打开并保存文件，公式将被值替换并永久丢失
- 对于大型文件：读取时使用 `read_only=True`，写入时使用 `write_only=True`
- 公式会被保留但不会进行计算——使用 recalc.py 更新值

### 使用 pandas
- 指定数据类型以避免类型推断问题：`pd.read_excel('file.xlsx', dtype={'id': str})`
- 对于大型文件，仅读取指定列：`pd.read_excel('file.xlsx', usecols=['A', 'C', 'E'])`
- 正确处理日期：`pd.read_excel('file.xlsx', parse_dates=['date_column'])`

## 代码风格指南
**重要**：生成用于 Excel 操作的 Python 代码时：
- 编写精简、简洁的 Python 代码，不添加不必要的注释
- 避免使用冗长的变量名和冗余操作
- 避免不必要的打印语句

**对于 Excel 文件本身**：
- 为包含复杂公式或重要假设的单元格添加注释
- 记录硬编码值的数据来源
- 为关键计算和模型部分添加说明