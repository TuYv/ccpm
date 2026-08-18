---
# AGENT SKILLS STANDARD FIELDS (v2)
name: outdoor-learning-sequence-designer
description: "Design a structured outdoor learning sequence embedding curriculum objectives in an available outdoor space. Use when planning lessons in school grounds, parks, or local natural environments."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/outdoor-learning-sequence-designer"
skill_name: "Outdoor Learning Sequence Designer"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Education Endowment Foundation (2019) — Outdoor Adventure Learning systematic review"
  - "Rickinson, Dillon, Teamey, Morris, Choi, Sanders & Benefield (2004) — A Review of Research on Outdoor Learning"
  - "Waite (2011) — Children learning outside the classroom: from birth to eleven"
  - "Beames, Higgins & Nicol (2012) — Learning Outside the Classroom: theory and guidelines for practice"
  - "Mannion, Mattu & Wilson (2015) — Teaching, learning and play in the outdoors"
input_schema:
  required:
    - field: "learning_objective"
      type: "string"
      description: "The specific curriculum content or skill students will learn — what the outdoor activity is FOR, educationally"
    - field: "outdoor_space"
      type: "string"
      description: "The available outdoor space — school grounds, local park, woodland, field, playground, garden"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "class_size"
      type: "string"
      description: "Number of students and available adult support"
    - field: "time_available"
      type: "string"
      description: "How long the outdoor session lasts"
    - field: "weather_constraints"
      type: "string"
      description: "Season, typical weather, any constraints"
    - field: "risk_factors"
      type: "string"
      description: "Known risks — traffic, water, terrain, student needs"
output_schema:
  type: "object"
  fields:
    - field: "outdoor_sequence"
      type: "object"
      description: "The complete outdoor learning sequence — indoor preparation, outdoor activity, indoor follow-up"
    - field: "learning_design"
      type: "object"
      description: "How the outdoor element serves the learning objective — what can be learned outside that cannot be learned inside"
    - field: "safety_framework"
      type: "object"
      description: "Risk-benefit assessment, safety procedures, adult roles"
    - field: "indoor_outdoor_continuity"
      type: "object"
      description: "How the indoor and outdoor elements connect — the outdoor learning is not a separate activity but part of a coherent sequence"
chains_well_with:
  - "ecological-inquiry-anchor-designer"
  - "place-based-inquiry-anchor"
  - "biophilic-learning-environment-designer"
  - "awe-wonder-experience-designer"
teacher_time: "4 minutes"
tags: ["outdoor-learning", "EEF", "Rickinson", "outside-classroom", "fieldwork", "nature", "experiential"]
---
# 户外学习序列设计师

## 此技能的作用

设计一个结构化的户外学习序列，其中户外环节服务于特定的课程学习目标，而不是作为奖励、场景转换或一般性的健康福祉活动，而是一种充分利用户外环境独特优势的学习体验。Rickinson et al.（2004）综述中的关键原则是：当户外学习具有明确的学习意图、与室内学习相衔接（事前准备、事后跟进），并让学生以户外环境作为主要资源开展主动探究时，其效果最佳。输出内容包括完整序列（室内准备、户外活动、室内跟进）、一份说明为何户外环节比室内替代方案更能服务于该目标的学习设计、安全框架，以及室内外衔接规划。AI 在这里尤其有价值，因为设计有效的户外学习需要同时考虑课程对齐（学生在学习什么？）、环境机会（这个特定空间能提供什么？）、实际后勤安排（安全、天气、时间）以及教学设计（如何组织活动以实现最大化学习效果），这是一项多维度的规划挑战。

## 证据基础

