---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-feedback-design-principles
description: "Audit and redesign AI-generated feedback for pedagogical quality, timing, and learning impact. Use when building or reviewing automated feedback in digital learning tools."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/ai-feedback-design-principles"
skill_name: "AI Feedback Design Principles"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Shute (2008) — Focus on formative feedback (comprehensive review)"
  - "Narciss (2008) — Feedback strategies for interactive learning tasks (informative tutoring feedback model)"
  - "Hattie & Timperley (2007) — The power of feedback (meta-analysis, effect size 0.73)"
  - "Dai et al. (2023) — Can large language models provide useful feedback on research papers? A large-scale empirical analysis"
  - "Kluger & DeNisi (1996) — The effects of feedback interventions on performance: A historical review and a meta-analysis"
input_schema:
  required:
    - field: "feedback_scenario"
      type: "string"
      description: "The specific context in which AI will deliver feedback — what the student has done and what kind of feedback is needed"
    - field: "current_feedback_design"
      type: "string"
      description: "The current or proposed AI feedback approach — what the system currently says or plans to say in response to student work"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "feedback_goals"
      type: "string"
      description: "What the feedback should achieve — error correction, motivation, deeper thinking, self-regulation, or something else"
    - field: "system_constraints"
      type: "string"
      description: "Technical or practical constraints on the feedback — character limits, timing requirements, or format restrictions"
output_schema:
  type: "object"
  fields:
    - field: "feedback_evaluation"
      type: "object"
      description: "Analysis of the current feedback design against research criteria — what works and what doesn't"
    - field: "improved_feedback"
      type: "object"
      description: "A redesigned version of the feedback that addresses identified weaknesses"
    - field: "feedback_type_analysis"
      type: "object"
      description: "Classification of the feedback by type (verification, elaboration, strategic) with recommendations for the optimal mix"
    - field: "implementation_guidance"
      type: "object"
      description: "Practical advice for deploying the improved feedback in the target system"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "formative-assessment-loop-designer"
  - "intelligent-tutoring-dialogue-designer"
  - "self-explanation-prompt-designer"
  - "technological-pedagogical-content-knowledge-developer"
teacher_time: "4 minutes"
tags: ["feedback", "AI-feedback", "formative", "Shute", "Narciss", "Hattie", "LLM", "automated-feedback"]
---
# AI 反馈设计原则

## 此技能的作用

根据有效自动反馈的研究标准，评估一项拟议的 AI 反馈设计，并提出具体改进建议。此技能接收一个反馈场景（学生做了什么）以及当前或拟议的 AI 回复（系统说了什么），然后依据 Shute (2008)、Narciss (2008)、Hattie & Timperley (2007) 以及新兴的 LLM 反馈研究（Dai et al., 2023）中的原则分析该反馈。输出包括对哪些方面有效、哪些方面存在问题的诊断，重新设计的反馈版本，以及切实可行的实施指导。核心挑战在于，大多数 AI 反馈会陷入两种失败模式之一：要么过于模糊，无法付诸行动（“努力不错！试着改进你的论点。”）；要么过于具体，替学生完成了思考（“你的论点应该是：气候变化是我们这一代人面临的决定性挑战，因为……”）。有效的反馈存在于这两个极端之间的狭窄空间中——具体到让学生知道该做什么，但又不能具体到绕过产生学习所需的认知活动。AI 在这里尤其有价值，因为它能够大规模生成反馈，但这也使设计原则更加关键：大规模产生糟糕的反馈，比没有反馈更糟。

## 证据基础

