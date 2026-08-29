---
name: eventhouse-cli
description: "Authors and queries Fabric Eventhouse and KQL databases: tables, functions, policies, materialized views, ingestion, and read-only KQL for real-time and time-series analytics. All KQL database work belongs here, table creation and simple queries included. An Eventstream item is eventstream-cli; an Event Schema Set is eventschemaset-cli."
---
> **遥测——强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: eventhouse-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventhouse-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数——但仍要添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 过滤
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 过滤
> 3. **技能消歧**：凡是使用 KQL 表达或存储在 KQL Database 中的内容，都使用 `eventhouse-cli`。对于流式拓扑，使用匹配的 `eventstream-cli` 模式；对于针对 Warehouse 或 Lakehouse SQL endpoint 的 T-SQL，使用匹配的 `sqldw-*` skill。

# Fabric Eventhouse / KQL Database——CLI Skill

此 skill 负责 Fabric Eventhouse 和 KQL Database：架构与摄取管理，以及只读 KQL 分析。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后在执行任何命令**之前**，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件。该文件包含端点、有效负载格式、模板和注意事项；不阅读该文件就执行操作，会产生错误的有效负载和错误的结果。

## 模式选择

| 模式 | 在请求……时使用 | 示例触发词 | 先阅读此文件 |
|---|---|---|---|
| `authoring` | 运行 KQL 管理命令（`.create`、`.alter`、`.ingest`、`.drop`）、策略、映射、函数或物化视图 | 创建 kql 表、kql 摄取、kql 保留策略、kql 函数、物化视图、kql 映射 | [references/authoring.md](references/authoring.md) |
| `consumption` | 运行只读 KQL（`where`、`summarize`、`join`、`render`）、使用 `.show` 发现架构，或监控摄取运行状况 | kql 查询、查询 eventhouse、时间序列 kql、使用 kql 显示表、探索 eventhouse | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 只能执行只读 KQL 和 `.show` 命令。任何会更改状态的点命令（`.create`、`.alter`、`.ingest`、`.drop`、`.set-or-append`）都需要使用 `authoring` 模式：说明这一点，阅读 `references/authoring.md`，然后继续操作。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理该部分之前阅读相应的参考文件。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，不要自行猜测。

## 参考索引

先阅读模式参考文件；仅当任务需要时，才打开下面的主题文件。此处列出了所有参考文件，因此请从此表中阅读文件，不要跟随其他参考文件中的链接。

| 参考文件 | 在以下情况下阅读 |
|---|---|
| [references/authoring.md](references/authoring.md) | 任何 `authoring` 请求——从这里开始 |
| [references/authoring-core.md](references/authoring-core.md) | 需要了解 authoring 任务背后的能力矩阵、表/架构、摄取、策略、外部表或权限详细信息 |
| [references/authoring-advanced-operations.md](references/authoring-advanced-operations.md) | 物化视图、存储函数、更新策略、架构演变或监控 authoring 操作 |
| [references/authoring-scripts.md](references/authoring-scripts.md) | 需要用于创建并摄取、架构部署、导出或策略的可直接运行脚本——**从 `scripts/` 运行这些脚本，不要阅读它们** |
| [references/consumption.md](references/consumption.md) | 任何 `consumption` 请求——从这里开始 |
| [references/consumption-discovery-queries.md](references/consumption-discovery-queries.md) | 需要用于架构、表或摄取运行状况的 `.show` 发现查询 |
| [EVENTHOUSE-CONSUMPTION-CORE.md](../../common/EVENTHOUSE-CONSUMPTION-CORE.md) | 连接基础知识、架构发现与安全性、监控、性能最佳实践或常见 KQL 查询模式——**编写 KQL 前阅读** |

## 终端写入——不得跳过的步骤

阅读参考资料并规划更改**不等于**完成任务。每种变更模式都必须以一次状态变更调用结束。如果未发出该调用，则没有任何内容被持久化——请明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | `POST .../v1/rest/mgmt`，携带字面量 `.create-merge table`（或等效的 `CREATE TABLE`）、`.alter` 或 `.ingest` 命令。编写 KQL 管理命令并向用户展示，并不等于执行该命令。 |
| `consumption` | 无——此模式为只读模式 |

在报告任务完成之前，确认终端调用返回成功；如果参考资料要求回读，则回读该项目，以证明更改已生效。

## 共享必备事项（所有模式）

首先解析工作区和项目；所有模式都依赖这一步。

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云/非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前必须阅读 |
| 身份验证操作指南 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 作为该模式的**第一个工具调用**，从头到尾阅读 `references/<mode>.md`，然后再执行该模式的第一个命令。一次完整读取即可：不要重新打开，不要再次 grep，也不要分页读取。你已经拥有该文件的全部内容。
- 对加载的其他所有文件也遵循同样的只读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考资料和共享的 `common/*.md` 文件：只打开实际需要的文件，每个文件从头到尾阅读一次，绝不要对已经加载的文件进行 grep 或重新打开。
- 通过列出并筛选来解析工作区和项目 id，绝不要猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考资料视为操作说明，而不是交付物。阅读之后，针对实际工作区运行文档中记录的命令，并报告真实结果。仅仅引用参考资料中的内容而不执行命令，并不能回答请求。

### **优先事项**

- 满足请求所需的最窄模式。
- 只读取一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在执行前说明。
- 在首次响应中说明你选择的模式，以便用户纠正你。

### **避免事项**

- 仅根据此调度器执行操作——它有意省略了具体操作细节。
- 用参考文档的摘要来回答，而不是按照其中的要求执行。
- 重新读取或重新搜索已经加载过的参考文档；这会消耗轮次和令牌。
- 在只读模式下修改任何内容。
- 为此系列已负责的工作加载其他 skill（参见**关键说明 3**）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “Telemetry eventhouse 在过去一天中每小时到达了多少个事件？” | `consumption` | [references/consumption.md](references/consumption.md) |
| “为传感器数据流创建一个 KQL 表，并设置 30 天的保留策略。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示 KQL 数据库中的表及其行数。” | `consumption` | [references/consumption.md](references/consumption.md) |