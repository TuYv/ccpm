---
name: albania-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Albanian VAT (TVSH) return for any client. Trigger on phrases like \"Albania VAT\", \"Albanian TVSH\", \"TVSH return\", \"DPT filing\", \"Albanian tax\", or any request involving Albanian VAT filing. Also trigger when classifying transactions for VAT purposes from bank statements, invoices, or other source data. This skill covers Albania only — standard TVSH payers filing monthly returns. Small business exemptions, free economic zones, agricultural compensation schemes, and margin schemes are in the refusal catalogue. MUST be loaded alongside vat-workflow-base v0.1 or later (for workflow architecture). ALWAYS read this skill before touching any Albanian VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/albania-vat"
  obligation: CT
---
# 阿尔巴尼亚增值税（TVSH）申报技能 v2.0

> **仅供一般参考。** 本技能是面向 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、选择、截止日期、税务居民身份、申报状态或当地程序进行审查。未经相关司法管辖区的合格专业人士审查，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

**在对任何内容进行分类之前，请完整阅读本节。工作流操作手册位于 `vat-workflow-base` 第 1 节 — 请遵循该操作手册，并使用本技能提供特定国家/地区的内容。**

| 字段 | 值 |
|---|---|
| 国家 | 阿尔巴尼亚（阿尔巴尼亚共和国） |
| 税种名称 | TVSH（Tatimi mbi Vleren e Shtuar） |
| 标准税率 | 20% |
| 优惠税率 | 6%（由认证机构提供的住宿/旅游服务），10%（农业投入品 — 肥料、农药、种子） |
| 零税率 | 0%（出口、国际运输、外交用品供应） |
| 申报表 | 月度 TVSH 申报表（电子申报） |
| 申报门户 | https://e-filing.tatime.gov.al |
| 主管机关 | 税务总局（DPT — Drejtoria e Pergjithshme e Tatimeve） |
| 币种 | 仅限 ALL（阿尔巴尼亚列克） |
| 申报频率 | 每月（所有 TVSH 纳税人） |
| 截止日期 | 报告月份次月 14 日 |
| 配套技能（第 1 层级，工作流） | **vat-workflow-base v0.1 或更高版本 — 必须加载** |
| 贡献者 | 开放会计技能注册库 |
| 验证者 | 待定 — 需要由持证阿尔巴尼亚税务专业人士验证 |
| 验证日期 | 2026 年 4 月（已通过网络核实；专业人士签核待完成） |

**TVSH 申报表关键栏次：**

| 栏次 | 含义 |
|---|---|
| 1 | 适用 20% 税率的应税供应 — 计税基础 |
| 2 | 适用 20% 税率的销项 TVSH |
| 3 | 适用 6% 税率的应税供应 — 计税基础 |
| 4 | 适用 6% 税率的销项 TVSH |
| 5 | 零税率供应（出口） |
| 6 | 免税供应 |
| 7 | 对境外服务自行计缴的 TVSH（反向征税）— 计税基础 |
| 8 | 反向征税的销项 TVSH |
| 9 | 销项 TVSH 总额（2 + 4 + 8） |
| 10 | 国内采购 — 计税基础 |
| 11 | 国内采购的进项 TVSH |
| 12 | 进口 — 海关完税价格 + 关税 |
| 13 | 进口环节已缴 TVSH |
| 14 | 固定资产购置 — 计税基础 |
| 15 | 固定资产的进项 TVSH |
| 16 | 反向征税的进项 TVSH（可抵扣） |
| 17 | 进项 TVSH 调整 |
| 18 | 进项 TVSH 总额（11 + 13 + 15 + 16 + 17） |
| 19 | 应缴 TVSH（若 9 > 18） |
| 20 | TVSH 留抵税额（若 18 > 9） |
| 21 | 上期结转的 TVSH 留抵税额 |
| 22 | 申请退税的 TVSH 留抵税额 |
| 23 | TVSH 应缴净额 |

**保守默认值 — 阿尔巴尼亚特定值：**

| 不明确事项 | 默认值 |
|---|---|
| 销售适用税率未知 | 20% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在国家未知 | 阿尔巴尼亚国内 |
| 业务使用比例未知（车辆、电话） | 0% 抵扣 |
| SaaS 开票实体未知 | 来自非居民的反向征税（栏次 7/8/16） |
| 是否属于不得抵扣进项税的情形未知（招待、个人用途） | 不得抵扣 |
| 交易是否属于征税范围未知 | 属于征税范围 |
| 旅游认证状态未知 | 20%（不适用 6%） |

