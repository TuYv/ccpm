---
name: lifi
description: |
  LI.FI REST API for cross-chain and same-chain token swaps, bridging, DeFi deposits (Composer), yield discovery (Earn), and intent-based execution (Intents).

  USE THIS SKILL WHEN USER WANTS TO:
  - Swap tokens between different blockchains (e.g., "swap USDC on Ethereum to ETH on Arbitrum")
  - Bridge tokens to another chain (e.g., "move my ETH from mainnet to Optimism")
  - Swap tokens on the same chain with best rates (e.g., "swap ETH to USDC on Polygon")
  - Find the best route or quote for a token swap across chains
  - Deposit into DeFi vaults/lending/staking in one click, including cross-chain (Composer: Aave, Morpho, Pendle, EtherFi, Yearn, etc.)
  - Discover yield opportunities, vault APY/TVL data, or track DeFi positions (Earn)
  - Execute gasless or intent-based transfers via a solver network (LI.FI Intents)
  - Move stablecoins cheaply with optimized defaults (stablecoin preset)
  - Build multi-chain payment flows (accept any token, settle in specific token)
  - Check supported chains, tokens, bridges, or gas prices
  - Track status of a cross-chain transaction, recover from failed/partial transfers
  - Query transfer history/analytics or withdraw collected integrator fees
  - Build backends, bots, or AI agents (any language) that need cross-chain functionality
---
# LI.FI API 集成

LI.FI 通过一个 API 聚合了跨链桥、DEX、意图求解器和 DeFi 协议。此 skill 覆盖完整的产品范围：

| 产品 | 基础 URL | 功能 |
|---------|----------|--------------|
| **Core API**（兑换与跨链） | `https://li.quest/v1` | 覆盖 75+ 条链的报价、路由、执行数据和状态跟踪 |
| **Composer**（DeFi 执行） | `https://li.quest/v1`（使用相同的 `/quote` 端点） | 一键兑换/跨链，并存入或提取至金库、借贷和质押协议 |
| **Earn**（收益数据） | `https://earn.li.fi/v1` | 金库发现、APY/TVL 分析和投资组合头寸 |
| **Intents**（求解器市场） | `https://order.li.fi` | 由竞争性求解器网络撮合的基于意图的订单 |

对于 AI agent，LI.FI 还提供 MCP server（`https://mcp.li.quest/mcp`）和 CLI（`@lifi/cli`）。LI.FI 建议 agent 和后端直接使用 REST API，而不是 SDK。

## 身份验证与速率限制

