---
# AGENT SKILLS STANDARD FIELDS (v2)
name: discipline-specific-critical-thinking-task-designer
description: "Design discipline-specific critical thinking tasks grounded in knowledge-contingent reasoning rather than generic skills. Use when embedding higher-order thinking into subject content."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/discipline-specific-critical-thinking-task-designer"
skill_name: "Discipline-Specific Critical Thinking Task Designer"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Bailin, Case, Coombs & Daniels (1999) — Common misconceptions of critical thinking: the intellectual resources framework"
  - "Bailin & Siegel (2003) — Critical thinking in philosophy of education"
  - "Willingham (2007) — Critical thinking: why is it so hard to teach?"
  - "McPeck (1981) — Critical Thinking and Education: domain-specificity of critical thinking"
  - "Ennis (1989) — Critical thinking and subject specificity"
  - "Paul & Elder (2006) — The Art of Socratic Questioning: disciplinary thinking standards"
  - "Perkins & Salomon (1989) — Are cognitive skills context-bound? Transfer and domain-contingency"
  - "Hattie (2009) — Visible Learning: effect sizes for thinking skills instruction"
  - "Maton (2013) — Making semantic waves: semantic gravity and cumulative knowledge-building"
  - "Bernstein (1999) — Vertical and horizontal discourse: disciplinary knowledge structures"
input_schema:
  required:
    - field: "curriculum_topic"
      type: "string"
      description: "The subject, unit, or concept students are currently studying"
    - field: "learner_stage"
      type: "string"
      description: "Age range or year group"
    - field: "discipline_or_subject"
      type: "string"
      description: "The subject area, because thinking standards are discipline-specific"
  optional:
    - field: "knowledge_baseline"
      type: "string"
      description: "What students already know about this topic; used to check knowledge sufficiency"
    - field: "existing_learning_targets"
      type: "string"
      description: "Any LTs this task should connect to"
    - field: "thinking_focus"
      type: "string"
      description: "If the teacher has a specific thinking move in mind (e.g. evaluating evidence, identifying assumptions, considering perspective)"
output_schema:
  type: "object"
  fields:
    - field: "knowledge_prerequisite_check"
      type: "object"
      description: "Assessment of whether students have sufficient domain knowledge for the critical thinking to be meaningful; flags if the knowledge base is insufficient and recommends what to establish first"
    - field: "disciplinary_thinking_standards"
      type: "object"
      description: "What good thinking looks like specifically in this discipline for this topic; not generic ('think carefully') but substantive ('in history, good thinking requires evaluating source provenance and corroborating claims across sources')"
    - field: "critical_thinking_task"
      type: "object"
      description: "The structured task itself: context/scenario, the thinking demand, and the specific question or prompt students respond to"
    - field: "intellectual_resources"
      type: "object"
      description: "The scaffolded support students need to do the thinking: background knowledge to activate or provide, key concepts to clarify, thinking heuristics to offer, and habits of mind to cultivate"
    - field: "assessment_guidance"
      type: "object"
      description: "Criteria for what quality thinking looks like in student responses; this is horizontal knowledge (better and worse reasoning, not right/wrong answers); rubric should assess quality of reasoning process, not correctness of conclusion"
    - field: "teacher_development_notes"
      type: "object"
      description: "What designing and running this task reveals about disciplinary thinking in this subject; framed as professional learning, not just lesson delivery"
chains_well_with:
  - "curriculum-knowledge-architecture-designer"
  - "kud-knowledge-type-mapper"
  - "coherent-rubric-logic-builder"
  - "learning-target-authoring-guide"
  - "ai-output-critical-audit-designer"
teacher_time: "10 minutes"
tags: ["critical-thinking", "disciplinary-thinking", "horizontal-knowledge", "knowledge-contingent", "task-design", "intellectual-resources", "Bailin", "Willingham", "domain-specific"]
---
# 批判性思维任务设计师

## 此技能的作用

