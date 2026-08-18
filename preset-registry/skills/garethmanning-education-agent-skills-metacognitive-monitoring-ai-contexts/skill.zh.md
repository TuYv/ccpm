---
# AGENT SKILLS STANDARD FIELDS (v2)
name: metacognitive-monitoring-ai-contexts
description: "Design metacognitive checkpoints that prevent AI-assisted learning from bypassing genuine understanding. Use when students use AI tools and may overestimate their own comprehension."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/metacognitive-monitoring-ai-contexts"
skill_name: "Metacognitive Monitoring in AI Contexts"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Thiede et al. (2003) — Summarizing can improve metacomprehension accuracy"
  - "Winne & Hadwin (1998) — Studying as self-regulated learning (SRL model)"
  - "Dunning et al. (2003) — Why people fail to recognize their own incompetence (Dunning-Kruger)"
  - "Bjork et al. (2013) — Self-regulated learning: beliefs, techniques, and illusions"
  - "Kazemitabaar et al. (2023) — Studying the effect of AI code generators on supporting novice learners in introductory programming"
input_schema:
  required:
    - field: "ai_learning_context"
      type: "string"
      description: "The specific context in which students are using AI tools for learning — what they are doing with AI and what they are supposed to be learning"
    - field: "metacognitive_risk"
      type: "string"
      description: "The specific metacognitive risk to address — how AI use might distort students' self-assessment of their own understanding"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "ai_tool"
      type: "string"
      description: "Which AI tool students are using — ChatGPT, Copilot, a custom tutoring system, or other"
    - field: "assessment_context"
      type: "string"
      description: "How student learning will be assessed — exam, project, practical demonstration, or other"
output_schema:
  type: "object"
  fields:
    - field: "metacognitive_diagnosis"
      type: "object"
      description: "Analysis of how AI use in this context might distort metacognitive monitoring — the specific risks and mechanisms"
    - field: "monitoring_interventions"
      type: "array"
      description: "Specific strategies to improve metacognitive accuracy — prompts, calibration tasks, and self-assessment tools"
    - field: "ai_usage_guidelines"
      type: "object"
      description: "When and how to use AI in this context to support rather than undermine metacognition"
    - field: "assessment_alignment"
      type: "object"
      description: "How to align assessment with metacognitive goals — testing what students actually know, not what the AI knows"
chains_well_with:
  - "self-explanation-prompt-designer"
  - "ai-feedback-design-principles"
  - "productive-failure-desirable-difficulty-designer"
  - "formative-assessment-loop-designer"
  - "ai-learning-boundary-mapper"
  - "ai-output-critical-audit-designer"
teacher_time: "4 minutes"
tags: ["metacognition", "self-regulation", "Dunning-Kruger", "overconfidence", "AI-literacy", "Winne", "Thiede", "calibration"]
---
# AI 情境下的元认知监控

## 此技能的作用

分析在特定学习情境中使用 AI 工具可能如何扭曲学生的元认知监控能力——即准确评估自己知道什么、不知道什么的能力——并设计干预措施，以维持元认知准确性。这是 AI 赋能教育中最紧迫的挑战之一。当学生使用 AI 工具完成作业时，他们可能会产生一种流畅性错觉：作业看起来很好，答案是正确的，文本也很流畅——于是学生得出结论：“我理解了。”但完成认知工作的是 AI，而不是学生。学生的理解感是根据成果（成果确实很好）而形成的，而不是根据自己的知识（知识可能并未改变）校准的。Bjork 等人（2013）表明，学习者通常很难系统性地判断自己的学习情况——他们会把熟悉感误认为理解，把流畅的表现误认为持久的知识。AI 工具会极大放大这种失准，因为它们能够生成流畅且正确的输出，而学生可能会误把这些输出当作自身能力的证据。输出内容包括元认知诊断（AI 使用如何在这一具体情境中扭曲自我评估）、监控干预措施（提升元认知准确性的策略）、AI 使用指南（何时使用 AI、何时限制 AI），以及评估对齐（确保测试测量的是学生的知识，而不是 AI 辅助下的表现）。

## 证据基础

