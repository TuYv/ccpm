---
# AGENT SKILLS STANDARD FIELDS (v2)
name: cpa-sequence-designer
description: "Design a Concrete-Pictorial-Abstract learning sequence for a mathematical concept using manipulatives. Use when teaching maths through Singapore method or when students struggle with abstraction."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/cpa-sequence-designer"
skill_name: "Concrete-Pictorial-Abstract Sequence Designer"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Bruner (1966) — Toward a Theory of Instruction (enactive, iconic, symbolic)"
  - "Ministry of Education Singapore (2012) — Mathematics Syllabus: Primary and Secondary"
  - "Leong, Ho & Cheng (2015) — Concrete-Pictorial-Abstract: surveying its origins and charting its future"
  - "Fyfe, McNeil, Son & Goldstone (2014) — Concreteness fading in mathematics and science instruction"
  - "Kaur (2019) — The what, why and how of the 'Model' method in Singapore mathematics"
input_schema:
  required:
    - field: "mathematical_concept"
      type: "string"
      description: "The concept students need to understand — what they should grasp at abstract level by the end"
    - field: "student_level"
      type: "string"
      description: "Age/year group and current mathematical understanding"
  optional:
    - field: "current_approach"
      type: "string"
      description: "How the teacher currently teaches this concept — what they do now"
    - field: "common_errors"
      type: "string"
      description: "Typical mistakes students make with this concept"
    - field: "available_manipulatives"
      type: "string"
      description: "Physical resources available — cubes, counters, base-ten blocks, fraction pieces"
    - field: "lesson_time"
      type: "string"
      description: "How much lesson time is available for the CPA sequence"
output_schema:
  type: "object"
  fields:
    - field: "cpa_sequence"
      type: "object"
      description: "The complete C→P→A sequence — what students do at each stage, with explicit bridging between stages"
    - field: "concrete_stage"
      type: "object"
      description: "Manipulative-based activities — what students physically handle and what understanding this builds"
    - field: "pictorial_stage"
      type: "object"
      description: "Visual representation activities — bar models, diagrams, number lines — bridging concrete to abstract"
    - field: "abstract_stage"
      type: "object"
      description: "Symbolic/numerical work — connecting to the formal mathematical notation"
    - field: "bridging_questions"
      type: "array"
      description: "Questions that help students connect each stage to the next"
chains_well_with:
  - "variation-theory-task-designer"
  - "worked-example-fading-designer"
  - "explicit-instruction-sequence-builder"
  - "diagnostic-question-generator"
  - "pedagogical-content-knowledge-developer"
teacher_time: "4 minutes"
tags: ["CPA", "Singapore-maths", "Bruner", "manipulatives", "bar-model", "concreteness-fading", "mathematics"]
---
# 具体—图示—抽象序列设计器

## 此技能的作用

设计一个学习序列，引导学生从具体操作（实物），经过图示表示（图表、条形模型、数轴），再过渡到抽象符号（符号和数字）——遵循新加坡数学课程框架所重视的 CPA 方法。这一方法源于 Bruner（1966）的理论：学习者会经历动作性（基于行动）、映象性（基于图像）和符号性（基于语言/符号）三种表征模式。其关键洞见在于，这些阶段并不是彼此分离的活动，而是一个相互连贯的进阶过程——每个阶段所建立的理解，都会使下一个阶段变得有意义。输出内容包括每个阶段的活动，以及明确的衔接性问题，帮助学生理解他们用实物进行的操作、在图示中画出的内容，以及数字和符号所代表的意义之间的联系。AI 在这里尤其有价值，因为设计有效的 CPA 序列需要确保具体阶段和图示阶段真正体现数学结构（而不只是对其进行说明），并且阶段之间的过渡是明确呈现的，而不是默认学生能够自行理解。

## 证据基础

