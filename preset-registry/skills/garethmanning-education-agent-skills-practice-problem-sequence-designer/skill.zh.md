---
# AGENT SKILLS STANDARD FIELDS (v2)
name: practice-problem-sequence-designer
description: "Generate a scaffolded sequence of practice problems with graduated difficulty and strategic variability. Use when creating worksheets, homework sets, or independent practice materials."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "explicit-instruction/practice-problem-sequence-designer"
skill_name: "Practice Problem Sequence Designer"
domain: "explicit-instruction"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Rosenshine (2012) — Principles of Instruction, Principles 5 & 8: guide student practice, provide scaffolds"
  - "Rohrer (2009) — The effects of spacing and mixing practice problems"
  - "Sweller et al. (2019) — Cognitive load theory: variability and worked example effects"
  - "Atkinson et al. (2000) — Learning from examples: varied practice promotes transfer"
  - "Bjork & Bjork (2011) — Making things hard on yourself, but in a good way: desirable difficulties"
input_schema:
  required:
    - field: "skill_to_practise"
      type: "string"
      description: "The specific skill students are practising"
    - field: "student_level"
      type: "string"
      description: "Age/year group and current competence level"
    - field: "problem_count"
      type: "integer"
      description: "Number of practice problems to generate"
  optional:
    - field: "common_errors"
      type: "array"
      description: "Known errors to design problems around"
    - field: "prior_examples"
      type: "string"
      description: "The worked example or model students have already seen"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: ability range, specific needs"
    - field: "assessment_format"
      type: "string"
      description: "How students will be assessed — informs problem format variation"
output_schema:
  type: "object"
  fields:
    - field: "problem_sequence"
      type: "array"
      description: "Ordered sequence of problems with difficulty progression and design rationale"
    - field: "scaffold_reduction_plan"
      type: "string"
      description: "How scaffolding is reduced across the sequence"
    - field: "differentiation_options"
      type: "object"
      description: "Support and extension modifications"
    - field: "monitoring_guide"
      type: "string"
      description: "What to look for as students work and when to intervene"
chains_well_with:
  - "explicit-instruction-sequence-builder"
  - "worked-example-fading-designer"
  - "interleaving-unit-planner"
  - "cognitive-load-analyser"
teacher_time: "4 minutes"
tags: ["practice", "problem-design", "scaffolding", "variability", "desirable-difficulty"]
---
# 练习题序列设计器

## 此技能的作用

设计一组按序排列的练习题，遵循难度分布、逐步减少支架以及表层特征变化的原则——将学生从近迁移（与所教示例非常相似的问题）逐步带向远迁移（问题表面上看起来不同，但要求相同的底层技能）。输出包括题目、每道题的设计依据、支架减少说明，以及供教师使用的监测指南。AI 在此特别有价值，因为有效的练习序列需要对难度、表层特征和支架程度进行有意调整——大多数教师设计的练习集要么是随机排序的（没有递进），要么难度始终一致（没有变化），这两种情况都会削弱学习效果。

## 证据基础

Rosenshine（2012）将指导性练习和独立练习确定为第 5 条和第 8 条原则，强调练习必须提供支架（从教师支持开始，并逐步减少支持），并且学生在移除支架之前应达到较高的成功率（80% 以上）。Rohrer（2009）证明，混合不同类型的练习题（交错练习），并将练习分散到多个学习时段，相比集中、成组的练习，能显著提升保持效果。Sweller 等人（2019）提出了变异效应——通过变化多样的题型进行练习能够促进图式抽象和迁移，而练习完全相同的问题则会促进僵化、受情境限制的知识。Atkinson 等人（2000）表明，表层特征的变化（在保持底层结构不变的同时，改变情境、数字或呈现方式）对迁移至关重要——如果学生只练习外观上与教学示例相同的问题，那么当问题看起来不同时，他们就会失败。Bjork 与 Bjork（2011）将其描述为“合意困难”——由于问题多样化，感觉更困难的练习，比由于问题完全相同而感觉轻松的练习，能带来更好的长期学习效果。

## 输入模式

教师必须提供：
- **要练习的技能：** 具体技能。*例如：“解未知数在等式两边的一元一次方程”/“使用 PEEL 结构写一段话”/“绘制并解读箱线图”*
- **学生水平：** 年级和当前水平。*例如：“九年级，刚刚看过两个完整示例——对这项具体技能来说还是新手”*
- **题目数量：** 需要多少道题。*例如：10*

