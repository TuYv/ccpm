---
name: activator-cli
description: "Create and inspect Fabric Activator (Reflex) alerts end to end: author rules, sources and actions, or decode an existing ReflexEntities definition read-only. Streaming topology is eventstream-cli. Triggers:create alert,notify me when,take action when,show my alerts,list activators,get reflex definition"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: activator-cli`（`az rest`：`--headers "x-ms-fabric-skill=activator-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **Skill 区分**：对于每个 Fabric Activator / Reflex 项目，都使用 `activator-cli`——包括创作警报规则和检查现有警报。为警报提供数据的流式拓扑属于 `eventstream-authoring-cli` / `eventstream-consumption-cli`，其背后的 KQL 数据库属于 `eventhouse-authoring-cli` / `eventhouse-consumption-cli`，而 Power BI 报表问题则属于 `fabriciq`。

# Fabric Activator (Reflex) — CLI Skill

此 Skill 统一负责 Fabric Activator / Reflex 项目：警报规则、其数据源、其操作，以及用于保存这些内容的 `ReflexEntities.json` 定义。

它是一个**模式分派器**，不包含任何操作流程。请从下表中选择与请求相匹配的模式，然后在发出任何命令之前，**使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含端点、实体架构、模板和注意事项；若不阅读便执行操作，将生成无效的 `ReflexEntities.json` 有效负载并导致 400 错误。

只有在需要*执行操作*时才需要阅读参考文件，*提出问题*时则不需要。如果请求信息不完整，并且你的下一条消息只是提出澄清问题，不会进行任何 Fabric 调用，请立即提问，等到继续执行操作时再阅读参考文件。

## 模式选择

| 模式 | 在请求执行以下操作时使用…… | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 创建、更新、配置或删除 Activator 项目、规则、数据源或操作 | 创建警报、创建 activator、创建 reflex、在……时通知我、在……时告知我、在……时执行操作、在……时向我发送电子邮件、在……时发送 teams 消息、在……时运行管道、更新警报、删除警报 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出、检查、解码或解释现有的 Activator、规则、数据源或操作 | 显示我的警报、我有哪些警报、列出 activator、检查此警报、显示规则、显示数据源、获取 reflex 定义、为什么会触发此警报 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 为只读模式。创建、更新、配置或删除 Activator 项目、规则、数据源或操作的请求需要使用 `authoring`：说明这一点，阅读 `references/authoring.md`，然后继续。

纯 GET / 解释请求仍使用 `consumption`——不要切换到 `authoring`，也不要为了回答该请求而修改任何内容。

如果请求确实跨越多个模式，请逐一处理，并在开始处理每个部分之前阅读相应的参考文件。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不要猜测。

## 终结写入——绝对不能跳过的步骤

阅读参考文档、解码定义和组装实体并不意味着完成了任务。创作必须以一次会改变状态的调用结束。如果你没有发出该调用，就没有持久化任何内容——请明确说明这一点，而不是报告成功。

| 模式 | 终结写入 |
|---|---|
| `authoring` | 使用 `POST /v1/workspaces/{ws}/reflexes` 创建项目，使用 `POST /v1/workspaces/{ws}/reflexes/{id}/updateDefinition` 持久化规则、源和操作，或使用 `DELETE /v1/workspaces/{ws}/reflexes/{id}` 将其删除。构建、字符串化或进行 base64 编码的 `ReflexEntities.json` 并不属于写入。 |
| `consumption` | 无——此模式为只读 |

在报告创作任务已完成之前，请确认终结调用返回了明确的成功结果（HTTP `200`/`201`，或 `202` 对应的终结 LRO 成功），然后在模式参考文档要求回读的位置回读定义。Power BI 源属于例外情况：公共 ALM 导出可能会拒绝已成功导入的工件，因此回读为空或不可用**不能**证明写入失败——请按照 [references/authoring/powerbi-source.md](references/authoring/powerbi-source.md) 的要求，分别报告 `updateDefinition` 结果和回读限制。

### 源验证关卡（仅限创作模式）

在创作任何引用信号的规则之前，请确认源确实存在：仅在请求指定的工作区中**解析**该源，**验证**所请求的列/字段/属性确实存在于该源上，并**观察**至少一条携带该信号的代表性行、事件或样本。

仅有架构、零行、不发出数据或已过时的证据均属于**源数据缺失**。源缺失时，**停止并询问**哪个源和哪些字段提供该信号——不要创建 Reflex，也不要对无关的现有 Activator 或 Eventstream 调用 `updateDefinition` 来强行适配请求，并明确说明没有创建或更新任何 Activator / Reflex / Eventstream。唯一的例外是用户明确要求针对未来的／尚未发出数据的源进行创作，此时你必须将其声明为一项假设。

