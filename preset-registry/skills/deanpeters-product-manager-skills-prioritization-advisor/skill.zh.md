---
name: prioritization-advisor
argument-hint: "[decision context]"
description: Choose a prioritization framework based on stage, team context, and stakeholder needs. Use when deciding between RICE, ICE, value/effort, or another scoring approach.
intent: >-
  Guide product managers in choosing the right prioritization framework by asking adaptive questions about product stage, team context, decision-making needs, and stakeholder dynamics. Use this to avoid "framework whiplash" (switching frameworks constantly) or applying the wrong framework (e.g., using RICE for strategic bets or ICE for data-driven decisions). Outputs a recommended framework with implementation guidance tailored to your context.
type: interactive
best_for:
  - "Choosing the right prioritization framework for a team or stage"
  - "Deciding between RICE, ICE, value/effort, and similar models"
  - "Reducing debate about how to prioritize competing work"
scenarios:
  - "Which prioritization framework should my startup use right now?"
  - "Help me choose between RICE and value/effort for roadmap planning"
  - "We keep arguing about prioritization. Recommend a framework."
theme: strategy-positioning
estimated_time: "15-25 min"
---
## 目的
通过针对产品阶段、团队背景、决策需求和利益相关者动态提出自适应问题，指导产品经理选择合适的优先级排序框架。使用本指南可避免“框架反复横跳”（不断切换框架）或误用框架（例如，将 RICE 用于战略性押注，或将 ICE 用于数据驱动型决策）。输出推荐的框架，并提供根据你的具体情况定制的实施指导。

这不是一个评分计算器，而是一份决策指南，旨在根据你的具体情况匹配优先级排序框架。

## 输入

**最适合提供：** 你正尝试确定哪些事项的优先级，以及为什么现在要这样做（冲刺规划、路线图制定、利益相关者争执）。
**提供这些信息也很有帮助：** 产品阶段、团队规模、数据可用性，以及你尝试过但未奏效的框架。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息并跳过它们已涵盖的问题；不要重复询问。

**什么信息都没准备？也没问题。** 顾问会先询问你的产品阶段，以及你希望该框架帮助做出什么决策。

**调用示例：** `Help me pick a framework: seed-stage B2B startup, 40-item backlog, zero usage data, loud enterprise prospect.`

## 核心概念

### 优先级排序框架全景
常见框架及其适用场景：

**评分框架：**
- **RICE**（覆盖范围、影响力、信心、工作量）——数据驱动，需要指标
- **ICE**（影响力、信心、容易程度）——轻量级，用于直觉检验式评分
- **价值与工作量**（2x2 矩阵）——用于区分快速见效的事项与战略性押注
- **加权评分**——结合利益相关者意见自定义评估标准

**战略框架：**
- **Kano 模型**——根据客户满意度对功能进行分类（基本型、期望型、兴奋型）
- **机会评分**——评估重要性与满意度之间的差距
- **功能购买法**——让客户进行预算分配的练习
- **Moscow**（必须有、应该有、可以有、不会有）——用于推动团队做出艰难取舍

**情境框架：**
- **延迟成本**——基于紧迫程度（适用于时间敏感型功能）
- **影响地图**——以目标为驱动（将功能与成果关联起来）
- **故事地图**——基于用户旅程（关注叙事流程）

### 为什么这种方法有效
- **情境感知：** 根据产品阶段、团队成熟度和数据可用性匹配框架
- **反教条：** 不存在唯一“最佳”的框架——具体取决于你的情况
- **可执行：** 不仅提供框架名称，还提供实施步骤

### 反模式（本指南不是什么）
- **不是通用排名：** 框架并无“更好”或“更差”之分，只是适用于不同的情境
- **不能替代战略：** 框架用于执行战略，而不是制定战略
- **并非设置后即可置之不理：** 随着产品逐渐成熟，应重新评估所用框架

### 何时使用本指南
- 首次选择优先级排序框架
- 切换框架（当前框架不起作用）
- 让利益相关者就优先级排序流程达成一致
- 帮助新任产品经理熟悉团队实践

### 不适用的情况
- 已经有一个行之有效的框架时（不要修复没有问题的东西）
- 用于一次性决策时（框架适用于反复进行的优先级排序）
- 用来替代战略愿景时（框架无法告诉你应该构建什么）

---

### 引导流程的唯一事实来源

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如 Context Qx/8 和 Scoring Qx/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

