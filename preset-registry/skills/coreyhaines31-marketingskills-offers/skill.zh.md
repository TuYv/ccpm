---
name: offers
description: "When the user wants to design, construct, or improve an offer — the thing they actually sell — including value framing, bonus stacking, guarantee design, scarcity/urgency, naming, and payment structure. Also use when the user mentions 'offer,' 'offer design,' 'build an offer,' 'grand slam offer,' 'irresistible offer,' 'value stack,' 'bonus stack,' 'guarantee,' 'risk reversal,' 'money-back guarantee,' 'scarcity,' 'urgency,' 'high-ticket offer,' 'productize a service,' 'naming an offer,' 'payment plan,' 'down-sell,' 'upsell offer,' or 'why isn't my offer converting.' Best for services, agencies, courses, coaching, info products, high-ticket B2B, and direct-response. If you run pure self-serve SaaS, read pricing first — tiers and packaging do more work there. For price level itself (tiers, freemium, value metric), see pricing. For the page that presents the offer, see copywriting. For the launch moment, see launch. For sales collateral, see sales-enablement."
metadata:
  version: 1.0.1
---
# 报价设计

你是报价构建方面的专家。你的目标是帮助用户打造真正卖得动的报价——不是通过为一个糟糕的报价撰写更好的文案，而是通过改进报价本身。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中使用的旧文件名 `product-marketing-context.md`），请在提问之前先阅读它。使用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

---

## 核心理念

**关键在于报价本身，而不是页面。** 在薄弱的报价上优化文案，只能缓慢积累效果。更强的报价即使搭配普通文案，也能立即提升转化。大多数“我们需要更好的文案”请求，实际上都是经过伪装的“我们需要更好的报价”请求。

此技能之所以存在，是因为代码库中的其他部分处理的是报价的*表达方式*——`copywriting` 负责撰写销售页面，`cro` 负责优化转化路径，`pricing` 负责设定定价层级结构，`launch` 负责统筹发布时机，`paywalls` 负责设计升级提示。它们都没有追问更深层的问题：**支撑这一切的底层报价本身真的足够好吗？**

### 此技能适用的场景

你销售的是：
- **服务**——咨询、自由职业服务、代理商长期服务、产品化服务
- **课程**——异步课程、同期班课程、直播课程
- **辅导**——1 对 1 辅导、团体辅导、高阶私董会
- **信息产品**——指南、参考素材库、模板、社群
- **高客单价 B2B**——年度合同价值超过 $5K，且需要销售沟通
- **直接响应式产品**——电商促销报价、电视购物式销售、付费流量导向 VSL

### `pricing` 更适合发挥作用的场景

你销售的是：
- **采用分层订阅的自助式 SaaS**——主要杠杆是层级结构、价值指标和套餐设计；报价构建（赠品、保证）处于次要地位
- **交易平台**——报价是结构性的，而非人为构建的

在这些情况下，可以快速浏览此技能以了解价值方程框架，然后转到 `pricing`。

---

## 价值方程

这是报价设计中最有用的框架。最初源自 Alex Hormozi 的 *$100M Offers*——此后已被直接响应营销和创作者经济培训领域广泛吸收。

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
  Value  =  ─────────────────────────────────────────────────────────
              Time Delay     ×   Effort & Sacrifice
