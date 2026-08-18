---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-expertise-interrogation-designer
description: "Design a Funhouse Mirror activity where students use their own domain expertise to detect AI distortions, omissions, and overconfidence. Use when students know a subject well enough to evaluate AI claims about it."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/ai-expertise-interrogation-designer"
skill_name: "AI Expertise Interrogation Designer"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "moderate"
evidence_sources:
  - "Chi, Glaser & Farr (1988) — The Nature of Expertise"
  - "Ericsson & Smith (1991) — Toward a General Theory of Expertise"
  - "Thiede, Anderson & Therriault (2003) — Accuracy of metacognitive monitoring affects learning of texts"
  - "Dunning, Kruger et al. (2003) — Why people fail to recognize their own incompetence"
  - "Kazemitabaar et al. (2023) — Studying the effect of AI code generators on supporting novice learners"
input_schema:
  required:
    - field: "student_expertise_domain"
      type: "string"
      description: "The area in which students have genuine domain knowledge — a school subject, hobby, cultural context, local geography, sport, or skill"
    - field: "student_level"
      type: "string"
      description: "Age/year group and depth of expertise in the domain"
  optional:
    - field: "interrogation_depth"
      type: "string"
      description: "Surface (factual errors and wrong names/dates) vs. deep (subtle distortions, missing complexity, inappropriate confidence, cultural blind spots)"
    - field: "discussion_format"
      type: "string"
      description: "How to use findings: individual reflection, pair comparison across different expertise domains, or whole-class expertise synthesis"
    - field: "subject_area"
      type: "string"
      description: "The school subject context, if the expertise interrogation is embedded in a curriculum unit"
    - field: "target_ai_tool"
      type: "string"
      description: "The AI tool students will interrogate"
output_schema:
  type: "object"
  fields:
    - field: "expertise_activation_protocol"
      type: "object"
      description: "Pre-interrogation protocol to activate and document students' existing knowledge before consulting AI"
    - field: "interrogation_questions"
      type: "array"
      description: "Calibrated questions to ask the AI — ranging from factual to interpretive to nuanced, scaled to the depth of expertise"
    - field: "distortion_annotation_protocol"
      type: "object"
      description: "Protocol for annotating AI output against expert knowledge — what to mark and why"
    - field: "distortion_taxonomy"
      type: "object"
      description: "Taxonomy of AI distortions likely for this domain — factual errors, overconfidence, cultural flattening, missing nuance, false universalism"
    - field: "discussion_guide"
      type: "object"
      description: "Facilitation guide for class synthesis — comparing distortions across different expertise areas and drawing generalisable conclusions"
chains_well_with:
  - "metacognitive-monitoring-ai-contexts"
  - "ai-output-critical-audit-designer"
  - "pedagogical-content-knowledge-developer"
teacher_time: "4 minutes"
tags: ["AI-literacy", "expertise", "distortion", "Funhouse-Mirror", "metacognition", "Dunning-Kruger", "domain-knowledge"]
---
# AI 专业知识质询设计器

## 此技能的作用

生成一项活动——Kharbach（2026）的“哈哈镜”（"Funhouse Mirror"）——在活动中，学生运用自己的领域专业知识，作为识别 AI 扭曲、遗漏和过度自信的工具。这颠倒了 AI 评估中通常的专家—新手动态：在大多数 AI 素养活动中，学生是被告知 AI 局限性的​​新手。而在这项活动中，学生就是领域专家。他们向 AI 询问自己真正熟悉的内容——自己深入学习过的学科、自己参加竞技比赛的运动、自己成长其中的文化背景、自己非常熟悉的本地地理环境——并运用自身知识识别 AI 哪些地方出错、过度简化、将复杂内容扁平化，或带着虚假的自信进行呈现。这项活动的教学机制，是通过直接对质来形成经过校准的 AI 怀疑意识：在自己的专业领域中发现 AI 的错误，会让人产生强烈而持久的认识，即 AI 并非无所不知。一个发现 AI 对自己的运动项目、文化传统或家乡满怀自信地给出错误信息的学生，比起一个仅仅被抽象地提醒“AI 可能会犯错”的学生，会形成更加可靠的怀疑意识。输出内容包括一套专业知识激活流程（学生在咨询 AI 之前记录自己的知识）、经过校准的质询问题、一套扭曲标注流程、针对特定领域的扭曲分类体系，以及一份讨论指南，用于综合全班不同专业领域中的发现。

