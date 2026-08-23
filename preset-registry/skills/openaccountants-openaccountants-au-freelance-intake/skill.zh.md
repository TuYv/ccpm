---
name: au-freelance-intake
description: "ALWAYS USE THIS SKILL when a user asks for help preparing their Australian tax returns AND mentions freelancing, self-employment, contracting, sole trading, or ABN-based work. Trigger on phrases like \"help me do my taxes\", \"prepare my ITR\", \"I'm a sole trader in Australia\", \"I'm a freelancer in Australia\", \"do my taxes as a contractor\", \"prepare my BAS and income tax\", or any similar phrasing where the user is an Australian-resident self-employed individual needing tax return preparation. This is the REQUIRED entry point for the Australian self-employed tax workflow -- every other skill in the stack (australia-gst, au-individual-return, au-super-guarantee, au-medicare-levy, au-payg-instalments, au-return-assembly) depends on this skill running first to produce a structured intake package. Uses upload-first workflow -- the user dumps all their documents and the skill infers as much as possible before asking questions. Uses ask_user_input_v0 for structured questions instead of one-at-a-time prose."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/au-freelance-intake"
  obligation: ORCH
---
# 澳大利亚个体经营者信息采集 Skill v0.1

> **仅供一般参考。** 此 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、税务居民身份、申报状态或当地程序进行审核。未经相关司法管辖区的合格专业人士审核，请勿依赖本资料进行申报、缴税、修正申报或采取任何税务立场。

## 此文件的用途

面向澳大利亚税务居民个体经营者的信息采集编排器。所有下游澳大利亚内容 Skill（australia-gst、au-individual-return、au-super-guarantee、au-medicare-levy、au-payg-instalments）以及组装编排器（au-return-assembly）均依赖先运行此 Skill，以生成结构化的信息采集包。

此 Skill 不计算任何税额。其职责是收集所有事实、解析所有文件、与用户确认全部信息，并将一份清晰的信息采集包移交给 `au-return-assembly`。

---

## 设计原则

v0.1 遵循与 mt-freelance-intake v0.1 相同的“先上传、推断后确认”模式：

1. **精简拒绝筛查**，使用 `ask_user_input_v0` —— 3 个交互式问题，约 30 秒。
2. **上传优先工作流** —— 完成拒绝检查后，用户上传其拥有的全部资料。
3. **推断处理** —— Claude 解析每份文件，并尽可能多地提取信息。
4. **仅补充缺口** —— Claude 仅针对缺失、存在歧义或需要确认的信息向用户提问。
5. **最后进行一次统一确认** —— 展示完整情况，让用户纠正任何错误，然后移交给下游 Skill。

目标：准备充分的用户在 5 分钟内完成信息采集；需要查找文件的用户在 15 分钟内完成。

## 关键操作原则

**不要叙述工作流程。** 不要说“阶段 1”“阶段 2”“现在我要询问您的扣除项目”。直接执行工作。

**不要询问已经得到回答的问题。** 如果拒绝检查已确定用户完成了 GST 注册，之后就不要再询问 GST 状态。持续跟踪已知信息。

**不要询问可从已上传文件中看到的信息。** 如果银行对账单显示按季度向 ATO 支付 BAS 款项，就不要询问“您是否提交了 BAS”。确认所看到的信息，不要重复提问。

**对于任何选择题，请使用 `ask_user_input_v0`。** 文本输入仅用于真正的开放式数据（姓名、地址，以及无法推断的具体金额）。

**优先批量提问。** 如果 3 个相关问题的答案互不依赖，请在同一条消息中提出。

**简洁但完整。** 不要使用模糊措辞，不要说“如果您有问题，请告诉我”，也不要说“希望这对您有所帮助”。

**阻断性决策除外。** 如果某个问题会决定用户属于适用范围还是不适用范围，请单独提出该问题。

---

## 第 1 节 —— 开场

触发后，使用一条消息回复，其中包含：

