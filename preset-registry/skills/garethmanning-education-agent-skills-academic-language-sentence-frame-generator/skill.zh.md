---
# AGENT SKILLS STANDARD FIELDS (v2)
name: academic-language-sentence-frame-generator
description: "Generate tiered sentence frames for academic tasks that scaffold language production across proficiency levels. Use when EAL students need structured language support for classroom discourse."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "eal-language-development/academic-language-sentence-frame-generator"
skill_name: "Academic Language Sentence Frame Generator"
domain: "eal-language-development"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Gibbons (2015) — Scaffolding Language, Scaffolding Learning"
  - "Zwiers (2014) — Building Academic Language: meeting Common Core standards across disciplines"
  - "Zwiers & Crawford (2011) — Academic Conversations: classroom talk that fosters critical thinking and content understandings"
  - "Kinsella (2005) — Teaching academic vocabulary to English language learners"
  - "Dutro & Moran (2003) — Rethinking English language instruction: an architectural approach"
input_schema:
  required:
    - field: "task_type"
      type: "string"
      description: "The type of academic task — e.g. explaining, comparing, arguing, evaluating, hypothesising, summarising, describing a process"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "language_proficiency"
      type: "string"
      description: "EAL proficiency level — affects frame complexity"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: first languages, specific language needs"
    - field: "specific_content"
      type: "string"
      description: "The specific topic or content students are working with"
    - field: "output_mode"
      type: "string"
      description: "Whether students are writing or speaking — affects register and formality"
output_schema:
  type: "object"
  fields:
    - field: "sentence_frames"
      type: "array"
      description: "Graded set of sentence frames for the task type, from heavily scaffolded to lightly scaffolded"
    - field: "discourse_markers"
      type: "array"
      description: "Connectives and transition words appropriate for this task type"
    - field: "usage_guide"
      type: "string"
      description: "How to introduce and use the frames effectively — avoiding the 'fill-in-the-blank' trap"
    - field: "progression"
      type: "string"
      description: "How to move students from frames to independent academic language production"
chains_well_with:
  - "language-demand-analyser"
  - "scaffolded-task-modifier"
  - "vocabulary-tiering-tool"
  - "disciplinary-writing-scaffold"
teacher_time: "2 minutes"
tags: ["sentence-frames", "academic-language", "EAL", "discourse-markers", "scaffolding"]
---
# 学术语言句型框架生成器

## 此技能的作用

生成适用于特定学术任务类型和语言能力水平的句型框架与话语标记。不同于通用的句子开头列表，这些句型框架会按照语言能力水平分级（从为初学者提供大量支架的框架，到为语言能力更强的学生提供的简略开头），与特定类型的学术思维要求相匹配（解释、比较、论证、评价），并配有能够连接跨句观点的话语标记。输出内容还包括一份使用指南，帮助教师避免将句型框架变成填空练习单这一常见陷阱，因为这种做法会把思考简化为填补空缺。AI 在这里尤其有价值，因为有效的句型框架必须编码任务类型所要求的学术思维模式（比较需要使用“while X..., Y...”结构；评价需要使用“Although..., the evidence suggests...”结构），同时还要根据特定语言能力水平进行调整——过于复杂会让学生难以理解，过于简单则无法教会他们学术语言。

## 证据基础

Gibbons (2015) 证明，当句型框架编码的是任务的思维结构，而不仅仅是语法结构时，它们是为 EAL 学生提供支架的最有效方法之一。例如，“The evidence suggests that ___ because ___”这一框架同时教授学术性模糊表达的语言，以及基于证据进行论证的推理模式。Zwiers (2014) 确定了关键的学术语言功能——描述、解释、比较、劝说、评价、假设——并指出，每种功能都需要特定的语法结构和词汇，而这些内容必须进行明确教学。Zwiers & Crawford (2011) 强调，口语话语和写作同样需要学术语言，用于口语表达的句型框架（负责任对话框架）与用于写作的句型框架同等重要。Kinsella (2005) 表明，使用句型框架进行结构化语言练习，能够显著提高 EAL 学生对学术词汇和复杂句式的使用。Dutro & Moran (2003) 提出了语言教学的“建筑式”方法，认为学术语言具有系统性且可教授的特征——“砖块”（特定内容领域的词汇）和“砂浆”（连接观点的通用语言结构），而大多数教学都关注砖块，却忽视了将学术语言连接在一起的砂浆。

## 输入模式

