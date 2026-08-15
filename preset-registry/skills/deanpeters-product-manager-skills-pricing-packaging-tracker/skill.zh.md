---
name: pricing-packaging-tracker
argument-hint: "[competitor set, and prior capture if one exists]"
description: "Track competitor pricing and packaging as a diffable time series. Use when monitoring tiers, gates, limits, and price moves on a monthly or quarterly cadence."
intent: >-
  Capture competitor public pricing pages into a stable schema, diff against the prior capture, and
  report tier changes, price moves, feature-gate shifts, and packaging restructures with URLs and
  dates — because packaging changes signal strategy earlier than price changes do.
type: workflow
theme: market-intelligence
best_for:
  - "Keeping battle-card pricing sections current without manual screenshot archaeology"
  - "Catching packaging restructures — the earliest public signal of a strategy shift"
  - "Building the pricing time series that grounds your own pricing decisions"
scenarios:
  - "Baseline the pricing pages of our four main competitors, then track monthly"
  - "Did anyone in our space change pricing or packaging this quarter?"
estimated_time: "15-30 min per run"
---
# 定价与套餐追踪器

## 目的

将竞争对手的定价与套餐作为**可进行差异比较的时间序列**来追踪，而不是保存为截图：**采集（或
比较差异）→ 套餐结构变化 → 价格变化 → 信号 → 后续行动选项。**稳定的采集模式
才是关键——将第 N 次运行与第 N-1 次运行进行差异比较，使报告聚焦于*发生了哪些变化*，并提供证据。此外，该
技能对套餐结构的关注程度不亚于价格数字，因为套餐变化（门槛、限制、层级
重构）通常比价格变化更早释放战略信号：某个层级的消失，可能会在价格表正式体现之前数月
预示其向高端市场转移。

## 输入

**最适合提供：**要追踪的竞争对手集合（或包含该集合的快照），以及之前的
定价采集结果（如果存在）——正是后者能让本次运行生成增量报告。
**同样有用：**你自己的定价背景信息（如果比较中应包含你方）。

调用时以内联方式提供的输入——技能名称后的文本、粘贴的上下文转储，或追加的
`ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题预算；
不要重复询问。

**什么都没准备？也没问题。**如果没有之前的采集结果，该技能会以**基线模式**运行：
对每个竞争对手进行完整采集，而差异比较的价值将从下一次运行开始体现。如果没有竞争对手列表，它会询问——
这是其两个预算问题之一。

**调用示例：** `Pricing tracker on [Competitor A], [Competitor B], [Competitor C] — prior
capture from April pasted below.`

## 核心概念

- **管辖协议：**遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  约定——问题预算为 2，使用事实/推断/假设标签、适可而止模式、稳定模式，
  以及包含 4 个选项的最终步骤。采用 SIGINT（定价页面、网站差异）并通过 FININT 进行佐证——参见
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)。
- **时间序列，而非截图。**单次采集只是零散信息；连续序列才是情报。各次运行之间
  模式绝不漂移，因为可进行差异比较正是其全部价值所在。
- **套餐结构优先于价格数字。**记录层级、计费单位、功能门槛、用量限制、免费层级
  边界以及企业版最低门槛信号——而不仅仅是价格。门槛先变，价格
  随后才变。
- **“联系销售”也是数据，但必须如实标注。**如果定价不透明，则追踪*确实*公开的内容
  （版本、门槛、已公布的最低价格），并标注其余内容。只能在添加标签的情况下进行推断；绝不能编造
  价格、层级、限制、折扣或协商后的数字。
- **不适用的情况：**你需要的是定价*策略*建议 →
  [`finance-based-pricing-advisor`](../finance-based-pricing-advisor/SKILL.md)（本技能追踪
  市场，而不负责设定你的价格）；整个竞争对手集合的定价都完全不透明 → 预计结果会较为有限，
  应考虑改用 [`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md) 或赢单/丢单
  证据。

## 应用

1. **确定模式。**已提供之前的采集结果 → 增量模式（仅报告变化）。未提供 → 基线
   模式（完整采集，然后停止）。
2. **计入内联上下文**，然后只询问尚未得到回答的问题（最多 2 个）：
   1. 我应该追踪哪些竞争对手的定价？
   2. 是否有之前的采集结果可供差异比较，还是以本次作为基线？
3. **从实时定价页面采集**——套餐比较页面、已发布的费率表、可信的
   定价变更报道——并为每个竞争对手记录 URL 和截至日期。
4. **严格按照下方模式输出**——可进行差异比较才是关键。

### 输出架构（请勿调整顺序）

