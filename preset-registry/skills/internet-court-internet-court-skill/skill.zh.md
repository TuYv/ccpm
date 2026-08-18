---
name: internet-court
description: Entry point for Internet Court — the trust layer for agent-to-agent commerce. Use whenever an agent needs to transact with another agent or a paid service, or a user mentions agent payments, paid APIs (HTTP 402/x402), wallet custody or trust concerns, spending mandates, delegated permissions (ERC-7710/7715), escrow, agent identity or reputation (ERC-8004), negotiation between agents (A2A), agent jobs (ERC-8183), machine payments (MPP, AP2), supervision of agent behavior, revocation, verification, or dispute resolution (GenLayer) — even if they never say "Internet Court". Routes to the vendored protocol skills and connector skills in this package.
---
# 互联网法庭

互联网法庭是智能体间商业活动的入口技能。智能体已经能够彼此发现、协商和付款——它们缺少的是一种信任从未谋面的交易对手的方式。互联网法庭做两件事：一是将身份、协商、合约、支付、托管、执行这些割裂的环节连接成一项技能；二是内置裁决机制：当两个智能体达成交易时，它们会预先约定，如果出现问题，应如何解决。

核心表述：

```text
Discovery and identity establish who. Negotiation and contracts set the terms.
Payment and escrow move or lock the funds. Execution does the work.
Adjudication decides what happened and writes the verdict back as reputation.
```

此包包含两类材料。请据此进行路由：

- **内置协议技能**（`vendored/`）——由协议方自己正式公开发布的技能。对于协议机制，应始终优先使用这些技能；绝不要重新推导其中已经记录的内容。
- **连接器技能**（`integrations/genlayer-erc7710-connector/`、`integrations/genlayer-intelligent-contracts/`、`integrations/x402-erc7710/`）——使这些协议能够协同工作的互联网法庭专用衔接层。

## 此包所在位置

这是互联网法庭包的入口技能，发布于 **`https://github.com/internet-court/internet-court-skill`**。此文件路由到的每个路径——`vendored/<owner>/<skill>/SKILL.md`、`integrations/<connector>/SKILL.md`——均相对于该仓库根目录。

在依赖某项技能的内容之前，请先解析这些路径：

- **完整安装**（常规情况——`git clone …/internet-court-skill
  .claude/skills/internet-court`）：直接从磁盘读取该路径。
- **仅存在此 `SKILL.md`**（主技能被单独加载）：同级技能不在本地。请从原始文件仓库地址
  `https://raw.githubusercontent.com/internet-court/internet-court-skill/main/<path>`
  获取文件——例如 `…/main/vendored/genlayer/write-contract/SKILL.md`——或者先克隆仓库。

绝不要虚构被引用技能的内容——请先加载真实文件（从磁盘或原始文件 URL）。

## 首次响应模式

当用户请求加载、安装或介绍互联网法庭时——或者每当你在对话中首次提及它时——应先从整体层面介绍，并**逐字照录**下面的标准说明。不要改述；除非用户要求实现细节，否则不要以协议名称、支付通道或标准作为开头。

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

（当你只是在对话中途引用该技能，而不是报告一次全新安装时，删去第一行，其余内容逐字保留。）

当用户请求具体的演示、集成或部署后，请使用下述技术栈和路由。

## 发现优先边界

当用户要求接洽某项服务、交易对手或交易时，应先检查并仅报告可观察到的信息——绝不要对其余信息作出假设。根据具体交易，这些信息可能包括：

- 交易对手是谁：来源、身份、声誉，以及相关的端点或资源；
- 费用是多少以及如何支付：是否设有付费墙，以及任何公开说明的支付渠道、网络、代币、金额、收款方或转账方式；
- 对方承诺提供什么：交付物、条款，以及其提供的任何证据。

在此阶段，不要虚构频率、时间安排、支出上限、到期时间、委托权限、审核政策或完整协议。应明确说明边界——包括代理不持有任何资金，也不拥有用户尚未授予的权限——然后停止，让用户的回复开启信任层面的讨论。例如，对于设有付费墙的端点：

```text
This endpoint is paywalled. I don't have funds or permission to access it —
you'd need to fund and authorize me before I can proceed.
```

在用户选择信任级别且具备所需钱包或权限之前，绝不要承诺资金、签署协议或执行交易。

## 信任级别

