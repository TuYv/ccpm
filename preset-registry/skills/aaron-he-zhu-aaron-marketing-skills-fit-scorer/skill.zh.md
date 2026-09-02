---
name: fit-scorer
slug: fit-scorer
displayName: "Fit Scorer · 红人适配评分"
summary: "用 typed STAR 适配度(S) 维度评估创作者，并将活动商业适配度作为独立矩阵排序"
description: 'Use when the user asks to "score this influencer", "rank these creators for our campaign", or "tell me which influencer is the best fit"; produces the typed STAR Suitability (S) read plus a separately labeled campaign-fit ranking without mixing campaign-specific commercial fit into the Suitability read. Not for finding new influencers — use influencer-discovery; not for sending outreach — use outreach-manager. 达人适配度评分/创作者筛选排名'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a user has a shortlist of influencers and needs an objective, weighted score to prioritize outreach, choose between candidates, justify a selection to stakeholders, set consistent evaluation standards, compare creators across niches or platforms, or build long-term partner tiers. Activates on requests like score @handle for our brand, compare and rank these creators, or which of these is the best fit."
argument-hint: "<brand or campaign> <influencer handle(s)> [campaign goal: awareness|engagement|conversion]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# Fit Scorer

为每位入围创作者评分其类型化 STAR **适配性（S）** 维度，然后将特定交易的商业匹配保留在单独的优先级矩阵中。适配性包括独立于任何单笔交易的 `STAR-S8` 品牌/品类以及受众-品牌证据；交易条款、可用性和活动统筹均不纳入其中。商业矩阵不是适配性评分，也绝不进入 SQS。

## Quick Start

为一位影响者评分：

```
Score @[handle] for [brand/campaign] and tell me if they're a good fit
```

比较并排列入围名单：

```
Compare and rank these influencers for [campaign]: @influencer1, @influencer2, @influencer3
```

## Skill Contract

- **读取**：品牌/活动背景、目标受众定义、活动目标，以及包含稳定不透明 `creator_ref` 的入围名单条目；这些条目还必须包含临时句柄/个人资料 URL，或可解析的不透明句柄引用（由用户提供或从 `influencer-discovery` 传递而来）。可选读取 `memory/influencer/audience-mapper/` 中此前的受众画像、`memory/influencer/competitor-tracker/` 中竞争对手合作伙伴基准，以及用户提供或授权传递的 WARM Campaign Retro Card 的 `evidence_refs` 和 `next_campaign_hypothesis`。对于名册中的创作者，读取 `memory/creators/<aggregate-id>.md` 中的合作历史和受众统计来源——即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录——作为合作潜力输入。
- **写入**：默认以内联方式返回类型化的适配性（S）评估以及单独标注的商业匹配比较；提供 Retro Card 时，将其假设保留为单独标注的下一周期测试约束，不影响评分或结论。只有在获得精确的 WARM 保存授权后，才将报告保存到 `memory/influencer/fit-scorer/YYYY-MM-DD-<topic>.md`。保存的报告和交接内容保留稳定不透明的 `creator_ref` 和不透明的证据引用，绝不在 `creator_ref` 中保存原始句柄、姓名、个人资料 URL、电子邮件、提供商 ID 或确定性哈希值。
- **提升**：只有获得单独且精确的授权后，才可将有证据支持的首选项及其精确的适配性（S）评估和目录版本提升到 `memory/hot-cache.md`；绝不将未经评分/临时性的结果或 Retro Card 的定性决策/假设提升为已评分事实。
- **完成条件**：
  - 每位创作者的全部 10 个适配性项目 `S1`–`S10` 均明确标记为 Pass/Partial/Fail/Unknown/N/A，并附有带日期的证据或缺口原因。
  - 每位创作者的稳定不透明 `creator_ref` 均从发现/名册中保留，或为该谱系生成一次；原始身份定位信息保持临时性。
  - 类型化的目标/背景和适配性项目状态均得到保留，以供门禁使用；Unknown 会阻止形成适配性评估。
  - 任何商业匹配排名都必须与适配性评估清晰分开，且不能推翻否决项或证据缺失。
  - 如果提供了 Retro Card，其 `next_campaign_hypothesis` 只能作为可证伪的测试约束/商业矩阵背景而显示；其 `evidence_refs` 是用于开展新调查的指针，不是 STAR 项目证据，也不是自动选择规则。
