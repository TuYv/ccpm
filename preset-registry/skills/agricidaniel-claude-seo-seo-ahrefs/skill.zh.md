---
name: seo-ahrefs
description: Ahrefs API analyst (extension). Reads referring domains, backlinks, organic keywords, and content explorer data via the tested @ahrefs/mcp@0.0.11 server. Pairs with seo-backlinks for multi-source confidence weighting.
metadata:
  version: "2.2.4"
compatibility: "Tested with @ahrefs/mcp@0.0.11 (installed by extensions/ahrefs/install.sh)."
---
# seo-ahrefs

通过经过测试的 `@ahrefs/mcp@0.0.11` 服务器获取实时 Ahrefs 数据。
软件包检查（2026-07-10）：在更改此经过测试的版本之前，请验证当前 Ahrefs MCP 软件包的来源。

## 前置条件

- 使用此技能前，请运行 `extensions/ahrefs/install.sh`（Linux/macOS）或 `install.ps1`（Windows）。
- Ahrefs API 令牌（https://ahrefs.com/api）。
- MCP 服务器要求 `$PATH` 中存在 Node 18+。

在调用任何 Ahrefs 工具之前，请检查本次会话中是否有任意 Ahrefs MCP 工具可用，以验证 MCP 已连接。如果工具不可用，请告知用户扩展尚未安装，并提供上述安装命令。

## 路由

| 命令 | 操作 |
|---|---|
| `/seo ahrefs metrics <url>` | 域名/URL 评级、引用域名数量、自然流量估算 |
| `/seo ahrefs backlinks <url>` | 主要引用域名、锚文本分布、follow/nofollow 比率 |
| `/seo ahrefs organic <url>` | 自然关键词、排名分布、按国家/地区划分的流量 |
| `/seo ahrefs content <topic>` | Content Explorer 热门结果、社交分享数、引用域名 |

## 输出约定

- 为每项指标注明数据来源：“Ahrefs（实时，置信度 1.00）”。
- 当 Ahrefs 和 Moz 对同一指标的数据不一致时，以 Ahrefs 为准，并在报告中注明差异。
- 有毒链接评估：将 Ahrefs 反向链接质量信号与现有 seo-backlinks 的 Common Crawl + verify 爬虫信号相结合。

## 跨技能委派

- 对 Moz + Bing + Common Crawl + Ahrefs 进行多来源置信度加权时，交回 `seo-backlinks` 处理。
- 对 Ahrefs 和 DataForSEO 数据重叠的 SERP 功能进行分析时，实时 SERP 数据优先使用 DataForSEO。

## 成本防护措施

Ahrefs API 使用量按单位计费。在运行批处理（>= 50 个 URL）之前：

1. 使用 `claude-seo run dataforseo_costs.py` 估算成本（成本跟踪模块是通用的，并支持 Ahrefs 单位核算）。
2. 将估算结果提供给编排器。
3. 每次调用后记录实际成本。

这与 seo-dataforseo 技能使用的工作流程相同。