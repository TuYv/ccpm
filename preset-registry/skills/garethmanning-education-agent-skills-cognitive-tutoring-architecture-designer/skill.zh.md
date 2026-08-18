---
# AGENT SKILLS STANDARD FIELDS (v2)
name: cognitive-tutoring-architecture-designer
description: "Map knowledge components and skill hierarchies for a cognitive tutoring system or adaptive learning platform. Use when designing intelligent tutoring software or skill-based mastery systems."
disable-model-invocation: true
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/cognitive-tutoring-architecture-designer"
skill_name: "Cognitive Tutoring Architecture Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Anderson et al. (1995) — Cognitive tutors: lessons learned (ACT-R theory applied to education)"
  - "Corbett & Anderson (1995) — Knowledge tracing: modeling the acquisition of procedural knowledge"
  - "Koedinger & Aleven (2007) — Exploring the assistance dilemma in experiments with cognitive tutors"
  - "Ritter et al. (2007) — Cognitive Tutor: applied research in mathematics education"
  - "Pane et al. (2014) — Effectiveness of cognitive tutor algebra I at scale (RAND evaluation)"
input_schema:
  required:
    - field: "skill_domain"
      type: "string"
      description: "The specific domain of knowledge or skill to be tutored — what students need to learn to do"
    - field: "knowledge_components"
      type: "string"
      description: "The specific pieces of knowledge or subskills that make up competence in this domain — the building blocks of mastery"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "common_errors"
      type: "string"
      description: "The most frequent errors students make and the misconceptions that produce them"
    - field: "mastery_threshold"
      type: "string"
      description: "What counts as mastery — how many consecutive correct applications before a knowledge component is considered learned"
    - field: "system_context"
      type: "string"
      description: "Whether this is for an AI tutoring system, a teacher-delivered model, or a hybrid"
output_schema:
  type: "object"
  fields:
    - field: "cognitive_model"
      type: "object"
      description: "The knowledge component map — what students need to know and how the components relate"
    - field: "knowledge_tracing_design"
      type: "object"
      description: "How to track student mastery of each knowledge component — the tracing algorithm and mastery criteria"
    - field: "problem_selection_logic"
      type: "object"
      description: "How to choose which problem to present next based on the student's current knowledge state"
    - field: "feedback_architecture"
      type: "object"
      description: "What feedback to provide at each step, linked to specific knowledge components and error types"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "intelligent-tutoring-dialogue-designer"
  - "formative-assessment-loop-designer"
  - "worked-example-to-problem-solving-transition-designer"
  - "technological-pedagogical-content-knowledge-developer"
teacher_time: "6 minutes"
tags: ["cognitive-tutor", "ACT-R", "Anderson", "knowledge-tracing", "Corbett", "mastery", "ITS", "adaptive"]
---
# 认知辅导架构设计师

## 此技能的作用

为辅导系统设计认知架构，包括知识组件模型、知识追踪算法、题目选择逻辑和反馈架构；这些部分共同构成自适应学习体验。此技能基于 Anderson 等人于 1995 年在卡内基梅隆大学开发的认知辅导架构，该架构至今仍是经过实证验证最充分的智能辅导方法之一。认知辅导方法建立在 ACT-R 理论之上：该理论认为，任何领域中的专长都可以分解为一组离散的“知识组件”（产生式规则），这些组件可以分别学习、练习和追踪。系统会维护每名学生已掌握知识的模型（知识追踪），选择针对学生尚未掌握的知识组件的题目，并在错误发生时提供步骤级反馈。Pane 等人（2014）开展了一项大规模 RAND 评估，发现与传统教学相比，Cognitive Tutor Algebra I 能够改善学生的学习成果。AI 在这里尤其有价值，因为该架构要求实时追踪每名学生在多个组件上的知识状态；对于管理 30 名学生的教师而言，这项任务虽然在计算上很简单，但在人力上无法实现。

## 证据基础

