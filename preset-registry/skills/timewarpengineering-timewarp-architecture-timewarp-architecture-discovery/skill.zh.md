---
name: timewarp-architecture-discovery
description: Locate agent-facing discovery surfaces on a TimeWarp.Architecture template host (llms.txt, auth.md, OpenAPI, MCP/A2A cards, Agent Skills index, markdown negotiation). Use when scanning or onboarding against this host.
---
# TimeWarp.Architecture — 探索地图

稳定的根相对路径。请相对于提供本技能的 origin 进行解析。

## 从这里开始

| 界面 | 路径 |
|---------|------|
| 探索索引 | `/llms.txt` |
| 认证说明 | `/auth.md` |
| 主页（markdown 对应版） | `/index.md`（也可对 `/` 发送 `Accept: text/markdown`） |
| 爬取策略 + 内容信号 | `/robots.txt` |
| 站点地图 | `/sitemap.xml` |
| OpenAPI | `/openapi/v1.json` |
| Scalar UI | `/scalar/v1` |
| 健康检查 | `/api/health` |

## 协议卡片（v1 最小版）

| 卡片 | 路径 |
|------|------|
| MCP 服务器卡片 | `/.well-known/mcp/server-card.json`（别名 `/.well-known/mcp.json`） |
| Agent Skills 索引 | `/.well-known/agent-skills/index.json` |
| A2A 智能体卡片 | `/.well-known/agent-card.json`（别名 `/.well-known/agent.json`） |

**如实说明：** 在 streamable-HTTP MCP 传输推出之前，MCP 卡片只是一个可发现性占位（不要虚构工具）。A2A 卡片是未签名的 v1 发现元数据；完整的 A2A JSON-RPC 任务协议尚未托管。索引中列出的 Agent Skills 是实际存在的 markdown 工件。

## Markdown 内容协商

```bash
curl -sS -H 'Accept: text/markdown' https://<host>/
curl -sS https://<host>/index.md
curl -sS https://<host>/auth.md
```

浏览器使用 `Accept: text/html` 时，仍会提供 Blazor SPA。

## 内容使用偏好

`ai-train=yes, search=yes, ai-input=yes` — 详见 `/robots.txt`。

## 不要虚构的内容

- 不要假设存在邮箱/密码注册。
- 除非 `/llms.txt` / `/auth.md` 中给出了链接，否则不要假设存在付费的 x402 tip/meter URL。
- 免费/探索类路由绝不返回 HTTP 402；支付被禁用时，付费路由返回 503。
