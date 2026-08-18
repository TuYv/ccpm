---
name: integrating-jupiter
description: Comprehensive guidance for integrating Jupiter APIs (Swap, Lend, Perps, Trigger, Recurring, Tokens, Price, Portfolio, Prediction Markets, Send, Studio, Lock, Routing). Use for endpoint selection, integration flows, error handling, and production hardening.
license: MIT
metadata:
  author: jup-ag
  version: "1.2.0"
tags:
  - jupiter
  - jup-ag
  - solana
  - defi
  - swap-v2
  - token-swap
  - dex-aggregator
  - gasless
  - limit-order
  - dca
  - jupiter-lend
  - jupiter-perps
  - jupiter-trigger
  - jupiter-recurring
  - jupiter-portfolio
  - jupiter-prediction
  - jupiter-send
  - jupiter-studio
  - jupiter-lock
  - jupiter-routing
  - jupiterz-rfq
  - metis
  - jupiter-price-api
  - jupiter-tokens-api
  - jupiter-portal
  - jlp
---
# Jupiter API 集成

适用于所有 Jupiter API 的单一技能，针对快速路由和确定性执行进行了优化。

**基础 URL**：`https://api.jup.ag`  
**身份验证**：来自 [developers.jup.ag](https://developers.jup.ag/) 的 `x-api-key`（**Jupiter REST 端点必需**）

## 使用/不使用

使用场景：
- 任务需要选择或调用 Jupiter 端点。
- 任务涉及交换、借贷、永续合约、订单、定价、投资组合、发送、studio、锁定或路由。
- 用户需要获取 Jupiter API 调用的调试帮助。

不使用场景：
- 任务是通用的 Solana 设置，不涉及 Jupiter API 的使用。
- 任务仅涉及 UI，不涉及 API 行为决策。
- 代理上下文不是 DeFi/加密货币领域（如 `buy`、`sell`、`trade` 这类通用触发词默认假设处于 DeFi 领域）。

**触发词**：`swap`、`quote`、`gasless`、`best route`、`buy`、`sell`、`trade`、`convert`、`token exchange`、`jupiter api`、`jup.ag`、`ultra`、`metis`、`ultra swap`、`ultra api`、`ultra-api.jup.ag`、`lend`、`borrow`、`earn`、`yield`、`apy`、`deposit`、`liquidation`、`perps`、`leverage`、`long`、`short`、`position`、`futures`、`margin trading`、`limit order`、`trigger`、`price condition`、`dca`、`recurring`、`scheduled swaps`、`token metadata`、`token search`、`verification`、`shield`、`price`、`valuation`、`price feed`、`portfolio`、`positions`、`holdings`、`prediction markets`、`market odds`、`event market`、`invite transfer`、`send`、`clawback`、`create token`、`studio`、`claim fee`、`vesting`、`distribution lock`、`unlock schedule`、`dex integration`、`rfq integration`、`routing engine`、`status page`、`health check`、`service health`、`accumulate`、`auto-buy`

## 开发者快速入门

```typescript
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const API_KEY = process.env.JUPITER_API_KEY!;  // from developers.jup.ag
if (!API_KEY) throw new Error('Missing JUPITER_API_KEY');
const BASE = 'https://api.jup.ag';
const headers = { 'x-api-key': API_KEY };

async function jupiterFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
  if (res.status === 429) throw { code: 'RATE_LIMITED', retryAfter: Number(res.headers.get('Retry-After')) || 10 };
  if (!res.ok) {
    const raw = await res.text();
    let body: any = { message: raw || `HTTP_${res.status}` };
    try {
      body = raw ? JSON.parse(raw) : body;
    } catch {
      // keep text fallback body
    }
    throw { status: res.status, ...body };
  }
  return res.json();
}

// Sign and send any Jupiter transaction
async function signAndSend(
  txBase64: string,
  wallet: Keypair,
  connection: Connection,
  additionalSigners: Keypair[] = []
): Promise<string> {
  const tx = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
  tx.sign([wallet, ...additionalSigners]);
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    maxRetries: 0,
    skipPreflight: true,
  });
  return sig;
}
```

## Token 数量与小数位

每个 Jupiter `amount` 字段都使用代币的**最小单位（原始整数）**——绝不是面向用户/UI 的数值。

- 常见小数位：**SOL 与 wSOL = 9**，**USDC 与 USDT = 6**。规范 mint：SOL `So11111111111111111111111111111111111111112`，USDC `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`。
- 将人类可读值转换为原始值：`raw = Math.round(human * 10 ** decimals)`。示例：`1 SOL → 1_000_000_000`、`100 USDC → 100_000_000`。`slippageBps` 使用基点表示：`0.5% = 50`、`1% = 100`。
- **通过链上按 mint 读取小数位**，使用来自 `@solana/spl-token` 的 `getMint(connection, mintPubkey)`——绝不要硬编码（不同代币的小数位可能不同），也**不要**仅为发现小数位而调用 Price API。

## 意图路由器（第一步）

| 用户意图 | API 系列 | 首要操作 |
|---|---|---|
| 兑换/报价 | [兑换](#swap) | `GET /swap/v2/order` -> 签名 -> `POST /swap/v2/execute` |
| 借贷/借入/收益 | [借贷](#lend) | `POST /lend/v1/earn/deposit` 或 `/withdraw` |
| 杠杆/永续合约 | [永续合约](#perps) | 通过 Anchor IDL 进行链上操作（目前没有 REST API） |
| 限价单 | [Trigger](#trigger-limit-orders) | JWT 认证 -> `POST /trigger/v2/orders/price` |
| DCA/定期买入 | [Recurring](#recurring-dca) | `POST /recurring/v1/createOrder` -> 签名 -> `POST /recurring/v1/execute` |
| 代币搜索 | [代币](#tokens) | `GET /tokens/v2/search?query={mint}` |
| 代币验证/元数据更新 | 使用 `jupiter-vrfd` skill | 延后处理——本 skill 不负责 |
| 价格查询 | [价格](#price) | `GET /price/v3?ids={mints}` |
| 投资组合/持仓 | [投资组合](#portfolio) | `GET /portfolio/v1/positions/{address}` |
| 预测市场集成 | [预测市场](#prediction-markets) | `GET /prediction/v1/events` -> `POST /prediction/v1/orders` |
| 发送邀请/撤回 | [发送](#send) | `POST /send/v1/craft-send` -> 签名 -> 发送至 RPC |
| 代币创建/费用 | [Studio](#studio) | `POST /studio/v1/dbc-pool/create-tx` -> 上传 -> 提交 |
| 归属/分发 | [Lock](#lock) | 链上程序 `LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn` |
| DEX/RFQ 集成 | [路由](#routing) | 选择 DEX（AMM trait）或 RFQ（webhook）路径 |

## API 操作手册

将每个区块作为最小执行契约使用。获取链接的参考文档，以了解完整的请求/响应结构、TypeScript 接口和参数详情。

### 兑换

- **基础 URL**：`https://api.jup.ag/swap/v2`
- **触发词**：`swap`、`quote`、`gasless`、`best route`
- **费用**：根据交易对而变化——0 bps（Jupiter 代币/锚定代币）、2 bps（SOL-稳定币）、5 bps（LST-稳定币）、10 bps（大多数交易对）、50 bps（创建时间少于 24 小时的代币）。推荐费：50-255 bps（Jupiter 保留 20%）。
- **速率限制**：基础为 50 req/10s，会根据 24 小时执行量进行扩展（参见[速率限制](#rate-limits)）
- **端点**：`/order`（GET）、`/execute`（POST）、`/build`（GET，仅 Metis 的原始指令）
- **报价与执行**：对于只读报价/价格**预览**，调用 `GET /order` 并**省略 `taker`**——响应中的 `transaction` 为 `null`，读取 `outAmount`、`routePlan[].swapInfo.label` 以及价格影响字段。只有在确实打算执行兑换时，才传入 `taker`（然后签名并执行 `POST /execute`）。没有单独的报价端点——`/swap/v1/quote` **已弃用**；报价也应使用 `/swap/v2/order`。
- **路由**：4 个路由器会参与竞争——Metis（`metis`）、JupiterZ（`jupiterz`）、Dflow（`dflow`）、OKX（`okx`）。响应字段 `router` 会返回其中一个值。`swapType` 为 `aggregator`（Metis、Dflow 或 OKX）或 `rfq`（JupiterZ）。响应字段 `mode`：`"ultra"`（所有路由器，使用默认参数）或 `"manual"`（可选参数会限制路由）。`/build` 仅使用 Metis。
- **Gasless**：有三条路径——自动路径（由 Jupiter 承担）、JupiterZ（由 MM 承担）、集成方付款人（`payer` 参数，仅使用 Metis 路由）。是否符合条件取决于余额、交易规模和所使用的参数。当前阈值及会导致不符合条件的参数，请参见 [Gasless 文档](https://developers.jup.ag/docs/swap/advanced/gasless.md)。
- **注意事项**：
  - 已签名载荷的 TTL 约为 2 分钟。交易在接收后不可变更。
  - 在代码和日志中分离订单与执行。当条件可能已经发生变化时，应在执行前重新报价。
  - 可选参数对路由的影响：`referralAccount` + `referralFee` 只会禁用 JupiterZ（Metis/Dflow/OKX 仍可用）；`payer`（集成方 gasless）会将路由限制为仅使用 Metis（禁用 JupiterZ、Dflow 和 OKX）；`receiver` 不会限制路由，但必须不同于 `taker`（`receiver=taker` 会返回 `400 "Receiver cannot be same as taker"`）。
  - `/build` 交易不能使用 `/execute`——需通过 RPC 自行管理。
- **正在从较旧的集成迁移？** 使用 `jupiter-swap-migration` skill。
- 参考：[概览](https://developers.jup.ag/docs/swap/index.md) | [Order 与 Execute](https://developers.jup.ag/docs/swap/order-and-execute.md) | [Build](https://developers.jup.ag/docs/swap/build/index.md) | [Gasless](https://developers.jup.ag/docs/swap/advanced/gasless.md) | [迁移](https://developers.jup.ag/docs/swap/migration/ultra-to-order.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/swap/v2/swap.yaml)

费用在 Order & Execute 和 Build 页面中以内联形式说明；路由器竞争以及参数路由影响矩阵位于 Overview 和 Order & Execute 页面中。

`/swap/v2/execute` 返回的常见错误代码及建议操作：

| 代码 | 类别 | 含义 | 可重试 | 操作 |
|------|----------|---------|-----------|--------|
| `0` | 成功 | 交易已确认 | — | — |
| `-1` | 执行 | 缓存的订单缺失或已过期 | 是 | 重新获取报价并重试 |
| `-2` | 执行 | 签名交易无效 | 否 | 修复交易签名 |
| `-3` | 执行 | 消息字节无效 | 否 | 修复序列化 |
| `-1000` | 聚合器 | 尝试落链失败 | 是 | 调整参数后重新获取报价 |
| `-1001` | 聚合器 | 未知错误 | 是 | 使用退避策略重试 |
| `-1002` | 聚合器 | 交易无效 | 否 | 修复交易构造 |
| `-1003` | 聚合器 | 交易未完成签名 | 否 | 确保所有必需的签名者均已签名 |
| `-1004` | 聚合器 | 区块高度无效 | 是 | 重新获取报价（区块哈希已过期） |
| `-2000` | RFQ | 落链失败 | 是 | 重新获取报价并重试 |
| `-2001` | RFQ | 未知错误 | 是 | 使用退避策略重试 |
| `-2002` | RFQ | 负载无效 | 否 | 修复请求负载 |
| `-2003` | RFQ | 报价已过期 | 是 | 重新获取报价并重试 |
| `-2004` | RFQ | 兑换被拒绝 | 是 | 重新获取报价，必要时更换路由 |
| `429` | 速率限制 | 请求频率受限 | 是 | 使用指数退避，等待 10 秒窗口 |

成功时，`/execute` 返回 `{ status: "Success", code: 0, signature, inputAmountResult, outputAmountResult, slot, totalInputAmount, totalOutputAmount }`。失败时，它会返回 `status: "Failed"`，其中包含非零的 `code` 和 `error` 字符串。`inputAmountResult`/`outputAmountResult` 是链上实际金额；请将其与报价进行核对。


---

### 借贷

- **基础 URL**：`https://api.jup.ag/lend/v1`
- **触发词**：`lend`、`borrow`、`earn`、`liquidation`
- **程序**：Earn `jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9`，Borrow `jupr81YtYssSyPt8jbnGuiWon5f6x9TcDEFxYe3Bdzi`
- **SDK**：`@jup-ag/lend`（TypeScript）
- **端点**：`/earn/deposit`（POST）、`/earn/withdraw`（POST）、`/earn/mint`（POST）、`/earn/redeem`（POST）、`/earn/deposit-instructions`（POST）、`/earn/withdraw-instructions`（POST）、`/earn/tokens`（GET）、`/earn/positions`（GET）、`/earn/earnings`（GET）
- **注意事项**：在每次改变状态的操作之前重新计算账户状态。将风险检查（健康因子、清算边界）编码为前置条件。所有 deposit/withdraw/mint/redeem 操作都会返回 base64 编码的无签名 `VersionedTransaction`。
- **对于使用 `@jup-ag/lend` 和 `@jup-ag/lend-read` 进行 SDK 级集成**，请使用 `jupiter-lend` skill。
- 参考：[概览](https://developers.jup.ag/docs/lend/index.md) | [Earn](https://developers.jup.ag/docs/lend/earn.md) | [SDK](https://developers.jup.ag/docs/lend/api-vs-sdk.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/lend/lend.yaml)

---

### 永续合约

- **状态**：API 仍在**开发中**。目前还没有 REST 端点。通过 Anchor IDL 在链上进行交互。
- **触发词**：`perps`、`leverage`、`long`、`short`、`position`
- **社区 SDK**：[github.com/julianfssen/jupiter-perps-anchor-idl-parsing](https://github.com/julianfssen/jupiter-perps-anchor-idl-parsing)
- **注意事项**：最多同时持有 9 个仓位：3 个多头仓位（SOL、wETH、wBTC）+ 6 个空头仓位（3 种代币 × 2 种抵押资产 USDC/USDT）。根据账户模型验证保证金/杠杆。
- 参考：[概览](https://developers.jup.ag/docs/perps/index.md) | [仓位账户](https://developers.jup.ag/docs/perps/position-account.md) | [仓位请求](https://developers.jup.ag/docs/perps/position-request-account.md)

---

### 触发器（限价单）

- **基础 URL**: `https://api.jup.ag/trigger/v2`
- **触发词**: `limit order`、`trigger`、`price condition`
- **最小订单金额**: 等值 10 USD
- **身份验证**: 双重身份验证 — 所有请求均需使用 `x-api-key`，订单变更请求还需使用 `Authorization: Bearer <jwt>`。JWT 通过挑战-响应流程获取：`POST /auth/challenge` → 使用钱包对挑战进行签名 → `POST /auth/verify` → 接收令牌。JWT 过期不会影响未完成订单 — 它们会继续执行。
- **端点**: `/auth/challenge`（POST，请求体：`walletPubkey` + `type`）、`/auth/verify`（POST，请求体：`type` + `walletPubkey` + base58 `signature`）、`/vault`（GET）、`/vault/register`（GET）、`/deposit/craft`（POST）、`/orders/price`（POST 创建，PATCH 更新）、`/orders/price/cancel/{orderId}`（POST，发起提现）、`/orders/price/confirm-cancel/{orderId}`（POST，提交已签名的提现交易 + `cancelRequestId`）、`/orders/history`（GET，通过 JWT 隐式指定钱包）
- **订单类型**: `single`（单向触发器）、`oco`（止盈 + 止损配对）、`otoco`（入场触发器 + OCO）。`triggerCondition`: `"above"` 或 `"below"`。
- **架构**: 每个钱包对应一个链下托管金库（Privy）。订单在执行前不会显示在链上 — 可抵御 MEV。触发条件基于 USD 价格（而非池汇率比值）。支持部分成交。
- **注意事项**:
  - 创建订单分为 3 个步骤 — `GET /vault/register`（如果是新钱包则进行注册；如果已存在则返回 `409 "Vault already registered"`，这是正常情况）、`POST /deposit/craft`（返回 `transaction` + `requestId`；请求体 MUST 包含 `orderType: "price"` 和 `orderSubType`（`single`/`oco`/`otoco`））、签署存款交易，然后使用 `depositRequestId` + `depositSignedTx` 调用 `POST /orders/price`。
  - 取消订单分为两步 — `POST /cancel/{orderId}` 返回 `transaction` + `requestId`；签署交易，然后使用 `signedTransaction` + `cancelRequestId` 调用 `POST /confirm-cancel/{orderId}`。
  - 创建响应字段是 `id`（而不是 `orderId`）；订单历史对象使用 `orderState`/`rawState`（没有 `status` 字段）。
- 参考: [概览](https://developers.jup.ag/docs/trigger/index.md) | [身份验证](https://developers.jup.ag/docs/trigger/authentication.md) | [创建订单](https://developers.jup.ag/docs/trigger/create-order.md) | [订单历史](https://developers.jup.ag/docs/trigger/order-history.md) | [管理订单](https://developers.jup.ag/docs/trigger/manage-orders.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/trigger/v2/trigger.yaml)

---

### 定期执行（DCA）

- **基础 URL**: `https://api.jup.ag/recurring/v1`
- **触发词**: `dca`、`recurring`、`scheduled swaps`
- **费用**: 所有定期订单均收取 0.1%
- **限制**: 总金额最低 100 USD，至少 2 个订单，每个订单最低 50 USD
- **分页**: 每页 10 个订单
- **端点**: `/createOrder`（POST）、`/cancelOrder`（POST）、`/execute`（POST）、`/getRecurringOrders`（GET）
- **注意事项**: 不支持 Token-2022。使用 `params.time` 设置订单计划时间；不支持基于价格的下单。
- 参考: [概览](https://developers.jup.ag/docs/recurring/index.md) | [创建](https://developers.jup.ag/docs/recurring/create-order.md) | [获取订单](https://developers.jup.ag/docs/recurring/get-recurring-orders.md) | [最佳实践](https://developers.jup.ag/docs/recurring/best-practices) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/recurring/recurring.yaml)

---

### 代币

- **基础 URL**: `https://api.jup.ag/tokens/v2`
- **触发词**: `token metadata`, `token search`, `shield`
- **端点**: `/search?query={q}`（GET，以逗号分隔 mint，最多 100 个）、`/tag?query={tag}`（GET，`verified` 或 `lst`）、`/{category}/{interval}`（GET，类别：`toporganicscore`、`toptraded`、`toptrending`；时间间隔：`5m`、`1h`、`6h`、`24h`）、`/recent`（GET）
- **注意事项**:
  - 使用 mint 地址作为主要身份标识；将 symbol/name 视为便捷信息。
  - 主要信任信号是顶层的 `isVerified`（布尔值），以及 `organicScore`（0-100）和 `organicScoreLabel`（`high`/`medium`/`low`）。
  - 次要风险标志：**`audit.isSus`** —— 仅当值为 `true` 时才会存在的布尔字段（安全代币完全不会有 `isSus` 键），因此应防御性地检查 `token.audit?.isSus === true`，绝不要直接读取它。已确认的实时数据中，带有该标志的代币（开发者持有约 100% 的供应量）同时还会携带 `isVerified: null` 和 `organicScoreLabel: "low"`。缺少 `isSus` 并不能证明安全——并非所有高风险代币都会携带该标志。
  - 实时 API 返回的其他条件性 `audit` 字段：`mintAuthorityDisabled`、`freezeAuthorityDisabled`、`topHoldersPercentage`、`devBalancePercentage`、`devMigrations`、`devMints`（全部可为 null，任意字段都可能缺失；`devMigrations` 会返回，但当前 OpenAPI schema 中缺少该字段）。
- 参考资料：[概览](https://developers.jup.ag/docs/tokens/index.md) | [Token info v2](https://developers.jup.ag/docs/tokens/token-information.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/tokens/v2/tokens.yaml)

---

### 价格

- **基础 URL**: `https://api.jup.ag/price/v3`
- **触发词**: `price`, `valuation`, `price feed`
- **限制**: 每个请求最多包含 50 个 mint ID
- **端点**: `/price/v3?ids={mints}`（GET，以逗号分隔）
- **响应**: 以 mint 为键，每个值包含 `usdPrice`、`blockId`、`decimals`、`priceChange24h`、`liquidity`、`createdAt`（某些代币会添加条件性字段，如 `launchpad`、`stockData`、`scaledUiConfig`）。Price API V3 没有 `confidenceLevel` 字段（该字段属于 V2）。
- **注意事项**: 价格不可靠的代币会被完全从响应中省略（这不是错误，也不会使用 `null` 占位）。出于安全考虑，对于请求的 mint 未出现在响应中的情况，应采取默认拒绝策略。使用 `blockId` 检查价格的新近程度。
- 参考资料：[概览](https://developers.jup.ag/docs/price/index.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/price/v3/price.yaml)

---

### 投资组合

- **基础 URL**: `https://api.jup.ag/portfolio/v1`
- **状态**: 测试版 — 仅限 Jupiter 平台
- **触发词**: `portfolio`, `positions`, `holdings`
- **端点**: `/positions/{address}`（GET）、`/positions/{address}?platforms={ids}`（GET）、`/platforms`（GET）、`/staked-jup/{address}`（GET）
- **注意事项**: 将空的 positions 视为有效状态。响应为测试版——应将其标准化为稳定的内部 schema。元素类型：`multiple`、`liquidity`、`trade`、`leverage`、`borrowlend`。
- 参考资料：[概览](https://developers.jup.ag/docs/portfolio/index.md) | [Jupiter positions](https://developers.jup.ag/docs/portfolio/jupiter-positions.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/portfolio/portfolio.yaml)

---

### 预测市场

- **基础 URL**: `https://api.jup.ag/prediction/v1`
- **状态**: Beta（可能发生破坏性变更）
- **受地理限制**: 美国和韩国 IP 被阻止
- **价格约定**: 1,000,000 个原生单位 = $1.00 USD
- **触发词**: `prediction markets`、`market odds`、`event market`
- **存款 mint**: JupUSD (`JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD`)、USDC
- **最小订单**: $5（5,000,000 个原生单位）
- **端点**: `/events`（GET，返回 `{data, pagination}`）、`/events/search`（GET）、`/markets/{marketId}`（GET）、`/orderbook/{marketId}`（GET，返回 `{yes, no, yes_dollars, no_dollars}`）、`/orders`（POST，需要 `isBuy` 布尔值 + `ownerPubkey`）、`/orders/status/{orderPubkey}`（GET）、`/positions`（GET，`?ownerPubkey=`）、`/positions/{positionPubkey}`（DELETE）、`/positions/{positionPubkey}/claim`（POST）、`/history`（GET）、`/leaderboards`（GET）
- **注意事项**:
  - 领取前检查 `position.claimable`。获胜者每份合约可获得 $1。
  - 市场是扁平结构 —— `provider`、`marketId`、`result`、`resolveAt`、`outcomes`、`clobTokenIds` 等字段位于顶层，而不是嵌套在 `metadata` 下。
  - 合约是可分割的：使用 `contractsMicro`（1,000,000 = 1 份合约）或 `contractsDecimal`，不要使用旧版的整数 `contracts`。
- 参考资料: [概览](https://developers.jup.ag/docs/prediction/index.md) | [事件](https://developers.jup.ag/docs/prediction/events-and-markets.md) | [持仓](https://developers.jup.ag/docs/prediction/open-positions.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/prediction/prediction.yaml)

---

### 发送

- **基础 URL**: `https://api.jup.ag/send/v1`
- **状态**: Beta
- **触发词**: `invite transfer`、`send`、`clawback`
- **支持的代币**: SOL、USDC、memecoins
- **端点**: `/craft-send`（POST）、`/craft-clawback`（POST）、`/pending-invites`（GET）、`/invite-history`（GET）
- **注意事项**: **双重签名要求** —— 发送方密钥对 + 收件方密钥对（由邀请码派生）。只能通过 Jupiter Mobile 领取（API 不支持领取）。绝不要泄露邀请码。
- 参考资料: [概览](https://developers.jup.ag/docs/send/index.md) | [邀请码](https://developers.jup.ag/docs/send/invite-code.md) | [创建发送交易](https://developers.jup.ag/docs/send/craft-send.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/send/send.yaml)

---

### Studio

- **基础 URL**: `https://api.jup.ag/studio/v1`
- **状态**: Beta
- **触发词**: `create token`、`studio`、`claim fee`
- **端点**: `/dbc-pool/create-tx`（POST）、`/dbc-pool/submit`（POST，multipart/form-data）、`/dbc-pool/addresses/{mint}`（GET）、`/dbc/fee`（POST）、`/dbc/fee/create-tx`（POST）
- **流程**: create-tx -> 将图片上传到预签名 URL -> 将元数据上传到预签名 URL -> 签名 -> 通过 `/dbc-pool/submit` 提交
- **注意事项**: 必须通过 `/dbc-pool/submit` 提交（不能从外部提交），这样代币才能在 jup.ag 上获得 Studio 页面。错误代码：`403` = 无权访问该池，`404` = 找不到代理账户。
- 参考资料: [概览](https://developers.jup.ag/docs/studio/index.md) | [创建代币](https://developers.jup.ag/docs/studio/create-token.md) | [领取费用](https://developers.jup.ag/docs/studio/claim-fee.md) | [OpenAPI](https://developers.jup.ag/docs/openapi-spec/studio/studio.yaml)

---

### 锁定

- **Program ID**: `LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`
- **Triggers**: `vesting`, `distribution lock`, `unlock schedule`
- **Integration**: 仅链上程序（无 REST API）
- **Source**: [github.com/jup-ag/jup-lock](https://github.com/jup-ag/jup-lock)
- **UI**: [lock.jup.ag](https://lock.jup.ag/)
- **Security**: 由 OtterSec 和 Sec3 审计
- **Gotchas**: 无 REST API。使用仓库 `cli/src/bin/instructions` 目录中的 instruction 脚本。
- 参考资料：[Lock 概览](https://developers.jup.ag/docs/lock/index.md)

---

### 路由

- **Triggers**: `dex integration`, `rfq integration`, `routing engine`
- **Engines**: Juno（元聚合器）、Metis（多跳 DEX 路由，为 Swap API 提供支持；此前称为 Iris）、JupiterZ（RFQ 做市商报价）
- **DEX Integration**（接入 Metis）：免费，无费用。前置条件：代码质量、安全审计、市场 traction。实现 `jupiter-amm-interface` crate。**关键**：实现中不得进行网络调用（账户已预先批量获取并缓存）。参考实现：[github.com/jup-ag/rust-amm-implementation](https://github.com/jup-ag/rust-amm-implementation)
- **RFQ Integration**（JupiterZ）：做市商在 `/jupiter/rfq/quote`（POST，250ms）、`/jupiter/rfq/swap`（POST）、`/jupiter/rfq/tokens`（GET）提供 webhook。要求：95% 成交率、250ms 响应时间、55s 过期时间。SDK：[github.com/jup-ag/rfq-webhook-toolkit](https://github.com/jup-ag/rfq-webhook-toolkit)
- **Market Listing**：对于创建时间不足 30 天的代币，提供即时路由。常规路由（每 30 分钟检查一次）要求：$500 往返交易的损失低于 30%，或比较 $1k 与 $500 时价格影响低于 20%。
- 参考资料：[DEX 集成](https://developers.jup.ag/docs/swap/routing/dex-integration.md) | [RFQ 集成](https://developers.jup.ag/docs/swap/routing/rfq-integration.md) | [市场上架](https://developers.jup.ag/docs/swap/routing/market-listing.md)

---

## 速率限制

**Swap API**（动态，基于交易量）：

| 24 小时执行交易量 | 每个 10s 窗口的请求数 |
|--------------------|-------------------------|
| $0 | 50 |
| $10,000 | 51 |
| $100,000 | 61 |
| $1,000,000 | 165 |

配额每 10 分钟重新计算一次。Pro 计划不会增加 Swap API 限制。

**其他 API**：在 portal 层级管理。请查看 [portal 速率限制](https://developers.jup.ag/docs/portal/rate-limits.md)。

**发生 HTTP 429 时**：使用带抖动的指数退避：`delay = min(baseDelay * 2^attempt + random(0, jitter), maxDelay)`。等待 10s 滑动窗口刷新。不要激进地进行突发请求。

## 生产环境加固

1. **Auth**：如果缺少或无效的 `x-api-key`，立即失败。
2. **Timeouts**：报价超时设为 5s，执行超时设为 30s，并设置总操作超时。
3. **Retries**：仅对临时性、网络或速率限制错误使用带抖动的指数退避进行重试。
4. **Idempotency**：Swap `/execute` 在最多 2 分钟内接受相同的 `signedTransaction` + `requestId`，且不会重复执行。
5. **Validation**：调用前验证 mint 地址、金额精度和钱包所有权。
6. **Safety**：根据应用配置强制执行滑点和最大金额防护限制。
7. **Observability**：记录 `requestId`、API 系列、端点、延迟、状态和错误代码。
8. **UX resilience**：返回可执行的状态（`retry`、`adjust params`、`insufficient balance`、`rate limited`）。
9. **Consistency**：在向用户最终报告成功前，协调异步状态（已提交、已确认、失败）。
10. **Freshness**：当行为与预期流程不一致时，重新获取相关文档。

## 集成最佳实践

1. 编写端点调用代码前，先阅读特定于 API 的概览。
2. 将身份验证作为每个请求的硬性前置条件。参考：[门户设置](https://developers.jup.ag/docs/portal/setup.md)
3. 根据文档说明的速率限制行为设计重试逻辑，而不是基于固定假设。参考：[速率限制](https://developers.jup.ag/docs/portal/rate-limits.md)
4. 根据文档定义的响应语义，将所有非成功响应映射为类型化的应用错误。参考：[API 响应](https://developers.jup.ag/docs/portal/responses.md)
5. 对于基于订单的产品（Swap/Trigger/Recurring），在代码和日志中分离创建、执行和检索阶段。
6. 将网络/服务健康状况视为运行时行为的一部分（优雅降级）。参考：[状态页面](https://status.jup.ag/)

## 横向错误处理模式

```typescript
interface JupiterResult<T> {
  ok: boolean;
  result?: T;
  error?: { code: string | number; message: string; retryable: boolean };
}

async function jupiterAction<T>(action: () => Promise<T>): Promise<JupiterResult<T>> {
  try {
    const result = await action();
    return { ok: true, result };
  } catch (error: any) {
    const code = error?.code ?? error?.status ?? 'UNKNOWN';

    // Rate limit — retry with backoff
    if (code === 429 || code === 'RATE_LIMITED') {
      return { ok: false, error: { code: 'RATE_LIMITED', message: 'Rate limited', retryable: true } };
    }

    // Swap execute errors (negative codes)
    if (typeof code === 'number' && code < 0) {
      const retryable = [-1, -1000, -1001, -1004, -2000, -2001, -2003, -2004].includes(code);
      return { ok: false, error: { code, message: error?.error ?? 'Execute failed', retryable } };
    }

    // Program errors (positive codes like 6001 = slippage)
    if (typeof code === 'number' && code > 0) {
      return { ok: false, error: { code, message: error?.error ?? 'Program error', retryable: false } };
    }

    return { ok: false, error: { code, message: error?.message ?? 'UNKNOWN_ERROR', retryable: false } };
  }
}

async function withRetry<T>(action: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await jupiterAction(action);
    if (result.ok) return result.result!;
    if (!result.error?.retryable || attempt === maxRetries) throw result.error;
    const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 10000);
    await new Promise(r => setTimeout(r, delay));
  }
  throw new Error('Retry exhausted');
}
```


## 完整可运行示例

可用于生产环境的代码片段。每个示例都使用上述章节中的 `jupiterFetch` 辅助函数；在生产环境中，应在执行调用周围应用 `withRetry`。

- [Swap：端到端](./examples/swap.md) — 创建订单 -> 签名 -> 执行 -> 确认流程
- [Lend：存入 USDC](./examples/lend.md) — 将资金存入 Jupiter Lend earn 池
- [Trigger：限价订单](./examples/trigger.md) — 创建并执行限价订单
- [Price：多代币查询](./examples/price.md) — 获取带置信度过滤的价格

## 最新上下文策略

在执行操作手册之前，始终从所引用的文档/规范中获取最新上下文。

1. 使用 `Intent Router` 解析意图。
2. 编码之前，获取操作手册中链接的参考文档（概览文档和特定 API 文档）。
3. 如有需要，为了验证或消除歧义，获取 OpenAPI 规范。
4. 将获取的文档视为事实来源，优先于缓存的记忆。
5. 如果获取的文档与本文件冲突，遵循获取的文档，并注明不一致之处。
6. 如果无法获取文档，说明上下文已过时/未经验证，并基于已知的最佳指导继续。
7. 保持认证不变量：Jupiter REST 端点要求使用 `x-api-key`（不适用于仅链上流程，如 Perps/Lock）。

## 操作参考

- [Portal 设置](https://developers.jup.ag/docs/portal/setup.md) — API 密钥配置
- [速率限制](https://developers.jup.ag/docs/portal/rate-limits.md) — 全局速率限制策略
- [Swap 概览](https://developers.jup.ag/docs/swap/index.md) — 路由器竞争和参数影响
- [API 响应](https://developers.jup.ag/docs/portal/responses.md) — 响应格式标准
- [Swap 下单与执行](https://developers.jup.ag/docs/swap/order-and-execute.md) — 详细错误代码和响应格式
- [状态页面](https://status.jup.ag/) — 服务健康状况
- [文档站点地图](https://developers.jup.ag/docs/llms.txt) — 完整文档索引
- [工具包](https://developers.jup.ag/docs/tool-kits/plugin/index.md) — 插件、Wallet Kit、推荐计划