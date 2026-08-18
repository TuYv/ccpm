---
# AGENT SKILLS STANDARD FIELDS (v2)
name: experiential-learning-cycle-designer
description: "Structure a direct experience into a full learning cycle with concrete experience, reflection, and conceptual transfer. Use when planning field trips, simulations, or practical tasks."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/experiential-learning-cycle-designer"
skill_name: "Experiential Learning Cycle Designer"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Hattie (2009) — Visible Learning: simulation and gaming effect size d=0.33"
  - "Billig (2000) — Research on K-12 school-based service learning: the evidence builds"
  - "Dewey (1938) — Experience and Education"
  - "Boud, Keogh & Walker (1985) — Reflection: turning experience into learning"
  - "Wurdinger & Carlson (2010) — Teaching for Experiential Learning: five approaches that work"
input_schema:
  required:
    - field: "learning_objective"
      type: "string"
      description: "The specific knowledge, skill, or understanding students need to develop"
    - field: "experience_type"
      type: "string"
      description: "The kind of direct experience available — simulation, role play, field trip, community project, practical task, experiment"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "time_available"
      type: "string"
      description: "How much time for the full cycle — single lesson, multiple lessons, a week"
    - field: "resources_available"
      type: "string"
      description: "What resources, materials, or settings are available for the experience"
    - field: "prior_knowledge"
      type: "string"
      description: "What students already know — determines where in the cycle emphasis falls"
output_schema:
  type: "object"
  fields:
    - field: "experiential_cycle"
      type: "object"
      description: "The four-phase learning cycle: experience → reflection → conceptualisation → application"
    - field: "experience_design"
      type: "object"
      description: "The direct experience — what students do, see, feel, encounter"
    - field: "reflection_design"
      type: "object"
      description: "How students process the experience — structured reflection that extracts learning"
    - field: "conceptualisation_design"
      type: "object"
      description: "How students connect their experience to theory, principles, or generalisable knowledge"
    - field: "application_design"
      type: "object"
      description: "How students apply their learning to a new situation — testing understanding through action"
chains_well_with:
  - "service-learning-project-designer"
  - "outdoor-learning-sequence-designer"
  - "reflective-practice-prompt-generator"
  - "agency-scaffold-generator"
teacher_time: "4 minutes"
tags: ["experiential-learning", "simulation", "service-learning", "Dewey", "reflection", "direct-experience"]
---
# 体验式学习循环设计器

## 此技能的功能

设计一个四阶段的体验式学习循环，引导学生从直接体验出发，经过结构化反思，形成概念性理解，然后在新的情境中进行应用。该循环借鉴了 Dewey (1938) 的基础原则：教育是对经验的重构——学习并非来自经验本身，而是来自对经验的反思，以及将经验与更广泛的理解联系起来。该技能会有意识地设计每个阶段：体验必须真正具有吸引力并与教育相关（而不仅仅是“有趣”），反思必须是结构化的（而不仅仅是“你感觉怎么样？”），概念化必须将体验与可迁移的原则联系起来，而应用则必须在新的情境中检验理解。输出内容包括完整的四阶段循环，以及对每个阶段和阶段之间过渡的详细设计。AI 在此特别有价值，因为设计有效的体验式学习需要平衡参与度（体验必须具有吸引力）与严谨性（必须产生真正的学习，而不仅仅是令人愉快的活动）。

## 证据基础

