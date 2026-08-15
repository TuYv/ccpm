---
name: porters-five-forces
argument-hint: "[industry or segment, and the decision it supports]"
description: "Read an industry's structure through Porter's Five Forces with documented signals per rating, ending at the profit pool. Use when weighing market entry or when margins erode and nobody can say why."
intent: >-
  An evidence-cited five-forces read: rivalry, new entrants, substitutes (with AI-driven substitution
  named explicitly), buyer power, and supplier power — each force rated weak/moderate/strong with the
  documented signals that justify the rating, closing with where the profit pool sits and who is
  squeezing it.
type: workflow
theme: market-intelligence
best_for:
  - "Pressure-testing a market-entry decision against the industry's actual structure"
  - "Explaining margin erosion structurally instead of blaming execution"
  - "Grounding strategy debates in rated forces with evidence, not vibes"
scenarios:
  - "We're considering entering the clinical-data-management space — what does its structure do to everyone who plays?"
  - "Our margins keep compressing and every explanation is tactical; give me the structural read"
estimated_time: "25-40 min per run"
---
# 波特五力（证据引用版）

## 目的

通过波特五力分析行业结构，并提供证据：**搜索计划 →
逐项力量评级及信号 → 利润池影响 → 后续选项。** 五种力量——
竞争对手间的竞争、新进入者威胁、替代品威胁、买方议价能力、供应商议价能力——均被
评为弱/中/强，并以有据可查的信号作为论证，因为没有信号支撑的评级
只是凭感觉。分析最终落脚于它从一开始就应该瞄准的问题：**利润池位于何处，
又是谁在挤压它。** 五力分析探讨的是利润流向何处，而不是第四页
幻灯片上的一张图。

## 输入

**最适合提供：**尽可能精确命名的行业或细分市场（例如“临床数据
管理 SaaS”，而不是“医疗保健”），以及**本分析应支持的决策**。
**其他有用信息：**如果不同地区的行业结构有所差异，则提供地理边界；以及会话中已有的
[`market-landscape-scan`](../market-landscape-scan/SKILL.md)——五力分析将在其基础上展开，
仅搜索其中的空白。

