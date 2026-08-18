---
# AGENT SKILLS STANDARD FIELDS (v2)
name: interdisciplinary-real-world-connection-mapper
description: "Map curriculum connections across multiple subjects for a real-world problem or authentic context. Use when planning cross-curricular projects or connecting content to real issues."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/interdisciplinary-real-world-connection-mapper"
skill_name: "Interdisciplinary Real-World Connection Mapper"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "moderate"
evidence_sources:
  - "Barron & Darling-Hammond (2008) — Teaching for Meaningful Learning: a review of research on inquiry-based and cooperative learning"
  - "Drake & Burns (2004) — Meeting Standards Through Integrated Curriculum"
  - "Beane (1997) — Curriculum Integration: designing the core of democratic education"
  - "Rennie, Venville & Wallace (2012) — Integrating Science, Technology, Engineering, and Mathematics"
  - "Czerniak, Weber, Sandmann & Ahern (1999) — Literature review of science and mathematics integration"
input_schema:
  required:
    - field: "real_world_problem"
      type: "string"
      description: "The real-world problem, issue, or situation that requires multiple disciplines to address"
    - field: "primary_subject"
      type: "string"
      description: "The teacher's own subject — the discipline from which this connection is being initiated"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group"
    - field: "available_subjects"
      type: "string"
      description: "Which other subject departments are willing or available to collaborate"
    - field: "curriculum_constraints"
      type: "string"
      description: "What curriculum content must be covered in each subject"
    - field: "time_frame"
      type: "string"
      description: "Duration of the integrated unit"
    - field: "school_timetable"
      type: "string"
      description: "Whether the timetable allows for cross-curricular collaboration or subjects are fully siloed"
output_schema:
  type: "object"
  fields:
    - field: "connection_map"
      type: "object"
      description: "A visual and descriptive map of how the real-world problem connects to multiple disciplines"
    - field: "disciplinary_contributions"
      type: "array"
      description: "What each subject contributes — specific knowledge and skills, with curriculum alignment"
    - field: "integration_points"
      type: "array"
      description: "Where and how subjects genuinely connect — not parallel teaching but actual integration"
    - field: "implementation_plan"
      type: "object"
      description: "How to implement — from single-teacher connections to full cross-curricular collaboration"
    - field: "assessment_approach"
      type: "object"
      description: "How to assess integrated understanding — not subject-by-subject but the ability to draw on multiple disciplines"
chains_well_with:
  - "phenomenon-based-unit-anchor"
  - "project-brief-designer"
  - "service-learning-project-designer"
  - "ecological-inquiry-anchor-designer"
teacher_time: "4 minutes"
tags: ["interdisciplinary", "cross-curricular", "Barron", "Drake", "integrated-curriculum", "real-world", "PBL"]
---
# 跨学科真实世界联系映射器

## 此技能的作用

梳理现实世界问题或情境与解决这些问题所需学科知识之间的联系，生成一份实用的课程整合计划，展示每个学科的贡献、学科之间真正的连接点，以及如何在现实的学校课表约束下实施整合。这种方法借鉴了 Barron & Darling-Hammond (2008) 关于探究式学习和有意义学习的研究，以及 Drake & Burns (2004) 提出的整合课程设计框架。其关键洞见在于，现实世界的问题本质上是跨学科的——气候变化并不只是“科学”问题，无家可归并不只是“PSHE”问题，建筑项目也不只是“数学”问题——能够学习运用多个学科来应对复杂问题的学生，比那些孤立学习各门学科的学生具有更深入的理解。然而，整合必须是真实的（每个学科都作出必要的贡献），而不是强行拼接的（人为制造的联系会削弱两个学科）。输出内容包括联系图、与课程目标对齐的学科贡献、具体的整合点、实用的实施计划，以及评估方法。人工智能在此特别有价值，因为将一个现实世界问题同时映射到多个课程标准，需要交叉参考横跨多个学科领域的知识——这项任务如果由单个教师通过跨部门协商完成，往往需要数小时。

## 证据基础

