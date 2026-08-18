---
# AGENT SKILLS STANDARD FIELDS (v2)
name: formative-assessment-technique-selector
description: "Select the right formative assessment technique for a specific learning moment, purpose, and age group. Use when choosing how to check understanding during, between, or after lessons."
disable-model-invocation: true
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/formative-assessment-technique-selector"
skill_name: "Formative Assessment Technique Selector"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Black & Wiliam (1998) — Assessment and Classroom Learning"
  - "Wiliam (2011) — Embedded Formative Assessment"
  - "Leahy et al. (2005) — Classroom Assessment: minute by minute, day by day"
  - "Heritage (2010) — Formative Assessment: making it happen in the classroom"
  - "Wiliam & Leahy (2015) — Embedding Formative Assessment: practical techniques for K–12 classrooms"
input_schema:
  required:
    - field: "learning_moment"
      type: "string"
      description: "When in the lesson/sequence the assessment happens — e.g. during teacher explanation, after guided practice, end of lesson, between lessons, start of next lesson"
    - field: "what_to_assess"
      type: "string"
      description: "The specific understanding, skill, or knowledge to check"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "class_size"
      type: "integer"
      description: "Number of students — affects technique practicality"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: EAL students, confidence levels, specific needs"
    - field: "available_resources"
      type: "string"
      description: "Mini-whiteboards, technology, exit ticket slips, etc."
output_schema:
  type: "object"
  fields:
    - field: "recommended_techniques"
      type: "array"
      description: "2–3 techniques ranked by suitability, with implementation guide for each"
    - field: "technique_rationale"
      type: "string"
      description: "Why each technique is appropriate for this specific moment and purpose"
    - field: "response_interpretation"
      type: "object"
      description: "How to interpret responses — what patterns mean and what to do next"
    - field: "common_mistakes"
      type: "string"
      description: "How the technique can go wrong and how to avoid it"
chains_well_with:
  - "hinge-question-designer"
  - "checking-for-understanding-protocol-designer"
  - "exit-ticket-designer"
  - "explicit-instruction-sequence-builder"
  - "kud-knowledge-type-mapper"
teacher_time: "2 minutes"
tags: ["formative-assessment", "checking-understanding", "AfL", "feedback", "responsive-teaching"]
---
# 形成性评价技术选择器

## 此技能的作用

针对特定的学习时刻，选择最合适的形成性评价技术——可以是在教学过程中、指导练习之后、课程结束时或课间——并提供完整的实施指南，包括如何解读学生的回答，以及根据数据所反映的情况接下来应采取什么措施。与通用的形成性评价方法列表不同，此技能会根据具体时刻、目的和实际限制来匹配评价技术。一种在课程结束时效果极佳的技术（出口条）在教师讲解过程中可能毫无用处；一种适合检查事实记忆的技术（迷你白板）并不适合检查深层理解，因为后者需要解释，而不是单一答案。AI 在这里尤其有价值，因为选择正确的技术需要匹配评价目的（我在检查什么？）、时机（在课程的哪个环节？）、回答形式（我需要所有学生的快速数据，还是少数学生的深入数据？）以及实际限制（班级规模、资源、时间）。

## 证据基础

Black & Wiliam (1998) 将形成性评价确立为教育领域中杠杆效应最高的干预措施之一（效应量为 0.4–0.7），但关键在于，他们根据评价的功能而非形式来定义形成性评价：只有当评价证据被用于调整教学时，评价才是形成性的。布置出口条却不读，直到第二天才查看，这不是形成性评价——而是延迟的总结性评价。Wiliam (2011) 将形成性评价具体化为五项关键策略：明确学习意图、设计讨论、提供反馈、让学生成为彼此的学习资源，以及让学生成为自己学习的主人。Leahy et al. (2005) 将这些策略转化为实用的课堂技术，强调形成性评价必须嵌入教学之中，而不是事后附加。Heritage (2010) 区分了计划性形成性评价（提前设计到课程中的评价）和互动性形成性评价（即时、根据现场情况作出回应的评价），并指出二者都是必要的，但服务于不同的目的。Wiliam & Leahy (2015) 提供了全面的实施指南，强调最佳的技术应从所有学生那里收集证据，而不仅仅是从主动举手的学生那里收集。

## 输入模式

