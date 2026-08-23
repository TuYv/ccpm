---
name: amazon-seller-integration
description: "> Integration skill for Amazon Seller Central settlement reports and date range reports. Activate when the user uploads an Amazon settlement report, Amazon seller CSV, or mentions Amazon Seller Central, FBA, or Amazon payouts."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: GLOBAL
  category: integration
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/amazon-seller-integration"
  obligation: INT
---
# Amazon Seller Central 集成技能 v1.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实、文件、选择、截止日期、居住地、申报身份或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核的情况下，请勿依赖本技能进行申报、缴款、修正申报或采取税务立场。

## 第 1 节 — 平台概述

Amazon Seller Central 是 Amazon 市场上第三方卖家使用的平台。它负责处理商品信息、订单管理、履约（FBA 或 FBM）、广告和财务结算。Amazon 在 20 多个国家/地区运营市场，包括美国、英国、德国、法国、意大利、西班牙、日本、澳大利亚、印度和加拿大。

Amazon 的财务数据极其复杂，因为每笔订单都会生成多个明细项：商品价格、配送抵扣、礼品包装、促销返款、FBA 费用、销售佣金、税费等。结算报告中的每个明细项都是单独的一行。

---

## 第 2 节 — 导出格式

| 格式 | 使用场景 |
|--------|----------|
| TSV（制表符分隔） | 结算报告 V2（GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2）。主要财务报告。 |
| CSV | 日期范围报告（从 Payments 控制面板导出的自定义期间报告）。 |
| XML | XML 版本的结算报告（旧版）。 |
| PDF | 汇总报告、账户活动 PDF（用于概览，不包含明细项数据）。 |

**结算报告 V2** 是最重要的记账导出文件。它涵盖一个结算周期（通常为 14 天），并包含每一项财务事件。日期范围报告允许选择自定义期间，但使用的格式略有不同。

---

## 第 3 节 — 列映射

### 结算报告 V2（平面文件）

| 列标题 | 含义 |
|---------------|---------|
| settlement-id | 唯一的结算周期标识符。同一结算中的所有行共享此 ID。 |
| settlement-start-date | 结算周期的开始时间（ISO 8601）。 |
| settlement-end-date | 结算周期的结束时间（ISO 8601）。 |
| deposit-date | Amazon 将资金存入卖家银行账户的日期。 |
| total-amount | 存入的结算总金额。仅在第一行中填充。 |
| currency | 三字母 ISO 货币代码（USD、GBP、EUR）。 |
| transaction-type | Order、Refund、Service Fee、Adjustment、Transfer、Liquidations、other（参见第 4 节）。 |
| order-id | Amazon 订单 ID（例如 111-1234567-1234567）。对于非订单交易，此项为空。 |
| merchant-order-id | 卖家自己的订单参考编号（如已设置）。 |
| adjustment-id | 调整交易的标识符。 |
| shipment-id | FBA 货件 ID。 |
| marketplace-name | 所属 Amazon 市场（amazon.com、amazon.co.uk、amazon.de 等）。 |
| amount-type | 金额类别：ItemPrice、ItemFees、Promotion、ItemWithheldTax、other。 |
| amount-description | 具体费用/收费名称（完整列表参见第 4 节）。 |
| amount | 货币金额。正数 = 计入卖家的款项，负数 = 从卖家扣除的款项。 |
| fulfillment-id | AFN（由 Amazon 配送 / FBA）或 MFN（由卖家配送）。 |
| posted-date | 交易的入账日期。 |
| posted-date-time | 入账的完整时间戳（ISO 8601）。 |
| order-item-code | Amazon 的内部明细项标识符。 |
| merchant-order-item-id | 卖家自己的明细项参考编号。 |
| merchant-adjustment-item-id | 卖家自己的调整参考编号。 |
| sku | 商品 SKU。 |
| quantity-purchased | 订单中的商品件数。 |
| promotion-id | 应用促销时的促销标识符。 |

---

## 第 4 节 — 交易类型代码

### transaction-type 值

| 值 | 含义 |
|-------|---------|
| Order | 客户订单产生的收入 |
| Refund | 向客户发放的退款（冲销订单金额） |
| Service Fee | Amazon 服务费（订阅、广告、FBA 仓储） |
| Adjustment | 手动调整（补偿、修正） |
| Transfer | 存入卖家银行账户的结算款项 |
| Liquidations | FBA 库存清算所得款项 |
| other | 用于归纳其他各类事件 |

### amount-type 值

| 值 | 含义 |
|-------|---------|
| ItemPrice | 收入组成部分：Principal（商品价格）、Shipping、GiftWrap 等 |
| ItemFees | Amazon 费用：Commission（销售佣金）、FBAPerUnitFulfillmentFee、ShippingHB 等 |
| Promotion | 由卖家承担的促销折扣 |
| ItemWithheldTax | Amazon 代表卖家代扣的税款 |
| other | 其他金额 |

