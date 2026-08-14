---
name: memory-notes
description: "How to write well-structured Basic Memory notes: frontmatter, observations with semantic categories, relations with wiki-links, and best practices for building a rich knowledge graph. Use when creating or improving notes."
---
# 记忆笔记

编写结构良好的笔记，使 Basic Memory 能够将其解析为可搜索的知识图谱。每篇笔记都是一个 Markdown 文件，包含三个关键部分：frontmatter、观察和关系。

## 笔记结构

```markdown
---
title: API Design Decisions
tags: [api, architecture, decisions]
---

# API Design Decisions

The API team evaluated multiple approaches for the public API during Q1. After
prototyping both REST and GraphQL, the team chose REST due to broader ecosystem
support and simpler caching semantics. This note captures the key decisions and
their rationale, along with open questions still to resolve.

## Observations
- [decision] Use REST over GraphQL for simplicity #api
- [requirement] Must support versioning from day one
- [risk] Rate limiting needed for public endpoints

## Relations
- implements [[API Specification]]
- depends_on [[Authentication System]]
- relates_to [[Performance Requirements]]
```

### Frontmatter

每篇笔记都以 YAML frontmatter 开头：

```yaml
---
title: Note Title          # required — becomes the entity name in the knowledge graph
tags: [tag1, tag2]         # optional — for organization and filtering
type: note                 # optional — defaults to "note", use custom types with schemas
permalink: custom-path     # optional — auto-generated from title if omitted
---
```

- `title` 必须与正文中的 `# Heading` 一致
- 标签可供搜索，并有助于发现内容
- 自定义 `type` 值（Task、Meeting、Person 等）可与模式系统配合使用。有关定义模式、根据模式验证笔记以及检测漂移的信息，请参阅 **memory-schema** skill。
- `permalink` 会根据 `title` 和 `directory` 自动生成。例如，目录 "specs" 中标题为 "API Design Decisions" 的笔记会生成永久链接 `specs/api-design-decisions` 和记忆 URL `memory://specs/api-design-decisions`。如果未指定目录，永久链接就是转换为 kebab-case 的标题。永久链接在文件移动后仍保持稳定。你很少需要手动设置它。

> **注意：** 使用 `write_note` 时，你无需自行编写 frontmatter。`title`、`tags`、`note_type` 和 `metadata` 是独立的参数——Basic Memory 会自动生成 frontmatter。你的 `content` 参数只是以 `# Heading` 开头的 Markdown 正文。

### 正文 / 上下文

标题与观察部分之间可以使用自由形式的 Markdown。这是笔记的核心——请在这里充分展开：
- 背景、动机和历史
- 对所发生事情及其重要性的详细说明
- 所考虑的分析、推理和权衡
- 某人（或 AI）日后理解这篇笔记所需的上下文

请使用完整、充实的文字。Basic Memory 的搜索会从笔记正文中检索相关片段，因此更长、更丰富的上下文能让笔记更容易被发现，并在找到后更加有用。不要把所有内容都简化为项目符号——要讲清楚事情的来龙去脉。

## 观察

观察是经过分类的事实——知识的原子单位。每条观察都会成为知识图谱中可搜索的实体。

### 语法

```
- [category] Content of the observation #optional-tag
```

- **方括号**定义语义类别
- **内容**是事实、决策、洞见或备注
- **井号标签**（可选）用于添加额外的筛选元数据

### 类别可以任意定义

方括号中的类别是自由形式的——使用任何符合该观察记录含义的标签。类别没有固定列表。唯一的规则是遵循 `[category] content` 语法。在项目内保持一致有助于提高可搜索性，但你可以自由创建类别。

以下示例展示了类别的多样性：

```
- [decision] Use PostgreSQL for primary data store
- [risk] Third-party API has no SLA guarantee
- [technique] Exponential backoff for retry logic #resilience
- [question] Should we support multi-tenancy at the DB level?
- [preference] Use Bun over Node for new projects
- [lesson] Always validate webhook signatures server-side
- [status] active
- [flavor] Ethiopian beans work best with lighter roasts
```

### 观察记录技巧

- **每条观察记录只包含一个事实。** 不要把多个想法塞进同一行。
- **要具体。** `[decision] Use JWT` 不如 `[decision] Use JWT with 15-minute expiry for API auth` 实用。
- **使用标签标记横切关注点。** `[risk] Rate limiting needed #api #security` 可以通过这两个主题找到。
- **类别可以查询。** `search_notes("[decision]")` 可以查找整个知识库中的所有决策。

