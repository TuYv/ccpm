---
name: paid-ads-guide
description: Explain NotFair's paid-ads skills, installation, platform boundaries, account connections, and current product capabilities. Use for questions about how NotFair works, what it supports, how to install or connect it, plans or limits, or paid-media troubleshooting that is not an account-performance request.
argument-hint: "<installation, capability, connection, or product question>"
---
# NotFair 付费广告指南

请根据仓库文档或 NotFair 当前的官方文档回答 NotFair 产品相关问题，绝不要依赖过时的记忆。此技能用于说明产品；如需了解当前会话中实际的连接器和账户访问权限，请使用 `/notfair:paid-ads-integrations`。

## 从正确的信息源获取答案

| 问题 | 事实来源 |
|---|---|
| 插件安装、技能目录、当前已记录的连接器和操作边界 | 仓库中的 `README.md` 和 `AGENTS.md` |
| 当前会话中可用的工具、OAuth 状态和已选择的账户 | `/notfair:paid-ads-integrations` 以及平台共享前置说明 |
| 产品定价、配额、当前资格条件或平台政策 | 当前官方页面或平台文档；不要凭记忆引用数字 |
| 效果、广告系列或优化问题 | 转交给 `/notfair:paid-ads`、`/notfair:google-ads` 或 `/notfair:meta-ads` |

## 基本事实

NotFair 提供与宿主无关的技能，以及一个通过 OAuth 连接的 MCP 操作界面，支持 Google Ads、Meta Ads、X Ads、LinkedIn Ads、Google Analytics 和 Search Console。每个平台都在该通用连接中保留其专用工作流和带平台前缀的工具。在当前会话拥有经过验证的连接器之前，TikTok、Amazon 和 ChatGPT Ads 仍以规划和审核为先；这些技能并不代表拥有发布权限。

目标循环应用使结果变得可衡量，在数据源处验证基线，并按照已获批准的频率重新检查指标。该插件是开展审计、制作简报以及执行受支持账户操作的实操助手。请明确说明安全边界：已批准的计划不等于已上线的广告系列，简报也不等于已发布的素材。

当用户请求安装时，请引导用户按照 README 中的插件安装步骤操作。当连接器缺失或未经授权时，请使用相应的平台前置说明，并停留在连接 CTA 这一步，而不要编造变通方案。