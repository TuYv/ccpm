---
name: seo-seranking
description: SE Ranking AI visibility analyst (extension). Tracks AI Share-of-Voice across ChatGPT, Gemini, Perplexity, AI Overviews, and AI Mode in a single query.
metadata:
  version: "2.2.5"
compatibility: "Requires an SE Ranking API key (set SERANKING_API_KEY by running extensions/seranking/install.sh)."
---
# seo-seranking

通过 SE Ranking REST API 实现实时 AI 可见性跟踪。

## 前置条件

- 运行 `extensions/seranking/install.sh`（或 `install.ps1`）。
- SE Ranking API 密钥（https://seranking.com/api.html）。
- 在进行任何调用之前，确认 `SERANKING_API_KEY` 是否存在于 `~/.claude/settings.json` 的 `env.` 下。如果不存在，告知用户运行安装程序。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo seranking ai-visibility <brand>` | 统计 `brand` 在 ChatGPT、Gemini、Perplexity、AI Overviews、AI Mode 中的声量份额 |
| `/seo seranking serp <keyword>` | 前 100 个自然搜索排名 + SERP 特性 |
| `/seo seranking backlinks <url>` | 反向链接概况（作为 Ahrefs / DataForSEO 的替代供应商来源） |
| `/seo seranking competitors <url>` | 前 10 个自然搜索竞争对手及共享关键词差距 |

## AI 声量份额评分

SE Ranking 会针对一组可配置的提示词，采样各 AI 平台的响应并统计品牌提及次数。评分器采用与 Profound / Peec AI 相同的逻辑，但集成在一个 MCP/API 中。输出字段：

- `chatgpt_sov`：品牌出现在采样提示词响应中的比例（%）。
- `gemini_sov`：相同指标，但针对 Google Gemini。
- `perplexity_sov`：相同指标，但针对 Perplexity。
- `ai_overviews_sov`：品牌在 Google AI Overviews 中的引用率。
- `ai_mode_sov`：品牌在 Google AI Mode 中的引用率（首先针对美国英语）。

将每项报告为百分比，并根据样本量附上置信度说明。

## 成本控制

SE Ranking API 使用单位计费。单次 AI 可见性查询约消耗
5 个单位（每个平台 1 个）。使用 `claude-seo run dataforseo_costs.py` 记录
各供应商的支出。

## 跨技能委派

- 对于传统反向链接 + 内容审计，回退到 `seo-backlinks` / `seo-content`。
- 对于特定平台的深入分析（仅 ChatGPT、仅 Perplexity），优先使用专门的 `seo-geo` 技能，其中包含 Brand Mention Correlation 指南。