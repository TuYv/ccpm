---
name: at-income-tax
description: "> Use this skill whenever asked about Austrian income tax (Einkommensteuer) for self-employed individuals filing form E1. Trigger on phrases like \"Einkommensteuer\", \"ESt\", \"E1 Erklarung\", \"Gewinnfreibetrag\", \"Betriebsausgabenpauschale\", \"Absetzbetrge\", \"Sonderausgaben\", \"selbstandig Steuer Osterreich\", \"Austrian income tax\", \"self-employed tax Austria\", or any question about computing or filing income tax for a self-employed person in Austria. This skill covers progressive tax brackets (0--55%), Gewinnfreibetrag, Betriebsausgabenpauschale, Sonderausgaben, aussergewohnliche Belastungen, Absetzbetrge, SV deductibility, and E1/E1a structure. ALWAYS read this skill before touching any Austrian income tax work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AT
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/at-income-tax"
  tax_year: 2025
  obligation: IT
---
# 奥地利所得税（ESt E1）——自雇人士技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。本文档尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报身份或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本文档进行申报、缴税、修正申报或采取任何税务立场。

---

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 奥地利（Republik Osterreich） |
| 税种 | 所得税（Einkommensteuer，ESt） |
| 货币 | 仅限 EUR |
| 纳税年度 | 日历年度 |
| 主要法律 | Einkommensteuergesetz 1988（EStG 1988） |
| 配套法律 | Bundesabgabenordnung（BAO）；GSVG；UStG 1994 |
| 税务机关 | Bundesministerium fur Finanzen（BMF） |
| 申报门户 | FinanzOnline（finanzonline.bmf.gv.at） |
| 申报截止日期 | 4 月 30 日（纸质申报）/ 6 月 30 日（FinanzOnline）/ 次年之后一年的 2 月底（通过 Steuerberater） |
| 贡献者 | Open Accountants Community |
| 验证者 | 待定——需要奥地利 Steuerberater 或 Wirtschaftsprufer 签字确认 |
| 验证日期 | 待定 |
| 技能版本 | 2.0 |

### 累进税率档次（2025 年，已根据冷累进调整）

| 应税所得（EUR） | 边际税率 |
|---|---|
| 0 -- 13,308 | 0% |
| 13,309 -- 21,617 | 20% |
| 21,618 -- 35,836 | 30% |
| 35,837 -- 69,166 | 40% |
| 69,167 -- 103,072 | 48% |
| 103,073 -- 1,000,000 | 50% |
| 超过 1,000,000 | 55% |

**55% 的税率最初是临时税率（2016—2025 年），并在 2025 年继续有效。**

### Gewinnfreibetrag（利润免税额）

| 利润范围（EUR） | 比例 | 是否需要投资？ |
|---|---|---|
| 0 -- 33,000 | 15% | 否（Grundfreibetrag，自动适用） |
| 33,001 -- 178,000 | 13% | 是（符合条件的资产/证券） |
| 178,001 -- 353,000 | 7% | 是 |
| 353,001 -- 583,000 | 4.5% | 是 |

GFB 上限：EUR 46,400。Grundfreibetrag（首笔 EUR 33,000 的 15% = 最高 EUR 4,950）自动适用。

### Betriebsausgabenpauschale（定额经营费用）

| 类别 | 比例 | 上限 |
|---|---|---|
| Gewerbebetrieb | 营业额的 12% | EUR 26,400 |
| 特定职业（作家、科学家、顾问） | 营业额的 6% | EUR 13,200 |

### E1/E1a 关键项目

| 项目 | 说明 |
|---|---|
| Betriebseinnahmen | 经营总收入 |
| Betriebsausgaben | 经营费用（实际费用或 Pauschale） |
| Gewinn | 净利润 |
| Gewinnfreibetrag | 利润免税额扣除 |
| Sonderausgaben | 特别费用（教会税、捐赠） |
| Absetzbetrge | 税收抵免 |
| Einkommensteuer | 应缴税款 |

### 保守默认值

| 不明确事项 | 默认值 |
|---|---|
| 收入类型未知 | Gewerbebetrieb（12% Pauschale） |
| 费用计算方法未知 | Betriebsausgabenpauschale |
| 经营用途比例未知 | 扣除比例为 0% |
| GFB 投资情况未知 | 仅适用 Grundfreibetrag（最高 EUR 4,950） |
| 机动车成本未知 | 上限为 EUR 40,000（Luxustangente） |

