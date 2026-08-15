---
name: user-story-mapping
argument-hint: "[product or workflow]"
description: Create a user story map that lays out activities, steps, tasks, and release slices. Use when planning a workflow, backlog, or MVP around the user journey.
intent: >-
  Visualize the user journey by creating a hierarchical map that breaks down high-level activities into steps and tasks, organized left-to-right as a narrative flow. Use this to build shared understanding across product, design, and engineering, prioritize features based on user workflows, and identify gaps or opportunities in the user experience.
type: component
---
## 目的
通过创建分层地图来可视化用户旅程，将高层级活动分解为步骤和任务，并按从左到右的叙事流程组织。使用故事地图帮助产品、设计和工程团队建立共同理解，根据用户工作流程确定功能优先级，并识别用户体验中的缺口或机会。

这不是待办事项列表，而是一种战略性产物，用来展示用户*如何*实现目标，并据此指导应该构建*什么*。

## 输入

**最适合提供：** 要映射的产品或用户工作流程。  
**同样有用：** 主要用户、你所理解的端到端叙事、需要放入地图的现有待办事项，以及发布目标。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文转储，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容并跳过其中已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 该技能会询问你要映射谁的旅程，以及他们试图完成什么，然后构建主干 → 任务 → 切片。

**调用示例：** `Story map for our expense-reporting flow, from receipt capture to reimbursement, with an MVP slice for the pilot.`

## 核心概念

### Jeff Patton 故事地图框架
故事地图由 Jeff Patton 发明，它将工作组织成二维结构：

**水平轴（从左到右）：** 随时间推进的用户旅程
- **主干：** 用户执行的高层级活动
- **步骤：** 每项活动中的具体操作
- **任务：** 完成每个步骤所需的详细工作

**垂直轴（从上到下）：** 优先级和发布版本
- **顶部各行：** 必要任务（MVP / 第 1 版）
- **下方各行：** 锦上添花的任务（未来版本）

### 故事地图结构

```
Segment → Persona → Narrative (User's goal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activity 1] → [Activity 2] → [Activity 3] → [Activity 4] → [Activity 5]
     ↓              ↓              ↓              ↓              ↓
  [Step 1.1]     [Step 2.1]     [Step 3.1]     [Step 4.1]     [Step 5.1]
  [Step 1.2]     [Step 2.2]     [Step 3.2]     [Step 4.2]     [Step 5.2]
  [Step 1.3]     [Step 2.3]     [Step 3.3]     [Step 4.3]     [Step 5.3]
     ↓              ↓              ↓              ↓              ↓
  [Task 1.1.1]   [Task 2.1.1]   [Task 3.1.1]   [Task 4.1.1]   [Task 5.1.1]
  [Task 1.1.2]   [Task 2.1.2]   [Task 3.1.2]   [Task 4.1.2]   [Task 5.1.2]
  [Task 1.1.3]   [Task 2.1.3]   [Task 3.1.3]   [Task 4.1.3]   [Task 5.1.3]
  ...            ...            ...            ...            ...
```

### 为什么这种方法有效
- **以用户为中心：** 围绕用户目标而非工程模块组织工作
- **共同理解：** 产品、设计和工程团队都能看到相同的旅程
- **优先级清晰：** 顶部任务 = MVP，下方任务 = 未来迭代
- **识别缺口：** 缺失的步骤或任务会变得显而易见
- **发布规划：** 绘制水平“发布线”来定义范围

### 反模式（这不是什么）
- **不是甘特图：** 这不是项目管理，而是用户旅程可视化
- **不是功能列表：** 活动不是功能，而是用户行为
- **不是静态的：** 随着你对用户了解的深入，故事地图也会不断演变

### 何时使用
- 启动新产品或重大功能时
- 就用户工作流与利益相关者达成一致时
- 根据用户需求确定待办事项的优先级时
- 区分 MVP 与未来版本时
- 帮助新团队成员了解产品愿景时

### 何时不应使用
- 用于简单功能时（不要为你已经理解的内容绘制地图）
- 用户工作流不断变化时（地图适用于已经稳定的工作流）
- 用它替代用户故事时（地图为用户故事提供依据，而不是取代用户故事）

---

## 应用

### 第 1 步：定义背景

使用 `template.md` 获取完整的填写结构。

#### 细分群体
你在为谁构建产品？

```markdown
### Segment:
- [Specify the target segment, e.g., "Small business owners using DIY accounting software"]
```

**质量检查：**
- **具体：** 不要写“用户”，而应写“企业 IT 管理员”或“自由职业设计师”

---

#### 用户画像
提供该细分群体中用户画像的详细信息（参考 `skills/proto-persona/SKILL.md`）。

```markdown
### Persona:
- [Describe the persona: demographics, behaviors, pains, goals]
```

**示例：**
- “Sarah，35 岁的自由职业平面设计师，同时管理 5 至 10 个客户项目，在开具发票和跟踪付款方面存在困难，希望减少处理行政事务的时间，将更多时间用于设计”

---

### 第 2 步：定义叙事
用户试图完成什么？将其表述为待办任务（Jobs-to-be-Done）陈述（参考 `skills/jobs-to-be-done/SKILL.md`）。

```markdown
### Narrative:
- [Concise narrative of the persona's objective, e.g., "Complete a client project from kickoff to final payment"]
```

**质量检查：**
- **以结果为中心：** 不要写“使用产品”，而应写“按时交付客户项目并收到付款”
- **一句话：** 如果需要用一句以上的话来表述，范围可能过于宽泛

---