可选（如果可用，则由上下文引擎注入）：
- **常见错误：** 已知的错误，可围绕这些错误设计题目
- **先前示例：** 已经展示过的完整示例或范例
- **学生概况：** 能力范围、具体需求
- **评估形式：** 学生将接受评估的方式

## 提示词

```text
You are an expert in practice design and instructional sequencing, with deep knowledge of Rosenshine's (2012) practice principles, Rohrer's (2009) research on practice spacing and mixing, Sweller et al.'s (2019) variability effect, and Bjork & Bjork's (2011) concept of desirable difficulties. You understand that the sequence and structure of practice problems affects learning as much as the number of problems.

Your task is to design a practice problem sequence for:

**Skill:** {{skill_to_practise}}
**Student level:** {{student_level}}
**Number of problems:** {{problem_count}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Common errors:** {{common_errors}} — if not provided, identify the 2–3 most common errors for this skill and include problems specifically designed to surface them.
**Prior examples:** {{prior_examples}} — if not provided, assume students have seen a standard worked example and design the first 2 problems to closely match it.
**Student profiles:** {{student_profiles}} — if not provided, design for a mixed-ability class and include differentiation notes.
**Assessment format:** {{assessment_format}} — if not provided, include at least one problem in the format students are likely to encounter in assessments.

Apply these evidence-based principles:

1. **Near-to-far transfer progression (Atkinson et al., 2000):**
   - Problems 1–2: Nearly identical to the worked example (same structure, similar numbers, same context). Success rate should be 90%+. These build confidence and confirm basic understanding.
   - Problems 3–5: Same underlying skill, different surface features (different context, different numbers, different presentation). The student must recognise the same skill in a new wrapper.
   - Problems 6–8: Increased difficulty — additional steps, missing information to infer, or combining this skill with a previously learned skill.
   - Problems 9+: Far transfer — the problem looks substantially different from the worked example but requires the same underlying skill, possibly embedded in a larger problem or applied to a novel context.

2. **Surface feature variation (Sweller et al., 2019):**
   - Vary the context, numbers, format, and presentation while keeping the underlying structure constant.
   - If the worked example used a word problem about buying apples, practice problems should include different contexts (temperature, distance, money) — students who only practise apple problems can't solve temperature problems because they've learned "the apple procedure," not the underlying mathematics.

3. **Scaffold reduction (Rosenshine, 2012):**
   - Early problems may include partial scaffolds: a hint, a first step, or a reminder of the formula.
   - Middle problems remove these scaffolds.
   - Later problems require students to determine the method independently.

4. **Error-targeting problems:**
   - Include at least 2 problems specifically designed to surface common errors.
   - If students commonly confuse operation X with operation Y, include a problem where the wrong operation gives a plausible-looking answer — forcing students to think carefully about which approach is correct.

5. **One "twist" problem:**
   - Include at least one problem that looks like it requires this skill but actually doesn't — or that requires the student to explain why the skill doesn't apply. This tests whether students are thinking or just applying a procedure mechanically.

Return your output in this exact format:

## Practice Problem Sequence: [Skill]

**For:** [Student level]
**Total problems:** [Count]
**Scaffold reduction:** [Brief overview of how scaffolding reduces across the sequence]

### Problem Sequence

For each problem:
- **Problem [N]:** [The problem text]
- **Design intent:** [Why this problem is at this position — what it tests that previous problems didn't]
- **Difficulty level:** [Near transfer / Developing / Far transfer]
- **Common error to watch for:** [If applicable]

### Scaffold Reduction Plan

[How scaffolding decreases across the sequence — what support is provided early and removed later]

### Differentiation

**Support:** [How to modify for students who struggle — which problems to prioritise, what scaffolds to add back]
**Extension:** [How to challenge students who finish quickly — which problems to add]

### Monitoring Guide

[What the teacher should look for while students work: which problems are diagnostic, what errors signal which misunderstanding, when to intervene vs. let students struggle]

**Self-check before returning output:** Verify that (a) problems progress from near to far transfer, (b) surface features vary across the sequence, (c) at least 2 problems target common errors, (d) scaffolding decreases progressively, (e) one problem tests whether students can discriminate when the skill does/doesn't apply, and (f) the first 2 problems are accessible enough for 90%+ success rate.
```

## 示例输出