---

## 第 2 节——必需输入与拒绝事项目录

### 必需输入

**最低可行要求** -- 提供完整纳税年度的银行对账单，以及收入类型（Gewerbebetrieb 或 selbstandige Arbeit）和费用核算方法（实际费用或 Pauschale）的确认信息。

**建议材料** -- 所有发票、SVS 缴费记录、上一年度的 Steuerbescheid、资产登记表。

**理想材料** -- 上一年度完整的 E/A-Rechnung、Anlageverzeichnis、Vorauszahlungsbescheid，以及符合 GFB 要求的投资证明文件。

**缺少最低要求时拒绝处理 -- SOFT WARN。** 未提供银行对账单 = 立即停止。

### 拒绝处理目录

**R-AT-1 -- 公司（GmbH、AG）。** “此技能仅适用于自然人。Kapitalgesellschaften 需申报 Korperschaftsteuer。不在范围内。”

**R-AT-2 -- 合伙企业（OG、KG）。** “合伙企业收入需要单独核定。不在范围内。”

**R-AT-3 -- 非居民。** “非居民纳税适用不同规则。请升级处理。”

**R-AT-4 -- 集团纳税。** “集团结构不在范围内。”

**R-AT-5 -- Finanzamt 审计/申诉。** “请升级至 Steuerberater 处理。”

---

## 第 3 节 -- 交易模式库

这是确定性的预分类器。当银行对账单交易与下方某个模式匹配时，直接应用相应处理方式。如果没有匹配项，则转入第 5 节的第 1 层规则。

### 3.1 收入模式（贷方）

| 模式 | 税务项目 | 处理方式 | 备注 |
|---|---|---|---|
| UBERWEISUNG [client], ZAHLUNG, HONORAR | Betriebseinnahmen | 营业收入 | 如果已登记 USt，则提取净额 |
| GEHALT, LOHN, DIENSTGEBER | Einkünfte nichtselbstandige Arbeit | 非自雇收入 | 雇佣收入 -- 单独处理 |
| MIETEINNAHME | Einkünfte Vermietung | 非自雇收入 | 租金收入 |
| ZINSEN, KAPITALERTRAG, DIVIDENDE | Einkünfte Kapitalvermögen | 非自雇收入 | 资本收入 -- KESt 27.5% |
| STRIPE PAYOUT, PAYPAL PAYOUT | Betriebseinnahmen | 营业收入 | 平台付款 |
| FINANZAMT GUTSCHRIFT, STEUERERSTATTUNG | 排除 | 不属于收入 | 退税 |

### 3.2 费用模式（借方）-- 可全额扣除

| 模式 | 类别 | 处理方式 | 备注 |
|---|---|---|---|
| BÜROMIETE, GESCHÄFTSLOKAL, OFFICE RENT | Raumkosten | 可全额扣除 | 专用经营场所 |
| BERUFSHAFTPFLICHT, VERSICHERUNG (business) | Versicherung | 可全额扣除 | 职业保险 |
| STEUERBERATER, WIRTSCHAFTSPRÜFER, BUCHHALTER | Beratungskosten | 可全额扣除 | |
| RECHTSANWALT, NOTAR (business) | Rechtskosten | 可全额扣除 | |
| BÜROMATERIAL, SCHREIBWAREN | Bürobedarf | 可全额扣除 | |
| WERBUNG, MARKETING, GOOGLE ADS | Werbekosten | 可全额扣除 | |
| FORTBILDUNG, SEMINAR, KURS | Fortbildungskosten | 可全额扣除 | 与当前职业相关 |
| KAMMERBEITRAG, WKO | Pflichtbeiträge | 可全额扣除 | 强制性商会会费 |
| KONTOFÜHRUNG, BANKSPESEN | Bankspesen | 可全额扣除 | 企业账户 |
| STRIPE FEE, PAYPAL FEE | Transaktionskosten | 可全额扣除 | |
| SOFTWARE, LIZENZ, SUBSCRIPTION (under EUR 1,000) | IT-Kosten | 可全额扣除 | 低于 EUR 1,000 时作为 GWG |

