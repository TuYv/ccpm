---
name: suede-offers
description: "Suede-affiliated offer design for value framing, bonuses, guarantees, risk reversal, honest scarcity, naming, and payment structure. Use when the user is building or diagnosing a service, course, coaching, information-product, agency, or high-ticket B2B offer. NOT FOR: SaaS tier and value-metric architecture (use suede-pricing), sales-page copy (use suede-copy), or in-product upgrade prompts (use suede-paywalls)."
metadata:
  version: 1.0.0
---
# Suede 的报价架构

Suede 将页面下方的报价与用于呈现报价的文案分开。应先改善真实的价值交换——结果、证明、投入、时间、范围、额外福利、保证、价格结构以及诚实的限制条件——再去润色围绕薄弱价值主张的语言。

## 开始之前

**先检查产品营销背景：**
如果存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，又或者在较旧的配置中使用旧版文件名 `product-marketing-context.md`），请在提问前先阅读。使用其中的背景信息，只询问尚未涵盖或与当前任务相关的具体信息。

---

## 核心理念

**报价才是本质，而不是页面。** 在薄弱的报价上不断优化文案，效果会缓慢累积。更强的报价配上普通的文案，也能立即提升转化。大多数“我们需要更好的文案”请求，其实都是伪装成“我们需要更好的报价”的请求。

这项 skill 负责表达之下的报价。将销售页面语言交给 `suede-copy`，将转化路径工作交给 `suede-site-alchemy`，将层级结构交给 `suede-pricing`，将发布统筹交给 `suede-campaign-in-a-box`（创作者和艺术家发布）或 `suede-marketing-plan`（产品和服务发布），将升级提示交给 `suede-paywalls`。

### 这项 skill 适用的场景

你销售的是：
- **服务** — 咨询、自由职业、代理商长期服务、产品化服务
- **课程** — 异步课程、分 cohort 课程、直播课程
- **教练服务** — 1 对 1、小组、大师班
- **信息产品** — 指南、素材库、模板、社群
- **高客单价 B2B** — 通过销售沟通达成、年度合同价值为 $5K+ 的业务
- **直接响应营销** — 电商促销报价、电视购物式营销、从付费流量导向 VSL

### `suede-pricing` 发挥更大作用的场景

你销售的是：
- **自助式 SaaS**，采用分层订阅 — 关键杠杆主要是层级结构、价值指标和产品打包；报价构建（额外福利、保证）属于次要因素
- **市场平台** — 报价是结构性的，而非构建出来的

在这些情况下，可以略读这项 skill，了解价值方程的框架，然后转交给 `suede-pricing`。

---

## 价值方程

Suede 使用一个由四个杠杆组成的价值方程，用于诊断结果、感知到的实现可能性、时间延迟或所需投入是否正在限制报价。

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
  Value  =  ─────────────────────────────────────────────────────────
              Time Delay     ×   Effort & Sacrifice
```

你可以这样调整这四个杠杆：

| 杠杆 | 含义 | 如何提升价值 |
|-------|---------------|-----------------------|
| **理想结果** ↑ | 客户真正想要的东西 | 关联表面需求背后更大的目标。明确并为其命名。 |
| **感知到的实现可能性** ↑ | 他们是否相信自己能获得这一结果 | 证明（案例研究、具名客户、数据）、保证、具体的方法论 |
| **时间延迟** ↓ | 距离产生结果需要多长时间 | 更快的入门、更快获得首次成果、更快完成端到端流程 |
| **投入与牺牲** ↓ | 除了金钱之外，他们需要付出的时间、工作量和风险 | 代为完成、更简单的流程、更少的决策、更低的学习曲线 |

**对报价构建的启示**：大多数“降低价格”的请求，实际上是“提高分子或降低分母”的请求。价格是比较结果，而不是价值。

**关于完整框架、示例，以及如何诊断哪个杠杆出了问题：**请参阅 [references/value-equation.md](references/value-equation.md)

---

## 完整报价的构成

一份完整的报价包含六个组成部分。缺少任何一个，转化率都会受到影响。

| # | 组成部分 | 回答的问题 |
|---|-----------|---------------------|
| 1 | **核心交付内容** | 他们能得到什么？ |
| 2 | **奖励组合** | 他们还能得到什么，从而让核心内容显得物超所值？ |
| 3 | **保障** | 如果不起作用，会发生什么？ |
| 4 | **稀缺性 / 紧迫感** | 为什么是现在，而不是以后？ |
| 5 | **名称** | 这项东西叫什么？ |
| 6 | **价格 + 付款结构** | 他们要支付什么，以及如何支付？ |

大多数薄弱的报价，问题出在奖励（没有）、保障（没有或类型不对）或稀缺性（没有，或者是假的）。大多数激进到令人尴尬的报价，问题出在保障（过度承诺）或稀缺性（虚假的倒计时器）。

**关于完整构成及实际示例：**请参阅 [references/offer-anatomy.md](references/offer-anatomy.md)

---

## 参考资料库

| 参考资料 | 何时阅读 |
|-----------|--------------|
| [value-equation.md](references/value-equation.md) | 诊断停滞不前的报价中哪个杠杆出了问题 |
| [offer-anatomy.md](references/offer-anatomy.md) | 从零开始构建完整报价 |
| [guarantee-design.md](references/guarantee-design.md) | 为你的商业模式选择合适的保障类型 |
| [bonus-stacking.md](references/bonus-stacking.md) | 添加能够提升感知价值、又不会贬低核心内容的奖励 |
| [scarcity-urgency.md](references/scarcity-urgency.md) | 创造*真正的*稀缺性（并避免破坏信任的虚假模式） |
| [offer-formats.md](references/offer-formats.md) | 按业务类型划分的格式指南——服务、课程、辅导、信息产品、SaaS lead magnet、代理商长期服务、高客单价 B2B |
| [examples.md](references/examples.md) | 匿名化的实际示例——每种业务类型的前后对比 |

---

## 诊断循环

当用户说“我的报价没有转化”或“我想改进我的报价”时：

1. **确定业务类型**——服务、课程、辅导、信息产品、SaaS、代理商、B2B。正确的指南取决于具体类型。
2. **用通俗语言说明当前报价**——名称、价格、他们能得到什么、保障、截止日期。即使目前这些信息散落在不同地方，也要把它们写下来。
3. **运行价值方程**——为四个杠杆分别打 1–10 分。最低分就是束缚约束。明确说出最低分的杠杆，并说明该分数背后的具体证据缺口（“感知到的可能性：4 分——没有指名的客户，也没有前后对比数据”）。不要把四项都评为高于 6 分；如果报价看起来确实如此强大，那么评分就不是结论——说清楚当前转化率要成立，必须满足什么条件，然后去获取相应证据。讨好的评分表不会产生束缚约束，也就意味着第 5 步无事可做。
4. **审查构成**——六个组成部分中，哪些缺失或薄弱？
5. **选择一个杠杆在本轮修复**——不要把所有内容都重做。最大的杠杆通常就是当前得分最低的那个。
6. **起草变更后的组成部分**——新的奖励、新的保障、新的稀缺性、新的名称、新的付款方案
7. **诚实地预测提升幅度**——大多数单一组成部分的变更，会带来 10–40% 的转化率提升。任何承诺提升 5 倍的人，都是在销售某种东西。针对不同杠杆连续进行两轮迭代，提升幅度可以叠加到 2–3 倍。

### 输出：Offer Brief

以以下精确结构返回循环结果——无论优惠方案是新建还是修复，标题都必须保持一致：

```markdown
# Offer Brief — [offer name]

