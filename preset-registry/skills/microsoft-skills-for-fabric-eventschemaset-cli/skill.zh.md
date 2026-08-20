---
name: eventschemaset-cli
description: "Author and inspect Microsoft Fabric Event Schema Sets (centralized catalogs of event types and message schemas) via the Fabric Items REST API with az rest: create, rename, override the definition or delete one; or list, inspect and base64-decode definitions read-only. Not the Eventstream ingestion pipeline (eventstream-*) nor Eventhouse/KQL (eventhouse-cli). Triggers:create event schema set,update event schema set definition,add event type to an event schema set,delete event schema set,list event schema sets,inspect event schema set,decode event schema set definition"
---
> **遥测——强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: eventschemaset-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventschemaset-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项——但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中此类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能消歧**：对于 EventSchemaSet 目录项目（事件类型和消息架构），请使用 `eventschemaset-cli`。Eventstream 是另一种项目——实时引入和路由管道；请为其使用 `eventstream-cli`。Eventhouse / KQL Database 又是另一种项目；请为其使用 `eventhouse-cli`。

# Fabric Event Schema Set —— CLI 技能

此技能专门负责 Fabric Event Schema Set：编写目录（创建、重命名、覆盖定义、删除），以及对其 `eventTypes` 和 `schemas` 进行只读检查和解码。

> **预览版**：Fabric **EventSchemaSet** 项目及其 REST 操作目前处于**预览版**阶段——其行为、响应结构和可用性可能会发生变化。所有操作的文档均注明**仅支持委托（用户）身份**（服务主体和托管身份被列为不受支持），但由于该项目处于预览版阶段，SP/MI 访问可能会成功，具体取决于**租户**。优先使用 `az login` 以用户身份登录；使用 SP/MI 时若遇到 **401/403**，请回退到委托用户身份。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后在发出任何一条命令**之前，使用文件读取工具从头到尾阅读匹配的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；如果不阅读就执行操作，将产生错误的有效负载和错误的结果。

## 模式选择

| 模式 | 当请求执行以下操作时使用…… | 触发词示例 | 请先阅读 |
|---|---|---|---|
| `authoring` | 创建、重命名/重新描述、覆盖定义或删除 Event Schema Set（Create、Update、UpdateDefinition、Delete） | 创建事件架构集、更新事件架构集定义、向事件架构集添加事件类型、重命名事件架构集、删除事件架构集 | [references/authoring.md](references/authoring.md) |
| `consumption` | 列出或搜索 Event Schema Set、检查项目属性，或解码定义以枚举其 `eventTypes` 和 `schemas` | 列出事件架构集、检查事件架构集、解码事件架构集定义、获取架构版本、列出业务事件 | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 只能发出只读调用（List、Get、GetDefinition）。任何会更改状态的操作（Create、Update、UpdateDefinition、Delete）都需要使用 authoring 模式：请说明这一点，阅读 `references/authoring.md`，然后继续。

如果请求确实跨越多个模式（例如，先解码当前定义，然后覆盖它），请逐一处理，并在开始相应部分之前读取对应的参考文档。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不是猜测。

## 终结写入——绝不能跳过的步骤

阅读参考文档并规划变更并不等于完成任务。创作模式必须以一次改变状态的调用结束。如果你没有发出该调用，就不会持久化任何内容——请明确说明这一点，而不要报告成功。

| 模式 | 终结写入 |
|---|---|
| `authoring` | 针对所请求变更执行 `POST .../eventSchemaSets`、`PATCH .../eventSchemaSets/{id}`、`POST .../eventSchemaSets/{id}/updateDefinition` 或 `DELETE .../eventSchemaSets/{id}`。编写请求正文并向用户展示并不等同于执行请求。 |
| `consumption` | 无——此模式为只读模式 |

Create 和 UpdateDefinition 可能返回 `202 Accepted`（LRO）：捕获 `Location` 标头并轮询，直至状态为 `Succeeded`，然后再报告成功。如果参考文档要求回读，请回读该构件，以证明变更已生效。

## 所有模式的共同要点

首先解析工作区和项目；所有模式都依赖这一步。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必读**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云/非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误会导致 401；遇到任何身份验证问题前先阅读 |
| 身份验证操作指南 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，必须从上表中选择且仅选择一个模式。
- 在该模式的第一条命令之前，将 `references/<mode>.md` 从头到尾读完，并将此操作作为你的**第一次工具调用**。只读一次，并在一次完整读取中完成：不要重新打开，不要再次对其执行 grep，也不要分页读取。你已经拥有其中的内容。
- 对加载的所有其他文件（包括共享的 `common/*.md` 文件）采用相同的单次读取原则：只打开真正需要的文件，每个文件只从头到尾读取一次，绝不要对已经加载的文件执行 grep 或重新打开。
- 必须通过列出并筛选来解析工作区和项目 ID，绝不能猜测 GUID。
- 当请求跨越模式边界时，必须明确宣布模式切换。
- 在执行破坏性操作和覆盖操作之前进行确认——Delete 是永久性的（使用 `?hardDelete=true`），而 UpdateDefinition 会**替换**整个定义。如果请求已经明确指出目标项目和破坏性/覆盖操作（例如“删除 Event Schema Set X”“将 X 的定义覆盖为……”），该指令本身**即为**确认：回显解析得到的 `displayName` + `id` 以供审计，然后继续执行那一次写入。仅当目标或意图不明确时（例如“清理我的工作区”、未加限定的“第一个”，或批量/通配符删除），才暂停并单独请求是/否确认。
- 将参考文档视为操作指令，而不是交付成果。阅读后，应针对实时工作区**运行**文档中说明的命令，并报告实际结果。

### 建议

- 选择能够满足请求的最窄模式。
- 只读取一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载前说明。
- 使用委托用户身份（`az login`）；如果 SP/MI 遇到 401/403，则回退到用户身份。
- 在首次响应中说明所选择的模式，以便用户纠正。

### 避免

- 仅依据此分派器执行操作——它有意省略了操作细节。
- 仅用参考文档的摘要来回答，而不实际执行。
- 重新读取或重新 grep 已加载的参考文档；这会浪费轮次和 token。
- 在只读使用模式下修改任何内容。
- 混淆 EventSchemaSet 与 Eventstream 或 Eventhouse（请参阅关键说明 3）。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “列出我的 Analytics 工作区中的所有 Event Schema Set。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “在 Analytics 中创建一个名为 orders-catalog 的 Event Schema Set。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “解码 orders-catalog 的定义，并告诉我它的事件类型和 schema。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “向 orders-catalog 添加一个 BusinessEventType 事件 OrderPlaced (JSON)。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “从 Analytics 中删除 orders-catalog-old Event Schema Set。” | `authoring` | [references/authoring.md](references/authoring.md) |