---
name: alpha-vantage-automation
description: "Automate Alpha Vantage tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Alpha Vantage 自动化

通过 Composio 的 Alpha Vantage 工具包在 Rube MCP 中自动化 Alpha Vantage 操作。

**工具包文档**: [composio.dev/toolkits/alpha_vantage](https://composio.dev/toolkits/alpha_vantage)

## 先决条件

- 必须已连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `alpha_vantage` 建立并激活 Alpha Vantage 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具架构

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——仅需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 使用工具包 `alpha_vantage` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接非 ACTIVE，请按照返回的授权链接完成设置
4. 在执行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Alpha Vantage operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具标识符、输入架构、推荐执行计划以及已知注意事项。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Alpha Vantage task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["alpha_vantage"]
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

## 常见注意事项

- **始终先搜索**：工具架构会发生变化。未经 `RUBE_SEARCH_TOOLS` 调用，不得硬编码工具标识符或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构合规**：使用搜索结果中给出的精确字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流中复用会话 ID；为新工作流生成新 ID
- **分页**：检查返回结果中的分页令牌并持续获取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用特定 Alpha Vantage 用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `alpha_vantage` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具标识符调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 配合 `run_composio_tool()` |
| 完整架构 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
