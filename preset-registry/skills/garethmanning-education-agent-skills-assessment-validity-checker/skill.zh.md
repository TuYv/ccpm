---
# AGENT SKILLS STANDARD FIELDS (v2)
name: assessment-validity-checker
description: "Audit a proposed assessment for construct validity, reliability, and alignment to learning objectives. Use when reviewing or quality-assuring assessments before deployment."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/assessment-validity-checker"
skill_name: "Assessment Validity Checker"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Wiliam (2011) — Embedded Formative Assessment"
  - "Messick (1989) — Validity in educational measurement: a unified validity framework"
  - "Kane (2006) — Validation as argument-based approach"
  - "Brookhart (2003) — Developing measurement theory for classroom assessment purposes and uses"
  - "Stobart (2008) — Testing Times: the uses and abuses of assessment"
input_schema:
  required:
    - field: "assessment_description"
      type: "string"
      description: "Description of the proposed assessment — what students do, how it is marked"
    - field: "intended_learning"
      type: "string"
      description: "What the assessment claims to measure"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "assessment_purpose"
      type: "string"
      description: "Formative, summative, diagnostic, or evaluative"
    - field: "marking_approach"
      type: "string"
      description: "How the assessment will be marked — rubric, mark scheme, holistic judgement"
    - field: "stakes"
      type: "string"
      description: "The consequences of the assessment — low stakes (informing teaching), high stakes (grading, reporting)"
output_schema:
  type: "object"
  fields:
    - field: "validity_analysis"
      type: "object"
      description: "Analysis of construct validity, content validity, and consequential validity"
    - field: "reliability_analysis"
      type: "string"
      description: "Analysis of inter-rater reliability and internal consistency"
    - field: "threats_identified"
      type: "array"
      description: "Specific threats to validity with explanations"
    - field: "recommendations"
      type: "array"
      description: "Specific modifications to address identified threats"
chains_well_with:
  - "criterion-referenced-rubric-generator"
  - "formative-assessment-technique-selector"
  - "competency-unpacker"
  - "backwards-design-unit-planner"
  - "curriculum-knowledge-architecture-designer"
  - "kud-knowledge-type-mapper"
teacher_time: "3 minutes"
tags: ["validity", "reliability", "assessment-design", "quality-assurance", "measurement"]
---
# 评估有效性检查器

## 此 Skill 的作用

从三个维度评估一项拟议的评估：有效性（它是否测量了其声称要测量的内容？）、可靠性（不同评分者是否会对分数达成一致？）和真实性（任务是否有意义，且是否要求真正展示预期学习成果？）。输出将识别对有效性的具体威胁——构念无关变异（评估测量的是其声称之外的内容）、构念代表不足（评估未充分覆盖其声称要测量的内容）以及后果效度问题（评估产生的非预期负面影响）——并为每种威胁提供具体、可操作的建议。AI 在此尤其有价值，因为大多数教师设计的评估都包含若没有明确分析框架便难以察觉的有效性威胁——教师设计一项“阅读理解”测试时，可能无意中设计成了一项写作测试；而一项“科学理解”评估实际上可能测量的是读写能力。

## 证据基础

Messick (1989) 将有效性的概念统一为一个单一框架：有效性并非测试本身的属性，而是测试分数的解释和使用的属性。测试在抽象意义上并非“有效”或“无效”——它是针对特定群体、为特定目的而有效。这意味着每项评估都必须依据其预期用途进行评价。Wiliam (2011) 将这一框架应用于课堂评估，表明教师设计的评估中最常见的有效性威胁是构念无关变异——即评估测量的是预期构念之外的内容。例如，一项以“对气候变化的理解”为评估目标的小组展示，实际测量的可能是公开演讲的自信程度、小组互动和技术技能，而非对气候变化的理解。Kane (2006) 提出了一种将验证视为论证的方法：评估的有效性取决于从任务 → 回应 → 分数 → 解释 → 决策这一推理链的强度。这条链中的任何薄弱环节都是对有效性的威胁。Brookhart (2003) 将测量理论调整以适用于课堂情境，主张课堂评估不必达到标准化测试相同的心理测量学标准，但仍必须证明其测量了所声称测量的内容。Stobart (2008) 强调了后果效度——评估对学习产生的影响。如果一项评估促使学生转向表层学习、考试焦虑或策略性行为，而非真正的投入，其后果效度便会受损。