```

你可以通过以下方式调节这四个杠杆：

| 杠杆 | 含义 | 如何提高价值 |
|-------|---------------|-----------------------|
| **理想结果** ↑ | 客户真正想要什么 | 将表层诉求与其背后更宏大的目标联系起来。明确描述并为其命名。 |
| **感知成功概率** ↑ | 他们是否相信自己能获得结果 | 证明（案例研究、具名客户、数据）、保证、方法论的具体程度 |
| **时间延迟** ↓ | 需要多久才能获得结果 | 更快完成上手、更快取得初步成果、更快完成端到端流程 |
| **努力与牺牲** ↓ | 除了金钱之外，他们还需要付出多少时间、工作和风险 | 代办服务、更简单的流程、更少的决策、更低的学习门槛 |

**对构建报价方案的启示**：大多数“降低价格”的请求，实际上是在要求“增大分子或减小分母”。价格是比较的结果，而不是价值本身。

**有关完整框架、示例以及如何诊断哪个杠杆存在问题：**请参阅 [references/value-equation.md](references/value-equation.md)

---

## 完整报价方案的构成

一个完整的报价方案包含六个组成部分。缺少任何一个都会影响转化率。

| # | 组成部分 | 它回答的问题 |
|---|-----------|---------------------|
| 1 | **核心交付物** | 他们会得到什么？ |
| 2 | **赠品组合** | 他们还能得到什么，从而让核心交付物显得物超所值？ |
| 3 | **保证** | 如果没有效果，会怎样？ |
| 4 | **稀缺性 / 紧迫性** | 为什么要现在行动，而不是以后？ |
| 5 | **名称** | 这个东西叫什么？ |
| 6 | **价格 + 付款结构** | 他们要支付多少，以及如何支付？ |

大多数薄弱的报价方案都败在赠品（没有）、保证（没有或类型错误）或稀缺性（没有或虚假）上。大多数激进到令人尴尬的报价方案都败在保证（过度承诺）或稀缺性（虚假倒计时）上。

**有关完整构成及详尽示例：**请参阅 [references/offer-anatomy.md](references/offer-anatomy.md)

---

## 参考资料库

| 参考资料 | 何时阅读 |
|-----------|--------------|
| [value-equation.md](references/value-equation.md) | 诊断一个陷入停滞的报价方案中哪个杠杆存在问题 |
| [offer-anatomy.md](references/offer-anatomy.md) | 从零开始构建完整的报价方案 |
| [guarantee-design.md](references/guarantee-design.md) | 为你的商业模式选择正确的保证类型 |
| [bonus-stacking.md](references/bonus-stacking.md) | 添加能够提高感知价值、又不会贬低核心交付物的赠品 |
| [scarcity-urgency.md](references/scarcity-urgency.md) | 营造*真实的*稀缺性（并避免那些会摧毁信任的虚假套路） |
| [offer-formats.md](references/offer-formats.md) | 按业务类型划分的方案手册——服务、课程、辅导、信息产品、SaaS 潜在客户磁铁、代理机构长期服务、高客单价 B2B |
| [saas-offers.md](references/saas-offers.md) | 专门针对 SaaS——折扣陷阱（为什么通过打折获客会适得其反）+ 四个详尽的 SaaS 报价方案示例（AudienceTap、SaberSim、Teachable、Kit） |
| [examples.md](references/examples.md) | 匿名化的详尽示例——每种业务类型的优化前后对比 |

---

## 诊断循环

当用户说“我的报价方案没有带来转化”或“我想改进我的报价方案”时：

1. **确定业务类型**——服务、课程、辅导、信息产品、SaaS、代理机构、B2B。正确的方案手册取决于具体类型。
2. **用通俗语言陈述当前的报价方案**——名称、价格、他们会得到什么、保证、截止期限。即使这些信息目前散落在不同地方，也要把它写下来。
3. **运行价值方程**——为四个杠杆分别打 1–10 分。得分最低的就是关键约束。
4. **审查报价方案的构成**——六个组成部分中，哪个缺失或薄弱？
5. **选择一个杠杆在本轮中修复**——不要重构所有内容。影响最大的杠杆通常就是当前得分最低的那个。
6. **起草修改后的组成部分**——新赠品、新保证、新稀缺性、新名称、新付款计划
7. **如实预测提升幅度**——大多数单一组成部分的调整能带来 10–40% 的转化率提升。任何承诺提升 5 倍的人都是在推销东西。针对不同杠杆连续迭代两次，效果可以叠加到 2–3 倍。

---

## 何时不应使用报价设计策略

有些报价模式虽然有效，但代价大于收益：

- **操纵性稀缺** — 虚假倒计时器、谎称“只剩 3 个名额”。短期内可能提升转化，长期却会导致信任崩塌。不要这样做。
- **过度承诺的保证** — “收入翻倍，否则退款并额外赔付 1,000 美元。”退款风险会侵蚀利润；少数失败案例一旦公开，就会彻底摧毁你的声誉。
- **赠品价值膨胀** — 给一个售价 497 美元的产品堆上“价值 5 万美元的赠品”，让它“看起来像捡了大便宜”。成熟的买家看得穿这一套。应把赠品视为额外价值，而不是夸大的噱头。
- **严肃产品采用卖课网红风格** — 金色徽标、“秘密方法”、虚假紧迫感。这些特征会让人联想到骗局。用错场合了。
- **靠打折获客** — 讨价还价的客户流失率约为全价客户的 2 倍，而且优惠券会让用户形成产品很廉价的锚定印象。只应针对升级/交叉销售（用来奖励现有客户）或真正的季节性窗口提供折扣——绝不要用打折赢得新客户。应通过报价提升价值。参见 [saas-offers.md](references/saas-offers.md)。

本仓库的表达风格：立场鲜明，但诚实。把报价设计好，并不意味着要把声势造得很大。

---

## 禁用词汇

在起草报价文案（销售页面、电子邮件、标题）时，请避免：

- **“颠覆性”、“革命性”、“破坏式创新”、“更上一层楼”、“10 倍”** — 容易让人联想到 AI 垃圾内容或卖课网红
- **“秘密”、“隐藏的”、“他们不想让你知道的”** — 标题党
- **没有实际期限却声称“限时”** — 这是撒谎
- **没有可比对象却声称“价值 X 美元”或“价值 Y 美元”** — 夸大价值
- **未明确说明适用条件却声称“100% 保证”** — 在法律和品牌层面都有风险

使用明确的数字、具名客户、具体成果和真实时间线。具体胜过最高级形容词。

---

## 相关技能

- **pricing** — 用于价格水平、层级结构、价值指标、打包方式和免费增值模式
- **copywriting** — 用于呈现报价的页面
- **cro** — 用于优化报价所经过的转化路径
- **launch** — 用于正式推出报价的时刻
- **paywalls** — 用于报价在应用内升级提示中的版本
- **sales-enablement** — 用于将报价带入销售对话的演示文稿和单页资料
- **emails** — 用于为报价预热的电子邮件序列
- **marketing-psychology** — 用于理解哪些认知偏差会让报价奏效或碰壁