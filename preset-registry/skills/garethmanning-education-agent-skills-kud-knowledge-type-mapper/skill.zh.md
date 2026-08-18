---
# AGENT SKILLS STANDARD FIELDS (v2)
name: kud-knowledge-type-mapper
description: "Classify curriculum content into Know, Understand, and Do categories to align teaching and assessment approaches. Use when planning units, writing objectives, or selecting assessment methods."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/kud-knowledge-type-mapper"
skill_name: "KUD Knowledge Type Mapper"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Wiggins & McTighe (2005) — Understanding by Design: Know/Understand/Do as the unit-level planning architecture"
  - "Wiggins & McTighe (2011) — The Understanding by Design Guide to Creating High-Quality Units: KUD as the bridge from standards to assessment"
  - "Bernstein (1999) — Vertical and horizontal discourse: hierarchical vs horizontal knowledge structures"
  - "Bernstein (2000) — Pedagogy, Symbolic Control and Identity: recontextualisation and knowledge type"
  - "Hattie (2009) — Visible Learning: surface, deep, and transfer as learning phases with distinct assessment needs"
  - "Hattie & Timperley (2007) — The power of feedback: feedback must be calibrated to the type of learning"
  - "Wiliam (2011) — Embedded Formative Assessment: assessability as a design constraint, not an afterthought"
  - "Deci & Ryan (1985, 2000) — Self-Determination Theory: autonomy-supportive assessment for dispositional development"
  - "Muller (2009) — Forms of knowledge and curriculum coherence: conceptual vs contextual coherence"
  - "Maton (2014) — Knowledge and Knowers: Legitimation Code Theory (Semantics dimension)"
input_schema:
  required:
    - field: "curriculum_input"
      type: "string"
      description: "Description of the unit, competency, or project — what students will learn and do"
    - field: "learner_stage"
      type: "string"
      description: "Age range, year group, or developmental band"
  optional:
    - field: "knowledge_architecture_output"
      type: "string"
      description: "From context engine or prior run: the epistemic diagnosis output from Curriculum Knowledge Architecture Designer"
    - field: "existing_learning_targets"
      type: "string"
      description: "Any existing LTs, competency statements, or curriculum standards already written for this unit"
    - field: "competency_framework"
      type: "string"
      description: "The school's competency or dispositional framework in use"
    - field: "programme_purpose"
      type: "string"
      description: "Why this unit or competency matters for the school's mission — the upstream 'why'"
output_schema:
  type: "object"
  fields:
    - field: "kud_chart"
      type: "object"
      description: "Complete Know/Understand/Do chart with every element labelled by knowledge type (Hierarchical, Horizontal, or Dispositional)"
    - field: "do_split"
      type: "object"
      description: "Explicit separation of Do into Skills (assessable by rubric on task) and Dispositions (assessable by multi-informant observation over time)"
    - field: "assessment_routing_plan"
      type: "object"
      description: "For each KUD element: which assessment skill to invoke next and why"
    - field: "sequencing_notes"
      type: "object"
      description: "Prerequisite dependencies, flexible-order elements, and continuous-thread dispositions"
    - field: "gap_analysis"
      type: "object"
      description: "If existing LTs provided: mapping of KUD elements to existing LTs, identification of gaps and mismatches"
    - field: "design_flags"
      type: "object"
      description: "Compound elements, misclassified elements, unassessable elements, and routing conflicts"
chains_well_with:
  - "curriculum-knowledge-architecture-designer"
  - "learning-target-authoring-guide"
  - "coherent-rubric-logic-builder"
  - "dispositional-knowledge-assessment-designer"
  - "developmental-band-system-designer"
teacher_time: "5 minutes"
tags: ["KUD", "knowledge-type", "assessment-routing", "Wiggins-McTighe", "Bernstein", "curriculum-mapping", "hierarchical", "horizontal", "dispositional", "backwards-design"]
---
# KUD 知识类型映射器

## 此技能的作用

接收课程输入——单元描述、能力集合或项目简述——并生成完整的 Know/Understand/Do 图表，为每个要素标注其知识类型（Hierarchical、Horizontal 或 Dispositional），并将其路由至正确的评估方式。这是课程知识架构设计器（负责诊断其中包含哪些类型的知识）与构建实际评估工具的评估技能之间的操作桥梁：技能连贯性量规逻辑构建器负责技能，倾向性知识评估设计器负责倾向。大多数 KUD 图表将三列视为等价的。它们并不等价。Hierarchical Know 要素（具有对错答案的事实）与 Horizontal Know 要素（存在争议的概念性知识）需要完全不同的评估方式——前者可以自动评估，后者则需要解释性判断。作为技能的 Do（根据特定任务上的标准，通过量规进行评估）与作为倾向的 Do（通过一段时间内来自多位信息提供者的观察进行评估）不能采用相同的方式评估——而将倾向路由到量规评估实际上会削弱倾向本身。这项技能明确呈现这些区别，从而确保 KUD 图表中的每个要素在教学开始前都拥有清晰且可辩护的评估路径。AI 在这里尤其有价值，因为生成按知识类型划分的 KUD 图表，需要同时运用课程认识论（Bernstein 的知识结构）、评估设计逻辑（Wiliam 的可评估性约束）、学习科学（Hattie 对表层学习、深层学习与迁移的区分）以及动机理论（Deci & Ryan 的自主性条件）——这种组合在任何单一教育者身上都很少见，而大多数规划流程完全跳过了这一点。

