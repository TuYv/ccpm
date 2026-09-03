---
name: transcript-intelligence
description: Use when the user wants to summarize, analyze, or repurpose transcripts from TikTok, Instagram, YouTube, Facebook, X/Twitter, LinkedIn, Rumble, or Reddit video posts. Extracts hooks, claims, quotes, content atoms, themes, and reusable scripts.
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
# 转录内容情报

## 概述

将公开视频的转录文本转化为有价值的研究与内容素材。本技能用于从口播类社交视频中提取有效信号：钩子、论断、故事、异议、案例、CTA，以及可复用的内容角度。

## 何时使用

当用户提出以下需求时使用本技能：

- 总结视频、Reels、短视频、TikTok、播客片段或社交媒体视频
- 分析某位创作者的钩子或讲话风格
- 从转录文本中提取金句、论断、案例和 CTA
- 将转录文本转化为社交媒体帖子、脚本、邮件通讯或内容创意
- 比较多位创作者对某一话题的看法

## 转录文本来源

| 平台 | 端点 |
|---|---|
| TikTok | `/v1/tiktok/video/transcript` |
| Instagram | `/v2/instagram/media/transcript` |
| YouTube | `/v1/youtube/video/transcript`, `/v1/youtube/video` |
| Facebook | `/v1/facebook/post/transcript` |
| X/Twitter | `/v1/twitter/tweet/transcript` |
| LinkedIn | `/v1/linkedin/post/transcript` |
| Rumble | `/v1/rumble/video/transcript` |
| Reddit 视频 | `/v1/reddit/post/transcript` |

如果详情端点已包含转录文本，直接使用即可。如果转录文本不可用，请如实说明，并仅回退使用标题/配文/描述。

## 工作流程

1. **收集 URL 或发现视频**
   - 如果提供了 URL，则直接抓取每条转录文本。
   - 如果提供的是创作者/频道，则先抓取其近期帖子/视频，再挑选相关视频。

2. **提取转录文本**
   - 如有时间戳，请保留。
   - 为每条转录文本保留其来源 URL。
   - 不要凭空编造缺失的字幕。

3. **对转录文本分段**
   划分为：
   - 钩子/开场
   - 铺垫/背景
   - 核心论断或要点
   - 论据/案例
   - 回报
   - CTA

4. **分析内容**
   提取：
   - 精确的钩子原文
   - 论断和反主流观点
   - 故事
   - 框架
   - 所应对的异议
   - 情绪化语言
   - 可引用的金句
   - 可独立使用的内容原子

5. **跨多条转录文本进行综合分析**
   - 按主题和角度聚类。
   - 统计反复出现的主题。
   - 识别重复出现的钩子套路。
   - 标注最有力的案例并附引用。

## 输出格式

```markdown
# Transcript Intelligence Report

## TL;DR
- Main themes:
- Strongest hooks:
- Best reusable ideas:

## Transcript-by-Transcript Notes
### [Video title or URL](url)
- Hook: "..."
- Core idea: ...
- Best quote: "..."
- CTA: ...
- Content atoms:
  1. ...

## Patterns Across the Set
| Pattern | Evidence | Example URLs |
|---|---|---|

## Hooks Swipe File
- "..."
- "..."

## Repurposing Ideas
- LinkedIn post:
- X thread:
- Short-form script:
- Newsletter section:
```

## 常见陷阱

- 如果用户要求的是转录文本分析，不要仅凭标题进行总结。应先抓取转录文本。
- 不要丢失精确措辞。钩子和引语的逐字原文更有价值。
- 不要把 AI 生成的转录文本视为完美无缺。如果措辞看起来错乱，请标注为近似内容。
- 不要混淆来源归属。每条引用都应能追溯到一个 URL。
