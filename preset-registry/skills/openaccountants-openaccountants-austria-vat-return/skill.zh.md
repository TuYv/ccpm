---
name: austria-vat-return
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Austrian VAT return (Umsatzsteuervoranmeldung / UVA) or annual declaration (Umsatzsteuererklärung / U1) for a self-employed individual or small business in Austria. Trigger on phrases like \"prepare UVA\", \"Austrian VAT return\", \"Umsatzsteuer\", \"classify transactions for Austrian VAT\", or any request involving Austria VAT filing. This skill covers Austria only, standard regime (Regelbesteuerung). Kleinunternehmerregelung, partial exemption, margin scheme (Differenzbesteuerung), and VAT groups (Organschaft) are in the refusal catalogue. MUST be loaded alongside BOTH vat-workflow-base v0.1 or later AND eu-vat-directive v0.1 or later. ALWAYS read this skill before touching any Austrian VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/austria-vat-return"
  obligation: CT
---
# 奥地利增值税申报技能（UVA / Umsatzsteuervoranmeldung）v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

**在对任何内容进行分类之前，请完整阅读本节。工作流操作手册位于 `vat-workflow-base` 第 1 节——请遵循该操作手册，并使用本技能提供国家/地区特定内容，使用 `eu-vat-directive` 提供欧盟指令内容。**

| 字段 | 值 |
|---|---|
| 国家 | 奥地利（Republik Österreich） |
| 标准税率 | 20% |
| 优惠税率 | 13%（文化活动、活体动物、植物、木柴、某些食品、国内航班），10%（食品和非酒精饮料、图书、客运、酒店、药品、农业） |
| 零税率 | 0%（出口、欧盟内部 B2B 货物供应） |
| 申报表 | UVA（Umsatzsteuervoranmeldung，按月/按季度）；U1（Umsatzsteuererklärung，年度） |
| 申报门户 | https://finanzonline.bmf.gv.at（FinanzOnline） |
| 主管机关 | Bundesministerium für Finanzen（BMF）/ Finanzamt |
| 货币 | 仅限 EUR |
| 申报频率 | 按月（上一年度营业额 > €100,000）；按季度（营业额 ≤ €100,000）；按年（U1，始终需要） |
| 截止日期 | UVA：申报期结束后第 2 个月的 15 日（例如，1 月申报截止日期为 3 月 15 日）；U1：4 月 30 日（纸质申报）或 6 月 30 日（电子申报） |
| 配套技能（第 1 层，工作流） | **vat-workflow-base v0.1 或更高版本——必须加载** |
| 配套技能（第 2 层，欧盟指令） | **eu-vat-directive v0.1 或更高版本——必须加载** |
| 贡献者 | Open Accountants 贡献者 |
| 验证日期 | 2026 年 4 月 |

**主要 UVA Kennzahlen（最常使用的字段代码）：**

| KZ | 含义 |
|---|---|
| 000 | 总收入（Gesamtbetrag der Bemessungsgrundlagen） |
| 001 | 欧盟内部货物供应（steuerfreie Lieferungen, Art. 6 Abs 1） |
| 017 | 其他免税收入（可抵扣） |
| 021 | 提供的欧盟内部服务（Art. 3a Abs 2） |
| 022 | 适用 20% 税率的销售额（Bemessungsgrundlage） |
| 029 | 适用 10% 税率的销售额 |
| 006 | 适用 13% 税率的销售额 |
| 037 | 适用 19% 税率的销售额（仅适用于 Jungholz/Mittelberg） |
| 057 | 反向征税——收到的建筑分包服务（Bauleistungen, § 19 Abs 1a） |
| 060 | 反向征税——其他境内交易（§ 19 Abs 1） |
| 065 | 欧盟内部采购（Art. 3 Abs 8）——20% |
| 066 | 欧盟内部采购——10% |
| 070 | 欧盟内部采购——新车辆 |
| 072 | 收到的欧盟内部服务（Art. 3a Abs 2） |
| 073 | 进口（Einfuhren）——自 2022 年起递延 |
| 060/065/072 | 均有相应的销项 USt 栏目 |
| 083 | 销项增值税总额（Gesamtbetrag der geschuldeten USt） |
| 060 | 可抵扣进项增值税（Gesamtbetrag der Vorsteuer）——实际上 KZ 060 有双重用途；请参阅表格 |
| KZ 060 (Vorsteuer) | 可抵扣进项增值税总额 |
| KZ 070 (Vorsteuern aus ig Erwerben) | 欧盟内部采购的进项增值税 |
| KZ 065 (USt ig Erwerb) | 欧盟内部采购的销项增值税 |
| 095 | 应付净额（Zahllast） |
| 090 | 超额抵免（Gutschrift） |

