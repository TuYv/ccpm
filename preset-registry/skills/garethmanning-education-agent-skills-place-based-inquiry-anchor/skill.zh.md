---
# AGENT SKILLS STANDARD FIELDS (v2)
name: place-based-inquiry-anchor
description: "Anchor curriculum learning in a specific local place with connections to community, culture, and identity. Use when connecting academic content to students' local environment and heritage."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/place-based-inquiry-anchor"
skill_name: "Place-Based Inquiry Anchor"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Castagno & Brayboy (2008) — Culturally responsive schooling for Indigenous youth: a review of the literature"
  - "Gruenewald (2003) — The best of both worlds: a critical pedagogy of place"
  - "Sobel (2004) — Place-Based Education: connecting classrooms and communities"
  - "Smith (2002) — Place-based education: learning to be where we are"
  - "Bang, Medin & Atran (2007) — Cultural mosaics and mental models of nature"
input_schema:
  required:
    - field: "curriculum_content"
      type: "string"
      description: "The academic content or skills to be taught"
    - field: "local_place"
      type: "string"
      description: "The specific place that anchors the inquiry — a local river, park, neighbourhood, building, or landscape feature"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "indigenous_connections"
      type: "string"
      description: "Whether the local place has Indigenous history or cultural significance"
    - field: "community_knowledge_holders"
      type: "string"
      description: "People in the community with deep knowledge of the place — farmers, historians, elders, environmental groups"
    - field: "access_constraints"
      type: "string"
      description: "Whether students can visit the place, or whether the inquiry must be conducted from the classroom"
output_schema:
  type: "object"
  fields:
    - field: "place_based_inquiry"
      type: "object"
      description: "The complete inquiry design — anchored in a specific local place, connecting academic content to place-based knowledge"
    - field: "place_knowledge"
      type: "object"
      description: "What the place itself teaches — what can be learned from direct engagement with this specific location"
    - field: "multiple_knowledge_systems"
      type: "object"
      description: "How the inquiry honours multiple ways of knowing the place — scientific, historical, cultural, Indigenous, experiential"
    - field: "action_dimension"
      type: "object"
      description: "How the inquiry leads to responsible action in relation to the place — stewardship, advocacy, or service"
chains_well_with:
  - "culturally-responsive-teaching-designer"
  - "ubuntu-collective-knowledge-task-designer"
  - "phenomenon-based-unit-anchor"
  - "awe-wonder-experience-designer"
teacher_time: "4 minutes"
tags: ["place-based", "Indigenous-education", "Castagno-Brayboy", "Gruenewald", "local", "land", "stewardship", "decolonising"]
---
# 基于地方的探究锚点

## 此技能的作用

设计一项锚定于特定本地地方的探究，将地方本身作为主要文本和教学资源，把学术课程与通过直接接触当地景观、社区和环境所能学到的内容联系起来。这种方法借鉴了地方本位教育（Sobel, 2004; Smith, 2002）、地方批判教育学（Gruenewald, 2003）以及原住民教育研究（Castagno & Brayboy, 2008; Bang, Medin & Atran, 2007）。其关键洞见在于，地方不仅是学习发生的地点，它们本身就是知识来源。一条当地河流可以同时教授生态学、化学、地理、历史和公民责任。一个街区可以教授经济学、社会学、建筑学和社区知识。基于地方的探究尊重认识一个地方的多种方式——科学观察、历史研究、文化记忆、原住民知识以及直接的感官体验——将它们视为互补的，而不是存在等级之分。输出内容包括一项锚定于特定地方的探究设计、对该地方所传授内容的识别、尊重多种知识体系的框架，以及一个行动维度，让学生对自己与该地方的关系承担责任。AI 在此尤其有价值，因为将课程标准与具体的本地地方联系起来，需要把学术内容映射到基于地方的学习机会——这是一项能够从广泛掌握课程和本地地理知识中受益的交叉参照任务。

## 证据基础

