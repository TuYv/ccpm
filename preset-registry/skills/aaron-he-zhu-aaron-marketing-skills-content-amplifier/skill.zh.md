---
name: content-amplifier
slug: content-amplifier
displayName: "Content Amplifier · 内容放量"
summary: "把跑赢的创作者内容用付费放大，并将 UGC 复用到付费、网站、邮件与自然渠道"
description: 'Use when the user asks to "amplify influencer content with paid media", "set up whitelisting or Spark Ads", "decide which posts to boost", "repurpose influencer content", "turn one video into multiple ads", or "build a UGC asset library"; produces (paid mode) a content-selection scorecard, a paid amplification strategy (whitelisting/boosting/dark posts), audience targeting, and a budget+optimization plan, or (repurpose mode) a rights-tracked content inventory, a 1-video-to-10+-asset repurposing map, per-format transformation specs, and a 30-day distribution plan. Not for gating whether a deliverable is publishable or FTC-compliant — use creator-content-auditor; not for the always-on brand posting calendar — use social-calendar-builder; not for drafting a net-new idea into platform-native packages — use social-creative-builder. 复用达人内容 / 内容放量.'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a brand has a frozen, auditor-approved creator asset with active scoped rights and wants to extract more value from it. Paid mode: extend reach with paid spend — choosing which posts to boost, setting up whitelisted Partnership Ads or TikTok Spark Ads, planning dark posts, allocating an ad budget across creators and platforms, building audience targeting off creator lookalikes, running an optimization and scale/pause playbook. Repurpose mode: reuse one asset across paid, website, email, and organic social — generating ad variations from organic clips, building a searchable rights-tracked library, populating product pages with social proof, or planning a multi-channel rollout from a small source set."
argument-hint: "[--mode paid|repurpose] <campaign or content set> [budget] [platforms/channels]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 内容放大器

从已冻结且获批准的创作者资产中提取更多价值。提供两种模式：**付费**（通过付费投放扩大触达范围，包括白名单投放、Spark Ads、暗帖、预算与优化）和**再利用**（将一个资产复用于付费投放、网站、电子邮件和社交媒体，包括资产清单、再利用映射、格式规格和分发计划）。两种模式都从经过 [creator-content-auditor](../creator-content-auditor/SKILL.md) 审核通过的确切版本以及当前有效的限定范围内权利开始。Spark/boost 路径还需要其所依赖的平台状态和已发布的帖子；暗帖不必曾经以自然方式发布。

**范围限制**：此技能不会评估交付物的品牌一致性、信息准确性或 FTC/披露合规性，也不会计算 STAR Trust/Appeal 分数或运行 `STAR-T1`/`STAR-T2` 否决流程——这些属于 [creator-content-auditor](../creator-content-auditor/SKILL.md) 审核门的职责。此技能负责下游环节：将获批准的内容转化为付费触达或多渠道资产，然后进行交接。在产品发布中，此技能负责**再利用映射以及付费放大/分发执行日历**（包括发布内容的 30 天计划）；发布流程中的 [momentum-planner](../../../launch/prove/momentum-planner/SKILL.md) 仅安排发布的*关键时刻*，并将分发工作交由此技能处理。在常态化自然社交媒体运营中，分工结构相同：固定的品牌发布日历归 [social-calendar-builder](../../../social/craft/social-calendar-builder/SKILL.md) 负责，而全新创意到多平台内容包的起草归 [social-creative-builder](../../../social/craft/social-creative-builder/SKILL.md) 负责——此技能负责现有资产的再利用以及所有付费放大，社交媒体流程仅将值得加热视频量的自然内容优胜者标记后交给此技能。

## 模式选择器

| 模式 | 适用场景 | 核心输出 |
|------|----------|-------------|
| **paid**（默认） | 通过付费投放扩大自然创作者内容的触达范围 | 内容选择评分卡、放大策略（白名单投放 / boosting / 暗帖）、受众定向、预算分配、优化操作手册 |
| **repurpose** | 将一个获批准的资产复用于付费投放、网站、电子邮件和社交媒体 | 权利跟踪资产清单、1 个视频到 10+ 个内容的再利用映射、格式转换规格、30 天分发计划、内容库与权利跟踪器 |

