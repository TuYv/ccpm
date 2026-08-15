---
name: discovery-process
argument-hint: "[problem hypothesis]"
description: Run a full discovery cycle from problem hypothesis to validated solution. Use when a team needs a structured path through framing, interviews, synthesis, and experiments.
intent: >-
  Guide product managers through a complete discovery cycle—from initial problem hypothesis to validated solution—by orchestrating problem framing, customer interviews, synthesis, and experimentation skills into a structured process. Use this to systematically explore problem spaces, validate assumptions, and build confidence before committing to full development—avoiding "build it and they will come" syndrome and ensuring you're solving real customer problems.
type: workflow
theme: discovery-research
best_for:
  - "Running a full discovery cycle from hypothesis to validated solution"
  - "Investigating a retention or churn problem systematically"
  - "Setting up continuous discovery as an ongoing practice"
scenarios:
  - "I have a hypothesis that B2B customers struggle with onboarding and want to validate it before building anything"
  - "Our activation rate dropped 15% this quarter and I need to run discovery to find out why"
estimated_time: "30-60 min"
---
## 目的
通过将问题界定、客户访谈、洞察综合和实验验证等技能编排为一个结构化流程，引导产品经理完成从初始问题假设到解决方案验证的完整发现周期。使用这一流程系统地探索问题空间、验证假设，并在投入全面开发之前建立信心，从而避免“做出来，客户自然会来”的误区，确保你解决的是真实的客户问题。

这并非一次性的研究项目，而是一项与交付并行开展的持续发现实践，通常每季度进行 1-2 个发现周期。

## 输入

**最适合提供：** 你的初始问题假设——即使还很粗略也没关系。
**同样有用：** 既往研究、客户触达渠道、时间安排，以及本次发现需要为哪项决策提供依据。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。请直接使用这些内容并跳过其已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 工作流会从问题界定开始，先帮助你构建假设。

**调用示例：** `Run discovery on this hypothesis: SMB admins abandon onboarding because the data-import step requires IT help they don't have.`

## 核心概念

### 什么是发现流程？

发现流程（Teresa Torres、Marty Cagan）是一种在开始构建之前探索问题空间并验证解决方案的结构化方法。它包括：

1. **界定问题** — 明确你正在研究什么以及研究原因
2. **开展研究** — 收集定性和定量证据
3. **综合洞察** — 识别模式、痛点和机会
4. **生成解决方案** — 探索多种解决方案选项
5. **验证解决方案** — 通过实验检验假设
6. **决策并记录** — 决定继续构建、调整方向或终止项目

### 为什么这种方法有效
- **降低产品决策风险：** 在投入高昂的构建成本之前检验假设
- **以客户为中心：** 让决策建立在真实的客户问题之上，而非内部意见之上
- **迭代推进：** 通过小型实验逐步建立信心
- **快速学习：** 尽早发现“不应继续”的信号，避免浪费精力

### 反模式（这不是什么）
- **不是瀑布式研究：** 发现是持续开展的，而不是只在开发前进行一次
- **不是用户测试：** 发现用于验证问题；测试用于验证解决方案
- **不能替代产品交付：** 发现为交付提供依据，而不是取代交付

### 何时使用
- 探索新的产品或功能领域
- 调查留存或客户流失问题
- 在纳入路线图之前验证战略举措
- 开展持续发现（每周与客户接触）

### 何时不应使用
- 面对已经充分理解的问题时（直接进入执行阶段）
- 利益相关者已经承诺采用某个解决方案时（先解决共识问题）
- 处理战术性缺陷修复或技术债务时（无需进行发现）

---

### 引导规范的唯一事实来源

以引导式对话运行此工作流时，请使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文转储、最佳猜测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如，Context Qx/8 和 Scoring Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回复选项（适用时包含 `Other (specify)`）

本文件定义工作流顺序和特定领域的输出。如果存在冲突，请遵循本文件的工作流逻辑。

## 应用

使用 `template.md` 获取完整的填充式结构。

此工作流在 **2-4 周**内编排 **6 个阶段**，并使用多个组件型和交互型技能。

