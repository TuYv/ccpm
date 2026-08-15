---
name: tam-sam-som-calculator
argument-hint: "[product idea] [market constraints]"
description: Calculate TAM, SAM, and SOM with explicit assumptions, methods, and caveats. Use when sizing a market for a product idea, business case, or executive review.
intent: >-
  Guide product managers through calculating Total Addressable Market (TAM), Serviceable Available Market (SAM), and Serviceable Obtainable Market (SOM) for a product idea by asking adaptive, contextually relevant questions. Use this to build defensible market size estimates backed by real-world citations, economic projections, and population data—essential for pitching to investors, securing budget, or validating product-market fit.
type: interactive
---
## 目的
通过提出自适应且与上下文相关的问题，指导产品经理计算产品创意的总潜在市场（TAM）、可服务市场（SAM）和可获得市场（SOM）。使用本技能构建有真实世界引文、经济预测和人口数据支持、经得起推敲的市场规模估算——这对于向投资者推介、争取预算或验证产品市场契合度至关重要。

这不是草率的粗略估算，而是一套结构化、有引文支持且经得起审视的分析。

## 输入

**最适合提供：** 要估算市场规模的产品或创意，以及你已知的任何市场约束条件（地理区域、垂直行业、客户类型）。
**同样有用：** 定价假设、可比公司，以及这些数据的目标受众（投资者、高管、商业论证）。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些信息并跳过其已涵盖的问题；不要重复提问。

**什么都没准备？也没问题。** 计算器会首先询问你要估算什么以及估算结果面向谁，然后逐步确定方法和假设。

**调用示例：** `Size the market: AI scheduling assistant for independent dental practices, US only, $99/mo price point.`

## 核心概念

### TAM/SAM/SOM 框架
三级市场规模估算模型：

**总潜在市场（TAM）：**
- 某种产品或服务的市场总需求
- “如果我们占据 100% 的市场，收入会是多少？”
- 范围最广的潜在市场（无任何约束）

**可服务市场（SAM）：**
- 你的公司实际能够触达的 TAM 细分市场
- 根据地理区域、企业特征、人口统计特征或产品约束进一步缩小范围
- “我们的产品实际上能够触达哪些人？”

**可获得市场（SOM）：**
- 你实际能够获取的 SAM 份额
- 将竞争、市场约束和市场进入能力纳入考量
- “未来 1-3 年内我们能占据多少市场？”

### 为什么这种方法有效
- **自上而下的验证：** TAM → SAM → SOM 可确保估算立足于现实
- **对投资者友好：** 风险投资人和高管都熟悉的标准框架
- **有引文支持：** 真实的数据来源（人口普查、Statista、世界银行）可增强可信度
- **自适应：** 根据上下文调整问题（B2B 与 B2C、美国与全球等）

### 反面模式（这不是什么）
- **不是单一数字的猜测：** 在没有支持数据的情况下声称“市场规模是 100 亿美元”
- **不是静态不变的：** 市场会不断演变——应每年重新评估
- **不能替代客户验证：** 市场规模 ≠ 产品市场契合度

### 何时使用
- 向投资者或高管推介（需要在演示文稿中提供市场规模）
- 验证产品创意（市场是否足够大？）
- 确定产品线的优先级（哪个机会更大？）
- 设定增长目标（实际能够获取多少市场？）

### 何时不应使用
- 面向固定用户群的内部工具（不存在外部市场）
- 在定义问题之前（市场规模估算需要明确的问题空间）
- 将其作为唯一的验证手段（应与客户研究结合使用）

---

### 引导流程的权威依据

默认使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为此技能的交互协议。

它定义了：
- 会话预告 + 进入模式（引导式、上下文倾倒、最佳猜测）
- 每轮只提一个问题，并使用通俗易懂的提示语
- 进度标签（例如，Context Qx/8 和 Scoring Qx/5）
- 中断处理和暂停/恢复行为
- 在决策点提供编号建议
- 为常规问题提供可快速选择的编号回答选项（适用时包括 `Other (specify)`）

本文件定义特定领域的评估内容。如果存在冲突，请遵循本文件中的领域逻辑。

## 应用

