---
# AGENT SKILLS STANDARD FIELDS (v2)
name: learning-progression-builder
description: "Build a learning progression showing prerequisite-to-mastery steps for a target skill or understanding. Use when sequencing content, designing diagnostics, or mapping prerequisite gaps."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/learning-progression-builder"
skill_name: "Learning Progression Builder"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Heritage (2008) — Learning progressions: supporting instruction and formative assessment"
  - "Popham (2007) — The lowdown on learning progressions"
  - "Daro et al. (2011) — Learning trajectories in mathematics: a foundation for standards, curriculum, assessment, and instruction"
  - "Wilson & Bertenthal (2005) — Systems for state science assessment"
  - "Hattie & Donoghue (2016) — Learning strategies: a synthesis and conceptual model"
input_schema:
  required:
    - field: "target_skill"
      type: "string"
      description: "The skill or understanding at the end of the progression — what students should be able to do"
    - field: "student_level"
      type: "string"
      description: "Age/year group range the progression covers"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "starting_point"
      type: "string"
      description: "Where students typically begin — their existing knowledge"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: class data showing where different students currently sit on the progression"
    - field: "curriculum_framework"
      type: "string"
      description: "From context engine: relevant curriculum standards or progression documents"
output_schema:
  type: "object"
  fields:
    - field: "progression_map"
      type: "array"
      description: "Ordered sequence of stages from novice to target, with observable indicators at each stage"
    - field: "prerequisite_relationships"
      type: "object"
      description: "Which stages depend on which — the prerequisite structure"
    - field: "common_stuck_points"
      type: "array"
      description: "Where students commonly stall and why"
    - field: "diagnostic_tasks"
      type: "array"
      description: "Quick tasks that reveal which stage a student is at"
chains_well_with:
  - "competency-unpacker"
  - "formative-assessment-technique-selector"
  - "practice-problem-sequence-designer"
  - "backwards-design-unit-planner"
  - "curriculum-knowledge-architecture-designer"
  - "scope-and-sequence-designer"
teacher_time: "4 minutes"
tags: ["learning-progressions", "trajectories", "prerequisites", "diagnostic", "curriculum-mapping"]
---
# 学习进阶构建器

## 此技能的作用

针对特定技能领域，绘制从新手到目标熟练程度的学习进阶图，识别理解发展的连续阶段、各阶段之间的前置关系（什么必须先于什么）、常见卡点（学生通常会在哪些地方停滞，以及为什么），以及能够揭示学生当前所处阶段的诊断任务。输出是一份进阶图，教师可以将其用于三个方面：规划教学（按照正确的顺序进行教学）、形成性评价（诊断学生所处的位置）以及差异化教学（为每位学生当前所处的阶段提供适当的支持）。AI 在这里尤其有价值，因为构建有效的学习进阶既需要深厚的学科知识（理解领域的逻辑结构），也需要教学法知识（了解学生实际会在哪些地方卡住，而这些地方并不总是内容逻辑所预测的地方）。

## 证据基础

Heritage（2008）将学习进阶定义为“对儿童学习某一主题时可以依次形成的、越来越复杂的思考方式的描述”。她强调，进阶是经过假设的路径，而不是僵化的轨道——学生可能跳过某些阶段、重新回到更早的阶段，或采取其他路径。Popham（2007）认为，学习进阶对于形成性评价至关重要，因为它提供了那张“地图”，使教师能够定位学生当前的理解，并确定下一步。没有进阶图，教师只知道学生“遇到了困难”，却不知道困难究竟出现在学习路径的哪个位置。Daro 等人（2011）证明，数学学习轨迹——经过实证验证的进阶——为连贯的课程、评价和教学提供了基础。Wilson 与 Bertenthal（2005）将学习进阶应用于科学评价，表明基于进阶的评价比基于标准的评价更具信息量，因为它揭示了发展的路径，而不仅仅是学生是否达到了某项二元标准。Hattie 与 Donoghue（2016）表明，不同的学习策略在学习的不同阶段各自有效——表层策略（记忆、操练）在早期有效；深层策略（阐释、组织）在后期有效——这意味着教学方法应与学生在进阶中的位置相匹配。

## 输入架构

教师必须提供：
- **目标技能：** 学生最终应能够完成的任务。*例如：“解含有两边未知数的多步方程” / “围绕一篇文本撰写一段充分展开的分析性段落” / “设计并评价一项公平的科学实验”*
- **学生水平：** 年级范围。*例如：“Year 7–9” / “KS3” / “初中”*

可选（如有，可由上下文引擎注入）：
- **学科领域：** 课程所属的学科
- **起点：** 学生开始时所处的位置
- **学生画像：** 展示当前所处位置的班级数据
- **课程框架：** 相关标准或进阶文件

