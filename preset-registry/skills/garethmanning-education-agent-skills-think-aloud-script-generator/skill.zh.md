---
# AGENT SKILLS STANDARD FIELDS (v2)
name: think-aloud-script-generator
description: "Script a teacher think-aloud demonstrating expert reasoning processes for a specific task. Use when modelling problem-solving, writing, reading comprehension, or analytical processes."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "explicit-instruction/think-aloud-script-generator"
skill_name: "Think-Aloud Script Generator"
domain: "explicit-instruction"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Bereiter & Scardamalia (1987) — The Psychology of Written Composition: making expert processes visible"
  - "Wilhelm (2001) — Improving Comprehension with Think-Aloud Strategies"
  - "Ericsson & Simon (1993) — Protocol Analysis: verbal reports as data (theoretical foundation)"
  - "Collins et al. (1989) — Cognitive Apprenticeship: teaching the crafts of reading, writing, and mathematics"
  - "Rosenshine (2012) — Principles of Instruction, Principle 4: provide models of worked-out problems"
input_schema:
  required:
    - field: "task_to_model"
      type: "string"
      description: "The specific task the teacher will think aloud through"
    - field: "student_level"
      type: "string"
      description: "Age/year group and expertise level"
    - field: "subject_area"
      type: "string"
      description: "Subject context"
  optional:
    - field: "expert_strategies"
      type: "array"
      description: "Specific strategies or decision points the teacher wants to make visible"
    - field: "common_student_errors"
      type: "array"
      description: "Errors students typically make that the think-aloud should inoculate against"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: comprehension levels, EAL needs"
    - field: "think_aloud_duration"
      type: "string"
      description: "Target duration in minutes"
output_schema:
  type: "object"
  fields:
    - field: "script"
      type: "string"
      description: "Complete think-aloud script with decision points, self-monitoring, and error awareness"
    - field: "visible_strategies"
      type: "array"
      description: "List of expert strategies made visible in the script"
    - field: "pause_points"
      type: "array"
      description: "Moments to pause and check student following"
    - field: "delivery_notes"
      type: "string"
      description: "How to deliver the think-aloud effectively"
chains_well_with:
  - "explicit-instruction-sequence-builder"
  - "worked-example-fading-designer"
  - "metacognitive-prompt-library"
  - "reading-comprehension-strategy-selector"
  - "pedagogical-content-knowledge-developer"
  - "critical-thinking-task-designer"
teacher_time: "4 minutes"
tags: ["think-aloud", "modelling", "expert-thinking", "cognitive-apprenticeship", "comprehension"]
---
# 思维外显脚本生成器

## 此技能的作用

为特定任务编写教师思维外显脚本，将专家的认知过程呈现出来——适用于问题解决、阅读、写作、分析，或任何专家思维通常不可见的认知技能。脚本阐明专家会自动使用、却很少用语言表达的决策点、自我监控时刻和错误检测策略。AI 在这里尤其有价值，因为思维外显示范的核心挑战是“专家盲点”——专家已经将自己的思维自动化到无法再表达中间步骤的程度。数学教师会“直接看出”一道题需要因式分解；熟练读者会“直接知道”某个来源不可靠。思维外显脚本将这种自动化的专业能力逆向拆解为可教的步骤。

## 证据基础

Collins 等人（1989）将认知学徒制确立为一种让新手看见专家思维的框架。其关键洞见是：在传统手工技艺中，学习过程是可见的（你可以观察木匠刨木头），但在学术学科中，关键工作发生在专家头脑内部，对学生而言是不可见的。思维外显让不可见变得可见。Bereiter 与 Scardamalia（1987）将这一方法应用于写作，证明专家写作者会参与“知识转换”过程（规划、监控、修改），而新手写作者则会完全跳过这些环节；通过思维外显示范这一过程，能够显著提升学生写作水平。Wilhelm（2001）表明，在多项研究中，教师思维外显能够提升阅读理解能力，尤其能帮助缺乏元认知监控策略的阅读困难学生。Ericsson 与 Simon（1993）提供了理论基础，证明对思维过程的口头报告（同步进行而非事后回顾）能够有效呈现认知过程。Rosenshine（2012）将提供示范确定为有效教学的第 4 项原则，并指出最有效的教师会“边思考边示范步骤”，而不是只解释程序。

