---
name: bc-individual-return
description: "> Use this skill whenever asked about British Columbia provincial income tax for a self-employed sole proprietor. Trigger on phrases like \"BC tax\", \"BC428\", \"British Columbia income tax\", \"BC tax brackets\", \"BC tax reduction\", \"BC climate action tax credit\", \"provincial tax BC\", or any question about computing BC provincial tax for a self-employed individual. Covers BC tax brackets, personal credits, BC tax reduction, climate action tax credit, and BC-specific rules. ALWAYS read this skill before touching any BC provincial tax work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: CA
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bc-individual-return"
  tax_year: 2025
  obligation: IT
---
# 不列颠哥伦比亚省所得税 -- 独资经营者 Skill v2.0

> **仅供一般参考。** 本 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实、文件、税务选择、截止日期、居住地、申报身份或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本 Skill 进行申报、缴税、修改申报或采取税务立场。

---

## 第 1 节 -- 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 加拿大 -- 不列颠哥伦比亚省 |
| 税种 | 省级所得税（BC428） |
| 货币 | 仅限 CAD |
| 纳税年度 | 日历年度 |
| 主要法律 | 《不列颠哥伦比亚省所得税法》，RSBC 2002, c. 27 |
| 配套法律 | 《所得税法》（加拿大）；不列颠哥伦比亚省 2025 年预算 |
| 税务机关 | CRA，代表不列颠哥伦比亚省征管 |
| 申报门户 | CRA My Account / NETFILE / EFILE |
| 表格 | BC428 -- 不列颠哥伦比亚省税 |
| 申报截止日期 | 6 月 15 日（自雇人士）；税款须在 4 月 30 日前缴纳 |
| 贡献者 | Open Accountants Community |
| 验证者 | 待定 -- 需要加拿大 CPA 签字确认 |
| Skill 版本 | 2.0 |

### 不列颠哥伦比亚省税率（2025 年）

| 应纳税所得额（CAD） | 边际税率 | 累计税额 |
|---|---|---|
| 0 -- 47,937 | 5.06% | 2,426 |
| 47,938 -- 95,875 | 7.70% | 6,117 |
| 95,876 -- 110,076 | 10.50% | 7,608 |
| 110,077 -- 133,664 | 12.29% | 10,508 |
| 133,665 -- 181,232 | 14.70% | 17,500 |
| 181,233 -- 252,752 | 16.80% | 29,515 |
| 252,753+ | 20.50% | 29,515+ |

### 不列颠哥伦比亚省主要税收抵免（2025 年）

| 抵免项目 | 金额 | 税收价值（x 5.06%） |
|---|---|---|
| 基本个人免税额 | $12,580 | $636 |
| 配偶免税额 | $12,580 减去配偶收入 | 最高 $636 |

### 不列颠哥伦比亚省税款减免（低收入）

最高减免额：$521 + 每名受抚养人 $152。按净收入的 3.56% 递减。单身人士的净收入达到约 $14,635 时完全取消。

### 气候行动税收抵免（可退还）

$504/个人 + $252/配偶 + $126/子女（按年计算，由 CRA 按季度支付）。家庭收入超过 $41,071 的部分按 2% 递减。

### 保守默认值

| 不明确事项 | 默认处理 |
|---|---|
| 省份未知 | 不应用本 Skill |
| 税级年度未知 | 使用 2025 年指数化调整后的数值 |
| 医疗/慈善金额未知 | $0 |

---

## 第 2 节 -- 必需输入和拒绝目录

### 必需输入

**最低可用要求** -- 12 月 31 日的居住省份（必须为不列颠哥伦比亚省）、联邦应纳税所得额（T1 line 26000）、联邦净收入（T1 line 23600）。

**建议提供** -- 婚姻状况、配偶收入、受抚养人、医疗费用、慈善捐款。

**理想情况** -- 完整的 T1 数据、上一年度的 BC428、适用时提供残障证明。

### 拒绝目录

**R-BC-1 -- 非不列颠哥伦比亚省居民。** “12 月 31 日的居住省份不是不列颠哥伦比亚省。本 Skill 不适用。”

**R-BC-2 -- 公司/信托。** “本 Skill 仅适用于个人独资经营者。”

**R-BC-3 -- 部分年度居民。** “部分年度的省级居住身份需要专家分析。请升级处理。”

**R-BC-4 -- 原住民免税。** “《印第安人法》第 87 条规定的免税需要专家分析。请升级处理。”

---

## 第 3 节 -- 交易模式库

BC 省税基于联邦报税表数据计算，而不是直接根据银行交易计算。交易模式库位于 `ca-fed-t2125` skill 中。本 skill 使用该计算的输出（应税收入、净收入），并应用 BC 税率和抵免。

---

## 第 4 节 -- 计算示例

### 示例 1 -- 低收入，单身

**输入：** 应税收入 $25,000。净收入 $25,000。单身，无受抚养人。

**计算：**
- BC 税总额：$25,000 x 5.06% = $1,265.00
- BC 基本个人抵免：$12,580 x 5.06% = $636.55
- BC 基本税额：$1,265.00 - $636.55 = $628.45
- BC 税额减免：$521 - (3.56% x $25,000) = $521 - $890 = $0（已完全抵减）
- BC 税额净额：$628.45

