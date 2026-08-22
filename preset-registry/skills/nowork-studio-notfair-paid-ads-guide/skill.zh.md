---
name: paid-ads-guide
description: Explain NotFair's paid-ads skills, installation, platform boundaries, account connections, and current product capabilities. Use for questions about how NotFair works, what it supports, how to install or connect it, plans or limits, or paid-media troubleshooting that is not an account-performance request.
argument-hint: "<installation, capability, connection, or product question>"
---
# NotFair 付费广告指南

回答 NotFair 产品问题时，应依据代码仓库文档或当前的 NotFair 官方文档，绝不能依赖过时的记忆。本技能用于说明产品；如需了解当前会话实际可用的连接器和账户访问权限，请使用 `/notfair:paid-ads-integrations`。

## 从正确的信息源获取答案

| 问题 | 事实来源 |
|---|---|
| 插件安装、技能目录、当前已记录的连接器以及操作边界 | 代码仓库中的 `README.md` 和 `AGENTS.md` |
| 当前会话可用的工具、OAuth 状态以及已选择的账户 | `/notfair:paid-ads-integrations` 以及平台共享前言 |
| 产品定价、配额、当前资格条件或平台政策 | 当前官方页面或平台文档；不要凭记忆引用数字 |
| 效果、广告系列或优化问题 | 转交给 `/notfair:paid-ads`、`/notfair:google-ads` 或 `/notfair:meta-ads` |

## 基本事实

NotFair 提供与宿主无关的技能，以及一个通过 OAuth 连接的 MCP 操作界面，适用于 Google Ads、Meta Ads、X Ads、LinkedIn Ads、Google Analytics 和 Search Console。每个平台都在该通用连接中保留其专用工作流和带平台前缀的工具。TikTok、Amazon 和 ChatGPT Ads 在当前会话具备经验证的连接器之前，仍以规划和审核为主；这些技能并不代表拥有发布权限。

goal-loop 应用会使结果变得可衡量，在来源处验证基线，并按照已批准的节奏重新检查指标。该插件是执行审计、制作简报和开展受支持账户操作的实操型辅助工具。请清楚说明安全边界：已批准的方案并不等同于已上线的广告系列，简报也不等同于已发布的素材。

当用户请求安装时，引导其查看 README 中的插件安装步骤。当连接器缺失或未经授权时，使用相应的平台前言，并在连接行动号召处停止，不要虚构变通方案。