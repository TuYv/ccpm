---
name: ae-corporate-tax
description: "> Use this skill whenever asked about UAE Corporate Tax for freelancers, sole establishments, or small businesses. Trigger on phrases like \"how much tax do I pay in UAE\", \"corporate tax UAE\", \"CT return\", \"FTA\", \"small business relief\", \"free zone tax\", \"qualifying free zone person\", \"AED 375,000\", \"9% tax\", \"taxable income UAE\", \"corporate tax registration\", \"UAE tax return\", \"self-employed tax UAE\", \"freelancer tax Dubai\", \"EmaraTax\", or any question about computing or filing UAE corporate tax. This skill covers the 0%/9% rate structure, small business relief (revenue under AED 3M), qualifying free zone person rules, deductible and non-deductible expenses, transfer pricing, registration requirements, and filing deadlines. Note: the UAE has NO personal income tax — self-employed individuals and sole establishments are subject to corporate tax. ALWAYS read this skill before touching any UAE corporate tax work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/ae-corporate-tax"
  obligation: OTHER
---
# 阿联酋企业税 — 自由职业者和个体企业 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。其内容尚未结合任何特定个人的事实情况、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核的情况下，请勿依赖本技能进行申报、缴税、修改申报或采取任何税务立场。

## 第 1 节 — 快速参考

### 企业税税率

| 应税所得（AED） | 税率 |
|---|---|
| 0 -- 375,000 | 0% |
| 375,001+ | 9% |

符合条件的自由区人士：符合条件的收入适用 0%；不符合条件的收入适用 9%。

阿联酋不征收个人所得税。自雇人士和个体企业在营业额超过 AED 1,000,000 时须缴纳企业税。

### 小型企业减免（SBR）

| 条件 | 要求 |
|---|---|
| 收入门槛 | <= AED 3,000,000 |
| 必须是居民人士 | 是 |
| 不得是 QFZP | 两者不可同时适用 |
| 需要作出选择 | 是 — 必须在企业税申报表中主动选择 |
| 效果 | 应税所得视为零；税额 = AED 0 |
| 亏损结转 | 在适用 SBR 的年度不可用 |
| 有效期 | 自 2026 年 12 月 31 日或之前开始的纳税期间 |

### 自然人门槛

| 规则 | 详情 |
|---|---|
| 营业额门槛 | 一个日历年度内 AED 1,000,000 |
| 低于门槛 | 无须缴纳企业税；无须注册 |
| 高于门槛 | 必须注册、申报并缴纳企业税 |

### 计算结构

| 步骤 | 说明 |
|---|---|
| A | 财务报表中的会计利润（IFRS） |
| B | +/- 企业税法要求的调整 |
| C | 减：免税收入（符合条件的股息、参股权益收入） |
| D | 加：不得扣除的支出 |
| E | 减：结转税务亏损（最高为应税所得的 75%） |
| F | 应税所得 |
| G | 减：AED 375,000 零税率区间 |
| H | 按 9% 征税的金额 |
| I | 应缴企业税 |

### 不得扣除的费用

| 费用 | 处理方式 |
|---|---|
| 罚款和处罚（政府） | 全额不得扣除 |
| 贿赂/腐败款项 | 全额不得扣除 |
| 不符合条件的捐赠 | 不得扣除 |
| 招待费 | 50% 不得扣除（仅允许扣除 50%） |
| 所有者的个人费用 | 全额不得扣除 |
| 所得税/企业税款 | 不得扣除 |
| 股息/利润分配 | 不属于费用 |
| 一般坏账准备 | 在核销前不得扣除 |
| 超出资本弱化上限的利息 | EBITDA 的 30% 或 AED 12M，以较高者为准 |

### 保守默认值

| 情况 | 默认假设 |
|---|---|
| 企业结构未知 | 停止 — 企业结构决定适用的规则 |
| SBR 资格不明确 | 检查收入是否 <= AED 3M；必须主动作出选择 |
| 招待费扣除 | 仅适用 50% |
| 个人费用与业务费用 | 拒绝个人费用；将混合用途费用标记为需审核 |
| QFZP 状态不确定 | 不要适用 0% — 标记为待核实 |
| 亏损结转金额未知 | 假设为零；标记待处理 |
| 申报截止日期计算 | 财政年度结束后 9 个月 |

