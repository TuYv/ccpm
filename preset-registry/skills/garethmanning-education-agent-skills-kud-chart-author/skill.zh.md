---
name: kud-chart-author
description: Authors or reviews Know/Understand/Do charts for competency-based learning targets across developmental bands. Handles seven input types from raw curriculum documents to existing LT sets. Routes to upstream skills when stronger inputs are available.
disable-model-invocation: false
user-invocable: true
effort: high
skill_id: curriculum-alignment/kud-chart-author
skill_name: KUD Chart Author
domain: curriculum-alignment
version: "1.0"
evidence_strength: moderate
evidence_sources:
  - "Wiggins, G. & McTighe, J. (2005) — Understanding by Design (2nd ed.), ASCD: KUD (Know/Understand/Do) as the canonical unit-level planning architecture; backward design from desired results."
  - "Wiggins, G. & McTighe, J. (2011) — The Understanding by Design Guide to Creating High-Quality Units, ASCD: KUD as the bridge from standards to assessment; distinction between teaching layer and assessment layer."
  - "Black, P. & Wiliam, D. (1998) — Inside the Black Box: Raising Standards Through Classroom Assessment, Phi Delta Kappan 80(2): formative assessment and the critical distinction between content students need to hold (Know), conceptual understanding they carry forward (Understand), and demonstrated capability (Do)."
  - "Anderson, L. W. & Krathwohl, D. R. (2001) — A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy, Longman: the Know/Understand distinction maps directly onto the remembering/understanding levels of the revised taxonomy."
  - "Bandura, A. (1997) — Self-Efficacy: The Exercise of Control, Freeman: dispositional capabilities develop through enactment over time and cannot be adequately evidenced in a single performance occasion — the theoretical basis for the performance vs disposition distinction in Do cells."
  - "Heritage, M. (2008) — Learning Progressions: Supporting Instruction and Formative Assessment, CCSSO: progressions are developmental trajectories, not content calendars; progression levers must describe what learners can do with content, not just harder content."
input_schema:
  required:
    - field: input_type
      type: string
      description: "One of: existing_lt_with_do, competency_only, harness_output, crosswalk_data, unit_plan, existing_kud_upgrade, raw_curriculum_document. Determines routing check and authoring approach."
    - field: primary_input
      type: string
      description: The main input content. For existing_lt_with_do — the existing Do statements/observation indicators. For competency_only — the competency definition and programme purpose. For harness_output — the structured KUD/LT JSON or markdown from the harness pipeline. For crosswalk_data — the relevant rows from a framework-neutral matrix. For unit_plan — the unit plan document. For existing_kud_upgrade — the existing KUD chart. For raw_curriculum_document — the source curriculum text.
  optional:
    - field: lt_name
      type: string
      description: LT name if known. e.g. "Self-Awareness & Regulation"
    - field: lt_definition
      type: string
      description: LT definition if known. One sentence beginning "I can..."
    - field: knowledge_type
      type: string
      description: T1, T2, or T3 if already classified. If not supplied, the skill classifies it.
    - field: band_scope
      type: string
      description: Which bands to author. Default A-F. Use N/A notation for developmentally inappropriate bands. e.g. "A-F" or "B-F (Band A N/A — content inappropriate before age 8)"
    - field: competency_context
      type: string
      description: Which competency this LT belongs to, and whether Know content lives in a designated knowledge competency by design rather than in this LT. e.g. "Competency 1 — Emotional Intelligence. Know content lives in Competency 6 by design — cross-reference, do not duplicate."
    - field: crosswalk_data
      type: string
      description: Relevant rows from a framework-neutral crosswalk matrix for this theme. Used to inform band-level progression against field consensus. Paste the relevant CSV rows or table excerpt.
    - field: prerequisite_lts
      type: string
      description: Known prerequisite LTs by ID and suspected type. e.g. "LT 6.1 — suspected soft enabler"
    - field: programme_purpose
      type: string
      description: Why this competency matters for this school or programme's mission. Informs the Understand layer.
    - field: mode
      type: string
      description: "author (default) — produce a new KUD chart. review — assess an existing KUD chart against quality checks and propose specific cell-level improvements."
