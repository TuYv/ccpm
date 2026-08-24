# LinkedIn

## 概述
专业社交网络平台——采用 Voyager REST/GraphQL API 的社交媒体典型范例。

## 工作流

### 查找个人资料
1. `getProfile(variables)` → 个人资料数据 → `profileUrn`
2. `getProfileByUrn(id ← getProfile, decorationId)` → 包含工作经历、教育背景和技能的完整个人资料

### 浏览动态和新闻
1. `getFeed(variables)` → 帖子、文章、分享
2. `getNewsStorylines(variables)` → 热门话题、精选新闻

### 搜索人员、职位或内容
1. `searchGeo(keywords)` → 地理位置结果 → `geoId`（来自 `included[].entityUrn` 后缀）
2. `searchJobs(keywords, geoId?, count?, start?)` → 职位卡片 → `jobId`
3. `getJobDetail(jobId ← searchJobs)` → 包含职位描述、要求和薪资的完整招聘信息

### 查看联系人和邀请
1. `getConnectionsSummary()` → 联系人总数、新增联系人
2. `getInvitations(q, count, start)` → 包含发送者信息的待处理邀请
3. `getMyNetworkNotifications()` → 联系人推荐

### 查看通知
1. `getNotificationCards(decorationId, q, count)` → 点赞、评论、提及、职位提醒

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getMe | 获取自己的个人资料 | — | 姓名、职业简介、profileUrn | 入口点 |
| getProfile | 按个性化名称获取个人资料 | vanityName（URL 别名） | 姓名、职业简介、地点、行业 | 通过 GraphQL 适配器 |
| getProfileByUrn | 按 URN 获取完整个人资料 | id ← getMe/getProfile, decorationId | 工作经历、教育背景、技能 | FullProfile-76 装饰器 |
| getFeed | 获取主页动态 | count, sortOrder | 帖子、分享、作者信息、互动数据 | 通过 GraphQL 适配器 |
| getConnectionsSummary | 联系人数量 | — | 联系人总数、新增数量 | |
| getInvitations | 待处理邀请 | q=receivedInvitation, count, start | 发送者信息、共同联系人 | 分页 |
| getNotificationCards | 通知 | decorationId, count, q | 点赞、评论、提及、职位提醒 | |
| getNewsStorylines | 热门新闻 | — | 话题、文章、行业动态 | 通过 GraphQL 适配器 |
| getCompany | 公司页面 | universalName（URL 别名） | 名称、行业、规模、关注者 | 通过 GraphQL 适配器 |
| getMyNetworkNotifications | 人脉网络动态 | — | 联系人推荐 | |
| searchGeo | 搜索地理位置 ID | keywords（地点名称） | 包含 geoId 的地理位置 URN | 将 geoId 与 searchJobs 搭配使用 |
| searchJobs | 搜索职位 | keywords, geoId?, count?, start? | 职位卡片：职位名称、公司、地点、发布日期 | 通过 GraphQL 适配器 |
| getJobDetail | 获取招聘信息详情 | jobId ← searchJobs 或 URL | 职位描述、要求、公司、薪资、申请人数 | 通过 GraphQL 适配器 |

## 快速开始

```bash
# Get own profile
openweb linkedin exec getMe '{}'

# Get someone's profile by vanity name
openweb linkedin exec getProfile '{"variables":"(vanityName:williamhgates)"}'

# Get main feed
openweb linkedin exec getFeed '{"variables":"(count:10,sortOrder:RELEVANCE)"}'

# Get company info
openweb linkedin exec getCompany '{"variables":"(universalName:microsoft)"}'

# Get connection invitations
openweb linkedin exec getInvitations '{"q":"receivedInvitation","count":10,"start":0}'

# Get notification cards
openweb linkedin exec getNotificationCards '{"decorationId":"com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-24","q":"filterVanityName","count":10}'

# Search for jobs
openweb linkedin exec searchJobs '{"keywords":"software engineer","geoId":"103644278","count":25}'

# Look up a geoId by location name
openweb linkedin exec searchGeo '{"keywords":"San Francisco Bay Area"}'

# Get job posting details
openweb linkedin exec getJobDetail '{"jobId":"3945709057"}'
```