---
name: cast
description: Charms CAST DEX workflows for order creation, cancellation/replacement, partial fulfillment, signing, and Bitcoin transaction verification.
metadata:
  oa:
    project: cast
    identifier: cast
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# Cast

## 概述

当任务需要使用 Charms 在 Bitcoin 上执行 CAST DEX 操作时，请使用此技能，包括订单生命周期管理、Scrolls nonce/地址派生、取消签名、部分成交、签名和交易验证。

## 环境

所需命令：

- `bash`、`curl`、`jq`、`envsubst`
- `charms`、`bitcoin-cli`
- `scrolls-nonce`、`sign-txs`、`cancel-msg`

所需构件/服务：

- CAST 应用二进制文件（`charms-cast-v0.2.0.wasm` 或最新的兼容 v11 的 CAST 构建版本）
- 由运营方签名的 `fulfill` 参数载荷
- Scrolls API 基础 URL
- 所有 spell 输入的 `prev_txs` 祖先数据
- maker 流程所需的手续费资金输入 UTXO（`CAST_FUNDING_UTXO`）
- v11 spell 文件（`version: 11`、`tx.*`、`app_public_inputs`）
- 通过 `--private-inputs` 传入的独立私有输入文件

## 工作流程

1. 针对你的操作路径运行预检：
- `scripts/check-cast-prereqs.sh maker`
- `scripts/check-cast-prereqs.sh taker`
- `scripts/check-cast-prereqs.sh cancel`
- `scripts/check-cast-prereqs.sh server`

2. 按照[订单生命周期](references/order-lifecycle.md)执行创建/检查/证明流程。

3. 对于 maker 编辑，请按照[取消并替换](references/cancel-and-replace.md)操作。

4. 对于 taker 成交，请按照[部分履约](references/partial-fulfillment.md)操作。

5. 对于签名和广播控制，请按照[签名与广播](references/signing-and-broadcast.md)操作。
6. 对于重复的自主执行，请按照[自动交易循环](references/autotrade-loop.md)操作。

7. 保持操作的确定性：
- 优先使用基于文件的输入，而不是内联 shell 字面量
- 对变更步骤先使用 dry-run
- 为每次运行持久化保存构件和回执
- 将 `tx.coins[*].dest` 编码为十六进制目标字节（通过 `charms util dest --addr ...` 派生）

## 快速命令

```bash
# Preflight
skills/cast/scripts/check-cast-prereqs.sh maker

# Derive Scrolls nonce + address
skills/cast/scripts/derive-scrolls-address.sh \
  --funding-utxo "<txid:vout>" \
  --output-index 0 \
  --scrolls-base-url "${CAST_SCROLLS_BASE_URL}"

# Migrate legacy CAST howto spell to v11 (split private inputs + convert coin dests)
skills/cast/scripts/cast-migrate-howto-v11.sh \
  --input /Users/christopherdavid/code/charms/cast-releases/docs/howto/03-partial-fulfill.yaml \
  --output-spell ./rendered/03-partial-fulfill.v11.yaml \
  --output-private-inputs ./rendered/03-partial-fulfill.private.v11.yaml

# Check + prove
skills/cast/scripts/cast-spell-check.sh \
  --spell ./rendered/create-order.yaml \
  --private-inputs-file ./rendered/create-order.private-inputs.yaml \
  --app-bin "${CAST_APP_BIN}" \
  --prev-txs-file "${CAST_PREV_TXS_FILE}"
skills/cast/scripts/cast-spell-prove.sh \
  --spell ./rendered/create-order.yaml \
  --private-inputs-file ./rendered/create-order.private-inputs.yaml \
  --app-bin "${CAST_APP_BIN}" \
  --prev-txs-file "${CAST_PREV_TXS_FILE}" \
  --change-address "bc1q..." \
  --mock
skills/cast/scripts/cast-spell-prove.sh \
  --spell ./rendered/create-order.yaml \
  --private-inputs-file ./rendered/create-order.private-inputs.yaml \
  --app-bin "${CAST_APP_BIN}" \
  --prev-txs-file "${CAST_PREV_TXS_FILE}" \
  --change-address "bc1q..."

# Sign + inspect
skills/cast/scripts/cast-sign-and-broadcast.sh --tx-json ./proofs/tx_to_sign.json --dry-run
skills/cast/scripts/cast-show-spell.sh --tx "<spell_tx_hex>"

# Run one automated iteration (safe defaults: mock prove + dry-run sign)
skills/cast/scripts/cast-autotrade-loop.sh \
  --config skills/cast/assets/autotrade-loop.config.example \
  --once

# Run continuous loop (explicitly controlled)
skills/cast/scripts/cast-autotrade-loop.sh \
  --config /absolute/path/to/autotrade.env \
  --interval-seconds 45 \
  --max-iterations 0 \
  --continue-on-error
```

## 参考资料

- [订单生命周期](references/order-lifecycle.md)
- [取消并替换](references/cancel-and-replace.md)
- [部分成交](references/partial-fulfillment.md)
- [签名与广播](references/signing-and-broadcast.md)
- [自动交易循环](references/autotrade-loop.md)