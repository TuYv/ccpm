---
name: company-research
argument-hint: "[company name] [purpose]"
description: Create a company research brief with executive quotes, product strategy, and org context. Use when preparing for interviews, competitive analysis, partnerships, or market-entry work.
intent: >-
  Create a comprehensive company profile that extracts executive insights, product strategy, transformation initiatives, and organizational dynamics from publicly available sources. Use this to understand competitive landscape, evaluate partnership opportunities, benchmark best practices, prepare for interviews, or inform market entry decisions by understanding how successful companies think about product management and strategy.
type: component
theme: market-intelligence
best_for:
  - "Preparing for a PM interview with real company context"
  - "Building a competitor or partner brief before a first meeting"
  - "Understanding a company's product strategy from public signals"
scenarios:
  - "I have a PM interview next week and need real context on their product strategy"
  - "We're meeting a potential partner and I need a brief on how they actually make money"
estimated_time: "20-40 min"
---
## 目的
创建一份全面的公司档案，从公开来源中提炼高管洞察、产品战略、转型举措和组织动态。通过了解成功企业如何思考产品管理与战略，利用这份档案分析竞争格局、评估合作机会、对标最佳实践、准备面试或为市场进入决策提供依据。

这并非浅层研究，而是专注于产品管理视角和高管愿景的战略情报收集。

## 输入

**最适合提供：** 要研究的公司。
**同样有帮助：** 研究该公司的原因（面试准备、竞争分析、合作、市场进入）——这会改变简报的侧重点。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些内容，并跳过其已涵盖的问题；不要重复询问。

**没有准备任何信息？也没关系。** 该技能会在起草简报前询问公司名称和研究目的。

**调用示例：** `Build a company research brief on Datadog — I interview with their platform PM team Friday.`

## 核心概念

### 高管洞察框架
该框架从多个维度综合公司情报：

**核心组成部分：**
1. **公司概况：** 基本信息、发展历史、行业背景
2. **高管引述：** 来自 CEO、COO、产品副总裁、产品组经理的战略愿景
3. **产品洞察：** 战略、近期发布、创新重点
4. **转型战略：** 数字化、AI、敏捷转型
5. **组织影响：** 产品管理如何影响战略及跨职能协作
6. **未来路线图：** 即将开展的举措和预期挑战
7. **产品驱动增长 (PLG)：** PLG 战略、数据驱动型决策

### 此方法为何有效
- **高管视角：** 捕捉领导层的思考，而不仅仅是营销文案
- **以产品为中心：** 聚焦与产品管理相关的洞察（战略、流程、文化）
- **多来源：** 综合访谈、财报电话会议、博客文章和案例研究
- **战略情报：** 为竞争定位、合作评估或面试准备提供依据

### 反模式（这不是什么）
- **并非财务分析：** 重点是产品战略，而非估值或股价表现
- **并非 SWOT 分析：** 本文档记录的是该公司的视角，而非对其优势与劣势的评估
- **并非浅层信息抓取：** 不要止步于“关于我们”页面——应寻找高管访谈、产品博客和财报文字记录

### 适用场景
- 竞争分析（了解竞争对手如何开展产品管理）
- 合作评估（评估文化契合度和战略方向）
- 面试准备（了解公司文化和产品理念）
- 对标最佳实践（向成功企业学习）
- 市场进入决策（了解现有企业的运营方式）

### 不适用的情况
- 用于内部分析（这是外部研究）
- 无法获取一手资料时（高管尚未公开发表过相关言论）
- 用来替代客户研究（这是公司视角，而非客户视角）

---

## 应用方法

使用 `template.md` 获取完整的填写结构。

### 第 1 步：定义研究范围

明确研究的内容和原因：

```markdown
## Research Objective
- **Company Name:** [e.g., "Stripe"]
- **Research Purpose:** [e.g., "Understand payment platform product strategy for competitive positioning"]
- **Key Questions:**
  - [Question 1: e.g., "How does Stripe think about platform extensibility?"]
  - [Question 2: e.g., "What's their approach to developer experience?"]
  - [Question 3: e.g., "How do they prioritize roadmap vs. custom enterprise requests?"]
```

---

### 第 2 步：收集公司概况

记录公司的基本信息：

```markdown
### Company Overview

**Basic Information:**
- **Name:** [Official company name]
- **Headquarters:** [Location]
- **Industry:** [Primary industries, e.g., "Fintech, Payment Processing, Developer Tools"]
- **Founded:** [Year]
- **Size:** [Employees, revenue if public, funding if private]

**Brief History:**
- [Key milestones that shaped current market position]
- [Example: "2010: Founded by Patrick and John Collison. 2011: Launched 7-line integration. 2018: Launched Stripe Atlas. 2021: $95B valuation."]
```

