---
# AGENT SKILLS STANDARD FIELDS (v2)
name: productive-failure-desirable-difficulty-designer
description: "Redesign a direct instruction sequence to include productive struggle before the explanation phase. Use when teaching concepts that benefit from failure-first approaches."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/productive-failure-desirable-difficulty-designer"
skill_name: "Productive Failure & Desirable Difficulty Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Kapur (2008) — Productive failure"
  - "Kapur (2016) — Examining productive failure, productive success, unproductive failure, and unproductive success in learning"
  - "Bjork (1994) — Memory and metamemory considerations in the training of human beings"
  - "Bjork & Bjork (2011) — Making things hard on yourself, but in a good way: creating desirable difficulties to enhance learning"
  - "Soderstrom & Bjork (2015) — Learning versus performance: an integrative review"
input_schema:
  required:
    - field: "target_concept"
      type: "string"
      description: "The specific concept or skill that students need to learn deeply — the content that benefits from productive failure rather than direct instruction"
    - field: "current_approach"
      type: "string"
      description: "How this concept is currently taught — typically direct instruction followed by practice"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "time_available"
      type: "string"
      description: "How much lesson time is available for the productive failure sequence"
    - field: "prerequisite_knowledge"
      type: "string"
      description: "What students already know that they can draw on during the generation phase"
    - field: "risk_tolerance"
      type: "string"
      description: "How comfortable the teacher is with student struggle and initial failure — important for implementation"
output_schema:
  type: "object"
  fields:
    - field: "productive_failure_sequence"
      type: "object"
      description: "The complete sequence — generation phase, consolidation phase, and the critical transition between them"
    - field: "desirable_difficulties"
      type: "array"
      description: "The specific difficulties embedded in the task and why each one enhances learning"
    - field: "failure_safeguards"
      type: "object"
      description: "How to ensure failure is PRODUCTIVE rather than unproductive — the conditions that must be in place"
    - field: "cognitive_offloading_risks"
      type: "object"
      description: "How AI tools might undermine the desirable difficulties and what to do about it"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "worked-example-to-problem-solving-transition-designer"
  - "self-explanation-prompt-designer"
  - "intelligent-tutoring-dialogue-designer"
teacher_time: "5 minutes"
tags: ["productive-failure", "desirable-difficulty", "Kapur", "Bjork", "struggle", "generation", "consolidation", "cognitive-offloading"]
---
# 生产性失败与理想困难设计师

## 此技能的作用

重新设计教学序列，以融入生产性失败（Kapur，2008、2016）和理想困难（Bjork，1994；Bjork & Bjork，2011），用“先挣扎、再巩固”的模式取代标准的“先教学、再练习”模式，从而实现更深入、更持久的学习。其核心悖论是：相比先接受清晰指导并立即成功的学生，那些先经历挣扎和失败的学生，从长远来看学到的内容更多——尽管他们在课堂上的感受更糟。Kapur（2016）表明，生产性失败之所以有效，是因为生成阶段（学生在接受教学前尝试解决问题的阶段）会激活先前知识，揭示这些知识的局限，并形成“知识缺口”，使后续教学更有意义。Bjork（1994）提出了“理想困难”这一概念，即那些让短期学习变得更困难、但能让长期学习更加持久的条件。这些条件包括间隔、交错、生成和提取练习。这项技能在 AI 驱动的学习环境中尤其重要，因为 AI 工具可能会无意中消除理想困难——让任务变得更容易、提供即时答案，并减少推动深度学习的生产性挣扎。输出内容包括完整的生产性失败序列（生成阶段 + 巩固阶段）、任务中嵌入的具体理想困难、确保失败具有生产性而非破坏性的保障措施，以及防止 AI 驱动的认知卸载的指导。

## 证据基础