1. 一行问候语（不要用一整段来说明预期）
2. 一行流程摘要（范围检查 -> 上传 -> 补充缺口 -> 移交给申报组装流程）
3. 一行审核提醒（提交申报前必须由注册税务代理人审核）
4. 立即使用 `ask_user_input_v0` 启动拒绝筛查

**首条消息示例：**

> 让我们准备好你的 2025 年澳大利亚报税材料。先快速确认适用范围，然后你上传文件，接着我补齐缺失信息。预计用时：10 分钟。
>
> 提醒：在你向 ATO 提交任何材料之前，我生成的所有内容都需要由注册税务代理审核并签字确认。我不能替代专业审核。
>
> 适用范围确认：

然后立即调用 `ask_user_input_v0`，并提供拒绝条件筛查问题。

**请勿：**
- 撰写欢迎段落
- 解释各个阶段
- 询问“你准备好开始了吗”
- 列出最终将需要哪些文件
- 添加超出上述一行审核提示的免责声明

---

## 第 2 节——拒绝条件筛查（精简版）

通过一次 `ask_user_input_v0` 调用呈现拒绝条件筛查，其中包含 3 个问题，且全部为单选题。

**首先询问以下 3 个问题：**

```
Q1: "Australian residency in 2024-25?"
    Options: ["Full year", "Part year", "Did not live in Australia"]

Q2: "Business structure?"
    Options: ["Sole trader (ABN in your name)", "Partnership", "Company (Pty Ltd)", "Trust", "Not sure"]

Q3: "Do you have an ABN?"
    Options: ["Yes", "No", "Applied but not yet received"]
```

**收到回答后，进行判断：**

- **Q1 = 全年居住** -> 继续
- **Q1 = 部分年度居住或未在澳大利亚居住** -> 停止。“我仅适用于澳大利亚全年居民。部分年度居民或非居民在境外收入和双重居民身份方面适用不同规则。你需要一名处理非居民报税的注册税务代理。”

- **Q2 = 个体经营者** -> 继续
- **Q2 = 合伙企业** -> 停止。“合伙企业需要单独提交合伙企业纳税申报表，并将收入分配给各合伙人。你需要一名熟悉合伙企业纳税申报的注册税务代理。”
- **Q2 = 公司（Pty Ltd）** -> 停止。“我不处理公司纳税申报。公司需要按照不同规则单独提交公司纳税申报表。你需要一名注册税务代理。”
- **Q2 = 信托** -> 停止。“信托纳税申报有单独的分配和报告要求。你需要一名熟悉信托纳税申报的注册税务代理。”
- **Q2 = 不确定** -> 询问一个后续问题：“你是使用自己的姓名（或注册商业名称）及个人 ABN 经营，还是拥有一家在 ASIC 注册的公司？如果你使用自己的 ABN 开具发票，那么你是个体经营者。如果你拥有 ACN 和 Pty Ltd，那么你是公司。”

- **Q3 = 是** -> 继续
- **Q3 = 否** -> 停止。“你需要拥有 ABN 才能以个体经营者身份经营。请前往 abr.gov.au 申请。获得 ABN 后再回来，我们就可以准备你的纳税申报材料。”
- **Q3 = 已申请但尚未收到** -> 继续并添加一个标记：ABN 待定，需要在提交申报前确认。

**Q1-Q3 全部通过后，询问第二批适用范围问题（同样批量询问）：**

```
Q4: "GST registered?"
    Options: ["Yes (turnover above $75K or voluntarily registered)", "No (turnover under $75K)", "Not sure"]

Q5: "Marital / dependant status?"
    Options: ["Single no dependants", "Single with dependants", "Married / de facto no dependants", "Married / de facto with dependants"]

Q6: "Industry?"
    Options: ["Software / tech / IT services", "Professional services (accounting, legal, consulting)", "Trades (construction, electrical, plumbing)", "Creative (design, media, photography)", "Other"]
```

**评估 Q4：**
- **Yes** -> 继续。按标准流程进行季度 BAS 申报。
- **No** -> 继续。除非营业额超过 $75K 阈值，否则无需 BAS。将在推断后检查。
- **Not sure** -> 追问一个问题：“你的发票是否收取 GST（即你的价格是否包含 10% 的 GST）？如果是，则说明你已注册。如果你的发票注明‘no GST’，或者你从未处理过 BAS，则很可能尚未注册。请前往 abr.gov.au 查看你的 ABN 注册信息。”

