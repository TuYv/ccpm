---
name: armenia-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Armenian VAT (AVH) return for any client. Trigger on phrases like \"Armenia VAT\", \"Armenian VAT\", \"AVH return\", \"SRC filing\", or any request involving Armenian VAT filing. This skill covers standard VAT payers filing monthly returns. Turnover tax, micro-enterprise, and IT sector special regimes are in the refusal catalogue. MUST be loaded alongside vat-workflow-base v0.1 or later. ALWAYS read this skill before touching any Armenian VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/armenia-vat"
  obligation: CT
---
# 亚美尼亚增值税申报技能 v2.0

> **仅供一般参考。** 本技能是供 AI 辅助工作流使用的一般税务/会计参考资料。它尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审查。未经相关司法管辖区的合格专业人士审查，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

**在对任何内容进行分类之前，请完整阅读本节。工作流运行手册位于 `vat-workflow-base` 第 1 节。**

| 字段 | 值 |
|---|---|
| 国家 | 亚美尼亚（亚美尼亚共和国） |
| 税种名称 | AVH (Avelacvats Arzheki Hark) / 增值税 |
| 标准税率 | 20% |
| 优惠税率 | 无（单一标准税率） |
| 零税率 | 0%（出口、国际运输、外交用途供应） |
| 申报表 | 月度增值税申报表（电子版） |
| 申报门户 | https://www.petakner.am |
| 主管机关 | 国家税收委员会（SRC） |
| 币种 | 仅限 AMD（亚美尼亚德拉姆） |
| 申报频率 | 每月 |
| 截止日期 | 报告月份次月的 20 日 |
| 配套技能 | **vat-workflow-base v0.1 或更高版本 — 必须加载** |
| 贡献者 | 开放会计技能注册库 |
| 验证者 | 等待当地执业人士验证 |
| 验证日期 | 2026 年 4 月 |

**增值税申报表的主要部分：**

| 部分 | 含义 |
|---|---|
| 第 1 部分 | 按 20% 税率征税的应税供应 — 计税基础 |
| 第 2 部分 | 按 20% 税率计算的销项增值税 |
| 第 3 部分 | 零税率供应（出口） |
| 第 4 部分 | 免税供应 |
| 第 5 部分 | 反向征税 — 来自非居民的服务 — 计税基础 |
| 第 6 部分 | 反向征税的销项增值税 |
| 第 7 部分 | 销项增值税总额 |
| 第 8 部分 | 境内采购的进项增值税 |
| 第 9 部分 | 进口进项增值税（已在海关缴纳） |
| 第 10 部分 | 反向征税的进项增值税（可抵扣） |
| 第 11 部分 | 进项增值税总额 |
| 第 12 部分 | 应缴增值税净额或留抵税额 |
| 第 13 部分 | 上期结转留抵税额 |
| 第 14 部分 | 抵扣后的应缴净额 |

**保守默认值：**

| 不确定事项 | 默认值 |
|---|---|
| 销售适用税率未知 | 20% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在国家未知 | 亚美尼亚境内 |
| 业务用途比例未知 | 0% 抵扣 |
| SaaS 开票实体未知 | 来自非居民的反向征税（第 5/6/10 部分） |
| 是否属于不得抵扣进项税额未知 | 不得抵扣 |
| 交易是否属于征税范围未知 | 属于征税范围 |

**危险信号阈值：**

| 阈值 | 值 |
|---|---|
| 高风险单笔交易金额 | AMD 5,000,000 |
| 单项保守默认值导致的高风险税额差异 | AMD 300,000 |
| 中等风险交易对手集中度 | >销项或进项的 40% |
| 中等风险保守默认值数量 | 整份申报表中 >4 |
| 低风险增值税净额绝对值 | AMD 10,000,000 |

---

## 第 2 节 — 必需输入和拒绝处理目录

### 必需输入

**最低可行要求** — 当月银行对账单，格式可以是 CSV、PDF 或粘贴的文本。接受任何亚美尼亚银行的对账单：Ameriabank、ACBA Bank、Ardshinbank、Converse Bank、Evocabank、HSBC Armenia 或任何其他银行。

