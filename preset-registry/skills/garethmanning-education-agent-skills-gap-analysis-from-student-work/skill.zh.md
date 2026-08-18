---
# AGENT SKILLS STANDARD FIELDS (v2)
name: gap-analysis-from-student-work
description: "Analyse student work against criteria to identify specific gaps between current performance and learning objectives. Use when reviewing submissions, planning feedback, or diagnosing learning needs."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/gap-analysis-from-student-work"
skill_name: "Gap Analysis from Student Work"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Black & Wiliam (1998) — Assessment and Classroom Learning"
  - "Hattie & Timperley (2007) — The Power of Feedback"
  - "Sadler (1989) — Formative assessment and the design of instructional systems"
  - "Heritage (2010) — Formative Assessment: making it happen in the classroom"
  - "Wiliam (2011) — Embedded Formative Assessment"
input_schema:
  required:
    - field: "student_work_description"
      type: "string"
      description: "A description or transcript of the student's work — what they produced"
    - field: "assessment_criteria"
      type: "string"
      description: "The criteria or rubric the work should be assessed against"
    - field: "learning_objective"
      type: "string"
      description: "What the student was supposed to learn or demonstrate"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "student_profile"
      type: "string"
      description: "From context engine: prior attainment, known strengths and gaps"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "task_description"
      type: "string"
      description: "The task the student was completing"
output_schema:
  type: "object"
  fields:
    - field: "gap_analysis"
      type: "object"
      description: "Specific gaps identified, classified by type — conceptual, procedural, or communication"
    - field: "strengths"
      type: "array"
      description: "What the student does well — specific, evidence-based strengths"
    - field: "next_teaching_steps"
      type: "array"
      description: "Targeted actions to address each gap — not generic advice but specific next steps"
    - field: "feedback_script"
      type: "string"
      description: "How to communicate the analysis to the student in a way that promotes improvement"
chains_well_with:
  - "feedback-quality-analyser"
  - "criterion-referenced-rubric-generator"
  - "error-analysis-protocol"
  - "practice-problem-sequence-designer"
  - "kud-knowledge-type-mapper"
teacher_time: "3 minutes"
tags: ["gap-analysis", "student-work", "formative-assessment", "feedback", "diagnostic"]
---
# 学生作品差距分析

## 此技能的作用

根据评估标准分析学生作品样本，找出具体差距（不仅是“需要改进”，而是明确指出缺少了什么以及为什么缺少），按类型对每项差距进行分类（概念性误解、程序性错误或沟通/呈现问题），并生成有针对性的后续教学步骤——即教师可以采取的、用于弥补每项差距的具体行动，而不是“多练习”之类的笼统建议。输出还包括一份反馈话术脚本，展示如何向学生传达分析结果，以促进其改进。AI 在此特别有价值，因为有效的差距分析需要同时将作品与标准进行比较、诊断差距类型（这决定了补救方式）、识别优势（有助于保持学习动力），并设计有针对性的下一步行动（这需要教学法知识）——这是一种多层次的分析，要做好需要投入大量时间和专业知识。

## 证据基础

Sadler（1989）指出，形成性评价依赖三个条件：学生（以及教师）必须理解目标（高质量成果是什么样的）、评估当前状况（作品相对于目标处于什么位置），并采取行动弥合差距。差距分析将第二个条件具体化——系统地识别作品在哪些方面未达到要求，以及为什么未达到。Hattie & Timperley（2007）证明，有效反馈必须回应三个问题：“我要去哪里？”（目标）、“我进行得如何？”（相对于目标的当前表现）以及“接下来要做什么？”（用于弥合差距的具体行动）。大多数教师反馈只涉及前两个问题；第三个问题——具体的后续步骤——才是学习发生的地方。Black & Wiliam（1998）表明，只有当收集到的信息被用于调整教学时，形成性评价才有效——没有针对性行动的差距分析，只是诊断，而没有发挥治疗作用。Heritage（2010）强调了对差距进行分类的重要性：概念性差距（学生不理解底层概念）需要采取不同于程序性差距（学生理解概念，但在执行过程中出错）或沟通性差距（学生理解概念并能够完成任务，但无法表达出来）的干预方式。Wiliam（2011）认为，最有力的反馈是给予学生具体、可执行的下一步行动，而不是作出评判。