**关于奥地利 UVA 表格的说明：**奥地利 UVA 使用 Kennzahlen（KZ），而不是连续编号的栏位。其映射关系不如马耳他增值税申报表的布局直观。关键原则：每笔反向征税交易都有一个计税基础 KZ 和一个对应的销项 USt KZ，以及一个进项 Vorsteuer KZ。对于应税项目可全额抵扣的企业，反向征税的净影响为零。

**保守默认值——奥地利特定：**

| 不明确事项 | 默认值 |
|---|---|
| 销售适用税率未知 | 20% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在国家/地区未知 | 奥地利境内 |
| 欧盟客户属于 B2B 还是 B2C 未知 | B2C，按 20% 征税 |
| 业务用途比例未知 | 0% 抵扣 |
| SaaS 开票实体未知 | 来自非欧盟的反向征税 |
| 是否属于禁止抵扣的进项税未知 | 禁止抵扣 |
| 交易是否属于征税范围未知 | 属于征税范围 |

**红旗阈值：**

| 阈值 | 数值 |
|---|---|
| HIGH 单笔交易 | €5,000 |
| HIGH 采用保守默认值导致的税额差异 | €400 |
| MEDIUM 交易对手集中度 | >40% |
| MEDIUM 保守默认值使用次数 | >4 |
| LOW 净增值税头寸绝对值 | €10,000 |

---

## 第 2 节——必需输入和拒绝处理目录

### 必需输入

**最低可行要求**——该期间的银行对账单。可接受的来源包括：Erste Bank、Raiffeisen、BAWAG、Bank Austria (UniCredit)、Oberbank、Hypo banks、easybank、Revolut Business、Wise Business、N26 或任何其他银行。

**建议提供**——销售发票（尤其是欧盟内部交易和反向征税交易）、金额超过 €400 的采购发票、客户的 UID-Nummer（ATU + 8 位数字）。

**理想情况**——完整的发票登记簿、上一期 UVA、贷方余额（KZ 090）调节表。

### 奥地利特定拒绝处理目录

**R-AT-1——Kleinunternehmerregelung。** *触发条件：*客户适用小企业免税政策（营业额净额 ≤ €35,000，§ 6 Abs 1 Z 27 UStG）。*消息：*"Kleinunternehmer 无需收取 USt，且不能抵扣 Vorsteuer。他们无需申报 UVA。此技能仅适用于 Regelbesteuerung。如果您已选择纳税（Option zur Steuerpflicht），请予以确认。"

**R-AT-2——部分免税（Vorsteueraufteilung）。** *触发条件：*同时存在应税和免税供应，且并非金额微小。*消息：*"应税和免税供应并存时，需要根据 § 12 Abs 4–6 UStG 进行 Vorsteueraufteilung。请咨询 Steuerberater。"

**R-AT-3——Differenzbesteuerung（差额征税方案）。** *触发条件：*二手商品、艺术品、古董。*消息：*"Differenzbesteuerung 要求逐项计算差额。不在适用范围内。"

**R-AT-4——Organschaft（增值税集团）。** *触发条件：*客户属于 Organschaft。*消息：*"Organschaft 需要进行合并处理。不在适用范围内。"

**R-AT-5——税务代表。** *触发条件：*设有税务代表的非居民。*消息：*"设有税务代表的非居民——不在适用范围内。"

**R-AT-6——房地产（Grundstücksumsätze）。** *触发条件：*适用 USt 纳税选择权的房地产交易。*消息：*"Grundstücksumsätze 较为复杂。请咨询 Steuerberater。"

**R-AT-7——Jungholz/Mittelberg 特殊税率。** *触发条件：*客户在 Jungholz 或 Mittelberg 经营（19% 特殊税率）。*消息：*"Jungholz/Mittelberg 的 19% 税率（KZ 037）需要进行特殊处理。请标记为需要 Steuerberater 处理。"

**R-AT-8 — 所得税而非 USt。** *触发条件：* 用户询问的是 Einkommensteuer、Körperschaftsteuer，而不是 USt。*消息：* “此技能仅处理奥地利 USt（Umsatzsteuer）。”

---

## 第 3 节 — 供应商模式库（查找表）

使用不区分大小写的子字符串进行匹配。如果均不匹配，则转至第 5 节。

### 3.1 奥地利银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ERSTE BANK, SPARKASSE | 银行手续费 EXCLUDE | 金融服务，免税 |
| RAIFFEISEN, RAIFFEISENBANK | 银行手续费 EXCLUDE | 同上 |
| BAWAG, BAWAG PSK | 银行手续费 EXCLUDE | 同上 |
| BANK AUSTRIA, UNICREDIT AT | 银行手续费 EXCLUDE | 同上 |
| OBERBANK, BKS BANK, BTV | 银行手续费 EXCLUDE | 同上 |
| HYPO, HYPO TIROL, HYPO NOE | 银行手续费 EXCLUDE | 同上 |
| EASYBANK | 银行手续费 EXCLUDE | 同上 |
| REVOLUT, WISE, N26 (fee lines) | EXCLUDE | 检查是否存在应税订阅 |
| ZINSEN, HABENZINSEN, SOLLZINSEN | EXCLUDE | 利息，不在处理范围内 |
| KREDIT, DARLEHEN | EXCLUDE | 贷款本金 |

