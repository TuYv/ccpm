---
name: alttext-ai-automation
description: "Automate Alttext AI tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 使用 Alttext AI 自动化

通过 Composio 的 Alttext AI 工具包，使用 Rube MCP 自动化 Alttext AI 操作。

**工具包文档**: [composio.dev/toolkits/alttext_ai](https://composio.dev/toolkits/alttext_ai)

## 前提条件

- Rube MCP 必须已连接（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `alttext_ai` 完成 Alttext AI 的连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**：在你的客户端配置中，将 `https://rube.app/mcp` 作为 MCP 服务器添加。无需 API 密钥——只需添加端点即可正常运行。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `alttext_ai` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按照返回的认证链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前，始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Alttext AI operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具 slug、输入架构、建议执行计划和已知注意事项。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Alttext AI task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["alttext_ai"]
session_id: "your_session_id"
```

### 第 3 步：执行工具

```
RUBE_MULTI_EXECUTE_TOOL
tools: [{
  tool_slug: "TOOL_SLUG_FROM_SEARCH",
  arguments: {/* schema-compliant args from search results */}
}]
memory: {}
session_id: "your_session_id"
```

## 已知陷阱

- **始终先搜索**：工具架构会发生变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构一致性**：使用与搜索结果中完全一致的字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传 `{}`
- **复用会话**：在同一工作流内复用会话 ID；为新工作流生成新 ID
- **分页处理**：检查响应中的分页 token，并继续获取直到完整

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Alttext AI 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `alttext_ai` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 调用 `run_composio_tool()` |
| 全量架构 | 对带有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
