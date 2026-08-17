---
name: report-generator
description: "Generate PDF/HTML reports from templates and data. Use when: creating client reports; generating weekly summaries; producing marketing performance reports; automating recurring reports"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 报告生成器

> 基于模板和数据源自动生成营销报告。


## Claude 的工作与您决定的事项

| Claude 的工作 | 您决定的事项 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化领域 | 行动优先级 |
| 计算统计指标 | 决策阈值 |

## 依赖项

```bash
pip install jinja2 pandas click
# For PDF output:
pip install weasyprint
```

## 命令

```bash
python scripts/main.py generate template.html --data data.json --output report.html
python scripts/main.py weekly metrics.csv --output weekly-report.html
python scripts/main.py client data/ --template agency --output client-report.pdf
```

## Skill 边界

### 此 Skill 擅长的事项
- 构建数据分析结构
- 识别模式和趋势
- 创建可视化框架
- 计算统计指标

### 此 Skill 无法完成的事项
- 访问您的实际数据
- 取代统计专业知识
- 做出业务决策
- 保证预测准确性

## Skill 元数据


- **模式**：centaur
```yaml
category: automation
dependencies: [jinja2, pandas]
difficulty: intermediate
```