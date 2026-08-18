---
# AGENT SKILLS STANDARD FIELDS (v2)
name: disciplinary-ai-literacy-sequence-designer
description: "Design a sequence where students compare AI's handling of the same question across disciplines, developing a mental model of where AI is reliable vs. distorting based on knowledge type."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/disciplinary-ai-literacy-sequence-designer"
skill_name: "Disciplinary AI Literacy Sequence Designer"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "moderate"
evidence_sources:
  - "Willingham (2007) — Critical thinking: why is it so hard to teach? (domain-specificity)"
  - "McPeck (1981) — Critical Thinking and Education: domain-specificity of critical thinking"
  - "Bernstein (1999) — Vertical and horizontal discourse: epistemic and social foundations of research contexts"
  - "Maton (2013) — Making semantic waves: a key to cumulative knowledge-building"
  - "Wineburg (2007) — Unnatural and essential: the nature of historical thinking"
input_schema:
  required:
    - field: "target_disciplines"
      type: "string"
      description: "Which two or three school subjects to compare — e.g. 'Biology and History', 'Maths, History, and Ethics', 'Physics and Literary Studies'"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "anchor_question_type"
      type: "string"
      description: "The type of question to translate across disciplines — causal (why did X happen?), evaluative (how good/significant is X?), procedural (how does X work?), or definitional (what is X?)"
    - field: "knowledge_type_focus"
      type: "string"
      description: "Which knowledge structure distinction to emphasise — sequential vs. horizontal (Bernstein), or factual vs. interpretive vs. dispositional"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject context if this is embedded in a specific unit"
    - field: "time_available"
      type: "string"
      description: "Time available for the sequence"
output_schema:
  type: "object"
  fields:
    - field: "knowledge_type_analysis"
      type: "object"
      description: "Analysis of how each target discipline structures knowledge — what types of claims are made, what counts as evidence, and why this predicts AI reliability"
    - field: "anchor_question_set"
      type: "array"
      description: "The same question type reformulated for each discipline — designed to be parallel enough for comparison but specific enough to reveal disciplinary differences"
    - field: "comparison_protocol"
      type: "object"
      description: "Structured protocol for comparing AI outputs across disciplines — what to look for, what to record, and how to analyse patterns"
    - field: "ai_reliability_framework"
      type: "object"
      description: "A student-facing framework for predicting AI reliability based on knowledge type — the generalisable insight the sequence builds toward"
    - field: "discussion_guide"
      type: "object"
      description: "Facilitation guide for class synthesis — building the disciplinary AI literacy framework from student findings"
chains_well_with:
  - "kud-knowledge-type-mapper"
  - "curriculum-knowledge-architecture-designer"
  - "ai-output-critical-audit-designer"
teacher_time: "5 minutes"
tags: ["AI-literacy", "disciplinary-thinking", "knowledge-types", "Bernstein", "Willingham", "domain-specificity", "AI-reliability"]
---
# 学科化 AI 素养序列设计器

## 此技能的作用

生成一个多课时教学序列，让学生系统地比较 AI 在不同学科中处理同一类型问题的方式，从而根据某一学科所生产的知识类型，建立关于 AI 在何处可靠、在何处会产生偏差的原则性心智模型。其核心洞见是：AI 的可靠性并不是均一的：它对已确立的事实性知识、存在争议的解释性主张、连续的程序性知识，以及关于价值与判断的倾向性知识，处理方式各不相同。一个理解了为什么 AI 通常能够可靠地解释光合作用，却不擅长解释法国大革命起因的学生，已经发展出可迁移的 AI 素养——这不只是一份“AI 会答错什么”的示例清单，而是一个能够进行预测的框架。该序列遵循 Maton (2013) 的语义波（semantic wave）逻辑：从具体的学科示例出发，构建一个抽象框架（AI 的可靠性会随知识类型而变化），然后回到具体的预测（“对于这项作业，在这门学科中，我预计 AI 的可靠程度为 X，因为……”）。该技能借鉴了 library 现有的知识架构框架：序列性知识（结构化、分层、累积——如数学或科学程序中的知识）往往能够得到 AI 的良好支持；水平性知识（多个彼此并不取代的有效框架——如历史编纂学或文学批评中的知识）则最容易被 AI 把真正的复杂性或存在争议的立场压平为虚假的确定性。