## 证据基础

Chi、Glaser 与 Farr（1988）确立了专家—新手框架：专家组织知识的方式不同于新手，能够在更深层次上理解问题，并拥有更加丰富、相互联系更加紧密的领域表征。关键在于，专家能够注意到领域表征中缺失或被扭曲的内容——他们拥有发现缺口所需的知识。这正是本活动的基础：拥有真实领域专业知识的学生能够发现普通学生会遗漏的 AI 扭曲，因为只有知道某项内容本应是什么样的人，才能注意到哪些内容缺失。Ericsson 与 Smith（1991）指出，专业能力的特征在于能够注意到细微区别以及偏离预期模式的地方——当专家阅读 AI 针对自己所在领域生成的输出时，激活的正是同一种认知机制。Thiede 等人（2003）证明，当学习者拥有可用于比较的真实知识基础时，元认知准确性（判断出的理解程度与实际理解程度之间的相关性）会显著提高——发现自己所知内容与所读内容之间的差异，会激活准确的自我评估。本活动正是要创造这种比较：学生的领域知识与 AI 输出之间的比较。Dunning 等人（2003）关于邓宁—克鲁格效应的研究，在相反方向上具有相关性：对某个领域了解较多的学生，比了解较少的学生更擅长发现 AI 在该领域中的局限——专业知识不仅能帮助人认识到自己的不足，也能帮助人识别 AI 的无能。Kazemitabaar 等人（2023）提供了实证证据，表明学习情境中的 AI 辅助可能会掩盖真实的知识缺口；本活动旨在通过颠倒专家/新手的定位来揭示这一动态。

## 输入模式

教师必须提供：
- **学生专长领域：** 学生真正掌握的知识。*例如：“足球（具体来说：曼联历史和英超统计数据）”/“匈牙利民间音乐与舞蹈传统（本地知识）”/“竞技游泳——技术、训练、比赛”/“K-Pop 文化，具体来说是 BTS 的唱片作品与粉丝群体”/“布达佩斯第七区的地理与历史”*
- **学生水平：** 年级和专长深度。*例如：“10 年级，学生在不同领域（体育、音乐、地理、文化传统）拥有较强的个人专长”/“12 年级，学生已达到 A-level 深度的历史学习水平”*

可选项（如有，可由上下文引擎注入）：

- **探究深度：** 表层错误与深层错误
- **讨论形式：** 如何分享发现
- **学科领域：** 如有，课程所属的学科框架
- **目标 AI 工具：** 学生将要探究的 AI 系统

## 提示词