### 3.2 奥地利政府和法定机构（全部排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| FINANZAMT, FA, BMF | EXCLUDE | 税款缴纳（USt、ESt、KöSt） |
| FINANZONLINE | EXCLUDE | 税务门户付款 |
| SVS, SOZIALVERSICHERUNG DER SELBST | EXCLUDE | 自雇人士社会保险（SVS） |
| OEGK, OGK | EXCLUDE | 医疗保险 |
| AMS | EXCLUDE | 就业服务机构 |
| WKO, WIRTSCHAFTSKAMMER | EXCLUDE | 商会会费 |
| GERICHT, BEZIRKSGERICHT | EXCLUDE | 法院费用 |
| GEMEINDE, MAGISTRAT | EXCLUDE | 市政费用 |
| FIRMENBUCH, LANDESGERICHT | EXCLUDE | 公司登记 |

### 3.3 奥地利公用事业

| 模式 | 处理方式 | KZ | 备注 |
|---|---|---|---|
| WIEN ENERGIE | 境内 20% | Vorsteuer（进项税） | 电力/燃气 — 标准税率 |
| WIENER STADTWERKE | 境内 20% | Vorsteuer | 公用事业 |
| EVN | 境内 20% | Vorsteuer | 能源 |
| ENERGIE AG, LINZ AG | 境内 20% | Vorsteuer | 能源 |
| SALZBURG AG, KELAG, TIWAG, ILLWERKE | 境内 20% | Vorsteuer | 地区能源 |
| A1 TELEKOM, A1, TELEKOM AUSTRIA | 境内 20% | Vorsteuer | 电信 — 间接费用 |
| MAGENTA, T-MOBILE AUSTRIA | 境内 20% | Vorsteuer | 电信 |
| DREI, HUTCHISON DREI | 境内 20% | Vorsteuer | 电信 |
| WIENER WASSER, WASSERWERK | 境内 10% | Vorsteuer | 供水适用低税率 |

### 3.4 保险（免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| WIENER STADTISCHE, VIENNA INSURANCE | EXCLUDE | 保险，免税 |
| UNIQA, GENERALI AUSTRIA | EXCLUDE | 同上 |
| ALLIANZ AUSTRIA, ZURICH | EXCLUDE | 同上 |
| VERSICHERUNG, PRAEMIE | EXCLUDE | 所有保险均免税 |
| WUSTENROT | EXCLUDE | 住房储蓄机构/保险 |

### 3.5 邮政和物流

| 模式 | 处理方式 | KZ | 备注 |
|---|---|---|---|
| OSTERREICHISCHE POST, POST AG (standard) | 标准邮资 EXCLUDE | | 普遍服务免税 |
| POST AG (parcels) | 境内 20% | Vorsteuer | 非普遍服务，应税 |
| DHL EXPRESS AUSTRIA | 境内 20% | Vorsteuer | 快递服务 |
| DPD AUSTRIA, GLS AUSTRIA | 境内 20% | Vorsteuer | 快递服务 |

### 3.6 交通运输（奥地利境内）

| 匹配模式 | 处理方式 | KZ | 备注 |
|---|---|---|---|
| OBB, OSTERREICHISCHE BUNDESBAHNEN | 境内 10% | Vorsteuer | 铁路适用优惠税率 |
| WESTBAHN | 境内 10% | Vorsteuer | 铁路 |
| WIENER LINIEN | 境内 10% | Vorsteuer | 维也纳公共交通 |
| LINZ AG LINIEN, GRAZER LINIEN, IVB | 境内 10% | Vorsteuer | 区域公共交通 |
| UBER AT, UBER AUSTRIA | 境内 10% | Vorsteuer | 网约车，适用交通运输税率 |
| TAXI | 境内 10% | Vorsteuer | 当地出租车 |
| AUSTRIAN AIRLINES (domestic) | 境内 13% | Vorsteuer | 境内航班适用 13% 税率 |
| AUSTRIAN AIRLINES, RYANAIR (international) | 排除 / 0% | | 国际航班免税 |
| ASFINAG | 境内 20% | Vorsteuer | 高速公路通行费（Vignette/GO-Box） |

### 3.7 食品零售（除非属于餐旅服务企业，否则不得抵扣）

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| SPAR, INTERSPAR, EUROSPAR | 默认不得抵扣进项增值税 | 个人生活用品采购 |
| BILLA, BILLA PLUS, MERKUR | 默认不得抵扣 | 同上 |
| HOFER, LIDL, PENNY | 默认不得抵扣 | 同上 |
| MPreis, UNIMARKT | 默认不得抵扣 | 同上 |
| RESTAURANT, GASTHAUS, WIRTSHAUS, CAFE | 默认不得抵扣 | 招待费用——参见 5.12 |

