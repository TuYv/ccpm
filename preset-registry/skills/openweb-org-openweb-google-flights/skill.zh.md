# Google Flights

## 概述
航班搜索与定价——基于适配器从渲染后的 Google Flights 页面中提取 DOM 数据。

## 工作流

### 搜索某条航线的航班
1. `searchFlights(tfs)` → `flights[]`，包含航空公司、时间、价格、经停次数和时长

### 探索从出发地可前往的目的地
1. `exploreDestinations()` → `destinations[]`，包含 flightPrice、dates、stops
2. 为选定的目的地构建 `tfs` → 使用 `searchFlights(tfs)` 搜索具体航班

### 将搜索结果与价格洞察进行比较
1. `searchFlights(tfs)` → 当前航班选项和价格
2. `getPriceInsights(tfs)` → 最便宜/最贵的月份、价格趋势、热门航空公司
3. `getFlightOverview(tfs)` → 该航线的最低票价和最快直飞航班

所有基于 `tfs` 的操作共享同一个编码后的航线参数（来自 Google Flights URL）。

### 获取特定行程的预订详情
1. `searchFlights(tfs)` → 选择一个航班
2. `getFlightBookingDetails(tfs)` → 航段详情、行李政策、预订链接

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchFlights | 按航线和日期搜索航班 | tfs（编码后的航线+日期） | origin、destination、flights[].airline、price、stops、duration | 入口点；已验证 |
| getFlightOverview | 获取某条航线的最低票价和最快航班 | tfs（编码后的航线） | cheapestOptions[].price、airline、fastestFlight、nonstopFrequency | 入口点；使用相同的 tfs |
| getFlightBookingDetails | 获取包含行李信息的行程详情 | tfs（编码后的行程） | totalPrice、legs[].airline、duration、bagPolicies、bookWith | 入口点；使用相同的 tfs |
| exploreDestinations | 按预算浏览从出发地可前往的目的地 | —（可选 tfs） | destinations[].destination、flightPrice、hotelPricePerNight、dates | 入口点 |
| getPriceInsights | 获取月度价格趋势和预测 | tfs（编码后的航线） | priceTrend、cheapestMonth、mostExpensiveMonth、popularAirlines | 入口点；使用相同的 tfs |

## 快速开始

```bash
# Search flights RDU → LGA (tfs from Google Flights URL)
openweb google-flights exec searchFlights '{"tfs":"CBwQAhopEgoyMDI2LTA0LTMwagwIAhIIL20vMGZ2eWdyDQgDEgkvbS8wMl8yODYaKRIKMjAyNi0wNS0wNGoNCAMSCS9tLzAyXzI4NnIMCAISCC9tLzBmdnlnQAFIAXABggELCP___________wGYAQE"}'

# Explore destinations (default origin)
openweb google-flights exec exploreDestinations '{}'

# Price insights for a route
openweb google-flights exec getPriceInsights '{"tfs":"CBwQAhopEgoyMDI2LTA0LTMwagwIAhIIL20vMGZ2eWdyDQgDEgkvbS8wMl8yODYaKRIKMjAyNi0wNS0wNGoNCAMSCS9tLzAyXzI4NnIMCAISCC9tLzBmdnlnQAFIAXABggELCP___________wGYAQE"}'
```