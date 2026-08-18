---
# AGENT SKILLS STANDARD FIELDS (v2)
name: prompt-literacy-sequence-designer
description: "Design a learning sequence teaching prompt quality — comparing vague vs. refined prompts to show why specificity and context transform AI output. Use when students use AI without understanding why output quality varies."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/prompt-literacy-sequence-designer"
skill_name: "Prompt Literacy Sequence Designer"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "low-moderate"
evidence_sources:
  - "Brown et al. (2020) — Language Models are Few-Shot Learners (GPT-3 few-shot prompting)"
  - "Liu et al. (2023) — Pre-Train, Prompt, and Predict: a systematic survey of prompting methods in NLP"
  - "Reynolds & McDonell (2021) — Prompt programming for large language models: beyond the few-shot paradigm"
  - "Rosenshine (2012) — Principles of instruction (modelling and guided practice framework)"
  - "Willingham (2007) — Critical thinking: why is it so hard to teach? (specificity in task design)"
input_schema:
  required:
    - field: "subject_area"
      type: "string"
      description: "The discipline context for prompt examples — affects what good specificity looks like"
    - field: "student_level"
      type: "string"
      description: "Age/year group and current AI usage habits"
    - field: "ai_task_type"
      type: "string"
      description: "What students are using AI for — research, writing help, explanation, problem-solving, revision"
  optional:
    - field: "prompt_literacy_focus"
      type: "string"
      description: "Which prompt dimension to emphasise — context specificity, constraint provision, format specification, persona/role, or iterative refinement"
    - field: "common_student_prompts"
      type: "string"
      description: "Examples of the vague prompts students typically use — helps generate realistic before/after comparisons"
    - field: "time_available"
      type: "string"
      description: "Time available for the prompt literacy sequence"
output_schema:
  type: "object"
  fields:
    - field: "prompt_anatomy"
      type: "object"
      description: "Breakdown of the components of an effective prompt — context, task, constraints, format, persona — with subject-specific examples"
    - field: "compare_contrast_sequence"
      type: "object"
      description: "Structured compare-contrast activity: vague prompt vs. refined prompt, with guided analysis of what changed and why output quality improved"
    - field: "prompt_rewriting_activity"
      type: "object"
      description: "Student activity: take weak prompt → analyse what's missing → rewrite → compare outputs"
    - field: "pricing_exercise"
      type: "object"
      description: "The Pricing Exercise adaptation: show how adding constraints step-by-step transforms a context-free AI answer into a useful one"
    - field: "prompt_principles_summary"
      type: "object"
      description: "A concise student-facing summary of prompt principles with examples, usable as a reference card"
chains_well_with:
  - "ai-output-critical-audit-designer"
  - "metacognitive-monitoring-ai-contexts"
  - "explicit-instruction-sequence-builder"
teacher_time: "4 minutes"
tags: ["AI-literacy", "prompt-engineering", "prompt-literacy", "specificity", "AI-use", "context", "constraints"]
---
# 提示词素养序列设计师

## 此技能的作用

生成一个结构化的学习序列，教导学生理解为什么提示词质量决定 AI 输出质量，以及哪些具体的提示词调整能够带来更有用、更准确且更符合语境的回答。该序列采用比较—对照结构：学生针对同一个问题分别运行模糊提示词和经过完善的提示词，分析输出质量的差异，并提炼其中的原则。核心洞见是，AI 会用统计上最常见的回答来填补缺失的上下文信息，因此，如果提示词没有提供有关受众、目的、学科或限制条件的上下文，得到的回答就会以平均情境为基准，而不是针对学生的具体情况进行调整。序列将“定价练习”（Kharbach，2026）作为核心活动：学生从一个没有上下文的 AI 回答（“我应该为一项服务收取多少钱？”）开始，逐步添加限制条件（服务类型、地点、目标市场、质量水平），实时展示具体化如何将输出从笼统且缺乏帮助的内容转变为真正有用的回答。该序列教授提示词的五个维度：上下文（我是谁，我正在做什么？）、任务（我究竟想要什么？）、限制条件（有哪些限制适用？）、格式（输出应如何组织？）以及角色设定（AI 应承担什么角色？）。提示词素养是有效使用 AI 的先决条件，也是 AI 输出评估技能的直接补充。