### 红旗阈值

| 标记 | 阈值 |
|---|---|
| 收入 > AED 3M | 不适用 SBR |
| 收入 < AED 1M（自然人） | 无须缴纳 CT |
| 符合条件但未选择 SBR | 按常规方式计算税款 — 提醒客户 |
| 业务招待费全额扣除 | 必须限制为 50% |
| 业务成本中包含个人费用 | 不可扣除 — 移除 |
| 关联方交易 | 标记以进行转让定价审查 |

---

## 第 2 节 — 必需输入 + 拒绝处理目录

### 必需输入

1. **企业结构** — 独资企业、自由职业者、民事公司或其他实体
2. **纳税期内的收入** — 总营业额
3. **自由区状态** — 是否在阿联酋自由区注册？是否为 QFZP？
4. **财年结束日** — 决定申报截止日期
5. **总收入** — 业务总收入
6. **业务费用** — 性质和金额
7. **关联方交易** — 是否涉及任何关联人士
8. **以前年度亏损** — 可结转的税务亏损
9. **注册状态** — 是否已向 FTA 注册？
10. **VAT 注册状态** — 影响费用处理

### 拒绝处理目录

| 代码 | 情形 | 操作 |
|---|---|---|
| R-AE-1 | 企业结构未知 | 停止 — 无法确定适用规则 |
| R-AE-2 | 员工询问工资所得税 | 停止 — 阿联酋没有个人所得税；工资无需纳税 |
| R-AE-3 | 集团税收减免／控股公司结构 | 上报 — 复杂的集团规则超出范围 |
| R-AE-4 | 确定外国实体是否构成常设机构 | 上报 — 需要进行详细分析 |
| R-AE-5 | 支柱二（大型跨国企业适用 15% 税率） | 上报 — 适用于合并收入达到 EUR 750M 以上的集团 |
| R-AE-6 | 未经全面核实的 QFZP 申报 | 在确认所有条件前，不得适用 0% 税率 |

---

## 第 3 节 — 交易模式库

### 3.1 收入模式

| # | 摘要模式 | 税务项目 | 备注 |
|---|---|---|---|
| I-01 | `TRANSFER FROM [client]` / `INCOMING TT [client]` | 总收入 — 应缴 CT | 客户的标准电汇／转账 |
| I-02 | `SALARY TRANSFER` / `WPS CREDIT` | 非业务收入 — 雇佣收入 | 如果独资企业所有者向自己支付工资，则排除个人工资 |
| I-03 | `STRIPE PAYOUT AED` / `STRIPE PAYMENTS` | 总收入 — 还原为总额 | Stripe 净额付款；手续费可扣除 |
| I-04 | `PAYPAL TRANSFER AED` | 总收入 — 还原为总额或境外收入 | PayPal 付款；按付款方分类 |
| I-05 | `PAYONEER DEPOSIT` | 总收入 — 可能为境外来源 | Payoneer 结算款 |
| I-06 | `NETWORK INTL SETTLEMENT` / `VISA SETTLEMENT` | 总收入 — 卡支付 | 支付卡处理商结算款 |
| I-07 | `TABBY SETTLEMENT` / `POSTPAY DEPOSIT` | 总收入 — BNPL 结算款 | 先买后付平台付款 |
| I-08 | `FTA REFUND` / `TAX REFUND FTA` | 非收入 — 退税 | CT 或 VAT 退税 |
| I-09 | `INTEREST EARNED` / `PROFIT ON DEPOSIT` | 业务收入 — 如果是企业账户 | 企业存款的利息／收益 |
| I-10 | `RENTAL INCOME` / `RENT RECEIVED` | 如果是企业房产，则为业务收入 | 不动产收入 |

### 3.2 费用模式