### 3.3 费用模式 -- SVS（Sozialversicherung）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SVS, SVA, SOZIALVERSICHERUNG | 可作为 Betriebsausgabe 全额扣除 | 在计算 Gewinnfreibetrag 之前扣除 |
| KRANKENVERSICHERUNG (SVS) | 可全额扣除 | SVS 的一部分 |
| PENSIONSVERSICHERUNG (SVS) | 可全额扣除 | SVS 的一部分 |
| UNFALLVERSICHERUNG (SVS) | 可全额扣除 | 每月固定金额 |

### 3.4 支出模式——差旅

| 模式 | 类别 | 处理方式 | 备注 |
|---|---|---|---|
| FLUG, AUA, RYANAIR, EASYJET | Reisekosten | 可全额扣除 | 商业用途 |
| HOTEL, BOOKING.COM | Reisekosten | 可全额扣除 | 商务旅行 |
| ÖBB, WESTBAHN | Reisekosten | 可全额扣除 | 商务旅行 |
| TAXI, UBER, BOLT | Reisekosten | 可全额扣除 | 商业用途 |
| TAGESGELD, DIÄTEN | Reisekosten | 国内每天 EUR 26.40 | 每日津贴标准 |
| TANKSTELLE, OMV, BP, SHELL | Kfz-Kosten | T2——仅限商业用途占比 | |

### 3.5 支出模式——不可扣除

| 模式 | 处理方式 | 备注 |
|---|---|---|
| RESTAURANT (purely social) | 不可扣除 | 无 Werbezweck 的招待支出 |
| BEWIRTUNG (with Werbezweck) | 可扣除 50% | 必须记录商业目的 |
| PRIVAT, LEBENSMITTEL, SUPERMARKT | 不可扣除 | 个人生活费用 |
| STRAFE, GELDBUSSE | 不可扣除 | 罚款 |
| EINKOMMENSTEUER, ESt VORAUSZAHLUNG | 不可扣除 | 所得税 |
| PRIVATENTNAHME | 不可扣除 | 业主提款 |

### 3.6 资本性项目

| 模式 | 使用年限 | 年折旧率 | 备注 |
|---|---|---|---|
| COMPUTER, LAPTOP, PC | 3 年 | 33.3% | |
| DRUCKER, SCANNER | 5 年 | 20% | |
| BÜROMÖBEL, SCHREIBTISCH | 10 年 | 10% | |
| KFZ, AUTO (business) | 8 年 | 12.5% | Luxustangente：上限为 EUR 40,000 |
| GEBÄUDE (commercial) | 33 年 | 3% | |
| GWG (under EUR 1,000 net) | 立即扣除 | 100% | Geringwertiges Wirtschaftsgut |

### 3.7 排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| EIGENÜBERWEISUNG, INTERNAL | 排除 | 自有账户之间的转账 |
| DARLEHEN, KREDIT, TILGUNG | 排除 | 贷款本金 |
| KREDITZINSEN (business) | 可扣除 | 商业贷款利息 |
| USt ZAHLUNG | 从损益表中排除 | USt 属于资产负债表项目 |
| ESt VORAUSZAHLUNG | 排除 | 不属于费用；为税务评估而跟踪 |

### 3.8 奥地利银行——对账单格式参考

| 银行 | 格式 | 关键字段 | 备注 |
|---|---|---|---|
| Erste Bank, Sparkasse | CSV, PDF | Buchungsdatum, Text, Betrag, Saldo | George 网上银行导出 |
| Raiffeisen | CSV, PDF | Datum, Buchungstext, Betrag | Raiffeisen ELBA 导出 |
| Bank Austria (UniCredit) | CSV, PDF | Datum, Verwendungszweck, Betrag | |
| BAWAG, easybank | CSV, PDF | Datum, Text, Betrag | |
| N26, Revolut | CSV | Date, Counterparty, Amount | 数据整洁 |

---

## 第 4 节——完整示例

### 示例 1——客户付款（已注册 USt）

**输入行：**
`15.03.2025 ; Erste Bank Gutschrift ; DESIGN STUDIO WIEN ; Honorar März ; +3,600.00 ; EUR`

**分析：**
客户付款。如果已注册 USt（20% USt），则总额为 EUR 3,600。净额 = EUR 3,000（Betriebseinnahme）+ EUR 600 USt。如果是 Kleinunternehmer，则全部为 EUR 3,600。