## 证据基础

Brown 等人（2020）在 GPT-3 论文中通过实证研究证明，提示词的表述方式会显著影响模型输出质量——在提示词中加入少样本示例（向 AI 展示良好回答的样子）所产生的结果，明显优于零样本提示词（不提供示例）。这是提示词设计并非任意为之的基础证据。Liu 等人（2023）对提示方法进行了系统性综述，记录了不同提示词结构（思维链、角色扮演、遵循指令、少样本）如何影响不同任务中的输出质量。这项综述表明，提示词工程是一项具有可学习原则的技能，而不是凭运气。Reynolds 和 McDonell（2021）将这一研究拓展到“元提示词”概念——即明确指示 AI 应如何进行推理、组织回答或采用某种角色的提示词——并表明这些结构性元素能够显著提升输出质量。这三项研究为提示词素养教学提供了针对 AI 的证据基础。然而，目前关于如何*教授*学生提示词素养的教学法证据仍然非常有限——这在教育研究中属于前沿领域。其余文献支持该序列的*教学设计*：Rosenshine（2012）提供了此处采用的示范 → 指导性练习 → 独立练习结构；Willingham（2007）则提出了领域特殊性论证（在历史学中什么样的提示词算是好的提示词，与在数学中什么样的提示词算是好的提示词并不相同），为开展学科特定的提示词素养教学提供了依据。

## 输入模式

教师必须提供：
- **学科领域：** 学科名称。*例如：“历史” / “生物学” / “英语语言与文学” / “数学”*
- **学生水平：** 年级组以及当前的 AI 使用情况。*例如：“10 年级，经常使用 ChatGPT 完成作业，但得到的输出很笼统，觉得没有帮助” / “12 年级，使用 AI 进行研究和写作初稿，但尚未接受过明确的提示策略教学”*
- **AI 任务类型：** 学生使用 AI 完成的任务。*例如：“研究：获取论文主题的背景信息” / “写作：生成段落初稿并获取反馈” / “解释：请 AI 解释自己错过的概念”*

可选项（如有，可由上下文引擎注入）：
- **提示素养重点：** 需要重点强调的提示维度
- **学生常用提示：** 学生目前使用 AI 时的真实提示示例
- **可用时间：** 该学习序列的持续时间

## 提示