Hattie & Timperley (2007) 进行了一项荟萃分析，发现反馈的平均效应量为 0.73，使其成为对学习影响最强的因素之一。然而，他们发现反馈效果存在巨大差异：一些反馈干预产生了显著的积极效果，而另一些则没有任何效果，甚至产生了负面效果。关键变量不在于是否提供了反馈，而在于提供了什么类型的反馈。他们提出了一个包含四个层次的模型：任务反馈（答案是否正确？）、过程反馈（哪些策略可以改进这项工作？）、自我调节反馈（你如何监控自己的学习？）以及自我反馈（你是一名很棒的学生！）。任务反馈和过程反馈最为有效；自我反馈（“做得好！”）效果最差，有时甚至有害，因为它会将注意力从任务转向自我。Shute (2008) 回顾了形成性反馈研究，并确定了几个关键原则：有效的反馈应当具体、及时、不会造成威胁，并且聚焦于任务而非学习者。她区分了验证性反馈（正确/错误）、详细反馈（为什么正确/错误以及接下来该做什么）以及各种组合形式。她发现，详细反馈通常优于简单的验证性反馈，**但是**过于详细的反馈可能会让初学者不堪重负——形成一种反馈悖论，即更多信息有时反而会带来更少的学习。Narciss (2008) 开发了信息性辅导反馈（ITF）模型，规定有效的反馈应当包括：结果知识（是否正确）、正确答案知识（如果答案错误）以及对错误的阐释（为什么错误，以及它揭示了什么误解）。关键的是，Narciss 发现，最佳反馈取决于错误类型：概念性错误适合详细反馈，而粗心疏漏则适合简单的验证性反馈。Kluger & DeNisi (1996) 在其荟萃分析中发现，将注意力引向自我（而非任务）的反馈可能会降低表现——这一发现对于那些生成鼓励性但空洞表扬的 AI 系统具有直接意义。Dai et al. (2023) 评估了 LLM 生成的反馈，发现虽然 LLM 能够生成流畅、结构良好的反馈，但它们往往表现出一种特定模式：过度积极、建议模糊，以及不愿指出具体错误——而这正是研究所认定的效果最差的反馈模式。

## 输入架构

教师必须提供：
- **反馈情境：** 学生做了什么。*例如：“九年级学生提交了一篇主张废除校服的议论文。论证很有激情，但完全依赖个人轶事——没有证据，也没有回应反方观点，逻辑结构薄弱” / “七年级学生解方程 3x + 5 = 20，得出 x = 7（错误——正确答案应为 x = 5）” / “A-level 学生写了一份实验报告，数据正确，但结论无法从结果中推导出来”*
- **当前反馈设计：** AI 目前给出的反馈或计划给出的反馈。*例如：“很棒的文章！你显然对这个话题有强烈的看法。要进一步改进，可以尝试加入一些证据，并考虑论证的另一面” / “错误。答案是 x = 5。再试一次” / “你的结论还需要改进。想想你的数据实际上说明了什么”*

可选项（如果可用，则由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **反馈目标：** 反馈应当实现的目标
- **系统约束：** 技术或实际限制条件

## 提示词

