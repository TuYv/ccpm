---
# AGENT SKILLS STANDARD FIELDS (v2)
name: biophilic-learning-environment-designer
description: "Redesign a learning space using biophilic design principles to improve focus, calm, and wellbeing. Use when classroom environment contributes to restlessness, poor attention, or stress."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "environmental-experiential-learning/biophilic-learning-environment-designer"
skill_name: "Biophilic Learning Environment Designer"
domain: "environmental-experiential-learning"
version: "1.0"
evidence_strength: "emerging"
evidence_sources:
  - "Kellert (2005) — Building for Life: designing and understanding the human-nature connection"
  - "Kellert, Heerwagen & Mador (2008) — Biophilic Design: the theory, science, and practice of bringing buildings to life"
  - "Kaplan & Kaplan (1989) — The Experience of Nature: a psychological perspective (Attention Restoration Theory)"
  - "Wells (2000) — At home with nature: effects of 'greenness' on children's cognitive functioning"
  - "Browning, Ryan & Clancy (2014) — 14 Patterns of Biophilic Design: improving health and well-being in the built environment"
input_schema:
  required:
    - field: "current_space"
      type: "string"
      description: "Description of the current learning space — size, layout, windows, lighting, surfaces, current natural elements"
    - field: "design_goal"
      type: "string"
      description: "What the teacher wants to achieve — better focus, calmer atmosphere, more engagement, stress reduction"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age group using the space"
    - field: "budget_level"
      type: "string"
      description: "Available budget — zero cost, low cost (under £100), moderate (under £500), or able to invest"
    - field: "space_constraints"
      type: "string"
      description: "Restrictions — no live plants allowed, limited wall space, shared classroom, landlord restrictions"
    - field: "existing_nature_access"
      type: "string"
      description: "Current access to nature — window views, proximity to outdoor spaces"
    - field: "sensory_needs"
      type: "string"
      description: "Whether students have specific sensory needs — e.g., autism spectrum, sensory processing differences"
output_schema:
  type: "object"
  fields:
    - field: "biophilic_design"
      type: "object"
      description: "The complete design proposal — specific changes to the space, organised by biophilic design pattern"
    - field: "priority_changes"
      type: "array"
      description: "The 3–5 highest-impact changes ranked by evidence strength, cost, and ease of implementation"
    - field: "implementation_plan"
      type: "object"
      description: "How to implement the changes — phased if budget-constrained, immediate if possible"
    - field: "evidence_rationale"
      type: "object"
      description: "Why each change matters — linking the specific design element to the research evidence"
chains_well_with:
  - "outdoor-learning-sequence-designer"
  - "flow-state-condition-designer"
  - "belonging-classroom-culture-designer"
  - "ecological-inquiry-anchor-designer"
teacher_time: "3 minutes"
tags: ["biophilic-design", "Kellert", "Kaplan", "attention-restoration", "classroom-environment", "nature", "wellbeing"]
---
# 亲生命学习环境设计师

## 此技能的作用

重新设计教室或学习空间，融入亲生命设计元素——即将使用者与自然及自然过程联系起来的特征。这一方法基于这样一项证据：接触自然环境能够改善人的认知功能、减轻压力并提升注意力。该方法借鉴了 Kellert (2005, 2008) 的亲生命设计框架，以及 Kaplan & Kaplan (1989) 的注意力恢复理论。其关键洞见在于：大多数教室都是亲生命荒漠——封闭、人工化的环境，使用荧光灯照明，表面单一，没有任何生命元素，也缺乏感官变化——而即使是微小的改变（植物、自然光、自然景观、天然材料、水声）也能切实改善注意力、减轻压力并提升参与度。输出内容包括一份设计提案，其中包含按照亲生命设计模式组织的具体改动、按影响和成本排序的优先建议、实施计划，以及每项改动的证据依据。AI 在此特别有价值，因为将亲生命设计原则转化为实际的教室改造方案，需要同时考虑证据基础、空间的物理限制、预算以及学生的具体需求——这是一项受益于系统化模式匹配的设计挑战。

## 证据基础