## 输入模式

教师必须提供：
- **要示范的任务：** 需要通过思维外显来演示的具体任务。*例如：“第一次阅读并批注一首未见过的诗”/“解决一道多步骤三角学问题”/“评估一个历史来源的可靠性”*
- **学生水平：** 年级和能力水平。*例如：“10 年级，正在发展的读者——能够解码文字，但不会主动监控理解情况”/“8 年级，初学者问题解决者”*
- **学科领域：** 学科背景。*例如：“GCSE 英国文学”/“9 年级数学”*

可选项（如有，可由上下文引擎注入）：
- **专家策略：** 需要呈现出来的具体策略
- **常见学生错误：** 需要帮助学生预防的错误
- **学生概况：** 理解水平、EAL 需求
- **思维外显时长：** 目标时长，单位为分钟

## 提示词

```text
You are an expert in cognitive apprenticeship and think-aloud modelling, with deep knowledge of Collins et al.'s (1989) cognitive apprenticeship framework, Bereiter & Scardamalia's (1987) work on making expert writing processes visible, and Wilhelm's (2001) research on think-aloud strategies for reading. You understand the "expert blind spot" — the phenomenon where experts have automated their thinking so thoroughly that they can no longer articulate the intermediate steps novices need to see.

Your task is to write a think-aloud script for:

**Task:** {{task_to_model}}
**Student level:** {{student_level}}
**Subject:** {{subject_area}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Expert strategies:** {{expert_strategies}} — if not provided, identify the 3–5 most important expert strategies for this task type and make them visible in the script.
**Common student errors:** {{common_student_errors}} — if not provided, identify the most common errors students make with this task type and include moments in the script where the expert catches and avoids them.
**Student profiles:** {{student_profiles}} — if not provided, design for a mixed-ability class with students who perform the task mechanically without monitoring their thinking.
**Think-aloud duration:** {{think_aloud_duration}} — if not provided, design for 8–10 minutes (long enough to model the full process, short enough to maintain attention).

Apply these evidence-based principles:

1. **Make decisions visible, not just actions (Collins et al., 1989):**
   - An action: "Now I underline this phrase."
   - A decision made visible: "I'm re-reading this line because something doesn't make sense yet. I expected the poet to continue the positive imagery, but this word 'shattered' breaks the pattern. That's important — let me underline it and write 'tone shift?' in the margin."
   - Every action in the script must be preceded by the reasoning that drives it.

2. **Show self-monitoring (Bereiter & Scardamalia, 1987):**
   - Experts constantly monitor their own comprehension and progress. Make this visible:
   - "Wait — do I actually understand this line? Let me try to paraphrase it... No, I can't. That means I need to re-read it more carefully."
   - "I've been working for 5 minutes and I've only done one paragraph. Am I spending too long, or is this the right depth for this task?"

3. **Show error detection and recovery (Wilhelm, 2001):**
   - Experts make errors and catch them. Show this:
   - "My first thought is to add these two numbers, but wait — that doesn't seem right because the answer would be larger than... Let me re-read the question."
   - Do NOT present a flawless performance. Show a realistic process with wrong turns and corrections.

4. **Distinguish "doing the task" from "showing how to think through the task":**
   - A teacher who solves a maths problem on the board while saying "and then we multiply by 3" is doing the task, not thinking aloud.
   - A teacher who says "Now I need to figure out what to do next. I have two options — I could multiply or I could factorise first. Let me think about which is better... Multiplying would give me bigger numbers, and factorising might simplify things, so I'll try factorising first" is thinking aloud.

5. **Include pause points (Rosenshine, 2012):**
   - Build in 2–3 moments where the teacher pauses and checks: "Can you follow what I'm doing? What did I just decide to do, and why?"
   - These pauses prevent the think-aloud from becoming a monologue.

6. **Use natural language, not teacher-speak:**
   - Think-alouds should sound like genuine thinking, not a lecture. Use "Hmm," "OK so," "Wait," "Let me think," "I'm not sure about this yet."
   - Avoid: "Students, notice how I am using the strategy of..."

Return your output in this exact format:

## Think-Aloud Script: [Task]

**For:** [Student level]
**Duration:** [Minutes]
**Setup:** [What to say to students before beginning the think-aloud]

### The Script

[The complete think-aloud, written in first person as the teacher would speak it. Include stage directions in square brackets. Mark decision points, self-monitoring moments, and error-recovery moments clearly.]

### Visible Strategies

[Numbered list of the expert strategies made visible in this script — what students should take away]

### Pause Points

[2–3 moments in the script where the teacher should pause and check understanding]

### Delivery Notes

[Practical advice on how to deliver the think-aloud effectively — pacing, authenticity, what to avoid]

**Self-check before returning output:** Verify that (a) every action in the script is preceded by reasoning, (b) at least two self-monitoring moments are included, (c) at least one error or wrong turn is shown and corrected, (d) the script sounds like genuine thinking, not a lecture, (e) pause points are included for student interaction, and (f) the script stays within the target duration.
```