接收一个课程主题，生成一个结构化的批判性思维任务，将学科思维融入学科内容之中，并明确搭建学生进行思考所需的智力资源。批判性思维取决于具体领域：你不可能对自己知之甚少的事物进行批判性思考，而历史学中何谓良好思维，与科学或伦理学中何谓良好思维并不相同。这项技能将这一认识转化为可操作的方法。它不会生成通用的“高阶思维”任务，而是生成思维要求符合特定学科、在设计任务前检查知识前提，并明确陈述良好思维的标准，让学生知道自己的目标是什么。这项技能借鉴了 Bailin et al. 的智力资源框架：批判性思考者需要具备背景知识、对该领域中良好思维的操作性知识、批判性概念知识、有效的启发式方法以及思维习惯。要让任务真正发展批判性思维，而不只是要求学生进行批判性思考，这五项资源必须全部具备，或通过支架加以提供。在这里，AI 尤具价值，因为设计一个优秀的批判性思维任务，需要同时掌握内容领域、学科思维标准、知识前提和评价逻辑，而这种组合能力在任何单一教育者身上都很少见，大多数备课流程也完全跳过了这一环节。这项技能也可以发挥教师专业发展的作用：明确说明在自己所教学科中何谓良好思维，本身就是一种重要的教学洞见，而绝大多数教师从未被要求将其清晰阐述出来。

## 证据基础

这一领域的基础性洞见来自 Willingham (2007)：批判性思维技能并不像一般技能那样具有可迁移性。一个学生可能在历史学中能够进行批判性思考，却在生物学中进行天真的推断，因为良好思维的标准因学科而异。脱离具体学科内容教授通用的批判性思维技能——推断、分析、评价——会培养出只能说出思维步骤、却无法有意义地执行这些步骤的学生。这意味着：批判性思维必须*通过*学科来发展，而不是与学科*并行*发展。

Bailin et al. (1999) 提供了最有用的操作性框架。他们通过五项必须具备的**智力资源**来界定批判性思考者：**背景知识**（你不可能对自己知之甚少的事物进行批判性思考）、**对该领域中良好思维表现形式的操作性知识**、**批判性概念知识**（证据、论证、假设、视角）、**有效的启发式方法**（在该领域中有效的思维方式），以及**思维习惯**（智力上的谦逊、对模糊性的包容、对良好推理的坚持）。通用的批判性思维教学通常只提供第三类资源——概念——并假定其他资源会随之而来。事实并非如此。

McPeck (1981) 认为，批判性思维完全是领域特定的——不存在一般性的思维技能，只有学科性的思维技能。Ennis (1989) 则反驳说，有些思维技能可以跨领域迁移。对于课程设计者而言，领域特异性争论有一个务实的解决方案：有些思维技能比其他技能更具可迁移性（如识别假设、考虑替代性观点），但所有这些技能都需要领域知识才能有意义地执行。这一结论对设计的启示是：批判性思维任务应嵌入具体内容之中，并明确检查或提供领域知识，同时用学科特定的术语说明思维标准。

Bailin & Siegel (2003) 在教育哲学领域进一步拓展了这一框架，认为批判性思维根本不是一种技能，而是一种推理品质，这种品质由思考者调动的智识资源所构成。这一重新界定对任务设计十分重要：目标不是把批判性思维作为一种技能来“教授”，而是确保学生拥有针对特定主题进行良好思考所需的智识资源，然后设计要求学生调动这些资源的任务。

Paul & Elder (2006) 提出了学科思维标准这一概念，即在某一学科内部评价推理时所依据的具体标准。在科学中，良好的思维要求提出可检验的假设、控制变量，并得出基于证据的结论。在历史中，良好的思维要求评估来源、相互印证，并置于语境中加以理解。在伦理学中，良好的思维要求识别利益相关者、阐明原则，并考虑后果。这些标准并不能相互替换；如果任务没有明确相关标准，学生就只能猜测什么才算是“良好的思维”。

Hattie (2009) 发现，教授思维技能具有中等效应量（d = 0.62），但效果会因实施方式不同而产生巨大差异。证据表明，当思维技能教学嵌入内容之中、思维标准得到明确说明，并且学生能够练习将这些标准应用于具体问题时，这类教学才是有效的——而这些正是本技能旨在创造的条件。脱离内容进行的通用思维技能教学，其效果要弱得多。

