---
name: agiled-automation
description: "Automate Agiled tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Agiled 自动化

通过 Composio 的 Agiled 工具包使用 Rube MCP 自动化 Agiled 操作。

**工具包文档**: [composio.dev/toolkits/agiled](https://composio.dev/toolkits/agiled)

## 前置条件

- 必须连接 Rube MCP（可用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `agiled` 建立有效的 Agiled 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API Key —— 只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `agiled`
3. 如果连接未显示为 ACTIVE，请打开返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Agiled operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用工具标识符、输入架构、推荐执行计划以及已知坑点。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Agiled task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["agiled"]
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

- **始终先搜索**：工具架构会变化。切勿在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具标识符或参数
- **检查连接**：执行工具前请确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构兼容**：使用与搜索结果中字段名和类型完全一致的内容
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传 `{}`
- **会话复用**：在同一工作流中复用会话 ID；对新工作流生成新的会话 ID
- **分页**：检查响应中的分页标记并持续获取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Agiled 专用用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `agiled` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具标识符调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 的 `run_composio_tool()` |
| 完整架构 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供*
