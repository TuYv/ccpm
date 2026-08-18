---
# AGENT SKILLS STANDARD FIELDS (v2)
name: cross-cultural-task-validity-checker
description: "Check an educational practice or task for cultural bias, WEIRD assumptions, and cross-cultural validity. Use when adapting resources for diverse contexts or questioning universal claims."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "global-cross-cultural-pedagogies/cross-cultural-task-validity-checker"
skill_name: "Cross-Cultural Task Validity Checker"
domain: "global-cross-cultural-pedagogies"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Henrich, Heine & Norenzayan (2010) — The weirdest people in the world? (WEIRD bias in behavioural science)"
  - "Tobin, Wu & Davidson (1989) — Preschool in Three Cultures: Japan, China, and the United States"
  - "Alexander (2001) — Culture and Pedagogy: international comparisons in primary education"
  - "Stigler & Hiebert (1999) — The Teaching Gap: best ideas from the world's teachers for improving education in the classroom"
  - "Nsamenang (2006) — Human ontogenesis: an indigenous African view on development and intelligence"
input_schema:
  required:
    - field: "task_or_practice"
      type: "string"
      description: "The educational task, practice, strategy, or research finding to be checked for cross-cultural validity"
    - field: "intended_context"
      type: "string"
      description: "Where and with whom this task or practice will be used — the specific cultural context of the students"
  optional:
    - field: "source_context"
      type: "string"
      description: "Where the task or practice was developed or researched — the cultural context of origin"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "specific_concerns"
      type: "string"
      description: "Any particular concerns the teacher has about cultural fit"
output_schema:
  type: "object"
  fields:
    - field: "validity_analysis"
      type: "object"
      description: "Analysis of the task's cross-cultural validity — what assumptions it carries, where it might not transfer"
    - field: "cultural_assumptions"
      type: "array"
      description: "Specific cultural assumptions embedded in the task — about individualism, communication styles, knowledge, authority, or values"
    - field: "adaptation_suggestions"
      type: "array"
      description: "How to adapt the task for the intended context — specific, practical modifications"
    - field: "alternative_approaches"
      type: "array"
      description: "Alternative approaches from other cultural traditions that achieve the same learning objective differently"
chains_well_with:
  - "culturally-responsive-teaching-designer"
  - "ubuntu-collective-knowledge-task-designer"
  - "belonging-classroom-culture-designer"
  - "phenomenon-based-unit-anchor"
teacher_time: "3 minutes"
tags: ["WEIRD-bias", "Henrich", "cross-cultural", "cultural-assumptions", "validity", "decolonising", "global-pedagogy"]
---
# 跨文化任务有效性检查器

## 此技能的作用

分析一项教育任务、策略或基于研究的实践，识别其中可能限制其在不同文化背景学生中有效性或适用性的隐性文化假设。Henrich、Heine 与 Norenzayan（2010）的关键洞见是，大多数教育研究都是以 WEIRD 人群（西方、受过教育、工业化、富裕、民主）为对象开展的，而研究结论往往被表述为普遍规律，尽管它们实际上具有特定的文化属性。一项在研究中“有效”的教学策略，可能是因为它符合受试人群的文化假设，而不是因为它具有普遍有效性。该技能能够识别任务中嵌入的具体文化假设（涉及个人主义、沟通方式、权威、知识、竞争或价值观），评估这些假设是否适用于目标情境，并提出来自其他文化传统的调整建议或替代方法。输出包括有效性分析、文化假设识别、调整建议以及替代方法。人工智能在此尤其有价值，因为识别隐性文化假设需要同时理解其起源文化背景和使用文化背景——这是一项需要广泛了解多种文化体系的交叉参照任务。

## 证据基础

