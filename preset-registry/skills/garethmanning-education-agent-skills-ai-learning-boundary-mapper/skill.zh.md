---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-learning-boundary-mapper
description: "Map which elements of an assignment benefit from AI assistance vs. which AI use undermines. Use when redesigning tasks for AI-age classrooms or setting defensible AI use policies for specific assignments."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/ai-learning-boundary-mapper"
skill_name: "AI Learning Boundary Mapper"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "moderate"
evidence_sources:
  - "Wiggins & McTighe (2005) — Understanding by Design (backward design and assessment alignment)"
  - "Bjork et al. (2013) — Self-regulated learning: beliefs, techniques, and illusions"
  - "Kazemitabaar et al. (2023) — Studying the effect of AI code generators on supporting novice learners"
  - "Kirschner, Sweller & Clark (2006) — Why minimal guidance during instruction does not work"
  - "Wineburg & McGrew (2019) — Lateral reading and the nature of expertise"
input_schema:
  required:
    - field: "assignment_description"
      type: "string"
      description: "The existing assignment — what students are asked to do, produce, or demonstrate"
    - field: "learning_objectives"
      type: "string"
      description: "What skills, knowledge, or dispositions the assignment is designed to develop"
  optional:
    - field: "current_ai_policy"
      type: "string"
      description: "What AI use is currently permitted, restricted, or undefined for this assignment"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The discipline"
    - field: "assessment_context"
      type: "string"
      description: "How the assignment is assessed — formative, summative, exam preparation, portfolio"
    - field: "tool_comparison_needed"
      type: "boolean"
      description: "Whether to also include a Google vs. AI chatbot tool comparison for the information-gathering components"
output_schema:
  type: "object"
  fields:
    - field: "objective_analysis"
      type: "object"
      description: "For each learning objective, analysis of whether AI assistance supports or undermines it — with reasoning"
    - field: "component_boundary_map"
      type: "object"
      description: "Component-by-component analysis of the assignment: AI-beneficial, AI-neutral, AI-undermining, with suggested modifications"
    - field: "ai_policy_recommendations"
      type: "object"
      description: "Specific, defensible AI use recommendations for this assignment — not blanket allow/prohibit but component-specific guidance"
    - field: "tool_comparison"
      type: "object"
      description: "When-to-use-search-vs-AI guidance for the information-gathering components of the assignment"
    - field: "redesign_suggestions"
      type: "array"
      description: "Specific assignment modifications that preserve challenge in learning-critical components while permitting AI use where it genuinely helps"
chains_well_with:
  - "metacognitive-monitoring-ai-contexts"
  - "backwards-design-unit-planner"
  - "assessment-validity-checker"
teacher_time: "5 minutes"
tags: ["AI-literacy", "assignment-design", "AI-policy", "backward-design", "tool-selection", "learning-objectives", "AI-boundaries"]
---
# AI 学习边界映射器

## 此技能的作用

针对特定作业，逐个组件生成分析，依据该作业所服务的学习目标，标明哪些部分能从 AI 辅助中受益、哪些部分不受影响，以及哪些部分会因 AI 介入而受到削弱。这是一种面向教师的 AI 时代作业再设计工具：它以现有作业为输入，生成一份边界图，帮助教师制定具体且有充分依据的 AI 使用政策，而不是笼统地采取“允许使用 AI”或“禁止使用 AI”的立场。其核心观点是：在同一份作业中，不同组件服务于不同的学习目标，而有助于某个组件的 AI 辅助，可能会削弱另一个组件。一篇同时要求研究（AI 可以协助总结背景）和原创论证（AI 辅助会绕过构建论证所需的认知工作）的文章，更适合采用组件级政策，而不是统一规定。输出内容包括：客观分析（针对每个学习目标，判断 AI 辅助是支持还是削弱该目标）、组件边界图、有充分依据的 AI 政策建议、可选的 Google 与 AI 聊天机器人工具比较（适用于信息收集任务），以及在允许 AI 用于真正有帮助的部分的同时，保留对学习至关重要的挑战的再设计建议。这项技能是对 `metacognitive-monitoring-ai-contexts` 的教师设计补充：边界映射可以防止元认知风险产生；`metacognitive-monitoring-ai-contexts` 则在风险产生时加以应对。

