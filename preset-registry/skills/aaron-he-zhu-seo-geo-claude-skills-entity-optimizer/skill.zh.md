---
name: entity-optimizer
description: 'Use when the user asks to "optimize entity presence"; builds Knowledge Graph, Wikidata, sameAs, and AI recognition signals for a canonical entity identity. Not for page-level AI-citation readiness — use geo-content-optimizer. 实体优化/知识图谱'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when optimizing entity presence for Knowledge Graph, Wikidata, or AI engine disambiguation. Also for brand entity canonicalization."
argument-hint: "<entity name or brand>"
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "high"
---
# 实体优化器

审计、构建并维护实体在搜索引擎和 AI 系统中的身份。实体——即搜索引擎和 AI 系统识别为独立事物的人物、组织、产品和概念——是 Google 和 LLM 判断*品牌是什么*以及*是否应引用该品牌*的基础。

**实体对 SEO + GEO 的重要性：**

- **SEO**：Google 的知识图谱为知识面板、富媒体搜索结果和基于实体的排名信号提供支持。定义明确的实体能够在 SERP 中获得更多展示空间。
- **GEO**：AI 系统在生成答案之前，会先将查询解析为实体。如果 AI 无法识别某个实体，就无法引用它——无论其内容质量有多高。

## 此技能的作用

审计实体在知识图谱、Wikidata、Wikipedia 和 AI 系统中的存在情况；映射全部 6 类信号（共 47 个信号）；生成差距分析、构建计划和消歧策略。

## 快速开始

从以下任一提示词开始。最后，使用[技能契约](../../references/skill-contract.md)中的仓库格式生成规范实体档案和交接摘要。

### 实体审计

```
Audit entity presence for [brand/person/organization]
```

```
How well do search engines and AI systems recognize [entity name]?
```

### 构建实体存在性

```
Build entity presence for [new brand] in the [industry] space
```

```
Establish [person name] as a recognized expert in [topic]
```

### 修复实体问题

```
My Knowledge Panel shows incorrect information — fix entity signals for [entity]
```

```
AI systems confuse [my entity] with [other entity] — help me disambiguate
```

## 技能契约

**预期输出**：实体审计、规范实体档案，以及可供 `memory/entities/` 直接使用的简短交接摘要。

- **读取**：实体名称、主域名、已知资料页、主题关联和既有品牌上下文。
- **写入**：面向用户的实体报告，以及可存储在 `memory/entities/` 下的可复用档案。
- **提升**：将规范名称、sameAs 链接、消歧说明和实体缺口提升至 `memory/hot-cache.md`、`memory/entities/` 和 `memory/open-loops.md`。
- **完成条件**：对 6 类信号分别评为通过/失败/部分通过，运行 AI 解析测试（或标记为需由用户运行），并生成规范档案和优先级最高的 5 项行动。

此技能是 `memory/entities/<name>.md` 中规范实体档案的唯一写入方。其他技能只能将候选实体写入 `memory/entities/candidates.md`。当累积 3 个或更多候选实体时，应推荐使用此技能。

**档案架构**：每个规范实体档案的 frontmatter 均遵循[实体-GEO 交接架构](../../references/entity-geo-handoff-schema.md)中的权威契约。该架构定义了下游技能（`geo-content-optimizer`、`schema-markup-generator`、`meta-tags-optimizer`、`ai-overview-recovery`）所依赖的字段。请勿省略必填字段——使用方将平稳降级至 `DONE_WITH_CONCERNS`，并显示一个指向此处的 `open_loop`。

- **主要后续技能**：实体事实明确后，使用下方的 `Next Best Skill`。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../references/skill-contract.md) 中规定的标准结构。

## 数据源

有工具时：查询知识图谱 API、~~SEO 工具、~~AI 监控工具、~~品牌监控工具。无工具时：向用户询问实体名称/类型、域名、资料页、主题和消歧上下文。参见 [CONNECTORS.md](../../CONNECTORS.md)。

