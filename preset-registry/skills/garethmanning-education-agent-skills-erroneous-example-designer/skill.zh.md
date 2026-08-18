---
# AGENT SKILLS STANDARD FIELDS (v2)
name: erroneous-example-designer
description: "Design deliberately flawed examples that develop error-detection skills and deepen understanding. Use when students make characteristic errors and need practice spotting mistakes."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/erroneous-example-designer"
skill_name: "Erroneous Example Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "McLaren, Adams & Mayer (2012) — Delayed learning effects with erroneous examples"
  - "McLaren, Adams, Durkin, Goguadze, Mayer & Rittle-Johnson (2015) — To err is human, to explain and correct is divine"
  - "Tsovaltzi, Melis, McLaren, Meyer, Dietrich & Goguadze (2010) — Learning from erroneous examples"
  - "Große & Renkl (2007) — Finding and fixing errors in worked examples"
  - "Siegler (2002) — Microgenetic studies of self-explanation"
input_schema:
  required:
    - field: "problem_domain"
      type: "string"
      description: "The type of problem or procedure where students make characteristic errors"
    - field: "target_errors"
      type: "string"
      description: "The specific, common errors students make — realistic misconceptions or procedural mistakes"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "correct_examples_available"
      type: "string"
      description: "Whether students have already seen correct worked examples for this problem type"
    - field: "number_of_examples"
      type: "integer"
      description: "How many erroneous examples to design"
    - field: "delivery_context"
      type: "string"
      description: "Whether delivered digitally, on paper, or discussed in class"
output_schema:
  type: "object"
  fields:
    - field: "erroneous_examples"
      type: "array"
      description: "The set of erroneous worked examples — each containing a realistic, common error at a specific step"
    - field: "error_analysis_scaffold"
      type: "object"
      description: "Prompts that guide students to find, explain, and correct each error"
    - field: "learning_mechanism"
      type: "object"
      description: "Why each erroneous example produces learning — the cognitive mechanism of error detection"
    - field: "correct_version"
      type: "object"
      description: "The corrected version of each example — for teacher reference and student self-checking"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "worked-example-fading-designer"
  - "self-explanation-prompt-designer"
  - "diagnostic-question-generator"
teacher_time: "3 minutes"
tags: ["erroneous-examples", "McLaren", "error-detection", "worked-examples", "misconceptions", "self-explanation"]
---
# 错误示例设计器

## 此技能的作用

设计包含刻意设置的、真实且符合常见情况的错误的演算示例，供学生识别、解释并纠正。这种方法产生的学习效果可媲美甚至超过正确演算示例，同时还能培养错误检测能力。McLaren 等人（2012、2015 年）的关键洞见是：错误必须是**真实且常见的**，也就是学生实际会犯的错误，而不是没人会犯的臆造错误。设计良好的错误示例能够激活自我解释（Chi 等人，1989 年）：学生必须思考这一步**为什么**是错的，这会迫使他们进行比单纯遵循正确步骤更深入的加工。输出内容包括：在特定步骤中包含真实错误的错误示例、错误分析支架（引导学生发现并纠正错误的提示语）、学习机制说明，以及修正版。AI 在这里尤其有价值，因为设计有效的错误示例需要深入了解特定题型中的常见错误模式——哪些错误是真实的，哪些错误能够产生有益的困惑，以及哪些错误会造成有害的误解。

## 证据基础

McLaren、Adams 和 Mayer（2012 年）发现，学习错误示例的学生，其保持和迁移表现显著优于学习正确示例的学生——但这种效果是**延迟出现的**（出现在一周后的测试中，而不是即时测试中）。这表明，与正确示例相比，错误示例可能产生更深入、更持久的学习，原因或许在于错误检测过程迫使学生进行更复杂的加工。McLaren 等人（2015 年）复现并扩展了这一发现，表明错误示例与自我解释提示相结合时，效果最强。Tsovaltzi 等人（2010 年）发现，当学生被要求解释错误**为什么**是错的，而不仅仅是识别错误时，错误示例尤其有效。Große 和 Renkl（2007 年）发现，当学生具备足够的先备知识来检测错误时，错误示例能够促进学习；但对于缺乏先决知识的学生，错误示例可能造成困惑（他们可能会把错误学成正确步骤）。这确立了一项关键的设计约束：错误示例应在学生已经看过正确示例**之后**使用，而不应作为首次接触材料。Siegler（2002 年）表明，让儿童解释正确策略和错误策略都能使其受益——“这种方法有效，而那种方法无效”之间的对比，比单独学习其中任何一种都更能加深理解。

