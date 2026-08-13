---
name: vertical-home-services
description: Domain-knowledge pack for home & field services (HVAC, plumbing, cleaning, landscaping) — the trades vocabulary, non-obvious pricing/dispatch rules, and field-crew realities a builder must know so home-services products aren't speced naive. Covers the four products this niche ships (dispatch, quoting, field-booking, reviews), how they wedge against ServiceTitan / Jobber / Housecall Pro, and the must-model entities (price book, membership, job window, multi-option quote). Applied by architect/pm during spec authoring so the schema and flows reflect how a trades shop actually runs, not a generic CRUD app.
when_to_use: |
  Apply when architect/pm specs a home-services product:
  - architect writes ARCH-*.md for a dispatch / quoting / field-booking / reviews product in the home-services niche
  - pm decomposes any of those four products into tasks and needs the domain rules to not under-scope
  - design-advisor wireframes a tech-facing or homeowner-facing flow for a trades shop
  Do NOT apply for non-field verticals (the entity model here assumes crews, trucks, and on-site jobs).
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 家庭与现场服务——按照专业工种服务公司的实际运营方式来设计规范

暖通空调、管道维修、保洁、园林绿化。一队技术人员开着服务车辆，在
客户现场作业，并在客户家的餐桌旁报价。如果构建者把这种业务建模为
“预约 + 发票”，做出来的产品不会有任何承包商愿意使用。本技能提供
该领域的背景知识，确保在开始编码之前就制定出正确的规范。

## 1. 领域术语（不了解这些会显得很外行）

- **价目手册** — 已定价任务的主目录（“更换 40 加仑
  热水器 = $1,850”）。价格是*查出来的*，而不是按工时计算出来的。
- **固定价格与 T&M** — 固定价格（从价目手册中选取一个价格，其中包含
  零件 + 人工）是专业工种服务行业的常态。工时与材料计价（T&M，按
  工时 + 零件收费）属于例外，通常用于诊断或范围不确定的工作。
  应优先围绕固定价格进行构建。
- **调度看板** — 办公室人员使用的实时网格，以技术人员 × 时间段的形式
  展示，用于在一天中分配和重新调配工作。
- **派车上门** — 派技术人员前往现场。每次派车上门都有实际成本；
  尽量减少无效派车是运营的核心。
- **首次修复率** — 第一次上门便完成的工作占比。它是运营的
  北极星指标。修复率低 = 重复派车 = 利润损失。
- **返修** — 因第一次维修失败而再次上门。返修会被追踪且深受厌恶；
  它与保修相关。
- **会员计划 / 服务协议** — 定期付费计划（例如每月 $19，
  每年 2 次保养），能够带来可预测的收入和优先预约权益。这是一种
  核心商业模式，而不是吸引回头客的噱头。
- **好、较好、最好** — 报价提供 3 个不同价位的选项（例如修补 /
  更换 / 升级更换）。这是标准销售技巧，能够提高客单价。
- **调度费 / 上门费** — 仅为上门收取的固定费用；如果客户确定下单，
  通常会免除。
- **非工作时间 / 紧急服务费率** — 夜间、周末和节假日采用的溢价。
  使用相同的价目手册，但应用不同的乘数。
- **GPS / 路线** — 技术人员的位置和优化后的行驶顺序；用于生成
  “技术人员将在 12 分钟后到达”的客户短信。
- **零件加价** — 零件的收费高于成本（通常为成本的 2–3 倍）；
  这是调节利润率的手段，必须能够按明细行表示。

## 2. 不明显的领域规则（这个垂直行业的独特之处）

- **定价靠查询，而不是算术。** 价格以固定费率从价目手册中查出。
  按小时计算是少见路径，而不是默认方式。
- **报价本身就是销售工具。** 报价在现场展示，通常通过平板电脑完成，
  并当场成交——它应具备交互性、品牌化展示、“好、较好、最好”选项，
  以及接受报价并付款的功能。它不是一份通过电子邮件发送、留待以后
  决定的 PDF。
- **技术人员需要离线工作。** 地下室、设备间、偏远地区——这些地方
  没有信号。现场应用必须能够离线记录工作、照片和签名，并在之后同步。
  这是硬性要求，而不是锦上添花的功能。
- **当日调度很常见。** 工作会在同一天内创建、分配和重新调配；
  调度看板是一个实时且可变的系统。
- **需求具有季节性且会骤增。** 第一次热浪 / 寒潮来袭时，暖通空调
  业务会大量涌入；园林绿化需求则集中在春季爆发。容量和预约系统必须
  能够承受需求激增，而不能假设业务流量始终均匀。
- **预约使用时间窗口，而不是精确时刻。** 客户得到的是“上午 8 点至
  中午 12 点”，而不是“8:00”。应对到达时间窗口进行建模，并支持
  逐步缩小范围（“技术人员正在赶来”）。
- **周期性业务是一等公民。** 会员计划、维护计划、季节性上门服务——
  数据模式必须原生表达周期和续约。

## 3. 朴素构建方式会犯哪些错误

- ❌ **按小时定价。** 将工作建模为工时 × 费率。行业通常依据价格手册
  采用固定费率报价；按小时计费只是边缘情况。如果这里做错，
  产品将无法销售。
- ❌ **没有离线模式。** 假设技术人员始终有信号。最常见的
  工作现场是地下室。仅支持在线使用的现场应用第一天就会失灵。