**零依赖本地辅助工具**（无需密钥）：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/kg.py" reconcile "<entity>"` 可将名称解析为 Wikidata QID，并提供置信度分数（为知识面板和 AI 回答提供数据的开放知识图谱是否能识别该实体？）；`kg.py entity <QID>` 返回声明和 sameAs。参见 [scripts/connectors/README.md](../../scripts/connectors/README.md)。

## 决策门槛

**在以下情况下停止并询问用户：**
- 未提供实体名称，且无法从项目上下文中推断——在审计前询问实体名称和类型。
- 实体是可能居住在欧盟/欧洲经济区/英国的个人（创始人、作者、公众人物），且准备写入 `memory/entities/`——提示：“你即将为个人创建规范资料。如果此人是或可能是欧盟/欧洲经济区/英国居民，则 GDPR 第 6 条要求具备合法依据：(1) 同意，(2) 合法利益，(3) 合同，(4) 其他。对于非欧盟主体，请核查当地法规制度（CCPA/CPRA、PIPEDA、LGPD 等）。如果不确定，请跳过并返回 NEEDS_INPUT。”仅在用户确认具备依据后继续。仅供参考——不构成法律建议。参考：[内存管理——GDPR / 隐私合规](../memory-management/SKILL.md)。

**静默继续（绝不因以下情况停止）：**
- 缺少~~AI 监控工具或~~知识图谱工具的访问权限——将相应行标记为由用户运行，并使用用户提供的观察结果继续。
- 个别信号未知——将其评为“部分”，附上验证操作，然后继续。

## 说明

当用户请求实体优化时：

### 步骤 1：实体发现

确定实体在所有系统中的当前状态。

```markdown
### Entity Profile

**Entity Name**: [name]
**Entity Type**: [Person / Organization / Brand / Product / Creative Work / Event]
**Primary Domain**: [URL]
**Target Topics**: [topic 1, topic 2, topic 3]

#### Current Entity Presence

| Platform | Status | Details |
|----------|--------|---------|
| Google Knowledge Panel | ✅ Present / ❌ Absent / ⚠️ Incorrect | [details] |
| Wikidata | ✅ Listed / ❌ Not listed | [QID if exists] |
| Wikipedia | ✅ Article / ⚠️ Mentioned only / ❌ Absent | [notability assessment] |
| Google Knowledge Graph API | ✅ Entity found / ❌ Not found | [entity ID, types, score] |
| Schema.org on site | ✅ Complete / ⚠️ Partial / ❌ Missing | [Organization/Person/Product schema] |

#### AI Entity Resolution Test

**Note**: Claude cannot directly query other AI systems or perform real-time web searches without tool access. When running without ~~AI monitor or ~~knowledge graph tools, ask the user to run these test queries and report the results, or use the user-provided information to assess entity presence.

Test how AI systems identify this entity by querying:
- "What is [entity name]?"
- "Who founded [entity name]?" (for organizations)
- "What does [entity name] do?"
- "[entity name] vs [competitor]"

| AI System | Recognizes Entity? | Description Accuracy | Cites Entity's Content? |
|-----------|-------------------|---------------------|------------------------|
| ChatGPT | ✅ / ⚠️ / ❌ | [accuracy notes] | [yes/no/partially] |
| Claude | ✅ / ⚠️ / ❌ | [accuracy notes] | [yes/no/partially] |
| Perplexity | ✅ / ⚠️ / ❌ | [accuracy notes] | [yes/no/partially] |
| Google AI Overview | ✅ / ⚠️ / ❌ | [accuracy notes] | [yes/no/partially] |
```

### 第 2 步：实体信号审计

评估 6 个类别的实体信号。有关包含验证方法的 47 项详细信号检查清单，请参阅[实体信号检查清单](references/entity-signal-checklist.md)。

将每项信号评估为通过 / 失败 / 部分通过，并针对每个缺口给出具体行动。6 个类别如下：