### 关键 amount-description 值

| amount-description | 含义 |
|-------------------|---------|
| Principal | 商品销售价格（收入） |
| Shipping | 买家支付的运费补贴 |
| ShippingTax | 运费税 |
| Tax | 收取的商品税 |
| GiftWrap | 礼品包装费 |
| Commission | Amazon 销售佣金（销售价格的一定百分比） |
| FBAPerUnitFulfillmentFee | FBA 每件商品的拣货、包装和配送费用 |
| FBAPerOrderFulfillmentFee | FBA 每笔订单费用 |
| FBAWeightBasedFee | FBA 按重量计算的配送费 |
| ShippingHB | 配送处理费 |
| StorageRenewalBilling | FBA 月度/长期仓储费 |
| Subscription | 专业卖家订阅费（$39.99/月） |
| PromotionShipping | 由卖家承担的免运费促销 |

---

## 第 5 节 — 费用结构

| 费用类型 | 显示方式 |
|----------|---------------|
| 销售佣金（Commission） | transaction-type = Order，amount-type = ItemFees，amount-description = Commission。通常为 8–15%，具体取决于商品类别。金额为负数。 |
| FBA 配送费 | transaction-type = Order，amount-type = ItemFees，amount-description = FBAPerUnitFulfillmentFee。根据尺寸/重量计算的每件商品费用。 |
| FBA 仓储费 | transaction-type = Service Fee，amount-description = StorageRenewalBilling。月度和长期仓储费用。 |
| 专业卖家订阅费 | transaction-type = Service Fee，amount-description = Subscription。$39.99/月。 |
| 广告费 | 单独的报告（Sponsored Products）。不包含在结算报告中。 |
| 退款管理费 | 当 Amazon 向客户退款时，原销售佣金可能会被部分保留。在 Refund 行中显示为正数的 ItemFees 金额。 |

每笔订单存在多行费用记录属于正常情况。一笔订单可能会生成 5–10 行：Principal、Shipping、Tax、Commission、FBAPerUnitFulfillmentFee、Promotion 等。

---

## 第 6 节 — 税务相关字段

| 字段 | 说明 |
|-------|-------|
| amount-description = Tax | 针对商品价格收取的销售税/增值税。 |
| amount-description = ShippingTax | 针对运费收取的税款。 |
| amount-type = ItemWithheldTax | 由 Amazon 代扣代缴的税款（Marketplace Tax Collection）。适用于 Amazon 代表卖家代收税款的美国各州。 |
| marketplace-name | 决定适用哪个国家/地区的税务规则。 |
| currency | 税款币种与商城币种一致。 |
| 配送地址（不在结算报告中） | 确定美国销售税关联关系时需要完整地址。可在 Orders 报告中获取，但不包含在结算报告中。 |

在美国，Amazon 会在 Marketplace Facilitator 州代收代缴销售税。卖家会看到 ItemWithheldTax，但并不欠缴这笔税款——由 Amazon 缴纳。在欧盟/英国，Amazon 可能会根据特定方案（IOSS、OSS）代收 VAT。欧盟卖家应始终与 Amazon VAT Transaction Report 交叉核对。

---

## 第 7 节 — 多币种处理

| 场景 | 显示方式 |
|----------|---------------|
| 单一商城 | 所有行均使用与商城匹配的同一种货币（.com 使用 USD，.co.uk 使用 GBP，.de/.fr/.it/.es 使用 EUR）。 |
| 多个商城 | 每个商城使用单独的结算报告，各自采用相应的货币。 |
| Amazon Currency Converter | 如果启用，Amazon 会将境外商城收入兑换为卖家的本国货币。结算的 total-amount 使用本国货币。各明细行使用商城货币。 |
| 跨境 FBA | 库存位于一个国家/地区，但在另一个国家/地区销售。无论库存位于何处，结算报告都按商城生成。 |

Amazon 不会在结算报告中显示汇率。如果使用 Amazon Currency Converter，则必须根据以商城货币计价的金额与以本国货币计价的 total-amount 计算实际汇率。

---

## 第 8 节 — 对账提示

