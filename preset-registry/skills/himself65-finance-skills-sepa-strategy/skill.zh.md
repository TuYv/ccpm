---
name: sepa-strategy
description: >
  Analyze stocks using Mark Minervini's SEPA (Specific Entry Point Analysis) methodology.
  Use this skill whenever the user mentions SEPA, Minervini, superperformance, trend template,
  VCP (Volatility Contraction Pattern), Stage 2 uptrend, stage analysis, pivot point breakout,
  or asks about growth stock screening criteria. Also triggers when the user wants to evaluate
  whether a stock meets swing trading entry criteria, check moving average alignment (bullish
  stacking: price above 50MA above 150MA above 200MA), assess breakout quality with volume confirmation,
  calculate position sizing based on risk percentage, or identify consolidation patterns like
  cup-with-handle, flat base, bull flag, or high tight flag. Use this skill even when the user
  simply asks "should I buy this stock" or "is this a good setup" in the context of growth/momentum
  trading, or when they share a stock chart and want pattern analysis.
---
# SEPA 策略分析

使用 Mark Minervini 的 SEPA（特定入场点分析）框架分析股票——这是一套用于识别高概率成长股入场机会并实施严格风险管理的完整系统。

**核心理念：** 买入正确的股票，处于正确的阶段，在精确的入场点买入，并严格控制风险。胜率约为 50–55%——盈利来自不对称的风险/回报（小额亏损、大额盈利），而不是预测走势方向。

> 此技能仅用于教育和分析目的，不构成投资建议。切勿仅依据此分析执行交易。

---

## 步骤 1：收集股票数据

收集该股票的以下数据。使用 yfinance 或任何可用的市场数据工具。

| 所需数据 | 用途 |
|---|---|
| 当前价格 | 趋势模板检查 |
| 50 日、150 日、200 日移动平均线 | 移动平均线排列验证 |
| 52 周高点和低点 | 价格位置检查 |
| 1 个月前和 4–5 个月前的 200 日均线值 | 200 日均线斜率方向 |
| 20 日平均成交量 + 今日成交量 | 成交量比率分析 |
| 最近季度 EPS（最近 3–4 个季度） | EPS 增长与加速情况 |
| 年度 EPS（最近 3 年） | 长期增长趋势 |
| 最近季度营收（最近 3–4 个季度） | 营收增长检查 |
| 毛利率和净利率趋势 | 利润率健康状况 |
| 机构持股变化（如有） | 聪明资金信号 |
| RS 评级或相对标普 500 的 12 个月相对表现 | 相对强度 |
| 价格历史，用于形态识别 | VCP / 图表形态分析 |

如果某些数据无法获取，请注明并根据现有数据继续分析。缺少 RS 评级是一个重大信息缺口——请明确标记。

---

## 步骤 2：阶段分析——识别当前阶段

每只股票都会经历四个阶段。阅读 `references/stage-analysis.md` 以了解完整细节。

确定该股票所处的阶段：

| 阶段 | 特征 | 操作 |
|---|---|---|
| **阶段 1** — 筑底 | 价格接近 200 日均线，均线走平或下降，均线相互缠绕，成交量低迷 | 不采取行动，等待 |
| **阶段 2** — 上升 | 持续创出更高的高点和低点，均线呈多头排列，上涨日成交量放大 | **唯一可以买入的阶段** |
| **阶段 3** — 筑顶 | 高位宽幅波动，频繁出现假突破，成交量放大但价格没有进展 | 减仓，不建立新仓位 |
| **阶段 4** — 下跌 | 跌破所有均线，均线呈空头排列，反弹是卖出机会 | 保持全部现金，远离该股票 |

如果股票不在阶段 2，到此为止并告知用户。无需进行进一步分析。

在阶段 2 内，统计底部编号（已经发生了多少次盘整后突破的周期）：
- **底部 1–2**：最安全，上行潜力最大——持有完整仓位
- **底部 3–4**：仍然有效，但应减小仓位
- **底部 5–6**：处于后期——最多持有半仓
- **底部 7+**：避免——很可能正在过渡到阶段 3

---

## 步骤 3：趋势模板——8 项强制条件

必须同时满足全部 8 项条件。如果有任何一项不满足，该股票就不符合要求。阅读 `references/trend-template.md` 以了解详细说明。

将结果呈现为检查清单：

| # | Condition | Status | Value |
|---|---|---|---|
| 1 | Price > 150MA and Price > 200MA | Pass/Fail | [actual values] |
| 2 | 150MA > 200MA | Pass/Fail | [actual values] |
| 3 | 200MA trending up for ≥1 month (ideally 4-5 months) | Pass/Fail | [slope data] |
| 4 | 50MA > 150MA and 50MA > 200MA | Pass/Fail | [actual values] |
| 5 | Price > 50MA | Pass/Fail | [actual values] |
| 6 | Price ≥ 30% above 52-week low | Pass/Fail | [% above low] |
| 7 | Price within 25% of 52-week high | Pass/Fail | [% from high] |
| 8 | Relative Strength > 70th percentile (prefer 85-90+) | Pass/Fail/Unknown | [RS if available] |

