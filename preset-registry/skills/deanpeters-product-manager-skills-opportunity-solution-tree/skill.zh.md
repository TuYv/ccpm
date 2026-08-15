---
name: opportunity-solution-tree
argument-hint: "[stakeholder request or outcome]"
description: Build an Opportunity Solution Tree from outcomes to opportunities, solutions, and tests. Use when a stakeholder request needs problem framing before you decide what to build.
intent: >-
  Guide product managers through creating an Opportunity Solution Tree (OST) by extracting target outcomes from stakeholder requests, generating opportunity options (problems to solve), mapping potential solutions, and selecting the best proof-of-concept (POC) based on feasibility, impact, and market fit. Use this to move from vague product requests to structured discovery, ensuring teams solve the right problems before jumping to solutions—avoiding "feature factory" syndrome and premature convergence on ideas.
type: interactive
theme: discovery-research
best_for:
  - "Turning a stakeholder feature request back into a problem worth solving"
  - "Connecting a desired outcome to opportunities, solutions, and tests"
  - "Showing why one solution was chosen over the alternatives"
scenarios:
  - "A stakeholder asked for a specific feature and I want to reframe it as a problem first"
  - "I need to show leadership why we picked this solution over the three alternatives"
estimated_time: "30-45 min"
---
## 目的
指导产品经理创建机会解决方案树（Opportunity Solution Tree，OST）：从利益相关者的请求中提取目标成果，生成机会选项（需要解决的问题），映射潜在解决方案，并根据可行性、影响力和市场契合度选择最佳概念验证（POC）。使用这一方法，将模糊的产品请求转化为结构化的发现过程，确保团队在直接跳到解决方案之前先解决正确的问题，从而避免“功能工厂”综合征以及过早收敛于某个想法。

这不是路线图生成器，而是一套结构化的发现流程，其产出是经过验证的机会以及可测试的解决方案假设。

## 输入

**最适合提供：** 利益相关者的请求，或你希望从中出发的目标成果。  
**同样有用：** 已有的客户证据、约束条件，以及已经有人在推动的解决方案。

调用时提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息，并跳过其中已涵盖的问题；不要重复询问。

**手头什么都没有？也没问题。** 该技能会首先询问具体请求或期望成果，然后从中提取可衡量的目标成果。

**调用示例：** `Build an OST from this request: 'Sales says we need a mobile app because competitors have one.'`

## 核心概念

### 什么是机会解决方案树（OST）？

OST 是一种可视化框架（Teresa Torres，*Continuous Discovery Habits*），用于连接：
1. **期望成果**（业务目标或产品指标）
2. **机会**（能够推动成果的客户问题、需求、痛点或愿望）
3. **解决方案**（应对每个机会的方法）
4. **实验**（用于验证解决方案的测试）

**结构：**
```
         Desired Outcome (1)
                |
    +-----------+-----------+
    |           |           |
Opportunity  Opportunity  Opportunity (3)
    |           |           |
  +-+-+       +-+-+       +-+-+
  | | |       | | |       | | |
 S1 S2 S3    S1 S2 S3    S1 S2 S3 (9 total solutions)
```

### 为什么这种方法有效
- **成果驱动：** 从业务目标出发，而不是从功能请求出发
- **先发散，后收敛：** 在选择解决方案之前探索多个机会
- **聚焦问题：** 机会应当是问题，而不是伪装成问题的解决方案
- **可测试：** 每个解决方案都对应具体实验，而不是仅仅“构建并发布”
- **POC 选择：** 在投入资源之前评估可行性、影响力和市场契合度

### 反模式（这不是什么）
- **不是功能列表：** 机会是客户面临的问题，而不是“我们需要深色模式”
- **不是解决方案优先：** 不要从“我们应该构建 X”开始，而要从“客户在 Y 方面遇到困难”开始
- **不是瀑布式规划：** OST 是一种发现工具，而不是项目计划
- **不是一次性练习：** 随着你从实验中不断学习，OST 也会持续演变

### 何时使用
- 利益相关者提出功能或产品计划请求时
- 开始探索新的产品领域时
- 澄清模糊的 OKR 或战略目标时
- 确定应优先解决哪些问题时
- 让团队就正在推动的成果达成一致时

### 不适用的情况
- 问题已经得到验证时（转入解决方案测试）
- 处理战术性缺陷修复或技术债务时（无需探索）
- 利益相关者要求采用特定解决方案时（应先解决共识问题）

---

