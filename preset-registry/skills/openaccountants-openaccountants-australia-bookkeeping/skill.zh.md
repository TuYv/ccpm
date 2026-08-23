---
name: australia-bookkeeping
description: "> Use this skill whenever asked about Australian bookkeeping for sole traders, partnerships, or small companies. Trigger on phrases like \"chart of accounts\", \"BAS\", \"GST codes\", \"bookkeeping\", \"profit and loss\", \"balance sheet\", \"AASB\", \"simplified disclosures\", \"Tier 2\", \"bank reconciliation\", \"expense categories\", \"revenue recognition\", \"depreciation\", \"instant asset write-off\", \"small business pool\", \"ABN\", \"ATO reporting\", \"activity statement\", \"accrual basis\", \"cash basis\", \"general ledger\", or any question about day-to-day transaction recording, financial statement preparation, or account coding for an Australian business."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AU
  category: bookkeeping
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/australia-bookkeeping"
  obligation: BT
---
# 澳大利亚簿记技能 v1.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。尚未针对任何特定个人的实际情况、文件、税务选择、截止日期、税务居民身份、申报状态或当地程序进行审查。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴款、修正申报或采取税务立场。

---

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 澳大利亚（澳大利亚联邦） |
| 货币 | 仅限 AUD（$） |
| 财政年度 | 7 月 1 日至 6 月 30 日（标准）；公司可采用替代会计期间 |
| 会计准则 | AASB（基于完整 IFRS）；AASB 1060 简化披露（第 2 层级）；非报告主体采用特殊目的财务报告 |
| 主管机构 | 澳大利亚会计准则委员会（AASB） |
| 税务机关 | 澳大利亚税务局（ATO） |
| 主要法规 | 《2001 年公司法》（财务报告，第 2M 章）；《1936/1997 年所得税评估法》；《1999 年新税制（GST）法》 |
| GST 注册门槛 | 营业额 $75,000（非营利组织为 $150,000） |
| 小型企业实体门槛 | 汇总营业额 < $10 million |
| BAS 提交 | 按季度（大多数小型企业）或按月（营业额 $20m+） |

---

## 第 2 节——标准会计科目表

澳大利亚软件（Xero、MYOB、QuickBooks）通常使用 3–4 位代码。以下结构遵循澳大利亚的常见惯例。

### 资产（1000–1999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 1000 | 库存现金 / 零用现金 | 流动资产 |
| 1010 | 企业银行账户 | 流动资产 |
| 1020 | 储蓄账户 | 流动资产 |
| 1030 | 定期存款（< 12 个月） | 流动资产 |
| 1050 | 未存入银行的款项 | 流动资产 |
| 1100 | 应收账款（贸易债务人） | 流动资产 |
| 1110 | 其他应收款 | 流动资产 |
| 1120 | 预付款项 | 流动资产 |
| 1150 | 应收 GST（进项税抵免） | 流动资产 |
| 1200 | 存货 / 库存商品 | 流动资产 |
| 1300 | 土地 | 非流动资产 |
| 1310 | 建筑物 | 非流动资产 |
| 1311 | 累计折旧——建筑物 | 资产抵减科目 |
| 1320 | 厂房及设备 | 非流动资产 |
| 1321 | 累计折旧——厂房及设备 | 资产抵减科目 |
| 1330 | 机动车辆 | 非流动资产 |
| 1331 | 累计折旧——机动车辆 | 资产抵减科目 |
| 1340 | 办公设备 | 非流动资产 |
| 1341 | 累计折旧——办公设备 | 资产抵减科目 |
| 1350 | 计算机设备 | 非流动资产 |
| 1351 | 累计折旧——计算机设备 | 资产抵减科目 |
| 1360 | 家具及装置 | 非流动资产 |
| 1361 | 累计折旧——家具及装置 | 资产抵减科目 |
| 1400 | 小型企业资产池 | 非流动资产 |

### 负债（2000–2999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 2000 | 应付账款（贸易债权人） | 流动负债 |
| 2010 | 其他应付款 | 流动负债 |
| 2020 | 应计费用 | 流动负债 |
| 2050 | 应付 GST（已收取） | 流动负债 |
| 2060 | GST 清算 / 控制 | 流动负债 |
| 2100 | 应付 PAYG 预扣税 | 流动负债 |
| 2110 | 应付养老金 | 流动负债 |
| 2120 | 年假准备金 | 流动负债 |
| 2130 | 长期服务假准备金 | 流动负债 |
| 2140 | 所得税准备金 | 流动负债 |
| 2200 | 信用卡 | 流动负债 |
| 2300 | 短期贷款（< 12 个月） | 流动负债 |
| 2400 | 长期贷款（> 12 个月） | 非流动负债 |
| 2410 | 分期付款购买负债 | 非流动负债 |
| 2500 | 董事贷款账户 | 非流动负债 |

