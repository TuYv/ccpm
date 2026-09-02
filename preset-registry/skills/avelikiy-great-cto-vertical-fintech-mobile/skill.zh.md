---
name: vertical-fintech-mobile
description: 'Domain-knowledge pack for money on a phone — wallets, payments, custody and signing, transaction lifecycle, KYC/AML gates, and offline reconciliation. The rules that separate a payments app from a CRUD app with a currency symbol: a balance is a claim about a server, an idempotency key must outlive the process that made it, keys never enter JavaScript memory, and a device clock may not order financial events. Applied by architect/pm/design-advisor when specing a mobile product that moves money, and by mobile-app-builder while implementing it.'
when_to_use: |
  Apply when a mobile product holds, moves, or reports money or assets:
  - architect writes ARCH-*.md for a wallet, payments, trading, remittance, or account product with a phone client
  - pm decomposes it and must not under-scope the transaction lifecycle (this is where naive specs fail)
  - design-advisor wireframes a balance, a send flow, a signing confirmation, or a blocked-account state
  - mobile-app-builder implements any screen where a number is money
  Do NOT apply to the server-side money rules — pci-reviewer owns payment scope,
  accounting-reviewer owns ledger integrity, oracle-reviewer owns on-chain
  oracles and MEV. This pack is what the PHONE gets wrong.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 手机上的资金——按转账过程中网络会中断来设计规范

一个丢失照片的现场应用令人恼火。一个丢失或重复转账的资金应用带来的则是损失、支持工单，有时还会招致监管。通用移动端契约中的所有内容仍然适用（离线队列、幂等性、权限）；本规范包的不同之处在于**它关乎资金**，而社区技能集并不包含这一部分，因为这是领域知识，而不是框架知识。

贯穿始终的一点是：**手机不是账本。** 它只是一个带有自身判断的客户端，每个界面都必须诚实地说明这一判断有多可靠。

## 1. 余额有三种状态，永远不是两种

`confirmed` · `pending` · `unknown`。如果显示出的数字没有说明自己属于这三种状态中的哪一种，就是在欺骗用户，而用户会据此采取行动。

- **confirmed** — 服务器已经确认，且应用最近收到过服务器的响应，因此可以说明确认时间。
- **pending** — 应用在此基础上应用了自己的乐观变更。它是一个*显示值*，不是事实，并且会明确标注。
- **unknown** — 应用尚未连接到服务器。这绝不是把上一次确认的数字显示成当前数字。显示过期余额却让人以为它是实时余额，正是本规范包要防止的缺陷。

每个余额都必须带有**截至何时**的信息。“£1,240.55”不是答案；“£1,240.55，截至 14:02”才是。

## 2. 幂等键必须比进程存活得更久

通用规则是“由客户端生成 ID，这样重新同步时就不会重复”。对于资金来说这还不够，因为进程可能会终止。

- 在意图离开界面**之前**生成密钥，并在同一次持久化写入中将其与意图一起保存。保存在内存中的密钥，意味着崩溃可能将其变成第二笔付款。
- 密钥属于用户的*意图*，而不是属于某次尝试。同一个“发送 £50”经过十次重试，都共享同一个密钥。再次点击按钮是一个新意图——否则就是重复发送，而界面需要通过禁用按钮或询问用户来决定如何处理。
- 服务器契约必须说明它会在多长时间内认可某个密钥。如果幂等窗口短于应用的重试退避时间，那就等同于没有幂等性。

## 3. 密钥绝不能进入 JavaScript 内存

对于任何需要签名的产品——托管钱包、非托管钱包、基于硬件的身份验证：

- 签名发生在平台的安全硬件中（Keychain/Secure Enclave、Keystore/StrongBox）。应用请求签名，但绝不持有密钥。
- JavaScript 变量中的助记词或私钥会出现在崩溃转储、调试器、redux devtools 和错误报告系统中。假定这四处都会出现。
- **非托管意味着不可恢复。** 如果产品无法恢复丢失的密钥，那么引导流程必须在密钥生成之前说明这一点，而不是事后写在支持文章中。
- 签名确认界面要显示实际被签名的内容，并进行解码。用户无法阅读的十六进制数据只是同意仪式。

