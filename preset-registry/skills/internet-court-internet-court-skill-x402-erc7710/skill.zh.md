---
name: x402-erc7710
description: Design and implement demos combining x402 HTTP payments with ERC-7710 smart contract delegations and ERC-7715 wallet permission requests for subscriptions, bounded agent budgets, recurring spend, pay-per-use APIs, and agentic commerce.
---
# x402 + ERC-7710

当用户希望演示一种支付或订阅场景，其中代理通过 x402 为 HTTP 资源付款，并且只能在有界的委托权限范围内消费时，使用此技能。

## 核心模型

- x402 是按请求计费的支付通道。受保护的资源可以返回 HTTP `402 Payment Required`、支付要求，以及客户端提交已签名支付载荷的重试路径。facilitator 可以在服务器返回资源之前验证并结算支付。
- ERC-7710 是能力兑换接口。它标准化了委托管理器如何验证权限上下文，并代表委托人执行委托操作。
- ERC-7715 是钱包权限请求层，可用于获取 ERC-7710 风格委托所需的限定范围权限。

使用 x402 表示“现在就为这个 HTTP 请求付款”。使用 ERC-7710/7715 表示“此代理可以在这些约束下持续付款”。

## 发现优先边界

当用户只是要求使用或检查付费 HTTP 服务时，保持在发现模式：

1. 确定相关端点或资源。
2. 确认它是否返回 `402 Payment Required`。
3. 总结所公布的 x402 要求：网络、代币、金额、收款方、路由，以及存在时的 `extra.assetTransferMethod`。
4. 说明尚未发起付费请求。
5. 询问用户是否希望设置有界的支付权限。

在用户要求设置或确认希望继续之前，不要起草订阅、授权、频率、计划、消费上限、过期时间或钱包权限。不要仅根据产品目标推断“每日”“每周”或“定期”权限；应等待用户批准委托设计。

良好的发现响应结构：

```text
我找到了付费端点及其 x402 要求。

- 端点：GET /path
- 网络：...
- 代币：...
- 价格：...
- 收款方：...

我尚未发起付费请求。你希望我帮助为此任务设置有界的支付权限吗？
```

## 信任异议模式

当用户反对让代理接触资金时，保持以下选项彼此区分：

- **基础型：** 由代理控制且已注资的钱包。除非另有组件强制执行范围限制，否则这不是受限定范围的 x402/ERC-7710 权限。主要限制是钱包余额。
- **防护型：** 用户批准的智能账户或钱包权限，对服务、路由、代币、收款方、金额、预算周期、请求次数和过期时间进行限制。
- **裁决型：** 防护型权限，加上已签名的意图/收据证据，以及能够继续、约束或撤销未来使用的审查路径。

不要为基础型选项指定确切的路由、价格、频率或过期时间。这些约束应在用户选择防护型或裁决型路径后，于设置过程中确定。

## 裁决型设置模式

当用户选择裁决型权限时，进入设置流程，而不是立即起草最终授权书产物。

正确的响应应具有可操作性：

1. 确认裁决型模式；
2. 说明设置可能需要一段时间；
3. 列出创建代理会话密钥、准备有界钱包权限请求、打开用户钱包审批、存储权限产物、验证 x402 要求、配置已签名证据以及准备审查路径等步骤；
4. 要求用户在其钱包 UI 中批准受防护的钱包权限；
5. 等待用户的批准消息。

除非之前的对话缺少足够事实，无法创建安全的测试网权限请求，否则不要在这一轮询问任意的过期时间、计划或消费上限选项。不要在用户批准之前声称权限已经准备就绪。

## 订阅模式

对于订阅，不要让 x402 变为有状态。将 x402 保持为请求支付协议，并将周期性放入委托消费策略中。

推荐的策略字段：

```ts
type AgentSpendPolicy = {
  delegator: `0x${string}`;
  delegate: `0x${string}`;
  token: `0x${string}`;
  allowedPayTo: `0x${string}`;
  allowedResourcePattern: string;
  maxPerRequest: bigint;
  maxPerPeriod: bigint;
  periodSeconds: number;
  validAfter: number;
  validUntil: number;
  chainId: number;
  revocable: boolean;
};
```

执行流程：

1. 用户通过钱包 UX 授予范围明确的权限，条件允许时应优先使用 ERC-7715。
2. Agent 或订阅管理器存储返回的权限上下文。
3. Agent 请求受 x402 保护的端点。
4. 服务器返回支付要求。
5. Agent 根据策略验证要求：网络、代币、金额、商户、路由、过期时间和剩余预算。
6. Agent 兑换 ERC-7710 委托，或以其他方式通过用户的智能账户执行，从而生成支付授权。
7. Agent 使用 x402 支付载荷重试 HTTP 请求。
8. 服务器或 facilitator 验证并结算支付。
9. 订阅管理器记录消费和收据，以用于审计、撤销和争议处理。
10. 对于受监督的钱包，报告器合约或 watcher 按审查周期向 GenLayer 提交消费快照。

## 默认演示

