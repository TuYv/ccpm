---
name: bahamas-vat
description: "Use this skill whenever asked to prepare, review, or classify transactions for a Bahamas VAT return for any client. Trigger on phrases like \"Bahamas VAT\", \"DIR Bahamas\", \"Department of Inland Revenue Bahamas\", or any request involving Bahamas VAT. The Bahamas has NO income tax — VAT is the primary tax. MUST be loaded alongside vat-workflow-base v0.1 or later. ALWAYS read this skill before touching any Bahamas VAT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bahamas-vat"
  obligation: CT
---
# 巴哈马增值税申报技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考材料。尚未针对任何特定个人的事实、文件、选择、截止日期、居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 第 1 节 — 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 巴哈马（巴哈马国） |
| 标准税率 | 10% |
| 优惠税率 | 5%（自 2025 年 4 月起适用于食品商店中的食品；自 2025 年 9 月起适用于药品、尿布和卫生用品） |
| 零税率 | 0%（出口、国际运输） |
| 免税 | 金融服务、住宅租金、教育、医疗、公共交通 |
| 申报表 | 增值税申报表（申报频率根据营业额确定） |
| 申报门户 | https://inlandrevenue.finance.gov.bs |
| 主管机构 | 税务局（DIR） |
| 货币 | BSD（巴哈马元，与 USD 按 1:1 挂钩） |
| 申报频率 | 每月（>BSD 5M）、每两个月（BSD 400K–5M）、每季度（BSD 100K–400K）、每年（自愿） |
| 截止日期 | 申报期结束后次月 21 日 |
| 注册门槛 | BSD 100,000 强制注册；BSD 50,000 自愿注册 |
| 无所得税 | 巴哈马不存在任何形式的所得税 |
| 配套技能 | vat-workflow-base v0.1 或更高版本 — 必须加载 |
| 验证方 | 等待当地执业专业人士验证 |

**保守默认值：**

| 模糊情况 | 默认值 |
|---|---|
| 销售适用税率未知 | 10% |
| 采购的增值税状态未知 | 不可抵扣 |
| 交易对手所在地未知 | 巴哈马境内 |
| 食品分类未知（商店与餐厅） | 10%（餐厅/预制食品） |

**红旗阈值：**

| 阈值 | 值 |
|---|---|
| 高风险单笔交易金额 | BSD 10,000 |
| 单个默认值导致的高风险税额差异 | BSD 500 |

---

## 第 2 节 — 必需输入与拒绝处理目录

### 必需输入

**最低可行要求** — 申报期内的银行对账单。可接受来自：CIBC FirstCaribbean、RBC Bahamas（Royal Bank）、Scotiabank Bahamas、Commonwealth Bank、Fidelity Bank 或任何其他银行。

### 巴哈马特定拒绝处理目录

**R-BS-1 — 大巴哈马自由港。** 触发条件：客户在大巴哈马港务局管辖区域内经营。消息：“《霍克斯比尔溪协议》下的自由港业务适用特殊增值税规定，需要专业分析。请升级处理。”

**R-BS-2 — 投资基金架构。** 触发条件：客户是投资基金。消息：“投资基金的增值税处理需要专业分析。请升级处理。”

---

## 第 3 节 — 供应商模式库

### 3.1 巴哈马银行（费用免税 — 排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| CIBC FIRSTCARIBBEAN, CIBC FC | 银行费用应 EXCLUDE | 金融服务，免税 |
| RBC BAHAMAS, ROYAL BANK | 银行费用应 EXCLUDE | 同上 |
| SCOTIABANK BS, COMMONWEALTH BANK | 银行费用应 EXCLUDE | 同上 |
| FIDELITY BANK | 银行费用应 EXCLUDE | 同上 |
| INTEREST, LOAN, REPAYMENT | EXCLUDE | 不在征税范围内 |

