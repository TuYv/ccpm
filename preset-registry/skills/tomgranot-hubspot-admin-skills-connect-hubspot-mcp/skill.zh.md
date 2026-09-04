---
name: connect-hubspot-mcp
description: "Connect Claude Code to HubSpot's official remote MCP server for natural-language CRM reads and writes. Covers OAuth setup, scope selection, verification, and when to use MCP versus this repo's API scripts."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: audit-planning
---
# 通过 MCP 将 Claude Code 连接到 HubSpot

配置 HubSpot 官方的远程 MCP 服务器，让 Claude 能以对话方式读写 CRM 记录——查询某个联系人、查看某家公司的交易、抽查清理工作的结果——而无需为每个问题编写脚本。

## 这个 MCP 服务器是什么（以及不是什么）

HubSpot 的远程 MCP 服务器（自 2026 年 4 月起正式可用）是位于 `mcp.hubspot.com` 的 OAuth 安全网关，它将 CRM 操作以工具的形式暴露给 Claude Code 等 MCP 客户端：

- **读写 CRM 对象**：联系人（contacts）、公司（companies）、交易（deals）、工单（tickets）、订单项（line items）、产品（products）、互动记录（engagements）
- **读取内容**：营销活动、落地页、网站页面、博客文章以及内容分析
- **创建内容**：落地页（2026 年 6 月新增）

它适合**交互式的、需要大量判断的工作**：抽查、分诊、一次性查询、小范围的定向修改。它不适合**批量操作**：批量归档数千个联系人、分页遍历，或任何需要 CSV 审计记录和中止阈值的事情。那是本仓库脚本的职责所在。两者共享同一个门户——可以同时使用。

| 任务形态 | 使用方式 |
|-----------|-----|
| “给我看看清理工作触及的 5 个联系人” | MCP |
| “为什么这家公司被归入 Tier 2？” | MCP |
| “检查一下本周被标记为退信的联系人” | MCP |
| “带审计记录地删除 4,000 个无邮箱联系人” | 脚本（`/delete-no-email-contacts`） |
| “创建 10 个细分列表” | 脚本（`/build-smart-lists`） |
| “把每个工作流导出为 JSON” | 脚本（`/workflows-as-code`） |

## 前提条件

- 一个 HubSpot 账户，以及一个有权限创建用户级应用的用户（如果门户启用了 MCP Auth Apps 治理，则需通过其审批）
- Claude Code（或其他 MCP 客户端）
- 这与脚本所使用的私有应用令牌是**相互独立**的——MCP 通过 OAuth 以*你本人*的身份连接，使用的是你的 HubSpot 权限

## 执行模式

### 阶段 1：规划

1. 确定要授予哪些权限范围（scopes）。先从只读开始（CRM 对象读取权限）；只有在希望 Claude 通过 MCP 进行修改时，才添加写入权限。
2. 与你的管理员确认门户是否限制了应用安装（App Install Governance）——MCP 连接可能需要审批。

### 阶段 2：执行——建立连接

**方案 A：适用于 Claude 的 HubSpot Connector（无需终端）。** 在 Claude 的连接器设置中添加 HubSpot 连接器，并在浏览器中完成 OAuth 流程。HubSpot 的指南：knowledge.hubspot.com > "Set up and use the HubSpot connector for Claude"。

**方案 B：MCP 客户端配置。** 将远程服务器添加到 Claude Code：

```bash
claude mcp add --transport http hubspot https://mcp.hubspot.com
```

然后在提示时完成身份验证——OAuth 流程会创建一个用户级应用，其权限范围由你批准的内容决定。

**方案 C：HubSpot CLI。** 在 HubSpot CLI v8.2.0+ 中，`hs mcp setup` 会引导你完成 MCP 客户端的连接，它还提供 HubSpot 的*本地开发者* MCP 服务器（面向应用开发而非 CRM 管理）。

### 阶段 3：之后——验证

让 Claude 执行一次无害的读取，并确认整个流程能走通：

> "Using the HubSpot MCP tools, fetch one contact and tell me its email and lifecycle stage."

如果调用失败：检查 OAuth 流程是否完成、权限范围中是否包含联系人读取权限、以及你的门户是否通过应用治理阻止了该连接。

## 回滚

- 在客户端设置中断开 MCP 服务器（在 Claude Code 中执行 `claude mcp remove hubspot`）。
- 在 HubSpot 中撤销连接：Settings > Integrations > Connected Apps——删除该用户级应用会使其令牌失效。

## 技术陷阱

1. **MCP 访问是用户级作用域的。** Claude 能做的恰好等于你的 HubSpot 用户能做的——不多也不少。批量高风险操作天然受限于你授予的权限范围；授予写入权限时要慎重。
2. **两套凭据，两种用途。** `HUBSPOT_ACCESS_TOKEN`（私有应用）为脚本提供动力；MCP 的 OAuth 连接为对话式访问提供动力。轮换其中一个不影响另一个。
3. **速率限制依然适用。** MCP 调用消耗的 API 容量与任何集成相同。不要用 MCP 进行大批量遍历——那是脚本的领地。
4. **无头（headless）环境。** 需要交互式 OAuth 的 MCP 服务器在定时任务/CI 运行中可能不可用。使用私有应用令牌的脚本在任何地方都能运行；把 MCP 当作交互层来用。
