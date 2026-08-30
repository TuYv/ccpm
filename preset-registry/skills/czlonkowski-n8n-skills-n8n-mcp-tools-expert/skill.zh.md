---
name: n8n-mcp-tools-expert
description: Expert guide for using n8n-mcp MCP tools effectively. Use when searching for nodes, validating configurations, accessing templates, managing workflows, organizing workflows into folders, managing credentials, auditing instance security, or using any n8n-mcp tool. Provides tool selection guidance, parameter formats, and common patterns. IMPORTANT — Always consult this skill before calling any n8n-mcp tool — it prevents common mistakes like wrong nodeType formats, incorrect parameter structures, and inefficient tool usage. If the user mentions n8n, workflows, nodes, or automation and you have n8n MCP tools available, use this skill first.
---
# n8n MCP 工具专家

使用 n8n-mcp MCP 服务器工具构建工作流的主指南。

---

## 工具类别

n8n-mcp 提供按以下类别组织的工具：

1. **节点发现** → [SEARCH_GUIDE.md](SEARCH_GUIDE.md)
2. **配置验证** → [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)
3. **工作流管理** → [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)
4. **模板库** - 搜索并部署 2,700+ 个真实工作流
5. **数据表** - 管理 n8n 数据表、行和列（`n8n_manage_datatable`）
6. **工作流文件夹** - 文件夹 CRUD + 工作流归置（`n8n_manage_folders`）
7. **凭据管理** - 完整的凭据 CRUD + 模式发现（`n8n_manage_credentials`）
8. **安全与审计** - 使用自定义深度扫描进行实例安全审计（`n8n_audit_instance`）
9. **文档与指南** - 工具文档、AI Agent 指南、Code 节点指南
10. **Agents** - 创建、配置、验证、运行和发布持久化的 n8n Agents（`n8n_manage_agents`，需要 `N8N_MCP_ACCESS_TOKEN`）
11. **节点资源解析** - 使用真实凭据解析实时下拉选项/资源定位器值（`n8n_explore_node_resources`，需要 `N8N_MCP_ACCESS_TOKEN`）
12. **实例目录** - 列出项目和标签（`n8n_list_catalog`）

---

## 快速参考

### 最常用的工具（按成功率排序）

| 工具 | 使用时机 | 速度 |
|------|----------|------|
| `search_nodes` | 按关键词查找节点 | <20ms |
| `get_node` | 了解节点操作（detail="standard"） | <10ms |
| `validate_node` | 检查配置（mode="full"） | <100ms |
| `n8n_create_workflow` | 创建工作流 | 100-500ms |
| `n8n_update_partial_workflow` | 编辑工作流（最常用！） | 50-200ms |
| `validate_workflow` | 检查完整工作流 | 100-500ms |
| `n8n_deploy_template` | 将模板部署到 n8n 实例 | 200-500ms |
| `n8n_manage_datatable` | 管理数据表和行 | 50-500ms |
| `n8n_manage_folders` | 文件夹 CRUD + 整理工作流 | 100-500ms |
| `n8n_manage_credentials` | 凭据 CRUD + 模式发现 | 50-500ms |
| `n8n_audit_instance` | 安全审计（内置扫描 + 自定义扫描） | 500-5000ms |
| `n8n_autofix_workflow` | 自动修复验证错误 | 200-1500ms |
| `n8n_manage_agents` | 持久化 n8n Agent 的 CRUD/验证/发布 | 150-400ms；`call` action：5-60s |
| `n8n_explore_node_resources` | 解析实时 loadOptions/listSearch 值 | 200 ms - 5 s |
| `n8n_list_catalog` | 列出项目或标签 | 50-300ms |

---

## 工具选择指南

### 查找合适的节点

**工作流**：
```
1. search_nodes({query: "keyword"})
2. get_node({nodeType: "nodes-base.name"})
3. [Optional] get_node({nodeType: "nodes-base.name", mode: "docs"})
```

**示例**：
```javascript
// Step 1: Search
search_nodes({query: "slack"})
// Returns: nodes-base.slack

// Step 2: Get details
get_node({nodeType: "nodes-base.slack"})
// Returns: operations, properties, examples (standard detail)

// Step 3: Get readable documentation
get_node({nodeType: "nodes-base.slack", mode: "docs"})
// Returns: markdown documentation
```

