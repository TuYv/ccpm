---
name: discovery-interview-prep
argument-hint: "[research goal]"
description: Plan customer discovery interviews with the right goal, segment, constraints, and method. Use when preparing interviews for problem validation, churn research, or new product ideas.
intent: >-
  Guide product managers through preparing for customer discovery interviews by asking adaptive questions about research goals, customer segments, constraints, and methodologies. Use this to design effective interview plans, craft targeted questions, avoid common biases, and maximize learning from limited customer access—ensuring discovery interviews yield actionable insights rather than confirmation bias or surface-level feedback.
type: interactive
theme: discovery-research
best_for:
  - "Designing a customer discovery interview plan"
  - "Choosing the right interview methodology for your goals and constraints"
  - "Preparing for research with limited customer access"
scenarios:
  - "I need to interview 5 enterprise customers about why they churned in the last 90 days"
  - "I'm validating a new product idea with a 2-week deadline and cold outreach only"
  - "I want to understand why users aren't activating on our core feature"
estimated_time: "15-20 min"
---
## 目的
通过针对研究目标、客户细分、约束条件和研究方法提出适应性问题，引导产品经理为客户探索访谈做好准备。使用此技能可设计有效的访谈计划、制定有针对性的问题、避免常见偏见，并在客户接触机会有限的情况下最大限度地获取认知——确保探索访谈能够产出可操作的洞察，而不是确认偏误或停留在表层的反馈。

这不是一个脚本生成器，而是一个战略性准备流程，其输出包括量身定制的访谈计划、研究方法、问题框架和成功标准。

## 输入

**最适合提供：** 你的研究目标——你需要从客户那里了解什么。
**同样有用：** 客户细分、接触约束（可以进行多少次访谈、需要在何时之前完成），以及你当前持有的任何假设。

调用时提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息并跳过其已涵盖的内容；不要重复提问。

**毫无准备也没关系。** 此技能会先询问你的主要访谈目标，然后通过后续问题逐步缩小范围。

**调用示例：** `Prep interviews to understand why enterprise customers churn after 6 months — I can get 5 interviews in 2 weeks.`

## 核心概念

### 探索访谈准备流程
一个交互式流程，能够：
1. 收集产品/问题背景信息（营销材料、假设）
2. 明确研究目标（你试图了解什么）
3. 确定目标客户细分和接触约束
4. 推荐访谈方法（待办任务、问题验证、转换访谈等）
5. 生成访谈框架，其中包含问题、需要避免的偏见和成功指标

### 为什么这种方法有效
- **目标驱动：** 使访谈方法与你需要了解的内容保持一致
- **自适应：** 根据产品阶段（构想阶段与现有产品）和接触约束调整研究方法
- **偏见意识：** 指出常见陷阱（诱导性问题、确认偏误、解决方案优先思维）
- **可操作：** 输出可直接使用的访谈指南

### 反模式（这不是什么）
- **不是用户测试脚本：** 探索 = 了解问题；测试 = 验证解决方案
- **不是销售演示：** 不要推销——要倾听和学习
- **不是大规模调查：** 这是深入的定性访谈（5-10 人），而不是广泛的调查（100 人以上）

### 何时使用
- 开始产品探索（验证问题空间）
- 重新定位现有产品（了解新市场）
- 调查客户流失或用户流失节点（留存访谈）
- 在构建前评估功能构想
- 为客户开发冲刺做准备

### 何时不应使用
- 对原型进行用户测试（应改用可用性测试框架）
- 开展大规模定量研究（应使用调查、分析工具）
- 当你已经了解问题时（应进入解决方案验证阶段）

---

### 引导流程的唯一可信来源

将 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 用作此技能的默认交互协议。

它定义了：
- 会话提示 + 进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如，上下文问题 x/8 和评分问题 x/5）
- 中断处理和暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

此文件定义特定领域的评估内容。如果存在冲突，请遵循此文件的领域逻辑。

## 应用

此交互式技能会提出**最多 4 个自适应问题**，并在每一步提供 **3-4 个编号选项**。

---

### 第 0 步：收集上下文（提问前）

**智能体建议：**

在设计访谈计划之前，让我们先收集上下文：

**针对您自己的产品（现有或计划中的产品）：**
- 问题假设或产品概念描述
- 目标客户细分群体（如果已知）
- 现有研究（支持工单、流失数据、用户反馈）
- 产品网站或定位材料
- 您正尝试验证的关键假设

**针对现有问题进行调查：**
- 客户投诉、支持工单或流失原因
- 关于客户为何离开或遇到困难的假设
- 客户转而选择的竞品替代方案

