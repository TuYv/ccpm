---
# AGENT SKILLS STANDARD FIELDS (v2)
name: phenomenon-based-unit-anchor
description: "Anchor a multidisciplinary unit in a real-world phenomenon that requires multiple subject lenses to understand. Use when designing integrated or phenomenon-based units across disciplines."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/phenomenon-based-unit-anchor"
skill_name: "Phenomenon-Based Unit Anchor"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Finnish National Agency for Education (2016) — National Core Curriculum for Basic Education (POPS 2016)"
  - "Lonka (2018) — Phenomenal Learning from Finland"
  - "Symeonidis & Schwarz (2016) — Phenomenon-based teaching and learning through the pedagogical lenses of phenomenology"
  - "Halinen (2018) — The new educational curriculum in Finland"
  - "Silander (2015) — Phenomenon-based learning in Espoo"
input_schema:
  required:
    - field: "phenomenon"
      type: "string"
      description: "The real-world phenomenon that anchors the unit — a complex, authentic situation that requires multiple subject lenses to understand"
    - field: "subjects_involved"
      type: "string"
      description: "Which subject areas or disciplines the phenomenon draws on"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "curriculum_links"
      type: "string"
      description: "Specific curriculum objectives the unit must address"
    - field: "unit_duration"
      type: "string"
      description: "How long the unit will last — 1 week, 2 weeks, a half-term module"
    - field: "school_context"
      type: "string"
      description: "Whether the school supports cross-curricular planning, timetable flexibility, team teaching"
    - field: "local_relevance"
      type: "string"
      description: "How the phenomenon connects to students' local community or lived experience"
output_schema:
  type: "object"
  fields:
    - field: "unit_design"
      type: "object"
      description: "The complete phenomenon-based unit — anchor phenomenon, driving questions, subject contributions, integration points"
    - field: "subject_contributions"
      type: "array"
      description: "What each subject area contributes to understanding the phenomenon — specific knowledge and skills"
    - field: "integration_points"
      type: "array"
      description: "Where and how the subjects connect — genuine integration, not just proximity"
    - field: "student_inquiry_pathway"
      type: "object"
      description: "How students investigate the phenomenon — questions, activities, evidence gathering"
    - field: "assessment_design"
      type: "object"
      description: "How to assess understanding of the phenomenon — demonstrating integrated understanding, not subject-by-subject testing"
chains_well_with:
  - "project-brief-designer"
  - "culturally-responsive-teaching-designer"
  - "place-based-inquiry-anchor"
  - "agency-scaffold-generator"
  - "curriculum-knowledge-architecture-designer"
teacher_time: "5 minutes"
tags: ["phenomenon-based-learning", "Finland", "POPS-2016", "Lonka", "cross-curricular", "interdisciplinary", "transversal-competences"]
---
# 基于现象的单元锚点

## 此技能的作用

设计一个以真实世界现象为锚点的基于现象的学习单元，该现象需要多个学科才能理解，遵循芬兰 2016 年国家核心课程（POPS 2016）的核心方法。芬兰模式的关键洞见是，现象并非“主题”或“题材”——它们是复杂的真实世界情境，确实**需要**多个学科视角，因为任何单一学科都无法完整解释它们。例如，“本地河流水质”这一现象需要科学（污染物的化学性质、水生生物的生态学）、地理（土地利用、水系）、数学（数据分析、测量）和公民教育（政策、社区责任）。此技能设计该单元时，确保每门学科的贡献都是必要的，且整合是真实的——学科之间之所以建立联系，是因为现象提出了要求，而不是因为教师将它们人为拼接在一起。输出内容包括单元设计、每门学科的贡献、具体整合点、学生探究路径，以及检验综合理解的评估设计。AI 在此尤其有价值，因为设计真实的基于现象的单元，要求同时将多个学科的课程目标映射到同一现象上，同时确保真实整合——这是一项复杂的设计挑战，能够从系统性的交叉参照中获益。

## 证据基础

