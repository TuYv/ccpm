---
name: algolia-automation
description: "Automate Algolia tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 的 Algolia 自动化

通过 Rube MCP 使用 Composio 的 Algolia 工具包自动化 Algolia 操作。

**工具包文档**: [composio.dev/toolkits/algolia](https://composio.dev/toolkits/algolia)

## 前提条件

- Rube MCP 必须已连接（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 建立可用的 Algolia 连接，工具包为 `algolia`
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具 schemas

## 设置

**获取 Rube MCP**：将 `https://rube.app/mcp` 作为 MCP server 添加到你的客户端配置中。无需 API 密钥，只需添加该端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 是否可用
2. 使用工具包 `algolia` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接状态不是 ACTIVE，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Algolia operations", known_fields: ""}]
session: {generate_id: true}
```

这会返回可用工具 slugs、输入 schema、推荐执行方案和已知注意事项。

## 核心工作流模式

### 第 1 步：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Algolia task"}]
session: {id: "existing_session_id"}
```

### 第 2 步：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["algolia"]
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

## 已知注意事项

- **始终先搜索**：工具 schema 会变化。未调用 `RUBE_SEARCH_TOOLS` 时，不要硬编码工具 slugs 或参数。
- **检查连接**：执行工具前请确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 一致性**：使用搜索结果中完全一致的字段名和类型
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空（`{}`）
- **会话复用**：在单个工作流内复用会话 ID。新建工作流请生成新 ID
- **分页**：检查响应中的分页令牌并持续获取，直到完整返回

## 快速参考

| Operation | Approach |
|-----------|----------|
| 查找工具 | 用 Algolia 专用 use case 调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `algolia` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的 tool slugs 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 和 `run_composio_tool()` |
| 完整 schema | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
