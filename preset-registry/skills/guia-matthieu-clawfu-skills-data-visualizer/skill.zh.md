---
name: data-visualizer
description: "Create marketing visualizations from data. Use when: creating charts for reports; visualizing campaign performance; generating dashboards; presenting data insights; exporting charts for presentations"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 数据可视化工具

> 根据 CSV 数据生成用于营销报告的专业图表和可视化内容。


## Claude 负责什么，您决定什么

| Claude 负责 | 您决定 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化方向 | 行动优先级 |
| 计算统计指标 | 决策阈值 |

## 依赖项

```bash
pip install plotly pandas click
```

## 命令

```bash
python scripts/main.py chart data.csv --type bar --x month --y revenue
python scripts/main.py dashboard data.csv --metrics "revenue,users,churn"
python scripts/main.py export chart.html --format png
```

## 技能边界

### 此技能擅长的工作
- 构建数据分析框架
- 识别模式和趋势
- 创建可视化框架
- 计算统计指标

### 此技能无法完成的工作
- 访问您的实际数据
- 取代统计学专业知识
- 制定业务决策
- 保证预测准确性

## 技能元数据


- **模式**：centaur
```yaml
category: automation
dependencies: [plotly, pandas]
difficulty: beginner
```