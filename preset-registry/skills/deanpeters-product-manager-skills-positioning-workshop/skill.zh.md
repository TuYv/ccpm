---
name: positioning-workshop
argument-hint: "[product]"
description: Run a positioning workshop that surfaces target customer, unmet need, category, benefits, and differentiation. Use when your product messaging feels fuzzy, generic, or misaligned.
intent: >-
  Guide product managers through discovering and articulating product positioning by asking adaptive questions about target customers, unmet needs, product category, benefits, and competitive differentiation. Use this to align stakeholders on strategic positioning before writing PRDs, launch plans, or marketing materials—ensuring you've made deliberate choices about who you serve, what need you address, and how you differ from alternatives.
type: interactive
best_for:
  - "Running a workshop to sharpen product positioning"
  - "Clarifying target customer, category, and differentiation"
  - "Fixing fuzzy or generic messaging before launch"
scenarios:
  - "Help me run a positioning workshop for our B2B analytics product"
  - "Our messaging feels generic. Facilitate a positioning session."
  - "We need to define who we serve and why we're different"
theme: workshops-facilitation
estimated_time: "60-90 min"
---
## 目的
通过围绕目标客户、未满足的需求、产品类别、收益和竞争差异化提出自适应问题，引导产品经理探索并阐明产品定位。在编写 PRD、发布计划或营销材料之前，使用此技能帮助利益相关者就战略定位达成一致，确保你已对服务对象、所解决的需求以及与替代方案的差异做出审慎选择。

这不是一场头脑风暴，而是一个结构化的探索过程，最终将输出一份有证据和战略选择支撑的杰弗里·摩尔定位陈述。

## 输入

**最适合提供：** 定位尚不清晰的产品（或功能）。
**其他有用信息：** 当前的传播信息、你认为的客户群体、竞争对手，以及目前定位出现问题的场景（销售通话、网站、产品发布）。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文资料，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。请使用这些信息并跳过其已涵盖的问题；不要重复提问。

**什么都没准备？也没关系。** 工作坊会首先询问你的目标客户，然后每次提出一个问题并逐步推进。

**调用示例：** `Run a positioning workshop for our API monitoring tool — we keep getting compared to Datadog and losing.`

## 核心概念

### 定位工作坊流程
这是一个交互式探索过程，将：
1. 收集产品背景信息（营销材料、竞争情报）
2. 通过提问识别目标客户细分市场
3. 通过待办任务视角发现未得到充分满足的需求
4. 定义产品类别和收益
5. 确立竞争差异化
6. 输出完整的定位陈述（使用 `positioning-statement.md`）

### 这种方法为何有效
- **结构化探索：** 防止“委员会式定位”（过于模糊）
- **以证据为基础：** 使用真实的营销材料、客户反馈和竞争情报
- **自适应：** 根据 B2B 与 B2C、新产品与重新定位等不同情况调整问题
- **可执行的输出：** 生成一份可直接供利益相关者评审的杰弗里·摩尔定位陈述

### 反模式（这不是什么）
- **不是标语生成器：** 定位 ≠ 营销文案
- **不是功能优先：** 从客户问题出发，而不是从产品能力出发
- **不是共识驱动：** 迫使你做出艰难取舍（不能“面向所有人”）

### 何时使用
- 为新产品定义定位
- 对现有产品重新定位（转型、市场转变）
- 使利益相关者在产品战略上达成一致
- 为产品发布或重大版本更新做准备
- 在编写依赖定位的产物（PRD、新闻稿、销售演示文稿）之前

### 何时不应使用
- 在开展客户研究之前（定位需要经过验证的洞察）
- 用于拥有固定用户群的内部工具（不需要市场定位）
- 定位已经清晰且经过验证时

---

### 引导流程的权威来源

将 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的默认交互协议。

它定义了：
- 会话开始提示 + 进入模式（引导式、上下文转储、最佳猜测）
- 每轮只问一个问题，并使用通俗易懂的提示语
- 进度标签（例如，Context Qx/8 和 Scoring Qx/5）
- 中断处理和暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供编号式快速选择回答选项（适用时包含 `Other (specify)`）

本文件定义了特定领域的评估内容。如有冲突，请遵循本文件的领域逻辑。

## 应用

此交互式技能会提出**最多 5 个自适应问题**，并在每一步提供 **3-4 个结合上下文的编号选项**。

交互模式：如果你希望采用一次推进一步的流程，在决策点提供编号建议，并为常规问题提供快速选择选项，请与 `skills/workshop-facilitation/SKILL.md` 搭配使用。如果用户要求一次性输出，请跳过多轮引导。

