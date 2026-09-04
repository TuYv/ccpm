---
name: audit-api-usage
description: "Inventory the integrations, private apps, and internal tooling that call HubSpot APIs, and flag anything on legacy v1-v4 endpoints ahead of HubSpot's March 30, 2027 end of support. Produces a migration checklist to date-based API versions."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: audit-planning
---
# 在 2027 版本截止日期前审计 API 使用情况

2026 年 3 月，HubSpot 用基于日期的版本（`/2026-03/` 风格的路径，每年发布两次，每次支持 18 个月）取代了语义化 API 版本号（v1-v4）。所有仍在调用 v1-v4 端点的部分——包括旧版 OAuth v1——将于 **2027 年 3 月 30 日起不再受支持**。本技能会对你的技术栈中调用 HubSpot 的部分进行盘点，并生成一份迁移清单。

## 为什么这很重要

这个截止日期造成的失败是悄无声息的：不再受支持的 API 将“不再收到更新、缺陷修复或稳定性保证”，而未迁移的 marketplace 应用则面临失去认证的风险。一个门户通常拥有的调用方比任何人记得的都要多——私有应用、marketplace 应用、中间件（Zapier/Make）、表单嵌入、内部脚本、数据仓库同步。要么现在花一个下午把它们找出来，要么将来面对一次事故。

## 关键事实

| 事实 | 详情 |
|------|--------|
| 当前推荐版本 | `2026-03` |
| 发布节奏 | 每年 3 月和 9 月 |
| 支持生命周期 | 当前（6 个月）→ 受支持（至 18 个月）→ 不受支持 |
| v1–v4 支持终止 | **2027 年 3 月 30 日** |
| 同时弃用 | 旧版 v1 OAuth API（令牌签发/内省） |

## 前置条件

- 超级管理员（Super Admin）权限（用于查看 Integrations 设置和私有应用日志）
- 可选：一个私有应用令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），用于账户级使用量查询
- 能够访问任何内部集成的源代码

## 执行模式

### 阶段 1：规划

与用户确认：已知有哪些系统会用到 HubSpot（CRM 同步、网站表单、分析管道、内部脚本），以及各自由谁负责。

### 阶段 2：事前——构建调用方清单

逐一排查每个发现来源，把每个调用方记录到一份清单中（负责人、用途、所用的端点/版本）：

1. **私有应用**：Settings > Integrations > Private Apps。打开每个应用 > **Logs**——API 调用日志会显示确切的请求路径（`/crm/v3/...`、`/contacts/v1/...`），据此可以看出所使用的版本。
2. **已连接应用/marketplace 应用**：Settings > Integrations > Connected Apps。你无法看到它们的内部实现；记录下每个供应商——HubSpot 正在推动已认证应用完成迁移，但对业务关键型应用，请与供应商核实。
3. **内部代码库**：用 grep 搜索能暴露版本的匹配模式：
   ```bash
   grep -rEn "api\.hubapi\.com/[a-z-]+/v[0-9]|/contacts/v1|/email/public/v1|hubapi.com/automation/v[23]" .
   ```
4. **中间件**（Zapier、Make、Workato、n8n）：平台管理的连接器会按平台方的时间表迁移；但其中的自定义 HTTP 步骤不会——需要手动检查。
5. **账户范围的 API 使用量**（可选的脚本检查）：account-info API 会报告私有应用的每日 API 使用量总计：
   ```python
   resp = requests.get(f"{BASE}/account-info/v3/api-usage/daily", headers=HEADERS)
   ```
   这只能确认*有多少*流量，无法确认用的是哪些版本——版本细节请使用第 1 步中的各应用日志。

### 阶段 3：执行——分类并规划迁移

对每个调用方进行分类：

| 状态 | 含义 | 行动 |
|--------|---------|--------|
| **红色** | 调用 v1/v2 旧版端点（例如 `/contacts/v1/`、`/email/public/v1/`、forms v2）或旧版 OAuth v1 | 立即迁移——其中许多此前就已设有更早的下线日期 |
| **黄色** | 调用 v3/v4 端点 | 在 2027-03-30 之前仍可正常工作；安排迁移到基于日期的 `2026-03` 路径 |
| **绿色** | 调用基于日期的路径，或由供应商管理且已确认正在迁移 | 持续关注 |

对于黄色/红色的内部代码，迁移通常是机械性的——资源不变，只是路径前缀换成新的，有时还有一些字段会改名；具体请查阅 HubSpot 文档中相应端点的迁移说明。按代码库（而非按端点）分批推进这项工作。

本仓库自己的脚本在设计上就属于**黄色**：它们调用 `/crm/v3/` 和 `/automation/v4/`，支持期到 2027 年 3 月，迁移路径已记录在 `CONTRIBUTING.md` 中。

### 阶段 4：事后

1. 清单中的每个调用方都有状态和负责人。
2. 红色条目已有带日期的迁移工单；黄色条目已排期在 2027-03 之前。
3. 每 6 个月重新运行一次此类审计——每次 3 月/9 月的发布都会开启一个新的支持周期。

## 回滚

只读操作——无需回滚。

## 技术陷阱

1. **私有应用日志才是事实依据。** 代码 grep 会漏掉动态构建的 URL；Settings 中的各应用请求日志才能显示实际调用了什么。
2. **404、403 与不受支持的区别。** 支持结束后，端点可能还会继续正常工作一段时间——“不受支持”意味着没有修复和保证，而不是立即关停。不要把“它还能用”当作“我们没问题”。
3. **OAuth 也是其中的一部分。** 使用旧版 v1 OAuth 令牌端点的应用必须迁移到基于日期的 OAuth API，即使它们的数据端点已经是最新的。
4. **SDK 版本会锁定 API 版本。** 如果某个集成使用了 HubSpot 官方 SDK，SDK 的主版本号决定了它调用的 API 版本——请查看 SDK 的变更日志，而不只是你自己的代码。
