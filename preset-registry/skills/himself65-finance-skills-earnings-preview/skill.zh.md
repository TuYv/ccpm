---
name: earnings-preview
description: >
  Generate a pre-earnings briefing for any stock using Yahoo Finance data.
  Use this skill whenever the user wants to prepare for an upcoming earnings report,
  understand what analysts expect, review a company's beat/miss track record,
  or get a quick overview before an earnings call.
  Triggers include: "earnings preview for AAPL", "what to expect from TSLA earnings",
  "MSFT reports next week", "earnings preview", "pre-earnings analysis",
  "what are analysts expecting for NVDA", "earnings estimates for",
  "will GOOGL beat earnings", "earnings beat/miss history",
  "upcoming earnings", "before earnings", "earnings setup",
  "consensus estimates", "earnings whisper", "EPS expectations",
  "what's the street expecting", "earnings season preview",
  any mention of preparing for or previewing an earnings report,
  or any request to understand expectations ahead of a company's earnings date.
  Always use this skill when the user mentions a ticker in context of upcoming earnings,
  even if they don't say "preview" explicitly.
---
# 财报预览 Skill

使用 [yfinance](https://github.com/ranaroussi/yfinance) 获取 Yahoo Finance 数据，生成财报发布前的简报。汇总即将公布财报的日期、市场一致预期、历史预测准确度、分析师情绪和关键财务背景——涵盖财报电话会议前所需了解的一切信息。

**重要提示**：数据仅供研究和教育用途。不构成财务建议。yfinance 与 Yahoo, Inc. 不存在关联。

---

## 第 1 步：确保 yfinance 可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance\n print(\'yfinance \' + yfinance.__version__ + \' installed\')\nexcept Exception:\n print(\'YFINANCE_NOT_INSTALLED\')')"`
```

如果返回 `YFINANCE_NOT_INSTALLED`，请安装：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance"])
```

如果已安装，请跳至下一步。

---

## 第 2 步：识别股票代码并收集所有数据

从用户请求中提取股票代码。如果用户只提到公司名称而未提供股票代码，请查询对应代码。然后通过一个脚本获取所有相关数据，以最大限度减少 API 调用次数。

```python
import yfinance as yf
import pandas as pd
from datetime import datetime

ticker = yf.Ticker("AAPL")  # replace with actual ticker

# --- Core data ---
info = ticker.info
calendar = ticker.calendar

# --- Estimates ---
earnings_est = ticker.earnings_estimate
revenue_est = ticker.revenue_estimate

# --- Historical track record ---
earnings_hist = ticker.earnings_history

# --- Analyst sentiment ---
price_targets = ticker.analyst_price_targets
recommendations = ticker.recommendations

# --- Recent financials for context ---
quarterly_income = ticker.quarterly_income_stmt
quarterly_cashflow = ticker.quarterly_cashflow
```

### 从各数据源中提取的内容

| 数据源 | 关键字段 | 用途 |
|---|---|---|
| `calendar` | Earnings Date, Ex-Dividend Date | 财报公布时间和关键日期 |
| `earnings_estimate` | avg, low, high, numberOfAnalysts, yearAgoEps, growth (for 0q, +1q, 0y, +1y) | 每股收益的一致预期 |
| `revenue_estimate` | avg, low, high, numberOfAnalysts, yearAgoRevenue, growth | 营收预期 |
| `earnings_history` | epsEstimate, epsActual, epsDifference, surprisePercent | 超出或不及预期的历史记录 |
| `analyst_price_targets` | current, low, high, mean, median | 华尔街目标价 |
| `recommendations` | Buy/Hold/Sell counts | 情绪分布 |
| `quarterly_income_stmt` | TotalRevenue, NetIncome, BasicEPS | 近期趋势 |

---

## 第 3 步：构建财报预览

将数据整理成结构化简报。目标是让用户一目了然地获取所需的全部信息。

### 第 1 部分：财报日期与关键信息

报告 `calendar` 中即将公布财报的日期。包括：
- 公司名称、股票代码、所属板块和行业
- 即将公布财报的日期（以及在盘前还是盘后公布）
- 当前股价和近期表现（1 周、1 个月）
- 市值

### 第 2 部分：一致预期

展示 `earnings_estimate` 和 `revenue_estimate` 中的本季度预期：

| 指标 | 一致预期 | 最低 | 最高 | 分析师人数 | 去年同期 | 增长率 |
|---|---|---|---|---|---|---|
| EPS | $1.42 | $1.35 | $1.50 | 28 | $1.26 | +12.7% |
| 营收 | $94.3B | $92.1B | $96.8B | 25 | $89.5B | +5.4% |

如果预期区间异常宽泛（最高值与最低值之差超过一致预期的 20%），请指出这表明不确定性较高。

### 第 3 节：历史超预期/不及预期记录

从 `earnings_history` 中展示最近 4 个季度：

| 季度 | EPS 预期 | EPS 实际值 | 超预期幅度 | 超预期/不及预期 |
|---|---|---|---|---|
| Q3 2024 | $1.35 | $1.40 | +3.7% | 超预期 |
| Q2 2024 | $1.30 | $1.33 | +2.3% | 超预期 |
| Q1 2024 | $1.52 | $1.53 | +0.7% | 超预期 |
| Q4 2023 | $2.10 | $2.18 | +3.8% | 超预期 |

总结：“AAPL 在最近 4 个季度中有 4 个季度的 EPS 超出预期，平均超出 2.6%。”

### 第 4 节：分析师情绪

根据 `recommendations` 和 `analyst_price_targets`：

- 当前评级分布（强力买入/买入/持有/卖出/强力卖出）
- 目标价区间：最低、平均、中位数和最高目标价，并与当前价格对比
- 相对于平均目标价的隐含上涨/下跌空间

### 第 5 节：值得关注的关键指标

根据季度财务数据，重点列出市场将关注的 3–5 个方面：
- 营收增长趋势（正在加速还是减速？）
- 利润率走势（正在扩大还是收窄？）
- 是否有任何重要项目出现显著的环比变化
- 如果数据中提供了分部明细，则展示相关信息

本节需要进行判断——思考哪些因素对这家特定公司或所在行业最为重要。

---

## 第 4 步：回复用户

将业绩预览整理为简洁、结构清晰的简报：

1. **以标题性结论开篇**：“AAPL 将于[日期]发布财报。以下是值得期待的内容。”
2. **展示全部 5 个部分**，使用清晰的标题和表格
3. **以简短总结收尾**：用 2–3 句话概括整体形势（根据预期、历史表现和市场情绪判断偏看涨或偏看跌——应表述为“华尔街预期”，而非个人建议）

### 需包含的注意事项
- 预期数据在财报发布日之前仍可能发生变化
- 历史超预期并不保证未来仍会超预期
- Yahoo Finance 数据相对于实时一致预期可能有数小时的延迟
- 这不构成财务建议

---

## 参考文件

- `references/api_reference.md` — 关于业绩和预期相关方法的详细 yfinance API 参考

需要了解准确的方法签名或边缘情况处理方式时，请阅读该参考文件。