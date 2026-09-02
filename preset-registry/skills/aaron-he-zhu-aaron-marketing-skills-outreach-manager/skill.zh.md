---
name: outreach-manager
slug: outreach-manager
displayName: "Outreach Manager · 建联外联管理"
summary: "红人及媒体建联:分层触达序列、跟进节奏与回复率优化"
description: 'Use when the user asks to "write influencer outreach", "follow up with a creator", "pitch a journalist, hunter, or launch partner", or "negotiate partnership terms"; produces personalized pitches, multi-touch follow-up sequences, negotiation scripts with objection handling, and a status pipeline tracker — the shared outreach mechanics engine for creator, media/analyst, launch-partner, and social-selling / advocate-recruitment targets. Not for finalizing signed agreements — use contract-helper; not for media-list tiering, embargo terms, or press-release structure — use press-media-relations. 达人邀约建联/合作谈判话术'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate the skill when the user wants to contact a creator, journalist, analyst, hunter, or launch partner; draft or personalize a pitch message; build a follow-up cadence for non-responders; re-engage a past partner; negotiate rate or scope; handle pricing objections; or track outreach status across a target list. For media targets the list/angle/embargo artifact comes from press-media-relations — this skill executes the pitch mechanics."
argument-hint: "<influencer handle or list> [platform] [budget]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 外联经理

撰写个性化、专业、持续跟进的外联；管理谈判；跟踪关系进展。默认业务方向是 influencer（创作者外联），同一套机制引擎——个性化、多触点节奏、谈判脚本、管线跟踪——也适用于媒体/分析师和发布合作伙伴目标，前提是 [press-media-relations](../../../launch/mobilize/press-media-relations/SKILL.md) 交接了其媒体名单、角度和解禁条款；当 [social-selling-planner](../../../social/host/social-selling-planner/SKILL.md) 或 [advocacy-program-designer](../../../social/craft/advocacy-program-designer/SKILL.md) 交接了一对一暖线索时，同样适用于社交销售/倡导者招募目标。名单、角度和解禁条款仍归交接技能所有；本技能负责执行提案。

## 快速开始

最短调用方式：

```
Write an outreach message to @[influencer] for [campaign]
```

在诉求与预算之间协商差距：

```
Help me negotiate with @[influencer] who is asking for $[X] when our budget is $[Y]
```

## 技能契约

- **读取**：当经授权的上游工件中携带稳定的、不透明的 `creator_ref` 时读取它，以及临时的目标 handle/profile locator(s)、平台、粉丝数、细分领域；活动和产品上下文；报酬类型和预算；交付物和时间线；司法辖区、目标渠道、合法依据引用、联系来源/资格证据以及假名化的同意主体 ID；以及用户提供或从 memory 加载的任何先前联系历史。对于已编入名单的创作者，只有在身份关联已验证时才复用 creator-registry 聚合 ID，通过授权工件或已验证的 registry 链接解析它，然后检查 `memory/creators/<aggregate-id>.md` —— [creator-registry](../../../protocol/creator-registry/SKILL.md) 投影 —— 以获取已确认的联系方式、上次约定费率以及谈判/响应历史。绝不要从原始 handle 推导该路径。
- **写入**：默认以内联方式返回外联工件；仅在获得精确的 WARM-save 授权时才将其保存到 `memory/influencer/outreach-manager/YYYY-MM-DD-<topic>.md`。复用显式携带的、不透明的 `creator_ref`，或已验证的 creator-registry 聚合 ID；否则仅为此条线索生成一次随机的 `creator-<UUIDv4>`。在保存前，将原始定位符和已解析的收件人身份替换为稳定的 `creator_ref` 以及可解析的不透明 `recipient_ref`、`contact_source_ref`、`handle_ref` 和证据/批准引用。原始 URL 或 handle 绝不是持久化的 `source_ref`。当没有授权来源工件或已验证的 registry 链接可解析不透明的身份/联系 ref 时，将 `identity_status: unresolved`，不保存任何隐藏的原始定位符映射，设置 `cross_session_locator_required: true`，并在发送时再次请求临时定位符。当一个周期结束时，每次结果更新（最终商定费率、响应历史、已确认的联系路径引用）都需要对 `memory/events/creators.ndjson` 中的 `operation: propose` 请求单独进行精确授权；只有 `creator-registry` 才写入权威名单记录。
- **提升**：仅在获得单独的精确授权时，才将持久事实（已确认的合作方、已商定费率、主要异议模式、响应率基线）提升到 `memory/hot-cache.md`。
- **完成条件**：
  - 为每个目标 influencer 都存在一份个性化提案（以及至少一个变体）。
  - 每条个性化事实都记录 `source_ref` 和 `observed_at`；不可验证的事实保持占位符或省略。
  - 为每个被联系的创作者记录后续跟进节奏和管线状态，包括终止性的无联系状态。
  - 司法辖区、渠道、合法依据和联系资格都明确；任何发送/排期都必须受精确批准和实时屏蔽检查约束。
  - 已确认的合作方会被标记为附带约定条款，供交接使用。
