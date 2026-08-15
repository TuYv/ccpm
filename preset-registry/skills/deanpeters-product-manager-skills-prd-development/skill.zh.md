---
name: prd-development
argument-hint: "[feature or initiative]"
description: Build a structured PRD that connects problem, users, solution, and success criteria. Use when turning discovery notes into an engineering-ready document for a major initiative.
intent: >-
  Guide product managers through structured PRD (Product Requirements Document) creation by orchestrating problem framing, user research synthesis, solution definition, and success criteria into a cohesive document. Use this to move from scattered notes and Slack threads to a clear, comprehensive PRD that aligns stakeholders, provides engineering context, and serves as a source of truth—avoiding ambiguity, scope creep, and the "build what's in my head" trap.
type: workflow
theme: pm-artifacts
best_for:
  - "Writing a complete PRD from scratch"
  - "Structuring product requirements for an engineering handoff"
  - "Documenting a major new feature before development begins"
scenarios:
  - "I need a PRD for a new AI-powered recommendation feature in our e-commerce platform"
  - "I've completed a discovery sprint and need to turn the findings into a PRD my engineers can act on"
estimated_time: "60-120 min"
---
## 目的
通过协调问题框定、用户研究综合、解决方案定义和成功标准，引导产品经理以结构化方式创建 PRD（产品需求文档），并将这些内容整合成一份连贯的文档。使用此技能，可以将零散的笔记和 Slack 讨论串转化为清晰、全面的 PRD，从而使利益相关方达成一致，为工程团队提供背景信息，并将其作为唯一事实来源——避免歧义、范围蔓延以及“把我脑子里想的东西做出来”的陷阱。

这不是一份瀑布式规格说明——而是一份动态文档，用于记录战略背景、客户问题、拟议解决方案和成功标准，并随着你在交付过程中不断学习而持续演进。

## 输入

**最适合提供：** PRD 所涵盖的功能或计划。
**同样有用：** 探索笔记、问题陈述、用户研究、成功指标和约束条件——粘贴任何已有内容；工作流会将其归入正确的阶段，并跳过已经回答的内容。

调用时提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容并跳过其已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 工作流会从问题定义开始，并由此逐步构建。

**调用示例：** `为自助式工作区配置构建一份 PRD——以下是我的探索笔记及其所支撑的 OKR。`

## 核心概念

### 什么是 PRD？

PRD（产品需求文档）是一份结构化文档，用于回答：
1. **我们要解决什么问题？**（问题陈述）
2. **为谁解决？**（目标用户/用户画像）
3. **为什么是现在？**（战略背景、商业论证）
4. **我们要构建什么？**（解决方案概述）
5. **我们将如何衡量成功？**（指标、成功标准）
6. **具体需求是什么？**（用户故事、验收标准、约束条件）
7. **我们不构建什么？**（范围之外）

### PRD 结构（标准模板）

```markdown
# [Feature/Product Name] PRD

## 1. Executive Summary
- One-paragraph overview (problem + solution + impact)

## 2. Problem Statement
- Who has this problem?
- What is the problem?
- Why is it painful?
- Evidence (customer quotes, data, research)

## 3. Target Users & Personas
- Primary persona(s)
- Secondary persona(s)
- Jobs-to-be-done

## 4. Strategic Context
- Business goals (OKRs)
- Market opportunity (TAM/SAM/SOM)
- Competitive landscape
- Why now?

## 5. Solution Overview
- High-level description
- User flows or wireframes
- Key features

## 6. Success Metrics
- Primary metric (what we're optimizing for)
- Secondary metrics
- Targets (current → goal)

## 7. User Stories & Requirements
- Epic hypothesis
- User stories with acceptance criteria
- Edge cases, constraints

## 8. Out of Scope
- What we're NOT building (and why)

## 9. Dependencies & Risks
- Technical dependencies
- External dependencies (integrations, partnerships)
- Risks and mitigations

## 10. Open Questions
- Unresolved decisions
- Areas requiring discovery
```

### 为什么这样有效
- **目标一致：** 确保每个人（产品经理、设计、工程和利益相关者）都理解“为什么”
- **保留上下文：** 记录研究成果和战略依据，以供将来参考
- **决策日志：** 记录范围内事项、范围外事项及其原因
- **明确执行：** 为工程团队提供用户故事和验收标准

