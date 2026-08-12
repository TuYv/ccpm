---
name: internal-linking-optimizer
description: 'Use when the user asks to "fix internal linking" or "find orphan pages"; maps link architecture, authority flow, anchor text, and crawl depth, then delivers a prioritized source/target/anchor plan. Not for external backlinks — use backlink-analyzer. 内链优化/站内架构'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when improving internal link structure, anchor text distribution, orphan pages, or site architecture."
argument-hint: "<URL or sitemap>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "low"
---
# 内部链接优化器

分析内部链接结构、权威度流动、孤立页面、锚文本和主题集群，然后提供按优先级排序的链接计划，其中包含来源/目标/锚文本建议。

## 快速开始

从以下提示词之一开始，然后使用[技能契约](../../references/skill-contract.md)中的标准交接摘要完成任务。

```text
Analyze internal linking structure for [domain/sitemap]
Find internal linking opportunities for [URL]
Create internal linking plan for topic cluster about [topic]
Suggest internal links for this new article: [content/URL]
Find orphan pages on [domain]
Optimize anchor text across the site
```

## 技能契约

**预期输出**：带评分的诊断、按优先级排序的修复计划，以及可直接用于 `memory/audits/` 的简短交接摘要。

- **读取**：站点地图或页面列表、关键页面 URL、内容分类，以及要从中添加链接的文章/URL。
- **写入**：面向用户的链接计划，以及可存储在 `memory/audits/` 下的可复用摘要。
- **提升记录至**：将阻塞性缺陷、反复出现的薄弱环节、修复优先级和待定决策记录到 `memory/open-loops.md`。
- **完成条件**：列出孤立页面及其处置方式；根据阈值检查锚文本分布；生成按优先级排序的来源/目标/锚文本计划和交接摘要。
- **首选后续技能**：当修复路径明确时，使用下方的 `Next Best Skill`。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md)中规定的标准结构。

## 数据源

连接后使用~~网页爬虫和~~分析工具；否则，向用户索取站点地图、关键页面 URL 和内容分类。请参阅 [CONNECTORS.md](../../CONNECTORS.md) 和 [SECURITY.md §抓取边界](../../SECURITY.md)。

**零依赖本地辅助工具**（无需工具）：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/crawl.py" <url> | python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/linkgraph.py" -` 可通过实时抓取计算孤立页面、点击深度和内部 PageRank。请参阅 [scripts/connectors/README.md](../../scripts/connectors/README.md)。

## 说明

将每项指标标记为 **实测**（工具/导出数据）、**用户提供**或**估算**（模型推断）；绝不能将估算值表述为实测值；如果无法获得必需指标，则将其标记为 N/A——不得虚构。

当用户请求优化内部链接时：

1. **分析当前结构** — 获取域名、已分析页面、内部链接总数、平均每页链接数、链接分布、获得链接最多的页面、链接不足的重要页面，以及 **结构评分 /100**（从 100 分开始；每个孤立页面扣 10 分，每个点击深度超过 3 次的重要页面扣 5 分，每个没有上下文入站链接的页面扣 5 分；如果平均每页链接数超出[链接架构模式](references/link-architecture-patterns.md)中相应架构模型的目标范围，则扣 10 分；最低为 0 分）。标记抓取深度和权威度流动方面的问题。
2. **识别孤立页面** — 列出没有内部入站链接的页面。优先处理有流量/排名的高价值孤立页面、需要分类/标签链接的中等潜力页面，以及应删除、设置 noindex 或重定向的低价值页面。
3. **分析锚文本分布** — 检查当前锚文本模式、各页面的分布、过度优化、通用锚文本以及与 CORE-EEAT R08 的一致性。锚文本评分 /10 和阈值在步骤 3 模板中定义。
   > **参考**：[references/linking-templates.md](references/linking-templates.md) 包含步骤 3 的输出模板。
4. **制定主题集群链接策略** — 映射支柱页面/集群页面链接、推荐结构，并列出要添加的具体链接。
   > **参考**：[references/linking-templates.md](references/linking-templates.md) 包含步骤 4 的模板。
5. **查找上下文链接机会** — 针对每个页面，识别与主题相关的来源/目标/锚文本机会，并优先安排高影响力的新增链接。
   > **参考**：[references/linking-templates.md](references/linking-templates.md) 包含步骤 5 的模板。
6. **优化导航和页脚链接** — 审查主导航/页脚/侧边栏/面包屑导航；建议应添加、降低优先级或移除的页面。
   > **参考**：[references/linking-templates.md](references/linking-templates.md) 包含步骤 6 的模板。
7. **生成实施计划** — 包括执行摘要、当前状态指标、分阶段的优先行动、实施指南和跟踪计划。
   > **参考**：[references/linking-templates.md](references/linking-templates.md) 包含步骤 7 的模板。

## 决策关卡

**在以下情况下停止并询问用户：**
- 必须删除高价值孤立页面、将其设为 noindex 或进行重定向，但其流量/排名价值未知——说明你观察到的情况，并询问用户选择：(1) 保留并添加链接，(2) 设为 noindex，(3) 使用 301 重定向到最相关的页面。

**静默继续（绝不要因此停止）：**
- 应采用哪种架构模型——根据网站类型和页面数量，使用[链接架构模式](references/link-architecture-patterns.md)进行推断，说明所选模型，然后继续。
- 没有爬虫/分析数据——根据提供的站点地图或页面列表开展工作，将推断出的指标标记为 Estimated，然后继续。
- 没有流量的低价值孤立页面——直接建议默认处置方式（设为 noindex 或重定向），无需停止。

## 示例

**用户**：“为我关于‘电子邮件营销最佳实践’的博客文章寻找内部链接机会”

**输出**：提供 5 个高价值链接，包括来源段落、目标 URL、建议的锚文本和优先级。示例目标可能包括列表构建、主题行、细分、自动化和工具页面。

> **参考资料**：完整的分步示例请参阅 [references/linking-example.md](references/linking-example.md)。

## 保存结果

询问是否保存结果；如果用户同意，将带日期的摘要写入 `memory/audits/internal-linking-optimizer/YYYY-MM-DD-<topic>.md`。在生成任何热缓存标记之前，将否决级风险移交给审计关卡。

## 参考资料

- [链接架构模式](references/link-architecture-patterns.md) — 架构模型、选择阈值、迁移保障措施和衡量目标
- [链接模板](references/linking-templates.md) — 步骤 3-7 的详细输出模板
- [链接示例](references/linking-example.md) — 内部链接机会的完整分步示例

## 下一项最佳技能

首选：[页面 SEO 审计器](../on-page-seo-auditor/SKILL.md) — 验证修改后的内部链接是否支持页面级目标。