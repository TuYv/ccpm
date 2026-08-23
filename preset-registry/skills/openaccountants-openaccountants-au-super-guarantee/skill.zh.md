---
name: au-super-guarantee
description: "> Use this skill whenever asked about Australian Superannuation Guarantee (SG) obligations, voluntary super contributions, concessional and non-concessional caps, Division 293 tax, government co-contribution, spouse contribution tax offset, carry-forward rules, or any question about super for sole traders or employers. Trigger on phrases like \"how much super do I pay\", \"SG rate\", \"super guarantee\", \"concessional cap\", \"Division 293\", \"salary sacrifice super\", \"personal super contribution deduction\", \"co-contribution\", \"BPAY super\", \"ATO super clearing house\", \"super fund contribution\", or any question about Australian superannuation. Also trigger when classifying bank statement transactions showing super fund payments, BPAY super debits, or ATO Small Business Super Clearing House (SBSCH) payments. ALWAYS read this skill before touching any SG-related work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AU
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/au-super-guarantee"
  tax_year: 2024-25
  obligation: OTHER
---
# 澳大利亚退休金保障（SG）——个体经营者与雇主技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、选择、截止日期、税务居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核之前，请勿依赖本技能进行申报、付款、更正申报或采取税务立场。

## 第 1 节——快速参考

**在计算或分类任何事项之前，请完整阅读本节。**

| 字段 | 值 |
|---|---|
| 国家 | 澳大利亚 |
| 主要立法 | 《1992 年退休金保障（管理）法》（SGAA 1992） |
| 配套立法 | 《1993 年退休金行业（监管）法》；《1997 年所得税评估法》第 290-293 部；《2003 年共同供款法》 |
| 税务机关 | 澳大利亚税务局（ATO） |
| 纳税年度 | 2024-25（2024 年 7 月 1 日至 2025 年 6 月 30 日） |
| 货币 | 仅限 AUD |
| SG 比率（2024-25） | 11.5%（自 2025 年 7 月 1 日起为 12%） |
| 最高供款基数（每季度） | $65,070 |
| 优惠供款上限（2024-25） | $30,000 |
| 非优惠供款上限（2024-25） | $120,000（结转启用安排下为 $360,000） |
| 一般转移余额上限 | $1,900,000 |
| 第 293 部门槛 | $250,000 |
| SG 季度截止日期 | 10 月 28 日、1 月 28 日、4 月 28 日、7 月 28 日 |
| 个体经营者为自己缴纳 SG | 无义务——仅可自愿缴纳 |
| 发薪日退休金制度 | 自 2026 年 7 月 1 日起实施 |
| 贡献者 | Open Accountants |
| 验证者 | 待定 |
| 验证日期 | 2026 年 4 月 |

**保守默认值：**

| 不明确事项 | 默认处理 |
|---|---|
| 实体结构未知 | 询问——个体经营者与公司在 SG 义务方面有所不同 |
| 不确定个体经营者是否有雇员 | 询问——这决定是否有 SG 义务 |
| SG 比率适用年度未知 | 2024-25 = 11.5%；2025-26 = 12% |
| 用于结转的 TSB 未知 | 假定 >= $500,000（不可结转）；询问客户 |
| s 290-150 通知状态未知 | 假定尚未提交；就截止日期发出警告 |
| 承包商还是雇员不明确 | 标记供审核人员处理——采用多因素测试 |

---

## 第 2 节——必需输入与拒绝事项目录

### 必需输入

**最低可行要求**——实体结构（个体经营者/公司/信托/合伙企业）、客户是否有雇员、每季度 OTE（针对雇主），以及自愿供款意向（针对个体经营者）。

**建议提供**——显示退休金基金扣款的银行对账单、列有 OTE 的员工名册、上一年度 6 月 30 日的 TSB，以及用于第 293 部计算的应税收入。

**理想情况**——完整的经营活动报表数据、退休金基金成员对账单、s 290-150 通知副本，以及显示供款上限的 ATO 在线账户。

### 拒绝事项目录

**R-AU-SG-1——固定收益基金。** *触发条件：*客户持有固定收益基金。*提示信息：*“固定收益基金的计算由精算确定，不在本技能范围内。请升级处理。”

**R-AU-SG-2——受宪法保护的基金。** *触发条件：*客户持有受宪法保护的州基金。*提示信息：*“不在本技能范围内。请升级处理。”

**R-AU-SG-3——家庭法分割。** *触发条件：*离婚时分割退休金。*提示信息：*“家庭法下的退休金分割需要法律意见。不在本技能范围内。”

