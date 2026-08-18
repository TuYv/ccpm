---
# AGENT SKILLS STANDARD FIELDS (v2)
name: checking-for-understanding-protocol-designer
description: "Design a checking-for-understanding protocol with specific techniques for each lesson stage. Use when planning systematic comprehension checks during explicit or direct instruction."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "explicit-instruction/checking-for-understanding-protocol-designer"
skill_name: "Checking for Understanding Protocol Designer"
domain: "explicit-instruction"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Rosenshine (2012) — Principles of Instruction, Principle 3: ask a large number of questions and check all student responses"
  - "Wiliam (2011) — Embedded Formative Assessment: practical strategies for checking understanding"
  - "Lemov (2015) — Teach Like a Champion 2.0: cold call, show call, and other CFU techniques"
  - "Black & Wiliam (1998) — Assessment and classroom learning: formative assessment effect size ~0.66"
  - "Christodoulou (2017) — Making Good Progress?: hinge questions and diagnostic assessment"
input_schema:
  required:
    - field: "lesson_content"
      type: "string"
      description: "What is being taught in the lesson"
    - field: "lesson_stage"
      type: "string"
      description: "When CFU is needed: during instruction, after guided practice, end of lesson, or all stages"
    - field: "student_level"
      type: "string"
      description: "Age/year group and class characteristics"
  optional:
    - field: "class_size"
      type: "integer"
      description: "Number of students — affects technique selection"
    - field: "common_misconceptions"
      type: "array"
      description: "Known misconceptions to probe for"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: specific students to monitor, confidence patterns"
    - field: "available_resources"
      type: "string"
      description: "Mini-whiteboards, devices, response cards — what's available in the room"
output_schema:
  type: "object"
  fields:
    - field: "cfu_techniques"
      type: "array"
      description: "Selected techniques with implementation scripts for each lesson stage"
    - field: "hinge_question"
      type: "object"
      description: "A diagnostic hinge question with distractor analysis"
    - field: "cold_call_plan"
      type: "object"
      description: "Structured cold-calling sequence with question stems"
    - field: "response_decision_tree"
      type: "string"
      description: "What to do based on CFU results: proceed, re-teach, or adjust"
chains_well_with:
  - "explicit-instruction-sequence-builder"
  - "hinge-question-designer"
  - "formative-assessment-technique-selector"
  - "retrieval-practice-generator"
teacher_time: "3 minutes"
tags: ["formative-assessment", "checking-understanding", "questioning", "cold-calling", "feedback"]
---
# 理解检查协议设计器

## 此技能的作用

生成适合特定课程阶段的一组理解检查技术，包括随机点名脚本、小白板提示、离堂测验和关键转折问题；每种技术都包含实施细节，以及根据结果采取何种行动的决策树。输出不仅告诉教师*如何*进行检查，还告诉教师*如何处理所获得的信息*。AI 在此处尤其有价值，因为有效的理解检查需要将正确的技术匹配到正确的时机（你不会在讲解进行到一半时使用离堂测验），并设计能够揭示理解程度、而不仅仅是确认学生正在听讲的问题。实践中的大多数理解检查都是“有问题吗？”或“大家都明白了吗？”——这种做法什么也检查不出来。

## 证据基础

Rosenshine（2012）将频繁检查理解确定为有效教学原则中的第 3 条原则：“成功的教师会提出大量问题，检查所有学生的回答，并提供系统性的反馈与纠正。”Black 和 Wiliam（1998）证明，形成性评价——利用评价信息来调整教学——产生的效应量约为 0.66，但前提是教师要根据结果采取行动。Wiliam（2011）将形成性评价具体化为五项关键策略，其中核心是“设计能够引出学习证据的有效课堂讨论、活动和学习任务”。Lemov（2015）提供了实用的课堂技术，包括随机点名（在给予思考时间后，询问没有主动举手的学生）、展示讲评（选取一名学生的作品供全班分析），以及能够快速扫描所有学生回答的标准化格式。Christodoulou（2017）进一步发展了关键转折问题这一概念——通过一个诊断性问题的回答，判断学生是否已经充分理解关键概念，能够继续学习。

## 输入模式

教师必须提供：
- **课程内容：** 正在教授的内容。*例如：“如何使用 πr² 计算圆的面积” / “英国内战的起因” / “使用反方论点写一篇平衡论证”*
- **课程阶段：** 何时需要进行理解检查。*例如：“讲解过程中——我想在继续之前进行检查” / “课程结束——离堂测验” / “所有阶段——给我一份完整协议”*
- **学生水平：** 年级和班级特点。*例如：“七年级，热情但经常过度自信——他们明明不懂却会说自己懂了”*

