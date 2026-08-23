---
name: barbados-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for a Barbados VAT return for any client. Trigger on phrases like \"Barbados VAT\", \"BRA filing\", \"Barbados Revenue Authority\", or any request involving Barbados VAT. MUST be loaded alongside vat-workflow-base v0.1 or later. ALWAYS read this skill before touching any Barbados VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/barbados-vat"
  obligation: CT
---
# 巴巴多斯增值税申报 Skill v2.0

> **仅供一般参考。** 此 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定人士的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审查。未经相关司法管辖区的合格专业人士审查，请勿依赖此资料进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 巴巴多斯 |
| 标准税率 | 17.5% |
| 优惠税率 | 7.5%（酒店住宿） |
| 零税率 | 0%（出口、基本食品、处方药） |
| 免税 | 金融服务、住宅租金、教育、医疗、保险 |
| 申报表 | 增值税申报表（每两个月一次） |
| 申报门户 | https://bra.gov.bb（BRA 税务管理信息系统，TAMIS） |
| 主管机构 | 巴巴多斯税务局（BRA） |
| 货币 | BBD（巴巴多斯元，与 USD 按 2:1 挂钩） |
| 申报频率 | 每两个月一次 |
| 截止日期 | 双月申报期结束后次月 21 日 |
| 注册门槛 | 年营业额 BBD 200,000 |
| 配套 Skill | vat-workflow-base v0.1 或更高版本 — 必须加载 |
| 验证者 | 等待当地从业人员验证 |

**保守默认值：**

| 不明确事项 | 默认值 |
|---|---|
| 销售适用税率未知 | 17.5% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在地未知 | 巴巴多斯境内 |

---

## 第 2 节 — 必需输入和拒绝目录

### 必需输入

**最低可行要求** — 申报期内的银行对账单。可接受的来源包括：CIBC FirstCaribbean Barbados、Republic Bank Barbados、First Citizens Barbados、Scotiabank BB 或任何其他银行。

### 巴巴多斯特定拒绝目录

**R-BB-1 — 国际商业公司（IBC）。** 触发条件：客户是 IBC 或国际金融实体。消息："IBC 适用专门的税务处理。请升级处理。"

**R-BB-2 — 旅游税费的相互影响。** 触发条件：客户在缴纳增值税的同时还须缴纳旅游税费。消息："旅游税费与增值税的相互影响需要专家分析。请升级处理。"

---

## 第 3 节 — 供应商模式库

### 3.1 巴巴多斯银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| CIBC FIRSTCARIBBEAN BB, CIBC BB | EXCLUDE | 免税金融服务 |
| REPUBLIC BANK BB, REPUBLIC BANK BARBADOS | EXCLUDE | 同上 |
| FIRST CITIZENS BB | EXCLUDE | 同上 |
| SCOTIABANK BB | EXCLUDE | 同上 |
| INTEREST, LOAN | EXCLUDE | 不在范围内 |

### 3.2 政府（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BRA, BARBADOS REVENUE | EXCLUDE | 税款支付 |
| NIS, NATIONAL INSURANCE | EXCLUDE | 社会保障 |
| CUSTOMS | EXCLUDE | 关税 |

### 3.3 公用事业

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BL&P, BARBADOS LIGHT AND POWER, EMERA | 境内 17.5% | 电力 |
| BWA, BARBADOS WATER | 境内 17.5% | 供水 |
| FLOW, DIGICEL BB | 境内 17.5% | 电信 |

### 3.4 SaaS 和国际服务

| 模式 | 处理方式 | 备注 |
|---|---|---|
| GOOGLE, MICROSOFT, META, AWS | 自行核算 17.5% | 非居民 |
| ZOOM, SLACK, CANVA | 自行核算 17.5% | 同上 |

### 3.5 工资及排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SALARY, WAGES | 排除 | 不属于增值税范围 |
| OWN TRANSFER, INTERNAL | 排除 | 内部交易 |
| CASH WITHDRAWAL | 层级 2 — 询问 | 默认排除 |

