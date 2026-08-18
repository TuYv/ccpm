---
# AGENT SKILLS STANDARD FIELDS (v2)
name: differentiation-adapter
description: "Adapt a classroom task for specific learner needs while preserving the core learning objective intact. Use when differentiating for SEND, EAL, gifted, ADHD, dyslexia, or anxiety."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "curriculum-assessment/differentiation-adapter"
skill_name: "Differentiation Adapter"
domain: "curriculum-assessment"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Tomlinson (2001, 2014) — How to Differentiate Instruction in Academically Diverse Classrooms"
  - "Rose & Meyer (2002) — Teaching Every Student in the Digital Age: Universal Design for Learning"
  - "Vygotsky (1978) — Mind in Society: the zone of proximal development"
  - "Hattie (2009) — Visible Learning: differentiation and responsive teaching"
  - "CAST (2018) — Universal Design for Learning Guidelines version 2.2"
input_schema:
  required:
    - field: "original_task"
      type: "string"
      description: "The task as designed for the class"
    - field: "learner_profile"
      type: "string"
      description: "The specific learner need — e.g. extension, support, EAL, ADHD, dyslexia, anxiety, gifted"
    - field: "learning_objective"
      type: "string"
      description: "The learning objective — must remain the same across all differentiated versions"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: specific diagnoses, support plans, prior attainment"
    - field: "available_support"
      type: "string"
      description: "TA availability, technology, specialist resources"
output_schema:
  type: "object"
  fields:
    - field: "adapted_task"
      type: "object"
      description: "The differentiated version with specific modifications"
    - field: "what_changed"
      type: "string"
      description: "Explicit statement of what was modified and what was maintained"
    - field: "objective_check"
      type: "string"
      description: "Verification that the learning objective is maintained"
    - field: "implementation_notes"
      type: "string"
      description: "Practical notes for the teacher on implementing the adaptation"
chains_well_with:
  - "scaffolded-task-modifier"
  - "cognitive-load-analyser"
  - "formative-assessment-technique-selector"
  - "practice-problem-sequence-designer"
teacher_time: "3 minutes"
tags: ["differentiation", "UDL", "inclusion", "SEND", "adaptation"]
---
# 差异化适配器

## 此技能的作用

针对特定学习者画像调整任务——包括拓展、支持、英语为附加语言（EAL）、ADHD、阅读障碍、焦虑、视力障碍、自闭症以及资优和高才能——同时明确维持相同的学习目标。其核心原则是：差异化调整的是学习的路径，而不是终点。一名有阅读障碍的学生，可能需要不同的输入格式、不同的作答格式以及不同的支架，才能完成与同伴相同的学习目标——但他们应当朝着相同的理解目标努力。输出内容包括调整后的任务、对哪些内容发生了变化以及哪些内容保持不变的明确说明、对学习目标得以维持的验证，以及实施说明。AI 在这里尤其有价值，因为有效的差异化需要同时了解学习者画像（这一画像会造成哪些障碍？）和任务（任务中的哪些要素会造成这些障碍？）——这是一种双向分析，必须针对每种任务与学习需求的组合分别进行。

## 证据基础

Tomlinson（2001、2014）确立了差异化教学的框架，指出差异化包含三个维度：内容（学生学习什么）、过程（他们如何学习）以及成果（他们如何展示学习成果）。她强调，差异化应依据准备程度、兴趣和学习者画像进行——而不是依据学习风格（学习风格已被证伪，因此本库不采用这一概念）。Rose & Meyer（2002）发展了通用学习设计（UDL），主张课程从一开始就应通过以下三项原则进行设计，以确保所有学习者都能参与：多种参与方式（学习的“为什么”）、多种表征方式（学习的“是什么”）以及多种行动与表达方式（学习的“如何进行”）。Vygotsky（1978）确立了教学应针对最近发展区，即学习者在适当支持下能够完成、但尚不能独立完成的内容。Hattie（2009）发现，差异化总体上具有中等程度的效果，但效果会因实施质量而显著不同——实施不当的差异化（给能力较弱的学生更容易的任务）实际上可能通过降低期望来削弱学习成效。CAST（2018）提供了目前最完善的 UDL 指南，并附有具体的实施策略。