### 反模式（这不是什么）
- **不是详细规格说明：** PRD 用于界定问题和解决方案，而不是逐像素规定 UI
- **不是瀑布式流程：** PRD 会随着认知的深入而演变，并非一成不变的合同
- **不是协作的替代品：** PRD 是对沟通的补充，而不是取代沟通

### 何时使用
- 启动重大功能或产品计划时
- 需要跨职能团队就范围和需求达成一致时
- 需要记录决策以供将来参考时
- 帮助新团队成员熟悉项目时

### 何时不应使用
- 小型缺陷修复或简单功能（过度设计）
- 问题和解决方案已经明确并达成一致时（只需编写用户故事）
- 持续发现实验（改用精益用户体验画布）

---

### 引导流程的唯一事实来源

以引导式对话运行此工作流时，请使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

它定义了：
- 会话预告和进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只问一个问题，并使用通俗易懂的提示语
- 进度标签（例如，上下文 Qx/8 和评分 Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文档定义工作流顺序和特定领域的输出。如有冲突，请遵循本文档的工作流逻辑。

## 应用

使用 `template.md` 作为待填写文档。该模板包括：

- **分节指导区块** —— 每个章节都有各自的说明、步骤、辅助技能和活动，因此即使没有此工作流，模板本身也能提供引导。
- **内联缺口标记** —— 将每个缺口标记为 🔶 **假设**（合理但尚未验证）或 🔵 **开放问题**（未知，需要探索）。在缺口出现的位置进行内联标记，而不是仅在末尾标记。
- **跨章节建议提示** —— 完成每个章节后，“继续之前”区块会检查该章节与之前章节的一致性，并提醒下一章节所需的内容。
- **自我评估** —— 完成第 10 节后，通过诊断记录最完善的章节、最薄弱的章节、最需要验证的假设，以及分享 PRD 前建议采取的下一步行动。
- **技能交叉引用表** —— 将 15 项技能映射到它们所支持的具体章节（例如，`problem-framing-canvas` → 第 2 节，`epic-breakdown-advisor` → 第 7 节）。

此工作流在 **2-4 天**内编排 **8 个阶段**，并使用多个组件技能和交互式技能。以下阶段描述了引导顺序；模板则用于记录输出。

---

## 阶段 1：执行摘要（30 分钟）

**目标：** 为快速浏览的读者撰写一段概述。

### 活动

**1. 起草执行摘要**
- **格式：** “我们正在为[用户角色]构建[解决方案]，以解决[问题]，从而实现[影响]。”
- **示例：**
  > “我们正在为不具备技术背景的小企业主构建一份引导式入门清单，以解决由于缺乏指导而导致 60% 的用户在最初 24 小时内流失的问题，从而将激活率从 40% 提高到 60%，并将客户流失率降低 10%。”

- **参与者：** PM
- **时长：** 30 分钟
- **产出：** 一段摘要

**提示：** 先撰写这一部分（以明确思路），但最后再完善它（在其他部分完成之后）。

---

## 阶段 2：问题陈述（60 分钟）

**目标：** 用证据界定客户问题。

### 活动

**1. 撰写问题陈述**
- **使用：** `skills/problem-statement/SKILL.md`（组件）
- **输入：** 来自 `skills/discovery-process/SKILL.md` 或 `skills/problem-framing-canvas/SKILL.md` 的探索洞察
- **参与者：** PM
- **时长：** 30 分钟
- **产出：** 结构化问题陈述

**问题陈述示例：**

```markdown
## 2. Problem Statement

### Who has this problem?
Non-technical small business owners (solopreneurs, 1-10 employees) who sign up for our SaaS product.

### What is the problem?
60% of users abandon onboarding within the first 24 hours because they don't know what to do first. They see an empty dashboard with no guidance, get overwhelmed by options, and leave.

### Why is it painful?
- **User impact:** Wastes time (30-60 min trying to figure out product), never reaches "aha moment," churns before experiencing value
- **Business impact:** 60% activation rate → high churn, low LTV, poor word-of-mouth

### Evidence
- **Interviews:** 8/10 churned users said "I didn't know what to do first" (discovery interviews, Feb 2026)
- **Analytics:** 60% of signups complete 0 actions within 24 hours (Mixpanel, Jan 2026)
- **Support tickets:** "How do I get started?" is #1 support question (350 tickets/month)
- **Customer quote:** "I logged in, saw an empty dashboard, and thought 'now what?' I gave up and went back to my spreadsheet."
```

