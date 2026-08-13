---
name: affinity-automation
description: "Automate Affinity tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Affinity 自动化

通过 Rube MCP 使用 Composio 的 Affinity 工具包自动化 Affinity 操作。

**工具包文档**: [composio.dev/toolkits/affinity](https://composio.dev/toolkits/affinity)

## 前置条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 使用 `RUBE_MANAGE_CONNECTIONS` 并指定工具包 `affinity` 建立激活的 Affinity 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中添加 `https://rube.app/mcp` 为 MCP 服务器。无需 API Key——只需添加该端点即可运行。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `affinity`
3. 如果连接未处于 `ACTIVE` 状态，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 `ACTIVE`

## 工具发现

在执行工作流之前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Affinity operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入 schema、推荐执行计划和已知坑点。

## 核心工作流模式

### 第一步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Affinity task"}]
session: {id: "existing_session_id"}
```

### 第二步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["affinity"]
session_id: "your_session_id"
```

### 第三步：执行工具

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

- **始终先搜索**：工具 schema 会变化。未调用 `RUBE_SEARCH_TOOLS` 前，勿硬编码工具 slug 或参数
- **检查连接**：执行工具前，请确认 `RUBE_MANAGE_CONNECTIONS` 显示为 `ACTIVE` 状态
- **Schema 合规性**：使用来自搜索结果的准确字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流中复用会话 ID。为新工作流生成新的会话
- **分页**：检查响应中的分页 token，并持续获取直到完成

## 快速参考

| 操作 | 方式 |
|-----------|----------|
| 查找工具 | 使用 Affinity 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `affinity` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
