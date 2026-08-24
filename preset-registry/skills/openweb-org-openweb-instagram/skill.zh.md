# Instagram

## 概述
社交媒体平台（Meta）。用于分享照片/视频、快拍和 Reels。

## 工作流

### 查找用户个人资料
1. `getUserProfile(username)` → 包含 `id`、个人简介、粉丝数/关注数的用户信息

### 浏览用户的帖子（按用户名）
1. `getUserPosts(username, count)` → 包含 `pk`、`code`、说明文字、点赞数和用户信息的帖子
2. `getUserPosts(username, count, max_id)` → 下一页（游标来自 `next_max_id`）

### 浏览用户的帖子（按 ID）
1. `getUserProfile(username)` → `id`
2. `getFeed(id, count)` → 包含 `pk`、`code`、说明文字和点赞数的帖子
3. `getFeed(id, count, max_id)` → 下一页（游标来自 `next_max_id`）

### 查看帖子评论
1. `getPostComments(id)` → 包含文本、作者信息和点赞数的评论
   - `id` 是来自 `getFeed` 或 `getUserPosts` 条目（`items[].pk`）的数字 PK
2. `getPostComments(id, min_id)` → 下一页（游标来自 `next_min_id`）

### 查看特定帖子
1. `getPost(id)` → 包含说明文字、点赞、评论和媒体 URL 的媒体详情
   - `id` 是来自 `getFeed` 条目（`items[].pk`）的数字 PK

### 查看用户的快拍
1. `getUserProfile(username)` → `id`
2. `getStories(id)` → 通过 `reel` 对象获取当前快拍（如果没有有效快拍，则为 null）

### 为帖子点赞
1. `getFeed(id, count)` 或 `getUserPosts(username, count)` → `items[].pk`
2. `likePost(id=items[].pk)` → 状态

### 取消帖子点赞
1. `getFeed(id, count)` 或 `getUserPosts(username, count)` → `items[].pk`
2. `unlikePost(id=items[].pk)` → 状态

### 关注用户
1. `getUserProfile(username)` → `data.user.id`
2. `followUser(id=data.user.id)` → friendship_status（following/outgoing_request）

### 取消关注用户
1. `getUserProfile(username)` → `data.user.id`
2. `unfollowUser(id=data.user.id)` → friendship_status

### 收藏帖子
1. `getFeed(id, count)` 或 `getUserPosts(username, count)` → `items[].pk`
2. `savePost(id=items[].pk)` → 状态

### 取消收藏帖子
1. `getFeed(id, count)` 或 `getUserPosts(username, count)` → `items[].pk`
2. `unsavePost(id=items[].pk)` → 状态

### 评论帖子
1. `getFeed(id, count)` 或 `getUserPosts(username, count)` → `items[].pk`
2. `createComment(id=items[].pk, comment_text)` → 响应 `id`（新评论的 pk）

### 删除评论
1. 从 `createComment` → `id` 串联获取，或者
   `getPostComments(id=items[].pk)` → `comments[].pk`
2. `deleteComment(media_id=items[].pk, comment_id=createComment.id | comments[].pk)` → `{status: "ok"}`

> 验证固件应将这两个操作配对为 `order:1` / `order:2`，并使用 `comment_id=${prev.createComment.id}`。请使用互动量较低的目标帖子（验证固件以 @wangxinyu926 为目标）——`@instagram` 和其他知名账号会触发垃圾信息过滤器的影子删除。由于 IG 评论是公开的，评论文本必须内容充实且切合主题（不要使用 `"test"` 占位符）。

### 屏蔽用户
1. `getUserProfile(username)` → `data.user.id`
2. `blockUser(id=data.user.id)` → friendship_status

### 取消屏蔽用户
1. `getUserProfile(username)` → `data.user.id`
2. `unblockUser(id=data.user.id)` → friendship_status

### 将用户静音
1. `getUserProfile(username)` → `data.user.id`
2. `muteUser(id=data.user.id)` → status（隐藏帖子和快拍）

### 取消静音用户
1. `getUserProfile(username)` → `data.user.id`
2. `unmuteUser(id=data.user.id)` → status

### 浏览“探索”页面
1. `getExplore()` → 热门帖子网格
2. `getExplore(max_id)` → 下一页

### 查看粉丝/关注列表
1. `getUserProfile(username)` → `id`
2. `getFollowers(id, count)` → 粉丝列表，包含用户名和认证状态
3. `getFollowing(id, count)` → 关注列表

### 查看用户的 Reels
1. `getUserProfile(username)` → `id`
2. `getReels(id, count)` → Reels，包含播放次数和文案

### 查看通知
1. `getNotifications()` → 动态信息流（点赞、评论、关注、提及）

