---
name: adobe-automation
description: "Automate Adobe tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Adobe 自动化

通过 Rube MCP 使用 Composio 的 Adobe 工具包自动化 Adobe 操作。

**工具包文档**：[composio.dev/toolkits/adobe](https://composio.dev/toolkits/adobe)

## 先决条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 且工具包为 `adobe` 建立 Active Adobe 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP server。无需 API keys——只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `adobe` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接未 ACTIVE，请按返回的认证链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Adobe operations", known_fields: ""}]
session: {generate_id: true}
```

该操作返回可用工具 slug、输入 schema、推荐执行方案以及已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Adobe task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["adobe"]
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

## 常见陷阱

- **始终先搜索**：工具 schema 会变化。未调用 `RUBE_SEARCH_TOOLS` 前，不要硬编码工具 slug 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用搜索结果中的精确字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空 (`{}`)
- **会话复用**：在同一工作流中复用 session ID；为新工作流生成新 ID
- **分页**：检查响应中的分页 token，并持续抓取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Adobe 专用用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `adobe` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的 tool slugs 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 配合 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
