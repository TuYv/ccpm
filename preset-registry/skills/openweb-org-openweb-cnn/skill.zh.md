# CNN

## 概述
美国主要的有线电视新闻网络。CNN.com 提供涵盖政治、国际、商业、健康、娱乐等领域的突发新闻、分析和视频内容。

## 工作流

### 搜索并阅读文章
1. `searchArticles(q)` → `title`、`url`（用作 `slug`）
2. `getArticle(slug)` → `title`、`body`、`author`、`publishedAt`

### 浏览头条新闻，然后深入阅读具体报道
1. `getHeadlines` → `title`、`url`（移除开头的 `/` 以获得 `slug`）
2. `getArticle(slug)` → `title`、`body`、`author`、`publishedAt`、`section`

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getHeadlines | 头条新闻 / 首页 | — | title, url, contentType | 入口，约 75 条 |
| getArticle | 完整文章内容 | slug <- getHeadlines/searchArticles `url` | title, body, author, publishedAt, section | 正文是通过 LD+JSON 获取的纯文本 |
| searchArticles | 按关键词查找文章 | q | title, url, description, date | 分页，每页约 10 条 |

## 快速开始

```bash
# Get front-page headlines
openweb cnn exec getHeadlines '{}'

# Get a specific article (use slug from headlines or search)
openweb cnn exec getArticle '{"slug": "2026/04/07/weather/super-el-nino-extreme-weather-climate-disaster"}'

# Search for articles
openweb cnn exec searchArticles '{"q": "climate change"}'
```