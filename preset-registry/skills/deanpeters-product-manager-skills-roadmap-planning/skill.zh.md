---
name: roadmap-planning
argument-hint: "[product and planning horizon]"
description: Plan a strategic roadmap across prioritization, epic definition, stakeholder alignment, and sequencing. Use when turning strategy into a release plan that teams can execute.
intent: >-
  Guide product managers through strategic roadmap planning by orchestrating prioritization, epic definition, stakeholder alignment, and release sequencing skills into a structured process. Use this to move from disconnected feature requests to a cohesive, outcome-driven roadmap that aligns stakeholders, sequences work logically, and communicates strategic intent—avoiding "feature factory" roadmaps that lack strategic narrative or customer-centric framing.
type: workflow
theme: strategy-positioning
best_for:
  - "Building a strategic roadmap that survives exec review"
  - "Prioritizing competing initiatives across multiple teams"
  - "Planning and sequencing work for the next quarter or half-year"
scenarios:
  - "I have 15 competing initiatives and need to build a Q2 roadmap my exec team will actually approve"
  - "I'm planning our 6-month product roadmap and need to sequence work across 3 teams"
estimated_time: "45-90 min"
---
## 目的
通过将优先级排序、Epic 定义、利益相关者对齐和发布排序等技能编排成结构化流程，指导产品经理开展战略路线图规划。使用此流程，将彼此割裂的功能请求转化为一份连贯、以成果为导向的路线图，使利益相关者达成一致，合理安排工作顺序，并传达战略意图——避免形成缺乏战略叙事或以客户为中心的视角的“功能工厂”式路线图。

这不是甘特图，而是一种战略沟通工具，用于展示你正在构建什么、它为何重要，以及它如何逐层支撑业务成果。

## 输入

**最适合提供：** 产品和规划周期（下一季度、下一年度）。
**提供这些也很有帮助：** 需要逐层支撑的战略或 OKR、候选计划列表、团队产能，以及已知的利益相关者压力。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些信息并跳过其已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 工作流会先建立战略背景，然后依次进行优先级排序、Epic 定义和工作排序。

**调用示例：** `Plan a 2-quarter roadmap for our mobile app: here are our 3 OKRs and a list of 12 candidate initiatives.`

## 核心概念

### 什么是战略路线图规划？

路线图规划是以下过程：
1. **收集输入**——客户问题、业务目标、技术约束
2. **定义计划**——制定具有明确假设和成功指标的 Epic
3. **确定优先级**——根据影响、工作量和战略契合度对计划进行排序
4. **安排顺序**——根据合理的依赖关系，将计划组织到不同的发布版本或季度中
5. **沟通传达**——以战略叙事的方式向利益相关者展示路线图

### 路线图的类型

**当前/下一步/未来路线图：**
- **当前：** 当前季度（已承诺）
- **下一步：** 下一季度（高置信度）
- **未来：** 未来探索方向（低置信度）
- **最适合：** 敏捷团队、存在不确定性的场景、持续发现

**主题式路线图：**
- 按战略主题组织（例如，“留存率”“企业市场扩张”“移动端体验”）
- **最适合：** 与高管沟通、展示战略意图

**时间线式路线图（按季度）：**
- Q1：Epic A、B；Q2：Epic C、D；Q3：Epic E、F
- **最适合：** 资源规划、利益相关者沟通

**功能式路线图（反模式）：**
- 列出缺乏上下文的功能（例如，“深色模式”“SSO”“高级报表”）
- **失败原因：** 缺乏战略叙事，也没有围绕客户问题进行表述

### 此方法为何有效
- **以成果为导向：** 将计划与业务成果和客户成果关联起来
- **利益相关者对齐：** 透明的流程可减少政治摩擦
- **战略清晰：** 不仅展示“做什么”，还展示“为什么”
- **灵活：** 根据发现和交付过程中获得的认知进行调整

### 反模式（这不是什么）
- **不是承诺：** 路线图是战略计划，而不是合同
- **不是功能列表：** 路线图描述的是问题，而不只是解决方案
- **不是瀑布式开发：** 路线图会根据获得的认知按季度演进

