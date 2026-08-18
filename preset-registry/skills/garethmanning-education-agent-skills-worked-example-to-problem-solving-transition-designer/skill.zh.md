---
# AGENT SKILLS STANDARD FIELDS (v2)
name: worked-example-to-problem-solving-transition-designer
description: "Design the transition from worked examples to independent problem-solving using expertise-reversal principles. Use when students follow examples but cannot solve problems alone."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/worked-example-to-problem-solving-transition-designer"
skill_name: "Worked Example to Problem Solving Transition Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Kalyuga et al. (2003) — The expertise reversal effect (seminal paper)"
  - "Kalyuga (2007) — Expertise reversal effect and its implications for learner-tailored instruction"
  - "Renkl & Atkinson (2003) — Structuring the transition from example study to problem solving"
  - "Sweller et al. (2011) — Cognitive load theory (chapter on expertise reversal)"
  - "Van Merriënboer & Kirschner (2018) — Ten steps to complex learning (4C/ID model)"
input_schema:
  required:
    - field: "skill_being_taught"
      type: "string"
      description: "The specific skill or procedure students are learning — what they need to be able to do independently by the end of the sequence"
    - field: "current_student_state"
      type: "string"
      description: "Where students are now — what they already know and what evidence you have of their current competence"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "number_of_practice_problems"
      type: "integer"
      description: "How many practice problems are available or practical"
    - field: "time_available"
      type: "string"
      description: "How much time is available for the transition sequence"
    - field: "assessment_format"
      type: "string"
      description: "How competence will be assessed — timed test, project, practical, or other"
output_schema:
  type: "object"
  fields:
    - field: "transition_sequence"
      type: "object"
      description: "The complete sequence from worked examples to independent problem solving — with the fading stages, transition triggers, and problem selection"
    - field: "expertise_reversal_checkpoints"
      type: "array"
      description: "The specific points where the system checks whether continued scaffolding is helping or hindering"
    - field: "fading_schedule"
      type: "object"
      description: "How scaffolding is gradually removed — which elements fade first and why"
    - field: "independent_practice_design"
      type: "object"
      description: "The design of the independent practice phase — problem types, difficulty progression, and what to do when students get stuck"
chains_well_with:
  - "digital-worked-example-sequence"
  - "adaptive-hint-sequence-designer"
  - "cognitive-tutoring-architecture-designer"
  - "productive-failure-desirable-difficulty-designer"
teacher_time: "5 minutes"
tags: ["expertise-reversal", "Kalyuga", "fading", "worked-examples", "Renkl", "transition", "scaffolding", "cognitive-load"]
---
# 已完成示例到问题解决的过渡设计师

## 此技能的作用

设计从学习已完成示例到独立解决问题的过渡序列——这是逐步撤除支架、由学生接管认知工作的关键阶段。这回应了认知负荷理论中最重要的发现之一：专长逆转效应（Kalyuga 等，2003）。当学生还是新手时，已完成示例非常有效——它们能够减少外在认知负荷，并帮助学生构建图式。但随着学生能力的发展，同样的已完成示例会变得冗余，甚至实际损害学习——曾经帮助新手的支架，如今却阻碍更高级的学生参与推动进一步学习的主动加工。最优的教学并不是固定不变的，而应当具有适应性：随着学生专长的增长，教学应从已完成示例转向问题解决。Renkl 和 Atkinson（2003）提出了“淡出”方法：不要突然从示例切换到问题，而是逐步移除已完成示例中的步骤，让学生逐渐接管更多工作。这项技能设计完整的淡出序列，包括何时开始淡出的触发条件（基于学生表现）、淡出的顺序（先移除哪些步骤），以及后续独立练习阶段的设计。

## 证据基础

