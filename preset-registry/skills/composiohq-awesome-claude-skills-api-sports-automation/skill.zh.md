---
name: api-sports-automation
description: "Automate API Sports tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 API Sports 自动化

通过 Composio 的 API Sports 工具包通过 Rube MCP 自动化 API Sports 操作。

**工具包文档**: [composio.dev/toolkits/api_sports](https://composio.dev/toolkits/api_sports)

## 先决条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `api_sports` 建立 API Sports 的活动连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key，只需添加该端点即可运行。

1. 通过确认 `RUBE_SEARCH_TOOLS` 响应来验证 Rube MCP 是否可用
2. 使用工具包 `api_sports` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未为 ACTIVE，请按照返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "API Sports operations", known_fields: ""}]
session: {generate_id: true}
```

该操作返回可用工具 slug、输入 schema、推荐执行方案和已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific API Sports task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["api_sports"]
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

- **始终先搜索**：工具 schema 会变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用搜索结果中的字段名和类型（完全一致）
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传 `{}`  
- **会话复用**：在同一工作流内复用 session ID。为新的工作流生成新的 session
- **分页**：检查响应中的分页令牌，并持续获取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用特定于 API Sports 的 use case 调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `api_sports` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 和 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 查询带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
