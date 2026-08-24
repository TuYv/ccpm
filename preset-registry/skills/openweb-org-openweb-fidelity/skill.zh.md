# Fidelity

## 概述
金融服务平台。提供来自 Fidelity Investments 的股票报价、市场指数、共同基金研究、公司简介和新闻。

## 工作流

### 查询股票
1. `getQuote(symbol)` → lastPrice、volume、peRatio、marketCap、52 周区间
2. `getCompanyProfile(symbols)` → sector、industry、employeeCount、description
3. `getNewsHeadlines(symbol)` → headlines[].text、provider、impactRating

### 研究共同基金
1. `listAssetClasses` → `code` (mstarAssetClassCd)、categories[].`code` (mstarCtgyCd)
2. `searchFunds(searchFilter)` → funds[].fundInformation.`cusip`、ticker、legalName
3. `getFundPicks(mstarAssetClassCd, mstarCtgyCd)` → funds[].fundInformation.`cusip`、ticker
4. `getFundPerformance(cusip)` → 年初至今及 1/3/5/10 年年化回报率
5. `getFundSummary(cusip)` → composition、ratings、fees、top10Holdings

### 市场概览
1. `getMarketSummary` → quotes[].label、lastPrice、pctChgToday（标普 500、道琼斯工业平均指数、纳斯达克指数）
2. `getIndexQuotes(symbol)` → quotes[].name、pctChgToday（全球指数、货币）

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getQuote | 实时股票价格 | symbol | lastPrice, netChgToday, pctChgToday, volume, marketCap | 适配器：fidelity-api |
| getMarketSummary | 美国主要指数 | — | quotes[].label, lastPrice, netChgToday | 适配器：fidelity-api，入口点 |
| getCompanyProfile | 公司详细信息 | symbols[] | companyName, sector, industry, employeeCount | 适配器：fidelity-api |
| getNewsHeadlines | 股票/市场新闻 | symbol | headlines[].text, provider, resDate, impactRating | 适配器：fidelity-api |
| getIndexQuotes | 全球指数/外汇 | symbol（以逗号分隔） | quotes[].name, pctChgToday | 适配器：fidelity-api |
| getResearchData | 分析师评级/持仓 | apiTokenName, params | 因 apiTokenName 而异 | 适配器：fidelity-api，代理端点 |
| getCompanyLogo | 公司徽标 URL | fvSymbols | 徽标 URL | 适配器：fidelity-api |
| searchFunds | 浏览/筛选共同基金 | searchFilter, pageNumber, noOfRowsPerPage | funds[].fundInformation, mstarOverallRating | 基金研究入口点 |
| listAssetClasses | 资产类别/分类代码 | — | code, description, categories[] | 筛选入口点 |
| listFundFamilies | 基金家族名称 | — | code, description | 入口点 |
| getFundPicks | 推荐基金 | mstarAssetClassCd, mstarCtgyCd ← listAssetClasses | fundPicks.funds[].ticker, legalName, mstarOverallRating | |
| getFundPerformance | 基金年化回报率 | cusip ← searchFunds/getFundPicks | performanceAverageAnnualReturns | CUSIP 来自基金搜索 |
| getFundSummary | 基金构成/费用 | cusip ← searchFunds/getFundPicks | fundInformation, details (expenseRatio, NAV), top10Holdings, quarterEndAverageAnnualReturns | CUSIP 来自基金搜索 |

## 快速开始

```bash
# Get a stock quote
openweb fidelity exec getQuote '{"symbol":"AAPL"}'

# Get market summary
openweb fidelity exec getMarketSummary '{"supportCrypto":"N"}'

# Search mutual funds (all US equity funds)
openweb fidelity exec searchFunds '{"searchFilter":{"includeLeveragedAndInverseFunds":"N","openToNewInvestors":"OPEN","investmentTypeCode":"MFN"},"sortBy":"legalName","sortOrder":"ASC","currentPageNumber":1,"businessChannel":"RETAIL","noOfRowsPerPage":10,"subjectAreaCode":"fundInformation,mstarRatings"}'

# Get Fidelity fund picks (large blend domestic stock)
openweb fidelity exec getFundPicks '{"mstarAssetClassCd":"DSTK","mstarCtgyCd":"LB"}'

# Get fund performance (FXAIX = Fidelity 500 Index Fund, CUSIP 315911750)
openweb fidelity exec getFundPerformance '{"cusip":"315911750","funduniverse":"RETAIL","documentId":"315911750"}'
```