此文件定义了特定领域的评估内容。如果存在冲突，请遵循此文件中的领域逻辑。

## 应用

此交互式技能会提出**最多 4 个自适应问题**，每一步提供 **3-4 个编号选项**。

---

### 问题 1：产品阶段

**智能体提问：**
“你的产品目前处于什么阶段？”

**提供 4 个编号选项：**

1. **产品/市场契合前阶段** — “正在寻找 PMF；快速试验；尚不清楚客户想要什么”（不确定性高，需要速度）
2. **初步实现 PMF，正在扩张** — “已初步实现 PMF；快速增长；通过增加功能来提升留存/扩展业务”（不确定性中等，需要平衡速度与质量）
3. **成熟产品，优化阶段** — “市场地位稳固；进行渐进式改进；凭借质量/功能参与竞争”（不确定性低，采用数据驱动的决策）
4. **多个产品/平台** — “拥有产品组合；存在跨产品依赖关系；利益相关者需求复杂”（协调复杂度高）

**或者描述你的产品阶段（新想法、增长模式、成熟阶段等）。**

**用户回答：** [选择或自定义回答]

---

### 问题 2：团队背景

**智能体提问：**
“你的团队和利益相关者环境是什么样的？”

**提供 4 个编号选项：**

1. **小型团队，资源有限** — “3-5 名工程师、1 名 PM，需要毫不留情地聚焦重点”（需要简单、快速的框架）
2. **跨职能团队，目标一致** — “产品、设计和工程团队目标一致；目标明确；协作良好”（可以使用数据驱动的框架）
3. **多个利益相关者，意见不一致** — “高管、销售和客户都有各自的意见；需要透明的流程”（需要能够促进共识的框架）
4. **大型组织，依赖关系复杂** — “多个团队、共享路线图、存在跨团队依赖关系”（需要协调框架）

**或者描述你的团队/利益相关者背景。**

**用户回答：** [选择或自定义回答]

---

### 问题 3：决策需求

**智能体提问：**
“你希望通过优先级排序解决的主要挑战是什么？”

**提供 4 个编号选项：**

1. **想法太多，不清楚该推进哪些** — “待办事项超过 100 项；需要缩减到最重要的 10 项”（需要筛选框架）
2. **利益相关者对优先级意见不一致** — “销售团队想要功能，高管想要战略性投入，工程团队想要处理技术债务”（需要促进对齐的框架）
3. **缺乏数据驱动的决策** — “依靠直觉确定优先级；希望采用基于指标的流程”（需要评分框架）
4. **难以在战略性投入与速赢项目之间进行取舍** — “在长期愿景与短期客户需求之间寻求平衡”（需要价值/投入框架）

**或者描述你的具体挑战。**

**用户回答：** [选择或自定义回答]

---

### 问题 4：数据可用性

**智能体提问：**
“你有多少数据可用于确定优先级？”

**提供 3 个编号选项：**

1. **数据极少** — “新产品，没有使用指标，可供调研的客户很少”（基于直觉的框架）
2. **有一些数据** — “有基础分析数据和客户反馈，但没有严谨的数据收集机制”（轻量级评分框架）
3. **数据丰富** — “有使用指标、A/B 测试、客户调研和明确的成功指标”（数据驱动型框架）

**或者描述你的数据情况。**

**用户回答：** [选择或自定义回答]

---

### 输出：推荐优先级排序框架

收集完回答后，智能体会推荐一个框架：

