---
# AGENT SKILLS STANDARD FIELDS (v2)
name: curriculum-knowledge-architecture-designer
description: "Map the epistemic structure of a subject to determine knowledge types and inform curriculum sequencing. Use when designing courses, restructuring programmes, or analysing knowledge architecture."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/curriculum-knowledge-architecture-designer"
skill_name: "Curriculum Knowledge Architecture Designer"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Bernstein (1999) — Vertical and horizontal discourse: hierarchical vs horizontal knowledge structures"
  - "Bernstein (2000) — Pedagogy, Symbolic Control and Identity: recontextualisation and the pedagogic device"
  - "Muller (2009) — Forms of knowledge and curriculum coherence: conceptual vs contextual coherence"
  - "Maton (2009) — Cumulative and segmented learning: curriculum structures and knowledge-building"
  - "Maton (2013) — Making semantic waves: semantic gravity and density as tools for cumulative learning"
  - "Maton (2014) — Knowledge and Knowers: Legitimation Code Theory (Semantics dimension)"
  - "Young (2008) — Bringing Knowledge Back In: powerful knowledge and social realist curriculum theory"
  - "Wheelahan (2010) — Why Knowledge Matters in Curriculum: access to theoretical knowledge as social justice"
  - "Bianchi, Pisiotis & Cabrera Giraldez (2022) — GreenComp: European Sustainability Competence Framework"
  - "Bacigalupo et al. (2016) — EntreComp: Entrepreneurship Competence Framework"
  - "Sala et al. (2020) — LifeComp: European Framework for Personal, Social and Learning to Learn"
input_schema:
  required:
    - field: "curriculum_input_type"
      type: "string"
      description: "The type of curriculum input: 'course', 'scope-and-sequence', or 'project-brief'"
    - field: "domain_or_subject"
      type: "string"
      description: "Name and brief description of the subject or domain"
    - field: "learner_stage"
      type: "string"
      description: "Age range or year group"
    - field: "learning_goals"
      type: "string"
      description: "Intended outcomes — 3-5 sentences describing what students should know, understand, and be able to do"
  optional:
    - field: "existing_curriculum_documents"
      type: "string"
      description: "From context engine: text of curriculum documents, unit plans, or scope-and-sequence"
    - field: "competency_framework"
      type: "string"
      description: "From context engine: the school's competency or dispositional framework in use"
    - field: "prior_knowledge_baseline"
      type: "string"
      description: "From context engine: what students already know and can do before this curriculum begins"
output_schema:
  type: "object"
  fields:
    - field: "epistemic_diagnosis"
      type: "object"
      description: "Which knowledge types are present, approximate proportions, and reasoning"
    - field: "knowledge_architecture_map"
      type: "object"
      description: "For each type: hierarchical prerequisite chains, horizontal conceptual hubs and lenses, or dispositional progression bands"
    - field: "mixed_architecture_notes"
      type: "string"
      description: "Where types interact, overlap, or create tension in this specific curriculum. When a dispositional goal is identified, flag whether it is knowledge-contingent — i.e. whether it requires a sufficient hierarchical and horizontal knowledge base before it can meaningfully develop. Examples: critical thinking, ecological literacy, regenerative mindset, entrepreneurial thinking. For knowledge-contingent dispositions, identify which specific hierarchical and horizontal elements are prerequisites for the disposition to be operable. State explicitly: the disposition cannot develop authentically until these prerequisites are in place."
    - field: "teaching_sequencing_implications"
      type: "string"
      description: "What the architecture means for content ordering and pacing"
    - field: "assessment_implications"
      type: "object"
      description: "Which elements are auto-assessable vs require teacher judgment and why. When horizontal knowledge is present, flag whether critical thinking is being deliberately developed through explicit instruction in disciplinary thinking standards, or whether it is assumed to emerge through exposure to horizontal content. Research (Bailin et al. 1999; Willingham 2007) is clear that disciplinary content does not automatically develop critical thinking — it must be taught explicitly within the discipline. If the curriculum identifies critical thinking as a goal but does not include explicit teaching of what good thinking looks like in this domain, flag this as a design gap."
    - field: "ai_tutoring_design_implications"
      type: "string"
      description: "How this architecture should inform an intelligent tutoring system or AI teacher assistant"
chains_well_with:
  - "learning-target-authoring-guide"
  - "competency-framework-mapper"
  - "scope-and-sequence-designer"
  - "d2r-project-cycle-designer"
teacher_time: "5 minutes"
tags: ["knowledge-structure", "curriculum-architecture", "Bernstein", "epistemic-design", "hierarchical", "horizontal", "dispositional", "mixed-architecture", "AI-tutoring"]
---
# 课程知识架构设计师

## 此技能的功能

