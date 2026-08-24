# CoinMarketCap

## 概述
加密货币市场数据和排名。通过 CoinMarketCap 的内部数据 API 获取实时价格、市值、交易量和热门代币。

## 工作流

### 浏览排名靠前的加密货币
1. `getListings(limit)` → `id`、名称、交易代码、quotes[].price、cmcRank
2. `getQuote(id)` → statistics.price、marketCap、volume24h、描述

### 查看特定币种的市场数据
1. `getListings(sortBy: "name")` → `id`
2. `getQuote(id)` → 价格、市值、供应量、ATH/ATL、百分比变化

### 发现热门币种
1. `getTrending(limit)` → `cryptoId`、tokenName、priceUsd
2. `getQuote(id=cryptoId)` → 热门币种的完整详情

## 操作

| 操作 | 用途 | 主要输入 | 主要输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getListings | 按市值排名靠前的币种 | start, limit, sortBy | cryptoCurrencyList[].name, symbol, quotes[].price, marketCap, cmcRank | 支持分页，默认排序：market_cap 降序 |
| getQuote | 币种价格/市场数据 | id <- getListings / getTrending.cryptoId | statistics.price, marketCap, volume24h, rank, ATH/ATL, description | 必须使用数字 ID（1=BTC，1027=ETH） |
| getTrending | 热门/热度上升的币种 | start, limit | list[].tokenName, tokenSymbol, priceUsd, volume24h, pricePercentageChange24h | 用于发现币种的入口 |

## 快速开始

```bash
# Get top 10 cryptocurrencies by market cap
openweb coinmarketcap exec getListings '{"limit":10}'

# Get Bitcoin details (id=1)
openweb coinmarketcap exec getQuote '{"id":1}'

# Get Ethereum details (id=1027)
openweb coinmarketcap exec getQuote '{"id":1027}'

# Get trending coins
openweb coinmarketcap exec getTrending '{"limit":10}'
```