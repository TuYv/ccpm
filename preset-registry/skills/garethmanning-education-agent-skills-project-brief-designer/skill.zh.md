---
# AGENT SKILLS STANDARD FIELDS (v2)
name: project-brief-designer
description: "Design a project-based learning brief with a driving question, milestones, and assessment criteria. Use when planning PBL units, inquiry projects, or extended investigations."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/project-brief-designer"
skill_name: "Project Brief Designer (PBL)"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Barron & Darling-Hammond (2008) — Teaching for meaningful learning: a review of research on inquiry-based and cooperative learning"
  - "Krajcik & Shin (2014) — Project-based learning: design features and key practices"
  - "Larmer, Mergendoller & Boss (2015) — Setting the Standard for Project Based Learning"
  - "Thomas (2000) — A review of research on project-based learning"
  - "Hmelo-Silver, Duncan & Chinn (2007) — Scaffolding and achievement in problem-based and inquiry learning"
input_schema:
  required:
    - field: "project_topic"
      type: "string"
      description: "The subject content the project addresses — what students will learn about"
    - field: "learning_objectives"
      type: "string"
      description: "The specific knowledge and skills students should develop through the project"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "project_duration"
      type: "string"
      description: "How long the project runs — e.g. 2 weeks, 6 lessons, half a term"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject or subjects (for cross-curricular projects)"
    - field: "real_world_connection"
      type: "string"
      description: "A specific real-world context, audience, or problem the teacher wants the project connected to"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: class data including prior attainment, interests, specific needs"
    - field: "available_resources"
      type: "string"
      description: "Technology, materials, community connections, specialist support available"
    - field: "curriculum_framework"
      type: "string"
      description: "From context engine: relevant curriculum standards the project must address"
output_schema:
  type: "object"
  fields:
    - field: "driving_question"
      type: "string"
      description: "An open-ended, authentic question that drives inquiry throughout the project"
    - field: "project_brief"
      type: "object"
      description: "The complete brief students receive — scenario, requirements, milestones, final product"
    - field: "milestone_sequence"
      type: "array"
      description: "Structured checkpoints with explicit instruction points, ensuring learning happens through the project"
    - field: "assessment_criteria"
      type: "object"
      description: "What will be assessed and how — including both process and product assessment"
    - field: "explicit_instruction_map"
      type: "array"
      description: "Where in the project explicit teaching is needed — PBL works WITH direct instruction, not instead of it"
chains_well_with:
  - "backwards-design-unit-planner"
  - "competency-unpacker"
  - "criterion-referenced-rubric-generator"
  - "differentiation-adapter"
  - "scaffolded-task-modifier"
  - "curriculum-knowledge-architecture-designer"
  - "critical-thinking-task-designer"
teacher_time: "5 minutes"
tags: ["PBL", "project-based-learning", "inquiry", "driving-question", "authentic-assessment", "milestones"]
---
# 项目简报设计师（PBL）

## 此技能的作用

为基于项目的学习设计完整的项目简报，包括驱动性问题、现实世界联系、结构化里程碑、明确的教学要点和评估标准，确保学生是**通过项目**学习实质性内容，而不只是产出一个产品。关键设计原则是：有效的 PBL 将真实且开放式的探究与结构化教学相结合：项目提供动机和情境；明确的教学则提供学生成功完成项目所需的知识与技能。输出包括一份可直接使用的项目简报，教师可以将其发给学生；同时还包括一份面向教师的实施指南，标明需要直接教学、形成性评估和支架支持的环节。AI 在这里尤其有价值，因为设计有效的 PBL 需要同时平衡真实性（让项目具有现实感）、严谨性（确保发生实质性学习）、结构性（建立防止项目偏离方向的里程碑）和差异化（让所有学习者都能参与项目）——这是一项需要大量专业知识和时间的多维设计挑战。

## 证据基础

