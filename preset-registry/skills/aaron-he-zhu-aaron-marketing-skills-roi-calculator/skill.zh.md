---
name: roi-calculator
slug: aaron-roi-calculator
displayName: "ROI Calculator · ROI 计算"
summary: "活动投入产出核算:成本归集、收益口径与 ROI 及 STAR 回报(R)证据汇总"
description: 'Use when the user asks to "calculate influencer ROI", "prove campaign value", or "what was our ROAS"; produces direct ROI/ROAS, earned media value, attribution-modeled revenue, LTV-based ROI, and a stakeholder-ready summary. Not for building the full slide/written report — use report-generator. 达人营销ROI计算/投资回报测算'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when measuring or projecting influencer campaign ROI, justifying or defending budgets, comparing ROI across campaigns or channels, evaluating individual influencer or tier value, or preparing executive-level ROI numbers. Activate when the user supplies spend and results data and wants ROI, ROAS, EMV, CPA/CAC, attribution, or LTV impact computed."
argument-hint: "<campaign name or spend> [revenue] [results data]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# ROI 计算器

此技能帮助你使用适合目标和可用数据的各种方法，计算并传达网红营销活动的投资回报率。

> **跨学科（付费广告）：**这是付费广告共用的**回报计算引擎**——[paid-measurement-loop](../../../ad/scale/paid-measurement-loop/SKILL.md)、[attribution-reconciler](../../../ad/scale/attribution-reconciler/SKILL.md)以及 budget-optimizer 在此委托计算 ROAS/CPA/回本周期比率，而不是重新计算。将付费广告运行结果保存到 `memory/ad/roi-calculator/`。

## 快速开始

最简调用方式：

```
Calculate ROI for our influencer campaign: $25K spend, $72K revenue, 2.1M reach
```

常见场景：在报告前比较不同方法：

```
What's the ROI of our campaign using direct revenue, EMV, and LTV-based methods?
```

## 技能契约

- **读取**：活动 ID、在请求创作者层级计算时完整的不透明创作者范围、支出/成本基础明细、去重后的结果数据（触达人数、展示次数、互动次数、点击次数、转化次数、归因收入、新客户数）、预先声明的归因模型/窗口/决策规则，以及在计算范围包含 LTV 时所需的 AOV 和经济 LTV 输入，还有 `performance-analyzer` 之前生成的绩效输出。复用已授权的不透明 `creator_ref` 值；原始账号标识/姓名/URL/提供商 ID 仅在临时处理中使用，永远不会用于标识已保存的行。
- **写入**：默认以内联方式返回 ROI 计算结果和摘要；只有获得明确的 WARM 保存授权后，才将其保存到 `memory/influencer/roi-calculator/YYYY-MM-DD-<topic>.md`（或已声明的付费广告路径）。保存的输出使用 `campaign_id`、完整的不透明 `creator_ref` 范围以及不透明的证据/工件引用，绝不使用原始身份定位信息。
- **提升**：只有获得单独的明确授权后，才能将带有归因窗口、来源和不确定性的持久化核心数字提升到 `memory/hot-cache.md`；计算请求或 WARM 保存请求并不授权此操作。
- **完成条件**：
  1. 使用输入数据并展示公式，至少计算出一种 ROI 方法。
  2. 每个核心指标都必须与一个已声明且带来源日期的比较目标进行对照；不得臆造通用基准。
  3. 写出底线算术评估和 1-3 条建议。只有在已验证归因收入和完整活动成本基础后，才能称该活动盈利；否则应说明盈利能力尚未验证。
  4. 每个分母都必须经过验证为数值且 `> 0`；分母为零、负数、缺失或不兼容时，返回 `undefined`/`NEEDS_INPUT`，绝不能返回比率。
- **主要后续技能**：[report-generator](../report-generator/SKILL.md)

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中的标准格式输出。

## 数据源

此系列属于 Tier 1——无需实时集成即可运行。向用户索取支出和结果数据，并根据这些输入计算所有内容。下方的连接器可在可用时自动获取这些数字：

- `~~social platform analytics` — 用于 EMV 和每指标成本计算的各平台触达量、展示次数、互动量和视频观看次数。
- `~~ecommerce / analytics` — 用于直接 ROI 和归因的收入、转化次数、链接点击次数和 AOV。
- `~~CRM` — 用于基于 LTV 的 ROI 的新客户数量、重复购买率和生命周期价值。
- `~~influencer database` — 用于按影响者计算 ROI 的每位影响者费用和层级数据。

