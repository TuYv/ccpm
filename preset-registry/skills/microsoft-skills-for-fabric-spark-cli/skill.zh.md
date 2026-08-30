---
name: spark-cli
description: "Manages Fabric Spark work, including notebook cell code with %%configure, %%sql, PySpark and notebookutils, named notebook runs, Livy sessions, triage of failed or OOM notebook and pipeline Spark runs, and the Materialized Lake View (MLV) lifecycle. Load it before writing MLV SQL, since CREATE MATERIALIZED LAKE VIEW and its CONSTRAINT clause are Fabric-only. KQL materialized views belong to eventhouse-cli."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: spark-cli`（`az rest`：`--headers "x-ms-fabric-skill=spark-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头 — 但仍须添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **技能消歧**：笔记本单元格代码（包括 `%%sql` 单元格）、按名称运行笔记本、Livy 会话、Spark 故障排查，以及所有与 Materialized Lake View 相关的内容——包括编写定义、检查查询是否已准备好进行增量刷新，以及计划、刷新、监视或诊断现有视图——均使用 `spark-cli`。Eventhouse 中的 KQL materialized view 使用 `eventhouse-cli`；针对 Warehouse 或 Lakehouse SQL 终结点的普通只读 T-SQL 使用 `sqldw-cli`。
> 4. **严格的路由边界**：绝不得从此技能执行 Eventhouse/KQL materialized-view 请求。应将其路由到 `eventhouse-cli`；如果该技能不可用，则说明当前技能上下文无法完成该请求，并停止操作，不得调用 Fabric API 或创建项目。

# Fabric Spark 和 Materialized Lake View -- CLI 技能

此技能负责 Fabric Spark 的所有内容：笔记本单元格编写、笔记本运行、Livy 会话分析、Spark 故障诊断，以及整个 Materialized Lake View 生命周期。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后在发出任何命令**之前**，使用文件读取工具完整阅读对应的 `references/<mode>.md` 文件。该文件包含终结点、负载格式、模板和注意事项；不阅读该文件就执行操作会导致负载和结果错误。

## 模式选择

| 模式 | 适用场景 | 示例触发词 | 先阅读此文件 |
|---|---|---|---|
| `authoring` | 编写笔记本单元格代码（PySpark、Scala、SparkR、`%%sql`、`%%configure`），按名称运行笔记本并报告 `NORMAL` 运行状态，或编写 Materialized Lake View 定义，或检查 MLV 查询是否已准备好进行增量刷新 | 编写笔记本代码、笔记本单元格代码、`%%sql` 单元格、运行笔记本、执行笔记本、notebookutils、创建 materialized lake view、此 MLV 查询是否已准备好进行增量刷新 | [references/authoring.md](references/authoring.md) |
| `consumption` | 在 Lakehouse Livy 会话中运行交互式临时 PySpark 代码——绝不能运行笔记本 | 创建 Livy 会话、在 Livy 中运行计算、PySpark、DataFrame 分析、跨 lakehouse 联接表、Delta 时间旅行 | [references/consumption.md](references/consumption.md) |
| `operations` | 诊断 FAILED、不健康、受到限制或运行缓慢的 Spark 笔记本 / 管道 / Livy 运行 | 笔记本失败、Spark Livy 运行状况、Spark OOM、我的笔记本为什么运行缓慢、作业诊断、430 限流 | [references/operations.md](references/operations.md) |
| `mlv` | 发现或操作现有的 Materialized Lake View：Spark SQL 发现、刷新计划、按需刷新、运行历史记录、取消操作以及刷新失败分类 | 发现 MLV、列出 materialized lake view、计划 MLV、MLV 运行历史记录、取消刷新、触发 MLV 刷新、诊断 MLV 刷新失败 | [references/mlv.md](references/mlv.md) |

### 模式边界规则

模式由产物和结果决定，而不是由语言决定。笔记本单元格始终属于 `authoring`，即使该单元格使用的是 `%%sql`。Livy 会话始终属于 `consumption`。已 FAILED 或处于不健康状态的 Spark 运行属于 `operations`；成功的运行则由 `authoring` 报告。对于 Materialized Lake View，由动词决定模式：编写或审查定义属于 `authoring`，而发现、计划、刷新、监视或诊断现有 MLV 属于 `mlv`。如果必须执行发现操作，则只有在阅读 `references/mlv.md` 中的发现命令之后，才能针对 Livy 切换到 `consumption`，或针对笔记本切换到 `authoring`。

