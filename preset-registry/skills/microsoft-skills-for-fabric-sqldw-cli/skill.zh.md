---
name: sqldw-cli
description: "Author, query and diagnose Fabric Warehouse, Lakehouse SQL endpoints and Mirrored Databases: DDL/DML and COPY INTO ingestion, read-only T-SQL SELECT and row counts over lakehouse tables, and queryinsights performance triage. Fabric SQL database (OLTP) is sqldb-*-cli. Triggers:query warehouse,count rows lakehouse,SELECT lakehouse,create warehouse table,COPY INTO,warehouse MERGE,slowest warehouse queries,queryinsights CPU"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: sqldw-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldw-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了它，但仍需添加。
> 此要求涵盖全部三种模式；各模式的参考文档均继承此要求。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **Skill 区分**：对于发送到 Warehouse、Lakehouse SQL 分析终结点或镜像数据库的任何 T-SQL，都应使用 `sqldw-cli`——包括普通的 Lakehouse 表 SELECT、行数统计、筛选和聚合请求。任何 notebook 单元格或 PySpark DataFrame 工作都属于 `spark-cli`；Fabric SQL 数据库 (OLTP) 属于 `sqldb-*-cli` 系列——`sqldb-authoring-cli`、`sqldb-consumption-cli` 和 `sqldb-operations-cli`。

# Fabric Warehouse 和 SQL 终结点 — CLI Skill

此 Skill 统一负责 Fabric Warehouse、Lakehouse SQL 分析终结点和镜像数据库：T-SQL 创作和引入、只读查询以及 Warehouse 性能诊断。

它是一个**模式分派器**，不包含任何操作步骤。请从下表中选择与请求匹配的模式，然后在执行任何一条命令**之前，使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含 T-SQL 功能范围、DDL 约束、查询模板和注意事项；如果不阅读便执行操作，将产生无效的 T-SQL 和错误的结果。

## 模式选择

| 模式 | 在请求涉及以下情况时使用 ... | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 更改 Warehouse 状态：表 DDL、DML、引入、事务、存储过程、架构演进、时光回溯 | 创建 Warehouse 表、COPY INTO、OPENROWSET、INSERT/UPDATE/DELETE、Warehouse MERGE、CTAS、sp_rename、创建 T-SQL 存储过程、Warehouse 时光回溯 | [references/authoring.md](references/authoring.md) |
| `consumption` | 读取数据或元数据：SELECT、行数统计、筛选、聚合、架构/对象发现、CSV 导出 | 查询 Warehouse、统计 Lakehouse 行数、SELECT Lakehouse、显示表、描述 Warehouse 架构、导出 SQL 数据 | [references/consumption.md](references/consumption.md) |
| `operations` | 通过 `queryinsights` 视图诊断性能或运行状况 | 最慢的 Warehouse 查询、queryinsights CPU、压力事件、缓存预热程度、群集键建议、性能下降 | [references/operations.md](references/operations.md) |

### 模式边界规则

按**意图**而非终结点进行分类——所有三种模式都发出相同的 `execute_query` 调用。

- 为规划 `CREATE TABLE` 而运行的架构发现 `SELECT` 属于 `authoring`，即使它仅执行读取操作。
- 用于回答用户问题的 `SELECT` 属于 `consumption`。
- 为解释速度缓慢而针对 `queryinsights.*` 执行的 `SELECT` 属于 `operations`；针对用户表执行的 `SELECT` 则不属于该模式，无论它有多慢。

`consumption` 和 `operations` 是只读模式。如果某个请求确实跨越多个模式，请逐个处理，并在开始处理每个部分之前阅读相应的参考文档。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不要猜测。

## 终端写入——绝不能跳过的步骤

阅读参考文档并起草 T-SQL 并不意味着任务已经完成。如果你没有发送语句，就没有发生任何更改——请明确说明这一点，而不要声称成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | DDL/DML 本身，通过 `execute_query` 发送。随后在第二次调用中执行回读（CREATE 后执行 `SELECT ... FROM INFORMATION_SCHEMA.TABLES`，DML 后执行 `SELECT COUNT(*)`），并**使用用户要求的名称**报告你创建或更改的对象。只有 Warehouse 接受表 DDL/DML——有关 Lakehouse SQL endpoint 和 Mirrored Database 所允许的操作，请参阅相应模式的参考文档。 |
| `consumption` | 无——此模式为只读 |
| `operations` | 无——此模式为只读，但你仍然必须**运行**诊断查询：每个数值都必须来自你在报告该数值的当前轮次中执行的 `SELECT`，并以内联方式注明其源视图，绝不能沿用之前轮次的结果。即使诊断结果已确定，也绝不能自行执行 `ALTER`、`CREATE` 或 `DROP`。模糊的请求（“只要让它更快”）是一个新的诊断问题：重新运行用于支持你所指出调优手段的查询，然后询问要优化哪个目标，而不是输出一份推测性的调优清单。 |

### `consumption` 和 `operations` 的报告要求

这两种只读模式都没有终端写入，因此其交付物就是答案本身。请针对实时端点运行查询并报告真实返回的行——仅总结参考文档并不能回答请求。