芬兰国家教育署（2016）规定，所有学校每年至少应纳入一个扩展的“多学科学习模块”，学生通过多个学科视角研究一个现象。其理由是，真实世界的问题并不会以学科化的包装形式出现——气候变化并非“科学”或“地理”或“经济学”，而是同时包含这些方面。Lonka（2018）记录了芬兰的方法，强调基于现象的学习（PBL——不要与基于问题的学习混淆）并不是放弃学科，而是围绕真实现象整合学科。学科依然存在并被教授——但它们会被定期结合起来，以应对真实世界的复杂性。Symeonidis & Schwarz（2016）将这一方法建立在现象学哲学基础上，认为人们首先会整体性地体验现象，之后才会将其分析性地分离为不同学科——因此，学习有时应当逆转这种分析性的分离，回归整体性的参与。Halinen（2018）描述了芬兰课程如何将学科特定目标与“跨领域能力”（思考与学会学习、文化能力、多元读写能力、ICT 能力、工作生活能力、参与和投入、照顾自己与管理日常生活）相结合，而这些能力通过基于现象的模块得到发展。Silander（2015）记录了埃斯波的早期实施情况，表明最有效的基于现象的单元，是那些现象真正复杂（需要多个学科）且与当地相关（与学生所在社区相连）的单元，而不是将学科联系生硬拼凑起来的人为“主题”。

## 输入模式

教师必须提供：
- **现象：** 真实世界中的情境。*例如："我们当地河流的水质——为什么它会在一年中发生变化，哪些因素会影响它？" / "快时尚——为什么衣服如此便宜，这会付出什么代价？" / "我们学校的碳足迹——它来自哪里，我们能减少它吗？" / "迁移到我们城市的人口——人们为什么会来，会带来什么变化，社区如何回应？"*
- **涉及学科：** 哪些学科。*例如："科学、地理、数学" / "地理、经济学、伦理学、纺织" / "科学、数学、公民教育" / "地理、历史、英语、PSHE"*

可选项（如可用，则由上下文引擎注入）：
- **学生阶段：** 年级组
- **课程关联：** 需要涵盖的具体目标
- **单元时长：** 单元持续多久
- **学校情境：** 课表灵活性、协同教学能力
- **本地相关性：** 与学生所在社区的联系

## 提示词

```
You are an expert in phenomenon-based learning as developed in the Finnish education system, with deep knowledge of the POPS 2016 curriculum reform, Lonka's (2018) documentation of the Finnish approach, Symeonidis & Schwarz's (2016) phenomenological grounding, Halinen's (2018) transversal competences framework, and Silander's (2015) implementation research. You understand that phenomenon-based learning is NOT "topic work" or "themed weeks" — it is rigorous, disciplinary learning organised around a real-world phenomenon that genuinely requires multiple subjects to understand.

CRITICAL PRINCIPLES:
- **The phenomenon must be GENUINELY complex.** A good phenomenon cannot be fully understood through one subject alone. If the "integration" requires forcing connections ("Let's do fractions about the rainforest!"), the phenomenon is wrong. Each subject must contribute something NECESSARY that the other subjects cannot provide.
- **Subjects contribute, they don't disappear.** Students still learn science AS science, maths AS maths. The phenomenon provides the context and motivation — but the disciplinary rigour is maintained. Students should learn subject content MORE deeply because the phenomenon gives it meaning, not less deeply because the integration is superficial.
- **Start with a question, not a topic.** "Water" is a topic. "Why does the water quality in our river change through the year, and what can we do about it?" is a driving question that generates genuine inquiry. The question should be real, open, and locally relevant.
- **Integration points must be genuine.** The subjects should connect at specific, identified points where one subject's contribution informs another's. "Science tells us about pollutants; Geography tells us where they come from; Maths helps us analyse the data" — each subject's contribution is genuinely needed at a specific point.
- **Assessment must be integrated.** If you test each subject separately at the end, you have not designed a phenomenon-based unit — you have designed parallel subject units on the same topic. The final assessment should require students to draw on multiple subjects simultaneously.

Your task is to design a phenomenon-based unit for:

**Phenomenon:** {{phenomenon}}
**Subjects involved:** {{subjects_involved}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for lower secondary (Years 7–9).
**Curriculum links:** {{curriculum_links}} — if not provided, identify appropriate curriculum areas.
**Unit duration:** {{unit_duration}} — if not provided, design for a 2-week module (approximately 10–12 lessons across subjects).
**School context:** {{school_context}} — if not provided, design for a standard timetable where subjects are taught separately but teachers coordinate.
**Local relevance:** {{local_relevance}} — if not provided, include a step where students connect the phenomenon to their own community.

Return your output in this exact format:

## Phenomenon-Based Unit: [Phenomenon]

**Driving question:** [The central question that animates the unit]
**Subjects:** [Which disciplines contribute]
**Duration:** [How long]
**Transversal competences developed:** [Which Finnish-style transversal competences this unit develops]

### Unit Overview

[One paragraph: what students investigate, how subjects contribute, what they produce]

### Subject Contributions

For each subject:
**[Subject]: [What this subject contributes]**
- **Knowledge:** [What students learn in this subject through the phenomenon]
- **Skills:** [What disciplinary skills students develop]
- **Why this subject is necessary:** [What understanding would be MISSING without this subject's contribution]

### Integration Map

[Where and how the subjects genuinely connect — specific points where one subject's output becomes another subject's input]

### Student Inquiry Pathway

**Week 1: [Phase name]**
[What students do — which subjects are active, what questions they investigate, what they produce]

**Week 2: [Phase name]**
[Continuation — how the inquiry deepens, how subjects come together]

### Assessment Design

[How to assess integrated understanding — not subject-by-subject testing but a task that requires drawing on multiple disciplines]

### Practical Considerations

[How to coordinate across subjects when teachers have separate timetables — meeting points, shared resources, communication]

**Self-check before returning output:** Verify that (a) the phenomenon genuinely requires multiple subjects, (b) each subject contributes something necessary that others cannot provide, (c) the integration points are genuine and specific, (d) the assessment requires integrated understanding, and (e) the unit is practically feasible within normal school structures.
```

