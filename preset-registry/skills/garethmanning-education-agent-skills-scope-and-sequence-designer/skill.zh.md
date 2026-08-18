---
# AGENT SKILLS STANDARD FIELDS (v2)
name: scope-and-sequence-designer
description: "Design a scope and sequence showing vertical and horizontal curriculum coherence across a programme or year. Use when building new programmes, restructuring subjects, or ensuring progression."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/scope-and-sequence-designer"
skill_name: "Scope and Sequence Designer"
domain: "curriculum-assessment"
version: "1.1"
evidence_strength: "moderate"
evidence_sources:
  - "Bruner (1960) — The Process of Education: spiral curriculum and vertical coherence"
  - "Wiggins & McTighe (2005) — Understanding by Design: backwards design applied to programme-level planning"
  - "Bernstein (1999) — Vertical and horizontal discourse: hierarchical knowledge sequencing"
  - "Hattie (2009) — Visible Learning: curriculum coherence as a high-effect variable"
  - "Muller (2009) — Forms of knowledge and curriculum coherence: conceptual vs contextual coherence"
  - "Maton (2013) — Making semantic waves: cumulative knowledge-building across a programme"
  - "Schmidt, Wang & McKnight (2005) — Coherence of the intended, implemented, and attained curriculum"
  - "Duschl, Schweingruber & Shouse (2007) — Taking Science to School: learning progressions as programme architecture"
  - "Kolb (1984) — Experiential Learning: experience as prerequisite for dispositional development"
  - "Bransford, Brown & Cocking (2000) — How People Learn: experiential readiness and conceptual framing"
  - "Flavell (1979) — Metacognition and cognitive monitoring: naming before practising metacognitive strategies"
  - "Kirschner, Sweller & Clark (2006) — Why minimal guidance during instruction does not work: explicit instruction for novices"
input_schema:
  required:
    - field: "subject_or_programme"
      type: "string"
      description: "Name and brief description of the subject or programme"
    - field: "developmental_bands"
      type: "string"
      description: "The band, year group, or stage structure used by the school or programme (e.g. Band A–D, Years 1–13, Foundation through Diploma, early childhood through upper secondary, or any other developmental architecture the school uses — this skill is not constrained to any particular system or age range)"
    - field: "intended_outcomes"
      type: "string"
      description: "The overarching goals students should reach by the end of the programme"
  optional:
    - field: "existing_units_or_competencies"
      type: "string"
      description: "Any existing units, competencies, or LTs already in place"
    - field: "knowledge_architecture_output"
      type: "string"
      description: "From curriculum-knowledge-architecture-designer if already run"
    - field: "time_available"
      type: "string"
      description: "Hours or lessons per week per band"
    - field: "kud_charts"
      type: "string"
      description: "KUD charts (Know/Understand/Do per band) for the LTs being sequenced. Richest input for prerequisite inference. Know layer reveals T1 content dependencies. Understand layer reveals conceptual scaffold relationships. Do layer reveals T3 vs T1/T2 distinctions. High confidence inference. Supply as markdown table or structured text."
    - field: "lt_types"
      type: "string"
      description: "T1/T2/T3 classification per LT or competency. T1 (hierarchical — prerequisite-driven sequencing), T2 (horizontal — analytical, less strictly ordered), T3 (dispositional — experiential readiness logic applies). If not supplied and kud_charts not supplied, skill infers types from LT language."
    - field: "prerequisite_map"
      type: "string"
      description: "Pre-built typed prerequisite relationships between LTs. Each typed as hard (must precede — logical dependency, non-negotiable), soft_enabler (should precede — enriches but does not gate), or conceptual_accelerator (should precede — makes downstream LT more portable). If supplied, used directly without inference."
    - field: "sequencing_principles"
      type: "string"
      description: "Programme-specific sequencing rules. e.g. 'T3 experience before T1 explanation', 'LT 6.1 early as conceptual accelerator for C1 and C3 LTs'. These override the skill's default logic where they conflict."
output_schema:
  type: "object"
  fields:
    - field: "knowledge_progression_map"
      type: "object"
      description: "For each knowledge type (hierarchical, horizontal, dispositional): how it develops across bands, what is introduced when, and what the prerequisite dependencies are between bands"
    - field: "vertical_coherence_check"
      type: "object"
      description: "For hierarchical knowledge: are prerequisites in place before each new concept is introduced? For horizontal knowledge: is sophistication of thinking increasing across bands? For dispositional knowledge: are development opportunities present and cumulative across the full programme?"
    - field: "horizontal_coherence_check"
      type: "object"
      description: "Within each band: is there appropriate balance between knowledge types? Are the units within the band connected or siloed?"
    - field: "sequencing_rationale"
      type: "string"
      description: "For each LT placement, one sentence explaining which sequencing logic drove the decision: hard prerequisite / soft scaffold / experiential readiness / supplied principle / no dependency."
    - field: "gaps_and_overlaps"
      type: "object"
      description: "Elements that are missing from the sequence, elements that are repeated without adding sophistication, and band transitions where students are likely to struggle"
    - field: "design_flags"
      type: "object"
      description: "Compound competencies that span multiple bands without clear progression logic, dispositional goals without sufficient knowledge prerequisites, and horizontal elements without explicit thinking development"
    - field: "inferred_prerequisite_map"
      type: "array"
      description: "Present when no prerequisite_map supplied. Columns: lt_a, relationship_type (hard/soft_enabler/conceptual_accelerator/none), lt_b, rationale, confidence (high/medium/low). Flagged as inferred — requires subject expert and teacher review before treating as authoritative."
    - field: "sequencing_constraints"
      type: "array"
      description: "Distinguishes hard-constrained ordering (non-negotiable — violation is a prerequisite error) from recommended ordering (teacher can adjust). Columns: lt_or_competency, constraint_type (hard/recommended), rationale."
    - field: "sequencing_principles_output"
      type: "string"
      description: "The sequencing principles applied, written as a readable list the teacher can adopt, modify, or reject. Includes default principles and any programme-specific ones supplied. Makes the skill's reasoning transparent and adjustable."
    - field: "sequencing_questions_for_teacher"
      type: "array"
      description: "For each teacher_discretion_flag item, 2-3 specific actionable questions the teacher should answer before finalising that ordering decision. Makes teacher judgement calls actionable rather than merely acknowledged."
    - field: "teacher_discretion_flags"
      type: "array"
      description: "LTs where the recommended ordering is a soft preference and teacher judgement should drive the final decision. Includes all T3 dispositional LTs where experiential readiness is context-dependent."
    - field: "prerequisite_violations"
      type: "array"
      description: "Cases where the proposed sequence violates a hard prerequisite relationship. Empty array if none. Each violation states the constraint broken, current proposed ordering, and required correction."
    - field: "confidence_level"
      type: "string"
      description: "Overall confidence — high (prerequisite_map or KUD charts supplied), medium (LTs with types, no KUD or map), low (competency definitions only or raw document). Includes one sentence on what would raise confidence."