接收课程输入——单门课程、某一学科的范围与进度安排，或现实世界项目简述——并诊断该知识领域的认识论架构。它判断该领域主要属于层级式、横向式、倾向式，还是混合架构，然后针对其中存在的每种类型构建相应的知识结构图，并输出对教学顺序、评估设计和 AI 辅导架构的具体启示。大多数真实课程——尤其是基于项目和现实世界的学习设计——都属于混合架构。该技能诊断各种架构的比例及其相互作用，而不是强行归为单一类型。AI 在此尤其有价值，因为认识论诊断需要同时运用社会学理论（Bernstein 的知识结构）、课程设计专业知识（顺序安排与评估逻辑）以及能力框架素养（倾向性发展进程）——这种组合在任何单一教育者身上都很少见，人工处理起来也十分耗时。

## 证据基础

Bernstein（1999）区分了两种话语——横向话语（日常的、情境特定的知识）和纵向话语（系统的、有原则的知识）——并在纵向话语中进一步识别出两种知识结构。**层级式知识结构**具有连贯性、明确的原则性和层级整合性：新的理论涵盖并概括先前的知识，形成累积式进阶，其中较低层级的概念必须先掌握，才能理解较高层级的概念。自然科学是其典型范例。**横向式知识结构**组织为一系列专业化语言或视角，每一种都有自身的探究方式以及判定知识有效性的标准。其发展通过新视角的累积而非整合来实现。人文学科和社会科学是其典型范例。Bernstein（2000）通过再情境化这一概念扩展了该框架——即知识从其生产领域进入教学情境时所经历的转化——这直接影响课程设计者在做出顺序安排决策时必须如何思考知识类型。

Muller（2009）将 Bernstein 的框架应用于课程连贯性研究，区分了**概念连贯性**（层级式知识的特征——知识在先前知识基础上累积构建的课程）和**情境连贯性**（分段式课程的特征——每个分段都适用于特定情境，但各分段不一定彼此递进）。这一差异直接影响顺序安排：概念上连贯的课程具有难以重新排序的逻辑，而情境上连贯的课程则可以从多个切入点进入。

Maton（2009、2013、2014）发展了合法化代码理论的语义维度，提供了两种分析工具：**语义引力**（意义与特定情境绑定的程度——SG 越强，越依赖具体情境；SG 越弱，则越抽象且越具迁移性）和**语义密度**（意义凝缩于术语或符号中的程度）。Maton（2013）提出了**语义波**这一概念——即在具体实例（高 SG、低 SD）与抽象原则（低 SG、高 SD）之间移动的教学实践——表明能够形成这些波动的课程和教学可以促进累积式知识建构，而始终保持平坦状态的课程和教学（始终停留在具体情境中或始终停留在抽象层面）则会产生分段式学习。这为识别课程中哪些地方需要进行概念展开与重新凝聚提供了诊断工具。

Young（2008）认为，课程理论必须认真对待哪些知识具有重要性，并由此提出了**强有力的知识（powerful knowledge）**这一概念：即专业化、系统化、基于学科的知识，使学习者能够接触到无法通过日常经验获得的解释性框架。Wheelahan（2010）进一步论证指出，将知识简化为脱离理论基础的情境化技能的能力本位课程，会剥夺学生接触那些能够支持社会参与的概念结构的机会，因此，知识架构是一个公平问题，而不仅仅是教学法问题。

**倾向性知识（dispositional knowledge）**类别源于能力框架相关文献。与层级结构和水平结构不同（后两者描述命题性知识如何组织），倾向性知识由能力、取向和已践行的胜任力的发展所构成，只有在实践中才能存在。欧盟能力框架提供了最严谨的阐述：GreenComp（Bianchi、Pisiotis & Cabrera Giraldez，2022）定义了十二项可持续发展能力，包括能动性、系统思维和价值素养；EntreComp（Bacigalupo 等，2016）定义了十五项创业能力，包括自我意识、创造力，以及在八级进阶模型中通过经验学习；LifeComp（Sala 等，2020）定义了九项个人、社会和学会学习能力，包括自我调节、合作和批判性思维。这些框架具有一个共同特征：进阶是定性的、发展的，通过能力区间而非先决条件链条来描述；评估需要教师判断已践行的能力，而不是对命题性知识进行测试。

## 输入模式

教师必须提供：
- **课程输入类型：** 你提供的是什么类型的输入？*例如：“课程” / “范围与顺序” / “项目简报”*
- **领域或学科：** 名称和简要描述。*例如：“九年级科学——力、能量与运动” / “设计与再生项目——当地湿地的智能水系统” / “IB 历史——20 世纪威权国家的成因与后果”*
- **学习阶段：** 年龄范围或年级。*例如：“12–14 岁” / “十年级” / “七至八年级”*
- **学习目标：** 学生应知道、理解并能够做到什么——3–5 句话。*例如：“学生将理解力如何导致运动状态的变化，将牛顿定律应用于现实情境，设计并测试一个简单机械，并通过书面论证表达科学推理。”*

