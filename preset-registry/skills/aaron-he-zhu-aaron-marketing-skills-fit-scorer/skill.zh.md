---
name: fit-scorer
slug: fit-scorer
displayName: "Fit Scorer · 红人适配评分"
summary: "用 typed STAR 适配度(S) 维度评估创作者，并将活动商业适配度作为独立矩阵排序"
description: 'Use when the user asks to "score this influencer", "rank these creators for our campaign", or "tell me which influencer is the best fit"; produces the typed STAR Suitability (S) read plus a separately labeled campaign-fit ranking without mixing campaign-specific commercial fit into the Suitability read. Not for finding new influencers — use influencer-discovery; not for sending outreach — use outreach-manager. 达人适配度评分/创作者筛选排名'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a user has a shortlist of influencers and needs an objective, weighted score to prioritize outreach, choose between candidates, justify a selection to stakeholders, set consistent evaluation standards, compare creators across niches or platforms, or build long-term partner tiers. Activates on requests like score @handle for our brand, compare and rank these creators, or which of these is the best fit."
argument-hint: "<brand or campaign> <influencer handle(s)> [campaign goal: awareness|engagement|conversion]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 契合度评分器

根据类型化 STAR **适配性（S）** 维度对入围的每位创作者进行评分，然后在单独的优先级矩阵中保留针对具体营销活动的商业契合度。适配性评估具有可移植性且与品牌无关；商业矩阵并非适配性评分，也绝不会计入 SQS。

## 快速开始

为一位影响者评分：

```
Score @[handle] for [brand/campaign] and tell me if they're a good fit
```

比较入围名单并进行排名：

```
Compare and rank these influencers for [campaign]: @influencer1, @influencer2, @influencer3
```

## 技能契约

- **读取**：品牌/营销活动背景、目标受众定义、营销活动目标，以及影响者账号入围名单（由用户提供或从 `influencer-discovery` 继承）。可选读取 `memory/influencer/audience-mapper/` 中已有的受众画像，以及 `memory/influencer/competitor-tracker/` 中的竞争对手合作伙伴基准。对于已纳入名册的创作者，从 `memory/creators/<handle-slug>.md`（即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录）读取合作历史和受众统计数据来源，将其作为合作潜力输入。
- **写入**：仅在明确授权的情况下，将包含类型化适配性（S）评估及单独标注的商业契合度比较的报告写入 `memory/influencer/fit-scorer/YYYY-MM-DD-<topic>.md`。
- **推送**：仅在另行授权的情况下，推送有证据支持的首选对象及其确切的适配性（S）评估和目录版本；绝不推送未经评分或暂定的结果。
- **完成条件**：
  - 每位创作者的全部 10 个适配性项目 `S1`–`S10` 均明确标记为 Pass/Partial/Fail/Unknown/N/A，并附有注明日期的证据或缺失原因。
  - 为门控保留类型化目标/背景和适配性项目状态；存在 Unknown 时无法得出适配性评估。
  - 任何商业契合度排名均与适配性评估明显分开，且不能推翻否决项或弥补证据缺失。
- **主要后续技能**：[competitor-tracker](../../target/competitor-tracker/SKILL.md) — 将评分最高的候选对象与竞争对手已合作的创作者进行基准比较。

### 交接摘要

> 输出 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中规定的标准格式。

## 数据源

此系列无需实时集成（Tier 1）。契合度评分器通过向用户询问其评分所需的输入（账号、目标受众、品牌价值观及用户掌握的任何指标），即可端到端运行。连接器可以提高数值的精确度，但并非必需。

- `~~influencer database` — 粉丝数量、受众人口统计特征和合作历史。
- `~~social platform analytics` — 互动率、评论质量样本、发布频率和增长趋势。
- `~~audience intelligence` — 真实粉丝与机器人粉丝的估算，以及受众与目标人群的重合度。
- **名册记录（无需密钥的 Tier 1）** — 当创作者已纳入名册时，过往联系、回复信誉和交付历史来自 `memory/creators/<handle-slug>.md`（由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 维护）；当不存在名册记录时，`~~CRM` 可作为可选的 Tier-2 增强数据源，为同类历史信息提供补充。

**实测的 YouTube 输入（免费密钥）**：对于 YouTube 候选人，`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" videos @handle --limit 10` 可直接提供互动真实性输入——基于展示的订阅者规模，获取每个视频的观看数/点赞数/评论数（观看数与订阅者数的一致性、评论率、发布频率）——因此这些子分数来自**实测**数据，而非截图。免费的 `YOUTUBE_API_KEY`；仅用于候选名单审核（服务条款不允许大批量采集配额）。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

在没有任何集成的情况下，请用户提供评分表所要求的每个值；该框架及其权重仍可生成有理有据的排名。有关各类别的免费/无密钥方案，请参见 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

商业比较布局位于 [references/scoring-templates.md](references/scoring-templates.md)。它们是可选的决策支持工具，并非 STAR 适用性量表。

