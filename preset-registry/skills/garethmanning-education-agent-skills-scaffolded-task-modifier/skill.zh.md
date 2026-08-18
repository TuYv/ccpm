---
# AGENT SKILLS STANDARD FIELDS (v2)
name: scaffolded-task-modifier
description: "Modify a classroom task with language scaffolds that preserve cognitive demand for EAL learners. Use when adapting existing tasks for students at different English proficiency levels."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "eal-language-development/scaffolded-task-modifier"
skill_name: "Scaffolded Task Modifier"
domain: "eal-language-development"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Gibbons (2002, 2015) — Scaffolding Language, Scaffolding Learning: scaffolding that challenges rather than simplifies"
  - "Cummins (2000) — Language, Power and Pedagogy: the BICS/CALP and quadrant frameworks"
  - "Hammond & Gibbons (2005) — Putting scaffolding to work: the contribution of scaffolding in articulating ESL education"
  - "Vygotsky (1978) — Mind in Society: the zone of proximal development"
  - "Walqui (2006) — Scaffolding instruction for English language learners: a conceptual framework"
input_schema:
  required:
    - field: "original_task"
      type: "string"
      description: "The task as originally designed for the class"
    - field: "target_proficiency"
      type: "string"
      description: "The language proficiency level of the students being scaffolded for — e.g. New to English, Early Acquisition, Developing, Consolidating"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: first languages, specific language needs, cognitive ability"
    - field: "learning_objective"
      type: "string"
      description: "The learning objective — what ALL students should understand, regardless of language level"
    - field: "task_materials"
      type: "string"
      description: "Description of texts, worksheets, or resources used in the original task"
output_schema:
  type: "object"
  fields:
    - field: "modified_task"
      type: "object"
      description: "The scaffolded version of the task with language supports added and cognitive demand maintained"
    - field: "cognitive_demand_check"
      type: "string"
      description: "Explicit verification that the modification maintains cognitive challenge"
    - field: "scaffold_types_used"
      type: "array"
      description: "List of scaffolding strategies applied, with rationale for each"
    - field: "removal_plan"
      type: "string"
      description: "How and when to remove scaffolds as proficiency increases"
chains_well_with:
  - "language-demand-analyser"
  - "vocabulary-tiering-tool"
  - "academic-language-sentence-frame-generator"
  - "cognitive-load-analyser"
teacher_time: "4 minutes"
tags: ["scaffolding", "EAL", "differentiation", "cognitive-demand", "task-modification"]
---
# 分层任务修改器

## 此技能的作用

针对特定语言熟练程度调整课堂任务，同时明确保持认知要求，确保 EAL 学生即使需要语言支持，也能进行与同伴相同的思考。其关键设计原则是：支架应减少语言障碍，而不是减少思考。许多出于善意的任务修改会无意中降低认知要求：为 EAL 学生提供更简单的版本，删去分析部分，或将开放性问题替换为选择题。此技能通过在生成修改后任务的同时进行明确的认知要求检查，来避免这一问题，核实修改改变的是语言通达路径，而不是智力目标。AI 在此处尤其有价值，因为在提供支架的同时保持认知要求，需要同时理解任务的智力目的、学生的语言水平，以及在不降低挑战的情况下支持学生参与的具体支架策略——这是大多数教师没有时间进行的三方面分析。

## 证据基础

Gibbons (2002, 2015) 确立了一个基本原则：为 EAL 学生提供的支架必须具有挑战性，而不是将任务简单化——目标是支持学生完成他们独自无法完成的更多内容，而不是减少对他们的要求。Cummins (2000) 提出了象限模型，说明任务沿两个维度变化：认知要求（高/低）和情境支持（嵌入式/减少）。有效的 EAL 支架会将任务从象限 D（高要求、情境支持少——难以进入）移至象限 B（高要求、情境支持充分——具有挑战性但可以进入），而不是从象限 D 移至象限 A（低要求、情境支持充分——容易进入但缺乏挑战）。Hammond & Gibbons (2005) 确定了两种层次的支架：预设支架（课前规划——图示组织器、句型框架、词汇预教）和互动支架（课堂中教师根据需要提供的支持——重述、扩展、引导）。Vygotsky (1978) 确立了这样一个观点：学习发生在最近发展区中——也就是学习者在支持下能够完成、但尚不能独立完成的事情。Walqui (2006) 确定了六种面向 EAL 学习者的支架策略：示范、建立联系、提供语境、构建图式、呈现文本，以及发展元认知。

## 输入模式