**R-AU-SG-4 -- SGC 罚款计算。** *触发条件：* 客户已错过 SG 截止日期，并询问 SGC。*消息：* “养老金保障费的计算应上报给具备资质的专业人士处理。SGC 包括欠缴金额 + 10% 名义利息 + 每名员工每季度 $20，且不得在税前扣除。”

---

## 第 3 节 -- 付款模式库

这是用于对银行对账单中与养老金相关的交易进行确定性预分类的分类器。

### 3.1 养老金基金供款（雇主 SG 或个人供款）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SUPER, SUPERANNUATION | EXCLUDE -- 养老金供款 | 一般养老金付款 |
| AUSTRALIAN SUPER, AUSTSUPER | EXCLUDE -- 养老金供款 | AustralianSuper 基金 |
| REST, REST SUPER | EXCLUDE -- 养老金供款 | 零售业雇员养老金基金 |
| HOSTPLUS | EXCLUDE -- 养老金供款 | 酒店餐饮业基金 |
| CBUS, CBUS SUPER | EXCLUDE -- 养老金供款 | 建筑业基金 |
| SUNSUPER, AUSTRALIAN RETIREMENT TRUST | EXCLUDE -- 养老金供款 | 总部位于昆士兰州的基金（已合并） |
| UNISUPER | EXCLUDE -- 养老金供款 | 大学行业基金 |
| HESTA | EXCLUDE -- 养老金供款 | 医疗卫生行业基金 |
| COLONIAL FIRST STATE, CFS | EXCLUDE -- 养老金供款 | 零售基金 |
| AMP SUPER, AMP | EXCLUDE -- 养老金供款 | 零售基金 |
| MLC SUPER, MLC | EXCLUDE -- 养老金供款 | 零售基金 |
| BT SUPER | EXCLUDE -- 养老金供款 | 零售基金 |
| SMSF (+ fund name) | EXCLUDE -- 养老金供款 | 自主管理养老金基金 |

### 3.2 BPAY 养老金付款

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BPAY SUPER, BPAY (+ fund name) | EXCLUDE -- 养老金供款 | BPAY 是常见的养老金付款方式 |
| BPAY (biller code matching known super fund) | EXCLUDE -- 养老金供款 | 检查 BPAY 账单机构代码 |

### 3.3 ATO 小企业养老金清算所（SBSCH）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ATO SUPER, ATO CLEARING HOUSE | EXCLUDE -- 养老金供款 | 小企业（员工少于 20 人）可通过 ATO SBSCH 缴纳 SG |
| ATO SBSCH | EXCLUDE -- 养老金供款 | 清算所付款 |
| SMALL BUSINESS SUPERANNUATION | EXCLUDE -- 养老金供款 | ATO SBSCH 参考信息 |

### 3.4 养老金保障费（SGC -- 逾期/漏缴 SG）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ATO SGC, SUPER GUARANTEE CHARGE | EXCLUDE -- SGC 付款 | 向 ATO 缴纳的 SG 逾期罚款 |

### 3.5 薪金与工资（非养老金）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| SALARY, WAGES (outgoing) | 非养老金 | 工资费用 -- SG 与工资分开缴纳 |
| PAYROLL | 非养老金 | 工资付款 |

### 3.6 ATO 税款支付（非养老金）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ATO IAS, ATO BAS | EXCLUDE -- 税款 | 活动报表付款（PAYG/GST） |
| ATO INCOME TAX | EXCLUDE -- 税款 | 非养老金 |

---

## 第 4 节 -- 示例详解

以下是对一家拥有 2 名员工的假设澳大利亚个体经营者的六笔银行对账单交易进行分类的示例。

### 示例 1 -- 向员工的养老金基金缴纳季度 SG 供款

**输入行：**
`28.10.2024 ; AUSTRALIAN SUPER ; DEBIT ; SG Q1 2024-25 EMPLOYEE A ; -2,300.00 ; AUD`

**推理：**
匹配“AUSTRALIAN SUPER”（模式 3.1）。金额 $2,300 = $20,000 OTE x 11.5% SG。这是员工 A 的 Q1（7 月至 9 月）SG 缴款，于 10 月 28 日截止日期前支付。雇主可将其作为税前扣除。

**分类：** EXCLUDE -- 员工的 SG 缴款。可税前扣除的业务费用。

### 示例 2 -- 个人自愿养老金缴款（个体经营者）

**输入行：**
`15.05.2025 ; BPAY HOSTPLUS ; DEBIT ; PERSONAL CONTRIBUTION ; -10,000.00 ; AUD`

