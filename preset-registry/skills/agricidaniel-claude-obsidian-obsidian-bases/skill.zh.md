---
name: obsidian-bases
description: "Create and edit Obsidian Bases (.base files): Obsidian's native database layer for dynamic tables, card views, list views, filters, formulas, and summaries over vault notes. Triggers on: create a base, add a base file, obsidian bases, base view, filter notes, formula, database view, dynamic table, task tracker base, reading list base."
allowed-tools: Read Write
---
# obsidian-bases：Obsidian 的数据库层

Obsidian Bases（于 2025 年推出）可将仓库中的笔记转换为可查询的动态视图，包括表格、卡片、列表和地图。它们在 `.base` 文件中定义。无需安装插件；这是 Obsidian 的核心功能。

**基础依赖优先级（v1.7+）**：此技能是一个自包含的备用方案。**优先使用 `kepano/obsidian-skills`** 作为权威基础依赖——其中的 `obsidian-bases` 技能是 Bases YAML、公式和视图定义的规范参考。如果你看到一个不带 `claude-obsidian:` 命名空间的 `obsidian-bases` 技能，那就是 kepano 的版本：请使用该版本。下方参考内容旨在确保未安装 kepano 市场时插件仍可正常运行。安装：`claude plugin marketplace add kepano/obsidian-skills`。官方 Bases 文档：https://help.obsidian.md/bases/syntax

---

## 文件格式

`.base` 文件包含有效的 YAML。根键包括 `filters`、`formulas`、`properties`、`summaries` 和 `views`。

```yaml
# Global filters: apply to ALL views
filters:
  and:
    - file.hasTag("wiki")
    - 'status != "archived"'

# Computed properties
formulas:
  age_days: '(now() - file.ctime).days.round(0)'
  status_icon: 'if(status == "mature", "✅", "🔄")'

# Display name overrides for properties panel
properties:
  status:
    displayName: "Status"
  formula.age_days:
    displayName: "Age (days)"

# One or more views
views:
  - type: table
    name: "All Pages"
    order:
      - file.name
      - type
      - status
      - updated
      - formula.age_days
```

---

## 筛选器

筛选器用于选择要显示的笔记。可以全局应用，也可以按视图应用。

```yaml
# Single string filter
filters: 'status == "current"'

# AND: all must be true
filters:
  and:
    - 'status != "archived"'
    - file.hasTag("wiki")

# OR: any can be true
filters:
  or:
    - file.hasTag("concept")
    - file.hasTag("entity")

# NOT: exclude matches
filters:
  not:
    - file.inFolder("wiki/meta")

# Nested
filters:
  and:
    - file.inFolder("wiki/")
    - or:
        - 'type == "concept"'
        - 'type == "entity"'
```

### 筛选运算符

`==` `!=` `>` `<` `>=` `<=`

### 常用筛选函数

| 函数 | 示例 |
|----------|---------|
| `file.hasTag("x")` | 带有标签 `x` 的笔记 |
| `file.inFolder("path/")` | 文件夹中的笔记 |
| `file.hasLink("Note")` | 链接到 Note 的笔记 |

---

## 属性

三种类型：
- **笔记属性**：来自 frontmatter：`status`、`type`、`updated`
- **文件属性**：元数据：`file.name`、`file.mtime`、`file.size`、`file.ctime`、`file.tags`、`file.folder`
- **公式属性**：计算得出：`formula.age_days`

---

## 公式

在 `formulas:` 中定义。在 `order:` 和 `properties:` 中以 `formula.name` 的形式引用。

```yaml
formulas:
  # Days since created
  age_days: '(now() - file.ctime).days.round(0)'

  # Days until a date property
  days_until: 'if(due_date, (date(due_date) - today()).days, "")'

  # Conditional label
  status_icon: 'if(status == "mature", "✅", if(status == "developing", "🔄", "🌱"))'

  # Word count estimate
  word_est: '(file.size / 5).round(0)'
```

**关键规则**：两个日期相减会返回一个 `Duration`，而不是数字。必须始终先访问 `.days`：
```yaml
# CORRECT
age: '(now() - file.ctime).days'

# WRONG: crashes
age: '(now() - file.ctime).round(0)'
```