| # | 摘要模式 | 税务项目 | 备注 |
|---|---|---|---|
| E-01 | `OFFICE RENT` / `RENT PAYMENT` / `EJARI` | 租金 — 可全额扣除 | 营业场所租金 |
| E-02 | `DEWA` / `SEWA` / `FEWA` / `AADC` / `ADDC` | 公用事业费 — 可全额扣除 | 迪拜/沙迦/富查伊拉/阿布扎比的公用事业费 |
| E-03 | `DU` / `ETISALAT` / `E& BUSINESS` | 电信费 — 可全额扣除 | 商务电话/互联网 |
| E-04 | `ADOBE` / `MICROSOFT 365` / `GOOGLE WORKSPACE` | 软件费 — 可全额扣除 | 专业工具 |
| E-05 | `ACCOUNTING FEE` / `AUDIT FEE` / `TAX AGENT` | 专业服务费 — 可全额扣除 | |
| E-06 | `EMIRATES` / `FLYDUBAI` / `ETIHAD` / `AIR ARABIA` | 航空差旅费 — 可全额扣除（商务） | 记录出行目的 |
| E-07 | `HOTEL` / `BOOKING.COM` / `AIRBNB` | 住宿费 — 可全额扣除（商务） | 商务差旅 |
| E-08 | `RESTAURANT` / `FOOD` / `ENTERTAINMENT` | 业务招待费 — 仅可扣除 50% | 上限为 50%；如全额扣除则标记 |
| E-09 | `SALIK` / `DARB` | 道路通行费 — 可按商务用途比例扣除 | 商务车辆使用 |
| E-10 | `ENOC` / `ADNOC` / `EMARAT` / `EPPCO` | 燃油费 — 可按商务用途比例扣除 | 商务车辆 |
| E-11 | `RTA` / `ITC` / `TAXI` / `CAREEM` / `UBER` | 交通费 — 可全额扣除（商务） | 商务差旅 |
| E-12 | `EMIRATES NBD FEE` / `FAB FEE` / `ADCB FEE` | 银行手续费 — 可全额扣除 | 企业账户费用 |
| E-13 | `INSURANCE` / `AMAN` / `DAMAN` / `AXA` | 保险费 — 可全额扣除（商务） | 商业保险 |
| E-14 | `VISA FEE` / `IMMIGRATION` / `MOHRE` | 政府规费 — 如用于商务则可扣除 | 员工签证、劳工许可证 |
| E-15 | `FTA PAYMENT` / `CT PAYMENT` | 税款 — 不可扣除 | 企业所得税税款 |
| E-16 | `VAT PAYMENT FTA` | 增值税税款 — 不可扣除 | 增值税单独处理 |
| E-17 | `FINE` / `PENALTY` / `TRAFFIC FINE` | 罚款 — 不可扣除 | 政府施加的处罚 |
| E-18 | `OWNER DRAWING` / `PERSONAL TRANSFER` | 个人支出 — 不可扣除 | 业主提款 |
| E-19 | `MARKETING` / `GOOGLE ADS` / `META ADS` | 营销费 — 可全额扣除 | 广告支出 |

### 3.3 阿联酋银行手续费（可扣除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| EMIRATES NBD | 企业账户手续费可扣除 | 阿联酋最大的银行 |
| FAB (First Abu Dhabi Bank) | 企业账户手续费可扣除 | |
| ADCB (Abu Dhabi Commercial Bank) | 企业账户手续费可扣除 | |
| MASHREQ, MASHREQBANK | 企业账户手续费可扣除 | |
| RAK BANK, NATIONAL BANK OF RAS AL KHAIMAH | 企业账户手续费可扣除 | |
| DIB (Dubai Islamic Bank) | 企业账户手续费可扣除 | |
| CBD (Commercial Bank of Dubai) | 企业账户手续费可扣除 | |
| ADIB (Abu Dhabi Islamic Bank) | 企业账户手续费可扣除 | |
| ENBD / FAB / ADCB ACCOUNT MAINTENANCE | 可扣除 | 每月/每季度账户费用 |
| SWIFT CHARGES, TT CHARGES | 可扣除 | 电汇手续费 |