Dewey (1938) 确立了这一基础原则：单独的经验并不能产生教育作用。“误导性教育”经验——即那些不产生学习、强化错误观念或阻碍进一步成长的经验——与具有教育意义的经验一样普遍。两者的区别在于，前者是否与反思、概念化和未来应用建立了联系。Hattie (2009) 报告称，模拟和游戏作为教育策略的效应量为 d=0.33——这是一个中等程度的正向效应，表明设计良好的模拟活动确实有效，但并非万能药。当模拟活动包含结构化复盘（反思）以及与学习目标的明确联系（概念化）时，其效果最为显著。Billig (2000) 对服务学习研究进行了综述，发现服务学习对学业成就、公民责任和个人发展具有中等程度的正向影响——但**只有**在服务体验通过结构化反思与课程内容建立联系时才会产生这种效果。没有反思的服务活动能够造福社区，却不会带来学习。Boud、Keogh & Walker (1985) 建立了一个详细的经验反思学习模型，认为反思包括：回到经验本身（发生了什么？）、关注感受（我感受到了什么？）以及重新评估经验（这意味着什么？）。如果没有这一结构化过程，经验就只能停留在轶事层面，而不会转化为学习。Wurdinger & Carlson (2010) 记录了五种能够产生学习的体验式方法：主动学习、基于问题的学习、基于项目的学习、服务学习和基于地方的学习——它们都具有相同的共同结构：体验，随后是反思，随后是概念化，随后是应用。

## 输入模式

教师必须提供：
- **学习目标：** 学生需要学习什么。*例如：“理解供给与需求——十年级经济学” / “同理心与换位思考——八年级 PSHE” / “水循环——五年级科学” / “议会如何运作——九年级公民教育”*
- **体验类型：** 可以开展哪种类型的体验。*例如：“模拟——我们可以在课堂上组织一个商品市场，让学生进行买卖” / “角色扮演——学生可以在模拟议会中承担不同角色” / “实地考察——我们下周要参观一家水处理厂” / “社区项目——学生正在为当地一家慈善机构策划筹款活动”*

可选（如果上下文引擎可用，则注入）：
- **学生年级：** 年级组
- **学科领域：** 课程学科
- **可用时间：** 完整周期的时长
- **可用资源：** 可用的资源
- **先备知识：** 学生已经掌握的内容

## 提示词