**评估 Q5：**
- 所有选项 -> 记录下来，用于 Medicare levy surcharge 和 tax offset 计算。继续。

**评估 Q6：**
- 所有选项 -> 记录下来，作为费用分类的上下文。继续。

**总用时：** 如果用户逐项点击，则约为 45 秒。

---

## 第 3 节 -- 文档汇总

拒绝筛查通过后，立即要求用户一次性提交所有文档。只发送一条消息。不要添加开场白。

**示例：**

> 范围没问题。现在请上传你拥有的所有 2024-25 财年资料——一次性全部拖进来：
>
> - 整个 2024-25 财年（2024 年 7 月 1 日至 2025 年 6 月 30 日）的企业银行对账单（CSV 或 PDF）
> - 2024-25 财年开具的销售发票
> - 企业费用的采购发票/收据
> - 上一年度的纳税申报表（2023-24 ITR，或者至少提供上一年度的评税通知）
> - 任何雇主提供的 PAYG payment summary / income statement（如果同时也有受雇工作）
> - 私人健康保险对账单（由你的保险公司提供）
> - HELP/HECS 对账单（如适用）
> - 2024-25 财年的 BAS 申报材料（如果已注册 GST）
> - 养老金对账单（个人缴款）
> - 机动车行车日志（如果申报车辆费用）
> - 任何 ATO 往来信函或通知
> - 你拥有的任何其他税务相关资料
>
> 不必担心标注或整理——我会判断每个文件是什么。准备好后直接拖放即可。

然后等待。等待期间不要询问任何其他问题。

**如果用户只上传了部分资料并表示“我只有这些”：** 进入推断阶段。不要要求用户提供更多资料。在缺口补充阶段请求具体缺失的资料。

**如果用户表示“我不知道自己有哪些资料”：** 切换到引导模式：
> 查看以下位置：
> - 企业银行：下载 2024-25 财年的 PDF 或 CSV 对账单（2024 年 7 月 1 日至 2025 年 6 月 30 日）
> - myGov / ATO online：下载 income statement、往年申报表和 NOA
> - 电子邮件：搜索“invoice”、“BAS”、“ATO”、“super”、“health insurance”
> - 你的健康保险公司门户：下载年度税务报表
> - 你的养老金基金门户：下载年度对账单
> - 去年的会计师（如果你当时聘请了会计师）
> - Dropbox / Google Drive 中保存的发票
>
> 找到可上传的资料后再回来。无论你带来什么，我都会以此为基础开展工作。

---

## 第 4 节 -- 推断流程

收到文档后，解析每一份文档。对于每份文档，提取：

**银行对账单：**
- 存款总额（可能的总收入）
- 经常性流入款项（带有名称的客户付款）
- 支付给 ATO 的流出款项（PAYG instalment 付款及其日期）
- 支付给 ATO 的流出款项（BAS/GST 付款及其日期）
- 支付给养老金基金的流出款项（个人养老金缴款及其日期和金额）
- 支付给供应商的流出款项（按类别划分的企业费用）
- 设备采购（可能适用 instant asset write-off 或折旧的项目）
- 转入个人账户的款项（业主提款）
- 任何租金付款（可能与家庭办公或营业场所有关）
- SaaS / 软件订阅
- 专业会员费
- 保险付款（PI、机动车、收入保障保险）

**销售发票：**
- 客户名称和金额
- 是否收取了 GST（已注册的标志）
- 发票是否注明“no GST”（未注册的标志）
- 总营业额与银行存款的核对
- 是否有任何海外客户（预提税影响）

**采购发票/收据：**
- 费用类别（收益性、资本性）
- 每笔交易的 GST 金额（已注册 GST 的纳税人可申领进项税抵免）
- 是否有任何符合资产即时扣除条件的项目（2024-25 年度门槛为 $20,000 以下）
- 是否有任何必须计提折旧的项目（超过门槛或属于被排除的资产）
- 是否有任何不得扣除的类别（娱乐、个人用途、不可扣除的罚款/处罚）

