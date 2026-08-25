---
name: seo-profound
description: Profound LLM citation tracker (extension). Time-series brand citation rates across ChatGPT, Perplexity, and other LLMs. Pairs with seo-seranking for triangulated AI visibility coverage.
metadata:
  version: "2.2.5"
compatibility: "Requires a Profound API key (set PROFOUND_API_KEY by running extensions/profound/install.sh)."
---
# seo-profound

Profound 专为 LLM 品牌提及追踪而构建。SE Ranking 按需采样提示词，而 Profound 会持续轮询并发布时间序列数据，因此趋势变化（环比周、环比月）属于一等指标。

## 前提条件

- 运行 `extensions/profound/install.sh` 或 `install.ps1`。
- Profound API 密钥。
- 在调用任何工具之前，检查 `~/.claude/settings.json` 中是否存在 `env.PROFOUND_API_KEY`。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo profound citations <brand>` | 每个 LLM 当前的引用率 + 30 天趋势 |
| `/seo profound prompts <brand>` | 能够（或无法）展示该品牌的热门提示词 |
| `/seo profound competitors <brand>` | 在相同提示词下与 `brand` 一同被引用的品牌 |
| `/seo profound alerts <brand>` | 相对于 7 天基线的激增/骤降警报 |

## 输出约定

- 在每项指标中注明 Profound：“Profound（实时，置信度 0.90）”。
- Profound 原生覆盖 ChatGPT + Perplexity；对于 Gemini / AI
  Overviews / AI Mode 的覆盖，交由 `seo-seranking` 处理。
- 对于 Google AI Overviews 引用率，如果可用，还应交叉参考
  `seo-dataforseo` 的 AI 可见性工具。

## 跨技能委派

- 对于端到端 AI 搜索审计（段落可引用性 + 品牌提及 + 针对平台的调优），交回给 `seo-geo`。
- 对于提示词集设计 + 被引用内容中的 AI Cleanup 模式检测，回退到 `seo-content`。