```text
You are an expert in experiential learning design, with deep knowledge of Dewey's (1938) philosophy of experience and education, Hattie's (2009) evidence on simulation and gaming, Billig's (2000) research on service learning, Boud, Keogh & Walker's (1985) model of reflective learning, and Wurdinger & Carlson's (2010) five experiential approaches. You understand that experiential learning is NOT "learning by doing" in the vague sense — it is a rigorous four-phase cycle where each phase serves a specific pedagogical function, and the learning happens in the REFLECTION and CONCEPTUALISATION, not in the experience itself.

CRITICAL PRINCIPLES:
- **Experience without reflection is just activity.** Dewey was explicit: not all experience is educative. A simulation that students enjoy but don't reflect on produces entertainment, not learning. A field trip without structured follow-up produces memories, not understanding. The REFLECTION PHASE is where learning happens — design it with as much care as the experience itself.
- **Reflection must be structured, not generic.** "How did that go?" is not reflection. "What happened when you raised the price? How did the buyers respond? Why do you think that happened? What principle does this illustrate?" is structured reflection that extracts learning from experience.
- **Conceptualisation connects the specific to the general.** The experience is specific (THIS simulation, THIS field trip). The learning must be general (the principle of supply and demand, the process of water purification). Conceptualisation explicitly bridges: "In our simulation, X happened. In the real economy, the same principle applies — here's how."
- **Application tests transfer.** If students can only explain what happened in the simulation but cannot apply the principle to a new situation, they learned the simulation, not the concept. The application phase provides a new context where students must use their learning.
- **Design the experience for learning, not just engagement.** A marketplace simulation where students have fun but the supply-demand dynamics are invisible has failed. The experience must be designed so that the target concept is EMBEDDED in the experience — students encounter it through doing, even if they don't yet have the language for it.

Your task is to design an experiential learning cycle for:

**Learning objective:** {{learning_objective}}
**Experience type:** {{experience_type}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the learning objective.
**Subject area:** {{subject_area}} — if not provided, infer from the learning objective.
**Time available:** {{time_available}} — if not provided, design for a 2-lesson sequence (one for experience, one for reflection and conceptualisation, with application as homework or a third lesson).
**Resources available:** {{resources_available}} — if not provided, design with minimal resources.
**Prior knowledge:** {{prior_knowledge}} — if not provided, design the experience to introduce the concept rather than reinforce it.

Return your output in this exact format:

## Experiential Learning Cycle: [Learning Objective]

**Learning objective:** [What students will understand]
**Experience:** [The type of direct experience]
**Key concept embedded in experience:** [The specific principle or understanding that the experience makes tangible]

### Phase 1 — Experience (Concrete Experience)

**The experience:** [What students do — detailed, step-by-step]
**What makes this experience educative:** [How the learning objective is embedded in the activity — what students encounter through doing]
**Teacher role during experience:** [What the teacher does — facilitates, observes, takes notes for the reflection phase]

### Phase 2 — Reflection (Reflective Observation)

**Structured reflection questions:** [Specific questions that extract learning from the experience — not "how did it go?" but targeted questions about what happened and why]
**Reflection format:** [How reflection is structured — whole-class discussion, written journal, paired dialogue, recorded observations]
**Key moments to revisit:** [Specific moments from the experience that the teacher draws attention to — "Remember when X happened? Why do you think that occurred?"]

### Phase 3 — Conceptualisation (Abstract Conceptualisation)

**From experience to principle:** [How the teacher helps students move from "what happened in our activity" to "what this tells us about [the concept]"]
**Theory/principle introduced:** [The formal knowledge that explains what students experienced]
**Connection made explicit:** [How the teacher links the experience directly to the theory — "In our simulation, you experienced X. The economic term for this is Y. It happens in real life when Z."]

### Phase 4 — Application (Active Experimentation)

**New context:** [A different situation where students apply the principle they've learned]
**Application task:** [What students do to test their understanding in this new context]
**How to know it worked:** [Evidence that students can transfer the learning beyond the original experience]

### Transitions Between Phases

[How to move smoothly from each phase to the next — the "glue" that makes the cycle coherent]

**Self-check before returning output:** Verify that (a) the experience genuinely embeds the learning objective, (b) the reflection is structured with specific questions, (c) the conceptualisation explicitly connects experience to transferable principle, (d) the application tests transfer to a new context, and (e) each phase serves a distinct pedagogical function.
```

## 示例输出

**场景：** *学习目标：“理解供给与需求——10年级经济学。学生需要理解：当供给有限而需求旺盛时，价格会上升；当供给超过需求时，价格会下降；这一机制通过买方和卖方各自独立的决策发挥作用，而不是通过中央计划实现。” / 体验类型：“模拟——学生买卖商品的课堂市场” / 可用时间：“2课时（每课时50分钟）” / 先备知识：“学生尚未正式学习供给与需求——这是他们第一次接触这一概念”*

---

## 体验式学习循环：供给与需求

**学习目标：** 理解供需价格机制——价格如何从买方和卖方各自独立的决策中产生  
**体验：** 课堂市场模拟  
**体验中嵌入的核心概念：** 当许多买方想要一种稀缺商品时，价格会上升。当商品充足而买方很少时，价格会下降。这一过程不需要任何人决定“价格应该是 X”——它是在互动中产生的。

### 阶段1——体验（第1课时：40分钟）

**体验内容：**

*准备（10分钟）：*  
将全班分为买方（15人）和卖方（15人）。每位卖方获得5张代表“商品”的卡片（彩色卡片即可，不需要复杂准备）。每位买方获得一份课堂货币预算（纸质代币——每人10枚代币）。

**第1轮——稀缺：** 每位卖方只有2件商品可出售。每位买方想购买3件商品。（需求超过供给。）卖方自行定价。买方分别与卖方协商。交易公开进行——所有人同时在教室内走动并协商。用时5分钟。结束时，将所有成交价格记录在黑板上。

**第2轮——过剩：** 现在每位卖方有8件商品可出售。每位买方仍然只想购买3件商品。（供给超过需求。）规则相同——卖方定价，公开交易。用时5分钟。记录所有成交价格。

