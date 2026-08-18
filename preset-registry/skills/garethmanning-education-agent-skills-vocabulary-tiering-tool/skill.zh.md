---
# AGENT SKILLS STANDARD FIELDS (v2)
name: vocabulary-tiering-tool
description: "Tier vocabulary from a text or topic into everyday, academic, and technical categories with teaching priorities. Use when pre-teaching vocabulary or identifying language barriers in a text."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "eal-language-development/vocabulary-tiering-tool"
skill_name: "Vocabulary Tiering Tool"
domain: "eal-language-development"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Beck, McKeown & Kucan (2002, 2013) — Bringing Words to Life: robust vocabulary instruction"
  - "Nation (2001) — Learning Vocabulary in Another Language"
  - "Coxhead (2000) — The Academic Word List: a new look at academic vocabulary"
  - "Stahl & Nagy (2006) — Teaching Word Meanings"
  - "Graves (2006) — The Vocabulary Book: learning and instruction"
input_schema:
  required:
    - field: "text_or_topic"
      type: "string"
      description: "The text extract or topic to analyse for vocabulary demands"
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
  optional:
    - field: "language_proficiency"
      type: "string"
      description: "EAL proficiency level of target students"
    - field: "student_profiles"
      type: "array"
      description: "From context engine: first languages, vocabulary gaps identified in prior assessment"
    - field: "lesson_focus"
      type: "string"
      description: "What the lesson is about — helps prioritise which vocabulary matters most"
    - field: "word_count_limit"
      type: "integer"
      description: "Maximum number of words to pre-teach — helps the teacher focus"
output_schema:
  type: "object"
  fields:
    - field: "tiered_vocabulary"
      type: "object"
      description: "Complete vocabulary analysis with words categorised into Tier 1, 2, and 3"
    - field: "teaching_sequence"
      type: "array"
      description: "Prioritised sequence of words to teach, with teaching method for each"
    - field: "word_teaching_cards"
      type: "array"
      description: "For each priority word: definition, example in context, visual cue, common confusions"
    - field: "quick_check"
      type: "string"
      description: "A brief activity to check vocabulary understanding"
chains_well_with:
  - "language-demand-analyser"
  - "scaffolded-task-modifier"
  - "text-complexity-analyser"
  - "academic-language-sentence-frame-generator"
teacher_time: "3 minutes"
tags: ["vocabulary", "tiering", "Tier-2", "academic-language", "EAL", "word-teaching"]
---
# 词汇分层工具

## 此技能的作用

获取一段文本摘录或一个主题，将所有重要词汇分为第 1 层词汇（生活常用词）、第 2 层词汇（学术词汇、跨学科词汇）和第 3 层词汇（技术词汇、学科专用词汇），然后生成一份重点排序的教学序列，重点关注第 2 层词汇——这些是在不同学科中都会出现、具有高度实用价值，但很少在任何一门学科中被明确教授的学术词汇。输出内容包括分层分析、包含每个词推荐教学方法的教学序列、词汇教学卡片（包括定义、语境示例、视觉提示和常见混淆），以及一项快速词汇检查活动。AI 在此特别有价值，因为词汇分层既需要频率数据（这个词在通用英语和学术英语中有多常见？），也需要教学判断（这个特定学生群体已经掌握哪些词汇？哪些词汇能够帮助他们理解课程内容？）。

## 依据的研究

