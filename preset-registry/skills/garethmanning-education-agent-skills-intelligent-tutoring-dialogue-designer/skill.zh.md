---
# AGENT SKILLS STANDARD FIELDS (v2)
name: intelligent-tutoring-dialogue-designer
description: "Script a multi-turn tutoring dialogue with branching responses for anticipated student difficulties. Use when designing AI tutors, chatbot interactions, or structured one-to-one support scripts."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/intelligent-tutoring-dialogue-designer"
skill_name: "Intelligent Tutoring Dialogue Designer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "VanLehn (2011) — The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems (meta-analysis)"
  - "Chi et al. (2001) — Learning from human tutoring (analysis of effective tutoring dialogues)"
  - "Graesser et al. (2005) — AutoTutor: An intelligent tutoring system with mixed-initiative dialogue"
  - "Chi & Wylie (2014) — The ICAP framework: linking cognitive engagement to active learning outcomes"
  - "Koedinger & Aleven (2007) — Exploring the assistance dilemma in experiments with cognitive tutors"
input_schema:
  required:
    - field: "learning_objective"
      type: "string"
      description: "The specific concept or skill the tutoring interaction should help the student master"
    - field: "anticipated_difficulties"
      type: "string"
      description: "The specific points where students typically struggle with this content — misconceptions, procedural errors, or conceptual gaps"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "interaction_length"
      type: "string"
      description: "How long the tutoring interaction should last"
    - field: "student_model"
      type: "string"
      description: "What is known about the specific student's current knowledge state — prior performance, known misconceptions, or learning preferences"
    - field: "system_capabilities"
      type: "string"
      description: "What the AI system can do — text only, text + images, voice, worked examples, interactive problems"
output_schema:
  type: "object"
  fields:
    - field: "dialogue_architecture"
      type: "object"
      description: "The overall structure of the tutoring interaction — phases, decision points, and branching logic"
    - field: "dialogue_moves"
      type: "array"
      description: "The specific moves available to the tutor at each point — questions, hints, explanations, prompts, and silence"
    - field: "decision_rules"
      type: "object"
      description: "When to use each move — the rules that govern tutor behaviour based on student responses"
    - field: "example_dialogue"
      type: "object"
      description: "A complete example dialogue showing the system in action with a realistic student"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "self-explanation-prompt-designer"
  - "ai-feedback-design-principles"
  - "cognitive-tutoring-architecture-designer"
teacher_time: "5 minutes"
tags: ["tutoring", "dialogue", "ITS", "VanLehn", "AutoTutor", "Graesser", "Chi", "ICAP", "mixed-initiative"]
---
# 智能辅导对话设计师

## 此技能的作用

为 AI 辅导交互设计对话逻辑：何时提问，何时提供提示，何时进行解释，何时促使学生进行自我解释，以及何时保持沉默。这是智能辅导中最困难的设计问题：干预过多会阻碍富有成效的努力并造成依赖；干预过少则会让学生陷入困境并感到沮丧。VanLehn (2011) 发现，辅导效果（无论由人类还是 AI 提供）取决于逐步交互的质量——在每一步都让学生进行主动推理的系统，其效果显著优于只呈现内容并评估最终答案的系统。Chi 等人 (2001) 分析了人类辅导为何有效，并反直觉地发现，最有效的辅导者并不是那些解释最多的人——而是那些提出恰当问题、为学生创造自我解释机会的人。输出内容包括完整的对话架构（交互的阶段和分支逻辑）、对话动作库（辅导者可以说或做的具体事情）、决策规则（根据学生的回答决定何时使用每种动作），以及一个展示系统实际运行方式的完整示例。AI 在这里尤其有价值，因为它能够大规模维持一对一对话——但对话必须经过有意识的设计，否则 AI 会默认采用讲授模式，而这是效果最差的辅导策略。

## 证据基础