**2. 添加支持性背景信息（可选）**
- **客户旅程地图：** 如果问题涉及多个接触点
- **使用：** `skills/customer-journey-mapping-workshop/SKILL.md` 的产出
- **待办任务：** 如果动机是关键因素
- **使用：** `skills/jobs-to-be-done/SKILL.md` 的产出

### 阶段 2 的产出

- **问题陈述：** 谁、什么、为什么、证据
- **支持性材料：** 旅程地图、JTBD（如适用）

---

## 阶段 3：目标用户与用户画像（30 分钟）

**目标：** 明确你要为谁构建产品。

### 活动

**1. 记录用户画像**
- **使用：** `skills/proto-persona/SKILL.md`（组件）的产出
- **参与者：** PM
- **时长：** 30 分钟
- **格式：** 包括用户画像名称、角色、目标、痛点和行为

**示例：**

```markdown
## 3. Target Users & Personas

### Primary Persona: Solo Entrepreneur Sam
- **Role:** Freelance consultant, solopreneur
- **Company size:** 1 person (no IT support)
- **Tech savviness:** Low (uses email, spreadsheets, basic SaaS)
- **Goals:** Get value from software fast without technical expertise
- **Pain points:** Overwhelmed by complex UIs, no time to watch tutorials, needs immediate value
- **Current behavior:** Signs up for products, tries for 1 day, churns if not immediately useful

### Secondary Persona: Small Business Owner (5-10 employees)
- **Role:** Owner-operator, manages team
- **Needs:** Onboard team members quickly
- **Differs from primary:** More tolerant of complexity, willing to invest setup time
```

### 阶段 3 的产出

- **主要用户画像：** 详细档案
- **次要用户画像：**（如适用）

---

## 阶段 4：战略背景（45 分钟）

**目标：** 说明为什么这对业务很重要，以及为什么是现在。

### 活动

**1. 记录业务目标**
- **来源：** 公司 OKR、战略备忘录、路线图
- **格式：** 将功能与业务成果关联起来
- **示例：**
  > “该计划支持我们的第一季度 OKR：将客户流失率从 15% 降至 8%。提高引导流程的激活率会直接改善留存率。”

**2. 估算市场机会（可选）**
- **使用：** `skills/tam-sam-som-calculator/SKILL.md`（交互式）的输出
- **适用场景：** 重大计划、新产品、高管演示
- **示例：**
  > “TAM：全球 5000 万家小型企业。SAM：500 万家使用 SaaS 工具的企业。SOM：目标细分市场中的 50 万名个体创业者。改善引导流程可以帮助我们触达 SAM 的 30%（即 150 万潜在客户）。”

**3. 记录竞争格局（可选）**
- **来源：** 竞品研究、G2/Capterra 评价
- **示例：**
  > “竞争对手（竞品 A、B）均提供引导式上手流程。退出调查显示，我们缺少引导是导致客户流失的原因之一。”

**4. 解释“为什么是现在？”**
- **理由：** 为什么现在应优先处理，而不是以后？
- **示例：**
  > “第四季度的客户流失率飙升至 15%。引导流程是首要驱动因素（60% 的客户流失发生在前 30 天）。解决这个问题对于达成留存率 OKR 至关重要。”

### 阶段 4 的产出

- **业务目标：** OKR 或战略计划
- **市场机会：** TAM/SAM/SOM（如适用）
- **竞争背景：** 竞争对手如何解决这一问题
- **为什么是现在：** 紧迫性理由

---

## 阶段 5：解决方案概述（60 分钟）

**目标：** 描述要构建的内容（高层次描述，而非详细规格）。

### 活动

**1. 编写解决方案描述**
- **格式：** 高层次概述，2～3 段
- **示例：**