教育基金会（Education Endowment Foundation，2019）对户外探险学习开展了一项系统性综述，发现其对学业成果具有中等但一致的积极影响（尤其对处境不利的学生），并且对包括自信、自我效能感、学习动机和团队合作在内的非认知成果具有更强的影响。至关重要的是，EEF 发现，具有明确学习目标的结构化户外学习比非结构化的户外时间产生更好的效果。Rickinson et al.（2004）完成了对户外学习研究最全面的综述，识别出三类关键情境：实地考察和户外参访（与学校学科相关联）、户外探险教育（住宿式、团队建设）以及校园场地和社区项目。他们发现，设计良好的实地考察能够改善对学科内容的长期记忆，培养实践探究技能，并提高参与度；但设计不佳的户外活动（目的不明确、与课程联系薄弱）除了带来愉悦感之外，几乎无法产生学习收益。Waite（2011）聚焦于年龄较小的儿童，指出户外环境天然支持活跃的、感官参与的、探索性的学习，而这类学习在室内教室中会受到限制。Beames、Higgins & Nicol（2012）为户外学习提出了“地方教学法”，主张物理环境应当成为规划的起点，而不是将课程内容映射到户外地点，而应从该地点本身提供的学习机会出发。Mannion、Mattu & Wilson（2015）记录了苏格兰学校中有效的户外学习实践，强调最佳的户外学习序列包含三个阶段：期待（准备）、遭遇（户外体验）和回顾（反思与跟进）。

## 输入架构

教师必须提供：
- **学习目标：** 学生将学到什么。*例如：“测量角度和距离——七年级数学”/“理解栖息地与适应——四年级科学”/“运用感官细节进行描述性写作——六年级英语”/“地图技能与指南针使用——八年级地理”*
- **户外空间：** 可用的场地。*例如：“学校运动场——平坦的草地区域，周边有一些树木，保护区内有一个池塘”/“当地林地——距学校步行15分钟，有小径、溪流和多样地形”/“学校操场——沥青地面、长椅、一些种植箱，可眺望当地景观”*

可选项（如可用，由上下文引擎注入）：
- **学生水平：** 年级
- **学科领域：** 课程学科
- **班级规模：** 学生人数和成人支持情况
- **可用时间：** 户外课程的时长
- **天气限制：** 季节和天气状况
- **风险因素：** 已知危险

## 提示词

```
You are an expert in outdoor learning design, with deep knowledge of the Education Endowment Foundation's (2019) systematic review of outdoor adventure learning, Rickinson et al.'s (2004) comprehensive review of outdoor learning research, Waite's (2011) research on children learning outside the classroom, Beames, Higgins & Nicol's (2012) pedagogy of place, and Mannion, Mattu & Wilson's (2015) three-phase outdoor learning model. You understand that outdoor learning is most effective when it is STRUCTURED (clear learning objectives, not just "go outside"), CONNECTED (linked to indoor learning before and after), and EXPLOITS THE UNIQUE FEATURES OF THE OUTDOOR ENVIRONMENT (teaches something that cannot be taught as well indoors).

CRITICAL PRINCIPLES:
- **The outdoor element must serve the learning objective.** If the lesson could be taught just as effectively indoors, there is no educational reason to go outside. The outdoor environment must offer something the classroom cannot: real specimens, authentic contexts, spatial scale, sensory experience, or direct observation of phenomena.
- **Three-phase design: preparation → encounter → reflection.** Following Mannion et al. (2015), the outdoor session is the middle of a sequence, not a standalone activity. Indoor preparation builds the knowledge and skills students need to learn effectively outdoors. The outdoor encounter is the core learning experience. Indoor follow-up consolidates, analyses, and extends what was learned outside.
- **Active inquiry, not passive observation.** Students should DO something outdoors, not just look at things. Collect data. Measure. Sketch. Sample. Record. Compare. The outdoor environment is a laboratory, not a museum.
- **Safety through risk-benefit analysis, not risk elimination.** Outdoor learning involves risks (weather, terrain, traffic, water). The approach is not to eliminate all risk (which would also eliminate the learning) but to assess the BENEFITS against the risks and manage the risks to an acceptable level. A child who never encounters managed risk never develops risk assessment skills.
- **Weather is a feature, not a bug.** Rain, wind, cold, and heat are learning conditions, not cancellation conditions. "There's no such thing as bad weather, only bad clothing" (Norwegian proverb). Design the session to work in the weather that's likely, not just in ideal conditions.

Your task is to design an outdoor learning sequence for:

**Learning objective:** {{learning_objective}}
**Outdoor space:** {{outdoor_space}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general school-age context.
**Subject area:** {{subject_area}} — if not provided, infer from the learning objective.
**Class size:** {{class_size}} — if not provided, design for 30 students with one teacher and one teaching assistant.
**Time available:** {{time_available}} — if not provided, design for a 60-minute session (including transition time).
**Weather constraints:** {{weather_constraints}} — if not provided, design for a temperate climate with a rain contingency.
**Risk factors:** {{risk_factors}} — if not provided, include standard outdoor risk assessment guidance.

Return your output in this exact format:

## Outdoor Learning Sequence: [Learning Objective]

**Learning objective:** [What students will learn]
**Outdoor space:** [Where]
**Why outdoors?** [Specifically what the outdoor environment offers that the classroom cannot]

### Phase 1 — Preparation (Indoor)

[What students need to know, practise, or prepare before going outside — builds the knowledge needed for the outdoor activity to be effective]

### Phase 2 — Encounter (Outdoor)

**Setup:** [How to organise students, distribute equipment, establish boundaries]
**Activity:** [Step-by-step outdoor learning activity — what students do, in what order]
**Teacher role:** [What the teacher does during the outdoor activity — circulating, questioning, managing]
**Key questions to ask outdoors:** [Specific questions that direct students’ attention to the learning objective]

### Phase 3 — Reflection (Indoor)

[How to consolidate the outdoor learning — what students do with the data/observations/experiences they collected outside]

### Safety Framework

**Risk-benefit assessment:**
| Risk | Likelihood | Severity | Benefit | Management |
|---|---|---|---|---|
| [Risk 1] | [L/M/H] | [L/M/H] | [What learning benefit justifies this risk] | [How to manage it] |

**Weather contingency:** [What to do if weather changes — adapt, not cancel]
**Adult roles:** [Who does what — teacher, TA, parent helpers]

### Indoor-Outdoor Continuity

[How the three phases connect — the outdoor session is not a separate event but the middle of a coherent learning sequence]

### Equipment and Resources

[What's needed — kept practical and minimal]

**Self-check before returning output:** Verify that (a) the outdoor element serves the learning objective specifically, (b) the three-phase design is complete, (c) students are actively inquiring outdoors, not passively observing, (d) the safety framework uses risk-benefit analysis, and (e) the indoor and outdoor phases are connected.
```

