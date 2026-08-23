---
name: azerbaijan-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Azerbaijan VAT (EDV) return for any client. Trigger on phrases like \"Azerbaijan VAT\", \"EDV return\", \"Azerbaijani tax\", or any request involving Azerbaijan VAT filing. This skill covers standard EDV payers filing monthly returns. Simplified tax regime and micro-enterprise exemptions are in the refusal catalogue. MUST be loaded alongside vat-workflow-base v0.1 or later. ALWAYS read this skill before touching any Azerbaijan VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/azerbaijan-vat"
  obligation: CT
---
# 阿塞拜疆增值税（EDV）申报技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审查。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 阿塞拜疆（阿塞拜疆共和国） |
| 税种名称 | EDV（Elave Deger Vergisi / 增值税） |
| 标准税率 | 18% |
| 优惠税率 | 无（采用单一标准税率） |
| 零税率 | 0%（出口、国际运输、外交用品、某些农产品） |
| 申报表 | 月度 EDV 申报表 |
| 申报门户 | https://www.taxes.gov.az |
| 主管机关 | 经济部下属国家税务局 |
| 货币 | 仅限 AZN（阿塞拜疆马纳特） |
| 申报频率 | 每月 |
| 截止日期 | 报告月份次月 20 日 |
| 配套技能 | **vat-workflow-base v0.1 或更高版本 — 必须加载** |
| 贡献者 | 开放会计技能注册库 |
| 验证者 | 等待当地执业人士验证 |
| 验证日期 | 2026 年 4 月 |

**EDV 申报表关键栏次：**

| 栏次 | 含义 |
|---|---|
| 1 | 按 18% 税率征税的应税供应 — 计税基础 |
| 2 | 按 18% 税率计算的销项 EDV |
| 3 | 零税率供应（出口） |
| 4 | 免税供应 |
| 5 | 进口服务的反向征税 — 计税基础 |
| 6 | 反向征税的销项 EDV |
| 7 | 销项 EDV 总额 |
| 8 | 国内采购的进项 EDV |
| 9 | 进口 EDV（已在海关缴纳） |
| 10 | 反向征税的进项 EDV（可抵扣） |
| 11 | 进项 EDV 总额 |
| 12 | EDV 应纳净额或留抵税额 |
| 13 | 上期结转留抵税额 |
| 14 | 抵扣后的应纳净额 |

**保守默认值：**

| 不确定事项 | 默认值 |
|---|---|
| 销售适用税率未知 | 18% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在国家未知 | 阿塞拜疆境内 |
| 业务用途比例未知 | 0% 抵扣 |
| SaaS 开票实体未知 | 反向征税（栏次 5/6/10） |
| 进项税额是否禁止抵扣未知 | 禁止抵扣 |

**风险警示阈值：**

| 阈值 | 值 |
|---|---|
| HIGH 单笔交易金额 | AZN 10,000 |
| HIGH 单个默认值导致的税额差异 | AZN 500 |
| MEDIUM 交易对手集中度 | >40% |
| MEDIUM 保守默认值数量 | >4 |
| LOW EDV 净额绝对值 | AZN 20,000 |

---

## 第 2 节 — 必需输入与拒绝处理目录

### 必需输入

**最低可行要求** — 当月银行对账单。可接受的银行包括：Kapital Bank、PASHA Bank、International Bank of Azerbaijan (IBA)、AccessBank、Bank Respublika、Xalq Bank 或任何其他银行。

**建议提供** — 发票、来自 taxes.gov.az 的电子发票登记簿、客户 VOEN (TIN)。

**理想情况** — 完整的电子发票登记簿、上期申报表。

### 拒绝处理目录

**R-AZ-1 — 简化税制。** *触发条件：* 客户适用简化税制（营业额低于 AZN 200,000）。*消息：* “简化税制纳税人无需提交 EDV 申报表。不在范围内。”

**R-AZ-2 — 微型企业。** *触发条件：* 已注册的微型企业。*提示信息：* “微型企业免征 EDV。不在适用范围内。”

**R-AZ-3 — 部分免税。** *触发条件：* 同时提供应税和免税项目。*提示信息：* “需要对进项 EDV 进行分摊。请咨询具备资质的专业人士。”

**R-AZ-4 — 自由经济区。** *触发条件：* Alat FEZ 或其他指定区域。*提示信息：* “FEZ 实体适用特殊的 EDV 规则。不在适用范围内。”

**R-AZ-5 — 所得税。** *触发条件：* 用户询问所得税。*提示信息：* “此技能仅处理 EDV 申报表。”

---

## 第 3 节 — 供应商模式库

