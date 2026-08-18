---
name: genlayer-intelligent-contracts
description: Internet Court adapter for GenLayer Intelligent Contract supervision. Use to specify agent-performance rubrics, evidence schemas, decision outputs, and ERC-7710 connector expectations, while delegating actual GenLayer contract writing, linting, testing, deployment, and CLI interaction to the official GenLayer skills at https://skills.genlayer.com/.
---
# GenLayer 智能合约

当 GenLayer 作为智能体行为的裁决层时，使用此适配器。它应定义监督合约必须审查和输出的内容：用户的授权范围、智能体的行动日志、交易回执、理由、产物、输出，以及关于是否应继续授予权限、发出警告、施加限制或撤销权限的决定。

此技能不是 Intelligent Oracle 技能。Intelligent Oracle 用于二元公共网络证据市场。对于开放式的性能、相关性、质量、安全性和授权范围合规性审查，请使用此技能。

此技能也不是 GenLayer 部署技能。对于编写、部署、测试和与 GenLayer 智能合约交互，请使用 `https://skills.genlayer.com/` 上的官方 GenLayer 技能或 GenLayer 文档。如果环境中提供了这些技能，请加载它们以进行实现。如果没有，请告知用户安装/启用这些技能，并让此技能专注于 Internet Court 接口。

## 核心模型

```text
Mandate + rubric + evidence
  -> Agent executes transactions
  -> Receipts and outputs are submitted
  -> GenLayer Intelligent Contract reviews behavior
  -> Decision: continue, warn, constrain, revoke, or escalate
  -> Internet Court / revocation controller executes the workflow result
```

GenLayer 可以裁决定性标准。除非系统包含具体的跨链消息、中继器、控制器或账户模块来使用 GenLayer 的决定，否则它不会自动撤销 EVM 委托。

## 工作流

1. 提取审查目标：
   - 目标、允许的权限、禁止的行为、预期输出、审查频率、证据来源和撤销触发条件。
2. 起草评估标准：
   - 包括相关性、授权范围合规性、交易安全性、预算纪律、产物质量、证据完整性和用户价值标准。
3. 定义证据结构：
   - 使用结构化行动回执、交易哈希、已部署地址、智能体理由、输出产物、成本和先前警告。
4. 定义决定：
   - `continue`、`warn`、`constrain`、`revoke`，以及可选的 `escalate`。
5. 定义生效路径：
   - 对于 ERC-7710，加载 `../genlayer-erc7710-connector/SKILL.md`，以指定 `revoke` 或 `constrain` 决定如何到达 EVM 撤销控制器或委托管理器。
6. 增加可审计性：
   - 存储已审查的行动 id、评分、推理摘要、决定时间戳和下一次审查要求。

## 审查输入

将此作为默认的审查请求结构：

```ts
type AgentPerformanceReviewInput = {
  mandateId: string;
  objective: string;
  authoritySummary: string;
  prohibitedActions: string[];
  rubric: string[];
  reviewWindow: {
    startsAt: string;
    endsAt: string;
  };
  actionReceipts: AgentActionReceipt[];
  outputs: Array<{
    artifactId: string;
    uri: string;
    summary: string;
  }>;
  costs: {
    txCount: number;
    nativeGasSpent: string;
    tokenSpent?: string;
  };
  priorDecisions: AgentReviewDecision[];
};
```

对于钱包支出监督，请在每个审查窗口中包含一份链上支出快照：

```ts
type WalletSpendSnapshot = {
  mandateId: string;
  permissionHash: `0x${string}`;
  sourceChainId: 84532;
  spendReporter: `0x${string}`;
  actionType: `0x${string}`;
  policyHash: `0x${string}`;
  resourceHash: `0x${string}`;
  delegator: `0x${string}`;
  delegate: `0x${string}`;
  asset: `0x${string}`;
  payTo: `0x${string}`;
  spent: bigint;
  maxTotalSpend: bigint;
  maxPerRequest: bigint;
  requestCount: bigint;
  validAfter: number;
  validUntil: number;
  controllerNonce: bigint;
  reviewWindowId: `0x${string}`;
  evidenceBundleHash: `0x${string}`;
  observedAt: number;
};
```

在 Base Sepolia 演示中，优先使用从权限/记账管理器直接读取支出状态的 reporter 合约，并通过 GenLayer Studio bridge boilerplate 发送此快照。x402 是一种来源；合约调用、部署、compute-credit 或订阅管理器也可以提供相同的结构。

## 决策输出

```ts
type AgentReviewDecision = {
  mandateId: string;
  decision: "continue" | "warn" | "constrain" | "revoke" | "escalate";
  score: number;
  reasoning: string;
  violations: string[];
  constraints?: {
    maxTxsPerPeriod?: number;
    maxGasPerTx?: string;
    requireHumanApprovalFor?: string[];
    disabledActions?: string[];
  };
  reviewedActionIds: string[];
  issuedAt: string;
};
```

当 agent 有用但越权时，使用 `constrain`。当 agent 违反范围、创建不安全的部署、反复浪费预算、隐藏证据，或产生未能实质性推进授权目标的输出时，使用 `revoke`。

## 评分标准默认项

对于受委托的链上 agent，请包括：

- 授权目标相关性：操作与用户目标相关。
- 范围合规性：操作限制在允许的链、合约、选择器、工厂和操作类型内。
- 安全性：不存在所有权丢失、无限授权、可疑外部调用或可避免的不可逆影响。
- 预算纪律：gas/value/付费工具支出与工作量相称。
- 证据质量：每项操作都具有回执、理由，并在适用时提供产物。
- 结果质量：已部署的合约或输出可用，并与请求的工作流一致。
- 透明度：agent 解释其采取每项重要操作的原因。

## 撤销集成

当决策可能影响 ERC-7710 权限时，始终指定：

```ts
type RevocationEffect = {
  sourceChain: "genlayer";
  targetChain: "base" | "ethereum" | string;
  revocationController: `0x${string}`;
  mandateId: string;
  permissionHash: `0x${string}`;
  requiredDecision: "revoke" | "constrain";
  relayer: string;
  finalityAssumption: string;
  fallback: "owner_emergency_revoke" | "absolute_expiry" | "human_review";
};
```

除非 bridge、relayer 和验证路径均已定义，否则不要声称撤销是无需信任的。

connector skill 负责确切的 payload、relay/proof mode、EVM controller interface，以及 ERC-7710 redemption path 检查 controller 的位置。

## 输出检查清单

设计 GenLayer Intelligent Contract 审查流程时，请返回：

1. 通俗易懂的审查目的。
2. 审查输入 schema。
3. 评估标准。
4. 决策输出 schema。
5. 撤销/限制效果路径；如果涉及 ERC-7710，还需包含与 connector skill 的交接。
6. 证据提交流程。
7. 正常流程。
8. 失败和申诉路径。
9. 针对继续、警告、限制、撤销、缺少证据以及中继器行为不当的测试。

## 参考资料

- `references/agent-supervisor-contract.md`，用于可复用的监督者模式。