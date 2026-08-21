---
name: ctx-search
description: |
  Search context-mode's persistent FTS5 knowledge base for previously indexed
  local project content, documentation, or session memory.
  Trigger: /context-mode:ctx-search
user-invocable: true
---
# 上下文模式搜索

搜索已索引的内容，无需将原始来源重新读入对话上下文。

## 说明

1. 当 `ctx_search` MCP 工具可用时，优先使用该工具。
2. 将所有相关问题批量放入一个 `queries` 数组中。
3. 当用户指定项目或已索引标签时，使用 `source` 限定范围。
4. 使用包含两到四个技术术语的简短、具体查询。

```javascript
ctx_search({
  source: "project:<name>",
  queries: ["authentication middleware", "token refresh"],
  limit: 5
})
```

5. 如果 MCP 工具不可用，则回退使用 CLI：

```bash
context-mode search "authentication middleware" --source project:<name> --limit 5
```

6. 如果索引为空，请告知用户先运行 `/context-mode:ctx-index` 或 `context-mode index <path>`。