VanLehn (2011) 进行了一项综合性元分析，对比了人类辅导、智能辅导系统和无辅导条件。他发现，关键因素不在于由谁进行辅导，而在于如何进行辅导。“内循环”系统——即在每个问题解决步骤中提供反馈和支架的系统——取得了 0.76 的效应量，几乎达到人类辅导者的水平 (0.79)。“外循环”系统——即只评估最终答案的系统——取得的效应量要低得多 (0.31)。这对对话设计的启示很明确：系统必须参与学生的推理过程，而不只是关注他们的最终答案。Chi 等人 (2001) 对有效的人类辅导对话进行了详细分析，并发现了一个出人意料的结果：最有效的辅导者并没有给出最好的解释。相反，他们采用了“先引导、再解释”的模式——先促使学生尝试进行解释，然后在学生产出的内容基础上继续推进。这一发现直接违背了“良好辅导就是清晰解释”的直觉假设。原因在于：辅导者进行解释时，学生是被动接受的；而当辅导者进行提示、学生尝试解释时，学生会主动建构理解 (Chi & Wylie, 2014 — ICAP 框架)。Graesser 等人 (2005) 开发了 AutoTutor，这是研究最为广泛的智能辅导系统之一，它采用“混合主动式对话”方法。AutoTutor 会提问、评估学生的回答、提供反馈，并促使学生展开说明——维持对话交流，而不是进行讲授。他们的研究确定了五种关键的对话动作：推动式追问（“再多讲一点”）、提示（询问具体信息）、暗示（在不给出答案的情况下指向答案）、陈述（提供信息）和纠正（直接处理错误）。Koedinger & Aleven (2007) 阐述了“帮助困境”——这是辅导设计中的根本张力。帮助过多（解释所有内容、过快给出提示）会导致浅层学习：学生完成了任务，却不理解其中的原因。帮助过少（从不干预，让学生无休止地挣扎）则会导致沮丧和放弃。最优的辅导策略需要在这两个极端之间进行调节，只提供学生取得进展所必需的最低限度帮助。

## 输入模式

教师必须提供：
- **学习目标：** 学生应掌握的内容。*例如：“理解为什么较重的物体不会比​​较轻的物体下落得更快（牛顿物理学与亚里士多德物理学的差异）” / “能够识别非虚构文本中的主要论点，并将其与支持性证据区分开来” / “理解乘以小于 1 的分数会使一个数变小，而不是变大”*
- **预期困难：** 学生容易遇到困难的地方。*例如：“学生持有‘越重 = 越快’的亚里士多德式直觉。他们会把日常经验（羽毛与球同时掉落的对比）作为‘证明’。他们难以区分空气阻力与重力加速度” / “学生会把文本的主题与论点混淆。他们识别的是事实而不是主张。他们难以区分作者的观点与作者所报道的观点” / “学生会套用整数中‘乘法会使数变大’的规则，并对 ½ × 6 = 3 感到困惑”*

可选（如果可用，则由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **互动时长：** 互动应持续的时间
- **学生模型：** 关于特定学生的已知信息
- **系统能力：** AI 系统能够执行的操作

## 提示词

