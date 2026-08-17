---
name: etf-premium
description: >
  Calculate ETF premium/discount vs NAV via Yahoo Finance, and decompose single-day surges
  into NAV-driven vs structural components (gamma squeeze, dealer hedging, blocked AP arbitrage).
  Use whenever the user asks about an ETF's premium or discount, NAV comparison, why an ETF
  diverged from its holdings, or how much of a move is dealer-hedging-driven.
  Triggers: "ETF premium", "ETF discount", "NAV premium", "is SPY at a premium", "BITO premium",
  "IBIT premium", "bond ETF discount", "trading above/below NAV", "ETF premium screener",
  "biggest discount", "compare ETF NAV", "ETF arbitrage", "ETF gamma squeeze",
  "ETF premium surge", "decompose ETF move", "dealer gamma exposure", "GEX for ETF",
  "why did this ETF jump", "premium convergence", "AP arbitrage blocked", or any request
  about the gap between an ETF's price and underlying value. Especially relevant for
  leveraged, inverse, international, bond, commodity, and crypto ETFs.
---
# ETF 溢价/折价分析 Skill

使用来自 Yahoo Finance、通过 [yfinance](https://github.com/ranaroussi/yfinance) 获取的数据，计算 ETF 市场价格相对于其资产净值（NAV）的溢价或折价。

**为什么这很重要：** ETF 的市场价格可能会偏离其底层持仓的价值（NAV）。当你以溢价买入时，相对于资产价值而言，你支付了过高的价格；当你以折价买入时，你相当于捡到了便宜。对于流动性较好的美国股票 ETF，这种偏离通常很小，但对于债券 ETF、国际 ETF、杠杆/反向产品和加密货币 ETF，偏离可能会很显著——尤其是在市场承压期间。

**重要提示**：仅供研究和教育用途。不构成财务建议。yfinance 与 Yahoo, Inc. 没有关联。

---

## 步骤 1：确保依赖项可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance, pandas, numpy\n print(f\'yfinance={yfinance.__version__} pandas={pandas.__version__} numpy={numpy.__version__}\')\nexcept Exception:\n print(\'DEPS_MISSING\')')"`
```

如果出现 `DEPS_MISSING`，请安装所需的软件包：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance", "pandas", "numpy"])
```

如果已安装，则跳过并继续。

---

## 步骤 2：路由到正确的子 Skill

对用户的请求进行分类，并跳转到匹配的章节。如果用户询问有关 ETF 溢价或折价的一般问题，但未指定具体的分析类型，则默认使用**子 Skill A**（单只 ETF 快照）。

| 用户请求 | 路由至 | 示例 |
|---|---|---|
| 单只 ETF 溢价/折价 | **子 Skill A：单只 ETF 快照** | “SPY 是否存在溢价？”，“AGG 相对 NAV 的溢价”，“BITO 溢价” |
| 比较多只 ETF | **子 Skill B：多只 ETF 比较** | “比较债券 ETF 的折价”，“IBIT 和 BITO 哪个溢价更高”，“按溢价对这些 ETF 排名” |
| 筛选器/查找极端溢价 | **子 Skill C：溢价筛选器** | “哪些 ETF 的折价最大”，“查找交易价格低于 NAV 的 ETF”，“溢价筛选器” |
| 带有背景信息的深度分析 | **子 Skill D：溢价深度分析** | “为什么 HYG 存在折价”，“ARKK 的溢价正常吗”，“结合背景分析 ETF 溢价” |
| 突发溢价飙升/Gamma 逼空 | **子 Skill E：溢价飙升分解** | “为什么 KWEB 今天上涨了 13%”，“这只 ETF 的上涨是由 Gamma 推动的吗”，“分解今天的 ETF 价格变动”，“SOXL 的交易商 GEX”，“溢价还需要多久才能收敛” |

### 默认值

| 参数 | 默认值 |
|---|---|
| 数据源 | yfinance `navPrice` 字段 |
| 价格字段 | `regularMarketPrice`（回退至 `previousClose`） |
| 筛选范围 | 按类别划分的常见 ETF 列表（参见子 Skill C） |

---

## 子 Skill A：单只 ETF 快照

**目标**：展示一只 ETF 当前的溢价/折价，并提供正常水平的背景信息，同时与同类 ETF 进行比较，以说明其相对表现。

### A1：获取并计算

```python
import yfinance as yf

# Peer groups by category — used to automatically compare the target ETF against its closest peers
CATEGORY_PEERS = {
    "Digital Assets": ["IBIT", "BITO", "FBTC", "ETHA", "ARKB", "GBTC"],
    "Intermediate Core Bond": ["AGG", "BND", "SCHZ"],
    "High Yield Bond": ["HYG", "JNK", "USHY"],
    "Long Government": ["TLT", "VGLT", "SPTL"],
    "Emerging Markets Bond": ["EMB", "VWOB", "PCY"],
    "Large Growth": ["QQQ", "VUG", "IWF", "SCHG"],
    "Large Blend": ["SPY", "VOO", "IVV", "VTI"],
    "Commodities Focused": ["GLD", "IAU", "SLV", "DBC"],
    "China Region": ["KWEB", "FXI", "MCHI"],
    "Trading--Leveraged Equity": ["TQQQ", "UPRO", "SOXL", "JNUG"],
    "Trading--Inverse Equity": ["SQQQ", "SPXU", "SOXS", "JDST"],
    "Derivative Income": ["JEPI", "JEPQ", "QYLD"],
    "Large Value": ["SCHD", "VYM", "DVY", "HDV"],
}

def etf_premium_snapshot(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info

    # Verify this is an ETF
    quote_type = info.get("quoteType", "")
    if quote_type != "ETF":
        return {"error": f"{ticker_symbol} is not an ETF (quoteType={quote_type})"}

    price = info.get("regularMarketPrice") or info.get("previousClose")
    nav = info.get("navPrice")

    if not price or not nav or nav <= 0:
        return {"error": f"NAV data not available for {ticker_symbol}"}

    premium_pct = (price - nav) / nav * 100
    premium_dollar = price - nav

    # Additional context
    result = {
        "ticker": ticker_symbol,
        "name": info.get("longName") or info.get("shortName", ""),
        "market_price": round(price, 4),
        "nav": round(nav, 4),
        "premium_discount_pct": round(premium_pct, 4),
        "premium_discount_dollar": round(premium_dollar, 4),
        "status": "PREMIUM" if premium_pct > 0 else "DISCOUNT" if premium_pct < 0 else "AT NAV",
        "category": info.get("category", "N/A"),
        "fund_family": info.get("fundFamily", "N/A"),
        "total_assets": info.get("totalAssets"),
        "net_expense_ratio": info.get("netExpenseRatio"),
        "avg_volume": info.get("averageVolume"),
        "bid": info.get("bid"),
        "ask": info.get("ask"),
        "yield_pct": info.get("yield"),
        "ytd_return": info.get("ytdReturn"),
    }

    # Bid-ask spread as context for whether the premium is meaningful
    bid = info.get("bid")
    ask = info.get("ask")
    if bid and ask and bid > 0:
        spread_pct = (ask - bid) / ((ask + bid) / 2) * 100
        result["bid_ask_spread_pct"] = round(spread_pct, 4)

    return result
```

### A2：获取同类产品比较

计算目标 ETF 的快照后，查询其 `category`，并获取同一类别中同类产品的溢价数据。这样用户可以立即了解该溢价是特定于该 ETF，还是整个市场的普遍现象。

使用目标 ETF 的 `category` 选择 `CATEGORY_PEERS`，移除目标 ETF，然后对每个同类产品执行相同的价格/NAV 计算。跳过 NAV 不可用的数据行，但需报告请求和成功返回的同类产品数量，以便明确显示缺失数据。

在主快照后以小型表格形式展示同类产品比较。这有助于用户判断溢价是其 ETF 独有的，还是整个类别普遍存在的——例如，如果所有加密货币 ETF 的溢价都约为 1.5%，则用户的 ETF 并非异常值。

### A3：解读结果

使用以下框架说明溢价/折价是否具有实质意义：

| 溢价/折价 | 解读 |
|---|---|
| 在 +/- 0.05% 以内 | 基本与 NAV 持平——对于规模大、流动性高的 ETF 而言属正常情况 |
| +/- 0.05% 至 0.25% | 轻微偏离——很常见，通常不具备可操作性 |
| +/- 0.25% 至 1.0% | 值得注意——应当提及。检查买卖价差和类别 |
| +/- 1.0% 至 3.0% | 显著——常见于流动性较低、国际型或专业型 ETF |
| 超过 +/- 3.0% | 幅度很大——可能表明存在市场压力、流动性不足或结构性问题 |

**不同类别需要结合具体背景：**
- **美国大盘股**（SPY、QQQ、IVV）：溢价 > 0.10% 并不常见
- **债券 ETF**（AGG、HYG、LQD、TLT）：市场波动期间可能出现 0.5-2% 的折价
- **国际/新兴市场**（EEM、VWO、KWEB）：时区错配会经常造成 0.3-1% 的偏离
- **杠杆/反向**（TQQQ、SQQQ、JNUG）：由于每日重置机制，0.3-1.5% 属于正常范围
- **加密货币**（IBIT、BITO）：1-3% 的溢价很常见，尤其是对于较新的基金
- **大宗商品**（GLD、USO、UNG）：取决于期货的升水或贴水结构

还应将溢价/折价与**买卖价差**进行比较：如果溢价小于价差，那么它只是噪声，而非信号。

---

## 子技能 B：多 ETF 比较

**目标**：并列比较多个 ETF 的溢价/折价。

### B1：获取并排序

```python
import yfinance as yf
import pandas as pd

def compare_etf_premiums(tickers):
    rows = []
    for sym in tickers:
        try:
            t = yf.Ticker(sym)
            info = t.info
            if info.get("quoteType") != "ETF":
                rows.append({"ticker": sym, "error": "Not an ETF"})
                continue
            price = info.get("regularMarketPrice") or info.get("previousClose")
            nav = info.get("navPrice")
            if price and nav and nav > 0:
                prem = (price - nav) / nav * 100
                bid = info.get("bid", 0)
                ask = info.get("ask", 0)
                spread = (ask - bid) / ((ask + bid) / 2) * 100 if bid and ask and bid > 0 else None
                rows.append({
                    "ticker": sym,
                    "name": info.get("shortName", ""),
                    "price": round(price, 2),
                    "nav": round(nav, 2),
                    "premium_pct": round(prem, 4),
                    "spread_pct": round(spread, 4) if spread else None,
                    "category": info.get("category", "N/A"),
                    "total_assets": info.get("totalAssets"),
                })
            else:
                rows.append({"ticker": sym, "error": "NAV unavailable"})
        except Exception as e:
            rows.append({"ticker": sym, "error": str(e)})

    df = pd.DataFrame(rows)
    if "premium_pct" in df.columns:
        df = df.sort_values("premium_pct", ascending=True)
    return df
```

### B2：以排名表格呈现

按溢价/折价排序（折价最大者优先）。重点说明：
- 哪些 ETF 的折价最大
- 哪些 ETF 的溢价最高
- 溢价/折价是否超过买卖价差（如果没有，则属于市场微观结构噪声）

---

## 子技能 C：溢价筛选器

**目标**：扫描一组常见 ETF，找出溢价或折价最大的 ETF。

### C1：定义范围并扫描

使用 `references/etf_premium_reference.md` 中按类别组织的 ETF 范围，或使用用户自己的列表。对每个交易代码应用子技能 A 的计算方法，保留类别标签，按要求的绝对溢价阈值进行筛选，并从折价最大到溢价最高排序。保留计算失败或缺失 NAV 的数量，不要悄然将其视为零。

### C2：呈现结果

显示按溢价排序的排名表格（折价最大者优先）。如果列表较长，则按类别分组。特别指出：
- **折价最大的前 5 名** — 潜在买入机会（或压力迹象）
- **溢价最高的前 5 名** — 支付过高价格的风险
- **类别规律** — 是否所有债券 ETF 都处于折价状态？是否所有加密货币 ETF 都处于溢价状态？

提醒用户，大范围扫描可能需要 1-2 分钟。

---

## 子技能 D：溢价深度分析

**目标**：将溢价/折价数据与其他背景信息相结合，帮助用户理解溢价存在的*原因*，以及其是否可能持续。

### D1：收集综合数据

运行子技能 A 的快照，然后获取三个月的每日历史数据，并添加：

- 年化波动率：`std(daily returns) * sqrt(252)`
- 日均美元成交额：`mean(close * volume)`
- 相对于三个月收盘最高价的百分比距离
- AUM、费用率、收益率、年初至今回报率和三年期贝塔系数
- 买卖价差百分比，以及绝对溢价是否超过该价差

对于无法获取的字段，保留为 `null`，不要捏造数值。为价格和 NAV 输入数据添加时间戳，以便用户判断比较的数据是否同步。

### D2：解释*原因*

收集数据后，使用以下诊断框架解释溢价/折价：

**溢价的常见原因：**
- **需求激增** — 买方数量超出授权参与者能够创建份额的速度（常见于加密货币等新发行或热门 ETF）
- **时区不匹配** — 国际 ETF 在底层资产市场休市期间交易；价格反映预期走势
- **创建机制瓶颈** — 授权参与者在创建新份额时受到限制
- **情绪溢价** — 在炒作周期中，散户需求将价格推高至公允价值以上

**折价的常见原因：**
- **流动性压力** — 在抛售期间，债券和信用类 ETF 往往以折价交易，因为底层债券比 ETF 本身更难定价和交易
- **赎回压力** — 资金大量流出，但授权参与者响应缓慢
- **NAV 滞后** — 官方 NAV 可能尚未反映盘后新闻或事件
- **结构性问题** — 基于期货的 ETF（USO、UNG）会因期货溢价产生持续损耗

**溢价是否可能持续？**
- 对于流动性较高的美国股票 ETF：否——套利会在几分钟内修正偏离
- 对于承压期间的债券 ETF：折价可能持续数天或数周
- 对于加密货币 ETF：随着基金逐渐成熟且 AP 变得更加活跃，溢价往往会收窄
- 对于国际 ETF：随着底层市场开盘，每日都会重置

---

## 子技能 E：溢价飙升分解（Gamma 逼空分析）

**目标**：当 ETF 刚刚经历与其底层持仓相背离的剧烈盘中波动时，将这一波动分解为：(1) 由基本面 NAV 驱动的部分；以及 (2) 由结构性力量驱动的“超额溢价”——最常见的是期权做市商的 Gamma 对冲、AP 套利机制失效或市场情绪激增。然后评估溢价可能需要多长时间才能收敛。

当用户报告或询问以下情况时，适合使用此子技能：
- ETF 在单个交易时段内波动 5% 以上
- ETF 与其所指的底层资产之间出现背离（例如，“MSTR 上涨了 13%，但 BTC 仅上涨了 3%”）
- 怀疑 ETF 或单只证券出现 Gamma 逼空
- 做市商对冲是否正在放大价格波动

在执行 E2 之前，请阅读 `references/gamma_squeeze_reference.md`，了解完整的 GEX 公式推导、做市商头寸约定和计算示例。

### E1：将今日波动分解为 NAV 驱动与超额溢价部分

静态 `navPrice` 字段仅提供最近一个交易日结束时的 NAV。根据当前持仓权重和同一交易时段内的持仓收益率估算今日 NAV 收益率，并按覆盖权重进行归一化，然后计算：

```text
NAV proxy return = sum(weight_i x return_i) / covered weight
Excess premium return = ETF return - NAV proxy return
```

报告持仓覆盖率以及所使用的各项持仓收益率。如果 `funds_data.top_holdings` 不完整，优先使用发行方公布的持仓数据或用户提供的权重。

**注意事项**：对于底层资产所在市场在当前交易时段处于休市状态的国际 ETF（例如，美国交易时段内的亚洲持仓），必须使用这些持仓在美国上市的替代品（ADR）或期货。如果两者均不可用，请向用户明确指出这一点——NAV 代理值将是滞后的。

### E2：根据期权链计算做市商 Gamma 敞口（GEX）

GEX 用于近似衡量底层资产每波动 1% 时做市商的对冲敏感度。阅读 `references/gamma_squeeze_reference.md` 中的公式和两种头寸约定，根据当前现货价格、行权价、剩余期限、无风险利率和 IV 计算合约 Gamma，然后在整个期权链中汇总 `OI x gamma x spot^2`。

返回看涨期权 GEX、看跌期权 GEX、SqueezeMetrics 风格的净 GEX、总对冲压力、看涨/看跌期权 OI 比率、近平值期权 IV 中位数、所分析的到期日，以及最集中的行权价/到期日。明确说明符号约定；不要仅根据公开 OI 推断做市商的实际库存头寸。

结果解读：

- **`net_gex_squeezemetrics_$` 为高度负值** → 做市商处于负 Gamma 状态；价格上涨会因其对冲性买入而被放大。这是典型的 Gamma 逼空推动因素。
- **高度集中于单个近期行权价**（例如，文章中的“June $45 calls”）→ 逼空行情脆弱且高度集中。当该行权价对应的期权到期，或现货价格越过该行权价后，Gamma 会迅速衰减。
- **平值期权 IV 远高于近期平均水平**（文章示例：78，而通常约为 30–40）→ 市场正在计入大幅波动将持续的预期；仅期权溢价的时间价值衰减，就会在数日内带来一定的收敛压力。
- **看涨/看跌期权 OI 比率 > 2.5** → 头寸明显偏向看涨期权，与看涨型 Gamma 逼空格局一致。

### E3：比较结构性买盘压力与实际成交量

使用以下公式估算做市商占比的上限：

```text
Implied dealer-driven dollars = abs(GEX per 1% move) x abs(ETF return in percentage points)
Dealer share of volume = implied dealer-driven dollars / (close x volume)
```

这是一个粗略估算——它假设在价格变动期间，每份合约的全部 gamma 都已按同一方向进行对冲。实际对冲是渐进式的，而且并非所有做市商都采用相同的对冲方式。应将其视为一种上限启发式估算，而非精确数值。展示该估算时，务必同时说明相关假设。

### E4：评估溢价收敛时间线

文章中的三层收敛框架：

| 时间尺度 | 机制 | 检查内容 |
|---|---|---|
| **数小时** | AP 申购/赎回套利 | 标的市场是否开放？申购单位是否受限？买卖价差是否正在扩大（表明 AP 正在退场）？ |
| **数天** | 期权到期 / gamma 衰减 | 主导行权价对应的期权何时到期？OI 是向后滚动还是正在平仓？IV 是否开始收缩？ |
| **数周** | 净资金流正常化 | ETF 是否正获得大量每日资金流入（表明需求增速超过申购能力）？空头持仓是否正在累积（可能为进一步逼空提供动力）？ |

对于数小时维度，记录标的市场是否开放，以及申购/赎回是否受限。对于数天维度，计算距离最大 gamma 集中头寸到期还有多少天，并检查 IV 和 OI 是正在衰减还是向后滚动。对于数周维度，在可用时使用发行方的资金流/申购数据；仅使用 AUM 只能作为粗略代理指标。

### E5：展示分解结果

按以下顺序组织答案：

1. **核心数字**：今日 ETF 涨跌幅、NAV 代理值涨跌幅，以及超额溢价（以 pp 计）。
2. **分解表**：

   | 组成部分 | 贡献 |
   |---|---|
   | NAV 驱动（持仓 × 权重） | +X.X% |
   | 超额溢价（残差） | +Y.Y% |
   | ETF 总涨跌幅 | +Z.Z% |

3. **做市商对冲量化**：
   - 净 GEX（SqueezeMetrics 惯例）
   - 当日隐含做市商买入金额与实际成交金额的对比
   - 估算的做市商买盘压力占比
4. **风险指标**：ATM IV、看涨/看跌 OI 比率、排名前三的行权价/到期日集中度。
5. **收敛展望**：分别列出数小时/数天/数周的机制及其当前状态。
6. **注意事项**：GEX 估算假设做市商持仓方式一致；隔夜交易时段的 NAV 代理值存在滞后；这*不是*对未来价格的预测。

---

## 第 3 步：回复用户

### 必须始终包含
- **ETF 名称和代码**
- **市场价格**和 **NAV**，并展示计算过程
- 清晰标注的**溢价/折价百分比**
- **背景信息**：这种偏离对于该 ETF 类别是否正常？

### 必须始终注明
- Yahoo Finance 的 NAV 数据反映的是**最近一次官方 NAV**（通常为前一交易日收盘时的数据）——并非实时数据
- 市场价格可能存在 **15 分钟延迟**，具体取决于交易所
- 溢价/折价在交易时段内可能迅速变化——这只是一个快照，并非实时数据流
- 小幅溢价/折价（< 买卖价差）属于**市场微观结构噪声**，并非真正的错误定价
- **绝不要仅根据溢价/折价建议买入或卖出**——只展示数据，由用户自行决定

### 格式
- 对多个 ETF 的比较使用 Markdown 表格
- 展示公式：`Premium/Discount = (Market Price - NAV) / NAV x 100`
- 在文本中使用颜色指标：“交易价格处于 **0.45% 折价**”或“处于 **1.2% 溢价**”
- 根据数值大小，将百分比四舍五入到 2-4 位小数

---

## 参考文件

- `references/etf_premium_reference.md` — 详细公式、特定类别的基准、常见 ETF 范围列表，以及驱动溢价的申购/赎回机制背景
- `references/gamma_squeeze_reference.md` — 溢价分解框架、采用 SqueezeMetrics 和客户净多头两种约定的 Black-Scholes gamma 与 GEX 公式、收敛时间线框架（小时/天/周）、gamma 挤压与常规上涨的诊断表，以及一个完整示例。请在运行子技能 E **之前**阅读此文件。

请阅读这些参考文件，以深入了解 ETF 溢价/折价机制、历史背景和 gamma 挤压分解方法。