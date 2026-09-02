---
name: budget-optimizer
slug: budget-optimizer
displayName: "Budget Optimizer · 预算优化"
summary: "跨创作者与层级的预算分配:目标导向的花费拆分与情景对比"
description: 'Use when the user asks to "allocate my influencer budget", "optimize spend across tiers", or "compare budget scenarios"; produces a tier/platform/content allocation table, ROI and CPM/CPE projections, scenario comparisons, and mid-campaign reallocation moves. Not for building the full campaign plan — use campaign-planner. 达人预算分配/投放预算优化'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning budget allocation for a new influencer campaign, splitting spend across nano/micro/macro tiers or platforms, estimating influencer costs and projecting ROI, modeling conservative vs aggressive scenarios, justifying a budget request, or reallocating budget mid-campaign based on performance."
argument-hint: "<total budget> [platforms] [campaign goal]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 预算优化器

此技能帮助你分配和优化网红营销预算，以最大化投资回报。它会考虑平台成本、网红层级经济性和营销活动目标，从而建议最优的预算分配。

## 快速开始

最简调用：

```
Help me allocate a $30,000 budget for an influencer campaign on Instagram and TikTok
```

常见场景：

```
Optimize my influencer budget across micro and macro influencers for a Gen Z product launch — compare a $50K and a $100K scenario
```

输出：层级/平台/内容分配表、预计覆盖人数 + CPM/CPE、2-3 个预算方案，以及推荐的分配比例。

## 技能契约

- **读取**：总预算、固定支出与可用于网红的预算拆分、营销活动目标、目标平台、层级约束（每位网红的最高费用、最少人数）、行业，以及——对于营销活动进行中的工作——截至目前的支出和每位网红的结果。连接器数据（如果可用）通过 `~~influencer database` / `~~social platform analytics` 获取。
- **写入**：默认以内联方式返回预算分配建议和交接信息；只有获得明确的 WARM-save 授权后，才保存到 `memory/influencer/budget-optimizer/YYYY-MM-DD-<topic>.md`（或声明的付费路径）。
- **提升**：只有获得单独的明确授权后，才将已批准的总预算、选定的方案、锁定的层级组合和支出约束提升到 `memory/hot-cache.md`。
- **完成条件**：
  1. 分配总和达到所述预算的 100%；任何应急金额都必须遵循用户规则或带有来源日期的规划锚点，而不是仓库默认值。
  2. 每个预计指标都包含其公式、输入引用、证据时间窗口，以及 Measured / User-provided / Estimated 标签。
  3. 明确指定一个推荐方案并说明理由，或者将数值方案保留为 `NEEDS_INPUT`，并提供准确的证据请求计划。
- **主要后续技能**：使用下面按就绪状态门控的 `Next Best Skill` 区块；预算交接不会授权开展触达或发送。

### 交接摘要

> 按照 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中的标准结构输出。

## 跨学科：广告支出分配

此技能也会分配**付费广告**支出——层级/平台表映射到渠道/营销活动；使用 ROAS 配置文件（`direct-response|prospecting|incremental-profit`）作为方案轴，并读取其中声明的 CPA/回收期/贡献约束，而不是替换为 CPM/CPE。范围：此处仅计算支出重新分配**计划**。它不会读取进行中的投放节奏或发出扩大/缩减操作——实时投放节奏读取（投放节奏与计划的对比、对学习阶段的遵守）属于 [budget-pacing-monitor](../../../ad/scale/budget-pacing-monitor/SKILL.md)，出价策略选择属于 [bid-strategy-planner](../../../ad/orchestrate/bid-strategy-planner/SKILL.md)。[paid-measurement-loop](../../../ad/scale/paid-measurement-loop/SKILL.md) 会将一个已发布的变更与对照组进行回读，而过早扩量是 [ad-account-auditor](../../../ad/activate/ad-account-auditor/SKILL.md) 中的 **S 防护栏标记**，并非独立技能，也不是否决权。在 `memory/ad/budget-optimizer/` 下保存付费投放运行记录。

## 数据来源

此类别没有必需的实时集成，但数值费率、乘数、触达、互动、收入和回报预测需要兼容的锚点：用户提供的报价或假设、标注来源日期的市场证据，或可比较的第一方历史数据。若仅有总预算、平台和目标，则返回分配框架，以及所需的确切费率卡/预测查询，并将状态设为 `NEEDS_INPUT`；不得虚构存储库费率表或乘数。

存在时可提升估算准确度的可选连接器：

- `~~influencer database` — 使用真实费率卡，而非基准范围。
- `~~social platform analytics` — 使用实际触达、CPM 和互动数据替代估算预测。
- `~~CRM` — 使用过往营销活动支出和转化数据进行 ROI 校准。

按**字段逐一**分类证据，而非按连接器来源分类。仅当连接器值是该确切指标、实体和营销活动窗口的观测结果时，才将其标记为 **Measured**（记录来源及截至日期/窗口）；将用户陈述的数值标记为 **User-provided**；并将基准、预测、推断值和建模得出的下游预测标记为 **Estimated**。连接器支持的输入绝不会将整行数据，或由假设推导出的预测，升级为 Measured。有关无密钥数据配方，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

当用户请求预算优化时，请执行以下步骤。每个步骤的填充模板和场景区块均位于 [references/templates.md](references/templates.md) — 复制匹配的章节并填充内容。

