---
name: algeria-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Algeria TVA (Taxe sur la Valeur Ajoutee) return (G50 declaration) for any client. Trigger on phrases like \"prepare TVA return\", \"Algeria VAT\", \"G50 declaration\", \"declaration TVA\", \"DGI return\", or any request involving Algeria VAT filing. Also trigger when classifying transactions for TVA purposes from bank statements, invoices, or other source data. This skill covers Algeria only and standard TVA-registered businesses under the regime reel. IFU (forfaitaire) taxpayers, hydrocarbon-sector entities, military procurement, and special conventions are in the refusal catalogue. ALWAYS read this skill before touching any Algeria TVA work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/algeria-vat"
  obligation: CT
---
# 阿尔及利亚 TVA 申报技能（G50 申报表）v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审核。未经相关司法管辖区内合格专业人士审核，请勿依赖本技能进行申报、缴税、修正申报或采取任何税务立场。

## 第 1 节 — 快速参考

**在对任何事项进行分类之前，请阅读完整的本节内容。**

| 字段 | 值 |
|---|---|
| 国家 | 阿尔及利亚（阿尔及利亚民主人民共和国） |
| 标准税率 | 19%（taux normal） |
| 优惠税率 | 9%（taux reduit：基本食品、药品、农业投入品、旅游/酒店、IT 设备、可再生能源） |
| 免税供应 | 面包、粗粒小麦粉、面粉、鲜奶、金融服务（利息）、医疗服务（公共）、教育、出口（免税但有权抵扣） |
| 申报表 | G50（Serie G50 月度申报表——包括 TVA、TAP 和代扣税部分） |
| 申报门户 | https://jibayatic.mf.gov.dz（Jibayatic） |
| 主管机构 | Direction Generale des Impots（DGI） |
| 货币 | 仅限 DZD（阿尔及利亚第纳尔） |
| 申报频率 | 每月（regime reel）；IFU 纳税人不申报 TVA |
| 截止日期 | 所属期次次月 20 日 |
| 贡献者 | Open Accountants Skills Registry |
| 验证者 | 待定——需要由阿尔及利亚持证 commissaire aux comptes 验证 |
| 验证日期 | 待定 |

**G50 TVA 关键行（最常使用的行）：**

| 行 | 含义 |
|---|---|
| 1 | CA taxable a 19%（适用标准税率的销售净额） |
| 2 | CA taxable a 9%（适用优惠税率的销售净额） |
| 3 | CA exonere（免税供应净额） |
| 4 | Exportations（出口销售净额，免税但可抵扣） |
| 5 | Total CA（计算得出：1+2+3+4） |
| 6 | TVA collectee a 19%（第 1 行的销项 TVA） |
| 7 | TVA collectee a 9%（第 2 行的销项 TVA） |
| 8 | TVA sur autoliquidation（反向征税销项税） |
| 9 | Regularisations（调整） |
| 10 | Total TVA brute（计算得出：6+7+8+9） |
| 11 | TVA sur achats de biens et services（经营性采购的进项 TVA） |
| 12 | TVA sur immobilisations（资本性资产的进项 TVA） |
| 13 | TVA sur importations（海关 TVA） |
| 14 | TVA autoliquidation input（反向征税进项税） |
| 15 | Exclusions（不得抵扣项目） |
| 16 | Total TVA deductible（计算得出：11+12+13+14-15） |
| 17 | TVA due（计算得出：10-16） |
| 18 | Precomptes（已收到的 TVA 预扣款） |
| 19 | Credit reporte（上期留抵税额） |
| 20 | TVA a payer / Credit（计算得出：17-18-19） |

**保守默认值：**

| 不明确事项 | 默认处理 |
|---|---|
| 销售适用税率未知 | 19% |
| 采购的 TVA 状态未知 | 不得抵扣 |
| 交易对手所在国家未知 | 阿尔及利亚境内 |
| 业务用途比例未知 | 0% 抵扣 |
| 是否属于进项税抵扣受限项目未知 | 不得抵扣 |
| 交易是否属于征税范围未知 | 属于征税范围 |
| SaaS 开票实体未知 | 对非居民适用反向征税（第 8/14 行） |

**红旗阈值：**

