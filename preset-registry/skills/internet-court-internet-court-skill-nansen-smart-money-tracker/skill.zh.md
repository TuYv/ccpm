---
name: nansen-smart-money-tracker
description: Smart money tracking — netflow, trades, holdings, perp trades. Use when finding what smart money wallets are buying/selling or tracking whale activity.
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
# 聪明钱

所有命令：`nansen research smart-money <sub> [options]`

## 子命令

```bash
# 净流入 — 聪明钱正在积累哪些代币？
nansen research smart-money netflow --chain solana --limit 10

# DEX 交易 — 聪明钱的实时现货交易
nansen research smart-money dex-trades --chain solana --labels "Smart Trader" --limit 20

# 持仓 — 聪明钱投资组合汇总
nansen research smart-money holdings --chain solana --limit 10

# 永续合约交易 — 仅限 Hyperliquid（无需 --chain）
nansen research smart-money perp-trades --limit 10
```

## 标签

使用 `--labels` 按聪明钱类别筛选：

| 标签 | 用例 |
|-------|----------|
| `Fund` | 加密基金 |
| `Smart Trader` | 历史表现最佳者 |
| `30D Smart Trader` | 近期热门 — 过去 30 天表现最佳者 |
| `90D Smart Trader` | 过去 90 天表现最佳者 |
| `180D Smart Trader` | 过去 180 天表现最佳者 |
| `Smart HL Perps Trader` | Hyperliquid 永续合约交易者中的佼佼者 |

```bash
nansen research smart-money netflow --chain solana --labels "Fund" --limit 10
```

## 标志

| 标志 | 用途 |
|------|---------|
| `--chain` | netflow/dex-trades/holdings 必需 |
| `--labels` | 按聪明钱标签筛选（多词值需要加引号） |
| `--limit` | 结果数量 |
| `--sort` | 排序字段:方向（例如 `value_usd:desc`） |
| `--fields` | 选择特定字段 |
| `--table` | 输出易读的表格 |
| `--format csv` | 导出 CSV |

## 注意事项

- `perp-trades` 仅限 Hyperliquid。没有 `--chain` 标志。
- 如需查看聪明钱持仓的时间序列：`nansen research smart-money historical-holdings --chain <chain> --days 30`