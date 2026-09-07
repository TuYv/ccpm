---
name: prioritize
description: "Use this skill when the user needs to prioritize features, define an MVP, create a roadmap, or decide what to build next. Also use when the user asks 'what should I build first,' 'is this feature worth building,' 'how do I decide between X and Y,' or 'feature prioritization.' Covers RICE prioritization, hypothesis testing, MVP definition, and ruthless feature prioritization for early-stage SaaS."
---
# 产品策略与优先级排序

最难的产品决策是决定不做什么。这个技能帮你评估想法、为功能打分，并决定下一步做什么——从而让你做出真正最重要的东西。

## 核心原则

- 功能本身赢不了市场。比任何人都更好地解决一个痛苦的难题，才能赢得市场。
- 发布能验证最大假设的最小东西。
- 产品工作是假设检验，而不是功能交付。
- 路线图是沟通工具，不是承诺。
- 对独立创始人：先做好一件事，再开始下一件。

---

## 工作流程

```
Prioritization Process:
- [ ] List all feature candidates
- [ ] Score each with RICE
- [ ] Cut anything scoring below threshold
- [ ] Define MVP scope for the winner
- [ ] Write the spec (see plan skill)
- [ ] Build it
```

---

## 第一步：列出候选功能

把每一个想法、请求和“我们应该做一个……”都汇集到同一个地方。

**告诉 AI：**
```
Help me organize feature candidates for prioritization:
- Product: [what it does]
- Current stage: [pre-launch / 0-$1K MRR / $1K-$10K MRR]
- Current pain points: [what users are asking for or struggling with]

Here are my feature ideas:
1. [Feature idea]
2. [Feature idea]
3. [Feature idea]
4. [Feature idea]

For each, identify: what user problem it solves, who it helps, and whether it drives
acquisition, activation, retention, or revenue.
```

---

## 第二步：用 RICE 打分

| 因素 | 问题 | 量级 |
|--------|----------|-------|
| **R — Reach（触达）** | 下一个季度会影响多少用户？ | 用户数量 |
| **I — Impact（影响）** | 能在多大程度上推动关键指标？ | 3=巨大， 2=高， 1=中， 0.5=低 |
| **C — Confidence（信心）** | 你对触达和影响的估计有多大把握？ | 100%、80%、50% |
| **E — Effort（投入）** | 需要多少人周的工程时间？ | 周数 |

**Score = (Reach x Impact x Confidence) / Effort**

按得分排序，但要运用自己的判断——分数只是讨论的起点，不是最终答案。

**告诉 AI：**
```
Score these features using RICE prioritization:

[Paste your feature list]

For our context:
- Total active users: [number]
- Key metric we're trying to improve: [activation rate / retention / revenue / etc.]
- My capacity: [solo founder / one developer / small team]

Create a table: Feature | Reach | Impact | Confidence | Effort | RICE Score | Rank
Then recommend which to build first and why — don't just go by the numbers.
```

---

## 第三步：定义 MVP 范围

对胜出的功能，要毫不留情地削减范围。

### 削减范围的五个问题

1. 它解决的是哪一个（ONE）问题？（不是三个。只有一个。）
2. 哪一个（ONE）用户画像对这个问题感受最强烈？
3. 能解决他们问题的最小体验是什么？
4. 在 v1 中，哪些可以采用手动、粗糙或在幕后处理的方式？
5. 让真实用户完成真实任务的最快路径是什么？

MVP 应当：
- 能被真实的人用于真实的目的
- 小到可以在 2-4 周内发布
- 带有埋点监测，让你能了解它是否有效
- 范围小得令人尴尬，但执行得出人意料地精致

**告诉 AI：**
```
Help me cut scope for this feature:
- Feature: [what you want to build]
- Full vision: [everything you'd ideally include]
- Time budget: [how long you want to spend — 1 week, 2 weeks, etc.]

What's the absolute minimum version that:
1. Solves the core problem
2. Ships within my time budget
3. Lets me learn whether users actually want this

List what's IN v1 and what's explicitly OUT (saved for v2).
```

---

## 对功能说不

出现以下情况时，砍掉这个功能：
- 它只服务于不到 10% 的目标用户
- 它增加的复杂性会波及其余 90% 的用户
- 它需要持续维护，却不能带来留存或收入
- 已存在“够用”的临时替代方案
- 它只是某个嗓门大的客户的销售请求，而非普遍模式
- 它把你推向一个不同的产品品类

**告诉 AI：**
```
A user/customer is requesting [feature]. Help me decide:
- What problem are they actually trying to solve?
- How many other users likely have this problem?
- Is there a workaround that's good enough?
- If we build it, what's the maintenance cost?
- Does this align with our core product direction?

Give me a recommendation: build it, defer it, or decline it — with reasoning
I can share with the requester.
```

---

## 功能规格模板

一旦决定了要做什么，先写好规格，再交给 AI 工具：

```markdown
## [Feature Name]

### Problem
What user problem does this solve? What's the evidence?

### Users
Who specifically needs this? How many?

### Proposed Solution
Describe the experience, not the implementation.

### Success Metrics
How will we know this worked? What moves?

### Scope (v1)
What's in. Be specific.

### Non-Goals (v1)
What's explicitly out. This is the most important section.

### Open Questions
What do we need to answer before building?

### Effort Estimate
T-shirt size: S / M / L / XL
```

完整的规格模板和示例请参见 **plan** 技能。

---

## 竞争定位

不要试图比拼功能数量。相反：

1. 找出在位者最薄弱的地方（通常是：复杂性、速度、价格或受众匹配度）
2. 在一件事上做到 10 倍好，而不是在十件事上做到好 10%
3. 定义你的“楔子”——你能决定性获胜的那个狭窄用例
4. 一旦占稳这个楔子，再从它向外扩张

---

## 常见错误

| 错误 | 修正方法 |
|---------|-----|
| 做呼声最高的，而非影响最大的 | 用 RICE 打分。声音大 ≠ 重要。 |
| 花了 3 个月才做完的“MVP” | 如果超过 2-4 周，说明范围还要再砍 |
| 没有定义成功指标 | 在动手之前就定义好“我们如何知道它奏效了” |
| 为单个客户的请求而开发功能 | 寻找 3 个以上用户/请求中的共同模式 |
| 为了对标竞争对手而堆功能 | 在你的楔子里拼深度，而不是拼广度 |
| 没有范围外清单 | 明确定义 v1 不包含什么，以防止范围蔓延 |

---

## 相关技能

- **plan** —— 优先级确定后，编写详细的规格说明
- **validate** —— 在开发之前验证需求
- **analytics** —— 设置埋点以衡量功能的影响
- **growth** —— 优先做能带动激活和留存的功能
- **build** —— 把你的规格交给 AI 工具并构建它