Castagno & Brayboy (2008) 回顾了关于原住民青少年文化回应式学校教育的文献，发现对原住民学生而言，有效的教育将地方和土地作为学习的根基。在原住民认识论中，知识并非抽象且可携带的东西——它存在于与特定地方的关系之中，理解土地与理解自我是不可分割的。尽管这项研究聚焦于原住民语境，但地方是知识来源这一原则对所有学生都具有启示意义。Gruenewald (2003) 提出了“地方批判教育学”，将批判教育学（考察权力、公平和社会结构）与地方本位教育（通过参与本地活动进行学习）结合起来。他认为，教育应当帮助学生既融入自己的地方（与当地环境建立深厚且关怀性的关系），又推动地方去殖民化（批判性地考察地方如何受到殖民、经济和政治力量的塑造）。Sobel (2004) 记录了美国各地的地方本位教育项目，表明通过本地地方学习的学生，相较于传统课堂中的学生，表现出更高的学业成就、更紧密的社区联系以及更强的环境 stewardship。Smith (2002) 将地方本位学习方法分为以下几类：文化研究（当地历史、传统、艺术）、自然研究（当地生态学、环境科学）、现实世界问题解决（调查当地问题）、实习与创业（社区参与），以及参与社区过程（公民参与）。Bang, Medin & Atran (2007) 证明，与通过标准西方科学课程学习生态学的儿童相比，通过文化情境化的地方本位方法学习的原住民儿童，形成了更复杂且更准确的生态学理解——这表明原住民认识自然的方式在认识论上十分丰富，而非有所欠缺。

## 输入架构

教师必须提供：
- **课程内容：** 学生需要学习的内容。*例如：“生态系统与食物链——七年级科学” / “地方历史——八年级历史，我们所在地区发生了怎样的变化” / “数据收集与分析——六年级数学” / “地理实地考察——九年级地理，某个当地地区的自然地理与人文地理”*
- **当地地点：** 具体地点。*例如：“学校后面经过的运河——建于 18 世纪 90 年代，后来废弃，最近由一个社区信托组织修复” / “我们这条路尽头的公园——一座拥有成熟树木的维多利亚时期公园，被许多不同的社区团体使用” / “商业街——独立商店、连锁店和空置店铺并存，反映出我们城镇的经济变化”*

可选项（如有，将由上下文引擎注入）：
- **学生水平：** 年级
- **学科领域：** 课程所属学科
- **原住民关联：** 该地点是否具有原住民文化意义
- **社区知识持有者：** 深入了解该地点的人
- **访问限制：** 学生是否能够亲自前往该地点

## 提示词