**建议提供** — 销售发票、用于申报超过 AMD 300,000 的进项增值税抵扣的采购发票、客户的 TIN (HVHH)。

**理想情况** — 来自 petakner.am 的完整电子发票登记簿、上一申报期的申报表、结转抵免额的对账资料。

**缺少最低要求资料时的拒绝政策 — 软警告。** 如果没有银行对账单，则必须停止。如果只有银行对账单，可以继续，但需记录：“本增值税申报表仅根据银行对账单编制。审核人员必须核实进项增值税抵扣是否有有效税务发票作为依据。”

### 亚美尼亚特定拒绝事项目录

**R-AM-1 — 流转税制度。** *触发条件：* 客户适用流转税（营业额低于 AMD 115,000,000 且已选择适用流转税）。*提示信息：* “流转税纳税人无需提交增值税申报表，也不能抵扣进项增值税。不在处理范围内。”

**R-AM-2 — 微型企业。** *触发条件：* 已注册为微型企业。*提示信息：* “微型企业免征增值税。不在处理范围内。”

**R-AM-3 — IT 行业特殊制度。** *触发条件：* 享受特殊税收优惠的认证 IT 公司。*提示信息：* “适用 IT 行业特殊制度的实体可能承担经调整的增值税义务。请咨询具备资质的亚美尼亚专业人士。”

**R-AM-4 — 部分免税。** *触发条件：* 同时提供应税和免税供应，且金额并非微不足道。*提示信息：* “需要分摊进项增值税。请咨询具备资质的专业人士。”

**R-AM-5 — 自由经济区。** *触发条件：* 自由经济区实体。*提示信息：* “自由经济区实体适用特殊增值税规则。不在处理范围内。”

**R-AM-6 — 所得税。** *触发条件：* 用户询问所得税。*提示信息：* “此 Skill 仅处理增值税申报表。”

---

## 第 3 节 — 供应商模式库

### 3.1 亚美尼亚银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| AMERIABANK, AMERIA | 银行手续费/费用应 EXCLUDE | 金融服务，免税 |
| ACBA, ACBA BANK, ACBA-CREDIT AGRICOLE | 银行手续费/费用应 EXCLUDE | 同上 |
| ARDSHINBANK, ARDSHIN | 银行手续费/费用应 EXCLUDE | 同上 |
| CONVERSE BANK, EVOCABANK, ARARAT BANK | 银行手续费/费用应 EXCLUDE | 同上 |
| HSBC ARMENIA, INECOBANK, ID BANK | 银行手续费/费用应 EXCLUDE | 同上 |
| TOKOS, INTEREST | EXCLUDE | 利息，不在征税范围内 |
| VARK, LOAN | EXCLUDE | 贷款本金，不在征税范围内 |

### 3.2 政府和法定机构（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SRC, HARKAYIN KOMITE, STATE REVENUE | EXCLUDE | 税款缴纳 |
| MAQSAYIN, CUSTOMS | EXCLUDE | 关税（进口增值税见第 9 部分） |
| SOTSIALAYIN, SOCIAL PAYMENT | EXCLUDE | 社会缴款 |
| PETAKAN, STATE FEE | EXCLUDE | 政府收费 |

### 3.3 公用事业

| 模式 | 处理方式 | 栏位 | 备注 |
|---|---|---|---|
| ENA, ELECTRIC NETWORKS ARMENIA | 国内 20% | 第 8 部分 | 电力 |
| VEOLIA JRMUGK, YEREVAN JRMUGK | 国内 20% | 第 8 部分 | 供水 |
| GAZPROM ARMENIA, HAYRUSGAZARD | 国内 20% | 第 8 部分 | 燃气 |
| VEON ARMENIA, TEAM TELECOM, UCOM | 国内 20% | 第 8 部分 | 电信 |

### 3.4 保险（免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ROSGOSSTRAKH, INGO ARMENIA, NAIRI INSURANCE | EXCLUDE | 免税 |
| APAHOV, INSURANCE | EXCLUDE | 同上 |

