---
name: abyssale-automation
description: "Automate Abyssale tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 Abyssale 自动化

通过 Rube MCP 使用 Composio 的 Abyssale 工具包自动化 Abyssale 操作。

**工具包文档**：[composio.dev/toolkits/abyssale](https://composio.dev/toolkits/abyssale)

## 前置条件

- 必须连接 Rube MCP（可用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 与工具包 `abyssale` 建立活跃连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具架构

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key —— 只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 调用 `RUBE_MANAGE_CONNECTIONS`，工具包为 `abyssale`
3. 若连接未处于 ACTIVE 状态，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Abyssale operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slug、输入模式、推荐执行计划以及已知坑点。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Abyssale task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["abyssale"]
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

- **始终先搜索**：工具模式会变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式兼容**：使用搜索结果中的准确字段名和类型
- **memory 参数**：始终在 `RUBE_MULTI_EXECUTE_TOOL` 调用中包含 `memory`，即使为空 (`{}`)
- **会话复用**：在同一工作流内复用会话 ID；对新工作流生成新 ID
- **分页**：检查响应中的分页令牌并持续拉取直到完整返回

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Abyssale 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `abyssale` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现工具 slug 的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 和 `run_composio_tool()` |
| 完整模式 | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