## 输入模式

教师必须提供：
- **原始任务：** 按原设计呈现的任务。*例如：“阅读《圣诞颂歌》中的节选，并撰写一段文字，分析狄更斯如何呈现斯克鲁奇的转变，同时使用引文作为证据。”*
- **学习者画像：** 具体需求。*例如：“拓展——完成任务很快、需要更深层次挑战的学生”/“支持——有阅读障碍、难以应对阅读量较大的任务的学生”/“ADHD——难以持续专注于长篇写作的学生”*
- **学习目标：** 所有学生都应学会的内容。*例如：“运用文本证据分析狄更斯如何呈现人物变化。”*

可选（如果可用，由上下文引擎注入）：
- **学生年级：** 年级组
- **学科领域：** 课程学科
- **学生档案：** 具体诊断、支持计划、先前学业表现
- **可用支持：** 助教、技术、专业资源

## 提示词

```text
You are an expert in differentiated instruction and inclusive education, with deep knowledge of Tomlinson's (2001, 2014) differentiation framework, Rose & Meyer's (2002) Universal Design for Learning principles, and CAST's (2018) UDL guidelines. You understand that effective differentiation modifies the ROUTE to learning, not the DESTINATION — all students work toward the same learning objective, but the pathway is adapted to remove barriers specific to each learner's profile.

IMPORTANT: Differentiation by learning style (visual/auditory/kinaesthetic preferences) is NOT supported — this is excluded from this library as debunked (Pashler et al., 2008). Differentiation by readiness, specific learning needs, and learner profile IS supported.

Your task is to adapt:

**Original task:** {{original_task}}
**Learner profile:** {{learner_profile}}
**Learning objective:** {{learning_objective}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, infer from the task.
**Subject area:** {{subject_area}} — if not provided, infer from the task.
**Student profiles:** {{student_profiles}} — if not provided, base adaptations on general research about the stated learner profile.
**Available support:** {{available_support}} — if not provided, assume standard classroom resources with no specialist TA.

Apply these evidence-based principles:

1. **Same objective, different route (Tomlinson, 2001):**
   - The learning objective must be identical for the adapted and original task.
   - Modify HOW the student engages with the content or demonstrates their learning, not WHAT they learn.
   - If the adaptation reduces cognitive demand, it has gone too far — it should reduce barriers, not reduce thinking.

2. **Profile-specific adaptations (UDL, CAST 2018):**
   Adapt based on what the research says about each learner profile:
   - **Extension/Gifted:** Increase depth and complexity — not more of the same, but qualitatively different challenge. Abstract thinking, multiple perspectives, evaluation, creation.
   - **Support/Below expected level:** Additional scaffolding — sentence frames, graphic organisers, reduced volume (not reduced difficulty), worked examples to reference.
   - **Dyslexia:** Reduce reading load without reducing thinking. Larger font, coloured overlay, audio version of text, key quotations pre-selected, scribe option for writing. Focus on demonstrating UNDERSTANDING, not reading fluency.
   - **ADHD:** Break task into shorter chunks with check-in points. Reduce unnecessary information. Provide movement breaks. Use timers for focused bursts. Minimise distractions in the task presentation.
   - **EAL:** Language scaffolds (sentence frames, word banks, glossary, bilingual support) — see the EAL domain skills for detailed approaches.
   - **Anxiety:** Reduce performance pressure. Allow draft attempts. Provide clear structure. Offer choice of response format. Avoid cold-calling or public demonstration of work-in-progress.
   - **Autism:** Provide explicit, unambiguous instructions. Avoid figurative language in task instructions (or gloss it). Provide predictable structure. Allow additional processing time.
   - **Visual impairment:** Enlarged text, high contrast, audio alternatives, tactile resources where appropriate.

3. **UDL multiple means (Rose & Meyer, 2002):**
   - **Multiple means of representation:** Can the content be presented differently? (Audio, visual, simplified text alongside original, graphic organiser)
   - **Multiple means of action and expression:** Can the student demonstrate learning differently? (Verbal instead of written, diagram instead of essay, recorded instead of live)
   - **Multiple means of engagement:** Can the task be connected to the student's interests or motivations?

4. **Avoid common differentiation errors (Hattie, 2009):**
   - Do NOT give a simpler version of the task to struggling students — this lowers expectations and reduces learning.
   - Do NOT give "more work" to extension students — depth, not volume.
   - Do NOT assume that the adapted version is inherently "lower" — it should be equally demanding but differently accessible.

Return your output in this exact format:

## Adapted Task: [Learner Profile]

**Original task:** [Brief description]
**Adapted for:** [Learner profile]
**Learning objective:** [Must be identical to original]

### The Adapted Task

[Complete adapted version of the task with all modifications in place]

### What Changed and What Stayed the Same

**Changed:** [Specific modifications — what was adapted and why]
**Maintained:** [What was deliberately kept the same — especially cognitive demand and learning objective]

### Objective Check

[Explicit verification: "The adapted task still requires the student to [learning objective] because..."]

### Implementation Notes

[Practical advice for the teacher: how to introduce the adaptation, how to avoid singling the student out, what to watch for]

**Self-check before returning output:** Verify that (a) the learning objective is identical, (b) adaptations address the specific barriers of the stated learner profile, (c) cognitive demand is maintained — the adapted task is not easier, just more accessible, (d) the adaptation is based on research about the learner profile, not on learning style preferences, and (e) the implementation notes address how to manage the adaptation in a classroom without stigmatising the student.
```

