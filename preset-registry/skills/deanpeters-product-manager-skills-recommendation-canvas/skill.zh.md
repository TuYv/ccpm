---
name: recommendation-canvas
argument-hint: "[AI product idea]"
description: Evaluate an AI product idea across outcomes, hypotheses, risks, and positioning. Use when deciding whether an AI solution deserves investment or recommendation.
intent: >-
  Evaluate and propose AI product solutions using a structured canvas that assesses business outcomes, customer outcomes, problem framing, solution hypotheses, positioning, risks, and value justification. Use this to build a comprehensive, defensible recommendation for stakeholders and decision-makers—especially when proposing AI-powered features or products that carry higher uncertainty and risk.
type: component
theme: validation-experiments
best_for:
  - "Deciding whether an AI product idea deserves real investment"
  - "Surfacing the risks and hypotheses behind an AI feature request"
  - "Comparing AI solution options on outcomes rather than novelty"
scenarios:
  - "Leadership wants an AI feature and I need to evaluate whether it's worth building"
  - "I have three AI solution options and need to compare them on outcomes and risk"
estimated_time: "30-45 min"
---
## 目的
使用结构化画布评估并提出 AI 产品解决方案，涵盖业务成果、客户成果、问题界定、解决方案假设、定位、风险和价值论证。借助此画布，为利益相关者和决策者制定全面且经得起推敲的建议——尤其适用于提出不确定性和风险较高的 AI 驱动功能或产品。

这不是功能规格说明——而是一份战略提案，用于阐明*为什么*值得构建这一 AI 解决方案、*哪些*假设需要验证，以及*如何*衡量成功。

## 输入

**最适合提供：** 待评估的 AI 产品或功能创意。
**同样有用的信息：** 目标客户、预期业务成果、已知风险，以及该建议需要说服的对象。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。请使用这些信息，并跳过其中已涵盖的问题；不要重复询问。

**什么信息都没准备？也没关系。** 该技能会先询问产品创意和决策者，然后逐一完成画布中的各个部分。

**调用示例：** `Recommendation canvas: AI-suggested reorder quantities for warehouse managers — VP Ops wants a go/no-go next month.`

## 核心概念

### 推荐画布框架
该画布为 Dean Peters 的 Productside“面向产品经理的 AI 创新”课程而创建，将多个产品管理框架整合为一个统一的战略视图：

**核心组成部分：**
1. **业务成果：** 这能为企业带来什么？
2. **产品成果：** 这能为客户带来什么？
3. **问题陈述：** 以用户画像为中心的问题界定
4. **解决方案假设：** 包含实验的“如果/那么”假设
5. **定位陈述：** 价值主张和差异化
6. **假设与未知因素：** 哪些因素可能使该方案失效？
7. **PESTEL 风险：** 政治、经济、社会、技术、环境、法律
8. **价值论证：** 为什么值得做这件事
9. **成功指标：** 用于衡量影响的 SMART 指标
10. **后续行动：** 战略性的下一步行动

### 为什么此框架有效
- **成果驱动：** 迫使团队明确业务价值和客户价值
- **以假设为中心：** 将解决方案视为需要验证的押注，而不是既定承诺
- **明确呈现风险：** 让假设和风险从一开始就清晰可见
- **适合高管阅读：** 内容全面，同时采用便于高管层审阅的结构
- **适合 AI 场景：** 对不确定性较高的 AI 功能尤其有用

### 反模式（这不是什么）
- **不是 PRD：** 这是战略框架，而不是详细需求
- **还不是商业论证：** 它为商业论证提供依据，但首先需要经过验证
- **不是功能列表：** 关注成果，而不是能力

### 适用场景
- 提议新的 AI 驱动产品或功能
- 向高管推介，或争取预算或支持
- 评估某个 AI 解决方案是否值得推进
- 协调跨职能利益相关者（产品、工程、数据科学、业务）
- 完成初步探索之后（你需要相关背景信息才能填写此画布）

### 不适用的情况
- 对于琐碎的功能（不要对小调整进行过度设计）
- 在开展任何探索工作之前（你需要先进行用户研究和问题验证）
- 用它替代实验（画布用于指导实验，而不是反过来）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集背景信息
在填写画布之前，请确保你已掌握：
- **问题理解：** 用户研究、痛点（参考 `skills/problem-statement/SKILL.md`）
- **用户画像清晰度：** 谁遇到了这个问题？（参考 `skills/proto-persona/SKILL.md`）
- **市场背景：** 竞争格局、品类定位
- **业务约束：** 预算、时间安排、战略优先级

**如果缺少背景信息：** 请先开展探索工作。此画布用于综合洞察，而不是创造洞察。

---

### 第 2 步：定义成果

#### 业务成果
这对业务有什么价值？请使用以下格式：
- [方向] [指标] [成果] [背景] [验收标准]

```markdown
## Business Outcome
- [e.g., "Reduce by 25% the churn of existing customers using our existing product"]
```

