---
name: au-return-assembly
description: "Final orchestrator skill that assembles the complete Australian filing package for Australian-resident sole traders. Consumes outputs from all Australian content skills (australia-gst for BAS, au-individual-return for ITR, au-super-guarantee for voluntary contributions, au-medicare-levy for levy and surcharge, au-payg-instalments for instalment schedule) to produce a single unified reviewer package containing every worksheet, every form, every brief section, all cross-skill reconciliations, and the final action list with payment instructions, filing instructions, and next-year planning. This is the capstone skill that runs last and produces the final deliverable. MUST be loaded alongside all Australian content skills listed above. Australian full-year residents only. Sole traders only."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/au-return-assembly"
  obligation: ORCH
---
# 澳大利亚纳税申报表组装技能 v0.1

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实情况、文件、税务选择、截止日期、税务居民身份、申报身份或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核之前，请勿依赖本技能进行申报、缴税、修正申报或采取任何税务立场。

## 关键执行指令——请先阅读

**调用本技能时，你已经完成了信息采集流程。用户已同意执行完整工作流程。请执行所有步骤，不要暂停以请求许可。**

具体而言：

- **不要询问用户“你希望我做到多深入”**、“你是否需要完整资料包”或任何类似问题。用户要求准备其纳税申报表。他们需要的就是纳税申报表。请直接生成。
- **不要说明这将消耗多少 token 或工具调用次数。** 直接执行。
- **不要询问应优先处理哪些交付成果。** 生成第 4 节中列出的所有交付成果。如果在执行过程中上下文空间耗尽，请先完成计算工作（数值、立场、标记），然后尽可能生成所有可完成的格式化输出，并仅在最后明确说明哪些交付成果未能生成以及原因。
- **不要重新验证信息采集流程已经验证过的范围。** 如果 `au-freelance-intake` 已生成信息采集资料包，请信任该资料包。你可以在核对过程中交叉检查具体数值，但不要再次盘问用户的信息采集流程已经记录的税务居民身份、企业结构或任何其他事项。
- **不要在各内容技能之间暂停并询问用户。** 按依赖顺序（第 2 节）运行这些技能，技能之间不要输出文字形式的状态更新。可以在最后提供一条统一的状态消息。
- **自检是目标，而不是阻断条件。** 如果某项自检失败，请将其记录在审核人员简报的未决标记部分，然后继续执行。不要因为某项自检的答案存在歧义而中止整个工作流程。
- **主要来源的引文应放入最终审核人员简报，而不是中间计算步骤。**

**信息采集技能已经告知用户，最终资料包必须由注册税务代理签字确认后方可提交。请在最终输出中说明一次，然后继续。**

**需要避免的失败模式：** 技能在执行过程中停止，并向用户询问有关工作流程节奏的元问题。如果你想询问“我应该如何继续”，正确的做法是选择最具合理依据的路径并继续执行，同时在审核人员简报中标记该决定，以便审核人员提出异议。

---

## 本文件的用途

这是用于澳大利亚个体经营者纳税申报表的最终收尾技能。所有澳大利亚内容技能的结果都会汇入本技能。其输出是一套完整的审核资料包，注册税务代理可对其进行审核和签字确认，并连同申报说明一起交付给客户。

本技能负责协调各内容技能的执行、验证跨技能的一致性，并组装最终交付成果。

---

## 第 1 节——范围

生成完整的澳大利亚申报材料包，适用于：
- 全年均为澳大利亚税务居民
- 个体经营者
- 2024-25 纳税年度（2024 年 7 月 1 日至 2025 年 6 月 30 日）
- 申报 BAS（如已注册 GST）、个人所得税申报表（ITR）、养老金对账、Medicare 征费计算、PAYG 预缴税分期计划

---

## 第 2 节 -- 执行顺序和依赖链

该技能强制采用以下执行顺序：

1. **`australia-gst`** -- BAS 申报表（按季度，如已注册 GST）
   - 首先运行，因为 GST 营业额数据将用于 ITR
   - 对于已注册 GST 的纳税人：准备所有尚未申报的季度 BAS；核实此前已申报的季度
   - 输出：BAS 栏位数值（1A 销售 GST、1B 采购 GST）、GST 净额、营业额（不含 GST）
   - **状态检查：**australia-gst 当前是一个 Q2 技能。如果其中包含实质性的计算内容，则使用该技能。如果仍是占位内容，则根据资料收集包中的数据计算 BAS 数值，并在复核人员简报中标明专用技能不可用。

