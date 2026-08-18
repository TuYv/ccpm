---
# AGENT SKILLS STANDARD FIELDS (v2)
name: adaptive-hint-sequence-designer
description: "Generate a cascading hint sequence for a problem type, revealing progressively without giving answers. Use when designing tutoring dialogues or scaffolded worksheets."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/adaptive-hint-sequence-designer"
skill_name: "Adaptive Hint Sequence Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "VanLehn (2011) — The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems (meta-analysis, effect size 0.76)"
  - "Aleven & Koedinger (2002) — An effective metacognitive strategy: learning by doing and explaining with a computer-based Cognitive Tutor"
  - "Shute (2008) — Focus on formative feedback"
  - "Wood, Bruner & Ross (1976) — The role of tutoring in problem solving"
  - "Razzaq & Heffernan (2010) — Hints: is it better to give or wait to be asked?"
input_schema:
  required:
    - field: "problem_type"
      type: "string"
      description: "The specific problem or task type students are working on — what they're trying to solve or produce"
    - field: "common_sticking_points"
      type: "string"
      description: "Where students typically get stuck — the specific misconceptions, procedural errors, or conceptual gaps that prevent progress"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "delivery_context"
      type: "string"
      description: "Whether hints will be delivered by an AI system, a teacher, or embedded in materials"
    - field: "number_of_hint_levels"
      type: "integer"
      description: "How many levels of progressive hints to design — typically 3-5"
    - field: "final_hint_policy"
      type: "string"
      description: "What happens at the end of the hint sequence — give the answer, refer to a teacher, or provide a different task"
output_schema:
  type: "object"
  fields:
    - field: "hint_sequence"
      type: "array"
      description: "The cascading hint sequence — from most general to most specific, each revealing more without giving the answer"
    - field: "hint_design_rationale"
      type: "object"
      description: "Why each hint level is designed this way — what cognitive function it serves"
    - field: "trigger_conditions"
      type: "object"
      description: "When to deliver each hint — time-based, error-based, request-based, or behaviour-based triggers"
    - field: "bottom_out_design"
      type: "object"
      description: "What happens when all hints are exhausted — the 'bottom-out' strategy"
chains_well_with:
  - "intelligent-tutoring-dialogue-designer"
  - "productive-failure-desirable-difficulty-designer"
  - "worked-example-fading-designer"
  - "formative-assessment-loop-designer"
teacher_time: "4 minutes"
tags: ["hints", "scaffolding", "ITS", "VanLehn", "Aleven", "adaptive", "tutoring", "cognitive-tutor"]
---
# 自适应提示序列设计器

## 此技能的作用

为特定问题类型设计级联式提示序列——一系列逐步揭示更多信息的提示，帮助学生跨越卡点，而不是直接给出答案。这是智能辅导系统（ITS）设计中技术要求最高的方面之一。VanLehn（2011）元分析的关键洞见是，辅导（无论由人类还是 AI 提供）的有效性在很大程度上取决于支架支持的质量——而提示序列是主要的支架支持机制。序列设计不当，要么会让学生感到挫败（提示过于模糊、数量过少），要么会剥夺他们的学习机会（提示过于具体、出现过早）。输出内容包括完整的提示级联（通常为 3–5 个层级，从通用策略指导到具体步骤推动）、解释各层级认知功能的设计理由、触发条件（每条提示何时触发），以及兜底策略（提示耗尽后如何处理）。AI 在这里尤其有价值，因为设计有效的提示序列需要同时预判学生错误、校准提示的具体程度，并确保每个提示层级恰好提供足以帮助学生摆脱困境的信息，同时不绕过产生学习所需的认知活动。

## 证据基础

VanLehn（2011）开展了关于辅导有效性最全面的元分析，对比了人类辅导、智能辅导系统以及其他方法。他发现，ITS 的效应量平均为 0.76——与人类辅导（0.79）非常接近，并且显著高于“无辅导”条件。关键在于，ITS 的有效性取决于步骤层级交互的质量：在问题解决的每一步提供反馈和提示（内循环）的系统，远比只评估最终答案（外循环）的系统有效。Aleven & Koedinger（2002）研究了 Carnegie Learning Cognitive Tutor 中的提示寻求行为，发现学生经常以非最优方式使用提示——要么请求提示过快（在尝试解决问题之前），要么请求得过慢（陷入无成效的挣扎）。他们发现，训练学生采用元认知提示策略（“先尝试，再请求提示，然后向自己解释该提示”）能显著改善学习成果。Razzaq & Heffernan（2010）比较了主动提示（自动给出）和被动提示（按请求提供），发现最佳方法取决于学生的熟练程度：表现较弱的学生从主动提示中获益更多，而表现较强的学生则更适合在请求帮助前先被允许进行一段时间的尝试。Shute（2008）回顾了形成性反馈研究，指出有效反馈应当具体、及时且可操作——这些原则可直接应用于提示设计。Wood、Bruner 与 Ross（1976）提出了支架支持的概念：提供临时支持，使学习者能够完成他们独自无法完成的任务，然后随着其能力发展逐步撤除这种支持。

