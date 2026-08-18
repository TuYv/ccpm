---
# AGENT SKILLS STANDARD FIELDS (v2)
name: backwards-design-unit-planner
description: "Plan a unit using backwards design from desired outcomes through assessment evidence to learning activities. Use when starting a new unit or redesigning an existing one from standards."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/backwards-design-unit-planner"
skill_name: "Backwards Design Unit Planner"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Wiggins & McTighe (1998, 2005) — Understanding by Design"
  - "Wiggins & McTighe (2011) — The Understanding by Design Guide to Creating High-Quality Units"
  - "Tomlinson & McTighe (2006) — Integrating Differentiated Instruction and Understanding by Design"
  - "Hattie (2009) — Visible Learning: backward design and clarity of learning intentions"
  - "Biggs & Tang (2011) — Teaching for Quality Learning at University: constructive alignment"
input_schema:
  required:
    - field: "desired_outcomes"
      type: "string"
      description: "What students should understand, know, and be able to do by the end of the unit"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "unit_duration"
      type: "string"
      description: "Number of lessons or weeks"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "curriculum_framework"
      type: "string"
      description: "From context engine: specific curriculum standards to address"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: prior attainment, known gaps, class composition"
    - field: "available_resources"
      type: "string"
      description: "Key texts, materials, or resources available"
output_schema:
  type: "object"
  fields:
    - field: "stage_1_desired_results"
      type: "object"
      description: "Enduring understandings, essential questions, knowledge and skills"
    - field: "stage_2_assessment_evidence"
      type: "object"
      description: "Performance tasks and other evidence that will demonstrate understanding"
    - field: "stage_3_learning_plan"
      type: "object"
      description: "Sequenced learning activities aligned to stages 1 and 2"
    - field: "alignment_check"
      type: "string"
      description: "Verification that activities, assessments, and outcomes are aligned"
chains_well_with:
  - "competency-unpacker"
  - "criterion-referenced-rubric-generator"
  - "formative-assessment-technique-selector"
  - "explicit-instruction-sequence-builder"
  - "curriculum-knowledge-architecture-designer"
  - "kud-knowledge-type-mapper"
  - "critical-thinking-task-designer"
  - "scope-and-sequence-designer"
teacher_time: "5 minutes"
tags: ["UbD", "backwards-design", "unit-planning", "curriculum", "alignment"]
---
# 逆向设计单元规划器

## 此技能的作用

根据教师设定的预期成果，生成完整的第 1–2–3 阶段理解 by Design 单元结构：第 1 阶段明确持久性理解、基本问题以及目标知识与技能；第 2 阶段设计能够证明学生理解程度的评估证据（在规划任何活动之前）；第 3 阶段安排学习活动的顺序，使其逐步达成评估要求和预期成果。逆向设计的关键洞见在于：评估必须先于教学进行设计，而不是事后补充；评估应当定义成功的样子。AI 在此尤其有价值，因为逆向设计要求同时把握三个阶段，并确保它们之间紧密对齐——评估内容必须符合预期目标，教学内容必须为学生应对评估做好准备。大多数教师设计单元时会先规划活动，最后才设计评估，这会导致彼此不匹配。

## 证据基础

Wiggins 与 McTighe（1998、2005）提出了 Understanding by Design（UbD），这是教育领域应用最广泛的课程设计框架。该框架的核心论点是：课程应当从预期结果出发进行逆向设计，而不是从现有活动出发向前推进。第 1 阶段（预期成果）明确学生应当理解什么——不仅是应当知道什么或能够做什么，更是要在可迁移的层面上真正理解。第 2 阶段（评估证据）确定哪些证据能够证明这种理解——在教学之前完成设计，从而使教学指向真实成果，而不仅仅是完成内容覆盖。第 3 阶段（学习计划）安排必要教学的顺序，使其逐步达成经过评估的成果。Wiggins 与 McTighe（2011）为单元创建提供了实践指导，强调持久性理解应当是值得理解、能够迁移到单元之外的观点，而基本问题应当真正开放——能够激发探究，而不是有预设答案的问题。Biggs 与 Tang（2011）提出了“建构性对齐”理论——学习成果、评估任务和教学活动必须彼此对齐，使评估内容就是教学内容，同时教学内容能够为学生应对评估做好准备。Hattie（2009）证实，明确的学习意图和成功标准是影响学生成就的高杠杆因素之一。

