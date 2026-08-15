---
name: product-strategy-session
argument-hint: "[product or strategic question]"
description: Run an end-to-end product strategy session across positioning, discovery, and roadmap planning. Use when a team needs validated direction before committing to execution.
intent: >-
  Guide product managers through a comprehensive product strategy session by orchestrating positioning, problem framing, customer discovery, and roadmap planning skills into a cohesive end-to-end process. Use this to move from vague strategic direction to concrete, validated product strategy with clear positioning, target customers, problem statements, and prioritized roadmap—ensuring alignment across stakeholders before committing to execution.
type: workflow
theme: strategy-positioning
best_for:
  - "Running a full strategy arc from positioning through roadmap"
  - "Giving a team validated direction instead of a feature list"
  - "Aligning leadership on where the product is going and why"
scenarios:
  - "Our team has a backlog but no direction and leadership wants a strategy"
  - "We need to go from positioning through discovery to a roadmap people believe"
estimated_time: "2-4 weeks"
---
## 目的
通过协调定位、问题界定、客户发现和路线图规划等技能，引导产品经理完成一次全面的产品战略研讨，将其整合为连贯的端到端流程。使用此流程，可将模糊的战略方向转化为具体、经过验证的产品战略，明确产品定位、目标客户、问题陈述和优先级路线图，并确保各利益相关方在投入执行前达成一致。

这不是一次性的研讨会，而是一个用于制定或刷新产品战略的可重复流程，通常持续 2-4 周，并包含多次沟通接触。

## 输入

**最适合提供：** 产品（或产品线），以及促使开展本次研讨的战略问题。
**同样有用：** 现有定位、发现阶段产出、路线图草案，以及需要就最终结果达成一致的人员。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容并跳过其已涵盖的问题；不要重复询问。

**两手空空地开始？也没问题。** 工作流会从定位入手，并从那里开始协调各个阶段——如果提供了相关产出物，则可以直接跳到后续阶段。

**调用示例：** `Run a strategy session for our analytics add-on: flat adoption, two competing roadmap visions, exec review in 4 weeks.`

## 核心概念

### 什么是产品战略研讨？

产品战略研讨是一个结构化的多阶段流程，旨在帮助产品从战略模糊走向经过验证的明确方向。它协调以下环节：

1. **定位与市场背景** — 明确服务对象、解决的问题以及差异化优势
2. **问题发现与验证** — 通过研究界定并验证客户问题
3. **解决方案探索** — 生成机会解决方案，并根据影响力确定优先级
4. **路线图规划** — 根据战略安排史诗任务和发布版本的先后顺序

### 这种方法为何有效
- **结构化发现：** 避免在理解问题之前就急于提出解决方案
- **利益相关方对齐：** 在高管、产品、设计和工程团队之间建立共同的心智模型
- **经过验证的战略：** 在投入资源前验证各项假设
- **可执行的路线图：** 将高层战略与具体工作衔接起来

### 反模式（这不是什么）
- **不是功能头脑风暴：** 战略研讨旨在界定问题，而不仅仅是罗列功能
- **不是瀑布式规划：** 流程中包含反馈循环和迭代
- **不是产品经理的单打独斗：** 需要跨职能人员参与

### 何时使用
- 推出新产品或重大举措时
- 年度或季度战略规划周期
- 重新定位现有产品
- 新任产品负责人入职时（就战略达成一致）

### 何时不应使用
- 战略已经清晰且经过验证时
- 战术性功能添加（不需要战略调整）
- 缺乏高管支持时（战略将难以落地）

---

### 研讨引导的唯一事实来源

以引导式对话运行此工作流时，请使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

该协议定义了：
- 会话预告 + 进入模式（引导式、上下文转储、最佳推测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如，上下文 Qx/8 和评分 Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文件定义工作流顺序和特定领域的输出。如有冲突，请遵循本文件的工作流逻辑。

## 应用

使用 `template.md` 获取完整的填充式结构。

此工作流在 **2-4 周**内编排 **6 个阶段**，并使用多个组件式和交互式 Skill。

---

## 阶段 1：定位与市场背景（第 1 周，第 1-2 天）

**目标：** 明确目标客户、问题空间和差异化优势。

### 活动

**1. 开展定位研讨会**
- **使用：** `skills/positioning-workshop/SKILL.md`（交互式）
- **参与者：** 产品经理、产品领导层、市场营销、销售
- **时长：** 90 分钟
- **输出：** 定位陈述草案