Kapur（2008、2016）通过一系列数学课堂研究建立了生产性失败框架。在其经典设计中，学生会在接受任何教学之前，先面对一个复杂、新颖的问题——一个预期他们会失败的问题。他们以小组形式合作，生成多种解决方案，其中没有一种是完全正确的。随后，教师讲解经典解法，并明确将其与学生生成的方法进行比较。Kapur（2016）发现，在概念理解和迁移的测量中，生产性失败条件下的学生显著优于先接受直接教学的学生——尽管直接教学组的学生在即时程序性测试中的表现更好。关键发现是：产生学习的并不是失败，而是生成。能够生成想法的学生，即使这些想法是错误的，也会形成对问题空间更丰富的表征，从而使后续教学更有意义。Bjork（1994）以及 Bjork & Bjork（2011）阐述了理想困难这一更广泛的原则：某些条件会降低学习期间的表现，却能增强长期保持和迁移。他们确定了四种关键的理想困难：（1）间隔——将练习分散到一段时间内，而不是集中进行；（2）交错——混合不同的问题类型，而不是将同类问题集中安排；（3）生成——生成答案，而不是阅读答案；以及（4）提取练习——进行自我测试，而不是重新学习。四者都具有一个共同机制：它们会让学习体验感觉更困难、流畅度更低，而这反而会形成更强的记忆痕迹和更深入的理解。Soderstrom & Bjork（2015）对学习和表现作出了关键区分。表现是你此刻能够做到的事情——它在当下是可见且可测量的。学习则是知识或技能发生的长期变化——它在课堂期间不可见，只有之后才能测量。理想困难会降低表现（学生在课堂上答错得更多），但会增强学习（学生在数周后记得更多，迁移能力也更强）。这一​区分至关重要，因为教师以及 AI 系统往往倾向于优化表现（让学生现在就取得成功），而不是优化学习（让学生之后仍能记住并进行迁移）。

## 输入架构

教师必须提供：
- **目标概念：** 学生需要学习什么。*例如：“标准差的概念——不仅要会计算，还要理解它的含义以及何时使用” / “第一次世界大战的起因——不仅要列出原因，还要理解这些原因如何相互作用并导致战争” / “说服性写作技巧——不仅要说出技巧名称，还要能针对特定受众和目的选择恰当的技巧”*
- **当前方法：** 目前如何教授该内容。*例如：“我讲解公式，带着学生做例题，然后布置练习题。学生会计算标准差，但不理解它告诉我们数据的什么信息” / “我提供时间线并解释每个原因。学生在考试中能列出原因，但无法解释它们如何相互联系” / “我逐一讲解技巧并配以示例。学生能识别技巧，但难以独立运用”*

可选项（如果可用，由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **可用时间：** 可用于课程的时间
- **先备知识：** 学生已经掌握的知识
- **风险承受度：** 教师对学生经历困难的接受程度

## 提示词