**推理：**
匹配“BPAY”+“HOSTPLUS”（模式 3.2）。个体经营者正在进行个人养老金缴款。该缴款是否属于优惠缴款（可扣除）取决于是否已提交 s 290-150 通知并获得确认。如果已提交通知：$10,000 属于优惠缴款，可税前扣除，并在基金内按 15% 征税。如果未提交通知：属于非优惠缴款，不可扣除。

**分类：** EXCLUDE -- 个人养老金缴款。可扣除性取决于 s 290-150 通知的状态。标记：“是否已向基金提交扣除申报意向通知？”

### 示例 3 -- 通过 ATO 小型企业清算所付款

**输入行：**
`27.01.2025 ; ATO SUPER CLEARING HOUSE ; DEBIT ; SG Q2 ALL EMPLOYEES ; -4,600.00 ; AUD`

**推理：**
匹配“ATO SUPER CLEARING HOUSE”（模式 3.3）。小型企业通过 ATO SBSCH 为所有员工支付 SG。清算所会将款项分配至每名员工指定的基金。Q2（10 月至 12 月）款项在 1 月 28 日截止日期前支付。

**分类：** EXCLUDE -- 通过 SBSCH 支付的 SG 缴款。可税前扣除。

### 示例 4 -- OTE 超过最高缴款基数

**输入行：**
`28.04.2025 ; REST SUPER ; DEBIT ; SG Q3 EMPLOYEE B ; -7,483.05 ; AUD`

**推理：**
匹配“REST SUPER”（模式 3.1）。金额 $7,483.05 = $65,070（最高缴款基数）x 11.5%。员工 B 在 Q3 的 OTE 超过 $65,070，因此 SG 设有上限。

**分类：** EXCLUDE -- SG 缴款（以最高缴款基数为上限）。

### 示例 5 -- 个体经营者询问自身的 SG

**输入行：**
未发现个体经营者本人账户的养老金基金扣款。

**推理：**
个体经营者没有为自己支付 SG 的义务。业主提款不属于工资。如果个体经营者希望缴纳养老金，则必须进行自愿个人缴款。

**分类：** 个体经营者本人账户无需支付 SG。建议制定自愿缴款策略。

### 示例 6 -- ATO 税款支付（并非养老金缴款）

**输入行：**
`28.10.2024 ; ATO ; DEBIT ; IAS SEP QTR ; -3,500.00 ; AUD`

**推理：**
匹配“ATO”+“IAS”（模式 3.6）。这是分期活动报表（PAYG/GST）付款，并非养老金缴款。

**分类：** EXCLUDE -- 税款支付。并非养老金缴款。

---

## 第 5 节 -- 第 1 层级规则

### 规则 1 -- SG 公式

```
SG per quarter = min(Employee_OTE_for_quarter, $65,070) x 11.5%
```

不设 $450/月的门槛（已于 2022 年 7 月 1 日取消）。所有员工均符合资格。

### 规则 2 -- SG 比率

2024-25：11.5%。2025-26 起：12%。

### 规则 3 -- 季度截止日期

| 季度 | 期间 | 截止日期 |
|---|---|---|
| Q1 | 7月1日 - 9月30日 | 10月28日 |
| Q2 | 10月1日 - 12月31日 | 1月28日 |
| Q3 | 1月1日 - 3月31日 | 4月28日 |
| Q4 | 4月1日 - 6月30日 | 7月28日 |

逾期/未缴：将触发退休金保障费（SGC）。SGC 不得在税前扣除。

### 规则 4 -- 个体经营者对自己没有 SG 义务

业主提款不属于工资。只能自愿供款。公司董事向自己支付工资：适用 SG（董事是公司的雇员）。

### 规则 5 -- 优惠税率供款上限

$30,000（2024-25）。包括雇主 SG + 工资牺牲供款 + 个人可扣除供款（已提交 s 290-150 通知）。超额部分按边际税率计入应税收入（可享受 15% 抵免）。

### 规则 6 -- 结转未使用的优惠税率供款上限

自 2018-19 起可用，最多可结转之前 5 年的未使用额度，前提是上一年度 6 月 30 日的 TSB < $500,000。如果 TSB >= $500,000：不可结转。

### 规则 7 -- 非优惠税率供款上限

$120,000（2024-25）。提前启用安排：如果 TSB < $1,660,000，则为 $360,000（3 年）。TSB >= $1,900,000：上限为零。

### 规则 8 -- s 290-150 通知（个人供款扣除）

