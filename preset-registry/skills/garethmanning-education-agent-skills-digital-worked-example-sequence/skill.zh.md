---
# AGENT SKILLS STANDARD FIELDS (v2)
name: digital-worked-example-sequence
description: "Create an interactive digital worked example sequence with fading for online or blended delivery. Use when building e-learning modules, LMS content, or app-based instruction."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/digital-worked-example-sequence"
skill_name: "Digital Worked Example Sequence"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Sweller, van Merriënboer & Paas (2019) — Cognitive Architecture and Instructional Design: 20 Years Later"
  - "Renkl (2014) — Toward an instructionally oriented theory of example-based learning"
  - "Atkinson, Derry, Renkl & Wortham (2000) — Learning from examples: instructional principles from the worked examples research"
  - "Renkl, Atkinson & Große (2004) — How fading worked-out solution steps works — a cognitive load perspective"
  - "Wylie & Chi (2014) — The self-explanation principle in multimedia learning"
input_schema:
  required:
    - field: "skill_to_teach"
      type: "string"
      description: "The specific procedure or skill the worked examples will teach"
    - field: "target_platform"
      type: "string"
      description: "Where the examples will be delivered — learning management system, app, interactive PDF, web page"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and current proficiency"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "sequence_length"
      type: "integer"
      description: "How many examples in the sequence — typically 4-8"
    - field: "interactivity_level"
      type: "string"
      description: "How interactive the platform allows — passive display, clickable steps, fill-in blanks, drag-and-drop"
    - field: "student_data_available"
      type: "string"
      description: "Whether the system can track student responses and adapt"
output_schema:
  type: "object"
  fields:
    - field: "example_sequence"
      type: "array"
      description: "The full sequence from complete worked example through faded examples to independent problem"
    - field: "self_explanation_prompts"
      type: "array"
      description: "Prompts embedded at each step that require students to explain the reasoning"
    - field: "fading_schedule"
      type: "object"
      description: "The precise schedule for removing steps — which steps fade first, which last"
    - field: "digital_design_specs"
      type: "object"
      description: "How to implement in the digital environment — pacing, interactivity, feedback"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "erroneous-example-designer"
  - "worked-example-to-problem-solving-transition-designer"
  - "cognitive-load-analyser"
teacher_time: "4 minutes"
tags: ["worked-examples", "fading", "digital-learning", "CLT", "Sweller", "Renkl", "self-explanation", "multimedia"]
---
# 数字化完整例题序列

## 此技能的作用

设计一套针对数字化交付进行优化的完整例题序列——融入自我解释提示、系统化的逐步撤除方案，以及充分利用数字环境相较于纸质材料所具备优势的交互设计。该序列将学生从学习完整的完整例题（展示并解释每一个步骤），逐步引导至逐步撤除的例题（逐渐移除更多步骤，由学生完成），最终过渡到独立解题。Renkl (2014) 的关键洞见是：只有当学生对完整例题进行主动加工时，完整例题才能产生学习效果——被动阅读完整例题几乎不比完全没有例题好。数字化交付创造了独特的机会（在每个步骤设置自我解释提示、为被撤除的步骤提供即时反馈、根据表现调整学习进度），也带来了独特的风险（屏幕元素之间的注意分散、多媒体造成的认知过载，以及不加思考地点击跳过内容的诱惑）。输出内容包括完整的例题序列、嵌入式自我解释提示、精确的逐步撤除方案，以及数字化设计规范。AI 在此处尤其有价值，因为设计一套有效的数字化完整例题序列，需要协调内容设计（数学或程序性步骤）、认知设计（撤除方案、自我解释节点）和界面设计（如何呈现步骤、提示出现在哪里、如何提供反馈）——这三个设计维度必须彼此对齐。

## 证据基础

