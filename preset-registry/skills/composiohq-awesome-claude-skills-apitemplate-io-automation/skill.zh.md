---
name: apitemplate-io-automation
description: "Automate Apitemplate IO tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Apitemplate IO 自动化

通过 Composio 的 Apitemplate IO 工具包利用 Rube MCP 自动化 Apitemplate IO 操作。

**工具包文档**: [composio.dev/toolkits/apitemplate_io](https://composio.dev/toolkits/apitemplate_io)

## 先决条件

- Rube MCP 必须已连接（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `apitemplate_io` 建立有效的 Apitemplate IO 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具模式

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `apitemplate_io` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE，请按照返回的授权链接完成设置
4. 在运行任何工作流之前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Apitemplate IO operations", known_fields: ""}]
session: {generate_id: true}
```

该调用会返回可用工具的 slug、输入模式、推荐执行方案以及已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Apitemplate IO task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["apitemplate_io"]
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

- **始终先搜索**：工具模式会变化。未调用 `RUBE_SEARCH_TOOLS` 不要硬编码工具 slug 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的精确字段名和类型
- **memory 参数**：始终在 `RUBE_MULTI_EXECUTE_TOOL` 调用中包含 `memory`，即使为空也要传入（`{}`）
- **会话复用**：在同一工作流内复用会话 ID。对新工作流生成新的会话 ID
- **分页处理**：检查响应中的分页令牌，并持续抓取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Apitemplate IO 特定的 use case 调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `apitemplate_io` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `run_composio_tool()` 的 `RUBE_REMOTE_WORKBENCH` |
| 完整模式 | 对具有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
