---
name: campaign-planner
slug: aaron-campaign-planner
displayName: "Campaign Planner · 活动规划"
summary: "红人活动整体规划:目标、阶段、创作者组合、时间线与风险预案"
description: 'Use when the user asks to "plan an influencer campaign", "build a campaign blueprint", or "launch a product with creators"; produces campaign objectives, platform and influencer-tier strategy, content requirements, a phased timeline, budget allocation, and KPI targets. Not for writing individual creator briefs — use brief-generator; not for the overall product-launch plan (tiering, calendar, press, community day) — use launch-tier-planner, which hands this skill the creator lane. A launch request that does not mention creators routes to the launch discipline, not here. 达人营销策划/种草方案'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning a new influencer campaign, launching a product with influencer support, building seasonal or tentpole activations, designing always-on creator programs, restructuring an underperforming campaign, or preparing a campaign plan to present to stakeholders. Activate when the user gives a brand, budget, audience, or timeframe and wants the full strategy-to-execution blueprint before briefs or outreach begin."
argument-hint: "<brand or product> [budget] [platform] [timeframe]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 营销活动规划器

设计从策略到执行计划的达人营销活动——提供一份将业务目标与创意执行紧密结合的可落地蓝图。

**范围边界——产品发布**：此技能负责产品发布中的**创作者渠道**。发布本身——级别/类型决策、发布日历、媒体传播、社区发布日、就绪门禁——属于发布专业领域（[launch-tier-planner](../../../launch/research/launch-tier-planner/SKILL.md) 及其同类技能）；该领域会根据 [launch-registry](../../../protocol/launch-registry/SKILL.md) 中的日期和阶段，将与之对齐的创作者渠道子计划交接给此技能。“借助创作者发布产品”从这里开始；“发布产品”则从那里开始。

## 快速开始

```
Create an influencer campaign plan for [product launch]
```

```
Plan an influencer campaign for [brand] with [budget] targeting [audience] during [timeframe]
```

## 技能契约

- **读取**：用户提供的品牌和产品详情、目标受众、营销活动类型、预算、时间线以及任何约束条件。如果 `memory-management` 处于启用状态，则从热缓存加载以往的受众画像和历史营销活动基准。
- **写入**：将营销活动计划文档保存到 `memory/influencer/campaign-planner/YYYY-MM-DD-<topic>.md`。
- **提升**：将持久性事实（营销活动名称、主要目标、总预算、上线日期、KPI 目标）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 目标符合 SMART 原则，并明确定义成功和失败标准。
  - 达人组合、内容交付物、时间线、预算和 KPI 均以具体数字指定，而非使用占位符。
  - 计划明确下一步（生成简报）以及任何待审批事项。
- **主要后续技能**：[brief-generator](../brief-generator/SKILL.md)

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此技能系列属于第 1 级：每项技能无需实时集成即可运行。直接提供品牌、受众、预算和时间线，计划便会根据你的输入生成。

在可用时，以下可选连接器可增强计划：

- `~~influencer database`——确定达人组合规模，并验证各层级的粉丝数范围。
- `~~social platform analytics`——设置各平台特定的触达量和互动率基准。
- `~~CRM`——使转化目标和归因方式与现有管道数据保持一致。
- `~~analytics`——提取历史营销活动实际数据，以制定切合实际的 KPI 和预算效率目标。

有关各类别的免费/免密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。如果没有任何连接器，请向用户询问缺失的输入，然后继续执行。

## 说明

按顺序执行以下九个步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一个填写模板——复制相应区块，将每个方括号替换为真实数字或值（最终计划中不得保留占位符），并在第 9 步中完成组装。

1. **收集营销活动需求**——记录品牌、价值主张、受众、营销活动类型、时间线、预算和约束条件（模板 §1）。
2. **定义目标**——制定一个符合 SMART 原则的主要目标及若干次要目标，并明确定义成功和失败标准（模板 §2）。
3. **制定策略**——确定核心创意、策略陈述、受众、关键信息、营销活动支柱、平台分配和差异化定位（模板 §3）。
4. **定义达人标准**——确定层级组合、必备及优选筛选标准、排除条件、理想画像和合作关系类型。根据 [references/influencer-tiers.md](references/influencer-tiers.md) 验证粉丝数范围（模板 §4）。
5. **规划内容要求**——确定按平台/格式划分的交付物、必需元素、创意方向、主题和审批链（模板 §5）。
6. **创建时间线**——确定关键日期、分为四个阶段的逐周计划和甘特图视图（模板 §6）。
7. **分配预算**——按类别、达人层级和平台进行预算细分，并制定 CPM/CPE/单项内容成本效率目标（模板 §7）。
8. **建立成功指标**——确定主要 KPI 与基准、次要指标、转化指标和报告频率（模板 §8）。
9. **汇编计划文档**——包括执行摘要、上述完整章节，以及含风险缓解措施的附录（模板 §9）。保存至“写入”路径，并将持久性事实提升至热缓存。

## 示例

**用户**：“为一款面向 TikTok 和 Instagram 上 Z 世代、预算为 5 万美元的新款可持续运动鞋制定营销活动计划”

**输出**：一份完整的计划，包括可持续性信息传达、以微型网红为主的组合、聚焦 UGC 的内容、分阶段的发布时间线，以及通过促销码进行转化跟踪。（更完整的演练请参阅 [references/templates.md](references/templates.md#worked-example)。）

## 参考资料

- [references/templates.md](references/templates.md) — 包含全部九个步骤的填空模板、完整示例和成功技巧。
- [references/influencer-tiers.md](references/influencer-tiers.md) — 网红、联盟推广者与创作者的决策表，以及纳米型/微型/中型/宏观型层级定义；`fit-scorer` 和 `budget-optimizer` 可查阅此文件。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接架构。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无需密钥数据方案。
- [audience-mapper](../../scout/audience-mapper/SKILL.md) — 定义此计划所服务的目标受众。
- [brief-generator](../brief-generator/SKILL.md) — 将计划转化为面向各网红的简报。
- [budget-optimizer](../budget-optimizer/SKILL.md) — 优化预算分配。
- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 寻找符合条件的网红。

## 下一最佳技能

- **首选**：[brief-generator](../brief-generator/SKILL.md) — 将已批准的计划转化为具体的网红简报。
- **备选**：[budget-optimizer](../budget-optimizer/SKILL.md) — 在最终确定计划前，对预算拆分进行压力测试和优化。
- **备选**：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 根据此处定义的筛选条件创建候选名单。

终止说明：维护一个包含本次会话中已调用技能的已访问集合。如果首选的下一技能已在本次会话中运行，则停止并报告技能链已完成，而不要再次调用。从原始请求开始，技能链深度不得超过 3 跳。