### 权益（3000–3999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 3000 | 股本 / 所有者权益 | 权益 |
| 3010 | 所有者提款 | 权益 |
| 3020 | 所有者投入 | 权益 |
| 3100 | 留存收益 | 权益 |
| 3200 | 本年度利润/亏损 | 权益 |
| 3300 | 储备金 | 权益 |

### 收入（4000–4999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 4000 | 销售收入 — 应税（GST 10%） | 收入 |
| 4010 | 销售收入 — 免征 GST | 收入 |
| 4020 | 销售收入 — 进项税型 | 收入 |
| 4030 | 销售收入 — 出口（免征 GST） | 收入 |
| 4100 | 服务收入 | 收入 |
| 4200 | 利息收入 | 收入 |
| 4300 | 租金收入 | 收入 |
| 4400 | 政府补助 / 补贴 | 收入 |
| 4500 | 其他收入 | 收入 |
| 4900 | 销售折扣 | 收入抵减 |

### 销货成本（5000–5999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 5000 | 采购 — 商品库存 | 销货成本 |
| 5010 | 采购 — 材料 / 零部件 | 销货成本 |
| 5020 | 进货运费 | 销货成本 |
| 5030 | 直接人工 | 销货成本 |
| 5040 | 分包商成本 | 销货成本 |
| 5100 | 期初存货调整 | 销货成本 |
| 5110 | 期末存货调整 | 销货成本 |
| 5200 | 进口关税和海关费用 | 销货成本 |

### 营业费用（6000–6999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 6000 | 租金 — 营业场所 | 费用 |
| 6010 | 地方税费和业主委员会费用 | 费用 |
| 6020 | 电费和燃气费 | 费用 |
| 6030 | 水费 | 费用 |
| 6040 | 保险 — 企业 | 费用 |
| 6050 | 维修和维护 | 费用 |
| 6100 | 工资和薪金 | 费用 |
| 6110 | 养老金保障缴款（自 2025 年 7 月起为 11.5%） | 费用 |
| 6120 | 工伤赔偿保险 | 费用 |
| 6130 | 工资税（按州征收） | 费用 |
| 6140 | 员工培训 | 费用 |
| 6200 | 广告和营销 | 费用 |
| 6210 | 网站和托管 | 费用 |
| 6220 | 印刷和文具 | 费用 |
| 6230 | 邮寄和配送 | 费用 |
| 6300 | 机动车辆 — 燃料 | 费用 |
| 6310 | 机动车辆 — 注册和保险 | 费用 |
| 6320 | 机动车辆 — 维修 | 费用 |
| 6330 | 差旅 — 国内 | 费用 |
| 6340 | 差旅 — 国际 | 费用 |
| 6350 | 餐饮和招待（50% 可抵扣 FBT） | 费用 |
| 6400 | 会计师和税务代理费 | 费用 |
| 6410 | 法律费用 | 费用 |
| 6420 | 银行手续费 | 费用 |
| 6430 | 商户 / 支付处理费 | 费用 |
| 6440 | 利息费用 | 费用 |
| 6500 | 电话和互联网 | 费用 |
| 6510 | 软件订阅（SaaS） | 费用 |
| 6520 | 专业订阅和会员费 | 费用 |
| 6600 | 折旧 — 建筑物 | 费用 |
| 6610 | 折旧 — 厂房和设备 | 费用 |
| 6620 | 折旧 — 机动车辆 | 费用 |
| 6630 | 折旧 — 办公/计算机设备 | 费用 |
| 6700 | 坏账核销 | 费用 |
| 6800 | 一般及杂项费用 | 费用 |

### 其他收入 / 费用（7000–7999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 7000 | 资产出售收益 | 其他收入 |
| 7010 | 资产出售损失 | 其他费用 |
| 7020 | 汇兑收益/损失 | 其他收入/费用 |
| 7100 | 非常项目 | 其他费用 |

### 税务（8000–8999）

| 代码 | 科目 | 类型 |
|---|---|---|
| 8000 | 所得税费用 | 税务 |
| 8010 | 递延所得税负债 | 税务 |
| 8020 | 递延所得税资产 | 税务 |

---

## 第 3 节 -- 收入确认