**如果正在探索新的问题领域：**
- 寻找类似产品或相邻解决方案
- 复制竞品材料、客户评论（G2、Capterra）或社区讨论（Reddit、论坛）
- 我们将使用这些内容来构建假设

**您可以直接粘贴这些内容，也可以提供简要描述后继续。**

---

### 问题 1：研究目标

**智能体提问：**
“这些探索访谈的首要目标是什么？（您需要了解什么？）”

**提供 4 个编号选项：**

1. **问题验证** — “确认问题确实存在，并且带来的痛苦足以值得解决”（适用于新产品创意）
2. **待办任务探索** — “了解客户试图完成什么，以及当前解决方案为何失败”（适用于产品战略）
3. **留存/流失调查** — “弄清楚客户为何离开或未能完成激活”（适用于存在流失问题的现有产品）
4. **功能优先级排序** — “验证哪些问题/功能对客户最重要”（适用于路线图规划）

**或者描述您自己的研究目标（请具体说明：您试图回答什么问题？）。**

**用户回答：** [选择或自定义回答]

---

### 问题 2：目标客户细分群体

**智能体提问：**
“您的访谈对象是谁？（请尽可能具体。）”

**提供 4 个编号选项（根据问题 1 进行调整）：**

**示例（如果问题 1 = 问题验证）：**
1. **经常遇到该问题的人** — 例如，“每周手动处理发票的小企业主”（问题高频发生）
2. **曾尝试解决该问题的人** — 例如，“尝试过 2 个以上竞品解决方案并已流失的用户”（了解失败原因）
3. **目标细分群体中的人（无论是否意识到该问题）** — 例如，“所有自由职业者，即使他们没有意识到开具发票是个问题”（发现潜在需求）
4. **最近遇到过该问题的人** — 例如，“过去 30 天内流失的客户”（记忆犹新）

**或者描述你的具体目标细分群体（角色、公司规模、行为、人口统计特征）。**

**调整提示：** 使用所提供材料中的用户画像或客户细分群体。

**用户回答：** [选择或自定义回答]

---

### 问题 3：限制条件

**智能体提问：**
“开展这些访谈时，你面临哪些限制条件？”

**提供以下 4 个编号选项：**

1. **接触渠道有限** — “只能访谈 5–10 位客户，需要在 2 周内获得结果”（常见于初创公司或时间紧迫的情况）
2. **已有客户群** — “拥有 100 多位活跃客户，可以轻松招募受访者”（成熟产品的优势）
3. **需要冷启动拓展** — “没有现有客户；需要通过 LinkedIn、广告或社区从零开始招募受访者”（新产品面临的挑战）
4. **仅限内部利益相关者** — “可以访谈每天与客户沟通的销售/支持团队”（代理研究，不太理想但务实可行）

**或者描述你的具体限制条件（预算、时间、接触渠道、团队能力）。**

**用户回答：** [选择或自定义回答]

---

### 问题 4：访谈方法

**智能体提问：**
“根据你的目标（[Q1]）、目标细分群体（[Q2]）和限制条件（[Q3]），以下是推荐的访谈方法：”

**提供 3–4 个编号选项（根据 Q1–Q3 的具体情况调整）：**

**示例（如果 Q1 = 问题验证、Q2 = 经常遇到该问题的人、Q3 = 接触渠道有限）：**

1. **问题验证访谈（Mom Test 风格）** — 询问过去的行为，而非假设性问题。重点询问：“请告诉我你上一次[遇到该问题]时的情况。你尝试了什么？结果如何？”（最适合：验证问题是否真实存在且足够令人困扰）

2. **待办任务（JTBD）访谈** — 关注客户想要完成什么，而不是他们想要什么。询问：“你当时想完成什么？你考虑过哪些替代方案？是什么让你选择了 X？”（最适合：了解动机和转换行为）

3. **转换访谈** — 访谈最近从竞争对手或替代方案转换过来的客户。询问：“是什么促使你寻找新的解决方案？是什么‘推力’让你离开原来的工具？又是什么‘拉力’吸引你尝试我们的产品？”（最适合：了解竞争定位和未满足的需求）

4. **时间线/旅程映射访谈** — 按时间顺序梳理受访者的完整经历。询问：“请从你第一次遇到这个问题时讲起。接下来发生了什么？你是如何尝试解决它的？”（最适合：挖掘完整背景和痛点）

**选择一个编号、组合多种方法（例如“1 & 2”），或者描述你自己的方法。**

