---
# AGENT SKILLS STANDARD FIELDS (v2)
name: emergent-project-design-scaffold
description: "Scaffold an emergent project from observed children's interests using Reggio-inspired approaches. Use when following children's fascinations into deeper inquiry in early years or primary settings."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/emergent-project-design-scaffold"
skill_name: "Emergent Project Design Scaffold"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Rinaldi (2006) — In Dialogue with Reggio Emilia: listening, researching and learning"
  - "Malaguzzi (1993) — For an education based on relationships"
  - "Helm & Katz (2016) — Young Investigators: the project approach in the early years (3rd edition)"
  - "Wien (2008) — Emergent Curriculum in the Primary Classroom: interpreting the Reggio Emilia approach in schools"
  - "Edwards, Gandini & Forman (2012) — The Hundred Languages of Children (3rd edition)"
input_schema:
  required:
    - field: "children_interest"
      type: "string"
      description: "The emerging interest, question, or fascination observed in the children — what has captured their attention"
    - field: "teacher_observations"
      type: "string"
      description: "What the teacher has noticed — children's questions, theories, experiments, and representations related to the interest"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age group"
    - field: "curriculum_connections"
      type: "string"
      description: "Curriculum areas the interest naturally connects to"
    - field: "available_resources"
      type: "string"
      description: "Materials, spaces, and community resources that could support the investigation"
    - field: "project_duration"
      type: "string"
      description: "How long the project might run — a week, several weeks, a term"
    - field: "team_context"
      type: "string"
      description: "Whether the teacher is working alone or in a team"
output_schema:
  type: "object"
  fields:
    - field: "project_scaffold"
      type: "object"
      description: "The emergent project design — not a fixed plan but a flexible scaffold that responds to children's developing inquiry"
    - field: "provocations"
      type: "array"
      description: "Experiences, materials, and questions designed to deepen and extend children's inquiry"
    - field: "curriculum_mapping"
      type: "object"
      description: "How the emerging project connects to curriculum objectives — natural connections, not forced ones"
    - field: "documentation_plan"
      type: "object"
      description: "How to document the project's evolution — capturing children's learning journey"
    - field: "decision_points"
      type: "array"
      description: "Moments where the teacher will observe and decide: extend this direction, introduce a new provocation, or allow the project to wind down"
chains_well_with:
  - "reggio-documentation-protocol"
  - "awe-wonder-experience-designer"
  - "agency-scaffold-generator"
  - "place-based-inquiry-anchor"
teacher_time: "4 minutes"
tags: ["Reggio-Emilia", "emergent-curriculum", "project-approach", "Rinaldi", "Malaguzzi", "provocations", "early-years", "primary"]
---
# 涌现式项目设计框架

## 此技能的作用

为涌现式项目设计一个灵活的框架——这是一种由儿童的兴趣、问题和理论驱动的持续探究，遵循瑞吉欧·艾米利亚课程理念。不同于预先确定的项目（教师会提前规划主题、活动和成果），涌现式项目始于儿童真实的兴趣，并通过观察、启发、记录和回应的循环不断发展。教师的角色不是规划整个过程，而是为其**搭建支架**——提供能够深化和拓展儿童探究的材料、启发和环境，同时将探究与课程目标联系起来。Rinaldi 提出的关键原则是：教师是与儿童并肩的研究者，真正对探究将走向何方感到好奇。输出内容包括项目框架（不是固定计划，而是包含决策节点的灵活框架）、旨在深化探究的启发、课程联系、记录计划，以及教师进行观察和回应时需要关注的决策节点。AI 在此尤其有价值，因为要设计出真正回应儿童当前思维的启发，需要同时理解儿童想法的发展轨迹，以及能够推动思维向前发展的各种材料、体验和问题。

## 证据基础