## 示例输出

**情境：** *原任务：“阅读《圣诞颂歌》中的节选，并写一段话，分析狄更斯如何呈现斯克鲁奇的转变，使用引文作为证据。” / 学习者画像：“阅读障碍——学生的阅读年龄大约比实际年龄低 2 岁，难以解码较长文本，回避阅读任务，但在课堂讨论中展现出较强的口头分析能力” / 学习目标：“使用文本证据分析狄更斯如何呈现人物变化” / 学生年级：“9 年级” / 学科领域：“英国文学”*

---

## 调整后的任务：阅读障碍

**原任务：** 阅读《圣诞颂歌》中的节选，并写一段话，分析狄更斯如何呈现斯克鲁奇的转变，使用引文作为证据。  
**适用于：** 阅读障碍——口头分析能力强，阅读年龄约比实际年龄低 2 岁  
**学习目标：** 使用文本证据分析狄更斯如何呈现人物变化

### 调整后的任务

**阅读节选：**
- 将节选印在米白色或浅褐色纸张上（减少视觉对比带来的压力），使用至少 14pt 的字体，并设置 1.5 倍行距。
- 预先标出 4 条展现斯克鲁奇转变的关键引文——学生应重点关注这些引文。这样可以消除学生在密集文本中寻找证据的障碍（这属于阅读流畅性任务），同时保留分析证据的要求（这才是真正的学习目标）。
- 如果有音频资源，提供节选的音频录音，让学生在跟随文本阅读的同时收听。这能帮助学生进行解码，同时不会完全移除文本。

**分析与写作：**
- 提供一个 PEEL 段落框架：
  - **观点：** “狄更斯通过……呈现了斯克鲁奇的转变”
  - **证据：** “狄更斯写道‘___’时体现了这一点（使用标出的引文之一）”
  - **解释：** “这条引文表明斯克鲁奇发生了变化，因为……”
  - **联系：** “这向读者表明……”
- 学生必须在每个环节中提供自己的分析思路——框架的作用是组织写作，而不是代替分析。
- **替代性作答方式：** 如果主要障碍在于写作（而不是分析），可以让学生选择用口头方式录下自己的段落（语音录音或口述给记录员），而不是亲自写下。分析要求完全相同；只有输出形式发生变化。

### 哪些内容发生了变化，哪些内容保持不变

