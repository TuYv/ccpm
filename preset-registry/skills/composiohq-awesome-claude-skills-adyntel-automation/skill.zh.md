---
name: adyntel-automation
description: "Automate Adyntel tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Adyntel 自动化

通过 Composio 的 Adyntel 工具包借助 Rube MCP 自动化 Adyntel 操作。

**工具包文档**：[composio.dev/toolkits/adyntel](https://composio.dev/toolkits/adyntel)

## 前提条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `adyntel` 建立的 Adyntel 活跃连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP server。无需 API 密钥——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `adyntel` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未显示 ACTIVE，请按照返回的认证链接完成设置
4. 在运行任何工作流之前确认连接状态显示 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Adyntel operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具标识、输入模式、推荐执行计划和已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Adyntel task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["adyntel"]
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

- **始终先搜索**：工具模式会发生变化。未经调用 `RUBE_SEARCH_TOOLS` 不要硬编码工具标识或参数
- **检查连接**：在执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的精确字段名和类型
- **memory 参数**：始终在 `RUBE_MULTI_EXECUTE_TOOL` 调用中包含 `memory`，即使为空（`{}`）
- **复用会话**：在同一工作流内复用会话 ID。为新工作流生成新的会话 ID
- **分页**：检查响应中的分页标记，并持续拉取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Adyntel 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `adyntel` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具标识调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 搭配 `run_composio_tool()` |
| 完整模式 | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