### 引导流程的权威依据

使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的默认交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文倾倒、最佳推测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如，背景问题 x/8 和评分问题 x/5）
- 中断处理以及暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文档定义了特定领域的评估内容。如有冲突，请遵循本文档的领域逻辑。

## 应用

使用 `template.md` 获取完整的填写结构。

此交互式技能遵循**两阶段流程**：

**阶段 1：** 生成 OST（提取成果、识别机会、梳理解决方案）
**阶段 2：** 选择 POC（评估解决方案、推荐最佳起点）

---

### 步骤 0：收集上下文（提问之前）

**智能体建议：**

在创建机会解决方案树之前，让我们先收集上下文：

**利益相关者的请求或产品计划：**
- 利益相关者提出了什么要求？（功能请求、产品构想、战略目标）
- 任何现有材料：PRD 草案、OKR 文档、战略备忘录、会议记录
- 问题陈述、客户投诉或研究发现

**产品上下文（如有）：**
- 网站文案、定位陈述、产品描述
- 竞争对手资料、客户评价（G2、Capterra）、社区讨论
- 使用数据、支持工单、客户流失原因

**你可以直接粘贴这些内容，也可以简要描述该请求。**

---

## 阶段 1：生成机会解决方案树

### 问题 1：提取预期成果

**智能体提问：**
“这项计划的预期成果是什么？（你希望推动哪项业务或产品指标发生变化？）”

**提供 4 个编号选项：**

1. **收入增长** — “增加 ARR、扩大现有客户收入、开辟新的收入来源”（常见于处于规模化阶段的产品）
2. **客户留存** — “降低流失率、提高激活率、提升参与度/黏性”（常见于存在留存问题的成熟产品）
3. **客户获取** — “增加注册量、试用转化率和新用户增长”（常见于早期或增长阶段的产品）
4. **产品效率** — “降低支持成本、缩短价值实现时间、改善运营指标”（常见于正在优化运营的成熟产品）

**或者描述你的具体预期成果（应可衡量，例如：“将试用到付费的转化率从 15% 提高到 25%”）。**

**用户回答：** [选择或自定义回答]

**智能体提取并确认：**
- **预期成果：** [具体、可衡量的成果]
- **重要性：** [来自利益相关者请求或上下文的理由]

---

### 问题 2：识别机会（待解决的问题）

**智能体根据期望结果和所提供的背景信息生成 3 个机会**。

**智能体说：**
“根据你期望的结果（[来自问题 1]）和你提供的背景信息，以下是可能推动实现这一结果的 **3 个机会**（客户问题或需求）：”

**示例（如果结果 = 提高试用用户到付费用户的转化率）：**

1. **机会 1：用户在试用期间未能体验到产品价值** — “新用户注册后没有完成引导流程，始终未达到‘顿悟时刻’，在看到核心价值之前就放弃了”
   - 证据：[来自背景信息：引导流程分析、支持工单、退出调查]

2. **机会 2：定价不清晰或与用户预期不匹配** — “用户不确定付费方案是否值得；不了解支付相应价格能获得什么；定价页面令人困惑”
   - 证据：[来自背景信息：转化漏斗中用户在定价页面流失、销售异议]

3. **机会 3：免费方案‘已经足够好’** — “用户无限期地停留在免费层级，因为它已经能满足其需求；没有令人信服的升级理由”
   - 证据：[来自背景信息：免费增值用户留存数据、询问变通方案的支持工单]

**智能体提问：**
“你认为最需要优先探索的是哪个机会？或者你想修改/添加机会吗？”

**用户回答：** [选择或自定义内容]

---

### 问题 3：为选定的机会生成解决方案

**智能体为选定的机会生成 3 个解决方案构想**。

**智能体说：**
“针对**机会 [X]：[名称]**，以下是可供测试的 **3 个潜在解决方案**：”

**示例（如果选择了机会 1：用户在试用期间未能体验到产品价值）：**

1. **解决方案 1：引导式上手检查清单** — “通过交互式检查清单逐步引导用户完成核心工作流（例如，‘创建你的第一个项目’、‘邀请一名团队成员’、‘完成一项任务’）”
   - 假设：结构化引导能够提高完成率
   - 实验：对有检查清单和无检查清单的方案进行 A/B 测试，衡量激活率

2. **解决方案 2：价值实现时间触发机制** — “当用户遇到阻碍时自动提示（例如，‘你还没有创建项目——这里有一个模板可以帮助你开始’）”
   - 假设：主动提醒能够防止用户流失
   - 实验：跟踪用户与提示的互动情况，衡量试用到付费转化率的提升

