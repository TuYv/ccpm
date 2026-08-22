---
name: paid-ads-setup
description: Connect NotFair paid-ad accounts and establish reusable campaign context. Use when setting up paid media in a new workspace, connecting Google, Meta, X, or LinkedIn Ads, refreshing brand context, or preparing an agent to work on ads safely.
argument-hint: "<connect accounts, workspace, or brand>"
---
# 付费广告设置

阅读 `../shared/operating-contract.md`。设置期间不要更改广告活动。

## 建立访问权限

1. 在通用 NotFair MCP 上检测请求的平台。调用 `listConnectedPlatforms`，然后对 Google Ads 和 Meta Ads 使用现有的共享前置流程，或使用 `x_ads_` 和 `linkedin_ads_` 工具接口。如果请求的平台缺失，引导用户在 NotFair 中连接该平台，并在声称已获得访问权限之前停止操作。
2. 仅列出已连接接口实际返回的账户。如果有多个可用账户，让用户选择目标账户；绝不要根据账户名称进行推断。
3. 对于 TikTok、Amazon 和 ChatGPT Ads，在提议连接之前检查可用工具。如果不存在经过验证的连接器，请求用户提供最新导出数据，或说明仅限规划的边界。

## 获取足以支持决策的背景信息

阅读与营销明显相关的项目文档，然后仅询问数据无法确定的缺失信息：

- 产品、优惠方案、地理区域和主要转化目标；
- 单位经济效益：目标 CPA 或盈亏平衡 ROAS、利润率和客户价值；
- 已批准的宣传主张、差异化优势、排除项和品牌语调；
- 月度预算、发布限制、季节性因素和竞争对手；
- 落地页 URL 以及分析/跟踪负责人。

在支持的情况下，使用 Google 和 Meta 审计技能持久化特定账户的业务背景信息。对于 X 和 LinkedIn，报告所选账户及相关背景信息，不要虚构持久化接口。不要将覆盖现有 `AGENTS.md`、`CLAUDE.md` 或项目指令作为设置过程的副作用。仅在用户批准确切位置和内容后，才提供明确标记的付费媒体背景信息文件。

## 最后提供缺口登记表

报告已连接的平台、所选账户、已验证的转化信号、可用日期范围以及最小的下一步操作。明确说明缺失的跟踪、经济效益数据、宣传主张证明或平台访问权限。移交至 `/notfair:paid-ads-review` 以建立基线，移交至 `/notfair:paid-ads-launch` 以创建新广告活动，或移交至相应平台审计以进行更深入的诊断。