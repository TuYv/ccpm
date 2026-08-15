---
name: problem-framing-canvas
argument-hint: "[problem area]"
description: Guide teams through MITRE's Problem Framing Canvas. Use when you need a clearer problem statement before jumping to solutions.
intent: >-
  Guide product managers through the MITRE Problem Framing Canvas process by asking structured questions across three phases: Look Inward (examine your own assumptions and biases), Look Outward (understand who experiences the problem and who doesn't), and Reframe (synthesize insights into an actionable problem statement and "How Might We" question). Use this to ensure you're solving the right problem before jumping to solutions—avoiding confirmation bias, overlooked stakeholders, and solution-first thinking.
type: interactive
best_for:
  - "Clarifying a messy problem before solutioning"
  - "Surfacing assumptions and overlooked stakeholders"
  - "Creating a bias-resistant problem statement in a workshop"
scenarios:
  - "Run a Problem Framing Canvas for our mobile retention issue"
  - "Help me reframe this stakeholder request before we build anything"
  - "We need a clearer problem statement for onboarding drop-off"
theme: discovery-research
estimated_time: "30-45 min"
---
## 目的
通过在三个阶段提出结构化问题，引导产品经理完成 MITRE 问题框定画布流程：向内审视（检视自身的假设与偏见）、向外观察（了解哪些人正在经历这一问题，哪些人没有）以及重新框定（将洞察整合为可付诸行动的问题陈述和“我们可以如何”问题）。使用此工具可确保在急于寻找解决方案之前，先确认你正在解决正确的问题，从而避免确认偏误、遗漏利益相关者以及解决方案优先的思维方式。

这不是用于开展解决方案头脑风暴的工具，而是一种问题框定工具，旨在拓宽视角、挑战假设，并产出清晰且以公平为导向的问题陈述。

## 输入

**最适合提供：** 问题领域——无论你目前对它的理解多么粗略。
**同样有用：** 你认为哪些人正在经历这一问题、目前已有的证据，以及所有人已经锚定的解决方案（明确指出该方案有助于画布消除其造成的偏见）。

调用时一并提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的回答。使用这些内容并跳过其已涵盖的问题；不要重复询问。

**毫无准备地开始？也没问题。** 该技能会从向内审视阶段开始：对于这个问题，你有哪些假设？

**调用示例：** `Frame this problem: field sales reps 'don't use the CRM' and leadership wants gamification.`

## 核心概念

### 什么是 MITRE 问题框定画布？

问题框定画布（MITRE 创新工具包第 3 版）是一种结构化框架，可帮助团队在提出解决方案之前全面探索问题空间。它分为**三个区域**：

1. **向内审视**——检视自身的假设、偏见，以及自己可能如何成为问题的一部分
2. **向外观察**——了解哪些人正在经历这一问题、哪些人从中受益，以及哪些人被排除在外
3. **重新框定**——将洞察整合为清晰、可付诸行动的问题陈述和“我们可以如何”问题

### 画布结构

```
┌─────────────────────────────────────────────────────────────────┐
│ LOOK INWARD                                                     │
│ - What is the problem? (symptoms)                              │
│ - Why haven't we solved it? (new, hard, low priority, etc.)   │
│ - How are we part of the problem? (assumptions, biases)       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LOOK OUTWARD                                                    │
│ - Who experiences the problem? When/where/consequences?        │
│ - Who else has it? Who doesn't have it?                       │
│ - Who's been left out?                                        │
│ - Who benefits when problem exists/doesn't exist?             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ REFRAME                                                         │
│ - Stated another way, the problem is: [restatement]           │
│ - How might we [action] as we aim to [objective]?             │
└─────────────────────────────────────────────────────────────────┘
```

### 为什么这行之有效
- **拓宽视角：** 迫使你超越自身假设来看待问题
- **以公平为导向：** 将边缘化群体的声音置于核心，并追问“谁被遗漏了？”
- **挑战偏见：** 要求在界定问题之前明确审视各种假设
- **可付诸行动的产出：** 生成可直接用于探索解决方案的 HMW 陈述

### 反模式（这不是什么）
- **不是解决方案头脑风暴：** 画布用于界定问题；解决方案将在之后提出
- **不是功能需求列表：** 聚焦根本问题，而非表面症状
- **不是单人练习：** 需要多元视角来挑战群体迷思

### 何时使用
- 开始探索一项新计划时
- 重新界定现有问题时（怀疑自己正在解决错误的问题）
- 在构建解决方案之前挑战各种假设
- 让跨职能团队就问题定义达成一致

### 何时不应使用
- 问题已经得到充分理解和验证时
- 用于战术性缺陷修复或技术债务处理时（无需深入界定问题）
- 利益相关者已经决定采用某个解决方案时（应先解决意见一致性问题）

---

### 引导流程的权威依据

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只问一个问题，并使用通俗易懂的提示语
- 进度标签（例如，Context Qx/8 和 Scoring Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回复选项（适用时包括 `Other (specify)`）

此文件定义了特定领域的评估内容。如有冲突，请遵循此文件中的领域逻辑。

## 应用

使用 `template.md` 获取完整的填充结构。

此交互式技能遵循一个**三阶段流程**，在每个阶段提出**自适应问题**。

---

### 第 0 步：收集上下文（提问前）

**智能体建议：**

在界定问题之前，让我们先收集上下文：

**问题上下文：**
- 初始问题陈述或利益相关者请求
- 你观察到的症状（支持工单、流失数据、用户投诉）
- 现有研究（用户访谈、调查、分析数据）
- 你对该问题所做的假设

**利益相关者上下文：**
- 谁受到此问题的影响？（用户、客户、内部团队）
- 谁要求解决此问题？（高管、销售人员、客户）
- 谁可能被忽略了？

**你可以直接粘贴这些内容，也可以简要描述问题。**

---

## 阶段 1：向内审视

**目标：** 审视你自己的假设和偏见，以及你可能如何成为问题的一部分。

---

### 问题 1：问题是什么？（描述症状）

**智能体提问：**
“根据你目前的理解，问题是什么？请描述相关症状。”

**提供 4 个编号选项：**

1. **客户痛点** — “客户难以完成[特定任务/实现特定结果]”（例如，“客户找不到他们需要的功能”）
2. **业务指标问题** — “我们发现[指标下降]”（例如，“上季度客户流失率上升了 15%”）
3. **利益相关者请求** — “利益相关者表示我们需要[功能/变更]”（例如，“销售团队表示我们需要更完善的报告功能”）
4. **观察到的行为** — “我们注意到[模式/趋势]”（例如，“用户在新手引导的第 3 步放弃操作”）

**或者描述你的问题/症状。**

**用户回答：** [选择或自定义内容]

**智能体提取：**
- **问题（初始界定）：** [用户的描述]

---

### 问题 2：为什么我们还没有解决它？

**智能体询问：**
“为什么这个问题至今仍未得到解决？”

**提供 6 个编号选项（可多选）：**

1. **这是个新问题** — “问题最近才出现”
2. **它很难解决** — “技术复杂或需要投入大量资源”
3. **优先级较低** — “其他举措优先级更高”
4. **缺乏资源** — “没有足够的预算、人员或时间”
5. **缺乏权限** — “无法做出决策或获得支持”
6. **系统性不平等** — “问题对边缘化群体造成了尤为严重的影响，但被忽视了”

**或者描述你自己的原因。**

**用户回答：** [选择或自定义内容]

**智能体记录：**
- **解决问题的障碍：** [原因列表]

---

### 问题 3：我们如何成为了问题的一部分？（假设与偏见）

**智能体询问：**
“你（或你的团队）可能如何成为了问题的一部分？你带来了哪些假设或偏见？”

**提供 4 个编号选项：**

1. **假设我们知道客户想要什么** — “我们尚未向真实用户验证这一点”（确认偏误）
2. **为自己而非用户进行优化** — “构建对我们来说容易实现的东西，而不是对用户有价值的东西”（内部偏见）
3. **忽视特定用户群体** — “只关注多数用户，忽略了边缘情况或边缘化群体”（幸存者偏差）
4. **解决方案优先的思维** — “在理解根本问题之前，就直接认定‘我们需要[功能 X]’”（过早收敛）

**或者描述你的具体假设/偏见。**

**用户回答：** [选择或自定义内容]

**智能体记录：**
- **需要质疑的假设：** [偏见列表]

---

## 阶段 2：向外审视

**目标：** 了解谁正在经历这个问题、谁从中受益，以及谁被排除在外。

---

### 问题 4：谁正在经历这个问题？（何时、何地、后果）

**智能体询问：**
“谁正在经历这个问题？他们在何时、何地遇到它？他们面临哪些后果？”

**智能体提示用户描述：**
- **谁：** 具体的用户画像、用户群体或角色
- **何时：** 触发事件或情境（例如，“在新用户引导期间”“在月末结账时”）
- **何地：** 物理或数字位置（例如，“移动应用”“企业级部署环境”）
- **后果：** 对用户的影响（例如，“每周浪费 2 小时”“错过截止日期”“流失”）

**适配：** 使用上下文中的用户画像（初步用户画像、JTBD、客户研究）

**用户回答：** [详细描述]

**智能体记录：**
- **经历问题的人：** [用户画像/群体]
- **何时/何地：** [情境]
- **后果：** [影响]

---

### 问题 5：还有谁遇到这个问题？谁没有遇到？

**智能体询问：**
“还有谁遇到这个问题？（同事、竞争对手、其他领域？）谁没有遇到这个问题？”

**智能体提示：**
- **还有谁遇到：** 存在类似问题的其他公司、行业或领域
- **他们如何应对：** 权宜之计、解决方案或适应性措施
- **谁没有遇到：** 避免了该问题的用户/公司（他们有何不同？）

**用户回答：** [详细描述]

**智能体记录：**
- **还有谁遇到这个问题：** [示例]
- **谁没有这个问题：** [反例]

---

### 问题 6：谁被忽略了？谁从中受益？

**智能体提问：**
“到目前为止，谁被排除在讨论之外？当这个问题存在或不存在时，谁会从中受益？”

**智能体提示：**
- **谁被忽略了：** 边缘化群体的声音、边缘案例、被忽视的利益相关者
- **问题存在时谁会受益：** 谁会从现状中获益？
- **问题不存在时谁会受益：** 如果问题得到解决，谁会遭受损失？

**示例：**
- “当引导流程存在问题时，谁会受益？” → “销售团队不必支持复杂的工作流；工程团队不必构建引导式流程”
- “谁被忽略了？” → “非技术用户、国际客户（引导流程仅提供英文版本）”

**用户回答：** [详细描述]

**智能体记录：**
- **谁被忽略了：** [列表]
- **谁会受益（问题存在）：** [列表]
- **谁会受益（问题已解决）：** [列表]

---

## 阶段 3：重新定义

**目标：** 将洞察整合为清晰、可执行的问题陈述和“我们可以如何”问题。

---

### 问题 7：重新陈述问题

**智能体说道：**
“根据我们探索的所有内容，让我们以一种新的方式重新陈述这个问题。”

**智能体使用阶段 1-2 中的洞察生成经过完善的问题陈述：**

**模板：**
“问题是：[谁] 难以 [完成什么]，因为 [根本原因]，从而导致 [后果]。这会影响 [特定群体]，并且由于 [阶段 1 中的偏见/假设]，这个问题一直被忽视。”

**示例（SaaS 引导流程）：**
“问题是：缺乏技术背景的小企业主在引导流程中难以激活我们的产品，因为我们的 UI 使用了大量术语，并且缺少引导式工作流，从而导致 60% 的用户在 24 小时内放弃。这对缺乏技术支持的个体创业者影响尤为严重，而这个问题一直被忽视，是因为我们的团队主要针对拥有 IT 部门的企业用户进行优化。”

**智能体提问：**
“这个重新陈述是否抓住了核心问题？我们是否应该进一步完善？”

**用户回答：** [批准或修改]

---

### 问题 8：创建“我们可以如何”陈述

**智能体说道：**
“现在，让我们使用一条‘我们可以如何’陈述，使其变得可执行。”

**模板：**
“为了实现 [目标/期望状态]，我们可以如何 [解决问题的行动]？”

**示例（SaaS 引导流程）：**
“为了将激活率从 40% 提升至 70%，我们可以如何通过通俗易懂的提示引导非技术用户完成引导流程？”

**智能体提问：**
“这条 HMW 陈述是否界定了正确的解决方案空间？我们是否应该调整？”

**用户回答：** [批准或修改]

---

### 输出：问题定义画布 + HMW 陈述

完成该流程后，智能体输出：

```markdown
# Problem Framing Canvas: [Problem Name]

**Date:** [Today's date]

---

## Phase 1: Look Inward

### What is the problem? (Symptoms)
[Description from Q1]

### Why haven't we solved it?
- [Barrier 1 from Q2]
- [Barrier 2]
- [Barrier 3]

### How are we part of the problem? (Assumptions & biases)
- [Assumption 1 from Q3]
- [Assumption 2]
- [Assumption 3]

**Which of these might be redesigned, reframed, or removed?**
[Reflection on biases to challenge]

---

## Phase 2: Look Outward

### Who experiences the problem?
**Who:** [Personas/segments from Q4]
**When/Where:** [Context]
**Consequences:** [Impact on users]
**Lived experience varies:** [How different users experience it differently]

### Who else has this problem?
**Who else:** [Examples from Q5]
**How they deal with it:** [Workarounds]

### Who doesn't have it?
[Counter-examples from Q5]

### Who's been left out?
[Marginalized voices from Q6]

### Who benefits?
**When problem exists:** [Beneficiaries of status quo]
**When problem doesn't exist:** [Who loses if solved]

---

## Phase 3: Reframe

### Stated another way, the problem is:
[Refined problem statement from Q7]

### How Might We...
**How might we** [action from Q8] **as we aim to** [objective from Q8]?

---

## Next Steps

1. **Validate with users:** Use `skills/discovery-interview-prep/SKILL.md` to test reframed problem with customers
2. **Generate solutions:** Use `skills/opportunity-solution-tree/SKILL.md` to explore solution space
3. **Create problem statement:** Use `skills/problem-statement/SKILL.md` to formalize for PRD/roadmap
4. **Identify opportunities:** Use HMW statement to brainstorm solution ideas

---

**Ready to explore solutions? Let me know if you'd like to refine the problem framing or move to solution generation.**
```

---

## 示例

完整的问题框定示例请参阅 `examples/sample.md`。

简短示例节选：

```markdown
**Look Inward:** Churn spiked after onboarding change
**Look Outward:** New SMB users are most affected
**Reframe:** How might we reduce onboarding friction for first-time users?
```

## 常见陷阱

### 陷阱 1：跳过“向内审视”（假定自己是中立的）
**表现：** 团队没有审视自身偏见，就直接进入“向外审视”

**后果：** 群体迷思持续存在，各种假设未受到质疑

**修正：** 强制明确讨论各种假设和偏见（Q2-Q3）

---

### 陷阱 2：忽略“谁会受益”这一问题
**表现：** 在没有探究谁会从问题的存在中受益的情况下完成画布

**后果：** 忽视政治动态和变革阻力

**修正：** 始终询问：“如果这个问题得到解决，谁会遭受损失？”（Q6）

---

### 陷阱 3：问题陈述过于宽泛
**表现：** 重新框定的问题很模糊（“改善用户体验”）

**后果：** HMW 陈述不具备可操作性

**修正：** 让问题具体明确（谁、什么、何时、后果、根本原因）

---

### 陷阱 4：HMW 陈述过于狭窄
**表现：** “我们可以如何添加一个移动应用？”

**后果：** 将解决方案空间限制在单一构想上

**修正：** 保持 HMW 的广度：“我们可以如何让移动优先的用户在任何设备上访问核心工作流？”

---

### 陷阱 5：独自练习（缺乏多元视角）
**表现：** 产品经理独自填写画布

**后果：** 偏见持续存在，边缘化群体的声音仍被忽视

**修正：** 与跨职能团队共同开展画布研讨会，并纳入客户意见

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 将重新框定的问题转化为正式的问题陈述
- `skills/opportunity-solution-tree/SKILL.md` — 使用 HMW 陈述生成解决方案选项
- `skills/discovery-interview-prep/SKILL.md` — 与客户共同验证重新框定的问题

### 外部框架
- MITRE 创新工具包，“问题框定画布 v3”（2021）— 画布的起源，以公平为导向的设计思维
- 斯坦福大学设计学院，“我们可以如何”陈述 — 可操作的问题框定

### Dean 的工作
- [如果 Dean 有问题框定相关资源，请在此处添加链接]

---

**技能类型：** 交互式
**建议文件名：** `problem-framing-canvas.md`
**建议放置位置：** `/skills/interactive/`
**依赖项：** 使用 `skills/problem-statement/SKILL.md`