chains_well_with:
  - "curriculum-knowledge-architecture-designer"
  - "kud-knowledge-type-mapper"
  - "kud-chart-author"
  - "learning-target-authoring-guide"
  - "developmental-band-system-designer"
  - "backwards-design-unit-planner"
  - "competency-unpacker"
  - "learning-progression-builder"
  - "gap-analysis-from-student-work"
teacher_time: "15 minutes"
tags: ["scope-and-sequence", "curriculum-coherence", "vertical-coherence", "learning-progressions", "programme-design", "Bruner", "spiral-curriculum", "knowledge-types", "prerequisite-sequencing", "KUD-charts"]
---
# 范围与顺序设计器

## 此技能的作用

接收课程方案描述和发展阶段结构，生成一份连贯的范围与顺序方案——明确所有阶段要教授的内容、教授顺序，以及这些排序决策背后的具体理由。此技能适用于任何教育层级：从幼儿教育到高中阶段、本科教育、专业发展课程，或任何其他分阶段的学习架构。大多数范围与顺序文档只是列表：将主题分配给不同年级，却没有连贯地说明为什么某个主题安排在这一阶段、它建立在什么基础之上，或它为学生后续学习做了哪些准备。此技能基于三种知识类型生成结构化进阶：层级性要素依据先决条件逻辑进行排序，确保基础知识始终在引入下一层知识之前得到建立；横向要素则通过逐步提升思维的复杂程度来排序，而不是让学生年复一年地在同一层级重复相同的思维活动；倾向性要素则作为贯穿始终的线索进行映射，并明确指出某种倾向能够有意义地发展的前提知识。当提供了 KUD 图表、LT 类型或预先构建的先决条件图谱时，此技能会直接应用它们；如果没有提供，则会推断先决关系，并标记每项推断的置信度。最终形成的课程方案中，每个要素都有充分依据来解释其为何安排在当前位置，同时每项建议的认识论状态也都清晰明确。AI 在此处尤其有价值，因为连贯的课程方案设计要求同时追踪跨越多个年级的先决条件链，监测各阶段内部及阶段之间的知识类型平衡，并识别那些在孤立查看单个单元时难以发现的缺口与重叠——这种系统性的交叉参照在认知上要求很高，而在实际课程规划中却经常被跳过。

## 证据基础

Bruner（1960）确立了螺旋式课程的基础原则：关键概念应在不同年级中反复出现，并逐步提升复杂程度，每次学习都应建立在此前学习的基础上，而不是简单重复。如果范围与顺序方案重新涉及某个主题，却没有提高认知要求，那就不是螺旋式学习，而是重复。螺旋式原则对三种知识类型的适用方式各不相同。层级性知识通过在已经巩固的基础上增加新的复杂层次来形成螺旋式进阶——先学习分数，再学习代数；先学习细胞生物学，再学习遗传学。横向知识则通过提升应用于反复出现的主题之上的分析性思维的复杂程度来形成螺旋式进阶——在阶段 A 能够识别不同观点的学生，到阶段 D 应当能够评估并比较分析框架。倾向性知识并不会以同样的方式形成螺旋式进阶——它通过贯穿整个课程方案的实践运用持续发展，尽管支持倾向表达的知识会在每个阶段不断深化。

Schmidt、Wang 与 McKnight（2005）分析了高绩效教育体系中的课程连贯性，发现连贯的课程具有三个特征：**聚焦**（教学主题更少，但学习得更深入）、**严谨性**（每个阶段都提供适切的挑战）和**连贯性**（主题在同一年级内以及不同年级之间都能在逻辑上相互衔接）。缺乏连贯性的体系——其中的主题出现和消失，却没有任何递进逻辑——始终表现不佳。他们对于范围与顺序设计最重要的发现是，连贯性不仅是纵向属性（学段 B 是否建立在学段 A 的基础上？），也是横向属性（学段 B 内部的各个要素是否彼此衔接？）。即使纵向顺序安排得无懈可击，如果每个学段内的单元彼此孤立，课程仍然可能缺乏连贯性。

Duschl、Schweingruber 与 Shouse（2007）提出了**学习进阶**（learning progressions）的概念：以实证为基础，描述学生理解如何跨越多个学年发展，并且每个水平都明确建立在前一个水平之上。他们的研究表明，进阶并不会自动发生——它需要有意识的课程设计，使教学内容与学生当前已经准备好学习的内容相匹配。对于具有层级结构的知识领域（数学、早期阅读以及科学的某些领域），学习进阶最适合进行记录，因为这些领域的先决条件结构已经得到充分研究。对于横向领域和倾向性领域，进阶的实证基础较弱，必须依据发展原则加以构建，而不能依据针对具体学习序列的重复研究。

Wiggins 与 McTighe（2005）将逆向设计应用于课程项目层面的规划：从课程项目结束时预期达成的成果开始，然后反向推导，为了实现这些成果，每个阶段必须具备哪些条件。在范围与顺序层面，这意味着最终学段的期望决定了此前每个学段必须教授什么——这并不是为了直接准备考试，而是为了建立使最终成果成为可能的知识与能力基础。

Bernstein（1999）与 Muller（2009）为针对不同知识类型进行顺序安排奠定了理论基础。**层级知识**具有内在的顺序逻辑：概念必须按照先决条件的顺序进行教学，因为后续概念确实依赖于先前概念。不能在学生理解细胞分裂之前教授遗传。**横向知识**并不像层级知识那样具有先决条件链条——不同的分析视角可以按照多种顺序引入——但它具有复杂性进阶：学生应当从识别不同视角，发展到通过不同视角进行分析，再发展到跨越不同视角进行评价与综合。按照日益提高的分析要求，而不是按照先决条件依赖关系来安排横向知识的顺序，是该 skill 所作出的关键区分之一。