Rinaldi（2006）将涌现式课程描述为“一种协商式学习的过程”——课程产生于儿童的兴趣、教师的知识和环境三者的交汇之处。教师并不是放弃规划，而是以**不同的方式**进行规划：教师不再提前规划活动，而是规划能够回应儿童当前探究内容的启发（材料、体验和问题）。Malaguzzi（1993）将环境阐述为“第三位教师”——与成人教师和儿童同伴一样，物理环境能够启发、支持并记录学习。涌现式项目需要经过深思熟虑的环境设计：能够邀请儿童进行探究的材料、支持合作的空间，以及记录并延续项目发展的展示。Helm 和 Katz（2016）为早期教育和小学阶段的“项目方法”提供了实践指导，描述了三个阶段：第一阶段（项目开始——确定兴趣、分享初步知识、形成问题），第二阶段（项目发展——开展探究、进行表征、回顾再探），以及第三阶段（项目结束——分享、反思、庆祝）。Wien（2008）将瑞吉欧理念应用于小学课堂，说明涌现式课程并不局限于幼儿教育，只要教师愿意追随儿童的问题，它可以在任何阶段加以实践。Edwards、Gandini 和 Forman（2012）记录了瑞吉欧教育者如何规划“progettazione”——不是教案，而是对环境、启发和可能促成探究的相遇进行有意设计，同时结合细致的记录，为下一步行动提供依据。

## 输入模式

教师必须提供：
- **儿童的兴趣：** 什么吸引了他们的注意力。*例如：“孩子们在学校花园里发现了一个鸟巢，并对它是如何搭建起来的感到着迷——他们不断回去观察、画它，还询问筑巢的鸟儿” / “一年级的孩子们在发现一张学校场地的旧地图后，都迷上了地图——他们想为所有事物绘制自己的地图” / “几个孩子深度投入于搭建活动——建造越来越复杂的结构，并测试这些结构是否能够站稳”*
- **教师观察：** 教师注意到的情况。*例如：“三个孩子花了20分钟观察鸟巢，指出其中编织的不同材料。一个孩子说‘这只鸟就像建筑工人一样。’另一个孩子问‘鸟是怎么把这么多树枝运过来的？’我注意到孩子们在户外活动时收集树枝和树叶，并尝试把它们编织在一起。” / “孩子们正在绘制自己卧室、操场以及上学路线的地图。他们争论地图是否‘正确’——‘不对，秋千不在那里，是在那边！’——这表明他们正在努力理解表征与视角。”*

可选（如果有的话，由上下文引擎注入）：
- **学生水平：** 年龄组
- **课程联系：** 相关课程领域
- **可用资源：** 材料、空间、社区资源
- **项目时长：** 预计持续时间
- **团队背景：** 独立开展还是团队开展

## 提示词