如果请求确实跨越多个模式，请逐个处理，并在开始处理每个部分之前阅读相应的参考文档。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，不要猜测。

## 终端写入——不得跳过的步骤

阅读参考文档并规划更改并不等于完成任务。每个会变更状态的模式都必须以一次状态变更调用结束。如果你没有发出该调用，则任何内容都不会被持久化——应明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 对于现有笔记本，使用 `POST .../notebooks/{id}/updateDefinition` 保存单元格；新建笔记本需要先调用 `POST /v1/workspaces/{ws}/items`；对于运行请求，通过 Jobs API 触发作业。在聊天中打印单元格代码不等于保存或运行它。 |
| `consumption` | 无——此模式为只读 |
| `operations` | 无——此模式为只读 |
| `mlv` | 对于按需刷新，使用 `POST /v1/workspaces/{ws}/lakehouses/{lakehouse}/jobs/refreshMaterializedLakeViews/instances`；对于计划请求，使用计划创建/更新/删除调用。报告计划内容并不等于创建计划。 |

在报告任务完成之前，确认终端调用已返回成功；如果参考文档规定了回读步骤，还要读回该产物，以证明更改已经生效。

## 共享必备事项（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必须**——在解析任何工作区或项目 id 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云 / 非公共云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；在进行任何身份验证操作之前阅读 |
| 身份验证配方 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，先从上表中准确选择一种模式。
- 将“设置我的数据”之类范围模糊的请求视为范围不足。询问用户希望使用什么工件、源、目标和结果；绝不要通过查找并运行现有 notebook 或作业来推断意图。
- 在该模式的第一条命令之前，作为你的第一个工具调用，从头到尾读取 `references/<mode>.md`。只读取一次，并在一次完整读取中完成：不要重新打开，不要再次 grep，也不要分页读取。你已经拥有其中内容。
- 对加载的所有其他文件也遵循同样的只读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考文件和共享的 `common/*.md` 文件：只打开实际需要的文件，将每个文件从头到尾读取一次，绝不要 grep 或重新打开已经加载的文件。
- 通过列出并筛选来解析工作区和项目 id，绝不要猜测 GUID。
- 路由任何 Eventhouse/KQL 具体化视图请求后立即停止。不可用的兄弟 skill 是阻塞边界，而不是允许你直接实现其工作负载。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付内容。读取后，针对实时工作区运行文档中记录的命令，并报告真实结果。仅引用参考文档中的内容而不执行操作，不能算作回答请求。

### 建议

- 选择能够满足请求的最窄模式。
- 准确读取一个模式参考文件。只有当请求确实跨越多个模式时才加载第二个，并在加载前说明这一点。
- 在第一条回复中报告你选择的模式，以便用户进行纠正。

### 避免

- 仅依据此调度器采取行动——它有意省略了操作细节。
- 用参考文档的摘要来回答，而不是执行其中的操作。
- 重新读取或重新 grep 已经读取过的参考文档；这会浪费轮次和 token。
- 在只读模式下执行任何变更操作。
- 为该系列工作加载其他 skill（参见 CRITICAL NOTES 3）。
- 在所属 skill 不可用时，通过原始 REST 调用尝试处理超出范围的请求。指出所属 skill 并停止；不要通过在 `spark-cli` 范围之外创建 Fabric 工件来临时实现。 

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “编写一个 notebook 单元格，读取 bronze 表并写入 silver Delta 表。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “创建一个 Livy 会话，并统计 lakehouse 中不重复客户的数量。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “我的 notebook 运行因 OOM 失败了——分析一下原因。” | `operations` | [references/operations.md](references/operations.md) |
| “这个具体化 lake view 查询是否已准备好进行增量刷新？” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示用于列出 schema silver 中 MLV 的 Spark SQL 命令。” | `mlv` | [references/mlv.md](references/mlv.md) |
| “为 lakehouse MLV 血缘安排每晚刷新，并显示其运行历史。” | `mlv` | [references/mlv.md](references/mlv.md) |