教师必须提供：
- **学习时刻：** 在学习序列中的哪个时间点。*例如：“在我讲解如何对不同分母的分数进行加法时——我需要在继续之前进行检查” / “在学生独立完成 5 道练习题之后” / “课程结束时——我需要知道哪些学生已经掌握，哪些还没有” / “下一节课开始时——检查学生对昨天内容的记忆”*
- **评价内容：** 要检查的具体内容。*例如：“学生能否找出公分母？” / “学生是否理解这个人物为什么做出那个决定？” / “学生能否将公式应用到新的情境中？”*
- **学生水平：** 年级。*例如：“七年级”*

可选（如果可用，可由 context engine 注入）：
- **班级规模：** 学生人数
- **学科领域：** 课程所属学科
- **学生概况：** EAL、信心水平、具体需求
- **可用资源：** 可用设备

## Prompt

```
You are an expert in formative assessment and responsive teaching, with deep knowledge of Black & Wiliam's (1998) research on assessment for learning, Wiliam's (2011) five key strategies, Leahy et al.'s (2005) practical techniques, and Heritage's (2010) distinction between planned and interactive formative assessment. You understand that formative assessment is defined by its FUNCTION (using evidence to adapt teaching), not its FORM (any particular technique) — and that the right technique depends on the specific learning moment, the type of understanding being assessed, and the practical constraints.

Your task is to select formative assessment techniques for:

**Learning moment:** {{learning_moment}}
**What to assess:** {{what_to_assess}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Class size:** {{class_size}} — if not provided, assume 25–30 students.
**Subject area:** {{subject_area}} — if not provided, infer from the assessment focus.
**Student profiles:** {{student_profiles}} — if not provided, assume a mixed-ability class with some EAL students and some reluctant participants.
**Available resources:** {{available_resources}} — if not provided, assume mini-whiteboards are available but no technology.

Apply these evidence-based principles:

1. **Every student, not just volunteers (Wiliam, 2011):**
   - The technique must collect evidence from ALL students, not just those who raise their hands.
   - "Hands up" is NOT formative assessment — it only tells you about the 5–6 students who volunteer. It tells you nothing about the other 20–25.
   - Techniques that collect data from every student: mini-whiteboards, exit tickets, finger voting, all-student response systems, think-pair-share with reporting.

2. **Match technique to purpose (Heritage, 2010):**
   - **Checking factual knowledge:** Quick-response techniques — mini-whiteboards, finger voting, true/false cards. Speed matters; depth doesn't.
   - **Checking understanding:** Explanation-based techniques — think-pair-share, exit tickets with reasoning, hinge questions with diagnostic distractors. Depth matters; speed is secondary.
   - **Checking application:** Task-based techniques — practice problems with monitoring, worked examples with a gap, mini-tasks. Observation of process matters.
   - **Checking misconceptions:** Diagnostic techniques — hinge questions with misconception-targeted distractors, deliberate error identification tasks.

3. **Match technique to timing (Leahy et al., 2005):**
   - **During instruction (real-time):** Must be fast (under 60 seconds), non-disruptive, and provide immediate data. Mini-whiteboards, finger voting, traffic lights.
   - **After guided practice:** Must reveal whether students can apply independently. Quick practice problem, show-me task, partner explanation.
   - **End of lesson:** Must capture what students are leaving with. Exit ticket (3–5 minutes), summary task, one-sentence explanation.
   - **Between lessons:** Must check retention and inform the next lesson. Retrieval quiz at start of next lesson, homework analysis.

4. **Interpret and act (Black & Wiliam, 1998):**
   - The technique is only formative if the teacher USES the data to adapt teaching.
   - For each technique, provide: what response patterns mean, and what to DO based on each pattern.
   - 80%+ correct → proceed. 50–80% → brief re-teach. Below 50% → significant reteach needed.

5. **Avoid pseudo-formative assessment:**
   - "Thumbs up if you understand" is NOT formative assessment — students cannot accurately self-assess understanding in the moment, and social pressure ensures most thumbs go up.
   - "Any questions?" is NOT formative assessment — students who don't understand often don't know what to ask.
   - The technique must require students to DEMONSTRATE understanding, not just claim it.

Return your output in this exact format:

## Formative Assessment: [What's being assessed]

**Moment:** [When in the lesson]
**Assessing:** [Specific understanding/skill]
**For:** [Student level]

### Recommended Techniques

For each technique (2–3, ranked):

**Technique [N]: [Name]**
**How it works:** [Step-by-step implementation]
**Time required:** [Minutes]
**Why this technique for this moment:** [Specific rationale]
**What to look for:** [Specific responses that indicate understanding vs. confusion]

### Response Interpretation Guide

**If 80%+ demonstrate understanding:** [What to do]
**If 50–80% demonstrate understanding:** [What to do]
**If below 50%:** [What to do]
**If you see [specific common error]:** [What it means and what to do]

### Common Mistakes with These Techniques

[2–3 ways the technique can fail and how to prevent it]

**Self-check before returning output:** Verify that (a) the recommended technique collects data from ALL students, (b) the technique is matched to the specific learning moment and purpose, (c) the implementation guide is specific enough for a teacher to use immediately, (d) the response interpretation includes specific actions, and (e) no recommended technique relies on volunteers or self-report.
```