Barron & Darling-Hammond (2008) 回顾了关于探究式学习的证据，并确定了有效项目区别于那些虽然有吸引力但教育深度不足的活动的设计特征：有效的 PBL 与有意义的现实世界问题相联系，要求学生进行学科性思考（而不仅仅是收集信息），包含结构化里程碑，并在学生需要新知识或技能的环节融入明确教学。他们发现，PBL 在作为直接教学的补充而非替代时最为有效——项目提供使教学变得有意义的情境，而教学提供使项目得以实现的工具。Krajcik & Shin (2014) 确定了有效 PBL 的五项关键特征：驱动性问题（真实、开放式，并以现实世界议题为基础）、情境化探究（嵌入有意义情境中的调查）、协作、学习技术和有形作品。他们强调，驱动性问题是设计的核心——它必须真正开放（不能是有预设答案的问题），与学生的生活相联系，并且足够丰富，能够支撑持续较长时间的探究。来自 Buck Institute for Education 的 Larmer、Mergendoller & Boss (2015) 建立了“Gold Standard PBL”框架，其中包含七项基本设计要素：具有挑战性的问题或任务、持续探究、真实性、学生的声音与选择、反思、批评与修订，以及公开展示的成果。Thomas (2000) 回顾了 PBL 研究，发现 PBL 对内容知识和问题解决能力具有积极影响，但也指出，设计不佳的项目可能耗时很长，却无法带来相称的学习成果——结构和明确教学正是其中的区分因素。Hmelo-Silver、Duncan & Chinn (2007) 证明，有支架的探究优于无支架的探究——学生需要结构化支持，而不只是开放式任务。

## 输入架构

教师必须提供：
- **项目主题：** 项目内容是什么。*例如：“我们当地河流的水质” / “设计一座可持续发展的城市” / “工业革命对劳动人民的影响” / “创建一项减少学校食物浪费的宣传活动”*
- **学习目标：** 学生应学到什么。*例如：“理解水污染的成因与影响，应用科学测试方法，向受众传达研究结果” / “分析有关工作条件的一手和二手资料，运用证据构建历史论点”*
- **学生年级：** 年级组。*例如：“8年级” / “10年级”*
- **项目时长：** 持续多久。*例如：“3周内完成6节课” / “半个学期（12节课）”*

可选项（如果可用，由上下文引擎注入）：
- **学科领域：** 课程所属的学科
- **现实世界联系：** 教师希望采用的具体背景
- **学生概况：** 班级数据、兴趣、需求
- **可用资源：** 技术、材料、社区联系
- **课程框架：** 需要达成的标准

## 提示词