## 输入模式

教师必须提供：
- **评估描述：** 学生需要完成什么以及如何评分。*例如，"Students write a 500-word essay on the causes of WW1, marked against a rubric with four criteria: historical knowledge, analytical argument, use of evidence, and written communication" / "Students complete a 30-question multiple choice test on photosynthesis" / "Students create a poster about healthy eating and present it to the class"*
- **预期学习成果：** 该评估声称要测量的内容。*例如，"Understanding of the causes of WW1 and ability to construct a historical argument" / "Knowledge and understanding of photosynthesis" / "Understanding of nutrition and healthy eating"*
- **学生水平：** 年级。*例如，"Year 10"*

可选（如果可用，由上下文引擎注入）：
- **学科领域：** 课程所属学科
- **评估目的：** 形成性、总结性、诊断性或评价性
- **评分方式：** 评分方法
- **利害程度：** 评估结果所带来的后果

## 提示

```
You are an expert in educational assessment and measurement, with deep knowledge of Messick's (1989) unified validity framework, Wiliam's (2011) approach to classroom assessment validity, Kane's (2006) argument-based validation, and Stobart's (2008) work on consequential validity. You understand that validity is not a property of the test itself but of the interpretation and use of the scores — an assessment is valid FOR a specific purpose, and the same assessment may be valid for one purpose but invalid for another.

Your task is to evaluate the validity of:

**Assessment description:** {{assessment_description}}
**Intended learning:** {{intended_learning}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the assessment description.
**Assessment purpose:** {{assessment_purpose}} — if not provided, infer from the description and stakes.
**Marking approach:** {{marking_approach}} — if not provided, note that marking approach affects reliability and recommend one.
**Stakes:** {{stakes}} — if not provided, analyse for both low-stakes and high-stakes use.

Analyse across these dimensions:

1. **Construct validity (Messick, 1989):**
   - Does the assessment task actually require demonstration of the intended learning?
   - **Construct-irrelevant variance:** Does the assessment inadvertently measure something ELSE? (E.g., a science assessment that requires essay writing also measures literacy; a group project also measures collaboration and social dynamics.)
   - **Construct underrepresentation:** Does the assessment cover enough of the intended construct? (E.g., a test on "understanding photosynthesis" that only asks factual recall questions doesn't assess understanding — it assesses memorisation.)

2. **Content validity:**
   - Does the assessment sample appropriately from the domain of intended learning?
   - Are important aspects of the learning missing from the assessment?
   - Are there aspects of the assessment that go beyond the intended learning?

3. **Reliability (Brookhart, 2003):**
   - Would different markers give the same score? (Inter-rater reliability)
   - Would the same student get a similar score on a different day? (Test-retest)
   - Is the marking scheme clear enough to be applied consistently?

4. **Consequential validity (Stobart, 2008):**
   - What behaviours will this assessment drive? Will students engage in genuine learning or strategic/surface-level preparation?
   - Does the assessment create unfair barriers for specific groups (EAL students, students with learning differences)?
   - Does the assessment format match the learning it claims to measure?

5. **Authenticity:**
   - Does the task require genuine demonstration of the learning, or can a student perform well without actually having learned the intended content?
   - Can the task be completed through memorisation, copying, or procedural compliance without understanding?

Return your output in this exact format:

## Assessment Validity Analysis

**Assessment:** [Brief description]
**Claims to measure:** [Intended learning]
**For:** [Student level]

### Validity Analysis

**Construct validity:** [Analysis of whether the assessment measures what it claims]
**Construct-irrelevant variance:** [What ELSE the assessment measures that isn't intended]
**Construct underrepresentation:** [What aspects of the intended learning are NOT assessed]

### Reliability Analysis

[Analysis of marking consistency and specific reliability concerns]

### Consequential Validity

[What learning behaviours the assessment is likely to drive]

### Threats Identified

[Numbered list of specific validity threats, each with an explanation]

### Recommendations

[Specific, actionable modifications to address each identified threat]

### Overall Verdict

[Summary judgement: is this assessment fit for its stated purpose? What is the single most important modification?]

**Self-check before returning output:** Verify that (a) the analysis addresses construct validity, reliability, and consequential validity, (b) each threat is specific and explained, (c) each recommendation directly addresses an identified threat, (d) the analysis considers the assessment's purpose and stakes, and (e) the verdict is constructive — identifying what to fix, not just what's wrong.
```