教师必须提供：
- **任务类型：** 所需的学术思维。*例如：“比较两首诗” / “解释一个科学过程” / “评价一个来源的可靠性” / “支持或反对某一立场进行论证” / “假设可能发生的事情” / “概括一篇文章”*
- **学科领域：** 学科。*例如：“英语” / “科学” / “历史” / “地理”*
- **学生年级：** 年级组。*例如：“8 年级”*

可选（如果可用，则由上下文引擎注入）：
- **语言能力：** EAL 语言能力水平
- **学生概况：** 第一语言、具体需求
- **具体内容：** 学生正在学习的主题
- **输出模式：** 写作或口语

## 提示

```
You are an expert in academic language development and EAL pedagogy, with deep knowledge of Gibbons' (2015) approach to language scaffolding, Zwiers' (2014) academic language functions, Zwiers & Crawford's (2011) work on academic conversations, and Dutro & Moran's (2003) architectural approach to academic language instruction. You understand that sentence frames are powerful scaffolds only when they encode the THINKING STRUCTURE of the academic task, not just grammatical patterns.

Your task is to generate sentence frames for:

**Task type:** {{task_type}}
**Subject area:** {{subject_area}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Language proficiency:** {{language_proficiency}} — if not provided, generate frames at three levels: Early Acquisition (heavily scaffolded), Developing (moderately scaffolded), and Consolidating (lightly scaffolded).
**Student profiles:** {{student_profiles}} — if not provided, design for mixed EAL proficiency levels.
**Specific content:** {{specific_content}} — if provided, embed frames in this specific content. If not, use a generic academic context with notes on how to adapt.
**Output mode:** {{output_mode}} — if not provided, generate frames for both writing and speaking, noting differences in register.

Apply these evidence-based principles:

1. **Frames must encode thinking, not just grammar (Gibbons, 2015):**
   - Each frame should model the type of thinking required by the task.
   - Comparison frame: "While [X], [Y] differs because ___" — this teaches the student to identify a point of difference AND explain it.
   - Evaluation frame: "Although [claim], the evidence suggests ___ because ___" — this teaches the student to acknowledge a position AND evaluate it.
   - A frame that only provides grammatical scaffolding ("The first thing is ___, the second thing is ___") teaches sequencing but not academic thinking.

2. **Grade frames by proficiency level (Zwiers, 2014):**
   - **Early Acquisition:** Nearly complete sentences with small gaps for content words. The frame does most of the linguistic work; the student supplies the key concept. E.g., "___ is similar to ___ because both ___."
   - **Developing:** Sentence starters with more open endings. The student must construct more of the sentence. E.g., "Although some people argue that ___, the evidence suggests..."
   - **Consolidating:** Structural prompts rather than frames. The student constructs the sentence with minimal support. E.g., "Consider using: however, nevertheless, in contrast, despite..."
   - Provide frames at all three levels so the teacher can match to individual students.

3. **Include discourse markers (Dutro & Moran, 2003):**
   - Academic language requires connectives that signal relationships between ideas: addition (furthermore, moreover), contrast (however, nevertheless), cause (consequently, therefore), sequence (subsequently, finally), concession (although, despite).
   - Group discourse markers by function, matching to the task type.
   - Discourse markers are the "mortar" — they hold academic language together. Without them, students produce disconnected sentences.

4. **Distinguish writing and speaking frames (Zwiers & Crawford, 2011):**
   - Writing frames are more formal: "The evidence demonstrates that..."
   - Speaking frames are less formal but still academic: "I think the evidence shows that... because..."
   - For speaking: include accountable talk frames: "I agree with ___ because..." / "I'd like to build on what ___ said..."

5. **Avoid the fill-in-the-blank trap (Gibbons, 2015):**
   - Frames should require THOUGHT, not just slot-filling.
   - Bad frame: "___ is ___." (Can be completed without thinking: "The dog is brown.")
   - Good frame: "___ is significant because ___." (Requires evaluative reasoning to complete.)
   - The usage guide must address this: how to use frames to GENERATE thinking, not replace it.

Return your output in this exact format:

## Sentence Frames: [Task Type] in [Subject]

**For:** [Student level]
**Task type:** [Academic function]
**Output mode:** [Writing / Speaking / Both]

### Frames by Proficiency Level

**Early Acquisition (heavily scaffolded)**
[Complete sentence frames with small gaps — student supplies key content]

**Developing (moderately scaffolded)**
[Sentence starters with open endings — student constructs more of the response]

**Consolidating (lightly scaffolded)**
[Structural prompts and optional starters — student writes mostly independently]

### Discourse Markers

[Connectives and transition words grouped by function, matched to the task type]

### Usage Guide

[How to introduce frames effectively, how to avoid the fill-in-the-blank trap, and how to ensure frames generate thinking]

### Progression: From Frames to Independence

[How to move students from heavy scaffolding to independent academic language production — specific, practical steps]

**Self-check before returning output:** Verify that (a) frames encode the thinking structure of the task type, not just grammar, (b) frames are graded by proficiency level, (c) discourse markers are matched to the task type, (d) the usage guide addresses the fill-in-the-blank trap, (e) a progression from frames to independence is included, and (f) completing the frame requires genuine academic thinking, not just slot-filling.
```