任何具有风险的交易——代理可能行为不当、交易对手可能无法交付、资金或权限可能被滥用——都可以采用以下三个保护级别之一。选择足以覆盖风险的最低级别，并如实说明其中的权衡。按保护程度从弱到强依次为：

- **基础级**——各方仅仅相互信任。没有受限权限、没有托管、没有独立裁决者；各方直接根据交付给自己的任何内容采取行动。速度最快，但保护最弱：实际限制就是已经交付出去的内容，一旦出现问题便无法追索。不要声称此级别会强制执行任何限制。
- **防护级**——预先对交易施加约束，使其从设计上限制最坏后果的程度。采用的机制取决于具体交易：具有明确限制的受限权限（带有附加条件的 ERC-7710/7715 权限）、在满足条款前锁定于托管中的资金，或由双方签署的限定范围条款。存在硬性限制，但没有中立方来裁决有争议的结果。对于权限机制，请加载 `vendored/metamask/smart-accounts-kit/skill.md`；对于锁定资金的交易，请加载第 3/4 层托管技能。
- **裁决级**——在防护级的基础上，增加独立审核路径，并提供已签名的证据，以裁决有争议的结果并强制执行相应后果：释放或退还托管资金、限制或撤销已授予的权限，以及将裁决结果写回声誉记录。加载 `integrations/genlayer-intelligent-contracts/SKILL.md` 以获取审核接口，并加载 `integrations/genlayer-erc7710-connector/SKILL.md` 以获取强制执行机制。

应根据交易选择级别，而不是反过来。不要在此处虚构具体的上限、频率、条款或到期时间；应说明这些内容将在设置期间根据已发现的条款确定。

## 智能体商业技术栈

一笔完整的交易会自上而下经过六个层级：寻找并审查交易对手方
（1），商定条款（2–3），转移或锁定资金（4），完成工作（5），
以及——如果结果存在争议——获得能够解决争议并反馈至声誉系统的独立裁决
（6）。大多数层级都已经有可靠的技能；第 6 层是整个体系的基石，因为如果没有中立裁决，托管就无法安全地
释放资金，合约缺乏补救机制，声誉系统也没有可记录的内容。请将
每个层级交由负责它的技能或参考资料处理：

