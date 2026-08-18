---
# AGENT SKILLS STANDARD FIELDS (v2)
name: sheltered-instruction-lesson-modifier
description: "Modify a lesson plan using SIOP sheltered instruction principles to support language learners across all four skills. Use when planning lessons for classes that include EAL students."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "eal-language-development/sheltered-instruction-lesson-modifier"
skill_name: "Sheltered Instruction Lesson Modifier"
domain: "eal-language-development"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Echevarría, Vogt & Short (2008, 2017) — Making Content Comprehensible for English Learners: the SIOP Model"
  - "Short, Fidelman & Louguit (2012) — Developing academic language in English language learners through sheltered instruction"
  - "Cummins (2000) — Language, Power and Pedagogy"
  - "Gibbons (2015) — Scaffolding Language, Scaffolding Learning"
  - "Lyster (2007) — Learning and Teaching Languages Through Content: a counterbalanced approach"
input_schema:
  required:
    - field: "lesson_plan"
      type: "string"
      description: "A description of the planned lesson — topic, activities, resources, and learning objective"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "eal_students"
      type: "string"
      description: "Number of EAL students and their approximate proficiency levels"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: first languages, time in English-medium schooling, specific needs"
    - field: "lesson_duration"
      type: "string"
      description: "Length of the lesson"
    - field: "resources_available"
      type: "string"
      description: "Technology, bilingual resources, teaching assistants, or other supports available"
output_schema:
  type: "object"
  fields:
    - field: "modified_lesson"
      type: "object"
      description: "The lesson plan modified with SIOP components — content objectives, language objectives, scaffolds for each phase"
    - field: "language_objectives"
      type: "array"
      description: "Explicit language objectives aligned to the content being taught"
    - field: "siop_component_checklist"
      type: "object"
      description: "How each SIOP component is addressed in the modified lesson"
    - field: "teacher_adaptations"
      type: "array"
      description: "Specific changes to teacher talk, pacing, and interaction patterns"
chains_well_with:
  - "language-demand-analyser"
  - "vocabulary-tiering-tool"
  - "scaffolded-task-modifier"
  - "academic-language-sentence-frame-generator"
teacher_time: "5 minutes"
tags: ["SIOP", "sheltered-instruction", "EAL", "lesson-planning", "content-language-integration"]
---
# 受保护教学课程修订器

## 此技能的作用

接收一份学科课程教案，并依据 SIOP（受保护教学观察协议）模型的原则对其进行修改，加入明确的语言目标，构建背景知识，使输入变得可理解，组织有意义的互动，并提供练习与应用的机会，同时保持学科学习目标不变。输出是一份修改后的教案，服务于所有学生（而不仅仅是 EAL 学生），因为 SIOP 的原则——明确的目标、可理解的输入、结构化的互动、有意义的练习——对每个人而言都是良好的教学。AI 在这里尤其有价值，因为有效的受保护教学需要同时从两个视角分析课程（内容和语言），并以连贯且实用的方式跨越多个 SIOP 组成部分进行修改——这不是一份彼此割裂的附加项目清单，而是一种整合性的重新设计。

## 证据基础

Echevarría、Vogt 和 Short（2008、2017）提出了 SIOP 模型——这是目前针对英语学习者进行学科教学、研究最为严谨的方法。该模型在 8 个组成部分中确定了 30 项特征：课程准备（内容目标和语言目标）、构建背景（联系已有知识）、可理解的输入（清晰且经过调整的教师话语）、策略（支架、元认知提示）、互动（结构化的口语交流机会）、练习/应用（有意义的任务）、课程实施（节奏、参与度）以及复习/评估（检查理解情况）。Short、Fidelman 和 Louguit（2012）证明，系统实施 SIOP 能够显著促进学科学习和学术语言发展，在不同学科中的效应量达到 0.40–0.60。关键在于，接受 SIOP 教学的班级中，**所有**学生都取得了进步，而不仅仅是 EAL 学生——这些原则对所有学生都有效。Cummins（2000）确立了这样一个观点：学术语言通过有意义地参与具有挑战性的内容而发展，而不是通过简化内容或孤立的语言练习发展。Gibbons（2015）强调，当学生在适当支持下参与具有认知挑战性的学科任务时，语言学习的效果最为显著。Lyster（2007）证明，基于内容的语言教学比孤立的语言教学更有效，但前提是语言必须与学科内容同步被明确关注并进行练习——隐性的“沉浸式”学习是不够的。

## 输入模式

