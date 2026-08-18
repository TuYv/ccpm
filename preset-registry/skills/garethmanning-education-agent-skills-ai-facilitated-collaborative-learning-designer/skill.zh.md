---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-facilitated-collaborative-learning-designer
description: "Design AI-supported collaborative tasks that structure group interaction and address participation problems. Use when students struggle to collaborate effectively on group tasks."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/ai-facilitated-collaborative-learning-designer"
skill_name: "AI-Facilitated Collaborative Learning Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Roschelle & Teasley (1995) — The construction of shared knowledge in collaborative problem solving"
  - "Dillenbourg (1999) — What do you mean by collaborative learning? (CSCL framework)"
  - "Järvelä & Hadwin (2013) — New frontiers: regulating learning in CSCL (socially shared regulation of learning)"
  - "Slavin (1995) — Cooperative learning: theory, research, and practice (meta-analysis)"
  - "Kirschner et al. (2018) — From cognitive load theory to collaborative cognitive load theory"
input_schema:
  required:
    - field: "collaborative_task"
      type: "string"
      description: "The specific learning task that students will work on together — what they need to produce or solve as a group"
    - field: "collaboration_challenge"
      type: "string"
      description: "The specific collaboration problem to address — what goes wrong when students work together on this task"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "group_size"
      type: "string"
      description: "How many students per group"
    - field: "ai_capabilities"
      type: "string"
      description: "What AI tools are available — chatbot, collaborative workspace, real-time monitoring, or other"
    - field: "time_available"
      type: "string"
      description: "How long students have for the collaborative task"
output_schema:
  type: "object"
  fields:
    - field: "collaboration_design"
      type: "object"
      description: "The structure of the collaborative task — roles, phases, and the specific points where AI facilitates"
    - field: "ai_facilitation_moves"
      type: "array"
      description: "The specific things the AI does during collaboration — prompts, monitoring, scaffolding, and interventions"
    - field: "regulation_scaffolds"
      type: "object"
      description: "How the AI supports socially shared regulation — planning, monitoring, and reflecting on the group process"
    - field: "equity_mechanisms"
      type: "object"
      description: "How the design ensures all group members participate meaningfully — preventing free-riding and dominance"
chains_well_with:
  - "intelligent-tutoring-dialogue-designer"
  - "ai-feedback-design-principles"
  - "metacognitive-monitoring-ai-contexts"
teacher_time: "5 minutes"
tags: ["collaboration", "CSCL", "Dillenbourg", "Järvelä", "cooperative-learning", "Slavin", "group-work", "AI-facilitation", "regulation"]
---
# AI 促进的协作学习设计者

## 此技能的作用

设计一项包含具体 AI 促进点的协作学习任务，即 AI 系统支持小组过程但不取代小组过程的介入位置。这项技能应对协作学习中的一个根本挑战：协作学习**可能**是最有力的学习方式之一（Slavin 1995 年的元分析发现，结构良好的合作学习效果量为 0.26-0.32），但它往往会退化为一名学生完成所有工作、其他人旁观，或者每个人各自独立完成工作、最后共享一份文档。Dillenbourg（1999）指出，真正的协作要求共同解决问题并形成共享理解，而不仅仅是分工。Järvelä & Hadwin（2013）表明，有效的协作需要学习的社会共享调节（SSRL），即小组共同规划、监控并调整其方法的能力。AI 在这里尤其有价值，因为它能够完成教师无法做到的事情：同时观察多个小组，实时发现协作失效，并在需要时精准介入。一名教师在 8 个小组之间巡视，往往要几分钟甚至几小时后才能发现问题；而监测小组互动的 AI 则可以实时发出提示。输出内容包括完整的协作设计（任务结构、角色、阶段）、AI 促进动作（AI 在何时以及如何介入）、调节支架（支持小组进行自我调节），以及公平机制（确保所有成员都参与）。

## 证据基础