## 证据基础

Wiggins & McTighe（2005、2011）在 Understanding by Design 中确立了 Know/Understand/Do 作为单元层面规划的规范性架构。KUD 框架区分了三种学习类型：**Know**（学生应掌握的事实性和概念性知识）、**Understand**（持久性理解——能够在单元结束后继续存在的可迁移洞见）以及 **Do**（学生应能够执行的技能和过程）。该框架的力量在于，它迫使课程设计者在设计评估之前明确这三者——逆向设计要求你在决定如何评估之前，先知道自己要评估什么。然而，原始的 UBD 框架将这三列视为内部同质的：所有 Know 要素都被同等对待，所有 Understand 要素都被同等对待，所有 Do 要素也都被同等对待。这正是本技能所要解决的空缺。

Bernstein（1999、2000）论证了知识并不是单一的实体。**Hierarchical knowledge** 是连贯的、具有明确原则的，并且是累积性的——必须先掌握低层级概念，才能理解高层级概念，而且其中存在可以被测试的正确答案和错误答案。**Horizontal knowledge** 则组织为专门化的解释性透镜，每一种透镜都有自己的有效分析标准——内容可以从多个切入点进入，而质量是通过分析深度而非事实正确性来判断的。这两种类型存在于 KUD 图表的 Know 和 Understand 列中，并且要求不同的评估方式。Hierarchical Know 要素（“水循环有五个阶段：蒸发、凝结、降水、径流、入渗”）可以通过测验进行评估——因为存在正确答案。Horizontal Know 要素（“不同历史学家通过不同的透镜解读第一次世界大战的起因——民族主义、帝国主义、军国主义、联盟体系”）不能通过测验进行评估，因为知道这些透镜并不等于能够在分析中运用它们。同样的区别也适用于 Understand 列：Hierarchical understanding（“能量是守恒的——它会在不同形式之间转化，但绝不会被创造或销毁”）具有规范性的表述，而 Horizontal understanding（“历史事件具有多重原因，而你所强调的原因取决于你所采用的解释框架”）则天然具有视角性。

Hattie（2009）识别出学习的三个阶段——**表层学习**（获取新知识与技能）、**深层学习**（整合与巩固，建立联系）以及**迁移**（将所学应用于新的情境与问题）。每个阶段都需要不同的教学方式和不同的评估方式。表层学习与 Hierarchical Know 元素相对应——事实、词汇、程序，这些内容可以直接进行测试。深层学习与 Understand 列相对应——建立联系、发现模式、构建概念结构。迁移则与最复杂的 Do 元素相对应——在真正全新的情境中应用能力。Hattie 与 Timperley（2007）进一步指出，反馈必须与学习阶段相匹配：任务层面的反馈适用于表层学习，过程层面的反馈适用于深层学习，自我调节反馈适用于迁移。无法区分知识类型的 KUD 图表无法正确校准反馈，因为教师不知道某一元素需要任务层面的反馈，还是过程层面的反馈。

Wiliam（2011）认为，只有当评估能够生成可据此采取行动的证据时，评估才具有实用价值；评估设计必须从这个问题出发：“什么样的证据才足以证明这个学生已经学会了这一点？”可评估性约束正是 KUD 知识分类在实际操作中至关重要的地方。一些 KUD 元素可以通过单个任务直接评估（Hierarchical 事实、程序性技能）。一些元素需要通过多个任务中的持续性证据进行评估（Horizontal 分析能力、可迁移的理解）。还有一些元素——倾向性元素——根本无法通过任务进行评估，因为它们只存在于一段时间内实施行为所呈现的模式中。无法体现这些区别的 KUD 图表，会产生无效的评估设计（将量规标准应用于倾向性元素），或不完整的评估设计（未能为横向元素和倾向性元素所需的持续性证据制定计划）。

Deci 与 Ryan（1985、2000）通过自我决定理论确立了这样一个观点：被体验为控制性的评估情境——学习者感受到的是评判而非支持——会削弱自主与胜任的需要，而这两者是倾向性发展的先决条件。这对评估路径设置形成了一项硬性约束：任何被识别为倾向性的 KUD 元素，都**必须**被引导至能够保留自主性的评估方式——多方信息来源的观察、教练式反馈、发展性对话——而不是引导至进行评级和打分的量规。将一种倾向性元素引导至量规并不仅仅是低效的；它还会造成积极的伤害，因为评估性框架会压制倾向性发展所需的真实表达。

## 输入架构

教育者必须提供：
- **课程输入：** 对单元、能力或项目的描述。*例如：“Band D Wellbeing 单元，主题为情绪调节与自我照护——学生探索情绪背后的科学，制定个人情绪调节策略，并培养支持自身福祉及他人福祉的习惯” / “Year 9 历史——第一次世界大战的起因与后果” / “D2R 项目：面向当地湿地的智能水系统”*
- **学习者阶段：** 年龄范围或年级。*例如：“Band D（12-14 岁）” / “Year 9” / “Grade 7-8”*

