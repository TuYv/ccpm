---
name: au-individual-return
description: "> Use this skill whenever asked about Australian individual income tax for sole traders. Trigger on phrases like \"how much tax do I pay in Australia\", \"Australian tax return\", \"sole trader tax\", \"ABN tax\", \"Medicare levy\", \"LITO\", \"PAYG\", \"tax brackets Australia\", \"BAS\", \"instant asset write-off\", \"home office deduction\", \"HELP repayment\", \"HECS debt\", \"small business income tax offset\", \"motor vehicle deduction\", or any question about filing or computing income tax for an Australian sole trader. Covers 2024-25 Stage 3 tax rates, Medicare levy and surcharge, LITO, business income computation, allowable deductions, depreciation, instant asset write-off, small business income tax offset, HELP/HECS repayments, and final tax computation. ALWAYS read this skill before touching any Australian income tax work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AU
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/au-individual-return"
  tax_year: 2024-25
  obligation: IT
---
# 澳大利亚个人所得税——个体经营者技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、税务居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴税、修正申报或采取任何税务立场。

---

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 澳大利亚 |
| 税种 | 所得税 + 医疗保险税 + HELP 还款（如适用） |
| 货币 | 仅限 AUD |
| 纳税年度 | 2024 年 7 月 1 日——2025 年 6 月 30 日 |
| 主要法律 | 《1997 年所得税评估法》(ITAA 1997)；《1936 年所得税评估法》(ITAA 1936) |
| 配套法律 | 《1953 年税务管理法》；《1986 年医疗保险税法》；《2003 年高等教育支持法》 |
| 税务机关 | 澳大利亚税务局 (ATO) |
| 申报平台 | myTax（通过 myGov）或注册税务代理 |
| 申报截止日期 | 2025 年 10 月 31 日（自行申报）；2026 年 5 月（通过税务代理） |
| 贡献者 | 开放会计师社区 |
| 验证者 | 待定——需要澳大利亚 CPA/CA 签署确认 |
| 技能版本 | 2.0 |

### 税率——税务居民个人（2024-25，第三阶段）[T1]

| 应纳税所得额 (AUD) | 税率 | 本档税额 |
|---|---|---|
| 0 -- 18,200 | 0% | 免税门槛 |
| 18,201 -- 45,000 | 16% | 最高 $4,288 |
| 45,001 -- 135,000 | 30% | 最高 $27,000 |
| 135,001 -- 190,000 | 37% | 最高 $20,350 |
| 190,001+ | 45% | |

### 医疗保险税 [T1]

| 项目 | 值 |
|---|---|
| 税率 | 应纳税所得额的 2% |
| 低收入门槛（单身） | $26,000（低于此金额免征；逐步增加至 $32,500 时全额征收） |
| 低收入门槛（家庭） | $43,846 + 每名受抚养子女 $4,027 |
| 附加税（无私人住院保险） | 收入超过 $93,000（单身）时额外征收 1%-1.5% |

### 低收入税收抵免 (LITO) [T1]

| 应纳税所得额 (AUD) | LITO |
|---|---|
| 不超过 $45,000 | $700 |
| $45,001 -- $66,667 | 超出 $45,000 的部分每 $1 减少 5 分 |
| $66,668+ | $0 |

### 小企业所得税抵免 (SBITO) [T1]

| 项目 | 值 |
|---|---|
| 抵免率 | 经营所得对应所得税的 16% |
| 上限 | $1,000 |
| 资格 | 汇总营业额低于 $5 million（仅限个人和信托） |

### 主要扣除标准 [T1]

| 项目 | 标准 |
|---|---|
| 居家办公——固定费率法 | 每小时 67 分 |
| 机动车——每公里固定费率法 | 每公里 88 分（最多 5,000 公里） |
| 资产即时核销（小企业） | $20,000 门槛（低于 $20,000 的资产可立即扣除） |
| 养老金（可扣除的个人缴款） | 优惠缴款上限不超过 $30,000 |

### 保守默认值 [T1]