| # | 层级 | 协议 | 加载 |
|---|---|---|---|
| 1 | 发现、身份与声誉 | ERC-8004, ERC-7857 | `vendored/chaingpt/trustless-agents/SKILL.md`（ERC-8004 注册表），`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`（铸造 ERC-8004 智能体身份），`vendored/privy/privy/SKILL.md`（嵌入式/服务器钱包身份与认证），`vendored/humanode/humanode-agentlink/SKILL.md`（由人类支持的智能体身份），`vendored/starknet/starknet-identity/SKILL.md`（Starknet 上的 ERC-8004），`vendored/near/near-api-js/SKILL.md`（命名账户身份，例如 `alice.near`），`vendored/metaplex/metaplex/SKILL.md`（智能体注册表 + Core NFT——Solana Agent Registry 的 ERC-8004 移植版本所基于的基础组件）；ERC-7857 尚无公开技能 |
| 2 | 协商 | A2A | `vendored/terminalskills/a2a-protocol/SKILL.md`（智能体卡片、任务生命周期），`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`（多智能体编排），`vendored/near/near-intents/SKILL.md`（用于跨链履约的 Intents + 求解器竞争） |
| 3 | 合约与义务 | Arkhai/Alkahest, ERC-8183 | `vendored/arkhai/alkahest-user/SKILL.md`（条件托管、仲裁者）+ `vendored/arkhai/alkahest-developer/SKILL.md`（基于 Alkahest 构建：自定义仲裁者/义务），`vendored/arkhai/nla-create/SKILL.md` + `vendored/arkhai/nla-fulfill/SKILL.md`（自然语言协议托管，由 AI 预言机仲裁），`vendored/arkhai/make-git-escrow/SKILL.md` + `vendored/arkhai/fulfill-git-escrow/SKILL.md`（测试套件赏金托管）；ERC-8183 尚无中立的公开技能 |
| 4 | 支付与托管 | x402, MPP, AP2, ERC-7710/7715 | `vendored/coinbase/agentic-wallet/SKILL.md` + `vendored/chaingpt/x402/SKILL.md`（x402），`vendored/tempo/mppx/SKILL.md`（MPP），`vendored/okx/okx-agent-payments-protocol/SKILL.md`（统一的 x402/MPP/a2a-pay），`vendored/metamask/smart-accounts-kit/skill.md`（委托），`vendored/chaingpt/agent-wallet/SKILL.md`（策略管控的钱包），`integrations/x402-erc7710/SKILL.md`（组合支付通道）。**在 Solana 上**（非 EVM，不支持 ERC-7710）：`vendored/quicknode/quicknode-skill/SKILL.md`（x402 + MPP + 智能体订阅），`vendored/sendaifun/squads/SKILL.md`（Squads V4 多签/智能账户——策略层），`vendored/magicblock/magicblock-dev/SKILL.md`（委托状态 + 临时限定范围的权限——最接近 ERC-7710 的类似机制），`vendored/sendaifun/glam/SKILL.md`（金库委托权限 + 时间锁），`vendored/dflow/dflow-phantom-connect/SKILL.md`（钱包连接/签名/支付）；AP2 尚无公开技能 |
| 5 | 执行 | 交易智能体 + 计算/数据/价值通道 | `vendored/antseed/antseed-connect/SKILL.md` + `vendored/0g/0g-compute/SKILL.md` + `vendored/heurist/heurist-mesh-skill/SKILL.md` + `vendored/near/near-ai-cloud/SKILL.md`（付费/去中心化/可通过 TEE 验证的推理），`vendored/lifi/lifi/SKILL.md`（跨链价值转移），`vendored/chainbase/web3-data/SKILL.md` + `vendored/nansen/nansen-token-research/SKILL.md`（链上数据/证据），`vendored/starknet/starknet-defi/SKILL.md`（Starknet L2 合约/DeFi），`vendored/solana/solana-dev/SKILL.md`（Solana 程序、RPC 查询、SPL 支付）+ `vendored/sendaifun/helius/SKILL.md` / `vendored/sendaifun/birdeye/SKILL.md` / `vendored/octav/octav-api/SKILL.md`（作为证据的 Solana + 多链数据）+ `vendored/sendaifun/debridge/SKILL.md`（Solana↔EVM 价值转移）+ `vendored/jupiter/integrating-jupiter/SKILL.md`（Solana 流动性/执行），`vendored/bnb-chain/bnbchain-mcp/SKILL.md`、`vendored/near/*`、`vendored/okx/*` 和 `vendored/altlayer/*` 技能包 |
| 6 | 验证与争议 | GenLayer（Kleros 是一种替代方案） | `integrations/genlayer-intelligent-contracts/SKILL.md`、`vendored/intelligent-oracle/intelligent-oracle/SKILL.md`、`integrations/genlayer-erc7710-connector/SKILL.md`。替代性的第三方仲裁（需披露；并非 GenLayer 自有）：`vendored/kleros/kleros-curate/SKILL.md`（代币策展注册表/挑战），`vendored/arkhai/nla-arbitrate/SKILL.md`（对自然语言协议托管进行 LLM/人工仲裁），`vendored/pnp/pnp-solana/SKILL.md`（采用自定义预言机裁决的 Solana 预测市场）。为裁决提供输入的预言机**证据**（而非裁决本身）：`vendored/sendaifun/pyth/SKILL.md`（带置信区间的价格馈送），`vendored/sendaifun/switchboard/SKILL.md`（按需数据 + VRF） |

## 技能路由

仅当任务实际触发某项技能时才加载它——绝不要预加载。
每一行的左侧都是一个**触发条件**，右侧则是需要引入的技能、每项技能能提供什么，以及应优先选择哪一项。当某项需求对应多个打包在一起的子技能时，先加载指定的入口技能，然后再缩小到具体技能。对于提供完整技能包的所有者（OKX、AltLayer、Nansen、OpenServ、Starknet、ChainGPT），使用单一的**全匹配**行：先加载入口技能，然后随着任务范围缩小，再加载 `vendored/<owner>/` 下的具体子技能——文件夹列表即为该所有者当前的技能集合。

路径必须完全准确，并以 `/SKILL.md` 结尾——一些所有者的名称会在路径中重复出现（例如 `vendored/lifi/lifi/SKILL.md`、`vendored/privy/privy/SKILL.md`、`vendored/chaingpt/chaingpt/SKILL.md`）；绝不要缩短或合并这些路径段。
当某一行列出多个备选项时，只加载**一个**（该行会说明如何选择）；如果决定选择哪一项所需的信息尚不明确，应先询问，而不是将它们全部预加载。