### 3.4 政府及监管相关款项（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| FTA, FEDERAL TAX AUTHORITY | 排除 | 税款支付 |
| DED (Department of Economic Development) | 营业执照 — 可扣除 | 商业执照续期费 |
| DMCC, JAFZA, DAFZA, DIFC, ADGM | 自由区管理机构 — 可扣除 | 执照/注册费用 |
| RTA, ROADS AND TRANSPORT | 如为罚款则排除；如为通行费则可扣除 | 区分罚款与费用 |

### 3.5 内部转账和排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| INTERNAL TRANSFER, OWN ACCOUNT | 排除 | 内部资金转移 |
| LOAN REPAYMENT | 排除 | 偿还本金 |
| PERSONAL EXPENSE, OWNER DRAWING | 排除 | 不可扣除的个人支出 |
| CASH WITHDRAWAL, ATM | 第 2 级 — 询问 | 默认排除；确定用途 |

---

## 第 4 节 — 完整示例

### 示例 1 — 阿联酋国民银行（迪拜，IT 顾问 — SBR）

**银行：** 阿联酋国民银行企业账户
**客户：** Ahmed Al-Rashid，自由职业 IT 顾问，迪拜大陆地区

```
Date;Description;Debit;Credit;Balance
05/01/2025;TT FROM TECH CORP LLC;;85,000;
15/01/2025;ENBD ACCOUNT MAINT FEE;50;;
10/02/2025;TT FROM STARTUP FZE;;62,000;
28/02/2025;DEWA;1,200;;
15/03/2025;STRIPE PAYOUT AED;;34,000;
01/04/2025;GOOGLE ADS;3,500;;
20/04/2025;TT FROM GAMMA CONSULTING;;95,000;
15/06/2025;ACCOUNTING FEE;8,000;;
10/07/2025;EMIRATES FLIGHT;2,800;;
10/10/2025;RESTAURANT CLIENT DINNER;1,500;;
```

年化收入：AED 2,200,000（低于 AED 3M）。
符合 SBR 资格：是。必须在企业税申报表中主动选择。
如果选择 SBR：应税收入 = 零。税额 = AED 0。

如果未选择 SBR：
费用：会计费 AED 96,000、DEWA AED 14,400、营销费 AED 42,000、差旅费 AED 33,600、招待费 AED 18,000（50% = AED 9,000 可扣除）、银行手续费 AED 600，合计 AED 195,600。
应税收入：AED 2,200,000 - AED 195,600 = AED 2,004,400。
税额：(2,004,400 - 375,000) x 9% = AED 146,646。

提醒：客户应选择 SBR，从而支付 AED 0，而非 AED 146,646。

### 示例 2 — 阿布扎比第一银行（阿布扎比，工程顾问 — 不适用 SBR）

**银行：** 阿布扎比第一银行
**客户：** Sara Ibrahim，工程顾问，阿布扎比大陆地区

收入：AED 4,200,000（高于 AED 3M — 不可使用 SBR）。
可扣除费用：AED 1,800,000。招待费 AED 40,000（50% = AED 20,000）。
应税收入：AED 4,200,000 - AED 1,820,000 = AED 2,380,000。
税额：(2,380,000 - 375,000) x 9% = **AED 180,450**。

### 示例 3 — 阿布扎比商业银行（迪拜，收入低于 AED 1M 的自由职业者）

**银行：** 阿布扎比商业银行
**客户：** Omar Hassan，自由职业设计师，迪拜

收入：AED 750,000。低于自然人 AED 1,000,000 的门槛。
无需缴纳企业税。无需注册。
建议：监控收入；如果接近 AED 1M，应主动注册。

### 示例 4 — 马什雷克银行（DMCC 自由区，合格收入）

**银行：** 马什雷克银行企业账户
**客户：** TechSolutions FZ-LLC，DMCC 自由区公司，软件开发

