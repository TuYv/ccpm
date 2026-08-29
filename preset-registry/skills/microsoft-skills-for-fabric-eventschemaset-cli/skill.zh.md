---
name: eventschemaset-cli
description: "Governs Event Schema Sets, the Fabric registries of event types and message payload schemas. Covers create, rename, update and delete of a definition, and listing, property reads or base64 decoding. Every Event Schema Set task belongs here. Ingestion pipelines are eventstream-cli."
---
> **Telemetry — 必须遵守。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: eventschemaset-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventschemaset-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍必须添加。

> **重要说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **Skill 消歧**：对于 EventSchemaSet 目录项目（事件类型和消息架构），使用 `eventschemaset-cli`。Eventstream 是不同的项目——一种实时摄取和路由管道；对于它，使用 `eventstream-cli`。Eventhouse / KQL Database 是另一个不同的项目；对于它，使用 `eventhouse-cli`。

# Fabric 事件架构集 -- CLI Skill

此 Skill 负责 Fabric Event Schema Set：编写目录内容（创建、重命名、覆盖定义、删除），以及只读检查和解码其 `eventTypes` 与 `schemas`。

> **预览版**：Fabric **EventSchemaSet** 项目及其 REST 操作目前处于 **Preview** 阶段——行为、响应结构和可用性可能会发生变化。每项操作都记录为**仅支持委托（用户）身份**（服务主体和托管身份标记为不支持），但由于该项目处于 Preview 阶段，SP/MI 访问可能成功，具体取决于租户。优先使用用户身份执行 `az login`；如果使用 SP/MI 时遇到 **401/403**，则回退到委托用户身份。

它是一个**模式分发器**，不包含任何过程。请从下表中选择与请求匹配的模式，然后在执行任何命令**之前，先使用文件读取工具完整阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、负载结构、模板和注意事项；不阅读该文件就执行操作会产生错误的负载和错误的结果。

## 模式选择

| 模式 | 请求符合以下情况时使用 ... | 示例触发词 | 首先阅读此文件 |
|---|---|---|---|
| `authoring` | 创建、重命名/重新描述、覆盖 Event Schema Set 的定义，或删除 Event Schema Set（Create、Update、UpdateDefinition、Delete） | 创建事件架构集、更新事件架构集定义、向事件架构集添加事件类型、重命名事件架构集、删除事件架构集 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出或搜索 Event Schema Set、检查项目属性，或解码定义以枚举其 `eventTypes` 和 `schemas` | 列出事件架构集、检查事件架构集、解码事件架构集定义、获取架构版本、列出业务事件 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 只能发起只读调用（List、Get、GetDefinition）。任何改变状态的操作（Create、Update、UpdateDefinition、Delete）都必须使用 authoring 模式：说明这一点，阅读 `references/authoring.md`，然后继续操作。

如果请求确实跨越多种模式（例如先解码当前定义，然后覆盖它），请一次处理一个模式，并在开始处理该部分之前阅读每个参考文档。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，而不是自行猜测。

## 终端写入——不得跳过的步骤

读取参考文档并规划更改**不等于**完成任务。编写模式必须以一次改变状态的调用结束。如果没有发出该调用，则任何内容都不会被持久化——请明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 针对所请求更改执行 `POST .../eventSchemaSets`、`PATCH .../eventSchemaSets/{id}`、`POST .../eventSchemaSets/{id}/updateDefinition` 或 `DELETE .../eventSchemaSets/{id}`。仅组合请求正文并向用户展示并不等于执行该请求。 |
| `consumption` | 无——此模式为只读模式 |

Create 和 UpdateDefinition 可能返回 `202 Accepted`（LRO）：捕获 `Location` 标头并持续轮询，直到状态为 `Succeeded`，然后再报告成功。如果参考文档说明需要回读，请读回该工件以证明更改已生效。

## 共享必备事项（所有模式）

首先解析工作区和项目；所有模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [环境 URL](../../common/COMMON-CORE.md#environment-urls) | 主权云/非公有云主机 |
| 身份验证与令牌获取 | [身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前必须阅读 |
| 身份验证方案 | [身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 易错点与故障排除 | [易错点与故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中准确选择一种模式。
- 将 `references/<mode>.md` 作为**第一个工具调用**，从头到尾阅读一遍，然后再执行该模式的第一个命令。只阅读**一次**，一次性完整读取：不要重新打开，不要再次 grep，也不要分段翻阅。你已经拥有其内容。
- 对加载的其他每个文件也采用同样的只读一次原则，包括共享的 `common/*.md` 文件：只打开实际需要的文件，将每个文件从头到尾阅读**一次**，绝不 grep 或重新打开已经加载过的文件。
- 通过列出并筛选来解析工作区和项目 id，绝不能猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 在执行破坏性操作和覆盖操作之前进行确认——Delete 是永久性的（使用 `?hardDelete=true`），而 UpdateDefinition 会**替换**整个定义。当请求已经明确指出目标项目以及破坏性/覆盖操作时（例如“删除 Event Schema Set X”“将 X 的定义覆盖为……”），该指令**就是确认**：回显已解析的 `displayName` + `id` 以保留审计记录，然后执行这一次写入。仅当目标或意图不明确时，才暂停并单独请求是/否确认（例如“清理我的工作区”、未限定对象的“第一个”、或批量/通配符删除）。
- 将参考文档视为操作指令，而不是交付内容。阅读后，针对实际工作区运行文档中规定的命令，并报告真实结果。

### **偏好**

- 满足请求的最窄模式。
- 恰好阅读一个模式参考文档。只有当请求确实跨越多个模式时才加载第二个，并在此之前说明原因。
- 使用委派的用户身份（`az login`）；在收到 401/403 时，从 SP/MI 回退到用户身份。
- 在第一条响应中报告你选择的模式，以便用户进行更正。

### **避免**

- 仅依据此调度器执行操作——它有意省略了操作细节。
- 用参考文档的摘要作答，而不是执行其中的操作。
- 重新阅读或重新 grep 已加载的参考文档；这会消耗轮次和 token。
- 在只读消费模式下修改任何内容。
- 将 EventSchemaSet 与 Eventstream 或 Eventhouse 混淆（参见关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “列出我的 Analytics 工作区中的所有 Event Schema Set。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “在 Analytics 中创建一个名为 orders-catalog 的 Event Schema Set。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “解码 orders-catalog 的定义，并告诉我其中的事件类型和架构。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “将一个名为 OrderPlaced 的 BusinessEventType 事件（JSON）添加到 orders-catalog。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “从 Analytics 中删除名为 orders-catalog-old 的 Event Schema Set。” | `authoring` | [references/authoring.md](references/authoring.md) |