## 提示

```
You are an expert in learning progressions and curriculum coherence, with deep knowledge of Heritage's (2008) framework for learning progressions, Popham's (2007) work on progression-based assessment, and Hattie & Donoghue's (2016) research on stage-appropriate learning strategies. You understand that learning progressions are hypothesised pathways — they describe the typical developmental sequence but acknowledge that individual students may follow different routes.

Your task is to build a learning progression for:

**Target skill:** {{target_skill}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the target skill.
**Starting point:** {{starting_point}} — if not provided, identify the typical entry point for students at the beginning of the stated level range.
**Student profiles:** {{student_profiles}} — if not provided, design for a typical class where students are at various points along the progression.
**Curriculum framework:** {{curriculum_framework}} — if not provided, build on general curriculum expectations.

Apply these evidence-based principles:

1. **Identify sequential stages (Heritage, 2008):**
   - Define 5–7 stages from novice to target proficiency.
   - Each stage should describe a qualitatively different level of understanding or capability — not just "more" of the same thing.
   - Each stage should be OBSERVABLE — described in terms of what the student can DO, not what they "understand" internally.
   - Stages should be ordered by typical developmental sequence, acknowledging that some students may not follow this exact order.

2. **Map prerequisite relationships (Daro et al., 2011):**
   - Which stages MUST come before which? (Not just which usually do, but which logically must.)
   - Identify both linear prerequisites (A must come before B) and parallel prerequisites (both C and D must be in place before E).
   - Distinguish hard prerequisites (the stage cannot be attempted without the prior) from soft prerequisites (the stage is easier with the prior but possible without it).

3. **Identify common stuck points (Popham, 2007):**
   - Where do students typically stall? These are the diagnostic priorities.
   - For each stuck point: what does "stuck" look like, and what is usually causing it?
   - Stuck points often occur at transitions between qualitatively different types of thinking (e.g., from procedural to conceptual, from concrete to abstract).

4. **Design diagnostic tasks (Heritage, 2008; Popham, 2007):**
   - For each stage, provide a quick task (2–5 minutes) that reveals whether a student has reached that stage.
   - Diagnostic tasks should be efficient — they test the KEY indicator of each stage, not everything a student at that stage can do.
   - The task should distinguish between adjacent stages — a student at Stage 3 should pass the Stage 3 diagnostic but fail the Stage 4 diagnostic.

5. **Stage-appropriate teaching approaches (Hattie & Donoghue, 2016):**
   - Early stages: surface strategies — explicit instruction, modelling, practice with feedback.
   - Middle stages: deep strategies — elaboration, connection-making, explaining reasoning.
   - Later stages: transfer strategies — application to new contexts, evaluation, independent problem-solving.

Return your output in this exact format:

## Learning Progression: [Target Skill]

**From:** [Starting point]
**To:** [Target proficiency]
**For:** [Student level range]

### Progression Map

For each stage:
**Stage [N]: [Name]**
- **What the student can do:** [Observable indicators]
- **Key shift from previous stage:** [What's qualitatively different]
- **Prerequisite:** [What must be in place first]
- **Diagnostic task:** [Quick task that reveals whether the student is at this stage]

### Prerequisite Diagram

[Visual or textual representation of which stages depend on which]

### Common Stuck Points

For each stuck point:
**Stuck between Stage [X] and Stage [Y]**
- **What "stuck" looks like:** [Observable signs]
- **What usually causes it:** [The underlying difficulty]
- **How to unstick:** [Targeted teaching intervention]

### Teaching Implications

[How the progression should inform instruction — what to teach first, where to invest time, when to use which teaching strategies]

**Self-check before returning output:** Verify that (a) stages are qualitatively distinct, (b) each stage has observable indicators, (c) prerequisite relationships are explicit, (d) diagnostic tasks distinguish between adjacent stages, (e) stuck points are based on common patterns, and (f) the progression represents a developmental pathway, not just a list of topics.
```

## 输出示例

**情境：** *目标技能：“围绕文学文本写出一段展开充分的分析性段落，使用嵌入式引文，并说明语言对读者产生的效果” / 学生水平：“七至九年级” / 学科领域：“英国文学”*

---

## 学习进阶：文学分析性写作

**从：** 能复述文本中发生的事情（叙事概述）
**到：** 能写出一段展开充分的分析性段落，使用嵌入式引文，并说明语言选择对读者产生的效果
**适用对象：** 七至九年级英国文学

### 进阶图谱