Kalyuga 等（2003）通过一系列实验证明了专长逆转效应，显示出对新手非常有效的教学技术，对于更高级的学习者会变得无效甚至有害。在已完成示例的情境中：学习已完成示例的新手，其表现显著优于自行解决问题的新手（已完成示例效应）；但随着学生专长的提升，这一优势发生逆转——更高级的学生从问题解决中学到的内容多于从学习示例中学到的内容。其解释来自认知负荷理论：对于新手而言，已完成示例能够减少手段—目的分析所带来的外在负荷（尝试弄清楚该做什么），从而释放认知资源用于构建图式。对于高级学生而言，已完成示例会造成冗余——学生已经拥有某个图式，而示例此时已成为不必要的信息，会与他们已有的知识争夺加工资源。Kalyuga（2007）扩展了这项研究，主张以学习者为中心的教学必须持续评估学习者的专长水平，并相应调整教学形式。其实际含义是：不存在单一的“最佳”教学方法——最佳方法取决于学习者此时此刻所处的阶段。Renkl 和 Atkinson（2003）提出将淡出作为实现从示例到问题过渡的解决方案。与其从“学习示例”突然切换到“解决问题”，他们设计了一种渐进式过渡：首先是完整的已完成示例；然后是移除一个步骤的示例（由学生完成该步骤）；接着是移除两个步骤的示例；以此类推，直到学生能够解决完整的问题。他们发现，淡出带来的学习效果优于固定的已完成示例或固定的问题解决，因为它能够持续校准认知要求，使其与学生不断增长的专长相匹配。Sweller 等（2011）将专长逆转效应纳入更广泛的认知负荷理论框架，认为所有教学设计都必须考虑学习者当前知识与教学形式之间的相互作用。在学习的某个阶段达到最优的技术，在另一个阶段可能会适得其反。Van Merriënboer 和 Kirschner（2018）为复杂学习开发了 4C/ID 模型，通过一系列支持程度不断降低的任务类别，系统设计从高度支架化的任务表现过渡到独立表现的过程。

## 输入模式

教师必须提供：
- **所教授的技能：** 学生需要独立完成的任务。*例如：“通过因式分解解一元二次方程——找出因式、令每个因式等于零、求出两个根” / “写一篇平衡论证文章——包含提出论点的引言、使用证据的论证段、反方论点段，以及对立场进行评价的结论” / “根据频数表计算平均数、中位数和众数，并判断哪种平均数最合适”*
- **学生当前状态：** 学生目前所处的水平。*例如：“学生已经看过两个由教师主导的完整示例。他们在观看时能够跟随步骤，但还没有独立尝试任何题目” / “学生能够写有说服力的文章（单方面论证），但从未组织过平衡论证” / “学生能够根据原始数据计算平均数，但还没有处理过频数表”*

可选项（如果可用，则由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **练习题数量：** 可提供的题目数量
- **可用时间：** 过渡序列的持续时间
- **评估形式：** 检验能力的方式

## 提示词

```
You are an expert in the expertise reversal effect and the transition from worked examples to problem solving, with deep knowledge of Kalyuga et al.'s (2003) expertise reversal research, Kalyuga's (2007) learner-tailored instruction principles, Renkl & Atkinson's (2003) fading approach, Sweller et al.'s (2011) cognitive load theory, and Van Merriënboer & Kirschner's (2018) 4C/ID model. You understand that the most common instructional error is using a FIXED approach (always examples, or always problems) when the optimal approach is ADAPTIVE — shifting from scaffolded examples to independent problem solving as the student's expertise grows.

CRITICAL PRINCIPLES:
- **The expertise reversal effect is real and consequential.** Continuing to provide worked examples after students have built adequate schemas REDUCES learning. The scaffolding becomes cognitive clutter that the brain must process and suppress. This is not about student preference (students often prefer continued scaffolding because it feels easier) — it's about cognitive science.
- **Fade gradually, don't switch abruptly.** Renkl & Atkinson (2003): the transition from examples to problems should be a GRADIENT, not a cliff. Remove one step at a time, starting with the LAST step (backward fading) so students complete the final step first, then the last two steps, and so on. This builds confidence and ensures each fading stage builds on the previous one.
- **Use performance to trigger fading.** The trigger for removing the next step should be PERFORMANCE-BASED: the student consistently completes the current step correctly. Do not fade on a fixed schedule — students learn at different rates. An AI system can personalise the fading; a teacher can use quick checks.
- **Independent practice must be DESIGNED, not just assigned.** Once fading is complete, the problem-solving phase needs its own design: problem difficulty should increase gradually, problems should be interleaved (not blocked by type), and students who get stuck should receive the MINIMUM help needed (not a return to full worked examples).
- **Watch for the "illusion of competence" during fading.** Students who successfully complete faded examples may FEEL more competent than they are, because the remaining worked steps are doing much of the cognitive work. True competence is demonstrated only in FULLY independent problem solving.

Your task is to design the transition sequence for:

**Skill being taught:** {{skill_being_taught}}
**Current student state:** {{current_student_state}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the skill.
**Number of practice problems:** {{number_of_practice_problems}} — if not provided, design for 8-12 problems across the full sequence.
**Time available:** {{time_available}} — if not provided, design for two 50-minute lessons.
**Assessment format:** {{assessment_format}} — if not provided, assume a timed test without scaffolding.

Return your output in this exact format:

## Worked Example to Problem Solving Transition: [Skill]

**Target skill:** [What students will do independently]
**Starting point:** [Where students are now]
**Transition approach:** [Fading method and rationale]

### Complete Transition Sequence

[The full sequence from worked example to independent problem solving, with each stage clearly defined]

**Stage [N]: [Name] — [Scaffolding level]**
- **What the student sees:** [The example/problem at this stage]
- **What the student does:** [Which steps the student completes]
- **Fading trigger:** [How to know the student is ready for the next stage]
- **Estimated problems at this stage:** [How many before moving on]

### Expertise Reversal Checkpoints

[The specific points where the system/teacher checks whether continued scaffolding is helping or hindering. Include the check method and the decision rule.]

### Fading Schedule

[Which steps are faded in which order, and why this order was chosen]

| Stage | Steps Shown | Steps Faded | Rationale |
|---|---|---|---|
| [Stage] | [Which steps the student can see] | [Which steps the student must complete] | [Why this order] |

### Independent Practice Design

[The design of the fully independent problem-solving phase — problem selection, difficulty progression, and stuck protocols]

### Common Pitfalls

[What can go wrong during the transition and how to address it]

**Self-check before returning output:** Verify that (a) fading is gradual not abrupt, (b) performance triggers the fading, (c) backward fading is used (last steps removed first), (d) expertise reversal checkpoints are included, and (e) independent practice is designed not just assigned.
```

