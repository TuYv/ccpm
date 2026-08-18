---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ecological-inquiry-anchor-designer
description: "Design an inquiry sequence anchored in a local ecosystem that embeds science or geography curriculum content. Use when teaching through local living systems like gardens, ponds, or hedgerows."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/ecological-inquiry-anchor-designer"
skill_name: "Ecological Inquiry Anchor Designer"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Sobel (1996) — Beyond Ecophobia: reclaiming the heart in nature education"
  - "Sobel (2004) — Place-Based Education: connecting classrooms and communities"
  - "Orr (1992) — Ecological Literacy: education and the transition to a postmodern world"
  - "Kimmerer (2013) — Braiding Sweetgrass: Indigenous wisdom, scientific knowledge, and the teachings of plants"
  - "Chawla (1998) — Significant life experiences revisited: a review of research on sources of environmental sensitivity"
input_schema:
  required:
    - field: "local_ecosystem"
      type: "string"
      description: "The specific local ecosystem or living system that anchors the inquiry — a garden, pond, hedgerow, tree, patch of waste ground, window box"
    - field: "curriculum_objective"
      type: "string"
      description: "The science or geography curriculum content the inquiry must address"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "time_frame"
      type: "string"
      description: "How long the inquiry runs — single lesson, a week, a term, a year"
    - field: "school_grounds"
      type: "string"
      description: "What outdoor or growing spaces the school has"
    - field: "community_expertise"
      type: "string"
      description: "Local experts — gardeners, ecologists, farmers, park rangers"
    - field: "student_prior_experience"
      type: "string"
      description: "Students' existing relationship with nature and outdoor environments"
output_schema:
  type: "object"
  fields:
    - field: "ecological_inquiry"
      type: "object"
      description: "The complete inquiry design — anchored in a specific local ecosystem, addressing curriculum objectives through direct ecological investigation"
    - field: "inquiry_question"
      type: "string"
      description: "The driving question that emerges from the ecosystem and connects to the curriculum"
    - field: "investigation_activities"
      type: "array"
      description: "What students do — direct observation, data collection, long-term monitoring, ecological interventions"
    - field: "ecological_literacy_outcomes"
      type: "object"
      description: "What students understand about ecological systems — beyond curriculum objectives, the deeper ecological literacy"
    - field: "stewardship_dimension"
      type: "object"
      description: "How the inquiry leads to caring for the ecosystem — knowledge creates responsibility"
chains_well_with:
  - "outdoor-learning-sequence-designer"
  - "place-based-inquiry-anchor"
  - "phenomenon-based-unit-anchor"
  - "biophilic-learning-environment-designer"
  - "critical-thinking-task-designer"
teacher_time: "4 minutes"
tags: ["ecological-literacy", "Sobel", "Orr", "place-based", "environmental-education", "inquiry", "stewardship"]
---
# 生态探究锚点设计师

## 此技能的作用

设计一项以特定本地生态系统为锚点的持续性生态探究——可以是池塘、花园、树篱、一棵树，甚至是窗台花箱——将课程中的科学目标与对学生能够长期观察、监测并照料的生命系统进行直接探究联系起来。这种方法借鉴了 Sobel（1996、2004）的地方本位教育理念，以及他对“生态恐惧症”的批评（在儿童尚未对本地自然形成喜爱之前，就用全球环境灾难吓唬他们），同时也借鉴了 Orr（1992）提出的生态素养概念（理解自然系统如何运作，而不仅仅是知道关于自然的事实）。其核心原则是：生态理解来自于与特定生命系统建立**关系**——持续观察一个池塘，比阅读十种生物群系更能传授生态学知识。输出内容包括探究设计、驱动性问题、调查活动、生态素养成果（超越课程要求），以及一个关怀行动维度，让学生对他们所研究的生态系统承担责任。人工智能在此特别有价值，因为要让一项探究通过真实的生态调查来达成课程目标，就需要将科学概念映射到某个特定本地生态系统能够揭示的内容上，从而确保生态学是真实的，而不是人为编造的。

## 证据基础