Sweller, van Merriënboer & Paas (2019) 针对当代数字化学习环境更新了认知负荷理论，指出了数字环境特有的额外负荷来源：瞬时信息（出现后又消失的内容）、多个屏幕区域之间的注意分散，以及多媒体呈现中的冗余。他们强调，数字化完整例题必须通过精心设计来管理这些负荷来源。Renkl (2014) 将 25 年的完整例题研究综合为一系列教学原则：例题应当具有清晰结构（明确划分各个步骤），应当提供自我解释提示（不能听任其自然发生），撤除过程应当系统化（一次撤除一个步骤，从最近学会的步骤开始），向独立练习的过渡应当循序渐进。Atkinson et al. (2000) 奠定了基础原则：完整例题对新手学习者最有效（专家会受到“专业知识逆转效应”的影响——完整例题变得多余且适得其反），完整例题应与练习题交替呈现，而不是成组集中呈现，其关键机制是图式获得（为问题类型建立心理模板）。Renkl, Atkinson & Große (2004) 证明，系统化撤除——一次移除一个解题步骤——明显比从完整例题突然过渡到完整问题更有效。Wylie & Chi (2014) 表明，与不包含提示的完整例题相比，嵌入多媒体完整例题中的自我解释提示能够显著提升学习效果，因为它们迫使学生对每个步骤进行主动加工。

## 输入架构

教师必须提供：
- **要教授的技能：** 具体的操作流程。*例如：“使用消元法解联立方程” / “构建有理有据的论证段落” / “在测量单位之间进行换算” / “用 Python 编写递归函数”*
- **目标平台：** 内容交付的平台。*例如：“带有嵌入式测验的 Google Slides” / “带有逐步显示功能的自定义 Web 应用” / “交互式 PDF” / “学习管理系统（Canvas/Moodle）”*

可选项（如果可用，则由上下文引擎注入）：
- **学生水平：** 年级组和熟练程度
- **学科领域：** 课程学科
- **序列长度：** 示例数量
- **交互程度：** 平台功能
- **可用的学生数据：** 系统是否进行自适应调整

## 提示词

