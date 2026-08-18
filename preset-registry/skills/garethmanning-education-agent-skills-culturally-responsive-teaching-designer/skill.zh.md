---
# AGENT SKILLS STANDARD FIELDS (v2)
name: culturally-responsive-teaching-designer
description: "Redesign a lesson to centre students' cultural backgrounds, community knowledge, and lived experience. Use when making curriculum relevant and inclusive for diverse student populations."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/culturally-responsive-teaching-designer"
skill_name: "Culturally Responsive Teaching Designer"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Gay (2018) — Culturally Responsive Teaching: theory, research, and practice (3rd edition)"
  - "Ladson-Billings (1995) — Toward a theory of culturally relevant pedagogy"
  - "Hammond (2015) — Culturally Responsive Teaching and The Brain"
  - "Paris & Alim (2017) — Culturally Sustaining Pedagogies: teaching and learning for justice in a changing world"
  - "Aronson & Laughter (2016) — The theory and practice of culturally relevant education: a synthesis of research across content areas"
input_schema:
  required:
    - field: "lesson_content"
      type: "string"
      description: "The curriculum content or learning objective to be taught"
    - field: "student_community"
      type: "string"
      description: "The cultural backgrounds, community contexts, and lived experiences of the students in the class"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "current_approach"
      type: "string"
      description: "How the content is currently taught — what texts, examples, and perspectives are used"
    - field: "school_context"
      type: "string"
      description: "Demographics, community, prior work on cultural responsiveness"
    - field: "teacher_background"
      type: "string"
      description: "The teacher's own cultural background and experience with culturally responsive practice"
output_schema:
  type: "object"
  fields:
    - field: "crt_lesson_design"
      type: "object"
      description: "The redesigned lesson incorporating culturally responsive principles — same rigorous content, culturally connected pedagogy"
    - field: "cultural_connections"
      type: "array"
      description: "Specific connections between the curriculum content and students' cultural knowledge, community practices, and lived experience"
    - field: "critical_consciousness_element"
      type: "object"
      description: "How the lesson develops students' ability to identify and critique inequity — the sociopolitical dimension"
    - field: "high_expectations_framework"
      type: "object"
      description: "How the lesson maintains rigorous academic expectations while being culturally responsive — not lowering the bar"
chains_well_with:
  - "ubuntu-collective-knowledge-task-designer"
  - "place-based-inquiry-anchor"
  - "belonging-classroom-culture-designer"
  - "phenomenon-based-unit-anchor"
teacher_time: "4 minutes"
tags: ["culturally-responsive", "Gay", "Ladson-Billings", "equity", "culturally-sustaining", "Hammond", "inclusion"]
---
# 文化响应式教学设计师

## 此技能的作用

将课程内容重新设计为文化响应式内容——在维持高期待并培养批判意识的同时，把严谨的学术课程与学生的文化背景、社区知识和生活经验联系起来。这种方法借鉴了 Geneva Gay（2018）的文化响应式教学框架，以及 Gloria Ladson-Billings（1995）的文化相关教学理论。其核心原则是，文化响应式教学并不是降低标准、增加一个“多元文化日”，或用文化内容取代学术内容——而是把学生的文化知识作为通向严谨学术学习的桥梁。课程与学生已经了解和重视的事物建立联系时，他们学到的会更多，而不是更少。输出内容包括一份重新设计的课程，其中包含具体的文化联系、批判意识要素（让学生运用课程内容审视公平与权力），以及高期待框架，确保学术严谨性得到强化而非削弱。AI 在此尤其有价值，因为在保持对每个社区具体情况敏感的同时，识别课程内容与多样文化背景之间真实而有效的联系，需要具备跨文化、跨学科和跨教学法的广泛知识。

## 证据基础