Kellert (2005) 将亲生命性定义为“人类与自然系统及自然过程建立联系的内在倾向”，并指出，旨在满足这一倾向的建筑能够为使用者带来更好的认知、情绪和身体层面的结果。Kellert, Heerwagen & Mador (2008) 构建了一个全面的亲生命设计框架，确定了六个要素：环境特征（植物、水、自然光）、自然形状与形式（植物图案、曲线）、自然模式与过程（感官变化、生长、老化）、光线与空间（自然光、空间变化）、基于场所的关系（与当地生态及文化的联系），以及演化形成的人与自然关系（远眺与庇护、神秘感、风险/危险）。Kaplan & Kaplan (1989) 提出了注意力恢复理论（ART），认为集中注意力（学业活动所需的主动专注）是一种会逐渐耗竭的资源，而接触自然能够使其恢复。自然环境具有“柔性吸引力”——它们能够吸引注意力，却不会要求人付出努力，从而让集中注意力得以恢复。这对教室有着直接的影响：与自然建立联系的空间中的学生，其持续注意力应优于处于自然匮乏空间中的学生。Wells (2000) 发现，搬入“绿意”更多的住宅（拥有自然景观、植被和自然元素）的儿童，其认知功能得到显著改善，即使控制了其他变量，这一结果仍然成立。Browning, Ryan & Clancy (2014) 将相关证据综合为 14 种亲生命设计的实用模式，为将亲生命原则应用于具体空间提供了最具可操作性的框架。

## 输入架构

教师必须提供：
- **当前空间：** 房间目前的样子。*例如："标准教室 — 30 张课桌呈排状摆放，荧光灯条照明，两扇窗户朝向停车场，奶油色墙面，塑胶地板，一块白板，一块展示板。没有植物。由于屏幕眩光，百叶窗通常处于关闭状态。" / "开放式学习区域 — 灵活座位，天窗提供一些自然光，铺有地毯，设有展示墙，学生视线高度没有窗户。目前比较杂乱。"*
- **设计目标：** 他们想要改善什么。*例如："学生午餐后难以集中注意力 — 精力分散，注意力不佳" / "房间感觉冷漠且制度化 — 我希望它感觉更平静、更有亲和力" / "我想为需要感官调节的学生打造一个平静角落"*

可选项（如可用，由上下文引擎注入）：
- **学生阶段：** 年龄组
- **预算水平：** 可用资源
- **空间限制：** 限制条件
- **现有自然接触：** 当前与自然的联系
- **感官需求：** 学生的感官特征

## 提示词

```
You are an expert in biophilic design for learning environments, with deep knowledge of Kellert's (2005, 2008) biophilic design framework, Kaplan & Kaplan's (1989) Attention Restoration Theory, Wells' (2000) research on nature and cognitive functioning, and Browning, Ryan & Clancy's (2014) 14 Patterns of Biophilic Design. You understand that biophilic design is not interior decoration — it is evidence-informed environmental design that connects occupants to nature and natural processes to improve cognitive functioning, emotional regulation, and wellbeing.

CRITICAL PRINCIPLES:
- **Start with what's already there.** Most classrooms have SOME connection to nature — a window, natural light, a view of trees. Identify and amplify existing connections before adding new ones. Opening blinds costs nothing. Rearranging desks so students face a window costs nothing. These are often the highest-impact, lowest-cost changes.
- **Nature connection is multi-sensory.** Biophilic design is not just visual (plants and pictures). It includes auditory (water sounds, birdsong), olfactory (natural scents), tactile (natural materials — wood, stone, fabric), and even thermal (temperature variation, air movement). The most effective biophilic spaces engage multiple senses.
- **Prioritise by evidence strength.** Natural light has the strongest evidence base. Plants and nature views have moderate evidence. Natural materials, sounds, and patterns have emerging evidence. Recommend changes in order of evidence strength, not aesthetic preference.
- **Be realistic about constraints.** Many schools prohibit live plants (allergy policies, maintenance concerns), have sealed windows, use fluorescent lighting, and have zero budget. The design must work WITHIN these constraints — not wish them away. There is always something that can be done, even with zero budget.
- **Attention restoration, not distraction.** Biophilic elements should be "softly fascinating" (Kaplan & Kaplan) — present in the peripheral visual field, gently engaging the senses, not demanding attention. A fish tank in the middle of the room may be more distracting than restorative. A plant on the windowsill, visible but not dominant, is restorative.

Your task is to design a biophilic learning environment for:

**Current space:** {{current_space}}
**Design goal:** {{design_goal}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general classroom context.
**Budget level:** {{budget_level}} — if not provided, design a phased plan starting with zero-cost changes.
**Space constraints:** {{space_constraints}} — if not provided, identify common constraints and design around them.
**Existing nature access:** {{existing_nature_access}} — if not provided, assess from the space description.
**Sensory needs:** {{sensory_needs}} — if not provided, include a note about sensory sensitivity.

Return your output in this exact format:

## Biophilic Learning Environment: [Design Goal]

**Current space:** [Summary]
**Design goal:** [What to improve]
**Key biophilic principle:** [The main Attention Restoration Theory or biophilic design principle this redesign activates]

### Assessment of Current Space

[What biophilic elements are already present (if any) and what's missing — identifying the biggest gaps]

### Priority Changes (Ranked by Impact)

For each change (3–5):
**Priority [N]: [Change]**
- **What to do:** [Specific, practical action]
- **Biophilic pattern:** [Which of Browning et al.'s 14 patterns this addresses]
- **Evidence:** [Why this matters — link to research]
- **Cost:** [Zero / Low / Moderate / Investment needed]
- **Implementation:** [How to do it — practical steps]

### Sensory Design Map

[How the redesigned space engages multiple senses — visual, auditory, tactile, olfactory — through natural elements]

### Implementation Plan

**Phase 1 — Immediate (zero cost):** [Changes that can be made today]
**Phase 2 — Low cost (under £50):** [Changes that need a small budget]
**Phase 3 — Investment (when budget allows):** [Changes that need more significant resources]

### Considerations for Specific Needs

[How to adapt the design for students with sensory sensitivities, allergies, or other needs]

**Self-check before returning output:** Verify that (a) changes are prioritised by evidence strength, (b) the design is realistic given the described constraints, (c) the plan starts with zero-cost changes, (d) multiple senses are addressed, and (e) the biophilic elements are restorative, not distracting.
```

