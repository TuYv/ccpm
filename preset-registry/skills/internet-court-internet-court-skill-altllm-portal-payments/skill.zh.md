---
name: altllm-portal-payments
description: Use this skill when the user asks to create a NOWPayments crypto payment link, poll payment status, or execute a supported direct wallet payment through the AltLLM Portal CLI. Do NOT use for wallet login, API key management, billing history, or x402 credit top-ups.
user-invocable: true
---
# AltLLM 门户支付

用于本地 `altllm` CLI 的 NOWPayments 支付链接创建、结算轮询和直接钱包支付流程。

这些支付链接与 AltLLM 门户 x402 额度充值相互独立。对于 `/api/billing/x402/quote` 和 `/settle` 流程，请使用 `altllm-x402`。

## 共享设置

> 在全新检出中执行第一个 `altllm` 命令之前，请阅读并遵循：
> - `../_shared/preflight.md`
> - `../_shared/session-and-target.md`

## 命令索引

| 命令 | 用途 |
|---|---|
| `topup-crypto` | 创建托管式或直接加密货币支付链接 |
| `payment-status` | 查看或轮询现有支付链接 |
| `pay-payment-link` | 为现有链接发送链上直接支付 |

## 防护措施

- 不支持的 `pay_currency` 值必须快速失败。
- `pay-payment-link` 不得支付终止状态的链接（`completed`、`expired`、`failed`、`deactivated`）。
- 不得从直接支付静默降级为托管式结账。
- `topup-crypto --discount-code <code>` 用于折扣额度充值发票，不适用于订阅。
- 折扣码充值应在创建支付链接之前进行预览，以便自动选择一个允许使用的代币。
- 代币范围限定的折扣码必须遵守门户返回的 `allowedPayCurrencies`。
- 支付命令输出的 JSON 应显示门户 API 返回的折扣元数据。
- `pay-payment-link --wait` 应输出一个最终 JSON 文档。
- `payment-status` 和 `pay-payment-link` 当前依赖 `GET /api/billing/payment-links?limit=100` 返回的最新 `100` 条记录。
- 在后端提供按链接查询或更早页面的分页功能之前，这些 CLI 流程无法访问更早的支付链接。
- 支持自动直接支付的货币包括：
  - `eth`
  - `usdterc20`
  - `usdcerc20`
  - `usdcbase`
  - `usdtbase`

## 参考

有关工作流和代表性输出，请参阅 [references/cli-reference.md](references/cli-reference.md)。