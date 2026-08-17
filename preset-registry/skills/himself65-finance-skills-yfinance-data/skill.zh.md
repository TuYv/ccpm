---
name: yfinance-data
description: >
  Fetch financial and market data using the yfinance Python library.
  Use this skill whenever the user asks for stock prices, historical data, financial statements,
  options chains, dividends, earnings, analyst recommendations, or any market data.
  Triggers include: any mention of stock price, ticker symbol (AAPL, MSFT, TSLA, etc.),
  "get me the financials", "show earnings", "what's the price of", "download stock data",
  "options chain", "dividend history", "balance sheet", "income statement", "cash flow",
  "analyst targets", "institutional holders", "compare stocks", "screen for stocks",
  or any request involving Yahoo Finance data.
  Always use this skill even if the user only provides a ticker — infer intent from context.
---
# yfinance 数据技能

使用 [yfinance](https://github.com/ranaroussi/yfinance) Python 库从 Yahoo Finance 获取金融和市场数据。

**重要提示**：yfinance 与 Yahoo, Inc. 没有关联。数据仅供研究和教育用途。

---

## 第 1 步：确保 yfinance 可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance\n print(\'yfinance \' + yfinance.__version__ + \' installed\')\nexcept Exception:\n print(\'YFINANCE_NOT_INSTALLED\')')"`
```

如果出现 `YFINANCE_NOT_INSTALLED`，请在运行任何代码之前安装它：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance"])
```

如果 yfinance 已安装，请跳过安装步骤并直接继续。

---

## 第 2 步：确定用户需要什么

将用户的请求与下列一个或多个数据类别相匹配，然后使用 `references/api_reference.md` 中的相应代码。

| 用户请求 | 数据类别 | 主要方法 |
|---|---|---|
| 股票价格、报价 | 当前价格 | `ticker.info` 或 `ticker.fast_info` |
| 价格历史、图表数据 | 历史 OHLCV | `ticker.history()` 或 `yf.download()` |
| 资产负债表 | 财务报表 | `ticker.balance_sheet` |
| 利润表、营收 | 财务报表 | `ticker.income_stmt` |
| 现金流 | 财务报表 | `ticker.cashflow` |
| 股息 | 公司行动 | `ticker.dividends` |
| 股票拆分 | 公司行动 | `ticker.splits` |
| 期权链、看涨期权、看跌期权 | 期权数据 | `ticker.option_chain()` |
| 盈利、每股收益 | 分析 | `ticker.earnings_history` |
| 分析师目标价 | 分析 | `ticker.analyst_price_targets` |
| 推荐、评级 | 分析 | `ticker.recommendations` |
| 评级上调/下调 | 分析 | `ticker.upgrades_downgrades` |
| 机构持股者 | 所有权 | `ticker.institutional_holders` |
| 内部人士交易 | 所有权 | `ticker.insider_transactions` |
| 公司概览、行业板块 | 一般信息 | `ticker.info` |
| 比较多只股票 | 批量下载 | `yf.download()` |
| 筛选/过滤股票 | 筛选器 | `yf.Screener` + `yf.EquityQuery` |
| 行业板块/细分行业数据 | 市场数据 | `yf.Sector` / `yf.Industry` |
| 新闻 | 新闻 | `ticker.news` |

---

## 第 3 步：编写并执行代码

### 通用模式

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance"])

import yfinance as yf

ticker = yf.Ticker("AAPL")
# ... use the appropriate method from the reference
```

### 关键规则

1. **始终使用 try/except 包裹代码** — Yahoo Finance 可能会实施速率限制或返回空数据
2. **使用 `yf.download()` 比较多个股票代码** — 利用多线程时速度更快
3. **对于期权，应先使用 `ticker.options` 列出到期日**，再调用 `ticker.option_chain(date)`
4. **对于季度数据**，使用 `quarterly_` 前缀：`ticker.quarterly_income_stmt`、`ticker.quarterly_balance_sheet`、`ticker.quarterly_cashflow`
5. **对于较大的日期范围**，请注意日内数据限制 — 1 分钟数据只能追溯约 7 天，1 小时数据只能追溯约 730 天
6. **清晰地打印 DataFrame** — 使用 `.to_string()` 或 `.to_markdown()` 提高可读性，或者选择关键列
7. **时区处理** — yfinance 返回带时区的日期时间索引（例如 `America/New_York`）。比较日期时，始终使用 `pd.Timestamp(..., tz=...)`，或通过 `.tz_localize(None)` 移除时区。有关详细信息，请参阅参考文件。

### 有效的周期和间隔

| 周期 | `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max` |
|---|---|
| **间隔** | `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `90m`, `1h`, `1d`, `5d`, `1wk`, `1mo`, `3mo` |

---

## 第 4 步：呈现数据

获取数据后，以清晰的方式呈现：

1. **总结关键数值**，以简短的文本回复呈现（当前价格、市值、市盈率等）
2. **展示表格数据**，以便于阅读的格式呈现——使用 Markdown 表格或格式化的 DataFrames
3. **突出值得注意的项目**——盈利超出或不及预期、异常成交量、股息变化
4. **提供背景信息**——在相关情况下，与行业平均水平、历史区间或分析师共识进行比较

如果用户似乎需要图表或可视化，请结合适当的可视化方法（例如，生成 HTML 图表或描述趋势）。

---

## 参考文件

- `references/api_reference.md`——完整的 yfinance API 参考，包含每个数据类别的代码示例

当你需要确切的方法签名或边界情况处理方式时，请阅读参考文件。