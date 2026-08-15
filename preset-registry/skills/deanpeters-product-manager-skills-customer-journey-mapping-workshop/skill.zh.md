---
name: customer-journey-mapping-workshop
argument-hint: "[persona] [scenario]"
description: Run a customer journey mapping workshop with adaptive questions and outputs. Use when you need to map stages, actions, emotions, pain points, and opportunities for a persona and scenario.
intent: >-
  Guide product managers through creating a customer journey map by asking adaptive questions about the actor (persona), scenario/goal, journey phases, actions/emotions, and opportunities for improvement. Use this to visualize the end-to-end customer experience, identify pain points, and create a shared mental model across teams—avoiding surface-level feature lists and ensuring discovery work focuses on real customer problems, not assumed solutions.
type: interactive
best_for:
  - "Running a workshop to map an end-to-end customer experience"
  - "Finding pain points across a user's journey"
  - "Aligning teams on the stages, emotions, and breakdowns in an experience"
scenarios:
  - "Help me run a journey mapping workshop for new customer onboarding"
  - "Map the experience of a buyer from trial signup to first value"
  - "Facilitate a workshop on the support journey for churn-risk customers"
theme: workshops-facilitation
estimated_time: "45-90 min"
---
## 目的
通过针对参与者（用户画像）、场景/目标、旅程阶段、行动/情绪以及改进机会提出自适应问题，引导产品经理创建客户旅程地图。使用此方法可视化端到端的客户体验、识别痛点，并帮助团队建立共享的心智模型——避免停留在表面的功能列表上，并确保探索工作聚焦于真实的客户问题，而非假设的解决方案。

这不是功能路线图——它是一种探索与对齐工具，用于揭示体验在哪些环节出现问题，以及哪些方面的改进将产生最大影响。

## 输入

**最适合提供：** 要绘制其旅程的用户画像（参与者）以及场景或目标。
**同样有用：** 你已经了解的旅程阶段、研究资料，以及你怀疑体验出现问题的环节。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些信息并跳过其已涵盖的问题；不要重复询问。

**毫无准备也没关系。** 研讨会将从参与者问题（Q1）开始，并按照引导流程每次提出一个问题。

**调用示例：** `Run a journey mapping workshop: persona is a first-time landlord, scenario is listing and leasing their first property through our app.`

## 核心概念

### 什么是客户旅程地图？

旅程地图（NNGroup）将“一个人为实现某个目标而经历的过程”可视化。它把用户行动整理成时间线，并通过补充想法和情绪来构建叙事，随后将其提炼和完善为可视化产物。

### 五个关键组成部分（NNGroup 框架）

1. **参与者** — 作为旅程地图视角锚点的特定用户画像或用户
2. **场景 + 预期** — 情境背景及其相关目标
3. **旅程阶段** — 用于组织体验的高层级阶段（例如：发现、尝试、购买、使用、寻求支持）
4. **行动、心态和情绪** — 用户在各个阶段中的行为、想法和情绪反应
5. **机会** — 指明体验改进方向的洞察

### 旅程地图结构

```
Actor: [Persona Name]
Scenario: [Goal/Context]

Phase 1: Discover → Phase 2: Try → Phase 3: Buy → Phase 4: Use → Phase 5: Support
   ↓                  ↓                ↓               ↓               ↓
Actions:           Actions:         Actions:        Actions:        Actions:
Thoughts:          Thoughts:        Thoughts:       Thoughts:       Thoughts:
Emotions: 😊😐😞    Emotions:        Emotions:       Emotions:       Emotions:
   ↓                  ↓                ↓               ↓               ↓
Opportunities:     Opportunities:   Opportunities:  Opportunities:  Opportunities:
```

### 为什么这种方法有效
- **促进对话：** 帮助团队就客户体验建立一致认知
- **揭示痛点：** 情绪与行动能够凸显体验出现问题的环节
- **确定改进优先级：** 按影响程度排序的机会可指导路线图决策
- **以人为本：** 聚焦客户视角，而非内部流程

### 反模式（这不是什么）
- **不是服务蓝图：**旅程地图关注客户视角；服务蓝图描绘内部运营流程
- **不是用户故事地图：**旅程地图支持探索发现；用户故事地图用于促进实施规划
- **不是体验地图：**旅程地图针对特定用户和产品；体验地图探索更广泛的人类行为

### 何时使用
- 开始客户探索时（了解当前体验）
- 为客户留存/参与度计划识别痛点
- 使跨职能团队围绕客户视角达成一致
- 确定应优先解决哪些问题

