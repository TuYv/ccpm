---
name: maestro
description: Maestro Symphony blockchain query operations for OpenAgents agents, including tip freshness checks, address/UTXO/runes queries, and production-safe troubleshooting against deployed Symphony API endpoints.
metadata:
  oa:
    project: maestro
    identifier: maestro
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# Maestro

## 概述

当智能体需要查询已部署的 Maestro Symphony API 以获取比特币链/索引数据、通过后端 bitcoind 链尖验证数据新鲜度，并在不暴露密钥的情况下执行安全的运维检查时，请使用此技能。

此技能采用 `docs/deploy/SYMPHONY_GCP_RUNBOOK.md` 中的 OpenAgents GCP 部署约定。

## 输入

查询前请设置以下环境变量：

- `SYMPHONY_BASE_URL`：Symphony API 的基础 URL。
- `SYMPHONY_NETWORK`：预期网络（`mainnet`、`testnet4` 或 `regtest`）。
- `BITCOIND_RPC_URL`：后端 RPC 端点。
- `BITCOIND_RPC_USER` / `BITCOIND_RPC_PASS`：后端 RPC 凭据。

请先运行预检：

```bash
skills/maestro/scripts/check-symphony-prereqs.sh
```

## 工作流程

1. 验证 API 存活状态并解析链尖。
2. 通过与 bitcoind 区块高度进行比较来验证链数据的新鲜度。
3. 调用地址/符文查询端点。
4. 实施安全控制（限制访问 `/dump`、不记录密钥、采用有界轮询）。

## 快速命令

```bash
curl -fsS "${SYMPHONY_BASE_URL}/tip" | jq .

ADDR="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
curl -fsS "${SYMPHONY_BASE_URL}/addresses/${ADDR}/tx_count" | jq .
curl -fsS "${SYMPHONY_BASE_URL}/addresses/${ADDR}/utxos" | jq .
curl -fsS "${SYMPHONY_BASE_URL}/addresses/${ADDR}/runes/balances" | jq .
```

## 参考资料

- [symphony-query-recipes](references/symphony-query-recipes.md)