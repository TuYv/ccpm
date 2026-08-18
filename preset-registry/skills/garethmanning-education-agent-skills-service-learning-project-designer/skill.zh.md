---
# AGENT SKILLS STANDARD FIELDS (v2)
name: service-learning-project-designer
description: "Design a service-learning project connecting genuine community need with embedded curriculum learning. Use when planning community projects, civic engagement, or social action units."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/service-learning-project-designer"
skill_name: "Service Learning Project Designer"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Billig (2000) — Research on K-12 school-based service learning: the evidence builds"
  - "Billig (2004) — Heads, hearts, and hands: the research on K-12 service learning"
  - "RMC Research Corporation (2007) — Impacts of Service Learning on Participating K-12 Students"
  - "Furco (2002) — Is service learning really better than community service?"
  - "Celio, Durlak & Dymnicki (2011) — A meta-analysis of the impact of service learning on students"
input_schema:
  required:
    - field: "community_need"
      type: "string"
      description: "The genuine community need or problem the project addresses — identified with or by the community, not assumed by the school"
    - field: "curriculum_connection"
      type: "string"
      description: "The specific curriculum content that connects to the service — what academic learning is embedded in the project"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "community_partner"
      type: "string"
      description: "The community organisation, group, or individuals the school is working with"
    - field: "project_duration"
      type: "string"
      description: "How long the project runs — a day, a week, a term, ongoing"
    - field: "school_context"
      type: "string"
      description: "Whether the school has a service learning tradition or this is new"
    - field: "student_voice"
      type: "string"
      description: "Whether students have a role in choosing the project or it's been decided"
output_schema:
  type: "object"
  fields:
    - field: "project_design"
      type: "object"
      description: "The complete service learning project — community need, curriculum connection, service activities, reflection structure, assessment"
    - field: "community_partnership"
      type: "object"
      description: "How the school and community partner collaborate — genuine partnership, not charity"
    - field: "curriculum_integration"
      type: "object"
      description: "How the academic learning is embedded in the service — what students learn THROUGH serving, not separately from it"
    - field: "reflection_structure"
      type: "object"
      description: "How students reflect on the experience — before, during, and after the service"
    - field: "assessment_plan"
      type: "object"
      description: "How to assess both the academic learning and the civic development"
chains_well_with:
  - "experiential-learning-cycle-designer"
  - "interdisciplinary-real-world-connection-mapper"
  - "ubuntu-collective-knowledge-task-designer"
  - "agency-scaffold-generator"
teacher_time: "4 minutes"
tags: ["service-learning", "Billig", "community", "civic-engagement", "experiential", "reflection", "social-responsibility"]
---
# 服务学习项目设计师

## 此技能的作用

设计一个将真正的社区服务与结构化学术学习相结合的服务学习项目，确保学生既能为社区作出有意义的贡献，又能在这一过程中学习课程内容。根据 Furco（2002）的观点，关键区别在于：服务学习**不是**社区服务（没有学术学习的服务）、**不是**志愿服务（没有结构化反思的服务），也**不是**实地考察（没有服务的体验）。服务学习整合了三个要素：真正的社区受益、与课程相连接的学术学习，以及连接前两者的结构化反思。该方法借鉴了 Billig（2000, 2004）的研究，该研究表明，当服务通过明确的反思与课程目标直接相连时，才能产生最显著的学业效果；如果服务与学术活动彼此平行、缺乏联系，则不会产生同样的效果。输出内容包括完整的项目设计、社区合作框架、课程整合计划、反思结构（服务前、服务中和服务后），以及评估计划。AI 在此特别有价值，因为设计有效的服务学习项目需要同时应对社区需求、课程要求、后勤限制，以及将服务体验转化为学术学习的结构化反思。这是一项复杂的设计挑战，其中任何一个要素的缺失都会削弱整体效果。

## 证据基础