Henrich、Heine 与 Norenzayan（2010）证明，心理学、认知科学和行为经济学领域的绝大多数研究都是以 WEIRD 人群为对象开展的，但研究结论却经常被泛化到“人类”身上，仿佛 WEIRD 人群能够代表全人类。他们指出，WEIRD 人群在许多维度上都是统计意义上的离群群体：更加个人主义，更倾向于分析性思维，更偏向抽象推理，并且相比世界上大多数人口，更有可能优先重视个人选择与自主性。这对教育有直接影响：源自 WEIRD 研究的教学策略可能带有隐性的文化假设，而这些假设并不适用于其他文化传统的学生。Tobin、Wu 与 Davidson（1989）比较了日本、中国和美国的学前教育，揭示了这些教育体系对于教育目的、教师角色、个人成就与集体成就的价值，以及什么构成“良好”的学习行为，存在根本不同的假设。Alexander（2001）开展了最全面的国际小学教育比较研究，考察了英格兰、法国、印度、俄罗斯和美国的课堂。他发现，教学实践反映了深层的文化价值观——不同文化对什么算是“良好的教学”有着截然不同的理解，而在一种文化中有效的实践，在另一种文化中可能无效，甚至适得其反。Stigler 与 Hiebert（1999）比较了日本、德国和美国的数学教学，表明日本教师和美国教师对于学生如何学习有着根本不同的理论——日本教师采用富有成效的困难应对和全班讨论，而美国教师则优先重视个人练习和即时成功。两者都不是“错误”的，但如果不加调整地将一种做法移植到另一种做法所属的文化情境中，成功的可能性并不高。Nsamenang（2006）阐述了一种非洲人的人类发展观，强调社会责任、参与式学习以及融入社区的特性——这对优先重视个人自主性和抽象认知成就的西方发展模型提出了挑战。

## 输入架构

教师必须提供：
- **任务或实践：** 要检查的内容。*例如：“成长型思维赞扬——告诉学生‘你在这件事上真的非常努力’，而不是‘你真聪明’” / “将‘想一想—两人讨论—全班分享’作为讨论策略” / “个体目标设定——每位学生写下自己的个人学习目标” / “使用布卢姆分类法设计高阶思维问题” / “离堂券——学生在课程结束时分别写下他们学到的内容”*
- **预期情境：** 将在哪里使用。*例如：“伦敦的一所多元文化学校，学生来自不同背景，其中包括近期抵达的学生” / “肯尼亚的一所乡村学校” / “日本的一所学校” / “澳大利亚一间有相当比例原住民学生的教室” / “新加坡一所拥有来自40多个国家和地区学生的国际学校”*

可选项（如有，通常由上下文引擎注入）：
- **来源情境：** 该实践在哪里形成
- **学生年级：** 年级组
- **学科领域：** 课程学科
- **具体担忧：** 教师对文化适配性的具体疑虑

## 提示词

