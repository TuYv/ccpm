---
name: internet-court
description: Entry point for Internet Court — the trust layer for agent-to-agent commerce. Use whenever an agent needs to transact with another agent or a paid service, or a user mentions agent payments, paid APIs (HTTP 402/x402), wallet custody or trust concerns, spending mandates, delegated permissions (ERC-7710/7715), escrow, agent identity or reputation (ERC-8004), negotiation between agents (A2A), agent jobs (ERC-8183), machine payments (MPP, AP2), supervision of agent behavior, revocation, verification, or dispute resolution (GenLayer) — even if they never say "Internet Court". Routes to the vendored protocol skills and connector skills in this package.
---
# Internet Court

Internet Court 是代理之间开展商务活动的入口技能。代理已经能够彼此发现、进行协商并完成支付——但它们缺少一种方式，来信任一个从未见过的交易对手。Internet Court 做两件事：它将一个碎片化的技术栈——身份、协商、合约、支付、托管、执行——连接成一个技能，并内置裁决机制：当两个代理达成交易时，它们会预先约定，如果出现问题，应如何解决。

核心句：

```text
Discovery and identity establish who. Negotiation and contracts set the terms.
Payment and escrow move or lock the funds. Execution does the work.
Adjudication decides what happened and writes the verdict back as reputation.
```

此软件包包含两类材料。请据此选择路径：

- **随附的协议技能** (`vendored/`) ——由协议自身官方发布的公开技能。对于协议机制，应始终优先使用这些技能；绝不要重新推导它们已经记录的内容。
- **连接器技能** (`integrations/genlayer-erc7710-connector/`、
  `integrations/genlayer-intelligent-contracts/`、
  `integrations/x402-erc7710/`) ——使这些协议能够协同工作的 Internet
  Court 专用连接层。

## 此软件包的位置

这是 Internet Court 软件包的入口技能，发布于
**`https://github.com/internet-court/internet-court-skill`**。此文件所指向的每个路径——
`vendored/<owner>/<skill>/SKILL.md`、
`integrations/<connector>/SKILL.md`——都相对于该仓库根目录。

在依赖某个技能的内容之前，请先解析这些路径：

- **完整安装**（通常情况——`git clone …/internet-court-skill
  .claude/skills/internet-court`）：直接从磁盘读取路径。
- **只有此 `SKILL.md` 存在**（主技能是单独加载的）：同级技能不在本地。请从原始仓库中获取文件：
  `https://raw.githubusercontent.com/internet-court/internet-court-skill/main/<path>`
  ——例如 `…/main/vendored/genlayer/write-contract/SKILL.md`——或者先克隆仓库。

绝不要臆造所引用技能的内容——请先从磁盘或原始 URL 加载真实文件。

## First Response Mode

当用户要求加载、安装或介绍 Internet Court 时——或者你在对话中首次引用它时——请使用下面的规范说明，以其**原文逐字**开头。不要对其进行改写；除非用户要求实现细节，否则不要以协议名称、支付通道或标准开头。

```text
Internet Court is installed.

Internet Court does two things: it connects a fragmented stack — identity,
negotiation, contracts, payment, escrow, and execution — into one skill, and
it builds in adjudication, so when two agents strike a deal they agree up
front how it settles if something goes wrong.

I can now help your agent find and vet a counterparty, agree terms, pay or
escrow funds, and do the work — and, if the deal is contested, get an
independent verdict that settles it and updates each side's reputation.
```

（当你只是在对话中途引用该技能，而不是报告一次新的安装时，删除第一行，其余内容保持不变。）

在用户要求具体演示、集成或部署后，使用以下技术栈和路由。

## 先发现的边界

当用户要求接洽某项服务、交易对手方或交易时，先检查并仅报告可观察到的内容——绝不假定其余部分。根据交易情况，这可能包括：

- 交易对手方是谁：来源、身份、声誉，以及所涉端点或资源；
- 成本及支付方式：是否需要付费，以及任何已公布的通道、网络、代币、金额、收款方或转账方式；
- 它承诺什么：交付内容、条款，以及它公开的任何证据。

在此阶段，不要虚构频率、时间安排、支出上限、到期时间、委托权限、审查政策或完整协议。明确说明边界——包括代理不持有用户未授予的资金或权限——然后停止，让用户的回复开启信任对话。例如，对于付费端点：

```text
This endpoint is paywalled. I don't have funds or permission to access it —
you'd need to fund and authorize me before I can proceed.
```

在用户选择信任级别且所需钱包或权限存在之前，绝不承诺资金、签名或进行交易。

## 信任级别

