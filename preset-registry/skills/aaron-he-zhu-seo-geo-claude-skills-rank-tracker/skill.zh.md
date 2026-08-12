---
name: rank-tracker
description: 'Use when the user asks to "track rankings" or "查排名"; measures keyword and SERP-position deltas over time from provided exports or connected tools, including AI-response checks. Not for multi-metric stakeholder reports — use performance-reporter; not for setting alerts — use alert-manager. 排名追踪/SERP监控'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when tracking keyword rankings, monitoring position changes, comparing ranking snapshots, or detecting ranking drops."
argument-hint: "<domain> [keyword list]"
allowed-tools: WebFetch
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 排名跟踪器

持续跟踪关键词排名、SERP 功能归属和 AI 可见度。

## 快速开始

```
Set up rank tracking for [domain] targeting these keywords: [keyword list]
```

```
Analyze ranking changes for [domain] over the past [time period]
```

## 技能契约

**预期输出**：排名报告或变化摘要，以及面向 `memory/monitoring/` 的标准交接摘要。

- **读取**：当前排名、先前基线、目标关键词列表、市场/设备，以及用户提供或工具获取的任何指标。
- **写入**：面向用户的监控交付物和可复用摘要。
- **提升记录**：将重大变化、已确认的异常、后续行动和待定决策记录到 `memory/open-loops.md`。
- **完成条件**：每个跟踪的关键词均显示当前排名与基线的对比，并标注变化值（或 N/A）；每个排名均注明其来源（工具导出 / 用户提供 / 估算）；并指出变化最大的关键词及其可能原因。
- **主要后续技能**：当需要将定期监控自动化时，使用 [alert-manager](../alert-manager/SKILL.md)。

### 交接摘要

> 按照 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中的标准结构输出。

## 数据源

所有集成都为可选项（参见 [CONNECTORS.md](../../CONNECTORS.md)）。有工具时，从 ~~SEO 工具获取排名，从 ~~搜索控制台获取展示次数，从 ~~分析工具获取流量，并从 ~~AI 监控工具获取 AI 引用。没有工具时，向用户询问排名、搜索量、竞争对手数据和 SERP 功能状态。

**零依赖测量循环**（无需付费工具）：绝不描述未经测量的排名变化——将每次检查记录为快照，并让账本计算变化值。`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/ledger.py" record <domain> --source rank --data '{"<keyword>": <position>, ...}'`，然后使用 `ledger.py diff <domain> --source rank` 获取自上次检查以来的变化，并使用 `ledger.py trend <domain> --source rank --field "<keyword>"` 获取时间序列。连接后记录真实的搜索控制台排名；在第 1 层级中，则记录用户提供的排名。排名变化是一个**以周为尺度、受混杂因素影响的结果**——应相对于对照项（保留关键词/竞争对手）进行归因，而不是相对于零；参见 [references/measurement-protocol.md](../../references/measurement-protocol.md)。参见 [scripts/connectors/README.md](../../scripts/connectors/README.md)。

## 决策关卡

**在以下情况下停止并询问用户：**
- 未提供目标关键词，且无法从 `CLAUDE.md` 或先前的监控记录中推断——提供以下选项：(1) 提供关键词列表，(2) 跟踪该域名已知的热门词，(3) 取消。

**在以下情况下静默继续（绝不停止）：**
- 不存在先前基线——将当前运行记录为基线，把所有排名标记为首次快照，然后继续（不要虚构“先前”排名）。
- 缺少可选工具数据（SERP 功能、AI 引用）——标记为 N/A，然后继续。

## 说明

当用户请求排名跟踪或分析时：

1. **设置关键词跟踪**——配置域名、市场、设备、语言、更新频率、优先级和竞争对手观察列表。
2. **记录当前排名**——输出排名表，其中每一行都注明来源（工具导出 / 用户提供 / 估算），并包含排名区间、排名 URL、功能归属以及相对于基线的变化。
3. **分析排名变化**——突出显示最大增幅、排名下降、稳定关键词、新增排名、丢失排名、可能原因和恢复思路；每个变化值均标明其对比基线。
4. **跟踪 SERP 功能**——比较摘要、PAA、图片/视频包、本地结果包的归属及相关功能变化。
5. **跟踪 GEO / AI 可见度**——监控 AI Overview 是否出现、引用率、引用位置和趋势；将每个值标记为已测量（来自 ~~AI 监控工具），如未观测则标记为 N/A。
6. **与竞争对手比较**——报告声量份额、正面对比和威胁等级。
7. **生成排名报告**——输出整体趋势、关键成果、问题、机会、SERP 功能变化、GEO 可见度和建议，并为每项指标附上来源标签。

将每项指标标记为 **实测**（工具/导出）、**用户提供** 或 **估算**（模型推断）；绝不要将估算值呈现为实测值；如果所需指标不可用，请将其标记为 N/A——不要编造。

> **参考资料**：有关全部七个步骤的完整输出模板，请参阅[排名分析模板](references/ranking-analysis-templates.md)。

## 示例

排名报告会列出涨幅最大项、降幅最大项和后续行动，每个排名位置均附有来源标签，并标明相对于基线的变化量。

## 排名变化快速参考

### 响应协议

| 变化 | 时间范围 | 行动 |
|--------|-----------|--------|
| 下降 1-3 个位置 | 等待 1-2 周 | 监控——可能是正常波动 |
| 下降 3-5 个位置 | 在 1 周内调查 | 检查技术问题和竞争对手的变化 |
| 下降 5-10 个位置 | 立即调查 | 运行全面诊断：技术、内容、链接 |
| 跌出第 1 页 | 紧急响应 | 全面审计 + 恢复计划 |
| 排名上升 | 记录并学习 | 确定哪些措施有效并复制 |

> **参考资料**：有关跟踪设置、根本原因分类、CTR 基准、SERP 功能影响和算法更新评估，请参阅[跟踪设置指南](references/tracking-setup-guide.md)。

### 保存结果

询问“是否保存这些结果？”如果是，则写入 `memory/monitoring/`——请参阅 [Skill Contract](../../references/skill-contract.md) 中的 §保存结果模板。

## 参考资料

- [跟踪设置指南](references/tracking-setup-guide.md)——设置规则、功能跟踪和解读指南

## 下一个最佳 Skill

初始设置（无基线）→ [alert-manager](../alert-manager/SKILL.md)。后续运行（基线已存在）→ 终止。按照 [skill-contract.md](../../references/skill-contract.md) 应用已访问集合规则。