**记忆要点：** 条件 1-5 = “MA staircase”（Price > 50MA > 150MA > 200MA，200MA 上升）。条件 6-7 = “Price position”（远离低点，接近高点）。条件 8 = “Relative strength”（市场领导者）。

---

## Step 4: 基本面检查

强劲的基本面可以将真正的领导股与仅靠动量驱动的股票区分开来。阅读 `references/fundamentals.md`，了解阈值和评级标准。

按重要性顺序检查以下各项：

1. **季度 EPS 增长 ≥ 20%**（最好达到 25-50%+）。低于 20% = 不合格。
2. **EPS 加速增长**：当前季度增长率 > 上一季度增长率。减速（即使增长仍为正）也是一个警告信号。
3. **年度 EPS 增长 ≥ 25%**，且过去 3 年中的每一年都达到该标准。
4. **收入增长 ≥ 15%**（按年度计算），季度增长最好达到 ≥ 20-25%。如果 EPS 增长但收入没有增长，那么增长很可能来自削减成本（不可持续）。
5. **利润率趋势**：毛利率和净利率稳定或扩大 = 健康。即使 EPS 增长，利润率却在收缩 = 红旗信号。
6. **机构持股比例增加**：聪明资金正在吸筹 = Stage 2 行情的燃料。
7. **催化剂**：新产品、FDA 批准、重大合同、市场扩张等。有催化剂的股票可能上涨 50-100%+；没有催化剂的股票通常上涨 15-25%。

基本面评级：**A**（EPS >30%、为正、收入增长）/ **B**（15-30%）/ **C**（0-15%）/ **D**（负增长 — 跳过）。

---

## Step 5: 形态识别

确定正在形成哪种整理形态（如有）。阅读 `references/patterns.md`，了解每种形态的详细识别规则。

### VCP（波动收缩形态）——核心形态

SEPA 的标志性形态。需要关注以下 7 个特征：

1. 股票必须处于 Stage 2 上升趋势中（前提条件）
2. **回撤深度**按序递减（例如：20% → 12% → 6% → 3%）。至少 3 次收缩，4-5 次为理想情况。
3. **成交量随每次收缩而缩小**。最后一次收缩表现为“成交量枯竭”（VDU）——持续数周的低成交量。
4. **低点抬高**——每次回撤的底部都高于前一次。
5. **明确的枢轴点**——整理区间高点 = 等待突破的阻力位。
6. RS > 70（最好达到 85-90+）
7. 市场处于牛市或中性环境

### 其他有效形态

| Pattern | Depth | Duration | Key Feature |
|---|---|---|---|
| Cup with Handle | Cup 12-35%, handle ≤12% | 7-65 weeks | U-shaped base + small handle |
| Flat Base | ≤ 15% | 5-10 weeks | Tight range near prior highs |
| Bull Flag | ≤ 50% of flagpole | 1-5 weeks | Sharp advance + tight drift down |
| High Tight Flag | ≤ 25% after 100%+ advance | 1-4 weeks | Rarest but most powerful |

**所有形态共享同一入场规则**：放量突破枢轴点上方，成交量 ≥ 20 日平均成交量的 1.5 倍。

---

## 第 6 步：入场点分析

阅读 `references/entry-rules.md`，了解详细的入场机制、真突破与假突破的识别方法，以及 pocket pivot 替代方案。

### 主要入场方式：枢轴点突破

- **枢轴点** = 盘整区间内的最高价。这是供需关系的转折点。
- **买入区间** = 枢轴价格至枢轴上方 +5%。这是唯一有效的入场窗口。
- **超过 +5%**：不要追高。等待下一个形态。
- **突破成交量**：必须 ≥ 20 日平均成交量的 1.5 倍（≥ 2 倍则为强确认）。
- **距离财报的时间**：避免在财报发布前 2 周内入场。

### 突破质量检查

| 信号 | 真突破 | 假突破 |
|---|---|---|
| 成交量 | ≥ 平均值的 1.5 倍，显著放量 | 低于平均值，量能疲弱 |
| 收盘价 | 接近当日最高价 | 回落至枢轴点下方 |
| 后续走势 | 次日继续走高 | 回落至区间内 |
| 背景 | 突破前出现 VDU | 突破前没有成交量萎缩 |

### 风险/回报验证