Anderson 等人（1995）基于 ACT-R（Adaptive Control of Thought—Rational，自适应思想控制——理性）开发了 Cognitive Tutor。ACT-R 是一种认知架构，将人类学习建模为产生式规则（IF-THEN 知识组件）的习得过程。例如，在代数中，一个知识组件可能是：“如果方程的形式为 ax + b = c，那么第一步应从两边同时减去 b。”关键洞见在于：复杂技能可以分解为有限数量的此类组件，而每个组件都可以被独立追踪和辅导。Cognitive Tutor 维护一个学生模型，用于估计每名学生掌握每个知识组件的概率，并选择针对最薄弱组件的题目。Corbett & Anderson（1995）开发了知识追踪（KT），这是一种用于追踪学生掌握程度的算法。KT 使用隐马尔可夫模型：每个知识组件要么处于“已学习”状态，要么处于“未学习”状态（隐状态）。每当学生尝试一道涉及某个知识组件的题目步骤时，系统都会观察该步骤是否正确（可观测结果），并更新对该组件是否已被学习的概率估计。模型由四个参数控制：P(L₀)——学生在接受教学前已掌握该组件的概率；P(T)——学生在每次学习机会中掌握该组件的概率；P(G)——学生在尚未掌握该组件的情况下猜对的概率；以及 P(S)——学生尽管已经掌握该组件却发生失误的概率。当 P(Lₙ) 超过某一阈值（通常为 0.95）时，该组件被视为已掌握。Koedinger & Aleven（2007）在认知辅导系统的背景下阐述了“辅助困境”：提供过多辅助（即时提示、步骤级指导）可能会导致学生学习辅导系统的界面，而不是领域知识。他们发现，最佳辅助程度取决于学生当前的知识状态——学习困难的学生从更多辅助中受益，而知识水平较高的学生则从较少辅助中受益。Ritter 等人（2007）报告了 Cognitive Tutor Algebra 在超过 2,600 所学校中的部署情况，证明了该方法具备可扩展性。Pane 等人（2014）开展了一项由 RAND 资助的 Cognitive Tutor Algebra I 随机对照试验，发现该系统对代数成绩具有幅度 modest 但显著的积极影响，尤其是对于按照系统设计使用该系统（忠实遵循预期模型）的学生。

## 输入架构

教师必须提供：
- **技能领域：** 学生需要学习的内容。*例如：“解线性方程——从一步方程（x + 5 = 12）到两步方程（3x + 5 = 20），再到两边都有变量的多步方程（4x + 3 = 2x + 11）”/“配平化学方程式”/“根据原始数据构建和解读直方图”*
- **知识组件：** 构成技能的基本模块。*例如：“对于线性方程：(1) 识别未知数，（2）逆运算（加法 ↔ 减法），（3）逆运算（乘法 ↔ 除法），（4）运算顺序（先消去加法/减法，再消去乘法/除法），（5）对等式两边应用相同的运算，（6）合并同类项，（7）将变量移到等式一边”/“对于直方图：(1) 识别连续数据，（2）选择恰当的组距，（3）计算每个组距的频数，（4）设置坐标轴比例，（5）绘制无间隔的柱形，（6）从直方图中读取数值，（7）比较分布”*

可选项（如果有，可能由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **常见错误：** 常见错误及其原因
- **掌握阈值：** 判定掌握的标准
- **系统上下文：** AI、教师授课或混合模式

## 提示词