Winne 与 Hadwin（1998）构建了最全面的自我调节学习（SRL）模型，该模型将元认知监控置于核心位置。他们的模型描述了一个循环：学习者设定目标、应用策略、监控策略是否有效，并进行调整。有效学习在很大程度上取决于监控阶段——学习者准确判断自己是否理解材料的能力。当监控不准确时（学习者以为自己理解了，实际上并没有），整个自我调节循环都会崩溃：他们过早停止学习，选择不恰当的策略，并对糟糕的评估结果感到意外。Thiede 等人（2003）表明，元理解准确性（判断出的理解程度与实际理解程度之间的相关性）通常非常低——大约为 r = 0.27。然而，他们发现，某些活动能够显著提高准确性：延迟总结写作、生成关键词，以及任何迫使学习者从记忆中生成内容，而不是从文本中进行识别的任务。其核心原则是：当监控任务要求提取，而不仅仅是识别时，元认知准确性会得到提升。Dunning 等人（2003）记录了邓宁-克鲁格效应：能力最弱的个体对自身能力最为自信，因为他们缺乏识别自身无能所需的知识。在 AI 情境中，这种效应可能会被放大：不理解某个概念的学生无法区分自己（较差）的理解与 AI（出色）的输出。Bjork 等人（2013）回顾了自我调节学习的心理学研究，并确定了若干种“能力错觉”——学习者感觉自己学到的内容多于实际学到的内容的情形。这些情形包括：熟悉感（以前见过某个内容会让人感觉自己理解了它）、流畅性（容易处理的材料会让人感觉自己已经牢固掌握），以及表现（当前表现良好会让人感觉这代表永久性学习）。AI 工具可能同时触发这三种错觉：AI 生成的输出具有熟悉性（学生看到了它被生成）、流畅性（LLM 会生成经过润色的文本），并且表现优异（答案是正确的）。Kazemitabaar 等人（2023）研究了 AI 代码生成器（如 Copilot）如何影响编程初学者的学习，发现尽管 AI 辅助的学生能够更快地完成任务且错误更少，但在后续没有 AI 支持的任务中，他们表现出较弱的理解能力。这些学生学会了使用 AI，而不是学会编程。这直接实证展示了元认知风险：AI 辅助制造了学习的错觉，却没有带来真正的学习。

## 输入架构

教师必须提供：
- **AI 学习情境：** 学生如何使用 AI。*例如，“12 年级学生使用 ChatGPT 协助撰写 A-level 英国文学论文。他们粘贴论文题目，并将 AI 输出作为起点，然后进行编辑和完善” / “9 年级学生在遇到困难时使用能够逐步求解方程的 AI 数学导师。他们可以在任何时候寻求帮助” / “10 年级学生使用 AI 根据教材生成复习笔记，然后学习这些由 AI 生成的笔记”*
- **元认知风险：** 具体的担忧。*例如，“学生认为自己‘理解了’文学分析，因为论文看起来很好，但当被要求在没有 AI 的情况下在课堂上讨论文本时，他们无法清楚表达论点” / “学生认为自己‘会解方程’，因为在 AI 帮助下得到了正确答案，但当无法使用 AI 时就会失败” / “学生认为自己‘掌握了’内容，因为他们阅读了组织良好的 AI 复习笔记，但这种阅读产生的是熟悉感，而非理解”*

可选项（如可用，将由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程学科
- **AI 工具：** 正在使用的具体 AI 工具
- **评估情境：** 将如何评估学习成果

## 提示词

