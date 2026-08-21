---
name: sqldb-consumption-cli
description: >
  Query SQL database in Fabric via sqlcmd: interactive exploration, vector similarity, JSON, temporal queries,
  and security policy inspection on the OLTP and SQL analytics endpoints. For schema changes see the sqldb-authoring-cli skill.
  Triggers: "sql database in Fabric query sys.tables sqlcmd",
  "sql database in Fabric system view list user tables sqlcmd",
  "list user tables sqldb", "sys.tables sqldb", "explore sqldb schema",
  "vector similarity sqldb", "RAG embedding sqldb", "row level security sqldb inspect",
  "audit log sqldb inspect", "chat with sqldb", "export sqldb rows",
  "temporal as of sqldb", "json openrowset sqldb".
---
> **更新检查——每个会话仅一次（强制）**
> 每个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程的 package.json 版本。
> - 如果本次会话之前已执行过检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：先列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：先列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# SQL 数据库使用——CLI 技能

使用 `sqlcmd` 和 `az rest` 查询 **Fabric 中的 SQL 数据库**及其 **SQL 分析终结点**。支持交互式探索、跨数据库联接、向量 / AI-RAG 模式、JSON、时态查询和安全检查。

> **只读技能——拒绝写入。** 这是一个使用（只读）技能。你**不得**执行任何修改数据或架构的语句——`INSERT`、`UPDATE`、`DELETE`、`MERGE`、`TRUNCATE` 或任何 DDL（`CREATE` / `ALTER` / `DROP`）。如果用户要求更改数据或架构，**不要执行**。应告知用户这是一个只读技能，并将请求转交给 **[sqldb-authoring-cli](../sqldb-authoring-cli/SKILL.md)**。仅依赖数据库权限并不足够——必须在技能层面拒绝写入操作。

## 目录

