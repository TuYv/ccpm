---
name: tradingview-mcp
description: >
  Query TradingView market data through the bundled tradingview MCP server
  without a desktop app or login. Use whenever the user wants a technical
  analysis readout (RSI, MACD, Bollinger rating, BUY/SELL summary),
  multi-timeframe alignment (weekly→daily→4h→1h→15m),
  exchange-wide scans (Bollinger squeeze, volume breakout, consecutive
  candles, smart volume), top gainers/losers by exchange, futures market
  data (NQ/ES/CL/GC overview, overnight movers, category snapshots), pre-market /
  after-hours quotes, a quick options chain or unusual options activity
  (volume/OI by strike), bulk stock prices, a global market snapshot,
  strategy backtests (Sharpe, drawdown, win rate), or crypto exchange
  scans. Triggers include "TA on X", "multi-timeframe read", "BB squeeze
  scan", "futures movers", "NQ overnight", "pre-market price", "unusual
  options activity", "backtest RSI on AAPL", and "top gainers on NASDAQ".
  For options greeks, watchlists, alerts, or chart screenshots use
  tradingview-reader instead.
---
# TradingView MCP（无头市场数据）

通过内置的 [`tradingview` MCP 服务器](https://github.com/atilaahmettaner/tradingview-mcp)获取市场数据——通过 MCP 提供 TradingView 的公共扫描器 API 及 Yahoo Finance 数据。**无需 TradingView 桌面应用或账户。**大多数工具不需要 API 密钥。该服务器随此插件（`.mcp.json`）一同提供并自动启动；其 37 个工具位于插件的 `tradingview` MCP 命名空间下（必要时通过客户端的延迟工具机制加载）。

**只读。**此处的任何功能都不会下单或修改任何账户。

## 何时使用此技能，何时使用其他数据技能

| 需求 | 技能 |
|---|---|
| 行情、技术分析读数、指标评级、多时间周期一致性 | **此技能** |
| 全交易所扫描：挤压 / 成交量突破 / 涨幅榜 / 跌幅榜 | **此技能** |
| 期货（NQ、ES、CL、GC……）概览、异动品种、分类行情 | **此技能** |
| 盘前 / 盘后价格 | **此技能** |
| 期权链快速查看（买价/卖价/隐含波动率/未平仓量，**无希腊字母指标**）、异常活动 | **此技能**（备用方案 / 头寸扫描） |
| 包含**希腊字母指标**（delta/gamma/theta/vega）的期权链、隐含波动率偏斜、包含合约数量的到期日 | `tradingview-reader`（桌面应用） |
| 自选列表、提醒、TV 新闻、图表状态 / 截图、自定义列扫描器 | `tradingview-reader`（桌面应用） |
| 基本面、申报文件、电话会议记录、预期数据、期权权利金流向 / GEX、供应链、市场情绪、经济数据 | `funda-data` |

经验法则：对于任何与价格/技术分析/扫描相关的需求，优先使用此技能——它无需任何设置，也不会强制通过 CDP 重新启动用户的 TradingView 应用。仅在需要希腊字母指标或账户关联数据（自选列表、提醒、图表）时，才改用 `tradingview-reader`。对于任何基本面或资金流相关需求，改用 `funda-data`。

## 第 1 步：检查要求

- 已安装 `uv`（`brew install uv`）——服务器通过 `uvx` 运行，并会在首次启动时自行安装（首次调用请预留约 30 秒）。
- Python 3.10–3.13。当前固定版本的上游依赖不支持 Python 3.14。
- 可选：`MARKETAUX_API_TOKEN` 可启用 `market_sentiment`、`financial_news` 以及综合分析中的新闻部分。如果没有该令牌，请使用 `funda-data` 获取新闻和情绪数据。

如果缺少 MCP 工具，请让用户在启用插件后重启代理。不要悄悄用虚构值替代市场数据。

## 第 2 步：选择最精简且实用的工具集

对于简单问题，优先进行一次针对性调用。对于研究简报，仅组合真正重要的独立视角：价格/快照、技术分析、成交量，以及可选的新闻。不要仅仅为了生成更多输出而调用多个功能重叠的技术分析工具。

### 行情与快照

| 工具 | 用途 |
|---|---|
| `stock_prices(tickers)` | 批量行情。`tickers` 是以逗号分隔的 `EXCHANGE:SYMBOL`（例如 `"NASDAQ:NVDA,NYSE:DELL"`），单次调用最多返回 1,000 行。开盘价、最高价、最低价、收盘价 + 涨跌幅。 |
| `yahoo_price(symbol)` | 单一行情，使用 Yahoo 符号格式：`AAPL`、`BTC-USD`、`SPY`、`^GSPC`、`^VIX`、`EURUSD=X`、`THYAO.IS`。 |
| `stock_extended_hours(symbol)` | 获取美国证券的盘前 / 盘后价格——用于财报反应和隔夜走势。 |
| `market_snapshot()` | 全球市场一次性快照：主要指数、热门加密货币、外汇、关键 ETF。 |
| `bitcoin_market_pulse()` | BTC 价格 + 市占率 + 总市值风险框架——分析任何加密货币前调用。 |

### 技术分析（单一标的）

| 工具 | 用途 |
|---|---|
| `coin_analysis(symbol, exchange, timeframe)` | 单只股票或加密货币的**标准技术分析结果**——RSI、MACD、布林带评级、指标汇总。尽管名称如此，它也支持股票：`coin_analysis("NVDA", "NASDAQ", "1D")`。 |
| `multi_timeframe_analysis(symbol, exchange)` | 周线 → 日线 → 4 小时 → 1 小时 → 15 分钟趋势一致性分析。 |
| `combined_analysis(symbol, exchange, timeframe)` | 一次调用即可获取技术分析 + 新闻 + 情绪分析（新闻部分需要 `MARKETAUX_API_TOKEN`）。 |
| `multi_agent_analysis(symbol, exchange, timeframe)` | 技术面、情绪面与风险之间的“辩论”摘要。 |
| `volume_confirmation_analysis(symbol, exchange, timeframe)` | 行情走势是否得到成交量确认？ |

### 全交易所扫描

| 工具 | 用途 |
|---|---|
| `top_gainers` / `top_losers(exchange, timeframe, limit)` | 单个交易所中的涨跌幅异动标的。 |
| `bollinger_scan(exchange, timeframe, bbw_threshold, limit)` | 低 BBW 的波动收窄候选标的。 |
| `rating_filter(exchange, timeframe, rating, limit)` | 按布林带评级筛选：−3（强力卖出）……+3（强力买入）。 |
| `volume_breakout_scanner` / `smart_volume_scanner` | 成交量 + 价格突破检测。 |
| `consecutive_candles_scan` / `advanced_candle_pattern` | K 线形态扫描。 |
| `stock_screener(country, stock_type, limit, …)` | 按国家/地区（`america`、`japan`……）筛选普通股/优先股，并按市值排名。 |

### 期货（夜盘 / 隔夜）

| 工具 | 用途 |
|---|---|
| `futures_market_overview(category, exchanges, limit)` | 按成交量列出头部合约。`category`：all / equity_index / energy / metals / agriculture / rates / forex / crypto_futures；`exchanges`：us / global。 |
| `futures_top_movers(direction, exchanges, limit)` | 当日百分比涨跌幅最大的标的。 |
| `futures_category_snapshot(category)` | 获取一个类别中所有近月合约的 OHLCV——例如 `equity_index` → NQ、ES、YM、RTY。 |
| `futures_watchlist()` | 各类别的标准近月合约代码列表。 |

### 期权（美国股票——无希腊字母指标）

| 工具 | 用途 |
|---|---|
| `stock_options_chain(symbol, expiry)` | 获取一个到期日的看涨期权 + 看跌期权（`YYYY-MM-DD`；省略 → 最近到期日）。返回行权价、最新价、买价/卖价、成交量、未平仓量、隐含波动率、价内标记，以及完整的 `available_expiries` 列表。数据来源：Yahoo。**不提供 delta/gamma/theta/vega**——请使用 `tradingview-reader` 获取希腊字母指标。 |
| `stock_options_unusual_activity(symbol, top_n, min_volume, expiries)` | 在最近的多个到期日中，按成交量/未平仓量比率列出排名靠前的行权价——用于财报发布前的持仓布局扫描。 |

### 回测

| 工具 | 用途 |
|---|---|
| `backtest_strategy(symbol, strategy, period, interval, …)` | 回测单一策略（`rsi`、`bollinger`、`macd`、`ema_cross`、`supertrend`、`donchian`、`rsi_pullback`、`keltner_breakout`、`triple_ema`），提供夏普比率、最大回撤、胜率以及与买入并持有策略的对比。使用 Yahoo 标的代码格式。 |
| `compare_strategies(symbol, period, …)` | 对全部 9 种策略进行排名。 |
| `walk_forward_backtest_strategy(…)` | 使用训练集/测试集拆分，并给出过拟合判定。 |

### 新闻与情绪分析（需要 `MARKETAUX_API_TOKEN`）

`market_sentiment(symbol, category)` · `financial_news(symbol, category, limit)`——可用时优先使用 `funda-data`。

### 区域性附加工具

`egx_*`（埃及交易所工具套件）——很少会用到；扫描工具还支持通过 `exchange` 参数指定 BIST、HKEX、SSE、SZSE、TWSE。

## 第 3 步：规范化输入

1. **在大多数扫描/技术分析工具中，`exchange` 默认值为 `KUCOIN`（加密货币！）**——对于美国股票，始终显式传入 `NASDAQ` / `NYSE`。
2. **三种代码体系并存**：扫描工具使用不带交易所前缀的代码 + `exchange` 参数；`stock_prices` 使用 `EXCHANGE:SYMBOL`；基于 Yahoo 的工具（`yahoo_price`、回测、期权）使用 Yahoo 代码（`BTC-USD`、`^VIX`、`THYAO.IS`）。
3. **时间周期**：`5m, 15m, 1h, 4h, 1D, 1W, 1M`。证券交易所的日内扫描结果可能较少——股票优先使用 `1D`。
4. **工具名称**以此处列出的规范名称为准。使用 `coin_analysis` 和 `multi_timeframe_analysis`，不要使用 README 风格的别名，例如 `get_technical_analysis`。

## 第 4 步：验证并解读结果

1. 在得出结论之前，检查时间戳、交易所、代码、交易时段和货币。
2. 将返回的错误封装视为错误，而不是空结果。利用其中的可重试性信息和代码建议；仅在标记为可重试时重试，且最多重试一次。
3. 将范围较大的扫描结果筛选至约 10 行，并仅保留与问题相关的列。
4. Yahoo 期权隐含波动率适合用于分析期权链形态以及未平仓量/成交量分布，不适合用于精确的隐含波动率排名或偏斜分析。对于隐含波动率敏感型分析，应使用 `tradingview-reader` 或 `funda-data` 进行交叉核验。
5. 回测是历史模拟。应报告周期、时间间隔、成本、样本量、基准，以及可用时的滚动前向结果；不要将其表述为预测。

## 第 5 步：回复用户

先给出答案，然后提供一份简洁的证据表。注明数据截至时间和数据来源，指出任何缺失或陈旧的字段，并将观察到的事实与解读分开。对于交易类请求，回复应保持分析性且仅限只读：讨论风险和情景，不执行或表示可以执行交易。

## 维护者说明

服务器固定到 `.mcp.json` 中一个不可变的上游提交。若要升级，请选择经过审查的 SHA，更新固定版本，执行真实的 MCP initialize + `tools/list` 握手，确认所有工具仍保持只读，并核对此目录与已注册的工具名称和架构是否一致。