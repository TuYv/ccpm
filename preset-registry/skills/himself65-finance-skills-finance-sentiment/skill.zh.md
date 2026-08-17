---
name: finance-sentiment
description: >
  Fetch structured stock sentiment across Reddit, X.com, news, and Polymarket
  using the Adanos Finance API. Use this skill whenever the user asks how much
  people are talking about a stock, how hot a ticker is on social platforms,
  how many Polymarket bets exist for a company, whether sources are aligned, or
  to compare stock sentiment across multiple tickers. Triggers include:
  "social sentiment on TSLA", "how hot is NVDA on X.com", "how many Reddit
  mentions does AAPL have", "compare sentiment on AMD vs NVDA", "how many
  Polymarket bets on Microsoft", "is Reddit aligned with X on META", "stock
  buzz", "bullish percentage", and any mention of cross-source stock sentiment
  research. This skill is READ-ONLY and does not place trades or modify
  anything.
---
# 金融情绪技能

从 Adanos Finance API 获取结构化的股票情绪数据。

此技能为只读。它专为研究类问题设计，特别适合使用标准化情绪信号比使用原始社交信息流更容易回答的问题。

当用户需要以下内容时使用此技能：
- 跨来源股票情绪
- Reddit/X.com/新闻/Polymarket 对比
- 热度、看涨百分比、提及次数、交易次数或趋势
- 快速回答“市场正在讨论什么？”

---

## 第 1 步：确保 API 密钥可用

**当前环境状态：**

```bash
!`python3 - <<'PY'
import os
print("ADANOS_API_KEY_SET" if os.getenv("ADANOS_API_KEY") else "ADANOS_API_KEY_MISSING")
PY`
```

如果出现 `ADANOS_API_KEY_MISSING`，请用户设置：

```bash
export ADANOS_API_KEY="sk_live_..."
```

所有请求都通过 `X-API-Key` 请求头使用该密钥。

基础文档：

```text
https://api.adanos.org/docs
```

---

## 第 2 步：确定用户的需求

将请求匹配到能够回答该问题的最轻量端点。

| 用户请求 | 端点模式 | 说明 |
|---|---|---|
| “Reddit 用户讨论 TSLA 的热度如何？” | `/reddit/stocks/v1/compare` | 使用 `mentions`、`buzz_score`、`bullish_pct`、`trend` |
| “NVDA 在 X.com 上有多热门？” | `/x/stocks/v1/compare` | 使用 `mentions`、`buzz_score`、`bullish_pct`、`trend` |
| “Polymarket 上有多少关于 Microsoft 的活跃投注？” | `/polymarket/stocks/v1/compare` | 使用 `trade_count`、`buzz_score`、`bullish_pct`、`trend` |
| “比较 AMD 与 NVDA 的情绪” | 对请求来源使用 compare 端点 | 在一个请求中批量传入股票代码 |
| “Reddit 与 X 对 META 的看法一致吗？” | Reddit compare + X compare | 比较 `bullish_pct`、`buzz_score`、`trend` |
| “给我一份 TSLA 的完整情绪快照” | 使用涵盖 Reddit、X.com、新闻、Polymarket 的 compare 端点 | 综合形成跨来源视图 |
| “深入了解某个股票代码” | `/stock/{ticker}` 详情端点 | 仅在用户要求扩展详情时使用 |

默认回溯时间范围：
- 除非用户要求其他时间范围，否则使用 `days=7`

股票代码数量：
- 对 `1..10` 个股票代码使用 compare 端点

---

## 第 3 步：执行请求

使用带有 `X-API-Key` 的 `curl`。优先使用 compare 端点，因为它们简洁且适合批量请求。

### 单一来源示例

```bash
curl -s "https://api.adanos.org/reddit/stocks/v1/compare?tickers=TSLA&days=7" \
  -H "X-API-Key: $ADANOS_API_KEY"
```

```bash
curl -s "https://api.adanos.org/x/stocks/v1/compare?tickers=NVDA&days=7" \
  -H "X-API-Key: $ADANOS_API_KEY"
```

```bash
curl -s "https://api.adanos.org/polymarket/stocks/v1/compare?tickers=MSFT&days=7" \
  -H "X-API-Key: $ADANOS_API_KEY"
```

### 单个股票代码的多来源快照

```bash
curl -s "https://api.adanos.org/reddit/stocks/v1/compare?tickers=TSLA&days=7" -H "X-API-Key: $ADANOS_API_KEY"
curl -s "https://api.adanos.org/x/stocks/v1/compare?tickers=TSLA&days=7" -H "X-API-Key: $ADANOS_API_KEY"
curl -s "https://api.adanos.org/news/stocks/v1/compare?tickers=TSLA&days=7" -H "X-API-Key: $ADANOS_API_KEY"
curl -s "https://api.adanos.org/polymarket/stocks/v1/compare?tickers=TSLA&days=7" -H "X-API-Key: $ADANOS_API_KEY"
```

### 多股票代码比较

```bash
curl -s "https://api.adanos.org/reddit/stocks/v1/compare?tickers=AMD,NVDA,META&days=7" \
  -H "X-API-Key: $ADANOS_API_KEY"
```

### 关键规则

1. 进行快速研究时，优先使用比较端点，而不是股票详情端点。
2. 仅使用回答问题所需的数据源。
3. 对于 Reddit、X.com 和新闻，数量字段为 `mentions`。
4. 对于 Polymarket，活跃度字段为 `trade_count`。
5. 将缺失的数据源数据视为“无数据”，而不是看跌或中性。
6. 切勿执行交易，也不要将结果转化为交易指令。

---

## 步骤 4：展示结果

报告单个数据源时，严格优先展示以下字段：
- 热度
- 看涨百分比
- 提及次数或交易次数
- 趋势

示例：

```text
TSLA on Reddit, last 7 days
- Buzz: 74.1/100
- Bullish: 31%
- Mentions: 647
- Trend: rising
```

报告一只股票代码的多个数据源时：
- 每个数据源展示一个区块
- 然后添加简短的综合结论：
  - 一致看涨
  - 一致看跌
  - 混合 / 分化

比较多个股票代码时：
- 按用户关注的指标进行排名
- 默认使用 `buzz_score`
- 指出 `bullish_pct` 或 `trend` 方面的显著差距

不要夸大精确性。这些是研究信号，而不是交易指令。

---

## 参考文件

- `references/api_reference.md` - 端点指南、字段含义和工作流示例

当你需要确切的字段名、查询参数或推荐的回答模式时，请阅读参考文件。