Barron & Darling-Hammond (2008) 回顾了关于探究式学习和合作学习的研究，发现当学生将多个学科的知识应用于真实问题时，学习会得到深化。他们提出了有效开展跨学科工作的设计原则：问题必须真正复杂（需要多个视角），每个学科的贡献必须具有实质性（而不是象征性的），并且整合过程必须对学生可见（他们应当理解为什么需要多个学科）。Drake & Burns (2004) 提出了课程整合的三个层次：多学科整合（各学科围绕同一主题展开，但彼此保持独立）、跨学科整合（各学科共同强调相同的技能或概念），以及超学科整合（由现实世界情境组织学习，学科服务于该情境）。他们认为，超学科层次的整合最为有效，但跨学科层次最具实践可行性——并且任何一种整合层次都优于完全孤立的学科学习。Beane (1997) 主张将课程整合作为一项民主原则：现实世界的问题不会按照学科划分的形式出现，公民需要调动多个知识领域，才能有效参与民主生活。Rennie, Venville & Wallace (2012) 专门研究了 STEM 整合，发现整合能够提高学生的参与度以及对学习相关性的感知，但需要谨慎设计，以避免“稀释”各个独立学科。Czerniak et al. (1999) 回顾了科学与数学整合的研究，发现这种整合对学生态度有积极影响，对学业成就有中等程度的影响，但同时警告说，设计不当的整合可能会削弱学生对两个学科的理解。

## 输入架构

教师必须提供：
- **现实世界问题：** 真实情境。*例如：“我们学校希望将能源消耗降低 20%——应该怎么做？” / “当地一名开发商想在学校后面的绿地上建房——市议会是否应该批准？” / “当地河流的水质正在下降——原因是什么，可以采取哪些措施？” / “我们的社区存在食物浪费问题——浪费来自哪里，如何减少？”*
- **主要学科：** 教师所教授的学科。*例如：“我是一名科学教师” / “我是一名地理教师” / “我是一名数学教师” / “我是一名设计与技术教师”*

可选项（如果可用，将由上下文引擎注入）：
- **学生阶段：** 年级组
- **可用学科：** 哪些学科部门可以合作
- **课程限制：** 各学科必须涵盖的内容
- **时间范围：** 持续时间
- **学校课表：** 协作可能性

## 提示词

```
You are an expert in interdisciplinary curriculum design, with deep knowledge of Barron & Darling-Hammond's (2008) research on meaningful learning, Drake & Burns' (2004) framework for integrated curriculum (multidisciplinary, interdisciplinary, transdisciplinary), Beane's (1997) democratic argument for curriculum integration, Rennie, Venville & Wallace's (2012) STEM integration research, and Czerniak et al.'s (1999) science-mathematics integration review. You understand that interdisciplinary teaching is NOT "themed weeks" where subjects coincidentally address the same topic — it is the deliberate design of learning where multiple disciplines genuinely contribute to understanding a complex real-world problem.

CRITICAL PRINCIPLES:
- **The problem must genuinely require multiple disciplines.** If the problem can be fully addressed by one subject, integration is unnecessary and artificial. A genuine interdisciplinary problem is one where removing any contributing subject leaves the understanding incomplete.
- **Each subject's contribution must be SUBSTANTIVE, not tokenistic.** "Let's do fractions about the environment" is tokenistic — Maths is being used as a surface-level illustration, not contributing substantive mathematical thinking. "Analyse the energy consumption data using percentage change to determine which areas of the school waste the most energy" is substantive — Maths provides analytical tools that are genuinely needed.
- **Integration points must be SPECIFIC and IDENTIFIED.** Vague integration ("these subjects relate to the same topic") produces parallel teaching, not integrated learning. Specific integration ("the Science investigation produces data that the Maths analysis uses to draw conclusions that the Geography contextualises") produces genuine cross-disciplinary understanding.
- **Start from where the school IS, not where it should be.** Full transdisciplinary integration requires timetable flexibility, team planning time, and cross-departmental collaboration. Many schools have none of these. The implementation plan must offer a spectrum: from single-teacher connections (a Science teacher referencing Maths concepts) to full cross-curricular projects (multiple departments coordinating a shared unit).
- **Integration should STRENGTHEN individual subjects, not dilute them.** The most common criticism of interdisciplinary teaching is that it produces shallow understanding of multiple subjects rather than deep understanding of one. Good integration does the opposite: students learn MORE deeply about supply-demand dynamics when they encounter them through a real economic problem, not less deeply.

Your task is to map the interdisciplinary connections for:

**Real-world problem:** {{real_world_problem}}
**Primary subject:** {{primary_subject}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for lower secondary (Years 7–9).
**Available subjects:** {{available_subjects}} — if not provided, identify the 3–4 most relevant subjects.
**Curriculum constraints:** {{curriculum_constraints}} — if not provided, identify natural curriculum alignment.
**Time frame:** {{time_frame}} — if not provided, design for a 2-week unit.
**School timetable:** {{school_timetable}} — if not provided, provide implementation options for both collaborative and siloed timetables.

Return your output in this exact format:

## Interdisciplinary Connection Map: [Problem]

**Real-world problem:** [The authentic situation]
**Primary subject:** [The teacher's discipline]
**Connected subjects:** [Other subjects that contribute]
**Integration level:** [Multidisciplinary / Interdisciplinary / Transdisciplinary — and why]

### Connection Map

[Visual or descriptive map showing how the problem connects to each subject — what each contributes]

### Disciplinary Contributions

For each subject (3–5):
**[Subject]: [What it contributes]**
- **Knowledge:** [Specific content students learn through this problem]
- **Skills:** [Disciplinary skills developed]
- **Curriculum alignment:** [How this addresses specific curriculum requirements]
- **Why this subject is necessary:** [What understanding would be missing without it]

### Integration Points

[Specific, identified points where one subject's output becomes another's input — the moments of genuine cross-disciplinary connection]

### Implementation Plan

**Option A — Single teacher (no cross-departmental collaboration needed):**
[How one teacher can make connections to other subjects within their own teaching]

**Option B — Coordinated teaching (subjects teach the same problem simultaneously but in their own lessons):**
[How 2–3 teachers coordinate timing and share the problem context]

**Option C — Full collaboration (subjects co-plan and co-teach):**
[How a full cross-curricular project could work if the school supports it]

### Assessment Approach

[How to assess integrated understanding — a task that requires drawing on multiple disciplines]

**Self-check before returning output:** Verify that (a) the problem genuinely requires multiple disciplines, (b) each subject's contribution is substantive, (c) integration points are specific and identified, (d) the implementation plan is realistic with multiple options, and (e) the integration strengthens rather than dilutes individual subjects.
```

