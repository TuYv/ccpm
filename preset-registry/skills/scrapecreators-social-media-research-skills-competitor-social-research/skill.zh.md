---
name: competitor-social-research
description: Use when the user wants to research competitors' social media strategy, compare brands or creators, find what content is working in a niche, identify content gaps, or produce a practical social strategy brief from public social data.
allowed-tools: Bash, Read, Write, WebFetch

version: 1.0.0
author: ScrapeCreators
license: MIT
homepage: https://scrapecreators.com
repository: https://github.com/ScrapeCreators/social-media-research-skills
metadata:
  openclaw:
    requires:
      env:
        - SCRAPECREATORS_API_KEY
    primaryEnv: SCRAPECREATORS_API_KEY
    homepage: https://scrapecreators.com
    tags:
      - social-media
      - research
      - scrapecreators
---
# 竞品社媒调研

## 概述

分析竞争对手在社交媒体上的动态以及哪些做法似乎正在起效。此技能将主页数据、近期帖子、异常值分析、转写文本以及可选的评论结合起来，生成一份实用的竞品简报。

## 何时使用

当用户提出以下需求时，使用此技能：

- 比较 TikTok、Instagram、YouTube、LinkedIn、Facebook、X、Threads 或其他社交平台上的竞争对手
- 找出某个细分领域中正在起效的内容
- 对发布频率、格式、主题和互动情况进行基准对比
- 识别内容空白或机会
- 基于竞品调研制定社媒策略

## 工作流程

1. **确定竞争对手和平台**
   - 使用提供的账号名/URL。
   - 如果只提供了公司名称，请先搜索主页，并在歧义可能造成影响时确认匹配对象。

2. **获取主页快照**
   - 粉丝数/订阅数
   - 简介/定位
   - 链接
   - 认证状态/公开元数据

3. **获取近期内容**
   - 为每个竞争对手拉取可比较的近期时间窗口。
   - 记录来源 URL、日期、配文、格式和各项指标。

4. **找出每个竞争对手的异常值**
   - 以每个账号自身的中位数为基线。
   - 不要在没有背景的情况下直接比较大型品牌与小型品牌的原始浏览量。

5. **分析内容策略**
   - 内容支柱
   - 格式
   - 钩子风格
   - 发布节奏
   - 优惠/CTA
   - 创始人/创作者人设的运用
   - 社区/评论模式

6. **寻找空白与机会**
   寻找：
   - 竞争对手回避的主题
   - 表现突出但很少有竞争对手使用的格式
   - 未得到解答的受众问题
   - 钩子薄弱或内容重复
   - 平台空白地带

## 实用的 ScrapeCreators 端点

使用 `scrapecreators-api` 中相应的主页/信息流/详情/转写/评论端点。常用路由包括：

- TikTok: `/v1/tiktok/profile`, `/v3/tiktok/profile/videos`
- Instagram: `/v1/instagram/profile`, `/v2/instagram/user/posts`, `/v1/instagram/user/reels`
- YouTube: `/v1/youtube/channel`, `/v1/youtube/channel-videos`, `/v1/youtube/channel/shorts`
- LinkedIn: `/v1/linkedin/company`, `/v1/linkedin/company/posts`
- Facebook: `/v1/facebook/profile`, `/v1/facebook/profile/posts`, `/v1/facebook/profile/reels`
- X/Twitter: `/v1/twitter/profile`, `/v1/twitter/user-tweets`
- Threads: `/v1/threads/profile`, `/v1/threads/user/posts`
- Bluesky: `/v1/bluesky/profile`, `/v1/bluesky/user/posts`

## 输出格式

```markdown
# Competitor Social Research Brief

## Executive Summary
- Biggest opportunity:
- Competitor to study closest:
- Content format to test first:

## Competitor Snapshot
| Competitor | Platforms | Audience size | Posting cadence | Best-performing format | Notes |
|---|---|---:|---|---|---|

## What Is Working
### Competitor A
- Content pillars:
- Outlier examples:
- Hooks/formats:

## Cross-Competitor Patterns
1. ...
2. ...

## Gaps and Opportunities
| Opportunity | Evidence | Suggested test |
|---|---|---|

## Recommended Content Tests
1. ...
2. ...
3. ...

## Sources
- [Post/profile/ad](url)
```

## 常见误区

- 不要仅凭粉丝数量来比较竞争对手。互动表现和异常值提升幅度更重要。
- 不要在没有平台背景的情况下混用不同平台。一篇优秀的 LinkedIn 帖子和一条优秀的 TikTok 是两种不同的内容产物。
- 如果多个品牌共用同一名称，不要仅凭公司名称就认定主页匹配。
- 当竞品策略是从公开内容推断得出时，不要将其作为事实呈现。应使用"appears to"或"suggests"等表述。
