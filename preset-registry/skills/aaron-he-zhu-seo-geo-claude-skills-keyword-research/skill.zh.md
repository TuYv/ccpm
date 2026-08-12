---
name: keyword-research
description: 'Use when the user asks to "find keywords", "挖词", or "搜什么词"; prioritizes search volume, keyword difficulty, intent, and topic clusters from provided or connected data. Not for competitor-relative coverage gaps — use content-gap-analysis. 关键词研究/内容选题'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when starting keyword research for a new page, topic, or campaign. Also when the user asks about search volume, keyword difficulty, topic clusters, long-tail keywords, what to write about, 关键词研究, 挖词, 内容选题, or 搜什么词."
argument-hint: "<topic or seed keyword> [market/language]"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 关键词研究

为 SEO 和 GEO 规划发现、评分并聚类关键词。

## 快速开始

```
Research keywords for [topic/product/service]
```

```
What keywords is [competitor URL] ranking for that I should target?
```

## 技能契约

**预期输出**：一份按优先级排序的关键词简报，以及用于 `memory/research/` 的标准交接摘要。

- **读取**：主题或种子关键词、目标市场/语言、业务目标、网站 DR，以及用户提供的任何指标或工具指标。
- **写入**：面向用户的研究交付物和可复用摘要。
- **提升**：将长期有效的关键词优先级、竞品事实和待定策略决策提升至 `memory/hot-cache.md`、`memory/open-loops.md` 和 `memory/research/`。
- **完成条件**：入选的每个关键词都包含搜索量 + 难度 + 意图（或标注为 N/A）；关键词被组织为支柱 + 集群中心；并且交付物至少列出 3 个按优先级排序的快速见效 / 增长 / GEO 机会。
- **主要后续技能**：当关键词集已准备好进行市场比较时，使用 [竞品分析](../competitor-analysis/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

可选集成：~~SEO 工具、~~搜索控制台。如果没有工具，请询问种子关键词、受众、目标以及任何已知指标。参见 [CONNECTORS.md](../../CONNECTORS.md)。

**零依赖本地辅助工具**（无需工具）：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/suggest.py" "<seed>" --expand` 从 Google 自动补全中获取免费的关键词创意（⚠️ 非官方端点）。搜索*量 / 难度*仍需要 `~~SEO tool` 或自有 Search Console 数据。参见 [scripts/connectors/README.md](../../scripts/connectors/README.md)。

**触手可及排名快捷方法**（已连接 `~~search console` 时）：在进行广泛发现之前，先挖掘你自己的 GSC 查询数据，找出当前排名约在第 5–20 位的词——即搜索结果第一页末尾和第二页。这些词已经证明存在需求，稍加推动即可转化，因此是最快见效的机会集合。Search Analytics API 按点击次数排序，并且**不提供排名筛选器**，因此应请求较高的 `rowLimit`，然后在客户端筛选 5–20 位的区间，再为该候选列表补充搜索量 / 难度 / 意图。优先处理此集合；将其指标视为**实测数据**。

## 说明

当用户请求关键词研究时，执行八个阶段，并以 `[Phase X/8: Name]` 的形式宣布每个阶段：

1. **范围界定** — 明确产品、受众、业务目标、DR、地理区域和语言。
2. **发现** — 从核心词、问题词、解决方案词、受众词和行业词中生成种子词。
3. **变体** — 使用修饰词和长尾模式进行扩展。
4. **分类** — 按意图标记（信息型、导航型、商业型、交易型）。
5. **评分** — 分配难度（1-100），并计算 `Opportunity = (Volume × Intent Value) / Difficulty`，其中 Intent Value 为 `1 / 1 / 2 / 3`。
6. **GEO 检查** — 标记适合由 AI 回答的查询，例如问题、定义、比较、列表和操作指南。
7. **聚类** — 将关键词分组为支柱 + 集群主题中心。
8. **交付** — 输出执行摘要、快速见效 / 增长 / GEO 机会、主题集群、内容日历和后续步骤。

将每项指标标记为 **实测**（工具/导出）、**用户提供** 或 **估算**（模型推断）；绝不能将估算值表述为实测值；如果无法获得必需指标，将其标记为 N/A——不要编造。

**质量标准**：每条建议至少包含一个具体数字。将泛泛的建议改写为具体的关键词 + 搜索量 + 难度 + 原因。

> **参考资料**：有关完整的八阶段模板、扩展模式、意图表、难度分级、机会矩阵、GEO 指标、集群模板、可执行建议与泛泛建议示例以及高级用法，请参阅 [references/instructions-detail.md](references/instructions-detail.md)。

## 示例

完整的实际操作示例请参阅 [references/example-report.md](references/example-report.md)。

## 保存结果

写入路径：`memory/research/keyword-research/YYYY-MM-DD-<topic>.md`；将长期有效的关键词优先级提升至 `memory/hot-cache.md`。请参阅[技能契约](../../references/skill-contract.md)中的§保存结果模板。

## 参考资料

- [详细说明](references/instructions-detail.md) — 工作流、评分、集群模板、高级用法
- [关键词意图分类法](references/keyword-intent-taxonomy.md) — 意图信号和内容映射
- [主题集群模板](references/topic-cluster-templates.md) — 支柱内容和集群模式
- [关键词优先级框架](references/keyword-prioritization-framework.md) — 评分和优先级排序规则
- [示例报告](references/example-report.md) — 实际操作示例

## 下一项最佳技能

首选：[竞争对手分析](../competitor-analysis/SKILL.md)。另请参阅：[内容差距分析](../content-gap-analysis/SKILL.md)和 [SERP 分析](../serp-analysis/SKILL.md)。