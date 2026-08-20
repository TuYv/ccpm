---
name: fit-scorer
slug: fit-scorer
displayName: "Fit Scorer · 红人适配评分"
summary: "用 typed STAR 适配度(S) 维度评估创作者，并将活动商业适配度作为独立矩阵排序"
description: 'Use when the user asks to "score this influencer", "rank these creators for our campaign", or "tell me which influencer is the best fit"; produces the typed STAR Suitability (S) read plus a separately labeled campaign-fit ranking without mixing campaign-specific commercial fit into the Suitability read. Not for finding new influencers — use influencer-discovery; not for sending outreach — use outreach-manager. 达人适配度评分/创作者筛选排名'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a user has a shortlist of influencers and needs an objective, weighted score to prioritize outreach, choose between candidates, justify a selection to stakeholders, set consistent evaluation standards, compare creators across niches or platforms, or build long-term partner tiers. Activates on requests like score @handle for our brand, compare and rank these creators, or which of these is the best fit."
argument-hint: "<brand or campaign> <influencer handle(s)> [campaign goal: awareness|engagement|conversion]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 适配度评分器

基于类型化 STAR 的 **适用性（S）** 维度对每位入围创作者进行评分，然后将特定于活动的商业适配度保留在单独的优先级矩阵中。适用性评估具有可移植性且与品牌无关；商业矩阵不是适用性评分，也绝不会计入 SQS。

## 快速开始

为一位影响者评分：

```
Score @[handle] for [brand/campaign] and tell me if they're a good fit
```

比较入围名单并排序：

```
Compare and rank these influencers for [campaign]: @influencer1, @influencer2, @influencer3
```

## 技能契约

- **读取**：品牌/活动背景、目标受众定义、活动目标，以及影响者账号入围名单（由用户提供或从 `influencer-discovery` 继承）。可选读取来自 `memory/influencer/audience-mapper/` 的既有受众画像，以及来自 `memory/influencer/competitor-tracker/` 的竞争对手合作伙伴基准。对于已纳入名册的创作者，从 `memory/creators/<handle-slug>.md`（即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录）读取合作历史和受众统计数据来源，作为合作潜力输入。
- **写入**：仅在获得明确授权后，写入一份包含类型化适用性（S）评估及单独标注的商业适配度比较的报告，路径为 `memory/influencer/fit-scorer/YYYY-MM-DD-<topic>.md`。
- **推广**：仅在另行获得授权后，推广有证据支持的首选对象及其确切的适用性（S）评估和目录版本；绝不推广未经评分或临时性的结果。
- **完成条件**：
  - 每位创作者的全部 10 个适用性项目 `S1`–`S10` 均明确标记为通过/部分通过/失败/未知/不适用，并附带注明日期的证据或说明信息缺口的原因。
  - 为门控保留类型化目标/背景和适用性项目状态；存在未知项时，无法得出适用性评估。
  - 任何商业适配度排名都必须与适用性评估明显分开，且不能推翻否决项或弥补证据缺失。
- **主要后续技能**：[competitor-tracker](../../target/competitor-tracker/SKILL.md) — 将评分最高的候选人与竞争对手已合作的创作者进行基准比较。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列无需实时集成（Tier 1）。适配度评分器通过向用户询问其评分所需的输入信息（账号、目标受众、品牌价值观以及用户掌握的任何指标），即可端到端运行。连接器能够提高数据精度，但并非必需。

- `~~influencer database` — 粉丝数量、受众人口统计数据和合作历史。
- `~~social platform analytics` — 互动率、评论质量样本、发布频率和增长趋势。
- `~~audience intelligence` — 真实粉丝与机器人粉丝比例估算，以及受众与你的目标群体之间的重合度。
- **名册记录（无需密钥的 Tier 1）** — 当创作者已纳入名册时，既往联系情况、回复信誉和交付历史来自 `memory/creators/<handle-slug>.md`（由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 维护）；当不存在名册记录时，`~~CRM` 可作为同类历史信息的可选 Tier-2 增强数据源。

**实测 YouTube 输入（免费密钥）**：对于 YouTube 候选创作者，`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" videos @handle --limit 10` 可直接提供互动真实性输入——以显示的订阅者基数为参照，提供每个视频的观看量/点赞数/评论数（观看量与订阅者数量的一致性、评论率、发布节奏）——因此这些子分数来自**实测**数字，而非截图。免费的 `YOUTUBE_API_KEY`；仅用于候选名单审核（服务条款不允许批量消耗配额进行采集）。请参阅 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

在零集成的情况下，请用户提供评分表所要求的每个值；该框架及其权重仍可生成有充分依据的排名。有关各类别的免费/无密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

商业比较布局位于 [references/scoring-templates.md](references/scoring-templates.md)。它们是可选的决策支持工具，而非 STAR 适用性评估量表。

