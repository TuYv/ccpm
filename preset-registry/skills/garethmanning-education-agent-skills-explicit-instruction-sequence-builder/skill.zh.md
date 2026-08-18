---
# AGENT SKILLS STANDARD FIELDS (v2)
name: explicit-instruction-sequence-builder
description: "Build a complete explicit instruction sequence from teacher modelling through guided practice to independent work. Use when teaching new skills, procedures, or concepts through direct instruction."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "explicit-instruction/explicit-instruction-sequence-builder"
skill_name: "Explicit Instruction Sequence Builder (I Do / We Do / You Do)"
domain: "explicit-instruction"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Rosenshine (2012) — Principles of Instruction: research-based strategies that all teachers should know"
  - "Pearson & Gallagher (1983) — The instruction of reading comprehension (gradual release of responsibility model)"
  - "Archer & Hughes (2011) — Explicit Instruction: Effective and Efficient Teaching"
  - "Hattie (2009) — Visible Learning: direct instruction effect size 0.59"
  - "Engelmann & Carnine (1982) — Theory of Instruction: principles and applications"
input_schema:
  required:
    - field: "skill_to_teach"
      type: "string"
      description: "The specific skill or concept to be taught through explicit instruction"
    - field: "student_level"
      type: "string"
      description: "Age/year group and prior knowledge level"
    - field: "lesson_time"
      type: "string"
      description: "Available lesson time in minutes"
  optional:
    - field: "common_misconceptions"
      type: "array"
      description: "Known misconceptions or errors students make with this skill"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: ability range, EAL needs, SEND profiles"
    - field: "prior_knowledge"
      type: "string"
      description: "What students already know that this builds on"
    - field: "success_criteria"
      type: "string"
      description: "From context engine: how success will be measured"
output_schema:
  type: "object"
  fields:
    - field: "i_do"
      type: "object"
      description: "Teacher modelling phase with scripted explanation and think-aloud"
    - field: "we_do"
      type: "object"
      description: "Guided practice phase with structured teacher-student interaction"
    - field: "you_do"
      type: "object"
      description: "Independent practice phase with monitoring checkpoints"
    - field: "cfu_points"
      type: "array"
      description: "Checking for understanding moments embedded throughout"
    - field: "timing_guide"
      type: "string"
      description: "Suggested time allocation across the three phases"
chains_well_with:
  - "checking-for-understanding-protocol-designer"
  - "worked-example-fading-designer"
  - "think-aloud-script-generator"
  - "practice-problem-sequence-designer"
  - "pedagogical-content-knowledge-developer"
teacher_time: "5 minutes"
tags: ["explicit-instruction", "gradual-release", "modelling", "direct-instruction", "scaffolding"]
---
# 明确指导序列构建器（我做 / 我们做 / 你做）

## 此技能的作用

生成一套完整的渐进式责任释放教学序列，用于教授特定技能：包括脚本化的“我做”（教师通过思维外显进行示范）、结构化的“我们做”（包含师生互动的引导练习），以及经过设计的“你做”（带有监测节点的独立练习）。输出内容包括每次阶段转换时的理解检查环节和时间安排指南。人工智能在此处尤其有价值，因为有效的明确指导要求教师将专家看不见的思维过程变得可见——把他们已经自动完成的技能分解为离散的、可教学的步骤，并阐明其中的推理过程。这种对专家表现进行分解的工作在认知上要求很高，也是大多数明确指导教学效果不佳的地方。

## 证据基础

Rosenshine（2012）综合了数十年的研究，提出了十项教学原则，其中明确指导是核心：先进行简短复习，以小步骤呈现新材料，并在每一步之后安排练习，提供示范，引导学生练习，检查理解情况，并确保较高的成功率。Pearson 与 Gallagher（1983）正式提出了渐进式责任释放模型——教师一开始承担全部认知负荷（我做），然后逐步与学生共同承担（我们做），最后将责任完全转交给学生（你做）。Archer 与 Hughes（2011）将明确指导转化为可供教师实践的操作方法，强调“我做”阶段不仅必须包含示范，还必须阐明决策过程——学生需要听到每一步“为什么”这样做，而不仅仅是看到操作本身。Hattie（2009）发现，直接教学的效应量为 0.59，持续位列影响力最高的教学方法之列。Engelmann 与 Carnine（1982）确立了明确指导中示例的顺序与结构会显著影响学习——示例必须经过精心选择，以突出关键特征并最大限度减少歧义。

## 输入模式

教师必须提供：
- **要教授的技能：** 具体的技能或概念。*例如：“为分析性段落写主题句” / “在分数、小数和百分数之间进行转换” / “安全地架设本生灯”*
- **学生水平：** 年级和已有知识。*例如：“八年级，能够写段落，但不会组织分析性写作” / “七年级，第一次使用实验室设备”*
- **课程时间：** 可用分钟数。*例如：“50 分钟” / “60 分钟”*

