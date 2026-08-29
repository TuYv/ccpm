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

通过捆绑的 [`tradingview` MCP server](https://github.com/atilaahmettaner/tradingview-mcp) 获取市场数据——TradingView 的公开扫描器 API 加上 Yahoo Finance，通过 MCP 提供服务。**无需 TradingView 桌面应用或账户。**大多数工具无需 API 密钥。该服务器随此插件（`.mcp.json`）一同提供，并会自动启动；其 37 个工具显示在插件的 `tradingview` MCP 命名空间下（必要时通过客户端的延迟工具机制加载）。

**只读。**此处的任何操作都不会下单或修改账户。

## 何时使用此技能，何时使用其他数据技能

| 需求 | 技能 |
|---|---|
| 报价、技术分析读数、指标评级、多时间框架一致性 | **此技能** |
| 全交易所扫描：挤压 / 放量突破 / 涨幅榜 / 跌幅榜 | **此技能** |
| 期货（NQ、ES、CL、GC……）概览、异动、分类报价 | **此技能** |
| 盘前 / 盘后价格 | **此技能** |
| 快速查看期权链（买价/卖价/IV/OI、**无希腊值**）、异常活动 | **此技能**（备用 / 持仓扫描） |
| **包含希腊值的**期权链（delta/gamma/theta/vega）、IV skew、带合约数量的到期日 | `tradingview-reader`（桌面应用） |
| 自选列表、提醒、TV 新闻、图表状态 / 截图、自定义列筛选器 | `tradingview-reader`（桌面应用） |

经验法则：凡是与价格 / 技术分析 / 扫描相关的问题，优先使用此技能——它无需任何设置，也不会强制重启用户的 TradingView 应用的 CDP。只有在需要希腊值或账户绑定数据（自选列表、提醒、图表）时，才切换到 `tradingview-reader`。

## 第 1 步：检查要求

- 已安装 `uv`（`brew install uv`）——服务器通过 `uvx` 运行，并会在首次启动时自动安装（首次调用请预留约 30 秒）。
- Python 3.10–3.13。当前固定版本的上游依赖暂不支持 Python 3.14。
- 可选：`MARKETAUX_API_TOKEN` 可启用 `market_sentiment`、`financial_news` 以及组合分析中的新闻部分。

如果 MCP 工具缺失，请让用户在启用插件后重启代理。不要悄悄用臆造的数据替代市场数据。

## 第 2 步：选择最小且有用的工具集

对于简单问题，优先使用一次专注的调用。对于研究简报，只组合真正重要的独立视角：价格 / 快照、技术分析、成交量，以及可选的新闻。避免仅仅为了生成更多输出而调用多个功能重叠的技术分析工具。

### 报价与快照

| 工具 | 用途 |
|---|---|
| `stock_prices(tickers)` | 批量报价。`tickers` 为逗号分隔的 `EXCHANGE:SYMBOL`（例如 `"NASDAQ:NVDA,NYSE:DELL"`），一次调用最多返回 1,000 行。OHLC + 涨跌幅%。 |
| `yahoo_price(symbol)` | 单个报价，使用 Yahoo 代码：`AAPL`、`BTC-USD`、`SPY`、`^GSPC`、`^VIX`、`EURUSD=X`、`THYAO.IS`。 |
| `stock_extended_hours(symbol)` | 获取美国股票的盘前 / 盘后价格——用于分析财报反应、隔夜走势。 |
| `market_snapshot()` | 全球一站式概览：主要指数、主要加密货币、外汇、关键 ETF。 |
| `bitcoin_market_pulse()` | BTC 价格 + 市占率 + 总市值风险框架——分析任何加密货币前调用。 |

### 技术分析（单个标的）

| 工具 | 用途 |
|---|---|
| `coin_analysis(symbol, exchange, timeframe)` | **单只股票或加密货币的标准 TA 读数**——RSI、MACD、布林带评级、指标摘要。尽管名称中包含 coin，它同样支持股票：`coin_analysis("NVDA", "NASDAQ", "1D")`。 |
| `multi_timeframe_analysis(symbol, exchange)` | 周线 → 日线 → 4H → 1H → 15m 的趋势一致性。 |
| `combined_analysis(symbol, exchange, timeframe)` | 在一次调用中完成 TA + 新闻 + 情绪分析（新闻部分需要 `MARKETAUX_API_TOKEN`）。 |
| `multi_agent_analysis(symbol, exchange, timeframe)` | 技术面 vs 情绪面 vs 风险的“辩论式”摘要。 |
| `volume_confirmation_analysis(symbol, exchange, timeframe)` | 判断行情变动是否获得成交量确认。 |

### 全交易所扫描

| 工具 | 用途 |
|---|---|
| `top_gainers` / `top_losers(exchange, timeframe, limit)` | 单个交易所上的涨跌幅榜。 |
| `bollinger_scan(exchange, timeframe, bbw_threshold, limit)` | 低 BBW 挤压候选标的。 |
| `rating_filter(exchange, timeframe, rating, limit)` | 按 BB 评级筛选：−3（强力卖出）… +3（强力买入）。 |
| `volume_breakout_scanner` / `smart_volume_scanner` | 检测成交量 + 价格突破。 |
| `consecutive_candles_scan` / `advanced_candle_pattern` | K 线形态扫描。 |
| `stock_screener(country, stock_type, limit, …)` | 按国家（`america`、`japan` 等）筛选普通股/优先股，并按市值排名。 |

### 期货（夜盘 / 隔夜）

| 工具 | 用途 |
|---|---|
| `futures_market_overview(category, exchanges, limit)` | 按成交量排名的主要合约。`category`：all / equity_index / energy / metals / agriculture / rates / forex / crypto_futures；`exchanges`：us / global。 |
| `futures_top_movers(direction, exchanges, limit)` | 今日涨跌幅最大的标的。 |
| `futures_category_snapshot(category)` | 获取某一类别中所有近月合约的 OHLCV——例如 `equity_index` → NQ、ES、YM、RTY。 |
| `futures_watchlist()` | 各类别标准近月合约代码列表。 |

### 期权（美国股票——无希腊字母指标）

| 工具 | 用途 |
|---|---|
| `stock_options_chain(symbol, expiry)` | 获取某一到期日的看涨期权 + 看跌期权（`YYYY-MM-DD`；省略则使用最近到期日）。返回行权价、最新价、买卖价、成交量、未平仓量、IV、价内标记，以及完整的 `available_expiries` 列表。来源：Yahoo。**不提供 delta/gamma/theta/vega**——如需希腊字母指标，请使用 `tradingview-reader`。 |
| `stock_options_unusual_activity(symbol, top_n, min_volume, expiries)` | 跨最近的到期日，按成交量/未平仓量比率返回排名靠前的行权价——用于财报前的持仓扫描。 |

### 回测

| 工具 | 用途 |
|---|---|
| `backtest_strategy(symbol, strategy, period, interval, …)` | 对单个策略（`rsi`、`bollinger`、`macd`、`ema_cross`、`supertrend`、`donchian`、`rsi_pullback`、`keltner_breakout`、`triple_ema`）进行回测，并提供 Sharpe、最大回撤、胜率以及相对于买入并持有的表现。使用 Yahoo 代码体系。 |
| `compare_strategies(symbol, period, …)` | 对全部 9 种策略进行排名。 |
| `walk_forward_backtest_strategy(…)` | 采用训练集/测试集划分，并给出过拟合判定。 |

### 新闻与情绪（需要 `MARKETAUX_API_TOKEN`）

`market_sentiment(symbol, category)` · `financial_news(symbol, category, limit)`

### 区域性额外内容

`egx_*`（埃及交易所套件）——很少相关；此外还支持 BIST、HKEX、SSE、SZSE、TWSE，可通过扫描工具上的 `exchange` 参数使用。

## 第 3 步：规范化输入

1. 大多数扫描/TA 工具中的 **`exchange` 默认值为 `KUCOIN`（加密货币！）**——对于美国股票，始终显式传入 `NASDAQ` / `NYSE`。
2. **三种证券代码体系并存**：扫描器工具接受不带交易所前缀的代码 + `exchange` 参数；`stock_prices` 接受 `EXCHANGE:SYMBOL`；基于 Yahoo 的工具（`yahoo_price`、回测、期权）接受 Yahoo 代码（`BTC-USD`、`^VIX`、`THYAO.IS`）。
3. **时间周期**：`5m, 15m, 1h, 4h, 1D, 1W, 1M`。股票交易所的日内扫描结果可能较为稀疏——对于股票，优先使用 `1D`。
4. **工具名称**以此处列出的为准。使用 `coin_analysis` 和 `multi_timeframe_analysis`，不要使用 README 风格的别名，例如 `get_technical_analysis`。

## 第 4 步：验证并解读结果

1. 在得出结论之前，检查时间戳、交易所、代码、交易时段和货币。
2. 将返回的错误封装视为错误，而不是空结果。使用其中的可重试信息和代码建议；仅在标记为可重试时最多重试一次。
3. 将范围过宽的扫描结果筛选为大约 10 行，并仅保留与问题相关的列。
4. 将 Yahoo 期权 IV 视为适合分析期权链形态以及 OI/成交量持仓分布的数据，而不是精确的 IV 排名或偏斜数据。对于对 IV 敏感的分析，使用 `tradingview-reader` 进行交叉核验。
5. 回测是历史模拟。若可用，应报告区间、周期、成本、样本量、基准以及滚动前向测试结果；不要将其呈现为预测。

## 第 5 步：回复用户

先给出答案，然后展示一张精简的证据表。包含截至时间戳和数据来源，指出任何缺失或过时的字段，并将观测事实与解读分开。对于具有交易特征的请求，保持分析性和只读性质：讨论风险和情景，不要执行或提出执行交易。

## 维护者说明

服务器在 `.mcp.json` 中固定到不可变的上游提交。若要升级，应选择一个经过审核的 SHA，更新固定值，执行一次真实的 MCP initialize + `tools/list` 握手，确认所有工具仍然是只读的，并将此目录与已注册的工具名称和 schema 进行核对。