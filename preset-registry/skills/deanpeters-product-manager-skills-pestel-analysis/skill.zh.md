---
name: pestel-analysis
argument-hint: "[product or market]"
description: Analyze political, economic, social, technological, environmental, and legal forces. Use when external market shifts could materially affect a product, roadmap, or strategy.
intent: >-
  Conduct a systematic analysis of macro-environmental factors—Political, Economic, Social, Technological, Environmental, and Legal—that could impact your product or project. Use this to identify external opportunities and threats, inform strategic planning, assess market entry risks, and make data-driven decisions about product direction in the context of broader forces beyond your control.
type: component
theme: market-intelligence
best_for:
  - "Scanning external forces before committing to a strategy or roadmap"
  - "Naming the macro assumptions your plan quietly depends on"
  - "Preparing the environmental context for a strategy review"
scenarios:
  - "We're setting next year's strategy and haven't looked at external forces in a while"
  - "New regulation is coming and I need to map what else could shift underneath us"
estimated_time: "30-45 min"
---
## 目的
系统分析可能影响你的产品或项目的宏观环境因素——政治、经济、社会、技术、环境和法律因素。利用该分析识别外部机会与威胁，为战略规划提供依据，评估市场进入风险，并在你无法控制的更广泛外部力量背景下，基于数据就产品方向做出决策。

这不是内部分析，而是面向外部的评估，旨在审视塑造产品环境的宏观力量。

## 输入

**最适合提供：** 此分析所服务的产品、市场或战略决策。  
**提供这些信息也很有用：** 地理区域、时间范围，以及你已认为最重要的因素。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些信息并跳过其已涵盖的问题；不要重复询问。

**毫无准备也没关系。** 该技能会在扫描六类因素之前询问要分析的产品/市场和地理区域——缺少明确分析对象的 PESTEL 只是一场知识问答练习。

**调用示例：** `PESTEL for launching our telehealth platform in Germany over the next 18 months.`

## 核心概念

### PESTEL 框架
PESTEL 源自 Francis Joseph Aguilar 于 1967 年提出的 PEST 分析，并将该框架扩展为六个类别：

1. **政治：** 政府政策、稳定性、贸易法规、税收
2. **经济：** 增长率、通货膨胀、汇率、消费者支出
3. **社会：** 人口结构、文化趋势、生活方式变化、消费者态度
4. **技术：** 技术进步、研发、自动化、数字化转型
5. **环境：** 气候变化、可持续性、资源稀缺、法规
6. **法律：** 合规、知识产权、劳动法、健康与安全法规

### 为什么这种方法有效
- **全面：** 涵盖影响产品的所有主要外部力量
- **主动：** 在威胁和机会变得至关重要之前识别它们
- **战略性：** 为长期规划而非仅仅战术决策提供依据
- **风险管理：** 揭示产品战略中的薄弱环节

### 反模式（这不是什么）
- **不是竞争分析：** PESTEL 关注宏观因素，而非竞争对手
- **不是内部分析：** 聚焦外部环境，而非你公司的优势与劣势
- **不是静态分析：** 宏观环境会发生变化——应定期重新评估

### 何时使用
- 进入新市场或新地理区域
- 战略规划（年度路线图规划、3-5 年规划）
- 在不断变化的环境中评估产品可行性
- 评估新产品计划的风险
- 向高管或投资者进行推介（体现对外部环境的认知）

### 何时不应使用
- 用于战术性短期决策时（应改用竞争分析）
- 外部因素稳定且已得到充分了解时
- 作为客户研究的替代方案（PESTEL 关注宏观层面，而非微观层面）

---

## 应用

使用 `template.md` 获取完整的填充结构。

### 步骤 1：定义范围

明确你要分析的内容：

```markdown
## Overview

- **Project/Product Name:** [e.g., "AI-Powered Invoice Automation for SMBs"]
- **Analysis Purpose:** [e.g., "Assess viability of launching in EU market"]
- **Analyst:** [Your name or team]
- **Date:** [Date of analysis]
- **Geographic Scope:** [e.g., "United States and European Union"]
- **Time Horizon:** [e.g., "Next 12-24 months"]
```

**质量检查：**
- **具体：** 不要写“分析市场”，而要写“评估在欧盟市场推出产品的可行性”
- **有时间范围：** PESTEL 因素会发生变化——请明确你的时间范围

---

### 步骤 2：分析政治因素

审视政府和监管方面的影响：