## 输入结构

教师必须提供：
- **学生作品描述：** 学生完成了什么。*例如：“学生写道：‘作者使用了一个暗喻来描述暴风雨。这很有效，因为它使读者产生兴趣。’” / “学生的演算过程：3/4 + 2/5 = 5/9” / 粘贴实际的学生文本*
- **评估标准：** 应依据什么进行评估。*例如：“学生应识别语言技巧，使用引文，并解释其对读者产生的效果” / “学生应先找到公分母，再进行分数相加”*
- **学习目标：** 学生应当学会什么。*例如：“分析作者如何运用语言营造效果” / “对分母不同的分数进行相加”*

可选（如果可用，由上下文引擎注入）：
- **学生年级：** 年级组
- **学生情况：** 先前学业表现、优势、已知薄弱点
- **学科领域：** 学科
- **任务描述：** 学生正在完成的任务

## 提示

```
You are an expert in formative assessment and diagnostic analysis of student work, with deep knowledge of Hattie & Timperley's (2007) feedback framework, Sadler's (1989) model of formative assessment, and Heritage's (2010) gap classification system. You understand that identifying gaps is only useful if each gap is classified (conceptual, procedural, or communication), because the classification determines the correct teaching response.

Your task is to analyse this student work:

**Student work:** {{student_work_description}}
**Assessment criteria:** {{assessment_criteria}}
**Learning objective:** {{learning_objective}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the work and criteria.
**Student profile:** {{student_profile}} — if not provided, base analysis on the evidence in the work itself.
**Subject area:** {{subject_area}} — if not provided, infer from the work and criteria.
**Task description:** {{task_description}} — if not provided, infer from the criteria and objective.

Apply these evidence-based principles:

1. **Identify strengths first (Hattie & Timperley, 2007):**
   - Before identifying gaps, identify what the student does WELL.
   - Strengths must be specific and evidence-based — not generic praise ("good effort") but specific acknowledgment ("correctly identifies the metaphor and selects a relevant quotation").
   - Strengths provide the foundation for improvement — the next step often involves extending a strength.

2. **Classify each gap (Heritage, 2010):**
   - **Conceptual gap:** The student doesn't understand the underlying idea. ("The student adds numerators and denominators directly — they don't understand that fractions with different denominators represent different-sized pieces.")
   - **Procedural gap:** The student understands the concept but makes errors in execution. ("The student finds a common denominator but then forgets to adjust the numerators.")
   - **Communication gap:** The student understands and can do it but can't express it adequately. ("The student can explain the effect verbally but writes 'This is effective' without elaboration.")
   - Classification matters because: conceptual gaps need re-teaching, procedural gaps need targeted practice, and communication gaps need modelling of how to express understanding.

3. **Generate targeted next steps (Hattie & Timperley, 2007; Wiliam, 2011):**
   - Each gap must have a SPECIFIC next teaching step — not "practise more" but "work through 3 examples where the common denominator is given, focusing only on adjusting the numerators."
   - Next steps should be achievable — one or two steps forward, not a complete re-teach.
   - Prioritise: if multiple gaps exist, identify which ONE should be addressed first (usually the most foundational — a conceptual gap before a procedural one).

4. **Write a feedback script that promotes action (Sadler, 1989):**
   - Feedback should be specific, forward-looking, and actionable.
   - Structure: strength acknowledgment → gap identification → specific next step.
   - Avoid: grades or scores (which end learning), vague praise ("good work"), vague criticism ("needs more detail"), and overwhelming lists of everything wrong.

Return your output in this exact format:

## Gap Analysis: [Brief description]

**Student work:** [Brief summary]
**Assessed against:** [Criteria summary]
**Learning objective:** [Objective]

### Strengths

[Specific, evidence-based strengths — what the student does well]

### Gaps Identified

For each gap:
**Gap [N]: [Brief label]**
- **Type:** Conceptual / Procedural / Communication
- **Evidence:** [What in the student's work reveals this gap]
- **What it means:** [What the student does or doesn't understand]
- **Next teaching step:** [Specific, actionable step to close this gap]

### Priority

[Which gap to address first and why]

### Feedback Script

[How to communicate this to the student — specific wording the teacher could use, structured as: acknowledge strength → identify the key gap → provide the next step]

**Self-check before returning output:** Verify that (a) strengths are specific and evidence-based, (b) each gap is classified as conceptual, procedural, or communication, (c) each gap has a specific next teaching step (not "practise more"), (d) gaps are prioritised, (e) the feedback script is forward-looking and actionable, and (f) the feedback doesn't overwhelm — it identifies the most important next step, not every possible improvement.
```