### 收付实现制与权责发生制规则

| 标准 | 收付实现制（个体经营者/小型企业） | 权责发生制 |
|---|---|---|
| 适用资格 | 汇总营业额 < $10m（小型企业实体） | 所有实体；报告实体必须采用 |
| 收入确认 | 收到现金时 | 收入赚取时（开具发票或交付商品时） |
| 费用确认 | 支付现金时 | 费用发生时（产生负债时） |
| 交易存货 | 简化处理：若变动额 < $5,000，则免于盘点存货 | 必须进行期初/期末存货调整 |
| 预付费用 | 若期限 < 12 个月且金额低于 $1,000，或企业营业额 < $10m，可立即扣除 | 在受益期间内分摊 |

### AASB 15 客户合同收入

适用于采用 Tier 1/Tier 2 的报告实体。五步模型：
1. 识别合同
2. 识别履约义务
3. 确定交易价格
4. 将价格分摊至各项义务
5. 在义务履行时确认收入

采用简化报告的小型企业通常在交付/完成时确认收入。

---

## 第 4 节 -- 费用分类

### ATO 个人所得税申报类别（个体经营者 — 业务附表）

| 项目 | 类别 | 名义科目代码 |
|---|---|---|
| A | 所有其他业务收入 | 4000–4500 |
| B | 销售成本 | 5000–5200 |
| C | 承包商费用和佣金 | 5040 |
| D | 养老金 | 6110 |
| E | 坏账 | 6700 |
| F | 租赁费用（厂房/设备） | 6000 |
| G | 利息费用 — 澳大利亚 | 6440 |
| H | 折旧（不包括 SB pool） | 6600–6630 |
| I | 机动车辆费用 | 6300–6320 |
| J | 维修和维护 | 6050 |
| K | 所有其他费用 | 6000–6800（其余） |

### 不可扣除费用（ATO）

- 业务招待费（未选择适用 FBT）— 不可扣除部分
- 资本性支出 — 必须计提折旧或通过 SB pool 注销
- 混合费用中的私人用途部分 — 必须进行分摊
- 罚款和处罚 — 不可扣除
- 服装（非强制性、非防护性）— 不可扣除
- 交通违章罚款 — 不可扣除

### BAS 的 GST 分类

| GST 代码 | 说明 | BAS 标签 |
|---|---|---|
| GST (10%) | 标准应税供应 | G1, 1A |
| GST-Free | 食品（基本食品）、医疗、教育、出口 | G1（无 1A） |
| Input Taxed | 金融供应、住宅租金 | G1（无抵免） |
| BAS Excluded | 工资、业主提款、贷款本金、私人用途 | 不申报 |
| No ABN Withholding | 向未提供 ABN 的供应商付款（预扣 49%） | 单独申报 |

---

## 第 5 节 -- 资产与费用阈值

### 资产即时抵扣（IAWO）

| 期间 | 阈值 | 适用资格 |
|---|---|---|
| 1 Jul 2023 – 30 Jun 2026 | 每项资产 < $20,000 | 汇总营业额 < $10m，并采用简化折旧 |
| 永久性规定（自 1 Jul 2026 起） | 每项资产 < $20,000 | 已在 2026 年预算案中宣布 — 改为永久性政策 |

### 小型企业资产池（简化折旧）

| 资产池 | 折旧率 | 说明 |
|---|---|---|
| 第 1 年（首次使用） | 15% | 按成本计算（如后续加入，则按可调整价值计算） |
| 后续年度 | 30% | 按资产池期初余额计算 |
| 资产池余额 < IAWO 门槛 | 注销整个资产池余额 | 年末检查 |

### 一般（非小型企业）折旧

| 方法 | 计算方式 |
|---|---|
| 余额递减法 | 折旧率 = 持有天数 ÷ 365 ×（200% ÷ 有效年限） |
| 直线法 | 折旧率 = 持有天数 ÷ 365 ×（100% ÷ 有效年限） |

### 常见有效年限（基于 ATO TR 2025/1）

| 资产 | 有效年限 | 余额递减法折旧率 | 直线法折旧率 |
|---|---|---|---|
| 台式计算机 | 4 年 | 50% | 25% |
| 笔记本电脑 | 4 年 | 50% | 25% |
| 打印机/扫描仪 | 5 年 | 40% | 20% |
| 办公家具 | 10 年 | 20% | 10% |
| 机动车辆 | 8 年 | 25% | 12.5% |
| 空调设备 | 10 年 | 20% | 10% |
| 建筑物（一般） | 40 年 | 5% | 2.5% |