## 关系

关系在知识图谱中创建边，将笔记相互连接起来。通过关系，你可以构建超越单篇笔记的结构。

### 语法

```
- relation_type [[Target Note Title]]
```

- **relation_type** 是描述性的动词或短语（按照惯例使用 snake_case）
- **双括号** `[[...]]` 通过标题或永久链接标识目标笔记
- 关系具有方向性：当前笔记 → 目标笔记

### 关系类型

| 类型 | 用途 | 示例 |
|------|---------|---------|
| `implements` | 一个事物实现另一个事物 | `- implements [[Auth Spec]]` |
| `requires` | 依赖项 | `- requires [[Database Setup]]` |
| `relates_to` | 一般关联 | `- relates_to [[Performance Notes]]` |
| `part_of` | 层级/组成关系 | `- part_of [[Backend Architecture]]` |
| `extends` | 增强或扩展 | `- extends [[Base Config]]` |
| `pairs_with` | 可协同工作的事物 | `- pairs_with [[Frontend Client]]` |
| `inspired_by` | 来源材料 | `- inspired_by [[CRDT Research Paper]]` |
| `replaces` | 取代另一篇笔记 | `- replaces [[Old Auth Design]]` |
| `depends_on` | 运行时/构建依赖项 | `- depends_on [[MCP SDK]]` |
| `contrasts_with` | 替代方案 | `- contrasts_with [[GraphQL Approach]]` |

### 内联关系

笔记正文中任何位置的 Wiki 链接——不仅限于“关系”部分——也会创建图谱边：

```markdown
We evaluated [[GraphQL Approach]] but decided against it because
the team has more experience with REST. See [[API Specification]]
for the full contract.
```

这些链接会自动创建 `references` 关系。对于显式的类型化关系，请使用“关系”部分；对于自然行文中的引用，请使用内联链接。

### 关系使用技巧

- **尽量多添加链接。** 关系能将孤立的笔记转化为知识图谱。如果不确定是否需要，请添加链接。
- **如果目标笔记尚不存在，就创建它。** `[[Future Topic]]` 是有效的——创建该笔记后，BM 会自动解析该链接。
- **使用 `build_context` 进行遍历。** `build_context(url="memory://note-title")` 会沿着关系收集相互关联的知识。
- **可以使用自定义关系类型。** `taught_by`、`blocks`、`tested_in`——使用任何具有描述性的类型即可。

## Memory URL

每篇笔记都可以通过基于其永久链接构建的 `memory://` URL 进行访问。你可以通过这些 URL，以编程方式浏览知识图谱。

### URL 模式

```
memory://api-design-decisions          # by permalink (title → kebab-case)
memory://docs/authentication           # by file path
memory://docs/authentication.md        # with extension (also works)
memory://auth*                         # wildcard prefix
memory://docs/*                        # wildcard suffix
memory://project/*/requirements        # path wildcards
```

### 项目作用域 URL

在多项目配置中，请添加项目前缀：

```
memory://main/specs/api-design         # "main" project, "specs/api-design" path
memory://research/papers/crdt          # "research" project
```

第一个路径段会与已知的项目名称进行匹配。如果匹配成功，它将用作项目作用域；否则，该 URL 将在默认项目中解析。

### 使用 Memory URL

Memory URL 可与 `build_context` 配合使用，通过遍历关系来汇集相关知识：

```python
# Get a note and its connected context
build_context(url="memory://api-design-decisions")

# Wildcard — gather all docs
build_context(url="memory://docs/*")

# Direct read by permalink
read_note(identifier="memory://api-design-decisions")
```

## 创建笔记之前

创建新笔记之前，始终先在 Basic Memory 中搜索。重复笔记会割裂你的知识图谱——更新现有笔记几乎总是比创建第二篇笔记更好。

### 使用多种表述进行搜索

单次搜索经常会有遗漏。请尝试完整名称、缩写、首字母缩略词和关键词：

```python
# Searching for an entity that might already exist
search_notes(query="Kubernetes Migration")
search_notes(query="k8s migration")
search_notes(query="container migration")
```

搜索人物时，请尝试使用全名和姓氏。搜索组织时，请尝试使用完整名称和常见缩写。

### 决策树

- **实体已存在** → 使用 `edit_note` 更新它（追加观察记录、添加关系、查找并替换过时信息）
- **实体不存在** → 使用 `write_note` 创建它
- **不确定是否为同一实体** → 先阅读现有笔记，再做决定