| 阈值 | 数值 |
|---|---|
| HIGH 单笔交易金额 | DZD 5,000,000 |
| HIGH 单项保守默认处理产生的税额差异 | DZD 500,000 |
| MEDIUM 交易对手集中度 | 销项或进项的 >40% |
| MEDIUM 保守默认处理次数 | 整份申报表中 >4 次 |
| LOW TVA 绝对净额头寸 | DZD 10,000,000 |

---

## 第 2 节 — 必需输入和拒绝目录

### 必需输入

**最低可行要求** — 当月银行对账单，格式可以是 CSV、PDF 或粘贴的文本。必须涵盖完整期间。接受任何阿尔及利亚或国际商业银行的对账单：BNA、BEA、CPA、BADR、BDL、Societe Generale Algerie、AGB、Natixis Algerie、Al Baraka 或任何其他银行。

**建议提供** — 该期间的销售发票、任何超过 DZD 500,000 的进项 TVA 抵扣所对应的采购发票，以及以书面形式提供的客户 NIF（Numero d'Identification Fiscale）。

**理想情况** — 完整的发票登记簿、上一期间的 G50、结转抵免额（第 19 行）对账。

**缺少最低要求时的拒绝政策 — SOFT WARN。** 如果完全没有银行对账单，则立即停止。如果只有银行对账单而没有发票，则继续处理，但需在审核人员简报中记录：“此 G50 仅依据银行对账单编制。审核人员必须核实，超过 DZD 500,000 的进项 TVA 抵扣均有包含有效 NIF 的合规发票作为支持，并且所有反向征税分类均与供应商发票一致。”

### 阿尔及利亚特定拒绝目录

**R-DZ-1 — IFU（定额制）纳税人。** *触发条件：* 客户适用 Impot Forfaitaire Unique 制度（营业额低于 DZD 15,000,000）。*消息：* “IFU 纳税人不申报 TVA，而是缴纳 Impot Forfaitaire Unique。此技能仅涵盖 regime reel TVA。如果您已超过 DZD 15,000,000 的阈值，则必须登记 TVA 并转为 regime reel。”

**R-DZ-2 — 碳氢化合物行业。** *触发条件：* 客户依据第 19-13 号《碳氢化合物法》从事石油/天然气勘探、生产或管道运输。*消息：* “碳氢化合物行业实体依据《碳氢化合物法》适用特定税收制度。标准 TVA 规则不适用。请上报给专家处理。”

**R-DZ-3 — 军事采购。** *触发条件：* 客户根据国防合同向阿尔及利亚军方提供商品或服务。*消息：* “军事采购合同适用特定的 TVA 免税规定和协议。不在范围内。”

**R-DZ-4 — 部分免税（prorata）。** *触发条件：* 客户同时提供应税和免税项目，且免税部分占比较大。*消息：* “您的进项 TVA 必须依据 Code TCA Art. 34 规定的 prorata 公式进行分摊。年度 prorata 计算需要全年营业额构成。请在抵扣进项 TVA 前，聘请 commissaire aux comptes 确定 prorata 比率。”

**R-DZ-5 — ANDI 投资激励资本货物。** *触发条件：* 客户持有 ANDI 投资证书，并就进口资本货物申请 TVA 免税。*消息：* “ANDI 投资激励需要核验证书的有效性和适用范围。标记供审核人员复核。”

**R-DZ-6 — 特殊公约。** *触发条件：* 客户适用与阿尔及利亚政府签订的双边税收公约或特殊协议。*提示信息：* “特殊公约不在此技能的处理范围内。请升级至具备资质的专业人士处理。”

---

## 第 3 节 — 供应商模式库（查找表）

这是确定性预分类器。当交易的交易对手与此表中的某个模式匹配时，直接应用相应处理方式。

**此表的阅读方式。** 根据银行对账单中显示的交易对手名称进行不区分大小写的子字符串匹配。如果多个模式均匹配，则使用最具体的模式。如果均不匹配，则继续应用第 5 节中的第 1 层规则。

