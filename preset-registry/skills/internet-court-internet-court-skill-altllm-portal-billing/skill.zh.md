---
name: altllm-portal-billing
description: Use this skill when the user asks to inspect AltLLM Portal balance, redeem a promo code, review billing transactions, or view usage analytics by period, model, or API key using the local altllm CLI. Do NOT use for API key lifecycle management or payment-link execution.
user-invocable: true
---
# AltLLM 门户计费

用于本地 `altllm` CLI 的余额、促销、交易历史和使用分析。

## 共享设置

> 在全新检出中运行第一个 `altllm` 命令之前，请阅读并遵循：
> - `../_shared/preflight.md`
> - `../_shared/session-and-target.md`

## 命令索引

| 命令 | 用途 |
|---|---|
| `credit` | 当前门户余额、到期时间和允许使用的模型 |
| `redeem-promo` | 兑换促销代码 |
| `transactions` | 支持分页和类型筛选的计费交易历史 |
| `usage-summary` | 当前日历月摘要 |
| `usage-timeline` | 每日使用历史 |
| `usage-by-model` | 按模型分组的使用情况 |
| `usage-by-key` | 按 API 密钥分组的使用情况 |

## 规则

- 这些命令使用已保存的门户会话令牌。
- 历史记录命令大多返回原始的门户 API JSON。
- `credit` 是当前 CLI 检查门户返回的计划/模型访问元数据的途径，其中包括在存在时返回的 Business/Flex 字段，例如 `subscription_tier: "flex"`。
- `transactions` 支持 `--page`、`--limit` 和 `--type`。
- `usage-summary` 目前仅反映当前日历月。
- 未传递日期标志时，`usage-timeline`、`usage-by-model` 和 `usage-by-key` 默认使用当前 UTC 月。
- 使用情况命令支持使用 `--month`，或使用完整的显式日期范围。
- `balance` 是 `credit` 的别名。

## 参考

有关筛选器、示例和代表性输出，请参阅 [references/cli-reference.md](references/cli-reference.md)。