## 示例输出

**情境：** *评估描述：“学生制作一张关于气候变化成因的海报，并向全班展示。海报必须至少包含 3 个成因、一个视觉元素（图表或示意图），并且要‘具有视觉吸引力’。总分 20 分：内容（8 分）、视觉设计（6 分）、展示（6 分）。” / 预期学习目标：“学生理解气候变化的成因和影响。” / 学生年级：“Year 9” / 学科领域：“地理”*

---

## 评估效度分析

**评估任务：** 关于气候变化成因的海报展示  
**要测量的能力主张：** 对气候变化成因和影响的理解  
**适用对象：** Year 9 地理

### 效度分析

**构念效度：** 中度担忧。该评估声称要测量学生对气候变化成因和影响的理解，但任务和评分方案同时评估了三个构念：地理知识（8/20 = 40%）、视觉设计能力（6/20 = 30%）和公开演讲能力（6/20 = 30%）。一名对气候变化有深入理解但不会绘画或缺乏演讲自信的学生，得分可能低于一名知识理解较为肤浅、但海报设计精美且展示自信的学生。该评估并未主要测量其声称要测量的内容。

**与构念无关的方差：**
- **视觉设计（6 分）：** 制作一张“具有视觉吸引力”的海报的能力，与对气候变化的理解无关。这部分测量的是艺术/设计技能，以及获取彩色笔、打印机和手工材料的条件——这些资源与社会经济背景相关，而不是与地理理解相关。一名制作出审美效果较差但科学准确的海报的学生会因此受到惩罚。这是最显著的效度威胁。
- **展示技能（6 分）：** 公开演讲的自信程度与地理理解是两种不同的技能。EAL 学生、有言语障碍的学生以及有社交焦虑的学生会因这一部分而处于不利地位。展示过程可能体现学生的理解，但展示方式占 6/20 分，意味着表达风格与科学准确性所占的权重相同。
- **材料获取条件：** 能够打印彩色图片、在家使用电脑或购买海报材料的学生，会获得与学习无关的优势。

**构念代表不足：**
- 该评估要求“至少 3 个成因”，但预期学习目标包括“影响”——尽管影响是所陈述学习目标的一部分，却没有得到评估。
- 该评估没有要求学生解释成因，只要求列出成因。只列出“燃烧化石燃料、森林砍伐、农业”等内容的海报，也可能获得全部内容分。列举属于回忆；解释才体现理解。该评估未能充分代表“理解”这一部分。
- 没有评估各成因之间的关系、相对重要性或证据评估能力——而这些正是该学习目标所隐含的地理思维技能。

### 信度分析

- **“视觉上具有吸引力”**是主观且缺乏明确依据的。两名评分者很可能会对什么算作视觉上具有吸引力产生显著分歧。这一标准的评分者间信度可能低于其他任何部分。
- **内容评分（8 分）**如果评分方案明确规定什么算作一个“原因”，以及达到何种解释程度可以获得每一分，那么这一部分可能具有较高的信度；但按目前的描述，“至少 3 个原因”是一个二元门槛，而不是一个质量等级尺度。一个列出 3 个基本原因的学生，和一个对 5 个原因进行了详细且有证据支持的解释的学生，可能会得到相近的分数。
- **展示（6 分）**没有规定评分标准。评分者可能会以不同方式衡量流畅度、自信程度、眼神交流、音量或内容准确性。如果没有评分量规，信度会很低。

### 后果效度

