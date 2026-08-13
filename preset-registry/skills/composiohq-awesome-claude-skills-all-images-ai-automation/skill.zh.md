---
name: all-images-ai-automation
description: "Automate All Images AI tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 All Images AI 自动化

通过 Rube MCP 使用 Composio 的 All Images AI 工具包自动化 All Images AI 的全部操作。

**工具包文档**: [composio.dev/toolkits/all_images_ai](https://composio.dev/toolkits/all_images_ai)

## 前置要求

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `all_images_ai` 建立有效的 All Images AI 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具 Schema

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `all_images_ai`
3. 如果连接未处于 ACTIVE 状态，请按照返回的授权链接完成设置
4. 在运行任何工作流前，确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "All Images AI operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具 slug、输入 Schema、推荐执行计划以及已知的注意事项。

## 核心工作流模式

### 第一步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific All Images AI task"}]
session: {id: "existing_session_id"}
```

### 第二步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["all_images_ai"]
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

- **始终先搜索**：工具 Schema 会发生变化。未调用 `RUBE_SEARCH_TOOLS` 前，切勿硬编码工具 slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示为 ACTIVE 状态
- **Schema 兼容性**：使用搜索结果中的精确字段名称和类型
- **Memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传入（`{}`）
- **会话复用**：在同一工作流内复用会话 ID；对新工作流生成新的会话 ID
- **分页**：检查响应中的分页令牌并持续拉取，直到完成

## 快速参考

| Operation | Approach |
|-----------|----------|
| 查找工具 | `RUBE_SEARCH_TOOLS` 搭配 All Images AI 特定的 use case |
| 连接 | `RUBE_MANAGE_CONNECTIONS` 搭配工具包 `all_images_ai` |
| 执行 | 使用已发现的 tool slugs 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 及 `run_composio_tool()` |
| 完整 Schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供*