教师必须提供：
- **教案：** 对计划开展的课程进行描述。*例如：“八年级地理：板块构造入门。活动：教师借助图示讲解（15 分钟），学生标注横截面图（10 分钟），学生回答有关板块边界的教材问题（20 分钟）。目标：理解三种板块边界及其影响。”*
- **学科领域：** 学科名称。*例如：“地理”*
- **学生年级：** 年级组。*例如：“八年级”*

可选（如果可用，由上下文引擎注入）：
- **EAL 学生：**人数和熟练程度
- **学生概况：**第一语言、接受英语授课教育的时间、具体需求
- **课程时长：**课程长度
- **可用资源：**技术设备、双语资源、助教支持

## 提示词

```
You are an expert in sheltered instruction and content-language integrated teaching, with deep knowledge of the SIOP Model (Echevarría, Vogt & Short, 2008, 2017), Cummins' (2000) framework for academic language development, and Gibbons' (2015) approach to scaffolding in content classrooms. You understand that effective instruction for EAL students does not mean simplifying content — it means making challenging content accessible through clear language objectives, comprehensible input, structured interaction, and meaningful practice.

Your task is to modify this lesson plan using SIOP principles:

**Lesson plan:** {{lesson_plan}}
**Subject area:** {{subject_area}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**EAL students:** {{eal_students}} — if not provided, assume 4–6 EAL students at mixed proficiency levels (Early Acquisition to Consolidating) in a class of 25–30.
**Student profiles:** {{student_profiles}} — if not provided, assume mixed first languages with conversational fluency but varying academic language proficiency.
**Lesson duration:** {{lesson_duration}} — if not provided, assume a 60-minute lesson.
**Resources available:** {{resources_available}} — if not provided, assume standard classroom resources (whiteboard, projector, textbooks) but no bilingual TA or specialist technology.

Apply the SIOP Model's eight components:

1. **Lesson Preparation:**
   - Identify the content objective (what students will LEARN about the subject).
   - Add a language objective (what academic language students will USE to demonstrate their content learning). Language objectives should be specific: "Students will use causal connectives (because, therefore, as a result) to explain how plate boundaries cause earthquakes" — NOT vague: "Students will practise speaking."
   - Both objectives should be displayed and referred to throughout the lesson.

2. **Building Background:**
   - Identify the background knowledge the lesson assumes. What must students already know?
   - Design a brief activity (3–5 minutes) that activates or builds this background — especially for EAL students who may lack the cultural or contextual knowledge assumed by the content.
   - Explicitly link new content to what students already know.

3. **Comprehensible Input:**
   - Modify teacher talk: slow down (not simplify), use shorter sentences, repeat key terms, write key words on the board as you say them.
   - Add visual support: diagrams, images, gestures, demonstrations, graphic organisers.
   - Pre-teach key vocabulary (Tier 2 and 3 words essential for comprehension).

4. **Strategies:**
   - Add metacognitive scaffolds: What do students do when they don't understand? Teach them to ask: "What word don't I understand?" "Can I work out the meaning from context?" "Should I ask?"
   - Provide graphic organisers, sentence frames, or thinking scaffolds appropriate to the tasks.

5. **Interaction:**
   - Build in structured talk opportunities. EAL students need to USE language, not just hear it.
   - Replace individual silent tasks with partner or group tasks where possible.
   - Provide talk frames for discussion: "I think ___ because ___" / "I agree with ___ because ___" / "Can you explain what you mean by ___?"
   - Ensure sufficient wait time for EAL students to process and formulate responses.

6. **Practice/Application:**
   - Ensure the practice task requires students to USE the content knowledge AND the academic language.
   - Hands-on, visual, or collaborative tasks are more accessible than text-heavy tasks — but must still be cognitively demanding.
   - Provide language support (sentence frames, word banks) during practice tasks.

7. **Lesson Delivery:**
   - Check pacing: are transitions clear? Are instructions given step-by-step rather than all at once?
   - Vary activity types to maintain engagement and provide multiple access points.
   - Monitor comprehension continuously, not just at the end.

8. **Review/Assessment:**
   - Check comprehension of BOTH content and language objectives at the end of the lesson.
   - Use methods that don't depend solely on English proficiency: diagrams, matching tasks, mini-whiteboards, partner explanations.
   - Provide opportunity for self-assessment: "Can I explain [content] using [academic language]?"

Return your output in this exact format:

## Modified Lesson: [Topic]

**For:** [Student level] [Subject area]
**Duration:** [Minutes]

### Objectives (displayed on board)

**Content objective:** [What students will learn about the subject]
**Language objective:** [What academic language students will use — specific and observable]

### Modified Lesson Plan

[Complete lesson plan with SIOP modifications integrated — not as an appendix but built INTO the lesson flow. Each phase should show what the teacher does, what students do, and what SIOP modification has been applied.]

### SIOP Component Checklist

[How each of the 8 SIOP components is addressed in the modified lesson]

### Teacher Adaptations

[Specific changes to teacher talk, pacing, questioning, and interaction patterns — practical, concrete advice]

### What Changed and Why

[Summary of the key modifications, linked to the SIOP principles that justify them]

**Self-check before returning output:** Verify that (a) both content AND language objectives are explicit and specific, (b) the modifications are integrated into the lesson flow, not added as separate EAL activities, (c) comprehensible input strategies are applied to teacher talk, (d) structured interaction opportunities are built in, (e) practice tasks require use of academic language, (f) the content objective has NOT been reduced — cognitive demand is maintained, and (g) the modifications benefit all students, not just EAL students.
```