**常见模式**：搜索 → get_node（平均 18 秒）

### 验证配置

**工作流**：
```
1. validate_node({nodeType, config: {}, mode: "minimal"}) - Check required fields
2. validate_node({nodeType, config, profile: "runtime"}) - Full validation
3. [Repeat] Fix errors, validate again
```

**常见模式**：验证 → 修复 → 验证（每个周期平均思考 23 秒、修复 58 秒）

### 管理工作流

**工作流**：
```
1. n8n_create_workflow({name, nodes, connections})
2. n8n_validate_workflow({id})
3. n8n_update_partial_workflow({id, operations: [...]})
4. n8n_validate_workflow({id}) again
5. n8n_update_partial_workflow({id, operations: [{type: "activateWorkflow"}]})
```

**常见模式**：迭代更新（编辑之间平均间隔 56 秒）

### 关键：创建工作流时的节点 JSON 规范

生成的节点 JSON 中有三个结构性错误，即使工作流验证通过，也会破坏 n8n UI：

1. **绝不要生成带有占位符 ID 的 `credentials` 块。** 类似 `"id": "REPLACE_ME"` 的虚假 ID 会使凭据选择器永久禁用且无法点击，在 n8n UI 中显示为“尚无凭据”（"No credentials yet"）——用户必须从头重新创建节点。如果不知道真实的凭据 ID，**请完全省略 `credentials` 块**；缺少该块时会显示正常的空下拉菜单，用户可以点击它。首先使用 `n8n_manage_credentials({action: "list"})` 来发现真实的凭据 ID。

```javascript
// ❌ Breaks the credential selector
"credentials": {"httpHeaderAuth": {"id": "REPLACE_ME", "name": "My API Key"}}

// ✅ Unknown ID → omit credentials block; user picks in UI
// ✅ Known ID (from n8n_manage_credentials list) → use the real ID
```

2. **为节点 `id` 生成 UUID v4 值**——不要使用类似 `"http-list-node"` 的人类可读字符串。n8n 的前端使用节点 ID 进行表单绑定和凭据组件初始化；非 UUID 的 ID 会导致细微的 UI 故障。

3. **为每个节点使用当前的 `typeVersion`**——应检查 `get_node`，而不是硬编码记忆中的版本（例如 httpRequest 已经是 4.4+，而不是 4.2）。

---

## 关键：nodeType 格式

**针对不同工具有两种不同的格式**！

### 格式 1：搜索/验证工具
```javascript
// Use SHORT prefix
"nodes-base.slack"
"nodes-base.httpRequest"
"nodes-base.webhook"
"nodes-langchain.agent"
```

**使用此格式的工具**：
- search_nodes (returns this format)
- get_node
- validate_node
- validate_workflow

### 格式 2：工作流工具
```javascript
// Use FULL prefix
"n8n-nodes-base.slack"
"n8n-nodes-base.httpRequest"
"n8n-nodes-base.webhook"
"@n8n/n8n-nodes-langchain.agent"
```

**使用此格式的工具**：
- n8n_create_workflow
- n8n_update_partial_workflow

### 转换

```javascript
// search_nodes returns BOTH formats
{
  "nodeType": "nodes-base.slack",          // For search/validate tools
  "workflowNodeType": "n8n-nodes-base.slack"  // For workflow tools
}
```

---

## 常见错误

有八个反复出现的错误。其中两个值得完整展示，因为它们会在不易察觉的情况下破坏结构：

```javascript
// nodeType prefix (search/validate tools want the SHORT form)
get_node({nodeType: "slack"})              // ❌ missing prefix → "Node not found"
get_node({nodeType: "n8n-nodes-base.slack"}) // ❌ FULL prefix is for workflow tools
get_node({nodeType: "nodes-base.slack"})     // ✅

// credentials must be nested by type with {id, name} — not a flat string
updates: {credentials: "myApiKey"}                              // ❌
updates: {credentials: {httpHeaderAuth: {id: "abc123", name: "My API Key"}}}  // ✅
```