可选信息（如果可用，则由上下文引擎注入）：
- **常见误解：** 与该技能相关的已知错误
- **学生情况：** 能力范围、EAL 需求、SEND 情况
- **先备知识：** 学生已经掌握的内容
- **成功标准：** 衡量成功的方式

## 提示词

```
You are an expert in explicit instruction and the gradual release of responsibility model, with deep knowledge of Rosenshine's (2012) Principles of Instruction, Pearson & Gallagher's (1983) gradual release framework, and Archer & Hughes' (2011) work on effective modelling. You understand that the critical quality of explicit instruction is making expert thinking visible — not just showing students what to do, but articulating the decision-making process behind each step.

Your task is to design a complete I Do / We Do / You Do sequence for:

**Skill:** {{skill_to_teach}}
**Student level:** {{student_level}}
**Lesson time:** {{lesson_time}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Common misconceptions:** {{common_misconceptions}} — if not provided, identify the most likely misconceptions for this skill based on your subject knowledge and address them in the modelling phase.
**Student profiles:** {{student_profiles}} — if not provided, design for a typical mixed-ability class and note where differentiation would be needed.
**Prior knowledge:** {{prior_knowledge}} — if not provided, state the assumed prerequisite knowledge explicitly so the teacher can verify.
**Success criteria:** {{success_criteria}} — if not provided, generate clear success criteria that describe what successful performance looks like at the end of the lesson.

Apply these evidence-based principles:

1. **I Do — Teacher models with think-aloud (Rosenshine, 2012; Archer & Hughes, 2011):**
   - Demonstrate the complete skill from start to finish.
   - Articulate your thinking at EVERY decision point — not just what you're doing, but WHY. "I'm choosing this word because..." / "At this point I need to decide between X and Y, and I choose X because..."
   - Highlight critical features: what makes this different from similar tasks.
   - Show common errors and explain why they're wrong (inoculation against misconceptions).
   - Keep it concise — modelling should be 10–15 minutes maximum. Students learn by doing, not by watching.

2. **We Do — Guided practice with high interaction (Rosenshine, 2012, Principle 4):**
   - Teacher and students work through a new example TOGETHER.
   - Teacher does the early steps, students take over progressively.
   - Use frequent checking: "What should I do next?" / "Why did I choose that?" / cold-calling for responses.
   - This is NOT the teacher doing another example while students watch. Students must be actively contributing.
   - Aim for 80%+ success rate before moving to You Do (Rosenshine, 2012, Principle 7).

3. **You Do — Independent practice with monitoring (Rosenshine, 2012, Principles 5 & 8):**
   - Students practise independently. The teacher circulates and monitors.
   - Begin with problems very similar to the modelled example, then gradually vary.
   - Include a monitoring plan: what to look for, when to intervene, how to identify students who need re-teaching.
   - Build in a checkpoint: after 5 minutes of independent work, quick whole-class check before students continue.

4. **Checking for Understanding at each transition (Rosenshine, 2012, Principle 3):**
   - Between I Do and We Do: "Before we try one together, tell your partner: what is the first step?"
   - Between We Do and You Do: "Give me a thumbs up if you could do the next one on your own, sideways if you need one more guided example, down if you're not sure."
   - During You Do: circulate and check 5 specific students' work within the first 3 minutes.

5. **Time allocation (Archer & Hughes, 2011):**
   - I Do: ~20% of lesson time
   - We Do: ~30% of lesson time
   - You Do: ~40% of lesson time
   - Transitions and CFU: ~10%
   - If time is short, compress I Do (not We Do or You Do — students need practice time).

Return your output in this exact format:

## Explicit Instruction Sequence: [Skill Name]

**For:** [Student level]
**Time:** [Lesson time]
**Success criteria:** [What students will be able to do by the end]

### Prerequisites
[What students need to know before this lesson — teacher should verify]

### I Do — Teacher Models (approx. X minutes)

**Setup:** [How to frame the skill and connect to prior knowledge]
**Model:** [Step-by-step demonstration with think-aloud script at each decision point]
**Common error inoculation:** [Show a common mistake and explain why it's wrong]

**CFU checkpoint:** [Quick check before moving to We Do]

### We Do — Guided Practice (approx. X minutes)

**Example:** [A new example for guided practice]
**Interaction plan:** [Which steps the teacher does, which students contribute, how to elicit responses]
**Scaffolding notes:** [Support for students who are struggling / extension for those who are ready]

**CFU checkpoint:** [Check readiness for independent practice]

### You Do — Independent Practice (approx. X minutes)

**Practice set:** [4–6 practice problems/tasks, sequenced from similar-to-model to varied]
**Monitoring plan:** [What to look for, which students to check first, intervention triggers]
**Early finisher extension:** [What to do with students who finish quickly]

### Differentiation Notes
[How to adjust for different ability levels without changing the learning intention]

**Self-check before returning output:** Verify that (a) the I Do phase includes think-aloud reasoning at every decision point, not just demonstration, (b) the We Do phase requires active student contribution, not passive watching, (c) the You Do practice problems progress from similar-to-model to varied, (d) CFU checkpoints are embedded at each transition, (e) timing is realistic for the stated lesson length, and (f) common misconceptions are addressed during modelling, not left for students to discover.
```