### 何时使用
- 年度或季度规划周期
- 产品战略会议之后（将战略转化为路线图）
- 新利益相关者加入时（就方向达成一致）
- 重新构建现有路线图时（从功能驱动转向成果驱动）

### 何时不应使用
- 用于战术性冲刺规划时（应改用待办事项列表）
- 战略尚不明确时（先运行 product-strategy-session）
- 利益相关者期望获得日期承诺时（先处理预期）

---

### 引导流程的事实来源

以引导式对话的形式运行此工作流时，请使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文信息倾倒、最佳猜测）
- 每轮只问一个问题，并使用通俗易懂的提示语
- 进度标签（例如，上下文问题 1/8 和评分问题 1/5）
- 中断处理及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文件定义了工作流顺序和特定领域的输出。如有冲突，请遵循本文件的工作流逻辑。

## 应用

使用 `template.md` 获取完整的填空结构。

此工作流在 **1-2 周**内编排 **5 个阶段**，并使用多个组件技能和交互式技能。

---

## 阶段 1：收集输入（第 1-2 天）

**目标：** 收集业务目标、客户问题、技术约束和利益相关者请求。

### 活动

**1. 审查业务目标（OKR、战略计划）**
- **来源：** 公司 OKR、高管战略备忘录、董事会演示文稿
- **问题：**
  - 公司今年最重要的 3 项优先事项是什么？
  - 我们必须推动哪些指标？（收入、留存、获客、效率）
  - 是否存在战略性押注？（新市场、合作伙伴关系、产品线）
- **输出：** 3-5 个需要优化的业务成果

**2. 审查客户问题（探索洞察）**
- **来源：** 探索访谈、支持工单、NPS 反馈、客户流失调查
- **使用：** 来自 `skills/discovery-process/SKILL.md` 的洞察（如果近期已完成）
- **问题：**
  - 最主要的 3-5 个客户痛点是什么？
  - 哪些问题影响的客户最多？
  - 哪些问题的严重程度最高？
- **输出：** 3-5 个经过验证的客户问题

**3. 审查技术约束与机会**
- **来源：** 工程领导团队、技术债评估
- **问题：**
  - 是否存在技术阻碍？（扩展性、性能、安全性）
  - 是否存在能够提供支持的投资？（平台升级、API 重写）
  - 技术路线图是什么？（迁移、弃用）
- **输出：** 所需技术投资列表

**4. 审查利益相关者请求**
- **来源：** 销售、市场营销、客户成功、高管
- **问题：**
  - 销售团队提出了哪些需求？（企业级功能、集成）
  - 市场营销团队提出了哪些请求？（增长计划、市场定位）
  - 客户成功团队标记了哪些问题？（客户流失风险、扩展阻碍）
- **输出：** 利益相关者请求列表（尚未承诺）

### 阶段 1 的产出

- **业务成果：** 3-5 个 OKR 或战略目标
- **客户问题：** 3-5 个经过验证的痛点
- **技术投入：** 平台/技术债事项
- **利益相关者需求：** 内部团队提出的功能需求

---

## 阶段 2：定义计划（Epic）（第 3-4 天）

**目标：** 将输入转化为包含假设、成功指标和工作量估算的 Epic。

### 活动

**1. 定义 Epic 假设**
- **使用：** `skills/epic-hypothesis/SKILL.md`（组件）
- **针对每项计划：** 编写假设陈述
- **格式：** “我们相信，为 [persona] [building X] 将实现 [outcome]，因为 [assumption]。”
- **参与者：** PM
- **时长：** 每个 Epic 60 分钟
- **产出：** 10-15 个 Epic 假设

**Epic 示例（SaaS 产品）：**

```
Epic 1: Guided Onboarding
Hypothesis: We believe that adding a step-by-step onboarding checklist for non-technical users will increase activation rate from 40% to 60% because users currently drop off due to lack of guidance.

Success Metric: Activation rate (% completing first action within 24 hours)
Target: 40% → 60%

Epic 2: Enterprise SSO
Hypothesis: We believe that adding SSO for enterprise accounts will increase enterprise deals closed from 2/quarter to 5/quarter because enterprise buyers require SSO for security compliance.

Success Metric: Enterprise deals closed per quarter
Target: 2 → 5

Epic 3: Mobile-Optimized Workflows
Hypothesis: We believe that optimizing core workflows for mobile will increase mobile DAU from 5% to 20% because mobile-first users currently can't complete workflows on the go.

Success Metric: Mobile DAU as % of total DAU
Target: 5% → 20%
```