```markdown
# Prioritization Framework Recommendation

**Based on your context:**
- **Product Stage:** [From Q1]
- **Team Context:** [From Q2]
- **Decision-Making Need:** [From Q3]
- **Data Availability:** [From Q4]

---

## Recommended Framework: [Framework Name]

**Why this framework fits:**
- [Rationale 1 based on Q1-Q4]
- [Rationale 2]
- [Rationale 3]

**When to use it:**
- [Context where this framework excels]

**When NOT to use it:**
- [Limitations or contexts where it fails]

---

## How to Implement

### Step 1: [First implementation step]
- [Detailed guidance]
- [Example: "Define scoring criteria: Reach, Impact, Confidence, Effort"]

### Step 2: [Second step]
- [Detailed guidance]
- [Example: "Score each feature on 1-10 scale"]

### Step 3: [Third step]
- [Detailed guidance]
- [Example: "Calculate RICE score: (Reach × Impact × Confidence) / Effort"]

### Step 4: [Fourth step]
- [Detailed guidance]
- [Example: "Rank by score; review top 10 with stakeholders"]

---

## Example Scoring Template

[Provide a concrete example of how to use the framework]

**Example (if RICE):**

| Feature | Reach (users/month) | Impact (1-3) | Confidence (%) | Effort (person-months) | RICE Score |
|---------|---------------------|--------------|----------------|------------------------|------------|
| Feature A | 10,000 | 3 (massive) | 80% | 2 | 12,000 |
| Feature B | 5,000 | 2 (high) | 70% | 1 | 7,000 |
| Feature C | 2,000 | 1 (medium) | 50% | 0.5 | 2,000 |

**Priority:** Feature A > Feature B > Feature C

---

## Alternative Framework (Second Choice)

**If the recommended framework doesn't fit, consider:** [Alternative framework name]

**Why this might work:**
- [Rationale]

**Tradeoffs:**
- [What you gain vs. what you lose]

---

## Common Pitfalls with This Framework

1. **[Pitfall 1]** — [Description and how to avoid]
2. **[Pitfall 2]** — [Description and how to avoid]
3. **[Pitfall 3]** — [Description and how to avoid]

---

## Reassess When

- Product stage changes (e.g., PMF → scaling)
- Team grows or reorganizes
- Stakeholder dynamics shift
- Current framework feels broken (e.g., too slow, ignoring important factors)

---

**Would you like implementation templates or examples for this framework?**
```

---

## 示例

### 示例 1：框架匹配良好（早期 PMF，RICE）

**Q1 回答：**“早期 PMF，正在扩张——已找到初步的 PMF；增长迅速；正在添加功能以提高留存并扩大用户规模”

**Q2 回答：**“跨职能团队，目标一致——产品、设计和工程团队保持一致；目标明确”

**Q3 回答：**“缺乏数据驱动的决策——依靠直觉确定优先级；希望采用基于指标的流程”

**Q4 回答：**“有一些数据——具备基础分析数据和客户反馈，但没有严格的数据收集机制”

---

**推荐框架：RICE（覆盖范围、影响力、信心度、工作量）**

**适用原因：**
- 你有一些数据（分析数据、客户反馈），可用于估算覆盖范围和影响力
- 跨职能团队目标一致，意味着你们可以就评分标准达成共识
- 从依靠直觉转向数据驱动 = RICE 可以提供结构化方法，同时又不会过于复杂
- 处于早期 PMF 阶段 = 既需要速度，也需要优先考虑对留存和扩张有重大影响的功能

**适用场景：**
- 季度或月度路线图规划
- 当待办事项超过 20-30 项时
- 当利益相关者对优先级存在争议时

**不适用场景：**
- 战略性的跨季度投入（RICE 更偏向渐进式成果）
- 当你缺乏基本指标时（覆盖范围需要使用情况数据）
- 单一功能决策（大材小用）

---

**实施方法：**

### 第 1 步：定义评分标准
- **覆盖范围：**此功能每月/每季度会影响多少用户？
- **影响力：**它能在多大程度上改善用户体验？（1 = 轻微，2 = 较高，3 = 巨大）
- **信心度：**你对覆盖范围/影响力估算有多大把握？（50% = 数据较少，80% = 数据充分，100% = 确定）
- **工作量：**构建此功能需要多少人月？（包括设计、工程和 QA）

### 第 2 步：为每项功能评分
- 使用电子表格或 Airtable
- 让 PM、设计和工程团队共同参与评分（不要只由 PM 单独评分）
- 如实评估信心度（不要夸大分数）

### 第 3 步：计算 RICE 分数
- 公式：`(Reach × Impact × Confidence) / Effort`
- 分数越高 = 优先级越高

### 第 4 步：审查并调整
- 按 RICE 分数排序
- 与利益相关者一起审查排名前 10-20 的项目
- 根据战略优先事项进行调整（RICE 无法涵盖所有因素）

---

**评分示例：**

| 功能 | 覆盖范围 | 影响力 | 信心度 | 工作量 | RICE 分数 |
|---------|-------|--------|------------|--------|------------|
| 电子邮件提醒 | 5,000 | 2 | 70% | 1 | 7,000 |
| 移动应用 | 10,000 | 3 | 60% | 6 | 3,000 |
| 深色模式 | 8,000 | 1 | 90% | 0.5 | 14,400 |

**优先级：**深色模式 > 电子邮件提醒 > 移动应用（尽管移动应用的覆盖范围/影响力较高，但工作量过大）

