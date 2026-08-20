---
name: eventhouse-authoring-cli
description: >
  Execute KQL management commands (table management, ingestion, policies, functions, materialized views)
  against Fabric Eventhouse and KQL Databases via CLI.
  Use when the user wants to:
    1. Create or alter KQL tables, columns, or functions
    2. Ingest data into an Eventhouse (inline, from storage, streaming)
    3. Configure retention, caching, or partitioning policies
    4. Create or manage materialized views and update policies
    5. Manage data mappings for ingestion pipelines
    6. Deploy KQL schema via scripts
  Triggers: "create kql table", "kql ingestion", "ingest into eventhouse",
  "kql function", "materialized view", "kql retention policy", "eventhouse schema",
  "kql authoring", "create eventhouse table", "kql mapping"
---
> **更新检查 — 每个会话仅一次（强制）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本次会话早些时候已执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# eventhouse-authoring-cli — 通过 CLI 创作和管理 Eventhouse

## 目录

| 任务 | 参考 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *首先阅读链接* [解析工作区/项 ID 时需要] |
| Fabric 拓扑和关键概念 | [COMMON-CORE.md § Fabric 拓扑和关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 层次结构、在 Fabric 中查找内容 |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | KQL 群集 URI、KQL 引入 URI |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；KQL 受众：`kusto.kusto.windows.net` |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 列出工作区、列出项、创建项 |
| 分页 | [COMMON-CORE.md § 分页](../../common/COMMON-CORE.md#pagination) | |
| 长时间运行的操作 (LRO) | [COMMON-CORE.md § 长时间运行的操作 (LRO)](../../common/COMMON-CORE.md#long-running-operations-lro) | |
| 速率限制与节流 | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling) | |
| OneLake 数据访问 | [COMMON-CORE.md § OneLake 数据访问](../../common/COMMON-CORE.md#onelake-data-access) | 需要 `storage.azure.com` 令牌，而非 Fabric 令牌 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) | |
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) | |
| 易错点与故障排除 | [COMMON-CORE.md § 易错点与故障排除](../../common/COMMON-CORE.md#gotchas--troubleshooting) | |
| 最佳实践 | [COMMON-CORE.md § 最佳实践](../../common/COMMON-CORE.md#best-practices) | |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传入 `--resource https://api.fabric.microsoft.com`**，否则 `az rest` 会失败 |
| 分页模式 | [COMMON-CLI.md § 分页模式](../../common/COMMON-CLI.md#pagination-pattern) | |
| 长时间运行的操作 (LRO) 模式 | [COMMON-CLI.md § 长时间运行的操作 (LRO) 模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | |
| 通过 `curl` 访问 OneLake 数据 | [COMMON-CLI.md § 通过 curl 访问 OneLake 数据](../../common/COMMON-CLI.md#onelake-data-access-via-curl) | 使用 `curl` 而非 `az rest`（令牌受众不同） |
| SQL / TDS 数据平面访问 | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) | `sqlcmd` (Go) — 不适用于 KQL，但对跨工作负载操作很有用 |
| 作业执行 (CLI) | [COMMON-CLI.md § 作业执行](../../common/COMMON-CLI.md#job-execution) | |
| OneLake 快捷方式 | [COMMON-CLI.md § OneLake 快捷方式](../../common/COMMON-CLI.md#onelake-shortcuts) | |
| 容量管理 (CLI) | [COMMON-CLI.md § 容量管理](../../common/COMMON-CLI.md#capacity-management) | |
| 组合方案 | [COMMON-CLI.md § 组合方案](../../common/COMMON-CLI.md#composite-recipes) | |
| 易错点与故障排除（CLI 特有） | [COMMON-CLI.md § 易错点与故障排除（CLI 特有）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考：`az rest` 模板 | [COMMON-CLI.md § 快速参考：az rest 模板](../../common/COMMON-CLI.md#quick-reference-az-rest-template) | |
| 快速参考：令牌受众 / CLI 工具矩阵 | [COMMON-CLI.md § 快速参考：令牌受众 ↔ CLI 工具矩阵](../../common/COMMON-CLI.md#quick-reference-token-audience--cli-tool-matrix) | 每个服务应使用的 `--resource` 和工具 |
| 创作功能矩阵 | [EVENTHOUSE-AUTHORING-CORE.md § 创作功能矩阵](../../common/EVENTHOUSE-AUTHORING-CORE.md#authoring-capability-matrix) | **首先阅读** — KQL 数据库与快捷方式（只读）的对比；连接需要 Admin/Ingestor 角色 |
| 表管理和架构演进 | [EVENTHOUSE-AUTHORING-CORE.md § 表管理和架构演进](../../common/EVENTHOUSE-AUTHORING-CORE.md#table-management-and-schema-evolution) | 创建表、创建或合并（幂等）、更改 / 重命名 / 删除、架构演进（重命名、交换/蓝绿） |
| 引入和数据映射 | [EVENTHOUSE-AUTHORING-CORE.md § 引入和数据映射](../../common/EVENTHOUSE-AUTHORING-CORE.md#ingestion-and-data-mappings) | 内联、设置或追加/替换、从存储引入、流式引入、数据映射（CSV、JSON） |
| 策略 | [EVENTHOUSE-AUTHORING-CORE.md § 策略](../../common/EVENTHOUSE-AUTHORING-CORE.md#policies) | 保留、缓存、分区、合并 |
| 具体化视图 | [EVENTHOUSE-AUTHORING-CORE.md § 具体化视图](../../common/EVENTHOUSE-AUTHORING-CORE.md#materialized-views) | 创建、更改、生命周期、支持的聚合 |
| 存储函数和更新策略 | [EVENTHOUSE-AUTHORING-CORE.md § 存储函数和更新策略](../../common/EVENTHOUSE-AUTHORING-CORE.md#stored-functions-and-update-policies) | 存储函数、更新策略（引入时自动转换） |
| 外部表 | [EVENTHOUSE-AUTHORING-CORE.md § 外部表](../../common/EVENTHOUSE-AUTHORING-CORE.md#external-tables) | OneLake / ADLS 外部表、查询外部表 |
| 权限模型 | [EVENTHOUSE-AUTHORING-CORE.md § 权限模型](../../common/EVENTHOUSE-AUTHORING-CORE.md#permission-model) | 数据库角色、授予权限 |
| 创作易错点与故障排除 | [EVENTHOUSE-AUTHORING-CORE.md § 创作易错点与故障排除参考](../../common/EVENTHOUSE-AUTHORING-CORE.md#authoring-gotchas-and-troubleshooting-reference) | 10 个带有原因和修复方法的编号问题 |
| Bash 模板 | [authoring-script-templates.md § Bash 模板](references/authoring-script-templates.md#bash-templates) | 创建表 + 引入、架构部署、导出架构、设置保留/缓存 |
| PowerShell 模板 | [authoring-script-templates.md § PowerShell 模板](references/authoring-script-templates.md#powershell-templates) | 创建表 + 引入、架构部署 |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) | |
| 连接 | [SKILL.md § 连接](#connection) | |
| 创作范围 | [SKILL.md § 创作范围](#authoring-scope) | |
| 执行 KQL 命令 | [SKILL.md § 执行 KQL 命令](#execute-kql-command) | **`az rest` 模式** — 写入 JSON 正文，然后执行 |
| 通过 CLI 管理表 | [SKILL.md § 通过 CLI 管理表](#table-management-via-cli) | 创建表、添加列、删除表 |
| 通过 CLI 引入数据 | [SKILL.md § 通过 CLI 引入数据](#data-ingestion-via-cli) | 内联、从存储引入、从 OneLake 引入、设置或追加 |
| 通过 CLI 管理策略 | [SKILL.md § 通过 CLI 管理策略](#policies-via-cli) | 保留、缓存、流式引入 |
| 通过 CLI 管理具体化视图 | [SKILL.md § 通过 CLI 管理具体化视图](#materialized-views-via-cli) | |
| 通过 CLI 管理函数和更新策略 | [SKILL.md § 通过 CLI 管理函数和更新策略](#functions-and-update-policies-via-cli) | 创建函数、创建更新策略 |
| 通过 CLI 进行架构演进 | [SKILL.md § 通过 CLI 进行架构演进](#schema-evolution-via-cli) | 安全架构部署脚本、导出当前架构 |
| 监控创作操作 | [SKILL.md § 监控创作操作](#monitoring-authoring-operations) | |
| 必须 / 推荐 / 避免 / 故障排除 | [SKILL.md § 必须 / 推荐 / 避免 / 故障排除](#must--prefer--avoid--troubleshooting) | **必须执行 / 避免 / 推荐** 检查清单 |
| 智能体工作流 | [SKILL.md § 智能体工作流](#agentic-workflows) | 创作前探索、脚本生成工作流 |
| 示例 | [SKILL.md § 示例](#examples) | |
| 智能体集成说明 | [SKILL.md § 智能体集成说明](#agent-integration-notes) | |

---

## 工具栈

| 工具 | 用途 | 安装 |
|---|---|---|
| **az cli** | 通过 Kusto REST API 执行 KQL 管理命令；发现 Fabric 控制平面资源 | `winget install Microsoft.AzureCLI` |
| **jq** | JSON 处理和输出格式化 | `winget install jqlang.jq` |

---

## 连接

与 [eventhouse-consumption-cli](../eventhouse-consumption-cli/SKILL.md#connection) 相同。创作操作需要更高权限的角色：

```bash
# Discover KQL Database query URI
WS_ID="<workspace-id>"
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/kqlDatabases" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '.value[] | {name: .displayName, queryUri: .properties.queryServiceUri}'

# Set connection variables
CLUSTER_URI="https://<cluster>.kusto.fabric.microsoft.com"
DB_NAME="MyDatabase"

# Verify admin access
cat > /tmp/kql_body.json << EOF
{"db":"${DB_NAME}","csl":".show database ${DB_NAME} principals | where Role == 'Admin'"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/mgmt" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'
```

---

## 创作范围

| 操作 | 命令模式 |
|---|---|
| 创建表 | `.create-merge table T (cols)` |
| 添加列 | `.alter-merge table T (NewCol: type)` |
| 删除表 | `.drop table T ifexists` |
| 引入数据 | `.ingest into table T (...)` |
| 设置保留策略 | `.alter table T policy retention ...` |
| 设置缓存 | `.alter table T policy caching hot = Nd` |
| 创建函数 | `.create-or-alter function F() { ... }` |
| 创建物化视图 | `.create materialized-view MV on table T { ... }` |
| 创建更新策略 | `.alter table T policy update ...` |
| 创建数据映射 | `.create table T ingestion csv mapping ...` |

---

## 执行 KQL 命令

此技能中的所有 KQL 管理命令都遵循相同的 `az rest` 模式。设置 `CLUSTER_URI` 和 `DB` 后，将 JSON 正文写入 `/tmp/kql_body.json` 并执行：

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":"<KQL management command>"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/mgmt" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq '.Tables[0].Rows'
```

> **嵌套 JSON** — 对于 KQL 中包含嵌入式 JSON（策略、映射）的命令，请使用 `<< 'EOF'`（单引号）以防止 shell 展开使用反斜杠转义的引号，并将 `${DB}` 替换为实际的数据库名称。

> **PowerShell 等效命令** — `@{db=$Database;csl=$Command} | ConvertTo-Json -Compress | Out-File $env:TEMP\kql_body.json -Encoding utf8NoBOM`，然后使用 `--body "@$env:TEMP\kql_body.json"`。请参阅 [PowerShell 模板](references/authoring-script-templates.md#powershell-templates)。

---

## 通过 CLI 管理表

### 创建表（幂等）

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".create-merge table Events (Timestamp: datetime, EventType: string, UserId: string, Properties: dynamic, Duration: real)"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 添加列

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".alter-merge table Events (Region: string)"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 删除表

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".drop table Events ifexists"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

---

## 通过 CLI 引入数据

### 内联引入（测试）

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".ingest inline into table Events <| 2025-01-15T10:00:00Z,Login,user1,{},0.5\n2025-01-15T10:01:00Z,Click,user2,{},0.2"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 从存储引入

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".ingest into table Events (h'https://mystorage.blob.core.windows.net/data/events.csv.gz;impersonate') with (format='csv', ingestionMappingReference='EventsCsvMapping', ignoreFirstRecord=true)"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 从 OneLake 引入

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".ingest into table Events (h'abfss://workspace@onelake.dfs.fabric.microsoft.com/lakehouse.Lakehouse/Files/events.parquet;impersonate') with (format='parquet')"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 根据查询设置或追加数据

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".set-or-append CleanEvents <| RawEvents | where IsValid == true | project Timestamp, EventType, UserId"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

---

## 通过 CLI 管理策略

### 保留期

```bash
# Set 365-day retention
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":".alter table Events policy retention '{\"SoftDeletePeriod\":\"365.00:00:00\",\"Recoverability\":\"Enabled\"}'"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 缓存（热缓存）

```bash
# Keep last 30 days in hot cache
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".alter table Events policy caching hot = 30d"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 流式引入

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".alter table Events policy streamingingestion enable"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

---

## 通过 CLI 管理物化视图

```bash
# Create materialized view with backfill
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".create materialized-view with (backfill=true) HourlyEventCounts on table Events { Events | summarize Count = count(), LastSeen = max(Timestamp) by EventType, bin(Timestamp, 1h) }"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

```bash
# Check health
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".show materialized-view HourlyEventCounts statistics"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

---

## 通过 CLI 管理函数和更新策略

### 创建函数

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".create-or-alter function with (docstring='Parse raw events', folder='ETL') ParseRawEvents() { RawEvents | extend Parsed = parse_json(RawData) | project Timestamp = todatetime(Parsed.timestamp), EventType = tostring(Parsed.eventType), UserId = tostring(Parsed.userId) }"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 创建更新策略

```bash
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":".alter table ParsedEvents policy update @'[{\"IsEnabled\":true,\"Source\":\"RawEvents\",\"Query\":\"ParseRawEvents()\",\"IsTransactional\":true}]'"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

---

## 通过 CLI 进行架构演进

### 安全的架构部署脚本

将管理命令保存在 `.kql` 文件中（每行一条），然后通过 `az rest` 执行每条命令：

```bash
# deploy_schema.kql contains one command per line:
# .create-merge table Events (Timestamp: datetime, EventType: string, UserId: string, Properties: dynamic)
# .create-merge table ParsedEvents (Timestamp: datetime, EventType: string, UserId: string, PageName: string)
# .alter table Events policy retention '{\"SoftDeletePeriod\":\"365.00:00:00\",\"Recoverability\":\"Enabled\"}'
# .alter table Events policy caching hot = 30d

# Execute each command from the file (see "Execute KQL Command" section)
while IFS= read -r cmd; do
  [[ "$cmd" =~ ^// ]] && continue   # skip comment lines
  [[ -z "$cmd" ]] && continue        # skip blank lines
  cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":"${cmd}"}
EOF
  az rest --method POST \
    --url "${CLUSTER_URI}/v1/rest/mgmt" \
    --resource "https://kusto.kusto.windows.net" \
    --headers "Content-Type=application/json" \
    --body @/tmp/kql_body.json \
    | jq '.Tables[0].Rows'
done < deploy_schema.kql
```

### 导出当前架构

```bash
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".show database ${DB} schema as csl script"}
EOF
az rest --method POST \
  --url "${CLUSTER_URI}/v1/rest/mgmt" \
  --resource "https://kusto.kusto.windows.net" \
  --headers "Content-Type=application/json" \
  --body @/tmp/kql_body.json \
  | jq -r '.Tables[0].Rows[][0]' > current_schema.kql
```

---

## 监控创作操作

```kql
// Recent management commands
.show commands
| where StartedOn > ago(1h)
| project StartedOn, CommandType, Text = substring(Text, 0, 100), State, Duration
| order by StartedOn desc

// Ingestion failures
.show ingestion failures
| where FailedOn > ago(24h)
| summarize FailureCount = count() by ErrorCode, Table
| order by FailureCount desc

// Materialized view health
.show materialized-views
| project Name, IsEnabled, IsHealthy, MaterializedTo
```

---

## 必须 / 推荐 / 避免 / 故障排除

### 必须

- **遇到含糊的提示时，先澄清再操作** — 如果请求未指定目标表、操作类型或架构（例如“设置我的 Eventhouse”“配置我的数据库”），应询问用户想要执行什么操作。切勿自行推断意图并自主应用管理命令。产生不可逆副作用的操作（策略更改、架构变更、数据引入）需要用户明确表达意图。
- **使用幂等命令** — `.create-merge table`、`.create-or-alter function`、`.create table ifnotexists`。
- **在编写之前验证权限** — 必须具有 `Admin` 或 `Ingestor` 角色。
- **测试更新策略** — 在附加函数之前，先独立运行该函数。
- 从 OneLake 或 Blob Storage 引入数据时，**在存储 URI 中包含 `impersonate`**。

### 推荐

- 使用**带循环的 `az rest`**部署包含多条命令的架构文件。
- 对于集成代理的数据引入和管理工作流，使用 **Fabric KQL MCP server**。
- 优先使用 **`.create-merge table`**，而不是 `.create table`，以便安全地演进架构。
- 对于重复执行的高开销聚合查询，优先使用**物化视图**。
- **基于脚本的 CI/CD** — 使用 `.show database DB schema as csl script` 导出架构，并存储在 git 中。

### 避免

- 不带 `ifexists` 使用 **`.drop table`** — 当表不存在时会失败。
- 使用 **`.alter table`** 添加列 — 应改用 `.alter-merge table`（仅限增量添加）。
- 对 CSV/JSON **不使用映射就引入数据** — 列顺序或字段名称可能不匹配。
- **硬编码存储 URI** — 应在脚本中将其参数化。
- 在不了解重新回填成本的情况下**禁用物化视图**。

### 故障排除

| 症状 | 修复方法 |
|---|---|
| `.create table` 失败并提示“already exists” | 使用 `.create-merge table` 或 `.create table ifnotexists` |
| 数据引入成功，但表为空 | 检查数据映射：`.show table T ingestion csv mappings` |
| 更新策略未触发 | 验证函数能否独立运行；检查 `.show table T policy update` |
| 管理命令返回 `Forbidden (403)` | 申请 `admin` 或 `ingestor` 数据库角色 |
| 物化视图卡住 | 检查 `.show materialized-view MV statistics`；可能需要执行 `.disable`/`.enable` |
| OneLake 数据引入身份验证错误 | 将 `;impersonate` 添加到 `abfss://` URI |

---

## 代理式工作流

### 编写前的探索

执行任何操作之前，始终检查是否存在明确意图：

```text
Step 0 → Is the request specific? Does it name a table, operation, and/or schema?
         → NO  → Ask: "What would you like to set up? Options: create tables,
                  configure policies, set up ingestion mappings, create materialized views."
                  STOP — do not proceed until user specifies.
         → YES → Continue to Step 1.
Step 1 → .show tables details                        // what exists?
Step 2 → .show table <TABLE> schema as json          // current columns
Step 3 → .show table <TABLE> policy retention        // current policies
Step 4 → Plan changes (create-merge, alter, etc.)
Step 5 → Execute changes
Step 6 → Verify: .show table <TABLE> schema as json  // confirm changes
```

### 脚本生成工作流

```text
Step 1 → Understand requirements from user
Step 2 → Generate KQL management commands
Step 3 → Save to .kql file
Step 4 → Deploy via az rest (one command at a time)
Step 5 → Verify deployed state matches intent
```

---

## 示例

### 示例 1：创建包含策略和映射的表

```bash
# Create table
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".create-merge table SensorData (Timestamp: datetime, DeviceId: string, Temperature: real, Humidity: real, Location: dynamic)"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

```bash
# Set retention
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":".alter table SensorData policy retention '{\"SoftDeletePeriod\":\"90.00:00:00\",\"Recoverability\":\"Enabled\"}'"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

```bash
# Set caching
cat > /tmp/kql_body.json << EOF
{"db":"${DB}","csl":".alter table SensorData policy caching hot = 7d"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

```bash
# Create JSON mapping
cat > /tmp/kql_body.json << 'EOF'
{"db":"MyDB","csl":".create table SensorData ingestion json mapping 'SensorJsonMapping' '[{\"column\":\"Timestamp\",\"path\":\"$.ts\",\"datatype\":\"datetime\"},{\"column\":\"DeviceId\",\"path\":\"$.deviceId\",\"datatype\":\"string\"},{\"column\":\"Temperature\",\"path\":\"$.temp\",\"datatype\":\"real\"},{\"column\":\"Humidity\",\"path\":\"$.humidity\",\"datatype\":\"real\"},{\"column\":\"Location\",\"path\":\"$.location\",\"datatype\":\"dynamic\"}]'"}
EOF
```

> 执行 `/tmp/kql_body.json` — 请参阅[执行 KQL 命令](#execute-kql-command)

### 示例 2：使用更新策略进行 ETL

```kql
// 1. Target table
.create-merge table ParsedLogs (Timestamp: datetime, Level: string, Message: string, Source: string)

// 2. Transform function
.create-or-alter function ParseRawLogs() {
    RawLogs
    | extend J = parse_json(RawMessage)
    | project
        Timestamp = todatetime(J.timestamp),
        Level = tostring(J.level),
        Message = tostring(J.message),
        Source = tostring(J.source)
}

// 3. Attach update policy
.alter table ParsedLogs policy update
@'[{"IsEnabled":true,"Source":"RawLogs","Query":"ParseRawLogs()","IsTransactional":true}]'
```

---

## Agent 集成说明

- 此 Skill 涵盖**创作操作**——创建/更改数据库对象以及引入数据。
- 对于**只读查询**和数据探索，请委托给 **eventhouse-consumption-cli**。
- 对于**跨工作负载编排**，请委托给 **FabricDataEngineer** Agent。
- 所有管理命令都需要提升后的数据库角色（`Admin` 或 `Ingestor`）。