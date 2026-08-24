# Medium

## 概述
博客与内容发布平台。内容平台的典型代表。通过 Medium 的 GraphQL API 搜索文章、浏览主题信息流、发现精选列表、探索作者、为文章鼓掌、关注作者以及保存书签。

## 工作流

### 按主题浏览文章
1. `getRecommendedTags` → 选择标签 → `tagSlug`
2. `getTagFeed(tagSlug)` → 获取包含 `postId` 的文章
3. `getArticle(postId)` → 获取完整文章详情

### 搜索并阅读
1. `searchArticles(query)` → 获取包含标题和 URL 的结果
2. 选择文章 URL → 从 URL 中提取 `postId`
3. `getArticle(postId)` → 获取完整详情

### 探索某个主题的作者
1. `getTagWriters(tagSlug)` → 获取包含 `userId`、简介和关注者数量的作者/出版物

### 发现精选内容
1. `getTagCuratedLists(tagSlug)` → 获取员工精选的阅读列表
2. 列表中包含带有 `postId` 的文章 → `getArticle(postId)`

### 与内容互动（需要登录）
1. `getTagFeed(tagSlug)` → `posts[].postId`
2. `clapArticle(postId ← posts[].postId, numClaps?)` → `clapCount`、`viewerClapCount`（numClaps 为 1–50，默认为 1）
3. `saveArticle(postId ← posts[].postId)` → `catalogItemId`
4. `unsaveArticle(postId ← posts[].postId)` → 适配器通过 `getPredefinedCatalog().itemsConnection` 解析 `postId → catalogItemId`，然后发出删除请求

### 关注作者（需要登录）
1. `getTagWriters(tagSlug)` → 获取包含 `userId` 的作者
2. `followWriter(userId ← getTagWriters)` → `isFollowing`
3. `unfollowWriter(userId)` → 取消关注

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchArticles | 按关键词搜索文章 | query | title, subtitle, url | DOM 提取；入口点 |
| getArticle | 获取完整文章详情 | postId ← getTagFeed/searchArticles | title, author, claps, readingTime, isLocked | GraphQL PostDetailQuery |
| getTagFeed | 获取某个标签的最新文章 | tagSlug | posts[], pageInfo | GraphQL；支持分页 |
| getTagCuratedLists | 获取某个标签的精选阅读列表 | tagSlug | lists[] with post items | GraphQL |
| getTagWriters | 获取某个标签的推荐作者 | tagSlug, first?, after? | publishers[], pageInfo | GraphQL；支持分页 |
| getRecommendedFeed | 获取热门/高热度文章 | limit? | posts[] with feedId, reason | GraphQL；登录后提供个性化内容 |
| getRecommendedTags | 获取热门主题标签 | — | tags[] with slug | 入口点 |
| getPostClaps | 获取文章的鼓掌数 | postId ← getTagFeed | postId, clapCount | GraphQL |
| getRecommendedWriters | 获取推荐关注的作者 | — | publishers[] | GraphQL |
| clapArticle | 为文章鼓掌（点赞） | postId | clapCount, viewerClapCount | SAFE 写入；需要身份验证 |
| followWriter | 关注作者 | userId ← getTagWriters | isFollowing | SAFE 写入；需要身份验证 |
| saveArticle | 保存到阅读列表 | postId | saved, catalogItemId | SAFE 写入；需要身份验证 |
| unfollowWriter | 取消关注作者 | userId ← getTagWriters | isFollowing | CAUTION 写入；需要身份验证 |
| unsaveArticle | 从阅读列表中移除 | postId | removed | CAUTION 写入；需要身份验证 |

## 快速开始

```bash
# Search for articles
openweb medium exec searchArticles '{"query":"machine learning"}'

# Get articles for a topic
openweb medium exec getTagFeed '{"tagSlug":"programming"}'

# Get article detail
openweb medium exec getArticle '{"postId":"70d2a62246c0"}'

# Get trending tags
openweb medium exec getRecommendedTags '{}'

# Get recommended writers
openweb medium exec getRecommendedWriters '{}'
```