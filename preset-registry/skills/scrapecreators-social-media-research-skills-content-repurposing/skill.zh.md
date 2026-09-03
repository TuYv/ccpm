---
name: content-repurposing
description: Use when the user wants to turn public social videos, transcripts, posts, or creator research into reusable content assets such as LinkedIn posts, X threads, short-form scripts, newsletters, blog outlines, carousels, or content calendars.
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
# 内容再利用

## 概述

将社媒研究与转录文本转化为可复用的内容。该技能在 `transcript-intelligence`、`outlier-post-finder` 或 `creator-profile-teardown` 之后使用效果最佳，但也可以直接从 URL 开始。

## 何时使用

当用户提出以下需求时，使用此技能：

- 将视频或转录文本转化为帖子
- 对 TikTok、Reels、Shorts、播客或网络研讨会内容进行再利用
- 创作 LinkedIn 帖子、X 推文串、脚本、邮件通讯或博客大纲
- 根据表现优异的社媒创意构建内容日历
- 在不抄袭的前提下改编竞品/创作者的模式

## 工作流程

1. 收集源素材：URL、转录文本、帖子或研究报告。
2. 提取内容原子：钩子、故事、论点、框架、案例、数据点、CTA。
3. 选定输出格式和平台限制。
4. 按照用户的语气风格和受众进行改写。
5. 当创意受某个来源启发时，保留署名/内部备注。
6. 产出可直接使用的草稿，并可附上可选的变体。

## 输出格式

```markdown
# Repurposed Content Pack

## Source Material
- [source](url)

## Content Atoms
| Atom | Source | Best format |
|---|---|---|

## LinkedIn Posts
1. ...

## X Threads
1. ...

## Short-Form Scripts
### Script 1
- Hook:
- Body:
- CTA:

## Newsletter / Blog Ideas
- ...
```

## 常见误区

- 不要抄袭。借鉴的是结构与洞见，而非独特的措辞，除非在注明出处的前提下引用原文。
- 不要把每个平台都套成同一种格式。
- 如果原始钩子是最有力的部分，不要丢掉它。
