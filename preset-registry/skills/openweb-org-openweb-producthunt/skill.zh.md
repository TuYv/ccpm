# Product Hunt

## 概述
产品发现平台——每日精选科技产品、工具和初创公司，并支持社区投票。

## 工作流

### 浏览今日精选产品
1. `getToday` → `name`, `tagline`, `votesCount`, `dailyRank`, `slug`

### 搜索和探索产品
1. `searchProducts(query)` → `slug`, `name`, `reviewsRating`
2. `getPost(slug)` → `description`, `makers`, `categories`, `votesCount`

### 按时间分区浏览帖子
1. `getPosts(section)` → `slug`, `name`, `tagline`, `votesCount`, `dailyRank`
2. `getPost(slug)` → `description`, `makers`, `categories`

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getToday | 今日精选产品 | — | name, tagline, slug, votesCount, dailyRank, topics | 入口点 |
| getPosts | 按分区获取精选帖子 | section? (TODAY default) | name, tagline, slug, votesCount, dailyRank | 入口点，支持 YESTERDAY/LAST_WEEK/LAST_MONTH |
| getPost | 产品详情 | slug ← getToday/getPosts/searchProducts | name, description, votesCount, makers, categories | |
| searchProducts | 按关键词查找产品 | query | name, tagline, slug, reviewsRating | 入口点 |

## 快速开始

```bash
# Today's featured products
openweb producthunt exec getToday '{}'

# Yesterday's top products
openweb producthunt exec getPosts '{"section": "YESTERDAY"}'

# Search for products
openweb producthunt exec searchProducts '{"query": "ai"}'

# Get a specific product's details
openweb producthunt exec getPost '{"slug": "novavoice"}'
```