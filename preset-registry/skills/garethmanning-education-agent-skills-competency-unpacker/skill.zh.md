---
# AGENT SKILLS STANDARD FIELDS (v2)
name: competency-unpacker
description: "Unpack a broad standard or competency descriptor into specific, assessable success criteria and sub-skills. Use when interpreting curriculum standards or writing learning objectives."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/competency-unpacker"
skill_name: "Competency Unpacker"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Wiggins & McTighe (1998, 2005) — Understanding by Design: backward design from desired results"
  - "Marzano & Kendall (2007) — The New Taxonomy of Educational Objectives"
  - "Heritage (2008) — Learning progressions: supporting instruction and formative assessment"
  - "Popham (2007) — The lowdown on learning progressions"
  - "Hattie (2009) — Visible Learning: success criteria and learning intentions"
input_schema:
  required:
    - field: "competency_descriptor"
      type: "string"
      description: "The standard, learning objective, or competency descriptor to unpack"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "curriculum_framework"
      type: "string"
      description: "From context engine: the specific curriculum or standards framework"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: prior attainment data, common gaps"
    - field: "assessment_purpose"
      type: "string"
      description: "Why the competency is being unpacked — for planning, for assessment design, for reporting"
output_schema:
  type: "object"
  fields:
    - field: "observable_indicators"
      type: "array"
      description: "Specific, observable behaviours that demonstrate the competency"
    - field: "prerequisite_knowledge"
      type: "array"
      description: "What students must already know or be able to do before attempting this"
    - field: "common_misconceptions"
      type: "array"
      description: "Typical misunderstandings that interfere with demonstrating this competency"
    - field: "success_criteria"
      type: "object"
      description: "Success criteria at multiple levels — beginning, developing, secure, extending"
chains_well_with:
  - "backwards-design-unit-planner"
  - "criterion-referenced-rubric-generator"
  - "learning-progression-builder"
  - "formative-assessment-technique-selector"
  - "curriculum-knowledge-architecture-designer"
  - "kud-knowledge-type-mapper"
  - "scope-and-sequence-designer"
teacher_time: "3 minutes"
tags: ["competency", "standards", "success-criteria", "unpacking", "curriculum"]
---
# 能力解构器

## 此技能的作用

将一个标准、学习目标或能力描述——通常以抽象、压缩的语言撰写——解构为四个可操作的组成部分：可观察指标（已经达成该能力的学生实际会做什么）、先备知识（必须首先具备什么）、常见误解（通常会出现什么问题），以及多个层级的成功标准（从起步到拓展）。输出结果将晦涩的课程语言转化为具体、可评估、可教授的组成部分。AI 在此特别有价值，因为能力描述本身就是经过有意压缩的——例如“分析作者如何运用语言和结构来达到效果”这一句话，就包含了多种技能、知识领域和不同层次的复杂程度，必须先将其解构，才能进行教学或评估。

## 证据基础

Wiggins 与 McTighe（1998、2005）确立了这样一个观点：有效的课程设计始于明确期望达成的结果，并且大多数课程标准在转化为教学和评估之前，都需要经过充分的“解构”。如果一项标准只写着“学生将理解第一次世界大战的起因”，那么在“理解”被定义为可观察的行为之前，它就无法进行评估。Marzano 与 Kendall（2007）提供了一个用于分类标准认知要求的分类体系——区分提取、理解、分析和知识运用——使教师能够识别一项标准实际要求哪种类型的思维。Heritage（2008）和 Popham（2007）证明，将标准解构为学习进阶——从先备能力到目标能力的一系列子技能——对于教学和形成性评估都至关重要，因为它揭示了学生当前所处的位置以及下一步的需要。Hattie（2009）发现，清晰的成功标准（效应量 0.77）是最具高杠杆作用的教学策略之一，但前提是它们必须用具体、可观察的语言描述成功的表现，而不是换一种说法重复学习目标。

## 输入模式

教师必须提供：
- **能力描述：** 要解构的标准或目标。*例如：“分析作者如何运用语言和结构来达到效果并影响读者” / “运用比和比例（包括比率）解决问题” / “解释环境的变化可能如何影响生物”*
- **学生年级：** 年级。*例如：“九年级”*

可选（如果可用，则由上下文引擎注入）：
- **学科领域：** 课程所属学科
- **课程框架：** 具体的标准框架（例如 National Curriculum、IB、ACARA）
- **学生情况：** 先前达成情况数据、常见缺口
- **评估目的：** 解构该能力的原因

## 提示词