使用 `--mode paid` 或 `--mode repurpose` 进行选择。如果未设置：出现“boost / amplify / whitelisting / Spark Ads / dark post / paid spend / budget” → **paid**；出现“repurpose / reuse / turn one video into many / asset library / social proof on pages / multi-channel rollout” → **repurpose**。如果请求同时涵盖两者（例如“剪辑广告变体*并且*规划付费投放”），先运行 **repurpose** 以生成资产，然后交给 **paid**——不要悄然合并；应说明运行的是哪个模式。

## 快速开始

最简调用方式：

```
Which frozen auditor-approved asset with current active paid rights should we amplify from [campaign]?  # paid
How can we repurpose this frozen approved asset within its evidenced active destination scope?           # repurpose
```

常见场景：

```
--mode paid: Create a $5,000 TikTok/Instagram plan from these frozen approved assets and supplied current active scoped-rights records
--mode repurpose: Build a 30-day plan from these 3 frozen approved videos and supplied current active rights records covering the requested destinations
```

输出要求——**paid**：对每个证据完整的候选项进行评分、分级，并分配支出，使总额达到预算，同时提供扩量/暂停操作手册。任何缺少自然表现证据或 Hook/Message/Quality/CTA 观察结果的候选项，都应保持为 `NOT_SCORED/NEEDS_INPUT`，不得有 `/25`、排名、等级或支出。**repurpose**：为每个源资产标记权利，至少将一个符合条件的资产映射到 2 个以上渠道中的 3 种以上格式，并提供带日期的分发计划。

## Skill Contract

- **读取**：
  - *paid* — 稳定的不透明 `creator_ref` 值及临时创作者定位信息、平台、内容类型、带日期的自然触达/互动/观看次数证据、单独的带日期 Hook/Message/Quality/CTA 观察结果、推广预算、活动目标（awareness/traffic/conversions）、目标平台、用户提供的任何历史表现数据，以及每个候选资产当前的权利状态/证据和现有投放位置（如有）。
  - *repurpose* — 源 UGC 资产（视频、reels、评价、图片）、稳定的不透明 `creator_ref` 值及临时创作者定位信息和平台、确切冻结的 `approved_asset_ref`、不透明的授权 `source_ref`、每项资产的使用权利、带观察时间/证据的权利状态、原始表现指标、目标渠道和现有投放位置。对源资产进行原子化处理时，粘贴的文字稿/字幕/评价文本是绑定到该三引用源身份的临时证据；原始 handle 或内容 URL 永远不会成为 `source_ref`。
  - 两种模式都会在 `memory-management` 处于 active 状态时，从 `memory/hot-cache.md` 获取此前的活动上下文。
- **写入**：默认内联返回该模式的交付物和交接内容；只有获得明确的 WARM 保存授权时，才保存到 `memory/influencer/content-amplifier/YYYY-MM-DD-<topic>.md`。已保存的产物和交接内容会复用明确传递的不透明 `creator_ref`，或经过验证的创作者注册表聚合 ID；否则在线路中只生成一次随机的 `creator-<UUIDv4>`。绝不将原始 handle、创作者姓名、个人资料/内容 URL、电子邮件、提供商 ID 或确定性哈希作为身份持久化。只保留 `creator_ref`、冻结的资产/审批引用、不透明的证据/权利/联系/投放位置引用以及非身份识别性的活动数据；每个保存的原子化源都必须携带 `creator_ref` + 确切的 `approved_asset_ref` + 不透明的 `source_ref`。如果不存在经过授权的解析器，则将身份标记为未解析，并在需要时再次要求提供临时定位信息。
- **提升**：只有获得单独的明确授权后，才能将持久事实提升为长期记忆——*paid*：选定的推广组合、每位创作者的支出等级、获胜受众、扩量/暂停阈值；*repurpose*：权利级别、到期日期、素材库命名约定、表现最佳的源资产。新观察到的撤销、争议、到期或其他权利状态变化不会在此处被设为规范事实：仅提供一条单独授权的交接路径，将其交给现有的 [creator-registry](../../../protocol/creator-registry/SKILL.md) 提案流程。此技能不会追加或接受该提案。
- **完成条件**：
  - *paid* — (1) 每个证据完整的候选项都具有带日期的自然表现以及 Hook/Message/Quality/CTA 证据，并且在任何分级或支出之前完成 /25 评分；每个不完整的候选项都是 `NOT_SCORED/NEEDS_INPUT`，不得有总分/排名/等级/支出；(2) 仅针对证据完整且符合条件的内容、目标和平台进行预算分配，且总额等于指定预算；(3) 记录包含用户提供的 KPI 目标和扩量/暂停规则的优化计划，否则这些规则保持为 `NEEDS_INPUT`；(4) 每个选定资产都有覆盖预期用途的当前 `active` 权利证据。
  - *repurpose* — (1) 每个源资产都有权利级别、到期时间、`active | expired | revoked | disputed | unknown` 状态、`status_observed_at` 和 `status_evidence_ref`；(2) 至少有一个源资产被映射到 2 个以上渠道中的 3 种以上不同输出格式；(3) 存在带日期的分发计划和资产检查清单；(4) 任何受非 active 或超出范围状态影响的现有投放位置都出现在人工移除队列中。