**第3轮——市场冲击：** 在本轮进行到一半时，教师宣布：“突发新闻——政府宣布这些商品现在是即将到来的考试所必需的。每个人至少需要5件。”（需求激增。）观察价格会发生什么变化。用时5分钟。记录价格。

*使这一体验具有教育意义的因素：*
- 在第1轮中，学生亲身经历价格上涨——卖方发现，由于买方都在争夺稀缺商品，他们可以收取高价。价格机制没有被解释；学生是通过亲身参与遇到它的。
- 在第2轮中，学生亲身经历价格下降——卖方发现，由于买方有许多选择，他们必须降低价格。拒绝降价的卖方卖不出商品。
- 在第3轮中，学生亲身经历需求冲击——需求增加时，原本较低的价格会突然飙升。这些动态是可见且可感受到的。

**体验过程中的教师角色：** 不要解释正在发生什么。巡视、观察并记录：哪些卖方提高了价格？哪些买方转身离开？供给增加时价格发生了什么变化？这些观察将为反思提供素材。如果学生抱怨价格“不公平”，请记录下来——这在教学上很有价值。

### 阶段 2——反思（第 1 课：10 分钟 + 第 2 课：15 分钟）

**第 1 课结束——快速记录（10 分钟）：**
趁体验还历历在目，立即记录反思：
- “第 1 轮的价格发生了什么变化？价格高还是低？为什么？”
- “第 2 轮发生了什么？价格为什么发生变化？”
- “当我在第 3 轮宣布需求冲击时，卖方做了什么？为什么？”
- “有没有人决定‘正确’的价格应该是多少，还是价格就这样……自然形成了？”

在黑板上记录关键观察。暂时不要解释——只收集信息。

**第 2 课开始——结构化反思（15 分钟）：**
将三轮的交易价格数据绘制成图表（Y 轴为价格，X 轴为轮次）。学生会看到其中的规律：第 1 轮价格较高，第 2 轮价格较低，第 3 轮价格飙升。

结构化反思问题：
1. “在第 1 轮中，卖方为什么能够收取高价？他们拥有什么力量？”（他们拥有买方想要、且无法从其他地方获得的东西——稀缺性。）
2. “在第 2 轮中，为什么价格下降了，即使没有人告诉卖方要降价？”（买方有了选择。收费过高的卖方会没有顾客。竞争迫使价格下降。）
3. “第 1 轮中有没有买方感到沮丧？第 2 轮中有没有卖方感到沮丧？为什么？”（这会引出情感层面——对市场力量和市场脆弱性的体验。）
4. “是谁决定了价格？有没有一个中央权威？”（没有人决定。价格是在数千次个体协商中形成的。这是关键洞见。）
5. “在第 3 轮中，同样的商品突然变得更有价值。商品本身发生变化了吗？发生了什么变化？”（商品没有变化——变化的是需求。价值并非内在于物品之中；它取决于人们有多想要它。）

### 阶段 3——概念化（第 2 课：20 分钟）

**从体验到原理：**
“你们刚才体验到的现象在经济学中有一个名称。让我介绍一下这个概念的语言，它描述的正是你们已经知道的内容。”

教师介绍：
- **供给：**卖方愿意在某一价格下出售的商品数量。在第 1 轮中，供给量很低（每位卖方 2 件）。在第 2 轮中，供给量很高（每位卖方 8 件）。
- **需求：**买方愿意在某一价格下购买的商品数量。在第 1 轮和第 2 轮中，需求适中。在第 3 轮中，需求激增。
- **价格机制：**价格会进行调整，以平衡供给和需求。没有人决定价格——价格是买方和卖方互动的结果。
- **供给曲线和需求曲线：**教师绘制经典图表。“还记得第 1 轮吗？它在图表中的这里——供给量低、需求量高，价格就在这里。第 2 轮呢？在这里——供给量高、需求相同，价格下降。第 3 轮呢？在这里——需求曲线向右移动，价格跳升。”

