---
name: classifying-tax-transactions
description: Content skill for classifying business bank transactions into US federal Schedule C (Form 1040) line items for sole proprietors and single-member LLCs disregarded for federal tax. Tax year 2025. Federal only. Supplies the Tier 1 deterministic vendor pattern library, Tier 2 conservative-default table, and refusal catalog. MUST be loaded alongside the tax-workflow-base skill which provides the three-state contract, citation discipline, structured-question form, and reviewer-attention output spec. This skill alone supplies rules but no workflow; the base alone supplies workflow but no rules.
---
# Schedule C 交易分类器

此技能是美国 Schedule C 交易分类的**内容层**。它提供相关规则：确定性供应商表、用于模糊情形的保守默认表，以及用于超出范围情形的拒绝目录。**它必须与 `tax-workflow-base` 一同加载**；后者提供三状态约定（明确 / 带标记的默认处理 / 拒绝）、引用规范、结构化问题表单和审核者关注事项输出规范。

如果未加载基础技能，则拒绝继续，并告知用户：“此技能提供 Schedule C 规则，但不提供工作流。请同时加载 `tax-workflow-base`，然后再次提出你的问题。”

## 范围

| 字段 | 值 |
|---|---|
| 管辖范围 | 美国，仅限联邦 |
| 表格 | Schedule C (Form 1040)，经营利润或亏损 |
| 纳税人类型 | 独资经营者，或在联邦税务上被视为忽略实体的单一成员 LLC |
| 纳税年度 | 2025 |
| 货币 | 仅限 USD |
| 货币日期 | 2026 年 4 月 |

州所得税、多州分摊、Schedule SE、QBI、退休金缴款和季度预估税均不在此技能的范围内——它们由此处未加载的其他独立内容技能负责。

## 第 1 层级 — 确定性供应商模式

对银行对账单中显示的交易对手名称进行不区分大小写的子字符串匹配。如果有多个匹配项，则使用最具体的一个。如果没有匹配项，则进入第 2 层级。

| 模式 | Schedule C 行号 | 处理方式 |
|---|---|---|
| AWS, GOOGLE WORKSPACE, MICROSOFT 365, ADOBE, SLACK, NOTION, GITHUB, FIGMA, ZOOM, DROPBOX | 第 27a 行 | 软件订阅 |
| QUICKBOOKS, INTUIT *QB, XERO, FRESHBOOKS | 第 27a 行 | 会计软件 |
| MAILCHIMP, CONVERTKIT, HUBSPOT | 第 8 行 | 广告／营销 |
| WEWORK, REGUS, INDUSTRIOUS | 第 20b 行 | 租金——其他经营性财产 |
| VERIZON, AT&T, T-MOBILE, COMCAST, XFINITY | 第 25 行 | 公用事业费（仅限经营用途百分比——参见第 2 层级） |
| HARTFORD, HISCOX, NEXT INSURANCE | 第 15 行 | 企业责任保险 |
| FIVERR, UPWORK, TOPTAL | 第 11 行 | 合同劳务（累计金额 ≥$600 时，标记以提示 1099-NEC） |
| UNITED, DELTA, AMERICAN, SOUTHWEST, JETBLUE | 第 24a 行 | 差旅——机票 |
| MARRIOTT, HILTON, HYATT | 第 24a 行 | 差旅——住宿 |
| HERTZ, ENTERPRISE, AVIS | 第 24a 行 | 差旅——租车 |
| CPA, ATTORNEY, LEGALZOOM | 第 17 行 | 法律及专业服务 |
| BUSINESS LICENSE, SECRETARY OF STATE | 第 23 行 | 税费和执照费 |
| CHASE, WELLS FARGO, BANK OF AMERICA, MERCURY | 第 27a 行 | 银行手续费 |
| STRIPE TRANSFER, PAYPAL TRANSFER, SQUARE | 排除 | 收款结算款不是收入——参见下文“支付处理商陷阱” |
| NETFLIX, HULU, SPOTIFY, APPLE MUSIC | 排除 | 个人支出——不可扣除 |
| GYM, EQUINOX, PLANET FITNESS | 排除 | 个人支出——不可扣除 |
| GROCERY, WHOLE FOODS, TRADER JOE | 排除 | 个人支出 |
| HEALTH INSURANCE, BLUE CROSS, AETNA, KAISER | 从 Schedule C 中排除 | 自雇人士健康保险应填报在 Schedule 1 第 17 行，而非 Schedule C |
| IRS, US TREASURY, EFTPS, FRANCHISE TAX BOARD | 排除 | 个人纳税义务，不属于 Schedule C |
| MORTGAGE, RENT（个人住宅） | 排除 | 家庭办公室费用通过 Form 8829 单独处理 |
| AMAZON（无商品说明） | 第 2 层级——需要审核收据 | 默认：个人支出（排除） |
| 餐厅、STARBUCKS、DOORDASH | 第 2 层级——需要证明材料 | 默认：在没有 §274(d) 证明材料的情况下不可扣除 |
| SHELL, CHEVRON, EXXON, MOBIL（燃油） | 第 2 层级——需要确定车辆费用计算方法 | 默认：经营用途为 0%，不可扣除 |

