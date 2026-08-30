---
name: sqldb-cli
description: "Manages a Fabric SQL database item, the OLTP SQL Server engine, including running T-SQL through sqlcmd, temporal and vector similarity search, schema and sys.tables inspection, dacpac deployment, and Query Store, blocked sessions and regressed-plan investigation. Use for any query or change against a SQL database item. Warehouse, lakehouse SQL endpoint and mirrored items belong to sqldw-cli."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: sqldb-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldb-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——也必须补上。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **技能消歧**：仅对 Fabric SQL 数据库项目（OLTP、SQL Server 引擎）使用 `sqldb-cli`。Warehouse、Lakehouse SQL endpoint 或 Mirrored Database 使用 `sqldw-cli`；notebook 单元格使用 `spark-cli`。

# Fabric SQL 数据库（OLTP）——CLI 技能

此技能专用于 Fabric SQL 数据库：T-SQL 架构编写、只读查询和 OLTP 性能诊断。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后在执行任何命令**之前**，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件。该文件包含端点、负载格式、模板和注意事项；不阅读该文件就执行操作会产生错误的负载和错误的结果。

## 模式选择

| 模式 | 请求内容 | 示例触发词 | 首先阅读 |
|---|---|---|---|
| `authoring` | 在现有数据库中创建或更改架构和数据：表、约束、索引、向量列、过程、dacpac 部署、INSERT/UPDATE/DELETE/MERGE —— 以及仅当请求要求创建**新数据库**时，创建 SQL 数据库项目本身 | 创建 sqldb 表、sqldb 外键、dacpac 部署、修改 sqldb 架构、在 fabric 中创建 sql 数据库 | [references/authoring.md](references/authoring.md) |
| `consumption` | 通过 sqlcmd 执行只读 T-SQL：SELECT、目录探索、向量相似性搜索、时态查询 | sqldb sys.tables、vector similarity sqldb、temporal sqldb、查询 sql database | [references/consumption.md](references/consumption.md) |
| `operations` | 诊断 OLTP 性能：Query Store、阻塞会话、性能回退的计划、等待统计信息 | sqldb query store、sql database blocked sessions、sqldb regressed plan、sqldb slow query | [references/operations.md](references/operations.md) |

### 模式边界规则

`consumption` 仅执行只读 T-SQL。任何 DDL 或 DML 都属于 authoring 模式；任何性能调查都属于 operations 模式。宣布模式切换，阅读匹配的参考文件，然后再执行操作。

在 `authoring` 中，请求中指定的数据库已存在，除非请求要求你创建数据库：解析该数据库，然后直接执行 T-SQL。不要将配置 SQL 数据库项目作为架构或数据操作的前置条件。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理该部分之前阅读相应的参考文件。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，不要猜测。

## 终端写入——绝不能跳过的步骤

阅读参考资料并规划更改**不等于**完成任务。每种变更模式都必须以一次改变状态的调用结束。如果没有发出该调用，则任何内容都不会被持久化——请明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 通过 `sqlcmd -Q`/`-i` 对数据库执行 T-SQL——`CREATE TABLE`、`ALTER`、`INSERT INTO`、`UPDATE`、`DELETE` 或 `MERGE INTO` 语句必须实际运行。仅编写 DDL 或 DML 并展示给用户不会改变任何内容。只有当请求要求创建一个新数据库时，终端写入才改为 `POST /v1/workspaces/{ws}/sqlDatabases`，并轮询直至完成。 |
| `consumption` | 无——此模式严格为只读 |
| `operations` | 诊断读取本身不需要终端写入。参考资料记录的唯一例外是：间歇性阻塞调查可以创建一个 Extended Events 会话（`CREATE EVENT SESSION ... ON DATABASE`，使用 `ring_buffer` 目标），之后的终端步骤是再次删除该会话——绝不能让会话保持运行状态。 |

在报告任务完成之前，确认终端调用返回成功；如果参考资料记录了读回操作，还要读回相关产物，以证明更改已生效。

## 共享必备事项（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云 / 非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；在处理任何身份验证问题之前必须阅读 |
| 身份验证配方 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 常见问题与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 在执行该模式的第一个命令之前，先完整阅读 `references/<mode>.md`，并将其作为**第一个工具调用**。只读取**一次**，一次性完整读取：不要重新打开，不要再次 grep，也不要分页读取。你已经拥有该文件。
- 对加载的每个其他文件也采用相同的只读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考资料和共享的 `common/*.md` 文件：只打开实际需要的文件，将每个文件完整读取**一次**，绝不 grep 或重新打开已经加载的文件。
- 通过列出并筛选来解析工作区和项目 id，绝不能猜测 GUID。
- 当请求跨越边界时，必须明确宣布模式切换。
- 将参考资料视为操作指令，而不是交付成果。阅读之后，针对实际工作区运行其中记录的命令，并报告真实结果。仅引用参考资料中的内容而不执行命令，并不能回答请求。

### **优先事项**

- 满足请求所需的最窄模式。
- 只阅读**一个**模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在执行前说明这一点。
- 在首次响应中说明你选择的模式，以便用户进行纠正。

### **避免事项**

- 仅依据此调度器采取行动——它有意省略了操作细节。
- 用参考文档的摘要作答，而不是执行其中的内容。
- 重新读取或重新 grep 已经加载过的参考文档；这会消耗交互轮次和令牌。
- 修改 `consumption` 或 `operations` 中的架构或数据——二者都通过读取来作答。任一者唯一可以执行的写操作，是 `operations` 的间歇性阻塞调查所设置并随后删除的 Extended Events 会话。
- 为本系列已经负责的工作加载其他 skill（参见 CRITICAL NOTES 3）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| "Create an Orders table with a foreign key to Customers in the Fabric SQL database." | `authoring` | [references/authoring.md](references/authoring.md) |
| "Create a new SQL database in this workspace called sales_oltp." | `authoring` | [references/authoring.md](references/authoring.md) |
| "Find the 5 nearest embeddings to this vector in the SQL database." | `consumption` | [references/consumption.md](references/consumption.md) |
| "Which queries regressed in the last day according to Query Store?" | `operations` | [references/operations.md](references/operations.md) |