```
You are an expert in cognitive tutoring architecture, with deep knowledge of Anderson et al.'s (1995) ACT-R-based Cognitive Tutor framework, Corbett & Anderson's (1995) knowledge tracing algorithm, Koedinger & Aleven's (2007) assistance dilemma research, Ritter et al.'s (2007) large-scale deployment data, and Pane et al.'s (2014) RAND evaluation. You understand that effective tutoring systems are built on a precise cognitive model — a decomposition of the target skill into knowledge components that can be individually tracked, practised, and mastered. You know that the quality of the cognitive model determines the quality of the tutoring: a poorly decomposed skill set leads to misdiagnosis, inappropriate problem selection, and ineffective feedback.

CRITICAL PRINCIPLES:
- **Decompose into TESTABLE knowledge components.** Each component must be independently observable — there must be a problem step where the component is required and where success or failure reveals whether the student has learned it. If you can't design a problem step that isolates a component, the decomposition is too coarse.
- **Knowledge components should be at the GRAIN SIZE of learning.** Too coarse (e.g., "can solve equations") and you can't diagnose specific weaknesses. Too fine (e.g., "can subtract 7 from 22") and you're tracking arithmetic, not algebra. The right grain size is the level at which students make conceptually meaningful errors.
- **Map the dependency structure.** Some components depend on others — you can't apply an operation to both sides if you don't know the inverse operation. The problem selection logic should respect these dependencies: don't present problems requiring Component 5 if the student hasn't mastered Components 1-4.
- **Link errors to components.** Each common error should be traceable to a specific knowledge component that has not been mastered. If a student subtracts from only one side, that's a failure of the "apply to both sides" component, not a general "equation" failure. The feedback should target the specific component.
- **Mastery is probabilistic, not binary.** Knowledge tracing gives a PROBABILITY of mastery, not a certainty. A student who gets 3 in a row right might still be guessing (P(G) > 0). A student who gets one wrong might have slipped (P(S) > 0). The system should require consistent performance before declaring mastery.

Your task is to design a cognitive tutoring architecture for:

**Skill domain:** {{skill_domain}}
**Knowledge components:** {{knowledge_components}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the domain.
**Common errors:** {{common_errors}} — if not provided, identify the most likely errors based on the knowledge components.
**Mastery threshold:** {{mastery_threshold}} — if not provided, use P(Lₙ) ≥ 0.95 (approximately 3-4 consecutive correct applications).
**System context:** {{system_context}} — if not provided, design for an AI tutoring system.

Return your output in this exact format:

## Cognitive Tutoring Architecture: [Skill Domain]

**Domain:** [What students are learning]
**Knowledge components:** [How many, at what grain size]
**Architecture basis:** [ACT-R / knowledge tracing — cite the specific principles used]

### Knowledge Component Map

[Complete map of all knowledge components, their descriptions, their dependencies, and the observable evidence of mastery for each]

| KC ID | Knowledge Component | Description | Depends On | Evidence of Mastery | Common Error |
|---|---|---|---|---|---|
| [ID] | [Name] | [What the student knows/can do] | [Prerequisites] | [What correct performance looks like] | [What incorrect performance looks like] |

### Dependency Graph

[Visual or textual representation of which components must be mastered before others can be addressed]

### Knowledge Tracing Design

[How the system tracks mastery — the algorithm, parameters, and mastery threshold]

### Problem Selection Logic

[How the system chooses the next problem — which components to target, how to combine components, and how difficulty increases]

### Feedback Architecture

[What feedback to provide for each error type — linked to specific knowledge components]

### Example Tutoring Sequence

[A realistic sequence showing how the system would tutor a student through 5-8 problems, adapting based on their responses]

**Self-check before returning output:** Verify that (a) each knowledge component is independently testable, (b) components are at the right grain size, (c) dependencies are mapped, (d) errors are linked to specific components, and (e) mastery is treated probabilistically.
```

## 示例输出

**场景：** *技能领域：“解一元一次方程——从一步方程（x + 5 = 12）到两步方程（3x + 5 = 20），再到方程两边都含有变量的方程（4x + 3 = 2x + 11）” / 知识组件：“(1) 识别未知数，(2) 加法/减法的逆运算，(3) 乘法/除法的逆运算，(4) 撤销运算的顺序，(5) 对等式两边执行运算，(6) 合并同类项，(7) 将变量移到一边” / 学生水平：“Year 8，正式学习代数的第一学期” / 学科领域：“数学” / 常见错误：“只从一边相减，错误的运算顺序（先除法再减法），不理解 3x 表示 3 × x，合并非同类项（将 3x + 5 相加得到 8x）”*