### 汽车成本限额

对于 2025–26 年度，用于折旧目的的汽车成本限额为 $69,674。只有该金额中用于业务用途的部分可以计提折旧。

---

## 第 6 节——损益表格式

### 利润表（AASB 简化版 / 第 2 层级）

```
STATEMENT OF PROFIT OR LOSS
For the year ended 30 June 20XX
                                            $           $
Revenue                                               xxx
Cost of sales                                        (xxx)
                                                     ────
Gross profit                                          xxx

Other income                                          xxx

Expenses:
  Employee benefits expense               (xxx)
  Depreciation and amortisation           (xxx)
  Finance costs                           (xxx)
  Other expenses                          (xxx)
                                                     (xxx)
                                                     ────
Profit before income tax                              xxx
Income tax expense                                   (xxx)
                                                     ────
Profit for the year                                   xxx
                                                     ════
```

### 个体经营者——ATO 业务附表格式

```
BUSINESS INCOME
  Gross payments subject to withholding       xxx
  All other business income                   xxx
  TOTAL BUSINESS INCOME                       xxx

BUSINESS EXPENSES
  Cost of sales                              (xxx)
  Contractor/subcontractor/commission        (xxx)
  Superannuation expenses                    (xxx)
  Bad debts                                  (xxx)
  Lease expenses within Australia            (xxx)
  Interest expenses within Australia         (xxx)
  Depreciation expenses                      (xxx)
  Motor vehicle expenses                     (xxx)
  Repairs and maintenance                    (xxx)
  All other expenses                         (xxx)
  TOTAL BUSINESS EXPENSES                    (xxx)

NET INCOME OR LOSS FROM BUSINESS              xxx
```

---

## 第 7 节 -- 资产负债表格式

### 财务状况表（纵向格式 — AASB 第 2 级）

```
STATEMENT OF FINANCIAL POSITION
As at 30 June 20XX
                                            $           $
CURRENT ASSETS
  Cash and cash equivalents                           xxx
  Trade and other receivables                         xxx
  Inventories                                         xxx
  Other current assets                                xxx
                                                     ────
Total current assets                                  xxx

NON-CURRENT ASSETS
  Property, plant and equipment                       xxx
  Intangible assets                                   xxx
  Other non-current assets                            xxx
                                                     ────
Total non-current assets                              xxx
                                                     ────
TOTAL ASSETS                                          xxx
                                                     ════

CURRENT LIABILITIES
  Trade and other payables                            xxx
  Current tax liabilities                             xxx
  Provisions (annual leave, etc.)                     xxx
  Short-term borrowings                               xxx
                                                     ────
Total current liabilities                             xxx

NON-CURRENT LIABILITIES
  Long-term borrowings                                xxx
  Provisions (long service leave)                     xxx
                                                     ────
Total non-current liabilities                         xxx
                                                     ────
TOTAL LIABILITIES                                     xxx
                                                     ════

NET ASSETS                                            xxx
                                                     ════

EQUITY
  Issued capital                                      xxx
  Retained earnings                                   xxx
  Reserves                                            xxx
                                                     ────
TOTAL EQUITY                                          xxx
                                                     ════
```

---

## 第 8 节 -- 银行对账模式

### 常见澳大利亚银行格式

| 银行 | 导出格式 | 关键字段 |
|---|---|---|
| Commonwealth Bank (CBA) | CSV, OFX, QIF | Date, Amount, Description, Balance |
| ANZ | CSV, OFX | Date, Description, Amount, Type |
| Westpac | CSV, OFX, QIF | Date, Narration, Debit, Credit, Balance |
| NAB | CSV, OFX | Date, Narration, Amount, Type, Balance |
| Macquarie | CSV | Date, Description, Amount, Balance |
| Bendigo Bank | CSV, OFX | Date, Description, Debit, Credit, Balance |
| Up Bank / 新型银行 | CSV | Date, Description, Amount, Category |

### 常见交易描述

| 模式 | 可能的分类 |
|---|---|
| DIRECT CREDIT, BPAY CREDIT | 收入 — 客户付款 |
| EFTPOS, VISA PURCHASE, DEBIT CARD | 费用 — 检查商户 |
| DIRECT DEBIT, D/D | 经常性费用（保险、订阅、公用事业费） |
| BPAY | 费用 — 账单付款（公用事业费、ATO、地方税费） |
| TRANSFER, INT TFR | 内部转账或付款 — 检查交易对手方 |
| ATM WITHDRAWAL | 业主提款（个体经营者）或备用金补充 |
| INTEREST CHARGED | 利息费用 (6440) |
| INTEREST PAID | 利息收入 (4200) |
| ATO PAYMENT, ATO IAS, ATO BAS | 税款支付 — 并非损益费用 |
| PAYROLL, WAGES | 员工成本 (6100) |
| SUPER STREAM, SUPER CLEARING | 养老金 (6110) |
| XERO, STRIPE, SQUARE PAYOUT | 平台付款 — 与发票进行匹配 |