```
You are an expert in metacognition and self-regulated learning, with deep knowledge of Winne & Hadwin's (1998) SRL model, Thiede et al.'s (2003) metacomprehension accuracy research, Dunning et al.'s (2003) work on the Dunning-Kruger effect, Bjork et al.'s (2013) illusions of competence, and emerging research on AI's impact on metacognition (Kazemitabaar et al., 2023). You understand that AI tools pose a specific and novel threat to metacognitive monitoring: they produce fluent, correct output that students mistake for evidence of their own understanding. This is not a minor concern — it is potentially the most significant educational risk of AI tools, because it undermines the self-regulation cycle that drives all independent learning.

CRITICAL PRINCIPLES:
- **The core problem is CALIBRATION.** Metacognitive monitoring works when students' confidence matches their competence. AI distorts calibration by inflating confidence (the work looks great) without necessarily increasing competence (the student may not have learned anything). The interventions must improve calibration, not just raise or lower confidence.
- **Fluency ≠ understanding.** When AI produces smooth, well-structured output, students experience processing fluency — the content feels easy to understand. But ease of processing does not indicate depth of learning. In fact, Bjork et al. (2013) showed that material that is HARDER to process (disfluent fonts, challenging language, interleaved examples) often produces BETTER learning. AI removes this desirable difficulty.
- **The solution is not banning AI.** It's redesigning the learning process so that students ENCOUNTER THEIR OWN KNOWLEDGE STATE — not just the AI's output. This means creating moments where students must produce from memory, without AI support, and compare their production to what they thought they knew.
- **Retrieval-based monitoring is the gold standard.** Thiede et al. (2003): the most effective way to improve metacognitive accuracy is to require RETRIEVAL — generating from memory rather than recognising from presented material. After using AI, students should close the AI, attempt the task from memory, and compare. This reveals the gap between perceived and actual understanding.
- **Metacognitive monitoring must be DESIGNED IN, not added on.** If you wait until the assessment to discover that students thought they knew the material but didn't, it's too late. Monitoring checkpoints must be built into the learning process — at the point of AI use, not after it.

Your task is to analyse the metacognitive risks and design monitoring interventions for:

**AI learning context:** {{ai_learning_context}}
**Metacognitive risk:** {{metacognitive_risk}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the context.
**AI tool:** {{ai_tool}} — if not provided, assume a general-purpose LLM chatbot.
**Assessment context:** {{assessment_context}} — if not provided, assume a traditional exam without AI access.

Return your output in this exact format:

## Metacognitive Monitoring Analysis: [Context Description]

**Context:** [How students are using AI]
**Core risk:** [The specific metacognitive distortion — one sentence]
**Severity:** [How likely and how damaging this risk is — high/moderate/low]

### Metacognitive Diagnosis

[Detailed analysis of how AI use in this context distorts metacognitive monitoring. Name the specific illusions of competence at play. Explain the mechanism — HOW does the AI use lead to miscalibrated confidence?]

### Monitoring Interventions

[Specific strategies to improve metacognitive accuracy. For each:]

**Intervention [N]: [Name]**
- **What:** [What the student does]
- **When:** [At what point in the learning process — before, during, or after AI use]
- **Why it works:** [The metacognitive principle it applies]
- **Example:** [A concrete example of the intervention in this context]

### AI Usage Guidelines

[When to use AI and when to restrict it — specific, practical guidelines for this context]

### Assessment Alignment

[How to design assessment so that it measures student knowledge, not AI-assisted performance]

### Red Flags

[Observable signs that metacognitive distortion is occurring — what the teacher should watch for]

**Self-check before returning output:** Verify that (a) the diagnosis identifies the specific metacognitive mechanism, (b) interventions target calibration not just confidence, (c) retrieval-based monitoring is included, (d) AI is not banned but strategically managed, and (e) assessment aligns with metacognitive goals.
```

## 输出示例

**情境：** *AI 学习情境：“12 年级 A-level 英国文学学生使用 ChatGPT 辅助撰写论文。典型流程：学生收到一道论文题目（例如，‘莎士比亚如何在《麦克白》中呈现权力这一主题？’），将其输入 ChatGPT，获得一篇结构良好、包含相关引文和分析的论文，然后编辑并个性化 AI 输出。大多数学生会修改一些措辞，并加入几个自己的观点，但核心论点和结构由 AI 生成。” / 元认知风险：“学生认为自己‘理解’了文学分析，因为论文看起来不错，而且他们在阅读时能够跟上论点。但当被要求在没有 AI 辅助的课堂研讨中讨论文本，或在闭卷考试中作答时，他们很难清晰阐述论点、回忆具体引文，或从零开始构建分析论证。他们对此感到惊讶——他们原本以为自己理解了。” / 学生水平：“12 年级，A-level 英国文学” / AI 工具：“ChatGPT（免费版本）” / 评估情境：“闭卷 A-level 考试——无法使用 AI，每篇论文 45 分钟”*

---

## 元认知监测分析：A-Level 英国文学中的 AI 辅助论文写作

**背景：** 12 年级学生使用 ChatGPT 生成论文草稿，然后对其进行编辑和个性化处理
**核心风险：** 学生将自己能够识别优秀文学分析的能力（阅读 AI 输出时）与自己能够产出此类分析的能力（基于自身知识）混为一谈
**严重程度：** 高——AI 辅助下的表现与无辅助考试表现之间的差距可能很大，而学生很可能只会在评估时才发现这一差距

### 元认知诊断

三种能力错觉同时存在：

**1. 识别与产出的混淆（破坏性最大）。** 当学生阅读 AI 对《麦克白》中权力的分析时，他们能够跟上论点。它合乎情理。他们会点头赞同。他们甚至可能会想：“是的，这正是我所想的。”但跟随一个论点和构建一个论点是完全不同的认知任务。阅读 AI 的论文会激活识别能力（“我看到它时能理解”），却不会建立产出能力（“我能自己生成它”）。学生的元认知监测校准的是他们的识别能力，而不是产出能力——而考试考查的是产出能力。

