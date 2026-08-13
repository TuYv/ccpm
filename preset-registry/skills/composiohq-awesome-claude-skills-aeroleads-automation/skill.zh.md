---
name: aeroleads-automation
description: "Automate Aeroleads tasks via Rube MCP (Composio). Always search tools first for current schemas."
requires:
  mcp: [rube]
---
# 通过 Rube MCP 实现 Aeroleads 自动化

通过 Rube MCP 使用 Composio 的 Aeroleads 工具包自动化 Aeroleads 操作。

**工具包文档**: [composio.dev/toolkits/aeroleads](https://composio.dev/toolkits/aeroleads)

## 前提条件

- Rube MCP 必须已连接（`RUBE_SEARCH_TOOLS` 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 使用工具包 `aeroleads` 建立有效的 Aeroleads 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取当前工具 schema

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API Key，只需添加该端点即可正常工作。

1. 通过确认 `RUBE_SEARCH_TOOLS` 有响应来验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并使用工具包 `aeroleads`
3. 若连接状态不是 ACTIVE，请按返回的授权链接完成设置
4. 在运行任何工作流前确认连接状态显示为 ACTIVE

## 工具发现

在执行工作流前始终先发现可用工具：

```  
RUBE_SEARCH_TOOLS
queries: [{use_case: "Aeroleads operations", known_fields: ""}]
session: {generate_id: true}
```

这将返回可用的工具标识符（slug）、输入 schema、推荐执行方案以及已知陷阱。

## 核心工作流模式

### 步骤 1：发现可用工具

```  
RUBE_SEARCH_TOOLS
queries: [{use_case: "your specific Aeroleads task"}]
session: {id: "existing_session_id"}
```

### 步骤 2：检查连接

```  
RUBE_MANAGE_CONNECTIONS
toolkits: ["aeroleads"]
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

- **始终先搜索**：工具 schema 会变化。未调用 `RUBE_SEARCH_TOOLS` 时，切勿硬编码工具 slug 或参数
- **检查连接**：在执行工具前确认 `RUBE_MANAGE_CONNECTIONS` 显示 ACTIVE 状态
- **Schema 合规**：使用搜索结果中的字段名和类型，需与其完全一致
- **memory 参数**：在 `RUBE_MULTI_EXECUTE_TOOL` 调用中始终包含 `memory`，即使为空也要写成 (`{}`)
- **会话复用**：在同一工作流内复用会话 ID。为新工作流生成新的会话 ID
- **分页**：检查响应中的分页令牌，并持续拉取直到获取完整结果

## 快速参考

| 操作 | 方法 |
|-----------|----------|
| 查找工具 | 使用 Aeroleads 特定用例的 `RUBE_SEARCH_TOOLS` |
| 连接 | 使用工具包 `aeroleads` 的 `RUBE_MANAGE_CONNECTIONS` |
| 执行 | 使用发现到的工具 slug 的 `RUBE_MULTI_EXECUTE_TOOL` |
| 批量操作 | 使用 `RUBE_REMOTE_WORKBENCH` 的 `run_composio_tool()` |
| 完整 schema | 对带有 `schemaRef` 的工具使用 `RUBE_GET_TOOL_SCHEMAS` |

---
*由 [Composio](https://composio.dev) 提供*
