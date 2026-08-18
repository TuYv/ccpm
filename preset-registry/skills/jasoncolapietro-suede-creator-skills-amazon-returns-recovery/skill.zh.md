---
name: amazon-returns-recovery
description: "Suede-affiliated Amazon money-recovery audit for restocking fees, short or denied refunds, and Amazon-billed subscriptions. Use when the user mentions a restocking fee, a short or denied Amazon refund, or a forgotten Prime Video Channel, Audible, Kindle Unlimited, or Prime charge, or asks whether Amazon still owes or bills them. Read-only discovery; no chat, cancellation, or dispute without the account owner's per-item confirmation, and never a promise of recovery. Requires an authenticated Claude in Chrome session. NOT FOR: bank chargebacks, marketplace A-to-z seller claims, price-protection claims, or subscriptions billed outside Amazon (use subscription-recovery)."
metadata:
  version: 1.0.0
---
# 亚马逊退货追回

**铁律：**

```
Nothing is disputed, canceled, or sent without the account owner's per-item
confirmation. Discovery is read-only; every action phase is gated.
```

## 为什么需要这样做

1. **这类金额不会主动显现。** 除非有人检查，否则补货费、少退款以及被遗忘的订阅费用都会悄无声息地留在订单记录中。
2. **在退货期限已过之后，推翻一笔已经被拒绝的退款，是一个经过充分论证的例外申请所能达到的现实上限**——因此，当事实支持时，不要只要求免除费用，还应提出更多诉求。

在起草争议申请之前，请阅读 [references/example-cases.md](references/example-cases.md)：其中有三个真实的已解决案例，以及奏效的确切措辞。

## 前置条件

- Claude in Chrome 浏览器扩展已连接到浏览器，并且用户已登录目标 Amazon 账户。如果 `mcp__claude-in-chrome__*` 工具尚未加载，请先通过 ToolSearch 获取（批量加载查询请参阅该扩展自身的 MCP instructions）。
- 此流程针对真实账户执行。如果账户是共享账户（同一登录名下，家庭成员使用不同的配送地址），需要做好发现不属于用户的订单的准备——标记这些订单，不要在未询问的情况下将它们直接并入同一批次。

## 阶段 1a — 订单/退货发现（只读，无副作用）

目标：找出 Amazon 扣除了补货费的每一笔已完成退货，且不进行任何操作。

1. 按类别关键词广泛搜索订单历史记录，而不要只搜索精确术语——Amazon 的 `your-orders/search` 会进行宽松匹配，因此一个关键词（例如 "razor"）也会显示相邻商品（如电动剃须刀、修剪器）。补货费主要集中在高价值电子产品/家电上，因此应优先检查这些商品，而不是消耗品或服装。
   - `https://www.amazon.com/your-orders/search/ref=ppx_yo2ov_dt_b_search?opt=ab&search=<keyword>`
   - 翻阅所有结果页——不要停留在第 1 页。较早的订单（超过一年）仍会显示在这里，即使它们早已从 `Your
     Returns` 中消失。
2. 为了更快覆盖*近期*活动，还应检查
   `https://www.amazon.com/your-returns`——但请注意，它只显示大约最近
   3 个月的记录，因此它只是搜索全面扫描的补充，而不是替代方案。
3. 对于每一笔显示 "Return complete" / "Refund Complete" / "Refund issued" 的订单，打开其详情页：
   `https://www.amazon.com/your-orders/order-details?orderID=<orderID>`
   找到 **Refund Total** 行——该行有一个小箭头，展开后会显示逐项明细（Item(s) refund / Tax refund / Restocking fee / Refund Total）。点击展开。没有费用的订单只会显示商品退款 + 税费退款 = 总退款；有费用的订单则会明确显示扣除项。
4. 记录每一条命中结果：订单号、商品名称、商品价格、补货费金额、配送对象，以及商品是由 Amazon.com 直接销售还是由第三方卖家销售（第一方商品的案例最有力——Amazon 自己的聊天客服可以直接免除这些费用，而无需让第三方卖家介入）。
5. 如果账户历史记录很长，不要试图在第一轮就做到穷尽——报告目前找到的内容，并注明如果用户希望进行更深入的扫描，更多记录可能散落在更早的年份中。

**到此为止** — 铁律。发现阶段结束；尚未打开任何内容，也尚未提出异议。

## 阶段 1b — 数字订阅审计（只读，不产生副作用）

**未经验证的点击路径** — 截至撰写本文时，下面列出的确切 URL 是目前已知的最佳入口点，尚未像阶段 1a 的流程那样确认可用。如果某个 URL 返回 404 或重定向到意外页面，请改为从账户菜单导航（Amazon 会定期移动这些页面），并在确认后将可用路径记录回此文件。

目标：找出所有通过 Amazon 账户计费的循环数字订阅 — Prime Video Channels、Audible、Kindle Unlimited、Prime 本身 — 并标记那些看起来已被遗忘、未使用或值得重新考虑的订阅。这与补货费属于不同类型的“Amazon 悄悄收取的钱”：它是持续发生的，而不是一次性扣款，因此通常的处理方式是“取消它”，而不是“免除费用”；只有确实被遗忘的扣款才保留退款请求。

1. **Prime Video Channels**（Britbox、Starz、AMC+、Paramount+、Shudder、
   MGM+ 等实际上都是通过这种方式计费的 — 它们不是独立的 Amazon 关系，而是叠加在 Prime Video 之上的附加频道）：
   `https://www.primevideo.com/settings/channels` — 列出每个活跃频道订阅、价格和下一次计费日期。如果该链接发生重定向，请前往 Prime
   Video → Account & Settings（右上角）→ Channels。
