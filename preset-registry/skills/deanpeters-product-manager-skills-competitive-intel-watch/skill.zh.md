---
name: competitive-intel-watch
argument-hint: "[prior snapshot (pasted/attached), and anything specific to watch]"
description: "Scheduled delta monitoring against a prior competitive snapshot. Use when tracking competitors on a cadence: material shifts only, cited evidence, battle-card update flags, runs unattended."
intent: >-
  A competitive intelligence delta monitor: given a previous Competitive Research Snapshot, sweep for
  material shifts since the last run and report only what changed — a cited changelog plus flags naming
  which battle card or positioning sections now need updating. Designed to run unattended on a loop or
  schedule; an empty changelog is a valid, useful result.
type: workflow
theme: market-intelligence
best_for:
  - "Keeping battle cards and positioning current without regenerating research weekly"
  - "Running unattended on a schedule and reporting only changes a rep or roadmap owner would act on"
  - "Turning competitive research from a one-off deliverable into a standing capability"
scenarios:
  - "Run this against last quarter's snapshot and tell me what actually changed"
  - "Set up a monthly competitor watch that flags when our battle card goes stale"
estimated_time: "10-25 min per run (after the baseline exists)"
---
# 竞争情报监测

## 目的

监测自上次运行以来竞争格局中发生的**实质性变化**。将当前状况与上一份快照进行比对；仅报告发生的变化并提供证据；标记哪些下游产物需要更新。这项技能将竞争研究从一份文档转化为一种固定节奏——融合节奏中的每周 SIGINT 扫描和每月 OSINT 摘要均在此进行。监测报告关注的是*变化*，而不是*状态*：每周重复生成相同的报告只是在做表面文章，而“本周期无实质性变化”则是一个有效且有用的结果。

## 输入

**最佳输入：**上一份竞争研究快照（粘贴或作为附件提供）——本次运行将以其作为比对基线——以及竞争对手列表（默认使用快照中的竞争对手）。
**其他有用信息：**本周期需要特别关注的任何事项，以及在默认实质性标准需要收紧或放宽时提供的调整要求。

调用时随附的内联输入——技能名称后的文本、粘贴的上下文转储，或追加的 `ARGUMENTS:` 行——均视为已经提供的答案。应将其计入问题预算；不要重复询问。

**什么都没准备也没关系。**如果没有先前快照，该技能将回退到**基线模式**：使用 `competitive-research-snapshot` 的结构生成第一份快照，然后停止——从第二次运行开始才会产生差异价值。

**调用示例：**`Competitive intel watch — prior snapshot pasted below; this cycle I'm specifically watching for pricing moves. [snapshot]`

## 核心概念

- **管控协议：**遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  契约——问题预算为 2（该技能采用最严格的预算）、搜索计划关卡、事实/推断/假设
  标签、恰到好处模式、稳定架构，以及包含 4 个选项的最终步骤。
- **情报学科组合：**以 SIGINT 为先（网站差异、定价页面、招聘信息——最新鲜的信息层），
  每月结合 OSINT 和 HUMINT 信号，每季度再加入 FININT——
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 中的融合节奏就是该
  技能的运行节奏。
- **实质性标准。**仅当销售代表、定价负责人或路线图负责人有理由据此采取行动时，
  才报告一项变化：定价/套餐变化、产品发布与弃用、定位变化、
  领导层变动、融资或并购、重大客户赢得/流失、可信的路线图信号。低于
  该标准的变化包括：装饰性的网站改动、常规内容营销、小版本发布。*为何重要：*一项
  频繁发出虚假警报的监测，到第三个周期就会被忽视——这项标准正是维持受众关注的关键。
- **差异纪律。**搜索前完整阅读上一份快照；将其作为比对基线，绝不
  重新生成。空的变更日志也是一种重要结果。
- **更新标记形成闭环。**只有明确指出变化所影响的产物，研究才算完成——每项
  实质性变化都应映射到目前已过时的作战卡、定位、定价或路线图部分。
- **禁止虚构清单：**竞争对手、功能、定价、市场份额、客户赢得情况、路线图项目、
  产品声明。每项声称发生的变化都必须附带 URL *和日期*。
- **不应使用的情况：**不存在基线且希望获得完整研究结果 → 先运行
  [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)；研究范围本身
  已发生变化（新细分市场、业务转向）→ 从头重新生成快照，而不是与范围已过时的快照进行比对。

## 应用

1. **确定模式。** 提供了先前快照 → 增量模式。未提供 → 基线模式：按照
   `competitive-research-snapshot` schema 生成快照，然后停止。
2. **考虑上下文中已提供的信息**，然后仅询问尚未回答的问题（最多 2 个）：
   1. 你有先前快照吗，还是应由我创建基线？
   2. 本周期是否有你特别关注的事项？
   如果未回答，则继续：没有快照时使用基线模式，否则使用默认实质性门槛。
3. **搜索前完整阅读先前快照。** 差异比较的目标是该文档，而不是你对市场的
   记忆。
