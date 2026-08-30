---
name: sqldw-cli
description: "Manages Fabric Warehouse, Lakehouse SQL analytics endpoints, and Mirrored Databases, including DDL and DML, COPY INTO ingestion, read-only T-SQL SELECT and row counts over lakehouse tables, and queryinsights performance triage. Use to query these items or count rows in a table. A Fabric SQL database, the OLTP engine, belongs to sqldb-cli."
---
> **Telemetry — 强制要求。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: sqldw-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldw-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍需添加。
> 这适用于全部三种模式；模式引用也继承此要求。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 过滤
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 过滤
> 3. **技能区分**：对于发送到 Warehouse、Lakehouse SQL 分析终结点或 Mirrored Database 的任何 T-SQL，均使用 `sqldw-cli`——包括普通的 Lakehouse 表 SELECT、行数统计、筛选和聚合请求。任何 notebook 单元格或 PySpark DataFrame 操作均使用 `spark-cli`；Fabric SQL database（OLTP）使用 `sqldb-cli`。

# Fabric Warehouse 和 SQL 终结点 — CLI 技能

此技能负责 Fabric Warehouse、Lakehouse SQL 分析终结点和 Mirrored Database：T-SQL 编写与数据引入、只读查询以及 Warehouse 性能诊断。

它是一个**模式分派器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后使用文件读取工具在执行任何命令**之前完整阅读**对应的 `references/<mode>.md` 文件。该文件包含 T-SQL 支持范围、DDL 约束、查询模板和注意事项；不阅读该文件就执行会产生无效的 T-SQL 和错误的结果。

## 模式选择

| 模式 | 请求适用于以下情况…… | 示例触发词 | 首先阅读 |
|---|---|---|---|
| `authoring` | 更改 Warehouse 状态：表 DDL、DML、数据引入、事务、过程、架构演进、时间旅行 | 创建 Warehouse 表、COPY INTO、OPENROWSET、INSERT/UPDATE/DELETE、Warehouse MERGE、CTAS、sp_rename、创建 T-SQL 过程、Warehouse 时间旅行 | [references/authoring.md](references/authoring.md) |
| `consumption` | 读取数据或元数据：SELECT、行数统计、筛选、聚合、架构/对象发现、CSV 导出 | 查询 Warehouse、统计 Lakehouse 行数、SELECT Lakehouse、显示表、描述 Warehouse 架构、导出 SQL 数据 | [references/consumption.md](references/consumption.md) |
| `operations` | 通过 `queryinsights` 视图诊断性能或运行状况 | 最慢的 Warehouse 查询、queryinsights CPU、压力事件、缓存热度、群集键建议、性能下降 | [references/operations.md](references/operations.md) |

### 模式边界规则

根据**意图**而不是终结点进行分类——三种模式都调用相同的 `execute_query`。

- 为规划 `CREATE TABLE` 而执行的架构发现 `SELECT` 属于 `authoring`，即使它只读取数据。
- 用于回答用户问题的 `SELECT` 属于 `consumption`。
- 用于解释运行缓慢原因的针对 `queryinsights.*` 的 `SELECT` 属于 `operations`；针对用户表的 `SELECT` 则不属于该模式，无论其运行速度多慢。

`consumption` 和 `operations` 为只读模式。如果请求确实跨越多个模式，请逐个处理，并在开始处理相应部分之前读取每个参考文档。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，而不要猜测。

## Terminal 写入——不得跳过的步骤

读取参考文档并起草 T-SQL 并不等于完成任务。如果你没有发送该语句，就没有任何内容发生变化——请明确说明这一点，而不是报告成功。

| 模式 | Terminal 写入 |
|---|---|
| `authoring` | DDL/DML 本身，通过 `execute_query` 发送。随后在第二次调用中执行回读（CREATE 后执行 `SELECT ... FROM INFORMATION_SCHEMA.TABLES`，DML 后执行 `SELECT COUNT(*)`），并使用用户要求的名称报告你创建或更改的对象。只有 Warehouse 接受表 DDL/DML——有关 Lakehouse SQL endpoint 和 Mirrored Database 允许的操作，请参阅模式参考文档。 |
| `consumption` | 无——此模式为只读模式 |
| `operations` | 无——只读，但仍然必须**运行**诊断查询：每个数字都必须来自你在报告该数字的当前轮次中执行的 `SELECT`，并在行内注明其来源视图，绝不能沿用之前轮次的结果。即使诊断结果确定，也绝不能自行执行 `ALTER`、`CREATE` 或 `DROP`。含糊的请求（“只要让它更快”）是一个新的诊断问题：重新运行支撑你所提到的调优手段的查询，然后询问用户希望处理哪个目标，而不是输出推测性的调优清单。 |

### `consumption` 和 `operations` 报告要求

这两种只读模式都没有 Terminal 写入，因此交付物就是答案本身。针对实时 endpoint 运行查询并报告实际行——仅总结参考文档并不能回答请求。

在 `operations` 中，将每个数字的来源 `queryinsights` 视图紧邻数字注明（例如 `2,140 ms (queryinsights.long_running_queries)`），**包括结果为零行时**。在报告结果的当前轮次中重新运行查询，而不是复述之前轮次的输出——“我已经运行过诊断”不是来源。全新的 warehouse 确实可能尚未捕获任何内容；请明确说明，而不要悄悄省略该部分。绝不能编造、假设或推断诊断数字。