2. **`au-individual-return`** -- 个人所得税申报表（ITR）
   - 依赖 BAS 输出：对于已注册 GST 的个体经营者，营业收入必须使用不含 GST 的营业额
   - 依赖 BAS 输出：可抵扣费用不包括 GST 抵免额（仅使用净额）
   - 输出：ITR 标签数值、应税收入、应税收入对应的税额、税收抵免、应纳税额
   - **状态检查：**au-individual-return 当前是一个 Q2 技能。如果其中包含实质性的计算内容，则使用该技能。如果仍是占位内容，则根据资料收集包中的数据计算 ITR 数值，并在复核人员简报中标明专用技能不可用。

3. **`au-super-guarantee`** -- 自愿养老金缴款对账
   - 依赖 ITR：个人可抵扣缴款会减少应税收入
   - 核实缴款是否在 $30,000 的税前优惠缴款上限以内
   - 输出：缴款金额、上限使用情况、任何超额缴款
   - **状态检查：**au-super-guarantee 当前是一个 Q2 技能。如果其中包含实质性的计算内容，则使用该技能。如果仍是占位内容，则根据资料收集包中的数据计算养老金数值，并在复核人员简报中标明专用技能不可用。

4. **`au-medicare-levy`** -- Medicare 征费及附加费
   - 依赖 ITR：征费为应税收入的 2%；如果没有 PHI 且收入高于门槛，则适用附加费
   - 根据资料收集包检查 PHI 状态
   - 输出：Medicare 征费金额、附加费金额（如适用）、PHI 退税调整
   - **状态检查：**au-medicare-levy 当前是一个 Q2 技能。如果其中包含实质性的计算内容，则使用该技能。如果仍是占位内容，则根据资料收集包中的数据计算 Medicare 数值，并在复核人员简报中标明专用技能不可用。

5. **`au-payg-instalments`** -- PAYG 预缴税分期计划（下一年度）
   - 依赖 ITR：根据 2024-25 年度申报表确定 2025-26 年度的分期预缴收入和税率
   - 将 2024-25 年度已缴分期预缴税款与最终应纳税额进行对账
   - 输出：本年度分期预缴税抵免、下一年度分期预缴计划
   - **状态检查：**au-payg-instalments 当前是一个 Q4 存根。如果该存根包含实质性的计算内容，则使用该技能。如果仍是占位内容，则使用 ATO 的分期预缴税率法计算 PAYG 分期预缴税数值，并在复核人员简报中标明专用技能不可用。

如果任何上游内容技能未能生成通过验证的输出，组装技能会在审核者简报中注明该失败，并继续使用现有数据，而不是完全停止。

---

## 第 3 节——跨技能核对

### 交叉核对 1：BAS G1 应税销售额 = ITR 营业收入（不含 GST）

| BAS 输出 | ITR 输入 | 规则 |
|-----------|-----------|------|
| BAS 1A 销售 GST 总额（年度） | 根据 ITR 营业收入 x 10% 推算 | 必须核对一致 |
| BAS G1 销售总额（不含 GST，年度合计） | ITR 营业收入标签 | 差额必须在 $1 以内 |
| 未注册 GST：总收入 | ITR 营业收入标签 | 直接匹配（无需分离 GST） |

**如果不匹配：** 标记并交由审核者处理。常见原因：确认时点差异（收付实现制与权责发生制）、银行存款中包含私人销售款项、GST 免税供应、进项税供应。

### 交叉核对 2：养老金供款未超过优惠供款上限（$30,000）

| 养老金输入 | 来源 | 规则 |
|------------|--------|------|
| 雇主供款（如同时受雇） | PAYG 汇总表 / 收入报表 | 计入上限 |
| 工资牺牲供款（如有） | PAYG 汇总表 | 计入上限 |
| 个人可抵扣供款 | 养老基金对账单 + s290-170 通知 | 计入上限 |
| 优惠供款总额 | 上述各项之和 | 不得超过 $30,000 |