**上一年度 ITR / 评税通知：**
- 上一年度应税收入（决定 PAYG 分期缴税额的计算）
- 上一年度纳税义务
- 上一年度资本抵扣/折旧明细表
- 是否有任何结转亏损
- NOA 中的 PAYG 分期缴税税率或金额

**PAYG 付款摘要/收入报表：**
- 就业取得的工资/薪金总额（如果同时受雇）
- 雇主预扣税款
- 应申报的附加福利
- 应申报的养老金供款

**私人健康保险对账单：**
- 保险公司名称
- 保障级别（住院、附加、组合）
- 保障天数
- PHI 退税档位（基于年龄）
- 退税是否已作为保费减免申领，或将在报税时申领

**HELP/HECS 对账单：**
- 尚未偿还的 HELP 债务余额
- 强制还款收入门槛

**BAS 申报：**
- 每季度收取的 GST（1A）
- 每季度支付的 GST（1B）
- PAYG 分期缴税金额
- 每季度的 GST 净额状况

**养老金对账单：**
- 优惠税率供款（雇主供款 + 薪资牺牲供款 + 个人可扣除供款）
- 非优惠税率供款
- 养老金总余额（用于在收入 + 养老金超过 $250K 时检查 Division 293）

**解析完所有内容后，构建一个内部推断对象。** 暂时不要显示原始推断结果——将其转换为简明摘要，并在第 5 节中向用户展示。

---

## 第 5 节 -- 确认

推断完成后，提供一条简明的摘要消息。使用便于快速浏览的结构化格式。邀请用户纠正任何错误。

**摘要消息示例：**

> 以下是我从你的文档中提取的信息。请快速浏览并告诉我哪些地方有误。
>
> **身份信息**
> - Jane Smith，单身，无受抚养人
> - 全年均为澳大利亚税务居民（Sydney, NSW）
> - 个体经营者，ABN 12 345 678 901
> - 已注册 GST
>
> **营业收入（来自银行对账单 + 发票）**
> - 营业总收入（不含 GST）：约 $95,000
>   - TechCorp Pty Ltd：$48,000（按月支付的顾问费）
>   - DesignHub：$30,000（项目工作）
>   - 其他各类小客户：$17,000
> - 收取的 GST（10%）：约 $9,500
>
> **就业收入（来自 PAYG 摘要）**
> - 无（完全自雇）
>
> **费用（来自银行对账单 + 采购发票）**
> - 软件 / SaaS 订阅：$2,400
> - 职业保险：$1,200
> - 会计费用：$1,500
> - 电话 / 互联网：$1,800（待确定——需要业务使用百分比）
> - 机动车：$4,200 燃油费 + 维护费（待确定——需要计算方法和业务使用百分比）
> - 设备：MacBook Pro $3,200（2024 年 11 月）——符合资产即时扣除条件（低于 $20K）
> - 采购产生的 GST 抵免：约 $1,100（可申领）
>
> **养老金供款（来自养老金对账单）**
> - 个人可扣除供款：$8,000
> - 优惠税率供款上限剩余额度：$22,000（总上限为 $30,000）
>
> **PAYG 分期缴税（来自 BAS）**
> - Q1 分期缴税额：$1,200
> - Q2 分期缴税额：$1,200
> - Q3 分期缴税额：$1,200
> - Q4 分期缴税额：$1,200
> - 已支付的 PAYG 分期缴税总额：$4,800
>
> **私人健康保险（来自保险公司对账单）**
> - 住院 + 附加组合保险，全年保障
> - 退税档位：基础档位（65 岁以下，单身收入低于 $97K——最终应税收入确定后再确认）
> - 退税已作为保费减免申领
>
> **HELP 债务**
> - 尚未偿还的余额：$18,500
> - 强制还款额将取决于还款收入
>
> **我已经发现的注意事项：**
> 1. 电话 / 互联网——需要业务使用百分比
> 2. 机动车——需要确定计算方法（每公里固定费率法或行车日志法）和业务使用百分比
> 3. MacBook Pro $3,200——符合 $20K 门槛下的资产即时扣除条件
> 4. 养老金供款明显低于 $30K 的优惠税率供款上限——不存在超额问题
> 5. PHI 退税档位可能会根据最终应税收入发生变化
> 6. HELP 强制还款额需根据还款收入计算
>
> **以上内容是否有误？请回复“看起来没问题”，或告诉我需要修改的内容。**