任何带有风险的交易——代理可能行为不当、交易对手方可能未能交付、资金或权限可能被滥用——都可以采用以下三种保护级别之一。选择能够覆盖风险的最轻级别，并如实说明权衡。从最弱到最强：

- **基础** —— 各方只是彼此信任。没有受限权限、没有托管、没有独立裁决者；每一方都直接根据交到自己手中的内容采取行动。速度最快但也最弱：实际限制取决于交付了什么，若出现问题则没有追索权。不要声称在此级别有任何限制得到强制执行。
- **防护** —— 交易事先受到约束，因此从设计上就只能在有限范围内出问题。所用工具取决于交易：带有明确限制的受限权限（具有附加条件的 ERC-7710/7715 permission）、在满足条款前锁定于托管中的资金，或由双方签署的限定范围条款。存在硬性限制，但没有中立方来裁定争议结果。加载 `vendored/metamask/smart-accounts-kit/skill.md` 以了解 permission 机制，或加载第 3/4 层 escrow 技能以处理锁定资金交易。
- **裁决** —— 在防护的基础上，增加一条独立审查路径，并通过签名证据裁定争议结果及执行后果：释放或退还 escrow、限制或撤销已授予的权限，并将裁决结果写回 reputation。加载 `integrations/genlayer-intelligent-contracts/SKILL.md` 以了解审查接口，并加载 `integrations/genlayer-erc7710-connector/SKILL.md` 以执行。

让级别匹配交易，而不是反过来。不要在此处虚构确切上限、频率、条款或到期时间；应说明这些将在设置期间根据已发现的条款确定。

## 智能体商务栈

一笔完整的交易会自上而下经过六个层级：寻找并审查交易对手方（1）、协商条款（2–3）、转移或锁定资金（4）、执行工作（5），以及——如果对结果存在争议——获得能够解决争议并将结果反馈至声誉系统的独立裁决（6）。大多数层级已经拥有可信的 skills；第 6 层是关键，因为没有中立裁决，托管资金就无法安全释放，合约也没有补救机制，声誉系统更无从记录。请将每个层级交由负责它的 skill 或参考资料处理：