2. **Audible 会员资格**：`https://www.audible.com/account/membership-overview` —
   使用相同的 Amazon 登录信息，但这是独立的计费页面。页面会显示套餐等级、价格、下一次扣款日期和积分余额（未使用的积分本身也值得标记 — 它们不会立即过期，但最终会过期）。
3. **Kindle Unlimited**：`https://www.amazon.com/kindle-dbs/subscribe/kindle_unlimited`
   或通过 Account → Digital Services and Devices → Kindle Unlimited 进入。
4. **Prime 会员资格本身**：`https://www.amazon.com/manageprime` — 适用于用户没有使用 Prime 配送/视频/音乐权益、因而值得标记的情况（与 9 美元的频道附加订阅相比，取消这一项的影响更大，因此除非用户明确询问，否则仅报告，不要采取行动）。
5. 对于找到的每项订阅，记录：名称、月费/年费、下一次计费日期，以及 — 如果页面显示 — 最后使用或最后观看日期。如果计费页面上看不到使用数据，请直接询问用户是否仍在使用，而不要猜测。
6. 仅建立列表 — 铁律。

## 阶段 2 — 与用户确认

将发现结果以纯列表形式报告：对于费用，列出项目 / 订单号 / 费用金额 / 发货对象 / 自营还是第三方；对于订阅，列出名称 / 价格 / 计费周期 / 下一次扣款日期 / 看起来是在使用中还是已被遗忘。询问用户希望追究哪些项目，以及希望对每项采取什么结果（免除费用、对扣款提出异议、取消订阅，或取消订阅*并*要求退回最近一笔扣款）。有些费用是合理的（例如卖家在退货时已披露的已开封商品政策），有些订阅最终可能仍然是用户想要的 — 不要假设每项发现都值得采取行动；如果某项看起来是应得的费用或出于有意的订阅，而不是错误，也要明确说明。

## 第 3 阶段——争议或取消（一次处理一项，且仅在确认后进行）

对于费用/退款争议，使用 Amazon 的在线客服聊天请求豁免。具体点击路径、一个关键的弹窗窗口规避方法，以及升级至人工客服的流程，记录在
[references/dispute-chat-flow.md](references/dispute-chat-flow.md) 中——开始此阶段前请先阅读该文件，因为 Amazon 的聊天界面存在一个特定陷阱（它会在弹窗窗口中打开，而 Claude in Chrome 的标签页跟踪无法看到该窗口），如果跳过这一步，流程会在不知不觉中卡住。无论请求是“免除这笔重新入库费”还是“取消此频道并退还最近一笔费用”，使用的聊天流程和面向客服的脚本都相同——只有请求的具体内容会变化。

对于订阅取消，请注意两个不同的请求并不具有同等力度：
- **“取消此订阅”**是无条件的——用户随时都有权取消，无需协商。通常可以直接在订阅自身的设置页面（第 1b 阶段中的 URL）完成，无需使用聊天客服——请先尝试这种方式，它比通过聊天提出争议更快。
- **“因为我忘记取消/没有使用，所以退还最近一笔费用”**属于善意请求，与申请免除重新入库费相同——根据 Boundaries 中的真实性和单次反议规则，合理的做法是提出一次。

除上述 Boundaries 规则外，还需遵循两项聊天机制：
- 提供退款方式时，除非用户另有说明，默认选择原付款方式。
- 在结束聊天前，确认确切的退款金额和客服所述的处理时间，或确认确切的取消生效日期。

## 第 4 阶段——报告

每次争议或取消处理完成后（或客服拒绝处理时），告知用户：金额、退款方式、客服所述的预计到账时间或生效日期，以及客服姓名（如果对方提供）。如果一次会话中处理了多个项目，请汇总费用、退款和已取消订阅的累计结果（订阅节省金额应单独报告为“今后每月节省 $X”，不要与一次性追回的金额混为一谈——它们不是同一种资金）。

**证据规则——承诺不等于到账：**

- **逐字引用客服的确认内容，必须来自聊天记录原文**，不得改写。没有捕获到确认原文，就不得报告任何金额。
- 每一笔未经验证的金额都标记为**已承诺**，绝不能称为“已追回”。只有已入账的明细项目才能计入追回总额。
- 将回查设置为后续跟进：客服所述的预计到账时间通常为 3-5 个工作日，因此无法在当前会话中确认。到期后，重新打开订单详情页面，按照第 1a 阶段第 3 步展开 **Refund Total** 折叠项，并将明细与承诺金额进行比较。告知用户应检查的日期以及需要查找的金额。
- 如果回查显示豁免从未入账，请以聊天记录中的原文引用作为证据，将其作为新案例重新提交。

## 边界

- 未经账户所有者逐项确认，不得对任何项目提出争议、取消或发送任何内容；对一个项目的批准不得转用于另一个项目。第 1a 和第 1b 阶段仅允许读取。
- 在共享登录账号中，将属于其他人的订单标记出来，不要将其并入批量处理。
- 仅向客服陈述真实事实：订单号或订阅名称、商品、价格、费用金额。绝不要捏造此前联系过客服、退货原因或取消原因。
- 善意请求只提出一次。如果被拒绝，不要在一次礼貌反议之后继续施压。
- 绝不承诺一定能追回，也绝不将已承诺的金额报告为已追回款项。
- 价保退款不在处理范围内，且未经验证——未先与用户讨论，不得尝试申请。

## 路由

- 在 Amazon 之外计费的订阅（由服务提供商、Apple 或 Google 计费，而不是由 Amazon 账户计费）-> 使用 `subscription-recovery`。
- 银行拒付、商城 A-to-z 卖家索赔和价格保护索赔完全不在此 skill 的范围内。