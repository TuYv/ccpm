# Instacart

## 概述
杂货配送市场。原型：餐饮配送。

## 工作流

### 搜索杂货
1. `searchProducts(query)` → 包含名称、价格、品牌和供货状态的商品

### 浏览商店的商品目录
1. `getStoreProducts(retailerSlug, slug)` → 某个部门中的商品
   - `retailerSlug` 是已知的商店 slug（例如 "costco"、"sprouts"、"publix"）
   - `slug` 是类别（例如 "produce"、"dairy"、"snacks"）

### 检查配送可用性
1. `getNearbyStores(postalCode)` → 包含 `retailerId` 和预计送达时间的商店

## 操作

| 操作 | 意图 | 主要输入 | 主要输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchProducts | 按关键词搜索杂货 | query | 商品（名称、价格、品牌、供货状态） | 入口点；还会返回自动补全建议 |
| getStoreProducts | 浏览商店部门 | retailerSlug（已知 slug）、slug（类别） | 商品（名称、价格、品牌）、集合信息 | 自动解析 shopId；入口点 |
| getNearbyStores | 查找包含预计送达时间的商店 | postalCode | 商店（retailerId、etaMinutes、etaDisplay） | 入口点；结果取决于 IP 地理位置 |

## 快速开始

```bash
# Search for groceries
openweb instacart exec searchProducts '{"query": "bananas", "limit": 5}'

# Browse Costco produce
openweb instacart exec getStoreProducts '{"retailerSlug": "costco", "slug": "produce", "first": 10}'

# Find nearby stores
openweb instacart exec getNearbyStores '{"postalCode": "90210"}'
```