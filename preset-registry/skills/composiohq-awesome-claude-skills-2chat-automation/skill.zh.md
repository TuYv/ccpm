---
name: -2chat-automation
description: "Automate 2chat tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 2chat 自动化

通过 Rube MCP 使用 Composio 的 2chat 工具包自动化 2chat 操作。

**工具包文档**：[composio.dev/toolkits/_2chat](https://composio.dev/toolkits/_2chat)

## 前置条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `_2chat` 建立活跃的 2chat 连接
- 请始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥，只需添加端点即可。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `_2chat`
3. 如果连接未处于 ACTIVE 状态，请按照返回的授权链接完成设置
4. 在运行任何工作流之前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "2chat operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入模式、推荐执行计划和已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific 2chat task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["_2chat"]
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

- **务必先搜索**：工具模式会变化。未调用 `RUBE_SEARCH_TOOLS` 时，绝不要硬编码工具 slug 或参数
- **检查连接**：在执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的字段名和类型，必须完全一致
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在一个工作流内复用 session ID。新的工作流请生成新的 session ID
- **分页**：检查响应中的分页 token，并持续请求直到完成

## 快速参考

| 操作 | 方式 |
|-----------|----------|
| 查找工具 | 使用 2chat 相关用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `_2chat` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `run_composio_tool()` 的 `RUBE_REMOTE_WORKBENCH` |
| 完整模式 | 对带有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
