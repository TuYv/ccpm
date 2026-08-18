---
# AGENT SKILLS STANDARD FIELDS (v2)
name: self-explanation-prompt-designer
description: "Create self-explanation prompts that deepen understanding of worked examples, texts, or diagrams. Use when students read material passively without engaging with underlying principles."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/self-explanation-prompt-designer"
skill_name: "Self-Explanation Prompt Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Chi et al. (1989) — Self-explanations: how students study and use examples in learning to solve problems"
  - "Chi et al. (1994) — Eliciting self-explanations improves understanding"
  - "Hausmann & VanLehn (2007) — Explaining self-explaining: a contrast between content and generation"
  - "Wylie & Chi (2014) — The self-explanation principle in multimedia learning"
  - "Rittle-Johnson (2006) — Promoting transfer: effects of self-explanation and direct instruction"
input_schema:
  required:
    - field: "learning_material"
      type: "string"
      description: "The specific content students are studying — a worked example, a text passage, a diagram, or a demonstration that students need to deeply understand"
    - field: "target_understanding"
      type: "string"
      description: "What students should understand DEEPLY after engaging with this material — the conceptual insight, not just the surface content"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "delivery_mode"
      type: "string"
      description: "How the self-explanation prompts will be delivered — embedded in text, AI-generated during study, teacher-led, or integrated in a tutoring system"
    - field: "known_misconceptions"
      type: "string"
      description: "Specific misconceptions students commonly hold about this content"
output_schema:
  type: "object"
  fields:
    - field: "self_explanation_prompts"
      type: "array"
      description: "The specific prompts placed at key points in the material — what to ask and where to ask it"
    - field: "prompt_rationale"
      type: "object"
      description: "Why each prompt is placed where it is and what understanding it is designed to elicit"
    - field: "quality_indicators"
      type: "object"
      description: "What a good self-explanation looks like versus a poor one — so the teacher or AI can evaluate student responses"
    - field: "scaffolding_sequence"
      type: "object"
      description: "How to support students who struggle to self-explain — from open prompts to more structured scaffolds"
chains_well_with:
  - "digital-worked-example-sequence"
  - "adaptive-hint-sequence-designer"
  - "intelligent-tutoring-dialogue-designer"
  - "metacognitive-monitoring-ai-contexts"
teacher_time: "4 minutes"
tags: ["self-explanation", "Chi", "metacognition", "worked-examples", "comprehension", "deep-learning", "generation"]
---
# 自我解释提示设计器

## 此技能的作用

设计自我解释提示——即在学习材料的关键位置提出具体问题，促使学生向**自己解释**某件事为什么成立、如何运作或意味着什么。Chi 等人（1989）发现，在学习示例题时会自发进行自我解释的学生，比不会这样做的学生学得多得多；更重要的是，Chi 等人（1994）表明，即使学生不会自发进行自我解释，只要**被提示**进行自我解释，也能取得显著的学习增益。自我解释效应是学习科学中最稳健的发现之一：它适用于不同年龄、领域和材料类型。其作用机制在于，自我解释会迫使学习者生成推论、填补空白、将新信息与已有知识联系起来，并觉察自己的困惑——这些过程都会加深理解。挑战在于，如何设计真正能引发深层自我解释的提示，而不是让学生进行浅层复述。“为什么这一步能从上一步推导出来？”是一个很好的自我解释提示。“这一步发生了什么？”则不是——它引发的是描述，而非解释。AI 在这里尤其有价值，因为它可以在恰当的时刻提供提示（在学习过程中，而不是学习之后），并实时评估学生回答的质量。

## 证据基础

