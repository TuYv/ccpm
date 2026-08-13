---
name: aivoov-automation
description: "Automate Aivoov tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Aivoov 自动化

通过 Composio 的 Aivoov 工具包通过 Rube MCP 自动化 Aivoov 操作。

**工具包文档**：[composio.dev/toolkits/aivoov](https://composio.dev/toolkits/aivoov)

## 前置条件

- 必须先连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `aivoov` 建立有效的 Aivoov 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 配置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API Key，只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 使用工具包 `aivoov` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按返回的认证链接完成设置
4. 在执行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Aivoov operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用工具的 slug、输入架构、推荐执行计划和已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Aivoov task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["aivoov"]
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

## 常见陷阱

- **始终先搜索**：工具架构会发生变化。无需调用 `RUBE_SEARCH_TOOLS`，不要硬编码工具 slug 或参数
- **检查连接**：在执行工具前请确认 `RUBE_MANAGE_CONNECTIONS` 显示为 ACTIVE 状态
- **架构一致性**：使用搜索结果中的字段名和类型完全一致
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要包含（`{}`）
- **会话复用**：在同一工作流内复用会话 ID，为新工作流生成新的会话 ID
- **分页处理**：检查响应中的分页令牌并持续获取，直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Aivoov 专用用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `aivoov` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整架构 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供*