---

## 阶段 1：界定问题（第 1-2 天）

**目标：** 明确你要调查的问题、受影响的人群以及成功标准。

### 活动

**1. 运行问题界定画布**
- **使用：** `skills/problem-framing-canvas/SKILL.md`（交互型 - MITRE）
- **参与者：** 产品经理、设计师、工程负责人
- **时长：** 120 分钟
- **输出：** 问题陈述 + “我们可以如何”问题

**2. 创建正式的问题陈述**
- **使用：** `skills/problem-statement/SKILL.md`（组件型）
- **参与者：** 产品经理
- **时长：** 30 分钟
- **输出：** 包含假设的结构化问题陈述

**3. 定义原型用户画像（如需要）**
- **使用：** `skills/proto-persona/SKILL.md`（组件型）
- **适用情况：** 目标客户细分不明确时
- **时长：** 60 分钟
- **输出：** 假设驱动的用户画像

**4. 梳理待办任务（如需要）**
- **使用：** `skills/jobs-to-be-done/SKILL.md`（组件型）
- **适用情况：** 客户动机不明确时
- **时长：** 60 分钟
- **输出：** JTBD 陈述

### 阶段 1 的输出

- **问题假设：** “我们认为 [persona] 在 [problem] 方面遇到困难，因为 [root cause]，从而导致 [consequence]。”
- **研究问题：** 通过探索回答的 3-5 个问题
- **成功标准：** 什么结果能够验证或推翻该问题？

### 决策点 1：我们是否有足够的背景信息来开始研究？

**如果是：** 进入阶段 2（研究规划）

**如果否：** 先收集现有数据：
- 查看支持工单、流失调查、NPS 反馈
- 分析产品数据（流失节点、使用模式）
- 查看竞品研究、市场趋势
- **时间影响：** +2-3 天

---

## 阶段 2：研究规划（第 3 天）

**目标：** 设计研究方法、招募参与者并准备访谈指南。

### 活动

**1. 准备探索性访谈**
- **使用：** `skills/discovery-interview-prep/SKILL.md`（交互型）
- **参与者：** 产品经理、设计师
- **时长：** 90 分钟
- **输出：** 包含研究方法、问题和需要避免的偏差的访谈计划

**2. 招募参与者**
- **目标：** 每个探索周期招募 5-10 名客户（Teresa Torres：持续探索 = 每周 1 次访谈）
- **细分：** 聚焦于阶段 1 中的用户画像
- **招募渠道：**
  - 现有客户（电子邮件、应用内提示）
  - 已流失客户（退出访谈）
  - 陌生拓展（LinkedIn、社区）
- **激励：** $50-100 礼品卡或产品额度
- **时长：** 2-3 天（与阶段 1 并行）

**3. 安排访谈**
- **形式：** 每次访谈 45-60 分钟（30-40 分钟交流 + 缓冲时间）
- **时间安排：** 分散在 1-2 周内进行
- **录制：** 征得同意后录制，以便进行综合分析

### 阶段 2 的产出

- **访谈指南：** 5-7 个开放式问题（Mom Test 风格）
- **参与者名单：** 已安排的 5-10 次访谈
- **综合分析计划：** 如何记录和分析洞察

---

## 阶段 3：开展研究（第 1-2 周）

**目标：** 通过客户访谈收集定性证据。

### 活动

**1. 开展探索性访谈**
- **方法论：** 参考 `skills/discovery-interview-prep/SKILL.md`（问题验证、JTBD、转换访谈等）
- **参与者：** PM + 可选观察员（设计、工程）
- **持续时间：** 在 1-2 周内开展 5-10 次访谈
- **重点领域：**
  - 过去的行为（而非假设）：“请告诉我你上一次[遇到这个问题]时的情况”
  - 变通方法：“你目前如何处理这个问题？”
  - 尝试过的替代方案：“你尝试过其他解决方案吗？为什么停止使用了？”
  - 痛点强度：“这会耗费你多少时间/金钱？”