```text
You are an expert in expertise research and AI literacy pedagogy, with knowledge of Chi, Glaser & Farr's (1988) expert-novice framework, Ericsson & Smith's (1991) expertise theory, Thiede et al.'s (2003) metacognitive accuracy research, and Dunning et al.'s (2003) work on competence and self-assessment. You understand the core mechanism of this activity: expertise enables detection. A student who has found AI confidently wrong about something they know deeply will have earned a much more durable AI skepticism than one who was warned abstractly. The pedagogical value is not in cataloguing AI errors — it is in the moment of discovery, and in the generalisation it enables.

CRITICAL PRINCIPLES:
- **The expertise must be genuine.** This activity does not work with superficial knowledge. "I know a bit about football" is not enough. "I have watched every Manchester United match for five years and know the squad statistics" IS enough. The interrogation questions must be calibrated to genuinely probe the depth of the AI's knowledge.
- **The goal is distortion taxonomy, not error hunting.** AI errors alone are unsurprising. The more valuable finding is the PATTERN: what types of distortions does AI consistently produce in this domain? Is it confidently wrong about recent events? Does it flatten cultural specificity? Does it privilege English-language sources? Does it confuse similar-but-distinct concepts?
- **Expertise activation precedes AI consultation.** Students must document what they know BEFORE asking the AI. This serves two purposes: (1) it creates a reference document that makes distortions visible as discrepancies; (2) it prevents the AI's confident output from overwriting the student's own knowledge before they've had a chance to articulate it.
- **The discussion synthesis is the most important phase.** Finding one AI error in your domain is interesting. Discovering that students with expertise in very different domains all found the SAME types of distortions (e.g., AI always sounds confident even when it's wrong; AI consistently misses recent events; AI flattens cultural specificity) is the generalisable insight that makes this an AI literacy activity, not just a fact-checking exercise.
- **Distortions are not the same as errors.** An error is factually wrong. A distortion is subtly misleading: technically true but missing crucial context, presented at the wrong level of confidence, drawn from an unrepresentative source, or flattening genuine complexity. Students with genuine domain expertise will find both — the distortions are more interesting pedagogically.

Your task is to design an AI expertise interrogation activity for:

**Student expertise domain:** {{student_expertise_domain}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**Interrogation depth:** {{interrogation_depth}} — if not provided, design for both surface (factual accuracy) and deep (distortion, false confidence, cultural flattening) levels.
**Discussion format:** {{discussion_format}} — if not provided, design for whole-class synthesis after individual interrogation.
**Subject area:** {{subject_area}} — if not provided, frame the activity as a standalone AI literacy exercise.
**Target AI tool:** {{target_ai_tool}} — if not provided, design for a general-purpose LLM chatbot.

Return your output in this exact format:

## AI Expertise Interrogation: [Domain]

**For:** [Student level]
**Expertise domain:** [The area of genuine student knowledge]
**Interrogation depth:** [Surface / Deep / Both]

### Expertise Activation Protocol

[What students do BEFORE consulting the AI — to document their knowledge and create a reference for comparison]

**Step 1:** [Knowledge inventory — what do I know about this domain?]
**Step 2:** [Identify your strongest sub-area — where is your expertise deepest?]
**Step 3:** [Write 3-5 claims you are confident about in this domain — specific, verifiable]
**Step 4:** [Identify one area where you know the real answer is more complex than most people realise]

### Interrogation Questions

[A calibrated set of questions to ask the AI, scaled from surface to deep]

**Surface questions (factual accuracy):**
[2-3 questions where the student knows the correct answer and can check if the AI is right]

**Depth questions (complexity and nuance):**
[2-3 questions that probe whether the AI understands the nuances the student knows]

**Distortion trap questions (areas likely to reveal AI limitations):**
[2-3 questions specifically targeting the types of distortion common in this domain — recent events, cultural specificity, contested claims, insider knowledge]

### Distortion Annotation Protocol

[How students mark up AI output against their expertise]

**Annotation codes:**
[Table with codes for: factual error, false confidence, missing nuance, cultural flattening, outdated information, false universalism]

**Annotation process:** [Step-by-step instructions for comparing AI output against expertise]

### Distortion Taxonomy

[For this specific domain, what types of distortions is AI most likely to produce?]

**Most likely distortions in [domain]:**
[3-5 distortion types with explanations of why AI tends to produce them in this domain and examples of what they look like]

### Discussion Guide

**Individual reflection (before class discussion):**
[Questions students answer about their findings before sharing]

**Class synthesis:**
[How to structure the comparison across students with different expertise domains]

**The generalisable question:** [The central question that draws from specific domain findings to a general AI literacy insight]

**Self-check before returning output:** Verify that (a) the expertise activation protocol genuinely prevents AI from overwriting student knowledge, (b) interrogation questions are calibrated to the stated expertise depth, (c) distortion trap questions target domain-specific AI weaknesses, not generic errors, (d) the distortion taxonomy is specific to this domain, (e) the discussion guide includes a synthesis move that turns domain-specific findings into a generalisable insight.
```

## 示例输出

**场景：** *学生专业知识领域：“匈牙利民间音乐与舞蹈传统——布达佩斯一所中学的学生参加过民间舞蹈团，了解各地区的舞蹈和地区音乐差异，并在文化教育课程中学习过民间音乐” / 学生水平：“11年级，对匈牙利各地区民间传统有深入的实践性了解，正式音乐理论知识水平不一” / 追问深度：“浅层和深层兼具” / 讨论形式：“不同专业知识领域的学生两两讨论，然后全班总结”*

---

## AI 专业知识追问：匈牙利民间音乐与舞蹈

