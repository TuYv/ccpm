---
name: report-generator
slug: aaron-report-generator
displayName: "Report Generator · 报告生成"
summary: "面向干系人的营销活动报告:叙事结构、图表建议与洞察提炼"
description: 'Use when the user asks to "create a campaign report", "build an executive summary", or "deliver client results"; produces audience-tailored influencer marketing reports (executive, client, internal team) with data tables, narrative, key learnings, and recommendations. Not for raw metric computation — use performance-analyzer. 达人营销报告/结案汇报'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate after a campaign or reporting period ends and the user needs a written report for a specific stakeholder. Triggers include post-campaign wrap-ups, executive or board summaries, client-facing results decks, internal team retrospectives, and monthly or quarterly performance reports. Pick this when the inputs are already-computed metrics that need structure, narrative, and recommendations for a named audience."
argument-hint: "<campaign name> [audience: executive|client|team|board]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 报告生成器

此技能可帮助你创建专业的网红营销报告，讲述营销活动的绩效故事。它会根据受众调整内容和详略程度。

> **跨领域（付费广告）：**这也是**付费广告**的报告界面——根据 RQS 历史记录（`memory/audits/ad/`）和衡量闭环的回读结论，构建高管、客户及渠道报告。它负责呈现指标，而不计算指标（回报计算仍由 [roi-calculator](../roi-calculator/SKILL.md) 完成）。将付费广告运行结果保存在 `memory/ad/report-generator/` 下。

## 快速开始

最简调用方式：

```
Create a campaign report for [campaign name] for [audience: executive/client/team]
```

常见场景：

```
Generate an executive summary for our Q3 influencer campaigns
```

## 技能契约

- **读取**：营销活动名称、报告周期、目标受众和已计算的指标（覆盖人数、互动、转化、支出、收入、ROI/ROAS、各网红的结果）。如有，则读取 `performance-analyzer` 和 `roi-calculator` 之前的输出。
- **写入**：采用适合相应受众的模板生成完整报告，并保存至 `memory/influencer/report-generator/YYYY-MM-DD-<topic>.md`。
- **提升**：将可长期复用的结论（最终 ROI/ROAS、表现最佳者、续约/放弃决定、核心经验）提升至 `memory/hot-cache.md`。
- **完成条件**：
  1. 报告符合所请求的受众模板（高管、客户、团队或董事会）。
  2. 每项指标都附有上下文（目标、基准或上一周期）。
  3. 报告以具体建议以及适用情况下的行动项结尾。
- **主要后续技能**：[content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md)

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列提供第 1 层级支持：无需实时集成即可完成每个步骤。直接向此技能提供营销活动指标，它便会根据你的输入构建报告。

可在条件允许时预填充数据的可选连接器：

- `~~social platform analytics` — 每篇帖子的覆盖人数、展示次数、互动量和视频观看次数
- `~~influencer database` — 创作者账号、层级、费用和受众人口统计数据
- `~~analytics` — 链接点击量、转化量和归因收入
- `~~CRM` — 新客户数量和后续收入

即使没有其中任何一种连接器，此技能也会向你询问相关数字并继续执行。有关各类别的免费/免密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

当用户请求报告时：

1. **确定报告参数**——设置报告类型（活动后/月度/季度/年度）、营销活动、报告周期和受众。根据受众调整详略程度：高管需要高层次的 ROI 和战略信息；客户需要结果和价值；团队需要详细的经验和优化方向；董事会需要了解业务影响。请参阅 [report-templates.md](references/report-templates.md) 中的受众需求矩阵。

2. **选择受众模板并填写内容**——完整的高管、客户和内部团队模板位于 [report-templates.md](references/report-templates.md)。如存在，则从 `performance-analyzer` 和 `roi-calculator` 的输出中提取指标；否则，向用户询问相关数字。为每项指标配上上下文（目标、基准或上一周期）。

3. **应用可视化与写作指南** — 根据每个数据点和受众选择合适的图表，并遵循以成果为先的叙事结构。请参阅 [report-templates.md](references/report-templates.md) 中的可视化建议和写作最佳实践。

4. **以建议和行动项收尾** — 每份报告都应以具体的后续步骤结尾；对于团队和董事会受众，添加包含负责人和截止日期的行动项表格。

5. **保存并提升** — 将完成的报告写入 `memory/influencer/report-generator/YYYY-MM-DD-<topic>.md`（付费投放报告写入 `memory/ad/report-generator/`）。将具有长期价值的结论（最终 ROI/ROAS、表现最佳者、续约/终止合作决策、核心经验）提升至 `memory/hot-cache.md`。

## 示例

**用户**：“为我们的节日营销活动创建一份高管报告：支出 5 万美元，收入 16.5 万美元，通过 15 位影响者触达 350 万人”

**输出**（节选 — 完整模板见 [report-templates.md](references/report-templates.md)）：

```markdown
# Holiday Campaign 2024: Executive Summary

## Bottom Line: Campaign Exceeded All Targets ✅

**ROI: 230%** | **ROAS: 3.3:1** | **Revenue: $165,000**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Revenue | $100K | $165K | ✅ +65% |
| ROAS | 2:1 | 3.3:1 | ✅ +65% |
| Reach | 2M | 3.5M | ✅ +75% |

### Recommendation

Increase Q1 influencer budget by 25%, focused on TikTok micro-influencers and product-demo content.
```

## 参考资料

- [report-templates.md](references/report-templates.md) — 完整的高管/客户/团队模板、可视化建议、写作最佳实践和完整示例
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接格式
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无密钥数据使用方案
- [performance-analyzer](../performance-analyzer/SKILL.md) — 生成本报告使用的指标
- [roi-calculator](../roi-calculator/SKILL.md) — 提供 ROI/ROAS 数据
- [campaign-planner](../../target/campaign-planner/SKILL.md) — 用于对比结果的原始计划
- [content-amplifier](../../activate/content-amplifier/SKILL.md) — 需要在报告中呈现的内容放大结果
- [content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md) — 报告本身的质量关卡

## 下一最佳技能

**首选**：[content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md) — 在向利益相关者提交报告之前，让完成的报告通过发布就绪度检查。

**备选（同一报告阶段/影响者技能系列）**：

- [performance-analyzer](../performance-analyzer/SKILL.md) — 如果报告暴露出数据缺口，请在重新生成报告前再次进行分析。
- [roi-calculator](../roi-calculator/SKILL.md) — 如果财务输入发生变化，请重新计算回报数据。

**终止说明**（已访问集合）：如果推荐的技能在本次会话中已被调用，请停止并报告该调用链已完成，而不是重新运行该技能。遵循最多 3 跳的调用链深度限制，以避免循环。