Beck、McKeown 与 Kucan（2002、2013）确立了三级词汇框架，该框架已成为词汇教学的基础：第 1 层词汇是大多数母语者都知道的基础、高频词（house、happy、run）；第 2 层词汇是在各种学术语境中出现、对理解至关重要，但通常不会被明确教授的高实用价值词汇（analyse、significant、contrast、demonstrate、furthermore）；第 3 层词汇是低频、特定领域的术语（photosynthesis、onomatopoeia、denominator）。他们的关键发现是：第 2 层词汇是词汇教学中最具杠杆效应的目标，因为这些词汇出现频率足够高，在所有学科中都很重要，但很少能通过日常对话习得。Nation（2001）证实，学术词汇（大致相当于第 2 层词汇）是学业成功的关键门槛——缺乏学术词汇的学生会在所有学科中遇到困难，而不仅仅是在英语学科中。Coxhead（2000）编制了学术词表（AWL）——包含 570 个词族，约占学术文本的 10%——为识别第 2 层词汇提供了实证基础。Stahl 与 Nagy（2006）证明，有效的词汇教学需要在多种语境中进行多次接触——仅提供一次定义是不够的。Graves（2006）确立了全面词汇教学的四个组成部分：广泛阅读、教授单个词汇、教授词汇学习策略，以及培养词汇意识。

## 输入架构

教师必须提供：
- **文本或主题：** 学生将要阅读的文本摘录，或主题描述。*例如：“关于工业革命的八年级历史教科书摘录”/“七年级科学的光合作用主题”/[粘贴实际文本摘录]*
- **学生年级：** 年级组。*例如：“九年级”*
- **学科领域：** 学科名称。*例如：“历史”/“科学”/“英语”/“地理”*

可选（如有，由上下文引擎注入）：
- **语言熟练度：** EAL 熟练度等级
- **学生概况：** 第一语言、已知词汇缺口
- **课程重点：** 本节课的主题
- **词汇数量限制：** 需要预先教授的最大词汇数量（默认：5–8）

## 提示

```
You are an expert in vocabulary instruction and academic language development, with deep knowledge of Beck, McKeown & Kucan's (2002, 2013) three-tier vocabulary framework, Nation's (2001) work on vocabulary learning, Coxhead's (2000) Academic Word List, and Stahl & Nagy's (2006) principles of effective vocabulary teaching. You understand that Tier 2 vocabulary is the highest-leverage target for explicit instruction — these words appear across all academic subjects, are essential for comprehension, but are rarely taught directly.

Your task is to analyse and tier the vocabulary in:

**Text or topic:** {{text_or_topic}}
**Student level:** {{student_level}}
**Subject area:** {{subject_area}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Language proficiency:** {{language_proficiency}} — if not provided, tier vocabulary assuming a class that includes EAL students at Developing level alongside native speakers with varying vocabulary breadth.
**Student profiles:** {{student_profiles}} — if not provided, assume mixed language backgrounds with conversational fluency but limited academic vocabulary.
**Lesson focus:** {{lesson_focus}} — if not provided, use the text/topic to infer what vocabulary is most important for comprehension.
**Word count limit:** {{word_count_limit}} — if not provided, select 5–8 priority words for explicit teaching.

Apply these evidence-based principles:

1. **Three-tier classification (Beck, McKeown & Kucan, 2002):**
   - **Tier 1:** Basic, high-frequency words most students know. BUT — for EAL students, some Tier 1 words are NOT known, especially: idioms ("break a leg"), phrasal verbs ("look up," "turn down"), words with multiple meanings ("table" as noun/verb, "run" in dozens of senses), and culturally embedded terms. Flag these.
   - **Tier 2:** Academic, cross-subject words. These are the PRIORITY. They appear in Coxhead's Academic Word List or equivalent and are essential for academic success across subjects. Examples: analyse, significant, evidence, contrast, furthermore, demonstrate, evaluate, indicate, consequently, whereas.
   - **Tier 3:** Subject-specific technical vocabulary. Usually taught within the subject. Important but narrow — a student needs "photosynthesis" for Biology but not for History.
   - Classify each significant word and explain the classification.

2. **Prioritise Tier 2 for explicit teaching (Beck et al., 2002; Nation, 2001):**
   - Tier 3 words are usually taught by the subject teacher as part of the topic.
   - Tier 1 words are usually known (except for EAL-specific gaps noted above).
   - Tier 2 words fall in the gap — assumed by all subjects, taught by none. These are the highest-impact targets.
   - Within Tier 2, prioritise words that are: (a) essential for understanding this text/topic, (b) useful across multiple subjects, and (c) likely unknown to the target students.

3. **Effective word teaching requires depth, not just definitions (Stahl & Nagy, 2006; Graves, 2006):**
   - For each priority word, provide:
     a. A student-friendly definition (not a dictionary definition)
     b. The word used in context (from the text or topic)
     c. A visual cue or memorable association
     d. Common confusions or false friends (especially relevant for EAL students whose first language may have a cognate with a different meaning)
   - One exposure is not enough — recommend how to revisit the word across the lesson.

4. **Quick check activity (Stahl & Nagy, 2006):**
   - Provide a brief activity (2–3 minutes) to check whether students have grasped the key vocabulary before they encounter it in the task.

Return your output in this exact format:

## Vocabulary Analysis: [Text/Topic]

**For:** [Student level] [Subject area]
**Total significant words identified:** [Count]
**Priority words for explicit teaching:** [Count]

### Tiered Vocabulary

**Tier 1 — Everyday (with EAL notes)**
[Words with any notes about potential EAL challenges — multiple meanings, idioms, false friends]

**Tier 2 — Academic (PRIORITY)**
[Words listed with brief definition and why they matter for this text/topic]

**Tier 3 — Technical**
[Subject-specific words, noting which are likely already taught]

### Teaching Sequence

[Ordered list of priority words to teach, starting with the most essential for comprehension]

### Word Teaching Cards

For each priority word:
**[Word]**
- **Student-friendly definition:** [Plain language definition]
- **In context:** [The word used in a sentence from or related to the text/topic]
- **Visual/memory cue:** [An image, association, or mnemonic]
- **Watch out for:** [Common confusions, false friends, or multiple meanings]

### Quick Check Activity

[A 2–3 minute activity to check vocabulary understanding before students tackle the main task]

**Self-check before returning output:** Verify that (a) words are correctly tiered, (b) Tier 2 words are prioritised for teaching, (c) word teaching cards include definition, context, visual cue, and confusions, (d) the teaching sequence is ordered by importance for this specific text/topic, (e) EAL-specific challenges are flagged for Tier 1 words, and (f) the quick check tests understanding, not just recall of definitions.
```

