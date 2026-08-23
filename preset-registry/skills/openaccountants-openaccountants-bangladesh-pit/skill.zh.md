---
name: bangladesh-pit
description: "Use this skill whenever asked to prepare, review, or classify transactions for Bangladesh Personal Income Tax, annual return filing with NBR, or advise on Bangladeshi income tax slabs, exemptions, and investment rebates. Trigger on phrases like \"আয়কর\", \"income tax Bangladesh\", \"NBR\", \"TIN\", \"salary tax BD\", or any Bangladesh personal tax request. ALWAYS read this skill before touching any Bangladesh PIT work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: BD
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bangladesh-pit"
  tax_year: 2024-25
  obligation: IT
---
# 孟加拉国个人所得税（আয়কর）技能 v1.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的实际情况、文件、税务选择、截止日期、居民身份、申报身份或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核前，请勿依赖本技能进行申报、缴税、修正申报或采取任何税务立场。

---

## 第 1 节 — 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 孟加拉国（বাংলাদেশ） |
| 税种 | আয়কর（所得税） |
| 货币 | BDT（孟加拉塔卡 / ৳） |
| 纳税年度 | 7 月 1 日至 6 月 30 日 |
| 当前纳税年度 | 2024-25（2024 年 7 月至 2025 年 6 月） |
| 税务机关 | 国家税务局（NBR / জাতীয় রাজস্ব বোর্ড） |
| 纳税申报表 | IT-11GA（个人） |
| 申报门户 | https://etaxnbr.gov.bd |
| 申报截止日期 | 11 月 30 日（个人）；可延长至 1 月 31 日 |
| TIN | 12 位纳税人识别号 |
| 最低税额 | ৳5,000（达卡/吉大港市）；৳4,000（其他城市）；৳3,000（其他地区） |
| 来源归属 | `ssi-anik/bd-income-tax-calculator`（MPL-2.0，87 个星标） |
| 贡献者 | 开放会计师社区 |
| 验证者 | 待定 — 需要孟加拉国特许会计师或税务顾问签署确认 |
| 技能版本 | 1.0 |

---

## 第 2 节 — 按纳税人类别划分的免税起征点

| 纳税人类别 | 免税起征点（BDT） |
|---|---|
| 一般纳税人（男性，65 岁以下） | 3,50,000 |
| 女性或年龄在 65 岁及以上 | 4,00,000 |
| 残障人士（প্রতিবন্ধী） | 4,75,000 |
| 获政府公报承认的自由战士（মুক্তিযোদ্ধা） | 5,00,000 |

---

## 第 3 节 — 累进税率档次

对超过免税起征点的所得征税：

| 档次（超过起征点的应纳税所得额） | 税率 |
|---|---|
| 首个 ৳1,00,000 | 5% |
| 接下来的 ৳4,00,000 | 10% |
| 接下来的 ৳5,00,000 | 15% |
| 接下来的 ৳5,00,000 | 20% |
| 接下来的 ৳20,00,000 | 25% |
| 超过 ৳35,00,000 的剩余部分 | 30% |

**最低税额：** 即使计算得出的税额较低，也须根据所在地适用最低税额。

---

## 第 4 节 — 工资收入免税额

对于受薪雇员，以下组成部分可享受免税：

| 组成部分 | 免税限额 |
|---|---|
| 基本工资 | 全额应税 |
| 住房租金津贴 | 基本工资的 50% 或实际租金，以较低者为准；最高 ৳25,000/月 |
| 医疗津贴 | 基本工资的 10%；最高 ৳10,000/月 |
| 交通津贴 | 最高 ৳2,500/月 |
| 探亲休假补助（LFA） | 按实际金额或雇主政策执行 |
| 节日奖金 | 全额应税 |

**公式：** 应税工资 = 工资总额 − 住房租金津贴、医疗津贴和交通津贴的免税部分

---

## 第 5 节 — 投资税收抵免（বিনিয়োগ রেয়াত）

符合条件的投资包括：人寿保险保费、公积金缴款、共同基金份额、经批准的储蓄凭证、养老金计划、上市股票（持有 1 年以上）、DPS 和捐赠。

### 抵免额计算

| 应纳税所得总额 | 抵免率档次 |
|---|---|
| 不超过 ৳10,00,000 | 符合条件的投资中，首个 ৳2,50,000 按 15% 抵免 |
| ৳10,00,001 – ৳30,00,000 | 首个 ৳2,50,000 按 15% 抵免 + 接下来的 ৳5,00,000 按 12% 抵免 |
| 超过 ৳30,00,000 | 首个 ৳2,50,000 按 15% 抵免 + 接下来的 ৳5,00,000 按 12% 抵免 + 剩余部分按 10% 抵免 |