## 示例输出

**情境：** *当前空间：“五年级教室——标准长方形房间，30 张课桌成排面向白板。左侧墙上有两扇朝东的大窗户——早晨采光良好，但由于互动式白板反光，百叶窗通常关闭。荧光灯管照明。奶油色墙壁。塑胶地板。一块展示板上贴满学生作品（覆膜、色彩非常鲜艳）。没有植物。没有天然材料。房间感觉空白且充满机构感。唯一的颜色来自展示板，而它在视觉上十分繁杂。” / 设计目标：“学生难以持续集中注意力，尤其是在午餐后。教室感觉缺乏生气。我希望营造一个更平静、更专注的环境，帮助学生集中注意力。” / 预算级别：“非常低——可能从我自己的钱里拿出 30 英镑。若能说明理由，或许可以申请一笔小额学校改进补助（最高 200 英镑）。” / 感官需求：“两名学生处于自闭症谱系，对强光和视觉杂乱较为敏感。”*

---

## 亲自然学习环境：恢复五年级学生的注意力

**当前空间：** 标准五年级教室——成排课桌、荧光灯、关闭的百叶窗、没有自然元素，除了一个繁杂的展示板外，视觉上显得缺乏生气  
**设计目标：** 改善持续注意力，并营造更平静、更专注的氛围  
**关键亲自然原则：** 注意力恢复理论（Kaplan & Kaplan, 1989）——持续的认知努力会耗尽定向注意力，而接触自然环境能够恢复它。该教室目前没有任何恢复性元素。

### 当前空间评估

**现有亲自然元素：** 两扇朝东的窗户，早晨采光良好——这是该空间最强的资产，但目前因百叶窗关闭而被浪费。这些窗户也可能提供树木、天空或绿植的景观——值得确认。

**缺失元素：** 没有自然光照射到学生身上（百叶窗关闭）。没有生命体。没有天然材料（塑胶、塑料和层压材料占主导）。没有感官变化性（均一的照明、均一的色彩、均一的温度）。展示板提供了视觉刺激，但它是**视觉杂乱的**，而非柔和地引人入胜——它要求注意力，而不是恢复注意力。两名具有自闭症谱系特征的学生很可能尤其受到荧光照明和视觉杂乱的影响。

### 优先改动（按影响力排序）

**优先事项 1：打开百叶窗并处理眩光**
- **要做什么：** 打开百叶窗。调整互动式白板的位置或屏幕亮度，使其在不遮挡全部自然光的情况下仍清晰可见。若完全打开百叶窗会产生过强眩光，可将百叶窗调至半开状态（下半部分打开，上半部分关闭），或将不透光百叶窗更换为可漫射光线的窗帘或贴膜。
- **亲自然模式：** 与自然的视觉连接（模式 1 — Browning et al.）
- **证据：** 自然日光是最有效的单一亲自然干预措施。Wells（2000）发现，随着包括自然光在内的“绿色性”提升，认知能力也有所改善。Heschong Mahone Group（1999）发现，采光最充足教室中的学生，其数学进步速度比采光最少教室中的学生快 20%，阅读进步速度快 26%。即使控制其他因素，日光仍持续改善注意力、情绪和学业表现。
- **成本：** 零
- **实施：** 明天早上。检查窗外景观（是否能看到天空、树木、绿地？）。若可以，这将立刻成为教室中最有力的自然连接。必要时调整学生课桌的位置，避免白板正对窗户。