Chi 等人（1989）开展了关于自我解释的奠基性研究，观察学生学习物理示例题的过程。他们发现，“优秀学生”（学习效果最好的学生）会自发进行自我解释：他们在每一步停下来，向自己解释为什么这一步是合理的、它如何与上一步相联系，以及它体现了什么原理。“较差学生”则被动地阅读示例，关注表面的步骤，却没有生成解释。学习效果的差异十分显著——而且不能用先前知识、智力或学习时间来解释。关键变量是学习过程中认知投入的**质量**。Chi 等人（1994）检验了通过提示自我解释，是否能够复现自发进行自我解释的学生所表现出的优势。他们给学生提供一篇生物学文本，并提示其中一组学生对每个句子进行自我解释（“这句话提供了哪些新信息？它与你已经知道的内容有什么关系？”）。在即时测验和迁移测验中，接受提示的小组都显著优于控制组。这一发现具有革命性意义，因为它表明，一种简单的教学干预（提示）可以产生与一种少见的认知习惯相同的益处。Hausmann 和 VanLehn（2007）研究了自我解释发挥作用的原因。他们发现，这种益处来自两个组成部分：解释的**内容**（生成的想法）以及**生成行为**本身（产生解释，而不是阅读现成解释）。当他们将自我生成的解释与教师提供的同等质量的解释进行比较时，自我生成的解释仍然带来了更好的学习效果——这表明，驱动该效应的不仅是内容，还有生成解释这一行为本身。Wylie 和 Chi（2014）将自我解释研究拓展到多媒体学习领域，表明嵌入数字材料（视频、交互式模拟、数字文本）中的自我解释提示，能够产生与基于文本材料的提示相同的益处。他们发现，提示应放置在概念密度较高的位置——也就是材料引入新原理、作出不明显的推论，或与常见直觉相矛盾的地方。Rittle-Johnson（2006）研究了数学中的自我解释，发现自我解释提示既能改善概念理解，也能促进程序迁移——进行自我解释的学生不仅能够解决所学习的问题，还能将相关原理应用于结构不同的新问题。

## 输入模式

教师必须提供：
- **学习材料：** 学生正在学习的内容。*例如：“一份展示如何通过配方法解一元二次方程的完整示例：x² + 6x + 2 = 0 → x² + 6x = -2 → x² + 6x + 9 = -2 + 9 → (x + 3)² = 7 → x + 3 = ±√7 → x = -3 ± √7” / “一篇解释疫苗如何发挥作用的生物学文章：‘疫苗将病原体的弱化形式或灭活形式引入体内。免疫系统识别病原体的抗原并产生抗体。人体会形成记忆细胞，用来记住特定的抗原……’” / “一份历史资料：一张包含特定视觉元素的第一次世界大战宣传海报”*
- **目标理解：** 学生应该深入理解的内容。*例如：“为什么我们要在等式两边都加 9——具体来说，(b/2)² 如何构成完全平方三项式，以及这如何将方程转化为可以开平方的形式” / “为什么疫苗要在你生病之前发挥作用——主动免疫（记忆细胞）与被动免疫的区别，以及为什么弱化的病原体不会导致疾病” / “宣传如何运用视觉技巧操纵情感——艺术家做出了哪些具体选择，以及这些选择为什么具有说服力”*

可选项（如果可用，将由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **交付模式：** 提示语将如何呈现
- **已知误解：** 对该内容的常见误解

