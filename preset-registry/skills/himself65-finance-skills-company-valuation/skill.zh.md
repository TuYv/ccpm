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

通过三种方法交叉测算内在价值，然后将结果综合为隐含股价：

1. **DCF** — 预测 5 年 FCFF，按 WACC 折现，并计算终值。
2. **Relative** — 应用同行中位数 P/E、EV/Revenue、EV/EBITDA。
3. **SOTP** — 当存在 2 个或以上不同的报告分部时，按纯业务同行倍数分别对各分部估值。

始终提供 WACC × 终值增长率敏感性表，以及 Bull/Base/Bear 情景。

**免责声明**：研究/教育用途输出。不构成投资建议。

---

## 第 1 步：检测流程

检测数据源和运行时依赖项。该技能支持 2 条方法路径——选择当前可用的最完整路径。

**环境状态：**

```
!`python3 -c "exec('try:\n import yfinance, numpy, pandas\n print(\'YFIN_OK\')\nexcept Exception:\n print(\'YFIN_MISSING\')')"`
```

```
!`python3 -c "exec('try:\n import yfinance as yf\n t=yf.Ticker(\'^TNX\')\n p=t.fast_info.last_price\n print(f\'RF_10Y={p/100:.4f}\')\nexcept Exception:\n print(\'RF_FETCH_FAIL\')')"`
```

**决策树：**

| 条件 | 方法路径 |
|---|---|
| `YFIN_OK` | **路径 A**（主要路径）：使用 yfinance 获取财务数据和同行倍数 |
| `YFIN_MISSING` | **路径 B**：pip 安装 yfinance，然后执行路径 A。`python3 -m pip install -q yfinance numpy pandas` |
| `RF_FETCH_FAIL` | 使用默认值 `rf = 0.045`，并在输出中注明无风险利率已过时的风险 |

如果打印出 `RF_10Y=`，则在第 4d 步中使用该值作为 `rf`，而不是使用硬编码的 4.5%。

---

## 第 2 步：选择方法并设置默认值

### 方法适用性

| 公司类型 | DCF | Relative | SOTP | 备用方案 |
|---|---|---|---|---|
| 成熟型现金流公司（CPG、电信、公用事业） | ✅ 主要方法 | ✅ | ❌ | — |
| 高增长 SaaS / 软件 | ✅ 谨慎使用 | ✅ 主要方法 | ❌ | 使用 EV/Revenue + Rule of 40 |
| 多分部企业集团 | ✅ | ✅ | ✅ 主要方法 | 参见 `references/sotp.md` |
| 银行 / 保险 | ❌ | ✅（P/B、P/TBV） | ❌ | DDM 或超额收益法；在输出中注明 |
| 尚未产生收入 | ❌ | 仅 EV/Revenue | ❌ | 标记为低置信度 |
| REITs | ❌ | ✅（P/FFO、P/AFFO） | ❌ | 基于 NAV |
| 周期性行业（能源、半导体、工业） | ✅ 基于中周期水平 | ✅ | 有时适用 | 按完整周期进行正常化 |

### 默认值表

以下每个参数在进入第 3 步之前都 MUST 具有一个值。除非用户另行指定，否则使用以下值。

| 参数 | 默认值 | 理由 |
|---|---|---|
| 预测期限 | 5 年 | 标准的明确预测期 |
| 终值增长率 `g` | 2.5% | 约等于美国长期 GDP 增速 |
| 无风险利率 `rf` | 第 1 步获取的实时 10 年期美国国债利率，否则为 4.5% | 当前资本成本的锚点 |
| 股权风险溢价 `erp` | 5.5% | Damodaran 的中间区间 |
| Beta | 来自 yfinance 的 `info['beta']` | 市场观察到的杠杆 Beta |
| 债务成本 `kd` | `interest_expense / total_debt`，否则为 5.5% | 有效利率；备用值为投资级信用利差 |
| 税率 | 3 年有效税率中位数，下限 15%，上限 30% | 剔除一次性因素 |
| 利润率假设 | 各项比率的 3 年中位数 | 平滑周期性噪声 |
| SBC 处理 | 软件/SaaS 视为现金；工业/CPG 视为非现金 | 行业惯例 |
| 同行数量 | 4-6 家 | 在信号与噪声之间取得平衡 |
| 同行倍数 | 中位数（而非平均数） | 对异常值更稳健 |
| 方法权重（无 SOTP） | DCF 50% / Relative 50% | 等权交叉测算 |
| 方法权重（有 SOTP） | DCF 40% / Relative 30% / SOTP 30% | 在适用时赋予 SOTP 权重 |
| 敏感性网格 | WACC 以 ±1% 为范围、每 0.5% 一档 × g 从 1.5% 至 3.5%、每 0.5% 一档 | 5×5 矩阵 |

请参阅 `references/wacc_erp_rates.md`，了解当前无风险利率、ERP 表格和行业 WACC 基准。

---

## 步骤 3：提取数据

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