**支付处理商陷阱。** 银行对账单上的 Stripe / PayPal / Square 入账金额是扣除手续费后的**净额**，而不是总收入。必须根据支付处理商后台，而不是银行对账单，核对总收入（Line 1）和处理商手续费（Line 27a）。当出现处理商付款时，务必在复核人员简报中注明这一点。

## Tier 2 — 针对模糊情况的保守默认值

当数据缺失时，应用默认值。根据工作流基础规范的三状态约定，每次应用 Tier 2 都属于 State B，并且必须生成一个标记、一条引证和一个问题。

| 模糊情况 | 保守默认值 | 引证 |
|---|---|---|
| 车辆的商业用途比例未知 | 0%（不得在 Line 9 扣除） | IRC §274(d); §280F |
| 家庭办公室的商业用途比例未知 | 0%（不得在 Line 30 / Form 8829 扣除） | IRC §280A(c) |
| 电话 / 互联网的商业用途比例未知 | 0%（不得在 Line 25 扣除） | IRC §262; Treas. Reg. §1.262-1 |
| 不确定费用属于商业支出还是个人支出 | 个人支出（排除） | IRC §162(a)（普通且必要） |
| 餐饮支出没有记录在案的商业目的 | 不得扣除 | IRC §274(d)（佐证要求） |
| Amazon 购买记录没有商品描述 | 个人支出（排除） | IRC §162(a); §6001（记录保存） |
| 现金提款 | 业主提款（排除） | IRC §162(a); §6001 |
| 不确定工作人员是承包商还是雇员 | 按承包商处理（Line 11），并添加分类标记 | 普通法测试；§530 安全港规则 |
| 在 OBBBA 截止日期（Jan 19, 2025）附近购置的资本资产 | 截止日期之前（40% 奖励折旧，而非 100%） | OBBBA P.L. 119-21; IRC §168(k) |
| 不确定上一年度是否进行了 §179 选择 | 未进行 | IRC §179(b)(4)；复核人员必须根据上一年度申报表核实 |

## 拒绝处理目录

如果触发任何条件，请停止处理，逐字输出指定消息，建议咨询有资质的专业人士，并终止此次服务。

