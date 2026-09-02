---
name: brief-generator
slug: brief-generator
displayName: "Brief Generator · 创作简报生成"
summary: "结构化红人简报:交付物、关键信息、创意方向、时间线、披露要求与报酬条款"
description: 'Use when the user asks to "create an influencer brief" or "write a campaign brief"; produces a structured creator brief with deliverables, key messages, creative direction, timeline, disclosure rules, and compensation terms. Not for choosing how to split spend across creators — use budget-optimizer. 达人合作简报/创作者BF'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when the user needs to brief one or more influencers for a campaign, standardize brief formats across a team, onboard ambassador partners, build reusable templates for recurring campaigns, or tighten brief clarity after revision-heavy collaborations. Also fires for platform-specific briefs (TikTok review, Instagram Stories takeover, YouTube integration)."
argument-hint: "<campaign or product> [platform] [content type]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 简报生成器

这个 skill 帮助你创建清晰、全面的 influencer brief，让创作者更容易成功。好的 brief 能带来更好的内容、更少的修改，以及更强的合作关系。

## 快速开始

最短调用方式：

```
Create an influencer brief for [campaign]
```

常见场景：

```
Generate a TikTok brief for micro-influencers promoting [product], 1 review video, with disclosure and timeline
```

## Skill Contract

- **Reads**: campaign/product/platform/deliverable/CTA/timeline/compensation inputs; stable opaque `creator_ref`, `brand_ref`, `page_ref`, `shipping_ref`, `contact_ref`, `brand_asset_ref`, `hashtag_ref`, `promo_code_ref`, and (when voice is used) `voice_source_ref`; plus `memory/projections/narrative.json`, `memory/projections/claims.json`, and relevant creator/channel projections. HOT 只是这些来源的索引。原始的 creator/brand 名称和 handles、page/asset-folder URLs、shipping addresses、contact names/emails/phones、hashtags、promo codes，以及 voice-source locators 仅作为临时渲染/发送输入。
- **Writes**: 默认返回一个 reference-safe 的 creator brief 内联；只有在获得精确授权时才将其保存到 `memory/influencer/brief-generator/YYYY-MM-DD-<topic>.md`。已保存的工件和交接材料表示 creator、brand、landing destination、shipping destination、contact path、assets、hashtags、promo terms 和 voice provenance，并且仅使用 `creator_ref`, `brand_ref`, `page_ref`, `shipping_ref`, `contact_ref`, `brand_asset_ref`, `hashtag_ref`, `promo_code_ref`, and `voice_source_ref`；绝不持久化它们的原始身份/address/URL/contact/content 值，也不保留隐藏映射。每一个未解析的 claim 提议都需要单独的精确 `operation: propose` 授权；brief-save 批准不涵盖它。
- **Done when**:
  - brief 覆盖所有必需部分（overview、key messages、deliverables、creative direction、timeline、compliance、compensation、contact）。
  - disclosure 要求和 usage rights 被明确写出，没有留下用户已提供输入却仍未解决的占位符。
  - deliverables 和数量与用户按平台的要求一致。
  - Key messages 来源于已接受的 Narrative canon，claims 在上下文中有效或被明显阻断，并且 dependency tuple 已存在。
  - 任何已保存/交接的 copy 都只引用 reference，且创作者交付在单独的 outreach exact-send gate 通过之前仍不得发送。
- **Primary next skill**: [budget-optimizer](../budget-optimizer/SKILL.md)

### Handoff Summary

> 采用 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中的标准结构，并包含 Narrative/claims dependency tuple。

必填字段：`narrative_canon_id`, `narrative_canon_version`, `claims_projection_offset`, 以及适用的 opaque `creator_ref`, `brand_ref`, `page_ref`, `shipping_ref`, `contact_ref`, `brand_asset_ref`, `hashtag_ref`, `promo_code_ref`, 和 `voice_source_ref` 值。不要包含它们解析后的原始值。

## 数据源

这个家族不需要任何实时集成（Tier 1）。该 skill 可以完全通过向用户询问输入来端到端完成：campaign 详情、deliverables、关键信息、时间线和 compensation。把这些提供到 prompt 中，你就能在零配置的情况下得到一份完整 brief。

在可用时，可以用这些可选 connector 为 brief 增强内容：

- `~~influencer database` — 临时解析 creator 详情用于个性化，同时在已保存的 brief/handoff 中仅保留 `creator_ref` 和不透明的 evidence refs。
- `~~social platform analytics` — 确认当前的格式规格以及各平台表现最佳的帖子长度。
- `~~CRM` — 获取分配的 `contact_ref` 和之前的 brief 版本；仅在授权的 dispatch 期间临时解析原始联系人详情。

在起草前先阅读已接受的 Narrative 和 claims projections。claim 批准具有上下文相关性：受众、市场、媒体、offer window 和所需免责声明必须匹配。没有可用 canon 只允许明确批准的 exploratory brief，绝不允许 creator-ready/on-canon 标签。

参见 [CONNECTORS.md](../../../CONNECTORS.md)，获取按类别划分且已验证的 free/keyless recipe。没有任何一项是必需的。

## 指令

当用户请求 brief 时：