| 不明确事项 | 默认处理 |
|---|---|
| 税务居民身份未知 | 澳大利亚税务居民（但如果确实不明确，则停止） |
| 业务使用比例未知（车辆、电话、住宅） | 0% 扣除 |
| 费用类别未知 | 不可扣除 |
| 折旧有效年限未知 | 使用 ATO 的折旧表 |
| 私人健康保险状态未知 | 无保险（可能适用医疗保险税附加税） |
| 汇总营业额未知 | 超过 $10 million（不适用小企业优惠） |

---

## 第 2 节——必需输入与拒绝目录

### 必需输入

**最低可行要求**——完整财政年度（7 月 1 日至 6 月 30 日）的银行对账单、ABN/TFN 确认信息，以及纳税人是否为澳大利亚居民。

**建议提供**——所有已开具的税务发票、采购收据、PAYG 付款摘要或收入报表（通过 myGov 获取）、上一年度纳税申报表、BAS 申报记录。

**理想情况**——完整的记账记录、折旧明细表、机动车行车日志、居家办公时数记录、私人健康保险报表、HELP 债务余额。

### 拒绝目录

**R-AU-1——公司和信托。** “公司提交公司纳税申报表。信托提交信托纳税申报表。此技能仅适用于个体经营者个人。”

**R-AU-2——非居民。** “非居民的税率和规则存在显著差异。不在范围内。”

**R-AU-3——资本利得税事件。** “CGT 事件需要进行专门计算（成本基础、折扣、豁免）。不在范围内。”

**R-AU-4——复杂折旧（有效年限争议）。** “如果对 ATO 规定的有效年限有异议，或资产没有已公布的折旧率，则升级处理。”

**R-AU-5——合伙企业或 PSI（个人劳务收入）。** “PSI 规则和合伙企业分配需要单独分析。升级处理。”

---

## 第 3 节——交易模式库

### 3.1 收入模式（银行对账单中的贷记交易）

| 模式 | 税务标签 | 处理方式 | 备注 |
|---|---|---|---|
| ABN INCOME, CLIENT PAYMENT, [client name] | 营业收入（Item P8） | 营业总收入 | 个体经营者的核心收入 |
| STRIPE PAYOUT, STRIPE TRANSFER | 营业收入 | 收入 | 与相关发票核对 |
| PAYPAL TRANSFER | 营业收入 | 收入 | 按扣除费用前的总额申报 |
| DIRECT CREDIT [client name] | 营业收入 | 收入 | 客户通过银行转账支付 |
| INTEREST, SAVINGS INTEREST | 利息收入（Item 10） | 不是营业收入 | 作为利息单独申报 |
| DIVIDEND, DISTRIBUTION | 股息收入（Item 11） | 不是营业收入 | 单独申报。包括抵免税额。 |
| FRANKING CREDIT | 股息总额加回 | 计入应税收入 | 抵免税额既属于收入，也属于税收抵免 |
| ATO REFUND, TAX REFUND | 排除 | 不属于收入 | 上一年度退税 |
| CENTRELINK, JOBSEEKER, YOUTH ALLOWANCE | 政府补助（Item 6） | 可能需要纳税 | 核查具体补助类型 |
| SUPERANNUATION（一次性领取或养老金） | Item 7 或 8 | 核查 | 取决于年龄和构成部分 |
| OWN TRANSFER, SAVINGS | 排除 | 内部交易 | 自有账户之间的转账 |
| RENTAL INCOME | 租金收入（Item 21） | 不是营业收入 | 单独编制租金收入明细表 |

### 3.2 支出模式（银行对账单中的借记交易）

