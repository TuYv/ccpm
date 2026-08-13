---
name: ambee-automation
description: "Automate Ambee tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Ambee 自动化

通过 Composio 的 Ambee 工具包，通过 Rube MCP 自动化 Ambee 操作。

**Toolkit 文档**： [composio.dev/toolkits/ambee](https://composio.dev/toolkits/ambee)

## 前提条件

- 必须连接 Rube MCP（可用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `ambee` 建立有效的 Ambee 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具模式

## 配置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API Key——只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用性  
2. 使用工具包 `ambee` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE，请按照返回的授权链接完成设置
4. 在运行任何工作流之前确认连接状态为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Ambee operations", known_fields: ""}]
session: {generate_id: true}
```

此操作会返回可用工具 slug、输入模式、建议执行计划以及已知注意事项。

## 核心工作流模式

### 第一步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Ambee task"}]
session: {id: "existing_session_id"}
```

### 第二步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["ambee"]
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

- **始终先搜索**：工具模式会变化。调用 `RUBE_SEARCH_TOOLS` 前，不要硬编码工具 slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的精确字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也是 `{}`  
- **会话复用**：在同一工作流内复用会话 ID；每个新工作流生成新会话
- **分页**：检查响应中的分页标记并持续抓取至完整返回

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Ambee 专用用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `ambee` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 和 `run_composio_tool()` |
| 全量模式 | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
