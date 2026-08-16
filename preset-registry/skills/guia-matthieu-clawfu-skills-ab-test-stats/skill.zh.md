---
name: ab-test-stats
description: "Calculate A/B test statistical significance. Use when: determining if test results are significant; calculating required sample size; estimating test duration; analyzing conversion experiments; making data-driven decisions"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# A/B 测试统计计算器

> 计算 A/B 测试的统计显著性——判断结果是真实有效，还是仅仅出于随机偶然。

## 何时使用此 Skill

- **测试分析** - 确定结果是否具有统计显著性
- **样本规划** - 在测试前计算所需的样本量
- **时长估算** - 了解实验需要运行多长时间
- **功效分析** - 确保测试能够检测出有意义的差异


## Claude 负责什么与你决定什么

| Claude 负责 | 你决定 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化方向 | 行动优先级 |
| 计算统计指标 | 决策阈值 |

## 依赖项

```bash
pip install scipy numpy click
```

## 命令

### 检查显著性
```bash
python scripts/main.py significance --control 1000,50 --variant 1000,65
python scripts/main.py significance --control 5000,250 --variant 5000,300 --confidence 0.99
```

### 计算样本量
```bash
python scripts/main.py sample-size --baseline 0.05 --mde 0.02
python scripts/main.py sample-size --baseline 0.10 --mde 0.01 --power 0.90
```

### 估算时长
```bash
python scripts/main.py duration --traffic 1000 --baseline 0.05 --mde 0.02
```

## 示例

### 示例 1：分析测试结果
```bash
# Control: 1000 visitors, 50 conversions (5%)
# Variant: 1000 visitors, 65 conversions (6.5%)
python scripts/main.py significance --control 1000,50 --variant 1000,65

# Output:
# A/B Test Results
# ─────────────────────────
# Control:  5.00% (50/1000)
# Variant:  6.50% (65/1000)
# Lift:     +30.0%
#
# Statistical Analysis
# ─────────────────────────
# p-value:      0.089
# Confidence:   91.1%
# Result:       NOT SIGNIFICANT (need 95%)
#
# Recommendation: Continue test for more data
```

### 示例 2：规划样本量
```bash
# Baseline 5% conversion, want to detect 20% relative lift (1% absolute)
python scripts/main.py sample-size --baseline 0.05 --mde 0.01

# Output:
# Sample Size Calculator
# ──────────────────────────────
# Baseline conversion: 5.0%
# Minimum detectable effect: 1.0% (20% relative)
# Target conversion: 6.0%
#
# Required per variant: 3,842 visitors
# Total required: 7,684 visitors
#
# At 1000 daily visitors: ~8 days
```

## 核心概念

| 术语 | 定义 |
|------|------------|
| **p-value** | 结果由偶然因素导致的概率 |
| **置信度** | 1 - p-value（通常要求达到 95% 以上） |
| **统计功效** | 检测出真实效应的概率（通常为 80%） |
| **MDE** | 最小可检测效应——值得检测的最小提升幅度 |
| **提升幅度** | 相对改进量 (variant - control) / control |

## 结果何时具有显著性

| p-value | 置信度 | 结论 |
|---------|------------|---------|
| < 0.01 | > 99% | 高度显著 ✓ |
| < 0.05 | > 95% | 显著 ✓ |
| < 0.10 | > 90% | 边缘显著 |
| ≥ 0.10 | < 90% | 不显著 ✗ |

## 技能边界

### 此技能擅长的工作
- 构建数据分析框架
- 识别模式和趋势
- 创建可视化框架
- 计算统计指标

### 此技能无法完成的工作
- 访问你的实际数据
- 取代统计专业知识
- 制定业务决策
- 保证预测准确性

## 相关技能

- [cohort-analysis](../cohort-analysis/) - 分析用户群组
- [funnel-analyzer](../funnel-analyzer/) - 分析转化漏斗

## 技能元数据


- **模式**：centaur
```yaml
category: analytics
subcategory: statistics
dependencies: [scipy, numpy]
difficulty: intermediate
time_saved: 3+ hours/week
```