**2. 估算工作量（T-Shirt Sizing）**
- **参与者：** PM + 工程负责人
- **时长：** 90 分钟
- **方法：**
  - **小型（S）：** 1-2 周（1-2 名工程师）
  - **中型（M）：** 3-4 周（2-3 名工程师）
  - **大型（L）：** 2-3 个月（3-5 名工程师）
  - **超大型（XL）：** 3 个月以上（5 名以上工程师）
- **产出：** 每个 Epic 的工作量估算

**3. 映射到业务成果**
- **针对每个 Epic：** 标记主要业务成果
- **示例：**
  - Epic 1（引导式入门）→ 留存
  - Epic 2（企业级 SSO）→ 获客（企业）
  - Epic 3（移动端工作流）→ 参与度

### 阶段 2 的产出

- **10-15 个 Epic：** 每个都包含假设、成功指标和工作量估算
- **业务成果映射：** 哪些 Epic 推动哪些 OKR

---

## 阶段 3：确定计划的优先级（第 5 天）

**目标：** 根据影响、工作量和战略契合度对 Epic 进行排序。

### 活动

**1. 选择优先级排序框架**
- **使用：** `skills/prioritization-advisor/SKILL.md`（交互式）
- **参与者：** PM
- **时长：** 30 分钟
- **产出：** 推荐的框架（RICE、ICE、价值/工作量等）

**2. 为 Epic 评分**
- **参与者：** PM、工程负责人、产品领导团队
- **时长：** 120 分钟
- **方法：** 将框架应用于所有 Epic
- **示例（RICE 评分）：**

| Epic | 覆盖范围 | 影响 | 置信度 | 工作量 | RICE 分数 |
|------|-------|--------|------------|--------|------------|
| 引导式入门 | 10,000 名用户 | 3（巨大） | 80% | 1 个月 | 24,000 |
| 企业级 SSO | 500 名用户 | 3（巨大） | 90% | 2 个月 | 675 |
| 移动端工作流 | 5,000 名用户 | 2（高） | 60% | 3 个月 | 2,000 |
| 高级报告 | 2,000 名用户 | 2（高） | 50% | 2 个月 | 1,000 |

**3. 根据战略契合度进行调整**
- **复核评分：** 评分是否与业务目标一致？
- **战略性调整：** 提升与战略押注相符的史诗优先级（即使其评分较低）
- **示例：** 企业级 SSO 的评分较低，但它对企业市场扩张战略至关重要 → 提升优先级

### 阶段 3 的产出

- **已排序的待办列表：** 按优先级排序的史诗（RICE 评分 + 战略性调整）
- **优先级最高的 10 个史诗：** 路线图中优先级最高的计划

---

## 阶段 4：规划路线图顺序（第 6-7 天）

**目标：** 根据逻辑依赖关系，将史诗安排到各季度/版本中。

### 活动

**1. 梳理依赖关系**
- **问题：**
  - Epic B 是否依赖 Epic A？（例如，“高级报告”需要“数据管道升级”）
  - 是否存在技术阻碍？（例如，“移动应用”需要“API 重新设计”）
- **产出：** 依赖关系图（Epic A → Epic B → Epic C）

**2. 按季度（或版本）安排顺序**
- **当前（Q1）：** 优先级最高的 3-5 个史诗，无依赖项
- **接下来（Q2）：** 接下来的 3-5 个史诗，可能依赖 Q1 的完成
- **以后（Q3+）：** 其余史诗，置信度较低

**路线图示例（基于时间线）：**