| # | 错误 | 修复 |
|---|---------|-----|
| 1 | nodeType 格式错误 | 搜索/验证使用简写 `nodes-base.*`；工作流工具使用完整格式 `n8n-nodes-base.*`（见上文） |
| 2 | 默认使用 `detail: "full"` | 默认的 `standard` 已覆盖 95% 的场景；应使用 `docs`/`search_properties`，而不是 `full` |
| 3 | 没有验证配置文件 | 显式传入 `profile: "runtime"`（其他阶段使用 `minimal`/`ai-friendly`/`strict`） |
| 4 | 忽略自动清理 | 任何节点的任何更新都会执行清理（包括操作符结构、IF/Switch 元数据）；它无法修复损坏的连接或分支数量不匹配问题 |
| 5 | 未使用智能参数 | 使用 `branch: "true"` / `case: 0`，而不是脆弱的 `sourceIndex` 计算 |
| 6 | 忽略 `intent` | 在 `n8n_update_partial_workflow` 中始终包含 `intent`，以获得更好的响应 |
| 7 | 使用 `parameters` 而不是 `updates` | `updateNode` 接受的是 `updates: {...}`，而不是 `parameters: {...}` |
| 8 | 凭证格式错误 | 按类型嵌套，并使用 `{id, name}`（见上文） |

每项的完整 WRONG/CORRECT 示例：请参阅 [VALIDATION_GUIDE.md → 常见错误](VALIDATION_GUIDE.md)。

---

## 工具使用模式

实际使用中主要有三种模式。每种模式的完整分步示例都位于参考指南中。

- **模式 1 — 节点发现**（步骤之间平均间隔 18 秒）：`search_nodes({query})` → `get_node({nodeType, includeExamples: true})`。请参阅 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)。
- **模式 2 — 验证循环**（思考 23 秒，修复 58 秒）：`validate_node({profile: "runtime"})` → 读取 `errors` → 修复配置 → 再次验证，直到通过。请参阅 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)。
- **模式 3 — 工作流编辑**（成功率 99.0%，编辑之间平均间隔 56 秒）：迭代调用 `n8n_update_partial_workflow`（带有 `intent`）→ `n8n_validate_workflow` → 最后调用 `activateWorkflow`。应采用迭代构建，而不是一次性完成。请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 详细指南

### 节点发现工具
请参阅 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)，了解：
- search_nodes
- 使用不同详细级别（minimal、standard、full）的 get_node
- get_node 模式（info、docs、search_properties、versions）

### 验证工具
请参阅 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)，了解：
- 验证配置文件详解
- 使用不同模式（minimal、full）的 validate_node
- validate_workflow 的完整结构
- 自动清理系统
- 处理验证错误

### 工作流管理
请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)，了解：
- n8n_create_workflow
- n8n_update_partial_workflow（21 种操作类型，包括 patchNodeField、setNodeGroups 和 moveToFolder！）
- 智能参数（branch、case）
- AI 连接类型（8 种）
- 工作流激活（activateWorkflow/deactivateWorkflow）
- n8n_deploy_template
- n8n_workflow_versions
- n8n_manage_folders（文件夹 CRUD + 工作流放置）
- n8n_manage_credentials（凭证 CRUD + 模式发现）
- n8n_audit_instance（安全审计）

### 模板、数据表与自助帮助
请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)，了解：
- search_templates / get_template / n8n_deploy_template 示例
- n8n_manage_datatable（完整操作、筛选条件、示例）
- tools_documentation、ai_agents_guide、n8n_health_check

---

## 模板使用

拥有 2,700 多个模板的模板库提供三个工具：`search_templates`（模式 `query`/`by_nodes`/`by_task`/`by_metadata`）、`get_template`（模式 `structure`/`full`）以及 `n8n_deploy_template`（将模板部署到你的实例，支持 `autoFix`/`autoUpgradeVersions`，并返回工作流 ID、所需凭据以及已应用的修复）。

完整的搜索/获取/部署示例请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 运行工作流

`n8n_test_workflow` 有一个必需参数（`workflowId`），以及一个用于选择路径的 `method`：