1. **收集预算参数** — 营销活动目标、受众、时间线、总预算、固定费用与可用于网红的预算拆分、平台优先级和约束条件（每位网红的最高金额、最低人数）。信息采集模板：[§步骤 1](references/templates.md#step-1--budget-parameters-intake-template)。
2. **评估成本证据** — 盘点标注来源日期、且与市场/平台/层级/交付物/权利兼容的报价或第一方历史数据。没有兼容来源和日期的费率或乘数应保持为 `NEEDS_INPUT`；绝不提供内置默认值。模板：[§步骤 2](references/templates.md#step-2--cost-evidence)。
3. **创建分配方案** — 按层级、平台、内容类型和其他项目（赠品、扩量投放、工具、预留金）拆分；总和为 100%。仅当用户或带日期的规划来源提供了规则时，才使用预留金。模板：[§步骤 3](references/templates.md#step-3--budget-allocation-recommendation)。
4. **预测回报** — 记录每个公式及其输入引用。将 EMV 保持为独立的媒体等价情景；绝不将其计入归因收入，也不得将其视为现金回报。将 `ROAS = attributed revenue / spend` 报告为 `x:1`；将算术 ROI 报告为 `(attributed revenue - spend) / spend × 100%`；在没有所需证据的情况下，不得声称盈利性或增量性。模板：[§步骤 4](references/templates.md#step-4--return-projections)。
5. **建立情景模型** — 仅比较由已声明输入支持的情景；否则，返回具名情景框架和缺失输入计划。模板：[§步骤 5](references/templates.md#step-5--budget-scenarios)。
6. **优化策略** — 将节省、集中投放和扩量投放阈值标记为用户规则或标注来源日期的假设。不得将无来源依据的百分比表述为标准。详见：[§步骤 6](references/templates.md#step-6--optimization-strategies)。
7. **营销活动期间再分配** — 要求具备可比较的观测结果，以及预先登记的回读窗口和决策规则。若缺少这些条件，建议 `KEEP_TESTING` 或 `NEEDS_INPUT`；任何建议在变更支出前都需要单独的行动授权。仅以 `creator_ref` 的形式持久化和交接创作者。模板：[§步骤 7](references/templates.md#step-7--mid-campaign-reallocation)。

在线返回结果。提供 `memory/influencer/budget-optimizer/YYYY-MM-DD-<topic>.md`（付费广告运行则提供 `memory/ad/budget-optimizer/`），以获得精确的 WARM 保存授权，并在将已批准的总额、选定的方案或锁定的层级组合提升至 `memory/hot-cache.md` 之前，另行请求授权。

## 示例

**用户**：“为一个护肤产品发布活动优化 $30,000 的预算，平台为 Instagram 和 TikTok，目标人群为 Z 世代”

**输出**：

```markdown
## Budget Allocation: $30,000 Skincare Launch

**Status**: NEEDS_INPUT

The budget, platforms, audience, and goal are User-provided. No compatible creator quotes, deliverable/rights scope, contingency rule, reach/engagement history, conversion rate, AOV, or attribution basis was supplied, so no creator count, platform split, CPM, revenue, ROAS, ROI, or EMV is fabricated.

### Evidence request

| Needed input | Exact request |
|--------------|---------------|
| Cost basis | Dated creator quotes or first-party rates for the target market, platform, tier, deliverable, usage-rights term, exclusivity, and currency |
| Forecast basis | Comparable reach/engagement observations with source refs and windows |
| Return basis | Approved conversion rate, AOV, attribution window/method, and whether revenue is gross or net |
| Planning rules | User-approved platform/tier constraints, amplification amount, and contingency rule |

Until these arrive, provide only a 100%-summing allocation worksheet with `TBD` cells and no recommended numerical scenario.
```

## 参考资料

- 模板、成本基准、方案 A/B/C 模块、优化技巧及第二个示例：[references/templates.md](references/templates.md)
- 共享契约：[skill-contract.md](../../../references/skill-contract.md)
- 共享状态模型：[state-model.md](../../../references/state-model.md)
- 连接器配方：[CONNECTORS.md](../../../CONNECTORS.md)
- 兄弟技能：
  - [campaign-planner](../campaign-planner/SKILL.md) — 该预算所支持的活动计划
  - [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 在预算范围内寻找影响者
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) — 将分配结果转化为外联行动
  - [roi-calculator](../../report/roi-calculator/SKILL.md) — 计算活动结束后的实际 ROI
  - [performance-analyzer](../../report/performance-analyzer/SKILL.md) — 为重新分配决策提供依据

## 下一项最佳技能

**主要技能**：[campaign-planner](../campaign-planner/SKILL.md) — 当不存在已批准且可执行的活动计划时，在执行前锁定目标、交付物、权利、衡量方式和决策规则。

**备选技能**（同一影响者系列）：

- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 当已存在已批准的计划，但尚无有来源的候选名单时；继续完成 discovery 文档化的 typed-Fit 交接流程，然后才能将任何影响者视为已选定。
- [outreach-manager](../../activate/outreach-manager/SKILL.md) — 仅当活动计划已获批准、影响者已在完成 Fit 后选定，且联系/同意/渠道就绪状态已有记录时使用。该交接为外联做准备，但不授权发送。

**终止**：维护一个 visited-set。如果推荐的下一个 skill 已经在本次会话的调用链中执行过，则停止并报告 chain-complete，而不是再次调用。默认 `max-depth: 3`。当路由存在歧义时，列出选项并停止，而不是自动继续执行。