---
name: memory-lifecycle
description: "Manage entity status transitions in Basic Memory: archive completed work, move notes between status folders, update frontmatter, and handle edge cases. Use when marking items complete, archiving old entities, or managing any folder-based status workflow."
---
# 记忆生命周期

管理实体如何在 Basic Memory 中的各个状态阶段之间流转。核心原则：**归档，绝不删除。** 已完成的工作是宝贵的上下文——将其移出活跃视图，但保留在知识图谱中。

## 何时使用

- 用户表示某件事“已完成”“已结束”“已提交”“已错过”或“已取消”
- 在状态文件夹之间移动实体（活跃 → 归档、待处理 → 活跃等）
- 撤销误标的完成状态
- 定期清理长期未更新的活跃项目

## 核心原则：归档，绝不删除

删除笔记会将其从知识图谱中移除——其所有观察记录、关系和历史都会消失。归档则会保留所有内容，同时表明该实体已不再活跃。

```
# Good — entity stays in the knowledge graph
move_note → active/ to archive/

# Bad — knowledge is lost
delete_note
```

唯一的例外：因误操作创建的笔记（拼写错误、真正的重复项）可以删除。

## 文件夹约定

使用文件夹按状态组织实体。确切的文件夹名称取决于你的领域，但应遵循一致的模式：

```
entities/
  active/          # Currently relevant, in-progress
  archive/         # Completed, no longer active, but worth keeping
  pipeline/        # Future items, not yet started
```

对于任务，具体结构如下：

```
tasks/
  active/          # Work in progress
  completed/       # Finished work
```

对于任何具有明确生命周期的实体类型：

```
[type]/
  active/          # Current
  [end-state]/     # Whatever "done" means for this type
```

选择符合你所在领域的文件夹名称。模式比具体名称更重要。

## 状态识别

当用户提及完成或状态变更时，提取其意图：

| 信号 | 状态 | 操作 |
|--------|--------|--------|
| “已结束”“已完成”“已做完”“已发布” | 完成 | 移动到归档/已完成文件夹 |
| “已提交”“已发送”“已交付” | 完成 | 移动到归档/已完成文件夹 |
| “已错过”“已过去”“已跳过”“已过期” | 错过 | 移动到归档或已错过文件夹 |
| “已取消”“已放弃”“已终止” | 取消 | 移动到归档文件夹 |
| “已暂停”“搁置中”“已推迟” | 暂停 | 更新前置元数据中的状态，保留在原位置 |
| “正在重启”“正在重新打开”“正在恢复” | 重新激活 | 移回活跃文件夹 |

## 工作流程

### 1. 查找实体

使用多种表述搜索 Basic Memory，以定位实体：

```python
search_notes(query="quarterly report")
search_notes(query="Q1 report")
```

如果返回多个匹配项，列出选项并询问用户具体指哪一个。

如果未找到匹配项，请用户澄清——不要猜测。

### 2. 移动文件

使用 `move_note` 将实体迁移到相应的状态文件夹：

```python
move_note(
  identifier="tasks/active/quarterly-report",
  destination_path="tasks/completed/quarterly-report.md"
)
```

永久链接保持不变，因此所有现有的 `[[wiki-links]]` 和 `memory://` URL 都能继续正常解析。

### 3. 更新前置元数据

移动后，更新前置元数据中的状态，使其保持一致：

```python
edit_note(
  identifier="quarterly-report",
  operation="find_replace",
  find_text="status: active",
  content="status: completed"
)
```

如果存在完成日期字段，请设置该字段：

```python
edit_note(
  identifier="quarterly-report",
  operation="find_replace",
  find_text="completed:",
  content="completed: 2026-02-22"
)
```

### 4. 确认

简洁地报告所做的操作：

```
Marked complete: Quarterly Report
  Moved to: tasks/completed/quarterly-report.md
  Status: completed
```

## 边缘情况

### 已归档

如果实体已经位于归档/已完成文件夹中，请通知用户：

> “Quarterly Report 已经位于 tasks/completed/ 中。需要我更新其中的任何内容吗？”

### 部分完成

有时实体仅完成了一部分。不要移动它，而应更新实体中的观察记录或状态说明，以反映部分完成的进度。

### 恢复 / 重新激活

如果某项内容被错误归档，请将其移回：

```python
move_note(
  identifier="tasks/completed/quarterly-report",
  destination_path="tasks/active/quarterly-report.md"
)

edit_note(
  identifier="quarterly-report",
  operation="find_replace",
  find_text="status: completed",
  content="status: active"
)
```

### 仅更改状态而不移动

某些状态更改不需要移动文件夹——“已暂停”或“受阻”的项目通常会保留在 `active/` 中，只更新前置元数据。仅在终止状态或重大状态转换时移动文件夹。

## 与其他 Skill 的关系

- **memory-tasks**：任务是一种特定的生命周期用例。本 Skill 涵盖通用模式；memory-tasks 涵盖任务特有的字段（steps、current_step、context）。
- **memory-notes**：在转换实体状态之前，使用搜索后再创建原则（来自 memory-notes）查找该实体。
- **memory-defrag**：定期进行碎片整理可以识别应归档的陈旧活动项目。

## 准则

- **只归档，绝不删除。** 知识图谱能够从历史上下文中获益。
- **先移动，再更新前置元数据。** 即使编辑步骤失败，此顺序也能确保文件位于正确的位置。
- **永久链接在移动后仍然有效。** 执行 `move_note` 后，指向实体的链接仍可正常工作。
- **确认信息应简洁。** 用户了解自己的系统——只需报告发生了哪些更改。
- **存在歧义时应询问。** 如果有多个匹配实体或目标文件夹不明确，请询问，而不要猜测。
- **可以执行批量操作。** 如果用户说“归档所有已完成的任务”，请找出所有此类任务，确认列表，然后依次移动。