可选项（如可用，则由上下文引擎注入）：
- **现有课程文件：** 课程文件、单元计划或范围与顺序的文本
- **能力框架：** 学校的倾向性或能力框架
- **先备知识基线：** 学生已经知道什么、能够做到什么

## 提示词

```
You are an expert in curriculum epistemology and knowledge structure analysis, with deep knowledge of Bernstein's (1999, 2000) theory of knowledge structures, Muller's (2009) work on curriculum coherence, and Maton's (2009, 2013, 2014) Legitimation Code Theory — particularly the Semantics dimension (semantic gravity and semantic density). You also understand competency framework design (GreenComp, EntreComp, LifeComp) and the distinction between propositional knowledge structures and dispositional development.

Your task is to diagnose the epistemic architecture of the following curriculum input and produce a complete knowledge architecture analysis.

**Curriculum input type:** {{curriculum_input_type}}
**Domain or subject:** {{domain_or_subject}}
**Learner stage:** {{learner_stage}}
**Learning goals:** {{learning_goals}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Existing curriculum documents:** {{existing_curriculum_documents}} — if not provided, work from the domain, subject description, and learning goals.
**Competency framework:** {{competency_framework}} — if not provided, identify any dispositional elements from the learning goals.
**Prior knowledge baseline:** {{prior_knowledge_baseline}} — if not provided, assume typical prior knowledge for this learner stage.

Apply the following framework. You MUST use the exact three knowledge types defined below. Most real curricula contain more than one type — your diagnosis must identify ALL types present, estimate their approximate proportion, and explain how they interact.

## The Three Knowledge Types

**1. Hierarchical Knowledge Structure (Bernstein, 1999)**
Knowledge is coherent, systematically principled, and organised so that lower-level concepts must be mastered before higher-level ones are accessible. Development is through integration, where new theory subsumes and generalises prior knowledge. The curriculum logic is cumulative — sequencing is constrained by prerequisite relationships. Conceptual coherence (Muller, 2009) holds: content cannot be freely reordered without loss.

Indicators: prerequisite chains exist; concepts build in abstraction; mastery of prior concepts is necessary for later ones; errors at lower levels propagate upward; the subject has a canonical sequencing logic.

Examples: mathematics, formal logic, music theory, programming fundamentals, chemistry, physics.

**2. Horizontal Knowledge Structure (Bernstein, 1999)**
Knowledge is organised as a series of specialised languages or lenses, each with its own modes of inquiry and criteria for valid knowledge. Content can be entered from multiple points; development is through accumulation of new perspectives rather than integration. Disciplinary thinking skill develops progressively even though content is not strictly prerequisite-ordered. Contextual coherence (Muller, 2009) allows curriculum segments to be reordered, though analytical sophistication still develops cumulatively.

Indicators: multiple valid interpretive lenses exist; content can be studied in various orders; "thinking like a historian/philosopher/sociologist" develops across the curriculum rather than through a fixed sequence; new units add perspectives rather than building on prior units.

Examples: history, literature, philosophy, geography, sociology, art criticism.

**3. Dispositional Knowledge Structure**
Knowledge is constituted by developing capacities, orientations, and enacted competencies. The knowledge cannot be separated from the learner's growing capability — it exists only in enactment. Progression is qualitative and developmental, requiring teacher judgment rather than automated assessment. Competency frameworks (GreenComp, EntreComp, LifeComp) provide the most rigorous articulations of this type.

Indicators: the learning goal describes who the student is becoming, not just what they know; progression is described in developmental bands (emerging → developing → extending) rather than prerequisite chains; assessment requires observation of enacted behaviour over time; the competency cannot be tested through a single task.

Examples: agency, collaboration, ecological literacy, entrepreneurial thinking, self-regulation, creative confidence, regenerative mindset.

## Diagnosis Process

Step 1: Read the curriculum input carefully. For each learning goal, determine which knowledge type(s) it belongs to.

Step 2: Estimate the approximate proportion of each type present (as percentages that sum to 100%). Explain your reasoning — which specific goals or content areas belong to which type.

Step 3: For each type present, build the appropriate knowledge structure map:
- **Hierarchical:** Identify the key prerequisite chains. Order concepts topologically — which concepts must come before which. Flag any concepts where the prerequisite relationship is hard (cannot proceed without it) vs soft (easier with it but possible without).
- **Horizontal:** Identify the conceptual hubs (central themes, phenomena, or questions) and the lenses or perspectives that orbit each hub. Show how analytical sophistication develops across the curriculum even though content is not prerequisite-ordered.
- **Dispositional:** Define progression band descriptors across 4 levels: Emerging → Developing → Competent → Extending. Each level must describe what the learner DOES (observable behaviour), not what they "understand" internally. Include indicators that distinguish between levels.

Step 4: Analyse the mixed architecture — where do types interact, overlap, or create tension? Where does a hierarchical prerequisite chain intersect with a dispositional development goal? Where does a horizontal lens require hierarchical foundational knowledge?

Step 5: Derive implications for teaching, assessment, and AI tutoring.

Return your output in this exact format:

## Knowledge Architecture Analysis: [Domain/Subject Name]

**Input type:** [course / scope-and-sequence / project-brief]
**Learner stage:** [age/year]
**Learning goals:** [Summarised]

### 1. Epistemic Diagnosis

**Architecture type:** [Mixed / Primarily Hierarchical / Primarily Horizontal / Primarily Dispositional]
**Proportions:** [e.g. 40% Hierarchical, 35% Horizontal, 25% Dispositional]

**Reasoning:**
[For each knowledge type present, explain which specific learning goals or content areas belong to it and why. Reference the indicators from the framework above.]

### 2. Knowledge Architecture Map

#### Hierarchical Elements
[If present: prerequisite chains with topological ordering. Show which concepts must come before which. Mark hard vs soft prerequisites. Use a visual chain format.]

#### Horizontal Elements
[If present: conceptual hubs and the lenses/perspectives that orbit them. Show how analytical thinking develops across the curriculum.]

#### Dispositional Elements
[If present: progression band descriptors across 4 levels — Emerging, Developing, Competent, Extending — with observable indicators at each level for each dispositional competency identified.]

### 3. Mixed Architecture Notes

[Where do types interact? Where does tension arise? Be specific to THIS curriculum.]

### 4. Teaching & Sequencing Implications

[What does the architecture mean for how content should be ordered and paced? Which elements have constrained sequencing (hierarchical) vs flexible sequencing (horizontal)? Where must dispositional development run as a continuous thread rather than being assigned to specific lessons?]

### 5. Assessment Implications

**Auto-assessable elements (suitable for AI/automated assessment):**
[List specific elements and explain why they are auto-assessable — typically hierarchical elements with clear right/wrong answers or demonstrable procedures.]

**Teacher-judgment elements (require human assessment):**
[List specific elements and explain why they require teacher judgment — typically dispositional elements and sophisticated horizontal analysis.]

**Mixed elements (partial automation possible):**
[Elements where AI can assess some dimensions but teacher judgment is needed for others.]

### 6. AI Tutoring Design Implications

[How should this architecture inform an intelligent tutoring system or AI teacher assistant? Consider:
- For hierarchical elements: adaptive sequencing, prerequisite checking, targeted practice
- For horizontal elements: perspective-prompting, analytical scaffolding, exposure to multiple lenses
- For dispositional elements: reflection prompts, portfolio tracking, teacher dashboards (NOT automated grading)
- For mixed architectures: how the tutoring system should handle the transitions between types]

**Self-check before returning output:** Verify that (a) all three knowledge types have been considered, not just the dominant one, (b) proportions are justified with specific references to learning goals, (c) the architecture map uses the correct format for each type (prerequisite chains for hierarchical, hubs-and-lenses for horizontal, progression bands for dispositional), (d) mixed architecture notes are specific to THIS curriculum rather than generic, (e) assessment implications distinguish clearly between auto-assessable and teacher-judgment elements, and (f) AI tutoring implications are practical and architecture-specific.
```