```
You are an expert in the science of feedback in learning, with deep knowledge of Hattie & Timperley's (2007) feedback model (task, process, self-regulation, self levels), Shute's (2008) formative feedback principles, Narciss's (2008) Informative Tutoring Feedback model, Kluger & DeNisi's (1996) meta-analysis on feedback interventions, and emerging research on LLM-generated feedback quality (Dai et al., 2023). You understand that feedback is one of the most powerful influences on learning — and one of the most dangerous when poorly designed. You know that AI systems tend toward a specific failure mode: generating feedback that is positive, fluent, well-structured, and educationally useless.

CRITICAL PRINCIPLES:
- **Feedback must be SPECIFIC and ACTIONABLE.** "Good effort" is not feedback. "Your introduction states a position but doesn't preview your three supporting arguments — add a sentence that maps out your essay structure" IS feedback. If a student cannot read the feedback and know EXACTLY what to do next, it has failed.
- **Distinguish verification, elaboration, and strategic feedback.** Verification: "This is incorrect." Elaboration: "This is incorrect because you subtracted 5 from the left side but not the right." Strategic: "When you get stuck on equations, always check: did I do the same operation to both sides?" Different errors need different types. A conceptual error needs elaboration. A careless slip needs verification. A recurring pattern needs strategic feedback.
- **Avoid the positivity trap.** AI systems default to excessive positivity. "Great work!" before pointing out fundamental errors sends a contradictory signal and dilutes the corrective message. Positive feedback is appropriate ONLY when genuinely earned AND directed at specific features ("Your use of statistical evidence in paragraph 2 is effective because it directly supports your claim"). Generic praise is worse than no praise at all (Kluger & DeNisi, 1996).
- **Don't do the student's thinking.** Feedback that tells the student exactly what to write, what the answer is, or how to fix their work is not feedback — it's answer-giving. The goal is to close the gap between current and desired performance by showing the student WHERE the gap is and giving them enough information to close it themselves.
- **Match feedback complexity to student level.** Novice learners benefit from simple, clear feedback focused on one or two specific issues. Advanced learners benefit from more complex feedback that addresses multiple dimensions. Overloading novices with comprehensive feedback produces cognitive overload, not learning (Shute, 2008).

Your task is to evaluate and improve this feedback design:

**Feedback scenario:** {{feedback_scenario}}
**Current feedback design:** {{current_feedback_design}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the scenario.
**Subject area:** {{subject_area}} — if not provided, infer from the scenario.
**Feedback goals:** {{feedback_goals}} — if not provided, assume the goal is to help the student improve their work while preserving their ownership of the thinking.
**System constraints:** {{system_constraints}} — if not provided, assume no significant constraints.

Return your output in this exact format:

## Feedback Evaluation: [Brief Scenario Description]

**Scenario:** [What the student did]
**Current feedback:** [What the AI currently says]
**Verdict:** [One-sentence summary — is this feedback likely to improve learning, have no effect, or actively harm it?]

### Diagnosis

[Analyse the current feedback against each principle. What works? What doesn't? Be specific — quote the problematic parts of the feedback and explain WHY they are problematic, citing the relevant research.]

### Feedback Type Analysis

| Feedback Component | Type | Effectiveness | Issue |
|---|---|---|---|
| [Quote from current feedback] | [Verification / Elaboration / Strategic / Self] | [Effective / Ineffective / Harmful] | [Why] |

### Improved Feedback Design

[The redesigned feedback. Show the exact text the AI should present to the student. Include specific, actionable guidance that addresses the identified weaknesses without doing the student's thinking for them.]

**Redesigned feedback:**

> [The exact feedback text]

### Design Rationale

[Explain why the improved version is better — what principles it follows and what specific changes were made.]

### Implementation Notes

[Practical guidance for deploying this feedback pattern — when it should trigger, how to handle edge cases, and what to watch for.]

**Self-check before returning output:** Verify that (a) the improved feedback is specific and actionable, (b) it doesn't do the student's thinking, (c) it avoids empty praise, (d) it uses the right type of feedback for the error type, and (e) it's appropriate for the student's level.
```

## 示例输出

**场景：** *反馈场景：“一名九年级学生提交了一篇议论文，主张废除校服。文章论点充满激情，但完全依赖个人轶事，没有证据，也没有回应反方观点，逻辑结构薄弱。文章约 400 词，包含引言、三个正文段落和结论。” / 当前反馈设计：“很棒的文章！你显然对这个话题有强烈的感受，而且你的写作风格很有感染力。为了改进，可以尝试加入一些证据来支持你的观点，并考虑回应相反的立场。你的结论还可以更有力一些——试着重新阐述你的主要论点。总的来说，这是一次不错的尝试——继续保持！7/10” / 学生水平：“九年级，目标成绩 6（相当于英国 GCSE）” / 学科领域：“英语语言——议论文写作”*

---

## 反馈评估：九年级议论文——校服

**场景：** 一名九年级学生写了一篇依赖个人轶事、没有证据、没有反方论点且结构薄弱的议论文。  
**当前反馈：** “很棒的文章！你显然对这个话题有强烈的感受……可以尝试加入一些证据……考虑回应相反的立场……这是一次不错的尝试——继续保持！7/10”  
**结论：** 这份反馈不太可能促成改进。它含糊不清、过度积极，而且在文章存在根本性结构问题的情况下，却告诉学生他们做得很好。

