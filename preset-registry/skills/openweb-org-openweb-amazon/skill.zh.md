# Amazon

## 概述
电子商务市场——搜索商品、查看详情、阅读评论、浏览优惠、管理购物车。

## 工作流

### 搜索并查看商品详情
1. `searchProducts(k)` → 包含 `asin` 的商品列表
2. `getProductDetail(asin)` → 完整的商品信息（名称、价格、品牌、评分）
3. `getProductReviews(asin)` → 客户评论

### 浏览优惠
1. `searchDeals(startIndex, pageSize)` → 包含价格和徽章的优惠商品
2. `getProductDetail(asin)` ← 来自优惠商品的 asin → 完整的商品信息

### 发现热门商品
1. `getBestSellers` → 按排名排列的畅销商品

### 购物车操作
1. `searchProducts(k)` → `asin`
2. `addToCart(asin)` → `cartCount`、`subtotal`
3. `getCart` → 包含 `asin`、`title`、`quantity`、`subtotal` 的购物车商品
4. `removeFromCart(asin ← getCart)` → 更新后的购物车

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键词搜索商品 | k（查询词） | asin, title, price, rating | 入口点；支持分页（page 参数） |
| getProductDetail | 查看完整的商品信息 | asin ← searchProducts | name, price, brand, description, rating, reviewCount | DOM 选择器提取 |
| getProductReviews | 阅读客户评论 | asin ← searchProducts | rating, title, body, author, date | 支持分页（pageNumber）；sortBy：recent/helpful |
| searchDeals | 浏览当前优惠 | startIndex, pageSize | asin, title, price, dealBadge, percentClaimed | JSON API；支持分页（nextIndex） |
| getBestSellers | 查看畅销商品 | — | title, price, rating, link | 入口点 |
| addToCart | 将商品添加到购物车 | asin ← searchProducts, quantity? | success, cartCount, subtotal | 写入操作；点击 Add to Cart，并通过购物车 JSON API 验证 |
| removeFromCart | 从购物车移除商品 | asin ← getCart | success, cartCount, subtotal | 写入操作；addToCart 的逆向操作；在购物车中点击 Delete |
| getCart | 查看购物车内容 | — | items (asin, title, price, quantity), subtotal | JSON API + DOM 信息补充 |

## 快速开始

```bash
# Search for products
openweb amazon exec searchProducts '{"k": "laptop"}'

# Get product details by ASIN
openweb amazon exec getProductDetail '{"asin": "B00MVWGQX0"}'

# Get product reviews
openweb amazon exec getProductReviews '{"asin": "B00MVWGQX0"}'

# Browse current deals
openweb amazon exec searchDeals '{"startIndex": 1, "pageSize": 20}'

# View best sellers
openweb amazon exec getBestSellers '{}'

# Add product to cart
openweb amazon exec addToCart '{"asin": "B00MVWGQX0"}'

# Remove product from cart
openweb amazon exec removeFromCart '{"asin": "B00MVWGQX0"}'

# View cart
openweb amazon exec getCart '{}'
```