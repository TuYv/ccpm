---
# AGENT SKILLS STANDARD FIELDS (v2)
name: formative-assessment-loop-designer
description: "Design an adaptive assessment loop where each student response triggers the next instructional move. Use when building technology-enhanced formative assessment cycles."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/formative-assessment-loop-designer"
skill_name: "Formative Assessment Loop Designer for AI Systems"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Black & Wiliam (1998) — Assessment and classroom learning (seminal meta-analysis)"
  - "Black & Wiliam (2009) — Developing the theory of formative assessment"
  - "Wiliam (2011) — Embedded formative assessment"
  - "VanLehn (2006) — The behavior of tutoring systems (inner loop vs. outer loop)"
  - "Shute & Zapata-Rivera (2012) — Adaptive educational systems"
input_schema:
  required:
    - field: "learning_objective"
      type: "string"
      description: "The specific learning objective that the formative assessment loop should monitor — what students are trying to learn"
    - field: "current_assessment_approach"
      type: "string"
      description: "How assessment currently works in this context — when teachers check understanding, what they check, and what they do with the information"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "ai_system_capabilities"
      type: "string"
      description: "What the AI system can do — real-time monitoring, adaptive questioning, dashboard reporting, or other"
    - field: "class_size"
      type: "string"
      description: "How many students the system needs to support simultaneously"
    - field: "assessment_frequency"
      type: "string"
      description: "How often assessment data should be collected — continuous, per-task, daily, weekly"
output_schema:
  type: "object"
  fields:
    - field: "assessment_loop_design"
      type: "object"
      description: "The complete formative assessment loop — what is assessed, how, when, and what happens with the results"
    - field: "elicitation_strategies"
      type: "array"
      description: "How to surface student understanding — the specific questions, tasks, and probes that reveal thinking"
    - field: "interpretation_framework"
      type: "object"
      description: "How to interpret student responses — what patterns indicate understanding, partial understanding, and misconceptions"
    - field: "response_actions"
      type: "object"
      description: "What to do based on the assessment data — the specific teaching actions triggered by different assessment results"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "ai-feedback-design-principles"
  - "learning-analytics-interpretation-guide"
  - "cognitive-tutoring-architecture-designer"
teacher_time: "5 minutes"
tags: ["formative-assessment", "Black-Wiliam", "assessment-loop", "adaptive", "feedback", "VanLehn", "inner-loop", "outer-loop"]
---
# AI 系统形成性评估循环设计器

## 此技能的作用

为 AI 驱动的学习环境设计完整的形成性评估循环——持续引出学生理解程度的证据、解读这些证据，并利用它们实时调整教学。Black & Wiliam (1998) 的奠基性元分析表明，形成性评估是教育领域最有力的干预措施之一（效应量为 0.40-0.70），但前提是评估数据确实会改变接下来发生的事情。如果评估没有促成教学调整，那就只是一次测试。此技能会设计整个循环：评估什么（不仅是答案，还包括思维过程）、如何评估（能够揭示理解程度的问题、任务和探查）、如何解读结果（区分真正的理解与表层表现），以及如何利用结果（针对特定评估模式采取具体的教学响应）。VanLehn (2006) 区分了“内循环”评估（在每个解题步骤中实时进行）和“外循环”评估（在任务层面、题目之间进行）。AI 系统尤其擅长进行内循环评估——逐步监测学生的推理并实时调整教学——而最大的学习增益正发生在这一层面。

## 证据基础