| # | 层级 | 协议 | 负载 |
|---|---|---|---|
| 1 | 发现、身份与声誉 | ERC-8004、ERC-7857 | `vendored/chaingpt/trustless-agents/SKILL.md`（ERC-8004 注册表）、`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`（铸造 ERC-8004 智能体身份）、`vendored/privy/privy/SKILL.md`（嵌入式/服务器钱包身份与身份验证）、`vendored/humanode/humanode-agentlink/SKILL.md`（由真人支持的智能体身份）、`vendored/starknet/starknet-identity/SKILL.md`（Starknet 上的 ERC-8004）、`vendored/near/near-api-js/SKILL.md`（具名账户身份，例如 `alice.near`）、`vendored/metaplex/metaplex/SKILL.md`（Agent Registry + Core NFTs——Solana Agent Registry 的 ERC-8004 移植版正是基于这些原语构建的）；ERC-7857 尚无公开 skill |
| 2 | 协商 | A2A | `vendored/terminalskills/a2a-protocol/SKILL.md`（智能体卡片、任务生命周期）、`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`（多智能体编排）、`vendored/near/near-intents/SKILL.md`（用于跨链履约的 Intents + 求解器竞争） |
| 3 | 合约与义务 | Arkhai/Alkahest、ERC-8183 | `vendored/arkhai/alkahest-user/SKILL.md`（条件托管、仲裁人）+ `vendored/arkhai/alkahest-developer/SKILL.md`（基于 Alkahest 构建：自定义仲裁人与义务）、`vendored/arkhai/nla-create/SKILL.md` + `vendored/arkhai/nla-fulfill/SKILL.md`（由 AI 预言机仲裁的自然语言协议托管）、`vendored/arkhai/make-git-escrow/SKILL.md` + `vendored/arkhai/fulfill-git-escrow/SKILL.md`（测试套件悬赏托管）；ERC-8183 尚无中立的公开 skill |
| 4 | 支付与托管 | x402、MPP、AP2、ERC-7710/7715 | `vendored/coinbase/agentic-wallet/SKILL.md` + `vendored/chaingpt/x402/SKILL.md`（x402）、`vendored/tempo/mppx/SKILL.md`（MPP）、`vendored/okx/okx-agent-payments-protocol/SKILL.md`（统一的 x402/MPP/a2a-pay）、`vendored/metamask/smart-accounts-kit/skill.md`（委托）、`vendored/chaingpt/agent-wallet/SKILL.md`（策略门控钱包）、`integrations/x402-erc7710/SKILL.md`（组合支付通道）。**在 Solana 上**（非 EVM，不支持 ERC-7710）：`vendored/quicknode/quicknode-skill/SKILL.md`（x402 + MPP + 智能体订阅）、`vendored/sendaifun/squads/SKILL.md`（Squads V4 多签/智能账户——策略层）、`vendored/magicblock/magicblock-dev/SKILL.md`（委托状态 + 临时的限定范围权限——最接近 ERC-7710 的类比）、`vendored/sendaifun/glam/SKILL.md`（金库委托权限 + 时间锁）、`vendored/dflow/dflow-phantom-connect/SKILL.md`（钱包连接/签名/支付）。**多方（N > 2）结算**：`vendored/yellow/yellow-settlement-room/SKILL.md`（Yellow 应用会话：一个共享的链下房间、参与者权重 + 法定人数，以及一次最终的链上分配；Yellow 节点在活跃性方面是受信任的，并且会话本身没有争议机制）；AP2 尚无公开 skill |
| 5 | 执行 | 执行交易的智能体 + 计算/数据/价值通道 | `vendored/antseed/antseed-connect/SKILL.md` + `vendored/0g/0g-compute/SKILL.md` + `vendored/heurist/heurist-mesh-skill/SKILL.md` + `vendored/near/near-ai-cloud/SKILL.md`（付费/去中心化/TEE 可验证的推理）、`vendored/lifi/lifi/SKILL.md`（跨链价值转移）、`vendored/chainbase/web3-data/SKILL.md` + `vendored/nansen/nansen-token-research/SKILL.md`（链上数据/证据）、`vendored/starknet/starknet-defi/SKILL.md`（Starknet L2 合约/DeFi）、`vendored/solana/solana-dev/SKILL.md`（Solana 程序、RPC 查询、SPL 支付）+ `vendored/sendaifun/helius/SKILL.md` / `vendored/sendaifun/birdeye/SKILL.md` / `vendored/octav/octav-api/SKILL.md`（作为证据的 Solana + 多链数据）+ `vendored/sendaifun/debridge/SKILL.md`（Solana↔EVM 价值转移）+ `vendored/jupiter/integrating-jupiter/SKILL.md`（Solana 流动性/执行）、`vendored/yellow/yellow-settlement-room/SKILL.md`（价值在单个会话内的 N 个智能体之间通过链下转移，并最终一次性在链上结算）、`vendored/bnb-chain/bnbchain-mcp/SKILL.md`、`vendored/near/*`、`vendored/okx/*` 和 `vendored/altlayer/*` 软件包 |
| 6 | 验证与争议 | GenLayer（Kleros 是一种替代方案） | `integrations/genlayer-intelligent-contracts/SKILL.md`、`vendored/intelligent-oracle/intelligent-oracle/SKILL.md`、`integrations/genlayer-erc7710-connector/SKILL.md`。替代性的第三方仲裁（请披露；并非 GenLayer 自有）：`vendored/kleros/kleros-curate/SKILL.md`（代币策展注册表/挑战）、`vendored/arkhai/nla-arbitrate/SKILL.md`（对自然语言协议托管进行 LLM/人工仲裁）、`vendored/pnp/pnp-solana/SKILL.md`（带自定义预言机裁决的 Solana 预测市场）。为裁决提供输入的预言机**证据**（而非裁决本身）：`vendored/sendaifun/pyth/SKILL.md`（带置信区间的价格馈送）、`vendored/sendaifun/switchboard/SKILL.md`（按需数据 + VRF） |

## 技能路由

仅当任务实际达到触发条件时才加载技能——绝不要预加载。  
每一行左侧是一个**触发条件**，右侧是需要加载的技能，以及每个技能能提供的内容和应优先选择的技能。当某项需求对应多个子捆绑技能时，先加载指定的入口技能，然后再缩小到具体技能。提供整套技能包的所有者（OKX、AltLayer、Nansen、OpenServ、Starknet、ChainGPT）各有一个单独的**兜底**行：先加载入口技能，随着任务逐步明确，再加载 `vendored/<owner>/` 下的具体子技能——文件夹列表就是该所有者当前拥有的技能集合。

路径必须完全匹配，并以 `/SKILL.md` 结尾——有些所有者会在路径中重复自己的名称（例如 `vendored/lifi/lifi/SKILL.md`、`vendored/privy/privy/SKILL.md`、`vendored/chaingpt/chaingpt/SKILL.md`）；绝不要缩短或合并这些路径片段。某一行列出多个备选项时，只加载其中一个（该行会说明如何选择）；如果决定因素未知，应先询问，而不是全部预加载。