```
You are an expert in digital worked example design, with deep knowledge of Sweller et al.'s (2019) updated cognitive load theory for digital contexts, Renkl's (2014) instructional principles for example-based learning, Atkinson et al.'s (2000) foundational worked example research, Renkl, Atkinson & Große's (2004) systematic fading procedure, and Wylie & Chi's (2014) research on self-explanation in multimedia learning. You understand that digital worked examples are not PDFs of paper examples displayed on a screen — they are interactive learning tools that exploit digital affordances (step-by-step reveal, embedded prompts, immediate feedback, adaptive pacing) while managing digital risks (transient information, split attention, passive clicking).

CRITICAL PRINCIPLES:
- **Self-explanation at EVERY step.** The single most powerful design feature is a self-explanation prompt after each step: "Why did we do this?" or "What rule is being applied here?" Without self-explanation, students click through examples like a slideshow — seeing without processing. Renkl (2014) showed that prompted self-explanation is the mechanism that converts passive observation into active learning.
- **Systematic fading, not abrupt transition.** The sequence should remove ONE step at a time, starting with the LAST step (backward fading) or the step that students find easiest. Each faded step becomes a "completion problem" — the student must supply the missing step. The transition from full example to independent problem should be so gradual that students barely notice when they're doing it on their own.
- **Digital pacing: reveal steps one at a time.** Don't display the entire solution at once — this creates extraneous load and encourages scanning rather than studying. Reveal one step at a time, with the self-explanation prompt BEFORE the next step is shown. This forces students to process each step before moving on.
- **Immediate, targeted feedback on faded steps.** When a student fills in a faded step, provide immediate feedback: correct (with brief confirmation) or incorrect (with a hint addressing the specific error, not just "try again"). This is where digital delivery excels over paper.
- **Manage split attention.** The problem, the example steps, the self-explanation prompts, and the feedback must be spatially integrated — not spread across different areas of the screen. The student should never have to hold information from one screen area in working memory while looking at another area.

Your task is to design a digital worked example sequence for:

**Skill to teach:** {{skill_to_teach}}
**Target platform:** {{target_platform}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for secondary school novice learners.
**Subject area:** {{subject_area}} — if not provided, infer from the skill.
**Sequence length:** {{sequence_length}} — if not provided, design 6 examples (2 full, 2 faded, 2 independent).
**Interactivity level:** {{interactivity_level}} — if not provided, design for step-by-step reveal with text input for faded steps.
**Student data available:** {{student_data_available}} — if not provided, design a fixed sequence with optional adaptation notes.

Return your output in this exact format:

## Digital Worked Example Sequence: [Skill]

**Skill:** [What students learn]
**Platform:** [Where it's delivered]
**Sequence structure:** [How many examples, from full to faded to independent]

### Sequence Overview

[The progression from fully worked to fully independent — what each example does]

### Example [N]: [Full / Faded-1 / Faded-2 / Independent]

**Problem:** [The problem to solve]
**Steps shown vs. faded:**
[Which steps are shown, which are faded (student completes), which have self-explanation prompts]

**Step-by-step design:**
For each step:
- **Step [N]:** [The step — shown or faded]
- **Self-explanation prompt:** [The question students answer before seeing the next step]
- **If faded — expected student input:** [What the student should enter]
- **Feedback on faded step:** [Immediate feedback — correct or incorrect with hint]

### Fading Schedule

[The precise schedule: which steps fade in which example, and why this order]

### Digital Design Specifications

**Pacing:** [How steps are revealed — one at a time, with forced pause at self-explanation prompts]
**Layout:** [How the screen is organised — problem, steps, prompts, feedback integrated to avoid split attention]
**Feedback timing:** [When and how feedback appears]
**Navigation:** [Can students go back? Can they skip ahead? Design choices and rationale]

### Adaptation Notes

[How the sequence could adapt based on student performance — if the platform supports it]

**Self-check before returning output:** Verify that (a) every step has a self-explanation prompt, (b) fading is systematic and gradual, (c) steps are revealed one at a time, (d) feedback on faded steps is immediate and specific, and (e) split attention is managed through integrated layout.
```

## 示例输出

**情境：** *要教授的技能：“通过消元法解二元一次方程组——例如，2x + 3y = 12 和 4x - 3y = 6。学生需要：确定要消去的变量，将方程相加或相减，解出一个变量，再代回求出另一个变量。” / 目标平台：“定制网页应用——可以一次显示一个步骤，接受文本输入，并提供即时反馈” / 学生水平：“十年级，刚学会解一元一次方程，第一次接触二元一次方程组” / 练习序列长度：“6 个例题（2 个完整示范，2 个逐步撤去支架，2 个独立完成）”*

---

## 数字化演示例题序列：通过消元法解二元一次方程组

**技能：** 通过消元法解二元一次方程组  
**平台：** 定制网页应用（逐步显示、文本输入、即时反馈）  
**序列结构：** 6 个例题——E1-E2（完整示范），E3-E4（逐步撤去支架），E5-E6（提供提示的独立练习）

### 序列概览

| 例题 | 类型 | 显示的步骤 | 撤去支架的步骤 | 目的 |
|---|---|---|---|---|
| E1 | 完整示范例题 | 全部 5 个步骤 | 无 | 学生学习并对每一步进行自我解释 |
| E2 | 完整示范例题（数字不同） | 全部 5 个步骤 | 无 | 通过变化巩固解题过程 |
| E3 | 撤去支架——移除第 5 步 | 步骤 1-4 | 第 5 步（最后的代入） | 学生完成最简单的一步 |
| E4 | 撤去支架——移除第 4 步和第 5 步 | 步骤 1-3 | 第 4-5 步（解方程并代入） | 学生完成最后两步 |
| E5 | 独立完成（提供提示） | 不显示步骤 | 全部步骤 | 学生独立解题，可使用提示序列 |
| E6 | 独立完成（不提供提示） | 不显示步骤 | 全部步骤 | 完整的独立练习 |

