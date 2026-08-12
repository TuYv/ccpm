---
name: competitor-analysis
description: 'Use when the user asks to "analyze competitors" or "竞品分析"; benchmarks competitor keywords, content, backlinks, AI citations, and traffic share into strengths, weaknesses, and an action plan. Not for a pairwise topic-coverage gap map — use content-gap-analysis. 竞品分析/竞争对手'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when analyzing competitor SEO strategy, comparing domains, benchmarking against competitors, or finding competitor keywords and content gaps."
argument-hint: "<competitor URL or domain>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 竞争对手分析

分析竞争对手的 SEO 和 GEO 策略，以揭示可复用的成功经验、薄弱环节和市场空白。

## 快速开始

```
Analyze SEO strategy for [competitor URL]
```

```
Compare my site [URL] against [competitor 1], [competitor 2], [competitor 3]
```

## 技能契约

**预期输出**：一份按优先级排序的竞争对手简报，以及用于 `memory/research/` 的标准交接摘要。

- **读取**：竞争对手 URL/域名、您自己的网站指标、商业模式、目标受众、行业背景，以及用户提供的任何数据或工具数据。
- **写入**：面向用户的分析和可复用的摘要。
- **提升**：将长期有效的竞争对手事实、关键词优先级、实体候选项和待定策略决策提升至 `memory/hot-cache.md`、`memory/open-loops.md` 和 `memory/research/`。
- **完成条件**：在一张对比表中，从关键词、反向链接和流量份额三个维度对 3-5 个竞争对手进行基准比较；每项值得学习的优势和可加以利用的弱点均引用证据；并以即时 / 短期 / 长期计划作为交付成果的结尾。
- **主要后续技能**：当竞争格局清晰后，使用 [content-gap-analysis](../content-gap-analysis/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中的标准结构。

## 数据源

可选集成：~~SEO 工具、~~分析工具、~~AI 监测工具。没有工具时，向用户询问竞争对手 URL、用户自己的网站指标和行业背景。参见 [CONNECTORS.md](../../CONNECTORS.md)。

## 决策门槛

**停止并询问**——当无法确定竞争对手集合时：

1. 未指定竞争对手，且无法从 `CLAUDE.md`、既有研究或用户所在的细分市场中推断 → 请用户提供 2-5 个竞争对手，或者提议先通过 [serp-analysis](../serp-analysis/SKILL.md) 根据目标关键词推断竞争对手。

**静默继续**——不要因以下情况而停止：需要从较长列表中选择 3-5 个进行深入分析（选择最接近的直接竞争对手，并记录其余竞争对手）；缺少用户自己的网站指标（将竞争对手彼此对比，并将用户所在行标记为 N/A）；缺少可选工具数据（标记为“估算”并继续）。

## 说明

当用户请求竞争对手分析时：

1. **识别竞争对手**——如果用户尚未指定，则区分直接竞争对手、间接替代方案和内容竞争对手。
2. **收集竞争对手数据**——获取 URL、域名年龄、预估流量、域名权威度、商业模式、目标受众和主要产品或服务。
3. **分析关键词排名**——记录排名关键词总数、排名前 10/前 3 的关键词数量、高价值关键词、搜索意图组合和关键词空白。
4. **审查内容策略**——评估内容数量、表现最佳的内容、发布规律、主题和成功因素。
5. **分析反向链接概况**——评估反向链接总数、质量组合、主要链接域名、链接获取模式和可用于吸引链接的资产。
6. **技术 SEO 评估**——评估 Core Web Vitals、移动设备友好性、网站架构、内部链接、URL 结构，以及突出的优势和弱点。
7. **GEO / AI 引用分析**——测试哪些查询会引用竞争对手、哪些格式会被引用，以及竞争对手仍留下了哪些机会。
8. **综合竞争情报**——提供执行摘要、对比表、CITE 对比、值得学习的优势、可加以利用的弱点、关键词机会、内容建议，以及即时 / 短期 / 长期计划。

将每项指标标注为 **Measured**（工具/导出）、**User-provided** 或 **Estimated**（模型推断）；绝不要将估算值表述为实测值；如果无法获得必需指标，则将其标记为 N/A——不要编造。

**质量标准**：每项优势或劣势都必须关联一项带标签的指标和一个具名竞争对手——例如某个具名域名的具体排名或反向链接数据，而不是“内容影响力强”。

> **参考资料**：有关每个步骤所使用的精简模板，请参阅 [分析模板](references/analysis-templates.md)。

## 示例

有关分析 HubSpot 营销关键词主导地位的完整示例，请参阅 [references/example-report.md](references/example-report.md)。

## 高级分析类型

### 内容差距分析

对于成对主题覆盖差距图（“[competitor] 有而我没有的内容，按流量潜力排序”），请转交给 [content-gap-analysis](../content-gap-analysis/SKILL.md)——这是它的专门任务。

### 链接交集

```
Find sites linking to [competitor 1] AND [competitor 2] but not me
```

### SERP 功能分析

```
What SERP features do competitors win? (Featured snippets, PAA, etc.)
```

### 历史跟踪

```
How has [competitor]'s SEO strategy evolved over the past year?
```

## 保存结果

写入路径：`memory/research/competitor-analysis/YYYY-MM-DD-<topic>.md`；将持久有效的竞争对手事实和实体候选项提升至 `memory/hot-cache.md`。请参阅 [Skill Contract](../../references/skill-contract.md) 的 §Save Results Template。

## 参考资料

- [分析模板](references/analysis-templates.md) — 分步分析模板
- [战斗卡模板](references/battlecard-template.md) — 快速参考战斗卡格式
- [定位框架](references/positioning-frameworks.md) — 定位与差异化框架
- [示例报告](references/example-report.md) — 完整示例

## 下一最佳 Skill

首选：[content-gap-analysis](../content-gap-analysis/SKILL.md)。另请参阅：[serp-analysis](../serp-analysis/SKILL.md) 和 [backlink-analyzer](../../monitor/backlink-analyzer/SKILL.md)。