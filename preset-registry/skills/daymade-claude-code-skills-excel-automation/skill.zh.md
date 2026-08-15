---
name: excel-automation
description: Create, parse, and control Excel files on macOS. Professional formatting with openpyxl, complex xlsm parsing with stdlib zipfile+xml for investment bank financial models, and Excel window control via AppleScript. Use when creating formatted Excel reports, parsing financial models that openpyxl cannot handle, or automating Excel on macOS.
---
# Excel 自动化

创建专业的 Excel 文件，解析复杂的财务模型，并在 macOS 上控制 Excel。

## 快速开始

```bash
# Create a formatted Excel report
uv run --with openpyxl scripts/create_formatted_excel.py output.xlsx

# Parse a complex xlsm that openpyxl can't handle
uv run scripts/parse_complex_excel.py model.xlsm              # List sheets
uv run scripts/parse_complex_excel.py model.xlsm "DCF"        # Extract a sheet
uv run scripts/parse_complex_excel.py model.xlsm --fix        # Fix corrupted names

# Control Excel via AppleScript (with timeout to prevent hangs)
timeout 5 osascript -e 'tell application "Microsoft Excel" to activate'
```

## 概述

三种能力：

| 能力 | 工具 | 使用场景 |
|-----------|------|-------------|
| **创建**格式化的 Excel | `openpyxl` | 报告、模型样稿、仪表板 |
| **解析**复杂的 xlsm/xlsx | `zipfile` + `xml.etree` | 财务模型、VBA 工作簿、>1MB 的文件 |
| **控制** Excel 窗口 | AppleScript (`osascript`) | 以编程方式缩放、滚动、选择单元格 |

## 工具选择决策树

```
Is the file simple (data export, no VBA, <1MB)?
├─ YES → openpyxl or pandas
└─ NO
   ├─ Is it .xlsm or from investment bank / >1MB?
   │   └─ YES → zipfile + xml.etree.ElementTree (stdlib)
   └─ Is it truly .xls (BIFF format)?
       └─ YES → xlrd
```

**“复杂”Excel 的判断信号**：文件 >1MB、扩展名为 `.xlsm`、来自投资银行/经纪商、包含 VBA 宏。

**重要提示**：始终先运行 `file <path>`——扩展名可能具有误导性。一个 `.xls` 文件实际上可能是基于 ZIP 的 xlsx。

## 创建 Excel 文件（openpyxl）

### 专业配色规范（投资银行标准）

| 颜色 | RGB 代码 | 含义 |
|-------|----------|---------|
| 蓝色 | `0000FF` | 用户输入/假设 |
| 黑色 | `000000` | 计算值 |
| 绿色 | `008000` | 跨工作表引用 |
| 深蓝色背景上的白色 | `FFFFFF` on `4472C4` | 分节标题 |
| 深蓝色文本 | `1F4E79` | 标题 |

### 核心格式设置模式

```python
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment

# Fonts
BLUE_FONT = Font(color="0000FF", size=10, name="Calibri")
BLACK_FONT_BOLD = Font(color="000000", size=10, name="Calibri", bold=True)
GREEN_FONT = Font(color="008000", size=10, name="Calibri")
HEADER_FONT = Font(color="FFFFFF", size=12, name="Calibri", bold=True)

# Fills
DARK_BLUE_FILL = PatternFill("solid", fgColor="4472C4")
LIGHT_BLUE_FILL = PatternFill("solid", fgColor="D9E1F2")
INPUT_GREEN_FILL = PatternFill("solid", fgColor="E2EFDA")
LIGHT_GRAY_FILL = PatternFill("solid", fgColor="F2F2F2")

# Borders
THIN_BORDER = Border(bottom=Side(style="thin", color="B2B2B2"))
BOTTOM_DOUBLE = Border(bottom=Side(style="double", color="000000"))
```

### 数字格式代码