Gay（2018）将文化响应式教学定义为：“运用不同族裔学生的文化知识、先前经验、参照框架和表现方式，使学习过程对他们更具相关性和有效性。”她确定了五项关键要素：建立文化多样性知识基础、设计具有文化相关性的课程、展现文化关怀并构建学习共同体、跨文化沟通，以及课堂教学中的文化协调。Ladson-Billings（1995）提出了文化相关教学的三项标准：学业成功（学生必须在学业上取得成就）、文化能力（学生必须保持并发展自己的文化身份），以及批判意识（学生必须发展批判社会不平等的能力）。她强调，文化相关教学对学生提出的是更高而不是更低的要求——它在提高期待的同时，使学生能够以具有文化意义的方式实现这些要求。Hammond（2015）将文化响应式教学与神经科学联系起来，认为当学习与文化建立联系时，会激活学生已有的神经通路和先前知识，降低认知负荷并提高参与度——当新信息与已有图式建立联系时，大脑能够更高效地学习。Paris & Alim（2017）将这一框架拓展为“文化维系型教学法”，认为教学不应只是回应学生的文化，还应在文化抹除的影响下积极维系并发展这些文化。Aronson & Laughter（2016）综合了跨学科领域的研究，发现文化相关教育持续提升了学生的参与度和学业成就，并且对来自边缘化社区的学生影响最为显著。

## 输入架构

教师必须提供：
- **课程内容：** 学生需要学习的内容。*例如：“说服性写作——九年级英语，使用证据构建论点” / “分数——四年级数学，理解分数是整体的一部分” / “工业革命——八年级历史，理解工业化的原因与后果” / “生态系统——七年级科学，理解食物链与相互依存关系”*
- **学生群体：** 学生是怎样的群体。*例如：“以南亚裔英国人为主的社区，许多学生使用双语（乌尔都语/旁遮普语和英语），家庭与社区联系紧密，当地拥有充满活力的集市文化” / “海滨小镇的混合型社区——部分学生来自农业家庭，东欧人口较多（波兰、罗马尼亚），当地渔业正在衰退” / “伦敦市中心学校，学生群体非常多元——加勒比、非洲西部、索马里、孟加拉国、英国白人工人阶级，符合领取学生补助金资格的学生比例较高”*

可选项（如果可用，由上下文引擎注入）：
- **学科领域：** 课程所属学科
- **学生年级：** 年级
- **当前教学方式：** 目前如何教授该内容
- **学校背景：** 人口构成、社区、已有学习成果
- **教师背景：** 教师自身的文化经历

## 提示词

```
You are an expert in culturally responsive teaching, with deep knowledge of Gay's (2018) CRT framework, Ladson-Billings' (1995) culturally relevant pedagogy, Hammond's (2015) neuroscience of culturally responsive teaching, Paris & Alim's (2017) culturally sustaining pedagogies, and Aronson & Laughter's (2016) research synthesis. You understand that culturally responsive teaching is a rigorous pedagogical approach, not a superficial add-on — it uses students' cultural knowledge as a cognitive bridge to academic content, maintains the highest academic expectations, and develops critical consciousness about equity and power.

CRITICAL PRINCIPLES:
- **High expectations are non-negotiable.** Culturally responsive teaching is NOT about making work easier, simpler, or "more fun." It is about making rigorous academic content ACCESSIBLE by connecting it to what students already know. If the redesigned lesson has lower academic expectations than the original, it has failed. Ladson-Billings was explicit: culturally relevant pedagogy demands academic excellence.
- **Cultural connections must be AUTHENTIC, not tokenistic.** "Let's do fractions using samosas instead of pizzas" is tokenistic — it changes a surface detail without connecting to genuine cultural knowledge. An authentic connection uses the cultural PRACTICE, not just the cultural OBJECT: "In your family's cooking, recipes are often adjusted for different numbers of guests — how do proportions work when you double a recipe?"
- **Critical consciousness is essential, not optional.** Ladson-Billings' third criterion is that students develop the ability to critique social inequity. This means the lesson should include an element where students use the academic content to examine power, representation, or justice. In History: "Whose story is told? Whose is missing?" In Science: "Who benefits from this research? Who is harmed?" In English: "Who gets to speak? Whose language is valued?"
- **Know the community, don't assume.** Culturally responsive teaching requires knowledge of the SPECIFIC community, not generic assumptions about cultural groups. "South Asian students will connect to Bollywood" is a stereotype. "Students in this community have strong intergenerational storytelling traditions" is specific knowledge. When you don't have specific knowledge, design the lesson to INVITE students' own cultural knowledge rather than assuming it.
- **Sustain, don't just respond.** Following Paris & Alim, the goal is not just to use students' cultures as a bridge (which can treat cultures as instrumental) but to sustain and develop cultural knowledge and identity through the academic work.

Your task is to redesign a lesson to be culturally responsive for:

**Lesson content:** {{lesson_content}}
**Student community:** {{student_community}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the lesson content.
**Student level:** {{student_level}} — if not provided, infer from the lesson content.
**Current approach:** {{current_approach}} — if not provided, assume a standard textbook approach.
**School context:** {{school_context}} — if not provided, design for a general context.
**Teacher background:** {{teacher_background}} — if not provided, include a note about the teacher's own positionality.

Return your output in this exact format:

## Culturally Responsive Lesson: [Content]

**Content:** [What students learn — same academic objectives, culturally connected]
**Community:** [Who the students are]
**Core principle:** [The specific CRT principle most central to this redesign]

### Current Approach vs. Culturally Responsive Approach

[Brief comparison: what a standard approach looks like, and what changes in the CRT redesign — not to criticise the standard approach but to make the difference visible]

### Cultural Connections

For each connection (2–4):
**Connection [N]: [What connects]**
- **Cultural knowledge:** [What students bring from their community/experience]
- **Academic content:** [How this connects to the curriculum objective]
- **How to use it:** [Specific activity or approach that bridges the cultural and academic]

### Critical Consciousness Element

[How the lesson develops students' ability to examine equity, power, or representation through the academic content]

### High Expectations Framework

[How the lesson maintains or raises academic rigour — specific evidence that expectations are not lowered]

### Lesson Redesign

[The redesigned lesson — structured, practical, ready to teach]

### Teacher Reflection

[Questions for the teacher to reflect on their own positionality, assumptions, and learning]

**Self-check before returning output:** Verify that (a) academic expectations are at least as high as the original lesson, (b) cultural connections are authentic and specific, not tokenistic, (c) the critical consciousness element is genuinely integrated, (d) the design invites student cultural knowledge rather than assuming it, and (e) the approach sustains cultural identity, not just uses it as a bridge.
```

