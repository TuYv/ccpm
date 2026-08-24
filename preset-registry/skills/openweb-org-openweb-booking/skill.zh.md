# Booking.com

## 概述
旅行平台——通过 Apollo SSR 缓存 + LD+JSON + GraphQL `page.evaluate` + DOM 实现酒店搜索、住宿详情、点评、客房定价和航班搜索。

## 工作流

### 查找酒店并查看价格
1. `searchHotels(ss, checkin, checkout)` → `hotels[].url` — 解析 URL `/hotel/{country}/{slug}.html` → `country`、`slug`
2. `getHotelDetail(country, slug)` ← searchHotels URL → 名称、评分、地址、描述
3. `getHotelPrices(slug)` ← searchHotels URL → 房型、床型、面积、设施（需要打开酒店页面）
4. `getHotelReviews(slug)` ← searchHotels URL → 评分、分项评分、精选点评（需要打开酒店页面）

### 搜索航班
1. `searchFlights(route, from, to, depart)` → 承运航空公司、时间、航程时长、经停次数、价格

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchHotels | 查找目的地酒店 | ss（查询）、checkin、checkout | name、url、price、rating、reviewCount | 入口点；解析 url → country、slug |
| getHotelDetail | 通过 URL 获取酒店信息 | country ← searchHotels url、slug ← searchHotels url | 原始 schema.org/Hotel LD+JSON（name、aggregateRating、address、image、priceRange） | 使用 `type_filter: Hotel` 进行声明式 `script_json` 提取——响应为原始 LD+JSON 块，未经重塑 |
| getHotelReviews | 点评摘要 | slug ← searchHotels url | score、subscores、featured reviews | 需要打开酒店详情页面 |
| getHotelPrices | 客房可订状态和定价 | slug ← searchHotels url | room name、bed、size、price、perNight | 需要打开酒店详情页面 |
| searchFlights | 按航线查找航班 | route（NYC-PAR）、from、to、depart | carrier、times、airports、duration、stops、price | flights.booking.com 子域名 |

## 快速开始

```bash
# Search hotels in New York
openweb booking exec searchHotels '{"ss":"New York","checkin":"2026-05-01","checkout":"2026-05-03"}'

# Get hotel details (extract country/slug from searchHotels URL)
openweb booking exec getHotelDetail '{"country":"us","slug":"riverside-tower","checkin":"2026-05-01","checkout":"2026-05-03"}'

# Get hotel reviews (hotel page must be open)
openweb booking exec getHotelReviews '{"slug":"riverside-tower"}'

# Get room pricing (hotel page must be open)
openweb booking exec getHotelPrices '{"slug":"riverside-tower"}'

# Search flights NYC to Paris
openweb booking exec searchFlights '{"route":"NYC-PAR","from":"NYC.CITY","to":"PAR.CITY","depart":"2026-05-01"}'
```

## getHotelDetail 响应结构

`getHotelDetail` 按原样返回原始 schema.org `Hotel` JSON-LD 块。易读名称映射（旧适配器公开的名称 → 原始字段路径）：

| 易读名称 | 原始 JSON-LD 路径 |
|---|---|
| rating | `aggregateRating.ratingValue`（Booking.com 采用 10 分制） |
| reviewCount | `aggregateRating.reviewCount` |
| street | `address.streetAddress` |
| city | `address.addressLocality` |
| region | `address.addressRegion` |
| postalCode | `address.postalCode` |
| country | `address.addressCountry` |
| image | `image`（字符串或 URL 数组） |
| priceRange | `priceRange` |

无需运行时重塑——使用者按其 schema.org 名称读取字段。