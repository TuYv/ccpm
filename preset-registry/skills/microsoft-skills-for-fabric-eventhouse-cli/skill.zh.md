---
name: eventhouse-cli
description: "Author and query Fabric Eventhouse / KQL databases: create tables, functions, policies, materialized views and ingestion, or run read-only KQL for real-time and time-series analytics. Ingestion topology is eventstream-cli. Triggers:kql query,query eventhouse,create kql table,kql ingestion,kql retention policy,materialized view kql"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 都必须携带
> `x-ms-fabric-skill: eventhouse-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventhouse-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了它——无论如何都要添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能消歧**：对于使用 KQL 表达或存储在 KQL Database 中的任何内容，请使用 `eventhouse-cli`。对于流式拓扑，请使用匹配的 `eventstream-cli` 模式；对于针对 Warehouse 或 Lakehouse SQL 终结点执行的 T-SQL，请使用匹配的 `sqldw-*` 技能。

# Fabric Eventhouse / KQL Database -- CLI 技能

此技能统一负责 Fabric Eventhouse 和 KQL Database：架构与引入管理，以及只读 KQL 分析。

它是一个**模式分派器**，不包含任何操作步骤。请从下表中选择与请求匹配的模式，然后在发出任何命令之前，**使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件**。该文件包含终结点、有效负载结构、模板和注意事项；不阅读它就采取行动会导致错误的有效负载和错误的结果。

## 模式选择

| 模式 | 在请求有以下需求时使用…… | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 运行 KQL 管理命令（`.create`、`.alter`、`.ingest`、`.drop`），或管理策略、映射、函数或具体化视图 | 创建 KQL 表、KQL 引入、KQL 保留策略、KQL 函数、具体化视图、KQL 映射 | [references/authoring.md](references/authoring.md) |
| `consumption` | 运行只读 KQL（`where`、`summarize`、`join`、`render`），使用 `.show` 发现架构，或监视引入运行状况 | KQL 查询、查询 Eventhouse、时序 KQL、显示 KQL 表、探索 Eventhouse | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 只能发出只读 KQL 和 `.show` 命令。任何会更改状态的点命令（`.create`、`.alter`、`.ingest`、`.drop`、`.set-or-append`）都需要使用创作模式：请明确说明这一点，阅读 `references/authoring.md`，然后继续。

如果请求确实跨越多个模式，请逐一处理，并在开始每个部分之前阅读相应的参考文件。如果阅读此表后模式仍不明确，请提出一个简短的澄清问题，而不是猜测。

## 最终写入 -- 不得跳过的步骤

阅读参考文件并规划变更并不等于完成任务。每个变更模式都以一次更改状态的调用结束。如果你没有发出该调用，则不会持久化任何内容——请明确说明这一点，而不是报告成功。

| 模式 | 最终写入 |
|---|---|
| `authoring` | `POST .../v1/rest/mgmt`，携带字面量 `.create-merge table`（或与 `CREATE TABLE` 等效的命令）、`.alter` 或 `.ingest` 命令。编写 KQL 管理命令并向用户展示并不等于执行该命令。 |
| `consumption` | 无——此模式为只读 |

在报告任务完成之前，请确认终端调用已成功返回；如果参考文档中说明了回读操作，请回读该产物，以证明更改已生效。

## 共享基础要求（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；在处理任何身份验证问题之前阅读 |
| 身份验证操作方法 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中只选择一种模式。
- 在该模式的第一条命令之前，将 `references/<mode>.md` 从头到尾读完，并将此操作作为你的**第一次工具调用**。一次性完整读取且仅限一次：不要重新打开，不要再次对其执行 grep，也不要分页读取。你已经拥有其中的内容。
- 对你加载的所有其他文件遵循相同的仅阅读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考文档和共享的 `common/*.md` 文件：仅打开你实际需要的文件，每个文件只从头到尾读取**一次**，并且绝不对已加载的文件执行 grep 或重新打开。
- 通过列出并筛选来解析工作区和项目 ID，绝不猜测 GUID。
- 当请求跨越模式边界时，明确宣布模式切换。
- 将参考文档视为操作说明，而不是交付成果。阅读后，针对实时工作区**运行**文档中说明的命令，并报告真实结果。引用参考文档的内容而不实际执行，并不能回答请求。

### 优先

- 选择能够满足请求的最小范围模式。
- 只阅读**一个**模式参考文档。仅当请求确实跨越多种模式时才加载第二个，并在执行前明确说明。
- 在首次响应中报告你选择的模式，以便用户进行纠正。

### 避免

- 仅依据此调度文档执行操作——它有意省略了具体操作细节。
- 使用参考文档的摘要作答，而不是实际执行操作。
- 重新读取或再次对已加载的参考文档执行 grep；这会浪费交互轮次和令牌。
- 在只读模式下更改任何内容。
- 对本技能系列已经涵盖的工作加载其他技能（请参阅关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “过去一天，Telemetry eventhouse 中每小时接收了多少个事件？” | `consumption` | [references/consumption.md](references/consumption.md) |
| “为传感器数据馈送创建一个 KQL 表，并设置 30 天的保留策略。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示 KQL 数据库中的表及其行数。” | `consumption` | [references/consumption.md](references/consumption.md) |