**优先级 2：减少视觉杂乱，营造视觉宁静**
- **要做什么：** 将展示板从完全覆盖减少到覆盖 60%。去除覆膜（覆膜会产生眩光）。使用柔和、自然色调的衬纸（牛皮纸、粗麻布），而不是鲜艳的彩纸。有意识地留出一些墙面空间，保持空白——作为视觉休息区。这一点对两名具有自闭症谱系特征的学生尤其重要。
- **亲生物设计模式：** 与自然的非视觉联系（模式 2）和复杂性与秩序（模式 10）——大脑能从有组织的自然模式中获得平静，而不是从视觉混乱中获得平静
- **证据：** Barrett、Zhang、Moffat 与 Kobbacy（2013）发现，课堂中的“个性化”（色彩、展示内容、视觉刺激）存在一个最佳水平——过多的视觉刺激与过少的视觉刺激一样具有负面影响。与墙面空白或展示内容在视觉上令人难以承受的教室相比，具有适度且有组织的视觉环境的教室能取得更好的学习成果。
- **成本：** 接近于零（牛皮纸或粗麻布的成本为 £5–10）
- **实施时间：** 本周内。移除 40% 的展示内容。将鲜艳的衬纸更换为自然色调。设置一面“安静墙”——有意识地保持空白，或只放置一张自然景观图片。

**优先级 3：引入活的生物**
- **要做什么：** 添加 3–5 株易于养护的室内植物。将它们放在窗台上（现在百叶窗已经打开）、学生课桌能看到的架子上，以及阅读角（如果有的话）。最适合教室的品种包括：绿萝（几乎养不死、枝条下垂且具有视觉吸引力）、吊兰（能够净化空气，还会长出可供学生照料的小植株）、和平百合（如有需要，可耐受低光照），或多肉植物（几乎不需要浇水）。
- **亲生物设计模式：** 与自然的视觉联系（模式 1）和水/生命的存在（模式 4——活的生物）
- **证据：** Lohr、Pearson-Mims 与 Goodwin（1996）发现，房间中有植物能够提升任务表现并减轻压力。Fjeld（2000）发现，室内植物能够减少疲劳和头痛。其作用机制可能涉及多条途径：柔化视觉环境、改善空气质量，以及活的生物所带来的“柔性吸引”，这种吸引能够恢复注意力，却不会对注意力提出要求。
- **成本：** 从园艺中心或超市购买 3–5 株植物，成本为 £15–25
- **实施时间：** 本周内。如果学校政策限制活体植物（例如过敏问题），可以使用密封生态瓶（内含苔藓和蕨类植物的玻璃罐——不会释放过敏原）。如果连这一做法也受到限制，则使用高质量的自然景观照片，并将其放置在学生视线高度——虽然效果远不如真实植物，但仍然有益。

**优先级 4：在触觉环境中增加天然材料**
- **要做什么：** 用天然材料替换一件合成材料制品。可选方案包括：使用木箱存放书籍（代替塑料箱）、在休息区域铺设粗麻布垫、在每组桌面上放置一块光滑的石头或木制物品（作为“思考石”，学生讨论时可以拿在手中）、在阅读角的坐垫上使用天然面料（棉、亚麻）制作的罩套。
- **亲生物设计模式：** 与自然的非视觉联系（模式 2）——触觉在亲生物设计中常常被低估
- **证据：** 新近证据表明，与天然材料（木材、石头、纤维）的触觉接触，会激活不同于接触合成材料的神经通路，并可能有助于减轻压力。Sakuragawa、Miyazaki、Kaneko 与 Makita（2005）发现，触摸木材能够产生令人平静的生理反应。对于两名具有自闭症谱系特征的学生而言，光滑的石头或木制物品能够提供一种在社交上可接受的感官调节工具。
- **成本：** £5–15（慈善商店是购买木箱、天然面料和石头的极佳渠道）
- **实施时间：** 在接下来的两周内逐步完成。逐渐收集天然材料。让学生参与其中：“你能从家里带一块光滑的石头来吗？”

**优先事项 5：引入自然声音**
- **要做什么：** 在安静的工作时间，通过教室音箱播放低音量的自然声景（鸟鸣、雨声、溪流声）。音量应当几乎听不见——作为背景，而不是前景。
- **亲自然设计模式：** 与自然的听觉连接（属于模式 2）
- **证据：** Kaplan & Kaplan 的 ART 理论认为，自然声音具有“柔和的吸引力”——它们能够温和地占据听觉注意力，掩盖令人分心的人工噪音（走廊噪音、施工声、交通噪音），同时不会要求人们付出需要集中注意力的努力。Ratcliffe, Gatersleben & Sowden（2013）发现，鸟鸣尤其容易被人感知为具有恢复性。注意：一些学生（包括听觉敏感的学生）可能会觉得任何背景声音都会造成干扰。应提供耳机作为替代方案。
- **成本：** 零成本（免费的自然声景应用或 YouTube）
- **实施：** 本周尝试。先在独立写作时间播放 5 分钟。观察学生的反应。如果反响积极，再延长播放时间。如果自闭症学生感到不适，应停止播放，或为他们提供降噪耳机。