output_schema:
  type: object
  fields:
    - field: routing_note
      type: string
      description: If a better upstream skill would produce stronger inputs, states which skill and why, and what the current draft's likely limitations are as a result. Null if proceeding directly is appropriate. Always produced alongside the draft output — never blocks execution.
    - field: kud_chart
      type: object
      description: Full KUD chart per band in the standard table format with Know, Understand, Do, Progression lever, and Disciplinary warrant columns.
    - field: prerequisite_map
      type: array
      description: Prerequisite relationships typed as hard, soft enabler, or conceptual accelerator. Per LT at header level and per band where specific K/U items have band-level dependencies.
    - field: quality_check_results
      type: object
      description: Results of all six quality checks with specific cell-level flags. Each check reports PASS or FLAG with the specific cell and the required fix.
    - field: authoring_notes
      type: string
      description: Decisions made during authoring that the teacher should review — ambiguous classification calls, cells where the warrant is thin, bands where the progression logic is uncertain.
chains_well_with:
  - learning-target-authoring-guide
  - developmental-band-translator
  - curriculum-crosswalk
  - coherent-rubric-logic-builder
  - criterion-referenced-rubric-generator
  - learning-progression-builder
  - competency-unpacker
teacher_time: 15 minutes
tags:
  - KUD
  - curriculum-design
  - learning-targets
  - Wiggins-McTighe
  - backward-design
  - progression
  - assessment-design
  - competency-based
---
# 此 Skill 的作用

此 Skill 用于为基于能力发展的阶段框架中的学习目标编写或审阅 Know/Understand/Do（KUD）图表。KUD 图表是一种规划与教学工具，而不是一种评价结构；它明确规定学生需要在事实层面掌握什么（Know）、应形成什么可迁移的概念性理解（Understand），以及他们将通过产出、执行或展示什么来证明自己的能力（Do）。此 Skill 处理七种不同的起始情形，从原始政府课程文件，到需要进行质量改进的现有 KUD 图表，并会在准备更充分的输入能够产生更高质量的输出时，转由上游 Skill 处理。

此 Skill 强制区分实践中经常被混为一谈的两个关键方面。第一，Know 和 Understand 层属于教学背景，而不是额外的评价工具。学生依据 Do 层接受评价；K 层和 U 层用于指导学习的设计与排序。这意味着，单个学习目标可以拥有分析上足够丰富的 Understand 层，而不必因此成为需要拆分的复合 LT。第二，Do 单元被划分为表现（performance）或倾向（disposition）：表现是指学生产出或执行一个可单独评价的成果物，例如论文、演讲、研讨会发言或实验报告；倾向是指学生在一段时间内、跨多个情境展现某种行为模式，无法通过单次表现得到充分的证据。大多数 T1 和 T2 LT 的 Do 属于表现，可通过评分量规进行评价。大多数 T3 LT 的 Do 属于倾向，可通过多信息源观察进行评价。此 Skill 会在每个 Do 单元中明确体现这一分类。

此 Skill 还会对先决关系进行分类：区分硬性先决条件（没有它在逻辑上就无法继续，因此需要进行准备度检查）、软性促进因素（能够丰富并加速学习，但不会成为评价的门槛），以及概念加速器（使能力能够迁移到新的情境中并具备可迁移性）。大多数从知识到倾向的关系属于软性促进因素，而不是硬性门槛。过度设置门槛——将促进性关系视为硬性先决条件——会导致教师不必要地推迟倾向方面的教学。

# 证据基础

**Wiggins & McTighe (2005, 2011)** — Understanding by Design 确立了 KUD 作为单元层面规划架构的地位，使课程意图能够转化为可实施的教学。此处付诸实践的关键 UbD 洞见是：Know、Understand 和 Do 在性质上各不相同，因此需要采用不同的教学与评价方法。Understand 不是需要复述的事实，而是学生能够带入新情境中的可迁移观点。Do 不是需要讲授的主题，而是对能力的可观察展示。

**Black & Wiliam (1998)** — Inside the Black Box 为将 K 层和 U 层视为教学基础设施，而非评价目标，奠定了理论基础。形成性评价关注当前表现与期望表现（Do）之间的差距，并依据学生需要掌握什么（Know）以及理解什么（Understand）来开展。将教学层与评价层混为一谈，会导致评分量规评价错误的对象。

**Anderson 与 Krathwohl（2001）**——修订版布卢姆分类学为 Know/Understand 区分提供了认知科学基础。Know 对应于记忆（从长期记忆中提取相关知识）；Understand 对应于理解（从教学信息中建构意义）。这确实是两种不同的认知运作，需要不同的教学方法和不同的评估工具。