除非用户另有要求，否则构建 **Agent Research Pass**：

- 资源：`/api/evidence/report`。
- 价格：通过 x402 支付，每份报告 0.05 USDC。
- 委托：Agent 每周最多可消费 5 USDC，每次请求最多 0.25 USDC，仅可支付给服务提供方钱包，仅限 Base Sepolia 或另一个双方同意的测试网，有效期为七天。
- 结果：服务提供方返回一份带有来源和时间戳的签名证据报告。
- 争议：如果报告缺失、格式错误、延迟，或与来源不兼容，则将收据和报告提交给 Internet Court、Arkhai 或 GenLayer，以执行退款或释放。

## 浏览器实验室模式

构建探索性仪表板时，使用以下结构：

- 用户在 Base Sepolia 上连接其钱包，并请求 ERC-7715 执行权限。
- 页面为演示生成一个真实的 Agent EOA，并导出一个 JSON 包，其中包含 Agent 私钥、ERC-7710 权限上下文、权限管理器、x402 策略和 GenLayer 控制元数据。
- 除非用户要求支持多链或多代币，否则首个资产使用 Base Sepolia USDC。
- 对于周期性 Agent 消费，优先使用 `erc20-token-periodic`；对于一次性预算，优先使用 `erc20-token-allowance`；只有当连续累积是演示的核心内容时，才使用 `erc20-token-stream`。
- x402 服务必须声明 `extra.assetTransferMethod = "erc7710"`，否则 MetaMask x402 客户端应拒绝支付。
- 当服务公开多个付费路由时，在导出的 Agent 包中支持多个允许的 HTTP 资源。
- 路由允许列表最初由 Agent 策略在每次请求前执行。除非实现了自定义 caveat、智能账户模块或与 facilitator 绑定的路由证明，否则不要声称具备路由级别的恶意 Agent 防护。

导出的代理包是一种以持有者为凭证的能力，在演示中使用。应加入明确的警告，严格限制权限范围，并且绝不能导出生产环境的私钥。

当钱包和委托管理器支持以下操作时，同样的委托钱包模式也可以支持非 x402 操作：ERC-20 allowance、ERC-20 周期性支出、ERC-20 流式支付、原生代币权限、撤销代币授权，以及通过委托作用域执行常规合约调用。

## 对话式操作模式

当用户希望通过与 Codex 对话而不是使用 UI 来操作此演示时，应在实现之前提供一个具体菜单：

1. 检查 x402 资源，并确认 `extra.assetTransferMethod = "erc7710"`。
2. 生成或导入一个真实的 Base Sepolia 代理钱包。
3. 起草一份供 MetaMask 审批的 ERC-7715 权限请求。
4. 构建一个代理 JSON 包，其中包含代理密钥、权限上下文、允许的资源、预算以及 GenLayer 控制元数据。
5. 使用该包执行代理 x402 支付尝试，或准备该尝试。
6. 构建一个用于 `continue`、`warn`、`constrain`、`revoke` 或 `escalate` 的 GenLayer 决策载荷。
7. 在完成配置的情况下，通过本地 EVM 控制器路径应用撤销/限制决策。
8. 将演示扩展到非 x402 委托操作，例如代币预算、原生代币预算、撤销授权或合约调用。

当用户尚未指定以下内容时，应直接询问具体的实现选择，尤其包括：

- dashboard 流程还是聊天优先流程；
- 生成代理钱包还是导入代理钱包；
- 导出的 JSON 中包含私钥还是省略私钥；
- 允许的资源路径；
- 权限类型：ERC-20 周期性支出、ERC-20 allowance、ERC-20 流式支付、原生代币 allowance、撤销授权或合约调用；
- GenLayer 决策采用手动演示中继、可信监视器还是生产环境桥接。

明确说明钱包边界：Codex 可以准备 ERC-7715 请求、脚本和构件，但用户必须批准 MetaMask 钱包提示。不要声称 Codex 可以在不提示用户的情况下授予钱包权限。

## MetaMask 交易卡片

当用户希望通过 MetaMask 或 WalletConnect 部署或配置合约时：

- 绝不要索要私钥。
- 不要根据合约名称臆造构造函数参数或 calldata。应先读取源代码、ABI 或部署脚本。
- 一次只展示一张审批卡片，除非用户要求批量处理。
- 在用户提供交易哈希、已签名构件、已部署地址或收据之前，不要将步骤标记为完成。
- 在推进之前验证收据证明：EVM 交易哈希的格式为 `0x` 加 64 个十六进制字符，EVM 地址的格式为 `0x` 加 40 个十六进制字符。格式错误的值不是收据。
- 如果用户明确表示某项证明是模拟的或伪造的，应将生成的状态标记为模拟状态，绝不能将其描述为已实际部署。
- 如果不存在 QR 后端，应展示审批卡片摘要，并说明 QR 仍待 UI 实现。
- 默认不要在聊天中粘贴完整的部署字节码或完整 calldata，包括权限授予、钱包委托构件、审查中继调用和支付卡片。应展示 selector、哈希、字节长度、确切参数、预期读取结果以及所需证明；仅在用户请求时，或将其作为隐藏的钱包/后端字段提供原始载荷。