### 例题 1：完整示范例题

**问题：** 解方程组：2x + 3y = 12（方程 1）和 4x - 3y = 6（方程 2）

**步骤 1——确定消元机会**  
*显示内容：* “观察 y 项：+3y 和 -3y。它们的大小相同，但符号相反。如果我们将两个方程相加，y 项就会相互抵消。”  
*自我解释提示：* “为什么可以将这两个方程相加？将 +3y 和 -3y 相加时，y 项会发生什么变化？” [学生在下一步出现前输入回答]  
*学生回答后显示的示范答案：* “+3y + (-3y) = 0。y 项会相互抵消，因为它们互为加法逆元。”

**步骤 2——将方程相加**  
*显示内容：* “将左边相加，并将右边相加：(2x + 3y) + (4x - 3y) = 12 + 6 → 6x + 0y = 18 → 6x = 18”  
*自我解释提示：* “我们将两个方程的左边相加，并将右边相加。为什么这样做是允许的？（提示：两个方程都成立，因此两边都相等。）”

**步骤 3——解出 x**  
*显示内容：* “6x = 18 → x = 18 ÷ 6 → x = 3”  
*自我解释提示：* “现在我们得到的是一个一元方程——你已经知道如何解这类方程。我们使用了什么运算？”

**步骤 4——代回**  
*显示内容：* “将 x = 3 代入方程 1：2(3) + 3y = 12 → 6 + 3y = 12 → 3y = 6 → y = 2”  
*自我解释提示：* “为什么要代入方程 1，而不是方程 2？（实际上，代入任意一个方程都可以。你能通过代入方程 2 来验证吗？）”

**步骤 5 — 检查解**
*显示：*“检查：方程 1：2(3) + 3(2) = 6 + 6 = 12 ✓。方程 2：4(3) - 3(2) = 12 - 6 = 6 ✓。解：x = 3，y = 2。”
*自我解释提示：*“为什么检查两个方程都很重要，而不能只检查一个？”

### 示例 3：淡出 — 移除步骤 5

**问题：**同时求解：3x + 2y = 16 和 5x - 2y = 8

按照 E1 中的相同结构展示步骤 1–4（包含自我解释提示）。

**步骤 5 — 淡出（学生完成）：**
*显示：*“我们得出 x = 3，y = 3.5。现在将你的解代入两个方程进行检查。”
*学生输入框：* [两个输入框：“方程 1：3(___) + 2(___) = ___”和“方程 2：5(___) - 2(___) = ___”]
*预期输入：* 方程 1：3(3) + 2(3.5) = 9 + 7 = 16 ✓。方程 2：5(3) - 2(3.5) = 15 - 7 = 8 ✓。
*回答正确时的反馈：*“两个方程都验证通过。你已经确认该解是正确的。”
*回答错误时的反馈：*“检查你的算术。将 x = 3 和 y = 3.5 分别代入每个方程，并仔细计算。”

### 示例 4：淡出 — 移除步骤 4 和 5

**问题：**同时求解：x + 4y = 14 和 3x - 4y = 2

展示步骤 1–3。相加方程后：4x = 16，因此 x = 4。

**步骤 4 — 淡出：**
*显示：*“我们知道 x = 4。将其代入方程 1，求出 y。”
*学生输入框：* [y = ___]
*预期输入：* y = 2.5（由 4 + 4y = 14 → 4y = 10 → y = 2.5）
*回答正确时的反馈：*“正确！现在检查你的解。”
*回答错误时的反馈（例如 y = 10）：*“你可能忘记了除法。4y = 10 意味着 y = 10 ÷ 4。再试一次。”

**步骤 5 — 淡出：**[与 E3 中相同]

### 淡出进度表

