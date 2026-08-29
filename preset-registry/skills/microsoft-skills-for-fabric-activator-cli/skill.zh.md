---
name: activator-cli
description: "Creates and inspects Fabric Activator (Reflex) alerts: rules, their data sources, conditions, and the Teams or email action they fire, plus decoding an existing ReflexEntities definition. Choose it whenever someone wants to be told, or something done, when values cross a threshold. The pipeline delivering those values is eventstream-cli."
---
> **Telemetry — 必须遵守。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: activator-cli`（`az rest`：`--headers "x-ms-fabric-skill=activator-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头 — 但仍必须添加。

> **重要说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **Skill 消歧**：对于每个 Fabric Activator / Reflex 项目（包括编写警报规则和检查现有警报），都使用 `activator-cli`。为警报提供数据的流式拓扑属于 `eventstream-cli`，其背后的 KQL 数据库属于 `eventhouse-cli`，而 Power BI 报表相关问题使用 `fabriciq`。

# Fabric Activator (Reflex) — CLI Skill

此 Skill 负责 Fabric Activator / Reflex 项目：警报规则、其源、其操作，以及包含这些内容的 `ReflexEntities.json` 定义。

它是一个**模式分发器**，不包含任何操作流程。根据下表选择与请求匹配的模式，然后在执行任何命令**之前，使用文件读取工具从头到尾读取匹配的 `references/<mode>.md` 文件**。该文件包含端点、实体架构、模板和注意事项；不读取该文件就执行操作会生成无效的 `ReflexEntities.json` 有效负载并导致 400 错误。

该参考文件是执行*操作*所必需的，而不是*提问*所必需的。如果请求信息不足，而你的下一条消息将是不包含 Fabric 调用的澄清问题，请现在直接提问，并在继续执行操作时再读取参考文件。

## 模式选择

| 模式 | 请求内容适用于该模式的情况 | 示例触发语句 | 首先读取此文件 |
|---|---|---|---|
| `authoring` | 创建、更新、配置或删除 Activator 项目、规则、源或操作 | 创建警报、创建 activator、创建 reflex、在……时通知我、在……时告诉我、在……时采取操作、在……时给我发送电子邮件、在……时发送 Teams 消息、在……时运行管道、更新警报、删除警报 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出、检查、解码或解释现有的 Activator、规则、源或操作 | 显示我的警报、我有哪些警报、列出 activator、检查此警报、显示规则、显示源、获取 reflex 定义、为什么会触发此警报 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 是只读模式。创建、更新、配置或删除 Activator 项目、规则、源或操作的请求需要使用 `authoring`：说明这一点，读取 `references/authoring.md`，然后继续执行。

纯 GET / 解释请求应保留在 `consumption` 中 — 不要切换到 `authoring`，也不要为了回答请求而进行任何变更。

如果请求确实跨越多个模式，请逐个处理，并在开始处理相应部分之前读取每个参考文件。如果读取此表后模式仍然不明确，请提出一个简短的澄清问题，而不是猜测。

## 终端写入——不得跳过的步骤

阅读参考文档、解码定义并组装实体并不代表任务已完成。编写操作以一次改变状态的调用结束。如果你没有发出该调用，则任何内容都不会被持久化——请明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | `POST /v1/workspaces/{ws}/reflexes` 用于创建项目，`POST /v1/workspaces/{ws}/reflexes/{id}/updateDefinition` 用于持久化规则、源和操作，或使用 `DELETE /v1/workspaces/{ws}/reflexes/{id}` 删除项目。构建、字符串化或对 `ReflexEntities.json` 进行 base64 编码都不属于写入。 |
| `consumption` | 无——此模式为只读 |

在报告编写任务完成之前，确认终端调用返回了明确的成功结果（HTTP `200`/`201`，或在返回 `202` 时确认终端 LRO 成功），然后按照模式参考文档中的说明读回定义。Power BI 源是例外：公共 ALM 导出可能会拒绝一个已成功导入的项目，因此空的或不可用的读回结果**不**能证明写入失败——请根据 [references/authoring/powerbi-source.md](references/authoring/powerbi-source.md) 的规定，分别报告 `updateDefinition` 的结果和读回限制。

### 源验证门禁（仅限 authoring）

在编写任何引用信号的规则之前，确认源真实存在：仅在请求的工作区中**解析**该源，**验证**请求的列/字段/属性确实存在于该源上，并且至少**观察**一条携带该信号的代表性行、事件或样本。

仅有架构、零行、不产生数据或过时的证据都属于**缺少源数据**。当源缺失时，**停止并询问**哪个源以及哪些字段提供该信号——不要创建 Reflex，也不要对不相关的现有 Activator 或 Eventstream 调用 `updateDefinition` 来强行适配请求，并明确说明未创建或更新任何 Activator / Reflex / Eventstream。唯一的例外是明确要求针对未来的/尚未产生数据的源进行编写；在这种情况下，你必须说明这是一个假设。