教师必须提供：
- **原始任务：** 为全班设计的任务。*例如：“写一篇关于是否应强制要求学生穿校服的平衡论证文章” / “分析表格中的数据，并解释其反映了人口增长的哪些情况” / “阅读节选并回答推理问题”*
- **目标熟练程度：** 需要提供支架的语言水平。*例如：“初步习得” / “发展中” / “英语初学者”*
- **学科领域：** 学科名称。*例如：“英语” / “地理” / “科学”*

可选（如果可用，则由上下文引擎注入）：
- **学生年级：** 年级组
- **学生概况：** 第一语言、认知能力、具体需求
- **学习目标：** 所有学生应学习的内容
- **任务材料：** 原始任务中使用的资源

## 提示词

```
You are an expert in EAL scaffolding and differentiation, with deep knowledge of Gibbons' (2002, 2015) principle that scaffolding must challenge rather than simplify, Cummins' (2000) quadrant model of cognitive demand and contextual support, and Walqui's (2006) scaffolding strategies for English language learners. You understand that the most common error in EAL differentiation is reducing cognitive demand — giving students an easier task instead of the same task with better support.

Your task is to scaffold:

**Original task:** {{original_task}}
**Target proficiency:** {{target_proficiency}}
**Subject area:** {{subject_area}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, assume a secondary school student.
**Student profiles:** {{student_profiles}} — if not provided, assume the student has age-appropriate cognitive ability but limited academic English proficiency, with conversational fluency.
**Learning objective:** {{learning_objective}} — if not provided, infer the learning objective from the original task. This is critical — the modified task must achieve the SAME objective.
**Task materials:** {{task_materials}} — if not provided, infer typical materials for this task type.

Apply these evidence-based principles:

1. **Maintain cognitive demand (Gibbons, 2002; Cummins, 2000):**
   - The modified task must require the SAME level of thinking as the original.
   - If the original task requires analysis, the modified task must also require analysis — not description.
   - If the original task requires evaluation, the modified task must also require evaluation — not recall.
   - If the original task requires an extended written response, the scaffolded version may provide language support (sentence frames, word banks, graphic organisers) but must still require the student to construct meaning, not just fill blanks.
   - EXPLICITLY check and state: "The original task requires [thinking type]. The modified task also requires [same thinking type] because..."

2. **Scaffold language, not thinking (Gibbons, 2015):**
   - Identify the LANGUAGE barriers in the original task (vocabulary, grammar, text structure, reading load).
   - Add language supports that address these specific barriers.
   - Do NOT: simplify the question, reduce the number of steps, provide the answer in the scaffold, remove the requirement for original thinking, or substitute a lower-order task.

3. **Use appropriate scaffold types (Walqui, 2006; Hammond & Gibbons, 2005):**
   - **Modelling:** Provide a worked example or annotated model showing what a good response looks like.
   - **Bridging:** Connect to the student's existing knowledge or first language.
   - **Contextualising:** Add visual support, diagrams, or concrete examples that make abstract content accessible.
   - **Sentence frames:** Provide the linguistic structure while requiring the student to supply the content and thinking.
   - **Graphic organisers:** Provide a visual structure for organising ideas before writing.
   - **Word banks:** Supply key vocabulary, but require the student to select and use words meaningfully.
   - **Glossary/bilingual support:** Define key terms, ideally with first-language equivalents.

4. **Match scaffold intensity to proficiency level:**
   - **New to English:** Heavy scaffolding — visual support, bilingual resources, adapted text with glossary, sentence frames with minimal gaps, graphic organisers that structure the entire response. The student may respond partially in their first language. The thinking demand remains.
   - **Early Acquisition:** Substantial scaffolding — adapted text, sentence starters (not complete frames), word banks, graphic organisers, models. The student produces English with significant support.
   - **Developing:** Moderate scaffolding — original text with glossary, sentence starters for complex constructions only, optional word bank. The student produces mostly independent English with targeted support.
   - **Consolidating:** Light scaffolding — original text, a few sentence starters for the most complex academic constructions, no word bank (student should be building independence). Nearly independent.

5. **Plan for scaffold removal:**
   - Scaffolds are temporary. Every scaffold should include a note about when and how to remove it.
   - The goal is independence — if the scaffold becomes permanent, it has become a crutch.

Return your output in this exact format:

## Scaffolded Task: [Brief description]

**Original task:** [The original task]
**Scaffolded for:** [Target proficiency level]
**Subject:** [Subject area]
**Learning objective:** [Stated or inferred — must be the SAME for both versions]

### Modified Task

[The complete scaffolded version of the task — including all language supports, visual organisers, sentence frames, word banks, etc.]

### Cognitive Demand Check

**Original task requires:** [Type of thinking — analysis, evaluation, synthesis, application, etc.]
**Modified task requires:** [SAME type of thinking]
**How cognitive demand is maintained:** [Specific explanation of why the scaffolded version still requires the same thinking]
**What was changed:** [Only language access — not intellectual demand]
**What was NOT changed:** [The thinking, the learning objective, the analytical requirement]

### Scaffold Types Used

For each scaffold:
- **[Scaffold type]:** [What was added and why — connected to a specific language barrier]

### Scaffold Removal Plan

[How to progressively remove each scaffold as the student's proficiency increases — specific, practical steps]

**Self-check before returning output:** Verify that (a) the learning objective is the same for both versions, (b) the modified task requires the same TYPE of thinking as the original, (c) scaffolds address language barriers specifically, (d) no scaffold inadvertently provides the answer or removes the need for original thinking, (e) the scaffold intensity matches the stated proficiency level, and (f) the scaffold removal plan is included.
```