## Name
## Core deliverable
## Bonus stack
[Each bonus, and the objection it removes. No invented "$ value" figures.]
## Guarantee + conditions
[Type, the exact conditions, and who eats the cost when it's claimed.]
## Real constraint behind the deadline
[The actual reason now beats later — capacity, cohort start, price change.
 If there is no real constraint, write "none" and drop the deadline.]
## Price + payment structure
## Lever changed this iteration
[Which of the four, its score before, and what evidence moves it.]
## What I did not change and why
```

---

## 不应使用优惠方案设计策略的情况

有些优惠方案模式虽然有效，但代价超过了收益：

- **操纵式稀缺性**——虚假的倒计时、“只剩 3 个名额”等谎言。短期内可能带来提升，长期则会导致信任崩塌。不要这样做。
- **过度承诺的保证**——“收入翻倍，否则退款再加 $1,000。”退款风险会侵蚀利润；少数失败案例还会公开摧毁你的声誉。
- **夸大赠品价值**——在一个 $497 的产品上堆叠价值 $50K 的“赠品”，让它“看起来超值”。成熟买家看得出来。应将赠品视为附加价值，而不是夸大其词。
- **严肃产品采用课程销售式美学**——金色徽标、“秘密方法”、虚假紧迫感。这些元素会让人联想到骗局。场景不对。

Suede 的语气直接、具体且诚实。把优惠方案设计好，并不意味着要把它包装得喧闹夸张。

---

## 禁用词汇

起草优惠方案文案（销售页面、邮件、标题）时，避免使用：

- **“改变游戏规则”“革命性”“颠覆性”“下一阶段”“10 倍”**——容易让人联想到 AI 垃圾文案或课程销售话术
- **“秘密”“隐藏的”“他们不想让你知道的事”**——标题党
- **没有实际时间限制却使用“限时”**——这是撒谎
- **没有可比对象却声称“价值 $X”或“$Y 价值”**——夸大价值
- **没有明确说明条件却声称“100% 保证”**——在法律和品牌层面都存在风险

使用具体数字、明确列出的客户、具体结果和真实时间线。具体性胜过最高级形容词。

---

## 边界

- 不得捏造结果证据、可比价值、稀缺性、截止日期、客户评价、保证方案的经济影响或退款条款。
- 未经明确授权，不得创建支付对象、发布优惠方案、修改定价或作出法律承诺。
- 不得建议强迫式紧迫感、难以使用的取消流程，或对买方隐藏的条件。
- 不得替用户决定利润率、责任、合规性或品牌风险是否可接受。

## 路由

- 使用 `suede-pricing` 处理层级、产品打包和价值指标。
- 使用 `suede-copy` 处理销售页面，使用 `suede-site-alchemy` 处理转化路径。
- 使用 `suede-campaign-in-a-box`（创作者/艺术家）或 `suede-marketing-plan`（产品/服务）来发布优惠方案；仅当交付内容是软件且涉及其安装路径时，才使用 `suede-launch-packaging`。使用 `suede-paywalls` 处理产品内升级提示。
- 使用 `suede-sales-enablement`、`suede-emails` 或 `suede-marketing-psychology` 处理已获批准的执行工作。