---
name: sentiment-analyzer
description: "Analyze sentiment in text using ML models. Use when: analyzing customer reviews; processing NPS feedback; monitoring brand mentions; evaluating campaign responses; categorizing support tickets"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 情感分析器

> 使用 Transformer 模型分析客户反馈中的情感——大规模了解客户的真实感受。

## 何时使用此技能

- **评论分析**——处理数百条产品评论
- **NPS 反馈**——对开放式调查回复进行分类
- **社交聆听**——监测社交媒体上的品牌情感
- **营销活动反馈**——评估受众对营销活动的反应
- **客服洞察**——对支持工单的情感进行分类


## Claude 执行的工作与您决定的事项

| Claude 执行的工作 | 您决定的事项 |
|-------------|------------|
| 构建分析框架 | 指标定义 |
| 识别数据中的模式 | 业务解读 |
| 创建可视化模板 | 仪表板设计 |
| 建议优化领域 | 行动优先级 |
| 计算统计指标 | 决策阈值 |

## 依赖项

```bash
pip install transformers torch pandas click
# Or for lighter CPU-only version:
pip install textblob vaderSentiment pandas click
```

## 命令

### 分析文本
```bash
python scripts/main.py analyze "This product exceeded my expectations!"
python scripts/main.py analyze "The service was terrible and slow."
```

### 批量分析
```bash
python scripts/main.py batch reviews.csv --column text
python scripts/main.py batch feedback.csv --column comment --output results.csv
```

### 生成报告
```bash
python scripts/main.py report reviews.csv --column text --output sentiment-report.html
```

## 示例

### 示例 1：分析产品评论
```bash
# Process CSV of reviews
python scripts/main.py batch amazon-reviews.csv --column review_text

# Output: amazon-reviews_sentiment.csv
# review_text                    | sentiment | score  | label
# "Absolutely love this!"        | positive  | 0.95   | Very Positive
# "It's okay, nothing special"   | neutral   | 0.52   | Neutral
# "Worst purchase ever"          | negative  | 0.12   | Very Negative
```

### 示例 2：NPS 反馈分类
```bash
# Analyze NPS survey responses
python scripts/main.py report nps-responses.csv --column feedback

# Output: sentiment-report.html
# Summary:
# - Positive: 62% (mainly: product quality, support)
# - Neutral: 23% (mainly: pricing concerns)
# - Negative: 15% (mainly: shipping delays)
```

## 情感类别

| 分数范围 | 标签 | 解读 |
|-------------|-------|----------------|
| 0.8 - 1.0 | 非常积极 | 热情，愿意推荐 |
| 0.6 - 0.8 | 积极 | 满意、愉快 |
| 0.4 - 0.6 | 中性 | 感受复杂或无明显倾向 |
| 0.2 - 0.4 | 消极 | 失望、沮丧 |
| 0.0 - 0.2 | 非常消极 | 愤怒，可能会流失 |

## 技能边界

### 此技能擅长的工作
- 构建数据分析结构
- 识别模式和趋势
- 创建可视化框架
- 计算统计指标

### 此技能无法完成的工作
- 访问您的实际数据
- 取代统计学专业知识
- 做出业务决策
- 保证预测准确性

## 相关技能

- [social-analytics](../../social/social-analytics/) - 获取用于分析的社交数据
- [content-repurposer](../../automation/content-repurposer/) - 将洞察用于内容创作

## 技能元数据


- **模式**：centaur
```yaml
category: analytics
subcategory: nlp
dependencies: [transformers, torch, pandas]
difficulty: intermediate
time_saved: 6+ hours/week
```