### 3.8 SaaS——欧盟供应商（反向征税，Art. 3a Abs 2 / KZ 072）

| 匹配模式 | 开票实体 | KZ | 备注 |
|---|---|---|---|
| GOOGLE (Ads, Workspace, Cloud) | Google Ireland Ltd (IE) | 072 + Vorsteuer | 欧盟服务反向征税 |
| MICROSOFT (365, Azure) | Microsoft Ireland Operations Ltd (IE) | 072 + Vorsteuer | 同上 |
| ADOBE | Adobe Systems Software Ireland Ltd (IE) | 072 + Vorsteuer | 同上 |
| META, FACEBOOK ADS | Meta Platforms Ireland Ltd (IE) | 072 + Vorsteuer | 同上 |
| LINKEDIN (paid) | LinkedIn Ireland Unlimited (IE) | 072 + Vorsteuer | 同上 |
| SPOTIFY TECHNOLOGY | Spotify AB (SE) | 072 + Vorsteuer | 欧盟反向征税 |
| DROPBOX | Dropbox International Unlimited (IE) | 072 + Vorsteuer | 同上 |
| SLACK | Slack Technologies Ireland Ltd (IE) | 072 + Vorsteuer | 同上 |
| ATLASSIAN (Jira, Confluence) | Atlassian Network Services BV (NL) | 072 + Vorsteuer | 欧盟反向征税 |
| ZOOM | Zoom Video Communications Ireland Ltd (IE) | 072 + Vorsteuer | 同上 |
| STRIPE (subscription) | Stripe Technology Europe Ltd (IE) | 072 + Vorsteuer | 交易手续费免税——参见 3.11 |

### 3.9 SaaS——非欧盟供应商（反向征税，§ 19 Abs 1 / KZ 060）

| 匹配模式 | 开票实体 | KZ | 备注 |
|---|---|---|---|
| AWS (standard) | AWS EMEA SARL (LU) — 核查 | 072 + Vorsteuer | LU → 欧盟反向征税 |
| NOTION | Notion Labs Inc (US) | 060 + Vorsteuer | 非欧盟反向征税 |
| ANTHROPIC, CLAUDE | Anthropic PBC (US) | 060 + Vorsteuer | 非欧盟反向征税 |
| OPENAI, CHATGPT | OpenAI Inc (US) | 060 + Vorsteuer | 非欧盟反向征税 |
| GITHUB | GitHub Inc (US) | 060 + Vorsteuer | 核查 IE 实体 |
| FIGMA | Figma Inc (US) | 060 + Vorsteuer | 非欧盟 |
| CANVA | Canva Pty Ltd (AU) | 060 + Vorsteuer | 非欧盟 |
| HUBSPOT | HubSpot Inc (US) or IE — 核查 | 060 or 072 | 取决于开票实体 |
| TWILIO | Twilio Inc (US) | 060 + Vorsteuer | 非欧盟 |

### 3.10 SaaS — 例外情况

| 模式 | 处理方式 | 原因 |
|---|---|---|
| AWS EMEA SARL | 欧盟反向征税 KZ 072 + Vorsteuer（卢森堡实体） | 标准欧盟反向征税。如果发票上列有奥地利 USt，则按境内 20% 处理。 |

### 3.11 支付处理商

| 模式 | 处理方式 | 备注 |
|---|---|---|
| STRIPE（交易手续费） | EXCLUDE（免税） | 金融服务 |
| PAYPAL（交易手续费） | EXCLUDE（免税） | 同上 |
| STRIPE（订阅） | 欧盟反向征税 KZ 072 | 爱尔兰实体 |
| SUMUP, SQUARE, ZETTLE | 检查发票 | 如果是奥地利实体：境内 20%；如果是欧盟实体：反向征税 |

### 3.12 专业服务（奥地利）

| 模式 | 处理方式 | KZ | 备注 |
|---|---|---|---|
| STEUERBERATER, WIRTSCHAFTSPRUFER | 境内 20% | Vorsteuer | 始终可抵扣 |
| RECHTSANWALT, ANWALTSKANZLEI | 境内 20% | Vorsteuer | 企业法律事务 |
| NOTAR, NOTARIAT | 境内 20% | Vorsteuer | 企业公证费用 |
| UNTERNEHMENSBERATER, CONSULTANT | 境内 20% | Vorsteuer | 咨询 |
| BILANZBUCHHALTER | 境内 20% | Vorsteuer | 记账服务 |

### 3.13 工资和社会保障（全部排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SVS, SOZIALVERSICHERUNG | EXCLUDE | 自雇人士社会保险 |
| OEGK, GESUNDHEITSKASSE | EXCLUDE | 医疗保险 |
| GEHALT, LOHN, ENTGELT | EXCLUDE | 工资 |
| MITARBEITERVORSORGEKASSE, MVK | EXCLUDE | 员工公积金 |
| BETRIEBLICHE VORSORGE | EXCLUDE | 养老金 |