## 输入模式

教师必须提供：
- **问题领域：** 问题的类型。*例如：“对不同分母的分数进行加法” / “计算百分比增长” / “使用撇号表示所有关系或缩写” / “配平化学方程式”*
- **目标错误：** 具体的常见错误。*例如：“分别将分子和分母相加：½ + ⅓ = 2/5” / “计算增长量占原数的百分比，而不是计算百分比增长：混淆‘80 的 20% 是多少？’与‘从 80 增加到 96 的百分比增长是多少？’” / “用撇号表示复数：用 apple's 代替 apples” / “配平时将系数改成下标”*

可选（如果可用，则由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程学科
- **可提供正确示例：** 学生是否已经见过正确版本
- **示例数量：** 要设计多少个示例
- **实施情境：** 数字化、纸质或课堂讨论

## 提示词

```text
You are an expert in erroneous example design for learning, with deep knowledge of McLaren et al.'s (2012, 2015) research on delayed learning effects from erroneous examples, Tsovaltzi et al.'s (2010) work on error-based learning, Große & Renkl's (2007) research on finding and fixing errors in worked examples, and Siegler's (2002) microgenetic studies of self-explanation with correct and incorrect strategies. You understand that erroneous examples are not "trick questions" — they are carefully designed learning tools where realistic, common errors are embedded at specific steps, and students learn by DETECTING, EXPLAINING, and CORRECTING the error.

CRITICAL PRINCIPLES:
- **Errors must be REALISTIC and COMMON.** The error should be one that students actually make — a genuine misconception or procedural slip, not an absurd mistake. "3 + 4 = 12" is not a realistic error. "½ + ⅓ = 2/5" IS a realistic error (adding numerators and denominators separately). Realistic errors activate recognition: "I've made this mistake" or "I can see why someone would think that."
- **One error per example.** An example with multiple errors is confusing, not instructive. Embed ONE error at ONE specific step, with all other steps correct. This isolates the learning target and makes detection feasible.
- **Students must already have seen correct examples.** Große & Renkl (2007) showed that erroneous examples confuse students who haven't seen correct versions first. Use erroneous examples AFTER correct worked examples, not instead of them. The sequence is: correct examples → erroneous examples → independent practice.
- **The error analysis scaffold is essential.** Simply showing an erroneous example is insufficient. Students need prompts: "Find the error," "Explain why it's wrong," "Correct it," "Explain why your correction is right." This scaffold forces the self-explanation that produces the learning effect.
- **Erroneous examples develop error-detection skills.** Beyond learning the specific content, students who practise with erroneous examples become better at monitoring their OWN work for errors. This metacognitive benefit is separate from and additional to the content learning.

Your task is to design erroneous examples for:

**Problem domain:** {{problem_domain}}
**Target errors:** {{target_errors}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the problem domain.
**Correct examples available:** {{correct_examples_available}} — if not provided, include a note that students should see correct examples first.
**Number of examples:** {{number_of_examples}} — if not provided, design 3 erroneous examples targeting different common errors.
**Delivery context:** {{delivery_context}} — if not provided, design for paper-based use that could be adapted for digital delivery.

Return your output in this exact format:

## Erroneous Examples: [Problem Domain]

**Problem domain:** [The type of problem]
**Target errors:** [The common errors being addressed]
**Prerequisite:** [What students must already know — correct examples must come first]

### Erroneous Example [N]

**The problem:** [The problem being solved]
**The erroneous solution:**
[Step-by-step solution with ONE deliberate error at a specific step — all other steps correct]

**The error:** [Which step is wrong and what the error is — FOR TEACHER REFERENCE ONLY, not shown to students]
**Why this error is realistic:** [Why students actually make this mistake — the underlying misconception or procedural confusion]

**Error Analysis Scaffold (for students):**
1. "Read through the solution carefully. Is every step correct?"
2. "Find the step that contains an error. Circle it."
3. "Explain WHY this step is wrong. What mistake was made?"
4. "Write the correct version of this step."
5. "Complete the problem correctly from this point."

### Correct Version (Teacher Reference)

[The fully correct solution for comparison]

### Learning Mechanism

[Why these erroneous examples produce learning — the cognitive process of error detection, explanation, and correction]

### Sequencing Guidance

[When to use these erroneous examples in a lesson — after correct examples, before independent practice]

**Self-check before returning output:** Verify that (a) each error is realistic and common, (b) there is only ONE error per example, (c) the error analysis scaffold requires explanation not just identification, (d) correct versions are provided for teacher reference, and (e) the examples are sequenced after correct worked examples.
```