## 示例输出

**情境：** *现实世界问题：“我们学校希望在明年将能源消耗降低 20%。校长要求学生调查能源的使用情况，找出最有可能实现减排的重点领域，并提出一份切实可行的行动计划。” / 主要学科：“我是一名科学教师——九年级” / 可参与的学科：“数学、地理和设计与技术都对此感兴趣。英语学科表示，如果需要进行说服性写作，他们也可以参与。” / 时间范围：“3 周——涉及学科大约 15 节课”*

---

## 跨学科关联图：学校能源减排

**现实世界问题：** 将学校能源消耗降低 20%——进行调查、分析并提出行动计划  
**主要学科：** 科学（九年级）  
**关联学科：** 数学、地理、设计与技术、英语  
**整合程度：** 跨学科——各学科保持自身的学科严谨性，但围绕一个共同问题进行协作。在最终提案阶段则趋向超学科，因为这要求学生综合运用所有学科的知识。

### 关联图

```
                    SCHOOL ENERGY PROBLEM
                           |
        ┌──────────┬───────┴───────┬──────────┐
        │          │               │          │
    SCIENCE     MATHS         GEOGRAPHY      DT
   (how energy  (data analysis  (energy in   (designing
    works,      and modelling)  context —    solutions —
    audit the                   global and   insulation,
    building)                   local)       lighting,
        │          │               │        controls)
        └──────────┴───────┬───────┴──────────┘
                           │
                       ENGLISH
                  (communicate the
                   proposal — persuade
                   the headteacher)
```

### 各学科的贡献

**科学：我们学校的能源是如何运作的？**
- **知识：** 能源形式、能量转移、隔热、电力消耗、供暖系统。学生了解学校为什么会使用能源（供暖、照明、计算机、烹饪），以及能源如何被浪费的科学原理（热量通过墙壁、窗户和屋顶散失；待机功耗；低效照明）。
- **技能：** 科学探究（开展能源审计）、测量（记录温度、读取电表）、检验假设（“哪个房间散热最快，为什么？”）
- **课程对应：** 九年级物理——能量转移、能量守恒、隔热、功率与能量计算
- **为什么需要这门学科：** 没有科学，学生就无法理解能源使用和损失的物理机制。他们可能知道学校使用了大量能源，却不理解能源究竟用在了哪里，以及为什么会产生损失——这意味着他们提出的方案只能是猜测，而不是基于工程原理的建议。

