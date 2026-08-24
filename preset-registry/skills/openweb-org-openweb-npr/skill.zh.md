# NPR（美国国家公共广播电台）

## 概述
美国主要的公共媒体新闻机构。其公开的 Algolia 搜索索引提供完整的文章内容，包括正文、作者、日期、主题和音频可用性。

## 工作流

### 搜索某个主题的文章
1. `searchArticles(query)` → `objectID`、`title`、`bodyText`
2. `getArticle(objectID)` → 完整的 `bodyText`、`topics`、`bylines`

### 获取今日头条
1. `getTopStories()` → `objectID`、`title`、`displayDate`
2. `getArticle(objectID)` → 完整的 `bodyText`、`topics`、`image`

### 研究某个主题
1. `searchArticles(query, hitsPerPage: 20)` → `objectID`、`title`、`topics`
2. 使用 `filters: "type:story AND topics:\"Health\""` 按主题筛选，以获取特定版块的结果
3. `getArticle(objectID)` → 完整的 `bodyText`、`bylines`

## 操作

| 操作 | 用途 | 主要输入 | 主要输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchArticles | 按关键词查找文章 | query | objectID, title, bodyText, bylines, displayDate | 入口，支持分页（page 从 0 开始计数） |
| getArticle | 完整文章内容 | objectID ← searchArticles/getTopStories | bodyText（完整）、title、bylines、topics、image | 正文为纯文本 |
| getTopStories | 最新的首页新闻 | — | objectID, title, bodyText, displayDate, topics | 入口，已预先筛选为首页新闻 |

## 快速开始

```bash
# Search for articles
openweb npr exec searchArticles '{"query": "artificial intelligence"}'

# Get a specific article (use objectID from search results)
openweb npr exec getArticle '{"objectID": "nx-s1-5777587"}'

# Get latest top stories
openweb npr exec getTopStories '{}'

# Search with pagination
openweb npr exec searchArticles '{"query": "economy", "hitsPerPage": 20, "page": 1}'
```