使用 `template.md` 获取完整的填写结构。

此交互式技能会提出**最多 4 个自适应问题**，并在每个步骤提供**结合上下文的枚举选项**。代理会根据之前的回答调整问题。

---

### 第 0 步：收集上下文（提问前）

**代理建议：**

在开始之前，最好先了解产品背景。如果可以，请分享：

**对于您自己的产品：**
- 网站文案（首页、产品页面、价值主张陈述）
- 营销邮件或落地页
- 产品描述或定位陈述
- 案例研究或客户证言
- 销售演示文稿或推介材料

**如果您还没有产品：**
- 找到一个类似或相邻领域的产品（竞争对手或类比产品）
- 复制其网站首页、产品描述或落地页内容
- 我们会将其作为市场规模估算的参考点

**您可以直接粘贴这些内容，也可以提供简要描述后继续。**

**这为何有帮助：**
- 营销材料中已经包含目标受众、痛点和价值主张
- 分析真实内容（您自己的或竞争对手的）可使分析立足于现实
- 您可以与类似产品的市场定位进行基准比较

---

### 可选辅助脚本（确定性计算）

如果您已经有人口和 ARPU 数据（或 TAM 估算值），可以运行确定性辅助脚本来计算 TAM/SAM/SOM 并生成 Markdown 表格。此脚本**不会**获取数据或写入文件。

```bash
python3 scripts/market-sizing.py --population 5400000 --arpu 1000 --sam-share 30% --som-share 10%
```

---

### 问题 1：问题领域

**代理提问：**
“根据您已经提供（或将要描述）的上下文，您希望针对哪个问题领域进行市场规模估算？”

**提供 4 个编号示例（用户可以按编号选择或自行填写）：**

1. **B2B SaaS 生产力工具** — 例如，“面向小型企业运营的工作流自动化”（如 Zapier、Integromat）
2. **消费者金融科技** — 例如，“面向 Z 世代用户的个人预算应用”（如 Mint、YNAB）
3. **医疗保健/远程医疗** — 例如，“面向远程工作者的心理健康支持”（如 BetterHelp、Talkspace）
4. **电子商务赋能** — 例如，“面向在线卖家的支付处理服务”（如 Stripe、Square）

**或者，根据您分享的营销材料自行描述问题领域。**

**提示：** 如果你提供了网站文案或营销材料，智能体可以从以下短语中提取问题空间：
- “我们帮助[目标群体]解决[问题]”
- “[使用场景]的第一解决方案”
- 客户评价或案例研究中的客户痛点

**用户回答：** [选择或自定义描述]

---

### 问题 2：地理区域

**智能体询问：**
“你的目标地理区域是什么？”

**提供 4 个编号选项（根据问题空间进行调整）：**

1. **美国** — 最适合获取详细的美国人口普查局数据、美国劳工统计局统计数据以及全面的行业报告
2. **欧盟** — 使用欧盟统计局和当地统计机构的数据；注意 GDPR/合规性方面的考量
3. **全球** — 使用世界银行、国际货币基金组织的数据；覆盖范围更广，但粒度较低
4. **特定国家/地区** — 例如“加拿大”“东南亚”“拉丁美洲”

**或者指定你自己的区域。**

**用户回答：** [选择或自定义内容]

**调整逻辑：**
- 如果用户选择了 B2B SaaS（问题 1，选项 1）→ 强调美国/欧盟市场（SaaS 应用较为成熟）
- 如果用户选择了消费金融科技（问题 1，选项 2）→ 提及新兴市场（移动设备采用率较高）

---

### 问题 3：行业/细分市场

**智能体询问：**
“这个问题空间涉及哪些具体行业或细分市场？”

**提供 4 个编号选项（根据问题空间和地理区域进行调整）：**

**示例（如果问题 1 = B2B SaaS，问题 2 = 美国）：**
1. **中小企业服务业** — 540 万家企业，营收 1.2 万亿美元（美国人口普查局，2023 年）
2. **专业服务（法律、会计）** — 110 万家公司，营收 8500 亿美元（IBISWorld，2023 年）
3. **医疗服务提供者** — 90 万家诊所，行业规模 4 万亿美元（美国劳工统计局，2023 年）
4. **科技/软件公司** — 50 万家公司，营收 1.8 万亿美元（Statista，2023 年）