**红旗阈值：**

| 阈值 | 数值 |
|---|---|
| HIGH 单笔交易金额 | ALL 500,000 |
| HIGH 单个保守性默认值的税额差异 | ALL 30,000 |
| MEDIUM 交易对手集中度 | 输出或输入的 >40% |
| MEDIUM 保守性默认值数量 | 整份申报表中 >4 |
| LOW TVSH 绝对净额头寸 | ALL 800,000 |

---

## 第 2 节 — 必需输入与拒绝处理目录

### 必需输入

**最低可行要求** — 当月银行对账单，格式可以是 CSV、PDF 或粘贴的文本。必须覆盖完整期间。接受任何阿尔巴尼亚银行的对账单：Banka Kombetare Tregtare (BKT)、Raiffeisen Bank Albania、Credins Bank、Intesa Sanpaolo Albania、OTP Bank Albania、Tirana Bank、Alpha Bank Albania 或任何其他银行。

**建议提供** — 销售发票（尤其是出口和零税率供应的发票）、任何进项 TVSH 申报金额超过 ALL 30,000 的采购发票，以及客户以书面形式提供的 NUIS/NIPT。

**理想情况** — 完整的财政化发票登记簿（来自 DPT e-Filing）、上一期间的 TVSH 申报表、采购簿和销售簿。

**缺少最低要求时的拒绝政策 — SOFT WARN。** 如果完全没有银行对账单，则立即停止。如果只有银行对账单而没有发票，可以继续处理，但必须在复核人员简报中记录：“此 TVSH 申报表仅根据银行对账单编制。复核人员必须核实进项 TVSH 申报具有财政化发票支持（包含 NIVF 代码），并且所有反向征税分类均与供应商发票一致。”

### 阿尔巴尼亚特定拒绝处理目录

**R-AL-1 — 小型企业／未登记实体尝试申报 TVSH。** *触发条件：* 客户营业额低于 ALL 10,000,000 且未自愿登记为增值税纳税人，或客户适用小型企业税制。*提示信息：* “未登记实体和适用小型企业税制的实体不能提交 TVSH 申报表或申报抵扣进项 TVSH。此技能仅适用于已登记的 TVSH 纳税人。”

**R-AL-2 — 自由经济区实体。** *触发条件：* 客户在指定的自由经济区（Spitalla、Koplik、Vlora）内运营。*提示信息：* “自由经济区实体适用特殊的 TVSH 处理，需要逐案分析。请上报给具备资质的阿尔巴尼亚税务专业人士处理。”

**R-AL-3 — 农业补偿计划。** *触发条件：* 客户是适用统一税率补偿计划的小型农业生产者。*提示信息：* “第 92 条规定的农业补偿计划对视同进项 TVSH 有特定规则。不在此技能的适用范围内。”

**R-AL-4 — 部分免税／按比例抵扣。** *触发条件：* 客户同时提供应税供应和免税供应，且免税比例并非微不足道。*提示信息：* “您的进项 TVSH 必须根据第 73 条按比例分摊。这需要进行年度比例计算。请由具备资质的专业人士确定可抵扣比例。”

**R-AL-5 — 差额征税计划。** *触发条件：* 客户根据差额征税计划经营二手商品、艺术品或古董。*提示信息：* “差额征税计划下的交易需要逐笔计算差额。不在适用范围内。”

**R-AL-6 — 所得税而非 TVSH。** *触发条件：* 用户询问的是阿尔巴尼亚所得税，而非 TVSH 申报表。*消息：*“此技能仅处理月度 TVSH 申报。如需处理阿尔巴尼亚所得税，请使用相应的所得税技能。”

---

## 第 3 节 — 供应商模式库（查找表）

这是确定性预分类器。当交易的交易对手与此表中的某个模式匹配时，直接应用相应的处理方式。匹配方式为：对银行对账单中显示的交易对手名称进行不区分大小写的子字符串匹配。

### 3.1 阿尔巴尼亚银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BKT, BANKA KOMBETARE TREGTARE | 银行收费/费用需 EXCLUDE | 金融服务，免税 |
| RAIFFEISEN, RAIFFEISEN BANK AL | 银行收费/费用需 EXCLUDE | 同上 |
| CREDINS, CREDINS BANK | 银行收费/费用需 EXCLUDE | 同上 |
| INTESA SANPAOLO AL, ISP ALBANIA | 银行收费/费用需 EXCLUDE | 同上 |
| OTP BANK AL, TIRANA BANK, ALPHA BANK | 银行收费/费用需 EXCLUDE | 同上 |
| INTERESA, INTEREST, KAMATA | EXCLUDE | 利息收入/支出，不在范围内 |
| KREDI, LOAN, HUADHENIE | EXCLUDE | 贷款本金变动，不在范围内 |