## 示例输出

**情境：** *现象：“快时尚——为什么衣服如此便宜？这在环境和社会层面带来了什么代价？我们又能做些什么？” / 涉及学科：“地理、科学、数学、伦理/PSHE” / 学生年级：“8年级” / 单元时长：“2周——四门学科共约10节课” / 本地关联：“学校附近有一条商业街，那里有几家快时尚零售商——学生经常在那里购物”*

---

## 基于现象的单元：快时尚

**驱动性问题：** 为什么我们的衣服如此便宜？这种低廉的价格究竟带来了什么代价？我们有哪些选择？
**学科：** 地理、科学、数学、伦理/PSHE
**时长：** 2周（4门学科共10节课）
**培养的跨学科能力：** 思考与学会学习、文化能力与互动、多元识读、参与和投入

### 单元概览

学生通过四个学科视角探究快时尚现象：地理学科考察全球供应链（衣服在哪里生产、为什么生产会转移到某些国家、服装工人的人文地理）；科学学科探究环境影响（纺织品化学、染料造成的水污染、合成纤维脱落产生的微塑料、运输造成的碳足迹）；数学学科分析数据（成本构成、产量、废弃物统计数据、不同数据来源的比较与解读）；伦理/PSHE 探讨道德层面（消费者选择、工人权利、可负担性与剥削之间的矛盾）。本单元最终由学生制作一张“真实成本标签”——重新设计的服装标签，利用四门学科的证据传达一件服装所承载的完整环境成本和人力成本。

### 学科贡献

**地理：我们的衣服来自哪里？为什么？**
- **知识：** 全球供应链、制造业经济地理（为什么是孟加拉国、越南、埃塞俄比亚）、工厂选址的推力—拉力因素、制造业区域的城市化与工作条件
- **技能：** 地图技能（追踪供应链）、数据解读（比较不同国家的工资和工作条件）、地理探究
- **为什么需要这门学科：** 没有地理，学生就无法理解衣服为什么便宜——全球制造业的空间逻辑、劳动力成本不断降低的竞争，以及服装工人的人文地理。科学可以解释环境损害，却无法解释导致这些问题的经济结构。

**科学：快时尚对地球造成了什么影响？**
- **知识：** 纺织纤维的性质（天然纤维与合成纤维）、染色和后整理中的化学过程、水污染（工厂排放的化学废液）、微塑料污染（合成纤维在洗涤过程中释放）、全球运输产生的碳排放
- **技能：** 科学探究（测试不同面料释放微塑料的情况）、数据收集、理解化学过程
- **为什么需要这门学科：** 没有科学，学生就无法理解环境成本。“污染”会停留在模糊的概念层面，除非学生了解其中具体的化学原理——纺织染料中含有哪些化学物质、合成纤维进入水道后会发生什么，以及涤纶需要200年才能分解。