| 模式 | 扣除类别 | 层级 | 处理方式 |
|---|---|---|---|
| RENT, OFFICE RENT, SERVICED OFFICE | 营业支出——场地占用 | T1 | 如果是专用营业场所，可全额扣除 |
| HOME OFFICE, WORK FROM HOME | 居家办公扣除（D5） | T2 | 固定费率每小时 67 澳分或实际成本法。参见第 2 层级。 |
| PETROL, FUEL, CALTEX, BP, SHELL, AMPOL | 机动车（D1） | T2 | 每公里费用法（88 澳分，最多 5,000 公里）或行车日志法 |
| CAR INSURANCE, REGO, SERVICE | 机动车 | T2 | 仅适用于行车日志法（不适用于每公里费用法） |
| TOLL, CITYLINK, LINKT | 机动车或差旅 | T1 | 商务出行通行费：两种方法下均可扣除 |
| FLIGHT, QANTAS, VIRGIN, JETSTAR | 差旅（D2） | T1 | 如果属于商务差旅，可全额扣除 |
| ACCOMMODATION, HOTEL | 差旅 | T1 | 如果属于需要过夜的商务差旅，则可扣除 |
| MEALS（商务差旅、过夜） | 差旅 | T1 | 过夜差旅期间的合理金额 |
| MEALS（客户招待） | 不可扣除 | T1 | 招待费用：个体经营者不可扣除 |
| INSURANCE, PROFESSIONAL INDEMNITY | 营业支出——保险 | T1 | 可全额扣除 |
| INCOME PROTECTION INSURANCE | 扣除（D15） | T1 | 可全额扣除（个人扣除，而非营业扣除） |
| ACCOUNTING, TAX AGENT, BAS AGENT | 税务管理成本（D10） | T1 | 可全额扣除 |
| OFFICE SUPPLIES, OFFICEWORKS | 营业支出 | T1 | 可全额扣除 |
| SOFTWARE, SUBSCRIPTION, XERO, MYOB | 营业支出——IT | T1 | 可全额扣除 |
| GOOGLE ADS, META ADS, FACEBOOK ADS | 营业支出——广告 | T1 | 可全额扣除 |
| PHONE, TELSTRA, OPTUS, VODAFONE | 营业支出——电信 | T2 | 仅限营业用途部分 |
| INTERNET, NBN | 营业支出——电信 | T2 | 仅限营业用途部分（或已包含在居家办公每小时 67 澳分的固定费率中） |
| TRAINING, COURSE, SELF-EDUCATION | 自我教育（D4） | T1 | 如果与当前创收活动直接相关，则可扣除。如果用于转入新职业，则不可扣除。 |
| COMPUTER, LAPTOP, EQUIPMENT（低于 $20,000） | 资产即时核销 | T1 | 如果属于小型企业实体且成本低于 $20,000，则可立即扣除 |
| COMPUTER, LAPTOP, EQUIPMENT（高于 $20,000） | 折旧（D2 营业） | T1 | 根据 ATO 表格中的有效年限计提折旧 |
| SUPER CONTRIBUTION, SUNSUPER, AUSTRALIAN SUPER | 扣除（Item D12） | T1 | 个人可扣除的养老金缴款最高适用 $30,000 的优惠缴款上限。必须提交扣除意向通知。 |
| ATO TAX, INCOME TAX, PAYG INSTALMENT | 排除 | 不可扣除 | 税款支付不可扣除 |
| GST PAYMENT, BAS PAYMENT | 从所得税中排除 | T1 | GST 单独处理。如果已注册 GST，则按不含 GST 的净额申报。 |
| PRIVATE HEALTH, MEDIBANK, BUPA, NIB, HCF | 不属于扣除项目（但会影响 MLS） | T1 | 私人健康保险不可抵税。但持有该保险可以避免 Medicare Levy Surcharge。PHI 退税优惠单独申领。 |
| PERSONAL, GROCERY, ENTERTAINMENT | 排除 | 不可扣除 | 个人支出 |
| DONATION, CHARITY, DGR | 税收抵免（Item D9） | T1 | 如果捐给可扣除赠与接受者（DGR），则可扣除。金额必须至少为 $2，且确实属于赠与。 |

### 3.3 SaaS 订阅

