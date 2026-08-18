---
name: nansen-wallet-profiler
description: Wallet profiler — balance, PnL, labels, transactions, counterparties, related wallets, batch, trace, compare. Use when analysing a specific wallet address or comparing wallets.
metadata:
  openclaw:
    requires:
      env:
        - NANSEN_API_KEY
      bins:
        - nansen
    primaryEnv: NANSEN_API_KEY
    install:
      - kind: node
        package: nansen-cli
        bins: [nansen]
allowed-tools: Bash(nansen:*)
---
# 钱包画像

所有命令：`nansen research profiler <sub> [options]`

大多数命令都需要 `--address` 和 `--chain`。

## 余额与身份

```bash
nansen research profiler balance --address <addr> --chain ethereum
nansen research profiler labels --address <addr> --chain ethereum
nansen research profiler search --query "Vitalik"
```

## 盈亏

```bash
nansen research profiler pnl --address <addr> --chain ethereum --days 30
nansen research profiler pnl-summary --address <addr> --chain ethereum
```

## 交易与历史记录

```bash
nansen research profiler transactions --address <addr> --chain ethereum --limit 20
nansen research profiler historical-balances --address <addr> --chain solana --days 30
```

## 关系

```bash
nansen research profiler related-wallets --address <addr> --chain ethereum
nansen research profiler counterparties --address <addr> --chain ethereum --days 30
```

## 永续合约（无 `--chain`）

```bash
nansen research profiler perp-positions --address <addr>
nansen research profiler perp-trades --address <addr> --days 7
```

## 批量、追踪与比较

```bash
# 批量 — 一次分析多个钱包
nansen research profiler batch \
  --addresses "0xabc,0xdef" --chain ethereum \
  --include labels,balance,pnl

# 追踪 — BFS 多跳交易对手追踪（会发起 N*width 次 API 调用）
nansen research profiler trace --address <addr> --chain ethereum --depth 2 --width 5

# 比较 — 比较两个钱包之间的共同交易对手和代币
nansen research profiler compare --addresses "0xabc,0xdef" --chain ethereum
```

## 标志

| 标志 | 用途 |
|------|---------|
| `--address` | 钱包地址（必需） |
| `--chain` | 除永续合约和搜索外均为必需 |
| `--days` | 回溯时间范围（默认 30） |
| `--limit` | 结果数量 |
| `--include` | 批量字段：`labels,balance,pnl` |
| `--depth` | 追踪深度 1-5（默认 2） |
| `--width` | 追踪宽度 — 设置较低值以节省额度 |
| `--fields` | 选择特定字段 |
| `--table` | 人类可读的表格输出 |
| `--format csv` | CSV 导出 |

## 注意事项

- `pnl-summary` 不支持分页（返回聚合统计数据，而不是列表）。
- `perp-positions` 不支持分页。
- `labels` 不支持分页 — API 会忽略 `per_page`，始终返回该地址的所有标签。此子命令不提供 `--limit`。
- `transactions` 的 `per_page` 上限为 100（API 限制）。
- `trace` 会发起大量 API 调用 — 请谨慎使用 `--width`。
- `batch` 支持使用 `--file <path>`，每行一个地址，作为 `--addresses` 的替代方式。