---
name: vertical-fitness
description: Domain-knowledge pack for fitness & wellness (boutique studios, gyms, coaches, on-demand brands) — the membership vocabulary, non-obvious billing/booking rules, and retention realities a builder must know so fitness products aren't speced naive. Covers the four products this niche ships (class-booking, coaching, churn-prevention, on-demand-video), how they wedge against Mindbody / PushPress / Zen Planner / Wodify / WellnessLiving, and the must-model entities (membership with freeze, recurring class template, waitlist, no-show policy, access tier). Applied by architect/pm during spec authoring so the schema and flows reflect how a studio actually bills and books, not a generic CRUD app.
when_to_use: |
  Apply when architect/pm specs a fitness/wellness product:
  - architect writes ARCH-*.md for a class-booking / coaching / churn-prevention / on-demand-video product in the fitness niche
  - pm decomposes any of those four products into tasks and needs the domain rules to not under-scope (billing + waitlist are where naive specs fail)
  - design-advisor wireframes a member-facing booking flow or a studio-owner dashboard
  Do NOT apply for non-membership verticals (the entity model here assumes recurring billing, class capacity, and attendance-driven retention).
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 健身与健康——按照工作室的计费与预约方式来编写规格

精品健身工作室、健身房、教练和点播式健身品牌。会员使用周期性
方案，课程容量有限，而会员留存成败取决于出勤情况。
如果构建者把它建模成“活动 + 门票”，最终交付的产品不会有任何工作室
经营者愿意用来开展业务——因为真正困难的部分是*计费*
和*候补名单*，而不是日历。本技能提供该领域的背景知识，确保
在开始编码前正确编写规格。

## 1. 领域术语（不了解这些会显得不专业）

- **课包、无限次会员与单次付费**——三种不同的
  产品。**课包**是会逐次扣减的 N 节预付课程（如 10 节课包）；
  **无限次会员**是周期性方案（通常按月自动续费），
  不会按每节课扣减；**单次付费**是一次单独付费到访。
  数据结构必须能够容纳这三种产品，而不能把它们统统归为“课时点数”。
- **周期性计费 / 自动续费**——会员资格会按周期
  （通常是每月）重复扣费，直至取消。这是收入引擎，也是
  最难正确实现的部分（参见 §2）。
- **候补名单**——满员课程有一个有序队列；当名额空出时
  （有人临近开课取消），系统会**自动递补**下一位会员并
  通知对方。这是核心功能，而非可选功能。
- **临近开课取消 / 未到场费用**——在政策规定的时间窗口内
  （例如不足 12 小时）取消或未到场，会导致该节课作废（从课包中扣减）
  或收取费用。该政策*本身就是*维护预约纪律的机制。
- **课程容量**——每节课都有严格的人数上限（由单车、瑜伽垫、普拉提床数量决定）。
  超出容量的预约必须进入候补名单，绝不能超额预约。
- **周期性课程安排**——课程以模板形式存在（“周一/周三/周五早上 6 点
  动感单车课”），由模板生成带日期的课程实例，并支持单个实例级别的覆盖设置
  （节假日取消、代课教练）。它不是一系列一次性活动。
- **签到**——将会员标记为已到课；签到会形成出勤
  历史，而出勤历史又会影响流失信号和课包扣减。
- **冻结 / 暂停**——会员无需取消会员资格即可暂停使用（旅行、受伤）；
  计费暂停，之后恢复方案。这是预期应有的功能。
- **MRR / 流失率 / LTV**——月度经常性收入、每月取消会员资格的会员
  百分比，以及客户终身价值。它们是经营者的核心指标。
- **打孔卡**——以实体卡为隐喻的课包（打孔 10 次）；其模型与
  具有剩余次数的课包相同。
- **家庭 / 户主账户**——一个计费账户对应多名会员
  （父母与子女、伴侣）；余额可以共享，也可以各自独立。
- **Mindbody 发现市场**——Mindbody 的消费者应用，用户可在其中
  *发现并预约*健身工作室。在该平台上展示是一个获客渠道，
  而不仅仅是使用一款软件——参见 §2 和 §5。

## 2. 不明显的领域规则（该垂直领域的独特之处）