**示例：**
- “在 12 个月内，将企业客户带来的月度经常性收入提高 15%”

**质量检查：**
- **可衡量：** 你能跟踪这个指标吗？
- **有时限：** 要在多长时间内实现？
- **有雄心但切合实际：** 不要设定“1 个月内收入增长 10 倍”这样的目标

---

#### 产品成果
这对客户有什么价值？请使用以下格式：
- [方向] [指标] [成果] [从用户画像视角描述的背景] [验收标准]

```markdown
## Product Outcome
- [e.g., "Increase the speed of finding patients when I know the inclusion and exclusion criteria"]
```

**示例：**
- “将小企业主手动处理发票所花费的时间减少 60%”

**质量检查：**
- **以客户为中心：** 从用户视角撰写（使用“我”，而不是“我们”）
- **描述成果，而非功能：** 应写“减少所花费的时间”，而不是“使用 AI 自动化”

---

### 第 3 步：界定问题
使用 `skills/problem-statement/SKILL.md` 中的问题界定叙述：

```markdown
## The Problem Statement

### Problem Statement Narrative
- [Persona description: 2-3 sentences telling the persona's story from their POV]
- [Example: "Sarah is a freelance designer managing 10 clients. She spends 8 hours/month manually tracking invoices and chasing late payments. By the time she follows up, some clients have already moved to other designers, costing her revenue and damaging relationships."]
```

**质量检查：**
- **有同理心：** 这听起来像用户自己的表达吗？
- **具体：** 不要写“用户想要更好的工具”，而要写“Sarah 每月花费 8 小时……”
- **经过验证：** 基于真实的用户研究，而不是假设

---

### 第 4 步：定义解决方案假设

#### 假设陈述
使用 `skills/epic-hypothesis/SKILL.md` 中的史诗假设格式：

```markdown
## Solution Hypothesis

### Hypothesis Statement
**If we** [action or solution on behalf of target persona]
**for** [target persona]
**Then we will** [attain or achieve desirable outcome]
```

**示例：**
- “如果我们为自由设计师提供由 AI 驱动、能够在最佳时间自动发送的发票提醒，那么我们将把用于付款跟进的时间减少 70%”

---

#### 微型探索行动
定义轻量级实验来验证假设：

```markdown
### Tiny Acts of Discovery
**We will test our assumption by:**
- [Experiment 1: Prototype AI reminder system and test with 5 freelancers]
- [Experiment 2: A/B test manual vs. AI-timed reminders for 20 users]
- [Experiment 3: Survey users on perceived value after 2 weeks]
```

**质量检查：**
- **快速：** 以天或周为单位，而不是数月
- **低成本：** 使用原型、礼宾式测试，而不是完整构建
- **可证伪：** 实验结果有可能证明你是错的

---

#### 生命力证明
定义验证指标：

```markdown
### Proof-of-Life
**We know our hypothesis is valid if within** [timeframe]
**we observe:**
- [Quantitative outcome: e.g., "80% of users send reminders via the AI system"]
- [Qualitative outcome: e.g., "8 out of 10 users report saving 5+ hours/month"]
```

---

### 第 5 步：定义定位
使用 `skills/positioning-statement/SKILL.md` 中的定位陈述格式：

```markdown
## Positioning Statement

### Value Proposition
**For** [target customer/user persona]
**that need** [statement of underserved need]
[product name]
**is a** [product category]
**that** [statement of benefit, focusing on outcomes]

### Differentiation Statement
**Unlike** [primary competitor or competitive arena]
[product name]
**provides** [unique differentiation, focusing on outcomes]
```

---

### 第 6 步：记录假设与未知项

```markdown
## Assumptions & Unknowns
- **[Assumption 1]** - [Description, e.g., "We assume users will trust AI-generated reminders"]
- **[Assumption 2]** - [Description, e.g., "We assume payment timing optimization increases response rates"]
- **[Unknown 1]** - [Description, e.g., "We don't know if users prefer email or SMS reminders"]
```

**质量检查：**
- **明确：** 让隐藏的假设显现出来
- **可测试：** 每个假设都可以通过实验进行验证

---

### 第 7 步：识别 PESTEL 风险

#### 待调查风险（高优先级）
```markdown
## Issues/Risks to Investigate
- **Political:** [e.g., "Regulatory changes to AI-generated communications"]
- **Economic:** [e.g., "Economic downturn reduces willingness to pay for premium features"]
- **Social:** [e.g., "Users may perceive AI reminders as impersonal or pushy"]
- **Technological:** [e.g., "AI model accuracy may degrade over time without retraining"]
- **Environmental:** [e.g., "Energy costs of AI processing"]
- **Legal:** [e.g., "GDPR compliance for storing customer email patterns"]
```

---