### 3.1 阿尔及利亚银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BNA, BANQUE NATIONALE D'ALGERIE | 银行收费/费用应 EXCLUDE | 金融服务，免税 |
| BEA, BANQUE EXTERIEURE D'ALGERIE | 银行收费/费用应 EXCLUDE | 同上 |
| CPA, CREDIT POPULAIRE D'ALGERIE | 银行收费/费用应 EXCLUDE | 同上 |
| BADR, BDL, CNEP | 银行收费/费用应 EXCLUDE | 同上 |
| SOCIETE GENERALE ALGERIE, SGA | 银行收费/费用应 EXCLUDE | 同上 |
| AGB, GULF BANK ALGERIE | 银行收费/费用应 EXCLUDE | 同上 |
| AL BARAKA, NATIXIS ALGERIE | 银行收费/费用应 EXCLUDE | 同上 |
| INTERETS, INTEREST, AGIOS | EXCLUDE | 利息收入/费用，免税 |
| PRET, CREDIT, EMPRUNT | EXCLUDE | 贷款本金变动，不在适用范围内 |

### 3.2 阿尔及利亚政府和监管机构（完全排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| DGI, DIRECTION GENERALE DES IMPOTS | EXCLUDE | 税款支付，不属于供应 |
| TRESOR PUBLIC | EXCLUDE | 政府款项 |
| DOUANES, DIRECTION DES DOUANES | 关税应 EXCLUDE，但需检查海关 TVA（第 13 行） |
| CNAS, CASNOS | EXCLUDE | 社会保障，不在适用范围内 |
| CNRC, REGISTRE DE COMMERCE | EXCLUDE | 注册费，主权行为 |
| ANDI, ANADE | EXCLUDE | 政府机构费用 |

### 3.3 阿尔及利亚公用事业

| 模式 | 处理方式 | 行次 | 备注 |
|---|---|---|---|
| SONELGAZ, SONALGAZ | 国内 19% | 11 | 电力和天然气 — 经营费用 |
| SEAAL, ADE | 国内 9% | 11 | 供水 — 优惠税率 |
| ALGERIE TELECOM, AT, MOBILIS | 国内 19% | 11 | 电信 — 间接费用 |
| DJEZZY, OOREDOO | 国内 19% | 11 | 移动通信 |

### 3.4 保险（免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SAA, CAAR, CAAT, CASH ASSURANCES | EXCLUDE | 保险，免税 |
| ALLIANCE ASSURANCES, SALAMA | EXCLUDE | 同上 |
| ASSURANCE, TAAWIN | EXCLUDE | 均免税 |

### 3.5 邮政和物流

| 模式 | 处理方式 | 行次 | 备注 |
|---|---|---|---|
| ALGERIE POSTE | 标准邮政服务应 EXCLUDE | 普遍邮政服务，免税 |
| DHL ALGERIE, FEDEX, UPS | 国内 19% | 11 | 快递服务，应税 |
| EMS ALGERIE | 国内 19% | 11 | 邮政快递，应税 |

### 3.6 燃料和运输

| 模式 | 处理方式 | 备注 |
|---|---|---|
| NAFTAL | 燃料适用国内 19%（如果企业车辆未被禁止抵扣） | 检查车辆类型 |
| ETUSA, TRAMWAY | EXCLUDE 或 0% | 公共交通 |
| AIR ALGERIE（国内） | 国内 9% | 旅游/运输优惠税率 |
| AIR ALGERIE（国际） | EXCLUDE / 出口 | 国际航班 |

### 3.7 食品零售（除非属于餐旅业务，否则不可抵扣）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| UNO, ARDIS, PROMY CASH, HYPERMARCHE | 默认 BLOCK 进项 TVA | 除非属于餐旅业务，否则视为个人生活物资采购 |
| RESTAURANT, CAFE, TRAITEUR | 默认 BLOCK | 根据 Code TCA Art. 30，招待费用不可抵扣 |

### 3.8 SaaS — 非居民供应商（反向征税，第 8/14 行）

