---
name: ansoff-matrix
argument-hint: "[company or product line, its current core, and the growth outcome sought]"
description: "Map evidence-backed growth options across the Ansoff Matrix with risk-rated sequencing. Use when the question is where the next tranche of growth comes from, and at what risk."
intent: >-
  A researched Ansoff Matrix, not a brainstorm grid: market penetration, market development, product
  development, and diversification, each quadrant populated with candidate moves backed by documented
  signals, risk ratings that respect the matrix's risk gradient, and a recommended sequence with the
  assumption that breaks it.
type: workflow
theme: market-intelligence
best_for:
  - "Answering 'where does the next tranche of growth come from?' with evidence per option"
  - "Forcing diversification proposals to carry the evidence burden their risk demands"
  - "Sequencing growth moves so early wins fund the riskier bets"
scenarios:
  - "Growth planning for next year — map our options across the Ansoff quadrants with evidence"
  - "The board wants a diversification story; pressure-test it against what the signals actually support"
estimated_time: "25-40 min per run"
---
# 安索夫矩阵（证据支撑）

## 目的

基于各象限的证据，梳理公司的增长选项：**使用或收集证据 → 包含信号的四个象限 → 按风险评级的推进顺序 → 后续步骤选项。** 四个象限——市场渗透、市场开发、产品开发、多元化——围绕一个问题展开：*下一阶段的增长来自哪里，风险又有多大？* 这是一种研究工具，而不是一厢情愿的白板推演：每个候选举措都必须回答“什么有据可查的信号表明这种需求确实存在？”最终结论应是一套推进顺序，因为增长选项会相互叠加——市场渗透为开发提供资金，而多元化押注则消耗这些资金。

## 输入

**最适合提供：**寻求增长的公司或产品线、其**当前核心业务**（服务谁、提供什么、规模多大——矩阵坐标轴均以此为参照进行定义），以及当前考虑的增长目标和时间范围。  
**同样有用：**约束条件（资本、能力、风险偏好），以及当前会话中的任何研究材料——行业格局扫描、五力分析，或 [`company-intel`](../company-intel/SKILL.md) 的输出，都能让矩阵专注于组织证据，而非收集证据。

调用时以内联方式提供的输入——技能名称后的文本、粘贴的上下文内容，或追加的 `ARGUMENTS:` 行——均视为已经给出的答案。应将其计入问题数量上限；不要重复询问。

**毫无准备也没关系。** 该技能开始时最多提出 3 个问题（核心业务、目标与时间范围、约束条件）；如果这些问题没有得到回答，则基于明确标注的假设继续执行。

**调用示例：**`Ansoff growth options for our field-service product line — core: dispatch software for mid-market HVAC firms, US. Outcome: +40% ARR in 24 months. Constraint: no acquisitions.`

## 核心概念

- **主导协议：**遵循 [`autonomous-investigation`](../autonomous-investigation/SKILL.md) 约定——问题数量上限为 3、搜索计划关卡、事实/推断/假设标签、适量模式（每个象限 2-3 个举措）、稳定的结构规范、包含 4 个选项的最终步骤。
- **框架（Ansoff，1957）：**增长选项分布在两个坐标轴上——现有与新*产品*、现有与新*市场*。市场渗透（现有/现有）是风险最低的象限；多元化（新/新）的风险最高，因为它同时放弃了已经验证需求的两个锚点。
- **风险梯度是铁律。** 市场渗透 < 市场开发 ≈ 产品开发 < 多元化。被评为“低风险”的多元化举措需要极其充分的证据——而风险梯度也说明了为什么多元化提案应承担最严格的证据要求，却往往拥有最薄弱的证据。
- **要信号，不要愿望。** 候选举措来自有据可查的信号：服务不足的细分市场数据、明确表达的需求（[`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md) 主题）、竞争对手的先例、能力证据。多元化象限为空是可以接受的答案；凭空捏造则不可以。
- **辅导与调查——同一张图，不同的任务：**
  [`organic-growth-advisor`](../organic-growth-advisor/SKILL.md) 是一个交互式的同类技能，通过提问来*诊断你的增长约束*（其增长路径矩阵与安索夫矩阵采用相同的坐标轴）；本技能则为每个象限中的选项*研究证据*。在那里进行诊断，在这里寻找证据——两者经过有意设计，可以搭配使用。
- **不适用的情况：**功能层面的优先级排序（本技能处于产品组合的战略高度——对于单项构建决策，请使用 [`feature-investment-advisor`](../feature-investment-advisor/SKILL.md)）；缺乏增长任务或执行能力——没有负责人承接的选项地图只是一张海报。
- **禁止虚构的内容：**市场规模、采用情况数据、竞争对手业绩、需求主张。如果规模测算很重要，应将其标记为需要使用 [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md) 处理，而不是进行猜测。

## 应用

1. **检查会话中是否已有证据**（市场格局扫描、五力分析、公司情报、VoC）。如有
   → 使用矩阵对其进行整理；仅搜索缺失信息。
2. **引用上下文中的信息**，然后只询问尚未回答的问题（最多 3 个）：
   1. 哪家公司或产品线？其当前核心业务是什么？
   2. 当前考虑的增长目标和时间跨度是什么？
   3. 是否存在任何约束——资本、能力、风险偏好？
3. **如果要从头开始研究，展示包含 3 个要点的搜索计划**——每个象限要搜索什么
   （细分市场数据、明确表达的需求、竞争对手先例、能力信号）、来源类型、
   事实与推断的区分方式。除非用户要求修改，否则继续执行。
4. **填充各个象限，并严格按照下方模式输出。**

### 输出模式（不要调整顺序）

~~~markdown
# Ansoff Growth Options: [Company / Product Line]
**As-of date:** | **Current core:** | **Growth outcome sought:**

## 1. Market Penetration (existing product, existing market — lowest risk)
- **[Candidate move]** — signal: [evidence, URL, label] — risk: [low/med/high, why]
- [2-3 moves]

## 2. Market Development (existing product, new market)
- **[Candidate move: segment, geography, or channel]** — signal: [evidence of underserved demand, URL, label] — risk: [rating, why]
- [2-3 moves]

## 3. Product Development (new product, existing market)
- **[Candidate move]** — signal: [expressed demand, VoC theme, competitor precedent, URL, label] — risk: [rating, why]
- [2-3 moves]

## 4. Diversification (new product, new market — highest risk)
- **[Candidate move]** — signal: [the extraordinary evidence this quadrant requires, URL, label] — risk: [rating, why]
- [1-2 moves; an empty quadrant is an acceptable answer]

## 5. Recommended Sequence (the "so what")
- **First:** [move] — because [evidence strength + funding logic]
- **Then:** [move] — funded/de-risked by the first
- **Not yet:** [the tempting move and why the evidence says wait]
- **The assumption that breaks this sequence:** [one line]

### Assumptions to Validate
- [Assumption 1] / [Assumption 2] / [Assumption 3]
~~~

此模式的可复制粘贴填充版本及质量检查项位于 [`template.md`](template.md)。

### 最后一步（严格提供 4 个选项）

1. 使用 TAM/SAM/SOM 估算首选举措的规模（[`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)）（推荐）
2. 使用事前验尸法对行动顺序进行压力测试
3. 深入分析多元化象限的证据
4. 将第一个举措转换为机会解决方案树（[`opportunity-solution-tree`](../opportunity-solution-tree/SKILL.md)）

