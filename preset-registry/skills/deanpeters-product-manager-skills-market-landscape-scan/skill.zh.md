---
name: market-landscape-scan
argument-hint: "[market or problem space, and the decision it supports]"
description: "Map a market's segments, players, substitutes, and whitespace with cited evidence. Use when entering or re-evaluating a market before sizing, positioning, or picking competitors to study."
intent: >-
  Autonomous market discovery: map how buyers segment the market, who plays where (direct, adjacent,
  substitutes, emerging), where the money and momentum are, and whether apparent whitespace is
  opportunity or dead zone — with labeled evidence, so sizing and positioning start from structure
  instead of vibes.
type: workflow
theme: market-intelligence
best_for:
  - "Mapping who plays in a market before committing to enter or re-position"
  - "Scoping a new product line with a defensible view of segments and substitutes"
  - "Producing the landscape view that feeds TAM/SAM/SOM sizing and competitor deep-dives"
scenarios:
  - "We're considering a move into contract-analytics tooling — map that market for me"
  - "My exec team keeps citing an analyst quadrant; show me how buyers actually segment this space"
estimated_time: "20-40 min per run"
---
# 市场格局扫描

## 目的

通过工作流而非一次性回答来描绘市场结构：**搜索计划 → 市场细分 →
参与者映射 → 市场动态 → 空白机会 → 后续步骤选项。** 输出的市场格局视图是所有后续工作的基础——市场规模评估需要了解细分市场，定位需要了解参与者，而竞争对手深度分析则需要知道哪些对象值得投入精力。本技能描绘的是结构，而非规模：它告诉你谁在哪里参与竞争以及原因，而不是机会有多大。

## 输入

**最适合提供：**需要描绘的市场、细分市场或问题空间——请用你自己的语言描述，而不是使用分析机构的分类——以及**该市场格局应支持的决策**（进入市场、新产品线、重新定位、自建还是购买）。
**同样有用：**任何比全球范围更窄的边界——地理区域、买方规模、价格区间——以及你已经知道的参与者，以便扫描将精力投入到你尚不了解的部分。

调用时以内联方式提供的输入——技能名称后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题预算；不要重复询问。

**两手空空也没关系。** 本技能开始时最多提出 3 个问题（市场、决策、边界）；如果这些问题未获回答，则基于明确标注的假设继续执行——这就是 `autonomous-investigation` 契约。

**调用示例：** `Run a market landscape scan on developer-facing API observability tools,
EU-only — this supports a Q4 market-entry decision.`

## 核心概念

- **统领协议：**本技能遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  契约——问题预算为 3、搜索计划关卡、事实/推断/假设标签、恰到好处模式、稳定的模式结构、包含 4 个选项的最终步骤。
- **方法组合：**主要使用 OSINT（分析机构和评测报道、新闻、社区），并使用
  GEOINT/DEMOINT 对细分市场进行现实检验，使用 FININT 获取融资信号——参见
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)。
- **买方视角的市场细分。** 按照*买方*实际体验市场的方式描绘市场，而不是按照供应商或分析机构
  划分市场的方式——并注明两者存在分歧之处。分析机构的象限图是他人出于自身目的绘制的地图；
  供应商分类与买方现实之间的分歧，往往正是机会隐藏之处。
- **非消费也是竞争对手。** “他们使用电子表格”也应出现在参与者地图中。将替代方案和非消费
  视为竞争对手，是市场分析中最具商业价值的习惯——最大的竞争对手通常是现状，而它从不会出现在象限图中。
- **死区测试。** 每一项空白机会主张都必须经得起这个问题：*"或者，这其实是一个死区？"*
  空白区域要么是机会，要么是没有需求的证据；必须给出坦诚的反向解读，这不是可选项。
- **禁止虚构清单（本领域的捏造风险）：**公司、产品、融资轮次、
  市场份额、增长率、客户声明。

## 应用

1. **优先利用上下文中已有的信息**，然后只询问尚未得到回答的问题（最多 3 个）：
   1. 用你自己的话说，这是什么市场或问题领域？
   2. 这份市场格局分析应支持什么决策？
   3. 是否有任何边界条件——地域、买方规模、价格区间？
   如果未得到回答，则基于明确标注的假设继续。
2. **展示包含 3 个要点的搜索计划**——你将搜索什么、来源类型（分析机构和评论网站、
   公司和定价页面、融资数据库、行业媒体、行业协会、从业者
   社区），以及如何将事实与推断区分开来。除非对方要求修改，否则继续。
3. **以恰到好处模式开展研究**，并*严格按照原样*输出以下架构——它是季度重新扫描进行差异比较时所依据的稳定基线。

### 输出架构（请勿调整顺序）

~~~markdown
# Market Landscape Snapshot

## 1. Scope
**Market / problem space:** | **Boundary:** | **Decision supported:** | **As-of date:**