| 模式 | 开票实体 | 行 | 备注 |
|---|---|---|---|
| GOOGLE (Ads, Workspace, Cloud) | Google Ireland Ltd (IE) 或 Google LLC (US) | 8/14 | 反向征税 — 自行计税 |
| MICROSOFT (365, Azure) | Microsoft Ireland Operations Ltd (IE) 或 US | 8/14 | 反向征税 |
| ADOBE | Adobe Systems (IE 或 US) | 8/14 | 反向征税 |
| META, FACEBOOK ADS | Meta Platforms Ireland Ltd (IE) | 8/14 | 反向征税 |
| ZOOM | Zoom Video Communications (US) | 8/14 | 反向征税 |
| SLACK, ATLASSIAN, NOTION | 各类非居民实体 | 8/14 | 反向征税 |
| ANTHROPIC, OPENAI, CHATGPT | US 实体 | 8/14 | 反向征税 |
| AWS, AMAZON WEB SERVICES | 各类实体 | 8/14 | 反向征税 |

### 3.9 支付处理商

| 模式 | 处理方式 | 备注 |
|---|---|---|
| STRIPE (transaction fees) | EXCLUDE（免税） | 支付处理费，金融服务 |
| PAYPAL (transaction fees) | EXCLUDE（免税） | 同上 |

### 3.10 专业服务（阿尔及利亚）

| 模式 | 处理方式 | 行 | 备注 |
|---|---|---|---|
| NOTAIRE, MAITRE, HUISSIER | 境内 19% | 11 | 如用于商业目的，则可抵扣 |
| EXPERT COMPTABLE, COMMISSAIRE | 境内 19% | 11 | 始终可抵扣 |
| AVOCAT, CABINET D'AVOCATS | 境内 19% | 11 | 如涉及企业法律事务，则可抵扣 |

### 3.11 工资和社会保障（完全排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| CNAS, CASNOS | EXCLUDE | 法定社会保障 |
| SALAIRE, PAIE, VIREMENT PERSONNEL | EXCLUDE | 工资，不在适用范围内 |
| IRG, IMPOT SUR LE REVENU | EXCLUDE | 所得税 |

### 3.12 内部转账和排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| VIREMENT INTERNE, TRANSFER PROPRE | EXCLUDE | 内部资金划转 |
| DIVIDENDE | EXCLUDE | 股息，不在适用范围内 |
| REMBOURSEMENT PRET | EXCLUDE | 贷款偿还，不在适用范围内 |
| RETRAIT DAB, RETRAIT ESPECES | 询问 | 默认排除；询问现金的具体用途 |

---

## 第 4 节 — 完整示例

以下六个完整分类示例取自一份虚构的、位于阿尔及利亚的个体 IT 顾问银行对账单。

### 示例 1 — 非居民 SaaS 反向征税（Notion）

**输入行：**
`05.04.2026 ; NOTION LABS INC ; DEBIT ; Monthly subscription ; USD 16.00 ; DZD 2,160`

**判断过程：**
Notion Labs Inc 是一家 US 实体（第 3.8 节）。发票上没有 TVA。这是从非居民处接受的服务。阿尔及利亚客户根据 Code TCA Art. 14 实行自行计税。必须同时申报销项 TVA（第 8 行）和进项 TVA（第 14 行）。对于完全应税的企业，净影响为零。

**输出：**

| 日期 | 交易对手 | 含税金额 | 未税金额 | TVA | 税率 | 行（进项） | 行（销项） | 默认？ | 问题？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 05.04.2026 | NOTION LABS INC | -2,160 | -2,160 | 410 | 19% | 14 | 8 | N | — | — |

### 示例 2 — 适用 19% 税率的标准境内销售

**输入行：**
`10.04.2026 ; SARL TECHNOSOFT ; CREDIT ; Invoice 2026-041 IT consulting April ; +500,000 ; DZD`

**推理：**
收到一家阿尔及利亚公司支付的 IT 咨询服务款项。适用 19% 的标准税率。在第 1 行申报净额，在第 6 行申报销项 TVA。总额包含 TVA：净额 = 500,000 / 1.19 = 420,168。TVA = 79,832。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | TVA | 税率 | 行次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | SARL TECHNOSOFT | +500,000 | +420,168 | 79,832 | 19% | 1/6 | N | — | — |

### 示例 3 — 业务招待，完全禁止抵扣

**输入行：**
`15.04.2026 ; RESTAURANT EL DJAZAIR ; DEBIT ; Business dinner ; -12,000 ; DZD`