## 输入模式

教师必须提供：
- **预期成果：** 学生应当理解、知道并能够做到什么。*例如：“学生将理解生物如何通过自然选择适应其环境，掌握关键词汇（适应、变异、自然选择、进化），并能够解释某一特定生物的特征与其环境之间的关系。”*
- **学生年级：** 年级组。*例如：“9 年级”*
- **单元时长：** 单元持续时间。*例如：“6 节课（每节 1 小时）”/“3 周”*

可选（如有可用信息，则由上下文引擎注入）：
- **学科领域：** 课程所属学科
- **课程框架：** 具体标准
- **学生情况：** 先前学习成就、已知知识 gaps
- **可用资源：** 文本、材料、资源

## 提示词

```
You are an expert in curriculum design, with deep knowledge of Wiggins & McTighe's (1998, 2005) Understanding by Design framework, Biggs & Tang's (2011) constructive alignment, and Hattie's (2009) research on learning intentions and success criteria. You understand that effective unit design works BACKWARD from desired results — defining what students will understand first, then designing assessment evidence, then planning learning activities.

Your task is to design a UbD unit for:

**Desired outcomes:** {{desired_outcomes}}
**Student level:** {{student_level}}
**Unit duration:** {{unit_duration}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the desired outcomes.
**Curriculum framework:** {{curriculum_framework}} — if not provided, design in general terms.
**Student profiles:** {{student_profiles}} — if not provided, assume a typical mixed-ability class.
**Available resources:** {{available_resources}} — if not provided, suggest appropriate resources.

Apply these evidence-based principles:

1. **Stage 1 — Desired Results (Wiggins & McTighe, 2005):**
   - **Enduring understandings:** Big ideas that are transferable beyond this unit. These are not facts to memorise but principles to understand. Frame as "Students will understand that..." statements.
   - **Essential questions:** Open, thought-provoking questions that guide inquiry throughout the unit. These should be genuinely debatable — not questions with a single right answer. They should recur throughout the unit, with students' answers deepening over time.
   - **Knowledge:** Specific facts, concepts, and vocabulary students will know.
   - **Skills:** Specific abilities students will be able to demonstrate.

2. **Stage 2 — Assessment Evidence (Wiggins & McTighe, 2005; Biggs & Tang, 2011):**
   - Design assessment BEFORE instruction. This is the core UbD principle.
   - **Performance task:** A rich, authentic task that requires students to demonstrate understanding through application — not just recall facts. The task should require transfer — applying learning to a new situation.
   - **Other evidence:** Additional assessment methods (quizzes, checks for understanding, observations) that gather evidence of knowledge and skills.
   - Assessment must be aligned to Stage 1 — every enduring understanding and essential question must be assessable through the evidence in Stage 2.

3. **Stage 3 — Learning Plan (Wiggins & McTighe, 2005):**
   - Sequence learning activities that build toward the Stage 2 assessments.
   - Use the WHERETO framework: Where are we going? Hook the student. Explore and equip. Rethink and revise. Evaluate. Tailor to individual needs. Organise for understanding.
   - Activities should be sequenced logically — building knowledge before applying it, scaffolding before independence.
   - Each activity should connect clearly to the Stage 2 assessment — if an activity doesn't prepare students for the assessment, question whether it belongs.

4. **Alignment check (Biggs & Tang, 2011):**
   - Verify that Stage 1 outcomes are assessed in Stage 2 and taught in Stage 3.
   - Flag any misalignment: outcomes that are stated but not assessed, or assessed but not taught.

Return your output in this exact format:

## Unit Plan: [Unit Title]

**For:** [Student level]
**Subject:** [Subject area]
**Duration:** [Unit duration]

### Stage 1: Desired Results

**Enduring Understandings**
[2–3 transferable understandings — "Students will understand that..."]

**Essential Questions**
[2–3 open, recurring questions that guide inquiry]

**Students will know:**
[Specific knowledge — facts, concepts, vocabulary]

**Students will be able to:**
[Specific skills]

### Stage 2: Assessment Evidence

**Performance Task**
[Description of the authentic assessment task, including: the scenario, what students produce, what the task assesses, and brief success criteria]

**Other Evidence**
[Additional assessment methods mapped to specific Stage 1 outcomes]

### Stage 3: Learning Plan

[Lesson-by-lesson or phase-by-phase sequence, showing: what happens, what it builds toward, and how it connects to Stage 2]

### Alignment Check

[Verification that all Stage 1 outcomes are assessed in Stage 2 and addressed in Stage 3. Flag any gaps.]

**Self-check before returning output:** Verify that (a) enduring understandings are transferable ideas, not just facts, (b) essential questions are genuinely open and recurring, (c) the performance task requires application/transfer, not just recall, (d) Stage 2 was designed before Stage 3 in logic (assessment determines instruction), (e) every Stage 1 outcome is assessed and taught, and (f) the learning plan builds progressively toward the performance task.
```