运行此关卡所需的一切都在本页面中。当请求本身已经缺少源映射、阈值、接收者或操作目标时，请**首先**询问这些信息——不要只是为了发现请求信息不足而读取 `references/authoring.md`，也不要调用 Fabric API。

## 共享要点（所有模式）

首先解析工作区和 Activator 项目；每种模式都依赖于此——严格按照关键说明 1 和 2 中的描述，列出项目并按显示名称进行精确筛选。该步骤说明是自包含的，包含开始操作所需的全部内容。

下表是位于共享 `common/` 文档中的**可选背景信息**。仅在确实需要相关细节时才打开对应行。如果你的环境中不存在 `common/`，请用一行说明这一点，然后继续使用模式参考文档——**绝对不要使用 glob、列出或搜索文件系统来寻找它。**

| 任务 | 参考文档 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | 分页和 JMESPath 筛选的详细信息 |
| Fabric 拓扑与核心概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前先阅读 |
| 身份验证操作步骤 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| Fabric 项目定义 | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope) | Base64 编码的 `parts` 结构 |
| 易踩坑点与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |

Activator 使用 `reflexes` 集合，而不是通用的 `items` 集合：`/v1/workspaces/{workspaceId}/reflexes[/{reflexId}]`。

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 在该模式的第一条命令之前，将 `references/<mode>.md` 从头到尾读完，并将其作为你的第一次工具调用。如果回复只是提出澄清问题，并且不发出任何 Fabric 调用，则暂时不需要读取。
- 在每次 `az rest` 调用中传递 `--resource https://api.fabric.microsoft.com`——否则令牌受众不正确，调用将返回 401。
- 使用 **POST** 调用 `getDefinition`，并传入 `--body '{}'`，然后在检查之前对 `ReflexEntities.json` 部分进行 Base64 解码；GET 会返回 405，省略请求正文可能会返回 411。
- 当 `create`、`getDefinition` 或 `updateDefinition` 返回 202 时，轮询 `Location` 标头。
- 通过列出并筛选来解析工作区和 Activator ID，绝不要猜测 GUID。
- 当请求跨越模式边界时，明确声明模式切换。
- 将参考文档视为指令，而不是交付物。阅读后，针对实时工作区运行文档中说明的命令，并报告真实结果。
- 在 `authoring` 模式中，编写规则之前必须通过[源验证关卡](#source-validation-gate-authoring-only)，并使用 Python `json.dumps()` 构建 `ReflexEntities.json`——PowerShell 的 `ConvertTo-Json` 会破坏 `definition.instance` 所需的嵌套 JSON 字符串。

### 优先

- 选择能够满足请求的最窄模式。
- 只读取一个模式的参考文档。仅当请求确实跨越多种模式时才加载第二个，并在执行前明确说明。
- 在 `authoring` 模式中，优先采用读取-修改-写入，而不是完全替换：获取当前定义、修改实体数组，然后进行更新。
- 在 `authoring` 模式中，优先使用基于状态转换的检测器（`NumberBecomes`、`NumberEntersOrLeavesRange`、`LogicalBecomes`），而不是稳态条件，除非用户明确要求在值保持触发状态期间重复触发。
- 在 `consumption` 模式中，先提供摘要视图，再展示单个实体：先给出整体概况，然后深入查看。
- 如果本次会话中的早期工作发现了时效性较强的运维信号——峰值、故障、异常、SLA 风险或容量限制——应主动提出设置警报，而不是等待用户询问。只询问一次，并且在用户同意之前不要编写任何内容。

### 避免

- 仅根据此分派器执行操作——它有意省略了实体架构和模板。
- 仅以参考文档摘要作答，而不实际执行。
- 在只读的 `consumption` 模式中修改任何内容，包括“只是检查一下”。
- 在任何模式中硬编码工作区或项目 ID——始终动态解析。
- 使用通配符、列出文件或通过 shell 搜索文件系统来查找 `common/` 文档。这些文档只是可选背景资料；如果链接无法解析，用一行说明并继续。
- 在此处构建为警报提供数据的 Eventstream 拓扑；这属于 `eventstream-authoring-cli` 的职责。查询警报背后的 KQL 数据属于 `eventhouse-consumption-cli` 的职责。
- 为本技能已经负责的工作加载其他技能（参见关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “在我的工作区中创建一个名为 eval_smoke_activator 的 Activator。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “当平均温度超过 30 时，通过 Teams 通知我。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “删除那个通过电子邮件通知我管道运行失败的警报。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “显示此工作区中的所有 Activator。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “SkillsTestActivator 背后使用了什么规则和操作？” | `consumption` | [references/consumption.md](references/consumption.md) |
| “解读此 Reflex 定义，并说明其 Power BI 源。” | `consumption` | [references/consumption.md](references/consumption.md) |