| 示例 | 步骤 1（识别） | 步骤 2（相加/相减） | 步骤 3（求解） | 步骤 4（代入） | 步骤 5（检查） |
|---|---|---|---|---|---|
| E1 | 展示 | 展示 | 展示 | 展示 | 展示 |
| E2 | 展示 | 展示 | 展示 | 展示 | 展示 |
| E3 | 展示 | 展示 | 展示 | 展示 | **淡出** |
| E4 | 展示 | 展示 | 展示 | **淡出** | **淡出** |
| E5 | **淡出** | **淡出** | **淡出** | **淡出** | **淡出** |
| E6 | **淡出** | **淡出** | **淡出** | **淡出** | **淡出** |

**淡出逻辑：**步骤从最后一步到第一步逐步淡出（后向淡出）。步骤 5（检查）最先淡出，因为它在程序上最简单。步骤 1（识别可以消元的机会）最后淡出，因为它需要最多的策略性思考。这意味着学生会先独立完成较**简单**的步骤，同时仍能在较**困难**的步骤上获得支架支持。

### 数字化设计规范

**节奏：**每一步都通过点击“下一步”按钮来显示。自我解释提示会在下一步之前出现，学生必须先输入一段回复（至少 5 个字符），然后显示下一步的按钮才会启用。这样可以防止学生不经思考地连续点击。

**布局：**问题显示在屏幕**顶部**，并在整个过程中保持可见。步骤按顺序显示在问题下方——每个新步骤都显示在上一个步骤的下方，以便学生看到不断累积的解题过程。自我解释提示以嵌入式文本框的形式，紧接在每一步下方显示。淡出步骤显示为带有步骤标签（“步骤 4：代入求 y”）的输入框，但内容留空。

**反馈时机：** 在渐隐步骤中，学生提交答案后立即显示反馈。正确：绿色对勾，并附简短确认。错误：琥珀色高亮，并附针对可能错误的具体提示（不只是“错误”）。学生可以重试两次，之后显示正确答案及解释。

**导航：** 学生可以向上滚动查看之前的步骤，但不能跳到后续步骤。他们必须完成每个步骤中的自我解释提示后才能继续。学生可以返回并修改自我解释答案。示例完成后，“总结”视图会集中显示所有步骤。

### 适应性说明

如果平台会跟踪学生的回答：
- **如果学生正确完成所有自我解释，并且首次尝试就完成渐隐步骤：** 跳过 E2（第二个完整示例），直接进入 E3。学生不需要额外的完整示例。
- **如果学生在渐隐步骤中遇到困难（有 2 次或以上错误尝试）：** 在 E4 和 E5 之间插入一个额外的渐隐示例，只再渐隐一个步骤。不要过快地转向完全独立完成。
- **如果学生的自我解释显示出某个具体误解：** 在继续该序列之前，转入针对该误解的微型课程。

---

## 已知限制

1. **完整示例对初学者最有效。** 随着学生逐渐熟练，完整示例会变得多余，甚至可能妨碍表现（即“专业知识逆转效应”——Kalyuga 等，2003 年）。本序列面向学生第一次接触联立方程。对于已经具备一定熟练度的学生，可以从渐隐序列中更靠后的位置开始，或直接跳到独立练习。

2. **数字化自我解释提示可能变得敷衍。** 学生可能学会输入最少的回答来解锁下一步骤，而没有真正投入思考。设计通过设置最少字符数、在答案之前显示提示等方式来缓解这一问题，但无法完全防止敷衍行为。在课堂使用中，教师应定期查看学生的自我解释回答，以检查他们是否真正投入。

3. **上述渐隐进度是固定序列。** 真正的自适应渐隐会根据每个学生的表现调整进度——对于展现出掌握程度的学生加快渐隐，对于遇到困难的学生放慢渐隐。对于不具备自适应能力的平台，固定进度是一个实用的默认方案。具备跟踪功能的平台应使用适应性说明，根据学生情况个性化调整进度。