```markdown
## 5. Solution Overview

We're building a **guided onboarding checklist** that walks new users through core workflows step-by-step when they first log in.

**How it works:**
1. User signs up and logs in for the first time
2. Modal appears: "Let's get you set up! Complete these 3 steps to get started."
3. Checklist shows:
   - ☐ Create your first project
   - ☐ Invite a teammate (optional)
   - ☐ Complete a sample task
4. As user completes each step, checklist updates with checkmarks
5. After completion, celebration modal: "You're all set! Here's what to do next."

**Key features:**
- Minimal: Only 3 core steps (not overwhelming)
- Dismissible: Users can skip if they prefer to explore
- Progress tracking: Visual progress bar (1/3, 2/3, 3/3)
- Celebration: Positive reinforcement when complete
```

**2. 添加用户流程或线框图（可选）**
- **使用：** 设计工具（Figma、Sketch）或手绘草图
- **适用场景：** 需要通过视觉方式解释的复杂功能
- **产出：** 嵌入 PRD 或提供链接

**3. 引用故事地图（可选）**
- **使用：** `skills/user-story-mapping-workshop/SKILL.md` 的输出
- **适用场景：** 包含多个发布切片的复杂功能
- **产出：** 故事地图链接

### 阶段 5 的产出

- **解决方案描述：** 高层级概述
- **用户流程/线框图：**（如适用）
- **故事地图：**（如适用）

---

## 阶段 6：成功指标（30 分钟）

**目标：** 定义如何衡量成功。

### 活动

**1. 定义主要指标**
- **问题：** 此功能必须推动哪一个唯一指标？
- **示例：**“激活率（在 24 小时内完成首次操作的用户百分比）”
- **目标：**“从 40% 提升至 60%”

**2. 定义次要指标**
- **问题：** 还应监控哪些指标（但不以其为优化目标）？
- **示例：**
  - 首次操作耗时（从 3 天缩短至 1 天）
  - 新手引导清单完成率（目标：80%）
  - 支持工单量（将“如何开始使用？”类工单减少 50%）

**3. 定义护栏指标**
- **问题：** 哪些指标不应变差？
- **示例：**“注册转化率（不要给注册流程增加阻力）”

**示例：**

```markdown
## 6. Success Metrics

### Primary Metric
**Activation rate** (% of users completing first action within 24 hours)
- **Current:** 40%
- **Target:** 60%
- **Timeline:** Measure 30 days after launch

### Secondary Metrics
- **Time-to-first-action:** Reduce from 3 days to 1 day
- **Onboarding checklist completion rate:** 80% of users complete all 3 steps
- **Support tickets:** Reduce "How do I get started?" tickets from 350/month to 175/month

### Guardrail Metrics
- **Sign-up conversion rate:** Maintain at 10% (don't add friction to signup)
```

### 阶段 6 的产出

- **主要指标：** 你要优化的指标
- **次要指标：** 其他成功指标
- **护栏指标：** 不应退化的指标

---

## 阶段 7：用户故事与需求（90-120 分钟）

**目标：** 将解决方案拆分为带有验收标准的用户故事。

### 活动

**1. 编写 Epic 假设**
- **使用：** `skills/epic-hypothesis/SKILL.md`（组件）
- **参与者：** 产品经理
- **时长：** 30 分钟
- **产出：** Epic 假设陈述

**示例：**
> “我们相信，为非技术用户添加引导式新手清单，将使激活率从 40% 提升至 60%，因为用户目前会因缺少引导而流失。我们将通过发布 30 天后的激活率来衡量成功。”

**2. 将 Epic 拆分为用户故事**
- **使用：** `skills/epic-breakdown-advisor/SKILL.md`（交互式——采用 Richard Lawrence 的 9 种模式）
- **参与者：** 产品经理、设计、工程
- **时长：** 90 分钟
- **产出：** 按不同模式（工作流、CRUD、业务规则等）拆分的用户故事

**3. 编写用户故事**
- **使用：** `skills/user-story/SKILL.md`（组件）
- **参与者：** 产品经理
- **时长：** 每个故事 30 分钟
- **格式：** 用户故事 + 验收标准

**用户故事示例：**

