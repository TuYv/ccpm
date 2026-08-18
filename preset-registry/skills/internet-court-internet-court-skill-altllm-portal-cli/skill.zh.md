---
name: altllm-portal-cli
description: Use this umbrella skill when the request spans multiple AltLLM Portal CLI domains, or when you need to navigate the local altllm CLI in this repository across auth, API keys, billing history, NOWPayments payment links, and related x402 Portal top-up guidance.
user-invocable: true
---
# AltLLM Portal CLI

在此仓库中工作且任务跨越多个 Portal 领域时，使用此统领技能。对于聚焦的请求，优先使用下面的某个领域技能。

AltLLM 本身有两个容易混淆的不同界面：

- **Portal API**，用于管理身份验证、计费、API keys 和 payment links
- **OpenAI-compatible gateway**，使用 Portal 签发的 API keys 进行模型推理

此技能系列专门针对本仓库中的 **Portal CLI workflow**。使用它可以安全、一致地操作 Portal 端，而不是记录或代理 gateway 本身。

## Shared Setup

> 在全新检出内容中执行第一个 `altllm` 命令之前，请阅读并遵循：
> - `../_shared/preflight.md`
> - `../_shared/session-and-target.md`

## Skill Map

| Skill | Purpose | Use When |
|---|---|---|
| `altllm-portal-auth` | 钱包登录和会话初始化 | 钱包挑战、签名验证、登录故障排查 |
| `altllm-portal-api-keys` | Portal API key 生命周期 | 创建、查看、禁用、重新启用或撤销 API keys |
| `altllm-portal-billing` | 余额、促销、交易和使用分析 | 额度余额、兑换促销、计费历史、使用情况视图 |
| `altllm-portal-payments` | NOWPayments 链接创建、轮询和直接支付执行 | 加密货币充值链接、支付状态、直接钱包支付 |
| `altllm-x402` | Portal x402 额度充值指南 | BSC/USDT x402 报价、折扣充值、钱包签名、结算、facilitator 错误 |

## Plan Awareness

- 个人层级包括 `free`、`basic`、`pro` 和 `power`；Business/Flex 为 `flex`。
- 使用 `credit` 检查 Portal 返回的计划/模型访问元数据，包括存在时的 `subscription_tier: "flex"`。
- Flex 用户可以使用普通 AltLLM model IDs 和仅限 Flex 的 `altllm-flex-*` IDs 创建 API key allowlists，但须经过后端访问检查。

## Working Rules

- 当请求仅涉及一个领域时，优先使用聚焦技能。
- 当工作流跨越多个领域时，使用此统领技能，例如：
  - 登录 -> 创建 API key -> 验证 gateway 使用情况
  - credit -> transactions -> usage analytics
  - 充值 -> payment-status -> pay-payment-link
  - x402 报价 -> 钱包签名 -> 结算 -> 余额验证
- 行为发生变化时，确保实现与文档保持一致。

## Reference

参见 [references/skill-map.md](references/skill-map.md)，了解文件归属和命令到技能的映射。