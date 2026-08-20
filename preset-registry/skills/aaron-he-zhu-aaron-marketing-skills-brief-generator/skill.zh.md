---
name: brief-generator
slug: brief-generator
displayName: "Brief Generator · 创作简报生成"
summary: "结构化红人简报:交付物、关键信息、创意方向、时间线、披露要求与报酬条款"
description: 'Use when the user asks to "create an influencer brief" or "write a campaign brief"; produces a structured creator brief with deliverables, key messages, creative direction, timeline, disclosure rules, and compensation terms. Not for choosing how to split spend across creators — use budget-optimizer. 达人合作简报/创作者BF'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when the user needs to brief one or more influencers for a campaign, standardize brief formats across a team, onboard ambassador partners, build reusable templates for recurring campaigns, or tighten brief clarity after revision-heavy collaborations. Also fires for platform-specific briefs (TikTok review, Instagram Stories takeover, YouTube integration)."
argument-hint: "<campaign or product> [platform] [content type]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 简报生成器

此技能可帮助你创建清晰、全面的影响者简报，为创作者的成功奠定基础。优秀的简报能够带来更好的内容、更少的修改和更稳固的合作关系。

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

- **读取**：营销活动/产品/平台/交付内容/CTA/时间线/报酬输入，以及 `memory/projections/narrative.json`、`memory/projections/claims.json` 和相关的创作者/渠道投影；HOT 只是指向这些来源的索引。
- **写入**：在对话中生成一份可直接提供给创作者的简报，并在获得许可后写入 `memory/influencer/brief-generator/YYYY-MM-DD-<topic>.md`；尚未解决的声明将成为待授权的声明提案。
- **完成条件**：
  - 简报涵盖所有必需部分（概述、关键信息、交付内容、创意方向、时间线、合规要求、报酬、联系人）。
  - 明确说明披露要求和使用权，并且对于用户已提供输入的内容，不留下任何未解决的占位符。
  - 每个平台的交付内容和数量与用户的要求一致。
  - 关键信息源自已接受的 Narrative 规范，声明在相应上下文中有效或被明确阻止，并且包含依赖项元组。
- **主要后续技能**：[预算优化器](../budget-optimizer/SKILL.md)

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中的标准结构，包括 Narrative/声明依赖项元组。

必填字段：`narrative_canon_id`、`narrative_canon_version`、`claims_projection_offset` 和 `dependency_status: verified | approved-fallback | blocked`。

## 数据源

此技能系列不需要实时集成（第 1 级）。该技能通过向用户询问输入来端到端运行，包括营销活动详情、交付内容、关键信息、时间线和报酬。在提示词中提供这些信息，即可零配置获得完整简报。

如果以下可选连接器可用，则可以丰富简报内容：

- `~~影响者数据库` — 获取创作者账号、受众规模和过往合作记录，以个性化“为什么选择您”部分。
- `~~社交平台分析` — 确认各平台当前的格式规范以及表现最佳的帖子长度。
- `~~CRM` — 获取为品牌大使指定的联系人以及以往的简报版本。

起草前，请读取已接受的 Narrative 和声明投影。声明审批取决于具体上下文：受众、市场、媒体、优惠有效期和必要的免责声明必须匹配。如果没有可用规范，则只能创建经过明确批准的探索性简报，绝不能将其标记为可直接提供给创作者或符合规范。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解各类别经过验证的免费/无密钥方案。所有连接器均非必需。

## 操作说明

当用户请求简报时：

1. **收集简报输入** — 获取营销活动信息、交付内容、关键信息、CTA、时间线和报酬；将 HOT 指针解析到其实际源记录。读取指定偏移量处的 Narrative/声明投影。如果需要创作者的表达风格，请通过 [creator-voice-intake.md](references/creator-voice-intake.md) 收集。
2. **生成专业简报** — 填充主模板，并根据平台进行调整。根据已接受的规范和上下文有效的声明推导关键信息。使用 `[needs source]` 标记尚未解决的措辞，通过 `registry-events.py` 将其作为已授权的 `operation: propose` 事件提交，并在问题解决前阻止其获得可直接提供给创作者的状态。
3. **应用内容类型和营销活动类型变体** — 根据平台调整重点（TikTok 开场钩子/声音、IG Reels/Stories/Feed、YouTube 植入/Shorts），并根据营销活动类型进行调整（发布、评测、活动、品牌大使、赠品）。变体表：[references/brief-templates.md](references/brief-templates.md#brief-variations-by-content-type)。
4. **保存并路由** — 获得许可后，写入包含规范/版本/声明偏移量字段的最终简报。持久性的创作者、渠道、声明或营销活动事实应作为提案路由到各自所属的注册表；不要自动写入 HOT 或规范视图。

披露要求和使用权必须明确说明——一旦用户提供了相关信息，绝不能继续保留占位符。简报是指导原则，而不是脚本：既要尊重创作者的表达风格，也要明确关键传播信息和合规条款。

## 示例

**用户**：“为微型网红创建一份简报，让他们在 Instagram 和 TikTok 上推广我们的新款有机蛋白粉”

**输出**：完整简报——传播信息围绕有机成分和清洁标签展开；交付内容包括 1 条 IG Reel + 1 条 TikTok 视频，并附平台规格；为“晨间日常”/“健身补给”等角度提供创意方向；时间线包含初稿日期和上线日期；要求在文案开头披露 #ad；并授予 12 个月的内容转载/付费使用权。保存至 `memory/influencer/brief-generator/`。

## 参考资料

- 共享契约：[skill-contract.md](../../../references/skill-contract.md)
- 共享状态模型：[state-model.md](../../../references/state-model.md)
- 连接器操作指南：[CONNECTORS.md](../../../CONNECTORS.md)
- STAR 基准（用于评估简报质量时）：[references/star-benchmark.md](../../../references/star-benchmark.md)
- 简报模板与变体（主填充模板、内容类型和活动类型变体、调用模式、技巧）：[brief-templates.md](references/brief-templates.md)
- 创作者风格采集（在编写简报前捕捉真实风格；creator-content-auditor 会读取所捕捉的风格）：[creator-voice-intake.md](references/creator-voice-intake.md)
- 同级技能：
  - [campaign-planner](../campaign-planner/SKILL.md) - 创建本简报所支持的活动
  - [budget-optimizer](../budget-optimizer/SKILL.md) - 在简报涉及的创作者之间分配支出
  - [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) - 审核提交的内容
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 向网红发送简报
  - [contract-helper](../../activate/contract-helper/SKILL.md) - 纳入法律条款

## 下一最佳技能

- **首选**：[budget-optimizer](../budget-optimizer/SKILL.md) - 简报确定交付内容后，设置如何在创作者和平台之间分配支出。
- **备选（同一 Target 系列）**：
  - [campaign-planner](../campaign-planner/SKILL.md) - 如果简报中出现新的交付内容需求，则重新规划活动范围。
  - [outreach-manager](../../activate/outreach-manager/SKILL.md) - 将完成的简报发送给选定的创作者。

**终止说明**：维护一个已访问集合。如果推荐的技能已在本次会话中调用，则停止并报告链已完成，而不是重新运行该技能。任何移交链的最大深度限制为 3。