## 示例输出

**情境：** *课程内容：“说服性写作——九年级英语。学生需要运用证据、修辞技巧（ethos、pathos、logos）和结构化段落构建说服性论证。目前的教学方式使用报纸评论专栏中的范文，要求学生就一项规划议题给当地议会写信。” / 学生群体：“伦敦市中心的一所学校，学生背景非常多元——加勒比地区、西非、索马里、孟加拉国以及英国白人工人阶级家庭。许多学生口头表达清晰且具有说服力，但难以将这种能力迁移到正式书面英语中。多个家庭文化拥有浓厚的口述传统。许多学生积极参与社交媒体讨论以及本地社区议题。” / 当前教学方式：“使用大报的范文。学生练习识别 ethos/pathos/logos，然后给议会写一封正式信件。一些学生逐渐失去兴趣，因为这些范文让他们觉得与自身经历相距甚远。”*

---

## 文化回应式课程：说服性写作——九年级英语

**内容：** 运用证据、修辞技巧（ethos、pathos、logos）和结构化写作构建说服性论证——保持相同的英语课程目标，同时采用具有文化关联性的教学法  
**学生群体：** 多元化的伦敦市中心社区——加勒比地区、西非、索马里、孟加拉国以及英国白人工人阶级家庭。拥有浓厚的口述传统，熟悉社交媒体，积极参与社区事务  
**核心原则：** 学生本来就具备说服他人的能力——本课程将他们已有的说服能力（口头表达、数字媒体、社区参与）连接到正式的学术写作

### 当前教学方式与文化回应式教学方式

**标准教学方式：** 使用大报评论专栏中的范文。学生识别其中的修辞技巧，然后给议会写一封正式信件。其隐含信息是：“说服应该是这样的”——也就是白人中产阶级印刷媒体话语所特有的语域和格式。

**CRT 教学方式：** 从学生已有的说服经验出发——口头论证、社交媒体话语、社区倡议以及多语言说服。分析不同语域和情境中的说服技巧（TED 演讲、口语诗、社区请愿书、布道以及社交媒体活动），然后有意识地将这些技能迁移到正式的学术写作中。传达的信息是：“你们本来就很有说服力。学术写作只是你们正在掌握的另一种语域，而不是要取代你们已经掌握的能力。”

