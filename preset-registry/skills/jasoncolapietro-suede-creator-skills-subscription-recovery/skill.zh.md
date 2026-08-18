---
name: subscription-recovery
description: "Suede-owned recovery discipline for recurring charges billed outside Amazon: App Store, Google Play, PayPal, direct-bill streaming, gyms, news, and SaaS. Use when the user wants to find, audit, cancel, or dispute a subscription they may have forgotten, is being charged for twice, or no longer uses. Every cancellation and dispute requires the user to name the service first. Never enters payment credentials and never promises a refund. Requires Claude in Chrome for browser actions. NOT FOR: Amazon returns, restocking fees, or Amazon-billed Prime Video Channels, Audible, Kindle Unlimited, or Prime (use amazon-returns-recovery); merchant-side dunning and cancel-flow design (use suede-churn-prevention)."
metadata:
  version: 1.0.0
---
# 订阅恢复

```
IRON LAW: Never cancel, dispute, or contact a merchant about a service until the
user has named that specific service and the specific outcome they want for it.
A subscription appearing in a discovery list is not authorization to act on it.
```

## 前置条件

- 对于任何在浏览器中检查或操作的服务，都必须连接 Claude in Chrome 浏览器扩展。如果尚未加载 `mcp__claude-in-chrome__*` 工具，请先通过 ToolSearch 获取。
- 与 amazon-returns-recovery 不同，这里没有可以统一扫描的单一账户——发现范围取决于用户能够提供的信息（银行/信用卡账单、应用访问权限，或仅仅是说出他们记得付费的项目），以及可用的平台级订阅中心（App Store、Google Play、PayPal）。
- **未经验证的点击路径。** 只有 Phase 1a 中的 App Store、Google Play 和 PayPal 中心页面接近固定且可检查的 URL。每项服务自己的账单/取消页面（Netflix、Spotify、健身房会员门户等）都必须在线实时发现，并在确认后记录到 [references/service-playbook.md](references/service-playbook.md) 中，这样下次运行时就不必从头重新发现。

## Phase 1a — 平台订阅中心（只读，无副作用）

这三个平台各自只需一个页面，就能覆盖大量订阅，因为商户记录方是平台本身，而不是各个服务：

1. **Apple App Store**（通过 Apple 的应用内购买流程购买的 iOS/iPadOS/Mac 订阅——许多流媒体应用会通过这里收费，而不是直接收费）：`https://apps.apple.com/account/subscriptions`（需要登录 Apple ID），或在设备上依次进入：设置 → [Apple ID] → 订阅。
2. **Google Play**：`https://play.google.com/store/account/subscriptions` — Android 设备购买的订阅同理。
3. **PayPal 定期付款**：`https://www.paypal.com/myaccount/autopay/` — 列出所有获得持续授权、可以向该账户扣款的商户，包括其他地方都不会显示的商户（一个常见的盲区是：旧的免费试用转为付费后通过 PayPal 扣款，而用户从未打开过提醒邮件）。

这些列表都会显示服务名称、价格、计费周期和下次扣款日期，并且每个页面都有**直接取消按钮**——如果在这里找到订阅，可以直接取消，无需协商。

## Phase 1b — 银行/信用卡账单扫描（只读，无副作用）

如果用户可以分享近期账单（PDF、CSV 导出文件，甚至交易列表的截图），请扫描其中重复出现的商户名称和金额——同一商户按月/按年出现相同扣款，就是识别信号。这可以发现直接收费的服务（Netflix、Hulu、Disney+、HBO Max、健身房、SaaS 工具），这些服务不会显示在 Phase 1a 的中心页面中。请索要账单，而不是猜测；不要假定可以访问金融账户。

## Phase 1c — 直接询问

询问用户还有哪些他们知道自己正在付费、但 Phase 1a/1b 未发现的项目——经过提示后，人们通常能记住 60-70% 的订阅，但在被具体询问之前会忘记其余部分。对于首次排查，这通常比扫描账单更快；即使已经进行过账单扫描，也值得这样做。

## 阶段 1d — Amazon 特殊处理