**分类：** Betriebseinnahmen = EUR 3,000（若为 Kleinunternehmer，则为 EUR 3,600）。

### 示例 2 -- SVS 缴费

**输入行：**
`15.02.2025 ; Raiffeisen Lastschrift ; SVS BEITRAG Q1 ; -2,150.00 ; EUR`

**判断依据：**
SVS（社会保险）。可作为 Betriebsausgabe 全额扣除。在计算 Gewinnfreibetrag 之前扣除。

**分类：** Betriebsausgabe -- SVS。可全额扣除。

### 示例 3 -- Bewirtung（可扣除 50%）

**输入行：**
`22.04.2025 ; Erste Kartenzahlung ; RESTAURANT STEIRERECK ; Geschäftsessen ; -180.00 ; EUR`

**判断依据：**
商务招待。在奥地利，如果已明确记录 Werbezweck（广告/商业目的），则可扣除 50%。纯社交性质 = 0%。

**分类：** T2 -- 如果已记录商业目的，则可扣除 50%（EUR 90）。标记供审核人员审查。

### 示例 4 -- GWG 即时费用化

**输入行：**
`03.06.2025 ; Bank Austria Karte ; IKEA WIEN ; BÜROSTUHL ; -790.00 ; EUR`

**判断依据：**
办公椅净价 EUR 790。低于 EUR 1,000 的 GWG 门槛。可立即全额扣除。

**分类：** Betriebsausgabe。可在购买年度全额扣除。

### 示例 5 -- Luxustangente（车辆）

**输入行：**
`01.07.2025 ; Raiffeisen ; KFZ LEASING GMBH ; Leasingrate PKW ; -650.00 ; EUR`

**判断依据：**
车辆租赁。出于 AfA 目的，成本上限为 EUR 40,000（Luxustangente）。如果汽车成本为 EUR 55,000，则仅按 EUR 40,000 / 8 年 = EUR 5,000/年 x 商业使用比例计算。运营成本也按相同比例受到限制。

**分类：** T2 -- 确认车辆成本、Luxustangente 的适用情况以及商业使用比例。

### 示例 6 -- Kirchenbeitrag（Sonderausgabe）

**输入行：**
`15.03.2025 ; Erste Lastschrift ; ERZDIÖZESE WIEN ; Kirchenbeitrag ; -400.00 ; EUR`

**判断依据：**
教会税。属于 Sonderausgabe，上限为 EUR 600/年。并非 Betriebsausgabe。

**分类：** Sonderausgabe（EUR 400，未超过 EUR 600 的上限）。不计入 Betriebsausgaben。

---

## 第 5 节 -- Tier 1 规则（数据明确时）

### 5.1 利润计算

收入减去 Betriebsausgaben（实际费用或 Pauschale，不得同时采用），再减去 SVS，即为 Gewinn。然后应用 Gewinnfreibetrag。

### 5.2 Betriebsausgabenpauschale 规则

- 可替代实际费用。二者择一，不得同时采用。
- 在 Pauschale 之外，仍可额外扣除 SVS 和 GFB。
- Gewerbebetrieb 适用 12%（最高 EUR 26,400）；某些专业职业适用 6%（最高 EUR 13,200）。

### 5.3 AfA 比率

| 资产 | 使用年限 | 比率 |
|---|---|---|
| 计算机硬件/软件 | 3 年 | 33.3% |
| 办公家具 | 10 年 | 10% |
| 机动车辆 | 8 年 | 12.5% |
| 厂房/机器设备 | 5-15 年 | 6.7%-20% |
| 商业建筑 | 33 年 | 3% |
| GWG（净价低于 EUR 1,000） | 立即扣除 | 100% |

Halbjahresregel：如果在下半年购置，则只能计提半年的 AfA。

### 5.4 Luxustangente

机动车辆的 AfA 计提基数上限为 EUR 40,000。如果汽车成本为 EUR 55,000，则仅按 EUR 40,000 计提 AfA。

### 5.5 Sonderausgaben

| 项目 | 限额 |
|---|---|
| Kirchenbeitrag | EUR 600/年 |
| Spenden（列名机构） | 上一年度收入的 10% |
| Steuerberatungskosten | 无上限（也符合 Betriebsausgabe 的条件） |
| Sonderausgabenpauschale（默认） | EUR 60/年 |

### 5.6 Absetzbetrge（税收抵免）