---

## 第 4 节 — 完整示例

### 示例 1 — 按 17.5% 征税的标准境内销售

**输入行：** `05.04.2026 ; BRIDGETOWN TRADING ; CREDIT ; Invoice BB-041 ; BBD 1,175`

| 日期 | 交易对手 | 含税金额 | 不含税金额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 05.04.2026 | BRIDGETOWN TRADING | +1,175 | +1,000 | 175 | 17.5% | 销项 | N | — |

### 示例 2 — 按 7.5% 征税的酒店住宿

**输入行：** `10.04.2026 ; HOTEL GUEST ; CREDIT ; Room charge ; BBD 1,075`

| 日期 | 交易对手 | 含税金额 | 不含税金额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | HOTEL GUEST | +1,075 | +1,000 | 75 | 7.5% | 销项（较低税率） | N | — |

### 示例 3 — 出口，零税率

**输入行：** `15.04.2026 ; US BUYER ; CREDIT ; Exported rum ; BBD 10,000`

| 日期 | 交易对手 | 含税金额 | 不含税金额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | US BUYER | +10,000 | +10,000 | 0 | 0% | 零税率 | N | — |

### 示例 4 — 银行手续费

**输入行：** `30.04.2026 ; CIBC BB ; DEBIT ; Service fee ; BBD -50`

| 日期 | 交易对手 | 含税金额 | 不含税金额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 30.04.2026 | CIBC BB | -50 | — | — | — | — | N | "免税" |

---

## 第 5 节 — 层级 1 分类规则（精简版）

### 5.1 标准税率 17.5% — 所有应税供应的默认税率。
### 5.2 较低税率 7.5% — 酒店住宿。
### 5.3 零税率 — 出口、基本食品、处方药。
### 5.4 免税 — 金融服务、住宅租金、教育、医疗、保险。
### 5.5 进项税抵免 — 可以抵免。需要有效的税务发票。混合用途时按比例分摊。
### 5.6 不可抵扣进项税 — 招待娱乐、私人车辆、个人消费。
### 5.7 进口 — 按 CIF 加关税后的金额以 17.5% 征收增值税。
### 5.8 反向征税 — 非居民服务：自行核算 17.5%。

---

## 第 6 节 — 层级 2 目录（精简版）

### 6.1 酒店税率与标准税率 — 问题："这是住宿服务（7.5%）还是其他服务（17.5%）？"
### 6.2 旅游征费 — 默认：标记。
### 6.3 SaaS 实体 — 默认：自行核算 17.5%。
### 6.4 现金取款 — 默认：排除。

---

## 第 7 节 — Excel 工作底稿模板

根据 vat-workflow-base 第 3 节：销项 17.5%、销项 7.5%、零税率、免税、进项、应纳增值税净额。

---

## 第 8 节 — 银行对账单阅读指南

CIBC BB 和 Republic Bank BB 可导出 CSV/PDF。主要货币为 BBD（与 USD 的汇率为 2:1）。内部转账：排除。

---

## 第 9 节 — 初始设置后备方案

### 9.1 TIN — "BRA TIN?"
### 9.2 申报周期 — 每两个月一次。
### 9.3 行业 — "企业从事什么业务？"
### 9.4 出口 — "是否开展出口业务？"
### 9.5 上期结转抵免额 — 始终询问。

---

## 第 10 节 — 参考资料

### 来源
1. 巴巴多斯《增值税法》。2. BRA 指南。3. TAMIS 门户。

### 变更日志
- v2.0（2026 年 4 月）：按照马耳他 v2.0 的十节结构全面重写。

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。所有输出在申报前都必须由具备资质的专业人士审核。

最新版本维护于 [openaccountants.com](https://openaccountants.com)。

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者对于因使用本技能而产生的任何错误、遗漏或后果概不负责。所有输出在申报或据此采取行动之前，都必须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人士）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/barbados-vat) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据和具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_