## 证据基础

Wiggins & McTighe (2005) 确立了逆向设计原则：评估设计应从学习目标（第 1 阶段）出发，逆向经过学习证据（第 2 阶段），再到学习活动（第 3 阶段）。这一原则直接适用于 AI 边界设定：问题不应是“这份作业是否应该使用 AI？”，而应是“这份作业服务于哪些学习目标，而 AI 辅助是支持还是绕过了这些目标所要求的认知工作？”Bjork et al. (2013) 记录了能力错觉，即学习者感觉自己学到的内容多于实际学到的内容的情况。AI 辅助会产生流畅性错觉：借助 AI 完成的任务让人感觉完整且正确，但产生持久学习所需的认知工作却被绕过了。边界图旨在识别作业中最容易受到这一影响的组件。Kazemitabaar et al. (2023) 提供了直接的实证证据：借助 AI 编程的学生能够更快地完成任务，错误也更少，但在随后不使用 AI 支持的任务中表现出较弱的理解力。这里以这一效应作为识别“AI 削弱型”组件的模型——凡是将认知过程（而不仅仅是最终产物）作为学习目标的任务，都属于这类组件。Kirschner, Sweller & Clark (2006) 证明，对于新手而言，最低限度的指导所产生的学习效果弱于明确指导，因为新手学习者需要通过任务本身的认知挑战，构建成为专家所需的知识结构。这支持了对以下组件的识别：在这些组件中，通过 AI 移除认知挑战，也会同时移除学习过程。Wineburg & McGrew (2019) 为工具比较这一维度提供了间接支持：不同的信息工具具有不同的认识论属性（可验证的引文与综合性推断），学生能够从关于针对不同信息需求选择何种工具的明确指导中受益。

## 输入模式

教师必须提供：
- **作业说明：** 学生需要完成什么。*例如："10 年级历史：撰写一篇 600 词论文，论证《凡尔赛条约》是否是第二次世界大战的主要原因，并至少使用三位指定历史学家的论点" / "9 年级科学：为反应速率实验撰写实验报告——方法、结果、分析、结论" / "12 年级英语：对课堂学习的两部文本进行比较论文写作"*
- **学习目标：** 该作业培养什么。*例如："学生学习构建基于证据的历史论证，评估相互竞争的史学解释，并恰当地使用来源证据" / "学生学习根据自己收集的数据撰写科学分析，并得出有效结论"*

可选（如可用，由上下文引擎注入）：
- **当前 AI 政策：** 当前允许什么
- **学生水平：** 年级
- **学科领域：** 学科
- **评估情境：** 形成性评估、总结性评估、备考
- **是否需要工具比较：** 是否应包含 Google 与 AI 的使用指导

## 提示词