Black & Wiliam (1998) 对形成性评估研究进行了最具影响力的综述，分析了 250 多项研究，发现效应量介于 0.40 和 0.70 之间——高于大多数教育干预措施。他们将形成性评估定义为：“教师和/或学生所开展的、能够提供信息，以用于修改他们正在参与的教学与学习活动的所有活动。”其关键洞见是：有价值的部分不是评估本身，而是修改。只收集数据而不调整教学，只是换了一个名称的总结性评估。Black & Wiliam (2009) 构建了更为完善的理论框架，确定了形成性评估的五项关键策略：(1) 阐明并分享学习意图和成功标准，(2) 设计能够有效引发学习证据的课堂讨论和任务，(3) 提供能够推动学习者前进的反馈，(4) 让学生成为彼此的教学资源，(5) 让学生成为自身学习的主导者。这五项策略都包含一个循环：引出 → 解读 → 行动。Wiliam (2011) 将这一框架转化为具体的课堂策略，强调形成性评估必须嵌入教学之中——它不是附加活动，而是一个持续检查、调整和响应的过程。他认为，有效开展形成性评估的最大障碍不是数据收集，而是数据使用：教师经常收集数据，却不会根据数据改变教学。VanLehn (2006) 分析了辅导系统的行为，确定了评估循环的两个层次。“外循环”在题目之间运行：学生完成一道题后，系统决定下一步做什么（再来一道类似的题目、更难的题目、复习，或进入新主题）。“内循环”在题目内部运行：在每一步，系统都会评估学生的回答，并提供反馈、提示或支架。VanLehn 发现，内循环是决定 ITS 有效性的更重要因素——在步骤层面进行评估和响应的系统，表现显著优于只在题目层面进行评估的系统。Shute & Zapata-Rivera (2012) 对自适应教育系统进行了综述，发现最有效的系统会将持续评估与即时教学适应结合起来——形成“紧密”的形成性评估循环，将评估与响应之间的时间缩至最短。

## 输入架构

教师必须提供：
- **学习目标：** 学生要学习什么。*例如：“理解面积和周长之间的区别——何时使用各自的概念、如何分别计算，以及为什么二者相互独立（一个图形可能面积很大但周长很小，反之亦然）” / “写出有效的主题句，提出清晰的论点，而不仅仅是陈述事实或宣布主题” / “理解供给与需求——价格变化如何影响供给量和需求量，以及均衡价格如何确定”*
- **当前评估方式：** 目前如何检查学生是否理解。*例如：“我在课程结束时用一张离堂卡进行检查——共 3 道题。如果大多数学生答对，我就继续下一部分；如果没有，我会在下一节课重新讲解” / “我在每周结束时批改作文并提供书面反馈” / “AI 系统每完成 10 道题后进行一次测验，但不会根据结果改变接下来的安排”*

可选项（如果可用，由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **AI 系统能力：** 技术可以实现的功能
- **班级规模：** 学生人数
- **评估频率：** 收集数据的频率

## 提示词