- **困难的是计费，而不是预约。** 会逐次扣减的课包、
  自动续费的会员方案、暂停计费的**冻结/暂停**、
  周期中途变更方案时的**按比例计费**，以及支付失败后的重试/催缴，
  都是草率规格最容易崩溃的地方。应先设计会员/课包/冻结模型；
  日历只是较简单的那一半。
- **未到场 / 临近开课取消费用 + 候补递补是核心预约
  逻辑。** 在规定时间窗口内取消会触发费用，*同时*空出一个名额，
  系统必须通过通知**自动递补**下一位候补会员。这两条
  规则相互耦合——应一起建模。
- **周期性课程安排会生成按实例划分的预约。** 会员预约的是
  *某个带有具体日期的实例*（“本周五早上 6 点的课”），但课程安排
  本身是带有例外情况的周期性模板。预约、容量和候补名单
  全都关联到实例，而不是模板。
- **课程容量 + 候补自动递补是预约的核心。** 容量上限是
  硬性限制；超出部分进入队列；递补是自动且具有时效性的（如果在开课
  前 2 小时空出名额，应立即向候补名单中的会员发出邀请）。
- **Mindbody 的护城河是消费者发现应用——取代它需要付出真实
  代价。** 从软件角度看，取代 Mindbody 作为工作室使用的系统并不困难，
  但工作室一旦下架，就会失去 Mindbody 市场这一潜在客户来源。
  **必须在规格中明确呈现这一权衡**（参见 §5）——不要
  默认取代它毫无代价。

## 3. 朴素实现会犯哪些错误

- ❌ **会员体系缺少冻结/暂停和按比例计费。** 将套餐建模为固定的周期性收费，
  不支持暂停，也不进行周期中途的费用计算。会员会旅行，也会受伤；经营者也会提供暂停服务。
  不支持冻结 = 用户只能取消而无法暂停 = 产品*主动造成的*流失。
- ❌ **候补名单无法自动递补。** 候补名单只是一个无人处理的列表。
  它的价值在于空位出现时*自动*递补并通知；缺少这一点，该功能就只是摆设。
- ❌ **忽略爽约/逾期取消政策。** 允许随时免费取消会破坏课程的经济模型
  （会员会占着自己并不会使用的名额）。收费/扣除权益的时间窗口是预约逻辑的关键支柱。
- ❌ **将课程排期建模为一次性事件。** 手动创建每一节课，而不是使用带例外情况的
  周期性模板。这种方式无法维护，而且经营者只要取消某个节假日的单次课程，
  整套机制就会失效。
- ❌ **流失预防没有真正的风险信号。** “尚未付款的会员”已经太晚了。
  真正的领先信号是**出勤率下降**（原来每周来 3 次，现在连续 2 周为 0 次）——
  这才是必须触发挽回措施的时机，要赶在用户取消之前。

## 4. 必须建模的实体/字段（超越通用 CRUD）

Schema 提示——应确保这些设计便于迁移（参见 [[migration-ready-schema]]）：

- **Membership / ClassPack** — `type`（套餐 | 无限次 | 单次购买）、
  `remaining_balance`（次数套餐）、`billing_interval` + `auto_renew` + `price`
  （会员订阅）、`freeze_state {active, frozen_until}`、`start/end`、关联的
  账户。冻结会暂停计费；变更套餐时按比例计费。
- **RecurringClass**（模板）— `cadence`（日期/时间）、`instructor`、
  `capacity`、`service_type`；生成 **ClassInstance** 记录。
- **ClassInstance** — 模板中带日期的单次课程；`start`、`capacity`、
  `instructor`（代课覆盖）、`cancelled` 标志；预约关联到此处。
- **Booking** — 会员 ↔ ClassInstance；`status`（已预约 → 已签到 |
  逾期取消 | 爽约）、`pack_decremented`、`fee_charged`。
- **Waitlist** — 每个 ClassInstance 对应的有序队列；`position`、
  `auto_promote` 操作会将其转换为 Booking 并发送通知。
- **NoShowPolicy** — `cancel_window`（例如 12 小时）、`late_cancel_fee`、
  `no_show_fee`、套餐权益扣除规则；预约时引用。
- **Member** — 个人资料 + **出勤历史**（流失信号：
  每周到访次数趋势）、家庭关系、同意标志。
- **AccessTier** — 用于点播视频：某个套餐可解锁哪些内容
  （免费 / 会员 / 高级），用于控制流媒体内容库的访问权限。