---

### 第 0 步：收集上下文（提问前）

**智能体建议：**

开始之前，让我们先收集产品上下文，为定位工作奠定基础：

**对于你自己的产品：**
- 当前网站文案（首页、产品页面、价值主张）
- 现有的定位陈述或消息传达文档
- 客户评价或案例研究
- 销售异议或竞争赢单/丢单分析
- 产品描述或功能列表

**对于重新定位现有产品：**
- 当前定位（你目前在传达什么？）
- 客户反馈或支持工单（他们反馈了哪些问题？）
- 竞争情报（竞争对手如何定位自己？）

**如果你还没有产品（或希望进行基准比较）：**
- 找到 2-3 个竞争产品或类似产品
- 复制它们的网站首页、定位陈述或价值主张
- 我们将使用这些内容作为参考点

**你可以直接粘贴这些内容，也可以提供简要描述后继续。**

---

### 问题 1：目标客户细分

**智能体提问：**
“根据所提供的上下文，你所服务的主要客户细分群体是谁？”

**提供 4 个编号选项（根据产品上下文进行调整）：**

1. **B2B：中小企业决策者** — 例如，“负责运营管理的小企业主（10-50 名员工）”（如 Gusto、QuickBooks）
2. **B2B：企业级买家** — 例如，“拥有 500 名以上员工的公司中的 IT/产品负责人”（如 Salesforce、Workday）
3. **B2C：大众市场消费者** — 例如，“寻求预算管理工具的 Z 世代用户（18-25 岁）”（如 Mint、Venmo）
4. **B2C：小众领域爱好者** — 例如，“追踪宏量营养素和锻炼情况的健身爱好者”（如 MyFitnessPal、Strava）

**或者描述你自己的目标客户细分群体（请具体说明：人口统计特征、角色、公司规模、行为）。**

**调整提示：**如果营销材料中提到“企业”“中小企业”“消费者”或特定用户画像，请建议采用这些选项。

**用户回答：**[选择或自定义回答]

---

### 问题 2：未被满足的需求（待办任务）

**智能体提问：**
“你的目标客户有哪些尚未得到满足、而你的产品能够解决的需求或痛点？”

**提供 4 个编号选项（根据问题 1 进行调整）：**

**示例（如果 Q1 = B2B 中小企业决策者）：**
1. **耗时的手动工作** — 例如，“每周花费 10 多个小时处理本应自动化的任务”（发票处理、薪资发放、报告）
2. **缺乏可见性或控制力** — 例如，“无法实时查看项目状态，导致错过截止日期”（项目跟踪、仪表板）
3. **合规或风险负担** — 例如，“担心手动操作错误导致税务处罚或法律问题”（会计、人力资源合规）
4. **代价高昂的低效问题** — 例如，“由于流程缓慢或客户体验不畅而损失收入”（销售运营、客户引导）

**或者根据客户研究、支持工单或竞争差距，描述具体的痛点或未满足的需求。**

**调整提示：** 使用所提供材料中客户推荐语或案例研究里的表述。

**用户回答：** [选择或自定义回答]

---

### 问题 3：产品类别

**智能体提问：**
“你的解决方案属于哪一产品类别？（这决定了买家如何评估你。）”

**提供 4 个编号选项（根据 Q1 + Q2 进行调整）：**

**示例（如果 Q1 = B2B 中小企业，Q2 = 耗时的手动工作）：**
1. **工作流自动化平台** — 例如，“跨应用自动执行重复性任务”（如 Zapier、Integromat）
2. **企业管理软件** — 例如，“用于企业运营的一体化平台（发票、薪资、CRM）”（如 HubSpot、Zoho）
3. **垂直 SaaS** — 例如，“专为特定行业打造（例如暖通空调、法律、牙科）”（如 Jobber、Clio）
4. **AI 驱动的助手** — 例如，“通过自然语言实现工作流自动化的 AI 工具”（如 Notion AI、Jasper）

**或者定义你自己的类别。注意：创建新类别存在风险——除非有充分的理由，否则请选择一个现有类别。**

**调整提示：** 如果竞争对手属于某个明确的类别，除非你有意创建新类别，否则默认选择该类别。

**用户回答：** [选择或自定义回答]

---

### 问题 4：核心收益（成果，而非功能）

**智能体提问：**
“你的产品带来的首要收益或成果是什么？（关注客户*获得了什么*，而不是产品*拥有什么*。）”