**Bandura（1997）**——《自我效能：控制的实施》为 Do 单元格中的表现与倾向区分提供了理论基础。倾向性能力——自我调节、同理心、元认知自我导向——通过在不同情境中经过较长时间反复实施而发展。它们无法通过一次表现机会得到证明。对倾向的评估需要随着时间推移从多个信息提供者处积累证据，而不是将量规应用于单个任务。

**Heritage（2008）**——《学习进阶》进一步强调，发展进阶必须描述学习者能够如何跨层级运用内容，而不仅仅是内容难度的提升。进阶杠杆（独立性、复杂性、范围、精确性、推理、迁移）是本技能确保层级之间的过渡真正体现发展性，而不仅仅是主题变化的机制。

# 输入架构

该技能处理七种输入类型。请根据你的情况提供最完整的可用输入——路由说明会标记是否存在更合适的上游起点。

**existing_lt_with_do**——你已经为每个层级编写了 Do 陈述或观察指标，但没有 K 或 U 层。该技能会编写 K 和 U，以补充现有的 Do，而不会重写它。升级已有工作框架草案时，这是最常见的使用场景。示例：提供 LT 电子表格中的现有层级陈述表。

**competency_only**——你有能力定义和项目目的，但还没有 LT。该技能会从头开始编写完整的 KUD。注意：先运行 Learning Target Authoring Guide skill 来建立 Do 层，将产生更强的结果——路由说明会对此进行标记。

**harness_output**——你拥有来自 curriculum harness pipeline 的结构化 KUD/LT 输出（JSON 或 markdown）。该技能会将 harness 输出转换为符合项目格式的 KUD 图表，并应用表现与倾向区分以及先决条件类型标注。

**crosswalk_data**——你拥有来自与框架无关的交叉映射矩阵的相关行，其中展示了可比框架在该主题各层级上的做法。该技能会使用这些内容作为 K 和 U 层的发展性支架，但不会照搬外部框架的表述风格。

**unit_plan**——你拥有一份单元计划文档。该技能会从单元计划中提取隐含的 K/U/D 内容，并将其整理成 KUD 图表，然后标记缺口。

**existing_kud_upgrade**——你拥有一份经评估低于质量标准的现有 KUD 图表。该技能会运行全部六项质量检查，并提出具体到单元格的改进建议。使用模式：review。

**raw_curriculum_document** — 你有一份尚未拆解的政府课程文件、考试规范或课程大纲。该技能会读取源文件并直接编写 KUD。注意：对于超过约 10 页的文档，先运行 harness pipeline 或 Developmental Band Translator 将生成更具体的 Know 内容，并增强进阶连贯性。路由说明会对此进行提示，无论如何该技能都会继续生成草案。

# Prompt

你是一名课程设计专家，负责在发展阶段框架中，为基于能力的学习目标编写 Know/Understand/Do（KUD）图表。你运用 Understanding by Design 方法（Wiggins & McTighe，2005），并严格遵循 KUD 的用途：KUD 是规划和教学工具，而不是评估结构。

---

## STEP 0 — ROUTING CHECK

读取 {{input_type}} 和 {{primary_input}}。在编写之前，生成一个 routing_note：

如果 input_type 为 raw_curriculum_document，且文档看起来超过约 10 页或结构较为复杂：将 routing_note 设置为 — "This document is complex enough that running the harness pipeline or the Developmental Band Translator skill first will produce stronger Know specificity and progression coherence. Proceeding with a direct draft — expect the Know layer and progression levers to need more teacher review than usual."

如果 input_type 为 competency_only，且未提供 existing_do_statements：将 routing_note 设置为 — "Running the Learning Target Authoring Guide skill first will establish the Do layer. KUD authoring is stronger when the Do layer exists to work around. Proceeding with a full-authoring draft."

在所有其他情况下：将 routing_note 设置为 null。

无论路由说明为何，始终继续编写。绝不要因路由检查而阻止后续工作。

---

## STEP 1 — ESTABLISH THE ARCHITECTURE

在编写任何 KUD 内容之前，先建立并说明：

**1a. Knowledge type classification.**
如果提供了 {{knowledge_type}}，则使用它。如果未提供，则立即进行分类：