4. **展示包含 3 个要点的搜索计划**——将针对每个竞争对手检查什么、来源类型（公司网站、
   定价页面、发布说明、新闻稿、投资者材料、可信新闻、评论网站、招聘
   信息），以及如何区分事实与推断。除非计划被修改，否则继续。
5. **全面检索，并通过实质性门槛进行筛选。** 如果没有任何内容达到该门槛，请直截了当地说明。
6. **严格按照下方 schema 输出**——每次运行的结果必须可进行差异比较。

### 输出 schema（不要调整顺序）

~~~markdown
# Competitive Watch Report

## 1. Run Header
**Scope (from prior snapshot):** | **Prior snapshot date:** | **This run date:** | **Competitors checked:**

## 2. Changelog (Material Shifts Only)
For each material shift:
### [Competitor] — [4 to 8 word change summary]
- **What changed:** [1-2 bullets, labeled Fact/Inference]
- **Evidence:** [URL, date]
- **So what:** [why it clears the materiality bar]
- **Confidence:** [high / medium / low]

If nothing cleared the bar: "No material shifts this cycle." List
anything on the watchlist for next run.

## 3. Update Flags
| Downstream artifact | Sections needing update | Driven by |
|---|---|---|
| Battle card | | |
| Positioning statement | | |
| Pricing/packaging analysis | | |
| Roadmap assumptions | | |
Only rows with real updates; omit the rest.

## 4. Watchlist for Next Run
- [Signals below the bar but trending]
- [Open questions this run could not resolve]

### Assumptions to Validate
- [Assumption 1] / [Assumption 2] / [Assumption 3]
~~~

该 schema 的可复制粘贴填充版本及质量检查位于 [`template.md`](template.md)。

### 最后一步（必须恰好提供 4 个选项）

1. 更新上方标记的竞争对比卡部分（[`battle-card-builder`](../battle-card-builder/SKILL.md)）
2. 深入分析最重大的变化
3. 生成刷新后的完整快照（新基线）
4. 为下次运行调整实质性门槛或竞争对手列表

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。在定时、无人值守的
运行中，保存报告后停止——这些选项等待人工处理。

## 示例

**达到门槛的变更日志条目（虚构）：**

> ### Ledgerline — 定价页面移除了中档套餐
> - **发生了什么变化：** $49 的 "Team" 档位已不再出现；功能列表被重新分配至更高档位——
>   **事实**（[定价页面与存档版本对比，7 月 2 日与 6 月 1 日](https://example.com/archive)）
> - **证据：** URL + 存档差异，注明日期
> - **有何影响：** 入门价格实际上翻了一倍；我们“起步成本更低”的卖点现在
>   更具优势，而且他们的中小企业客户流失率可能上升——对销售和定价负责人而言均达到该门槛
> - **置信度：** 高

**正确处理空变更日志：**

> 本周期无重大变化。记录以下未达阈值的活动以供趋势分析：[竞争对手 B] 发布了
> 三篇关于合规自动化的思想领导力文章（观察项：如果其产品页面随后发生变化，则可能表明定位转变），
> 另有两个高级工程师职位提到了一种此前未在其技术栈中见过的语言（观察项：在此具有任何意义之前，需要 TECHINT 佐证）。

请参阅 [`examples/sample.md`](examples/sample.md)，了解完整的运行示例（虚构的 FSM 软件
市场）。该示例与 `competitive-research-snapshot` 示例的基线进行差异比较——其中还包括
该基线中的一项假设经差异比较得到确认。[`examples/sample-industrial.md`](examples/sample-industrial.md)
展示了按季度节奏运行的工业领域版本，其中一项主要风险被*降级*，且这一变化被报告为
重大变化。

## 常见陷阱

- **假装重新生成。** 每次运行都生成一份全新的完整报告，并称其为监测。
  读者的问题是“发生了什么变化？”——只回答这个问题。
- **夸大重大性。** 为了显得有所产出而报告博客文章和小版本发布。每报告一个
  未达阈值的项目，都会消耗真正的警报日后所需的可信度。
- **害怕空变更日志。** 在平静的周期中用噪声填充内容。有实际扫描作为支撑的
  “无重大变化”，恰恰是健康的监测在大多数周期中应产生的结果。
- **未注明日期的证据。** 如果一项变化声明没有同时提供 URL 和日期，就既无法验证，
  也无法在下次运行时进行差异比较。日期是证据的一半。
- **对过时的范围进行差异比较。** 市场已经转向，你也进入了新的细分市场——但监测仍在
  对旧框架进行差异比较。范围发生变化时应重新建立基线，并在运行标题中说明。
- **孤立的情报。** 变更日志中没有更新标记。如果没有任何产物需要更新，那么这项
  变化很可能并未达到阈值——标记是研究转化为行动的方式。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领性协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——此监测所依据的情报融合节奏
- [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)（工作流）——生成此技能用于差异比较的基线
- [`battle-card-builder`](../battle-card-builder/SKILL.md)（工作流）——使用更新标记
- [`pestel-analysis`](../pestel-analysis/SKILL.md)（组件）——此竞争对手级监测在宏观环境层面的对应组件
- 改编自
  `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `market-intelligence/competitive-intel-watch-prompt.md`。