```
You are an expert in cross-cultural education research, with deep knowledge of Henrich, Heine & Norenzayan's (2010) WEIRD bias research, Tobin, Wu & Davidson's (1989) cross-cultural comparison of early childhood education, Alexander's (2001) comparative pedagogy, Stigler & Hiebert's (1999) research on mathematics teaching across cultures, and Nsamenang's (2006) African developmental psychology. You understand that educational practices are cultural products — they emerge from specific cultural contexts and carry assumptions about learning, personhood, knowledge, authority, and community that may not transfer across cultures.

CRITICAL PRINCIPLES:
- **All educational practices carry cultural assumptions.** There is no "culture-free" pedagogy. Every teaching strategy, assessment method, and classroom routine embodies assumptions about what learning is, how people relate to each other, and what matters. The task is to make these assumptions VISIBLE, not to eliminate them (which is impossible).
- **"Evidence-based" does not mean "universally valid."** A practice that has strong research evidence may have been tested only with WEIRD populations. The evidence tells us it works in THAT context — it does not tell us it works everywhere. Be precise about what the evidence actually shows and where it was generated.
- **Identify the SPECIFIC assumption, not a vague concern.** "This might not work in other cultures" is too vague. "This practice assumes that individual public performance is motivating — but in cultures that value group harmony, being singled out may cause discomfort rather than motivation" is specific and actionable.
- **Offer adaptations, not just critiques.** Identifying cultural assumptions is useful only if it leads to practical adaptation. For each assumption identified, suggest how the practice could be modified to work in the intended context — or suggest an alternative approach from a different cultural tradition that achieves the same learning objective.
- **Avoid both cultural essentialism and cultural relativism.** Don't assume all members of a cultural group share the same values (essentialism). Don't conclude that nothing can transfer across cultures (relativism). Instead, identify specific assumptions, assess their fit with the specific context, and adapt thoughtfully.

Your task is to check the cross-cultural validity of:

**Task or practice:** {{task_or_practice}}
**Intended context:** {{intended_context}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Source context:** {{source_context}} — if not provided, identify the likely cultural origin of the practice.
**Student level:** {{student_level}} — if not provided, design for general school-age students.
**Subject area:** {{subject_area}} — if not provided, address the practice in general terms.
**Specific concerns:** {{specific_concerns}} — if not provided, conduct a general cross-cultural validity analysis.

Return your output in this exact format:

## Cross-Cultural Validity Check: [Practice Name]

**Practice:** [What is being checked]
**Source context:** [Where the practice was developed/researched]
**Intended context:** [Where it will be used]
**Overall assessment:** [Brief summary — e.g., "Partially transferable with significant adaptations needed" / "Core principle transfers well; specific implementation needs adjustment" / "Fundamental assumptions may not hold in this context"]

### Cultural Assumptions Identified

For each assumption (3–5):
**Assumption [N]: [The assumption]**
- **What the practice assumes:** [The specific cultural value or norm embedded in the practice]
- **Where this assumption holds:** [Cultures/contexts where this assumption is valid]
- **Where it may not hold:** [Cultures/contexts where this assumption may not apply]
- **Evidence:** [Research or cross-cultural comparison that supports this analysis]

### Adaptation Suggestions

For each adaptation (2–4):
**Adaptation [N]: [What to change]**
- **Original:** [How the practice currently works]
- **Adapted:** [How to modify it for the intended context]
- **Why this works:** [How the adaptation addresses the cultural assumption while maintaining the learning objective]

### Alternative Approaches From Other Traditions

[2–3 alternative approaches from non-WEIRD educational traditions that achieve the same learning objective through different cultural logic]

### What Transfers Well

[Elements of the practice that DO transfer across cultures — the universal or widely applicable principles underneath the cultural packaging]

### Honest Caveats

[Limitations of this analysis — what can and cannot be determined without direct knowledge of the specific students and community]

**Self-check before returning output:** Verify that (a) specific cultural assumptions are identified, not vague concerns, (b) the analysis avoids cultural essentialism, (c) practical adaptations are suggested, (d) alternative approaches are offered from non-WEIRD traditions, (e) the analysis identifies what DOES transfer, not just what doesn't, and (f) honest caveats acknowledge the limits of the analysis.
```

## 示例输出

**场景：** *任务或实践：“Think-pair-share——一种讨论策略：教师提出问题，给予学生个人思考时间，然后两人结对讨论，最后由选定的对子向全班分享。广泛被视为提升学生参与度的‘最佳实践’。” / 预期情境：“阿联酋的一所国际学校，学生来自多元背景——阿联酋、南亚（印度、巴基斯坦、孟加拉国）、菲律宾、埃及、约旦、英国和美国。同一个教室中存在显著的文化多样性。有些学生非常适应公开讨论；另一些学生尽管有能力且投入，却很少在课堂上发言。” / 具体关注点：“我注意到，think-pair-share 对一些学生似乎效果很好，但对另一些学生却不然。不参与的学生并不是不投入——他们似乎是不适应这种形式本身。我想了解，这种策略是否包含某些文化假设，而这些假设可能解释了这种差异。”*

---

## 跨文化有效性检查：Think-Pair-Share