**推理：**
餐厅交易。根据 Code TCA Art. 30，业务招待费用禁止抵扣。无论是否出于业务目的，均不得抵扣进项 TVA。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | TVA | 税率 | 行次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | RESTAURANT EL DJAZAIR | -12,000 | -12,000 | 0 | — | — | Y | Q1 | "业务招待：禁止抵扣" |

### 示例 4 — 资本货物采购

**输入行：**
`18.04.2026 ; SPA DELL TECHNOLOGIES ; DEBIT ; Invoice Laptop XPS ; -250,000 ; DZD`

**推理：**
资本货物采购。进项 TVA 应填入第 12 行（固定资产），而非第 11 行（经营费用）。净额 = 250,000 / 1.19 = 210,084。TVA = 39,916。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | TVA | 税率 | 行次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 18.04.2026 | SPA DELL TECHNOLOGIES | -250,000 | -210,084 | -39,916 | 19% | 12 | N | — | — |

### 示例 5 — 出口销售（免税但保留抵扣权）

**输入行：**
`22.04.2026 ; STUDIO KREBS GMBH ; CREDIT ; Invoice DZ-2026-015 IT consulting ; +3,500 ; EUR (DZD 518,000)`

**推理：**
服务出口。免税且保留全额抵扣进项 TVA 的权利。在第 4 行（出口）申报。无销项 TVA。需要出口证明文件（服务合同、境外消费证明）。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | TVA | 税率 | 行次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 22.04.2026 | STUDIO KREBS GMBH | +518,000 | +518,000 | 0 | 0% | 4 | N | — | — |

### 示例 6 — 机动车，禁止抵扣

**输入行：**
`28.04.2026 ; SARL SOVAC ; DEBIT ; Monthly lease payment Renault Clio ; -45,000 ; DZD`

**推理：**
汽车租赁付款。根据 Code TCA Art. 30，乘用车（少于 9 个座位）的进项 TVA 禁止抵扣。仅出租车和租赁车辆例外。IT 顾问不符合例外条件。默认：全部禁止抵扣。

**输出：**

| 日期 | 交易对手 | 总额 | 净额 | TVA | 税率 | 行次 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 28.04.2026 | SARL SOVAC | -45,000 | -45,000 | 0 | — | — | Y | Q2 | "机动车：禁止抵扣" |

---

## 第 5 节 — 第 1 层级分类规则（精简版）

### 5.1 标准税率 19%（Code TCA Art. 21）

除适用较低税率或免税规定外，任何应税供应均适用默认税率。销售额填报于第 1 行 / 第 6 行。采购额填报于第 11 行。

### 5.2 9% 的较低税率（《TCA 法典》第 23 条）

适用于：基本食品、药品、农业投入品、旅游/酒店服务、IT 设备、可再生能源设备。销售额填报于第 2 行 / 第 7 行。采购额填报于第 11 行。

### 5.3 免税供应（《TCA 法典》第 8-9 条）

面包、粗粒小麦粉、面粉（基本主食）、鲜奶、金融服务（贷款利息、人寿保险）、医疗服务（公共部门）、教育服务（获授权机构）、初级阶段的农业生产。不征收销项 TVA，相关成本的进项 TVA 不得抵扣。

### 5.4 出口（《TCA 法典》第 8 条）

免税，但保留全额抵扣进项 TVA 的权利——实际相当于零税率。需要海关出口单证。填报于第 4 行。

### 5.5 反向征税——自缴税款（《TCA 法典》第 14 条）

当已登记 TVA 的纳税人接受非居民提供的服务时：按适用税率（19% 或 9%）自行计算销项 TVA，并填报于第 8 行；同时在第 14 行申报进项 TVA 抵扣。对于业务全部应税的企业，净影响为零。

### 5.6 货物进口

进口货物在海关缴纳的 TVA。填报于第 13 行。如果货物用于应税经营活动，则可以抵扣。

### 5.7 不得抵扣的进项 TVA（《TCA 法典》第 29-33 条）

除非另有注明，否则一律不得抵扣：
- 个人客运车辆（少于 9 个座位），出租车/租赁车辆除外（第 30 条）
- 住宿和旅宿服务（第 30 条）
- 娱乐和招待（第 30 条）
- 供个人使用的商品和服务（第 31 条）
- 用于不得抵扣车辆的石油产品（第 30 条）
- 未取得载有 NIF 的合规发票的采购（第 33 条）

