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

## 概述

AI Dev Jobs 是一个远程 MCP 服务器，让 AI 智能体可以访问 AI 与机器学习（ML）职位信息的实时索引。截至 2026 年 4 月 17 日，实时 MCP 统计数据显示：共有 8,405 个在招职位，分布于 489 家公司，薪资中位数为 $213,500，本周新增 600 个职位。智能体可以按职位、地点或公司搜索工作、检索完整的职位详情、列出正在招聘的公司、将职位与个人画像匹配，以及获取薪资或汇总的市场统计数据。它专为协助求职、招聘或劳动力市场分析的 AI 智能体而设计。

## 何时使用此技能

- 在帮助用户搜索 AI 或机器学习工程类工作时使用
- 当智能体需要查询哪些公司正在招聘特定 AI 职位时使用
- 在构建招聘或人才匹配工作流时使用
- 在分析 AI 就业市场（在招职位、头部公司、职位分布）时使用

## MCP 配置

将 AI Dev Jobs MCP 服务器添加到你的客户端配置中。该端点使用流式 HTTP（streamable HTTP），无需身份验证。

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

无需 API 密钥或身份验证。

## 可用工具

### `search_jobs`

按关键词、地点、公司或工作方式搜索职位索引。返回匹配的职位列表，包含职位名称、公司、地点和薪资信息。

```
search_jobs({ query: "machine learning engineer", location: "remote" })
```

### `get_job`

按 ID 检索特定职位列表的完整详情，包括职位描述、要求、薪资范围和申请链接。

```
get_job({ id: "abc123" })
```

### `list_companies`

列出索引中的所有公司及其在招职位数量。有助于发现哪些公司正在积极招聘。

```
list_companies({})
```

### `get_company`

检索特定公司的详情，包括端点提供的该公司可用的 AI 职位。

```
get_company({ id: "openai" })
```

### `get_stats`

获取就业市场的汇总统计信息：职位总数、按在招职位数排名的头部公司、职位分布和地点分布。

```
get_stats({})
```

### `match_jobs`

根据候选人画像、技能列表或偏好对职位进行匹配。

```
match_jobs({ skills: ["python", "llm", "pytorch"], workplace: "remote" })
```

### `get_salary_data`

在数据可用时，检索按职位、标签、级别或地点划分的薪资统计信息。

```
get_salary_data({ tag: "llm", level: "senior" })
```

### `list_tags`

列出已建立索引的标签，可用于筛选搜索或薪资分析。

```
list_tags({})
```

## 示例

### 示例 1：查找远程机器学习职位

```text
Use @ai-dev-jobs-mcp to find remote machine learning engineer positions.
```

智能体将调用 `search_jobs({ query: "machine learning engineer", location: "remote" })` 并返回匹配的职位列表。

### 示例 2：查看哪些公司正在招聘

```text
Use @ai-dev-jobs-mcp to list all companies currently hiring for AI roles.
```

智能体将调用 `list_companies({})` 并返回按在招职位数量排序的公司列表。

### 示例 3：获取就业市场概览

```text
Use @ai-dev-jobs-mcp to show current AI job market statistics.
```

智能体将调用 `get_stats({})` 并返回职位总数、头部雇主和职位分布的汇总数据。

### 示例 4：获取完整职位详情

```text
Use @ai-dev-jobs-mcp to get the full details for job ID abc123.
```

智能体将调用 `get_job({ id: "abc123" })` 并返回包含要求和申请链接的完整职位信息。

### 示例 5：将职位与候选人画像匹配

```text
Use @ai-dev-jobs-mcp to match remote LLM roles to a senior Python and PyTorch profile.
```

智能体将调用 `match_jobs({ skills: ["python", "llm", "pytorch"], workplace: "remote" })` 并返回合适的职位列表。

### 示例 6：比较薪资数据

```text
Use @ai-dev-jobs-mcp to compare senior LLM salary data.
```

智能体将调用 `get_salary_data({ tag: "llm", level: "senior" })` 并汇总可用的薪酬范围。

## 最佳实践

- 使用 `search_jobs` 配合具体关键词进行精准查询，而不是宽泛搜索
- 先使用 `list_companies` 发现公司，再用 `search_jobs` 按公司名称筛选进行针对性搜索
- 在深入具体职位之前，先使用 `get_stats` 为用户提供市场背景信息
- 当用户给出技能、资历、地点或工作方式偏好时，使用 `match_jobs`
- 仅将 `get_salary_data` 作为市场背景信息使用；提醒用户职位信息和薪酬变化很快
- 与简历或求职信技能结合，创建端到端的求职申请工作流

## 局限性

- 索引仅覆盖 AI 和机器学习职位；AI 领域之外的一般软件工程职位可能未被收录。
- 职位信息会定期刷新，但新发布的职位在出现前可能存在短暂延迟。
- 薪资数据仅在公司提供时才有；并非所有职位都包含薪资信息。
- 职位数量和薪资中位数是实时市场数据，在面向用户的输出中引用之前，应先通过 `get_stats` 刷新数据。

## 相关技能

- `@not-human-search-mcp` - 通过 MCP 发现适配 AI 的工具和 API
- `@mcp-builder` - 用于构建你自己的 MCP 服务器