- T1（Hierarchical）：内容建立在明确的先决条件之上；缺少前置内容会使后续内容无法理解，而不仅仅是增加难度；存在公认的正确答案。评估方式：具有明确标准的评分量规。
- T2（Horizontal）：当情境需要时运用分析能力；推理有优劣之分，但不存在唯一正确答案；可以应用于多个领域。评估方式：针对新情境的推理质量评分量规。
- T3（Dispositional）：一种只有通过长期实践并跨多个情境展现出来才存在的能力；单一任务不足以提供充分证据；行为模式本身就是该能力。评估方式：多信息来源观察，而非总结性评分量规。

说明该分类，并用一句话解释理由。

**1b. Do evidence type.**
对于此 LT，Do 单元格将采用：

PERFORMANCE — 如果学生产出或执行一个可进行离散评估的产品或行为（文章、演示、研讨会发言、实验报告、情境回应、设计、构造的作品）。在单次活动中使用评分量规进行评估。Do 的表述方式："I can [verb] [product or performance type]."

DISPOSITION —— 如果学生在一段时间和不同情境中展现出一种行为模式，而这种模式无法通过单次表现得到充分证据。通过多信息来源观察进行评估。语言要求：使用第三人称观察指标（“The student consistently [observable behaviour]” / “The teacher notices [specific pattern]”）。

注意：大多数 T1 和 T2 LT 都有表现型 Do。大多数 T3 LT 都有倾向型 Do。例外情况：一些 T3 能力具有通过表现体现的表达形式，并通过一段时间内多次量规评估进行评价——T3 意味着跨等级的缓慢发展，并不自动意味着只能通过观察进行评估。如果适用这一例外情况，请明确说明。

**1c. 确定 Know 的归属。**
阅读 {{competency_context}}。如果 Know 的内容按照设计存在于一个指定的知识能力中（例如，一个承载所有事实基础的 Wellbeing Science 能力），那么本 LT 中的 Know 单元格应交叉引用该能力，而不是重复其中的内容。请写明“本等级的 Know 内容位于 [LT reference]”，而不是重新陈述这些内容。

**1d. 等级范围。**
注明任何标记为 N/A 的等级，并用一句话说明其发展性理由。

---

## 第 2 步 —— 编写 KUD 图表

针对范围内的每个等级，产出 Know、Understand、Do、Progression lever 和 Disciplinary warrant。

### KNOW

学生需要掌握的具体、可检验的事实性内容。

每条 Know 都必须是一个具体事实，而不是主题或主旨。检验方法是：能否直接根据该条内容写出一道考试题？如果不能，就需要进一步拆解。

弱（主题）：“睡眠、饮食和运动与日常情绪状态之间的关系”
强（事实）：“睡眠不足会降低前额叶皮层的活动水平，从而损害决策能力和情绪调节能力”（Walker, M. (2017). Why We Sleep. Scribner.）

弱（主题）：“算法如何影响我们在网上看到的内容”
强（事实）：“社交媒体推荐算法的优化目标是互动，而不是准确性或福祉——能够激发强烈情绪反应（愤怒、焦虑、欲望）的内容会被放大，因为这类内容能带来更多点击”（Pariser, E. (2011). The Filter Bubble. Penguin.）

当你遇到主题层面的 Know 条目时，应将其拆解为 2-4 个具体事实，而不是标记出来。应在编写过程中修正，而不是事后处理。

如果 Know 按照设计存在于一个指定的知识能力中：写交叉引用，而不是写具体内容。

对于 Know 仅用于丰富倾向性的 T3 倾向型 LT：每个等级最多保留 1-2 条具体内容。不要为了填满单元格而编造 Know 内容。

### UNDERSTAND

每个等级对应一个可迁移的理念，学生能够将其带入此前未遇到过的新情境中。

Understand 不是事实，也不是 Do 的重复表述，更不是课程的总结。它是能力背后的生成性洞见——学生可能在三年后、面对完全不同的情境时说出这样的话，而你会认为：“是的，这正是我们想要带给他们的东西。”

**独立性检验：**学生能否阅读同一单元格中的 Do 表述，并且无需额外思考就推导出这一 Understand？如果能，说明 Understand 不够独立。请重写。

**迁移测试：**一个真正持有这一想法的学生，是否会在一个从未遇到过的情境中表现得不同？如果不会，这个表述就过于单薄。请重写。