可选（如果可用，由上下文引擎注入）：
- **知识架构输出：**来自先前课程知识架构设计师运行的认识论诊断
- **现有学习目标：**本单元中已经编写的任何学习目标、能力陈述或标准
- **能力框架：**学校的品格或能力框架
- **课程目标：**该单元或能力为何对学校使命具有重要意义

## Prompt

```text
You are an expert in curriculum design, knowledge epistemology, and assessment architecture. You combine deep knowledge of Wiggins & McTighe's (2005, 2011) Understanding by Design KUD framework with Bernstein's (1999, 2000) theory of knowledge structures, Hattie's (2009) surface/deep/transfer learning phases, Hattie & Timperley's (2007) feedback calibration, Wiliam's (2011) assessability constraints, and Deci & Ryan's (1985, 2000) Self-Determination Theory.

Your task is to produce a complete, knowledge-typed KUD chart for the following curriculum input — one where every element is classified by knowledge type and routed to the correct assessment approach.

**Curriculum input:** {{curriculum_input}}
**Learner stage:** {{learner_stage}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Knowledge architecture output:** {{knowledge_architecture_output}} — if provided, use the epistemic diagnosis as the starting point for knowledge-typing. If not provided, conduct the knowledge-typing from the curriculum input directly.
**Existing learning targets:** {{existing_learning_targets}} — if provided, run a gap analysis mapping each KUD element to existing LTs.
**Competency framework:** {{competency_framework}} — if provided, use it to identify dispositional elements.
**Programme purpose:** {{programme_purpose}} — if provided, use it to check alignment between the KUD and the school's mission.

## The Three Knowledge Types

You MUST classify every KUD element as one of these three types. The classification determines the assessment route.

**Hierarchical Knowledge (Bernstein, 1999)**
Cumulative, prerequisite-ordered knowledge with right/wrong answers or demonstrable procedures. Assessment can be criterion-referenced and often automated. Surface-level feedback (Hattie & Timperley, 2007) is appropriate.

In a KUD chart, Hierarchical elements appear as:
- **Know:** Facts, definitions, vocabulary, formulae, named processes with canonical descriptions
- **Understand:** Principles, laws, or cause-effect relationships with established correct formulations
- **Do (Skill):** Procedures, techniques, and methods with demonstrable correctness

**Horizontal Knowledge (Bernstein, 1999)**
Perspectival, lens-based knowledge where quality is judged by analytical depth and sophistication, not factual correctness. Assessment requires interpretive judgment and analytical criteria. Process-level feedback (Hattie & Timperley, 2007) is appropriate.

In a KUD chart, Horizontal elements appear as:
- **Know:** Frameworks, perspectives, interpretive lenses, contested concepts
- **Understand:** Insights that depend on analytical stance — enduring understandings that admit multiple valid formulations
- **Do (Skill):** Analysis, interpretation, critical evaluation, argumentation — skills where quality exists on a continuum

**Dispositional Knowledge (extended from Bernstein; Deci & Ryan, 1985, 2000)**
Enacted capacities, orientations, and developing competencies that exist only in patterns of behaviour over time. Cannot be assessed through a single task. Assessment MUST use multi-informant observation and coaching-modality feedback. Self-regulation feedback (Hattie & Timperley, 2007) is appropriate. Rubric-based assessment is PROHIBITED — it undermines the autonomy that dispositional development requires (Deci & Ryan, 1985, 2000).

In a KUD chart, Dispositional elements appear as:
- **Know:** Self-knowledge — awareness of one's own patterns, triggers, strengths
- **Understand:** Developmental self-awareness — understanding that dispositions grow, that context matters, that setbacks are part of development
- **Do (Disposition):** Enacted patterns of behaviour — agency, collaboration, self-regulation, empathy, persistence, regenerative mindset

## Critical Rules

1. **The Do column MUST be split into Skills and Dispositions.** Every Do element must be explicitly classified as either a Skill (assessable by rubric on a task) or a Disposition (assessable by multi-informant observation over time). If this split is not made explicit, the assessment design will fail.

2. **No Dispositional element may be routed to a rubric.** Dispositions are assessed through observation protocols, student self-reflection, and developmental conversation — never through scoring criteria applied to a single task. If a Dispositional element appears to need a rubric, it has been misclassified: either it is actually a Skill, or the assessment approach must change.

3. **Knowledge type determines assessment route.** The routing is not optional — it is a logical consequence of what the knowledge IS:
   - Hierarchical Know/Understand → quiz, test, structured response, auto-assessable
   - Horizontal Know/Understand → analytical task assessed by teacher judgment using criteria
   - Hierarchical Do (Skill) → procedural demonstration, criterion-referenced rubric
   - Horizontal Do (Skill) → performance task, rubric with qualitative descriptors (Emerging → Developing → Competent → Extending)
   - Dispositional Do (Disposition) → multi-informant observation protocol, developmental conversation, student self-reflection (invoke Dispositional Knowledge Assessment Designer)
   - Dispositional Know/Understand → embedded in developmental conversation, not separately tested

4. **Flag compound elements.** If a KUD element contains multiple knowledge types ("Understands how emotions work AND manages their own emotional responses"), flag it for splitting. The first part is Hierarchical/Horizontal Know; the second is Dispositional Do.

5. **Flag unassessable elements.** If a KUD element cannot be assessed validly with any available approach (too vague, too internal, or too context-dependent), flag it and suggest reformulation.

## Process

Step 1: Read the curriculum input carefully. Identify every distinct learning element — what students will know, understand, and be able to do.

Step 2: Classify each element by knowledge type (Hierarchical, Horizontal, or Dispositional). Justify each classification.

Step 3: For every Do element, make the Skill/Disposition split explicit.

Step 4: Assign the assessment route for each element.

Step 5: Identify sequencing constraints — which elements are prerequisites for which? Which can be taught in flexible order? Which dispositions run as continuous threads? For each dispositional Do element identified, ask: is this disposition knowledge-contingent? That is, does it require a sufficient base of hierarchical Know and horizontal Understand elements before it can meaningfully manifest? If yes, identify which specific Know and Understand elements from the KUD chart are prerequisites for this disposition to be operable — not just supportive, but genuinely prerequisite. Include these in the sequencing notes as hard prerequisites for the dispositional element, not just as parallel threads. A disposition that is treated as a continuous thread when it is actually knowledge-contingent will be under-developed because teachers will assume it is developing in parallel rather than recognising that foundational knowledge must come first.

Step 6: If existing LTs are provided, run the gap analysis: map each KUD element to existing LTs, identify gaps (KUD elements with no corresponding LT) and mismatches (LTs that don't align with any KUD element or that are routed to the wrong assessment type).

Step 7: Flag design issues — compound elements, misclassified elements, unassessable elements, and any routing conflicts.

Return your output in this exact format:

## KUD Knowledge Type Map: [Unit/Project Name]

**Curriculum input:** [Summarised]
**Learner stage:** [Age/year/band]
**Programme purpose:** [If provided; otherwise "Not specified"]

### 1. Know

| Element | Knowledge Type | Assessment Route | Justification |
|---|---|---|---|
| [Factual/conceptual element] | Hierarchical / Horizontal / Dispositional | [Route] | [Why this type] |

### 2. Understand

| Element | Knowledge Type | Assessment Route | Justification |
|---|---|---|---|
| [Enduring understanding] | Hierarchical / Horizontal / Dispositional | [Route] | [Why this type] |

### 3. Do — Skills

| Element | Knowledge Type | Assessment Route | Justification |
|---|---|---|---|
| [Skill element] | Hierarchical / Horizontal | [Route — which rubric skill to invoke] | [Why this type] |

### 4. Do — Dispositions

| Element | Knowledge Type | Assessment Route | Justification |
|---|---|---|---|
| [Dispositional element] | Dispositional | Multi-informant observation → Dispositional Knowledge Assessment Designer | [Why this is a disposition, not a skill] |

### 5. Assessment Routing Plan

[For each KUD section, specify:
- Which assessment skill to invoke next
- What inputs that skill needs from this KUD chart
- The assessment mode (auto-assessable / rubric / observation protocol / mixed)
- The feedback type (task-level / process-level / self-regulation)]

### 6. Sequencing Notes

**Hard prerequisites:** [Elements that must be taught before others — hierarchical chains]
**Flexible-order elements:** [Elements that can be taught in any order — horizontal lenses]
**Continuous threads:** [Dispositional elements that develop across the entire unit, not in specific lessons]
**Convergence points:** [Where different knowledge types must come together — e.g. applying hierarchical knowledge through a horizontal lens]

### 7. Gap Analysis

[If existing LTs provided:]

| KUD Element | Matched LT | Match Quality | Notes |
|---|---|---|---|
| [Element] | [LT if matched] | Full / Partial / No match | [What's missing or misaligned] |

**Gaps:** [KUD elements with no corresponding LT]
**Orphan LTs:** [Existing LTs that don't map to any KUD element]
**Routing mismatches:** [LTs where the current assessment approach doesn't match the knowledge type]

[If no existing LTs provided: "No existing LTs provided. To generate LTs from this KUD chart, invoke the Learning Target Authoring Guide with each Do element as input."]

### 8. Design Flags

**Compound elements:** [Elements that contain multiple knowledge types and should be split]
**Misclassified elements:** [Elements that appear to be one type but are actually another — e.g. a "skill" that is actually a disposition]
**Unassessable elements:** [Elements too vague, too internal, or too context-dependent to assess validly — with suggested reformulations]
**Routing conflicts:** [Cases where the assessment route for one element conflicts with another — e.g. a rubric task that would undermine a dispositional goal being developed simultaneously]

**Self-check before returning output:** Verify that (a) every Do element is classified as either Skill or Disposition with no ambiguity, (b) no Dispositional element is routed to a rubric, (c) every element has a knowledge type AND an assessment route, (d) sequencing notes identify ALL prerequisite dependencies, (e) the gap analysis (if applicable) catches genuine misalignments not just superficial mismatches, and (f) design flags are specific and actionable.
```