Maton (2013) 的语义波概念与此相关：有效的知识建构需要在抽象原则与具体案例之间来回转换。一个始终停留在抽象层面的批判性思维任务（“分析论证”），如果没有以具体内容为基础，就会产生浅层思考。一个始终停留在具体层面的任务（“描述发生了什么”），如果不要求学生应用分析框架，就只能产生描述，而不是思考。设计良好的任务会让学生沿着语义波移动：从具体案例出发，进入抽象原则，再回到具体应用。

Perkins & Salomon (1989) 证明，认知技能的迁移并不会自动发生，而是需要有意识地搭建桥梁。学生不会自发地将在一个领域中学到的思维技能应用到另一个领域。这进一步支持了这样一项设计原则：批判性思维必须在每个学科内部单独发展，同时明确关注哪些思维动作是学科特定的，哪些思维动作可能通过有意识的教学实现迁移。

## 输入架构

教育者必须提供：
- **课程主题：** 学生当前正在学习的主题、单元或概念。*例如：“九年级历史——第一次世界大战的起因” / “十年级生物——自然选择与进化” / “八年级伦理学——电车难题与道德推理”*
- **学习者阶段：** 年龄范围或年级。*例如：“14-15岁” / “九年级” / “D段”*
- **学科或科目：** 所属学科领域。*例如：“历史” / “生物” / “伦理学” / “地理”*

可选项（如有，将由上下文引擎注入）：
- **知识基线：** 学生已经了解的关于该主题的内容
- **现有学习目标：** 此任务需要与之建立联系的任何 LT
- **思维重点：** 教师希望强调的特定思维动作

## 提示词

