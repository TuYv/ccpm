---
name: affinda-automation
description: "Automate Affinda tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 Affinda 自动化

通过 Rube MCP 使用 Composio 的 Affinda 工具包自动化 Affinda 操作。

**工具文档**: [composio.dev/toolkits/affinda](https://composio.dev/toolkits/affinda)

## 前置条件

- 必须先连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `affinda` 建立有效的 Affinda 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key——只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 返回值，验证 Rube MCP 可用
2. 使用工具包 `affinda` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接未处于 ACTIVE 状态，请通过返回的授权链接完成设置
4. 运行任何工作流前，确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Affinda operations", known_fields: ""}]
session: {generate_id: true}
```

此调用会返回可用的工具 slug、输入模式、推荐执行方案及已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Affinda task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["affinda"]
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

- **始终先搜索**：工具模式会变化。不得在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的字段名和类型，需完全一致
- **memory 参数**：在调用 `RUBE_MULTI_EXECUTE_TOOL` 时始终包含 `memory`，即使为空也要传 `{}`。
- **会话复用**：在同一工作流内复用 session ID；为新工作流生成新的 session ID
- **分页处理**：检查返回结果中的分页标记，并持续获取直到完整返回

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Affinda 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `affinda` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 结合 `run_composio_tool()` |
| 完整模式 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*Powered by [Composio](https://composio.dev)*