**2. 流畅性错觉。** ChatGPT 产出的散文经过润色，且结构良好。当学生阅读并编辑这些输出时，他们会体验到加工流畅性——内容感觉很容易理解，因此也感觉学得很好。Bjork et al. (2013) 表明，流畅性是最具误导性的学习线索之一。学生的信心很高，是因为材料读起来顺畅，而不是因为他们的理解很深入。

**3. 对努力的错误归因。** 学生花时间编辑 AI 输出——修改词语、添加观点、重组段落。这感觉像是在进行认知工作，学生可能会将自己的理解感归因于这种编辑努力。但编辑他人的分析，与构建自己的分析，是根本不同的认知任务。编辑努力带来的是对这篇特定论文的熟悉感，而不是可迁移的分析技能。

**邓宁-克鲁格放大器：** 文学分析能力最弱的学生从 AI 中获益最多（他们的能力与 AI 之间的差距最大），却也最不能识别这种差距。阅读 AI 文章的优秀学生能够识别出它与自己思路不同的地方。同一篇文章，能力较弱的学生读来却只会感到认同——他们看不到自己缺失了什么，因为他们并不具备看见这种缺失的知识。

### 监测干预措施

**干预措施 1：“合上笔记本电脑”测试**
- **是什么：** 使用 AI 制定文章计划后，学生关闭 ChatGPT，打开一个空白文档，并凭记忆用 3-4 句话写出文章的核心论点。然后，他们将自己的版本与 AI 的版本进行比较。
- **何时进行：** 在写作过程中——完成 AI 咨询后、最终起草前
- **为何有效：** 这是一种基于提取的监测方法（Thiede et al., 2003）。凭记忆写作能够揭示学生的**实际**知识状态，消除认知错觉。学生版本与 AI 版本之间的对比，会让差距变得可见且具体。
- **示例：** 学生阅读 AI 撰写的关于《Macbeth》中权力的文章。合上笔记本电脑。写道：“Macbeth 起初很软弱，通过谋杀获得权力，但随后因内疚而失去权力。”与 AI 的版本对比后，学生发现 AI 的版本包含具体引文、语言分析以及与詹姆斯一世时期政治的联系。差距现在已经显现：学生写的是情节概述，而不是分析性论点。

**干预措施 2：使用 AI 前回忆引文**
- **是什么：** 在咨询 AI 前，学生写下自己能记住的、与文章题目相关的每一句引文，并简要注明每句引文说明了什么。**然后**，他们咨询 AI 并进行比较。
- **何时进行：** 使用 AI **之前**——以建立学生自身知识的基线
- **为何有效：** 这能创建一幅反映学生知识的“之前”图景。当他们看到 AI 的文章中有 8 句精准挑选的引文，而自己只能回忆起 2 句时，元认知信号就很明确：“我需要学习更多引文，而不只是阅读 AI 的文章。”
- **示例：** 学生写下："'Fair is foul and foul is fair' — witches, shows things aren't what they seem. 'Is this a dagger I see before me' — Macbeth going mad." 然后阅读 AI 的文章，发现其中除了这些内容外还包括另外六句引文。学生现在有了具体证据，知道自己掌握了什么、又不了解什么。

**干预措施 3：复述讲解流程**
- **是什么：** 编辑 AI 生成的文章后，学生必须在**不看文章**的情况下，向同伴（或向 AI 本身）口头解释文章的论点。听者提出追问。
- **何时进行：** 使用 AI **之后**——检验脱离文本后理解是否仍然存在
- **为何有效：** 口头解释需要产出，而不是识别。学生无法躲在经编辑的 AI 文笔背后。当有人问“你为什么这么说？”而学生无法解释时，理解上的缺口会立刻显现。
- **示例：** 学生解释道：“这篇文章认为权力腐化了 Macbeth。”同伴问：“Shakespeare 如何通过语言**展现**这一点？”学生停顿了——阅读时，他们识别出了 AI 的语言分析，但无法复现它。元认知信号由此真正传达。

**干预措施 4：预测-结果校准**
- **内容：**考试前，学生预测自己在未使用 AI 撰写的练习作文中会获得的分数。作文批改后，他们将预测与实际得分进行比较。
- **时机：**考试前几周，作为一项校准练习
- **有效原因：**直接衡量元认知准确性。如果学生预测“我会得 B”，结果却得了 D，那么这种校准偏差无可否认。重复进行校准练习能随着时间推移提高准确性（Thiede et al., 2003）。
- **示例：**学生整个学期都在写 AI 辅助的作文，并且这些作文都获得了 A。他们预测自己在无辅助练习作文中会得 B，结果得了 D。相差 2 个等级，这就是一次元认知上的警醒。