**实践：** Think-pair-share——个人思考时间 → 两人结对讨论 → 全班分享  
**来源背景：** 由 Frank Lyman 于 1981 年在美国提出；已广泛应用于英语国家教育体系（美国、英国、澳大利亚、加拿大）  
**预期情境：** 阿联酋的一所国际学校，学生来自 8 个以上的文化背景  
**总体评估：** 核心原则（让学生在发言前拥有思考时间）具有良好的可迁移性。具体实施方式则对个人表达、同伴讨论规范和公开分享抱有显著的文化假设，而在这一多元背景的情境中，这些假设未必适用于所有学生。

### 识别出的文化假设

**假设 1：个人思考是最佳起点**
- **该实践所作的假设：** 处理问题的最佳方式是先独自思考。这种方式将内部的、个人的认知置于意义建构的主要模式之上。
- **这一假设成立的情境：** 在个人主义文化中（广义上的西方文化，尤其是美国和北欧文化），个人思考被视为形成真实理解的基础。“独立思考”是一种文化规范。
- **这一假设可能不成立的情境：** 在集体主义文化中（广义上的东亚、南亚、中东和非洲文化），思考往往具有关系性——意义通过对话产生，而不是在对话之前就已经形成。有些学生在与他人讨论某个想法时可能会思考得更好，而不是更差。对于那些通过互动进行思考的学生而言，“思考”阶段可能会造成焦虑。
- **证据：** Tobin、Wu 和 Davidson（1989）表明，日本学前教育将群体而非个人视为思考的单位。Alexander（2001）发现，俄罗斯和印度的课堂将集体口头背诵作为一种合理的思考形式——这并非“死记硬背”，而是共同进行认知加工。

**假设 2：学生能够自在且有效地进行同伴间的结对讨论**
- **该实践所作的假设：** 学生会与同伴进行开放且地位平等的讨论。这一假设认为，同伴之间的横向讨论是一种自然且令人舒适的交流方式。
- **这一假设成立的情境：** 在权威结构相对扁平的文化中（美国、斯堪的纳维亚国家、澳大利亚），同伴讨论是一种熟悉的形式。学生习惯于向地位相同的人表达观点。
- **这一假设可能不成立的情境：** 在权力梯度更陡峭的文化中（许多东亚、南亚和中东情境），学生可能更习惯于纵向沟通——向教师发言，或回应教师，而不是彼此进行横向交流。结对讨论可能会让他们感到尴尬，这并不是因为学生无法进行这种讨论，而是因为它违背了他们对知识应当如何流动的理解（从权威流向学习者，而不是在同伴之间流动）。此外，对于来自将对话中的性别隔离视为规范的文化的部分学生而言，异性结对也可能令人不适。
- **证据：** Hofstede 的文化维度研究表明，不同文化在权力距离方面存在显著差异。Alexander（2001）发现，在印度课堂中，教师的声音是知识传递的主要载体——学生之间的讨论较少见，也较少受到重视。Stigler 和 Hiebert（1999）表明，日本数学课堂采用由教师主导的全班讨论，而不是同伴结对活动——教师组织的是一种比 think-pair-share 更具结构性的集体讨论。

**假设 3：公开分享个人想法是可取的**
- **该实践所假设的内容：**向全班分享自己的想法是一种积极行为——这体现了自信，有助于集体学习，也是学生应当追求的表现。该实践会奖励公开的口头表达。
- **这一假设成立的情境：**在重视个人表达和公开表现的文化中（美国、英国），被要求分享是一种机会。主动发言的学生通常会受到表扬和奖励。
- **这一假设可能不成立的情境：**在重视谦逊、群体和谐或尊重他人的文化中（许多东亚文化、部分中东文化以及一些原住民文化），公开分享个人观点可能会让人感到不自在。被单独点名发言——尤其是在答案可能错误的情况下——可能导致丢面子。在一些文化中，“正确”的行为是等待被邀请发言，尊重知识更多的人，并避免在群体中突出自己。
- **证据：**Tobin、Wu & Davidson（1989）发现，日本教育工作者认为美国儿童急于公开发言是一种不成熟的表现，而不是自信。Castagno & Brayboy（2008）指出，原住民学生可能会把沉默作为一种尊重且经过思考的回应，而不是不投入。在许多阿拉伯文化中，面对问题时保持沉默可能表示深入思考和尊重，而不是能力不足或不情愿。