## 示例输出

**情境：** *期望成果：“学生将理解自然选择如何推动生物适应，掌握关键概念（适应、变异、遗传、自然选择、进化），并能够解释特定生物的性状如何适应其环境，以及种群如何随时间发生变化。” / 学生年级：“9 年级” / 单元时长：“8 节课（每节 50 分钟）” / 学科领域：“科学（生物学）”*

---

## 单元计划：自然选择与适应

**适用年级：**9 年级  
**学科：**科学（生物学）  
**时长：**8 节课（每节 50 分钟）

### 阶段 1：预期学习成果

**持久性理解**
1. 学生将理解，**具有更适合其环境的性状的生物更有可能存活并繁殖，这些性状会遗传给后代，从而导致种群随时间发生变化。**（这就是自然选择的机制。）
2. 学生将理解，**种群内部的变异是自然选择的必要条件——没有变异，环境就没有可以“选择”的对象。**
3. 学生将理解，**适应是多代自然选择的结果，而不是单个生物有意做出的选择。**（生物不会选择去适应；种群之所以发生变化，是因为更适应环境的个体留下了更多后代。）

**核心问题**
1. “为什么生物会呈现出它们现在的样子？”（贯穿始终——答案会从第 1 课的“因为它们适应了环境”逐步深化为第 8 课的“因为自然选择偏 favor 了那些在特定环境中能够提高存活和繁殖机会的性状”。）
2. “如果环境发生变化，那些适应旧环境的生物会发生什么？”（促使学生理解适应并非永久不变——它取决于具体环境。）
3. “为什么变异很重要？”（将遗传学与进化联系起来——没有变异，自然选择就无法发挥作用。）

**学生将掌握：**
- 适应、变异、遗传、自然选择、进化和物种的定义
- 已命名生物的结构适应、行为适应和功能适应示例
- 变异源于遗传差异（有时也源于环境因素）
- 自然选择所需的四个条件：变异、遗传、选择压力、差异性繁殖
- Darwin 对自然选择进化理论的贡献

**学生将能够：**
- 解释某种已命名生物的具体性状如何帮助其在环境中生存
- 逐步描述自然选择的过程
- 预测当环境发生变化时，种群可能会发生什么
- 区分 Lamarck 主义（获得性状）和 Darwin 主义（自然选择）的解释，并说明为什么 Lamarck 的解释是不正确的