即使没有任何集成，手动提供投资表和结果表后，该 skill 仍会完成所有计算。有关各类别的免费/无密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

当用户请求计算 ROI 时，执行以下步骤。每一步在 [references/roi-templates.md](references/roi-templates.md) 中都有一个填空模板，请将步骤编号链接到其中对应的代码块。

1. **收集 ROI 输入** — 活动详情、投资（总支出）表和结果数据表。([模板](references/roi-templates.md#step-1--roi-calculation-inputs))

2. **计算直接 ROI** — 简单 ROI = (收入 − 投资) / 投资 × 100；ROAS = 收入 / 投资。除非收入归因和完整成本基础已经过验证，否则将差额称为**已声明公式下的净回报**，不要称为利润。说明算术回报为正数、零或负数，并单独说明盈利能力验证状态。([模板](references/roi-templates.md#step-2--direct-roi-calculation))

3. **计算赢得媒体价值（EMV）** — 仅使用所提供或引用的、带有来源日期的可比指标，按展示次数计算（展示次数 × 可比 CPM / 1000）或按互动次数计算（互动次数 × 可比 CPE）。分别报告适用的方法，并使用预先声明的选择/加权规则；默认情况下，绝不要将存在重叠的方法取平均或相加。如果不存在有效的可比指标，则为 EMV 返回 `NEEDS_INPUT`。([模板](references/roi-templates.md#step-3--earned-media-value-emv))

4. **计算成本效率指标** — CPM、CPR、CPE、CPV、CPC、CPA 和 CAC。仅与已声明且带有来源日期、市场、时间窗口和归因基础相兼容的目标进行比较；否则，以描述性方式报告该指标，并将比较标记为待处理。([模板](references/roi-templates.md#step-4--cost-efficiency-analysis))

5. **应用归因模型** — 只有在提供完整的转化全集、订单/事件去重键、用户旅程触点、符合条件的渠道和分配规则后，才能使用一个预先声明的模型。可选的替代模型必须基于同一去重后的转化集合，明确作为不可相加的敏感性场景；绝不能在查看结果后选择最有利的模型。缺少输入或模型选择权限时，返回 `NEEDS_INPUT`，而不是归因收入。([模板](references/roi-templates.md#step-5--attribution-analysis))

6. **计算客户生命周期价值影响** — 只有在 `New Customers` 已针对控制归因全集完成去重，并且所提供的 LTV 是完整的贡献利润率基础，包含队列、时间范围、留存率/流失率、退款、利润率、折现/时间因素、是否包含首次订单、来源/日期以及为正数且兼容的投资分母时，才能将结果标记为 **LTV-Based ROI**。然后使用 `((New Customers × contribution-margin LTV) − Investment) / Investment × 100`。收入型 LTV 输入只能产生带有其基础/时间范围/状态的**预计收入基础场景**；它不是经济 ROI 或利润，绝不能与直接归因收入或另一个 LTV 时间范围相加。缺少字段时返回 `NEEDS_INPUT`。([模板](references/roi-templates.md#step-6--lifetime-value-analysis))

7. **计算按创作者划分的 ROI** — 仅适用于完整锁定的创作者范围、已解析的不透明引用、兼容的时间窗口/成本口径，以及去重后的归因收入。按创作者和层级汇总的 ROAS 均为 `sum(attributed revenue) / sum(spend)`，绝不能使用简单平均值；仅可依据预先声明的规则进行排名。([模板](references/roi-templates.md#step-7--influencer-level-roi))

8. **生成 ROI 报告摘要** — 投资、回报、按方法计算的 ROI、关键指标与基准的对比、结论，以及 1-3 条建议。([模板](references/roi-templates.md#step-8--roi-summary-report))

9. **为门槛判定限定候选回报（R）证据的资格**

   第 1–8 步的财务输出是 STAR 的**候选回报（R）证据**：将 ROI/ROAS 与声明的目标（`R1`）和替代渠道基线（`R3`）进行对照，在标准化窗口内对 CPE/CPM/CPA 进行基准比较（`R2`），将 KPI 达成情况与预注册目标进行对照（`R4`），使用明确的方法和严谨性对转化进行归因（`R5`），并在可衡量时将增量影响与基线分离（`R6`）。只有在其确切来源、实体、观测窗口和归因依据均经过验证时，字段才属于 Measured；基于 User-provided 或 Estimated 输入进行的算术运算属于 Calculated，而不是 Measured。回报证据仅适用于 `assessment_time: actual`；预测结果不具有 `R1`–`R6`。

   将这些回报证据交给 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 门槛判定流程 — 它会将 R 纳入完整的实际 STAR 运行，并计算按画像加权的 **SQS**。此 skill 不运行评分器，也不输出综合分数。未经验证的转化会输出 `results-unverified`：将 `R1`/`R2`/`R5` 报告为低置信度，并且不得提出任何可归因回报声明。这些财务数字会作为 R 证据被使用；它们本身不是 SQS。

   对于多创作者活动，门槛判定流程会分别评估每个创作者合作关系；按预算加权的各合作关系 SQS 平均值可以用于概括活动，但绝不能替代按合作关系进行的诊断。此 skill 提供按合作关系划分的回报证据；它不聚合或汇总综合分数。

10. **仅在获得许可后持久化** — 只有在获得授权后，才可保存到 `memory/influencer/roi-calculator/`（或付费路径）下；请求单独授权以提升热缓存。

对于此 skill 中的每个公式，都要验证分母为数值且严格大于零。如果投资、展示次数、触达人数、互动次数、观看次数、点击次数、获客数、客户数或其他所需分母为零、负数、缺失，或与分子时间窗口不兼容，则将该比率报告为 `undefined`，并对该指标返回 `NEEDS_INPUT`。绝不能静默地除以零、强制转换分母，或替换为名义值。

## 示例

**用户**：“计算我们的网红活动 ROI：25,000 美元支出、72,000 美元收入、210 万触达人数”

**输出**：

```markdown
# ROI Calculation Summary

## Investment & Returns

| Item | Value |
|------|-------|
| Total Investment | $25,000 |
| Revenue used in calculation | $72,000 (User-provided; source/window unverified) |
| Total Reach | 2,100,000 |

## ROI Results

### Direct ROI — calculated on User-provided revenue basis
- **Net return under the declared formula**: $47,000
- **ROI**: 188%
- **ROAS**: 2.88:1

The supplied revenue implies $2.88 per $1 spent. `results-unverified`: no attribution source, method, or window was supplied, so this is not an attributable, causal, or incremental-return claim.

### Earned Media Value
- **EMV**: `NEEDS_INPUT` — no source-dated comparable CPM/CPE or declared valuation rule was supplied
- **EMV Multiple**: `NEEDS_INPUT`

### Cost Efficiency
- **CPM**: $11.90
- **CPA**: Unknown (conversion count was not supplied)

## Assessment: Positive arithmetic return on the supplied basis; profitability and causality unverified

Supplied revenue exceeds supplied investment under the declared formula, but no complete cost basis, attribution source/window, source-dated peer target, or incrementality evidence was provided. Do not infer profit, benchmark outperformance, or causal lift, and do not authorize a scale decision from this read alone; obtain verified conversions, attribution evidence, complete costs, and the campaign owner's precommitted decision rule first.
```

源日期基准测试证据模板位于 [references/roi-templates.md#benchmark-evidence-template](references/roi-templates.md#benchmark-evidence-template)。

## 参考资料

- [references/roi-templates.md](references/roi-templates.md) — 为每个 Instructions 步骤、演示示例和基准测试证据输入提供的填空模板。
- [measurement-protocol.md](../../../references/measurement-protocol.md) — 在回读窗口内，针对控制组读取 ROI 和 Return (R) 的差值；不要过度声称归因关系。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无需密钥数据方案。
- STAR 评分：[star-benchmark.md](../../../references/star-benchmark.md) — 本技能的证据所提供的 Return (R) 维度，以及门禁计算的按配置文件加权的 SQS。
- [performance-analyzer](../performance-analyzer/SKILL.md) — 提供本技能使用的结果数据。
- [report-generator](../report-generator/SKILL.md) — 将这些数字整合进完整报告。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 使用 ROI 输出重新分配支出。
- [campaign-planner](../../target/campaign-planner/SKILL.md) — 设定用于检查这些结果的 ROI 目标。

## 下一项最佳技能

**主要技能**：[report-generator](../report-generator/SKILL.md) — 将 ROI 数字转化为面向利益相关者的报告。

**备选技能**（同属 Report 系列）：

- [performance-analyzer](../performance-analyzer/SKILL.md) — 如果 ROI 计算暴露出缺口，则返回进行更深入的绩效拆解。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 将按影响者和按层级划分的 ROI 纳入下一轮预算分配。

终止说明：维护本次会话中已调用技能的 visited-set。如果主要的下一项技能已经运行，则停止并报告链路已完成，不要再次调用。单条链最多执行 3 跳。