在 `operations` 中，请在每个数值旁边注明其来源的 `queryinsights` 视图（例如 `2,140 ms (queryinsights.long_running_queries)`），**即使答案为零行也必须如此**。请在报告结果的当前轮次中重新运行查询，而不要复述之前轮次的输出——“我已经运行过诊断”并不是来源。新建的 Warehouse 完全可能尚未捕获任何数据；请明确说明这一点，而不要默默省略该部分。绝不能捏造、假设或推断诊断数值。

## 通用要点（所有模式）

所有模式都以相同方式访问数据平面。首先解析 workspace 和 item，然后通过 MCP 工具发送 T-SQL。

### 执行界面——`fabric-sqlendpoint-execute_query`

所有 T-SQL 都通过 `fabric-sqlendpoint-execute_query` MCP 工具运行。**对于 SQL 数据平面执行，此 Skill 优先于 COMMON-CLI 的 SQL/TDS 指南**——请使用 MCP 工具，而不是 `sqlcmd`，除非你明确处于模式参考文档所述的 Legacy CLI Fallback 路径上。`az rest` 仍然是控制平面发现的正确工具。

```text
fabric-sqlendpoint-execute_query(workspaceId, itemId, query)
```

- **在任何模式的第一次操作之前进行预检：**确认你的工具列表中存在名称以 `execute_query` 结尾的工具。该工具来自 `fabric-sqlendpoint` MCP server，由 Fabric skills **plugin** 或此仓库的 `.mcp.json` 注册。具体名称可能带有前缀（`fabric-sqlendpoint-execute_query`、`sqlendpoint-global-execute_query`）——请调用你实际看到的名称。如果不存在，请明确说明，然后回退到模式参考文档所述的 Legacy CLI Fallback（TDS client）；同时告知用户，他们可以注册该 server 以使用主要路径——参阅 [mcp-setup/](../../mcp-setup/)。
- **`itemId` 是 GUID，绝不是 FQDN 或 `-d <DatabaseName>`。**对于 Warehouse 或 Mirrored Database，请使用 item id；对于 **Lakehouse**，请使用 `properties.sqlEndpointProperties.id`，**而不是** Lakehouse item id。
- **每次调用只能包含一个 T-SQL batch。**不得使用 `GO` 分隔符，也不得使用 sqlcmd meta-commands（`:setvar`、`:r`、`-i`）。请将包含多个 batch 的工作拆分为多次调用。只会返回最后一个结果集。
- **结果最多为 10,000 行**，查询超时时间为 300s，并且速率限制为 20 requests/min。请使用 `TOP N`、`WHERE` 或聚合；恰好返回 10,000 行意味着结果已被截断。这些是观察到的默认值，而不是有文档保证的约定。

### 常用参考资料

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — 在解析任何工作区或项 ID 之前阅读 |
| Fabric 拓扑与核心概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云/非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 身份验证方案 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；分页和 LRO 辅助工具 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中选择且仅选择一种模式。
- 在该模式的第一条命令之前，将完整读取 `references/<mode>.md` 作为你的第一次工具调用。一次性完整读取，并且只读取一次：不要重新打开，不要再次使用 grep，也不要分页读取。你已经拥有其中的内容。
- 通过列出并筛选来解析工作区和项 ID，绝不要猜测 GUID。
- 只要 `fabric-sqlendpoint-execute_query` 工具可用，就通过它执行 T-SQL；只有在该工具不可用时，才改用模式参考资料中记录的旧版 CLI 回退方案。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考资料视为操作指令，而不是交付内容。阅读后，针对实时终结点运行其中记录的语句，并报告真实结果。仅引用参考资料中的内容而不实际执行，并不能回答请求。
- 生成用户要求的每一项产物，使用用户指定的名称，并且即使结果为“无”“零行”或“不适用”，也要保留其标题。

### 优先

- 选择能够满足请求的最窄模式。
- 只读取一个模式参考资料。仅当请求确实跨越多个模式时才加载第二个，并在加载前说明这一点。
- 在首次响应中报告你选择的模式，以便用户进行纠正。
- 使用 `OPTION (LABEL = '...')` 标记查询，以便可在 Query Insights 中追踪此次运行。
- 将相关语句合并到更少的调用中——速率限制按身份而非按查询计算。

### 避免

- 仅依据此分派器执行操作——它有意省略了 T-SQL 功能范围、DDL 约束和诊断查询形式。
- 用参考资料摘要作答，而不是实际执行。
- 重新读取或再次使用 grep 搜索已经加载的参考资料；这会消耗轮次和令牌。
- 在只读模式（`consumption`、`operations`）下修改任何内容。
- 使用无边界的 `SELECT *`——它会在达到 10,000 行时静默截断。
- 对于此技能已经负责的工作，加载其他技能（请参阅关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “SkillsTestWarehouse 中的 nyctlc 表有多少行？” | `consumption` | [references/consumption.md](references/consumption.md) |
| “在仓库中创建 dbo.Orders，包含 OrderId、CustomerId 和 OrderDate。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “使用 COPY INTO 将 OneLake 中的 Files/nyctlc_sample.csv 加载到仓库。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “哪些查询最慢？哪些表应该进行聚类？” | `operations` | [references/operations.md](references/operations.md) |
| “显示来自湖仓 SQL 终结点的每个供应商的平均行程距离。” | `consumption` | [references/consumption.md](references/consumption.md) |