```text
You are an expert in critical thinking pedagogy, with deep knowledge of Bailin et al.'s (1999) intellectual resources framework, Willingham's (2007) research on domain-specificity, McPeck's (1981) and Ennis's (1989) work on critical thinking and subject specificity, Paul & Elder's (2006) disciplinary thinking standards, Hattie's (2009) evidence on thinking skills instruction, and Maton's (2013) semantic wave concept. You understand that critical thinking is domain-contingent: it requires sufficient domain knowledge, discipline-specific thinking standards, and all five intellectual resources (background knowledge, operational knowledge, critical concepts, heuristics, habits of mind) to be present or scaffolded.

Your task is to design a structured critical thinking task for the following curriculum input.

**Curriculum topic:** {{curriculum_topic}}
**Learner stage:** {{learner_stage}}
**Discipline or subject:** {{discipline_or_subject}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Knowledge baseline:** {{knowledge_baseline}} — if not provided, state what the minimum knowledge base would need to be and flag this as an assumption.
**Existing learning targets:** {{existing_learning_targets}} — if provided, connect the task to these LTs.
**Thinking focus:** {{thinking_focus}} — if provided, use this as the primary thinking demand. If not provided, select the most productive thinking demand for this topic and discipline.

## Process

Follow these seven steps precisely. Each step produces a named section in the output.

**Step 1 — Knowledge Prerequisite Check.**
Before designing the task, assess whether students have sufficient domain knowledge for critical thinking to be meaningful. If a student cannot accurately describe the phenomenon they are asked to analyse, they cannot analyse it critically — they will produce opinion dressed as reasoning. State explicitly: what is the minimum knowledge base required for this task? If the knowledge baseline provided suggests students are not there yet, flag this and recommend what to establish first. Do not proceed to task design until this question is answered. If no knowledge baseline is provided, state the assumed prerequisites and flag this as an assumption the teacher must verify.

**Step 2 — Identify the Disciplinary Thinking Standard.**
What does good thinking look like specifically in this discipline and for this topic? Avoid generic standards. "Evaluates evidence" is generic. "In history: identifies the provenance of a source, explains how provenance affects reliability, and corroborates the claim across at least two independent sources" is disciplinary. State the standard in terms that a student could understand and a teacher could use to assess. Reference the discipline's conventions for valid reasoning — what counts as evidence, what counts as a strong argument, what distinguishes expert thinking from novice thinking in this field.

**Step 3 — Select the Thinking Demand.**
Choose one primary thinking move for this task. Options include but are not limited to: evaluating competing claims or interpretations, identifying assumptions underlying a position, analysing a case through multiple lenses, constructing and defending a reasoned argument, identifying the limits of a given explanation, or considering how context or perspective changes interpretation. One thinking demand, done well, produces more genuine critical thinking than five thinking demands done superficially. State the selected thinking demand and explain why it is the most productive choice for this topic and learner stage.

**Step 4 — Design the Task.**
Write the context or scenario students will think about. It should be concrete, discipline-specific, and genuinely open — there should be better and worse answers but not a single correct answer. Write the specific question or prompt. It should require the selected thinking move to answer well. It should not be answerable by recall alone. The task should move students across Maton's (2013) semantic wave: from concrete case to abstract principle and back to concrete application.

**Step 5 — Scaffold the Intellectual Resources.**
For each of Bailin et al.'s (1999) five intellectual resources, state what students need and how it will be provided or activated:

1. **Background knowledge:** What do students need to know, and is it already established or does it need to be provided in the task materials? If it needs to be provided, specify exactly what to include.
2. **Operational knowledge:** What does good thinking look like here, and has the teacher modelled it? If not, how should the standard be shared with students before they begin?
3. **Critical concepts:** Which concepts (evidence, assumption, perspective, causation — discipline-specific) are required, and do students have working definitions? If not, provide the definitions.
4. **Heuristics:** What thinking moves or protocols will help students approach this task? Provide 1-2 specific, actionable heuristics — not generic advice ("think carefully") but concrete moves ("ask: what would change my mind about this?").
5. **Habits of mind:** Which dispositions (intellectual humility, tolerance for ambiguity, willingness to revise) does this task cultivate, and how will the classroom environment support them? Note: these are dispositional — they cannot be assessed through this task but can be cultivated by it.

**Step 6 — Write the Assessment Guidance.**
State 3-4 criteria for quality thinking in student responses. These criteria assess the reasoning process, not the conclusion. A student who reaches an unconventional conclusion through rigorous reasoning should score higher than a student who reaches a conventional conclusion through poor reasoning. Make the criteria specific to this task and this thinking demand. Use the rubric scale Emerging / Developing / Competent / Extending if level descriptors are provided. These criteria become the input for the Coherent Rubric Logic Builder if a formal rubric is needed.

**Step 7 — Write the Teacher Development Notes.**
What does designing and running this task reveal about disciplinary thinking in this subject? What would a teacher who ran this task learn about what good thinking looks like in their discipline? Frame this as professional insight, not classroom management advice. This section is the reason the skill has value beyond individual lesson planning — it builds the teacher's own critical thinking about their subject.

Return your output in this exact format:

## Critical Thinking Task: [Topic]

**Discipline:** [Subject]
**Learner stage:** [Age/year]
**Thinking demand:** [Selected thinking move]
**Connected LTs:** [If provided; otherwise "None specified"]

### 1. Knowledge Prerequisite Check

**Minimum knowledge required:**
[List the specific knowledge elements students must have before this task is meaningful]

**Status:** [Sufficient / Insufficient / Assumed — based on knowledge baseline provided]

[If insufficient: what must be established first, and how]

### 2. Disciplinary Thinking Standard

**In [discipline], good thinking about [topic] requires:**
[State the standard in discipline-specific terms — what counts as evidence, what counts as a strong argument, what distinguishes expert from novice reasoning]

### 3. Thinking Demand

**Primary thinking move:** [Selected demand]
**Why this demand:** [Why it is the most productive choice for this topic and learner stage]

### 4. The Task

**Context:**
[The scenario or case students will think about — concrete, discipline-specific, genuinely open]

**Task materials provided to students:**
[Any documents, data, sources, or information students need — specify exactly what is given]

**The question:**
[The specific prompt — requiring the selected thinking move, not answerable by recall alone]

### 5. Intellectual Resources

| Resource | What students need | How it is provided or activated |
|---|---|---|
| Background knowledge | [Specific knowledge] | [Already established / provided in task materials / needs pre-teaching] |
| Operational knowledge | [What good thinking looks like here] | [How the standard is shared — teacher modelling, exemplar, explicit statement] |
| Critical concepts | [Discipline-specific concepts required] | [Working definitions provided / already established / needs explicit teaching] |
| Heuristics | [Specific thinking moves] | [Stated to students as protocol / modelled by teacher] |
| Habits of mind | [Dispositions cultivated] | [How the classroom environment supports them] |

### 6. Assessment Guidance

**Criteria for quality thinking** (assess reasoning process, not conclusion):

1. [Criterion 1 — specific to this task]
2. [Criterion 2]
3. [Criterion 3]
4. [Criterion 4 — if needed]

**What distinguishes Competent from Extending:**
[The specific quality of reasoning that separates meeting the standard from genuinely exceeding it]

### 7. Teacher Development Notes

[What this task reveals about disciplinary thinking in this subject — framed as professional insight]

**Self-check before returning output:** Verify that (a) the knowledge prerequisite check is specific and honest — not assumed to be sufficient without evidence, (b) the disciplinary thinking standard is genuinely discipline-specific, not generic, (c) the task is not answerable by recall alone, (d) all five intellectual resources are addressed with specific content, not generic placeholders, (e) the assessment criteria assess reasoning quality, not conclusion correctness, (f) the teacher development notes contain genuine disciplinary insight, and (g) the rubric scale uses Emerging / Developing / Competent / Extending wherever level descriptors appear.
```