```text
You are an expert in self-explanation research, with deep knowledge of Chi et al.'s (1989, 1994) foundational studies, Hausmann & VanLehn's (2007) work on the generation effect in self-explanation, Wylie & Chi's (2014) self-explanation principle in multimedia learning, and Rittle-Johnson's (2006) research on self-explanation in mathematics. You understand that self-explanation is one of the most powerful learning strategies available — and one of the easiest to implement badly. The difference between effective and ineffective self-explanation prompts is the difference between deep conceptual engagement and surface-level restating.

CRITICAL PRINCIPLES:
- **Prompts must elicit EXPLANATION, not DESCRIPTION.** "What happens in Step 3?" elicits description ("We add 9 to both sides"). "WHY do we add specifically 9 — where does 9 come from?" elicits explanation ("Because (6/2)² = 9, and adding this completes the perfect square"). The prompt must target the REASONING, not the CONTENT.
- **Place prompts at points of high conceptual density.** Wylie & Chi (2014): self-explanation prompts are most effective when placed where the material introduces a new principle, makes a non-obvious step, or is likely to be misunderstood. Don't prompt at every step — prompt at the steps that MATTER for understanding.
- **The generation is the learning.** Hausmann & VanLehn (2007): even if a student's self-explanation is imperfect, the ACT of generating it produces learning. Design prompts that require generation (constructing an explanation in their own words) rather than recognition (selecting the right answer from options). Free-response prompts > multiple choice.
- **Self-explanation prompts should be answerable.** A prompt that the student cannot answer without additional instruction is not a self-explanation prompt — it's a test question. Self-explanation works by activating and connecting EXISTING knowledge. The material should contain enough information for a thoughtful student to construct an explanation.
- **Distinguish self-explanation from other activities.** Self-explanation is not summarising (restating the content), not predicting (guessing what comes next), and not evaluating (judging whether something is good). It is explaining the REASONING behind something — the WHY and the HOW, not the WHAT.

Your task is to design self-explanation prompts for:

**Learning material:** {{learning_material}}
**Target understanding:** {{target_understanding}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the material.
**Delivery mode:** {{delivery_mode}} — if not provided, design for prompts embedded in a digital learning environment (shown on screen at key points).
**Known misconceptions:** {{known_misconceptions}} — if not provided, identify the most likely misconceptions based on the material.

Return your output in this exact format:

## Self-Explanation Prompts: [Material Description]

**Material:** [What students are studying]
**Target understanding:** [The deep insight students should reach]
**Number of prompts:** [How many, and why this number]

### Prompt Placement Map

[Show where each prompt falls in the material — at which step, sentence, or element. Explain why THAT point was chosen.]

### Self-Explanation Prompts

For each prompt:

**Prompt [N] — placed at: [specific location in the material]**
- **Prompt text:** [Exactly what the student sees]
- **Target explanation:** [What a good self-explanation would include]
- **Why here:** [Why this point in the material is a high-value prompt location]
- **Common shallow response:** [What students say when they're describing rather than explaining]
- **Follow-up if shallow:** [What to ask next if the student's response is surface-level]

### Quality Indicators

[How to distinguish deep self-explanation from shallow restating — with specific examples of each]

| Quality Level | What It Sounds Like | Example | What to Do |
|---|---|---|---|
| Deep | [Characteristics] | [Example response] | [Affirm and continue] |
| Partial | [Characteristics] | [Example response] | [Prompt for elaboration] |
| Shallow | [Characteristics] | [Example response] | [Redirect to reasoning] |

### Scaffolding Sequence

[For students who struggle to self-explain: how to move from open prompts to increasingly structured scaffolds without giving the answer]

**Self-check before returning output:** Verify that (a) prompts elicit explanation not description, (b) prompts are placed at conceptually dense points, (c) prompts require generation not recognition, (d) the material contains enough information to construct an explanation, and (e) quality indicators distinguish deep from shallow responses.
```

## 示例输出

**场景：** *学习材料：“一个通过配方法解一元二次方程的完整示例：第 1 步：x² + 6x + 2 = 0。第 2 步：移项得到 x² + 6x = -2。第 3 步：等式两边都加上 9：x² + 6x + 9 = -2 + 9 = 7。第 4 步：将左边因式分解：(x + 3)² = 7。第 5 步：等式两边开平方：x + 3 = ±√7。第 6 步：求解：x = -3 ± √7。” / 目标理解：“为什么配方法有效——具体来说，理解 (b/2)² 是将 x² + bx 转化为完全平方三项式的数，以及为什么这种转化很有用（它让我们可以对等式两边开平方）” / 学生水平：“11 年级，GCSE Higher” / 已知误解：“学生认为 9 是‘凭空出现的’——他们可以跟着步骤做，但不理解 9 是从哪里来的。学生还会在 ±√7 上遇到困难——他们会忘记负根，或者不理解为什么有两个答案”*

---

## 自我解释提示：配方法