## 2. How This Market Segments
- [3-5 segments as buyers experience them, each 1 bullet]
- [Where vendor categories disagree with buyer reality: 1 bullet]

## 3. Player Map
### Direct players
- **[Name]:** [who they serve; wedge; 1 momentum signal; URL]
### Adjacent players (could enter)
- **[Name]:** [why adjacency matters; URL]
### Substitutes and non-consumption
- **[What buyers do instead]:** [why it persists]
### Emerging entrants
- **[Name]:** [what bet they're making; funding/traction signal; URL]

Cap the full map at 12 players; strongest signal only.

## 4. Dynamics
- **Where the money is:** [2 bullets, labeled]
- **Where the momentum is:** [2 bullets, labeled]
- **Consolidation or fragmentation:** [1 bullet]
- **Technology or regulatory shifts in play:** [1-2 bullets]

## 5. Whitespace and Dead Zones
- **[Apparent gap]:** opportunity or dead zone? [evidence either way]
- [2-3 of these, each with the honest counter-reading]

## 6. So What?
- **3** implications for the decision named in Scope
- **2** players to deep-dive next
- **3** assumptions to validate
Each bullet: label, confidence, URL where relevant.
~~~

包含质量检查项、可复制粘贴并填写的架构版本位于 [`template.md`](template.md)。

### 最后一步（仅提供以下 4 个选项）

1. 对需要深入研究的参与者运行 [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)
2. 对最有前景的细分市场运行 [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md) 进行规模测算
3. 针对这一市场格局起草定位假设（[`positioning-statement`](../positioning-statement/SKILL.md)）
4. 可直接纳入日程的版本：季度重新扫描应关注什么？

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。

## 示例

**发现供应商分类与买方认知之间差异的细分方式（所有名称均为虚构）：**

> 该领域的供应商宣传三种类别：“可观测性平台”“APM”和“日志
> 管理”。从业者论坛中的买方采用不同的细分方式——**事实**
> （[社区帖子，2026 年 6 月](https://example.com/thread)）：依据的是*谁会收到告警*（由开发人员负责还是
> 由运维人员负责），以及*对成本模式的接受程度*（按席位计费还是按 GB 计费）。对于由开发人员负责且偏好按席位计费的买方而言，两个“不同”的供应商类别
> 其实在直接竞争——**推断**（相同的买方在
> 评论网站的对比页面中同时评估二者）。类别术语体现的是营销架构，而非市场结构。

**一项通过“死亡区”检验的市场空白判断：**

> **表面空白：**没有人以自助服务定价服务员工不足 50 人的代理机构。这是机会还是死亡
> 区？此前有两家入局者恰好瞄准这一市场，但都在 18 个月内转向高端市场——**事实**
> （[融资公告，URLs](https://example.com)）。他们声称原因在于付费意愿，
> 而非需求——**推断**（创始人的事后复盘提到了 CAC/LTV，而不是缺乏兴趣）。结论：
> 有条件的市场空白——只有采用成本低得多的获客方式才可行。**待验证的
> 假设：**该细分市场的工具预算超过每月 50 美元。

请参阅 [`examples/sample.md`](examples/sample.md)，其中提供了一份完整的扫描示例（虚构的 FSM 软件
市场），其输出会传递给 `competitive-research-snapshot` 示例——端到端演示了该链条的模式。
[`examples/sample-industrial.md`](examples/sample-industrial.md) 在一个虚构的工业市场中使用了
相同的模式，而其中的替代方案和最新信号则完全不同。

## 常见陷阱

- **照搬分析师绘制的地图。**复述一个象限图不等于进行市场格局扫描——象限图会排除
  替代方案、滞后于新兴入局者，并按便于排名的方式划分市场。将其作为一个
  OSINT 来源使用并加以标注，绝不能将其用作分析框架。
- **遗漏非消费。**如果参与者地图中没有说明“买家会改用什么方式”，就会美化图中的每一家供应商，
  并掩盖真正的竞争对手：惯性。
- **浪漫化市场空白。**把每一个空白单元格都宣称为机会。如果缺少反向解读，
  这份分析就是推销材料，而不是情报。
- **参与者地图无限扩张。**列出二十个参与者且每个只有两项事实，总比什么都没有好；但列出十二个参与者，
  并为每个提供最强的一项信号，则远胜于前者。设置上限本身就是一种纪律。
- **重新扫描之间的范围漂移。**在不同轮次之间更改边界或模式，会悄无声息地破坏
  可比性——对不同范围的重新扫描属于新的基线，应当明确说明这一点。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——规范信息来源和信号链
- [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)（工作流）——深入研究本次扫描发现的参与者
- [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)（组件）——测算本次扫描所绘制细分市场的规模
- [`positioning-statement`](../positioning-statement/SKILL.md)（组件）——针对这一市场格局进行定位
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/market-landscape-scan-prompt.md`。