### 3.14 房产和租金

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BÜROMIETE, GESCHÄFTSLOKAL | 境内 20% | 选择征收 USt 的商业租赁 |
| MIETE, WOHNUNGSMIETE（住宅） | 境内 10% 或 EXCLUDE | 如果房东有 USt 纳税义务，住宅租金按 10% 处理；否则免税 |
| GRUNDSTEUER | EXCLUDE | 房产税 |
| GRUNDBUCH | EXCLUDE | 土地登记费 |

### 3.15 内部转账和排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| UMBUCHUNG, INTERN, EIGENUEBERWEISUNG | EXCLUDE | 内部资金划转 |
| DIVIDENDE | EXCLUDE | 不在征税范围内 |
| KREDITRÜCKZAHLUNG, TILGUNG | EXCLUDE | 偿还贷款 |
| BEHEBUNG, BARABHEBUNG | TIER 2 — 询问 | 默认排除 |
| PRIVATEINLAGE | EXCLUDE | 业主注资 |

---

## 第 4 节 — 完整示例

以下是来自一名假设的奥地利自雇 IT 顾问（个体经营者，常规征税）的六个完整分类示例。

### 示例 1 — 非欧盟 SaaS 反向征税（Notion）

**输入行：**
`03.04.2026 ; NOTION LABS INC ; DEBIT ; Monthly subscription ; USD 16.00 ; EUR 14.68`

**判断过程：**
美国实体（第 3.9 节）。依据 § 19 Abs 1 UStG 对非欧盟交易进行反向征税。客户自行计税：销项 USt 计入 KZ 060 区域，进项 Vorsteuer 可抵扣。净额为零。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | KZ（进项） | KZ（销项） | 默认？ | 问题？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 03.04.2026 | NOTION LABS INC | -14.68 | -14.68 | 2.94 | 20% | Vorsteuer | 060 | N | — | — |

### 示例 2 — 欧盟服务，反向征税（Google Ads）

**输入行：**
`10.04.2026 ; GOOGLE IRELAND LIMITED ; DEBIT ; Google Ads April 2026 ; -850.00 ; EUR`

**判断依据：**
爱尔兰实体——欧盟服务反向征税（Art. 3a Abs 2 UStG）。在 KZ 072 相关行申报销项 USt，可抵扣进项 Vorsteuer。净影响为零。

**输出：**

| 日期 | 交易对手 | 含税金额 | 净额 | VAT | 税率 | KZ（进项） | KZ（销项） | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | GOOGLE IRELAND LIMITED | -850.00 | -850.00 | 170.00 | 20% | Vorsteuer | 072 | N | — | — |

### 示例 3——奥地利业务招待费用

**输入行：**
`15.04.2026 ; GASTHAUS PURSTNER WIEN ; DEBIT ; Business dinner ; -220.00 ; EUR`

**判断依据：**
餐厅。在奥地利，Bewirtungsspesen（业务招待费用）可部分抵扣。如果用餐具有明确记录的业务目的，则商务用餐的 USt（Vorsteuer）可以抵扣。所得税方面：净额的 50% 可以抵扣。USt（Vorsteuer）方面：与业务相关部分的 USt 可 100% 抵扣（根据费用性质，通常为发票金额的 50% 或 100%）。实务中：如果活动属于业务招待，则整张发票的 Vorsteuer 可以全额抵扣。默认：阻止处理，并标记以供审核人员检查。

**输出：**

| 日期 | 交易对手 | 含税金额 | 净额 | VAT | 税率 | KZ | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | GASTHAUS PURSTNER WIEN | -220.00 | -220.00 | 0 | — | — | Y | Q1 | "业务招待：如有业务目的记录，则 Vorsteuer 可以抵扣。请确认。" |

### 示例 4——资本性资产（Anlagevermögen）

**输入行：**
`18.04.2026 ; DELL AUSTRIA GMBH ; DEBIT ; Laptop XPS 15 ; -1,595.00 ; EUR`

**判断依据：**
含税金额为 €1,595。在奥地利，购置成本净额 > €1,000 的资产（自 2023 年提高 GWG 门槛后）不属于 GWG（geringwertige Wirtschaftsgüter，低值资产），必须资本化。€1,595 / 1.20 = €1,329.17 > €1,000。因此属于 Anlagevermögen。Vorsteuer 可全额抵扣。如果用途发生变化，则需要进行 Vorsteuerberichtigung；动产调整期为 5 年，不动产调整期为 20 年。

**输出：**

| 日期 | 交易对手 | 含税金额 | 净额 | VAT | 税率 | KZ | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 18.04.2026 | DELL AUSTRIA GMBH | -1,595.00 | -1,329.17 | -265.83 | 20% | Vorsteuer | N | — | — |

