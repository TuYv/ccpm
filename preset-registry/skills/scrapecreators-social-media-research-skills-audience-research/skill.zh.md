---
name: audience-research
description: Use when the user wants to evaluate a creator, influencer, or brand audience using public profile signals, TikTok audience demographics, follower/following data, comments, geography, language, and content fit. Helps judge sponsorship and market fit.
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
# 受众研究

## 概述

评估某个创作者或社交媒体账号是否触达了正确的受众。此技能综合运用可获取的公开资料指标、TikTok 受众人口统计数据、地区信号、可获取时的粉丝/正在关注数据、评论、语言以及内容主题。

## 使用时机

当用户提出以下请求时使用此技能：

- 检查某个创作者的受众是否符合某个市场
- 比较不同创作者的受众匹配度
- 寻找以美国受众为主、面向特定国家或特定细分领域的创作者
- 评估赞助/网红营销机会
- 了解哪些人似乎会与某个账号互动

## 有用的数据源

- `/v1/tiktok/user/audience`
- `/v1/tiktok/profile/region`
- 各平台的资料（profile）端点
- 可获取时的粉丝/正在关注端点
- 近期帖子的评论
- 提供细分领域信号的简介链接页面和创作者店铺

## 工作流程

1. 拉取资料以及可获取的受众/人口统计数据。
2. 如果受众意图重要，则拉取近期内容和评论。
3. 提取地区、语言、细分领域、产品/品类以及社区信号。
4. 根据用户的目标市场为受众匹配度评分。
5. 基于公开数据的可靠程度标注置信度。

## 输出格式

```markdown
# Audience Research: {creator}

## Fit Summary
- Target market:
- Fit score: High/Medium/Low
- Confidence: High/Medium/Low

## Evidence
| Signal | Evidence | Source |
|---|---|---|

## Audience Notes
- Geography:
- Language:
- Niche/content fit:
- Comment quality:

## Sponsorship Recommendation
- Good fit / Maybe / Poor fit
- Why:
```

## 常见陷阱

- 不要凭感觉推断确切的人口统计数据。应使用可获取的证据并标注假设。
- 对于不公开受众详情的平台，不要对受众细节作出过度承诺。
- 不要忽视创作者所在地与受众所在地之间的不匹配。