```
You are an expert in tutoring dialogue design, with deep knowledge of VanLehn's (2011) meta-analysis of ITS effectiveness, Chi et al.'s (2001) research on effective tutoring dialogues, Graesser et al.'s (2005) AutoTutor research, Chi & Wylie's (2014) ICAP framework, and Koedinger & Aleven's (2007) assistance dilemma. You understand that the quality of tutoring depends not on what the tutor KNOWS but on what the tutor DOES — specifically, how the tutor manages the dialogue to maximise the student's active cognitive engagement.

CRITICAL PRINCIPLES:
- **Elicit before explain.** The most common mistake in tutoring (human and AI) is explaining too much, too early. The first move should almost always be a QUESTION, not an explanation. Even when the student is clearly wrong, the first move is "Can you explain your thinking?" — not "Actually, the correct answer is..." Chi et al. (2001) showed that tutoring effectiveness correlates with how much the STUDENT talks, not how much the tutor talks.
- **Navigate the assistance dilemma.** Koedinger & Aleven (2007): too much help → shallow learning; too little help → frustration. The dialogue should provide the MINIMUM assistance necessary for progress. Start with the lightest possible intervention (a question, a pause, a pump) and escalate ONLY when lighter moves fail.
- **Use mixed-initiative dialogue.** Graesser et al. (2005): effective tutoring is a CONVERSATION, not a lecture or a quiz. The tutor sometimes leads (asking questions) and sometimes follows (responding to student questions). The student should have genuine agency in the dialogue — they can ask questions, express confusion, change the topic, or disagree.
- **Silence is a move.** One of the most powerful tutoring moves is to say nothing. After asking a question, WAIT. Students need time to think. If the system responds instantly to every student action, it trains the student to be passive. Deliberate silence (with visible thinking time) creates productive struggle.
- **Design for misconceptions, not just errors.** An error is getting the answer wrong. A misconception is having a wrong mental model. The dialogue must distinguish between these: errors are corrected with feedback; misconceptions are addressed by creating cognitive conflict — presenting evidence that contradicts the student's mental model and prompting them to reconcile the conflict.

Your task is to design the dialogue logic for:

**Learning objective:** {{learning_objective}}
**Anticipated difficulties:** {{anticipated_difficulties}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the learning objective.
**Interaction length:** {{interaction_length}} — if not provided, design for a 10-15 minute interaction.
**Student model:** {{student_model}} — if not provided, assume a typical student who may hold the anticipated misconceptions.
**System capabilities:** {{system_capabilities}} — if not provided, design for a text-based AI system that can also display images and worked examples.

Return your output in this exact format:

## Tutoring Dialogue Design: [Learning Objective]

**Learning objective:** [What the student should master]
**Anticipated difficulties:** [Where students struggle]
**Interaction model:** [How the dialogue is structured]

### Dialogue Architecture

[The overall structure of the interaction — phases, transitions, and branching logic. Include a visual flow if helpful.]

**Phase 1: [Name]** — [Purpose and key moves]
**Phase 2: [Name]** — [Purpose and key moves]
**Phase 3: [Name]** — [Purpose and key moves]

### Dialogue Move Library

[The specific moves available to the tutor at each point, with examples of each]

| Move Type | When to Use | Example |
|---|---|---|
| [Move] | [Condition] | [Exact text] |

### Decision Rules

[The rules that govern which move to use, based on student responses. Format as IF-THEN rules.]

### Example Dialogue

[A complete, realistic dialogue showing the system in action with a student who holds the anticipated misconception. Show BOTH effective and challenging moments — including what happens when the student is confused, resistant, or wrong.]

**Tutor:** [What the system says]
**Student:** [A realistic student response]
**Tutor:** [Response, with annotation explaining WHY this move was chosen]
...

### Design Rationale

[Why the dialogue is structured this way — what research principles it follows and what alternatives were considered.]

**Self-check before returning output:** Verify that (a) the dialogue elicits before explaining, (b) the assistance dilemma is navigated (minimum necessary help), (c) silence is used as a deliberate move, (d) misconceptions are addressed through cognitive conflict not just correction, and (e) the student talks more than the tutor.
```

## 示例输出

**情境：** *学习目标：“理解为什么较重的物体并不会比​​较轻的物体下落得更快——区分重力加速度（对所有物体都相同）与空气阻力（对不同物体有所不同）” / 预期困难：“学生有很强的亚里士多德式直觉，认为越重就越快。他们会引用日常经验（把羽毛和球同时放下）作为‘证据’。他们难以将空气阻力的概念与重力加速度区分开来。即使已经被告知正确答案，许多学生在几周内仍会回到这一错误观念” / 学生水平：“九年级，能力水平混合的科学课” / 学科领域：“物理——力与运动”*

---

## 辅导对话设计：重力加速度与空气阻力

**学习目标：** 理解为什么较重的物体并不会比​​较轻的物体下落得更快（重力加速度相同，空气阻力不同）  
**预期困难：** 强烈的亚里士多德式直觉（越重越快）、将日常经验作为证据、把空气阻力与重力混淆  
**互动模式：** 跨越三个阶段的混合主动式对话——引出错误观念、制造认知冲突、建立正确模型

