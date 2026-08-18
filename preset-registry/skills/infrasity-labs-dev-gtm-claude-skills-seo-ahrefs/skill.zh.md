---
name: seo-ahrefs
description: Ahrefs API analyst (extension). Reads referring domains, backlinks, organic keywords, and content explorer data via the official @ahrefs/mcp server. Pairs with seo-backlinks for multi-source confidence weighting.
metadata:
compatibility: "Requires the official @ahrefs/mcp server (installed by extensions/ahrefs/install.sh)."
---
# seo-ahrefs

通过官方 `@ahrefs/mcp` 服务器获取实时 Ahrefs 数据。

## 前置条件

- 使用此技能前，运行 `extensions/ahrefs/install.sh`（Linux/macOS）或 `install.ps1`（Windows）。
- Ahrefs API 令牌（https://ahrefs.com/api）。
- MCP 服务器要求 `$PATH` 中包含 Node 18+。

在调用任何 Ahrefs 工具之前，请通过检查当前会话中是否有任意 Ahrefs MCP 工具可用，验证 MCP 是否已连接。如果工具不可用，请告知用户该扩展尚未安装，并提供上述安装命令。

## 路由

| 命令 | 操作 |
|---|---|
| `/seo ahrefs metrics <url>` | 域名/URL 评级、引用域名数量、自然流量估算 |
| `/seo ahrefs backlinks <url>` | 主要引用域名、锚文本分布、follow/nofollow 比率 |
| `/seo ahrefs organic <url>` | 自然关键词、排名分布、按国家/地区划分的流量 |
| `/seo ahrefs content <topic>` | Content Explorer 热门结果、社交分享量、引用域名 |

## 输出规范

- 为每项指标注明数据来源："Ahrefs（实时，置信度 1.00）"。
- 当 Ahrefs 与 Moz 对同一指标的数据不一致时，以 Ahrefs 为准，并在报告中注明差异。
- 有害链接评估：将 Ahrefs Spam Score 与现有的 seo-backlinks Common Crawl 数据结合，并验证爬虫信号。

## 跨技能委派

- 对 Moz + Bing + Common Crawl + Ahrefs 进行多数据源置信度加权时，交回 `seo-backlinks` 处理。
- 对 Ahrefs 与 DataForSEO 数据重叠的 SERP 特性进行分析时，实时 SERP 数据优先采用 DataForSEO。

## 成本护栏

Ahrefs API 使用量按单位计费。运行批处理（>= 50 个 URL）之前：

1. 使用 `python scripts/dataforseo_costs.py` 估算成本（成本跟踪模块是通用的，支持 Ahrefs 单位核算）。
2. 向编排器展示估算结果。
3. 每次调用后记录实际成本。

这与 seo-dataforseo 技能使用的工作流相同。