```markdown
## 7. User Stories & Requirements

### Epic Hypothesis
We believe that adding a guided onboarding checklist for non-technical users will increase activation rate from 40% to 60% because users currently drop off due to lack of guidance.

### User Stories

**Story 1: Display onboarding checklist on first login**
As a new user, I want to see a guided checklist when I first log in, so I know what to do first.

**Acceptance Criteria:**
- [ ] When user logs in for the first time, modal appears with checklist
- [ ] Checklist shows 3 steps: "Create project," "Invite teammate," "Complete task"
- [ ] Modal is dismissible (close button)
- [ ] If dismissed, checklist doesn't reappear (user preference saved)

**Story 2: Track checklist progress**
As a new user, I want to see my progress as I complete checklist steps, so I feel a sense of accomplishment.

**Acceptance Criteria:**
- [ ] When user completes step 1, checkmark appears next to "Create project"
- [ ] Progress bar updates (1/3 → 2/3 → 3/3)
- [ ] Checklist persists across sessions (if user logs out and back in)

**Story 3: Celebrate checklist completion**
As a new user, I want to receive positive feedback when I complete the checklist, so I feel confident using the product.

**Acceptance Criteria:**
- [ ] When user completes all 3 steps, celebration modal appears
- [ ] Message: "You're all set! Here's what to do next: [suggested next actions]"
- [ ] Confetti animation (optional, nice-to-have)
```

**4. 记录约束与边界情况**
- **技术约束：** 平台限制、浏览器支持等。
- **边界情况：** 如果用户跳过第 2 步会怎样？如果他们不按顺序完成步骤会怎样？

### 阶段 7 的产出

- **Epic 假设：** 可测试的陈述
- **用户故事：** 3-10 个带有验收标准的故事
- **约束：** 技术限制、边界情况

---

## 阶段 8：范围之外与依赖项（30 分钟）

**目标：** 明确定义你不构建什么，以及你依赖什么。

### 活动

**1. 记录范围之外的内容**
- **格式：** 列出明确排除的功能/请求
- **理由：** 为什么现在不构建？

**示例：**

```markdown
## 8. Out of Scope

**Not included in this release:**
- **Advanced onboarding personalization** (e.g., different checklists per persona) — Adds complexity, test simple version first
- **Video tutorials embedded in checklist** — Resource-intensive, validate checklist concept first
- **Gamification (badges, points)** — Nice-to-have, focus on core workflow guidance

**Future consideration:**
- Mobile-optimized onboarding (desktop-first for now)
```

**2. 记录依赖项**
- **技术依赖项：** 所需的平台升级、API 变更
- **外部依赖项：** 第三方集成、合作伙伴关系
- **团队依赖项：** 设计交付、数据管道工作

**示例：**

```markdown
## 9. Dependencies & Risks

### Dependencies
- **Design:** Wireframes for checklist UI (ETA: Week 1)
- **Engineering:** No technical dependencies (uses existing modals framework)

### Risks & Mitigations
- **Risk:** Users dismiss checklist immediately, never see it
  - **Mitigation:** Track dismissal rate; if >50%, iterate on messaging or timing
- **Risk:** Checklist steps are too generic, don't resonate with all personas
  - **Mitigation:** Start with primary persona (Solo Entrepreneur Sam), personalize later
```

**3. 记录待解决问题**
- **尚未解决的决策：** 需要探索或讨论的领域

**示例：**

```markdown
## 10. Open Questions

- Should checklist be mandatory or optional? (Decision: Optional, dismissible)
- Should we A/B test checklist vs. no checklist? (Decision: Yes, show to 50% of new users)
- What happens if user completes steps out of order? (Decision: Allow any order, update checklist dynamically)
```

### 阶段 8 的产出

- **范围之外：** 我们不构建什么
- **依赖项：** 开始之前需要什么
- **风险：** 潜在阻碍因素和缓解措施
- **待解决问题：** 尚未解决的决策

---

## 完整工作流：端到端总结