- **该评估会激励学生重装饰、轻理解。**学生如果意识到 20 分中有 12 分（60%）取决于设计和展示，就会理性地把更多时间投入到视觉效果和排练上，而不是学习内容。这会促使学生采取浅层学习行为。
- **该评估会使 EAL 学生和害羞的学生处于不利地位。**展示部分占 6 分，形成了一道与地理知识无关的障碍。那些对气候变化有深入理解、但因展示焦虑而表现不佳的学生，其得分会低于实际理解水平。
- **该评估会奖励社会经济优势。**能获得打印机、彩纸、马克笔和用于设计的电脑，会让部分学生在占总分 30% 的部分中获得明显优势。这是不公平的。

### 已识别的威胁

1. **重大：视觉设计造成的构念无关方差。**30% 的分数评估的是设计技能，而不是地理知识。这意味着评估得分无法代表其声称要测量的内容。
2. **重大：展示造成的构念无关方差。**30% 的分数评估的是公开演讲能力，使 EAL 学生、焦虑的学生以及存在言语障碍的学生处于不利地位。
3. **中等：构念代表不足。**尽管气候变化的影响属于预期学习内容，但评估并未涉及。对原因的解释也不是必需的——列举即可。
4. **中等：信度较低。“视觉上具有吸引力”具有主观性。展示部分的分数缺乏评分量规。内容评分无法区分解释的质量。**
5. **轻微：后果效度。**分值权重会激励学生重装饰、轻学习。

### 建议

1. **重新分配分值。**内容部分应至少占总分的 70%。将视觉设计调整为 0 分（完全删除这一评分标准），或者上限设为 2 分，评分“视觉信息传达的清晰度”（即图表是否有效传达信息，而不是是否漂亮）。展示部分最多设为 4 分，并采用侧重解释清晰度而非表达自信程度的评分量规。

2. **要求解释，而不仅仅是列举。**将“至少 3 个原因”改为“解释气候变化的 3 个原因，包括每个原因如何导致温室气体浓度升高。”这要求学生具备理解，而不仅是记忆。

3. **补充缺失的构念。** 增加一项要求，同时关注影响和原因，或者调整预期学习目标，使其与评估内容相匹配。对齐必须是双向的。

4. **将“视觉上具有吸引力”替换为“清晰且具有传达性”。** 如果保留视觉元素，应评估图表/示意图是否准确地传达地理信息，而不是评估其外观是否具有吸引力。

5. **为现场展示提供替代方案。** 允许学生提交录制的讲解、一段书面文字，或向教师进行一对一讲解，以替代在全班面前进行展示。这样可以消除公开演讲的障碍，同时仍然评估学生是否能够解释自己的理解。

6. **创建内容评分标准。** 用描述性评分标准替代 8 分制的内容评分，区分列举原因（较低层次）、解释原因（中等层次），以及分析各原因之间的关系和相对重要性（较高层次）。

### 总体结论

按照目前的设计，这项评估**不适合其预期目的**。它声称要测量学生对气候变化的理解，但实际上测量的是地理知识（40%）、艺术技能（30%）和公开演讲能力（30%）的混合能力。最重要的修改是**重新调整分值分配**，使内容理解在评估中占主导地位。如果学生深入理解气候变化的原因和影响，那么无论其海报设计水平或展示时的自信程度如何，都应该获得较高分数。

---

## 已知局限

1. **本分析评估的是文档所描述的评估方式，这可能与实际实施方式有所不同。** 教师如果对设计部分评分较宽松、对内容部分评分较严格，可能会在实践中部分弥补分值分配方面的问题，但结构性问题仍然存在。评估的设计本身，而不仅仅是实施方式，都应当具备效度。

2. **效度始终是相对于目的而言的。** 本分析评估的是该评估对于其**明确说明的**目的（测量学生对气候变化的理解）的效度。如果评估的实际目的还包括培养展示技能，那么效度分析会有所不同，但此时应将该评估标注为测量多个构念。

3. **某些效度威胁是权衡，而不是错误。** 纳入展示环节可能具有合理的教学理由（培养口语表达能力、增强自信）。本分析指出了这些设计选择所带来的效度成本，教师必须决定这些教学收益是否足以抵消效度方面的妥协。关键在于如实说明该评估实际测量的内容。