### 3.1 阿塞拜疆银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| KAPITAL BANK, KAPITALBANK | 排除 | 金融服务，免税 |
| PASHA BANK, PASHABANK | 排除 | 同上 |
| IBA, BEYNELXALQ BANK | 排除 | 同上 |
| ACCESSBANK, BANK RESPUBLIKA, XALQ BANK | 排除 | 同上 |
| FAIZ, INTEREST | 排除 | 利息，不在适用范围内 |
| KREDIT, LOAN | 排除 | 贷款本金，不在适用范围内 |

### 3.2 政府和法定机构（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| VERGI XIDMETI, STATE TAX | 排除 | 税款支付 |
| GOMRUK, CUSTOMS | 排除 | 关税（进口 EDV 单独处理） |
| DSMF, SOSIAL MUDAFIE | 排除 | 社会保障 |
| ASAN XIDMET | 排除 | 政府服务费 |

### 3.3 公用事业

| 模式 | 处理方式 | 栏位 | 备注 |
|---|---|---|---|
| AZERIQAZ, AZERENERJI | 国内 18% | 8 | 燃气/电力 |
| AZERSU | 国内 18% | 8 | 水务 |
| AZERCELL, BAKCELL, NAR MOBILE | 国内 18% | 8 | 电信 |

### 3.4 保险（免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| PASHA SIGORTA, AXA MBASK, ATESHGAH | 排除 | 免税 |
| SIGORTA, INSURANCE | 排除 | 同上 |

### 3.5 食品和招待娱乐（不得抵扣）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BRAVO, BAZARSTORE, ARAZ SUPERMARKET | 默认不得抵扣 | 个人生活用品采购 |
| RESTAURANT, RESTORAN, KAFE | 默认不得抵扣 | 招待娱乐费用不得抵扣 |

### 3.6 SaaS — 非居民（反向征税）

| 模式 | 栏位 | 备注 |
|---|---|---|
| GOOGLE, MICROSOFT, ADOBE, META | 5/6/10 | 按 18% 反向征税 |
| SLACK, ZOOM, NOTION, AWS, ANTHROPIC, OPENAI | 5/6/10 | 同上 |

### 3.7 专业服务

| 模式 | 处理方式 | 栏位 | 备注 |
|---|---|---|---|
| NOTAR, NOTARY | 国内 18% | 8 | 如果用于商业目的 |
| AUDITOR, MUHASIB | 国内 18% | 8 | 可抵扣 |
| VEKIL, LAWYER | 国内 18% | 8 | 如果与商业事务相关 |

### 3.8 工资及排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| EMEK HAQQI, SALARY | 排除 | 工资 |
| DIVIDEND | 排除 | 不在适用范围内 |
| DAXILI, INTERNAL, OWN TRANSFER | 排除 | 内部转账 |
| ATM, NAGD, CASH | 第 2 级 — 询问 | 默认排除 |

---

## 第 4 节 — 示例详解

### 示例 1 — 非居民 SaaS 反向征税

**输入行：** `03.04.2026 ; NOTION LABS INC ; DEBIT ; Subscription ; USD 16.00 ; AZN 27.20`

**判断过程：** 美国实体。按 18% 反向征税。第 5/6 栏（销项税）、第 10 栏（进项税抵扣）。净额为零。

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框（进项） | 框（销项） | 默认？ |
|---|---|---|---|---|---|---|---|---|
| 03.04.2026 | NOTION LABS INC | -27.20 | -27.20 | 4.90 | 18% | 10 | 5/6 | N |

### 示例 2 — 国内公用事业

**输入行：** `10.04.2026 ; AZERCELL ; DEBIT ; Mobile April ; -35.00 ; AZN`

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框 | 默认？ |
|---|---|---|---|---|---|---|---|
| 10.04.2026 | AZERCELL | -35.00 | -29.66 | -5.34 | 18% | 8 | N |

### 示例 3 — 业务招待费不可抵扣

**输入行：** `15.04.2026 ; RESTORAN SHIRVANSHAH ; DEBIT ; Dinner ; -180.00 ; AZN`

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框 | 默认？ | 排除？ |
|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | RESTORAN SHIRVANSHAH | -180.00 | -180.00 | 0 | — | — | Y | "业务招待费：不可抵扣" |

### 示例 4 — 出口（零税率）

**输入行：** `22.04.2026 ; TECHCORP LLC ; CREDIT ; IT services ; +8,500.00 ; AZN`

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框 | 默认？ | 问题？ |
|---|---|---|---|---|---|---|---|---|
| 22.04.2026 | TECHCORP LLC | +8,500 | +8,500 | 0 | 0% | 3 | Y | "核实出口文件" |

### 示例 5 — 机动车不可抵扣