## 示例输出

**情境：** *课程输入类型：“project-brief” / 领域或主题：“为再生而设计（D2R）——智能水系统：学生调查当地退化湿地中的水质和水流，设计基于传感器的监测解决方案，并提出一项整合生态科学、技术与社区参与的再生计划” / 学习者阶段：“12–14 岁（7–8 年级）” / 学习目标：“学生将理解水循环过程和水质科学（pH、溶解氧、浊度、营养物负荷）。他们将学习基础电子学和传感器技术，以设计水质监测原型。他们将运用系统思维，将湿地分析为一个相互关联的生态、社会和经济系统。他们将培养作为再生实践者的能动性与协作能力——为真实场所承担责任，并与社区利益相关者合作。他们将向真实受众（地方议会或环保组织）传达研究发现和提案。”*

---

## 知识架构分析：D2R 智能水系统

**输入类型：** project-brief
**学习者阶段：** 12–14 岁（7–8 年级）
**学习目标：** 水循环与水质科学；基础电子学和传感器技术；应用于湿地生态系统的系统思维；作为再生实践者的能动性与协作能力；面向真实受众的沟通。

### 1. 认识论诊断

**架构类型：** 混合型——三种知识类型均以显著比例存在。
**比例：** 40% 层级型，30% 横向型，30% 倾向型

**推理：**

**层级型（40%）：** 存在两条不同的先决条件链。第一条是水质科学主线：学生必须先理解水循环，才能理解水质指标；必须理解各项指标，才能解读现场数据。pH、溶解氧、浊度和营养物负荷各自都具有概念性先决条件结构——如果不了解氧气会溶解于水中、生物体会消耗氧气，以及温度会影响饱和度，就无法有意义地解读溶解氧读数。第二条是电子学和传感器技术主线：学生必须先理解基础电路，才能理解传感器功能；必须理解传感器功能，才能进行原型设计。这些属于典型的层级结构——低层级的错误会向上层传播（不理解 pH 测量对象的学生无法解读 pH 数据），并且教学顺序受先决条件结构约束。