| `method` | 后端 | 功能 |
|---|---|---|
| `auto`（默认） | Public API | 检测 webhook/form/chat 触发器，并通过 HTTP 触发它——工作流必须处于**激活**状态。没有此类触发器时，它会报告工作流无法触发，并列出下面的方法。**`auto` 绝不会通过 n8n 的 MCP server 运行任何内容。** |
| `trigger` | Public API | 相同的 HTTP 路径，显式请求使用该路径。 |
| `prepare` | n8n 的 MCP server | 只读：列出需要固定数据的节点。 |
| `pinned` | n8n 的 MCP server | 使用 `pinData` 代替触发器、凭据节点和 HTTP Request 节点来运行工作流，并等待运行完成。其他所有节点仍会运行。以 `error`/`crashed`/`canceled` 结束的运行会以 `EXECUTION_FAILED` 返回，并附带 `executionId`。 |
| `direct` | n8n 的 MCP server | 启动运行并在其开始后立即返回；不会固定任何内容，因此每个节点都会运行。`message` 或 `data`/`headers` 会作为输入转发给触发器。 |

- 后三个方法需要 `N8N_MCP_ACCESS_TOKEN`（n8n 2.34+）以及工作流的 "Available in MCP" 设置。
- `pinData` 按节点**名称**作为键，每个值都是由 `{"json": {...}}` 包装的项目数组——`{"Webhook": [{"json": {"id": "123"}}]}`，绝不能是扁平对象。它不能为空。
- `triggerNodeName` 用于选择要从其开始的触发器节点（默认为检测到的节点；只要提供了输入，n8n 就要求必须指定它）。
- **两种运行方法都会真正执行工作流的节点。**`direct` 会运行每个节点；`pinned` 只固定触发器节点、包含凭据的节点和 HTTP Request 节点，因此 Code、Set、If 以及不需要凭据的 I/O（Execute Command、文件读写）仍会运行。在运行会向任何位置写入内容的工作流前，请先向用户确认。
- `executionMode` 适用于 `direct`：`manual`（默认）或 `production`。它改变的是执行上下文，而不是运行是否会产生副作用——生产运行会经过生产执行路径，并作为一次运行被记录。只有在用户要求时才传入它。
- `timeoutMs` 是官方调用的客户端截止时间（5000-600000；`prepare` 的默认值为 30000，`pinned`/`direct` 的默认值为 300000）。
- `direct` 会在运行开始后立即返回，因此无论运行最终如何结束，它都会带有 `executionId` 并报告成功——请轮询 `n8n_executions({action: "get", id: executionId})` 以获取结果。如果 n8n 完全拒绝调度，则会返回 `OFFICIAL_MCP_ERROR`，而不是 `EXECUTION_FAILED`。
- "Available in MCP" 设置关闭的工作流会返回 `WORKFLOW_NOT_EXPOSED`；`exposeToMcp: true` 会开启该设置并重试一次。这是一项可见且持久的更改——请先征得用户同意，并说明启用该设置本身就是一次工作流更新，因此可能覆盖 UI 中同时进行的编辑。

成功且已路由的响应会声明 `method` 和 `backend`（`public-api` 或 `official-mcp`）；因参数验证而被拒绝的信封可能两者都不包含。

有关每种方法的可运行示例，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md#n8n_test_workflow-running-workflows)。

---

## 版本历史

`n8n_workflow_versions` 会读取两套相互独立的历史记录，通过 `source` 进行选择：

- `source: "local"`（默认值）——n8n-mcp 在修改工作流之前创建的快照。支持任意 n8n 版本，无需令牌，id 为数字。无法感知在 n8n UI 中进行的编辑。唯一支持 `delete` 和 `prune` 的来源。
- `source: "native"` ——n8n 自身的工作流历史记录，即 UI 中显示的同一列表，其中包括人员进行的编辑。需要 `N8N_MCP_ACCESS_TOKEN`（n8n 2.34+；原生 `diff` 需要 2.36，该版本中提供了 `get_workflow_versions_diff`）以及工作流的 "Available in MCP" 设置；id 是不透明字符串；`list` 的结果上限为 50，并支持使用 `offset`；使用 `source` 时，`delete` 和 `prune` 会因 `MODE_NOT_SUPPORTED_FOR_SOURCE` 被拒绝（该保留策略由 n8n 管理）。原生回滚不会进行预验证——`validateBefore` 会被接受但忽略。

`mode: "diff"` 会比较两个版本（`versionId` 和 `toVersionId`，两者必须来自同一来源和工作流）。本地差异（`data.format: "n8n-mcp"`）会以节点 **IDs** 报告新增、删除和修改的节点；原生差异（`data.format: "n8n"`）是 n8n 自身的载荷，其中包含字段级别的变更前/变更后值。请根据 `data.format` 进行分支判断，不要假定字段名称。