- **主要后续技能**：*paid* → 活动上线后使用 [performance-analyzer](../../report/performance-analyzer/SKILL.md)；*repurpose* → 使用 [landing-optimizer](../../report/landing-optimizer/SKILL.md)，将再利用的社会证明放置在能够促成转化的位置。

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 输出标准格式。说明运行的是哪种模式。为每个指标标注 Measured / User-provided / Calculated / Estimated / Unknown。缺少 CPM、ROAS、观看次数、权利日期或决策阈值时，绝不要用示例值填充：要求用户提供导出数据，或使用 `Unknown`/`NEEDS_INPUT`。自然流量表现以及 Hook/Message/Quality/CTA 观察结果是选择依据，而不是预测字段：如果其中任何一项缺失，不要替换为 `Estimated`；将该素材设为 `NOT_SCORED/NEEDS_INPUT`，并且不要输出 `/25`、排名、层级或预算。只有当用户提供或批准了计算所需的输入和假设时，其他预测字段才能使用 Estimated，并展示计算依据。

## 数据源

此系列属于 Tier 1：两种模式都无需实时集成即可运行。向用户索取对应模式的输入，并据此生成该模式支持的部分产物。绝不要编造触达量、互动、CPM、ROAS、权利数据或选择观察结果。缺少自然流量触达/互动/观看次数证据，或缺少 Hook/Message/Quality/CTA 证据时，绝不能使用 `Estimated`；这会使该素材变为 `NOT_SCORED/NEEDS_INPUT`。只有基于用户提供或明确批准的输入和假设，其他预测字段才可以使用 Estimated；否则使用 `Unknown/NEEDS_INPUT`。

以下连接器可以进一步提升输出质量（全部为可选的自愿启用 Tier 2/3）：

- `~~social platform analytics` — 拉取自然流量触达量、互动率和观看次数（两种模式均适用），而不是要求用户粘贴这些数据。
- `~~ad platform`（Meta Ads Manager、TikTok Ads Manager、Google Ads）— 为付费优化行动手册读取实时 CPM/CTR/CPC/ROAS，并确认 Spark Ads / Partnership Ad 授权状态。
- `~~influencer database` — 核验创作者受众的人口统计信息，以用于相似受众定位（付费）；临时解析创作者定位信息，同时在保存的再利用产物中仅保留 `creator_ref`、平台和合同权利引用。
- `~~DAM / asset library` — 存储并标记已处理的素材；强制执行命名规范（再利用）。
- `~~CRM` — 提供再营销/排除受众（付费）；将创作者记录与使用权到期信息进行核对（再利用）。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解每个类别经过验证的免费/无需密钥方案。连接器都不是必需的；没有连接器时，由用户提供数据。

## 指令

首先选择模式（参见 Mode selector），然后执行该模式的步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有填充模板——生成填充完成的产物，不要跳过表格。

### 模式：paid