## 示例输出

**情境：** *文本或主题：“九年级地理教材中关于低收入国家（LICs）城市化的节选——涵盖推力因素和拉力因素、农村向城市迁移、非正规住区，以及快速城市化带来的挑战” / 学生年级：“九年级” / 学科领域：“地理” / 语言熟练度：“有几名学生处于发展阶段”*

---

## 词汇分析：低收入国家的城市化

**适用年级：**九年级地理  
**识别出的重要词汇总数：**28  
**需要明确教授的优先词汇：**6

### 分层词汇

**第一层级——日常词汇（含 EAL 说明）**

| 单词 | EAL 说明 |
|------|----------|
| "push" / "pull" | 此处为隐喻用法，并非指实际的推或拉。EAL 学生可能只知道其字面意思。“推力因素”把人们推向远离原居地的地方；“拉力因素”把人们吸引到某个地方。 |
| "settle" / "settlement" | 含义多样：“settle down”（平静下来）、“settle”（决定）、“settlement”（人们居住的地方）。地理学中的含义较为具体。 |
| "challenge" | 此处用作名词（“城市化带来的挑战”），而不是动词（“I challenge you”）。学术语境中的名词用法可能不熟悉。 |
| "opportunity" | 学生可能在日常交流中认识这个词，但未必了解其“经济机会”这一学术含义。 |
| "lack" | 常见的学术词汇，但在日常口语中并不常用——处于发展阶段的 EAL 学生可能不认识这个词。 |

**第二层级——学术词汇（重点）**

