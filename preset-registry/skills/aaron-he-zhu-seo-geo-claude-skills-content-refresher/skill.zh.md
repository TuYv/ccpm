---
name: content-refresher
description: 'Use when the user asks to "update outdated content" or "fix traffic/ranking decay"; scores decay, prioritizes refresh work, and produces an update plan with GEO and republishing guidance. Not for net-new content — use seo-content-writer. 内容更新/排名恢复'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when updating outdated content, refreshing old articles, improving declining pages, or adding new information to existing content."
argument-hint: "<URL of outdated content>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 内容焕新

识别过时内容，评估内容衰减程度和新鲜度，确定焕新工作的优先级，并制定包含 GEO 和重新发布指导的更新计划。

## 快速开始

```text
Find content on [domain] that needs refreshing
Which of my blog posts have lost the most traffic?
Refresh this article for [current year]: [URL/content]
Update this content to outrank [competitor URL]: [your URL]
Create a content refresh strategy for [domain/topic]
```

## 技能契约

**预期输出**：一份带评分的诊断、按优先级排列的修复计划，以及一份可直接交接至 `memory/audits/` 的简短摘要。

- **读取**：候选 URL/内容、流量和排名历史、发布/更新日期以及竞品示例。
- **写入**：面向用户的焕新计划（以及可选的焕新后内容），外加一份可存储在 `memory/audits/` 下的可复用摘要。
- **提升记录**：将阻塞性缺陷、反复出现的薄弱环节、修复优先级和待定决策提升记录至 `memory/open-loops.md`。
- **完成条件**：已基于证据识别内容衰减的驱动因素；焕新计划列出了具体更新及重新发布日期策略；已生成“所做更改”区块和交接摘要。
- **首选下一技能**：当修复路径明确时，使用下方的 `Next Best Skill`。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

已连接时使用 ~~analytics、~~search console 和 ~~SEO tool；否则，向用户索取流量数据、排名历史、发布日期、候选 URL 和竞品示例。参见 [CONNECTORS.md](../../CONNECTORS.md)。

## 说明

将每项指标标记为**实测**（工具/导出数据）、**用户提供**或**估算**（模型推断）；绝不能将估算值表述为实测值；如果无法获取必需指标，则标记为 N/A——不得编造。

当用户请求内容焕新帮助时：

1. **CORE-EEAT 快速评分**——估算全部 8 个维度，优先处理红色/黄色区域，并在需要时交接给 [内容质量审核器](../../cross-cutting/content-quality-auditor/SKILL.md) 进行完整评分。
2. **识别焕新候选内容**——利用内容年限、过时陈述、流量下降、排名丢失、失效链接、SERP 变化和缺失主题进行识别。
3. **分析页面级衰减**——比较 6 个月前与当前的表现、关键词变化、SERP 意图和竞品更新，并说明需要焕新的原因。
4. **确定所需更新**——记录过时元素、竞品/PAA 内容缺口、SEO 更新、GEO 更新、链接、图片、来源和日期。
5. **制定焕新计划**——明确标题、结构、新增章节、更新后的统计数据、内部/外部链接、图片和验证要求。
6. **撰写焕新内容**——起草更新后的引言、替换章节、最新事实、FAQ 答案和“所做更改”说明。
7. **针对 GEO 进行优化**——添加 40-60 字的定义、可引用陈述、问答、带日期的引用以及可独立成立的事实陈述。
8. **制定重新发布策略**——新增内容达到 50% 以上时更新发布日期，新增内容为 20-50% 时更新最后更新日期，新增内容低于 20% 时保留原始日期；更新 schema、站点地图 `lastmod`、缓存和 Search Console，并监测 4-6 周。
9. **创建焕新报告**——总结已完成的更改、预期结果、负责人、下次审查日期和未闭环事项。

> **参考资料**：[references/refresh-templates.md](references/refresh-templates.md) 提供了步骤 2-9 的精简模板。

## 决策关卡

**在以下情况停止并询问用户：**
- 页面内容已严重衰退，以至于重写可能优于更新（例如，前提已过时、意图发生变化，或超过 50% 的内容已陈旧）——说明这一发现，并询问用户选择：(1) 在原文基础上更新，或 (2) 通过 [seo-content-writer](../../build/seo-content-writer/SKILL.md) 重写为新内容。

**在以下情况静默继续（绝不停止）：**
- 缺少分析数据/排名历史——根据页面信号（过时的主张、失效链接、陈旧统计数据）评估内容衰退程度，将发现标记为“估算”，然后继续。
- 用户请求“更新”实际上是全新内容（没有现有 URL）——说明一次这种不匹配，然后转交给 [seo-content-writer](../../build/seo-content-writer/SKILL.md)，而不是虚构旧版本。
- 不确定应采用哪种重新发布日期处理方式——遵循步骤 8 的阈值，无需询问。

## 示例

**用户**：“更新我关于‘最佳云托管提供商’的博客文章”

**输出**：CORE-EEAT 快速评分指出可引用性、经验和可信度较弱；建议更新价格、修复失效链接、补充作者资质、添加联盟营销披露，并提供可直接用于重新发布的“所做更改”区块。

> **参考资料**：完整的实际操作示例和检查清单，请参阅 [references/refresh-example.md](references/refresh-example.md)。

## 成功技巧

根据 ROI/搜索需求确定优先级，进行实质性改进，而非仅更新日期；提供比竞争对手更有力的证据；跟踪发布后的排名/流量；并将每次更新都视为获得 GEO 引用的机会。

### 保存结果

询问是否保存结果；如果是，则将带日期的摘要写入 `memory/audits/content-refresher/YYYY-MM-DD-<topic>.md`。在设置任何热缓存标记之前，将具有否决级别的风险移交给审核器关卡。

**建议进行关卡检查**：重新发布之前，对更新后的内容运行 content-quality-auditor。

## 参考资料

- [内容衰退信号](references/content-decay-signals.md) — 按内容类型划分的衰退指标、生命周期阶段和更新触发条件
- [更新模板](references/refresh-templates.md) — 步骤 2-9 的精简模板
- [更新示例与检查清单](references/refresh-example.md) — 完整的实际操作示例及更新前/后检查清单

## 下一最佳 Skill

首选：[content-quality-auditor](../../cross-cutting/content-quality-auditor/SKILL.md) — 在发布前重新评估更新后的内容。