## 示例输出

**场景：** *学习时刻：“我刚刚讲解完如何计算三角形的面积（底 × 高 ÷ 2），并展示了两个完整的示例。在布置练习题之前，我需要检查学生是否已经充分理解这一方法，能够独立尝试。” / 评估内容：“学生能否在给出底和高的情况下，正确计算三角形的面积？” / 学生年级：“七年级” / 学科领域：“数学” / 可用资源：“可使用小白板”*

---

## 形成性评估：三角形面积计算

**时机：** 教师讲解和展示完整示例之后、独立练习之前  
**评估内容：** 学生能否在给出底和高的情况下，正确计算三角形的面积？  
**适用对象：** 七年级数学

### 推荐方法

**方法 1：小白板展示答案（推荐）**  
**操作方式：**
1. 在黑板上展示一个底为 8cm、高为 5cm 的三角形。
2. 说：“计算这个三角形的面积。把你的计算过程写在白板上。你有 60 秒。”
3. 60 秒后说：“3、2、1，展示！”所有学生同时举起小白板。
4. 扫视教室。观察学生是否得出了正确答案（20cm²），以及计算过程是否正确。
5. 如果时间允许，再用另一个三角形（使用不同的数字）重复一次，以确认学生是否掌握。

**所需时间：** 2–3 分钟（包括后续题目）  
**为什么这个方法适合此时机：** 这是一次程序性检查——学生能否正确应用公式？小白板非常适合，因为它可以同时收集每一位学生的信息，能够展示计算过程（而不仅仅是答案），并提供即时反馈。“3、2、1，展示！”这一流程可以防止学生抄袭——每个人都会同时展示答案。  
**需要观察的内容：**
- 答案和计算过程都正确（20cm²：8 × 5 = 40，40 ÷ 2 = 20）→ 学生已经可以开始练习
- 答案为 40cm² → 学生进行了乘法运算，但忘记除以 2
- 答案为 13cm² → 学生进行了加法运算，而不是乘法运算（8 + 5 = 13）
- 白板空白或写下了随机数字 → 学生不知道从哪里开始，说明没有理解完整示例

**方法 2：用手指回答关键问题**  
**操作方式：**
1. 展示：“一个三角形的底为 6cm，高为 4cm。面积是多少？”  
   A) 10cm²    B) 12cm²    C) 24cm²    D) 20cm²
2. 说：“思考这个问题。不要喊出答案。当我说开始时，用手指表示答案：举 1 根手指代表 A，2 根代表 B，3 根代表 C，4 根代表 D。”
3. “3、2、1，展示！”扫视教室。

**所需时间：** 1–2 分钟  
**为什么这个方法适合此时机：** 这比使用小白板更快。各个干扰项具有诊断作用：A（10）= 将底和高相加，而不是相乘；B（12）= 正确；C（24）= 正确进行了乘法，但没有除以 2；D（20）= 常见且看似合理的错误答案。每个错误答案都能揭示一种具体错误。  
**需要观察的内容：**
- 举 2 根手指（B，正确：12cm²）→ 学生理解了这一方法
- 举 3 根手指（C，24cm²）→ 学生正确进行了乘法，但没有除以 2，这是最常见的错误
- 举 1 根手指（A，10cm²）→ 学生将底和高相加，而不是相乘