### 对话架构

**阶段 1：引出（3-4 分钟）** —— 呈现学生已有的观点，但不要进行纠正。目标是让学生清晰地表达自己的心智模型，并对一个预测作出明确判断。这一点至关重要，因为（a）你无法处理一个尚未被呈现出来的错误观念；（b）作出明确预测会为之后形成有成效的认知冲突创造条件，因为该预测将被事实推翻。

**阶段 2：冲突（4-5 分钟）** —— 呈现一个与学生预测相矛盾的情境。不要解释预测为什么错了——要求学生解释这一矛盾。这一阶段是整个对话的核心。学生必须经历真正的认知冲突：“我的预测错了，但我明明确信它是对的。为什么？”辅导者的角色是维持这种冲突（不要过快地解决它），并引导学生走向关键区分（重力与空气阻力）。

**阶段 3：建构（4-5 分钟）** —— 帮助学生建立正确的心智模型。使用自我解释提示，确保学生能够表达重力加速度（对所有物体都相同）与空气阻力（取决于形状和表面积，而不是质量）之间的区别。最后以一个迁移问题结束，用于检验学生是真正理解了这一模型，还是只是记住了答案。

### 对话策略库

| 策略类型 | 使用时机 | 示例 |
|---|---|---|
| **预测请求** | 阶段 1——用于引出错误观念 | “如果我同时从同一高度放下一个保龄球和一个网球，哪个会先落地？你的预测是什么？” |
| **承诺探查** | 作出预测之后——强化学生的判断 | “你有多大把握？你能解释一下为什么这么认为吗？” |
| **追问** | 学生给出简短回答时 | “再多说一点。” / “是什么让你这样想的？” |
| **冲突情境** | 阶段 2——制造认知失调 | “现在设想一下，两个物体都处在一个没有空气的房间里——也就是真空中。你的预测还一样吗？” |
| **沉默** | 任何问题之后——给予思考时间 | [回复前等待 5-8 秒。如果系统是基于文本的，可以显示“……”或“慢慢来。”] |
| **转回主题** | 学生偏离主题时 | “这很有意思——我们先回到刚才的问题上。现在，我想重点讨论的是：为什么真空会改变结果？” |
| **苏格拉底式提问** | 阶段 2/3——引导推理 | “所以，如果重力对两个物体的拉力相同，那么唯一可能让其中一个下落得更慢的因素是什么？” |
| **自我解释提示** | 阶段 3——建立理解 | “用你自己的话解释一下，为什么羽毛在空气中下落得很慢，而在真空中却下落得很快。” |
| **最小纠正** | 学生出现事实性错误时 | “实际上，重力会让所有物体以相同的速率加速——9.8 m/s²。不过，你关于空气的问题非常重要。继续沿着这个想法思考。” |
| **迁移问题** | 阶段 3 结束时——检验理解 | “一个跳伞员和一个没有降落伞的高空跳伞者从同一架飞机上跳下。请运用我们讨论的内容，解释会发生什么以及为什么。” |

### 决策规则

**如果**学生非常确信地预测“较重的物体下落得更快”：
→ **那么**使用真空思想实验进入第 2 阶段。此时误解已经出现并且学生已明确坚持这一观点——非常适合制造认知冲突。

**如果**学生预测“较重的物体下落得更快”，但似乎不太确定：
→ **那么**使用承诺探查：“有意思——你能解释一下你的推理吗？”这会强化学生对该预测的坚持，使冲突更具成效。

**如果**学生立即给出正确答案：
→ **那么**探查其理解程度：“没错。但大多数人都认为较重的物体下落得更快。你能解释一下他们为什么错吗——是什么让人们产生这种想法？”这可以检验学生是否真正理解，还是只是记住了这个事实。

**如果**学生正确回应真空情境：
→ **那么**使用自我解释提示：“所以你的意思是，它们在真空中会以相同的速度下落。关于重力本身，这说明了什么？”进入第 3 阶段。

