---
name: battle-card-builder
argument-hint: "[your product vs which competitor, and the deal context]"
description: "Research and draft a competitive battle card from public evidence — every claim labeled and sourced. Use when a rep needs a field-action card, not a research report."
intent: >-
  Autonomous battle card construction: given your product and one competitor, the AI does the fieldwork
  — pricing pages, reviews, release notes, customer stories — and produces a field-action card with a
  source URL and Fact/Inference/Assumption label on every claim, sized to a rep's thirty seconds.
type: workflow
theme: market-intelligence
best_for:
  - "Arming sales against one competitor with claims they can actually defend"
  - "Turning a competitive snapshot or watch report into a field-action artifact"
  - "Building trap questions whose documented answers favor you"
scenarios:
  - "We keep hitting the same rival in enterprise deals — build the battle card from public evidence"
  - "Our battle card is six months old and sales stopped trusting it; rebuild it with sources"
estimated_time: "20-35 min per run"
---
# 竞争作战卡构建器

## 目的

基于公开证据构建一份可供一线行动使用的竞争作战卡：**使用或收集证据 → 搜索
计划（如需收集）→ 起草带有逐项声明标签的作战卡 → 附录 → 后续步骤选项。** 作战卡是销售代表在交易过程中打开使用的材料，而不是研究报告——它必须能在三十秒内读完，每一项
声明都必须经得起在充满敌意的受众面前公开说出，因此每项声明都要附带
来源 URL、日期以及事实/推断/假设标签。市面上的大多数作战卡都包含未标注的
推断；此技能之所以存在，是因为一旦其中某项推断被证明有误，销售代表就会付出代价。

## 输入