## 示例输出

**情境：** *课程计划：“八年级科学：消化系统简介。活动：(1) 教师使用展示消化系统器官的 PowerPoint 幻灯片进行讲解（15 分钟），(2) 学生凭记忆给消化系统示意图标注器官名称（10 分钟），(3) 学生阅读介绍各器官功能的教科书页面并回答问题（20 分钟），(4) 总结测验——教师提问，学生举手回答（5 分钟）。目标：学生应能够说出消化系统各器官的名称并描述它们的功能。” / 学科领域：“科学（生物学）” / 学生年级：“八年级” / EAL 学生：“5 名 EAL 学生——1 名英语初学者（索马里语），2 名英语初步习得者（波兰语、阿拉伯语），2 名英语发展阶段学习者（西班牙语、普通话）” / 课程时长：“50 分钟”*

---

## 修改后的课程：消化系统

**适用对象：** 八年级科学（生物学）  
**时长：** 50 分钟

### 目标（写在黑板上）

**内容目标：** 说出消化系统的主要器官，并描述每个器官的功能。

**语言目标：** 使用句式“The [organ] [verb]s the food by [process]”来描述每个器官的作用。（示例：“The stomach digests the food by mixing it with acid and enzymes.”）

*在课程开始时将两个目标都写在黑板上。课程结束时回到这两个目标：“现在你们能做到吗？”*

### 修改后的课程计划

**阶段 1：建立背景知识 + 可理解输入（12 分钟）**

*SIOP 修改：将 15 分钟的教师讲解替换为一个更短、更具互动性的输入阶段，以建立背景知识并使输入变得可理解。*

**0:00–3:00 —— 建立背景知识（SIOP 组成部分 2）**  
“在开始之前——每个人都知道吃东西时会发生什么。想一想你最后吃的东西。它发生了什么变化？它去了哪里？和你的同伴讨论 30 秒。”

听取 2–3 名学生的回答。学生说出关键词时，将它们写在黑板上：*嘴巴、咀嚼、吞咽、胃、厕所。*

“所以你们已经知道，食物会在身体里进行一段旅程。今天我们要学习这段旅程中每一站的科学名称，更重要的是——了解每一站会发生什么。”

*为什么有效：* 联系每个人都熟悉的经历（每个人都会吃东西）。用易于理解的语言激活已有知识。“旅程”一词提供了隐喻支架，使这一连续过程更容易理解。

**3:00–12:00 —— 可理解输入：教师讲解（SIOP 组成部分 3）**

展示 PowerPoint 幻灯片，但进行以下修改：
- 每张幻灯片只展示一个器官，而不是完整的示意图。一次介绍一个器官。
- 对于每个器官：展示图像，说出名称，将名称写在黑板上，让学生大声重复名称（齐声重复——为所有人规范发音）。
- 对于每个器官：先用一个简单句子描述其功能，然后使用语言目标中的句式将该句子写在黑板上。

**逐步建立的板书：**

| 器官 | 作用 | 关键句 |
|-------|-------------|--------------|
| 嘴巴 | 将食物分解成更小的部分 | 嘴巴通过咀嚼并与唾液混合来分解食物。 |
| 食道 | 将食物运送到胃 | 食道通过向下挤压食物来运送食物（蠕动）。 |
| 胃 | 对食物进行化学消化 | 胃通过将食物与胃酸和酶混合来消化食物。 |
| 小肠 | 将营养物质吸收到血液中 | 小肠通过让营养物质穿过肠壁进入血液来吸收营养物质。 |
| 大肠 | 吸收水分 | 大肠从剩余的食物中吸收水分。 |

*为什么这样有效：* 视觉 + 听觉 + 书面呈现。学生能够看到、听到并阅读每个术语。渐进式表格在整个课程中持续可见。句型框架得到持续示范，将语言目标融入内容讲解之中。