原生模式会经过与已路由运行方法相同的授权门控：当工作流的 "Available in MCP" 设置关闭时，会返回 `WORKFLOW_NOT_EXPOSED`；使用 `exposeToMcp: true` 重新运行后，该设置会被打开并重试一次（随后响应会携带 `exposedToMcp: true`）。这是对工作流可见且持久的修改——传入该参数前请先征得用户同意。`timeoutMs`（5000-600000）是原生调用的客户端截止时间。

有关每种模式以及两种来源的可运行示例，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md#n8n_workflow_versions-version-control)。

---

## 数据表管理

`n8n_manage_datatable` 是用于从工作流*外部*管理数据表和行的 MCP 工具（表操作包括 `createTable`/`listTables`/`getTable`/`updateTable`/`deleteTable`；行操作包括 `getRows`/`insertRows`/`updateRows`/`upsertRows`/`deleteRows`，并支持筛选、分页和 `dryRun`）。不要将它与工作流内的 `nodes-base.dataTable` 节点混淆，后者会在*执行期间*读取/写入行（参见 [n8n-node-configuration → OPERATION_PATTERNS.md](../n8n-node-configuration/OPERATION_PATTERNS.md#data-table-nodes-basedatatable)）。经验法则：使用 MCP 工具一次性设置表，使用工作流节点在每次执行时读取/写入。`deleteRows` 要求提供筛选条件；批量修改前请使用 `dryRun: true`。

**列操作**——`addColumn`、`deleteColumn`、`renameColumn`——会修改现有表的列，而 Public API 无法执行这些操作；它们通过 n8n 的 MCP 服务器运行，并需要 `N8N_MCP_ACCESS_TOKEN`（n8n 2.34+）。`addColumn` 接受 `column: {name, type}`（name 必须以字母开头，只能包含字母/数字/下划线，最多 63 个字符；type 为 `string`、`number`、`boolean` 或 `date`）；`deleteColumn`/`renameColumn` 接受来自 `getTable` 的 `columnId`，而 `renameColumn` 将新的列名放在 `name` 中。它们通过项目定位数据表：当恰好有一个项目可访问时，会自动解析 `projectId`；否则调用会返回 `PROJECT_REQUIRED` 并列出候选项目——传入 `projectId`（来自 `n8n_list_catalog({kind: "projects"})`）即可跳过解析。重命名*数据表*不属于列操作：请在 Public API 上使用 `updateTable`。

**`deleteColumn` 会连同列一起丢弃该列的值，而且无法撤销。** 这在最容易被忽视的情况下影响最大：列创建后无法更改其类型，因此“将此列改为数字”实际上意味着删除后重新添加，而这会丢弃其中的所有内容。如果这些值很重要，请先使用 `getRows` 读出，然后在删除包含数据的列之前向用户确认。

有关所有操作、筛选条件和示例，请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 工作流文件夹

`n8n_manage_folders` 用于将工作流组织到文件夹中（操作包括 `create`/`list`/`get`/`rename`/`move`/`delete`；需要 n8n 2.19+，注册后可用于 Community 层级及更高版本）。`projectId` 默认为 `'personal'`。工作流的归属应在*工作流*工具中设置：在 `n8n_create_workflow` 中使用 `parentFolderId`，或使用 `n8n_update_partial_workflow` 的 `moveToFolder` 操作（两者都需要 n8n 2.32+；`null` = 项目根目录）。需要牢记两点：在 n8n 的 API 中，工作流所属的文件夹是**只写的**（通过文件夹的 `get` 计数验证归属，绝不要通过读取工作流来验证）；以及不带 `transferToFolderId` 的 `delete` 会**归档**该文件夹中的工作流（改用 `transferToFolderId: "0"` 会将它们移动到项目根目录，同时保持激活状态）。

有关所有操作、列表筛选条件/计数以及删除语义，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 凭据管理

`n8n_manage_credentials` 是统一的凭据工具：操作包括 `list`、`get`、`create`、`update`、`delete`、`getSchema`。它绝不会返回机密信息——`get`/`create`/`update` 会移除 `data` 字段。在执行 `create` 之前使用 `getSchema` 来发现必填字段。可选的 `includeUsage: true` 标志（用于 `list`/`get`）会反向扫描工作流，并附加 `usedIn: [{id, name, active}]` + `usageCount`——在删除或轮换凭据之前使用它，以了解哪些内容会受到影响（它会触发完整的客户端扫描，最多处理 5000 个工作流，排除已归档的工作流；如果失败，则会将结果降级为 `usageScanError` 字段）。

有关所有操作、includeUsage 的结构、安全注意事项以及安全删除/轮换工作流，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## Agent

本节中的三个工具仅适用于 n8n 的实例级 MCP server（与 Public API 使用不同的端点）。`n8n_manage_agents` 和 `n8n_explore_node_resources` 需要 `N8N_MCP_ACCESS_TOKEN`；`n8n_list_catalog` 无需该令牌，并且仅在团队项目的回退处理中使用令牌。其他工具也会通过同一个 server 路由各自的操作——`n8n_test_workflow` 的 `prepare`/`pinned`/`direct`、`n8n_workflow_versions` 的 `source: "native"`、`n8n_manage_datatable` 的列操作——具体说明见各自的章节；另请参阅下方的“工具可用性”。

- `n8n_manage_agents` — 创建、配置、验证、运行和发布持久化的 n8n Agents（独立的 assistant artifact：模型、指令、工具、技能、任务、记忆、渠道——不是 AI Agent 工作流节点）。操作包括：`reference`、`search`、`get`、`create`、`mutate`、`validate`、`call`、`publish`、`unpublish`、`revert`、`versions`、`delete`、`discover_assets`、`verify_mcp_server`、`update_integration`。从 `action: "reference"` 开始，然后执行 `discover_assets` → `create` → `mutate`（一次处理一个资源，并始终使用最新的 hash——n8n 会将其作为 `configHash` 返回，并要求你将其作为 `args.baseConfigHash` 传回；过期的 hash 会返回 `STALE_CONFIG`）→ `validate`。只有在明确请求时才执行 `publish`；`call` 会使用真实凭据和工具运行该 agent，并可能返回 `approvals[]` 供人类决定。`timeoutMs` 是顶层参数（默认值为 30000，`call` 为 180000），不属于 `args`。需要 n8n **2.34+** 以及 agents 模块；在 2.36.x 中，agents runtime 会拒绝 `azureOpenAiApi`/`aws` 凭据。封装错误代码包括：`NOT_CONFIGURED`、`INVALID_ARGS`、`STALE_CONFIG`、`AGENT_NOT_RUNNABLE`、`AGENT_TOOL_ERROR`（自定义工具编译失败，或未知的 `agentId`），以及共享的 `OFFICIAL_MCP_*` 系列（`AUTH_FAILED`、`NOT_ENABLED`、`RATE_LIMITED`、`TOOL_UNAVAILABLE`、`URL_REJECTED`、`TIMEOUT`、`TRANSPORT_ERROR`、`ERROR`）。完整工作流请参阅 **n8n-agents** skill 的“持久化 n8n Agents”章节。
- `n8n_explore_node_resources` — 使用实时凭据解析节点的 `loadOptions` 下拉菜单或资源定位器 `listSearch` 背后的真实值（Slack channels、Google Sheets tabs、model lists），而不是猜测 ID。当 `get_node`（`standard` 详情）在某个属性中显示 `dynamicOptions: {methodName, methodType, dependsOn}` 时使用它。**六个参数都是必填的，且不会自动推断任何参数：**`nodeType`（LONG form）、`version`（该方法所属节点的 `typeVersion`）、从 `dynamicOptions` 中逐字复制的 `methodName` 和 `methodType`，以及该类型的 `credentialType` 和一个来自 `n8n_manage_credentials({action: "list"})` 的 `credentialId`。将方法的 `dependsOn` 放入 `currentNodeParameters`；资源定位器值则保持其 `{__rl: true, mode: "id", value: "…"}` 结构。每个结果的 `value` 都是应放入工作流参数中的值；`name` 仅用于显示文本。
- `n8n_list_catalog` — 列出实例级的 `projects`（会标记个人项目，并提供用于 `n8n_manage_agents`/`n8n_manage_datatable` 的 `projectId`）或 `tags`。通过 Public API 无需令牌即可工作；如果已配置令牌，则当 Public API 的许可门禁拒绝请求时，会回退到官方 MCP server 来获取团队项目（`teamProjectsEnabled` 会报告该功能是否启用）。

---

## 安全与审计

`n8n_audit_instance` 将 n8n 内置审计（类别 `credentials`/`database`/`nodes`/`instance`/`filesystem`）与自定义深度扫描（`hardcoded_secrets`、`unauthenticated_webhooks`、`error_handling`、`data_retention`）结合起来。所有参数均为可选：`categories`、`includeCustomScan`（默认值为 `true`）、`customChecks`、`daysAbandonedWorkflow`。检测到的密钥会被掩码处理（前 6 个字符 + 后 4 个字符）。输出是一份可执行的 markdown 报告——包括摘要表格、按工作流整理的问题，以及拆分为可自动修复 / 需要审核 / 需要用户操作的修复行动手册。

有关两种扫描方式、示例和完整的修复类型，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 自助工具

- `tools_documentation()` — 所有工具的概览；针对特定工具，可使用 `tools_documentation({topic, depth: "full"})`。代码节点指南可通过主题 `javascript_code_node_guide` / `python_code_node_guide` 获取。
- **AI 代理指南** — `tools_documentation({topic: "ai_agents_guide", depth: "full"})`（没有独立工具）；返回架构、连接、工具、验证和最佳实践。
- `n8n_health_check()` — 快速检查；`n8n_health_check({mode: "diagnostic"})` 返回状态、环境变量、工具状态和 API 连接情况。两种模式还都会返回一个 **`officialMcp`** 块 — `{configured, endpoint, reachable, toolCount, agentTools}` — 它是所有依赖 `N8N_MCP_ACCESS_TOKEN` 的功能的预检信息：代理工具、`n8n_test_workflow` 的路由方法、原生版本历史记录、数据表列操作。在使用其中任何功能之前先读取一次，而不是在任务中途通过 `NOT_CONFIGURED` 信封才发现缺少配置。

示例请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 工具可用性

**始终可用**（不需要 n8n API）：
- search_nodes、get_node
- validate_node、validate_workflow
- search_templates、get_template
- tools_documentation（包括 ai_agents_guide 主题）

**需要 n8n API**（N8N_API_URL + N8N_API_KEY）：
- n8n_create_workflow
- n8n_update_partial_workflow、n8n_update_full_workflow
- n8n_validate_workflow（按 ID）
- n8n_list_workflows、n8n_get_workflow、n8n_delete_workflow
- n8n_test_workflow
- n8n_executions
- n8n_evaluations（读取：n8n 2.30+，且 API 密钥需在 2.30+ 中创建；运行/取消：n8n 2.32+，且密钥需在 2.32+ 中创建——旧密钥缺少 testRun 作用域）
- n8n_deploy_template
- n8n_workflow_versions
- n8n_autofix_workflow
- n8n_manage_datatable
- n8n_manage_folders（文件夹 CRUD：n8n 2.19+、已注册的 Community 层级及更高层级；通过 parentFolderId/moveToFolder 放置工作流：n8n 2.32+）
- n8n_manage_credentials
- n8n_audit_instance
- n8n_list_catalog（无需令牌即可工作；仅在团队项目回退时需要令牌）

**需要 `N8N_MCP_ACCESS_TOKEN`**（这是一个与上述 Public API 凭据不同的独立令牌，来自 n8n 设置 → 实例级 MCP）：
- n8n_manage_agents
- n8n_explore_node_resources
- n8n_test_workflow，使用 `method: "prepare"`/`"pinned"`/`"direct"` 时（还需要工作流的“Available in MCP”设置）
- n8n_workflow_versions，使用 `source: "native"` 时（还需要工作流的“Available in MCP”设置）
- n8n_manage_datatable，使用 `addColumn`/`deleteColumn`/`renameColumn` 时

如果 API 工具不可用，请使用模板和仅验证工作流。

---

## 统一工具参考

- **`get_node`** — 详细级别（`minimal` 约 200 个 token / `standard` 约 1-2K，推荐 / `full` 约 3-8K，谨慎使用）和模式（默认为 `info`、`docs`、`search_properties` + `propertyQuery`、`versions`、`compare`、`breaking`、`migrations`）。详见 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)。
- **`validate_node`** — 模式 `full`（默认，错误/警告/建议）和 `minimal`（必填字段检查）；配置文件 `minimal`/`runtime`（默认，推荐）/`ai-friendly`/`strict`。详见 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)。