## 示例输出

**情境：** *原始任务：“阅读《An Inspector Calls》（《检察官来访》）的节选（第一幕，Birling 先生关于泰坦尼克号的演讲）。分析 Priestley 如何运用戏剧反讽来削弱 Birling 先生的权威。在回答中，解释什么是戏剧反讽，指出节选中的具体例子，并解释其对观众产生的效果。” / 目标熟练程度：“发展中” / 学科领域：“英国文学” / 学生年级：“10 年级”*

---

## 分层任务：《An Inspector Calls》中的戏剧反讽

**原始任务：** 分析 Priestley 如何在第一幕关于泰坦尼克号的演讲中运用戏剧反讽来削弱 Birling 先生的权威。解释什么是戏剧反讽，指出相关例子，并解释其对观众产生的效果。  
**分层对象：** 发展中熟练程度  
**学科：** 英国文学  
**学习目标：** 学生分析 Priestley 如何运用戏剧反讽这一技巧来塑造观众对 Birling 先生的看法。

### 修改后的任务

**步骤 1：理解概念（配合视觉支持）**

**戏剧反讽** = 观众知道某件事，而角色并不知道这件事。

| Birling 先生所说的话（1912 年） | 观众所知道的事情（在 1945 年以后观看时） |
|---|---|
| “泰坦尼克号……绝对不会沉没，绝对不会沉没” | 泰坦尼克号在 1912 年的首次航行中沉没了——超过 1,500 人死亡 |
| “我敢说不可能发生战争” | 第一次世界大战于 1914 年爆发，第二次世界大战于 1939 年爆发 |

**这就是戏剧反讽：** Birling 先生完全错了，而观众知道他说错了，但他在讲话时却表现得十分自信。

**步骤 2：分析——Priestley 为什么这样做？**

再次阅读节选。使用下面的问题来构建你的分析。你必须解释自己的思考——不能只回答一个词。

1. 当观众听到 Birling 先生说泰坦尼克号“不会沉没”时，他们会如何看待 Birling 先生？他们信任他的判断吗？

2. Birling 先生非常自信地说出这些错误的预测（“我敢说不可能发生战争”）。他的自信产生了什么效果？一个自信但犯错的人，与一个不确定但犯错的人相比，是更可笑还是不那么可笑？

3. Birling 先生还对商业和社会责任作出了预测——他说人们应该只照顾好自己。Priestley 希望观众不同意这种观点。关于泰坦尼克号和战争的戏剧反讽，如何帮助 Priestley 让观众也不同意 Birling 先生的其他观点？

**步骤 3：写出你的回答**

使用下面的结构。每一部分都需要加入**你自己的思考**——句子开头为你提供学术语言，但你必须补充分析内容。

**第 1 段——戏剧反讽是什么，以及 Priestley 如何运用它：**

戏剧反讽是指当___。在 Birling 先生的演讲中，Priestley 运用戏剧反讽的例子是 Birling 先生说“___”（节选中的引文）。1945 年的观众会知道___，这意味着 Birling 先生是___。

**第 2 段——对观众的影响：**

这种戏剧反讽会影响观众，因为___。当他们听到 Birling 先生如此自信地谈论一件他们**知道**是错误的事情时，他们开始___。Priestley 这样做的目的是___，因为___。

**第 3 段——这与普里斯特利更广泛的信息有何联系：**

普里斯特利用戏剧反讽削弱了伯林的权威，因此，当伯林认为人们只应该照顾自己时，观众会___。如果观众已经知道伯林对泰坦尼克号的判断是错误的，那么他们更有可能认为他对___的看法也是错误的。这支持了普里斯特利所传达的信息，即___。

**分析性语言词汇表：**

| 描述伯林 | 描述观众的反应 | 描述普里斯特利的意图 |
|---|---|---|
| 傲慢的、过度自信的、愚蠢的、误入歧途的、目光短浅的 | 持怀疑态度的、不信任的、批判性的、觉得可笑的、意识到真相的 | 削弱、使……失去可信度、质疑、揭露、表明 |

