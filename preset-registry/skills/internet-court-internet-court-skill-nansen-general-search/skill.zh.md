---
name: nansen-general-search
description: Search for tokens or entities by name. Use when you have a token name and need the full address, or want to find an entity.
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
# 搜索

```bash
nansen research search "jupiter" --type token
nansen research search "Vitalik" --type entity --limit 5
nansen research search "bonk" --chain solana --fields address,name,symbol,chain
```

| 标志 | 用途 |
|------|---------|
| `--type` | `token` 或 `entity` |
| `--chain` | 按链筛选 |
| `--limit` | 结果数量（默认 25，最大 50） |
| `--fields` | 选择特定的输出字段 |

不区分大小写。不支持按地址匹配，如需查询地址，请使用 `profiler labels`。