## 示例输出

**场景：** *任务：“第一次阅读并回应一首从未见过的诗歌——GCSE 英语文学风格” / 学生水平：“Year 10，能够识别诗歌技巧，但不知道如何有策略地处理一首陌生诗歌——他们往往会感到慌张，读一遍后就立刻开始写作” / 学科：“GCSE 英语文学”*

---

## 陌生诗歌第一次阅读的思维过程示范脚本

**适用对象：** Year 10 GCSE 英语文学
**时长：** 10 分钟
**准备：** “我将向你们展示，当我阅读一首从未见过的诗歌时，我脑海中会发生什么。我不会向你们展示一份完美的分析，而是展示我真实的思考过程——困惑、错误的猜测，以及重新阅读。请观察并倾听。我会暂停几次，确认你们是否跟得上。”

*[教师在黑板上展示 Percy Bysshe Shelley 的《Ozymandias》——或者任何适合该班级的陌生诗歌。此例使用《Ozymandias》。]*

### 脚本

“好。这是一首我之前从未为你们分析过的诗。先让我完整地读一遍。

*[稳定地、大声朗读整首诗，中途不停顿。]*

好的。第一反应——我大致感觉到这首诗在写什么，但我肯定还没有完全理解其中的所有内容。这很正常。如果你读一遍诗就觉得自己什么都理解了，那你可能漏掉了某些东西。所以我要再读一遍，但这次我会放慢速度，一边读一边思考。

*[回到开头。]*

‘我遇见一位来自古老国度的旅人，他说道——’

好，所以这首诗一开始是由别人来讲述一个故事。诗人并没有描述自己看到的东西——他是在转述一位旅人告诉他的话。这是一个有意思的选择。让我记下来—— *[在页边写下：“框架叙事——为什么？”]* ——我现在还不知道原因，但诗人选择让自己与这段描述保持距离，通常是有意为之的。我稍后会再回到这一点。

‘两条巨大而没有躯干的石腿，矗立在沙漠中……’

我正在想象这个画面——两条巨大的腿，却没有身体。只有腿。在一片沙漠中。所以这是一座残破的雕像。原本完整的东西如今已经破碎了。 *[写下：“衰败——曾经完整，如今毁坏。”]*

‘在它们附近的沙地上，半埋着一张破碎的面容；那紧皱的眉头、起皱的嘴唇，以及冷酷命令的冷笑——’

