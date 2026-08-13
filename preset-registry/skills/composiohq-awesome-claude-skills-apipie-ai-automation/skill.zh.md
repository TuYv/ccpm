---
name: apipie-ai-automation
description: "Automate Apipie AI tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 Apipie AI 自动化

通过 Rube MCP 使用 Composio 的 Apipie AI 工具包来自动化 Apipie AI 操作。

**工具包文档**：[composio.dev/toolkits/apipie_ai](https://composio.dev/toolkits/apipie_ai)

## 前置条件

- 必须连接 Rube MCP（可用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `apipie_ai` 建立 Apipie AI 的活跃连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API keys，只需添加该端点即可运行。

1. 通过确认 `RUBE_SEARCH_TOOLS` 响应来验证 Rube MCP 可用
2. 使用工具包 `apipie_ai` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未显示为 ACTIVE，请访问返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Apipie AI operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具 slug、输入 schema、推荐执行计划和已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Apipie AI task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["apipie_ai"]
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

## 常见坑点

- **始终先搜索**：工具 schema 会变化。未调用 `RUBE_SEARCH_TOOLS` 前，切勿硬编码工具 slug 或参数
- **检查连接**：执行工具前，请确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用搜索结果中的字段名和类型（完全一致）
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传入（`{}`）
- **复用会话**：在工作流内复用 session ID；新工作流请生成新的 session ID
- **分页**：检查响应中的分页标记，并持续获取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Apipie AI 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `apipie_ai` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整 Schema | 对带有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