```
You are an expert in project-based learning design, with deep knowledge of Barron & Darling-Hammond's (2008) research on inquiry-based learning, Krajcik & Shin's (2014) five key features of effective PBL, and Larmer, Mergendoller & Boss's (2015) Gold Standard PBL framework. You understand that effective PBL is NOT simply "do a project" — it is a carefully designed learning experience where authentic inquiry and explicit instruction work together so that students learn substantive content THROUGH the project.

CRITICAL DESIGN PRINCIPLE: PBL effects are strongest when projects include explicit instruction, not instead of it (Barron & Darling-Hammond, 2008; Hmelo-Silver et al., 2007). Every project brief you design must include specific points where the teacher provides direct instruction, modelling, or scaffolding. A project without structured teaching is an activity, not PBL.

Your task is to design a project brief for:

**Project topic:** {{project_topic}}
**Learning objectives:** {{learning_objectives}}
**Student level:** {{student_level}}
**Project duration:** {{project_duration}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the topic and objectives.
**Real-world connection:** {{real_world_connection}} — if not provided, design an authentic connection that makes the project meaningful to students at this level.
**Student profiles:** {{student_profiles}} — if not provided, design for a mixed-ability class.
**Available resources:** {{available_resources}} — if not provided, assume standard classroom resources with internet access but no specialist equipment.
**Curriculum framework:** {{curriculum_framework}} — if not provided, align to the stated learning objectives.

Apply these evidence-based PBL design principles:

1. **Design a driving question (Krajcik & Shin, 2014):**
   - The driving question must be OPEN-ENDED — it should not have a single correct answer.
   - It must be AUTHENTIC — connected to real-world issues, audiences, or problems that matter beyond the classroom.
   - It must be FEASIBLE — students at this level can meaningfully investigate it within the time available.
   - It must REQUIRE the intended learning — students cannot answer the question without developing the knowledge and skills in the learning objectives.
   - Avoid pseudo-questions that have predetermined answers. "How can we reduce water pollution in our local river?" is open. "What are the three types of water pollution?" is not.

2. **Structure milestones with explicit instruction (Barron & Darling-Hammond, 2008; Hmelo-Silver et al., 2007):**
   - Break the project into 3–5 milestones, each with a clear deliverable.
   - At each milestone, identify: what students produce, what they need to know/be able to do, and WHERE EXPLICIT INSTRUCTION HAPPENS.
   - Instruction should be "just in time" — taught when students need it for the next phase of the project, not front-loaded as a lecture block followed by a project block.
   - Each milestone should include a formative check — how does the teacher know students are learning, not just producing?

3. **Ensure authentic audience and purpose (Larmer et al., 2015):**
   - The final product should be FOR someone — a real audience, a genuine purpose.
   - "Present your findings to the class" is weak. "Present your water quality report to the local council environmental officer" is strong.
   - If a real audience isn't available, create a realistic scenario that simulates one.

4. **Build in student voice and choice (Larmer et al., 2015):**
   - Students should have meaningful choices within the project — which aspect to investigate, how to present findings, which evidence to prioritise.
   - Choice should be structured, not unlimited — too much choice overwhelms; too little removes ownership.
   - The learning objectives are non-negotiable; the route to them includes choice.

5. **Design assessment for both process and product (Barron & Darling-Hammond, 2008):**
   - Assess the LEARNING, not just the PRODUCT. A beautiful poster with no substantive content should not score well.
   - Include process assessment: research logs, draft work, peer feedback, reflection.
   - Assessment criteria should be transparent from the start — students should know how they'll be assessed before they begin.
   - Product quality matters, but content understanding matters more.

6. **Include reflection and revision (Larmer et al., 2015):**
   - Build in structured reflection points: "What have you learned so far? What questions do you still have?"
   - Build in revision opportunities: students improve their work based on feedback before final submission.
   - Critique and revision is where much of the learning happens — not in the first draft.

Return your output in this exact format:

## Project Brief: [Project Title]

**Driving Question:** [The open-ended question that drives the project]
**For:** [Student level]
**Duration:** [Project duration]
**Subject:** [Subject area(s)]

### The Scenario

[A compelling, authentic description of the project context — who needs this, why it matters, what students will produce. Written in language appropriate for the student level. This is what students actually read.]

### What You Will Produce

[Clear description of the final product(s) and who the audience is]

### Milestones

For each milestone:
**Milestone [N]: [Name] — [Timing]**
- **What you produce:** [Deliverable]
- **What you'll need to learn:** [Knowledge/skills required]
- **Teacher instruction point:** [What the teacher explicitly teaches at this stage and why]
- **Formative check:** [How the teacher assesses learning at this stage]
- **Student choice:** [Where students have meaningful choice within this milestone]

### Assessment Criteria

**Your project will be assessed on:**
[Clear, transparent criteria — what counts, what doesn't, how much each element is worth]

**Process assessment (how you work):**
[What process elements are assessed — research quality, collaboration, reflection, revision]

**Product assessment (what you produce):**
[What product elements are assessed — content accuracy, argument quality, communication effectiveness]

### Explicit Instruction Map (Teacher Guide)

[For each milestone: what the teacher needs to teach, when, and how. This ensures the project includes genuine instruction, not just facilitation.]

### Differentiation Notes

[How the project can be adapted for different learners — extension challenges, support scaffolds, EAL modifications — while maintaining the same learning objectives]

### Known Design Choices

[Transparent notes about trade-offs in the design — what was prioritised, what was sacrificed, what the teacher should watch for]

**Self-check before returning output:** Verify that (a) the driving question is genuinely open-ended and requires the intended learning, (b) every milestone includes an explicit instruction point, (c) assessment criteria are transparent and prioritise content learning over product aesthetics, (d) student voice and choice are structured within each milestone, (e) the project includes reflection and revision opportunities, and (f) the project could not be completed without substantive learning — it's not possible to produce a good product by copying information without understanding it.
```

## 示例输出

**情境：** *项目主题：“当地河流的水质” / 学习目标：“理解水污染的成因和指标，应用科学测试方法（pH、溶解氧、硝酸盐含量），评估证据并得出结论，将科学发现传达给非专业受众” / 学生年级：“八年级” / 项目时长：“4 周内完成 8 节课” / 学科领域：“科学” / 现实世界联系：“当地河流曾有藻类大量增加的报告——这是一个真实的本地问题”*

---

## 项目简介：河流健康状况调查

**核心问题：** 我们当地的河流有多健康？应该采取什么措施？
**适用对象：** 八年级科学
**时长：** 4 周内完成 8 节课
**学科：** 科学（包含地理和沟通表达方面的内容）

### 情境

近几个月来，阿登河附近的居民注意到水面上生长的绿色藻类越来越多，尤其是在米尔布鲁克工业园区附近。一些遛狗的人表示，他们的狗在饮用河水后生病了。当地教区委员会希望了解究竟发生了什么，但他们缺乏科学方面的专业知识。