必须向退休金基金提交扣除申报意向通知，并在以下两个时间点中较早者之前收到确认：提交纳税申报表，或下一财政年度结束。如果未提交：供款仍属于非优惠税率供款，不得扣除。

### 规则 9 -- Division 293（高收入者额外缴纳 15%）

```
Div 293 income = taxable income + concessional contributions
If > $250,000: Div 293 tax = 15% x lesser of (concessional contributions, excess over $250,000)
```

### 规则 10 -- 政府共同供款

最高 $500。收入 < $60,400。匹配比例：每 $1 非优惠税率供款匹配 50c（供款金额最高按 $1,000 计算）。收入超过 $45,400 后逐步减少。提交纳税申报表后自动处理。

---

## 第 6 节 -- Tier 2 目录

### T2-1 -- 就 SG 而言，承包商与雇员的区别

**触发条件：** 客户聘用的承包商可能主要提供劳务（SGAA s 12(3)）。
**问题：** 需要进行多因素测试。可能触发 SG。
**操作：** 标记以供复核人员处理。

### T2-2 -- 多个雇主导致超过优惠税率供款上限

**触发条件：** 个人有两个雇主，且双方均缴纳 SG。合计金额可能超过 $30,000。
**问题：** 两个雇主均无过错。个人承担超额供款税。
**操作：** 标记以供复核人员评估工资牺牲调整。

### T2-3 -- 75 岁以上人员的供款

**触发条件：** 年满 75 岁的客户希望进行自愿供款。
**问题：** 适用工作测试（连续 30 天内工作 40 小时）。法定雇主 SG 没有年龄限制。
**操作：** 标记以供复核人员处理。

### T2-4 -- TSB 接近临界值时的结转

**触发条件：** TSB 接近 $500,000 门槛。
**问题：** 是否可结转取决于 6 月 30 日的确切 TSB。
**操作：** 标记以供复核人员确认 TSB。

### T2-5 -- s 290-150 通知截止日期临近

**触发条件：** 客户已进行个人供款，但尚未提交通知。
**问题：** 错过截止日期后无法补救 -- 供款仍属于非优惠税率供款。
**操作：** 紧急标记。提交纳税申报表前确认通知状态。

---

## 第 7 节——Excel 工作底稿模板

```
AUSTRALIA SUPERANNUATION -- WORKING PAPER
Client: [name]
Financial Year: [2024-25]
Prepared: [date]

ENTITY AND STRUCTURE
  Entity type:                    [Sole trader / Company / Trust / Partnership]
  Has employees:                  [YES/NO]
  Sole trader contributing for self: [YES/NO -- voluntary only]

EMPLOYER SG (PER EMPLOYEE PER QUARTER)
  Employee name:                  [____]
  OTE for quarter:                AUD [____]
  Capped OTE (max $65,070):       AUD [____]
  SG rate:                        11.5%
  SG contribution:                AUD [____]
  Due date:                       [____]
  Paid on time:                   [YES/NO]

PERSONAL CONTRIBUTIONS (SOLE TRADER)
  Personal contribution:          AUD [____]
  s 290-150 notice lodged:        [YES/NO]
  Acknowledged by fund:           [YES/NO]
  Classification:                 [Concessional / Non-concessional]
  Tax deduction claimed:          AUD [____]

CONTRIBUTION CAP CHECK
  Concessional cap:               AUD 30,000
  Total concessional contributions: AUD [____]
  Carry-forward available:        AUD [____]
  Remaining cap:                  AUD [____]
  Non-concessional cap:           AUD [____]
  Total non-concessional:         AUD [____]

DIVISION 293
  Taxable income:                 AUD [____]
  Concessional contributions:     AUD [____]
  Div 293 income:                 AUD [____]
  Div 293 tax (if applicable):    AUD [____]

REVIEWER FLAGS
  [List any Tier 2 flags]
```

---

## 第 8 节——银行对账单阅读指南

### 养老金付款在澳大利亚银行对账单上的显示方式

**直接向基金付款：**
- 描述：基金名称（例如，“AUSTRALIAN SUPER”“HOSTPLUS”“REST SUPER”）
- 时间：按季度（每季度结束后次月 28 日前）或更频繁
- 金额：每名员工的 SG 金额或个人缴款金额

**BPAY 付款：**
- 描述：“BPAY”+ 收款方名称或代码
- 时间：任何时间
- 金额：SG 或个人缴款

**ATO 养老金清算所：**
- 描述：“ATO SUPER”“ATO CLEARING HOUSE”“SBSCH”
- 时间：按季度
- 金额：所有员工的 SG 合计金额

