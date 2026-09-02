---
name: memory-metadata-search
description: "Structured metadata search for Basic Memory: query notes by custom frontmatter fields using equality, range, array, and nested filters. Use when finding notes by status, priority, confidence, or any custom YAML field rather than free-text content."
---
# 元数据搜索

通过笔记的结构化 frontmatter 字段来查找笔记，而不是（或同时结合）自由文本内容。frontmatter 中除标准集合（`title`、`type`、`tags`、`permalink`、`schema`）之外的任何自定义 YAML 键，都会自动作为 `entity_metadata` 建立索引，并可被查询。

## 何时使用

- **按状态或优先级过滤** — 查找所有 `status: draft` 或 `priority: high` 的笔记
- **查询自定义字段** — 你发明的任何 frontmatter 键都可搜索
- **范围查询** — 查找 `confidence > 0.7` 或 `score between 0.3 and 0.8` 的笔记
- **组合文本 + 元数据** — 用结构化约束缩小文本搜索范围
- **基于标签的过滤** — 查找带有特定 frontmatter 标签的笔记
- **Schema 感知查询** — 通过点号表示法筛选嵌套的 schema 字段

## 工具

所有元数据搜索都使用 `search_notes`。通过 `metadata_filters` 传递过滤条件，或使用 `tags` 和 `status` 便捷快捷方式。省略 `query`（或传入 `None`）即可进行仅过滤搜索。

## 过滤语法

过滤条件是一个 JSON 字典。每个键都针对一个 frontmatter 字段；其值指定匹配条件。多个键通过 **AND** 逻辑组合。

### 等于

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

数值使用数字比较；字符串使用字典序比较。

### `$between`（闭区间）

```json
{"score": {"$between": [0.3, 0.8]}}
```

### 空值（字段缺失或显式为 null）

```json
{"owner": null}
```

匹配没有 `owner` 键的笔记，以及 `owner` 明确设为 null 的笔记。  
null 仅能作为普通等值使用——在 `$in`、`$between`、数组包含列表或比较中会被拒绝，因为这些是在与值进行比较，而与 null 的比较永远不成立。

### 嵌套访问（点号表示法）

```json
{"schema.version": "2"}
```

### 快速参考

| 运算符 | 语法 | 示例 |
|----------|--------|---------|
| 等于 | `{"field": "value"}` | `{"status": "active"}` |
| 为 null | `{"field": null}` | `{"owner": null}` |
| 数组包含 | `{"field": ["a", "b"]}` | `{"tags": ["security", "oauth"]}` |
| `$in` | `{"field": {"$in": [...]}}` | `{"priority": {"$in": ["high", "critical"]}}` |
| `$gt` / `$gte` | `{"field": {"$gt": N}}` | `{"confidence": {"$gt": 0.7}}` |
| `$lt` / `$lte` | `{"field": {"$lt": N}}` | `{"score": {"$lt": 0.5}}` |
| `$between` | `{"field": {"$between": [lo, hi]}}` | `{"score": {"$between": [0.3, 0.8]}}` |
| 嵌套 | `{"a.b": "value"}` | `{"schema.version": "2"}` |

**规则：**
- 键必须匹配 `[A-Za-z0-9_-]+`（点号用于分隔嵌套层级）
- 运算符字典必须且只能包含一个运算符
- `$in` 和数组包含要求非空列表
- `$between` 要求恰好是 `[min, max]`
- `null` 表示 is-null 匹配，并且只能作为普通等值使用
- 比较和 `$between` 的边界必须是有限数字——一个浮点数无法表示的数量级（例如 400 位整数，JSON 会将其保留为普通 `int`）会被拒绝，而不是与无穷大边界进行比较
- 元数据过滤仅匹配 Markdown 笔记——已索引的 PDF、图片和其他常规文件没有 frontmatter，因此永远不会命中，即使是 `null` 也不行

> **警告：** 运算符必须包含 `$` 前缀——要写 `$gte`，不要写 `gte`。没有前缀时，过滤器会被当作精确匹配键处理，并且会静默返回空结果。正确：`{"confidence": {"$gte": 0.7}}`。错误：`{"confidence": {"gte": 0.7}}`。

## 使用 `search_notes` 进行元数据搜索

向 `search_notes` 传入 `metadata_filters`、`tags` 或 `status`。只做过滤搜索时可以省略 `query`，也可以把文本和过滤条件组合起来使用。

```python
# 仅过滤——查找具有特定状态的所有笔记
search_notes(metadata_filters={"status": "in-progress"})

# 仅过滤——在特定项目中查找高优先级规范
search_notes(
    metadata_filters={"type": "spec", "priority": {"$in": ["high", "critical"]}},
    project="research",
    page_size=10,
)

# 仅过滤——查找置信度高于阈值的笔记
search_notes(metadata_filters={"confidence": {"$gt": 0.7}})

# tags 和 status 的便捷快捷方式
search_notes(status="active")
search_notes(tags=["security", "oauth"])

# 受元数据限制的文本搜索
search_notes("authentication", metadata_filters={"status": "draft"})

# 混合文本、标签快捷方式和高级过滤器
search_notes(
    "oauth flow",
    tags=["security"],
    metadata_filters={"confidence": {"$gt": 0.7}},
)
```

**合并规则：** `tags` 和 `status` 是通过 `setdefault` 合并进 `metadata_filters` 的便捷快捷方式。如果 `metadata_filters` 中已存在同名键，则显式过滤条件优先生效。

## 标签搜索简写

查询中的 `tag:` 前缀会自动转换为标签过滤器：

```python
# 下面两种写法等价：
search_notes("tag:tier1")
search_notes("", tags=["tier1"])

# 多个标签（逗号或空格分隔）——必须全部匹配：
search_notes("tag:tier1,alpha")
```

## 示例：实际使用自定义 Frontmatter

一个带有自定义字段的笔记：

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

能够找到它的查询：

```python
# 按状态和类型
search_notes(metadata_filters={"status": "in-progress", "type": "spec"})

# 按数值阈值
search_notes(metadata_filters={"confidence": {"$gt": 0.7}})

# 按优先级集合
search_notes(metadata_filters={"priority": {"$in": ["high", "critical"]}})

# 按标签简写
search_notes("tag:security")

# 组合文本 + 元数据
search_notes("OAuth", metadata_filters={"status": "in-progress"})
```

## 指南

- **对结构化查询使用元数据搜索。** 如果你要按已知字段值（status、priority、type）查找笔记，元数据过滤比文本搜索更精确。
- **对内容查询使用文本搜索。** 如果你在找“关于”某个主题的笔记，文本搜索更合适。需要精确时可以两者结合。
- **自定义字段是免费的。** 你放进 frontmatter 的任何 YAML 键都可以被查询——不需要 schema 或配置。
- **多个过滤条件是 AND 关系。** `{"status": "active", "priority": "high"}` 要求两个条件都成立。
- **省略 `query` 可进行仅过滤搜索。** `search_notes(metadata_filters={"status": "active"})` 不需要文本查询也能工作。
- **嵌套结构使用点号表示法。** 通过点号访问嵌套 YAML 结构：`{"schema.version": "2"}` 会查询 `schema` 对象中的 `version` 键。
- **标签快捷方式很方便，但有局限。** `tags` 和 `status` 只是常见字段的语法糖。其他情况请直接使用 `metadata_filters`。