他们需要一支科学家团队来：
1. 测试河流不同地点的水质
2. 找出问题的成因
3. 用通俗易懂的语言解释调查结果
4. 建议应采取的措施

你们的团队受委托开展这项调查。你们的调查结果将以科学报告的形式提交给教区委员会——这些人关心这条河流，但没有科学背景。你们的报告既要科学准确，也要让非专业人士能够理解。

### 你们将要完成的成果

**最终成果：** 一份面向教区委员会的科学报告（800–1200 字），内容包括：
- 你们的水质调查结果及数据
- 对数据含义的清晰解释
- 基于证据得出的关于河流健康状况的结论
- 具体的行动建议

**受众：** 教区委员会（需要根据你们的调查结果作出决策的非专业成年人士）

**展示：** 每个团队将向全班进行 5 分钟的报告总结，教师将扮演教区委员会成员并提出问题。

### 里程碑

**里程碑 1：理解水质——第 1–2 课**
- **你们要完成的成果：** 一份研究摘要（1 页），确定水质的关键指标以及影响这些指标的因素。至少包括 4 个指标，并解释每个指标在什么情况下属于“健康”或“不健康”水平。
- **你们需要学习的内容：** 水质在科学上的含义、关键指标（pH、溶解氧、硝酸盐/磷酸盐含量、生物指标）、河流污染的成因，以及什么是富营养化。
- **教师讲授环节：** 第 1 课——教师直接讲解水质指标。教师解释 pH、溶解氧、硝酸盐和磷酸盐，并使用示意图展示过量营养物质如何导致藻类暴发（富营养化）。这是学生在有限时间内无法独立探究的重要知识。第 2 课——教师示范如何读取和解读水质数据表，展示“正常”范围是什么样的，以及如何发现值得关注的读数。
- **形成性检查：** 第 2 课结束时完成离堂卡：“某河流样本的 pH 为 6.2，溶解氧为 4mg/L，硝酸盐含量为 25mg/L。这条河流健康吗？请至少使用两个指标解释你的判断理由。”这项检查用于确认学生是否能够解读数据，而不仅仅是回忆有哪些指标。
- **学生选择：** 各团队选择调查中重点关注的两个指标（所有团队都必须研究 pH 和溶解氧；团队根据兴趣选择其他重点领域）。

**里程碑 2：收集和记录数据——第 3–4 课**
- **产出内容：** 完成一份数据表，准确记录至少 3 个采样点的水质测量结果，包括单位和重复测量数据。
- **需要学习的内容：** 如何使用检测设备（pH 计、溶解氧探头、硝酸盐检测试纸），如何设计公平的测试（在采样时控制变量），以及如何在表格中准确记录数据。
- **教师指导重点：** 第 3 课——教师演示每种检测设备的使用方法，示范正确操作步骤和常见错误。学生在前往河流前，使用预先准备好的样本进行练习。这是一项需要明确示范的实践技能——学生无法仅通过尝试自行摸索出如何使用溶解氧探头。第 4 课——教师简要讲解公平测试：为什么要在相同深度进行采样、为什么要进行重复测量，以及为什么要记录环境条件。这与更广泛的控制变量科学技能相联系。
- **形成性检查：** 教师在数据收集过程中巡视并检查：测量结果是否记录了正确的单位？学生是否进行了重复测量？学生能否解释为什么要在沿河的多个地点进行检测？（如果学生无法解释原因，说明他们只是在遵循操作步骤，并未理解其中的科学依据。）
- **学生选择：** 各小组根据对污染可能最严重地点的假设，在获准区域内选择河流沿线的采样点。他们必须用科学依据说明选择这些地点的理由。

**里程碑 3：分析证据并得出结论——第 5–6 课**
- **产出内容：** 一份数据分析文档，包括：使用合适的图表呈现数据、对数据所反映内容的书面解读，以及基于证据对河流水质状况作出的结论。
- **需要学习的内容：** 如何为不同类型的数据选择合适的图表类型，如何识别数据中的模式和异常值，以及如何撰写基于证据的结论（主张 → 证据 → 推理）。
- **教师指导重点：** 第 5 课——教师使用一组样例数据（不是学生自己的数据）示范如何分析水质数据。具体演示：比较不同地点时选择柱状图，展示沿河变化时选择折线图；识别模式所代表的含义（“从工业区向下游移动时，溶解氧逐渐降低——这表明……”）；以及区分相关性和因果关系。第 6 课——教师提供“主张—证据—推理”（CER）框架，并示范撰写一段结论，同时通过思考过程讲解如何将数据与主张联系起来。
- **形成性检查：** 每个小组须在第 6 课结束前提交一段结论草稿（仅一段）。教师会在当天晚上批阅，并针对结论是否得到所引用证据支持提供有针对性的书面反馈。这是关键的学习时刻——学生能否使用数据支持科学论证？
- **学生选择：** 各小组自行决定以何种方式直观呈现数据（图表类型、布局、需要重点突出的比较内容）。他们还可以根据自己的判断，选择在结论中重点强调哪些发现，因为这些发现对他们而言最为重要。

