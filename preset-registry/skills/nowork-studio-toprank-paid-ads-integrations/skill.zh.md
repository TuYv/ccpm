---
name: paid-ads-integrations
description: Discover, connect, and verify NotFair paid-ad integrations and their actual capabilities. Use when asked to connect an ad account, configure an ads MCP, check available tools, troubleshoot access, or determine whether NotFair can read or change a platform.
argument-hint: "<platform or connection issue>"
---
# 付费广告集成

阅读 `../shared/operating-contract.md`。将工具发现结果视为事实依据；产品文档描述的是预期用途，而非当前会话的授权状态。

## 承诺前先验证

1. 检查可用工具列表。在通用 NotFair MCP 上，首先调用 `listConnectedPlatforms`。请求使用 Google 或 Meta 平台时，使用对应的共享前置说明；对于 X Ads 和 LinkedIn Ads，解析带平台前缀的工具，并在声称拥有访问权限之前，执行一次无害的账户/设置读取操作。
2. 当连接器提供无害的账户列表或读取操作时，使用该操作确认 OAuth/账户访问权限。
3. 记录确切的平台、所选账户、可访问的日期范围，以及该平台是只读还是支持变更操作。
4. 如果授权失败，请说明错误并提供文档中记录的连接路径。不要重试破坏性操作，也不要回退到其他账户。

## 能力映射

| 平台 | NotFair 路径 | 不可用时的安全响应 |
|---|---|---|
| Google Ads | 通用 NotFair MCP `google_ads_` 工具；使用 Google 共享前置说明 | 连接/重新进行身份验证，然后使用 Google 技能 |
| Meta Ads | 通用 NotFair MCP `meta_ads_` 工具；使用 Meta 共享前置说明 | 连接/重新进行身份验证，然后使用 Meta 技能 |
| X Ads | 通用 NotFair MCP `x_ads_` 工具；解析 `~~x-ads` | 连接/重新进行身份验证，然后使用 `/notfair:paid-ads-x` |
| LinkedIn Ads | 通用 NotFair MCP `linkedin_ads_` 工具；解析 `~~linkedin-ads` | 连接/重新进行身份验证，然后使用 `/notfair:paid-ads-linkedin` |
| TikTok、Amazon、ChatGPT Ads | 此插件未声明第一方 NotFair 平台支持 | 请求经过验证的连接器或导出文件；仅进行规划/审核 |

绝不要虚构路由器、端点、工具名称、账户 ID 或平台能力。当用户询问价格、配额和平台资格时，只能引用当前官方文档；不要根据某个方案或其他连接器进行推断。