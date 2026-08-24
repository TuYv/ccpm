# JD.com

## 概述
中国电商平台（京东）。通过 DOM 提取实现商品搜索、详情、评价和价格查询。

## 工作流

### 搜索并查看商品
1. `searchProducts(keyword)` → 返回包含 `skuId` 的商品
2. `getProductDetail(skuId)` → 完整的商品信息
3. `getProductPrice(skuId)` → 当前价格和促销信息

### 购买前查看评价
1. `searchProducts(keyword)` → 选择商品 → `skuId`
2. `getProductReviews(skuId)` → 评价数量、好评率和单条评价

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键词搜索商品 | keyword, page? | skuId, name, price, shopName, sales | 入口操作，每页 30 条 |
| getProductDetail | 按 SKU 获取商品详情 | skuId ← searchProducts | name, price, images, variants, reviewCount | pageConfig + DOM |
| getProductReviews | 按 SKU 获取商品评价 | skuId ← searchProducts | totalCount, goodRate, tags, reviews | DOM 提取 |
| getProductPrice | 按 SKU 获取商品价格 | skuId ← searchProducts | currentPrice, originalPrice, inStock, promotions | DOM 提取 |

## 快速开始

```bash
# Search for phones
openweb jd exec searchProducts '{"keyword":"手机"}'

# Get product detail
openweb jd exec getProductDetail '{"skuId":"100085781898"}'

# Get reviews
openweb jd exec getProductReviews '{"skuId":"100085781898"}'

# Get price
openweb jd exec getProductPrice '{"skuId":"100085781898"}'
```