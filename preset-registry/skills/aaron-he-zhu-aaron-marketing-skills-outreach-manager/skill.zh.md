---
name: outreach-manager
slug: outreach-manager
displayName: "Outreach Manager · 建联外联管理"
summary: "红人及媒体建联:分层触达序列、跟进节奏与回复率优化"
description: 'Use when the user asks to "write influencer outreach", "follow up with a creator", "pitch a journalist, hunter, or launch partner", or "negotiate partnership terms"; produces personalized pitches, multi-touch follow-up sequences, negotiation scripts with objection handling, and a status pipeline tracker — the shared outreach mechanics engine for creator, media/analyst, launch-partner, and social-selling / advocate-recruitment targets. Not for finalizing signed agreements — use contract-helper; not for media-list tiering, embargo terms, or press-release structure — use press-media-relations. 达人邀约建联/合作谈判话术'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate the skill when the user wants to contact a creator, journalist, analyst, hunter, or launch partner; draft or personalize a pitch message; build a follow-up cadence for non-responders; re-engage a past partner; negotiate rate or scope; handle pricing objections; or track outreach status across a target list. For media targets the list/angle/embargo artifact comes from press-media-relations — this skill executes the pitch mechanics."
argument-hint: "<influencer handle or list> [platform] [budget]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 外联管理器

撰写个性化、专业且持之以恒的外联信息；管理谈判；跟踪关系进展。其核心领域是影响者（创作者）外联，而同一套机制引擎——个性化、多触点节奏、谈判话术、管线跟踪——也适用于以下目标：当 [press-media-relations](../../../launch/mobilize/press-media-relations/SKILL.md) 移交媒体名单、沟通角度和禁发条款时，服务媒体、分析师和发布合作伙伴目标；当 [social-selling-planner](../../../social/host/social-selling-planner/SKILL.md) 或 [advocacy-program-designer](../../../social/craft/advocacy-program-designer/SKILL.md) 移交一条已建立初步联系的一对一线索时，服务社交销售和倡导者招募目标。名单、沟通角度和禁发条款仍由移交技能负责；本技能负责推介执行。

## 快速开始

最简调用方式：

```
Write an outreach message to @[influencer] for [campaign]
```

就诉求与预算之间的差距进行谈判：

```
Help me negotiate with @[influencer] who is asking for $[X] when our budget is $[Y]
```

## 技能契约

- **读取**：目标影响者账号（一个或多个）、平台、粉丝数量、细分领域；活动和产品背景；报酬类型与预算；交付内容和时间安排；用户提供或从记忆中加载的任何既往联系记录。在进行任何外联之前，请检查 `memory/creators/<handle-slug>.md`——即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录——以获取已确认的联系方式、最近一次商定的费率，以及谈判/回复历史。
- **写入**：将外联产物（推介信息、跟进序列、谈判指南、管线跟踪器）写入 `memory/influencer/outreach-manager/YYYY-MM-DD-<topic>.md`。当一个周期结束时，通过向 `registry-events.py` 发出经授权的 `operation: propose` 请求，将结束结果（最终商定的费率、回复历史、已确认的联系方式）作为单行更新写入 `memory/events/creators.ndjson`——只有 `creator-registry` 可以写入规范名册记录。
- **提升**：将持久性事实（已确认的合作伙伴、商定的费率、主要异议模式、回复率基线）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 每位目标影响者都有一份个性化推介信息（以及至少一个变体）。
  - 为每位已联系的创作者记录跟进节奏和管线状态。
  - 标记已确认的合作伙伴及商定条款，以便移交。
- **主要后续技能**：[creator-content-auditor](../creator-content-auditor/SKILL.md)

### 移交摘要

> 输出 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中规定的标准格式。

## 数据源

此系列无需实时集成（第 1 层）。该技能完全基于你提供的输入运行——粘贴影响者账号、粉丝数量、细分领域、预算和交付内容，即可在不连接任何工具的情况下生成所有产物。

如果连接器可以加快工作，请使用以下 `~~` 占位符：

- `~~influencer database`——提取账号、粉丝数量、细分领域和过往合作信息，而无需手动输入。
- `~~social platform analytics`——核实受众人口统计信息和近期帖子，以便进行个性化处理。
- `~~CRM`——同步管线状态、上次联系日期和后续行动。
- `~~email/DM tool`——安排并发送跟进序列。

有关每个类别的免费/无密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。无需集成；缺少集成时，直接向用户索取输入。缺少目标对象或营销活动详情并不妨碍创建可撤销的草稿：使用明确的方括号占位符，泛化任何未经验证的个性化内容，并指出完成草稿所需的最少输入。

## 说明

当用户请求外联协助时，请执行以下步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一个填空模板——复制匹配的区块并替换占位符。在发布任何消息之前，应用 [references/cold-copy-rules.md](references/cold-copy-rules.md) 中的硬性文案规则。

**草拟/发送边界**：草拟是可撤销的；发送或安排发送属于外部副作用。即使缺少候选名单或个性化事实，也应生成一份标记为 `DRAFT — NOT SENT` 的内联首次触达草稿，使用明确的占位符且不虚构事实，然后说明个性化处理仍需要哪些信息。当能够安全地生成占位符草稿时，绝不能仅停留在索取输入。除非用户明确批准确切的收件人、渠道以及消息或触达节奏，否则不得发送或安排发送任何内容。