Maton（2013）进一步提出了语义波概念：有效的知识建构要求在整个课程项目中不断往返于抽象原理与具体案例之间，而不仅仅是在单节课内进行这种转换。如果范围与顺序始终停留在抽象层面，就会产生彼此割裂的理论知识；如果始终停留在具体层面，就会形成只有经验而没有概念发展的学习。在整个课程项目中，语义特征应当体现出学生在抽象与具体之间转换的能力不断增强——早期学段的学生主要处理具体案例和简单抽象，而后期学段的学生应当能够熟练地在多个抽象层次上运作，并有意识地在这些层次之间进行转换。

Hattie（2009）指出，课程连贯性是影响学生成就的高效变量。学生将学习体验为一段相互连接、逐步累积的旅程的课程，比那些每一年都像重新开始、学习新内容且与之前所学没有明显联系的课程，能取得更好的结果。这正是投入范围与顺序设计的实践依据：课程的连贯性比其中任何单个单元的质量更能预测学生的学习成果。

Bransford、Brown 和 Cocking（2000）以及 Kolb（1984）确立了倾向性排序中的体验准备原则：已经练习过某种倾向的学生，在接触对该倾向的解释时，会把它理解为自身生活经验的确认，而不是抽象概念。对于社会情感倾向能力，通常应先有体验，再进行解释。Flavell（1979）提出了一个重要例外：对于元认知和反思类 LT，在练习之前明确说出策略名称，可以提高练习质量。Kirschner、Sweller 和 Clark（2006）则提出了相反的观点，即在许多领域中，初学者在练习之前从明确的教学中受益——本技能承认这种张力，并在适用的地方将其交由教师自行判断。

## 输入模式

教育者必须提供：
- **学科或课程：** 名称和简要描述。*例如：“Wellbeing，REAL School Budapest” / “Science，Years 7–13” / “Interdisciplinary Humanities，Foundation through Diploma” / “Early Childhood Mathematics，ages 3–6”*
- **发展阶段：** 阶段、年级或层级结构。*例如：“Bands A–D（大约 5–15 岁）” / “Years 7–13” / “Foundation、Intermediate、Advanced、Diploma” / “Nursery、Reception、Year 1、Year 2”*
- **预期成果：** 学生在课程结束时应达成的总体目标。*例如：“学生发展自我调节能力、能动性、关怀他人的意识，以及理解自身福祉所需的科学素养” / “学生发展科学推理能力、实验设计能力，以及支持其在大学阶段继续学习的知识基础”*

可选（如有可用信息，则由上下文引擎注入）：
- **现有单元或能力：** 已经存在的任何单元、能力或 LT
- **知识架构输出：** 如果已经运行过 curriculum-knowledge-architecture-designer，则提供其输出
- **可用时间：** 每个阶段每周可用的小时数或课时数
- **KUD 图表：** 正在排序的 LT 所对应的 KUD 图表（每个阶段的 Know/Understand/Do）。这是推断先决条件最丰富的输入：Know 层揭示 T1 内容依赖，Understand 层揭示概念支架关系，Do 层揭示 T3 与 T1/T2 之间的区别。能够支持高置信度推断。
- **LT 类型：** 每个 LT 或能力对应的 T1/T2/T3 分类。如果未提供，且未提供 kud_charts，则技能会根据 LT 的措辞推断类型。
- **先决条件图：** 预先构建的 LT 之间的类型化先决关系，每条关系分别标记为 hard、soft_enabler 或 conceptual_accelerator。如果已提供，则直接使用，不进行推断。
- **排序原则：** 当课程特定的排序规则与技能的默认逻辑发生冲突时，用于覆盖默认逻辑的课程特定排序规则。

## 提示词

