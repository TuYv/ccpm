---
name: ai-dev-jobs-mcp
description: "Search 8,400+ AI and ML jobs across 489 companies, inspect listings and employers, match roles, and view salary and market stats via AI Dev Jobs MCP"
category: mcp
risk: safe
source: "https://aidevboard.com"
source_type: community
date_added: "2026-04-16"
author: unitedideas
tags: [mcp, jobs, ai-jobs, ml-jobs, recruiting, job-search, career]
tools: [claude, cursor, gemini]
---
# AI Dev Jobs MCP

## 概览

AI Dev Jobs 是一个远程 MCP 服务器，可让 AI 代理访问实时更新的 AI 与机器学习岗位列表索引。根据 2026 年 4 月 17 日的数据，实时 MCP 统计显示共有 8,405 个活跃岗位，覆盖 489 家公司，工资位数为 213,500 美元，并且本周新增 600 个岗位。代理可以按职位、地区或公司搜索岗位，检索完整职位详情，列出招聘公司，将岗位与个人简历匹配，并获取薪资或市场聚合统计数据。该服务器面向协助求职、招聘或劳动力市场分析的 AI 代理设计。

## 何时使用此 Skill

- 当帮助用户搜索 AI 或 ML 工程类岗位时使用
- 当代理需要查询哪些公司正在招聘特定 AI 岗位时使用
- 当构建招聘或人才匹配工作流时使用
- 当分析 AI 招聘市场（公开职位、顶级公司、岗位分布）时使用

## MCP 配置

将 AI Dev Jobs MCP 服务器添加到你的客户端配置。该端点使用可流式传输的 HTTP 且无需身份验证。

### Claude Desktop / Cursor / Windsurf

```json
{
  "mcpServers": {
    "ai-dev-jobs": {
      "url": "https://aidevboard.com/mcp"
    }
  }
}
```

无需 API key 或身份验证。

## 可用工具

### `search_jobs`

按关键字、地点、公司或工作安排搜索岗位索引。返回包含标题、公司、地点和薪资信息的匹配列表。

```
search_jobs({ query: "machine learning engineer", location: "remote" })
```

### `get_job`

按 ID 检索特定岗位的完整详情，包括岗位描述、要求、薪资区间和申请链接。

```
get_job({ id: "abc123" })
```

### `list_companies`

列出索引中所有公司及其空缺岗位数量。可用于发现当前正在积极招聘的公司。

```
list_companies({})
```

### `get_company`

检索特定公司的详情，包括端点提供的可选 AI 岗位。

```
get_company({ id: "openai" })
```

### `get_stats`

获取岗位市场的汇总统计数据：总岗位数、按空缺岗位数量最多的顶级公司、岗位分布和地区拆分。

```
get_stats({})
```

### `match_jobs`

根据候选人画像、技能列表或偏好匹配岗位。

```
match_jobs({ skills: ["python", "llm", "pytorch"], workplace: "remote" })
```

### `get_salary_data`

在可用时，检索岗位、标签、级别或地区的薪资统计数据。

```
get_salary_data({ tag: "llm", level: "senior" })
```

### `list_tags`

列出可用于筛选搜索或薪资分析的索引标签。

```
list_tags({})
```

## 示例

### 示例 1：查找远程 ML 岗位

```text
Use @ai-dev-jobs-mcp to find remote machine learning engineer positions.
```

代理将调用 `search_jobs({ query: "machine learning engineer", location: "remote" })` 并返回匹配的岗位。

### 示例 2：检查有哪些公司在招聘

```text
Use @ai-dev-jobs-mcp to list all companies currently hiring for AI roles.
```

代理将调用 `list_companies({})` 并按空缺岗位数量返回公司列表。

### 示例 3：获取岗位市场概览

```text
Use @ai-dev-jobs-mcp to show current AI job market statistics.
```

代理将调用 `get_stats({})` 并返回关于职位列表、顶级雇主和岗位分布的汇总数据。

### 示例 4：获取完整岗位详情

```text
Use @ai-dev-jobs-mcp to get the full details for job ID abc123.
```

代理将调用 `get_job({ id: "abc123" })` 并返回包含要求和申请链接的完整岗位信息。

### 示例 5：将岗位与候选人画像匹配

```text
Use @ai-dev-jobs-mcp to match remote LLM roles to a senior Python and PyTorch profile.
```

代理将调用 `match_jobs({ skills: ["python", "llm", "pytorch"], workplace: "remote" })` 并返回合适的岗位列表。

### 示例 6：对比薪资数据

```text
Use @ai-dev-jobs-mcp to compare senior LLM salary data.
```

代理将调用 `get_salary_data({ tag: "llm", level: "senior" })` 并汇总可用的薪酬区间。

## 最佳实践

- 使用 `search_jobs` 时优先使用具体关键字以获得更精准结果，而非过于宽泛的查询
- 先使用 `list_companies` 发现公司，再用公司名称过滤 `search_jobs` 进行聚焦检索
- 在深入具体岗位前，先使用 `get_stats` 为用户提供市场背景
- 当用户提供技能、资历、地区或工作安排偏好时使用 `match_jobs`
- 仅将 `get_salary_data` 作为市场参考，并提醒用户职位与薪酬会快速变化
- 结合简历或求职信技能，打造端到端的岗位申请工作流

## 局限性

- 索引仅覆盖 AI 与 ML 岗位；AI 以外的通用软件工程岗位可能不在其中。
- 岗位列表会定期刷新，但新发布可能会有短暂延迟。
- 薪资数据仅在公司提供时可获得；并非所有岗位都包含薪资信息。
- 数量和薪资中位数属于实时市场数据，应在向用户展示前通过 `get_stats` 进行刷新。

## 相关技能

- `@not-human-search-mcp` - 通过 MCP 发现可用于 AI 的工具和 API
- `@mcp-builder` - 用于构建你自己的 MCP 服务器
