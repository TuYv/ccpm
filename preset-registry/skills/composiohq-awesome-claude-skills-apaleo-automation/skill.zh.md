---
name: apaleo-automation
description: "Automate Apaleo tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Apaleo 自动化

通过 Composio 的 Apaleo 工具包使用 Rube MCP 自动化 Apaleo 运营。

**工具包文档**: [composio.dev/toolkits/apaleo](https://composio.dev/toolkits/apaleo)

## 前置条件

- Rube MCP 必须已连接（可使用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `apaleo` 建立有效的 Apaleo 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥，只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 使用工具包 `apaleo` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接状态非 ACTIVE，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

执行工作流前请始终先发现可用工具：

````
RUBE_SEARCH_TOOLS
queries: [{use_case: "Apaleo operations", known_fields: ""}]
session: {generate_id: true}
````

此操作会返回可用工具 slug、输入 schema、推荐执行计划以及已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

````
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Apaleo task"}]
session: {id: "existing_session_id"}
````

### 第 2 步：检查连接

````
RUBE_MANAGE_CONNECTIONS
toolkits: ["apaleo"]
session_id: "your_session_id"
````

### 第 3 步：执行工具

````
RUBE_MULTI_EXECUTE_TOOL
tools: [{
  tool_slug: "TOOL_SLUG_FROM_SEARCH",
  arguments: {/* schema-compliant args from search results */}
}]
memory: {}
session_id: "your_session_id"
````

## 已知陷阱

- **始终先搜索**：工具 schema 可能变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前请先确认 `RUBE_MANAGE_CONNECTIONS` 显示状态为 ACTIVE
- **schema 一致性**：使用搜索结果中完全一致的字段名与类型
- **Memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传入 `{}`
- **会话复用**：在同一工作流内复用会话 ID。为新的工作流生成新的会话 ID
- **分页**：检查响应中的分页 token，并持续拉取直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Apaleo 专用用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `apaleo` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 搭配 `run_composio_tool()` |
| 完整 schema | 对含 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
