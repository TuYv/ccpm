---
name: competitive-analysis-process
argument-hint: "[competitor set or market, and the decision this analysis supports]"
description: "Orchestrate a complete competitive analysis across six steps, from landscape to strategic direction. Use when you need the full picture, not a single scan or card."
intent: >-
  The umbrella workflow for competitive analysis: six analytical steps — landscape overview, product
  comparison, customer-need fulfillment, business baseline, perception and positioning, strategic
  direction — each grounded in named frameworks and delegated to the right investigation skill, ending
  in the four output artifacts that make the work actionable.
type: workflow
theme: market-intelligence
best_for:
  - "Running a complete competitive analysis instead of a one-off scan"
  - "Sequencing the market-intelligence skills into one coherent engagement"
  - "Choosing which analytical step (and which framework) a competitive question actually needs"
scenarios:
  - "New fiscal year, new strategy cycle — run the full competitive analysis on our space"
  - "I've got scattered competitive research everywhere; give me the process that organizes it"
estimated_time: "1-2 weeks calendar time; each step is a 20-45 min working session"
---
# 竞争分析流程

## 目的

通过**六个分析步骤**，统筹严谨、可重复的竞争分析，并产出四类可执行成果（竞争作战卡、对比矩阵、定位反制举措、威胁评估）。这是一个总领性流程：每个步骤都会说明其目的、所使用的框架，以及负责执行工作的技能——就像 `discovery-process` 统筹各项探索技能一样。在一个战略周期中运行全部六个步骤；当出现特定问题时，则运行其中一个步骤。这些步骤环环相扣，但具体顺序可根据决策需要灵活调整。

## 输入

**最适合提供：**范围内的市场或竞争对手集合，以及**本次分析所支持的决策**——例如路线图押注、定位更新、市场进入或交易防守。具体决策将决定哪些步骤需要深入执行，哪些步骤可以略过。
**同样有用：**任何现有情报——例如之前的市场格局扫描、快照、竞争作战卡或 `company-intel` 输出——以便各步骤直接利用，而不是重复已有工作。

调用时以内联方式提供的输入——技能名称之后的文本、粘贴的上下文内容，或附加的 `ARGUMENTS:` 行——都应视为已经给出的答案。直接使用这些信息；不要再次询问。

**毫无准备也可以。**该工作流首先会询问当前需要做出什么决策以及你已经掌握了哪些信息，然后建议要运行哪些步骤及其执行顺序。

**调用示例：** `Run the competitive analysis process on the mid-market payroll space —
decision: whether we defend down-market or push up. We have last quarter's landscape scan.`

## 核心概念