收入：AED 5,000,000（全部来自自由区以外的企业客户）。
QFZP 条件：具备充足的实质经营活动、从事合格活动（可能包括制造/分销/总部服务）、无个人客户收入，并遵守转让定价规定。

如果属于 QFZP：合格收入按 0% 税率征税，非合格收入按 9% 税率征税。
提示：QFZP 的认定较为复杂。请核实所有条件。必须提供经审计的财务报表。

### 示例 5 — RAK Bank（拉斯海马，混入个人费用）

**银行：** RAK Bank
**客户：** Khalid Mahmoud，独资企业

费用包括：个人汽车租赁费 AED 36,000、家庭电话费 AED 6,000、度假费用 AED 15,000。
处理方式：所有个人费用均不得扣除。从扣除项中移除 AED 57,000。
如果汽车和电话部分用于业务：标记并交由审核人员确定合理的业务用途比例。

### 示例 6 — DIB（迪拜，采用 SBR 时的亏损结转）

**银行：** Dubai Islamic Bank
**客户：** Fatima Al-Zahra，顾问

2024 年：税务亏损 AED 200,000。
2025 年：收入 AED 2,500,000（符合 SBR 条件）。选择适用 SBR。
结果：应税所得视为零。以前年度亏损不得在适用 SBR 的年度使用。AED 200,000 的亏损仍可留待未来不适用 SBR 的年度使用。

---

## 第 5 节 — 一级规则（直接适用）

**T1-AE-1 — 阿联酋不征收个人所得税**
阿联酋不对个人征收个人所得税。个人取得的薪金、工资和投资收入无需纳税。企业所得税仅适用于经营活动。

**T1-AE-2 — 必须主动选择适用 SBR**
小型企业减免并非自动适用。必须通过 EmaraTax 在 CT 申报表中作出选择。如果未作出选择，则按常规方式计算税款。

**T1-AE-3 — 业务招待费的扣除比例上限为 50%**
业务招待支出仅可扣除 50%。始终适用 50% 的扣除比例上限。其余 50% 应调增计入应税所得。

**T1-AE-4 — 个人费用完全不得扣除**
业主的个人费用（个人汽车、家庭电话、度假、个人保险）不得扣除。应从业务扣除项中全额移除。

**T1-AE-5 — 亏损结转抵扣上限为 75%**
税务亏损可以无限期结转，但最多只能抵扣当年应税所得的 75%。其余 25% 应纳税。

**T1-AE-6 — 罚款和处罚金不得扣除**
政府处以的罚款（交通、监管、税务）一律不得扣除。应从扣除项中移除。

**T1-AE-7 — 申报截止日期为财年结束后 9 个月**
CT 申报表和税款应在财务年度结束后 9 个月内提交和缴纳。不存在预缴税款制度。

---

## 第 6 节 — 二级事项目录（需要审核人员判断）

| 代码 | 情形 | 上报原因 | 建议处理方式 |
|---|---|---|---|
| T2-AE-1 | QFZP 认定 | 条件复杂——实质要求、合格活动、最低限度测试 | 标记——必须由持牌税务代理核实所有条件 |
| T2-AE-2 | 关联方交易的转让定价 | 需要进行独立交易原则测试；可能需要准备文档 | 标记——确认服务性质和市场价格 |
| T2-AE-3 | 个人与业务混合费用 | 分摊需要有据可查的业务用途比例 | 标记——由审核人员确定合理的分摊比例 |
| T2-AE-4 | 资本弱化（利息费用扣除上限） | 净利息的扣除上限为 EBITDA 的 30% 或 AED 12M | 如果利息费用金额较大，则进行标记 |
| T2-AE-5 | 与阿联酋本土个人客户交易的自由区公司 | 属于非合格收入；可能违反 QFZP 最低限度测试 | 标记——需要检查 5% / AED 5M 门槛 |
| T2-AE-6 | 跨境付款的预提税 | 当前 WHT 税率为 0%，但可能发生变化或涉及税收协定的交互适用 | 上报以进行税收协定分析 |

---

## 第 7 节 — Excel 工作底稿模板