```
You are an expert in emergent curriculum and project-based investigation in the Reggio Emilia tradition, with deep knowledge of Rinaldi's (2006) concept of negotiated learning, Malaguzzi's (1993) hundred languages and environment as third teacher, Helm & Katz's (2016) project approach phases, Wien's (2008) emergent curriculum in primary settings, and Edwards, Gandini & Forman's (2012) account of Reggio progettazione. You understand that emergent projects are NEITHER unplanned ("let the children do whatever they want") NOR predetermined ("I've planned a bird project for this half-term"). They are intentionally scaffolded — the teacher observes, documents, interprets, and then designs provocations that deepen the children's inquiry in directions that are both child-led and educationally rich.

CRITICAL PRINCIPLES:
- **Start from the child's question, not the teacher's topic.** The interest is the children's — not a theme the teacher has chosen. The teacher's role is to recognise the interest, take it seriously, and provide opportunities for it to develop. If the teacher redirects the interest to fit a pre-planned topic, it ceases to be emergent.
- **Provocations, not lessons.** The teacher does not teach about birds — they provide a magnifying glass, books about nest construction, materials for building, and the question: "Could YOU build a nest that's as strong as the bird's?" A provocation invites investigation; a lesson delivers content. Provocations open possibilities; lessons close them.
- **The project is a conversation, not a delivery.** The project develops through a cycle: children investigate → teacher documents → teacher interprets → teacher designs provocation → children investigate further. Each step responds to the previous one. If the teacher plans all the provocations in advance, they are not responding — they are delivering.
- **Curriculum connections are found, not forced.** An emergent project on nest-building naturally connects to science (materials, habitats), technology (construction, engineering), literacy (stories about birds, information texts, children's own writing), mathematics (measurement, shape), and art (observation drawing, sculpture). These connections should be identified and used — but the investigation should not be distorted to "cover" a curriculum objective that doesn't fit.
- **Projects have a natural lifespan.** Not all interests sustain a long project. Some last a week and wind down; others last a term and keep deepening. The teacher should be attentive to the project's energy — extending it when children are engaged and allowing it to conclude gracefully when interest wanes.

Your task is to design an emergent project scaffold for:

**Children's interest:** {{children_interest}}
**Teacher observations:** {{teacher_observations}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for early years or Key Stage 1.
**Curriculum connections:** {{curriculum_connections}} — if not provided, identify natural connections.
**Available resources:** {{available_resources}} — if not provided, suggest accessible resources.
**Project duration:** {{project_duration}} — if not provided, design with decision points that allow the project to last 1–4 weeks depending on children's engagement.
**Team context:** {{team_context}} — if not provided, design for a solo practitioner.

Return your output in this exact format:

## Emergent Project: [Interest]

**Children's interest:** [What has captured their attention]
**Teacher's guiding question:** [What the teacher is curious about — what they want to understand about children's thinking through this project]
**Potential duration:** [Flexible estimate]

### Phase 1 — Launching the Investigation

[How to begin — sharing what children already know, surfacing their questions, creating the conditions for investigation]

### Phase 2 — Provocations and Investigations

For each provocation (3–5):
**Provocation [N]: [What the teacher offers]**
- **What:** [The material, experience, or question]
- **Why:** [What this provocation might reveal or develop — connected to the teacher's observations]
- **Watch for:** [What to observe — children's responses, theories, new questions]
- **If children respond by...:** [Possible next steps depending on children's response]

### Phase 3 — Deepening and Representing

[How children represent their understanding through multiple "languages" — drawing, building, writing, dramatic play, discussion]

### Phase 4 — Sharing and Concluding

[How the project is shared and celebrated — with the class, with families, with the school]

### Curriculum Connections

[Natural connections to curriculum areas — what children are learning through the project]

### Decision Points

[Specific moments where the teacher pauses, documents, and decides: continue this direction, introduce a new provocation, or allow the project to wind down]

### Documentation Plan

[How to document the project's journey — what to capture and how to use it]

**Self-check before returning output:** Verify that (a) the project begins from children's genuine interest, (b) provocations respond to observed thinking, (c) the scaffold is flexible with decision points, (d) curriculum connections are natural, and (e) the project has a plan for concluding, not just beginning.
```

## 示例输出

**情境：** *儿童的兴趣：“接待班儿童（4–5岁）在一场暴风雨过后，一只鸟巢从树上掉下来，他们在校园花园里发现了它。他们对鸟巢的搭建方式非常着迷——观察其中的材料（小树枝、苔藓、羽毛、细绳、一小片塑料袋），询问搭建鸟巢的鸟，并在户外游戏时尝试搭建自己的鸟巢。” / 教师观察：“三个孩子用放大镜观察鸟巢达20分钟。其中一个孩子说‘这只鸟就像建筑工人——她造了一座房子！’另一个孩子问‘鸟没有手，是怎么搬动这么多树枝的？’第三个孩子指着那片塑料袋说‘这只鸟去购物了！’几个孩子一直在花园里收集树枝、树叶和细绳，并尝试把它们编织成鸟巢。这些尝试总是散架，这让一些孩子感到沮丧，也促使另一些孩子尝试不同的方法。” / 可用资源：“校园花园、户外区域、美术材料、黏土、放大镜、用于拍照的 iPad、可在护林员带领下前往当地自然保护区”*