- **首选下一技能**：[contract-helper](../contract-helper/SKILL.md)

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 的标准格式输出。

## 数据来源

起草不需要实时集成（Tier 1）。该 skill 直接使用你提供的输入——粘贴 influencer handles、follower counts、niche、budget 和 deliverables，它就能生成一份清晰标注的草稿，而无需任何工具连接。发送或排程则不同：它需要 pseudonymous subject ID，以及在发送前立即进行一次实时 [consent-registry](../../../protocol/consent-registry/SKILL.md) suppression query；不可用或失败的查询不构成发送许可。

如果某个 connector 能加快工作，可使用这些 `~~` 占位符：

- `~~influencer database` — 拉取 handle、follower count、niche 和 past partnerships，而不是手动输入它们。
- `~~social platform analytics` — 验证 audience demographics 和 recent posts，用于个性化。
- `~~CRM` — 同步 pipeline status、last-contact dates 和 next actions。
- `~~email/DM tool` — 只发送当前到期、已明确批准的单次触达，并且要先完成最新 eligibility 和 live-suppression checks。后续触达仍保持为未排程草稿，不论 provider 功能如何。

参见 [CONNECTORS.md](../../../CONNECTORS.md)，获取每个类别的 free/keyless recipe。这里不要求集成；当没有集成时，直接向用户索取输入。缺少目标或 campaign 细节不会阻止生成可回滚草稿：使用明确的方括号占位符，对未验证的个性化内容进行泛化，并标明完成它所需的最小输入。

## 说明

### 运行时读取

- `../../../references/runtime-invocation.md`
- `../../../references/registry-event-protocol.md`

### 流程

当用户请求 outreach 帮助时，按以下步骤执行。每一步在 [references/templates.md](references/templates.md) 中都有一个填充模板——复制匹配的块并替换占位符。在任何消息发送前，应用 [references/cold-copy-rules.md](references/cold-copy-rules.md) 中的硬性复制规则。

**草稿/发送边界**：起草是可回滚的；发送或排程是外部副作用。即使 shortlist 或个性化事实缺失，也要生成一份行内的首触草稿，标注为 `DRAFT — NOT SENT`，并使用明确占位符且不编造事实，然后说明个性化还缺少什么。不要只停留在索取输入；只要可以生成安全的占位符草稿，就应先产出草稿。

在以下所有条件都满足之前，不要发送或排程任何内容：

- 显示了精确的收件人（而不是某个 segment 或占位符）、预期渠道、最终消息，以及——在排程那一次触达时——一个具体的 ISO-8601 `dispatch_at` 时间戳和时区，并且都已被明确批准。批准只覆盖当前到期的单次触达。像 `Day 3–4` 这样的草稿窗口不算精确批准，而且没有任何批准或 provider 功能可以授权预先排程后续 cadence 触达。
- 已记录 jurisdiction、channel、lawful basis 及其 evidence reference，以及 contact eligibility。`Unknown` 或缺失的 eligibility 视为失败关闭；此 skill 不会虚构 legal basis，也不会提供法律建议。
- 在每个实际投递 job 内，在解析 transient recipient 之后、并且紧接 provider send call 之前，按如下所示解析并验证 bundle runtime，然后运行实时 [consent-registry](../../../protocol/consent-registry/SKILL.md) `is-suppressed`。suppressed 结果、缺失 subject ID、无法访问/损坏的历史、runtime/schema failure，或 query error 都会阻止该次发送。`not suppressed` 结果只会移除 suppression 阻塞；它本身并不能证明 lawful basis，也不会授权联系。不要在不同 cadence 触达之间复用缓存结果。