```
You are an expert in productive failure and desirable difficulties, with deep knowledge of Kapur's (2008, 2016) productive failure framework, Bjork's (1994) desirable difficulties research, Bjork & Bjork's (2011) applied desirable difficulties, and Soderstrom & Bjork's (2015) distinction between learning and performance. You understand the core paradox: making learning HARDER (in the right way) makes it BETTER — but it feels worse for both students and teachers. You also understand the specific risk that AI tools pose to desirable difficulties: by making tasks easier and providing immediate support, AI can remove the productive struggle that drives deep learning.

CRITICAL PRINCIPLES:
- **Generation before instruction.** The productive failure sequence MUST start with students attempting the task BEFORE receiving instruction. This is non-negotiable. The generation phase activates prior knowledge, reveals gaps, and creates the conditions for meaningful consolidation. If you teach first, you lose the generative benefit.
- **Failure must be PRODUCTIVE, not UNPRODUCTIVE.** Kapur (2016) distinguishes four conditions: productive failure (struggle → learning), unproductive failure (struggle → no learning), productive success (succeed → learning), and unproductive success (succeed → no learning). Productive failure requires: (a) the task is challenging but not impossible, (b) students have enough prior knowledge to generate partial solutions, (c) the consolidation phase explicitly connects student-generated ideas to the canonical solution, and (d) the classroom culture supports struggle without shame.
- **Design the consolidation phase as carefully as the generation phase.** Many teachers try productive failure and conclude "it didn't work" because they skip or rush the consolidation. The consolidation is where learning happens: the teacher explicitly compares the students' generated approaches with the correct approach, highlights what was right, what was wrong, and WHY the canonical approach works. Without this, students just experienced confusion.
- **Desirable difficulties feel undesirable.** Students will report that they "didn't learn anything" during the generation phase. They will rate the lesson lower on satisfaction surveys. They will perform worse on immediate post-tests. This is EXPECTED. The benefits appear later — on delayed tests, transfer tasks, and conceptual understanding measures. Warn teachers about this.
- **AI-enabled cognitive offloading is the enemy of desirable difficulty.** If students can ask an AI for the answer during the generation phase, the productive failure is destroyed. The design must include explicit guidance on when and how AI tools should be restricted to preserve the learning benefit.

Your task is to redesign this teaching sequence for productive failure:

**Target concept:** {{target_concept}}
**Current approach:** {{current_approach}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the content.
**Time available:** {{time_available}} — if not provided, design for a double lesson (approximately 90 minutes).
**Prerequisite knowledge:** {{prerequisite_knowledge}} — if not provided, identify the likely prerequisites based on the target concept.
**Risk tolerance:** {{risk_tolerance}} — if not provided, design for a teacher who is willing to try but nervous about student frustration.

Return your output in this exact format:

## Productive Failure Sequence: [Target Concept]

**Target concept:** [What students need to learn]
**Current approach:** [How it's currently taught]
**Redesigned approach:** [One-sentence summary of the productive failure version]

### Phase 1: Generation (Productive Failure)

[The task students will attempt BEFORE instruction. Include the specific problem, the expected student responses (both correct and incorrect approaches they are likely to generate), and the teacher's role during this phase (circulating, NOT helping, noting student approaches for use in Phase 2).]

**The task:**
[Exact task students receive]

**Expected student responses:**
[What students will likely try — including the specific partial solutions and incorrect approaches]

**Teacher role during generation:**
[What the teacher does — observe, collect approaches, resist the urge to help]

### Phase 2: Consolidation

[How the teacher transitions from generation to instruction. This must explicitly connect student-generated approaches to the canonical solution. Include the specific comparisons the teacher should make and the key insights that emerge from the comparison.]

### Desirable Difficulties Embedded

[List each desirable difficulty in the sequence and explain why it enhances learning]

| Difficulty | What It Does | Why It Helps |
|---|---|---|
| [Difficulty] | [Mechanism] | [Learning benefit] |

### Failure Safeguards

[How to ensure failure is PRODUCTIVE — the conditions that must be in place and what to do if students become frustrated or disengaged]

### Cognitive Offloading Risks

[How AI tools might undermine the desirable difficulties and specific recommendations for managing this]

### Teacher Preparation Notes

[What the teacher needs to know and do before attempting this sequence — including how to manage student frustration and their own discomfort with watching students struggle]

**Self-check before returning output:** Verify that (a) generation comes before instruction, (b) the task is challenging but not impossible, (c) the consolidation explicitly connects student approaches to the canonical solution, (d) desirable difficulties are identified and justified, and (e) cognitive offloading risks are addressed.
```

## 示例输出

**场景：** *目标概念：“标准差的概念——不仅是计算标准差，还要理解它的含义（衡量离散程度/变异性）以及何时使用它（比较一致性、识别异常值、进行预测）” / 当前做法：“我讲解公式，在黑板上演示两个例题，然后布置 10 道练习题。学生能够将标准差计算到小数点后两位，但当被问到‘这个标准差告诉你有关这些数据的什么信息？’时，他们无法回答。他们把标准差当作一个操作步骤，而不是一个概念” / 学生水平：“Year 10，GCSE Higher tier，熟悉平均数和极差” / 学科领域：“数学——统计” / 可用时间：“一节 60 分钟的课”*

---

## 生成性失败流程：标准差

**目标概念：** 理解标准差的含义，即数据相对于平均数的离散程度，以及何时使用标准差，即比较变异性，而不只是计算出一个数值  
**当前做法：** 讲解公式 → 演示例题 → 练习题（培养了程序性熟练度，却没有形成概念性理解）  
**重新设计的做法：** 在学习标准差公式之前，先让学生尝试根据数据自行创造一种“离散程度”指标——生成并比较他们自己的方法，有助于建立直接讲授所无法达到的概念性理解