### 示例 5——欧盟 B2B 服务销售

**输入行：**
`22.04.2026 ; STUDIO KREBS GMBH ; CREDIT ; Invoice AT-2026-018 IT consultancy ; +3,500.00 ; EUR`

**判断依据：**
向德国提供 B2B 服务——应税服务发生地为客户所在国。在 KZ 021（已提供的欧盟内部服务）中申报。不征收销项 USt。通过 VIES 验证德国 USt-IdNr。

**输出：**

| 日期 | 交易对手 | 含税金额 | 净额 | VAT | 税率 | KZ | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 22.04.2026 | STUDIO KREBS GMBH | +3,500.00 | +3,500.00 | 0 | 0% | 021 | Y | Q2 (HIGH) | "通过 VIES 验证德国 USt-IdNr" |

### 示例 6——机动车辆，Vorsteuerabzug

**输入行：**
`28.04.2026 ; PORSCHE BANK LEASING ; DEBIT ; Lease payment VW Golf ; -550.00 ; EUR`

**推理：**
汽车租赁。在奥地利，乘用车（PKW）的进项税（Vorsteuer）通常不可抵扣（§ 12 Abs 2 Z 2 lit b UStG）。例外：Fiskal-LKW（具有特定特征的轻型商用车辆——部分厢式车型已公布在 BMF 清单中）、出租车、驾校车辆、租赁车辆。VW Golf 属于 PKW，而非 Fiskal-LKW。默认：不可抵扣。

**输出：**

| 日期 | 交易对方 | 含税金额 | 不含税金额 | 增值税 | 税率 | KZ | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 28.04.2026 | PORSCHE BANK LEASING | -550.00 | -550.00 | 0 | — | — | Y | Q3 | "PKW：进项税不可抵扣。这是 Fiskal-LKW（在 BMF 清单中）吗？" |

---

## 第 5 节 — 第 1 层分类规则（精简版）

### 5.1 标准税率 20%（§ 10 Abs 1 UStG）

默认税率。销售 → KZ 022。采购 → 进项税。

### 5.2 优惠税率 10%（§ 10 Abs 2 UStG, Anlage 1）

食品和非酒精饮料（堂食和外带）、书籍（纸质和数字版）、药品、客运、酒店住宿（Beherbergung）、农业。销售 → KZ 029。采购 → 进项税。

### 5.3 优惠税率 13%（§ 10 Abs 3 UStG, Anlage 2）

文化活动（博物馆、音乐会、剧院、电影院）、活体动物、植物、薪柴、某些食品（生产商销售的葡萄酒）、国内航班。销售 → KZ 006。

### 5.4 零税率及可抵扣的免税项目

出口 → KZ 017。欧盟内部货物交易 → KZ 001。欧盟内部 B2B 服务 → KZ 021。

### 5.5 不可抵扣的免税项目（§ 6 Abs 1 UStG）

医疗、教育、保险、金融服务、住宅租赁（旧建筑）、邮政普遍服务。如金额重大 → **R-AT-2 拒绝处理**。

### 5.6 本地采购

符合规定的 Rechnung 可抵扣进项税。→ 进项税 KZ。

### 5.7 反向征税 — 欧盟服务（Art. 3a Abs 2 / § 19）

欧盟供应商 → KZ 072（计税基础 + 销项 USt）、进项税。净额为零。

### 5.8 反向征税 — 欧盟货物（innergemeinschaftlicher Erwerb）

欧盟货物 → KZ 065（计税基础 + 按 20% 计算的销项 USt）、进项税。税率为 10% 的货物还使用 KZ 066。

### 5.9 反向征税 — 非欧盟

非欧盟 → KZ 060（计税基础 + 销项 USt）、进项税。

### 5.10 反向征税 — 建筑服务（Bauleistungen）（§ 19 Abs 1a）

奥地利对建筑服务（Bauleistungen）实行国内反向征税。接收方通过 KZ 057 自行申报纳税。分包商开具不含 USt 的发票。这对奥地利建筑业非常重要。

### 5.11 资本性资产

GWG 门槛：不含税金额 €1,000（自 2023 年起）。超过该金额 → Anlagevermögen。进项税调整（Vorsteuerberichtigung）：动产为 5 年，不动产为 20 年。

### 5.12 不可抵扣的进项税（§ 12 Abs 2 UStG）

- PKW（乘用车）：进项税完全不可抵扣，除非属于 Fiskal-LKW（在 BMF 清单中）、出租车、驾校车辆或汽车租赁车辆。不可部分抵扣（不同于意大利的 40%）。
- PKW 的燃油：不可抵扣（跟随车辆的处理方式）。
- Fiskal-LKW 的燃油：可抵扣。
- 业务招待（Bewirtung）：在奥地利，商业招待的进项税可抵扣（不同于马耳他的完全禁止抵扣）。所得税：可抵扣 50%。USt：如用于商业目的，可全额抵扣进项税。
- 礼品：如果每位接收人每年超过 €40，进项税不可抵扣。
- 个人用途：不可抵扣。
- 烟草：不可抵扣。