```markdown
## 1. Political Factors

### Government Policies
- [How could government policies impact the product?]
- [Example: "EU's AI Act requires transparency in AI decision-making; our invoice automation must explain recommendations"]

### Political Stability
- [Assess stability in relevant regions]
- [Example: "US political stability is moderate; potential for regulatory changes in financial tech under new administration"]

### Trade Regulations
- [Examine trade regulations and their effects]
- [Example: "Brexit complicates data transfer between UK and EU; may require separate infrastructure"]

### Taxation Policy
- [Analyze taxation policies and implications]
- [Example: "Digital services tax in EU (3% on revenue) could impact pricing strategy"]
```

**质量检查：**
- **与你的产品相关：** 不要罗列通用政策——要说明其影响
- **可操作：** 你能否根据这一洞察调整策略？

---

### 步骤 3：分析经济因素

审视经济状况：

```markdown
## 2. Economic Factors

### Economic Growth
- [Evaluate growth rates and their impact]
- [Example: "SMB sector growing 5% annually in US; strong demand for automation tools"]

### Inflation Rate
- [Consider inflation and its effect on pricing/costs]
- [Example: "High inflation (6%) pressures SMB budgets; price sensitivity increases"]

### Exchange Rates
- [Analyze exchange rate fluctuations]
- [Example: "Weak Euro vs. Dollar makes US pricing less competitive in EU; may need regional pricing"]

### Consumer Spending
- [Assess consumer spending levels]
- [Example: "SMBs cutting discretionary spending due to recession fears; emphasize ROI (time savings) in messaging"]
```

**质量检查：**
- **数据驱动：** 使用真实的经济指标（GDP 增长率、通货膨胀率等）
- **与产品相关：** 这些趋势会如何影响*你的*产品？

---

### 步骤 4：分析社会因素

审视社会和文化趋势：

```markdown
## 3. Social Factors

### Demographics
- [Examine demographics and market influence]
- [Example: "Aging SMB owners (Baby Boomers) less tech-savvy; younger Gen X/Millennial owners more receptive to automation"]

### Cultural Trends
- [Analyze cultural trends and demand impact]
- [Example: "Growing 'hustle culture' among freelancers increases demand for time-saving tools"]

### Lifestyle Changes
- [Consider lifestyle changes and implications]
- [Example: "Remote work boom increases solo entrepreneurs and freelancers; core target market expanding"]

### Consumer Attitudes
- [Assess consumer attitudes and behaviors]
- [Example: "Increasing trust in AI for routine tasks (invoicing, scheduling); less resistance than 5 years ago"]
```

**质量检查：**
- **基于趋势：** 参考真实的文化变迁，而非主观假设
- **经过验证：** 使用调查数据、研究报告或人口统计研究

---

### 第 5 步：分析技术因素

审视技术格局：

```markdown
## 4. Technological Factors

### Technological Advancements
- [Identify advancements and their impact]
- [Example: "Large language models (LLMs) enable better invoice data extraction; competitive advantage if adopted early"]

### R&D Activity
- [Evaluate sector R&D levels]
- [Example: "High R&D investment in fintech automation; rapid innovation cycle—need to iterate fast"]

### Automation
- [Assess automation implications]
- [Example: "Competitors adopting AI-powered automation; table stakes for market entry—must match or exceed"]

### Digital Transformation
- [Consider digital transformation trends]
- [Example: "SMBs adopting cloud-first tools (QuickBooks Online, Xero); need strong integrations to succeed"]
```

**质量检查：**
- **竞争环境：** 技术格局会如何影响你的市场地位？
- **可执行性：** 你需要开展哪些研发工作或建立哪些合作伙伴关系？

---

### 第 6 步：分析环境因素

审视环境与可持续发展问题：

```markdown
## 5. Environmental Factors

### Climate Change
- [Analyze climate change implications]
- [Example: "Minimal direct impact; however, B Corps and sustainability-focused SMBs prefer vendors with carbon-neutral operations"]

### Sustainability Practices
- [Evaluate sustainability impact]
- [Example: "Growing demand for 'green tech'; marketing opportunity to highlight cloud efficiency vs. on-prem servers"]

### Resource Scarcity
- [Assess resource scarcity risks]
- [Example: "Low risk; software product doesn't depend on physical resources"]

### Environmental Regulations
- [Examine environmental regulations]
- [Example: "EU's Carbon Border Adjustment Mechanism (CBAM) doesn't affect SaaS directly"]
```

**质量检查：**
- **如实评估：** 如果影响很小，就明确说明（不要强行建立关联）
- **市场定位：** 环境因素能否成为差异化优势？

---

### 第 7 步：分析法律因素

审视法律与合规格局：