| 抵免项目 | 欧元 | 条件 |
|---|---|---|
| Alleinverdienerabsetzbetrag | 572（无子女）至 746+ | 配偶收入最高为 6,937 欧元 |
| Alleinerzieherabsetzbetrag | 572+ | 单亲家长 |
| Verkehrsabsetzbetrag | 463 | 通勤者（同时受雇时） |
| Kindermehrbetrag | 最高 700 | 有子女的低收入者 |

### 5.7 Vorauszahlungen（按季度预缴）

截止日期：2 月 15 日、5 月 15 日、8 月 15 日、11 月 15 日。基于最近的 Bescheid。

### 5.8 处罚

| 违规行为 | 处罚 |
|---|---|
| 逾期申报（Verspatungszuschlag） | 最高为核定税额的 10% |
| 逾期付款（Sumniszuschlag） | 首次为 2% |
| 多次逾期付款 | 每次 +1%（第 2 次、第 3 次） |

---

## 第 6 节——第 2 级项目清单（需要审核人员判断）

### 6.1 Investitionsbedingter Gewinnfreibetrag

需要购买符合条件的有形资产（使用寿命 4 年以上）或符合条件的 Wertpapiere。标记给审核人员以确认投资。

### 6.2 居家办公（Arbeitszimmer）

必须是专用房间，并且是专业活动的中心。混合用途不符合条件。按建筑面积比例分摊。

### 6.3 车辆的业务用途

Luxustangente 为 40,000 欧元。业务使用比例需要相关记录。运营成本按比例分摊。

### 6.4 Bewirtung

如果有记录证明 Werbezweck，可扣除 50%。如果纯属社交用途，则不可扣除。标记给审核人员。

### 6.5 Pauschale 与实际费用比较

如果实际费用可能比 Pauschale 产生更优结果，则标记给审核人员。

### 6.6 Aussergewohnliche Belastungen

超过 Selbstbehalt（收入的 6%–12%）的部分可扣除。包括医疗、残障、灾害相关支出。需要提供相关记录。

---

## 第 7 节——Excel 工作底稿模板

```
AUSTRIA INCOME TAX -- E1 WORKING PAPER
Tax Year: 2025
Client: ___________________________
Income Type: Gewerbebetrieb / Selbständige Arbeit
Expense Method: Actual / Pauschale

A. BETRIEBSEINNAHMEN
  A1. Umsatzerlöse (net of USt if registered)    ___________
  A2. Sonstige Einnahmen                          ___________
  A3. Total                                        ___________

B. BETRIEBSAUSGABEN
  B1. SVS Beiträge                                ___________
  B2. Actual expenses OR Pauschale (12%/6%)       ___________
  B3. AfA (Abschreibungen)                        ___________
  B4. Total Betriebsausgaben                      ___________

C. GEWINN (A3 - B4)                               ___________

D. GEWINNFREIBETRAG
  D1. Grundfreibetrag (15% x first EUR 33,000)   ___________
  D2. Investitionsbedingter GFB                    ___________
  D3. Total GFB                                    ___________

E. SONDERAUSGABEN
  E1. Kirchenbeitrag (max EUR 600)                ___________
  E2. Spenden                                      ___________
  E3. Total                                        ___________

F. EINKOMMEN (C - D3 - E3)                        ___________

G. TAX (apply brackets to F)                       ___________

H. ABSETZBETRÄGE                                   ___________

I. EINKOMMENSTEUER (G - H)                         ___________

REVIEWER FLAGS:
  [ ] Income type confirmed (Gewerbe/Selbständig)?
  [ ] Expense method confirmed (actual/Pauschale)?
  [ ] SVS contributions confirmed?
  [ ] Qualifying investments for GFB confirmed?
  [ ] Luxustangente applied if vehicle?
  [ ] Bewirtung documented with Werbezweck?
```

---

## 第 8 节——银行对账单阅读指南

### 奥地利银行对账单格式

| 银行 | 格式 | 关键字段 | 备注 |
|---|---|---|---|
| Erste Bank / Sparkasse | CSV, PDF (George) | Buchungsdatum, Text, Betrag | George 导出的 CSV 格式整洁 |
| Raiffeisen | CSV, PDF (ELBA) | Datum, Buchungstext, Betrag | 各地区的 Raiffeisen 银行有所不同 |
| Bank Austria (UniCredit) | CSV, PDF | Datum, Verwendungszweck, Betrag | |
| BAWAG / easybank | CSV, PDF | Datum, Text, Betrag | |
| N26 / Revolut | CSV | Date, Counterparty, Amount | 新型数字银行格式 |

