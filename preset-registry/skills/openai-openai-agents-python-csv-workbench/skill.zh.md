---
name: csv-workbench
description: Analyze CSV files in /mnt/data and return concise numeric summaries.
---
# CSV 工作台

当用户请求快速分析表格数据时，使用此技能。

## 工作流程

1. 首先检查 CSV 的结构（`head`、`python csv.DictReader`，或两者都用）。
2. 使用简短的 Python 脚本计算所请求的聚合结果。
3. 返回简明的结果，并尽可能提供具体数值和单位。

## 约束

- 为保证可移植性，优先使用 Python 标准库。
- 如果数据缺失或格式不正确，请明确说明所作的假设。
- 最终答案应简短且具备可操作性。