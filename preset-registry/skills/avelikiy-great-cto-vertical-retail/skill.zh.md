---
name: vertical-retail
description: Retail & e-commerce domain knowledge for SMB storefront products (storefront, inventory, pricing, cart-recovery). Codifies the vocabulary (SKU vs variant, reorder point, COGS/margin, ATS, AOV), the non-obvious rules (Shopify owns the storefront — don't fight it head-on; the wedge is multichannel inventory + reorder and cart recovery), the must-model entities (Product→Variants matrix, channel-aware InventoryLevel, ReorderRule, PricingRule, AbandonedCart), and what a naive build gets wrong (no variant model, single-channel inventory, reorder without lead-time/safety-stock). Applied by architect/pm during spec authoring so they aren't naive about retail; checked implicitly by pci-reviewer + cms-reviewer.
when_to_use: |
  Apply when architect or pm is speccing a retail / e-commerce product:
  - storefront / inventory / pricing / cart-recovery for an SMB seller
  - any catalog, checkout, stock-tracking, promotion, or abandoned-cart feature
  Do NOT apply to non-commerce verticals, or to heavy payments/tax work (defer those to pci-reviewer / billing).
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 零售与电商——像真正经营过商店的人一样编写规格

中小企业零售买家已经在为 Shopify（每月 $39–399 + 2.9%）、BigCommerce、Wix、Ecwid 或
WooCommerce 付费。他们并不天真——所以规格文档也不能天真。一个“有商品
和购物车”的店面只是基本要求；真正的价值在于那些平台做得不好的部分。在为任何零售业务的 ARCH 或 PLAN 文档编写
目录/库存/定价/购物车章节之前，请先阅读本文。

## 1. 领域术语（请使用以下确切用词）

- **SKU 与变体**——一个**变体**是一种可购买的配置（红色 / 大号）；它的 **SKU** 是
  该变体发货和盘点时所使用的唯一编码。“商品”是其父级；你备货、
  定价和销售的是*变体*，而不是商品。
- **多渠道 / 全渠道**——通过多个渠道销售（自有店面、Amazon、
  eBay、门店 POS、Instagram）。*全渠道*还意味着所有渠道共用同一个库存池。
  渠道感知能力是中小企业库存管理的核心。
- **再订货点**——触发采购订单的库存水平 =（日均需求量 × 以天为单位的**交付
  周期**）+ **安全库存**。**交付周期** = 从向供应商下单到收货所需的天数。
  **安全库存** = 用于应对需求量/交付周期波动的缓冲库存。缺少这三项中任何一项的补货逻辑都是错误的。
- **COGS**（已售商品成本）和**毛利率** =（价格 − COGS）/ 价格。**到岸成本** = 单位
  成本 + 运费 + 关税 + 操作费；毛利率必须使用到岸成本，而不是发票成本。
- **ATS / 可售库存** = 现有库存 − 已分配库存（被未结订单预留）− 安全库存。
  客户购买时依据的是 ATS，绝不能直接依据原始现有库存。
- **延期交货与预售**——延期交货 = 目前缺货，但将会补货（依据在途
  PO 进行销售）。预售 = 尚未发布，设有未来可售日期。两者的履约承诺不同。
- **购物车放弃率** = 1 −（已完成结账数 / 已创建购物车数）；行业平均水平约为 70%。
- **AOV**（平均订单价值）和**转化率** = 订单数 / 会话数。这是
  定价/促销能够影响的两个杠杆。
- **履约**——拣货/打包/发货。**代发货** = 供应商直接发货，卖家从不持有
  库存（因此，“库存”是供应商的 ATS 数据源，而不是你的库存）。
- **MAP**（最低广告价格）——供应商设定的价格下限；定价规则必须遵守
  这一限制，否则卖家将失去该品牌的销售权。

## 2. 不明显的领域规则

- **Shopify 掌控着店面——不要与它正面竞争。** 同质化的结账功能注定会失败。切入点在于
  这些平台的*薄弱环节*：**多渠道库存 + 补货**和**购物车挽回**。
  将店面设计为功能完善且自主拥有，并把差异化放在另外三个方面。
- **变体会呈组合式爆炸增长。** 选项（尺寸 × 颜色 × 材质）相乘：5×8×3 = 每件商品 120 个
  变体。数据模型、UI 和导入流程必须假设每件商品有数百个变体，
  每个变体都有自己的 SKU / 价格 / 库存——而不是简单的扁平商品列表。
- **库存必须具备渠道感知能力。** 同一个 SKU 会在店面 + Amazon + POS 上销售；库存
  必须在所有渠道同步扣减并回传，否则就会超卖。单渠道库存是最常见的
  初级错误，也是最有力的切入点。
- **定价规则会与价格下限相互作用。** 促销或基于需求的规则必须受限于
  **毛利率下限**和 **MAP**。允许价格低于到岸成本毛利率的规则是缺陷，而不是
  折扣。

## 3. 朴素构建方式容易犯的错误

- **没有变体模型的商品** — 使用扁平的 `product { price, stock }` 表。一旦卖家为商品提供两种尺码，
  这种设计就会失效。变体是核心，而不是附加功能。
- **单渠道库存** — 库存仅存在于店面中，无法在 Shopify /
  Amazon / POS 之间同步。对于任何真正的中小企业，这必然会导致超卖。
- **补货不考虑交货周期 / 安全库存** — “当库存 < 10 时补货”会在供应商
  交货期间造成缺货。必须使用再订货点公式。
- **购物车挽回忽略退订抑制 / 同意** — 在未经同意或用户
  退订/购买后发送电子邮件/短信是违法的（CAN-SPAM / TCPA / GDPR），还会损害送达率。遵守
  退订抑制规则和免打扰时段。
- **定价忽略利润率下限** — 促销引擎可能以低于成本或低于 MAP 的价格销售。

## 4. 必须建模的实体

| 实体 | 关键字段 |
|---|---|
| **Product** | id, title, option axes (e.g. Size, Color) — 父实体 |
| **Variant** | product_id, option values (Red/L), **SKU**, price, COGS/landed cost — 每个选项组合对应一个 |
| **InventoryLevel** | variant_id, **channel/location**, on_hand, allocated, safety_stock → 派生 ATS |
| **ReorderRule** | variant_id, reorder_point, reorder_qty, **lead_time_days**, supplier |
| **PricingRule** | scope (variant/collection), trigger (demand/margin/schedule), action, **margin_floor**, **MAP** |
| **AbandonedCart** | cart_id, customer, line items, value, abandoned_at, recovery state, consent/suppression |

Variant 的*选项矩阵*和以渠道为键的 InventoryLevel 是朴素规格中最容易被
合并简化的两个部分——应显式保留它们。

## 5. 各产品说明（切入点 + 一项领域核心要点）

- **storefront**（内容）— 商品目录、结账、主题；卖家*自有*的商店。切入点：自有
  渠道 + SEO（必须能够获得排名——参见 [[local-seo]]）。核心要点：**Product→Variant** 模型
  和清晰、可索引的 URL。不要设计出比 Shopify 结账更复杂的方案；与之持平，然后继续推进。
- **inventory**（增删改查）— 跨渠道跟踪库存，在缺货前自动补货。**这是
  Shopify 服务不足的切入点。**核心要点：**感知渠道的 InventoryLevel + 再订货点
  公式**（交货周期 + 安全库存）。做好这一点，产品本身就有了存在价值。
- **pricing**（仪表板）— 基于规则的定价 + 响应需求/利润率的促销。切入点：
  将中小企业手动执行的利润率感知操作自动化。核心要点：每条规则都必须**限制在利润率下限 +
  MAP 之上**。
- **cart-recovery**（客户关系管理）— 通过定时电子邮件/短信挽回弃购购物车。切入点：挽回
  约 70% 的弃购用户。核心要点：**同意 + 退订抑制 + 时机**——消息发送
  机制交由 [[lifecycle-messaging]] 处理。

## 6. 合规（简述——繁重部分交由其他模块处理）

- **销售税关联** — 美国各州的经济关联门槛有所不同（Wayfair 案之后）；卖家可能
  需要在从未发货到的州缴税。在规格中注明这一点；实际计算/申报交由
  计费系统处理。不要自行实现税务系统。
- **电子邮件 / 短信同意** — 购物车挽回需要事先获得同意（CAN-SPAM / TCPA / GDPR），遵守
  退订要求，并执行免打扰时段/退订抑制。发送 + 同意机制交由
  [[lifecycle-messaging]] 处理；规格只需声明该要求。
- **PCI** — 结账使用 **Stripe 托管的**组件，因此银行卡数据绝不会接触我们的服务器
  （SAQ-A 范围）。声明这一意图；范围证明交由 **pci-reviewer** 处理。

## 输出

应用后，在 ARCH/PLAN/DESIGN 文档中添加一个 **零售领域** 章节：

```
## Retail domain
- model: Product→Variant (option matrix, per-variant SKU/price/stock) · channel-aware InventoryLevel (ATS = on_hand − allocated − safety_stock)
- reorder: reorder_point = avg_demand × lead_time + safety_stock (not "< N")
- pricing: every rule clamps to margin_floor + MAP (margin on landed cost)
- cart-recovery: consent + suppression + timing → [[lifecycle-messaging]]
- wedge: multichannel inventory + reorder, cart recovery (don't fight Shopify's storefront/checkout)
- compliance: tax nexus → billing · consent → [[lifecycle-messaging]] · PCI Stripe-hosted (SAQ-A) → pci-reviewer
- migration: catalog/variant/stock import path → [[migration-ready-schema]]
```