**假设 4：“正确”的结果是用语言表达出来**
- **该实践所假设的内容：**理解是通过**说出来**来展现的。如果你能说出来，就说明你理解了。如果你保持沉默，你可能并不理解。
- **这一假设成立的情境：**在重视语言表达的文化中（总体而言是西方文化，尤其是英语国家文化），语言流畅度等同于认知能力。
- **这一假设可能不成立的情境：**在同样重视其他表达形式的文化中——写作、绘画、手势、演示、安静观察——沉默并不代表缺乏理解。Nsamenang（2006）描述了非洲的教育传统，在这些传统中，理解是通过**做出来**而不是通过口头解释来展现的。

### 适应建议

**适应 1：将“思考”改为“思考或讨论”**
- **原文：**“独自思考 30 秒。”（要求进行个人处理）
- **调整后：**“用 30 秒开始处理这个问题——你可以默默思考、记下一点内容，或与同伴轻声开始讨论。”（提供多种处理方式）
- **这样做的原因：**消除了个人静默思考是唯一有效起始方式这一假设。通过对话进行思考的学生可以开始讨论；偏好安静的学生可以思考。两种方式都具有合理性。

**适应 2：提供分享方式的选择**
- **原文：**选定的搭档向全班进行口头分享。（要求进行公开口头表达）
- **调整后：**搭档讨论后，提供多种分享选项：“你可以口头向全班分享，也可以把你们这组的想法写在白板上举起来，或者在便签上为全班展示写下一句话。”（提供多种分享方式）
- **这样做的原因：**不习惯公开口头表达的学生仍然可以分享自己的想法。相比站起来发言，书写在白板上的方式暴露感较低。便签的压力则更小。学习目标（分享想法）得以保留；文化假设（公开口头分享）则被移除。

**调整方案 3：使用三人小组或小组讨论，而不是两人一组**
- **原始做法：** 两人讨论。（一对一，如果性别不同或身份地位存在差异，可能会令人尴尬）
- **调整后：** 使用三人小组或四人小组，让学生可以选择自己在小组中的位置。（共同承担责任，减轻个人压力）
- **这样做的原因：** 在三人小组中，学生可以在准备好时倾听并参与，而不必成为唯一的讨论伙伴。社交互动更加灵活——学生不必为了某一个特定的人而承受表现压力。小组安排也可以顾及性别和文化规范。

**调整方案 4：使用“写作—两人分享”或“绘画—两人分享”**
- **原始做法：** 思考（安静的个体认知）→ 两人讨论（口头）→ 分享（口头）
- **调整后：** 先写下来或画出来（个人或与伙伴一起）→ 讨论（两人或三人小组）→ 分享（任何形式）
- **这样做的原因：** 对于不适应立即进行口头讨论的学生来说，写作和绘画是进入活动门槛较低的方式。一个已经写下自己想法的学生，有具体内容可以展示给伙伴，这比在当下即时用口头表达想法更容易。

### 其他传统中的替代方法

**日本 Neriage（揉合式／打磨式讨论）：**
教师不采用 think-pair-share，而是提出一个问题，让学生独立或结对完成。随后，教师选择特定的学生回答与全班分享——这种选择是经过刻意设计的，旨在组织出一个富有成效的观点序列，逐步引向理解。教师负责编排讨论，将学生的想法联系起来：“Yuki 找到了这种方法。它与 Hiro 的做法相比如何？”这种方式比 think-pair-share 更有结构，也让教师能够控制谁在何时分享，从而在呈现多样化思考的同时，减少随机点名带来的焦虑。（Stigler & Hiebert, 1999）