### 阶段 1：生成（生成性失败）

**时长：** 20-25 分钟

**任务：**

*将以下内容写在黑板上，或制作成讲义：*

> **足球经理的问题**
>
> 你是一名足球经理，需要在两名前锋之间做出选择。在过去 10 场比赛中，两人的场均进球数都是 1.5 个。但他们逐场比赛的记录却大不相同：
>
> **球员 A：** 2, 1, 2, 1, 2, 1, 2, 1, 2, 1
> **球员 B：** 5, 0, 0, 4, 0, 0, 6, 0, 0, 0
>
> 两人的场均进球数都是 1.5 个。但他们显然是非常不同的球员。
>
> **你们的挑战（两人一组）：**
> 1. 这些球员在哪些方面不同？用文字描述这种差异。
> 2. 创造一个能够体现这种差异的数值。对于得分更分散的球员，这个数值应该更大；对于表现更稳定的球员，这个数值应该更小。你们可以使用任何想用的数学运算。
> 3. 在两名球员的数据上检验你们的数值。它是否正确体现出球员 B 的得分比分球员 A 更“分散”？
> 4. 如果有时间：你们创造的数值是否适用于任意两组数据，而不仅仅是这两组数据？

**预期的学生回答：**

学生会提出多种方法，其中大多数方法都部分正确：

- **极差法（最常见）：** 球员 A 的极差 = 2 - 1 = 1。球员 B 的极差 = 6 - 0 = 6。这种方法有效，但不够稳健——它只使用了两个数据点，忽略了中间的所有数据。大约 60-70% 的小组会首先尝试这种方法。

- **“与平均数的距离”法（不太常见，但很有潜力）：** 一些学生会计算每个得分与平均数（1.5）相差多远，并尝试将这些距离合并起来。他们很可能会把这些距离相加，从而得到两名球员各自不同的总距离。这已经接近标准差的概念基础。大约 20-30% 的小组会采用这种方法。

- **“数零或数极端值”的方法：** 一些学生会尝试非数学的方法——数一名球员得分为 0 的次数，或数他们有多少场“高分”比赛。这种方法抓住了直觉，但不具备普适性。约占 10-20%。

- **卡住/困惑：** 一些小组会难以从文字描述（“球员 B 更不稳定”）转向数值度量。这是预料之中的。教师不应该提供帮助——这种挣扎正是重点。

**学生不会提出的内容：**
- 对偏差进行平方（标准差中的关键创新）。学生很可能会将原始偏差相加或取平均，这会产生一个有用的数字，但存在数学上的局限：如果不取绝对值或进行平方，正偏差和负偏差会相互抵消。

**生成阶段的教师角色：**

- **巡视并观察。** 不要讲解。不要暗示。不要纠正。你的任务是收集学生的方法，以便在第 2 阶段使用。
- **记录每个小组使用了哪些方法。** 你需要准备 3-4 种具有对比性的方法用于总结。
- **如果学生在 10 分钟后仍然卡住：** 你可以提供一个提示：“如果你先找出每个得分与平均值相差多远，会怎么样？”这个提示可以引导学生，但不会直接给出答案。
- **如果学生感到沮丧：** 承认这项任务的难度。“这确实很难。数学家们花了几个世纪来讨论这个问题。你们不需要得出‘正确’答案——我想看到的是你们的思考过程。”
- **控制时间。** 生成阶段应持续 20-25 分钟。即使学生还没有完成，也要停止。生成过程不完整没有关系——总结阶段会基于他们已经产出的内容继续展开。

### 第 2 阶段：总结

**时长：** 30-35 分钟

**步骤 1：分享并比较（10 分钟）。** 选择 3 种学生的方法（理想情况下包括：极差、与平均值的距离，以及另一种方法）。将每种方法写在黑板上。对于每种方法，询问全班：“这个数字是否正确地表示出球员 B 的数据分布更分散？这种方法的优点和缺点是什么？”引导讨论指向以下关键局限：