**或者描述你自己的细分行业。**

**用户回答：** [选择或自定义内容]

**调整逻辑：**
- 如果问题 1 = 消费金融科技，则提供消费者细分群体（例如“18-25 岁的 Z 世代”“25-40 岁的千禧一代”）
- 如果问题 1 = 医疗保健，则提供细分群体（例如“初级保健医生”“治疗师/咨询师”）

---

### 问题 4：潜在客户（人口统计特征/企业特征）

**智能体询问：**
“哪些潜在客户受到这个问题的影响？”

**提供 4 个编号选项（根据之前的回答进行调整）：**

**示例（如果问题 1 = B2B SaaS，问题 3 = 中小企业服务业）：**
1. **拥有 10-50 名员工的中小企业** — 120 万家企业，营收 4000 亿美元（美国人口普查局，2023 年）
2. **拥有 50-250 名员工的中小企业** — 60 万家企业，营收 8000 亿美元（美国人口普查局，2023 年）
3. **个体创业者/自由职业者** — 350 万名自雇人士，营收 2000 亿美元（美国劳工统计局，2023 年）
4. **拥有线上业务的服务型企业** — 200 万家企业，电子商务规模 6000 亿美元（Statista，2023 年）

**或者描述你自己的客户群体（企业特征、人口统计特征、收入等）。**

**用户回答：** [选择或自定义内容]

---

### 输出：生成 TAM/SAM/SOM 分析

收集完回答后，智能体会生成结构化分析：

```markdown
# TAM/SAM/SOM Analysis

**Problem Space:** [User's input from Question 1]
**Geographic Region:** [User's input from Question 2]
**Industry/Market Segments:** [User's input from Question 3]
**Potential Customers:** [User's input from Question 4]

---

## Total Addressable Market (TAM)

**Definition:** The total market demand if you captured 100% of potential customers in the problem space.

**Population Estimate:** [Calculated from data sources]
- **Source:** [Citation, e.g., "US Census Bureau, 2023"]
- **Calculation:** [Show math, e.g., "5.4M SMBs × $1.2T revenue = $1.2T TAM"]

**Market Size Estimate:** $[X] billion/million
- **Source:** [Industry report citation]
- **URL:** [Clickable link to source]

---

## Serviceable Available Market (SAM)

**Definition:** The segment of TAM you can realistically target with your product (narrowed by geography, firmographics, product fit).

**Segment of TAM:** [User's narrowed segment from Question 4]

**Population Estimate:** [Calculated]
- **Source:** [Citation]
- **Calculation:** [Show math, e.g., "1.2M SMBs with 10-50 employees"]

**Market Size Estimate:** $[X] billion/million
- **Source:** [Citation]
- **URL:** [Link]

**Assumptions:**
- [List key assumptions, e.g., "Assumes 50% of SMBs have budget for automation tools"]

---

## Serviceable Obtainable Market (SOM)

**Definition:** The portion of SAM you can realistically capture in the next 1-3 years, accounting for competition and market constraints.

**Realistically Capturable Market:** [Agent's estimation based on market maturity, competition]

**Population Estimate:** [Calculated]
- **Source:** [Citation]
- **Calculation:** [Show math, e.g., "1.2M SMBs × 5% market share (Year 1) = 60K customers"]

**Market Size Estimate:** $[X] million
- **Assumptions:**
  - [Competition assumption, e.g., "5 major competitors, market leader has 15% share"]
  - [GTM assumption, e.g., "Sales capacity: 50 customers/month in Year 1"]
  - [Conversion assumption, e.g., "10% trial-to-paid conversion"]

**Year 1-3 Projections:**
- **Year 1:** [X]K customers, $[X]M revenue (5% of SAM)
- **Year 2:** [X]K customers, $[X]M revenue (10% of SAM)
- **Year 3:** [X]K customers, $[X]M revenue (15% of SAM)

---

## Data Sources & Citations

- [Source 1: e.g., "US Census Bureau (2023). County Business Patterns. URL: census.gov"]
- [Source 2: e.g., "IBISWorld (2023). Professional Services Industry Report. URL: ibisworld.com"]
- [Source 3: e.g., "Statista (2023). SMB Software Market Size. URL: statista.com"]
- [Add all sources used]

---

## Validation Questions

1. **Does TAM align with industry reports?** [Compare to 3rd-party market research]
2. **Is SAM realistically serviceable?** [Can your GTM motion reach this segment?]
3. **Is SOM achievable given competition?** [Is 5-15% market share realistic in 3 years?]

---

## Next Steps

1. **Validate with customer interviews:** Does the problem resonate with target segment?
2. **Benchmark against competitors:** What market share do incumbents have?
3. **Refine SOM based on GTM capacity:** Can sales/marketing support this growth?
4. **Update annually:** Markets shift—reassess TAM/SAM/SOM yearly

---

**Would you like to refine any assumptions or explore a different segment?**
```

