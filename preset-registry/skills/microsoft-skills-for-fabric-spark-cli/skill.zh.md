---
name: spark-cli
description: "Author, run and diagnose Fabric Spark: notebook cell code (%%configure, %%sql, PySpark, notebookutils), named notebook runs, Livy-session ad-hoc calculations, Spark failure triage, and the whole Materialized Lake View lifecycle -- definition, incremental-refresh readiness review, schedules, refresh jobs, run history and refresh-failure diagnosis. KQL materialized views are eventhouse-cli. Triggers:write notebook code,run notebook,notebookutils,create a Livy session,failed notebook,Spark OOM,create materialized lake view,schedule MLV,diagnose MLV refresh failure"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: spark-cli`（`az rest`：`--headers "x-ms-fabric-skill=spark-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该设置——无论如何都要添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中此类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能消歧**：对于笔记本单元格代码（包括 `%%sql` 单元格）、具名笔记本运行、Livy 会话、Spark 故障排查，以及与物化湖视图有关的一切操作，都使用 `spark-cli`——包括编写定义、审查查询是否满足增量刷新条件，以及对现有视图进行计划、刷新、监控或诊断。Eventhouse 中的 KQL 物化视图使用 `eventhouse-cli`；针对 Warehouse 或 Lakehouse SQL 终结点的普通只读 T-SQL 使用 `sqldw-cli`。
> 4. **严格的路由边界**：绝不能通过此技能执行 Eventhouse/KQL 物化视图请求。请将其路由到 `eventhouse-cli`；如果该技能不可用，请说明无法在当前技能上下文中完成该请求，并停止操作，不得调用 Fabric API 或创建制品。

# Fabric Spark 和物化湖视图——CLI 技能

此技能全面负责 Fabric Spark：笔记本单元格编写、笔记本运行、Livy 会话分析、Spark 故障诊断，以及物化湖视图的完整生命周期。

它是一个**模式分派器**，不包含任何操作过程。请从下表中选择与请求匹配的模式，然后在发出任何命令**之前，使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含终结点、有效负载结构、模板和注意事项；如果不阅读便执行操作，将导致有效负载错误和结果错误。

## 模式选择

| 模式 | 当请求涉及以下情况时使用... | 示例触发语 | 首先阅读 |
|---|---|---|---|
| `authoring` | 编写笔记本单元格代码（PySpark、Scala、SparkR、`%%sql`、`%%configure`），按名称运行笔记本并报告正常运行状态，或者编写物化湖视图定义，或审查 MLV 查询是否满足增量刷新条件 | 编写笔记本代码、笔记本单元格代码、%%sql 单元格、运行笔记本、执行笔记本、notebookutils、创建物化湖视图、此 MLV 查询是否满足增量刷新条件 | [references/authoring.md](references/authoring.md) |
| `consumption` | 在 Lakehouse Livy 会话中运行交互式临时 PySpark——绝不用于笔记本 | 创建 Livy 会话、在 Livy 中运行计算、PySpark、DataFrame 分析、跨 Lakehouse 联接表、Delta 时间旅行 | [references/consumption.md](references/consumption.md) |
| `operations` | 诊断失败、不健康、受到限流或缓慢的 Spark 笔记本、管道或 Livy 运行 | 笔记本失败、Spark Livy 健康状况、Spark OOM、为什么我的笔记本很慢、作业诊断、430 限流 | [references/operations.md](references/operations.md) |
| `mlv` | 发现或操作现有物化湖视图：Spark SQL 发现、刷新计划、按需刷新、运行历史记录、取消，以及刷新失败分类 | 发现 MLV、列出物化湖视图、计划 MLV、MLV 运行历史记录、取消刷新、触发 MLV 刷新、诊断 MLV 刷新失败 | [references/mlv.md](references/mlv.md) |

### 模式边界规则

模式由工件和结果决定，而不是由语言决定。Notebook 单元格始终属于 `authoring`，即使该单元格使用 `%%sql`。Livy 会话始终属于 `consumption`。状态为 FAILED 或运行状况不佳的 Spark 运行属于 `operations`；成功的运行由 `authoring` 报告。对于物化湖视图（Materialized Lake View），由动词决定模式：编写或审查定义属于 `authoring`，而发现、计划、刷新、监控或诊断现有 MLV 属于 `mlv`。如果必须执行发现操作，只有在从 `references/mlv.md` 中读取发现命令后，才能针对 Livy 切换到 `consumption`，或针对 Notebook 切换到 `authoring`。