## 证据基础

Willingham (2007) 证明，批判性思维具有领域特异性——能够在历史学科中进行批判性思考的学生，不会自动将这种能力迁移到生物学中，因为不同学科对于什么算作良好证据有不同的标准。这对 AI 有一个直接的推论：AI 在一个领域中的局限，并不会自动迁移为对其他领域的预测。学科化 AI 素养要求逐个领域进行评估。McPeck (1981) 认为，批判性思维是由学科知识构成的——正如不了解科学推理就无法评估 AI 生成的科学输出一样，不了解历史学家如何论证，也就无法评估 AI 生成的历史学输出。这里的序列将这一点付诸实践：学生运用自己的学科知识作为评估工具。Bernstein (1999) 对垂直话语（具有层级性、累积性的知识结构，新知识会包含或取代旧知识——如自然科学中的知识）与水平话语（分段式的知识结构，彼此竞争的框架共存——如社会科学与人文学科中的知识）的区分，直接预示了 AI 的可靠性模式。AI 接受了人类知识生产完整分布的训练——在垂直话语领域中，这种分布会趋向于正确答案；在水平话语领域中，它会在彼此竞争的框架之间进行平均，可能将它们之间的区别压平。Maton (2013) 的语义波概念为教学设计提供了逻辑：该序列必须让学生在具体示例（AI 针对特定学科中特定主题给出的回答）与抽象原则（解释这一模式的知识类型框架）之间移动，然后再回到具体预测。Wineburg (2007) 将历史思维称为“非自然的”（“unnatural”），这提供了一个具体示例：学科专家所运用的技能并非直觉性的——必须对学生进行教学。同样的道理也适用于学科化 AI 素养：必须明确教会学生提出这样的问题：“这个学科正在生产什么类型的知识，而这对 AI 的可靠性意味着什么？”

## 输入架构

教师必须提供：
- **目标学科：** 要进行比较的学科。*例如：“生物学和历史” / “数学、历史和伦理学” / “物理学和文学研究” / “地理学和哲学”*
- **学生水平：** 年级。*例如：“11年级，正在学习多门科目以参加全国考试” / “12年级，A-level 学生”*

可选项（如果可用，则由上下文引擎注入）：
- **锚定问题类型：** 要跨学科翻译的问题类型
- **知识类型重点：** 要强调的知识结构区分
- **学科领域：** 如果嵌入特定课程单元中
- **可用时间：** 教学序列的时长