## 示例输出

**情境：** *正在教授的技能：“通过因式分解解一元二次方程——在 x² + bx + c = 0 中找出乘积为 c 且和为 b 的两个数，写出因式分解形式 (x + p)(x + q) = 0，将每个因式分别设为零，并求出两个根” / 当前学生状态：“学生已经看过教师在黑板上讲解的两个例题。他们能够识别出需要对方程进行因式分解，也理解‘乘积为 c 且和为 b 的两个数’这一概念，但还没有独立尝试过任何题目。一些学生仍然不清楚为什么将每个因式设为零就能得到解” / 学生水平：“10 年级，GCSE Higher tier” / 学科领域：“数学” / 可用时间：“一节 60 分钟的课加家庭作业” / 评估形式：“单元结束测试，无支架，25 分钟内解答 8 道一元二次方程”*

---

## 从例题讲解过渡到问题解决：通过因式分解解一元二次方程

**目标技能：** 独立通过因式分解解出 x² + bx + c = 0 形式的一元二次方程  
**起点：** 学生已经看过 2 道例题；能够按照方法进行解题，但尚未独立尝试；部分学生不清楚为什么因式分解能够得到解  
**过渡方法：** 逐步撤除支架（Backward fading，Renkl & Atkinson，2003）——先从结尾处移除步骤，使学生在承担前面步骤的责任之前，先对最后几个步骤建立信心

### 完整过渡流程

该过程包含 4 个关键步骤：
1. **识别：** 将方程写成标准形式（x² + bx + c = 0）
2. **寻找因式：** 找出乘积为 c 且和为 b 的两个数
3. **写出因式：** 写出因式分解形式（x + p)(x + q) = 0
4. **求解：** 将每个因式设为零并求出 x

**阶段 1：带有自我解释的完整例题（1 道题）**

- **学生看到的内容：** 完整的解题过程：x² + 5x + 6 = 0 → “需要找出两个乘积为 6 且和为 5 的数” → 2 和 3 → (x + 2)(x + 3) = 0 → x + 2 = 0 或 x + 3 = 0 → x = -2 或 x = -3
- **学生完成的任务：** 研究该例题。在第 4 步，回答自我解释提示：“为什么 (x + 2)(x + 3) = 0 意味着 x + 2 = 0 或 x + 3 = 0？使这一结论成立的数学规则是什么？”（目标：如果一个乘积等于零，那么至少有一个因式必须等于零。）
- **撤除支架触发条件：** 学生能够用自己的话阐述零乘积性质
- **此阶段预计题量：** 1

**阶段 2：撤除第 4 步——学生从因式分解形式开始求解（2 道题）**

- **学生看到的内容：** 第 1-3 步已完成：x² + 7x + 12 = 0 → 因式中的两个数为 3 和 4 → (x + 3)(x + 4) = 0 → [学生从此处开始完成]
- **学生完成的任务：** 将每个因式设为零并求解：x = -3 或 x = -4。这是最简单的一步——只需进行一次运算。
- **撤除支架触发条件：** 学生在此阶段连续正确完成 2 道题（两个因式都设为零，并且两个根的符号都正确）
- **此阶段预计题量：** 2-3