**需要查阅的来源：**
- 公司网站（About、Press、Blog）
- LinkedIn 公司页面
- Crunchbase / PitchBook（用于查询融资/估值）
- Wikipedia（用于了解历史）

---

### 第 3 步：提取高管关于战略愿景的引述

查找关键高管近期发表的言论：

```markdown
### Executive Quotes on Strategic Vision

**Quote from the CEO:**
- "[Recent quote discussing long-term vision and market approach]"
- **Source:** [Link to interview, earnings call, blog post, conference talk]
- **Date:** [When the quote was made]
- **Context:** [Brief explanation of what prompted this quote]

**Quote from the COO:**
- "[Recent quote focusing on operational strategies and challenges]"
- **Source:** [Link]
- **Date:** [When]

**Quote from the VP of Product Management:**
- "[Recent quote detailing product strategy and innovation focus]"
- **Source:** [Link]
- **Date:** [When]

**Quote from the Group Product Manager:**
- "[Recent quote discussing specific product initiatives and customer engagement]"
- **Source:** [Link]
- **Date:** [When]
```

**需要查阅的来源：**
- 财报电话会议文字记录（如果是上市公司）
- 播客访谈（例如 Lenny's Podcast、Masters of Scale、How I Built This）
- 会议演讲（YouTube、公司博客）
- 高管撰写的博客文章
- LinkedIn 帖子
- 行业出版物（TechCrunch、The Verge 等）

**质量检查：**
- **时效性：** 优先选择过去 12-24 个月内的引述
- **实质性：** 寻找有关战略/理念的内容，而不是泛泛的公关表述
- **可归因性：** 始终注明来源和日期

---

### 第 4 步：记录产品洞察

综合产品战略与近期发布：

```markdown
### Detailed Product Insights

**Product Strategy Overview:**
- [Describe overall product strategy, emphasizing integration of market needs with technological capabilities]
- [Example: "Stripe's product strategy centers on developer experience: reduce integration complexity, provide powerful primitives, enable rapid experimentation"]

**Recent Product Launches and Innovations:**
1. **[Product/Feature 1]** - [Description and market impact]
   - [Example: "Stripe Tax (2021): Automated sales tax calculation. Removed compliance barrier for global expansion."]
2. **[Product/Feature 2]** - [Description and impact]
3. **[Product/Feature 3]** - [Description and impact]

**Product Philosophy:**
- [Key principles that guide product decisions]
- [Example: "Start with developer needs, not enterprise sales. Build for 10x scale before you need it. Default to public APIs."]
```

**需要查阅的来源：**
- 产品博客或变更日志
- Product Hunt 上的产品发布
- 发布说明
- 产品团队博客文章或案例研究

---

### 第 5 步：识别转型战略

记录公司的演进方式：

```markdown
### Transformation Strategies and Initiatives

**Digital Transformation:**
- [Describe approach to digital transformation, emphasizing integration of cutting-edge technology with existing processes]
- [Example: "Migrated from monolith to microservices architecture (2019-2022). Enabled 10x faster feature deployment."]

**AI Transformation:**
- [Explain how AI is incorporated into core processes, product offerings, and market positioning]
- [Example: "Launched Radar for fraud detection (ML-powered). Reduced false positives by 40%, processing $640B annually."]

**Agile Transformation:**
- [Detail adoption of Agile methodologies, highlighting improvements in collaboration, project management, product delivery]
- [Example: "Adopted Shape Up methodology (6-week cycles, no sprints). Improved focus, reduced meeting overhead."]
```

**需要查阅的来源：**
- 工程博客
- 案例研究或白皮书
- 工程/产品负责人在会议上的演讲
- 关于流程变革的 LinkedIn 帖子

---

### 第 6 步：了解产品管理对组织的影响

记录产品经理职能在组织内的运作方式：

```markdown
### Organizational Impact of Product Management

**Role of Product Management in Strategic Decisions:**
- [Discuss how PM influences strategic decisions]
- [Example: "PMs own P&L for their product area. Directly influence company roadmap through quarterly planning process. CEO reviews roadmap with PM leads, not just VPs."]

**Cross-Functional Collaboration:**
- [Outline collaboration between PM and other departments]
- [Example: "PMs co-located with engineering (not in separate 'product' org). Weekly design reviews with Design VP. Monthly GTM sync with Sales/Marketing."]

**PM Career Paths:**
- [If available, describe how PMs grow and advance]
- [Example: "IC track: PM → Senior PM → Staff PM → Principal PM. Manager track: PM → Group PM → Director → VP."]
``

**需要查阅的来源：**
- PM 职位招聘信息（描述角色、职责和团队结构）
- LinkedIn 个人资料（追踪 PM 的职业发展路径）
- PM 博客文章或访谈
- Glassdoor 评价（了解内部文化）

---

### 第 7 步：分析未来路线图和挑战

确定公司的发展方向：

```markdown
### Future Product Roadmap and Challenges