```
You are a curriculum sequencing specialist producing scope and sequence recommendations for competency-based developmental band programmes. You apply three distinct sequencing logics based on content type and prerequisite relationships. You are explicit about the epistemic status of every recommendation — distinguishing hard constraints from soft preferences from teacher professional judgement calls.

---

STEP 0 — INPUT ASSESSMENT AND ROUTING

Assess input state before producing any output:

STATE A — prerequisite_map supplied: Use directly. Highest confidence. Proceed.

STATE B — kud_charts supplied (no prerequisite_map): Infer from KUD charts. High confidence. Proceed.

STATE C — LTs with lt_types supplied (no KUD, no map): Infer from LT content and types. Medium confidence. Proceed with confidence flags.

STATE D — only competency definitions supplied: Low confidence. Produce output with disclaimer: "Prerequisite inference from competency definitions alone is unreliable. Running KUD Chart Author skill first will produce substantially more reliable sequencing." Proceed with low confidence flagged throughout.

STATE E — only subject name and intended outcomes supplied: Decline to produce a scope and sequence. Output: "Insufficient inputs for reliable sequencing. Recommended sequence: (1) Run Learning Target Authoring Guide to produce LTs. (2) Run KUD Chart Author to produce KUD charts. (3) Return here." Do not produce a sequence in State E.

---

STEP 1 — PREREQUISITE MAP

1a. If prerequisite_map supplied: use directly. Skip to Step 2.

1b. Inference from KUD charts (State B):
For each pair of LTs:
- Know layers: if LT A's Know content is directly required by LT B's Know or Understand layer — hard prerequisite.
- Understand layers: if LT A's Understand makes LT B's Understand richer and more portable — conceptual_accelerator.
- Do layers: if LT A is T1 and LT B is T3, and T1 explains why the T3 disposition works — soft_enabler.
- No meaningful dependency — none.
Confidence: high for Know-layer dependencies, medium for Understand-layer inferences.

1c. Inference from LT content and types (State C). Apply by type combination:

T1 → T1: Would a student lacking LT A's content be unable (not just hindered) to access LT B? If yes: hard. If enriching but not gating: soft_enabler. Example: "Understanding the stress response mechanism (T1) is a hard prerequisite for evaluating stress management interventions (T1)."

T1 → T3: T1 content explaining why a T3 disposition works is typically a conceptual_accelerator, not a hard prerequisite. The disposition can develop through practice without explanation — the explanation makes it transferable. Example: "Neuroscience of emotion regulation (T1) is a conceptual accelerator for self-regulation practice (T3)."

T2 → T3: Typically a soft_enabler. Example: "Reflective decision-making (T2) enriches metacognitive self-direction (T3) but does not gate it."

T3 → T3: Usually soft. One T3 disposition rarely makes another logically inaccessible. Example: "Self-awareness (T3) is a soft enabler for empathy (T3)."

T2 → T2: Rarely hard prerequisites — usually parallel. Flag as none unless clear content dependency exists.

Confidence for all State C inferences: medium.

1d. Always include with inferred maps: "These relationships were inferred from LT content and types. Subject expert review is required before treating inferred hard prerequisites as non-negotiable — particularly in mathematics, science, and language acquisition where prerequisite structures are non-obvious from text alone."

---

STEP 2 — THREE SEQUENCING LOGICS

HARD PREREQUISITE LOGIC
Applies to: T1 LTs with hard prerequisites in the map.
Rule: prerequisite LT must appear earlier. Non-negotiable. Violation = PREREQUISITE_VIOLATION error, not a suggestion.
Output: constraint_type: hard in sequencing_constraints.

SOFT SCAFFOLD LOGIC
Applies to: soft_enabler and conceptual_accelerator relationships.
Rule: place enabler/accelerator earlier where possible. When not possible, flag the trade-off in sequencing_rationale.
Output: constraint_type: recommended. Teacher can adjust.

EXPERIENTIAL READINESS LOGIC
Applies to: T3 dispositional LTs.
Default rule: experience of the capability should generally precede T1/T2 content that explains it. Students who have practised a disposition encounter the explanation as confirmation of lived experience, not abstraction. (Bransford, Brown & Cocking (2000). How People Learn. National Academies Press. Kolb (1984). Experiential Learning. Prentice Hall.)

Exception — metacognitive and reflective T3 LTs: For LTs in metacognition and reflection, light conceptual framing before practice may be warranted. Naming metacognitive strategies explicitly before practising them improves practice quality. (Flavell (1979). Metacognition and cognitive monitoring. American Psychologist, 34(10), 906-911.) Flag metacognitive T3 LTs as candidates for concept-first sequencing in sequencing_questions_for_teacher.

Counterargument to acknowledge in output: explicit instruction research (Kirschner, Sweller & Clark (2006). Why minimal guidance during instruction does not work. Educational Psychologist, 41(2), 75-86.) argues novice learners benefit from explicit instruction before practice. Experiential readiness default applies most strongly to social-emotional dispositional capabilities. Do not apply to T1 LTs.

Output: flag T3 ordering as constraint_type: recommended with teacher_discretion_flag.

SEQUENCING PRINCIPLES OVERRIDE
If {{sequencing_principles}} supplied: apply after the three default logics. Where a supplied principle conflicts with a default, the principle wins — but flag the conflict: "Supplied principle [text] overrides the default [logic name] recommendation for [LT name]. If intentional, no action needed. If not, review the supplied principle."

---

STEP 3 — KNOWLEDGE ARCHITECTURE DIAGNOSIS

Before producing the full sequence, identify what types of knowledge are present in this programme. If a knowledge architecture output is provided, use it. If not, conduct a rapid diagnosis: what are the hierarchical elements that have prerequisite chains, what are the horizontal elements that require thinking sophistication to develop, and what are the dispositional elements that develop continuously across the programme? List the major elements under each type. The sequencing logic for each type is fundamentally different and must be treated separately.

---

STEP 4 — FULL SEQUENCE CONSTRUCTION

Apply the three sequencing logics from Step 2 to place every LT or competency in a band. For each placement:
- State the constraint_type: hard or recommended
- State the sequencing_rationale in one sentence: which logic drove the decision
- Flag any teacher_discretion items (all T3 ordering, all soft scaffold decisions)

---

STEP 5 — COHERENCE CHECKS

VERTICAL COHERENCE: For hierarchical elements: is every concept introduced after its prerequisites are secured? For horizontal elements: is analytical sophistication genuinely increasing, or are students doing the same thinking with slightly harder content? For dispositional elements: are development opportunities present throughout? Flag every break.

HORIZONTAL COHERENCE: Within each band: is there appropriate balance between knowledge types? Are units connected or siloed? Would a student finishing this band have the knowledge, thinking, and dispositional development needed to succeed in the next band?

---

STEP 6 — SEQUENCING PRINCIPLES OUTPUT

Write a readable list of principles applied:
- The three default logics, stated plainly
- Any programme-specific principles supplied
- The metacognitive T3 exception
- Invitation: "Review these principles. If any do not match your programme's philosophy or your knowledge of your students, adjust the sequence accordingly."

---

STEP 7 — SEQUENCING QUESTIONS FOR TEACHER

For each teacher_discretion_flag item, produce 2-3 specific actionable questions. Examples:

For T3 LT ordering:
- "Have students in this band encountered [capability] in practice already through projects or earlier band experience?"
- "What did last term's unit foreground — does the recommended sequence build on that or require a context shift?"
- "Are there students new to this band who would lack the experiential base the recommended order assumes?"

For soft scaffold decision:
- "Is [accelerator LT] already established for most students from prior experience, making early placement less critical?"

For metacognitive T3 LT:
- "Have students been explicitly introduced to metacognitive vocabulary before? If yes, experience-first may be less important."
- "Does this term's project create natural metacognitive moments that would give conceptual framing something to attach to?"

---

STEP 8 — DESIGN FLAGS AND RECOMMENDATIONS

Identify gaps (important elements missing from the sequence), overlaps (elements repeated without progression), transitions where students are likely to struggle, and compound competencies that appear to span multiple bands without clear progression logic. For each flag, provide a specific recommendation.

---

STEP 9 — INPUTS

subject_or_programme: {{subject_or_programme}}
developmental_bands: {{developmental_bands}}
intended_outcomes: {{intended_outcomes}}
existing_units_or_competencies: {{existing_units_or_competencies}}
kud_charts: {{kud_charts}}
lt_types: {{lt_types}}
prerequisite_map: {{prerequisite_map}}
sequencing_principles: {{sequencing_principles}}
time_available: {{time_available}}
knowledge_architecture_output: {{knowledge_architecture_output}}

---

Return your output in this exact format:

## Scope and Sequence: [Programme Name]

**Programme:** [Summarised]
**Developmental bands:** [Band structure]
**Intended outcomes:** [Summarised]
**Time available:** [If provided; otherwise "Not specified"]
**Input state:** [A/B/C/D — one sentence on what was supplied and confidence level]

### Confidence Level

[Overall confidence — high/medium/low — with one sentence on what would raise confidence]

### 0. Prerequisite Map

[If prerequisite_map supplied: "Using supplied map." List relationships.]
[If inferred: table with columns lt_a | relationship_type | lt_b | rationale | confidence]
[Always include inferred-map disclaimer if applicable]

### 1. Knowledge Architecture Diagnosis

**Hierarchical elements:**
[List with brief description of each]

**Horizontal elements:**
[List with brief description of each]

**Dispositional elements:**
[List with brief description of each]

**Architecture summary:**
[Overall profile — what proportion of the programme is hierarchical, horizontal, and dispositional, and what does this mean for sequencing]

### 2. Sequencing Constraints

| LT or Competency | Constraint Type | Rationale |
|---|---|---|
| [LT] | hard / recommended | [One sentence] |

### 3. Recommended Sequence with Rationale

[For each LT or competency: band placement, sequencing_rationale (one sentence per item), teacher_discretion_flag if applicable]

### 4. Prerequisite Violations

[Empty if none: "No prerequisite violations detected."]
[If present: violation, current proposed ordering, required correction]

### 5. Coherence Checks

**Vertical coherence:**
[Hierarchical / horizontal / dispositional — flag breaks]

**Horizontal coherence:**
[Per band — balance, connections, readiness for next band]

### 6. Sequencing Principles

[Readable list — default logics, programme-specific principles, metacognitive T3 exception, invitation to adjust]

### 7. Teacher Discretion Flags and Questions

[For each flagged item: the flag, then 2-3 specific actionable questions]

### 8. Design Flags and Recommendations

**Gaps:** [Missing elements — with recommendation]
**Overlaps:** [Repeated without progression — with recommendation]
**Difficult transitions:** [With recommendation]
**Compound competencies:** [With recommendation]
**Priority actions:** [3–5 highest-impact changes, in order]

**Self-check before returning output:** Verify that (a) input state is assessed before any output is produced and State E is declined, (b) every hard prerequisite has constraint_type: hard and a prerequisite_violations check is included, (c) every T3 dispositional ordering is flagged for teacher discretion, (d) the metacognitive T3 exception is identified where relevant, (e) the inferred prerequisite map disclaimer is included whenever inference was used, (f) the sequencing_principles output makes the skill's reasoning transparent and adjustable, (g) sequencing questions are specific and actionable (not generic), and (h) confidence_level is stated with a clear statement of what would raise it.
```