~~~markdown
# Pricing Capture / Delta Report

## 1. Run Header
**Competitor set:** | **Prior capture date:** [or "baseline run"] | **This run date:**

## 2. Pricing Capture (per competitor)
### [Competitor] — [pricing page URL, as-of date]
- **Tiers:** [name: price / unit / billing terms, one bullet each]
- **Key gates:** [which capabilities gate which tier, 2-4 bullets]
- **Usage limits:** [the limits that matter, 1-2 bullets]
- **Free tier / trial:** [boundary, 1 bullet]
- **Enterprise signals:** [published floors, "contact sales" scope]

(Baseline mode: full capture per competitor. Delta mode: this section
only for competitors with changes.)

## 3. Changes Since Last Capture (Delta Mode)
### [Competitor] — [4 to 8 word change summary]
- **Then / Now:** [old -> new, labeled Fact]
- **Evidence:** [URL, date]
- **Reading:** [Inference — repositioning, monetization push, response to whom?]

If nothing changed: "No pricing or packaging changes this cycle."

## 4. Signals
- [Cross-competitor patterns: direction of the market's pricing, labeled]
- [Implications for your pricing or battle cards: 2-3 bullets]

### Assumptions to Validate
- [Assumption 1] / [Assumption 2] / [Assumption 3]
~~~

该架构的可复制粘贴填充版本（包含质量检查）位于 [`template.md`](template.md)。

### 最后一步（必须提供且仅提供 4 个选项）

1. 根据这些变化更新竞争作战卡中的定价部分（[`battle-card-builder`](../battle-card-builder/SKILL.md)）
2. 深入分析某个竞争对手的套餐设计逻辑
3. 将你的定价与本次采集结果进行比较
4. 为下一次运行设定执行节奏和监控清单

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。

## 示例

**一条不仅解读价格、还解读结构的差异记录（虚构）：**

> ### [竞争对手 B] — API 访问权限从 Pro 移至新的 Scale 层级
> - **之前 / 现在：** API 访问权限包含在 Pro（$79/席位）中 → 现在仅限新的「Scale」层级
>   （$149/席位，至少 10 个席位）— **事实**
> - **证据：** [定价页面与存档采集结果的对比、URL、日期]
> - **解读：** 价格没有变化；变化的是*门槛*。以开发者为主导的客户正被推向
>   销售沟通环节 — **推断**：他们正在对增长最快的使用模式加强商业化；
>   与此同时，在其社区消化这一变化期间，我们有机会争取 API 优先型买家。

**跨竞争对手信号：** 本季度，追踪的四个竞争对手中有三个增加了基于用量的附加项，
同时保持席位价格不变 — **推断：** 市场正在测试按用量定价，而不提高标价。
你们关于定价的讨论已不再是假设；「信号」部分列出了相关证据。

有关完整的差异运行示例，请参阅 [`examples/sample.md`](examples/sample.md)（虚构的
FSM 软件市场）；其中两项重大变化均为结构性调整——新增层级和重新设置门槛——
而标价完全没有变化。[`examples/sample-industrial.md`](examples/sample-industrial.md)
展示了完全不透明的情况：不公布任何价格，结构是唯一的公开信号。

## 常见陷阱

- **截图式思维。** 只采集一次，就称之为竞品定价情报。只有按固定节奏持续进行——建立基线，然后永远追踪差异——价值才会不断累积。
- **执着于数字。** 只报告价格变化，却忽略某个套餐悄然增加了 5 席位的最低限制。结构才是领先指标；要密切关注这些门槛。
- **臆造不透明信息。** 在“联系销售”单元格中填入看似合理的数字。应如实公布信息边界，并标明所有推断——基于虚构企业定价构建的作战卡，会在真实交易中引爆风险。
- **随意变更模式。** 在不同采集轮次之间重新排序或“改进”采集格式，会破坏未来的每一次差异比较。该模式是你与自己未来各轮采集之间的契约。
- **追踪结果无人使用。** 如果没有作战卡、定价审查或监测报告使用输出结果，采集节奏便会悄然中断。将最终步骤中的第一个选项接入真实产物。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——信号情报来源：Wayback 差异比较、定价页面监控
- [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（工作流）——此追踪器所服务的更广泛监测流程
- [`battle-card-builder`](../battle-card-builder/SKILL.md)（工作流）——使用定价快照章节
- [`finance-based-pricing-advisor`](../finance-based-pricing-advisor/SKILL.md)（交互式）——设定*你的*价格；本技能通过市场证据为其提供信息
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/pricing-packaging-tracker-prompt.md`。