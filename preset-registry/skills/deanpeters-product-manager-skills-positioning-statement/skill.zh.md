---
name: positioning-statement
argument-hint: "[product] [target customer]"
description: Create a Geoffrey Moore-style positioning statement. Use when clarifying who you serve, what problem you solve, your category, and why you're different from alternatives.
intent: >-
  Create a Geoffrey Moore-style positioning statement that clearly articulates who your product serves, what need it addresses, how it's categorized, what benefit it delivers, and how it differs from alternatives. Use this when you need to align stakeholders on product strategy, guide messaging, or test if your value proposition is crisp and defensible.
type: component
theme: strategy-positioning
best_for:
  - "Defining your product's market position clearly for the first time"
  - "Differentiating from specific competitors in your messaging"
  - "Aligning your team on who you serve, what problem you solve, and why you're different"
scenarios:
  - "I need to write a positioning statement for a new B2B SaaS product targeting mid-market HR teams"
  - "Our positioning feels generic and I need to sharpen it against two specific competitors"
estimated_time: "10-15 min"
---
## 目的
创建一份 Geoffrey Moore 风格的定位声明，清晰阐明你的产品服务于谁、满足什么需求、属于什么类别、提供什么收益，以及与替代方案有何不同。当你需要就产品战略协调利益相关者、指导信息传达，或检验你的价值主张是否清晰且站得住脚时，可以使用此技能。

这不是一句广告语或电梯演讲，而是一种战略澄清工具，迫使你在目标客户、需求和差异化方面做出艰难取舍。

## 输入

**最适合提供：** 产品及其目标客户。  
**其他有用信息：** 未满足的需求、产品类别、核心收益和最接近的替代方案——该技能会根据你提供的信息起草内容，并且只询问缺失的信息。

调用时一并提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。请使用这些信息，并跳过其中已涵盖的问题；不要重复询问。

**什么信息都没准备？也没问题。** 该技能会先询问产品和目标客户，然后逐一处理 Moore 模板中的各个要素。

**调用示例：** `Positioning statement for LaunchDarkly-style feature flags aimed at platform engineering leads at 200+ eng orgs.`

## 核心概念

### Geoffrey Moore 框架
Moore 在 *《跨越鸿沟》* 中提出的框架将定位分为两个部分：

**价值主张：**
- **面向** [目标客户]
- **他们需要** [未被充分满足的需求]
- [产品名称]
- **是一款** [产品类别]
- **能够** [收益陈述]

**差异化声明：**
- **不同于** [主要竞争对手或竞争性替代方案]
- [产品名称]
- **提供** [独特差异化优势]

### 此结构为何有效
- **迫使你具体化：** 你不能说“面向所有人”或“不同于所有竞争对手”
- **揭示假设：** 如果你无法填出“不同于 X”，那么你可能并不具备站得住脚的差异化优势
- **聚焦成果，而非功能：** “将客户流失率降低 40%”胜过“具有分析功能”
- **通过类别锚定认知：** 说“是一款 CRM”还是“是一款工作流工具”，会改变买家评估你的方式

### 反模式（这不是什么）
- **不是广告语：** “定位”≠“Nike：Just Do It”
- **不是功能列表：** 不要说“提供 AI、自动化和集成功能”
- **不能泛泛而谈：** “面向需要提高效率的企业”＝定位作秀
- **不是空泛的愿景：** 在没有具体内容的情况下说“彻底革新生产力”，只是在制造噪声

### 何时使用
- 定义新产品或进行重大转型
- 让高管、创始人、产品经理和营销团队在战略上达成一致
- 检验你的差异化优势是真实存在还是凭空想象
- 在编写 PRD、发布计划或销售材料之前

### 何时不应使用
- 用于用户无法自行选择的内部工具（定位面向的是市场）
- 当你仍处于问题验证阶段时（应在明确问题之后再进行定位）
- 用它替代客户研究（它用于综合洞察，而不是创造洞察）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集背景信息
在起草之前，请确保你已掌握：
- **目标客户细分：** 人口统计特征、行为、角色（不能只是“中小企业”或“开发者”）
- **未被满足的需求：** 痛点、收益、待办任务（如有需要，请参考 `skills/jobs-to-be-done/SKILL.md`）
- **产品类别：** 买家在认知上如何归类你的解决方案（CRM、分析平台等）
- **竞争格局：** 直接竞争对手以及替代行为（例如，“Excel”往往才是真正的竞争对手）

**如果缺少背景信息：** 通过探索性访谈、市场研究或客户访谈来填补空白。不要猜测。

---

### 第 2 步：起草价值主张

填写以下模板：

```markdown
## Value Proposition

**For** [specific target customer/persona]
- **that need** [statement of underserved need—focus on pains, gains, JTBD]
- [product or service name]
- **is a** [product category]
- **that** [benefit statement—focus on outcomes, not features]
```