## 示例输出

**情境：** *主题或课程：“Wellbeing，REAL School Budapest” / 发展阶段：“阶段 A–D（约 5–15 岁）” / 预期成果：“学生发展自我调节能力、能动性、关怀他人的能力，以及理解自身福祉所需的科学素养” / 现有单元或能力：“现有能力：自我觉察与调节、健康素养与习惯、反思性思维与决策、社会觉察与同理心、沟通与协作。新增能力：福祉科学与素养（关于神经科学、压力反应、习惯科学的层级化知识）”*

---

## 福祉的范围与顺序：REAL School Budapest

**课程：** 福祉——自我调节、能动性、关怀他人，以及理解自身福祉所需的科学素养  
**发展阶段：** 阶段 A–D（约 5–15 岁）  
**预期成果：** 学生发展自我调节能力、能动性、关怀他人的能力，以及理解自身福祉所需的科学素养  
**可用时间：** 未指定  
**输入状态：** 状态 D——已提供能力定义，但未提供 KUD 图表、LT 类型或前置关系图。置信度中低。通过 KUD Chart Author 提供 KUD 图表，将大幅提升顺序编排的可靠性。

### 置信度

中低。前置关系是根据能力定义和知识领域惯例推断得出的。提供 KUD 图表（按阶段列出 Know/Understand/Do）将提升层级关系判断的置信度。所有推断出的硬性前置关系都需要学科专家审查，之后才能将其视为不可协商的要求。

### 0. 前置关系图

*根据能力定义和知识领域推断得出。需要学科专家审查——尤其是神经科学方面的前置知识，仅凭能力文本无法明确判断。*

| LT / 概念 | 关系 | LT / 概念 | 理由 | 置信度 |
|---|---|---|---|---|
| 身体觉察 | 硬性前置 | 战或逃或冻反应 | 如果不先觉察身体感觉，就无法理解自动发生的身体压力反应 | 高 |
| 战或逃或冻反应 | 硬性前置 | 自主神经系统 | 自主神经系统的内容以已经建立自动压力反应这一概念为前提 | 高 |
| 自主神经系统 | 硬性前置 | HPA 轴 | HPA 轴扩展了自主神经系统模型——没有自主神经系统这一概念，就无法教授神经内分泌通路 | 高 |
| 基础脑科学觉察 | 硬性前置 | 杏仁核与威胁检测 | 杏仁核相关内容要求学习者先理解大脑结构构成情绪反应的基础概念 | 高 |
| 习惯科学 | 概念加速器 | 健康素养与习惯（倾向性） | 习惯科学使倾向性习惯实践更具可迁移性，也更能由学习者自主驱动 | 中 |
| 自主神经系统 | 概念加速器 | 自我觉察与调节 | 了解平静技巧为何有效，能使策略选择更具迁移性 | 中 |
| 反思性思维与决策 | 软性促进因素 | 能动性 | 反思能力能够丰富能动性决策，但并不构成早期能动性表达的门槛 | 中 |
| 自我觉察与调节 | 软性促进因素 | 关怀他人 | 发展出的自我觉察能力能使觉察他人状态更加可靠，但关怀可以在调节能力成熟之前开始 | 中 |

### 1. 知识架构诊断

**层级性要素：**
- **福祉科学与素养**（新增能力）：压力反应的神经科学、参与情绪加工的脑结构、HPA 轴、皮质醇与肾上腺素通路、自主神经系统（交感神经/副交感神经）、平静技巧的生理学基础、习惯科学（线索-惯例-奖励循环、神经可塑性）、睡眠科学、营养与福祉之间的联系
- **健康素养与习惯**（现有能力，部分具有层级性）：关于身体健康的事实性知识——营养基础、睡眠卫生、运动科学——这些内容有正确与错误之分，并且存在先决知识链