1. **每个结算周期对应一份结算报告。** 通常为 14 天一个周期。你需要收集所有结算报告，才能覆盖完整的会计期间。
2. **total-amount = 银行入账金额。** 第一行的 total-amount 应与 Amazon 汇入银行的款项一致。这是对账的基准。
3. **每个订单可能有多行。** 单个订单会为 Principal、Shipping、Commission、FBA 费用、Tax、Promotions 生成多行。将同一 order-id 的所有行相加，即可得到该订单的净影响金额。
4. **按 amount-type 汇总以编制损益表。** 所有 ItemPrice 金额之和 = 收入。所有 ItemFees 金额之和 = Amazon 费用（销售成本）。所有 Promotion 金额之和 = 促销折扣。
5. **退款行与订单行相对应。** 退款会生成相同的行类型（Principal、Shipping、Commission），但正负号相反。退还的 Commission 可能少于原始金额（Amazon 会保留一笔退款管理费）。
6. **Service Fee 行与订单分开。** 仓储费、订阅费和其他服务费没有 order-id。应将这些费用归类为运营费用。
7. **Transfer 行 = 结算总额。** transaction-type = Transfer 且金额为负数的行表示向你的银行账户付款。其绝对值应等于 total-amount。

---

## 第 9 节 — 常见陷阱

1. **每次结算可能包含数百行。** 包含 50 个订单的一次结算可能会有 300 多行，因为每个订单都有 5–10 个金额明细行。不要将行数当作交易数。
2. **欧盟小数格式。** 欧洲商城导出的数据使用逗号作为小数分隔符（95,00，而非 95.00）。解析前请检查区域设置。
3. **代收税款 ≠ 应缴税款（美国）。** 在 Marketplace Facilitator 州，Amazon 负责代收代缴。这些税款行仅供参考，并非卖家所欠款项。
4. **促销返利会减少收入。** 由卖家承担的促销活动（免运费、百分比折扣优惠券）会显示为负数的 Promotion 金额。应从总收入中扣除。
5. **FBA 赔偿。** 当 Amazon 遗失或损坏库存时，赔偿款会显示为 Adjustment 行。这些款项并非收入，而是对库存损失的补偿。
6. **Currency Converter 会掩盖外汇风险。** 如果使用 Amazon 的货币转换服务，结算使用你的本国货币，但各明细行使用商城货币。汇兑价差是 Amazon 的利润，不会显示在报告中。
7. **广告费用位于单独的报告中。** Sponsored Products、Sponsored Brands 和 Sponsored Display 的费用不会出现在结算报告中。它们会在单独的结算中扣除，或从银行卡中扣款。
8. **负数结算。** 如果某个周期内的退款和费用超过收入，Amazon 可能会从卖家的银行卡中扣款，或将负余额结转至下一周期。total-amount 将为负数。

---

## 第 10 节 — 示例数据

```tsv
settlement-id	settlement-start-date	settlement-end-date	deposit-date	total-amount	currency	transaction-type	order-id	merchant-order-id	adjustment-id	shipment-id	marketplace-name	amount-type	amount-description	amount	fulfillment-id	posted-date	posted-date-time	order-item-code	merchant-order-item-id	merchant-adjustment-item-id	sku	quantity-purchased	promotion-id
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17	1847.32	GBP								
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Order	206-1234567-8901234			FBA12345	amazon.co.uk	ItemPrice	Principal	29.99	AFN	2026-03-02	2026-03-02T14:23:00+00:00	12345678901234		WIDGET-001	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Order	206-1234567-8901234			FBA12345	amazon.co.uk	ItemPrice	Shipping	3.99	AFN	2026-03-02	2026-03-02T14:23:00+00:00	12345678901234		WIDGET-001	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Order	206-1234567-8901234			FBA12345	amazon.co.uk	ItemFees	Commission	-4.50	AFN	2026-03-02	2026-03-02T14:23:00+00:00	12345678901234		WIDGET-001	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Order	206-1234567-8901234			FBA12345	amazon.co.uk	ItemFees	FBAPerUnitFulfillmentFee	-3.21	AFN	2026-03-02	2026-03-02T14:23:00+00:00	12345678901234		WIDGET-001	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Refund	206-9876543-2109876			FBA12346	amazon.co.uk	ItemPrice	Principal	-19.99	AFN	2026-03-05	2026-03-05T09:15:00+00:00	98765432109876		GADGET-002	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Refund	206-9876543-2109876			FBA12346	amazon.co.uk	ItemFees	Commission	2.40	AFN	2026-03-05	2026-03-05T09:15:00+00:00	98765432109876		GADGET-002	1
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Service Fee					amazon.co.uk	other	Subscription	-25.00		2026-03-01	2026-03-01T00:00:00+00:00
18906543210	2026-03-01T00:00:00+00:00	2026-03-15T00:00:00+00:00	2026-03-17		GBP	Transfer								-1847.32		2026-03-17	2026-03-17T06:00:00+00:00
```

---

## 免责声明

此技能及其输出仅供参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者对因使用此技能而产生的任何错误、遗漏或后果概不负责。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士审核并签字确认。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/amazon-seller-integration) — 面向 AI 的开放税务指南，由具名的注册会计师/特许会计师/注册税务师审核。质量：**引用来源的草稿**。如需始终保持最新的数据以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_