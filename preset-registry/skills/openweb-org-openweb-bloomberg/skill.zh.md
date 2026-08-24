# Bloomberg

## 概述
金融新闻和市场数据。通过 Bloomberg 的 Next.js SSR 数据获取头条新闻、突发新闻、市场行情栏、搜索结果、公司简介、股票图表和市场概览。

## 工作流

### 浏览市场新闻
1. `getTickerBar` → 市场概览（主要指数、债券和大宗商品及其价格）
2. `getNewsHeadlines` → 前 50 条编辑精选头条
3. `getLatestNews` → 突发/最新新闻信息流

### 研究公司
1. `searchBloomberg(query)` → 结果 URL 中包含股票代码（例如 `/quote/AAPL:US`）→ `ticker`
2. `getCompanyProfile(ticker)` → 名称、描述、行业、市值、员工人数
3. `getStockChart(ticker)` → 价格、价格变动、开盘价/当日最高价/当日最低价、1 年/5 年价格历史

### 市场概览
1. `getMarketOverview` → 指数、债券、大宗商品、货币及其价格和变动
2. `getTickerBar` → 主要证券的快速概览

### 搜索信息
1. `searchBloomberg(query)` → 新闻文章、行情、人物

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getTickerBar | 市场概览 | — | id, shortName, price, percentChange1Day | 入口；约 20 种证券 |
| getNewsHeadlines | 头条新闻 | — | headline, abstract, url, publishedAt, byline | 最多 50 篇报道 |
| getLatestNews | 突发新闻 | — | headline, abstract, url, publishedAt | 最多 30 篇报道 |
| searchBloomberg | 搜索 | query | headline, abstract, url, publishedAt, type | 新闻、行情、人物 |
| getCompanyProfile | 公司信息 | ticker <- searchBloomberg | name, description, sector, marketCap, employees | 子页面；可能被 PerimeterX 阻止 |
| getStockChart | 股票价格/图表 | ticker <- searchBloomberg | price, change, open/high/low, priceHistory1Y/5Y | 子页面；延迟 15 分钟 |
| getMarketOverview | 市场指数 | — | indices, bonds, commodities, currencies | 子页面；按资产类别分类 |

## 快速开始

```bash
# Market overview — top indices/bonds/commodities
openweb bloomberg exec getTickerBar '{}'

# Top news headlines
openweb bloomberg exec getNewsHeadlines '{}'

# Latest breaking news
openweb bloomberg exec getLatestNews '{}'

# Search for AI news
openweb bloomberg exec searchBloomberg '{"query":"artificial intelligence"}'

# Company profile (requires /profile/company/AAPL:US tab open)
openweb bloomberg exec getCompanyProfile '{"ticker":"AAPL:US"}'

# Stock chart with price history (requires /quote/AAPL:US tab open)
openweb bloomberg exec getStockChart '{"ticker":"AAPL:US"}'

# Market overview — indices, bonds, commodities, currencies (requires /markets tab open)
openweb bloomberg exec getMarketOverview '{}'
```