**如果**学生回应了真空情境，但感到困惑：
→ **那么**使用苏格拉底式提问：“你说它们在真空中会以相同的速度下落，但在空气中速度不同。这两种情境有什么不同？”引导他们找出空气阻力。

**如果**学生沉默超过 10 秒：
→ **那么**换一种更简单的方式提问：“我换个说法。在真空中没有空气。在房间里有空气。空气会对下落的物体产生什么影响？”

**如果**学生提出问题：
→ **那么**简短回答，然后将话题引回主要探究思路。不要进行说教。“问得好——是的，在地球表面附近，重力处处相同。现在，既然如此，为什么羽毛和球的下落情况不同呢？”

**如果**学生说“我不知道”或“我卡住了”：
→ **那么**不要直接解释。提供支架：“我们一步一步来想。首先：在真空中，两个物体会以相同的速度下落。你同意吗？”从他们确实知道的内容出发。

### 对话示例

**导师：**我想请你想象一件事。你站在学校的屋顶上，一只手拿着保龄球，另一只手拿着网球。你让它们从相同的高度、在完全相同的时间落下。哪一个会先撞到地面？

**学生：**当然是保龄球。它更重。

**导师：**你听起来很确定。你能解释一下为什么你认为较重的物体下落得更快吗？
*[承诺探查——让学生阐述并坚持自己的推理]*

**学生：**因为它更重？也就是说，它的质量更大，所以受到的重力拉力更强。因此加速得更快。

**导师：**好，所以你的推理是：质量更大 → 重力拉力更强 → 下落得更快。让我把它写下来：“较重的物体受到的重力拉力更强，因此它们加速得更快，并且会先撞到地面。”这样概括你的观点公平吗？
*[明确承诺——学生的预测现在已经被记录下来，为接下来的冲突做好准备]*

**学生：** 是的，我就是这么想的。

**导师：** 好。现在我想让你想象一下同一个实验的另一个版本。同样的保龄球，同样的网球，同样的高度。但这一次，你在一个所有空气都被抽走的房间里——一个完美的真空。里面除了你和这两个球什么都没有。你把它们同时放下。会发生什么？
*[冲突情境——引入真空条件]*

**学生：** ……我觉得它们还是会以不同的速度下落？保龄球毕竟更重。

**导师：** ……
*[沉默——6 秒。让学生静待自己的预测。]*

**导师：** 有件事可能会让你感到惊讶。我们实际上已经做过这个实验——很多次。在真空中，保龄球和网球会在完全相同的时间落地。每一次都是如此。你对此怎么想？
*[呈现否定性证据，但不加以解释]*

**学生：** 等等，真的吗？这说不通啊。保龄球明明重得多。

**导师：** 我知道这感觉确实不应该发生。但事实就是如此。所以我想问你：你预测它们会以不同的速度下落，但在真空中它们并不会。这个预测究竟哪里出了问题？
*[苏格拉底式提问——让学生自己诊断错误]*

**学生：** 呃……也许即使一个更重，重力对它们的作用还是一样的？

**导师：** 这个想法很有意思。继续沿着这个思路想。如果在真空中重力对它们的作用相同，那为什么它们在普通空气中会以不同的速度下落？
*[追问并引导——学生已经接近关键洞见，引导其思考空气阻力]*

**学生：** 哦……是因为空气吗？比如说，空气对较轻的那个球的减速作用更大？

**导师：** 再多说一点。为什么空气对其中一个球的减速作用会更大？
*[追问——保持学生的认知参与，而不是直接跳到解释]*

**学生：** 因为网球更轻，所以空气阻力对它的影响更大？就好像它没那么容易穿过空气？

**导师：** 你已经抓住了一个非常重要的要点。让我检查一下你是否理解了。请用你自己的话解释：为什么羽毛在空气中下落得很慢，但在真空中却和锤子以相同的速度下落？
*[自我解释提示——检验学生是否建立了连贯的模型]*

