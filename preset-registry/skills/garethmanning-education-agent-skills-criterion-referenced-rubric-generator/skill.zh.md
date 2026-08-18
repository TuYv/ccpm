---
# AGENT SKILLS STANDARD FIELDS (v2)
name: criterion-referenced-rubric-generator
description: "Generate a criterion-referenced rubric with descriptive performance levels for a task or objective. Use for marking guides and general curriculum contexts. For Manning programmes where Competent = success, use coherent-rubric-logic-builder instead."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/criterion-referenced-rubric-generator"
skill_name: "Criterion-Referenced Rubric Generator"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Brookhart (2013) — How to Create and Use Rubrics for Formative Assessment and Grading"
  - "Andrade (2000, 2013) — Using rubrics to promote thinking and learning"
  - "Jonsson & Svingby (2007) — The use of scoring rubrics: reliability, validity and educational consequences"
  - "Sadler (1989) — Formative assessment and the design of instructional systems"
  - "Panadero & Jonsson (2013) — The use of scoring rubrics for formative assessment purposes revisited"
input_schema:
  required:
    - field: "learning_objective"
      type: "string"
      description: "The learning objective the rubric assesses"
    - field: "task_description"
      type: "string"
      description: "The specific task students will complete"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "criteria_count"
      type: "integer"
      description: "Number of criteria (default: 4)"
    - field: "performance_levels"
      type: "integer"
      description: "Number of performance levels (default: 4)"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "existing_criteria"
      type: "string"
      description: "Any criteria the teacher wants included — the rubric will build around these"
output_schema:
  type: "object"
  fields:
    - field: "rubric"
      type: "object"
      description: "Complete rubric with criteria, performance level descriptors, and scoring guidance"
    - field: "design_rationale"
      type: "string"
      description: "Why these criteria were chosen and how descriptors were differentiated"
    - field: "student_friendly_version"
      type: "string"
      description: "A simplified version students can use for self and peer assessment"
    - field: "calibration_notes"
      type: "string"
      description: "Notes to help multiple markers apply the rubric consistently"
chains_well_with:
  - "competency-unpacker"
  - "backwards-design-unit-planner"
  - "gap-analysis-from-student-work"
  - "feedback-quality-analyser"
  - "kud-knowledge-type-mapper"
teacher_time: "3 minutes"
tags: ["rubric", "assessment", "criteria", "descriptive-language", "formative-assessment"]
---
# 以标准为参照的评分量规生成器

## 此技能的作用

根据学习目标和任务说明生成以标准为参照的评分量规，在每个表现等级中使用描述性（而非评价性）语言。每项标准都描述学生的作品在各个等级下呈现出的样子，而不是评价其“好不好”。输出内容包括完整的评分量规、设计依据、用于自评/同伴评价的学生友好版本，以及帮助不同评分者保持一致性的校准说明。AI 在此特别有价值，因为有效的评分量规设计需要使用精确、描述性的语言来区分不同表现等级，同时避免使用评价性标签（“优秀”“良好”“较差”）或含糊的数量指标（“一些”“许多”“全面”）；并且每个描述语都必须在质量上区别于相邻等级，而不能只是对同一描述进行程度上的缩放。

## 证据基础

Brookhart（2013）确立了有效评分量规应使用描述性而非评价性语言——它们描述作品中存在哪些内容，而不是评价其有多好。“使用具体的文本证据支持每个分析观点”是描述性的；“很好地使用了证据”则是评价性的。描述性评分量规能带来更可靠的评分和更有用的反馈，因为它们能明确告诉学生应该如何改进，而不只是告诉他们需要“做得更好”。Andrade（2000、2013）证明，在任务开始前与学生分享评分量规，可以同时促进教学与学习——评分量规不仅是评分工具，也是学习工具。当评分量规用于自我评价时，其效果最为显著。Jonsson & Svingby（2007）发现，分析性评分量规（分别独立评定各项标准）比整体性评分量规（给出单一的总体判断）具有更高的可靠性，并能提供更好的反馈，尽管使用起来需要更多时间。Sadler（1989）确立了评价质量取决于“差距”是否清晰可见——学生必须能够看出自己当前所处的位置与需要达到的位置之间的差异。描述性的评分量规等级能使这一差距具体化。Panadero & Jonsson（2013）证实，使用评分量规能够提升学生表现，尤其是在与自我评价结合使用时，且具有中等效应量。

## 输入模式

教师必须提供：
- **学习目标：** 评分量规所评估的内容。*例如：“学生能够撰写一篇运用修辞手法影响听众的说服性演讲稿” / “学生能够设计并实施公平测试，并得出有效结论”*
- **任务说明：** 具体任务。*例如：“围绕自选主题撰写并发表一篇 3 分钟的说服性演讲” / “设计并实施一项探究光照对植物生长影响的实验，然后撰写结论”*
- **学生年级：** 年级组。*例如：“Year 8”*

