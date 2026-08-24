# Kayak

## 概述
旅行元搜索引擎——搜索 100 多家提供商的航班和酒店。

## 工作流

### 搜索航班
1. `searchFlights(origin, destination, departureDate, returnDate)` → 返回包含 `resultId`、`legs`、`segments` 的结果
2. 结果包含指向提供商网站（Southwest、United 等）的预订 URL
3. 使用 `legs` 映射获取航程时长和时间，使用 `segments` 映射获取航空公司和航班详情

### 搜索酒店
1. `searchHotels(destination, checkInDate, checkOutDate)` → 返回包含酒店名称、评分和价格的结果
2. 结果包含多家提供商的价格，便于比较

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchFlights | 查找航班 | origin, destination, departureDate | results, legs, segments, airlines | 如果提供 returnDate，则搜索往返航班 |
| searchHotels | 查找酒店 | destination, checkInDate, checkOutDate | 包含提供商价格的 results | 在 destination 中使用连字符 |

## 快速开始

```bash
# Search round-trip flights SFO → NYC
openweb kayak exec searchFlights '{"origin":"SFO","destination":"NYC","departureDate":"2026-05-15","returnDate":"2026-05-22"}'

# Search hotels in New York
openweb kayak exec searchHotels '{"destination":"New-York","checkInDate":"2026-05-15","checkOutDate":"2026-05-20","guests":2}'
```