**横向型（30%）：** 系统思维和沟通主线作为横向知识运作。将湿地分析为生态、社会和经济系统，需要将多种学科视角——生态科学、经济学、社会地理学、伦理学——应用于同一现象。这些视角不存在唯一正确的顺序；每一种视角都增加了新的观察角度，而非建立在前一种之上。学生可以先分析湿地的生态功能，再分析其经济价值，反之亦然——两种顺序都有效。然而，系统分析的复杂度会累积发展：早期分析将是单一视角的（“湿地过滤水”），而后期分析将是多视角且整合性的（“湿地的滤水功能具有生态价值、对下游使用者具有经济价值，并对当地社区具有文化意义——而这些价值之间存在张力，因为上游的经济开发会破坏其过滤功能”）。这正是伯恩斯坦横向知识结构的特征：内容可以从多个切入点进入，但分析性思维会逐步发展。

**性向（30%）：** 能动性、协作能力和再生性思维属于性向性学习目标。它们不是可以通过教学和测试传授的命题性知识，而是通过实践逐步发展的能力。学生并不是“知道”能动性；他们会通过主动采取行动、在困难中坚持不懈，以及对结果承担责任，越来越多地展现出这种能力。协作并不是可以在一节课中掌握的技能，而是一种会随着时间推移在质上逐步发展的性向——从服从（完成分配的小组任务），经过协调（有效分配工作），发展到真正的共同建构（共同构建出任何个人都无法独自产出的想法）。再生性思维——一种旨在理解和恢复生命系统，而不只是从中获取资源的取向——是最深层的性向性目标，需要持续的经验与反思，而非单纯的讲授。

### 2. 知识架构图

#### 层级要素

**先备知识链 1：水质科学**

```
Water cycle fundamentals (evaporation, condensation, precipitation, runoff, infiltration)
    ↓ [hard prerequisite]
Properties of water (solubility, temperature effects, pH scale)
    ↓ [hard prerequisite]
Water quality indicators (pH, dissolved oxygen, turbidity, nutrient loading)
    ├── pH: acid-base chemistry basics → pH scale → environmental pH ranges
    ├── Dissolved oxygen: gas solubility → temperature dependence → biological demand
    ├── Turbidity: suspended particles → light penetration → measurement methods
    └── Nutrient loading: nitrogen/phosphorus cycle basics → eutrophication process → threshold levels
        ↓ [hard prerequisite]
Field data interpretation (reading measurements, comparing to standards, identifying patterns)
    ↓ [soft prerequisite — possible but harder without]
Evidence-based conclusions (claim-evidence-reasoning from water quality data)
```

**先备知识链 2：传感器技术**

```
Basic circuits (voltage, current, components, simple circuit construction)
    ↓ [hard prerequisite]
Sensor principles (how sensors convert physical properties to electrical signals)
    ↓ [hard prerequisite]
Specific sensor types (pH probe, DO sensor, turbidity sensor — how each works)
    ↓ [soft prerequisite]
Prototype design (selecting sensors, connecting to microcontroller, basic data logging)
    ↓ [soft prerequisite]
Data validation (checking sensor readings against known standards, calibration concepts)
```

**排序约束：** 链 1 和链 2 在很大程度上相互独立，直到在现场数据采集处汇合，此时学生使用传感器（链 2）来采集水质数据（链 1）。在开始现场工作之前，两条链都必须分别到达各自的汇合点。

#### 水平要素

**中心枢纽：作为系统的湿地**

```
                        ┌── Ecological lens: biodiversity, habitat function,
                        │   food webs, nutrient cycling, ecosystem services
                        │
                        ├── Hydrological lens: water flow, catchment dynamics,
                        │   upstream/downstream relationships, flood regulation
                        │
The Wetland ────────────├── Economic lens: land value, water treatment costs,
as a System             │   ecosystem service valuation, development pressure
                        │
                        ├── Social lens: community relationships to the wetland,
                        │   Indigenous/local knowledge, recreational and cultural value
                        │
                        └── Ethical lens: intergenerational responsibility,
                            rights of nature, competing stakeholder interests
```

**分析复杂度通过这些视角逐步发展：**

| 阶段 | 学生的表现 |
|-------|------|
| 单一视角 | 一次通过一个视角分析湿地：“湿地很重要，因为它是许多物种的家园。” |
| 多重视角 | 将两个或更多视角应用于同一特征：“湿地可以过滤水（生态功能），从而节省市政委员会在水处理上的费用（经济价值）。” |
| 整合性 | 识别不同视角之间的矛盾与权衡：“开发上游土地会增加经济产出，但会降低湿地的过滤能力，进而增加下游的水处理成本——因此，开发的经济论据并不像乍看之下那么有力。” |
| 系统性 | 动态地看待整个系统：“湿地的生态、经济和社会价值彼此依存——损害其中一项，就会损害所有价值。再生计划必须着眼于整个系统，而不仅仅是单个组成部分。” |

