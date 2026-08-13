---
name: acculynx-automation
description: "Automate Acculynx tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Acculynx 自动化

通过 Rube MCP 使用 Composio 的 Acculynx 工具包自动化 Acculynx 操作。

**工具包文档**: [composio.dev/toolkits/acculynx](https://composio.dev/toolkits/acculynx)

## 先决条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `acculynx` 建立激活状态的 Acculynx 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并设置工具包为 `acculynx`
3. 如果连接未处于 ACTIVE，请按返回的身份验证链接完成设置
4. 在运行任何工作流之前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流之前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Acculynx operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入模式、推荐执行计划以及已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Acculynx task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["acculynx"]
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

- **始终先搜索**：工具模式会变化。未调用 `RUBE_SEARCH_TOOLS` 时，切勿硬编码工具 slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的精确字段名和类型
- **Memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流中复用会话 ID；为新工作流生成新的会话 ID
- **分页**：检查响应中的分页令牌并持续获取，直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Acculynx 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `acculynx` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `run_composio_tool()` 的 `RUBE_REMOTE_WORKBENCH` |
| 完整模式 | 使用带有 `schemaRef` 的工具的 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