**2. 记录结构化笔记**
- **模板：**
  - 参与者：[姓名、角色、公司规模]
  - 情境：[他们在何时/何地遇到问题]
  - 操作：[他们逐步执行了哪些操作]
  - 痛点：[挫折、阻碍]
  - 变通方法：[当前解决方案]
  - 引述：[客户的原话]
  - 洞察：[模式、意外发现]

**3. 查看支持工单和分析数据（并行）**
- **支持工单：** 按主题标记（引导上手、功能困惑、错误）
- **分析数据：** 识别流失节点、功能使用情况、群组行为
- **调查：** 查看 NPS 评论、退出调查、功能请求

### 阶段 3 的产出

- **访谈记录：** 录制的访谈 + 详细笔记
- **支持工单主题：** 按出现频率排名的前 10 个问题
- **分析洞察：** 有关行为的定量数据（例如，“60% 的用户在第 3 步放弃引导上手”）

### 决策点 2：我们是否已经达到饱和？

**饱和 = 相同的痛点在 3 次以上访谈中出现，且不再产生新的洞察**

**如果是（在 5-7 次访谈后达到饱和）：** 进入阶段 4（综合分析）

**如果否（仍在了解到新信息）：** 再安排 3-5 次访谈
- **时间影响：** +1 周

---

## 阶段 4：综合洞察（第 2 周末）

**目标：** 识别模式、确定痛点的优先级、绘制机会图谱。

### 活动

**1. 亲和图分析（主题分析）**
- **方法：**
  - 将每条洞察/引述写在便利贴上
  - 按主题分组（例如，“引导上手困惑”、“定价异议”、“移动端访问”）
  - 统计频率（有多少客户提到了每个主题）
- **参与者：** PM、设计、可选的工程人员
- **持续时间：** 90-120 分钟
- **产出：** 带有频次统计的主题聚类

**2. 创建客户旅程地图（可选）**
- **使用：** `skills/customer-journey-mapping-workshop/SKILL.md`（交互式）
- **适用情况：** 如果痛点跨越多个阶段（发现、试用、购买、使用、支持）
- **持续时间：** 90 分钟
- **产出：** 按影响程度对机会进行排序的旅程地图

**3. 确定痛点优先级**
- **标准：**
  - **频率：** 有多少客户提到了这一点？
  - **强度：** 痛苦程度有多高？（浪费时间、损失金钱、情绪受挫）
  - **战略契合度：** 解决这一问题是否符合业务目标？
- **方法：** 按频率、强度和战略契合度分别为每个痛点评分（1-5 分）
- **输出：** 按优先级排序的 3-5 个待解决的主要痛点

**4. 更新问题陈述**
- **使用：** `skills/problem-statement/SKILL.md`（组件）
- **根据研究结果完善：** 最初的假设是否成立？如有需要，进行调整。
- **输出：** 已验证的问题陈述

### 阶段 4 的产出

- **亲和图：** 包含频次统计的主题
- **前 3-5 个痛点：** 按频率 × 强度 × 战略契合度确定优先级
- **客户原话：** 每个痛点对应 3-5 条逐字引用
- **已验证的问题陈述：** 根据证据完善

---

## 阶段 5：生成并验证解决方案（第 3 周）

**目标：** 探索解决方案选项、设计实验并验证假设。

### 活动

**1. 生成机会解决方案树**
- **使用：** `skills/opportunity-solution-tree/SKILL.md`（交互式）
- **输入：** 阶段 4 中的前 3 个痛点
- **参与者：** 产品经理、设计师、工程负责人
- **时长：** 90 分钟
- **输出：** 3 个机会、每个机会对应 3 个解决方案，以及 POC 建议

**替代方案：使用精益用户体验画布**
- **使用：** `skills/lean-ux-canvas/SKILL.md`（交互式）
- **适用情况：** 相比 OST，更倾向于采用假设驱动的方法
- **输出：** 待检验的假设、最小化实验

**2. 设计实验**
- **针对每个解决方案：** 明确“为了获知下一个最重要的信息，最少需要做哪些工作？”
- **实验类型：**
  - **礼宾式测试：** 手动向 10 位客户交付解决方案并观察
  - **原型测试：** 使用可点击的模型，对 10 位用户进行可用性测试
  - **落地页测试：** 假门测试（展示功能并衡量兴趣）
  - **A/B 测试：** 构建最小版本，对 50% 的用户进行测试
