---
name: Ahrefs Automation
description: "Automate SEO research with Ahrefs -- analyze backlink profiles, research keywords, track domain metrics history, audit organic rankings, and perform batch URL analysis through the Composio Ahrefs integration."
requires:
  mcp:
    - rube
---
# Ahrefs 自动化

直接在 Claude Code 中运行 **Ahrefs** SEO 分析。分析反向链接概况、进行关键词研究、随时间追踪域名权重、审计自然关键词排名，并在不离开终端的情况下批量分析多个 URL。

**工具包文档：** [composio.dev/toolkits/ahrefs](https://composio.dev/toolkits/ahrefs)

---

## 设置

1. 将 Composio MCP 服务器添加到你的配置中：
   ```
   https://rube.app/mcp
   ```
2. 按提示连接你的 Ahrefs 账号。代理会提供认证链接。
3. 大多数工具需要 `target`（域名或 URL）和 `country` 代码（ISO 3166-1 alpha-2）。有些工具还要求 `date`，格式为 `YYYY-MM-DD`。

---

## 核心工作流

### 1. 站点探索指标

检索域名的综合 SEO 指标，包括反向链接数量、引用域名、有机关键词排名和流量估算。

**工具：** `AHREFS_RETRIEVE_SITE_EXPLORER_METRICS`

关键参数：
- `target`（必填）-- 要分析的域名或 URL
- `date`（必填）-- 指标日期，格式为 `YYYY-MM-DD`
- `country` -- ISO 国家代码（例如 `us`、`gb`、`de`）
- `mode` -- 范围：`exact`、`prefix`、`domain` 或 `subdomains`（默认）
- `protocol` -- `both`、`http` 或 `https`
- `volume_mode` -- `monthly` 或 `average`

示例提示词：*“Get Ahrefs site metrics for example.com as of today in the US”*

---

### 2. 历史指标跟踪

跟踪域名的 SEO 指标随时间变化情况，用于趋势分析和竞争基准对比。

**工具：** `AHREFS_RETRIEVE_SITE_EXPLORER_METRICS_HISTORY`、`AHREFS_DOMAIN_RATING_HISTORY`

完整历史指标：
- `target`（必填）-- 要跟踪的域名
- `date_from`（必填）-- 开始日期，格式为 `YYYY-MM-DD`
- `date_to` -- 结束日期
- `history_grouping` -- `daily`、`weekly` 或 `monthly`（默认）
- `select` -- 列，如 `date,org_cost,org_traffic,paid_cost,paid_traffic`

对于域名评分（DR）历史：
- `target`（必填）、`date_from`（必填）、`date_to`、`history_grouping`

示例提示词：*“Show me the monthly Domain Rating history for example.com over the last year”*

---

### 3. 反向链接分析

检索包含源 URL、锚文本、链接属性和引用域名指标的综合反向链接列表。

**工具：** `AHREFS_FETCH_ALL_BACKLINKS`

关键参数：
- `target`（必填）-- 域名或 URL
- `select`（必填）-- 逗号分隔的列（例如 `url_from,url_to,anchor,domain_rating_source,first_seen_link`）
- `limit`（默认 1000）-- 结果数量
- `aggregation` -- `similar_links`（默认）、`1_per_domain` 或 `all`
- `mode` -- `exact`、`prefix`、`domain` 或 `subdomains`
- `history` -- `live`、`since:YYYY-MM-DD` 或 `all_time`
- `where` -- 对 `is_dofollow`、`domain_rating_source`、`anchor` 等列的富过滤表达式

示例提示词：*“Get the top 100 dofollow backlinks to example.com with anchor text and referring DR”*

---

### 4. 关键词研究

获取关键词概览指标，并发现匹配的关键词变体以支持内容策略。

**工具：** `AHREFS_EXPLORE_KEYWORDS_OVERVIEW`、`AHREFS_EXPLORE_MATCHING_TERMS_FOR_KEYWORDS`

关键词概览：
- `select`（必填）-- 要返回的列（volume、difficulty、CPC 等）
- `country`（必填）-- ISO 国家代码
- `keywords` -- 逗号分隔的关键词列表
- `where` -- 按 volume、difficulty、intent 等进行过滤

匹配词条：
- `select`（必填）和 `country`（必填）
- `keywords` -- 逗号分隔的种子关键词
- `match_mode` -- `terms`（任意顺序）或 `phrase`（完全顺序）
- `terms` -- `all` 或 `questions`（仅问题型关键词）

示例提示词：*“Find keyword variations for 'project management' in the US with volume and difficulty”*

---

### 5. 自然关键词审计

查看一个域名在自然搜索中的排名关键词，支持位置跟踪和历史对比。

**工具：** `AHREFS_RETRIEVE_ORGANIC_KEYWORDS`

关键参数：
- `target`（必填）-- 域名或 URL
- `country`（必填）-- ISO 国家代码
- `date`（必填）-- 日期，格式为 `YYYY-MM-DD`
- `select` -- 要返回的列（keyword、position、volume、traffic、URL 等）
- `date_compared` -- 与先前日期进行比较
- `where` -- 在 `keyword`、`volume`、`best_position`、意图标识等列上的富过滤表达式
- `limit`（默认 1000）、`order_by`

示例提示词：*“Show all organic keywords where example.com ranks in the top 10 in the US”*

---

### 6. 批量 URL 分析

同时分析最多 100 个 URL 或域名，用于比较竞争对手或站点各部分之间的 SEO 指标。

**工具：** `AHREFS_BATCH_URL_ANALYSIS`

关键参数：
- `targets`（必填）-- 包含 `url`、`mode`（`exact`/`prefix`/`domain`/`subdomains`）和 `protocol`（`both`/`http`/`https`）的对象数组
- `select`（必填）-- 列标识符数组
- `country` -- ISO 国家代码
- `output` -- `json` 或 `php`

示例提示词：*“Compare SEO metrics for competitor1.com, competitor2.com, and competitor3.com”*

---

## 常见陷阱

- **必须选择列：** 大多数 Ahrefs 工具都需要 `select` 参数来指定要返回的列。遗漏该参数或使用无效列名会导致报错。请参考每个工具的响应模式以确认有效标识符。
- **日期格式一致性：** 日期必须为 `YYYY-MM-DD` 格式。一些历史端点按 `history_grouping` 设置的粒度返回数据，而不是按精确日期返回。
- **API 单位成本不同：** 不同列消耗的单位数量不同。模式中标记为“(5 units)”或“(10 units)”的列更昂贵。请求如 `traffic`、`refdomains_source` 或 `difficulty` 等高消耗列时请监控 API 使用量。
- **批量上限为 100 个目标：** `AHREFS_BATCH_URL_ANALYSIS` 每次请求最多接受 100 个目标。更大规模分析请拆分为多个批次。
- **过滤表达式较复杂：** `where` 参数使用 Ahrefs 的过滤表达式语法，不是标准 SQL。请查阅每个工具模式中的列说明，确认支持的过滤类型和值格式。
- **offset 参数已弃用：** `offset` 参数已于 2024 年 5 月 31 日弃用。请改用基于游标的分页或调整 `limit`。
- **Mode 对范围影响显著：** 将 `mode` 设置为 `subdomains`（默认值）会包含所有子域名，与 `domain` 或 `exact` 相比可能显著增加结果数量。

---

## 快速参考

| 工具标识 | 描述 |
|---|---|
| `AHREFS_RETRIEVE_SITE_EXPLORER_METRICS` | 获取域名/URL 的当前 SEO 指标 |
| `AHREFS_RETRIEVE_SITE_EXPLORER_METRICS_HISTORY` | 随时间变化的历史 SEO 指标 |
| `AHREFS_DOMAIN_RATING_HISTORY` | 域名评分（DR）历史 |
| `AHREFS_FETCH_ALL_BACKLINKS` | 带过滤的综合反向链接列表 |
| `AHREFS_FETCH_SITE_EXPLORER_REFERRING_DOMAINS` | 引用域名列表 |
| `AHREFS_GET_SITE_EXPLORER_COUNTRY_METRICS` | 按国家划分的流量明细 |
| `AHREFS_BATCH_URL_ANALYSIS` | 最多 100 个 URL 的批量分析 |
| `AHREFS_EXPLORE_KEYWORDS_OVERVIEW` | 关键词指标概览 |
| `AHREFS_EXPLORE_MATCHING_TERMS_FOR_KEYWORDS` | 匹配关键词变体 |
| `AHREFS_EXPLORE_KEYWORD_VOLUME_BY_COUNTRY` | 各国家的关键词量 |
| `AHREFS_RETRIEVE_ORGANIC_KEYWORDS` | 域名的自然关键词排名 |
| `AHREFS_RETRIEVE_SITE_EXPLORER_KEYWORDS_HISTORY` | 历史关键词排名数据 |
| `AHREFS_RETRIEVE_TOP_PAGES_FROM_SITE_EXPLORER` | 按 SEO 指标表现最好的页面 |
| `AHREFS_GET_SERP_OVERVIEW` | 特定关键词的 SERP 概览 |

---

*由 [Composio](https://composio.dev) 提供支持*