### 3.2 政府机构（排除）

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| DIR, DEPT INLAND REVENUE | 排除 | 税款支付 |
| CUSTOMS, BAHAMAS CUSTOMS | 排除 | 关税（进口增值税另计） |
| BUSINESS LICENCE, BL FEE | 排除 | 政府收费 |
| NIB, NATIONAL INSURANCE | 排除 | 国民保险 |

### 3.3 公用事业

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| BPL, BAHAMAS POWER AND LIGHT | 国内 10% | 电力 |
| WSC, WATER AND SEWERAGE | 国内 10% | 供水 |
| BTC, BAHAMAS TELECOMMUNICATIONS | 国内 10% | 电信 |
| ALIV | 国内 10% | 移动通信 |

### 3.4 保险（免税——排除）

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| BAHAMAS FIRST, COLINA, J.S. JOHNSON | 排除 | 免税 |
| SUMMIT INSURANCE | 排除 | 同上 |

### 3.5 SaaS 和国际服务

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| GOOGLE, MICROSOFT, META, AWS | 自行计征 10%（反向征税） | 非居民 |
| ZOOM, SLACK, CANVA | 自行计征 10% | 同上 |

### 3.6 旅游业

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| HOTEL, RESORT, ATLANTIS | 国内 10%（销项） | 旅游服务 |
| BOOKING.COM, EXPEDIA, AIRBNB | 平台费——核实实体 | 可能需要反向征税 |

### 3.7 工资薪酬及排除项

| 匹配模式 | 处理方式 | 备注 |
|---|---|---|
| SALARY, WAGES | 排除 | 无所得税；不属于增值税征税范围 |
| OWN TRANSFER, INTERNAL | 排除 | 内部转账 |
| DIVIDEND | 排除 | 无所得税 |
| CASH WITHDRAWAL | 第 2 级——询问 | 默认排除 |

---

## 第 4 节——完整示例

### 示例 1——按 10% 税率计税的标准国内销售

**输入行：** `05.04.2026 ; NASSAU TRADING CO ; CREDIT ; Invoice BS-041 ; BSD 1,100`

**判断依据：** 国内交易。税率为 10%。净额 = BSD 1,000，增值税 = BSD 100。

| 日期 | 交易对手 | 总额 | 净额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 05.04.2026 | NASSAU TRADING CO | +1,100 | +1,000 | 100 | 10% | 销项 | 否 | — |

### 示例 2——食品商店内按 5% 税率计税的食品（自 2025 年 4 月起）

**输入行：** `10.04.2026 ; SUPER VALUE FOOD STORE ; DEBIT ; Groceries ; BSD -105`

**判断依据：** 食品商店内的食品，自 2025 年 4 月起适用 5% 的优惠税率。净额 = BSD 100，增值税 = BSD 5。

| 日期 | 交易对手 | 总额 | 净额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 10.04.2026 | SUPER VALUE FOOD STORE | -105 | -100 | 5 | 5% | 进项 | 否 | — |

### 示例 3——出口，零税率

**输入行：** `15.04.2026 ; US BUYER INC ; CREDIT ; Exported conch ; BSD 5,000`

| 日期 | 交易对手 | 总额 | 净额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 15.04.2026 | US BUYER INC | +5,000 | +5,000 | 0 | 0% | 零税率 | 否 | — |

### 示例 4——非居民服务（反向征税）

**输入行：** `18.04.2026 ; US CONSULTING FIRM ; DEBIT ; Advisory ; BSD -3,000`

**判断依据：** 反向征税。自行计征 10% 的销项增值税 = BSD 300。如果全部用于应税活动，则可抵扣进项增值税 BSD 300。

| 日期 | 交易对手 | 总额 | 净额 | 增值税 | 税率 | 字段 | 默认？ | 已排除？ |
|---|---|---|---|---|---|---|---|---|
| 18.04.2026 | US CONSULTING FIRM | -3,000 | -3,000 | 300 | 10% | 销项 + 进项 | 否 | — |

### 示例 5 — 银行手续费，排除