**技巧 3：同伴讲解（用于检查更深层次的理解）**  
**运作方式：**
1. “转向你的同伴。A 同学：向 B 同学解释如何计算三角形的面积。不要只说答案——请解释计算方法。B 同学：认真听并检查——他说得对吗？”
2. 60 秒后：“B 同学——如果 A 同学解释得正确，请举手。”
3. 随机点名 2–3 名 B 同学：“你的同伴是怎么说的？”

**所需时间：**3–4 分钟  
**为什么此时使用这一技巧：**如果你想检查学生是否能够**解释**方法，而不仅仅是应用方法，就使用这一技巧。向同伴解释比计算出答案更能体现深层次的理解。不过，这种方法耗时更长，而且比白板提供的数据精确度更低。  
**需要观察什么：**学生能否清楚表达“用底乘以高，然后除以 2”——还是只会说“我就是算了 8 乘 5 再除以 2”，却不理解为什么这样做？注意听他们是否能够解释除以 2 这一步：“因为三角形是长方形的一半。”

### 回应解读指南

**如果 80% 以上的学生得出正确答案（技巧 1 或 2）：**进入独立练习。学生已经准备好了。布置 6–8 道难度逐渐增加的题目（包括高不是从底边垂直向上所作的三角形——这是下一个常见难点）。

**如果 50–80% 的学生得出正确答案：**找出最常见的错误。如果大多数错误是“忘记除以 2”（答案为 40 或 24）：进行简短的 2 分钟重新讲解。“我看到你们很多人乘法算对了，但忘记了一个步骤。看——三角形是长方形的**一半**。所以，面积就是底乘以高的一半。看我再做一道。”重新做一道例题，重点强调除以 2，然后用白板再次检查。

**如果低于 50% 的学生得出正确答案：**不要进入练习——学生会练习错误的方法，并将错误固化。回到讲解环节。“我看出你们很多人还不确定。没关系——这有点难。让我从头再讲一遍。”使用不同的表示方式重新讲解（例如，沿对角线将一个长方形切成两半，展示三角形是长方形的一半）。然后再次检查。

**如果你看到“把数相加而不是相乘”（答案为 13 或 10）：**这名学生混淆了面积公式和周长概念。他们需要澄清：“面积是图形**内部**的空间——我们通过相乘来计算内部能容纳多少平方厘米。周长是图形外部**周围**的距离——这时才需要相加。”

### 使用这些技巧时的常见错误

1. **允许学生在不同时间展示白板。**如果学生一个接一个地亮出答案，后面的学生就会抄前面的答案。“3、2、1，给我看”这种同时展示的方式至关重要——它能防止抄袭，并让你真实了解全班的情况。

2. **只看答案，不看解题过程。**写出“20cm²”的学生答案是正确的，但他们是计算了 8 × 5 ÷ 2，还是猜出来的？查看解题过程可以区分真正的理解和碰巧猜对。在使用白板时，要求学生展示解题过程。

3. **在检查之后询问“大家都明白了吗？”** 如果白板上的数据表明正确率为 85%，就继续进行。不要随后再提出一个总会得到“是”的问题，从而削弱数据的可信度。应当相信证据，而不是自我报告。

---

## 已知局限

1. **快速形成性评估技术（白板、手指投票）最适合用于检查程序性知识和事实回忆。** 更深层次的理解——公式为什么有效、何时使用公式、公式如何与其他概念建立联系——需要耗时更多的评估方法（解释任务、拓展题、讨论）。此技能会针对当下情境推荐合适的技术，但有些学习目标需要采用无法在 2 分钟内完成的评估方法。

2. **对回答进行解读的阈值（80%、50–80%、低于 50%）是指导原则，而不是硬性规则。** 一个正确率为 78% 的班级可能已经准备好继续学习，前提是答错的 22% 学生犯的是同一种可纠正的错误。一个正确率为 82% 的班级也可能需要暂停，前提是错误表明存在根深蒂固的误解。教师必须结合具体情境，运用专业判断来解读数据。

3. **只有在教师做好调整准备的情况下，形成性评估才能发挥作用。** 这项技术能够提供数据，但数据的价值在于后续回应。一位检查白板、看到正确率为 60%，却因为需要“完成课程内容”而照常继续的教师，虽然进行了形成性检查，却没有实施形成性评估。根据数据调整课程的意愿，是任何技术都无法提供的关键要素。