1. **收集 brief 输入** — 捕获 campaign 信息、deliverables、关键信息、CTA、时间线和 compensation，以及适用的 `creator_ref`、`brand_ref`、`page_ref`、`shipping_ref`、`contact_ref` 和 `voice_source_ref`；将 HOT pointers 解析为其实际源记录。读取指定偏移处的 Narrative/claims projections。将原始身份、页面、地址、联系人和 voice-source 定位器保持为临时数据。如果需要 creator voice，请通过 [creator-voice-intake.md](references/creator-voice-intake.md) 捕获 reference-safe intake。
2. **生成专业 brief** — 填充 master template 并针对平台进行调整。根据已接受的 canon 和上下文有效 claims 派生关键信息。将未解析的措辞标记为 `[needs source]`，提供一个精确的 `registry-events.py operation: propose` 请求以便单独授权，并在问题解决前阻止 creator-ready 状态。
3. **应用 content-type 和 campaign-type 变体** — 根据平台（TikTok hook/sounds、IG Reels/Stories/Feed、YouTube integration/Shorts）以及 campaign 类型（launch、review、event、ambassador、giveaway）调整重点。变体表：[references/brief-templates.md](references/brief-templates.md#brief-variations-by-content-type)。
4. **保存并路由** — 以内联形式返回 reference-safe brief。获得精确权限后，写入 canon/version/claims-offset 字段，并且只写入上述不透明的 identity/destination/contact/voice refs。可持久化的 creator、channel、claim 或 campaign 事实只能作为分别授权的 proposal 路由到其所属 registry；不要自动写入 HOT 或 canonical 视图。
5. **准备交付，不要暗示发送** — `Send`、“deliver” 或 “share with creators” 请求/标签只会创建一个待处理的 outreach handoff；它并不授权 delivery。将 brief 交给 [outreach-manager](../../activate/outreach-manager/SKILL.md)，仅在 delivery job 内临时解析原始 recipient/brand/page/contact 值，并传递其精确的单次触发门槛：分别批准精确的 `recipient_ref`、channel、最终渲染的 message/brief payload，以及在安排发送时一个具体的带时区 ISO-8601 `dispatch_at`，然后在 provider 调用前立即运行新的 eligibility 和 live-suppression 检查。任何 recipient、channel、payload 或 schedule 的变更都需要新的批准。

披露和使用权必须明确写出——一旦用户提供了输入，就绝不能继续保留占位符。Brief 只是指导，不是脚本：要尊重创作者的声音，同时锁定关键信息和合规条款。

## 示例

**用户**: “为我们的有机蛋白粉创建一个 brief：1 个 IG Reel + 1 个 TikTok，morning-routine/workout-fuel 角度，已批准的 clean-label claims，草稿截至 15 Sep，正式上线 22 Sep，费用 $1,200，并且在美国拥有 12 个月 repost/paid rights。”

**输出**: 基于所提供的 claims、deliverables、日期、费用、territory 和 rights scope，生成完整的、可直接引用且安全的 inline brief，并附上带日期的官方 platform specs 或 `TBD/NEEDS_INPUT`。提供确切的 `memory/influencer/brief-generator/YYYY-MM-DD-<topic>.md` 路径；不要在未获得精确授权的情况下声称它已保存。保存或 `Send` 标签都不会授权交付；outreach 只有在其单独的精确发送 gate 通过后，才会处理原始渲染结果。

## 参考材料

- Shared contract: [skill-contract.md](../../../references/skill-contract.md)
- Shared state model: [state-model.md](../../../references/state-model.md)
- Connector recipes: [CONNECTORS.md](../../../CONNECTORS.md)
- STAR benchmark (when scoring brief quality): [references/star-benchmark.md](../../../references/star-benchmark.md)
- Brief templates & variations (master fill-in template, content-type and campaign-type variations, invoke patterns, tips): [brief-templates.md](references/brief-templates.md)
- Creator voice intake (capture real voice before briefing; creator-content-auditor reads the captured voice): [creator-voice-intake.md](references/creator-voice-intake.md)
- Sibling skills:
  - [campaign-planner](../campaign-planner/SKILL.md) - 创建该 brief 所支持的 campaign
  - [budget-optimizer](../budget-optimizer/SKILL.md) - 在 brief 涉及的创作者和平台之间分配预算
  - [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) - 审核已提交内容
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 传递 brief 给 influencers
  - [contract-helper](../../activate/contract-helper/SKILL.md) - 包含法律条款

## 下一个最佳技能

- **Primary**: [budget-optimizer](../budget-optimizer/SKILL.md) - 一旦 brief 明确了 deliverables，就设置预算在各创作者和平台之间如何拆分。
- **Alternates (same Target family)**:
  - [campaign-planner](../campaign-planner/SKILL.md) - 如果 brief 暴露出新的 deliverable 需求，则重新规划 campaign 范围。
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 准备并且仅在其精确的单次授权/preflight 之后，将完成的 brief 发送给选定创作者。

**Termination note**: 维护一个 visited-set。如果某个推荐技能在本 session 中已经被调用过，则停止并报告 chain-complete，而不是重新运行它。将任何 handoff chain 的最大深度限制为 3。