| 模式 | 处理方式 | 备注 |
|---|---|---|
| GOOGLE WORKSPACE, MICROSOFT 365, ADOBE | 可全额扣除的业务费用 | 经营费用 |
| SLACK, ZOOM, NOTION, FIGMA, GITHUB | 可全额扣除 | 同上 |
| AWS, HEROKU, DIGITAL OCEAN | 可全额扣除 | 托管费用 |
| CANVA (AU entity) | 可全额扣除 | 澳大利亚公司 |
| XERO, MYOB | 可全额扣除（管理税务事务的费用或业务费用） | 会计软件 |
| SPOTIFY, NETFLIX | 不可扣除 | 个人娱乐 |

### 3.4 内部转账和排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| TRANSFER, SAVINGS, TERM DEPOSIT | 排除 | 内部资金转移 |
| MORTGAGE, HOME LOAN | 排除（或按居家办公比例计算） | 个人费用。仅适用于居家办公实际成本法。 |
| ATM, CASH | T2 -- 询问 | 默认排除 |
| HECS REPAYMENT, HELP | 不可扣除 | 强制还款不可作为税务扣除项 |

---

## 第 4 节 -- 计算示例

### 示例 1 -- 标准个体经营者（平面设计师）

**输入：** ABN 收入 AUD 92,000。业务费用：软件 AUD 3,600、广告 AUD 1,200、会计 AUD 1,100、办公用品 AUD 800。按每小时 67c 计算居家办公 1,200 小时。按每公里 88c 计算汽车业务行驶里程 4,000 公里。无其他收入。无 HELP 债务。有 PHI。

**计算：**
- 业务收入：AUD 92,000
- 费用：3,600 + 1,200 + 1,100 + 800 = AUD 6,700
- 居家办公：1,200 x 0.67 = AUD 804
- 机动车辆：4,000 x 0.88 = AUD 3,520
- 扣除总额：6,700 + 804 + 3,520 = AUD 11,024
- 应税收入：92,000 - 11,024 = AUD 80,976
- 所得税：0 + 4,288 + (80,976 - 45,000) x 30% = 4,288 + 10,793 = AUD 15,081
- Medicare：80,976 x 2% = AUD 1,620
- LITO：$0（收入 > $66,667）
- SBITO：16% x（业务收入对应的所得税）-- 业务收入占总收入的 100%，因此为 16% x 15,081 = 2,413，上限为 AUD 1,000
- 最终税额：15,081 + 1,620 - 1,000 = AUD 15,701

### 示例 2 -- 资产即时核销

**输入：** 小型企业实体（营业额 < $10M）。购买笔记本电脑 AUD 2,800 和显示器 AUD 950。两者均低于 $20,000。

**分类：** 根据资产即时核销规定，这两项均可立即扣除。购买年度的扣除总额：AUD 3,750。无需折旧计划。

### 示例 3 -- 机动车辆（行车日志法与每公里固定费率法）

**输入：** 总里程：20,000 公里。业务里程：12,000 公里（60%）。汽车费用：燃油 AUD 4,800、保险 AUD 1,600、车辆注册费 AUD 800、保养 AUD 1,200、折旧 AUD 4,000。合计 AUD 12,400。

**计算：**
- 每公里固定费率法：min(12,000, 5,000) x $0.88 = AUD 4,400（上限为 5,000 公里）
- 行车日志法：12,400 x 60% = AUD 7,440
- 行车日志法明显更有利。但需要保留连续 12 周的有效行车日志。
- [T2] 标记：确认行车日志存在且有效。

### 示例 4 -- 居家办公（固定费率法与实际成本法）

**输入：** 每年居家办公 1,600 小时。在一套三居室住宅中设有专用办公室（占总面积的 1/4）。电费 AUD 2,400、互联网费 AUD 1,200、电话费 AUD 960（80% 用于业务）、家具折旧 AUD 400。

**计算：**
- 固定费率法：1,600 x $0.67 = AUD 1,072（涵盖电费、燃气费、电话费、互联网费、文具费和家具折旧）
- 实际成本法：电费 1/4 x AUD 2,400 = AUD 600。互联网费 80% x AUD 1,200 = AUD 960。电话费 80% x AUD 960 = AUD 768。折旧 AUD 400。合计 = AUD 2,728。
- 在此情况下，实际成本法明显更有利。
- 采用固定费率法时：只有计算机/打印机折旧和场所占用费用（租金、住房贷款利息、地方税费、保险）可额外申报扣除。采用实际成本法时：每个项目均单独申报。
- [T2] 标记：如果采用实际成本法，确认所选方法和场所占用费用。