**非洲圆桌讨论（受 Ubuntu 理念启发）：**
小组不是先进行个人思考，再结对分享，而是围坐成一圈，共同建构理解。教师提出问题，讨论沿着圆桌依次进行——每个人都在前一个人所说内容的基础上补充、拓展，或以尊重的方式提出不同观点。知识是在群体中共同建构的，而不是由个人独立建构的。没有人会被单独挑出来；每个人都是讨论流程的一部分，并在其中作出贡献。这种方式尊重集体主义的沟通规范，也减轻了个人公开表现的压力。（改编自 Letseka, 2012；Venter, 2004）

**无声讨论（书面​​对话）：**
学生通过在一张共享纸张（或共享数字文档）上书写，回应一个问题。不进行口头发言，只进行书面表达。学生阅读彼此的贡献，并在其基础上继续补充。这种方式对于不适应口头讨论、但拥有丰富想法的学生非常有效，同时也会为讨论留下永久记录。这种方法源于贵格会的教育实践，后来被应用于各种多语言和跨文化环境中。

### 适用性较强的部分

think-pair-share 的核心原则在不同文化之间具有很强的适用性：
- **在期待学生作答之前，先给予他们处理信息的时间**——这一点普遍有益。问题不在于思考时间本身，而在于假设思考必须是安静且个人化的。
- **减少能够“隐藏起来”的学生人数**——两人或小组的结构意味着每位学生都会参与，而不仅仅是那些主动举手的学生。这一原则在不同文化中都成立。
- **让思考变得可见**——为了形成性评价而呈现学生理解程度这一目标具有普遍价值。问题在于应当如何让思考变得可见，而不是是否应该让思考变得可见。

### 需要坦诚说明的限制

1. **本分析识别的是可能存在的文化假设，而不是确定无疑的结论。** 并非所有集体主义文化背景的学生都会对 think-pair-share 感到不自在，也并非所有个人主义文化背景的学生都能适应这种方式。文化会影响个人行为，但不会决定个人行为。教师必须观察自己的具体学生，并据此进行调整。

2. **文化分析存在刻板印象的风险。** 说“南亚学生可能不习惯与同伴讨论”是一种概括，未必适用于这个课堂中的具体南亚学生。本分析是观察的起点，而不是结论。

3. **教师自身的文化假设也会发挥作用。** 接受过英语国家教育学训练的教师可能会无意识地将沉默解读为“不投入”，将口头参与解读为“投入”。这种解读本身也具有特定的文化背景。最重要的调整可能在于教师对参与度的评估——认识到沉默可能意味着深入处理信息，而不是缺席。

4. **预期情境（阿联酋的一所国际学校）本身就具有复杂的文化构成。** 国际学校的学生往往已经在适应多种文化规范。有些学生可能非常适应西方式的讨论实践，而另一些学生可能并不适应。上述调整提供的是能够适用于不同文化范围的选项，而不是假设所有学生都需要相同的调整。

---

## 已知局限

1. **此 skill 能够识别教育实践中的文化假设，但无法识别所有假设。** 文化是复杂、多维且不断演变的。本分析聚焦于记录最为充分的维度（个人主义/集体主义、权力距离、沟通规范、知识传统），但无法涵盖所有相关的文化因素。

2. **跨文化分析需要的不仅仅是 WEIRD 研究。** 此 skill 的证据基础来自跨文化研究，但大多数教育研究仍以 WEIRD 为中心。其他传统中的替代方法（neriage、Ubuntu circle、silent discussion）是基于现有文献进行描述的，但在特定文化情境中工作的教师应当寻求当地教育领域的专业知识，而不仅仅是关于这些情境的西方学术研究。

3. **文化适应与文化改变之间存在张力。** 如果一名来自高权力距离文化的学生不适应同伴讨论，教师应该调整任务（尊重文化规范），还是坚持完成任务（有意让学生接触不同的文化规范）？这是一个没有普遍答案的真实教学困境。该技能提供了适应方案，但并未解决这种张力——教师必须根据具体情境作出专业判断，理想情况下还应与家庭和社区进行沟通。