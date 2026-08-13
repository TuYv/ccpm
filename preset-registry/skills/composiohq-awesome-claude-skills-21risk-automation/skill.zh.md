---
name: -21risk-automation
description: "Automate 21risk tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 21risk 自动化

通过 Rube MCP 使用 Composio 的 21risk 工具包自动化 21risk 操作。

**工具包文档**: [composio.dev/toolkits/_21risk](https://composio.dev/toolkits/_21risk)

## 前置条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `_21risk` 建立激活状态的 21risk 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加端点即可。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `_21risk` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "21risk operations", known_fields: ""}]
session: {generate_id: true}
```

此操作会返回可用工具 slug、输入模式、推荐执行方案，以及已知问题。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific 21risk task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["_21risk"]
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

## 已知问题

- **始终先搜索**：工具模式会变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前，请先确认 `RUBE_MANAGE_CONNECTIONS` 显示为 ACTIVE 状态
- **模式一致性**：使用与搜索结果完全一致的字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传入 (`{}`)
- **会话复用**：在同一工作流中复用会话 ID；为新的工作流生成新的会话 ID
- **分页处理**：检查响应中的分页令牌并持续拉取直到完整

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用特定于 21risk 的用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `_21risk` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整模式 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