**里程碑 4：面向非专业受众进行沟通——第 7–8 课**
- **你需要完成的内容：** 最终报告（800–1200 字）和一份 5 分钟的演示总结。
- **你需要学习的内容：** 如何向非专业人士传达科学发现——在不损失准确性的前提下，将技术性语言转化为易于理解的解释，并针对决策受众组织报告结构。
- **教师指导要点：** 第 7 课——教师并列展示两个示例段落：一个写给科学家（“升高的 NO₃⁻ 浓度达到 28mg/L，表明存在人为因素导致的富营养化”），另一个写给教区委员会（“河流中的硝酸盐含量高于正常水平。硝酸盐对藻类来说就像肥料一样——当含量超过 10mg/L 时，藻类可能会失控般生长”）。学生找出两者的差异，并练习将自己分析中的一段内容进行“翻译”。这是一项需要通过示范来教授的具体沟通技能。
- **形成性检查：** 第 7 课进行同伴互评：每个小组阅读另一个小组的报告草稿，并回答三个问题：（1）没有科学背景的读者能否理解研究发现？（2）是否有明确的建议？（3）有哪些内容还需要进一步解释？各小组根据同伴反馈进行修改，然后在第 8 课提交最终版本。
- **学生选择：** 各小组在字数限制内自行选择最终报告的格式和结构，并自行决定演示的方式（所有成员发言、由一人进行演示而其他成员负责回答问题等）。

### 评估标准

**你的项目将根据以下标准进行评估：**

**过程评估（总分的 30%）：**
- 研究质量（里程碑 1）：你是否准确识别并解释了水质指标？（10%）
- 数据收集（里程碑 2）：你的数据记录是否准确，是否进行了重复测量，并使用了正确的单位？（10%）
- 反思与修改：你是否根据同伴反馈改进了报告？你具体做了哪些修改，为什么？（10%）

**成果评估（总分的 70%）：**
- 科学准确性（25%）：你的研究发现是否正确？你的结论是否得到数据支持？你是否正确解释了水污染相关科学原理？
- 基于证据的论证（20%）：你是否将数据作为证据使用？你的推理是否清晰？你的结论是否能够从证据中合理得出？
- 面向受众的沟通（15%）：非专业人士能否理解你的报告？你是否在不损失准确性的前提下，将科学语言转化为易于理解的表达？
- 建议（10%）：你的建议是否具体、可行，并且基于你的研究发现？

**注意：** 报告的视觉设计不纳入评估。一份科学内容出色的纯文本报告，其得分会高于一份设计精美但科学性薄弱的报告。请将时间重点放在理解和论证上，而不是装饰上。

### 明确指导安排（教师指南）

| 课程 | 明确指导内容 | 目的 | 时间安排 |
|--------|---------------------|---------|--------|
| 1 | 水质指标、富营养化过程 | 为学生开展调查提供必要的基础知识 | 25 分钟直接讲授 + 20 分钟引导式研究 |
| 2 | 阅读和解读水质数据表 | 程序性技能：如何理解数值数据 | 15 分钟示范 + 30 分钟使用样本数据进行练习 |
| 3 | 设备演示和公平测试 | 需要通过示范掌握的实践技能——无法安全地依靠自学完成 | 20 分钟演示 + 25 分钟监督下的练习 |
| 4 | 简要复习变量和采样设计 | 将实践工作与科学方法联系起来 | 10 分钟指导 + 实地工作 |
| 5 | 数据分析：图表选择、模式识别 | 分析技能：从数据迈向理解 | 使用样本数据进行 20 分钟示范 + 25 分钟引导式分析 |
| 6 | 科学结论的 CER 框架 | 写作技能：组织基于证据的论证 | 15 分钟示范 + 30 分钟在反馈下起草 |
| 7 | 向非专业人士传达科学内容 | 沟通技能：意识到受众差异 | 15 分钟示范 + 30 分钟修改 |
| 8 | —（学生演示和最终提交） | 评估与成果庆祝 | — |

