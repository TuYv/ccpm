---
name: campaign-planner
slug: aaron-campaign-planner
displayName: "Campaign Planner · 活动规划"
summary: "红人活动整体规划:目标、阶段、创作者组合、时间线与风险预案"
description: 'Use when the user asks to "plan an influencer campaign", "build a campaign blueprint", "track or close a creator campaign", or "record a late campaign correction"; produces the plan and, when requested, a non-canonical evidence tracker with scoped identity, publication, reconciliation, close, and reopen receipts. Not for individual creator briefs — use brief-generator; not for overall product launches without creators — use launch-tier-planner; not for sending, publishing, amplifying, or paying — use the owning execution workflow. 达人营销策划/种草方案/活动追踪与关账'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning a new influencer campaign, launching a product with influencer support, building seasonal or always-on creator programs, or maintaining an existing creator-campaign tracker: recording verified publication checkpoints, deriving exception queues, reconciling payment/measurement evidence, closing creators or the campaign, and handling late evidence or manual reopen. Planning does not write briefs or execute outreach; tracking does not publish, amplify, pay, or mutate external systems."
argument-hint: "<brand or product> [budget] [platform] [timeframe]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# Campaign Planner

从策略到执行计划设计影响者营销活动，产出一份将业务目标与创意执行相结合的可执行蓝图。

**范围边界——产品发布**：此技能负责发布活动中的**创作者渠道**。发布活动本身——层级/类型决策、发布日历、媒体推广、社区发布日、准备就绪门禁——属于发布专业领域（[launch-tier-planner](../../../launch/research/launch-tier-planner/SKILL.md) 及其同类技能），该领域会将与 [launch-registry](../../../protocol/launch-registry/SKILL.md) 日期和阶段对齐的创作者渠道子计划交给此技能。“与创作者一起发布产品”从这里开始；“发布产品”从那里开始。

## 快速开始

```
Create an influencer campaign plan for [product launch]
```

```
Plan an influencer campaign for [brand] with [budget] targeting [audience] during [timeframe]
```

## 技能契约