**针对英语初学者学生（索马里语）的调整：** 提供一份双语词汇表（英语–索马里语），列出关键器官名称和简单定义。如果有双语同伴或助教，允许其使用第一语言对概念进行简短解释。学生仍应尝试使用英语句型框架。

**阶段 2：结构化互动 + 练习（15 分钟）**

*SIOP 调整：将安静的个人标注任务替换为协作性、互动性任务，要求学生使用学术语言。*

**12:00–17:00 —— 两人合作标注（SIOP 组成部分 5 和 6）**  
给每对学生一张空白的人体轮廓图和剪下来的器官名称标签。

“和你的同伴一起，将器官标签放置在正确的位置。每放置一个标签，就说出关键句型：‘[器官] 通过[过程]对食物进行[动词]。’你必须大声说出来——不能只是默默地放置标签。”

*为什么这样有效：* 具有协作性（学生可以互相帮助）。具有动觉性（实际操作标签）。提供口语练习（句型框架用于口头表达，而不仅仅是书面表达）。黑板上的表格仍然可见，可作为参考——这是有支持的回忆，而不是无提示的记忆。

**17:00–27:00 —— 描述食物的旅程（SIOP 组成部分 4、5、6）**

*将教材阅读和理解问题替换为更具互动性、并提供更多语言支持的任务。*

给每位学生一张“食物的旅程”练习单，按顺序列出各个器官，并为每个器官提供一个句型框架：

“想象你是一块食物。描述你在消化系统中的旅程。针对每个器官，完成句子：”

1. 首先，我进入**口腔**。口腔通过___使我___。
2. 接着，我沿着**食道**向下移动。食道通过___使我___。
3. 然后，我到达**胃**。胃通过___使我___。
4. 之后，我进入**小肠**。小肠通过___从我这里___。
5. 最后，我通过**大肠**。大肠通过___从我这里___。

**英语初步习得阶段的学生：** 使用带有词汇库的填空版本：*分解、移动、消化、吸收营养、吸收水分、咀嚼、挤压、与酸混合、穿过肠壁、去除水分。*

**英语发展阶段的学生：** 使用上面的开放式句型框架。

**英语巩固阶段的学生和英语母语者：** 在没有句型框架的情况下写出这段旅程——使用自己的语言写成一段话，并融入关键术语。

**提前完成学生的拓展任务：**“如果某个器官停止工作，会发生什么？选择一个器官，并解释会出现什么问题。”

*为什么这样有效：* 内容相同（器官及其功能），认知要求相同（描述过程），通过不同程度的语言支架进行区分。每位学生都在练习语言目标。第一人称视角（“我进入口腔”）具有吸引力，也使抽象过程变得具体。

**第三阶段：复习与评估（8分钟）**

*SIOP调整：将举手进行的全班问答测验（这种方式只能评估反应最快或最自信的学生）替换为全班共同参与的评估方法。*

**27:00–32:00 —— 小白板测验（SIOP组成部分8）**

“在你们的白板上写出……”

1. “哪个器官吸收营养物质？”【学生写：小肠】
2. “胃对食物做了什么？”【学生写一个短语或句子】
3. “按顺序排列这些器官：胃、嘴、大肠、小肠、食道”【学生写出1–5】

*这样做的效果：*每一名学生都要作答（而不只是举手的学生）。教师可以同时快速查看所有白板。第2题检验学生是否能够运用语言目标（描述功能），而不仅仅是回忆器官名称。英语水平较低的学生仍然可以通过写出单词或绘制带标签的图示来展示自己的理解。

**32:00–35:00 —— 回顾目标（SIOP组成部分8）**

“看看我们的两个目标。内容目标：你们能说出这些器官的名称并描述它们的功能吗？我们来检查一下——每当我说出一个器官的名称时，请大家在图示上指出这个器官……”

“语言目标：你们能使用句型‘The [organ] [verb]s the food by [process]’吗？转向你的同伴，说一句关于某个器官的句子。开始。”

听一听学生是否正确使用句型框架。找出仍然需要支持的学生——他们下节课需要进行额外练习。

### SIOP组成部分检查表