**明确讲授总时长：**8 节课共约 120 分钟。剩余时间用于结构化探究、协作学习和形成性评价。这并不是“教师讲授 2 节课，然后学生用 6 节课完成项目”——讲授内容贯穿整个项目，在学生需要时及时提供。

### 差异化教学说明

**拓展：**提前完成里程碑的学生可以研究其他指标（例如无脊椎动物多样性等生物指标），将他们的发现与类似河流的已发表数据进行比较，或者为特定受众撰写第二个版本的报告（例如，为正在地理课上学习河流的 Year 5 学生撰写的版本）。

**支持：**在第 1 课之前安排简短的水质词汇预教学习。提供已填写好单位和列标题的数据记录模板。提供报告结构模板，其中包含各部分的标题以及每段的句子开头。这些支架能够帮助学生组织输出，但不会降低分析要求——学生仍然必须解读数据并得出结论。

**EAL：**提供关键科学术语表，并配以日常语言定义。将富营养化过程的视觉示意图与书面解释结合使用。允许学生先用自己的第一语言讨论发现，再用英语写作。为 CER 段落提供句型框架：“我们的数据表明，___。这说明___，因为___。”

**ADHD：**将每节课的任务分解为更短的环节，并设置明确的“完成”检查点。提供项目里程碑的可视化时间线。在实地考察期间，分配具体角色（设备管理员、数据记录员），以提供专注点和结构。

### 已知设计选择

1. **河流情境基于一个真实的本地问题。**如果该河流或问题与你所在地区的实际情况不符，请调整情境——这些设计原则适用于任何真实的环境问题。关键要求是：问题必须是真实的（或经过逼真模拟的），而不是人为编造的。

2. **报告的优先级高于展示。**报告占评价总分的 70%；展示是一项交流练习，而不是对表现能力的评价。这可以避免将公开演讲的自信程度误认为科学理解能力，从而造成效度威胁（参见 Assessment Validity Checker）。

3. **视觉设计明确不纳入评价。**这是经过审慎考虑的选择，旨在防止学生把时间投入装饰而不是科学内容。这也消除了一个社会经济障碍（是否能够使用彩色打印和设计软件），以及一个公平性障碍（有阅读障碍或精细动作困难的学生不会因此受到惩罚）。

4. **项目要求在每个里程碑处提供明确讲授。**这是最重要的设计特征。PBL 研究一再表明，没有结构化教学的项目只能带来参与度，却无法带来相称的学习成果（Thomas，2000）。如果删去这些讲授环节，项目就会变成一项活动——学生会通过复制网站上的信息来完成报告，而不是通过理解科学原理来完成报告。

5. **四周是本项目可行的最短周期。** 更短的时间安排将需要压缩数据收集环节（这会削弱真实探究）或压缩修订周期（这会减少一个关键的学习机会）。如果时间有限，应减少采样点的数量，而不是删减里程碑。

---

## 已知局限

1. **PBL 的质量高度取决于驱动性问题。** 生成的驱动性问题旨在具有开放性、真实性，并要求学习者达成预期学习目标，但教师应评估它是否真正能够吸引自己的学生。一个在某种情境下有效的问题，在另一种情境下可能会完全失效。教师可能需要调整驱动性问题，使其与学生的兴趣和当地情境建立联系。

2. **建立真实世界的联系需要本地知识。** 项目简介会根据所述主题和真实世界联系生成一个情境，但教师对所在社区、当地资源以及潜在外部合作伙伴的了解胜过任何 AI。生成的情境应被视为一个很好的起点，并根据当地情况进行调整——将笼统的细节替换为具体的本地名称、地点和问题。

3. **PBL 并不适用于所有学习目标。** 某些内容更适合通过直接教学、练习和提取练习来教授，尤其是学生在开展探究之前需要掌握的基础知识（Hmelo-Silver et al., 2007）。PBL 最适合涉及应用、分析、评价和交流的目标，而不适合主要关注获取事实性知识的目标。在使用此 skill 之前，教师应考虑 PBL 是否适合所述学习目标。

4. **明确的教学指导图是一份指南，而不是教学脚本。** 建议的教学节点指出了需要在何处进行教学，但无法明确规定适用于每个班级的具体教学方式。教师必须根据专业判断，决定应提供多少教学，如何回应项目过程中出现的误解，以及何时暂停项目，补充原始设计中未预料到的教学内容。