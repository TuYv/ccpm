# Home Depot

## 概述
家居装修零售商（原型：电子商务）。homedepot.com — 通过拦截 GraphQL 联邦网关，提供产品搜索、详情、评论、定价和门店库存信息。

## 工作流

### 查找和比较产品
1. `searchProducts(keyword)` → 浏览结果 → `itemId`
2. `getProductDetail(itemId)` → 完整规格、价格、库存情况

### 研究产品评论
1. `searchProducts(keyword)` → `itemId`
2. `getProductReviews(itemId)` → 客户评论、评分、照片

### 比较价格和促销
1. `searchProducts(keyword)` → `itemId`
2. `getProductPricing(itemId)` → 促销价、原价、促销活动、买一送一优惠

### 到店前查看门店库存
1. `searchProducts(keyword)` → `itemId`
2. `getStoreAvailability(itemId)` → 自提/配送选项、库存数量、门店信息

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键字搜索产品 | keyword | itemId, name, brand, price, rating, reviewCount | 入口点；导航至 /s/{keyword} |
| getProductDetail | 完整产品信息 | itemId <- searchProducts | name, brand, price, description, specs, images, availability | 使用 storeId/zipCode 获取本地定价 |
| getProductReviews | 客户评论 | itemId <- searchProducts | totalReviews, reviews (rating, text, author, photos, badges) | 数据源为 BazaarVoice；每页 10 条评论 |
| getProductPricing | 详细定价 | itemId <- searchProducts | price, originalPrice, promotions, conditionalPromotions, unitPricing | 包含买一送一和清仓信息 |
| getStoreAvailability | 门店自提/配送 | itemId <- searchProducts | fulfillmentOptions (pickup, delivery), in-stock quantity, store info | 使用浏览器当前的门店上下文 |

## 快速开始

```bash
# Search for products
openweb homedepot exec searchProducts '{"keyword": "cordless drill"}'

# Get full product details by item ID
openweb homedepot exec getProductDetail '{"itemId": "306283873"}'

# Product detail with local store pricing
openweb homedepot exec getProductDetail '{"itemId": "306283873", "zipCode": "10001"}'

# Get customer reviews
openweb homedepot exec getProductReviews '{"itemId": "306283873"}'

# Get detailed pricing info (promotions, unit pricing, clearance)
openweb homedepot exec getProductPricing '{"itemId": "306283873"}'

# Check store availability (pickup and delivery options)
openweb homedepot exec getStoreAvailability '{"itemId": "306283873"}'
```