可选项（如有可用信息，则由上下文引擎注入）：
- **班级人数：** 学生人数
- **常见误解：** 需要重点探查的误解
- **学生档案：** 需要重点关注的特定学生，以及信心与准确率之间的模式
- **可用资源：** 小白板、设备、回答卡

## 提示词

```
You are an expert in formative assessment and checking for understanding, with deep knowledge of Rosenshine's (2012) Principles of Instruction, Wiliam's (2011) formative assessment strategies, Lemov's (2015) practical CFU techniques, and Christodoulou's (2017) work on hinge questions. You understand that the purpose of CFU is not to confirm that students are paying attention — it is to gather diagnostic evidence that determines whether to proceed, re-teach, or adjust.

Your task is to design a CFU protocol for the following:

**Lesson content:** {{lesson_content}}
**Lesson stage:** {{lesson_stage}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Class size:** {{class_size}} — if not provided, design for a class of 25–30 students.
**Common misconceptions:** {{common_misconceptions}} — if not provided, identify the 2–3 most likely misconceptions for this content and design probes that surface them.
**Student profiles:** {{student_profiles}} — if not provided, assume a typical mixed-ability class with some students who overestimate their understanding.
**Available resources:** {{available_resources}} — if not provided, assume mini-whiteboards are available (the single most effective CFU resource) and no devices.

Apply these evidence-based principles:

1. **Check ALL students, not just volunteers (Rosenshine, 2012; Lemov, 2015):**
   - Hands-up questioning checks only the students who already know. It tells you nothing about the other 80%.
   - Use techniques that require ALL students to respond simultaneously: mini-whiteboards, response cards, finger voting, or written responses.
   - Cold calling (calling on students who haven't volunteered) is essential — but always give thinking time first (Wiliam, 2011). "Think for 10 seconds... [pause]... Jordan, what's your answer?"

2. **Design questions that reveal understanding, not recall (Christodoulou, 2017):**
   - "What is the formula for the area of a circle?" checks recall.
   - "The area of a circle is 50 cm². What can you tell me about the radius?" checks understanding — students must work backward and reason with the formula.
   - The best CFU questions require students to APPLY, not REPEAT.

3. **Include a hinge question (Wiliam, 2011; Christodoulou, 2017):**
   - A hinge question is a single multiple-choice question where each wrong answer reveals a specific misconception.
   - The teacher should be able to scan responses in under 30 seconds.
   - The hinge point is the decision: if 80%+ correct, proceed. If 50–80%, address the specific misconception revealed by the most common wrong answer. If below 50%, re-teach.

4. **Plan what to do with the results (Black & Wiliam, 1998):**
   - CFU without a response plan is pointless. For every check, specify:
     - What 80%+ correct means → proceed
     - What common errors mean → which misconception, and how to address it
     - What widespread confusion means → re-teach using a different approach

5. **Match technique to moment:**
   - During instruction: quick checks (cold call, finger vote, mini-whiteboard flash)
   - After guided practice: show call (project one student's work for class analysis)
   - End of lesson: exit ticket (5-minute written task that diagnoses readiness for next lesson)
   - Between lessons: review of exit ticket data to plan the following lesson

Return your output in this exact format:

## CFU Protocol: [Lesson Content]

**For:** [Student level]
**Stage:** [When checks will occur]

### During-Instruction Checks
[2–3 quick-fire checks to use while teaching, with exact questions and technique]

### Hinge Question
[A single diagnostic multiple-choice question with distractor analysis — what each wrong answer reveals]

### Cold-Call Sequence
[A scripted sequence of 3–4 cold-call questions with thinking time built in]

### End-of-Lesson Check (Exit Ticket)
[A 5-minute exit ticket with 2–3 questions that diagnose readiness for the next lesson]

### Response Decision Tree
[What to do based on CFU results — proceed, re-teach, or adjust]

**Self-check before returning output:** Verify that (a) all techniques check ALL students, not just volunteers, (b) the hinge question has distractors that map to specific misconceptions, (c) cold calls include thinking time before naming the student, (d) a response decision tree is included for every check, and (e) questions test understanding and application, not just recall.
```

## 示例输出