API key **可选**——它只用于提高速率限制。请求头：`x-lifi-api-key`（可在 [LI.FI Partner Portal](https://portal.li.fi/) 获取）。

```bash
curl "https://li.quest/v1/chains" -H "x-lifi-api-key: YOUR_API_KEY"
```

| Tier | `/quote`, `/advanced/routes` | `/advanced/stepTransaction` | Other endpoints |
|------|------------------------------|------------------------------|-----------------|
| Without API key | 75 req / 2 hours | 50 req / 2 hours | 100 req / minute |
| With API key (default) | 100 RPM (2-hour rolling window: 12,000 / 2h) | same | 100 RPM |

响应包含 `ratelimit-limit`、`ratelimit-remaining`、`ratelimit-reset`（秒）请求头。429 响应携带错误代码 `1005`。绝不要在客户端代码中暴露 API key。

## 快速开始 — 五次调用流程

任何兑换/跨链操作的规范流程：

```
1. GET /chains   → 发现链（id、key、chainType、nativeToken）
2. GET /tokens   → 查找代币和 decimals（?chains=1,42161）
3. GET /quote    → 获取包含可直接签名的 transactionRequest 的报价
4. [Execute]     → 如果是 ERC-20：将 allowance 与 estimate.approvalAddress 比较；如有需要则进行 approve；
                   然后签名并发送 transactionRequest
5. GET /status   → 轮询直到 DONE 或 FAILED
```

```bash
# 3. Quote (fromToken/toToken accept addresses OR symbols)
curl "https://li.quest/v1/quote?\
fromChain=42161&toChain=10&\
fromToken=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&\
toToken=0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1&\
fromAmount=10000000&fromAddress=0xYourAddress&slippage=0.005"

# 5. Status (pass fromChain to speed it up; bridge = quote's `tool`)
curl "https://li.quest/v1/status?txHash=0xYourTxHash&fromChain=42161&toChain=10&bridge=across"
```

从报价响应中提取：`transactionRequest`（签名并发送）、`estimate.approvalAddress`（ERC-20 spender）、`estimate.toAmount`/`toAmountMin`、`estimate.executionDuration`（轮询依据）以及 `tool`（作为 `bridge` 传递给 `/status`）。报价大约在 60 秒后过期——如果报价时间更早，则在签名之前重新获取（并且在单独的 approval 交易之后始终重新获取）。

## 核心端点

### GET /quote

包含可直接执行的交易数据的最佳单一路径。

| 参数 | 类型 | 必填 | 描述 |
|-----------|------|----------|-------------|
| `fromChain` / `toChain` | string | 是 | Chain ID 或 key（值相同表示同链交换） |
| `fromToken` / `toToken` | string | 是 | Token 地址或符号 |
| `fromAmount` | string | 是 | 最小单位的金额 |
| `fromAddress` | string | 是 | 发送方钱包地址 |
| `toAddress` | string | 否 | 接收方（默认为 fromAddress） |
| `slippage` | number | 否 | 0.005 = 0.5%（默认值） |
| `order` | string | 否 | `FASTEST` 或 `CHEAPEST` |
| `integrator` | string | 否 | 你的应用 ID（用于分析和费用收取） |
| `fee` | number | 否 | 集成方费用（0.02 = 2%） |
| `preset` | string | 否 | 路由预设，例如 `stablecoin`（见下文） |
| `allowBridges` / `denyBridges` / `preferBridges` | string[] | 否 | 来自 `/tools` 的工具 key，或 `all`/`none`/`default` |
| `allowExchanges` / `denyExchanges` / `preferExchanges` | string[] | 否 | 同上 |
| `allowDestinationCall` | boolean | 否 | 默认为 true |
| `maxPriceImpact` | number | 否 | 默认值为 0.10（10%） |
| `fromAmountForGas` | string | 否 | 在目标链上转换为 gas 的金额 |
| `skipSimulation` | boolean | 否 | 响应更快，但 gas limit 的准确性较低 |
| `svmPriorityFeeLevel` | string | 否 | Solana 优先费用：`NORMAL`/`FAST`/`ULTRA` |
| `swapStepTimingStrategies` / `routeTimingStrategies` | string[] | 否 | 例如 `minWaitTime-600-4-300` |

变体：
- **GET /quote/toAmount** — 传入 `toAmount` 而不是 `fromAmount`；API 会计算所需的输入金额。
- **POST /quote/contractCalls** — bridge + 任意目标链合约调用（手动 calldata）。对于受支持的 DeFi 协议，优先使用 Composer。

### POST /advanced/routes + POST /advanced/stepTransaction

提供多个路由选项以供比较。注意命名不同：body 使用 `fromChainId`、`fromTokenAddress`（仅支持地址），筛选器和 `preset` 位于 `options{}` 中。路由包含不带交易数据的 `steps`，需要将每个 step POST 到 `/advanced/stepTransaction` 以填充 `transactionRequest`。

简单转账（1 次调用）使用 `/quote`；当用户需要选项或价格比较（2 次或更多调用）时，使用 `/advanced/routes`。

### GET /status

`txHash`（必填，可传发送交易哈希、接收交易哈希或 step id），以及可选的 `fromChain`（推荐，可加快响应）、`toChain`、`bridge`。

**状态：**`NOT_FOUND` → `PENDING` → `DONE` | `FAILED`。当状态为 `DONE` 时，检查 `substatus`：`COMPLETED`、`PARTIAL`（收到的 Token 不同，但完整价值已保留）或 `REFUNDED`。请参阅下文的[状态跟踪与恢复](#status-tracking--recovery)。

### 发现与实用工具

- **GET /chains** — `?chainTypes=EVM,SVM,UTXO,MVM,TVM`。**如果省略，则仅返回 EVM。**非 EVM 链：Solana（SVM）、Bitcoin（UTXO）、Sui（MVM）、Tron（TVM）。
- **GET /tokens** — `?chains=1,137&tags=stablecoin&minPriceUSD=0.01`
- **GET /token** — `?chain=POL&token=DAI`
- **GET /tools** — `allow*`/`deny*` 筛选器可使用的有效 bridge/exchange key
- **GET /connections** — 可用的 Token 对连接（至少需要一个筛选器）
- **GET /gas/prices`、`/gas/prices/{chainId}`、`/gas/suggestion/{chain}`** — gas 数据；**GET /gas/status** — LIFuel 交易状态
- **GET /calldata/parse**（beta）— `?callData=0x...&chainId=1` 将 LI.FI calldata 解码为带名称的函数调用
- **分析：**`GET /v1/analytics/transfers`（支持筛选，最多 1000 条）、`GET /v2/analytics/transfers`（基于 cursor 分页）、`GET /v1/analytics/transfers/summary`（跨链收到的金额，最大时间范围为 30 天）
- **集成方费用：**`GET /integrators/{integratorId}`（已收取的费用余额）、`GET /integrators/{integratorId}/withdraw/{chainId}`（提取用的 `transactionRequest`）

已弃用——请勿使用：`/advanced/possibilities`、`/gas/refetch`、`/analytics/wallets/{address}`。

## 路由预设

`preset=stablecoin`（用于 `/quote`，或用于 `/advanced/routes` 的 `options.preset`）会为稳定币转账应用经过优化的默认值：`order=CHEAPEST`、`slippage=0.001`、价格影响上限为 2%，以及稳定币友好的桥接器候选列表（Glacis、Mayan、Celer、Eco、Relay、Across、Gaszip）。显式请求参数始终会覆盖预设默认值，但像 `denyBridges` 这样的列表覆盖项会**完全替换**预设中的列表。使用 `GET /tokens?tags=stablecoin` 查找符合条件的代币。（`commerce` 预设即将推出。）

## Composer — 一键式 DeFi 存款与取款

Composer 将兑换 + 跨链桥接 + 协议交互（存款、质押、借贷、取款）整合为一笔原子交易。**没有专用端点**——在标准 `GET /quote` 中，将 `toToken` 设置为受支持协议的 vault/staking/deposit 代币地址，Composer 就会自动激活：

```bash
# 100 USDC on Arbitrum → Morpho Spark USDC vault on Base, one signature
curl "https://li.quest/v1/quote?\
fromChain=42161&toChain=8453&\
fromToken=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&\
toToken=0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A&\
fromAmount=100000000&fromAddress=0xYou&toAddress=0xYou"
```

- **检测：**同链存款报价会将 zap 工具显示为顶层 `tool`（例如 `composer`，但引擎也可能通过其他集成的 zap 工具进行路由，例如 `fly`）；跨链报价会将桥接器显示为 `tool`，并在 `includedSteps` 中显示 zap 步骤。不要将逻辑硬编码为 `tool === "composer"`——任何以 vault 地址作为 `toToken` 的报价都是存款路由。
- **取款：**反向操作——将 vault 代币作为 `fromToken`，将目标代币作为 `toToken`。
- **每个报价都会在返回前于 fork 上进行模拟；**失败会作为 API 错误返回，而不是导致交易回滚。
- **覆盖范围：**涵盖 23 条 EVM 链上的约 29 个协议（Aave V3、Morpho、Pendle、Spark、Euler、Fluid、Yearn、EtherFi、Kelp、Ethena、Maple，等等）。其中一些协议**仅支持存款**（Ethena、Kinetiq、Maple、Royco、USDai、Concrete、Ember）——请通过协议自有 UI 进行取款。
- **限制：**仅支持 EVM；仅支持代币化头寸（目标必须铸造代币）；跨链流程最终一致而非原子操作——桥接成功后，目标链上的存款仍可能失败，此时用户会持有桥接后的代币（轮询 `/status`，处理 `PARTIAL`）。
- 对于跨链 Composer 路由，请使用更高的滑点（例如 `0.01`）。

完整的协议列表和错误代码请参阅 [references/REFERENCE.md](references/REFERENCE.md#composer)。

## Earn — 收益发现与投资组合数据

Earn 是一个只读数据 API，地址为 **`https://earn.li.fi`**（独立主机！），用于标准化来自 20 多个协议的 vault。**与核心 API 不同，它要求使用 `x-lifi-api-key` 请求头**（不提供该请求头时会返回 401）。执行由 Composer 负责：获取 vault 的 `address`，并将其作为 `toToken` 用于 `li.quest/v1/quote`。

| 端点 | 用途 |
|----------|---------|
| `GET /v1/vaults` | 列出 vault——可按 `chainId`、`asset`（符号或地址）、`protocol`、`minTvlUsd`、`isTransactional`、`isRedeemable`、`isComposerSupported` 进行筛选；使用 `sortBy=apy\|tvl` 排序；采用游标分页（`limit` ≤ 100，跟随 `nextCursor`） |
| `GET /v1/vaults/{chainId}/{address}` | 单个 vault 的详情 |
| `GET /v1/chains` / `GET /v1/protocols` | 筛选下拉数据（仅限 Earn，不是平台范围的数据） |
| `GET /v1/portfolio/{userAddress}/positions` | 用户的 DeFi 头寸及其 USD 余额 |

```bash
# Top USDC vaults on Base by APY, depositable via Composer
curl "https://earn.li.fi/v1/vaults?chainId=8453&asset=USDC&sortBy=apy&isComposerSupported=true&limit=10" \
  -H "x-lifi-api-key: YOUR_API_KEY"
```

注意事项：布尔过滤器是字符串字面量（`"true"`/`"false"`）；APY 值是小数（0.0534 = 5.34%）；TVL/余额是字符串；`lpTokens` 通常为空——执行时请使用 vault 顶层的 `address`；根据 `isTransactional`/`isRedeemable` 控制存入/提取 UI；检查 `timeLock`、`caps`、`kyc` 字段。速率限制：每个 key 每分钟 50 个请求。Vault 数据每 15 分钟刷新一次（交易相关标志每 2 分钟刷新一次）。

**发现 → 存入流程：** `GET earn.li.fi/v1/vaults` → 选择 vault → 使用 vault 地址作为 `toToken` 调用 `GET li.quest/v1/quote` → 授权并发送 → 轮询 `/status`。

## LI.FI Intents — Solver Marketplace

这是一个独立的基于意图的系统，位于 **`https://order.li.fi`**（开发环境：`order-dev.li.fi`）。用户表达期望的结果；solver 根据既有报价，在目标链上预先提供交付资金。它是 Open Intents Framework 的基础。**Integrator 端点无需 API key。**

| Endpoint | Purpose |
|----------|---------|
| `POST /quote/request` | 为意图报价（`swapType`：`exact-input`/`exact-output`）；返回按最佳结果优先排列的 `quotes[]`，其中包含 `quoteId` |
| `POST /orders/submit` | 提交链下订单（Compact/无 gas 流程） |
| `GET /orders/status` | 根据 `onChainOrderId` 或 `catalystOrderId` 查询 |
| `GET /orders` | 列出/筛选订单 |
| `GET /chains/supported` / `GET /routes` | 实时覆盖范围（EVM + Solana + Tron） |

两种资金模型：
- **Escrow**（推荐的默认方式）：approve → 在 InputSettlerEscrow 上执行链上 `open(order)`，无需调用 `/orders/submit`，solver 会检测 `Open` 事件。
- **Compact**（无 gas）：向 The Compact 存入一次资金，然后在链下签署 EIP-712 `BatchCompact` 订单，并通过 `/orders/submit` 提交。

订单生命周期：`Submitted/Open → Signed → Delivered → Settled`（终止状态）。如果订单未成交，`expires` 之后可退款。地址使用 **EIP-7930 可互操作格式**（其中嵌入了 chain ID），而不是裸的 0x 地址。金额使用最小单位表示。有关 StandardOrder 结构体、合约地址和签名细节，请参阅 [REFERENCE.md](references/REFERENCE.md#lifi-intents-api)。

**注意：**经典的 `li.quest/v1/quote` 已经聚合了基于意图的跨链桥（Across、Relay 等）——只有在希望使用 order-server 模型本身（solver 选择、资源锁、无 gas 提交）时，才需要直接集成 `order.li.fi`。

## Token Approvals

- 原生代币（`0x0000…0000`）→ 无需授权。
- Spender 始终是 `quote.estimate.approvalAddress`——**绝不要将其硬编码**（它会因路由而变化）。
- 检查 `allowance(fromAddress, approvalAddress)`；如果 `< fromAmount`，则发送 `approve` 并在主交易前**等待确认**，然后重新获取报价（gas 估算会过期）。
- **USDT 特殊情况：**如果当前 allowance > 0，必须先执行 `approve(spender, 0)`，然后再授权新的金额。
- 对于 agents，优先使用精确金额授权；授权 gas 约为 50–100k。

## 状态跟踪与恢复

使用退避策略轮询 `GET /status`：10s（前约 6 次尝试）→ 30s → 60s → 120s。使用报价中的 `estimate.executionDuration` 来设定预期。同链交换具有原子性，通常会立即完成。

| 结果 | 操作 |
|--------|--------|
| `NOT_FOUND` / `PENDING` | 继续轮询（`NOT_FOUND` 仅表示尚未建立索引） |
| `DONE` + `COMPLETED` | 成功 |
| `DONE` + `PARTIAL` | 用户收到的是其他代币（价值完整保留，通常是目标链上的桥接代币）。可选恢复：从 `receiving.token` 报价兑换为预期代币的**同链交换**；如果 gas > 价值的约 10%，则跳过 |
| `DONE` + `REFUNDED` | 代币已返还至源链 |
| `FAILED` | 永久失败 — 检查 `substatus`（`SLIPPAGE_EXCEEDED`、`OUT_OF_GAS`、`NOT_PROCESSABLE_REFUND_NEEDED` 等），并告知用户 |

超时后，绝不要假定交易失败 — 保存 `txHash` 并分享 `lifiExplorerLink`（`https://explorer.li.fi/tx/<txHash>`）。资金采用非托管模式，最终会回到用户手中；对于波动性代币，提高滑点，或直接将桥接的原生代币作为目标，以避免 PARTIAL。

## 错误处理

| HTTP | 是否重试？ | 操作 |
|------|--------|--------|
| 400 | 否 | 修正参数 |
| 404 / `NO_POSSIBLE_ROUTE` | 可能 | 更换交易对、金额或链；尝试使用 USDC/USDT/ETH 作为中间代币 |
| 429（代码 1005） | 是 | 指数退避 `min(2^attempt × 1s, 30s)` |
| 500/503 | 是（1–2 次） | 等待 2–10s 后重试 |

常见 API 错误代码：`1002` NoQuote，`1007` 滑点（将 `slippage` 提高至 `min(current×2, 0.03)`，或降低金额），`1011` 参数验证。`errors[]` 中的工具级错误代码：`NO_POSSIBLE_ROUTE`、`AMOUNT_TOO_LOW`（Composer 的最低金额要求更高）、`INSUFFICIENT_LIQUIDITY`、`TOOL_TIMEOUT`（立即重试）、`FEES_HIGHER_THAN_AMOUNT`。发送时出现 `execution reverted`：报价已过期 — 获取新的报价（最多约重试 2 次）。完整表格见 [REFERENCE.md](references/REFERENCE.md#error-reference)。

## 集成示例

### Python

```python
import requests

BASE_URL = "https://li.quest/v1"
HEADERS = {"x-lifi-api-key": "YOUR_API_KEY"}  # optional

def get_quote(from_chain, to_chain, from_token, to_token, amount, address, **kwargs):
    params = {
        "fromChain": from_chain, "toChain": to_chain,
        "fromToken": from_token, "toToken": to_token,
        "fromAmount": amount, "fromAddress": address,
        "slippage": 0.005, "integrator": "your-app", **kwargs,
    }
    r = requests.get(f"{BASE_URL}/quote", params=params, headers=HEADERS)
    r.raise_for_status()
    return r.json()

def get_status(tx_hash, from_chain=None, to_chain=None, bridge=None):
    params = {"txHash": tx_hash, "fromChain": from_chain,
              "toChain": to_chain, "bridge": bridge}
    return requests.get(f"{BASE_URL}/status", params=params, headers=HEADERS).json()

# Cross-chain swap quote
quote = get_quote(42161, 10,
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",   # USDC.e Arbitrum
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",   # DAI Optimism
    "10000000", "0xYourAddress")

# Composer deposit: same call, vault address as toToken
deposit = get_quote(8453, 8453,
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   # USDC Base
    "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",   # Morpho vault
    "100000000", "0xYourAddress")

# transactionRequest values are hex strings — parse before use
tx = quote["transactionRequest"]
gas_limit = int(tx["gasLimit"], 16)
```

### Node.js

```javascript
const BASE_URL = 'https://li.quest/v1';

async function getQuote(params) {
  const res = await fetch(`${BASE_URL}/quote?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error(`Quote failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function pollStatus(txHash, fromChain, toChain, bridge) {
  const params = new URLSearchParams({ txHash, fromChain, toChain, bridge });
  for (let attempt = 0; attempt < 60; attempt++) {
    const data = await (await fetch(`${BASE_URL}/status?${params}`)).json();
    if (data.status === 'DONE' || data.status === 'FAILED') return data;
    const delay = attempt < 6 ? 10_000 : attempt < 12 ? 30_000 : 60_000;
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error('Status polling timed out — check explorer.li.fi');
}

// Earn：发现排名靠前的 vault，然后通过 Composer 存入
const { data: vaults } = await (await fetch(
  'https://earn.li.fi/v1/vaults?chainId=8453&asset=USDC&sortBy=apy&isComposerSupported=true&limit=5'
)).json();
const quote = await getQuote({
  fromChain: 8453, toChain: 8453,
  fromToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  toToken: vaults[0].address, // vault 地址会触发 Composer
  fromAmount: '100000000',
  fromAddress: '0xYourAddress', toAddress: '0xYourAddress',
});
```

## 最佳实践

1. **始终传入 `integrator`** — 这是分析、费用收取和费用提取所必需的。
2. **重新获取过期的报价** — 报价会在约 60 秒后过期；在授权交易后始终重新获取报价。
3. **缓存 `/chains`、`/tokens`、`/tools`** — 它们很少发生变化，轮询会消耗速率限制。
4. **向 `/status` 传入 `fromChain`** — 可显著加快响应速度。
5. **对于稳定币到稳定币的转账，使用 `preset=stablecoin`**，而不是手动调整滑点和桥。
6. **如果需要非 EVM 链，请在 `/chains` 上显式请求 `chainTypes`**（默认仅支持 EVM）。
7. **金额是字符串**，以最小单位表示（`human × 10^decimals`）；`transactionRequest.value/gasLimit/gasPrice` 是十六进制字符串。
8. **处理 `PARTIAL` 完成状态** — 在适当情况下，提供同链恢复兑换。
9. **对于代理：**考虑使用 MCP 服务器（`https://mcp.li.quest/mcp`）或 `@lifi/cli`，以实现令牌高效的访问；机器可读文档位于 `https://docs.li.fi/llms.txt` 和 `https://docs.li.fi/openapi.yaml`（在任意文档页面的 URL 末尾追加 `.md` 即可将其作为 markdown 获取）。

参见 [references/REFERENCE.md](references/REFERENCE.md)，了解完整的端点文档、响应架构、Earn 和 Intents API 参考、错误代码、链 ID 以及代币地址。