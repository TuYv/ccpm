# Bluesky

## 概述
Bluesky AT Protocol 社交网络——去中心化微博客。公共读取 API 位于 `public.api.bsky.app`，写入操作通过用户的 PDS（Personal Data Server）执行。

## 工作流

### 浏览用户的个人资料和帖子
1. `getProfile(actor)` → 显示名称、简介、关注者数量
2. `getAuthorFeed(actor)` → 用户的帖子 → `post.uri`
3. `getPostThread(uri)` → 包含回复线程的完整帖子

### 搜索和探索
1. `searchActors(q)` → 查找用户 → `actor.handle`
2. `getProfile(handle)` → 用户的完整个人资料
3. `searchPosts(q)` → 查找帖子（需要身份验证）

### 浏览信息流
1. `getFeed(feed)` → 发现/热门帖子 → `post.uri`
2. `getPostThread(uri)` → 展开帖子及其回复

### 社交关系图谱
1. `getFollowers(actor)` → 关注某用户的人
2. `getFollows(actor)` → 某用户关注的人

### 与帖子互动
1. `getAuthorFeed(actor)` 或 `getFeed(feed)` → 查找帖子 → `uri`、`cid`
2. `likePost(uri, cid)` → 点赞记录 `uri`
3. `repost(uri, cid)` → 转发记录 `uri`
4. 回复：`getPostThread(uri)` → 父帖子 `uri`、`cid`；线程根帖子 → `rootUri`、`rootCid`
5. `createPost(text, replyTo={uri, cid, rootUri, rootCid})` → 回复的 `uri`、`cid`

### 撤销互动
1. `getAuthorFeed(actor)` 或 `getPostThread(uri)` → 包含 `viewer.like`、`viewer.repost` 的帖子
2. `unlikePost(uri=viewer.like)` → 移除点赞
3. `unrepost(uri=viewer.repost)` → 移除转发
4. `deletePost(uri)` → 删除自己的帖子（`uri` ← getAuthorFeed）

### 管理关注、屏蔽和静音
1. `getProfile(actor)` → `did`、`viewer.following`、`viewer.blocking`、`viewer.muted`
2. `follow(subject=did)` → 关注记录 `uri`
3. `unfollow(uri=viewer.following)` → 取消关注
4. `blockUser(subject=did)` → 屏蔽记录 `uri`
5. `unblockUser(uri=viewer.blocking)` → 取消屏蔽
6. `muteUser(actor)` / `unmuteUser(actor)` → 切换静音状态（直接使用 handle 或 DID）

### 通知
1. `getNotifications(limit)` → 点赞、转发、关注、提及、回复

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getProfile | 用户个人资料 | `actor`（handle 或 DID） | did、handle、displayName、bio、关注者数/关注数/帖子数 | 入口点 |
| getAuthorFeed | 用户的帖子 | `actor` ← getProfile | feed[].post（uri、text、author、embeds、计数） | cursor 分页 |
| getPostThread | 带回复的帖子 | `uri` ← getAuthorFeed/getFeed | thread.post（text、author、embeds、点赞数/转发数/回复数/引用数/收藏数）、thread.replies[] | depth 参数控制回复深度 |
| getFeed | 自定义信息流 | `feed`（信息流生成器的 AT URI） | feed[].post | cursor 分页，使用已知的信息流 URI |
| searchPosts | 搜索帖子 | `q` | posts[]、hitsTotal | 通过 bsky.app 进行身份验证（localStorage_jwt） |
| searchActors | 搜索用户 | `q` | 包含个人资料信息的 actors[] | cursor 分页 |
| getFollowers | 用户的关注者 | `actor` ← getProfile | followers[] 个人资料 | cursor 分页 |
| getFollows | 用户关注的人 | `actor` ← getProfile | follows[] 个人资料 | cursor 分页 |
| getPosts | 批量获取帖子 | `uris[]` ← getAuthorFeed/getFeed | posts[] | 最多 25 个 URI |
| createPost | 发布帖子 | `text`、`replyTo` ← getPostThread（`uri`、`cid`、`rootUri`、`rootCid`）、`langs` | uri、cid | 需要身份验证，写入；replyTo 可选 |
| deletePost | 删除帖子 | `uri` ← createPost/getAuthorFeed | 成功 | 需要身份验证，写入 |
| likePost | 点赞帖子 | `uri`、`cid` ← getAuthorFeed/getFeed/getPostThread | 点赞记录 uri、cid | 需要身份验证，写入 |
| unlikePost | 取消帖子点赞 | `uri` ← 帖子的 `viewer.like` | 成功 | 需要身份验证，写入 |
| repost | 转发 | `uri`、`cid` ← getAuthorFeed/getFeed/getPostThread | 转发记录 uri、cid | 需要身份验证，写入 |
| unrepost | 撤销转发 | `uri` ← 帖子的 `viewer.repost` | 成功 | 需要身份验证，写入 |
| follow | 关注用户 | `subject`（DID）← getProfile | 关注记录 uri、cid | 需要身份验证，写入 |
| unfollow | 取消关注用户 | `uri` ← 个人资料的 viewer.following | 成功 | 需要身份验证，写入 |
| blockUser | 屏蔽用户 | `subject`（DID）← getProfile | 屏蔽记录 uri、cid | 需要身份验证，写入 |
| unblockUser | 取消屏蔽用户 | `uri` ← 个人资料的 viewer.blocking | 成功 | 需要身份验证，写入 |
| muteUser | 将用户静音 | `actor`（handle 或 DID） | 成功 | 需要身份验证，写入 |
| unmuteUser | 取消用户静音 | `actor`（handle 或 DID） | 成功 | 需要身份验证，写入 |
| getNotifications | 通知 | `limit`、`cursor` | notifications[]（reason、author、record） | 需要身份验证，cursor 分页 |

## 快速开始

```bash
# Get a user profile
openweb bluesky exec getProfile '{"actor": "bsky.app"}'

# Get a user's posts
openweb bluesky exec getAuthorFeed '{"actor": "bsky.app", "limit": 10}'

# View a post thread (use uri from getAuthorFeed)
openweb bluesky exec getPostThread '{"uri": "at://did:plc:.../app.bsky.feed.post/...", "depth": 6}'

# Browse a trending feed
openweb bluesky exec getFeed '{"feed": "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot", "limit": 10}'

# Search users
openweb bluesky exec searchActors '{"q": "developer", "limit": 10}'

# Create a post (requires auth)
openweb bluesky exec createPost '{"text": "Hello world!", "langs": ["en"]}'

# Like a post (requires auth, get uri/cid from feed)
openweb bluesky exec likePost '{"uri": "at://did:plc:.../app.bsky.feed.post/...", "cid": "bafyrei..."}'

# Follow a user (requires auth, get DID from getProfile)
openweb bluesky exec follow '{"subject": "did:plc:..."}'

# Get notifications (requires auth)
openweb bluesky exec getNotifications '{"limit": 10}'
```