```
You are an expert in AI literacy pedagogy and instructional design, with knowledge of prompt engineering research (Brown et al. 2020; Liu et al. 2023; Reynolds & McDonell 2021) and instructional design principles (Rosenshine, 2012; Willingham, 2007). You understand that prompt literacy is a genuinely new skill with limited dedicated pedagogical research — the strongest evidence base is for the technical principles (prompt structure affects output quality) rather than for specific teaching methods. You will design a learning sequence grounded in instructional design principles applied to this new domain.

CRITICAL PRINCIPLES FOR PROMPT LITERACY:
- **AI fills missing context with the average.** When a student writes "explain photosynthesis," the AI generates an explanation calibrated for the most likely reader of that query — probably a general adult, not a Year 10 student preparing for a specific exam. Good prompts close the gap between the average case and the specific case.
- **Constraints are productive, not restrictive.** Most students think a prompt is "finished" when they've stated the task. Constraints — "in no more than 200 words," "without using the word 'significant'," "for an audience who has never studied biology" — transform output quality because they force the AI to solve a more specific problem.
- **Prompt literacy is discipline-specific.** What makes a good prompt for a History essay is different from what makes a good prompt for a Physics problem explanation. The principles are the same; the application differs.
- **Compare-contrast is the core learning mechanism.** Students learn prompt literacy most effectively by running two prompts side-by-side and analysing the difference — not by memorising rules. The rules become intelligible through contrast.
- **Prompt improvement is iterative, not one-shot.** Expert AI users refine their prompts based on the output they receive. Students need to understand that a first prompt is a starting point, not a final request.

Your task is to design a prompt literacy learning sequence for:

**Subject area:** {{subject_area}}
**Student level:** {{student_level}}
**AI task type:** {{ai_task_type}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**Prompt literacy focus:** {{prompt_literacy_focus}} — if not provided, address all five prompt dimensions (context, task, constraints, format, persona) but weight the sequence toward the 2-3 most relevant for the stated AI task type.
**Common student prompts:** {{common_student_prompts}} — if not provided, generate realistic examples of how students at this level typically prompt AI for this task type — usually brief, task-only, no context.
**Time available:** {{time_available}} — if not provided, design for a 30-minute lesson or homework task.

Return your output in this exact format:

## Prompt Literacy Sequence: [Subject/Task Type]

**For:** [Student level]
**AI task type:** [What students are using AI for]
**Sequence focus:** [Which prompt dimensions are emphasised and why]

### Prompt Anatomy

[The five prompt dimensions with subject-specific examples for each:]

**1. Context:** [What context is — who I am, what I'm doing, why. Subject-specific example of no context vs. good context]
**2. Task:** [What task specificity means beyond just "explain X." Subject-specific example]
**3. Constraints:** [What constraints do — how they force more specific, useful output. Subject-specific example]
**4. Format:** [What format specification achieves. Subject-specific example]
**5. Persona:** [What role assignment achieves. Subject-specific example]

### Compare-Contrast Activity

**Vague prompt:** [A realistic example of how students currently write prompts for this task]

**What AI gives back:** [Description of what output this prompt generates — generic, unspecific, average-case]

**Refined prompt:** [The same task with all relevant dimensions added]

**What AI gives back:** [Description of how output quality changes — specific, audience-calibrated, more useful]

**Analysis questions for students:**
[4-5 questions that guide students to identify WHY the refined prompt produced better output — not just "it's better" but what specifically changed]

### The Pricing Exercise

[The core activity: a demonstration of how iterative constraint-adding transforms AI output.]

**The base prompt:** [A context-free question relevant to this subject area that produces a generically unhelpful answer]

**Step 1 — Add audience context:** [The prompt after adding who the user is and their purpose]
**Observed change:** [What changes in the output]

**Step 2 — Add constraints:** [The prompt after adding specific constraints relevant to the context]
**Observed change:** [What changes in the output]

**Step 3 — Add format specification:** [The prompt after adding output format requirements]
**Observed change:** [What changes in the output]

**The principle:** [One sentence: what this exercise demonstrates about the AI fill-with-average principle]

### Prompt Rewriting Activity

**Instructions:** [Step-by-step instructions for students to diagnose and rewrite a weak prompt]

**Weak prompt to rewrite:** [A realistic student prompt for this subject and task]

**Diagnosis framework:** [Questions students answer before rewriting: What context is missing? What constraints would improve this? What format would be most useful? What persona would help?]

**Student rewriting space:** [Guided template with slots for each prompt dimension]

**Share and compare:** [How students share their rewrites and compare outputs]

### Prompt Principles Summary Card

[A concise, printable reference for students — 5 principles with one-line explanations and short examples from this subject area]

**Self-check before returning output:** Verify that (a) examples are specific to the stated subject and AI task type, (b) the compare-contrast shows a concrete, observable difference in output quality, (c) the Pricing Exercise uses a realistic base prompt that genuinely produces a generically unhelpful answer, (d) the rewriting activity requires student judgment, not just slot-filling, and (e) the principles summary is genuinely memorable, not a list of abstract rules.
```

## 示例输出

**场景：** *学科领域：“历史” / 学生年级：“11 年级，经常使用 ChatGPT 寻求论文写作帮助，但持续得到没有回应其具体考试要求的通用输出” / AI 任务类型：“写作：获取论文论点和段落结构方面的帮助” / 学生常用提示词：“帮我写一篇关于第一次世界大战起因的论文” / “帮我写一段关于《凡尔赛条约》的内容”*

---

## 提示词素养训练序列：历史论文写作（11 年级）

