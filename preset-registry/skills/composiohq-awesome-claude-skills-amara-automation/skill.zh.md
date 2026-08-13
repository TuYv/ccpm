---
name: amara-automation
description: "Automate Amara tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 进行 Amara 自动化

通过 Rube MCP 使用 Composio 的 Amara 工具包实现 Amara 操作自动化。

**Toolkit docs**: [composio.dev/toolkits/amara](https://composio.dev/toolkits/amara)

## 先决条件

- 必须连接 Rube MCP（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `amara` 建立活跃的 Amara 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schemas

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP server。无需 API keys，只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并指定工具包 `amara`
3. 若连接未处于 ACTIVE，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Amara operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用的工具 slugs、输入 schema、推荐执行计划和已知坑点。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Amara task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["amara"]
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

- **始终先搜索**：工具 schemas 会变化。未调用 `RUBE_SEARCH_TOOLS` 前，不要硬编码工具 slugs 或参数
- **检查连接**：执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 合规**：使用搜索结果中的精确字段名和类型
- **Memory 参数**：始终在 `RUBE_MULTI_EXECUTE_TOOL` 调用中包含 `memory`，即使为空（`{}`）
- **会话复用**：在一个工作流内复用 session ID；对新工作流生成新 ID
- **分页**：检查响应中的分页令牌并持续抓取直到完成

## 速查参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | `RUBE_SEARCH_TOOLS` 搭配 Amara 特定的 use case |
| 连接 | `RUBE_MANAGE_CONNECTIONS` 搭配工具包 `amara` |
| 执行 | `RUBE_MULTI_EXECUTE_TOOL` 搭配已发现的 tool slugs |
| 批量操作 | `RUBE_REMOTE_WORKBENCH` 搭配 `run_composio_tool()` |
| 全量 schema | 使用带有 `schemaRef` 的 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供支持*