Sobel（1996）认为，环境教育应从对本地自然的**热爱**开始，而不是从对全球毁灭的**恐惧**开始。他记录了这样一种现象：如果儿童在尚未与本地自然建立情感联结之前，就过早接触环境灾难（热带雨林遭到破坏、物种灭绝、气候变化），就会产生“生态恐惧症”——结果不是形成关怀行动，而是焦虑、无助和疏离。他提出的建议是：4—7岁，探索家庭环境；8—11岁，探索当地社区及其生态系统；12—15岁及之后，参与更广泛的社会与环境议题。要从本地开始，从积极的体验开始，从建立关系开始。Sobel（2004）将这一理念进一步发展为地方本位教育，主张课程应当从本地环境中生长出来，而不是被套用到本地环境之上。Orr（1992）将生态素养定义为理解自然系统如何维持生命——包括能量流动、物质循环、物种间的相互依存关系，以及生态系统的韧性。他认为，生态无知是最危险的一种无知，因为它使人类能够在不理解自身行为的情况下，摧毁维持人类生存的系统。Kimmerer（2013）以 Indigenous（Potawatomi）的视角写道，人类与生命世界之间的关系既是科学性的，也是互惠的——向植物和生态系统学习，与照料它们密不可分。Chawla（1998）回顾了关于“重要人生经历”的研究——这些经历会影响成年后是否关心环境——结果发现，最常见的因素是童年时期对自然的直接、长期体验，而不是环境教育课程或宣传活动。

## 输入模式

教师必须提供：
- **当地生态系统：** 具体的生物系统。*例如：“学校池塘——约 2m × 3m，建成 5 年，春季有蛙卵，夏季有蜻蜓，有一些藻类堆积” / “校园里的一棵大橡树——估计已有 150 年树龄，从教室窗户可以看到” / “学校花园里的三个高架种植床——目前种植着香草和蔬菜” / “学校围栏后的一块‘荒地’——杂草丛生，野生且长期无人管理，但在生态方面很有趣”*
- **课程目标：** 必须学习的内容。*例如：“四年级科学：生物及其栖息地——识别当地栖息地以及生活在其中的生物” / “七年级科学：生态系统——食物链、食物网、相互依存” / “八年级地理：生态系统——生态系统如何运作、人类影响”*

可选项（如有可用信息，则由上下文引擎注入）：
- **学生水平：** 年级
- **时间范围：** 探究持续时间
- **校园场地：** 可使用的户外空间
- **社区专业知识：** 当地专家
- **学生先前经验：** 既有的自然联结

## 提示词

```
You are an expert in ecological education and place-based inquiry, with deep knowledge of Sobel's (1996, 2004) place-based education and ecophobia framework, Orr's (1992) ecological literacy, Kimmerer's (2013) reciprocal relationship with living systems, and Chawla's (1998) research on significant life experiences. You understand that ecological understanding is not a set of facts but a WAY OF SEEING — an ability to perceive the connections, dependencies, and cycles in living systems. This understanding comes from sustained relationship with specific ecosystems, not from textbook descriptions of generic biomes.

CRITICAL PRINCIPLES:
- **Start with love, not fear (Sobel, 1996).** Children need to fall in love with a specific pond, tree, or garden BEFORE they can meaningfully engage with abstract environmental issues. Don't begin with "ecosystems are under threat" — begin with "look at what lives in our pond."
- **The ecosystem is the teacher.** The curriculum objective is met THROUGH the ecosystem, not mapped onto it. If the objective is "food chains," the students don't learn about food chains and then look at the pond — they investigate the pond and discover the food chain that's actually there.
- **Long-term observation reveals what short visits cannot.** An ecosystem changes through seasons, through weather, through years. A single visit shows a snapshot; a term of weekly observations shows a living system. Design the inquiry for sustained engagement, not a one-off trip.
- **Reciprocity, not extraction (Kimmerer, 2013).** Students don't just TAKE knowledge from the ecosystem (observe, collect data, leave). They give back — through care, stewardship, and respect. The inquiry includes a stewardship dimension: what can we do FOR this ecosystem?
- **Every ecosystem is complex enough.** A school pond is not a "simple" ecosystem. It contains hundreds of species, multiple trophic levels, seasonal cycles, water chemistry, decomposition processes, and inter-species relationships. A single tree supports an entire community. Don't dismiss small or familiar ecosystems as educationally insufficient.

Your task is to design an ecological inquiry for:

**Local ecosystem:** {{local_ecosystem}}
**Curriculum objective:** {{curriculum_objective}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the curriculum objective.
**Time frame:** {{time_frame}} — if not provided, design for a term-long inquiry with weekly observations.
**School grounds:** {{school_grounds}} — if not provided, use the described ecosystem.
**Community expertise:** {{community_expertise}} — if not provided, suggest who might help.
**Student prior experience:** {{student_prior_experience}} — if not provided, assume limited but not absent nature experience.

Return your output in this exact format:

## Ecological Inquiry: [Ecosystem] × [Curriculum Objective]

**Ecosystem:** [The specific local living system]
**Curriculum objective:** [What students must learn]
**Driving question:** [The question that emerges from the ecosystem and connects to the curriculum]

### Why This Ecosystem

[What makes this specific ecosystem educationally rich — what it can teach that a textbook cannot]

### Inquiry Design

**Phase 1 — Meeting the ecosystem**
[How students first encounter the ecosystem — observation, wonder, questions]

**Phase 2 — Investigating**
[What students investigate — specific activities, data collection, long-term monitoring]

**Phase 3 — Understanding**
[How students make sense of what they've found — connecting observations to ecological concepts]

**Phase 4 — Stewardship**
[How students give back — caring for the ecosystem based on what they've learned]

### Investigation Activities

[Detailed activities — what students do, what data they collect, what tools they use]

### Curriculum Connections

[How the inquiry addresses the specific curriculum objective — with evidence from the ecosystem itself]

### Ecological Literacy Outcomes

[What students understand about HOW ecosystems work — beyond the specific curriculum objective]

### Stewardship Plan

[Specific actions students take to care for the ecosystem — informed by their investigation]

**Self-check before returning output:** Verify that (a) the inquiry starts with love and wonder, not fear, (b) the ecosystem drives the inquiry rather than the curriculum being mapped onto it, (c) sustained observation is built in, (d) stewardship follows naturally from investigation, and (e) the curriculum objective is genuinely addressed through the ecological inquiry.
```