Bruner（1966）提出，学习者通过三种模式来表征知识：动作性（通过行动——操作实物）、映象性（通过图像——图表和图片）以及符号性（通过符号——文字和数字）。他主张，新概念应先通过动作性体验引入，然后以映象形式表示，最后再以符号形式表示。新加坡教育部（2012）将这一方法作为数学课程的核心 CPA 方法，并建立了一个在国际评估（TIMSS、PISA）中始终名列前茅的体系。Leong、Ho 和 Cheng（2015）追溯了 CPA 在新加坡的实施情况，指出 CPA 并不只是“使用具体材料”，而是一种精心设计的进阶过程，其中每个阶段都经过有意安排，与下一个阶段建立联系。图示阶段，尤其是条形模型（一种以矩形表示数学关系的视觉表征），是新加坡的一项特色贡献，它在具体操作与抽象代数之间发挥桥梁作用。Fyfe 等人（2014）为“具体性渐隐”提供了实验性证据——从具体表征开始，逐步移除具体特征，直到只剩下抽象结构。他们发现，与从抽象表征开始、从具体表征开始但不进行渐隐，或同时使用具体表征和抽象表征相比，从具体表征开始并逐步过渡到抽象表征能够带来更好的迁移效果。Kaur（2019）记录了新加坡数学中的“模型法”（条形建模），说明这一图示工具如何帮助学生表示和解决复杂的应用题，而这类问题若采用其他方法，通常需要列出代数方程。

## 输入框架

教师必须提供：
- **数学概念：** 学生需要理解的内容。*例如：“分母不同的分数相加” / “解决涉及比的应用题” / “理解三位数中的数位值” / “两位数乘一位数”*
- **学生水平：** 年级和当前的理解程度。*例如：“四年级，能够对分母相同的分数进行加法运算，但在分母不同时会遇到困难” / “二年级，理解十位和个位，但对百位感到困惑”*

可选（如果上下文引擎可用，则注入）：
- **Current approach:** 教师目前教授该内容的方式
- **Common errors:** 学生常见的错误
- **Available manipulatives:** 可用的实体操作材料
- **Lesson time:** 可用时间

## 提示词

```text
You are an expert in the Concrete-Pictorial-Abstract (CPA) approach as implemented in the Singapore Mathematics Curriculum Framework, with deep knowledge of Bruner's (1966) representational theory, the Singapore MOE's (2012) mathematics syllabus design, Leong et al.'s (2015) analysis of CPA implementation, Fyfe et al.'s (2014) research on concreteness fading, and Kaur's (2019) documentation of the Singapore bar model method. You understand that CPA is not "use blocks, then draw, then do sums" — it is a carefully designed progression where each stage builds a specific aspect of understanding that is EXPLICITLY connected to the next stage.

CRITICAL PRINCIPLES:
- **The concrete stage must represent the mathematical structure.** Giving students cubes to count is not CPA — it's just counting with props. The concrete manipulation must embody the mathematical relationship. For fractions: physically breaking a whole into parts and comparing. For multiplication: arranging objects into arrays where the structure of rows × columns IS multiplication.
- **The pictorial stage is not illustration — it is a thinking tool.** Bar models, number lines, and diagrams are not pictures of the answer — they are tools for THINKING about the mathematical structure. Students should learn to draw the representation as a problem-solving strategy, not just as a way to show their working.
- **Bridging between stages must be EXPLICIT.** The most common CPA failure is assuming students will automatically see the connection between the concrete, the pictorial, and the abstract. They won't. The teacher must explicitly connect: "Remember when you broke the fraction strip into quarters? This bar model shows the same thing. And this fraction symbol ¼ means the same thing again." Each stage must be named and linked.
- **Concreteness fading, not replacement.** The concrete stage is not abandoned when students move to pictorial — it remains available as a reference. Students should be able to move BACK to a previous stage if they get confused at a higher level. The stages are cumulative, not sequential.

Your task is to design a CPA sequence for:

**Mathematical concept:** {{mathematical_concept}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Current approach:** {{current_approach}} — if not provided, design the full CPA sequence from scratch.
**Common errors:** {{common_errors}} — if not provided, identify likely errors from the concept.
**Available manipulatives:** {{available_manipulatives}} — if not provided, suggest accessible, low-cost manipulatives.
**Lesson time:** {{lesson_time}} — if not provided, design for a 60-minute lesson.

Return your output in this exact format:

## CPA Sequence: [Mathematical Concept]

**Concept:** [What students will understand]
**Students:** [Year group and starting point]
**Mathematical structure:** [The underlying mathematical relationship the CPA sequence must represent]

### Stage 1 — Concrete (Enactive)

**Manipulative:** [What physical objects students use]
**Activity:** [What students do with the objects — step by step]
**What this builds:** [What understanding the concrete manipulation develops]
**Key teacher language:** [What the teacher says to name the mathematical structure while students manipulate]

### Bridging: Concrete → Pictorial

[How the teacher explicitly connects the physical objects to the visual representation — "This block you're holding is the same as this bar I'm drawing"]

### Stage 2 — Pictorial (Iconic)

**Representation:** [Bar model / number line / array diagram / other visual tool]
**Activity:** [What students draw and how they use the representation to solve problems]
**What this builds:** [What understanding the pictorial representation develops beyond the concrete stage]
**Key teacher language:** [What the teacher says to connect the diagram to the physical experience]

### Bridging: Pictorial → Abstract

[How the teacher explicitly connects the visual representation to the symbolic notation — "This section of the bar model represents the same thing as this number in the equation"]

### Stage 3 — Abstract (Symbolic)

**Notation:** [The formal mathematical symbols and procedures]
**Activity:** [What students do with numbers and symbols]
**What this builds:** [Fluent, flexible use of the abstract notation, grounded in concrete and pictorial understanding]
**Connection back:** [How students can return to pictorial or concrete representations if they get stuck at the abstract level]

### Common Errors and CPA Responses

[For each common error, explain which CPA stage addresses it — "Students who make this error need to return to the concrete/pictorial stage because..."]

### Assessment Check

[How to verify that students understand the concept at all three levels — not just procedurally at the abstract level]

**Self-check before returning output:** Verify that (a) the concrete stage genuinely represents the mathematical structure, not just provides counting props, (b) the pictorial stage is a thinking tool, not just an illustration, (c) the bridging between stages is explicit — the teacher names the connection, (d) all three stages represent the SAME mathematical relationship in different modes, and (e) the sequence allows students to move back to earlier stages when needed.
```