## 5. 各产品说明（切入点 + 必须做对的一件事）

- **class-booking**（预约）— 销售会员订阅/次数套餐，会员可预约课程并加入
  候补名单。*切入点：* Mindbody 每月收费 99–599 美元，对于单体工作室而言
  过于臃肿；提供一套小型工作室真正用得起来的简洁预约 + 会员系统，
  就是切入点。*必须做对：* 相互联动的**容量 → 候补名单 →
  自动递补**闭环和**爽约/逾期取消政策**，并建立在真正支持会员订阅/次数套餐/
  **冻结**的计费模型之上。**需要明确呈现的权衡：**
  取代 Mindbody 成为工作室的软件，也会让工作室退出 Mindbody 的
  **消费者发现市场**——这意味着失去一个获客渠道。应在规格中明确指出；
  不要假设切换没有代价。
- **coaching**（内容）— 交付项目、计划并跟踪习惯。*切入点：*
  为教练提供结构化的项目交付界面，替代 PDF 和电子表格。
  *必须做对：* 将项目构建为**结构化计划**（周 →
  训练课次 → 练习），并支持会员的**习惯/执行度跟踪**，而不是仅仅堆放文件
  ——执行度数据也会输入流失信号。
- **churn-prevention**（CRM）— 识别有流失风险的会员，在他们取消前将其挽回。
  *切入点：* 将经营者凭直觉执行的留存挽救操作自动化。
  *必须做对：* 构建一个**由出勤率下降驱动的真实风险信号**
  （而不是付款失败，因为那时已经太晚），并触发挽回序列；
  消息机制延后至 [[lifecycle-messaging]] 处理。
- **on-demand-video**（内容）— 提供具有访问层级的流媒体内容库。
  *切入点：* **全新增量收入，无替换风险**——工作室可以在继续使用现有
  任意预约软件的同时推出该产品，因此它是最安全的首发产品。
  *必须做对：* 使用 **AccessTier** 进行访问控制（免费 /
  会员 / 高级），确保每种套餐都能正确解锁对应的内容库。

## 6. 合规 / 监管触点（简要说明——仅提供指引，不做完整论述）

- **周期性计费 / 自动续订法律**——自动续订会员资格受到监管：注册时需明确披露续订条款，且美国多个州（例如加州的 ARL）强制要求提供**便捷的在线取消**途径。为 `auto_renew` 建模时应支持自助取消；不要让用户只能通过电话取消。将 PCI 范围 / 支付处理商设计留给计费层处理——规格中需要的是续订与取消字段，而不是支付网关。
- **责任豁免书**——工作室要求会员在首次上课前签署责任豁免书。应让 Member 携带一个 `waiver_signed_at` 引用字段，以便在构建时据此限制预订；不要对法律文件本身进行建模。
- **短信同意（提醒 / 用户召回）**——预订提醒和用户召回通过短信/电子邮件发送；需遵守用户同意、STOP/HELP 以及免打扰时段的相关要求。将所有消息基础设施和同意机制设计交由 [[lifecycle-messaging]] 处理——此处只需标明存在提醒功能，以便将其纳入规格，而不是事后补加。
- **健康数据敏感性（轻量处理）**——对于工作室而言，健身/出勤/习惯数据*并非*受 HIPAA 约束的 PHI，因此不要过度设计合规体系。但这些数据属于个人敏感信息（例如指导过程中涉及的伤情、身体指标）——默认情况下应实施访问控制，并将其排除在分析范围之外。轻量处理即可，无需按受监管系统构建。

## 输出

应用后，架构师/产品经理会将以下内容纳入 ARCH-*.md / PLAN-*.md：
会员资格/次卡/**冻结**计费模型、**容量 → 候补名单 →
自动递补**预订闭环、**未到场/临时取消**政策、
周期性课程模板 + 按单次课程实例预订、作为客户流失信号的**出勤率下降**，
以及按需内容的 **AccessTier** 访问控制——此外，还要明确说明课程预订方面的
**Mindbody 发现渠道权衡**。应交叉引用
[[lifecycle-messaging]]（提醒 / 用户召回）、[[migration-ready-schema]]
（Mindbody 导出数据在导入时必须**保留通行证/次卡余额**及会员资格
状态）和 [[vertical-onboarding]]，而不是重新推导这些内容。