---

## 认知辅导架构：解一元一次方程

**领域：** 从一步方程到方程两边都含有变量的一元一次方程  
**知识组件：** 7 个，采用概念—程序粒度  
**架构基础：** ACT-R 产生式规则模型（Anderson 等，1995），结合贝叶斯知识追踪（Corbett & Anderson，1995）

### 知识组件映射

| KC ID | 知识组件 | 描述 | 依赖项 | 掌握证据 | 常见错误 |
|---|---|---|---|---|---|
| KC1 | 识别未知数 | 理解 x（或任意字母）表示一个未知数值，而方程将揭示该数值 | 无 | 学生能够说出“我们需要求出 x 的值” | 学生把 x 当作标签而不是未知数值；不经过任何代数步骤就试图通过观察直接“解题” |
| KC2 | 加法/减法的逆运算 | 知道 +b 的逆运算是 −b，反之亦然 | KC1 | 给定 x + 5 = 12 时，学生能够识别出“减去 5”是正确的运算 | 学生用加法代替减法（或反之）；将 5 加到 12 上而不是减去 5 |
| KC3 | 乘法/除法的逆运算 | 知道 ×a 的逆运算是 ÷a，反之亦然；理解 3x 表示 3 × x | KC1 | 给定 3x = 15 时，学生能够识别出“除以 3”是正确的运算 | 学生用减法代替除以 3；不理解 3x = 3 × x |
| KC4 | 运算顺序 | 撤销运算时，逆向遵循 BIDMAS 的顺序——先撤销加法/减法，再撤销乘法/除法 | KC2, KC3 | 给定 3x + 5 = 20 时，学生先减去 5，再除以 3 | 学生先除以 3，得到 (3x + 5)/3 = 20/3——代数上正确，但更难化简；或者只将 3x 除以 3，从而产生错误 |
| KC5 | 等式两边 | 在一边执行的任何运算，都必须在另一边执行 | KC2, KC3 | 学生写出“3x + 5 − 5 = 20 − 5”（表明在**两边**都进行了减法） | 学生写出“3x = 20 − 5”，却没有从左边减去 5；或者从左边减去 5，却没有从右边减去 5 |
| KC6 | 合并同类项 | 能够通过合并含有相同变量的项（3x + 2x = 5x）和常数项（7 + 3 = 10）来化简表达式，并且知道**不能**合并非同类项 | KC1 | 给定 3x + 2x + 5 = 20 时，学生能够正确化简为 5x + 5 = 20 | 学生合并非同类项：3x + 5 = 8x；或者在应当合并同类项时没有进行合并 |
| KC7 | 合并变量项 | 能够通过对变量项应用逆运算，将变量项移到等式的一边 | KC2, KC5 | 给定 4x + 3 = 2x + 11 时，学生从等式两边减去 2x，得到 2x + 3 = 11 | 学生在应当减去变量时却减去数字；或者试图从同一边同时减去 4x 和 2x |

### 依赖关系图

```
KC1 (Identify unknown)
├── KC2 (Inverse +/−)
│   ├── KC4 (Operation order) ← also requires KC3
│   └── KC5 (Both sides) ← also requires KC3
├── KC3 (Inverse ×/÷)
│   ├── KC4 (Operation order) ← also requires KC2
│   └── KC5 (Both sides) ← also requires KC2
└── KC6 (Combining like terms)

KC5 (Both sides) + KC2 → KC7 (Collecting variables)
KC4 + KC5 + KC6 → Multi-step equation competence
KC4 + KC5 + KC6 + KC7 → Variables-on-both-sides competence
```

### 知识追踪设计

**算法：** 贝叶斯知识追踪（Corbett & Anderson，1995）

**参数（初始值，按领域校准）：**

