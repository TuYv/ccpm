---
name: sqldw-consumption-cli
description: >
  Execute read-only T-SQL queries against Fabric Data Warehouse, Lakehouse SQL Endpoints, and Mirrored Databases
  via the MCP `fabric-sqlendpoint-execute_query` tool. Default skill for any lakehouse data query (row counts, SELECT, filtering,
  aggregation) unless the user explicitly requests PySpark or Spark DataFrames. Use when the user wants to:
  (1) query warehouse/lakehouse data, (2) count rows or explore lakehouse tables, (3) discover schemas/columns,
  (4) generate T-SQL scripts, (5) monitor SQL performance, (6) export results to CSV/JSON. For a Fabric notebook cell (%%sql or
  other notebook magics), use `spark-authoring-cli`, not this skill.
  Triggers: "warehouse", "SQL query", "T-SQL", "query warehouse", "show warehouse tables",
  "show lakehouse tables", "query lakehouse", "lakehouse table", "how many rows", "count rows",
  "SQL endpoint", "describe warehouse schema", "generate T-SQL script", "warehouse performance",
  "export SQL data", "connect to warehouse", "lakehouse data", "explore lakehouse".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: sqldw-consumption-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldw-consumption-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项——无论如何都要添加。

> **更新检查 — 每个会话一次（强制要求）**
> 每个会话中首次使用此技能时，必须先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话此前已执行过检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# SQL 终结点使用 — CLI 技能