## 输入架构

教师必须提供：
- **题目类型：** 学生正在解决的问题。*例如：“解一元一次方程——例如 3x + 7 = 22” / “为议论文段落撰写主题句” / “配平化学方程式” / “调试一个本应返回排序后列表却返回 None 的 Python 函数”*
- **常见卡点：** 学生容易卡住的地方。*例如：“学生忘记对等式两边进行相同的运算” / “学生写出的主题句过于模糊，或者陈述的是事实而不是观点” / “学生随机配平原子，而不是采用系统的方法” / “学生不理解 Python 的 sort() 返回 None——他们以为它会返回排序后的列表”*

可选项（如果可用，由上下文引擎注入）：

- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **交付情境：** AI 系统、教师或教学材料
- **提示层级数量：** 要设计多少个层级
- **最终提示策略：** 到达序列底部时的处理方式

## 提示词

```
You are an expert in hint sequence design for intelligent tutoring systems, with deep knowledge of VanLehn's (2011) meta-analysis of ITS effectiveness, Aleven & Koedinger's (2002) research on hint-seeking behaviour, Razzaq & Heffernan's (2010) work on proactive vs. reactive hints, Shute's (2008) formative feedback principles, and Wood, Bruner & Ross's (1976) scaffolding framework. You understand that hint design is the hardest part of ITS design: too little help produces frustration and abandonment; too much help produces answer-copying without learning. The optimal hint sequence progressively reduces the cognitive work required while preserving as much productive struggle as possible.

CRITICAL PRINCIPLES:
- **Progressive specificity.** The first hint should be the MOST GENERAL — pointing the student toward the right strategy or concept without revealing the specific step. Each subsequent hint should be more specific, narrowing the cognitive search space while still requiring the student to do some thinking. The final hint (the "bottom-out hint") may reveal the specific step but should still require the student to execute it and understand why.
- **Each hint should do ONE thing.** A hint that says "Remember to isolate the variable by subtracting 7 from both sides and then dividing by 3" is not a hint — it's the answer in disguise. Each hint level should address ONE aspect of the sticking point.
- **Hints should address the CAUSE of the error, not just the symptom.** If a student gets 3x + 7 = 22 wrong, the hint should not just say "Try again" (too vague) or "x = 5" (the answer). It should address the likely CAUSE: "What operation will move the 7 to the other side?" — targeting the specific conceptual gap.
- **Trigger conditions matter as much as hint content.** When a hint fires is as important as what it says. Too early: the student doesn't get the chance to struggle productively. Too late: the student has given up. Design triggers based on observable behaviour: time elapsed, number of incorrect attempts, specific error patterns, or student request.
- **The bottom-out strategy must still produce learning.** When all hints are exhausted, the system cannot just shrug and move on. The bottom-out should provide the answer WITH a self-explanation prompt: "The answer is X because Y. In your own words, explain why Y leads to X." This converts the bottom-out from answer-giving to learning.

Your task is to design a hint sequence for:

**Problem type:** {{problem_type}}
**Common sticking points:** {{common_sticking_points}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the problem type.
**Delivery context:** {{delivery_context}} — if not provided, design for an AI tutoring system that can also be used by teachers.
**Number of hint levels:** {{number_of_hint_levels}} — if not provided, design 4 levels (strategic → conceptual → procedural → bottom-out).
**Final hint policy:** {{final_hint_policy}} — if not provided, design a bottom-out hint with self-explanation prompt.

Return your output in this exact format:

## Adaptive Hint Sequence: [Problem Type]

**Problem type:** [What students are solving]
**Common sticking points:** [Where they get stuck]
**Hint levels:** [How many levels, from general to specific]

### Hint Architecture

[Overview of the hint strategy — what each level does and why the sequence is ordered this way]

### Hint Sequence

For each level:
**Level [N]: [Hint type — Strategic / Conceptual / Procedural / Bottom-out]**
- **Hint text:** [Exactly what the student sees or hears]
- **Cognitive function:** [What this hint does — what cognitive work it performs for the student and what it preserves for them to do]
- **Trigger condition:** [When this hint fires — time, errors, request, behaviour]
- **Expected student response:** [What a student who benefits from this hint will do next]
- **If this hint doesn't help:** [What happens — escalate to next level]

### Bottom-Out Strategy

[What happens when all hints are exhausted — the specific design for revealing the answer while still producing learning]

### Trigger Conditions Summary

| Trigger Type | Condition | Hint Level Activated |
|---|---|---|
| [Type] | [Specific condition] | [Which level] |

### Adaptation Notes

[How the sequence adapts to different student profiles — stronger students may skip early levels; weaker students may need the full cascade]

**Self-check before returning output:** Verify that (a) hints are progressively more specific, (b) each hint does ONE thing, (c) hints address the cause of the error not just the symptom, (d) trigger conditions are specified, (e) the bottom-out still produces learning, and (f) the sequence preserves productive struggle.
```