```
You are an expert in place-based education, with deep knowledge of Castagno & Brayboy's (2008) research on culturally responsive schooling for Indigenous youth, Gruenewald's (2003) critical pedagogy of place, Sobel's (2004) place-based education framework, Smith's (2002) categories of place-based learning, and Bang, Medin & Atran's (2007) research on Indigenous ecological knowledge. You understand that places are not passive backdrops for learning — they are active sources of knowledge. A place teaches through its ecology, its history, its communities, its changes, and its stories. Place-based education reads the place as a primary text.

CRITICAL PRINCIPLES:
- **The place is the text.** The starting point is not the curriculum but the PLACE. What does this specific place teach? What can be learned from direct engagement with it? The curriculum content is then mapped onto what the place offers — not the other way around. The place determines the questions; the curriculum provides the tools for answering them.
- **Multiple ways of knowing.** A scientist knows a river through water chemistry and species counts. A historian knows it through the stories of who built the canal and why. An elder knows it through decades of memory and change. An Indigenous knowledge holder may know it through relationships with the land that predate colonial settlement. Place-based inquiry honours ALL these ways of knowing as legitimate and complementary.
- **Direct experience is primary.** Students should engage with the place directly — visit it, observe it, touch it, listen to it — wherever possible. If physical access is not possible, bring the place into the classroom through photographs, sound recordings, soil samples, water samples, maps, and testimony from people who know it. But no substitute fully replaces direct experience.
- **Critical engagement, not just appreciation.** Following Gruenewald, place-based education is not just "nature appreciation" or "local pride." It includes critical analysis: Who owns this land? How did they come to own it? Whose stories are told about this place, and whose are erased? What economic forces shape it? What environmental damage has been done, and by whom?
- **Responsibility follows knowledge.** If students learn deeply about a place, they develop a relationship with it. The inquiry should include an action dimension — stewardship, advocacy, or service — that grows naturally from the learning.

Your task is to design a place-based inquiry for:

**Curriculum content:** {{curriculum_content}}
**Local place:** {{local_place}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for lower secondary.
**Subject area:** {{subject_area}} — if not provided, infer from the curriculum content.
**Indigenous connections:** {{indigenous_connections}} — if not provided, include a note about investigating the pre-colonial history of the place.
**Community knowledge holders:** {{community_knowledge_holders}} — if not provided, suggest who might hold knowledge of this place.
**Access constraints:** {{access_constraints}} — if not provided, design for a visit to the place.

Return your output in this exact format:

## Place-Based Inquiry: [Place] × [Curriculum Content]

**Place:** [The specific local place]
**Curriculum content:** [What academic knowledge and skills students develop]
**Driving question:** [A question that emerges from the place itself]

### What This Place Teaches

[What can be learned from direct engagement with this specific place — its ecology, history, community, changes, stories]

### Multiple Ways of Knowing

[How different knowledge systems illuminate the place — scientific, historical, cultural, experiential, and where appropriate, Indigenous]

### Inquiry Design

**Phase 1 — Encounter the place**
[How students first engage with the place — direct experience, observation, sensory engagement]

**Phase 2 — Question the place**
[What questions the place raises — prompted by what students observe, wonder, and notice]

**Phase 3 — Investigate**
[How students use academic tools (from the curriculum content) to answer their questions — fieldwork, research, data collection]

**Phase 4 — Integrate and share**
[How students bring together what they've learned from multiple sources and share it]

### Action Dimension

[How the inquiry leads to responsible action — stewardship, advocacy, or service in relation to the place]

### Community Knowledge Holders

[Who in the community holds knowledge about this place, and how they might contribute to the inquiry]

**Self-check before returning output:** Verify that (a) the place drives the inquiry, not the curriculum alone, (b) multiple ways of knowing are honoured, (c) direct experience with the place is included, (d) critical analysis is present alongside appreciation, and (e) the inquiry includes an action dimension.
```

## 示例输出

**情境：** *课程内容：“生态系统与生物多样性——八年级科学，理解食物链、食物网、相互依存关系以及人类对生态系统的影响” / 当地地点：“我们学校后面的运河——它建于 18 世纪 90 年代的工业革命时期，用于运输货物。20 世纪中叶，运河逐渐废弃，变得受到污染并杂草丛生。2015 年，一个社区信托组织对其进行了修复，如今这里已经成为一条拥有野生动物、步行道和社区花园的绿色廊道。但水质仍然不稳定，邻近土地的开发问题也一直存在争议。” / 学生年级：“八年级” / 社区知识持有者：“运河信托组织有负责监测水质的志愿生态学家。一位退休地理教师曾撰写过一本介绍运河历史的小册子。还有一位参与开发争议的当地议员。”*

---

## 基于地方的探究：运河 × 生态系统与生物多样性

**地点：** 我们学校后面的运河——一条有着 230 年历史、经历过工业发展、衰落和社区修复的水道  
**课程内容：** 生态系统、食物链、食物网、相互依存关系、人类对生物多样性的影响  
**核心问题：** “我们的运河是一个健康的生态系统吗？我们如何知道？怎样才能让它变得更健康？”

### 这个地方能教会我们什么