1. **收集外联背景信息**——记录营销活动/产品背景、目标账号、平台、粉丝数、垂直领域、报酬类型、预算、交付内容和时间线。当 `memory/creators/<handle-slug>.md` 名册记录存在时，首先加载该记录——重新接洽名册中的创作者时，应从已确认的联系方式和上次约定的费率开始，而不是采用冷启动推介。模板：[步骤 1](references/templates.md#step-1--outreach-parameters)。
2. **创建个性化外联内容**——列出个性化要点（近期内容、风格、受众、价值观、过往合作伙伴），然后撰写主要消息，以及适合私信的简短版本和正式的电子邮件/经纪团队版本。模板：[步骤 2](references/templates.md#step-2--personalized-outreach)。*媒体/分析师/猎手类目标对象*：根据其报道领域和近期报道进行个性化，以故事角度开场（而非报酬提议），逐字沿用新闻媒体关系产物中的禁发条款，并且绝不虚构引语或数据——所有主张均来自经批准的信息框架。
3. **创建跟进序列**——构建 4 次触达的节奏（第 0 天 / 第 3-4 天 / 第 7-8 天 / 第 14 天，然后在第 21 天归档），每次触达都应增加新价值并变得更简短。跟进次数上限为 3-4 次；让对方能够轻松拒绝。模板：[步骤 3](references/templates.md#step-3--follow-up-sequence)。
4. **提供谈判支持**——梳理诉求与预算之间的差距，然后运用价值交换、范围调整或未来价值策略，并提供可直接使用的话术和异议/回应表。模板：[步骤 4](references/templates.md#step-4--negotiation-guide)。
5. **跟踪外联管道**——记录各阶段数量和转化率、每位创作者的详细管道、今日优先行动，以及管道健康状况（回复率、确认率、确认耗时、主要异议）。模板：[步骤 5](references/templates.md#step-5--outreach-pipeline-tracker)。进行中的周期跟踪记录在此处；当一个周期结束（已确认或已归档）时，通过授权的 `operation: propose` 请求将结束结果作为单行更新提交给 `registry-events.py`，由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 进行协调，并写入 `memory/events/creators.ndjson`。

## 示例

**用户**：“为 @sustainablesarah（Instagram 粉丝 4.5 万，环保生活方式）撰写我们有机护肤品发布活动的外联文案”

**输出**（节选）：

```markdown
## Outreach for @sustainablesarah

### Personalization Points
- Recent post: "5 swaps for a zero-waste bathroom"  •  Style: educational, authentic  •  Past partners: Grove Collaborative

### Primary Message
Subject: Love your zero-waste content – collab with [Brand]?

Hi Sarah! I just watched your "zero-waste bathroom" post and added reusable cotton rounds to my cart 😊 I'm [Name] from [Brand] — organic skincare in fully compostable packaging. We're launching a new collection and thought of you. We'd love to send the full line, and if you love it, partner on a post + Stories. Offering $[X] plus product and full creative freedom. Interested?
```

完整的多版本输出、跟进节奏、谈判指南和流程跟踪器位于 [references/templates.md](references/templates.md)。

## 参考资料

- [references/templates.md](references/templates.md) — 包含全部五个步骤的填空模板、完整的实际示例和外联技巧。
- [references/cold-copy-rules.md](references/cold-copy-rules.md) — 严格的冷外联文案规则：首句禁忌、每个步骤的句数上限、柔性行动号召、观察式表述，以及第一步不放链接。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费且无需密钥的数据方案。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR 基准评分 — 供下游审核使用的质量评分参考。
- [expert-panel.md](../../../references/expert-panel.md) — 在发送前对外联文案进行压力测试的多角色审核方法。
- 同级技能：[influencer-discovery](../../scout/influencer-discovery/SKILL.md)、[fit-scorer](../../scout/fit-scorer/SKILL.md)、[brief-generator](../../target/brief-generator/SKILL.md)、[contract-helper](../contract-helper/SKILL.md)、[creator-content-auditor](../creator-content-auditor/SKILL.md)。

## 下一最佳技能

- **首选**：[creator-content-auditor](../creator-content-auditor/SKILL.md) — 合作伙伴确认并创建内容后，在发布前根据简报审核草稿。
- **备选**：[contract-helper](../contract-helper/SKILL.md) — 将商定的条款最终落实为合作协议。
- **备选**：[brief-generator](../../target/brief-generator/SKILL.md) — 向要求了解更多细节的创作者发送完整的活动简报。

终止说明：维护一个已访问集合。如果此链中的某项技能在本会话中已被调用，则停止并报告链已完成，而不是重新运行。最大交接深度为 3。

## 相关技能

- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) - 查找要联系的影响者
- [fit-scorer](../../scout/fit-scorer/SKILL.md) - 确定优先联系顺序
- [brief-generator](../../target/brief-generator/SKILL.md) - 向已确认的合作伙伴发送简报
- [contract-helper](../contract-helper/SKILL.md) - 最终敲定协议