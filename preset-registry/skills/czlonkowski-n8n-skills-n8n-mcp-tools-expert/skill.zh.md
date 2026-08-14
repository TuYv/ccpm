---
name: n8n-mcp-tools-expert
description: Expert guide for using n8n-mcp MCP tools effectively. Use when searching for nodes, validating configurations, accessing templates, managing workflows, organizing workflows into folders, managing credentials, auditing instance security, or using any n8n-mcp tool. Provides tool selection guidance, parameter formats, and common patterns. IMPORTANT — Always consult this skill before calling any n8n-mcp tool — it prevents common mistakes like wrong nodeType formats, incorrect parameter structures, and inefficient tool usage. If the user mentions n8n, workflows, nodes, or automation and you have n8n MCP tools available, use this skill first.
---
# n8n MCP 工具专家

使用 n8n-mcp MCP 服务器工具构建工作流的权威指南。

---

## 工具类别

n8n-mcp 提供按以下类别组织的工具：

1. **节点发现** → [SEARCH_GUIDE.md](SEARCH_GUIDE.md)
2. **配置验证** → [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)
3. **工作流管理** → [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)
4. **模板库** - 搜索并部署 2,700 多个真实工作流
5. **数据表** - 管理 n8n 数据表和行（`n8n_manage_datatable`）
6. **工作流文件夹** - 文件夹 CRUD + 工作流放置（`n8n_manage_folders`）
7. **凭证管理** - 完整的凭证 CRUD + 模式发现（`n8n_manage_credentials`）
8. **安全与审计** - 使用自定义深度扫描审计实例安全性（`n8n_audit_instance`）
9. **文档与指南** - 工具文档、AI 智能体指南、Code 节点指南

---

## 快速参考

### 最常用的工具（按成功率排序）

| 工具 | 使用场景 | 速度 |
|------|----------|-------|
| `search_nodes` | 按关键字查找节点 | <20ms |
| `get_node` | 了解节点操作（detail="standard"） | <10ms |
| `validate_node` | 检查配置（mode="full"） | <100ms |
| `n8n_create_workflow` | 创建工作流 | 100-500ms |
| `n8n_update_partial_workflow` | 编辑工作流（最常用！） | 50-200ms |
| `validate_workflow` | 检查完整工作流 | 100-500ms |
| `n8n_deploy_template` | 将模板部署到 n8n 实例 | 200-500ms |
| `n8n_manage_datatable` | 管理数据表和行 | 50-500ms |
| `n8n_manage_folders` | 文件夹 CRUD + 组织工作流 | 100-500ms |
| `n8n_manage_credentials` | 凭证 CRUD + 模式发现 | 50-500ms |
| `n8n_audit_instance` | 安全审计（内置 + 自定义扫描） | 500-5000ms |
| `n8n_autofix_workflow` | 自动修复验证错误 | 200-1500ms |

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

**常见模式**：验证 → 修复 → 验证（每个周期思考 23 秒，修复 58 秒）

### 管理工作流

**工作流**：
```
1. n8n_create_workflow({name, nodes, connections})
2. n8n_validate_workflow({id})
3. n8n_update_partial_workflow({id, operations: [...]})
4. n8n_validate_workflow({id}) again
5. n8n_update_partial_workflow({id, operations: [{type: "activateWorkflow"}]})
```

**常见模式**：迭代更新（两次编辑之间平均间隔 56 秒）

### 关键：创建工作流时的节点 JSON 规范

生成的节点 JSON 中有三类结构错误，即使工作流通过验证，也会导致 n8n UI 无法正常使用：

1. **切勿生成包含占位符 ID 的 `credentials` 块。** 类似 `"id": "REPLACE_ME"` 的虚假 ID 会导致 n8n UI 中的凭证选择器永久处于禁用且无法点击的状态（显示“No credentials yet”）——用户只能从头重新创建节点。如果你不知道真实的凭证 ID，**请完全省略 `credentials` 块**；缺少该块时，界面会显示一个用户可以点击的正常空下拉列表。请先使用 `n8n_manage_credentials({action: "list"})` 查找真实的凭证 ID。

```javascript
// ❌ Breaks the credential selector
"credentials": {"httpHeaderAuth": {"id": "REPLACE_ME", "name": "My API Key"}}

// ✅ Unknown ID → omit credentials block; user picks in UI
// ✅ Known ID (from n8n_manage_credentials list) → use the real ID
```

2. **为节点 `id` 生成 UUID v4 值**——不要使用类似 `"http-list-node"` 这样的人类可读字符串。n8n 前端使用节点 ID 进行表单绑定和凭证组件初始化；非 UUID 的 ID 会导致不易察觉的 UI 故障。