```
You are an expert in curriculum and assessment design, with deep knowledge of Wiggins & McTighe's (2005) backward design, Bjork et al.'s (2013) research on illusions of competence, Kazemitabaar et al.'s (2023) empirical findings on AI assistance and learning, Kirschner et al.'s (2006) findings on minimally guided instruction, and Wineburg & McGrew's (2019) work on information tool evaluation. You understand that the question for AI boundary-setting is not "is AI helpful?" but "does AI assistance support or bypass the specific cognitive work this assignment requires?"

CRITICAL PRINCIPLES:
- **The learning objective is the boundary.** If the learning objective is "students will construct an argument," then AI-generated arguments bypass the learning, regardless of whether the final product is good. If the learning objective is "students will edit their argument for clarity," AI assistance does not bypass the learning — it supports a stage after the core cognitive work.
- **Blanket AI policies are not justified by this analysis.** The answer is almost never "no AI anywhere" or "AI everywhere." Within any assignment, some components are AI-beneficial, some AI-neutral, some AI-undermining. A defensible policy is component-specific.
- **Process components are more vulnerable than product components.** AI undermines learning most severely when the PROCESS of doing the task is the learning objective. Research, drafting, data analysis, problem construction — these are process objectives. Formatting, spell-checking, citation formatting — these are product objectives where AI assistance is generally neutral.
- **Novelty and transferability are the indicators.** AI is most harmful where students are building new knowledge structures or practising a transfer of learning to a new situation. It is least harmful for rote or clerical tasks. The boundary map should identify which components are knowledge-building and which are not.
- **The tool comparison matters.** For information-gathering tasks, search engines (verifiable citations, current information) and AI chatbots (synthesised inference, no attribution, training cutoff) have fundamentally different epistemic properties. Students should be explicitly directed to the appropriate tool for each information need.

Your task is to generate an AI learning boundary map for:

**Assignment description:** {{assignment_description}}
**Learning objectives:** {{learning_objectives}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**Current AI policy:** {{current_ai_policy}} — if not provided, assume no formal policy has been set.
**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the assignment.
**Assessment context:** {{assessment_context}} — if not provided, treat as a formative assessment task.
**Tool comparison needed:** {{tool_comparison_needed}} — if not provided, include tool comparison guidance if the assignment has a research or information-gathering component.

Return your output in this exact format:

## AI Learning Boundary Map: [Assignment Name]

**Assignment:** [Brief description]
**Key learning objectives:** [List]
**Assessment context:** [How this is assessed]

### Objective Analysis

[For each learning objective, a one-paragraph analysis of whether AI assistance supports, is neutral to, or undermines it — with explicit reasoning from the backward design principle]

| Learning Objective | AI Impact | Reasoning |
|---|---|---|
| [Objective] | Supports / Neutral / Undermines | [Why] |

### Component Boundary Map

[Break the assignment into 4-8 components. For each:]

**Component [N]: [Name]**
- **What students do:** [Description]
- **Serves objective:** [Which learning objective]
- **AI boundary:** AI-BENEFICIAL / AI-NEUTRAL / AI-UNDERMINING
- **Reasoning:** [Why this boundary — what cognitive work AI bypasses or supports]
- **Specific policy:** [Exactly what AI use is permitted or restricted for this component]

### AI Policy Recommendations

[Based on the component analysis, a specific, defensible AI use policy for this assignment. Not blanket allow/prohibit — component-specific guidance in plain language for students]

**Recommended policy statement:**
> [The exact wording a teacher could use in an assignment brief]

**Rationale for each restriction:** [Brief, student-accessible rationale for each restricted component — "AI is restricted here because this component develops [specific skill] that requires you to do the cognitive work yourself"]

### Tool Comparison

[If the assignment has information-gathering components — or if tool_comparison_needed is true:]

**For [information component]: Use [search / AI / library] because:**
[Guidance on which tool to use for which information need, with reasoning about the epistemic properties of each tool]

| Task | Best tool | Why |
|---|---|---|
| [Task] | [Tool] | [Epistemic reason] |

### Redesign Suggestions

[3-5 specific modifications to the assignment that strengthen the boundary between AI-assisted and learning-critical components, without fundamentally changing the assignment]

**Suggestion [N]: [Name]**
- **Current design:** [What the assignment currently asks]
- **Modification:** [What to change]
- **Why it helps:** [How this modification makes the learning-critical component more AI-resistant or makes AI assistance more obviously beneficial]

**Self-check before returning output:** Verify that (a) the objective analysis is specific to these learning objectives, not generic, (b) each component boundary is justified by a clear reasoning from the backward design principle, (c) the policy is component-specific rather than blanket, (d) the policy statement is in plain, student-accessible language, and (e) redesign suggestions are practical modifications, not wholesale rewrites.
```

## 输出示例

**情境：** *作业说明：“10 年级历史论文：600 词论证论文——《凡尔赛条约》是否是第二次世界大战的主要原因？必须使用至少三位具名历史学家及其观点。截止日期为下周。” / 学习目标：“学生将构建基于证据的历史论证；评估相互竞争的史学解释；恰当地选择和运用来源证据；以历史论证的分析性语体写作” / 评估背景：“总结性评估——占单元成绩的 30%”*

---

## AI 学习边界图：凡尔赛条约论证论文

**作业：** 关于《凡尔赛条约》是否是第二次世界大战主要原因的 600 词论证论文  
**关键学习目标：** 构建历史论证；评估史学解释；运用来源证据；以分析性语体写作  
**评估背景：** 总结性评估——占单元成绩的 30%

### 目标分析