```text
You are an expert in curriculum theory and AI literacy pedagogy, with knowledge of Willingham's (2007) research on domain-specificity, McPeck's (1981) domain-specific critical thinking, Bernstein's (1999) vertical/horizontal discourse distinction, Maton's (2013) semantic wave concept, and Wineburg's (2007) work on disciplinary thinking. You understand that AI reliability is not uniform — it varies systematically by the type of knowledge a discipline produces. Students who understand this pattern can predict AI reliability, not just recall a list of examples.

CRITICAL PRINCIPLES:
- **The central concept is knowledge type, not subject difficulty.** The question is not "which subjects are harder?" but "what KIND of knowledge does each discipline produce?" Sequential/cumulative/vertical knowledge (where new knowledge builds on and displaces old) tends to be better served by AI than horizontal/interpretive knowledge (where competing frameworks coexist and the same evidence supports multiple conclusions).
- **AI flattens contested claims.** In disciplines with active interpretive debates (history, ethics, literary studies, social science), AI tends to present one interpretation as consensus, or to produce an averaged blend of competing views that misrepresents the genuine state of scholarly debate. Students in these disciplines need specific AI evaluation skills.
- **AI is reliable on the settled parts, unreliable on the contested parts.** Biology has both: the mechanism of photosynthesis is settled (AI is reliable); the ethical implications of genetic engineering are contested (AI less so). History has both: the date of the Battle of Hastings is settled; the causes and long-term significance are contested. The framework must be specific about this distinction, not just "AI is good at science."
- **The comparison drives the learning.** The sequence's power comes from comparing AI's outputs across disciplines side-by-side — not from abstract explanation. Students must run the queries, compare outputs, and build the framework from their findings.
- **The endpoint is a predictive framework.** The sequence should culminate in students being able to say "For this question, in this subject, AI is likely to be [reliable/unreliable] because [knowledge type reasoning]" — a transferable prediction, not just "AI was wrong about the French Revolution."

Your task is to design a disciplinary AI literacy comparison sequence for:

**Target disciplines:** {{target_disciplines}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**Anchor question type:** {{anchor_question_type}} — if not provided, use a causal question type ("Why did X happen?") as the anchor — it translates well across disciplines and reveals disciplinary differences clearly.
**Knowledge type focus:** {{knowledge_type_focus}} — if not provided, use Bernstein's (1999) vertical/horizontal distinction as the primary framework.
**Subject area:** {{subject_area}} — if not provided, design as a cross-curricular standalone sequence.
**Time available:** {{time_available}} — if not provided, design for two 45-minute lessons.

Return your output in this exact format:

## Disciplinary AI Literacy Sequence: [Disciplines]

**For:** [Student level]
**Disciplines compared:** [List]
**Anchor question type:** [Type]
**Knowledge type framework:** [Vertical/Horizontal / Factual-Interpretive-Dispositional / other]

### Knowledge Type Analysis

[For each target discipline:]

**[Discipline]:**
- **Knowledge structure:** [Vertical/horizontal; what kind of claims this discipline makes]
- **What counts as evidence here:** [How evidence works in this discipline]
- **Settled vs. contested:** [Examples of settled knowledge and contested knowledge in this discipline]
- **Predicted AI reliability:** [Where AI is likely reliable and where unreliable in this discipline, with reasoning]

### Anchor Question Set

[The same question type reformulated for each discipline — designed to be parallel for comparison]

**The question type:** [e.g. "Why did X happen?"]

**[Discipline 1]:** [Specific question in this discipline]
**[Discipline 2]:** [Specific question in this discipline]
**[Discipline 3]:** [Specific question in this discipline, if applicable]

**Why this question set works for comparison:** [What makes these questions equivalent enough to compare but different enough to reveal disciplinary AI reliability differences]

### Comparison Protocol

**Lesson 1 — Running the queries:**

[Step-by-step instructions for students to run each anchor question, record AI responses, and make initial observations]

**What to record for each discipline:**
- AI's position (if there is one) and certainty language
- Evidence cited (type, specificity, verifiability)
- Whether the AI acknowledges debate or presents its answer as settled
- What the AI does NOT say — what is missing

**Lesson 2 — Pattern analysis:**

[How students compare across disciplines — what to look for, what patterns to identify]

**Comparison questions:**
[4-5 questions that guide students from specific observations to the abstract framework]

### AI Reliability Framework

[The student-facing framework that the sequence builds toward — a way to predict AI reliability based on knowledge type]

**The reliability prediction principle:**
[A concise statement students can apply to future situations]

**The framework in practice:**
[A table or structured summary students can use as a reference]

| Knowledge type | AI tends to... | Because... | Example |
|---|---|---|---|
| [Type 1] | [AI behaviour] | [Reason] | [Example from the sequence] |
| [Type 2] | [AI behaviour] | [Reason] | [Example from the sequence] |

### Discussion Guide

**Activating findings (5 minutes):** [Opening question]
**Building the framework (10 minutes):** [How to move from specific discipline findings to the generalised knowledge-type framework]
**Testing the framework (5 minutes):** [A new discipline or question type students apply the framework to — a transfer test]
**The metacognitive close:** [The question that turns disciplinary AI literacy into a personal practice: "How will you use this framework in your own work?"]

**Self-check before returning output:** Verify that (a) the knowledge type analysis is specific to the stated disciplines, not generic, (b) the anchor questions are genuinely parallel while revealing disciplinary differences, (c) the comparison protocol generates findings students can analyse, not just collect, (d) the reliability framework is a genuine predictive tool, not a list of examples, and (e) the discussion guide includes a transfer test that asks students to apply the framework to a new case.
```

## 示例输出

**情境：** *目标学科：“生物学和历史” / 学生水平：“11 年级，同时学习这两门 GCSE 科目” / 锚定问题类型：“因果性——X 为什么会发生？” / 知识类型重点：“垂直话语与水平话语”*

---

## 学科 AI 素养学习序列：生物学和历史

