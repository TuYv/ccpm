---
name: memory-metadata-search
description: "Structured metadata search for Basic Memory: query notes by custom frontmatter fields using equality, range, array, and nested filters. Use when finding notes by status, priority, confidence, or any custom YAML field rather than free-text content."
---
# 记忆元数据搜索

通过笔记的结构化 frontmatter 字段查找笔记，而不是（或不仅仅是）搜索自由文本内容。笔记 frontmatter 中除标准字段（`title`、`type`、`tags`、`permalink`、`schema`）之外的任何自定义 YAML 键都会自动索引为 `entity_metadata`，并可供查询。

## 使用场景

- **按状态或优先级筛选** — 查找所有包含 `status: draft` 或 `priority: high` 的笔记
- **查询自定义字段** — 你创建的任何 frontmatter 键都可以搜索
- **范围查询** — 查找 `confidence > 0.7` 或 `score between 0.3 and 0.8` 的笔记
- **组合文本与元数据** — 使用结构化约束缩小文本搜索范围
- **基于标签筛选** — 查找带有特定 frontmatter 标签的笔记
- **模式感知查询** — 使用点表示法按嵌套 schema 字段筛选

## 工具

所有元数据搜索都使用 `search_notes`。通过 `metadata_filters` 传递筛选条件，或者使用 `tags` 和 `status` 便捷参数。对于仅筛选的搜索，请省略 `query`（或传递 `None`）。

## 筛选语法

筛选条件是一个 JSON 字典。每个键对应一个 frontmatter 字段；值指定匹配条件。多个键使用 **AND** 逻辑组合。

### 相等

```json
{"status": "active"}
```

### 数组包含（列出的所有值都必须存在）

```json
{"tags": ["security", "oauth"]}
```

### `$in`（匹配列表中的任意值）

```json
{"priority": {"$in": ["high", "critical"]}}
```

### 比较（`$gt`、`$gte`、`$lt`、`$lte`）

```json
{"confidence": {"$gt": 0.7}}
```

数值使用数值比较；字符串使用字典序比较。

### `$between`（包含边界的范围）

```json
{"score": {"$between": [0.3, 0.8]}}
```

### 嵌套访问（点表示法）

```json
{"schema.version": "2"}
```

### 快速参考

| 运算符 | 语法 | 示例 |
|----------|--------|---------|
| 相等 | `{"field": "value"}` | `{"status": "active"}` |
| 数组包含 | `{"field": ["a", "b"]}` | `{"tags": ["security", "oauth"]}` |
| `$in` | `{"field": {"$in": [...]}}` | `{"priority": {"$in": ["high", "critical"]}}` |
| `$gt` / `$gte` | `{"field": {"$gt": N}}` | `{"confidence": {"$gt": 0.7}}` |
| `$lt` / `$lte` | `{"field": {"$lt": N}}` | `{"score": {"$lt": 0.5}}` |
| `$between` | `{"field": {"$between": [lo, hi]}}` | `{"score": {"$between": [0.3, 0.8]}}` |
| 嵌套 | `{"a.b": "value"}` | `{"schema.version": "2"}` |

**规则：**
- 键必须匹配 `[A-Za-z0-9_-]+`（点用于分隔嵌套层级）
- 运算符字典必须只包含一个运算符
- `$in` 和数组包含要求使用非空列表
- `$between` 必须恰好为 `[min, max]`

> **警告：** 运算符必须包含 `$` 前缀——应写作 `$gte`，而不是 `gte`。如果没有该前缀，筛选条件会被视为精确匹配键，并且会在不报错的情况下返回空结果。正确：`{"confidence": {"$gte": 0.7}}`。错误：`{"confidence": {"gte": 0.7}}`。

## 将 `search_notes` 与元数据结合使用

将 `metadata_filters`、`tags` 或 `status` 传递给 `search_notes`。对于仅筛选的搜索，请省略 `query`；也可以将文本和筛选条件组合使用。

```python
# Filter-only — find all notes with a given status
search_notes(metadata_filters={"status": "in-progress"})

# Filter-only — high-priority specs in a specific project
search_notes(
    metadata_filters={"type": "spec", "priority": {"$in": ["high", "critical"]}},
    project="research",
    page_size=10,
)

# Filter-only — notes with confidence above a threshold
search_notes(metadata_filters={"confidence": {"$gt": 0.7}})

# Convenience shortcuts for tags and status
search_notes(status="active")
search_notes(tags=["security", "oauth"])

# Text search narrowed by metadata
search_notes("authentication", metadata_filters={"status": "draft"})

# Mix text, tag shortcut, and advanced filter
search_notes(
    "oauth flow",
    tags=["security"],
    metadata_filters={"confidence": {"$gt": 0.7}},
)
```

**合并规则：**`tags` 和 `status` 是便捷的快捷参数，通过 `setdefault` 合并到 `metadata_filters` 中。如果 `metadata_filters` 中存在相同的键，则以显式过滤条件为准。

## 标签搜索简写

查询中的 `tag:` 前缀会自动转换为标签过滤条件：

```python
# These are equivalent:
search_notes("tag:tier1")
search_notes("", tags=["tier1"])

# Multiple tags (comma or space separated) — all must match:
search_notes("tag:tier1,alpha")
```

## 示例：自定义 Frontmatter 的实际应用

包含自定义字段的笔记：

```markdown
---
title: Auth Design
type: spec
tags: [security, oauth]
status: in-progress
priority: high
confidence: 0.85
---

# Auth Design

## Observations
- [decision] Use OAuth 2.1 with PKCE for all client types #security
- [requirement] Token refresh must be transparent to the user

## Relations
- implements [[Security Requirements]]
```

可找到该笔记的查询：

```python
# By status and type
search_notes(metadata_filters={"status": "in-progress", "type": "spec"})

# By numeric threshold
search_notes(metadata_filters={"confidence": {"$gt": 0.7}})

# By priority set
search_notes(metadata_filters={"priority": {"$in": ["high", "critical"]}})

# By tag shorthand
search_notes("tag:security")

# Combined text + metadata
search_notes("OAuth", metadata_filters={"status": "in-progress"})
```

## 指南

- **对结构化查询使用元数据搜索。** 如果要按已知字段值（状态、优先级、类型）查找笔记，元数据过滤条件比文本搜索更精确。
- **对内容查询使用文本搜索。** 如果要查找与某个主题*相关*的笔记，文本搜索更合适。需要提高精确度时，可以将两者结合使用。
- **可自由使用自定义字段。** 你放入 frontmatter 中的任何 YAML 键都可用于查询——无需定义 schema 或进行配置。
- **多个过滤条件采用 AND 关系。** `{"status": "active", "priority": "high"}` 要求同时满足这两个条件。
- **仅使用过滤条件搜索时可省略 `query`。** `search_notes(metadata_filters={"status": "active"})` 无需文本查询即可使用。
- **使用点号表示法访问嵌套结构。** 使用点号访问嵌套的 YAML 结构：`{"schema.version": "2"}` 查询 `schema` 对象内的 `version` 键。
- **标签快捷参数很方便，但功能有限。** `tags` 和 `status` 是常用字段的语法糖。对于其他任何字段，请直接使用 `metadata_filters`。