**明确建立联系：**“在我们的模拟中，当商品稀缺时，你们收取了高价。在现实经济中，同样的原理解释了为什么乐队受欢迎时演唱会门票会更贵，为什么很多人想住在某个地区时房价会上涨，以及为什么石油供应中断时汽油价格会飙升。其背后的机制是相同的——你们已经亲身体验过了。”

### 第 4 阶段——应用（第 2 课：15 分钟）

**新情境：**学生将供需分析应用于一个他们从未经历过的现实情境：

“阅读这篇新闻报道：‘当地新科技公司总部落成，房价上涨 15%。’运用你从市场模拟活动中学到的知识，解释：房价为什么会上涨？画出供需图。如果这家科技公司随后为员工建造 500 套新住房，房价会发生什么变化？”

**应用任务：**学生使用经济学术语（供给、需求、价格机制、稀缺性、过剩）写一段解释，并画出带有标签的供需图。他们必须将现实情境与自己在模拟活动中体验到的原理联系起来。

**如何判断活动是否奏效：**能够使用供需分析解释房价情境的学生，已经将从模拟活动中学到的知识迁移到了新的情境中。只能描述模拟活动中发生了什么，却无法将原理应用于房价情境的学生，学到的是活动本身，而不是概念——他们需要在概念化和应用阶段获得更多练习。

### 阶段之间的过渡

**体验 → 反思：**过渡点是价格数据。将交易价格记录在黑板上，会形成一份所有人都能看到的共享数据集。这些数据是反思的原材料：“看看这些数据。你看到了什么规律？”

**反思 → 概念化：**过渡点是这个问题：“你们注意到的现象，在经济学中有一个名称。”学生已经用自己的话表达出了这一洞见（“价格上涨是因为大家都想要它们”）。现在，教师引入正式的术语，为学生已经理解的内容命名。

**概念化 → 应用：**过渡点是这个挑战：“你能用这个原理解释一件你从未经历过的事情吗？”这可以检验学习是否已经从具体情境（我们的模拟活动）迁移到了普遍原理（供需原理）。

---

## 已知局限

1. **Kolb（1984）的体验式学习循环虽然被广泛引用，但在理论和实证方面都有显著局限。**本技能借鉴了四阶段循环结构（体验 → 反思 → 概念化 → 应用），但并不声称这是 Kolb 本人的模型。Kolb 的理论受到过以下批评：(a) 实证验证不足——该循环在直觉上很有吸引力，但尚未经过严格检验；(b) 文化偏见——该循环假设了一种以个人经验为起点的西方个人主义学习模式；(c) “学习风格”部分（Kolb 的 LSI）已被反复证伪（Coffield 等，2004）；(d) 该循环暗示了一个固定顺序，而在实践中，学习者可能从任何一个阶段进入。本技能将这一四阶段结构作为一种实用的规划框架，其依据具体是 Dewey（1938）和 Boud 等人（1985），而不是 Kolb 本人。

2. **模拟活动会简化现实。**课堂市场是对供给和需求的模拟，而不是真实市场。现实市场涉及信息不对称、外部性、政府监管、垄断力量、行为偏差以及历史背景，而课堂模拟无法复制这些因素。模拟活动教授的是基本机制——但应明确告诉学生：“真实经济比我们的模拟活动复杂得多。我们学到的是基础，即供给和需求会影响价格这一原理。在接下来的几周里，我们将逐步加入这些复杂因素。”

3. **基于模拟的学习效果量为中等（Hattie，d=0.33）。** 这是一种积极的效果，但并不算大，而且在很大程度上取决于复盘的质量。没有结构化反思的模拟，其学习成果始终弱于**带有**结构化反思的模拟。反思阶段不是可有可无的——学习正是在这一阶段发生的。一次引人入胜的模拟之后说一句“好了，刚才挺有意思，现在打开课本吧”，等于浪费了这次体验式学习的机会。