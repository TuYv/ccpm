---
name: stock-liquidity
description: >
  Analyze stock liquidity using bid-ask spreads, volume profiles, order book depth,
  market impact estimates, and turnover ratios via Yahoo Finance data.
  Use this skill whenever the user asks about liquidity, trading costs, bid-ask spread,
  market depth, volume analysis, slippage, market impact, turnover ratio, or how
  easy/hard it is to trade a stock without moving the price.
  Triggers: "how liquid is AAPL", "bid-ask spread", "volume analysis", "order book depth",
  "market impact of a large order", "turnover ratio", "slippage estimate",
  "can I trade 100k shares without moving the price", "liquidity comparison",
  "spread analysis", "ADTV", "Amihud illiquidity", "dollar volume",
  "execution cost estimate", "liquidity score", penny stocks, small caps,
  or thinly traded securities.
---
# 股票流动性分析技能

使用来自雅虎财经、通过 [yfinance](https://github.com/ranaroussi/yfinance) 获取的数据，从多个维度分析股票流动性——买卖价差、成交量模式、订单簿深度、估算市场冲击和换手率。

流动性之所以重要，是因为它决定了交易的实际成本。报价并不是你实际支付的价格——价差、滑点和市场冲击都会侵蚀收益，尤其是在持仓规模较大或标的流动性较差时。

**重要提示**：本内容仅用于研究和教育目的，不构成财务建议。yfinance 与 Yahoo, Inc. 不存在关联。

---

## 第 1 步：确保依赖项可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance, pandas, numpy\n print(f\'yfinance={yfinance.__version__} pandas={pandas.__version__} numpy={numpy.__version__}\')\nexcept Exception:\n print(\'DEPS_MISSING\')')"`
```

如果出现 `DEPS_MISSING`，请安装所需软件包：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance", "pandas", "numpy"])
```

如果已安装，则跳过并继续。

---

## 第 2 步：路由到正确的子技能

对用户的请求进行分类，并跳转到匹配的章节。如果用户要求进行一般性流动性评估，但未指定具体指标，请运行**子技能 A**（流动性仪表板），它会同时计算所有关键指标。

| 用户请求 | 路由至 | 示例 |
|---|---|---|
| 一般性流动性检查、“X 的流动性如何” | **子技能 A：流动性仪表板** | “AAPL 的流动性如何”、“对 TSLA 进行流动性分析”、“这只股票的流动性是否足够” |
| 买卖价差、交易成本、有效价差 | **子技能 B：价差分析** | “AMD 的买卖价差”、“NVDA 期权的价差是多少”、“交易成本估算” |
| 成交量、日均成交量、美元成交额、成交量分布 | **子技能 C：成交量分析** | “MSFT 成交量分析”、“日均成交量”、“SPY 的成交量分布” |
| 订单簿深度、市场深度、二级行情 | **子技能 D：订单簿深度** | “AAPL 的订单簿深度”、“市场深度”、“显示订单簿” |
| 大额订单的市场冲击、滑点、执行成本 | **子技能 E：市场冲击** | “5 万股会使价格波动多少”、“滑点估算”、“100 万美元订单的市场冲击” |
| 换手率、相对于流通股本的交易活跃度 | **子技能 F：换手率** | “GME 的换手率”、“流通股换手率”、“这只股票的交易活跃度如何” |
| 比较多只股票的流动性 | **子技能 A**（多股票代码模式） | “比较 AAPL 和 TSLA 的流动性”、“AMD 和 INTC 哪个流动性更好” |

### 默认值

| 参数 | 默认值 |
|---|---|
| 回溯期 | `3mo`（3 个月） |
| 数据间隔 | `1d`（每日） |
| 市场冲击模型 | 平方根模型 |
| 日内间隔（需要时） | `5m` |

---

## 子技能 A：流动性仪表板

**目标**：为一个或多个股票代码生成综合流动性概览，汇总所有关键指标。

### A1：获取数据并计算所有指标

```python
import yfinance as yf
import pandas as pd
import numpy as np

def liquidity_dashboard(ticker_symbol, period="3mo"):
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info
    hist = ticker.history(period=period)

    if hist.empty:
        return None

    # --- Spread metrics (from current quote) ---
    bid = info.get("bid", None)
    ask = info.get("ask", None)
    current_price = info.get("currentPrice") or info.get("regularMarketPrice") or hist["Close"].iloc[-1]

    spread = None
    spread_pct = None
    if bid and ask and bid > 0 and ask > 0:
        spread = round(ask - bid, 4)
        midpoint = (ask + bid) / 2
        spread_pct = round((spread / midpoint) * 100, 4)

    # --- Volume metrics ---
    avg_volume = hist["Volume"].mean()
    median_volume = hist["Volume"].median()
    avg_dollar_volume = (hist["Close"] * hist["Volume"]).mean()
    volume_std = hist["Volume"].std()
    volume_cv = volume_std / avg_volume if avg_volume > 0 else None  # coefficient of variation

    # --- Turnover ratio ---
    shares_outstanding = info.get("sharesOutstanding", None)
    float_shares = info.get("floatShares", None)
    base_shares = float_shares or shares_outstanding
    turnover_ratio = round(avg_volume / base_shares, 6) if base_shares else None

    # --- Amihud illiquidity ratio ---
    # Average of |daily return| / daily dollar volume
    returns = hist["Close"].pct_change().dropna()
    dollar_volume = (hist["Close"] * hist["Volume"]).iloc[1:]  # align with returns
    amihud_values = returns.abs() / dollar_volume
    amihud = amihud_values[amihud_values.replace([np.inf, -np.inf], np.nan).notna()].mean()

    # --- Market impact estimate (square-root model) ---
    # For a hypothetical order of 1% of ADV
    adv = avg_volume
    order_size = adv * 0.01
    daily_volatility = returns.std()
    sigma = daily_volatility
    participation_rate = order_size / adv if adv > 0 else 0
    impact_bps = sigma * np.sqrt(participation_rate) * 10000  # in basis points

    return {
        "ticker": ticker_symbol,
        "current_price": round(current_price, 2),
        "bid": bid,
        "ask": ask,
        "spread": spread,
        "spread_pct": spread_pct,
        "avg_daily_volume": int(avg_volume),
        "median_daily_volume": int(median_volume),
        "avg_dollar_volume": round(avg_dollar_volume, 0),
        "volume_cv": round(volume_cv, 3) if volume_cv else None,
        "shares_outstanding": shares_outstanding,
        "float_shares": float_shares,
        "turnover_ratio": turnover_ratio,
        "amihud_illiquidity": round(amihud * 1e9, 4) if not np.isnan(amihud) else None,
        "daily_volatility": round(daily_volatility * 100, 2),
        "impact_1pct_adv_bps": round(impact_bps, 2),
        "observations": len(hist),
    }
```

### A2：解读并呈现

以摘要卡片的形式呈现。对于 Amihud 非流动性比率，乘以 1e9 以提高可读性（标准惯例）。

**流动性等级**（美股可使用以下粗略阈值）：

| 等级 | 日均成交额 | 买卖价差（%） | Amihud（×10⁹） |
|---|---|---|---|
| 极高 | > $500M/天 | < 0.03% | < 0.01 |
| 高 | $50M–$500M/天 | 0.03–0.10% | 0.01–0.1 |
| 中等 | $5M–$50M/天 | 0.10–0.50% | 0.1–1.0 |
| 低 | $500K–$5M/天 | 0.50–2.00% | 1.0–10 |
| 极低 | < $500K/天 | > 2.00% | > 10 |

比较多个股票代码时，应使用并排表格展示，并突出说明哪一个流动性更高及其原因。

---

## 子技能 B：价差分析

**目标**：进行详细的买卖价差分析，包括当前价差、基于期权数据的历史背景以及有效价差估算。

### B1：从报价中获取当前价差

```python
import yfinance as yf

def spread_analysis(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info

    bid = info.get("bid", 0)
    ask = info.get("ask", 0)
    bid_size = info.get("bidSize", None)
    ask_size = info.get("askSize", None)
    current_price = info.get("currentPrice") or info.get("regularMarketPrice", 0)

    result = {"bid": bid, "ask": ask, "bid_size": bid_size, "ask_size": ask_size}

    if bid > 0 and ask > 0:
        midpoint = (bid + ask) / 2
        result["absolute_spread"] = round(ask - bid, 4)
        result["relative_spread_pct"] = round((ask - bid) / midpoint * 100, 4)
        result["relative_spread_bps"] = round((ask - bid) / midpoint * 10000, 2)
    return result
```

### B2：期权价差背景

yfinance 的期权数据包含每个行权价的买价/卖价，可用于了解衍生品的流动性。使用最近的到期日，提取接近平值的看涨期权和看跌期权，并计算每个期权的价差及价差百分比。

完整代码模板请参阅 `references/liquidity_reference.md` §“期权价差分析”。

### B3：展示结果

展示：
- 当前报价价差（绝对值、相对百分比、基点）
- 买价/卖价对应的挂单量（如有）
- 接近平值的期权价差，以供参考
- 该价差与此市值层级的典型范围相比如何

---

## 子技能 C：成交量分析

**目标**：分析成交量模式——平均值、趋势、相对成交量和成交额。

### C1：计算成交量指标

```python
import yfinance as yf
import pandas as pd
import numpy as np

def volume_analysis(ticker_symbol, period="3mo"):
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period=period)

    if hist.empty:
        return None

    vol = hist["Volume"]
    close = hist["Close"]
    dollar_vol = vol * close

    # Relative volume (today vs average)
    rvol = vol.iloc[-1] / vol.mean() if vol.mean() > 0 else None

    # Volume trend (linear regression slope over the period)
    x = np.arange(len(vol))
    slope, _ = np.polyfit(x, vol.values, 1) if len(vol) > 1 else (0, 0)
    trend_pct = (slope * len(vol)) / vol.mean() * 100  # % change over period

    # Volume profile by day of week
    hist_copy = hist.copy()
    hist_copy["DayOfWeek"] = hist_copy.index.dayofweek
    day_names = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri"}
    vol_by_day = hist_copy.groupby("DayOfWeek")["Volume"].mean()
    vol_by_day.index = vol_by_day.index.map(day_names)

    # High/low volume days
    high_vol_days = hist.nlargest(5, "Volume")[["Close", "Volume"]]
    low_vol_days = hist.nsmallest(5, "Volume")[["Close", "Volume"]]

    return {
        "avg_volume": int(vol.mean()),
        "median_volume": int(vol.median()),
        "avg_dollar_volume": round(dollar_vol.mean(), 0),
        "current_volume": int(vol.iloc[-1]),
        "relative_volume": round(rvol, 2) if rvol else None,
        "volume_trend_pct": round(trend_pct, 1),
        "volume_by_day": vol_by_day.to_dict(),
        "high_vol_days": high_vol_days,
        "low_vol_days": low_vol_days,
        "max_volume": int(vol.max()),
        "min_volume": int(vol.min()),
    }
```

### C2：呈现结果

展示：
- 平均每日成交量（股数和美元金额），并提供中位数以供比较
- 相对成交量（RVOL）——今日成交量与平均成交量之比。RVOL > 1.5 表示成交活跃度较高；RVOL < 0.5 表示成交异常清淡
- 成交量趋势——交易活动正在增加还是减少？
- 星期几模式（如果存在显著差异）
- 成交量最高的 5 个交易日及其背景信息（财报？新闻？）

---

## 子技能 D：订单簿深度

**目标**：使用股票报价和期权链中可用的买价/卖价数据估算订单簿深度。

Yahoo Finance 不提供完整的 Level 2 / 订单簿数据。应坦率说明这一限制。我们可以使用：

1. **股票报价**：买价、卖价、买盘规模、卖盘规模（仅限最优档位）
2. **期权链**：各个行权价的买价/卖价和未平仓合约数，可作为衍生品市场深度的代理指标
3. **日内成交量分布**：成交量在一天内的分布情况，可以反映连续交易市场的深度

### D1：收集可用的深度数据

收集三个数据点：

1. **最优档位**——从 `ticker.info` 获取 bid、ask、bidSize、askSize
2. **日内成交量分布**——过去 5 天的 5 分钟 K 线，按日内时段分组，并标准化为每日成交量的百分比
3. **期权未平仓合约数**——最近到期日的看涨/看跌期权 OI 和成交量总计，作为衍生品市场深度的代理指标

完整代码模板请参阅 `references/liquidity_reference.md` §“订单簿深度代理指标”。

### D2：呈现结果

展示：
- **最优档位**：当前买价/卖价及对应规模
- **日内成交量形态**：成交量集中在哪些时段（开盘/收盘还是午间）
- **期权市场深度**：以未平仓合约数和成交量总计作为衍生品流动性的代理指标
- **如实说明限制**：“Yahoo Finance 仅提供最优档位数据。要获取完整的 Level 2 深度，需要使用直接市场数据源（例如 NYSE OpenBook、NASDAQ TotalView）。”

---

## 子技能 E：市场冲击

**目标**：使用平方根市场冲击模型，估算给定规模的订单会在多大程度上推动价格变动。

实践中的标准模型是：**Impact (%) = σ × √(Q / V)**，其中 σ 是每日波动率，Q 是以股数计的订单规模，V 是平均每日成交量。这是机构交易者所使用的 Almgren-Chriss 框架的简化版本。

### E1：计算市场冲击估算值

```python
import yfinance as yf
import numpy as np

def market_impact(ticker_symbol, order_shares=None, order_dollars=None, period="3mo"):
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period=period)
    info = ticker.info

    if hist.empty:
        return None

    current_price = info.get("currentPrice") or hist["Close"].iloc[-1]
    avg_volume = hist["Volume"].mean()
    daily_volatility = hist["Close"].pct_change().dropna().std()

    # Determine order size in shares
    if order_dollars and not order_shares:
        order_shares = order_dollars / current_price
    elif not order_shares:
        # Default: estimate for various sizes
        order_shares = avg_volume * 0.01  # 1% of ADV

    participation_rate = order_shares / avg_volume if avg_volume > 0 else 0
    pct_adv = (order_shares / avg_volume * 100) if avg_volume > 0 else 0

    # Square-root impact model
    impact_pct = daily_volatility * np.sqrt(participation_rate) * 100
    impact_bps = impact_pct * 100
    impact_dollars = impact_pct / 100 * current_price * order_shares

    # Generate impact curve for multiple order sizes
    sizes = [0.001, 0.005, 0.01, 0.02, 0.05, 0.10, 0.20, 0.50]  # as fraction of ADV
    curve = []
    for s in sizes:
        q = avg_volume * s
        imp = daily_volatility * np.sqrt(s) * 100
        curve.append({
            "pct_adv": round(s * 100, 1),
            "shares": int(q),
            "dollars": round(q * current_price, 0),
            "impact_bps": round(imp * 100, 1),
            "impact_dollars_per_share": round(imp / 100 * current_price, 4),
        })

    return {
        "ticker": ticker_symbol,
        "current_price": round(current_price, 2),
        "avg_daily_volume": int(avg_volume),
        "daily_volatility_pct": round(daily_volatility * 100, 2),
        "order_shares": int(order_shares),
        "order_dollars": round(order_shares * current_price, 0),
        "pct_of_adv": round(pct_adv, 2),
        "estimated_impact_bps": round(impact_bps, 1),
        "estimated_impact_pct": round(impact_pct, 4),
        "estimated_impact_total_dollars": round(impact_dollars, 2),
        "impact_curve": curve,
    }
```

### E2：呈现结果

展示：
- 针对用户特定订单规模估算的冲击
- 展示成本如何随订单规模变化的冲击曲线表
- 背景说明：“这里使用平方根市场冲击模型，这是一种标准的机构级估算方法。实际冲击取决于执行策略（VWAP、TWAP 等）、时段以及当前市场状况。”
- 如果冲击 > 50 个基点，应提示该订单相对于流动性而言规模较大，并建议用户考虑采用算法执行或将订单拆分到多日执行

---

## 子技能 F：换手率

**目标**：衡量一只股票相对于其总流通股数和自由流通股数的交易活跃程度。

### F1：计算换手指标

```python
import yfinance as yf
import pandas as pd
import numpy as np

def turnover_analysis(ticker_symbol, period="3mo"):
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period=period)
    info = ticker.info

    if hist.empty:
        return None

    avg_volume = hist["Volume"].mean()
    shares_outstanding = info.get("sharesOutstanding")
    float_shares = info.get("floatShares")

    result = {
        "avg_daily_volume": int(avg_volume),
        "shares_outstanding": shares_outstanding,
        "float_shares": float_shares,
    }

    if shares_outstanding:
        daily_turnover = avg_volume / shares_outstanding
        result["daily_turnover_ratio"] = round(daily_turnover, 6)
        result["annualized_turnover"] = round(daily_turnover * 252, 2)
        result["days_to_trade_float"] = round(
            (float_shares or shares_outstanding) / avg_volume, 1
        ) if avg_volume > 0 else None

    if float_shares:
        float_turnover = avg_volume / float_shares
        result["float_turnover_daily"] = round(float_turnover, 6)
        result["float_turnover_annualized"] = round(float_turnover * 252, 2)

    # Turnover trend
    vol = hist["Volume"]
    base = float_shares or shares_outstanding
    if base:
        hist_copy = hist.copy()
        hist_copy["turnover"] = hist_copy["Volume"] / base
        recent_turnover = hist_copy["turnover"].tail(20).mean()
        older_turnover = hist_copy["turnover"].head(20).mean()
        if older_turnover > 0:
            result["turnover_trend_pct"] = round(
                (recent_turnover - older_turnover) / older_turnover * 100, 1
            )

    return result
```

### F2：呈现结果

展示：
- 每日和年化换手率（相对于总流通股数和自由流通股数）
- “自由流通股全部换手所需天数”——按平均成交量计算，将全部自由流通股交易一遍需要多少天
- 换手趋势——该股票的交易活跃度是在上升还是下降？
- 背景说明：

| 换手率（年化） | 解读 |
|---|---|
| > 500% | 极其活跃——可能由投机或动量交易驱动 |
| 100–500% | 交易活跃 |
| 30–100% | 活跃度适中 |
| < 30% | 交易清淡——可能主要由机构买入并持有，或较少受到市场关注 |

---

## 第 3 步：回复用户

运行适当的子技能后：

### 始终包括

- 用于历史指标的**回溯期**
- **数据时间戳**——价差和报价均为快照，并非实时数据
- 返回**空数据**的所有股票代码（代码无效、已退市等）

### 始终说明注意事项

- 对于大多数交易所，Yahoo Finance 的报价数据有 **15 分钟延迟**——显示的价差可能无法反映当前的实时市场情况
- 无法通过 Yahoo Finance 获取完整的订单簿（Level 2）数据
- 市场冲击估算是**模型，而非保证**——实际执行成本取决于策略、时机和市场状况
- 流动性可能会**迅速变化**——今天流动性良好的股票明天可能不再如此（尤其是在事件发生、停牌前后或延长交易时段内）

### 实用指导（相关时应提及）

- **头寸规模**：如果估算的市场冲击超过 25 bps，则相对于该股票的流动性而言，头寸规模可能过大
- **小盘股/微盘股警告**：每日成交金额 < $1M 的股票需要谨慎执行交易
- **价差成本会叠加**：一笔完整买卖（买入 + 卖出）中，0.10% 的价差会产生 0.20% 的成本——对于活跃型策略，这些成本会不断累积
- **非流动性溢价**：流动性较低的股票历来会获得更高的回报作为补偿——但交易成本可能会吞噬这部分溢价

**重要提示**：绝不要推荐具体交易。提供流动性数据，让用户自行做出决定。

---

## 参考文件

- `references/liquidity_reference.md`——包含所有流动性指标的详细公式、扩展代码模板、指标解读指南和学术参考资料

当你需要确切公式、边界情况处理方法或更深入的流动性指标背景知识时，请阅读该参考文件。