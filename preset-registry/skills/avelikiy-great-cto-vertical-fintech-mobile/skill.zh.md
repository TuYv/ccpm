---
name: vertical-fintech-mobile
description: Domain-knowledge pack for money on a phone — wallets, payments, custody and signing, transaction lifecycle, KYC/AML gates, and offline reconciliation. The rules that separate a payments app from a CRUD app with a currency symbol: a balance is a claim about a server, an idempotency key must outlive the process that made it, keys never enter JavaScript memory, and a device clock may not order financial events. Applied by architect/pm/design-advisor when specing a mobile product that moves money, and by mobile-app-builder while implementing it.
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
# 手机上的资金——按网络会在转账中途失败来制定规格

一个丢失照片的现场应用很令人烦恼。一个丢失——或重复——转账的资金应用，带来的是损失、客服工单，有时还会招来监管机构。通用移动端契约中的所有内容仍然适用（离线队列、幂等性、权限）；这一套内容之所以不同，**是因为它涉及资金**，而社区的 skill 集合不会涵盖这些内容，因为它们属于领域知识，而不是框架知识。

贯穿始终的主线是：**手机不是账本。** 它是一个带有自身判断的客户端，而每个界面都必须诚实地表明这个判断有多可靠。

## 1. 余额有三种状态，绝不能只有两种

`confirmed` · `pending` · `unknown`。如果显示一个数字，却不说明它属于这三种状态中的哪一种，就是在对用户撒谎，而用户会据此采取行动。

- **confirmed** — 服务器确认过，且应用最近与服务器通信过，足以说明确认时间。
- **pending** — 应用在此基础上叠加了自己的乐观变更。它是一个*显示结果*，不是事实，并且会明确标注。
- **unknown** — 应用尚未连接到服务器。这绝不是把上一次确认的数字显示成当前数字。把过时的余额显示成实时余额，正是整套规范要防止的缺陷。

每个余额都必须携带**截至何时**的信息。“£1,240.55”不是答案；“£1,240.55，截至 14:02”才是。

## 2. 幂等键的生命周期必须长于进程

通用规则是“由客户端生成 id，这样重新同步时不会重复执行”。对于资金而言，这还不够，因为进程可能会终止。

- 在意图离开界面**之前**生成密钥，并在同一次持久化写入中将其与意图一同保存。保存在内存中的密钥，一旦发生崩溃，就可能变成第二笔付款。
- 这个密钥属于用户的*意图*，而不是某次尝试。一次“发送 £50”的十次重试共享同一个密钥。再次点击按钮代表一个新意图——否则就是重复发送，而 UI 必须通过禁用按钮或发起询问来决定如何处理。
- 服务器契约必须说明它会在多长时间内接受同一个密钥。如果幂等窗口短于应用的重试退避时间，那就等同于没有幂等性。

## 3. 密钥绝不能进入 JavaScript 内存

对于任何需要签名的产品——托管钱包、非托管钱包、基于硬件的身份验证：

- 签名发生在平台的安全硬件中（Keychain/Secure Enclave、Keystore/StrongBox）。应用请求签名；它绝不持有密钥。
- JavaScript 变量中的助记词或私钥会出现在崩溃转储、调试器、redux devtools 和错误报告工具中。假设这四处都会出现。
- **非托管意味着不可恢复。** 如果产品无法恢复丢失的密钥，就必须在密钥产生之前的引导流程中说明这一点，而不是事后写在客服文章里。
- 签名确认界面要以解码后的形式展示实际签名的内容。用户无法读懂的十六进制数据块，只是走过场式的同意。

## 4. 交易是一台状态机，而且必须写下来

不是“已发送/失败”。最低限度应为：

```
drafted → submitted → accepted → settled
                   ↘ rejected
                   ↘ unknown ──(reconcile)──→ settled | rejected
```