| 格式 | 代码 | 示例 |
|--------|------|---------|
| 货币 | `'$#,##0'` | $1,234 |
| 带小数的货币 | `'$#,##0.00'` | $1,234.56 |
| 百分比 | `'0.0%'` | 12.3% |
| 百分比（2 位小数） | `'0.00%'` | 12.34% |
| 带千位分隔符的数字 | `'#,##0'` | 1,234 |
| 倍数 | `'0.0x'` | 1.5x |

### 条件格式（敏感性分析表）

用于敏感性分析的红到绿渐变：

```python
from openpyxl.formatting.rule import ColorScaleRule

rule = ColorScaleRule(
    start_type="min", start_color="F8696B",   # Red (low)
    mid_type="percentile", mid_value=50, mid_color="FFEB84",  # Yellow (mid)
    end_type="max", end_color="63BE7B"         # Green (high)
)
ws.conditional_formatting.add(f"B2:F6", rule)
```

### 执行

```bash
uv run --with openpyxl scripts/create_formatted_excel.py
```

完整模板脚本：请参阅 `scripts/create_formatted_excel.py`

## 解析复杂的 Excel 文件（zipfile + xml）

当 openpyxl 无法处理复杂的 xlsm 文件（DefinedNames 损坏、VBA 复杂）时，请直接使用标准库。

### XLSX 内部 ZIP 结构

```
file.xlsx (ZIP archive)
├── [Content_Types].xml
├── xl/
│   ├── workbook.xml          ← Sheet names + order
│   ├── sharedStrings.xml     ← All text values (lookup table)
│   ├── worksheets/
│   │   ├── sheet1.xml        ← Cell data for sheet 1
│   │   ├── sheet2.xml        ← Cell data for sheet 2
│   │   └── ...
│   └── _rels/
│       └── workbook.xml.rels ← Maps rId → sheetN.xml
└── _rels/.rels
```

### 工作表名称解析（两步）

`workbook.xml` 中的工作表名称通过 `_rels/workbook.xml.rels` 链接到物理文件：

```python
import zipfile
import xml.etree.ElementTree as ET

MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
RELS_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'

def get_sheet_path(zf, sheet_name):
    """Resolve sheet name to physical XML file path inside ZIP."""
    # Step 1: workbook.xml → find rId for the sheet name
    wb_xml = ET.fromstring(zf.read('xl/workbook.xml'))
    sheets = wb_xml.findall(f'.//{{{MAIN_NS}}}sheet')
    rid = None
    for s in sheets:
        if s.get('name') == sheet_name:
            rid = s.get(f'{{{REL_NS}}}id')
            break
    if not rid:
        raise ValueError(f"Sheet '{sheet_name}' not found")

    # Step 2: workbook.xml.rels → map rId to file path
    rels_xml = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
    for rel in rels_xml.findall(f'{{{RELS_NS}}}Relationship'):
        if rel.get('Id') == rid:
            return 'xl/' + rel.get('Target')

    raise ValueError(f"No file mapping for {rid}")
```

### 单元格数据提取

```python
def extract_cells(zf, sheet_path):
    """Extract all cell values from a sheet XML."""
    # Build shared strings lookup
    shared = []
    try:
        ss_xml = ET.fromstring(zf.read('xl/sharedStrings.xml'))
        for si in ss_xml.findall(f'{{{MAIN_NS}}}si'):
            texts = si.itertext()
            shared.append(''.join(texts))
    except KeyError:
        pass  # No shared strings

    # Parse sheet cells
    sheet_xml = ET.fromstring(zf.read(sheet_path))
    rows = sheet_xml.findall(f'.//{{{MAIN_NS}}}row')

    data = {}
    for row in rows:
        for cell in row.findall(f'{{{MAIN_NS}}}c'):
            ref = cell.get('r')         # e.g., "A1"
            cell_type = cell.get('t')   # "s" = shared string, None = number
            val_el = cell.find(f'{{{MAIN_NS}}}v')

            if val_el is not None and val_el.text:
                if cell_type == 's':
                    data[ref] = shared[int(val_el.text)]
                else:
                    try:
                        data[ref] = float(val_el.text)
                    except ValueError:
                        data[ref] = val_el.text
    return data
```