**阶段 3：撤除第 3-4 步——学生写出因式分解形式并求解（2 道题）**

- **学生看到的内容：** 已完成第 1-2 步：x² + 8x + 15 = 0 → “这两个数是 3 和 5” → [学生从此处继续完成]
- **学生要做的事情：** 写出 (x + 3)(x + 5) = 0，然后令每个因式等于零并求解：x = -3 或 x = -5
- **淡出触发条件：** 学生连续 2 道题正确写出因式分解形式并完成求解
- **此阶段预计题目数：** 2-3

**第 4 阶段：淡出第 2-4 步 — 学生找出因式、写出形式并求解（2-3 道题）**

- **学生看到的内容：** 仅显示第 1 步：x² + 9x + 20 = 0 → [学生从此处继续完成]
- **学生要做的事情：** 找出这两个数（4 和 5），写出 (x + 4)(x + 5) = 0，并求解得到 x = -4 或 x = -5。此时，学生已经能够完成除识别标准形式之外的所有步骤。
- **淡出触发条件：** 学生连续 2 道题正确完成所有步骤，包括找出因式对
- **此阶段预计题目数：** 2-4

**第 5 阶段：完全独立解题（4-6 道题）**

- **学生看到的内容：** 仅有方程：x² + 11x + 24 = 0。不提供提示。
- **学生要做的事情：** 从头到尾完成整个解题过程
- **淡出触发条件：** 不适用 — 这是目标表现。掌握标准：连续 3 次正确解答
- **此阶段预计题目数：** 4-6（包括逐步增加难度 — 参见 Independent Practice Design）

### 专长逆转检查点

**检查点 1（第 2 阶段之后）：** 如果学生能立即完成第 2 阶段的题目，并且看起来感到无聊，则跳过第 3 阶段，直接进入第 4 阶段。此时支架正变得多余。专长逆转的表现：学生说“这部分我已经会了”，或在阅读所显示的步骤之前就完成了被淡出的步骤。

**检查点 2（第 3 阶段之后）：** 如果学生能够正确完成第 2-3 阶段的题目，但速度较慢（每道题超过 2 分钟），则可以在进入下一阶段前，在第 3 阶段增加 1 道题。如果学生用时少于 1 分钟，则立即进入第 4 阶段。

**检查点 3（第 5 阶段期间）：** 如果一名在第 3-4 阶段表现良好的学生突然在第 5 阶段遇到困难，不要让其回到完整的示例讲解。相反，应回到第 4 阶段（显示一个步骤）完成 1-2 道题，然后再次尝试第 5 阶段。遇到挫折时，适当的应对方式是**退回一个阶段**，而不是从头开始。

**检查点 4（第 5 阶段期间，针对不同学生）：** 对于在 15 分钟内进入第 5 阶段的最快学生，应引入**变式题**：其中 a ≠ 1 的方程（例如 2x² + 7x + 3 = 0）、需要先重新整理的方程（x² + 5x = -6），或含有负系数的方程。这可以防止专长逆转效应：一旦掌握了简单的因式分解，继续练习简单题的效果就不如进阶到更困难的变式题。

### 淡出计划

| 阶段 | 显示的步骤 | 淡出的步骤（由学生完成） | 原理 |
|---|---|---|---|
| 1（完整） | 全部 4 步 | 无（仅进行自我解释） | 学生通过学习完整过程建立图式 |
| 2 | 第 1、2、3 步 | 第 4 步（根据因式求解） | 首先淡出最后一步 — 认知要求最简单，有助于建立信心 |
| 3 | 第 1、2 步 | 第 3、4 步（写出因式并求解） | 学生现在负责“输出”阶段，而“输入”（找出因式）由提示给出 |
| 4 | 仅第 1 步 | 第 2、3、4 步（找出因式 + 写出因式 + 求解） | 学生完成大部分工作；只提供标准形式 |
| 5（独立） | 无 | 全部 4 步 | 完全独立 — 目标状态 |

**为什么采用后向渐隐？** 先移除最后一步，意味着学生始终能够完成题目——他们在每个阶段都会体验到成功（写出最终答案）。这能建立信心和学习动机。前向渐隐（先移除第 1 步）会让学生开始解题，但随后看到解决方案的其余部分——这更像是“被展示答案”，而不是“解决问题”。

### 独立练习设计