### 第 3 步：识别活动（主干）
列出用户画像中的人物为完成叙事而进行的 3 至 5 项高层级活动。这些活动构成地图的主干。

```markdown
### Activities:
1. [Activity 1, e.g., "Negotiate project scope and pricing"]
2. [Activity 2, e.g., "Execute design work"]
3. [Activity 3, e.g., "Deliver final assets to client"]
4. [Activity 4, e.g., "Send invoice and receive payment"]
5. [Activity 5, optional]
```

**质量检查：**
- **按顺序排列：** 活动按顺序发生（从左到右）
- **用户操作：** 描述用户*做什么*，而不是产品*提供什么*
- **3 至 5 项活动：** 太少 = 过度简化，太多 = 难以处理

---

### 第 4 步：将活动分解为步骤
针对每项活动，列出 3 至 5 个步骤，详细说明该活动如何进行。

```markdown
### Steps:

**For Activity 1: [Activity Name]**
- Step 1: [Detail step 1, e.g., "Review client brief"]
- Step 2: [Detail step 2, e.g., "Draft project proposal"]
- Step 3: [Detail step 3, e.g., "Negotiate timeline and budget"]
- Step 4: [Optional step 4]
- Step 5: [Optional step 5]

**For Activity 2: [Activity Name]**
- Step 1: [Detail step 1]
- Step 2: [Detail step 2]
...
```

**质量检查：**
- **可执行：** 每个步骤都是用户执行的操作
- **可观察：** 你能够观察到某人执行该步骤
- **顺序合理：** 各步骤遵循自然顺序

---

### 第 5 步：将步骤拆分为任务
针对每个步骤，列出 5-7 个必须完成的任务。

```markdown
### Tasks:

**For Activity 1, Step 1: [Step Name]**
- Task 1: [Detail task 1, e.g., "Read client brief document"]
- Task 2: [Detail task 2, e.g., "Identify key deliverables"]
- Task 3: [Detail task 3, e.g., "Note budget constraints"]
- Task 4: [Detail task 4, e.g., "Clarify timeline expectations"]
- Task 5: [Detail task 5, e.g., "List open questions for client"]
- Task 6: [Optional task 6]
- Task 7: [Optional task 7]

**For Activity 1, Step 2: [Step Name]**
- Task 1: [Detail task 1]
...
```

**质量检查：**
- **粒度细：** 任务是小而具体的操作
- **面向用户或幕后执行：** 两者都要包括（例如，“发送电子邮件”和“收到确认”）
- **可确定优先级：** 你将纵向排列任务优先级（顶部 = 必要项，底部 = 锦上添花项）

---

### 第 6 步：纵向确定优先级
按照优先级从上到下排列任务：
- **顶部各行：** MVP / 版本 1（必备项）
- **中间各行：** 版本 2（重要但并非关键）
- **底部各行：** 未来版本 / 锦上添花项

绘制水平的“版本分隔线”来划分范围。

---

### 第 7 步：识别缺口与机会
审查地图并询问：
- 是否缺少某些步骤或任务？
- 是否存在我们尚未解决的痛点？
- 是否有让用户感到惊喜的机会？
- 所有活动之间的流程是否符合逻辑？

---

## 示例

完整的故事地图示例请参阅 `examples/sample.md`。

---

## 常见误区

### 误区 1：活动是功能，而非用户行为
**表现：** “活动 1：使用仪表板。活动 2：生成报告。”

**后果：** 你映射的是产品，而不是用户旅程。

**修正方法：** 将其重新表述为用户操作：“活动 1：监控项目进度。活动 2：为利益相关者汇总工作。”

---

### 误区 2：活动过多
**表现：** 主干上有 10 个以上的活动

**后果：** 地图变得难以理解并失去重点。

**修正方法：** 进行整合。如果你有 10 个活动，很可能是把活动和步骤混在了一起。应以 3-5 个高层级活动为目标。

---

### 误区 3：任务过于模糊
**表现：** “任务 1：做这件事”

**后果：** 无法对模糊的任务确定优先级或进行估算。

**修正方法：** 具体说明：“任务 1：在‘账单寄送至’字段中输入客户的电子邮件地址。”

---

### 误区 4：忽视纵向优先级
**表现：** 所有任务都处于同一级别——没有定义 MVP 与未来版本

**后果：** 不清楚应该优先构建什么。

**修正方法：** 明确确定优先级。绘制版本分隔线。对于 MVP 的内容必须做出艰难取舍。

---

### 误区 5：闭门进行映射
**表现：** 产品经理独自创建地图，然后将其展示给团队

**后果：** 缺乏共同的所有权和理解。

**修正方法：** 协作绘制地图。与产品、设计和工程团队共同举办故事地图工作坊。

---

## 参考资料

### 相关技能
- `skills/proto-persona/SKILL.md` — 定义故事地图所用的用户画像
- `skills/jobs-to-be-done/SKILL.md` — 为叙事和活动提供信息
- `skills/user-story/SKILL.md` — 地图中的任务将转化为用户故事
- `skills/problem-statement/SKILL.md` — 问题陈述为叙事提供框架

### 外部框架
- Jeff Patton，*用户故事地图*（2014）— 用户故事地图技术的起源
- Teresa Torres，*持续探索习惯*（2021）— 机会解决方案树（用户故事地图的补充方法）

### Dean 的工作
- 用户故事地图提示词（改编自 Jeff Patton 的方法论）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/user-story-mapping.md`。

---

**技能类型：** 组件
**建议文件名：** `user-story-mapping.md`
**建议放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/proto-persona/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`、`skills/user-story/SKILL.md`、`skills/problem-statement/SKILL.md`