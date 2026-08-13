---
name: vertical-restaurants
description: "Domain-knowledge primer for the restaurants & hospitality vertical (dine-in, pickup, delivery). Gives architect and pm the vocabulary, non-obvious operating rules, must-model entities, and incumbent landscape so a restaurant-product spec isn't naive about modifiers, 86'd items, aggregator commissions, tip law, and razor-thin margins. Covers the 4 products: online-ordering, reservations, loyalty, shift-scheduling."
when_to_use: |
  Apply when speccing a restaurant / hospitality product:
  - architect writing ARCH-*.md for online-ordering, reservations, loyalty, or shift-scheduling
  - pm decomposing a restaurant feature and sizing tasks
  - anyone modelling a menu, order, booking, or rota and at risk of a flat/naive data model
  Do NOT apply for generic booking/CRM/content products outside food & hospitality.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：餐饮与酒店业——不要想当然地写规格

餐厅的利润极其微薄（净利润率仅 3–6%），且现有技术栈被强势的在位厂商占据。
如果规格将菜单视为简单的 `{name, price}` 扁平列表，或者
忽略了谁已经掌控 POS，最终交付的产品将没有任何经营者能够使用。
此技能会加载该领域的知识，让 architect/pm 听起来像是真正上过
一个班次。

该垂直领域包含 4 个产品：

| 产品 | 原型 | 一句话说明 |
|---|---|---|
| online-ordering | 内容 | 自主管理堂食/自取/配送的菜单与结账——避开聚合平台费用 |
| reservations | 预订 | 预订、餐桌管理、短信候位通知 |
| loyalty | CRM | 积分、优惠、流失顾客召回 |
| shift-scheduling | 预订 | 排班表、空缺班次，以及带覆盖规则的换班 |

需要与之进行定位对比的在位厂商：**Toast**（POS，约 $69–165/月 + 硬件 +
每笔刷卡 2.49% 起）、**Square**（POS/中小企业）、**SevenRooms**（预订/CRM，
面向高端市场）、**ChowNow**（免佣金点餐）、**DoorDash / Uber Eats /
Grubhub**（聚合平台，每笔订单收取 **15–30% 佣金**）。

## 1. 领域术语（在规格中使用这些词）

- **COGS / food cost %**——食材成本 ÷ 菜品价格。目标约为 28–35%。
- **Prime cost**——食材成本 + 人工成本；这是经营者最关心的指标
  （目标为销售额的约 60% 或更低）。
- **Menu engineering**——按受欢迎程度 × 利润率对菜品进行分类：
  stars（高/高）、plowhorses、puzzles、**dogs**（低/低）。这决定了哪些菜品
  会被推广或淘汰。
- **86'd**——某菜品已售罄/不可供应（“三文鱼已经 86 了”）。
  必须立即同步到每一个点餐渠道。
- **Modifiers / mods**——菜品的可选项（尺寸、熟度、加培根、不要
  洋葱、换成薯条）。这些选项按组组织，并带有必选/可选及最小值/最大值规则。
- **Covers**——接待的顾客人数（例如“一晚接待 200 位顾客”）。
- **Turn time**——餐桌被占用的时长；预订容量计算取决于此指标
  （一张双人桌约 75 分钟翻台一次）。
- **FOH / BOH**——前厅（服务员、迎宾、酒吧）/ 后厨
  （厨房、备餐、洗碗）。两者的排班和小费规则不同。
- **Tip pooling**——汇集后按规则（工时、岗位、点数）分配的小费。
  受法律约束——参见 §6。
- **Comps / voids**——comp = 免费赠送的菜品（由经理酌情决定）；void =
  在制作前取消的菜品。两者都需要审计追踪记录。
- **Ticket times**——从订单发送到后厨直至上菜所经过的时间；这是厨房的
  核心 SLA。
- **Third-party aggregator commission**——DoorDash/Uber Eats/
  Grubhub 收取的 15–30% 佣金。正是这一痛点让自有点餐成为切入点。
- **KDS (kitchen display system)**——厨房中取代纸质订单的屏幕；
  订单按工位路由至该系统。

## 2. 不明显的领域规则

- **POS 是黏性极强的记录系统——不要与它对抗。** Toast/Square
  掌控着菜单、支付和楼面运营。我们的产品应与 POS 集成或在其旁侧运行；
  不要试图取代它。同步菜单，不要将其分叉。
- **聚合平台佣金是伤口；自有在线点餐是切入点。**
  如果一家餐厅通过 DoorDash 完成一笔 $40 的订单并支付 25% 佣金，最终只能留下 $30。免佣金的
  直接点餐是最清晰明确的 ROI 卖点——应将其放在首位。
- **菜单具有深层的修饰选项层级，而不是扁平价格。** “汉堡”→ 尺寸
  组（必选，选 1 项）→ 熟度组（必选）→ 加料项（可选，
  0–5 项）→ 配菜（必选，选 1 项，替换可能加价）。价格 = 基础价 + mods。
- **86'd / 缺货状态是实时的，且必须同步到所有地方。** 当厨房将某菜品
  标记为 86'd 时，它必须同时从在线点餐、KDS 和
  POS 中消失，否则就会售出无法制作的菜品。
- **小费处理受到法律约束。** 小费池规则、哪些人可以参与分配（FLSA 禁止
  经理/业主参与小费池）、小费抵扣，以及服务费与小费之间的
  区别，都受劳动法约束，不能自由设定。