Billig（2000）回顾了 K-12 服务学习研究，发现服务学习对学业成就、公民责任以及个人与社会发展具有中等程度的积极影响。关键在于，她发现这些影响取决于若干质量指标：服务必须回应真正的社区需求（而不是人为制造的需求）；服务必须通过明确的教学与课程内容建立联系；学生必须在服务前、服务中和服务后进行结构化反思。缺少这些质量指标的服务虽然能为社区带来益处，但产生的学习效果很小。Billig（2004）进一步阐述了其中的作用机制：服务学习通过为学术内容提供真实情境发挥作用（学生能够看到相关内容为什么重要），培养公民身份认同（学生将自己视为社区贡献者），并发展社会情感技能（同理心、协作能力和责任感）。Furco（2002）进行了关键区分：社区服务关注**服务**（社区是主要受益者），实地教育关注**学习**（学生是主要受益者），而服务学习将两者结合起来（学生和社区都同等受益）。如果服务占据主导地位，而学习只是事后补充，那么它就是社区服务。如果学习占据主导地位，而服务只是借口，那么它就是实地教育。真正的服务学习应当保持两者之间的平衡。RMC Research Corporation（2007）总结了相关证据，发现高质量的服务学习项目（具有结构化反思、课程联系和真正的社区合作）能够促进学业投入、公民责任和社会技能；但低质量项目（一次性的服务日、没有反思、没有课程联系）则不会产生可测量的效果。Celio、Durlak 和 Dymnicki（2011）对 62 项研究进行了元分析，发现学业结果的平均效应量为 d=0.27，这一效果幅度不大但呈积极趋势；值得注意的是，包含结构化反思的项目效果更高。

## 输入架构

教师必须提供：
- **社区需求：** 社区需要什么。*例如：“当地食物银行正面临捐赠不足的问题——我们所在地区的许多家庭正遭受食物贫困” / “我们学校附近护理院的老年居民感到孤独——许多人没有访客” / “当地公园到处都是垃圾，且杂草丛生——社区希望恢复公园环境” / “隔壁小学的低年级学生阅读能力较弱——他们需要更多阅读伙伴”*
- **课程关联：** 学生将学习什么。*例如：“说服性写作与活动设计——九年级英语” / “数据处理与分析——八年级数学” / “生态系统与生物多样性——七年级科学” / “阅读理解与流利度——五年级英语”*

可选（如有，​​由上下文引擎注入）：
- **学生水平：** 年级
- **社区合作伙伴：** 相关组织或团体
- **项目时长：** 持续时间
- **学校背景：** 服务学习传统
- **学生声音：** 学生拥有多大程度的选择权

## 提示词