- **主要后续技能**：[campaign-planner](../../target/campaign-planner/SKILL.md) —— 将排名后的入围名单转化为获批准的活动计划。如果该计划已经获批并准备好开展外联，则改为交接给 [outreach-manager](../../activate/outreach-manager/SKILL.md)；竞争对手基准分析为可选项。

### 交接摘要

> Emit the standard shape from [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md).

## 数据源

此系列无需实时集成（Tier 1）。Fit Scorer 通过要求用户提供评分所需的输入即可端到端运行，包括临时句柄或个人资料定位符、受众目标、品牌价值观以及他们拥有的任何指标。连接器可以提高数字的准确性，但不是必需的。

- `~~influencer database` — 粉丝数量、受众人口统计信息和合作历史。
- `~~social platform analytics` — 互动率、评论质量样本、发帖频率、增长趋势。
- `~~audience intelligence` — 真实粉丝与机器人粉丝的估算值，以及受众与目标受众的重叠程度。
- **Roster record (keyless Tier 1)** — 过往联系、回复信誉和交付历史来自创作者已加入名册时的 `memory/creators/<aggregate-id>.md`（由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 维护）；当不存在名册记录时，`~~CRM` 是针对相同历史信息的可选 Tier-2 增强器。

**Measured YouTube inputs (free key)**：对于 YouTube 候选者，`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" videos @handle --limit 10` 可直接提供互动真实性输入，即针对显示的订阅者基数统计每个视频的观看次数、点赞数和评论数（观看次数与订阅数的一致性、评论率、发帖频率），因此这些子评分使用的是 **Measured** 数值，而不是截图。免费提供 `YOUTUBE_API_KEY`；仅用于入围名单审查（ToS 拒绝批量采集配额）。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

在零集成的情况下，要求用户提供评分表所要求的每个值；该框架和权重仍可产生有依据的排名。有关每个类别的免费/无密钥方案，请参见 [CONNECTORS.md](../../../CONNECTORS.md)。

## 指令

符合契约的复制布局位于 [references/scoring-templates.md](references/scoring-templates.md)：对于 Suitability 评估，使用仅包含 `creator_ref` 的类型化 `STAR-S1`–`STAR-S10` 证据表，然后根据需要使用可选的 `commercial_fit_score` 表提供单独的决策支持。绝不要将原始定位符复制到这些输出中。