**如果超额：** 标记并交由审核者处理。超额优惠供款将计入应税收入，并按边际税率征税（另加超额优惠供款费用）。如果收入 + 养老金 > $250,000，则适用 Division 293 税。

### 交叉核对 3：仅当没有 PHI 且收入高于门槛时才征收 Medicare levy surcharge

| MLS 输入 | 来源 | 规则 |
|----------|--------|------|
| 用于 MLS 计算的收入 | ITR 应税收入 + 应申报附加福利 + 净投资亏损总额 + 应申报养老金 | 合并金额 |
| PHI 状态 | 保险公司报表 | 如果全年均有符合要求的住院保险，则无需缴纳 MLS |
| MLS 门槛（2024-25） | 单身：$93,000；家庭：$186,000 | 低于门槛 = 无论是否有 PHI，均无需缴纳 MLS |
| MLS 税率 | 第 1 档：1%；第 2 档：1.25%；第 3 档：1.5% | 适用于应税收入 |

**如果适用 MLS：** 计算并计入应纳税额。标记并交由审核者处理，同时提供收入计算明细。

### 交叉核对 4：PAYG 分期预缴税款抵减最终税款

| PAYG 输入 | 来源 | 规则 |
|-----------|--------|------|
| 2024-25 年度内支付的分期预缴税款 | BAS PAYG 分期预缴标签（T7/T8）或 ATO 记录 | 抵减最终税款 |
| 雇主预扣税款（如有） | PAYG 汇总表 | 额外抵免 |
| 最终应纳税额 | ITR 计算结果 | 税款总额 - 抵免额 = 应付余额或退税额 |

**如果不匹配：** 常见原因是分期预缴税款发生变更（纳税人申请了调整），或者这是第一年，之前没有分期预缴记录。

### 交叉核对 5：资产即时扣除的一致性

| 系统 | 门槛（2024-25） | 处理方式 |
|--------|---------------------|-----------|
| 已注册 GST | 资产成本（不含 GST）< $20,000 | 立即扣除；GST 抵免单独申报 |
| 未注册 GST | 资产成本（含 GST）< $20,000 | 按总成本立即扣除 |
| 超过门槛 | 按有效使用年限计提折旧 | ITR 折旧明细表 |

**如存在不一致：** 若某项资产被申报为即时资产核销，但其成本按正确的 GST 口径计算后高于门槛，则必须将其移至折旧明细表。标记以供复核人员审查。

---

## 第 4 节——最终复核资料包内容

### 文档

1. **执行摘要**——一页概览：申报状态、营业收入、应纳税所得额、应纳税额、Medicare 税、养老金状况、PAYG 抵免、应退税额/应补税额
2. **BAS 工作表**——按季度逐项列示并附公式（销售 GST、采购 GST、PAYG 分期预缴税款）
3. **ITR 工作表**——按标签逐项列示并附公式和支持性明细表（营业收入、扣除额、应纳税所得额、税率、税收抵免）
4. **折旧明细表**——资产登记表，包括成本、日期、有效使用年限、折旧方法、年度扣除额、账面净值
5. **养老金核对表**——优惠税率供款上限跟踪、供款明细、超额检查
6. **Medicare 税工作表**——税额计算、MLS 评估、PHI 退税调整
7. **PAYG 分期预缴税款核对表**——已缴分期预缴税款与最终税额的核对、下一年度缴款计划
8. **跨技能核对摘要**——全部五项交叉核对及其通过/未通过状态和备注
9. **复核人员简报**——包含处理立场、引文、标记和自检结果的综合说明
10. **客户行动清单**——客户需要完成的事项，包括日期和金额

### 复核人员简报内容

