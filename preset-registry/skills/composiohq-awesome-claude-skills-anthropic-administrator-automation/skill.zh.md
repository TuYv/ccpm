---
name: anthropic_administrator-automation
description: "Automate Anthropic Admin tasks via Rube MCP (Composio): API keys, usage, workspaces, and organization management. Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Anthropic Admin 自动化

通过 Composio 的 Anthropic Admin 工具包借助 Rube MCP 自动化 Anthropic Admin 操作。

**工具包文档**: [composio.dev/toolkits/anthropic_administrator](https://composio.dev/toolkits/anthropic_administrator)

## 前提条件

- 必须连接 Rube MCP（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `anthropic_administrator` 建立活跃的 Anthropic Admin 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 获取当前工具 schema

## 设置

**获取 Rube MCP**：在你的客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API key——只需添加端点即可生效。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 使用工具包 `anthropic_administrator` 调用 `RUBE_MANAGE_CONNECTIONS`
3. 如果连接未处于 ACTIVE，按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

````
RUBE_SEARCH_TOOLS: queries=[{"use_case": "API keys, usage, workspaces, and organization management", "known_fields": ""}]
````

返回内容包括：
- Anthropic Admin 的可用工具 slug
- 推荐的执行计划步骤
- 已知坑点和边界情况
- 每个工具的输入 schema

## 核心工作流

### 1. 发现可用的 Anthropic Admin 工具

```
RUBE_SEARCH_TOOLS:
  queries:
    - use_case: "list all available Anthropic Admin tools and capabilities"
```

在继续前先检查返回的工具、其描述和输入 schema。

### 2. 执行 Anthropic Admin 操作

发现工具后，通过以下方式执行：

````
RUBE_MULTI_EXECUTE_TOOL:
  tools:
    - tool_slug: "<discovered_tool_slug>"
      arguments: {<schema-compliant arguments>}
  memory: {}
  sync_response_to_workbench: false
````

### 3. 多步骤工作流

对于涉及多个 Anthropic Admin 操作的复杂流程：

1. 搜索所有相关工具：使用特定用例调用 `RUBE_SEARCH_TOOLS`
2. 先执行前置步骤（例如先查询再更新）
3. 使用工具响应在步骤之间传递数据
4. 对批量操作或数据处理使用 `RUBE_REMOTE_WORKBENCH`

## 常见模式

### 先搜索后执行
在创建新资源前，始终先搜索现有资源以避免重复。

### 分页
许多列表操作支持分页。检查响应中的 `next_cursor` 或 `page_token`，并持续获取直到取完。

### 错误处理
- 在继续前检查工具响应是否存在错误
- 若某个工具失败，请确认连接仍为 ACTIVE
- 若连接已过期，请通过 `RUBE_MANAGE_CONNECTIONS` 重新认证

### 批量操作
对于大规模操作，请使用 `RUBE_REMOTE_WORKBENCH`，并在 `ThreadPoolExecutor` 循环中调用 `run_composio_tool()` 以并行执行。

## 已知坑点

- **始终先搜索工具**：工具 schema 和可用操作可能会变化。不要在未先通过 `RUBE_SEARCH_TOOLS` 发现的情况下硬编码工具 slug。
- **检查连接状态**：执行任何工具前请确保 Anthropic Admin 连接为 ACTIVE。OAuth 令牌过期时需要重新认证。
- **遵守速率限制**：如果收到速率限制错误，请降低请求频率并实现退避策略。
- **校验 schema**：始终传入严格符合 schema 的参数。若返回 `schemaRef` 而非 `input_schema`，请使用 `RUBE_GET_TOOL_SCHEMAS` 加载完整输入 schema。

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Anthropic Admin 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `anthropic_administrator` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用已发现的工具 slug 调用 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 与 `run_composio_tool()` |
| 完整 schema | 对返回 `schemaRef` 的工具调用 `RUBE_GET_TOOL_SCHEMAS` |

> **工具包文档**: [composio.dev/toolkits/anthropic_administrator](https://composio.dev/toolkits/anthropic_administrator)