**调整示例：**
- 如果 Q1 = 留存/流失 → 优先选择“流失访谈”或“转换访谈（从你的产品转向其他方案）”
- 如果 Q1 = 功能优先级排序 → 优先选择“机会解决方案树访谈”或“Kano 模型访谈”
- 如果 Q3 = 仅限内部利益相关者 → 添加说明：“代理研究（与销售/支持团队沟通）总比什么都不做要好，但应尽快通过真实客户进行验证”

**用户回答：** [选择或自定义回答]

---

### 输出：生成访谈计划

```markdown
# Discovery Interview Plan

**Research Goal:** [From Q1]
**Target Segment:** [From Q2]
**Constraints:** [From Q3]
**Methodology:** [From Q4]

---

## Interview Framework

### Opening (5 minutes)
- **Build rapport:** "Thanks for taking the time. I'm [name], and I'm researching [problem space]. This isn't a sales call—I'm here to learn from your experience."
- **Set expectations:** "I'll ask about your experiences with [topic]. There are no right answers. Feel free to be honest—critical feedback is most helpful."
- **Get consent:** "Is it okay if I take notes / record this conversation?"

---

### Core Questions (30-40 minutes)

**Based on your methodology ([Q4]), here are suggested questions:**

#### [Methodology Name] Questions:

1. **[Question 1]** — [Rationale for asking this]
   - **Follow-up:** [Dig deeper with...]
   - **Avoid:** [Don't ask leading version like...]

2. **[Question 2]** — [Rationale]
   - **Follow-up:** [...]
   - **Avoid:** [...]

3. **[Question 3]** — [Rationale]
   - **Follow-up:** [...]
   - **Avoid:** [...]

4. **[Question 4]** — [Rationale]
   - **Follow-up:** [...]
   - **Avoid:** [...]

5. **[Question 5]** — [Rationale]
   - **Follow-up:** [...]
   - **Avoid:** [...]

**Example (if Methodology = Problem validation - Mom Test style):**

1. **"Tell me about the last time you [experienced this problem]."** — Gets specific, recent behavior (not hypothetical)
   - **Follow-up:** "What were you trying to accomplish? What made it hard? What did you try?"
   - **Avoid:** "Would you use a tool that solves this?" (leading, hypothetical)

2. **"How do you currently handle [this problem]?"** — Reveals workarounds, alternatives, pain intensity
   - **Follow-up:** "How much time/money does that take? What's frustrating about it?"
   - **Avoid:** "Don't you think that's inefficient?" (leading)

3. **"Can you walk me through what you did step-by-step?"** — Uncovers details, edge cases, context
   - **Follow-up:** "What happened next? Where did you get stuck?"
   - **Avoid:** "Was it hard?" (yes/no question, not useful)

4. **"Have you tried other solutions for this?"** — Reveals competitive landscape, unmet needs
   - **Follow-up:** "What did you like/dislike? Why did you stop using it?"
   - **Avoid:** "Would you pay for a better solution?" (hypothetical)

5. **"If you had a magic wand, what would change?"** — Opens space for ideal outcomes (but treat with skepticism—focus on past behavior, not wishes)
   - **Follow-up:** "Why does that matter to you? What would that enable?"
   - **Avoid:** Taking feature requests literally

---

### Closing (5 minutes)
- **Summarize:** "Just to recap, I heard that [key insights]. Did I get that right?"
- **Ask for referrals:** "Do you know anyone else who experiences this problem? Could you introduce me?"
- **Thank them:** "This was incredibly helpful. I really appreciate your time."

---

## Biases to Avoid

1. **Confirmation bias:** Don't ask "Don't you think X is a problem?" → Ask "Tell me about your experience with X."
2. **Leading questions:** Don't ask "Would you use this?" → Ask "What have you tried? Why did it work/fail?"
3. **Hypothetical questions:** Don't ask "If we built Y, would you pay?" → Ask "What do you currently pay for? Why?"
4. **Pitching disguised as research:** Don't say "We're building Z to solve X" → Say "I'm researching X. Tell me about your experience."
5. **Yes/no questions:** Don't ask "Is invoicing hard?" → Ask "Walk me through your invoicing process."

---

## Success Criteria

You'll know these interviews are successful if:

✅ **You hear specific stories, not generic complaints** — "Last Tuesday, I spent 3 hours..." vs. "Invoicing is annoying"
✅ **You uncover past behavior, not hypothetical wishes** — "I tried Zapier but quit after 2 weeks" vs. "I'd probably use automation"
✅ **You identify patterns across 3+ interviews** — Same pain points emerge independently
✅ **You're surprised by something** — If everything confirms your assumptions, you're asking leading questions
✅ **You can quote customers verbatim** — Actual language = authentic insights

---

## Interview Logistics

**Recruiting:**
- [Based on Q3 constraints, suggest recruitment channels]
- **Example (if Q3 = Limited access):** "Reach out to 20-30 people to get 5-10 interviews (33% response rate is typical)"
- **Example (if Q3 = Existing customers):** "Email 50 customers with $50 Amazon gift card incentive"

**Scheduling:**
- 45-60 minutes per interview (30-40 min conversation + buffer)
- Record if possible (with consent), or take detailed notes
- Schedule 2-3 per day max (you need time to synthesize)

**Synthesis:**
- After each interview, write key insights immediately (memory fades fast)
- After 5 interviews, look for patterns (common pains, jobs, workarounds)
- Use `problem-statement.md` to frame findings

---

**Ready to start recruiting and interviewing? Let me know if you'd like to refine any part of this plan.**
```

