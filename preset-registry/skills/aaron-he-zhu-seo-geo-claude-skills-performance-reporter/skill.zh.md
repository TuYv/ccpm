---
name: performance-reporter
description: 'Use when the user asks to "generate an SEO report" or "出月报"; builds multi-metric stakeholder reports and dashboards spanning traffic, rankings, authority, and content progress. Not for raw ranking deltas — use rank-tracker. SEO报告/绩效仪表盘'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when generating multi-metric SEO/GEO performance reports, traffic summaries, stakeholder dashboards, SEO报告, 流量报告, 月报, 周报, or 汇报给老板. Not for raw ranking deltas — use rank-tracker."
argument-hint: "<domain> [date range]"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 绩效报告器

汇总 SEO/GEO 数据、构建利益相关者报告、对目标/竞争对手进行基准比较、计算 ROI，并将变化转化为按优先级排序的建议。

## 快速开始

```text
Create an SEO performance report for [domain] for [time period]
Generate an executive summary of SEO performance for [month/quarter]
Create a GEO visibility report for [domain]
Generate a content performance report
```

## 技能契约

**预期输出**：变化摘要、警报/报告输出，以及可直接交接至 `memory/monitoring/` 的简短摘要。

- **读取**：当前周期和上一周期的流量/排名/权威度/内容指标、报告受众、日期范围，以及用户提供的任何数据或工具数据。
- **写入**：面向用户的监控交付物，以及可存储在 `memory/monitoring/` 下的可复用摘要。
- **提升记录**：将重大变化、已确认的异常、后续行动和待定决策提升记录至 `memory/open-loops.md`。
- **完成条件**：范围内的每个部分（流量、排名、GEO、权威度、反向链接、内容）均已包含或标记为“尚未评估”；每项指标均标注数据来源并与上一周期进行比较；且每条建议均包含负责人、优先级和预期影响。
- **主要后续技能**：当某项变化需要采取行动时，使用下方的 `Next Best Skill`。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中定义的标准结构。

## 数据源

所有集成都为可选项（参见 [CONNECTORS.md](../../CONNECTORS.md)）。连接工具后，从 ~~analytics 汇总流量数据，从 ~~search console 汇总搜索数据，从 ~~SEO tool 汇总排名/反向链接数据，并从 ~~AI monitor 汇总 AI 可见性数据。未连接工具时，向用户索取分析数据导出文件、Search Console 数据、排名数据和 KPI。

**零依赖衡量循环**：报告中的每项变化都应来自计算得出的差值，而非目测估算。存储每个报告周期的 KPI，并让台账计算环比变化：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/ledger.py" record <domain> --source report --data '{"sessions": ..., "clicks": ..., ...}'`，然后使用 `ledger.py diff <domain> --source report` 获取周期差值，并使用 `ledger.py trend <domain> --source report --field <kpi>` 获取趋势线。相应地，将每个数值标记为实测/用户提供/估算，并根据对照来归因结果变化，而不是默认将其归因于最近的变更——参见 [references/measurement-protocol.md](../../references/measurement-protocol.md)。另请参见 [scripts/connectors/README.md](../../scripts/connectors/README.md)。

## 决策关卡

**在以下情况下停止并询问用户：**
- 无法确定报告周期或对比周期，且上下文中也未提供——提供以下选项：(1) 最近 30 天与此前 30 天对比，(2) 上一个自然月与此前一个月对比，(3) 自定义范围。周期对比是必需项，而非可选项。

**在以下情况下静默继续（绝不停止）：**
- 某个部分缺少源数据——将该部分标记为“尚未评估”并继续；不得编造指标。
- 未说明受众——默认使用高管模板，并注明这一假设。

## 说明

当用户请求绩效报告时，请使用[报告输出模板](references/report-output-templates.md)，并涵盖：

1. **定义报告参数** — 域名、报告周期、对比周期、报告类型、受众、重点领域和数据新鲜度。
2. **创建执行摘要** — 总体评级、成果、需关注领域、必要行动、核心指标概览（流量、排名、转化、DA/权威度、AI 引用）以及 SEO ROI；将每项指标标记为“实测 / 用户提供 / 估算”。
3. **报告自然搜索流量** — 会话数、用户数、页面浏览量、互动率/跳出率、趋势可视化、来源/设备细分、热门页面，并为每个数据标注来源。
4. **报告关键词排名** — 排名区间、分布变化、提升/下降幅度最大的关键词、SERP 特性。对于逐排名位置的原始增减数据，应交由 rank-tracker 处理，而不是在此重新计算。
5. **报告 GEO/AI 表现** — AI 引用概览、按主题划分的引用、GEO 成果和优化机会。
6. **报告域名权威度 (CITE)** — 在可用时纳入 CITE 维度得分和否决状态；否则标记为“尚未评估”。
7. **报告内容质量 (CORE-EEAT)** — 在可用时纳入平均得分和趋势；否则标记为“尚未评估”。
8. **报告反向链接** — 链接概况摘要、获取趋势、重要链接和竞争地位。
9. **报告内容表现** — 发布摘要、表现最佳的内容、需要关注的内容以及内容 ROI。
10. **生成建议** — 提供即时、短期和长期行动，并注明优先级、负责人、预期影响和下一周期目标。
11. **汇编完整报告** — 添加目录、附录、数据来源、方法论和术语表。

将每项指标标记为**实测**（工具/导出数据）、**用户提供**或**估算**（模型推断）；绝不能将估算值表述为实测值；如果所需指标不可用，则标记为 N/A——不得编造。同样，应区分**观察到的变化**、**合理解释**（在将其表述为原因之前须有佐证）、**优化机会**以及需要进行抓取/SERP/排名/审计的**后续跟进**——绝不能将未经验证的解释报告为已确认的原因。

## 示例

示例输出：一份执行摘要，其中包含总体状态、流量/排名/转化/权威度/AI 引用的核心指标概览、SEO ROI，以及注明负责人和日期的即时/月度/季度行动。

## 保存结果

询问“保存这些结果吗？”如果回答是，则写入 `memory/monitoring/`——参见[技能契约](../../references/skill-contract.md)中的“保存结果模板”一节。

## 参考资料

- [报告输出模板](references/report-output-templates.md) — 涵盖全部 11 个报告章节的精简起始模块
- [KPI 定义](references/kpi-definitions.md) — SEO/GEO 指标定义，包括基准、阈值、趋势分析和归因指南
- [按受众划分的报告模板](references/report-templates.md) — 可直接复制使用的高管、营销、技术和客户受众模板

## 下一最佳技能

需要定期监控 → [alert-manager](../alert-manager/SKILL.md) — 将报告洞察转化为持续监控规则。一次性报告 → Terminal。根据[技能契约](../../references/skill-contract.md)应用已访问集合规则。