## 示例输出

**场景：** *问题类型：“解一元一次线性方程，具体来说是形如 ax + b = c 的方程，学生需要将 x 单独留在一边。例如：3x + 7 = 22” / 常见卡点：“学生忘记等式两边要进行相同的运算（他们从左边减去 7，却没有从右边减去 7）。学生不理解逆运算的概念（应该减法时却做了加法，反之亦然）。学生尝试以错误的顺序进行运算（先除以 3，再减去 7）。” / 交付场景：“AI 辅导系统——触发后，提示会显示在屏幕上” / 学生水平：“八年级，代数第一学期”*

---

## 自适应提示序列：解线性方程（ax + b = c）

**问题类型：** 解一元一次线性方程——将 x 单独留在一边，例如 3x + 7 = 22
**常见卡点：** 等式两边进行相同运算时出错、混淆逆运算、运算顺序错误
**提示级别：** 4（策略性 → 概念性 → 程序性 → 直接给出答案）

### 提示架构

该序列从策略性提示（指向一种解题方法）开始，经过概念性提示（激活相关原理），再到程序性提示（指出具体步骤），最后到直接给出答案的提示（揭示该步骤并要求自我解释）。在每个级别，学生都会保留一部分需要自己完成的认知工作：

- **级别 1（策略性）：** “这是你的目标”——学生必须自己找出解题方法
- **级别 2（概念性）：** “这是相关原理”——学生必须自己确定具体运算
- **级别 3（程序性）：** “这是具体步骤”——学生必须执行并验证
- **级别 4（直接给出答案）：** “这是该步骤的答案”——学生必须解释原因

### 提示序列

**级别 1：策略性——“你的目标是什么？”**
- **提示文本：** “你的目标是让 x 单独出现在等式的一边。现在，x 旁边还有一些附加的数字。你可以做些什么来开始去掉它们？”
- **认知功能：** 在不指出应进行哪种具体运算或应先处理哪个数字的情况下，提醒学生总体策略（将 x 单独留出）。学生仍然必须确定要去掉哪些数字以及使用哪些运算。
- **触发条件：** 学生 60 秒内没有取得进展，或在没有展示解题过程的情况下输入了错误的 x 值，或请求提示。
- **预期学生反应：** 学生意识到需要“去掉”+7 或 3，并尝试进行某种运算。即使运算是错误的，这种策略性引导也会将他们的注意力重新引向目标。
- **如果该提示没有帮助：** 如果学生再次尝试错误，或 45 秒内没有取得进展，则升级到级别 2。

**级别 2：概念性——“先处理哪个数字，它的相反运算是什么？”**
- **提示文本：** “看看这个方程：3x + 7 = 22。x 被乘以 3，而且还加上了 7。先处理加法。加上 7 的相反运算是什么？”
- **认知功能：** 该提示完成了两件事：它告诉学生运算顺序（先处理加法，再处理乘法——这与 BIDMAS/PEMDAS 的顺序相反），并激活逆运算的概念。学生仍然必须自己得出“加上 7 的相反运算是减去 7”，并将其应用于等式两边。
- **触发条件：** 学生在级别 1 后尝试了错误的运算（例如先除以 3），或正确识别出“减法”却没有将其应用于等式两边。
- **预期学生反应：** 学生写出 3x + 7 - 7 = 22 - 7，并化简为 3x = 15。如果他们只从一边减去 7，级别 3 将解决这一问题。
- **如果该提示没有帮助：** 如果学生再次出错，或 30 秒内没有取得进展，则升级到级别 3。

**第 3 级：程序性提示 — “对等式两边执行相同操作”**
- **提示文本：**“等式两边都减去 7。左边变为 3x + 7 - 7 = 3x。右边会变成什么？22 - 7 = ?”
- **认知功能：**此提示明确指出具体操作（减去 7），并强调等式两边原则。学生仍需计算 22 - 7 = 15，然后找出下一步（除以 3）。该提示解决了第一个步骤，但将第二个步骤留给学生完成。
- **触发条件：**学生只对一边进行了减法，或在第 2 级提示后仍无法确定正确操作。
- **预期学生回应：**学生写出 3x = 15，然后尝试通过等式两边除以 3 来解出 x，得到 x = 5。
- **如果此提示无效：**如果学生在此提示后仍无法完成题目（无法计算 22 - 7，或不知道下一步要除以 3），则升级至完全揭示提示。