### 3.5 邮政与物流

| 模式 | 处理方式 | 备注 |
|---|---|---|
| HAYPOST | 标准邮件 EXCLUDE | 普遍服务，免税 |
| DHL, FEDEX, TNT | 境内 20% 或反向征税 | 检查开票实体 |

### 3.6 食品与招待（不可抵扣）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SUPERMARKET, YEREVAN CITY, SAS | 默认 BLOCK | 个人生活物资采购 |
| RESTAURANT, RESTORAN, CAFE, BAR | 默认 BLOCK | 招待费用不可抵扣 |

### 3.7 SaaS — 非居民供应商（反向征税）

| 模式 | 开票实体 | 栏次 | 备注 |
|---|---|---|---|
| GOOGLE, MICROSOFT, ADOBE, META | 各类非居民实体 | Part 5/6/10 | 按 20% 反向征税 |
| SLACK, ZOOM, DROPBOX, NOTION | 各类非居民实体 | Part 5/6/10 | 反向征税 |
| AWS, ANTHROPIC, OPENAI, GITHUB, FIGMA, CANVA | 美国实体 | Part 5/6/10 | 反向征税 |

### 3.8 支付处理商

| 模式 | 处理方式 | 备注 |
|---|---|---|
| STRIPE, PAYPAL（交易手续费） | EXCLUDE（免税） | 金融服务 |

### 3.9 专业服务

| 模式 | 处理方式 | 栏次 | 备注 |
|---|---|---|---|
| NOTAR, NOTARY | 境内 20% | Part 8 | 若用于商业目的 |
| HASHVAPAH, AUDITOR | 境内 20% | Part 8 | 可抵扣 |
| PASHTPAN, LAWYER | 境内 20% | Part 8 | 若与商业事务相关 |

### 3.10 工资薪酬与排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ASHKHATAVARDZ, SALARY | EXCLUDE | 工资，不在征税范围内 |
| DIVIDEND | EXCLUDE | 不在征税范围内 |
| INTERNAL, OWN TRANSFER | EXCLUDE | 内部资金划转 |
| ATM, KANKHIK, CASH | TIER 2 — 询问 | 默认排除 |

---

## 第 4 节 — 完整示例

### 示例 1 — 非居民 SaaS 反向征税（Notion）

**输入行：** `03.04.2026 ; NOTION LABS INC ; DEBIT ; Subscription ; USD 16.00 ; AMD 6,240`

**判断依据：** 美国实体，非居民。按 20% 反向征税。Part 5（计税基础）、Part 6（销项增值税）、Part 10（进项税抵扣）。净额为零。

| 日期 | 交易对手 | 含税额 | 不含税额 | 增值税 | 税率 | 栏次（进项） | 栏次（销项） | 默认？ | 问题？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|---|---|
| 03.04.2026 | NOTION LABS INC | -6,240 | -6,240 | 1,248 | 20% | Part 10 | Part 5/6 | N | — | — |

### 示例 2 — 可抵扣进项增值税的境内采购

**输入行：** `10.04.2026 ; UCOM ; DEBIT ; Business internet April ; -15,000 ; AMD`

**判断依据：** 亚美尼亚境内电信服务。标准税率 20%。进项增值税可抵扣。

| 日期 | 交易对手 | 含税额 | 不含税额 | 增值税 | 税率 | 栏次 | 默认？ | 问题？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | UCOM | -15,000 | -12,500 | -2,500 | 20% | Part 8 | N | — | — |

### 示例 3 — 招待费用不可抵扣

**输入行：** `15.04.2026 ; RESTORAN DOLMAMA ; DEBIT ; Business dinner ; -45,000 ; AMD`

**判断依据：** 招待费用不可抵扣。不得抵扣进项增值税。

| 日期 | 交易对手 | 含税额 | 不含税额 | 增值税 | 税率 | 栏次 | 默认？ | 问题？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | RESTORAN DOLMAMA | -45,000 | -45,000 | 0 | — | — | Y | Q1 | "招待费用：不可抵扣" |