### 3.2 阿尔巴尼亚政府、监管机构及法定机构（全部排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| DPT, DREJTORIA E TATIMEVE | EXCLUDE | 税款支付，不属于供应 |
| DOGANA, CUSTOMS | EXCLUDE | 关税（但进口 TVSH 请参见方框 12/13） |
| ISSH, SIGURIMET SHOQERORE | EXCLUDE | 社会保险缴款 |
| QKR, QENDRA KOMBETARE E REGJISTRIMIT | EXCLUDE | 企业注册费 |
| BASHKIA, MUNICIPALITY | EXCLUDE | 地方政府费用 |
| TATIME, TAX OFFICE | EXCLUDE | 税款支付 |

### 3.3 阿尔巴尼亚公用事业

| 模式 | 处理方式 | 方框 | 备注 |
|---|---|---|---|
| OSHEE, OPERATORI SHPERNDARJES ENERGJISE | 境内 20% | 10/11 | 电力 — 间接费用 |
| UKT, UJESJELLESI | 境内 20% | 10/11 | 供水服务 |
| ALBTELEKOM, ALBtelecom | 境内 20% | 10/11 | 电信 — 间接费用 |
| ONE ALBANIA, VODAFONE AL | 境内 20% | 10/11 | 移动通信 |
| ALBAGAS, ALBPETROL | 境内 20% | 10/11 | 天然气/燃料供应 |

### 3.4 保险（免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SIGAL, SIGMA, INSIG | EXCLUDE | 保险，免税 |
| INTERSIG, ALBSIG, EUROSIG | EXCLUDE | 同上 |
| SIGURIM, INSURANCE, POLICA | EXCLUDE | 全部免税 |

### 3.5 邮政与物流

| 模式 | 处理方式 | 方框 | 备注 |
|---|---|---|---|
| POSTA SHQIPTARE | 标准邮政服务需 EXCLUDE | | 普遍邮政服务，免税 |
| POSTA SHQIPTARE (courier/parcel) | 境内 20% | 10/11 | 非普遍服务应税 |
| DHL ALBANIA, TNT, FedEx | 境内 20% | 10/11 | 快递服务，应税 |

### 3.6 运输

| 模式 | 处理方式 | 方框 | 备注 |
|---|---|---|---|
| ALBTRANSPORT, URBAN BUS | EXCLUDE | | 公共交通，免税 |
| TAXI, TRANSFER | 境内 20% | 10/11 | 本地出租车 |
| WIZZ AIR, TURKISH AIRLINES (international) | EXCLUDE / 0% | | 国际航班适用零税率 |

### 3.7 餐饮和娱乐（不得抵扣）

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| SUPERMARKET, CONAD, SPAR AL, NEPTUN | 默认不得抵扣进项 TVSH | 个人生活用品采购 |
| RESTAURANT, RESTORANT, BAR, KAFE | 默认不得抵扣 | 根据第 71(3) 条，娱乐支出不得抵扣 |
| HOTEL (non-tourism business) | 默认不得抵扣 | 娱乐/招待支出不得抵扣 |

### 3.8 SaaS——非居民供应商（反向征税，申报框 7/8/16）

阿尔巴尼亚不是欧盟成员国。所有境外 SaaS 提供商均属于非居民供应商，会触发反向征税。

| 匹配模式 | 开票实体 | 申报框 | 备注 |
|---|---|---|---|
| GOOGLE (Ads, Workspace, Cloud) | Google Ireland Ltd (IE) or Google LLC (US) | 7/8/16 | 反向征税 |
| MICROSOFT (365, Azure) | Microsoft Ireland or Microsoft Corp (US) | 7/8/16 | 反向征税 |
| ADOBE | Adobe Systems (IE or US) | 7/8/16 | 反向征税 |
| META, FACEBOOK ADS | Meta Platforms Ireland or Meta (US) | 7/8/16 | 反向征税 |
| SLACK, ZOOM, DROPBOX | 各类非居民实体 | 7/8/16 | 反向征税 |
| AWS, AMAZON WEB SERVICES | AWS EMEA SARL (LU) or AWS Inc (US) | 7/8/16 | 反向征税 |
| NOTION, ANTHROPIC, OPENAI, GITHUB, FIGMA, CANVA | 美国实体 | 7/8/16 | 反向征税 |

