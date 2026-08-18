---
name: seo-seranking
description: SE Ranking AI visibility analyst (extension). Tracks AI Share-of-Voice across ChatGPT, Gemini, Perplexity, AI Overviews, and AI Mode in a single query. Highest-impact new extension per the v2 gap analysis — no other vendor covers all 5 AI platforms in one API.
metadata:
compatibility: "Requires an SE Ranking API key (set SERANKING_API_KEY by running extensions/seranking/install.sh)."
---
# seo-seranking

通过 SE Ranking REST API 实时跟踪 AI 可见性。

## 前置条件

- 运行 `extensions/seranking/install.sh`（或 `install.ps1`）。
- 一个 SE Ranking API 密钥（https://seranking.com/api）。
- 每次调用前，请确认 `~/.claude/settings.json` 中的 `env.` 下存在 `SERANKING_API_KEY`。如果不存在，请告知用户运行安装程序。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo seranking ai-visibility <brand>` | `brand` 在 ChatGPT、Gemini、Perplexity、AI Overviews、AI Mode 中的声量份额 |
| `/seo seranking serp <keyword>` | 前 100 个自然搜索排名 + SERP 功能 |
| `/seo seranking backlinks <url>` | 反向链接概况（Ahrefs / DataForSEO 的免费套餐替代方案） |
| `/seo seranking competitors <url>` | 前 10 个自然搜索竞争对手及共享关键词差距 |

## AI 声量份额评分

SE Ranking 会针对一组可配置的提示词，对每个 AI 平台的响应进行抽样，以检测品牌提及情况。
该评分器采用与 Profound / Peec AI 相同的逻辑，但整合在一个 MCP/API 中。输出字段：

- `chatgpt_sov`：抽样提示词中，品牌出现在响应里的百分比。
- `gemini_sov`：同上，针对 Google Gemini。
- `perplexity_sov`：同上，针对 Perplexity。
- `ai_overviews_sov`：Google AI Overviews 中的品牌引用率。
- `ai_mode_sov`：Google AI Mode 中的品牌引用率（优先支持美国英语）。

将每一项以百分比形式报告，并根据样本量附上置信度说明。

## 成本控制措施

SE Ranking API 采用单位计费。单次 AI 可见性查询约消耗
5 个单位（每个平台 1 个）。使用 `scripts/dataforseo_costs.py` 记录
各供应商的支出。

## 跨技能委派

- 对于传统反向链接和内容审计，回退使用 `seo-backlinks` / `seo-content`。
- 对于特定平台的深入分析（仅 ChatGPT、仅 Perplexity），优先使用专用的 `seo-geo` 技能，其中包含品牌提及相关性指导。