**数学：能源消耗有多少，节省效果会怎样？**
- **知识：** 百分比变化（计算 20% 的减幅）、数据分析（读取和解读能源账单）、统计表示（制作能源使用情况的柱状图和随时间变化的折线图）、比例推理（单位成本、按比例估算节省量）、财务建模（干预措施成本与长期节省金额的比较）
- **技能：** 数据收集与分析、百分比计算、创建和解读图表、财务建模（简单的投资回收期计算）
- **课程对应：** 九年级数学——百分比、数据处理、比例、现实世界数据集的解读
- **为什么需要这门学科：** 没有数学，能源问题只能用模糊的说法描述（“我们的能源用得太多了”）。有了数学，学生就能进行量化：“供暖占我们能源账单的 62%。如果改善屋顶隔热，我们可以将供暖成本降低 18%，每年大约节省 4,200 英镑。隔热工程的成本为 12,000 英镑，因此 2.9 年即可收回成本。”数字能让提案更可信，也让决策建立在证据之上。

**地理：能源背景——这为什么重要？**
- **知识：** 能源来源（学校用电来自哪里——国家电网、化石燃料、可再生能源）、碳足迹（将能源使用量换算为 CO2 排放量）、全球能源不平等（我们学校人均使用 X kWh；肯尼亚的一所学校使用 Y）、可持续发展（SDG 7：经济适用的清洁能源）
- **技能：** 地理探究、跨尺度比较（本地学校 → 国家能源政策 → 全球能源不平等）、批判性评估数据来源
- **课程对应：** 9 年级地理——能源资源、可持续性、发展、环境管理
- **为什么需要这门学科：** 没有地理学，能源问题就只是一个纯技术问题。地理学提供了背景：能源减排为什么不仅仅是为了省钱？我们的能源使用会带来哪些环境后果？我们的情况与其他国家的学校相比如何？地理学将项目从一项工程练习转变为一次可持续性探究。

**设计与技术：我们能构建什么解决方案？**
- **知识：** 隔热材料及其性能、LED 照明设计、基础电子学（定时器、传感器、控制装置）、可持续设计原则、面向环境性能的材料选择
- **技能：** 设计流程（确定问题 → 研究 → 设计 → 制作原型 → 测试 → 评估）、原型制作、技术制图、材料测试
- **课程对应：** 9 年级设计与技术——材料、设计中的可持续性、系统与控制
- **为什么需要这门学科：** 没有设计与技术，学生可以识别问题，却无法设计解决方案。设计与技术推动项目从分析（“我们学校浪费能源”）走向行动（“这是一个我们确实可以安装的门窗防风密封条 / 运动感应灯开关 / 窗户隔热板原型”）。

**英语：我们如何说服校长？**
- **知识：** 说服性写作技巧（ethos、pathos、logos）、报告写作（正式语体、结构化论证）、演讲技巧（向决策者推介想法）
- **技能：** 说服性写作、受众意识、正式语体、运用证据组织论证
- **课程对应：** 9 年级英语——根据目的和受众进行写作、说服技巧、非虚构写作
- **为什么需要这门学科：** 学生的提案需要说服校长和校董。技术上极其出色但表达不佳的提案将会失败。英语提供沟通技能，使其他学科的成果能够转化为实际行动。

### Integration Points

| Integration Point | Subject A produces... | Subject B uses it to... |
|---|---|---|
| **能源审计数据** | 科学开展审计（温度读数、电表数据、热量损失观察） | 数学分析数据（百分比分解、图表、趋势分析） |
| **量化节省量** | 数学计算每项干预措施可能节省的能源（以 kWh 和 £ 计） | 设计与技术利用节省数据确定要设计的解决方案的优先级（优先考虑影响最大者） |
| **碳排放背景** | 地理计算当前能源使用的碳足迹 | 科学利用这些数据解释不同能源来源的环境影响 |
| **原型性能** | 设计与技术测试原型隔热材料并测量其效果 | 科学运用能量传递原理评估结果 |
| **最终提案** | 所有学科共同提供证据和分析 | 英语将提案组织成一份提交给校长的说服性文件 |

### 实施计划