```
You are an expert in service learning design, with deep knowledge of Billig's (2000, 2004) research on K-12 service learning, Furco's (2002) distinction between service learning, community service, and field education, the RMC Research Corporation's (2007) quality indicators for effective service learning, and Celio, Durlak & Dymnicki's (2011) meta-analysis. You understand that service learning is NOT "doing something nice for the community and learning about it afterwards" — it is a carefully designed pedagogy where service and learning are INTEGRATED through structured reflection, each strengthening the other.

CRITICAL PRINCIPLES:
- **The community need must be GENUINE and identified WITH the community, not FOR them.** The school should not decide what the community needs and then offer it. Genuine partnership means asking: "What does your organisation need? How can our students help in a way that actually serves you?" If the service is designed primarily to benefit the students' learning and the community benefit is an afterthought, it's not service learning — it's field education wearing a charitable mask.
- **The curriculum connection must be DIRECT, not incidental.** "Students learn about food poverty" is incidental to helping at a food bank. "Students analyse food bank data to identify patterns in demand, use statistical methods to predict future need, and present findings to the food bank to improve their planning" is a direct curriculum connection — the academic work IS the service, and the service IS the academic work.
- **Reflection is the mechanism that connects service and learning.** Without reflection, service produces experience but not learning. Billig's research is clear: structured reflection — before service (what do we know? what do we expect?), during service (what are we noticing? what questions arise?), and after service (what did we learn? what changed?) — is what transforms service into education.
- **Reciprocity, not charity.** Service learning should position students and community members as PARTNERS, not as helpers and helped. The community contributes knowledge and expertise; the students contribute time and skills. Both benefit. A project where students feel sorry for the community and "help" them reinforces power imbalances. A project where students and community members work together on a shared problem develops civic partnership.
- **Quality over quantity.** A well-designed, deeply connected service learning project that lasts one week produces more learning than a superficial "service day" repeated monthly. Depth of service, depth of reflection, and depth of curriculum connection matter more than hours of service.

Your task is to design a service learning project for:

**Community need:** {{community_need}}
**Curriculum connection:** {{curriculum_connection}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the curriculum connection.
**Community partner:** {{community_partner}} — if not provided, suggest appropriate community partners.
**Project duration:** {{project_duration}} — if not provided, design for a 2–3 week project.
**School context:** {{school_context}} — if not provided, design as a standalone project.
**Student voice:** {{student_voice}} — if not provided, build in student choice where possible.

Return your output in this exact format:

## Service Learning Project: [Community Need] × [Curriculum Connection]

**Community need:** [The genuine need being addressed]
**Curriculum connection:** [The academic learning embedded in the service]
**Reciprocity statement:** [How both the community and students benefit — balanced, not charitable]

### Community Partnership

**Partner:** [The community organisation or group]
**Their need:** [What they actually need, in their terms]
**Their contribution:** [What they bring to the partnership — knowledge, expertise, access, perspective]
**Student contribution:** [What students bring — time, skills, energy, fresh perspective]
**Partnership principles:** [How the relationship is structured — respectful, reciprocal, genuine]

### Curriculum Integration

**Academic objectives:** [What students learn through the service — specific curriculum content and skills]
**How service IS learning:** [The mechanism — how the academic work is embedded in the service activity itself, not separate from it]
**How learning IS service:** [The mechanism — how the academic work produces something the community actually needs]

### Project Design

**Phase 1 — Investigation and preparation**
[How students learn about the community need, connect with the community partner, and prepare for service]

**Phase 2 — Service and learning**
[What students do — the integrated service-learning activities]

**Phase 3 — Reflection and sharing**
[How students reflect on the experience and share what they've learned — with the community and with the school]

### Reflection Structure

**Before service:** [What students reflect on before they begin — preconceptions, expectations, questions]
**During service:** [How students reflect while serving — journals, discussions, observations]
**After service:** [How students reflect after completing the service — what changed, what they learned, what questions remain]

### Assessment Plan

**Academic assessment:** [How curriculum learning is assessed — using evidence from the service]
**Civic development assessment:** [How civic skills and dispositions are assessed — not graded but documented]
**Community feedback:** [How the community partner assesses the service — did it genuinely help?]

**Self-check before returning output:** Verify that (a) the community need is genuine, (b) the curriculum connection is direct, (c) reflection is structured before, during, and after, (d) the relationship is reciprocal, and (e) both the community and students benefit meaningfully.
```

## 示例输出

**情境：** *社区需求：“当地食品银行正面临困难——过去一年需求增加了 40%，但他们缺乏预测需求模式、有效管理库存或向资助方传达工作成效所需的数据基础设施。他们需要有人帮助分析配送数据，并制作能够传达其工作成效的材料。” / 课程关联：“九年级数学——数据处理、统计分析、百分比、图形表示、真实数据集的解读” / 社区合作伙伴：“当地食品银行——一家由志愿者运营的慈善机构，每周向大约 200 个家庭发放食品包。负责人愿意分享经过匿名化处理的配送数据，也欢迎他人协助开展数据分析和影响力报告。” / 项目时长：“3 周”*

---

## 服务学习项目：食品银行数据 × 九年级数学

**社区需求：** 当地食品银行需要数据分析能力——他们收集了配送数据，却无法对其进行分析来预测需求、管理库存或向资助方传达工作成效  
**课程关联：** 九年级数学——统计分析、百分比、图形表示，以及对真实数据集的解读  
**互惠声明：** 食品银行提供真实数据、对食物贫困问题的专业知识，以及让数学变得有意义的真实情境。学生贡献分析技能、时间和全新的视角。食品银行将获得一份影响力报告和一个数据仪表板。学生则通过具有真实目的的学习，提升数学能力。

### 社区合作