```bash
AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
PROJECT_ROOT="${PROJECT_ROOT:-}"
SUBJECT_ID="${SUBJECT_ID:-}"
case "$PROJECT_ROOT" in
  /*) ;;
  *) echo "PROJECT_ROOT must be an absolute project path; stop dispatch." >&2; exit 1 ;;
esac
if [ -z "$AARON_SKILLS_ROOT" ] || [ -z "$PROJECT_ROOT" ] || [ -z "$SUBJECT_ID" ] || \
   [ ! -d "$PROJECT_ROOT" ] || [ ! -f "$AARON_SKILLS_ROOT/.claude-plugin/plugin.json" ] || \
   [ ! -f "$AARON_SKILLS_ROOT/references/system-catalog.json" ] || \
   [ ! -f "$AARON_SKILLS_ROOT/references/capability-profiles.json" ] || \
   [ ! -f "$AARON_SKILLS_ROOT/references/registry-event.schema.json" ] || \
   [ ! -f "$AARON_SKILLS_ROOT/scripts/profile-resolver.py" ] || \
   [ ! -f "$AARON_SKILLS_ROOT/scripts/registry-events.py" ]; then
  echo "Verified Aaron Marketing Skills consent runtime unavailable; stop dispatch." >&2
  exit 1
fi
python3 "$AARON_SKILLS_ROOT/scripts/profile-resolver.py" \
  --root "$PROJECT_ROOT" --bundle-root "$AARON_SKILLS_ROOT" diagnose --json >/dev/null || exit 1
SUPPRESSION_JSON="$(python3 "$AARON_SKILLS_ROOT/scripts/registry-events.py" \
  --root "$PROJECT_ROOT" is-suppressed "$SUBJECT_ID")" || exit 1
printf '%s\n' "$SUPPRESSION_JSON" | python3 -c \
  'import json, sys; value = json.load(sys.stdin); raise SystemExit(0 if value.get("aggregate_id") == sys.argv[1] and value.get("suppressed") is False else 1)' \
  "$SUBJECT_ID" || { echo "Recipient is suppressed or suppression result is invalid; stop dispatch." >&2; exit 1; }
```

`PROJECT_ROOT` 必须由宿主提供，且必须是经过验证的绝对用户项目根目录；不要从 skill bundle、`$PWD`、原始事件，或用户控制的外联内容中推断它。当 subject ID、project root、runtime，或其他发送门控输入缺失时，返回一个 `NEEDS_INPUT` consent-check handoff 到 [consent-registry](../../../protocol/consent-registry/SKILL.md)，其中只包含如果已提供则保留的匿名化 subject ID、所需的 project-root/runtime 能力、意图渠道、资格证据 refs，以及待处理的 dispatch ref；不要声称 `is-suppressed` 已运行，也不要自动恢复投递。始终将后续节奏触达保留为未安排的草稿。当下一次触达到期时，重新解析其临时收件人，为该次触达获取新的、精确的批准，在其 delivery job 中重复每一项 eligibility/runtime/suppression 检查，并且只发送那一次触达。

如果收件人拒绝该 offer 或表示他们不接受 sponsored work，则作废该节奏中所有剩余草稿触达，不要重新命名该 offer 或切换渠道，并且只在行内记录精确限定的偏好（`campaign/offer/category scope`、`observed_at` 和不透明的 `source_ref`）；要将其持久化或将其提议给 creator-registry 需要单独的精确授权。先前的偏好会在其记录的范围内阻止新的节奏，直到更新的、被引用的证据表明 creator 重新开放了该范围；如果旧偏好的范围或取代性证据未知，则以 `NEEDS_INPUT` 失败关闭，而不是编造一个冷却期。对于范围限定的拒绝或仅商业性异议，不要调用全局 `suppress`。明确的停止联系请求、退订、已验证的渠道/提供商垃圾投诉，或 consent withdrawal 会作废所有渠道中的剩余草稿触达，并使用 consent-registry 的直接 deny-only `suppress` 路径，且原因码必须精确且不包含 subject：stop-contact → `user-request`; unsubscribe → `unsubscribe`; verified spam/provider complaint → `complaint`; consent withdrawal → `withdrawal`。如果已验证的 runtime 不可用，则发出其精确的 `immediate-suppress-handoff`，并声明 suppression 尚未记录。