### 认知要求检查

**原任务要求：** 分析——学生必须解释一种技巧（戏剧反讽）如何产生特定效果（削弱权威），这要求他们找出例子、解释这种技巧的运作方式，并将其与作者的创作意图联系起来。

**修改后的任务要求：** 同样是分析。学生仍然必须解释戏剧反讽如何削弱伯林的权威，找出具体例子，解释其对观众产生的影响，并联系普里斯特利的创作意图。引导性问题和句式开头提供了语言支架，但每一个问题仍要求学生提供他们自己的分析思考。

**如何保持认知要求：**
- 问题 2 要求学生评估自信与犯错之间的关系——这是真正的分析，而不是回忆。
- 问题 3 要求学生解释，对事实性预测的戏剧反讽如何进一步削弱伯林的政治观点——这是最困难的分析步骤，且没有由支架直接回答。
- 句式框架要求学生完成分析：“普里斯特利这样做的意图是___，因为___”——“因为”迫使学生进行推理，而不仅仅是指出内容。

**做出的改变：** 通过总结表为阅读提供支持。通过句式开头搭建写作结构。通过词汇表提供分析性词汇。将任务分解为有引导的步骤。

**未做出的改变：** 要求进行分析，而不是描述。要求解释对观众产生的影响。要求将技巧与作者的创作意图联系起来。要求使用文本中的证据。

### 使用的支架类型

- **提供背景信息（表格）：** 总结表使理解戏剧反讽所需的历史知识变得清晰可见——处于发展阶段的 EAL 学生可能缺乏理解伯林的预测为何具有反讽意味所需的文化背景知识。表格提供了这些背景信息，但没有替学生完成分析。
- **句式框架：** 提供分析性写作的语法结构（带有嵌入式从句的复杂句），同时要求学生提供具体内容。“戏剧反讽是指___”要求学生给出定义。“普里斯特利这样做的意图是___，因为___”要求学生进行推理。
- **引导性问题：** 将分析分解为连续的步骤，而不是要求学生仅根据一个开放式提示写出完整的分析性回答。每个问题都针对分析中的一个组成部分。
- **词汇表：** 提供评价性词汇（傲慢的、持怀疑态度的、削弱），这些词汇对于处于发展阶段的 EAL 学生而言不太可能熟悉，但却是分析性写作所必需的。学生必须选择合适的词语——词汇表提供的是选项，而不是答案。

### 支架移除计划

| 当前支架 | 在……时移除 | 替换为…… |
|---|---|---|
| 总结表（历史背景） | 学生在课堂讨论中能够独立表现出对历史背景的理解 | 无需替换——这些知识应当内化 |
| 句式框架（完整结构） | 学生只借助句首提示就能写出分析段落 | 仅保留句首提示：“Priestley 使用……” “这表明……” “对观众的影响是……” |
| 句首提示 | 学生能够独立完成结构恰当的分析写作 | 不再提供提示——学生独立写作，写作后针对结构提供反馈 |
| 引导性问题 | 面对开放式提示时，学生能够独立识别分析步骤 | 单一开放式提示：“分析 Priestley 如何运用[技巧]来产生[效果]” |
| 词汇表 | 学生能够在没有词汇表的情况下独立使用 3 个以上分析术语 | 不再提供词汇表——但仍需在新分析词汇出现时继续教授 |

**目标时间线：** 对于处于发展阶段的学生，目标是在 4–6 周内移除句式框架（期间进行定期的分析写作练习）。词汇表可以逐步缩减——移除学生已经正确使用 3 次以上的词语。引导性问题可以在 2–3 个月内缩减为 1–2 个提示。

---

## 已知局限

1. **该调整无法独立区分学生的认知能力和语言熟练度。** 一名英语熟练度处于发展阶段、但用第一语言具备较强分析能力的学生，与一名处于相同熟练度水平、同时也觉得分析具有挑战性的学生，需要不同的支架。教师对学生个体的了解对于调整支架至关重要。

2. **移除支架需要持续且长期的规划。** 此技能为单项任务设计支架，但有效的支架移除需要跨越数周和数月逐步进行。教师如果在每项任务中都使用此技能，就能获得支架设计完善的单项任务，但跨任务逐步移除支架则需要教师规划其发展轨迹。将其与间隔练习方法结合，用于逐步减少支架。

3. **该调整假定原始任务设计良好。** 如果原始任务结构不佳、表述不清或与学习目标不一致，为其添加支架并不会有所帮助——需要先重新设计原始任务。支架不是弥补糟糕任务设计的方法；它是让不同语言熟练度水平的学生能够完成优质任务的一种方式。