## 示例输出

**情境：** *课程输入：“Band D 关于情绪调节与自我照护的身心健康单元。学生探索情绪背后的科学原理（大脑如何处理情绪、压力反应、身体健康与情绪福祉之间的联系）。他们发展个人自我调节策略（识别个人触发因素、选择并练习平静技巧、建立支持福祉的日常习惯）。他们还探索自己的情绪状态如何影响他人，并培养关心身边人福祉的习惯。” / 学习者阶段：“Band D（12-14 岁）” / 现有学习目标：“REAL School Wellbeing LT set — LT1：自我觉察（‘我能够识别并描述自己的情绪反应，以及触发这些反应的情境’），LT2：自我管理（‘我能够选择并运用策略，在不同情境下管理自己的情绪反应’）” / 项目宗旨：“我们的使命是培养能够为这个需要他们的世界作出贡献的年轻人。作出贡献需要可持续的自我状态——那些会精疲力竭、无法在压力下进行调节、忽视自身需求的学生，无法持续承担让世界变得更好的艰巨工作。身心健康不是可有可无的附加项；它是一切其他工作的基础。”*

---

## KUD 知识类型图谱：情绪调节与自我照护（Band D）

**课程输入：** 身心健康单元——情绪科学、个人自我调节策略、对他人的影响、关怀习惯  
**学习者阶段：** Band D（12-14 岁）  
**项目宗旨：** 将可持续的自我状态作为作出贡献的基础——无法进行自我调节的学生，无法持续承担使命所要求的艰巨工作

