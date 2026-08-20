---
name: eventstream-cli
description: "Build and inspect Fabric Eventstream topologies: sources, operators, destinations and stream routing, plus read-only topology, retention, throughput and connection-string inspection. Querying landed events uses eventhouse-cli consumption mode. Triggers:create eventstream,add filter operator,CDC source,inspect eventstream topology,eventstream retention,list eventstreams"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: eventstream-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventstream-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但无论如何都必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选
> 3. **技能消歧**：对 Eventstream 项本身使用 `eventstream-cli`——即事件如何从源经过运算符流向目标。数据进入 Eventhouse / KQL Database 后，对其进行查询或整形，应使用匹配的 `eventhouse-cli` 模式；警报则使用匹配的 Activator 创作或使用技能。

# Fabric Eventstream -- CLI 技能

这一项技能负责 Fabric Eventstream 实时引入拓扑：源、运算符、目标、路由、保留和运行状况。

它是一个**模式分派器**，不包含任何过程。请从下表中选择与请求匹配的模式，然后**在发出任何一条命令之前，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；未阅读便操作会产生错误的有效负载和错误的结果。

## 模式选择

| 模式 | 当请求涉及以下情况时使用…… | 触发示例 | 首先阅读此文件 |
|---|---|---|---|
| `authoring` | 创建、更新、连接、暂停、恢复或删除 Eventstream 拓扑 | 创建 Eventstream、部署拓扑、添加源、添加筛选运算符、连接目标、更新定义 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出或检查 Eventstream、拓扑、保留、吞吐量、节点运行状况或 Custom Endpoint 连接元数据 | 列出 Eventstream、检查拓扑、Eventstream 状态、保留、吞吐量、连接字符串 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

对于 Eventstream 定义和拓扑，`consumption` 是只读的。创建、更新、删除、暂停或恢复 Eventstream 的请求需要使用 `authoring`：说明这一点，阅读 `references/authoring.md`，然后继续。

在进行创作变更之前，应明确适用的源、目标、转换、保留和吞吐量要求。如果笼统的请求遗漏了这些要求，请先提出一个简洁的澄清问题，再读取工作区状态或调用 API，而不要自行臆造拓扑。

如果请求确实跨越多个模式，请逐一处理，并在开始每个部分之前阅读相应的参考文件。如果阅读此表后模式仍不明确，请提出一个简短的澄清问题，而不要猜测。

## 终端写入 -- 不得跳过的步骤

阅读参考文件并规划拓扑并不意味着任务已经完成。每个变更模式都以一次改变状态的调用结束。如果你没有发出该调用，则不会持久保存任何内容——请明确说明这一点，而不要报告成功。

| 模式 | 终端写入操作 |
|---|---|
| `authoring` | 使用 `POST /v1/workspaces/{ws}/items` 或 `/eventstreams` 创建，使用 `POST .../updateDefinition` 持久化拓扑更改，使用无请求正文的 `POST .../pause` 或带有必需 JSON `startType` 请求正文的 `POST .../resume` 进行生命周期控制，或使用 `DELETE .../eventstreams/{id}` 删除该项。构建 `eventstream.json` 或对其进行 base64 编码并不属于写入操作。 |
| `consumption` | 无——此模式为只读模式 |

在报告创作任务已完成之前，请确认最终调用已成功返回；如果参考文档中记载了验证步骤，还需重新读取定义或运行时拓扑。

## 共享基础要求（所有模式）

首先解析工作区和事件流；每种模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 身份验证操作指南 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 常见问题与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 执行任何其他操作之前，必须从上表中准确选择一种模式。
- 在执行该模式的第一条命令之前，必须将 `references/<mode>.md` 从头到尾读完，并将此操作作为你的**第一次工具调用**。
- 通过列出并筛选来解析工作区和事件流 ID，绝不能靠猜测 GUID。
- 当请求跨越模式边界时，明确宣布模式切换。
- 将参考文档视为操作说明，而不是交付内容。阅读后，针对实时工作区**运行**文档中记载的命令，并报告真实结果。
- 创作节点名称只能使用字母和数字组成的 PascalCase；平台生成的 DefaultStream 名称除外。
- 检索自定义终结点凭据之前，必须获得用户明确确认；除非用户在安全环境中明确请求，否则绝不能输出原始密钥或连接字符串。

### 优先

- 选择能够满足请求的最窄模式。
- 只阅读**一个**模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载前说明。
- 使用运行时拓扑检查运行状况和连接；使用解码后的定义查看及更改创作时的图结构。

### 避免

- 仅根据此分派器采取行动——它有意省略了操作细节。
- 只提供参考文档的摘要，而不实际执行其中的操作。
- 在只读使用模式下修改任何内容。
- 通过 Eventstream API 查询已写入的事件数据；对于只读 KQL 数据，请使用 `eventhouse-cli` 使用模式。
- 对于此技能已负责的工作，加载其他技能（参见关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “创建一个以 SampleData 为源、以 Lakehouse 为目标的 Eventstream。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “为我的 Eventstream 添加一个温度高于 30 的筛选器。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示 SensorIngestion 中的所有源、运算符和目标。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “此 Eventstream 使用了哪些保留和吞吐量设置？” | `consumption` | [references/consumption.md](references/consumption.md) |