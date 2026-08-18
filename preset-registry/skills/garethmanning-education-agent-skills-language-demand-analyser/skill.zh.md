---
# AGENT SKILLS STANDARD FIELDS (v2)
name: language-demand-analyser
description: "Analyse the language demands of a classroom task to identify barriers for EAL and multilingual learners. Use when adapting tasks, planning support, or assessing linguistic accessibility."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "eal-language-development/language-demand-analyser"
skill_name: "Language Demand Analyser"
domain: "eal-language-development"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Cummins (1981, 2000) — BICS/CALP framework: Basic Interpersonal Communication Skills vs. Cognitive Academic Language Proficiency"
  - "Gibbons (2002, 2015) — Scaffolding Language, Scaffolding Learning: teaching English language learners in the mainstream classroom"
  - "Schleppegrell (2004) — The Language of Schooling: a functional linguistics perspective"
  - "Zwiers (2014) — Building Academic Language: meeting Common Core standards across disciplines"
  - "Bailey & Heritage (2008) — Formative Assessment for Literacy: building reading and academic language skills across the curriculum"
input_schema:
  required:
    - field: "task_description"
      type: "string"
      description: "The specific classroom task students must complete"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
  optional:
    - field: "language_proficiency"
      type: "string"
      description: "EAL proficiency level of target students — e.g. New to English, Early Acquisition, Developing, Consolidating, Competent"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: first languages, time in English-medium schooling, specific language needs"
    - field: "task_materials"
      type: "string"
      description: "Description of texts, worksheets, or resources used in the task"
    - field: "prior_language_instruction"
      type: "string"
      description: "Language features already explicitly taught to these students"
output_schema:
  type: "object"
  fields:
    - field: "language_demand_profile"
      type: "object"
      description: "Analysis across four dimensions: vocabulary, grammar, discourse, and genre"
    - field: "scaffold_recommendations"
      type: "object"
      description: "Specific scaffolds for each language demand dimension"
    - field: "priority_actions"
      type: "array"
      description: "The 2–3 highest-impact scaffolds to implement if time is limited"
    - field: "teacher_language_notes"
      type: "string"
      description: "How the teacher's own language use during the task can support access"
chains_well_with:
  - "vocabulary-tiering-tool"
  - "scaffolded-task-modifier"
  - "academic-language-sentence-frame-generator"
  - "cognitive-load-analyser"
teacher_time: "3 minutes"
tags: ["EAL", "language-demands", "BICS-CALP", "scaffolding", "academic-language"]
---
# 语言需求分析器

## 此技能的作用

从四个维度识别课堂任务中的语言需求：词汇（第 1/2/3 层级）、语法（句子复杂度、时态、语态、情态）、语篇（文本结构、衔接、段落组织）和体裁（目的、受众、语域），并针对每个维度推荐具体的支架。该分析能够使任务中被**预设**但很少被明确教授的语言变得清晰可见，揭示阻碍 EAL 学生展示其学科知识的隐性语言障碍。AI 在此处尤其有价值，因为大多数教师是学科内容方面的专家，但并不熟悉其任务所要求的语言特征——他们知道一篇优秀的科学结论应该是什么样，却未必能够阐明其中所需的具体语法结构、语篇模式和词汇层级。

## 证据基础

Cummins（1981，2000）区分了基本人际交流技能（BICS）和认知学术语言能力（CALP）：EAL 学生通常能在 1–2 年内发展出前者，即会话流利度；而后者是课程学习所需的学术语言能力，通常需要 5–7 年才能发展起来。这一区分至关重要，因为在会话中看似流利的学生，可能仍然缺乏理解课程任务所需的学术语言。Gibbons（2002，2015）将这一区分落实到课堂实践中，说明必须明确识别语言需求并提供支架——仅仅“沉浸”在语言环境中不足以发展学术语言。Schleppegrell（2004）证明，学校语言并不只是比日常语言“更难”——它在结构上有所不同，会以日常会话所没有的方式使用名词化、被动语态、复杂名词短语和抽象词汇。Zwiers（2014）提供了一个用于识别和教授跨学科学术语言的实用框架，并强调语言需求会因学科而异。Bailey & Heritage（2008）表明，所有任务中都存在语言需求，而不仅仅是读写任务——数学题具有语言需求（阅读题目、理解数学词汇、解释推理过程），这些需求对教师而言可能是隐性的，却会为 EAL 学生带来现实的障碍。

## 输入模式

教师必须提供：
- **任务描述：** 具体任务。*例如：“为一项关于摩擦力的科学实验撰写结论”/“阅读一段教科书选文，并回答有关第一次世界大战起因的理解问题”/“参加一场关于是否应禁止动物园的课堂辩论”*
- **学生年级：** 年级组。*例如：“八年级”*
- **学科领域：** 学科名称。*例如：“科学”/“历史”/“英语”/“数学”*