- 极差：简单，但只使用了两个数据点。单个离群值会完全扭曲结果。
- 与平均值的距离之和：更好，但如果有更多数据点呢？仅仅因为数据更多，总和就会变大。你需要对这些距离取平均值。
- 与平均值的平均距离：很好！但这里存在一个问题：有些距离为正，有些距离为负，它们会相互抵消。（进行演示：对于球员 A，与 1.5 的偏差为 +0.5、-0.5、+0.5、-0.5……它们的总和为零。）

**步骤 2：介绍规范解法（10 分钟）。**“数学家们是这样解决抵消问题的：他们将每个偏差进行平方（使所有结果都变成正数），对这些平方值取平均，然后再开平方，以回到原来的单位。这被称为标准差。”使用球员 A 和球员 B 的数据讲解公式，并明确将每一步与学生生成的方法联系起来：“看到这一步了吗？这正是第 2 组所做的——找出与平均值的距离。唯一新增的步骤就是进行平方。”

**步骤 3：联系回最初的问题（10 分钟）。** 计算两名球员的 SD。球员 A：SD ≈ 0.5。球员 B：SD ≈ 2.3。“球员 B 的标准差大约是球员 A 的 4.5 倍。这对足球经理来说意味着什么？”推动学生进行解释：SD 不只是一个数字——它告诉你一名球员有多么**可预测**。“如果你每周都需要一名稳定的得分手，就选择球员 A。如果你急需一名能够决定比赛胜负的球员，并且能够承受几场没有进球的比赛，那么球员 B 也许值得冒险。”

**步骤 4：快速练习，重点关注理解（5 分钟）。** 再给出一组数据。要求学生 (a) 计算 SD，以及 (b) 结合情境解释它意味着什么。解释的能力才是评估目标，而不是计算本身。

### 内置的适度困难

| 困难 | 作用 | 为什么有帮助 |
|---|---|---|
| **生成**（在讲解前尝试） | 迫使学生调动已有知识，并努力解决如何衡量离散程度的问题 | 制造“知识空缺”，让公式在介绍时变得有意义——学生能够理解每一步**为什么**存在 |
| **富有成效的失败**（学生未能得出正确答案） | 制造认知冲突——学生会看到自己的方法存在局限 | 学生亲身经历了标准解法所要解决的问题，因此学习规范解法的动机会更强 |
| **交错练习**（在同一任务中从语言表述 → 数值计算 → 解释） | 学生必须在同一概念的不同表征之间转换 | 建立灵活的理解，而不是僵化的程序性知识 |
| **延迟讲解**（在努力尝试后教学，而不是之前） | 防止学生只是在不理解的情况下照着步骤操作 | 公式被作为学生亲身经历过的问题的**解决方案**引入，而不是一个任意规定的步骤配方 |

### 失败防护措施

**条件 1：任务必须具有挑战性，但不能不可能完成。** “足球经理”问题经过了精心调整：10 年级学生能够计算平均数和极差，也能够用语言描述离散程度。他们拥有足够的先备知识，可以生成部分解决方案。如果学生连平均数都不会计算，这个任务就太难了——他们经历的将是**无效的失败**。

**条件 2：课堂文化必须支持努力尝试。** 在生成阶段之前，明确说：“我马上要给你们一个问题，你们**不需要**期望完美地解决它。努力解决的过程**就是重点**。我想看到的是你们的思考，而不是正确答案。”这样可以使失败正常化，并减少焦虑。

**条件 3：监测挫败感。** 如果 10 分钟后，超过一半的班级看起来陷入困境并感到挫败，就提供唯一的支架：“如果你先找出每个得分与平均数相差多少，会怎么样？”这样可以防止失败变得无效。如果挫败感在 15 分钟时仍未缓解，就提前开始第 2 阶段——此时你已经有足够多的学生解题方法可以利用。

**条件 4：巩固环节必须充分。** 如果时间不够，就删减练习题（步骤 4），**绝不能**删减巩固环节（步骤 1-3）。没有巩固环节的富有成效的失败过程，只会变成一堂令人困惑的课。

