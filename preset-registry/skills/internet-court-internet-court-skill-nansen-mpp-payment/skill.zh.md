---
name: nansen-mpp-payment
description: Pay-per-call access to the Nansen API via MPP (Tempo). Use when a user wants anonymous Nansen access without an API key and without managing their own Base/Solana wallet — they install the tempo CLI separately and call the API through `tempo request`.
metadata:
  openclaw:
    requires:
      bins:
        - tempo
    install:
      - kind: external
        name: tempo
        docs: https://docs.tempo.xyz
allowed-tools: Bash(tempo:*), Bash(nansen:*)
---
# MPP / Tempo

Nansen API 支持三种付费访问方式：API key、x402（由 `nansen-cli` 处理）以及通过 Tempo 的 MPP（由**独立的** [tempo CLI](https://docs.tempo.xyz) 处理）。本 skill 介绍第三种方式。

`nansen-cli` **不会**签署 MPP 凭证。当用户希望通过 `tempo request` 调用 Nansen API，且他们已经在使用 tempo、希望使用微支付而无需自行管理钱包密钥，或者不想为 Base/Solana USDC 钱包充值时，请使用此 skill。

关于 API-key 认证，请参阅 `nansen-wallet-manager`。关于使用本地钱包进行 x402 微支付，请参阅 `nansen-trading` / `nansen-wallet-manager`。

## 何时使用此 skill

- 用户提到 "MPP"、"tempo"、"Authorization: Payment" 或 "Payment-Receipt"。
- 用户没有 Nansen API key，也不想设置 Base/Solana 钱包。
- 用户已经通过 tempo 为其他 API 付费，并希望通过同一方式使用 Nansen。

## 一次性设置

```bash
# 1. Install the tempo CLI
curl -fsSL https://tempo.xyz/install | bash
# 2. Log in (creates / unlocks the tempo wallet)
tempo wallet login
# 3. Fund it with USDC on the chain tempo selects for your environment
tempo wallet fund
# 4. Confirm the wallet is ready
tempo wallet whoami
```

## 调用 Nansen API

`tempo request` 会处理完整的 MPP challenge/response 流程：它发送请求，在 API 返回 402 + `WWW-Authenticate: Payment ...` 时签署 `Authorization: Payment` 凭证，进行重试，并在成功时暴露 `Payment-Receipt` header。

```bash
# Smart Money netflow
tempo request POST https://api.nansen.ai/api/v1/smart-money/netflow \
  --json '{"chains":["solana"],"pagination":{"page":1,"page_size":10}}'

# TGM holders
tempo request POST https://api.nansen.ai/api/v1/tgm/holders \
  --json '{"token_address":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","chain":"solana"}'
```

Endpoint 路径和请求结构与 Nansen API 的其他部分相同——运行 `nansen schema <command>`（不需要 API key）查找请求体结构，然后通过 `tempo request` 调用对应的 `/api/v1/...` 路径。

## 发现付费 endpoint

```bash
curl https://api.nansen.ai/.well-known/x402
```

当服务器端启用 MPP 时，会返回 `paymentProtocols: ["x402", "mpp"]` 以及付费资源列表。

## MPP 与 x402 的区别

| | **x402**（nansen-cli 原生支持） | **通过 tempo 的 MPP**（此 skill） |
|---|---|---|
| 重试时发送的 header | `Payment-Signature: <base64>` | `Authorization: Payment <credential>` |
| 402 challenge header | `Payment-Required: <base64>` | `WWW-Authenticate: Payment ...` |
| 成功 header | _（无）_ | `Payment-Receipt: <base64>` |
| 钱包 | 本地钱包、Privy 或 WalletConnect —— 由 `nansen-cli` 管理 | 由 tempo 管理（独立 CLI） |
| 链 | Base USDC、Solana SPL USDC、X Layer USDT0 | Tempo 的链（生产环境主网为 `USDC`，开发环境 moderato 为 `pathUSD`） |
| nansen-cli 代码路径 | `src/x402.js` 在 402 时自动签名 | 不处理——直接通过 `tempo request` 调用 |

## 注意事项

- MPP 需要服务器端选择启用。如果 `tempo request` 返回 402，但没有 `WWW-Authenticate: Payment`，则该 endpoint/环境未启用 MPP——请改用 API key 或 x402。
- 不要尝试向 `nansen-cli` 添加 `--mpp-*` flags——受支持的集成方式是“单独使用 tempo”。如果用户要求更紧密的集成，请将其指向此 skill，并在添加代码前确认需求。
- 每次请求的价格与 x402 相同（1 credit ≈ $0.001，含 10 倍加价，例如，1-credit endpoint 的费用为 $0.01）。

## 来源

- npm: https://www.npmjs.com/package/nansen-cli
- GitHub: https://github.com/nansen-ai/nansen-cli
- MPP 协议: https://mpp.dev/protocol
- Tempo 文档: https://docs.tempo.xyz