---

## 生成式项目：筑巢小能手

**儿童的兴趣：** 鸟类如何搭建鸟巢——材料、方法，以及不用手也能搭建鸟巢的非凡技能  
**教师的指导性问题：** “孩子们理解结构是如何搭建的吗？当他们尝试亲自搭建结构时，这种理解将如何发展？”  
**预计时长：** 2–4周，具体取决于兴趣是否持续

### 阶段1——启动探究

**第1天——收集我们已知的信息：**  
将鸟巢（小心地）带进教室。把它放在桌子上，旁边放好放大镜，邀请孩子们进行观察。在小组谈话中询问：“你们注意到了什么？”将孩子们的观察记录在一张大纸上（教师书写；孩子们表达）。

然后问：“关于这个鸟巢，你们有什么问题？”记录下这些问题。根据目前的观察，可能出现的问题包括：
- 鸟是怎么搭建鸟巢的？
- 鸟巢是用什么做的？
- 鸟是怎么搬运树枝的？
- 鸟在哪里找到细绳的？
- 它为什么使用塑料？
- 鸟巢掉下来，鸟会难过吗？

将观察和问题展示在墙上。这些就是探究的起点——孩子们的问题推动着项目的发展。

**第2天——我们已经知道什么？我们想要了解什么？**  
制作一个简单的记录展板：将“我们对鸟巢的了解”（孩子们目前的知识）与“我们想要了解什么”（他们的问题）并列展示。这样可以让探究过程清晰可见，也为孩子们在整个项目中不断回顾提供一个参照点。

### 阶段2——引发探究与开展调查

**引发活动1：鸟巢材料调查**
- **内容：** 小心地拆解鸟巢的一部分（如果有条件，也可以使用第二个鸟巢），将各种材料分别摆放出来：小树枝、苔藓、羽毛、细绳、塑料。提供放大镜和绘画材料。询问：“鸟巢是用什么做的？你们觉得鸟为什么选择这些材料？”
- **原因：** 教师观察到孩子们对材料感兴趣，但还没有进一步思考鸟为什么选择这些材料。这个引发活动将注意力集中到材料的性质上——强度、柔韧性、保暖性和防水性。
- **观察重点：** 孩子们会根据材料的性质来描述它们（“这个可以弯曲”“这个很柔软”），还是只说出它们的名称（“这是树枝”）？基于性质的描述表明孩子们对材料科学的理解正在萌芽。
- **如果孩子们开始观察材料的性质：** 可以进一步提出分类挑战——“你们能把这些材料分成几组吗？你们分类的规则是什么？”
- **如果孩子们关注材料来自哪里：** 可以进一步开展花园调查——“你们能在我们的花园里找到这些材料吗？”

**引发活动 2：筑巢挑战**
- **内容：** 在户外设置一个“筑巢工作坊”。提供自然材料（树枝、草、树叶、泥土、羽毛），并提出挑战：“你们能不能搭建一个可以托住鸡蛋的鸟巢？”使用一个小木蛋或小球作为测试物。两人一组或分成小组进行。
- **原因：** 孩子们之前尝试搭建的结构总是不断散架。这个引发活动为他们提供了专注的时间、明确的材料，以及一个测试标准（能不能托住鸡蛋？）。结构失败带来的挫折是有价值的，它会推动孩子们解决问题并修正自己的理论。
- **观察重点：** 孩子们如何处理这个问题——他们是随机开始，还是先制定计划？他们会模仿真实鸟巢的结构吗？鸟巢失败后，他们会再次尝试相同的方法，还是改变策略？留意他们使用的工程术语：“我们需要把它做得更紧一些。”“它需要一圈一圈地绕。”
- **如果孩子们成功了：** 问：“是什么让你们的鸟巢成功了？鸟儿做了什么，而你们也做到了？”
  这会把他们的经验与鸟巢联系起来。
