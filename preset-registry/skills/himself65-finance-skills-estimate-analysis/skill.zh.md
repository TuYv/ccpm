---
name: estimate-analysis
description: >
  Deep-dive into analyst estimates and revision trends for any stock using Yahoo Finance data.
  Use when the user wants to understand analyst estimate direction,
  how EPS or revenue forecasts changed over time, compare estimate distributions,
  or analyze growth projections across periods.
  Triggers: "estimate analysis for AAPL", "analyst estimate trends for NVDA",
  "EPS revisions for TSLA", "how have estimates changed for MSFT",
  "estimate revisions", "EPS trend", "revenue estimates",
  "consensus changes", "analyst estimates", "estimate distribution",
  "growth estimates for", "estimate momentum", "revision trend",
  "forward estimates", "next quarter estimates", "annual estimates",
  "estimate spread", "bull vs bear estimates", "estimate range",
  or any request about tracking or comparing analyst estimates/revisions.
  Use this skill when the user asks about estimates beyond a simple lookup —
  if they want context, trends, or analysis, this is the right skill.
---
# 预期分析技能

通过 [yfinance](https://github.com/ranaroussi/yfinance) 使用 Yahoo Finance 数据，深入分析分析师预期和修正趋势。涵盖 EPS 和营收预期分布、修正动能、增长预测以及多期间比较——全面呈现华尔街对公司未来走向的看法。

**重要提示**：数据仅用于研究和教育目的。不构成财务建议。yfinance 与 Yahoo, Inc. 无关联。

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

如果已安装，请跳到下一步。

---

## 第 2 步：识别股票代码并获取预期数据

从用户请求中提取股票代码。使用一个脚本获取所有与预期相关的数据。

```python
import yfinance as yf
import pandas as pd

ticker = yf.Ticker("AAPL")  # replace with actual ticker

# --- Estimate data ---
earnings_est = ticker.earnings_estimate      # EPS estimates by period
revenue_est = ticker.revenue_estimate        # Revenue estimates by period
eps_trend = ticker.eps_trend                 # EPS estimate changes over time
eps_revisions = ticker.eps_revisions         # Up/down revision counts
growth_est = ticker.growth_estimates         # Growth rate estimates

# --- Historical context ---
earnings_hist = ticker.earnings_history      # Track record
info = ticker.info                           # Company basics
quarterly_income = ticker.quarterly_income_stmt  # Recent actuals
```

### 各数据源提供的内容

| 数据源 | 展示的内容 | 重要性 |
|---|---|---|
| `earnings_estimate` | 按期间划分的当前 EPS 一致预期（0q、+1q、0y、+1y） | 预期水平——分析师的预期 |
| `revenue_estimate` | 按期间划分的当前营收一致预期 | 营收预期 |
| `eps_trend` | EPS 预期相较于 7 天、30 天、60 天和 90 天前的变化 | 修正方向——预期是上升还是下降 |
| `eps_revisions` | 过去 7 天、30 天内上调与下调预期的次数 | 修正广度——大多数分析师是在上调还是下调？ |
| `growth_estimates` | 相对于同业和行业的增长率预期 | 相对定位 |
| `earnings_history` | 过去 4 个季度的实际值与预期值 | 校准——这些预期在历史上的准确度如何？ |

---

## 第 3 步：根据用户意图选择分析路径

用户可能需要不同层次的分析。请据此选择分析路径：

| 用户请求 | 重点领域 | 关键部分 |
|---|---|---|
| 一般预期分析 | 完整分析 | 所有部分 |
| “预期发生了怎样的变化” | 修正趋势 | EPS 趋势 + 修正 |
| “分析师有何预期” | 当前一致预期 | 预期概览 |
| “增长预期” | 增长预测 | 增长预期 |
| “看多与看空情景” | 预期区间 | 最高值/最低值差距分析 |
| 跨期间比较预期 | 多期间 | 期间比较表 |

如有疑问，请提供完整分析——上下文越多越好。

---

## 第 4 步：构建预期分析

### 第 1 节：预期概览

根据 `earnings_estimate` 和 `revenue_estimate`，展示所有可用期间的当前一致预期：

**EPS 预期：**

| 期间 | 一致预期 | 最低值 | 最高值 | 区间宽度 | 分析师人数 | 同比增长 |
|---|---|---|---|---|---|---|
| 当前季度 (0q) | $1.42 | $1.35 | $1.50 | $0.15 (10.6%) | 28 | +12.7% |
| 下一季度 (+1q) | $1.58 | $1.48 | $1.68 | $0.20 (12.7%) | 25 | +8.3% |
| 本年度 (0y) | $6.70 | $6.50 | $6.95 | $0.45 (6.7%) | 30 | +10.2% |
| 下一年度 (+1y) | $7.45 | $7.10 | $7.85 | $0.75 (10.1%) | 28 | +11.2% |

**营收预期：**

| 期间 | 一致预期 | 最低值 | 最高值 | 分析师人数 | 同比增长 |
|---|---|---|---|---|---|
| 当前季度 | $94.3B | $92.1B | $96.8B | 25 | +5.4% |
| 下一季度 | $102.1B | $99.5B | $105.0B | 22 | +6.1% |

计算并标记：
- **区间宽度**占一致预期的百分比——较宽的区间（>15%）意味着高度不确定性
- **分析师覆盖度**——少于 5 名分析师意味着覆盖较少，需注明这一点
- **增长趋势**——各期间的增长是在加速还是减速？

### 第 2 节：修正趋势（EPS 趋势）

这通常是最具操作价值的部分。根据 `eps_trend`，展示预期如何变化：

| 期间 | 当前 | 7 天前 | 30 天前 | 60 天前 | 90 天前 |
|---|---|---|---|---|---|
| 当前季度 | $1.42 | $1.41 | $1.40 | $1.38 | $1.35 |
| 下一季度 | $1.58 | $1.57 | $1.56 | $1.55 | $1.54 |
| 本年度 | $6.70 | $6.68 | $6.65 | $6.58 | $6.50 |
| 下一年度 | $7.45 | $7.43 | $7.40 | $7.35 | $7.28 |

总结趋势：“当前季度 EPS 预期在过去 90 天内上升了 5.2%，且大部分涨幅出现在最近 30 天——上调动能正在加速。”

**关键解读：**
- 财报发布前预期上升 = 积极态势（预期门槛正在提高）
- 预期下降 = 分析师正在下调预测，通常是负面信号
- 预期持平 = 市场尚未计入任何新信息
- 近期的加速或减速比总体变动更重要

### 第 3 节：修正广度（EPS 修正）

根据 `eps_revisions`，展示上调与下调的数量：

| 期间 | 上调（过去 7 天） | 下调（过去 7 天） | 上调（过去 30 天） | 下调（过去 30 天） |
|---|---|---|---|---|
| 当前季度 | 5 | 1 | 12 | 3 |
| 下一季度 | 3 | 2 | 8 | 5 |

计算修正比率：上调数 /（上调数 + 下调数）。比率高于 0.7 表示强烈看涨；低于 0.3 表示看跌。

### 第 4 节：增长预期

根据 `growth_estimates`，将公司的预期增长与基准进行比较：

| 实体 | 当前季度 | 下一季度 | 本年度 | 下一年度 | 过去 5 年年均增长 |
|---|---|---|---|---|---|
| AAPL | +12.7% | +8.3% | +10.2% | +11.2% | +14.5% |
| 行业 | +9.1% | +7.0% | +8.5% | +9.0% | — |
| 板块 | +11.3% | +8.8% | +10.0% | +10.5% | — |
| S&P 500 | +7.5% | +6.2% | +8.0% | +8.5% | — |

重点说明公司的预期增长速度是快于还是慢于同行。

### 第 5 节：历史预期准确性

根据 `earnings_history`，评估预期的可靠程度：

| 季度 | 预期值 | 实际值 | 意外幅度 % | 方向 |
|---|---|---|---|---|
| Q3 2024 | $1.35 | $1.40 | +3.7% | 超出预期 |
| Q2 2024 | $1.30 | $1.33 | +2.3% | 超出预期 |
| Q1 2024 | $1.52 | $1.53 | +0.7% | 超出预期 |
| Q4 2023 | $2.10 | $2.18 | +3.8% | 超出预期 |

计算：
- **超出预期率**：4 个季度中有 X 个
- **平均意外幅度**：幅度和方向
- **意外幅度趋势**：超出预期的幅度是在扩大还是缩小？如果预期值上升而意外幅度缩小，可能意味着预期标准正在逐渐追上实际情况。

---

## 第 5 步：综合分析并回复

使用清晰的结构呈现分析：

1. **首先给出关键洞察**：“AAPL 的预期值在所有时间段均呈上升趋势，且修正广度为正（近期修正中有 80% 为上调）。”

2. **展示用户关注的各部分表格**

3. **提供解读背景**：
   - 预期修正趋势是在印证还是违背该股票近期的价格走势？
   - 增长前景与当前 P/E 中所反映的市场预期相比如何？
   - 历史预期准确性与当前预期水平之间存在什么关系？

4. **标明风险和细微差别**：
   - 预期值集中在共识附近——实际结果的“真实”分布范围比低值/高值所显示的更宽
   - 单个数据点（指引变化、宏观事件）可能导致修正动能迅速逆转
   - Yahoo Finance 的预期数据可能比实时共识数据提供商滞后数小时或数天
   - 远期年份（+1y）的增长预期本身可靠性较低

### 始终需要包含的注意事项
- 分析师预期反映的是共识观点，而非确定性结果
- 预期修正是一种信号，但并不能保证未来表现
- 这不构成财务建议

---

## 参考文件

- `references/api_reference.md` — 所有预期相关方法的详细 yfinance API 参考

需要了解确切的返回格式或边界情况处理方式时，请阅读该参考文件。