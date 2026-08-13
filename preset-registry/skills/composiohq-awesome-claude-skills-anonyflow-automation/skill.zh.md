---
name: anonyflow-automation
description: "Automate Anonyflow tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 Anonyflow 自动化

通过 Composio 的 Anonyflow 工具包在 Rube MCP 中自动化 Anonyflow 操作。

**工具包文档**: [composio.dev/toolkits/anonyflow](https://composio.dev/toolkits/anonyflow)

## 前提条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `anonyflow` 建立有效的 Anonyflow 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 安装

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key——只需添加该端点即可运行。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS`，并使用工具包 `anonyflow`
3. 如果连接未处于 ACTIVE，按返回的授权链接完成设置
4. 在运行任何工作流前，确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Anonyflow operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入 schema、推荐执行计划和已知注意事项。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Anonyflow task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["anonyflow"]
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

## 已知陷阱

- **始终先搜索**：工具 schema 会变化。执行前不要不调用 `RUBE_SEARCH_TOOLS` 而硬编码 tool slug 或参数
- **检查连接**：在执行工具前，先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **遵循 schema**：使用来自搜索结果的完整字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传 `{}`
- **会话复用**：在一个工作流内复用同一 session ID。为新工作流生成新 ID
- **分页**：检查响应中的分页令牌，并持续获取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Anonyflow 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `anonyflow` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的 tool slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整 schema | 对含有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