**情境：** *课程内容：“使用 πr² 计算圆的面积，包括已知直径而非半径的题目” / 课程阶段：“所有阶段——完整流程” / 学生水平：“八年级数学，中等能力，容易过度自信——经常急于作答，混淆半径和直径而出错”*

---

## CFU 流程：圆的面积（πr²）

**适用对象：** 八年级数学，中等能力
**阶段：** 所有阶段——完整流程

### 课堂教学中的检查

**检查 1——介绍公式之后（开始 2 分钟）：**
*方法：迷你白板*
“在白板上写出圆的面积公式。3……2……1……举起来让我看看。”
- **关注点：** A = πr²。注意观察：A = πd²（把直径代替了半径——关键误解）、A = 2πr（将圆周长与面积混淆）、A = πr（漏掉平方）。
- **如果普遍出现错误：** 不要只是纠正答案。提问：“我看到有些白板上写的是 πd²。谁能解释为什么公式使用的是 r，而不是 d？半径和直径之间是什么关系？”在黑板上画出两者的区别。

**检查 2——完成第一个示例讲解之后（开始 8 分钟）：**
*方法：手指投票*
“一个圆的直径是 10 cm。我需要计算它的面积。第一步应该做什么？请用手指表示：举 1 根手指表示‘将 10 乘以 π’，举 2 根手指表示‘将 10 除以 2 得到半径’，举 3 根手指表示‘将 10 平方’。”
- **正确答案：** 2（先求半径）。
- **如果很多人举 1 或 3：** 学生正在把直径直接代入公式。停下来处理这个问题：“如果题目给出的是直径，在使用公式之前必须先做什么？为什么？”这是本主题中最常见的错误来源。

**检查 3——完成引导练习之后（开始 20 分钟）：**
*方法：展示答案*
选取两名学生针对同一道题的白板解答（一份正确，一份犯了半径/直径错误）。将两份答案并排展示（匿名展示，或在获得许可后展示姓名）。
“哪份解答是正确的？你怎么知道？另一份解答的错误出在哪里？”
这样可以让全班看到常见错误，同时不会让任何一名学生被单独指出。

### 关键问题

**在黑板或屏幕上展示（用 30 秒作答）：**

一个圆的半径是 5 cm。它的面积是多少？

(A) 78.5 cm²
(B) 31.4 cm²
(C) 15.7 cm²
(D) 314 cm²

*学生用手指（或白板）举出 A、B、C 或 D。*

**干扰项分析：**

| 答案 | 反映的问题 | 学生进行的计算 |
|--------|----------------|---------------------------|
| **(A) 78.5 cm²** | **正确**——π × 5² = π × 25 = 78.5 | 正确应用 A = πr² |
| (B) 31.4 cm² | **圆周长/面积混淆**——学生计算的是 2πr，而不是 πr² | 2 × π × 5 = 31.4 |
| (C) 15.7 cm² | **漏掉平方**——学生计算的是 πr，而不是 πr² | π × 5 = 15.7 |
| (D) 314 cm² | **使用了直径而不是半径**——学生先将半径加倍，然后进行了平方 | π × 10² = 314 |

**决策：**
- 80% 以上选择 A → 进入独立练习。
- 很多人选择 B → 停下来。“有些人得到了 31.4。这是圆周长，不是面积。2πr 和 πr² 有什么区别？面积是内部的空间——我们需要使用带平方的公式。”
- 很多人选择 C → 停下来。“有些人得到了 15.7。你使用了 πr，但忘记将半径平方。记住：r² 表示 r 乘以 r，所以 5² 是 25，而不是 5。”
- 很多人选择 D → 停下来。“有些人得到了 314。你使用的是直径（10），而不是半径（5）。公式使用的是 r——始终检查：题目给出的是半径还是直径？”

### 冷调用提问流程

所有冷调用提问都遵循以下模式：提出问题 → 留出思考时间 → 然后点名学生。

**Q1：**“一个圆的半径是 3 cm。不用计算，估计一下——面积会大于还是小于 30 cm²？思考 5 秒……[停顿]……Amira，你觉得呢？为什么？”
*（测试：数感以及对公式的粗略理解。π × 9 ≈ 28，因此略小于 30。）*

**Q2：**“一个圆的面积是 50 cm²。半径大于还是小于 5 cm？思考 10 秒……[停顿]……Jayden，你的答案是什么？”
*（测试：根据公式进行逆向推理。如果 r = 5，面积 = 78.5，大于 50。因此 r 必须小于 5。这需要理解，而不只是套用步骤。）*