---

## 性能特征

| 工具 | 响应时间 | 负载大小 |
|------|---------------|--------------|
| search_nodes | <20ms | 小 |
| get_node (standard) | <10ms | ~1-2KB |
| get_node (full) | <100ms | 3-8KB |
| validate_node (minimal) | <50ms | 小 |
| validate_node (full) | <100ms | 中 |
| validate_workflow | 100-500ms | 中 |
| n8n_manage_folders | 100-500ms | 小 |
| n8n_manage_credentials | 50-500ms | 小-中 |
| n8n_audit_instance | 500-5000ms | 大 |
| n8n_create_workflow | 100-500ms | 中 |
| n8n_update_partial_workflow | 50-200ms | 小 |
| n8n_deploy_template | 200-500ms | 中 |

---

## 最佳实践

### 应该做
- 对于简单工作流（<=5 个节点），直接使用 MCP 工具 — 不要过度设计调查过程
- 使用 `patchNodeField` 对 Code 节点内容进行精准编辑，而不是替换整个节点
- 对于大多数用例，使用 `get_node({detail: "standard"})`
- 明确指定验证配置文件（`profile: "runtime"`）
- 使用智能参数（`branch`、`case`）以提高清晰度
- 在工作流更新中包含 `intent` 参数
- 遵循 search → get_node → validate 工作流
- 迭代工作流（编辑之间平均间隔 56 秒）
- 每次重大更改后进行验证
- 使用 `includeExamples: true` 获取实际配置
- 使用 `n8n_deploy_template` 快速开始