### 认知外包风险

**风险 1：学生会用 Google 搜索“如何衡量离散程度”。** 如果学生可以上网，他们会在 30 秒内找到“标准差”，从而绕过整个生成阶段。**应对措施：** 这是一项不使用设备的任务。可以使用计算器，但不能使用手机和笔记本电脑。解释原因：“我需要你们自己想出办法——这正是这项任务的全部意义。”

**风险 2：学生会向 AI 聊天机器人寻求帮助。** 在可以使用 AI 工具的学校里，学生可能会输入“如何衡量数据的离散程度？”然后得到关于标准差的清晰解释。**应对措施：** 明确说明第一阶段不得使用 AI 工具。用积极的方式来表述：“你们正在做一件 AI 做不到的事——发明自己的数学方法。AI 已经知道公式了。你们现在不需要公式——你们需要的是思考。”

**风险 3：高成就学生会绕过探索过程。** 有些学生可能已经知道标准差，或者会在教材中找到答案。**应对措施：** 这项任务要求学生发明一种衡量方法，而不是找到一种现成方法。如果学生说“这不就是标准差吗？”请回答：“也许是。但你能解释标准差为什么有效吗？为什么要将偏差平方，而不是取绝对值？这才是我希望你们想明白的。”

### 教师准备说明

**预期会出现不适感。** 看着学生在没有帮助的情况下苦苦思索，是教师最难做的事情之一。你会产生想要解释、给提示、出手解围的冲动。要克制住。探索过程中的困难本身就是产出，而不是需要解决的问题。Kapur 的研究表明，在生成阶段经历最多困难的学生，往往会在巩固阶段学到最多。

**预期学生会抱怨。** 学生可能会说“你为什么不直接教我们公式？”或者“这太让人困惑了。”这是正常现象，并不意味着课程失败。Soderstrom & Bjork (2015) 证明，学生对学习的主观感受并不能很好地预测实际学习效果——他们觉得自己从清晰的讲解中学到的更多，但实际上，他们从生产性失败中记住并迁移的内容更多。

**提前准备好巩固阶段。** 明确你希望看到哪些学生方法（极差、与均值的距离、其他方法）。准备好标准差的计算过程，以便与学生的方法并列展示。巩固阶段不能临时发挥——它需要经过仔细规划。

**准备备用方案。** 如果生成阶段只产生了一种方法（所有人都使用极差），请调整巩固阶段：“你们大多数人都尝试了极差。这是一个好的开始。让我给你们展示另一个班级中一组学生尝试的方法……”然后由你自己介绍基于与均值距离的方法。

---

## 已知局限

1. **生产性失败并不适用于所有内容。** 它最适合用于概念理解——理解某件事为什么有效，而不仅仅是如何去做。对于纯粹的程序性技能（长除法、配平化学方程式），直接教学后进行练习通常更高效。当当前方法能够带来程序流畅性，却无法带来概念理解时，生产性失败的价值最大。

2. **与其他领域相比，数学和科学方面的证据更为充分。** Kapur（2008，2016）的研究主要在数学课堂中开展。先生成、后教学这一原则也在其他领域得到过研究，但具体的生产性失败设计（尝试 → 失败 → 巩固）在 STEM 之外的证据较少。其底层机制（生成有助于学习）具有跨领域的普适性，但具体的任务设计可能需要进行调整。

3. **教师能力是一个硬约束。** 巩固阶段需要一名经验丰富的教师，能够实时地将学生生成的方法与标准解法联系起来。这比讲授一堂准备好的课程难得多。首次尝试生产性失败的教师，应从自己非常熟悉的主题开始。

4. **表现与学习之间的区别带来了评估问题。** 处于生产性失败条件下的学生，在即时后测中的表现更差，但在延迟测试和迁移测试中的表现更好（Soderstrom & Bjork, 2015）。如果教师在课程结束后立即评估学习效果，生产性失败看起来就像是失败了。真正的益处只有在几天或几周后才会显现。