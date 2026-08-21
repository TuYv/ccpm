---
name: sqldb-authoring-cli
description: >
  Create and manage SQL database in Fabric items, author T-SQL DDL/DML with constraints, foreign keys, triggers,
  indexes, and vector columns. Deploy schema via SqlPackage (.dacpac/.bacpac), configure source control,
  CI/CD, and GraphQL APIs.
  Triggers: "sql database in Fabric create table sqlcmd ddl",
  "sql database in Fabric primary key default getdate sqlcmd",
  "create sqldb item", "create table sqldb ddl", "sqldb foreign key constraint",
  "sqldb stored procedure", "sqldb trigger create", "sqldb vector column",
  "SqlPackage dacpac deploy sqldb", "bacpac sqldb", "sqldb source control",
  "graphql api sqldb", "sqldb collation set", "sp_invoke_external_rest_endpoint".
---
> **更新检查 — 每个会话一次（强制）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程的 package.json 版本。
> - 如果本会话早些时候已执行过检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# SQL 数据库编写 — CLI 技能

创建和管理 **Fabric 中的 SQL 数据库**项、编写 T-SQL DDL/DML、通过 SqlPackage 部署架构，并使用 `sqlcmd` 和 `az rest` 配置源代码管理、CI/CD 和 GraphQL API。

## 目录