## 示例输出

**场景：** *问题领域：“分母不同的分数相加——六年级数学” / 目标错误：“错误 1：分别相加分子和分母（½ + ⅓ = 2/5）。错误 2：找到公分母，却忘记调整分子（½ + ⅓ = 1/6 + 1/6 = 2/6）。错误 3：正确找到等值分数，却在相加时出现计算错误（3/6 + 2/6 = 6/6，而不是 5/6）。” / 可提供正确示例：“是——学生已经完成了分母相同的分数相加的正确示例，并见过寻找公分母的步骤”*

---

## 错误示例：分母不同的分数相加

**问题领域：** 分母不同的分数相加  
**目标错误：** 分别相加分子和分母、忘记调整分子、最后相加时出现计算错误  
**先决条件：** 学生必须已经学习过寻找公分母以及相加等值分数的正确示例。错误示例应在正确示例之后使用，以加深理解。

### 错误示例 1：“Sam 的解法”

**题目：** 计算 ½ + ⅓

**Sam 的解法：**
- 步骤 1：我需要把 ½ 和 ⅓ 相加
- 步骤 2：我把分子相加：1 + 1 = 2
- 步骤 3：我把分母相加：2 + 3 = 5
- 步骤 4：我的答案是 2/5 ✓

**错误（供教师参考）：** 步骤 2 和 3。Sam 分别相加分子和分母，把分数相加当成整数相加。这是最常见的分数错误，也反映出学生对分数本质的根本性误解——分母表示部分的大小，不能通过相加表示大小的名称，来相加大小不同的部分。

**为什么这个错误很真实：** 刚学会整数相加的学生会把同样的逻辑延伸到分数上。这个做法“看起来是对的”——就像相加两个整数一样，把上面的数相加，再把下面的数相加。这个错误非常普遍，研究持续发现，学习分数相加的学生中有 30–50% 会犯这种错误。

**错误分析支架（供学生使用）：**
1. “阅读 Sam 的解法。每一步都有道理吗？”
2. “Sam 说 ½ + ⅓ = 2/5。想一想：½ 和 0.5 一样大。2/5 比 ½ 大还是小？”（2/5 = 0.4，比单独的 ½ 还小。这是不可能的——一个正分数加上 ½，结果必定大于 ½。）
3. “哪一步出错了？圈出这一步，并解释它为什么错。”
4. “Sam 本来应该怎么做？正确解答这道题。”
5. “写一张便条给 Sam，用一种能帮助他们理解的方式解释这个错误。”

### 错误示例 2：“Priya 的解法”

**题目：** 计算 ½ + ⅓

**Priya 的解法：**
- 步骤 1：我需要找到一个公分母。2 和 3 都能整除 6。公分母是 6。
- 步骤 2：½ = 1/6（我把分母改成了 6）
- 步骤 3：⅓ = 1/6（我把分母改成了 6）
- 步骤 4：1/6 + 1/6 = 2/6
- 步骤 5：我的答案是 2/6 ✓

**错误（供教师参考）：** 步骤 2 和 3。Priya 正确找到了公分母（6），但只改变了分母，没有相应调整分子。她写成 ½ = 1/6，但 ½ = 3/6（分子和分母都乘以 3）。同样地，⅓ = 2/6（分子和分母都乘以 2）。Priya 明白需要一个公分母，但还没有理解分数必须保持等值——分数的两部分必须乘以同一个倍数。

**为什么这个错误很现实：** 学过“找公分母”的学生，有时会把它理解成只改变分母，却没有意识到分数必须保持等值。他们遵循的是操作步骤（改变分母），却没有理解其中的原则（保持等值）。这是一种只有程序性知识、缺乏概念性理解的错误。

**错误分析框架（供学生使用）：**
1. “Priya 找到了正确的公分母（6）。这是一个好的开始。但请看第 2 步。”
2. “Priya 说 ½ = 1/6。用图示或分数条表示：½ 和 1/6 一样吗？”（不一样——½ 比 1/6 大得多。）
3. “哪里出错了？当 Priya 把 ½ 转换成六分之几时，分子应该是多少？你怎么知道的？”
4. “从第 2 步开始，改正 Priya 的解答。”
5. “Priya 应该记住什么**规则**？（提示：你对分母做了什么，就必须对分子也做同样的事。）”