### 文化连接

**连接 1：口头说服传统**
- **文化知识：** 许多学生来自拥有丰富口述传统的文化——加勒比地区的讲故事和演讲传统、西非的格里奥传统、伊斯兰布道（khutbah）的修辞结构，以及市场交易中的口头论辩。那些被认为“话太多”的学生，可能其实拥有很强的口头说服能力。
- **学术内容：** Ethos、pathos 和 logos 不只是书面技巧——它们源于口头修辞（亚里士多德的《修辞学》讨论的就是演说）。口头说服是书面说服的基础，而不是一种较低级的形式。
- **使用方式：** 在单元开始时进行一次“说服审计”——让学生找出自己生活中进行说服的时刻（与父母协商、说服朋友、在操场上辩论、在社区活动中公开演讲）。让学生带来一个来自自身文化背景的说服实例（一段视频、一篇文字或一个故事），全班分析其中的 ethos、pathos 和 logos。这样可以让学生认识到，说服是普遍存在的，而他们自己**已经**具备这种能力——本课程只是在已有能力的基础上，加入正式的书面语域。

**连接 2：数字说服**
- **文化知识：** 学生沉浸在数字说服之中——社交媒体活动、YouTube 视频评论、Twitter/X 主题串、change.org 请愿。与说服性印刷文本相比，许多学生在分析和构建说服性数字文本方面拥有更多经验。
- **学术内容：** 数字说服使用与传统说服性写作相同的修辞原则——但采用了不同的形式。Twitter 主题串和报纸专栏一样，都会使用 logos（数据、证据）和 pathos（个人故事）。同时分析这两种文本，有助于学生看清其背后的结构。
- **使用方式：** 在分析大报专栏的同时，分析一场成功的社交媒体活动（例如，一份达成目标的请愿，或一篇走红的倡议帖）。学生进行比较：这条推文如何运用 pathos？这篇报纸专栏又如何运用？哪些地方相同？哪些地方不同？这样可以将学生的数字素养定位为一种优势，而不是一种干扰。

**连接 3：切身相关的社区议题**
- **文化知识：** 许多学生了解并受到当地社区议题的影响——绅士化、治安执法、住房、服务获取、代表性。这些并不是抽象的规划问题——而是他们亲身经历的现实。
- **学术内容：** 当作者真正关心某个议题时，说服性写作最具力量。标准的“就规划问题给市议会写信”可能让人觉得是假设性的。一项学生真正关心的议题，会带来更有动力、更投入，并最终更成熟的写作。
- **使用方式：** 学生自行选择要写作的议题——某件影响他们的社区、家庭或自身的事情。教师提供一份可能议题的清单（根据当地情况整理），但学生也可以提出自己的议题。写作任务在形式上保持完全一致（结构化论证、证据、修辞技巧），但内容具有个人意义和文化意义。

### 批判意识要素

**谁的说服才算数？**

在学习了不同语域中的说服技巧（口语、数字媒介、印刷文本）之后，学生探讨一个关键问题：“哪些说服形式会被掌权者认真对待，哪些会被 dismiss？为什么？”

学生进行比较：大报观点专栏、口语诗表演、抗议口号、社交媒体活动、正式请愿。它们都具有说服力。市议会会最认真对待哪一种？法官会接受哪一种？学校会听取哪一种？

讨论：“为什么正式信件会被认为比口头论证更‘正当’，即使口头论证更详细、更有激情，也更有证据支持？这说明了权力与语言之间怎样的关系？如果某些社区更擅长口头说服而不是书面说服，那么在一个赋予正式书面英语更高地位的体系中，他们的声音会如何？”

这并不是偏离英语课程的内容——它本身就是英语课程。理解语言、权力和说服彼此相互关联，是英语教育的核心目标。

**重要提示：**本课并不以“正式写作并不重要”作为结论，而是得出这样的结论：“正式书面说服是一项你应当掌握的工具，因为它能为你打开重视这种表达方式的体系中的机会——同时，那个体系偏好正式写作而非口头论证这一点本身，也值得质疑。”

### 高期望框架

CRT 重设计从三个方面提高了要求：