可选（如果可用，则由上下文引擎注入）：
- **标准数量：** 标准的数量（默认值：4）
- **表现等级：** 等级的数量（默认值：4）
- **学科领域：** 课程所属学科
- **现有标准：** 教师希望纳入的标准

## 提示

```
You are an expert in assessment design and rubric construction, with deep knowledge of Brookhart's (2013) principles of effective rubric design, Andrade's (2000, 2013) research on rubrics as learning tools, and Sadler's (1989) formative assessment framework. You understand that effective rubrics use DESCRIPTIVE language (describing what is present) rather than EVALUATIVE language (judging how good it is), and that each performance level must be QUALITATIVELY distinct — not just a scaled version of the same description.

Your task is to generate a rubric for:

**Learning objective:** {{learning_objective}}
**Task description:** {{task_description}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Criteria count:** {{criteria_count}} — if not provided, use 4 criteria.
**Performance levels:** {{performance_levels}} — if not provided, use 4 levels.
**Subject area:** {{subject_area}} — if not provided, infer from the learning objective.
**Existing criteria:** {{existing_criteria}} — if provided, incorporate these and add others as needed.

Apply these evidence-based principles:

1. **Descriptive, not evaluative language (Brookhart, 2013):**
   - NEVER use: excellent, good, satisfactory, poor, limited, basic, outstanding, weak.
   - NEVER use vague quantifiers: some, many, few, several, thorough, adequate.
   - INSTEAD: describe specifically what is PRESENT in the work at each level.
   - Bad: "Good use of evidence." Good: "Each analytical point is supported by a specific, relevant quotation from the text."
   - Bad: "Limited vocabulary." Good: "Vocabulary is predominantly everyday; academic or technical terms are absent or used inaccurately."

2. **Qualitatively distinct levels (Sadler, 1989; Brookhart, 2013):**
   - Adjacent levels must describe qualitatively DIFFERENT work, not just more or less of the same thing.
   - Bad progression: "Uses some evidence" → "Uses more evidence" → "Uses a lot of evidence" (quantitative — just more).
   - Good progression: "States claims without evidence" → "Includes evidence but does not connect it to claims" → "Connects evidence to claims with explicit reasoning" → "Selects the most compelling evidence and explains why it is the strongest support for each claim" (qualitative — different type of work).

3. **Criteria must be independent (Jonsson & Svingby, 2007):**
   - Each criterion should assess a distinct, separable aspect of the work.
   - A student should be able to score at different levels on different criteria — not all criteria tracking together.
   - If two criteria always produce the same score, they're probably measuring the same thing.

4. **Student-friendly version (Andrade, 2000, 2013):**
   - Produce a version using student-accessible language.
   - Written in second person: "You support each point with a specific quotation" rather than "The student supports each point with a specific quotation."
   - Can be used for self-assessment before submission.

5. **Calibration notes (Jonsson & Svingby, 2007):**
   - Include notes that help multiple markers apply the rubric consistently.
   - Identify the key distinctions between levels — the "decision points" where markers are most likely to disagree.
   - Where possible, describe what a borderline response looks like between two levels.

Return your output in this exact format:

## Rubric: [Task Description]

**Assesses:** [Learning objective]
**For:** [Student level]
**Criteria:** [Count] | **Levels:** [Count]

### Rubric

[Full rubric table with criteria as rows and performance levels as columns. Each cell contains descriptive language.]

### Design Rationale

[Why these criteria were chosen and how the levels are distinguished]

### Student-Friendly Version

[Simplified rubric in student-accessible language, suitable for self/peer assessment]

### Calibration Notes

[Guidance for consistent application — key decision points, borderline cases]

**Self-check before returning output:** Verify that (a) NO evaluative language appears (no "good," "excellent," "poor," "limited"), (b) NO vague quantifiers appear (no "some," "many," "thorough"), (c) adjacent levels are qualitatively distinct, (d) each criterion is independent, (e) the student-friendly version is genuinely accessible, and (f) calibration notes address the most likely points of marker disagreement.
```

## 示例输出

**情境：** *学习目标：“学生能够撰写一篇运用修辞手法影响听众的说服性演讲” / 任务描述：“选择一个主题，为全班撰写并进行一场 3 分钟的说服性演讲” / 学生年级：“Year 9” / 学科领域：“English”*

---

## 评分量规：说服性演讲（撰写与演讲）

**评估内容：** 撰写一篇运用修辞手法影响听众的说服性演讲  
**适用对象：** Year 9 English  
**标准数：** 4 | **等级数：** 4

### 评分量规