**阶段 1：复述**
- **学生能够做到：** 按时间顺序概述文本中发生的事情。“斯克鲁奇是个刻薄的老人，不喜欢圣诞节。后来有三个幽灵拜访他，他变得和善了。”
- **相较上一阶段的关键转变：** 起点——无需前置阶段。
- **前提条件：** 基本阅读理解能力（能够理解文本中的事件）。
- **诊断任务：** “告诉我第 1 章发生了什么。”如果学生能够准确复述，他们处于阶段 1。如果他们只能复述（且无法完成阶段 2），则需要进阶。

**阶段 2：识别特征**
- **学生能够做到：** 能指出语言特征，但不作分析。“作者使用了明喻。”“这句话中有头韵。”看到技巧时能够说出其名称。
- **相较上一阶段的关键转变：** 从“发生了什么”转向“如何写成”——这是从内容到写作技巧的根本转变。
- **前提条件：** 阶段 1（必须先理解文本，才能对其进行分析）。必须知道至少 5 种技巧的名称。
- **诊断任务：** “标出并标注这段文字中你能找到的任何语言技巧。”如果学生能够正确识别 2 种或以上技巧，他们处于阶段 2。

**阶段 3：引文 + 评论**
- **学生能够做到：** 选择一段引文并对其发表评论：“作者写道‘黑暗而暴风雨肆虐的夜晚’，这表明当时很可怕。”评论具有相关性，但尚未展开——它只是一个陈述，而非解释。
- **相较上一阶段的关键转变：** 从仅仅说出技巧名称，转向选择证据并就其提出观点。
- **前提条件：** 阶段 2（必须能够识别特征）。必须理解引文可作为证据。
- **诊断任务：** “从文本中选择一段引文，并解释它表明了什么。”如果学生选择了相关引文，并作出一条相关评论（即使很简短），他们处于阶段 3。

**阶段 4：解释效果**
- **学生能够做到：** 解释语言对读者产生的作用：“‘狂暴’一词表明大海凶猛且失控，这使读者为人物感到害怕。”解释是具体的——它指出读者所经历的一种感受、画面或想法。
- **相较上一阶段的关键转变：** 从评论文本说了什么，转向解释文本**产生了什么作用**——从内容到效果。这是关键的分析性转变。
- **前提条件：** 阶段 3（必须能够选择证据并加以评论）。必须理解作者作出选择是为了对读者产生效果。
- **诊断任务：** “‘狂暴’一词对读者有什么效果？它让你想到或感受到什么？”如果学生能够说出一种具体效果（而非“它很有效”或“它让你想继续读下去”），他们处于阶段 4。

**阶段 5：形成发展的分析段落**
- **学生能够做到的事情：** 撰写遵循连贯结构的段落：观点 → 融入式引用 → 对具体词语的分析 → 对效果的解释 → 联系更广泛的意义。每一部分都与下一部分逻辑相连。
- **与上一阶段相比的关键转变：** 从孤立的评论转向持续且有结构的分析——通过多个彼此递进的句子展开论述。
- **前置要求：** 阶段 4（必须能够解释效果）。必须理解段落结构和衔接。
- **诊断任务：**“写一个段落，分析作者如何在这段节选中营造紧张感。”如果段落包含清晰的观点、融入式证据、具体的词语层面分析以及对效果的解释，那么该学生处于阶段 5。

**阶段 6：评价性与比较性分析（目标）**
- **学生能够做到的事情：** 撰写分析段落，思考多种可能的解读，比较不同技巧，评价哪一种最有效，并将分析联系到作者更广泛的写作目的和主题。使用评价性和比较性语言：“虽然隐喻营造了视觉上的力量，但真正传达人物痛苦的是句子结构。”
- **与上一阶段相比的关键转变：** 从单一解读的分析转向评价性、比较性、多层次的分析——学生会思考作者为什么选择这种表达，而不是其他可能的选择。
- **前置要求：** 阶段 5（必须能够撰写形成发展的分析段落）。必须对完整文本和背景有足够了解。
- **诊断任务：**“分析作者如何在这段节选中营造[效果]。至少考虑两种技巧，并评价哪一种更有效。”如果学生能够比较不同技巧，并有理有据地进行评价，那么他们处于阶段 6。

### 前置要求图示

```
阶段 1（复述）
    ↓
阶段 2（识别特征）← [要求：了解技巧名称]
    ↓
阶段 3（引用 + 评论）
    ↓
阶段 4（解释效果）← [关键转变：从内容 → 效果]
    ↓
阶段 5（形成发展的段落）← [要求：段落结构技能]
    ↓
阶段 6（评价性分析）← [要求：对完整文本有更广泛的了解]
```

线性递进，并在阶段 2、5 和 6 存在横向前置要求。

