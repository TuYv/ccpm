# Bilibili

## 概述
中国的视频分享与社交平台（类似 YouTube）。原型：中国网站 / 视频 + 社交。

## 工作流

### 浏览热门内容并深入查看视频
1. `getPopularVideos()` → 浏览热门内容 → `bvid`, `aid`
2. `getVideoDetail(bvid)` → 完整元数据、统计数据 → `aid`, `cid`, `owner.mid`
3. `getVideoComments(oid=aid, type=1)` → 包含 `rpid`、文本和点赞数的评论
4. `getDanmaku(oid=cid)` → 包含内容和 progress_ms 的弹幕评论（弹幕）

### 搜索并互动
1. `searchVideos(keyword)` → 搜索结果 → `bvid`, `author.mid`
2. `getVideoDetail(bvid)` → 完整视频信息 → `aid`, `cid`, `owner.mid`
3. `likeVideo(aid=aid)` → 互动（需要认证 + 写入权限）
4. `unlikeVideo(aid=aid)` → 撤销互动

### 收藏视频（通过收藏夹串联）
1. `listFavoriteFolders()` → 用户的收藏夹 → `data.list[0].id`（收藏夹 media_id）
2. `getVideoDetail(bvid)` → `aid`
3. `addToFavorites(rid=aid, add_media_ids=${prev.listFavoriteFolders.data.list.0.id})` → 添加（需要认证 + 写入权限）
4. `removeFromFavorites(rid=aid, del_media_ids=${prev.listFavoriteFolders.data.list.0.id})` → 撤销

### 探索创作者的内容
1. `getUserProfile(mid)` → 个人简介、等级、粉丝数 → `mid`
2. `searchUserVideos(mid)` → 分页的投稿列表 → `bvid`、标题、播放量

### 关注/取消关注流程
1. `searchVideos(keyword)` → `author.mid`，或 `getUserProfile(mid)` → 确认用户 → `mid`
2. `followUploader(fid=mid)` → 关注
3. `unfollowUploader(fid=mid)` → 取消关注

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getPopularVideos | 浏览热门视频 | `pn`, `ps` | bvid, aid, title, play count, uploader, duration | 入口点，无需认证 |
| searchVideos | 按关键词查找视频 | `keyword` | bvid, title, author.mid, play, danmaku, duration | 适配器操作，速度较慢 |
| getVideoDetail | 完整视频元数据 + 统计数据 | `bvid` <- getPopularVideos/searchVideos | title, desc, aid, cid, owner.mid, play/like/coin/fav stats | 使用 wbi 签名 |
| getVideoComments | 读取评论及回复 | `oid` (=aid) <- getVideoDetail, `type`=1 | rpid, text, author, likes, reply_count, timestamp | 使用 wbi 签名 |
| getDanmaku | 弹幕评论（弹幕） | `oid` (=cid) <- getVideoDetail, `segment_index` | content, progress_ms, mode, color, ctime | 适配器操作，已解码 protobuf |
| getUserProfile | 用户简介、等级、统计数据 | `mid` <- searchVideos.author.mid / getVideoDetail.owner.mid | name, sign, level, face, fans_medal | 使用 wbi 签名 |
| searchUserVideos | 用户上传的视频 | `mid` <- getUserProfile, `pn`, `ps` | title, play, duration, bvid, created | 使用 wbi 签名 |
| getRecommendedFeed | 个性化推荐流 | `ps` | bvid, title, play, uploader, duration | 入口点 |
| listFavoriteFolders | 列出用户的收藏夹 | — | `data.list[].id`（收藏夹 media_id）、title、media_count | 收藏链路的入口点，需要认证 |
| likeVideo | 点赞视频 | `aid` <- getVideoDetail, `like`=1 | code, message | 写入操作，需要认证 |
| unlikeVideo | 取消点赞视频 | `aid` <- getVideoDetail | code, message | 写入操作，likeVideo 的反向操作 |
| addToFavorites | 将视频添加到收藏夹 | `rid` (=aid) <- getVideoDetail, `add_media_ids` <- listFavoriteFolders.data.list[0].id | code, message | 写入操作，需要认证 |
| removeFromFavorites | 从收藏夹中移除视频 | `rid` (=aid) <- getVideoDetail, `del_media_ids` <- listFavoriteFolders.data.list[0].id | code, message | 写入操作，addToFavorites 的反向操作 |
| followUploader | 关注用户 | `fid` (=mid) <- getUserProfile/getVideoDetail.owner.mid | code, message | 写入操作，需要认证 |
| unfollowUploader | 取消关注用户 | `fid` (=mid) <- getUserProfile/getVideoDetail.owner.mid | code, message | 写入操作，followUploader 的反向操作 |

## 快速开始

```bash
# Browse trending videos
openweb bilibili exec getPopularVideos '{"pn": 1, "ps": 5}'

# Get personalized feed
openweb bilibili exec getRecommendedFeed '{"ps": 10}'

# Search videos by keyword (adapter, slower)
openweb bilibili exec searchVideos '{"keyword": "编程"}'

# Get video detail by BV ID
openweb bilibili exec getVideoDetail '{"bvid": "BV1MBXPBtEbk"}'

# Get video comments (oid = aid from getVideoDetail)
openweb bilibili exec getVideoComments '{"oid": 123456, "type": 1}'

# Get danmaku / bullet comments (oid = cid from getVideoDetail)
openweb bilibili exec getDanmaku '{"oid": 1176840, "segment_index": 1}'

# Get user profile
openweb bilibili exec getUserProfile '{"mid": 1695320}'

# Search user's uploaded videos
openweb bilibili exec searchUserVideos '{"mid": 1695320, "pn": 1}'

# Like a video (requires auth + write permission)
openweb bilibili exec likeVideo '{"aid": 123456, "like": 1}'

# Unlike a video (requires auth + write permission)
openweb bilibili exec unlikeVideo '{"aid": 123456}'

# List your favorite folders (chain into addToFavorites)
openweb bilibili exec listFavoriteFolders '{}'

# Add a video to a favorite folder (chain media_id from listFavoriteFolders)
openweb bilibili exec addToFavorites '{"rid": 123456, "add_media_ids": "12345"}'

# Remove from favorites (requires auth + write permission)
openweb bilibili exec removeFromFavorites '{"rid": 123456, "del_media_ids": "12345"}'

# Unfollow a user (requires auth + write permission)
openweb bilibili exec unfollowUploader '{"fid": 1695320}'
```