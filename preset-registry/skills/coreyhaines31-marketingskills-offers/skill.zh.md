---
name: offers
description: "When the user wants to design, construct, or improve an offer — the thing they actually sell — including value framing, bonus stacking, guarantee design, scarcity/urgency, naming, and payment structure. Also use when the user mentions 'offer,' 'offer design,' 'build an offer,' 'grand slam offer,' 'irresistible offer,' 'value stack,' 'bonus stack,' 'guarantee,' 'risk reversal,' 'money-back guarantee,' 'scarcity,' 'urgency,' 'high-ticket offer,' 'productize a service,' 'naming an offer,' 'payment plan,' 'down-sell,' 'upsell offer,' or 'why isn't my offer converting.' Best for services, agencies, courses, coaching, info products, high-ticket B2B, and direct-response. If you run pure self-serve SaaS, read pricing first — tiers and packaging do more work there. For price level itself (tiers, freemium, value metric), see pricing. For the page that presents the offer, see copywriting. For the launch moment, see launch. For sales collateral, see sales-enablement."
metadata:
  version: 1.0.0
---
# 产品设计

你是产品方案构建方面的专家。你的目标是帮助用户打造真正卖得动的产品方案——不是在一个更差的产品方案上撰写更好的文案，而是改进产品方案本身。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或旧版配置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读它。使用其中的上下文，只询问尚未涵盖或此任务特有的信息。

---

## 核心理念

**产品方案才是关键，而不是页面。** 为薄弱的产品方案改进文案，只能缓慢地产生复利效应。更强的产品方案即使搭配普通文案，也能立即提升转化。大多数“我们需要更好的文案”请求，实际上都是经过伪装的“我们需要更好的产品方案”请求。

此技能之所以存在，是因为代码库的其他部分处理的是产品方案的*表达*——`copywriting` 撰写销售页面，`cro` 优化转化路径，`pricing` 设定套餐层级结构，`launch` 统筹发布时机，`paywalls` 设计升级提示。它们都没有追问一个更深层的问题：**这一切背后的产品方案本身真的好吗？**

### 此技能适用的场景

你销售的是：
- **服务**——咨询、自由职业服务、代理商长期服务、产品化服务
- **课程**——异步课程、同期群课程、直播课程
- **辅导**——1 对 1 辅导、小组辅导、智囊团
- **信息产品**——指南、素材参考库、模板、社群
- **高客单价 B2B**——年合同价值超过 $5K，且需要销售沟通
- **直接响应型产品**——电商促销产品、电视购物式产品、付费流量导向 VSL

### `pricing` 更能发挥作用的场景

你销售的是：
- **分层订阅的自助式 SaaS**——主要杠杆是套餐层级结构、价值衡量指标和产品打包；产品方案构建（赠品、保证）处于次要地位
- **市场平台**——产品方案是结构性的，而非构建出来的

在这些情况下，可快速浏览此技能以了解价值方程框架，然后转到 `pricing`。

---

## 价值方程

这是产品方案设计中最实用的一个框架。最初源自 Alex Hormozi 的 *$100M Offers*——此后被直接响应营销和创作者经济培训领域广泛吸收。

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
  Value  =  ─────────────────────────────────────────────────────────
              Time Delay     ×   Effort & Sacrifice