---

## 第 5 节——第 1 级规则（数据明确时）

### 5.1 营业收入 [T1]

**法律依据：** ITAA 1997 Div 6

开展业务所得的所有金额。如果已注册 GST，则按不含 GST 的净额申报。如果未注册，则按总额申报。

### 5.2 一般扣除 [T1]

**法律依据：** ITAA 1997 s8-1

任何损失或支出，只要其发生是为了取得或产生应税收入，或是开展业务所必需发生的，即可在相应范围内扣除。该损失或支出不得具有私人、家庭或资本性质。

### 5.3 折旧 [T1]

**法律依据：** ITAA 1997 Div 40

| 方法 | 计算方式 |
|---|---|
| 余额递减法 | Base value x (days held / 365) x (200% / effective life) |
| 直线法 | Cost x (days held / 365) x (100% / effective life) |

小型企业实体（营业额 < $10M）：可以使用简化折旧——将所有价值超过 $20,000 的资产归入资产池，第一年按 15% 折旧，此后按 30% 折旧。

**资产即时核销：** 小型企业实体可立即扣除成本低于 $20,000（2024-25 年度）的资产。该门槛可能每年变化——请确认当前年度的标准。

### 5.4 养老金 [T1]

个人可扣除的供款上限为 $30,000 的优惠供款限额（如果同时受雇，则与雇主供款合并计算）。必须向养老金基金提交有效的“申报抵扣意向通知”，并且在提交纳税申报表或转存养老金之前收到确认。

### 5.5 HELP/HECS 偿还款 [T1]

| 偿还收入（2024-25 年度） | 比率 |
|---|---|
| 低于 $54,435 | 0% |
| $54,435 -- $62,850 | 1% |
| $62,851 -- $66,620 | 2% |
| $66,621 -- $70,618 | 2.5% |
| ...（逐级递增至） | ... |
| $151,201+ | 10% |

偿还收入 = 应税收入 + 应申报附加福利 + 净投资损失 + 应申报养老金。HELP 偿还款不可扣除。

### 5.6 申报与罚款 [T1]

| 项目 | 数值 |
|---|---|
| 自行申报截止日期 | 2025 年 10 月 31 日 |
| 税务代理申报截止日期 | 各不相同（通常为 2026 年 3 月至 5 月） |
| 未按时申报 | 每 28 天 $313，最多计 5 个期间（最高 $1,565） |
| 少缴税款罚款（未尽合理注意义务） | 少缴税款的 25% |
| 少缴税款罚款（鲁莽行为） | 少缴税款的 50% |
| 一般利息费用（GIC） | 每年约 11%（按季度变化） |

---

## 第 6 节——第 2 级目录（需要审核人员判断）

### 6.1 居家办公 [T2]

**两种方法（自 2022 年 7 月 1 日起）：**

| 方法 | 涵盖内容 | 额外申报项目 |
|---|---|---|
| 固定费率（67c/hr） | 电费、燃气费、电话费、互联网费、文具费、计算机/打印机墨水费 | 单独申报：技术设备折旧（计算机、显示器）、场所占用费用（如果有专用房间）、清洁费 |
| 实际成本 | 每项费用按实际业务使用比例单独申报 | 不包含固定费率部分 |

无论采用哪种方法：都必须保留居家工作时数的记录。固定费率法：可以使用任何合理的记录。实际成本法：需要收据和使用记录。

只有在您拥有专门划出且仅用作营业场所的区域时，场所占用费用（租金、房贷利息、市政费、房屋保险、土地税）才可扣除。这些费用与日常运营费用分开计算。

**审核人员注意事项：** 确认计算方法、小时数，以及是否适用房屋占用费用。

### 6.2 机动车辆 [T2]

