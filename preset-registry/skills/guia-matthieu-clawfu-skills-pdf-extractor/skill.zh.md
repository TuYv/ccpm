---
name: pdf-extractor
description: "Extract text, tables, and images from PDFs. Use when: extracting data from reports; converting PDF tables to CSV; pulling images from presentations; processing research papers; batch converting PDFs to text"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# PDF 提取器

> 使用 pdfplumber 从 PDF 文件中提取文本、表格和图像——将静态 PDF 转换为可用数据。

## 何时使用此技能

- **报告处理** - 从 PDF 报告中提取数据
- **表格提取** - 将 PDF 表格转换为 CSV
- **图像收集** - 从演示文稿中提取图像
- **文本挖掘** - 批量将 PDF 转换为可搜索文本
- **研究** - 处理学术论文和白皮书


## Claude 负责什么，您决定什么

| Claude 负责 | 您决定 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化领域 | 行动优先级 |
| 计算统计度量 | 决策阈值 |

## 依赖项

```bash
pip install pdfplumber pypdf click pandas
# For image extraction:
pip install Pillow
```

## 命令

### 提取文本
```bash
python scripts/main.py text document.pdf
python scripts/main.py text document.pdf --pages 1-5
```

### 提取表格
```bash
python scripts/main.py tables report.pdf --output tables.csv
python scripts/main.py tables financial.pdf --page 3
```

### 提取图像
```bash
python scripts/main.py images presentation.pdf --output ./images/
```

### 合并 PDF
```bash
python scripts/main.py merge doc1.pdf doc2.pdf --output combined.pdf
```

### PDF 信息
```bash
python scripts/main.py info document.pdf
```

## 示例

### 示例 1：提取财务表格
```bash
python scripts/main.py tables annual-report.pdf --output financials.csv

# Output: financials.csv with all tables found
# Also creates individual CSVs: table_page3_1.csv, table_page5_1.csv
```

### 示例 2：批量转换为文本
```bash
python scripts/main.py batch ./pdfs/ --output ./text/

# Converts all PDFs in folder to .txt files
```

### 示例 3：提取指定页面
```bash
python scripts/main.py text whitepaper.pdf --pages 1,5-10,15

# Extracts only pages 1, 5-10, and 15
```

## 技能边界

### 此技能擅长的事项
- 构建数据分析结构
- 识别模式和趋势
- 创建可视化框架
- 计算统计度量

### 此技能无法完成的事项
- 访问您的实际数据
- 替代统计学专业知识
- 做出业务决策
- 保证预测准确性

## 相关技能

- [网页抓取器](../web-scraper/) - 抓取网页内容
- [内容再利用工具](../content-repurposer/) - 对提取的内容进行再利用

## 技能元数据


- **模式**：centaur
```yaml
category: automation
subcategory: document-processing
dependencies: [pdfplumber, pypdf, pandas]
difficulty: beginner
time_saved: 4+ hours/week
```