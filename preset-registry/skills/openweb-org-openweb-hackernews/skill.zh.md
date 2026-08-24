# Hacker News

## 概述
由 Y Combinator 推出的科技新闻聚合平台。通过 Algolia Search API 和 Firebase API（node-direct）读取数据。通过浏览器页面上下文写入数据。

## 工作流

### 浏览并阅读一篇文章
1. `getTopStories` → 选择文章 → 记下 `objectID`
2. `getStoryDetail(id)` → 获取标题、url、points、author、嵌套评论树

### 为文章点赞
1. `getTopStories` → 选择文章 → `objectID`
2. `upvoteStory(id=objectID)` → `{ok, id}`（需要登录）
3. `unvoteStory(id=${prev.upvoteStory.id})` → `{ok, id}` — 撤销点赞（仅在已点赞时有效）

### 评论文章
1. `getStoryDetail(id)` → `item.id`
2. `addComment(parent=item.id, text)` → `{ok, parent, id}` — `id` 是新评论的 id（需要登录）
3. `deleteComment(id=${prev.addComment.id})` → `{ok, id}` — 必须在 HN 约 2 小时的删除时限内执行

### 回复评论
1. `getStoryDetail(id)` → `children[]` → 选择评论 → `comment.id`
2. `addComment(parent=comment.id, text)` → `{ok, parent, id}` — 发布回复（需要登录）

### 查看用户
1. `getUserProfile(id)` → karma、created、about
2. `getUserSubmissions(id)` → 其发布的文章
3. `getUserComments(id)` → 其评论历史

### 查找来自某个域名的文章
1. `getStoriesByDomain(query)` → 所有链接到该域名的文章

### 阅读最新动态
1. `getNewComments` → 所有文章中的最新评论

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 传输方式 |
|-----------|--------|-----------|------------|-----------|
| getTopStories | 浏览热门文章 | — | objectID, title, url, author, points, num_comments | L1 node (Algolia) |
| getNewestStories | 浏览最新文章 | — | 同上 | L1 node (Algolia) |
| getBestStories | 历史得票最高的文章 | — | 同上 | L1 node (Algolia) |
| getAskStories | 最近的 Ask HN | — | 同上 | L1 node (Algolia) |
| getShowStories | 最近的 Show HN | — | 同上 | L1 node (Algolia) |
| getJobPostings | 浏览招聘信息 | — | objectID, title, url, created_at | L1 node (Algolia) |
| getFrontPageStories | 基于时间的首页文章 | — | 与信息流相同 | L1 node (Algolia) |
| getStoryDetail | 文章和评论树 | id（条目 ID） | id, title, url, points, children[] | L1 node (Algolia) |
| getUserProfile | 用户资料 | id（用户名） | id, karma, created, about | L1 node (Firebase) |
| getNewComments | 最新评论 | — | objectID, author, comment_text, story_title | L1 node (Algolia) |
| getStoryComments | 评论线程 | id, limit? | storyId, commentCount, comments[] | adapter (Algolia) |
| getStoriesByDomain | 最近的域名文章 | query（域名） | objectID, title, url, author, points | L1 node (Algolia) |
| getUserSubmissions | 用户发布的文章 | id（用户名） | objectID, title, url, author, points | adapter (Algolia) |
| getUserComments | 用户发表的评论 | id（用户名） | objectID, author, comment_text | adapter (Algolia) |
| upvoteStory | 为条目点赞 | id <- feeds/getStoryDetail | ok, id | adapter (page) |
| unvoteStory | 撤销点赞 | id <- upvoteStory | ok, id | adapter (page) |
| addComment | 发布评论 | parent <- getStoryDetail, text | ok, parent, id | adapter (page) |
| deleteComment | 删除自己的评论 | id <- addComment | ok, id | adapter (page)；约 2 小时时限 |

## 原始 Algolia 传输格式

读取操作通过 Node 传输访问 `https://hn.algolia.com/api/v1/search`。原始 Algolia 响应如下：

```json
{
  "hits": [ /* ... */ ],
  "nbHits": 1234,
  "hitsPerPage": 20,
  "page": 0,
  "nbPages": 50,
  "processingTimeMS": 3,
  "query": "",
  "params": "tags=story"
}
```

规范声明了 `unwrap: hits`，因此适配器/智能体只会接收到 `hits` 数组——外层封装（`nbHits`、`page` 等）会被运行时移除。

每条命中结果都包含由 Algolia 编入索引的字段：

- `objectID` — 以**字符串**形式表示的故事/评论 ID（如果需要数字，请进行类型转换）
- `title`、`url`、`author`、`points`、`num_comments`
- `story_text`、`comment_text` — HTML 字符串（请参阅下方说明）
- `created_at`（ISO）、`created_at_i`（Unix 秒）
- `_tags` — 例如 `["story", "author_pg", "story_12345"]`
- `story_id`、`parent_id` — 用于评论

### 模板化读取

某些读取操作会将 `id` 参数模板化到 Algolia 过滤器/标签表达式中：

- `getStoryComments` → `numericFilters=story_id={id}`
- `getUserSubmissions` → `tags=story,author_{id}`
- `getUserComments` → `tags=comment,author_{id}`

由于 `id` 被用作模板源，运行时**不会**将其作为独立的查询键发出——传输内容中只会出现插值后的过滤器/标签。

### 文本字段中的 HTML

`comment_text` 和 `story_text` 是 HTML 片段（通常包裹在 `<p>` 或 `<pre>` 中）。渲染时，应移除这些标签（并解码实体），而不是显示原始标记。

## 快速开始

```bash
# Browse top stories (node-direct, no browser needed)
openweb hackernews exec getTopStories '{}'

# Get story detail with full comment tree
openweb hackernews exec getStoryDetail '{"id": 42407357}'

# Get comments for a story (with limit)
openweb hackernews exec getStoryComments '{"id": 42407357, "limit": 10}'

# Look up a user (Firebase API)
openweb hackernews exec getUserProfile '{"id": "pg"}'

# User's submitted stories
openweb hackernews exec getUserSubmissions '{"id": "pg"}'

# Stories from a domain
openweb hackernews exec getStoriesByDomain '{"query": "github.com"}'

# Latest comments site-wide
openweb hackernews exec getNewComments '{}'

# Upvote a story (requires browser + login)
openweb hackernews exec upvoteStory '{"id": 42407357}'

# Reverse the upvote (only valid while currently upvoted)
openweb hackernews exec unvoteStory '{"id": 42407357}'

# Comment on a story (requires browser + login)
openweb hackernews exec addComment '{"parent": 42407357, "text": "Great article!"}'

# Delete your own comment (HN ~2-hour delete window)
openweb hackernews exec deleteComment '{"id": 47830121}'
```