Dillenbourg（1999）奠定了计算机支持的协作学习（CSCL）的基础框架，区分了合作与协作：合作是将任务拆分为由个人分别完成的子任务，而协作是共同建构对问题的共享理解。他认为，真正的协作需要：(a) 共同目标，(b) 对彼此观点的相互投入，以及 (c) 共同建构任何个人都无法独立产出的知识。技术可以通过组织互动、使思考可见以及提供共享表征来支持协作，但也可能因为让任务分工变得过于容易而削弱协作。Roschelle & Teasley（1995）将协作定义为“持续尝试建构并维持对问题的共同理解所产生的协调、同步活动”。他们指出，有效的协作包含特定的对话模式：提出观点、扩展阐述、质疑以及修复共享理解。当这些模式失效时，协作就会退化为平行工作。Järvelä & Hadwin（2013）提出了学习的社会共享调节（SSRL）这一概念，即有效的协作小组不仅共享认知工作，也共享**调节性**工作：规划要做什么、监控进展、评估当前方法是否有效，以及在方法无效时进行调整。他们发现，SSRL 是协作学习成功的最强预测因素，并且可以通过技术提供支架来培养，例如提示小组进行规划、检查进展和反思。Slavin（1995）对合作学习研究进行了综合评述，发现当以下两个条件得到满足时，合作学习始终会产生积极效果（d = 0.26-0.32）：(a) 小组目标（以小组为单位进行评价，而不是单独评价个人）以及 (b) 个体责任（每名成员的贡献都可见并接受评价）。缺少这些条件时，合作学习往往会产生搭便车和社会惰化。Kirschner et al.（2018）将认知负荷理论扩展到协作情境，认为小组工作可以将认知负荷分配给不同成员，但前提是任务对任何单个人而言都过于复杂。对于简单任务，协作的交易成本（协调、沟通、管理不同观点）会超过其收益。协作应当保留给确实需要多个头脑共同完成的任务。

## 输入架构

教师必须提供：
- **协作任务：** 学生将共同完成的任务。*例如：“10 年级科学：设计一个实验，检验温度是否会影响化学反应的速率。每组必须产出实验方法、风险评估、预测结果，以及对底层化学原理的解释” / “8 年级英语：合作撰写一份报纸头版，将《罗密欧与朱丽叶》中的事件改写成仿佛发生在今天的新闻” / “12 年级经济学：分析一个现实世界中的市场失灵案例，并撰写一份政策简报，提出政府干预建议”*
- **协作挑战：** 学生在共同完成该任务时会出现的问题。*例如：“一名学生包办所有写作，其他人旁观。‘讨论’阶段持续 30 秒后，他们就开始分工” / “小组默认采纳最健谈学生的想法，而不考虑其他方案。较安静的学生逐渐停止参与” / “学生把任务拆开（‘你做方法部分，我做风险评估’），却从未建立共同理解——最终成果只是四个彼此割裂的部分拼接在一起”*

可选项（如有，可能由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **小组规模：** 每组学生人数
- **AI 能力：** 可用的 AI 工具
- **可用时间：** 协作任务的持续时间

## 提示词