```
Q1 2026 (Now - Committed):
├─ Guided Onboarding (Retention)
├─ Enterprise SSO (Acquisition)
└─ Mobile-Optimized Workflows (Engagement)

Q2 2026 (Next - High Confidence):
├─ Advanced Reporting (depends on Data Pipeline, Q1)
├─ Slack Integration (Engagement)
└─ Pricing Page Redesign (Acquisition)

Q3 2026 (Later - Lower Confidence):
├─ Mobile App (depends on API Redesign)
├─ AI-Powered Recommendations
└─ Multi-Language Support

Q4 2026 (Exploration):
├─ Marketplace/Plugin Ecosystem
└─ Enterprise Onboarding Concierge
```

**替代方案：当前/接下来/以后路线图**

```
NOW (Current Quarter):
- Guided Onboarding
- Enterprise SSO
- Mobile-Optimized Workflows

NEXT (Following Quarter):
- Advanced Reporting
- Slack Integration
- Pricing Page Redesign

LATER (Future):
- Mobile App
- AI Recommendations
- Multi-Language Support
```

**3. 与工程团队进行验证**
- **参与者：** 产品经理 + 工程负责人
- **问题：**
  - 顺序安排是否现实可行？（产能、依赖关系）
  - 是否存在隐藏的技术阻碍？
  - 是否需要调整范围？
- **产出：** 经过验证的路线图顺序

### 阶段 4 的产出

- **已排序的路线图：** 按 Q1、Q2、Q3 安排的史诗
- **依赖关系图：** 各事项之间的依赖关系
- **产能检查：** 工程团队确认该顺序切实可行

---

## 阶段 5：传达路线图（第 2 周）

**目标：** 向利益相关者展示路线图、收集反馈并建立共识。

### 活动

**1. 制作路线图演示文稿**
- **形式：** 30-45 分钟的演示
- **结构：**
  - **幻灯片 1：** 战略背景（业务目标、客户问题）
  - **幻灯片 2-3：** 路线图概览（Q1、Q2、Q3）
  - **幻灯片 4-6：** 深入介绍每个季度（史诗、假设、成功指标）
  - **幻灯片 7：** 哪些内容**不在**路线图中（以及原因）
  - **幻灯片 8：** 依赖关系和风险
- **参与者：** 产品经理、设计
- **时长：** 准备时间为 2-3 小时

**2. 向利益相关者展示**
- **受众：** 高管、产品领导层、工程、销售、市场营销、客户成功团队
- **时长：** 45 分钟演示 + 15 分钟问答
- **重点：**
  - 战略叙事：“以下是我们优先考虑 X 而非 Y 的原因”
  - 聚焦成果：“每个史诗都会推动[业务成果]”
  - 灵活性：“这份路线图是一项计划，而不是承诺；我们会随着认知的深入进行调整”

**3. 收集反馈**
- **需要提出的问题：**
  - 这些优先级是否与业务目标一致？
  - 我们是否遗漏了关键的客户问题？
  - 依赖关系是否清晰？
  - 你有哪些顾虑？
- **输出：** 反馈、顾虑和问题列表

**4. 完善路线图**
- **根据反馈：** 调整优先级、添加遗漏的史诗、明确依赖关系
- **耗时：** 1-2 天
- **输出：** 最终路线图 v1.0

**5. 发布路线图**
- **内部：** 与团队共享（Confluence、Notion、Productboard 等）
- **外部（可选）：** 面向客户的公开路线图（使用 Now/Next/Later 格式）
- **形式：** 可视化路线图 + 叙述性文档

### 阶段 5 的产出

- **路线图演示：** 30-45 分钟的演示文稿
- **利益相关者达成一致：** 已采纳反馈，并解决相关顾虑
- **已发布的路线图：** 团队（内部）或客户（外部）可访问

---

## 完整工作流：端到端总结