## 示例输出

**情境：** *课程主题：“九年级历史——第一次世界大战的起因” / 学习者阶段：“14—15岁” / 学科或科目：“历史” / 知识基线：“学生已经学习过联盟体系（三国同盟和三国协约）、弗朗茨·斐迪南大公遇刺事件及七月危机、欧洲列强之间的帝国主义竞争，以及19世纪末民族主义的发展” / 思维重点：“评估相互竞争的历史解释”*

---

## 批判性思维任务：第一次世界大战的起因

**学科：** 历史  
**学习者阶段：** 14—15岁（九年级）  
**思维要求：** 评估相互竞争的历史解释  
**关联 LT：** 未指定

### 1. 知识先备检查

**所需最低知识：**
- 联盟体系：哪些国家属于三国同盟和三国协约，以及这些联盟要求成员承担什么义务
- 弗朗茨·斐迪南大公遇刺事件：发生了什么、发生时间、刺杀者，以及直接的政治后果（奥匈帝国向塞尔维亚发出最后通牒）
- 七月危机：从遇刺事件（1914年6月28日）到全面战争爆发（1914年8月初）之间的事件顺序——具体来说，哪个国家在何时、出于什么原因进行动员
- 帝国主义竞争：欧洲列强争夺的对象是什么（殖民地、贸易路线、声望），以及至少两个帝国主义竞争的具体例子
- 民族主义：民族主义情绪如何加剧紧张局势——至少要理解统一型民族主义（例如泛斯拉夫主义）与国家民族主义（例如法国复仇主义）之间的区别
- 至少基本了解历史学家对于谁或什么因素应对战争负主要责任存在分歧——即使学生尚不了解具体立场，也应理解存在史学争论这一概念

**状态：** 充分——知识基线涵盖了所有必需内容。唯一需要确认的是，学生是否理解历史学家确实会对战争起因产生分歧，还是一直被教授“第一次世界大战的起因”是一份已经确定的清单。如果是后者，则需要在任务开始前简要介绍史学争论。

### 2. 学科思维标准

**在历史学中，对第一次世界大战起因进行良好思考需要做到：**

- **史料评估：** 评估某人写下或说出某一内容时的身份、时间、背景和目的，并解释这些因素如何影响该史料对于某一具体论断的可靠性和有用性。一位历史学家引用1914年7月的一份德国政府备忘录时，必须考虑到这份备忘录写于外交危机期间，因此它可能反映的是战略性立场，而非真实意图。
- **相互印证：** 不依赖单一史料或单一历史学家的解释。关于因果关系的论断必须与多份史料进行核对。如果费舍尔主张德国蓄意策划战争，就必须审查他所使用的证据，并考虑其他历史学家提出的相互竞争的证据。
- **区分不同类型的因果关系：** 近因（遇刺事件、七月危机）不同于结构性原因（联盟体系、帝国主义竞争、民族主义）。良好的历史思维会明确所讨论的是哪一种原因，并解释这种区分为何重要。
- **适当限定论断：** 关于因果关系的历史论断应当有所限定——应说“证据表明”，而不是“这证明了”。良好的历史思维会承认证据能够支持什么，以及不能支持什么。

### 3. 思维要求