1. **锁定身份和类型化上下文。** 重用 discovery 明确携带的不透明 `creator_ref`，或者仅在其句柄链接已验证时使用 creator-registry aggregate ID。如果用户只提供原始句柄/个人资料 URL，且不存在已验证的 aggregate，则生成一个随机的 `creator-<UUIDv4>`，并在本报告、任何获授权的保存操作以及下游交接中保持不变。绝不要将 `creator_ref` 设置为原始句柄、姓名、URL、电子邮件、provider ID 或其任一项的确定性哈希；对于证据获取，将这些定位符保留为临时信息。只能通过其附带的获授权 artifact 或已验证的 registry 链接解析不透明 ref。如果两者都不可用，请请求临时定位符，并将身份保留为未解析状态，而不是猜测或合并。然后要求提供 creator `target` 和 target version、命名的 STAR profile/goal（`awareness|engagement|conversion|brand-building`）、`assessment_time: forecast|actual`、共享的 campaign `rollup_id`、观察日期、平台/层级/细分领域 cohort、证据窗口、material context object 以及当前 STAR `catalog_version`，即 gate 将复用的确切类型化身份。如果任何字段缺失，不要自行编造：返回 `NEEDS_INPUT`，指出缺失字段，并原样保留所提供的身份以便恢复。如果提供了 Campaign Retro Card，则将其 `evidence_refs` 和 `next_campaign_hypothesis` 记录在单独的、非评分的上一周期上下文块中；二者都不属于 STAR 类型化身份。
2. **冻结当前窗口的证据。** 使用当前的创作者分析数据、公开观察结果、名册历史和 cohort 基准，并记录来源/日期/类型/置信度。Retro Card 及其 `evidence_refs` 仅是 discovery 指针，绝不是 STAR 项目证据。如果被引用的主要来源已被独立重新获取且符合当前证据窗口，则引用该新鲜观察结果，而不是卡片。缺失或被拒绝的私有访问权限属于 Unknown，绝不能属于 Fail 或 Partial。
3. **仅评估 Suitability。** 根据 [star-benchmark.md](../../../references/star-benchmark.md) 评估 Suitability 项目 `S1`–`S10`（受众构成/真实性、粉丝增长完整性、触达可靠性、互动健康度和真实性、可信度，以及与交易无关的品牌/类别适配度）。交易特定的商业条款、可用性和编排冲突保留在单独的矩阵中；成本和实测活动转化属于 Return (R)，由 gate 在之后评分。
4. **为交接确认关键控制证据的资格。** `STAR-S2` 涵盖已证明的粉丝欺诈/真实粉丝率低于匹配的层级 × 平台 × 细分领域基准；`STAR-S6` 涵盖已证明的购买、协同或基于互推群的互动。品牌安全是 gate 的 Trust 控制项 `STAR-T3`，而不是 Suitability 项目。只有根据符合资格的证据才能将项目标记为 Fail，将其标记为潜在 gate 发现，并在该状态持续期间从运营上暂停触达。不要在此处称其为已验证的否决项，也不要应用 SQS 上限/业务判定；这些决策由 auditor 在汇总完整 STAR 运行结果时负责。
5. **为 gate 记录 Suitability 评估。** 在锁定的品牌/类别/cohort 上下文中，将每个 `S1`–`S10` 的状态准确记录为 Pass/Partial/Fail/Unknown/N/A，并附上来源/日期/窗口/类型/置信度，或明确的缺口/N/A 原因。该类型化表格，而不是任何 1–5 辅助评分，才是 Suitability 评估。[creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) gate 会将其纳入完整 STAR 运行，并为 profile-weighted SQS 运行确定性评分器；此 skill 不运行评分器，也不输出 SQS。Unknown 表示适用证据缺失，会阻止形成完整的 Suitability 评估；绝不要将 Unknown 弱化为 Partial，也不要手动计算综合值。
6. **在被请求时构建单独的商业矩阵。** 使用交易特定的受众/目标细微差异、内容概念、品牌冲突、商业条款、可用性和合作潜力。提供的 `next_campaign_hypothesis` 可以作为可证伪的测试约束出现在矩阵旁边，但不贡献任何分数，也不具有任何权重。为每个 1–5 组件及其汇总值标注 `commercial_fit_score`；绝不要将其中任何一个称为“Fit Score”或“Final Score”。它不是 Suitability 分数，不能清除 Suitability 控制项发现，也绝不会进入 SQS。
7. **透明地进行排名。** 分别展示类型化的 Suitability 评估、关键控制项、`commercial_fit_score`、证据置信度，以及与声明规则关联且包含负责人/重新运行条件的行动。不要输出通用 Verdict 或星级评分。默认路由至 `campaign-planner`；仅当已批准的 campaign plan 已准备好执行时，才路由至 `outreach-manager`。将竞争对手基准测试作为可选检查提供，而不是强制绕行步骤。不要将 Unknown 较多的候选者明确认定为更优，不要因为 Retro 假设提到某位创作者或某种策略而增减分数，也不要根据上一周期的 `renew | retest | retire | unknown` 决策自动选择候选者。
8. **仅在获得许可后持久化。** 仅在获得明确的 WARM 授权后保存报告；在进行任何 hot-cache 提升之前请求单独授权。持久化和交接 `creator_ref` 以及不透明的句柄/证据 refs，不要持久化临时的原始身份定位符。Retro 假设仍属于 WARM 工作上下文。此 skill 不会向 `creator-registry` 提议临时商业排名或非 gate 的 Suitability 结果。