3. **解决方案 3：人工辅助上手引导** — “为高价值试用用户（企业方案、团队方案）提供与 CSM 进行 15 分钟上手沟通的机会”
   - 假设：个性化服务能够提高高意向用户的转化率
   - 实验：向 50 名试用用户提供该服务，衡量其转化率并与对照组比较

**智能体提问：**
“你想探索另一个机会的解决方案，还是进入 POC 选择阶段？”

**用户回答：** [选择或自定义内容]

---

## 阶段 2：选择概念验证（POC）

生成解决方案后，智能体会帮助选择应优先测试的解决方案。

---

### 问题 4：评估解决方案（可行性、影响力、市场契合度）

**智能体说：**
“让我们评估你的解决方案，以选出最佳起点。我会从**可行性**（构建难度）、**影响力**（能够在多大程度上推动结果）和**市场契合度**（与客户需求的匹配程度）三个方面为每个解决方案评分。”

**Agent 生成评估表：**

| 解决方案 | 可行性 (1-5) | 影响力 (1-5) | 市场契合度 (1-5) | 总分 | 理由 |
|----------|-------------------|--------------|------------------|-------------|-----------|
| 解决方案 1：引导式新用户入门清单 | 4 | 4 | 5 | 13 | 可行性高（常见 UI 模式）、影响力已得到验证（行业标准）、市场契合度强（用户期待新用户入门引导） |
| 解决方案 2：价值实现时间触发机制 | 3 | 3 | 4 | 10 | 可行性中等（需要集成分析功能）、影响力一般（取决于触发机制的质量）、市场契合度良好 |
| 解决方案 3：人工辅助新用户入门 | 5 | 5 | 3 | 13 | 可行性高（无需开发工作）、影响力高（个性化服务）、市场契合度较低（无法规模化，仅适合高接触式服务） |

**评分标准：**
- **可行性：** 1 = 需要数月工作，5 = 需要数天/数周
- **影响力：** 1 = 对结果的推动极小，5 = 对结果有重大推动
- **市场契合度：** 1 = 客户不关心，5 = 客户主动提出需求

**Agent 建议：**

**推荐的 POC：解决方案 1（引导式新用户入门清单）**

**选择此 POC 的原因：**
- 在可行性（可在 2-4 周内构建）和影响力（已验证的模式）之间取得平衡
- 市场契合度强（用户期待新用户入门引导）
- 可检验的假设："如果我们引导用户完成核心工作流，激活率将从 X% 提升至 Y%"

**备选 POC：** 解决方案 3（人工辅助新用户入门）
- 如果你希望在无需开发工作的情况下快速学习，可以从这里开始
- 对 20-50 名试用用户进行人工测试，收集定性反馈
- 利用所获经验指导自动化解决方案（解决方案 1）

**不建议作为 POC：** 解决方案 2（价值实现时间触发机制）
- 需要更多前期投入
- 影响力取决于触发机制的质量（需要通过实验进行优化）
- 更适合在验证核心新用户入门流程后作为后续方案

---

### 问题 5：定义实验

**Agent 提问：**
"你将如何测试这个解决方案？具体实验是什么？"

**提供 3 个编号选项：**

1. **A/B 测试** — "构建 MVP，向 50% 的试用用户展示，并将转化率与对照组进行比较"（最适合：定量验证，需要有流量）
2. **原型 + 可用性测试** — "创建可点击原型，观察 10 名用户尝试完成新用户入门流程，并收集定性反馈"（最适合：早期验证、低流量）
3. **人工礼宾式测试** — "对 20 名用户人工执行该解决方案（例如，亲自引导他们完成新用户入门流程），并衡量结果"（最适合：快速学习，无需开发工作）

**或者描述你的实验方法。**

**用户回答：** [选择或自定义回答]

---

### 输出：机会解决方案树 + POC 计划

完成流程后，Agent 输出：