### 支付通道

| 当你需要…… | 加载 |
|---|---|
| 为返回 **402** 的 HTTP 资源付费（按调用付费）、搜索 x402 集市，或将自己的端点变现 | `vendored/coinbase/agentic-wallet/SKILL.md` — Coinbase x402 客户端：读取价格、付款、使用凭证重试；对于一次性的付费请求，从这里开始。`vendored/chaingpt/x402/SKILL.md` — x402 发现/变现：查找付费服务，或让你自己的端点返回 402。 |
| 流式支付小额款项或运行计量会话（按秒/按 token 计费，而非按请求计费） | `vendored/tempo/mppx/SKILL.md` — Tempo/Stripe MPP 的收费、会话和流式支付。当计费是持续性的，而不是单次调用时加载。**不适用于**按请求支付通道上的消费上限：x402 上的有上限或周期性预算应使用 `integrations/x402-erc7710/SKILL.md`，而不是 MPP。 |
| 在不将支付通道硬编码的情况下发起支付（x402 与 MPP 与 a2a-pay 之间） | `vendored/okx/okx-agent-payments-protocol/SKILL.md` — OKX OnchainOS 统一支付调度器。当交易对手方的支付通道未知或可能变化时加载。 |
| 通过有界权限执行支付（支付通道上的支出/订阅策略） | `integrations/x402-erc7710/SKILL.md` — 将 x402 通道与 ERC-7710 委托预算融合的连接器。需要受保护/可裁决的付费访问时加载。 |
| 从一个共享资金池中结算**两个以上**代理之间的款项：汇集资金、链下重新分配且每一步无需 gas、共同签署最终拆分结果 | `vendored/yellow/yellow-settlement-room/SKILL.md`：基于 `@yellow-org/sdk` v1 的 Yellow 应用会话，其中 N 个参与者分别携带一个 `signatureWeight`，会话设置一个 `quorum`，然后执行存入 / 操作 / 提取 / 关闭。只有当交易是**多方且需要多次更新**时才选择它：普通 x402 支付只有一个付款方和一个收款方，而 `vendored/arkhai/alkahest-user/SKILL.md` 是双边、一次性、无需信任的链上托管，并带有赎回超时。会话**不是**托管：未经 quorum，任何参与者都无法拿走其他参与者的分配，但 Yellow 节点在活跃性和诚实中继方面是受信任的，并且会话本身没有争议机制、挑战机制或超时机制，因此在任何价值转移发生前都要说明这一点。它也无法判断工作是否合格：将这一部分交给 `integrations/genlayer-intelligent-contracts/SKILL.md`，并让各方事先同意签署该判定所规定的分配结果。当 N > 2 时，单一标量 quorum 无法保护所有人（quorum 为 2 时，1/1/1 允许两个参与者将第三方的分配清零），因此应为每个存款方提供阻断性质的质押，或让他们分别处于独立的会话中。 |

### 权限、托管与委托

| 当你需要……时 | 加载 |
|---|---|
| 授予代理受限且可撤销的权限（ERC-7710 delegations、ERC-7715 permission requests、caveats） | `vendored/metamask/smart-accounts-kit/skill.md` — MetaMask 智能账户与委托机制。用于链上权限控制的 Guarded 级工具。用户**手动撤销**自己的委托时，也使用此行。 |
| 为代理提供带有内置策略门控的钱包（每笔交易上限、速率限制、会话密钥），而不是直接提供原始密钥 | `vendored/chaingpt/agent-wallet/SKILL.md` — 无托管、策略门控的钱包。当代理必须签名，但你不会交出私钥时加载。 |
| 配置或认证嵌入式/服务器钱包，并在多条链上进行策略门控签名 | `vendored/privy/privy/SKILL.md` — Privy 钱包身份与认证。 |

前两者是**互斥的——根据密钥由谁持有来选择**：用户
保管密钥并进行委托 → `smart-accounts-kit`；代理获得自己的
钱包（内置防护措施）→ `agent-wallet`。同一设计中绝不要同时加载两者。

### 身份、信誉与协商

| 当你需要……时 | 加载 |
|---|---|
| 在链上注册、发现或审查代理（ERC-8004 identity、reputation、validation） | `vendored/chaingpt/trustless-agents/SKILL.md` — ERC-8004 注册表；默认的身份/信誉技能。也可通过 `vendored/openserv/openserv-multi-agent-workflows/SKILL.md` 铸造，在 Starknet 上通过 `vendored/starknet/starknet-identity/SKILL.md`，在 BNB 上通过 `vendored/bnb-chain/bnbchain-mcp/SKILL.md`。对于人类可读的命名账户身份锚点（`alice.near`），使用 `vendored/near/near-api-js/SKILL.md`。 |
| 证明代理背后有真人支持 | `vendored/humanode/humanode-agentlink/SKILL.md` — Humanode AgentLink：签署 HTTP 请求、链上注册表。 |
| 与另一个代理交流：代理卡片、报价、任务生命周期（A2A） | `vendored/terminalskills/a2a-protocol/SKILL.md` — A2A 协议；在协商阶段、条款锁定之前加载。对于编排多个代理：`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`。 |

