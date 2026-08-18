---
name: magicblock
description: Design, implement, and debug MagicBlock applications on Solana. Covers Ephemeral Rollups with delegated state; ER/PER architecture and settlement; private payments and token flows; oracles and randomness; scheduling and temporary authority; security and local validation. Use for MagicBlock product selection, integration, cross-product design, or production troubleshooting.
---
# MagicBlock 开发技能

## 与 `solana-dev` 技能配合使用

此技能用于 MagicBlock 特有的相关事项：ER/PER、委托、预言机、Session Keys、cranks、VRF、
Magic Actions、eSPL 和私密支付。对于通用的 Solana 或 Anchor 工作，例如脚手架搭建、PDA、
账户布局、SPL 代币、客户端、钱包或 LiteSVM/Mollusk 测试，也应加载 `solana-dev`。

## 核心概念

**临时 Rollup（Ephemeral Rollups）** 通过在基础层锁定已委托账户，同时让 ER 克隆账户继续在其原始程序
所有者下执行，从而实现高性能、低延迟的交易。它们适用于游戏、实时应用和高吞吐量交易场景。

**临时账户（Ephemeral Accounts）** 只在 ER 内创建、使用和关闭。它们适用于临时的高频状态，
但永远不会提交到 Solana，因此不能成为持久化所有权、余额、奖励或结算结果的唯一副本。

**委托（Delegation）** 会暂时将基础层账户分配给 Delegation Program，并在 ER 中以其原始程序所有者
克隆该账户。在 ER 上，正常的程序所有权、签名者、权限和账户约束仍然适用；委托状态属于路由和生命周期
问题，并不是新的应用授权规则。

**委托调试不变量**：正确委托的账户在基础层看起来由
delegation program 所有；在路由器 `getDelegationStatus` 返回的 ER 端点上看起来由原始程序所有；
并且在 ER 中克隆为 `delegated=true`。

对于已验证的 SDK v0.16.2 快照，请使用 **MagicIntentBundleBuilder** 来
安排 commit 和 commit-and-undelegate intent。不要使用已弃用的
自由函数 `commit_accounts` 和 `commit_and_undelegate_accounts`。

**私有临时 Rollup（Private Ephemeral Rollups，PER）** 会通过带 TEE 支持的验证器中的 ER 本地
`EphemeralPermission`，限制已委托账户的访问。只在基础层委托数据账户，然后在 ER 上使用
`CreateEphemeralPermissionCpi`、`UpdateEphemeralPermissionCpi` 和 `CloseEphemeralPermissionCpi`
创建、更新和关闭其权限。不要创建或委托单独的基础层权限账户。

**Magic Actions** 是通过
`MagicIntentBundleBuilder.add_post_commit_actions(...)` 在 ER 交易中安排的基础层指令。每个尝试执行的
基础层交易都会原子性地应用其提交操作和 actions。如果任何 BaseAction 失败，committor 会在重试其余提交策略
之前，移除受影响的 `TransactionStrategy` 中的每个 BaseAction；其他交易或 finalize 策略中的 actions
不在该移除范围内。请观察并协调每个最初安排的 action：仅安排成功或最终提交成功，并不能证明其中任何 action
已经执行。

**提交赞助（Commit sponsorship）**：默认情况下，每个已委托账户都会获得 10 次向基础层免费提交的额度。
要解除该上限，可以重新委托（刷新额度），或将验证器范围内的 `magic_fee_vault` PDA
以及已委托的费用支付方附加到 intent bundle。已委托的支付方会被扣款；费用金库是经过验证的接收方，
用于接收该提交费用。

**Lamports 充值**：当一个已委托账户（例如已委托的费用支付者）在 ER 侧需要更多 lamports 时，请使用 SDK 中的 `lamportsDelegatedTransferIx`。该交易在**基础层**提交——Ephemeral SPL Token 程序创建一个一次性 lamports PDA，为其提供资金并进行委托，以便 ER 为目标账户入账。

