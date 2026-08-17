---
name: stock-correlation
description: >
  Analyze stock correlations to find related companies and trading pairs.
  Use when the user asks about correlated stocks, related companies, sector peers,
  trading pairs, or how two or more stocks move together.
  Triggers: "what correlates with NVDA", "find stocks related to AMD",
  "correlation between AAPL and MSFT", "what moves with", "sector peers",
  "pair trading", "correlated stocks", "when NVDA drops what else drops",
  "stocks that move together", "beta to", "relative performance",
  "supply chain partners", "correlation matrix", "co-movement",
  "related tickers", "sympathy plays", "semiconductor peers",
  "hedging pair", "realized correlation", "rolling correlation",
  or any request about stocks that move in tandem or inversely.
  Also triggers for well-known pairs like AMD/NVDA, GOOGL/AVGO, LITE/COHR.
  If only one ticker is provided, infer the user wants correlated peers.
---
# 股票相关性分析技能

使用来自 Yahoo Finance 的历史价格数据，通过 [yfinance](https://github.com/ranaroussi/yfinance) 查找并分析相关股票。根据用户意图路由到专门的子技能。

**重要提示**：本技能仅供研究和教育用途，不构成财务建议。yfinance 与 Yahoo, Inc. 没有关联。

---

## 第 1 步：确保依赖项可用

**当前环境状态：**

```
!`python3 -c "exec('try:\n import yfinance, pandas, numpy\n print(f\'yfinance={yfinance.__version__} pandas={pandas.__version__} numpy={numpy.__version__}\')\nexcept Exception:\n print(\'DEPS_MISSING\')')"`
```

如果出现 `DEPS_MISSING`，请在运行任何代码之前安装所需软件包：

```python
import subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "yfinance", "pandas", "numpy"])
```

如果所有依赖项均已安装，请跳过安装步骤并直接继续。

---

## 第 2 步：路由到正确的子技能

对用户请求进行分类，并跳转到下方匹配的子技能部分。

| 用户请求 | 路由至 | 示例 |
|---|---|---|
| 单个股票代码，希望查找相关股票 | **子技能 A：联动发现** | “哪些股票与 NVDA 相关”“查找与 AMD 相关的股票”“TSLA 的联动标的” |
| 两个或更多指定股票代码，希望了解关系详情 | **子技能 B：收益率相关性** | “AMD 和 NVDA 之间的相关性”“LITE 和 COHR 如何联动”“比较 AAPL 与 MSFT” |
| 一组股票代码，希望了解结构或分组 | **子技能 C：板块聚类** | “FAANG 的相关性矩阵”“对这些半导体股票进行聚类”“AMD 的板块同类股” |
| 希望了解时变或条件相关性 | **子技能 D：已实现相关性** | “AMD 和 NVDA 的滚动相关性”“NVDA 下跌时还有哪些股票会下跌”“相关性发生了怎样的变化” |

如果意图不明确，对于单个股票代码，默认使用**子技能 A**（联动发现）；对于两个股票代码，默认使用**子技能 B**（收益率相关性）。

### 所有子技能的默认值

| 参数 | 默认值 |
|---|---|
| 回溯期 | `1y`（1 年） |
| 数据间隔 | `1d`（每日） |
| 相关性方法 | Pearson |
| 最低相关性阈值 | 0.60 |
| 结果数量 | 前 10 个 |
| 收益率类型 | 每日对数收益率 |
| 滚动窗口 | 60 个交易日 |

---

## 子技能 A：联动发现

**目标**：给定单个股票代码，查找与其走势联动的股票。

### A1：构建同类股票范围

需要 15-30 个候选标的。**不要使用硬编码的股票代码列表**——应在运行时动态构建候选范围。完整实现请参阅 `references/sector_universes.md`。具体方法如下：

1. **筛选同一行业的股票**：使用 `yf.screen()` + `yf.EquityQuery` 查找与目标股票属于同一行业的股票
2. **扩展至板块**：如果行业筛选返回的同类股票少于 10 只，则扩展到整个板块
3. **添加主题相关/相邻行业**——读取目标股票的 `longBusinessSummary`，并筛选 1-2 个相关行业（例如，半导体公司 → 还应筛选半导体设备行业）
4. **合并、去重并移除目标股票代码**

### A2：计算相关性

```python
import yfinance as yf
import pandas as pd
import numpy as np

def discover_comovement(target_ticker, peer_tickers, period="1y"):
    all_tickers = [target_ticker] + [t for t in peer_tickers if t != target_ticker]
    data = yf.download(all_tickers, period=period, auto_adjust=True, progress=False)

    # Extract close prices — yf.download returns MultiIndex (Price, Ticker) columns
    closes = data["Close"].dropna(axis=1, thresh=max(60, len(data) // 2))

    # Log returns
    returns = np.log(closes / closes.shift(1)).dropna()
    corr_series = returns.corr()[target_ticker].drop(target_ticker, errors="ignore")

    # Rank by absolute correlation
    ranked = corr_series.abs().sort_values(ascending=False)

    result = pd.DataFrame({
        "Ticker": ranked.index,
        "Correlation": [round(corr_series[t], 4) for t in ranked.index],
    })
    return result, returns
```

### A3：展示结果

展示一个包含公司名称和行业的排名表（通过 `yf.Ticker(t).info.get("shortName")` 获取）：

| 排名 | 股票代码 | 公司 | 相关性 | 关联原因 |
|---|---|---|---|---|
| 1 | AMD | Advanced Micro Devices | 0.82 | 同一行业——GPU/CPU |
| 2 | AVGO | Broadcom | 0.78 | AI 基础设施同业公司 |

包括：
- 正相关性最高的 10 只股票
- 所有值得关注的负相关股票（潜在对冲标的）
- 简要说明它们**为何**可能存在关联（行业、供应链、客户重叠）

---

## 子技能 B：收益率相关性

**目标**：深入分析两个（或少数几个）特定股票代码之间的关系。

### B1：下载并计算

```python
import yfinance as yf
import pandas as pd
import numpy as np

def return_correlation(ticker_a, ticker_b, period="1y"):
    data = yf.download([ticker_a, ticker_b], period=period, auto_adjust=True, progress=False)
    closes = data["Close"][[ticker_a, ticker_b]].dropna()

    returns = np.log(closes / closes.shift(1)).dropna()
    corr = returns[ticker_a].corr(returns[ticker_b])

    # Beta: how much does B move per unit move of A
    cov_matrix = returns.cov()
    beta = cov_matrix.loc[ticker_b, ticker_a] / cov_matrix.loc[ticker_a, ticker_a]

    # R-squared
    r_squared = corr ** 2

    # Rolling 60-day correlation for stability
    rolling_corr = returns[ticker_a].rolling(60).corr(returns[ticker_b])

    # Spread (log price ratio) for mean-reversion
    spread = np.log(closes[ticker_a] / closes[ticker_b])
    spread_z = (spread - spread.mean()) / spread.std()

    return {
        "correlation": round(corr, 4),
        "beta": round(beta, 4),
        "r_squared": round(r_squared, 4),
        "rolling_corr_mean": round(rolling_corr.mean(), 4),
        "rolling_corr_std": round(rolling_corr.std(), 4),
        "rolling_corr_min": round(rolling_corr.min(), 4),
        "rolling_corr_max": round(rolling_corr.max(), 4),
        "spread_z_current": round(spread_z.iloc[-1], 4),
        "observations": len(returns),
    }
```

### B2：展示结果

展示一个摘要卡片：

| 指标 | 数值 |
|---|---|
| 皮尔逊相关系数 | 0.82 |
| 贝塔系数（B 相对于 A） | 1.15 |
| R 方 | 0.67 |
| 滚动相关系数（60 日平均值） | 0.80 |
| 滚动相关系数范围 | [0.55, 0.94] |
| 滚动相关系数标准差 | 0.08 |
| 价差 Z 分数（当前） | +1.2 |
| 观测值数量 | 250 |

解读指南：
- **相关系数 > 0.80**：强同向变动——这些股票紧密联动
- **相关系数 0.50–0.80**：中等——存在共同的行业驱动因素，但也有各自的独立因素
- **相关系数 < 0.50**：弱——尽管可能属于相同或重叠行业，但联动有限
- **滚动标准差较高**：关系不稳定——相关性随时间发生显著变化
- **价差 Z 分数 > |2|**：相对于历史关系出现异常偏离

---

## 子技能 C：行业聚类

**目标**：给定一组股票代码，展示完整的相关性结构并识别聚类。

### C1：构建相关矩阵

```python
import yfinance as yf
import pandas as pd
import numpy as np

def sector_clustering(tickers, period="1y"):
    data = yf.download(tickers, period=period, auto_adjust=True, progress=False)

    # yf.download returns MultiIndex (Price, Ticker) columns
    closes = data["Close"].dropna(axis=1, thresh=max(60, len(data) // 2))
    returns = np.log(closes / closes.shift(1)).dropna()
    corr_matrix = returns.corr()

    # Hierarchical clustering order
    from scipy.cluster.hierarchy import linkage, leaves_list
    from scipy.spatial.distance import squareform

    dist_matrix = 1 - corr_matrix.abs()
    np.fill_diagonal(dist_matrix.values, 0)
    condensed = squareform(dist_matrix)
    linkage_matrix = linkage(condensed, method="ward")
    order = leaves_list(linkage_matrix)
    ordered_tickers = [corr_matrix.columns[i] for i in order]

    # Reorder matrix
    clustered = corr_matrix.loc[ordered_tickers, ordered_tickers]

    return clustered, returns
```

注意：如果 `scipy` 不可用，则改为按平均相关系数排序，而不是使用层次聚类。

### C2：展示结果

1. **完整相关矩阵**——格式化为表格。对于超过 8 个股票代码的情况，以热力图描述的形式展示，或仅突出相关性最强和最弱的股票对。

2. **识别出的聚类**——将组内相关性较高的股票代码分组：
   - 聚类 1：[NVDA, AMD, AVGO]——组内平均相关系数为 0.82
   - 聚类 2：[AAPL, MSFT]——组内平均相关系数为 0.75

3. **离群项**——与该组平均相关性较低的股票代码（潜在的分散化标的）。

4. **最强股票对**——矩阵中相关性最高的前 5 个股票对。

5. **最弱股票对**——相关性最低或负相关性最强的前 5 个股票对（对冲候选标的）。

---

## 子技能 D：已实现相关性

**目标**：展示相关性如何随时间及不同市场状况而变化。

### D1：滚动相关性

```python
import yfinance as yf
import pandas as pd
import numpy as np

def realized_correlation(ticker_a, ticker_b, period="2y", windows=[20, 60, 120]):
    data = yf.download([ticker_a, ticker_b], period=period, auto_adjust=True, progress=False)
    closes = data["Close"][[ticker_a, ticker_b]].dropna()

    returns = np.log(closes / closes.shift(1)).dropna()

    rolling = {}
    for w in windows:
        rolling[f"{w}d"] = returns[ticker_a].rolling(w).corr(returns[ticker_b])

    return rolling, returns
```

### D2：按市场状态划分的相关性

```python
def regime_correlation(returns, ticker_a, ticker_b, condition_ticker=None):
    """Compare correlation across up/down/volatile regimes."""
    if condition_ticker is None:
        condition_ticker = ticker_a

    ret = returns[condition_ticker]

    regimes = {
        "All Days": pd.Series(True, index=returns.index),
        "Up Days (target > 0)": ret > 0,
        "Down Days (target < 0)": ret < 0,
        "High Vol (top 25%)": ret.abs() > ret.abs().quantile(0.75),
        "Low Vol (bottom 25%)": ret.abs() < ret.abs().quantile(0.25),
        "Large Drawdown (< -2%)": ret < -0.02,
    }

    results = {}
    for name, mask in regimes.items():
        subset = returns[mask]
        if len(subset) >= 20:
            results[name] = {
                "correlation": round(subset[ticker_a].corr(subset[ticker_b]), 4),
                "days": int(mask.sum()),
            }

    return results
```

### D3：展示结果

1. **滚动相关性汇总表**：

| 窗口 | 当前值 | 均值 | 最小值 | 最大值 | 标准差 |
|---|---|---|---|---|---|
| 20 日 | 0.88 | 0.76 | 0.32 | 0.95 | 0.12 |
| 60 日 | 0.82 | 0.78 | 0.55 | 0.92 | 0.08 |
| 120 日 | 0.80 | 0.79 | 0.68 | 0.88 | 0.05 |

2. **市场状态相关性表**：

| 市场状态 | 相关性 | 天数 |
|---|---|---|
| 所有交易日 | 0.82 | 250 |
| 上涨日 | 0.75 | 132 |
| 下跌日 | 0.87 | 118 |
| 高波动率（最高 25%） | 0.90 | 63 |
| 大幅回撤（< -2%） | 0.93 | 28 |

3. **关键洞察**：重点说明相关性是否**在抛售期间上升**（这种情况很常见——“危机期间，相关性趋近于 1”）。这对风险管理至关重要。

4. **趋势**：近期相关性相较于历史平均水平，是呈上升还是下降趋势？

---

## 第 3 步：回复用户

运行适当的子技能后，清晰地展示结果：

### 始终包含

- 所使用的**回溯周期**和**数据时间间隔**
- **观测数量**（交易日）
- 由于数据不足而**被剔除的任何股票代码**

### 始终注明

- **相关性不代表因果关系**——共同变动并不意味着存在因果联系
- **过去的相关性不能保证未来的相关性**——市场状态会发生变化
- **较短的回溯窗口**会产生噪声较大的估计结果；较长的窗口更平滑，但可能会遗漏市场状态变化

### 实际应用（相关时提及）

- **联动交易机会**：可能跟随同业公司财报或新闻引发的价格变动的股票
- **配对交易**：价差偏离其均值的高相关性资产对
- **投资组合多元化**：寻找低相关性资产以降低风险
- **对冲**：识别负相关的金融工具
- **板块轮动**：了解哪些板块会同步变动
- **风险管理**：压力时期相关性会急剧上升——多元化可能在最需要时失效

**重要提示**：绝不要推荐具体交易。仅展示数据，让用户自行得出结论。

---

## 参考文件

- `references/sector_universes.md`——使用 yfinance Screener API 动态构建同业资产范围

当你需要为给定的股票代码构建可比公司范围时，请阅读参考文件。