```markdown
# Complete Return Package: [Client Name] -- Tax Year 2024-25

## Executive Summary
- Filing status: [Single / Married / etc.]
- Residence: Australia (full-year), [State]
- Business: Sole trader, ABN [number]
- GST registration: Yes / No
- Business income (ex-GST): $X
- Total deductions: $X
- Taxable income: $X
- Tax on taxable income: $X
- Medicare levy: $X
- Medicare levy surcharge: $X / nil
- Tax offsets: $X
- PAYG instalments credit: $X
- PAYG withholding credit: $X
- Balance due / refund: $X
- HELP compulsory repayment: $X / nil
- 2025-26 PAYG instalment amount: $X

## BAS / GST Return
[Content from australia-gst output]
- Registration status and reporting period
- GST on sales (1A) -- quarterly and annual
- GST on purchases (1B) -- quarterly and annual
- Net GST position per quarter
- Any outstanding BAS quarters
- PAYG instalment amounts per BAS

## Individual Tax Return (ITR)
[Content from au-individual-return output]
- Business income (ex-GST)
- Total business deductions schedule
- Net business income
- Other income (interest, dividends, etc.)
- Total income
- Total deductions (including personal deductible super)
- Taxable income
- Tax on taxable income (rate table applied)
- Tax offsets (low income, LMITO if applicable, PHI rebate)
- Medicare levy
- HELP compulsory repayment
- Total tax liability
- Less: PAYG instalments paid
- Less: PAYG withholding
- Balance due / refund

## Depreciation Schedule
- Asset register with cost, purchase date, effective life, method (prime cost / diminishing value)
- Instant asset write-off items (under $20K threshold)
- Continuing depreciation from prior years
- Written-down values carried forward to 2025-26

## Super Contributions
[Content from au-super-guarantee output]
- Personal deductible contributions (s290-170 notice required)
- Employer contributions (if also employed)
- Total concessional: $X of $30,000 cap
- Excess concessional: $X / nil
- Non-concessional contributions: $X
- Division 293 check: income + super vs $250,000 threshold
- Total super balance (for carry-forward cap calculation)

## Medicare Levy and Surcharge
[Content from au-medicare-levy output]
- Medicare levy: 2% of taxable income = $X
- Medicare levy reduction (if low income): $X / nil
- Income for MLS purposes: $X
- PHI status: adequate hospital cover / no cover
- MLS rate: X% / nil
- MLS amount: $X / nil
- PHI rebate tier and adjustment: $X / nil

## PAYG Instalments
[Content from au-payg-instalments output]
- 2024-25 instalments paid: $X (credit against final tax)
- 2024-25 instalment rate used: X%
- 2025-26 instalment income (from 2024-25 return): $X
- 2025-26 instalment rate (from NOA): X%
- 2025-26 quarterly instalment amounts:
  - Q1 (Jul-Sep): due 28 Oct 2025
  - Q2 (Oct-Dec): due 28 Feb 2026
  - Q3 (Jan-Mar): due 28 Apr 2026
  - Q4 (Apr-Jun): due 28 Jul 2026

## Cross-skill Reconciliation
- BAS G1 vs ITR business income: [pass/fail]
- Super within concessional cap: [pass/fail]
- MLS correctly assessed: [pass/fail]
- PAYG credits reconciled: [pass/fail]
- Instant asset write-off thresholds correct: [pass/fail]

## Reviewer Attention Flags
[Aggregated from all upstream skills]
- T2 items requiring registered tax agent confirmation
- Mixed-use expense percentages (motor vehicle, phone, internet)
- Home office deduction (method and hours/area)
- Instant asset write-off eligibility
- Super cap proximity
- PHI rebate tier boundary
- HELP repayment income threshold
- Any income approaching tax bracket boundaries
- Any turnover approaching $75K GST registration threshold (if not registered)

## Positions Taken
[List with legislation citations]
- e.g., "Home office deduction claimed at 67c/hr for X hours -- Practical Compliance Guideline PCG 2023/1"
- e.g., "Motor vehicle cents-per-km at 85c/km for X km -- s28-25 ITAA 1997, TD 2024/3"
- e.g., "MacBook Pro instant asset write-off -- s328-180 ITAA 1997, Temporary Full Expensing extended"
- e.g., "Personal super contribution deduction -- s290-150 ITAA 1997, s290-170 notice lodged"

## Planning Notes for 2025-26
- PAYG instalment schedule (quarterly amounts and dates)
- Super contribution strategy (remaining cap, carry-forward unused cap from prior years)
- GST registration threshold monitoring (if approaching $75K)
- Depreciation schedule continuing into 2025-26 (WDV schedule)
- PHI rebate tier based on projected income
- Any legislative changes affecting 2025-26 (budget measures, rate changes)

## Client Action List

### Immediate (before 31 October 2025 -- ITR lodgement deadline for self-lodgers):
1. Review this return package with your registered tax agent
2. Lodge ITR via myTax or through tax agent (tax agent clients have extended deadline)
3. Pay balance due of $X to ATO (or receive refund of $X)
4. Lodge any outstanding BAS quarters

### Note on lodgement deadlines:
- Self-lodgers: 31 October 2025
- Tax agent lodgement: extended deadlines apply (typically March-May 2026 depending on category)

### Quarterly obligations for 2025-26:
- BAS Q1 (Jul-Sep): lodge and pay by 28 October 2025
- BAS Q2 (Oct-Dec): lodge and pay by 28 February 2026
- BAS Q3 (Jan-Mar): lodge and pay by 28 April 2026
- BAS Q4 (Apr-Jun): lodge and pay by 28 July 2026

### Super obligations:
- If you have employees: SG due quarterly (28 days after quarter end)
- Personal deductible contributions: lodge s290-170 notice with super fund BEFORE lodging ITR
- Monitor concessional cap ($30,000) across all contribution sources

### Ongoing:
1. Issue tax invoices for all sales (if GST registered)
2. Retain all records for 5 years from lodgement date
3. Maintain motor vehicle logbook if claiming logbook method
4. Track home office hours if claiming fixed rate method
5. Monitor turnover for GST registration threshold ($75K)
6. Review PAYG instalment rate -- vary if income changes significantly
```