1. **锁定类型化上下文。** 必须提供创作者 `target` 及目标版本、指定的 STAR 配置文件/目标（`awareness|engagement|conversion|brand-building`）、`assessment_time: forecast|actual`、共享的活动 `rollup_id`、观察日期、平台/层级/细分领域群组、证据窗口、实质性上下文对象，以及当前 STAR `catalog_version`——即关卡将复用的确切类型化身份标识。如有任何字段缺失，不得臆造：返回 `NEEDS_INPUT`，列出缺失字段，并原样保留已提供的身份标识，以便恢复执行。
2. **冻结证据。** 使用创作者分析数据、公开观察结果、名册历史记录和群组基准，并记录来源/日期/类型/置信度。缺失或被拒绝的私有访问权限属于 Unknown，绝不能标为 Fail 或 Partial。
3. **仅评估适用性。** 根据 [star-benchmark.md](../../../references/star-benchmark.md) 评估适用性项目 `S1`–`S10`（受众构成/真实性、粉丝增长完整性、触达可靠性、互动健康度与真实性、可信度，以及可迁移的品牌/品类契合度）。特定活动的商业条款和可用性保留在单独的矩阵中；成本和实测活动转化率归入回报（R），稍后由关卡评分。
4. **为交接确定关键控制证据是否合格。** `STAR-S2` 涵盖已证实的粉丝欺诈，或真实粉丝率低于匹配的层级 × 平台 × 细分领域基准；`STAR-S6` 涵盖已证实的购买式、协同式或互助群式互动。品牌安全属于关卡的信任控制项 `STAR-T3`，并非适用性项目。只有在存在合格证据时才将项目标为 Fail，将其标记为潜在的关卡发现，并在其有效期间暂停拓展工作。不要在此将其称为已验证的否决项，也不要应用 SQS 上限/业务结论；当完整 STAR 运行汇总时，这些决定由审计器负责。
5. **记录适用性判读结果以供关卡使用。** 将带有来源/日期/类型/置信度的 `S1`–`S10` 状态记录为可移植的适用性（S）判读结果。[creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 关卡会将该判读结果纳入完整 STAR 运行，并运行确定性评分器，以计算按配置文件加权的 SQS——此技能不运行评分器，也不输出 SQS。Unknown 表示缺少适用的证据，并会阻止形成适用性判读结果；绝不能将 Unknown 弱化为 Partial，也不能手动计算综合分数。
6. **在要求时构建单独的商业矩阵。** 使用受众与活动的契合度、内容风格、特定活动的品牌/品类契合度、商业条款、可用性和合作潜力。将其 1-5 总分标记为 `commercial_fit_score`；它不是适用性分数，不能消除适用性否决项，也绝不计入 SQS。
7. **透明排名。** 分别展示适用性（S）判读结果（或覆盖范围/区间）、关键控制项、商业契合度、证据置信度，以及包含负责人/重新运行条件的拓展建议。不要明确地将 Unknown 较多的候选人排在更优位置。
8. **仅在获得许可后持久化。** 只有在获得授权后才保存报告；在进行任何热缓存提升或创作者注册表提案之前，需另行请求授权。

## 简明示例

**用户**：“为我们的可持续时尚品牌比较 @ecofashionista、@greenwardrobe、@sustainablesarah（目标：转化）。”

**输出**：每位创作者都会在同一营销活动 `rollup_id` 下获得 `S1`–`S10` 项目状态；只有在所有适用项均得到完整覆盖时，才会生成适配性（S）判读，而单独的商业矩阵则用于说明特定于营销活动的条款和档期。经验证的真实粉丝率低于基准时，会将 `STAR-S2` 标记为失败并暂停联络；拒绝授权则保持为未知状态，并阻止生成判读。只有 creator-content-auditor 可以应用后续的 STAR 业务裁决/上限。系统会提供持久化选项，但不会默认已进行持久化。

## 参考资料

- [references/scoring-templates.md](references/scoring-templates.md) — 所有按维度划分的表格、最终分数汇总、比较报告、自定义权重矩阵、完整示例和技巧。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无密钥数据方案。
- 评分标准：[star-benchmark.md](../../../references/star-benchmark.md) — STAR 框架、本技能读取的适配性（S）维度（包括 `STAR-S2`/`STAR-S6` 否决项），以及关卡计算的按画像加权 SQS。
- 同级技能：[influencer-discovery](../influencer-discovery/SKILL.md)、[competitor-tracker](../../target/competitor-tracker/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[outreach-manager](../../activate/outreach-manager/SKILL.md)。

## 下一最佳技能

**首选**：[competitor-tracker](../../target/competitor-tracker/SKILL.md) — 在投入预算之前，将得分最高的候选人与竞争对手已经合作的创作者进行基准比较。

**备选**（同属侦察阶段）：
- [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) — 当完整的适配性判读或潜在的 `STAR-S2`/`STAR-S6`/`STAR-T3` 控制证据准备就绪时，停止并通过单独调用将其移交给这一唯一的 STAR 关卡；不要自动运行或模拟其裁决。
- [influencer-discovery](../influencer-discovery/SKILL.md) — 如果候选名单太少，无法进行排名，则寻找更多候选人。
- [audience-mapper](../audience-mapper/SKILL.md) — 如果受众匹配分数不确定，则先进一步明确目标受众定义。

**终止说明**：维护一个本次会话中已调用技能的访问集合。如果推荐的下一项技能已经运行，则停止并报告调用链已完成，而不是再次调用该技能。最多在 3 跳后停止（最大深度为 3），并将已保存的报告路径交还给用户。

## 相关技能

- [influencer-discovery](../influencer-discovery/SKILL.md) - 查找要评分的影响者
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 与竞争对手的合作伙伴进行基准比较
- [audience-mapper](../audience-mapper/SKILL.md) - 定义目标受众
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系得分最高的影响者