这条运河是一部关于生态学概念的活教材：
- **食物链和食物网：** 运河支撑着一个清晰可见的食物网——藻类和水生植物 → 无脊椎动物（水黾、蜻蜓幼虫、淡水虾）→ 鱼类（如果存在）→ 苍鹭和翠鸟（如果观察到）。学生可以在 100 米的河段内观察到多个营养级。
- **相互依存关系：** 运河生态系统依赖各种关系——植物为水体充氧，无脊椎动物分解有机物，纤道沿线的树木为水体遮阴并减少过度升温。移除其中一个要素，整个系统就会发生变化。
- **人类的影响：** 这条运河由人类建造（工业基础设施），因人类而退化（污染、疏于管理），也由人类修复（社区信托组织、栖息地管理）。它表明，人类的影响并不总是负面的——修复同样是人类的一种选择。
- **演替：** 运河展现了生态演替的不同阶段——经过清理并重新种植的区域、拥有成熟栖息地的已建立区域，以及逐渐恢复为茂密杂生状态的荒废区域。
- **作为指标的水质：** 存在或缺失的物种是水质的生物指标。某些无脊椎动物（淡水虾）的存在表明水质良好；它们的缺失则表明存在污染。学生可以“阅读”生态系统，评估其健康状况。

### 多种认知方式

**科学知识：** 水的化学性质（pH、溶解氧、硝酸盐含量）、物种识别与分类、食物网绘制、生物多样性指数。这些就是课程内容——通过运河来教授，而不是通过教科书来教授。

**历史知识：** 运河建于 18 世纪 90 年代——为什么建在这里？运输的是什么？运河如何影响了当地的发展？它为什么会衰落？工业污染如何影响了水体及周边土地？今天运河的生态状况，是其历史所塑造的结果。

**社区知识：**运河信托组织的志愿者多年来一直监测水质。他们知道哪些河段的生态状况最好，哪里会出现问题，以及哪些干预措施奏效。这就是公民科学——社区成员作为知识持有者。

**体验性知识：**这条运河给人的感觉是什么？当学生们安静地坐在纤道上时，他们会注意到什么？声音、气味、动态。直接的感官体验也是一种认知方式——生态意识始于专注。

**前殖民时期的背景：**在运河建成之前，这条水道是什么样的？这里是否原本有一条后来被渠化的自然溪流？工业开发之前，这片景观是什么样的？谁曾生活在这里，他们与水的关系如何？这些问题承认，运河的历史远不止于工业革命时期。

### 探究设计

**第一阶段——接触场所（第 1 课：实地考察）**

学生们分成小组，带着写字板沿运河纤道行走。他们的任务很简单：观察并记录。
- “在你们 assigned section 的位置安静地坐 5 分钟。写下你看到的所有有生命的事物——植物、动物、昆虫、鸟类。快速画一幅栖息地草图。”
- “运用你的感官：你听到了什么？水看起来是什么样的（颜色、清澈度、流动状态）？你闻到了什么？”
- “你看到了哪些人类活动的证据？（垃圾、道路维护、种植、涂鸦、钓鱼竿插座、狗狗粪便垃圾桶）”

每个小组观察一段不同的 50 米河段。学校会提前获得运河信托组织的许可。

**第二阶段——提出场所问题（第 2 课：回到教室）**

学生们分享自己的观察结果。教师记录下来：“你注意到了什么？”然后问：“这条运河引发了你哪些问题？”

预期问题（必要时加以引导）：
- “为什么有些河段的植物比其他河段多？”
- “水质是否足够清洁，能让鱼类生存？我们该如何查明？”
- “如果运河信托组织停止维护，会发生什么？”
- “社区花园附近的物种更多，还是道路附近的更多？”
- “这里的食物链是什么样的——什么吃什么？”

学生们（以小组为单位）选择自己的探究问题。全班的核心问题仍然是：“我们的运河是一个健康的生态系统吗？”

**第三阶段——开展调查（第 3–6 课）**

*第 3 课——生物调查：*返回运河。在运河信托组织的指导和许可下，学生们使用踢网采样法从水中采集无脊椎动物样本。使用物种识别指南进行鉴定。根据生物水质指数绘制调查结果地图。各小组比较不同河段的结果。