- **利润极其微薄。** 一个每笔订单增加 30¢ 成本的功能，可能会抹去
  该订单的全部利润。成本意识是一项产品特性，而不是锦上添花。
- **预订 + 候位名单以 SMS 为核心驱动。** “您的餐桌已准备好”应通过短信发送，
  而不是电子邮件。候位时间预估和就绪通知才是产品的核心。

## 3. 粗糙构建容易犯的错误

- **扁平菜单，没有选项层级。** `{name, price}` 无法表达
  “中份、全熟、加培根、薯条替换配菜（+$2）”。从一开始就应使用
  必选/可选及 min/max 来建模选项组。
- **忽略 86'd / 缺货状态。** 在线销售已售罄的商品会导致
  退款、顾客不满和拒付。库存状态必须是一等公民。
- **在线订餐系统不与菜单同步。** 如果第二份菜单逐渐偏离
  POS 菜单，就会出现价格错误和幽灵商品。应使用单一事实来源并保持
  同步。
- **小费处理方式违反劳动法。** 允许经理参与小费池，或
  将服务费错误标记为小费，属于违反 FLSA，而不是软件缺陷。
- **不区分堂食、自取和配送。** 每种渠道都有
  不同的履约方式、时间安排、费用、地址/餐桌数据和税务处理。使用一种
  通用的“订单”类型是错误的。
- **忠诚度体系只有积分，没有召回机制。** 只有积分，却没有针对流失
  顾客的重新互动流程（优惠、“我们想念你”），等于放弃了投资回报率最高的
  CRM 杠杆。

## 4. 必须建模的实体

- **MenuItem** — 基础价格、类别、档口、税务类别、可售
  状态（可售 / **86'd** / 定时供应），以及一个或多个 **ModifierGroup**。
- **ModifierGroup** — `{required: bool, min, max}` + 有序的 **Modifier**
  （名称、价格差额、默认选项、是否有货）。应采用层级结构，而不是扁平列表。
- **Order** — **渠道**（`dine_in | pickup | delivery`）、**状态**
  （`placed → confirmed → preparing → ready → completed | cancelled`）、包含已解析选项的
  行项目、计算得出的总额，以及各渠道对应的餐桌/地址信息。
- **Reservation** — 用餐人数、时间、翻台时间估算、餐桌分配、
  状态；以及 **Waitlist** 条目（预计等待时间、就绪提醒、短信会话）。
- **Shift** — 角色（FOH/BOH）、开始/结束时间、**覆盖规则**（每个
  角色/时段的最低员工数）、**空缺班次** + 带有审批/覆盖检查的
  **换班**请求。
- **LoyaltyMember** — 身份信息（手机号优先）、积分余额、赚取/兑换
  台账、上次到店时间（用于**召回**分群）、同意状态。

## 5. 各产品说明（切入点 + 一个领域核心要点）

- **online-ordering**（内容）— **切入点：** 相比 DoorDash 的 15–30% 抽成和
  Toast Online Ordering 的按单收费，提供免佣金的直接订餐。
  **一个核心要点：** 菜单及选项层级必须从 POS 同步，并在
  堂食/自取/配送渠道中遵循 86'd 状态，否则它会比所取代的
  聚合平台更糟糕。菜单可获得本地搜索排名 → 参见 [[local-seo]]。
- **reservations**（预订）— **切入点：** SevenRooms 面向高端市场且价格昂贵；
  以更低价格为 SMB 提供预订 + 候位功能。**一个核心要点：**
  它以短信为先——通过短信加入候位名单和发送就绪提醒就是产品本身；翻台
  时间决定餐桌可用性。短信同意 → [[lifecycle-messaging]]。
- **loyalty**（CRM）— **切入点：** 大多数 POS 忠诚度功能只有积分；我们增加
  优惠 + **召回**。**一个核心要点：** 重新吸引流失顾客
  （按上次到店时间分群并发送优惠）才是收入所在——应设计
  召回机制，而不只是积分累积计数器。消息发送 → [[lifecycle-messaging]]。
- **shift-scheduling**（预订）— **切入点：** 排班表 + 空缺班次 + 换班，
  比现有主流产品更便宜、更简单。**一个核心要点：** 换班必须强制执行
  **覆盖规则**（每个角色在每个时段的最低员工数）——不受约束的
  换班若导致生产线无人值守，就是典型的失败模式。

## 6. 合规（轻量处理——繁重工作交由其他部分完成）

- **小费池 / 劳动法（FLSA）**——管理人员/所有者不得参与小费
  池分配；应明确区分小费与服务费；遵守小费抵扣规则。各州
  法律有所不同（例如 CA）。将其作为约束条件提出；具体细节需确认。
- **食物过敏原披露**——美国 9 大过敏原必须能够在
  菜单项中声明；部分司法管辖区要求在菜单上标注。在 MenuItem 上建模过敏原
  标签。
- **候位名单/忠诚度计划的 SMS 同意机制**——TCPA 同意要求、STOP/HELP、静默
  时段适用于每一条短信。具体机制交由 [[lifecycle-messaging]] 处理。
- **支付**——PCI 范围、SCA、退款/拒付。将账单/支付
  设计交由账单/PCI 相关工作流处理；不要在此自行实现银行卡处理。

---

交叉引用：[[lifecycle-messaging]]（每个 SMS/电子邮件环节——同意机制 + 可送达
性）、[[local-seo]]（菜单和预订会影响本地搜索排名；“附近最好的塔可”
是转化漏斗）、[[migration-ready-schema]]（从现有 POS 导入已有
菜单/宾客名单，同时不丢失修饰项结构）。