---
name: x402
description: x402 agentic payments (Coinbase's HTTP 402 protocol). Custody-free tools to pay x402-protected endpoints (build the EIP-3009 transferWithAuthorization the payer signs, assemble the X-PAYMENT header), call a facilitator (verify/settle/supported), and monetize your own API by generating PaymentRequirements. USDC on Base. Triggers: x402, HTTP 402, pay per request, agentic payment, machine payment, X-PAYMENT, transferWithAuthorization, EIP-3009, facilitator, monetize API, pay for API, agent pays.
---
# x402 Payments 技能

x402 将 HTTP `402 Payment Required` 转变为真正的代理支付通道：服务器回复 `402`，说明需要支付的内容；客户端签署链下授权，并通过 `X-PAYMENT` header 重试；facilitator 负责广播该授权。结算使用 EIP-3009 `transferWithAuthorization`（例如 Base 上的 USDC）——facilitator 只能广播已签署的授权，绝不能修改金额或目的地。

**无需托管：**该插件会构建付款方需要签署的 EIP-712 数据并组装 header；它绝不会持有密钥。

## 工具

| 工具 | 用途 |
|---|---|
| `chaingpt_x402_decode` | 将 402 body 或 X-PAYMENT header 解码为易于理解的信息（金额/代币/收款人/过期时间），然后再付款。 |
| `chaingpt_x402_build_payment` | 构建未签名的 EIP-3009 typed data；传入签名后获取最终的 `X-PAYMENT` header。 |
| `chaingpt_x402_facilitator` | 调用 facilitator：`supported` / `verify` / `settle`。 |
| `chaingpt_x402_create_requirements` | 服务端：生成用于变现 endpoint 的 `PaymentRequirements` + 402 body。 |
| `chaingpt_x402_fetch` | 在一个工具中完成整个客户端循环：获取 URL；遇到 402 时解码挑战，并在给定 `from` 的情况下输出未签名的 typed data；使用 `xPaymentHeader` 再次调用以完成已付款请求。 |

## 支付 endpoint（客户端流程）

快速路径——一个工具驱动整个循环：

1. `chaingpt_x402_fetch url=<resource> from=<payer>` → 遇到 402 时，你会获得解码后的价格/收款人以及未签名的 EIP-3009 typed data。
2. 在付款方的钱包中签署 typed data。
3. `chaingpt_x402_build_payment from=<payer> requirements=<from step 1> signature=0x…` → 获取 `X-PAYMENT` header。
4. `chaingpt_x402_fetch url=<resource> xPaymentHeader=<header>` → 获取已付款响应。

手动路径（使用相同的基础原语，可进行更细粒度的控制）：`_decode` → `_build_payment` → 签名 → `_build_payment +signature` → 自行重试。

## 将你的 endpoint 变现（服务端流程）

`chaingpt_x402_create_requirements network=base amount=0.01 payTo=<you>` → 使用 HTTP 402 提供返回的 JSON。通过 facilitator（`chaingpt_x402_facilitator`）验证/结算收到的付款。

已知的 EIP-3009 代币：`base` 和 `base-sepolia` 上的 USDC。对于其他代币，请传入完整的 `PaymentRequirements`（包含 `asset` 以及 `extra.name`/`extra.version`）。
0 ChainGPT credits。