**2. 定义原型用户画像**
- **使用：** `skills/proto-persona/SKILL.md`（组件式）
- **参与者：** 产品经理、设计、面向客户的团队
- **时长：** 60 分钟
- **输出：** 1-3 个原型用户画像（由假设驱动）

**3. 梳理待办任务**
- **使用：** `skills/jobs-to-be-done/SKILL.md`（组件式）
- **参与者：** 产品经理、设计
- **时长：** 60 分钟
- **输出：** 每个用户画像对应的 JTBD 陈述

### 决策点 1：我们是否掌握了足够的客户背景信息？

**如果是：** 进入阶段 2（问题界定）

**如果否：** 开展额外的探索：
- **使用：** `skills/discovery-interview-prep/SKILL.md`（交互式）
- 安排 5-10 次客户访谈
- 在继续推进之前验证定位假设
- **时间影响：** +1 周

---

## 阶段 2：问题界定与验证（第 1 周，第 3-5 天）

**目标：** 界定核心客户问题，并验证该问题是否值得解决。

### 活动

**1. 开展问题界定画布研讨**
- **使用：** `skills/problem-framing-canvas/SKILL.md`（交互式 - MITRE）
- **参与者：** 产品经理、设计、工程负责人、客户成功
- **时长：** 120 分钟
- **输出：** 完善后的问题陈述 + “我们如何能够”问题

**2. 创建正式的问题陈述**
- **使用：** `skills/problem-statement/SKILL.md`（组件式）
- **参与者：** 产品经理
- **时长：** 30 分钟
- **输出：** 用于 PRD/路线图的结构化问题陈述

**3. 绘制客户旅程图（可选）**
- **使用：** `skills/customer-journey-mapping-workshop/SKILL.md`（交互式）
- **使用时机：** 如果问题跨越多个接触点或阶段
- **参与者：** 产品经理、设计、客户成功
- **时长：** 90 分钟
- **输出：** 标注痛点和机会的旅程图

### 决策点 2：问题是否已得到验证？

**如果是：** 进入阶段 3（解决方案探索）

**如果否：** 开展客户探索访谈：
- **使用：** `skills/discovery-interview-prep/SKILL.md`（交互式）
- 与 5-10 位客户验证问题假设
- 根据调研结果迭代问题陈述
- **时间影响：** +1 周

---

## 阶段 3：解决方案探索（第 2 周，第 1-3 天）

**目标：** 生成解决方案选项，根据可行性和影响进行优先级排序，并选择 POC。

### 活动

**1. 创建机会解决方案树**
- **使用：** `skills/opportunity-solution-tree/SKILL.md`（交互式）
- **参与者：** 产品经理、设计师、工程负责人
- **时长：** 90 分钟
- **产出：** 3 个机会、每个机会对应 3 个解决方案，以及 POC 建议

**替代方案：使用精益用户体验画布**
- **使用：** `skills/lean-ux-canvas/SKILL.md`（交互式）
- **适用场景：** 如果相比 OST，你更倾向于采用假设驱动的方法
- **产出：** 业务问题、假设、实验

**2. 定义史诗假设**
- **使用：** `skills/epic-hypothesis/SKILL.md`（组件）
- **参与者：** 产品经理
- **时长：** 每个史诗 60 分钟
- **产出：** 排名前 3-5 的计划对应的史诗假设陈述

**3. 创建用户故事地图（可选）**
- **使用：** `skills/user-story-mapping-workshop/SKILL.md`（交互式）
- **适用场景：** 适用于需要制定发布计划的复杂功能
- **参与者：** 产品经理、设计师、工程师
- **时长：** 120 分钟
- **产出：** 包含主干和发布切片的故事地图

### 决策点 3：我们是否需要在做出承诺前测试解决方案？

**如果是（高不确定性）：** 开展实验：
- 根据 `skills/opportunity-solution-tree/SKILL.md` 的产出设计 POC 实验
- 与 10-20 位客户进行测试（原型、礼宾式服务、落地页测试）
- **时间影响：** +1-2 周

**如果否（低不确定性）：** 进入阶段 4（优先级排序）

---

## 阶段 4：优先级排序与路线图规划（第 2 周，第 4-5 天）

**目标：** 确定计划的优先级，并将其编排为可执行的路线图。

### 活动