### 3.9 支付处理商

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| STRIPE (transaction fees) | 排除（免税） | 支付处理，金融服务 |
| PAYPAL (transaction fees) | 排除（免税） | 同上 |

### 3.10 专业服务（阿尔巴尼亚）

| 匹配模式 | 处理方式 | 申报框 | 备注 |
|---|---|---|---|
| NOTER, NOTAR, NOTARY | 境内 20% | 10/11 | 如用于经营目的，则可抵扣 |
| KONTABILIST, AUDITOR, EKSPERT KONTABEL | 境内 20% | 10/11 | 始终可抵扣 |
| AVOKAT, LAWYER, JURIST | 境内 20% | 10/11 | 如涉及企业法律事务，则可抵扣 |
| QKR fees | 排除 | | 政府收费，不属于供应 |

### 3.11 工资和社会保障（完全排除）

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| ISSH, SOCIAL INSURANCE, SIGURIME | 排除 | 社会/健康保险缴款 |
| PAGA, SALARY, RROGA | 排除 | 工资——不属于 TVSH 征税范围 |
| TAP, TATIM MBI TE ARDHURAT | 排除 | 所得税代扣款 |

### 3.12 房产和租金

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| QIRA (commercial, with TVSH invoice) | 境内 20% | 商业租赁，应税 |
| QIRA (residential, no TVSH) | 排除 | 住宅租赁，免税 |

### 3.13 内部转账和排除项

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| TRANSFERTE, INTERNAL, BRENDSHME | 排除 | 内部资金转移 |
| DIVIDENT, DIVIDEND | 排除 | 股息，不属于征税范围 |
| TERHEQJE, ATM, CASH WITHDRAWAL | 第 2 级——询问 | 默认排除；询问现金的实际用途 |

---

## 第 4 节——实例解析

以下是从一份假设的银行对账单中选取的六个分类实例，该对账单属于一名常驻地拉那的阿尔巴尼亚个体经营 IT 顾问。

### 示例 1——非居民 SaaS 反向征税（Notion）

**输入行：**
`03.04.2026 ; NOTION LABS INC ; DEBIT ; Monthly subscription ; USD 16.00 ; ALL 1,760`

**理由：**
Notion Labs Inc 是一家美国实体（第 3.8 节），未在阿尔巴尼亚注册。这属于从非居民处接受的服务。根据第 86 条适用反向征税：按 20% 的税率自行计提销项 TVSH，填入第 7/8 栏，并在第 16 栏申报进项 TVSH。对于完全应税的企业，净影响为零。

**输出：**

| 日期 | 交易对方 | 总额 | 净额 | 增值税 | 税率 | 栏次（进项） | 栏次（销项） | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 03.04.2026 | NOTION LABS INC | -1,760 | -1,760 | 352 | 20% | 16 | 7/8 | N | — | — |

### 示例 2 — 非居民 SaaS 反向征税（Google Ads）

**输入行：**
`10.04.2026 ; GOOGLE IRELAND LIMITED ; DEBIT ; Google Ads April 2026 ; -93,500 ; ALL`

**理由：**
Google Ireland Ltd 属于非居民（阿尔巴尼亚不是欧盟成员国）。按 20% 的税率适用反向征税。第 7 栏填写计税基础，第 8 栏填写销项 TVSH，第 16 栏填写可抵扣的进项 TVSH。双方金额均须在申报表中列示。

**输出：**

| 日期 | 交易对方 | 总额 | 净额 | 增值税 | 税率 | 栏次（进项） | 栏次（销项） | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | GOOGLE IRELAND LIMITED | -93,500 | -93,500 | 18,700 | 20% | 16 | 7/8 | N | — | — |

### 示例 3 — 业务招待，完全不得抵扣

**输入行：**
`15.04.2026 ; RESTORANT MULLIRI I VJETER ; DEBIT ; Business dinner ; -24,000 ; ALL`

**理由：**
餐厅交易。根据第 71(3) 条，娱乐和招待费用不得抵扣。无论是否出于业务目的，进项 TVSH 均不可抵扣。默认：全额不得抵扣。

**输出：**

| 日期 | 交易对方 | 总额 | 净额 | 增值税 | 税率 | 栏次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | RESTORANT MULLIRI I VJETER | -24,000 | -24,000 | 0 | — | — | Y | Q1 | "业务招待：不得抵扣" |

### 示例 4 — 购置固定资产

**输入行：**
`18.04.2026 ; NEPTUN SHPK ; DEBIT ; Laptop HP ProBook ; -175,000 ; ALL`