**适用对象：** 11 年级历史学生，具备 AI 使用经验但经常得到通用输出  
**AI 任务类型：** 论文论点和段落写作帮助  
**序列重点：** 上下文（针对考试的具体框架）和限制条件（论点结构、证据要求、字数限制）——对于这一使用场景，这两个维度能带来最大的质量提升

### 提示词剖析

**1. 上下文：** 没有上下文时，AI 会面向一篇关于第一次世界大战的论文的普通读者来写作——也就是一般成年人。*没有上下文：*“帮我写一段关于《凡尔赛条约》的内容。” *有上下文：*“我是一名英国 11 年级学生，正在写一篇 AQA GCSE 历史论文。我需要论证《凡尔赛条约》是第二次世界大战最重要的起因。”

**2. 任务：** 只陈述主题是不够的——要说明你需要构建的具体论点。*模糊的任务：*“解释《凡尔赛条约》。” *具体的任务：*“解释《凡尔赛条约》的经济条款如何促成了 20 世纪 20 年代德国的政治不稳定。”

**3. 限制条件：** 限制条件能把 AI 生成的论文转化为可用的段落。*没有限制条件：*你会得到一篇 500 多字、风格任意的内容。*有了限制条件：*“大约 120 字，结构为：论点、证据、分析、回扣论点”——你会得到一段可以直接使用的内容。

**4. 格式：** 指定结构。“使用 PEEL 结构（Point、Evidence、Explanation、Link）”或“写成我可以自行扩展的项目符号，而不是完整段落”——这会产生本质不同、也更有用的输出。

**5. 人设：**“扮演一名严格的 GCSE 历史考官”会产生不同于未指定人设的反馈。“扮演一名比我高一年级且取得最高分的学生”则会改变语言风格。

### 对比活动

**模糊提示词：**“帮我写一段关于《凡尔赛条约》的论文内容”

**AI 的输出：** 一段 200 字左右的通用内容，解释《凡尔赛条约》是什么、它的条款，以及它“导致了德国的不满”。其中没有具体论点，没有 GCSE 考试要求的结构，而且会因为只是在描述而非分析而得分较低。

**优化后的提示词：**“我正在写一篇 GCSE 历史论文，论证《凡尔赛条约》是纳粹崛起最重要的原因。我需要一段结构清晰的内容（约 120 字），采用 PEEL 格式（Point、Evidence、Explanation、Link），并使用至少一项条约条款中的具体证据。重点讨论经济后果，而不是领土后果。”

**AI 的输出：** 一段 120 字的内容，以清晰的历史论点开头，使用具体的赔款金额（66 亿英镑）作为证据，解释其中的因果机制（经济不稳定 → 失业 → 极端主义），并明确回扣关于纳粹崛起的论文论点。结构合理，符合考试要求，可以立即使用。

**供学生思考的分析问题：**
- “我在优化后的提示词中添加了哪些信息，而模糊的提示词中没有？请列出这些信息。”
- “为什么指定‘经济后果’而不是‘领土后果’，会改变 AI 所写的内容？”
- “AI 之所以采用 PEEL 结构，是因为我要求它这样做。如果我没有指定格式，会发生什么？”
- “如果 AI 的第一次输出很笼统，这是 AI 的问题，还是提示词的问题？这说明了什么？”
- “如果要让同一篇作文得到不同的段落，你会如何改写优化后的提示词？”

### 定价练习

**基础提示词：**“我应该使用哪些例子来支持我的历史作文论点？”

**观察到的变化——添加受众背景后：**“我正在写一篇 Year 11 GCSE 历史作文，论题是《凡尔赛条约是否是纳粹主义兴起的主要原因》。我应该使用哪些例子来支持这一论点？”→ AI 现在会生成与魏玛德国和纳粹崛起相关的例子，而不是随机的历史例子。

**第 2 步——添加限制条件：**“……我应该使用哪 3 条具体证据？每条证据都应当是一个事实、统计数据或有明确日期的事件。”→ AI 会生成三条简洁、具体且可以标明日期的证据，而不是一份笼统的主题列表。