**1. 选择优先级排序框架**
- **使用：** `skills/prioritization-advisor/SKILL.md`（交互式）
- **参与者：** 产品经理
- **时长：** 30 分钟
- **产出：** 推荐的优先级排序框架（RICE、ICE、价值/工作量等）

**2. 对史诗进行评分和优先级排序**
- **使用：** 步骤 1 中的优先级排序框架
- **参与者：** 产品经理、工程负责人、产品管理层
- **时长：** 90 分钟
- **产出：** 按优先级排序的史诗待办事项列表

**3. 按发布版本编排路线图**
- **参与者：** 产品经理、工程负责人
- **时长：** 60 分钟
- **产出：** 按季度或发布版本划分的路线图（Q1：史诗 A、B；Q2：史诗 C、D、E）

**4. 绘制 TAM/SAM/SOM（可选）**
- **使用：** `skills/tam-sam-som-calculator/SKILL.md`（交互式）
- **适用场景：** 用于高管演示、融资或市场规模估算
- **参与者：** 产品经理、业务运营人员
- **时长：** 60 分钟
- **产出：** 附带引用来源的市场规模预测

---

## 阶段 5：利益相关者共识与沟通（第 3 周）

**目标：** 向利益相关者展示战略、收集反馈并进行完善。

### 活动

**1. 创建愿景新闻稿（可选）**
- **使用：** `skills/press-release/SKILL.md`（组件）
- **适用场景：** 重大产品发布或争取高管支持
- **参与者：** PM、市场营销人员
- **时长：** 60 分钟
- **产出：** Amazon 逆向工作法风格的新闻稿

**2. 向利益相关者陈述战略**
- **形式：** 60 分钟的演示，涵盖：
  - 定位陈述（阶段 1）
  - 问题陈述（阶段 2）
  - 解决方案选项与优先级排序（阶段 3-4）
  - 路线图（阶段 4）
- **参与者：** 高管、产品负责人、关键利益相关者
- **产出：** 反馈、待解决问题、继续推进的批准

**3. 根据反馈进行完善**
- **时长：** 1-2 天
- **产出：** 更新后的战略成果物

---

## 阶段 6：执行规划（第 4 周）

**目标：** 将史诗拆分为用户故事，规划首个冲刺/发布。

### 活动

**1. 拆分最重要的史诗**
- **使用：** `skills/epic-breakdown-advisor/SKILL.md`（交互式——采用 Richard Lawrence 的 9 种模式）
- **参与者：** PM、设计、工程人员
- **时长：** 90 分钟
- **产出：** 按模式（工作流、CRUD、业务规则等）拆分的用户故事

**2. 编写用户故事**
- **使用：** `skills/user-story/SKILL.md`（组件）
- **参与者：** PM
- **时长：** 每个故事 30 分钟
- **产出：** 包含验收标准的用户故事

**3. 规划首个冲刺/发布**
- **参与者：** PM、工程人员
- **时长：** 60 分钟
- **产出：** 冲刺待办列表或发布计划

---

## 完整工作流：端到端总结

```
Week 1:
├─ Day 1-2: Positioning & Market Context
│  ├─ skills/positioning-workshop/SKILL.md (90 min)
│  ├─ skills/proto-persona/SKILL.md (60 min)
│  └─ skills/jobs-to-be-done/SKILL.md (60 min)
│
├─ Day 3-5: Problem Framing & Validation
│  ├─ skills/problem-framing-canvas/SKILL.md (120 min)
│  ├─ skills/problem-statement/SKILL.md (30 min)
│  └─ [Optional] skills/customer-journey-mapping-workshop/SKILL.md (90 min)
│
└─ Decision: Validate problem? (if NO, +1 week discovery)

Week 2:
├─ Day 1-3: Solution Exploration
│  ├─ skills/opportunity-solution-tree/SKILL.md (90 min)
│  ├─ skills/epic-hypothesis/SKILL.md (60 min per epic)
│  └─ [Optional] skills/user-story-mapping-workshop/SKILL.md (120 min)
│
├─ Decision: Test solutions? (if YES, +1-2 weeks experiments)
│
└─ Day 4-5: Prioritization & Roadmap
   ├─ skills/prioritization-advisor/SKILL.md (30 min)
   ├─ Score & prioritize epics (90 min)
   ├─ Sequence roadmap (60 min)
   └─ [Optional] skills/tam-sam-som-calculator/SKILL.md (60 min)

Week 3:
└─ Stakeholder Alignment
   ├─ [Optional] skills/press-release/SKILL.md (60 min)
   ├─ Present strategy (60 min)
   └─ Refine based on feedback (1-2 days)

Week 4:
└─ Execution Planning
   ├─ skills/epic-breakdown-advisor/SKILL.md (90 min)
   ├─ skills/user-story/SKILL.md (30 min per story)
   └─ Plan first sprint (60 min)
```

