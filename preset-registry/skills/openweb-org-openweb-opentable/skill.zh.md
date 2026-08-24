# OpenTable

## 概述
餐厅预订平台——搜索餐厅、查看详情和评论、查询预订可用情况。商业型原型。

## 工作流

### 查找并预订餐厅
1. `searchRestaurants(term, location)` → `restaurantId`、`slug`
2. `getRestaurant(slug)` → 完整详情（营业时间、菜系、评分、地址）
3. `getAvailability(restaurantId, date, time, partySize)` → 可用的 `slots`，包含 `timeOffsetMinutes`

### 阅读餐厅评论
1. `searchRestaurants(term, location)` → `restaurantId`
2. `getReviews(restaurantId, page)` → 分页评论（每页 10 条）

### 按可用情况搜索
1. `searchRestaurants(term, location, date, time, covers)` → `restaurantId`
2. `getAvailability(restaurantId, date, time, partySize)` → `slots`，包含 `timeOffsetMinutes`、`seatingTypes`

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchRestaurants | 查找餐厅 | term, location | restaurantId, name, slug, cuisine, rating, neighborhood | 入口点；适配器（浏览器） |
| getRestaurant | 餐厅详情 | slug ← searchRestaurants | name, cuisine, ratings, hours, address, description, photos | 适配器（浏览器） |
| getAvailability | 查询可用时段 | restaurantId ← searchRestaurants, date, time, partySize | 包含 timeOffsetMinutes、seatingTypes 的 slots | 通过页面使用 GraphQL |
| getReviews | 顾客评论 | restaurantId ← searchRestaurants, page | reviewId, rating, text, displayName, dinedDate | 分页（每页 10 条）；通过页面使用 GraphQL |

## 快速开始

```bash
# Search for Italian restaurants in San Francisco
openweb opentable exec searchRestaurants '{"term": "italian", "location": "San Francisco"}'

# Get restaurant details
openweb opentable exec getRestaurant '{"slug": "ceron-kitchen-alameda"}'

# Check availability for 2 people
openweb opentable exec getAvailability '{"restaurantId": 1204381, "date": "2027-01-15", "time": "19:00", "partySize": 2}'

# Read reviews (page 1, newest first)
openweb opentable exec getReviews '{"restaurantId": 1204381, "page": 1}'
```