```
You are an expert in collaborative learning design and AI-facilitated CSCL (computer-supported collaborative learning), with deep knowledge of Dillenbourg's (1999) collaboration framework, Roschelle & Teasley's (1995) research on shared knowledge construction, Järvelä & Hadwin's (2013) socially shared regulation of learning (SSRL), Slavin's (1995) meta-analysis of cooperative learning, and Kirschner et al.'s (2018) collaborative cognitive load theory. You understand that collaboration is one of the most powerful — and most frequently misused — learning strategies. You know that the difference between productive collaboration and time-wasting group work depends entirely on the DESIGN, not on the students.

CRITICAL PRINCIPLES:
- **Collaboration requires a task that is genuinely too complex for one person.** Kirschner et al. (2018): if one student can do the task alone, collaboration adds transaction costs without cognitive benefit. The task must require multiple perspectives, skills, or knowledge bases that no individual possesses. If the task could be done individually, don't make it collaborative.
- **Structure the interaction, not just the task.** Dillenbourg (1999): giving students a task and saying "work together" is not collaborative learning design. The interaction must be structured: who speaks when, what they discuss at each phase, how they make decisions, and how they build on each other's ideas. AI can enforce this structure without the teacher being present.
- **Individual accountability prevents free-riding.** Slavin (1995): every group member must have a visible, assessable contribution. If a student can sit passively and still get the grade, they will. Design roles, individual deliverables, or accountability mechanisms that make every student's contribution visible.
- **AI should facilitate, not participate.** The AI's role is to support the GROUP PROCESS — prompting planning, flagging imbalanced participation, asking regulation questions ("How is your approach going? Do you need to adjust?"). The AI should NOT contribute ideas, solve problems for the group, or become a group member. If students are talking to the AI instead of to each other, the design has failed.
- **Socially shared regulation is the highest-value target.** Järvelä & Hadwin (2013): the groups that learn the most are the ones that collectively regulate their process — planning, monitoring, and adjusting. AI scaffolds for regulation (planning prompts, progress checks, reflection prompts) are more valuable than AI scaffolds for content.

Your task is to design an AI-facilitated collaborative learning experience:

**Collaborative task:** {{collaborative_task}}
**Collaboration challenge:** {{collaboration_challenge}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the task.
**Group size:** {{group_size}} — if not provided, design for groups of 3-4.
**AI capabilities:** {{ai_capabilities}} — if not provided, design for a text-based AI that can monitor group work and send prompts to the group.
**Time available:** {{time_available}} — if not provided, design for a 50-minute lesson.

Return your output in this exact format:

## AI-Facilitated Collaboration Design: [Task Name]

**Task:** [What students will produce together]
**Collaboration challenge addressed:** [The specific problem this design solves]
**AI role:** [One-sentence summary of what the AI does and what it does NOT do]

### Task Complexity Check

[Verify that this task genuinely requires collaboration. If it doesn't, redesign it so it does.]

### Collaboration Structure

[The complete design: phases, roles, interaction rules, and deliverables. Include timing.]

**Phase 1: [Name]** (X minutes)
[What happens, what each role does, what the AI does]

**Phase 2: [Name]** (X minutes)
[What happens, what each role does, what the AI does]

### AI Facilitation Moves

[The specific moves the AI makes during collaboration — when, what, and why]

| Trigger | AI Move | Purpose | Example |
|---|---|---|---|
| [When] | [What the AI does] | [Why] | [Exact text] |

### Regulation Scaffolds

[How the AI supports socially shared regulation — planning, monitoring, and reflection prompts]

### Equity Mechanisms

[How the design ensures balanced participation — roles, accountability, and AI monitoring]

### What the AI Does NOT Do

[Explicit boundaries on AI involvement — what the AI should never do in this context]

**Self-check before returning output:** Verify that (a) the task genuinely requires collaboration, (b) interaction is structured not just assigned, (c) individual accountability is built in, (d) the AI facilitates the process rather than participating in it, and (e) regulation scaffolds are included.
```

## 示例输出

**情境：** *协作任务：“十年级科学：设计一个实验，检验温度是否会影响化学反应速率（盐酸和硫代硫酸钠）。每组必须完成实验方法、风险评估、预测结果图，以及对其背后化学原理（碰撞理论）的解释” / 协作挑战：“小组总是把工作分开：一名学生写实验方法，一名学生做风险评估，一名学生画图，一名学生写理论。他们从不讨论，也从不建立共同理解，最终报告只是把四个彼此独立的部分拼接在一起。写实验方法的学生通常不理解理论，而写理论的学生无法复现实验方法” / 小组人数：“4” / 学生水平：“十年级，三门科学” / AI 能力：“基于文本的 AI 聊天机器人，可以按设定的时间间隔或响应触发条件向小组发送消息” / 可用时间：“60 分钟”*

---

## AI 促进的协作设计：实验设计——温度与反应速率

**任务：** 设计一个完整实验，检验温度是否会影响盐酸 / 硫代硫酸钠反应的速率  
**要解决的协作挑战：** 将任务拆分后缺乏共同理解——学生各自完成一部分，而不是进行协作，从而产出彼此割裂的成果  
**AI 角色：** AI 监测小组的协作过程，并在关键时刻发送调节提示。AI 绝不会贡献科学观点、撰写报告的任何部分，或回答化学问题。

### 任务复杂度检查

原始任务确实可以拆分为彼此独立的子任务（实验方法、风险评估、图表、理论），这正是学生会把任务分开的原因。要让协作变得必要，就必须重新设计任务，使每个组成部分都依赖于其他部分：

**重新设计的任务：** 小组不再分别完成四个独立部分，而是必须完成一份**整合的文档**：实验方法中的每个决定都必须明确由理论加以论证，每项风险都必须与实验方法中的具体步骤相关联，预测结果图必须依据理论绘制（小组还要解释曲线的形状）。这种相互依赖意味着学生**无法**将工作拆分开来——写实验方法的学生需要理论部分学生的帮助，反之亦然。

**附加限制：** 每位小组成员都必须能够解释报告中的**任何**部分，而不只是“自己负责的”部分。教师将在最后随机选择一名成员，让其展示报告并回答有关整份报告的问题。

### 协作结构