**Upcoming Product Initiatives:**
- [Detail planned initiatives and alignment with strategic goals]
- [Example: "Expanding into embedded finance (Stripe Capital, Stripe Treasury). Goal: Become financial infrastructure for the internet, not just payments."]

**Anticipated Market Challenges:**
- [Identify potential challenges and PM team plans to address them]
- [Example: "Challenge: Increasing competition from Square, PayPal. Response: Double down on developer experience, global expansion (70+ countries)."]

**Competitive Threats:**
- [Document acknowledged or observed competitive pressures]
```

**需要查阅的来源：**
- 财报电话会议（前瞻性陈述）
- 分析师报告
- 行业新闻（竞争对手的融资轮次、市场变化）

---

### 第 8 步：记录产品驱动增长洞察

如适用，记录 PLG 策略：

```markdown
### Product-Led Growth Insights

**Implementation of PLG Strategies:**
- [Describe how the company employs PLG to enhance customer acquisition, retention, expansion]
- [Example: "Self-serve onboarding: 7-line code integration. No sales calls required for <$1M ARR. 90% of customers start with free tier."]

**Data-Driven Product Decisions:**
- [Explain role of data analytics in shaping product decisions and driving growth]
- [Example: "Instrumented every API call. PMs have real-time dashboards. Feature adoption tracked within 24 hours of launch."]
```

**需要查阅的来源：**
- 产品分析博客文章
- 增长团队博客文章
- 关于激活、留存和扩展的案例研究

---

### 第 9 步：归纳关键要点

总结最重要的洞察：

```markdown
### Key Takeaways

**Strategic Principles:**
1. **[Principle 1]** - [What you learned about their approach]
2. **[Principle 2]** - [What you learned]
3. **[Principle 3]** - [What you learned]

**Product Management Lessons:**
1. **[Lesson 1]** - [Applicable insight for your context]
2. **[Lesson 2]** - [Applicable insight]
3. **[Lesson 3]** - [Applicable insight]

**Questions for Further Research:**
- [Unanswered question 1]
- [Unanswered question 2]
```

---

## 示例

完整的公司研究示例请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
**Company Name:** Stripe
**Research Purpose:** Understand payment platform product strategy
**Key Questions:** Developer experience? Platform extensibility?
```

## 常见陷阱

### 陷阱 1：浅层研究
**表现：** “Stripe 是一家支付公司。他们处理支付业务。”

**后果：** 无法获得战略洞察。

**解决方法：** 深入挖掘——查找高管访谈、工程博客和产品理念文章。

---

### 误区 2：没有注明来源
**表现：**“CEO 表示，公司专注于创新”

**后果：**无法核实，可信度低。

**改进：**始终注明来源和日期：“CEO 表示 X（来源：Lenny's Podcast，第 185 期，2023 年 9 月）。”

---

### 误区 3：将观点与事实混为一谈
**表现：**“Stripe 的产品战略很出色，因为他们专注于开发者”

**后果：**这是分析，而不是研究。

**改进：**记录他们做了*什么*，而不是评价这是否“好”。将分析留到“关键要点”部分。

---

### 误区 4：信息过时
**表现：**使用 5 年前的引述或战略

**后果：**洞察不再相关（公司战略会不断演变）。

**改进：**优先采用过去 12 至 24 个月内的来源。

---

### 误区 5：忽视负面信号
**表现：**只记录成功，而忽视挑战或失败

**后果：**无法呈现完整情况。

**改进：**纳入“预期市场挑战”和竞争威胁。

---

## 参考资料

### 相关技能
- `skills/positioning-statement/SKILL.md` — 使用公司研究来了解竞争定位
- `skills/pestel-analysis/SKILL.md` — 公司研究为市场背景分析提供信息
- `skills/proto-persona/SKILL.md` — 高管言论可能揭示目标用户画像

### 外部框架
- 竞争情报框架
- 战略分析方法论

### Dean 的工作
- 高管洞察公司概况模板

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/company-profile-executive-insights-research.md`。

---

**技能类型：**组件
**建议文件名：**`company-research.md`
**建议放置位置：**`/skills/components/`
**依赖项：**引用 `skills/positioning-statement/SKILL.md`、`skills/pestel-analysis/SKILL.md`