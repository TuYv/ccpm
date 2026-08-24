# Best Buy

## 概述
电子商务——电子产品零售商。提供三个读取 API（搜索、详情、定价），以及一对以服务器生成的 `lineId` 为键的写入 API（addToCart / removeFromCart）。

## 工作流

### 搜索并比较产品
1. `searchProducts(query)` → 建议词、类别、`skuId[]`
2. `getProductDetails(skuids ← searchProducts)` → 名称、图片、评分、评论数
3. `getProductPricing(skus ← searchProducts)` → 当前价格、常规价格、优惠金额、供货状态

### 将商品添加到购物车
1. `searchProducts(query)` → `skuId[]`
2. `getProductPricing(skus ← searchProducts)` → 确认 `purchasable=true`（部分 SKU 不支持在线销售）
3. `addToCart(skuId ← searchProducts)` → `cartCount`、`cartSubTotal`、`summaryItems[].lineId`

### 添加后再移除（往返操作）
1. `addToCart(skuId)` → `summaryItems[0].lineId`
2. `removeFromCart(lineId ← addToCart.summaryItems[0].lineId)` → `order.cartItemCount`、`order.lineItems[]`

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键词搜索 | query | terms, categories, skuId[] | 入口点 |
| getProductDetails | 按 SKU 获取产品信息 | skuids ← searchProducts | name, image, rating, reviewCount | 以逗号分隔的 SKU |
| getProductPricing | 按 SKU 获取定价 | skus ← searchProducts | currentPrice, regularPrice, savings, purchasable | 以逗号分隔的 SKU |
| addToCart | 将产品添加到购物车 | skuId ← searchProducts | cartCount, cartSubTotal, summaryItems[].lineId | 写入 / 谨慎操作；POST `/cart/api/v1/addToCart` |
| removeFromCart | 移除购物车条目 | lineId ← addToCart.summaryItems[0].lineId | order.cartItemCount, order.lineItems[] | 写入 / 谨慎操作；DELETE `/cart/item/{lineId}` |

## 快速开始

```bash
# Search for products
openweb bestbuy exec searchProducts '{"query":"hdmi cable","count":3}'

# Get product details
openweb bestbuy exec getProductDetails '{"skuids":"6472356,6430949"}'

# Pricing
openweb bestbuy exec getProductPricing '{"skus":"6472356"}'

# Add to cart — capture the returned lineId
openweb bestbuy exec addToCart '{"items":[{"skuId":"6472356"}]}'

# Remove from cart — uses path param, NOT a JSON body
openweb bestbuy exec removeFromCart '{"lineId":"<lineId-from-addToCart>"}'
```

## 已知限制
- **受 Akamai 保护**——所有请求均通过 `transport: page`，针对已打开的 `bestbuy.com` 标签页运行。直接 HTTP 请求会被阻止。
- **`removeFromCart` 需要有效的新 `lineId`**——该行 ID 由 `addToCart` 在服务器端生成，并且仅对相应的购物车条目有效。务必将这两个操作串联起来（或传入之前添加操作所返回的显式 `lineId`）。
- **并非每个 SKU 都支持在线销售**——`addToCart` 可能返回 HTTP 400 `ITEM_NOT_SELLABLE`（常见于电池、仅支持到店取货的商品）。请先检查 `getProductPricing` 的 `buttonState.purchasable`。