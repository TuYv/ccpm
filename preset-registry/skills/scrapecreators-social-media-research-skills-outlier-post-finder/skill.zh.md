---
name: outlier-post-finder
description: Use when the user wants to find posts, videos, reels, shorts, tweets, or social content that overperformed versus a creator, brand, or competitor baseline. Finds outliers, explains why they worked, extracts hooks and formats, and produces a practical swipe file.
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
# 异常表现帖发现器

## 概述

寻找表现超越某账号正常水平的社交帖子。目标不只是按浏览量排序，而是找出对该创作者或品牌而言表现异常突出的帖子，然后解释其中可复用的模式。

将 ScrapeCreators 用作数据层。拉取近期公开帖子，对互动指标进行标准化，计算每个账号的基线，并生成一份包含来源 URL 和实用启示的异常帖报告。

## 何时使用

当用户提出以下需求时，使用此技能：

- 查找异常表现帖、病毒式传播帖、热门帖、最佳 Reels、最佳 Shorts、最佳 TikTok 或最佳推文
- 分析某位创作者的内容为什么有效
- 寻找值得模仿或学习的竞争对手帖子
- 用高表现社交帖子建立灵感收藏库
- 比较某创作者近期各帖子的表现

若只是进行原始端点查询，请不要使用此技能。如需直接的 API 路由，请使用 `scrapecreators-api`。

## 数据来源

优先使用平台专属的信息流端点，仅在需要时才对单条帖子进行富化。

| 平台 | 信息流端点 | 详情/富化端点 |
|---|---|---|
| TikTok | `/v3/tiktok/profile/videos` | `/v2/tiktok/video`, `/v1/tiktok/video/transcript` |
| Instagram 帖子 | `/v2/instagram/user/posts` | `/v1/instagram/post`, `/v2/instagram/media/transcript` |
| Instagram Reels | `/v1/instagram/user/reels` | `/v1/instagram/post`, `/v2/instagram/media/transcript` |
| YouTube 视频 | `/v1/youtube/channel-videos` | `/v1/youtube/video`, `/v1/youtube/video/transcript` |
| YouTube Shorts | `/v1/youtube/channel/shorts` | `/v1/youtube/video`, `/v1/youtube/video/transcript` |
| Facebook | `/v1/facebook/profile/posts`, `/v1/facebook/profile/reels` | `/v1/facebook/post`, `/v1/facebook/post/transcript` |
| LinkedIn | `/v1/linkedin/company/posts` | `/v1/linkedin/post`, `/v1/linkedin/post/transcript` |
| X/Twitter | `/v1/twitter/user-tweets` | `/v1/twitter/tweet`, `/v1/twitter/tweet/transcript` |
| Threads | `/v1/threads/user/posts` | `/v1/threads/post` |
| Bluesky | `/v1/bluesky/user/posts` | `/v1/bluesky/post` |

在调用某个端点之前，如果参数名称或响应字段不确定，请先获取该端点的文档或其对应的 OpenAPI 规范。

## 工作流程

1. **仅在必要时明确范围**
   - 平台（一个或多个）
   - 账号 handle 或 URL
   - 时间/帖子数量窗口
   - 是否包含转录文本/评论分析

2. **拉取近期帖子**
   - 在可获取的情况下，至少拉取 20 条帖子。数量越多，基线的置信度越高。
   - 如果端点支持游标分页且用户希望覆盖更大的时间窗口，则进行分页拉取。
   - 保留来源 URL 以便引用。

3. **对指标进行标准化**
   - 采集所有可用的指标：浏览量、播放量、点赞数、评论数、分享数、转发数、收藏数。
   - 先保留原始指标，再构建综合互动得分。
   - 对于以视频为主的平台，浏览量/播放量通常是主要指标。
   - 对于以文字为主的平台，通常更适合采用点赞数 + 回复/评论数 + 转发/分享数。

4. **计算账号基线**
   - 使用中位数而非平均值，以免单条病毒式传播的帖子扭曲基线。
   - 按平台和按账号分别计算基线。
   - 如果存在多种内容格式，尽可能按格式拆分：Reel 与轮播图、短视频与长视频、文字与视频。

5. **为异常表现帖评分**
   - `view_lift = post_views / median_views`
   - `engagement_lift = post_engagement / median_engagement`
   - 将帖子标注为：
     - **超大异常帖：** 基线的 5 倍以上
     - **显著异常帖：** 基线的 2 至 5 倍
     - **轻度异常帖：** 基线的 1.5 至 2 倍
   - 如果样本量不足 10 条帖子，则将置信度标记为低。

6. **对胜出的帖子进行富化**
   - 为排名靠前的异常帖获取帖子详情。
   - 在有价值时为视频帖获取转录文本。
   - 可选择获取评论，以了解受众反应。

7. **解释它们为何有效**
   寻找：
   - 开场钩子风格
   - 主题/类别
   - 格式
   - 情绪触发点
   - 新颖性/时效性
   - 创作者证明或权威性
   - 争议或辩论
   - 流露出困惑、渴望或购买意向的评论

## 输出格式

```markdown
# Outlier Posts Report: {creator_or_brand}

## Summary
- Sample: {n} posts from {platforms}
- Window: {window}
- Baseline: median {primary_metric} = {value}
- Confidence: High/Medium/Low

## Biggest Outliers
| Rank | Post | Platform | Date | Primary Metric | Lift | Why it likely worked |
|---:|---|---|---|---:|---:|---|
| 1 | [title/hook](url) | TikTok | 2026-01-01 | 1.2M views | 8.4x | Contrarian hook + clear before/after |

## Repeatable Patterns
1. **Pattern name** — evidence and examples.
2. **Pattern name** — evidence and examples.

## Hooks to Steal
- "Exact hook from caption or transcript"
- "Exact hook from caption or transcript"

## Content Ideas Based on the Outliers
1. ...
2. ...

## Notes and Caveats
- Public data only.
- Small samples are directional, not definitive.
```

## 常见陷阱

- 当大账号与小账号被放在一起比较时，不要把原始浏览量最高的帖子称作最佳异常帖。应使用相对于各账号自身基线的提升倍数。
- 不要把 TikTok、Instagram、YouTube 和 LinkedIn 的指标平均成单一基线。应分别对每个平台评分。
- 不要编造转录文本中的引语。应获取转录文本，或仅引用可见的字幕/文字。
- 不要基于少于 10 条帖子的样本夸大置信度。
- 如果用户要求的是近期表现，不要忽略较早的病毒式帖子。请遵守所要求的时间窗口。
