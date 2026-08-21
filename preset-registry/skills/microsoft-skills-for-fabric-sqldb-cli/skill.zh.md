---
name: sqldb-cli
description: "Design, read and troubleshoot a Fabric SQL database item (OLTP, SQL Server engine): schema with constraints, indexes and vector columns; sqlcmd lookups including temporal and similarity search; Query Store, blocking and regressed-plan investigation. Warehouse items belong to sqldw-cli. Triggers:create sqldb table,sqldb foreign key,dacpac deploy,sqldb sys.tables,vector similarity sqldb,sqldb query store,sql database blocked sessions"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: sqldb-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldb-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了它，但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中此类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能区分**：仅对 Fabric SQL 数据库项目（即 OLTP、SQL Server 引擎）使用 `sqldb-cli`。Warehouse、Lakehouse SQL 终结点或 Mirrored Database 应使用 `sqldw-cli`；笔记本单元格应使用 `spark-cli`。

# Fabric SQL 数据库（OLTP）-- CLI 技能

此技能专门负责 Fabric SQL 数据库：T-SQL 架构编写、只读查询和 OLTP 性能诊断。

它是一个**模式分派器**，不包含任何操作步骤。请从下表中选择与请求匹配的模式，然后在执行任何一条命令**之前，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；未阅读便执行操作会导致有效负载和结果错误。

## 模式选择

| 模式 | 当请求涉及以下内容时使用…… | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 在现有数据库中创建或更改架构和数据：表、约束、索引、向量列、存储过程、dacpac 部署、INSERT/UPDATE/DELETE/MERGE；并且仅当请求要求创建新数据库时，才创建 SQL 数据库项目本身 | 创建 sqldb 表、sqldb 外键、部署 dacpac、更改 sqldb 架构、在 Fabric 中创建 SQL 数据库 | [references/authoring.md](references/authoring.md) |
| `consumption` | 通过 sqlcmd 运行只读 T-SQL：SELECT、目录探索、向量相似度搜索、时态查询 | sqldb sys.tables、sqldb 向量相似度、sqldb 时态查询、查询 SQL 数据库 | [references/consumption.md](references/consumption.md) |
| `operations` | 诊断 OLTP 性能：Query Store、阻塞的会话、退化的计划、等待统计信息 | sqldb Query Store、SQL 数据库阻塞的会话、sqldb 退化的计划、sqldb 慢查询 | [references/operations.md](references/operations.md) |

### 模式边界规则

`consumption` 仅执行只读 T-SQL。任何 DDL 或 DML 都属于编写模式；任何性能调查都属于运维模式。先说明模式切换，阅读匹配的参考文件，然后再执行操作。

在 `authoring` 模式下，除非请求要求创建数据库，否则请求中提到的数据库均视为已经存在：解析该数据库，然后直接执行 T-SQL。不要将预先配置 SQL 数据库项目作为架构或数据工作的前置条件。

如果请求确实跨越多个模式，请逐个模式处理，并在开始相应部分之前阅读每个参考文件。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不是猜测。

## 终端写入——绝不能跳过的步骤

阅读参考文档并规划变更并不等于完成任务。每种会产生变更的模式都必须以一次改变状态的调用结束。如果你没有发出该调用，就不会持久化任何内容——应明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 通过 `sqlcmd -Q`/`-i` 对数据库执行 T-SQL——`CREATE TABLE`、`ALTER`、`INSERT INTO`、`UPDATE`、`DELETE` 或 `MERGE INTO` 语句必须实际运行。编写 DDL 或 DML 并向用户展示不会改变任何内容。只有当请求要求创建新数据库时，终端写入才改为 `POST /v1/workspaces/{ws}/sqlDatabases`，并轮询至完成。 |
| `consumption` | 无——此模式严格只读 |
| `operations` | 诊断性读取本身无需终端写入。参考文档中说明的唯一例外是：间歇性阻塞调查可以创建 Extended Events 会话（`CREATE EVENT SESSION ... ON DATABASE`、`ring_buffer` 目标），此时终端步骤是再次将其删除——绝不能让它保持运行。 |

在报告任务完成之前，确认终端调用已成功返回；如果参考文档要求回读，还需回读产物以证明变更已生效。

## 共享基础要求（所有模式）

首先解析工作区和项目；每种模式都依赖这一步。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与核心概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前先阅读 |
| 身份验证操作示例 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中选择且仅选择一种模式。
- 在该模式的第一条命令之前，将 `references/<mode>.md` 从头到尾读完，并将其作为你的**第一次工具调用**。仅用一次完整读取来阅读：不要重新打开，不要再次对其执行 grep，也不要分页阅读。你已经拥有其内容。
- 对你加载的所有其他文件采用相同的仅阅读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考文档和共享的 `common/*.md` 文件：只打开实际需要的文件，每个文件仅从头到尾阅读**一次**，并且绝不对已经加载的文件执行 grep 或重新打开。
- 通过列出并筛选来解析工作区和项目 ID，绝不能猜测 GUID。
- 当请求跨越模式边界时，明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付成果。阅读后，对实际工作区**运行**文档中说明的命令，并报告真实结果。引用参考文档的内容而不执行其中的操作，无法满足请求。

### 偏好

- 选择能够满足请求的最窄模式。
- 只读取恰好一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载前说明。
- 在首次回复中报告所选择的模式，以便用户进行纠正。

### 避免

- 仅依据此分派器执行操作——它有意省略了操作细节。
- 仅用参考文档摘要作答，而不是实际执行。
- 重新读取或重新搜索已经加载的参考文档；这会浪费轮次和令牌。
- 通过 `consumption` 或 `operations` 更改架构或数据——两者都只通过读取来回答。二者唯一可能执行的写入操作，是在 `operations` 的间歇性阻塞调查中创建并随后删除的扩展事件会话。
- 对此系列已负责的工作加载其他技能（请参阅关键说明 3）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “在 Fabric SQL 数据库中创建一个 Orders 表，并添加指向 Customers 的外键。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “在此工作区中创建一个名为 sales_oltp 的新 SQL 数据库。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “在 SQL 数据库中查找与此向量最接近的 5 个嵌入。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “根据查询存储，过去一天中哪些查询出现了性能回退？” | `operations` | [references/operations.md](references/operations.md) |