**Q3：**“我计算了一个直径为 8 cm 的圆的面积，得到 200.96 cm²。我的朋友说我算错了。不重新计算，你能说说我可能犯了什么错误吗？思考 10 秒……[停顿]……Sophie，你觉得呢？”
*（测试：错误检测。200.96 = π × 8² = π × 64。错误在于把直径当成了半径。若 r = 4，面积 = π × 16 = 50.27。）*

**Q4：**“一个圆的面积能恰好是 100 cm² 吗？思考 15 秒——这道题比较难……[停顿]……Kian，你觉得呢？”
*（测试：更深入的理解。可以——r = √(100/π) ≈ 5.64 cm。如果学生感到困难，这能反映出他们是否能够变形公式，还是只能正向套用公式。）*

### 课堂结束检查（离堂检测）

**5 分钟。在纸条上或练习本中完成。Q1–Q2 不允许使用计算器。**

**Q1。** 一个圆的半径是 4 cm。写出你会用来求面积的计算式。不需要算出最终答案——只需正确列出计算式。
*（测试：他们能否正确列出 πr²？用于区分公式知识与运算能力。）*

**Q2。** 一个圆的直径是 12 cm。半径是多少？你会列出什么计算式来求面积？
*（测试：直径到半径的转换，这是错误率最高的步骤。这个两部分问题可以定位错误发生在哪一步。）*

**Q3。**（允许使用计算器）一个圆形花园的直径是 6 米。园丁想购买草籽。每袋草籽可以覆盖 10 m²。园丁需要购买多少袋？
*（测试：情境应用——必须先求面积，并向上取整到完整的袋数。这类问题会出现在考试中。）*

**离堂检测的分类：**
课堂结束后，将检测纸条分成三堆：
- **已掌握（3 题全部正确）：** 已准备好进入下一课。为这些学生提供交错练习，将圆与其他面积计算混合起来。
- **部分掌握（Q1 正确，但 Q2 或 Q3 错误）：** 掌握了公式，但在直径转换或实际应用方面存在困难。下一课：先用 2 个简短例题练习将直径转换为半径，然后练习 Q3 类型的问题。
- **尚未掌握（Q1 错误）：** 尚未牢固掌握公式。下一课：在进行独立练习前，用另一个示例进行简短的重新讲解。

### 反馈决策树

```
CFU result → Action

During instruction (Check 1-3):
├── 80%+ correct → Proceed to next phase
├── 50-80% correct → Address the specific error shown by the most common wrong answer (2-3 min reteach)
└── Below 50% → Stop. Reteach using a different representation (e.g., draw the circle, shade the area, physically count squares)

Hinge question:
├── 80%+ choose A → Move to You Do
├── Most common error is B (circumference) → Reteach the difference between area and circumference with diagrams
├── Most common error is C (missing square) → Reteach r² with physical demonstration (5 rows of 5 = 25, not 5)
└── Most common error is D (diameter) → Reteach diameter/radius with a circle drawn on the board — measure both

Exit ticket (reviewed after lesson):
├── 80%+ all correct → Next lesson proceeds as planned
├── Cluster of Q2 errors → Start next lesson with diameter-to-radius mini-lesson (5 min)
└── Cluster of Q1 errors → Re-teach the formula next lesson before any new content
```

---

## 已知局限

1. **CFU 技术能告诉你学生当下能做什么，但不能说明他们会记住什么。** 今天能正确回答铰链问题的学生，到下周可能已经忘记了公式。CFU 检查当前理解；必须将其与间隔提取练习结合起来（与 Retrieval Practice Generator 和 Spaced Practice Scheduler 串联），以确保长期记忆保持。

2. **迷你白板和手指投票可能被学生钻空子。** 学生可能抄邻座的答案，等看到其他人的答案后再展示自己的答案，或者将白板倾斜着举起。Lemov（2015）建议使用“按我的口令举板——3、2、1，展示”来减少抄袭，但没有任何技术能够完全杜绝这种情况。随机点名单个学生进行回答是最有力的补充方式，因为这种方式无法被钻空子。

3. **回应决策树需要教师在实时情境中进行判断。** 该决策树提供指导，但教师必须迅速决定是否重新教学、花多长时间，以及何时继续推进。这是一项会随着实践而提升的专业技能——该协议能够提供支持，但无法取代它。