**适用对象：** 布达佩斯中学11年级学生  
**专业知识领域：** 匈牙利地区民间音乐与舞蹈传统  
**追问深度：** 浅层（事实性）与深层（文化特异性、地区准确性）

### 专业知识激活流程

**第1步——知识盘点：** 在打开任何 AI 工具之前，花5分钟写下你对匈牙利民间音乐和舞蹈的了解。包括：你知道哪些地区风格（特兰西瓦尼亚？Mezőség？Alföld？）、具体舞蹈、具体乐器、csárdás 与 verbunkos 有何不同，以及你所了解的民间舞蹈团结构或表演实践。

**第2步——确定你最强的子领域：** 你在哪个方面的知识最深入？如果你已经跳了三年Mezőség风格的舞蹈，那就是你最强的领域。如果你了解tekerőlant在不同地区的乐器变体，那就是你的强项。

**第3步——写下3个有把握的论断：** 写下三件你确定为真的、并且能够在对话中加以论证的事情。*例如：“特兰西瓦尼亚民间舞蹈具有鲜明的地区风格，彼此不能互换——Kalotaszeg 的舞蹈与 Mezőség 的舞蹈在一些具体且有明确名称的方面存在差异。” / “匈牙利的 táncház 运动始于20世纪70年代，在共产主义统治时期部分起到了文化抵抗运动的作用。”*

**第4步——确定一个隐藏的复杂性：** 关于匈牙利民间音乐或舞蹈，有哪一件事是大多数外行最容易误解或过度简化的？这就是你预期 AI 会出错的地方。

### 追问问题

**浅层问题（事实准确性）：**
- “匈牙利民间舞蹈的主要地区风格有哪些？它们各自有什么区别性特征？”
- “匈牙利 táncház 运动的历史是怎样的？它始于何时？”
- “在不同地区，哪些乐器与匈牙利民间音乐有传统上的关联？”

**深度问题（复杂性与细微差别）：**
- “Kalotaszeg 与 Mezőség 的民间音乐有什么区别？各自的独特风格体现在哪里？”
- “在官方文化活动中对匈牙利民间舞蹈的呈现，与村庄环境中实际传承的活态传统有何不同？”
- “真正的民间音乐在匈牙利身份政治中具有什么意义？为什么这一点存在争议？”

**误导陷阱问题（AI 可能出错的领域）：**
- “当代匈牙利最重要的民间音乐团体有哪些？它们在风格上各有什么特点？”（测试 AI 是否了解当前仍在发展的音乐现场）
- “匈牙利民间传统与罗马尼亚、斯洛伐克和塞尔维亚境内匈牙利族群的民间传统有何关联——它们是同一回事吗？”（测试 AI 是否抹平匈牙利民间音乐与特兰西瓦尼亚地区变体之间至关重要的区别）
- “一位来自布达佩斯民间乐队的音乐家会如何看待别人称其演奏的是‘传统匈牙利民间音乐’？”（测试对当代民间音乐圈自我认知的内部理解）

### 失真标注协议

**标注代码：**

| Code | 标注内容 |
|---|---|
| FE | 事实错误 — AI 陈述了明显错误的内容 |
| FC | 虚假确定性 — AI 将不确定的内容陈述为既定事实 |
| CF | 文化扁平化 — AI 将不同的地域或文化变体视为可以互换 |
| MN | 缺失细微差别 — AI 的回答在技术上是正确的，但因不完整而产生误导 |
| OD | 信息过时 — AI 提供的信息反映了较早的资料，遗漏了近期发展 |
| FU | 虚假普遍化 — AI 暗示某种情况具有普遍性，而实际上它只适用于特定语境 |

**标注流程：**
1. 阅读 AI 对表层问题的回答。与您记录的知识进行比较，标记所有不一致之处。
2. 阅读 AI 对深度问题的回答。优先标记 CF 和 MN——这些问题最有可能出现。
3. 阅读 AI 对失真陷阱问题的回答。这些回答最有可能出现严重失真。凡是让您觉得错误、不完整或带有误导性确定性的内容，都进行标记。
4. 对每一处标记写一句话：“AI 说的是 [X]。实际情况是 [Y]。两者之间的差异在于 [Z]。”