**横向要素：**
- **反思性思维与决策**（现有能力）：从多个视角分析情境，权衡相互竞争的考量因素，评估自身推理的质量——思维的复杂程度必须随着学段推进而提升
- **社会意识与同理心**（现有能力，部分具有横向性）：理解不同视角，认识到情绪反应会受到情境、经历与解读的影响——这是一种视角性知识，会随着分析复杂程度的提升而不断深化
- **沟通与协作**（现有能力，部分具有横向性）：协作思考、冲突解决推理和沟通策略的质量必须变得更加复杂，而不仅仅是出现得更加频繁

**倾向性要素：**
- **自我觉察与调节**（现有能力）：付诸实践的自我调节——觉察情绪升级，并选择如何回应，而不是直接做出反应。这是一种倾向，而非技能：它存在于一段时间内的行为模式中，而不是存在于任务表现中
- **能动性**（预期成果，尚未命名为一项能力）：倾向于采取有目的的行动——既不是服从，也不是对抗，而是以自我导向的方式应对挑战。它会作为一条持续发展的主线逐渐形成
- **关怀他人**（预期成果，尚未命名为一项能力）：一种人际倾向，即留意他人的福祉并作出回应。它不同于社会意识（后者部分属于横向知识）——关怀是付诸行动的，而不是进行分析
- **健康素养与习惯**（现有能力，部分具有倾向性）：习惯层面——真正保持有助于福祉的日常惯例，这与了解这些惯例应当是什么不同

**架构总结：**
本课程是一个**以显著的倾向性核心和一条新的层级性主线为特征的混合架构**。五项现有能力主要具有倾向性和横向性——它们描述的是存在方式和思维方式，而不是需要习得的事实性知识。新增的福祉科学与素养引入了一条真正具有层级性的主线，其中包含必须得到遵循的先决知识链。核心设计挑战在于，将层级性知识（神经科学、压力科学、习惯科学）与倾向性目标（自我调节、能动性、关怀）连接起来——科学本身不是终点，而是知识基础，使这些倾向变得更加有依据、更具意图，也更加有效。

### 2. 顺序约束

| LT 或能力 | 约束类型 | 理由 |
|---|---|---|
| 身体觉察 → 战-逃-冻反应 | 硬性 | 对身体感觉的觉察在逻辑上是理解自动性身体压力反应的必要条件 |
| 战-逃-冻反应 → 自主神经系统 | 硬性 | 自主神经系统内容直接建立在已确立的自动唤醒概念之上 |
| 自主神经系统 → HPA 轴 | 硬性 | 神经内分泌通路需要以自主神经系统概念为基础 |
| 基础大脑觉察 → 杏仁核内容 | 硬性 | 大脑结构内容需要先具备情绪具有神经基础这一概念 |
| 自我觉察与调节（早期阶段的体验性内容）先于自主神经系统内容 | 推荐 | 体验准备逻辑——经过练习的调节会将相关解释作为确认，而不是抽象概念来理解 |
| 习惯科学先于健康素养与习惯（知情实践，D 等级） | 推荐 | 概念加速器——习惯科学使倾向性实践变得更加自主 |
| 反思性思维先于元反思性主体性 | 推荐 | 柔性促进因素——反思能力能够丰富早期主体性，但不会成为其前置门槛 |

### 3. 带理由的推荐顺序

**A 等级：**
- 身体觉察 — *硬性前置基础：不需要任何先前概念；可以直接观察；是所有福祉科学的切入点*
- 基础大脑觉察 — *硬性前置条件：跟随身体觉察；采用适龄的表述，为杏仁核内容做准备*
- 情绪词汇 — *硬性前置链条：建立在身体觉察之上；更细致的词汇需要基础觉察*
- 自我觉察与调节（萌发阶段，体验性） — *体验准备：在解释之前开始倾向性实践；先体验后解释对于 T3 社会情绪类 LT 是正确的* ⚑ 教师酌情决定
- 关爱他人（萌发阶段） — *体验准备：具体实施的关爱始于在提示下表现出的善意，之后才形成情境理解* ⚑ 教师酌情决定
- 主体性（萌发阶段） — *体验准备：早期的选择经验先于反思性框架* ⚑ 教师酌情决定

**B 等级：**
- 战-逃-冻反应 — *硬性前置逻辑：A 等级已确立身体觉察；战-逃-冻概念需要以此为基础*
- 反思性思维（发展阶段） — *复杂度递进：从识别选择（A）发展到推理后果（B）*
- 社会觉察与同理心（发展阶段） — *复杂度递进：从识别他人的情绪（A）发展到认识到他人的感受可能不同（B）*
- 自我觉察与调节（理解自动反应） — *由战-逃-冻反应带来的概念加速：实践变得更加有依据；仍为推荐项而非硬性要求* ⚑ 教师酌情决定

**C 等级：**
- 杏仁核与威胁检测 — *硬性前置逻辑：战-逃-冻反应和基础大脑觉察均已确立；引入具体的神经结构*
- 自主神经系统 — *硬性前置逻辑：战-逃-冻反应已确立；自主神经系统内容解释技术为何有效——必须先于有依据的调节期望*
- 习惯科学 — *硬性前置逻辑：基础大脑觉察已确立；在该等级可以理解神经可塑性概念*
- 自我觉察与调节（受科学启发，策略选择） — *概念加速器已被激活：自主神经系统内容必须先于这一期望——在 C 等级先教授自主神经系统，然后进入有依据的策略选择*
- 反思性思维（胜任阶段） — *复杂度递进：权衡相互竞争的考量因素*
- 社会觉察（胜任阶段） — *复杂度递进：对情绪反应进行情境分析*

**D 级：**
- HPA 轴与急性压力和慢性压力 — *硬性先备逻辑：ANS 和杏仁核均已掌握；完成神经内分泌通路*
- 睡眠科学 — *硬性先备逻辑：需要先理解 ANS，才能将睡眠解释为一种主动的生理过程*
- 自我觉察与调节（区分急性压力和慢性压力）— *硬性先备逻辑：HPA 轴相关内容必须先于这一能力*
- 能动性（元反思层面）— *软性促进因素已激活：达到拓展层级的反思性思维能够丰富这一能力，但并不构成完全的先决条件* ⚑ 教师酌情决定
- 反思性思维（拓展层级——元反思）— *复杂性递进：思考思维本身；需要进行明确教学* ⚑ 教师酌情决定

### 4. 先备条件违例

