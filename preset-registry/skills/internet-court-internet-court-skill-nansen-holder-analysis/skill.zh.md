---
name: nansen-holder-analysis
description: "Is this token held by quality wallets or retail noise? SM holder ratio, flow breakdown by label, and recent buyer quality."
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
# 持有者质量

**回答：**“该代币是由高质量钱包持有，还是充斥着散户噪音？”

```bash
TOKEN=<address> CHAIN=ethereum

nansen research token holders --token $TOKEN --chain $CHAIN --smart-money --limit 20
# → address, address_label, value_usd, ownership_percentage, balance_change_24h/7d/30d

nansen research token flow-intelligence --token $TOKEN --chain $CHAIN
# → net_flow_usd and wallet_count per label: smart_trader, whale, exchange, fresh_wallets

nansen research token who-bought-sold --token $TOKEN --chain $CHAIN --limit 20
# → address, address_label, bought/sold_volume_usd, bought/sold_token_volume, trade_volume_usd
```

危险信号：`fresh_wallets` 流入量高 + SM 持有者数量低。积极信号：前 20 名中出现 Fund/Smart Trader 标签。

注意：holders endpoint 不支持原生代币/包装代币。请使用具体的代币合约地址。