### 修复损坏的 DefinedNames

投资银行的 xlsm 文件通常包含损坏的 `<definedName>` 条目，其中含有 "Formula removed"：

```python
def fix_defined_names(zf_in_path, zf_out_path):
    """Remove corrupted DefinedNames and repackage."""
    import shutil, tempfile
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        with zipfile.ZipFile(zf_in_path, 'r') as zf:
            zf.extractall(tmp)

        wb_xml_path = tmp / 'xl' / 'workbook.xml'
        tree = ET.parse(wb_xml_path)
        root = tree.getroot()

        ns = {'main': MAIN_NS}
        defined_names = root.find('.//main:definedNames', ns)
        if defined_names is not None:
            for name in list(defined_names):
                if name.text and "Formula removed" in name.text:
                    defined_names.remove(name)

        tree.write(wb_xml_path, encoding='utf-8', xml_declaration=True)

        with zipfile.ZipFile(zf_out_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for fp in tmp.rglob('*'):
                if fp.is_file():
                    zf.write(fp, fp.relative_to(tmp))
```

完整的模板脚本：参见 `scripts/parse_complex_excel.py`

## 在 macOS 上控制 Excel（AppleScript）

所有命令均已在安装 Microsoft Excel 的 macOS 上验证。

### 已验证的命令

```bash
# Activate Excel (bring to front)
osascript -e 'tell application "Microsoft Excel" to activate'

# Open a file
osascript -e 'tell application "Microsoft Excel" to open POSIX file "/path/to/file.xlsx"'

# Set zoom level (percentage)
osascript -e 'tell application "Microsoft Excel"
    set zoom of active window to 120
end tell'

# Scroll to specific row
osascript -e 'tell application "Microsoft Excel"
    set scroll row of active window to 45
end tell'

# Scroll to specific column
osascript -e 'tell application "Microsoft Excel"
    set scroll column of active window to 3
end tell'

# Select a cell range
osascript -e 'tell application "Microsoft Excel"
    select range "A1" of active sheet
end tell'

# Select a specific sheet by name
osascript -e 'tell application "Microsoft Excel"
    activate object sheet "DCF" of active workbook
end tell'
```

### 时序与超时

始终在 AppleScript 命令与后续操作（例如截图）之间添加 `sleep 1`，以便留出 UI 渲染时间。

**重要**：如果 Excel 未运行或无响应，`osascript` 将无限期挂起。始终使用 `timeout` 包装：

```bash
# Safe pattern: 5-second timeout
timeout 5 osascript -e 'tell application "Microsoft Excel" to activate'

# Check exit code: 124 = timed out
if [ $? -eq 124 ]; then
    echo "Excel not responding — is it running?"
fi
```

## 常见错误

| 错误 | 纠正方式 |
|---------|-----------|
| openpyxl 处理复杂 xlsm 失败 → 尝试猴子补丁 | 立即改用 `zipfile` + `xml.etree` |
| 使用 `wc -c` 统计中文字符数 | 使用 `wc -m`（统计字符而非字节；中文 = 3 字节/字符） |
| 相信文件扩展名 | 先运行 `file <path>` 确认实际格式 |
| openpyxl `load_workbook` 加载大型 xlsm 时挂起 | 使用 `zipfile` 进行定向提取，而不是加载整个工作簿 |

## 重要说明

- 使用 `uv run --with openpyxl` 执行 Python 脚本（切勿使用系统 Python）
- LibreOffice（`soffice --headless`）可转换格式并重新计算公式
- 详细的格式设置参考：请参阅 `references/formatting-reference.md`