| 单词 | 重要性 |
|------|---------------|
| **significant** | 贯穿全文使用：“显著增长”“重大挑战”。这是地理写作中的必备词汇，也会出现在各个学科中。 |
| **consequently** | 表示因果关系的关键连接词：“因此，城市迅速发展。”学生需要掌握它，以便在写作中解释因果关系。 |
| **factor** | 主题的核心词汇：“推力因素”“拉力因素”。该词也广泛用于地理、历史和科学学科中。它经常被误解为“fact”的意思。 |
| **migration** | 介于第二层级和第三层级之间——在地理学中属于技术词汇，但在一般学术语境和媒体中日益常见。“migrate”这一词根还可以联系到多个相关词汇。 |
| **infrastructure** | 讨论城市化带来的挑战时至关重要：“基础设施不足”。该词也用于地理、经济学和公民教育中。 |
| **inadequate** | 用来描述非正规住区中的服务：“不完善的卫生设施”。这是一个有力的评价性词汇，可用于多个学科。 |

**第三层级——技术词汇**

| 单词 | 说明 |
|------|-------|
| urbanisation | 核心主题词——应在单元开始时进行定义 |
| rural-to-urban migration | 复合术语——需要明确拆解讲解 |
| informal settlement | 地理学技术术语——学生可能知道“slum”，但“informal settlement”才是学术用语 |
| LIC / HIC | 缩略词（低收入国家 / 高收入国家）——需要明确教授 |
| megacity | 技术术语——人口超过一千万的城市 |
| push factor / pull factor | 日常词汇的技术性应用——需要进行明确界定 |

### 教学顺序

请按照以下顺序进行教学（先教授对理解内容最重要的词汇）：

1. **factor** — 没有这个词，整个主题框架（推力/拉力因素）就无法理解
2. **significant** — 贯穿全文，也是学生写作所必需的词汇
3. **infrastructure** — 理解城市化挑战的关键
4. **consequently** — 写作中进行因果解释所需的词汇
5. **inadequate** — 描述城市挑战时使用的关键评价性词汇
6. **migration** — 连接第二层级和第三层级词汇的核心概念词

### 词汇教学卡片

**factor**
- **面向学生的定义：** 影响某件事的原因或因素——促使某件事发生的因素之一。
- **语境中的用法：** “一个推力因素是农村地区缺乏就业机会，这促使人们迁往城市。”
- **视觉/记忆提示：** 把因素想象成食谱中的配料——每个因素都会促成最终结果。画一幅图：多支箭头（因素）都指向一个结果（城市化）。
- **注意：** 学生经常把 "factor" 和 "fact" 混淆。Fact 是真实的事情。Factor 是导致或影响某件事的因素。此外，"factory" 看起来很相似，但意思完全不同——不过在本主题中，城市里的工厂可能成为一种拉力因素！

**significant**
- **面向学生的定义：** 重要到值得注意或提及。大到足以产生影响。
- **语境中的用法：** “在过去 30 年里，拉各斯的人口有了显著增长。”
- **视觉/记忆提示：** 把它和交通标志联系起来——sign-ificant change 指大到需要设置警示标志的变化。它不是微小或无关紧要的变化。
- **注意：** 在日常英语中，"significant" 有时表示“有意义的”（例如 significant look）。在学术英语中，它几乎总是表示“大且重要”。西班牙语同源词："significativo"——含义相近，是一个有帮助的联系。

**infrastructure**
- **面向学生的定义：** 城市正常运转所需的基础系统和设施——道路、水管、电力、下水道、医院和学校。
- **语境中的用法：** “快速城市化往往超过基础设施建设的速度，使新居民无法获得清洁用水或可靠的电力供应。”
- **视觉/记忆提示：** "Infra" 的意思是“下方/下面”。Infrastructure 就是正常运转的城市“下面”的部分——也就是基础。展示一张城市剖面图，显示建筑物下面的管道、电缆和道路。
- **注意：** 这是一个很长、看起来令人畏惧的词，但它的结构很清晰：infra（下方）+ structure（结构）。把它拆开来记忆。学生可能在新闻语境中接触过这个词（政治讨论中的“基础设施支出”）。