- **读取**：请求的模式（`plan-only | tracker-only | both`）；用于编写计划的品牌、产品、受众、活动类型、预算、时间线和约束；以及对于可执行跟踪所需的现有 `campaign_id`、精确的版本化活动计划引用/哈希、已锁定的 §8 衡量契约和已锁定的非空创作者范围。如果 `memory-management` 处于活动状态，还会从热缓存中加载既有受众画像和过往活动基准。
- **写入**：默认将活动计划直接写入响应中。获得精确保存授权后，将其写入 `memory/influencer/campaign-planner/YYYY-MM-DD-<topic>.md`。对于执行跟踪，生成单独的 JSON 构件，并验证其是否符合共享的五类控制架构（证据观察、已锁定的衡量契约、仅针对实际执行器操作的操作意图/回执，以及周期复盘），然后由控制器将它们的精确引用/哈希绑定到选定的运行祖先。 [references/templates.md §10](references/templates.md#10-optional-lightweight-campaign-tracker) 中的 Markdown/YAML 跟踪器是确定性的**只读 Influencer 兼容视图**，标记为 `authoritative: false`；其中的领域区块本身不是架构有效的控制构件，编辑它们也不会改变运行时状态。没有验证器的独立宿主可以在获得精确 WARM 授权后保存语义兼容快照，但必须标记为 `NOT_VERIFIED`，且不得声称具备单头、回执、持久化或关闭强制能力。复用明确的上游/用户提供的 `campaign_id`；在计划编写模式下，如果不存在则生成一个随机的 `campaign-<UUIDv4>`，并在整个血缘中保留该 ID。`tracker-only` 绝不会臆造缺失的 ID、计划、契约、范围或检查点。每一行都保留稳定的不透明 `creator_ref`；每个已保存的 `live_post_ref` 都由限定解析器支持并保持不透明。原始姓名、账号名、URL、短码、提供商 ID 和隐藏定位器映射均只在临时状态中存在。
- **提升**：只有在单独获得精确授权后，才能将已批准的活动名称、目标、预算、上线日期和 KPI 目标提升到 `memory/hot-cache.md`；绝不提升跟踪阶段或付款状态。创作者行关闭后，对于每一条包含有证据支持的**实际费率**、**已签署的权利期限/到期时间**或**已衡量的表现基线**的注册表提案，都需要再次获得单独的精确授权；只有 [creator-registry](../../../protocol/creator-registry/SKILL.md) 才能将这些事实确立为规范事实。预测目标、`stage`、`next_action`、`due_at` 和 `payment_status` 保持为 WARM 工作状态。
- **完成条件**：
  - 所选模式必须明确：`plan-only` 完成第 1–9 节，`tracker-only` 仅根据所需的现有输入完成第 10 节，`both` 先完成第 1–9 节，再完成第 10 节。
  - 在计划编写模式下，只有在用户提供了相关信息，或兼容的、带来源日期的规划依据支持这些内容时，目标、策略、影响者组合、交付物、时间线、预算分配、应急方案和 KPI 才能具体化。每个缺乏支持的必需选择都保持为 `NEEDS_INPUT`；此技能绝不会从仓库默认值中填充这些选择。只有在具备活动/计划绑定、不可变的计划哈希/版本、授权、非空创作者范围以及每位创作者/交付物唯一检查点时，第 8 节的衡量设计才会执行锁定；否则应将确切的锁定输入报告为 `NEEDS_INPUT`/`DONE_WITH_CONCERNS`，并且不得创建可进行关闭的跟踪器。
  - 如果请求了跟踪，则每位创作者都必须有经过验证的来源构件，以及一个确定性的、非权威投影区块，其中包含阶段、下一步操作、截止日期、权利到期时间、证据引用和外部付款交接状态。该投影携带其来源构件引用/摘要和当前头；它绝不能作为状态来源被手动编辑。
  - 每个跟踪器创作者都使用一个稳定的不透明 `creator_ref`；每次身份解析、发布、终端检查点解析、创作者关闭、活动关闭、迁移和迟到事件都必须具有不可变引用，并带有精确的活动/创作者范围，以及在适用时唯一的非分叉当前头。
  - 每个已保存的 `live_post_ref` 都必须是不透明的，并由限定解析器支持。外部操作需要当前的精确授权以及相匹配的意图/回执构件；此前的保存、计划、门禁、路径、能力或投影都不会授予授权。原始帖子定位器和可重复使用的笼统批准不得进入构件集或投影。
  - 已跟踪的实时帖子必须为每个必需检查点提供一份回执，并且每个检查点最新的、明确未被取代的回执控制关闭门禁；不匹配、披露未知或帖子发生变更/移除时，应作为审核证据，绝不能被默认为已批准。
  - 已关闭的创作者行必须指向其唯一的当前关闭回执头。已关闭的活动必须指向唯一的当前活动关闭头，证明其与已锁定的非空创作者范围完全相等，并通过模板 §10 中的严格门禁；任何一个 `closed` 值都不得被视为成功的同义词。
  - 重大迟到事件必须在不重写既有回执的情况下追加。引用更正后，如果更正后的门禁仍然通过，则追加新的关闭回执；失败的门禁不得获得通过回执，并且手动重新打开仅限于模板 §10 的阶段/操作基线所定义的新活动所属工作。
  - 计划编写结果必须注明简报生成和待处理的批准事项。`tracker-only` 结果则应注明当前阶段所暗示的证据/操作负责人，或在没有剩余事项时停止并标记为链路完成；默认绝不回退到简报生成。
- **主要下一技能**：在 `plan-only`/`both` 模式下使用 [brief-generator](../brief-generator/SKILL.md)；在 `tracker-only` 模式下使用 **Next Best Skill** 中按阶段指定的交接技能，或在完成时停止。

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 输出标准格式。

## 数据源

此系列属于 Tier 1：每个技能在没有实时集成的情况下均可运行。提供的品牌、受众、预算和时间线支持计划框架，但无法决定消息传递、平台/层级组合、内容格式、促销机制、应急方案、费率或 KPI 目标。这些选择需要用户指示或兼容的、有来源日期的规划证据；否则保留 `NEEDS_INPUT`。

可在可用时加强计划的可选连接器：

- `~~influencer database` — 确定影响者组合规模并验证层级粉丝范围。
- `~~social platform analytics` — 设置特定平台的触达和互动基准。
- `~~CRM` — 使转化目标和归因与现有管道数据保持一致。
- `~~analytics` — 提取过往活动实际数据，以制定切合实际的 KPI 和预算效率目标。

有关各类别的免费/无需密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。没有连接器时，向用户询问缺失输入，并且仅处理由用户提供证据所支持的字段；为其余内容返回有用的框架以及 `NEEDS_INPUT`。

## 说明

开始工作前，选择并说明一种模式。`plan-only` 运行 §§1–9，且不实例化 §10。`tracker-only` 仅运行 §10，并且需要现有的 `campaign_id`、精确且已版本化的 `plan_ref` 及计划哈希、当前锁定的 §8 衡量契约，以及其锁定的非空创作者范围；如果任何绑定缺失、不匹配、分叉或未经验证，则返回 `NEEDS_INPUT`，而不是重建计划或创建占位跟踪器。`both` 在 §10 之前运行 §§1–9。如果创作者选择尚未锁定，则返回计划及确切缺失的范围/契约输入；仅在被明确要求时，提供内联的、不具备关闭资格的部分跟踪器头部；不得虚构创作者身份或将其称为可执行就绪。在 `plan-only` 或 `both` 中，复用明确的上游/用户 `campaign_id`；对于没有 ID 的新活动，仅生成一次随机的 `campaign-<UUIDv4>`，并保持其不变。在 `tracker-only` 中，缺少 ID 将构成阻塞；绝不可根据活动名称、日期、创作者账号或可变的计划内容生成或确定性推导该 ID。

对于计划撰写模式，按顺序完成这九个步骤。每一步在 [references/templates.md](references/templates.md) 中均有填空模板——复制匹配的区块，并在第 9 步中组装它。仅用已提供或有来源支持的值替换方括号；绝不可为了消除占位符而虚构数字、身份、基准或事实。将未解决的可选字段保留为 `Unknown`，并在必填字段缺失时返回 `NEEDS_INPUT`。

1. **收集活动要求** — 获取 `campaign_id`、品牌、价值主张、受众、活动类型、时间线、预算和约束条件（模板 §1）。
2. **定义目标** — 一个 SMART 主要目标及次要目标，并明确成功和失败定义（模板 §2）。
3. **制定策略** — 仅依据用户批准的规范或兼容的、有来源日期的证据，确定核心创意、策略陈述、受众、关键信息、活动支柱、平台划分和差异化；否则将决策字段保留为 `NEEDS_INPUT`，而不是默认采用 UGC、促销代码或其他策略（模板 §3）。
4. **定义影响者标准** — 层级组合、必备和优选筛选标准、排除条件、理想画像及合作关系类型。仅使用用户声明的或兼容的、有来源日期的粉丝分类法；[references/influencer-tiers.md](references/influencer-tiers.md) 提供记录契约，而非通用范围或绩效声明（模板 §4）。
5. **规划内容要求** — 依据提供的决策以及当前的平台/权利证据，确定按平台/格式划分的交付物、必需元素、创意方向、主题和审批链；不得虚构默认的 UGC 格式、促销机制或内容组合（模板 §5）。
6. **创建时间线** — 关键日期、按周划分的四阶段计划，以及甘特图视图（模板 §6）。
7. **分配预算** — 仅依据用户批准的规则或兼容的、有来源日期的成本证据，按类别、声明的粉丝区间和平台拆分所提供的总预算。仅在提供其规则/锚点时，才添加应急预算、CPM/CPE 或单内容成本目标；否则使用 `NEEDS_INPUT`，且不得虚构百分比或费率（模板 §7）。
8. **建立成功指标** — 主要 KPI 与有来源日期的对照数据、次要指标和转化指标、报告频率，以及非规范性的执行前衡量契约；该契约涵盖基线、结果单位、回读窗口、归因基础、决策规则、决策负责人、精确的活动/计划版本和哈希、锁定授权、非空创作者范围，以及结构化的、每位创作者/交付物唯一的发布检查点（模板 §8）。每个外部对照数据都需要不透明来源引用、观察日期和可比窗口/群组；否则保留为 `Unknown`/`NEEDS_INPUT`，而不是将其表述为“行业平均值”。范围或契约变更必须创建新的不可变版本，并明确进行 §10 迁移；绝不可原地编辑锁定区块。
9. **编制计划文档** — 执行摘要、上述完整章节，以及包含风险缓解措施的附录（模板 §9）。默认以内联方式返回；仅在已授权精确的 WARM 路径后保存。

对于 `tracker-only` 或 `both`，请阅读 [references/templates.md §10](references/templates.md#10-optional-lightweight-campaign-tracker)，了解 Influencer 领域字段和兼容性视图。在 Governed 主机上，先验证源代码控制制品，并将 tracker 生成为只读投影；绝不接受 tracker 编辑作为追加、迁移、阶段/证据/指针变更、重新打开或关闭操作。Creator 行必须等于锁定范围，并使 active block 恰好包含八个字段；identity 和 close 指针必须相邻。Identity 和 state head 必须可解析、属于同一范围、唯一且未分叉。任何范围/契约/身份/检查点/验证/回执/关闭/延迟事件缺口都会显示 `PARTIAL CHECKPOINT COVERAGE — NOT CLOSE-ELIGIBLE`；经过时间绝不会推进状态。在 semantic-only 主机上，请内联返回相同视图，或在完成精确的路径范围授权后保存 `NOT_VERIFIED` 兼容性快照。`payment_status` 仅记录外部就绪状态/证据，绝不会发送资金。

每个发布检查点都会在新的主机授权下，为 `append-publication-receipt` 视图更新创建一个不可变、属于同一 campaign/creator/checkpoint 领域的 `publication_receipt`，并建立单头 supersession 链。此 YAML 块映射到共享的 `evidence-observation`；它不是 `action-receipt`，也不能证明此 skill 发布了任何内容。真实发布需要在执行器之前单独提供精确的 `action-intent`，并在执行之后提供匹配的 `action-receipt`。`live_post_ref` 仅是由限定解析器支持的不透明引用；原始 URL/slug/provider ID 仅保持临时状态，无法解析的输入仍为 `unknown`。`verified` disclosure/version 匹配要求精确的观察记录、冻结的已批准资产/审计员以及证据引用。缺失、不匹配、跨范围或分叉的证据会阻止关闭，并将资产路由至 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md)；绝不推断批准或变更。

只有在每个适用检查点都存在一个负责控制的已验证发布回执，或存在由证据支持的终止性不适用解析，并且所有 §10 gate 都通过时，creator 才能关闭。新的原子 `close-creator` 授权必须列明其回执追加、行/证据变更和指针更新；campaign 关闭需要单独的、范围等价的 `close-campaign` 授权，以及精确的 creator→current-close 映射。任何分叉都会阻止两个分支。更正会保留历史、重新评估 gate，并且仅在确有必要时追加新授权的 close head；仅引用性质的更正不会手动重新打开工作。

延迟到达的权利/帖子/归因/付款/数据证据使用 campaign 绑定的 §10 `late_event_note`，并需要新的 `append-late-event` 授权。任何伴随的阶段/操作/证据/指针变更，都必须在该原子授权中列明，或单独获得批准。`supersede-artifact` 绑定同一范围和含义下精确的旧引用与替换引用。`manual-reopen` 仅适用于新的、由 campaign 所有的工作；否则追加更正，并在 gate 通过时生成新的 close head。保留历史，绝不自动重新打开，也绝不臆造 `reopened` 阶段】【。

当用户询问有哪些事项需要关注时，请基于经过验证的源工件（或明确标注的纯语义兼容性快照），使用显式的 `as_of` 时间和用户选择的权利期限生成模板 §10 异常队列。这是一项只读投影——不执行 cron、轮询、自动阶段变更、投影回写或外部变更。

## 示例

**用户**："为面向 TikTok 和 Instagram 上 Z 世代、预算为 $50K 的全新可持续运动鞋发布创建一份营销活动计划"

**输出**：一份保留所提供受众、平台和 $50K 总预算的计划框架。可持续性声明/消息规范、创作者组合、内容形式、促销/归因机制、费率、应急预算、KPI 目标和确切日期均保持为 `NEEDS_INPUT`，直至用户提供这些信息或提供兼容的源日期锚点。不会推断微型创作者主导、UGC、促销代码或百分比默认值。（更完整的演练参见 [references/templates.md](references/templates.md#worked-example)。）

## 参考材料

- [references/templates.md](references/templates.md) — 包含全部九个规划步骤的填充模板、可选的轻量级 WARM 跟踪器、已完成示例和成功提示。
- [references/influencer-tiers.md](references/influencer-tiers.md) — 面向用户/源日期合作伙伴模型和粉丝量级的声明契约；它不提供通用范围或效果声明。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接架构。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 每种连接器类别的免费/无密钥数据方案。
- [audience-mapper](../../scout/audience-mapper/SKILL.md) — 定义此计划所服务的目标受众。
- [brief-generator](../brief-generator/SKILL.md) — 将计划转化为每位影响者的简报。
- [budget-optimizer](../budget-optimizer/SKILL.md) — 优化预算分配。
- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 寻找符合条件的影响者。

## 下一最佳 Skill

- **计划编写主要选择**：[brief-generator](../brief-generator/SKILL.md) — 将已批准的计划转换为具体的影响者简报。
- **计划编写替代选择**：[budget-optimizer](../budget-optimizer/SKILL.md) 用于对预算拆分进行压力测试；[influencer-discovery](../../scout/influencer-discovery/SKILL.md) 用于构建或完成已锁定的创作者范围。
- **仅跟踪器，发布/审批阻塞项**：[creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) — 验证所引用的实时帖子是否与冻结的已批准资产一致；这不授权编辑或放大投放。
- **仅跟踪器，需要回读/对账**：[performance-analyzer](../../report/performance-analyzer/SKILL.md) — 生成带日期的 §8 回读工件；仅在证据存在后，最终报告才可打包该工件。
- **仅跟踪器，开放的运营事项**：仅交接给当前 `next_action` 所要求的指定负责人/Skill；不要将后期行重新路由回简报流程。若所有关闭门槛均通过且没有剩余操作，则停止并报告链路完成。

终止说明：保留本次会话中已调用技能的已访问集合。如果适用的下一个技能已在本次会话中运行，则停止调用，并报告链路已完成，而不是再次调用。不要从发起请求开始继续深入超过 3 跳。