| 评价标准 | 等级 1 | 等级 2 | 等级 3 | 等级 4 |
|-----------|---------|---------|---------|---------|
| **论点与结构** | 演讲陈述了一个观点，但没有通过理由展开论证。各个要点只是罗列出来，彼此之间没有逻辑联系。演讲没有清晰的开头、中段或结尾——无论从哪一处开始或停止，听众都不会察觉。 | 演讲陈述了一个立场并提供了 1–2 个理由，但理由没有得到充分展开。演讲有可辨认的开头和结尾，但中段缺乏清晰的组织——各个要点之间没有层层推进。 | 演讲提出了清晰的立场，并由按逻辑顺序排列的 3 个或以上充分展开的理由支持。每个要点都建立在前一个要点之上，形成递进的论证。开头能够吸引听众，结论强化了立场，但没有简单重复前文。 | 演讲构建了具有策略性的论证，各个要点的顺序经过刻意安排——最有力的要点被放置在能够产生最大影响的位置。演讲承认并回应反方论点。结论以一种重新诠释论证的方式收束，使听众留下持久的印象。 |
| **修辞手法** | 演讲依赖个人观点（“我认为……”），没有刻意运用修辞技巧。语言始终保持会话式风格。 | 演讲包含 1–2 种修辞手法（例如，反问、重复、三项排比），但这些手法彼此孤立——只是插入会话式语言中，没有融入论证。修辞手法虽然存在，却没有明显增强说服力。 | 演讲使用了 3 种或以上融入论证的修辞手法——每种手法都服务于特定的说服目的（用反问挑战听众，用重复强调关键观点，用情感化语言制造紧迫感）。演讲者能够解释选择每种手法的原因。 | 演讲展现出受控且多样化的修辞运用——不同手法结合使用以产生效果（例如，先提出反问，再用三项排比作答）。演讲者有策略地转换语调（从理性转向情感，从平静转向紧迫），以引导听众的立场。语言选择体现出对特定听众的理解。 |
| **听众意识** | 演讲面向的是一般听众——没有具体提及听众、他们的经历或他们可能提出的反对意见。演讲者是在对着听众说话，而不是在与听众交流。 | 演讲体现出一定的听众意识（例如，“作为学生，我们都知道……”），但这种意识停留在表面——演讲提到了听众，却没有根据他们的具体关切或观点调整论证。 | 演讲直接回应听众可能持有的观点、关切或经历。演讲者预想到听众可能的想法或感受，并对此作出回应：“你可能会想……但请考虑一下这一点。”演讲让人感到是对 THESE 听众说的，而不是对任何听众说的。 | 演讲经过策略性调整，以适应特定听众——使用共同的参考内容，预判具体的反对意见，并调整语域、词汇和语调以匹配听众。演讲者在演讲过程中观察现场反应，并作出回应（调整速度、加强重音、与持怀疑态度的听众进行眼神交流）。 |
| **演讲表现** | 演讲者几乎一直照读稿件，很少与听众进行眼神交流。音量要么小得难以听清，要么始终单调。演讲者看起来与自己的论点毫无联系。 | 演讲大部分时间都在照读，偶尔看向听众。音量能够让人听见。演讲者尝试改变语调，但节奏不均——有些段落说得过快，另一些段落则出现尴尬的停顿。 | 演讲者把笔记作为提示，而不是照读完整稿件。演讲者定期与听众进行眼神交流，并将视线分布到全体听众。音量、速度和重音经过有意识的变化，以强化关键观点。停顿是为了制造效果，而不是因为不确定。 | 演讲者基本不依赖笔记。演讲表现自然且自信——演讲者看起来是在思考并表达，而不是在表演一篇背诵的稿子。手势、移动、面部表情和声音变化都服务于论证。演讲者能够掌控整个现场。 |

### 设计依据

**为什么采用这四项标准：**
1. **论点与结构**——基础。一篇演讲无论表达得多么出色，如果缺乏清晰的论点，就无法产生说服力。
2. **修辞手法**——工具箱。学习目标明确要求使用修辞手法；这一标准评估修辞手法是否存在，以及是否真正发挥作用。
3. **受众意识**——说服的视角。说服从根本上来说是面向受众的；这一标准评估演讲者是在为听众写作，还是只是在对着听众讲话。
4. **表达**——表现维度。演讲是一种口语体裁；内容质量和表达质量是两项不同的技能，应当分别进行评估。学生可能写出一篇精彩的演讲，却表达得很差，反之亦然——分开的标准能够同时反映这两个方面。