## 示例输出

**情境：** *本地生态系统：“学校池塘——大约 2m × 3m，由之前的六年级班级于 5 年前挖成。池塘中有水生植物（水 lilies、鸢尾、薄荷），春天会出现蛙卵，夏天可以看到蜻蜓；目前藻类问题日益严重（水体呈绿色），而且我们注意到今年的青蛙比去年少了。池塘位于学校的自然保护区内，保护区中还有一堆原木、一条野花带和一个喂鸟器。” / 课程目标：“七年级科学：生态系统——食物链、食物网、相互依存关系，以及生态系统变化的影响” / 时间范围：“一个学期——大约 12 周，每周一节课（此外还有讲授相关概念的常规科学课）”*

---

## 生态探究：学校池塘 × 生态系统与相互依存关系

**生态系统：** 学校池塘——2m × 3m，已有 5 年历史，植物已经建立，存在青蛙种群，有藻类问题，生物多样性指标正在下降  
**课程目标：** 七年级科学——食物链、食物网、相互依存关系，以及生态系统变化的影响  
**核心问题：** “我们的池塘正在变绿，而且青蛙越来越少。发生了什么？我们能提供帮助吗？”

### 为什么选择这个生态系统

这个池塘是一个微型的完整生态系统。它包含：
- **生产者：** 藻类、水生植物（水 lilies、鸢尾、薄荷）
- **初级消费者：** 水蚤（Daphnia）、池塘蜗牛、蜉蝣幼虫、蚊子幼虫
- **次级消费者：** 蜻蜓幼虫、水黾、潜水甲虫、蝾螈（如果存在）
- **三级消费者：** 青蛙（成体）、苍鹭（如果前来）
- **分解者：** 沉积物中的细菌、真菌

它存在一个**真正的**问题——藻类过度生长以及青蛙数量下降——这是一个真实的生态学谜题。藻华可能是由营养物质富集（水体富营养化）造成的，来源可能包括落叶、土壤径流，或者池塘过去曾被投喂过多。如果藻类降低了氧气含量，使池塘变得不适宜生存，那么青蛙数量下降可能与此有关；也可能存在另一个独立原因（周边栖息地减少、捕食、疾病）。这不是课本中的问题，而是一项真实的调查，学生可以发现一个真实的答案。

### 探究设计

**阶段 1——认识池塘（第 1–2 周）**

*第 1 周：初次接触。*  
学生参观池塘。不带夹板，也不带练习单。只是观察。静静地坐在池塘边 10 分钟。然后提问：“你注意到了什么？你看到了什么在移动？你有什么问题？”教师将问题记录在一张大纸上。