### 5.13 适用 10% 税率的住宅租金

奥地利的住宅租金可能适用 10% USt（较旧建筑）或 20% USt（2012 年后建成的较新建筑，前提是房东选择征税）。部分住宅租金免税。具体处理取决于建筑年代和房东的选择。默认：如不确定，则标记 [T2]。

### 5.14 销售——境内本地销售

按 20%、10% 或 13% 征税。映射至 KZ 022/029/006。

### 5.15 销售——跨境 B2C

超过 €10,000 → **R-EU-5 OSS 拒绝处理**。

---

## 第 6 节——Tier 2 分类目录（精简版）

### 6.1 燃油和车辆费用

*特征：* OMV、BP、SHELL、AVIA、ENI、JET。*默认：* 不得抵扣（默认视为 PKW）。*问题：* “PKW 还是 Fiskal-LKW（BMF 清单）？”

### 6.2 餐饮和招待

*特征：* Gasthaus、Restaurant、Wirtshaus。*默认：* 不得抵扣（保守处理）。*问题：* “是否属于有业务目的的 Bewirtung？如有相关证明，Vorsteuer 可抵扣。”

### 6.3 无法明确判定的 SaaS

*默认：* 非欧盟反向征税 KZ 060。*问题：* “检查发票上的法律实体。”

### 6.4 所有者转账

*默认：* 作为 Privateinlage 排除。*问题：* “客户付款、自有资金还是贷款？”

### 6.5 来自个人的入账

*默认：* 境内 B2C，税率 20%。*问题：* “是否为销售收入？”

### 6.6 境外入账

*默认：* 境内交易，税率 20%。*问题：* “是提供 UID 的 B2B、B2C、货物还是服务？涉及哪个国家？”

### 6.7 大额采购

*默认：* 如果净额 > €1,000 → Anlagevermögen。*问题：* “确认发票总额。”

### 6.8 混合用途的电话和互联网

*默认：* 0%。*问题：* “专用于企业还是混合用途？”

### 6.9 向个人付款

*默认：* 排除。*问题：* “承包商费用、工资、退款还是个人用途？”

### 6.10 现金提取

*默认：* 排除。*问题：* “用途是什么？”

### 6.11 租金

*默认：* 标记 [T2]（无法确定适用 10%、20% 还是免税）。*问题：* “商业用途还是住宅用途？建筑年代？是否收取 USt？”

### 6.12 境外酒店

*默认：* 不计入 Vorsteuer。*问题：* “是否为商务旅行？”

### 6.13 Airbnb 收入

*默认：* 标记 [T2]。*问题：* “租期多长？是否属于适用 10% 税率的 Beherbergung？”

### 6.14 Bauleistungen 反向征税

*特征：* Bauunternehmen、建筑施工。*默认：* 标记 [T2]。*问题：* “是否为根据 § 19 Abs 1a Bauleistungen 适用反向征税的建筑分包商？”

### 6.15 平台销售

*默认：* 如果欧盟境内跨境销售额超过 €10,000 → R-EU-5。否则按境内交易适用 20% 税率。*问题：* “是否向奥地利境外销售？”

---

## 第 7 节——Excel 工作底稿模板（奥地利专用）

### 工作表 "Transactions"

H 列接受第 1 节中的 Kennzahl 代码。

### 工作表 "KZ Summary"

```
| 022 | Sales 20% base | =SUMIFS(...) |
| 029 | Sales 10% base | =SUMIFS(...) |
| 006 | Sales 13% base | =SUMIFS(...) |
| 001 | Intra-EU goods | =SUMIFS(...) |
| 021 | Intra-EU services provided | =SUMIFS(...) |
| 065 | Intra-EU acquisitions base | =SUMIFS(...) |
| 072 | EU services received base | =SUMIFS(...) |
| 060 | Non-EU reverse charge base | =SUMIFS(...) |
| 083 | Total output USt | =022*0.20 + 029*0.10 + 006*0.13 + USt on RC |
| Vorsteuer | Total deductible Vorsteuer | =SUM(input lines) |
| 095 | Zahllast (payable) | =MAX(0, 083-Vorsteuer) |
| 090 | Gutschrift (credit) | =MAX(0, Vorsteuer-083) |
```

### 强制重新计算步骤

```bash
python /mnt/skills/public/xlsx/scripts/recalc.py /mnt/user-data/outputs/austria-vat-<period>-working-paper.xlsx
```

---

## 第 8 节 — 奥地利银行对账单阅读指南

