# Costco

## 概述
电商仓储式会员店。支持商品搜索、详情查看、评论、仓库定位、配送选项、购物车管理和商品比较。

## 工作流

### 查找并评估商品
1. `searchProducts(query)` → 返回包含 `itemNumber` 的商品列表
2. `getProductDetail(itemNumber)` → 价格、描述、属性、评分
3. `getProductReviews(productId)` → 评论摘要、评分分布、推荐百分比

### 购买前比较商品
1. `searchProducts(query)` → 查找候选商品 → `itemNumber` 列表
2. `compareProducts(itemNumbers)` → 并排比较价格、品牌、评分和属性
3. `getDeliveryOptions(itemNumber)` → 每件商品的配送/自提可用性

### 检查仓库库存
1. `findWarehouses(latitude, longitude)` → 返回附近仓库及其 `warehouseId`
2. `getWarehouseDetails(warehouseId)` → 完整营业时间、服务和设施
3. `checkWarehouseStock(itemNumber, warehouseNumber)` → 店内有货或仅限线上，以及价格

### 浏览和发现
1. `searchSuggestions(query)` → 自动补全建议，用于优化搜索
2. `browseCategory(category)` → 按部门浏览商品，并提供可用筛选条件

### 购物车管理（需要登录）
1. `searchProducts(query)` → `itemNumber`
2. `addToCart(itemNumber, quantity)` → `orderItemId`
3. `updateCartQuantity(orderItemId, quantity)` → 更新数量
4. `removeFromCart(orderItemId)` → 移除商品

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键词搜索 | query | itemNumber, title, brands, pills | 入口，支持分页（pageSize, offset） |
| searchSuggestions | 自动补全 | query | term, type | 入口 |
| getProductDetail | 商品详情 | itemNumber ← searchProducts | price, rating, attributes, buyable | price=0 表示“在购物车中查看” |
| getMultipleProducts | 批量查询商品 | itemNumbers ← searchProducts | 每件商品的 price, brand, rating | |
| compareProducts | 并排比较 | itemNumbers ← searchProducts (2+) | price, brand, rating, attributes | |
| getProductReviews | 评论摘要 | productId ← searchProducts | totalReviews, averageRating, distribution | 导航页面（BV 小组件） |
| getDeliveryOptions | 检查配送/自提 | itemNumber ← searchProducts | options[].type, available, membershipRequired | 类型：shipping, business_delivery, warehouse_pickup |
| browseCategory | 按部门浏览 | category | products, availableFilters | 入口，支持分页 |
| findWarehouses | 查找附近仓库 | latitude, longitude | warehouseId, name, address, hours, services | 入口 |
| getWarehouseDetails | 完整仓库信息 | warehouseId ← findWarehouses | hours, services[].name/hours, has* 布尔值 | |
| checkWarehouseStock | 店内库存情况 | itemNumber ← searchProducts, warehouseNumber ← findWarehouses | inWarehouse, onlineOnly, price | |
| addToCart | 添加到购物车 | itemNumber ← searchProducts | orderItemId | 写入操作，需要登录。导航到 PDP；抓取 JWT + SKU |
| removeFromCart | 从购物车移除 | orderItemId ← addToCart | success | 写入操作，需要登录。导航到 /CheckoutCartView |
| updateCartQuantity | 更改购物车商品数量 | orderItemId ← addToCart, quantity | success | 写入操作，需要登录。导航到 /CheckoutCartView |

## 快速开始

```bash
# Search for products
openweb costco exec searchProducts '{"query": "laptop"}'

# Get product details (use itemNumber from search)
openweb costco exec getProductDetail '{"itemNumber": "100978861"}'

# Get review summary
openweb costco exec getProductReviews '{"productId": "4000373324"}'

# Find nearby warehouses
openweb costco exec findWarehouses '{"latitude": 37.35, "longitude": -121.95, "limit": 3}'

# Check delivery options
openweb costco exec getDeliveryOptions '{"itemNumber": "100978861", "zipCode": "95050"}'

# Browse a category
openweb costco exec browseCategory '{"category": "Electronics"}'

# Compare products side by side
openweb costco exec compareProducts '{"itemNumbers": ["100978861", "4000373324"]}'

# Cart workflow (requires logged-in Costco session in managed Chrome)
openweb costco exec addToCart '{"itemNumber": "100978861", "quantity": 1}'
# → returns { orderItemId: <int>, orderId, ... } — pass orderItemId to next step
openweb costco exec updateCartQuantity '{"orderItemId": "<from above>", "quantity": 2}'
openweb costco exec removeFromCart '{"orderItemId": "<from above>"}'
```

## 已知限制

- **购物车写入操作需要登录。** 托管 Chrome 中必须存在有效的 Costco 会话（从默认 Chrome 复制 Cookie）。如果没有，addToCart 会收到 Akamai 返回的 403。
- **购物车编辑操作受页面限制。** removeFromCart/updateCartQuantity 每次调用时都会从 `/CheckoutCartView` 的隐藏输入中抓取 `catalogEntryId` 和 WCS `authToken`——它们仅适用于用户购物车中当前存在的商品。
- **两种不同的 authToken 格式。** PDP 添加操作使用 Microsoft B2C JWT（sessionStorage `authToken_<userHash>`）；购物车编辑操作使用 WCS `userId,signature` 令牌（购物车页面的隐藏输入）。两者不可互换。