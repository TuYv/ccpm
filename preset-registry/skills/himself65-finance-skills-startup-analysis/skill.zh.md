---
name: startup-analysis
description: >
  Analyze a startup from three perspectives: VC investor, job applicant, and CEO/founder.
  Use this skill whenever the user wants to evaluate a startup, assess whether to invest in
  or join a startup, do due diligence, evaluate a job offer from a startup, understand
  a startup's competitive position, or assess company health and trajectory.
  Triggers: "analyze this startup", "should I join [company]", "is [company] a good investment",
  "evaluate [company]", "due diligence on [company]", "what do you think of [startup]",
  "should I take this startup job offer", "how healthy is [company]", "startup assessment",
  "company analysis", "is [company] worth joining", "what's the outlook for [company]",
  "research [company] for me", any mention of evaluating or assessing a startup or tech company
  from investment, career, or strategic perspectives — provide all three perspectives by default.
---
# 初创公司分析

从多个视角分析一家初创公司，通过三个不同的视角揭示公司健康状况和潜力的不同方面：

1. **风险投资人视角** — 这是一项好的投资吗？市场规模、单位经济效益、增长轨迹、团队素质、防御能力
2. **求职者视角** — 我应该去这里工作吗？股权价值、资金续航风险、文化信号、职业发展、薪酬公平性
3. **CEO/创始人视角** — 这家公司健康状况如何？产品与市场契合度、资金消耗效率、竞争护城河、组织健康度

每个视角都会揭示其他视角可能忽略的洞见。一家公司可能是一项很好的投资，但却是一个很糟糕的工作场所（反之亦然）。目标是为用户提供 360 度的全方位视图，以便他们做出明智的决策。

---

## 第 1 步：收集信息

在分析之前，尽可能多地收集关于该初创公司的公开信息。使用网络搜索、公司网站、Crunchbase 数据、媒体报道以及任何其他可用来源。

**需要收集的关键数据：**

| 类别 | 需要查找的信息 |
|----------|-------------|
| **基本信息** | 成立年份、总部所在地、员工人数、产品用途 |
| **融资** | 融资总额、最近一轮融资（金额、日期、估值，如已知）、主要投资者 |
| **产品** | 销售什么、购买者是谁、定价模式、主要竞争对手 |
| **业务进展** | 用户数、收入（如公开）、增长信号、知名客户 |
| **团队** | 创始人背景、关键岗位招聘、LinkedIn 员工人数趋势 |
| **市场** | 所属行业、市场规模估算、利好因素/不利因素 |
| **新闻** | 近期媒体报道、产品发布、合作伙伴关系、裁员、业务转型 |

如果某些数据并未公开（例如私营公司的收入），请注明这一信息缺口，并根据间接信号（招聘速度、客户标识、网站流量代理指标、招聘信息）进行合理推断。

### 当信息不足时

许多初创公司——尤其是早期或小众公司——公开信息有限。如果网络搜索没有返回足够的信息，无法进行有意义的分析（例如，无法确定公司从事什么业务、由谁创立或融资情况如何），**请先要求用户提供公司网站 URL**，然后再继续。公司网站通常是信息密度最高的单一来源，直接阅读其内容（关于页面、定价页面、团队页面、博客）可以填补大部分信息缺口。

你也可以要求用户提供：
- 公司网站或落地页 URL
- Crunchbase、LinkedIn 或 PitchBook 链接
- 他们掌握的任何融资演示文稿、招聘信息或新闻报道
- 他们已知的具体背景信息（例如，"they just raised a Series A from Sequoia"）

与其凭空猜测并得出误导性分析，不如要求用户提供 URL，以便进行准确分析。

---

## 第 2 步：确定要涵盖的视角

默认情况下，提供全部三个视角。如果用户指定了某个特定角度（例如，"I'm considering joining them" 或 "should I invest"），请重点强调该视角，但仍应将其他视角作为背景信息纳入其中——它们通常会揭示相关信息。

| 用户的情况 | 主要视角 | 还需包含 |
|-----------------|-------------------|---------------|
| 考虑投资 | 风险投资人 | 求职者（人才吸引力信号）、CEO（运营健康状况） |
| 考虑接受工作机会 | 求职者 | 风险投资人（资金可维持时间）、CEO（战略方向） |
| 经营公司／担任顾问 | CEO／创始人 | 风险投资人（投资者如何看待你）、求职者（对人才的吸引力） |
| 一般性好奇／研究 | 所有视角同等重要 | — |

---

## 第 3 步：从各个视角进行分析

阅读各视角对应的参考文件，了解详细的分析框架。这些文件包含需要评估的具体标准、指标以及危险／积极信号。