## 示例输出

**情境：** *学生作答：“作者使用了一个暗喻‘大海是一头狂怒的野兽’来描述暴风雨。这是一个很好的暗喻，因为它把大海比作野兽。对读者的影响是，他们觉得这个暗喻很有效，并且想继续读下去。” / 评估标准：“识别语言技巧，嵌入引文，并分析对读者的影响——解释读者的想法、感受或想象的画面” / 学习目标：“分析作者如何运用语言来产生效果” / 学生水平：“八年级” / 学科领域：“英语”*

---

## 差距分析：语言分析——暗喻

**学生作答：**“作者使用了一个暗喻‘大海是一头狂怒的野兽’来描述暴风雨。这是一个很好的暗喻，因为它把大海比作野兽。对读者的影响是，他们觉得这个暗喻很有效，并且想继续读下去。”
**评估内容：** 识别语言技巧，嵌入引文，分析对读者的影响
**学习目标：** 分析作者如何运用语言来产生效果

### 优势

1. **正确识别了技巧。** 学生准确地说出了“暗喻”——他们能够在语境中识别这一技巧。这是进行分析所必需的基础。
2. **选取了相关引文。** 引文“大海是一头狂怒的野兽”选择得很好——这是一个清晰且可供分析的技巧示例。学生展现出了良好的证据选择能力。
3. **正确嵌入了引文。** 引文通过引号整合进句子中，而不是单独另起一行。这表明学生意识到学术写作的规范。
4. **尝试讨论对读者的影响。** 学生采用了正确的结构——技巧 → 引文 → 影响——这说明他们理解自己应该做什么，尽管分析本身还不够充分。

### 发现的差距

**差距 1：笼统的效果分析——“觉得有效，并且想继续读下去”**
- **类型：** 沟通差距（可能是——见下方说明）
- **证据：** 学生写道：“他们觉得这个暗喻很有效，并且想继续读下去。”这是一个笼统的结论，被套用在这个暗喻上，却没有具体说明实际产生的效果。“想继续读下去”可以用于任何文本中的任何技巧——它不包含任何分析性内容。
- **这意味着什么：** 学生可能理解这个暗喻营造出力量感和危险感（沟通差距——他们知道，但无法表达出来），也可能不理解“对读者的影响”具体意味着什么（概念差距）。需要进行诊断性检查：询问学生：“这个暗喻让你想象出什么画面？它营造出什么感受？”如果他们能够口头回答，那就是沟通差距。如果他们无法回答，那就是概念差距。
- **下一步教学：** 示范笼统的效果分析与具体的效果分析之间的区别。向学生展示：笼统：“这很有效。”具体：“‘狂怒’这个词暗示大海像一只愤怒的动物一样，充满暴力且失去控制。读者会想象出巨大而危险的海浪，并感受到暴风雨的力量与不可预测性。”使用另外 2–3 个引文进行练习：“这让你看到了什么？这让你感受到了什么？”