3. **为每个节点使用当前的 `typeVersion`**——应检查 `get_node`，而不是将记忆中的版本硬编码进去（例如，httpRequest 当前为 4.4+，而不是 4.2）。

---

## 关键：nodeType 格式

不同工具使用**两种不同的格式**！

### 格式 1：搜索/验证工具
```javascript
// Use SHORT prefix
"nodes-base.slack"
"nodes-base.httpRequest"
"nodes-base.webhook"
"nodes-langchain.agent"
```

**使用此格式的工具**：
- search_nodes（返回此格式）
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

以下是八种反复出现的错误。其中两种值得完整展示，因为它们会在不发出提示的情况下破坏结构：

```javascript
// nodeType prefix (search/validate tools want the SHORT form)
get_node({nodeType: "slack"})              // ❌ missing prefix → "Node not found"
get_node({nodeType: "n8n-nodes-base.slack"}) // ❌ FULL prefix is for workflow tools
get_node({nodeType: "nodes-base.slack"})     // ✅

// credentials must be nested by type with {id, name} — not a flat string
updates: {credentials: "myApiKey"}                              // ❌
updates: {credentials: {httpHeaderAuth: {id: "abc123", name: "My API Key"}}}  // ✅
```

| # | 错误 | 修复方法 |
|---|---------|-----|
| 1 | nodeType 格式错误 | 搜索/验证工具使用简短格式 `nodes-base.*`；工作流工具使用完整格式 `n8n-nodes-base.*`（见上文） |
| 2 | 默认使用 `detail: "full"` | 默认的 `standard` 可满足 95% 的需求；应优先使用 `docs`/`search_properties`，而不是 `full` |
| 3 | 未指定验证配置 | 显式传入 `profile: "runtime"`（其他阶段使用 `minimal`/`ai-friendly`/`strict`） |
| 4 | 忽略自动清理 | 进行任何更新时，所有节点都会被清理（运算符结构、IF/Switch 元数据）；但它无法修复损坏的连接或分支数量不匹配问题 |
| 5 | 未使用智能参数 | 使用 `branch: "true"` / `case: 0`，而不是容易出错的 `sourceIndex` 数学计算 |
| 6 | 省略 `intent` | 在 `n8n_update_partial_workflow` 中始终包含 `intent`，以获得更好的响应 |
| 7 | 使用 `parameters` 而不是 `updates` | `updateNode` 接受的是 `updates: {...}`，而不是 `parameters: {...}` |
| 8 | 凭证格式错误 | 按类型嵌套 `{id, name}`（见上文） |

每种情况的完整错误/正确示例：参见 [VALIDATION_GUIDE.md → 常见错误](VALIDATION_GUIDE.md)。

---

## 工具使用模式

实际使用中主要有三种模式。每种模式的分步实操示例均位于参考指南中。

- **模式 1 — 节点发现**（步骤之间平均间隔 18 秒）：`search_nodes({query})` → `get_node({nodeType, includeExamples: true})`。参见 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)。
- **模式 2 — 验证循环**（思考 23 秒，修复 58 秒）：`validate_node({profile: "runtime"})` → 阅读 `errors` → 修复配置 → 再次验证，直至没有错误。参见 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)。
- **模式 3 — 工作流编辑**（成功率 99.0%，编辑之间平均间隔 56 秒）：反复执行 `n8n_update_partial_workflow`（附带 `intent`）→ `n8n_validate_workflow` → 最后执行 `activateWorkflow`。应以迭代方式构建，切勿一次性完成。参见 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 详细指南

### 节点发现工具
有关以下内容，请参见 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)：
- search_nodes
- get_node 的详细程度（minimal、standard、full）
- get_node 的模式（info、docs、search_properties、versions）

### 验证工具
有关以下内容，请参见 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)：
- 验证配置文件说明
- validate_node 的模式（minimal、full）
- validate_workflow 的完整结构
- 自动清理系统
- 验证错误处理

### 工作流管理
有关以下内容，请参见 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)：
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

### 模板、数据表与自助工具
有关以下内容，请参见 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)：
- search_templates / get_template / n8n_deploy_template 示例
- n8n_manage_datatable（完整操作、筛选条件、示例）
- tools_documentation、ai_agents_guide、n8n_health_check

---

## 模板使用

包含 2,700 多个模板的模板库提供三种工具：`search_templates`（模式为 `query`/`by_nodes`/`by_task`/`by_metadata`）、`get_template`（模式为 `structure`/`full`）和 `n8n_deploy_template`（使用 `autoFix`/`autoUpgradeVersions` 部署到你的实例，并返回工作流 ID、所需凭证和已应用的修复）。

完整的搜索/获取/部署示例请参见 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 数据表管理