| 参数 | 值 | 含义 |
|---|---|---|
| P(L₀) | 0.10 | 学生在接受任何教学前已经掌握该组件的概率（对于新接触的代数概念而言较低） |
| P(T) | 0.20 | 学生在每次练习机会中学会该组件的概率 |
| P(G) | 0.15 | 学生在尚未掌握的情况下猜对的概率（对于多步代数而言较低） |
| P(S) | 0.10 | 学生虽然掌握了知识但仍出错的概率 |
| 掌握阈值 | 0.95 | 当 P(Lₙ) 达到该值时，认为学生已经掌握该组件 |

**更新规则：** 在每道题中涉及 KC_i 的步骤后：
- 如果正确：P(Lₙ) = P(Lₙ₋₁)(1 - P(S)) / [P(Lₙ₋₁)(1 - P(S)) + (1 - P(Lₙ₋₁))P(G)] — 然后应用学习：P(Lₙ) = P(Lₙ) + (1 - P(Lₙ))P(T)
- 如果错误：P(Lₙ) = P(Lₙ₋₁)P(S) / [P(Lₙ₋₁)P(S) + (1 - P(Lₙ₋₁))(1 - P(G))] — 然后应用学习：P(Lₙ) = P(Lₙ) + (1 - P(Lₙ))P(T)

**通俗来说：** 每当学生尝试一个步骤时，系统都会更新其对学生是否掌握相关知识组件的判断。答对会提高掌握程度的估计值；答错会降低该估计值。但系统会考虑到幸运猜对（P(G)）和粗心失误（P(S)），因此，一次正确作答并不能证明学生已经掌握，而一次错误也不能证明学生完全不会。通常需要连续正确应用约 3-4 次，才能达到 0.95 的掌握阈值。

### 题目选择逻辑

**规则 1：遵循依赖关系。** 如果学生尚未掌握所有前置 KC，则绝不呈现要求 KC_n 的题目。

**规则 2：针对最薄弱的未掌握组件。** 在所有前置条件均已满足的组件中，选择涉及 P(Lₙ) 最低的知识组件的题目。

**规则 3：逐步组合组件。** 从只要求 1-2 个 KC 的题目开始。随着组件逐渐掌握，引入同时要求 3-4 个 KC 的题目。这样可以控制认知负荷。

**规则 4：交错练习已掌握的组件。** 偶尔加入要求使用此前已掌握 KC 的步骤，以防止遗忘并验证掌握状态是否保持。

**题目难度进阶：**

| 级别 | 所需 KC | 示例题目 | 何时呈现 |
|---|---|---|---|
| 1 | KC1, KC2 | x + 5 = 12 | 开始时 |
| 2 | KC1, KC3 | 3x = 15 | KC2 掌握后 |
| 3 | KC1, KC2, KC3, KC4, KC5 | 3x + 5 = 20 | KC2、KC3 掌握后 |
| 4 | KC1-KC6 | 3x + 2x + 5 = 20 | KC4、KC5 掌握后 |
| 5 | KC1-KC7 | 4x + 3 = 2x + 11 | KC4、KC5、KC6 掌握后 |

### 反馈架构

| 错误模式 | 可能的知识成分（KC）故障 | 反馈 |
|---|---|---|
| 学生试图通过观察直接猜出 x | KC1 | “这个方程需要代数步骤，而不是猜测。你的目标是让 x 单独位于一边。什么运算会有帮助？” |
| 学生进行加法而不是减法（或反之） | KC2 | “你在等式两边都加了 5。但 x 已经加上了 5。加上 5 的**相反运算**是什么？” |
| 学生从 3x 中减去 3，而不是进行除法 | KC3 | “记住：3x 表示 3 乘以 x。要撤销乘法，你需要……？” |
| 在 3x + 5 = 20 中，学生先进行除法再进行减法 | KC4 | “你直接除以了 3。但 +5 阻碍了运算。先尝试撤销加法——这正好与表达式构建时的顺序相反。” |
| 学生只对等式的一边进行运算 | KC5 | “你从左边减去了 5。右边呢？方程就像一个平衡的天平——对一边做什么，也必须对另一边做什么。” |
| 学生写出 3x + 5 = 8x | KC6 | “你把 3x 和 5 相加得到了 8x。但 3x 和 5 是不同类型的项——一个含有 x，而另一个不含有。只有类型**相同**的项才能合并。” |
| 学生对移动变量感到困惑 | KC7 | “等式两边都有 x：4x + 3 = 2x + 11。要解这个方程，先把所有含 x 的项移到**同一边**。你可以怎样从右边消去 2x？” |