#### 待监控风险（较低优先级）
```markdown
## Issues/Risks to Monitor
- **Political:** [e.g., "Potential AI regulation in EU markets"]
- **Economic:** [e.g., "Exchange rate fluctuations affecting international customers"]
- **Social:** [e.g., "Changing norms around automated communication"]
- **Technological:** [e.g., "Emerging AI competitors with better models"]
- **Environmental:** [e.g., "Carbon footprint concerns from stakeholders"]
- **Legal:** [e.g., "Future data privacy laws"]
```

---

### 第 8 步：论证价值

```markdown
## Value Justification

### Is this Valuable?
- [Absolutely yes / Yes with caveats / No with suggested alternatives / Absolutely NO!]

### Solution Justification
<!-- Write these to convince C-level executives -->
We think this is a valuable idea. Here's why:
1. **[Justification 1]** - [Description, e.g., "Addresses the #1 pain point for our target segment"]
2. **[Justification 2]** - [Description, e.g., "Differentiates us from competitors who only offer manual reminders"]
3. **[Justification 3]** - [Description, e.g., "Low technical risk—leverages existing AI infrastructure"]
```

---

### 第 9 步：定义成功指标
使用 SMART 指标（具体、可衡量、可实现、相关、有时限）：

```markdown
## Success Metrics
1. **[Metric 1]** - [e.g., "80% of active users adopt AI reminders within 3 months"]
2. **[Metric 2]** - [e.g., "Average time spent on payment follow-ups decreases by 50% within 6 months"]
3. **[Metric 3]** - [e.g., "Net Promoter Score for invoicing feature increases from 6 to 8 within 6 months"]
```

---

### 第 10 步：定义后续步骤

```markdown
## What's Next
1. **[Next step 1]** - [e.g., "Run 2-week prototype test with 10 beta users"]
2. **[Next step 2]** - [e.g., "Build lightweight AI model for reminder timing optimization"]
3. **[Next step 3]** - [e.g., "Conduct legal review of GDPR implications"]
4. **[Next step 4]** - [e.g., "Present findings to exec team for go/no-go decision"]
5. **[Next step 5]** - [e.g., "If validated, add to Q2 roadmap"]
```

---

## 示例

完整的推荐画布示例请参阅 `examples/sample.md`。

简短示例摘录：

```markdown
### Business Outcome
- Increase by 20% MRR from freelance users within 12 months

### Solution Hypothesis
**If we** provide AI-powered invoice reminders
**for** freelance designers
**Then we will** reduce time spent on follow-ups by 70%
```

## 常见陷阱

### 陷阱 1：结果模糊
**表现：**“业务结果：增加收入。产品结果：改善用户体验。”

**后果：**无法衡量，也无法问责。

**修复方法：**使用结果公式：[方向] [指标] [结果] [情境] [验收标准]。务必具体。

---

### 陷阱 2：解决方案优先思维
**表现：**问题陈述是“我们需要 AI 驱动的 X”

**后果：**你在验证问题之前就直接跳到了相应的解决方案。

**修复方法：**从用户视角定义问题。让解决方案假设从经过验证的痛点中自然产生。

---

### 陷阱 3：跳过微型探索行动
**表现：**从假设直接进入路线图，没有任何实验

**后果：**构建错误产品的风险很高。

**修复方法：**定义 2-3 个轻量级实验。在投入工程资源之前进行测试。

---

### 陷阱 4：宽泛的 PESTEL 风险
**表现：**“政治：法规可能会发生变化”

**后果：**风险分析流于形式，无法付诸行动。

**修复方法：**务必具体：“存储客户电子邮件发送时间数据时遵守 GDPR 的相关问题需要经过法律审查。”

---

### 陷阱 5：价值论证薄弱
**症状：**“这很有价值，因为客户会喜欢它”

**后果：**无法说服高管。

**修复方法：**使用数据：“根据用户研究，这解决了首要痛点。客户流失率降低 20% = ARR 增加 50 万美元。技术风险低。”

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 为问题叙述提供参考
- `skills/epic-hypothesis/SKILL.md` — 为解决方案假设的结构提供参考
- `skills/positioning-statement/SKILL.md` — 为定位部分提供参考
- `skills/proto-persona/SKILL.md` — 定义目标用户画像
- `skills/jobs-to-be-done/SKILL.md` — 为客户成果提供参考

### 外部框架
- Osterwalder 的价值主张画布 — 影响问题/解决方案的构建方式
- PESTEL 分析 — 风险评估框架
- SMART 目标 — 成功指标结构

### Dean 的工作
- AI 推荐画布模板（为 Productside 的“面向产品经理的 AI 创新”课程创建）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/recommendation-canvas-template.md`。

---

**技能类型：**组件
**建议的文件名：**`recommendation-canvas.md`
**建议的放置位置：**`/skills/components/`
**依赖项：**引用 `skills/problem-statement/SKILL.md`、`skills/epic-hypothesis/SKILL.md`、`skills/positioning-statement/SKILL.md`、`skills/proto-persona/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`