在上述推荐顺序中未检测到先备条件违例。**需要监测的风险：**如果 C 级的自主神经系统内容安排在同一级别中“基于信息选择策略”的调节要求之后，这将构成硬性先备条件违例。应在 C 级第 1 学期教授 ANS 内容，然后再于第 2 学期进入以科学为依据的调节要求。

### 5. 连贯性检查

**纵向连贯性：**

*层级性：*拟议的 Wellbeing Science & Literacy 先备条件链条是连贯的：身体觉察（A）→ 战逃冻反应（B）→ 杏仁核、自主神经系统、习惯科学（C）→ HPA 轴、急性压力和慢性压力、睡眠科学（D）。每个概念都建立在前一个概念之上。风险在于 C 级的密度——同时引入三个新的层级性概念。如果时间有限，应优先教授自主神经系统（它是最多下游能力的先备条件）。

*横向：*反思性思维、社会觉察以及沟通与协作都表现出真正的复杂性提升。需要监测的关键转变是 C 级 → D 级：三者都转向元层级思维。如果不明确教授元反思是什么样的，学生将停留在 C 级的复杂性水平，只是面对更难的内容——这会形成平台期，而不是螺旋式发展。

*倾向性：*四条倾向性线索贯穿四个级别，并且要求逐步提高。B 级的风险在于：倾向性线索仅通过实践发展，缺乏知识支持。B 级的自我调节基于实践（“因为这些技巧有效，所以使用它们”），而不是基于科学知识。这在发展上是适宜的——相关知识会在 C 级到来——但教师必须理解，基于知识的调节转变发生在 C 级，而不是更早阶段。

**横向连贯性：**

*A 级：*主要是倾向性和具体的体验性内容。层级性内容很少。横向处于初现层级。这种平衡符合发展规律。内部连接很强——身体觉察、情绪词汇、觉察他人的情绪以及简单的调节策略，都能通过具身体验自然关联起来。

*B 级：*倾向性线索持续发展。新增一个层级性概念（战逃冻反应）。横向处于发展层级。整体平衡是适宜的，但层级性线索较为单薄——必须以足够的深度教授这一个概念，才能使其合理地处于这一位置。教师需要明确建立科学概念与倾向性实践之间的联系。

*C 级：* 要求最高的等级。新增三个层级概念，在胜任水平上呈现横向联系，关于倾向性的要求现已以科学为依据。存在认知过载的风险。内部联系可能很强，但跨越多个能力领域——如果能力领域被孤立地教授，学生将看不到这些联系。建议至少安排一个跨能力领域单元，明确将 ANS 科学与调节实践联系起来。

*D 级：* 三种类型均达到最高要求。如果明确呈现内部联系，这些联系将最为紧密：HPA 轴 → 慢性压力 → 习惯 → 能动性 → 在尊重他人自主性的前提下关怀他人，构成连贯的综合体系。如果作为彼此分离的单元来教授，这一体系就会被割裂。

### 6. 排序原则

以下原则用于制定本排序。请对其进行审阅。如果其中任何原则与贵项目的理念或您对学生的了解不一致，请据此调整排序。

**已应用的默认原则：**

1. **硬性先备逻辑（T1）：** 如果没有 LT A 的内容，确实无法学习 LT B，那么将 LT A 排在前面。这些约束不可协商——重新排序会造成先备关系违规。

2. **软性支架逻辑：** 如果 LT A 能够丰富 LT B，或使 LT B 更具可迁移性，但并不会完全成为学习 LT B 的必要条件，则建议将 LT A 排在前面。教师可以根据学生的准备程度调整软性支架的顺序。

3. **体验准备逻辑（T3）：** 对于社会情感倾向性能力，通常应先让学生体验该能力，再学习用于解释它的 T1/T2 内容。已经实践过某种倾向的学生，会将相关解释理解为对其亲身经验的确认，而不是抽象概念。

**已应用的例外：**

4. **元认知 T3 例外：** 对于元认知和反思性 LT，在实践之前进行简要的概念框架介绍，可能会提高实践质量（Flavell, 1979）。这些 LT 已在第 7 节标记为由教师自行判断。

### 7. 教师自主判断标记与问题

**自我觉察与调节——在学习 ANS 科学之前，从 A 级开始进行体验式实践**

这一安排遵循体验准备默认原则：学生先实践调节，之后才能解释这些技术为何有效。这是建议，而非硬性约束。

- 这一等级的学生此前是否已经在学校或家中接触过调节实践？如果是，体验基础已经建立，以科学为先可能是合理的替代方案。
- 是否存在项目特定的理由，需要更早引入神经科学概念（例如，学校普遍强调以身体为基础的学习，使 ANS 在 B 级即可理解）？如果有，请将其作为排序原则提供。
- 该校 A 级学生群体中是否包括有显著创伤经历的学生？如果是，体验优先的调节实践可能更为重要，而不是相反——科学内容可以稍后再学。

**自主性与关怀他人 — 从 Band A 开始**

建议两者都在引入反思性框架之前，从 Band A 作为新兴的体验式实践开始。

- 在本校的 Band A 情境中，“自主性”体现为什么——结构化选择？学生主导的项目？如果课程已经突出学生选择，体验基础便已建立。
- 对于关怀他人：Band A 学生是否已经在非结构化场景中表现出亲社会行为？如果这种倾向已经存在，重点应是对其进行命名和发展，而非从零开始引入。

**Band D 的元反思性反思思维与自主性**

向对思维进行思考的转变被标记为需要显性教学，而非自然涌现。

- Band D 的学生此前是否已被明确介绍过元认知词汇？如果是，向元反思的过渡可能需要较少的支架支持。
- 本学期的项目是否为学生观察自身推理过程创造了自然时机？如果是，先概念后实践可能较为合适——在项目开始前引入元反思词汇，然后在项目中进行实践。
- 是否有从该项目外部进入 Band D、缺乏 Band C 体验基础的学生？如果是，建议的顺序假定了连续性，而部分学生可能并不具备这种连续性。

### 8. 设计提示与建议