## 示例输出

**情境：** *数学概念：“分母不同的分数相加——例如，½ + ⅓” / 学生水平：“五年级，能够熟练计算分母相同的分数相加（⅓ + ⅓ = ⅔），但在分母不同时感到困惑——许多学生会分别将分子和分母相加（½ + ⅓ = ⅖）” / 常见错误：“将分子和分母相加：½ + ⅓ = 2/5。不理解为什么需要公分母。能够按步骤找到公分母，但不理解公分母的含义。” / 可用操作材料：“分数条、分数圆片、库伊森纳棒”*

---

## CPA 序列：分母不同的分数相加

**概念：** 通过寻找具有公分母的等值分数，将分母不同的分数相加  
**学生：** 五年级，能够计算同分母分数相加，但对异分母分数感到困惑  
**数学结构：** 要将分数相加，各个部分必须是相同大小的（分母相同）。如果各个部分大小不同，就必须先将它们细分成大小相等的部分，然后再合并。这就是寻找公分母的含义——让各个部分大小相同，这样它们就可以一起计数。

### 阶段 1——具体操作（动作性）

**操作材料：** 分数条——长度相等、分别分成二等份、三等份、四等份、六等份和十二等份的纸条。

**活动：**
1. 给每位学生一根“二分之一”分数条和一根“三分之一”分数条。提问：“如果你吃了一个披萨的二分之一，又吃了另一个披萨的三分之一，那么你总共吃了多少？“学生将½分数条和⅓分数条首尾相接。他们可以看到总长度，但无法给它命名，因为这些部分的大小不同。

2. 提问：“你能准确地告诉我那是多少吗？不要说‘比二分之一多一点’——要说出一个准确的分数。”学生会感到困难。这是关键时刻：你不能只数这些部分，因为它们的大小不同。½和⅓的大小并不相同。你不能说“1 + 1 = 2个部分”，因为这些部分大小不同。