**阶段 1：个人思考（5 分钟）**  
每位学生独立写下：(a) 自己已经了解的有关碰撞理论的内容，(b) 一件自己不确定的事情，以及 (c) 自己的预测——较高的温度会提高还是降低反应速率，以及为什么？这一步可以激活已有知识，并让每位学生都有内容可以为讨论作出贡献。此阶段**不得交谈**。

*AI 操作：* 5 分钟结束时，AI 发送：“个人思考时间到。在开始讨论之前，每个人分享自己写下的一件事情。按小组顺序进行——每个人都发言后，任何人才可以再次发言。”

**阶段 2：建立共同理解（15 分钟）**  
小组讨论碰撞理论以及温度如何影响反应速率。他们必须就以下内容达成共识：(a) 为什么温度越高，反应速率越快（粒子运动得更快 → 碰撞更加频繁且能量更高 → 更多粒子的能量超过活化能），以及 (b) 预测结果图应该呈现什么样子（显示速率随温度升高而增加的曲线，而不是直线，因为存在活化能分布）。暂时不要写作——这里只进行讨论。

*AI 行动：* 在第 10 分钟，AI 发送一条调节检查消息：“快速检查：小组中的每个人都能解释**为什么**温度升高会使反应速率加快吗？不要只说‘粒子运动得更快’——**为什么**运动加快会导致反应加快？如果有人不确定，现在就是提问的时机。下一阶段需要建立在你们的理解之上。”

**阶段 3：整合设计（25 分钟）**  
小组撰写整合报告。为防止任务拆分，采用**轮流执笔**结构：
- 第 1-8 分钟：A 同学执笔，其他人进行口头贡献。重点：方法（但每一步都必须用理论进行论证——“我们将温度加热到 40°C，因为……”）。
- 第 9-16 分钟：B 同学执笔，其他人进行贡献。重点：预测结果和理论解释（将图表形状与碰撞理论联系起来）。
- 第 17-25 分钟：C 同学执笔，其他人进行贡献。重点：风险评估和变量（将风险与具体的方法步骤联系起来，并解释控制变量）。
- D 同学在整个过程中担任“质量检查员”——其任务是确保每个部分都与其他部分相互衔接。

角色需要轮换，但关键设计特征是：执笔者必须整合小组的口头意见，而不能独自完成。其他三人要积极提出想法，而不是旁观。

*AI 行动：* 见下方的 AI 促进措施表。

**阶段 4：准备展示（10 分钟）**  
AI 随机选择一名小组成员展示报告并回答教师的问题。小组有 10 分钟确保被选中的成员能够解释全部内容，而不只是“自己负责的”部分。

*AI 行动：* 在阶段 4 开始时，AI 发送：“在展示环节中，[随机选中的姓名] 将解释整份报告并回答相关问题。小组：你们有 10 分钟确保 [姓名] 能够解释方法、理论、预测结果和风险评估的全部内容。请对其进行提问，找出知识盲点。”

**阶段 5：展示（每组 5 分钟）**  
被选中的成员进行展示。教师提问。这是个人责任机制——每位成员都必须理解整份报告，因为任何人都有可能被选中。

### AI 促进措施

| 触发条件 | AI 行动 | 目的 | 示例 |
|---|---|---|---|
| 阶段 1 结束（5 分钟） | 轮流发言提示 | 确保在讨论开始前听到每个人的意见 | “每个人分享个人笔记中的一件事情。按顺时针方向进行。每个人都发言一次后，任何人才可以第二次发言。” |
| 阶段 2，第 10 分钟 | 理解检查 | 在开始写作前确认共同理解 | “每个人都能解释**为什么**温度升高会使速率加快吗？不要只说‘发生了什么’，还要说明‘为什么会发生’。相互检查一下。” |
| 阶段 3，第 5 分钟 | 整合提示 | 防止方法部分在没有理论联系的情况下被写出 | “我注意到你们正在写方法步骤。对于每一步，都补充：‘我们选择这样做是因为……’，将其与对理论的理解联系起来。” |
| 阶段 3，某位学生连续 3 分钟以上没有参与 | 参与提示 | 防止学生 disengage | “[姓名]，你对[当前正在撰写的部分]有什么看法？小组现在需要你的意见。” |
| 阶段 3，第 20 分钟 | 进度检查 | 确保小组能够按计划完成 | “写作还剩 5 分钟。快速检查：你们是否已经将方法与理论、预测图表与碰撞模型联系起来？还有什么内容缺失？” |
| 阶段 4 开始 | 随机选择 + 准备提示 | 建立个人责任 | “[姓名] 已被选中进行展示。小组：用 10 分钟确保他们能够解释全部内容。” |