| 主题 | 参考资料 |
|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) — **请先阅读** |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition)和[COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) |
| SQL / TDS 数据平面访问（sqlcmd） | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) |
| CLI 注意事项（受众、转义、过期） | [COMMON-CLI.md § 注意事项和故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) |
| SQL 数据库项定义（`dacpac`/`sqlproj`） | [ITEM-DEFINITIONS-CORE.md § 各项类型的定义](../../common/ITEM-DEFINITIONS-CORE.md#per-item-type-definitions) |
| **SQL 数据库与数据仓库功能矩阵** | [SQLDB-AUTHORING-CORE.md § SQL 数据库与数据仓库](../../common/SQLDB-AUTHORING-CORE.md#sql-database-vs-data-warehouse--authoring-capability-matrix) |
| **数据库生命周期、表 DDL、时态表、视图、DML、BCP、存储过程/函数/触发器、SqlPackage、源代码管理、GraphQL、镜像、审核、CMK、权限、注意事项、模式、决策指南** | [SQLDB-AUTHORING-CORE.md](../../common/SQLDB-AUTHORING-CORE.md)（所有章节） |
| T-SQL 反模式 | [SQLDB-AUTHORING-CORE.md § T-SQL 反模式](../../common/SQLDB-AUTHORING-CORE.md#t-sql-anti-patterns) |
| 架构设计指南 | [SQLDB-AUTHORING-CORE.md § 架构设计指南](../../common/SQLDB-AUTHORING-CORE.md#schema-design-guidance) |
| **限制参考**（不支持的功能、资源限制） | [SQLDB-AUTHORING-CORE.md § 限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference) |
| 终结点选择 | [SQLDB-CONSUMPTION-CORE.md § 终结点选择](../../common/SQLDB-CONSUMPTION-CORE.md#endpoint-selection) |
| 元数据和架构发现 | [SQLDB-CONSUMPTION-CORE.md § 元数据和架构发现](../../common/SQLDB-CONSUMPTION-CORE.md#metadata-and-schema-discovery) |
| 深度性能诊断 | [sqldb-operations-cli](../sqldb-operations-cli/SKILL.md) |

有关 Fabric 拓扑、容量、OneLake、身份验证、控制平面 REST 和作业，请参阅 [COMMON-CORE.md](../../common/COMMON-CORE.md) 和 [COMMON-CLI.md](../../common/COMMON-CLI.md)。

---

## 工具栈

| 工具 | 作用 | 设置参考 |
|---|---|---|
| `sqlcmd` (Go) | **主要工具**：执行 DDL/DML T-SQL。独立二进制文件，无需 ODBC，内置 Entra ID 身份验证。 | 有关安装和身份验证的先决条件，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。 |
| `sqlpackage` | 架构部署（.dacpac）、数据库可移植性（.bacpac）。 | 有关安装和环境设置的先决条件，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。 |
| `az` CLI | 用于终结点发现和数据库创建的 Fabric REST。 | 有关 Azure CLI 身份验证和令牌设置，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。 |
| `jq` | 解析来自 `az rest` 的 JSON。 | 有关共享 CLI/工具的先决条件，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。 |

> **智能体检查** — 在执行首次操作之前，请按照 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的共享设置指南，确认所需的 CLI 工具和身份验证均已配置。不要在此技能中重复安装或 `az login` 步骤。

---

## 连接

### 发现 SQL 数据库 TDS 终结点

对于工作区/项解析、SQL 数据库终结点发现和 CLI 连接模式，请使用 `common/COMMON-CLI.md` 和 `common/COMMON-CORE.md` 中的共享指南，而不要在此处嵌入 `az rest` 或 `sqlcmd` 操作步骤。

> 按照 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的 SQL 数据库终结点发现步骤操作，然后将发现的服务器 FQDN 和数据库名称带回此技能，以执行 SQLDB 特定的创作和部署任务。

- 使用 Fabric 为目标项返回的 SQL 数据库终结点值；不要硬编码终结点域名或数据库名称。
- 生成部署或创作步骤时，将连接详细信息视为通过共享通用指南发现的输入。
- 此技能应侧重于架构创作、DDL/DML 设计、约束、索引、源代码控制、SqlPackage 部署和 GraphQL/API 行为，而不是连接引导。

### 连接指南

如果用户需要有关交互式连接或从 CI/CD 连接的帮助，请引导他们参阅 `common/COMMON-CLI.md`，以了解共享的 `sqlcmd` 设置、身份验证和调用模式。

对于此技能中 SQLDB 特定的创作任务，假定以下连接输入已知：
- `serverFqdn`
- `databaseName`

---

## 智能体工作流

### 创作前的架构发现

在执行任何写入操作之前，请发现目标架构：

```bash
# 1. List tables
$SQLCMD -Q "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' ORDER BY 1,2" -W

# 2. Check columns
$SQLCMD -Q "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='Orders' ORDER BY ordinal_position" -W

# 3. Sample data
$SQLCMD -Q "SELECT TOP 5 * FROM dbo.Orders" -W

# 4. Check constraints
$SQLCMD -Q "SELECT tc.constraint_name, tc.constraint_type, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name WHERE tc.table_name='Orders' ORDER BY tc.constraint_type" -W

# 5. Check indexes
$SQLCMD -Q "SELECT i.name, i.type_desc, STRING_AGG(c.name,', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS cols FROM sys.indexes i JOIN sys.index_columns ic ON i.object_id=ic.object_id AND i.index_id=ic.index_id JOIN sys.columns c ON ic.object_id=c.object_id AND ic.column_id=c.column_id WHERE i.object_id=OBJECT_ID('dbo.Orders') GROUP BY i.name, i.type_desc" -W

# 6. Row counts
$SQLCMD -Q "SELECT s.name AS [schema], t.name AS [table], SUM(p.rows) AS row_count FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id JOIN sys.partitions p ON t.object_id=p.object_id AND p.index_id IN (0,1) GROUP BY s.name, t.name ORDER BY row_count DESC" -W

# 7. Programmability objects
$SQLCMD -Q "SELECT name, type_desc FROM sys.objects WHERE type IN ('V','FN','IF','P','TF','TR') ORDER BY type_desc, name" -W
```

### 工作流

1. **发现** → 运行步骤 1–5，了解可用的表/列。
2. **采样** → 对相关表执行 `SELECT TOP 5`。
3. **构建** → 从 [SQLDB-AUTHORING-CORE.md](../../common/SQLDB-AUTHORING-CORE.md) 中选择模式（表 DDL、时态表、数据虚拟化、视图、DML 等）。
4. **执行** → 使用 `$SQLCMD -Q "..."`，或针对多语句使用 `$SQLCMD -i file.sql`。
5. **验证** → 查询受影响的表（`SELECT COUNT(*)`、`SELECT TOP 5`）。
6. **部署（可选）** → 使用 `sqlpackage /Action:Extract` 提取 .dacpac；设置源代码管理。

---

## 注意事项、规则与故障排除

有关完整的编写注意事项，请参阅：[SQLDB-AUTHORING-CORE.md](../../common/SQLDB-AUTHORING-CORE.md) 中的编写注意事项与故障排除。
有关 CLI 特有的问题，请参阅：[COMMON-CLI.md](../../common/COMMON-CLI.md) 中的注意事项与故障排除（CLI 特有）。

### 必须执行

- **创建数据库前，验证工作区是否有容量** — 调用 `GET /v1/workspaces/{id}` 并检查 `capacityId`。
- **始终使用 `-d <DatabaseName>`** — 仅提供 FQDN 是不够的。
- **始终使用 `-G` 或 `--authentication-method`** — Fabric 不支持 SQL 身份验证。
- **首先遵循 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的身份验证指南** — `ActiveDirectoryDefault` 依赖于已通过身份验证的 CLI 会话。
- **创建时指定排序规则** — 数据库创建后无法更改。
- **使用 SqlPackage 实现可重复部署** — 提取 .dacpac → 发布以进行增量架构更改。
- **对多语句批处理使用 `-i file.sql`**（CREATE PROCEDURE、包含 GO 分隔符的事务）。
- **在脚本中使用 `SET NOCOUNT ON;`** — 抑制会破坏输出的行数消息。

### 避免

- **ODBC sqlcmd**（`/opt/mssql-tools/bin/sqlcmd`）— 使用 Go 版本。
- **在脚本中省略 `-W`** — 尾随空格会破坏 CSV。
- **硬编码 FQDN** — 通过 REST API 发现。
- **MARS** — 不受支持。移除 `MultipleActiveResultSets`。
- **`CREATE LOGIN` / SQL 身份验证** — 仅支持 Entra 用户。
- **镜像处于活动状态时，修改带有 CCI 的表或执行 `ALTER INDEX ALL`** — 停止镜像或逐个修改索引。
- **在必须镜像的表上使用 `vector` / `json` 列** — 无法镜像到 OneLake。
- **数据库名/列名中使用特殊字符** — 请参阅[限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference)。
- **修改受源代码管理的存储库中的 `.sqlproj`** — 下次同步时会被重置。
- **不受支持的功能**（CDC、Always Encrypted、内存中功能、账本、全文搜索 GA、分区 SWITCH、`EXECUTE AS`、将 `hierarchyid`/`sql_variant`/`timestamp` 用作主键、CTAS、COPY INTO）— 完整列表请参阅[限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference)。
- **超出资源限制**（32 个 vCore、4 TB、1024 GB tempdb、每个工作区 150 个数据库）。

### 首选

- **使用 `az rest` 创建数据库，而不是通过门户创建** — 可编写脚本且可重复执行。
- **使用 SqlPackage 发布 (.dacpac)**，而不是使用手动 DDL 进行架构演进 — 可跟踪增量更改。
- **强制约束**（PK、FK、CHECK、DEFAULT）— 与 DW 不同，SQL Database 完全支持这些约束。
- **使用时态表**实现审计跟踪和渐变维度 — 提供完整的系统版本控制。注意：历史记录表不包含在镜像中。
- **使用数据虚拟化**（外部表 / OPENROWSET），无需 ETL 即可查询 OneLake。注意：外部表本身不会被镜像。
- **使用 `INSERT ... SELECT`** 在数据库内批量移动数据。
- **使用 BCP** 进行高性能批量导入/导出。
- **使用原生 AI 函数 / sp_invoke_external_rest_endpoint** 在 T-SQL 中生成嵌入向量。
- **对 SQL 查询使用 `sqlcmd (Go) -G`**，而不是 curl+token。
- **使用 `-Q`**（非交互式退出）进行代理式操作。
- **对于简单单行命令以外的任何内容，使用 `-i file.sql`**，而不是 `-Q "..."`。
- **使用 `-F vertical`** 探索宽表。
- **使用环境变量**（`FABRIC_SERVER`、`FABRIC_DB`）实现脚本复用。
- **自动调优** — 让引擎管理索引；定期检查 `sys.dm_db_tuning_recommendations`。
- **优化锁定** — 默认启用；可减少锁内存，并消除锁升级。

### 故障排除

| 症状 | 解决方法 |
|---|---|
| SqlPackage 身份验证错误 | 在连接字符串中使用 `Authentication=Active Directory Default` |
| `Login failed for user` | 验证 `-d` 是否与数据库显示名称完全匹配（区分大小写） |
| `Cannot open server` / `Login timeout expired` | 通过 REST API 重新发现 FQDN；检查端口 1433 / 防火墙 |
| `ActiveDirectoryDefault` 失败 | `az login` 会话可能已过期 — 按照 `common/COMMON-CLI.md` 刷新 Azure CLI 身份验证 |
| 创建后出现排序规则错误 | 无法更改 — 必须使用所需的排序规则重新创建数据库 |
| INSERT 时违反外键约束 | 检查被引用的表中是否存在匹配的行；验证列类型 |
| 插入向量时维度不匹配 | 确保向量字面量的维度数与声明的维度数完全一致 |
| 在现有表上创建 CCI 失败 | 停止镜像，创建索引，然后重新启动镜像。使用 CREATE TABLE 内联创建 CCI 也会阻止该表进行镜像 |
| DDL 更改后表未被镜像 | DDL 更改会触发完整的数据重新播种；具有不受支持的 PK 类型的表会被跳过，表数量超过 1000 个时也会跳过 |
| vector/json 列阻止镜像 | 包含 `vector` 或 `json` 列的表无法进行镜像；请使用 OLTP 终结点查询这些表 |
| 分析终结点中缺少计算列 | 镜像期间会跳过计算列 |
| 分析终结点上的 LOB 数据被截断 | OneLake 中超过 1 MB 的 LOB 列会被截断 |
| `ALTER INDEX ALL` 失败 | 镜像处于活动状态时不允许执行此操作；请按名称逐个更改索引 |
| CSV 乱码 / 文件中出现 `(N rows affected)` | 添加 `-W -s"," -w 4000`；在前面加上 `SET NOCOUNT ON;` |
| `sp_invoke_external_rest_endpoint` 返回 401 | 为目标 URL 创建/验证数据库范围的凭据 |
| 找不到 `sqlcmd` | 确保已安装 `sqlcmd` 并且它位于 `PATH` 中；按照 `common/COMMON-CLI.md` 中的共享 CLI 设置指南操作 |
| 在重定向端口上连接失败 | 除 1433 端口外，连接策略还要求开放 11000–11999 端口 |