### 示例 4 — IT 服务出口（零税率）

**输入行：** `22.04.2026 ; TECHCORP GMBH ; CREDIT ; IT consultancy ; +1,950,000 ; AMD`

**判断依据：** 服务出口。适用零税率。第 3 部分。需要出口证明文件。

| 日期 | 交易对手 | 含税额 | 净额 | 增值税 | 税率 | 栏目 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 22.04.2026 | TECHCORP GMBH | +1,950,000 | +1,950,000 | 0 | 0% | 第 3 部分 | Y | Q2（高） | "核实出口证明文件" |

### 示例 5 — 机动车进项税不得抵扣

**输入行：** `28.04.2026 ; ZANGAK AUTO ; DEBIT ; Car lease ; -120,000 ; AMD`

**判断依据：** 乘用车进项增值税不得抵扣。默认：全额不得抵扣。

| 日期 | 交易对手 | 含税额 | 净额 | 增值税 | 税率 | 栏目 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 28.04.2026 | ZANGAK AUTO | -120,000 | -120,000 | 0 | — | — | Y | Q3 | "机动车：不得抵扣" |

### 示例 6 — 货物进口

**输入行：** `25.04.2026 ; CUSTOMS ; DEBIT ; Import VAT machinery ; -480,000 ; AMD`

**判断依据：** 在海关缴纳的进口增值税。可抵扣。第 9 部分。

| 日期 | 交易对手 | 含税额 | 净额 | 增值税 | 税率 | 栏目 | 默认？ | 问题？ | 排除？ |
|---|---|---|---|---|---|---|---|---|---|
| 25.04.2026 | CUSTOMS | -480,000 | -400,000 | -80,000 | 20% | 第 9 部分 | N | — | — |

---

## 第 5 节 — 一级分类规则（精简版）

### 5.1 标准税率 20%（《税法》第 64 条）
采用单一税率，无低税率。销售计入第 1/2 部分。采购计入第 8 部分。

### 5.2 零税率
出口（需要报关单）、国际运输、外交机构用品。第 3 部分。

### 5.3 免税供应
金融服务、保险、医疗、教育、住宅出租、公共交通、邮政普遍服务、农业用地。

### 5.4 国内采购的进项增值税
满足以下条件时可抵扣：用于应税供应、具有有效的增值税发票、供应商已登记为增值税纳税人。第 8 部分。

### 5.5 反向征税 — 非居民服务（《税法》第 40 条）
按 20% 自行计税。第 5 部分（计税基础）、第 6 部分（销项税）、第 10 部分（进项税抵扣）。对于完全用于应税业务的情形，净税额为零。

### 5.6 进口增值税
在海关缴纳。计税基础 = 海关完税价格 + 关税。20%。第 9 部分。可抵扣。

### 5.7 不得抵扣的进项增值税
- 乘用车（出租车、租赁车辆、驾校车辆除外）
- 娱乐和业务招待
- 个人消费
- 无有效增值税发票
- 用于免税供应

### 5.8 贷项通知单
双方均在当期进行调整。

---

## 第 6 节 — 二级目录（精简版）

### 6.1 燃油/车辆 — *默认：* 0%。*问题：* "乘用车还是商用车？"
### 6.2 娱乐 — *默认：* 不得抵扣。
### 6.3 SaaS 实体 — *默认：* 反向征税。*问题：* "核对发票上的实体。"
### 6.4 所有者转账 — *默认：* 排除。*问题：* "客户付款还是自有资金？"
### 6.5 来自个人的入账 — *默认：* 国内 20%。*问题：* "这是否为销售收入？"
### 6.6 境外入账 — *默认：* 零税率出口。*问题：* "是否有出口证明文件？"
### 6.7 大额采购 — *问题：* "是否为固定资产（使用寿命 >12 个月）？"
### 6.8 混合用途电话 — *默认：* 0%。*问题：* "是否为业务线路？"
### 6.9 现金提取 — *默认：* 排除。*问题：* "用途是什么？"
### 6.10 租金 — *默认：* 无增值税（住宅）。*问题：* "是否为商业用途且有增值税发票？"

