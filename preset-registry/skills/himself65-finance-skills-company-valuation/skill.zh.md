---
name: company-valuation
description: >
  Estimate the intrinsic value of a public company using DCF, relative (peer multiple)
  and sum-of-parts (SOTP) methods, then triangulate to an implied share price with
  upside/downside versus the current market price. Use this skill whenever the user asks:
  "what is AAPL worth", "valuation of NVDA", "fair value of TSLA", "intrinsic value",
  "DCF for MSFT", "build a DCF", "discounted cash flow", "WACC", "terminal value",
  "implied share price", "upside to fair value", "is X overvalued/undervalued",
  "relative valuation", "peer comparison valuation", "EV/EBITDA target", "SOTP",
  "sum of the parts", "how much is [company] worth", "price target from fundamentals",
  "value this company", or any ticker in the context of computing intrinsic or
  relative valuation. Default to running ALL three methods
  (DCF + relative + SOTP-if-applicable) and presenting a blended implied price with a
  sensitivity table. Do not answer valuation questions from memory — always run the workflow.
---
# 公司估值

通过三种方法对内在价值进行交叉验证，然后将其加权合并为隐含股价：

1. **DCF** — 5 年期 FCFF 预测，按 WACC 折现，并计算终值。
2. **相对估值** — 应用可比公司 P/E、EV/Revenue、EV/EBITDA 的中位数。
3. **SOTP** — 当存在 2 个以上不同的报告分部时，使用纯业务可比公司的估值倍数分别评估各分部价值。

始终提供 WACC × 永续增长率敏感性分析表，以及牛市/基准/熊市场景。

**免责声明**：本输出仅用于研究/教育目的。不构成财务建议。

---

## 步骤 1：检测流程

检测数据源和运行时依赖项。该技能支持 3 种方法路径——选择其中可用信息最丰富的路径。

**环境状态：**

```
!`python3 -c "exec('try:\n import yfinance, numpy, pandas\n print(\'YFIN_OK\')\nexcept Exception:\n print(\'YFIN_MISSING\')')"`
```

```
!`(command -v funda && funda --version) 2>/dev/null || echo "FUNDA_CLI_MISSING"`
```

```
!`python3 -c "exec('try:\n import yfinance as yf\n t=yf.Ticker(\'^TNX\')\n p=t.fast_info.last_price\n print(f\'RF_10Y={p/100:.4f}\')\nexcept Exception:\n print(\'RF_FETCH_FAIL\')')"`
```

**决策树：**

| 条件 | 方法路径 |
|---|---|
| `YFIN_OK` | **路径 A**（主要）：使用 yfinance 获取财务数据和可比公司估值倍数 |
| `YFIN_MISSING`，但未设置 `FUNDA_CLI_MISSING` | **路径 B**：委托 `finance-data-providers:funda-data` 技能获取基本面数据 |
| 两者均缺失 | **路径 C**：通过 pip 安装 yfinance，然后执行路径 A。`python3 -m pip install -q yfinance numpy pandas` |
| `RF_FETCH_FAIL` | 使用默认值 `rf = 0.045`，并在输出中注明无风险利率可能已过时 |

如果打印了 `RF_10Y=`，则在步骤 4d 中使用该值作为 `rf`，而不是硬编码的 4.5%。

---

## 步骤 2：选择方法并设置默认值

### 方法适用性

| 公司类型 | DCF | 相对估值 | SOTP | 备选方法 |
|---|---|---|---|---|
| 成熟现金流型（CPG、电信、公用事业） | ✅ 主要方法 | ✅ | ❌ | — |
| 高增长 SaaS / 软件 | ✅，需谨慎 | ✅ 主要方法 | ❌ | 使用 EV/Revenue + 40 法则 |
| 多分部综合企业 | ✅ | ✅ | ✅ 主要方法 | 参见 `references/sotp.md` |
| 银行 / 保险 | ❌ | ✅（P/B、P/TBV） | ❌ | DDM 或超额收益法；在输出中注明 |
| 尚无收入 | ❌ | 仅使用 EV/Revenue | ❌ | 标记为低置信度 |
| REITs | ❌ | ✅（P/FFO、P/AFFO） | ❌ | 基于 NAV |
| 周期性行业（能源、半导体、工业） | ✅，基于周期中值 | ✅ | 有时适用 | 按完整周期进行标准化 |

### 默认值表