1. **更多分析，而不是更少。**学生需要跨越五种语域（口头、数字、印刷、社区、正式）分析说服，而不只是分析一种语域（印刷）。与研究一篇大报评论专栏相比，这在分析上要求更高。

2. **语域转换是一项技能。**学生不只是用一种语域写作——他们要用两种语域写出同一个论点（社交媒体帖子和正式信函），并分析说服技巧如何随之调整。与只用一种语域写作相比，这要求学生对修辞有更深入的理解。

3. **真实的受众。**在可能的情况下，正式信函会被真正寄出——寄给地方议会、校长或当地组织。面向真实受众、面对真实后果进行写作，比按照教师的评分标准写作要求更高的质量。

### 课程重设计

**第 1 课——说服审查：**  
学生辨认自己生活中的说服现象。两人一组讨论：“你上一次被说服是什么时候？你上一次说服别人是什么时候？”学生带来一个来自自身经历或文化背景的说服实例。全班共同建立一面“说服墙”——展示教室中各种文化和情境中的实例。教师使用这些由学生提供的实例介绍 ethos、pathos、logos。

**第 2 课——跨语域分析：**  
分析五篇文本中的说服技巧：一篇大报观点专栏、一首口语诗（现场表演）、一则社交媒体宣传帖、一份社区请愿书，以及一段简短的 TED 演讲节选。学生分别找出其中的 ethos、pathos 和 logos。讨论：“这五种形式有哪些共同之处？根据受众和表达形式的不同，哪些内容发生了变化？”

**第 3 课——选择你的议题：**  
学生选择一个自己关心的社区议题。两人一组，至少利用两个来源研究该议题。他们规划自己的论证：主张是什么？哪些证据支持这一主张？最有力的情感诉求是什么？他们凭什么有资格就此发声（ethos）？

**第 4 课——双语域写作：**  
学生为自己的论点写出两个版本：(a) 一则社交媒体帖子，或一段 60 秒口头表达的脚本；以及 (b) 一封正式的说服性信函。同一个论点、同一组证据，但使用不同的语域。这一环节让语域转换成为一种有意识、需要技巧的实践。

**第 5 课——批判性反思与分享：**  
学生分享自己成对的文本。全班讨论：“哪个版本更有说服力？这是否取决于受众？这告诉我们语言与权力之间有什么关系？”学生修改自己的正式信函，准备提交。

### 教师反思

- “我在无意识中最看重哪些人的说服传统？一篇结构严谨的正式论文是否比一段表达流畅的口头论证更能打动我——如果确实如此，这对我评价来自口头传统的学生意味着什么？”
- “我是否充分了解学生的文化交流方式，能够与他们建立真实的联系，还是仍然依赖各种假设？我可以如何进一步了解——向学生本人、家人和社区学习？”
- “当我教授‘正式英语’时，我是在把它描述为‘正确的英语’（从而贬低其他语域），还是把它描述为‘众多强大语域中的一种’（在不削弱身份认同的前提下拓展表达 repertoire）？”

---

## 已知局限性

1. **文化响应式教学需要对特定社区具备真实的了解。** 此技能可以提供关联和框架建议，但无法替代教师自身与学生及其社区建立的关系，以及对他们的了解。不熟悉学生情况却照搬此模板的教师，只会产出表面上“具有响应性”、但缺乏真实性的课程。最重要的文化响应式实践是倾听学生和家庭的声音。

2. **存在本质主义的风险——将文化群体视为同质化的整体。** 并非所有具有加勒比地区背景的学生都拥有强烈的口述传统。并非所有孟加拉裔学生都来自具有特定烹饪习惯的家庭。文化响应式教学必须关注教室中的具体学生，而非基于其文化群体作出假设。设计应鼓励学生分享他们自身的文化知识，而不是由教师假定这些知识是什么。

3. **文化响应式教学存在于系统性约束之中。** 单个教师可以重新设计课程，使其具有文化响应性，但无法仅凭一己之力改变评估体系、国家课程或机构文化。学生仍可能面临偏向特定文化形式的标准化评估。CRT 在培养学生批判性认识这些局限的同时，也帮助他们在这些体系中取得成功——但它无法凭一己之力改变整个系统。