```text
You are an expert in curriculum design and standards-based instruction, with deep knowledge of Wiggins & McTighe's (1998, 2005) Understanding by Design framework, Marzano & Kendall's (2007) taxonomy of educational objectives, and Heritage's (2008) work on learning progressions. You understand that competency descriptors are compressed summaries of complex learning — they must be unpacked into observable, teachable, assessable components before they can guide instruction.

Your task is to unpack:

**Competency descriptor:** {{competency_descriptor}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the competency descriptor.
**Curriculum framework:** {{curriculum_framework}} — if not provided, unpack in general terms applicable across frameworks.
**Student profiles:** {{student_profiles}} — if not provided, assume a typical mixed-ability class at the stated year level.
**Assessment purpose:** {{assessment_purpose}} — if not provided, unpack for general instructional planning.

Apply these evidence-based principles:

1. **Observable indicators (Wiggins & McTighe, 2005; Hattie, 2009):**
   - Define what a student who has achieved the competency actually DOES — observable actions, not internal states.
   - "Understands" is not observable. "Identifies," "explains," "compares," "evaluates," "constructs" are observable.
   - Be specific to the competency: "identifies the effect of a writer's word choice on the reader" is more useful than "analyses language."
   - Include 4–6 specific indicators that collectively cover the competency.

2. **Prerequisite knowledge and skills (Heritage, 2008; Popham, 2007):**
   - What must a student already know or be able to do BEFORE they can work toward this competency?
   - Distinguish between content prerequisites (knowledge needed) and skill prerequisites (abilities needed).
   - These prerequisites become diagnostic checks — if a student can't demonstrate the competency, the prerequisite list helps identify WHERE the gap is.

3. **Common misconceptions (Marzano & Kendall, 2007):**
   - What typically goes wrong when students attempt this competency?
   - Include both conceptual misconceptions (misunderstandings of the content) and procedural errors (mistakes in the process).
   - These become assessment design priorities — good assessments surface these misconceptions.

4. **Multi-level success criteria (Hattie, 2009):**
   - Provide success criteria at four levels: Emerging, Developing, Competent, Extending.
   - Each level should describe what the student CAN do (not what they can't).
   - Levels should be qualitatively different, not just quantitatively different (Competent is not "more of" Developing — it's a different quality of response).
   - Use descriptive language, not evaluative labels.

Return your output in this exact format:

## Competency Unpacked: [Brief descriptor]

**Standard:** [Full competency descriptor]
**For:** [Student level]
**Subject:** [Subject area]

### Observable Indicators

[4–6 specific, observable behaviours that demonstrate this competency]

### Prerequisite Knowledge and Skills

**Content prerequisites (what students must know):**
[Specific knowledge required]

**Skill prerequisites (what students must be able to do):**
[Specific skills required]

### Common Misconceptions

[3–4 typical misconceptions or errors, with explanation of why they occur]

### Success Criteria

| Level | What the student does |
|-------|----------------------|
| **Emerging** | [Description of early, partial demonstration] |
| **Developing** | [Description of growing but inconsistent demonstration] |
| **Competent** | [Description of consistent, accurate demonstration] |
| **Extending** | [Description of sophisticated, independent application] |

### Implications for Teaching

[2–3 key teaching implications — what the unpacking reveals about how this competency should be taught]

**Self-check before returning output:** Verify that (a) all indicators are observable, not internal ("explains" not "understands"), (b) prerequisites are specific enough to be diagnostic, (c) misconceptions are based on common patterns, not hypothetical, (d) success criteria describe what students CAN do at each level, and (e) the four levels are qualitatively distinct.
```

## 示例输出

**情境：** *能力描述：“分析作者如何运用语言和结构来达成效果并影响读者” / 学生年级：“九年级” / 学科领域：“英语语言”*

---

## 能力拆解：分析作者的语言和结构

**标准：** 分析作者如何运用语言和结构来达成效果并影响读者  
**适用年级：** 九年级  
**学科：** 英语语言

### 可观察指标

达到该能力要求的学生能够：

1. **识别具体的语言选择**（单个词语、短语、比喻性语言、句型），并在适用时指出所使用的技巧（隐喻、咝音、用于增强效果的短句）。
2. **解释每一种语言选择对读者产生的效果**——它使读者思考什么、感受到什么或想象到什么——而不是简单地识别技巧。
3. **识别结构选择**（段落长度、开头、结尾、语气转变、按时间顺序还是非线性叙述、句子的位置），并解释这些选择如何塑造读者贯穿全文的阅读体验。
4. **将语言和结构选择与作者的目的联系起来**——解释作者为什么作出这些选择，将技巧与意图联系起来（为了说服、营造紧张感、引发同情、制造震撼）。
5. **准确使用恰当的分析术语**——不仅要说出技巧名称，还要使用分析性词汇：“暗示”“传达”“意味着”“使读者形成……的看法”。
6. **使用嵌入式引文支持分析**，所选引文应具有分析潜力，而不只是因为容易找到。

### 前置知识与技能

**内容前提（学生必须知道什么）：**
- 掌握文学和语言技巧的实用词汇（隐喻、明喻、拟人、头韵、重复、反问、短句、列举）——至少能够一眼识别 10 种技巧
- 理解作者会作出有意的选择——语言是经过精心构思的，而不是偶然形成的
- 了解不同体裁具有不同的目的（说服、告知、描述、论证、叙事），并且技巧服务于目的