## 示例输出

**情境：** *任务类型：“比较小说中的两个角色” / 学科领域：“英语文学” / 学生年级：“九年级” / 具体内容：“比较《蝇王》中的拉尔夫和杰克这两个角色” / 输出模式：“写作”*

---

## 英语文学中比较角色的句型框架

**适用对象：** 九年级英语文学
**任务类型：** 比较（识别相似之处、差异及其意义）
**输出模式：** 写作（包含用于讨论的口语表达框架）

### 按熟练程度划分的框架

**初步习得阶段（大量支架）**

*这些框架承担了大部分语言表达工作。学生需要补充关键内容词和观点。*

识别相似之处：
- “拉尔夫和杰克都___。例如，拉尔夫___，杰克也___。”
- “拉尔夫和杰克之所以相似，是因为他们都___。”
- “拉尔夫和杰克的一个共同点是___。”

识别差异：
- “拉尔夫___，但杰克___。”
- “拉尔夫是___，而杰克是___。”
- “拉尔夫和杰克之所以不同，是因为拉尔夫___，而杰克则___。”

解释意义：
- “这一差异很重要，因为它表明了___。”
- “戈尔丁将拉尔夫描写为___，将杰克描写为___，以向读者表明___。”

**发展阶段（中等程度的支架）**

*这些句子开头提供了结构。学生必须自行构建句子的其余部分并进行推理。*

带有分析的比较：
- “尽管拉尔夫和杰克都___，但他们在___方面存在显著差异。这表明戈尔丁……”
- “表面上看，拉尔夫和杰克因为___而显得相似。然而，仔细阅读后可以发现……”
- “拉尔夫代表___，而杰克代表___。这一对比之所以是小说的核心，是因为……”
- “拉尔夫和杰克之间最重要的差异是___。这很重要，因为戈尔丁利用这一点来……”

嵌入证据：
- “当拉尔夫___时（第___章），而杰克___时（第___章），这一差异便显现出来。”
- “戈尔丁通过[technique]突出了这一对比：例如，拉尔夫被描述为‘___’，而杰克被描述为‘___’。”

评价性比较：
- “在这两个角色中，___被描写得更令人同情，因为……”
- “戈尔丁似乎比起___更赞同/批判___，这表明他关于人性的观点是……”

**巩固阶段（少量支架）**

*这些是结构提示，而不是句型框架。学生参考这些模式，独立完成写作。*

应尝试使用的学术性比较结构：
- 让步从句 + 对比：“尽管[相似之处]，[具有重要意义的关键差异]……”
- 嵌入式引文比较：“[关于X的引文]……与[关于Y的引文]形成鲜明对比，这表明……”
- 评价性比较：“虽然两个角色都[具有共同特征]，但正是[角色]因为[展现出更重要的某种特质]……”

目标是包含：however、in contrast、whereas、conversely、on the other hand、nevertheless、despite、although

目标是：通过比较引出对戈尔丁创作意图的分析——不要只是列出差异，要解释这些差异的含义。

### 话语标记

**用于比较（核心任务）：**

| 功能 | 标记 | 示例 |
|----------|---------|---------|
| 相似性 | similarly, likewise, in the same way, both...and, equally | “Ralph 和 Jack 都渴望获得领导权。同样，他们都……” |
| 差异 | however, in contrast, whereas, while, on the other hand, conversely, unlike | “Ralph 重视民主；然而，Jack 越来越……” |
| 让步 | although, despite, even though, while it is true that | “尽管 Jack 表现出勇气，但他的领导方式……” |
| 强调 | significantly, crucially, most importantly, notably | “最重要的是，他们应对权力的方式揭示了……” |
| 结果 | therefore, consequently, as a result, this means that | “因此，Jack 对规则的拒绝代表了……” |

**用于分析（将比较与意义联系起来）：**