可选（如可用，则由上下文引擎注入）：
- **语言熟练度：** EAL 熟练程度
- **学生情况：** 第一语言、接受英语授课教育的时长、具体需求
- **任务材料：** 所使用文本或资源的描述
- **先前的语言教学：** 已经教授过的语言特征

## 提示

```
You are an expert in language development and EAL pedagogy, with deep knowledge of Cummins' (1981, 2000) BICS/CALP framework, Gibbons' (2002, 2015) scaffolding approach, Schleppegrell's (2004) functional linguistics analysis of school language, and Zwiers' (2014) academic language framework. You understand that every curriculum task has language demands that are often invisible to subject teachers but create significant barriers for EAL students and students with limited academic language proficiency.

Your task is to analyse the language demands of:

**Task:** {{task_description}}
**Student level:** {{student_level}}
**Subject area:** {{subject_area}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Language proficiency:** {{language_proficiency}} — if not provided, analyse demands that would affect students across a range of EAL proficiency levels, from Early Acquisition to Consolidating.
**Student profiles:** {{student_profiles}} — if not provided, assume a class where several students are developing English language learners with conversational fluency but limited academic language proficiency.
**Task materials:** {{task_materials}} — if not provided, infer typical materials for this type of task.
**Prior language instruction:** {{prior_language_instruction}} — if not provided, assume no explicit language instruction has been given for this task.

Analyse language demands across these four dimensions:

1. **Vocabulary demands (Beck et al., 2002; Zwiers, 2014):**
   - **Tier 1 (everyday words):** Common words that may still be unfamiliar to EAL students — particularly idioms, phrasal verbs, and culturally specific terms.
   - **Tier 2 (academic vocabulary):** High-utility words used across subjects — "analyse," "significant," "evidence," "contrast," "evaluate." These are the highest priority for explicit teaching because they appear in every subject but are rarely taught in any.
   - **Tier 3 (technical vocabulary):** Subject-specific terms — "photosynthesis," "alliteration," "hypotenuse." Usually taught explicitly within the subject.
   - Identify specific vocabulary demands, not just categories.

2. **Grammar demands (Schleppegrell, 2004; Gibbons, 2015):**
   - Sentence complexity: simple, compound, or complex sentences required?
   - Tense requirements: which tenses must students use? (Science conclusions use past tense for method, present tense for conclusions; history uses past tense throughout.)
   - Voice: active or passive? (Science often requires passive voice: "the solution was heated" rather than "we heated the solution.")
   - Modality: hedging language, conditional statements? ("The results suggest..." "If the temperature increased, then...")
   - Nominalisation: turning processes into nouns? ("evaporate" → "evaporation"; "the water moved" → "the movement of water")
   - Identify SPECIFIC grammar demands, with examples from the task.

3. **Discourse demands (Schleppegrell, 2004; Zwiers, 2014):**
   - Text structure: what organisational pattern does the task require? (Chronological, cause-effect, compare-contrast, claim-evidence-reasoning)
   - Cohesion: what connectives and linking devices are needed? (Causal: "because," "therefore"; Comparative: "however," "in contrast"; Sequential: "firstly," "subsequently")
   - Paragraph structure: does the task require multi-paragraph organisation?
   - Reference: does the task require referring back to previous points or sources?

4. **Genre demands (Gibbons, 2002; Schleppegrell, 2004):**
   - What genre must students produce or comprehend? (Report, explanation, argument, narrative, recount, discussion)
   - What register is required? (Formal/informal, academic/conversational, impersonal/personal)
   - What is the purpose and audience? (To explain, to persuade, to describe, to evaluate)
   - Are there discipline-specific genre conventions? (Science reports differ from historical arguments)

For each dimension, provide:
- The specific language demands identified
- Why these demands may be invisible to the subject teacher
- Specific, practical scaffolds to address each demand

Return your output in this exact format:

## Language Demand Analysis: [Task Description]

**For:** [Student level] [Subject area]
**Task:** [Brief task description]

### Language Demand Profile

**Vocabulary Demands**
[Tier 1, 2, and 3 vocabulary identified, with specific words listed]

**Grammar Demands**
[Specific grammatical structures required, with examples]

**Discourse Demands**
[Text structure, cohesion, and organisational requirements]

**Genre Demands**
[Genre, register, purpose, and discipline-specific conventions]

### Scaffold Recommendations

**For vocabulary:** [Specific scaffolds]
**For grammar:** [Specific scaffolds]
**For discourse:** [Specific scaffolds]
**For genre:** [Specific scaffolds]

### Priority Actions (if time is limited)

[The 2–3 highest-impact scaffolds — the ones that will make the biggest difference for EAL students accessing this task]

### Teacher Language Notes

[How the teacher's own language use during the task — instructions, explanations, questioning — can support or hinder access]

**Self-check before returning output:** Verify that (a) all four language dimensions are analysed with specific examples, (b) scaffolds are practical and specific to the task, (c) the analysis identifies language demands that a subject teacher might not notice, (d) priority actions focus on the highest-impact scaffolds, and (e) the analysis distinguishes between language that should be pre-taught and language that can be supported during the task.
```