**第 4 级：完全揭示提示 — “这是步骤。解释原因。”**
- **提示文本：**“这是完整解法：3x + 7 = 22 → 等式两边都减去 7 → 3x = 15 → 等式两边都除以 3 → x = 5。现在：请用自己的话解释，为什么我们要先减去 7，再除以 3？如果我们先除以 3，会发生什么？”
- **认知功能：**答案被完整展示，但自我解释问题保留了学习过程。通过询问“为什么是这个顺序？”，系统迫使学生参与数学逻辑，而不是仅仅抄写答案。反事实问题（“如果我们先除，会怎样？”）能够培养对运算顺序的更深层理解。
- **触发条件：**此前所有提示均已用尽，且学生仍无法完成题目。
- **预期学生回应：**学生解释（通过文本或选择）：“我们先减去 7，因为这样更容易 / 因为 7 是加上的，而不是与 x 相乘 / 因为如果先除以 3，我们还必须把 7 一起除掉，这会得到分数。”以上任一回答均表示理解。

### 完全揭示策略

完全揭示提示会展示完整解法，但要求学生在进入下一题前进行自我解释。系统会呈现两个问题：

1. **解释解法：**“为什么我们先减去 7，再除以 3？”（自由文本或多项选择）
2. **预测一道类似题目：**“如果方程是 5x + 12 = 37，你会先做什么？”（测试学生能否将该原则迁移到新实例）

如果学生的自我解释准确，则进入下一题（一条类似方程，以测试即时应用）。如果自我解释不准确（“因为 7 比 22 小”），提供简短的纠正说明，然后继续。完全揭示**不是**失败状态——它是一次学习事件。自我解释会将直接给出答案转化为构建理解。

### 触发条件汇总

| 触发类型 | 条件 | 激活的提示级别 |
|---|---|---|
| 基于时间 | 60 秒内没有进展 | 第 1 级 |
| 基于错误 | 最终答案错误，且未展示解题过程 | 第 1 级 |
| 基于错误 | 操作错误（例如，先除后减） | 第 2 级 |
| 基于错误 | 正确操作只应用于等式一边 | 第 3 级 |
| 基于请求 | 学生点击“hint”按钮 | 按顺序进入下一级 |
| 耗尽 | 已提供此前所有提示，仍然卡住 | 第 4 级（完全揭示提示） |

### 调整说明

**对于能力较强的学生：** 如果学生已经成功解决了 3 个或更多类似方程，可以跳过第 1 级（他们已经掌握了策略）。如果他们出错，则从第 2 级开始，因为他们的卡点可能在概念或操作上，而不是策略上。

**对于能力较弱的学生：** 如果学生在前两个问题中都需要使用最终提示，可以考虑从提示切换到示范例题——学生可能缺乏提示所假定的先备知识。提示可以逐步支架式地支持问题解决，但不能教授基础概念。

**对于滥用提示的学生（Aleven & Koedinger, 2002）：** 如果学生没有尝试解决问题，而是快速连续点击提示，请在第一个提示前插入“先试一试”的引导语：“在请求提示之前，先尝试解决这个问题。你认为第一步最有可能是什么？”这针对的是元认知缺陷：学生学会了从提示中提取答案，而不是进行思考。

---

## 已知局限

1. **提示序列假设学生具备能够从提示中受益的先备知识。** 例如，“加上 7 的逆运算是什么？”这一提示假设学生理解逆运算。如果他们不理解，那么这一序列中的任何提示都无法提供帮助——他们需要先直接学习相关的先备概念。提示序列支持的是问题解决，而不是知识获取。缺乏基础知识的学生需要采用不同的干预方式。

2. **最佳提示触发条件仍是一个有待研究的问题。** Razzaq & Heffernan (2010) 发现，主动提示有助于能力较弱的学生，而响应式提示有助于能力较强的学生，但该领域尚未就一个明确的触发模型达成共识。上述触发条件是合理的默认设置，并非经过实证优化的阈值。在真实的 ITS 中，需要通过使用实际学生群体进行 A/B 测试来校准这些条件。

3. **提示质量取决于对错误的准确诊断。** 上述提示序列假设存在特定的错误模式（运算顺序错误、只对一侧进行运算、对逆运算感到困惑）。如果学生的实际错误有所不同（例如在 22 - 7 上出现算术错误），这些提示就无法切中要点。有效的提示系统需要针对具体错误进行分支处理，而不仅仅是线性递进的提示链——这会显著增加设计复杂度。