**顺序的灵活性：** 可以按任意顺序引入这些视角。不过，对于 12–14 岁的学生来说，生态视角和水文视角能够提供更有效的切入点，因为它们与可观察、具体的现象相关（你可以看到生物多样性，也可以测量水流），而经济视角和伦理视角更加抽象，最好先有具体数据，再据此展开推理。

#### 倾向性要素

**能力 1：作为再生实践者的能动性**

| 水平 | 可观察指标 |
|-------|------|
| **初步显现** | 在他人指导下参与活动。完成与湿地调查相关的指定任务。依赖教师界定问题并确定下一步行动。表现出兴趣，但在采取行动前会等待指示。 |
| **发展中** | 独立识别问题或机会：“我注意到排水口附近的水变色了——我们应该在那里进行检测。” 在项目中针对具体任务主动采取行动。开始表达主人翁意识：使用“我们的湿地”，而不是“这片湿地”。 |
| **胜任** | 无需他人提醒即可推动调查向前发展。决定下一步调查什么，并说明理由。对项目成果负责：“我们的数据还不够可靠——我们需要重新校准并再次采样。” 独立寻找信息和资源。 |
| **拓展中** | 以守护者的身份行动：将项目与课堂之外的长期行动联系起来。独立联系社区利益相关者。识别项目无法解决的问题，以及接下来应该采取的行动。在项目时间范围之外，持续投入并关心这一地方。 |

**能力 2：协作**

| 水平 | 可观察指标 |
|-------|------|
| **初步显现** | 与他人一起工作。共享材料和空间。在他人要求时作出贡献。可能倾向于独自工作，或通过分配任务来避免真正的互动。 |
| **发展中** | 有效协调：根据各自优势分配任务，按时完成工作，沟通进展。倾听他人的想法并加以吸收。无需教师介入即可解决小分歧。 |
| **胜任** | 共同建构想法：在他人贡献的基础上进一步发展，创造出任何个人都无法独自完成的成果。主动寻求与自己不同的观点。根据团队需要调整自己的方式——有时担任领导者，有时提供支持。 |
| **拓展中** | 促进团队思考：引导较少发言的成员表达意见，综合多样化的观点，富有成效地处理真正的分歧。反思并清晰说明协作如何影响了成果：“如果 Priya 没有建议把两组数据绘制在一起，我们就不会发现排水模式与藻华之间的联系。” |

**能力 3：再生性思维**

| Level | Observable indicators |
|-------|----------------------|
| **Emerging** | 理解湿地已经受到破坏，并且这种破坏是由人类造成的。将问题表述为“修复受损之处”——这是一种 deficit orientation。 |
| **Developing** | 开始将湿地视为一个具有自身恢复能力的生命系统。思维从“修复”转向“支持恢复”。开始询问湿地需要什么，而不只是人类想从湿地获得什么。 |
| **Competent** | 设计顺应生态过程、而不是强行施加人类解决方案的提案。在考虑人类需求的同时，也考虑湿地的需求。认识到再生是一个持续进行的过程，而不是一次性修复。 |
| **Extending** | 阐述一种再生性理念：理解人类是系统的一部分，而不是与系统相分离。提出能够为系统自我再生创造条件的解决方案。将具体的湿地项目与生态退化和再生的更广泛模式联系起来。 |

### 3. 混合架构说明

**Hierarchical-Horizontal interaction：**系统思维线索（横向）需要基础科学知识（层级）才能发挥作用。学生如果不了解水质指标，就无法对湿地运用生态学视角；如果不了解生态系统服务，就无法运用经济学视角——而理解生态系统服务又需要先具备生态学理解。这在原本灵活的横向结构中形成了一个部分受限的顺序：生态学视角应当先于经济学视角，并不是因为横向结构内部的内容逻辑，而是因为层级线索所带来的先决依赖关系。

**Hierarchical-Dispositional interaction：**传感器技术链（层级）与能动性（倾向性）以一种富有成效的张力相互作用。层级线索提供结构化、可教授的技能（电路搭建、传感器操作），使学生获得具体能力——而能力会增强能动性。能够搭建并操作水质传感器的学生拥有一种切实的能力，这种能力会促进行动。然而，如果层级线索被孤立地教授（作为传统的电子学单元），能动性的发展就会停滞，因为这些技能会显得与目标脱节。该架构要求将层级教学嵌入项目情境之中，使技能习得被体验为对行动的赋能，而不是抽象的指导。