## 示例输出

**情境：** *技能：“为英语文学分析段落撰写主题句”／学生水平：“九年级，能够撰写段落，但主题句通常是描述性的，而不是分析性的”／课程时间：“50分钟”*

---

## 明确的教学步骤：撰写分析性主题句

**适用对象：** 九年级英语文学
**时间：** 50分钟
**成功标准：** 学生能够撰写主题句，就作者的写作手法或意图提出分析性论断，而不是描述文本中发生了什么。

### 前置要求
学生应当能够：写出完整的句子，从文本中找出一处引文，并理解人物的行为与作者的选择之间的区别。教师应通过一个简短问题进行确认：“说‘麦克白杀死了邓肯’和说‘莎士比亚将麦克白塑造为一个逐渐被野心腐化的人’，这两者有什么区别？”

### 我示范——教师示范（10分钟）

**准备（2分钟）：**
“今天我要教你们如何写分析性段落的第一句话，也就是主题句。这句话告诉读者你的段落将要论证什么。关键词是*论证*。主题句是一个论断，而不是描述。看我怎么做，同时听我思考的过程。”

**示范（6分钟）：**

“我要写的是莎士比亚如何在第一幕中呈现麦克白夫人的野心。让我来写一个主题句。

我最初的想法是：‘在第一幕中，麦克白夫人非常有野心。’让我检查一下——这是一个论断，还是一个描述？这是一个描述。它告诉你麦克白夫人是什么样的人，但没有说明莎士比亚正在做什么。我需要从人物转向作者。

让我再试一次：‘莎士比亚将麦克白夫人的野心呈现得比麦克白自己的野心更加冷酷、更加经过算计，并通过她在第一幕第五场中的独白，揭示出一个有意识地选择压抑人性的人物。’

现在让我根据标准检查一下：
- 是否提到了作者？是的——‘莎士比亚将……呈现为’。
- 是否提出了一个可以论证的观点？是的——有人可能不同意她的野心‘更加冷酷’，或者不同意她‘有意识地选择’。
- 是否指出了一种写作手法？是的——‘通过她的独白’告诉读者，我将分析具体的语言。
- 我能否围绕这个观点写出一个完整的段落？可以——我会分析‘让我的性别消失’这段演说。

这是一个有力的主题句。现在让我展示一个常见错误。”

**常见错误预防（2分钟）：**
“下面是大多数九年级学生会写的内容：‘在第一幕中，麦克白夫人读了一封信，然后请求精灵让她失去女性特质。’

这是对所发生事情的描述。它是准确的，但作为主题句却没有用，因为其中没有可供论证的内容——它只是在概述情节。注意其中的区别：
- 描述：‘麦克白夫人请求精灵让她失去女性特质。’（发生了什么）
- 分析：‘莎士比亚借助麦克白夫人对黑暗精灵的召唤，暗示在这部戏剧中，野心要求摧毁女性的同情心。’（作者在做什么，以及为什么这样做）

转变是从“角色”转向“作者”。从“发生了什么”转向“作者为什么要让它发生”。"

**CFU 检查点：**
"转向你的同伴。告诉他们：描述性主题句和分析性主题句有什么区别？你们有 30 秒。" 随机点名 2 名学生分享。注意倾听：是否提到了作者的选择/手法，而不是角色的行为/情节。

### 我们一起做 — 指导练习（15 分钟）

**示例：** "现在让我们一起写一个。问题是：莎士比亚如何在第 3 幕第 1 场中呈现暴力这一主题？"

**互动计划：**

*步骤 1 — 教师引导：* "主题句中我首先需要什么？我需要点出作者。所以我会以“莎士比亚……”开头。接下来要用什么动词？不要用“写了……”——这太模糊了。给我一个更有力的动词。" 引导全班说出：呈现 / 传达 / 展现 / 揭示 / 建构。"很好——“莎士比亚呈现……”他呈现的是什么？"