### 感官设计图

| 感官 | 当前状态 | 建议改变 | 要素 |
|---|---|---|---|
| 视觉 | 荧光灯、百叶窗关闭、没有自然元素、展示内容杂乱 | 引入自然日光、减少杂乱、让植物处于可见位置、墙面使用自然色调 | 日光、植物、经过整理的展示内容 |
| 听觉 | 荧光灯嗡嗡声、走廊噪音、没有自然声音 | 在安静工作期间，可选择播放鸟鸣或雨声声景 | 自然声景（几乎听不见） |
| 触觉 | 乙烯基地板、塑料、层压材料——全部为合成材料 | 木制物品、光滑石头、在阅读区使用天然织物 | 触手可及的天然材料 |
| 嗅觉 | 机构化气味——清洁产品、白板笔 | 植物散发的淡淡自然气味（如果开花），或天然材料的气味 | 活体植物（气味温和，不使用香氛） |

### 实施计划

**阶段 1——立即实施（零成本，本周）：**
- 打开百叶窗（或打开一半以控制眩光）
- 如有需要，重新摆放课桌，以确保能够看清白板
- 移除展示板上 40% 的内容
- 在一次安静的工作时段尝试播放自然声景

**阶段 2——低成本（£30 以内，接下来两周）：**
- 购买 3–5 盆室内植物（£15–25）
- 将鲜艳的展示背景更换为牛皮纸或粗麻布（£5–10）
- 收集天然触感物品（石头、木制物品——免费或从慈善商店购买）

**阶段 3——如果有资助资金（£200 以内）：**
- 将荧光灯管更换为日光光谱 LED 面板（一个教室需 £80–150，对光线质量的改善十分显著）
- 创建一个专门的“自然角”，配备玻璃生态缸、天然材料收藏，以及一把使用天然织物的舒适座椅
- 安装一个小型室内水景（桌面喷泉，£20–40）——建立视觉和听觉上的自然连接

### 对特殊需求的考虑

**对于两名自闭症谱系学生：**
- 整理展示内容（优先事项 2）将直接使他们受益——减少视觉上的过度刺激
- 对于有感官敏感的个体而言，自然日光通常比荧光灯更受欢迎——打开百叶窗可能会显著改善他们的体验
- “思考石”（优先事项 4）提供了一种在社交上容易被接受的感官调节工具——表面光滑、触感凉爽且天然
- 自然声景（优先事项 5）：应谨慎测试。一些自闭症患者会觉得鸟鸣令人平静；另一些人则会因不可预测的自然声音而感到不适。应提供降噪耳机作为替代方案
- 所有改变都应当**逐步**引入——突然的环境变化可能导致情绪调节失衡。每周引入一个改变，不要一次性全部实施

---

## 已知局限

1. **关于教室中亲自然设计的证据仍在不断积累，尚未得到确立。** 最有力的证据来自工作场所和医疗环境（Kellert, 2008；Browning et al., 2014），针对教室的研究相对有限。Wells (2000) 和 Heschong Mahone Group (1999) 提供了与教育最相关的证据，但对于具体的教室改造措施（植物、自然声音、天然材料），现有证据只能说明其具有一定可能性，尚不足以下定论。上述建议是对已有充分支持的原则所作的合理应用，并非经过直接验证的干预措施。

2. **学校政策可能会限制实施。** 一些学校禁止摆放活体植物（出于过敏问题的考虑）、限制墙面展示的具体形式、封闭窗户，或采用缺乏灵活性的照明系统。分阶段实施的方法可以应对这些情况，但教师可能会发现，对效果影响最大的改动（日光、植物）恰恰是学校限制最多的方面。

3. **亲自然设计是优质教学的补充，而不是替代。** 一间优美、与自然相连的教室，如果教学质量不佳，也不会带来良好的学习成果；而一间缺乏生气的教室，只要教学出色，仍然可以取得良好成效。亲自然设计改善的是学习的**条件**——营造一个更容易保持注意力、压力更低的环境——但它本身并不承担教学。教师的教学法仍然是决定教学质量的首要因素。