| 方法 | 计算方式 | 记录 |
|---|---|---|
| 每公里计费法（88 澳分） | 最多 5,000 公里业务里程。无需收据。 | 对业务里程的合理估算 |
| 行车日志法 | 实际成本（包括折旧）的业务用途比例 | 连续 12 周的行车日志，有效期为 5 年 |

不得同时采用两种方法。对于业务行程，无论采用哪种方法，停车费、通行费和道路救援费均应单独计算并可扣除。

**审核人员注意事项：** 确认计算方法以及公里数/行车日志记录。

### 6.3 私人医疗保险（Medicare 附加税）[T2]

如果收入超过 $93,000（单身），且没有适当的私人住院保险，则适用 Medicare 附加税：

| 收入 | MLS 税率 |
|---|---|
| $93,001 -- $108,000 | 1% |
| $108,001 -- $144,000 | 1.25% |
| $144,001+ | 1.5% |

PHI 退税：根据收入水平确定的抵免，用于降低 PHI 保费。可通过降低保费或税收抵免的方式申领。

**审核人员注意事项：** 确认 PHI 状态和收入水平。

### 6.4 个人劳务收入（PSI）[T2]

如果收入主要是个人付出/技能的回报，而非来自经营个人劳务业务，则 PSI 规则会限制可扣除项目。不得从 PSI 中扣除租金、抵押贷款利息以及某些居家办公费用。

**审核人员注意事项：** 确认是否适用 PSI 规则（成果测试、非关联客户测试、雇员测试、营业场所测试）。

---

## 第 7 节 -- Excel 工作底稿模板

```
AUSTRALIAN INDIVIDUAL TAX RETURN -- Working Paper
Tax Year: 2024-25

A. INCOME
  A1. Business income (ABN income)                 ___________
  A2. Employment income (per income statement)     ___________
  A3. Interest income                              ___________
  A4. Dividend income (grossed up with franking)   ___________
  A5. Rental income (net)                          ___________
  A6. Other income                                 ___________
  A7. TOTAL ASSESSABLE INCOME                      ___________

B. DEDUCTIONS
  B1. Business expenses (direct)                   ___________
  B2. Home office (67c/hr or actual)               ___________
  B3. Motor vehicle (88c/km or logbook)            ___________
  B4. Travel (flights, accommodation)              ___________
  B5. Self-education                               ___________
  B6. Depreciation / instant asset write-off       ___________
  B7. Personal super contributions                 ___________
  B8. Income protection insurance                  ___________
  B9. Cost of managing tax affairs                 ___________
  B10. Donations (DGR)                             ___________
  B11. Other deductions                            ___________
  B12. TOTAL DEDUCTIONS                            ___________

C. TAXABLE INCOME (A7 - B12)                       ___________

D. TAX COMPUTATION
  D1. Tax on taxable income (Stage 3 rates)        ___________
  D2. Medicare levy (2%)                           ___________
  D3. Medicare levy surcharge (if applicable)      ___________
  D4. HELP/HECS repayment (if applicable)          ___________
  D5. Gross tax                                    ___________
  D6. Less: LITO                                   ___________
  D7. Less: SBITO (16%, max $1,000)                ___________
  D8. Less: Franking credits offset                ___________
  D9. Less: PHI rebate offset                      ___________
  D10. Less: PAYG instalments paid                 ___________
  D11. Less: PAYG withholding (employment)         ___________
  D12. TAX DUE / (REFUND)                          ___________

REVIEWER FLAGS:
  [ ] Residency status confirmed?
  [ ] Home office method and hours verified?
  [ ] Motor vehicle method confirmed?
  [ ] Instant asset write-off eligibility (SBE < $10M)?
  [ ] Super contribution notice of intent lodged?
  [ ] PHI status confirmed (MLS)?
  [ ] HELP debt status confirmed?
  [ ] All T2 items flagged?
```

---

## 第 8 节——银行对账单阅读指南

### 澳大利亚银行对账单格式