`n8n_manage_datatable` 是用于从工作流*外部*管理数据表和行的 MCP 工具（表操作包括 `createTable`/`listTables`/`getTable`/`updateTable`/`deleteTable`；行操作包括 `getRows`/`insertRows`/`updateRows`/`upsertRows`/`deleteRows`，并支持筛选、分页和 `dryRun`）。不要将其与工作流内的 `nodes-base.dataTable` 节点混淆，后者会在*执行期间*读取/写入行（参见 [n8n-node-configuration → OPERATION_PATTERNS.md](../n8n-node-configuration/OPERATION_PATTERNS.md#data-table-nodes-basedatatable)）。经验法则：使用 MCP 工具一次性设置表，使用工作流节点在每次执行时读取/写入。`deleteRows` 要求提供筛选条件；进行批量更改前，请先使用 `dryRun: true`。

有关所有操作、筛选条件和示例，请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 工作流文件夹

`n8n_manage_folders` 用于将工作流组织到文件夹中（操作包括 `create`/`list`/`get`/`rename`/`move`/`delete`；需要 n8n 2.19+，已注册的免费 Community 版本或更高版本）。`projectId` 默认为 `'personal'`。将工作流放入文件夹需通过*工作流*工具完成：在 `n8n_create_workflow` 上使用 `parentFolderId`，或使用 `n8n_update_partial_workflow` 的 `moveToFolder` 操作（两者均需要 n8n 2.32+；`null` = 项目根目录）。需要牢记两点：在 n8n 的 API 中，工作流的文件夹属性是**只写的**（应通过文件夹的 `get` 计数来验证放置情况，切勿通过读取工作流进行验证）；此外，在不指定 `transferToFolderId` 的情况下执行 `delete` 会**归档**该文件夹中的工作流（改用 `transferToFolderId: "0"` 会将其移动到项目根目录，并保持其活动状态）。

有关所有操作、列表筛选条件/计数以及删除语义，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 凭证管理

`n8n_manage_credentials` 是统一的凭证工具，支持以下操作：`list`、`get`、`create`、`update`、`delete`、`getSchema`。它绝不会返回密钥——`get`/`create`/`update` 会移除 `data` 字段。在执行 `create` 之前，请使用 `getSchema` 获取必填字段。可选的 `includeUsage: true` 标志（用于 `list`/`get`）会反向扫描工作流，并附加 `usedIn: [{id, name, active}]` + `usageCount`——在删除或轮换凭证之前使用它，以了解哪些内容会受影响（它会触发完整的客户端扫描，上限为 5000 个工作流，不包括已归档的工作流；如果失败，则会降级为返回 `usageScanError` 字段）。

有关所有操作、includeUsage 的结构、安全说明以及安全删除/轮换工作流，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 安全与审计

`n8n_audit_instance` 将 n8n 的内置审计（类别包括 `credentials`/`database`/`nodes`/`instance`/`filesystem`）与自定义深度扫描（`hardcoded_secrets`、`unauthenticated_webhooks`、`error_handling`、`data_retention`）相结合。所有参数均为可选：`categories`、`includeCustomScan`（默认为 `true`）、`customChecks`、`daysAbandonedWorkflow`。检测到的密钥会被掩码处理（保留前 6 个和后 4 个字符）。输出是一份可直接采取行动的 Markdown 报告——包含摘要表、按工作流列出的发现，以及分为可自动修复/需要审核/需要用户操作三类的修复行动手册。

有关两种扫描方法、示例以及完整的修复类型，请参阅 [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)。

---

## 自助工具

- `tools_documentation()` — 所有工具的概览；使用 `tools_documentation({topic, depth: "full"})` 查看特定工具。可通过主题 `javascript_code_node_guide` / `python_code_node_guide` 获取 Code 节点指南。
- **AI 代理指南** — `tools_documentation({topic: "ai_agents_guide", depth: "full"})`（没有独立工具）；返回架构、连接、工具、验证和最佳实践。
- `n8n_health_check()` — 快速检查；`n8n_health_check({mode: "diagnostic"})` 返回状态、环境变量、工具状态和 API 连接情况。

有关示例，请参阅 [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md)。

---

## 工具可用性

**始终可用**（无需 n8n API）：
- search_nodes, get_node
- validate_node, validate_workflow
- search_templates, get_template
- tools_documentation（包括 ai_agents_guide 主题）

**需要 n8n API**（N8N_API_URL + N8N_API_KEY）：
- n8n_create_workflow
- n8n_update_partial_workflow, n8n_update_full_workflow
- n8n_validate_workflow（按 ID）
- n8n_list_workflows, n8n_get_workflow, n8n_delete_workflow
- n8n_test_workflow
- n8n_executions
- n8n_evaluations（读取：需要 n8n 2.30+，且 API 密钥创建于 2.30+；运行/取消：需要 n8n 2.32+，且密钥创建于 2.32+——旧密钥缺少 testRun scopes）
- n8n_deploy_template
- n8n_workflow_versions
- n8n_autofix_workflow
- n8n_manage_datatable
- n8n_manage_folders（文件夹 CRUD：需要 n8n 2.19+、已注册的 Community 层级或更高层级；通过 parentFolderId/moveToFolder 放置工作流：需要 n8n 2.32+）
- n8n_manage_credentials
- n8n_audit_instance

如果 API 工具不可用，请使用模板和仅验证工作流。

---

## 统一工具参考

- **`get_node`** — 详细程度（`minimal` 约 200 个 token / `standard` 约 1-2K，推荐 / `full` 约 3-8K，谨慎使用）和模式（默认为 `info`、`docs`、`search_properties` + `propertyQuery`、`versions`、`compare`、`breaking`、`migrations`）。深入说明见 [SEARCH_GUIDE.md](SEARCH_GUIDE.md)。
- **`validate_node`** — 模式 `full`（默认，包含错误/警告/建议）和 `minimal`（必填字段检查）；配置文件 `minimal`/`runtime`（默认，推荐）/`ai-friendly`/`strict`。深入说明见 [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)。

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
- 对于简单工作流（<=5 个节点），直接使用 MCP 工具——不要过度设计调查过程
- 对 Code 节点内容进行精确编辑时，使用 `patchNodeField`，而不是替换整个节点
- 大多数用例使用 `get_node({detail: "standard"})`
- 显式指定验证配置文件（`profile: "runtime"`）
- 使用智能参数（`branch`、`case`）以提高清晰度
- 在工作流更新中包含 `intent` 参数
- 遵循搜索 → get_node → 验证工作流的流程
- 迭代工作流（两次编辑之间平均间隔 56 秒）
- 每次重大更改后进行验证
- 使用 `includeExamples: true` 获取真实配置
- 使用 `n8n_deploy_template` 快速开始

### 不应该做
- 除非必要，否则不要使用 `detail: "full"`（浪费 token）
- 不要忘记节点类型前缀（`nodes-base.*`）
- 不要跳过验证配置文件
- 不要尝试一次性构建工作流（应进行迭代！）
- 不要忽略自动清理行为
- 使用搜索/验证工具时，不要使用完整前缀（`n8n-nodes-base.*`）
- 构建后不要忘记激活工作流

---

## 总结

**最重要事项**：
1. 使用 **get_node**，并设置 `detail: "standard"`（默认值）——可覆盖 95% 的使用场景
2. nodeType 格式有所不同：`nodes-base.*`（搜索/验证）与 `n8n-nodes-base.*`（工作流）
3. 指定**验证配置文件**（推荐使用 `runtime`）
4. 使用**智能参数**（`branch="true"`、`case=0`）
5. 更新工作流时包含 **intent 参数**
6. 更新期间会对所有节点执行**自动清理**
7. 可**通过 API 激活**工作流（`activateWorkflow` 操作）
8. 工作流采用**迭代方式**构建（两次编辑之间平均间隔 56s）
9. 使用 `n8n_manage_datatable` 管理**数据表**（CRUD + 筛选）
10. 使用 `n8n_manage_folders` 管理**文件夹**；工作流放置操作是只写的（应通过文件夹计数进行验证，而不是通过工作流验证）
11. 使用 `n8n_manage_credentials` 管理**凭据**（CRUD + 模式发现）
12. 通过 `n8n_audit_instance` 执行**安全审计**（内置扫描 + 自定义深度扫描）
13. 可通过 `tools_documentation({topic: "ai_agents_guide", depth: "full"})` 获取 **AI 智能体指南**

**常见工作流程**：
1. search_nodes → 查找节点
2. get_node → 了解配置
3. validate_node → 检查配置
4. n8n_create_workflow → 构建
5. n8n_validate_workflow → 验证
6. n8n_update_partial_workflow → 迭代
7. activateWorkflow → 正式上线！

有关详细信息，请参阅：
- [SEARCH_GUIDE.md](SEARCH_GUIDE.md) - 节点发现
- [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md) - 配置验证 + 常见错误
- [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) - 工作流管理
- [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md) - 模板、数据表、自助工具

---

**相关技能**：
- n8n 表达式语法 - 在工作流字段中编写表达式
- n8n 工作流模式 - 源自模板的架构模式
- n8n 验证专家 - 解读验证错误
- n8n 节点配置 - 特定操作的要求
- n8n Code JavaScript - 在 Code 节点中编写 JavaScript
- n8n Code Python - 在 Code 节点中编写 Python