**发生变化的内容：**
- 文本呈现方式：更大的字体、米白色纸张、更宽的行距——降低解码负担
- 预先标出的引文：免除扫描全文寻找证据的需要——这属于阅读流畅性任务，而非分析任务
- 音频支持：可选择在阅读时同步收听
- 写作支架：提供 PEEL 框架来组织段落
- 替代性输出：提供口头作答选项

**保持不变的内容：**
- 学习目标：使用文本证据分析狄更斯如何呈现人物变化
- 使用具体引文作为证据的要求
- 分析要求：学生必须解释引文说明了什么，以及它为什么具有重要意义
- 质量期望：分析应当与其他学生一样具有洞察力
- 文本本身：使用相同的节选，而不是简化版本

### 目标检查

调整后的任务仍然要求学生**使用文本证据分析狄更斯如何呈现人物变化**，因为：
- 学生仍然必须阅读选段（在支持下，但文本相同）
- 学生仍然必须选择一处引文并解释其重要性
- 学生仍然必须进行分析——解释这处引文揭示了斯克鲁奇怎样的转变，以及狄更斯为什么选择以这种方式呈现这一转变
- 预先标出重点内容消除了阅读流畅性方面的障碍，但没有消除分析方面的障碍——学生仍然需要选择要使用的重点引文，并独立解释其重要性
- PEEL 框架为写作提供结构，但不会提供分析内容——每个“解释”和“联系”部分都需要学生进行自己的思考

### 实施说明

1. **以不引人注意的方式引入调整。** 不要宣布“这是阅读障碍版本”。相反，可以让所有学生都能获得一些调整：为每个人提供印在米色纸张上的选段（这对所有读者都有帮助）。向全班提供音频版本。针对不同学生分别标出重点引文——将材料发给学生，而不是投影出来。

2. **关注分析，而不是写作。** 这名学生的优势在于口头分析。如果书面回答弱于预期，应检查障碍究竟来自写作机制（拼写、书写、句子构造），还是来自分析能力。如果学生能够口头解释自己的分析，却无法将其写下来，那么障碍在于写作产出，而不是理解能力——此时应提供录音选项。

3. **不要降低对分析质量的要求。** 这名阅读障碍学生具有较强的口头分析能力。他们的分析应当与其他学生一样，按照相同标准进行评价。调整是为了消除障碍，而不是降低要求。如果学生写出的段落内容单薄，应追问“你能进一步说明这处引文展现了什么吗？”——推动其深入分析，而不是说“你愿意尝试已经很棒了。”

4. **随着时间推移重新审视预先标出的重点内容。** 预先选择引文是一种支架，随着学生阅读耐力和信心的发展，应逐步减少这种支架。下一次，可以标出 6 处引文，让学生选择其中最好的 2 处。最终，可以提供未标注重点的文本，看看学生能否独立找出证据（或许给予更多时间）。

---

## 已知局限

1. **该调整基于关于学习者特征的一般研究，而非针对某一名具体学生。** 阅读障碍在不同学生身上的表现各不相同——有些学生主要难以进行解码，有些学生阅读速度较慢，还有些学生在工作记忆方面存在困难。教师对具体学生的了解对于进一步完善调整至关重要。如果学生的阅读障碍主要影响拼写而非阅读，那么所采用的调整也应有所不同。

2. **明确排除了根据学习风格进行差异化教学。** 此技能不会根据“视觉型”“听觉型”或“动觉型”偏好来调整任务——相关证据并不支持这种做法（Pashler et al., 2008）。调整是基于与特定学习需求相关、经过研究证实的障碍，而不是基于个人偏好。

3. **调整后的任务可能会无意中传达较低的期望。** 如果学生持续接受“不同的”作业，他们可能会内化这样一种信息：自己能力较弱。实施说明中对此有所涉及，但教师必须警惕如何描述这些调整：应将其定位为获取学习内容的支持（就像有需要的人佩戴眼镜一样），而不是降低要求。目标是实现公平——学习内容相同，只是获取方式不同——而不是进入较低的学习轨道。