### 合约与托管

| 当你需要……时 | 加载 |
|---|---|
| 锁定资金，使其根据仲裁人的决定释放（条件式托管） | `vendored/arkhai/alkahest-user/SKILL.md` — 基于 Alkahest EAS、带仲裁人的托管；默认的托管工具。要**基于** Alkahest 进行构建（编写自定义仲裁人/义务、集成它），使用 `vendored/arkhai/alkahest-developer/SKILL.md`。Alkahest 是**双边且一次性的**；对于涉及**两个以上**代理、在支付前需要多次重新分配的交易，改用 `vendored/yellow/yellow-settlement-room/SKILL.md`，并披露这一点：Yellow 会话并非无需信任，且没有赎回超时。 |
| 通过 AI 预言机裁定的自然语言要求来进行托管 | `vendored/arkhai/nla-create/SKILL.md`（起草协议）、`vendored/arkhai/nla-fulfill/SKILL.md`（据此交付）、`vendored/arkhai/nla-arbitrate/SKILL.md`（作出裁决）——自然语言协议托管。 |
| 为让失败的测试套件通过而支付的赏金托管 | `vendored/arkhai/make-git-escrow/SKILL.md`（发布赏金）、`vendored/arkhai/fulfill-git-escrow/SKILL.md`（领取赏金）——git-escrow，用于通过测试结算的代码交付交易。 |

### 验证、裁决与争议

| 当你需要…… | 加载 |
|---|---|
| 编写 / 部署 / 测试 / lint GenLayer Intelligent Contract | `vendored/genlayer/write-contract/SKILL.md`（编写）、`vendored/genlayer/genlayer-cli/SKILL.md`（部署与调用）、`vendored/genlayer/direct-tests/SKILL.md` + `vendored/genlayer/integration-tests/SKILL.md`（测试）、`vendored/genlayer/genvm-lint/SKILL.md`（lint）。加载与你构建步骤匹配的那个。 |
| 设计裁决本身：审查标准、证据 schema、决策 payload | `integrations/genlayer-intelligent-contracts/SKILL.md` — Adjudicated 级别的审查接口。当结果需要定性 / 自然语言判断时加载。 |
| 将裁决结果转化为强制执行措施（撤销或限制 ERC-7710 权限） | `integrations/genlayer-erc7710-connector/SKILL.md` — 将决策连接到链上撤销操作的 relayer/controller wiring。**仅由裁决结果驱动**：当裁决必须改变 agent 的权限时加载；用户手动撤销自己的委托只需要 `smart-accounts-kit`。 |
| 根据公开网络证据解决一个范围狭窄的二元问题（预测市场 / 事实预言机） | `vendored/intelligent-oracle/intelligent-oracle/SKILL.md` — Intelligent Oracle。进行 schema 敏感的工作前，重新获取 `https://www.intelligentoracle.com/skill.md`。 |
| 将第三方仲裁作为 GenLayer 的替代方案（**披露其并非 GenLayer 自有方案**） | `vendored/kleros/kleros-curate/SKILL.md`（代币策展注册表 / 挑战）+ `vendored/kleros/kleros-ipfs-upload/SKILL.md`（IPFS 证据）；或使用 `vendored/arkhai/nla-arbitrate/SKILL.md` 进行 LLM/人工 NLA 仲裁；在 Solana 上，使用 `vendored/pnp/pnp-solana/SKILL.md`（带自定义预言机解析的无许可预测市场）。 |

### 执行、数据与价值转移（第 5 层）