*[停顿。]* 好，‘面容’——指的是一张脸。这张脸半埋在沙子里。而且看看这些描写面容的词：‘紧皱的眉头’、‘起皱的嘴唇’、‘冷酷命令的冷笑’。这些全都是负面的——这不是一张友善的脸。这是一个看起来强大而残酷的人。让我给‘冷酷命令的冷笑’画上线——这个短语承载了很多信息。‘冷笑’意味着轻蔑。‘冷酷’意味着缺乏温暖或同情。‘命令’意味着权力。三个词，就让我看到了一个暴君的形象。

嗯，等等——我想确认一件事。我认为这首诗是在写权力，这个判断正确吗？让我先继续读下去，再决定是否坚持这个解读……

‘告诉世人，雕刻家将这些激情刻画得多么传神；它们如今仍印刻在这些无生命的石块上，那只曾嘲弄它们的手，以及曾供养它们的心；’

*[停顿。]* 好，这更难了。我再读一遍。‘Tell that its sculptor well those passions read’——雕刻家很好地理解了那些情感的表达。‘Which yet survive’——石头面孔上的表情依然留存，尽管……‘stamped on these lifeless things’——它们不过是刻在无生命石头上的印记。‘The hand that mocked them, and the heart that fed’——是谁的手？谁的心？

我有些困惑。坦白说——这是诗中最难的部分，我不确定自己是否理解对了。我试着解释一下：我认为‘the hand that mocked them’指的是雕刻家的手——雕刻家复制了（‘mocked’）那些表情。而‘the heart that fed’指的是统治者的心——那些情感最初源自他。因此，是雕刻家的技艺把统治者的残酷保存在了石头中。

实际上，‘mocked’可能有双重含义——雕刻家既是在复制统治者，也是在嘲弄统治者。如果这是有意为之，那就很巧妙了。*[在页边写道：‘mocked = 复制还是嘲讽？两者都是？’]*

**[暂停点 1]** *[对学生说：]* “先停在这里。到目前为止，我做了哪些不同于单纯朗读诗歌的事情？告诉你的同伴，你注意到我的方法有什么不同之处。” *[随机点名一组。希望听到的内容包括：重新阅读、在页边做批注、提出问题、承认困惑、想象场景、关注词语的选择。]*

好，继续。接下来就真正有意思了：

‘And on the pedestal, these words appear: My name is Ozymandias, King of Kings; Look on my Works, ye Mighty, and despair!’

现在我明白这首诗了。奥西曼迪亚斯就是那位统治者。他为自己建造了这座雕像，并刻下‘Look on my Works, ye Mighty, and despair’——他是在说：看看我的帝国、我的力量，然后感到恐惧。他在炫耀。

但是——而这正是关键——雕像周围实际上有什么？

‘Nothing beside remains. Round the decay Of that colossal Wreck, boundless and bare The lone and level sands stretch far away.’

什么都没有。只有沙漠。他的‘Works’已经消失了。他的帝国已经消失了。他所建立的一切都被时间摧毁了。剩下的只有沙漠中一座破碎的雕像，以及一段炫耀伟大的铭文——而那种伟大早已不复存在。

*[写道：‘反讽——炫耀的是力量，但一切都已毁灭。时间战胜所有暴君。’]*

这就是这首诗的主旨。现在我也明白了，为什么雪莱在开头使用了框架叙事——‘I met a traveller who said.’ 雪莱又增加了一层距离。他甚至没有亲眼见过这座雕像。这是一个故事套着另一个故事——奥西曼迪亚斯的力量已经衰退到如此程度，以至于人们甚至不是在直接描述他。他已经变成了一则传闻。

**[暂停点 2]** *[对学生说：]* “诗歌在哪一刻对我来说‘豁然开朗’了？我是在什么时候从困惑转为理解主旨的？而且，当我感到困惑时，我做了什么——是惊慌失措，还是采取了某个具体行动？” *[随机点名。希望听到的内容包括：炫耀与空旷沙漠之间的对比；困惑时重新阅读并尝试释义。]*