> **⚠️ SQL 执行覆盖规则：** 对于 SQL 数据平面执行，此技能优先于 COMMON-CLI 中的 SQL/TDS 指南。除非明确使用旧版 CLI 回退方案，否则请使用 MCP `fabric-sqlendpoint-execute_query`（参见[工具栈](#tool-stack)）。

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — *先阅读链接* [用于根据工作区名称查找工作区 ID，或根据项目名称、项目类型和工作区 ID 查找项目 ID]|
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| OneLake 数据访问 | [COMMON-CORE.md § OneLake 数据访问](../../common/COMMON-CORE.md#onelake-data-access) | 需要 `storage.azure.com` 令牌，而非 Fabric 令牌 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) ||
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) ||
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) ||
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助工具 |
| 通过 `curl` 访问 OneLake 数据 | [COMMON-CLI.md § 通过 curl 访问 OneLake 数据](../../common/COMMON-CLI.md#onelake-data-access-via-curl) | 使用 `curl`，不要使用 `az rest`（令牌受众不同） |
| SQL / TDS 数据平面访问 | [SKILL.md § 工具栈](#tool-stack) | `fabric-sqlendpoint-execute_query` MCP 工具 — 替代 sqlcmd |
| 作业执行（CLI） | [COMMON-CLI.md § 作业执行](../../common/COMMON-CLI.md#job-execution) ||
| OneLake 快捷方式 | [COMMON-CLI.md § OneLake 快捷方式](../../common/COMMON-CLI.md#onelake-shortcuts) ||
| 容量管理（CLI） | [COMMON-CLI.md § 容量管理](../../common/COMMON-CLI.md#capacity-management) ||
| 组合方案 | [COMMON-CLI.md § 组合方案](../../common/COMMON-CLI.md#composite-recipes) ||
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| 项目类型功能矩阵 | [SQLDW-CONSUMPTION-CORE.md § 项目类型功能矩阵](../../common/SQLDW-CONSUMPTION-CORE.md#item-type-capability-matrix) | **先阅读** — 显示哪些是只读（SQLEP），哪些是读写（DW） |
| 连接基础知识 | [SQLDW-CONSUMPTION-CORE.md § 连接基础知识](../../common/SQLDW-CONSUMPTION-CORE.md#connection-fundamentals) | TDS、端口 1433、仅限 Entra、不支持 MARS |
| 支持的 T-SQL 范围（以使用为重点） | [SQLDW-CONSUMPTION-CORE.md § 支持的 T-SQL 范围](../../common/SQLDW-CONSUMPTION-CORE.md#supported-t-sql-surface-area-consumption-focus) | **编写 T-SQL 前请先阅读** — 包括数据类型（不支持 `nvarchar`/`datetime`/`money`） |
| 可创建的读取端对象 | [SQLDW-CONSUMPTION-CORE.md § 可创建的读取端对象](../../common/SQLDW-CONSUMPTION-CORE.md#read-side-objects-you-can-create) | 视图、TVF、标量 UDF、存储过程 |
| 临时表 | [SQLDW-CONSUMPTION-CORE.md § 临时表](../../common/SQLDW-CONSUMPTION-CORE.md#temporary-tables) | 使用 `DISTRIBUTION = ROUND_ROBIN` 以支持 INSERT INTO SELECT |
| 跨数据库查询 | [SQLDW-CONSUMPTION-CORE.md § 跨数据库查询](../../common/SQLDW-CONSUMPTION-CORE.md#cross-database-queries) | 三部分命名，同一工作区 |
| 使用场景中的安全性 | [SQLDW-CONSUMPTION-CORE.md § 使用场景中的安全性](../../common/SQLDW-CONSUMPTION-CORE.md#security-for-consumption) | GRANT/DENY、RLS、CLS、DDM |
| 监控和诊断 | [SQLDW-CONSUMPTION-CORE.md § 监控和诊断](../../common/SQLDW-CONSUMPTION-CORE.md#monitoring-and-diagnostics) | 包括查询标签；DMV（实时）+ `queryinsights.*`（30 天历史记录） |
| 性能：最佳实践和故障排除 | [SQLDW-CONSUMPTION-CORE.md § 性能：最佳实践和故障排除](../../common/SQLDW-CONSUMPTION-CORE.md#performance-best-practices-and-troubleshooting) | 统计信息、缓存、聚类、查询技巧 |
| REST API：刷新 SQL 终结点元数据 | [SQLDW-CONSUMPTION-CORE.md § REST API：刷新 SQL 终结点元数据](../../common/SQLDW-CONSUMPTION-CORE.md#rest-api-refresh-sql-endpoint-metadata) | ETL 后 SQLEP 数据过期时强制同步元数据 |
| 系统目录查询（元数据探索） | [SQLDW-CONSUMPTION-CORE.md § 系统目录查询](../../common/SQLDW-CONSUMPTION-CORE.md#system-catalog-queries-metadata-exploration) | `sys.tables`、`sys.columns`、`sys.views`、`sys.stats` |
| 常见使用模式（端到端示例） | [SQLDW-CONSUMPTION-CORE.md § 常见使用模式](../../common/SQLDW-CONSUMPTION-CORE.md#common-consumption-patterns-end-to-end-examples) | 报表视图、跨数据库分析、临时表暂存 |
| 注意事项和故障排除参考 | [SQLDW-CONSUMPTION-CORE.md § 注意事项和故障排除参考](../../common/SQLDW-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference) | 18 个带有原因和解决方案的编号问题 |
| 快速参考：按场景划分的使用功能 | [SQLDW-CONSUMPTION-CORE.md § 快速参考：使用功能](../../common/SQLDW-CONSUMPTION-CORE.md#quick-reference-consumption-capabilities-by-scenario) | 场景 → 方法查找 |
| 架构和对象发现 | [discovery-queries.md § 架构和对象发现](references/discovery-queries.md#schema-and-object-discovery) | 表、列、视图、函数、存储过程、跨数据库 |
| 安全性发现 | [discovery-queries.md § 安全性发现](references/discovery-queries.md#security-discovery) ||
| 统计信息和性能元数据 | [discovery-queries.md § 统计信息和性能元数据](references/discovery-queries.md#statistics-and-performance-metadata) ||
| 数据导出工作流 | [script-templates.md § 数据导出工作流](references/script-templates.md#data-export-workflow) | 查询到 CSV + 参数化日期范围导出 |
| 架构发现工作流 | [script-templates.md § 架构发现工作流](references/script-templates.md#schema-discovery-workflow) | 通过 MCP 生成完整架构报告 |
| 性能调查工作流 | [script-templates.md § 性能调查工作流](references/script-templates.md#performance-investigation-workflow) | 活动查询、慢查询分析 |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) | `fabric-sqlendpoint-execute_query` MCP 工具 + `az` CLI |
| 连接 | [SKILL.md § 连接](#connection) ||
| 智能体式探索（“与我的数据对话”） | [SKILL.md § 智能体式探索](#agentic-exploration-chat-with-my-data) | 数据探索请**从这里开始** |
| 脚本生成 | [consumption-cli-quickref.md § 脚本生成](references/consumption-cli-quickref.md#script-generation) | 何时生成独立的 bash/PowerShell 脚本；`az rest` 发现 + 旧版 CLI 回退方案 |
| 监控和性能 | [consumption-cli-quickref.md § 监控和性能](references/consumption-cli-quickref.md#monitoring-and-performance) | 活动查询 DMV（只读；会话终止不在范围内） |
| 注意事项、规则、故障排除 | [SKILL.md § 注意事项、规则、故障排除](#gotchas-rules-troubleshooting) | **必须执行 / 避免 / 优先采用** 检查清单 |
| 智能体集成说明 | [consumption-cli-quickref.md § 智能体集成说明](references/consumption-cli-quickref.md#agent-integration-notes) | 各智能体的 CLI 提示 |

---

## 工具栈

| 工具 | 作用 | 安装 |
|---|---|---|
| `fabric-sqlendpoint-execute_query` MCP 工具 | **主要工具**：对 Fabric SQL Endpoint 执行 T-SQL 查询。返回 CSV 结果。身份验证由 MCP 协议处理。 | 无需安装——在服务器端运行。需要注册 MCP 服务器（见下文）。 |
| `az` CLI | 用于身份验证（`az login`），以及通过 Fabric REST 发现工作区/项目。 | 已预装在大多数开发环境中 |
| `jq` | 解析来自 `az rest` 的 JSON | 已预装或很容易安装 |

> **重要提示——MCP 与 sqlcmd：**
> 此技能使用 `fabric-sqlendpoint-execute_query` MCP 工具执行所有 T-SQL。请**不要**使用 COMMON-CLI SQL/TDS/sqlcmd 章节中的方法执行查询。这些参考内容仅适用于 `az rest` 控制平面模式。

> **代理预检**——在首次执行 SQL 操作前进行验证：
> 1. 确认工具列表中存在 `fabric-sqlendpoint-execute_query` 工具。此工具由 `fabric-sqlendpoint` MCP 服务器提供；该服务器可通过安装 Fabric 技能**插件**（最终用户采用的方式）进行注册，也可通过此仓库的 `.mcp.json` 注册——其他 MCP 客户端可以通过各自的配置进行注册。
> 2. 如果找不到匹配的工具，用户必须注册 Fabric SQL Endpoint MCP 服务器。有关注册说明，请参阅 [mcp-setup/](../../mcp-setup/)。
>    - **全局 URL**：`https://api.fabric.microsoft.com/v1/mcp/dataPlane/sqlEndpoint`
>    - **项目范围 URL**：`https://api.fabric.microsoft.com/v1/mcp/dataPlane/workspaces/{workspaceId}/items/{itemId}/sqlEndpoint`

### MCP 工具签名

```text
fabric-sqlendpoint-execute_query(workspaceId, itemId, query)
```

> **工具名称可能不同：**`execute_query` 是逻辑操作。根据服务器的
> 注册方式，工具列表中的具体工具名称可能带有前缀（例如
> `fabric-sqlendpoint-execute_query` 或 `sqlendpoint-global-execute_query`）。请调用工具列表中
> 显示的具体名称，并始终传入 `workspaceId`、`itemId` 和 `query`。

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `workspaceId` | 字符串 (UUID) | 包含目标项目的工作区 GUID |
| `itemId` | 字符串 (UUID) | 要查询的 Fabric 项目 GUID。对于 **Warehouse** 或 **Mirrored Database**，请使用项目 ID。对于 **Lakehouse**，请使用其 **SQL analytics endpoint** ID（`properties.sqlEndpointProperties.id`）——**而不是** Lakehouse 项目 ID。 |
| `query` | 字符串 | T-SQL 查询文本（单个批次——不得包含 `GO` 分隔符或 sqlcmd 元命令） |

**返回：**包含表格结果和元数据文本（"Query returned N rows."）的 CSV 资源（RFC 4180）。

> **批处理指导：**只要不包含 `GO` 分隔符，就可以在单次调用中执行多条语句（例如 `SET NOCOUNT ON; SELECT ...`）。仅返回最后一个结果集。对于相互独立的读取查询，建议分别调用 `fabric-sqlendpoint-execute_query`，以便更清晰地处理错误。

### MCP 限制

| 限制 | 值 | 说明 |
|-------|-------|-------|
| 最大行数 | 10,000 | 超出此数量的结果将被截断。请使用 `TOP`、筛选条件或聚合。 |
| 查询超时 | 300 秒 | 长时间运行的查询会因超时错误而失败。 |
| 速率限制 | 每个身份每分钟 20 个请求 | 超出限制时返回 HTTP 429。请在退避等待后重试。 |

> 这些值是**观察到的默认值，并非有文档明确规定的约定**——MCP 服务可能会更改它们。请将其视为指导，并通过实际的 `429` / 超时 / 截断响应（或者 Microsoft Learn 上发布的内容，如果/当其发布时）确认当前行为，而不要依赖这些确切数字。

### 支持的项目类型

| 项目类型 | itemId 来源 | 读取查询 | DML (INSERT/UPDATE/DELETE) |
|-----------|--------------|--------------|---------------------------|
| **数据仓库** | `GET /v1/workspaces/{wId}/warehouses` → 项目 `id` | ✅ | ✅ |
| **Lakehouse SQL 终结点** | `GET /v1/workspaces/{wId}/lakehouses` → `properties.sqlEndpointProperties.id`（**不是** Lakehouse 的 `id`） | ✅ | ❌（只读） |
| **镜像数据库** | `GET /v1/workspaces/{wId}/mirroredDatabases` → 项目 `id` | ✅ | ❌（只读） |

---

## 连接

### 查找 workspaceId 和 itemId

你需要工作区 GUID 和项目 GUID 才能调用 `fabric-sqlendpoint-execute_query`。可通过 Fabric REST API 查找它们：

```bash
# 1. Find workspace ID by name (capture into WS_ID for the next calls)
WS_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --query "value[?displayName=='MyWorkspace'].id" --output tsv)
echo "Workspace ID: $WS_ID"

# 2. Find warehouse item ID by name
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/warehouses" \
  --query "value[?displayName=='MyWarehouse'].id" --output tsv
# For a Lakehouse, pass its SQL analytics endpoint id — NOT the lakehouse item id
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/lakehouses" \
  --query "value[?displayName=='MyLakehouse'].properties.sqlEndpointProperties.id" --output tsv
```

### 执行查询

获得 `workspaceId` 和 `itemId` 后，调用 MCP 工具：

```text
fabric-sqlendpoint-execute_query(
  workspaceId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  itemId: "11111111-2222-3333-4444-555555555555",
  query: "SELECT TOP 10 * FROM dbo.FactSales"
)
```

**无需进行额外的连接设置**——身份验证由 MCP 协议透明处理。

---

## 智能体式探索（“与我的数据聊天”）

### 架构发现顺序

按顺序运行以下查询，以了解该终结点中的内容。有关扩展的发现查询，请参阅 [references/discovery-queries.md](references/discovery-queries.md)。

```text
# 1. List schemas
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT schema_name FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY schema_name")

# 2. List tables and views
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT table_schema, table_name, table_type FROM INFORMATION_SCHEMA.TABLES ORDER BY table_schema, table_name")

# 3. Columns for a table
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT column_name, data_type, character_maximum_length, is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema='dbo' AND table_name='FactSales' ORDER BY ordinal_position")

# 4. Preview rows
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT TOP 5 * FROM dbo.FactSales")

# 5. Row counts
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT s.name AS [schema], t.name AS [table], SUM(p.rows) AS row_count FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id JOIN sys.partitions p ON t.object_id=p.object_id AND p.index_id IN (0,1) GROUP BY s.name, t.name ORDER BY row_count DESC")

# 6. Programmability objects (views, functions, procedures)
fabric-sqlendpoint-execute_query(workspaceId, itemId, "SELECT name, type_desc FROM sys.objects WHERE type IN ('V','FN','IF','P','TF') ORDER BY type_desc, name")
```

### 智能体工作流

1. **发现** → 执行步骤 1–3，了解可用的表和列。
2. **采样** → 对相关表执行 `SELECT TOP 5`。
3. **构建** → 使用 [SQLDW-CONSUMPTION-CORE.md](../../common/SQLDW-CONSUMPTION-CORE.md) 中支持的 T-SQL 功能范围编写 T-SQL。
4. **执行** → 调用 `fabric-sqlendpoint-execute_query(workspaceId, itemId, query)`。
5. **迭代** → 根据结果进行优化。
6. **呈现** → 显示结果或生成后续查询。

---

## 注意事项、规则和故障排除

有关完整的 T-SQL/平台注意事项，请参阅 [SQLDW-CONSUMPTION-CORE.md](../../common/SQLDW-CONSUMPTION-CORE.md) 中的注意事项和故障排除参考。

### 必须执行

- **验证 `fabric-sqlendpoint-execute_query` MCP 工具是否可用** — 在首次操作前检查工具列表。如果不可用，请指导用户注册 MCP 服务器。
- **始终使用 `TOP` 或 `WHERE` 筛选条件** — MCP 工具最多返回 10,000 行。如果恰好返回 10,000 行，结果很可能已被截断。
- **对于大型表，先使用 `COUNT(*)`** — 在运行无边界 SELECT 之前检查行数。
- **在多语句查询的开头使用 `SET NOCOUNT ON;`** — 抑制行数消息。
- **使用 `OPTION (LABEL = 'AGENTCLI_...')` 为查询添加标签**，以便通过 Query Insights 进行跟踪。
- **仅发送有效的 T-SQL** — 不得包含 `GO` 批处理分隔符、`:setvar` 或 sqlcmd 元命令。每次调用 `fabric-sqlendpoint-execute_query` 都是一个独立的 T-SQL 批处理。
- **对多批次操作使用多次工具调用** — 如果需要 `GO` 分隔符，请拆分为多次独立的 `fabric-sqlendpoint-execute_query` 调用。

### 避免

- **`sqlcmd`** — 改用 `fabric-sqlendpoint-execute_query` MCP 工具。不要通过 shell 调用 sqlcmd 来执行查询。
- **无边界的 `SELECT *`** — 这会触及 10,000 行上限。始终使用 `TOP N` 或 `WHERE` 筛选条件。
- **快速连续执行查询** — 每个身份的速率限制为每分钟 20 个请求。请拉开调用间隔，或使用 JOIN/UNION ALL 合并查询。
- **对 Lakehouse/Mirrored DB 执行 DML** — 这些数据库是只读的。DML 仅适用于 Warehouse 项目。
- **在查询文本中使用 `GO` 分隔符** — 不受支持。请为每个批处理使用独立的工具调用。
- **MARS** — 不受支持。每个查询都独立运行。
- **硬编码项目 ID** — 通过 REST API 进行发现（参见“连接”部分）。

### 建议优先使用

- 使用 **`fabric-sqlendpoint-execute_query` MCP 工具**，而不是任何 CLI 工具来执行 T-SQL。
- 在探索性查询中使用 **`TOP N`** — 避免触及行数限制。
- 使用 JOIN 将相关查询**合并到单个 SELECT 中**，以降低触及速率限制的风险。
- 使用 **`az rest`** 执行 Fabric REST API 操作 — 包括工作区/项目发现和容量管理。
- 优先使用**聚合查询**（`COUNT`、`SUM`、`AVG`、`GROUP BY`），而不是全表扫描。
- 将 **`ORDER BY` 与 `TOP`** 结合使用，以获得确定性的结果。

### 故障排除

| 症状 | 原因 | 解决方法 |
|---|---|---|
| MCP 工具不可用 | MCP 服务器未注册 | 在 MCP 客户端配置中注册 `https://api.fabric.microsoft.com/v1/mcp/dataPlane/sqlEndpoint` |
| HTTP 401 / Unauthorized | 身份验证令牌已过期或无效 | 重新进行身份验证（取决于 MCP 客户端 — 可能需要刷新 `az login`） |
| HTTP 403 / Forbidden | 对工作区/项目的权限不足 | 验证用户是否对工作区/项目拥有 Viewer+ 角色 |
| HTTP 404 / Not Found | workspaceId/itemId 错误，或功能未启用 | 通过 REST API 验证 ID；检查是否已为租户启用 MCP 功能 |
| HTTP 429 / Too Many Requests | 超出速率限制（每分钟 20 个请求） | 等待后采用退避策略重试；合并查询 |
| 查询超时（300 秒） | 查询过于复杂或数据量过大 | 简化查询、添加筛选条件并使用 `TOP` |
| 恰好返回 10,000 行 | 结果被截断 | 添加 `TOP N` 或 `WHERE` 筛选条件；使用 `COUNT(*)` 检查总数 |
| "Invalid workspaceId/itemId" | UUID 格式错误 | 验证 UUID 是否采用正确格式（8-4-4-4-12 位十六进制数字） |
| 响应中出现 SQL 错误 | T-SQL 语法错误或对象无效 | 修复 T-SQL；通过架构发现验证表名/列名 |
| 没有返回行，但数据确实存在 | RLS 筛选 | 检查 `USER_NAME()`，验证 RLS 策略 |
| `Invalid object name 'queryinsights...'` | 新 Warehouse 创建时间不足 2 分钟 | 等待约 2 分钟 |


