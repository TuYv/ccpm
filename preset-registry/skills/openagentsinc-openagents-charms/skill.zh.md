---
name: charms
description: Charms workflows for Bitcoin app contracts, spell proving, and UTXO asset operations.
metadata:
  oa:
    project: charms
    identifier: charms
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# Charms

## 概述

集成并操作 Charms，以支持可编程比特币资产。当任务需要进行 Charms 应用开发、创建 spell 和生成证明、提交 commit 和 spell 交易、检查现有交易中的 spell、查看钱包 charm 库存，或集成 API 和钱包时，请使用此技能。

## 环境

- 需要 `bash`、`curl` 和 `jq`。
- 需要 `charms` CLI。
- 对于应用开发，需要 Rust 和 `wasm32-wasip1` 目标。
- 对于比特币施法和钱包流程，需要连接到节点的 `bitcoin-cli`（使用 testnet4 可快速迭代）。

此技能用于具体实现和操作，而非通用协议理论。

## 工作流

1. 首先选择执行路径：
- 应用和 spell 生命周期（新建应用、构建、验证密钥、检查、证明、提交）。
- spell 模式和验证调试。
- 钱包和 API 集成（`wallet list`、`tx show-spell`、`server` 端点）。

2. 运行预检：
- `scripts/check-charms-prereqs.sh app`
- `scripts/check-charms-prereqs.sh spell`
- `scripts/check-charms-prereqs.sh wallet`
- `scripts/check-charms-prereqs.sh server`

3. 对于应用和 spell 操作，请遵循 [应用和 spell 工作流](references/app-and-spell-workflow.md)：
- 使用 `charms app new` 搭建应用脚手架。
- 构建应用并派生应用验证密钥。
- 使用 `charms spell check` 验证 spell。
- 使用 `charms spell prove` 生成可供打包提交的交易。

4. 对于模式和验证问题，请使用 [spell 格式和验证](references/spell-format-and-validation.md)：
- 确认应用标识符和验证密钥。
- 确认 `ins` 和 `outs` 与交易实际情况一致。
- 将私有输入保留在链下，并通过私有输入文件路径传递它们。

5. 对于钱包和 API 接口，请使用 [钱包和服务器集成](references/wallet-and-server-integration.md)：
- 检查钱包中携带 charm 的输出。
- 从已知交易中解码 spell 内容。
- 运行 `charms server`，并以 JSON 或 CBOR 模式调用 `/spells/prove`。

6. 应用执行安全约束：
- 迭代期间使用低价值 UTXO 和 testnet4。
- 在验证 commit 和 spell 交易的十六进制数据之前，切勿提交打包交易。
- 不要将证明器和钱包密钥写入日志或源代码管理系统。

## 快速命令

```bash
# App scaffold and build
charms app new my-token
cd my-token
app_bin="$(charms app build)"
charms app vk "$app_bin"

# Spell validation and proving
cat ./spells/mint-nft.yaml | envsubst | charms spell check --app-bins="$app_bin" --prev-txs="$prev_txs"
cat ./spells/mint-nft.yaml | envsubst | charms spell prove --app-bins="$app_bin" --prev-txs="$prev_txs" --funding-utxo="$funding_utxo" --funding-utxo-value="$funding_utxo_value" --change-address="$change_address"

# Wallet and tx inspection
charms wallet list --json
charms tx show-spell --chain bitcoin --tx "$tx_hex" --json

# API server
charms server --ip 0.0.0.0 --port 17784
```

## 参考文件

- [应用和 spell 工作流](references/app-and-spell-workflow.md)：从应用脚手架搭建、检查、证明、签名到打包提交的端到端流程。
- [spell 格式和验证](references/spell-format-and-validation.md)：spell 字段、应用映射、证明和版本检查，以及常见故障模式。
- [钱包和服务器集成](references/wallet-and-server-integration.md)：钱包解析、交易检查、API 服务器使用，以及钱包 UI 集成路径。