**数学：问题有多严重，我们能相信这些数字吗？**
- **知识：** 百分比（成本 breakdown——一件 5 英镑的 T 恤中，有多少比例的钱最终支付给了工人？）、大数概念（每年生产 27 亿件服装——如何理解这个数量）、数据解读（阅读并批判性分析活动组织和行业报告中的图表）
- **技能：** 计算百分比，解读和比较不同来源的数据，理解统计性论断，创建数据可视化
- **为什么需要这门学科：** 没有数学，学生就无法理解这一问题的规模。“很多衣服被浪费了”十分模糊。“在英国，每年有 35 万吨服装被送往填埋场——这相当于 35,000 辆双层巴士的重量”则具体且容易理解。数学还提供了评估行业和活动组织双方不同论断的关键工具。

**伦理/PSHE：我们应该如何应对？**
- **知识：** 伦理框架（权利、后果、公平）、消费者责任、“道德消费”这一概念、个人选择与系统性变革之间的张力、工人权利（《联合国人权宣言》、国际劳工组织公约）
- **技能：** 伦理推理，构建论点，换位思考，评估相互竞争的价值（可负担性与可持续性及工人权利之间的权衡）
- **为什么需要这门学科：** 没有伦理/PSHE，这一单元只能产生知识，却无法赋予学生行动能力。学生会了解到快时尚造成了伤害，却没有判断应该采取什么行动的框架。责任在消费者身上吗？在企业身上吗？还是在政府身上？抵制是否有效，或者它是否会伤害那些原本想要帮助的工人？这些都是需要伦理推理的伦理问题。

### 整合图

| 整合点 | 学科 A 提供…… | 学科 B 运用这些内容来…… |
|---|---|---|
| **供应链绘制** | 地理学绘制一件 T 恤的生产旅程（棉花田 → 纺纱厂 → 工厂 → 船运 → 仓库 → 商店） | 数学计算每个阶段的成本（零售价的多少百分比最终流向了哪里？） |
| **环境证据** | 科学识别纺织品生产产生的具体污染物 | 地理学绘制污染发生的地点（生产国工厂附近的河流系统，而不是消费国） |
| **问题的规模** | 数学分析生产和废弃物统计数据 | 伦理学利用这些数据评估道德责任（“如果 87% 的服装纤维最终进入填埋场或被焚烧，这是设计问题还是消费者问题？”） |
| **工人工作条件** | 地理学描述服装工厂中的工作条件和工资 | 伦理学通过权利框架审视这些情况（“这是否违反了《世界人权宣言》第 23 条？”） |
| **真实成本标签** | 所有学科共同提供数据和分析 | 学生将四种视角综合到一个产品中 |

### 学生探究路径

**第 1 周：理解这一现象**

*地理学（2 节课）：* 追踪一件特定服装的供应链。教师给学生一张服装标签（“孟加拉国制造”），让他们调查其历程：棉花在哪里种植？在哪里纺纱？服装在哪里缝制？它是如何运抵英国的？学生制作供应链图，并研究每个阶段的工作条件。家庭作业：检查衣柜中 5 件物品的标签——它们在哪里制造？

*科学（2课时）：* 调查纺织材料。第1课时：在显微镜下观察织物样本（棉 vs. 聚酯纤维 vs. 尼龙）——它们由什么制成？它们有哪些特性？第2课时：设计并开展一个简单的实验，测试微塑料的释放——将合成纤维织物样本放入水中清洗，过滤后在显微镜下观察。你们发现了什么？

*数学（1课时）：* 5英镑T恤的成本分解。向学生提供一件快时尚T恤的成本结构数据，并计算：棉农、工厂工人、运输公司、零售商和品牌分别获得了多少百分比？将数据制作成饼图。讨论：“这种分配看起来公平吗？需要做出哪些改变，工人才能获得足以维持生活的工资？”

**第2周：分析与回应**

*科学（1课时）：* 计算碳足迹。学生利用地理课供应链地图中的简化运输排放数据，计算所调查服装在整个运输过程中的大致碳足迹。进行比较：一件本地制造的服装与一件从亚洲运输而来的服装，其碳足迹分别是多少？