### 风险投资人分析

阅读 `references/vc-framework.md`，了解完整的评估框架。

需要评估的核心领域：
- **市场机会** — TAM/SAM/SOM、市场时机、长期趋势
- **产品与发展势头** — 产品市场契合度信号、增长指标、留存率
- **单位经济效益** — CAC、LTV、利润率、烧钱倍数、盈利路径
- **团队** — 创始人与市场的契合度、技术深度、招聘能力
- **防御能力** — 护城河（网络效应、转换成本、数据、品牌、监管壁垒）
- **交易条款背景** — 与发展阶段相符的估值、可比退出案例

给出明确的**投资论点**（看多情景）和**关键风险**（看空情景）。最后给出结论：强烈放弃／倾向放弃／倾向投资／强烈投资，并说明理由。

### 求职者分析

阅读 `references/job-applicant-framework.md`，了解完整的评估框架。

需要评估的核心领域：
- **财务稳定性** — 资金可维持时间、烧钱速度、融资趋势、收入健康状况
- **股权价值** — 期权／股权方案分析、稀释风险、清算优先权、现实可行的退出情景
- **职业发展** — 岗位职责范围、学习机会、简历价值、导师指导
- **文化与工作生活平衡** — Glassdoor 信号、员工任职时长数据、领导风格
- **产品与市场风险** — PMF 是否真实？如果这家初创公司失败，会发生什么？
- **危险信号** — 高人员流动率、频繁转型、指标含糊不清、创始人套现

给出明确的**加入理由**（优势）和**需要警惕之处**（风险）。最后给出结论：强烈拒绝／倾向拒绝／倾向加入／强烈加入，并说明理由。

### CEO／创始人分析

阅读 `references/ceo-framework.md`，了解完整的评估框架。

需要评估的核心领域：
- **产品市场契合度** — 留存曲线、自然增长、Sean Ellis 测试的替代指标
- **增长效率** — 烧钱倍数、CAC 回收期、魔力数字
- **竞争地位** — 护城河强度、竞争动态、市场份额变化趋势
- **组织健康状况** — 招聘渠道、人员流失、团队能力缺口
- **融资准备度** — 与下一轮融资基准相比的指标、面向投资者的叙事
- **战略风险** — 平台依赖、客户集中度、监管风险敞口

给出明确的**应加倍投入的优势**和**亟待解决的领域**。最后给出健康状况评级：危急／艰难／稳定／强健／卓越，并说明理由。

---

## 第 4 步：综合跨视角洞察

完成三项分析后，添加一个综合部分，重点说明：

1. **各视角的一致之处** — 如果三个视角都指出了同一个优势或弱点，那它很可能确实存在
2. **各视角的分歧之处** — 一家公司可能对风险投资机构很有吸引力（市场巨大），但对员工而言风险较高（烧钱速度快、现金跑道短）。应明确指出这些情况。
3. **最终结论** — 用一段话总结：这是一家什么样的公司、它最可能的发展轨迹是什么，以及根据用户明示（或暗示）的情况，用户应该怎么做

---

## 第 5 步：呈现报告

将输出组织成一份简洁、易于浏览的报告：

```
# [Company Name] — Startup Analysis

## Summary
[2-3 sentence overview with key verdict]

## VC Investor Perspective
### Market Opportunity
### Product & Traction
### Unit Economics (if available)
### Team
### Defensibility
### Investment Verdict: [Strong Pass / Lean Pass / Lean Invest / Strong Invest]
[Reasoning]

## Job Applicant Perspective
### Financial Stability
### Equity Value Assessment
### Career Growth Potential
### Culture & Work-Life Signals
### Risk Factors
### Employment Verdict: [Strong Pass / Lean Pass / Lean Join / Strong Join]
[Reasoning]

## CEO/Founder Perspective
### Product-Market Fit Assessment
### Growth Efficiency
### Competitive Position
### Organizational Health
### Strategic Risks
### Health Grade: [Critical / Struggling / Stable / Strong / Exceptional]
[Reasoning]

## Cross-Perspective Synthesis
### Points of Agreement
### Points of Divergence
### Bottom Line
```

根据可用数据调整各部分的详略程度——如果财务信息完全不透明，应如实说明，并将重点放在可观察的信息上。不要编造指标，但要进行有依据的推断，并说明置信度。

---

## 参考文件

- `references/vc-framework.md` — 风险投资尽职调查清单，包含指标、基准以及正面/负面信号
- `references/job-applicant-framework.md` — 求职者评估框架，包含股权分析和文化评估
- `references/ceo-framework.md` — CEO 自我评估框架，包含运营指标和战略分析

需要了解各视角的详细标准和基准时，请阅读这些文件。