### 不应该做
- 除非必要，否则不要使用 `detail: "full"`（浪费 token）
- 不要忘记 nodeType 前缀（`nodes-base.*`）
- 不要跳过验证配置文件
- 不要试图一次性构建工作流（要进行迭代！）
- 不要忽略自动清理行为
- 不要在搜索/验证工具中使用完整前缀（`n8n-nodes-base.*`）
- 构建完成后不要忘记激活工作流

---

## 总结

**最重要的事项**：
1. 使用带有 `detail: "standard"` 的 **get_node**（默认）— 可覆盖 95% 的用例
2. nodeType 格式有所不同：`nodes-base.*`（搜索/验证）与 `n8n-nodes-base.*`（工作流）
3. 指定**验证配置文件**（推荐使用 `runtime`）
4. 使用**智能参数**（`branch="true"`、`case=0`）
5. 在工作流更新中包含 **intent 参数**
6. 更新期间会对所有节点运行**自动清理**
7. 可以通过 API 激活工作流（`activateWorkflow` 操作）
8. 工作流采用**迭代方式构建**（编辑之间平均间隔 56 秒）
9. 使用 `n8n_manage_datatable` 管理**数据表**（CRUD + 过滤）
10. 使用 `n8n_manage_folders` 管理**文件夹**；工作流放置操作是只写入的（通过文件夹计数而不是工作流来验证）
11. 使用 `n8n_manage_credentials` 管理**凭据**（CRUD + 模式发现）
12. 通过 `n8n_audit_instance` 执行**安全审计**（内置扫描 + 自定义深度扫描）
13. 可通过 `tools_documentation({topic: "ai_agents_guide", depth: "full"})` 获取 **AI agent 指南**。

**常见工作流**：
1. search_nodes → 查找节点
2. get_node → 了解配置
3. validate_node → 检查配置
4. n8n_create_workflow → 构建
5. n8n_validate_workflow → 验证
6. n8n_update_partial_workflow → 迭代
7. activateWorkflow → 正式上线！

详情请参阅：
- [SEARCH_GUIDE.md](SEARCH_GUIDE.md) - 节点发现
- [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md) - 配置验证 + 常见错误
- [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) - 工作流管理
- [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md) - 模板、数据表、自助工具

---

**相关 Skills**：
- n8n Expression Syntax - 在工作流字段中编写表达式
- n8n Workflow Patterns - 基于模板的架构模式
- n8n Validation Expert - 解读验证错误
- n8n Node Configuration - 特定操作的要求
- n8n Code JavaScript - 在 Code 节点中编写 JavaScript
- n8n Code Python - 在 Code 节点中编写 Python