**理由：**
该物品是一台使用寿命超过 12 个月的笔记本电脑——根据阿尔巴尼亚会计准则，符合固定资产的认定条件。净计税基础填入第 14 栏，进项 TVSH 填入第 15 栏。必须持有包含 NIVF 代码的财政化发票。

**输出：**

| 日期 | 交易对方 | 总额 | 净额 | 增值税 | 税率 | 栏次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 18.04.2026 | NEPTUN SHPK | -175,000 | -145,833 | -29,167 | 20% | 14/15 | N | — | — |

### 示例 5 — 服务出口（零税率）

**输入行：**
`22.04.2026 ; STUDIO KREBS GMBH ; CREDIT ; IT consultancy March ; +385,000 ; ALL`

**理由：**
收到一家德国公司支付的 IT 咨询服务款项。属于服务出口——根据第 54 条适用零税率。净额填入第 5 栏。不产生销项 TVSH。相关进项 TVSH 可全额抵扣。需要：海关/出口文件或服务出口证明。

**输出：**

| 日期 | 交易对方 | 总额 | 净额 | 增值税 | 税率 | 栏次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 22.04.2026 | STUDIO KREBS GMBH | +385,000 | +385,000 | 0 | 0% | 5 | Y | Q2 (HIGH) | "核验出口文件" |

### 示例 6 — 机动车，不得抵扣

**输入行：**
`28.04.2026 ; AUTOSTAR SHPK ; DEBIT ; Car lease payment Hyundai ; -71,500 ; ALL`

**判断依据：**
汽车租赁付款。根据第 71(2) 条，乘用车辆的进项 TVSH 不得抵扣。仅出租车、租赁车队、驾驶学校和配送车辆可适用例外。IT 顾问不符合例外条件。默认处理：全额不得抵扣。

**输出：**

| 日期 | 交易对方 | 含税金额 | 净额 | VAT | 税率 | 栏次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 28.04.2026 | AUTOSTAR SHPK | -71,500 | -71,500 | 0 | — | — | Y | Q3 | "机动车：不得抵扣" |

---

## 第 5 节 — 第 1 层级分类规则（精简版）

### 5.1 标准税率 20%（第 56 条）

除非适用低税率、零税率或免税，否则任何应税供应均默认适用此税率。适用 20% 税率的销售额填入第 1/2 栏。适用 20% 税率的采购额填入第 10/11 栏。

### 5.2 低税率 6% — 住宿/旅游（第 56(1.1) 条）

仅适用于经认证的旅游机构（酒店、度假村、旅馆、农业旅游经营者）提供的住宿服务。服务提供者必须持有有效的旅游许可证。酒店内的餐厅、酒吧和水疗服务适用 20% 税率。适用 6% 税率的销售额填入第 3/4 栏。

### 5.3 低税率 10% — 农业投入品（第 56 条）

适用于化肥、农药、种子和种苗。适用范围较窄。

### 5.4 零税率（第 51-55 条）

向阿尔巴尼亚境外出口货物（需要海关出口申报单）。国际运输服务。向外交使团提供的供应。填入第 5 栏。

### 5.5 免税供应（第 51 条）

金融和银行服务、保险、医疗/牙科服务（须持有执照）、教育服务（须经认证）、住宅出租、邮政普遍服务、文化活动（公共利益）、博彩（单独征税）、殡葬服务、社会福利、农业用地、向阿尔巴尼亚银行供应黄金。不征收销项 TVSH，相关成本的进项 TVSH 不得抵扣。

### 5.6 境内采购 — 进项 TVSH

满足以下条件时，进项 TVSH 可以抵扣：(a) 商品/服务用于应税经营活动，(b) 持有有效的财政化发票（含 NIVF），(c) 已计入会计账簿，(d) 供应商已登记为 TVSH 纳税人。填入第 10 栏（计税基础）/第 11 栏（进项 TVSH）。固定资产填入第 14/15 栏。

### 5.7 反向征税 — 从非居民处取得的服务（第 86 条）

当客户从未在阿尔巴尼亚登记的非居民处取得服务，且供应地位于阿尔巴尼亚时：按 20% 自行计税。填入第 7 栏（计税基础）、第 8 栏（销项 TVSH）和第 16 栏（如有权抵扣，则填列进项 TVSH 抵免额）。对于完全从事应税业务的企业，净影响为零。

### 5.8 货物进口

