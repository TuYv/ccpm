---
name: seo-profound
description: Profound LLM citation tracker (extension). Time-series brand citation rates across ChatGPT, Perplexity, and other LLMs. Pairs with seo-seranking for triangulated AI visibility coverage.
metadata:
  version: "2.2.4"
compatibility: "Requires a Profound API key (set PROFOUND_API_KEY by running extensions/profound/install.sh)."
---
# seo-profound

Profound 专为追踪大语言模型中的品牌提及而构建。SE Ranking 按需对提示词进行抽样，而 Profound 会持续轮询并发布时间序列数据，因此趋势变化（周环比、月环比）是其核心能力。

## 前置条件

- 运行 `extensions/profound/install.sh` 或 `install.ps1`。
- Profound API 密钥。
- 在调用任何工具之前，检查 `~/.claude/settings.json` 中是否存在 `env.PROFOUND_API_KEY`。

## 路由

| 命令 | 用途 |
|---|---|
| `/seo profound citations <brand>` | 各大语言模型当前的引用率及 30 天趋势 |
| `/seo profound prompts <brand>` | 能够展示（或未能展示）该品牌的热门提示词 |
| `/seo profound competitors <brand>` | 针对相同提示词与 `brand` 一同被引用的品牌 |
| `/seo profound alerts <brand>` | 相对于 7 天基线的激增/骤降提醒 |

## 输出约定

- 每项指标都要注明 Profound 来源：“Profound（实时，置信度 0.90）”。
- Profound 原生覆盖 ChatGPT 和 Perplexity；对于 Gemini / AI Overviews / AI Mode 的覆盖情况，交由 `seo-seranking` 处理。
- 对于 Google AI Overviews 的引用率，如条件允许，还应交叉参考 `seo-dataforseo` 的 AI 可见性工具。

## 跨技能委派

- 对于端到端 AI 搜索审计（段落可引用性 + 品牌提及 + 平台特定调优），交回 `seo-geo` 处理。
- 对于提示词集设计及被引用内容中的 AI Cleanup 模式检测，转由 `seo-content` 处理。