```
Week 1:
├─ Day 1-2: Gather Inputs
│  ├─ Review business goals (OKRs)
│  ├─ Review customer problems (discovery insights)
│  ├─ Review technical constraints
│  └─ Review stakeholder requests
│
├─ Day 3-4: Define Initiatives (Epics)
│  ├─ skills/epic-hypothesis/SKILL.md (60 min per epic)
│  ├─ Estimate effort (90 min)
│  └─ Map to business outcomes
│
├─ Day 5: Prioritize Initiatives
│  ├─ skills/prioritization-advisor/SKILL.md (30 min)
│  ├─ Score epics (120 min)
│  └─ Adjust for strategic fit
│
└─ Day 6-7: Sequence Roadmap
   ├─ Map dependencies
   ├─ Sequence by quarter (Q1, Q2, Q3)
   └─ Validate with engineering

Week 2:
└─ Communicate Roadmap
   ├─ Create presentation (2-3 hours)
   ├─ Present to stakeholders (60 min)
   ├─ Gather feedback
   ├─ Refine roadmap (1-2 days)
   └─ Publish roadmap
```

**总时间投入：**
- **快速通道：** 1 周（已有史诗、快速达成一致）
- **典型情况：** 1.5-2 周（定义史诗、利益相关者评审）

---

## 示例

完整的路线图示例请参阅 `examples/sample.md`。

小型示例摘录：

```markdown
Now: Guided onboarding (activation +20%)
Next: Enterprise SSO (deal velocity)
Later: Mobile workflows (DAU lift)
```

## 常见陷阱

### 陷阱 1：功能驱动的路线图（无成果）
**症状：** 路线图只列出功能（“深色模式”“SSO”“高级筛选器”），没有任何背景信息

**后果：** 缺乏清晰的战略，利益相关者不理解“为什么”

**解决方法：** 将史诗表述为带有成功指标的假设（而不仅仅是功能名称）

---

### 陷阱 2：根据 HiPPO（最高薪人士的意见）确定优先级
**症状：** 高管决定路线图，没有数据驱动的优先级排序

**后果：** 构建错误的产品，忽视客户问题

**解决方法：** 使用优先级排序框架（RICE、ICE）对史诗进行透明评分

---

### 陷阱 3：将路线图视为承诺（瀑布式思维）
**症状：** 将路线图视为合同，没有调整的灵活性

**后果：** 在获得新信息时无法转向

**解决方法：** 将路线图表述为“战略计划，可根据学习成果进行调整”

---

### 陷阱 4：未梳理依赖关系
**症状：** 在未检查技术依赖关系的情况下安排史诗顺序

**后果：** 由于 Q1 的依赖项未能完成，Q2 史诗被阻塞

**修复：** 在阶段 4 中明确梳理依赖关系，并与工程团队确认

---

### 陷阱 5：产品经理独自制定路线图（无利益相关者参与）
**症状：** 产品经理独自创建路线图，然后展示已完成的计划

**后果：** 无法获得认同，利益相关者感到自己被排除在外

**修复：** 在阶段 1 中收集所有利益相关者的意见，并在阶段 5 中展示草案以获取反馈

---

## 参考资料

### 相关 Skill（由此工作流编排）

**阶段 2：**
- `skills/epic-hypothesis/SKILL.md`（组件）

**阶段 3：**
- `skills/prioritization-advisor/SKILL.md`（交互式）

**阶段 4：**
- （手动梳理依赖关系，无特定 Skill）

**阶段 5：**
- （手动创建演示文稿，无特定 Skill）

**可选/相关：**
- `skills/product-strategy-session/SKILL.md`（工作流）— 在规划路线图之前运行，以制定战略
- `skills/discovery-process/SKILL.md`（工作流）— 为阶段 1 提供客户问题输入
- `skills/user-story-mapping-workshop/SKILL.md`（交互式）— 适用于需要发布规划的复杂史诗

### 外部框架
- Bruce McCarthy，*Product Roadmaps Relaunched*（2017）— 成果驱动型路线图
- C. Todd Lombardo，*Product Roadmaps Relaunched*（2017）— Now/Next/Later 框架
- Intercom，"RICE Prioritization"（2016）— 优先级排序框架

### Dean 的工作
- [如果 Dean 有路线图规划资源，请在此处添加链接]

---

**Skill 类型：** 工作流
**建议的文件名：** `roadmap-planning.md`
**建议的存放位置：** `/skills/workflows/`
**依赖项：** 编排 `skills/epic-hypothesis/SKILL.md`、`skills/prioritization-advisor/SKILL.md`，以及手动活动