在进入步骤 3 之前，以下每个参数都必须有值。除非用户另有指定，否则使用这些默认值。

| 参数 | 默认值 | 理由 |
|---|---|---|
| 预测期 | 5 年 | 标准显式预测窗口 |
| 永续增长率 `g` | 2.5% | 约等于美国长期 GDP 增长率 |
| 无风险利率 `rf` | 使用步骤 1 获取的实时 10 年期美国国债收益率，否则为 4.5% | 当前资本成本基准 |
| 股权风险溢价 `erp` | 5.5% | Damodaran 中间区间 |
| Beta | 来自 yfinance 的 `info['beta']` | 市场观测到的杠杆 Beta |
| 债务成本 `kd` | `interest_expense / total_debt`，否则为 5.5% | 实际利率；若不可用，则使用 IG 利差作为备选 |
| 税率 | 3 年有效税率中位数，下限为 15%，上限为 30% | 剔除一次性因素 |
| 利润率假设 | 各项比率的 3 年中位数 | 平滑周期性噪声 |
| SBC 处理 | 对软件/SaaS 视为现金支出；对工业/CPG 视为非现金支出 | 行业惯例 |
| 可比公司数量 | 4-6 | 平衡信号与噪声 |
| 可比公司估值倍数 | 中位数（而非平均数） | 对异常值更稳健 |
| 方法权重（无 SOTP） | DCF 50% / 相对估值 50% | 等权交叉验证 |
| 方法权重（含 SOTP） | DCF 40% / 相对估值 30% / SOTP 30% | 在适用时赋予 SOTP 权重 |
| 敏感性分析网格 | WACC 以 0.5% 为步长上下浮动 1% × g 从 1.5-3.5%，步长为 0.5% | 5×5 矩阵 |

有关当前无风险利率、ERP 表格和行业 WACC 基准，请参阅 `references/wacc_erp_rates.md`。

---

## 步骤 3：获取数据

```python
import yfinance as yf
import numpy as np
import pandas as pd

TICKER = "AAPL"  # replace
t = yf.Ticker(TICKER)

info       = t.info
income_a   = t.income_stmt
cashflow_a = t.cashflow
balance_a  = t.balance_sheet
income_q   = t.quarterly_income_stmt
cashflow_q = t.quarterly_cashflow

earnings_est = t.earnings_estimate
revenue_est  = t.revenue_estimate

price       = info.get("currentPrice") or info.get("regularMarketPrice")
market_cap  = info.get("marketCap")
shares_out  = info.get("sharesOutstanding")
total_debt  = info.get("totalDebt") or 0
cash        = info.get("totalCash") or 0
beta        = info.get("beta") or 1.0
sector      = info.get("sector")
industry    = info.get("industry")
```

关键财务报表行（yfinance 标签）：

| 所需数据 | 行 |
|---|---|
| 营收 | `Total Revenue` |
| EBIT | `Operating Income` |
| 净利润 | `Net Income` |
| 折旧与摊销 | `Depreciation And Amortization`（在现金流量表中） |
| 资本支出 | `Capital Expenditure`（负值） |
| 营运资本变动 | `Change In Working Capital`（现金流量表） |
| 股份支付 | `Stock Based Compensation`（现金流量表） |

---

## 步骤 4：构建 DCF

完整方法及针对特定行业的调整见 `references/dcf.md`。快速框架：