**consequently**
- **面向学生的定义：** 因此。由于这个原因，接下来发生了某件事。
- **语境中的用法：** “农村地区缺乏就业机会。因此，成千上万的人迁移到了城市中心。”
- **视觉/记忆提示：** Consequence → consequently。如果你知道 consequence（接下来发生的事情），那么 consequently 就只是它的副词形式：“as a consequence of this...”
- **注意：** 学生通常知道 "because"，但不知道 "consequently"。区别在于："because" 向后看（this happened because...），"consequently" 向前看（this happened, consequently...）。两者都表达因果关系，但方向相反。

**inadequate**
- **面向学生的定义：** 不够好。不足以满足所需条件。
- **语境中的用法：** “非正规住区中不adequate的卫生条件导致了水传播疾病的扩散。”
- **视觉/记忆提示：** in-（不）+ adequate（足够）。如果某件事是 adequate，就表示“足够好”。如果是 INadequate，就表示“不够好”。就像“incomplete” = 不完整。
- **注意：** 表示“不”的前缀 “in-” 是一种很有效的词汇学习策略。可以联系其他带有 “in-” 的词：insufficient、inappropriate、inaccessible。掌握这一规律，就能理解许多学术词汇。

**migration**
- **面向学生的定义：** 人们从一个地方迁移到另一个地方生活或工作——通常是大规模或永久性的迁移，而不是去度假。
- **语境中的用法：** “农村到城市的migration改变了LICs中的城市，数百万人从乡村迁移到城市地区。”
- **视觉/记忆提示：** 想想鸟类迁徙——鸟类会在特定时间从一个地方移动到另一个地方。人类migration与此类似：人们可能因为某些条件迫使他们离开，或因为另一个地方更好而被吸引过去。
- **注意：** “Migration”（迁移这一行为）、“migrant”（迁移者）、“migrate”（动词“迁移”）、“immigration”（进入一个国家）、“emigration”（离开一个国家）彼此相关，但含义各不相同。在本主题中，我们关注的是内部迁移（在一个国家内部进行的迁移）。

### 快速检查活动

**“用起来，否则就忘记”——3分钟**

在黑板上展示六个句子，每个句子中都有一个空缺。学生从旁边展示的词汇表中选择正确的词汇。

1. “农村地区缺少工作机会，这是推动migration的一个推动___。” [factor]
2. “自1970年以来，拉各斯的人口经历了___增长。” [significant]
3. “城市的___无法跟上快速增长——道路、管道或电线还不够。” [infrastructure]
4. “年轻人离开了他们的村庄。___，农村人口减少了。” [consequently]
5. “非正规住区的住房通常是___的——过度拥挤，并且缺少基本设施。” [inadequate]
6. “农村到城市的___是LICs中最大的​​人口变化之一。” [migration]

**检查：** 学生举起写有答案的小白板。如果80%以上的答案正确，就继续进行。如果某个词经常被答错，就用另一个例子重新教授这个具体词汇，然后再继续。

---

## 已知局限

1. **词汇分级并不是绝对的——语境很重要。** 对九年级学生来说属于Tier 2的词，对十二年级学生来说可能属于Tier 1。同一个词在一所学校可能属于Tier 2，在另一所学校则可能属于Tier 3，这取决于学生此前接受的词汇教学。这里提供的分级是基于词频数据和学生通常掌握程度的指导性建议——教师应根据自己对具体学生的了解进行调整。

2. **预先教授词汇是必要的，但并不充分。** 学生需要在不同语境中多次接触一个词（Stahl & Nagy建议10–12次），才能真正掌握它。一次预教活动只能让学生初步接触这个词；之后还必须在整节课、整个星期以及整个单元中不断复习。教学卡片提供最初的接触机会；教师必须规划好重复学习。

3. **该工具在单词层面分析词汇，但学术语言同样涉及短语和句式结构。**“On the other hand,”“as a result of”“in contrast to”都是作为单个词汇项目发挥作用的多词表达。该工具能够识别单个单词，但可能无法捕捉学生所需的所有重要多词短语。