| 当你需要…… | 加载 |
|---|---|
| 买卖 AI 推理（计算执行） | 按场所选择**一个**：`vendored/0g/0g-compute/SKILL.md`（去中心化计算/存储/可验证推理——当场所开放时的默认选项）、`vendored/antseed/antseed-connect/SKILL.md`（通过 USDC channels 进行 P2P 推理）、`vendored/heurist/heurist-mesh-skill/SKILL.md`（Heurist Mesh agents，x402 按次付费）、`vendored/near/near-ai-cloud/SKILL.md`（带 **TEE 证明**的私有推理——可验证执行证据）。如果尚未确定场所，只加载 0G 默认选项并询问——不要预加载其余选项。 |
| 跨链转移价值（兑换 / 桥接） | `vendored/lifi/lifi/SKILL.md` — LI.FI 跨链路由；针对稳定币的兑换使用 `vendored/lifi/lifi-stablecoin-swap/SKILL.md`；`vendored/near/near-intents/SKILL.md` — NEAR Intents：通过 solver 竞争实现跨链履约（抽象链，一个 agent 跨链执行）。前往或来自 **Solana**：使用 `vendored/sendaifun/debridge/SKILL.md` — deBridge Solana↔EVM 桥接、消息传递和无需信任的外部调用。 |
| 拉取链上数据作为证据（余额、交易历史、标签、持有者、smart-money） | `vendored/chainbase/web3-data/SKILL.md` — 通用链上数据。若需要更深入的分析，使用 `vendored/nansen/` 下的 **Nansen 7-skill pack**：先从 `nansen-token-research` 开始，然后随着问题范围缩小，使用 `nansen-wallet-profiler` / `nansen-holder-analysis` / `nansen-smart-money-tracker` / `nansen-general-search` / `nansen-prediction-markets` / `nansen-mpp-payment`。在 **Solana** 上：使用 `vendored/sendaifun/helius/SKILL.md`（DAS API、交易/webhook streams）、`vendored/sendaifun/birdeye/SKILL.md`（代币价格、持有者/交易者分析、钱包 P&L）、`vendored/octav/octav-api/SKILL.md`（多链投资组合 + 交易历史，按 x402 计费）。对于**指定置信区间的某个时间点价格**——这通常正是裁决所需的形式——使用 `vendored/sendaifun/pyth/SKILL.md`，而不是 DEX 聚合器。 |

### 全平台技能包（先使用兜底入口，再缩小范围）

| 当你需要…… | 加载 |
|---|---|
| 处理 **OKX OnchainOS** 的任何事务（钱包、DEX 数据、DeFi、支付、代理商贸） | `vendored/okx/` 下的 9-skill 技能包。先从 `okx-ai` 开始——这是代理商贸入口（ERC-8004 身份 + **带争议处理的**任务市场 + A2A 聊天），与 Internet-Court 最相关。然后再缩小范围：`okx-agentic-wallet`（兑换/跨链桥/策略/安全）、`okx-dex-market`（只读 DEX 数据）、`okx-defi`（投资/投资组合）、`okx-agent-payments-protocol`（x402/MPP/a2a-pay）、`okx-dapp-discovery`（路由至第三方 dapp）、`okx-guide`（入门/支持）、`okx-activity`（OKX 活动/黑客马拉松报名——偏离主题，从上游镜像而来）。 |
| **ChainGPT** AI 工具（合约生成/审计、新闻）+ 140-tool MCP | `vendored/chaingpt/chaingpt/SKILL.md` 是兜底中心。其专用兄弟技能已在上方路由：`x402`、`agent-wallet`、`trustless-agents`。 |
| **AltLayer** AltLLM 门户 + Cloud-Claw 代理 VM | `vendored/altlayer/` 下的 7-skill 技能包。入口：`altllm-portal-cli`（门户操作）以及 `cloud-claw` / `cloud-claw-launch-agent`（启动代理 VM）。其余是基础设施：`altllm-portal-auth`、`-api-keys`、`-billing`、`-payments`。 |
| **OpenServ** 多代理编排 + SDK（铸造 ERC-8004 身份） | `vendored/openserv/` 下的 5-skill 技能包。入口：`openserv-multi-agent-workflows`。其他技能：`openserv-agent-sdk`、`openserv-client`、`openserv-launch`、`openserv-ideaboard-api`。 |
| **Starknet** L2（Cairo、原生账户抽象） | `vendored/starknet/` 下的 4-skill 技能包。入口：`starknet-js`（SDK）。其他技能：`starknet-identity`（ERC-8004）、`starknet-defi`、`starknet-wallet`。 |
| **BNB Chain** 操作，包括 ERC-8004 注册和 Greenfield 存储 | `vendored/bnb-chain/bnbchain-mcp/SKILL.md`。 |
| **NEAR** —— AI 原生 L1（Shade Agents / TEE 推理、命名账户身份、链抽象支付） | `vendored/near/` 下的 6-skill 技能包。优先使用与主题相关的技能：`near-intents`（跨链支付/履约）、`near-ai-cloud`（作为证据的 TEE 可验证推理）、`near-api-js`（链交互 + 命名账户身份）。此外还有：`near-kit`（类型安全的 TS SDK + 沙盒测试）、`near-smart-contracts`（Rust 合约）、`near-dapp`（全栈 React/Next.js + 钱包）。 |
| **Solana** —— 高吞吐量非 EVM L1（SVM、Rust/Anchor 程序） | `vendored/solana/solana-dev/SKILL.md` —— 来自 Solana Foundation 的一个兜底技能，它会按需拉取自身的 `references/`（`payments`、`confidential-transfers`、`security`、`testing`、`rpc-quick-lookups`、Anchor/Pinocchio 程序指南）。Solana 侧的任何事务都使用它：编写/部署程序、SPL token 和 Solana Pay 流程、读取余额和交易作为证据。**非 EVM 注意事项**：这里不存在 ERC-8004 身份和 ERC-7710 委托权限——没有可直接替代的等效方案，因此应组合使用下面的 Solana 原生组件，而不是想当然地采用 EVM 路径。 |
| **Solana 代理商贸**（`solana-dev` 未覆盖的部分） | `solana-dev` 是一个开发者技能，不覆盖支付、身份或预言机。根据需求改用以下技能：**支付** `vendored/quicknode/quicknode-skill/SKILL.md`（x402 + MPP + 代理订阅——注意 Solana x402 使用部分交易签名，而不是 EIP-3009/Permit2，因此要根据网络进行分支处理），`vendored/sendaifun/metengine/SKILL.md`（一个实时的 x402 计量 API，使用 Solana 上的 USDC）；**受限权限** `vendored/sendaifun/squads/SKILL.md`（多签/智能账户）、`vendored/magicblock/magicblock-dev/SKILL.md`（委托状态、临时范围限定权限）、`vendored/sendaifun/glam/SKILL.md`（金库委托权限 + 时间锁）；**身份** `vendored/metaplex/metaplex/SKILL.md`（Agent Registry / Core NFTs）；**证据** `vendored/sendaifun/pyth/SKILL.md`、`vendored/sendaifun/switchboard/SKILL.md`、`vendored/sendaifun/helius/SKILL.md`、`vendored/sendaifun/birdeye/SKILL.md`、`vendored/octav/octav-api/SKILL.md`；**价值转移** `vendored/sendaifun/debridge/SKILL.md`、`vendored/jupiter/*`；**代理框架** `vendored/sendaifun/solana-agent-kit/SKILL.md`。以上全部是来自 solana.com/skills 目录的**社区**技能，而非 Solana Foundation 的代码——当其行为与问题相关时，请明确说明这一点。 |

