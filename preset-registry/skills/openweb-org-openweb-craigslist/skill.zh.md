# Craigslist

## 概述
经典的美国分类信息平台——可跨城市和类别搜索信息、查看信息详情以及浏览类别结构。采用纯服务端渲染的 HTML，不使用 JS 框架。

## 工作流

### 搜索并查看信息
1. `getCategories(city)` → 每个类别的 `code`、`name`、`section`
2. `searchListings(category, city, query)` → `title`、`price`、`url`、`postId`
3. 解析信息的 `url` → 提取 `category`、`slug`、`id`
4. `getListing(category, slug, id, city)` → `title`、`body`、`price`、`location`、`images`、`attributes`

### 快速搜索
1. `searchListings(category, city, query)` → `title`、`price`、`url`、`postId`
2. 解析 `url` → `category`、`slug`、`id` → 使用 `getListing` 获取完整详情

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchListings | 按类别和关键词搜索信息 | category（<- getCategories `code`）、city、query | title、price、url、postId | **入口点**；city 默认为 sfbay |
| getListing | 获取完整的信息详情 | category、slug、id（<- searchListings `url` 的路径部分）、city | title、body、price、location、images、attributes | |
| getCategories | 列出类别代码 | city | name、code、section | **入口点**；首页类别链接 |

## 快速开始

```bash
# Search SF apartments
openweb craigslist exec searchListings '{"category": "apa", "city": "sfbay", "query": "2br"}'

# Search NYC jobs
openweb craigslist exec searchListings '{"category": "jjj", "city": "newyork"}'

# Get listing details
openweb craigslist exec getListing '{"category": "apa", "slug": "sunny-2br-mission", "id": "7891234567", "city": "sfbay"}'

# Browse categories
openweb craigslist exec getCategories '{"city": "sfbay"}'
```

### 常用类别代码
- `apa` — 公寓/出租住房
- `roo` — 房间/合租
- `rea` — 待售房地产
- `jjj` — 工作
- `sss` — 所有待售物品
- `ccc` — 社区
- `ggg` — 零工
- `bbb` — 提供的服务