---

## 第 5 节 -- 拒绝情形

**R-AU-1 -- 上游技能未运行。** 指明具体技能。注意：这是警告，而不是强制中止。使用现有数据继续处理，并标记这一缺口。

**R-AU-2 -- 上游自检失败。** 指明具体检查，并在审核人员简报中注明。继续处理。

**R-AU-3 -- 跨技能核对失败。** 指明具体核对项并描述差异。标记出来供审核人员检查，但继续处理。

**R-AU-4 -- 信息收集不完整。** 缺少特定的信息收集项，导致无法计算。列出缺失内容，并向用户索取具体数据点。

**R-AU-5 -- 汇总期间发现超出范围的项目。** 例如，需要租赁明细表的租金收入、需要 CGT 明细表的资本利得、需要 FITO 的境外收入。标记这些项目并将其排除在计算之外。

---

## 第 6 节 -- 自检

**检查 AU1 -- 所有上游技能均已执行。** australia-gst、au-individual-return、au-super-guarantee、au-medicare-levy 均已生成输出。au-payg-instalments 已生成输出，或已根据 ITR 数据完成计算。

**检查 AU2 -- BAS G1 与 ITR 营业收入一致。** 误差在 $1 以内。

**检查 AU3 -- 养老金未超过优惠缴款上限。** 优惠缴款总额不超过 $30,000（或该上限加上可结转的未使用额度）。

**检查 AU4 -- Medicare levy surcharge 评估正确。** 仅当没有足够的 PHI 且收入高于门槛时才适用 MLS；如果全年均持有 PHI，则不适用 MLS。

**检查 AU5 -- PAYG 分期付款抵扣正确。** 2024-25 年度内支付的分期付款总额已从最终纳税义务中抵扣。

**检查 AU6 -- 已注册经营者的 GST 处理正确。** 营业收入按不含 GST 的金额申报；可抵扣进项税额不计入可扣除费用；GST 抵免额在 BAS 中申报。

**检查 AU7 -- 未注册经营者的 GST 处理正确。** 营业收入按总额申报；所有费用均按总额（含 GST）申报；无需提交 BAS。

**检查 AU8 -- 即时资产核销门槛正确。** 低于 $20,000 的资产（采用正确的 GST 计价基础）作为即时扣除申报；高于该门槛的资产计提折旧。

**检查 AU9 -- 已标记个人养老金扣除的 s290-170 通知要求。** 审核人员简报注明，纳税人必须在提交 ITR 之前，向养老金基金提交扣除申报意向通知。

**检查 AU10 -- 税率表与税务居民身份相符。** 采用税务居民税率（包括 $18,200 的免税门槛）。

**检查 AU11 -- HELP 强制还款额根据还款收入计算。** 还款收入 = 应税收入 + 净投资损失 + 应申报的附加福利 + 应申报的养老金。根据 HELP 还款门槛采用正确的税率。

