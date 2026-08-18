---
name: nansen-token-research
description: Token deep dive — info, OHLCV, holders, flows, flow intelligence, who bought/sold, DEX trades, PnL, perp trades, perp positions, perp PnL leaderboard. Use when researching a specific token in depth.
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
# Token 深入分析

所有命令：`nansen research token <sub> [options]`

现货端点需要 `--chain`。针对特定代币的端点请使用 `--token <address>`。

## 信息与价格

```bash
nansen research token info --token <addr> --chain solana
nansen research token ohlcv --token <addr> --chain solana --timeframe 1h
```

时间周期：`1m`、`5m`、`15m`、`30m`、`1h`、`2h`、`4h`、`1d`、`1w`、`1M`

## 持有者

```bash
nansen research token holders --token <addr> --chain solana
nansen research token holders --token <addr> --chain solana --smart-money
```

## 资金流

```bash
nansen research token flows --token <addr> --chain solana --days 7
nansen research token flow-intelligence --token <addr> --chain solana
nansen research token who-bought-sold --token <addr> --chain solana
```

`flow-intelligence` 按标签进行细分：鲸鱼、聪明交易者、交易所、新钱包、公众人物。

## DEX 交易

```bash
nansen research token dex-trades --token <addr> --chain solana --limit 20
```

## 盈亏

```bash
nansen research token pnl --token <addr> --chain solana --sort total_pnl_usd:desc
```

## 永续合约（无 `--chain`）

```bash
nansen research token perp-trades --symbol ETH --days 7
nansen research token perp-positions --symbol BTC
nansen research token perp-pnl-leaderboard --symbol SOL
```

## 标志

| 标志 | 用途 |
|------|---------|
| `--chain` | 现货端点必需（ethereum、solana、base 等） |
| `--token` | 代币地址（别名：`--token-address`） |
| `--symbol` | 永续合约端点的代币符号（例如 BTC） |
| `--timeframe` | OHLCV 时间间隔 |
| `--smart-money` | 仅筛选 SM 钱包（持有者） |
| `--days` | 回溯周期（默认 30） |
| `--sort` | 排序字段:方向（例如 `total_pnl_usd:desc`） |
| `--fields` | 选择特定字段 |
| `--table` | 输出人类可读的表格 |
| `--format csv` | 导出 CSV |

## 注意事项

- 永续合约端点使用 `--symbol`（例如 BTC），而不是 `--token`。
- 对于没有 SM 跟踪的代币，`holders --smart-money` 会返回 UNSUPPORTED_FILTER。
- 对于流动性不足的代币，`flow-intelligence` 可能会返回全部为零的资金流。