---

## 示例

### 示例 1：良好的探索访谈准备（问题验证）

**步骤 0 - 背景：** 用户分享假设：“自由职业者浪费时间手动催收逾期款项。”

**Q1 回答：** “问题验证——确认逾期付款跟进是否痛苦到值得解决”

**Q2 回答：** “经常遇到该问题的人——每月向 5 个以上客户开具发票的自由职业者”

**Q3 回答：** “需要冷启动外联——没有现有客户；需要通过 LinkedIn、Reddit 和自由职业者社区招募”

**Q4 回答：** “问题验证访谈（The Mom Test 风格）——关注过去的行为，而不是假设性问题”

**生成的计划：** 包含 5 个 The Mom Test 风格的问题（上一次催收逾期款项是什么时候、目前如何处理、尝试过哪些方法等）、需要避免的偏差（诱导性问题、假设性问题），以及成功标准（具体经历、过去的行为、在 3 次以上访谈中出现的共同模式）。

**这种方法有效的原因：**
- 目标明确（验证问题是否真实存在）
- 细分群体具体（每月服务 5 个以上客户的自由职业者）
- 方法与目标相匹配（使用 The Mom Test 进行验证）
- 问题关注过去的行为，而不是愿望
- 成功标准可衡量

---

## 常见误区

### 误区 1：询问客户想要什么
**表现：** “你希望我们开发哪些功能？”

**后果：** 你得到的是功能请求，而不是问题。客户并不知道解决方案。

**修正方法：** 询问过去的行为：“请谈谈你上一次因 X 而陷入困境的经历。”

---

### 误区 2：推销而不是倾听
**表现：** 花 20 分钟解释你的产品创意

**后果：** 客户会觉得有义务说些好话。你无法获得坦诚的反馈。

**修正方法：** 在最后 5 分钟之前不要提及你的解决方案（甚至可以完全不提）。专注于他们的问题。

---

### 误区 3：访谈了错误的人群
**表现：** 访谈朋友、家人或没有遇到该问题的人

**后果：** 得到的是礼貌性反馈，而不是真正的洞察。

**修正方法：** 访谈近期经常遇到该问题的人。

---

### 误区 4：进行 1-2 次访谈后就停止
**表现：** “我们和 2 个人聊过，他们都很喜欢，那就开始开发吧！”

**后果：** 样本量小 = 确认偏误。

**修正方法：** 至少访谈 5-10 人。寻找共同模式，而不是关注一次性反馈。

---

### 误区 5：不记录洞察
**表现：** 访谈后依赖记忆

**后果：** 丢失细节、错误记忆原话，并且无法发现共同模式。

**修正方法：** 在获得同意后录音，或进行详细记录。每次访谈结束后立即归纳整理。

---

## 参考资料

### 相关技能
- `problem-statement.md` — 使用访谈洞察构建问题陈述
- `proto-persona.md` — 定义访谈目标细分群体
- `jobs-to-be-done.md` — 用于访谈的 JTBD 方法论

### 外部框架
- Rob Fitzpatrick，*The Mom Test*（2013）——如何提出好问题而不使回答产生偏差
- Clayton Christensen，*Jobs to Be Done*——用于理解动机的访谈方法论
- Teresa Torres，*Continuous Discovery Habits*（2021）——机会解决方案树访谈

### Dean 的工作
- 问题框定画布（综合访谈结果）

---

**技能类型：** 交互式
**建议的文件名：** `discovery-interview-prep.md`
**建议的存放位置：** `/skills/interactive/`
**依赖项：** 使用 `problem-statement.md`、`proto-persona.md`、`jobs-to-be-done.md`