### 支付通道

| 当你需要…… | 加载 |
|---|---|
| 为返回 **402** 的 HTTP 资源付费（按次付费）、搜索 x402 市场，或将你自己的端点商业化 | `vendored/coinbase/agentic-wallet/SKILL.md` — Coinbase x402 客户端：读取价格、付款、携带证明重试；对于一次性的付费请求，从这里开始。`vendored/chaingpt/x402/SKILL.md` — x402 发现/商业化：查找付费服务，或将你自己的端点置于 402 之后。 |
| 进行流式小额支付或运行计量会话（按秒/按 token，而非按请求） | `vendored/tempo/mppx/SKILL.md` — Tempo/Stripe MPP 收费、会话和流式传输。当计费是连续进行而非单次调用时加载。**不**适用于按请求付费通道上的支出上限：x402 上设有上限或周期性预算的情况应使用 `integrations/x402-erc7710/SKILL.md`，而不是 MPP。 |
| 在不硬编码支付通道（x402、MPP 或 a2a-pay）的情况下分派付款 | `vendored/okx/okx-agent-payments-protocol/SKILL.md` — OKX OnchainOS 统一支付分派器。当交易对手方的支付通道未知或可能变化时加载。 |
| 通过有界权限执行付款（支付通道上的支出/订阅策略） | `integrations/x402-erc7710/SKILL.md` — 将 x402 支付通道与 ERC-7710 委托预算相结合的连接器。用于受保护/经裁决的付费访问。 |

### 权限、托管与委托

| 当你需要…… | 加载 |
|---|---|
| 向代理授予有界且可撤销的权限（ERC-7710 委托、ERC-7715 权限请求、限制条件） | `vendored/metamask/smart-accounts-kit/skill.md` — MetaMask 智能账户 + 委托机制。用于链上权限的受保护级工具。也适用于用户**手动撤销**自己的委托。 |
| 为代理提供带有内置策略门控的钱包（单笔交易上限、频率限制、会话密钥），而不是原始密钥 | `vendored/chaingpt/agent-wallet/SKILL.md` — 无托管、策略门控的钱包。当代理必须签名，但你不打算交出私钥时加载。 |
| 配置或认证嵌入式/服务器钱包，并支持跨链策略门控签名 | `vendored/privy/privy/SKILL.md` — Privy 钱包身份 + 认证。 |

前两者**互斥——根据密钥由谁持有来选择**：用户保管密钥并进行委托 → `smart-accounts-kit`；代理获得自己的钱包（内置防护措施）→ `agent-wallet`。切勿为同一个设计同时加载两者。

### 身份、声誉与协商

| 当你需要…… | 加载 |
|---|---|
| 在链上注册、发现或审查代理（ERC-8004 身份、声誉、验证） | `vendored/chaingpt/trustless-agents/SKILL.md` — ERC-8004 注册表；默认的身份/声誉技能。也可以通过 `vendored/openserv/openserv-multi-agent-workflows/SKILL.md` 铸造，在 Starknet 上可通过 `vendored/starknet/starknet-identity/SKILL.md` 铸造，在 BNB 上可通过 `vendored/bnb-chain/bnbchain-mcp/SKILL.md` 铸造。对于人类可读的命名账户身份锚点（`alice.near`），使用 `vendored/near/near-api-js/SKILL.md`。 |
| 证明代理背后有真人 | `vendored/humanode/humanode-agentlink/SKILL.md` — Humanode AgentLink：签署 HTTP 请求、链上注册表。 |
| 与另一个代理通信：代理卡片、报价、任务生命周期（A2A） | `vendored/terminalskills/a2a-protocol/SKILL.md` — A2A 协议；在协商步骤、条款锁定之前加载。若要编排多个代理：`vendored/openserv/openserv-multi-agent-workflows/SKILL.md`。 |

### 合约与托管

