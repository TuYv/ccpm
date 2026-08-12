---
name: budget-optimizer
slug: budget-optimizer
displayName: "Budget Optimizer · 预算优化"
summary: "跨创作者与层级的预算分配:目标导向的花费拆分与情景对比"
description: 'Use when the user asks to "allocate my influencer budget", "optimize spend across tiers", or "compare budget scenarios"; produces a tier/platform/content allocation table, ROI and CPM/CPE projections, scenario comparisons, and mid-campaign reallocation moves. Not for building the full campaign plan — use campaign-planner. 达人预算分配/投放预算优化'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning budget allocation for a new influencer campaign, splitting spend across nano/micro/macro tiers or platforms, estimating influencer costs and projecting ROI, modeling conservative vs aggressive scenarios, justifying a budget request, or reallocating budget mid-campaign based on performance."
argument-hint: "<total budget> [platforms] [campaign goal]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 预算优化器

此技能可帮助你分配并优化网红营销预算，以实现投资回报最大化。它会综合考虑平台成本、不同网红层级的经济效益以及营销活动目标，从而推荐最优的预算分配方案。

## 快速开始

最简调用方式：

```
Help me allocate a $30,000 budget for an influencer campaign on Instagram and TikTok
```

常见场景：

```
Optimize my influencer budget across micro and macro influencers for a Gen Z product launch — compare a $50K and a $100K scenario
```

输出：网红层级/平台/内容分配表、预计触达人数 + CPM/CPE、2-3 个预算方案，以及推荐的分配比例。

## 技能契约

- **读取**：总预算、固定预算与可用于网红的预算比例、营销活动目标、目标平台、层级限制（每位网红的最高预算、最低人数）、行业，以及对于营销活动进行期间的优化工作，还包括迄今为止的支出和每位网红的表现。可用时，通过 `~~influencer database` / `~~social platform analytics` 获取连接器数据。
- **写入**：预算分配建议（网红层级 / 平台 / 内容表格）、ROI 和成本效益预测、方案对比、优化策略，以及交接摘要。保存路径：`memory/influencer/budget-optimizer/YYYY-MM-DD-<topic>.md`。
- **提升**：已批准的总预算、选定的方案、锁定的网红层级组合以及任何支出限制——将持久性事实提升至 `memory/hot-cache.md`。
- **完成条件**：
  1. 各项分配之和为所述预算的 100%，并包含应急预算项。
  2. 每项预测指标均标记为实测 / 用户提供 / 估算。
  3. 明确指定一个推荐方案并说明其理由。
- **主要后续技能**：[外联管理器](../../activate/outreach-manager/SKILL.md)——将已获得预算支持的分配方案转化为网红外联行动。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 跨领域：广告支出分配

此技能还可分配**付费广告**支出——网红层级/平台表格对应渠道/营销活动；使用 ROAS 配置文件（`direct-response|prospecting|incremental-profit`）作为方案维度，并读取其中声明的 CPA/回本周期/贡献约束，而不是用 CPM/CPE 替代。范围：此技能仅计算支出重新分配**计划**。它**不会**读取进行中的预算消耗进度，也不会发出扩大/缩减投放的操作指令——实时预算消耗进度读取（实际进度与计划对比、遵循学习阶段）属于[预算消耗进度监控器](../../../ad/scale/budget-pacing-monitor/SKILL.md)，而出价策略的选择属于[出价策略规划器](../../../ad/orchestrate/bid-strategy-planner/SKILL.md)。[付费广告衡量闭环](../../../ad/scale/paid-measurement-loop/SKILL.md)会将一项已实施的变更与对照组进行回溯比较，而过早扩大投放是[广告账户审计器](../../../ad/activate/ad-account-auditor/SKILL.md)中的一个 **S 级护栏标志**，并非独立技能或否决条件。将付费广告运行结果保存在 `memory/ad/budget-optimizer/` 下。

## 数据源

此技能系列不要求任何实时集成（第 1 层级）。仅使用你提供的数据即可运行——向它提供总预算、目标平台和营销活动目标，它就会根据下方内置的成本基准进行计算。

存在以下可选连接器时，可提高估算的准确性：

- `~~influencer database` — 使用真实报价单，而非基准范围。
- `~~social platform analytics` — 使用实际触达人数、CPM 和互动数据替代估算预测。
- `~~CRM` — 使用过往营销活动支出和转化数据校准 ROI。

将任何来源于连接器的数字标记为“实测”；将来源于基准的数字标记为“估算”；将用户陈述的数字标记为“用户提供”。有关无密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

当用户请求预算优化时，请按照以下步骤操作。每个步骤的填写模板、基准表和场景模块均位于 [references/templates.md](references/templates.md) 中——复制对应章节并填写内容。

