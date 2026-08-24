# Etsy

## 概述
手工艺品与复古商品市场——可搜索商品、查看详情、店铺资料和评价。

## 工作流

### 搜索并查看商品
1. `searchListings(query)` → `listingId`、`shopName`
2. `getListingDetail(listingId)` → 标题、价格、描述、照片、卖家

### 阅读商品评价
1. `searchListings(query)` → `listingId`
2. `getReviews(listingId)` → averageRating、reviews[]

### 浏览店铺
1. `searchListings(query)` → `shopName`
2. `getShop(shopName)` → 评分、销量、所在地、店主

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchListings | 按关键词搜索商品 | query | listingId, title, price, shopName, rating | 入口点 |
| getListingDetail | 完整的商品信息 | listingId ← searchListings | title, price, description, photos, shopName, material | |
| getReviews | 商品评价 | listingId ← searchListings | averageRating, totalReviews, reviews[] | LD+JSON 提供约 4 条近期评价 |
| getShop | 店铺资料 | shopName ← searchListings | name, location, rating, sales, owner, activeListings | |

## 快速开始

```bash
# Search for handmade pottery
openweb etsy exec searchListings '{"query":"handmade pottery"}'

# Get listing details
openweb etsy exec getListingDetail '{"listingId":"168685596"}'

# Get reviews for a listing
openweb etsy exec getReviews '{"listingId":"168685596"}'

# Get shop profile
openweb etsy exec getShop '{"shopName":"nealpottery"}'
```