### 奥地利银行业务关键术语

| 术语 | 英文 | 提示 |
|---|---|---|
| Gutschrift | Credit | 可能是收入 |
| Lastschrift | Direct debit | 支出 |
| Überweisung | Transfer | 检查资金流向 |
| Dauerauftrag | Standing order | 定期支出 |
| Bankomat | ATM withdrawal | 询问用途 |
| Kontoführung | Account maintenance | 银行费用 |

---

## 第 9 节——引导流程后备方案

```
ONBOARDING QUESTIONS -- AUSTRIA INCOME TAX
1. Income type: Gewerbebetrieb or selbständige Arbeit?
2. Expense method: actual Betriebsausgaben or Pauschale?
3. Family status: single, Alleinverdiener, Alleinerzieher?
4. SVS contributions: total paid in the year?
5. Home office: dedicated room? Floor area %?
6. Vehicle: Luxustangente applicable? Business %?
7. Qualifying investments for Gewinnfreibetrag?
8. Kirchenbeitrag paid?
9. Other income (employment, rental, capital)?
10. Prior year Steuerbescheid available?
```

---

## 第 10 节——参考资料

### 关键法规

| 主题 | 参考依据 |
|---|---|
| 税率档位 | EStG 1988, s.33（根据冷累进进行调整） |
| Gewinnfreibetrag | EStG 1988, s.10 |
| Betriebsausgabenpauschale | EStG 1988, s.17 |
| Betriebsausgaben | EStG 1988, s.4 Abs 4 |
| AfA | EStG 1988, s.7, s.8 |
| GWG | EUR 1,000 净额门槛 |
| Luxustangente | EUR 40,000 |
| Sonderausgaben | EStG 1988, s.18 |
| Absetzbetrge | EStG 1988, s.33 |
| SVS 可扣除性 | GSVG; EStG s.4 Abs 4 |
| 申报截止日期 | BAO; EStG |

### 测试套件

**测试 1——中等收入，实际支出。**
输入：Gewerbebetrieb，营业额 EUR 60,000，支出 EUR 12,000，SVS EUR 8,000。
预期：利润 EUR 40,000。GFB Grundfreibetrag EUR 4,950。应税所得约为 EUR 35,050。

**测试 2——Pauschale 比较。**
输入：Gewerbebetrieb，营业额 EUR 50,000，实际支出 EUR 4,000，SVS EUR 6,500。
预期：Pauschale EUR 6,000 > 实际支出 EUR 4,000。Pauschale 方法更优。

**测试 3——Luxustangente。**
输入：汽车价格 EUR 60,000，80% 用于经营。
预期：AfA 上限为 EUR 40,000 / 8 = EUR 5,000 x 80% = EUR 4,000。

**测试 4——GWG 立即扣除。**
输入：价值 EUR 900 的办公椅。
预期：在购买当年全额扣除。

**测试 5——Kirchenbeitrag 上限。**
输入：EUR 800 Kirchenbeitrag。
预期：Sonderausgabe 以 EUR 600 为上限。

**测试 6——包含投资的 GFB。**
输入：利润 EUR 80,000，符合条件的投资 EUR 10,000。
预期：Grundfreibetrag EUR 4,950 + 投资 GFB EUR 6,110 = EUR 11,060。

---

## 禁止事项

- 在确认收入类型之前，绝不要应用税率档位
- 绝不要同时采用 Pauschale 和实际支出（SVS 和 GFB 除外）
- 在未确认存在符合条件的投资时，绝不要应用 investitionsbedingter GFB
- 绝不要对超过 EUR 40,000 Luxustangente 的车辆价值应用 AfA
- 绝不要允许将所得税作为扣除项
- 绝不要允许将罚款作为扣除项
- 绝不要允许超过 EUR 1,000 的 GWG 立即计入费用（除非已作出相应选择）
- 绝不要将计算结果表述为确定性结论

---

## 免责声明

本技能及其输出仅供信息和计算用途，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 Steuerberater，或您所在司法管辖区具有同等资质的执业人士）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/at-income-tax) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_