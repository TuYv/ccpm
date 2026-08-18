---
name: jupiter-swap-migration
description: Migration guide from Jupiter Metis (v1) or Ultra to Swap API v2. Use when migrating existing Jupiter swap integrations, updating base URLs, or transitioning from quote+swap-instructions to the unified build endpoint.
license: MIT
metadata:
  author: jup-ag
  version: "1.1.0"
tags:
  - jupiter
  - swap-migration
  - metis
  - ultra
  - swap-v2
  - jup-ag
---
# Jupiter Swap 迁移指南

将现有的 Jupiter swap 集成从 **Metis (v1)** 或 **Ultra** 迁移到统一的 **Swap API v2**。

**目标基础 URL**：`https://api.jup.ag/swap/v2`  
**身份验证**：来自 [developers.jup.ag](https://developers.jup.ag/) 的 `x-api-key`（不变）

## 使用/不使用场景

适用于：
- 迁移调用 `api.jup.ag/swap/v1/quote`、`api.jup.ag/swap/v1/swap-instructions` 或 `ultra-api.jup.ag` 的代码。
- 将 Jupiter swap 端点更新到 v2。
- 从 Metis 两步流程切换到统一的 `/build` 或 `/order` 端点。

不适用于：
- 从零开始构建新的 Jupiter 集成（请改用 `integrating-jupiter` skill）。
- 使用非 swap Jupiter API（Lend、Trigger、Recurring 等）。

**触发词**：`ultra`、`metis`、`ultra swap`、`ultra api`、`ultra-api.jup.ag`、`/ultra/v1`、`swap/v1`、`swap-instructions`、`migrate swap`、`ultra migration`、`metis migration`、`swap v1 to v2`、`v1 to v2`、`upgrade jupiter`、`swap-instructions deprecated`、`deprecated swap`、`old jupiter api`、`swap upgrade`、`update swap api`、`quote endpoint deprecated`、`swap stopped working`、`swap broken`、`ExactOut removed`、`swapMode removed`、`userPublicKey`、`parameter rename`、`addressLookupTable`、`response format changed`

---

## 迁移路径

| 来源 | 目标 | 工作量 | 选择时机 |
|--------|--------|--------|----------------|
| Ultra → `/order` | `GET /swap/v2/order` + `POST /swap/v2/execute` | 最小（仅更改 URL） | Ultra 用户的默认选择 |
| Metis → `/build` | `GET /swap/v2/build` | 中等（参数 + 响应映射） | 需要交易可组合性 |
| Metis → `/order` | `GET /swap/v2/order` + `POST /swap/v2/execute` | 中等（流程变更） | 不需要修改交易，希望使用托管执行 |

## 路径详情

每条路径都有专门的示例，其中包含迁移前后的代码、参数映射和响应变更：

- [路径 1：Ultra → `/order`](./examples/ultra-to-order.md) — 最小迁移，仅更改基础 URL
- [路径 2：Metis → `/build`](./examples/metis-to-build.md) — 将 2 次调用合并为 1 次，同时进行参数和响应映射
- [路径 3：Metis → `/order`](./examples/metis-to-order.md) — 切换为支持多路由器竞争的托管执行流程

---

## 迁移后检查清单

1. **URL 审计**：在代码库中搜索 `ultra-api.jup.ag`、`/ultra/v1/`、`/swap/v1/quote`、`/swap/v1/swap-instructions` —— 所有这些都应被替换
2. **参数重命名**：`userPublicKey` → `taker`（适用于 `/build` 路径）
3. **移除 `swapMode`**：V2 仅支持 `ExactIn`。如果使用 `ExactOut`，请重新设计流程 —— 此模式已不可用
4. **`slippageBps` 默认值**：如果省略，`/build` 默认使用 50 bps。对于 `/order`，如果你的集成依赖特定值，请确认默认值
5. **响应字段名称**：确认代码在 `/execute` 响应中使用 `inputAmountResult`/`outputAmountResult`（规范的 v2 字段名称）
6. **ALT 处理**：如果使用 `/build`，请将 `addressLookupTableAddresses`（数组）切换为 `addressesByLookupTableAddress`（对象）—— 移除 RPC ALT 解析代码
7. **费用事件解析**：V2 指令不会发出费用事件 —— 更新依赖这些事件的交易解析器
8. **路由计划格式**：如果解析路由计划，请使用 `bps` 字段（规范字段），而不是 `percent`
9. **错误代码**：更新错误处理，以匹配 [Swap v2 错误代码](https://developers.jup.ag/docs/swap/order-and-execute.md)
10. **测试**：使用小额在 devnet/mainnet 上运行端到端 swap，以进行验证

## 退役

在 Jupiter 停用 v1（`/swap/v1`）端点和 Ultra（`ultra-api.jup.ag`）域名后，移除此 skill。届时所有集成都已迁移到 v2。

**复查日期**：2026-09-01 —— 检查 v1/Ultra 端点是否已停用。

## 参考资料

迁移分为三个面向不同配置的指南（旧的单一 `migration` 页面已不再存在）：

- [迁移：Ultra → /order](https://developers.jup.ag/docs/swap/migration/ultra-to-order.md)
- [迁移：Metis → /build](https://developers.jup.ag/docs/swap/migration/metis-to-build.md)
- [迁移：Metis → Meta-Aggregator（/order + /execute）](https://developers.jup.ag/docs/swap/migration/metis-to-meta-aggregator.md)
- [Order 与 Execute](https://developers.jup.ag/docs/swap/order-and-execute.md)
- [Build](https://developers.jup.ag/docs/swap/build/index.md)
- [Swap 概览](https://developers.jup.ag/docs/swap/index.md)（路由和费用）
- [OpenAPI 规范](https://developers.jup.ag/docs/openapi-spec/swap/v2/swap.yaml)