| 学习目标 | AI 影响 | 推理 |
|---|---|---|
| 构建基于证据的历史论证 | 削弱 | 如果 AI 构建论证，学生练习的是阅读/编辑 AI 文本，而不是历史论证。选择立场并构建基于证据的支持论据这一认知工作被绕过。这是首要学习目标——在此处限制 AI 的使用最为关键。 |
| 评估相互竞争的史学解释 | 削弱 | 比较和评估 Fischer 与 Clark 或其他历史学家的观点，要求学生理解两种立场、比较其证据质量，并作出有理有据的判断。由 AI 完成这种比较会绕过评估所需的认知工作。 |
| 选择和运用来源证据 | 削弱 | 学生选择使用哪些证据并将其置入论证之中，是知识建构的一部分。AI 选择证据会绕过这一过程。但是：AI 发现某位特定历史学家的著作存在（书目协助）是中性的——学习目标是使用证据，而不是识别证据。 |
| 以历史论证的分析性语体写作 | 部分削弱 | 以一种新的语体写作需要练习。然而，使用 AI 改进学生自己撰写的草稿（发展性编辑）不同于使用 AI 生成草稿。前者提供支持，后者造成削弱。 |

### 组件边界图

**组件 1：研究——识别相关历史学家及其观点**
- **学生做什么：** 研究谁曾撰写关于凡尔赛作为第二次世界大战起因的内容，以及他们的观点是什么
- **服务于的目标：** 评估史学解释
- **AI 边界：** AI-NEUTRAL，附带注意事项
- **推理：** 发现 Fischer 主张 X 是一项检索任务；理解和评估 Fischer 的论点才是学习任务。AI 可以协助回答“哪些历史学家是相关的”——但学生必须自行阅读并理解这些论点。
- **具体政策：** 你可以使用 AI 识别相关历史学家，并获取其立场的简短摘要。之后，你必须阅读所引用每位历史学家的至少一份一手或二手来源。

**组件 2：规划论证**
- **学生要做什么：** 确定立场，并为论证这一立场规划基于证据的论据
- **服务于的目标：** 构建历史论证
- **AI 边界：** AI-UNDERMINING
- **理由：** 论证构建是核心学习目标。使用 AI 进行规划会绕过决定论证什么以及如何支持论点这一关键认知过程。
- **具体政策：** 不得使用 AI 规划论证。你的计划必须手写完成，或在没有 AI 协助的情况下完成。

**组件 3：起草论文**
- **学生要做什么：** 以历史写作的分析性文体写出论证
- **服务于的目标：** 历史论证和文体
- **AI 边界：** AI-UNDERMINING
- **理由：** 主要的学习过程发生在这里。写作就是思考——提出论证的过程就是形成理解的过程。使用 AI 起草会完全绕过这一过程。
- **具体政策：** 草稿必须由你本人完成。我们会将你的草稿与我们在网上找到的任何 AI 输出进行比对。

**组件 4：修改和编辑**
- **学生要做什么：** 改进草稿——提升清晰度、结构和论证力度
- **服务于的目标：** 以分析性文体写作（发展阶段）
- **AI 边界：** 在有限制的情况下，从 AI-NEUTRAL 到 AI-BENEFICIAL
- **理由：** 学生完成真实草稿后，使用 AI 识别论证结构中的薄弱环节或提出更清晰的措辞建议，属于发展性反馈，而不是生成论证。原始思考仍然属于学生本人。
- **具体政策：** 完成一份由学生本人撰写的完整草稿后，你可以使用 AI 提问：“你认为我的论证结构有哪些薄弱之处？”或“这一段是否清晰？”不要要求 AI 重写段落——应要求它为你指出问题，由你自己进行修改。

**组件 5：引用格式**
- **学生要做什么：** 正确设置引用格式
- **服务于的目标：** 所列目标均不涉及
- **AI 边界：** AI-BENEFICIAL
- **理由：** 引用格式设置是一项不服务于既定学习目标的文书性工作。在不影响学习的情况下，使用 AI 协助可以节省时间。
- **具体政策：** 允许并鼓励使用 AI 引用格式工具。

### AI 政策建议

