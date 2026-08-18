---
name: near-intents
description: Cross-chain token swap integration using NEAR Intents 1Click API. Use when building swap widgets, bridge interfaces, or multi-chain transfers across EVM, Solana, NEAR, TON, Stellar, and Tron.
---
# NEAR Intents 集成

通过 1Click REST API 实现跨链代币兑换。获取报价后，API 会提供存款地址；你构建存款交易，并自动接收兑换后的代币。

## 快速开始 - 选择你的路径

| 使用场景 | 从这里开始 |
|----------|------------|
| **React 应用** | `react-swap-widget.md` - 展示该模式的示例 |
| **Node.js / 脚本** | `server-example.md` - 展示该模式的示例 |
| **API 参考** | `api-quote.md` → `api-tokens.md` → `api-status.md` |
| **特定链的存款** | `deposit-{chain}.md` |

## 集成流程

```
GET /v0/tokens → POST /v0/quote (dry) → POST /v0/quote (wet) → 存款交易 → POST /v0/deposit/submit → GET /v0/status
```

## 规则类别

| 优先级 | 类别 | 文件 |
|----------|----------|-------|
| 1 | **示例** | `react-swap-widget.md`、`server-example.md` |
| 2 | **API** | `api-quote.md`、`api-tokens.md`、`api-status.md`、`api-deposit-submit.md` |
| 3 | **存款** | `deposit-evm.md`、`deposit-solana.md`、`deposit-near.md`、`deposit-ton.md`、`deposit-tron.md`、`deposit-stellar.md` |
| 4 | **React Hooks** | `react-hooks.md` |
| 5 | **高级功能** | `intents-balance.md`、`passive-deposit.md` |

## 关键知识

1. **使用 /v0/tokens 中的 `assetId`** - 切勿手动构造
2. **`dry: true`** = 仅预览，**`dry: false`** = 获取存款地址（有效期约 10 分钟）
3. **持续轮询状态**，直到进入终态：`SUCCESS`、`FAILED`、`REFUNDED`、`INCOMPLETE_DEPOSIT`
4. **默认使用链到链模式** - `depositType` 和 `recipientType` 默认指向链端点

## 索引

1. **示例（高优先级）**
   - [react-swap-widget](rules/react-swap-widget.md) - 使用 wagmi 实现最小可用 React 兑换
   - [server-example](rules/server-example.md) - 用于服务端兑换的 Node.js 脚本

2. **API 参考（关键）**
   - [api-tokens](rules/api-tokens.md) - 获取支持的代币，并缓存结果
   - [api-quote](rules/api-quote.md) - 获取兑换报价，dry=true 用于预览，dry=false 用于获取存款地址
   - [api-deposit-submit](rules/api-deposit-submit.md) - 存款后通知 API，以加快处理速度
   - [api-status](rules/api-status.md) - 持续轮询，直到进入终态（SUCCESS、FAILED、REFUNDED）
   - [api-any-input-withdrawals](rules/api-any-input-withdrawals.md) - 查询 ANY_INPUT 报价的提款记录

3. **链上存款（高优先级）**
   - [deposit-evm](rules/deposit-evm.md) - Ethereum、Base、Arbitrum、Polygon、BSC 转账
   - [deposit-solana](rules/deposit-solana.md) - 原生 SOL 和 SPL 代币转账
   - [deposit-near](rules/deposit-near.md) - 通过 wallet selector 进行 NEP-141 代币转账
   - [deposit-ton](rules/deposit-ton.md) - 通过 TonConnect 进行原生 TON 转账
   - [deposit-tron](rules/deposit-tron.md) - 原生 TRX 和 TRC-20 转账
   - [deposit-stellar](rules/deposit-stellar.md) - Stellar 转账（必须提供 MEMO）

4. **React Hooks（中优先级）**
   - [react-hooks](rules/react-hooks.md) - 用于代币、报价和状态轮询的可复用 hooks

5. **高级功能（低优先级）**
   - [intents-balance](rules/intents-balance.md) - 在 intents.near 中持有余额，以加快兑换速度
   - [passive-deposit](rules/passive-deposit.md) - 用于手动转账的二维码流程

6. **参考资料**
   - [概念](references/concepts.md) - Swap 生命周期、状态、CEX 警告、身份验证

## 资源

- 文档：https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api
- API 密钥：https://partners.near-intents.org/
- OpenAPI：https://1click.chaindefuser.com/docs/v0/openapi.yaml