**适用对象：** 11 年级 GCSE 学生  
**比较学科：** 生物学、历史  
**锚定问题类型：** 因果性——“X 为什么会发生？”  
**知识类型框架：** Bernstein 的垂直话语/水平话语区分

### 知识类型分析

**生物学：**
- **知识结构：** 很大程度上是垂直的——知识具有层级性和累积性。细胞学说涵盖了早期的观察结果；自然选择进化论涵盖了早期的物种分类。新发现会更新或扩展现有框架；它们通常不会与旧版本作为同样有效的替代方案并存。
- **什么算作证据：** 对照实验、可重复的观察、大型数据集的统计分析、同行评审。证据依据方法论和可重复性进行评估。
- **已确立与有争议的内容：** *已确立：* DNA 转录机制、有丝分裂过程、胰岛素在葡萄糖调节中的作用。*有争议：* 在特定病症中遗传因素与表观遗传因素的相对贡献；进化机制的某些方面；饮食与疾病之间的关系。
- **预测的 AI 可靠性：** 对于已经确立的机制（光合作用、细胞呼吸、遗传），可靠性较高。对于活跃的研究领域、群体层面的统计数据（训练数据可能已经过时），以及健康声明相关领域（证据确实存在混杂性，AI 可能会过度简化），可靠性较低。

**历史：**
- **知识结构：** 是水平的——多种历史学框架并存。Fischer 对第一次世界大战因果关系的意向主义解读与 Clark 的修正主义解读都作为当前有效的学术立场而共存；二者并不像进化论在生物学中证伪了创世论那样，其中一个“证伪”了另一个。历史学家提出的是相互竞争而非不断累积的解释框架。
- **什么算作证据：** 一手资料、档案文件以及著名历史学家的论证，通过来源考证、相互印证和语境化进行评估。历史中的证据不会像生物学中的实验那样“证明”观点，而是以不同程度支持各种解释。
- **已确立与有争议的内容：** *已确立：* 日期、事件顺序、文件的存在。*有争议：* 因果关系、重要性、责任、对动机的解释、长期后果。历史中几乎所有有趣的内容都存在争议。
- **预测的 AI 可靠性：** 对于事实回忆（日期、姓名、事件顺序、基本定义），可靠性较高。对于因果关系问题（AI 可能会将相互竞争的解释压平为单一且自信的答案）、重要性问题（确实存在争议），以及近期学术研究（训练数据偏向较早的来源），可靠性较低。

### 锚定问题集

**问题类型：**“X 为什么会发生？”

**生物学：**“为什么 1 型糖尿病患者需要注射胰岛素？”

**历史：**“德国为什么输掉了第一次世界大战？”

**为什么这组问题适合进行比较：**两者都是适合 GCSE 学习阶段的因果问题。生物学问题有一个已经确立的机制性答案（自身免疫对胰岛 β 细胞的破坏导致人体无法产生内源性胰岛素）。历史问题则没有一个已经确定的答案——历史学家仍在积极讨论军事战略、封锁、经济崩溃、政治革命和联盟动态各自所占的比重。将同一种问题类型应用于不同的知识结构，应当会产生不同的 AI 输出；研究这种差异有助于建立这一框架。

### 比较流程

**第 1 课——运行查询（45 分钟）：**

学生两人一组。每组分别在两个独立的对话中，向同一个 AI 工具提出两个核心问题。他们将回答记录在下面的追踪表中。

| | 生物学问题 | 历史问题 |
|---|---|---|
| AI 的回答（用 2-3 句话概括） | | |
| 确定性措辞（明确 / 有保留 / 非常不确定） | | |
| 引用的证据（类型和具体程度） | | |
| AI 是否承认存在争议，还是只呈现一种观点？ | | |
| 没有提到什么？ | | |

记录完成后：“阅读你们得到的两份 AI 回答。哪一份听起来更有把握？哪一份提供了更具体的证据？哪一份承认人们存在分歧？”

**第 2 课——分析模式（45 分钟）：**

两人小组将自己的追踪表与另一组进行比较。随后进行全班讨论：