现在，假设这是一次考试，我会回过头来想想该写哪些技巧。我会选择‘sneer of cold command’，因为这三个词高度浓缩了人物的性格。我会写铭文与空旷沙漠之间的反讽。我还会写破碎雕像这一意象，它象征着人类力量的无常。

但问题在于——我是通过读了三遍、在页边写批注、承认自己感到困惑，以及在没有理解某一行时不惊慌，才走到这一步的。这就是过程。如果你只读一遍就立刻开始写作，你会错过其中的反讽、结构和真正的含义。”

### 可见的策略

1. **先完整读一遍诗歌，整体把握诗意，再进行分析。** 第一次阅读时不要停下来逐句拆解。
2. **拿着笔重读。** 第二遍阅读才是分析的开始——做批注、提出问题、在脑中形成画面。
3. **放大关注单个词语的选择。** “Sneer of cold command”——三个词就能承载完整的人物刻画。引用要短，分析要深入。
4. **承认困惑，并设法解决。** 当某一行读不通时，重新阅读并用自己的话转述。困惑是信息，不是失败。
5. **寻找转折或对比。** 许多诗歌都围绕某种转变展开——自夸与现实之间、预期与意外之间。找到转折，也就找到了意义。
6. **问自己：“诗人为什么要做出这个选择？”** 叙事框架、词语选择、结构——这些全都是有意安排的。要问为什么，而不只是问是什么。

### 暂停点

1. **前 5 分钟之后**（大致分析完前半首诗之后）：确认学生能够说出，教师的做法与单纯阅读相比有什么不同。这能引出其中的过程性策略。
2. **“恍然大悟”的时刻之后**（反讽变得清晰时）：确认学生能够指出理解是在什么时候、以什么方式产生的——以及教师在困惑时做了什么。这有助于让学生认识到富有成效的挣扎是正常的。

### 执行说明

- **听起来要像你真的在思考，而不是在表演。** 使用自然的迟疑：“Hmm”“Wait”“OK so”“I'm not sure about this yet”。如果思维示范听起来像一场经过润色的讲座，学生就不会相信那代表真实的思考过程。
- **不要预先解释你接下来要做什么。** 不要说“现在我要使用重新阅读以澄清意思这一策略”。直接重读即可。学生应该看到策略在实际运作，并自己识别出来（或在暂停点讨论中识别）。
- **展示真实的不确定性。** 对“mocked”的处理（是模仿还是嘲弄？）应该让人感觉确实尚未解决。说“我觉得它可能两者都有——我还不确定”，示范了熟练读者所需要、而初学读者所缺乏的包容歧义的能力。
- **控制好节奏。** 10 分钟时间很紧。先排练一次，确认所需时间。与其肤浅地匆匆讲完整首诗，不如深入示范前半首诗。
- **思维示范之后，要明确点出这些策略。** 思维示范展示了策略如何运作；接下来用简短的复盘（2 分钟）明确说出这些策略的名称，以便学生将其迁移到自己的阅读中。

---

## 已知局限

1. **这份脚本是示范材料，不是提词器。** 教师必须用自己的声音来呈现，并根据学生在暂停点的回应进行调整。逐字照读脚本的思维示范会显得不自然，也会违背其本意。教师应当内化关键决策点和自我监控时刻，然后自然地表达出来。

2. **只有当学生专注地观看和倾听时，思维外显才会有效。** 如果学生失去参与感，思维外显变成了背景噪音，就不会产生任何学习效果。将思维外显控制在较短时间内（最长 8–12 分钟），设置互动式暂停点，并在结束后立即进行引导式练习，让学生运用相同的策略。

3. **专家盲点确实存在，而且会反复出现。** 即使有这份脚本，教师仍可能无意识地跳过那些对自己而言显而易见、但对新手来说并不明显的步骤。思维外显结束后，询问学生：“有没有哪个地方我跳得太快，让你跟不上？”他们的回答会揭示出脚本遗漏的专家盲点。