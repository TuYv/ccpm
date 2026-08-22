---
name: paid-ads-guide
description: Explain NotFair's paid-ads skills, installation, platform boundaries, account connections, and current product capabilities. Use for questions about how NotFair works, what it supports, how to install or connect it, plans or limits, or paid-media troubleshooting that is not an account-performance request.
argument-hint: "<installation, capability, connection, or product question>"
---
# NotFair 付费广告指南

请根据代码库文档或 NotFair 当前的官方文档回答 NotFair 产品问题，绝不要依赖过时的记忆。本技能用于说明产品；如需了解当前会话中实际的连接器和账户访问权限，请使用 `/notfair:paid-ads-integrations`。

## 从正确的来源获取答案

| 问题 | 事实来源 |
|---|---|
| 插件安装、技能目录、当前文档中列出的连接器及操作边界 | 代码库中的 `README.md` 和 `AGENTS.md` |
| 当前会话中可用的工具、OAuth 状态及所选账户 | `/notfair:paid-ads-integrations` 以及平台共享前言 |
| 产品定价、配额、当前资格要求或平台政策 | 当前官方页面或平台文档；不要凭记忆引用数字 |
| 效果、广告系列或优化问题 | 转交给 `/notfair:paid-ads`、`/notfair:google-ads` 或 `/notfair:meta-ads` |

## 基本事实

NotFair 提供与宿主无关的技能，以及一个通过 OAuth 连接的 MCP 操作界面，适用于 Google Ads、Meta Ads、X Ads、LinkedIn Ads、Google Analytics 和 Search Console。每个平台都在这一通用连接中保留其专用工作流和带平台前缀的工具。在会话拥有经过验证的连接器之前，TikTok、Amazon 和 ChatGPT Ads 仍以规划/审核为先；这些技能并不代表拥有发布权限。

目标循环应用会让成果变得可衡量，在数据源处验证基线，并按照获批的节奏重新检查指标。该插件是开展审计、编写简报以及执行受支持账户操作的实操助手。请明确说明安全边界：获批的计划并不等同于已上线的广告系列，简报也不等同于已发布的素材。

当用户请求安装时，请引导用户按照 README 中的插件安装步骤操作。当连接器缺失或未经授权时，请使用相应的平台前言，并在连接 CTA 处停止，而不要虚构变通办法。