## 4. 交易是一个状态机，并且要写下来

不是“已发送/失败”。至少应包括：

```
drafted → submitted → accepted → settled
                   ↘ rejected
                   ↘ unknown ──(reconcile)──→ settled | rejected
```

- **`unknown` 是一个真实状态**，而且是最重要的那个。请求已经发出，
  但没有收到任何答复。应用不能猜测，不能盲目重试（见 §2），也不能把它
  显示成失败——把实际上已经结算的付款显示为失败，会导致用户重复支付。
- 每个非终态都有一个**超时和负责人**：由谁检查、多长时间检查一次，
  以及在答复永远不来时要做什么。
- 终态就是终态。一个已结算的交易不会因为某个迟到唤醒的重试队列而被重新驱动。

## 5. 设备时钟不能给金融事件排序

一部时钟错误的手机，会在每一次 last-write-wins 冲突中悄悄获胜。

- 排序来自服务器，或者来自服务器发出的逻辑时钟。
- 设备时间可以作为 *observed* 元数据记录——但绝不能作为排序键，
  也不能作为审计时间戳。
- 对于任何与资金相关的内容，“哪个离线编辑更新”也适用同样原则。

## 6. 对账是一个功能，不是错误路径

当应用在一段离线之后重新连接时：

- 服务器对资金的视图**获胜**，始终如此。
- 差异必须被**呈现**出来，不能静默覆盖。一个先看到余额、
  随后又看到不同余额，却没有任何解释的用户，会去提交欺诈举报。
- 对账必须是幂等且可恢复的：它运行在不稳定的连接上，所以必须能在中途被打断后继续。
- 服务器从未收到的本地待处理意图，要重新提供给用户，而不是自动发送。
  自动发送一个一小时前的支付意图，是用户没有同意的意外。

## 7. 被阻止的账户是一种设计好的状态

KYC/AML 不是一个错误对话框。

- 这些状态是真实的产品状态，对应真实的界面：`unverified`、
  `pending review`、`verified`、`limited`、`frozen`。每一种都说明用户
  还能做什么，以及接下来会发生什么。
- 应用必须能够**停止**。在会话中途到来的限额或冻结，必须在下一次操作时被执行，
  而不是等到下次启动。
- 不要用用户可以据此规避冻结的措辞来解释冻结。`under review`
  就是完整信息；原因属于案件记录，不属于 UI。
- 重新验证提示必须在应用重装后仍然存在——状态保存在服务器上。

## 8. 操作系统未询问就截取的截图

两个平台都会在应用进入后台时对其进行快照，而那张图会落盘。

- 余额、账户号码，以及任何类似密钥的内容，在后台时都要遮罩。
- 在平台提供的情况下启用屏幕录制和截图检测，至少要覆盖助记词和完整 PAN 界面。
- 剪贴板是共享的，在某些平台上还会跨设备同步。复制到其中的地址或代码并不私密；要让它过期。

## 9. 要建模的内容（否则这个规范就太天真了）

| Entity | Non-obvious part |
|---|---|
| Intent | 与 transaction 分离。携带 idempotency key，在发送前持久化。 |
| Transaction | §4 的状态机，包含 `unknown` 和按状态设置的超时。 |
| Balance snapshot | 值 + 状态 + `as of`。绝不能只是一个裸数字。 |
| Reconciliation run | 可恢复、幂等，并记录有哪些差异。 |
| Verification status | §7 中的那些状态，由服务器持有，重装后仍然存在。 |
| Key reference | 指向硬件持有材料的句柄。绝不是材料本身。 |
| Limit | 按周期计算，由服务器评估，在会话中途也必须生效。 |

## 10. 此 pack 的边界

- **支付范围和 PSP 机制** → `pci-reviewer`。
- **账本完整性和复式记账** → `accounting-reviewer`。
- **链上预言机、MEV、可升级性** → `oracle-reviewer`。
- **金融应用的商店政策** → `mobile-store-reviewer`。
- **框架性能** → `agents/mobile-app-builder.md` 中的移动性能不变量。

这个 pack 负责问题中属于手机自身的部分，而这部分之所以经常被跳过，是因为它看起来像后端已经处理好的基础工作。