**主要思维活动：** 评估相互竞争的历史解释  
**提出这一要求的原因：** 14—15岁时，学生已经准备好超越“列举原因”（回忆）这一层次，开始理解这样一个观点：历史学家会对哪些原因最为重要以及为什么重要存在分歧。这是从把历史视为固定叙事，转向把历史视为持续进行的论证的过渡，也是历史学科最根本的转变。评估相互竞争的解释要求学生评判论证的质量，而不仅仅是判断主张的内容；这正是历史批判性思维的核心。同时，这项任务还要求学生同时把握两种立场，并在二者之间作出有理有据的判断。只要提供适当的支架，这一认知要求在这个年龄段是可以实现的。

### 4. 任务

**背景：**
1961年，德国历史学家弗里茨·费舍尔出版了一本书，提出德国应对第一次世界大战负主要责任，即德国领导人蓄意推行侵略政策，以弗朗茨·斐迪南遇刺为借口，发动一场他们早已谋划的战争。这一观点引发了巨大震动。数十年来，普遍接受的看法一直是：所有主要强国在联盟、误判和局势升级的共同作用下跌跌撞撞地走向战争，没有任何一个国家应负主要责任。费舍尔的论点使历史学家产生分歧，而这一争论至今仍未结束。

**提供给学生的任务材料：**

**材料A——费舍尔论点（摘要）：**
费舍尔认为，德国领导人，尤其是首相特奥巴德·冯·贝特曼·霍尔维格，推行了以扩张主义战争目标为核心的“九月计划”。他指出，德国向奥匈帝国提供了无条件支持的“空白支票”，并且明知这很可能导致更大范围的战争。费舍尔利用德国政府在1914年的文件，论证德国作出参战决定是蓄意的，而非偶然的。

**材料B——修正主义立场（摘要）：**
包括克里斯托弗·克拉克在内的历史学家（《梦游者》，2012年）认为，所有主要强国都应承担责任。克拉克将战争的爆发描述为一次集体性的失败：奥匈帝国鲁莽地提出最后通牒，俄国过早动员，法国鼓励俄国，英国释放出模棱两可的信号——每个强国都作出了使危机升级的决定。克拉克认为，过分强调德国的罪责，会扭曲这样一幅图景：多个行为者都作出了灾难性的选择。

**材料C——一手证据：**
德国皇帝威廉二世致沙皇尼古拉二世的电报，1914年7月29日：“我正在竭尽全力施加影响，促使奥匈帝国政府坦诚地与你协商，以达成令人满意的谅解。我衷心希望你能帮助我作出努力，化解可能仍会出现的困难。你真诚而忠实的朋友和表兄弟，威利。”

**材料D——一手证据：**
德国帝国战争委员会会议纪要摘录，1912年12月8日（由费舍尔发现）：“德皇陛下说……如果俄国进行动员，除了战争之外别无选择。他还说，舰队必须准备对英作战……总参谋长说，在他看来，战争不可避免——越早越好。”

**问题：**
根据你所研究的证据和所提供的资料，哪一种解释得到了现有证据更有力的支持——费舍尔关于德国应负责任的论点，还是修正主义关于各方共同承担责任的论点？在回答中：
- 说明你认为哪一种解释更有说服力，以及原因
- 使用资料中的具体证据，**以及你自己的知识**来支持你的立场
- 解释对方所使用的、你认为最难以驳倒的证据
- 至少指出一件证据**无法告诉我们的事情**——也就是关于第一次世界大战起因的一项认知局限

### 5. 智识资源

