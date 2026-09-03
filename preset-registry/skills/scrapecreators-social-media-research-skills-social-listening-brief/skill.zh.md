---
name: social-listening-brief
description: Use when the user wants a social listening report about what people are saying about a brand, person, product, topic, category, or niche across public social platforms. Produces cited themes, sentiment caveats, notable posts, and recommended actions.
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
# 社会聆听简报（Social Listening Brief）

## 概述

调研人们在各社交平台上公开发表的言论。这适用于品牌监测、品类研究、产品反馈、声誉检查以及了解近期对话。

## 何时使用

当用户提出以下请求时使用本技能：

- 人们对 X 有什么看法？
- 监测某个品牌/主题/品类
- 查找对某产品的投诉或称赞
- 总结近期的社交讨论
- 比较 Reddit、TikTok、YouTube、LinkedIn、Instagram 或 Threads 上的情绪

## 有用的信息来源

- Reddit 搜索、subreddit 搜索、帖子、评论
- TikTok 的 top/keyword/hashtag（热门/关键词/话题标签）搜索及评论
- YouTube 搜索、文字稿、评论
- Instagram Reels 搜索和话题标签搜索
- LinkedIn 帖子搜索
- Threads 搜索
- 当平台内搜索不足时使用 Google 搜索

## 工作流程

1. 明确主题、别名、竞争对手名称和日期范围。
2. 搜索多个相关来源，而不是盲目搜索每一个来源。
3. 保留 URL、日期、平台、互动指标和确切引文。
4. 将对话聚类为主题。
5. 区分正面、负面、中立和混合信号。
6. 突出代表性示例和行动项。

## 输出格式

```markdown
# Social Listening Brief: {topic}

## Executive Summary
- Main takeaway:
- Conversation volume: Low/Medium/High
- Sentiment: Positive/Neutral/Negative/Mixed
- Confidence: High/Medium/Low

## Top Themes
| Theme | Sentiment | Evidence | Representative quote/source |
|---|---|---|---|

## Notable Posts
- [source](url) — why it matters

## Risks / Opportunities
- ...

## Recommended Actions
1. ...
```

## 常见误区

- 不要假装这是详尽无遗的社交监测。这只是公开数据调研。
- 不要在未加说明的情况下对差异极大的社区的情绪取平均值。
- 不要把互动量当作真实性的替代指标。