**比较问题：**
- “对于生物学问题，AI 的回答大体上准确吗？你们怎么知道？”
- “对于历史问题，AI 提到了哪些历史学家或解释？它是否说明这些观点之间存在分歧，还是把一种观点当作正确答案来呈现？”
- “这两个问题都是‘为什么’问题。你们认为 AI 为什么会给出如此不同的回答？”
- “生物学的哪些特点使 AI 的因果回答更加可靠？历史的哪些特点使 AI 的因果回答不那么可靠？”
- “如果你正在写一篇论文，并且直接使用 AI 的回答——在哪个学科中这样做会更危险？为什么？”

### AI 可靠性框架

**可靠性预测原则：**
*在知识已经确定并且不断累积的领域，AI 最可靠。在知识确实存在争议的领域，AI 最不可靠——也就是在学者积极存在分歧、多种解释并存，或者正确答案取决于价值观和判断而非证据的领域。*

**框架的实际应用：**

| 知识类型 | AI 往往会…… | 因为…… | 本单元中的例子 |
|---|---|---|---|
| 已确定/纵向（机制、程序、已确立的事实） | 给出准确且自信的回答，并且可以进行验证 | 训练数据会趋向于一致的描述；专家之间意见一致 | “为什么糖尿病患者需要胰岛素？”——机制准确 |
| 有争议/横向（因果关系、重要性、解释） | 听起来很自信，却把争议压平；将一种立场呈现为共识 | 训练数据包含多种立场；AI 会生成混合观点，或默认最常见的观点 | “德国为什么输掉第一次世界大战？”——很可能会忽略 Fischer 学派与修正主义学派之间的争论 |
| 前沿或近期（新研究、时事） | 可能过时或不准确 | 训练数据存在截止时间；相关领域变化迅速 | 近期临床试验、当前政治事件 |
| 价值导向（伦理、美学、有争议的社会主张） | 生成泛泛而谈的回答，或采用“双方观点”的表述 | 训练目标是避免争议；价值问题在训练数据中没有确定答案 | 基因工程的伦理问题 |

### 讨论指南

**激活发现（5 分钟）：**  
“不要看笔记——你更信任哪个 AI 答案，为什么？生物学还是历史？”

**建立框架（10 分钟）：**  
“你的直觉是正确的——现在让我们解释一下原因。并不是因为生物学‘更容易’，也不是因为 AI 在生物学问题上‘更努力’。两个学科之间究竟有什么不同，能够解释 AI 可靠性上的差异？”[引导学生思考：知识的类型、专家是否达成共识、答案取决于什么]

**检验框架（5 分钟）：**  
“把这个框架应用到一个我们今天没有讨论过的学科上。如果你问 AI‘莎士比亚的《麦克白》为什么重要？’，你会期待得到可靠的答案吗？那‘计算动能的公式是什么？’呢？使用这个框架做出预测——然后我们来验证。”

**元认知总结：**  
“在下一次作业之前，问问自己：‘我正在向 AI 询问哪一类知识？这个问题已经确定，还是存在争议？’这个问题只需要 10 秒钟，而且应该决定你在多大程度上信任答案。”

---

## 已知局限

1. **垂直/水平的区分并不是二元的。**Bernstein 的分类是分析性的——在实践中，每个学科都同时包含已经确定的知识和存在争议的知识。应将这一框架作为一种有用的启发式方法来教授，而不是分类体系。生物学中存在有争议的领域；历史中也有已经确定的事实。该框架预测的是模式，而不是保证。

2. **不同 AI 模型处理有争议主张的能力各不相同。**一些模型经过专门训练，能够在解释性领域中承认争议并对自身确信程度进行保留。使用不同的 AI 工具时，这一教学序列可能产生不同的发现。这本身就是一个有价值的发现——讨论模型为何以不同方式处理这些问题，可以深化学生的 AI 素养。

3. **该教学序列要求学生具备足够的领域知识来评估 AI 的答案。**如果学生还没有充分学习第一次世界大战，就无法判断 AI 对德国在一战中战败原因的解释是否过于简化。该教学序列在单元学习进行到中段或结束时最为有效，此时学生已经掌握了基础知识。

4. **关于学科 AI 素养教学法的直接实证证据非常有限。**知识类型框架（Bernstein、Willingham、Maton）在通用课程设计方面有充分的证据支持。将其具体应用为预测 AI 可靠性的框架，是一种有原则但较新的做法——目前还没有大量研究探讨如何利用知识结构推理来教授学生预测 AI 的可靠性。