---
name: genlayer-erc7710-connector
description: Connect GenLayer Intelligent Contract decisions to ERC-7710-style delegated authority. Use when an agent needs to design the interface, message schema, relayer/bridge path, EVM revocation controller, constraint updates, proof/finality assumptions, and failure handling that turn a GenLayer agent-performance review into ERC-7710 revocation or policy changes.
---
# GenLayer ERC-7710 连接器

在 mandate、ERC-7710 policy 和 GenLayer Intelligent Contract review flow 均已存在后使用此 skill。本 skill 不讲解 GenLayer 合约部署。有关 GenLayer 的构建、部署、测试和 CLI 操作，请使用 `https://skills.genlayer.com/` 上的官方 GenLayer skills 或 GenLayer 文档。

此 skill 规定了以下连接器：

```text
GenLayer Intelligent Contract decision
  -> decision proof / receipt / finalized result
  -> relayer or bridge
  -> EVM RevocationController
  -> ERC-7710 Delegation Manager rejects or constrains future redemptions
```

## 设计规则

不要在未定义效果路径的情况下说“GenLayer cancels ERC-7710”。GenLayer 产生一项决策。EVM 侧的 controller、account module、caveat enforcer 或 delegation manager integration 必须消费该决策。

## 工作流

1. 识别权限：
   - `mandateId`、`permissionHash`、delegator、delegate、delegation manager、target EVM chain 和 current policy。
2. 识别 GenLayer 决策源：
   - supervisor contract address、存储/返回决策的方法、review window、decision enum、score、issued timestamp 和 finalized transaction id。
3. 选择连接器模式：
   - Manual demo relay、trusted relayer、GenLayer Studio bridge relay、optimistic relay with challenge window、light-client/bridge verification，或在目标 GenLayer/EVM integration 支持时使用 direct EVM call。
4. 定义消息：
   - 包含足够的数据，使 EVM controller 能够准确撤销或约束单个 mandate/permission。
5. 定义 EVM 效果：
   - Revoke、constrain、pause、require human approval 或 mark pending appeal。
6. 定义安全措施：
   - Finality assumptions、replay protection、nonce、deadline、idempotency、emergency owner revoke 和 absolute permission expiry。
7. 定义测试：
   - Continue 不产生任何效果，revoke 会阻止未来 redemption，constrain 会收紧 policy，过期决策会失败，重复消息具有幂等性，伪造决策会失败。

## 连接器模式

使用能够真实匹配 demo 的最简单模式。

### Manual Demo Relay

最适合黑客松/原型 demo。UI 或 operator 读取 GenLayer 决策，并调用 EVM revocation controller。

说明信任假设：operator 受信任，能够正确 relay 该决策。

### Trusted Relayer

最适合真实的 MVP。服务监视 GenLayer review transactions，等待 finality，然后提交一笔已签名的 EVM transaction。

要求使用 allowlisted relayer keys 和 onchain event logs。保留 delegator emergency revoke path。

### GenLayer Studio Bridge Boilerplate

将其用于应通过真实跨链控制回路的 Base Sepolia demo，但不要声称其具备 mainnet 级别的验证能力。

流程：

```text
1. Base reporter contract packages a spend or action snapshot.
2. Base BridgeSender.sol sends it to GenLayer through the bridge boilerplate.
3. BridgeReceiver.py dispatches process_bridge_message() on the supervisor IC.
4. Supervisor IC reviews the window and calls BridgeSender.py.
5. Base BridgeReceiver.sol dispatches processBridgeMessage() on an EVM decision receiver.
6. Decision receiver verifies bridge receiver, source chain id, and source IC.
7. Decision receiver calls RevocationController.applyGenLayerDecisionStruct().
```

桥接样板中的默认 Base Sepolia 值：

- Base Sepolia chain id：`84532`。
- Base Sepolia LayerZero endpoint id：`40245`。
- `BridgeSender.py` 发出的 GenLayer source chain id：`61998`。

所需的 EVM 合约：

- 一个将快照发送到 GenLayer 的 reporter，例如 `WalletSpendReporter`；
- 一个作为 decision receiver 的合约，例如 `GenLayerDecisionReceiver`，并将其加入 `RevocationController` 的 relayer allowlist；
- 一条在执行支出前检查 `RevocationController.isRevoked`、`isPaused` 和 `getConstraints` 的 redemption 路径。

