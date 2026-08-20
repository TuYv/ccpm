---
name: dataflows-cli
description: "Author, inspect and upgrade Fabric Dataflow Gen2: connection and output setup, M preview via executeQuery, saved definition and refresh-history inspection, and Gen1-to-Gen2 save-as upgrades. Pipeline JSON is pipeline-migration. Triggers:executeQuery preview,updateDefinition,getDefinition,dataflow refresh history,saveAsNativeArtifact,Gen1 Gen2 readiness"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: dataflows-cli`（`az rest`：`--headers "x-ms-fabric-skill=dataflows-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中可能省略了它，但无论如何都必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **Skill 区分**：所有 Fabric Dataflow Gen2 项目和 Power Query M 相关事项均使用 `dataflows-cli`。Synapse / ADF 管道和数据集 JSON 转换使用 `pipeline-migration`；Spark 笔记本转换使用 `spark-cli`；T-SQL 转换使用 `sqldw-cli`。

# Fabric Dataflow Gen2 -- CLI Skill

此 Skill 负责 Fabric Dataflow Gen2 项目：连接、Power Query M、输出目标、已保存的定义、刷新历史记录和 Gen1 升级。

它是一个**模式分派器**，不包含任何操作步骤。请从下表中选择与请求匹配的模式，然后在发出任何一条命令**之前，使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；若不阅读便执行操作，将导致有效负载和结果错误。

每个会话阅读一次即可。已经阅读过的文件会保留在上下文中，因此后续轮次不要重复阅读；仅当该文件引用表中的某一行与仍需处理的内容匹配时，才打开 `references/<mode>/` 下更深入的文件，并且只打开该行对应的文件。

## 模式选择

| 模式 | 当请求涉及以下内容时使用…… | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 创建或更改数据流：连接、凭据、保存前预览的 M 编辑、输出目标、updateDefinition | executeQuery 预览、updateDefinition、连接设置、supportedConnectionTypes、credentialType、添加输出目标 | [references/authoring.md](references/authoring.md) |
| `consumption` | 读取已保存的数据流：定义、参数、刷新历史记录，或运行已保存的/临时的只读 M 查询并解析 Arrow | getDefinition、executeQuery 已保存查询、临时查询、Arrow IPC、刷新历史记录 | [references/consumption.md](references/consumption.md) |
| `upgrade` | 通过另存为和重新绑定将 Gen1 数据流升级到 Gen2.1，或评估升级准备情况/风险 | Gen1 Gen2 准备情况、saveAsNativeArtifact、克隆 Gen1 数据流、升级风险评估 | [references/upgrade.md](references/upgrade.md) |

### 模式边界规则

`consumption` 为只读模式。用于在 `updateDefinition` **之前**验证 M 的预览运行，以及任何功能查询（`supportedConnectionTypes`、`credentialType`），即使它们发出的是相同的 `executeQuery` 调用，也都属于 `authoring`——应按意图分类，而不是按端点分类。

如果请求确实跨越多个模式，请逐一处理，并在开始每个部分之前阅读相应的参考文件。如果阅读此表后模式仍不明确，请提出一个简短的澄清问题，而不要猜测。

## 终端写入——绝不能跳过的步骤

阅读参考资料并规划变更并不等于完成任务。每种变更模式都以一次改变状态的调用结束。如果你没有发出该调用，就不会持久化任何内容——此时应明确说明，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 调用 `POST /v1/workspaces/{ws}/dataflows/{id}/updateDefinition` 以持久化 M、连接和输出目标；新的数据流需要先调用 `POST /v1/workspaces/{ws}/items`（或 `/dataflows`）。`executeQuery` 仅用于预览，不会写入任何内容。如果用户要求刷新，还需调用 `POST .../jobs/instances?jobType=Refresh`。 |
| `consumption` | 无——此模式为只读模式 |
| `upgrade` | 调用 `saveAsNativeArtifact` 创建 Gen2.1 工件，然后重新绑定。仅提供就绪情况报告不会升级任何内容。 |

在报告任务完成之前，请确认终端调用已成功返回，并且在参考文档说明了回读操作的情况下，回读该工件以证明变更已生效。

### `upgrade` 代际边界——硬性停止（强制）

另存为操作仅适用于从 Gen1 到 Gen2.1。对于源为 Gen2 或尚未确定源代际的执行请求，应说明没有可用的公共另存为或原地升级端点，并在进行任何 API 调用之前停止。这并不妨碍以发现和分类 Gen1 候选项为目的的只读就绪情况扫描。

不要将“选择最接近的端点并继续”理解为允许导出定义并创建副本，不要改用 `authoring` 来执行，也不要变更任何内容。请用户澄清预期结果并明确批准。

### `consumption` 报告

`consumption` 没有终端写入，因此其交付成果就是回答本身。当该模式运行 `executeQuery` 时，应在结果旁注明所调用的操作，并逐字说明所发送的 `QueryName`，同时说明它是已保存的 `shared` 成员，还是未持久化的临时 `customMashupDocument`。仅提供行数据无法让用户知道这些结果由哪个调用产生。

这仅适用于 `consumption`。在 `authoring` 中，`executeQuery` 是中间预览步骤——不要围绕它增加报告轮次；应继续执行终端写入。

## 共同要点（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 身份验证方案 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中选择且仅选择一种模式。
- 在该模式下执行第一条命令之前，必须将 `references/<mode>.md` 从头到尾读完，并将其作为你的第一次工具调用。一次性完整读取且只读一次：不要重新打开，不要再次对其执行 grep，也不要分页读取。你已经拥有其中的信息。
- 通过列出并筛选来确定工作区和项目 ID，绝不能靠猜测 GUID。
- 当请求跨越模式边界时，必须明确宣布模式切换。
- 将参考文档视为操作说明，而不是交付物。阅读后，针对实时工作区运行文档中说明的命令，并报告真实结果。只引用参考文档中的内容而不实际执行，并不能回答请求。
- 当有关 Fabric 支持内容的问题本身就是交付物时——例如支持的连接类型、某个连接器的参数、可用的凭据类型——应从参考文档指定的端点获取答案，而不是依据参考文档自身的列表作答，并在答案中注明该端点。无论你处于哪种模式：如果不说明来源，读者无法判断某个值是实时获取的还是引用而来的。这是对最终答案措辞的要求，而不是额外步骤。
- 按照用户使用的名称，生成用户要求的每一项产物。运行正确的 API 调用不能替代用户要求的报告：如果请求指定了某项交付物，就必须输出该交付物；即使结果是“无”或“不适用”，也要保留其标题。

### 优先

- 选择能够满足请求的最窄模式。
- 只读取一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载前予以说明。
- 在首次响应中报告你选择的模式，以便用户纠正。

### 避免

- 仅依据此分派器执行操作——它有意省略了操作细节。
- 仅总结参考文档而不实际执行操作。
- 重新读取或重新对已加载的参考文档执行 grep；这会浪费轮次和令牌。
- 在只读模式下进行任何修改。
- 对于此技能已经涵盖的工作，不要加载其他技能（参见“关键说明 3”）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “显示 SalesIngest 数据流的刷新历史记录和参数。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “预览此 M 查询，然后将其保存到 SalesIngest 数据流定义中。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “我的 Gen1 数据流是否已准备好升级到 Gen2.1？” | `upgrade` | [references/upgrade.md](references/upgrade.md) |