```python
# 4a. Revenue growth path — fade from Y1 (consensus or hist CAGR) to terminal g
hist_cagr = (rev[-1] / rev[0]) ** (1 / (len(rev)-1)) - 1
y1 = float(revenue_est.loc["+1y", "growth"]) if "+1y" in revenue_est.index else hist_cagr
g_terminal = 0.025
growth_path = np.linspace(y1, g_terminal + 0.01, 5)

# 4b. Margins — 3y median
ebit_margin = float((income_a.loc["Operating Income"] / income_a.loc["Total Revenue"]).iloc[:3].median())
da_pct      = float((cashflow_a.loc["Depreciation And Amortization"] / income_a.loc["Total Revenue"]).iloc[:3].median())
capex_pct   = float((cashflow_a.loc["Capital Expenditure"].abs() / income_a.loc["Total Revenue"]).iloc[:3].median())
nwc_pct     = float((cashflow_a.loc["Change In Working Capital"].abs() / income_a.loc["Total Revenue"]).iloc[:3].median())
tax_rate    = max(0.15, min(0.30, 0.21))  # use effective if available

# 4c. FCFF per year
rev_t = [float(income_a.loc["Total Revenue"].iloc[0])]
fcff  = []
for g in growth_path:
    rev_t.append(rev_t[-1] * (1 + g))
    ebit = rev_t[-1] * ebit_margin
    nopat = ebit * (1 - tax_rate)
    fcff.append(nopat + rev_t[-1]*da_pct - rev_t[-1]*capex_pct - rev_t[-1]*nwc_pct)

# 4d. WACC
rf, erp, kd = 0.045, 0.055, 0.055  # override rf with live value from Step 1
ke = rf + beta * erp
e_v = market_cap / (market_cap + total_debt)
d_v = 1 - e_v
wacc = e_v*ke + d_v*kd*(1 - tax_rate)

# 4e. Terminal value — compute both, use midpoint
tv_gordon = fcff[-1] * (1 + g_terminal) / (wacc - g_terminal)
tv_exit   = (rev_t[-1] * ebit_margin + rev_t[-1] * da_pct) * 15  # peer median EV/EBITDA
tv_base   = 0.5 * (tv_gordon + tv_exit)

# 4f. Bridge to equity
pv_fcff = sum(f / (1+wacc)**(i+1) for i, f in enumerate(fcff))
pv_tv   = tv_base / (1+wacc)**5
ev      = pv_fcff + pv_tv
equity  = ev + cash - total_debt
implied_price_dcf = equity / shares_out
```

**门槛条件：** (a) 如果 `wacc <= g_terminal` → 停止，g 过于激进；(b) 如果 `pv_tv / ev > 0.85` 或 `< 0.45` → 标记并展示两种 TV 方法；(c) 如果 `wacc` 超出 `references/wacc_erp_rates.md` 中行业合理性区间 → 注明。

---

## 第 5 步：相对估值

选择 4-6 家可比公司。可比公司图谱和调整规则见 `references/relative_valuation.md`。

```python
PEERS = ["MSFT", "ORCL", "CRM", "NOW", "SAP", "WDAY"]  # pick by industry
multiples = {}
for p in PEERS:
    pi = yf.Ticker(p).info
    multiples[p] = {
        "pe_fwd": pi.get("forwardPE"),
        "ev_rev": pi.get("enterpriseToRevenue"),
        "ev_ebitda": pi.get("enterpriseToEbitda"),
        "ps": pi.get("priceToSalesTrailing12Months"),
    }
med_pe     = np.nanmedian([v["pe_fwd"] for v in multiples.values()])
med_ev_rev = np.nanmedian([v["ev_rev"] for v in multiples.values()])
med_ev_eb  = np.nanmedian([v["ev_ebitda"] for v in multiples.values()])

eps_ttm    = float(income_q.loc["Diluted EPS"].iloc[:4].sum())
rev_ttm    = float(income_q.loc["Total Revenue"].iloc[:4].sum())
ebitda_ttm = float(income_q.loc["EBIT"].iloc[:4].sum()) + float(cashflow_q.loc["Depreciation And Amortization"].iloc[:4].sum())
net_debt   = total_debt - cash

implied_pe       = med_pe * eps_ttm
implied_ev_rev   = (med_ev_rev * rev_ttm - net_debt) / shares_out
implied_ev_ebit  = (med_ev_eb  * ebitda_ttm - net_debt) / shares_out
implied_price_rel = np.nanmedian([implied_pe, implied_ev_rev, implied_ev_ebit])
```

如果目标公司的增长或利润率状况与可比公司存在重大差异，则将可比公司中位数调整 ±10-30%。务必说明调整幅度及原因。SaaS 的 40 法则基准见 `references/relative_valuation.md`。

---

## 第 6 步：分部加总估值（仅适用于多业务分部公司）

除非 10-K 报告了 2 个或更多具有不同经济特征的经营分部，否则跳过。yfinance 不提供分部数据——用户必须自行提供或从申报文件中解析。完整方法见 `references/sotp.md`：
- 识别各分部，并为每个分部选择纯业务可比公司
- 应用可比公司 EV/EBITDA 中位数（增长型分部则使用 EV/Rev）
- 扣除未分摊的公司成本（如未知，则上限设为收入的 2-5%）
- 扣除净债务和少数股东权益；再除以股份数