| 代码 | 触发条件 | 拒绝消息（逐字输出） |
|---|---|---|
| R-PARTNERSHIP | 用户提及合伙人、合伙协议、Form 1065 或 K-1 | "此技能仅适用于独资经营者和单一成员 LLC。合伙企业应提交 Form 1065。请咨询具有合伙企业税务经验的 CPA 或 EA。" |
| R-S-CORP | 用户提及 S-corp 选择、Form 2553、Form 1120-S 或业主的 W-2 工资 | "S-corporation 应提交 Form 1120-S，而不是 Schedule C。此技能不涵盖 S-corp 申报表。请咨询具有 S-corp 税务经验的 CPA。" |
| R-RENTAL | 用户提及租金收入、房东活动、Schedule E 或 Form 8825 | "出租房地产收入应在 Schedule E 上申报，而不是 Schedule C。请咨询具有出租房产税务经验的 CPA 或 EA。" |
| R-CRYPTO | 用户提及加密货币交易、DeFi、NFT、挖矿、质押，或向加密货币交易所转账或从中转出 | "加密货币交易涉及计税基础跟踪、虚假销售规则考量以及 Form 8949 申报。超出范围。请咨询具有数字资产经验的 CPA 或 EA。" |
| R-FOREIGN | 用户提及外国账户、外国收入、FBAR、FATCA、Form 8938 或 Form 2555 | "外国收入和 FBAR/FATCA 申报超出范围。请咨询具有国际税务经验的 CPA 或 EA。" |
| R-MULTISTATE | 在美国一个以上的州开展商业活动 | "多州分摊超出范围。请咨询具有多州税务经验的 CPA 或 EA。" |
| R-FARM | 用户提及农业经营、Schedule F、农作物或牲畜收入 | "农业收入应在 Schedule F 上申报。超出范围。请咨询农业税务专家。" |
| R-AUDIT | 用户提及尚未结案的 IRS 通知、审计或尚未提交的上一年度申报表 | "尚未结案的 IRS 事项需要个性化代理服务。请直接咨询 CPA、EA 或税务律师。" |

## 涉及的 Schedule C 输出行

本技能将项目分类至 Schedule C Part II 的以下行：8（广告）、9（轿车和卡车）、11（合同劳务）、13（折旧）、15（保险）、17（法律和专业服务）、18（办公费用）、20a/20b（租金）、21（维修）、22（用品）、23（税费和许可证）、24a（差旅）、24b（按 50% 扣除的餐费）、25（公用事业费）、26（工资）、27a（其他费用——包括软件、银行手续费、商户支付处理费）。第 1 行（总收入）和第 30 行（家庭办公室，通过 Form 8829 申报）虽有提及，但其计算不在本技能的范围内。

## 局限性

本技能是一种分类辅助工具，供具备美国财政部 Circular 230 所规定资质的人类专业人士（注册税务师、注册会计师或律师）审核。它不提交纳税申报表，也不计算 Schedule C 合计金额、Schedule SE、QBI 扣除额、退休金缴款、自雇人士健康保险或季度预估税款。所引用的税法截至 2026 年 4 月有效。

## 免责声明

本技能按“原样”提供，不附带任何形式的明示或默示保证，包括但不限于对适销性、特定用途适用性、准确性、完整性、时效性或不侵权的保证。本技能不构成税务、法律、会计、财务或任何其他形式的专业建议，也不会在任何一方之间建立任何专业关系。

本技能的作者、贡献者、分发者以及本技能提及的任何一方，对于因使用或无法使用本技能或其生成的任何输出而产生的任何直接、间接、附带、后果性、特殊、惩戒性或惩罚性损害，均不承担**任何责任**——包括但不限于：错误分类、遗漏扣除、错误的税务立场、IRS 罚款、利息、审计费用、专业服务费或任何其他损失。

用户承担与使用本技能及其生成的任何输出相关的**全部风险**。在基于任何输出采取行动、提交申报或与美国国税局或任何其他税务机关沟通之前，每项输出都必须由具备美国财政部 Circular 230 所规定资质的合格人类专业人士（注册税务师、注册会计师或律师）进行独立审核并签字确认。最终税务立场以及所提交的任何纳税申报表的准确性由审核专业人士负责，而非本技能。使用本技能即表示接受这些条款。