| 银行 | 格式 | 关键字段 |
|---|---|---|
| CBA, ANZ, Westpac, NAB | CSV, PDF | 日期、描述、借方、贷方、余额 |
| Macquarie, Suncorp, Bendigo | CSV | 日期、摘要、金额 |
| Up, ING, Ubank | CSV | 日期、描述、金额 |
| Wise, Revolut | CSV | 日期、描述、金额、币种 |

### 关键澳大利亚银行术语

| 术语 | 分类提示 |
|---|---|
| 直接贷记 | 收款——可能是收入 |
| 直接借记 | 定期支出——可能是费用 |
| EFTPOS | 销售点消费 |
| BPAY | 账单支付 |
| Osko / PayID | 快速支付——检查资金方向 |
| ATM | 现金取款——询问用途 |
| 已付利息 | 收入——单独申报 |
| 股息 | 收入——检查抵免税额 |

---

## 第 9 节——信息采集备用方案

```
ONBOARDING QUESTIONS -- AUSTRALIA INDIVIDUAL RETURN
1. Are you an Australian resident for tax purposes?
2. Do you have an active ABN and TFN?
3. Are you registered for GST?
4. What is your aggregated turnover? (for small business concessions)
5. Do you work from home? How many hours per year? Method preference (67c or actual)?
6. Do you use a vehicle for business? Method preference (cents/km or logbook)?
7. Any assets purchased this year? Cost?
8. Do you have private health insurance? Full year?
9. Do you have a HELP/HECS debt?
10. Are you also employed (PAYG income)?
11. Any personal super contributions made?
12. Prior year tax return / depreciation schedule available?
```

---

## 第 10 节——参考资料

### 主要法规

| 主题 | 参考依据 |
|---|---|
| 应税收入 | ITAA 1997 s6-1, s6-5 |
| 一般扣除 | ITAA 1997 s8-1 |
| 资本性与收益性 | ITAA 1997 s8-1(2)(a) |
| 折旧 | ITAA 1997 Div 40 |
| 小型企业实体 | ITAA 1997 Div 328 |
| 资产即时核销 | ITAA 1997 s328-180 |
| 居家办公 | ATO Practical Compliance Guideline PCG 2023/1 |
| 机动车辆 | ITAA 1997 s28-13, s28-15 |
| 养老金扣除 | ITAA 1997 Div 290 |
| 医疗保险税 | Medicare Levy Act 1986 |
| HELP 还款 | Higher Education Support Act 2003 |
| LITO | ITAA 1997 s61-1 |
| SBITO | ITAA 1997 s328-375 |

### 与 GST 的相互影响 [T1]

| 情形 | 所得税处理方式 |
|---|---|
| 销售时收取的 GST（已注册） | 不属于收入。按不含 GST 的净额申报。 |
| 已收回的 GST 抵免（ITC） | 不属于费用。按不含 GST 的净额申报。 |
| 未注册 GST | 采购时支付的 GST 属于成本的一部分。按含 GST 的总额申报。 |
| 私人用途部分的 GST | 不可抵扣的 GST 属于成本的一部分。 |

---

## 禁止事项

- 绝不允许将私人或家庭费用作为企业扣除
- 绝不允许独资经营者扣除招待费用（不可扣除）
- 使用每公里固定费率法时，绝不申报超过 5,000 公里
- 对于居家办公，除非有专门且仅用于经营的区域，否则绝不申报占用费用（租金、抵押贷款利息）
- 绝不能忘记就个人养老金缴款提交扣除意向通知
- 绝不将 HELP 还款申报为扣除
- 绝不将私人健康保险保费申报为扣除
- 未确认小型企业实体资格前，绝不适用资产即时核销
- 绝不将所得税或 GST 支付款项列为企业扣除
- 已注册 GST 时，绝不申报含 GST 的金额
- 绝不将税款计算结果表述为确定金额——始终标注为估算值

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或结果承担责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如您所在司法管辖区的 CPA、CA 或注册税务代理）审核并签字确认。

本技能最新且经过验证的版本由 [openaccountants.com](https://openaccountants.com) 维护。登录后即可访问最新版本、申请持牌会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/au-individual-return) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_