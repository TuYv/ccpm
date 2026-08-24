# BBC 新闻

## 概述
全球新闻——BBC 的公共新闻服务，涵盖全球、英国、商业、科技、体育等领域。

## 工作流

### 浏览头条新闻
1. `getHeadlines` → 返回热门新闻及其标题、描述、url、主题

### 阅读文章
1. `getHeadlines` 或 `searchArticles(q)` → `url`（路径中包含 `articleId`）
2. `getArticle(articleId)` → `title`、`body`、`publishedAt`、`byline`、`topics`

### 搜索新闻
1. `searchArticles(q)` → `title`、`description`、`url`

### 按主题浏览
1. `getTopicFeed(topic)` → `title`、`description`、`url`、`topic`

## 操作

| 操作 | 用途 | 主要输入 | 主要输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getHeadlines | 获取热门新闻 | — | title, description, url, topic, isLive | 入口点 |
| getArticle | 阅读完整文章 | articleId <- getHeadlines/searchArticles `url` | title, body, byline, publishedAt, topics | |
| searchArticles | 搜索新闻 | q | title, description, url | 支持分页 |
| getTopicFeed | 按主题浏览 | topic | title, description, url, topic | world, business, innovation, culture, arts, travel |

## 快速开始

```bash
# Get top headlines
openweb bbc-news exec getHeadlines '{}'

# Read a specific article (articleId from url path)
openweb bbc-news exec getArticle '{"articleId": "c62l597wl0yo"}'

# Search articles
openweb bbc-news exec searchArticles '{"q": "climate change"}'

# Get world news
openweb bbc-news exec getTopicFeed '{"topic": "world"}'
```