## 输出示例

**情境：** *学习目标：“运用感官细节的描写性写作——六年级英语。学生需要写出运用全部五种感官、具体词汇和修辞手法（明喻、隐喻、拟人）的描述。当前作品较薄弱——描述泛泛而谈，仅依赖视觉。” / 户外空间：“校园场地——一处保护区，包含一个小池塘、树木（包括一棵大橡树）、一片草地，以及由三年级学生去年种植的感官花园。还包括主操场（柏油地面）和校舍本身。” / 可用时间：“户外课程为 60 分钟；前后的准备和后续活动可在正常英语课中进行。” / 天气限制：“三月——可能晴朗、寒冷、下雨，或几种情况任意组合。天气难以预测。”*

---

## 户外学习序列：感官描述写作——六年级

**学习目标：** 撰写运用全部五种感官、具体词汇和修辞手法的描述  
**户外空间：** 学校保护区——池塘、树木、草地、感官花园  
**为什么在户外？** 教室是一个感官荒漠——相同的声音（椅子刮擦声、时钟滴答声）、相同的气味（白板笔、食堂飘来的午餐味）、相同的触感（课桌、铅笔、纸张）。如果学生没有可感知的事物，就无法写出丰富的感官描述。户外环境提供真实而复杂的感官输入：潮湿泥土的气味、风吹过树枝的声音、树皮的质地、水面光影的景象、野蒜的味道（如有且安全）。亲身**体验**感官丰富性的学生，比被告知要“想象感官细节”的学生写得更具体。

### 阶段 1——准备（室内，30 分钟，前一节课）

**微型课程：感官词汇盘点。**  
给学生一张有五列的表格：看、听、触摸、闻、品尝。挑战：“运用**全部**五种感官描述这间教室。每种感官至少写出三个具体细节。”学生会发现：视觉很容易，听觉是可行的，触觉有限，嗅觉有限，味觉几乎不可能。这揭示了问题：普通的环境会产生普通的描述。

**范文分析。** 阅读一小段有力的描写性写作节选（例如 Robert Macfarlane 的自然散文或 Ted Hughes 的诗歌）。学生识别：使用了哪些感官？哪些细节是**具体的**（不只是“绿色”，而是“新生荨麻那种鲜亮的绿色”）？哪些地方运用了修辞手法？

