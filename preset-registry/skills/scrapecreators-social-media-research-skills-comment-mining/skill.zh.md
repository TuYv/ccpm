---
name: comment-mining
description: Use when the user wants to mine comments and replies for audience reactions, customer language, questions, objections, complaints, product ideas, buying intent, sentiment, or voice-of-customer insights from public social posts and videos.
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
# 评论挖掘

## 概述

挖掘公开评论，发现人们真正在问什么、抱怨什么、想要什么、误解什么或反复提及什么。输出结果应服务于产品研究、内容创意、文案撰写、异议处理和受众理解。

## 何时使用

当用户提出以下请求时使用本技能：

- 分析 TikTok、YouTube 视频、Instagram Reel、Facebook 帖子、Reddit 帖子或 Rumble 视频下的评论
- 寻找受众的问题、异议、抱怨或购买意向
- 提取客户之声语言
- 从评论中寻找内容创意
- 了解围绕某条帖子、某位创作者、某个产品或某个话题的情绪倾向

## 评论来源

| 平台 | 端点 |
|---|---|
| TikTok 评论 | `/v1/tiktok/video/comments` |
| TikTok 回复 | `/v1/tiktok/video/comment/replies` |
| YouTube 评论 | `/v1/youtube/video/comments` |
| YouTube 回复 | `/v1/youtube/video/comment/replies` |
| Instagram 评论 | `/v2/instagram/post/comments` |
| Facebook 评论 | `/v1/facebook/post/comments` |
| Facebook 回复 | `/v1/facebook/post/comment/replies` |
| Reddit 评论 | `/v1/reddit/post/comments` |
| Rumble 评论 | `/v1/rumble/video/comments` |

## 工作流程

1. **抓取评论**
   - 尽量使用帖子/视频的 URL。
   - 当端点支持分页且用户希望深入分析时，进行分页抓取。
   - 保留评论文本、公开可见的作者、点赞/投票数、时间戳和来源 URL。

2. **轻度清洗**
   - 移除明显的垃圾信息和重复评论。
   - 俚语、错别字和情绪化措辞只要是有用的客户语言，就予以保留。
   - 不要对精确引用的原文过度规范化。

3. **对每条有用的评论进行分类**
   使用以下类别：
   - 问题
   - 异议
   - 抱怨/痛点
   - 赞扬
   - 困惑
   - 请求/功能建议
   - 购买意向
   - 争议/辩论
   - 玩笑/梗/文化信号

4. **主题聚类**
   - 将相似的评论归为一组。
   - 按出现频率和强度为主题打分。
   - 为每个主题标注精确引用的原话。

5. **将洞察转化为行动**
   根据用户的目标，输出：
   - 内容创意
   - FAQ 创意
   - 落地页文案切入角度
   - 产品创意
   - 异议应对要点
   - 销售/客服备注

## 输出格式

```markdown
# Comment Mining Report

## Summary
- Source(s): {urls}
- Comments analyzed: {count}
- Confidence: High/Medium/Low

## Top Themes
| Theme | Type | Frequency | Intensity | Representative quote |
|---|---|---:|---|---|

## Audience Questions
- "..."

## Objections and Concerns
- **Objection:** ...
  - Evidence: "..."
  - Response angle: ...

## Buying Intent / Demand Signals
- "..."

## Exact Language to Reuse
- "..."
- "..."

## Content Ideas From Comments
1. ...
2. ...
```

## 质量准则

- 标注样本规模和置信度。
- 区分单条声音很大的评论与反复出现的模式。
- 保留有用语言的精确引用。
- 避免仅凭单个帖子的评论就断言广泛的市场情绪。
- 在相关情况下，指出审核机制/平台带来的偏差。

## 常见误区

- 不要把评论压平为笼统的情绪倾向。价值在于问题、异议和原汁原味的措辞。
- 除非个人信息已经公开且确有必要，否则不要纳入可识别个人身份的细节。
- 不要把机器人/垃圾评论当作受众信号。
- 不要跳过 Reddit 帖子的上下文。对于 Reddit，原帖和评论都要阅读。