**合作伙伴：** 当地食品银行  
**他们的需求（用他们自己的话说）：** “我们知道需求在增加，但我们无法向资助方准确说明增加了多少，也无法预测哪些具体物品会在什么时候用完。我们通过纸质表格收集数据，但没有人有时间进行分析。如果我们能够向市议会和资助方清晰展示我们的工作成效，就更有可能获得资金支持。”  
**他们的贡献：** 经过匿名化处理的配送数据（向谁提供了什么、何时提供）、对当地食物贫困状况的专业知识、让项目具有意义的真实情境、参观食品银行的机会，以及向学生介绍其工作的意愿。  
**学生的贡献：** 数学分析技能（数据清理、统计分析、图形表示）、时间（为期 3 周的专门数学课），以及制作一份食品银行能够实际使用的影响力报告和数据仪表板。  
**合作原则：** 食品银行是客户，而不是等待施舍的慈善对象。学生是在回应真实需求、提供专业服务（数据分析）。食品银行负责人会在所有成果对外使用之前进行审阅和批准。学生不得在食品银行内拍照，也不得识别服务对象。

### 课程整合

**学业目标：** 收集、整理和分析真实数据。计算百分比和百分比变化。根据真实数据创建适当的图形表示（条形图、折线图、饼图）。解读统计模式，并清晰地传达研究结果。九年级数据处理课程的所有目标，都通过食品银行数据得到落实。

**服务如何就是学习：** 学术学习本身就是服务。学生不是“学习数学，同时帮助食品银行”，而是通过帮助食品银行来学习数学。数据分析本身就是有用的服务。每一个计算出的百分比、绘制的每一张图表、识别出的每一个模式，都在满足食品银行对影响数据的需求。数学课与服务之间不存在分隔。

**学习如何就是服务：** 数学成果（影响报告、数据仪表板、需求预测）对食品银行确实有用。管理人员会在资金申请中使用影响报告。需求预测将帮助他们订购库存。数据可视化图表将展示在食品银行中，让志愿者和捐赠者看到他们工作的影响。

### 项目设计

**阶段 1——调查与准备（第 1 周）**

*第 1 课：了解需求。*
食品银行管理人员到学校访问（或发送视频留言）。他们会说明：食品银行的工作内容、使用者、需求如何变化，以及他们需要学生完成什么。学生提出问题。管理人员分享经过匿名化处理的数据集（纸质表格或电子表格）。

关键时刻：学生看到原始数据，并意识到它杂乱、不完整且真实——完全不像课本中的数据集。这就是数学挑战：如何理解不完美的现实世界数据？

*第 2 课：熟悉数据。*
学生分组检查数据集。数据集中包含什么？缺少什么？数据是如何组织的？学生清理数据：找出缺失项、对物品进行分类、创建可用的电子表格。这是真实的数据处理——专业人士会进行的那类数据工作，而课本练习从来不会涉及。

*第 3 课：规划分析。*
每个小组负责一个分析问题：
- A 组：“过去 12 个月中，需求发生了怎样的变化？”（百分比变化、折线图）
- B 组：“哪些类型的食物需求量最大？”（频数分析、饼图）
- C 组：“需求是否存在季节性模式？”（跨月份比较、柱状图）
- D 组：“每周服务了多少个家庭，这个数量是否在增加？”（平均值、趋势线）
- E 组：“转介来自哪些渠道？”（分类数据、柱状图）

**阶段 2——服务与学习（第 2 周）**

*第 4–5 课：分析。*
各小组开展分析。这是高强度的数学学习：计算百分比、绘制图表、解读模式。教师巡视各组，根据需要进行微型课程讲解（如何计算百分比变化、如何识别趋势、如何选择合适的图表类型），并确保数学上的严谨性。

这与课本练习的关键区别在于：数据是真实的。答案很重要。如果 A 组计算出需求增加了 43%，这不是课本中的答案——而是关于他们所在社区的一个事实，是食品银行需要了解的信息。

*第 6 课：参观食品银行（如条件允许）。*
学生参观食品银行。他们了解食品银行的运作：食物如何分类、食品包裹如何组装、家庭如何领取。他们与志愿者见面。这让数据具有人文背景——这些数字代表着真实的人。参观结束后，学生带着更强的动力和理解回到分析工作中。