入场前，确认：
- **止损距离**：入场价至止损价 ≤ 7-8%
- **回报/风险比**：目标利润 / 止损距离 ≥ 2:1（优选 3:1）
- 如果比率 < 2:1，则入场风险过高——跳过该机会。

---

## 第 7 步：仓位规模与止损计划

阅读 `references/position-sizing.md`，了解完整公式、示例、止损调整过程和金字塔加仓规则。

### 仓位规模公式

```
Shares = (Account Value × Risk Per Trade %) ÷ (Entry Price − Stop Price)
```

**示例**：账户 $100,000，风险比例 1%，以 $50 买入，止损价为 $46.50：
- 最大亏损 = $100,000 × 1% = $1,000
- 止损距离 = $50 − $46.50 = $3.50
- 股数 = $1,000 ÷ $3.50 = **285 股**（$14,250 = 账户的 14.25%）

### 止损调整过程（3 个阶段）

| 阶段 | 触发条件 | 操作 |
|---|---|---|
| 阶段 1：初始 | 入场时 | 将硬止损设在入场价 −7-8%。不可协商。 |
| 阶段 2：保本 | 股票上涨至 +8% | 卖出一半，将止损移至入场价（保本点）。交易不再可能亏损。 |
| 阶段 3：跟踪 | 股票上涨至 +15% | 再卖出 25%，剩余仓位沿 20MA 跟踪止损。收盘价跌破 20MA = 全部退出。 |

**铁律**：止损只能上移，绝不能下移。绝不要对亏损仓位进行摊低成本加仓。连续亏损 3-4 次后，将每笔交易的风险降至 0.5%。

### 金字塔加仓（为盈利仓位加仓）

只对盈利仓位加仓，并逐步减小加仓规模：初始仓位的 50% → 上涨 +8% 时加仓 30% → 突破下一个底部时加仓 20%。绝不要对亏损仓位加仓。

---

## 第 8 步：市场环境检查

阅读 `references/market-environment.md`，了解详细标准。

市场环境是仓位规模的总开关：

| 环境 | 标准 | 每笔交易风险 | 最大持仓数 |
|---|---|---|---|
| **牛市** | S&P 500/Nasdaq 位于 200MA 上方，市场广度扩张，新高数 > 新低数 | 1-2% | 6-8 |
| **震荡市** | 指数横盘，突破频繁失败 | 0.5-1% | 2-3 |
| **熊市** | 指数位于 200MA 下方，超过 50% 的股票位于 200MA 下方 | 0%（不建立新仓位） | 0（全部持有现金） |

即使是最优秀的设置，在熊市中也会失效。在熊市中持有现金本身就是一种制胜策略——为下一轮牛市保留资本。

---

## 第 9 步：回应用户

提供一份结构化分析报告，包含以下部分：

### 报告结构

1. **股票与阶段**：股票代码、当前价格、识别出的阶段；如果处于第 2 阶段，还要包括底部计数
2. **趋势模板评分卡**：包含 8 项条件的检查清单，并标明通过/未通过及实际数值
3. **基本面评级**：A/B/C/D，并包括 EPS 增长、加速状态、收入、利润率
4. **识别出的形态**：属于哪种形态（VCP、杯柄形、横向底、旗形、HTF，或无），并列出关键测量值（收缩深度、成交量表现）
5. **入场评估**：
   - 如果存在有效形态：枢轴价、买入区间、突破所需的成交量
   - 如果尚未形成：需要关注什么
   - 如果已经延伸：`This has moved beyond the buy zone — wait for the next consolidation`
6. **仓位规模**：使用公式，给出确切的股数、止损价、第一目标价、第二目标价以及收益/风险比。如果用户未提供账户规模和风险承受能力，请向用户询问
7. **市场环境**：当前评估，以及它如何影响仓位规模
8. **总体结论**：以下三者之一：
   - **Strong Buy Setup** — 所有条件均已满足，目前可以执行
   - **Watch List** — 前景良好，但形态尚未完成，或某项条件处于边缘状态
   - **Pass** — 未通过趋势模板、处于错误阶段，或基本面较差

最后始终以免责声明结尾，说明这只是教育性分析，不构成投资建议。

---

## 参考文件

- `references/stage-analysis.md` — 四阶段理论、阶段转换信号、底部计数
- `references/trend-template.md` — 8 项条件的详细说明和记忆辅助
- `references/fundamentals.md` — EPS、收入、利润率、机构持股、催化剂
- `references/patterns.md` — VCP 的 7 条规则、杯柄形、横向底、旗形、高紧旗形、优质信号与虚假信号
- `references/entry-rules.md` — 枢轴点机制、买入区间、口袋枢轴、真假突破识别
- `references/position-sizing.md` — 公式、止损的 3 阶段演变、加仓、亏损处理
- `references/market-environment.md` — 牛市/震荡市/熊市标准和仓位调整规则