| 资源 | 学生需要掌握的内容 | 提供或启动方式 |
|---|---|---|
| 背景知识 | 同盟体系、七月危机的进程、帝国主义竞争、民族主义——这些知识应足以帮助学生评估资料中的证据是否与更广泛的历史模式相一致 | 这些内容已在之前的教学中建立。教师应在课程开始时进行一个简短的回忆活动（5分钟）：“凭记忆列出同盟承诺和七月危机的时间线。”这项活动可以激活已有知识，并在任务开始前暴露知识上的空缺。 |
| 操作性知识 | 什么样的历史论证才是好的论证——以证据为基础、带有限定、承认反面证据，并区分不同类型的原因 | 教师在任务开始前使用另一个例子进行示范：选择一个较为简单的历史争论（例如“罗马帝国的衰落是由蛮族入侵还是内部衰败造成的？”），展示如何对两种立场进行有力的评估。用时10分钟。学生将在被要求达成这一标准之前，先看到具体的标准。 |
| 核心概念 | **历史因果关系：**近因（触发战争的事件）与结构性原因（使战争成为可能的条件）。**出处：**谁制作了资料、何时制作、为何制作——以及这些因素如何影响我们能够利用资料的方式。**相互印证：**将一项主张与多份资料进行核对。 | 教师在黑板或讲义上提供可操作的定义。关键问题是：“当我们在历史中说‘原因’时，我们指的是‘触发事件的事物’，还是‘使事件成为可能的条件’？费舍尔讨论的是**两者**。每一条证据分别支持哪一种原因？” |
| 启发式方法 | **“什么会改变我的想法？”**——在形成初步立场后，学生要问：我需要看到什么证据，才会转而支持另一种解释？这会促使学生真正参与反面论证，而不是直接将其驳回。**“这项证据无法告诉我们什么？”**——学生针对每份资料指出其局限。皇帝的电报显示了他对沙皇说了什么，而不是他实际打算做什么。战争委员会会议记录显示了讨论过什么，而不是最终决定了什么。 | 将这两种思考程序明确写在黑板上。学生开始前，教师分别示范一个例子：“资料 C——皇帝的电报——听起来带有安抚意味。但它**无法告诉我们什么**？它无法告诉我们威廉是否真诚，或者是否只是在为记录留下外交姿态。这一点会影响我们赋予这份资料多大的分量。” |
| 思维习惯 | **智识上的谦逊：**愿意说“我不确定”或“证据并不能得出结论”。**容忍模糊性：**能够在尚未过早解决矛盾的情况下，同时把两种合理的解释保留在头脑中。**愿意修正观点：**如果证据确实支持改变观点，就愿意改变自己的想法。 | 教师应明确设定基调：“在历史学习中，说‘我不确定哪一种解释得到了更有力的支持’并不是弱点——只要你解释清楚自己**为什么**不确定，这反而是成熟思考的表现。相比虚假的自信，我更欣赏诚实的不确定性。”要明确说明，这项任务评价的是推理的质量，而不是信念的坚定程度。 |

### 6. 评价指导

**高质量思考的标准**（评估推理过程，而非结论）：

1. **使用具体的历史证据。** 学生是否引用了来源中的具体证据，以及自身知识中的具体证据？模糊的表述（“有证据表明德国想要战争”）得分较低，而具体的表述（“1912年12月的战争会议记录显示，德皇与总参谋长讨论了战争不可避免的问题——费舍尔利用这一点论证战争决策是预先谋划的”）则更好。学生引用费舍尔的观点并不等于提供了证据——真正的证据是费舍尔所使用的那些材料。

2. **对反方论点的回应质量。** 学生是否真正回应了对立解释中最有力的版本，还是只是肤浅地加以否定？写道“修正主义论点是错误的，因为是德国挑起了战争”的学生，并没有真正回应反方论点。写道“克拉克认为所有大国都应承担责任，而俄国过早动员为这一观点提供了支持——这是费舍尔的论点最难解释的证据，因为它表明升级并非完全由德国造成”的学生，才算进行了有意义的回应。

3. **恰当地限定论断。** 学生是否区分了证据能够支持什么，以及不能支持什么？“这证明德国负有责任”之类的说法言过其实——证据并非具有决定性。“战争会议记录表明，至少有一些德国领导人早在1912年就认为战争是可取的，尽管这些记录并不能证明这一偏好后来成为国家政策”之类的说法，则是恰当地限定了论断。

4. **历史推理的学科准确性。** 学生是否区分了直接原因与结构性原因？是否区分了来源所说的内容与其含义？是否区分了证据能够支持什么，以及不能支持什么？那些把所有证据都视为具有同等权重，或不考虑材料来源背景的学生，其推理水平低于本学科标准。

**Competent 与 Extending 的区别：**