### 使用 `edit_note` 进行精细更新

如果笔记已存在，请进行有针对性的编辑，而不是重写整个文件：

```python
# Append a new observation to an existing note
edit_note(
  identifier="API Design Decisions",
  operation="append",
  section="Observations",
  content="- [decision] Switched to OpenAPI 3.1 for spec generation #api"
)

# Fix outdated information
edit_note(
  identifier="API Design Decisions",
  operation="find_replace",
  find_text="- [status] draft",
  content="- [status] approved"
)

# Add a new relation
edit_note(
  identifier="API Design Decisions",
  operation="append",
  section="Relations",
  content="- depends_on [[Rate Limiter]]"
)
```

这会保留现有内容，并使编辑历史保持整洁。

## 使用工具编写笔记

### 创建笔记

```python
write_note(
  title="API Design Decisions",
  directory="architecture",
  tags=["api", "architecture"],
  content="""# API Design Decisions

The API team evaluated REST and GraphQL during Q1 planning. After prototyping
both approaches, we chose REST for the public API — broader ecosystem support,
simpler caching with HTTP semantics, and a lower learning curve for external
consumers. GraphQL remains an option for internal services where query
flexibility matters more.

## Observations
- [decision] Use REST for public API #api
- [requirement] Support API versioning from v1

## Relations
- implements [[API Specification]]
- relates_to [[Backend Architecture]]"""
)
```

Basic Memory 会根据参数自动生成前置元数据（包括永久链接和记忆 URL）。此笔记将获得永久链接 `architecture/api-design-decisions`，并可通过 `memory://architecture/api-design-decisions` 访问。

### 编辑现有笔记

使用 `edit_note` 就地更新笔记——支持四种操作：

```python
# append / prepend — add to the end or start (use for time-ordered logs)
edit_note(
  identifier="API Design Decisions",
  operation="append",
  section="Observations",
  content="- [decision] Use OpenAPI 3.1 for spec generation #api"
)
edit_note(
  identifier="API Design Decisions",
  operation="prepend",
  content="> Updated 2026-05-28: auth approach finalized.\n"
)

# replace_section — rewrite a named section (use for living content that stays current)
edit_note(
  identifier="API Design Decisions",
  operation="replace_section",
  section="Summary",
  content="Concise, current summary of the decision and its rationale."
)

# find_replace — swap specific text
edit_note(
  identifier="API Design Decisions",
  operation="find_replace",
  find_text="OpenAPI 3.0",
  content="OpenAPI 3.1"
)
```

当编辑操作具有破坏性时（`replace_section`、`find_replace`），最佳实践是先读取笔记，并在应用更改之前进行确认。

### 移动笔记

使用 `move_note` 将笔记重新整理到不同的目录中：

```python
move_note(
  identifier="API Design Decisions",
  destination_path="archive/api-design-decisions.md"
)
```

移动后永久链接保持不变，因此所有 `[[wiki-links]]` 和 `memory://` URL 仍可正常解析。

## 最佳实践

1. **从上下文开始。** 在列出观察项之前，先解释这篇笔记存在的*原因*。未来的你（或你的 AI 协作者）会感谢你。

2. **优先保证完整性。** 编写内容丰富且充实的笔记。Basic Memory 的搜索会从笔记正文中提取相关内容片段，因此上下文更丰富的长篇笔记会*更*容易被发现，而不是更难。使用正文中的叙述来讲述完整过程——背景、推理和细微差别。然后，将关键事实提炼为 `[category] content` 观察项，以便进行结构化查询。二者都很重要：叙述赋予含义，观察项提供精确性。

3. **逐步构建。** 在现有笔记中添加内容，而不是创建重复笔记。随着了解不断深入，使用 `edit_note` 追加新的观察项或关系。

4. **审阅 AI 生成的内容。** 当 AI 为你编写笔记时，请检查其准确性。AI 能很好地捕捉结构，但可能会遗漏细微之处。

5. **使用一致的标题。** 笔记标题是知识图谱中的标识符。`API Design Decisions` 和 `Api Design decisions` 是不同的实体。选择一种命名约定并始终坚持使用。

6. **关联相关概念。** 知识图谱的价值会随着连接的增加而复合增长。没有任何关系的笔记如同一座孤岛——虽有用，但不如相互连接的笔记强大。

7. **让图谱自然生长。** 不要试图预先设计出完美的分类体系。在工作过程中编写笔记，随着连接逐渐显现而添加关系，并定期使用 `/reflect` 或 `/defrag` 进行整合。