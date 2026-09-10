---
name: seo-seranking
description: SE Ranking AI visibility analyst (extension). Tracks AI Share-of-Voice across ChatGPT, Gemini, Perplexity, AI Overviews, and AI Mode in a single query.
metadata:
  version: "2.2.6"
compatibility: "Requires an SE Ranking API key (set SERANKING_API_KEY by running extensions/seranking/install.sh)."
---
# seo-seranking

通过 SE Ranking REST API 进行实时 AI 可见度跟踪。

## 前置条件

- 运行 `extensions/seranking/install.sh`（或 `install.ps1`）。
- 一个 SE Ranking API key（https://seranking.com/api.html）。
- 每次调用前，验证 `SERANKING_API_KEY` 是否存在于 `~/.claude/settings.json` 的 `env.` 下。如果不存在，告知用户运行安装程序。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo seranking ai-visibility <brand>` | 统计 `brand` 在 ChatGPT、Gemini、Perplexity、AI Overviews、AI Mode 中的声量份额 |
| `/seo seranking serp <keyword>` | 前 100 个自然搜索排名及 SERP 特性 |
| `/seo seranking backlinks <url>` | 反向链接概况（作为 Ahrefs / DataForSEO 的替代供应商来源） |
| `/seo seranking competitors <url>` | 前 10 个自然搜索竞争对手及共享关键词差距 |

## AI 声量份额评分

SE Ranking 会针对一组可配置的提示词，采样各个 AI 平台的响应，并统计其中的品牌提及情况。评分器采用与 Profound / Peec AI 相同的逻辑，但整合在一个 MCP/API 中。输出字段：

- `chatgpt_sov`：在采样提示词中，品牌出现在响应中的比例。
- `gemini_sov`：针对 Google Gemini 的相同比例。
- `perplexity_sov`：针对 Perplexity 的相同比例。
- `ai_overviews_sov`：品牌在 Google AI Overviews 中被引用的比例。
- `ai_mode_sov`：品牌在 Google AI Mode 中被引用的比例（首先使用美国英语）。

将每项报告为百分比，并根据样本量附上置信度说明。

## 成本控制

SE Ranking API 使用单位计费。单次 AI 可见度查询约消耗 5 个单位（每个平台 1 个单位）。使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_costs.py` 记录各供应商的支出。

## 跨技能委派

- 对于传统反向链接和内容审计，回退到 `seo-backlinks` / `seo-content`。
- 对于特定平台的深入分析（仅 ChatGPT、仅 Perplexity），优先使用专用的 `seo-geo` 技能，该技能包含品牌提及相关性指导。