### 何时不应使用
- 当你已经深入了解客户旅程时
- 用于技术重构时（不存在面向客户的旅程）
- 用作用户研究的替代品时（地图需要研究输入）

---

### 引导流程的事实依据

将 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 用作此技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文转储、最佳猜测）
- 每轮只提出一个问题，并使用通俗易懂的提示语
- 进度标签（例如，上下文 Qx/8 和评分 Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文件定义特定领域的评估内容。如有冲突，请遵循本文件的领域逻辑。

## 应用

此交互式技能会提出**最多 5 个自适应问题**，每一步提供 **3-4 个编号选项**。

交互模式：当你希望采用每次一个步骤的流程，在决策点提供编号建议，并为常规问题提供快速选择选项时，请与 `skills/workshop-facilitation/SKILL.md` 配合使用。如果用户要求一次性输出，请跳过多轮引导。

---

### 第 0 步：收集上下文（提问前）

**智能体建议：**

在创建旅程地图之前，让我们先收集上下文：

**客户研究：**
- 用户访谈、探索笔记、支持工单
- 流失原因、退出调查、NPS 反馈
- 分析数据（流失节点、功能使用情况）
- 用户画像或初步用户画像

**产品上下文：**
- 网站文案、产品描述、定位
- 竞品旅程地图或评论（G2、Capterra）
- 现有的旅程文档（如有）

**你可以直接粘贴这些内容，也可以简要描述客户体验。**

---

### 问题 1：确定参与者（用户画像）

**智能体提问：**
“这张旅程地图的参与者是谁？（哪个用户画像或用户细分？）”

**提供 4 个编号选项：**

1. **主要用户画像** — “你的核心目标客户（例如，‘小企业主’）”（最常见的起点）
2. **次要用户画像** — “具有不同需求的次要用户细分（例如，‘企业管理员’与‘最终用户’）”（如果主要用户画像已经完成映射，则使用此项）
3. **高流失用户画像** — “流失率最高的用户细分（例如，‘未转化的试用用户’）”（适合客户留存计划）
4. **新发现的用户画像** — “近期研究中出现的新兴用户细分（例如，新冠疫情后的‘远程团队’）”（适合市场扩张）

**或者描述你的特定用户画像。**

**调整方式：** 使用上下文中的用户画像（初步用户画像、JTBD 研究等）

**用户回答：** [选择或自定义]

---

### 问题 2：定义场景和目标

**智能体提问：**
“这段旅程的场景和目标是什么？（行动者正试图完成什么？）”

**提供 4 个编号选项：**

1. **首次使用** — “新用户从发现产品到完成激活的引导过程”（常见于 SaaS、应用）
2. **核心工作流** — “用户定期执行的重复性任务（例如‘创建发票’、‘运行报告’）”（常见于成熟产品）
3. **问题解决** — “用户遇到问题并寻求帮助（例如‘忘记密码’、‘账单问题’）”（适用于支持/留存）
4. **升级/扩展** — “免费用户考虑付费方案，或现有客户扩大使用范围”（适用于增长计划）

**或者描述你的特定场景。**

**用户回答：** [选择或自定义]

**智能体提取：**
- **行动者：** [问题 1 中的用户画像]
- **场景：** [问题 2 中的上下文]
- **目标：** [行动者正试图完成的事情]

---

### 问题 3：确定旅程阶段

**智能体说明：**
“让我们将旅程划分为若干高层级阶段（从开始到结束，通常为 4–6 个阶段）。”

**智能体根据场景（问题 2）生成 4–6 个旅程阶段**。

**示例（如果场景 = “首次使用”）：**

```
Journey Phases (left to right):

1. Discover — User learns about product
2. Evaluate — User researches, compares alternatives
3. Try — User signs up, starts onboarding
4. Activate — User reaches "aha moment," experiences value
5. Use — User integrates product into workflow
6. Expand — User considers upgrading or inviting team
```

**智能体提问：**
“这些阶段是否涵盖了完整的旅程？我们是否应该添加、删除或重命名某些阶段？”

**用户回答：** [批准或修改]

---

### 问题 4：绘制每个阶段的行动、想法和情绪

**智能体说明：**
“现在，让我们绘制行动者在每个阶段中的行为、想法和感受。”

**智能体根据上下文（步骤 0）和场景（问题 2），为每个阶段生成 3–5 项行动、想法和情绪**。

**示例（针对阶段 3：“试用 — 用户注册并开始新手引导”）：**

