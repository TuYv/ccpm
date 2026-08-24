# Grubhub

## 概述
Grubhub 是一个食品配送平台（原型：食品配送）。可搜索餐厅、浏览包含价格的菜单，并查看配送时间和费用预估。

响应已经过**适配器精简**（采用 camelCase，价格以 USD 美元计）。字段简洁，可直接使用。

## 工作流

### 查找餐厅并浏览菜单
1. `searchRestaurants(latitude, longitude, searchTerm)` → `restaurants[]`，包含 `restaurantId`、`name`、评分和费用
2. `getMenu(restaurantId)` → `categories[].items[]`，包含名称和价格

### 查看配送详情
1. `searchRestaurants(latitude, longitude)` → `restaurants[].restaurantId`
2. `getDeliveryEstimate(restaurantId)` → 营业状态/营业时间、配送费、到店自取时间预估、最低订单金额

## 操作

| 操作 | 用途 | 关键输入 | 顶层结构 | 备注 |
|-----------|--------|-----------|-----------------|-------|
| searchRestaurants | 查找某个地点附近的餐厅 | latitude, longitude, searchTerm? | `{ totalResults, restaurants[] }` | 通过 `pageNum`/`pageSize` 分页 |
| getMenu | 浏览餐厅菜单 | restaurantId ← searchRestaurants | `{ restaurantName, categories[] }` | 菜单项位于 `categories[].items[]` 中 |
| getDeliveryEstimate | 查看配送时间和费用 | restaurantId ← searchRestaurants | `{ open, openDelivery, deliveryFee, orderMinimum, … }` | 金额以 USD 计；时间范围以分钟计 |

## 字段参考

### searchRestaurants — `restaurants[]`
- `restaurantId` — 唯一 ID（与 getMenu 和 getDeliveryEstimate 配合使用）
- `name` — 餐厅名称
- `rating` — 平均评分（0-5 分；评分数量过少时为 null）
- `ratingCount` — 评分数量
- `priceRating` — 价格档次（1-4，以美元符号表示）
- `cuisines` — 菜系字符串数组
- `logo` — 徽标 URL（可为 null）
- `deliveryFee` — 以 USD 计的配送费
- `deliveryEstimateMin` / `deliveryEstimateMax` — 以分钟计的配送时间范围（可为 null）
- `address` — 街道地址（可为 null）
- `distance` — 与配送地点之间的英里数（可为 null）
- `totalResults` — 匹配的餐厅总数（顶层）

### getMenu — `categories[]`
- `restaurantName` — 餐厅名称（顶层）
- `categories[].name` — 分类名称（例如“开胃菜”“披萨”）
- `categories[].items[].itemId` — 菜单项 ID
- `categories[].items[].name` — 菜单项名称
- `categories[].items[].description` — 菜单项描述（可为 null）
- `categories[].items[].price` — 以 USD 计的价格
- `categories[].items[].popular` — 热门标记

### getDeliveryEstimate
- `restaurantId` — 餐厅 ID
- `open` / `openDelivery` / `openPickup` — 可用状态标记
- `deliveryEstimateMin` / `deliveryEstimateMax` — 以分钟计的配送时间范围
- `pickupEstimateMin` / `pickupEstimateMax` — 以分钟计的到店自取时间范围（可为 null）
- `deliveryFee` — 以 USD 计的配送费
- `orderMinimum` — 以 USD 计的最低订单金额
- `salesTax` — 销售税率（例如 8.875 表示 8.875%）

## 快速开始

```bash
# Search for pizza near Midtown Manhattan
openweb grubhub exec searchRestaurants '{"latitude": 40.7484, "longitude": -73.9857, "searchTerm": "pizza"}'

# Get a restaurant's menu
openweb grubhub exec getMenu '{"restaurantId": "64436"}'

# Check delivery estimate
openweb grubhub exec getDeliveryEstimate '{"restaurantId": "64436"}'
```