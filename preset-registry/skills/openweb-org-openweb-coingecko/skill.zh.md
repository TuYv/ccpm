# CoinGecko

## 概述
加密货币数据聚合器。提供公共 REST API，用于搜索币种、查询价格和市场数据，以及查看热门代币。

## 工作流

### 查询币种的价格和详细信息
1. `searchCoins(query)` → `coins[].id`
2. `getCoinDetail(id)` → market_data.current_price, description, links, categories

### 查询多个币种的当前价格
1. `getPrice(ids, vs_currencies)` → `{coin_id: {currency: price}}`

### 按市值浏览排名靠前的币种
1. `getMarketData(vs_currency)` → `id`, current_price, market_cap, total_volume
2. `getCoinDetail(id)` → 获取特定币种的完整详细信息

### 发现热门币种
1. `getTrending()` → `coins[].item.id`, name, symbol, score
2. `getCoinDetail(id)` → 获取热门币种的详细信息

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchCoins | 按名称/符号查找币种 | query | coins[].id, name, symbol, market_cap_rank | 未知币种的入口点 |
| getCoinDetail | 获取币种的完整详细信息 | id <- searchCoins / getMarketData / getTrending | market_data.current_price, description, links, categories | 使用 localization=false 减少负载 |
| getMarketData | 获取按排名排列的市场概览 | vs_currency | id, current_price, market_cap, total_volume, price_change_24h | 支持分页，热门币种的入口点 |
| getTrending | 获取热门币种 | -- | coins[].item.id, name, symbol, score | 无参数，入口点 |
| getPrice | 快速查询价格 | ids, vs_currencies | {coin_id: {currency: price}} | 最快的价格查询方式，支持批量查询多个币种 |

## 快速开始

```bash
# Search for a coin
openweb coingecko exec searchCoins '{"query":"bitcoin"}'

# Get detailed coin info
openweb coingecko exec getCoinDetail '{"id":"bitcoin","localization":false,"tickers":false,"community_data":false,"developer_data":false}'

# Get top 20 coins by market cap
openweb coingecko exec getMarketData '{"vs_currency":"usd","per_page":20}'

# Get trending coins
openweb coingecko exec getTrending '{}'

# Get prices for multiple coins
openweb coingecko exec getPrice '{"ids":"bitcoin,ethereum,solana","vs_currencies":"usd","include_24hr_change":true}'
```