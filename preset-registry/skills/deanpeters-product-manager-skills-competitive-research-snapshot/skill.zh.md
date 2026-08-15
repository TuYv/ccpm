---
name: competitive-research-snapshot
argument-hint: "[company/product/segment, and the decision it supports]"
description: "Research a competitive landscape with cited snapshots, a comparison matrix, and so-what implications. Use when a product decision needs competitive grounding, not a market report."
intent: >-
  Autonomous competitive research as a workflow: search plan, competitor selection, just-enough
  research, Fact/Inference/Assumption labels, real URL citations, and next-step options — producing a
  stable snapshot schema that battle cards and delta monitors consume and diff.
type: workflow
theme: market-intelligence
best_for:
  - "Grounding a positioning, roadmap, or deal-support decision in cited competitive evidence"
  - "Creating the baseline snapshot that the competitive intel watch diffs against"
  - "Board or exec prep that needs labeled facts instead of confident storytelling"
scenarios:
  - "We're rewriting our positioning next sprint — get me a cited read on our top three competitors"
  - "Sales keeps losing to one rival; I need evidence on where they're actually strong and weak"
estimated_time: "20-40 min per run"
---
# 竞争研究快照

## 目的

通过工作流而非一次性回答来研究公司的竞争格局：**搜索计划 →
竞争对手选择 → 适度研究 → 事实/推断标签 → 真实 URL 引用 → 后续步骤
选项。** 输出是用于辅助决策的快照，而非市场报告——并且由于其架构
保持稳定，下游技能（作战卡、差异监控器）可以使用它并进行差异比较。由于该技能会在问题未获回答时
基于带标签的假设继续执行，因此既可作为智能体任务运行，也可按计划运行；重新运行后，可与之前的快照进行差异比较。

## 输入

**最适合提供：** 要研究的公司、产品或细分市场，以及**这项研究
应支持的决策**（定位、路线图押注、交易支持、董事会筹备）——具体决策决定了
“适度”研究的含义。
**同样有用：** 已知的竞争对手（或明确授权识别竞争对手），以及会话中已有的任何快照
或 `market-landscape-scan` 输出——该技能会在已经收集的证据基础上继续推进，
而不是重新研究。