### 错误示例 3：“Marcus 的解法”

**题目：** 计算 ½ + ⅓

**Marcus 的解法：**
- 第 1 步：我需要一个公分母。2 和 3 都能整除 6。
- 第 2 步：½ = 3/6（分子和分母都乘以 3）✓
- 第 3 步：⅓ = 2/6（分子和分母都乘以 2）✓
- 第 4 步：3/6 + 2/6 = 6/6
- 第 5 步：6/6 = 1 个整体
- 第 6 步：我的答案是 1 ✓

**错误所在（教师参考）：** 第 4 步。Marcus 在最后相加之前都做对了：3/6 + 2/6 = 5/6，而不是 6/6。这是一个简单的算术错误（3 + 2 = 5，而不是 6），但它得出了一个看起来合理的最终答案（1 个整体），可能不会触发学生的错误检测，因为这个答案“看起来很合理”。

**为什么这个错误很现实：** 当学生成功完成了概念上较难的部分（寻找公分母、调整分子）后，他们可能会在最后一步粗心算错。由于困难的概念性工作已经完成，学生会放松检查，没有注意到这个简单的错误。此外，6/6 = 1 看起来是一个“整齐”的答案，反而会确认这个错误，而不是提醒学生发现问题。

**错误分析框架（供学生使用）：**
1. “Marcus 正确地找到了公分母，也正确地转换了两个分数。到目前为止做得很好。”
2. “仔细看第 4 步。检查这个加法：3 + 2 = ？”
3. “正确答案应该是多少？写出改正后的步骤。”
4. “Marcus 的错误很小——只是一个算术上的失误。但它完全改变了答案。这说明了什么？这告诉你检查解答有什么重要性？”

### 正确版本（教师参考）

½ + ⅓
= 3/6 + 2/6（公分母为 6；½ × 3/3 = 3/6；⅓ × 2/2 = 2/6）
= 5/6

### 学习机制

这三个错误示例分别针对操作过程中的三个不同阶段，以及三种**不同类型的错误**：

1. **示例 1（Sam）：** 一个**概念性错误**——误解分数加法的含义。它针对最根本的误解。
2. **示例 2（Priya）：** 一个**程序性与概念性之间的脱节**——遵循操作步骤，却不理解为什么分子和分母都必须改变。它针对操作步骤与理解之间的断裂。
3. **示例 3（Marcus）：** 一个**算术错误**——概念上全部正确，但在计算时粗心出错。它针对解答过程中的监控与检查。

通过呈现这三类错误，学生可以建立错误类型的分类体系：“当我进行分数加法时，我需要检查概念性错误（我加对了吗？）、程序性错误（我调整分子了吗？）以及计算错误（我把数字加对了吗？）。”

### 顺序安排指南

**课程中的位置：** 在学生已经完成以下学习后，再使用这些错误示例：
1. 通过正确的 worked examples 学习正确的步骤
2. 在指导支持下练习 2–3 道题

**引入方式：**“这里有三位学生的解答。每个人都犯了一个错误。你们的任务是找出错误，解释哪里出了问题，并改正错误。”

**后续安排：** 让学生独立练习，自行解答题目——现在他们已经具备了错误检测技能，可以检查自己的作答。

---

## 已知局限

1. **如果在正确示例之前使用，错误示例可能造成错误概念（Große & Renkl, 2007）。** 在尚未建立对正确步骤的牢固理解之前接触错误的学生，可能会无意中把错误学习为正确做法。使用顺序至关重要：先呈现正确示例，再呈现错误示例，以加深理解并培养错误检测技能。

2. **学习效果通常会延迟出现（McLaren et al., 2012）。** 学习错误示例的学生在即时测试中可能并不会超过学习正确示例的学生，但在延迟测试中（例如一周后）会表现出更好的保持和迁移能力。教师应当意识到，这种益处可能不会立即显现，也不应仅根据当天的评估就断定这种方法没有效果。

3. **错误分析支架的质量决定了学习效果。** 仅仅向学生展示一个错误并说“找出错误”，其效果远弱于提供要求学生进行解释和改正的结构化提示（Tsovaltzi et al., 2010）。上面的支架旨在迫使学生进行自我解释，但如果学生跳过解释步骤，只识别错误而不对错误原因进行推理，学习收益就会显著降低。