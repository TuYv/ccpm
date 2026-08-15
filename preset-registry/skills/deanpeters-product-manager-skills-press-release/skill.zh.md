---
name: press-release
argument-hint: "[product or feature idea]"
description: Write an Amazon-style press release that defines customer value before building. Use when aligning stakeholders on a new product, feature, or strategic bet.
intent: >-
  Create a visionary press release following Amazon's "Working Backwards" methodology to define and communicate a product or feature before building it. Use this to align stakeholders on the customer value proposition, clarify the problem being solved, and test if the product story resonates—treating the press release as a forcing function for clarity and customer-centricity.
type: component
theme: pm-artifacts
best_for:
  - "Defining customer value before a line of spec gets written"
  - "Aligning stakeholders on what a launch actually promises"
  - "Killing a weak idea early by trying to write its announcement"
scenarios:
  - "We're about to build something big and I want to test whether the value is real"
  - "Stakeholders disagree about what this launch promises customers — write it as news"
estimated_time: "30-45 min"
---
## 目的
遵循亚马逊的“逆向工作法”创建一份具有愿景感的新闻稿，以便在构建产品或功能之前对其进行定义和传达。借此让利益相关者就客户价值主张达成一致，明确要解决的问题，并检验产品故事能否引起共鸣——将新闻稿作为一种促进清晰思考和以客户为中心的强制机制。

这并非用于发布日的营销材料，而是一种规划工具，它提出这样一个问题：“如果我们完美地交付了它，我们会如何向全世界介绍它？”

## 输入

**最适合提供：** 产品或功能构想，以及它面向的用户。
**同样有用：** 客户问题、核心利益点，以及适合内部引用的观点。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些内容，并跳过其中已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 该技能会询问客户是谁，以及产品发布当天会给他们带来什么变化——这是逆向工作新闻稿无法凭空杜撰的两个要素。

**调用示例：** `Amazon-style press release: instant expense approval for field technicians, launching Q3.`

## 核心概念

### 亚马逊逆向工作框架
由亚马逊推广普及的逆向工作流程，会在编写任何代码之前，先从新闻稿和常见问题解答开始。新闻稿必须：
- 从客户视角撰写
- 聚焦于解决的问题，而不是构建的功能
- 保持简短（1-1.5 页）
- 足够有吸引力，让客户愿意使用该产品

### 新闻稿结构
标准新闻稿遵循以下格式：

1. **标题：** 清晰、聚焦利益点的产品公告
2. **电头：** 城市、州、日期
3. **引言段：** 发布的是什么、面向谁、核心利益是什么
4. **问题段：** 产品所解决的客户问题
5. **解决方案段：** 产品如何解决问题（聚焦结果，而非功能）
6. **公司领导引言：** 愿景、对客户的承诺
7. **补充细节：** 支撑性的利益点或数据
8. **公司简介：** 公司背景
9. **行动号召：** 如何了解更多信息
10. **媒体联系人：** 新闻媒体联系信息

### 为什么这种方法有效
- **客户优先思维：** 迫使你从客户视角阐明价值
- **促进清晰思考的强制机制：** 如果你无法写出一份有吸引力的新闻稿，产品构想可能并不成熟
- **协同工具：** 利益相关者可以在工程开发开始之前阅读愿景并作出反馈
- **决策过滤器：** 如果某项功能不值得写进新闻稿，就应质疑它的优先级

### 反模式（这不是什么）
- **不是以功能为中心：** 不要罗列规格——聚焦客户成果
- **不使用内部行话：** 为客户而写，而不是为工程师而写
- **不能含糊：** “彻底革新生产力”只是空话；“将报告生成时间从 8 小时缩短至 10 分钟”才是真实具体的表述
- **不是营销包装：** 如实说明产品的作用

### 何时使用
- 定义新产品或重大功能
- 在开发前就愿景与利益相关方达成一致
- 测试产品创意是否具有吸引力
- 向高管推介或争取支持

### 何时不应使用
- 用于微不足道的功能（不要对小调整过度设计）
- 在产品已经构建完成后（为时已晚）
- 用作发布当天的正式新闻稿（这是规划文档，而非最终营销文案）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集背景信息
在起草之前，请确保你已掌握：
- **产品/功能描述：** 你要构建什么？
- **目标客户/用户画像：** 这是为谁设计的？（参考 `skills/proto-persona/SKILL.md`）
- **问题陈述：** 这解决了客户的什么问题？（参考 `skills/problem-statement/SKILL.md`）
- **关键收益：** 它能带来哪些结果？
- **竞争背景：** 它与其他替代方案有何不同？（参考 `skills/positioning-statement/SKILL.md`）
- **公司使命/价值观：** 它如何契合公司的愿景？

**如果缺少背景信息：** 请先开展探索、定义问题陈述或明确定位。

---

### 第 2 步：起草标题

创建一个清晰、以收益为重点的标题：

```markdown
"[Product/Feature Name] by [Company] Aims to [Main Benefit/Goal]"
```

**质量检查：**
- **以收益为重点：** 是否说明了客户能获得什么，而不只是你构建了什么？
- **具体：** “旨在简化工作流程”很模糊；“旨在将发票处理时间缩短 60%”则很具体
- **易于记忆：** 人们能否在交谈中复述这个标题？

**示例：**
- ✅ “Acme Workflows 推出发票自动化功能，帮助小型企业将处理时间缩短 60%”
- ❌ “Acme 推出具备 AI 功能的新产品”

