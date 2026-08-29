---
name: dataflows-cli
description: "Manages Fabric Dataflow Gen2 items, including creation, M editing, connections, output destinations, getDefinition and updateDefinition inspection, executeQuery, refresh history, and Gen1-to-Gen2 save-as upgrades via saveAsNativeArtifact. Use for Dataflow items or Power Query M definitions. For pipeline JSON use pipeline-migration; for Spark or Warehouse transformations use their own skills."
---
> **遥测 — 强制要求。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: dataflows-cli`（`az rest`：`--headers "x-ms-fabric-skill=dataflows-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **Skill 消歧**：对于每个 Fabric Dataflow Gen2 项目和 Power Query M 相关问题，使用 `dataflows-cli`。Synapse / ADF 管道和数据集 JSON 转换使用 `pipeline-migration`；Spark notebook 转换使用 `spark-cli`；T-SQL 转换使用 `sqldw-cli`。

# Fabric Dataflow Gen2 -- CLI Skill

此 Skill 专门负责 Fabric Dataflow Gen2 项目：连接、Power Query M、输出目标、已保存的定义、刷新历史记录以及 Gen1 升级。

它是一个**模式分发器**，不包含任何操作流程。根据请求从下表中选择匹配的模式，然后在执行任何命令**之前，使用文件读取工具完整阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、负载结构、模板和注意事项；不阅读该文件就执行操作会产生错误的负载和错误的结果。

每个会话只需阅读一次。已经阅读过的文件会保留在上下文中，因此后续轮次无需重新阅读；仅当某一行所对应的内容仍是你需要的信息时，才打开 `references/<mode>/` 下更深层的文件，并且只打开该行所对应的文件。

## 模式选择

| 模式 | 当请求……时使用 | 示例触发条件 | 首先阅读 |
|---|---|---|---|
| `authoring` | 创建或更改数据流：连接、凭据、保存前预览的 M 编辑、输出目标、updateDefinition | executeQuery 预览、updateDefinition、连接设置、supportedConnectionTypes、credentialType、添加输出目标 | [references/authoring.md](references/authoring.md) |
| `consumption` | 读取已保存的数据流：定义、参数、刷新历史记录，或运行已保存的/临时的只读 M 查询并解析 Arrow | getDefinition、executeQuery 已保存查询、临时查询、Arrow IPC、刷新历史记录 | [references/consumption.md](references/consumption.md) |
| `upgrade` | 通过另存为和重新绑定将 Gen1 数据流升级到 Gen2.1，或评估升级准备情况/风险 | Gen1 Gen2 准备情况、saveAsNativeArtifact、克隆 Gen1 数据流、升级风险评估 | [references/upgrade.md](references/upgrade.md) |

### 模式边界规则

`consumption` 是只读模式。用于在 `updateDefinition` **之前**验证 M 的预览运行，以及任何功能查找（`supportedConnectionTypes`、`credentialType`），都属于 `authoring`，即使它们发出的是相同的 `executeQuery` 调用——应根据意图而不是端点进行分类。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理该部分之前阅读相应的参考文件。如果阅读此表后模式仍不明确，请提出一个简短的澄清问题，而不是自行猜测。

## 终端写入——绝不能跳过的步骤

读取参考资料并规划更改并不等于完成任务。每种变更模式都会以一次改变状态的调用结束。如果你没有发出该调用，则任何内容都不会被持久化——应明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | `POST /v1/workspaces/{ws}/dataflows/{id}/updateDefinition`，用于持久化 M、连接和输出目标；新的 dataflow 需要先调用 `POST /v1/workspaces/{ws}/items`（或 `/dataflows`）。`executeQuery` 只是预览，不会写入任何内容。如果用户要求刷新，还需要调用 `POST .../jobs/instances?jobType=Refresh`。 |
| `consumption` | 无——此模式为只读 |
| `upgrade` | 使用 `saveAsNativeArtifact` 创建 Gen2.1 工件，然后重新绑定。仅有就绪性报告并不会升级任何内容。 |

在报告任务完成之前，确认终端调用返回成功；如果参考资料记录了回读步骤，还要将工件读回，以证明更改已经生效。

### `upgrade` 代际边界——硬停止（强制）

另存为操作只能从 Gen1 运行到 Gen2.1。对于源为 Gen2 或尚未确定源代际的执行请求，应说明不存在公开的另存为或就地升级端点，并在进行任何 API 调用之前停止。若只读就绪性扫描的目的是发现并分类 Gen1 候选项，则不受此限制。

不要将“选择最接近的端点并继续”理解为允许导出定义并创建副本；不要改用 `authoring` 来执行此操作，也不要进行任何变更。请用户澄清预期结果并明确批准。

### `consumption` 报告

`consumption` 没有终端写入，因此其交付物就是答案本身。当该模式运行 `executeQuery` 时，应说明所调用的操作，并在结果旁逐字写出所发送的 `QueryName`，同时说明它是已保存的 `shared` 成员，还是未持久化的临时 `customMashupDocument`。仅凭行数据无法告诉用户生成这些结果的是哪次调用。

这仅适用于 `consumption`。在 `authoring` 中，`executeQuery` 是中间预览步骤——不要围绕它增加报告环节；继续执行终端写入。

## 共享必备事项（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制**——在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云/非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；在进行任何身份验证操作之前必须阅读 |
| 身份验证配方 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在进行任何其他操作之前，从上面的表格中准确选择一种模式。
- 在执行该模式的第一个命令之前，作为你的第一次工具调用，完整阅读 `references/<mode>.md`，从头到尾读完。只读取一次，并在一次完整读取中完成：不要重新打开，不要再次 grep，也不要分页读取。你已经拥有它。
- 通过列出并筛选来解析工作区和项目 id，绝不能猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付物。阅读完后，针对实时工作区运行文档中规定的命令，并报告真实结果。只引用参考文档中的内容而不执行命令，并不能回答请求。
- 当“Fabric 支持什么”的问题本身就是交付物时——例如受支持的连接类型、连接器的参数、可用的凭据类型——应从参考文档指定的端点获取答案，而不是依据参考文档自身的列表，并在回答中注明该端点。无论处于哪种模式，读者都无法分辨某个值是实时值还是引用值，除非你说明其来源。这是最终答案中的措辞要求，不是额外步骤。
- 生成用户要求的每一项成果，并使用用户采用的名称。执行正确的 API 调用不能替代用户要求的报告：如果请求指定了交付物，就必须输出该交付物；即使结论是“无”或“不适用”，也要保留其标题。

### 建议

- 使用能够满足请求的最窄模式。
- 恰好阅读一个模式参考文档。只有当请求确实跨越多个模式时才加载第二个，并在加载前说明这一点。
- 在首次响应中报告你选择的模式，以便用户进行纠正。

### 避免

- 仅依据这个调度器采取行动——它有意省略了操作细节。
- 用参考文档的摘要来回答，而不是执行操作。
- 重新读取或再次 grep 已经加载过的参考文档；这会浪费轮次和 token。
- 在只读模式下执行任何变更操作。
- 对本技能已经负责的工作加载其他技能（参见 CRITICAL NOTES 3）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “显示 SalesIngest dataflow 的刷新历史和参数。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “预览此 M 查询，然后将其保存到 SalesIngest dataflow 定义中。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “我的 Gen1 dataflow 是否已准备好升级到 Gen2.1？” | `upgrade` | [references/upgrade.md](references/upgrade.md) |