**输入行：** `30.04.2026 ; CIBC FIRSTCARIBBEAN ; DEBIT ; Monthly fee ; BSD -25`

| 日期 | 交易对手 | 总额 | 净额 | 增值税 | 税率 | 字段 | 默认？ | 排除？ |
|---|---|---|---|---|---|---|---|---|
| 30.04.2026 | CIBC FIRSTCARIBBEAN | -25 | — | — | — | — | 否 | "免税" |

---

## 第 5 节 — 一级分类规则（精简版）

### 5.1 标准税率 10% — 大多数应税供应的默认税率。
### 5.2 优惠税率 5% — 食品店内销售的食品（自 2025 年 4 月起）、药品、尿布、卫生用品（自 2025 年 9 月起）。自 2026 年 4 月起，未经加工的食品将调整为 0% — 需核实。
### 5.3 零税率 — 出口、国际运输。
### 5.4 免税 — 金融服务、住宅租赁、教育、医疗、公共交通。
### 5.5 进项税抵扣 — 用于应税供应的采购可抵扣进项税。混合用途时需按比例分摊。
### 5.6 不得抵扣的进项税 — 娱乐、私人车辆、个人消费。
### 5.7 进口 — 按 CIF 加关税后的金额征收 10% 增值税。在海关缴纳。
### 5.8 反向征税 — 非居民服务：自行核算 10%。若用于应税供应，可申报进项税抵扣。
### 5.9 无所得税 — 巴哈马不征收所得税。增值税是主要财政收入来源。

---

## 第 6 节 — 二级目录（精简版）

### 6.1 食品分类 — 默认：10%，除非在食品店内销售。问题："这是食品店内销售的食品（5%），还是预制食品/餐厅食品（10%）？"
### 6.2 自由港业务 — 默认：拒绝（R-BS-1）。
### 6.3 旅游业 — 默认：10%。问题："酒店入住税是否与增值税分开征收？"
### 6.4 SaaS 实体 — 默认：自行核算 10%。
### 6.5 现金取款 — 默认：排除。

---

## 第 7 节 — Excel 工作底稿模板

依据 vat-workflow-base 第 3 节，并包含巴哈马字段：销项 10%、销项 5%、零税率、免税、境内进项、进口进项、应纳增值税净额。

---

## 第 8 节 — 银行对账单阅读指南

CIBC FirstCaribbean 和 RBC 可导出 CSV/PDF。主要货币为 BSD（= USD）。内部转账：排除。USD 无需进行外币换算（BSD 与 USD 按 1:1 挂钩）。

---

## 第 9 节 — 客户引导备用流程

### 9.1 TIN — "您的 DIR TIN 是什么？"
### 9.2 申报频率 — 基于营业额。"年营业额属于哪个区间？"
### 9.3 行业 — "企业从事什么业务？"
### 9.4 出口 — "您是否从事出口业务？"
### 9.5 自由港 — "您是否位于大巴哈马自由港？"（如果是，则触发 R-BS-1。）
### 9.6 前期结转抵免额 — 始终询问。

---

## 第 10 节 — 参考资料

### 来源
1. 《2014 年增值税法》（经修订）。2. DIR 指南。3. 税率历史：7.5%（2015 年）、12%（2018 年）、10%（2022 年）、5% 优惠税率（2025 年）。

### 已知缺口
1. 拒绝处理自由港业务。2. 食品零税率过渡（2026 年 4 月）— 需核实当前状态。3. 必须明确说明不征收所得税这一点。

### 变更日志
- v2.0（2026 年 4 月）：完全重写为 Malta v2.0 十节结构。

---

## 免责声明

本技能及其输出仅供信息和计算用途，不构成税务、法律或财务建议。所有输出在提交申报前都必须由合格的专业人士审核。

最新版本维护于 [openaccountants.com](https://openaccountants.com)。

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人士）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、请求持证会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bahamas-vat) — 面向 AI 的开放税务指南，由实名 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据及实名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_