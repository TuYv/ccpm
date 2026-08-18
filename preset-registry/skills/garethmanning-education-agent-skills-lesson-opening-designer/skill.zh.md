---
# AGENT SKILLS STANDARD FIELDS (v2)
name: lesson-opening-designer
description: "Design a lesson opening that activates prior knowledge and connects previous learning to today's content. Use when planning lesson starters, retrieval openers, or advance organisers."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "explicit-instruction/lesson-opening-designer"
skill_name: "Lesson Opening Designer"
domain: "explicit-instruction"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Rosenshine (2012) — Principles of Instruction, Principle 1: begin a lesson with a short review of previous learning"
  - "Ausubel (1960) — The use of advance organizers in the learning and retention of meaningful verbal material"
  - "Marzano (2007) — The Art and Science of Teaching: activating prior knowledge and setting purpose"
  - "Agarwal et al. (2012) — Classroom-based retrieval practice improves learning with minimal lesson time"
  - "Hattie (2009) — Visible Learning: prior knowledge activation as foundational to new learning"
input_schema:
  required:
    - field: "todays_topic"
      type: "string"
      description: "What will be taught in this lesson"
    - field: "previous_learning"
      type: "string"
      description: "What was taught in the last lesson or recent lessons that connects"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
  optional:
    - field: "opening_time"
      type: "string"
      description: "Minutes available for the lesson opening (default: 10 minutes)"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: retention data, common gaps from last lesson"
    - field: "lesson_objectives"
      type: "string"
      description: "Specific learning objectives for today's lesson"
    - field: "assessment_data"
      type: "string"
      description: "From context engine: exit ticket data from last lesson"
output_schema:
  type: "object"
  fields:
    - field: "retrieval_starter"
      type: "object"
      description: "A retrieval practice activity reviewing previous learning"
    - field: "prior_knowledge_bridge"
      type: "string"
      description: "How to connect previous learning to today's new content"
    - field: "learning_intention"
      type: "string"
      description: "How to frame today's learning purpose"
    - field: "opening_script"
      type: "string"
      description: "A complete, timed script for the lesson opening"
chains_well_with:
  - "retrieval-practice-generator"
  - "explicit-instruction-sequence-builder"
  - "spaced-practice-scheduler"
  - "checking-for-understanding-protocol-designer"
teacher_time: "3 minutes"
tags: ["lesson-opening", "retrieval", "prior-knowledge", "advance-organiser", "lesson-planning"]
---
# 课程开场设计师

## 此技能的作用

生成一个基于证据的课程开场，包含三个组成部分：复习先前所学内容的提取练习开场活动，将学生已有知识与今天新内容建立联系的先备知识桥接，以及在不透露所有答案的情况下明确学习目的的学习意图框架。输出是一份完整的、有时间安排的课程前 8–12 分钟脚本。AI 在这里尤其有价值，因为有效的课程开场必须在严格的时间限制内同时发挥三种功能（提取、激活、框定），并且提取问题必须经过精心选择，以针对今天课程最重要的先备知识，而不仅仅是“我们上节课学了什么”，更要具体聚焦于今天的课程将建立在什么知识之上。

## 证据基础

Rosenshine（2012）将每日复习列为有效教学的第一原则：“最有效的教师会用五到八分钟开始课程，复习之前学过的内容。”这有两个作用：通过提取练习强化记忆，以及激活新的学习将要连接到的先备知识图式。Ausubel（1960）证明，先行组织者——在新内容之前呈现的概念框架——能够通过提供帮助学习者组织输入信息的“观念支架”显著促进学习。Marzano（2007）指出，将新内容与先备知识联系起来是一项基础教学策略，但前提是这些联系必须明确建立，而不能想当然地认为学生能够自行建立联系。Agarwal 等人（2012）表明，在课程开始时进行简短的提取练习，能够以极低的时间成本提升记忆保持——即使 5 分钟的提取练习也能产生可测量的收益。Hattie（2009）指出，先备知识是新学习最强的单一预测因素——学生已经知道什么，决定了他们接下来能够学会什么。

## 输入架构

教师必须提供：
- **Today's topic:** 今天要教授的内容。*例如：“异分母分数的加法” / “第一次世界大战的起因：联盟体系” / “撰写一段平衡论证”*
- **Previous learning:** 近期教授过且与今天内容相关的知识。*例如：“上节课：等值分数。上周：同分母分数的加法” / “上节课：弗朗茨·斐迪南大公遇刺”*
- **Student level:** 年级。*例如：“八年级”*

可选内容（如有，可能由上下文引擎注入）：
- **Opening time:** 可用的时间（默认为 10 分钟）
- **Student profiles:** 记忆保持数据、之前课程中发现的知识缺口
- **Lesson objectives:** 今天的具体学习目标
- **Assessment data:** 上节课的出口条数据

## 提示词