```
You are an expert in formative assessment design for AI-enabled learning environments, with deep knowledge of Black & Wiliam's (1998, 2009) formative assessment framework, Wiliam's (2011) practical implementation strategies, VanLehn's (2006) inner-loop/outer-loop distinction, and Shute & Zapata-Rivera's (2012) adaptive assessment systems. You understand that formative assessment is not a type of test — it is a PROCESS of continuously eliciting evidence of understanding and using that evidence to adjust instruction. You also understand VanLehn's critical finding: assessment and feedback at the STEP level (inner loop) is dramatically more effective than assessment at the TASK level (outer loop).

CRITICAL PRINCIPLES:
- **Assessment must change instruction.** If the assessment data doesn't lead to a different instructional response, it's not formative — it's just a test. For every assessment point, specify WHAT CHANGES based on the result. "If the student gets it right, move on" is insufficient. "If the student gets it right, increase difficulty by X; if wrong in way A, respond with action A; if wrong in way B, respond with action B" — that's formative.
- **Assess THINKING, not just answers.** A correct answer might hide a misconception (right answer, wrong reasoning). An incorrect answer might contain valuable partial understanding. The assessment must probe the reasoning BEHIND the answer. In an AI system: require students to show working, explain their thinking, or select from options that reveal specific reasoning patterns.
- **Inner-loop assessment is more powerful than outer-loop.** VanLehn (2006): assessing at each problem step (and responding immediately) produces better learning than assessing only at the end of a problem. Design the loop to operate at the step level where possible.
- **Use multiple elicitation methods.** Don't rely solely on correct/incorrect. Use: diagnostic questions (MCQs where each wrong answer maps to a specific misconception), explanation prompts ("Why did you choose that?"), confidence ratings ("How sure are you?"), and process observations (how long did they take? did they use a hint?).
- **The assessment loop must be TIGHT.** The shorter the delay between assessment and instructional response, the more effective the formative process. An AI system can respond in seconds. Exploit this advantage — don't collect data now and act on it next week.

Your task is to design a formative assessment loop for:

**Learning objective:** {{learning_objective}}
**Current assessment approach:** {{current_assessment_approach}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the objective.
**AI system capabilities:** {{ai_system_capabilities}} — if not provided, design for an AI system that can present problems, monitor responses, provide feedback, and adapt problem selection in real time.
**Class size:** {{class_size}} — if not provided, assume a class of 30 students working individually on AI-enabled devices.
**Assessment frequency:** {{assessment_frequency}} — if not provided, design for continuous inner-loop assessment with outer-loop checks every 5-10 problems.

Return your output in this exact format:

## Formative Assessment Loop: [Learning Objective]

**Objective:** [What students are learning]
**Current approach:** [How assessment works now]
**Redesigned approach:** [How the formative loop works — one-sentence summary]

### Loop Architecture

[The complete assessment loop structure — inner loop (step-level) and outer loop (task-level)]

**Inner Loop (within each problem):**
[What is assessed at each step, how, and what the response is]

**Outer Loop (between problems):**
[What is assessed after each problem/set of problems, and how it determines what comes next]

### Elicitation Strategies

[The specific methods for surfacing student understanding — not just "quiz them" but the SPECIFIC question designs, process observations, and explanation prompts]

**Strategy [N]: [Name]**
- **What it assesses:** [What aspect of understanding]
- **How it works:** [The specific mechanism]
- **Example:** [A concrete example for this learning objective]
- **What to look for:** [What different responses reveal about understanding]

### Interpretation Framework

[How to interpret student responses — the decision rules that connect assessment evidence to instructional actions]

| Evidence Pattern | What It Probably Means | Confidence | Instructional Response |
|---|---|---|---|
| [Pattern] | [Interpretation] | [High/Moderate/Low] | [What the system does next] |

### Response Actions

[The specific instructional adjustments triggered by different assessment results — not just "reteach" but exactly how to reteach]

### Teacher Dashboard

[What the teacher needs to see — the key metrics and alerts that inform teacher-level decisions, separate from the AI's real-time responses]

### Loop Validation

[How to check that the assessment loop is actually improving learning — the meta-assessment of the assessment]

**Self-check before returning output:** Verify that (a) every assessment point triggers an instructional response, (b) thinking is assessed not just answers, (c) inner-loop assessment is included, (d) multiple elicitation methods are used, and (e) the loop is tight (minimal delay between assessment and response).
```

## 示例输出

**情境：** *学习目标：“理解面积和周长之间的区别——何时使用面积、何时使用周长、如何分别计算，以及为什么二者相互独立（一个图形可能面积很大但周长很小，反之亦然）” / 当前评估方式：“我分别用不同课时教授面积和周长，然后布置一份包含 20 道计算题的练习单（面积 10 题，周长 10 题）。批改后，如果全班超过三分之一的学生在任一部分得分低于 7/10，我就重新讲解。主要问题是，学生在练习单上能够正确计算面积和周长，却会在测试中将二者混淆——题目要求计算面积时使用周长公式，反之亦然。问题不在于计算，而在于知道应该使用哪一种计算方法。” / 学生水平：“六年级” / 学科领域：“数学——测量” / AI 系统能力：“能够呈现题目、接受自由文本和多项选择回答、记录学生回答所用时间、提供反馈并调整题目选择的 AI 辅导系统。还可以显示图形的图片或示意图。” / 评估频率：“持续进行”*

---

## 形成性评估循环：面积与周长

