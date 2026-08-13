---
name: ambient-weather-automation
description: "Automate Ambient Weather tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 Ambient Weather 自动化

通过 Rube MCP 使用 Composio 的 Ambient Weather 工具包自动化 Ambient Weather 操作。

**工具包文档**: [composio.dev/toolkits/ambient_weather](https://composio.dev/toolkits/ambient_weather)

## 前置要求

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用 `ambient_weather` 工具包建立可用的 Ambient Weather 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**：在客户端配置中添加 `https://rube.app/mcp` 作为 MCP 服务器。无需 API 密钥——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `ambient_weather` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接未处于 ACTIVE 状态，请按照返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Ambient Weather operations", known_fields: ""}]
session: {generate_id: true}
```

该操作会返回可用工具 slug、输入架构、推荐执行计划以及已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Ambient Weather task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["ambient_weather"]
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

- **始终先搜索**：工具架构会变化。未调用 `RUBE_SEARCH_TOOLS` 前，不要硬编码 tool slugs 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构一致性**：使用与搜索结果中的字段名和类型完全一致的值
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流中复用会话 ID；为新工作流生成新会话
- **分页**：检查响应中的分页 token 并持续拉取，直到完整获取

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Ambient Weather 相关 use case 的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `ambient_weather` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的 tool slugs 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整架构 | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供*