**方案 A——单科教师（由科学教师独立实施）：**
在科学课中，教师：
- 将能源审计作为科学探究活动开展（第 1–2 周）
- 纳入引用数学概念的基础数据分析：“我们需要计算百分比变化——你们在数学课上已经学过了”
- 联系地理背景：“我们学校的能源使用会造成碳排放——你们可能正在地理课上学习这一内容”
- 将说服性提案布置为家庭作业：“写一封信给校长，提出一项改进建议，并用审计中的证据加以支持”

这不需要跨学科协调。科学教师负责联系其他学科，但不要求这些学科参与其中。

**方案 B——协调教学（4 个学科，同步安排）：**
所有四个学科在同一个为期 3 周的阶段内，在各自的课堂中讲授能源问题：
- **第 1 周：**科学课开展能源审计。数学课开始分析学校的能源账单数据。地理课介绍全球背景下的能源问题。设计与技术课开始研究隔热和照明解决方案。
- **第 2 周：**科学课通过共享电子表格将审计数据提供给数学课。数学课分析并将数据可视化。地理课利用这些数据计算碳足迹。设计与技术课根据科学和数学课的发现设计原型解决方案。
- **第 3 周：**设计与技术课测试原型。数学课计算投资回收期。英语课帮助学生撰写正式提案。所有学科共同参与最终展示。

这需要：单元开始前召开一次 30 分钟的跨学科规划会议、一个用于存放数据的共享数字文件夹，以及大致同步的课程安排（第 1 周的科学审计必须先于第 2 周的数学分析）。

**方案 C——全面协作（团队教学，共享课程）：**
各学科合并课程，开展关键教学活动：
- 科学与数学共同教授能源审计（科学提供方法，数学提供分析工具）
- 地理与英语共同教授提案写作（地理提供环境背景，英语提供沟通框架）
- 设计与技术与科学共同教授原型测试（设计与技术负责制作，科学负责测量）
- 最终展示以联合课程的形式进行，由学生小组向校长展示成果（真实的受众）

这需要：课程安排上的灵活性、共同规划时间，以及学校领导层的支持。这是最有影响力的方案，但也是最难组织的方案。

### 评估方法

**能源行动提案（综合评估）：**

学生小组向校长提交一份正式提案，建议采取具体措施，将学校能源使用量减少 20%。提案必须包括：

1. **能源审计中的证据**（科学）：我们测量了什么、发现了什么、能源浪费发生在哪里
2. **数据分析**（数学）：量化节省金额、图表、投资回收期计算
3. **环境背景**（地理）：这为什么重要——碳足迹、全球背景
4. **带有原型的解决方案**（设计与技术）：我们建议采取什么措施、如何设计、测试结果
5. **说服性沟通**（英语）：正式语体、结构清晰的论证、明确的建议

该提案的评估依据包括：证据的准确性、分析的质量、背景的深度、解决方案的可行性以及沟通的清晰度。每个学科分别评估其学科贡献；整体整合效果则根据提案的总体质量进行评估。

**真正的检验：**校长是否接受该提案？如果学生向真正的受众进行展示，而受众拥有实际的决策权，那么评估就具有真实的利害关系。

---

## 已知局限

1. **在中学阶段，跨课程整合在结构上存在困难。**学科课程表、部门壁垒、分散的备课时间以及教师个人责任制，都会阻碍整合。上面的三种实施方案承认了这一现实——方案 A 适用于任何学校，而方案 C 则要求学校具备相当大的结构灵活性，但许多学校并不具备这一条件。

2. **如果设计不当，整合可能会削弱各个单独学科的教学（Czerniak et al., 1999）。**最常见的失败模式是：各学科只是表面性地参与共同问题，而没有实质性贡献。“我们在数学课上做能量百分比”（一节课，挑战性低）就弱于“使用百分比变化、统计表示和财务建模来分析学校真实的能源数据”（多节课，真正需要数学思考）。在整合背景下，每个学科都必须保持自身的标准。

3. **并非所有现实世界的问题都能与所有学科形成同等程度的联系。**上面的能源问题与科学、数学、地理、设计与技术以及英语之间具有自然联系，但与音乐、体育或现代外语的联系并不紧密。强行让那些无法自然作出贡献的学科建立联系，会削弱整合效果。与其让八个学科人为建立联系，不如让四个学科实现真正的整合。