- **如果孩子们遇到困难：** 引入一个新的引发活动——播放一段鸟儿筑巢的视频片段（BBC 自然纪录片素材）。慢速观看。“鸟儿在做什么？它是怎样使用喙的？它遵循着什么样的模式？”

**引发活动 3：绘制鸟巢（细致观察）**
- **内容：** 提供精细的绘图铅笔，把鸟巢放在小组中央。询问：“你们能不能把鸟巢按照你们看到的样子一模一样地画下来——每一根树枝、每一片苔藓都画出来？”这是观察性绘画，而不是创造性表达。
- **原因：** 绘画要求细致观察。绘制鸟巢的孩子会注意到一些他们只是观察时遗漏的结构特征——树枝相互交错的方式、不同材料的层叠方式，以及圆形的形状。绘画是一种探究形式。
- **观察重点：** 画中出现了哪些结构特征？孩子们画的是一根根独立的树枝，还是一个大致的形状？他们注意到了编织或相互交错的模式吗？绘画呈现出孩子们正在**看见**什么，而这反映了他们对结构的理解。
- **如果孩子们注意到了相互交错的模式：** 这是一个关键的结构性洞察。进一步延伸：提供编织材料（布条、扭扭棒）和编织框。“你们能不能像鸟儿那样，让材料相互交错？”

**引发活动 4：与专家交流**
- **内容：** 安排自然保护区管理员来访（或组织参观自然保护区）。让孩子们提前准备问题。管理员展示不同类型的鸟巢，解释鸟儿如何筑巢，并在可能的情况下，带孩子们观察花园或保护区里的鸟儿。
- **原因：** 孩子们已经亲自调查过鸟巢，并形成了自己的理论。与专家见面可以提供新的信息，让他们将这些信息与自己的理论进行比较。专家应该回答孩子们的问题，而不是进行讲座——孩子们的探究应当推动这次交流。
- **观察重点：** 孩子们如何将专家提供的信息与自己的理论协调起来。他们会更新自己的想法吗？他们会质疑专家吗？（“可是我们试过那样做，没成功！”）这两种回应都很有价值——它们说明孩子们正在真正投入探究。
- **如果这次交流引发了新的问题：** 这些问题就会成为下一阶段调查的起点。“管理员说鸟儿用泥土当胶水——我们能不能也用泥土当胶水？”

### 阶段 3——深化与表达

儿童通过多种语言表达他们的学习：

**绘画：** 对鸟巢进行观察性绘画，描绘鸟儿筑巢的画作，以及为筑巢绘制的图解“说明书”（一种程序性写作）

**建构：** 使用日益丰富多样的材料筑巢。有些儿童可能会从天然材料转向尝试其他材料——“如果我们不用泥，而是用橡皮泥，会怎么样？”这是一种工程探究。

**戏剧游戏：** 在角色扮演区创设一个“鸟类建筑工地”——安全帽、写字板、“建筑计划”（儿童的绘画）以及筑巢材料。儿童通过表演建造过程，展现他们对顺序和方法的理解。

**语言与读写：** 口述故事（《筑巢的鸟》）、鸟巢展示的标签、全班共同制作的《我们对鸟巢的认识》图书、写给鸟儿的信（“亲爱的鸟儿，我们找到了你的鸟巢，我们会好好照看它”）

**数学：** 测量鸟巢中使用的树枝（“最长的树枝是 ___ 厘米”）、清点材料、比较鸟巢的大小（如果有多个鸟巢可供观察）、观察编织中的图案

### 阶段 4——分享与总结

**鸟巢展览：** 在学校入口或教室中展示项目记录——儿童探究时的照片、他们的原话、绘画作品，以及他们制作的鸟巢和真实鸟巢。呈现探究历程：“起初我们认为……后来我们发现……现在我们理解……”

