---
name: product-demand-research
description: Use when the user wants to validate a product idea, find pain points, mine demand signals, discover objections, or gather voice-of-customer language from Reddit, social posts, video transcripts, and comments. Produces evidence-backed product research.
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
# 产品需求调研

## 概述

利用公开的社交数据，了解人们是否真的会在某个产品品类中抱怨、求助、购买、用变通办法绕过问题或推荐解决方案。产出的结果应帮助创始人和营销人员决定要构建什么、如何定位或测试什么。

## 何时使用

当用户提出以下请求时使用本技能：

- 验证一个创业或产品创意
- 找出某个细分领域的痛点
- 从 Reddit/TikTok/YouTube 评论中挖掘产品创意
- 寻找买家的用语和异议
- 了解人们目前在使用的替代方案
- 基于需求证据撰写营销信息

## 需要提取的信号

- 反复出现的抱怨
- "I wish" / "is there a tool" / "how do I" 等短语
- 变通做法以及电子表格/手工流程
- 对比和替代方案的提及
- 购买意向
- 对现有解决方案的异议
- 人们描述该问题时使用的原话

## 工作流程

1. 把创意转化为搜索查询词及其同义词。
2. 在 Reddit 和相关社交平台上搜索。
3. 抓取有潜力的帖子/视频的评论或文字稿。
4. 对痛点、触发因素、替代方案和期望成果进行聚类。
5. 根据频率、强度、时效性和付费意愿线索为需求打分。
6. 产出营销信息和产品层面的启示。

## 输出格式

```markdown
# Product Demand Research: {idea/category}

## Verdict
- Demand signal: Strong/Medium/Weak
- Confidence: High/Medium/Low
- Why:

## Pain Points
| Pain | Evidence | Exact language | Source |
|---|---|---|---|

## Existing Alternatives / Workarounds
- ...

## Objections and Barriers
- ...

## Messaging Angles
- "..."

## Product Ideas / Tests
1. ...
2. ...
```

## 常见误区

- 不要仅凭寥寥几条评论就宣称市场已获验证。
- 不要忽视反面证据或现有替代方案。
- 不要在转述中丢掉客户最原始、最有价值的表达。
