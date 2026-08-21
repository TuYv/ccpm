---
name: ctx-index
description: |
  Index a local file or directory into context-mode's persistent FTS5 knowledge base
  so future ctx_search calls can retrieve focused snippets without rereading raw files.
  Trigger: /context-mode:ctx-index
user-invocable: true
---
# Context Mode 索引

为本地项目内容创建索引，以供后续搜索。

## 说明

1. 当 `ctx_index` MCP 工具可用时，优先使用该工具。
2. 仅当用户未提供路径且当前项目根目录不明确时，才询问路径。
3. 使用 `path`，而非大量内联 `content`，以避免文件字节进入对话。
4. 对仓库建立索引时，使用保守的限制值和清晰的来源标签：

```javascript
ctx_index({
  path: ".",
  source: "project:<name>",
  maxDepth: 5,
  maxFiles: 200
})
```

5. 如果 MCP 工具不可用，则回退到 CLI：

```bash
context-mode index . --source project:<name>
```

6. 报告已建立索引的来源标签、文件数或章节数，以及对应的搜索命令：

```javascript
ctx_search({ source: "project:<name>", queries: ["..."] })
```

## 安全

- 不要为依赖项目录、构建输出、机密信息或生成的产物建立索引。
- 对于项目中特有的干扰路径，优先使用 `--exclude` 或 `exclude`。
- 对于大型仓库，在将 `maxFiles` 提高到 500 以上之前，先询问用户。