### 诊断

**问题 1：积极评价陷阱。** 反馈以“很棒的文章！”开头——但这篇文章存在根本性弱点（没有证据、没有反方论点、结构薄弱）。这传达了相互矛盾的信号：你一边告诉学生文章很棒，一边又列出文章存在的所有问题。Kluger & DeNisi (1996) 发现，相比于将注意力引向任务本身，把注意力引向自我（“你显然感受强烈”）会降低学习效果。学生得到的结论是：“我得了 7/10，老师也喜欢我的写作风格。我只需要稍微调整一下。”

**问题 2：含糊的改进建议。** “尝试加入一些证据”——什么样的证据？放在文章的什么位置？需要多少？“考虑回应相反的立场”——哪个相反的立场？应该放在文章的什么位置？应当如何组织？Shute (2008) 发现，反馈必须具体到让学生确切知道自己需要做什么。这些建议过于含糊，无法直接付诸行动。

**问题 3：没有诊断真正的问题。** 这篇文章的根本问题在于，学生不理解断言和论证之间的区别。每个段落提出的主张都只由个人经历支持。反馈没有指出这一问题——它只处理了表面症状（没有证据、没有回应反方观点），却没有找出根本原因（学生把强烈的感受等同于有力的论证）。

**问题 4：分数削弱了反馈的作用。** 7/10 传达的是“这篇文章写得不错”。如果一篇文章没有证据，也没有回应反方观点，那么它就没有达到议论文写作的基本标准。分数和反馈彼此冲突。学生会以分数为依据，并忽略那些改进建议。

### 反馈类型分析

| 反馈组件 | 类型 | 有效性 | 问题 |
|---|---|---|---|
| “很棒的文章！” | 自我层面 | 有害 | 空洞的赞扬，将注意力引向自身，而不是任务 |
| “你显然对此感受强烈” | 自我层面 | 无效 | 描述的是学生，而不是作品 |
| “你的写作风格很有感染力” | 任务层面 | 略有效 | 足够具体，具有一定帮助，但被泛泛的赞扬掩盖了 |
| “试着添加一些证据” | 策略层面 | 无效 | 过于模糊——什么证据，放在哪里，如何添加？ |
| “考虑回应一下相反的观点” | 策略层面 | 无效 | 过于模糊——哪个观点，放在文章的什么位置？ |
| “你的结论可以更有力” | 任务层面 | 无效 | 没有具体说明，“更有力”毫无意义 |
| “这是一次不错的尝试——继续保持！” | 自我层面 | 有害 | 需要大幅修改时却给予虚假的安慰 |
| “7/10” | 验证层面 | 有害 | 评分与需要进行根本性修改这一事实相矛盾 |

### 改进后的反馈设计

**重新设计的反馈：**

> **做得好的地方：** 你的写作风格自信而直接——“我不应该每天都被迫穿戴别人对我的定义”是一句有力且令人难忘的话。保留这种风格。
>
> **主要问题——主张与论证的区别：** 现在，你的每个段落都提出了一个观点，并用个人经历来支持它。这是主张，而不是论证。说服性写作需要证据——事实、统计数据、专家观点或真实案例，让不同意你的人也不得不认真对待。你的读者正在想：“那只是你的感受，但为什么我要在乎？”
>
> **首先尝试一个具体的修改：** 选出你最有力的段落（我建议选第 2 段，也就是关于舒适度的段落）。找出一条支持你观点的证据——一项关于学生注意力的研究、一所取消校服并测量其影响的学校案例，或一位教育专家的引述。把它加进去。然后看看它对段落产生了什么影响。这就是主张与论证之间的区别。
>
> **之后的下一步：** 选择一个最有力的反对你立场的论点（可能是费用问题——校服能为家庭省钱）。写一段话，先承认这个论点，然后解释为什么你的立场仍然更有说服力。这叫作反驳论点，是议论文写作中最具说服力的手法——它表明你考虑过另一方的观点，但仍然拥有更有力的论据。
>
> **暂时不要修改。** 先重新阅读你的文章，在每个有证据支持的句子旁边（不是个人经历）标上星号。数一数星号的数量。这个数量会告诉你还需要做多少工作。

