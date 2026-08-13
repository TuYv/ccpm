---
name: altoviz-automation
description: "Automate Altoviz tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Altoviz 自动化

通过 Rube MCP 使用 Composio 的 Altoviz 工具包自动化 Altoviz 操作。

**工具包文档**：[composio.dev/toolkits/altoviz](https://composio.dev/toolkits/altoviz)

## 前提条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 且工具包为 `altoviz` 建立 Altoviz 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加该端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `altoviz` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未为 ACTIVE，请按照返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前务必先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Altoviz operations", known_fields: ""}]
session: {generate_id: true}
```

该调用返回可用工具 slug、输入 schema、推荐执行计划以及已知陷阱。

## 核心工作流模式

### 第一步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Altoviz task"}]
session: {id: "existing_session_id"}
```

### 第二步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["altoviz"]
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

## 已知陷阱

- **始终先搜索**：工具 schema 会发生变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示为 ACTIVE 状态
- **Schema 合规性**：使用 search 结果中的精确字段名称和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流内复用 session ID；新工作流请生成新的 ID
- **分页**：检查响应中的分页令牌，并持续获取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用带有 Altoviz 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `altoviz` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用 `RUBE_MULTI_EXECUTE_TOOL` 与发现的工具 slug |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 查询带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
