---
name: eventstream-cli
description: "Owns Fabric Eventstream items end to end: sources, operators, destinations, routing, retention, throughput and connection strings, plus read-only topology checks. Pick it for anything that names an Eventstream, creating and listing included. Where the rows finally land is eventhouse-cli."
---
> **Telemetry — 必须。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: eventstream-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventstream-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了它——但仍要添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **技能区分**：对于 Eventstream 项目本身——即事件如何从源经过运算符流向目标——使用 `eventstream-cli`。数据进入 Eventhouse / KQL Database 后的查询或整形使用匹配的 `eventhouse-cli` 模式；告警使用匹配的 Activator 创作或使用技能。

# Fabric Eventstream -- CLI 技能

此技能负责 Fabric Eventstream 的实时摄取拓扑：源、运算符、目标、路由、保留和运行状况。

它是一个**模式分发器**，不包含任何操作流程。根据下表选择与请求匹配的模式，然后在执行任何命令**之前，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；不阅读该文件就执行操作会产生错误的有效负载和错误的结果。

## 模式选择

| 模式 | 请求内容 ... 时使用 | 示例触发词 | 首先阅读 |
|---|---|---|---|
| `authoring` | 创建、更新、连接、暂停、恢复或删除 Eventstream 拓扑 | 创建 eventstream、部署拓扑、添加源、添加筛选运算符、连接目标、更新定义 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出或检查 Eventstream、拓扑、保留、吞吐量、节点运行状况或 Custom Endpoint 连接元数据 | 列出 eventstreams、检查拓扑、eventstream 状态、保留、吞吐量、连接字符串 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

对于 Eventstream 定义和拓扑，`consumption` 只读。创建、更新、删除、暂停或恢复 Eventstream 的请求需要使用 `authoring`：说明这一点，阅读 `references/authoring.md`，然后继续操作。

在执行创作变更之前，确定适用的源、目标、转换、保留和吞吐量要求。如果通用请求中未提供这些信息，请先提出一个简洁的澄清问题，然后再读取工作区状态或调用 API，而不是自行臆造拓扑。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理该部分之前阅读相应的参考文件。如果阅读此表后模式仍不明确，请提出一个简短的澄清问题，而不是猜测。

## 终端写入 -- 不得跳过的步骤

阅读参考文件并规划拓扑**不等于**完成任务。每个会修改状态的模式都必须以一次状态变更调用结束。如果没有发出该调用，就没有任何内容被持久化——应明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 使用 `POST /v1/workspaces/{ws}/items` 或 `/eventstreams` 创建，使用 `POST .../updateDefinition` 持久化拓扑更改，使用无请求正文的 `POST .../pause` 或带有必需 JSON `startType` 请求正文的 `POST .../resume` 进行生命周期控制，或使用 `DELETE .../eventstreams/{id}` 移除项目。构建或进行 base64 编码的 `eventstream.json` 不属于写入操作。 |
| `consumption` | 无 -- 此模式为只读模式 |

在报告 authoring 任务完成之前，请确认终端调用已返回成功，并在参考文档要求验证步骤时读取定义或运行时拓扑进行回读验证。

## 所有模式的共用要点

首先解析 workspace 和 Eventstream；每种模式都依赖它们。

| 任务 | 参考 | 备注 |
|---|---|---|
| 在 Fabric 中查找 Workspaces 和 Items | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** -- 在解析任何 workspace 或 item id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | Sovereign / non-public cloud 主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；在处理任何身份验证问题之前必须阅读 |
| 身份验证方法 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 在该模式执行第一个命令之前，作为**第一个工具调用**完整阅读 `references/<mode>.md`。
- 通过列出并筛选来解析 workspace 和 Eventstream id，绝不能猜测 GUID。
- 当请求跨越边界时，必须明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付物。阅读后，针对实时 workspace 运行文档中所述的命令，并报告真实结果。
- authoring 节点名称必须使用字母数字 PascalCase；平台生成的 DefaultStream 名称是例外。
- 在获取 Custom Endpoint 凭据之前，必须获得用户的明确确认；除非用户在安全上下文中明确提出请求，否则绝不能打印原始密钥或连接字符串。

### 优先

- 选择能够满足请求的最窄模式。
- 只阅读一个模式参考文档。只有当请求确实跨越多个模式时才加载第二个，并在加载之前说明原因。
- 使用运行时拓扑进行运行状况和连接检查；使用解码后的定义检查 authoring 时的图结构和更改。

### 避免

- 仅根据此调度器执行操作——它有意省略了操作细节。
- 用参考文档的摘要作答，而不是执行其中的内容。
- 在只读消费模式下修改任何内容。
- 通过 Eventstream API 查询已写入的数据；对于只读 KQL 数据，请使用 `eventhouse-cli` 消费模式。
- 为此技能已经负责的工作加载其他技能（参见关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “使用 SampleData 源和 Lakehouse 目标创建一个 Eventstream。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “为我的 Eventstream 添加一个温度高于 30 的筛选器。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示 SensorIngestion 中的每个源、运算符和目标。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “此 Eventstream 使用了哪些保留和吞吐量设置？” | `consumption` | [references/consumption.md](references/consumption.md) |