**提供 3 个编号选项（根据 Q2 中的需求进行调整）：**

**示例（如果 Q2 = 耗时的手动工作）：**
1. **节省时间** — 例如，“将手动工作从每周 10 小时减少到 1 小时”（可衡量的效率提升）
2. **减少错误** — 例如，“消除 95% 的手动数据录入错误”（准确性提升/风险缓解）
3. **节省成本** — 例如，“通过发票自动化，每月节省 500 美元的人工成本”（直接投资回报）

**或者描述你的产品所带来的具体、可衡量的成果。**

**质量检查：** 避免描述功能（“拥有 AI”“包含仪表板”）。应聚焦成果（“让决策速度提升至 3 倍”“防止违反合规要求”）。

**用户回答：** [选择或自定义回答]

---

### 问题 5：竞争差异化

**智能体提问：**
“你的主要竞争对手或替代方案是什么？你与其有何不同？”

**提供 4 个编号选项（根据 Q3 中的类别进行调整）：**

**示例（如果 Q3 = 工作流自动化平台）：**
1. **现有 SaaS 领导者** — 例如，“与 Zapier（需要技术配置）不同，我们提供无需编码的可视化工作流，非技术用户也能轻松使用”
2. **电子表格/手动流程** — 例如，“与 Excel（需要手动更新）不同，我们可在各种工具之间提供实时自动同步”
3. **垂直领域竞争对手** — 例如，“与通用自动化工具不同，我们专为[行业]预先构建，并提供模板和合规功能”
4. **仅面向企业的解决方案** — 例如，“与企业级工具（复杂、昂贵）不同，我们专为中小企业设计，定价简单，10 分钟即可完成设置”

**或者描述你的主要竞争替代方案和独特差异化优势（重点关注成果，而非功能）。**

**调整提示：** 使用所提供材料中的竞争情报（赢单/丢单分析、销售异议）。

**用户回答：** [选择或自定义回答]

---

### 输出：生成定位陈述

收集回答后，智能体使用 `positioning-statement.md` 格式生成定位陈述：

```markdown
# Positioning Statement

**Based on your responses, here's your positioning statement:**

---

## Value Proposition

**For** [Target customer from Q1]
- **that need** [Underserved need from Q2]
- [Product name]
- **is a** [Product category from Q3]
- **that** [Key benefit from Q4]

---

## Differentiation Statement

- **Unlike** [Primary competitor from Q5]
- [Product name]
- **provides** [Unique differentiation from Q5]

---

## Positioning Summary (One-Sentence Version)

[Product name] is a [category] for [target] that [benefit], unlike [competitor] which [limitation].

**Example:** "Acme Workflows is a no-code automation platform for small business owners that reduces manual work from 10 hours/week to 1 hour, unlike Zapier which requires technical setup and coding knowledge."

---

## Next Steps

1. **Stress-test this positioning:**
   - Read it aloud to 5 target customers. Do they recognize themselves?
   - Share with stakeholders (product, marketing, sales). Does it align?
   - Check if differentiation is defensible (can competitors copy this in 6 months?).

2. **Refine based on feedback:**
   - If target feels too broad → Narrow further (e.g., "SMB owners" → "SMB owners in service industries")
   - If need isn't resonating → Validate with more customer research
   - If category confuses → Pick a clearer category or commit to category creation

3. **Apply to artifacts:**
   - Update website homepage and product pages
   - Revise sales deck and pitch materials
   - Use in PRD, press release, or roadmap planning (reference `press-release.md`, `positioning-statement.md`)

---

**Would you like to refine any part of this positioning, or shall we document it as final?**
```

---

## 示例

### 示例 1：优秀的定位研讨会（B2B SaaS 自动化）

**步骤 0 - 已提供的背景信息：**
用户分享当前的网站文案：
> “Acme Workflows 帮助小型企业自动化重复性任务。连接你的应用并节省时间。”

**问题 1 回答：**“B2B：中小企业决策者——负责运营管理的小企业主（10-50 名员工）”

**问题 2 回答：**“耗时的手动工作——每周花费 10 小时以上处理发票、录入数据和编写报告”

**问题 3 回答：**“工作流自动化平台——跨应用自动执行重复性任务”

**问题 4 回答：**“节省时间——将手动工作从每周 10 小时减少到 1 小时”

**问题 5 回答：**“在位 SaaS 领导者——与 Zapier（需要进行技术设置）不同，我们提供非技术用户也能使用的无代码可视化工作流”

