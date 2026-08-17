---
name: funnel-analyzer
description: "Analyze conversion funnels and identify drop-offs. Use when: analyzing checkout funnel; tracking signup flow; identifying conversion blockers; optimizing user journey; visualizing funnel performance"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 漏斗分析器

> 分析转化漏斗，以识别流失点和优化机会。


## Claude 的工作与您需要决定的事项

| Claude 的工作 | 您需要决定的事项 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化领域 | 行动优先级 |
| 计算统计度量 | 决策阈值 |

## 依赖项

```bash
pip install pandas click
```

## 命令

```bash
python scripts/main.py analyze data.csv --stages "visit,signup,trial,paid"
python scripts/main.py dropoff funnel.csv
python scripts/main.py visualize funnel.csv --output funnel-chart.html
```

## 技能边界

### 此技能擅长的工作
- 构建数据分析框架
- 识别模式和趋势
- 创建可视化框架
- 计算统计度量

### 此技能无法完成的工作
- 访问您的实际数据
- 取代统计专业知识
- 做出业务决策
- 保证预测准确性

## 技能元数据


- **模式**：centaur
```yaml
category: analytics
dependencies: [pandas]
difficulty: intermediate
```