### 5.8 资本性货物

资本性货物填报于第 12 行（固定资产的进项 TVA）。经营性采购填报于第 11 行。根据使用寿命是否超过 12 个月以及重要性进行分类。

### 5.9 TVA 预扣税（《TCA 法典》第 41 bis 条）

某些指定实体（政府、国有企业、大型纳税人）会预扣 TVA（通常为 TVA 的 25%）。供应商在第 18 行申报抵免。

### 5.10 TAP 的区别

TAP（Taxe sur l'Activite Professionnelle，职业活动税）按 1%（生产）或 2%（服务/商业）的税率征收，是一种单独的营业额税，在同一份 G50 表格上申报。它不是 TVA，也不能作为进项税抵扣。切勿将 TAP 与 TVA 混淆。

---

## 第 6 节——第 2 层目录（精简版）

### 6.1 燃料和车辆费用

*模式：* Naftal、Shell、Total。*信息不足的原因：* 车辆类型未知；如果是乘用车，无论用途如何均不得抵扣。*默认处理：* 抵扣比例为 0%。*问题：* “这是乘用车（不得抵扣），还是专用于经营活动的商用车辆？”

### 6.2 餐厅和娱乐

*模式：* 任何餐厅、咖啡馆、餐饮承办商。*信息不足的原因：* 娱乐费用明确不得抵扣。*默认处理：* 不予抵扣。*问题：* “这是娱乐支出吗？（注意：无论如何均不得抵扣。）”

### 6.3 开票实体不明确的 SaaS

*模式：* 未显示法律实体时的 Google、Microsoft、Adobe、Meta、Slack、Zoom。*默认处理：* 采用反向征税，填报于第 8/14 行。*问题：* “能否查看发票上的法律实体名称及其所在国家？”

### 6.4 整数金额的转入款项

*模式：* 来自以业主姓名命名的交易对手的大额整数金额贷记。*默认处理：* 作为业主注资排除。*问题：* “这是客户付款、您自己的资本注入，还是贷款？”

### 6.5 来自个人姓名的转入款项

*模式：* 来自看似私人交易对手的转入款项。*默认处理：* 按 19% 税率作为国内销售，计入第 1/6 行。*问题：* “这是一笔销售吗？适用哪个税率？”

### 6.6 大额一次性采购（潜在资本货物）

*模式：* 单笔大额发票。*默认处理：* 如果具有资本性质，计入第 12 行；否则计入第 11 行。*问题：* “这是资本货物吗（使用寿命 > 12 个月）？”

### 6.7 混合用途的电话、互联网和家庭办公室

*模式：* Algerie Telecom、Mobilis 个人线路。*默认处理：* 如果属于混合用途且未申报比例，则按 0% 处理。*问题：* “这是专用的企业线路，还是混合用途线路？”

### 6.8 现金提取

*模式：* retrait DAB、retrait especes。*默认处理：* 作为业主提款排除。*问题：* “这笔现金用于什么用途？”

### 6.9 ANDI 投资激励进口

*模式：* 带有 ANDI 证书编号的海关报关记录。*默认处理：* 标记并交由复核人员处理。*问题：* “您是否持有有效的 ANDI 投资证书？其适用范围是什么？”

### 6.10 Precompte 计算

*模式：* 国有企业付款时已扣除 precompte。*默认处理：* 标记并交由复核人员核实 precompte 税率。*问题：* “适用了什么 precompte 税率？您是否持有代扣证明？”

---

## 第 7 节 — Excel 工作底稿模板（阿尔及利亚专用）

### 工作表 "Transactions"

列：A (Date)、B (Counterparty)、C (Description)、D (Gross DZD)、E (Net DZD)、F (TVA DZD)、G (Rate)、H (G50 Line)、I (Default?)、J (Question?)、K (Excluded?)、L (Notes)。

### 工作表 "G50 Summary"

每个 G50 行对应一行。A 列 = 行号，B 列 = 描述，C 列 = 通过 Transactions 工作表中的 SUMIFS 公式计算得出的值。