### 常见卡点

**卡在阶段 2 和阶段 3 之间：能够识别技巧，但无法选择证据**
- **“卡住”的表现：** 学生积极地标记并标注各种技巧，但当被要求“选择一处引用并解释它”时就不知所措。他们能够发现语言特征，却无法选出最适合分析的那一处。
- **通常的成因：** 学生接受的训练是识别所有技巧（特征识别），却没有学会评价哪一处引用值得写。他们把技巧看作需要找出的东西，而不是需要分析的东西。
- **解除卡点的方法：** 教授引用选择：“这里有三处引用。哪一处最能让你展开论述？为什么？”在要求学生自行寻找引用之前，先练习在不同引用之间进行选择。

**卡在第 3 阶段和第 4 阶段之间：能够评论，但无法解释效果（最常见的卡点）**
- **“卡住”的表现：** 学生写出“This shows that...”并提出了相关评论，但评论描述的是内容，而不是效果。“这个隐喻表明大海很危险”（内容）与“这个隐喻让读者感到害怕”（效果）。或者，学生习惯性地给出笼统的效果判断：“这很有效，让读者想要继续读下去。”
- **通常的原因：** 学生没有区分文本在说什么和文本产生了什么作用。他们已经学会从文本中寻找意义，却没有思考读者的阅读体验。这是一道概念上的障碍——他们需要理解，分析关注的是语言产生的**效果**，而不仅仅是语言的含义。
- **打破僵局的方法：** 使用两个问题的技巧：每次引用之后，问“这让你看到了什么？”以及“这让你感受到了什么？”这些问题会迫使学生关注读者的体验。进行大量示范：并列展示内容评论与效果分析之间的区别。

**卡在第 5 阶段和第 6 阶段之间：能够写段落，但无法评价或比较**
- **“卡住”的表现：** 学生能够写出合格的 PEEL 段落，逐一分析某种技巧，但无法比较不同技巧、考虑其他可能的解读，或评价它们相对而言的效果。他们的段落本身写得扎实，却彼此独立——没有共同构建出更大的分析论点。
- **通常的原因：** 学生已经掌握了程序性技能（写分析段落），但还没有形成超越这一技能所需的评价性思维。比较和评价属于更高阶的技能，要求学生同时把握多个分析。
- **打破僵局的方法：** 明确教授比较：“你已经写了隐喻。现在写句子结构。接下来——哪一种技巧在营造紧张感方面**更**有效？为什么？”提供比较框架：“虽然[技巧 1]产生了[效果]，[技巧 2]可以说更有效，因为……”

### 教学启示

1. **在第 3→4 阶段的过渡上投入最多时间。** 这是大多数学生停滞的地方，也是关键分析转变发生的地方。能够解释效果的学生已经为快速进步到第 5 和第 6 阶段做好准备；无法解释效果的学生无论写多少都会陷入停滞。

2. **不要跳过阶段。** 尚不能识别技巧的学生（第 2 阶段）不应被要求写分析段落（第 5 阶段）。这些阶段彼此建立在对方之上——在没有打好基础的情况下直接跳到最终任务，会造成不知所措，而不是带来学习。

3. **使用诊断任务进行差异化教学。** 在任何一个八年级班级中，学生都可能分布在第 2 至第 5 阶段。使用诊断任务确定每位学生所处的阶段，然后提供与阶段相匹配的教学：第 2 阶段的学生练习识别，第 3 阶段的学生练习选择引用，第 4 阶段的学生练习解释效果，第 5 阶段的学生练习构建段落。

4. **使教学方法与阶段相匹配。**阶段 1–3：明确指导、示范、引导练习（表层策略）。阶段 4：思维外显、示例讲解、同伴讨论（深层策略）。阶段 5–6：独立练习、依据标准进行自我评估、比较性写作任务（迁移策略）。

---

## 已知局限

1. **学习进阶描述的是假设性路径，而非固定轨道。**个别学生可能跳过某些阶段、暂时退步，或以不同顺序发展技能。该进阶描述的是典型的发展序列——当学生没有按照预期路径发展时，教师必须运用专业判断。

2. **该进阶描述的是某一领域内的技能发展。**由于底层文本呈现出不同的挑战，同一名学生可能在诗歌分析方面处于阶段 5，而在散文分析方面处于阶段 3。进阶具有领域特异性——教师应分别评估各个领域。

3. **诊断任务提供的是一个快照，而非全面评估。**某学生在某一次诊断任务中通过了阶段 4 的要求，并不代表其能够持续稳定地达到阶段 4。诊断任务用于定位学生的大致位置——持续进行的形成性评估才能提供更完整的情况。