**Ephemeral SPL Token** 提供两种使用面。在 SDK 生命周期模型中，客户端使用
`delegateSpl`/`transferSpl`/`undelegateIx`/`withdrawSpl`，并且 ER 余额会以所有者规范 ATA 地址处的普通 SPL token
账户形式出现，因此 Anchor 程序可以使用普通的 SPL Token CPI。在直接程序模型中，合约使用 `ephemeral-spl-api` 并显式操作 eATA/global-vault
PDA；不要将规范 ATA 模型应用于该原始使用面。

**Pricing Oracle** 为 Solana/ER 消费者重新发布受支持的市场数据源。安全集成应验证预期的数据源身份、上游发布时间的新鲜度、数值域、指数、经过检查的算术运算以及用户价格边界；仅成功反序列化并不等于完成价格验证。

**Session Keys** 为受约束的应用操作授权临时签名者。Session 的有效性与 SPL token 权限相互独立：代币支出还需要显式且有额度上限的 token delegate 授权。

**架构**：
```
┌─────────────────┐     delegate      ┌─────────────────────┐
│   Base Layer    │ ───────────────►  │  Ephemeral Rollup   │
│    (Solana)     │                   │    (MagicBlock)     │
│                 │  ◄──────────────  │                     │
└─────────────────┘    undelegate     └─────────────────────┘
     ~400ms                                  ~10-50ms
```

## 默认技术栈

### 程序

使用 Anchor 和 `ephemeral-rollups-sdk`；也支持 native 和 Pinocchio。

- 除非任务明确要求升级，否则使用目标仓库现有的 `ephemeral-rollups-sdk` / Anchor 版本
- SDK feature flag 用于选择 Anchor 版本范围：对于 Anchor 1.x 程序使用 `anchor`，对于 Anchor >=0.28,<1.0 程序使用 `anchor-compat`

**必需的宏：**

- 在程序模块上使用 `#[ephemeral]`，并且**位于** `#[program]` **之前**——该宏会注入 `process_undelegation` 回调（委托程序通过 CPI 调用它以归还账户）以及 commit/undelegate intent builder。Commit 和 undelegation 需要该宏；delegation 本身不需要。任何会执行委托的程序都应包含该宏，以便其账户之后能够执行 undelegation。
- 在相应的 delegation/commit account context 上使用 `#[delegate]` 和 `#[commit]`。
- 在 VRF *request* context 上使用 `#[vrf]`，并在 VRF *callback* context 上使用 `#[vrf_callback]`——
  callback 宏会验证 fulfillment。为 `ephemeral-rollups-sdk` 启用 `vrf` feature。
  SDK v0.16.2 重新导出了 VRF，因此新的 Anchor 代码不需要直接依赖
  `ephemeral-vrf-sdk`。参见 [vrf.md](references/vrf.md)。

**非 Anchor 程序：**使用
`ephemeral-rollups-pinocchio` crate（delegation、commit 和 VRF 都有对应的 Pinocchio 实现）。engine examples 仓库提供了
`roll-dice` 的 Anchor 和 Pinocchio 版本；当目标程序不是 Anchor 而是 native 程序时，请使用 Pinocchio。

此技能中的版本是经过验证的良好快照或兼容性标记。在更改依赖项之前，
请检查目标仓库的清单文件、工具链文件、锁定文件以及相关的上游源代码。
有关带日期的快照和源链接，请参阅 [resources.md](references/resources.md)。

### 连接

- 用于初始化和委托的基础层连接：
  `https://rpc.magicblock.app/devnet` 或 `https://rpc.magicblock.app/mainnet`
- 用于委托状态的路由器连接：
  `https://devnet-router.magicblock.app/` 或 `https://router.magicblock.app/`
- 用于对已委托账户执行操作的临时 Rollup 连接：
  使用路由器 `getDelegationStatus` 返回的 `fqdn`

### 交易路由