```text
You are an expert in lesson design and the science of learning, with deep knowledge of Rosenshine's (2012) Principles of Instruction (Principle 1: daily review), Ausubel's (1960) advance organisers, and Agarwal et al.'s (2012) research on classroom retrieval practice. You understand that the lesson opening is the highest-leverage 10 minutes of any lesson — it determines whether students can access new content by activating the prior knowledge it depends on.

Your task is to design a lesson opening for:

**Today's topic:** {{todays_topic}}
**Previous learning:** {{previous_learning}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Opening time:** {{opening_time}} — if not provided, design for 10 minutes.
**Student profiles:** {{student_profiles}} — if not provided, assume a typical mixed-ability class where some students will have forgotten key content from the previous lesson.
**Lesson objectives:** {{lesson_objectives}} — if not provided, infer the learning objective from today's topic and frame it as a clear, student-facing intention.
**Assessment data:** {{assessment_data}} — if provided, use this to target retrieval questions toward the specific gaps identified. If not provided, target the prerequisite knowledge most critical for today's lesson.

Apply these evidence-based principles:

1. **Retrieval starter — not re-teaching (Rosenshine, 2012; Agarwal et al., 2012):**
   - The opening should require students to RETRIEVE previous learning from memory, not re-read or re-listen.
   - Questions should target the specific prior knowledge that today's lesson depends on — if today's lesson builds on equivalent fractions, retrieve equivalent fractions, not everything from last week.
   - Low stakes: no grades, no pressure. The purpose is strengthening memory and identifying gaps.
   - 5–6 minutes maximum for the retrieval activity.

2. **Prior knowledge bridge — make connections explicit (Ausubel, 1960; Marzano, 2007):**
   - After retrieval, explicitly connect previous learning to today's new content.
   - Do not assume students see the connection. State it: "You've just shown you can find equivalent fractions. Today we need that skill because..."
   - Use an advance organiser if appropriate: a brief conceptual framework that shows where today's content fits in the bigger picture.

3. **Learning intention — set purpose, not procedure (Hattie, 2009):**
   - Frame what students will learn, not what they will do. "By the end of this lesson, you will be able to add fractions with different denominators" (learning) is better than "Today we will complete a worksheet on adding fractions" (activity).
   - Keep it concise — one sentence.
   - Optionally include success criteria: "You'll know you've got it when you can..."

4. **Pace and energy:**
   - The opening sets the tone. Keep it brisk, purposeful, and interactive.
   - Students should be thinking within the first 60 seconds — no long teacher introductions.
   - Aim for the retrieval starter to begin as students enter the room (a "Do Now" displayed on the board).

Return your output in this exact format:

## Lesson Opening: [Today's Topic]

**For:** [Student level]
**Time:** [Opening duration]
**Builds on:** [Previous learning]

### On the Board as Students Enter (Do Now)
[The retrieval activity displayed on the board — students begin immediately on arrival]

### Retrieval Starter (X minutes)
[The retrieval questions, expected answers, and what to do if students struggle]

### Prior Knowledge Bridge (X minutes)
[Teacher script connecting retrieval to today's new content]

### Learning Intention (X minutes)
[How to frame today's learning — what students will be able to do, and how they'll know they've succeeded]

### Complete Timed Script
[The full opening as a single timed sequence the teacher can follow]

**Self-check before returning output:** Verify that (a) the retrieval starter requires genuine retrieval from memory, not re-reading, (b) retrieval questions target the specific prior knowledge today's lesson needs, (c) the bridge between prior and new learning is explicit, (d) the learning intention describes learning, not activity, and (e) the total timing fits within the stated opening time.
```

## 示例输出

**情境：** *今天的主题：“异分母分数相加” / 之前的学习内容：“上一节课：寻找等值分数（分子和分母同时乘以相同的数）。再前一节课：同分母分数相加。” / 学生年级：“七年级” / 开场时间：“10分钟”*

---

## 课程开场：异分母分数相加

**适用对象：** 七年级数学  
**时间：** 10分钟  
**建立在以下内容之上：** 等值分数（上一节课）、同分母分数相加（前两节课）

### 学生进入教室时板书上的内容（Do Now）

*在学生到达前写在黑板上或投影展示：*

**检索挑战——不要看笔记，也不要回顾之前的内容。根据记忆，尽你所能完成。**

1. 找出一个与 3/4 等值、且分母为 12 的分数。
2. 找出一个与 2/5 等值、且分母为 15 的分数。
3. 计算：3/8 + 2/8 = ?
4. 计算：5/12 + 4/12 = ?
5. **思考题：** 为什么你能轻松地把第 3 题和第 4 题中的分数相加？是什么让它们变得简单直接？

### 检索热身（5分钟）

**第 1–2 题**针对等值分数——这是今天课程的关键前置知识。如果学生不能熟练地找出等值分数，就无法将异分母分数相加。

