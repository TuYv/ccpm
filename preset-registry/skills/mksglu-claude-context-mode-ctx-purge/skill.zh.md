---
name: ctx-purge
description: |
  Purge the context-mode knowledge base. Permanently deletes all indexed content
  and resets session stats. This is destructive and cannot be undone.
  Trigger: /context-mode:ctx-purge
user-invocable: true
---
# 上下文模式清除

永久删除此项目的会话数据。支持两种范围（issue #520）：

- **项目范围**（`scope: "project"`）：清除一切内容——知识库、所有会话的全部会话数据库行、事件 Markdown 文件以及统计信息。
- **会话范围**（`sessionId: "<id>"` 或 `scope: "session"`）：仅清除匹配会话的数据库行和 FTS5 分块。其他会话、项目统计信息和 FTS5 存储文件均会保留。

## 操作说明

1. **首先与用户确定清除范围**：
   - “只清除一个会话？”→ 询问 `sessionId`。
   - “清除整个项目？”→ 确认 scope:'project'（这是具有破坏性且不可逆的默认选项）。
2. **向用户警告 scope:'project' 的后果**。所有内容都将被删除：
   - FTS5 知识库（来自 `ctx_index`、`ctx_fetch_and_index`、`ctx_batch_execute` 的所有已索引内容）
   - 项目中所有会话的会话事件数据库（分析数据、元数据、恢复快照）
   - 会话事件 Markdown 文件
   - 内存中的会话统计信息和持久化统计文件
3. 使用所选参数调用 `mcp__context-mode__ctx_purge` MCP 工具：
   - 限定范围：`{ confirm: true, sessionId: "<id>" }`——隐含 scope:'session'。
   - 项目：`{ confirm: true, scope: "project" }`——显式的破坏性形式。
   - 仅使用 `{ confirm: true }` 仍然有效，但会发出弃用警告。应优先使用显式形式。
4. 向用户报告结果——响应会准确列出已删除的内容，并且（对于限定范围的清除）确认其他会话和项目统计信息均已保留。

## 模式规则

- 始终必须提供 `confirm: true`。
- 同时提供 `sessionId` 和 `scope: "project"` 会被拒绝，因为存在歧义（sessionId 隐含会话范围；将其与项目范围结合会造成意图冲突）。
- 使用 `scope: "session"` 而不提供 `sessionId` 会引发错误——sessionId 是必需的。

## 使用场景

- **限定范围（单个会话）**：临时验收场景、演练重放、隔离受污染的会话，同时避免丢失主要工作会话的统计信息。
- **项目**：知识库包含陈旧或错误的内容并污染搜索结果、在同一会话中切换互不相关的项目、需要彻底重新开始。

## 重要事项

- `ctx_purge` 是删除会话数据的**唯一**方式。不存在其他机制。
- `ctx_stats` 是只读的——仅显示统计信息。
- `/clear` 和 `/compact` 不会影响任何上下文模式数据。
- 此操作无法撤销。如果再次需要相关内容，请重新建立索引。