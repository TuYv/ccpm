---
name: geo-content-optimizer
description: 'Use when the user asks to "optimize for AI citations"; improves citation readiness for ChatGPT, Perplexity, AI Overviews, Gemini, and Claude. Not for structural on-page SEO — use on-page-seo-auditor; not for net-new drafting — use seo-content-writer. AI引用优化/GEO优化/AI搜索'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when optimizing content for AI engines like ChatGPT, Perplexity, AI Overviews, Gemini, Claude, or Copilot. Also for AI citation optimization, generative engine visibility, AI引用优化, AI搜索优化, GEO优化, or 让AI引用我."
argument-hint: "<content URL or text> [target AI engine]"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "high"
---
# GEO 内容优化器

针对 ChatGPT、Perplexity、Gemini、Claude 和 AI Overviews 等 AI 生成式答案与引用展示位优化内容。

## 此技能的作用

改善内容结构、权威性信号、事实密度、可引用陈述、来源归属以及整体 GEO 就绪程度。

## 快速开始

```text
Optimize this content for GEO/AI citations: [content or URL]
Make this article more likely to be cited by AI systems
Write content about [topic] optimized for both SEO and GEO
Audit this content for GEO readiness and suggest improvements
AI Overview is eating clicks on 12 head queries — build a recovery plan
```

有关专为恢复场景定制的四阶段行动手册（衡量 → 诊断 → 重写 → 监控），请参阅 [AI Overview 恢复](references/ai-overview-recovery.md)（区别于通用 GEO 优化）。

## 技能契约

**预期输出**：可直接使用的资产或可立即实施的转换成果，以及一份可供 `memory/content/` 使用的简短交接摘要。

- **读取**：简报、目标关键词、实体输入和质量约束。**规范实体档案**：如果内容提及品牌 / 人物 / 产品，此技能必须查阅 `memory/entities/<slug>.md`（遵循 [entity-geo 交接模式](../../references/entity-geo-handoff-schema.md)），以填充 `display_name`、`description_short`、`ai_resolution_status`，并确定是否需要消歧说明文本。如果档案缺失或已过期（>90 天），则声明 `DONE_WITH_CONCERNS`，并将 `entity-optimizer` 推荐为待处理事项。
- **写入**：面向用户的内容、元数据或 schema 交付成果，以及一份可存储于 `memory/content/` 下的可复用摘要。
- **提升**：将已批准的角度、信息表达选择、缺失的证据和发布阻碍提升至 `memory/hot-cache.md` 和 `memory/open-loops.md`；将持久性决策提议为待决策事项。
- **完成条件**：每个目标 AI 查询都有独立、可引用的答案块；报告优化前后的 GEO 评分和 AI 查询覆盖率；且 CORE-EEAT GEO 自检（C02、O03、O05、E01）中不存在任何未处理的失败项。
- **主要后续技能**：当资产准备好接受审核或部署时，使用下方的 `Next Best Skill`。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中的标准结构。

## 数据源

连接可用时使用 `~~AI monitor` 和 `~~SEO tool`；否则询问目标查询、内容、引擎、竞争对手示例和已知的 AI 引用缺口。请参阅 [CONNECTORS.md](../../CONNECTORS.md)。

**衡量 GEO 工作是否取得成效：**此技能所做的更改（可提取、可引用、答案式内容）会提升**可引用性**——将 URL 提供给具备实时抓取能力的引擎并提出目标查询，即可在几分钟内测试。这是一项*代理指标*。引擎之后是否会在*没有提示的情况下*引用你（展示）则受其抓取/索引刷新制约——这通常需要数周，并受到多种混杂因素影响，而非几分钟即可完成。不要混淆这两者，也不要承诺快速获得展示。每种信号的延迟，以及为何结果变化需要对照组，均在 [references/measurement-protocol.md](../../references/measurement-protocol.md) 中定义。

## 说明

当用户请求 GEO 优化时，执行以下五个步骤：

1. **加载 CORE-EEAT GEO 优先目标** — 优先考虑 C02、C09、O03、O05、E01、O02，以及各引擎的特定偏好。
2. **分析当前内容** — 对定义清晰度、可引用陈述、事实密度、来源引用、问答格式、权威性信号、时效性和结构清晰度进行评分。
3. **应用 GEO 技术** — 添加可独立使用的 25-50 词定义、有来源支持的可引用陈述、专家/来源信号、问答/表格/列表、具体数据，以及与可见内容相匹配的 FAQ schema。
4. **生成 GEO 输出** — 报告所做更改、优化前/后的 GEO 评分以及 AI 查询覆盖范围。
5. **CORE-EEAT GEO 自检** — 使用通过/警告/失败验证 C02、C04、C09、O02、O03、O05、O06、R01、R02、R04、R07、E01、Exp10、Ept08。

将每项指标标记为 **实测**（工具/导出）、**用户提供** 或 **估算**（模型推断）；绝不能将估算结果表述为实测结果；如果无法获得某项必需指标，则将其标记为 N/A — 不得捏造。

> **参考资料**：有关完整的 CORE-EEAT GEO 目标表、AI 引擎偏好、分析模板、优化报告模板、自检矩阵和示例，请参阅[说明详情](references/instructions-detail.md)。

## 示例

**用户**：“针对 GEO 优化这段内容：‘电子邮件营销是触达客户的好方法。它已经存在了一段时间，许多企业都在使用它。’”

**输出**会添加清晰的定义、带日期/来源支持的事实、结构化列表、可引用陈述，以及优化前/后的 GEO 评分。完整模式请参阅[说明详情 — 示例](references/instructions-detail.md#example)。

## GEO 优化检查清单

> **参考资料**：有关涵盖定义、可引用内容、权威性、结构和技术元素的完整检查清单，请参阅 [GEO 优化技术](references/geo-optimization-techniques.md)中的 GEO 就绪度检查清单。

## 保存结果

经用户确认后，保存至 `memory/content/YYYY-MM-DD-<topic>.md` — 请参阅[技能契约](../../references/skill-contract.md)中的 §保存结果模板。

## 参考资料

- [说明详情](references/instructions-detail.md) - 完整的五步工作流程、CORE-EEAT GEO 目标、自检矩阵、完整示例和技巧
- [GEO 优化技术](references/geo-optimization-techniques.md) - 每项技术的详细优化前/后示例、模板和检查清单
- [AI 引用模式](references/ai-citation-patterns.md) - Google AI Overviews、ChatGPT、Perplexity 和 Claude 如何选择并引用来源
- [可引用内容示例](references/quotable-content-examples.md) - 针对 AI 引用进行优化的内容优化前/后示例

## 后续最佳技能

- **首选**：[content-quality-auditor](../../cross-cutting/content-quality-auditor/SKILL.md) — 验证优化后的内容是否足够出色，可以发布并被引用。