**情境：** *技能：“计算百分比增加和减少” / 学生水平：“九年级，刚刚看过‘求 £240 的 15%，并将其加到原数上’这一示例题” / 题目数量：10 / 常见错误：["求出百分比后忘记加上/减去它", "不是计算原数的百分比，而是计算新数的百分比"]*

---

## 百分比增加和减少练习题序列

**适用对象：** 九年级数学  
**题目总数：** 10  
**支架减少：** 第 1–2 题包含方法提示。第 3–5 题去除提示。第 6–8 题要求选择方法。第 9–10 题将技能融入不熟悉的情境中。

### 题目序列

**题目 1：** 一件夹克售价为 £80。价格上涨了 10%。新价格是多少？
*提示：先求出 £80 的 10%，然后将其加到 £80 上。*
- **设计意图：** 与示例题几乎完全相同。结构相同（百分比增加），数字容易计算（整十数的 10%），并提供提示。用于确认基本理解。
- **难度级别：** 近迁移
- **预期答案：** £88

**题目 2：** 一台笔记本电脑售价为 £450。促销期间价格降低了 20%。促销价是多少？
*提示：先求出 £450 的 20%，然后从 £450 中减去它。*
- **设计意图：** 引入百分比减少（减法而不是加法），但提供了提示。考查学生是否能够应用相反的运算。数字仍然较容易计算。
- **难度级别：** 近迁移
- **需要注意的常见错误：** 学生将减少误当成增加（得出 £540）——他们没有读清题目，而是自动套用了增加的方法。

**题目 3：** 健身房会员费为每月 £35。健身房宣布价格上涨 12%。新的月费是多少？
- **设计意图：** 不提供提示。百分比不是整十数（12%）。基数较小。考查学生能否在没有支架的情况下完成计算，并处理不太方便的百分比。
- **难度级别：** 发展阶段
- **预期答案：** £39.20

**题目 4：** 一栋房屋以 £185,000 的价格购入。其价值下降了 7%。现在它值多少钱？
- **设计意图：** 数字更大（考查学生是否能够处理 £185,000 而不感到慌乱）、涉及百分比减少，并且改变了现实情境（从购物转为房产）。底层技能保持不变。
- **难度级别：** 发展阶段
- **需要注意的常见错误：** 学生求出 7%（£12,950）后就将其作为答案——忘记从原数中减去它。

**题目 5：** 一所学校有 840 名学生。预计明年学生人数将增加 5%。届时会有多少名学生？
- **设计意图：** 改变情境（对象从金钱变为人数）。答案必须是整数（不可能有 0.5 名学生）——考查学生是否能够结合情境理解答案。
- **难度级别：** 发展阶段
- **预期答案：** 882（840 × 0.05 = 42；840 + 42 = 882）

**题目 6：** 一辆汽车年初的价值为 £12,500。到年底时，它的价值为 £11,250。价值减少了百分之多少？
- **设计意图：** 反向问题——未知量是百分比。学生必须反向计算：先求差值（£1,250），然后计算 £1,250 占 £12,500 的百分比。考查对两者关系的深入理解，而不仅仅是正向应用。
- **难度级别：** 远迁移
- **需要注意的常见错误：** 学生将 £1,250 作为 £11,250（新数）的百分比，而不是作为 £12,500（原数）的百分比来计算——这是前面列出的常见错误之一。
- **预期答案：** 10%

**题目 7：** 一件衬衫广告写着“打 30% 折扣！现在只要 £28。”原价是多少？
- **设计意图：** 另一个逆向问题——这次是根据折后价格求原价。学生必须认识到 £28 是原价的 70%，而不是 100%。这道题明显更难，因为需要进行比例推理。
- **难度级别：** 远迁移
- **预期答案：** £40（£28 ÷ 0.7 = £40）

**题目 8：** 一个城镇的人口增加了 15%，达到 9,200 人。增加之前的人口是多少？
- **设计意图：** 与题目 7 的结构相同（已知变化后的数值和百分比变化，求原始数值），但这里是增加而不是减少，并且更换了情境。考查学生能否将逆向方法迁移到增加和减少两种情况中。
- **难度级别：** 远迁移
- **预期答案：** 8,000（9,200 ÷ 1.15 = 8,000）

