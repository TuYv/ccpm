---
name: backlink-analyzer
description: 'Use when the user asks to "analyze backlinks" or "外链分析"; profiles external referring domains, anchor-text distribution, toxic links, and competitor link gaps. Not for internal links — use internal-linking-optimizer. 外链分析/反向链接'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when analyzing backlink profiles, link quality, toxic links, referring domains, or anchor text distribution."
argument-hint: "<domain or URL>"
allowed-tools: WebFetch
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "low"
---
# 反向链接分析器

分析反向链接配置文件，评估其质量、风险、竞争差距和链接建设机会。

## 快速开始

```
Analyze backlink profile for [domain]
```

```
Find link building opportunities by analyzing [competitor domains]
```

## 技能契约

**预期输出**：一份反向链接报告或差异摘要，以及面向 `memory/monitoring/` 的标准交接摘要。

- **读取**：目标域名、反向链接/引荐域名导出数据、竞争对手域名、锚文本数据，以及任何用户提供的数据或工具指标。
- **写入**：一份面向用户的监控交付物和可复用摘要。
- **提升记录**：将重大变化、已确认的异常、后续操作和待定决策记录到 `memory/open-loops.md`。
- **完成条件**：报告引荐域名、锚文本组合和有毒链接占比，并为每项指标标注来源（或 N/A）；计算有毒链接比率；并列出至少 3 项链接建设或拒绝链接操作。
- **主要后续技能**：当有毒性或权威性问题需要正式评分时，使用 [domain-authority-auditor](../../cross-cutting/domain-authority-auditor/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中定义的标准结构。

## 数据源

所有集成都为可选项（参见 [CONNECTORS.md](../../CONNECTORS.md)）。有工具时，从~~链接数据库提取反向链接配置文件，并从~~SEO 工具提取竞争对手数据。没有工具时，请用户提供反向链接 CSV、引荐域名、竞争对手域名和链接变更数据。按照 [SECURITY.md](../../SECURITY.md) 的要求遵守 `robots.txt` 和服务条款。

## 决策门槛

**在以下情况下停止并询问用户：**
- 未提供反向链接数据，也未连接~~链接数据库——无法测量链接数量。提供以下选项：(1) 粘贴反向链接/引荐域名导出数据，(2) 连接工具，(3) 取消。不要仅根据域名估算引荐域名数量。

**在以下情况下静默继续（绝不停止）：**
- 需要在多个竞争对手中选择深入分析对象——按重合度分析排名前三的竞争对手，并注明其余竞争对手。
- 缺少可选字段（地理位置、链接增长速度）——标记为 N/A 并继续。

## 说明

当用户请求反向链接分析时：

1. **生成配置文件概览**——输出关键指标、链接增长速度、权威性分布和配置文件健康评分，并为每项指标附上来源标签（工具导出 / 用户提供 / 估算）。
2. **分析链接质量**——分析顶级反向链接、链接类型组合、锚文本分布和地理位置。
3. **识别有毒链接**——提供风险指标、待审查链接和拒绝链接建议；将有毒链接比率作为带标签的数值报告。
4. **与竞争对手比较**——比较反向链接配置文件、分析链接交集以及竞争对手获得最多链接的内容。
5. **寻找链接建设机会**——分析交集潜在目标、失效链接、未链接品牌提及、资源页面、客座文章，并按投入与影响确定优先级。
6. **跟踪链接变更**——跟踪新增和丢失的链接、净变化及恢复优先级，并基于相应基线为每项差异添加标签。
7. **生成反向链接报告**——提供执行摘要、优势、关注事项、机会、竞争地位、建议操作和 KPI，并为每项数值标注来源。

将每项指标标记为 **Measured**（工具/导出）、**User-provided** 或 **Estimated**（模型推断）；绝不得将估算值表述为实测值；如果无法获取某项必需指标，请将其标记为 N/A——不要编造。

> **参考**：有关全部七个步骤中使用的紧凑输出模板，请参阅 [分析模板](references/analysis-templates.md)。

### CITE 条目映射

在此分析后运行 `domain-authority-auditor` 时，以下数据将直接用于 CITE 评分：

| 反向链接指标 | CITE 条目 | 维度 |
|----------------|-----------|-----------|
| 引荐域名数量 | C01（引荐域名数量） | 引用 |
| 权威度分布（DA 明细） | C02（引荐域名质量） | 引用 |
| 链接增长速度 | C04（链接增长速度） | 引用 |
| 地理分布 | C10（链接来源多样性） | 引用 |
| Dofollow/Nofollow 比率 | T02（Dofollow 比率正常度） | 信任 |
| 有害链接分析 | T01（链接配置自然度）、T03（链接与流量一致性） | 信任 |
| 竞争性链接交集 | T05（配置独特性） | 信任 |

## 示例

有关完整的输出结构（链接交集表、机会和影响模型），请参阅 [分析模板](references/analysis-templates.md)。

## 链接质量与策略参考

> **参考**：有关评分矩阵、有害链接标准、基准和拒绝链接指南，请参阅 [链接质量评分标准](references/link-quality-rubric.md)。

> **参考**：有关外联框架、主题行、回复基准、跟进序列和模板，请参阅 [外联模板](references/outreach-templates.md)。

### 保存结果

询问“是否保存这些结果？”如果回答是，则写入 `memory/monitoring/`——请参阅 [Skill 契约](../../references/skill-contract.md) §保存结果模板。如果有害链接比率超过 15%，建议使用 `domain-authority-auditor`。

## 参考资料

- [链接质量评分标准](references/link-quality-rubric.md) — 质量与有害性评分标准
- [外联模板](references/outreach-templates.md) — 外联框架和示例

## 下一最佳 Skill

有害链接比率 > 15% → [domain-authority-auditor](../../cross-cutting/domain-authority-auditor/SKILL.md)。否则 → 终止。按照 [skill-contract.md](../../references/skill-contract.md) 应用已访问集合规则。