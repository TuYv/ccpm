---
name: agenty-automation
description: "Automate Agenty tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 自动化 Agenty

通过 Rube MCP 使用 Composio 的 Agenty 工具包来自动化 Agenty 操作。

**工具包文档**：[composio.dev/toolkits/agenty](https://composio.dev/toolkits/agenty)

## 前置条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `agenty` 建立有效的 Agenty 连接
- 执行工作流前务必先调用 `RUBE_SEARCH_TOOLS` 获取当前工具架构

## 设置

**获取 Rube MCP**：在你的客户端配置中添加 `https://rube.app/mcp` 作为 MCP 服务器。无需 API key——只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `agenty` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE 状态，请按返回的授权链接完成设置
4. 在运行任何工作流之前，确认连接状态显示为 ACTIVE

## 工具发现

始终在执行工作流之前发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Agenty operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具 Slug、输入 Schema、推荐执行计划以及已知的坑点。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Agenty task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["agenty"]
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

## 已知坑点

- **始终先进行搜索**：工具 Schema 会变化。执行前不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 Slug 或参数
- **检查连接**：在执行工具前，确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 合规性**：使用来自搜索结果的字段名和类型的精确值
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在同一工作流内复用会话 ID，为新的工作流生成新的会话 ID
- **分页处理**：检查响应中的分页令牌，并持续获取直至完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Agenty 特定用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `agenty` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 Slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整架构 | 使用 `RUBE_GET_TOOL_SCHEMAS` 查询带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