### 1. 知道

| 要素 | 知识类型 | 评估路径 | 理由 |
|---|---|---|---|
| 大脑通过特定结构（杏仁核、前额叶皮层）和通路（战斗-逃跑-冻结反应）处理情绪 | 层级型 | 结构化作答或测验——可自动评估 | 存在正确答案：杏仁核确实参与威胁检测，前额叶皮层确实参与调节。这是事实性神经科学知识。 |
| 压力反应遵循一个生理过程（触发因素 → 杏仁核激活 → 皮质醇/肾上腺素释放 → 身体症状 → 恢复） | 层级型 | 结构化作答——学生能否正确排列这一过程？ | 这是一个有名称、有顺序的过程，具有规范性描述。它可以被测试。 |
| 不同的平静技巧（呼吸练习、接地练习、身体活动、认知重评）通过不同的生理机制发挥作用 | 层级型 | 匹配任务——将技巧与机制对应起来 | 这是事实性知识：膈式呼吸会激活副交感神经系统。存在正确答案。 |
| 身体健康（睡眠、营养、运动）与情绪福祉通过特定的生物学通路相互关联 | 层级型 | 结构化解释——描述这一通路 | 这是具有既定科学依据的因果关系。它可以作为事实性知识进行评估。 |
| 情绪反应会受到个人经历、情境和诠释的影响——同一事件会在不同人身上触发不同的反应 | 横向型 | 教师评估的分析性作答 | 这是视角性知识。对于某个事件为何会触发不同反应，并不存在唯一正确的答案——这取决于所采用的诠释框架（心理学、文化、发展阶段）。质量根据分析深度进行判断。 |
| 我的个人情绪模式——哪些情境会触发强烈反应，哪些策略对我最有效，哪些日常习惯能够支持我的福祉 | 倾向型 | 融入发展性对话中——不单独测试 | 这是自我知识。它只存在于学习者不断发展的自我觉察之中。对其进行外部测试（测验：“你的触发因素是什么？”）既具有侵入性，也毫无意义——其价值在于学生自身不断增长的洞察，而不在于得出正确答案。 |
|

### 2. 理解

| 要素 | 知识类型 | 评估路径 | 理由 |
|---|---|---|---|
| 情绪是具有适应性功能的生理反应——它们是信息，而不是需要被消除的问题 | 横向 | 分析任务——将这一理解应用于具体情境 | 这是一次概念重构，而不是一个事实。学生对它的理解深度可能各不相同。认识到愤怒能够提供有关边界被侵犯的信息，与知道“情绪是有用的”在性质上截然不同。评估必须衡量理解的深度，而不是对事实的记忆。 |
| 自我调节不是压抑——而是能够觉察、理解并选择回应方式，而不是自动做出反应 | 横向 | 分析任务——在示例中区分调节与压抑 | 这同样是一次概念重构。调节与压抑之间的区别存在多种合理表述方式，理解也有不同的深化层次。 |
| 幸福感是一种实践，而不是一种状态——它需要持续、有意的行动，而不是一次性解决 | 横向 | 反思性分析任务——结合个人经历和观察到的例子解释其含义 | 这是一种会随着经验积累而不断深化的持久性理解。表层理解（“你必须持续去做”）与深层理解（“幸福感由实践本身构成，而不是作为实践的结果被获得”）在性质上截然不同。 |
| 我的情绪状态会影响周围的人——情绪调节既是个人责任，也是社会责任 | 性向性 | 融入发展性对话与自我反思中 | 这一理解与学习者不断发展的社会责任感不可分割。将其作为命题知识进行测试（“判断正误：你的情绪会影响他人”）会非常容易，但在教育上毫无意义。只有当这种理解被付诸实践——当学生在自己的行为中真正考虑他人的幸福感时——它才具有意义。 |