```
Day 1:
├─ Phase 1: Executive Summary (30 min)
├─ Phase 2: Problem Statement (60 min)
│  └─ Use: skills/problem-statement/SKILL.md
├─ Phase 3: Target Users & Personas (30 min)
│  └─ Use: skills/proto-persona/SKILL.md
└─ Phase 4: Strategic Context (45 min)
   └─ Use: skills/tam-sam-som-calculator/SKILL.md (optional)

Day 2:
├─ Phase 5: Solution Overview (60 min)
│  └─ Use: skills/user-story-mapping-workshop/SKILL.md (optional)
├─ Phase 6: Success Metrics (30 min)
└─ Phase 7: User Stories & Requirements (90-120 min)
   ├─ Use: skills/epic-hypothesis/SKILL.md
   ├─ Use: skills/epic-breakdown-advisor/SKILL.md
   └─ Use: skills/user-story/SKILL.md

Day 3:
├─ Phase 8: Out of Scope & Dependencies (30 min)
└─ Review & Refine (60 min)
   └─ Read full PRD, polish, get feedback

Day 4 (Optional):
└─ Stakeholder Review & Approval
   └─ Present PRD to stakeholders, incorporate feedback
```

**总时间投入：**
- **快速路径：** 1.5-2 天（功能较简单，需求明确）
- **典型情况：** 2-3 天（包括调研结果综合和利益相关者评审）
- **复杂情况：** 3-4 天（重大项目、多个用户画像、大量用户故事）

---

## 示例

完整 PRD 示例请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
## 2. Problem Statement
- 60% of trial users drop off in first 24 hours
## 6. Success Metrics
- Activation rate: 40% → 60%
```

## 常见陷阱

### 陷阱 1：独自编写 PRD
**表现：** PM 独自编写 PRD，然后向团队展示完成的文档

**后果：** 团队缺乏认同，也不了解背后的理由

**解决方法：** 在阶段 7（用户故事）中与设计和工程团队协作；在最终定稿前评审 PRD 草稿

---

### 陷阱 2：问题陈述中没有证据
**表现：** “我们认为用户存在这个问题”（没有数据，也没有引述）

**后果：** 团队会质疑问题是否真实存在

**解决方法：** 使用 `skills/discovery-process/SKILL.md` 中的调研洞察；包括客户引述、分析数据和支持工单

---

### 陷阱 3：解决方案规定得过于具体
**表现：** PRD 规定了确切的 UI、像素尺寸和按钮颜色

**后果：** 排除了设计协作，变成瀑布式规格说明

**解决方法：** 阶段 5 保持高层次描述；让设计团队负责 UI 细节

---

### 陷阱 4：没有成功指标
**表现：** PRD 定义了问题和解决方案，但没有指标

**后果：** 无法验证功能是否成功

**解决方法：** 始终在阶段 6 中定义主要指标（即你要优化的目标）

---

### 陷阱 5：未记录范围之外的内容
**表现：** 没有说明哪些内容不会构建的章节

**后果：** 范围蔓延，利益相关者期待未规划的功能

**解决方法：** 在阶段 8 中明确记录范围之外的内容

---

## 参考资料

### 相关技能（由此工作流编排）

**阶段 2：**
- `skills/problem-statement/SKILL.md`（组件）
- `skills/problem-framing-canvas/SKILL.md`（交互式，用于梳理背景）
- `skills/customer-journey-mapping-workshop/SKILL.md`（交互式，可选）

**阶段 3：**
- `skills/proto-persona/SKILL.md`（组件）
- `skills/jobs-to-be-done/SKILL.md`（组件，可选）

**阶段 4：**
- `skills/tam-sam-som-calculator/SKILL.md`（交互式，可选）

**阶段 5：**
- `skills/user-story-mapping-workshop/SKILL.md`（交互式，可选）

**阶段 7：**
- `skills/epic-hypothesis/SKILL.md`（组件）
- `skills/epic-breakdown-advisor/SKILL.md`（交互式）
- `skills/user-story/SKILL.md`（组件）

### 外部框架
- Martin Eriksson，《如何编写优秀的 PRD》（2012）— PRD 结构
- Marty Cagan，*Inspired*（2017）— 产品规格原则
- Amazon，“逆向工作法”（PR/FAQ 格式）— PRD 的替代方案

### Dean 的工作
- [如果 Dean 有 PRD 模板，请在此处添加链接]

---

**技能类型：** 工作流
**建议文件名：** `prd-development.md`
**建议放置位置：** `/skills/workflows/`
**依赖项：** 跨 8 个阶段编排 8 个以上的组件技能和交互式技能