```
Phase 3: Try (Onboarding)

Actions:
- Signs up with email
- Receives welcome email
- Logs in for the first time
- Sees empty dashboard
- Searches for "getting started" guide

Thoughts:
- "This looks promising, but I'm not sure where to start"
- "Do I need to watch a tutorial video?"
- "What's the first step?"

Emotions:
- Curious but uncertain 🤔
- Slightly frustrated (no clear next step) 😕
- Hopeful it will get easier 🙂

Pain Points:
- No onboarding checklist or guided tour
- Empty state doesn't suggest next action
- Too many options in navigation (overwhelming)
```

**智能体对所有旅程阶段重复上述过程**，展示完整地图。

**智能体提问：**
“这是否准确反映了客户体验？我们是否应该调整行动、想法或情绪？”

**用户回答：** [批准或修改]

---

### 问题 5：识别机会（需要解决的痛点）

**智能体说：**
“基于客户旅程地图，让我们识别改进机会，并按影响程度排序。”

**智能体生成 5-7 个机会**（情绪强度最高或流失率最高的痛点）。

**示例：**

```
# Opportunities (Ranked by Impact)

## 1. Onboarding lacks guided first steps (Phase 3: Try)
**Pain Point:** Users see empty dashboard, don't know what to do first
**Evidence:** 60% of signups don't complete first action within 24 hours
**Opportunity:** Add interactive onboarding checklist ("Create your first project," "Invite a teammate")
**Impact:** HIGH — Directly affects activation rate

---

## 2. Pricing page is confusing (Phase 2: Evaluate)
**Pain Point:** Users don't understand which plan fits their needs
**Evidence:** High bounce rate on pricing page (70% leave without signing up)
**Opportunity:** Add plan comparison tool or "Which plan is right for me?" quiz
**Impact:** HIGH — Directly affects trial conversion

---

## 3. Support is hard to find (Phase 5: Use)
**Pain Point:** Users encounter issues, struggle to find help
**Evidence:** Support tickets often say "I couldn't find an answer in docs"
**Opportunity:** Add in-app help widget, contextual tooltips
**Impact:** MEDIUM — Affects retention, but fewer users hit this phase

---

## 4. Email confirmations lack context (Phase 1: Discover)
**Pain Point:** Marketing emails don't explain value clearly
**Evidence:** Low click-through rate on email campaigns (5% vs. industry avg 15%)
**Opportunity:** Rewrite emails with customer language, clear CTAs
**Impact:** MEDIUM — Affects top-of-funnel awareness

---

## 5. Upgrade prompts feel pushy (Phase 6: Expand)
**Pain Point:** Users perceive upgrade prompts as sales-y, not helpful
**Evidence:** Negative sentiment in NPS comments ("too many upgrade popups")
**Opportunity:** Show upgrade value contextually (when user hits free plan limit)
**Impact:** LOW — Affects smaller user subset
```

**智能体询问：**
“这些机会与你的优先事项一致吗？我们应该先关注哪一个？”

**用户回复：** [选择或自定义内容]

---

### 输出：客户旅程地图 + 机会列表

完成该流程后，智能体输出：

```markdown
# Customer Journey Map: [Scenario from Q2]

**Actor:** [Persona from Q1]
**Scenario:** [Context from Q2]
**Goal:** [What actor is trying to accomplish]
**Date:** [Today's date]

---

## Journey Phases

[Phase 1] → [Phase 2] → [Phase 3] → [Phase 4] → [Phase 5] → [Phase 6]

---

## Full Journey Map

### Phase 1: [Name]

**Actions:**
- [Action 1]
- [Action 2]
- [Action 3]

**Thoughts:**
- "[Quote 1]"
- "[Quote 2]"

**Emotions:**
- [Emotion 1] 😊
- [Emotion 2] 😐

**Pain Points:**
- [Pain point 1]
- [Pain point 2]

---

### Phase 2: [Name]

[...repeat structure for all phases...]

---

## Opportunities (Prioritized)

### Opportunity 1: [Name] (HIGH IMPACT)
**Phase:** [Journey phase]
**Pain Point:** [Description]
**Evidence:** [Data/research]
**Proposed Solution:** [How to address]
**Impact:** HIGH — [Rationale]

---

### Opportunity 2: [Name] (HIGH IMPACT)
**Phase:** [Journey phase]
**Pain Point:** [Description]
**Evidence:** [Data/research]
**Proposed Solution:** [How to address]
**Impact:** HIGH — [Rationale]

---

[...continue for all opportunities...]

---

## Next Steps

1. **Validate opportunities:** Use `discovery-interview-prep.md` to test hypotheses with customers
2. **Prioritize fixes:** Use `prioritization-advisor.md` to choose which opportunities to tackle first
3. **Create problem statements:** Use `problem-statement.md` to frame top opportunities
4. **Build experiments:** Use `opportunity-solution-tree.md` to design solutions and POCs

---

**Ready to start addressing opportunities? Let me know if you'd like to refine the map or dive into a specific pain point.**
```