### 示例辅导序列

一名学生开始时，所有成分的 P(L₀) 都为 0.10。

**问题 1：** x + 8 = 15（测试 KC1、KC2、KC5）
- 学生写出：x = 15 - 8 = 7 ✓
- KC1：P(L) → 0.28，KC2：P(L) → 0.28，KC5：P(L) → 0.28

**问题 2：** x - 3 = 10（测试 KC1、KC2、KC5——相反方向）
- 学生写出：x = 10 + 3 = 13 ✓
- KC1：P(L) → 0.51，KC2：P(L) → 0.51，KC5：P(L) → 0.51

**问题 3：** x + 12 = 5（测试 KC1、KC2、KC5——结果为负数）
- 学生写出：x = 5 + 12 = 17 ✗（KC2 故障——进行加法而不是减法）
- 系统反馈：“你把 12 加到了 5 上。但方程表示 x 加上 12 等于 5。要撤销 +12，你需要进行减法，而不是加法。”
- KC2：P(L) → 0.33（降低），KC5：不更新（错误属于 KC2，而不是 KC5）

**问题 4：** x + 12 = 5（同一问题，重试）
- 学生写出：x = 5 - 12 = -7 ✓
- KC2：P(L) → 0.53

**问题 5：** 4x = 20（测试 KC1、KC3——乘法/除法，新的 KC）
- 学生写出：x = 20 ÷ 4 = 5 ✓
- KC3：P(L) → 0.28

**问题 6：** 7x = 21（测试 KC1、KC3）
- 学生写出：x = 21 - 7 = 14 ✗（KC3 故障——进行减法而不是除法）
- 系统反馈：“7x 表示 7 乘以 x。要撤销乘以 7 的运算，你需要进行除法，而不是减法。”
- KC3：P(L) → 0.17

[序列继续：当 KC2 和 KC3 达到熟练程度（约 0.95）后，系统会引入需要 KC4 和 KC5 的两步方程……]

---

## 已知局限

1. **知识成分的分解是一门艺术，而不是一门科学。** 不同的研究人员会以不同方式分解同一个领域。Anderson 等人的 ACT-R 框架提供了理论指导，但关于粒度、成分边界和依赖结构的实际决策，需要领域专业知识和反复测试。上面的分解是一个有原则的起点，并不是经过验证的认知模型。

2. **标准知识追踪假设知识状态是二元的。** Corbett 与 Anderson（1995）的模型假设每个 KC 要么处于“已掌握”状态，要么处于“未掌握”状态。实际上，知识存在于一个连续谱上：学生可能只是部分理解逆运算，在简单情境中能够正确应用，但在复杂情境中却会失败。更先进的模型（例如使用神经网络的深度知识追踪）能够处理这一点，但牺牲了可解释性。

3. **RAND 评估显示的效应量较为有限。** Pane 等人（2014）发现，Cognitive Tutor Algebra I 改善了学习结果，但效应量相对较小（实施第二年为 0.22）。其实际意义取决于具体情境：平均效应较小，可能掩盖了特定学生子群体中更大的效果。实施忠实度是一个重要的调节因素。

4. **认知导师最适合结构良好的领域。** 线性方程、化学式配平以及其他程序性领域，都可以清晰地分解为知识组件。结构不良的领域（如文章写作、历史分析和创造性任务）则难以进行这种分解。认知导师架构功能强大，但受领域限制。