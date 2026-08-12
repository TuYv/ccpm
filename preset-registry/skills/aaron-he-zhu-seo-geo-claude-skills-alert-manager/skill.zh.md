---
name: alert-manager
description: 'Use when the user asks to "set SEO alerts" or "排名掉了提醒我"; configures threshold notifications for FUTURE ranking, traffic, technical, and competitor changes. Not for one-time measurement or reporting — use rank-tracker or performance-reporter. SEO预警/排名监控'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when setting up monitoring alerts for rankings, traffic, backlinks, technical issues, or AI visibility changes."
argument-hint: "<domain> [metric]"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "low"
---
# 警报管理器

为排名、流量、技术、反向链接、竞争对手和 GEO 变化设置主动监控警报。

## 快速开始

```
Set up SEO monitoring alerts for [domain]
```

```
Create ranking drop alerts for my top 20 keywords
```

## 技能契约

**预期输出**：警报配置摘要，以及面向 `memory/monitoring/` 的标准交接摘要。

- **读取**：基准值、需要监控的关键关键词/指标、正常波动范围、交付偏好，以及用户提供的任何数据或工具数据。
- **写入**：面向用户的监控交付成果和可复用摘要。
- **提升记录**：将重大异常、长期有效的阈值、后续行动和待决事项记录到 `memory/open-loops.md`。
- **完成条件**：每个选定的警报类别都有具名的触发条件、阈值和优先级；定义了严重/高/中/低级别的响应计划和交付路由；并且根据指标所述的正常波动范围调整了阈值。
- **主要后续技能**：当警报输出需要设定报告周期时，使用 [performance-reporter](../performance-reporter/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

所有集成均为可选（参见 [CONNECTORS.md](../../CONNECTORS.md)）。有工具时，监控来自 ~~SEO 工具、~~搜索控制台和 ~~网络爬虫的实时数据流。没有工具时，向用户询问基准值、关键关键词、偏好和历史数据。

## 决策关卡

**在以下情况下停止并询问用户：**
- 待监控指标不存在基准值或正常波动参考——此时阈值将是任意设定的。提供以下选项：(1) 提供近期基准数据，(2) 使用下方快速参考中的默认值并将其标记为估算值，(3) 取消。

**在以下情况下静默继续（绝不停止）：**
- 使用哪个交付渠道——默认使用上下文中已有的渠道（或电子邮件），并注明这一点。
- 用户未提及的类别——保持未配置状态；不要添加用户未请求的警报。

## 说明

当用户请求设置警报时：

1. **定义警报类别**——从排名、流量、技术、反向链接、竞争对手、GEO / AI 和品牌警报中选择。
2. **按类别配置警报规则**——为每条相关规则定义触发条件、阈值、警报名称和优先级；将每个阈值与明确说明的基准值关联，并将该基准值标记为实测 / 用户提供 / 估算。
3. **定义警报响应计划**——将严重 / 高 / 中 / 低级别映射到响应时间和后续行动。
4. **设置警报交付**——配置渠道、路由、冷却时间、维护窗口和升级路径。
5. **创建警报摘要**——输出各类别的警报数量、严重警报处置手册和每周审核清单，作为交付成果。

将每个指标标记为**实测**（工具/导出数据）、**用户提供**或**估算**（模型推断）；绝不将估算值表述为实测值；如果无法获得必需指标，请将其标记为 N/A——不要编造。

> **参考**：有关完整的类别表、阈值和响应计划模板，请参阅[警报配置模板](references/alert-configuration-templates.md)。

## 示例

示例结果：一个包含严重与高风险阈值的关键词警报矩阵、排名下降响应计划，以及发送至电子邮件和 Slack 的通知路由。

## 警报阈值快速参考

| 指标 | 警告 | 严重 | 频率 |
|--------|---------|----------|-----------|
| 自然流量 | 环比下降 15% | 环比下降 30% | 每日 |
| 关键词排名 | 下降超过 3 位 | 下降超过 5 位 | 每日 |
| 已编入索引的页面 | 变化 -5% | 变化 -20% | 每周 |
| 抓取错误 | 每日新增超过 10 个 | 每日新增超过 50 个 | 每日 |
| Core Web Vitals | “需要改进” | “较差” | 每周 |
| 丢失的反向链接 | 1 周内超过 5% | 1 周内超过 15% | 每周 |
| AI 引用丢失 | 任意关键查询 | 超过 20% 的查询 | 每周 |
| 安全问题 | 检测到任何问题 | 检测到任何问题 | 每日 |

> **参考资料**：有关阈值设置、疲劳预防、升级路径和响应手册，请参阅[警报阈值指南](references/alert-threshold-guide.md)。

### 保存结果

询问“是否保存这些结果？”如果是，则写入 `memory/monitoring/` — 请参阅 [Skill 契约](../../references/skill-contract.md) §保存结果模板。

## 参考资料

- [警报阈值指南](references/alert-threshold-guide.md) — 阈值、疲劳预防和升级模板

## 下一最佳 Skill

需要定期报告 → [performance-reporter](../performance-reporter/SKILL.md)。独立设置 → Terminal。按照 [skill-contract.md](../../references/skill-contract.md) 应用已访问集合规则。