---

## 示例

### 示例 1：优秀的用户旅程图（SaaS 新用户引导）

**问题 1 回答：**“主要用户画像——小企业主”

**问题 2 回答：**“首次使用——新用户引导，从发现到激活”

**问题 3——生成的阶段：**
```
Discover → Evaluate → Try → Activate → Use → Expand
```

**问题 4——阶段 3（试用）映射：**

```
Actions:
- Signs up via Google SSO
- Receives welcome email
- Logs in, sees empty dashboard
- Clicks "Help" button, watches 5-min tutorial
- Attempts to create first project, gets stuck on form

Thoughts:
- "This looks easy enough"
- "Wait, what's a 'workspace' vs. 'project'?"
- "Do I need to fill out all these fields?"

Emotions:
- Excited initially 😊
- Confused by terminology 😕
- Frustrated by unclear form 😞

Pain Points:
- No guided onboarding checklist
- Terminology not explained (workspace vs. project)
- Form has too many required fields upfront
```

**问题 5——识别出的机会：**
1. 添加新用户引导清单（高——影响激活）
2. 简化术语（中——影响理解）
3. 减少表单必填字段（中——影响完成率）

**为什么这样做有效：**
- 情绪与行为清晰地揭示痛点
- 机会与具体阶段相关联
- 有研究证据支持（流失数据、支持工单）

---

### 示例 2：糟糕的用户旅程图（过于笼统）

**阶段：“使用产品”**

**行为：**
- 使用产品
- 执行任务

**想法：**
- “这很好”

**情绪：**
- 开心 😊

**为什么这样做无效：**
- 不够具体（执行什么任务？使用哪些功能？）
- 未识别任何痛点（一切都“很好”）
- 无法提取可执行的机会

**修正方法：**
- 具体描述：“用户创建发票 → 发送给客户 → 跟踪付款状态”
- 加入真实的客户原话：“我希望能批量发送发票”
- 展示情绪高点和低点（而不只是开心）

---

## 常见陷阱

### 陷阱 1：映射内部流程，而非客户体验
**表现：**旅程阶段 = “生成潜在客户 → 确认资质 → 安排演示 → 完成交易”

**后果：**关注的是销售流程，而非客户视角

**修正方法：**从客户视角进行映射：“发现问题 → 研究解决方案 → 试用产品 → 采用产品”

---

### 陷阱 2：没有情绪或痛点
**表现：**旅程图只列出行为，没有想法或情绪

**后果：**偏离了重点——无法识别体验在哪些环节出现问题

**修正方法：**添加客户原话和情绪状态（沮丧、愉悦、困惑）

---

### 陷阱 3：一张图中包含过多用户画像
**表现：**试图在一段旅程中映射“所有用户”

**后果：**失去重点，变得笼统

**修正方法：**每个用户画像使用一张旅程图。如果有多个用户画像，请分别创建旅程图。

---

### 陷阱 4：未对机会进行优先级排序
**表现：**列出 20 个机会，但未进行排序

**后果：**团队无所适从，不知道该从哪里开始

**修正方法：**根据证据和情绪强度，按影响程度（高/中/低）进行排序

---

### 陷阱 5：闭门造车
**表现：**产品经理独自创建旅程图，不让团队参与

**后果：** 缺乏共享的心智模型，地图无法推动决策

**修复方法：** 与跨职能团队（产品经理、设计、工程、支持）共同开展工作坊

---

## 参考资料

### 相关技能
- `customer-journey-map.md` — 包含旅程地图模板的组件技能
- `proto-persona.md` — 定义旅程映射中的角色
- `problem-statement.md` — 将机会转化为问题陈述
- `discovery-interview-prep.md` — 收集用于映射的研究输入
- `opportunity-solution-tree.md` — 针对旅程中的机会设计解决方案

### 外部框架
- Nielsen Norman Group，《Journey Mapping 101》（2016）— 旅程映射的权威指南
- Adaptive Path，《Guide to Experience Mapping》（2013）— 体验地图与旅程地图的对比

### Dean 的工作
- [如果 Dean 有旅程映射相关资源，请在此处添加链接]

---

**技能类型：** 交互式
**建议文件名：** `customer-journey-mapping-workshop.md`
**建议放置位置：** `/skills/interactive/`
**依赖项：** 使用 `customer-journey-map.md`、`proto-persona.md`、`problem-statement.md`、`jobs-to-be-done.md`