```markdown
## 6. Legal Factors

### Compliance Requirements
- [Identify legal/compliance requirements]
- [Example: "GDPR compliance required for EU customers; must implement data residency, right-to-be-forgotten, consent management"]

### Intellectual Property Rights
- [Evaluate IP importance and protection]
- [Example: "Patent landscape for AI invoice processing is crowded; focus on trade secrets over patents"]

### Employment Laws
- [Consider employment laws and implications]
- [Example: "Remote hiring across EU requires understanding of local labor laws (Germany, France have strict employment contracts)"]

### Health and Safety Regulations
- [Assess health/safety regulations]
- [Example: "Not applicable (software product)"]
```

**质量检查：**
- **法律风险评估：** 哪些因素可能阻碍或延迟你的产品推进？
- **合规成本：** 是否为法律服务、数据驻留和认证预留了预算？

---

### 步骤 8：综合洞察

分析完全部六项因素后，总结如下：

```markdown
## Strategic Insights Summary

### Top Opportunities:
1. **[Opportunity 1]** - [Description and action]
   - [Example: "Social: Remote work boom expands target market → Increase marketing to freelancers"]
2. **[Opportunity 2]** - [Description and action]
3. **[Opportunity 3]** - [Description and action]

### Top Threats:
1. **[Threat 1]** - [Description and mitigation]
   - [Example: "Economic: Recession fears increase price sensitivity → Emphasize ROI in messaging, offer lower-tier pricing"]
2. **[Threat 2]** - [Description and mitigation]
3. **[Threat 3]** - [Description and mitigation]

### Strategic Recommendations:
1. **[Recommendation 1]** - [Action to take]
2. **[Recommendation 2]** - [Action to take]
3. **[Recommendation 3]** - [Action to take]
```

---

### 步骤 9：定期更新

- **年度审查：** 在战略规划期间重新评估 PESTEL 因素
- **触发事件：** 发生重大外部事件时进行更新（新法规、经济变化等）
- **跟踪变化：** 记录各项因素随时间如何演变

---

## 示例

完整的 PESTEL 分析示例请参见 `examples/sample.md`。

简短示例摘录：

```markdown
### 1. Political Factors
- EU AI Act requires transparency in AI decision-making

### 2. Economic Factors
- High inflation increases SMB price sensitivity
```

## 常见误区

### 误区 1：分析过于笼统
**表现：**“政治：存在法规。经济：经济状况会影响支出。”

**后果：** 无法得出可付诸行动的洞察。

**修正方法：** 具体说明：“欧盟《人工智能法案》要求 AI 具备可解释性 → 需要在 2026 年第三季度前提供透明度功能。”

---

### 误区 2：忽视低影响因素
**表现：** 强行建立并不存在的关联（例如，“气候变化会影响我们的 SaaS 产品……”）

**后果：** 浪费时间，分散重点。

**修正方法：** 如果某项因素影响较低，应如实说明。将精力集中在高影响领域。

---

### 误区 3：没有数据来源
**表现：**“经济增长强劲”（无引用来源）

**后果：** 论断无法验证，可信度低。

**修正方法：** 引用来源：“中小企业领域每年增长 5%（美国人口普查局，2025 年）。”

---

### 误区 4：只有分析，没有行动
**表现：** 罗列了大量因素，却没有战略建议

**后果：** 洞察无法为决策提供依据。

**修正方法：** 将分析综合为“首要机会”“主要威胁”和“战略建议”。

---

### 误区 5：一次性分析
**表现：** PESTEL 分析只做一次，之后再未重新审视

**后果：** 随着宏观环境变化，洞察逐渐过时。

**修正方法：** 每年进行审查，或在发生重大外部事件时进行审查（新法规、经济变化等）。

---

## 参考资料

### 相关技能
- `skills/recommendation-canvas/SKILL.md` — PESTEL 因素为画布中的风险评估提供依据
- `skills/positioning-statement/SKILL.md` — PESTEL 洞察有助于塑造竞争定位
- `skills/problem-statement/SKILL.md` — 社会和经济因素会影响客户问题

### 外部框架
- Francis Joseph Aguilar，《扫描商业环境》（1967）— PEST 分析的起源
- PESTEL（PEST 的扩展，增加了环境和法律因素）
- Michael Porter，《竞争战略》（1980）— 以行业层面的分析补充 PESTEL

### Dean 的工作
- PESTEL 分析提示模板（改编自 Aguilar 的框架）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/pestel-analysis-prompt-template.md`。

---

**技能类型：** 组件
**建议的文件名：** `pestel-analysis.md`
**建议的放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/recommendation-canvas/SKILL.md`、`skills/positioning-statement/SKILL.md`