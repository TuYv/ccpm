---
name: ctx-stats
description: |
  Show how much context window context-mode saved this session.
  Displays token consumption, context savings ratio, and per-tool breakdown.
  Read-only — shows stats only, no reset capability.
  To wipe the knowledge base entirely, use ctx_purge instead.
  Trigger: /context-mode:ctx-stats
user-invocable: true
---
# Context Mode 统计信息

显示当前会话节省的上下文。

## 操作说明

1. 调用 `mcp__context-mode__ctx_stats` MCP 工具（无需参数）。
2. **关键要求**：你必须将工具的完整输出直接复制粘贴为 Markdown 文本并放入响应消息中。不要总结、不要折叠、不要改写。用户必须无需按 ctrl+o 即可看到完整表格。逐行原样复制工具返回的所有内容。
3. 在完整输出后，添加一句话突出显示关键的节省指标，例如：
   - “context-mode 节省了 **12.4x**——92% 的数据保留在沙箱中。”
   - 如果尚无数据：“此会话中尚未调用 context-mode。”

## 清除

- **`ctx_purge(confirm: true)`**——永久删除知识库中所有已索引的内容。使用 `/context-mode:ctx-purge` 执行此操作。