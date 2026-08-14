---
name: memory-tasks
description: "Task management via Basic Memory schemas: create, track, and resume structured tasks that survive context compaction. Uses BM's schema system for uniform notes queryable through the knowledge graph."
---
# 记忆任务

使用 Basic Memory 的 schema 系统管理进行中的工作。任务只是带有 `type: Task` 的笔记——它们存在于知识图谱中，根据 schema 进行验证，并且能在上下文压缩后保留下来。

## 使用时机

- **开始多步骤工作时**（3 个以上步骤，或任何可能持续到上下文窗口之外的工作）
- **压缩/重启后**——搜索活跃任务以继续处理
- **压缩前刷新**——使用当前状态更新所有活跃任务
- **按需使用**——用户要求创建、检查或管理任务

## 任务 Schema

任务使用 BM schema 系统（SPEC-SCHEMA）。schema 笔记位于 `memory/schema/Task.md`：

```yaml
---
title: Task
type: schema
entity: Task
version: 1
schema:
  description: string, what needs to be done
  status?(enum, current state): [active, blocked, done, abandoned]
  assigned_to?: string, who is working on this
  steps?(array): string, ordered steps to complete
  current_step?: integer, which step number we're on (1-indexed)
  context?: string, key context needed to resume after memory loss
  started?: string, when work began
  completed?: string, when work finished
  blockers?(array): string, what's preventing progress
  parent_task?: Task, parent task if this is a subtask
settings:
  validation: warn
---
```

## 创建任务

当工作符合条件时，创建一条任务笔记。使用 `write_note`，并设置 `note_type="Task"`，同时将可查询字段放入 `metadata`：

```python
write_note(
  title="Descriptive task name",
  directory="tasks",
  note_type="Task",
  metadata={
    "status": "active",
    "priority": "high",
    "current_step": 1,
    "steps": ["First step", "Second step", "Third step"]
  },
  tags=["task"],
  content="""# Descriptive task name

## Observations
- [description] What needs to be done, concisely
- [status] active
- [assigned_to] claude
- [current_step] 1

## Steps
1. [ ] First concrete step
2. [ ] Second concrete step
3. [ ] Third concrete step

## Context
What future-you needs to pick up this work. Include:
- Key file paths and repos involved
- Decisions already made and why
- What was tried and what worked/didn't
- Where to look for related context"""
)
```

**为什么 frontmatter 和 observations 两者都要使用？** `metadata` 中的字段（存储为 frontmatter）支持通过 `metadata_filters` 使用 `search_notes`。作为 observations 的字段（`- [status] active`）支持 `schema_validate`。为了实现完整覆盖，应在这两个位置都包含可查询字段。

### 核心原则

- **步骤应具体且可检查**——使用“在文件 Y 中实现 X”，而不是“研究一下相关内容”
- **上下文用于失忆后恢复工作**——编写时应假设接手者很聪明，但完全不了解你一直在做什么
- **关系用于链接其他实体**——`parent_task [[Other Task]]`、`related_to [[Some Note]]`
- **`note_types` 区分大小写**——`write_note(note_type="Task")` 会在 frontmatter 中将类型存储为小写的 `task`。在搜索查询中使用 `note_types=["task"]`（小写）。

## 压缩后恢复

在会话开始时或压缩后：

1. **搜索进行中的任务：**
   ```python
   search_notes(note_types=["task"], status="active")
   ```

2. **阅读任务笔记**以获取完整上下文

3. 使用 `context` 字段，**从 `current_step` 继续**

4. **随着进展及时更新** — 递增 `current_step`、更新上下文、勾选已完成的步骤

## 更新任务

随着工作推进，更新任务笔记：

```markdown
## Steps
1. [x] First step — done, resulted in X
2. [x] Second step — done, changed approach because Y
3. [ ] Third step — next up

## Context
Updated context reflecting current state...
```

同时更新 frontmatter：
```yaml
current_step: 3
```

## 完成任务

完成后：
```yaml
status: done
completed: YYYY-MM-DD
```

添加一段简要总结，说明已完成的工作以及所需的任何后续操作。

## 压缩前刷新

当即将发生压缩事件时：

1. 查找所有进行中的任务：`search_notes(note_types=["task"], status="active")`
2. 对每个任务进行以下更新：
   - 更新 `current_step` 以反映实际进度
   - 在 `context` 中记录恢复任务所需的一切信息
   - 更新步骤复选框以显示已完成的内容
3. 这一点**至关重要** — 未记录下来的上下文就会丢失

## 查询任务

借助 BM 的模式系统，可以对任务进行完整查询：

| 查询 | 查找内容 |
|-------|--------------|
| `search_notes(note_types=["task"])` | 所有任务 |
| `search_notes(note_types=["task"], status="active")` | 进行中的任务 |
| `search_notes(note_types=["task"], status="blocked")` | 被阻塞的任务 |
| `search_notes(note_types=["task"], metadata_filters={"assigned_to": "claude"})` | 我的任务 |
| `search_notes("blockers", note_types=["task"])` | 存在阻塞因素的任务 |
| `schema_validate(noteType="Task")` | 根据模式验证所有任务 |
| `schema_diff(noteType="Task")` | 检测模式与实际任务笔记之间的偏差 |

## 指南

- **每个工作单元对应一个任务** — 不要把多个项目塞进一个任务
- **尽早外部化** — 如果你想到“我应该记住这个”，立即把它写下来
- **上下文 > 步骤** — 步骤告诉你要做什么；上下文告诉你为什么做以及如何做
- **关闭已完成的任务** — 不要让已完成的工作继续保持为 `active`
- **链接相关任务** — 使用 `parent_task [[X]]` 或关系来连接相关工作
- **模式验证是你的好帮手** — 定期运行 `schema_validate(noteType="Task")`，以发现不完整的任务