**题目 9：** 一家商店先将价格提高 20%，然后进行“打 20% 折扣”的促销。一位顾客说：“提高 20% 和降低 20% 会相互抵消，所以价格会恢复正常。”他们说得对吗？请使用一个具体例子解释你的答案。
- **设计意图：** 这是一道“ twist ”题。答案是“不对”——先提高 20%，再降低 20%，并不会回到原价（例如，£100 → £120 → £96）。这道题揭示了学生对百分比的一个深层误解，并要求他们进行解释，而不只是计算。
- **难度级别：** 远迁移 / 批判性思维
- **预期答案：** 不对。例子：£100 + 20% = £120。£120 - 20% = £96，而不是 £100。20% 的降价是基于较高的金额计算的。

**题目 10：** 一项投资每年增长 5%。如果你投资 £1,000，3 年后它的价值是多少？
- **设计意图：** 复合百分比增长——每年的百分比是应用于新的总额，而不是原始金额。这将该技能扩展到一个新的领域（复合增长），并为未来的主题作预览。如果不是所有学生都能完成这道题，也没有关系——这属于拓展内容。
- **难度级别：** 远迁移 / 拓展
- **预期答案：** £1,157.63（£1,000 × 1.05³）

### 逐步减少支架计划

| 题目 | 支架级别 |
|----------|---------------|
| 1–2 | 提供方法提示（“先求 Y 的 X%，然后加上/减去”） |
| 3–5 | 不提供提示。学生必须独立回忆并应用方法 |
| 6–8 | 逆向问题。学生必须确定解题方法（从新数值反向推算原始数值）。不提供解题思路指导 |
| 9–10 | 概念推理和拓展。学生必须解释、论证，或将该技能扩展到新的领域 |

### 分层教学

**支持（针对在题目 1–3 中遇到困难的学生）：**
- 提供方法卡：“步骤 1：求出百分比。步骤 2：增加（增长）时相加，减少（下降）时相减。”
- 只完成题目 1–5。题目 6 及以后要求学生能够熟练地正向应用方法后，再尝试逆向问题。
- 为题目 6（逆向百分比）配合一个已完成的示例——使用 Worked Example Fading Designer 逐步衔接。

**拓展（针对完成全部 10 道题的学生）：**
- 题目 11：“一个价格先上涨 25%，然后下降 20%。最终价格比原价高、低，还是相同？请用代数方法证明。”
- 题目 12：“一项年复利率为 5% 的投资需要多少年才能翻倍？先进行估算，然后计算。”

### 监测指南

- **问题 1–2：** 这些问题应在 2–3 分钟内完成。如果学生在这里卡住，说明他们还没有掌握基本方法——应立即使用示范例题进行快速重新讲解。
- **问题 4：** 在这里检查答案。如果学生写出 £12,950（百分比金额，而不是新数值），说明他们理解计算过程，但忘记了最后一步。这属于程序性提醒，无需重新讲解。
- **问题 6：** 这是诊断题。如果学生尝试除以错误的数值（例如，计算新数值相对于原数值的百分比，而不是原数值的百分比），说明他们存在常见的误解。应暂停并用针对性例题进行说明：“百分比变化总是相对于原始数值计算的。”
- **问题 9：** 如果学生说“是的，它们会相互抵消”，不要直接揭示答案。相反，应问：“用 £100 验证一下。把计算过程展示给我。”让最终得到 £96（而不是 £100）这一结果制造认知冲突。
- **一般规则：** 前 5 分钟巡视全班，检查问题 1–3。如果问题 3 的正确率达到 80% 以上，说明全班已准备好继续独立完成。如果低于 80%，暂停并解决这一知识缺口。

---

## 已知局限

1. **题目顺序假设只聚焦于一项技能。** 真实考试题通常会结合多项技能（百分比变化 + 读取图表 + 在情境中进行解读）。本题目序列旨在培养核心技能的熟练度；与其他技能的交错练习应安排在后续课程中，而不是放在这组初始练习中。后续课程可与交错练习单元规划器结合，用于混合练习。

2. **表面特征的变化可能会使尚未掌握基本程序的学生感到困惑。** 对于能力很低的学生来说，过早引入过多变化可能会让他们感到不堪重负。对于这些学生，应先安排 4–5 道近迁移题（只改变数字），然后再引入情境变化。对于能力较高的小组，可以跳过问题 1–2，从而压缩这一序列。

3. **监测指南要求教师能够有效巡视。** 设计高质量题目是必要条件，但还不够——教师必须实际观察学生的解题过程，识别错误模式，并在恰当时机进行干预。本指南有助于引导教师的注意力，但无法替代教师根据专业判断决定何时让学生继续思考、何时介入。