| 当你需要…… | 加载 |
|---|---|
| 锁定资金，并根据仲裁者的决定释放（条件托管） | `vendored/arkhai/alkahest-user/SKILL.md` — 基于 Alkahest EAS、带仲裁者的托管；默认的托管工具。若要**基于** Alkahest 进行构建（编写自定义仲裁者/义务、集成它），使用 `vendored/arkhai/alkahest-developer/SKILL.md`。 |
| 为由 AI 预言机判定的自然语言要求提供托管 | `vendored/arkhai/nla-create/SKILL.md`（起草协议）、`vendored/arkhai/nla-fulfill/SKILL.md`（按协议交付）、`vendored/arkhai/nla-arbitrate/SKILL.md`（作出裁决）— 自然语言协议托管。 |
| 为修复失败测试套件提供赏金托管，并在测试通过后付款 | `vendored/arkhai/make-git-escrow/SKILL.md`（发布赏金）、`vendored/arkhai/fulfill-git-escrow/SKILL.md`（领取赏金）— git-escrow，用于通过测试结算的代码交付交易。 |

### 验证、裁决与争议

| 当你需要…… | 加载 |
|---|---|
| 编写 / 部署 / 测试 / 检查 GenLayer 智能合约 | `vendored/genlayer/write-contract/SKILL.md`（编写）、`vendored/genlayer/genlayer-cli/SKILL.md`（部署与调用）、`vendored/genlayer/direct-tests/SKILL.md` + `vendored/genlayer/integration-tests/SKILL.md`（测试）、`vendored/genlayer/genvm-lint/SKILL.md`（检查）。加载与你当前构建步骤相匹配的技能。 |
| 设计裁决本身：审查标准、证据模式、决策载荷 | `integrations/genlayer-intelligent-contracts/SKILL.md` — 裁决级审查接口。当结果需要定性判断 / 自然语言判断时加载。 |
| 将裁决转化为强制执行（撤销或限制 ERC-7710 权限） | `integrations/genlayer-erc7710-connector/SKILL.md` — 将决策连接到链上撤销操作的中继器/控制器。**仅由裁决驱动**：当裁决必须改变代理的权限时加载；用户手动撤销自己的委托只需要 `smart-accounts-kit`。 |
| 根据公开网络证据解决范围明确的二元问题（预测市场 / 事实预言机） | `vendored/intelligent-oracle/intelligent-oracle/SKILL.md` — Intelligent Oracle。在进行模式敏感型工作之前，重新获取 `https://www.intelligentoracle.com/skill.md`。 |
| 使用第三方仲裁替代 GenLayer（**披露**其并非 GenLayer 自有机制） | `vendored/kleros/kleros-curate/SKILL.md`（代币策展注册表 / 质疑）+ `vendored/kleros/kleros-ipfs-upload/SKILL.md`（IPFS 证据）；或者使用 `vendored/arkhai/nla-arbitrate/SKILL.md` 进行 LLM/人工 NLA 仲裁；在 Solana 上，使用 `vendored/pnp/pnp-solana/SKILL.md`（采用自定义预言机裁决的无许可预测市场）。 |

### 执行、数据与价值转移（第 5 层）

| 当你需要…… | 加载 |
|---|---|
| 购买或出售 AI 推理（计算执行） | 按服务场所选择**一个**：`vendored/0g/0g-compute/SKILL.md`（去中心化计算/存储/可验证推理——当服务场所开放时的默认选项）、`vendored/antseed/antseed-connect/SKILL.md`（通过 USDC 通道进行 P2P 推理）、`vendored/heurist/heurist-mesh-skill/SKILL.md`（Heurist Mesh 智能体，x402 按调用付费）、`vendored/near/near-ai-cloud/SKILL.md`（具有 **TEE 证明**的私密推理——可验证执行证据）。如果尚未确定服务场所，仅加载默认的 0G 并询问——不要预加载其余选项。 |
| 跨链转移价值（兑换/跨链桥接） | `vendored/lifi/lifi/SKILL.md` — LI.FI 跨链路由；`vendored/lifi/lifi-stablecoin-swap/SKILL.md` 用于稳定币专项兑换；`vendored/near/near-intents/SKILL.md` — NEAR Intents：通过求解器竞争完成跨链履约（链抽象，由一个智能体跨链操作）。往返 **Solana**：`vendored/sendaifun/debridge/SKILL.md` — deBridge Solana↔EVM 桥接、消息传递及无需信任的外部调用。 |
| 提取链上数据作为证据（余额、交易历史、标签、持有者、聪明钱） | `vendored/chainbase/web3-data/SKILL.md` — 通用链上数据。如需更深入的情报，使用 `vendored/nansen/` 下的 **Nansen** 7 项技能包：从 `nansen-token-research` 开始，然后随着问题范围缩小，使用 `nansen-wallet-profiler` / `nansen-holder-analysis` / `nansen-smart-money-tracker` / `nansen-general-search` / `nansen-prediction-markets` / `nansen-mpp-payment`。在 **Solana** 上：`vendored/sendaifun/helius/SKILL.md`（DAS API、交易/Webhook 流）、`vendored/sendaifun/birdeye/SKILL.md`（代币价格、持有者/交易者情报、钱包盈亏）、`vendored/octav/octav-api/SKILL.md`（多链投资组合 + 交易历史，按 x402 计量）。对于带有明确置信区间的**特定时间点价格**——通常是形态裁决所需的信息——请使用 `vendored/sendaifun/pyth/SKILL.md`，而不是 DEX 聚合器。 |

