# Expedia

## 概述
旅行预订平台。通过 GraphQL APQ（自动持久化查询）搜索酒店和航班。

## 工作流

### 搜索并查看酒店
1. `searchHotels(destination, checkInDate, checkOutDate)` → `id`（propertyId）、名称、价格、评分
2. `getHotelDetail(propertyId)` → 设施、政策、位置、常见问题
3. `getHotelPrices(propertyId, checkInDate, checkOutDate)` → 每日房价、可订情况
4. `getHotelReviews(propertyId)` → 住客评分、评论文本、评分明细

### 搜索航班
1. `searchFlights(origin, destination, departureDate)` → 航空公司、时间、经停次数、价格
2. `getFlightDetail(origin, destination, departureDate)` → 相同数据，用于优化搜索结果

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchHotels | 按城市/日期查找酒店 | destination, checkInDate, checkOutDate | id, name, price, rating, photos | 入口；支持分页（offset, limit） |
| getHotelDetail | 酒店信息 | propertyId ← searchHotels | amenities, location, policies, FAQs | |
| getHotelPrices | 每日房价日历 | propertyId ← searchHotels, checkInDate, checkOutDate | 每日房价、约 240 天内的可订情况 | 拦截模式（导航至酒店页面） |
| getHotelReviews | 住客评论 | propertyId ← searchHotels | ratings, review text, reviewer info, score breakdown | 拦截模式（导航至酒店页面） |
| searchFlights | 按航线/日期查找航班 | origin, destination, departureDate | airline, times, stops, price | 入口；支持分页 |
| getFlightDetail | 航班信息 | origin, destination, departureDate | 与 searchFlights 相同 | 优化搜索的别名 |

## 快速开始

```bash
# Search hotels in New York
openweb expedia exec searchHotels '{"destination":"New York","checkInDate":"2026-05-01","checkOutDate":"2026-05-03"}'

# Get hotel detail
openweb expedia exec getHotelDetail '{"propertyId":"27924","checkInDate":"2026-05-01","checkOutDate":"2026-05-03"}'

# Get hotel prices for dates
openweb expedia exec getHotelPrices '{"propertyId":"27924","checkInDate":"2026-05-01","checkOutDate":"2026-05-03"}'

# Get hotel reviews
openweb expedia exec getHotelReviews '{"propertyId":"27924"}'

# Search flights NYC to LA
openweb expedia exec searchFlights '{"origin":"New York (NYC-All Airports)","destination":"Los Angeles (LAX-Los Angeles Intl.)","departureDate":"2026-05-10","returnDate":"2026-05-17"}'

# One-way flight search
openweb expedia exec getFlightDetail '{"origin":"San Francisco (SFO)","destination":"Chicago (ORD-O'\''Hare Intl.)","departureDate":"2026-06-15"}'
```