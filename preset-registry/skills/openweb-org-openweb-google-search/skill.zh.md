# Google 搜索

## 概述
搜索引擎（原型：搜索）。Google.com — 通过页面 DOM 提取自动补全建议、自然网页/图片/新闻/视频/购物结果、本地商家信息包、知识面板、其他用户还问了这些问题以及相关搜索。

## 工作流

### 结合上下文研究主题
1. `searchSuggestions(q)` → `completions[]`，用于优化查询
2. `searchWeb(q)` → 每条结果包含 `title`、`link`、`snippet`
3. `getPeopleAlsoAsk(q)` → `questions[]`，用于深入探索
4. `getRelatedSearches(q)` → `searches[]`，用于后续查询

### 比较产品
1. `searchSuggestions(q)` → `completions[]`，用于优化产品搜索词
2. `searchShopping(q)` → `title`、`price`、`merchant`、`reviewCount`
3. `searchWeb(q)` → 评论文章的 `title`、`link`、`snippet`

### 获取实体信息
1. `searchWeb(q)` → 实体名称的 `title`、`link`、`snippet`
2. `getKnowledgePanel(q)` → `title`、`subtitle`、`description`、`facts[]`

### 查找本地商家
1. `searchLocal(q)` → `name`、`rating`、`reviews`、`type`、`address`
2. `searchWeb(q)` → 补充性的 `title`、`link`、`snippet` 结果

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchSuggestions | 自动补全结果 | q, client=chrome | 补全字符串 | 入口点，节点传输 |
| searchWeb | 自然网页搜索结果 | q | title, link, displayUrl, snippet | 入口点，页面提取 |
| searchImages | 图片结果 | q | sourceUrl, alt, width, height | 页面，使用 udm=2 导航 |
| searchNews | 新闻文章 | q | title, link, source, snippet, publishedAt | 页面，使用 tbm=nws 导航 |
| searchVideos | 视频结果 | q | title, link, source, snippet | 页面，使用 tbm=vid 导航 |
| searchShopping | 商品列表 | q | title, price, originalPrice, merchant, reviewCount | 页面，使用 udm=28 导航 |
| getKnowledgePanel | 实体事实信息 | q（实体名称） | title, subtitle, description, facts[] | 页面，仅限实体查询 |
| getPeopleAlsoAsk | 相关问题 | q | questions[], count | 页面，来自 PAA 框 |
| getRelatedSearches | 后续查询 | q | searches[], count | 页面，来自页面底部 |
| searchLocal | 本地商家 | q（位置查询） | name, rating, reviews, type, address | 页面，地图信息包结果 |

## 快速开始

```bash
# Autocomplete suggestions (node transport, no browser needed)
openweb google-search exec searchSuggestions '{"q": "best laptop", "client": "chrome"}'

# Web search results (requires browser with google.com open)
openweb google-search exec searchWeb '{"q": "best laptop 2025"}'

# Image search
openweb google-search exec searchImages '{"q": "aurora borealis"}'

# News search
openweb google-search exec searchNews '{"q": "technology"}'

# Shopping results
openweb google-search exec searchShopping '{"q": "wireless headphones"}'

# Knowledge panel for an entity
openweb google-search exec getKnowledgePanel '{"q": "Albert Einstein"}'

# People Also Ask
openweb google-search exec getPeopleAlsoAsk '{"q": "what is python"}'

# Related searches
openweb google-search exec getRelatedSearches '{"q": "machine learning"}'

# Local businesses
openweb google-search exec searchLocal '{"q": "coffee shops near times square"}'
```