---

## 第 9 节——微型实体／小型企业简化措施

### 小型企业实体优惠（营业额 < $10m）

| 优惠措施 | 详情 |
|---|---|
| 简化折旧 | < $20,000 的资产即时核销；资产池余额按 15%/30% 折旧 |
| 简化存货核算 | 如果估算变动 ≤ $5,000，则无需进行存货盘点 |
| 预付费用 | 如果期限 < 12 个月，且服务期在下一年度结束前届满，则可立即扣除 |
| 简化 BAS | 仅申报 G1、1A、1B（无需申报 G2、G3、G10、G11） |
| 两年修正期 | ATO 只能在 2 年内修正评税结果（而非 4 年） |
| GST 收付实现制会计 | 在款项支付／收取时申报 GST，而非在开具发票时申报 |
| PAYG 分期付款 | 可选择按季度支付 ATO 计算的金额 |

### 报告层级

| 层级 | 适用对象 | 准则 | 必需报表 |
|---|---|---|---|
| 第 1 层级（完整 AASB / IFRS） | 大型私人公司、公众公司、注册计划 | 完整确认 + 完整披露 | 全部 5 份报表 + 附注 |
| 第 2 层级（AASB 1060 简化准则） | 选择第 2 层级的非公众受托责任实体 | 完整确认，简化披露 | 全部 5 份报表 + 简化附注 |
| 特殊目的（旧制度） | 非报告实体（正在逐步终止） | 灵活 | 视情况而定（大型实体于 2023 年 6 月 30 日前逐步取消） |
| 无法定报告要求 | 个体经营者、小型合伙企业（非公司） | 无强制要求 | 仅为 ATO／税务目的编制 |

### 大型私人公司门槛（必须作为报告实体）

满足以下 3 项中的 2 项：收入 ≥ $50m、资产 ≥ $25m、员工人数 ≥ 100。

---

## 第 10 节——与税务技能的交互

### 所得税申报表

- 个体经营者：在个人申报表中填写企业附表（通过 myTax 或税务代理）
- 公司：公司所得税申报表（其中各标签与财务报表项目对应）
- 税率：个人适用边际税率；公司适用 25%（基本税率实体，营业额 < $50m）或 30%
- 股息抵税：已缴纳的公司税会为股东股息产生股息抵税额度
- 亏损：可无限期结转，但须遵守所有权连续性测试（公司）或非商业亏损规则（个人）

### BAS / GST 申报表

| BAS 标签 | 说明 | CoA 映射 |
|---|---|---|
| G1 | 销售总额（包括 GST 免税和进项税销售） | 4000–4500 |
| 1A | 销售产生的 GST | 2050 |
| 1B | 采购产生的 GST（进项税抵免） | 1150 |
| W1 | 工资／薪金及其他付款总额 | 6100 |
| W2 | 从付款中预扣的金额（PAYG-W） | 2100 |
| T1 | PAYG 分期付款收入 | 4000–4500 |
| T2 | 计提的 PAYG 分期付款 | 2140 |

### 养老金保证金

- 比率：正常工作时间收入的 11.5%（自 2025 年 7 月 1 日起）；自 2026 年 7 月 1 日起提高至 12%
- 到期日：季度结束后 28 天
- 名义账户：6110（费用）/ 2110（应付款）
- SG 费用：如果逾期，将失去税前扣除资格并须支付额外罚款

### 附加福利税（FBT）

- FBT 年度：4 月 1 日至 3 月 31 日
- 税率：47%（最高边际税率 + Medicare 征费）
- 常见项目：汽车附加福利、招待、贷款附加福利
- 餐饮／招待：可采用 50/50 法——50% 可从所得税中扣除，50% 须缴纳 FBT

---

## 免责声明

本技能及其输出仅供信息参考和计算用途，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在申报或据此采取行动之前，所有输出都必须由具备资质的专业人士（例如 CPA、CA、注册税务代理，或您所在司法管辖区内具有同等资质的执业人士）审核并签字确认。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/australia-bookkeeping) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**注明来源的草稿**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_