| 需求 | 行 |
|---|---|
| 收入 | `Total Revenue` |
| EBIT | `Operating Income` |
| 净利润 | `Net Income` |
| D&A | `Depreciation And Amortization`（在 cashflow 中） |
| CapEx | `Capital Expenditure`（负值） |
| ΔNWC | `Change In Working Capital`（cashflow） |
| SBC | `Stock Based Compensation`（cashflow） |

---

## 步骤 4：构建 DCF

完整方法和行业特定调整见 `references/dcf.md`。快速框架：

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

**门槛条件：** (a) 如果 `wacc <= g_terminal` → 停止，g 过于激进；(b) 如果 `pv_tv / ev > 0.85` 或 `< 0.45` → 标记并展示两种 TV 计算方法；(c) 如果 `wacc` 超出 `references/wacc_erp_rates.md` 中的行业合理性区间 → 注明。

---

## 步骤 5：相对估值

选择 4-6 家可比公司。可比公司映射和调整规则见 `references/relative_valuation.md`。

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

如果目标公司的增长或利润率特征存在重大差异，则将可比公司中位数调整 ±10-30%。始终说明调整幅度及原因。SaaS 的 Rule of 40 基准见 `references/relative_valuation.md`。

---

## 步骤 6：SOTP（仅适用于多业务分部公司）

除非 10-K 报告了 2+ 个具有不同经济特征的经营分部，否则跳过。yfinance 不会提供分部数据 — 用户必须提供数据或从申报文件中解析。完整方法见 `references/sotp.md`：
- 识别各分部 + 为每个分部选择纯业务可比公司
- 应用可比公司的 EV/EBITDA 中位数（增长型分部则使用 EV/Rev）
- 扣除未分配的公司层面成本（如果未知，则按收入的 2-5% 设置上限）
- 扣除净债务、少数股东权益；除以股数

SOTP 折价 = (SOTP price − market price) / SOTP price。如果 >20%，则标记（集团折价）。

---

## 步骤 7：三角验证、敏感性分析、情景分析

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

此外，还需生成 Bull / Base / Bear 情景：收入增长率分别调整 ±300bps，EBIT 利润率分别调整 ±200bps，WACC 分别调整 ∓100bps，终值 g 分别设为 3.0% / 2.5% / 1.5%。

---

## 步骤 8：回复用户

按以下顺序输出：

1. **核心结论** — 用一句话说明：综合公允价值、相较当前价格、上涨/下跌百分比、最看涨/看跌的方法。示例：“AAPL 的公允价值约为 215 美元（综合），相较当前价格 198 美元 → 上涨约 9%；DCF 最为看涨，估值为 228 美元。”
2. **概览** — 板块、行业、市值、当前价格、3 个月 / 12 个月价格变化、LTM 收入增长率。
3. **三种方法汇总** — 3 列表格：方法 | 隐含价格 | 权重 | 简要依据。
4. **DCF 构建** — 假设表（增长路径、利润率、WACC 组成部分、终值方法）+ 5 年 FCFF 预测表 + EV-to-equity 桥接。
5. **可比公司比较** — 包含同行公司的 P/E fwd、EV/Rev、EV/EBITDA、毛利率、收入增长率的表格；底部一行为中位数；标记目标公司的溢价/折价。
6. **SOTP**（如适用）— 分部表格 + 调整项 + 股权价值。
7. **敏感性矩阵** — WACC × g 网格（5×5），突出显示基准情景。
8. **情景分析** — Bull / Base / Bear 表格，包含驱动因素 + 隐含价格。
9. **关键风险** — 3-5 个要点：哪个假设对结果影响最大；哪些因素可能导致投资逻辑失效。

### 错误处理

| 缺失 / 边缘情况 | 操作 |
|---|---|
| yfinance returns `None` for beta | 使用 `references/wacc_erp_rates.md` 中的行业默认 beta |
| Negative LTM EBITDA | 跳过 EV/EBITDA 倍数；依靠 EV/Revenue + DCF |
| Negative LTM EPS | 跳过 P/E 倍数；如果 forward P/E 为正则使用，否则跳过 |
| Growth > WACC in Gordon | 将 `g = wacc − 0.5%` 设为上限并标记 |
| Fewer than 3 years history | 使用现有数据；将数据置信度标记为 "low" |
| Peer data fetch fails | 从中位数计算中删除该同行；在输出中注明 |
| No segment data for SOTP | 跳过第 6 节；继续使用 DCF + Relative |

### 需包含的注意事项

- TTM 数据滞后于实时数据；同行公司的倍数反映市场情绪（可能出现过度偏离）
- DCF 取决于输入数据的质量；敏感性分析比单点估值更重要
- yfinance 数据为非官方数据；任何决策都应通过主要监管文件进行交叉核对
- 不构成投资建议

---

## 参考文件

- `references/dcf.md` — DCF 方法论 + 行业特定指引（软件、零售、金融、医疗保健、能源、制造业、CPG、电信、REITs、流媒体）
- `references/relative_valuation.md` — 同行公司选择、倍数调整规则、Rule of 40、按主题划分的同行公司集合
- `references/sotp.md` — 分部加总方法论、企业集团折价识别、催化剂
- `references/wacc_erp_rates.md` — 无风险利率、股权风险溢价、行业 WACC 基准、行业默认 beta