预期问题：“为什么水是绿色的？”“青蛙去哪儿了？”“水面上的那个虫子是什么？”“池塘是不是快要死了？”

绿色的水和消失的青蛙是真实的切入点——学生会立即注意到它们。探究问题源于观察，而不是由教师直接给出。

*第 2 周：基线调查。*  
学生开展生物多样性调查。使用池塘采样网和鉴定检索表，对无脊椎动物进行采样，鉴定物种（或物种类群），并记录他们发现的内容。他们还要记录：水的颜色、水的清澈程度（能否看到池底）、植物覆盖情况，以及任何可见的动物。这是后续衡量变化的基线。

**阶段 2——调查（第 3—8 周）**

*第 3 周：构建食物网。*  
利用第 2 周发现的物种，学生构建这个池塘真实的食物网——不是课本中的食物网，而是基于他们实际观察到的情况。“我们发现了水蚤。水蚤吃什么？（藻类。）什么吃水蚤？（蜻蜓幼虫，如果池塘里有鱼，也可能是鱼。）什么吃蜻蜓幼虫？（青蛙、鸟类。）”食物网绘制在一块大型展示板上，并在整个学期中保留——它是一份会随着发现新物种而不断更新的工作文档。

*第 4—5 周：藻类调查。*  
核心问题进一步聚焦：“为什么我们的池塘变绿了？”学生设计并开展一项调查：
- 检测水质：pH 值、硝酸盐含量（使用简单的测试条，可从水族用品店以 £5 购买）、水体透明度（塞氏盘——学生可以用一块系在绳子上的加重白色圆盘自制）
- 进行比较：从池塘和学校水龙头分别取水样。两者有什么不同？硝酸盐测试很可能会显示池塘中的硝酸盐含量较高（这是藻类生长的原因）
- 提出假设：“如果硝酸盐含量很高，那么是什么产生了这些硝酸盐？”学生进行调查：池塘中的落叶腐烂、相邻花坛的土壤径流、附近喂鸟器周围的鸟粪。每一项都是可以进行检验的假设。

*第 6—7 周：青蛙问题。*  
“为什么青蛙变少了？”学生研究青蛙的生命周期和栖息地需求：青蛙繁殖需要洁净的水（藻类会降低溶解氧含量）、有植被的池塘边缘以提供遮蔽，以及周围的栖息地以便觅食。学生评估：我们的池塘是否仍能提供这些条件？木桩堆提供了觅食栖息地。但藻类是否使水体变得不再适合蝌蚪生存？

*第 8 周：绘制相互依存关系图。*  
学生重新审视他们的食物网。教师引入“相互依存”的概念：“如果藻类大量繁殖并覆盖水面，下面的植物会发生什么？（它们无法进行光合作用——于是死亡。）如果植物死亡，生活在其中的无脊椎动物会发生什么？（它们失去了栖息地。）如果无脊椎动物数量减少，谁会受到影响？（青蛙。）所以，藻类问题可能与青蛙问题相互关联。”学生沿着自己的食物网追踪这一连锁变化——相互依存关系通过他们的池塘变得清晰可见。

**阶段 3——理解（第 9—10 周）**

学生综合他们的调查结果：
- 食物网展示了能量如何在池塘生态系统中流动
- 藻类调查展示了一个因素（营养物质含量）的变化如何在整个系统中产生连锁反应
- 青蛙问题展示了相互依存关系如何在现实中发挥作用——一个物种的健康取决于整个系统的健康
- “生态系统平衡”这一概念变得具体可感：这个池塘最初挖成时是平衡的，而现在某些因素发生了变化

学生为学校撰写一份“生态系统健康报告”——总结他们的发现，解释其中的科学原理，并提出行动建议。

**阶段 4——生态守护（第 11—12 周）**

基于调查结果，学生设计并实施一项干预措施：
- 如果问题是落叶：在秋季安装池塘防护网，防止树叶进入池塘
- 如果问题是径流：在花坛和池塘之间设置种植缓冲带
- 如果问题是营养物质积累：部分换水（移除一部分富含藻类的水，并用洁净水替换），同时加入大麦秸秆（一种传统且有证据支持的减少藻类的方法）
- 持续开展：成立“池塘监测小组”，每月检查水质和物种情况——探究不会随着单元课程结束而结束

### 调查活动

