---
name: meta-tags-optimizer
description: 'Use when the user asks to "optimize meta tags"; improves titles, descriptions, Open Graph, Twitter cards, and CTR test variants. Not for JSON-LD structured data — use schema-markup-generator; not for body copy — use seo-content-writer. 标题优化/元描述/CTR'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when optimizing title tags, meta descriptions, Open Graph tags, or Twitter Cards for a page."
argument-hint: "<page URL or content>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "low"
---
# 元标签优化器

创建可提升点击率和分享质量的标题标签、元描述和社交媒体元标签。

## 快速开始

```
Create meta tags for a page about [topic] targeting [keyword]
```

```
Improve these meta tags for better CTR: [current tags]
```

## 技能契约

**预期输出**：一套可直接使用的元数据包，以及面向 `memory/content/` 的标准交接摘要。

- **读取**：简报、目标关键词、实体输入和质量约束。
- **写入**：面向用户的元数据交付成果和可复用摘要。
- **提升**：将已批准的角度、信息表达选择、缺失的证据和发布阻碍提升至 `memory/hot-cache.md` 和 `memory/open-loops.md`；将持久性决策作为待决策事项提出。
- **完成条件**：提供三个标题选项和三个描述选项，均符合字符数限制并将关键词前置；包含完整的 OG/Twitter 标签块；且 C01（意图一致性）和 C02（直接回答）通过检查。
- **主要后续技能**：元数据包准备好接受结构化数据支持后，使用 [schema-markup-generator](../schema-markup-generator/SKILL.md)。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

可选的 Search Console 和 SEO 工具集成会自动提取点击率数据和竞争对手模式；否则，应询问当前标签、关键词和竞争对手。参见 [CONNECTORS.md](../../CONNECTORS.md)。

## 操作说明

当用户请求优化元标签时，执行以下六个步骤：

1. **收集页面信息** — URL、页面类型、主要和次要关键词、受众、CTA 和价值主张。
2. **创建优化后的标题标签** — 将长度控制在约 50-60 个字符，将关键词前置，并使用支持的标题公式生成三个选项。
3. **编写元描述** — 目标长度为 150-160 个字符，包含关键词和 CTA，并生成三个选项。
4. **创建 Open Graph、Twitter Card 和其他元标签** — 根据需要包含 OG、Twitter、canonical、robots、viewport、author 和 article 标签。
5. **CORE-EEAT 一致性检查** — 验证 C01（意图一致性）和 C02（直接回答）。
6. **提供点击率优化建议** — 说明制胜要素、权衡取舍和 A/B 测试选项。

将每项指标标记为**实测**（工具/导出）、**用户提供**或**估算**（模型推断）；绝不将估算值呈现为实测值；如果无法获取所需指标，则将其标记为 N/A — 不得捏造。

> **参考资料**：有关精简工作流、公式、一致性矩阵、点击率分析和示例，请参阅[操作说明详情](references/instructions-detail.md)。有关 HTML 代码块，请参阅[元标签代码模板](references/meta-tag-code-templates.md)。

## 示例

完整的实操示例请参阅[操作说明详情 — 示例](references/instructions-detail.md#example)。

## 保存结果

经用户确认后，保存至 `memory/content/YYYY-MM-DD-<topic>.md` — 请参阅[技能契约](../../references/skill-contract.md)中的 §保存结果模板。

## 参考资料

- [说明详情](references/instructions-detail.md) — 工作流程、公式、对齐矩阵、示例
- [元标签公式](references/meta-tag-formulas.md) — 标题和描述公式
- [元标签代码模板](references/meta-tag-code-templates.md) — HTML 模板
- [点击率与社交媒体参考](references/ctr-and-social-reference.md) — 点击率模式和社交媒体指南

## 下一项最佳 Skill

- **首选**：[schema-markup-generator](../schema-markup-generator/SKILL.md) — 使用结构化数据完善 SERP 方案包。