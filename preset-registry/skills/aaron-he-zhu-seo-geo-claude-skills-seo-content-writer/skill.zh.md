---
name: seo-content-writer
description: 'Use when the user asks to "write SEO content"; drafts new posts, articles, and landing pages with keywords, headers, snippets, and evidence boundaries. Not for AI-citation/GEO readiness scoring — use geo-content-optimizer; not for updating decaying existing content — use content-refresher. SEO文章写作/内容优化'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when writing SEO-optimized articles, blog posts, landing pages, or product descriptions. Also when the user asks to create content targeting a specific keyword."
argument-hint: "<topic> <target keyword>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# SEO 内容撰写器

创建符合搜索意图、自然融入关键词且便于读者阅读的 SEO 内容。

## 快速开始

```
Write an SEO-optimized article about [topic] targeting the keyword [keyword]
```

```
Here's my content brief: [brief]. Write SEO-optimized content following this outline.
```

## Skill 契约

**预期输出**：一份可直接使用的草稿，以及用于 `memory/content/` 的标准交接摘要。

- **读取**：内容简报、目标关键词、实体输入和质量约束。
- **写入**：面向用户的内容交付物和可复用摘要。
- **推送**：将已批准的内容角度、信息表达选择、缺失的证据和发布阻碍推送至 `memory/hot-cache.md` 和 `memory/open-loops.md`；将长期有效的决策作为待决策项提出。
- **完成标准**：草稿满足目标意图，并自然放置主要关键词；包含 H1/H2 结构、元描述和至少一个可作为摘要片段的内容块；所有需要来源支持的声明均已引用来源或标记。
- **主要后续 Skill**：草稿准备好进入质量门禁时，使用 [content-quality-auditor](../../cross-cutting/content-quality-auditor/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中定义的标准结构。

## 数据源

连接可用时，使用 `~~SEO tool` 和 `~~search console`；否则，询问关键词、搜索意图和竞争对手。参见 [CONNECTORS.md](../../CONNECTORS.md)。

## 说明

当用户请求 SEO 内容时，执行以下九个步骤：

1. **收集需求** — 确认主要和次要关键词、字数、内容类型、受众、搜索意图、语气、CTA 和竞争对手。
2. **加载 CORE-EEAT 约束** — 应用配套参考资料中列出的 16 个高权重项目。
3. **研究和规划** — 分析 SERP、规划关键词并选择内容角度。
4. **创建优化后的标题** — 保持简洁、以关键词为主导，并与搜索意图保持一致。
5. **撰写元描述** — 包含关键词、价值主张和 CTA。
6. **组织并撰写内容** — 使用清晰的 H1 > 引言 > H2/H3 > FAQ > 结论流程。
7. **应用页面 SEO 最佳实践** — 管理关键词位置、可读性、摘要片段和辅助视觉素材。
8. **添加内部／外部链接** — 包含相关的内部链接和权威外部链接。
9. **执行最终 SEO + CORE-EEAT 审查** — 对草稿进行评分，自动修复小问题，并明确列出仍需用户决定的事项。

任何需要来源支持的事实性声明、统计数据或引述都必须标注引用，或明确标记为 `[needs source]`；绝不虚构数字、研究、日期或归属信息来填补空缺。

**质量标准**：交接前，确认草稿通过以下检查 — (1) 意图匹配：使用目标查询的读者无需滚动页面即可获得答案；(2) 关键词自然出现在标题、H1、前 100 个词和一个 H2 中，不存在堆砌；(3) 结构易于浏览（H2/H3、列表、一个可直接用于摘要片段的内容块）；(4) 不包含任何虚构事实 — 所有需要来源支持的声明均已引用来源或标记为 `[needs source]`。如果任何一项未通过，请修复或在交接中报告，不得在不作说明的情况下交付。

> **参考**：有关精简工作流、写作前检查清单、问题分类规则和自检格式，请参阅[详细说明](references/instructions-detail.md)。

## 示例

有关文案写作启动检查清单和文章模板，请参阅 [references/seo-writing-checklist.md](references/seo-writing-checklist.md)。

## 内容类型模板

操作指南、对比文章、列表文章、支柱页面、评测和常见问题页面的快速入门模式位于 [references/content-structure-templates.md](references/content-structure-templates.md)。

## 保存结果

经用户确认后，保存至 `memory/content/YYYY-MM-DD-<topic>.md`——请参阅[技能契约](../../references/skill-contract.md)的§保存结果模板。

## 参考资料

- [详细说明](references/instructions-detail.md)——工作流、CORE-EEAT 约束、问题处理、自检
- [SEO 写作检查清单](references/seo-writing-checklist.md)——页面检查清单、摘要模式和文案写作启动模板
- [标题公式](references/title-formulas.md)——标题公式和点击率模式
- [内容结构模板](references/content-structure-templates.md)——精简的内容蓝图

## 下一项最佳技能

- **首选**：[content-quality-auditor](../../cross-cutting/content-quality-auditor/SKILL.md)——在发布前对草稿进行把关。