**Horizontal-Dispositional interaction：**系统思维（横向）与再生性思维（倾向性）深度交织。能够从多个视角看待湿地（横向）会促进再生性取向（倾向性）的发展——如果不能先将系统视为相互连接的整体，就无法形成再生性思维。反过来，日益增强的再生性取向也会推动更深入的系统分析。这两种类型会相互强化，不应在教学中分开。

**关键张力：**层级性要素（水质科学、电子学）的评估可以标准化并以标准为参照。倾向性要素（能动性、协作、再生思维）则无法如此——它需要持续的观察和专业判断。一个对两者赋予同等权重的项目评估框架，必须容纳本质上不同的证据模式。存在这样一种风险：易于测量的层级性要素仅仅因为更容易评估，就在评估中占据主导地位，从而边缘化那些可以说是 D2R 项目最重要成果的倾向性目标。

### 4. 教学与序列安排的影响

**受约束的序列（层级性）：**水质科学链条必须在野外工作之前教授——学生如果不了解自己正在测量什么，就无法收集有意义的数据。传感器技术链条必须推进到“具体传感器类型”这一层级，才能进行野外部署。这两条链应当在项目进行约三分之一时汇合，从而形成一个从课堂教学自然过渡到基于野外的探究的节点。

**灵活的序列（水平性）：**在生态学视角之后，可以按任意顺序引入系统思维视角（生态学视角依赖于层级性的科学基础）。对于 12–14 岁学生，一种富有成效的顺序是：生态学 → 水文学 → 社会 → 经济 → 伦理。这一顺序从具体且可观察的内容逐步过渡到抽象且需要评价的内容。不过，了解学生优势的教师可以重新排序——一个与社区联系紧密的班级，或许可以从社会视角开始。

**持续贯穿的主线（倾向性）：**能动性、协作和再生思维无法通过特定课程来教授——它们会在整个项目过程中发展。其教学启示是，每节课都必须为学生提供实践这些倾向的机会，并且教师必须在这些倾向出现时加以注意并明确指出。每周结束时采用专门的反思流程——“本周你在哪些地方展现了能动性？协作在哪里改变了结果？”——可以让倾向性的发展变得可见且具有明确意图。

**节奏安排：**层级性要素需要前置——大部分直接教学发生在项目的第一个三分之一阶段。水平性要素在中间三分之一阶段逐步展开，学生在这一阶段将多个视角应用于他们的野外数据。倾向性要素贯穿始终，但在最后三分之一阶段最为明显，此时学生开始主导自己的再生方案，并向真实的受众进行展示。

### 5. 评估影响

**可自动评估的要素（适用于 AI/自动化评估）：**
- 水质指标知识（学生能否正确解释 pH、溶解氧、浊度和营养物负荷所测量的内容？——可通过结构化问题进行测试）
- 数据解读（学生能否读取数据表，并判断读数是否处于健康范围内？——可通过数据解读任务进行测试）
- 基础电路知识（学生能否识别组件并解释电路功能？——可通过基于图示的任务进行测试）
- 传感器功能（学生能否解释特定传感器如何将物理属性转换为信号？——可通过结构化说明进行测试）

这些要素具有明确的对错答案，或具有可验证的程序正确性。AI 可以可靠地评估这些要素，提供即时反馈，并调整难度。

**教师判断要素（需要人工评估）：**
- 能动性发展（需要长期观察——单个任务无法揭示学生是在主动采取行动，还是在遵循指令。教师必须在多次学习活动中观察其行为模式。）
- 协作质量（需要观察小组互动。AI 无法区分学生是在小组讨论中默默贡献想法，还是处于 disengaged 状态。）
- 再生性思维（需要解读学生的推理过程和价值取向。学生提出的再生方案可能使用了正确的语言，却没有体现从“修复”到“支持恢复”的更深层转变——识别这一点需要专业判断。）
- 综合性和系统性层面的系统分析质量（学生的多视角分析是否真正识别出矛盾与相互依赖关系，而不是简单罗列不同观点，需要解释性判断。）

**混合要素（可以部分自动化）：**
- 基于水质数据的结论（AI 可以检查学生是否引用了数据，以及其主张是否与证据一致，但无法全面评估开放式回答中的科学推理质量。）
- 面向非专业受众的沟通（AI 可以检查术语使用、阅读难度和结构要素，但无法全面评估这种沟通是否真的能够说服一名委员会成员。）
- 单一视角和多视角层面的多视角分析（AI 可以检查是否列出并应用了多个视角，但整合质量仍需要判断。）

### 6. AI 辅导设计的影响

**对于层级性要素——自适应排序和掌握度检查：**
AI 辅导系统应在学生沿着水质和传感器技术的知识链学习并进入下一阶段之前，实施先决条件检查。如果学生无法证明自己理解 pH（它测量什么、刻度代表什么、健康范围是什么样的），系统就不应让其进入需要理解 pH 的现场数据解读任务。此时适合提供有针对性的练习和即时反馈：“这个水样的 pH 是 4.2。对于淡水湿地而言，这是否处于健康范围内？请解释原因。”系统应跟踪学生在先决条件链每个节点上的掌握度，并标记那些在缺乏基础理解的情况下继续前进的学生。