## 工作流

1. 对交易进行分类：
   - 委托代理权限或可撤销授权。
   - 按次付费 API 或内容访问。
   - 周期性支出或订阅。
   - 托管式服务交付。
   - Web 证据预言机或预测市场。
   - 有争议的工作、SLA 或退款。
2. 提取商业条款：
   - 参与方、目标、权限、禁止的操作、金额、周期、最大
     支出、到期时间、交付物、证据来源、审查周期、
     撤销路径、退款路径和争议期限。
3. 选择支付轨道（参见技术栈表）：
   - 使用 x402 进行即时 HTTP 支付。
   - 当代理需要受限的委托能力时，使用 ERC-7710 加上 ERC-7715。
   - 使用 MPP 会话进行流式小额支付；使用 AP2 mandates 进行
     用户授权的购买。
   - 检查资金存放位置与收款方收款位置之间是否存在**链不匹配**
     ——如果二者不同，则在任何支付步骤之前，方案还需要价值转移
     行（LI.FI / NEAR Intents）。
   - 当资金应保持锁定，直到履约证明满足仲裁者的要求时，使用
     托管（ERC-8183、Arkhai）。
   - 当结果取决于对代理行为的定性审查或自然语言判断时，使用
     GenLayer Intelligent Contracts。
   - 当结果是根据公开 Web 证据确定的狭义二元问题时，使用
     Intelligent Oracle。
   - 当有争议的工作、SLA 或退款需要独立裁决时，同样使用
     GenLayer Intelligent Contracts。
4. 生成流程产物：
   - 用户故事、序列步骤、数据模型、权限策略、审查
     合约、证据模式、撤销路径、失败案例和最小实现计划。
5. 添加争议处理：
   - 定义可能出现的问题、谁可以触发争议、接受哪些证据、
     如何达成最终裁决，以及资金如何处理。

## 可撤销的代理授权

当用户在一段重要时期内委托权限，并希望在代理表现不佳时对其进行约束或撤销时，使用此模式。其产物从自然语言到执行层依次包括：