**空白 2：解释比较，而不是分析比较**
- **类型：** 概念性空白
- **证据：**“This is a good metaphor because it compares the sea to a beast.” 学生在**描述**这个隐喻起了什么作用（比较两个事物），而不是**分析**它达成了什么效果（营造危险、狂野和力量的感觉）。学生停留在识别层面——“它把 X 比作 Y”——这句话本身没错，但还不属于分析。
- **这意味着：**学生可能还没有理解识别一种写作手法与分析一种写作手法之间的区别（说出手法名称，并描述它在结构上做了什么；解释它产生了什么效果，以及为什么会产生这种效果）。这是八年级学生常见的概念性空白——学生已经学会寻找写作手法，但还没有学会分析这些手法。
- **下一步教学：**明确教授这种区别：“识别隐喻 = 说‘它把 X 比作 Y’。分析隐喻 = 解释这个比较让我们产生了怎样的**想法或感受**。”提供一个公式：“这个词/意象 [具体词语] 暗示了 [它让你想到/想象到什么]，因为 [原因]。这为读者营造了 [情感/氛围]。”先用同一句引文练习这个公式，然后再用新的引文练习。

**空白 3：没有分析引文中的具体用词**
- **类型：** 程序性空白
- **证据：**学生完整引用了“the sea was a raging beast”，但没有聚焦于具体词语——“raging”（暴力、愤怒、失去控制）和“beast”（动物、危险、强大、非人类）。有效的分析应当落实到词语层面，而不只是停留在短语层面。
- **下一步教学：**向学生展示如何聚焦具体词语：“你选的引文很棒。现在让我们看看其中的单个词语。‘raging’让你想到什么？‘beast’呢？为什么 Dickens 没有写‘the sea was a large animal’？‘raging beast’和它有什么不同？”这是一项程序性技能——学生需要学会逐步聚焦单个词语的**过程**。

### 优先级

首先解决**空白 2**（解释与分析的区别）。这是概念性空白——在学生理解描述一种写作手法与分析其效果之间的区别之前，解决其他空白并不会有帮助。一旦学生能够解释一种写作手法**对读者产生了什么作用**（而不只是说出它**是什么**），空白 1 和 3 就会容易弥补得多。

### 反馈话术

“好，我来告诉你这段回答中做得好的地方，以及接下来需要改进的一点。

**优点：**你在这里有三点做得非常好。你正确地识别出了这个隐喻——没错，它确实是一个隐喻。你选取了一处很好的引文——‘the sea was a raging beast’中有很多可以分析的内容。而且，你的段落采用了正确的结构：写作手法、引文、效果。所以你的基础很扎实。

**需要弥补的地方：**我希望你接下来重点改进这一点。你写道‘the effect on the reader is that they find it effective’。但这并没有告诉我任何具体的信息。如果我读到‘the sea was a raging beast’，我实际会**想象到什么**？我会**有什么感受**？闭上眼睛——‘raging beast’看起来是什么样的？[让学生回答。]没错——某种强大、危险、失去控制的东西。这才是它产生的效果。这个隐喻让读者把大海想象成某种有生命、狂暴而且令人恐惧的东西。这就是分析。”

**下一步：**这是你下次要遵循的规则。写完引文后，问自己两个问题：“这让我看到了什么？”以及“这让我感受到了什么？”写下这两个问题的答案，这样你就在进行分析，而不只是识别。现在就用这段引文试一试——用这两个问题改写你的第二句和第三句。”

---

## 已知局限

1. **分析取决于对学生作业描述的准确性和完整性。**对学生作业进行转述式总结可能会遗漏重要细节（具体的措辞、推理中的错误、回答的结构）。在可能的情况下，教师应提供学生的实际文本，而不是总结。

2. **不同类型差距之间存在诊断歧义。**有些差距可能属于概念差距，也可能属于沟通差距——学生可能理解了，只是无法表达出来；也可能确实没有理解。分析会在存在这种情况时标记出歧义，并建议进行诊断性检查（例如，让学生进行口头解释），但教师必须根据自己对学生的了解做出最终分类。

3. **分析基于单个作业样本。**一份作业可能无法代表学生的典型表现——他们可能当时很疲惫、很匆忙，或者只是状态不佳。应将分析视为关于这份作业的证据，而不是对学生能力的决定性评估。随着时间推移获取多个作业样本，能够提供更可靠的情况判断。