接受 `1`、`2`、`3`、`4`、`1 and 2`、`Verbose Mode` 或自定义路径。

## 示例

**一个足以被纳入象限的条目（虚构）：**

> ## 2. 市场开发
> - **相邻行业：规模区间相同的管道承包商**——信号：在我们品类的评论网站提及中，14% 会在未受提示的情况下
>   提到管道公司，并询问“这适用于管道行业吗？”——
>   **事实**（[评论讨论串，URL]）；服务管道行业的两家现有厂商都将排程功能
>   限制在企业级套餐中——**事实**（[定价页面]）——风险：**中等**——需求信号真实存在，
>   但属于二手信息；销售模式可以迁移，集成能力则无法完全迁移。

**收尾部分的行动顺序发挥了应有的作用：**

> - **首先：** 面向已流失但仍可触达的客户群开展挽回营销活动（市场渗透）——证据最有力，
>   可为其他所有行动提供资金，1 个季度即可回本
> - **然后：** 切入管道承包商市场（市场开发）——市场渗透的成功所带来的
>   现金和案例研究降低了其风险
> - **暂不行动：** IoT 硬件捆绑包（多元化）——仅有一位分析师提及，加上创始人的
>   热情，不能算作非同寻常的证据
> - **会使这一顺序失效的假设：** 流失客户是因为可解决的原因而离开；如果
>   赢单/丢单分析表明他们离开的是整个*品类*，那么将市场渗透作为第一步就是无效的，应由市场开发先行。

请参阅 [`examples/sample.md`](examples/sample.md)，查看一个完整的矩阵示例（虚构的 FSM 软件
市场）；其中的多元化象限如实留空，并明确指出了会使行动顺序失效的假设。
[`examples/sample-industrial.md`](examples/sample-industrial.md) 展示了相反的教训：一个已填充的
多元化象限，但其中的项目在书面评估中未能达到证据门槛。

## 常见陷阱

- **头脑风暴表格。** 四个象限充斥着没有来源支撑的雄心。每项行动都必须回答“什么信号
  表明这种需求确实存在？”，否则就不能推进——仅此一条规则，就能让安索夫矩阵从墙上的装饰
  变成实用工具。
- **否认风险梯度。** 仅凭热情就将多元化行动评定为低风险。风险梯度正是
  这一框架的核心教义：新产品*加上*新市场，意味着两个锚点都不存在了。
- **强行填满象限。** 因为留空显得偷懒，就硬要填充多元化象限。如实留空的
  象限是一项发现；硬塞进去的项目则是一项带有截止期限的负债。
- **只有选项，没有顺序。** 只有一份菜单，却没有第一步行动、资金逻辑，也没有会使其失效的
  假设。增长选项会产生复利效应——顺序就是战略。
- **凭感觉估算规模。** 为行动附上凭空捏造的市场规模。“禁止虚构”清单会将
  规模估算交由 TAM/SAM/SOM 计算器处理，并由计算过程展示其依据。

## 参考资料

- [`organic-growth-advisor`](../organic-growth-advisor/SKILL.md)（交互式）——用于辅导的
  配套技能：诊断*哪条*增长路径适合你的约束条件；本技能则为各个选项提供证据
- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）——总体管控协议
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）——各象限对应的信号来源
- [`porters-five-forces`](../porters-five-forces/SKILL.md)（工作流）——为本分析提供输入的利润池研判
- [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)（组件）——估算各项行动的规模
- [`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md)（工作流）——用于产品开发的显性需求信号
- [`opportunity-solution-tree`](../opportunity-solution-tree/SKILL.md)（交互式）——构建第一步行动的执行结构
- H. Igor Ansoff，《多元化战略》（Harvard Business Review，1957）
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  `market-intelligence/ansoff-matrix-prompt.md`。