- **成功标准：** 哪项指标或行为能够验证假设？

**3. 开展实验**
- **时间安排：** 每项实验 1-2 周
- **参与者：** 产品经理 + 设计师（负责原型），工程师（负责 A/B 测试）
- **输出：** 定量和定性验证数据

### 阶段 5 的产出

- **解决方案选项：** 3-9 个解决方案（每个机会对应 3 个）
- **实验结果：** 假设得到验证还是被推翻？
- **客户反馈：** 对原型/概念的定性反应

### 决策点 3：实验是否验证了解决方案？

**如果是（已验证）：** 进入阶段 6（决策并记录）

**如果否（未验证）：**
- 转向下一个解决方案选项
- 使用调整后的方法重新开展实验
- **时间影响：** 增加 1-2 周

---

## 阶段 6：决策并记录（第 3-4 周末）

**目标：** 决定投入构建、记录决策并与利益相关者沟通。

### 活动

**1. 做出继续/停止决策**
- **标准：**
  - 问题是否已验证？（阶段 3-4）
  - 解决方案是否已验证？（阶段 5）
  - 是否符合战略方向？（与业务目标一致）
  - 是否可行？（工程产能、技术复杂度）
- **决策：**
  - **继续：** 纳入路线图，编写史诗和用户故事
  - **转向：** 探索替代解决方案
  - **终止：** 降低优先级，当前不值得解决

**2. 定义史诗假设（如果 GO）**
- **使用：** `skills/epic-hypothesis/SKILL.md`（组件）
- **参与者：** PM
- **时长：** 每个史诗 60 分钟
- **产出：** 包含成功标准的史诗假设陈述

**3. 编写 PRD（如果 GO）**
- **使用：** `skills/prd-development/SKILL.md`（工作流）
- **参与者：** PM
- **时长：** 1-2 天
- **产出：** 包含问题、解决方案和成功指标的结构化 PRD

**4. 沟通研究结果**
- **形式：** 30 分钟的汇报，涵盖：
  - 问题验证（阶段 3-4 的洞察）
  - 解决方案验证（阶段 5 的实验）
  - 建议（GO/PIVOT/KILL）
- **参与者：** 高管、产品领导层、关键利益相关者
- **产出：** 就后续步骤达成一致

### 阶段 6 的产出

- **决策：** GO、PIVOT 或 KILL
- **史诗假设：**（如果 GO）可测试的史诗陈述
- **PRD：**（如果 GO）正式的产品需求文档
- **利益相关者共识：** 高管对建议的认可

---

## 完整工作流：端到端总结

```
Week 1:
├─ Day 1-2: Frame the Problem
│  ├─ skills/problem-framing-canvas/SKILL.md (120 min)
│  ├─ skills/problem-statement/SKILL.md (30 min)
│  └─ [Optional] skills/proto-persona/SKILL.md, skills/jobs-to-be-done/SKILL.md
│
├─ Day 3: Research Planning
│  ├─ skills/discovery-interview-prep/SKILL.md (90 min)
│  ├─ Recruit participants (2-3 days)
│  └─ Schedule 5-10 interviews
│
└─ Day 4-5: Conduct Research (Start)
   └─ First 2-3 customer interviews

Week 2:
├─ Day 1-3: Conduct Research (Continue)
│  └─ Remaining customer interviews (3-7 more)
│
├─ Day 4-5: Synthesize Insights
│  ├─ Affinity mapping (120 min)
│  ├─ [Optional] skills/customer-journey-mapping-workshop/SKILL.md (90 min)
│  ├─ Prioritize pain points
│  └─ Update problem statement
│
└─ Decision: Reached saturation? (if NO, +1 week more interviews)

Week 3:
├─ Day 1-2: Generate & Validate Solutions
│  ├─ skills/opportunity-solution-tree/SKILL.md (90 min)
│  └─ Design experiments
│
├─ Day 3-5: Run Experiments
│  ├─ Concierge tests, prototypes, or A/B tests
│  └─ Gather validation data
│
└─ Decision: Validated? (if NO, pivot to next solution, +1-2 weeks)

Week 4:
└─ Decide & Document
   ├─ Make GO/NO-GO decision
   ├─ [If GO] skills/epic-hypothesis/SKILL.md (60 min per epic)
   ├─ [If GO] skills/prd-development/SKILL.md (1-2 days)
   └─ Communicate findings (30 min readout)
```

