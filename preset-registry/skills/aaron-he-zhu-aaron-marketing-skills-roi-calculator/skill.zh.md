---
name: roi-calculator
slug: aaron-roi-calculator
displayName: "ROI Calculator · ROI 计算"
summary: "活动投入产出核算:成本归集、收益口径与 ROI 及 STAR 回报(R)证据汇总"
description: 'Use when the user asks to "calculate influencer ROI", "prove campaign value", or "what was our ROAS"; produces direct ROI/ROAS, earned media value, attribution-modeled revenue, LTV-based ROI, and a stakeholder-ready summary. Not for building the full slide/written report — use report-generator. 达人营销ROI计算/投资回报测算'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when measuring or projecting influencer campaign ROI, justifying or defending budgets, comparing ROI across campaigns or channels, evaluating individual influencer or tier value, or preparing executive-level ROI numbers. Activate when the user supplies spend and results data and wants ROI, ROAS, EMV, CPA/CAC, attribution, or LTV impact computed."
argument-hint: "<campaign name or spend> [revenue] [results data]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# ROI 计算器

此技能可帮助你使用适合你的目标和可用数据的多种方法，计算并传达网红营销活动的投资回报率。

> **跨领域（付费广告）：**这是付费广告共享的**回报计算引擎**——[paid-measurement-loop](../../../ad/scale/paid-measurement-loop/SKILL.md)、[attribution-reconciler](../../../ad/scale/attribution-reconciler/SKILL.md) 和 budget-optimizer 会将 ROAS/CPA/回本周期比率委托给此处计算，而不是自行重复计算。将付费广告运行结果保存在 `memory/ad/roi-calculator/` 下。

## 快速开始

最简调用方式：

```
Calculate ROI for our influencer campaign: $25K spend, $72K revenue, 2.1M reach
```

常见场景——在报告之前比较不同方法：

```
What's the ROI of our campaign using direct revenue, EMV, and LTV-based methods?
```

## 技能契约

- **读取**：活动支出明细、结果数据（覆盖人数、展示次数、互动次数、点击次数、转化次数、收入、新客户数）；如果计算范围包括 LTV，则还会读取 AOV 和复购率数据；以及来自 `performance-analyzer` 的任何既有效果分析输出。
- **写入**：位于 `memory/influencer/roi-calculator/YYYY-MM-DD-<topic>.md` 的 ROI 计算文件，其中包含直接 ROI/ROAS、EMV、成本效益指标、归因模型收入、基于 LTV 的 ROI、按网红细分的 ROI，以及汇总报告区块。
- **提升**：仅在获得单独授权后，才会提升持久化的核心数据，并附带其归因窗口、来源和不确定性；仅提出计算请求并不代表授权写入热缓存。
- **完成条件**：
  1. 至少使用一种 ROI 方法完成计算，并展示输入值和公式。
  2. 每个核心指标都必须依据一个已声明且标注来源日期的比较目标进行陈述；不得凭空设定通用基准。
  3. 写明最终结论（盈利 / 盈亏平衡 / 亏损）以及 1-3 条建议。
- **主要后续技能**：[report-generator](../report-generator/SKILL.md)

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列属于 Tier 1——无需实时集成即可运行。向用户索取支出和结果数据，并根据这些输入完成所有计算。以下连接器可在可用时自动提取相关数据：

- `~~social platform analytics`——从各个平台获取覆盖人数、展示次数、互动次数和视频观看次数，用于计算 EMV 和单项指标成本。
- `~~ecommerce / analytics`——获取收入、转化次数、链接点击次数和 AOV，用于计算直接 ROI 和归因。
- `~~CRM`——获取新客户数、复购率和客户终身价值，用于计算基于 LTV 的 ROI。
- `~~influencer database`——获取每位网红的费用和层级数据，用于计算按网红细分的 ROI。

即使没有任何集成，只需手动提供投资和结果表格，此技能仍可完成全部计算。有关各类别的免费/无密钥配置方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 操作说明

当用户请求计算 ROI 时，请执行以下步骤。每个步骤在 [references/roi-templates.md](references/roi-templates.md) 中都有一个可填写的模板——请将步骤编号链接到其中对应的区块。

