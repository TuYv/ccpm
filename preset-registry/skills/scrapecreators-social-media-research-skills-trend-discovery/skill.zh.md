---
name: trend-discovery
description: Use when the user wants to discover trending social topics, hashtags, sounds, posts, reels, shorts, creators, or formats in a niche. Searches public trend and discovery endpoints, ranks evidence, and turns trends into practical content angles.
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
# 趋势发现

## 概述

寻找值得付诸行动的趋势。本技能用于在 TikTok、Instagram、YouTube、Reddit、Pinterest 及其他公开来源上进行社交媒体趋势研究。输出应将真实证据与含糊的“这个很流行”式说法区分开来。

## 使用时机

当用户提出以下需求时使用本技能：

- 在某个细分领域或品类中寻找趋势
- 发现热门的 TikTok 音频、话题标签、创作者或视频
- 寻找热门的 Instagram Reels 或 YouTube Shorts 创意
- 制作每周趋势简报
- 决定要跟进哪些内容形式或切入角度

## 常用来源

| 信号 | 端点示例 |
|---|---|
| TikTok 热门信息流 | `/v1/tiktok/get-trending-feed` |
| TikTok 热门话题标签/音频/视频/创作者 | `/v1/tiktok/hashtags/popular`, `/v1/tiktok/songs/popular`, `/v1/tiktok/videos/popular`, `/v1/tiktok/creators/popular` |
| TikTok 搜索 | `/v1/tiktok/search/top`, `/v1/tiktok/search/keyword`, `/v1/tiktok/search/hashtag` |
| Instagram 趋势/搜索 | `/v1/instagram/reels/trending`, `/v2/instagram/reels/search`, `/v1/instagram/search/hashtag` |
| YouTube | `/v1/youtube/shorts/trending`, `/v1/youtube/search`, `/v1/youtube/search/hashtag` |
| Reddit | `/v1/reddit/search`, `/v1/reddit/subreddit`, `/v1/reddit/subreddit/search` |
| Pinterest | `/v1/pinterest/search` |

## 工作流程

1. 定义细分领域、国家/地区、平台和时间敏感度。
2. 从 2-4 个相关来源拉取趋势/发现/搜索结果。
3. 规范化证据：帖子 URL、创作者、指标、日期、主题，以及音频/话题标签（如有）。
4. 按主题、形式、钩子、音频、梗或受众痛点将结果聚类为趋势。
5. 依据证据强度和相关性对趋势排序，而不仅仅看原始播放量。
6. 将每个趋势转化为用户切实可行的内容创意。

## 输出格式

```markdown
# Trend Discovery Brief: {niche}

## Trends Worth Acting On
| Trend | Platforms | Evidence | Why it matters | Content angle |
|---|---|---|---|---|

## Sounds / Hashtags / Formats
- ...

## Example Posts to Study
- [title/hook](url) — why it matters

## Content Ideas
1. ...
2. ...

## Caveats
- Public data only.
- Trend evidence is directional unless repeated across sources.
```

## 常见误区

- 除非用户只是要求举例，否则不要仅凭一条帖子就断定某事是趋势。
- 不要忽视地区。TikTok 趋势可能高度因国家而异。
- 不要建议跟进与用户品牌或受众不符的趋势。