**阶段 3——反思与分享（第 3 周）**

*第 7 课：制作影响报告。*  
各小组将分析结果汇编成一份完整的影响报告。每个小组负责提交自己的部分（包括数据、图表和解读）。全班共同撰写引言和结论。报告将以专业格式呈现——食品银行会将这份文件用于资金申请。

*第 8 课：向食品银行进行展示。*  
食品银行经理再次到访（或学生前往食品银行）。学生展示他们的研究发现。经理回应道：“这正是我们需要的内容。我们可以在下一次资金申请中使用这张图表。你们对需求的预测将帮助我们规划库存订购。”

*第 9 课：反思与评估。*  
结构化的最终反思（见下文）。个人评估任务。

### 反思结构

**服务开始前（第 1 课）：**
- “你对食品银行了解多少？哪些人会使用食品银行，为什么？”
- “你对使用食品银行的人有哪些先入之见？这些看法来自哪里？”（挑战关于贫困的刻板印象——这是公民学习的维度）
- “你预计数据会呈现什么结果？做出预测：需求增加了还是减少了？变化幅度有多大？”

**服务期间（第 4–6 课）：**
- “数据中有什么让你感到意外？有没有什么结果挑战了你的预期？”
- “真实数据与教科书中的数据相比如何？有什么不同？是什么让它更难处理？”
- 参观结束后：“你今天看到的哪些情况是数据无法呈现的？数字能够捕捉什么，又无法捕捉什么？”

**服务结束后（第 9 课）：**
- “你使用了哪些自己原本没有意识到会需要的数学技能？”
- “为了真实目的处理真实数据，如何改变了你学习数学时采用的方法？”
- “你对食物贫困的理解是否发生了变化？如何变化的？你还有哪些问题？”
- “数学技能能够帮助一个社区，这意味着什么？数据分析还可以在哪些地方发挥作用？”

### 评估计划

**学术评估：**  
个人任务：学生将获得一组全新的、陌生的数据集（例如来自慈善商店或无家可归者收容所的数据）。他们必须：清理数据、计算关键统计数据、创建适当的图表、识别规律，并撰写一份简短报告。这项任务考查知识迁移——他们能否将通过食品银行项目学到的技能应用到新的情境中？

**公民发展评估（不计分，但会记录）：**  
学生撰写一段反思文字：“这个项目教会了我哪些教科书无法教会我的东西？”教师关注以下方面的证据：同理心（理解数据背后的人文情境）、公民意识（理解社区的需求）以及能动性（相信自己的技能能够带来改变）。

**社区反馈：**  
食品银行经理提供书面反馈：分析是否准确？报告是否有用？他们是否会使用这份报告？这是最有意义的评估——问题不在于“学生的数学做得是否正确”，而在于“他们的数学是否产生了社区真正需要的成果？”

---

## 已知局限

1. **服务学习需要真正的社区合作伙伴关系，而这种关系需要时间来建立。** 上述食物银行项目假设存在一个愿意合作的社区伙伴，能够提供数据、接待参访并给予反馈。寻找并维持这样的合作关系，是服务学习面临的最大实践挑战之一。刚开始开展服务学习的学校，应从一个值得信赖的社区伙伴入手，再逐步拓展。

2. **服务学习对学业成果的元分析效应量较小（d=0.27 — Celio et al., 2011）。** 服务学习并不是一种像提取练习或反馈那样具有高影响力的学业策略。它的主要价值在于将学业学习与公民发展、真实情境和学习动机结合起来，而不在于提高考试分数。教师应当因为服务学习能够培养公民意识并教授课程内容而采用它，而不是因为它是提升学业成就最高效的方式。

3. **区分服务学习与慈善至关重要，但也很容易出错。** 如果学生因为同情食物银行的使用者，并以一种优越者的立场去“帮助”他们，那么这个项目强化的将是社会等级，而不是对其提出挑战。反思结构旨在防止这种情况，但教师必须保持警惕。其定位应当是合作伙伴关系，而不是怜悯：“我们正在为食物银行提供他们所需要的数据分析技能。他们正在为我们提供我们所需要的真实数据和真实目的。双方都有贡献，双方都能受益。”