*伦理/PSHE（2课时）：* 第1课时：伦理辩论。提出三种立场：“少买一些、买更好的衣服”（消费者责任）、“企业应支付足以维持生活的工资”（企业责任）、“政府应进行监管”（系统性变革）。学生运用伦理框架对每种立场进行评估。第2课时：“抵制是否符合伦理？”——如果消费者停止购买来自孟加拉国的商品，工厂工人就会失去工作。学生探讨善意行动可能带来的意外后果。

*数学（1课时）：* 评估相互竞争的观点。向学生提供两份数据来源：一份行业报告声称“快时尚降低了服装成本，使低收入家庭受益”，一份倡议报告声称“快时尚产生了全球10%的碳排放”。对两者进行评估：使用了哪些数据？数据可靠吗？这些观点准确吗？学生学习批判性地阅读数据。

*所有科目（1课时——综合开展或协调进行）：* 制作“真实成本标签”。每位学生为一件服装设计一个标签，传达以下信息：服装在哪里制造、由谁制造（地理），其环境影响（科学），成本分解（数学），以及伦理评级（伦理）。标签必须以证据为基础——每一项声明都必须有本单元数据的支持。

### 评估设计

**真实成本标签（综合评估）：**

学生为自己选择的一件服装制作“真实成本标签”（可以是自己衣橱中的服装，也可以是假设的服装）。标签必须包括：

1. **供应链摘要**（地理）：服装在哪里制造、经历了怎样的运输过程、每个阶段工人的工作条件
2. **环境影响声明**（科学）：环境成本——材料、化学品、碳排放、微塑料——并附上具体数据
3. **成本分解**（数学）：以可视化方式呈现零售价的去向，计算百分比并清晰展示
4. **伦理评估**（伦理）：至少使用一种伦理框架评估该服装的伦理状况，并说明其中的矛盾与权衡

**评估标准：**该标签采用整体评估方式，而不是按学科分别评估。评估标准包括：准确性（证据是否正确？）、整合性（四个视角是否相互关联，形成连贯的整体图景？）、批判性（学生是否承认其中的复杂性与权衡？）以及表达能力（标签是否清晰且有效？）。

每位参与教师负责评估本学科贡献的准确性，但整合性由所有教师共同评估。

### 实际考虑

**协调（最困难的部分）：**四位教师需要在单元开始前召开一次 30 分钟的规划会议，并在单元进行期间再召开一次会议（分享学生已经完成的成果并作出调整）。应准备一个共享文件夹（数字或实体均可），供学生存放各学科中形成的证据——每节课的产出都会为最终标签提供素材。

**时间安排：**该单元可以在正常课表内完成。每门学科都在自己的课时中开展教学。唯一的要求是大致同步（地理课的供应链课程应安排在数学课的成本分析之前，因为供应链会为成本分析提供数据）。一份简单的共享时间表可以避免各学科教学顺序错乱。

**资源：**织物样本（用于科学课的显微镜观察）、服装标签（由学生从家中带来）、数据集（成本明细、生产统计数据——由教师整理）、可使用简单制图工具（用于绘制地理课的供应链地图）。

---

## 已知局限

1. **基于现象的学习需要跨学科协调，而这在大多数学校中都存在结构性困难。**芬兰课程的设计考虑到了这一点——芬兰学校通常拥有更灵活的课表安排，也有教师协作的传统。在课表僵化、规划时间有限的学校中，学科之间的协调是首要障碍。上述单元设计尽量减少了所需的协调（一次规划会议、一个共享文件夹、大致同步），但它仍然需要比独立开展学科教学更多的协作。

2. **并非所有学科都能与所有现象自然整合。**快时尚这一例子能够令人信服地整合地理、科学、数学和伦理学——每门学科都提供了真正不可或缺的内容。但强行整合（“让我们通过让学生设计一个可持续时装系列来加入艺术”）会削弱单元的效果。与其加入五门人为关联的学科，不如选择三门真正实现整合的学科。

3. **基于现象的学习是对学科教学的补充，而不是替代。**芬兰模式将基于现象的模块与学科专门教学结合起来，而不是用前者取代后者。学生仍然需要专门的学科课程，以构建他们在探究现象时所需的学科知识与技能。如果一所学校用基于现象的学习取代所有学科教学，学生很可能会形成广泛的认知，却缺乏扎实的学科理解。