SOTP 折价 =（SOTP 价格 − 市场价格）/ SOTP 价格。如果 >20%，则标记为集团折价。

---

## 第 7 步：交叉验证、敏感性分析与情景分析

```python
# Blended implied price
if sotp_price is None:
    blended = 0.5*implied_price_dcf + 0.5*implied_price_rel
else:
    blended = 0.4*implied_price_dcf + 0.3*implied_price_rel + 0.3*sotp_price

# 5x5 sensitivity grid
wacc_grid = [wacc + dx for dx in (-0.01, -0.005, 0, 0.005, 0.01)]
g_grid    = [0.015, 0.020, 0.025, 0.030, 0.035]
sens = {}
for w in wacc_grid:
    for g in g_grid:
        tv = fcff[-1]*(1+g)/(w-g)
        pv = sum(f/(1+w)**(i+1) for i,f in enumerate(fcff)) + tv/(1+w)**5
        sens[(w,g)] = (pv + cash - total_debt) / shares_out
```

还需给出牛市 / 基准 / 熊市情景：收入增长率调整 ±300 个基点，EBIT 利润率调整 ±200 个基点，WACC 调整 ∓100 个基点，终值增长率分别为 3.0% / 2.5% / 1.5%。

---

## 第 8 步：回复用户

按以下顺序输出：

1. **核心结论** — 一句话说明：综合公允价值、与当前价格的对比、上涨/下跌空间百分比，以及最乐观/最悲观的估值方法。示例：“AAPL 综合公允价值约为 $215，当前价格为 $198 → 约有 9% 的上涨空间；DCF 最为乐观，估值为 $228。”
2. **概览** — 板块、行业、市值、当前价格、3 个月 / 12 个月价格变动、LTM 营收增长率。
3. **三种方法汇总** — 3 列表格：方法 | 隐含价格 | 权重 | 简要理由。
4. **DCF 构建** — 假设表（增长路径、利润率、WACC 构成、终值法）+ 5 年 FCFF 预测表 + 企业价值到股权价值的调节表。
5. **可比公司比较** — 可比公司表格，包含预期市盈率、企业价值/营收、企业价值/EBITDA、毛利率、营收增长率；最后一行 = 中位数；标明目标公司的溢价/折价。
6. **SOTP**（如适用）— 分部表 + 调整项 + 股权价值。
7. **敏感性矩阵** — WACC × g 网格（5×5），突出显示基准情景。
8. **情景分析** — 乐观 / 基准 / 悲观情景表，包含关键驱动因素 + 隐含价格。
9. **主要风险** — 3-5 个要点：哪个假设对结果影响最大；哪些因素可能使投资逻辑失效。

### 错误处理

| 缺失 / 边缘情况 | 处理方式 |
|---|---|
| yfinance 返回的 `beta` 为 `None` | 使用 `references/wacc_erp_rates.md` 中的板块默认 beta |
| LTM EBITDA 为负 | 跳过企业价值/EBITDA 倍数；依赖企业价值/营收 + DCF |
| LTM EPS 为负 | 跳过市盈率倍数；如果预期市盈率为正，则使用预期市盈率，否则跳过 |
| Gordon 模型中的增长率 > WACC | 将 `g = wacc − 0.5%` 设为上限并予以标注 |
| 历史数据少于 3 年 | 使用现有数据；将数据置信度标记为“低” |
| 可比公司数据获取失败 | 从中位数计算中剔除该可比公司；在输出中注明 |
| 没有用于 SOTP 的分部数据 | 跳过第 6 节；继续使用 DCF + 相对估值 |

### 需要包含的注意事项
- TTM 数据相对实时情况存在滞后；可比公司倍数反映市场情绪（可能出现过度反应）
- DCF 的结果取决于输入质量；敏感性分析比单点估值更重要
- yfinance 数据并非官方数据；任何决策都应与一手申报文件交叉核对
- 不构成财务建议

---

## 参考文件

- `references/dcf.md` — DCF 方法论 + 针对特定行业的指引（软件、零售、金融、医疗保健、能源、制造、CPG、电信、REITs、流媒体）
- `references/relative_valuation.md` — 可比公司选择、倍数调整规则、40 法则、按主题划分的可比公司组
- `references/sotp.md` — 分部加总估值方法、集团折价识别、催化剂
- `references/wacc_erp_rates.md` — 无风险利率、股权风险溢价、板块 WACC 基准、板块默认 beta