**总时间投入：**
- **最短：** 2 周（不进行探索/实验）
- **通常：** 3 周（包含 1 轮验证）
- **最长：** 4-6 周（包含探索性访谈和实验）

---

## 示例

完整的战略会议示例请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
**Target:** Non-technical SMB owners
**Problem:** Onboarding drop-off due to jargon
**Priority:** Guided onboarding (RICE)
```

## 常见误区

### 误区 1：跳过问题验证
**症状：** 未验证问题便从定位直接跳到解决方案探索

**后果：** 针对未经验证的问题构建解决方案

**修正：** 在第 2 阶段后强制设置决策点：“问题是否已验证？”如果为否，则开展探索性访谈。

---

### 误区 2：产品经理单打独斗
**症状：** 产品经理独自开展战略会议，然后向团队展示已经完成的战略

**后果：** 团队缺乏认同，也不理解其背后的理由

**修正：** 在研讨会中纳入跨职能参与者（设计、工程、销售、客户成功）

---

### 误区 3：战略会议缺乏高管支持
**症状：** 开展了完整的战略会议，但高管未出席第 5 阶段的对齐会议

**后果：** 战略无法获得资源或被列为优先事项

**修正：** 提前获得高管承诺；在开始前安排好第 5 阶段的演示。

---

### 误区 4：没有决策点（不加判断地执行所有阶段）
**症状：** 不检查是否需要开展探索或实验，盲目执行全部 6 个阶段

**后果：** 在不确定性较低的活动上浪费时间

**修正：** 在第 2 阶段和第 3 阶段后设置决策点，以调整工作流。

---

### 误区 5：战略会议变成常驻流程
**症状：** 团队花费 6 周时间停留在战略模式，却从不执行

**后果：** 分析瘫痪，没有任何交付

**修正：** 将战略会议限定在 2–4 周内；第 6 阶段结束后，转入执行。

---

## 参考资料

### 相关技能（由此工作流编排）

**第 1 阶段：**
- `skills/positioning-workshop/SKILL.md`（交互式）
- `skills/proto-persona/SKILL.md`（组件）
- `skills/jobs-to-be-done/SKILL.md`（组件）

**第 2 阶段：**
- `skills/problem-framing-canvas/SKILL.md`（交互式）
- `skills/problem-statement/SKILL.md`（组件）
- `skills/customer-journey-mapping-workshop/SKILL.md`（交互式，可选）
- `skills/discovery-interview-prep/SKILL.md`（交互式，如需验证）

**第 3 阶段：**
- `skills/opportunity-solution-tree/SKILL.md`（交互式）
- `skills/lean-ux-canvas/SKILL.md`（交互式，备选）
- `skills/epic-hypothesis/SKILL.md`（组件）
- `skills/user-story-mapping-workshop/SKILL.md`（交互式，可选）

**第 4 阶段：**
- `skills/prioritization-advisor/SKILL.md`（交互式）
- `skills/tam-sam-som-calculator/SKILL.md`（交互式，可选）

**第 5 阶段：**
- `skills/press-release/SKILL.md`（组件，可选）

**第 6 阶段：**
- `skills/epic-breakdown-advisor/SKILL.md`（交互式）
- `skills/user-story/SKILL.md`（组件）

### 外部框架
- Teresa Torres，*Continuous Discovery Habits*（2021）— 机会解决方案树框架
- Jeff Gothelf，*Lean UX*（2016）— 假设驱动的产品开发
- Marty Cagan，*Inspired*（2017）— 产品探索流程

### Dean 的工作
- Productside Blueprint — 战略性产品探索
- [如果 Dean 有战略会议资源，请在此处添加链接]

---

**技能类型：** 工作流
**建议的文件名：** `product-strategy-session.md`
**建议的存放位置：** `/skills/workflows/`
**依赖项：** 跨 6 个阶段编排 15 个以上的组件技能和交互式技能