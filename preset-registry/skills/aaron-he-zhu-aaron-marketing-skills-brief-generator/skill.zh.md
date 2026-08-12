---
name: brief-generator
slug: brief-generator
displayName: "Brief Generator · 创作简报生成"
summary: "结构化红人简报:交付物、关键信息、创意方向、时间线、披露要求与报酬条款"
description: 'Use when the user asks to "create an influencer brief" or "write a campaign brief"; produces a structured creator brief with deliverables, key messages, creative direction, timeline, disclosure rules, and compensation terms. Not for choosing how to split spend across creators — use budget-optimizer. 达人合作简报/创作者BF'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when the user needs to brief one or more influencers for a campaign, standardize brief formats across a team, onboard ambassador partners, build reusable templates for recurring campaigns, or tighten brief clarity after revision-heavy collaborations. Also fires for platform-specific briefs (TikTok review, Instagram Stories takeover, YouTube integration)."
argument-hint: "<campaign or product> [platform] [content type]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 简报生成器

此技能可帮助你创建清晰、全面的网红简报，为创作者的成功奠定基础。优秀的简报能够带来更好的内容、更少的修改和更稳固的合作关系。

## 快速开始

最简调用方式：

```
Create an influencer brief for [campaign]
```

常见场景：

```
Generate a TikTok brief for micro-influencers promoting [product], 1 review video, with disclosure and timeline
```

## 技能契约

- **读取**：营销活动/产品/平台/交付内容/CTA/时间线/报酬等输入，以及 `memory/projections/narrative.json`、`memory/projections/claims.json` 和相关的创作者/渠道投影；HOT 仅作为这些来源的索引。
- **写入**：在对话中生成一份可直接交付创作者的简报，并在获得许可后写入 `memory/influencer/brief-generator/YYYY-MM-DD-<topic>.md`；未解决的声明将转化为授权声明提案。
- **完成条件**：
  - 简报涵盖所有必需部分（概述、关键信息、交付内容、创意方向、时间线、合规要求、报酬、联系人）。
  - 明确说明披露要求和使用权，并且用户已提供输入的内容不得遗留任何未解决的占位符。
  - 各平台的交付内容及数量与用户的要求一致。
  - 关键信息源自已接受的 Narrative 规范，声明在相应上下文中有效或被明确标记为阻塞状态，并且包含依赖元组。
- **主要后续技能**：[预算优化器](../budget-optimizer/SKILL.md)

### 交接摘要

> 按照 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md)中的标准结构输出，包括 Narrative/声明依赖元组。

必填字段：`narrative_canon_id`、`narrative_canon_version`、`claims_projection_offset` 和 `dependency_status: verified | approved-fallback | blocked`。

## 数据源

此技能系列不需要实时集成（第 1 层）。该技能通过向用户询问输入信息来端到端运行，包括营销活动详情、交付内容、关键信息、时间线和报酬。只需在提示词中提供这些信息，无需任何设置即可获得完整简报。

以下可选连接器可在可用时丰富简报内容：

- `~~influencer database` — 获取创作者账号、受众规模和过往合作记录，以个性化“为何选择你”部分。
- `~~social platform analytics` — 确认各平台当前的格式规范和表现最佳的帖子长度。
- `~~CRM` — 获取为品牌大使指定的联系人和此前的简报版本。

起草前，请读取已接受的 Narrative 和声明投影。声明审批取决于具体上下文：受众、市场、媒体、优惠有效期和所需免责声明必须匹配。如果没有可用规范，则只能创建经过明确批准的探索性简报，绝不能标记为可直接交付创作者或符合规范。

有关各类别经过验证的免费/无密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。这些连接器均非必需。

## 说明

当用户请求生成简报时：

1. **收集简报输入** — 获取营销活动信息、交付内容、关键信息、CTA、时间线和报酬；将 HOT 指针解析到其实际源记录。读取指定偏移量处的 Narrative/声明投影。如果需要创作者风格，请通过[创作者风格信息采集](references/creator-voice-intake.md)获取。
2. **生成专业简报** — 填充主模板，并根据平台进行调整。从已接受的规范和在相应上下文中有效的声明中推导关键信息。将未解决的措辞标记为 `[needs source]`，通过 `registry-events.py` 将其作为授权的 `operation: propose` 事件提交，并在问题解决前阻止其获得可直接交付创作者的状态。
3. **应用内容类型和营销活动类型变体** — 根据平台调整侧重点（TikTok 开场吸引点/声音、IG Reels/Stories/Feed、YouTube 植入/Shorts），并针对不同营销活动类型进行调整（发布、评测、活动、品牌大使、赠品活动）。变体表：[references/brief-templates.md](references/brief-templates.md#brief-variations-by-content-type)。
4. **保存并分派** — 获得许可后，写入包含规范/版本/声明偏移量字段的最终简报。持久性的创作者、渠道、声明或营销活动事实应作为提案分派到其所属注册表；不要自动写入 HOT 或规范视图。

披露要求和使用权必须明确说明——一旦用户提供了相关信息，绝不能继续将其保留为占位符。简报是指导原则，而不是脚本：既要尊重创作者的表达风格，也要明确关键讯息和合规条款。

## 示例

**用户**：“为微型影响者创建一份简报，以便在 Instagram 和 TikTok 上推广我们的新款有机蛋白粉”

**输出**：完整简报——围绕有机成分和清洁标签制定传播讯息，交付物包括 1 条 IG Reel + 1 条 TikTok 视频并附带平台规格，为“晨间日常”/“运动补给”等切入角度提供创意方向，时间线包含初稿日期和上线日期，要求在文案开头添加 #ad 披露，并授予 12 个月的转载/付费使用权。保存至 `memory/influencer/brief-generator/`。

## 参考资料

- 共享契约：[skill-contract.md](../../../references/skill-contract.md)
- 共享状态模型：[state-model.md](../../../references/state-model.md)
- 连接器方案：[CONNECTORS.md](../../../CONNECTORS.md)
- STAR 基准（用于评估简报质量时）：[references/star-benchmark.md](../../../references/star-benchmark.md)
- 简报模板和变体（主填充模板、内容类型和活动类型变体、调用模式、技巧）：[brief-templates.md](references/brief-templates.md)
- 创作者表达风格采集（在编写简报前捕捉真实表达风格；creator-content-auditor 会读取所采集的表达风格）：[creator-voice-intake.md](references/creator-voice-intake.md)
- 同级技能：
  - [campaign-planner](../campaign-planner/SKILL.md) - 创建此简报所支持的活动
  - [budget-optimizer](../budget-optimizer/SKILL.md) - 在简报涉及的创作者之间分配支出
  - [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) - 审核提交的内容
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 向影响者发送简报
  - [contract-helper](../../activate/contract-helper/SKILL.md) - 纳入法律条款

## 下一最佳技能

- **首选**：[budget-optimizer](../budget-optimizer/SKILL.md) - 简报定义交付物后，确定如何在创作者和平台之间分配支出。
- **备选（同一 Target 技能族）**：
  - [campaign-planner](../campaign-planner/SKILL.md) - 如果简报揭示了新的交付物需求，则重新规划活动范围。
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 将完成的简报发送给选定的创作者。

**终止说明**：维护一个 visited-set。如果推荐的技能已在本会话中调用过，则停止并报告 chain-complete，而不要再次运行该技能。任何交接链的 max-depth 上限均为 3。