1. **收集预算参数** — 营销活动目标、受众、时间范围、总预算、固定预算与可用于影响者的预算比例、平台优先级以及限制条件（每位影响者的最高预算、最低人数）。信息收集模板：[§Step 1](references/templates.md#step-1--budget-parameters-intake-template)。
2. **分析成本基准** — 应用按层级/平台划分的报价表（Instagram、TikTok、YouTube）以及行业成本乘数。表格：[§Step 2](references/templates.md#step-2--cost-benchmarks)。
3. **制定预算分配方案** — 按层级、平台、内容类型和其他项目（赠品、推广、工具、应急预算）进行分配；总和必须达到 100%，其中应急预算应占 5-10%。模板：[§Step 3](references/templates.md#step-3--budget-allocation-recommendation)。
4. **预测 ROI** — 预期触达人数/展示次数/互动次数/EMV、成本效率（CPM/CPE/CPV/CPC 与行业平均水平的对比），以及在相关情况下从转化漏斗推算 ROAS。将每项指标标记为“实测”/“用户提供”/“估算”。模板：[§Step 4](references/templates.md#step-4--roi-projections)。
5. **构建场景模型** — 并列展示保守/推荐/激进场景，然后明确推荐其中一个场景并说明理由。A/B/C 模块：[§Step 5](references/templates.md#step-5--budget-scenarios)。
6. **优化策略** — 降低成本的杠杆、最大化价值的措施，以及预算危险信号（例如，将超过 40% 的预算用于单个影响者）。详情：[§Step 6](references/templates.md#step-6--optimization-strategies)。
7. **营销活动中期重新分配预算**（当用户提供截至目前的支出和每位影响者的成效时）— 对比实际情况与计划、识别表现最佳/欠佳者，并将预算从表现欠佳者转移到表现优秀者。模板：[§Step 7](references/templates.md#step-7--mid-campaign-reallocation)。

将本次运行结果保存至 `memory/influencer/budget-optimizer/YYYY-MM-DD-<topic>.md`（付费广告运行结果保存至 `memory/ad/budget-optimizer/`）；将已批准的总预算、选定的场景和已锁定的层级组合提升至 `memory/hot-cache.md`。

## 示例

**用户**：“为一款面向 Z 世代、在 Instagram 和 TikTok 上发布的护肤产品优化 30,000 美元的预算”

**输出**：

```markdown
## Budget Allocation: $30,000 Skincare Launch

### Recommended Distribution

| Category | Allocation | Notes |
|----------|------------|-------|
| TikTok Influencers | $15,000 (50%) | Primary for Gen Z |
| Instagram Influencers | $9,000 (30%) | Credibility + visual |
| Content Amplification | $4,500 (15%) | Boost top performers |
| Contingency | $1,500 (5%) | Flexibility |

### Influencer Mix

| Platform | Tier | # | Cost Each | Total | Content |
|----------|------|---|-----------|-------|---------|
| TikTok | Micro (50-100K) | 5 | $1,500 | $7,500 | 5 videos |
| TikTok | Nano (10-50K) | 15 | $500 | $7,500 | 15 videos |
| Instagram | Micro (50-100K) | 3 | $2,000 | $6,000 | 3 Reels + Stories |
| Instagram | Nano (10-50K) | 6 | $500 | $3,000 | 6 posts |

**Total Influencers**: 29
**Total Content Pieces**: 29+ (excluding stories)

### Projected Results

- Reach: 2.8M - 3.5M (Estimated)
- Engagements: 280K - 400K (Estimated)
- CPM: $8.50 - $10.70 (Estimated)
- Projected ROI: 3.5:1 (Estimated)

This allocation prioritizes TikTok for viral potential while using Instagram for credibility and detailed product showcase.
```

## 参考资料

- 模板、成本基准、情景 A/B/C 区块、优化提示及第二个示例：[references/templates.md](references/templates.md)
- 共享契约：[skill-contract.md](../../../references/skill-contract.md)
- 共享状态模型：[state-model.md](../../../references/state-model.md)
- 连接器配方：[CONNECTORS.md](../../../CONNECTORS.md)
- 同级技能：
  - [campaign-planner](../campaign-planner/SKILL.md) — 规划由此预算提供资金支持的营销活动
  - [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 寻找符合预算范围的网红
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) — 将预算分配转化为外联行动
  - [roi-calculator](../../report/roi-calculator/SKILL.md) — 计算营销活动结束后的实际投资回报率
  - [performance-analyzer](../../report/performance-analyzer/SKILL.md) — 为重新分配决策提供依据

## 下一最佳技能

**首选**：[outreach-manager](../../activate/outreach-manager/SKILL.md) — 预算到位且层级组合确定后，着手招募由该预算支付费用的网红。

**备选**（同属网红技能系列）：

- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 如果需要先寻找符合各层级单个网红预算的候选人。
- [campaign-planner](../campaign-planner/SKILL.md) — 如果预算揭示了底层营销活动计划中的缺口。

**终止条件**：维护一个已访问集合。如果推荐的下一技能已在本次会话的调用链中调用过，则停止并报告调用链已完成，而不是再次调用。默认 `max-depth: 3`。当路由存在歧义时，列出选项并停止，而不是自动继续。