进口到阿尔巴尼亚的货物：TVSH 由海关在边境征收。计税基础 = 海关完税价格 + 关税 + 消费税。税率为 20%（如适用低税率，则按低税率计征）。填入第 12 栏（计税基础）/第 13 栏（进项 TVSH）。可凭海关申报单作为证明予以抵扣。

### 5.9 不得抵扣的进项 TVSH（第 71 条）

除非另有明确说明，否则进项 TVSH 一律不得抵扣，且不适用例外：
- 乘用车辆：购买、租赁、燃油（出租车、租赁车队、驾驶学校和配送车队除外）— 第 71(2) 条
- 娱乐、招待和业务接待 — 第 71(3) 条
- 员工/董事的个人消费 — 第 71(4) 条
- 无有效财政化发票 — 第 69 条
- 用于免税经营活动的商品/服务 — 第 71 条
- 丢失/毁损的货物（不可抗力除外）— 第 71 条
- 员工住宿/餐饮（偏远工作地点除外）— 第 71 条

禁止抵扣类别优先于所有其他规则。请先检查是否属于禁止抵扣类别。

### 5.10 财政化要求（第 87/2019 号法律）

所有发票都必须通过财政化系统进行电子登记（自 2021 年起）。每张发票都会获得一个 NIVF 代码。未经财政化的发票可能导致进项 TVSH 抵扣被拒绝。

### 5.11 贷项通知单与退货（第 82 条）

卖方在当期冲减销项 TVSH。买方在当期冲减进项 TVSH。贷项通知单必须进行财政化。

---

## 第 6 节 — 第 2 层目录（精简版）

### 6.1 燃油和车辆费用

*模式：* Kastrati、Kurum、Shell、燃油收据。*信息不足的原因：* 车辆类型和用途未知。乘用车无论如何都禁止抵扣。*默认处理：* 抵扣比例为 0%。*问题：* “这是乘用车（禁止抵扣），还是专门用于经营活动的商用车辆？”

### 6.2 餐厅和招待娱乐

*模式：* 任何餐厅、咖啡馆、酒吧。*信息不足的原因：* 根据第 71(3) 条，招待娱乐费用属于明确禁止抵扣的类别。*默认处理：* 禁止抵扣。*问题：* “这是招待娱乐费用吗？（注意：无论如何都禁止抵扣——仅用于所得税记录。）”

### 6.3 账单主体不明确的 SaaS

*模式：* Google、Microsoft、Adobe、Meta 等。*信息不足的原因：* 银行对账单上未显示账单主体。*默认处理：* 反向征税，第 7/8/16 栏（对阿尔巴尼亚而言均为非居民）。*问题：* “能否查看发票上的法律实体名称？”

### 6.4 来自以所有者姓名命名的交易对手的大额整数入账转账

*模式：* 与客户姓名相符的大额整数入账。*默认处理：* 作为所有者注资予以排除。*问题：* “这是客户付款、您自己的资金，还是贷款？”

### 6.5 来自个人姓名的入账转账

*模式：* 来自看似个人交易对手的入账。*默认处理：* 按 20% 的国内销售处理，填入第 1/2 栏。*问题：* “这是销售收入吗？属于企业客户还是消费者？”

### 6.6 来自外国交易对手的入账转账

*模式：* 外国 IBAN 或外币。*默认处理：* 按零税率出口处理，填入第 5 栏。*问题：* “这笔款项是什么——出口销售、服务还是退款？您有出口证明文件吗？”

### 6.7 大额一次性采购（可能属于固定资产）

*模式：* 单张设备、笔记本电脑或机械发票。*默认处理：* 如果是使用寿命超过 12 个月的资产，填入第 14/15 栏；否则填入第 10/11 栏。*问题：* “这是使用寿命超过 12 个月的设备吗？”

### 6.8 混合用途的电话和互联网

*模式：* ONE Albania、Vodafone 个人线路、家庭用电。*默认处理：* 如果属于混合用途且未申报分摊比例，则抵扣比例为 0%。*问题：* “这是专用的企业线路，还是混合用途线路？”

### 6.9 向个人支付的转账

*模式：* 向个人姓名支付的转账。*默认处理：* 作为所有者提款予以排除。*问题：* “这是有发票的承包商付款、工资，还是个人转账？”

### 6.10 现金提取

*模式：* ATM、terheqje、现金提取。*默认处理：* 排除。*问题：* “这笔现金用于什么用途？”

### 6.11 租金付款

*模式：* 每月 qira、向姓名看似房东的人支付的租金。*默认处理：* 不计 TVSH，不得抵扣（默认按住宅处理）。*问题：* “这是商业地产吗？房东是否收取 TVSH？”