**户外课程准备：** 发放“感官田野笔记本”——折叠的 A4 纸，每种感官各有一个分区。说明任务：“明天你们将成为田野中的作家。你们的任务是像科学家收集标本一样**收集**感官细节。你们将把它们带回教室，并用它们进行写作。”

### 阶段 2——体验（户外，60 分钟）

**准备（5 分钟）：**  
步行前往保护区。在入口处停下。“在你们写**任何内容**之前，静静站立 60 秒。闭上眼睛。倾听。你们能听到什么？”这种从室内到户外的转换是有意安排的——它让学生放慢节奏，并将他们的注意力从社交闲聊转向对环境的觉察。

**活动 1——感官站点（30 分钟）：**
学生轮流体验五个站点，每个站点停留 5–6 分钟。在每个站点，他们都要记录在自己的感官观察笔记本中。

| 站点 | 地点 | 感官重点 | 任务 |
|---|---|---|---|
| 1：聆听站 | 橡树下 | 听觉 | 闭上眼睛 2 分钟。写下你听到的每一个声音——近处的和远处的，大声的和轻声的。要具体：不要只写“鸟叫”，而要写“两个尖锐、上扬的音符，然后停顿，接着又是三个”。 |
| 2：触感小径 | 沿着树篱/林线 | 触觉 | 触摸 5 种不同的自然表面（树皮、叶子、泥土、石头、苔藓）。每一种都要准确写出它摸起来是什么感觉。使用明喻：“树皮摸起来像……” |
| 3：气味地图 | 感官花园 | 嗅觉 | 用手指轻轻揉碎一片叶子。闻一闻泥土。闻一闻空气。写下：这个地方闻起来是什么味道？你能不借助另一种气味来描述一种气味吗？（这很难——但这正是重点。） |
| 4：视觉快照 | 池塘旁 | 视觉（但要具体） | 选择一个小区域（不超过你的手掌大小）。准确描述你所看到的一切——颜色、形状、运动、光线。规则：不能使用笼统的词。不要只写“绿色”，而要写清楚是哪一种绿色？不要只写“水”，而要写清楚此刻的水看起来是什么样？ |
| 5：整个地方 | 草地区域 | 综合所有感官 | 站在草地上。写一段“全景式描写”——从左向右扫视，并描述你通过**所有**感官体验到的一切。这是各种感官的结合：视觉 + 听觉 + 嗅觉 + 触觉 +（如果适用）味觉。 |

**活动 2——寻找比喻性语言（15 分钟）：**
完成各个站点后，召集全班：“现在，找出这个环境中的一样事物，它让你想起了某种完全不同的东西。像镜子一样的池塘。像手指一样伸展的树枝。低声细语的风。找到你自己的联想，并把它和**理由**一起写下来——它为什么让你想起那个东西？”

**教师职责：** 在各站点之间巡视。提出下面的**关键问题**。查看学生的笔记。找出那些描写仍然很笼统的学生（“树是棕色的”），并引导他们重新观察：“再靠近一些。是哪一种棕色？摸一摸它。闭上眼睛。现在描述一下。”同时，找出描写出色的学生，并记录下来，以便在第 3 阶段分享。

**在户外可以提出的关键问题：**
- “闭上眼睛。现在你听到了什么，是刚才没有注意到的？”
- “你写了‘树皮很粗糙’。是像砂纸一样粗糙？像擦丝器一样粗糙？像你爸爸的下巴一样粗糙？是哪一种粗糙？”
- “这种气味让你想起了什么？你能用文字把这种感觉捕捉下来吗？”
- “如果你必须向一个从未来过这里的人描述这个地方，你会选择哪一个细节？”

**总结（10 分钟）：** 回到教室。“不要把你们的笔记本弄丢。你们在户外收集的一切，都是明天写作时要使用的原材料。”

### 第 3 阶段——反思（室内，45 分钟，下一课时）

**步骤 1——挖掘实地笔记（10 分钟）：** 学生回顾自己的感官观察笔记本。标记出三条**最好的**细节——最具体、最生动、最出人意料的细节。与同伴分享：“我的哪一条细节最有力量？”

