---
name: memory-schema
description: "Schema lifecycle management for Basic Memory: discover unschemaed notes, infer schemas, create and edit schema definitions, validate notes, and detect drift. Use when working with structured note types (Task, Person, Meeting, etc.) to maintain consistency across the knowledge graph."
---
# 记忆架构

使用 Basic Memory 的 Picoschema 系统管理结构化笔记类型。架构定义了某种笔记类型应包含哪些字段，从而使笔记保持统一、可查询且可验证。

## 使用时机

- **出现新的笔记类型** — 你注意到多篇笔记具有相同的结构（会议、人物、决策）
- **验证检查** — 确认现有笔记是否符合其架构
- **架构漂移** — 检测笔记使用了但架构未定义的字段（或反之）
- **架构演进** — 随着需求变化添加、删除或更改字段
- **按需使用** — 用户要求创建、检查或管理架构

## Picoschema 语法参考

架构使用 YAML frontmatter 中的 Picoschema 定义——这是一种用于描述笔记结构的紧凑表示法。

### 基本类型

```yaml
schema:
  name: string, person's full name
  age: integer, age in years
  score: number, floating-point rating
  active: boolean, whether currently active
```

支持的类型：`string`、`integer`、`number`、`boolean`。

### 可选字段

在字段名称后附加 `?`：

```yaml
schema:
  title: string, required field
  subtitle?: string, optional field
```

### 枚举

使用 `(enum)` 并提供允许值列表：

```yaml
schema:
  status(enum, current state): [active, blocked, done, abandoned]
```

可选枚举：

```yaml
schema:
  priority?(enum, task priority): [low, medium, high, critical]
```

### 数组

对列表字段使用 `(array)`：

```yaml
schema:
  tags(array): string, categorization labels
  steps?(array): string, ordered steps to complete
```

### 关系

直接引用其他实体类型：

```yaml
schema:
  parent_task?: Task, parent task if this is a subtask
  attendees?(array): Person, people who attended
```

关系会在知识图谱中创建边，将笔记相互关联。

### 验证设置

```yaml
settings:
  validation: warn    # warn (log issues) or strict (errors)
```

使用 `strict` 作为标准的强制执行模式。仅为兼容性而接受 `error` 作为别名。

### 完整示例

```yaml
---
title: Meeting
type: schema
entity: Meeting
version: 1
schema:
  topic: string, what was discussed
  date: string, when it happened (YYYY-MM-DD)
  attendees?(array): Person, who attended
  decisions?(array): string, decisions made
  action_items?(array): string, follow-up tasks
  status?(enum, meeting state): [scheduled, completed, cancelled]
settings:
  validation: warn
---
```

## 发现未定义架构的笔记

查找结构相同但没有架构的笔记集群：

1. **按类型搜索**：`search_notes(query="type:Meeting")` — 如果许多笔记具有相同的 `type`，但不存在 `schema/Meeting.md`，则可以考虑为其创建架构。

2. **推断架构**：使用 `schema_infer` 分析现有笔记并生成建议的架构：
   ```python
   schema_infer(noteType="Meeting")
   schema_infer(noteType="Meeting", threshold=0.5)  # fields in 50%+ of notes
   ```
   阈值（0.0–1.0）控制字段需要达到多高的常见程度才会被纳入。默认值通常即可；降低该值可捕获更少见的字段。

3. **审查建议** — 推断出的模式会显示字段名称、类型和出现频率。决定保留哪些字段、将哪些字段设为可选，以及删除哪些字段。

## 创建模式

将模式笔记写入 `schema/<EntityName>`：

```python
write_note(
  title="Meeting",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Meeting",
    "version": 1,
    "schema": {
      "topic": "string, what was discussed",
      "date": "string, when it happened",
      "attendees?(array)": "Person, who attended",
      "decisions?(array)": "string, decisions made"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Meeting

Schema for meeting notes.

## Observations
- [convention] Meeting notes live in memory/meetings/ or as daily entries
- [convention] Always include date and topic
- [convention] Action items should become tasks when complex"""
)
```

### 核心原则

- **模式笔记存放在 `schema/` 中** — 每种实体类型对应一篇笔记
- **`note_type="schema"`** 将其标记为模式定义
- 元数据中的 **`entity: Meeting`** 指定其适用的类型
- 元数据中的 **`version: 1`** — 进行破坏性变更时递增版本号
- 建议从 **`settings.validation: warn`** 开始 — 它会记录问题，但不会阻止写入

## 验证笔记

检查现有笔记与其模式的符合程度：

```python
# Validate all notes of a type
schema_validate(noteType="Meeting")

# Validate a single note
schema_validate(identifier="meetings/2026-02-10-standup")
```

**重要：** `schema_validate` 会检查笔记正文中是否存在作为**观察类别**的模式字段 — 例如，`status` 字段要求存在一条 `- [status] active` 形式的观察。仅存储在 frontmatter 元数据中的字段无法满足验证要求。要完全通过验证，请同时将模式字段作为 frontmatter 值（用于元数据搜索）和观察（用于模式验证）包含在内。

验证报告包括：
- **缺少必填字段** — 笔记缺少模式要求的字段（作为观察类别）
- **未知字段** — 笔记包含模式中未定义的字段
- **类型不匹配** — 字段值与预期类型不匹配
- **无效的枚举值** — 值不在允许的集合中

### 处理验证结果

- **`warn` 模式**：定期审查警告。修正明显错误的笔记；对于合理的新模式，在模式中添加可选字段。
- **`strict` 模式**：用于结构一致性非常重要的场景（例如，使用笔记的自动化流水线）。

## 检测漂移

随着时间推移，笔记会不断演变，而模式可能未能及时更新。使用 `schema_diff` 查找差异：

```python
schema_diff(noteType="Meeting")
```

差异报告包括：
- **笔记中存在但模式中没有的字段** — 可考虑将其添加到模式中（作为可选字段）
- **很少使用的模式字段** — 考虑将其设为可选或删除
- **类型不一致** — 同一字段在不同笔记中使用了不同类型

## 模式演进

当笔记结构发生变化时：

1. **运行差异检查**以查看当前状态：`schema_diff(noteType="Meeting")`
2. **通过 `edit_note` 更新模式笔记**：
   ```python
   edit_note(
     identifier="schema/Meeting",
     operation="find_replace",
     find_text="version: 1",
     content="version: 2",
     expected_replacements=1
   )
   ```
3. **添加、删除或修改字段**，操作位置为 `schema:` 块
4. **重新验证**以确认现有笔记仍能通过：`schema_validate(noteType="Meeting")`
5. **修正异常项** — 更新不符合新模式的笔记

### 演进指南

- **增量变更**（新增可选字段）是安全的——无需提升版本号
- **破坏性变更**（新增必填字段、删除字段、类型变更）应提升 `version`
- **优先使用可选字段而非必填字段**——大多数字段最初都应设为可选
- **不要过度约束**——模式应描述常见结构，而非强制采用僵化的模板
- **将模式作为文档**——即使验证设置为 `warn`，模式仍可作为动态文档，说明该类型的笔记应包含哪些内容

## 工作流摘要

```
1. Notice repeated note structure → infer schema (schema_infer)
2. Review + create schema note   → write to schema/ (write_note)
3. Validate existing notes       → check conformance (schema_validate)
4. Fix outliers                  → edit non-conforming notes (edit_note)
5. Periodically check drift      → detect divergence (schema_diff)
6. Evolve schema as needed       → update schema note (edit_note)
```