---

**替代框架：ICE（影响力、信心度、易实现程度）**

**可能适用的原因：**
- 比 RICE 更简单（无需计算覆盖范围）
- 评分更快（适合需要快速决策的情况）

**权衡：**
- 数据驱动程度较低（没有覆盖范围指标 = 无法比较影响不同用户群体的功能）
- 主观性更强（影响力/易实现程度依赖直觉，而非指标）

---

**常见陷阱：**

1. **过度看重工作量**——不要仅仅因为困难问题得分低就回避它们。一些战略性投入确实需要较高的工作量。
2. **夸大信心度**——请如实评估。如果数据稀缺，50% 的信心度也没有问题。
3. **忽视战略**——RICE 无法体现战略重要性。应根据愿景/目标进行调整。

---

### 示例 2：框架匹配不当（PMF 前阶段 + RICE = 不合适）

**Q1 回答：**“尚未达到产品/市场契合 — 正在寻找 PMF；快速开展实验”

**Q2 回答：**“小型团队，资源有限 — 3 名工程师，1 名 PM”

**Q3 回答：**“想法太多，不清楚应该推进哪些”

**Q4 回答：**“数据极少 — 新产品，没有使用指标”

---

**推荐框架：ICE（影响、信心、难易度）或价值/工作量矩阵**

**为什么不选择 RICE：**
- 你没有使用数据来估算覆盖范围
- PMF 前阶段意味着你需要速度，而不是严格的评分
- 团队规模小，RICE 评分的开销过于沉重

**为什么改用 ICE：**
- 轻量级、依靠直觉检验的框架
- 可在 30 分钟内为 20 个想法评分
- 适合快速实验阶段

**或者使用价值/工作量矩阵：**
- 可视化 2x2 矩阵（高价值/低工作量 = 快速见效项）
- 甚至比 ICE 更快
- 有利于利益相关者达成共识（可视化、直观）

---

## 常见陷阱

### 陷阱 1：使用了不适合当前阶段的框架
**表现：**PMF 前阶段的初创公司使用包含 10 项标准的加权评分

**后果：**额外开销扼杀速度。你需要的是实验，而不是严格的评分。

**解决方法：**让框架与阶段相匹配。PMF 前阶段 = ICE 或价值/工作量矩阵。规模化阶段 = RICE。成熟阶段 = 机会评分法或 Kano。

---

### 陷阱 2：频繁切换框架
**表现：**每个季度都更换框架

**后果：**团队困惑、浪费时间、缺乏一致性。

**解决方法：**坚持使用同一个框架 6-12 个月。仅当阶段或背景发生变化时才重新评估。

---

### 陷阱 3：将评分奉为圭臬
**表现：**“功能 A 得分 8,000，功能 B 得分 7,999，所以 A 胜出”

**后果：**忽视战略背景、判断和愿景。

**解决方法：**将框架作为决策输入，而不是自动化决策工具。必要时，PM 的判断可以推翻评分结果。

---

### 陷阱 4：PM 单独评分
**表现：**PM 独自为功能评分，然后向团队展示

**后果：**缺乏认同，工程和设计团队不信任评分结果。

**解决方法：**开展协作式评分会议。PM、设计和工程团队共同评分。

---

### 陷阱 5：完全没有框架
**表现：**“谁喊得最响，我们就优先做谁的需求”

**后果：**最终胜出的是 HiPPO（薪酬最高者的意见），而不是数据或战略。

**解决方法：**选择*任何一个*框架。即使结构不完美，也胜过混乱。

---

## 参考资料

### 相关技能
- `user-story.md` — 将已确定优先级的功能转化为用户故事
- `epic-hypothesis.md` — 通过实验验证已确定优先级的史诗
- `recommendation-canvas.md` — 业务成果为优先级排序提供依据

### 外部框架
- Intercom，*RICE 优先级排序*（2016）— RICE 框架的起源
- Sean McBride，*ICE 评分*（2012）— 轻量级优先级排序
- Luke Hohmann，*创新游戏*（2006）— 购买功能及其他协作方法
- Noriaki Kano，*Kano 模型*（1984）— 客户满意度框架

### Dean 的工作
- [如果 Dean 有优先级排序相关资源，请在此处添加链接]

---

**技能类型：**交互式
**建议文件名：**`prioritization-advisor.md`
**建议放置位置：**`/skills/interactive/`
**依赖项：**无（可独立使用，但会影响路线图和待办事项决策）