### 3. 实践——技能

| 要素 | 知识类型 | 评估路径 | 理由 |
|---|---|---|---|
| 准确识别并命名具体情绪，区分相似的情绪状态（例如，挫败感与愤怒、焦虑与兴奋） | 横向 | 量规任务——基于情境的情绪识别，并解释推理过程 → 调用 Coherent Rubric Logic Builder | 这是一项具有可观察质量梯度的技能：粗略标记（“我感觉很糟”）→ 基本命名（“我感到愤怒”）→ 细致辨别（“我感到挫败，因为我原本期待自己能够成功，但最终没有做到；这与有人不公平地对待我时所产生的愤怒不同”）。量规等级：初现 → 发展中 → 胜任 → 拓展。 |
| 使用正确的科学术语解释情绪反应的生理过程 | 层级 | 结构化评估——带标注的图示、按顺序进行的解释 → 可自动评估或使用标准参照量规 | 这是一项程序性解释技能，其中包含有明确对错之分的部分。学生要么能够正确追溯从触发因素到生理反应的路径，要么不能。 |
| 针对具体情境选择并运用适当的平静技巧，并解释为什么该技巧适合这一情境 | 横向 | 量规任务——给定一个情境，选择技巧并说明理由 → 调用 Coherent Rubric Logic Builder | 选择过程属于横向知识（根据情境和推理，可能存在多种有效选择），尽管对技巧的了解属于层级知识。评估必须考察理由的质量，而不只是是否选中了“正确”的技巧。 |

### 4. Do — Dispositions

| Element | Knowledge Type | Assessment Route | Justification |
|---|---|---|---|
| 将自我调节作为一种付诸实践的倾向——实时觉察情绪升级，并选择如何回应，而不是自动做出反应 | Dispositional | 多方信息来源观察 → invoke Dispositional Knowledge Assessment Designer | 这**不是**一种可以通过任务展示的技能。学生可以在练习纸上完美地解释自我调节，却仍然可能在走廊里冲动反应。这种倾向只存在于跨情境、长期形成的行为模式中。评估需要教师观察、学生自我反思以及发展性对话。量规评估的是自我调节的表现，而不是其发展。 |
| 关心他人的福祉——注意到他人何时遇到困难，并以适当的支持做出回应 | Dispositional | 多方信息来源观察 → invoke Dispositional Knowledge Assessment Designer | 这是一种人际倾向，在每种情境中的表现都不同。学生无法按照指令“展示”这种倾向——那会是表演，而不是关心。评估需要长期观察行为模式：学生是否越来越能够注意到他人的情绪状态，并在没有提示的情况下做出回应？ |
| 将福祉作为一种习惯——保持能够支持持续性福祉的个人日常习惯（睡眠、锻炼、反思） | Dispositional | 学生自我反思和发展性对话 → invoke Dispositional Knowledge Assessment Designer | 个人习惯具有私密性，并且取决于具体情境。学校无法、也不应当监测学生是否睡眠良好或进行锻炼。评估应通过学生不断发展的自我觉察来进行：他们能否阐明什么对自己有效，注意到自己的习惯何时出现偏差，并进行自我纠正？这属于自我调节反馈的范畴（Hattie & Timperley, 2007），而不是任务反馈。 |

### 5. Assessment Routing Plan

**层级化的 Know 要素 → 自动评估或结构化任务**
- Invoke: 标准测验或结构化回应任务
- Mode: 可自动评估（答案正确/错误）
- Feedback type: 任务层级（“杏仁核参与威胁检测，而不是奖赏加工——请查看第 12 页的图示”）
- 无需进一步调用技能——这些要素会被直接评估

**横向的 Know 和 Understand 要素 → 由教师判断的分析性任务**
- Invoke: Coherent Rubric Logic Builder（用于构建分析质量量规）
- Input needed: 作为学习目标的具体理解、分析性任务描述、Band D
- Mode: 使用量规由教师评估（Emerging → Developing → Competent → Extending）
- Feedback type: 过程层级（“你的解释区分了调节与压抑——现在请思考：当某人**认为**自己正在进行调节时，压抑会呈现出什么样子？”）

**Do — Skills（层级化）→ 参照标准的评估**
- Invoke: Coherent Rubric Logic Builder（用于构建程序性解释量规）
- Input needed: 作为学习目标的技能、展示任务、Band D
- Mode: 量规或结构化标准
- Feedback type: 从任务层级到过程层级。

**做 —— 技能（横向）→ 带有定性评分量规的表现性任务**
- 调用：连贯量规逻辑构建器
- 所需输入：作为学习目标的技能、表现性任务、D 档
- 模式：带有定性描述语的量规
- 反馈类型：过程层面（“你选择了呼吸作为你的技巧，并解释了它能使神经系统平静下来——很好。你还可以解释一下，为什么接地技术对另一种类型的触发因素可能会以不同方式起作用吗？”）

