---
name: eventhouse-consumption-cli
description: >
  Run KQL queries against Fabric Eventhouse for real-time intelligence
  and time-series analytics using `az rest` against the Kusto REST API. Covers KQL operators
  (where, summarize, join, render), Eventhouse schema discovery (.show tables), time-series
  patterns with bin(), and ingestion monitoring.
  Use when the user wants to:
    1. Run read-only KQL queries against an Eventhouse or KQL Database
    2. Discover Eventhouse table schema and metadata
    3. Analyse real-time or time-series data with KQL operators
    4. Monitor ingestion health and active KQL queries
    5. Export KQL results to JSON
  Triggers: "kql query", "kusto query", "eventhouse query", "kql database",
  "real-time intelligence", "time-series kql", "query eventhouse",
  "explore eventhouse", "show tables kql"
---
> **更新检查 — 每个会话一次（强制）**
> 在每个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程的 package.json 版本。
> - 如果本会话之前已经执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# eventhouse-consumption-cli — 通过 CLI 执行只读 KQL 查询

## 目录

| 任务 | 参考 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* [用于根据名称查找工作区 ID，或根据项名称、项类型和工作区 ID 查找项 ID] |
| Fabric 拓扑与核心概念 | [COMMON-CORE.md § Fabric 拓扑与核心概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | KQL 群集 URI 因项而异 |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误会导致 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | |
| 分页 | [COMMON-CORE.md § 分页](../../common/COMMON-CORE.md#pagination) | |
| 长时间运行的操作 (LRO) | [COMMON-CORE.md § 长时间运行的操作 (LRO)](../../common/COMMON-CORE.md#long-running-operations-lro) | |
| 速率限制与节流 | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling) | |
| OneLake 数据访问 | [COMMON-CORE.md § OneLake 数据访问](../../common/COMMON-CORE.md#onelake-data-access) | 需要 `storage.azure.com` 令牌，而不是 Fabric 令牌 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) | |
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) | |
| 注意事项与故障排除 | [COMMON-CORE.md § 注意事项与故障排除](../../common/COMMON-CORE.md#gotchas--troubleshooting) | |
| 最佳实践 | [COMMON-CORE.md § 最佳实践](../../common/COMMON-CORE.md#best-practices) | |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`**，否则 `az rest` 会失败 |
| 分页模式 | [COMMON-CLI.md § 分页模式](../../common/COMMON-CLI.md#pagination-pattern) | |
| 长时间运行的操作 (LRO) 模式 | [COMMON-CLI.md § 长时间运行的操作 (LRO) 模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | |
| 通过 `curl` 访问 OneLake 数据 | [COMMON-CLI.md § 通过 curl 访问 OneLake 数据](../../common/COMMON-CLI.md#onelake-data-access-via-curl) | 使用 `curl` 而不是 `az rest`（令牌受众不同） |
| 作业执行 (CLI) | [COMMON-CLI.md § 作业执行 (CLI)](../../common/COMMON-CLI.md#job-execution) | |
| OneLake 快捷方式 | [COMMON-CLI.md § OneLake 快捷方式](../../common/COMMON-CLI.md#onelake-shortcuts) | |
| 容量管理 (CLI) | [COMMON-CLI.md § 容量管理 (CLI)](../../common/COMMON-CLI.md#capacity-management) | |
| 组合方案 | [COMMON-CLI.md § 组合方案](../../common/COMMON-CLI.md#composite-recipes) | |
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考：`az rest` 模板 | [COMMON-CLI.md § 快速参考：az rest 模板](../../common/COMMON-CLI.md#quick-reference-az-rest-template) | |
| 快速参考：令牌受众 / CLI 工具矩阵 | [COMMON-CLI.md § 快速参考：令牌受众 ↔ CLI 工具矩阵](../../common/COMMON-CLI.md#quick-reference-token-audience--cli-tool-matrix) | 各服务应使用的 `--resource` 和工具 |
| 连接基础 | [EVENTHOUSE-CONSUMPTION-CORE.md § 连接基础](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#connection-fundamentals) | 群集 URI 发现、`az rest`、REST API |
| 架构发现与安全性 | [EVENTHOUSE-CONSUMPTION-CORE.md § 架构发现与安全性](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#schema-discovery-and-security) | 架构发现、安全性 — 工作区角色 + KQL 数据库角色 |
| 监视与诊断 | [EVENTHOUSE-CONSUMPTION-CORE.md § 监视与诊断](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#monitoring-and-diagnostics) | |
| 性能最佳实践 | [EVENTHOUSE-CONSUMPTION-CORE.md § 性能最佳实践](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#performance-best-practices) | **编写 KQL 前请先阅读** — 时间筛选器、`has` 与 `contains` 的对比 |
| 常见使用模式 | [EVENTHOUSE-CONSUMPTION-CORE.md § 常见使用模式](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#common-consumption-patterns) | 时间序列、Top-N、百分位数、动态字段 |
| 注意事项、故障排除和快速参考 | [EVENTHOUSE-CONSUMPTION-CORE.md § 注意事项、故障排除和快速参考](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#gotchas-troubleshooting-and-quick-reference) | 注意事项和故障排除（12 个问题）、快速参考：按场景划分的使用功能 |
| 表和列发现 | [discovery-queries.md § 表和列发现](references/discovery-queries.md#table-and-column-discovery) | 表发现、列统计信息 |
| 函数和视图发现 | [discovery-queries.md § 函数和视图发现](references/discovery-queries.md#function-and-view-discovery) | 函数发现、物化视图发现 |
| 策略发现 | [discovery-queries.md § 策略发现](references/discovery-queries.md#policy-discovery) | |
| 外部表和引入映射 | [discovery-queries.md § 外部表和引入映射](references/discovery-queries.md#external-tables-and-ingestion-mappings) | 外部表发现、引入映射发现 |
| 安全性发现 | [discovery-queries.md § 安全性发现](references/discovery-queries.md#security-discovery) | |
| 数据库概览脚本 | [discovery-queries.md § 数据库概览脚本](references/discovery-queries.md#database-overview-script) | |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) | |
| 连接 | [SKILL.md § 连接](#connection) | eventhouse 特定的 `az rest` 连接步骤 |
| 智能体式探索（“与我的数据对话”） | [SKILL.md § 智能体式探索](#agentic-exploration) | 数据探索请**从这里开始** |
| 运行查询 | [SKILL.md § 运行查询](#running-queries) | `az rest`、输出格式设置、导出 |
| 监视 | [SKILL.md § 监视](#monitoring) | |
| 必须 / 首选 / 避免 / 故障排除 | [SKILL.md § 必须 / 首选 / 避免 / 故障排除](#must--prefer--avoid--troubleshooting) | **必须执行 / 避免 / 首选** 检查清单 |
| 示例 | [SKILL.md § 示例](#examples) | |
| 智能体集成说明 | [SKILL.md § 智能体集成说明](#agent-integration-notes) | |

---

## 工具栈

| 工具 | 用途 | 安装 |
|---|---|---|
| **az cli** | 通过 Kusto REST API 执行 KQL 查询和管理命令；发现 Fabric 控制平面资源 | `winget install Microsoft.AzureCLI` |
| **jq** | JSON 处理和输出格式化 | `winget install jqlang.jq` |

## 连接

### 第 1 步 — 发现 KQL 数据库查询 URI

```bash
# Get workspace ID (if not known)
WS_ID=$(az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --resource "https://api.fabric.microsoft.com" \
  | jq -r '.value[] | select(.displayName=="MyWorkspace") | .id')

# List KQL Databases and get connection properties
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/kqlDatabases" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '.value[] | {name: .displayName, id: .id, queryUri: .properties.queryServiceUri, dbName: .properties.databaseName}'
```

### 第 2 步 — 设置连接变量

```bash
CLUSTER_URI="https://<cluster>.kusto.fabric.microsoft.com"
DB_NAME="MyKqlDatabase"
```

### 第 3 步 — 验证连接

> **重要提示 — 正文文件模式**：KQL 查询包含 `|`（管道）字符，这会导致 bash 和 PowerShell 中的 shell
> 转义失效。**始终将 JSON 正文写入临时文件**，并使用 `--body @<file>` 引用该文件。
> 这是所有 `az rest` KQL 调用的推荐方法。
> 在 PowerShell 上，先使用 `@{db="X";csl="..."} | ConvertTo-Json -Compress | Out-File $env:TEMP\kql_body.json -Encoding utf8NoBOM`，然后使用 `--body "@$env:TEMP\kql_body.json"`。

```bash
# Write body to temp file (avoids pipe escaping issues)
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyKqlDatabase","csl":"print Message = 'Connected successfully', Cluster = current_cluster_endpoint(), Timestamp = now()"}
EOF

az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'
```

---

## 智能体式探索

### “与我的数据对话”——发现顺序

当用户要求探索或查询 Eventhouse，但未指定表时：

```kql
Step 1 → .show tables                                    // discover tables
Step 2 → .show table <TABLE> schema as json              // understand columns + types
Step 3 → <TABLE> | take 10                               // see sample data
Step 4 → <TABLE> | summarize count() by bin(Timestamp, 1h) | render timechart  // shape of data
Step 5 → Formulate targeted query based on user's question
```

### 感知架构的查询生成

发现架构后，使用实际的列名和类型生成查询：

```kql
// Example: user asks "show me errors in the last hour"
// After discovering table "AppEvents" with columns: Timestamp, Level, Message, Source
AppEvents
| where Timestamp > ago(1h)
| where Level == "Error"
| summarize ErrorCount = count() by Source, bin(Timestamp, 5m)
| order by ErrorCount desc
```

---

## 运行查询

### 通过 `az rest`

> **始终对 `--body` 使用临时文件模式**——KQL 管道符（`|`）会破坏内联 Shell 转义。

```bash
# Run a KQL query
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":"Events | where Timestamp > ago(1h) | count"}
EOF

az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'
```

### 输出格式化

```bash
# Pretty-print results as a table with jq
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":".show tables"}
EOF

az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0] | [.Columns[].ColumnName] as $cols | .Rows[] | [$cols, .] | transpose | map({(.[0]): .[1]}) | add'

# Save results to file
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":"Events | where Timestamp > ago(1h) | summarize count() by EventType"}
EOF

az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  --output-file results.json
```

---

## 监控

```kql
// Active queries
.show queries

// Recent commands (last hour)
.show commands
| where StartedOn > ago(1h)
| project StartedOn, CommandType, Text = substring(Text, 0, 80), Duration, State
| order by StartedOn desc

// Ingestion failures (for context when data seems stale)
.show ingestion failures
| where FailedOn > ago(24h)
| summarize count() by ErrorCode
| top 5 by count_
```

---

## 必须 / 推荐 / 避免 / 故障排除

### 必须

- **始终包含时间筛选条件**——时序表中必须包含 `where Timestamp > ago(...)`。
- **查询前先了解架构**——首先运行 `.show tables` 和 `.show table T schema as json`。
- **使用 `has` 进行词项搜索**——它有索引且速度快；仅在需要搜索子字符串时才改用 `contains`。
- **验证群集 URI**——KQL 数据库 URI 因项目而异；始终通过 Fabric REST API 解析。

### 推荐

- CLI 查询会话使用 **`az rest`**；代理集成工作流使用 **Fabric KQL MCP server**。
- 尽早使用 **`project`**，在聚合前移除不需要的列。
- 当一个子表达式被多次使用时，使用 **`materialize()`**。
- 初步探索时使用 **`take 100`**；避免全表扫描。
- 时序数据使用 **`render timechart`**；分布数据使用 `render piechart`。

### 避免

- 在大型表上使用 **`contains`**——它会执行无索引的全表扫描。应使用 `has` 或 `has_cs`。
- 未先筛选两侧数据就使用 **`join`**——这会导致内存爆炸。
- 在宽表上使用等同于 **`SELECT *`** 的操作（对所有列执行 `project`）。
- 时序 `summarize` 中缺少 **`bin()`**——这会为每个唯一时间戳生成一行。
- **硬编码群集 URI**——始终通过 Fabric REST API 或环境变量解析。

### 故障排除

| 症状 | 修复方法 |
|---|---|
| `az rest` 身份验证失败 | 先运行 `az login`；确保已设置 `--resource "https://kusto.kusto.windows.net"` |
| 对有效表的查询结果为空 | 检查数据库上下文；可能需要使用 `database("name").table` |
| 查询超时 | 添加更严格的时间筛选条件；通过 `.show queries` 检查是否存在相互竞争的查询 |
| `Forbidden (403)` | 申请 KQL 数据库的 `viewer` 角色 |
| 结果被截断 | 默认限制为 50 万行；在查询前添加 `set truncationmaxrecords = N;` |
| KQL 管道符 `\|` 导致 PowerShell 或 bash 出错 | **切勿在 `--body` 中内联 KQL**。将 JSON 写入临时文件，并使用 `--body @file.json`（参见[运行查询](#running-queries)） |

---

## 示例

### 示例 1：发现并查询

```bash
# 1. Set connection variables (after discovering URI via Step 1)
CLUSTER_URI="https://<your-cluster>.kusto.fabric.microsoft.com"
DB_NAME="SalesDB"

# 2. Discover tables
cat > /tmp/kql_body.json << EOF
{"db":"${DB_NAME}","csl":".show tables"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'

# 3. Explore schema
cat > /tmp/kql_body.json << EOF
{"db":"${DB_NAME}","csl":".show table Orders schema as json"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'

# 4. Sample data
cat > /tmp/kql_body.json << EOF
{"db":"${DB_NAME}","csl":"Orders | take 10"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'
```

```kql
// 5. Analytical query (via az rest --body @file)
Orders
| where OrderDate > ago(30d)
| summarize
    TotalOrders = count(),
    TotalRevenue = sum(Amount)
    by bin(OrderDate, 1d)
| render timechart
```

### 示例 2：跨数据库查询

```kql
// Query across KQL databases in the same Eventhouse
let orders = database("SalesDB").Orders | where OrderDate > ago(7d);
let products = database("CatalogDB").Products;
orders
| join kind=inner (products) on ProductId
| summarize Revenue = sum(Amount) by ProductName
| top 10 by Revenue desc
```

### 示例 3：将结果导出到文件

```bash
# Run query and save results to JSON
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":"Events | where Timestamp > ago(1d) | summarize count() by EventType"}
EOF

az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/query" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  --output-file results.json

# Convert to CSV with jq
cat results.json \
  | jq -r '.Tables[0] | (.Columns | map(.ColumnName)), (.Rows[]) | @csv' > results.csv
```

---

## Agent 集成说明

- 此 Skill **仅支持读取**——不会创建、更改或删除数据库对象。
- 对于创作操作（表管理、引入、策略），请委托给 **eventhouse-authoring-cli**。
- 对于跨工作负载编排（Spark + SQL + KQL），请委托给 **FabricDataEngineer** Agent。
- **Fabric KQL MCP 服务器**（`mcp-setup/mcp-config-template.json` 中的 `fabric-kql`）可作为 `az rest` 的替代方案，用于 Agent 集成的查询执行。