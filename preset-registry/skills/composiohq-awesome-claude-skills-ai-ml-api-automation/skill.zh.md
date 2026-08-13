---
name: ai-ml-api-automation
description: "Automate AI ML API tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 AI ML API 自动化

通过 Rube MCP 使用 Composio 的 AI ML API 工具包自动化 AI ML API 操作。

**工具包文档**: [composio.dev/toolkits/ai_ml_api](https://composio.dev/toolkits/ai_ml_api)

## 前提条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `ai_ml_api` 建立有效的 AI ML API 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API keys，只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `ai_ml_api`
3. 如果连接未处于 ACTIVE 状态，请打开返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "AI ML API operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用工具的 slug、输入模式、推荐执行计划和已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific AI ML API task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["ai_ml_api"]
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

## 已知陷阱

- **始终先搜索**：工具模式会变化。未调用 `RUBE_SEARCH_TOOLS` 前，不要硬编码工具 slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中完全一致的字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **复用会话**：在同一工作流中复用会话 ID；新工作流请生成新 ID
- **分页处理**：检查响应中的分页令牌并持续获取，直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 AI ML API 专用用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `ai_ml_api` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现工具 slug 的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `run_composio_tool()` 的 `RUBE_REMOTE_WORKBENCH` |
| 完整模式 | 对于带有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供*
