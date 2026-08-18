---
name: nansen-prediction-markets
description: "Polymarket screeners — discover trending events, top markets by volume, and search for specific markets. Use when browsing what's happening on prediction markets."
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
# 预测市场筛选器

所有命令：`nansen research prediction-market <sub> [options]`（别名：`nansen research pm <sub>`）

无需 `--chain` 标志 — Polymarket 运行在 Polygon 上。

```bash
# 热门事件（相关市场的分组）
nansen research pm event-screener --sort-by volume_24hr --limit 20
# → event_title, market_count, total_volume, total_volume_24hr, total_liquidity, total_open_interest, tags

# 按 24 小时交易量排列的热门市场
nansen research pm market-screener --sort-by volume_24hr --limit 20
# → market_id, question, best_bid, best_ask, volume_24hr, liquidity, open_interest, unique_traders_24h

# 搜索特定市场
nansen research pm market-screener --query "bitcoin" --limit 10

# 查找已结算/已关闭的市场
nansen research pm market-screener --status closed --limit 10

# 浏览类别
nansen research pm categories --pretty
# → category, active_markets, total_volume_24hr, total_open_interest
```

排序选项：`volume_24hr`、`volume`、`volume_1wk`、`volume_1mo`、`liquidity`、`open_interest`、`unique_traders_24h`、`age_hours`

筛选器默认返回活跃/开放的市场。对于已结算的市场，请使用 `--status closed`。