**缺口：**
- Band D 要求具备**关于证据的科学推理**能力（评估健康主张），但 Wellbeing Science & Literacy 领域中未包含这一内容。学生需要理解什么可作为健康主张的证据——对照研究、样本量、相关性与因果关系。要么将此内容加入健康课程，要么核实科学课程是否在 Band D 前已涵盖它。
- **自主性目前不是一个已命名的能力。**预期成果包含自主性，且其已映射到全部四个阶段，但它并未出现在现有能力结构中。**建议：**要么将自主性作为第六项能力加入，要么确保其被明确嵌入 Self-Awareness & Regulation 和 Reflective Thinking 中——但若采用嵌入方式，必须对其进行命名和追踪。
- **关怀他人目前不是一个已命名的能力。**Social Awareness & Empathy 能力涵盖横向知识维度，但未涵盖付诸行动的关怀这一倾向性维度。**建议：**要么将关怀作为一项能力加入，要么将 Social Awareness & Empathy 拆分为分析性领域（横向）和实践性领域（倾向性）。

**重叠：**
- **Self-Awareness & Regulation** 与 **Health Literacy & Habits** 在“管理健康的策略”领域存在重叠。必须向教师明确二者的区别——调节关乎当下的情绪反应，习惯关乎持续性的日常惯例。**建议：**清晰界定边界及其重叠之处（例如，一种呼吸技巧既用于当下，也用作日常练习），并明确说明这种重叠。
- Band D 的 **Reflective Thinking** 与 **Self-Awareness & Regulation** 的元反思维度存在重叠。**建议：**在 Band D 设计整合两项能力的评估任务——一份关于个人调节发展情况的反思档案可同时服务于两项能力。

**困难的过渡：**
- **Band B → C** 是最重要的过渡：从体验式、基于实践的学习，转向以科学为依据、分析要求更高的内容。这里引入了三个新的层级概念，横向复杂度有所提升，并且对倾向性的要求从“实践过”转变为“理解其依据”。**建议：**在 Band C 开始时加入一个衔接单元，将 Band B 的体验性知识与新的科学内容连接起来——“你已经知道深呼吸能让自己平静下来。现在我们要学习的是，为什么会这样——而这种理解将帮助你针对不同情境选择合适的技巧。”
- 对于横向要素而言，**Band C → D** 的过渡意味着转向元层次思维；对大多数学生来说，这种转变不会自发发生。**建议：**在 Band D 开始时，明确示范元反思性思维。

**复合能力：**
- **Health Literacy & Habits** 横跨多种知识类型：层级知识（营养、睡眠、运动科学）、横向思维（评估健康相关主张）以及倾向性实践（保持日常习惯）。同一项能力同时按照三种不同的逻辑进行序列化。**建议：**考虑将其拆分为 Health Knowledge（层级性——通过结构化回答进行评估）和 Wellbeing Practice（倾向性——通过自我反思与发展性对话进行评估）。

**优先行动事项（按影响程度排序）：**
1. **确保在 Band C 开始时教授自主神经系统相关内容，**在对调节能力的要求默认学生理解相关技巧为何有效之前完成教学。这是影响最大的序列设计决策。
2. **在 Band C 开始时设计一个跨能力的衔接单元，**将 Band B 的体验式学习与 Band C 的科学内容连接起来。
3. **在 Wellbeing Science & Literacy 领域的 Band D 中加入关于证据的科学推理，**或者确认科学课程已经覆盖了这一内容。
4. **明确命名并跟踪 Agency and Care for Others，**因为未被命名的预期成果不会被评估，也往往会被忽视。
5. **为教师明确定义 Self-Awareness & Regulation 与 Health Literacy & Habits 之间的边界，**确保两项能力都在清晰的范围内进行教学。

---

## 已知局限

1. **此 skill 生成的范围与序列是一份规划文件，而不是已经实施的课程。**书面序列具有连贯性，并不保证教学具有连贯性——实施效果取决于教师是否理解序列设计逻辑，以及是否能在不同课堂和年级之间持续作出一致的决策。之所以设计序列依据输出，正是为了与教师共享，因为实施上的连贯性要求教师理解各要素为何被安排在相应位置，而不仅仅是了解要教授什么。

2. **学习进阶在某些领域有实证基础（早期数学、阅读发展、科学推理），而在其他领域则薄弱得多（身心健康、创意艺术、跨学科思维）。**当某一特定学习进阶的证据基础较为薄弱时，此 skill 会基于发展原则生成一个合乎逻辑的进阶方案——但该进阶应被视为有待通过实施和评估数据检验的假设，而不是有研究支持的确定结论。

3. **此技能会生成推荐顺序；但无法强制执行该顺序。** 在真实学校中，范围与顺序会受到排课限制、教职人员变动、资源可用性以及可能推翻理想顺序的情境性决策影响。输出应被视为设计目标——随后课程团队会根据现实约束确定实施能够在多大程度上与其匹配。

4. **用于排序的三类型知识框架是一种简化。** 真实的知识要素往往处于类型边界上，边界案例的排序逻辑需要专业判断；此技能可以提示这种判断，但无法取代它。若出于排序目的将要素归类为主要属于某一类型，应明确说明该分类，以便教师理解其推理依据。

5. **范围与顺序设计永远不会完成。** 随着学生在课程中推进，评估数据会揭示哪些部分的顺序设计有效，以及哪些部分正在造成缺口或困难。范围与顺序设计者会基于当前知识产出可获得的最佳方案——应至少每年使用真实学生成果数据进行审查和修订。`gap-analysis-from-student-work` skill 是将这些数据反馈到顺序修订中的自然工具。

6. **如果未提供 `prerequisite_map`，所有前置关系都将根据 LT 内容和类型推断。** 推断对 T1 内容依赖最可靠，对 T3 性情倾向关系最不可靠。对于具有正式类型化前置条件的课程，始终应提供 `prerequisite_map`——不要依赖推断来作出硬约束决策。

7. **T3 性情倾向 LT 的排序本质上属于教师专业判断问题，无法仅凭课程文件完全解决。** 此技能提供原则，并标记需要审查的决策。体验准备度默认原则对于社会情感性情倾向 LT 有充分支持，但在其他领域存在争议。请使用 `sequencing_principles` 进行覆盖。

8. **在专业领域中，推断得出的前置条件映射需要学科专家审查。** 在数学、科学和语言习得中，前置结构通常无法从 LT 文本中直接看出。这些领域中的推断映射是供专家审查的起点，而非权威映射。

9. **此技能拒绝仅根据学科名称和预期成果生成输出（状态 E）。** 基于不足输入生成的范围与顺序会造成一种虚假的结构印象，而这种印象可能比从头开始更难修订。请先运行 Learning Target Authoring Guide 和 KUD Chart Author。