## 输出示例

**情境：** *任务：“为一项探究表面积对溶解速率影响的科学实验撰写结论” / 学生年级：“8 年级” / 学科领域：“科学（化学）” / 语言熟练度：“几名处于早期习得和发展阶段的学生”*

---

## 语言需求分析：撰写科学实验结论

**适用对象：** 8 年级科学（化学）
**任务：** 为一项探究表面积对溶解速率影响的实验撰写结论

### 语言需求概况

**词汇需求**

| 层级 | 词语 | 说明 |
|------|------|------|
| 第 1 层级（日常用语——但对 EAL 学生来说可能不熟悉） | “速率”（既有日常含义，也有科学含义）、“表面”（抽象的空间概念）、“溶解”（日常对话中并不常用）、“碾碎的” | “速率”尤其容易造成问题——EAL 学生可能知道它表示“工资费率”，但不知道“反应速率”的含义。日常含义向学术含义的转变很容易让学生困惑。 |
| 第 2 层级（学术用语——跨学科） | “探究”、“影响”、“得出结论”、“显著的”、“因此”、“证明”、“证据”、“支持”（如“支持假设”） | 撰写结论时需要用到这些词语，但科学课上很少专门教授它们。“支持”尤其令人困惑——EAL 学生知道它表示“帮助/支撑”，但不知道它还可以表示“为……提供证据”。 |
| 第 3 层级（技术术语——学科特定） | “表面积”、“溶解速率”、“溶质”、“溶剂”、“粒子”、“碰撞”、“假设”、“变量”、“控制变量” | 这些词语本应在实验过程中教授，但学生可能尚未巩固掌握。“表面积”是一个复合名词，必须同时理解两个词才能明白其含义。 |

**语法需求**

- **时态转换：** 结论需要使用过去时描述发生的事情（“碾碎的糖溶解得更快”），并使用现在时进行科学解释（“这是因为较小的颗粒具有更大的表面积”）。处于早期习得阶段的 EAL 学生通常会全篇使用同一种时态，或者完全避免使用时态标记。
- **被动语态：** 科学写作规范要求使用被动结构：“实验被重复进行”，而不是“我们重复了实验”；“结果被记录下来”，而不是“我记录了结果”。被动语态是 EAL 学习者最后习得的语法结构之一——它在会话英语中并不常见，且结构较为复杂。
- **因果连接词：** 结论需要使用因果语言：“因为”、“因此”、“结果是”、“这是由于”、“这意味着”。处于发展阶段的学生可能只掌握了“因为”这一表达。
- **模糊限制语/情态表达：** 科学结论需要使用较为谨慎的语言：“结果表明……”“这可能说明……”“很可能是……”。EAL 学生往往倾向于使用更加绝对的表述：“这证明了……”——但这种说法实际上不够科学准确。
- **名词化：** “糖溶解了”（过程）→“溶解速率”（名词化）。“粒子发生碰撞”→“碰撞速率”。名词化是学术写作的一大特征，尤其具有挑战性，因为它会把学生熟悉的动词转变为不熟悉的名词。

**话语要求**

- **文本结构：** 结论要求遵循特定模式：陈述发现 → 使用科学原理进行解释 → 联系假设 → 承认局限性。这种结构并不直观，而且很少被明确说明。
- **衔接：** 结论必须在逻辑上连接各个观点：“The results show that... This is because... Therefore... This supports the hypothesis that...” 每个句子都必须与前一句相衔接。英语为附加语言（EAL）的低水平学生经常写出彼此脱节的句子。
- **指代：** 结论必须回溯提及假设、方法和结果——这要求使用代词和指代链：“This pattern... These results... The data suggests...”

**体裁要求**

- **体裁：** 科学结论——一种具有自身惯例的特定学校科学体裁（与英语课或历史课中的“结论”不同）。
- **语域：** 正式、非人称化、学术化。在许多学校科学写作惯例中，不使用“I”或“we”。需要使用技术词汇。
- **目的：** 根据科学概念解释结果意味着什么，而不是叙述发生了什么。
- **学科特定惯例：** 结论必须展示科学推理，而不是个人观点。“I think the sugar dissolved faster”是不充分的——需要写成“The data demonstrates that increased surface area increases the rate of dissolving because...”。

### 支架建议