```markdown
# Opportunity Solution Tree + POC Plan

## Desired Outcome
**Outcome:** [From Q1]
**Target Metric:** [Specific, measurable goal]
**Why it matters:** [Rationale]

---

## Opportunity Map

### Opportunity 1: [Name]
**Problem:** [Description]
**Evidence:** [From context]

**Solutions:**
1. [Solution A]
2. [Solution B]
3. [Solution C]

---

### Opportunity 2: [Name]
**Problem:** [Description]
**Evidence:** [From context]

**Solutions:**
1. [Solution A]
2. [Solution B]
3. [Solution C]

---

### Opportunity 3: [Name]
**Problem:** [Description]
**Evidence:** [From context]

**Solutions:**
1. [Solution A]
2. [Solution B]
3. [Solution C]

---

## Selected POC

**Opportunity:** [Selected opportunity]
**Solution:** [Selected solution]

**Hypothesis:**
- "If we [implement solution], then [outcome metric] will [increase/decrease] from [X] to [Y] because [rationale]."

**Experiment:**
- **Type:** [A/B test / Prototype test / Concierge test]
- **Participants:** [Number of users, segment]
- **Duration:** [Timeline]
- **Success criteria:** [What validates the hypothesis]

**Feasibility Score:** [1-5]
**Impact Score:** [1-5]
**Market Fit Score:** [1-5]
**Total:** [Sum]

**Why this POC:**
- [Rationale 1]
- [Rationale 2]
- [Rationale 3]

---

## Next Steps

1. **Build experiment:** [Specific action, e.g., "Create onboarding checklist wireframes"]
2. **Run experiment:** [Specific action, e.g., "Deploy to 50% of trial users for 2 weeks"]
3. **Measure results:** [Specific metric, e.g., "Compare activation rate: checklist vs. control"]
4. **Decide:** [If successful → scale; if failed → try next solution]

---

**Ready to build the experiment? Let me know if you'd like to refine the hypothesis or explore alternative solutions.**
```

---

## 示例

完整的 OST 示例请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
**Desired Outcome:** Increase trial-to-paid conversion from 15% to 25%
**Opportunity:** Users don’t reach "aha" moment during trial
**Solution:** Guided onboarding checklist
```

## 常见陷阱

### 陷阱 1：伪装成解决方案的机会
**症状：**“机会：我们需要一个移动应用”

**后果：**尚未探索问题，就已经收敛到了某个解决方案。

**修正：**将机会重新表述为客户问题：“移动优先的用户无法随时随地访问产品。”

---

### 陷阱 2：跳过发散（直接跳到单一解决方案）
**症状：**“我们知道解决方案就是 [X]，只需要把它构建出来”

**后果：**错过更好的替代方案，也无法获得新的认知。

**修正：**为每个机会至少生成 3 个解决方案。在收敛之前强制进行发散。

---

### 陷阱 3：成果过于模糊
**症状：**“期望成果：改善用户体验”

**后果：**无法衡量成功，也无法确定机会的优先级。

**修正：**使成果可衡量：“将 NPS 从 30 提升至 50”或“将用户引导流程的流失率从 60% 降低至 40%”。

---

### 陷阱 4：没有实验（直接构建）
**症状：**选定一个解决方案后直接将其纳入路线图

**后果：**缺乏验证，构建错误产品的风险很高。

**修正：**每个解决方案都必须映射到一个实验。没有实验，就没有 OST。

---

### 陷阱 5：分析瘫痪（无休止地探索）
**症状：**生成了 20 个机会、50 个解决方案，却始终不做选择

**后果：**团队困在发现阶段，毫无进展。

**修正：**限制为 3 个机会，每个机会 3 个解决方案（共 9 个）。选择 POC，运行实验、学习并迭代。

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 将机会表述为客户问题
- `skills/jobs-to-be-done/SKILL.md` — 帮助从 JTBD 研究中识别机会
- `skills/epic-hypothesis/SKILL.md` — 将经过验证的解决方案转化为可测试的史诗假设
- `skills/user-story/SKILL.md` — 将实验拆分为可交付的用户故事
- `skills/discovery-interview-prep/SKILL.md` — 通过客户访谈验证机会

### 外部框架
- Teresa Torres，*持续发现习惯*（2021）— 机会解决方案树的起源
- Jeff Patton，*用户故事地图*（2014）— 成果驱动的产品规划
- Ash Maurya，*精益创业实战*（2012）— 假设驱动的实验

### Dean 的工作
- Productside Blueprint — 战略性产品发现流程
- [如果 Dean 有 OST 资源，请在此处添加链接]

---

**技能类型：**交互式
**建议的文件名：**`opportunity-solution-tree.md`
**建议的放置位置：**`/skills/interactive/`
**依赖项：**使用 `skills/problem-statement/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`、`skills/epic-hypothesis/SKILL.md`、`skills/user-story/SKILL.md`