**对于横向要素——视角提示和分析支架：**
AI 导师应提示学生应用他们尚未考虑的视角：“你已经分析了湿地的生态价值。现在请思考：湿地为当地社区提供了哪些经济价值？”系统应通过示范整合性思维来支撑分析能力的发展：“你已经分别描述了生态价值和经济价值。你能指出二者之间的联系或矛盾吗？”系统不应强加单一的正确解释——横向知识允许存在多种有效分析。评估应标记分析深度（单一视角与综合性分析）供教师审核，而不是简单判定对错。

**对于倾向性要素——用于反思提示和教师仪表板，而不是自动评分：**
AI 系统不得尝试评估能动性、协作能力或再生思维。这些能力需要对已付诸实践的行为进行持续观察，而 AI 辅导系统无法获取这类信息。相反，系统应当：
- 提示进行定期自我反思：“描述本周你在项目中做出的一次决定，当时没有人告诉你该怎么做。你决定了什么？结果如何？”
- 将学生的反思呈现在教师仪表板中，以便教师持续追踪其发展轨迹
- 提供倾向性发展阶段区间，作为师生会议中共同使用的词汇
- 当学生的自我反思显示其可能在不同等级之间发生转变时发出标记（例如，表述从“老师告诉我们要……”转变为“我决定……”）

**对于混合架构——处理不同类型之间的转换：**
AI 系统必须认识到，该项目要求在单次学习活动中完成不同知识类型之间的转换。学生可能会从解读传感器数据（层级性——有对错之分），转向分析这些数据对湿地生态系统意味着什么（横向性——存在多种有效解释），再转向反思自己作为再生实践者所承担的角色（倾向性——具有发展性，不存在唯一正确答案）。辅导系统应相应地切换其模式：对于层级性要素采用指导性和纠正性方式，对于横向性要素采用提示性和探索性方式，对于倾向性要素采用反思性和非评价性方式。对三种类型统一采用单一教学模式，至少对其中两种而言都是不恰当的。

---

## 已知局限

1. **三类型框架是一种简化。** Bernstein 原本区分的是垂直话语中的层级性知识结构和横向性知识结构。倾向性类别并非 Bernstein 提出的类别——它源自能力框架相关文献，是出于课程设计目的所作的一种务实扩展。在 Bernstein 理论框架内开展研究的学者，可能不同意将倾向性知识视为一种独立的结构类型，而会将其视为横向性话语的一种特征。该框架旨在作为设计工具提供，而不是对社会学理论作出贡献。

2. **比例是近似且存在争议的。** 估计某课程由“40% 层级性、30% 横向性、30% 倾向性”构成，会给人一种该框架无法提供的精确感。这些比例属于解释性判断——不同的分析者可能会将同一课程评估为 35/35/30 或 45/25/30。它们的作用是揭示不同知识类型的相对比重，并确保没有任何一种类型被忽视，而不是作为精确测量值使用。

3. **该诊断基于明确陈述的学习目标，而不是实际实施的课程。** 某课程虽然声明了倾向性目标（能动性、协作能力），但如果教学和评估只重视层级性要素，它实际上可能并未发展这些能力。架构分析揭示的是课程声称要做什么；课程是否真正做到，则取决于实施情况。教师应利用该分析检查其评估设计和日常教学实践是否真正涵盖课程声称包含的所有知识类型。

4. **知识依赖型倾向需要前置条件诊断，而不只是类型标注。** 某些倾向性目标——尤其是批判性思维、生态素养、再生性思维和创业思维——如果没有足够的层级知识与横向知识基础，就无法真实地发展。架构诊断能够识别出某个倾向性目标是否存在，但不会自动识别课程中是否也具备使该倾向得以运作的前置条件。当诊断识别出一个知识依赖型倾向时，教学与评估方面的影响必须包括：明确识别那些必须首先发展的层级要素和横向要素。一个声称“学生将发展批判性思维”，却没有确保学生具备足够领域知识来进行批判性思考的课程，并不能真正实现这一目标。

5. **倾向性发展阶段带描述的是典型发展，而不是普遍适用的阶段。** 学生可能在一个情境中表现出“拓展中”的能动性，而在另一个情境中则处于“萌芽中”。倾向性发展具有情境依赖性，并且不是线性的。这些阶段带是用于观察和反馈的指导，而不是僵化的分类。

6. **AI 辅导的启示以系统具备模式切换能力为前提。** 当前大多数 AI 辅导系统都是围绕层级知识设计的（通过自适应练习提供对错反馈）。针对横向要素和倾向性要素的建议，描述的是大多数系统尚不具备的能力。这些启示面向未来——描述的是一个由架构提供信息支持的系统应当如何运作，而不是现成系统目前能够做到什么。