运行此门禁所需的一切内容都在本页面上。如果请求已经缺少源映射、阈值、接收者或操作目标，请先询问这些信息——不要读取 `references/authoring.md`，也不要调用 Fabric API，只为了发现请求信息不完整。

## 共享必备事项（所有模式）

首先解析工作区和 Activator 项目；所有模式都依赖它们——按照 CRITICAL NOTES 1 和 2 中的说明，按显示名称进行列表和精确筛选。该配方是自包含的，你只需依此开始。

下表是位于共享 `common/` 文档中的**可选背景信息**。只有在确实需要相关细节时才打开对应行。如果你的环境中不存在 `common/`，请用一行说明，然后继续阅读模式参考文档——**绝不要**为了寻找它而对文件系统执行 glob、列表或搜索操作。

| 任务 | 参考 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | 分页和 JMESPath 筛选详细信息 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前先阅读 |
| 身份验证配方 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| Fabric 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| Fabric 项目定义 | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope) | Base64 编码的 `parts` 结构 |
| 易错点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

Activator 使用 `reflexes` 集合，而不是通用的 `items` 集合：`/v1/workspaces/{workspaceId}/reflexes[/{reflexId}]`。

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 在该模式执行第一条命令之前，作为你的第一个工具调用，从头到尾阅读 `references/<mode>.md`。如果回复仅提出澄清问题且未发出 Fabric 调用，则暂时不需要阅读。
- 每次 `az rest` 调用都必须传递 `--resource https://api.fabric.microsoft.com` — 不传递该参数时，令牌受众不正确，调用会返回 401。
- 使用 `--body '{}'` 将 `getDefinition` 作为 **POST** 调用，然后先对 `ReflexEntities.json` 部分进行 Base64 解码，再检查其内容；GET 请求会返回 405，而省略请求体可能会返回 411。
- 当 `create`、`getDefinition` 或 `updateDefinition` 返回 202 时，轮询 `Location` 标头。
- 通过列出并筛选的方式解析工作区和 Activator ID，绝不能猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为操作说明，而不是交付成果。阅读之后，对实时工作区执行文档中记录的命令，并报告真实结果。
- 在 `authoring` 模式下，编写规则之前必须通过[源验证门（仅限 authoring 模式）](#source-validation-gate-authoring-only)，并使用 Python 的 `json.dumps()` 构建 `ReflexEntities.json` — PowerShell 的 `ConvertTo-Json` 会破坏 `definition.instance` 所要求的嵌套 JSON 字符串。

### 首选

- 使用能够满足请求的最窄模式。
- 恰好阅读一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载之前说明这一点。
- 在 `authoring` 模式下，优先采用读取-修改-写入，而不是完全替换：获取当前定义，修改实体数组，然后更新。
- 在 `authoring` 模式下，除非用户明确要求在值保持触发状态时重复触发，否则优先使用基于状态转换的检测器（`NumberBecomes`、`NumberEntersOrLeavesRange`、`LogicalBecomes`），而不是稳态条件。
- 在 `consumption` 模式下，先提供摘要视图，再查看单个实体：先给出高层概览，然后深入细节。
- 如果本次会话中较早的工作发现了及时的运营信号 — 峰值、故障、异常、SLA 风险或容量限制 — 则主动提供创建警报，而不是等用户提出请求。询问一次，并且在用户同意之前不要创建任何内容。

### 避免

- 仅依据此调度器采取行动 — 它有意省略了实体架构和模板。
- 用参考文档的摘要来回答，而不是执行其中的内容。
- 在只读的 `consumption` 模式下修改任何内容，包括“只是检查一下”。
- 在任一模式下硬编码工作区或项目 ID — 始终动态解析。
- 对 `common/` 文档执行通配、列出或 shell 搜索。它们只是可选的背景资料；如果链接无法解析，用一行说明，然后继续。
- 在此处构建为警报提供数据的 Eventstream 拓扑；这属于 `eventstream-cli`。查询警报背后的 KQL 数据则属于 `eventhouse-cli`。
- 为此技能已经负责的工作加载其他技能（参见 CRITICAL NOTES 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考资料 |
|---|---|---|
| "在我的工作区中创建一个名为 eval_smoke_activator 的 Activator。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "当平均温度超过 30 时，通过 Teams 通知我。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "删除那条用于通过电子邮件通知我流水线运行失败的警报。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "显示此工作区中的所有 Activator。" | `consumption` | [references/consumption.md](references/consumption.md) |
| "SkillsTestActivator 背后的规则和操作是什么？" | `consumption` | [references/consumption.md](references/consumption.md) |
| "解码此 Reflex 定义，并解释 Power BI 源。" | `consumption` | [references/consumption.md](references/consumption.md) |