**输入行：** `28.04.2026 ; BAKU AUTO ; DEBIT ; Car lease ; -850.00 ; AZN`

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框 | 默认？ | 排除？ |
|---|---|---|---|---|---|---|---|---|
| 28.04.2026 | BAKU AUTO | -850.00 | -850.00 | 0 | — | — | Y | "车辆：不可抵扣" |

### 示例 6 — 货物进口

**输入行：** `25.04.2026 ; CUSTOMS ; DEBIT ; Import EDV machinery ; -3,600 ; AZN`

| 日期 | 交易对手 | 总额 | 净额 | VAT | 税率 | 框 | 默认？ |
|---|---|---|---|---|---|---|---|
| 25.04.2026 | CUSTOMS | -3,600 | -3,051 | -549 | 18% | 9 | N |

---

## 第 5 节 — 一级分类规则（精简版）

### 5.1 标准税率 18%（《税法》第 175 条）
单一税率。销售计入框 1/2。采购计入框 8。

### 5.2 零税率
出口、国际运输、外交用品、特定农产品。计入框 3。

### 5.3 免税供应
金融服务、保险、医疗、教育、住宅租赁、公共交通、邮政。

### 5.4 反向征税 — 非居民服务（第 169 条）
按 18% 自行计税。框 5/6（销项）、框 10（进项抵扣）。对于完全应税业务，净额为零。

### 5.5 进口 EDV
在海关缴纳。计税基础 = 海关估值 + 关税。18%。计入框 9。可抵扣。

### 5.6 不可抵扣的进项 EDV
乘用车、业务招待、个人消费、无有效发票、用于免税供应。

### 5.7 贷项通知单
双方均在当期进行调整。

---

## 第 6 节 — 二级目录（精简版）

### 6.1 燃油/车辆 — *默认：* 0%。*问题：* "乘用车还是商用车？"
### 6.2 业务招待 — *默认：* 不可抵扣。
### 6.3 SaaS 实体 — *默认：* 反向征税。*问题：* "检查发票。"
### 6.4 所有者转账 — *默认：* 排除。*问题：* "销售款还是自有资金？"
### 6.5 境外汇入 — *默认：* 零税率。*问题：* "有出口文件吗？"
### 6.6 大额采购 — *问题：* "固定资产？"
### 6.7 混合用途电话 — *默认：* 0%。*问题：* "企业线路？"
### 6.8 现金提取 — *默认：* 排除。
### 6.9 租金 — *默认：* 无 EDV。*问题：* "含 EDV 的商业租赁？"

---

## 第 7 节 — Excel 工作底稿模板

遵循 `vat-workflow-base` 第 3 节，并使用阿塞拜疆特定的申报栏代码。

---

## 第 8 节 — 阿塞拜疆银行对账单阅读指南

**CSV 约定。** Kapital Bank 和 PASHA Bank 导出的文件使用分号作为分隔符，日期格式为 DD.MM.YYYY。

**阿塞拜疆语术语。** Emek haqqi（工资）、faiz（利息）、kredit（贷款）、nagd（现金）、daxili（内部）、gomruk（海关）、sigorta（保险）。

**内部转账。** 客户的 Kapital、PASHA、IBA 账户之间的转账。始终排除。

**外币。** 按阿塞拜疆中央银行汇率换算为 AZN。

**IBAN 前缀。** AZ = 阿塞拜疆。

---

## 第 9 节 — 引导信息收集的后备方案

### 9.1 实体类型 — *后备问题：*“个体经营者还是公司？”
### 9.2 EDV 登记 — *后备问题：*“增值税纳税人还是简化税制？”
### 9.3 VOEN — *后备问题：*“您的 VOEN 是什么？”
### 9.4 期间 — *推断依据：*对账单日期。
### 9.5 行业 — *后备问题：*“企业从事什么业务？”
### 9.6 免税供应 — *如果是，则触发 R-AZ-3。*
### 9.7 结转抵扣额 — *始终询问。*
### 9.8 跨境业务 — *后备问题：*“客户是否位于阿塞拜疆境外？”

---

## 第 10 节 — 参考资料

### 来源
1. 阿塞拜疆税法 — 第 159-184 条
2. 国家税务局 — https://www.taxes.gov.az
3. 阿塞拜疆中央银行 — https://www.cbar.az

### 变更日志
- **v2.0（2026 年 4 月）：** 按照 Malta v2.0 的 10 节结构全面重写。

## 阿塞拜疆增值税（EDV）Skill v2.0 结束

---

## 免责声明

本 Skill 及其输出仅用于提供信息和执行计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本 Skill 而产生的任何错误、遗漏或结果承担责任。在申报或据此采取行动之前，所有输出均须由合格的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人员）审核并签字确认。

本 Skill 最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持牌会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/azerbaijan-vat) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**附来源引用的草案**。如需始终保持最新的数据以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_