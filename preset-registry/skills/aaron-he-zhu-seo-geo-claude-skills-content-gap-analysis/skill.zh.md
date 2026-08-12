---
name: content-gap-analysis
description: 'Use when the user asks to "find content gaps", "竞品写了什么", or "还应该写什么"; builds a competitor-relative coverage map of missing topics, keyword gaps, and editorial-calendar opportunities. Not for raw keyword demand discovery — use keyword-research. 内容缺口/选题规划'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when finding content gaps between two domains, discovering missing topics, or identifying coverage holes versus competitors."
argument-hint: "<your domain> <competitor domain>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 内容差距分析

通过将你的网站与竞争对手进行比较，识别内容机会，并对最值得优先弥补的差距进行评分。

## 快速开始

```
Find content gaps between my site [URL] and [competitor URLs]
```

```
What content am I missing compared to my top 3 competitors?
```

## 技能契约

**预期输出**：一份按优先级排序的差距简报，以及用于 `memory/research/` 的标准交接摘要。

- **读取**：你的域名、竞争对手域名、主题/内容类型重点、受众、业务目标，以及用户提供的任何内容清单或工具内容清单。
- **写入**：面向用户的分析和可复用摘要。
- **提升**：将长期有效的关键词优先级、竞争对手事实和待定策略决策提升至 `memory/hot-cache.md`、`memory/open-loops.md` 和 `memory/research/`。
- **完成条件**：每个优先差距均指出哪些竞争对手已有相关覆盖而你没有；差距被归入快速见效 / 战略建设 / 长期规划；并且交付物针对每个快速见效项包含一条注明日期的内容日历条目。
- **主要后续技能**：优先差距列表获批后，使用 [seo-content-writer](../../build/seo-content-writer/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

可选集成：~~SEO 工具、~~搜索控制台、~~分析工具、~~AI 监测工具。没有工具时，询问网站 URL、内容清单、竞争对手 URL 和业务目标。请参阅 [CONNECTORS.md](../../CONNECTORS.md)。

## 决策关卡

**停止并询问**——差距分析是相对于竞争对手进行的，不能仅凭需求直接执行：

1. 未提供竞争对手域名，并且无法从 `CLAUDE.md` 或先前研究中推断 → 请用户指定 1-3 个竞争对手，或者提议改用 [keyword-research](../keyword-research/SKILL.md) 进行需求侧发现。
2. 无法获取你自己域名的内容清单，且不能抓取 → 询问网站 URL 或内容列表，因为“差距”分析需要了解当前已有的内容覆盖。

**静默继续**——不要因以下情况停止：需要从 3-5 个已指定竞争对手中选择进行深入分析的对象（选择最接近的）；缺少可选工具数据（标记为估算/N/A 并继续）；主题范围不明确（分析全部重叠范围，并标记最宽泛的主题集群）。

## 说明

当用户请求内容差距分析时：

1. **定义分析范围**——确认你的网站、竞争对手、主题重点、内容类型、受众和业务目标。
2. **审计现有内容**——梳理已收录页面、内容类型、主题集群、表现优秀的内容和薄弱环节。
3. **分析竞争对手内容**——比较内容数量、流量、类型组合、主题覆盖范围和独有资产。
4. **识别关键词差距**——根据搜索量、难度和相关性，将差距划分为高优先级、快速见效和长期规划。
5. **梳理主题差距**——比较主题集群覆盖情况，并针对缺失主题推荐支柱内容 / 集群内容方案。
6. **识别内容形式差距**——比较指南、教程、对比、案例研究、工具、模板、视频和研究内容。
7. **分析 GEO / AI 差距**——识别竞争对手获得引用、而你缺少的问答、定义和对比内容。
8. **映射至受众旅程**——比较认知、考虑、决策和留存阶段的内容覆盖情况。
9. **确定优先级并制定行动计划**——交付执行摘要、优先差距列表（快速见效 / 战略建设 / 长期规划）、内容日历和成功指标。

为每个指标标注 **实测**（工具/导出）、**用户提供** 或 **估算**（模型推断）；绝不能将估算值表述为实测值；如果无法获得某项必需指标，请将其标记为 N/A——不要编造。

**质量标准**：每个差距都必须注明覆盖该差距的竞争对手、其搜索量或流量估算，以及为何值得弥补该差距——绝不能在没有这些证据的情况下只列出一个主题。

> **参考**：请参阅[分析模板](references/analysis-templates.md)，了解各步骤中使用的紧凑模板。

## 示例

如需查看完整的 SaaS 营销示例，请参阅 [references/example-report.md](references/example-report.md)。

## 高级分析

### 竞争性主题集群对比

```
Compare our topic cluster coverage for [topic] vs top 5 competitors
```

### 时序差距分析

```
What content have competitors published in the last 6 months that we haven't covered?
```

### 基于意图的差距

```
Find gaps in our [commercial/informational] intent content
```

## 保存结果

写入路径：`memory/research/content-gap-analysis/YYYY-MM-DD-<topic>.md`；将长期有效的差距优先级和竞争对手信息提升至 `memory/hot-cache.md`。请参阅[技能契约](../../references/skill-contract.md)中的 §保存结果模板。

## 参考资料

- [分析模板](references/analysis-templates.md) — 差距分析模板
- [差距分析框架](references/gap-analysis-frameworks.md) — 审计和优先级排序框架
- [示例报告](references/example-report.md) — 完整示例

## 下一项最佳技能

首选：[seo-content-writer](../../build/seo-content-writer/SKILL.md)。