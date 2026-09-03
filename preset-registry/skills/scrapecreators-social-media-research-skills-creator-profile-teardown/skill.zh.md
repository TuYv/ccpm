---
name: creator-profile-teardown
description: Use when the user wants to analyze a creator, influencer, founder, or brand social account and understand positioning, content pillars, outlier posts, hooks, format choices, audience reaction, and what can be copied or tested.
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
# 创作者账号拆解

## 概述

对一个创作者或品牌账号进行实用拆解。说明这个账号是做什么的、内容为何看起来有效、哪些模式在反复出现，以及用户应当照搬、改造或避开哪些内容。

## 何时使用

当用户提出以下要求时使用此技能：

- 分析某个创作者或品牌账号
- 解释某个账号为何在增长或表现良好
- 从单一创作者的内容中整理借鉴素材库（swipe file）
- 识别内容支柱、钩子、CTA 和内容形式
- 了解应从竞争对手或创作者那里借鉴什么

## 工作流程

1. 获取账号主页的元数据和公开链接。
2. 获取近期帖子并识别表现远超平均的离群内容。
3. 如有需要，获取最佳案例的文字稿/评论。
4. 识别定位、承诺、细分领域、受众和反复出现的主题。
5. 提取钩子、形式、系列、CTA 和视觉模式。
6. 总结经验教训和建议进行的测试。

## 输出格式

```markdown
# Creator Profile Teardown: {creator}

## Positioning
- Who they serve:
- Promise:
- Personality/voice:

## Content Pillars
| Pillar | Evidence | Example posts |
|---|---|---|

## Outlier Posts
| Post | Metric | Lift/why it matters | Pattern |
|---|---:|---|---|

## Hooks and Formats to Steal
- ...

## What Not to Copy
- ...

## Tests for Us
1. ...
```

## 常见误区

- 不要把拆解简化成一份账号概要。要找出可复用的运作机制。
- 不要复制个人细节或私密信息。
- 不要从表现直接推断因果关系。要说明证据表明了什么。