**材料：** 使用配方法解 x² + 6x + 2 = 0 的完整示例  
**目标理解：** 为什么 (b/2)² 可以配成完全平方——理解代数结构，而不只是记住步骤  
**提示数量：** 3 个——放置在概念密度最高的三个位置（第 2、3 和 5 步）

### 提示放置图

完整示例共有 6 个步骤。并不是每一步都需要提示：
- **第 1 步**（写出方程）：常规步骤——不需要提示。
- **第 2 步**（移项得到 x² + 6x = -2）：**提示 1**——这一步做出了一个不明显的选择（为什么要移走 2？），从而揭示了解题策略。
- **第 3 步**（等式两边都加上 9）：**提示 2**——这是关键的概念步骤，也是最常见的困惑点。9 是从哪里来的？
- **第 4 步**（因式分解得到 (x + 3)² = 7）：不需要提示——如果学生理解了提示 2，这一步自然就能完成。如果他们没有理解，在这里提问也无济于事。
- **第 5 步**（开平方，得到 ±√7）：**提示 3**——± 在概念上很重要，也经常被误解。
- **第 6 步**（求解 x）：常规步骤——不需要提示。

### 自我解释提示

**提示 1——放置于：第 2 步（x² + 6x = -2）**
- **提示文本：**“我们把 +2 移到了等式另一边。为什么？我们想在等式左边构造出什么，为什么让 x² + 6x 单独留在左边会有帮助？”
- **目标解释：**“我们希望左边只有 x 项（x² + 6x），这样就可以加上一个特定的数，把它变成完全平方。+2 会造成干扰，因为 x² + 6x + 2 不是完全平方。我们需要控制所加的数。”
- **为什么放在这里：**这一步看起来很次要（“只是移项”），但它揭示了配方法的策略。如果学生不理解我们为什么要把 x² + 6x 单独拿出来，那么接下来的方法就会变得难以理解。
- **常见的肤浅回答：**“我们把 2 移走，这样 x 就在一边了”——这只是描述了动作，没有解释这样做的目的。
- **肤浅回答后的追问：**“但我们为什么需要让 x² + 6x 单独存在？接下来我们要对它做什么，以至于必须先把常数项移走？”

**提示 2——放置于：第 3 步（x² + 6x + 9 = 7）**
- **提示文本：**“我们在等式两边都加上了 9。请解释：数字 9 是从哪里来的？为什么一定是 9，而不是 4、16 或其他任何数字？”
- **目标解释：**“9 来自 (6/2)² = 3² = 9。我们取 x 的系数（也就是 6），将它除以 2（得到 3），再平方（得到 9）。我们使用这个特定的数，是因为 x² + 6x + 9 = (x + 3)²——它正是能让左边成为完全平方三项式的数。其他任何数都无法做到这一点。”
- **为什么放在这里：**这是该方法的概念核心。“9 是从哪里来的？”这个问题直接针对最常见的误解。如果学生能够解释这一点，就说明他们理解了配方法。
- **常见的肤浅回答：**“因为这样就配成完全平方了”——这是循环论证（只是重复了方法名称，没有解释其中的机制）。
- **肤浅回答后的追问：**“‘配成完全平方’到底是什么意思？试试看：展开 (x + 3)²。你得到什么？现在再看 x² + 6x + 9。有没有注意到什么？”

**提示 3 — 放置于：步骤 5（x + 3 = ±√7）**
- **提示文本：**“我们写的是 ±√7，而不只是 √7。为什么会有两个值？如果我们只写 +√7，会漏掉什么？”
- **目标解释：**“因为 (+√7)² 和 (-√7)² 都等于 7。平方根运算有两个解。如果我们只取正平方根，就会漏掉第二个解：x = -3 - √7。从几何角度看，一个二次函数有两个根（抛物线在两个位置与 x 轴相交），所以我们应该预期有两个答案。”
- **为什么放在这里：**± 是一个概念上的易错点——学生经常忘记它，或者不理解它为什么存在。这个提示迫使他们理解其中的数学原因，而不只是记住这个符号。
- **常见的肤浅回答：**“因为是 ±”，或者“因为规则就是这样”——只是重复这个记号，却没有解释背后的原因。
- **如果回答肤浅，后续追问：**“试试不写 ±。如果 x + 3 = √7，那么 x 是多少？现在检查一下：这个值真的能解出原方程吗？接着试试 x + 3 = -√7。这个值也能解出原方程吗？”