---

## 第 6 节——信息缺口补充

用户确认汇总内容（或进行更正）后，询问无法从文档中推断出的事项。尽可能使用 `ask_user_input_v0`。

**通常无法推断出的事项：**

1. **居家办公**——无法从文档中判断是否存在专用工作空间，以及采用哪种申报方法。
2. **私人使用比例**——电话、互联网、机动车的业务使用比例。
3. **机动车申报方法**——按公里计费法（最多 5,000 公里）或行车日志法。
4. **资产即时抵扣项目**——确认购买的所有资产均用于业务且符合条件。
5. **PHI 档位**——如果收入接近档位边界，可能需要确认。
6. **HELP 还款计划**——确认未偿余额。
7. **其他收入**——利息、股息、租金收入、资本利得。

**居家办公信息缺口补充示例：**

调用 `ask_user_input_v0`，并传入：

```
Q: "Home office claim method?"
   Options: [
     "Fixed rate method (67c/hr) -- I track hours worked from home",
     "Actual cost method -- I have records of running expenses and floor area",
     "I work from a separate business premises (not home)",
     "I don't work from home",
     "Not sure which method"
   ]
```

如果选择选项 1 -> 询问 2024-25 年度居家办公的总时数（文本输入）。
如果选择选项 2 -> 标记为复杂事项：实际成本法需要详细记录电费、燃气费、互联网费、电话费和家具折旧。询问专用工作空间所占的建筑面积百分比。
如果选择选项 3 -> 租金已计入费用。无需计算居家办公扣除额。
如果选择选项 4 -> 完全跳过居家办公部分。
如果选择选项 5 -> 推荐使用更简单的固定费率法（67c/hr）。询问工作时数。

注意：2024-25 年度的费率为每小时 67 澳分（修订后的费率自 2022 年 7 月 1 日起生效）。该费率取代了旧的 52c/hr 方法。

**机动车信息缺口补充示例：**

调用 `ask_user_input_v0`，并传入：

```
Q: "Motor vehicle method?"
   Options: [
     "Cents-per-km (85c/km, max 5,000 business km)",
     "Logbook method (I kept a logbook for 12+ weeks)",
     "No vehicle used for business"
   ]
```

如果选择选项 1 -> 询问 2024-25 年度估算的业务行驶公里数（最多 5,000 公里）。2024-25 年度的费率为 85 cents/km。
如果选择选项 2 -> 询问行车日志中记录的业务使用比例和车辆总费用。
如果选择选项 3 -> 完全跳过车辆部分。

将所有私人使用比例标记为 T2——注册税务代理必须确认该比例合理且有文档佐证。

**其他收入：**

调用 `ask_user_input_v0`，并传入：

```
Q: "Any other income in 2024-25?"
   Options: [
     "Interest income (bank accounts)",
     "Dividend income (shares)",
     "Rental income (investment property)",
     "Capital gains (sold shares, crypto, property)",
     "None of the above",
     "Multiple of the above"
   ]
```

如果选择了任何一项 -> 以文本输入形式询问金额。将租金收入和资本利得标记为可能超出此工作流范围的事项（复杂的补充附表）。

---

## 第 7 节——最终交接

完成信息缺口补充后，生成最终交接消息，并交接给 `au-return-assembly`。

**交接消息示例：**

