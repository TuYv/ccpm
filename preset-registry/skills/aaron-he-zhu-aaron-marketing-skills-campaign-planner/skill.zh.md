---
name: campaign-planner
slug: aaron-campaign-planner
displayName: "Campaign Planner · 活动规划"
summary: "红人活动整体规划:目标、阶段、创作者组合、时间线与风险预案"
description: 'Use when the user asks to "plan an influencer campaign", "build a campaign blueprint", or "launch a product with creators"; produces campaign objectives, platform and influencer-tier strategy, content requirements, a phased timeline, budget allocation, and KPI targets. Not for writing individual creator briefs — use brief-generator; not for the overall product-launch plan (tiering, calendar, press, community day) — use launch-tier-planner, which hands this skill the creator lane. A launch request that does not mention creators routes to the launch discipline, not here. 达人营销策划/种草方案'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning a new influencer campaign, launching a product with influencer support, building seasonal or tentpole activations, designing always-on creator programs, restructuring an underperforming campaign, or preparing a campaign plan to present to stakeholders. Activate when the user gives a brand, budget, audience, or timeframe and wants the full strategy-to-execution blueprint before briefs or outreach begin."
argument-hint: "<brand or product> [budget] [platform] [timeframe]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 营销活动规划器

设计从策略到执行计划的达人营销活动——一份将业务目标与创意执行紧密结合的可操作蓝图。

**范围边界——产品发布**：此技能负责产品发布中的**创作者渠道**。产品发布本身——级别/类型决策、发布日历、媒体传播、社区发布日、就绪门禁——归属于发布专业领域（[launch-tier-planner](../../../launch/research/launch-tier-planner/SKILL.md) 及其同级技能）；该领域会将与 [launch-registry](../../../protocol/launch-registry/SKILL.md) 中日期和阶段保持一致的创作者渠道子计划移交给此技能。“借助创作者发布产品”从这里开始；“发布产品”从那里开始。

## 快速开始

```
Create an influencer campaign plan for [product launch]
```

```
Plan an influencer campaign for [brand] with [budget] targeting [audience] during [timeframe]
```

## 技能契约

- **读取**：用户提供的品牌和产品详情、目标受众、活动类型、预算、时间线以及任何约束条件。如果 `memory-management` 处于激活状态，则从热缓存加载过往受众画像和历史活动基准。
- **写入**：将营销活动计划文档保存至 `memory/influencer/campaign-planner/YYYY-MM-DD-<topic>.md`。
- **提升**：将持久性事实（活动名称、主要目标、总预算、上线日期、KPI 目标）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 目标符合 SMART 原则，并明确规定成功和失败的定义。
  - 达人组合、内容交付物、时间线、预算和 KPI 均使用具体数字说明，而非占位符。
  - 计划明确说明下一步（生成简报）以及所有待审批事项。
- **主要后续技能**：[brief-generator](../brief-generator/SKILL.md)

### 移交摘要

> 输出 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中规定的标准格式。

## 数据源

此系列属于 Tier 1：所有技能均无需实时集成即可运行。直接提供品牌、受众、预算和时间线，计划便会根据你的输入生成。

以下可选连接器可在可用时强化计划：

- `~~influencer database`——确定达人组合规模并验证各层级的粉丝数范围。
- `~~social platform analytics`——设置特定平台的触达量和互动率基准。
- `~~CRM`——使转化目标和归因方式与现有销售管道数据保持一致。
- `~~analytics`——提取历史活动实际数据，以制定切合实际的 KPI 和预算效率目标。

有关各类别的免费/无密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。如果没有任何连接器，请向用户询问缺失的输入信息，然后继续执行。

## 说明

按顺序完成以下九个步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一份待填写模板——复制对应区块，用真实数字或值替换每个方括号中的内容（最终计划中不得保留占位符），并在第 9 步中汇总。

1. **收集活动需求**——记录品牌、价值主张、受众、活动类型、时间线、预算和约束条件（模板 §1）。
2. **定义目标**——设定一个符合 SMART 原则的主要目标及若干次要目标，并明确规定成功和失败的定义（模板 §2）。
3. **制定策略**——确定核心创意、策略陈述、受众、关键信息、活动支柱、平台分配和差异化策略（模板 §3）。
4. **定义达人标准**——确定层级组合、必备及优先选择标准、排除条件、理想画像和合作关系类型。根据 [references/influencer-tiers.md](references/influencer-tiers.md) 验证粉丝数范围（模板 §4）。
5. **规划内容要求**——明确各平台/格式的交付物、必备元素、创意方向、主题和审批链（模板 §5）。
6. **制定时间线**——确定关键日期、分四阶段的逐周计划以及甘特图视图（模板 §6）。
7. **分配预算**——按类别、达人层级和平台细分预算，并设定 CPM/CPE/单条内容成本效率目标（模板 §7）。
8. **建立成功指标**——确定主要 KPI 及其基准、次要指标、转化指标和报告频率（模板 §8）。
9. **编制计划文档**——包括执行摘要、上述完整章节，以及包含风险缓解措施的附录（模板 §9）。将其保存至写入路径，并把持久性事实提升至热缓存。

## 示例

**用户**：“为一款面向 Z 世代、在 TikTok 和 Instagram 上推广、预算为 5 万美元的新款可持续运动鞋制定营销活动计划”

**输出**：一份完整的计划，包含可持续发展信息传达、以微型影响者为主的组合、以 UGC 为重点的内容、分阶段发布的时间线，以及通过促销代码进行转化跟踪。（更完整的演示见 [references/templates.md](references/templates.md#worked-example)。）

## 参考资料

- [references/templates.md](references/templates.md) — 九个步骤的填空模板、完整示例及成功要点。
- [references/influencer-tiers.md](references/influencer-tiers.md) — 影响者、联盟推广者与创作者的决策表，以及纳米型/微型/中型/宏观型层级定义；`fit-scorer` 和 `budget-optimizer` 可查阅此文件。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接架构。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 按连接器类别整理的免费/无需密钥的数据方案。
- [audience-mapper](../../scout/audience-mapper/SKILL.md) — 定义此计划所服务的目标受众。
- [brief-generator](../brief-generator/SKILL.md) — 将计划转换为针对每位影响者的简报。
- [budget-optimizer](../budget-optimizer/SKILL.md) — 优化预算分配。
- [influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 查找符合条件的影响者。

## 下一最佳 Skill

- **首选**：[brief-generator](../brief-generator/SKILL.md) — 将已批准的计划转换为具体的影响者简报。
- **备选**：[budget-optimizer](../budget-optimizer/SKILL.md) — 在最终确定计划前，对预算分配进行压力测试和优化。
- **备选**：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 根据此处定义的筛选标准建立候选名单。

终止说明：维护一个记录本次会话中已调用 Skill 的集合。如果首选的下一 Skill 在本次会话中已经运行，则停止并报告链条已完成，而不是再次调用。从原始请求开始，链式调用不得超过 3 跳。