**检查 AU12 -- 申报日历完整。** 列出 BAS、ITR、养老金和 PAYG 分期付款的所有截止日期，并注明具体日期和金额。

---

## 第 7 节 -- 输出文件

最终输出为**三个文件**：

1. **`[client_slug]_2024-25_australia_master.xlsx`** -- 包含所有工作表和表单的单一主工作簿。工作表包括：封面、BAS 汇总（按季度）、ITR（逐标签）、折旧明细表、费用明细、养老金核对、Medicare Levy、PAYG 分期付款、交叉检查汇总。尽可能使用实时公式 -- 例如，ITR 营业收入引用 BAS 营业额单元格；Medicare levy 引用 ITR 应税收入；PAYG 抵免额引用 BAS 分期付款总额。确保不存在 `#REF!` 错误。交付前，确保计算值与计算模型的差异在 $1 以内。

2. **`reviewer_brief.md`** -- 一个 Markdown 文件，涵盖上述第 4 节中的所有部分：执行摘要、BAS、ITR、养老金、Medicare、PAYG、跨技能核对、标记事项、立场和规划说明。

3. **`client_action_list.md`** -- 一个 Markdown 文件，包含分步操作：需立即完成的申报和付款、2025-26 年度季度日历，以及持续合规提醒。

**如果执行在构建过程中因上下文耗尽而中断：** 输出已完成的所有内容，然后在末尾说明这三个文件中哪些未生成或仅部分完成。

**所有文件均放置在 `/mnt/user-data/outputs/` 中，并在最后通过 `present_files` 工具呈现给用户。**

---

## 第 8 节 -- 跨技能引用

**输入：**
- `au-freelance-intake` -- 结构化信息采集包（JSON）
- `australia-gst` -- BAS 栏位值和 GST 输出
- `au-individual-return` -- ITR 标签值和计算输出
- `au-super-guarantee` -- 养老金核对输出
- `au-medicare-levy` -- Medicare 税和附加税输出
- `au-payg-instalments` -- 分期缴纳计划（或备用计算）

**输出：** 最终复核包。无下游技能。

---

## 第 9 节 -- 已知缺口

1. PDF 表单填写尚未实现自动化。复核人员使用工作表通过 myTax 或税务代理门户进行申报。
2. 电子申报由复核人员通过 myTax 或税务代理软件完成，而非由此技能处理。
3. 付款操作由客户负责；此技能仅提供说明和金额。
4. 不支持租金收入附表 -- 如果存在租金收入，此技能会对其进行标记，但租金附表必须由复核人员另行完成。
5. 不支持资本利得税（CGT）附表 -- 如果存在资本利得，此技能会对其进行标记，但 CGT 附表必须另行完成。
6. 外国收入和外国所得税抵免（FITO）不在范围内。
7. 多年度折旧跟踪假定已提供上一年度的附表。如果未提供，则仅对本年度购置的资产计提折旧。
8. au-payg-instalments 是一个 Q4 存根。在其内容完善之前，PAYG 分期缴纳额将使用 ATO 基于 NOA 的分期缴纳税率法计算。这是一项冗余机制，而非缺口 -- 相关规则是确定性的。
9. 多个上游内容技能（australia-gst、au-individual-return、au-super-guarantee、au-medicare-levy）属于 Q2 技能。如果其中任何技能仍为存根，组装技能将直接计算相关数值并标记该缺口。
10. 此资料包仅针对 2024-25 纳税年度是完整的；2025-26 年度仅作为前瞻性规划出现。

### 变更日志
- **v0.1（2026 年 4 月）：** 初始草案。以 mt-return-assembly v0.1 为基础，针对澳大利亚司法管辖区进行调整，并包含五项内容技能（BAS、ITR、养老金、Medicare、PAYG）。

## 技能结束

---

## 免责声明

此技能及其输出仅用于提供信息和计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用此技能而产生的任何错误、遗漏或结果承担责任。在申报或据此采取行动之前，所有输出均须由合格的专业人士（例如您所在司法管辖区的 CPA、EA、税务律师或具有同等资质的持牌执业人士）复核并签字确认。

此技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/au-return-assembly) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据和具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_