| 主题 | 参考资料 |
|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)——**请先阅读** |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition)和 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes) |
| SQL / TDS 数据平面访问（sqlcmd） | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) |
| CLI 注意事项（受众、转义、过期） | [COMMON-CLI.md § 注意事项和故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) |
| **终结点选择**（OLTP 与分析） | [SQLDB-CONSUMPTION-CORE.md § 终结点选择](../../common/SQLDB-CONSUMPTION-CORE.md#endpoint-selection)——**请先阅读** |
| **支持的 T-SQL、跨数据库、JSON、向量/RAG、元数据、安全性、最佳实践、注意事项、快速参考** | [SQLDB-CONSUMPTION-CORE.md](../../common/SQLDB-CONSUMPTION-CORE.md)（所有章节） |
| 时态表 / 数据虚拟化 | [SQLDB-AUTHORING-CORE.md § 时态表](../../common/SQLDB-AUTHORING-CORE.md#temporal-tables-system-versioned)、[§ 数据虚拟化](../../common/SQLDB-AUTHORING-CORE.md#data-virtualization-external-tables-and-openrowset) |
| 限制参考（镜像、不受支持的功能、资源限制） | [SQLDB-AUTHORING-CORE.md § 限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference) |
| 发现查询（架构、表、索引、安全性、设置、会话） | [references/discovery-queries.md](references/discovery-queries.md) |
| **深度性能诊断** | [sqldb-operations-cli](../sqldb-operations-cli/SKILL.md) |

有关 Fabric 拓扑、容量、OneLake、身份验证、控制平面 REST 和作业，请参阅 [COMMON-CORE.md](../../common/COMMON-CORE.md) 和 [COMMON-CLI.md](../../common/COMMON-CLI.md)。

---

## 工具栈

先决条件、安装以及 CLI 身份验证/设置相关内容位于 [COMMON-CLI.md](../../common/COMMON-CLI.md)。运行本技能中的命令之前，请先使用该指南。

| 工具 | 作用 |
|---|---|
| `sqlcmd` (Go) | **主要工具**：执行 T-SQL 查询。它是独立的二进制文件，无需 ODBC 驱动程序，并通过 `DefaultAzureCredential` 提供内置的 Entra ID 身份验证。 |
| `az` CLI | 使用 Fabric REST 进行终结点发现以及本技能引用的相关控制平面查找。 |
| `jq` | 解析 `az rest` 和相关 CLI 输出返回的 JSON。 |

---

## 连接

### 发现 SQL 数据库终结点

有关工作区/项解析、终结点发现以及共享的 `sqlcmd` 连接指南，请参阅：

- [COMMON-CLI.md](../../common/COMMON-CLI.md)：用于查找工作区/项和解析终结点详细信息
- [COMMON-CORE.md](../../common/COMMON-CORE.md)：用于获取共享的 CLI/身份验证/连接指南

> **存在两个终结点** — 请参阅 [SQLDB-CONSUMPTION-CORE.md](../../common/SQLDB-CONSUMPTION-CORE.md) 中的“终结点选择”：
> - **SQL 数据库终结点** (OLTP)：实时事务数据、向量搜索、存储过程。
> - **SQL 分析终结点**：复制的只读数据、跨数据库查询、BI。

### 连接指南

有关 `sqlcmd` 连接设置、身份验证模式、连接字符串模式以及 CI/CD 身份验证示例，请使用 `common/COMMON-CLI.md` 中的共享指南，而不要将设置模板复制到本技能中。

对于本技能中特定于 SQLDB 的使用场景，假定以下连接输入已知：
- `serverFqdn`
- `databaseName`

```bash
# One-shot query against the discovered SQL database
sqlcmd <connection/auth args from common/COMMON-CLI.md> \
  -Q "SELECT TOP 10 * FROM dbo.Orders"

# Run a saved query file for sqldb exploration
sqlcmd <connection/auth args from common/COMMON-CLI.md> \
  -i my_query.sql
```

---

## 智能体式探索（“与我的数据聊天”）

### 架构发现顺序

按顺序运行以下命令，以了解数据库中的内容。有关扩展的发现查询，请参阅 [discovery-queries.md](references/discovery-queries.md)。

```bash
# 1. List schemas
$SQLCMD -Q "SELECT schema_name FROM information_schema.schemata ORDER BY schema_name" -W

# 2. List tables with row counts
$SQLCMD -Q "SELECT s.name AS [schema], t.name AS [table], SUM(p.rows) AS row_count FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id JOIN sys.partitions p ON t.object_id=p.object_id AND p.index_id IN (0,1) GROUP BY s.name, t.name ORDER BY s.name, t.name" -W

# 3. Columns for a table
$SQLCMD -Q "SELECT column_name, data_type, character_maximum_length, is_nullable, column_default FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Orders' ORDER BY ordinal_position" -W

# 4. Preview rows
$SQLCMD -Q "SELECT TOP 5 * FROM dbo.Orders" -W

# 5. Constraints (PK, FK, UNIQUE, CHECK)
$SQLCMD -Q "SELECT tc.constraint_name, tc.constraint_type, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name WHERE tc.table_schema='dbo' AND tc.table_name='Orders' ORDER BY tc.constraint_type" -W

# 6. Indexes
$SQLCMD -Q "SELECT i.name, i.type_desc, STRING_AGG(c.name,', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS cols FROM sys.indexes i JOIN sys.index_columns ic ON i.object_id=ic.object_id AND i.index_id=ic.index_id JOIN sys.columns c ON ic.object_id=c.object_id AND ic.column_id=c.column_id WHERE i.object_id=OBJECT_ID('dbo.Orders') GROUP BY i.name, i.type_desc" -W

# 7. Programmability objects (views, functions, procedures, triggers)
$SQLCMD -Q "SELECT name, type_desc FROM sys.objects WHERE type IN ('V','FN','IF','P','TF','TR') ORDER BY type_desc, name" -W
```

### 智能体工作流

1. **发现** → 执行步骤 1–7，了解可用的表和列。
2. **采样** → 对相关表执行 `SELECT TOP 5`。
3. **构建** → 使用 [SQLDB-CONSUMPTION-CORE.md](../../common/SQLDB-CONSUMPTION-CORE.md) 中支持的 T-SQL 范围编写 T-SQL。支持大多数 Azure SQL 语法（时态查询、JSON、数据虚拟化、IQP）。查看“避免”部分以了解例外情况（`EXECUTE AS`、CDC、Always Encrypted 不可用）。
4. **执行** → `$SQLCMD -Q "..."`。
5. **迭代** → 根据结果进行优化。
6. **呈现** → 显示结果或生成可复用脚本。

---

## 注意事项、规则与故障排除

有关完整的使用注意事项，请参阅：[SQLDB-CONSUMPTION-CORE.md](../../common/SQLDB-CONSUMPTION-CORE.md) 注意事项与故障排除参考。
有关 CLI 特有的问题，请参阅：[COMMON-CLI.md](../../common/COMMON-CLI.md) 注意事项与故障排除（CLI 特有）。

### 必须执行

- **拒绝所有写入操作** — 这是一个只读 Skill。切勿运行 `INSERT` / `UPDATE` / `DELETE` / `MERGE` / `TRUNCATE` 或任何 DDL（`CREATE` / `ALTER` / `DROP`）。告知用户该 Skill 为只读，并将写入/架构请求引导至 [sqldb-authoring-cli](../sqldb-authoring-cli/SKILL.md)。
- **始终使用 `-d <DatabaseName>`** — 仅使用 FQDN 并不足够。
- **始终使用 `-G` 或 `--authentication-method`** — Fabric 不支持 SQL 身份验证。
- **首先遵循 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的身份验证指导** — 将 Microsoft Entra / CLI 身份验证先决条件集中保留在该文档中，而不是在此处重复 `az` 登录步骤。
- **跨数据库查询应使用 SQL 分析终结点** — 三部分名称在 OLTP 终结点上无效。
- **遵守 RLS** — 以最终用户身份进行查询，以测试行级安全策略。
- **在脚本中使用 `SET NOCOUNT ON;`** — 抑制会破坏输出的行数消息。

### 避免

- **ODBC sqlcmd** — 使用 Go 版本。
- **在脚本中省略 `-W`** — 尾随空格会破坏 CSV。
- **在 OLTP 终结点上执行繁重的分析查询** — 使用 SQL 分析终结点。
- **在 SQL 分析终结点上执行 DML** — 该终结点为只读。
- **MARS / `CREATE LOGIN` / SQL 身份验证 / `EXECUTE AS`** — 不受支持。
- **`CONTAINS` / `FREETEXT`** — 全文搜索仅为预览功能；请使用 `LIKE`、`CHARINDEX` 或向量搜索。
- **假设 SQL 分析终结点会镜像所有内容** — RLS/DDM/OLS、`vector`/`json` 列、计算列、视图、存储过程和函数均不会传播。请参阅[限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference)和[镜像注意事项](../../common/SQLDB-AUTHORING-CORE.md#mirroring-considerations)。
- **硬编码 FQDN** — 通过 REST API 发现。

### 优先选择

- 对 SQL 查询，优先使用 **`sqlcmd (Go) -G`**，而非 curl+token。
- 在智能体场景中使用 **`-Q`**（非交互式退出）。
- 对繁重的聚合和 BI 查询使用 **SQL 分析终结点**（避免影响 OLTP）。注意：最多镜像 1000 个表；RLS/DDM/OLS 不会传播；`vector`/`json` 列会被排除。
- 对向量搜索、存储过程、时态查询以及任何需要强制实施安全策略的数据使用 **SQL 数据库终结点**。
- 使用**时态查询**（`FOR SYSTEM_TIME AS OF`）进行时间点分析和审计。
- 使用 **OPENROWSET / 外部表**查询 OneLake 文件，无需导入。
- 使用 **FOR JSON PATH** 将结果导出为 JSON；使用 **OPENJSON** 解析 JSON 列。
- 使用 **Copilot** — 使用 `--` 注释引导代码补全；使用聊天窗格将自然语言转换为 SQL。
- 对多语句批处理或包含引号的查询使用**管道输入**。
- 对复杂查询使用 **`-i file.sql`** — 避免 shell 转义。
- 使用 **`-F vertical`** 探索宽表。
- 使用**环境变量**（`FABRIC_SERVER`、`FABRIC_DB`）实现脚本复用。

### 故障排除

| 症状 | 原因 | 修复方法 |
|---|---|---|
| `Login failed for user` | 数据库名称错误或没有访问权限 | 验证 `-d` 是否与 REST `properties.databaseName` 值匹配（参见 COMMON-CLI.md 中的“通过 REST 发现连接参数”），并确认你拥有相应权限 |
| `Cannot open server` | FQDN 错误或网络问题 | 通过 REST API 重新发现；检查端口 1433 |
| `Login timeout expired` | 端口 1433 被阻止 | `nc -zv <endpoint>.database.fabric.microsoft.com 1433`；检查防火墙/VPN |
| `ActiveDirectoryDefault` 失败 | `az login` 已过期或租户错误 | 使用 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的 Azure CLI 故障排除/身份验证指南重新进行身份验证 |
| 跨数据库查询失败 | 使用了 OLTP 终结点 | 切换到 SQL 分析终结点以使用三部分命名 |
| 分析终结点中的数据似乎已过时 | 镜像复制延迟 | 等待复制完成；通过 `sys.dm_change_feed_log_scan_sessions` 检查状态 |
| 分析终结点中缺少表 | 表超出 1000 个表的镜像限制、具有不受支持的 PK 类型，或使用 CCI/内存中功能/Always Encrypted | 检查 `sys.dm_change_feed_errors`；参见[镜像限制](https://learn.microsoft.com/en-us/fabric/database/sql/mirroring-limitations) |
| 分析终结点中缺少列 | 计算列，或不受支持的类型（image、text、xml、sql_variant、geometry、geography、hierarchyid、vector、json） | 通过 OLTP 终结点查询这些列 |
| 分析终结点上的 LOB 数据被截断 | OneLake 中超过 1 MB 的 LOB 列会被截断 | 通过 OLTP 终结点查询完整的 LOB 数据 |
| 分析终结点上的 datetime2(7) 精度损失 | Delta Lake 仅支持 6 位精度 | 第 7 位小数会被截去；如果精度至关重要，请使用 OLTP 终结点 |
| 分析终结点上未强制实施 RLS/DDM | 安全策略未传播到 OneLake | 通过 OLTP 终结点查询以强制实施安全策略 |
| 向量搜索未返回结果 | NULL 嵌入或维度不匹配 | 验证 `WHERE Embedding IS NOT NULL`；检查维度 |
| RLS 未按预期进行筛选 | 安全谓词或用户上下文错误 | 检查 `USER_NAME()` 值；使用 `sys.security_policies` 验证策略 |
| `sys.fn_get_audit_file_v2` 未返回任何行 | 未启用审核 | 通过 REST API（`PATCH .../settings/sqlAudit`）或 Fabric 门户启用审核 |
| CSV 输出乱码 | 缺少 `-W` 或 `-s` 错误 | 添加 `-W -s"," -w 4000` |
| 文件中出现 `(N rows affected)` | 没有 `SET NOCOUNT ON` | 在前面添加 `SET NOCOUNT ON;` |
| 找不到 `sqlcmd` | 未安装 `sqlcmd`，或它不在 `PATH` 中 | 有关 `sqlcmd` 的安装和设置指南，请参见 `common/COMMON-CLI.md` |
| 重定向时出现 `Login timeout expired` | 连接策略要求开放端口 11000–11999 | 除 1433 之外，还需允许通过端口 11000–11999 出站连接到 Azure SQL IP |