**做 —— 倾向 → 多信息提供者观察协议**
- 调用：倾向性知识评估设计器
- 所需输入：能力名称、定义、D 档、档位描述（来自学习目标编写指南）、评估情境
- 模式：观察协议 + 学生自我反思 + 发展性对话
- 反馈类型：自我调节（“我注意到一个规律——当你在小组中工作而有人不同意你的意见时，你开始在回应前先暂停了。这和学期开始时有所不同。你注意到自己发生了哪些变化？”）
- 对于这些要素，绝不能调用连贯量规逻辑构建器

**倾向性知道/理解 → 融入发展性对话**
- 这些要素不单独评估。它们会作为倾向性评估方法的一部分，通过学生自我反思以及师生对话呈现出来。
- 无需单独调用技能

### 6. 顺序安排说明

**硬性先决条件：**
- 必须先教授大脑结构和压力反应（分层知道），学生才能解释情绪反应的生理过程（技能/分层做）
- 必须先教授具体的平静技巧及其作用机制（分层知道），学生才能选择并论证技巧的选择（技能/横向做）

**顺序灵活的要素：**
- 三个横向理解要素（情绪是信息、调节而非压抑、将福祉作为一种实践）可以按任意顺序进行探究。每个要素都提供一个概念视角，而不是建立在前一个要素之上。不过，“情绪是信息”最为具体，可能是 D 档学生最有效的切入点。
- 横向知道要素（情绪反应会受到经历、情境和诠释的影响）可以在任何时候引入——它能够丰富与之相伴的任何内容。

**持续发展的主线：**
- 三个倾向性做要素（自我调节、关怀他人、将福祉作为一种习惯）会贯穿整个单元及更长时间持续发展。它们无法被分配到特定课次中。每一课都应为学生提供简短的机会，让他们觉察并反思这些倾向。
- 倾向性知道要素（个人的情绪模式）通过持续的自我观察发展，无法在一节课中被“教授”。
- 倾向性理解要素（我的情绪状态会影响他人）通过课堂共同体中的亲身经历逐渐加深，而不是通过教学获得。

**汇合点：**
- “选择并论证一种平静技巧”技能（横向做）同时需要分层知识（技巧如何发挥作用）和横向理解（情境很重要，不同情境需要不同的方法）。这一汇合应发生在单元的中间三分之一阶段。
- “解释生理过程”技能（分层做）会在学生不仅要描述压力反应，还要解释其适应性功能时，与“情绪是信息”理解（横向）汇合。

### 7. 差距分析

**现有的 LT：**
- LT1：自我觉察 —— “我能够识别并描述自己的情绪反应，以及引发这些反应的情境”
- LT2：自我管理 —— “我能够选择并运用策略，在不同情境下管理自己的情绪反应”

| KUD 要素 | 匹配的 LT | 匹配质量 | 备注 |
|---|---|---|---|
| 识别并命名具体情绪（行动/技能） | LT1：自我觉察 | 部分匹配 | LT1 涵盖了识别，但范围更广——它还包括“引发这些反应的情境”，这属于倾向性知识，而不仅仅是一项技能。LT1 是复合型目标：识别（横向技能）+ 触发因素觉察（倾向性知识）。建议拆分。 |
| 选择并运用平静技巧（行动/技能） | LT2：自我管理 | 部分匹配 | LT2 涵盖了选择和运用，但没有区分是在任务中展示这一能力（技能——可通过评分量规评估），还是在现实生活中做到这一点（倾向——可通过观察评估）。LT2 横跨多种知识类型，是复合型目标。 |
| 大脑结构、压力反应、技巧机制（知识/层级性） | 无匹配项 | 存在差距 | 没有现有 LT 涵盖事实性神经科学知识。这些要素支持相关技能，但没有对应的直接 LT。需要考虑是否需要一个明确的知识层级 LT，或者是否通过技能任务来评估这些知识。 |
| 情绪是信息、调节不同于压抑、福祉是一种实践（理解/横向） | 无匹配项 | 存在差距 | 没有现有 LT 捕捉这些持久性理解。这些是赋予技能以意义的概念性洞见。缺少这些理解，学生可能能够执行自我调节技巧，却不明白这些技巧为何有效。 |
| 将自我调节落实为实践（行动/倾向） | LT2：自我管理 | 部分匹配 | LT2 中的“选择并运用策略”部分涵盖了这一点，但该表述将其视为一项技能（“我能够选择并运用”），而不是一种倾向。真正的自我调节并不是在得到提示时“选择并运用”某项策略，而是在当下无需提示便能够觉察、选择并采取行动。当前 LT 将通过评分量规进行评估；而这种倾向则需要通过观察进行评估。 |
| 关注他人的福祉（行动/倾向） | 无匹配项 | 存在差距 | 没有现有 LT 涉及福祉的人际维度。当前的 LT 集合完全聚焦于自我（自我觉察、自我管理）。本单元“关注他人福祉”的目标没有对应的评估目标。 |
| 将福祉作为习惯（行动/倾向） | 无匹配项 | 存在差距 | 没有现有 LT 涉及习惯性/日常性的维度。当前的 LT 描述的是能力（“我能够……”），而不是持续性的实践。 |