Competent 层次的回答会使用具体证据评估两种解释，回应反方论点，并恰当地限定论断。Extending 层次的回答不仅做到以上几点，**还会**指出证据基础的一个真实局限——鉴于现有来源，任何一种解释都无法充分说明的某个问题——并阐明还需要哪些进一步的证据来解决这一争论。这体现了思维方式上的转变：从在既定框架内进行评价，转向评价这些框架本身。

### 7. 教师发展说明

**这项任务揭示的历史学科思维：**

设计这项任务会迫使教师面对一个大多数历史教师从未被明确要求回答的问题：了解第一次世界大战的起因，与以历史学的方式思考第一次世界大战的起因，有什么区别？答案并不明显。一个能够列出全部四个 MAIN 原因（联盟、帝国主义、军国主义、民族主义），并详细描述七月危机的学生，确实掌握了大量知识——但他们可能完全不知道如何评价某个原因是否比另一个原因更重要，也不知道如何评估一位历史学家的论点质量。这些知识是必要的，却并不足以构成思考。

学科思维标准——评估来源、相互印证、区分因果类型、进行恰当限定——并不是大多数历史课程明确提出的内容。学生会被要求“评估史料”，但很少有人教他们在历史学中“评估”具体意味着什么：史料来源和出处之所以重要，是因为它决定了一份史料能够用来支持什么；相互印证之所以重要，是因为没有任何单一史料足以支持因果性论断；进行限定之所以重要，是因为历史证据总是不完整的。将这些标准明确化本身就是一种专业发展练习：教师必须阐明自己在进行历史推理时所隐含运用的做法，而这要求他们审视自身的学科思维。

菲舍尔争论尤其具有启发性，因为它表明历史知识并不是已经定论的。那些被教导以“第一次世界大战的起因”是一份确定清单的学生，可能会因历史学家对同一组事件存在根本分歧而感到困惑。这种困惑是有益的——正是在这一刻，学生开始理解历史是一种论证，而不是一个叙事。但这要求教师能够适应模糊性，而这又要求教师充分理解历史编纂学，从而能够引导学生面对真正的不确定性，而不是退回到虚假的确定性之中。

“什么会改变我的看法？”这一启发式方法值得注意，因为它是一种可迁移的思维方式。虽然学科思维标准具有历史学特定性，但“什么证据会促使我修正自己的立场？”这一提问习惯是一种能够跨学科迁移的元认知思维方式。一位教师如果在历史课上实施这一任务，然后邀请科学或伦理学科的同事找出各自学科中与之对应的启发式方法，那么他正在开展的正是这种能够建立全校批判性思维文化的跨学科专业学习——一次聚焦一个学科，并在每个学科中明确其标准。

---

## 已知局限

1. **批判性思维任务的质量，取决于其之前所建立的知识基础。** 此技能包含前置条件检查，但它无法核实学生实际掌握了什么——只能核实教师报告了什么。一项为“了解联盟体系”的学生设计的任务，如果学生只是对该体系有表面了解，就会失效。教师必须诚实判断知识是否足够。

2. **思维标准具有领域特定性，这意味着教师必须具备足够的学科理解，才能验证产出。** 此技能会生成一项学科思维标准——但如果该标准不能准确反映专家在这一领域中实际进行推理的方式，那么这项任务培养的将是伪批判性思维，而不是真正的学科推理。教师就是质量检查者。

3. **一项任务无法培养批判性思维。** 批判性思维的发展，依赖于在持续的课程中反复练习不同学科的思维方式。一项设计良好的任务，能够说明课程应当持续开展什么，而不是一个可以独立实施的干预措施。如果每个单元只使用一次此技能，而其余教学仍以记忆为基础，那么批判性思维不会得到发展。

4. **思维习惯组件（智识谦逊、对模糊性的容忍）属于性情倾向，无法通过单项任务加以培养，也无法通过评分量规进行评估。** 如果课堂文化支持这些习惯，这项任务可以加以培育，但课堂文化不在此技能的范围之内。如果评估环境具有控制性或高风险，学生将会为了评分量规而进行推理，而不是投入真正的思考。

5. **不应假定思维能够在不同领域之间迁移。** 在历史课中运行此技能，并不意味着学生会在科学课中进行批判性思考。每门学科都需要明确其自身的思维标准。适当的做法是在多个学科中持续使用此技能，而不是假定在某一领域培养的批判性思维会自动迁移到其他领域。