| 周次 | 活动 | 学生活动 | 收集的数据 |
|---|---|---|---|
| 1 | 静默观察 | 坐下观察，记录问题 | 问题清单、初步草图 |
| 2 | 生物多样性调查 | 进行池塘采样，鉴定物种 | 物种清单、丰度估算 |
| 3 | 构建食物网 | 研究取食关系，构建食物网 | 实体食物网展示 |
| 4 | 水质检测 | 检测 pH 值、硝酸盐含量和清澈度 | 水质数据（定量） |
| 5 | 藻类来源调查 | 检验关于营养物来源的假设 | 比较数据、观察记录 |
| 6 | 青蛙栖息地评估 | 评估繁殖和觅食栖息地 | 栖息地检查表、状况评级 |
| 7 | 与健康池塘进行比较 | 研究或参观一个用于比较的地点 | 物种和水质比较数据 |
| 8 | 绘制相互依存关系图 | 沿着食物网追踪级联影响 | 标注了影响箭头的食物网 |
| 9–10 | 生态系统健康报告 | 综合资料并撰写报告 | 以证据为基础的书面报告 |
| 11–12 | 生态守护干预 | 规划并实施改善行动 | 行动计划、干预前后数据计划 |

### 课程关联

| 课程目标 | 池塘探究如何实现这一目标 |
|---|---|
| 食物链 | 学生根据在**他们的**池塘中发现的物种，构建一条真实的食物链 |
| 食物网 | 完整的食物网由观察到的生物构建，而不是采用课本中的例子 |
| 相互依存 | 藻类与青蛙之间的联系展示了生物系统中的级联效应 |
| 变化的影响 | 藻华**本身就是**生态系统发生的一种变化——学生调查其成因和影响 |
| 人类影响 | 学生发现人类行为（花园径流、鸟类喂食器的放置）可能造成了这一问题，同时也发现人类的生态守护能够解决这一问题 |

### 生态素养成果

除了课程要求之外，学生还将发展以下能力：
1. **系统思维。** 池塘不是一个个独立生物的集合——它是一个一切相互联系的**系统**。改变其中一个要素，会以并不总是显而易见的方式影响其他要素。
2. **季节意识。** 通过每周访问，学生注意到池塘在整个学期中不断变化——物种出现又消失，植物生长又枯萎，水位发生变化。生态系统是动态的，而不是静止的。
3. **生态互惠。** 学生向池塘学习，也回馈**池塘**。这就是 Kimmerer 的原则：知识会创造责任。理解池塘生态的学生会受到激励去呵护它。
4. **长期观察的价值。** 一次访问只能提供一个截面。十二周则能呈现一个故事。学生会了解到，生态理解需要耐心和反复观察。

### 生态守护计划

学生根据证据设计干预方案：
1. **确定原因。** 他们的调查将确定藻类是由营养物径流、落叶堆积还是其他因素造成的。
2. **研究解决方案。** 针对每一种原因，研究符合生态学原则的干预措施（不是化学方法，而是生物和结构性方法）。
3. **实施。** 在教师和管理人员的支持下，开展干预措施。
4. **监测。** 建立持续监测机制：每月进行水质检测，每学期进行物种调查。下一年度的七年级学生继续开展监测，并将他们的数据与本年度的基线数据进行比较。池塘将成为一个长期生态研究地点。

---

## 已知局限

1. **生态探究需要接触真实的生态系统。** 没有池塘、花园或可进入的自然区域的学校确实会面临限制。然而，Sobel 的原则是：任何生物系统——即使是窗台花箱、堆肥箱，或操场裂缝中长出的一小片草地——都具有足够的生态复杂性，可以进行探究。探究可以根据现有的生态系统进行相应调整。

2. **生态教育的证据基础主要是定性的。** Chawla (1998) 和 Sobel (1996, 2004) 依托的是定性研究传统——重要生命经历叙事、案例研究和实践者记录。证明生态探究能够提升学业成绩的 RCT 或大规模定量研究相对较少。关于参与度、环境意识和环境守护行为的证据，比关于科学测试表现的证据更为充分。

3. **长期探究需要制度性支持。** 持续一学期、每周进行的调查需要在课表中得到时间保障、能够在各种天气条件下进行户外活动，以及学校管理层的支持。如果每逢下雨或场地泥泞就取消探究，持续观察这一原则就会受到削弱。教师需要为生态探究能够开展所需的时间和条件进行倡导。