### 工作表 "Return Form"

可直接填入最终 G50 的数据：
```
Line 10 = Total TVA brute (output)
Line 16 = Total TVA deductible (input)
Line 17 = TVA due (10 - 16)
Line 20 = TVA a payer / Credit (17 - 18 - 19)
```

第 20 行为正数 = 应向 DGI 缴纳。为负数 = 结转抵免额。

---

## 第 8 节 — 阿尔及利亚银行对账单阅读指南

**CSV 格式惯例。** BNA 和 BEA 导出的文件通常使用分号作为分隔符，日期格式为 DD/MM/YYYY。常见列：Date、Libelle、Debit、Credit、Solde。

**法语和阿拉伯语语言变体。** 描述可能以法语或音译阿拉伯语出现。应将其视为等同表述。

**内部转账和排除项。** 客户自有账户之间的转账。始终排除。

**退款和冲销。** 通过 "remboursement"、"annulation"、"extourne" 识别。在与原始交易相同的行中记为负数。

**外币交易。** 按交易日期阿尔及利亚银行的官方汇率折算为 DZD。

---

## 第 9 节 — 客户接入备用流程（仅在推断失败时使用）

### 9.1 实体类型和经营名称
*推断规则：* 名称中包含 SARL、EURL、SPA、SNC = 公司。个人姓名 = 个体经营者。*备用问题：* “您是个体经营者还是公司？”

### 9.2 TVA 注册状态
*推断规则：*如果要求填写 G50，则其采用 regime reel。*回退问题：*“您是否已按 regime reel 注册 TVA？”

### 9.3 NIF
*推断规则：*搜索对账单描述。*回退问题：*“您的 NIF 是什么？”

### 9.4 申报期间
*推断规则：*首笔和末笔交易的日期。*回退问题：*“这涵盖哪个月份？”

### 9.5 行业
*推断规则：*交易对手构成。*回退问题：*“该企业从事什么业务？”

### 9.6 免税供应
*推断规则：*是否存在医疗、金融或教育收入。*回退问题：*“您是否有任何免征 TVA 的销售？”如果有且金额重大，则触发 R-DZ-4。

### 9.7 上期结转抵免
*推断规则：*无法推断。始终询问。*问题：*“您是否有从上个月结转的任何抵免？（第 19 行）”

### 9.8 Precompte 抵免
*推断规则：*是否存在国有企业交易对手。*回退问题：*“您是否有可申报抵免的 precompte 预扣税凭证？（第 18 行）”

---

## 第 10 节 — 参考资料

### 验证状态

此技能为 v2.0，于 2026 年 4 月重写，以与 Accora 的 10 节架构保持一致。它取代了 v1.0。阿尔及利亚特定内容（税率结构、G50 行次、不可抵扣类别）需要由阿尔及利亚持证审计师验证。

### 来源

1. 《营业额税法典》（Code des Taxes sur le Chiffre d'Affaires，Code des TCA），经修订的第 76-104 号法令——第 2-3、8-9、14、21、23、29-34、36、41 bis 条
2. 《税务程序法典》（Code des Procedures Fiscales）
3. 年度《财政法》（Loi de Finances annuelle）
4. DGI Jibayatic 门户网站 — https://jibayatic.mf.gov.dz

### 已知缺口

1. 供应商模式库涵盖了大多数常见的阿尔及利亚交易对手，但并未涵盖每一家地区性中小企业。
2. Precompte 税率因行业和指定实体而异——请根据 DGI 通告进行核实。
3. ANDI 优惠的适用范围因证书而异——务必核实。
4. DZD 15,000,000 的 IFU 门槛为本年度标准——请每年核实。

### 变更日志

- **v2.0（2026 年 4 月）：**全面重写为 10 节架构。新增供应商模式库。新增完整示例。从内联文本中移除层级标签。
- **v1.0：**采用分步骤结构的初始技能。

---

## 免责声明

此技能及其输出仅用于提供信息和进行计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者对于因使用此技能而产生的任何错误、遗漏或后果不承担任何责任。所有输出在申报或据此采取行动之前，都必须由合格专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人员）审核并签字确认。

此技能最新且经过验证的版本维护在 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、请求持证会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/algeria-vat) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_