**第 3–4 题**针对同分母分数相加——这是今天课程要拓展的技能。学生需要记住，当分母相同时，只需将分子相加，并保留分母不变。

**第 5 题**是一个元认知过渡问题——它要求学生说出*为什么*同分母分数相加很容易，从而引出今天的挑战：当分母不相同时，该怎么办？

**预期答案：**
1. 9/12（分子和分母都乘以 3）
2. 6/15（分子和分母都乘以 3）
3. 5/8
4. 9/12（可以约分为 3/4，但接受 9/12）
5. “因为分母相同，所以只要把上面的数字相加就可以了。”

**如果学生在第 1–2 题（等值分数）上遇到困难：**  
不要继续讲授新内容。用 3 分钟复习：“要得到一个等值分数，我们要让分子和分母分别乘以什么？”再使用小白板练习 2 个例题。然后过渡到新课程。如果等值分数的概念还不牢固，今天的内容就无法理解。

**如果学生在第 3–4 题（同分母分数相加）上遇到困难：**  
快速回顾：“当分母相同时，我们加的是大小相同的部分。3 个八分之一加上 2 个八分之一就是 5 个八分之一，就像 3 个苹果加上 2 个苹果等于 5 个苹果一样。”再快速完成两个例题，然后继续课程。

### 先前知识过渡（2分钟）

“第 5 题答对的同学请举手——你们的答案大概是‘因为分母相同’。完全正确。当分母相同时，加法很简单直接，因为这些部分的大小相同。3 个八分之一加上 2 个八分之一——我们加的是大小相同的部分。

但是，如果我问你：1/3 + 1/4 等于多少？这些部分的大小不同——三分之一和四分之一并不相同。你不能只把 1 + 1 相加，得到 2/7——那样是不对的。[在黑板上写下 1/3 + 1/4 ≠ 2/7。] 那么，我们首先需要做什么？”

[暂停。让学生思考。有些人会看出来。]

我们需要让分母相同——这意味着我们需要**等值分数**。你们刚才在 Q1 和 Q2 中练习的那项技能？这正是我们现在需要的。今天，我们要把你们已经掌握的两项技能结合起来——寻找等值分数**以及**分数加法——来解决一种新类型的问题。"

### 学习目标（1 分钟）

"到本节课结束时，你将能够先找到公分母，再对两个分母不同的分数进行加法运算。

当你能在没有帮助的情况下解答像 2/3 + 3/5 这样的问题，并向别人解释为什么需要公分母时，你就知道自己掌握了。

开始吧。"

### 完整计时脚本

| 时间 | 课堂活动 |
|------|-------------|
| 0:00 | 学生进入教室。提取挑战题已展示在白板上。学生立即开始——不等待，也不因点名暂停。教师在门口问候并指示："热身题在白板上。开始。" |
| 0:00–5:00 | 学生安静完成 Q1–5（提取条件——不看笔记，不讨论）。教师巡视，检查 Q1–2 的准确性。识别出 2–3 名在等值分数方面存在困难的学生。 |
| 5:00–5:30 | "放下笔。我们来检查。" 快速回答：Q1："9/12——在小白板上给我看。" Q2："6/15。" Q3："5/8。" Q4："9/12。" 用 30 秒快速查看。 |
| 5:30–6:00 | "Q5——为什么 Q3 和 Q4 很容易？" 随机点名一名学生。倾听是否回答“分母相同”。 |
| 6:00–8:00 | 先备知识衔接（上述脚本）。在白板上写下 1/3 + 1/4。让学生看到这个问题。将等值分数与新挑战联系起来。 |
| 8:00–8:30 | 陈述学习目标。将其写在白板上。 |
| 8:30–10:00 | 过渡到“我示范”阶段："看我解答 1/3 + 1/4。我会边想边说，这样你们就能跟上我的推理。" |

---

## 已知局限性

1. **只有在学生已经学过先修内容的情况下，提取式热身题才有效。** 如果学生缺席了等值分数课程，或者先修内容没有得到有效教学，那么提取式热身题会暴露出在今天内容之前需要解决的知识缺口。这是一项特性（诊断信息），而非缺陷——但它可能要求教师花费比计划更多的时间进行复习，从而压缩主课程内容。

2. **“Do Now” 热身题需要一致的课堂惯例。** 如果学生没有接受过进教室后立即开始学习的训练，前 2–3 分钟就会因安顿、说明和提醒而损失。课程开场设计假定已有一套成熟的惯例。建立这套惯例是一项课堂管理任务，而非课程设计任务。

3. **先备知识衔接是针对这一特定内容关联编写的脚本。** 如果教师没有遵循假定的教学顺序（等值分数 → 同分母加法 → 异分母加法），这一衔接就不会奏效。教师必须核实“先前学习”字段是否准确反映了实际教授的内容，而非计划教授的内容。