3. 现在给学生六等份分数条。提问：“你能从六等份分数条中找出与二分之一完全一样长的部分吗？几个六分之一组成一个二分之一？”学生将六分之一分数条实际叠放在二分之一分数条上：3个六分之一 = 1个二分之一。然后提问：“几个六分之一组成一个三分之一？”2个六分之一 = 1个三分之一。

4. 用3/6替换½分数条，用2/6替换⅓分数条。现在这些部分大小相同了。提问：“现在你能告诉我总数了吗？”3个六分之一 + 2个六分之一 = 5个六分之一。这些部分大小相同，因此可以进行计数。

**这项活动培养的能力：** 通过亲身操作体验为什么需要公分母——大小不同的部分无法合并。学生先感受到问题（这些部分无法匹配），然后再学习解决方法（找到能够匹配的等值部分）。

**教师关键用语：** “这些部分大小不同。在它们大小相同之前，我们不能把它们数在一起。我们需要找到能够同时匹配这两个分数的更小部分。”反复使用“相同大小”这个词——这就是“公分母”的含义。

### 过渡：具体操作 → 图示

教师在学生面前仍摆着实物分数条时，在黑板上画出分数条：

“看看你们的分数条。我要把你们手中的分数条一模一样地画出来。”画一根分成 2 等份的条形（涂色 1 份）。“这是你们的二分之一。”画一根分成 3 等份的条形（涂色 1 份）。“这是你们的三分之一。”画一根分成 6 等份的条形（涂色 3 份）。“这是你们的 6 份中的 3 份——和你们的二分之一相同。”画一根分成 6 等份的条形（涂色 2 份）。“这是你们的 6 份中的 2 份——和你们的三分之一相同。”

“你们能看出我的图和你们的分数条表示的是同一件事吗？把你们的分数条放在我的图旁边，检查一下。”

### 阶段 2 — 图示（象形）

**表示方式：**条形模型——长度相等、分成若干部分的矩形条。

**活动：**
1. 学生画出自己的条形模型（不能只是看教师的图）。问题：“What is ½ + ¼?” 学生画出：
   - 一根分成 2 等份的条形，涂色 1 份（½）
   - 一根分成 4 等份的条形，涂色 1 份（¼）
   - 提问：“你们能看出一种方法，让这些部分变成一样大吗？”学生注意到，每个二分之一可以分成 2 个四分之一。重新画图：一根分成 4 等份的条形，涂色 2 份（2/4 = ½）。现在：2/4 + 1/4 = 3/4。

2. 用 ⅓ + ¼ 重复上述过程：
   - 画一根分成 3 等份的条形，涂色 1 份。再画一根分成 4 等份的条形，涂色 1 份。
   - “多大的部分既适用于三分之一，又适用于四分之一？”学生通过自己的图进行尝试：十二分之一可行。重新画图，将两根条形都分成 12 等份：4/12 + 3/12 = 7/12。

3. 在学习正式方法之前，学生开始根据条形模型预测公分母：“我需要一个数，3 和 4 都能整除它。”

**培养的能力：**条形模型不需要实物，就能使数学结构变得可见。学生可以看出为什么 ⅓ = 4/12（条形图展示了这一点），还可以把图画作为解决问题的工具——画出不同的分法，直到找到同时适用于两个分数的分法。

**教师的关键用语：**“你的条形模型和分数条表示的是同一件事。条形必须有相同的长度——因为我们说的是同一个整体的部分。多大的部分能同时匹配这两个分数？”

### 过渡：图示 → 抽象

学生用条形模型解决了几道题后，教师在图示旁边写出符号表示：

“我们把你们刚才画的内容用数学符号写出来。你们把 ⅓ 画成了 4/12——我们写成：⅓ = 4/12。你们把 ¼ 画成了 3/12——我们写成：¼ = 3/12。然后你们进行了相加：4/12 + 3/12 = 7/12。这些数字所表达的内容，和你们的条形模型完全一致。”

同时指向等式中的每一部分以及条形模型中对应的部分：“这个 4 [指向分子] 就是这 4 个涂色部分 [指向条形]。这个 12 [指向分母] 就是条形被分成的这 12 个相等部分 [指向条形]。”

### 阶段 3 — 抽象（符号）