调用时以内联方式提供的输入——技能名称后的文本、粘贴的上下文转储，或追加的
`ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题预算；
不要重复提问。

**空手而来？也没问题。** 该技能开始时最多提出 3 个问题（研究对象、
决策、竞争对手），如果这些问题未获回答，则基于带标签的假设继续执行。

**调用示例：** `Competitive research snapshot on our expense-automation product — decision:
which roadmap bet wins Q1. Competitors: [Competitor A], [Competitor B]; find a third if one matters.`

## 核心概念

- **管控协议：** 完整遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  约定——问题预算为 3、搜索计划关卡、事实/推断/假设标签、适度模式、稳定架构，以及包含 4 个选项的最终步骤。
- **研究方法组合：** OSINT（新闻、评论、分析师报道）+ FININT（监管申报文件、财报措辞）
  + SIGINT（定价页面、网站变更）——参见
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)。
- **这是辅助决策的快照，而非市场报告。** 每个章节都必须服务于“范围”中指定的
  决策，才能体现其存在价值。研究价值取决于对决策的支持，而非页数。
- **以快照作为基线。** 该架构是与未来运行之间的约定：`competitive-intel-watch`
  会将现实情况与本文档进行差异比较。章节顺序永不改变。
- **选择三到四个竞争对手，而不是八个。** 深入研究真正重要的参与者，胜过广泛覆盖
  无关紧要的参与者。使用已提供的竞争对手；如果未提供，则识别排名前三的竞争对手（仅在确有必要时选择四个），并为每个竞争对手提供
  名称、相关性原因、来源 URL 和置信度。
- **禁止虚构清单（本领域存在捏造风险的内容）：** 竞争对手、功能、定价、市场
  份额、客户案例、路线图项目、产品声明。
- **不适用的情况：** 你需要进行市场*规模测算* → [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)；
  你需要深入了解*某一家*公司的战略和高管 →
  [`company-research`](../company-research/SKILL.md) / [`company-intel`](../company-intel/SKILL.md)；
  事实已经收集完毕 → 直接制作作战卡。

## 应用

1. **认可内联上下文中已提供的信息**，然后仅询问尚未回答的问题（最多 3 个）：
   1. 哪家公司/产品/细分市场？
   2. 这项研究应支持什么决策？
   3. 是否已有已知竞争对手，还是应由我来识别？
   如果未得到回答，则基于明确标注的假设继续。
2. **展示包含 3 个要点的搜索计划**——将搜索什么、使用哪些来源类型，以及如何区分事实
   与推断。除非计划被修改，否则继续执行。
3. **选择竞争对手**——使用已提供的竞争对手，或识别出的前 3 名（仅在明确需要时选择 4 名）。针对每个竞争对手，提供：
   名称；相关性原因；来源 URL；置信度。
4. **以恰到好处模式开展研究**，混合使用多种来源：公司网站、产品/定价页面、
   客户案例、新闻稿、投资者材料、可信新闻、分析师/评测网站。
5. **严格输出以下模式**——这是一个稳定的模式，用于比较不同时间的运行结果。

### 输出模式（请勿调整顺序）

~~~markdown
# Competitive Research Snapshot

## 1. Scope
**Company/product:** | **Category:** | **Decision supported:** | **Competitors analyzed:**

## 2. Competitor Snapshots
For each competitor, max 5 bullets:
### Competitor: [Name]
- **Positioning:**
- **Relevant capability:**
- **Likely strength:**
- **Likely weakness:**
- **Key source URL:**

## 3. Quick Comparison
| Dimension | Company | Comp 1 | Comp 2 | Comp 3 |
|---|---|---|---|---|
| Target customer | | | | |
| Core use case | | | | |
| Main strength | | | | |
| Main weakness | | | | |
| Evidence quality | | | | |

## 4. So What?
- **3** product strategy implications
- **2** competitive risks
- **2** product opportunities
- **3** assumptions to validate
Each bullet: label, confidence, source URL where relevant.
~~~

该模式的可复制/粘贴填空版本及质量检查项位于 [`template.md`](template.md)。

### 最后一步（恰好提供 4 个选项）

1. 竞争作战卡（[`battle-card-builder`](../battle-card-builder/SKILL.md)）
2. 高管比较矩阵
3. 未来两个季度的产品风险/机会
4. 用于验证假设的探索问题

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。

## 示例

**带有如实标签的竞争对手快照（虚构）：**

> ### 竞争对手：Ledgerline
> - **定位：**“面向中型市场 CFO 的财务自动化”——**事实**（[主页，2026 年 7 月](https://example.com)）
> - **相关能力：**审批链构建器已于 5 月发布——**事实**（[发布说明](https://example.com/changelog)）
> - **可能的优势：**ERP 集成；列出了 40 多种集成，评测者确认其中最主要的 5 种表现良好——**事实**（[G2 评测](https://example.com/reviews)）
> - **可能的劣势：**实施时间；自 3 月以来的 11 条评测中出现集中投诉——**推断**（评测挖掘；无基准数据）
> - **关键来源 URL：**[定价页面](https://example.com/pricing)

**“Evidence quality”行发挥作用的方式：**比较矩阵将 Comp 3 列评为*低*——
每项声明都只能追溯到其自身的营销材料。因此，So What 部分拒绝将 Comp 3 列为
主要风险：“独立证据不足——**待验证的假设**，需通过客户
背书进行验证。”设置这一行是为了防止证据薄弱的列伪装成证据充分的列。

参见 [`examples/sample.md`](examples/sample.md)，其中提供了一个完整的快照示例（虚构的
FSM 软件市场）：它使用 `market-landscape-scan` 示例的输出，并成为
`competitive-intel-watch` 示例进行差异比较的基线。[`examples/sample-industrial.md`](examples/sample-industrial.md)
展示了同一套 schema 如何应用于工业领域的证据来源——申报文件、登记信息，以及对
缺乏证据这一事实的如实呈现。

## 常见误区

- **市场报告陷阱。** 用二十页篇幅讨论无人要求的行业趋势。如果某个章节无助于
  Scope 中的决策，它就是冗余内容——够用模式是必须遵守的约定。
- **轻信营销页面。** 将竞争对手声称具备的能力记录为事实。对方的网站只能作为其
  *声称了什么*的 Fact；至于相关能力是否真的有效，则应由评论网站佐证，或标记为 Inference。
- **重覆盖、轻深度。** 罗列八个竞争对手，每个只有两个事实。选择真正重要的三个并
  深入研究——比较矩阵应当充实，而不是宽泛。
- **未标记的 So What。** 借用他人的确信程度来陈述影响。每条 So What 要点的标签和置信度
  决定了它能否用于路线图论证。
- **重新生成，而非比较差异。** 每周重新运行此 skill 并重读全部输出只是在走过场——
  这正是 [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) 应该完成的工作。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——专业领域的信息源和信号链
- [`market-landscape-scan`](../market-landscape-scan/SKILL.md)（工作流）——上游：找出哪些参与者值得纳入此快照
- [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（工作流）——下游：将未来运行结果与此基线进行差异比较
- [`battle-card-builder`](../battle-card-builder/SKILL.md)（工作流）——下游：将快照转化为一线行动卡
- [`company-research`](../company-research/SKILL.md)、[`company-intel`](../company-intel/SKILL.md)——单一公司的深度研究
- 改编自
  `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `market-intelligence/competitive-research-snapshot-prompt.md`。