### AI 使用指南

**AI 适合用于：**
- 在学生形成自己的初步回答**之后**，探索不同的分析角度
- 识别学生此前未考虑过的引文（但学生随后必须独立学习并理解这些引文）
- 针对**学生自己撰写**的草稿获取反馈（AI 负责评估，学生负责写作）
- 示范作文结构（学习 AI **如何**组织论证，而不是它**论证什么**）

**AI 有害的使用方式：**
- 学生在形成任何独立想法**之前**咨询 AI
- 学生将 AI 输出而非自己的思考作为起点
- 学生修改 AI 文本，而不是从头开始写作
- 学生将 AI 作为替代方案，而不对原文进行细读

**推荐工作流程：**
1. 仔细阅读文本。做笔记。挑选引文。
2. **自己**规划作文论证（即使它还很粗略）
3. **自己**写出初稿（即使并不完美）
4. **然后**再咨询 AI：“这是我的论点。我遗漏了什么？我的分析哪些地方薄弱？”
5. 根据 AI 反馈修改**你的**草稿，但基础文本仍然是**你自己的**

### 与评估对齐

**评估必须检验的是学生所掌握的内容，而不是 AI-学生系统产出的内容。**对于 A-level 英语文学：

1. **闭卷限时作文**本身已经很好地对齐了这一目标：学生必须凭记忆完成写作。确保学生经常练习这种形式，而不仅仅是完成 AI 辅助的家庭作文。

2. **课堂研讨和讨论**是出色的元认知测试：实时口头分析无法获得 AI 辅助。整个学期都应将其用作形成性评估。

3. **引文测试**（围绕该主题，凭记忆写出 10 条相关引文）能够将学生对文本的知识与其分析能力区分开来。

4. **“出声思考”分析**：向学生提供一段他们此前未见过的文字，要求他们现场分析，并说出自己的思考过程。这检验的是分析**技能**，而非最终产物。

### 预警信号

注意以下表明正在发生元认知扭曲的迹象：

- **作业-考试差距：**学生在家完成的 AI 辅助作文非常出色，但在限时、无辅助条件下的表现明显更差。作业与考试表现之间持续存在 2 个及以上等级的差距，是一个强烈信号。
- **表面自信，深层焦虑：**学生阅读经 AI 修改的作文时会说“我理解了”，但当被要求在没有笔记的情况下讨论文本时，却明显感到焦虑。这种自信是基于识别，而不是生成。
- **引文匮乏：**课堂讨论中，学生能够表达论点，却无法用具体引文加以支持。引文由 AI 提供，学生并没有学会它们。
- **泛泛而谈的分析：**学生在不使用 AI 时的写作模糊且泛泛而谈（“Shakespeare uses powerful language to show...”），而其 AI 辅助写作则具体且细致。具体性来自 AI，而不是学生。
- **无法偏离既定计划：**当讨论朝意料之外的方向发展时，依赖 AI 的学生难以适应，因为他们的分析框架是借来的，而不是自己真正掌握的。

---

## 已知局限性

1. **关于 AI 特异性元认知效应的证据仍在不断积累。** Kazemitabaar et al. (2023) 是少量但不断增长的有关 AI 工具与元认知研究之一。更广泛的元认知研究（Thiede et al., 2003；Bjork et al., 2013）提供了坚实的理论基础，但其在 LLM 辅助学习中的具体应用，是基于对这些原则的推演，而非大量实证检验。

2. **监控干预会增加认知和时间成本。** “合上笔记本电脑”测试、引文回忆和复述解释流程都需要额外的时间和精力。在学生面临时间压力的情境中（繁重的工作量、多门学科），增加元认知监控练习可能会让人感到负担沉重。教师必须在元认知准确性与实际可行性之间取得平衡。

3. **个体之间的元认知能力差异很大。** 有些学生天生善于监控自己的理解程度，而另一些则不然。邓宁-克鲁格效应表明，最需要元认知支持的学生，最不可能意识到自己需要这种支持。干预措施必须是**结构性的**（为所有学生内置于工作流程中），而不是**建议性的**（“你应该检查自己的理解”）。

4. **AI 使用与元认知之间的关系，可能比“AI 会损害元认知”更为复杂。** 某些 AI 使用方式（例如，使用 AI 生成练习题，然后在不借助 AI 的情况下尝试作答）实际上可能通过创造检索机会来**提高**元认知准确性。风险取决于具体情境，并非绝对。上述诊断具体适用于“AI 生成，学生编辑”的工作流程；其他工作流程可能具有不同的元认知特征。