---
name: deep-research
description: Multi-source deep research using firecrawl and exa MCPs. Searches the web, synthesizes findings, and delivers cited reports with source attribution. Use when the user wants thorough research on any topic with evidence and citations.
origin: ECC
---
# 深度研究

> **易发生变化的技能。** Firecrawl/Exa MCP 工具名称、配额和结果
> 结构可能会发生变化。在承诺覆盖范围或引用实时来源数量之前，
> 请核实已配置的 MCP 工具和当前 API 文档。

使用 firecrawl 和 exa MCP 工具，基于多个网络来源生成详尽且带有引用的研究报告。

## 何时启用

- 用户要求深入研究任何主题
- 竞争分析、技术评估或市场规模测算
- 对公司、投资者或技术进行尽职调查
- 任何需要综合多个来源信息的问题
- 用户提到“研究”“深入探讨”“调查”或“当前状况如何”

## MCP 要求

至少满足以下一项：
- **firecrawl** — `firecrawl_search`、`firecrawl_scrape`、`firecrawl_crawl`
- **exa** — `web_search_exa`、`web_search_advanced_exa`、`crawling_exa`

两者结合可实现最佳覆盖范围。在 `~/.claude.json` 或 `~/.codex/config.toml` 中进行配置。

## 工作流程

### 第 1 步：了解目标

快速提出 1-2 个澄清问题：
- “你的目标是什么——学习、做决策，还是撰写内容？”
- “你是否希望聚焦于某个特定角度或达到某种深度？”

如果用户说“直接研究就行”——采用合理的默认设置并继续后续步骤。

### 第 2 步：规划研究

将主题拆分为 3-5 个研究子问题。示例：
- 主题：“AI 对医疗保健的影响”
  - 当前 AI 在医疗保健领域的主要应用有哪些？
  - 已经衡量了哪些临床结果？
  - 面临哪些监管挑战？
  - 哪些公司在该领域处于领先地位？
  - 市场规模和增长趋势如何？

### 第 3 步：执行多来源搜索

针对每个子问题，使用可用的 MCP 工具进行搜索：

**使用 firecrawl：**
```
firecrawl_search(query: "<sub-question keywords>", limit: 8)
```

**使用 exa：**
```
web_search_exa(query: "<sub-question keywords>", numResults: 8)
web_search_advanced_exa(query: "<keywords>", numResults: 5, startPublishedDate: "2025-01-01")
```

**搜索策略：**
- 每个子问题使用 2-3 种不同的关键词组合
- 混合使用通用查询和侧重新闻的查询
- 目标是总计获取 15-30 个不同的来源
- 优先级：学术来源、官方来源、信誉良好的新闻媒体 > 博客 > 论坛

### 第 4 步：深入阅读关键来源

对于最有价值的 URL，获取完整内容：

**使用 firecrawl：**
```
firecrawl_scrape(url: "<url>")
```

**使用 exa：**
```
crawling_exa(url: "<url>", tokensNum: 5000)
```

完整阅读 3-5 个关键来源，以获得深入信息。不要仅依赖搜索摘要。

### 第 5 步：综合信息并撰写报告

报告结构如下：

```markdown
# [Topic]: Research Report
*Generated: [date] | Sources: [N] | Confidence: [High/Medium/Low]*

## Executive Summary
[3-5 sentence overview of key findings]

## 1. [First Major Theme]
[Findings with inline citations]
- Key point ([Source Name](url))
- Supporting data ([Source Name](url))

## 2. [Second Major Theme]
...

## 3. [Third Major Theme]
...

## Key Takeaways
- [Actionable insight 1]
- [Actionable insight 2]
- [Actionable insight 3]

## Sources
1. [Title](url) — [one-line summary]
2. ...

## Methodology
Searched [N] queries across web and news. Analyzed [M] sources.
Sub-questions investigated: [list]
```

### 第 6 步：交付

- **简短主题**：在聊天中发布完整报告
- **长篇报告**：发布执行摘要和关键要点，并将完整报告保存到文件中

## 使用子代理开展并行研究

对于宽泛的主题，使用 Claude Code 的 Task 工具进行并行处理：

```
Launch 3 research agents in parallel:
1. Agent 1: Research sub-questions 1-2
2. Agent 2: Research sub-questions 3-4
3. Agent 3: Research sub-question 5 + cross-cutting themes
```

每个代理分别进行搜索、阅读信息源并返回研究结果。主会话将这些结果综合成最终报告。

## 质量规则

1. **每项论断都需要信息源。** 不得做出无来源的断言。
2. **交叉核对。** 如果只有一个信息源提及某项内容，应将其标记为未经验证。
3. **时效性很重要。** 优先使用过去 12 个月内的信息源。
4. **承认信息缺口。** 如果无法找到某个子问题的高质量信息，应如实说明。
5. **不得产生幻觉。** 如果不知道，就说“未找到足够的数据”。
6. **区分事实与推断。** 明确标注估算、预测和观点。

## 示例

```
"Research the current state of nuclear fusion energy"
"Deep dive into Rust vs Go for backend services in 2026"
"Research the best strategies for bootstrapping a SaaS business"
"What's happening with the US housing market right now?"
"Investigate the competitive landscape for AI code editors"
```