**第 3 步——添加格式要求：**“……请将每条证据呈现为：[证据]——[这如何支持我的论点]。”→ AI 现在会生成一个结构清晰、可以直接使用的参考工具，而不是连贯的散文式文字。

**原则：**AI 会从平均情况出发；你添加的每一条限制，都会让输出更接近你的具体情境。

### 提示词改写活动

**说明：**
1. 阅读下面的薄弱提示词。
2. 使用框架中的四个问题对其进行诊断。
3. 使用模板改写它——不要只是把它写得更长，而要让每个维度都更加具体。
4. 将你的改写与同伴的版本进行比较。

**需要改写的薄弱提示词：**“为我的作文解释第一次世界大战的原因。”

**诊断框架：**
- 缺少哪些背景信息？（你是谁？这是用于什么考试/任务？你正在构建什么论点？）
- 哪些限制条件会让结果更好？（字数限制？需要重点关注哪些具体原因？哪些原因应当排除？）
- 什么格式最有用？（列表？PEEL 段落？用于规划的项目符号？）
- 什么角色设定会有所帮助？（提供反馈的阅卷者？解释这场争论的历史学家？）

**学生改写模板：**
“我是[背景：你是谁，以及这项任务是什么]。我需要[具体任务：准确说明你想要什么，而不只是说明主题]。请[限制条件：需要包含/排除哪些内容、大致长度、具体角度]。请将你的回答格式化为[格式：你想要的结构]。[可选：请以一名[角色设定]的身份来处理。]”

**分享与比较：**两人一组，分别运行自己改写后的提示词，并比较输出结果。讨论：哪一个改写版本产生了更有用的回答？五个维度中哪一个产生了最大的影响？你会对同伴的改写添加什么内容？

### 提示词原则总结卡片

1. **先提供背景信息。** 告诉 AI 你是谁、主题/水平是什么，以及输出的用途。没有背景信息，AI 不知道答案具体是为谁准备的。
2. **明确任务要求。** “解释 X”通常远远不够。说明你需要回答的论点、角度或具体问题。
3. **添加约束条件。** 字数限制、必须提供的证据、排除的方法——约束条件会促使输出更具体、更有用。
4. **指定格式。** PEEL、项目符号、编号列表、对话等——说明你需要的结构只需 5 秒，却能节省大量编辑时间。
5. **逐步改进，不要重新开始。** 如果第一次输出不太符合要求，可以回复：“这部分不错，但[具体问题]。请修改[具体元素]。”迭代比从头重写更快。

---

## 已知局限性

1. **关于向学生教授提示词素养的教学证据非常有限。** 关于提示词工程的研究（Brown et al. 2020; Liu et al. 2023; Reynolds & McDonell 2021）记录了提示词结构会影响输出质量，但并未研究教授这项技能的教学方法。本教学序列将既有的教学设计原则（比较-对照、示范、指导性练习）应用于一个前沿领域。教师应将其视为有原则但仍属暂定性的方案。

2. **随着 AI 模型的改进，提示词素养的有效期较短。** 当前模型需要明确的背景信息和约束条件，因为它们会用统计平均值填补缺失信息。未来的模型可能会更擅长推断背景信息，从而使某些提示词策略失效。其底层原则（清晰、具体的沟通比模糊的请求能产生更好的结果）不太可能变得无关紧要；具体做法可能会改变。

3. **教授提示词素养可能会增加对 AI 的依赖。** 学会编写更好的提示词后，学生将获得更有用的 AI 输出，这可能会降低他们发展独立技能的动机。这项技能应始终与 `ai-output-critical-audit-designer` 和 `metacognitive-monitoring-ai-contexts` 配套使用，以确保提示词素养属于批判性 AI 素养框架的一部分，而不是纯粹的生产力优化。

4. **提示词的结果具有概率性，而非确定性。** 同一个提示词在不同运行中可能产生不同的输出。比较-对照活动应承认这一点——学生可能需要运行提示词 2-3 次才能观察到一致的模式，而“改进后的提示词总是更好”并不完全准确（它通常会更好，其改进方式也符合相关原则，但并非总是如此）。