---

## 示例

完整的 TAM/SAM/SOM 分析示例请参阅 `examples/sample.md`。

简短示例摘录：

```markdown
**TAM:** 5.4M SMBs × $2,000 ARPA = $10.8B
**SAM:** 1.2M SMBs × $2,000 ARPA = $2.4B
**SOM:** 5% of SAM = $120M
```

## 常见陷阱

### 陷阱 1：TAM 缺少引用来源
**症状：**“市场规模为 500 亿美元”（无来源）

**后果：**无法向投资者或高管证明该数字的合理性。

**修正：**引用行业报告（Gartner、IBISWorld、Statista）并附上 URL。

---

### 陷阱 2：SOM 等于 SAM
**症状：**“SAM 为 50 亿美元，SOM 为 50 亿美元”（假设占据 100% 的市场）

**后果：**预测不切实际——没有哪个市场是零竞争的。

**修正：**在第 1 至第 3 年，SOM 应为 SAM 的 1%–20%，并将竞争因素考虑在内。

---

### 陷阱 3：缺少总体数量估算
**症状：**只有金额，没有客户数量

**后果：**在不知道客户规模的情况下，无法制定销售/营销计划。

**修正：**始终包含总体数量（例如，“120 万家企业”或“第 1 年 6 万名客户”）。

---

### 陷阱 4：假设一成不变
**症状：**TAM/SAM/SOM 只计算一次，之后从不更新

**后果：**随着市场变化，数据会变得陈旧。

**修正：**每年重新评估。市场会增长或萎缩，竞争格局会发生变化，也会出现新的数据。

---

### 陷阱 5：忽略 GTM 约束
**症状：**“第 1 年的 SOM 是 SAM 的 50%”（但没有销售团队）

**后果：**考虑到 GTM 能力，这样的 SOM 并不现实。

**修正：**根据 GTM 约束（销售能力、营销预算、转化率）确定 SOM。

---

## 参考资料

### 相关 Skill
- `skills/positioning-statement/SKILL.md` — TAM/SAM/SOM 可用于确定“For [target]”细分市场的规模
- `skills/problem-statement/SKILL.md` — 问题空间定义市场
- `skills/recommendation-canvas/SKILL.md` — 市场规模估算为业务成果预测提供依据

### 可选辅助工具
- `skills/tam-sam-som-calculator/scripts/market-sizing.py` — 确定性的 TAM/SAM/SOM 计算器（无需网络访问）

### 外部框架
- Steve Blank，*The Four Steps to the Epiphany*（2005）— 面向初创企业的市场规模估算
- 精益创业方法论 — 通过实验验证市场规模，而非仅依赖案头研究

### 数据来源（用于引用）
- **美国：**美国人口普查局、美国劳工统计局、IBISWorld、Statista
- **欧洲：**Eurostat、当地统计机构
- **全球：**世界银行、IMF、Gartner、Forrester

### Dean 的工作
- TAM/SAM/SOM 提示词生成器（多轮自适应市场规模估算）

---

**Skill 类型：**交互式
**建议的文件名：**`tam-sam-som-calculator.md`
**建议的放置位置：**`/skills/interactive/`
**依赖项：**无（独立的交互式 Skill）