**总时间投入：**
- **快速推进：** 3 周（5 次访谈、1 个实验）
- **典型情况：** 4 周（7-10 次访谈、1-2 个实验）
- **深入开展：** 6-8 周（10 次以上访谈、多轮实验）

---

## 示例

完整的发现流程示例见 `examples/sample.md`。

简短示例摘录：

```markdown
**Problem:** Onboarding drop-off due to jargon
**Insight:** 6/10 users quit at step 3
**Decision:** Go with guided checklist experiment
```

## 常见陷阱

### 陷阱 1：跳过客户访谈
**表现：** 仅依赖分析数据和支持工单，不开展定性研究

**后果：** 无法了解行为背后的“原因”，构建出错误的解决方案

**修复方法：** 每个探索周期始终访谈 5-10 位客户（即使你已有数据）

---

### 陷阱 2：提出引导性问题
**症状：** “如果我们构建了[功能 X]，你会使用吗？”

**后果：** 产生确认偏误，客户出于礼貌回答“会”

**修复方法：** 使用 `skills/discovery-interview-prep/SKILL.md` 中的《妈妈测试》式问题（重点关注过去的行为）

---

### 陷阱 3：未达到饱和
**症状：** 访谈 2-3 位客户后，便宣布探索完成

**后果：** 样本量小，不具代表性

**修复方法：** 继续访谈，直到相同模式在 3 位以上的客户中出现（通常至少需要 5-7 次访谈）

---

### 陷阱 4：分析瘫痪
**症状：** 花费 6 周时间综合分析洞察，却始终没有进入解决方案阶段

**后果：** 没有交付成果，团队失去动力

**修复方法：** 将探索阶段的时间限制在 3-4 周；完成阶段 6 后，转入执行

---

### 陷阱 5：将探索视为一次性活动
**症状：** 在构建之前进行一次探索，之后便停止

**后果：** 错过不断演变的客户需求和市场变化

**修复方法：** 持续探索（Teresa Torres）：每周进行 1 次客户访谈，持续开展

---

## 参考资料

### 本工作流编排的相关技能

**阶段 1：**
- `skills/problem-framing-canvas/SKILL.md`（交互式）
- `skills/problem-statement/SKILL.md`（组件）
- `skills/proto-persona/SKILL.md`（组件，可选）
- `skills/jobs-to-be-done/SKILL.md`（组件，可选）

**阶段 2：**
- `skills/discovery-interview-prep/SKILL.md`（交互式）

**阶段 4：**
- `skills/customer-journey-mapping-workshop/SKILL.md`（交互式，可选）

**阶段 5：**
- `skills/opportunity-solution-tree/SKILL.md`（交互式）
- `skills/lean-ux-canvas/SKILL.md`（交互式，替代方案）

**阶段 6：**
- `skills/epic-hypothesis/SKILL.md`（组件）
- `skills/prd-development/SKILL.md`（工作流）

### 外部框架
- Teresa Torres，*《持续探索习惯》*（2021）——每周接触客户、OST 框架
- Rob Fitzpatrick，*《妈妈测试》*（2013）——如何提出高质量的访谈问题
- Marty Cagan，*《启示录》*（2017）——产品探索原则

### Dean 的工作
- Productside Blueprint——战略探索流程
- [如果 Dean 有探索相关资源，请在此处添加链接]

---

**技能类型：** 工作流
**建议的文件名：** `discovery-process.md`
**建议的放置位置：** `/skills/workflows/`
**依赖项：** 跨 6 个阶段编排 10 个以上的组件技能和交互式技能