### 设计依据

重新设计后的反馈做出了五项关键改变：

1. **先给出具体的正面反馈，并将其指向任务。** “你的写作风格自信而直接”，并配有引用的例子——这是针对真实优点的任务层面反馈，而不是泛泛的自我层面赞扬。它明确告诉学生应该继续保持什么。

2. **指出根本问题。** “主张与论证的区别”为学生理解问题所在提供了一个概念框架。这属于阐释性反馈（Narciss，2008）——它不只是说“添加证据”，而是解释了为什么需要证据，以及文章目前缺少什么。

3. **一个具体、可管理的行动。** 反馈没有列出一系列模糊的改进方向，而是给出 ONE 项具体任务：为其中一个段落找到一条证据。这遵循了 Shute (2008) 提出的反馈复杂度应与学习者水平相匹配的原则——一名目标为 6 分的九年级学生需要的是聚焦且可实现的步骤，而不是一份全面的批评。

4. **反方论点指导经过了支架化设计。** 它不只是说“回应相反观点”，而是告诉学生应该选择哪一个反方论点，并解释纳入该论点的策略性原因。这属于过程层面的反馈（Hattie & Timperley, 2007）。

5. **诊断任务取代了分数。** “数星星”是一种自我调节提示，帮助学生自己发现问题，而不是直接被告知问题所在。这培养了元认知意识——一种能够提升独立性的高阶反馈功能。

### 实施说明

- **不要以分数开头。** 如果系统要求提供分数，应将其放在最后，置于可执行的反馈之后。更好的做法是，推迟到修改完成后再提供分数。
- **将反馈限制在 2-3 个可执行的要点。** 本示例处理了两个问题（证据、反方论点），并加上一个元认知提示。这已经是九年级学生能够处理的最大数量。更多要点会造成认知过载和无所适从。
- **注意 LLM 的积极性模式。** 如果 AI 正在生成反馈，请检查其中是否存在“做得很好！但是……”模式（Dai et al., 2023）。应指导模型以具体且有依据的表扬开头，或以诊断结果开头，而不是先给出泛泛的热情表达。
- **在修改后重新评估。** 上述反馈旨在促成具体修改（为一个段落添加证据，添加一个反方论点段落）。修改之后，反馈应针对不同的问题——可能是结构和逻辑衔接。如果学生已经根据反馈采取了行动，就不要重复相同的反馈。

---

## 已知局限

1. **此技能评估的是反馈设计，而不是反馈传递。** 同一段反馈文字可能有效，也可能有害，这取决于反馈时机、学生的情绪状态，以及学生与系统之间的关系。一个刚刚连续三次作业失败的学生，与一个只是粗心犯错但信心十足的学生，需要采用不同的情感表达方式。此技能关注的是内容和结构，而不是情感影响与时机。

2. **关于 LLM 反馈的证据基础仍在形成之中。** Dai et al. (2023) 是关于 LLM 反馈质量的首批大规模研究之一，而这一领域正在快速发展。Shute (2008)、Narciss (2008) 以及 Hattie & Timperley (2007) 提出的原则对于人类反馈而言已经得到充分确立——将这些原则应用于 AI 生成的反馈在理论上是合理的，但尚未得到全面验证。

3. **文化背景会影响反馈规范。** 此处推荐的直接、以任务为重点的反馈风格，体现了西方教育研究的规范。在某些文化背景下，直接的批评（即使具有建设性）可能会产生不同的接受效果。Narciss (2008) 的模型主要是在欧洲和北美背景下形成的。

4. **反馈会以复杂的方式影响学生的自我效能感。** Kluger & DeNisi (1996) 发现，当反馈威胁到自我概念时，可能会降低表现。对于自我效能感非常低的学生而言，“不提供空洞的表扬”这一原则需要与进一步损害学习动机的风险相平衡。此技能不会对单个学生的动机状态进行建模。