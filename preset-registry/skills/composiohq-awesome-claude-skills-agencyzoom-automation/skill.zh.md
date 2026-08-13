---
name: agencyzoom-automation
description: "Automate Agencyzoom tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 Agencyzoom 自动化

通过 Rube MCP 使用 Composio 的 Agencyzoom 工具包自动化 Agencyzoom 操作。

**工具包文档**: [composio.dev/toolkits/agencyzoom](https://composio.dev/toolkits/agencyzoom)

## 前置条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `agencyzoom` 建立有效的 Agencyzoom 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**: 在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key，只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `agencyzoom` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按照返回的授权链接完成设置
4. 在运行任何工作流之前确认连接状态为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Agencyzoom operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用工具 slug、输入架构、推荐执行计划和已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Agencyzoom task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["agencyzoom"]
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

## 已知注意事项

- **始终先搜索**：工具架构会变化。未调用 `RUBE_SEARCH_TOOLS` 前，切勿硬编码工具 slug 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构合规**：使用搜索结果中的字段名称和类型，必须完全一致
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流内复用 session ID，新的工作流应生成新的 session
- **分页处理**：检查响应中的分页令牌并持续获取，直到完整返回

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | `RUBE_SEARCH_TOOLS` 配合 Agencyzoom 特定 use case |
| 连接 | 使用工具包 `agencyzoom` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整架构 | 对具有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
