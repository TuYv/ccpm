---
name: api-labz-automation
description: "Automate API Labz tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 使用 API Labz 自动化

通过 Composio 的 API Labz 工具包使用 Rube MCP 自动化 API Labz 操作。

**工具包文档**：[composio.dev/toolkits/api_labz](https://composio.dev/toolkits/api_labz)

## 先决条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `api_labz` 激活 API Labz 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 安装配置

**获取 Rube MCP**：在你的客户端配置中添加 `https://rube.app/mcp` 作为 MCP 服务器。无需 API 密钥——只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `api_labz` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 若连接未处于 ACTIVE 状态，请按返回的授权链接完成设置
4. 在执行任何工作流前，确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

````
RUBE_SEARCH_TOOLS
queries: [{use_case: "API Labz operations", known_fields: ""}]
session: {generate_id: true}
````

这会返回可用的工具标识符、输入架构、推荐执行计划以及已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

````
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific API Labz task"}]
session: {id: "existing_session_id"}
````

### 第 2 步：检查连接

````
RUBE_MANAGE_CONNECTIONS
toolkits: ["api_labz"]
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

## 常见陷阱

- **始终先搜索**：工具架构会变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具标识符或参数
- **检查连接**：执行工具前请确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **架构一致性**：使用搜索结果中的完全一致字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流中复用会话 ID；为新工作流生成新的会话 ID
- **分页处理**：检查响应中的分页令牌并持续获取，直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 API Labz 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `api_labz` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现工具标识符的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用带 `run_composio_tool()` 的 `RUBE_REMOTE_WORKBENCH` |
| 全量架构 | 对有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