```

你可以这样调整这四个杠杆：

| 杠杆 | 含义 | 如何提升价值 |
|-------|---------------|-----------------------|
| **梦想结果** ↑ | 客户真正想要什么 | 将表层诉求与其背后的更大目标联系起来。明确描述并为其命名。 |
| **感知实现概率** ↑ | 他们是否相信自己能获得结果 | 证明（案例研究、具名客户、数据）、保证、方法论的具体性 |
| **时间延迟** ↓ | 需要多长时间才能获得结果 | 更快完成引导、更快取得首次成果、更短的端到端周期 |
| **努力与牺牲** ↓ | 除金钱外，他们还需要付出多少时间、工作量或承担多少风险 | 代办服务、更简单的流程、更少的决策、更低的学习门槛 |

**对报价构建的启示**：大多数“降低价格”的请求，实际上是在要求“提高分子或降低分母”。价格是比较的结果，而不是价值本身。

**有关完整框架、示例，以及如何诊断哪个杠杆存在问题：**请参阅 [references/value-equation.md](references/value-equation.md)

---

## 完整报价的构成

一份完整的报价包含六个组成部分。缺少任何一个，转化率都会受到影响。

| # | 组成部分 | 它回答的问题 |
|---|-----------|---------------------|
| 1 | **核心交付物** | 他们会得到什么？ |
| 2 | **赠品组合** | 他们还会得到什么，从而让核心交付物显得物超所值？ |
| 3 | **保证** | 如果没有效果，会怎样？ |
| 4 | **稀缺性 / 紧迫性** | 为什么是现在，而不是以后？ |
| 5 | **名称** | 这个东西叫什么？ |
| 6 | **价格 + 付款结构** | 他们要支付多少，以及如何支付？ |

大多数薄弱的报价都败在赠品（没有赠品）、保证（没有保证或保证类型错误）或稀缺性（没有稀缺性，或稀缺性是虚假的）上。大多数咄咄逼人到令人尴尬的报价，则败在保证（过度承诺）或稀缺性（虚假倒计时）上。

**有关完整构成及详细示例：**请参阅 [references/offer-anatomy.md](references/offer-anatomy.md)

---

## 参考资料库

| 参考资料 | 何时阅读 |
|-----------|--------------|
| [value-equation.md](references/value-equation.md) | 诊断停滞不前的报价中哪个杠杆存在问题 |
| [offer-anatomy.md](references/offer-anatomy.md) | 从头构建一份完整的报价 |
| [guarantee-design.md](references/guarantee-design.md) | 为你的商业模式选择正确的保证类型 |
| [bonus-stacking.md](references/bonus-stacking.md) | 添加既能提高感知价值、又不会贬低核心交付物的赠品 |
| [scarcity-urgency.md](references/scarcity-urgency.md) | 创造*真实的*稀缺性（并避免那些会摧毁信任的虚假套路） |
| [offer-formats.md](references/offer-formats.md) | 按业务类型划分的格式行动手册——服务、课程、辅导、信息产品、SaaS 潜在客户磁铁、代理机构长期服务合约、高客单价 B2B |
| [examples.md](references/examples.md) | 匿名化的详细示例——每种业务类型的优化前后对比 |

---

## 诊断循环

当用户说“我的报价无法促成转化”或“我想改进我的报价”时：

1. **识别业务类型**——服务、课程、辅导、信息产品、SaaS、代理机构、B2B。正确的行动手册因类型而异。
2. **用直白的语言说明当前报价**——名称、价格、他们会得到什么、保证、截止日期。即使这些信息目前散落在不同地方，也要把它们写下来。
3. **运行价值方程**——给四个杠杆分别打 1–10 分。得分最低的就是约束瓶颈。
4. **审查报价构成**——六个组成部分中，哪一个缺失或薄弱？
5. **在本轮迭代中选择一个杠杆进行修复**——不要重做所有内容。最值得调整的杠杆通常是当前得分最低的那个。
6. **起草修改后的组成部分**——新赠品、新保证、新稀缺性、新名称、新付款方案
7. **如实预估提升幅度**——大多数单一组成部分的调整可带来 10–40% 的转化率提升。任何承诺提升 5 倍的人，都是在推销某种东西。针对不同杠杆连续进行两轮迭代，效果叠加后可达到 2–3 倍。

---

## 何时不应使用报价设计策略

有些报价模式虽然有效，但代价远超其价值：

- **操纵性的稀缺感** — 虚假倒计时、“只剩 3 个名额”之类的谎言。短期内可能提升转化，但长期会让信任彻底崩塌。不要这样做。
- **过度承诺的保证** — “收入翻倍，否则退款并额外赔付 1,000 美元。”退款风险会侵蚀利润；少数失败案例就足以公开摧毁你的声誉。
- **赠品价值膨胀** — 给一款售价 497 美元的产品堆上“价值 5 万美元的赠品”，让它“看起来便宜得不可思议”。成熟的买家看得穿这一套。赠品应当提供额外价值，而不是被夸大。
- **严肃产品却采用卖课网红式审美** — 金色徽标、“秘密方法”、虚假紧迫感。这些特征会让人联想到骗局。完全不合时宜。

本仓库的表达风格：观点鲜明，但诚实。精心设计报价，并不意味着要靠大声叫卖。

---

## 禁用词汇

在起草报价文案（销售页面、电子邮件、标题）时，应避免：

- **“颠覆游戏规则”、“革命性”、“颠覆性”、“更高层次”、“10 倍”** — 容易让人联想到 AI 垃圾内容或卖课网红
- **“秘密”、“不为人知”、“他们不想让你知道的事”** — 标题党
- **没有实际期限却声称“限时”** — 这是撒谎
- **没有可比对象却声称“价值 X 美元”或“Y 美元的价值”** — 价值虚高
- **未明确说明适用条件却声称“100% 保证”** — 在法律和品牌层面都存在风险

使用具体数字、明确的客户名称、切实的成果和真实的时间周期。具体胜过最高级形容词。

---

## 相关技能

- **pricing** — 用于价格水平、层级结构、价值指标、套餐设计和免费增值模式
- **copywriting** — 用于呈现报价的页面
- **cro** — 用于优化报价所经过的转化路径
- **launch** — 用于报价正式发布的时刻
- **paywalls** — 用于在应用内以升级提示形式呈现报价
- **sales-enablement** — 用于将报价带入销售对话的演示文稿和单页资料
- **emails** — 用于为报价预热的电子邮件序列
- **marketing-psychology** — 用于分析让报价被接受或遭拒的认知偏差