**记法：**⅓ + ¼ = 4/12 + 3/12 = 7/12

**活动：**
1. 学生只使用数字，练习寻找公分母并进行分数加法：⅕ + ⅓、⅔ + ¼、¾ + ⅙。
2. 对每道题，学生写出等值分数，进行相加，并在需要时约分。
3. 学生通过快速画出条形模型，检查前几道题的答案：“7/12 看起来正确吗？画出条形图检查一下。”

**这能培养什么：** 流畅、高效地运用标准步骤，但建立在理解的基础上。当学生写出 ⅓ = 4/12 时，他们知道这意味着什么（把长条分成 12 份，其中 4 份涂上阴影）。这个步骤并非随意规定的；它体现了具体操作和图示阶段中的经验。

**回到前面的联系：** 如果学生在抽象层面卡住了（“我不知道该为 ⅗ + ¼ 使用什么公分母”），教师可以说：“画一个长条模型。对于五分之一和四分之一来说，什么大小的份数对两者都适用？”图示阶段仍然可以作为思考工具，而不是被抛在身后的东西。

### 常见错误与 CPA 应对方法

| 错误 | 学生的做法 | CPA 应对方法 |
|---|---|---|
| 将分子和分母相加 | ½ + ⅓ = 2/5 | 回到具体操作：“用分数条表示 2/5。现在把 ½ 和 ⅓ 首尾相接地摆出来。它们的长度相同吗？”它们不会相同——2/5 比单独的 ½ 还小。实物证据可以证明这种错误。 |
| 找到公分母，却不理解原因 | 正确写出 ⅓ = 4/12，却无法解释 | 回到图示：“画一根分成 3 份的长条。现在把每一份再分成 4 份。你一共有多少份？其中有多少份涂了阴影？”长条模型展示了为什么 ⅓ = 4/12。 |
| 不进行约分 | 写出 4/12 + 3/12 = 7/12，却没有把 6/12 约成 ½ | 回到图示：“画出 6/12。现在看一看——你能不能用更简单的方式描述它？它包含多少个二分之一？”长条模型显示，12 个部分中的 6 个恰好是整根长条的一半。 |

### 评估检查

给学生三项任务，分别检验他们在 CPA 每个层级上的理解：

1. **具体操作/图示检查：**“画一个长条模型来表示 ⅔ + ¼。使用你的图示找出答案。”（检验学生是否能够独立使用图示工具。）

2. **抽象检查：**“计算 ⅗ + ¼。展示你的计算过程。”（检验学生是否能够使用标准步骤。）

3. **理解检查：**“Ali 说 ½ + ⅓ = 2/5。解释为什么 Ali 错了。你可以使用图示来帮助说明。”（检验学生是否理解公分母步骤为什么有效——他们能否解释错误，而不仅仅是避免犯错？）

如果学生能够回答全部三项，他们就在 CPA 的三个层级上都理解了分数加法——不仅理解计算步骤，也理解其中的概念。

---

## 已知局限

1. **CPA 在数学领域得到的验证最为充分。** 新加坡框架是为数学教育设计的，其证据基础在数学领域最为扎实。这些原则（先具体后抽象，明确建立不同表征之间的联系）适用于各个学科，但具体工具——长条模型、分数条、十进制积木——都是数学工具。教师将 CPA 应用于其他学科时，应当调整其原则，而不是照搬这些工具。

2. **具体操作阶段需要高质量的操作材料和教师技能。** 设计不当的操作材料（例如用计数器表示分数）可能造成误解，而不是防止误解。操作材料必须体现数学结构。教师需要接受培训，了解哪些操作材料代表哪些概念——使用错误的具体材料比完全不用具体材料更糟糕。

3. **CPA 并不意味着每节课都必须从具体阶段开始。** 一旦学生已经对某个概念具备扎实的具体和图示理解，他们就可以在抽象层面进行学习，而不必每次都经历全部三个阶段。CPA 是学习新概念的进阶过程，而不是每节课都要遵循的仪式。当学生遇到新的应用场景或产生困惑时，应重新回顾这些阶段；如果学生已经能够熟练掌握，就不必重复这些阶段。