## 共享要点（所有模式）

所有模式都以相同方式访问数据平面。首先解析 workspace 和 item，然后通过 MCP 工具发送 T-SQL。

### 执行界面——`fabric-sqlendpoint-execute_query`

所有 T-SQL 都通过 `fabric-sqlendpoint-execute_query` MCP 工具运行。**对于 SQL 数据平面执行，此 skill 优先于 COMMON-CLI SQL/TDS 指南**——使用 MCP 工具，而不是 `sqlcmd`，除非你明确处于模式参考文档中记录的 Legacy CLI Fallback 路径（参见模式参考文档）。`az rest` 仍然是控制平面发现的正确工具。

```text
fabric-sqlendpoint-execute_query(workspaceId, itemId, query)
```

- **在任何模式的首次操作之前进行预检：**确认工具列表中存在名称以 `execute_query` 结尾的工具。它来自 `fabric-sqlendpoint` MCP server，由 Fabric skills **plugin** 或此仓库的 `.mcp.json` 注册。具体名称可能带有前缀（`fabric-sqlendpoint-execute_query`、`sqlendpoint-global-execute_query`）——调用你实际看到的名称。如果不存在此类工具，请说明这一点，然后回退到模式参考文档中记录的 Legacy CLI Fallback（TDS client）；告知用户可以注册该 server 以使用主要路径——参见 [mcp-setup/](../../mcp-setup/)。
- **`itemId` 是 GUID，绝不能是 FQDN 或 `-d <DatabaseName>`。**对于 Warehouse 或 Mirrored Database，使用 item id；对于 **Lakehouse**，使用 `properties.sqlEndpointProperties.id`，而不是 Lakehouse item id。
- **每次调用只能执行一个 T-SQL 批处理。**不得使用 `GO` 分隔符，也不得使用 sqlcmd 元命令（`:setvar`、`:r`、`-i`）。将多批处理工作拆分为多个调用。只会返回最后一个结果集。
- **结果最多返回 10,000 行**，查询超时时间为 300 秒，速率限制为每分钟 20 个请求。使用 `TOP N`、`WHERE` 或聚合；结果恰好为 10,000 行表示结果已被截断。这些是观测到的默认值，并非有文档记录的契约。

### 常见参考资料

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — 在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑和关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云 / 非公有云主机 |
| 身份验证和令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；在处理任何身份验证问题之前必须阅读 |
| 身份验证配方 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 调用 Fabric 控制平面 API | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；分页和 LRO 辅助工具 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点和故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 在该模式下执行第一个命令之前，作为你的第一个工具调用，完整阅读 `references/<mode>.md`，从头到尾阅读一次：不要重新打开，不要再次 grep，也不要翻页阅读。你已经拥有该内容。
- 通过列出并筛选来解析工作区和项目 id，绝不能猜测 GUID。
- 只要 `fabric-sqlendpoint-execute_query` 工具可用，就通过它执行 T-SQL；仅当该工具不可用时，才使用模式参考中记录的 Legacy CLI Fallback。
- 当请求跨越边界时，必须明确宣布模式切换。
- 将参考资料视为操作说明，而不是交付内容。阅读后，针对实时端点执行其中记录的语句，并报告真实结果。只引用参考资料中的内容而不执行，不能满足请求。
- 生成用户要求的每一项 artefact，使用用户采用的名称，并且即使 finding 为“none”、“zero rows”或“not applicable”，也要保留其标题。

### 优先

- 使用能够满足请求的最窄模式。
- 恰好阅读一个模式参考资料。只有当请求确实跨越多个模式时，才加载第二个参考资料，并在加载前说明这一点。
- 在首次回复中报告你选择的模式，以便用户进行纠正。
- 使用 `OPTION (LABEL = '...')` 标记查询，以便在 Query Insights 中跟踪运行情况。
- 将相关语句合并到更少的调用中 — 速率限制针对的是身份，而不是查询。

### 避免

- 仅依据此调度器执行操作 — 它有意省略了 T-SQL 的操作范围、DDL 约束和诊断查询形状。
- 用参考资料摘要来回答，而不是执行其中的内容。
- 重新阅读或重新 grep 已加载的参考资料；这会消耗轮次和令牌。
- 在只读模式（`consumption`、`operations`）下执行任何变更操作。
- 不受限制的 `SELECT *` — 它会在无提示的情况下截断为 10,000 行。
- 为本技能已负责的工作加载其他技能（参见 CRITICAL NOTES 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| "SkillsTestWarehouse 中的 nyctlc 表有多少行？" | `consumption` | [references/consumption.md](references/consumption.md) |
| "在仓库中创建包含 OrderId、CustomerId 和 OrderDate 的 dbo.Orders。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "使用 COPY INTO 将 OneLake 中的 Files/nyctlc_sample.csv 加载到仓库。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "哪些查询最慢，以及应该对哪些表进行聚类？" | `operations` | [references/operations.md](references/operations.md) |
| "从 lakehouse SQL endpoint 中显示每个供应商的平均行程距离。" | `consumption` | [references/consumption.md](references/consumption.md) |