**质量检查：**
- **目标具体性：** 你能否向招聘人员描述清楚这个人？如果不能，请进一步缩小范围。
- **需求清晰度：** 这项需求能否在情感上引起共鸣？还是过于笼统（“需要提升效率”）？
- **类别契合度：** 这个类别对你是助力还是阻碍？（有时创建一个新类别具有战略意义，但风险也很高。）
- **结果导向：** 你表达的是用户能*获得什么*，而不是产品*拥有什么*吗？

---

### 第 3 步：起草差异化声明

填写以下模板：

```markdown
## Differentiation Statement

- **Unlike** [primary competitor or competitive alternative]
- [product or service name]
- **provides** [unique differentiation—outcomes, not features]
```

**质量检查：**
- **竞争对手真实性：** 这是买家实际考虑的*真正*替代方案吗？（而不只是你希望他们拿来与你比较的对象。）
- **差异化实质：** 竞争对手能否在 6 个月内复制这一点？如果可以，它就不是持久的差异化优势。
- **结果表述：** 你表达的是用户能够以不同方式*实现什么*，而不只是你以不同方式*做什么*吗？

---

### 第 4 步：对定位进行压力测试

提出以下问题：
1. **客户能认出自己吗？** 大声读出“面向 [target]”。它听起来具体还是笼统？
2. **这项需求站得住脚吗？** 你能否指出验证这项需求的研究、访谈或数据？
3. **这个类别是助力还是阻碍？** 它是否让你与正确的竞争对手形成对照？还是限制了你？
4. **差异化是否可信？** 你能否通过演示、案例研究或数据证明这一主张？
5. **这能指导决策吗？** 如果有人问“我们是否应该构建功能 X？”，这个定位能否帮助回答这个问题？

如果任何一个答案是“不能”或“勉强可以”，请进行修改。

---

### 第 5 步：争取认同并持续迭代

- **与利益相关者分享：** 创始人、高管、产品、营销和销售团队
- **与客户一起测试：** 大声读给他们听。他们是点头认同，还是一脸困惑？
- **毫不留情地完善：** 定位绝不可能在第一稿就完成。删减文字、提高具体性、测试替代方案。

---

## 示例

完整的定位示例请参阅 `examples/sample.md`。

小型示例摘录：

```markdown
**For** software development teams
- **that need** to reduce email overload and improve real-time collaboration
- Slack
- **is a** team messaging platform
- **that** centralizes communication and makes conversations searchable
```

---

## 常见陷阱

### 陷阱 1：“面向所有人”
**症状：**“面向希望实现增长的企业”或“面向所有使用软件的人”

**后果：**没有人会觉得这是*为自己*打造的。定位因此变得模糊不清。

**修正：**选择你要服务的*第一个*客户细分群体。以后可以扩展，但只有足够聚焦时，定位才能发挥作用。

---

### 陷阱 2：在利益陈述中堆砌功能
**症状：**“提供 AI、自动化、分析和集成功能”

**后果：**听起来像功能列表，而不是利益。买家会对此充耳不闻。

**修正：**以结果为先：“通过预测分析将客户流失率降低 30%。”功能说明的是如何实现，而不是为何重要。

---

### 陷阱 3：虚构的竞争对手
**症状：**“不同于过时的遗留系统”或“不同于传统方法”

**后果：**你是在与一个稻草人进行定位竞争。真正的买家并不认可这种替代方案。

**修正：**指出*真正的*竞争对手或替代行为。如果买家使用 Excel，就说“不同于 Excel”。如果他们使用某个竞品，就直接说出其名称。

---

### 陷阱 4：缺乏证据的差异化
**症状：**“提供革命性的 AI”或“带来无与伦比的速度”

**后果：**没有证据的主张 = 营销空话。买家会直接忽略。

**修正：**让主张可证伪：“对于小于 1TB 的数据集，查询性能比 Snowflake 快 10 倍”（可进行测试）。

---

### 陷阱 5：品类混淆
**症状：**“是一个用于数字化转型的下一代平台”

**后果：**买家不知道该如何评估你。品类 = 心智货架。没有货架 = 没有销售。

**修正：**选择买家已经理解的品类（CRM、分析、消息通信），或者投入品类创建（需要大量资金和时间）。

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 定义定位所要解决的问题
- `skills/jobs-to-be-done/SKILL.md` — 为“that need”陈述提供依据
- `skills/proto-persona/SKILL.md` — 定义“For [target]”细分群体
- `skills/press-release/SKILL.md` — 定位为新闻稿的信息传达提供依据

### 外部框架
- Geoffrey Moore，*Crossing the Chasm*（1991）— 本框架的起源
- April Dunford，*Obviously Awesome*（2019）— 现代定位实战指南
- Al Ries 与 Jack Trout，*Positioning: The Battle for Your Mind*（1981）— 定位理论的奠基之作

### Dean 的作品
- [如适用，请链接至 Dean Peters 的相关 Substack 文章]

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/positioning-statement.md`。

---

**技能类型：**组件
**建议文件名：**`positioning-statement.md`
**建议放置位置：**`/skills/components/`
**依赖项：**引用 `skills/problem-statement/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`、`skills/proto-persona/SKILL.md`