*步骤 2 — 学生在支持下参与：* "现在我需要提出一个关于第 3 幕第 1 场中暴力的观点。不要描述发生了什么——要论证莎士比亚正在如何运用暴力。把你的观点写在白板上。" 学生书写。教师巡视白板。选出一个有力的例子和一个较弱的例子（隐去身份）。"这个例子说的是“将暴力呈现为不受约束的男性气概所导致的必然结果”。这是一个观点——有人可以提出相反的论点。这个例子说的是“提伯尔特和罗密欧发生争斗，茂丘西奥死了”。这是描述。让我们一起把它提升一下——莎士比亚通过这一场景表达了关于暴力的什么看法？"

*步骤 3 — 学生主导：* "现在加入对手法的提及。莎士比亚是如何呈现这一点的？使用了什么技巧或结构上的选择？写出完整的主题句。" 学生书写。教师巡视并阅读 6–8 块白板。全班分享并评价：是否点出了作者、提出了观点，并指出了所使用的手法？

**支架提示：**
- 遇到困难的学生：提供句式框架："莎士比亚通过 [手法] 将 [主题] 呈现为 [观点]，暗示了 [解读]。"
- 准备好接受挑战的学生：能否写出一个承认反方观点的主题句？"虽然莎士比亚一开始将暴力呈现为……，但第 3 幕第 1 场揭示了……"

**CFU 检查点：**
"如果你能够独立写出下一个主题句，请竖起大拇指。如果你希望我们再一起看一个例子，请将拇指横向。如果你卡住了，请将拇指向下。" 如果超过 30% 的学生选择横向或向下，再进行一个指导示例。如果 80% 以上的学生选择向上，则进入“你们独立做”。

### 你们独立做 — 独立练习（20 分钟）

**练习题组：**

1. 为以下问题写一个主题句："莎士比亚如何将茂丘西奥呈现为罗密欧的对照？" *(与示范例子非常接近——同一文本、同一技能)*
2. 为以下问题写一个主题句："斯坦贝克如何在《人鼠之间》的开篇呈现孤独？" *(同一技能，不同文本——检验迁移能力)*
3. 为以下问题写一个主题句："诗人如何在《刺刀冲锋》中呈现冲突的体验？" *(同一技能，诗歌语境——进一步检验迁移能力)*
4. **挑战：** 为同一个问题写出两个不同的主题句。哪个更有力？批注说明原因。

**监测计划：**
- 前 3 分钟：检查你最担心的 5 名学生（他们在 CFU 环节表现出偏题或退步）。阅读他们写的第一句话。如果这句话是在描述而不是分析，立即使用句子框架支架进行干预。
- 第 5 分钟：全班暂停。“把你写的第一句主题句读给你的搭档听。搭档，请告诉对方：这句话是否点明了作者、提出了观点，并指出了方法？如果没有，现在就修改。”
- 第 5–20 分钟：系统地巡视。寻找常见错误（用描述代替分析）。收集 2–3 个优秀示例和 1 个较弱示例，在最后 5 分钟进行全班反馈。

**提前完成任务的学生拓展：**
选择一个你喜欢的学科（历史、科学、地理），为其写一句主题句，使用相同的分析结构：点明创作者/作者/原因，提出观点，并指出一种方法或机制。这项任务检验的是学生是否理解了可迁移的技能，而不只是英语文学中的应用。

### 差异化教学说明

- **支持：** 对于需要帮助的学生，句子框架（“Shakespeare presents [theme] as [claim] through [method]”）在整个 You Do 阶段都可以使用。这是脚手架，而不是降低任务难度——他们仍然需要提出分析性观点，只是获得了结构上的支持。
- **EAL 学生：** 在课前预先教授分析性动词（presents、conveys、reveals、constructs、demonstrates）及其定义，或在任务过程中提供词汇表。
- **拓展：** 要求学生写出包含让步或反驳观点的主题句（“Although... , Shakespeare ultimately presents...”）。这会增加句法复杂性，同时保持相同的分析技能。

---

## 已知局限

1. **显性教学对于具有可识别步骤和明确成功标准的技能最为有效。** 分析性主题句的写作可以分解为多个步骤。创意写作、开放式问题解决以及存在多种有效方法的任务，不太适合严格的 I Do / We Do / You Do 流程。对于开放式任务，示范阶段应展示决策过程，而不是展示一种“正确”的方法。

2. **I Do 阶段的质量完全取决于教师阐述自身思维的能力。** 脚本提供了一个范例，但教师必须用自己的表达方式进行讲解，并根据学生的回应进行调整。机械地照读脚本，比不那么 polished 但真实的思维示范更糟糕。教师应当排练思维示范，而不是朗读脚本。

3. **We Do 阶段存在支架过度的风险。** 如果教师做得太多，而学生参与得太少，“指导练习”就会变成第二次示范。互动计划明确了学生应当接手的环节，但教师必须克制在学生犹豫时立即介入的冲动——只要成功率保持在 80% 以上，We Do 阶段出现有成效的挣扎是合适的。