1. **收集 ROI 输入数据** — 包括活动详情、投资（总支出）表和结果数据表。([模板](references/roi-templates.md#step-1--roi-calculation-inputs))

2. **计算直接 ROI** — 简单 ROI =（收入 − 投资）/ 投资 × 100；ROAS = 收入 / 投资。说明利润，并给出盈利/盈亏平衡/亏损评估。([模板](references/roi-templates.md#step-2--direct-roi-calculation))

3. **计算赢得媒体价值 (EMV)** — 基于展示次数（展示次数 × CPM / 1000）和基于互动次数（互动次数 × CPE）分别计算，然后取平均值。注明 EMV 仅具有方向性参考意义，并非绝对值。([模板](references/roi-templates.md#step-3--earned-media-value-emv))

4. **计算成本效益指标** — CPM、CPR、CPE、CPV、CPC、CPA 和 CAC。仅与已声明且注明来源日期，并在市场、时间窗口和归因基础方面具有可比性的目标进行比较；否则，以描述性方式报告该指标，并将比较标记为待完成。([模板](references/roi-templates.md#step-4--cost-efficiency-analysis))

5. **应用归因模型** — 运行首次触点、末次触点、线性、时间衰减和基于位置的归因模型；推荐符合客户旅程的模型。([模板](references/roi-templates.md#step-5--attribution-analysis))

6. **计算客户终身价值影响** — 基于 LTV 的 ROI =（新客户数 × 平均 LTV − 投资）/ 投资；预测短期与长期影响，并将客户质量与自然渠道/付费渠道进行比较。([模板](references/roi-templates.md#step-6--lifetime-value-analysis))

7. **按影响者计算 ROI** — 对每位影响者的 ROI/ROAS 进行排名，分析投资效率，并按层级（宏型/微型/纳米型）计算 ROI。([模板](references/roi-templates.md#step-7--influencer-level-roi))

8. **生成 ROI 报告摘要** — 包括投资、回报、按方法划分的 ROI、关键指标与基准的对比、最终结论以及 1–3 条建议。([模板](references/roi-templates.md#step-8--roi-summary-report))

9. **生成供门控使用的实测回报 (R) 证据**

   步骤 1–8 的财务输出是该活动用于 STAR 的**实测回报 (R) 证据**：根据已声明的目标读取 ROI/ROAS (`R1`)，并与替代渠道基线对照 (`R3`)；在标准化时间窗口内对 CPE/CPM/CPA 进行基准比较 (`R2`)；将 KPI 达成情况与预先登记的目标进行比较 (`R4`)；使用明确说明的方法和严谨程度对转化进行归因 (`R5`)；并在可衡量的情况下，将增量影响与基线分离 (`R6`)。实测回报仅存在于 `assessment_time: actual`；预测性读取不包含 `R1`–`R6`。将每个数字标记为实测 / 用户提供 / 计算所得 / 估算。

   将此回报证据交给 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 门控 — 它会将 R 纳入完整的实际 STAR 运行，并计算按画像加权的 **SQS**。此技能不会运行评分器，也不会输出综合评分。未经验证的转化会产生 `results-unverified`：将 `R1`/`R2`/`R5` 报告为低置信度，且不得声称存在可归因回报。这些财务数字会作为 R 证据使用；它们本身并不是 SQS。

对于多创作者营销活动，门控会分别评估每个创作者合作关系；各合作关系 SQS 值的预算加权平均值可用于概括该营销活动，但绝不能取代对各合作关系的单独诊断。此技能提供各合作关系的回报证据；它不会聚合或汇总综合评分。

10. **仅在获得许可后持久化** — 只有获得授权后，才能保存到 `memory/influencer/roi-calculator/`（或付费路径）；升级到热缓存需要另行请求授权。

## 示例

**用户**："Calculate ROI for our influencer campaign: $25K spend, $72K revenue, 2.1M reach"

**输出**：

```markdown
# ROI Calculation Summary

## Investment & Returns

| Item | Value |
|------|-------|
| Total Investment | $25,000 |
| Direct Revenue | $72,000 |
| Total Reach | 2,100,000 |

## ROI Results

### Direct ROI
- **Profit**: $47,000
- **ROI**: 188%
- **ROAS**: 2.88:1

For every $1 spent, you generated $2.88 in revenue.

### Earned Media Value
- **EMV** (directional scenario at a declared $8 CPM): $16,800
- **EMV Multiple**: 0.67x

### Cost Efficiency
- **CPM**: $11.90
- **CPA**: Unknown (conversion count was not supplied)

## Assessment: Profitable on the supplied direct-revenue basis

Direct revenue exceeds the supplied investment, but no source-dated peer target or incrementality evidence was provided. Do not infer benchmark outperformance or authorize a scale decision from this read alone; obtain verified conversions, attribution evidence, and the campaign owner's precommitted decision rule first.
```

带来源和日期的基准证据模板位于 [references/roi-templates.md#benchmark-evidence-template](references/roi-templates.md#benchmark-evidence-template)。

## 参考资料

- [references/roi-templates.md](references/roi-templates.md) — 包含每个“说明”步骤的填写模板、完整示例和基准证据输入。
- [measurement-protocol.md](../../../references/measurement-protocol.md) — 在回读窗口内，根据相对于对照组的差异解读 ROI 和回报（R）；不要夸大归因。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和“交接摘要”格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费且无需密钥的数据获取方案。
- STAR 评分：[star-benchmark.md](../../../references/star-benchmark.md) — 此技能的证据所支持的回报（R）维度，以及门控所计算的按画像加权的 SQS。
- [performance-analyzer](../performance-analyzer/SKILL.md) — 提供此技能所使用的结果数据。
- [report-generator](../report-generator/SKILL.md) — 将这些数字整合到完整报告中。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 使用 ROI 输出重新分配支出。
- [campaign-planner](../../target/campaign-planner/SKILL.md) — 设定用于核对这些结果的 ROI 目标。

## 下一最佳技能

**主要选择**：[report-generator](../report-generator/SKILL.md) — 将 ROI 数据转化为面向利益相关者的报告。

**备选选择**（同属 Report 系列）：

- [performance-analyzer](../performance-analyzer/SKILL.md) — 如果 ROI 计算暴露出缺口，则返回进行更深入的绩效细分分析。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 将按影响者和按层级计算的 ROI 输入下一轮预算分配。

终止说明：维护一个本次会话中已调用技能的访问集合。如果主要的下一技能已运行过，则停止并报告该链已完成，而不是再次调用它。单条链最多执行 3 跳。