---
name: agility-cms-automation
description: "Automate Agility CMS tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Agility CMS 自动化

通过 Rube MCP 使用 Composio 的 Agility CMS 工具包自动化 Agility CMS 操作。

**工具包文档**: [composio.dev/toolkits/agility_cms](https://composio.dev/toolkits/agility_cms)

## 前置要求

- 必须连接 Rube MCP（可使用 `RUBE_SEARCH_TOOLS`）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `agility_cms` 建立已激活的 Agility CMS 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具模式

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API Key，只需添加端点即可使用。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `agility_cms`
3. 如果连接未处于 ACTIVE，请访问返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "Agility CMS operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具 slug、输入模式、推荐执行计划和已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Agility CMS task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```
RUBE_MANAGE_CONNECTIONS
toolkits: ["agility_cms"]
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

## 常见陷阱

- **始终先搜索**：工具模式会变化。不要在未调用 `RUBE_SEARCH_TOOLS` 的情况下硬编码工具 slug 或参数
- **检查连接**：在执行工具前先确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **模式一致性**：使用搜索结果中的字段名和类型（完全匹配）
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要传 `{}`
- **会话复用**：在一个工作流内复用会话 ID；为新工作流生成新会话
- **分页**：检查响应中的分页令牌并持续获取，直到完成

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用面向 Agility CMS 的用例调用 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `agility_cms` 调用 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 和 `run_composio_tool()` |
| 完整模式 | 使用 `RUBE_GET_TOOL_SCHEMAS` 获取带有 `schemaRef` 的工具 |

---
*由 [Composio](https://composio.dev) 提供支持*