**步骤 2 — 起草（25 分钟）：** 学生以实地笔记为主要素材，写一段关于保护区的描述性文字。要求：至少运用三种感官，至少使用两种修辞手法，不使用泛泛的词汇（教师提供一份“禁用词”清单：好、不错、大、小、漂亮、绿色——使用**更具体**的替代表达）。

**步骤 3 — 同伴互评（10 分钟）：** 交换描述。搭档阅读并回答：“哪一个细节让你感觉自己就在那里？描述的哪些地方可以更具体？”

### 安全框架

**风险收益评估：**

| 风险 | 可能性 | 严重程度 | 收益 | 管理措施 |
|---|---|---|---|---|
| 在湿滑地面上滑倒 | 中等（3 月） | 低 | 接触真实的感官环境；雨天**增加**感官细节 | 提醒学生穿着合适的鞋类。步行，不要奔跑。标出潮湿区域。 |
| 池塘——落水 | 低 | 中等 | 池塘观察站提供丰富的视觉和听觉细节（水面、倒影、声音） | 在距离池塘边缘 1 米处设置清晰的边界标记。安排成人在池塘处值守。学生仅可从岸边观察。 |
| 过敏反应（植物、花粉） | 低 | 中等 | 与植物进行直接的感官互动 | 课前检查医疗记录。患有花粉热或植物过敏的学生调整嗅觉观察站活动（观察，不要揉碎叶片）。如有处方，携带抗组胺药。 |
| 寒冷 / 下雨 | 高（3 月） | 低 | 天气**本身就是**感官素材——雨声、潮湿气味和冰冷触感都是写作素材 | 要求穿外套。天气非常寒冷时，将活动缩短至 45 分钟。雨天方案：仍然外出——雨天比晴天更能产出优秀的感官写作。仅在暴风雨或雷电时取消。 |

**天气应急方案：** 小雨——照常进行，携带带防护罩的写字板。大雨——缩短至 30 分钟，聚焦遮蔽性最好的观察站。雷电——延期。

**成人职责：** 教师巡视并提问。助教负责管理各观察站之间的转换，并监控池塘区域。如有家长志愿者：每个观察站安排一名，以引导不愿写作的学生。

### 室内外衔接

三个阶段构成**一个**学习序列：
- **准备**构建学生在户外收集有用资料所需的分析性词汇（感官类别、修辞手法类型）
- **体验**提供无法在室内产生的原始感官素材——真实的气味、真实的质感、真实的声音
- **反思**将原始感官资料转化为精心打磨的写作——户外笔记是**证据**，室内课程是**写作**

户外活动不是附带写作的“趣味出游”。写作依赖于户外体验。没有实地笔记，学生就没有可供写作的素材。

### 设备与资源

- 感官实地笔记本（预先准备：折叠的 A4 纸，标有五个部分）
- 写字板和铅笔（不要用钢笔——钢笔在雨中无法书写）
- 放大镜（可选，但对视觉观察站很有价值）
- 用于观察站轮换的计时器
- 急救包
- 备用外套（供忘记携带的学生使用）

---

## 已知局限

1. **户外学习需要校园场地或可进入的户外空间。** 位于高密度城区、只有小型操场或没有绿地的学校需要进行调整——感官站可以在任何户外环境中开展，但体验的丰富程度取决于环境本身的丰富程度。拥有沥青地面和围栏的学校操场，所能提供的感官多样性不如自然保护区。

2. **天气确实会限制部分活动。** 尽管该 skill 认为雨水是一个特性，而不是缺陷（对于描述性写作来说，这确实如此），但有些户外学习目标取决于天气条件。需要干燥环境的科学实地考察、要求手部保持稳定的艺术活动，或在积水草地上进行的体育活动，都会受到真实的天气限制。该 skill 对雨天持积极态度的表述仅适用于本示例，并非普遍适用。

3. **EEF 的评审发现，户外学习对学业成果的影响是中等的，而不是显著的。** 户外学习能够持续提升参与度、学习动机和身心健康，但关于其直接提高学业成绩的证据仅属中等。支持户外学习的最有力理由在于，它能够提供无法在室内复制的学习体验（真实的感官输入、真实的标本、真实的空间尺度），而不是它能够普遍带来更高的考试分数。教师应在户外环境能够提供课堂无法提供的内容时采用户外学习，而不应将其作为普遍提高学业成绩的策略。