**邀请家庭参与：** 邀请家人参观展览。儿童向家人讲解自己的项目——这是最有力的评价方式：儿童能否向一个不在现场的人解释自己学到了什么？

**归还鸟巢：** 如果合适，将鸟巢归还到花园中——或者制作一个永久展示。与儿童讨论：“鸟儿可能会筑一个新巢。我们应该帮忙吗？要怎样帮忙？”

**自然结束：** 当儿童的兴趣转向新的关注点时，项目就结束了。这可能需要 2 周，也可能需要 4 周。教师要识别项目逐渐收尾的迹象（选择鸟巢活动的儿童减少了，精力转向了其他方面），并通过展览帮助全班标志着项目的结束。

### 课程关联

| 课程领域 | 儿童通过项目学到的内容 |
|---|---|
| 科学（生物与栖息地） | 鸟类栖息地、鸟巢建造、材料特性、观察技能 |
| 设计与技术 | 建造结构、测试、迭代、根据用途选择材料 |
| 数学 | 测量、计数、图案、形状（圆形鸟巢、相互嵌套的图案） |
| 读写 | 词汇发展、程序性写作（如何筑巢）、讲故事、标注、信息类文本 |
| 艺术 | 观察性绘画、雕塑（将筑巢作为艺术创作）、关注细节 |
| PSHE | 尊重自然、团队合作、建造失败时坚持不懈、照料生物 |

### 决策点

| 时间 | 观察内容 | 决策 |
|---|---|---|
| 第 1 周结束时 | 儿童是否仍在选择与鸟巢相关的活动？是否出现了新的问题？ | 如果是：引入引发活动 3 或 4。如果兴趣正在减弱：开始逐步收尾。 |
| 建造挑战之后 | 这项挑战是否产生了新的问题或挫败感？ | 如果产生了新问题：跟随这些问题继续探究。如果只有挫败感而没有好奇心：提供更多支持，或采用不同的切入点。 |
| 专家交流之后 | 新信息是否激发了新的探究？ | 如果是：延伸项目。如果这次交流“回答了所有问题”：项目可能已经准备好结束。 |
| 当新的兴趣出现时 | 儿童的问题是否转向了新的主题？ | 允许自然过渡。随着新的兴趣占据主导，鸟巢项目可以自然结束。 |

### 文档记录计划

Throughout using the Reggio Documentation Protocol:
- **每日：** 2–3 张照片 + 2–3 条逐字引述（记录在笔记本中，并于当天结束时补充完整）
- **每周：** 选取最具揭示性的证据。制作一个小型展示板：“本周我们发现了……”张贴在儿童视线高度，供他们回顾。
- **持续进行：** 收集儿童的绘画和建构作品（如果是 3D 作品则拍照）。根据儿童的解释添加注释。
- **项目结束时：** 汇编成项目书或数字作品集。这将成为班级“集体记忆”的一部分，也是专业反思的资源。

---

## 已知局限

1. **生成性课程要求教师能够适应不确定性。** 没有预先确定的终点，也无法保证“覆盖”课程目标，更无法提前知道项目将走向何方。习惯于详细规划的教师可能会对此感到不适。上述支架提供了结构——但在这一结构之内，教师必须愿意跟随儿童的引领。

2. **问责体系可能与生成性方法相冲突。** 要求提前提交详细中期计划的学校，很难轻松容纳生成性课程。上文确定的课程关联表明，生成性项目确实能够实现课程目标——但不是按照可预测、可规划的顺序实现。教师可能需要在学校的规划要求中争取灵活性。

3. **并非所有兴趣都能支撑一个项目。** 有些儿童的着迷只是暂时的——一天之内非常强烈，之后便消失。教师的能力在于区分短暂的着迷与能够支撑探究的持续性兴趣。上文的决策点可以提供帮助——如果兴趣在第 1 周之后减退，那么项目就应当结束，而不是人为地延长。