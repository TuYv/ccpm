---
name: apiflash-automation
description: "Automate Apiflash tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 Apiflash 自动化

通过 Rube MCP 使用 Composio 的 Apiflash 工具包自动化 Apiflash 操作。

**工具包文档**: [composio.dev/toolkits/apiflash](https://composio.dev/toolkits/apiflash)

## 前置条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `apiflash` 建立有效的 Apiflash 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API keys——只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `apiflash` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未显示为 ACTIVE，请按照返回的认证链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Apiflash operations", known_fields: ""}]
session: {generate_id: true}
```

该请求返回可用工具 slug、输入模式、推荐执行计划和已知陷阱。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Apiflash task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["apiflash"]
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

- **始终先搜索**：工具模式会变化。未调用 `RUBE_SEARCH_TOOLS` 绝不可硬编码工具 slug 或参数
- **检查连接**：在执行工具前请确认 `RUBE_MANAGE_CONNECTIONS` 显示为 ACTIVE 状态
- **模式合规**：使用搜索结果中的字段名称和类型，必须完全一致
- **memory 参数**：始终在 `RUBE_MULTI_EXECUTE_TOOL` 调用中包含 `memory`，即使为空也要传入（`{}`）
- **会话复用**：在工作流内复用会话 ID。对新工作流请生成新的会话 ID
- **分页**：检查响应中的分页标记并继续拉取，直到获取完整结果

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Apiflash 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `apiflash` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整模式 | 对带有 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