### 搜索用户
1. `searchUsers(query)` → 用户列表，包含用户名、全名和认证状态

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getUserProfile | 查看用户个人资料 | username | id, biography, follower/following counts, is_verified | 入口点 |
| getUserPosts | 按用户名浏览帖子 | username | 带有 pk, code, caption, like_count 和用户信息的帖子 | 适配器；通过 next_max_id 分页 |
| getPost | 查看帖子详情 | id（数字 PK）← getFeed items[].pk | caption, like_count, comment_count, media URLs | — |
| getFeed | 按 ID 浏览用户帖子 | id（用户 ID）← getUserProfile data.user.id | 带有 pk, code, caption, like_count 的帖子 | 通过 next_max_id 分页 |
| getPostComments | 查看帖子评论 | id（数字 PK）← getFeed items[].pk | 带有 text、作者和点赞数的评论 | 通过 next_min_id 分页 |
| getStories | 查看用户快拍 | id（用户 ID）← getUserProfile data.user.id | reel，包含快拍项目、媒体 URL 和过期时间 | 如果没有有效快拍，则 reel 为 null |
| likePost | 点赞帖子 | id（数字 PK）← getFeed items[].pk | status | 写操作；CSRF |
| unlikePost | 取消点赞帖子 | id（数字 PK）← getFeed items[].pk | status | 写操作；CSRF |
| followUser | 关注用户 | id（用户 ID）← getUserProfile data.user.id | friendship_status | 写操作；CSRF |
| unfollowUser | 取消关注用户 | id（用户 ID）← getUserProfile data.user.id | friendship_status | 写操作；CSRF |
| savePost | 收藏帖子 | id（数字 PK）← getFeed items[].pk | status | 写操作；CSRF |
| unsavePost | 取消收藏 | id（数字 PK）← getFeed items[].pk | status | 写操作；CSRF |
| createComment | 添加评论 | id（数字 PK）, comment_text | 响应 `id`（新评论的 pk）、text、from.id、from.username | 写操作；CSRF；可串联至 deleteComment |
| deleteComment | 删除评论 | media_id, comment_id ← createComment.id 或 getPostComments comments[].pk | `{status: "ok"}` | 写操作；CSRF；URL 为 `/api/v1/web/comments/{media}/delete/{comment}/` |
| blockUser | 屏蔽用户 | id（用户 ID）← getUserProfile data.user.id | friendship_status | 写操作；CSRF |
| unblockUser | 取消屏蔽用户 | id（用户 ID）← getUserProfile data.user.id | friendship_status | 写操作；CSRF |
| muteUser | 将用户静音 | id（用户 ID）← getUserProfile data.user.id | status | 写操作；CSRF；适配器 |
| unmuteUser | 取消静音用户 | id（用户 ID）← getUserProfile data.user.id | status | 写操作；CSRF；适配器 |
| getExplore | 浏览“探索”页面 | （无） | 带有媒体网格的 sectional_items | 通过 next_max_id 分页 |
| getFollowers | 列出粉丝 | id（用户 ID）← getUserProfile data.user.id | 带有 username, is_verified 的用户 | 通过 next_max_id 分页 |
| getFollowing | 列出关注用户 | id（用户 ID）← getUserProfile data.user.id | 带有 username, is_verified 的用户 | 通过 next_max_id 分页 |
| getReels | 查看用户 Reels | id（用户 ID）← getUserProfile data.user.id | 带有 play_count 和文案的 Reels | 适配器；通过 paging_info 分页 |
| getNotifications | 动态信息流 | （无） | counts, new_stories, old_stories | 适配器；POST |
| searchUsers | 查找用户 | query（搜索词） | 带有 username, full_name, is_verified, follower_count 的用户 | 入口点 |

## 快速开始

```bash
# Get a user profile
openweb instagram exec getUserProfile '{"username":"instagram"}'

# Get user's posts by username (adapter — resolves username automatically)
openweb instagram exec getUserPosts '{"username":"instagram","count":12}'

# Get user's feed by ID (first page)
openweb instagram exec getFeed '{"id":"25025320","count":12}'

# View a specific post (use pk from feed)
openweb instagram exec getPost '{"id":"3865890235180097425"}'

# Get comments on a post
openweb instagram exec getPostComments '{"id":"3865890235180097425"}'

# Get a user's stories
openweb instagram exec getStories '{"id":"25025320"}'

# Like / unlike a post (write operations)
openweb instagram exec likePost '{"id":"3865890235180097425"}'
openweb instagram exec unlikePost '{"id":"3865890235180097425"}'

# Follow / unfollow a user
openweb instagram exec followUser '{"id":"25025320"}'
openweb instagram exec unfollowUser '{"id":"25025320"}'

# Save / unsave a post
openweb instagram exec savePost '{"id":"3865890235180097425"}'
openweb instagram exec unsavePost '{"id":"3865890235180097425"}'

# Comment on a post
openweb instagram exec createComment '{"id":"3865890235180097425","comment_text":"Great post!"}'
openweb instagram exec deleteComment '{"media_id":"3865890235180097425","comment_id":"18042648274123456"}'

# Block / unblock a user
openweb instagram exec blockUser '{"id":"25025320"}'
openweb instagram exec unblockUser '{"id":"25025320"}'

# Mute / unmute a user (adapter — routes to correct endpoint)
openweb instagram exec muteUser '{"id":"25025320"}'
openweb instagram exec unmuteUser '{"id":"25025320"}'

# Browse Explore page
openweb instagram exec getExplore '{}'

# Get followers / following
openweb instagram exec getFollowers '{"id":"25025320","count":12}'
openweb instagram exec getFollowing '{"id":"25025320","count":12}'

# Get a user's Reels (adapter — POST to clips endpoint)
openweb instagram exec getReels '{"id":"25025320","count":12}'

# Get notifications
openweb instagram exec getNotifications '{}'

# Search users
openweb instagram exec searchUsers '{"query":"nasa"}'
```

## 已知限制
- **写入操作覆盖情况（2026-04-19）：**全部 12 项写入操作均已通过端到端验证（PASS）（`likePost`、`unlikePost`、`savePost`、`unsavePost`、`followUser`、`unfollowUser`、`muteUser`、`unmuteUser`、`blockUser`、`unblockUser`、`createComment`、`deleteComment`）。`createComment`/`deleteComment` 针对一个低流量目标帖子，通过 `${prev.createComment.id}` 串联执行——高知名度账号（例如 `@instagram`）会触发垃圾信息过滤器的影子删除，导致紧随其后的删除操作返回 404。