- 委托交易 → 基础层
- 对已委托账户的操作 → 临时 Rollup
- 取消委托/提交交易 → 临时 Rollup

## 操作流程

### 0. 在设计尚未确定时规划架构

对于新应用、集成、迁移或实现计划，在编写代码之前，请阅读
[architecture-planning.md](references/architecture-planning.md)。确定是否需要 MagicBlock，
选择最小的产品集合，梳理账户和交易路由，定义结算与恢复方案，并选择验证环境。每轮最多提出三个
重要问题；否则请基于明确的假设继续进行。

### 1. 对操作类型进行分类

- 账户初始化（基础层）
- 委托（基础层）
- 对已委托账户的操作（临时 Rollup）
- 提交状态（临时 Rollup）
- 取消委托（临时 Rollup）
- 仅 ER 的临时账户生命周期（临时 Rollup；从不提交）
- 异步服务工作（VRF 回调、crank、排队转账或 Magic Action）
- 构造托管 API 交易，然后由客户端签名/提交

### 2. 选择正确的连接

- 基础层：`https://rpc.magicblock.app/devnet` 或 `https://rpc.magicblock.app/mainnet`
- 路由器：`https://devnet-router.magicblock.app/` 或 `https://router.magicblock.app/`
- 临时 Rollup：针对该账户由路由器 `getDelegationStatus` 返回的 `fqdn`

### 3. 按照 MagicBlock 特定的正确性要求实现

对于每个实现，请记录：
- 每笔交易应使用的连接
- 操作前对路由器 `getDelegationStatus` 的检查
- 委托调用与账户定义之间相匹配的 PDA seeds
- 为受支持的基础层交易保留预检，并且仅在已知存在模拟不兼容问题的 ER
  路径中使用 `skipPreflight: true`（记录原因并检查执行日志）
- 在委托/取消委托之后等待状态传播
- 对于 Ephemeral SPL Token 流程，分别选择存款和提款构建器：使用
  默认 shuttle 提款，或者显式运行 `undelegateIx`，等待其基础层提交完成，然后调用旧版
  `withdrawSpl(..., { idempotent: false })`；对于直接 CPI，使用 `ephemeral-spl-api` 导出内容（不要使用复制的字节
  或猜测的 seeds）
- 对于预言机流程，处理身份、最大时效、数值转换、用户限制以及过期 feed 的行为
- 对于 Session Keys，处理作用域、过期时间、可选的一次性签名者 lamports 充值、撤销、由应用
  强制执行的消费限额，以及任何单独的 SPL 委托额度
- 对于异步流程，说明接受/调度与完成之间的差异，以及观测、幂等性、超时、重试、退款和对账屿

对于涉及安全的设计、审查和实现，请阅读 [security.md](references/security.md)。将协议保证与所需的集成验证、应用策略以及 Solana 的常规安全要求区分开来。不要将应用层建议表述为 MagicBlock 协议保证。

### 4. 调试实时委托/路由故障

对于 `InvalidWritableAccount`、私有余额缺失、验证器不匹配，或“账户已委托但 ER 拒绝该账户”等报告：
- 从确切的签名或账户公钥开始。
- 查询路由器 `getDelegationStatus`，并使用其 `fqdn` 进行 ER 读取/交易。
- 比较基础所有权、路由器状态、ER 所有权以及最近的 ER 交易日志。
- 对于已委托账户，将基础所有权归属于委托程序视为预期行为。
- 有关完整操作手册，请参阅 [debugging.md](references/debugging.md)。

### 5. 诊断可能的服务端故障