- ❌ **将报价单做成静态 PDF。** 它不应是一份只读文档，而应是一个
  可交互的接受并付款界面，提供可选方案和定金
  按钮。报价单必须能*促成成交*，而不只是描述交易。
- ❌ **没有好—更好—最佳方案。** 只提供一个价格，没有追加销售层级。这会
  放弃本可获得的利润空间，也会让任何买过 HVAC 服务的人感到陌生。
- ❌ **没有会员制 / 经常性收入模式。** 将每项工作都视为一次性业务。
  错失整个业务赖以运转的可预测收入引擎。
- ❌ **精确时点预约。** 在该行业按时间窗口作业时，却预约一个 9:00 的时点。
  这会给客户设定一个团队无法兑现的预期。

## 4. 必须建模的实体 / 字段（通用 CRUD 之外）

Schema 提示——确保这些设计便于迁移（参见 [[migration-ready-schema]]）：

- **PriceBookItem** — `code`、`name`、`category`、`flat_rate`、`cost`、
  `parts_markup`，以及分级价格 `{good, better, best}`；`is_recurring`
  标记用于可加入会员计划的项目。作为例外路径，T&M 项目带有小时费率。
- **Membership / ServiceAgreement** — `plan`、`cadence`（例如 2/yr）、
  `price`、`billing_interval`、`renewal_date`、`priority_flag`，关联
  客户；生成计划服务访问。
- **Job** — `status`（scheduled → dispatched → en_route → on_site →
  complete → callback）、`assigned_tech`、`arrival_window {start,end}`、
  `address`、`is_after_hours`、`first_time_fix` 标记；如果是经常性工作，
  则关联父级会员计划。
- **Quote** — `options[]` 数组（good/better/best），每个选项包含来自
  价格手册的行项目；`selected_option`、`deposit_amount`、
  `deposit_paid`、`accepted_at`、品牌信息；接受操作会将其转换为
  Job。
- **Tech / Crew** — 持有的技能/执照、基地、工作时间、
  当前 GPS 位置、容量。

## 5. 各产品说明（切入点 + 必须做对的一件事）

- **dispatch** (crud) — 将工作分配给技术人员、优化路线、提供实时状态
  看板。*切入点：* ServiceTitan 每位技术人员的费用约为 $300+，且偏重企业级；
  切入点是提供一个简洁的当日看板，让拥有 3–8 辆服务车的商家无需
  实施顾问就能真正运转起来。*必须做对：* 看板是**实时且可变的**
  ——工作会在当天中途重新分配并调整时间窗口，以到达时间窗口
  （而非精确时点）和技术人员状态来触发发给客户的“正在赶来”短信。
- **quoting** (marketplace-lite) — 照片/表单 → 已定价的品牌化报价单 →
  接受 + 支付定金。*切入点：* 与 Jobber/Housecall 相比，重点打造
  能在现场促成成交的**交互式接受并付款**报价单。*必须做对：*
  依据**价格手册**为好—更好—最佳方案定价，并包含
  定金步骤——报价单是销售工具，而不是 PDF。
- **field-booking** (booking) — 客户自主预约时间段，并收到
  提醒/确认。*切入点：* 现有产品将自主预约功能藏得很深；应提供一个
  极其简单的房主预约页面。*必须做对：* 根据实际团队容量预约一个
  **到达时间窗口**，然后发送提醒和确认（同意机制 + 时间安排延后至
  [[lifecycle-messaging]] 处理）。
- **reviews** (crm) — 每项工作结束后请求/分流/发布评价。
  *切入点：* 将商家目前手动执行的工作后评价邀请自动化。
  *必须做对：* **在工作完成时**发送请求（与首次修复成功的结果
  相关联，而不是无差别群发），将满意客户 → 引导至公开
  平台，将不满意客户 → 引导至私下补救流程；SMS/email 机制通过
  [[lifecycle-messaging]] 实现。

## 6. 合规 / 监管触点（简要——仅作指引，不做完整论述）

- **行业执照与许可证** — HVAC/管道/电气工作需获得执照，
  并且通常需要根据各司法管辖区的规定申请许可证。不要对行业资质
  进行建模；但应让 Job/Tech 携带执照/许可证引用字段，
  以便受监管的构建可以对其进行扩展。
- **TCPA（短信提醒）** — 预订确认/提醒通过短信发送；
  需要遵守同意、STOP/HELP 和免打扰时段相关要求。将所有消息基础设施和
  同意机制设计交由 [[lifecycle-messaging]] 处理——这里只需标明存在提醒功能，
  以便将其纳入规范，而不是事后附加。
- **定金 / 支付** — 报价需要收取定金，工作完成后收取
  费用。将 PCI 范围、幂等性和退款/争议流程交由
  账单/支付层处理——本规范只需要 `deposit_amount` /
  `deposit_paid` 字段，而不涉及支付处理商的设计。

## 输出

应用后，架构师/产品经理会将以下内容纳入 ARCH-*.md / PLAN-*.md：
价格手册固定费率定价模型、离线现场作业要求、
基于时间窗口的调度、包含多个选项且接受后即可付款的报价，以及
会员/周期性实体——并交叉引用 [[lifecycle-messaging]]、
[[migration-ready-schema]] 和 [[vertical-onboarding]]，而不是
重新推导这些内容。