### 6.12 境外酒店及住宿

*模式：* 境外酒店。*默认处理：* 从进项 TVSH 中排除（非阿尔巴尼亚增值税）。*问题：* “这是商务旅行吗？”

### 6.13 适用 6% 税率的旅游业收入

*模式：* booking.com 付款、酒店/住宿收入。*默认处理：* 标记以供审核人员复核——核实旅游业资质认证。*问题：* “您是否持有有效的旅游业许可证？此次住宿是否少于 3 个月？”

---

## 第 7 节 — Excel 工作底稿模板

基础规范见 `vat-workflow-base` 第 3 节。本节提供阿尔巴尼亚特定的补充规范。

### 工作表 "Transactions"

A-L 列遵循基础规范。H 列（“申报框代码”）仅接受本技能第 1 节中的有效阿尔巴尼亚 TVSH 申报框代码。对于排除的交易，请留空。

### 工作表 "Box Summary"

```
Output:
| 1  | Taxable supplies 20% base | =SUMIFS(Transactions!E:E, Transactions!H:H, "1") |
| 2  | Output TVSH 20% | =Box_Summary!C[1_row]*0.20 |
| 3  | Taxable supplies 6% base | =SUMIFS(Transactions!E:E, Transactions!H:H, "3") |
| 4  | Output TVSH 6% | =Box_Summary!C[3_row]*0.06 |
| 5  | Zero-rated supplies | =SUMIFS(Transactions!E:E, Transactions!H:H, "5") |
| 6  | Exempt supplies | =SUMIFS(Transactions!E:E, Transactions!H:H, "6") |
| 7  | Reverse charge base | =SUMIFS(Transactions!E:E, Transactions!H:H, "7") |
| 8  | Output TVSH reverse charge | =Box_Summary!C[7_row]*0.20 |
| 9  | Total output TVSH | =C[2_row]+C[4_row]+C[8_row] |

Input:
| 10 | Domestic purchases base | =SUMIFS(Transactions!E:E, Transactions!H:H, "10") |
| 11 | Input TVSH domestic | =Box_Summary!C[10_row]*0.20 |
| 12 | Imports base | =SUMIFS(Transactions!E:E, Transactions!H:H, "12") |
| 13 | TVSH on imports | =SUMIFS(Transactions!F:F, Transactions!H:H, "12") |
| 14 | Fixed assets base | =SUMIFS(Transactions!E:E, Transactions!H:H, "14") |
| 15 | Input TVSH fixed assets | =Box_Summary!C[14_row]*0.20 |
| 16 | Input TVSH reverse charge | =Box_Summary!C[7_row]*0.20 |
| 17 | Adjustments | 0 |
| 18 | Total input TVSH | =SUM(C[11_row]:C[17_row]) |

Settlement:
| 19 | TVSH payable | =IF(C[9_row]>C[18_row], C[9_row]-C[18_row], 0) |
| 20 | TVSH credit | =IF(C[18_row]>C[9_row], C[18_row]-C[9_row], 0) |
| 21 | Credit from prior period | [manual entry] |
| 23 | Net payable | =MAX(C[19_row]-C[21_row], 0) |
```

### 工作表 "Return Form"

最终可用于 TVSH 申报的数据。最终结果单元格为第 23 框（应付净额）或第 20 框（留抵税额）。

---

## 第 8 节 — 阿尔巴尼亚银行对账单阅读指南

**CSV 格式约定。** BKT 和 Raiffeisen Albania 导出的文件通常使用分号作为分隔符，日期格式为 DD.MM.YYYY。常见列包括：Date、Description、Debit、Credit、Balance。务必确认适用的账户币种。

**阿尔巴尼亚语变体。** 某些描述以阿尔巴尼亚语显示：qira（租金）、paga/rroga（工资）、interesa/kamata（利息）、terheqje（取款）、transferte（转账）、blerje（购买）、shitje（销售）。按对应的英语含义处理。

**内部转账和排除项。** 客户本人在 BKT、Raiffeisen、Credins 的账户之间进行的转账。标记为 “transferte brendshme”、“own transfer”、“internal”。始终排除。

**退款和冲销。** 通过“rimbursim”“kthim”“reversal”“storno”识别。在原交易所在的同一栏中记为负数。

**外币交易。** 按交易当日阿尔巴尼亚银行的中间汇率折算为 ALL。

**IBAN 前缀。** AL = 阿尔巴尼亚。非 AL 的 IBAN 表示境外交易对手方——检查是否适用反向征税或出口规定。