如果请求确实跨越多个模式，请逐一处理，并在开始每个部分之前阅读相应参考文档。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，而不要猜测。

## 最终写入——不得跳过的步骤

阅读参考文档并规划变更并不等于完成任务。每种变更模式都以一次改变状态的调用结束。如果你没有发出该调用，就不会持久化任何内容——请明确说明这一点，而不要报告成功。

| 模式 | 最终写入 |
|---|---|
| `authoring` | 对于现有 Notebook，使用 `POST .../notebooks/{id}/updateDefinition` 保存单元格；新 Notebook 需要先调用 `POST /v1/workspaces/{ws}/items`；对于运行请求，通过 Jobs API 触发作业。将单元格代码打印到聊天中并不等于保存或运行它。 |
| `consumption` | 无——此模式为只读 |
| `operations` | 无——此模式为只读 |
| `mlv` | 对于按需刷新，调用 `POST /v1/workspaces/{ws}/lakehouses/{lakehouse}/jobs/refreshMaterializedLakeViews/instances`；对于计划请求，则调用计划的创建、更新或删除接口。仅报告计划会是什么样并不等于创建该计划。 |

在报告任务已完成之前，请确认最终调用已成功返回；如果参考文档中说明了回读操作，请回读该工件，以证明变更已生效。

## 共享基础要求（所有模式）

首先解析工作区和项目；所有模式都依赖于此。

| 任务 | 参考文档 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必读**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 错误的受众会导致 401；遇到任何身份验证问题前请先阅读 |
| 身份验证操作指南 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行其他任何操作之前，必须从上表中选择且仅选择一种模式。
- 将“设置我的数据”之类的模糊请求视为范围不充分。询问用户想要的制品、来源、目标位置和结果；绝不通过查找并运行现有 notebook 或作业来推断意图。
- 在该模式的第一条命令之前，将完整读取 `references/<mode>.md` 作为第一次工具调用。一次性从头到尾读取且仅读取一次：不要重新打开、不要再次对其执行 grep，也不要分页读取。你已经拥有其中的内容。
- 对你加载的所有其他文件采用同样的单次读取原则，包括嵌套的 `references/<mode>/*.md` 子参考文件和共享的 `common/*.md` 文件：只打开实际需要的文件，每个文件仅从头到尾读取一次，绝不对已加载的文件执行 grep 或重新打开。
- 通过列出并筛选来解析工作区和项目 ID，绝不猜测 GUID。
- 在路由任何 Eventhouse/KQL 物化视图请求后停止。不可用的同级 Skill 是阻断边界，并不意味着可以直接实现其工作负载。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为指令，而不是交付成果。阅读后，对实时工作区运行文档中所述的命令，并报告真实结果。引用参考文档中的内容而不实际执行，并不能回答请求。

### 优先

- 选择能够满足请求的最窄模式。
- 仅阅读一个模式参考文档。只有当请求确实跨越多个模式时，才加载第二个，并在执行前明确说明。
- 在第一次回复中报告你选择的模式，以便用户纠正。

### 避免

- 仅依据此分派器采取行动——它有意省略了操作细节。
- 仅提供参考文档摘要，而不实际执行。
- 重新读取或再次对已加载的参考文档执行 grep；这会浪费轮次和 token。
- 在只读模式下修改任何内容。
- 为该 Skill 系列已经负责的工作加载其他 Skill（参见关键说明 3）。
- 当负责该范围的 Skill 不可用时，尝试通过原始 REST 调用处理超出范围的请求。指出负责的 Skill 后停止；不要擅自在 `spark-cli` 范围之外创建 Fabric 制品。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “编写一个 notebook 单元格，用于读取 bronze 表并写入 silver Delta 表。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “创建一个 Livy 会话，并统计 lakehouse 中不同客户的数量。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “我的 notebook 运行因 OOM 失败了——找出原因。” | `operations` | [references/operations.md](references/operations.md) |
| “这个物化 Lake 视图查询是否已可用于增量刷新？” | `authoring` | [references/authoring.md](references/authoring.md) |
| “向我展示用于列出 silver schema 中 MLV 的 Spark SQL 命令。” | `mlv` | [references/mlv.md](references/mlv.md) |
| “为 lakehouse MLV 沿袭关系安排每夜刷新，并向我展示其运行历史记录。” | `mlv` | [references/mlv.md](references/mlv.md) |