**最适合提供：**你的产品及其主要差异化优势，以及此
作战卡所针对的**一个竞争对手**。
**同样有用：**交易背景（细分市场、买方、常见异议或触发制作此
作战卡的丢单原因），以及当前会话中的任何 [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md) 或
[`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) 输出——此技能会
使用现有证据，并且只搜索证据缺口以及任何早于一个季度的信息。

调用时内联提供的输入——技能名称后的文本、粘贴的上下文转储，或追加的
`ARGUMENTS:` 行——均视为已经给出的答案。将其计入问题预算；
不要重复提问。

**两手空空也没关系。** 此技能开始时最多提出 3 个问题（产品 +
竞争对手、细分市场 + 买方、触发异议），如果这些问题未获回答，则基于带标签的假设继续执行。

**调用示例：** `Build a battle card: our workflow platform vs [Competitor A], mid-market ops
buyers — triggered by three straight losses on "their integrations are deeper."`

## 核心概念

- **治理协议：**遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  契约——问题预算为 3、搜索计划关卡、事实/推断/假设标签、适度模式、
  稳定架构、包含 4 个选项的最终步骤。
- **方法组合：**SIGINT（定价页面、网站差异——最新鲜的信息层，防止作战卡
  过时）+ OSINT（挖掘评论以处理异议）+ HUMINT（在掌握相关信息时使用赢单/丢单的一线事实）
  ——参见 [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)。
- **一线行动标准。** 每个元素都必须因其能在对话过程中使用而获得保留资格。深入
  内容放入附录；作战卡本身应能让销售代表在三十秒内读完。
- **陷阱问题属于证据工作。** 只有当你*知道有文档记录的答案*时，提出陷阱
  问题才是安全的——进攻建立在引用证据之上，而不是虚张声势。“绝不询问无法
  证实的问题”是本节的法则。
- **“不要说”部分是一种保护。** 无法证实或容易招致反击的声明
  会被明确列出——作战卡保护销售代表免受团队内部传闻的伤害。
- **两种模式，一份产出物。** 此技能使用*外部世界*的证据
  （调查）构建作战卡；引导式研讨会则使用*你的团队*的证据（赢单/丢单知识、
  交易经验）来构建作战卡。应根据证据所在位置选择模式——如果拥有丰富的内部
  赢单/丢单知识，请将其带到引导式会议中；当公开记录是更有力的
  来源时，则使用此技能。
- **禁止编造清单：**功能、定价、市场份额、客户赢单、路线图事项、**引语**。

## 应用

1. **检查会话中是否已有证据**——竞争快照或监测报告。如果存在，将其用作证据基础；仅针对缺口和时效性进行搜索（早于一个季度）。
2. **注明行内上下文的来源**，然后仅询问尚未回答的问题（最多 3 个）：
   1. 你的产品是什么，这张卡针对的单一竞争对手是谁？
   2. 这些交易涉及什么细分市场和买家？
   3. 是什么异议或丢单原因触发了这张卡的制作？
   如果未得到回答，则基于明确标注的假设继续。
3. **如果要进行新的调研，展示包含 3 个要点的搜索计划**——你将检查哪些内容（定价页面、
   发布说明、评论、客户案例、比较内容）、来源类型，以及如何将事实与推断区分开来。
   除非计划被修改，否则继续执行。
4. **严格按照以下架构起草卡片**——卡片在不同运行之间可进行差异比较，而监测
   skill 的更新标记会引用这些章节名称。

### 卡片架构（请勿调整顺序）

~~~markdown
# Battle Card: [Your Product] vs [Competitor]
**As-of date:** | **Deal context:** [segment, buyer]

## 1. Thirty-Second Read
- **They win when:** [1-2 bullets, labeled]
- **We win when:** [1-2 bullets, labeled]
- **The one thing to say:** [a single defensible sentence]

## 2. Say This
- [Talking point] — [evidence: URL, date, label]
- [Max 4; every one sourced]

## 3. Ask This (trap questions)
- "[Question whose documented answer favors us]" — [the documented answer: URL, label]
- [Max 3; never ask what you cannot evidence]

## 4. Watch Out For
- [Their strength a rep should not walk into] — [URL, label]
- [Their likely counter to our pitch] — [Inference, basis]

## 5. Pricing & Packaging Snapshot
- [Their tiers/pricing as published] — [URL, as-of date]
- [Where "contact sales" hides the number] — [labeled]

## 6. Do Not Say
- [Claims we cannot evidence, or that invite a counter]

## Appendix: Evidence Table
| Claim | Label | Source | Date |
|---|---|---|---|

### Assumptions to Validate
- [Assumption 1] / [Assumption 2] / [Assumption 3]
~~~

该架构的可复制粘贴填充版本及质量检查清单位于 [`template.md`](template.md)。

### 最后一步（恰好提供 4 个选项）

1. 对卡片进行压力测试：角色扮演竞争对手的销售代表来对抗它
2. 为第二个竞争对手制作卡片
3. 设置 [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) 以使此卡片保持最新
4. 将其压缩为供一线团队使用的单屏移动版

接受 `1`、`2`、`3`、`4`、`1 and 3`、`Verbose Mode` 或自定义路径。

## 示例

**一个正确构建的陷阱问题（虚构）：**

> **这样问：**“你们的迁移功能如何处理超出 200 个字段限制的自定义字段？”——有据可查的
> 答案：他们自己的文档指出，自定义字段迁移的上限为 200 个，超出部分需要手动重新录入——
> **事实**（[文档页面，检查于 2026 年 7 月](https://example.com/docs)）。可以放心询问：
> 答案就在他们的文档中，因此销售代表不是在虚张声势——而是在引用证据。

**一个真正发挥作用的“不要说”条目：**

> - 不要说“他们的入门层级不支持 SSO”——他们已在 6 月推出该功能
>   （[发布说明](https://example.com/changelog)）；销售代表如果继续复述我们的旧卡片，
>   就会当场被纠正，从而失去在场人员的信任。
> - 不要以“我们更便宜”作为开场——只有在少于 50 个席位时才成立（[他们的定价](https://example.com/pricing)、
>   [我们的定价](https://example.com/our-pricing)）；超过这个数量后，成本对比会反转，而企业买家会进行核查。

有关一个完整的卡片制作示例（虚构的 FSM 软件市场），请参阅 [`examples/sample.md`](examples/sample.md)。该示例根据 `competitive-intel-watch` 示例的更新标记重建而成，展示了最终落地为一线产物的完整链路。[`examples/sample-industrial.md`](examples/sample-industrial.md) 构建了工业领域版本，其中渠道合作伙伴是卡片的受众，而定价并不透明。

## 常见陷阱

- **没有标签的卡片。** 没有来源的谈话要点只是经过排版的坊间传闻。标签会告诉销售代表，当买方提出质疑时，他们可以在多大程度上坚持某项主张。
- **研究报告式卡片。** 两页的市场格局背景，销售代表绝不会在交易过程中阅读。阅读预算只有三十秒；其他所有内容都应放在附录中。
- **基于期望设置陷阱问题。** 提出一个你尚未记录其答案的问题，无异于给竞争对手搭建舞台。如果证据不在附录表格中，这个问题就不能发布。
- **编造引语。** 捏造客户引语，或将改写后的评论当作原话呈现，是摧毁卡片可信度的最快方式——这也正是它被列入禁止编造清单的原因。
- **永不过期的卡片。** 卡片会以 SIGINT 的速度腐化——定价页面和发布说明每月都在变化。没有截至日期，或没有监控机制向其提供更新标记的卡片，就是一个带着徽标的隐患。
- **跳过“禁止说法”。** 这个章节可以保护销售代表免受团队自身过时传闻的影响，却最常被省略——通常是因为没人愿意写明哪些备受推崇的主张已经失效。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）— 统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）— 情报来源专业规范；SIGINT 使此卡片保持最新
- [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)（工作流）— 上游证据库
- [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（工作流）— 在此卡片的各章节过时时发出标记
- [`positioning-statement`](../positioning-statement/SKILL.md)（组件）— 卡片谈话要点应与之保持一致的战略层
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/battle-card-builder-prompt.md`。