---
name: agent-mail-automation
description: "Automate Agent Mail tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 Agent Mail 自动化

通过 Composio 的 Agent Mail 工具包借助 Rube MCP 自动化 Agent Mail 操作。

**工具包文档**：[composio.dev/toolkits/agent_mail](https://composio.dev/toolkits/agent_mail)

## 前置条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `agent_mail` 建立有效的 Agent Mail 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中添加 `https://rube.app/mcp` 作为 MCP 服务器。无需 API key，只需添加该端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 响应来验证 Rube MCP 是否可用
2. 使用工具包 `agent_mail` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按返回的授权链接完成配置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Agent Mail operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入 schema、推荐执行计划和已知坑点。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Agent Mail task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["agent_mail"]
session_id: "your_session_id"
```

### 步骤 3：执行工具

```
RUBE_MULTI_EXECUTE_TOOL
tools: [{
  tool_slug: "TOOL_SLUG_FROM_SEARCH",
  arguments: {/* schema-compliant args from search results */}
}]
memory: {}
session_id: "your_session_id"
```

## 已知坑点

- **始终先搜索**：工具 schema 可能变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用搜索结果中的字段名和类型，必须完全一致
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传入（`{}`）
- **会话复用**：在同一工作流内复用 session ID；新建工作流则生成新的 ID
- **分页处理**：检查响应中的分页 token，并持续拉取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用针对 Agent Mail 的用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `agent_mail` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的 tool slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 配合 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