### 全平台技能包（先使用全能入口，再缩小范围）

| 当你需要…… | 加载 |
|---|---|
| **OKX OnchainOS** 上的任何功能（钱包、DEX 数据、DeFi、支付、智能体商务） | `vendored/okx/` 下的 9 项技能包。从 `okx-ai` 开始——这是智能体商务入口（ERC-8004 身份 + **带争议处理机制的**任务市场 + A2A 聊天），与 Internet Court 最相关。然后缩小范围：`okx-agentic-wallet`（兑换/桥接/策略/安全）、`okx-dex-market`（只读 DEX 数据）、`okx-defi`（投资/投资组合）、`okx-agent-payments-protocol`（x402/MPP/a2a-pay）、`okx-dapp-discovery`（路由至第三方 dapp）、`okx-guide`（入门/支持）、`okx-activity`（OKX 活动/黑客松注册——偏离主题，从上游镜像而来）。 |
| **ChainGPT** AI 工具（合约生成/审计、新闻）+ 140 工具 MCP | `vendored/chaingpt/chaingpt/SKILL.md` 是全能中心。其专注于特定功能的同级技能已在上文路由：`x402`、`agent-wallet`、`trustless-agents`。 |
| **AltLayer** AltLLM 门户 + Cloud-Claw 智能体虚拟机 | `vendored/altlayer/` 下的 7 项技能包。入口：`altllm-portal-cli`（门户操作）和 `cloud-claw` / `cloud-claw-launch-agent`（启动智能体虚拟机）。其余是基础设施：`altllm-portal-auth`、`-api-keys`、`-billing`、`-payments`。 |
| **OpenServ** 多智能体编排 + SDK（铸造 ERC-8004 身份） | `vendored/openserv/` 下的 5 项技能包。入口：`openserv-multi-agent-workflows`。其他技能：`openserv-agent-sdk`、`openserv-client`、`openserv-launch`、`openserv-ideaboard-api`。 |
| **Starknet** L2（Cairo、原生账户抽象） | `vendored/starknet/` 下的 4 项技能包。入口：`starknet-js`（SDK）。其他技能：`starknet-identity`（ERC-8004）、`starknet-defi`、`starknet-wallet`。 |
| **BNB Chain** 操作，包括 ERC-8004 注册和 Greenfield 存储 | `vendored/bnb-chain/bnbchain-mcp/SKILL.md`。 |
| **NEAR** — AI 原生 L1（Shade Agents / TEE 推理、命名账户身份、链抽象支付） | `vendored/near/` 下的 6 项技能包。优先使用与主题相关的技能：`near-intents`（跨链支付/履约）、`near-ai-cloud`（作为证据的 TEE 可验证推理）、`near-api-js`（链交互 + 命名账户身份）。此外还有：`near-kit`（类型安全的 TS SDK + 沙盒测试）、`near-smart-contracts`（Rust 合约）、`near-dapp`（全栈 React/Next.js + 钱包）。 |
| **Solana** — 高吞吐量的非 EVM L1（SVM、Rust/Anchor 程序） | `vendored/solana/solana-dev/SKILL.md` — 来自 Solana Foundation 的单个全能技能；它会按需加载自身的 `references/`（`payments`、`confidential-transfers`、`security`、`testing`、`rpc-quick-lookups`、Anchor/Pinocchio 程序指南）。将其用于 Solana 端的任何工作：编写/部署程序、SPL 代币和 Solana Pay 流程，以及读取余额和交易作为证据。**非 EVM 注意事项**：这里不存在 ERC-8004 身份和 ERC-7710 委托权限——也没有可直接替代的等效方案，因此应组合使用下方的 Solana 原生组件，而不要假定可以沿用 EVM 路径。 |
| **Solana 智能体商务**（`solana-dev` *未*涵盖的组件） | `solana-dev` 是一项开发者技能，不涵盖支付、身份或预言机。请根据需要改用以下技能：**支付** `vendored/quicknode/quicknode-skill/SKILL.md`（x402 + MPP + 智能体订阅——请注意，Solana x402 使用部分交易签名，而非 EIP-3009/Permit2，因此需要按网络进行分支处理）、`vendored/sendaifun/metengine/SKILL.md`（一个在线的 x402 计量 API，在 Solana 上使用 USDC）；**受限权限** `vendored/sendaifun/squads/SKILL.md`（多签/智能账户）、`vendored/magicblock/magicblock-dev/SKILL.md`（委托状态、临时作用域权限）、`vendored/sendaifun/glam/SKILL.md`（金库委托权限 + 时间锁）；**身份** `vendored/metaplex/metaplex/SKILL.md`（智能体注册表/Core NFT）；**证据** `vendored/sendaifun/pyth/SKILL.md`、`vendored/sendaifun/switchboard/SKILL.md`、`vendored/sendaifun/helius/SKILL.md`、`vendored/sendaifun/birdeye/SKILL.md`、`vendored/octav/octav-api/SKILL.md`；**价值转移** `vendored/sendaifun/debridge/SKILL.md`、`vendored/jupiter/*`；**智能体框架** `vendored/sendaifun/solana-agent-kit/SKILL.md`。这些技能均为 solana.com/skills 目录中的**社区**技能，而非 Solana Foundation 代码——当其行为会影响结果时，请明确说明这一点。 |

