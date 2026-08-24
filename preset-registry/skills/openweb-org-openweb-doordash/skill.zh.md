# DoorDash

## 概述
外卖配送平台——搜索餐厅、浏览菜单、查看订单历史、管理购物车。

## 工作流

### 搜索并浏览菜单
1. `searchRestaurants(query)` → 选择餐厅 → `storeId`
2. `getRestaurantMenu(storeId)` → 浏览分类 → 选择商品 → `itemId`、`name`、`displayPrice`、`menuBook.id`

### 添加到购物车，然后移除
1. `searchRestaurants(query)` → `storeId`
2. `getRestaurantMenu(storeId)` → 选择商品 → `itemId`、`name`（→ `itemName`）、`displayPrice`（→ 以美分为单位的 `unitPrice`）、`menuBook.id`（→ `menuId`）
3. `addToCart(storeId, itemId, itemName, currency='USD', unitPrice, menuId, quantity)` → `addCartItemV2.id`（→ `cartId`）、`addCartItemV2.orders[0].orderItems[0].id`（→ 用于移除操作的 `itemId`）
4. `removeFromCart(cartId, itemId)` → 更新后的购物车（购物车变空时，商品小计/订单为 `null`）

### 查看历史订单
1. `getOrderHistory(limit)` → 包含商品、总额和时间戳的订单列表

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchRestaurants | 按关键词搜索餐厅 | query | name, storeId, categories, imageUrl | 入口点；包含非门店结果（检查 resultType） |
| getRestaurantMenu | 获取门店详情和完整菜单 | storeId ← searchRestaurants | storeHeader, menuBook (id → menuId), itemLists (id, name, displayPrice) | 可选：menuId, fulfillmentType |
| getOrderHistory | 列出历史订单 | limit, offset | orders (store, items, grandTotal, timestamps) | 支持分页；需要身份验证 |
| addToCart | 将菜单商品添加到购物车 | storeId ← searchRestaurants; itemId, itemName, unitPrice（美分）, menuId ← getRestaurantMenu; currency='USD' | addCartItemV2.id (cartId), addCartItemV2.orders[0].orderItems[0].id | 写操作；服务端要求提供全部六个输入字段 |
| removeFromCart | 从购物车中移除商品 | cartId, itemId ← addToCart | removeCartItemV2（如果购物车变空，则 subtotal/orders 为 null） | 写操作；变更操作直接接受 `cartId`/`itemId`——无需 `RemoveCartItemInput` 包装器 |

## 快速开始

```bash
# Search for restaurants
openweb doordash exec searchRestaurants '{"query": "pizza"}'

# Get a restaurant's menu (returns itemId, name, displayPrice, menuBook.id)
openweb doordash exec getRestaurantMenu '{"storeId": "245613"}'

# View recent orders
openweb doordash exec getOrderHistory '{"limit": 5}'

# Add item to cart — all six fields required by upstream
openweb doordash exec addToCart '{"addCartItemInput": {"storeId": "245613", "itemId": "23864478062", "itemName": "12 Inch Plain Cheese Pizza", "currency": "USD", "unitPrice": 1440, "menuId": "57979746", "quantity": 1}}'

# Remove item from cart (cartId + itemId from addToCart response)
openweb doordash exec removeFromCart '{"cartId": "<addCartItemV2.id>", "itemId": "<addCartItemV2.orders[0].orderItems[0].id>"}'
```

## 已知限制

- `addCartItemInput` 需要六个字段（storeId、itemId、itemName、currency、以美分为单位的 unitPrice、menuId）——输入不完整会返回 `BAD_USER_INPUT`。所有值均来自 `getRestaurantMenu`；对于美国账户，`currency` 为 `"USD"`。
- 当被移除的商品是购物车中的最后一件商品时，`removeFromCart` 会为 subtotal/currencyCode/fulfillmentType/restaurant/orders 返回 null（仍会返回购物车 UUID）。
- 订单历史记录中的 `formattedAddress` 通常为 null。
- 搜索结果包含非门店项目（杂货建议）——可通过 `resultType` 进行筛选。