### 阶段 2：评估证据

**表现性任务：“岛屿”**

*情境：“一个甲虫种群生活在一座火山岛上。这些甲虫的体色从绿色到棕色不等。岛上覆盖着绿色植被。最近，一次火山喷发使岛上大部分地区覆盖了深灰色的火山灰。科学家预测，50 代之后，这个甲虫种群的外观将会大不相同。你的任务是：运用自然选择理论，撰写一份科学解释，预测甲虫种群将如何变化以及为什么会发生这种变化。你的解释必须包含自然选择的全部四个条件，并回应一种常见误解，即认为单个甲虫会“选择”改变体色。”*

*学生产出：* 一篇 200–300 字的科学解释。

*任务评估内容：*
- 持久性理解 1：自然选择的机制（他们能否正确解释这一过程？）
- 持久性理解 2：变异的作用（他们是否能指出现有的体色变异是必不可少的？）
- 持久性理解 3：适应不是一种选择（他们是否能解释发生变化的是种群，而不是单个甲虫？）
- 核心问题 1 和 2：适应环境的生物 + 环境变化
- 知识：四个条件，正确的术语
- 技能：分步骤解释，区分达尔文主义推理与拉马克主义推理

*简要成功标准：*
- 指出种群中已有的变异（体色范围）
- 解释选择压力（在白蜡树上，颜色较深的甲虫具有更好的伪装效果）
- 描述差异性生存和繁殖
- 解释性状如何遗传给后代
- 预测种群在数代之后的变化
- 说明甲虫并不会“选择”改变体色这一误解

**其他证据**

| 课次 | 评估 | 所评估的阶段 1 学习成果 |
|--------|-----------|------------------------|
| 2 | 出门条：“列出北极熊的 3 种适应性特征，并解释每种特征如何帮助它生存。” | 知识（适应性特征）；技能（解释特征与环境之间的联系） |
| 4 | 小白板关键问题：“长颈鹿伸长脖子去够树叶。它们的后代出生时脖子更长。这是达尔文主义还是拉马克主义？为什么？” | 理解 3（适应不是一种选择）；知识（拉马克与达尔文） |
| 6 | 同伴解释：学生使用一个新例子向同伴解释自然选择；同伴根据 4 步检查清单进行核对 | 知识（四个条件）；技能（分步骤解释） |

### 阶段 3：学习计划

**第 1 课——导入与探索：“生物为什么会呈现出这样的外形？”**
- 展示 5 种具有奇特适应性特征的生物图片（鮟鱇鱼、仙人掌、北极狐、变色龙、深海管虫）。学生讨论：“这种生物为什么会长成这样？这一特征解决了什么问题？”
- 引入核心问题 1。学生写下最初的回答。
- 定义“适应”——结构性、行为性和功能性适应。学生对这 5 个例子进行分类。
- *为以下内容作铺垫：* 阶段 2 表现性任务（解释特征与环境之间的联系）。

**第 2 课——获得：适应的类型**
- 详细研究 3 种生物及其适应性特征（分别为一种结构性、一种行为性和一种功能性适应）。
- 学生以书面形式解释：“[特征] 如何帮助 [生物] 在 [环境] 中生存？”
- *出门条评估。*
- *为以下内容作铺垫：* 阶段 2 表现性任务（解释特征如何适应环境）。

**第 3 课——探索：变异**
- 实践活动：测量种群中的变异（例如手掌宽度、叶片大小或模拟甲虫数据）。
- 核心概念：每个种群内部都存在变异。有些变异是遗传的。
- 引入核心问题 3：“为什么变异很重要？”
- *为以下内容作铺垫：* 持久性理解 2（变异是自然选择不可或缺的条件）。