## 紧凑示例

**用户**：“为我们的可持续时尚品牌（目标：转化）比较 @ecofashionista、@greenwardrobe、@sustainablesarah。”

**输出**：每位创作者都会复用上游不透明的 `creator_ref`，或在评分前接收一个随机的 `creator-<UUIDv4>`；原始账号名仅作为临时查询输入保留。随后，在同一个活动 `rollup_id` 下，每位创作者都会获得 `S1`–`S10` 项目状态；只有在适用范围完整覆盖时，才会生成适配性（S）读数，而独立的商业矩阵则解释活动特定的条款和可用性。如果提供了之前的 Retro Card，其中的假设只会作为下一周期测试约束，且权重为零；其来源会在当前窗口中重新观测。经验证低于基准的真实粉丝率会将 `STAR-S2` 标记为 Fail，并暂停联系；拒绝访问则保持为 Unknown，并阻止生成读数。只有 creator-content-auditor 可以在之后应用 STAR 业务判定/上限。持久化是可提供的选项，而非默认行为。

## 参考资料

- [references/scoring-templates.md](references/scoring-templates.md) — 类型化的适配性证据表，以及独立的 `commercial_fit_score` 组件/汇总、比较、自定义权重、演算示例和部分状态布局。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 每类连接器的免费/无需密钥数据方案。
- 评分标准：[star-benchmark.md](../../../references/star-benchmark.md) — STAR 框架、本技能读取的适配性（S）维度（包括 `STAR-S2`/`STAR-S6` 否决项），以及门禁计算的按画像加权 SQS。
- 关联技能：[influencer-discovery](../influencer-discovery/SKILL.md)、[competitor-tracker](../../target/competitor-tracker/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[outreach-manager](../../activate/outreach-manager/SKILL.md)。

## 下一项最佳技能

**主要路径**：[campaign-planner](../../target/campaign-planner/SKILL.md) — 将排名后的候选名单转化为活动计划、预算、时间线和审批路径。

**有条件的下一步**：
- [outreach-manager](../../activate/outreach-manager/SKILL.md) — 仅当已批准的活动计划已经定义了报价、预算、目标创作者、渠道和联系审批路径时使用；此交接不授权发送消息。

**可选检查和替代路径**：
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) — 当相关证据可能改变选择时，可选择将首选对象与竞争对手合作进行基准比较。
- [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) — 当完整的适配性读数或潜在的 `STAR-S2`/`STAR-S6`/`STAR-T3` 控制证据准备就绪时，停止并将其作为单独调用交给这一唯一的 STAR 门禁；不要自动运行或模拟其判定。
- [influencer-discovery](../influencer-discovery/SKILL.md) — 如果候选名单过于单薄而无法排名，则寻找更多候选人。
- [audience-mapper](../audience-mapper/SKILL.md) — 如果受众匹配分数不确定，先收紧目标受众定义。

**终止说明**：跟踪本次会话中已调用技能的访问集合。如果建议的下一个技能已经运行，则停止并报告链路已完成，而不是再次调用它。最多执行 3 跳（最大深度为 3）后停止，并返回内联结果以及任何单独获授权的保存路径。

## 相关技能

- [influencer-discovery](../influencer-discovery/SKILL.md) - 查找待评分的影响者
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 以竞争对手合作伙伴为基准进行比较
- [audience-mapper](../audience-mapper/SKILL.md) - 定义目标受众
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系评分最高的影响者