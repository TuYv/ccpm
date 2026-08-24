# The Guardian

## 概述
英国及国际主要新闻媒体。通过 content.guardianapis.com 提供开放的公共 REST API，可用于搜索文章、获取完整内容以及浏览栏目资讯流。

## 工作流

### 搜索某个主题的文章
1. `searchArticles(q)` → `id`、webTitle、sectionId、webPublicationDate
2. `getArticle(ids=id)` → fields.body、fields.headline、fields.byline

### 浏览某个栏目的最新新闻
1. `getSectionFeed(section)` → `id`、webTitle、webPublicationDate
2. `getArticle(ids=id)` → 完整文章正文

### 跨栏目研究某个主题
1. `searchArticles(q, order-by: newest)` → 近期报道
2. `getSectionFeed(section)` → 比较不同栏目的报道

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchArticles | 按关键词查找文章 | q | id, webTitle, sectionId, webPublicationDate, fields | 入口，支持分页 |
| getArticle | 获取完整文章内容 | ids <- searchArticles / getSectionFeed | fields.body, fields.headline, fields.byline | body 为 HTML |
| getSectionFeed | 获取某个栏目的最新内容 | section | id, webTitle, webPublicationDate, fields | 默认按最新优先排序 |

## 快速开始

```bash
# Search for articles
openweb guardian exec searchArticles '{"q": "artificial intelligence"}'

# Get a specific article (use id from search results)
openweb guardian exec getArticle '{"ids": "technology/2025/dec/10/police-facial-recognition-technology-bias"}'

# Get latest technology articles
openweb guardian exec getSectionFeed '{"section": "technology"}'

# Get latest world news
openweb guardian exec getSectionFeed '{"section": "world"}'
```