1. **锁定类型化上下文。** 要求提供创作者 `target` 及目标版本、指定的 STAR 配置文件/目标（`awareness|engagement|conversion|brand-building`）、`assessment_time: forecast|actual`、共享的活动 `rollup_id`、观察日期、平台/层级/细分领域队列、证据窗口、重要上下文对象，以及当前 STAR `catalog_version`——这些正是门控将复用的类型化身份标识。若缺少任何字段，不得自行编造：返回 `NEEDS_INPUT`，列出缺失字段，并原样保留已提供的身份标识，以便恢复执行。
2. **冻结证据。** 使用创作者分析数据、公开观察结果、名册历史记录和队列基准，并记录来源/日期/类型/置信度。缺失或被拒绝的私有访问权限属于 Unknown，绝不能判为 Fail 或 Partial。
3. **仅评估适用性。** 根据 [star-benchmark.md](../../../references/star-benchmark.md) 评估适用性项目 `S1`–`S10`（受众构成/真实性、粉丝增长完整性、触达可靠性、互动健康度与真实性、可信度，以及可迁移的品牌/品类契合度）。活动特定的商业条款和档期仍保留在单独的矩阵中；成本和实测活动转化属于回报（R），稍后由门控进行评分。
4. **为交接确认关键控制项证据的有效性。** `STAR-S2` 涵盖已证实的粉丝欺诈，或真实粉丝率低于匹配的层级 × 平台 × 细分领域基准；`STAR-S6` 涵盖已证实的购买式、协同式或互动小组式互动。品牌安全属于门控的信任控制项 `STAR-T3`，而非适用性项目。仅在有符合要求的证据时才将某项目标记为 Fail，将其标注为潜在门控发现，并在其仍然成立期间暂停外联操作。此处不得将其称为已验证的否决项，也不得应用 SQS 上限/业务裁决；审计器在汇总完整 STAR 运行结果时负责作出这些决定。
5. **记录供门控使用的适用性判读。** 将带有来源/日期/类型/置信度的 `S1`–`S10` 状态记录为可移植的适用性（S）判读。[creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 门控会将该判读纳入完整 STAR 运行，并运行确定性评分器以得出按配置文件加权的 SQS——此技能不运行评分器，也不输出 SQS。Unknown 表示缺少适用证据，并会阻止形成适用性判读；绝不能将 Unknown 弱化为 Partial，也不得手动计算综合分数。
6. **在收到请求时构建单独的商业矩阵。** 使用受众与活动的契合度、内容风格、活动特定的品牌/品类契合度、商业条款、档期和合作潜力。将其 1-5 的总分标记为 `commercial_fit_score`；它不是适用性分数，无法解除适用性否决，也绝不计入 SQS。
7. **透明地进行排名。** 分别展示适用性（S）判读（或覆盖范围/区间）、关键控制项、商业契合度、证据置信度，以及包含负责人/重新运行条件的外联建议。不得将 Unknown 较多的候选创作者明确排名为更优。
8. **仅在获得许可后持久化。** 只有在获得授权后才能保存报告；在执行任何热缓存提升或提出创作者注册表变更建议之前，必须另行请求授权。

## 简明示例

**用户**：“为我们的可持续时尚品牌比较 @ecofashionista、@greenwardrobe、@sustainablesarah（目标：转化）。”

**输出**：在同一营销活动 `rollup_id` 下，每位创作者都会获得 `S1`–`S10` 项目状态；只有当所有适用项均完整覆盖时，才会生成适配性（S）评估结果，而单独的商业矩阵会说明特定于营销活动的条款和可合作情况。经验证，真实粉丝率低于基准会将 `STAR-S2` 标记为不通过并暂停外联；拒绝提供访问权限时，状态保持未知，且无法生成评估结果。只有 creator-content-auditor 可以在后续给出 STAR 业务裁决/上限。系统会询问是否持久化，而不会默认进行持久化。

## 参考资料

- [references/scoring-templates.md](references/scoring-templates.md) — 所有按维度划分的表格、最终分数汇总、比较报告、自定义权重矩阵、完整示例和提示。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无需密钥数据方案。
- 评分标准：[star-benchmark.md](../../../references/star-benchmark.md) — STAR 框架、本技能读取的适配性（S）维度（包括 `STAR-S2`/`STAR-S6` 否决项），以及此门控计算的基于画像加权的 SQS。
- 同级技能：[influencer-discovery](../influencer-discovery/SKILL.md)、[competitor-tracker](../../target/competitor-tracker/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[outreach-manager](../../activate/outreach-manager/SKILL.md)。

## 下一最佳技能

**首选**：[competitor-tracker](../../target/competitor-tracker/SKILL.md) — 在投入预算之前，将评分最高的人选与竞争对手已经合作的创作者进行基准比较。

**备选**（同一发掘阶段）：
- [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) — 当完整的适配性评估结果或潜在的 `STAR-S2`/`STAR-S6`/`STAR-T3` 控制证据准备就绪时，停止并通过单独调用将其移交给这个唯一的 STAR 门控；不要自动运行或模拟其裁决。
- [influencer-discovery](../influencer-discovery/SKILL.md) — 如果候选名单太少，无法进行排名，则寻找更多候选人。
- [audience-mapper](../audience-mapper/SKILL.md) — 如果受众匹配分数存在不确定性，则先进一步明确目标受众定义。

**终止说明**：跟踪本会话中已调用技能的访问集合。如果推荐的下一技能已经运行，则停止并报告技能链已完成，而不是再次调用。最多在 3 跳后停止（最大深度为 3），并将已保存报告的路径返回给用户。

## 相关技能

- [influencer-discovery](../influencer-discovery/SKILL.md) - 查找要评分的网红
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 与竞争对手的合作伙伴进行基准比较
- [audience-mapper](../audience-mapper/SKILL.md) - 定义目标受众
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系评分最高的网红