1. **收集外联上下文并锁定身份** —— 捕获活动/产品上下文、临时目标账号/资料定位符、平台、粉丝数、细分领域、报酬类型、预算、交付物和时间线。复用明确沿用的 opaque `creator_ref`，或者仅在其身份关联已验证时使用创作者注册表聚合 ID；否则为该 lineage 仅生成一次随机的 `creator-<UUIDv4>`。绝不要把原始 locator 直接用于 `creator_ref` 或对其哈希。仅当授权来源工件或已验证的注册表链接解析出结果时，才保存 opaque `handle_ref`、`recipient_ref`、`contact_source_ref` 或证据 `source_ref`。否则设置 `identity_status: unresolved`，不保存任何原始 locator 或隐藏映射，设置 `cross_session_locator_required: true`，并要求在发送时再次提供原始 locator。任何已保存的工件或交接内容都只能包含 opaque 的身份/联系/证据 refs 以及司法辖区、渠道、合法依据证据和联系资格结果——绝不包含原始账号、姓名、资料/内容 URL、电子邮件、电话、邮寄地址、提供方 ID 或凭证。重新接触已验证且已建档的创作者时，从已确认的联系路径参考和上次约定费率开始，而不是冷启动提案。模板：[Step 1](references/templates.md#step-1--outreach-parameters)。
2. **创建个性化外联** —— 列出个性化要点（近期内容、风格、受众、价值观、过往合作方），并在使用前为每个事实点附上 `source_ref` 和 `observed_at`。省略或泛化任何无法验证的内容；绝不要编造个人浏览、购买、产品使用或关系历史。然后撰写主消息，以及适合 DM 的简短版本和正式邮件/经纪管理版本。模板：[Step 2](references/templates.md#step-2--personalized-outreach)。*媒体/分析师/猎手目标*：围绕报道方向和近期报道进行个性化，以故事角度开场（而不是报酬提议），逐字保留来自 press-media-relations 工件的禁运条款，并且绝不编造引语或数据——主张必须来自已批准的 message house。
3. **创建跟进序列** —— 起草一个 4 次接触的策略窗口（第 0 天 / 第 3-4 天 / 第 7-8 天 / 第 14 天，然后在第 21 天归档），每次接触都增加新的、有证据支撑的或已批准的价值，并且内容更短。这些范围仅作为计划指导。始终让未来的接触保持未排期；当某次接触到期时，只批准/检查/发送那一次，并附上一个具体的 ISO-8601 `dispatch_at` 以及时区（如果已排期）。在没有阻断性的范围偏好或其他负面信号时，将后续跟进限制在最多 3-4 次，让对方容易拒绝，并且只使用已批准且合格的渠道。新渠道需要各自的资格证据和明确批准。活动/报价拒绝会终止该 cadence，并在内联记录该范围偏好；要持久化它需要单独的明确授权。该范围内后续更晚的 cadence 需要更新的重新开启证据。明确停止联系（`user-request`）、退订（`unsubscribe`）、已核实的垃圾信息/提供方投诉（`complaint`），或同意撤回（`withdrawal`）还会额外触发上面的抑制路径。模板：[Step 3](references/templates.md#step-3--follow-up-sequence)。
4. **提供谈判支持** —— 映射要价/预算差距，然后运用价值交换、范围调整或未来价值策略，并提供可直接使用的脚本和异议/回应表。模板：[Step 4](references/templates.md#step-4--negotiation-guide)。
5. **跟踪外联流水线** —— 记录阶段计数和转化率、按创作者展开的详细流水线、今日优先行动，以及流水线健康状况（响应率、确认率、确认耗时、主要异议）。将报价拒绝记录为该 cadence 的终态，并附带范围偏好。将明确停止联系（`user-request`）、退订（`unsubscribe`）、已核实的渠道/提供方垃圾信息投诉（`complaint`），或同意撤回（`withdrawal`）记录为带有抑制事件/交接参考的终态 no-contact 状态。不要在任一行上保留跟进行动。模板：[Step 5](references/templates.md#step-5--outreach-pipeline-tracker)。主动周期跟踪保留在这里；当一个周期关闭（已确认或已归档）时，将该已关闭结果作为一行 `operation: propose` 更新提供出来，以便单独的明确授权让 [creator-registry](../../../protocol/creator-registry/SKILL.md) 进行协调。

## 示例

**用户**: “为 `creator_ref: creator-042` 撰写外联内容。我提供了一个临时内容定位符，以及 `source_ref: [opaque authorized evidence ref]`、`observed_at: [ISO 8601]` 和 `observable_detail: [exact visible detail]`；仅使用 `[claims-or-brief-ref]` 中已批准的 campaign、offer 和 product 文案。”

**输出**（节选）：

```markdown
## Outreach for `creator_ref: creator-042`

### Personalization Points
- Content item: `[content title or format supported by content_ref]`
- Observable detail: `[exact visible detail from supplied evidence]`
- Evidence: `source_ref: [opaque authorized evidence ref]`  •  `observed_at: [ISO 8601]`

### Primary Message
Subject: `[evidence-backed content topic]` — collaboration idea from `[Brand]`

`[Recipient name resolved transiently at dispatch]`, your `[content item]` `[observable detail supported by content_ref]`. I'm `[Sender]` from `[Brand]`. `[Approved campaign/product sentence from claims-or-brief-ref]` We're offering `[approved compensation]` for `[approved deliverable]`. Open to hearing more?
```

完整的多版本输出、后续跟进节奏、谈判指南和流程追踪器见 [references/templates.md](references/templates.md)。

## 参考资料

- [references/templates.md](references/templates.md) — 五个步骤的填充模板、完整的带注释示例以及外联建议。
- [references/cold-copy-rules.md](references/cold-copy-rules.md) — 硬性冷外联文案规则：首句禁用项、每步句子上限、软性 CTA、观察式表述、第一步不放链接。
- [skill-contract.md](../../../references/skill-contract.md) — 共享约定与 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级与保存路径约定。
- [runtime-invocation.md](../../../references/runtime-invocation.md) — 在对实时抑制查询之前进行安全的 bundle-root 解析和 feature-runtime 验证。
- [CONNECTORS.md](../../../CONNECTORS.md) — 按 connector 类别整理的免费/无密钥数据方案。
- STAR benchmark 评分参考见 [references/star-benchmark.md](../../../references/star-benchmark.md) — 供下游审查使用的质量评分参考。
- [expert-panel.md](../../../references/expert-panel.md) — 用于在发送前压力测试外联文案的多角色评审方法。
- 兄弟技能： [influencer-discovery](../../scout/influencer-discovery/SKILL.md)、[fit-scorer](../../scout/fit-scorer/SKILL.md)、[brief-generator](../../target/brief-generator/SKILL.md)、[contract-helper](../contract-helper/SKILL.md)、[creator-content-auditor](../creator-content-auditor/SKILL.md)。

## 下一个最佳技能

- **主要**： [contract-helper](../contract-helper/SKILL.md) — 一旦确认合作方，就在内容制作前把已达成的商业条款和权利整理进协议。
- **备选**： [creator-content-auditor](../creator-content-auditor/SKILL.md) — 仅在协议/brief 已存在且创作者已经产出草稿内容之后，审核该内容是否可以发布。
- **备选**： [brief-generator](../../target/brief-generator/SKILL.md) — 向希望获得更多细节的创作者发送完整 campaign brief。

终止说明：保留一个已访问集合。如果此链中的某个 skill 在本次会话中已经被调用过，则停止并报告 `chain-complete`，而不是再次运行它。最大转交深度为 3。

## 相关 Skills

- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) - 寻找可联系的影响者
- [fit-scorer](../../scout/fit-scorer/SKILL.md) - 优先排序最先联系谁
- [brief-generator](../../target/brief-generator/SKILL.md) - 向已确认的合作伙伴发送 brief
- [contract-helper](../contract-helper/SKILL.md) - 完成协议签署