**关键识别提示：**
1. 养老金基金名称是最可靠的识别依据
2. 通过 BPAY 向养老金基金付款时会显示收款方代码——应与基金信息交叉核对
3. ATO SBSCH 是一笔涵盖所有员工的付款
4. 个体经营者的个人缴款看起来与其他任何基金付款相同——需要结合上下文判断
5. SGC 付款支付给 ATO，而不是基金
6. 发薪日养老金制度（自 2026 年 7 月 1 日起）将把付款时间改为每个发薪日

---

## 第 9 节——客户接入备用流程

如果客户仅提供银行对账单：

1. **查找向养老金基金支付的借记款项**——与第 3 节中的基金名称进行匹配
2. **区分 SG 与个人缴款**——与截止日期相符的季度金额很可能是 SG；不定期金额很可能是个人缴款
3. **检查是否有 ATO SBSCH**——表示雇主正在使用清算所
4. **汇总季度 SG 付款**——与预期的 OTE x 11.5% 进行比较，以验证完整性
5. **标记：**“养老金缴款分类根据银行对账单中的交易模式得出。员工 OTE、s 290-150 通知状态及 TSB 尚未经过独立核实。审核人员必须在提交纳税申报表前予以确认。”

---

## 第 10 节——参考资料

### 主要费率和门槛（2024-25）

| 项目 | 数值 |
|---|---|
| SG 费率 | 11.5% |
| 最高供款基数（每季度） | $65,070 |
| 每季度最高 SG | $7,483.05 |
| 税前供款上限 | $30,000 |
| 税后供款上限 | $120,000 |
| 提前三年供款上限 | $360,000 |
| Div 293 门槛 | $250,000 |
| 政府共同供款最高额 | $500 |
| 政府共同供款下限门槛 | $45,400 |
| 政府共同供款上限门槛 | $60,400 |
| LISTO 门槛 | $37,000 |
| 配偶税收抵免最高额 | $540 |
| 转移余额上限 | $1,900,000 |

### LISTO（低收入养老金税收抵免）

调整后应税收入 <= $37,000：税前供款的 15%，最高 $500。由 ATO 直接支付至养老金基金。

### 配偶供款税收抵免

最高 $540（$3,000 的 18%）。如果配偶收入 <= $37,000，可获得全额抵免。如果配偶收入 >= $40,000，则抵免额为零。

### 测试套件

**测试 1：** 雇员每季度 OTE 为 $20,000，2024-25。-> SG = $2,300。

**测试 2：** 雇员每季度 OTE 为 $80,000。-> SG = $7,483.05（受上限限制）。

**测试 3：** 个体经营者供款 $25,000，提交 s 290-150。TSB 为 $200,000。-> $25,000 属于税前供款。抵扣额为 $25,000。未超出上限。

**测试 4：** 应税收入为 $260,000，税前供款为 $30,000。-> Div 293 收入为 $290,000。Div 293 税款 = 15% x $30,000 = $4,500。

**测试 5：** TSB 为 $400,000。未使用的上限：$5,000（2021-22）+ $10,000（2022-23）+ $15,000（2023-24）。-> 可用上限 = $60,000。

**测试 6：** 收入为 $50,000，税后供款为 $1,000。-> 政府共同供款 = $346.68。

**测试 7：** 向配偶的基金供款 $5,000，配偶收入为 $36,000。-> 抵免额 = $540。

**测试 8：** 个体经营者询问是否需要为自己支付 SG。-> $0。没有此项义务。建议进行自愿供款。

### 禁止事项

- 绝不要告诉个体经营者必须为自己支付 SG
- 绝不要将 12% 的费率应用于 2024-25（费率为 11.5%）
- 绝不要忽略最高供款基数（每季度 $65,070）
- 在尚未确认 s 290-150 通知的情况下，绝不要允许申请抵扣
- 如果 TSB >= $500,000，绝不要应用结转规则
- 绝不要将数字表述为确定无疑的结果
- 未经上报处理，绝不要计算 SGC 罚款
- 绝不要就固定收益基金或受宪法保护的基金提供建议

---

## 免责声明

本技能及其输出仅用于提供信息和进行计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者对于因使用本技能而产生的任何错误、遗漏或后果概不承担责任。在提交申报或据此采取行动之前，所有输出都必须由具备资质的专业人士（例如 CPA、CA、税务代理，或您所在司法管辖区内具有同等资质的持牌执业人士）审核并签字确认。

本技能最新且经过验证的版本由 [openaccountants.com](https://openaccountants.com) 维护。登录后即可访问最新版本、申请持牌会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/au-super-guarantee)——面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数字以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_