**第 4 课——掌握：一步一步理解自然选择**
- 明确讲授自然选择的 4 个条件（变异、遗传、选择压力、差异性繁殖）。
- 以桦尺蠖为完整示例，逐步示范解释过程。
- 介绍拉马克与达尔文观点的区别。常见误解：“长颈鹿把脖子伸长了。”
- *关键节点问题评估。*
- *为以下内容作铺垫：*表现性任务（学生必须运用这 4 个条件）。

**第 5 课——探究与反思：模拟活动**
- 模拟活动：“适者生存”：将不同颜色的纸制“生物”放在不同背景上。学生观察哪些“生物”被“吃掉”（受到选择淘汰），哪些能够存活。重复进行 3 个“世代”。
- 学生观察到，种群会随着时间发生变化，而不是个体发生变化。
- 回顾核心问题 1：更新答案。
- *为以下内容作铺垫：*持久性理解 3（发生变化的是种群，而不是个体）。

**第 6 课——掌握与评价：练习解释**
- 学生使用一个新的示例（例如细菌的抗生素耐药性）练习撰写自然选择解释。
- 使用表现性任务评价标准中的 4 步检查清单进行同伴评价。
- 教师巡视课堂，找出常见错误，并向全班反馈。
- *为以下内容作铺垫：*表现性任务（练习评价中考查的具体技能）。

**第 7 课——表现性任务：“岛屿”**
- 学生在有支持的条件下完成表现性任务。
- 为 EAL 学生提供句子开头。为所有学生提供词汇表（对于拓展学生，可以移除词汇表）。
- 教师巡视课堂，记录常见误解，以便在第 8 课进行反馈。

**第 8 课——反思与拓展：反馈与迁移**
- 发还批改后的作业，并提供针对性反馈。
- 全班复习最常见的错误（尤其是拉马克式推理）。
- 拓展：“人类使用抗生素已有约 80 年。细菌正在产生耐药性。请使用自然选择解释其原因。”
- 回顾全部三个核心问题：学生写下最终答案，并与第 1 课的答案进行比较。

### 对齐检查

| 阶段 1 学习成果 | 是否在阶段 2 中进行评估？ | 是否在阶段 3 中进行教学？ | 是否对齐？ |
|-----------------|---------------------|--------------------|---------|
| 理解 1（自然选择机制） | 表现性任务 + 第 6 课同伴评价 | 第 4、5、6 课 | ✓ |
| 理解 2（变异是必要条件） | 表现性任务 | 第 3 课 | ✓ |
| 理解 3（适应不是一种选择） | 表现性任务 + 第 4 课关键节点问题 | 第 4、5 课 | ✓ |
| 知识（关键术语） | 所有评估都要求使用术语 | 在第 1–4 课中逐步引入 | ✓ |
| 技能（解释性状与环境之间的联系） | 第 2 课离堂条 + 表现性任务 | 第 1、2 课 | ✓ |
| 技能（逐步进行解释） | 表现性任务 + 第 6 课同伴检查 | 第 4、6 课（进行示范与练习） | ✓ |

未发现不对齐之处。阶段 1 的所有学习成果都得到了评估和教学。

---

## 已知局限

1. **单元计划提供的是结构，而不是详细的课程计划。** 每个课程条目描述了关键活动及其目的，但不包括完整的时间安排、差异化教学、教学资源或教师讲稿。教师应将 Stage 3 的流程作为框架，并使用其他技能（Explicit Instruction Sequence Builder、Lesson Opening Designer 等）制定详细的课程计划。

2. **逆向设计假设预期成果是明确的。** 如果教师最初的成果陈述较为模糊（“学生将了解自然选择”），UbD 结构的精确性就会降低。单元的质量取决于输入内容的具体程度。如果在单元设计前需要明确成果，可与 Competency Unpacker 结合使用。

3. **表现性任务是针对特定情境设计的，可能需要调整。** “Island”情境适用于这一 Biology 主题，但可能无法直接适用于其他学校的资源或评估要求。教师应根据自身的评估框架审查表现性任务，并在保持评估设计原则的同时调整情境。