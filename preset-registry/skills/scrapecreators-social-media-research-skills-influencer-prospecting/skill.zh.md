---
name: influencer-prospecting
description: Use when the user wants to find creators, influencers, affiliates, or social accounts in a niche for outreach, partnerships, sponsorships, UGC, seeding, or competitive research. Produces scored prospect lists from public social data.
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
# 红人寻访拓客

## 概述

基于公开社交数据构建实用的创作者潜在客户名单。目标是在细分领域中找到匹配的账号，具备足够的触达量，并有证据表明其内容或受众与需求契合。

## 适用场景

当用户提出以下需求时使用本技能：

- 寻找某个细分领域中的网红或创作者
- 构建 UGC、联盟营销、赞助或种草投放名单
- 寻找互动表现强劲的微型网红
- 识别已经在谈论某产品品类的创作者
- 将潜在客户名单导出为 CSV

## 有用的数据来源

- TikTok 搜索用户、热门创作者、个人主页、主页视频、受众画像数据
- Instagram 搜索个人资料、个人主页、帖子、Reels
- YouTube 搜索及频道详情
- 生物链接（link-in-bio）服务：Linktree、Komi、Pillar、Linkbio、Linkme
- 在相关情况下展示 Amazon Shop 与 TikTok Shop

## 评分框架

对每个潜在对象按以下维度打 1–5 分：

- **细分契合度** — 内容与品类明确匹配
- **受众契合度** — 在公开数据可支持时，考察国家/语言/平台的匹配情况
- **触达量** — 粉丝/订阅数及近期播放量
- **互动质量** — 评论看起来真实且切题
- **品牌安全** — 是否存在明显的争议或形象错配风险
- **可联络性** — 是否有公开链接/邮箱/联系途径

## 输出格式

```markdown
# Influencer Prospect List: {niche}

| Creator | Platform | Followers | Recent views | Fit | Contact path | Notes |
|---|---|---:|---:|---:|---|---|

## Best Fits
1. ...

## Outreach Angles
- ...

## CSV
```csv
creator,platform,profile_url,followers,recent_views,fit_score,contact_path,notes
```
```

## 常见误区

- 不要把粉丝数量多等同于契合度高。
- 不要抓取或披露私人联系方式。只使用公开链接。
- 当主页公开数据有限时，不要掩盖不确定性。