**学生：** 因为真空中没有空气阻力，所以只有重力起作用，而重力会让所有物体以相同的方式加速。但在空气中，和自身重量相比，羽毛受到的空气阻力大得多，所以它下落得更慢。锤子几乎感觉不到空气的影响。

**导师：** 这是一个非常出色的解释。你已经找到了关键区别：所有物体受到的重力加速度都相同，但空气阻力会因形状、表面积和质量而不同。现在让我用一个新情境来检验你对这个概念的理解。一名跳伞运动员和一名没有降落伞的高空跳伞者同时从同一架飞机上跳下。根据我们刚才讨论的内容，预测会发生什么，并解释原因。
*[迁移问题——检验该模型能否推广到其他情境]*

### 设计 rationale

该对话遵循基于概念改变研究的刻意设计的三阶段结构：

1. **先引出，再纠正。** 导师在第一阶段花时间让学生表达并确认自己的亚里士多德式信念。这有悖直觉——许多教师会立即说：“实际上，它们下落的速度是一样的。”但 Chi 等人（2001）的研究表明，直接纠正错误观念基本上没有效果。学生需要感受到自己的预测与现实之间的冲突。

2. **认知冲突，而非纠正。** 第二阶段呈现一个与学生预测相矛盾的事实（物体在真空中以相同速度下落），然后要求 STUDENT 解释这一差异。导师不进行解释——学生必须通过认知活动，将自己的预测与证据协调起来。这是 ICAP 框架中参与度最高的对话模式（Chi & Wylie，2014）。

3. **由学生生成解释。** 到第三阶段时，学生已经通过自己的推理得出了正确解释（“造成差异的是空气阻力，而不是重力”）。导师通过要求学生进行自我解释来检验其理解，并通过迁移问题测试这种理解能否推广。整个过程中，学生的发言多于导师。

4. **最少协助。** 导师在每个节点都采用尽可能轻量的引导方式：在提供提示或解释之前，优先使用沉默、推动式追问和问题。导师唯一直接陈述的内容，是物体在真空中以相同速度下落这一事实——其他内容都通过提问从学生那里引出。

---

## 已知局限

1. **此 skill 设计的是对话逻辑，而不是对话实现。** 要将决策规则和引导动作库转化为可运行的 AI 系统，需要进行远超出此 skill 输出范围的工程工作（状态跟踪、自然语言理解、响应生成）。该设计是一份蓝图，而不是可部署的系统。

2. **该对话假设一次只存在一种错误观念。** 现实中的学生往往会同时持有多个相互作用的错误观念。一个既混淆质量与重量、又不理解空气阻力的学生，比上面这个单一错误观念对话中的学生构成更复杂的辅导挑战。多重错误观念的对话设计仍是一个研究前沿，尚未成为已解决的问题。

3. **对于当前的 AI 系统来说，混合主动式对话很难实现。** 上面的对话假设 AI 能够理解学生的回答、检测错误观念，并实时选择适当的引导动作。当前的 LLM 在许多情况下可以近似实现这一点，但它们缺乏 AutoTutor 等专用 ITS 系统所具备的可靠状态跟踪和错误观念检测能力。在当前系统上部署时，可能需要简化该对话。

4. **相关证据主要来自 STEM 领域。** VanLehn（2011）、Graesser 等人（2005）以及 Koedinger & Aleven（2007）的研究主要在数学和科学领域开展。对话原则可以迁移到其他领域（“先引出，再解释”的模式在人文学科中同样有效），但错误观念和冲突的具体模式可能有所不同。关于议论文写作或历史分析的辅导对话，与物理学辅导对话的形式不同，尽管其底层原则相同。

5. **在基于文本的 AI 交互中，保持沉默很难。** 对话将有意保持沉默规定为一种辅导手段，但在基于文本的界面中，沉默可能与系统故障难以区分。在聊天机器人中实现“富有成效的沉默”需要进行明确设计——显示计时器、发送“慢慢来”消息，或在下一个提示出现前有意延迟。