**始终使用 `if()` 防护可为空的属性**：
```yaml
# CORRECT
days_left: 'if(due_date, (date(due_date) - today()).days, "")'
```

---

## 视图类型

### 表格
```yaml
views:
  - type: table
    name: "Wiki Index"
    limit: 100
    order:
      - file.name
      - type
      - status
      - updated
    groupBy:
      property: type
      direction: ASC
```

### 卡片
```yaml
views:
  - type: cards
    name: "Gallery"
    order:
      - file.name
      - tags
      - status
```

### 列表
```yaml
views:
  - type: list
    name: "Quick List"
    order:
      - file.name
      - status
```

---

## Wiki 仓库模板

### Wiki 内容仪表盘（所有非元数据页面）

```yaml
filters:
  and:
    - file.inFolder("wiki/")
    - not:
        - file.inFolder("wiki/meta")

formulas:
  age: '(now() - file.ctime).days.round(0)'

properties:
  formula.age:
    displayName: "Age (days)"

views:
  - type: table
    name: "All Wiki Pages"
    order:
      - file.name
      - type
      - status
      - updated
      - formula.age
    groupBy:
      property: type
      direction: ASC
```

### 实体索引（人员、组织、代码仓库）

```yaml
filters:
  and:
    - file.inFolder("wiki/entities/")
    - 'file.ext == "md"'

views:
  - type: table
    name: "Entities"
    order:
      - file.name
      - entity_type
      - status
      - updated
    groupBy:
      property: entity_type
      direction: ASC
```

### 最近导入

```yaml
filters:
  and:
    - file.inFolder("wiki/sources/")

views:
  - type: table
    name: "Sources"
    order:
      - file.name
      - source_type
      - created
      - status
    groupBy:
      property: source_type
      direction: ASC
```

---

## 嵌入笔记

```markdown
![[MyBase.base]]

![[MyBase.base#View Name]]
```

---

## 保存位置

将 `.base` 文件存储在 `wiki/meta/` 中，用作仓库仪表盘：
- `wiki/meta/dashboard.base`：主内容视图
- `wiki/meta/entities.base`：实体跟踪器
- `wiki/meta/sources.base`：导入日志

---

## YAML 引用规则

- 包含双引号的公式 → 用单引号包裹：`'if(done, "Yes", "No")'`
- 包含冒号或特殊字符的字符串 → 用双引号包裹：`"Status: Active"`
- 包含 `:` 的未加引号字符串会导致 YAML 解析失败

---

## 不应执行的操作

- 不要使用 `from:` 或 `where:`：它们是 Dataview 语法，而不是 Obsidian Bases 语法
- 不要在根层级使用 `sort:`：排序通过 `order:` 和 `groupBy:` 按视图设置
- 不要将 `.base` 文件放在仓库之外：它们只能在 Obsidian 内渲染
- 如果尚未在 `formulas:` 中定义 `X`，不要在 `order:` 中引用 `formula.X`

---

## 如何思考（10 原则映射）

使用此技能时，请应用 10 原则循环。有关规范框架，请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 用户正在编写的 `.base` YAML——在提出修改建议前，请仔细阅读。 |
| 2 | 观察（内部） | 我记录的是昨天的规范，还是今天的规范？Bases 在正式发布后发展迅速。 |
| 3 | 倾听 | 用户具体的 Bases 用例（仪表盘、过滤器链、计算属性）。 |
| 4 | 思考 | 应使用哪些过滤器运算符、公式语法和视图类型？根据当前规范进行验证。 |
| 5 | 连接（横向） | Bases 与 Dataview 查询有何关系？与属性呢？与 Canvas 覆盖层呢？梳理它们之间的差异。 |
| 6 | 连接（系统） | Obsidian Bases 已在 1.10 之后正式发布；当 kepano/obsidian-skills 存在时，应将其作为底层依据。 |
| 7 | 感受 | 示例必须能够实际解析和渲染。伪语法只会浪费用户的时间。 |
| 8 | 接受 | Bases 规范会不断演进；本文档中的某些功能可能已经发生变化。确保版本说明保持最新。 |
| 9 | 创造 | 提供能够在用户实际使用的 Obsidian 版本中渲染的架构文档和完整示例。 |
| 10 | 成长 | 随着 Bases 功能发布，更新参考资料。跟踪上游版本发布。 |