**目标：** 理解何时使用面积、何时使用周长、如何分别计算，以及为什么二者相互独立  
**当前方式：** 分别教学 → 混合计算练习单 → 批改并重新讲解  
**重新设计的方式：** 持续进行的评估循环，探查学生应该使用哪一种计算方法（而不仅仅是计算是否正确），通过诊断性问题区分概念理解和程序熟练度

### 循环架构

**内循环（每道题目内部）：**

步骤 1 — **识别检查：** 在学生进行任何计算之前，系统提问：“这是一个面积问题还是周长问题？你是怎么判断的？”这是关键的评估点。最常见的错误（使用错误的公式）发生在这一步，而不是计算过程中。系统会在允许学生继续之前，先评估其概念识别能力。

步骤 2 — **方法检查：** 完成识别后，系统提问：“你要计算什么？用一句话描述你的方法。”这可以揭示学生是否掌握了所识别概念对应的步骤。一个正确识别出“面积”、但描述“我要把所有边加起来”的学生，虽然识别正确，却存在程序性错误。

步骤 3 — **计算检查：** 学生进行计算。系统检查数值答案。如果答案正确，则继续进行。如果答案错误，则判断这是算术错误（方法正确但计算出错），还是概念性错误（使用了错误的方法）。

步骤 4 — **单位检查：** 系统检查学生是否使用了正确的单位（面积使用 cm²，周长使用 cm）。即使数值答案正确，单位错误也可能暴露出概念混淆。

**外循环（每 5 道题目一次）：**

每完成 5 道题目后，系统会回顾内循环回答所呈现的模式：
- **如果识别准确率 ≥ 80%：** 提高难度（更复杂的图形、文字题、比较题）
- **如果识别准确率 < 60%：** 切换到概念构建任务（比较周长相同但面积不同的图形）
- **如果概念识别准确但计算经常出错：** 针对正确识别出的概念提供计算练习
- **如果呈现混合模式：** 提出一个旨在确定具体混淆点的诊断性问题

### 引导策略

**策略 1：先进行识别式提问**
- **评估内容：** 学生是否知道题目要求的是哪一种测量
- **实施方式：** 给出一道文字题，先问“这是在求面积还是周长？”然后再要求计算。这样可以将概念识别与程序性执行区分开来。
- **示例：** “一位农民想要在一个长 20m、宽 15m 的矩形田地周围修建围栏。这是面积问题还是周长问题？”然后单独提问：“计算答案。”
- **关注点：** 能正确识别“周长”的学生（题目涉及围栏，也就是沿着外部一圈）与回答“面积”的学生（他们可能会受到“田地”这个词或两个尺寸的影响）

**策略 2：诊断性选择题**
- **评估内容：** 错误答案背后的具体误解
- **实施方式：** 提出一道题，其中每个错误答案都对应一种具体错误。学生的选择可以揭示其思考过程，而不仅仅是判断答案是否正确。
- **示例：** “一个矩形长 8cm、宽 5cm。它的面积是多少？”选项：(a) 40 cm² [正确]，(b) 26 cm [改为计算周长]，(c) 26 cm² [计算了周长，但使用了面积单位]，(d) 13 cm [计算了半周长]。每个错误答案都能诊断出不同的问题。
- **关注点：** (b) = 计算了错误的测量值。(c) = 计算了错误的测量值，并且不理解单位的含义。(d) = 对周长有部分理解。

**策略 3：概念比较任务**
- **评估内容：** 学生是否理解面积和周长是相互独立的
- **实施方式：** 展示两个图形，并询问“哪个图形的面积更大？哪个图形的周长更大？”其中两个问题的答案应当不同（一个图形的面积更大，另一个图形的周长更大）。这可以检验最深层的概念理解。
- **示例：** 图形 A：10cm × 2cm 的矩形（面积 20，周长 24）。图形 B：边长 5cm 的正方形（面积 25，周长 20）。“哪个图形的面积更大？哪个图形的周长更大？”正确答案：B 的面积更大，A 的周长更大。
- **关注点：** 如果学生对两个问题都选择同一个图形，他们可能认为面积和周长是相关的（“图形越大，所有量就都越大”）。这是最需要解决的误解。

