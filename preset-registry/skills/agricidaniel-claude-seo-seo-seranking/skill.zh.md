---
name: seo-seranking
description: SE Ranking AI visibility analyst (extension). Tracks AI Share-of-Voice across ChatGPT, Gemini, Perplexity, AI Overviews, and AI Mode in a single query.
metadata:
  version: "2.2.4"
compatibility: "Requires an SE Ranking API key (set SERANKING_API_KEY by running extensions/seranking/install.sh)."
---
# seo-seranking

通过 SE Ranking REST API 实时跟踪 AI 可见度。

## 前提条件

- 运行 `extensions/seranking/install.sh`（或 `install.ps1`）。
- 一个 SE Ranking API 密钥（https://seranking.com/api.html）。
- 在进行任何调用之前，确认 `SERANKING_API_KEY` 位于 `~/.claude/settings.json` 的 `env.` 下。如果不存在，请告知用户运行安装程序。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo seranking ai-visibility <brand>` | `brand` 在 ChatGPT、Gemini、Perplexity、AI Overviews 和 AI Mode 中的声量份额 |
| `/seo seranking serp <keyword>` | 前 100 个自然搜索排名 + SERP 特性 |
| `/seo seranking backlinks <url>` | 反向链接概况（Ahrefs / DataForSEO 的替代供应商数据源） |
| `/seo seranking competitors <url>` | 前 10 个自然搜索竞争对手及共有关键词差距 |

## AI 声量份额评分

SE Ranking 从可配置的提示词集中进行采样，检查各 AI 平台的响应中是否提及品牌。该评分器采用与 Profound / Peec AI 相同的逻辑，但整合在一个 MCP/API 中。输出字段：

- `chatgpt_sov`：在抽样提示词中，品牌出现在响应里的比例。
- `gemini_sov`：同上，针对 Google Gemini。
- `perplexity_sov`：同上，针对 Perplexity。
- `ai_overviews_sov`：Google AI Overviews 中的品牌引用率。
- `ai_mode_sov`：Google AI Mode 中的品牌引用率（首批支持美国英语）。

将每一项以百分比形式报告，并根据样本量附上置信度说明。

## 成本防护措施

SE Ranking API 采用单位计费。单次 AI 可见度查询约消耗 5 个单位（每个平台 1 个单位）。使用 `scripts/dataforseo_costs.py` 记录各供应商的支出。

## 跨技能委派

- 对于传统反向链接分析和内容审计，回退到 `seo-backlinks` / `seo-content`。
- 对于特定平台的深入分析（仅 ChatGPT、仅 Perplexity），优先使用专用的 `seo-geo` 技能，其中包含品牌提及相关性指导。