---
name: ad-library-teardown
description: Use when the user wants to analyze active ads from Meta/Facebook, Google, or LinkedIn ad libraries; tear down a competitor's messaging; extract hooks, offers, CTAs, video transcripts, landing page claims, and test ideas from public ads.
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
# 广告素材库拆解

## 概述

分析公开广告，以理解竞争对手的传讯信息、优惠、创意策略和测试角度。输出应是一份实用的拆解，营销人员可以据此撰写更好的广告或决定测试什么内容。

## 何时使用

当用户提出以下要求时使用本技能：

- 分析竞争对手当前投放的广告
- 检索 Meta/Facebook、Google 或 LinkedIn 的广告素材库
- 提取广告钩子、CTA、主张、优惠和落地页切入角度
- 对比不同竞争对手的广告传讯
- 总结视频广告的文字记录
- 从竞争对手的广告中生成广告测试创意

## 数据来源

| 广告素材库 | 搜索/列表端点 | 详情端点 | 文字记录端点 |
|---|---|---|---|
| Meta/Facebook | `/v1/facebook/adLibrary/search/ads`, `/v1/facebook/adLibrary/company/ads`, `/v1/facebook/adLibrary/search/companies` | `/v1/facebook/adLibrary/ad` | `/v1/facebook/adLibrary/ad/transcript` |
| Google | `/v1/google/adLibrary/advertisers/search`, `/v1/google/company/ads` | `/v1/google/ad` | n/a |
| LinkedIn | `/v1/linkedin/ads/search` | `/v1/linkedin/ad` | n/a |

## 工作流程

1. **找到广告主**
   - 当用户只提供品牌名称时，使用公司搜索端点。
   - 当域名/广告主/主页 ID 可用时，直接使用。

2. **获取投放中的广告**
   - 除非用户要求历史分析，否则优先获取投放中的广告。
   - 记录平台、广告主/主页、广告 ID、开始日期、创意类型、正文、标题、CTA、目标 URL 和来源 URL。

3. **获取代表性广告的详情**
   - 使用详情端点为广告补充信息。
   - 对于 Meta 上的视频广告，在可用时获取文字记录。

4. **对传讯信息进行聚类**
   按以下维度对广告分组：
   - 痛点
   - 目标人群画像
   - 优惠
   - 证明/社会证明
   - 功能/利益
   - 处理的异议
   - 对比/替代方案角度
   - 紧迫感/折扣

5. **提取可借鉴的元素**
   - 钩子
   - 标题
   - 主要文案模式
   - CTA
   - 主张
   - 优惠
   - 视觉/创意概念

6. **推荐测试**
   基于反复出现的模式和空白提出测试建议，而非随机的想法。

## 输出格式

```markdown
# Ad Library Teardown: {brand}

## Summary
- Ads analyzed: {count}
- Platforms: Meta / Google / LinkedIn
- Main positioning:
- Strongest repeated offer:

## Messaging Angles
| Angle | Evidence | Example ads | Notes |
|---|---|---|---|

## Hooks and Headlines Swipe File
- "..."
- "..."

## Offers and CTAs
| Offer | CTA | Platform | Example |
|---|---|---|---|

## Video Transcript Notes
- [Ad](url): summary, hook, best quote

## What They Appear to Be Testing
1. ...
2. ...

## Recommended Tests for Us
1. ...
2. ...
3. ...

## Sources
- [Ad](url)
```

## 常见误区

- 不要仅因一条广告正在投放就断言它是「赢家」。只说明它正在投放或被反复投放；除非端点返回了相关数据，否则广告表现并不公开。
- 不要忽视被反复投放的广告。反复投放往往是有用的信号。
- 除非公开数据中包含，否则不要编造投放花费、转化率或定向信息。
- 当用户想要视频广告的钩子或传讯信息时，不要跳过视频文字记录。