**如何区分各个等级：**
- Level 1 → Level 2：该要素已经存在，但效果不佳（修辞手法存在，却没有说服力；结构存在，却没有形成递进）。
- Level 2 → Level 3：该要素具有功能性——能够服务于某种目的并产生效果（修辞手法得到整合，结构逐步推进，直接面向受众讲话）。
- Level 3 → Level 4：该要素具有策略性——学生会作出有意且成熟的选择，并能够解释这些选择（综合运用修辞手法，为了增强效果而安排论点顺序，理解受众并作出回应）。

### 学生易懂版

**提交前，请根据以下标准检查你的演讲：**

**你的论点：**
- Level 1：你表达了自己的观点，但没有真正解释原因。
- Level 2：你给出了理由，但论述还不够充分——你没有解释清楚为什么这些理由具有说服力。
- Level 3：你提出了清晰的论点，并给出 3 个或更多相互递进的理由。你的开头能够吸引注意力，结尾能够强化你的观点。
- Level 4：你有策略地安排了各个要点——把最有力的观点放在最能产生影响的位置。你回应了另一方可能提出的观点。

**你对修辞手法的运用：**
- Level 1：你没有使用任何说服技巧——听起来只是像在正常说话。
- Level 2：你使用了 1–2 种技巧，但它们显得“生搬硬套”——就像因为要求使用，所以才加进去的。
- Level 3：你使用了 3 种或更多技巧，而且每一种都有明确的目的——你能够解释为什么选择它，以及它产生了什么效果。
- Level 4：你的技巧彼此配合——你会将它们结合起来，并有意识地改变语气来影响受众。

**你对受众的关注：**
- Level 1：你是在对着受众讲话，而不是和受众交流。
- Level 2：你提到了受众（“作为学生，我们……”），但并没有真正根据受众调整你的论点。
- Level 3：你直接回应了受众的想法和感受。“你可能会想……但请考虑一下这一点。”
- Level 4：整篇演讲都是为这一个特定受众量身打造的——你使用他们的语言，预判他们可能提出的反对意见，并随着演讲推进不断调整。

**你的表达：**
- Level 1：你低头看着稿纸朗读演讲。
- Level 2：你偶尔抬头。你的声音听得见，但基本没有变化。
- Level 3：你使用提示笔记，而不是完整稿件。你会与听众进行眼神交流，并有意识地调整语速、音量和重音。
- Level 4：你几乎不需要笔记。你的表达自然、自信。你的肢体语言和声音都在为你的论点服务。

### 校准说明

**标记的关键决策点：**

1. **修辞手法中的第 2 级与第 3 级：** 区别在于修辞手法是存在，还是发挥了作用。可以问：“如果删掉这个反问句，演讲的说服力会减弱吗？”如果会 → 第 3 级（它发挥了作用）。如果不会 → 第 2 级（它只是装饰性的）。

2. **论证与结构中的第 3 级与第 4 级：** 第 3 级具有清晰、合乎逻辑的论证。第 4 级具有策略性的论证——内容顺序经过刻意安排，并且回应了反方论点。如果演讲提出了有价值的观点，但没有特定顺序 → 第 3 级。如果内容顺序本身体现出策略性思考（逐步推向高潮、把最有力的观点留到最后）→ 第 4 级。

3. **表达独立于内容。** 学生可能以极大的自信表达一篇结构糟糕的演讲（表达得分高、论证得分低），也可能用单调的语调表达一篇精彩的演讲（论证得分高、表达得分低）。应分别对每项标准进行评分。

4. **第 2 级与第 3 级之间的临界情况：** 这是最常见的临界情况。如有疑问，可以问：“学生只是在做这件事（使用某种修辞手法、面向听众），还是在有目的地做这件事（使用修辞手法来达到特定效果、针对听众的具体关注点进行表达）？”有目的 → 第 3 级。只是机械完成 → 第 2 级。

---

## 已知局限

1. **评分标准描述了表现，但没有解释如何改进。** 学生阅读评分标准后，知道自己在修辞手法方面处于第 2 级，也知道需要采取哪些不同做法（有目的地整合修辞手法），但可能不知道如何做到。评分标准应与教学和反馈结合使用，向学生展示如何从一个级别提升到下一个级别。可与 Feedback Quality Analyser 结合，以获得有针对性的改进建议。

2. **四个级别是一种务实的折中方案。** 有些任务需要更多级别来区分细微差异，或者需要更少级别来简化评估。四个级别在可靠性（级别足够多，能够提供有价值的信息）和可用性（级别足够少，便于实际使用）之间取得了平衡。如果评分标准用于高风险评分，可能需要补充更多级别描述。

3. **描述性语言更难撰写，但比评价性语言更有用。** 评分标准避免使用“好”“优秀”和“差”等词语，因此每个单元格会更长，也更具体。这是一种有意为之的权衡——评价性评分标准更简短，但对反馈的帮助较小。教师可能需要一些时间来适应描述性的评分标准语言。