### 调节支架

**规划（第 2 阶段开始时）：** AI 发送：“在深入开始之前——请用 60 秒作为一个小组达成共识：对于这项任务来说，什么样的实验设计才算是 GOOD？什么会让你们的设计优于平均水平？写下你们小组的成功标准。”

**监控（第 3 阶段中途）：** AI 发送：“写作已经进行到一半了。回顾一下你们设定的成功标准。你们是否达到了这些标准？如果没有，需要调整什么？”

**反思（第 3 阶段结束、准备展示之前）：** AI 发送：“在准备展示之前——请作为一个小组做一个简短的反思：在这次合作中，最困难的部分是什么？下次你们会做出哪些不同的选择？”这有助于培养对合作过程本身的元认知意识。

### 公平机制

1. **小组讨论前的个人思考（第 1 阶段）。** 每位学生都带着自己的想法参加讨论。这可以防止从一开始就由声音最大的学生主导——每个人都有准备好的内容。

2. **轮流分享（第 2 阶段开始时）。** AI 强制执行“每个人先发言一次，之后任何人才能发言第二次”的规则。这确保安静的学生能在强势学生接管之前做出贡献。

3. **轮换作者结构（第 3 阶段）。** 没有任何一名学生可以独自完成整份报告。轮换机制迫使不同的人轮流执笔，减少“一个人包办一切”的问题。

4. **质量检查员角色。** D 同学的明确职责是确保内容整合，同时还要留意是否有人停止参与，并把他们重新带回合作中。

5. **随机选择展示者（第 4 阶段）。** 由于任何一名成员都有可能被选中，小组会受到激励，确保每个人都理解全部内容。那个“什么都没做”的搭便车者会成为小组的负担，小组会主动处理这一问题。

6. **AI 参与度监控。** AI 会检测个别学生长时间沉默的情况，并提示小组邀请他们参与。这能捕捉到教师可能忽略的参与度下降情况。

### AI 不会做什么

- **AI 不会回答化学问题。** 如果学生问 AI“什么是碰撞理论？”，AI 应回答：“这是一个很适合问你们小组的问题。问问他们——如果没人知道，就把这个问题标记出来，交给你的老师。”
- **AI 不会撰写报告的任何部分。** 它不会生成文本、提出方法步骤或绘制预测图像。
- **AI 不会评价科学内容的质量。** 它不会说“你们的方法很好”或“你们对理论的解释不完整”。质量评价是教师的职责。
- **AI 不会解决分歧。** 如果小组成员对预测图像的形状存在分歧，AI 应说：“你们存在分歧。很好——这说明有人在深入思考。每个人都能解释自己的推理吗？然后作为一个小组做出决定。”AI 促进的是解决分歧的过程，而不是分歧所涉及的内容。

---

## 已知限制

1. **由 AI 促进的合作依赖于可靠的 AI 监控。** 上述促进措施假设 AI 能够检测参与度失衡、沉默和偏离任务的行为。当前的 AI 系统在这些方面的能力各不相同——基于文本的监控是可行的，但要检测面对面小组在纸上工作时的参与度下降则要困难得多。该设计可能需要根据可用的具体 AI 系统进行调整。

2. **关于 AI 特定协作促进作用的证据仍在不断形成。** Dillenbourg (1999)、Slavin (1995) 以及 Järvelä & Hadwin (2013) 确立了有效协作的原则，但将 AI 具体应用于促进这些原则仍是一个较新的领域，受控研究相对较少。上述 AI 协作促进方式是基于既有研究进行的有原则推演，而非经过实证验证的 AI 干预措施。

3. **协作性认知负荷可能很高。** Kirschner et al. (2018) 指出，协调成本（沟通、协商、管理不同观点）会消耗认知资源。对于已经难以掌握学习内容的学生而言，结构化协作所带来的额外负荷可能会让他们不堪重负。教师应观察协作结构是在帮助学习还是阻碍学习。

4. **文化规范会影响协作。** Dillenbourg 的 (1999) 框架主要是在西方教育环境中形成的。在某些文化环境中，直接表达异议、质疑同伴的想法，或在被认为地位更高的人发言之前发言，可能会让人感到不适或不合适。AI 协作促进提示可能需要进行文化适配。