- **六个步骤，四类输出。**这些步骤是分析视角；而输出（竞争作战卡、对比矩阵、定位举措、威胁评估）才是销售人员、高管和路线图负责人实际使用的内容。不能为某项输出提供支持的步骤就是绕路。
- **步骤负责委派；此技能负责统筹。**以下每个步骤都会指定负责执行工作的技能。本文档定义顺序、框架和决策点，而不涉及研究工作的具体机制。
- **全程遵循证据规范。**每个步骤都遵循
  [`autonomous-investigation`](../autonomous-investigation/SKILL.md) 协议
  （事实/推断/假设标签、真实 URL、置信度叠加），并从 [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 中规定的渠道获取信号。
- **使用具名且有出处的框架。**每个步骤都建立在已发表的战略研究成果之上——波特五力模型、Kano 模型、待办任务理论、商业模式画布、里斯与特劳特的定位理论，以及哈默尔与普拉哈拉德的战略意图理论。各框架都会在使用处进行定义；智能体不应假设读者已具备相关知识。
- **现状 ≠ 未来。**步骤 1-5 分析竞争对手目前*所处的位置*；步骤 6 分析他们*将要前往的方向*——而这恰恰是大多数团队最容易跳过的步骤，也正因如此，他们总是措手不及。

## 应用

**步骤 0——范围界定。**确认要支持的决策、竞争对手集合（或运行
[`market-landscape-scan`](../market-landscape-scan/SKILL.md) 来识别竞争对手），以及哪些步骤至关重要。
以编号菜单的形式列出六个步骤；当某项决策不需要全部六个步骤时，推荐其中一个子集。

### 第 1 步：竞争格局概览

*有哪些参与者、身处何地，以及如何运营——市场饱和度、碎片化程度和颠覆性新进入者。*

- **框架：** 波特五力模型（行业结构）；战略群组图谱（按 GTM 模式、创新模式或区域深耕程度对
  竞争对手进行聚类）；市场碎片化指数。
- **运行：** [`market-landscape-scan`](../market-landscape-scan/SKILL.md)——细分市场、参与者图谱、
  动态，以及通过死区测试识别的市场空白。
- **决策点：** 哪 2-4 个参与者值得深入研究？后续所有工作都将聚焦于它们。

### 第 2 步：产品层面的比较

*超越功能列表：价值交付、架构、互操作性和生命周期成熟度。*

- **框架：** Kano 模型（哪些功能令人惊喜，哪些仅能满足基本需求）；杰弗里·摩尔的完整产品
  模型（核心产品，以及交易能否达成实际取决于的服务与集成外环）；
  基于 JTBD 的能力图谱（按客户任务而非功能名称进行比较）。
- **运行：** 针对选定的参与者运行 [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)——
  其比较矩阵就是本步骤的产出。
- **注意：** 功能对等的表面文章。按待完成任务构建的能力图谱能揭示功能
  核对表所掩盖的问题：两个“相同”的功能可能以糟糕的方式服务于不同任务。

### 第 3 步：满足客户需求的能力

*它们服务真实客户的成效——成果、支持质量、生态系统收益——而非技术规格。*

- **框架：** 结果驱动型创新（依据客户定义的结果评分）；价值
  主张画布（它们的承诺与真正重要的任务、痛点和收益之间的对照）。
- **运行：** 在买家阅读的信息来源中运行 [`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md)——
  提取需求主题、逐字引述、竞争对手弱点和转换触发因素，并为每项内容附上
  来源偏差说明。
- **注意：** 供应商撰写的“评论”和案例研究。相互独立的投诉聚类才是
  信号；精心筛选的成功故事只是营销。

### 第 4 步：汇编商业信息

*财务、组织和市场基线：结构、收入来源、增长杠杆和渠道。*

- **框架：** 商业模式画布（整个商业机器如何协同运转）；收入来源
  明细；销售渠道画像（直销与 OEM、VAR、平台模式的对比）。
- **运行：** 为每个深入研究的竞争对手运行 [`company-intel`](../company-intel/SKILL.md)——其包含十一个部分的
  输出（财务、产品与服务、组织信号）就是本步骤的产出；由
  `intelligence-collection-disciplines` 规定的 FININT 来源承担主要工作。
- **注意：** 新闻稿式会计。监管文件和财报电话会议的可信度高于公告——
  在说谎构成重罪的场合，公司会更少说谎。

### 第 5 步：认知与相对定位

*买家如何看待你和它们之间的差异——体现在承诺、情感和心理联想上，而非能力上。*

- **框架：** 里斯与特劳特定位理论（争夺的是买家的心智）；感知
  图谱（价格与感知价值图；寻找无人竞争的空间）；蓝海战略画布。
- **运行：** 将它们的*声明式*定位（第 2 步快照）与*客户语言*（第 3 步
  评论挖掘）进行对照；使用 [`positioning-statement`](../positioning-statement/SKILL.md) 起草或修订。
- **注意：** 承诺与交付之间的差距——竞争对手的营销开出的支票，被评论指出
  无法兑现之处。这个差距正是有待占据的反向定位机会。

### 第 6 步：竞争对手的战略方向

*关注他们将走向何方，而非当前身处何处——这一步让你能够抢先行动，而不是被动应对。*

- **框架：**Hamel 与 Prahalad 的战略意图（解读行动背后的雄心）；创新雄心矩阵（分析其押注在核心、邻近和变革性创新上的组合）。
- **执行：**运用
  [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 中面向未来的情报纪律——TECHINT
  （专利集群、商标申请、预印本）、HUMINT（招聘激增、领导层变动）、FININT
  （财报措辞、并购主题）、MASINT（供应链、设施扩建）——并通过置信度叠加规则进行融合。完成初次分析后，由
  [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) 按固定节奏持续执行
  此步骤。
- **注意：**不要因单一信号而恐慌。一项专利只是探索；一个专利集群，加上一轮招聘激增，再加上一张
  子域名证书，才表明这是一项坚定投入的押注。先叠加信号，再进行汇报。

### 第 7 步：产出成果

最后，构建受众实际使用的内容——以编号菜单形式提供：

1. 面向一线团队的**竞争作战卡**——[`battle-card-builder`](../battle-card-builder/SKILL.md)
2. **高管竞品对比矩阵**——基于第 2 步的快照
3. **定位反制措施**——基于第 5 步的差距分析
4. **威胁评估简报**——整合第 6 步的融合信号，并附置信度和建议响应措施

然后设定维护节奏：按照 `intelligence-collection-disciplines` 中成果映射所规定的
计划运行 [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（针对作战卡每周更新 SIGINT
层，针对战略方向每季度进行一次深度分析）。

涵盖全部七个步骤、可复制粘贴的项目跟踪器位于 [`template.md`](template.md)。

## 示例

**根据决策界定范围（虚构示例）：**当前决策是在企业级交易中针对一个竞争对手进行商机防守。
正确的范围是仅针对该竞争对手执行第 2、3 和 5 步，并直接产出竞争作战卡——
第 1、4 和 6 步只会增加耗时，并不会提高胜率。编排器的价值在于*允许跳过*：“根据
你的决策，我建议仅执行第 2→3→5 步。是否执行完整的六步流程？
1. 是，商机防守范围（2、3、5 → 竞争作战卡）
2. 加入第 6 步——他们最近一直在进行收购，我想了解其战略方向
3. 执行完整的六步流程
4. 其他”

**第 6 步发现第 1-5 步遗漏的内容：**现状分析显示，某个竞争对手表现稳定，
处于市场中游。战略方向分析发现了一个属于新分类的专利集群、四个面向平台工程师的
招聘职位，以及一次财报电话会议，其中 CFO 拒绝单独披露 R&D——三种情报纪律指向同一个结论：
一场平台转型正在进行。威胁评估简报将其评级从“监控”提升为“行动”，
比他们发布公告迫使你仓促被动应对早了一个季度。

请参阅 [`examples/sample.md`](examples/sample.md)，了解一个完整的项目示例（虚构的
FSM 软件市场），其中展示了编排决策——范围界定菜单、已记录的跳过项，以及
步骤之间的复利效应——并提供指向各项委派技能自身完整成果示例的链接。
[`examples/sample-industrial.md`](examples/sample-industrial.md) 展示了这一总框架如何灵活调整——
合并步骤、一次乱序执行、放慢更新节奏——并说明每次调整背后的理由。

## 常见陷阱

- **自动执行全部六个步骤。** 这些步骤是一份菜单，而不是强制要求。应根据所需决策限定范围，否则分析交付时，决策早已在没有它的情况下做出。
- **跳过第 6 步。** 现状分析一经交付便开始过时；方向分析则能为你争取一个季度的提前量。跳过这一步的团队总会在发布当天措手不及。
- **只罗列框架名称。** 引用五力模型却不评估各项力量，或引用 Kano 模型却不对任何功能进行分类。框架只有在帮助做出判断时，才值得被提及。
- **有分析却没有产出物。** 六个精彩的步骤，却没有作战卡、矩阵或简报。第 7 步
  并非可选项——只有明确指出研究将改变哪项产出物，研究才算完成。
- **一次性的英雄主义。** 每年进行一次大规模分析，到第三个月便已过时。只有建立监测节奏，流程才算结束；否则它并未结束——只是停止了。

## 参考资料

- [`market-landscape-scan`](../market-landscape-scan/SKILL.md)（工作流）— 第 1 步
- [`competitive-research-snapshot`](../competitive-research-snapshot/SKILL.md)（工作流）— 第 2 步
- [`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md)（工作流）— 第 3 步
- [`company-intel`](../company-intel/SKILL.md)（工作流）— 第 4 步
- [`positioning-statement`](../positioning-statement/SKILL.md)（组件）— 第 5 步
- [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)（工作流）— 第 6 步的节奏与维护
- [`battle-card-builder`](../battle-card-builder/SKILL.md)（工作流）— 第 7 步的产出物
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）— 贯穿始终的信号渠道
- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）— 贯穿始终的证据规范
- 外部框架：Porter，*竞争力量如何塑造战略*（HBR，1979）；Kano，魅力质量理论；Moore，*跨越鸿沟*（完整产品）；Ulwick，成果导向型创新；
  Osterwalder 与 Pigneur，*商业模式新生代*；Ries 与 Trout，*定位*；Hamel 与 Prahalad，
  *竞争未来*（HBR，1994）；Nagji 与 Tuff，*管理你的创新组合*（HBR，2012）
- 改编自在实践中开展结构化竞争分析的经验。