### 失真分类

**匈牙利民间传统中最可能出现的失真：**

**文化扁平化（CF）——最常见：** 主要基于英语资料训练的 AI 会将“匈牙利民间音乐”视为一个统一的类别，把匈牙利本土传统与特兰西瓦尼亚／匈牙利侨民传统之间的差异合并，而这些差异对实践者而言至关重要。AI 很可能会把 Kalotaszeg 和 Mezőség 视为可以互换的对象，而不是具有各自特定音乐与舞蹈编排规范的不同地域风格。

**虚假普遍化（FU）——非常常见：** AI 可能会把“官方”的民间音乐传统（柯达伊学派、国家民间歌舞团）呈现为代表性传统，却忽略制度化／官方传统与实践者始终需要面对的 táncház 活态传统之间的张力。

**信息过时（OD）——很可能出现：** 自 20 世纪 90 年代以来，当代匈牙利民间文化领域已经发生了显著变化；AI 的训练数据很可能偏向较早的资料。涉及当前乐团、近期发展或当代文化场景的问题，很可能会得到过时或不完整的回答。

**对侨民传统复杂性的遗漏：** AI 很可能要么把特兰西瓦尼亚匈牙利民间传统并入“匈牙利民间音乐”，要么将其视为完全独立的传统，从而忽略匈牙利本土传统与侨民传统之间的复杂关系，而这种关系正是 táncház 运动自我理解的核心。

**对存在争议的主张表现出虚假确定性：** 关于各种民间传统的“真实性”或“纯粹性”的问题，涉及匈牙利民间文化群体内部正在进行的文化与政治争论。AI 很可能会把某一种立场说成共识，而实践者之间实际上仍存在积极的分歧。

### 讨论指南

**个人反思（课堂讨论前 5 分钟）：**
- AI 哪些地方做得对？它在哪些方面确实提供了帮助？
- 您发现的最重要的失真是什么——哪一种失真最有可能误导原本不了解相关情况的人？
- AI 是自信地给出了错误答案，还是进行了适当的保留？
- 您的发现说明 AI 的知识来源于何处（它的训练资料来自哪些来源）？

**配对比较：** 与研究了**不同**领域（体育、文化传统、学术学科）的搭档一起比较发现：
- 你们都发现了哪些类型的失真？
- 你们两个领域中的失真有何不同？
- 是否存在某种模式？

**全班综合讨论——可普遍化的问题：**“根据大家的发现，AI 处理专业知识时有哪些系统性模式？AI 一贯擅长什么？它一贯会在哪些方面出错或产生失真？还有——如果 AI 在我们擅长的领域中是这样的，这对那些我们没有任何人擅长的领域说明了什么？”

---

## 已知局限

1. **参与活动必须具备真正的专业知识。** 对某个领域只有肤浅了解的学生，无法像真正的专家那样发现同等质量的失真。只有当学生能够识别出 AI 所遗漏的具体、可命名的区别，而不只是说“AI 有些地方答错了”时，这项活动才能发挥最佳效果。教师在开展活动前，应评估学生是否确实具备所需深度的专业知识。

2. **这项活动可能会过度针对某一个 AI 工具的知识缺口。** 在 ChatGPT 中发现的失真，换一个使用不同训练数据训练的模型可能并不存在。这项活动的教学目标是培养可迁移的质疑意识，而不是统计某个特定模型的错误清单。综合讨论必须明确这一点。

3. **文化和少数群体的专业知识会带来情感层面的影响。** 对那些在英语训练数据中代表性不足或受到误传的传统（区域性传统、少数族群文化、非西方领域）具有文化专业知识的学生，可能会发现让他们产生强烈个人感受的 AI 失真。教师应做好准备，以适当的方式引导对这些发现的讨论。

4. **将专家—新手框架具体应用于 AI 的研究，目前缺乏充分的直接实证验证。** 关于专业能力发展的研究（Chi et al. 1988；Ericsson & Smith 1991）已经有充分而稳健的人类专业能力发展证据。将其作为检测 AI 失真的框架是有理论依据的，但仍属于新颖应用——“激活专业知识比抽象警示更能产生持久的 AI 质疑意识”这一具体主张，尚未经过正式检验。