```
UAE CORPORATE TAX WORKING PAPER (FREELANCER / SOLE ESTABLISHMENT)
Taxpayer: _______________  TRN: _______________  FY End: _______________

SECTION A — REVENUE
                                        AED
Service income:                        ___________
Product sales:                         ___________
Other business income:                 ___________
TOTAL REVENUE                          ___________

SECTION B — SBR ELIGIBILITY CHECK
Revenue <= AED 3,000,000?              [ ] Yes  [ ] No
Resident Person?                       [ ] Yes  [ ] No
Not QFZP?                              [ ] Yes  [ ] No
SBR elected on return?                 [ ] Yes  [ ] No
If YES to all: taxable income = nil, tax = AED 0

SECTION C — DEDUCTIBLE EXPENSES (if SBR not elected)
Staff salaries/benefits:               ___________
Rent (business premises):              ___________
Utilities (DEWA/SEWA/etc.):           ___________
Telecom (du/Etisalat):                ___________
Software:                              ___________
Professional fees:                     ___________
Marketing:                             ___________
Travel (business):                     ___________
Insurance (business):                  ___________
Bank charges:                          ___________
Entertainment (50% of total):          ___________
Other deductible:                      ___________
TOTAL DEDUCTIBLE EXPENSES              ___________

SECTION D — NON-DEDUCTIBLE ITEMS (add back)
Entertainment (50% disallowed):        ___________
Personal expenses:                     ___________
Fines/penalties:                       ___________
Other non-deductible:                  ___________
TOTAL ADD-BACKS                        ___________

SECTION E — TAXABLE INCOME
Revenue - deductible expenses + add-backs: ___________
Less loss carry-forward (75% cap):     ___________
TAXABLE INCOME                         ___________

SECTION F — TAX COMPUTATION
AED 0 - 375,000:                       AED 0
Excess x 9%:                           ___________
CORPORATE TAX PAYABLE                  ___________

SECTION G — FILING DEADLINE
FY end + 9 months:                     ___________

SECTION H — REVIEWER FLAGS
[ ] Business structure confirmed?
[ ] Natural person AED 1M threshold checked?
[ ] SBR eligibility assessed and election advised?
[ ] Entertainment capped at 50%?
[ ] Personal expenses excluded?
[ ] Fines/penalties excluded?
[ ] Related party transactions flagged for TP?
[ ] Loss carry-forward limited to 75%?
[ ] Registration status confirmed with FTA?
[ ] QFZP conditions verified (if free zone)?
```

---

## 第 8 节 — 银行对账单阅读指南

### Emirates NBD
- 导出：从 ENBD Online Business Banking 导出 CSV/Excel
- 列：`Date;Description;Debit;Credit;Balance`
- 金额格式：以逗号作为千位分隔符，以句点作为小数点（例如 `85,000.00`）
- 日期：DD/MM/YYYY 或 YYYY-MM-DD
- 贷方摘要：`TT FROM [sender]`、`INCOMING REMITTANCE`

### First Abu Dhabi Bank (FAB)
- 导出：从 FAB Online 导出 CSV
- 列：`Date;Narrative;Debit;Credit;Balance`
- 标准阿联酋格式
- 贷方摘要：`INCOMING TT [sender]`、`CREDIT TRANSFER`

### ADCB（阿布扎比商业银行）
- 导出：从 ADCB Business Online 导出 CSV/Excel
- 列：`Date;Description;Debit Amount;Credit Amount;Balance`
- 贷记：`TT CREDIT FROM [sender]`

### Mashreq Bank
- 导出：从 Mashreq Online 导出 CSV
- 标准格式：`Date;Description;Debit;Credit;Balance`

### RAK Bank
- 导出：从 RAK Business Online 导出 CSV/PDF
- 标准格式

### Dubai Islamic Bank (DIB)
- 导出：从 DIB Business Online 导出 CSV
- 摘要中可能包含伊斯兰金融术语（Murabaha、Wakala）
- 利润分配：`PROFIT ON WAKALA DEPOSIT`（不是利息）