**CSV 格式惯例。** 奥地利银行导出的 CSV 使用分号作为分隔符，日期格式为 DD.MM.YYYY。常见列：Buchungsdatum、Umsatztext/Verwendungszweck、Betrag、Saldo。Erste Bank 使用 CAMT 格式；Raiffeisen 的格式因地区银行而异。

**德语用语变体。** Miete（租金）、Gehalt/Lohn（工资）、Zinsen（利息）、Überweisung（转账）、Beiträge（缴费）、Rechnung（发票）、Rückzahlung/Gutschrift（退款）、Einzahlung（存款）、Behebung/Abhebung（取款）。

**内部转账。** “Umbuchung”、“Eigenüberweisung”。排除。

**向 Finanzamt 支付的款项。** 税款支付会显示为“FINANZAMT”，并带有 Abgabenkontonummer。始终排除。

**向 SVS 支付的款项。** 自雇人士的社会保险（SVS）表现为按季度直接扣款。始终排除——这不属于应征增值税的供应。

**外币。** 按欧洲央行汇率换算为 EUR。

**IBAN 前缀。** AT = 奥地利。DE、NL、IE = 欧盟。US、GB、CH = 非欧盟。注意：CH（瑞士）属于非欧盟——这对于靠近瑞士边境的奥地利企业很重要。

---

## 第 9 节 — 初始配置的后备方案

### 9.1 实体类型
*推断：* GmbH = 公司；Einzelunternehmer/e.U. = 个体经营者；KG/OG = 合伙企业。*后备提问：*“Einzelunternehmer、GmbH 还是 KG？”

### 9.2 USt 制度
*后备提问：*“Regelbesteuerung 还是 Kleinunternehmerregelung？”

### 9.3 UID-Nummer
*后备提问：*“您的 UID-Nummer 是什么？（ATU + 8 位数字）”

### 9.4 申报期间
*后备提问：*“哪个月份或季度？”

### 9.5 行业
*后备提问：*“该企业从事什么业务？”

### 9.6 员工
*推断：* Gehalt 支出。*后备提问：*“有员工吗？”

### 9.7 免税供应
*后备提问：*“是否有任何免税销售？”*如果有 → R-AT-2。*

### 9.8 结转抵免额
*始终询问。*“上一期间是否有 USt 抵免额？（KZ 090）”

### 9.9 跨境客户
*后备提问：*“是否有奥地利境外的客户？欧盟/非欧盟？B2B/B2C？”

### 9.10 建筑业
*有条件提问：*“是否从事建筑业？（Bauleistungen 可能适用反向征税。）”

---

## 第 10 节 — 参考资料

### 来源

1. Umsatzsteuergesetz 1994 (UStG) — https://www.ris.bka.gv.at
2. Umsatzsteuerrichtlinien (UStR) 2000 — BMF 指南
3. BMF Fiskal-LKW 清单 — 定期更新
4. FinanzOnline UVA 表格及说明 — https://finanzonline.bmf.gv.at
5. Council Directive 2006/112/EC — 通过 eu-vat-directive 配套技能
6. VIES — https://ec.europa.eu/taxation_customs/vies/

### 已知缺口

1. 未复现 Fiskal-LKW 清单——请参考 BMF 发布的资料。
2. Bauleistungen 反向征税仅标记为 T2。
3. 住宅租赁税率（10%/20%/免税）取决于建筑年份——已简化。
4. GWG 阈值（自 2023 年起为净额 €1,000）——每年核实。
5. 完全拒绝采用 Jungholz/Mittelberg 的 19% 税率。
6. Bewirtung 的 Vorsteuer 可抵扣性需要相关文件——已标记。

### 变更日志

- **v2.0（2026 年 4 月）：** 按 Malta v2.0 结构全面重写。
- **v1.0/1.1：** 初始技能。

### 自检（v2.0）

1. 快速参考：是。2. 供应商库（15）：是。3. 完整示例（6）：是。4. 第 1 级（15）：是。5. 第 2 级（15）：是。6. Excel 模板：是。7. 入门引导（10）：是。8. 8 项拒绝情形：是。9. 参考资料：是。10. PKW 进项税抵扣限制与 Fiskal-LKW：是。11. 业务招待费的可抵扣性（奥地利与马耳他）：是。12. 建筑服务 § 19 Abs 1a：是。13. KZ 系统：是。14. GWG 门槛：是。15. 非欧盟反向征税 KZ 060：是。

## 奥地利增值税申报 Skill v2.0 结束

如果缺少以下任一配套文件，此 Skill 即不完整：`vat-workflow-base` v0.1+ 和 `eu-vat-directive` v0.1+。

---

## 免责声明

此 Skill 及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用此 Skill 而产生的任何错误、遗漏或后果承担责任。所有输出在申报或据此采取行动之前，都必须由合格的专业人士（例如 Steuerberater、Wirtschaftsprüfer 或具有同等资质的执业专业人士）审核并签字确认。

此 Skill 最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持牌会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/austria-vat-return) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_