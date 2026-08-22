---
name: paid-ads
description: Coordinate safe, evidence-based paid-media work across Google Ads, Meta Ads, X Ads, LinkedIn Ads, TikTok, Amazon, and ChatGPT Ads. Use for broad ads questions, multi-channel strategy, budgets, CPA or ROAS, campaign requests, spend, ad performance, or when routing to the right NotFair paid-ads skill.
argument-hint: "<goal, platform, or 'review my ads'>"
---
# 付费广告

在执行任何操作之前，请先阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。

从业务成果出发，而不是从平台请求出发。明确转化目标、转化价值或盈亏平衡阈值、目标指标、每日和每月预算、地域范围、落地页，以及追踪是否已验证。如果某项输入无法获得，请将由此产生的建议标记为草案，而不是用通用假设填补缺口。

## 任务分流

| 请求 | 使用 |
|---|---|
| 连接账户、发现访问权限或获取工作区上下文 | `/notfair:paid-ads-setup` 或 `/notfair:paid-ads-integrations` |
| 在进行更改前审计 Google 或 Meta | `/notfair:google-ads-audit` 或 `/notfair:meta-ads-audit` |
| 操作 Google 或 Meta 账户 | `/notfair:google-ads` 或 `/notfair:meta-ads` |
| 审计或操作 X Ads 或 LinkedIn Ads | `/notfair:paid-ads-x` 或 `/notfair:paid-ads-linkedin` |
| 规划新的跨渠道广告活动 | `/notfair:paid-ads-launch` |
| 查看每周/每月记分卡 | `/notfair:paid-ads-review` |
| 减少浪费或重新分配已批准的预算 | `/notfair:paid-ads-optimize` |
| 编写有证据支持的创意概念、文案或素材焕新测试 | `/notfair:paid-ads-creative` |
| 规划 TikTok、Amazon 或 ChatGPT Ads | `/notfair:paid-ads-tiktok`、`/notfair:paid-ads-amazon` 或 `/notfair:paid-ads-chatgpt` |

对于单一平台的请求，应直接分流，而不是重复专门的工作流。在承诺读取或写入账户之前，先确认该平台自身经过验证的连接器可用。

## 操作原则

先给出决策：哪些做法有效、哪些无效，以及最有依据、影响最大的一项行动。确保建议可衡量且可逆。广告活动计划、创意简报或预算分配表的状态为 `ready_for_review`；只有在平台确认具体对象和设置后，其状态才会变为 `published`。