**建议的政策声明：**
> 对于这篇论文：AI 可用于（1）找出相关历史学家并简要总结其观点——但你必须至少阅读每位所引用历史学家的一份资料；（2）对你已经完成的草稿提供反馈——应询问“我的论证有什么薄弱之处？”，而不是“帮我写一个更好的版本”；（3）设置引用格式。不得使用 AI 规划论证、完成草稿或重写论文段落。你的计划必须手写完成。你的草稿必须由你本人撰写。

**各项限制的理由：**
- “不得使用 AI 进行规划：决定论证什么以及如何支持论点，正是这篇论文旨在培养的技能。如果由 AI 做出这一决定，你就无法练习这项技能。”
- “不得使用 AI 起草：写出论证的过程正是你形成本单元所关注的历史思维的方式。如果由 AI 来写，你就会错过学习过程。”

### 工具对比

| 任务 | 最佳工具 | 原因 |
|---|---|---|
| 查找哪些历史学家撰写过关于凡尔赛宫的作品 | 搜索引擎（Google Scholar、图书馆数据库） | 搜索可以提供真实且可引用的来源；AI 可能会给出真实的历史学家，但也可能虚构具体论文 |
| 简要了解某位历史学家的论点 | AI 聊天机器人（需核实） | AI 适合快速总结，但在依赖总结之前，应将其与真实来源进行核对 |
| 查找某个来源的出版日期或完整标题 | 图书馆数据库或出版商网站 | AI 可能会提供看似合理但错误的书目信息；务必进行核实 |
| 检查你的论证结构是否清晰 | AI 聊天机器人 | 对完成的草稿提供结构性反馈，是适合使用 AI 的场景 |

### 重新设计建议

**建议 1：增加手写计划提交环节**
- **当前设计：** 学生提交论文；不要求完成中间阶段
- **修改方案：** 要求学生在论文截止日期前一天提交手写论文计划（论点 + 证据提纲）
- **帮助原因：** 这会使 AI 规划更容易被发现，并改变激励结构——尚未自行规划的学生无论如何都必须从头完成计划

**建议 2：加入“历史学家选择理由”字段**
- **当前设计：** 学生引用历史学家，但不解释为什么选择他们
- **修改方案：** 增加要求：对于每一位被引用的历史学家，用一句话解释你为什么选择这位历史学家的论点，以及该论点为你的论证增添了什么
- **帮助原因：** 如果没有暴露 AI 的参与，这句话无法由 AI 生成——它要求学生表达自己的评价性推理

**建议 3：用指定来源集替代开放式研究阶段**
- **当前设计：** 学生独立开展研究
- **修改方案：** 为学生提供 4-5 段历史学家摘录供其使用——他们不能使用来源集之外的历史学家
- **帮助原因：** 完全移除研究阶段（从而降低该阶段的 AI 风险），并将所有学习时间集中于使用一组明确的来源进行论证和评价

---

## 已知局限

1. **此技能分析的是作业设计，而不是学生行为。** 一项有充分依据的 AI 政策并不能阻止 AI 的使用——它可以明确划定边界的学习依据，改变激励结构，并为教师进行识别和反馈提供有原则的基础。即使如此，仍有学生会决定在整个过程中使用 AI。

2. **AI 检测并不可靠。** 声称能够检测 AI 生成文本的工具，误报率和漏报率都很高。边界建议不应依赖可靠的检测——设计时应确保 AI 的使用要么确实无害，要么能够在教育过程中显现出来。

3. **设定边界会带来公平性影响。** 无力承担私人辅导费用的学生，可能会以类似昂贵私人辅导的方式依赖 AI 作为认知支架——统一限制 AI 的使用可能会对他们造成不成比例的不利影响。教师应考虑，对于已确定有支持需求的学生，是否可以对不依赖 AI 的组成部分采取更宽松的规定。

4. **针对 AI 的逆向设计应用缺乏直接的实证验证。** 逆向设计原则（Wiggins & McTighe，2005）以及认知负荷和能力错觉的证据基础，在一般学习设计领域已有充分证据支持。将其具体应用于 AI 边界设定是有理论依据的，但仍属新颖尝试——目前还缺乏大量实证证据来证明，哪些类型的 AI 边界最能在允许有用的 AI 使用的同时，最有效地保留学习效果。