1. **结构化数据信号** — Organization/Person schema、sameAs 链接、@id 一致性、author schema
2. **知识库信号** — Wikidata、Wikipedia、CrunchBase、行业目录
3. **一致的 NAP+E 信号** — 各平台上的名称/描述/徽标/社交信息一致性
4. **基于内容的实体信号** — 关于页面、作者页面、主题权威性、品牌反向链接
5. **第三方实体信号** — 权威提及、共同引用、评论、媒体报道
6. **AI 特定实体信号** — 清晰定义、消歧、可验证声明、可抓取性

> **参考**：使用[实体信号检查清单](references/entity-signal-checklist.md)中的审计模板，获取完整的 47 项信号检查清单以及各类别的验证方法。

### 第 3 步：报告与行动计划

生成一份实体优化报告，包含：概览（实体/类型/日期）、信号类别摘要（包含发现的 6 类别 ✅/⚠️/❌ 表格）、关键问题、前 5 项优先行动（影响 × 工作量）、实体建设路线图（第 1-2 周 → 第 1 个月 → 第 2-3 个月 → 持续进行），以及 CORE-EEAT A07/A08 + CITE I01-I10 交叉引用。

> **参考**：有关完整的第 3 步报告模板，请参阅[实体信号检查清单](references/entity-signal-checklist.md)。

### 保存结果

询问“是否保存这些结果以供未来会话使用？”（请参阅[技能契约](../../references/skill-contract.md)中的 §Save Results Template）— 如果回答是，请使用上述 Profile schema 将规范实体档案写入 `memory/entities/<entity-slug>.md`。如果该实体对项目至关重要，还应向 `memory/hot-cache.md` 添加 1-3 行指针；不要使用通用的 `memory/YYYY-MM-DD-<topic>.md` 模式保存规范档案。

在写入任何规范档案之前，请检查 `memory/audits/gdpr-purges.md` 中是否存在该实体之前的清除记录（通过已编辑标签或域名识别）。如果存在，不要静默地重新创建档案；返回 `NEEDS_INPUT`，并请用户确认是否应重新添加该实体。

## 示例

**用户**：“审计 Acme Analytics 的实体存在情况；这是我们的 B2B SaaS 分析平台，网址为 acme-analytics.example”

**输出**（节选）：AI 解析测试显示识别不完整 — ChatGPT 将其描述为通用的“分析工具”，未体现 B2B 特性；它未被列入企业分析领域的参与者之中；AI 系统不了解其创始人。健康状况摘要标记出缺少 Wikidata 条目且没有知识面板，优先行动包括提交 Wikidata、添加 sameAs 链接以及创建创始人简介页面。

> **参考**：有关完整的实体审计报告，包括 AI 解析测试结果、实体健康状况摘要、前 3 项优先行动以及 CORE-EEAT/CITE 交叉引用，请参阅[示例审计报告](references/example-audit-report.md)。

## 实体类型参考

> **参考**：有关按情境分类的实体类型关键信号、模式和消歧策略，请参阅[实体类型参考](references/entity-type-reference.md)。

## 知识面板与 Wikidata 优化

> **参考**：有关知识面板的认领/编辑、常见问题及修复方法、Wikidata 条目创建、不同实体类型的关键属性，以及 AI 实体解析优化，请参阅[知识面板与 Wikidata 指南](references/knowledge-panel-wikidata-guide.md)。

## 参考资料

实体优化的详细指南：
- [实体信号检查清单](references/entity-signal-checklist.md) — 完整的信号检查清单，包含验证方法、第 3 步报告模板和成功技巧
- [知识图谱指南](references/knowledge-graph-guide.md) — Wikidata、Wikipedia 和知识图谱优化操作手册

## 下一项最佳技能

首选：[schema-markup-generator](../../build/schema-markup-generator/SKILL.md)。也可考虑：[geo-content-optimizer](../../build/geo-content-optimizer/SKILL.md)（AI 识别缺口）或 [seo-content-writer](../../build/seo-content-writer/SKILL.md)（需要新的“关于”/创始人页面）。