---

**生成的定位陈述：**

```markdown
## Value Proposition

**For** small business owners (10-50 employees) managing daily operations
- **that need** to eliminate 10+ hours/week spent on manual tasks like invoice processing, data entry, and reporting
- Acme Workflows
- **is a** no-code workflow automation platform
- **that** reduces manual work from 10 hours/week to 1 hour by automating repetitive tasks across apps

## Differentiation Statement

- **Unlike** Zapier, which requires technical setup and coding knowledge
- Acme Workflows
- **provides** visual, no-code workflows that non-technical business owners can set up in 10 minutes

## Positioning Summary

Acme Workflows is a no-code automation platform for small business owners that reduces manual work from 10 hours/week to 1 hour, unlike Zapier which requires technical setup and coding knowledge.
```

**这一定位有效的原因：**
- 目标受众明确（中小企业主、10-50 名员工、专注于运营）
- 需求可衡量（每周在手动任务上花费 10 小时以上）
- 品类清晰（工作流自动化）
- 收益聚焦于结果（10 小时 → 1 小时）
- 差异化优势站得住脚（无代码与技术设置之别）

---

### 示例 2：糟糕的定位研讨（模糊）

**问题 1 回答：**“企业”
**问题 2 回答：**“需要更好的工具”
**问题 3 回答：**“软件”
**问题 4 回答：**“生产力”
**问题 5 回答：**“我们比竞争对手更好”

**生成的定位陈述：**

```markdown
**For** businesses
- **that need** better tools
- ProductX
- **is a** software
- **that** improves productivity

**Unlike** competitors
- ProductX
- **provides** better features
```

**这一定位失败的原因：**
- 目标受众过于宽泛（“企业”= 所有人）
- 需求模糊（“更好的工具”= 毫无意义）
- 品类不具体（“软件”什么也没说明）
- 收益无法衡量（“生产力”= 提升多少？）
- 差异化内容空洞（“更好的功能”= 无法验证）

**如何改进：**返回上一步，给出具体的回答。使用客户研究结果，而不是猜测。

---

## 常见陷阱

### 陷阱 1：“面向所有人”
**症状：**目标受众是“所有企业”或“任何希望提高生产力的人”

**后果：**定位变得无法被感知——没有人会觉得它是*为自己*打造的。

**解决方法：**毫不留情地缩小范围。选定*第一个*客户细分群体。以后可以再扩展。

---

### 陷阱 2：需求是一项功能请求
**症状：**“需要更好的仪表板”或“需要 AI 驱动的分析”

**后果：** 你直接跳到了方案，而不是问题。

**修正：** 询问“他们为什么需要它？”持续追问，直到找到根本需求。

---

### 陷阱 3：类别混淆
**症状：** “我们是面向数字化转型的下一代平台”

**后果：** 买家不知道该如何评估你。

**修正：** 选择一个买家能够理解的类别。如果要创建一个新类别，请为类别教育预留预算。

---

### 陷阱 4：把功能当作差异化优势
**症状：** “与竞争对手不同，我们拥有 AI”

**后果：** 功能可以被复制，无法形成持久的差异化优势。

**修正：** 聚焦成果：“与竞争对手不同，我们将设置时间从 2 小时缩短到了 10 分钟。”

---

### 陷阱 5：缺乏客户验证
**症状：** 闭门造车地制定定位，从未与客户进行验证

**后果：** 它在内部听起来不错，但无法在外部引起共鸣。

**修正：** 向 5 位目标客户宣读定位陈述。如果他们没有说“对，说的就是我”，就进行修改。

---

## 参考资料

### 相关技能
- `positioning-statement.md` — 本工作坊生成的输出格式
- `proto-persona.md` — 定义“For [target]”细分群体
- `jobs-to-be-done.md` — 为“that need”陈述提供依据
- `problem-statement.md` — 问题界定为定位提供支持
- `press-release.md` — 定位为新闻稿的信息传达提供依据

### 外部框架
- Geoffrey Moore，*Crossing the Chasm*（1991）— 定位陈述格式的起源
- April Dunford，*Obviously Awesome*（2019）— 现代定位方法论

### Dean 的工作
- 定位陈述提示词模板

---

**技能类型：** 交互式
**建议文件名：** `positioning-workshop.md`
**建议位置：** `/skills/interactive/`
**依赖项：** 使用 `positioning-statement.md`，引用 `proto-persona.md`、`jobs-to-be-done.md`、`problem-statement.md`