- **`unknown` 是一种真实状态**，也是最关键的状态。请求已经发出，但没有任何响应返回。应用不得猜测，不得盲目重试（见 §2），也不得将其显示为失败——一笔实际已经结算、却显示为失败的支付，会导致用户再次发送。
- 每个非终态都有一个**超时时间和负责人**：由谁检查、检查频率是多少，以及始终得不到响应时要采取什么措施。
- 终态就是终态。已经结算的交易，不应被一个延迟唤醒的重试队列再次驱动。

## 5. 设备时钟可能无法对金融事件排序

时钟错误的手机会在每一次写入时取胜，从而悄无声息地赢得所有“最后写入者胜出”的冲突。

- 排序应来自服务器，或来自服务器签发的逻辑时钟。
- 设备时间可以作为*观测到的*元数据记录，但绝不能作为排序键，也不能作为审计时间戳。
- 对于任何与资金相关的内容，“哪个离线编辑更新”也是如此。

## 6. 对账是一项功能，而不是错误路径

应用在离线一段时间后重新连接时：

- 服务器对资金的视图**始终优先**。
- 差异必须**呈现出来**，绝不能静默覆盖。用户看到一个余额，随后又看到一个不同的余额，却没有任何解释，就会提交欺诈报告。
- 对账必须具备幂等性且可恢复：它会在不稳定的连接上运行，因此必须能够承受中途被中断。
- 服务器从未收到的本地待处理意图应重新提供给用户，而不是自动发送。自动发送一小时前的支付意图，是用户未曾同意的意外行为。

## 7. 账户受限是一种经过设计的状态

KYC/AML 不是一个错误对话框。

- 这些状态是真实的产品状态，也应有真实的界面：`unverified`、
  `pending review`、`verified`、`limited`、`frozen`。每个状态都应说明用户仍可执行哪些操作，以及接下来会发生什么。
- 应用必须能够**停止**。会话进行期间到达的限额或冻结，必须在下一次操作时生效，而不是等到下次启动应用时才生效。
- 永远不要用用户可以据此规避冻结的措辞来解释冻结。“正在审核中”就是全部信息；原因应归入案件档案，而不是显示在界面上。
- 重新验证提示必须在应用重新安装后仍然保留——该状态存储在服务器上。

## 8. 操作系统未经询问就截取的屏幕截图

两个平台都会在应用进入后台时对其进行快照，并将该图像写入磁盘。

- 应用进入后台时，余额、账号以及任何类似密钥的内容都必须遮罩。
- 在平台提供相应能力的情况下，应检测屏幕录制和截图，至少要覆盖种子短语和完整 PAN 页面。
- 剪贴板是共享的，并且在某些平台上会跨设备同步。复制到其中的地址或代码并不私密；应使其过期。

## 9. 应建模的内容（否则规范就过于天真）

| 实体 | 不明显的部分 |
|---|---|
| 意图 | 与交易不同。携带幂等键，并在发送前持久化。 |
| 交易 | §4 中的状态机，包含 `unknown` 和各状态的超时时间。 |
| 余额快照 | 数值 + 状态 + `as of`。绝不能只是一个裸数字。 |
| 对账运行 | 可恢复、幂等，并记录存在差异的内容。 |
| 验证状态 | §7 中的状态，由服务器负责，即使重新安装应用也能保留。 |
| 密钥引用 | 指向由硬件持有的材料的句柄。绝不能是材料本身。 |
| 限额 | 按周期计算，由服务器评估，并在会话期间生效。 |

## 10. 本套件的边界

- **支付范围和 PSP 机制** → `pci-reviewer`。
- **账本完整性和复式记账** → `accounting-reviewer`。
- **链上预言机、MEV、可升级性** → `oracle-reviewer`。
- **金融应用的商店政策** → `mobile-store-reviewer`。
- **框架性能** → `agents/mobile-app-builder.md` 中的移动性能不变量。

本套件负责的是问题中属于手机端的部分，而这部分之所以经常被跳过，是因为它看起来像后端已经处理好的底层杂务。