**策略 4：结合信心程度的回答**
- **评估内容：** 元认知准确性——学生是否知道自己掌握了哪些内容
- **实施方式：** 回答后，学生评估自己的信心程度（确定 / 觉得是 / 猜的）。系统会跟踪其信心与正确率之间的匹配情况：高信心 + 错误答案 = 存在误解（他们确信某个错误观点是正确的）。低信心 + 正确答案 = 知识不稳固（他们可能只是碰巧答对，或自己并不确定）。
- **示例：** 学生自信地回答围栏问题的答案是“周长”→ 正确且有信心 = 理解扎实。学生不太确定地回答“周长”→ 正确但缺乏信心 = 正在形成理解，需要更多练习。
- **关注点：** 持续出现的高信心错误表明学生牢固地持有某些误解，需要直接纠正，而不仅仅是增加练习。

### 解读框架

| 证据模式 | 可能意味着什么 | 置信度 | 教学响应 |
|---|---|---|---|
| 识别正确、计算正确、单位正确 | 扎实理解了这类问题 | 高 | 提高难度——加入更复杂的形状、多步骤问题或比较任务 |
| 识别正确、计算错误 | 存在程序性缺陷，而非概念混淆 | 高 | 提供计算支架——学生知道该做什么，但会出现算术错误 |
| 识别错误（面积↔周长混淆） | 核心概念混淆——学生无法稳定地区分这两个概念 | 高 | 停止计算练习。转向概念构建：比较、定义、视觉演示、现实情境 |
| 简单问题中识别正确，文字题中识别错误 | 概念知识不牢固——在明确的情境中能够识别，但无法应用到实际情境中 | 中 | 增加带有明确识别提示的文字题（“这是在覆盖一个表面，还是沿着边缘绕一圈？”） |
| 答案正确但单位错误（例如写成 40 cm 而不是 40 cm²） | 可能理解了概念，但不了解长度表示的数学形式 | 中 | 直接讲解为什么面积使用平方单位（它表示单位正方形的数量） |
| 在“面积更大”和“周长更大”的比较中给出相同答案 | 认为面积和周长具有相关性 | 高 | 关键干预：展示多个面积增加但周长减少（反之亦然）的形状示例 |
| 高置信度 + 持续出错 | 根深蒂固的错误观念 | 高 | 制造认知冲突：呈现一个与其信念相矛盾的案例，并要求他们解释这一矛盾 |
| 低置信度 + 答案正确 | 正在形成但尚不牢固的理解 | 中 | 通过更多练习和即时的积极反馈，在培养能力的同时增强信心 |

### 响应行动

**行动 1：概念构建模式（由识别错误触发）**
AI 从计算练习切换到概念构建活动：
- 展示一个矩形并询问“对于这个形状，面积是什么意思？周长是什么意思？指给我看或标记出来。”（面积 = 内部表面，周长 = 外部边缘）
- 提出现实世界的情境：“你想给一面墙刷漆——这是面积还是周长？你想给一幅画装一个边框——这是面积还是周长？你想为一个房间购买地毯——这是面积还是周长？”
- 使用“相同周长、不同面积”的演示：展示三个周长都是 24cm、但面积差异很大的形状（1×11、4×8、6×6）。询问：“周长相同，但面积为什么会不同？”

**行动 2：程序巩固模式（由识别正确但计算错误触发）**
AI 针对**正确识别的概念**提供有支架的计算练习：
- 面积：显示网格覆盖层，让学生在计算前数正方形。然后逐渐淡出网格。
- 周长：在学生相加之前，显示沿着形状外部的箭头。然后逐渐淡出箭头。
- 两者：对计算提供即时反馈，并显示纠正步骤。

