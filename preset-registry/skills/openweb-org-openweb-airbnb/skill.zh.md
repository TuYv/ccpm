# Airbnb

## 概述
旅游市场平台——通过 Node fetch 和直接调用 GraphQL API，提供住宿搜索、房源详情、评价、可订状态和房东资料。

## 工作流

### 查找住宿
1. `searchListings(query, checkin, checkout, adults)` → 选择房源 → `id`
2. `getListingDetail(id, check_in, check_out)` → 完整的房源信息、便利设施、房东信息和评分

### 评估房源
1. `getListingReviews(id)` → 房客评价和评分明细
2. `getListingAvailability(id, check_in, check_out)` → 价格、预订和政策信息

### 调研房东
1. `getHostProfile(hostId)` → 超赞房东状态、回复率、简介和房源列表

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchListings | 查找住宿地点 | query, checkin, checkout, adults | id, title, price, rating, photos | 入口点；每页 18 条结果 |
| getListingDetail | 完整房源信息 | id ← searchListings | title, description, overallRating, host, amenities | 需要房源 ID |
| getListingReviews | 房客评价 | id ← searchListings | reviews[], reviewsCount, overallRating, ratings | 适配器；直接调用 GraphQL API |
| getListingAvailability | 价格和可订状态 | id, check_in, check_out | calendarMonths[] (date, available, price) | 适配器；直接调用 GraphQL API |
| getHostProfile | 房东信息 | hostId ← getListingDetail | profile (superhost, response rate, about, listings) | 适配器；来自 /users/show/{hostId} 的浏览器 SSR |

## 快速开始

```bash
# Search listings in Tokyo
openweb airbnb exec searchListings '{"query":"Tokyo","checkin":"2026-05-01","checkout":"2026-05-03","adults":2}'

# Get listing details (use id from search results)
openweb airbnb exec getListingDetail '{"id":"20713816","check_in":"2026-05-01","check_out":"2026-05-03"}'

# Get reviews for a listing
openweb airbnb exec getListingReviews '{"id":"20713816"}'

# Get availability with dates
openweb airbnb exec getListingAvailability '{"id":"20713816","check_in":"2026-06-01","check_out":"2026-06-05"}'

# Get host profile (hostId from listing detail host section)
openweb airbnb exec getHostProfile '{"hostId":"70270073"}'
```