## 工作流程

1. 对交易进行分类：
   - 委托的代理权限或可撤销授权。
   - 按使用量付费的 API 或内容访问。
   - 周期性支出或订阅。
   - 托管式服务交付。
   - 基于 Web 证据的预言机或预测市场。
   - 存在争议的任务、SLA 或退款。
2. 提取商业条款：
   - 参与方、目标、权限、禁止的操作、金额、频率、最高
     支出、到期时间、交付物、证据来源、审查频率、
     撤销路径、退款路径和争议窗口。
3. 选择技术栈（参见技术栈表）：
   - x402 用于即时 HTTP 支付。
   - 当代理需要有边界的委托能力时，使用 ERC-7710 加 ERC-7715。
   - MPP sessions 用于流式微支付；AP2 mandates 用于
     用户授权的购买。
   - 检查资金所在位置与收款方收款位置之间是否存在**链不匹配**——如果两者不同，则方案在执行任何支付步骤之前还需要加入价值转移
     行（LI.FI / NEAR Intents）。
   - 当资金应保持锁定，直至履约证明满足仲裁者要求时，使用托管（ERC-8183、Arkhai）。
   - 当结果取决于对代理行为的定性审查或自然语言判断时，使用 GenLayer Intelligent Contracts。
   - 当结果是根据公开 Web 证据裁定的范围明确的二元问题时，使用 Intelligent Oracle。
   - 当存在争议的任务、SLA 或
     退款需要独立裁决时，也使用 GenLayer Intelligent Contracts。
4. 生成流程产物：
   - 用户故事、顺序步骤、数据模型、权限策略、审查
     合约、证据模式、撤销路径、失败情形和最小化
     实施方案。
5. 添加争议处理机制：
   - 定义可能出现的问题、谁可以发起争议、接受哪些证据、如何
     达成最终裁定，以及如何处理资金。

## 可撤销的代理授权

当用户在一段有实际意义的时间内委托权限，并希望在代理表现不佳时限制或撤销该权限，请使用此模式。其输出从
自然语言一直延伸到执行机制：

1. 自然语言授权——代理可以做什么、不可以做什么。
2. 表达相同限制的机器可读策略对象。
3. 仅授予该权限的有边界链上许可（例如，
   带有约束条件的 ERC-7710 delegation）。