对于可能由服务端引起的意外 RPC、路由、预言机或交易错误：
- 始终获取当前数据；不要根据记忆中的状态作答。使用直接 JSON API `https://status.magicblock.app/api/services` 作为事实来源。
- 选择代码所使用的同一网络：JSON 键为 `mainnet` 和 `devnet`。
- 将受影响的端点匹配到正确的区域/服务器和服务：
  - 区域包括 `asia`、`europe`、`usa` 和 `tee`。
  - 服务 ID 列在 `.meta.services` 中；当前包括 `er`（Ephemeral Rollup）、`rpc_router`、`pricing_oracle` 和 `vrf_oracle`。
  - 使用 `.environments[network].regions[region].servers` 下的服务器条目；对于主网亚洲区域，其中包括 `as.magicblock.app`。
- 解释 `.live_status[service]`：`true` = 正常运行，`false` = 已宕机，缺失/undefined = 不适用。
- 将 `.metrics[service]` 解释为每天的停机分钟数，并根据 UTC 时间与 `.meta.days` 对齐。
- 报告调查结果时，包含网络、区域、端点、服务状态以及相关日期范围。区分实时状态与历史停机情况。
- 对于直接 ER RPC 端点，可以选择使用 JSON-RPC `getHealth` 或 `getVersion` 进行关联验证，但不要让单次 RPC 探测取代状态 API。

### 6. 添加适当的功能

- 用于周期性自动交易的 Cranks
- 用于游戏/彩票中可验证随机性的 VRF
- 用于私密转账和交换的 Private Payments API
- 用于已验证外部市场数据的 Pricing Oracle
- 用于重复执行低摩擦用户操作的 Session Keys
- 用于明确允许消失的临时状态的 Ephemeral Accounts

组合多个产品时，请阅读 [composition-patterns.md](references/composition-patterns.md)，并将权限、代币控制、预言机有效性、ER 执行、基础层结算以及异步完成分别作为独立的保证。

### 7. 交付物要求

实现变更时，请提供：
- 具体变更的文件及差异
- 安装/构建/测试命令
- 涉及委托/签名/状态提交的任何风险说明

## 渐进式披露（按需阅读）

- 架构规划、输出模板和验证环境选择：[architecture-planning.md](references/architecture-planning.md)
- 跨产品选择和边界设计：[composition-patterns.md](references/composition-patterns.md)
- MagicBlock 特定的安全边界和源码规范：[security.md](references/security.md)
- 调试 ER/委托故障：[debugging.md](references/debugging.md)
- 核心委托模式：[delegation.md](references/delegation.md)
- Ephemeral Accounts（仅限 ER 的临时状态）：[ephemeral-accounts.md](references/ephemeral-accounts.md)
- Magic Actions（提交后在基础层执行的指令）：[magic-actions.md](references/magic-actions.md)
- 为已委托账户充值 lamports：[lamports-topup.md](references/lamports-topup.md)
- Ephemeral SPL Token 生命周期（存入、转账、应用程序 CPI、取消委托、提取）：[ephemeral-spl-token.md](references/ephemeral-spl-token.md)
- TypeScript 前端设置：[typescript-setup.md](references/typescript-setup.md)
- Cranks（计划任务）：[cranks.md](references/cranks.md)
- VRF（随机性）：[vrf.md](references/vrf.md)
- Pricing Oracle（数据源身份、新鲜度和安全使用）：[pricing-oracle.md](references/pricing-oracle.md)
- Session Keys（受限的临时权限）：[session-keys.md](references/session-keys.md)
- Private Payments API：[private-payments.md](references/private-payments.md)
- 本地开发和特定环境的验证：[local-development.md](references/local-development.md)
- 参考链接与版本：[resources.md](references/resources.md)

## 终端自愈提案

在最终响应之前，根据此技能的预期工作流程检查整个运行过程。

检查：
- 预期与实际的用户可见输出
- 命令、脚本、验证和构件结果
- 遗漏的覆盖范围或跳过的工作流程步骤
- 过时的指令或脆弱的措辞
- 意外的脚本与输出不匹配
- 验证缺口
- 回退方案或临时行为

如果发现缺口，请提供证据进行报告，并请求明确批准后再开展单独的维护任务。将已安装的技能文件视为只读文件，在正常执行期间不得修改。