---

## 第 7 节 — Excel 工作底稿模板

遵循 `vat-workflow-base` 第 3 节，并使用第 1 节中亚美尼亚特定的栏位代码。

```
| Part 1  | Taxable supplies 20% | =SUMIFS(...) |
| Part 2  | Output VAT 20% | =Part1*0.20 |
| Part 3  | Zero-rated | =SUMIFS(...) |
| Part 5  | Reverse charge base | =SUMIFS(...) |
| Part 6  | Output VAT reverse charge | =Part5*0.20 |
| Part 7  | Total output VAT | =Part2+Part6 |
| Part 8  | Input VAT domestic | =SUMIFS(...) |
| Part 9  | Input VAT imports | =SUMIFS(...) |
| Part 10 | Input VAT reverse charge | =Part5*0.20 |
| Part 11 | Total input VAT | =Part8+Part9+Part10 |
| Part 12 | Net payable/credit | =Part7-Part11 |
| Part 13 | Credit B/F | [manual] |
| Part 14 | Net after credit | =Part12-Part13 |
```

---

## 第 8 节 — 亚美尼亚银行对账单阅读指南

**CSV 格式惯例。** Ameriabank 和 ACBA 导出的文件通常使用分号或逗号作为分隔符，日期格式为 DD.MM.YYYY。Ardshinbank 导出的文件可能使用 ISO 日期格式。

**亚美尼亚语变体。** ashkhatavardz（工资）、tokos（利息）、vark（贷款）、kankhik（现金）、gnumner（采购）、vacharqner（销售）、pashtpan（律师）、hashvapah（会计师）。

**内部转账。** 客户本人在 Ameriabank、ACBA、Ardshinbank 的账户之间进行的转账。始终排除。

**外币。** 按交易当日亚美尼亚中央银行的汇率换算为 AMD。

**IBAN 前缀。** AM = 亚美尼亚。

---

## 第 9 节 — 客户引导的后备方案

### 9.1 实体类型 — *推断：* 名称以“LLC”/“SRL”结尾。*后备问题：*“个体经营者还是公司？”
### 9.2 增值税登记 — *推断：* 要求申报增值税 = 已登记。*后备问题：*“增值税纳税人还是营业额税纳税人？”
### 9.3 TIN (HVHH) — *后备问题：*“您的税务识别号是什么？”
### 9.4 申报期间 — *推断：* 对账单日期。*后备问题：*“哪个月份？”
### 9.5 行业 — *推断：* 交易对手构成。*后备问题：*“该企业从事什么业务？”
### 9.6 免税供应 — *后备问题：*“您是否有免税销售？”*如果是，则触发 R-AM-4。*
### 9.7 结转抵扣额 — *始终询问：*“上月结转的增值税抵扣额是多少？”
### 9.8 跨境业务 — *推断：* 外国 IBAN。*后备问题：*“是否有亚美尼亚境外的客户？”

---

## 第 10 节 — 参考资料

### 来源
1. 亚美尼亚税法（经修订）— 第 40 条、第 64 条及后续条款。
2. SRC 电子申报 — https://www.petakner.am
3. 亚美尼亚中央银行汇率 — https://www.cba.am

### 已知缺口
1. 未涵盖 IT 行业特殊制度。2. 未涵盖营业额税制度。3. 未涵盖自由经济区（FEZ）规则。

### 变更日志
- **v2.0（2026 年 4 月）：** 完全重写为 Malta v2.0 的 10 节结构。
- **v1.x：** 初始技能版本。

## 亚美尼亚增值税技能 v2.0 结束

---

## 免责声明

本技能及其输出仅用于提供信息和计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者对于因使用本技能而产生的任何错误、遗漏或后果不承担任何责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等执业许可的从业人员）审核并签字确认。

此技能最新且经过验证的版本维护在 [openaccountants.com](https://openaccountants.com)。登录后即可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/armenia-vat) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据和具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_