4. 由独立裁决者用于评估代理操作的审查准则。
5. 供审查使用的操作回执和证据模式。
6. 从裁决到执行的路径——审查决定如何限制或
   撤销已授予的权限（例如，连接到该
   权限的控制器）。
7. 失败和申诉路径。

应根据为交易选择的信任级别和技术路径匹配各项输出；并非每项
授权都需要全部七项。除非设计中确实包含撤销控制器，否则不要
声称审查者可以直接取消权限。对于长期有效的权限，优先使用主动
撤销控制器，并将绝对到期时间作为故障保险。

## 钱包 UI 部署模式

当用户通过 MetaMask、WalletConnect 或其他由用户控制的钱包 UI
部署合约、授予权限或转发决策时：

- 切勿索要私钥、助记词或不受限制的不记名钱包。
- 在收到证明之前，切勿声称合约、钱包、委托、权限、审核、中继或
  支付已存在：交易哈希（`0x` + 64 位十六进制字符）、
  地址（`0x` + 40 位十六进制字符）、签名工件或收据。证明格式错误 →
  再次询问；不要推进。
- 如果用户说明证明是模拟的，你可以继续演练，但在后续每次提及
  该状态时都要将其标记为模拟。
- 根据源代码、ABI 或部署元数据构建交易卡片——切勿
  根据合约名称臆造构造函数字段。卡片应包括链、
  发送者、目标、金额、确切参数、预期的交易后读取结果，
  以及继续之前所需的证明。
- 不要在聊天中粘贴完整的字节码或 calldata；应改为显示选择器、
  载荷哈希、字节长度和确切参数。
- 在等待用户批准或签名时结束当前轮次——批准
  是用户在其钱包 UI 中执行的操作，而聊天仅作为命令
  界面。切勿承诺进行后台轮询，并且在收到
  相应证明之前，切勿推进到下一步。

## 输出结构

设计流程或集成时，返回：

1. 使用通俗易懂语言编写的交易摘要。
2. 技术栈选择，以及使用每条通道的原因。
3. 文本形式的时序图。
4. 数据模型或策略对象。
5. 正常流程。
6. 失败和争议处理流程。
7. 最小可信实现计划。
8. 待确认的假设和测试计划。

## 防护规则

- 将 Internet Court 视为协议和集成设计，而非法律建议。
- 不要假定支付通道提供托管、退款或拒付功能。当履约风险很重要时，应将
  其与托管或裁决机制配合使用。
- 将草案或未经验证的标准视为草案——在依赖某种权限或委托方案之前，
  确认目标技术栈确实支持该方案。
  在实际执行前先进行模拟；设计时应考虑撤销、
  到期和过期权限。
- 切勿建议无限额度的代币授权或无上限的代理支出。
- 除非用户明确要求生产环境，否则集成应优先使用测试网。
- 如实报告失败——撤销权限后支付被拒绝
  表明系统工作正常，而不是需要隐瞒的错误。

## 报告覆盖缺口

Internet Court 是一个持续演进的软件包，其覆盖范围并不完整。当
你遇到障碍时——某个合理的代理商业用例因本软件包中没有
相应 skill 而无法完成，路由到的 skill 缺失、损坏
或已过时，或者某项能力表现不佳——请**同时**执行以下两项操作：

1. 明确告知用户缺失或失败的内容。切勿捏造结果，
   切勿悄悄绕过该缺口，也切勿在某项功能无法工作时声称其
   可以工作。
2. 在软件包仓库中创建 issue，以便维护者补充或修复覆盖范围：
   **`https://github.com/internet-court/internet-court-skill/issues`**。如果你
   可以使用 GitHub 工具（例如 `gh issue create`），请直接
   创建；否则，向用户提供可直接提交的标题、正文以及上述
   链接。请先搜索现有 issue，不要重复创建——每个独立缺口
   对应一个 issue。

在 issue 中写明：

- 用一行说明用例 / 用户目标；
- 它对应哪个层级或需求（引用堆栈表和路由表）；
- 缺失或失败的内容——没有用于 X 的 skill、skill `Y` 出错，或者 `Z`
  生成了错误或低质量的结果——如果存在确切的 skill 路径，请一并提供；
- 修复方案应是什么样：引入一个 skill、添加一个连接器，或更新一份文档。

提交能力缺口也是做好工作的一部分：该软件包正是通过这种方式了解下一步需要覆盖的内容。