*第 4 课——构建食物网：*利用实地考察获得的物种数据，学生们为各自观察的运河河段构建食物网。识别生产者、初级消费者和次级消费者。讨论：“如果[这个物种]消失了，会发生什么？沿着食物网追踪其影响。”

*第 5 课——人类影响分析：*运河信托组织的嘉宾讲解修复过程。修复前的运河是什么样的？采取了哪些干预措施？哪些措施奏效了，哪些没有？学生们将人类影响（积极和消极的）标注到食物网上：“人类在哪里介入了这个生态系统？”

*第 6 课——历史生态学：* 利用退休地理教师的小册子和历史照片，学生比较今天的运河与 50 年前的运河。当时有哪些物种？发生了哪些变化？生态系统是在恢复、保持稳定，还是仍在衰退？

**阶段 4——整合与分享（第 7–8 课）**

学生完成一份“运河健康报告”——一份回答核心问题“我们的运河是一个健康的生态系统吗？”的集体文档。

每个小组贡献自己的部分：
- 物种调查数据和食物网（科学）
- 水质分析（科学）
- 历史比较（历史/科学）
- 人类影响地图（科学/地理）
- 建议：“怎样才能让运河生态系统更加健康？”

报告将在一次展示活动中与运河保护组织分享。学生向该组织的志愿者和当地议员展示调查结果。运河保护组织可以在自己的报告中使用这些数据。

### 行动维度

**守护：** 学生在本学期认领自己负责的运河河段。每月进行一次捡拾垃圾活动（在监督下进行，每次 30 分钟），并收集数据：“最常见的垃圾类型是什么？它们来自哪里？”

**倡议：** 如果调查发现水质问题，学生就利用自己的数据，给当地议会或供水公司写一封基于证据的信。这是真实的倡议行动，有真实证据作为依据，而不是模拟活动。

**贡献：** 学生将物种调查数据分享给运河保护组织，作为其长期监测工作的一部分。学生成为公民科学家——他们的工作价值超越了课堂本身。

### 社区知识持有者

| 知识持有者 | 他们了解的内容 | 他们的贡献方式 |
|---|---|---|
| 运河保护组织的生态学家 | 水质变化趋势、物种数据、生态修复技术 | 共同带领生物调查，提供历史监测数据以进行比较 |
| 退休地理教师 | 运河历史、历史地图和照片、当地景观变化 | 开展历史生态学客座课程——了解这个地方过去的样子 |
| 当地议员 | 开发提案、规划决策、围绕运河展开的社区政治 | 解释开发与保护之间的矛盾——让学生看到，生态决策同时也是政治决策 |
| 学生自己的家人 | 关于运河的个人记忆——钓鱼、玩耍、散步，或者在运河受到污染时避开那里 | 家庭访谈作业：“询问家里的人，他们记得这条运河什么” |

---

## 已知局限

1. **基于地方的教育需要能够接触地方。** 学生需要亲自前往运河（或当地类似地点）。这需要进行风险评估、取得许可、安排交通并投入时间——所有这些都可能成为障碍，尤其是在户外活动机会有限的学校，或在“自然”空间较少的城市环境中。设计中包含课堂替代方案，但直接体验无法被完全替代。

2. **基于地方的探究比基于教材的教学需要更多时间。** 上述运河探究需要 8 节课——比典型的生态系统单元更长。学生获得的理解更加深入，同时也能在掌握概念知识的过程中培养野外考察技能。但面临课程时间压力的教师可能难以说明投入额外时间的合理性。在时间有限的情况下，进行一次有明确探究重点的实地考察，也能带来部分益处。

3. **尊重多种知识体系需要具备文化能力。** 教师必须能够坦然地邀请社区知识与科学知识并重，并妥善处理不同知识体系可能看似相互冲突的情况。这需要文化敏感性、面对复杂性的意愿，以及理解“不同的认知方式”并非相对主义，而是认识论多元主义。