**词汇方面：**
- 明确教授第二层级词汇：“demonstrate”“significant”“support”（学术意义上的用法）和“evidence”。使用快速配对活动：学术词汇 → 面向学生的通俗定义 → 科学句子中的例子。
- 如果已知学生的第一语言，为第三层级术语提供双语词汇表——这样可以帮助学生将新的英语术语与他们可能已经理解的概念联系起来。
- 创建一个专门针对该实验的词汇墙：用图示展示关键术语。

**语法方面：**
- 提供时态指南：“当你描述已经发生的事情时 → 使用过去时（dissolved, increased）。当你解释原因时 → 使用现在时（particles have, surface area increases）。”
- 提供被动语态句型框架：“The experiment was carried out to...” “The results were recorded by...” “It was found that...”
- 明确教授 3 个因果连接词：“because”（学生已经知道），“therefore”（新词——意思是“所以、因此”），“this is due to”（“because of”的正式替代表达）。在写作时将这些词展示在黑板上。
- 在卡片上提供模糊限制语短语：“The results suggest...” “This may be because...” “It is likely that...”——解释科学家使用这些表达，是因为科学研究基于证据，而不是绝对确定性。

**话语方面：**
- 提供带有分段标题的结论结构模板：发现 → 解释 → 假设联系 → 局限性。让学生在每个标题下写作，而不是直接写出一个没有结构的段落。
- 提供用于衔接的句首语：“The results show that...” → “This can be explained by...” → “This supports/contradicts the hypothesis because...” → “However, a limitation was...”
- 明确示范句子之间的连接：“注意每个句子是如何与前一句相连接的。这个词——‘therefore’——告诉读者，后面的内容是前面内容所导致的结果。”

**对于体裁：**
- 并列展示两个例子：一个是对实验过程的叙述（“首先我们把糖碾碎，然后把它放进水里……”），另一个是科学结论（“结果表明，把糖碾碎提高了溶解速度，因为……”）。提问：“这两者有什么区别？为什么第二个更适合科学写作？”
- 明确教授体裁规则：“结论解释的是结果意味着什么，而不是你做了什么。”

### 优先行动（如果时间有限）

1. **提供带有句首提示的结论结构模板。** 这一项支架同时应对语篇要求（文本结构、衔接）和语法要求（时态、因果连接词）。它让 EAL 学生能够把认知精力集中在科学内容上，而不是苦于组织自己的写作。

2. **预先教授 3 个关键的 Tier 2 词汇：“demonstrate”“therefore”“suggest”。** 这三个词会在科学结论中反复出现，也可以迁移到其他学科。用五分钟进行明确教学，并配合示例，将会对今后的许多任务产生长期收益。

3. **把时态规则写在板书上。** 对于发生了什么，使用过去时；对于为什么，使用现在时。这一简单的视觉提示可以防止科学结论中最常见的语法错误，而且不会占用课堂时间——只需写在板上即可。

### 教师语言提示

- **放慢指令的速度，而不是放慢内容的节奏。** 布置任务时，用适中的语速，使用较短的句子，并重复关键术语。不要简化科学内容——降低语言要求并不等于降低思维要求。
- **避免在任务指令中使用习语。** “好了，我们来收尾吧”（令人困惑），而“现在写你的结论”（清晰）。“这很容易”（令人困惑），而“这一部分比较直接”（仍带有习语色彩，但更容易理解）。
- **说出关键词汇，并把它们写下来。** EAL 学生处理书面英语的可靠性高于口语英语（因为他们可以重新阅读，却无法重新听一遍）。在说出关键词时，把它们写在板上。
- **使用一致的术语。** 不要在“conclusion”“summary”“write-up”和“final paragraph”之间来回切换——选定一个术语并坚持使用。母语者自然使用的同义变换，会给 EAL 学习者增加不必要的处理负担。
- **检查学生是否理解任务，而不仅仅是理解科学内容。** EAL 学生可能完全理解科学原理，却不明白“write a conclusion”要求他们做什么。可以检查：“你的结论有哪四个部分？哪一部分先写？”

---

## 已知局限

1. **该分析只能从总体层面识别语言要求，无法预测每个学生的具体语言挑战。** 第一语言为西班牙语的学生，与第一语言为普通话的学生，在英语学习中会面临不同的挑战（例如冠词使用、时态标记、词序）。教师对每位学生的第一语言和熟练程度的了解，对于调整支架至关重要。

2. **语言需求与认知需求相互作用，为便于说明，分析将二者分开处理。** 在实践中，同时在科学概念和表达这些概念所需的语言方面遇到困难的学生，会面临叠加的挑战。支架可以帮助解决语言问题，但如果学生不理解科学内容，仅靠语言支架是不够的。在关注语言产出之前，应确保概念理解已经稳固。

3. **分析假设教师会暂时使用这些支架。** 随着学生能力的发展，应逐步移除支架。如果永久提供句型框架，学生可能会变得依赖这些框架，而不是发展独立的学术语言。目标是培养能力，而不是建立永久性的支持。