信任假设：除非添加经过验证的 proof path，否则在演示中应信任 bridge service 和已配置的 bridge contracts。保留 owner emergency revoke 和 absolute expiry。

### Optimistic Relay

最适合任何人都可以提交 decision，但 decision 可以在延迟期间受到质疑的场景。

适用于错误撤销代价高且可以接受延迟的高风险演示。

### Verified Bridge

最适合生产环境中的声明。EVM controller 会验证 GenLayer-origin proof 或受信任的 bridge message。

除非 proof/bridge implementation 确实可用，否则不要选择此模式。

## Message Schema

将其作为默认 connector payload：

```ts
type GenLayerDelegationDecision = {
  mandateId: string;
  permissionHash: `0x${string}`;
  genlayerChainId: string;
  genlayerSupervisor: string;
  genlayerTxId: string;
  reviewWindowId: string;
  decision: "continue" | "warn" | "constrain" | "revoke" | "escalate";
  score: number;
  violationsHash: `0x${string}`;
  evidenceBundleHash: `0x${string}`;
  constraintsHash: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
  nonce: bigint;
};
```

对于 EVM submission，对确切的 payload 进行 hash 和 sign，或对其进行 verify：

```ts
type RelayEnvelope = {
  payload: GenLayerDelegationDecision;
  payloadHash: `0x${string}`;
  relayer: `0x${string}`;
  signature?: `0x${string}`;
  proof?: string;
};
```

## EVM Revocation Controller

EVM controller 应暴露一个小型接口：

```solidity
interface IAgentRevocationController {
    event DelegationRevoked(bytes32 indexed mandateId, bytes32 indexed permissionHash, bytes32 decisionHash);
    event DelegationConstrained(bytes32 indexed mandateId, bytes32 indexed permissionHash, bytes32 decisionHash);

    function isRevoked(bytes32 permissionHash) external view returns (bool);
    function getConstraints(bytes32 permissionHash) external view returns (bytes32 constraintsHash);
    function applyGenLayerDecision(bytes calldata decision, bytes calldata proofOrSignature) external;
    function emergencyRevoke(bytes32 permissionHash) external;
}
```

ERC-7710 redemption path 必须在执行前检查此 controller。根据 delegation framework 的不同，该检查可以位于：

- Delegation Manager；
- caveat enforcer；
- smart-account module；
- 或由 account 控制的 pre-redemption policy validator。

## Decision Effects

- `continue`：记录已审查的 window；不更改 policy。
- `warn`：记录 warning；下一次 review 时可选择要求额外 evidence。
- `constrain`：更新 constraints hash，例如降低 gas cap、减少 txs、禁用 actions，或要求对 deployments 进行 human approval。
- `revoke`：将 `permissionHash` 标记为 revoked；所有后续 redemptions 均失败。
- `escalate`：暂停高风险 actions，或要求 human review。

## 周期性审查演示节奏

对于演示，一分钟的审查节奏是可以接受的，这样用户可以快速看到 GenLayer 决策修改或撤销委托。对于生产风格的授权，默认采用二十四小时的审查窗口或基于风险的节奏。产物应同时包含演示节奏和生产风格节奏，以便清晰展示信任假设和延迟假设。

周期性审查不能替代绝对的权限过期机制。应保持较短的支出周期、较低的上限、紧急所有者撤销机制，以及过期决策检查。

## 失败案例

始终处理以下情况：

- GenLayer 决策尚未最终确定。
- Relayer 提交了错误的 mandate 或 permission hash。
- 重复中继。
- `expiresAt` 之后的过期决策。
- 分数较低且决策为 `continue` 时存在歧义。
- 当前策略无法表示 `constrain`。
- 撤销控制器接受了伪造的 payload。
- 撤销交易上链之前，Agent 抢先执行操作。
- Relayer 故障导致不安全的权限保持激活状态。

缓解措施：较短的绝对过期时间、紧急撤销、交易/速率限制、错过审查时暂停、幂等性，以及明确的最终性延迟。

## 输出检查清单

设计连接器时，返回：

1. 连接器模式和信任假设。
2. GenLayer 决策源合约/方法。
3. `GenLayerDelegationDecision` 负载。
4. 中继/证明/最终性路径。
5. EVM 撤销控制器接口。
6. ERC-7710 兑换检查控制器的位置。
7. 决策到效果的映射。
8. 失败案例和测试。

## 参考资料

- `references/connector-patterns.md`，用于模式选择和测试案例。