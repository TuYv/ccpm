---
name: cohort-analysis
description: "Analyze user retention by cohort. Use when: measuring customer retention; understanding lifecycle patterns; comparing acquisition cohorts; tracking engagement over time; identifying churn risks"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 队列分析

> 通过将用户划分为不同队列来分析留存和行为模式——了解不同客户群体的行为如何随时间变化。

## 何时使用此技能

- **留存跟踪** - 衡量用户随时间推移的持续活跃情况
- **获客分析** - 比较来自不同渠道的用户队列
- **产品变更** - 衡量产品变更对用户行为的影响
- **流失预测** - 识别存在流失风险的用户队列
- **LTV 估算** - 预测客户生命周期价值


## Claude 会做什么，以及你需要决定什么

| Claude 会做什么 | 你需要决定什么 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化领域 | 行动优先级 |
| 计算统计指标 | 决策阈值 |

## 依赖项

```bash
pip install pandas plotly click
```

## 命令

### 留存分析
```bash
python scripts/main.py retention data.csv --date-col signup --event-col purchase
python scripts/main.py retention data.csv --date-col signup --periods week
```

### 可视化用户队列
```bash
python scripts/main.py visualize cohorts.csv --output retention_chart.html
```

### 导出报告
```bash
python scripts/main.py report data.csv --date-col signup --event-col active --output report.html
```

## 示例

### 示例 1：分析用户留存
```bash
python scripts/main.py retention users.csv --date-col signup_date --event-col last_active

# Output:
# Cohort Retention Analysis
# ──────────────────────────────────
# Cohort     Users    M1     M2     M3     M4
# Jan 2024   1,234    65%    48%    42%    38%
# Feb 2024   1,456    62%    45%    41%    --
# Mar 2024   1,321    68%    52%    --     --
# Apr 2024   1,567    64%    --     --     --
#
# Avg Retention: 65% → 48% → 42% → 38%
# Best Cohort: Mar 2024 (68% M1)
```

### 示例 2：生成可视化报告
```bash
python scripts/main.py report transactions.csv \
  --date-col signup \
  --event-col purchase_date \
  --output retention_report.html

# Generates interactive HTML with:
# - Retention heatmap
# - Cohort size chart
# - Trend analysis
```

## 用户队列表格格式

| 用户队列 | 规模 | 第 0 期 | 第 1 期 | 第 2 期 | 第 3 期 |
|--------|------|----------|----------|----------|----------|
| 2024-01 | 1234 | 100% | 65% | 48% | 42% |
| 2024-02 | 1456 | 100% | 62% | 45% | - |
| 2024-03 | 1321 | 100% | 68% | - | - |

## 技能边界

### 此技能擅长的工作
- 构建数据分析结构
- 识别模式和趋势
- 创建可视化框架
- 计算统计指标

### 此技能无法完成的工作
- 访问你的实际数据
- 取代统计学专业知识
- 作出业务决策
- 保证预测准确性

## 相关技能

- [A/B 测试统计](../ab-test-stats/) - 测试留存实验
- [漏斗分析器](../funnel-analyzer/) - 分析转化漏斗

## 技能元数据


- **模式**：centaur
```yaml
category: analytics
subcategory: retention
dependencies: [pandas, plotly]
difficulty: intermediate
time_saved: 4+ hours/week
```