如果订阅最终确认由 Amazon 计费（Prime Video Channels、Audible、
Kindle Unlimited、Prime 本身），不要在此处处理——将其交给
`amazon-returns-recovery` 的阶段 1b，该阶段已经记录了相关页面。

## 阶段 2 — 与用户确认

**停止。** 发现阶段已经结束，尚未取消、申诉或联系任何服务。
先呈现发现结果，然后等待用户指示。除非用户明确点名某项服务，否则不得对任何服务采取行动——沉默、“听起来不错”或笼统地表示可以开始，都不算点名。

将找到的每项订阅以纯文本列表报告：服务、价格、计费周期、
下次扣费日期，以及已知的使用信号（上次打开、上次观看、上次参加的时间）。询问用户想处理哪些订阅，以及他们希望对每项服务采取什么结果：仅取消、取消*并*要求退还最近一笔费用，或在不取消订阅的情况下申诉某笔具体费用（例如某月被重复扣费）。有些订阅最终可能仍然是用户需要的——不要假设每个发现都是错误的；如果某项看起来是用户有意订阅的，也要说明这一点。

## 阶段 3 — 执行（仅在确认后，一次处理一项服务）

**直接取消，无需协商：**
- 如果通过阶段 1a（App Store、Google Play 或 PayPal）找到，则直接在同一
  hub 页面上取消——这是最快的路径，无需聊天。
- 否则，前往服务自身的账户/计费设置，在求助聊天或致电之前，先寻找
  直接取消选项。

**退款/善意退款请求**（忘记取消、在尝试取消后仍被扣费、
重复扣费，或确实已数月未使用）：
- 使用与 amazon-returns-recovery 相同的基本规则：只陈述真实事实
  （服务名称、价格、扣费日期和实际原因），不要捏造并未发生的先前
  联系尝试或取消日期，明确询问想要的具体结果；最多礼貌地接受一轮反提议，
  然后报告结果，不要用任何不真实的说法继续升级处理。
- Apple 和 Google 都有独立于订阅中心本身的自助退款申请流程——Apple：
  `https://reportaproblem.apple.com`；Google
  Play：订单记录 → “Report a problem”（或通过
  `support.google.com` 提交退款请求）。
  对于 App Store/Play Store 的扣费，这些流程通常比聊天更快，值得优先尝试。
- 对于直接计费的服务，大多数都有支持聊天或取消挽留流程
  （用户尝试取消时，有时会主动提供折扣或部分退款）——只有在用户确实想以较低价格继续使用服务时，才接受挽留优惠；否则应拒绝并继续取消。

**记录有效路径。** 一旦确认某项服务实际可用的取消/申诉流程，将其添加到
[references/service-playbook.md](references/service-playbook.md) 中，并记录准确的 URL
和点击路径，方式与 amazon-returns-recovery 记录其聊天流程相同——这正是随着时间推移将“未验证”变为“已验证”的方法。

## 阶段 4 — 报告

每次取消或争议处理结束后，按服务分别报告：发生了什么
（已取消、已退款、已提出争议但被拒绝）、确认标识符或
确认邮件、实际结束日期，以及退款金额和方式。没有确认标识符或确认邮件的结果均报告为**未确认**，绝不能报告为已完成。对于任何尚未解决的事项，明确下一位联系人和日期。

如果在一次会话中处理了多项服务，请汇总为累计结果——将一次性追回的金额与因取消服务而节省的持续性月度/年度费用分开，因为它们不是同一种金额。

## 边界

- 切勿输入、存储或转录支付凭证、卡号或银行登录信息，也绝不连接金融账户。
- 切勿承诺退款金额、退款时间，或争议一定会成功。
- 切勿处理用户未指明的服务，也绝不要在一次批准中批量处理多项服务。
- 切勿对用户确认是有意进行的收费提出争议或予以取消。
- 切勿使用用户未提供的事实进行升级处理——不得捏造此前的联系记录、取消日期或使用情况声明。

## 路由

- Amazon 计费的订阅、退货和补货费 -> 使用
  `amazon-returns-recovery`。
- 为用户销售的产品设计取消流程、催收、留存优惠或挽留优惠 -> 使用
  `suede-churn-prevention`。该技能面向商家；本技能面向订阅者。