**上限：** 符合条件的投资额上限 = 应税总收入的 25% 或 ৳1,50,00,000（1.5 crore），以较低者为准。

---

## 第 6 节 — 计算方法

```
Step 1: Calculate total income from all heads
        (Salary, House Property, Business/Profession, Capital Gains, Other Sources)
Step 2: Determine taxpayer category → tax-free threshold
Step 3: Taxable income = Total income − tax-free threshold
Step 4: Apply progressive slabs (Section 3)
Step 5: = Gross tax
Step 6: − Investment rebate (Section 5)
Step 7: = Net tax payable
Step 8: Ensure ≥ minimum tax (Section 1)
Step 9: − Tax Deducted at Source (TDS) / Advance Income Tax (AIT)
Step 10: = Final tax payable or refund
```

---

## 第 7 节 — 计算示例

**情景：** 达卡的一名男性雇员，35 岁，年薪构成：基本工资 ৳60,000/月，HRA ৳30,000/月，医疗津贴 ৳6,000/月，交通津贴 ৳2,500/月，节日奖金 ৳1,20,000/年。储蓄证书投资额：৳3,00,000。

| 构成项目 | 年度金额 | 免税金额 | 应税金额 |
|---|---|---|---|
| 基本工资 | 7,20,000 | 0 | 7,20,000 |
| 住房租金津贴 | 3,60,000 | 3,00,000 (25K×12) | 60,000 |
| 医疗津贴 | 72,000 | 72,000（基本工资的 10%，未超过上限） | 0 |
| 交通津贴 | 30,000 | 30,000 (2,500×12) | 0 |
| 节日奖金 | 1,20,000 | 0 | 1,20,000 |
| **总计** | **13,02,000** | | **9,00,000** |

税款计算（男性，一般免税门槛为 ৳3,50,000）：

| 税级 | 金额 | 税率 | 税款 |
|---|---|---|---|
| 免税门槛 | 3,50,000 | 0% | 0 |
| 接下来的 1,00,000 | 1,00,000 | 5% | 5,000 |
| 接下来的 4,00,000 | 4,00,000 | 10% | 40,000 |
| 剩余的 50,000 | 50,000 | 15% | 7,500 |
| **税款总额** | | | **52,500** |

投资退税：min(25% × 9,00,000 = 2,25,000；实际投资额 3,00,000) → 符合条件的金额 = ₹2,25,000  
退税额：15% × 2,25,000 = ৳33,750

**应纳税款净额：52,500 − 33,750 = ৳18,750**（高于 ৳5,000 的最低税额 ✓）

---

## 第 8 节 — 申报指南

### 哪些人必须申报？

- 任何持有 TIN 的个人（许多服务强制要求：余额 >1M 的银行账户、信用卡、进出口、担任公司董事、城市法人机构营业执照）
- 应税收入超过免税门槛的任何个人

### 关键日期

| 事项 | 截止日期 |
|---|---|
| 纳税年度结束 | 6 月 30 日 |
| 纳税申报截止日期 | 11 月 30 日 |
| 延长后的截止日期 | 1 月 31 日（需提出申请） |
| 纳税日（提交申报表活动） | 11 月 |

### 收入类别

| 类别 | 示例 |
|---|---|
| 工资薪金 | 雇佣收入 |
| 房产 | 租金收入 |
| 商业/专业 | 自营职业、贸易 |
| 资本利得 | 出售房产、股份 |
| 其他来源 | 利息、股息、特许权使用费 |

---

## 第 9 节 — 保守处理默认值

| 情况 | 保守处理方式 |
|---|---|
| 工资构成不明确 | 归类为应税；标记以供审核人员复核 |
| 缺少投资退税证明文件 | 不申报退税；标记 |
| 无法提供 TDS 证明 | 不予抵扣；标记 |
| 境外收入 | 如为居民则计入；标记税收协定的适用性 |
| 最低税额与计算税额 | 如果计算税额较低，则采用最低税额 |

---

## 第 10 节 — 来源

| 来源 | URL |
|---|---|
| NBR（国家税务局） | https://nbr.gov.bd |
| e-Tax NBR | https://etaxnbr.gov.bd |
| 《1984 年所得税条例》 | — |
| `ssi-anik/bd-income-tax-calculator`（MPL-2.0） | https://github.com/ssi-anik/bd-income-tax-calculator |

---

*OpenAccountants — 面向 AI 的开源会计技能*
*这不构成税务建议。所有输出在申报前都必须由具备资质的专业人士审核。*

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bangladesh-pit) — 面向 AI 的开放税务指南，由署名的 CPA/CA/EA 审核。质量：**有来源引用的草案**。如需始终保持最新的数据以及署名会计师的支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_