**财政化代码。** 如果银行描述中包含 NIVF 参考编号，则该交易有财政化发票。如果没有，则标记为待核实。

---

## 第 9 节 — 入驻信息收集兜底方案（仅在推断失败时使用）

### 9.1 实体类型和经营名称
*推断规则：* 个体经营者的名称与账户持有人一致；公司名称以“SHPK”“SHA”结尾。*兜底问题：*“您是个体经营者还是公司（SHPK/SHA）？”

### 9.2 TVSH 登记状态
*推断规则：* 如果要求填报 TVSH 申报表，则其已登记。*兜底问题：*“您是已登记的 TVSH 纳税人吗？”

### 9.3 NUIS/NIPT
*推断规则：* 可能出现在付款描述中。*兜底问题：*“您的 NUIS/NIPT 是什么？”

### 9.4 申报期间
*推断规则：* 对账单上的交易日期范围（按月）。*兜底问题：*“这涵盖哪个月份？”

### 9.5 行业和部门
*推断规则：* 交易对手方构成、发票描述。*兜底问题：*“该企业从事什么业务？”

### 9.6 员工
*推断规则：* ISSH、对外工资转账。*兜底问题：*“您有员工吗？”

### 9.7 免税供应
*推断规则：* 医疗、金融、教育收入模式。*兜底问题：*“您是否有任何免征 TVSH 的销售？”*如果有且并非微不足道，则触发 R-AL-4。*

### 9.8 上期结转抵扣额
*推断规则：* 无法根据单个期间推断。始终询问。*问题：*“您是否有上月结转的 TVSH 抵扣额？（第 21 栏）”

### 9.9 跨境客户
*推断规则：* 收款中的境外 IBAN。*兜底问题：*“您是否有阿尔巴尼亚境外的客户？”

### 9.10 旅游业认证
*推断规则：* Airbnb/booking.com 付款、酒店收入。*兜底问题：*“您是否持有适用 6% 税率的旅游业许可证？”

---

## 第 10 节 — 参考资料

### 来源

**主要法律：**
1. 第 92/2014 号法律《阿尔巴尼亚共和国增值税法》（经修订）——第 3-6、11、25-30、51-56、68-73、76、82、86、105-107 条
2. 关于电子发票和财政化的第 87/2019 号法律

**DPT 指南：**
3. DPT TVSH 申报表及填写说明 — https://e-filing.tatime.gov.al
4. DPT 反向征税指南
5. DPT 财政化说明

**其他：**
6. 阿尔巴尼亚银行汇率 — https://www.bankofalbania.org

### 已知缺口

1. 供应商模式库涵盖常见的阿尔巴尼亚和国际交易对手方，但并未涵盖所有本地中小企业。
2. 旅游业优惠税率（6%）的适用类别经常发生法律变更——请核实当前适用性。
3. 农业投入品优惠税率（10%）的适用范围需要持续核实。
4. 自由经济区规则需要逐案分析。
5. 红旗阈值是保守的初始值，尚未经过实证校准。

### 变更日志

- **v2.0（2026年4月）：** 全面重写为 Malta v2.0 的 10 节结构。新增供应商模式库。新增完整示例。精简第 1 层规则。重构第 2 层目录。新增 Excel 模板规范。新增银行对账单阅读指南。将初始配置移至后备流程。
- **v1.1（2026年4月）：** 采用分步骤结构的初始技能。

### 自检（v2.0）

1. 顶部提供包含方框表格和保守默认值的快速参考：是。
2. 供应商库采用字面量查找表：是（13 个子表）。
3. 完整示例：是（6 个示例）。
4. 第 1 层规则已精简：是（11 条规则）。
5. 第 2 层目录已精简：是（13 项）。
6. Excel 模板规范：是。
7. 初始配置作为后备流程：是（10 项）。
8. 已包含全部 6 项阿尔巴尼亚特定的拒绝规则：是。
9. 参考资料位于底部：是。
10. 明确规定招待费用为硬性禁抵项：是。
11. 明确规定机动车辆为硬性禁抵项：是。
12. 明确规定财政化要求：是。
13. 明确规定反向征税（非居民服务）：是。
14. 无行内标签：是。

## 阿尔巴尼亚增值税（TVSH）技能 v2.0 结束

如果未同时加载配套文件 `vat-workflow-base` v0.1 或更高版本（第 1 层、工作流架构），本技能将不完整。

---

## 免责声明

本技能及其输出仅用于信息和计算目的，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或结果承担责任。所有输出在申报或据此采取行动之前，都必须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人员）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/albania-vat) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_