### 质量指标

| 质量等级 | 听起来是什么样 | 示例 | 应该怎么做 |
|---|---|---|---|
| 深入 | 提到数学**原理**——解释**为什么**，联系结构，并用自己的话表达 | “我们加上 9，是因为 (6/2)² = 9，而这正是让 x² + 6x + 9 能够因式分解为完全平方的关键。我们需要一个完全平方，这样才能在下一步开平方。” | 肯定：“完全正确。你找到了关键原理。”然后继续。 |
| 部分正确 | 正确但不完整——只说明了部分原因，没有给出完整的推理链条 | “9 是把 6 除以 2 再平方得到的。” | 引导其进一步说明：“很好——但为什么除以 2 再平方就能得到正确的数？把它加到 x² + 6x 后会发生什么？” |
| 肤浅 | 描述操作，或者重复步骤，却没有解释推理过程 | “我们在等式两边都加 9 来配方法。” | 重新引导：“你描述了我们**做了什么**，但我需要你解释**为什么**。9 具体是从哪里来的？为什么不是 4 或 16？” |

### 脚手架序列

对于难以自行解释的学生，按以下层级推进：

**第 1 级——开放式提示（默认）：**“解释一下我们为什么要在等式两边都加 9。”

**第 2 级——定向提示：**“看看 x 前面的数（是 6）。试着把它除以 2。现在把得到的结果平方。你得到什么数？这和所加的数一致吗？”

**第 3 级——验证提示：**“试着展开 (x + 3)²。你得到什么？现在把它和 x² + 6x + 9 比较一下。你注意到了什么？”

**第 4 级——填空提示：**“我们加上 (b/2)²，是因为 x² + bx + (b/2)² = (x + b/2)²。在本题中，b = 6，所以 (b/2)² = ___。并且 x² + 6x + ___ = (x + ___)²。填入空白处。”

这个序列从最大程度地让学生自行生成解释（第 1 级），逐步过渡到最大程度的脚手架支持（第 4 级）。始终从第 1 级开始——即使生成解释的尝试失败，也能带来学习（Hausmann & VanLehn, 2007）。只有在学生确实卡住时才升级，不要因为他们的解释不够完善就升级。

---

## 已知局限

1. **自我解释提示会减慢学习进度。** 每一步都进行自我解释的学生，完成学习材料所需的时间会显著长于被动阅读的学生。这是一种**有益的困难**（Bjork, 1994）——额外投入的时间会带来更深入的学习——但在时间受限的情境下（考试复习、家庭作业）可能造成实际问题。教师必须有意识地决定在哪些地方投入自我解释的时间。

2. **很难自动评估自我解释的质量。** AI 可以检测回答的长度以及关键术语是否出现，但要评估自我解释是否真正深入（而不是冗长且肤浅），需要理解其中的概念内容。当前的 LLMs 可以近似完成这类评估，但可能会将复杂而不寻常的解释误判为肤浅。

3. **自我解释最适合概念丰富的材料。** 概念深度很低的程序性内容（例如设置电子表格格式、对规则动词进行变位）从自我解释提示中获得的益处较少，因为其中可供**解释**的内容更少。当材料包含不明显的推理、隐藏的联系或常见误解时，自我解释的效果最为显著。

4. **学生可能需要接受自我解释训练。** Chi et al. (1994) 发现，仅提供提示就能产生效果，但其他研究表明，学生若先接受有关优秀自我解释应具备何种特征的训练，会从中受益。上面的支架式引导序列对此有所处理，但在第一次使用自我解释提示的课程中，教师可能需要明确示范这一过程。