### 示例 2 -- 中等收入

**输入：** 应税收入 $80,000。单身。

**计算：**
- 前 $47,937 按 5.06% 计算 = $2,425.61
- $32,063 按 7.70% 计算 = $2,468.85
- BC 税总额：$4,894.46
- 抵免：$636.55
- BC 税额净额：$4,257.91

### 示例 3 -- 高收入，最高税级

**输入：** 应税收入 $300,000。已婚，配偶收入 $0。

**计算：**
- 截至 $252,752 的税额 = $29,515
- $47,248 按 20.50% 计算 = $9,685.84
- BC 税总额：$39,200.84
- 抵免：基本抵免 $636.55 + 配偶抵免 $636.55 = $1,273.10
- BC 税额净额：$37,927.74

### 示例 4 -- 低于基本个人免税额

**输入：** 应税收入 $10,000。

**计算：**
- BC 税总额：$506.00
- 抵免：$636.55
- BC 税额净额：$0

---

## 第 5 节 -- 第 1 级规则（数据明确时）

### 5.1 BC 税额计算

从 T1 第 26000 行的应税收入开始。应用 BC 的 7 档边际税率。减去按 5.06% 计算的不可退还抵免。在适用的情况下应用 BC 税额减免。

### 5.2 BC 税额减免

**法律依据：** BC ITA, s. 4.62

最高 $521 + 每名受抚养人 $152。抵免百分比：净收入的 3.56%。减免额 = 最高金额 - 抵免百分比对应金额。不得低于零。

### 5.3 政治捐款抵免

前 $100 按 75% 计算，$100.01-$550 按 50% 计算并加 $75，$550.01-$1,150 按 33.33% 计算并加 $300。最高 $500。

### 5.4 股息税收抵免

合格股息：加计后金额的 12.0%。非合格股息：1.96%。

---

## 第 6 节 -- 第 2 级事项目录（需要审核人员判断）

### 6.1 在多个省份取得自雇收入

如果在多个省份取得营业收入，可能需要填写 T2203。标记为需要审核。

### 6.2 BC 租客税收抵免

收入低于门槛的租客每年最多可获得 $400。同一空间不能同时申报租客抵免和居家办公扣除。标记为需要审核。

### 6.3 BC 老年人住宅装修税收抵免

65 岁及以上个人可按合格费用的 10% 申报抵免（费用上限为 $10,000）。标记为需要审核。

---

## 第 7 节 -- Excel 工作底稿模板

```
BC PROVINCIAL TAX -- Working Paper (2025)

A. INCOME
  A1. Taxable income (T1 line 26000)               ___________
  A2. Net income (T1 line 23600)                    ___________

B. BC TAX COMPUTATION
  B1. Gross BC tax (7 brackets)                     ___________
  B2. BC non-refundable credits (x 5.06%)           ___________
  B3. BC basic tax (B1 - B2, min 0)                 ___________
  B4. BC tax reduction                              ___________
  B5. Net BC tax (B3 - B4, min 0)                   ___________
  B6. BC dividend tax credits                       ___________
  B7. BC political contribution credit              ___________
  B8. BC tax payable                                ___________

REVIEWER FLAGS:
  [ ] Province confirmed as BC on Dec 31?
  [ ] 2025 indexed thresholds used?
  [ ] Part-year / multi-province flagged?
```

---

## 第 8 节——银行对账单阅读指南

不直接根据银行对账单计算 BC 省税。有关银行对账单分类，请参阅 `ca-fed-t2125`。BC428 使用联邦报税表的输出。

---

## 第 9 节——引导流程后备方案

```
ONBOARDING QUESTIONS -- BC PROVINCIAL TAX
1. Province of residence on December 31?
2. Federal taxable income (T1 line 26000)?
3. Federal net income (T1 line 23600)?
4. Marital status and spouse net income?
5. Number of dependants?
6. Medical expenses claimed federally?
7. Charitable donations claimed federally?
8. BC political contributions?
9. Disability certificate (T2201)?
10. Do you rent your residence in BC?
```

---

## 第 10 节——参考资料

| 主题 | 参考依据 |
|---|---|
| BC 税率档次 | BC ITA, s. 4.1 |
| 不可退还税收抵免 | BC ITA, s. 4.3 et seq. |
| BC 减税额 | BC ITA, s. 4.62 |
| 政治捐款税收抵免 | BC ITA, s. 4.73 |
| 气候行动税收抵免 | BC ITA, s. 8.1 |
| 股息税收抵免 | BC ITA, s. 4.69 |

---

## 禁止事项

- 如果纳税人在 12 月 31 日的居住省份不是 BC，绝不应用此技能
- 绝不为公司、合伙企业或信托计算税款
- 绝不猜测原住民免税金额
- 绝不使用往年税率档次金额
- 绝不在同一年度将此技能与其他省级技能结合使用
- 绝不申报已失效的税收抵免
- 绝不将计算结果表述为确定无误

---

## 免责声明

此技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用此技能而产生的任何错误、遗漏或后果承担责任。在申报或据此采取行动之前，所有输出均必须由合格的专业人士（例如 CPA、CA 或具备同等资质的执业专业人士）审核并签字确认。

此技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bc-individual-return)——面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**注明来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_