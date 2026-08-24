# IMDB

## 概述
IMDB 是全球最受欢迎的电影和电视数据库。数据通过 GraphQL API（`api.graphql.imdb.com`）获取——无需身份验证。评分直方图通过 SSR 回退机制获取。

## 工作流

### 搜索并获取电影详情
1. `searchTitles(q)` → `imdbId`、标题、年份、评分
2. `getTitleDetail(imdbId)` → 完整详情（剧情、演职人员、评分、类型、片长）

### 查看评分明细
1. `searchTitles(q)` → `imdbId`
2. `getRatings(imdbId)` → 投票直方图（1-10 分布）

### 获取演职人员
1. `searchTitles(q)` → `imdbId`
2. `getCast(imdbId)` → 导演、编剧、演员

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchTitles | 按关键词搜索电影/电视节目 | q | imdbId, title, year, rating, genres, plot | GraphQL mainSearch |
| getTitleDetail | 获取完整的影片信息 | imdbId ← searchTitles | title, plot, runtime, genres, credits, rating | GraphQL title() |
| getRatings | 获取评分明细 | imdbId ← searchTitles | aggregateRating, histogram (1-10) | GraphQL + 影片页面 LD+JSON + SSR 直方图 |
| getCast | 获取演职人员 | imdbId ← searchTitles | credits, actors, directors, creators | GraphQL principalCredits |

## 快速开始

```bash
# Search for movies
openweb imdb exec searchTitles '{"q": "inception"}'

# Get full title details
openweb imdb exec getTitleDetail '{"imdbId": "tt1375666"}'

# Get ratings breakdown
openweb imdb exec getRatings '{"imdbId": "tt0111161"}'

# Get cast and crew
openweb imdb exec getCast '{"imdbId": "tt0111161"}'
```