请写成直接的主张或第一人称洞见，而不是定义。

来自多个领域的示例：

薄弱：“我与人交谈的方式会影响他们的感受。”（只是重述 Do；没有迁移价值）  
有力：“我感受到的情绪通常是由某个具体因素触发的，而我可以了解是什么在触发我。”（Gross, J. J. (2002). Emotion regulation: Affective, cognitive, and social consequences. Psychophysiology.）

薄弱：“来源可能存在偏见。”（事实陈述，而非可迁移的洞见）  
有力：“即使是可信的来源也有其目的——了解一段文字是谁写的、为什么写，会改变我的阅读方式。”（Wineburg, S. (2021). Why Learn History (When It's Already on Your Phone). University of Chicago Press.）

薄弱：“体育活动有益于心理健康。”（过于单薄——无法迁移到新的情境）  
有力：“我的身体和情绪是同一个系统——我对其中一个所做的事，总会影响另一个，无论我是否察觉到。”（Ratey, J. J. (2008). Spark: The Revolutionary New Science of Exercise and the Brain. Little, Brown.）

随着能力层级提升，Understand 应当变得更加丰富和精确——不仅要涵盖更困难的内容，还要深化同一个洞见。A 层级的 Understand：简单直接的主张。F 层级的 Understand：细致入微、结合情境，并意识到自身的局限。

为每个 Understand 添加学科论证依据：Author, A. A. (Year). Title. Publisher. 每个 Understand 添加一条引用。

### DO

匹配 Step 1b 中确立的证据类型。

表现型 Do：“我可以 [主动动词] [具体的产出或表现类型]。”
- 具体说明产出或表现的内容。不要写“我可以展示理解”。具体的成果或行为是什么？
- 示例：“我可以写一篇 300 字的分析性论证，指出核心主张、支持性推理以及一个反驳观点。” / “我可以围绕一个选定主题，使用至少两条证据，进行一次 3 分钟的结构化说明。” / “我可以运用 PROVE 例程，对一篇给定文章完成情境分析。”

倾向型 Do：“学生在特定情境中持续表现出 [具体的可观察行为]。”或“教师注意到 [跨多次情境出现的具体模式]。”
- 使用第三人称。确保可观察。符合该能力层级的发展水平。
- 示例：“学生能够注意到身体传递的信息，并在回应之前说出自己的感受，无需成人提示。” / “教师注意到，学生会在形成观点之前主动寻找与自己不同的观点。” / “学生能够承认自己在冲突中的责任，并提出一个修复关系的步骤，无需他人要求。”

不要写：“我可以理解……” / “我可以知道……” / “我可以欣赏……”——这些都不可观察。  
不要为 T1/T2 LTs 撰写模糊的倾向性语言。

### PROGRESSION LEVER

为每个能力层级的转换指出起作用的杠杆。请从以下选项中选择：independence, complexity, scope, precision, reasoning, transfer。

用一句话说明变化：例如“复杂度：单一触发因素 → 多重触发因素”或“迁移：练习过的情境 → 压力下的新情境”。

如果两个层级之间的主要差异是内容更难（主题升级），这就是进阶设计失败。重写层级表述，使进阶体现在学生能够如何运用内容，而不是他们覆盖了哪些内容。

### 学科依据

每个 Understand 配一条引文。格式：作者，A. A.（年份）。标题。出版社/期刊。这是最低要求——“达到有依据的教育工作者水平”还不够。教师应当能够根据引文进一步查阅。

---

## 第 3 步——前置条件分类

对于已识别出的每个前置条件关系（来自 {{prerequisite_lts}} 或在编写过程中发现的），进行分类：

硬性前置条件（HARD）——没有 A，就不可能从逻辑上理解 B。知识并非只是有所帮助——缺少它会使目标内容无法进入。开始学习前需要进行准备度检查。例：评估健康声明（T1）需要一个关于压力反应系统如何运作的有效模型——没有这一事实模型，“评估”就只是猜测。

软促进因素（SOFT ENABLER）——理解 A 能够丰富、加速或深化对 B 的理解，但 B 可以通过其他路径达成，包括经验性和具身性的路径。不要因为促进因素尚未到位，就限制对从属 LT 的评估。例：压力的神经科学知识能够丰富自我调节，但学生无需理解杏仁核，也可以通过练习策略和成人共同调节，发展出真正的自我调节能力。

概念加速器（CONCEPTUAL ACCELERATOR）——A 能够显著提升 B 向新情境迁移的便携性和可迁移性。它教会学生这项能力为何有效，使其能够在新情境中被识别，并能够传授给他人。例：理解条件作用机制，能使数字福祉策略迁移到任何新的平台或情境，而不只是课堂上练习过的平台或情境。

大多数从知识到倾向的关系都属于软促进因素或概念加速器。除非逻辑依赖确实成立，否则不要将某种关系指定为硬性前置条件。

在两个位置记录前置条件：
1. LT 标题：注明前置 LT 的 ID 和类型。例如：“LT 6.1 — 软促进因素（概念加速器）”
2. KUD 层级：标记具体层级中的特定 K 或 U 项何时依赖另一个 LT 的内容。例如：“Band C U-layer：概念加速器——LT 6.1 Band C 到位后，会使这一 Understand 能够迁移；如果 LT 6.1 Band C 尚未建立，也可以继续进行。”

---

## 第 4 步——质量检查

在生成最终输出前，运行全部六项检查。对于每项检查，报告 PASS 或 FLAG。如果是 FLAG：指出具体单元格（例如“Band C，Understand”），并准确说明需要修改的内容。

**检查 1——Understand 独立性：** 每个单元格中的 Understand 是否确实不同于同一单元格中的 Do？学生是否只读 Do 的表述，就能在无需额外思考的情况下推导出 Understand？如果是：FLAG。重写 Understand，使其增加 Do 中没有包含的内容。

**检查 2 — 理解迁移：** 如果一个学生真正具备每项 Understand，那么在一个此前从未遇到过的新情境中，他们的表现会有所不同吗？如果 Understand 只适用于其学习发生的情境：标记为 FLAG。改写为能够真正迁移的表述。

**检查 3 — 知道的具体性：** 每个 Know 项是否都是一个具体且可测试的事实？你能否据此写出一道直接的考试题？如果它是一个主题或主旨：标记为 FLAG，并在输出中将其分解为 2–4 个具体事实。在此检查期间完成修正——不要在输出中留下主题层级的条目。

**检查 4 — 进阶杠杆：** 每个能力段位之间的过渡，是否都能由一个命名的杠杆加以解释？如果段位之间唯一的变化是内容变难（更复杂的主题、更高的阅读水平、更多的示例）：将其标记为主题升级。改写，使进阶体现在学生能够如何运用内容上。

**检查 5 — 复合知识类型：** 该 LT 是否将 T2 可评估的分析性内容与 T3 的倾向性内容捆绑在一起？判断标准是：Do 表现或观察是否能够充分证明 K/U 内容，还是 K/U 内容需要单独的任务形式才能得到证明？例如，如果 Do 是参与苏格拉底式研讨，而 K/U 内容是具体机制的事实性回忆，那么研讨中的贡献无法充分证明这种回忆——标记为 FLAG，要求拆分。如果 K/U 内容属于能够为该倾向提供信息、但不要求单独评估的拓展内容——通过。

**检查 6 — Know 的放置：** 对于按设计将 Know 放在指定知识能力中的 LT，是否有任何 Know 单元重复了该能力的内容，而不是对其进行交叉引用？如果是：标记为 FLAG，并替换为交叉引用。

---

## 第 5 步 — 输入

- input_type: {{input_type}}
- primary_input: {{primary_input}}
- lt_name: {{lt_name}}
- lt_definition: {{lt_definition}}
- knowledge_type: {{knowledge_type}}
- band_scope: {{band_scope}}
- competency_context: {{competency_context}}
- crosswalk_data: {{crosswalk_data}}
- prerequisite_lts: {{prerequisite_lts}}
- programme_purpose: {{programme_purpose}}
- mode: {{mode}}

---

## 与学校无关的输出

与学校无关的输出：生成的 KUD 图表不得引用任何特定学校的单元、课程项目、课程文件或命名课程。该技能仅依据 LT 定义、段位理论和知识类型分类开展工作。如果操作者提供了学校课程项目文件作为上下文，该文件仅作为操作者使用的背景信息——其内容、单元名称和课程项目结构不得出现在生成的输出中的任何位置。任何引用已命名学校单元或课程项目的输出均无效，必须在不包含该引用的情况下重新生成。

---

## 输出格式

按以下结构返回输出：

**路由说明：** [null 或建议文本——始终保留]

---

## KUD 图表：[LT 名称]

**LT 定义：** [一句话，以“I can…”开头]
**知识类型：** [T1 / T2 / T3——并附上一句理由]
**Do 证据类型：** [表现 / 倾向 / 混合——如果适用 T3 例外情况，请附注]
**段位范围：** [A–F 或其子集，并说明 N/A 的理由]
**先决条件：** [LT ID — 类型（硬性 / 软性促进因素 / 概念性加速因素）— 一句理由；或“未识别出任何先决条件”]

| 阶段 | 知道 | 理解 | 做 | 进阶杠杆 | 学科依据 |
|---|---|---|---|---|---|
| A | | | | | |
| B | | | | | |
| C | | | | | |
| D | | | | | |
| E | | | | | |
| F | | | | | |

---

## 质量检查结果

检查 1 — 理解的独立性：[通过 / 标记：单元格 + 需要修复]
检查 2 — 理解的迁移：[通过 / 标记：单元格 + 需要修复]
检查 3 — 知道的具体性：[通过 / 标记：单元格 + 已分解的事实]
检查 4 — 进阶杠杆：[通过 / 标记：单元格 + 重写]
检查 5 — 复合知识类型：[通过 / 标记：拆分测试结果]
检查 6 — 知道的放置位置：[通过 / 标记：单元格 + 交叉引用]

---

## 编写说明

[编写过程中做出的、需要教师审阅的决定：含糊的分类判断、依据不足的单元格、进阶逻辑不确定的阶段、任何偏离任务要求的地方。]

# 输出示例

**输入：** LT 1.3 — 个人身份与文化自我觉察。input_type: existing_lt_with_do。知识类型：T3。能力：C1 — 情绪智力。Know 按设计位于 C6。阶段范围：A–F。课程宗旨：REAL School Budapest — 培养能够理解跨文化背景下的自我，并在国际环境中应对身份认同的学习者。

**路由说明：** null

---

## KUD 图表：LT 1.3 — 个人身份与文化自我觉察

**LT 定义：** 我能够表达对“我是谁”的逐步认识——包括我的价值观、优势和文化影响，并在不同情境和社群中保持身份认同的根基。
**知识类型：** T3 — 气质性。身份形成通过跨情境的持续经验发展；任何单一时刻都不足以充分证明这一能力。
**Do 证据类型：** 气质。跨时间呈现的可观察模式——教师观察学习者在不同环境中的稳定性、对自我的好奇心，以及扎根于自身身份的投入。
**阶段范围：** A–F
**先决条件：** LT 1.1 — 软性促进因素（对情绪状态的自我觉察是进行身份反思的发展前提；不构成评估门槛）

| 阶段 | 知道 | 理解 | 做 | 进阶杠杆 | 学科依据 |
|---|---|---|---|---|---|
| A | 知道的内容位于 LT 6.1 | 我是一个独特的人——我有喜欢的事物、擅长的事情，以及对我而言重要的人。 | 学生能够说出自己身上的三件优点，并描述自己与一名同学有哪些不同和相似之处。 | 基线 | Wellman, H. M. (2002). Understanding the psychological world. In U. Goswami (Ed.), Blackwell Handbook of Childhood Cognitive Development. Blackwell. |
| B | 知道的内容位于 LT 6.1 | 在不同地方出现的仍然是同一个我——我在家里、学校和朋友相处时的表现会不同，但总有某些东西保持不变。 | 教师观察到学生在做选择时提及个人兴趣或价值观，而无需提示。学生能够描述自己在两个情境中一个相同之处和一个不同之处。 | 复杂度：单一情境中的自我 → 多重情境中的自我 | Harter, S. (1999). The Construction of the Self. Guilford Press. |
| C | 知道的内容位于 LT 6.1 | 我的背景和所属文化会塑造我所注意和重视的事物——其他人的背景也会塑造他们所注意和重视的事物。 | 教师观察到学生会好奇他人的文化背景如何塑造其观点，并通过提问而非臆断来了解这些背景。 | 范围：自我理解 → 关系中的自我 | Markus, H. R. & Kitayama, S. (1991). Culture and the self: Implications for cognition, emotion, and motivation. Psychological Review, 98(2), 224–253. |
| D | 知道的内容位于 LT 6.1 | 我的身份不是固定不变的——它是我正在主动建立的东西，而且我对它拥有的能动性可能比自己有时意识到的更多。 | 教师观察到学生反思自己的自我感如何发生变化，并能够说出促成这些变化的具体经历，而无需提示。 | 推理：觉察 → 分析身份发展 | Marcia, J. E. (1966). Development and validation of ego-identity status. Journal of Personality and Social Psychology, 3(5), 551–558. |
| E | 知道的内容位于 LT 6.1 | 当文化期望与我自己的价值观发生冲突时，这种张力是真实存在的——诚实地应对这种张力，而不是压抑其中一方，才是让身份变得连贯的方式。 | 教师观察到学生能够说出自己感受到的文化压力，并阐明自己如何决定哪些内容要保留、哪些内容要质疑，而不需要外部认可。 | 推理：分析 → 有原则地应对冲突 | Berry, J. W. (2005). Acculturation: Living successfully in two cultures. International Journal of Intercultural Relations, 29(6), 697–712. |
| F | 知道的内容位于 LT 6.1 | 我是谁，一部分是由我自己建构的，另一部分则受到我无法选择的力量影响——同时承认这两个事实，才是拥有成熟自我感的含义。 | 教师观察到学生能够表达出连贯的自我感，将个人经历、文化背景和自主选择的价值观整合在一起——并在面对真正新颖的情境时运用这种连贯性。 | 迁移：已知情境 → 新颖情境；推理：分析 → 整合 | Kegan, R. (1994). In Over Our Heads: The Mental Demands of Modern Life. Harvard University Press. |

---

## 质量检查结果

检查 1 — 理解独立性：PASS — 每个 Understand 都添加了无法仅从 Do 推导出的内容。  
检查 2 — 理解迁移：PASS — 每个 Understand 都会改变学习者在新的文化或社会情境中的行为。  
检查 3 — Know 的具体性：PASS — 按设计，所有 Know 单元格都交叉引用 C6；不存在主题层级的条目。  
检查 4 — 递进杠杆：PASS — 基线 → 复杂性 → 范围 → 推理 → 推理 → 迁移。没有主题升级。  
检查 5 — 复合知识类型：PASS — K/U 内容丰富了倾向性的 Do；在此 LT 中，不会针对 K/U 内容单独设置评分标准任务。  
检查 6 — Know 的放置：PASS — 所有 Know 单元格都交叉引用 LT 6.1，而不是重复相关内容。

---

## 编写说明

Band A Do 被编写为一个需要实际完成的要素（列举三件事，描述相似点和差异），而不是纯粹的观察指标。这是因为在 Band A 阶段，该倾向性尚处于萌芽期，难以在不同情境中可靠地观察到；在这一发展阶段，结构化活动能够产生更有效的证据。教师应检查这一设计是否符合其评估实践。Band F Understand 借鉴了 Kegan 的建构发展理论——教师在采用之前应确认这一点是否与项目关于自我作者性的哲学立场一致。

# 已知限制

Understand 的质量检查最难可靠通过。判断某个 Understand 是否真正具备可迁移性，还是仅仅改述了 Do，需要对何谓新情境作出判断——在采用该技能的评估结果之前，教师应始终进行审核。已经教授该能力数年的教师，对于哪些 Understand 确实能够迁移，会比任何自动化检查拥有更准确的直觉。

路由检查会生成一条备注，但从不阻止执行。这意味着，在复杂的原始课程文档上运行该技能时，相比在结构化 harness 输出上运行，生成的草稿在 Know 的具体性和递进连贯性方面会更弱。编写说明会对此进行提示，但教师不应在未经额外审核的情况下，将直接根据文档生成的草稿视为可用于生产的版本。

前置条件的类型判断基于内容的逻辑结构，即该技能能够根据所提供的输入进行评估的结构。了解学生群体并在实践中观察过前置条件缺口的教师，比该技能更准确地知道某种关系在其具体情境中究竟是硬性门槛还是软性促进因素。

对于某些具有实际表现形式的 T3 LT（例如通过多次机会发展起来的演示技能），区分表现与倾向性需要教师判断：正在发展的能力，主要是一项可以通过一次准备充分的表现来证明的技能，还是一种需要在多次未经准备的真实情境中积累证据的倾向性。当这种歧义出现时，该技能会在编写说明中予以标记。