**第 5 阶段（完全独立）的问题选择：**

| 问题 | 方程 | 新挑战 | 目的 |
|---|---|---|---|
| 1 | x² + 6x + 8 = 0 | 无——直接解题 | 确认基本能力 |
| 2 | x² - 5x + 6 = 0 | x 的系数为负 | 测试对因式分解中符号的理解 |
| 3 | x² + 2x - 15 = 0 | 常数项为负 | 需要使用符号不同的因数 |
| 4 | x² - 9 = 0 | 两个平方之差（没有 bx 项） | 测试学生是否能识别这一特殊情况 |
| 5 | x² + 3x = 10 | 需要先进行移项 | 测试学生能否处理非标准形式 |
| 6 | 2x² + 7x + 3 = 0 | 首项系数 ≠ 1（拓展） | 提高难度——适用于能快速掌握标准形式的学生 |

**卡住时的处理流程：** 如果学生在独立练习中卡住：
1. **首先：** 等待 60 秒。有效的坚持思考很有价值。
2. **如果仍然卡住：** 询问“你卡在哪一步？”这个诊断性问题能帮助学生找出具体困难（寻找因数？写出形式？求解？）。
3. **如果困难在第 2 步（寻找因数）：** 提供提示，而不是示例：“哪些数对相乘等于 [c]？把它们全部写下来。现在检查哪一对相加等于 [b]。”
4. **如果困难是概念性的（不理解该方法）：** 回到第 4 阶段（展示一个步骤）完成 2 道题，然后再尝试独立完成。
5. **除非学生明显感到挫败，并且渐隐推进得过快，否则不要回到完整的解题示例。** 目标是采用最少的支架。

### 常见陷阱

**陷阱 1：对能力较强的学生渐隐过慢。** 如果学生在 5 分钟内轻松完成第 1-3 阶段，他们不需要第 4 阶段——他们已经超过了专业知识逆转阈值。立即让他们进入第 5 阶段，并引入变化题型。持续渐隐会浪费他们的时间，还可能降低学习效果（Kalyuga 等，2003）。

**陷阱 2：对学习有困难的学生渐隐过快。** 如果学生在第 3 阶段出错，**不要**推进到第 4 阶段。在第 3 阶段增加 1-2 道题。渐隐的触发条件是**持续稳定地答对**，而不是“答对一次”。

**陷阱 3：学生记住了因数对，而不是掌握方法。** 如果所有问题都使用较小且容易处理的数字（x² + 5x + 6、x² + 7x + 12），学生可能无需理解系统化的方法，仅凭观察就能找出因数。至少加入一道使用较大数字的问题（x² + 17x + 72），迫使学生采用系统化的方法。

**陷阱 4：将家庭作业与过渡阶段混为一谈。** 家庭作业应该是**独立**练习（第 5 阶段的问题），而不是更多的渐隐示例。如果学生在家庭作业中完成的是渐隐示例，他们参加测试时将从未独立完成过一道完整的问题。过渡必须在**课堂上**完成，因为课堂上有支持；家庭作业则巩固独立完成题目的能力。

---

## 已知局限

1. **专业知识逆转效应在 STEM 领域已得到充分证实，但在其他领域的研究较少。** Kalyuga 等人（2003 年）的研究主要在数学、科学和技术领域开展。该原则可以迁移（帮助新手的支架可能会阻碍专家），但对于“步骤”不太明确的领域（如论文写作、历史分析、创造性任务），具体的逐步撤除方法可能需要调整。

2. **逐步撤除速度存在很大的个体差异。** 在一个 30 人的班级中，有些学生 10 分钟就能达到第 5 阶段，而另一些学生 30 分钟后仍处于第 2 阶段。统一的全班逐步撤除进度对有些学生来说会太快，对另一些学生来说则会太慢。上述设计针对个体或小组进度进行了优化；在全班实施时需要进行差异化处理。

3. **反向逐步撤除并不总是最优方法。** Renkl 与 Atkinson（2003 年）发现，对于具有明确步骤序列的程序性技能，反向逐步撤除很有效。对于结构不那么线性的任务（例如规划实验、组织论证），“最后一步”可能并没有清晰的定义。在这些情况下，需要根据具体的任务结构调整逐步撤除的顺序。

4. **评估必须与目标相匹配。** 如果单元结束测试包含支架（公式表、步骤提示），那么专业知识逆转效应的相关性就会降低，因为评估过程中已经提供了支架。上述过渡设计假设采用的是一种无支架评估，要求学生独立完成完整的操作流程。