调用时随附的内联输入——技能名称后的文本、粘贴的上下文转储，或追加的
`ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题额度；
不要重复询问。

**空手而来也没关系。** 本技能一开始最多提出 3 个问题（细分市场、
决策、边界）；如果未获回答，则基于明确标注的假设继续执行。

**调用示例：** `Five forces on mid-market field-service management software, North America —
decision: whether we enter or partner.`

## 核心概念

- **统领协议：**遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md)
  约定——问题额度为 3、搜索计划关卡、事实/推断/假设标签、适量模式
  （每种力量 2-4 个信号）、稳定模式、包含 4 个选项的最终步骤。采用的情报收集方法：FININT
  （集中度、利润率、申报文件）+ OSINT（分析师报道、行业媒体），具体参见
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)。
- **框架（波特，1979）：**行业盈利能力由五种结构性力量决定，
  而非由现有企业的努力程度决定。竞争强度决定利润率竞争的激烈程度；进入威胁
  限制定价；替代品限制价值；买方议价能力从下游攫取利润；供应商议价能力
  从上游攫取利润。行业结构能够解释谈判技巧无法解释的事实：**定价权是
  结构性的。**
- **评级必须经得起“你怎么知道？”的追问。** 每项弱/中/强评级都应建立在有据可查的
  信号之上——集中度数据、转换成本、进入者案例及其表现、替代品
  采用曲线、利润率趋势。以信号支撑五力，是仅仅说出一个框架与真正
  运用它之间的区别。
- **AI 驱动的替代始终是明确列出的候选因素。** 在大多数知识型行业中，它如今就是
  *首要的*替代威胁；应在替代品力量中明确评估，而不是让
  分析假装仍处于 2015 年。供应商议价能力也需要同样的现代化审视：云、模型和平台
  依赖都属于供应商集中度。
- **分析行业，而非单个参与者：**本分析考察行业结构对*所有*参与者的影响。
  [`swot-analysis`](../swot-analysis/SKILL.md) 则分析单个公司在其中的地位。
- **不适用情形：**尚未形成稳定结构的新兴品类——五种力量仍在成形；
  应先运行市场格局扫描，之后再重新评估。
- **禁止虚构清单：**市场份额、利润率数据、进入者名称、融资轮次、采用数据。

## 应用

1. **先确认行内上下文中已有的信息**，然后只询问尚未回答的问题（最多 3 个）：
   1. 具体是哪个行业或细分市场？
   2. 此分析应支持什么决策？
   3. 是否有地域边界？
2. **展示包含 3 个要点的搜索计划**——针对每种力量将搜索什么、来源类型（申报文件、分析师
   研究、行业媒体、定价页面、融资数据库），以及如何区分事实与推断。除非用户要求修改，否则继续
   执行。如果当前会话正在进行市场格局扫描，则在其基础上推进；只搜索信息缺口。
3. **根据相关信号评估每种力量，然后严格按照以下模式输出。**

### 输出模式（不要调整顺序）

~~~markdown
# Five Forces: [Industry / Segment]
**As-of date:** | **Boundary:** | **Decision supported:**

## 1. Competitive Rivalry — [weak / moderate / strong]
- Signals: [concentration, growth rate, differentiation, exit barriers — each with URL + label]
- What it means here: [one sentence]

## 2. Threat of New Entrants — [weak / moderate / strong]
- Signals: [entry barriers, capital needs, recent entrants and how they fared, regulation — each with URL + label]
- What it means here: [one sentence]

## 3. Threat of Substitutes — [weak / moderate / strong]
- Signals: [substitute adoption, price-performance trajectory, switching evidence — each with URL + label]
- AI-driven substitution, named and assessed: [labeled]
- What it means here: [one sentence]

## 4. Buyer Power — [weak / moderate / strong]
- Signals: [buyer concentration, switching costs, price transparency, backward-integration examples — URL + label]
- What it means here: [one sentence]

## 5. Supplier Power — [weak / moderate / strong]
- Signals: [supplier concentration (including cloud/model/platform dependencies), input differentiation — URL + label]
- What it means here: [one sentence]

## 6. The Profit Pool (the "so what")
- Where margin sits today, and the force squeezing it: [labeled]
- Structure trend: [tightening / loosening, on what evidence]
- For your decision: [2 sentences tying structure to the decision named above]

### Assumptions to Validate
- [Assumption 1] / [Assumption 2] / [Assumption 3]
~~~

此模式的可复制粘贴填空版本以及质量检查项位于 [`template.md`](template.md)。

### 最后一步（严格提供 4 个选项）

1. 追踪最强力量对你的战略中暴露出来的假设有何影响
2. 运行 [`market-landscape-scan`](../market-landscape-scan/SKILL.md)，明确每种力量背后的参与者
3. 将利润池分析结果输入安索夫增长选项分析（[`ansoff-matrix`](../ansoff-matrix/SKILL.md)）
4. 可供定期执行的版本：重新运行时应监测哪些力量信号？

接受 `1`、`2`、`3`、`4`、`1 and 3`、`Verbose Mode` 或自定义路径。

## 示例

**一个经得起“你怎么知道？”质疑的评级（虚构）：**

> ## 4. 买方议价能力——强
> - 信号：前 10 大买方约占该细分市场支出的 60%——**事实**（[行业协会数据，
>   URL]）；过去 18 个月中有三起被公开报道的客户从现有供应商转向竞争对手的案例，且没有报告任何惩罚——
>   **事实**（[媒体报道，URLs]）；公开的价目表使定价完全透明——**事实**
>   （[供应商定价页面]）；一家主要买方在内部构建了该能力——**事实**（[其
>   工程博客，URL]）
> - 这在此处意味着：买方能够可信地以离开或自行构建相威胁，因此在这一细分市场中，维持标价的能力
>   只是假象——折扣压力是结构性问题，而不是销售纪律问题。

**利润池结论发挥了应有作用：** 竞争程度中等，进入者威胁较弱，替代品威胁较强（AI
智能体正在吸收低复杂度层级），买方议价能力较强，供应商议价能力中等。利润池位于
受监管的高复杂度层级——这是两个强作用力唯一无法触及的地方——**推论**。对于
进入决策：*只能*通过受监管层级进入；大众市场层级的利润空间已被下游买方和上游 AI
替代所瓜分。

有关完整的五力分析实例，请参阅 [`examples/sample.md`](examples/sample.md)（虚构的
FSM 软件市场）。该实例以 `market-landscape-scan` 示例为基础，最终得出一个能够改变决策的利润池
结论。[`examples/sample-industrial.md`](examples/sample-industrial.md)
展示了这些作用力在工业市场中的逆转——请同时阅读这两个示例，了解该框架如何灵活适应，而不是机械套用。

## 常见陷阱

- **凭感觉评级。** 因为感觉市场很拥挤，就得出“竞争：强”的结论。每项评级都必须以附有 URL
  的信号为依据，否则整个练习就只是一张图。
- **忽略 AI 替代品。** 当 AI 工作流正在蚕食品类的低端市场时，却仍把替代品当作相邻产品
  来评估。即使评级是“较弱——暂时如此”，也要明确指出并进行评级。
- **混淆竞争者与市场结构。** 只罗列参与者（那是市场格局扫描的工作），而不是分析
  市场结构对所有参与者造成的影响。五力分析关注的是利润空间的运行规律，而不是参与者名单。
- **没有利润池结论。** 对五种作用力进行了评级，却没有回答“利润流向哪里？”结论才是
  分析；此前的所有内容都只是在汇集证据。
- **将结构强加于新兴品类。** 对尚未形成的作用力进行评级，只会产生看似自信的噪声。
  应说明“仍在形成中”，扫描市场格局，并在两个季度后重新评估。

## 参考资料

- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——统领全局的协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——支撑这些信号的 FININT/OSINT 来源
- [`market-landscape-scan`](../market-landscape-scan/SKILL.md)（工作流）——分析谁在参与；本技能则探究市场结构对他们有何影响
- [`swot-analysis`](../swot-analysis/SKILL.md)（工作流）——一家公司在该结构中的位置
- [`ansoff-matrix`](../ansoff-matrix/SKILL.md)（工作流）——基于利润池分析得出的增长选项
- Michael E. Porter，《竞争力量如何塑造战略》（《哈佛商业评论》，1979 年）
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/porters-five-forces-prompt.md`。