---

### 第 3 步：撰写日期地点行和导语

```markdown
[City], [State], [Country], [Date] —

Today, [Company], a [type of organization], announced [key news], a [brief description]. This [product/feature] is set to [main benefit], addressing [key customer problem].
```

**质量检查：**
- **简洁：** 最多 2-3 句话
- **提及客户问题：** 不要直接跳到解决方案——先指出问题

---

### 第 4 步：解释问题

```markdown
[Product/feature] solves [specific customer problem]. According to [source or customer insight], [supporting data or quote that validates the problem].
```

**质量检查：**
- **具体的问题：** 不要写“效率低下”，而要写“手动处理发票每月需要 8 小时”
- **经过验证：** 包含数据、客户引言或研究，以证明该问题确实存在

---

### 第 5 步：描述解决方案（以结果为重点）

```markdown
[Product/feature] addresses this by [how it solves the problem—focus on outcomes]. [Quote from company leader]: "[Insert quote that emphasizes customer value, not features]."
```

**质量检查：**
- **结果优先：** 写“缩短处理时间”，而不是“包含 OCR 技术”
- **引言富有愿景：** 应体现对客户的同理心和公司的价值观

---

### 第 6 步：添加支撑细节

```markdown
In addition to [key benefit], [product/feature] also [additional benefits]. According to [statistic or source], [supporting data].
```

**质量检查：**
- **数据驱动：** 尽可能使用数字（节省的时间、降低的成本等）
- **以客户为中心：** 仍然聚焦于“客户能得到什么”，而不是“我们构建了什么”

---

### 第 7 步：加入公司简介

```markdown
[Company], founded in [year], is a [type of company] known for [main products/services]. With a focus on [company mission or values], [Company] has [achievements or milestones].
```

---

### 第 8 步：添加行动号召和媒体联系方式

```markdown
For more information about [product/feature], visit [website] or contact [media contact name] at [contact info].

**Media Contact Information:**
[Name]
Title: [Title]
Phone: [Phone]
Email: [Email]
```

---

### 第 9 步：检验新闻稿

提出以下问题：
1. **客户会关心吗？** 如果你把这篇新闻稿发给目标客户，他们会想进一步了解吗？
2. **问题清楚吗？** 从未听说过你产品的人能理解这个痛点吗？
3. **收益可以衡量吗？** 你能证明这些主张吗（节省的时间、降低的成本等）？
4. **是否没有术语堆砌？** 你的妈妈能看懂吗？
5. **能通过“那又怎样？”测试吗？** 如果有人读完后说“那又怎样？”，说明你还没有清楚阐明价值。

如果任何一个答案是“否”，请修改。

---

## 示例

完整的新闻稿示例请参阅 `examples/sample.md`。

简短示例摘录：

```markdown
**Headline:** "Acme Launches SmartInvoice to Cut Processing Time by 60%"
**Problem:** Small businesses spend 8 hours/month on manual invoices
**Solution:** Automates extraction and approvals to save time
```

---

## 常见误区

### 误区 1：罗列功能而非收益
**表现：** “包含 AI、ML、OCR、NLP 和实时同步”

**后果：** 客户不关心功能，他们关心的是结果。

**改进：** 将功能转化为收益：“由 AI 驱动的自动化功能可将发票处理时间缩短 60%。”

---

### 误区 2：问题陈述含糊
**表现：** “解决工作流程效率低下的问题”

**后果：** 没有人会觉得自己正面临这个问题。

**改进：** 具体说明：“小企业主每月要花 8 小时手动录入发票数据。”

---

### 误区 3：大量使用专业术语
**表现：** “利用前沿 ML 模型优化企业级工作流程”

**后果：** 客户无法理解你在说什么。

**改进：** 像向朋友解释一样写：“自动处理发票，让你无需亲自动手。”

---

### 误区 4：空泛的高管引语
**表现：** “我们很高兴能将创新带入市场”

**后果：** 这段引语没有提供任何价值，可以套用在任何产品上。

**改进：** 以客户为中心：“企业主不应该把周末花在处理发票上，而应该用这些时间陪伴家人。”

---

### 误区 5：缺少数据或验证
**表现：** “客户一定会喜欢这款具有革命性的新解决方案”

**后果：** 缺乏依据的主张 = 营销空话。

**修正：** 添加数据：“测试版用户平均每月节省 5 小时”或“68% 的中小企业将发票处理列为其最主要的行政负担。”

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 定义新闻稿所强调的客户问题
- `skills/positioning-statement/SKILL.md` — 为差异化和价值主张提供依据
- `skills/proto-persona/SKILL.md` — 定义新闻稿中提到的目标客户
- `skills/jobs-to-be-done/SKILL.md` — 为客户收益和成果提供依据

### 外部框架
- 亚马逊的 Working Backwards 流程 — 新闻稿优先方法论的起源
- Ian McAllister 在 Quora 上关于亚马逊新闻稿模板的回答（2012 年）— 被广泛引用的说明
- Colin Bryar 与 Bill Carr，*Working Backwards*（2021 年）— 介绍亚马逊产品开发流程的书籍

### Dean 的工作
- 愿景新闻稿提示词（灵感来自亚马逊的 Working Backwards 方法论）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/visionary-press-release.md`。

---

**技能类型：** 组件
**建议文件名：** `press-release.md`
**建议放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/problem-statement/SKILL.md`、`skills/positioning-statement/SKILL.md`、`skills/proto-persona/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`