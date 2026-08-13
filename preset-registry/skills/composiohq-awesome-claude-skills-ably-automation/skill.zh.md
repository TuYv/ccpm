---
name: ably-automation
description: "Automate Ably tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Ably 自动化

通过 Composio 的 Ably 工具包借助 Rube MCP 自动化 Ably 操作。

**Toolkit 文档**: [composio.dev/toolkits/ably](https://composio.dev/toolkits/ably)

## 前置条件

- Rube MCP 必须已连接（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `ably` 建立可用的 Ably 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 配置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `ably`
3. 如果连接未显示 ACTIVE，请按照返回的授权链接完成设置
4. 在执行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Ably operations", known_fields: ""}]
session: {generate_id: true}
```

该调用会返回可用工具 slug、输入 schema、推荐执行计划和已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Ably task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["ably"]
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

## 已知陷阱

- **始终先搜索**：工具 schema 会变更。未经 `RUBE_SEARCH_TOOLS` 调用，不要硬编码工具 slug 或参数
- **检查连接**：执行工具前，请确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用来自搜索结果的精确字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空 (`{}`)
- **会话复用**：在同一工作流内复用 session ID。为新工作流生成新的 session
- **分页处理**：检查响应中的分页 token，并持续拉取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Ably 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `ably` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 调用 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
