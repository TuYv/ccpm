# eBay

## 概述
eBay——全球最大的拍卖与交易平台。电子商务的典型代表。

## 工作流

### 搜索并查看商品
1. `searchItems(keywords)` -> 返回包含 `itemId` 的结果
2. `getItemDetail(itemId)` -> 完整商品信息（标题、价格、出价、成色、配送）

### 调研卖家
1. `searchItems(keywords)` -> 返回包含卖家信息的结果
2. `getItemDetail(itemId)` -> 包含 `storeSlug` 的卖家卡片
3. `getSellerProfile(username)` -> 好评评分、已售商品数、关注者数

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchItems | 按关键词搜索商品列表 | keywords | itemId, title, price, condition, image | 入口，支持分页 |
| getItemDetail | 完整商品详情 | itemId <- searchItems | title, price, condition, seller, shipping, returns, brand, model, images | LD+JSON Product 架构 |
| getSellerProfile | 卖家信誉 | username <- getItemDetail.seller.storeSlug | storeName, positiveFeedback, itemsSold, followers | 使用 /str/ URL |

## 快速开始

```bash
# Search for items
openweb ebay exec searchItems '{"keywords": "vintage watch"}'

# Get item details (use itemId from search results)
openweb ebay exec getItemDetail '{"itemId": "358422352053"}'

# Get seller profile (use storeSlug from item detail)
openweb ebay exec getSellerProfile '{"username": "freegeekportland"}'
```