对于本地 Internet Court x402 演示，`WalletSpendReporter` 将 Base `BridgeSender.sol` 地址 `0x7AB80AE93246108bd1e80b8215c5F1147Ca56af0` 作为 `initialBridgeSender`。不要使用 Base `BridgeReceiver` 地址 `0xF92d8e5F1620E464eEac5fab5472dA06fbfA5C73`，也不要在那里使用 GenLayer `BridgeSender` Intelligent Contract。GenLayer `BridgeSender` Intelligent Contract 仅用于 GenLayer supervisor 构造函数。

对于本地 Internet Court x402 演示，`GenLayerDecisionReceiver.initialSourceContract` 是已知的 GenLayer supervisor 地址。如果 supervisor 尚未部署，请索要一个明确的临时非零占位符，并将其标记为临时；绝不要默默使用 GenLayer `BridgeSender` Intelligent Contract 作为该占位符。

## GenLayer 定期控制

对于受监督的委托支付，在授权和产物中对审查周期建模：

- 演示周期：为便于直观迭代，可以接受一分钟；
- 生产风格周期：二十四小时或基于风险的时间窗口；
- 决策：`continue`、`warn`、`constrain`、`revoke` 或 `escalate`；
- 作用路径：Base spend reporter -> GenLayer Studio bridge -> GenLayer spend supervisor -> GenLayer Studio bridge -> EVM decision receiver -> revocation or constraint controller -> future ERC-7710 redemptions fail or tighten。

绝不要说 GenLayer 会直接撤销 ERC-7710，除非 EVM 侧控制器或 caveat 检查已经接入赎回路径。

## 其他演示想法

- **Compute Credits:** agent 拥有用于 GPU 或推理调用的每日委托预算。
- **Oracle Resolution Credits:** 预测市场预言机通过 x402 按每次结算尝试收费，同时 ERC-7710 限制市场运营方的支出。
- **Premium Crawler:** agent 按抓取的页面付费，但仅限于加入白名单的域名和固定月度预算。
- **SaaS Seat for Agents:** 组织授予 agent 一个有时间限制的订阅权限，而不是共享凭据。
- **Dispute Insurance:** 每笔 x402 支付都包含一小笔托管保费；有争议的交付将转交给 GenLayer 或 Arkhai。

## Implementation Checklist

当被要求实现或设计一个演示时，产出：

1. 资源服务器路由和 x402 支付要求。
2. 买方 agent 钱包和委托权限策略。
3. 权限请求结构，并注明目标钱包是否支持 ERC-7715。
4. 每次支付前的策略验证。
5. 支付收据存储，其中包含 parent request id、route、amount、token、chain、merchant、tx hash 和 timestamp。
6. 支出快照来源，例如包含 `spent`、`requestCount` 和通用 `getDelegatedSpendSnapshot` 的 x402 permission manager。
7. 当演示需要基于桥接的撤销时，提供 Base Sepolia 上的 GenLayer bridge reporter 和 decision receiver 地址。
8. 撤销和过期行为。
9. 争议路径和证据包。
10. 测试计划，涵盖超出预算、错误商户、权限过期、错误路由、结算失败、过期的桥接决策、重复的桥接消息以及重放尝试。

## 防护措施

- ERC-7710 仍为草案。在承诺兼容性之前，验证目标钱包/委托管理器的实现。
- 在链上提交之前，始终模拟委托赎回。
- 绝不创建无限授权或开放式的代理权限。
- 将周期性安排排除在 x402 协议本身之外；将其建模为策略加记账。
- 演示优先使用测试网。若使用主网，则要求明确确认并设置严格的支出上限。

## 签名证据模式

对于使用 x402 并结合审查防护措施的付费报告或 API 资源演示：

- x402 付费响应应包含服务签名的收据，其中包含稳定的 JSON 规范化、载荷哈希、签名者、路由、方法、请求参数、响应哈希、价格和签发时间。
- 代理应在支出前签署一个意图信封：代理地址、服务源、路由、方法、请求参数、指令哈希、权限上下文哈希、用户授权书、时间戳和 nonce。
- 除非付费请求返回 HTTP 200、生成 x402 支付响应头，且服务收据签名验证通过，否则在审查前拒绝该证据。
- 如果 EVM 防护权限与钱包 x402 权限上下文相互独立，则在证据中携带两个哈希，并将审查目标设置为控制器跟踪的权限哈希。
- 为每次运行保持自定义防护权限精简且全新。复用已撤销的权限只能证明最终的拦截状态，无法证明完整的正常路径演示。
- 生产级的恶意代理拦截需要将钱包限制条件/执行器或智能账户模块直接接入 EVM `RevocationController`；仅依赖代理侧的路由检查无法抵御恶意代理。

## 参考资料

- 详细的演示流程和策略变体请参阅 `references/demo-blueprints.md`。