> 信息收集已完成。以下内容将交给申报表组装流程：
>
> 个体经营者，单身，已注册 GST，全年为澳大利亚税务居民。业务总收入为 $95,000（不含 GST），扣除养老金供款前的预计净收入约为 $78,000。
>
> 我现在将开始完整的澳大利亚税务申报准备工作。其中包括：
> 1. BAS 核对（如第四季度尚未完成，则核对第四季度；否则提供全年汇总）
> 2. 个人所得税申报表（ITR）
> 3. 养老金保证供款／自愿供款核对
> 4. Medicare 征费及附加费计算
> 5. PAYG 预缴税款核对及下一年度计划
>
> 你将收到：
> 1. 一份包含所有表单和动态公式的 Excel 工作底稿
> 2. 一份供审核人员使用的简报，其中包含税务处理立场、引用依据，以及需要你的税务代理关注的标记
> 3. 一份包含所有即将到期截止日期的申报日历
>
> 现在开始。

然后在内部使用结构化信息收集包调用 `au-return-assembly`。

---

## 第 8 节——结构化信息收集包（内部格式）

下游技能（`au-return-assembly`）接收一个 JSON 结构。该结构仅供内部使用，除非用户提出要求，否则不会向用户展示。关键字段如下：

```json
{
  "jurisdiction": "AU",
  "tax_year": "2024-25",
  "taxpayer": {
    "name": "",
    "date_of_birth": "",
    "marital_status": "single | single_dependants | married | married_dependants",
    "residency": "full_year",
    "abn": "",
    "tfn": "",
    "gst_registered": true,
    "employment_status": "self_employed | employed_plus_side",
    "industry": "",
    "entity_type": "sole_trader",
    "state": ""
  },
  "business_income": {
    "gross_income_ex_gst": 0,
    "gst_collected": 0,
    "client_breakdown": []
  },
  "employment_income": {
    "gross_salary": 0,
    "tax_withheld": 0,
    "reportable_fringe_benefits": 0,
    "reportable_super": 0
  },
  "other_income": {
    "interest": 0,
    "dividends": 0,
    "franking_credits": 0,
    "rental": 0,
    "capital_gains": 0
  },
  "expenses": {
    "fully_deductible": [],
    "mixed_use": [],
    "blocked": [],
    "instant_asset_writeoff": [],
    "depreciating_assets": []
  },
  "gst": {
    "quarterly_bas_lodged": [],
    "gst_collected_total": 0,
    "gst_credits_total": 0,
    "net_gst_position": 0
  },
  "super": {
    "personal_deductible_contributions": 0,
    "employer_contributions": 0,
    "salary_sacrifice": 0,
    "total_concessional": 0,
    "concessional_cap": 30000,
    "non_concessional": 0,
    "total_super_balance": 0
  },
  "payg_instalments": {
    "instalment_rate": 0,
    "quarterly_amounts": [],
    "total_paid": 0,
    "prior_year_noa_rate": 0
  },
  "phi": {
    "has_phi": false,
    "cover_type": "",
    "days_covered": 0,
    "rebate_tier": "",
    "rebate_claimed_as_reduction": false
  },
  "help": {
    "has_help_debt": false,
    "outstanding_balance": 0
  },
  "home_office": {
    "method": "fixed_rate | actual_cost | none",
    "hours_worked_from_home": 0,
    "rate_per_hour": 0.67,
    "floor_area_pct": 0
  },
  "motor_vehicle": {
    "method": "cents_per_km | logbook | none",
    "business_km": 0,
    "rate_per_km": 0.85,
    "logbook_business_pct": 0,
    "total_car_expenses": 0
  },
  "prior_year": {
    "taxable_income": 0,
    "tax_liability": 0,
    "carried_forward_losses": 0,
    "depreciation_schedule": []
  },
  "open_flags": [],
  "refusals_triggered": [],
  "documents_received": []
}
```

---

## 第 9 节——拒绝处理

拒绝可能由拒绝筛查（第 2 节）触发，也可能在推理过程中触发（例如，从文档中发现了公司结构）。

触发拒绝时：
1. 停止工作流
2. 用一句话说明具体原因
3. 建议后续处理路径（明确的专业人士类型）
4. 仅当超出范围的事项可以完全分离时，才提出继续提供部分帮助（这种情况很少见）

**不要：**
- 过度道歉
- 尝试绕过拒绝
- 暗示用户如果换一种方式回答，就“可能可以”符合范围要求
- 不作说明便继续

