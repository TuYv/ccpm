---
name: earnings-recap
description: >
  Generate a post-earnings analysis for any stock using Yahoo Finance data.
  Use when the user wants to review what happened after earnings,
  understand beat/miss results, see stock reaction, or get an earnings recap.
  Triggers: "AAPL earnings recap", "how did TSLA earnings go", "MSFT earnings results",
  "did NVDA beat earnings", "post-earnings analysis", "earnings surprise",
  "what happened with GOOGL earnings", "earnings reaction",
  "stock moved after earnings", "EPS beat or miss", "revenue beat or miss",
  "quarterly results for", "how were earnings", "AMZN reported last night",
  "earnings call recap", or any request about a company's recent earnings outcome.
  Use this skill when the user references a past earnings event,
  even if they just say "AAPL reported" or "how did they do".
---
# 财报回顾 Skill

使用通过 [yfinance](https://github.com/ranaroussi/yfinance) 获取的 Yahoo Finance 数据生成财报发布后的分析。涵盖实际值与预估值的对比、超出或不及预期的幅度、股价反应以及财务背景信息，从而完整呈现所发生的情况。

**重要提示**：数据仅供研究和教育用途。不构成财务建议。yfinance 与 Yahoo, Inc. 没有关联。

---

## 第 1 步：确保 yfinance 可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance\n print(\'yfinance \' + yfinance.__version__ + \' installed\')\nexcept Exception:\n print(\'YFINANCE_NOT_INSTALLED\')')"`
```

如果出现 `YFINANCE_NOT_INSTALLED`，请安装：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance"])
```

如果已经安装，请跳到下一步。

---

## 第 2 步：确定股票代码并收集数据

从用户的请求中提取股票代码。使用一个脚本获取所有相关的财报发布后数据。

```python
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

ticker = yf.Ticker("AAPL")  # replace with actual ticker

# --- Earnings result ---
earnings_hist = ticker.earnings_history

# --- Financial statements ---
quarterly_income = ticker.quarterly_income_stmt
quarterly_cashflow = ticker.quarterly_cashflow
quarterly_balance = ticker.quarterly_balance_sheet

# --- Price reaction ---
# Get ~30 days of history to capture the reaction window
hist = ticker.history(period="1mo")

# --- Context ---
info = ticker.info
news = ticker.news
recommendations = ticker.recommendations
```

### 要提取的内容

| 数据源 | 关键字段 | 用途 |
|---|---|---|
| `earnings_history` | epsEstimate, epsActual, epsDifference, surprisePercent | 超出或不及预期的结果 |
| `quarterly_income_stmt` | TotalRevenue, GrossProfit, OperatingIncome, NetIncome, BasicEPS | 实际财务数据 |
| `history()` | 财报发布日期前后的收盘价 | 股价反应 |
| `info` | currentPrice, marketCap, forwardPE | 当前背景信息 |
| `news` | 近期新闻标题 | 财报相关新闻 |

---

## 第 3 步：确定最近一次财报

最近一次财报结果是 `earnings_history` 中的第一行（日期最近）。使用其日期来：

1. **确定财报发布日期**，用于股价反应分析
2. **匹配财务报表中的对应季度**
3. **计算股价反应**——比较财报发布前的收盘价与下一个交易日的收盘价（或开盘价，具体取决于财报是在盘前还是盘后发布）

### 股价反应计算

```python
import numpy as np

# Find the earnings date from earnings_history index
earnings_date = earnings_hist.index[0]  # most recent

# Get daily prices around the earnings date
hist_extended = ticker.history(start=earnings_date - timedelta(days=5),
                                end=earnings_date + timedelta(days=5))

# The reaction is typically measured as:
# - Close on the last trading day before earnings -> Close on the first trading day after
# Be careful with before/after market reports
if len(hist_extended) >= 2:
    pre_price = hist_extended['Close'].iloc[0]
    post_price = hist_extended['Close'].iloc[-1]
    reaction_pct = ((post_price - pre_price) / pre_price) * 100
```

**注意**：确切的股价反应窗口取决于公司是在开盘前还是收盘后发布财报。价格数据会反映这一点——请查找财报发布日期附近连续收盘价之间最大的跳空。

---

## 第 4 步：编写财报回顾

### 第 1 部分：核心业绩

首先给出关键数据：
- **EPS**：实际值与预期值、超出/低于预期的金额、意外幅度百分比
- **营收**：实际值与上年同期对比（来自 `quarterly_income_stmt` 的 `TotalRevenue`）
- **股价反应**：财报发布日的涨跌幅百分比

示例："AAPL 第三季度 EPS 超出预期 3.7%（实际为 $1.40，预期为 $1.35）。营收同比增长 5.4%，达到 $94.3B。财报发布后，股价上涨 +2.1%。"

### 第 2 部分：业绩与预期的详细对比

| 指标 | 预期值 | 实际值 | 意外幅度 |
|---|---|---|---|
| EPS | $1.35 | $1.40 | +$0.05 (+3.7%) |

如果用户询问的是某个特定季度（而非最近一个季度），请在 `earnings_history` 中进一步向前查找。

### 第 3 部分：季度财务趋势

展示 `quarterly_income_stmt` 中最近 4 个季度的关键指标：

| 季度 | 营收 | 同比增长 | 毛利率 | 营业利润率 | EPS |
|---|---|---|---|---|---|
| 2024 年第三季度 | $94.3B | +5.4% | 46.2% | 30.1% | $1.40 |
| 2024 年第二季度 | $85.8B | +4.9% | 46.0% | 29.8% | $1.33 |
| 2024 年第一季度 | $119.6B | +2.1% | 45.9% | 33.5% | $2.18 |
| 2023 年第四季度 | $89.5B | -0.3% | 45.2% | 29.2% | $1.26 |

根据原始财务数据计算利润率：
- 毛利率 = GrossProfit / TotalRevenue
- 营业利润率 = OperatingIncome / TotalRevenue

### 第 4 部分：股价反应

- 财报发布日/下一个交易日的涨跌幅百分比
- 与该股票财报发布日平均波动幅度的比较（根据 `earnings_history` 中最近 4 个财报发布日期计算绝对涨跌幅的平均值）
- 当前股价相对于财报发布日涨跌幅的位置（涨幅是否保持、是否回吐，或是否进一步扩大？）

### 第 5 部分：背景与变化

根据数据说明：
- 利润率相较上一季度是扩大还是收窄
- 营收增长趋势是否发生显著变化
- 超出/低于预期的幅度与该股票的历史模式相比如何（基于完整的 `earnings_history`）
- `recommendations` 中的当前分析师观点（如有）

---

## 第 5 步：回复用户

以清晰、结构化的摘要呈现回顾：

1. **以核心结论开篇**："AAPL 于 [date] 发布了 2024 年第三季度财报：EPS 超出预期 3.7%，营收同比增长 5.4%。"
2. **使用表格展示**详细信息
3. **突出重要信息**：这是一次显著超预期，还是预期门槛较低？趋势是在改善还是恶化？
4. **保持客观**——呈现数据，避免提供投资建议

### 需要包含的注意事项
- Yahoo Finance 数据可能不包含财报电话会议中的所有详细信息（业绩指引、业务分部明细）
- 营收预期较难精确比较——yfinance 提供财务报表中的同比数据
- 股价反应可能受到同日大盘走势的影响
- 这不是财务建议

---

## 参考文件

- `references/api_reference.md` — 关于财报历史和财务报表方法的详细 yfinance API 参考文档

当你需要确切的方法签名或处理财务数据中的边界情况时，请阅读参考文件。