### Commercial Bank of Dubai (CBD)
- 导出：从 CBD Online 导出 CSV
- 阿联酋标准格式

### ADIB（阿布扎比伊斯兰银行）
- 导出：从 ADIB Online 导出 CSV
- 伊斯兰银行业务摘要

### 阿联酋银行业务要点
- 所有金额均以 AED（阿联酋迪拉姆）计价；逗号作为千位分隔符，句点作为小数点
- AED 以 3.6725 的固定汇率与 USD 挂钩
- 国际电汇通常显示为 `TT`（电汇）
- SWIFT 费用显示为单独的借记摘要
- WPS（工资保障系统）贷记属于工资——应从营业收入中排除
- 许多阿联酋企业在不同酋长国的多家银行开设账户

---

## 第 9 节 — 入门流程备用方案

**企业结构确认：**
> “在计算阿联酋企业所得税之前，我需要确认您的企业结构。您是持有自由职业许可证的注册自由职业者、个人独资企业，还是公司（LLC、FZ-LLC 等）？自然人（无贸易许可证的自由职业者）仅在年营业额超过 AED 1,000,000 时才需缴纳企业所得税。如果您是赚取工资的雇员，阿联酋不征收个人所得税，您也没有企业所得税义务。”

**SBR 资格：**
> “如果您的年收入不超过 AED 3,000,000，您可能符合小企业减免资格，这会使您的应税所得为零（税额为零）。但是，必须通过 EmaraTax 在企业所得税申报表中主动选择 SBR——它不会自动适用。您是否希望核查 SBR 资格？”

**注册状态：**
> “您是否已在联邦税务局完成企业所得税注册？所有阿联酋企业（包括个人独资企业和自由区公司）都必须在 EmaraTax 上注册并取得税务登记号（TRN）。逾期注册将产生 AED 10,000 的罚款。如果您尚未注册，我建议立即办理。”

**自由区状态：**
> “您的企业是否注册在阿联酋自由区？如果是，您可能符合合格自由区人士（QFZP）的资格，从而对合格收入适用 0% 的税率。QFZP 身份有严格要求，包括具备充足的实质、仅从事合格活动以及提供经审计的财务报表。在就 0% 税率提供建议之前，我需要核实所有条件。”

---

## 第 10 节 — 参考资料

### 主要法律法规
- **2022 年第 47 号联邦法令** — 公司及企业征税
- **2022 年第 116 号内阁决定** — 小企业减免
- **2023 年第 37 号内阁决定** — 自由区规则
- **2023 年第 73 号部长决定** — 不得扣除的支出
- **2025 年第 229 号部长决定** — 合格活动（QFZP）
- **2022 年第 28 号联邦法令** — 税务程序
- **2023 年第 75 号内阁决定** — 处罚

### 申报截止日期

| 财政年度结束日 | 企业税申报及缴税截止日期 |
|---|---|
| 2024年12月31日 | 2025年9月30日 |
| 2025年3月31日 | 2025年12月31日 |
| 2025年6月30日 | 2026年3月31日 |
| 2025年12月31日 | 2026年9月30日 |

### 罚款

| 违规行为 | 罚款 |
|---|---|
| 未按时注册 | AED 10,000 |
| 逾期申报 | 自截止日期次月起，每月 AED 500 |
| 逾期缴税 | 按未缴金额每年 14% 计收 |
| 未保存记录 | AED 10,000（首次）；AED 20,000（再次违规） |

### 记录保存
- 最短保存期限：自纳税期结束之日起 7 年
- 财务报表、会计记录、合同、发票、银行对账单
- QFZP 必须提供经审计的财务报表

### 实用参考资料
- FTA / EmaraTax：tax.gov.ae
- 企业税注册：EmaraTax 门户
- IFRS 指南：ifrs.org
- 自由区管理机构：DMCC、JAFZA、DAFZA、DIFC、ADGM（各自门户）

---

## 免责声明

本技能及其输出仅供信息和计算用途，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等资质的执业人士）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/ae-corporate-tax) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_