| SIOP组成部分 | 实施方式 |
|---|---|
| **1. 课程准备** | 内容目标和语言目标都明确写在黑板上，并在课程结束时再次回顾 |
| **2. 背景知识构建** | 在引入科学词汇之前，用3分钟的热身活动联系每个人都熟悉的经历（吃东西） |
| **3. 可理解性输入** | 一次讲解一个器官，结合视觉、口头和书面信息，逐步完善黑板表格，进行齐声重复；为英语初学学生提供双语词汇表 |
| **4. 学习策略** | 句型框架为语言产出提供支架；逐步完善的表格作为参考工具；第一人称视角使抽象过程变得具体 |
| **5. 互动** | 要求学生结对标注并进行口头表达；全班讨论时进行两人交流；没有不包含口语环节的安静个人任务 |
| **6. 练习/应用** | “食物的旅程”任务要求学生结合内容目标使用语言目标；根据支架程度而不是内容进行差异化设计 |
| **7. 课程实施** | 将15分钟的讲授缩短为9分钟的互动式输入；活动形式多样；教师通过巡视进行持续监测 |
| **8. 复习/评估** | 使用小白板（面向全班，而不只是举手的学生）；明确回顾两个目标；通过同伴检查语言目标 |

### 教师调整

1. **放慢教师讲话速度，不要简化语言。**可以这样说：“食道通过向下挤压来推动食物——这种挤压叫作蠕动。”说话时放慢速度，并重复“挤压”和“蠕动”。不要说“食物沿着管道下去”。科学语言本身就是教学内容。

2. **边说边写。**每说到一个关键词，就把它写在黑板上。EAL学生可以阅读并反复查看那些他们无法通过再次听到来理解的内容。逐步完善的表格将成为本节课最重要的资源。

3. **齐声重复练习发音。**“跟我一起说：oesophagus。O-soph-a-gus。”这并不幼稚——它能让每个人都习惯科学术语的发音，也让 EAL 学生有机会练习说出不熟悉的单词。

4. **一次只给出一个步骤的指令。**不要说：“拿上你的练习单，和同伴一起完成句子，做完后举手”——而要说：“第 1 步：从前面的桌子上拿一张练习单。”[停顿。]“第 2 步：和你的同伴一起完成。”[停顿。]“第 3 步：参考黑板上的表格，完成这些句子。”

5. **等待时间。**提问后等待 5–7 秒（而不是通常的 1–2 秒）。EAL 学生需要时间进行处理，以便用英语组织回答。明确说“慢慢来”，可以传达出速度并不是目标。

6. **分别检查任务理解和内容理解。**在学生开始任何活动之前，询问：“你们要做什么？”（检查他们是否理解了任务）。不要问“你们明白了吗？”（得到的回答总是“明白了”）。可以问：“告诉我第一步是什么”——这样就能发现他们是否理解了指令。

### 发生了什么变化，以及为什么

| 原始做法 | 修改后的做法 | 原因 |
|----------|----------|-----|
| 15 分钟的教师讲解（一次展示所有幻灯片） | 9 分钟的互动式输入（一次讲解一个器官，结合视觉、口头和书面信息，并进行齐声重复） | SIOP 可理解输入：多模态、有节奏、循序渐进。在保留内容的同时降低认知负荷。 |
| 学生默默独立给图示标注 | 结对标注，并要求口头完成句子 | SIOP 互动：EAL 学生需要使用语言，而不仅仅是接收语言。同伴合作提供了低风险的口语练习机会。 |
| 阅读课本并回答问题 | “食物的旅程”句型框架任务，并根据支架程度进行区分 | SIOP 练习/应用：以阅读为主的任务可能将语言障碍伪装成内容评估。修改后的任务通过更易理解的形式评估相同的内容知识。 |
| 举手进行全班总结测验 | 使用小白板进行全班评估，并进行同伴检查 | SIOP 复习：举手回答只能评估反应最快或最自信的学生。白板可以同时评估所有学生。 |
| 没有语言目标 | 明确的语言目标：“The [organ] [verb]s by [process]” | SIOP 课程准备：没有语言目标时，语言发展只是偶然发生的；有了语言目标，语言发展才是有意识的。 |

---

## 已知局限

1. **SIOP 修改需要时间进行规划。**修改后的课程对所有学生都更有益，但比原始课程需要更多准备。随着教师逐渐熟悉 SIOP 原则，这些修改会变得更加自动化，但初期投入仍然很大。这项技能可以加快规划过程，但无法完全消除规划工作。

2. **这些修改以典型的课堂设置为前提。**配有专业 EAL 教师、双语助教或能够使用第一语言资源的学校，可以实施本修改未包含的额外支持。输出内容提供了一套可使用标准资源实施的基础修改方案；在条件允许的情况下，还应叠加额外的专业支持。

3. **保护性教学是一次一课时进行的，但语言发展是长期持续的。** 此技能会修改单个课时，但 EAL 学生需要在所有课时中获得持续、稳定的支持。某一课时的语言目标应与后续课时的语言目标相衔接，从而构建连贯的学术语言发展课程。单个课时的修改是必要的，但还不够充分——它必须成为全校教学方法的一部分。