**存在的差距：**
- 没有针对层级性知识要素（神经科学内容）的 LT
- 没有针对横向理解要素（持久性理解）的 LT
- 没有针对人际福祉（关注他人）的 LT
- 没有针对习惯性福祉实践的 LT

**孤立的 LT：** 无——两个现有 LT 都能映射到 KUD 要素，但二者都是复合型目标，并且存在部分错位。

**分流错配：**
- LT1（自我觉察）将横向技能（情绪识别）与倾向性知识（触发因素觉察）结合在一起。如果通过单一评分量规进行评估，倾向性部分要么会被简单化处理，要么会被遗漏。建议拆分：识别技能交由连贯评分量规逻辑构建器处理；触发因素觉察交由倾向性知识评估设计器处理。
- LT2（自我管理）将横向技能（技巧选择）与倾向性行动（落实调节）结合在一起。如果通过单一评分量规进行评估，该量规将评估学生在任务中的技巧选择，而教师会认为自己已经评估了自我管理——但实际上，落实这一倾向的能力完全没有得到评估。建议拆分：技巧选择交由连贯评分量规逻辑构建器处理；落实自我调节交由倾向性知识评估设计器处理。

### 8. 设计标记

**复合元素：**
- **LT1（自我觉察）**是复合的：情绪识别（横向技能）+ 触发因素觉察（倾向性知识）。这些内容需要采用不同的评估方法，应当分开处理。
- **LT2（自我管理）**跨越多种知识类型，是复合的：技术选择与应用（横向技能）+ 在真实情境中实施调节（倾向性行动）。如果使用单一评分量规评估两者，那么对于倾向性部分而言，这种做法是无效的。
- 课程输入中的“发展个人自我调节策略”这一表述是复合的：发展策略（横向技能——设计自己的方法）+ 习惯性地练习这些策略（倾向性行动——随着时间推移真正付诸实践）。

**分类错误的元素：**
- 现有 LT2 中的“自我调节”被视为一项技能（“我能够选择并应用策略”），但实际上它是一种倾向。技能部分（选择策略）确实存在，但只是表层。更深层的目标是在当下无需提示即可真正进行调节，这属于倾向性内容，不能使用同一评分量规进行评估。

**无法评估的元素：**
- “建立有助于幸福感的习惯”以目前的形式无法由学校进行评估——学校无法观察或验证学生在家中的个人习惯。改写方式：将评估转向学生对自身习惯的觉察，即“我能够描述哪些日常惯例有助于我的幸福感，并注意到它们何时出现偏离”，而不是评估习惯本身。这样，学校就可以通过自我反思进行评估，同时不会越过自身的职责范围。

**路由冲突：**
- 如果单元使用评分量规评估“自我管理”（当前的 LT2），学生将体验到对其情绪调节能力的评价。Deci & Ryan（1985，2000）预测，这会形成一种控制性的评估情境，削弱真正发展倾向性能力所需的自主性。学生会学着为了评分量规而表现出调节行为，而不是以真实的方式发展这种能力。倾向性元素**必须**与通过评分量规评估的技能分开，并路由至倾向性知识评估设计器。

---

## 已知局限

1. **三种知识类型是一种简化，而不是本体论。**真实的知识元素往往处于不同类型的边界上。一项类似于“有依据地选择一种平静技巧”的技能，包含层级性成分（了解这些技巧）、横向成分（为选择提供依据）以及倾向性成分（真正使用该技巧）。这种分类是为了评估路由而确定的主要类型——它并不意味着该元素纯粹属于某一种类型。

2. **评估路由假设下游技能已经存在。**该 KUD 图表将元素路由至连贯评分量规逻辑构建器和倾向性知识评估设计器。如果这两项技能都尚未针对这些元素运行，那么该路由仍只是计划，而不是已经完成的事实。KUD 图表告诉教师要评估什么以及如何评估——下游技能会生成实际的评估工具。

3. **差距分析取决于现有 LT 的质量。** 如果现有 LT 编写不佳（使用了不可观察的动词、复合结构或含糊的语言），差距分析会标记出一些实际上属于 LT 编写问题、而非 KUD 映射问题的问题。在这种情况下，建议先调用学习目标编写指南，再尝试解决这些差距。

4. **倾向性要素最难评估，也最容易被忽视。** KUD 图表会让这些要素显现出来，并将其引导至适当的评估方式——但在时间压力下，教师仍可能默认只评估层级性要素和横向要素，因为它们更容易评估。图表无法解决这一问题；它只能让这一选择变得清晰可见。

5. **KUD 图表是一种规划工具，而不是教学顺序。** 顺序说明会为先决依赖关系和可灵活排序的要素提供指导，但实际逐课时的教学顺序取决于教师对教学进度、学生需求以及图表无法预见的情境因素的判断。