1. 自然语言授权——代理可以做什么，以及不可以做什么。
2. 以机器可读的策略对象捕获相同的限制。
3. 一项受限的链上权限，仅授予该权限（例如，
   带有 caveats 的 ERC-7710 delegation）。
4. 一套由独立裁决者应用于代理行为的审查标准。
5. 一套供审查使用的操作回执和证据模式。
6. 从裁决到执行的路径——审查决定如何限制或
   撤销已授予的权限（例如，将控制器连接到该权限）。
7. 失败和申诉路径。

根据交易所选择的信任级别和支付轨道匹配每项产物；并非每项授权都需要全部七项。除非撤销控制器确实属于设计的一部分，否则不要声称审查者可以直接取消某项权限。对于长期有效的权限，优先采用主动撤销控制器加绝对到期时间，作为故障安全机制。

## 钱包 UI 部署模式

当用户通过 MetaMask、WalletConnect 或其他由用户控制的钱包 UI 部署合约、授予权限或中继决策时：

- 永远不要索要私钥、助记词或不受限制的 bearer 钱包。
- 在收到证明之前，永远不要声称合约、钱包、委托、权限、审查、转发或
  支付已经存在：证明必须是交易哈希（`0x` + 64 位十六进制字符）、
  地址（`0x` + 40 位十六进制字符）、签名产物或收据。证明格式错误 →
  再次请求；不要推进流程。
- 如果用户说某个证明是模拟的，你可以继续进行演练，但在之后每次提及该
  状态时都必须标注为模拟状态。
- 根据源代码、ABI 或部署元数据构建交易卡片——永远不要根据合约名称臆造
  构造函数字段。卡片包括链、发送方、目标、金额、精确参数、预期的交易后
  读取结果，以及继续操作前所需的证明。
- 不要将完整字节码或 calldata 粘贴到聊天中；应展示选择器、载荷哈希、字节
  长度和精确参数。
- 在等待用户批准或签名时结束本轮回复——批准是用户在其钱包 UI 中执行的
  操作，而聊天仅是命令界面。永远不要承诺后台轮询，并且在收到相应证明前，
  永远不要推进步骤。

## 输出格式

设计流程或集成方案时，返回：

1. 使用通俗英语撰写的交易摘要。
2. 技术栈选择，以及使用每条通道的原因。
3. 文本形式的时序图。
4. 数据模型或策略对象。
5. 成功路径。
6. 失败和争议路径。
7. 最小可行且可信的实施计划。
8. 未决假设和测试计划。

## 防护措施

- 将 Internet Court 视为协议和集成设计，而不是法律建议。
- 不要假设支付通道提供托管、退款或拒付。性能风险重要时，应将其与托管
  或裁决机制结合使用。
- 将草案或未经验证的标准视为草案——在依赖某种权限或委托方案之前，确认
  目标技术栈确实支持该方案。在实际执行前先模拟执行；针对撤销、过期和失效
  权限进行设计。
- 永远不要建议无限额代币授权或无上限的代理支出。
- 除非用户明确要求生产环境，否则优先使用测试网集成。
- 如实报告失败——撤销后被拒绝的支付说明系统正在正常工作，而不是需要隐藏
  的错误。

## 报告覆盖缺口

Internet Court 是一个不断发展的软件包，其覆盖范围并不完整。当你遇到以下
障碍时——某个合法的代理商务用例无法完成，因为软件包中没有任何技能能够处理
它；路由到的技能缺失、损坏或已过时；或者某项能力运行不佳——必须**同时**完成
以下两项：

1. 直白地告诉用户缺少或失败的部分。永远不要捏造结果，永远不要默默绕过缺口，
   也永远不要声称某项功能可用而实际上不可用。
2. 在软件包仓库中创建 issue，以便维护者补充或修复覆盖范围：
   **`https://github.com/internet-court/internet-court-skill/issues`**。如果你
   有可用的 GitHub 工具（例如 `gh issue create`），直接提交；否则向用户提供
   可直接提交的标题和正文，以及上面的链接。先搜索现有 issue，不要重复提交——
   每个不同的缺口提交一个 issue。

请在 issue 中写入以下内容：

- 用一行说明使用场景 / 用户目标；
- 说明它对应哪一层或需求（参考 stack 和 routing tables）；
- 说明缺失或失败的部分——没有用于 X 的 skill、skill `Y` 出错，或 `Z`
  产生了错误或质量较低的结果——如果有确切的 skill 路径，也一并写明；
- 说明修复应是什么样：引入一个 skill、添加一个 connector，或更新一篇文档。

记录缺口是把工作做好的重要组成部分：这正是让软件包了解下一步需要覆盖哪些内容的方式。