| 功能 | 标记 |
|----------|---------|
| 作者意图 | Golding uses this to...，this suggests that...，this reveals...，this is significant because... |
| 读者效果 | the reader is positioned to...，this creates a sense of...，the audience recognises that... |
| 主题联系 | this connects to the novel's theme of...，this reflects Golding's wider message about... |

### 使用指南

**如何引入这些句式框架：**

1. **先进行示范。** 在给学生提供句式框架之前，使用一个句式框架在黑板上写出一个比较句，并边写边思考：“我想比较 Ralph 和 Jack 如何回应规则这一观念。我会使用句式框架 ‘While Ralph ___, Jack ___’——所以可以写成：‘虽然 Ralph 坚持维护规则和秩序，但 Jack 越来越认为规则没有必要而加以摒弃。’ 看到了吗？这个句式框架帮助我组织了比较。现在我需要补充这为什么重要……”

2. **区分句式框架与思考。** 告诉学生：“句式框架提供给你的是词语。但你必须自己提供观点。句式框架 ‘While Ralph ___, Jack ___’ 在你决定要比较什么以及这为什么重要之前，是空的。句式框架是容器；你的分析才是内容。”

3. **让句式框架与学生水平相匹配。** 为初步习得阶段的学生提供支架非常充分的句式框架。为发展阶段的学生提供适度支架的句式框架。为巩固阶段的学生只提供提示。同一个班级中的不同学生应使用不同层级的句式框架。

**如何避免陷入填空陷阱：**

- 不好的用法：学生在句式框架中写下“Ralph 很勇敢，但 Jack 很刻薄”，然后就此停笔。这是描述，不是分析。
- 好的用法：学生写下“虽然 Ralph 运用自己的勇气保护年幼的孩子们，但 Jack 运用勇气来支配和恐吓他人——这表明 Golding 认为勇气在道德上是中性的，其意义取决于人们如何使用它。”这是能够引向分析的比较。
- 区别在于：推动学生补充“because” / “which suggests” / “this shows”。如果学生用简单的描述完成了句式框架，可以回应：“比较得很好。现在告诉我这种差异为什么重要。Golding 向我们展示了什么？”

**关键规则：** 完成一个句式框架不应成为学生思考的终点——而应成为起点。句式框架帮助学生开始写作；真正的思考发生在他们决定如何完成句子以及接下来写什么的过程中。

### 递进：从句框到独立写作

| 阶段 | 学生的表现 | 教师行动 |
|-------|----------------------|----------------|
| **第 1–2 周** | 每个比较句都使用高度支架化的句框。可能会写出简单描述。 | 接受使用句框。要求学生在每次完成后补充“because...”。示范如何完成分析性表达。 |
| **第 3–4 周** | 转而使用中度支架化的句框。开始独立加入推理。 | 提供中度句框。突出展示学生超出句框限制的优秀示例。撤除 Early Acquisition 句框。 |
| **第 5–6 周** | 使用句子开头，但大部分句子能独立构建。开始无需提示便使用语篇标记。 | 仅为最复杂的结构提供开头提示（让步从句、嵌入式引语）。撤除词汇库。 |
| **第 7–8 周** | 独立写作比较内容。可能会参考语篇标记列表，但不再需要句框。 | 提供语篇标记列表供参考，但不提供句框。反馈聚焦于分析质量，而非语言支架。 |
| **第 9 周及以后** | 能够独立完成分析性比较写作。 | 不提供支架。反馈聚焦于内容、论证和文体，与对待任何学生相同。 |

**关键原则：** 每次只撤除一种支架，而不是一次性全部撤除。如果学生已经能够不使用句框，但仍需要语篇标记列表，这完全没有问题——他们在不同语言特征上的独立程度可能处于不同阶段。

---

## 已知局限性

1. **如果不逐步撤除，句框可能会成为永久性的依赖。** 始终依靠句框写作的学生，可能会写出结构正确但模式化的学术语言。递进计划能够解决这一问题，但它要求教师在数周内主动管理支架的撤除——无法在单项任务中自动完成。

2. **句框提供的是学术语言的结构，而不是内容。** 无论句框多么完善，如果学生不理解人物，就无法写出有意义的比较。句框支持语言产出，而不支持内容理解——任务要成功，两者都必须具备。

3. **这些句框体现了标准学术英语的惯例，而这可能与学生母语的表达模式不同。** 某些学生的第一语言会以不同方式组织比较、论证或评价——例如，有些语言倾向于间接评价，而不是直接陈述。这些句框教授的是英语学术惯例，这正是目标所在；但教师应意识到，学生学习的不只是新词汇，也是一种新的修辞模式。