**技能前提（学生必须能够做到什么）：**
- 阅读一段文本，识别出看起来重要或有趣的单个词语或短语（在词语层面进行细读）
- 用段落写作，提出清晰的观点并以证据支持
- 区分描述文本中发生了什么（总结）与解释文本是如何写成的（分析）

### 常见误解

1. **“寻找技巧但不进行分析。”** 这是最常见的错误。学生识别出某种技巧（“这里有一个隐喻”），却没有解释其效果。他们被教导要说出技巧名称，却没有被教导如何进行分析。这会产生如下回答：“作者在‘黑暗、危险、死亡般的’中使用了头韵。这很有效。”技巧识别是正确的，但分析并不存在。

2. **“作者这样写是为了让读者想继续读下去。”** 这是套用于每一种技巧的笼统效果陈述。当不知道实际效果是什么时，学生会默认使用这句话。这表明学生能够识别技巧具有某种效果，但无法具体说明这种效果。

3. **“只分析语言，不分析结构。”** 学生关注单个词语和短语（语言），却忽略了文本是如何组织的（结构）。他们分析第 3 段中的隐喻，却没有注意到第 3 段是一个单句段落，并且位于一大段冗长的描写之后——这种结构安排增强了表达效果。

4. **“把技巧本身当作分析。”** 学生写道：“作者使用了一个隐喻来表明……”仿佛指出技巧本身就是分析。技巧是“是什么”；分析则是“如何产生效果”以及“为什么产生这种效果”。指出“隐喻”属于识别；解释这个隐喻如何创造出具体的画面或情感，才属于分析。

### 成功标准

| Level | What the student does |
|-------|----------------------|
| **起步阶段** | 能识别一些语言特征（例如：“作者使用了一个明喻。”）。可能会尝试描述效果，但往往默认使用笼统的表述（“这很有效”/“这让读者想要继续读下去”）。只关注语言；结构分析缺失或流于表面。包含引文，但没有将其自然地融入分析。 |
| **发展阶段** | 能识别语言特征，并开始解释具体效果（“明喻‘冷得像墓碑’暗示了死亡，营造出一种令人不安的氛围”）。尝试进行结构分析，但可能只是描述而非分析（“文本以一个问题开头”）。证据与观点相关，但分析不够稳定——有些要点得到了展开，有些则停留在识别层面。 |
| **熟练阶段** | 能同时分析语言和结构，并具体、充分地解释其效果。能够将技巧与作者的写作目的联系起来（“Priestley 在 Inspector 的演讲结尾使用简短句子‘We are responsible’，有力地传达了他的道德主旨——这种简洁性与 Birling 冗长的演讲形成对比，使读者更愿意相信 Inspector 清晰明确的话语，而不是 Birling 浮夸的言辞”）。引文融入自然，选择恰当。整篇回答中的分析保持一致。 |
| **拓展阶段** | 能提出敏锐且有原创性的分析，考虑多种可能的效果，并判断哪一种最有可能。能够分析语言和结构如何共同发挥作用（“从长而流畅的句子转变为段落结尾处单一而生硬的陈述，映照出人物从否认到醒悟的情感转变——这种结构将语言所描述的变化具体呈现出来”）。可能会考虑不同的解读。分析性词汇准确且多样。 |

### 对教学的启示

1. **最大的差距存在于识别和分析之间。** 大多数学生都能学会发现技巧；但能够解释其效果的学生要少得多。教学应当将更多比例的时间用于“这会产生什么效果？”而不是“这是什么技巧？”。要明确示范二者的区别：将一份只找出特征的回答与一份分析性回答并列展示。

2. **结构分析必须与语言分析分开教授。** 学生容易默认进行词语或短语层面的分析，因为这种分析具体且直观。结构（段落组织、文本层面的模式、关键时刻的位置安排）更加抽象，需要使用不同的分析视角——把文本作为整体来观察，而不是放大单个短语。

3. **成功标准应在学生写作之前与他们分享。** 这四个等级的描述可以用作自我评估工具：“读一读你的回答。你处于发展中水平（能够指出技巧，但并不总能解释其效果），还是胜任水平（能够持续解释技巧是如何产生具体效果的）？你还需要补充什么才能提升一个等级？”

---

## 已知局限

1. **这份拆解反映的是针对所述水平的这一能力的一般性要求。** 特定的考试委员会、课程或学校政策可能会以不同方式定义这一能力，或强调不同的组成部分。教师应将这份拆解与其具体的评价框架交叉参照，并在需要时进行调整。

2. **四个等级的成功标准必然会简化一个连续的能力谱。** 学生的作品存在于一个连续范围内，而不是整齐地归入几个类别。有些回答可能在语言分析方面达到胜任水平，但在结构分析方面仅处于初显水平。这些等级是反馈指南，而不是僵化的分类标准——当一个回答跨越多个等级时，教师必须运用专业判断。

3. **所列出的常见误解是最常见的误解，而不是所有可能的误解。** 学生个人可能会基于先前接受的教学、第一语言或概念框架而产生不同的误解。所列出的误解应被视为诊断性评估的起点，而不是一份详尽无遗的清单。