1. **评估可用内容** — 构建内容清单：活动、素材数量、预算、`creator_ref`、平台/类型，以及带日期且包含证据引用的自然流量触达量/ER/观看次数值。对于缺失、无日期或无证据支持的指标，不要创建自然流量表现评分。[Paid Step 1 template](references/templates.md#paid-1-content-inventory-step-1)。
2. **选择用于放大的内容** — 分别记录自然流量表现、Hook、Message、Quality 和 CTA 的 1–5 观察结果，每项都包含 `source_ref` 和 `observed_at`。只有五项全部存在时，素材才可以获得 `/25`、排名、层级或预算。如果任何组成部分或其证据缺失，保留已提供的观察结果，将 `score_state` 设为 `NOT_SCORED`，并将执行状态设为 `NEEDS_INPUT`，列出确切缺口；不要估算、标准化、按比例分配或手动计算部分总分。[Paid Step 2 template](references/templates.md#paid-2-content-selection-step-2)。
3. **制定放大策略** — 以中性方式描述三种运营方法：白名单 / Partnership / Spark Ads 使用创作者身份，并要求匹配的平台授权；品牌账号广告使用品牌身份，并要求品牌广告账户中存在已获许可的素材；暗帖是未发布的广告账户投放。除非用户提供了比较证据，否则不要声称某种方法会提高互动、保持真实性、提升可信度，或表现更好/更差。将方法选择和预算组合视为已声明的测试或用户决策。[Paid Step 3 template](references/templates.md#paid-3-amplification-strategy-step-3-method-detail)。
4. **设置定位** — 以创作者互动受众为基础建立主要相似受众，并加入扩展细分（用于认知目标的兴趣/行为/人口统计细分；用于转化目标的再营销/自定义/相似受众），按平台设置广告组，并配置排除项。[Paid Step 4 template](references/templates.md#paid-4-audience-targeting-step-4)。
5. **分配预算** — 仅在具备权利资格且已完整评分的素材之间分配所述预算，然后按目标和平台进一步分配；设置投放节奏（学习期 → 优化期 → 扩量期）。分配总额必须等于所述预算。如果没有剩余的、具备完整评分且符合资格的素材，则返回 `NEEDS_INPUT`，不要进行假设性分配。[Paid Step 5 template](references/templates.md#paid-5-budget-allocation-step-5)。
6. **优化行动手册** — 提供 KPI 表格（CPM、CTR、CPC、CVR、ROAS），包含低于/高于目标时的行动、优化日程、A/B 测试，以及明确的扩量 / 暂停 / 素材刷新阈值。[Paid Step 6 template](references/templates.md#paid-6-optimization-playbook-step-6)。
7. **平台专属设置** — 核验冻结的素材版本已获审核员批准，并且其权利跟踪器显示为 `active`，同时带有含日期的证据引用；分别确认授权未过期，并且其范围涵盖目标平台、地域、格式和付费使用。对于新的使用场景，`expired`、`revoked`、`disputed` 或 `unknown` 均按失败关闭。Spark/boost 或其他现有帖子方法还要求匹配的实时帖子和平台授权；暗帖设置不要求此前进行过自然发布。缺少批准、必需的实时状态或可用权利时，停止激活并设为 `NEEDS_INPUT`；不得推断任何一项。[Paid Step 7 guide](references/templates.md#paid-7-platform-specific-setup-step-7)。

内联返回已填充的工件。提供其确切的 WARM 路径以获取保存授权，然后单独询问是否进行任何 HOT 晋升。任何广告账户设置、上传、发布或花费都是需要获得确切操作批准的进一步外部变更。

### 模式：重新利用

1. **审核可用内容** — 建立内容清单和权利摘要：每项资产都要有 ID、创作者、平台、类型、权利级别/到期时间、权利状态、`status_observed_at` 和 `status_evidence_ref`。[重新利用第 1 步模板](references/templates.md#repurpose-1-content-inventory-step-1)。
2. **映射重新利用机会** — 对于每项源资产，列出输出格式、目标渠道、修改内容和工作量（一个视频 → 10+ 项资产）。[重新利用第 2 步模板](references/templates.md#repurpose-2-repurposing-opportunity-map-step-2)。
3. **制定重新利用计划** — 按表现和权利对源资产排序，然后制定覆盖付费、自有、社交和销售渠道的渠道分发计划。[重新利用第 3 步模板](references/templates.md#repurpose-3-repurposing-plan-step-3)。
4. **指定格式转换** — 为视频→视频、视频→静态、引语/评论和图像转换提供宽高比、时长和修改规格。各平台规格见 [references/platforms/](../../../references/platforms)。[重新利用第 4 步规格](references/templates.md#repurpose-4-format-transformation-specs-step-4)。
5. **应用渠道指南** — 应用网站、电子邮件、付费渠道（包括创意测试矩阵）和自然社交的最佳实践。[重新利用第 5 步指南](references/templates.md#repurpose-5-channel-specific-guidelines-step-5)。
6. **构建内容库** — 规定文件夹结构、`[campaign]_[creator_ref]_[platform]_[type]_[variation]_[date]` 命名约定以及元数据字段。[重新利用第 6 步结构](references/templates.md#repurpose-6-content-library-structure-step-6)。
7. **跟踪权利** — 建立按内容划分的权利矩阵、即将到期权利提醒、权利扩展机会，以及仅根据现有投放位置生成的手动移除队列。在推荐目标位置之前，必须要求 `status: active`，并包含 `status_observed_at` 和 `status_evidence_ref`，然后验证授权未过期，且涵盖该渠道、地域、格式和用途。对于新的使用，`expired`、`revoked`、`disputed`、`unknown` 以及超出范围的权利仍保持阻止状态。将受影响的现有投放位置加入队列，并填写目标位置、负责人、`due_at` 和 `completion_ref`；空白的完成引用意味着尚未证明已完成移除。[重新利用第 7 步跟踪器](references/templates.md#repurpose-7-usage-rights-tracker-step-7)。

如需将一个来源切分为许多输出原子，请应用 [references/atom-extraction.md](references/atom-extraction.md) 中的 7 层提取流程。将每个原子绑定到 `creator_ref`、确切的 `approved_asset_ref` 和不透明的已授权 `source_ref`。任何原子排名、病毒传播评分、近重复阈值、付费投放选择或主视觉位置选择，都需要用户批准的规则或带来源日期的规则引用；如果没有，则将这些原子保留为 `NOT_SCORED/NEEDS_INPUT`，不得自动对其进行排名/丢弃/选择。内联返回已填充的工件；为其 WARM 保存请求一个确切的授权，并为任何 HOT 晋升单独请求授权。

无论哪种模式，移除队列都是由人工操作的后续查看视图，并不代表获得移除或编辑任何内容的授权。除非另有单独且明确的操作批准以及完成证据，否则绝不得暂停广告、删除帖子、取消发布页面、编辑平台，或标记 `completion_ref`。当权利状态发生变化时，仅在获得单独授权后，才可将确切证据提交给现有的创作者注册表提案工作流；不要创建新的权利注册表，也不要将 WARM 跟踪器视为权威来源。

## 决策门

- **停止并询问** — 仅当继续所需的模式输入缺失且无法推断时：(1) *paid* 没有预算 — 询问放大预算；(2) 付费候选项缺少带日期且有证据支持的自然指标，或缺少任何 Hook/Message/Quality/CTA 观察 — 将该资产返回为 `NOT_SCORED/NEEDS_INPUT`，不提供总分/排名/层级/支出；(3) 任一模式缺少冻结资产的审计员批准引用，或资产的权利状态为 `expired`、`revoked`、`disputed`、`unknown`，缺少带日期的状态证据，或未涵盖预期的渠道/地域/格式/用途 — 在建议激活或复用之前，针对确切的批准或权利缺口返回 `NEEDS_INPUT`，因为既不能猜测批准，也不能猜测受限授权。
- **静默继续** — 不要因为缺少可选连接器或参考集之外的平台而停止；使用用户提供的证据或有文档记录的最接近格式类比，并披露这一点。对于不完整的候选项，可以继续进行权利清单或证据缺口报告，但不得对其进行深入分析、排名、分层、分配支出，或创建付费建议。

## 示例

**paid** — *用户*：“带日期的自然导出数据为五个已冻结、经审计员批准且具有有效范围付费权利的资产提供了观看次数/ER 和 Hook 观察，但我们没有 Message、Quality 或 CTA 观察。请分配我们的 $5,000 预算。”

```markdown
Evidence basis: organic metrics, Hook observations, frozen approval refs, and rights status/scope are user-provided; Message, Quality, and CTA evidence is missing.

| Creator Ref | Organic | Hook | Message | Quality | CTA | Score State | Total / Rank / Spend |
|-------------|---------|------|---------|---------|-----|-------------|----------------------|
| [creator_ref per asset] | supplied | supplied | Unknown | Unknown | Unknown | `NOT_SCORED/NEEDS_INPUT` | none |

No `/25`, rank, tier, or allocation is emitted. Request dated Message/Quality/CTA observations with opaque evidence refs; never fill them with `Estimated` or force a partial total.
```

**repurpose** — *用户*：“使用三个提供的、已冻结且经审计员批准的资产，分别映射到 `creator_ref-1`、`creator_ref-2` 和 `creator_ref-3`。它们的权利记录均为 `active`，有日期、有证据、未过期，并涵盖所请求的衍生编辑以及美国付费、网站、电子邮件、自然社交和 YouTube 目的地。请制定一个 30 天的复用计划。” → 仅映射有证据支持的用途，并在计划中保留 `creator_ref` 以及不透明的资产/证据引用。

如果任一请求缺少冻结批准引用或当前的范围权利证据，则返回 `NEEDS_INPUT`，并指出这些确切缺口；不得对该资产进行排名、分配、转换或排期。当自然指标/证据，或任何 Hook/Message/Quality/CTA 观察/证据缺失时，付费选择还必须保持为 `NOT_SCORED/NEEDS_INPUT`。

完整排名、策略、设置以及两个完整示例： [references/templates.md](references/templates.md)。

## 参考资料

- [templates.md](references/templates.md) — 两种模式每个步骤的填空模板、平台设置指南、格式转换规范、两个完整示例以及提示。
- [atom-extraction.md](references/atom-extraction.md) — 7 层内容原子提取、病毒传播性启发式方法，以及用于将一个来源切分成多个内容的 Jaccard 近重复标记（再利用模式）。
- 各平台格式与发布位置规范：[tiktok](../../../references/platforms/tiktok.md) · [youtube](../../../references/platforms/youtube.md) · [linkedin](../../../references/platforms/linkedin.md) · [x](../../../references/platforms/x.md) · [reddit](../../../references/platforms/reddit.md) · [grokipedia](../../../references/platforms/grokipedia.md)。
- [star-benchmark.md](../../../references/star-benchmark.md) — STAR 框架；在此技能运行前由 creator-content-auditor 执行的 Trust 否决项（`STAR-T1` FTC 披露、`STAR-T2` 声明完整性）。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约与 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — HOT/WARM/COLD 记忆层级与保存约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无需密钥数据方案。
- 兄弟技能：[creator-content-auditor](../creator-content-auditor/SKILL.md)、[contract-helper](../contract-helper/SKILL.md)、[landing-optimizer](../../report/landing-optimizer/SKILL.md)、[budget-optimizer](../../target/budget-optimizer/SKILL.md)、[performance-analyzer](../../report/performance-analyzer/SKILL.md)。

## 保存结果

在内联交付调查结果后，询问：“保存这些结果以供未来会话使用吗？”如果回答是，则获取针对 `memory/influencer/content-amplifier/YYYY-MM-DD-<topic>.md` 的明确授权，并写入一行结论/标题、3-5 项最重要的可执行事项、未完成事项或阻塞因素，以及不透明的来源引用。保存的身份信息仅限 `creator_ref`；移除原始账号标识、姓名、个人资料/内容 URL、电子邮件和提供商 ID。保存不授权 HOT 提升或任何广告平台变更。此技能会将类似否决项的风险（缺少披露、未经证实的声明）交给 [creator-content-auditor](../creator-content-auditor/SKILL.md) 处理，而不是在此处进行判断。

## 下一项最佳技能

**主要技能**：
- *付费模式* → [performance-analyzer](../../report/performance-analyzer/SKILL.md) — 在营销活动上线后衡量放大效果。
- *再利用模式* → [landing-optimizer](../../report/landing-optimizer/SKILL.md) — 将再利用后的推荐内容、主视觉视频和引言卡片放置到能够带来转化的页面上。

**备选技能**：
- [content-amplifier --mode paid](SKILL.md) — 当再利用后的广告变体准备投入付费推广时使用（仅当本次会话已运行再利用模式且尚未运行付费模式时运行）。
- [contract-helper](../contract-helper/SKILL.md) — 在重新使用前获取或扩大使用权（再利用模式）。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 在建议的层级之间重新分配付费预算（付费模式）。

**终止**：在本次会话中维护一个已访问集合。如果某个推荐目标（包括此技能的同级模式）已经运行过，则停止，并报告链路已完成，而不是再次调用它。链路最大深度为 3。当路由存在歧义时，列出选项并停止，而不是自动继续跟进。