**行动 3：整合模式（由持续成功触发）**
AI 引入多步骤和比较问题：
- “求出这个图形的**面积和周长**。哪个更大？这让你感到意外吗？”
- “设计一个面积为 24cm² 的矩形。它的周长是多少？你能设计出另一个面积相同但周长不同的矩形吗？”
- 要求学生根据情境确定所需测量量的应用题。

### 教师仪表板

教师需要查看：

**班级层面的概览：**
- 各模式下学生所占的百分比（概念建构 / 程序性 / 整合）
- 班级中最常见的错误模式（如果 60% 的学生混淆面积和周长，就需要进行全班干预）
- 陷入停滞的学生（在概念建构模式下完成 10+ 道题后仍没有进步——可能需要教师介入）

**个体提醒：**
- “学生 X 的自信度很高，但识别准确率为 40%——这是一个根深蒂固的错误概念，可能需要教师与其交流”
- “学生 Y 已经处于程序性模式 15 分钟——计算准确率没有提高，请检查是否存在潜在的数感缺口”
- “学生 Z 已完成所有整合任务——已准备好进行拓展（组合图形、圆、表面积）”

**关键指标：识别准确率与计算准确率。** 如果班级识别准确率低于 70%，但计算准确率高于 80%，说明当前的评估方式（计算练习单）掩盖了真正的问题。教师应优先开展概念性学习，而不是增加计算练习。

### 循环验证

检查评估循环是否有效的方法：

1. **识别任务的前后测比较。** 在 AI 循环开始之前，进行一次仅包含识别题的 5 题测验（不进行计算）。使用 AI 循环完成 2 次学习后，重复这项测验。如果识别准确率没有提高，就需要重新设计循环中的概念建构回应。

2. **迁移测试。** 在 AI 序列结束后，给出一种 AI 未使用过的新题型（例如，估算一张包装纸是否足够包装一件礼物——这要求学生在不熟悉的情境中理解面积）。如果学生能够迁移应用，说明该循环正在建立理解，而不只是训练学生应对熟悉的题型。

3. **延迟测试。** 在 AI 序列结束两周后，进行同一项识别测验。如果分数显著下降，说明该循环产生的是**短期**表现，而不是**长期**学习。可以考虑在循环中加入间隔提取练习（在学生进入下一个学习阶段后，偶尔回顾面积 / 周长的识别）。

---

## 已知局限

1. **形成性评估循环需要持续的数据流。** 上述设计假设 AI 系统能够实时评估学生的回答并立即进行调整。采用批处理的系统（收集数据、在夜间分析、第二天进行调整）无法实现内循环。外循环仍然可行且仍然有价值，但内循环评估带来的学习增益（VanLehn, 2006）需要实时处理。

2. **解读框架是概率性的。** 对于一道周长题，选择“面积”的学生很可能存在概念混淆——但也可能是误读了题目、误点了选项，或不理解“周长”这个词。系统绝不应根据单次作答做出确定性诊断。上述解读框架利用作答模式（多个问题）来逐步建立对诊断结果的信心。

3. **Black & Wiliam（1998）的元分析涵盖了广泛的形成性评价实践。** 研究中的效应量（0.40-0.70）适用于广义的形成性评价，并非专门针对由 AI 实施的形成性评价。这些原则是可靠的，但在当前情境下，AI 形成性循环的具体效应量尚未经过实证测量。该设计是以证据为依据的，而非已被证据证明有效。

4. **教师仪表板中的数据可能会让人不堪重负。** 上述仪表板提供了有关单个学生和班级层面模式的详细信息。在一个有 30 名学生的班级中，这样的数据量是可管理的；但在一个有 120 名学生的年级中，数据量可能会让人难以应对。更大规模的仪表板设计需要更积极的筛选和汇总。

5. **评价循环可能会无意中缩窄课程内容。** 如果 AI 循环只专注于识别和计算面积与周长，学生可能会在这一具体技能上形成能力，却错过更广泛的数学理解（将测量作为一个概念来理解，以及它与其他主题之间的联系）。Wiliam（2011）警告说，形成性评价应当服务于学习，而不应定义学习。