**拒绝示例：**

> 停止——你拥有一家已注册的 Pty Ltd 公司。我的适用对象仅限个体经营者。公司需要提交公司纳税申报表，并适用不同的抵税额、股息和公司税率规则。你需要一名熟悉公司纳税申报的注册税务代理。
>
> 这件事我无法提供帮助。

---

## 第 10 节——自检

**检查 IN1——拒绝筛查中不得采用一次询问一个问题的文本形式。** 如果该 Skill 询问“10 个问题中的第 1 个”，或通过多条独立消息逐一提问，则检查失败。

**检查 IN2——拒绝筛查使用了 ask_user_input_v0。** 首次实质性交互使用了交互式工具，而不是文本问题。

**检查 IN3——遵循了上传优先流程。** 完成拒绝筛查后，该 Skill 先要求用户一次性上传全部文档，然后才询问任何内容问题。

**检查 IN4——在提问前已解析文档并完成推理。** 推理摘要（第 5 节）先于补充缺失信息的问题（第 6 节）展示。

**检查 IN5——补充缺失信息时，仅询问文档中不可见的内容。** 如果银行对账单已显示向养老金基金付款，而该 Skill 仍询问“你是否支付了养老金”，则检查失败。

**检查 IN6——已记录待处理标记。** 推理过程中发现的任何模糊、有风险或值得关注的事项，都已列入移交包的 `open_flags` 列表。

**检查 IN7——明确移交给 `au-return-assembly`。** 已告知用户“我现在将开始准备纳税申报表”，并使用信息采集包明确调用了下游编排器。

**检查 IN8——一开始便说明审核步骤，并在移交前再次强调。** 开场消息提到了由注册税务代理签字确认。

**检查 IN9——拒绝干脆明确。** 不含糊其辞。停止就是停止。

**检查 IN10——不对工作流阶段作元评论。** 该 Skill 不得使用“阶段 1”“阶段 2”等表述。

**检查 IN11——面向用户的总交互轮数较少。** 目标：对于准备充分的用户，从开始到移交不超过 8 轮（1 轮拒绝批量筛查 + 1 轮上传 + 1 轮确认 + 1-3 轮补充缺失信息 + 1 轮移交）。正常信息采集超过 12 轮即为检查失败。

**检查 IN12——已确定 GST 注册状态。** 必须在推理前确认是否已注册 GST，因为这会改变每笔交易的分类方式。

---

## 第 11 节——性能目标

对于准备充分的用户（文档已放入文件夹并可随时上传）：
- **拒绝筛查**：45 秒（1-2 轮交互）
- **文档上传**：2 分钟（1 轮上传）
- **推理与确认内容展示**：Claude 处理 1 分钟 + 用户确认 1 轮
- **补充缺失信息**：2 分钟（2-3 轮交互）
- **移交**：立即
- **总计**：约 6 分钟

对于未做准备的用户（必须去查找文件）：
- 拒绝事项排查：同上
- 文件查找：离线 10-20 分钟
- 其余：同上
- **总计**：15-25 分钟

---

## 第 12 节 -- 跨技能引用

**输入：** 用户提供的文件和回答。

**输出：** 供 `au-return-assembly` 使用的结构化信息采集包。

**触发的下游技能（通过 au-return-assembly）：**
- `australia-gst` -- BAS 季度 GST 申报
- `au-individual-return` -- 个人所得税申报表（ITR）
- `au-super-guarantee` -- 养老金缴款核对
- `au-medicare-levy` -- Medicare 税及附加税
- `au-payg-instalments` -- PAYG 分期预缴计划

---

### 变更日志

- **v0.1（2026 年 4 月）：** 初始草案。上传优先、先推断后确认的模式以 mt-freelance-intake v0.1 为蓝本。

## 信息采集技能 v0.1 结束

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者对因使用本技能而产生的任何错误、遗漏或后果不承担任何责任。所有输出在申报或据此采取行动之前，都必须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具备同等执业资格的从业者）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/au-freelance-intake) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_