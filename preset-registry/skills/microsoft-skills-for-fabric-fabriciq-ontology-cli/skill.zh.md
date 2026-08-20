---
name: fabriciq-ontology-cli
description: "Author and explore Fabric IQ Ontology items: entity and relationship types, data bindings and definition updates, or schema, lineage, grounding and graph-walk exploration. Power BI report Q&A is fabriciq. Triggers:create ontology item,bind entity type,update ontology definition,entity types,ground query,ontology lineage"
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: fabriciq-ontology-cli`（`az rest`：`--headers "x-ms-fabric-skill=fabriciq-ontology-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了它——但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中此类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能消歧**：对于 Ontology 项目本身，使用 `fabriciq-ontology-cli`。针对 Power BI 报表和仪表板的自然语言问题使用 `fabriciq`；针对语义模型执行 DAX 使用 `semantic-model-cli`。

# Fabric IQ Ontology -- CLI 技能

此技能统一负责 Fabric IQ Ontology 项目：实体和关系类型、绑定、定义、血缘、基准化和图遍历。

它是一个**模式分发器**，不包含任何操作过程。从下表中选择与请求匹配的模式，然后在发出任何一条命令之前，**使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和注意事项；未阅读便执行操作会导致错误的有效负载和错误的结果。

## 模式选择

| 模式 | 在请求执行以下操作时使用…… | 触发示例 | 首先阅读 |
|---|---|---|---|
| `authoring` | 创建或更新 Ontology 项目、实体/关系类型或数据绑定，以及预览/确认定义更改 | 创建 ontology 项目、绑定实体类型、添加关系类型、更新 ontology 定义 | [references/authoring.md](references/authoring.md) |
| `consumption` | 探索现有 ontology：架构、实体类型、绑定、血缘、基准化提取、图遍历、摘要 | 实体类型、基准化查询、ontology 血缘、遍历图、总结 ontology | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 仅用于只读探索。任何定义写入操作都必须通过 authoring 模式的预览并确认流程——绝不能因 consumption 请求而调用 `updateDefinition`。

如果请求确实跨越多个模式，请逐一处理，并在开始每个部分之前阅读相应的参考文件。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不要猜测。

## 最终写入——不得跳过的步骤

阅读参考文件并规划更改并不等于完成任务。每个变更模式都以一次状态变更调用结束。如果你没有发出该调用，就不会持久化任何内容——请明确说明这一点，而不要报告成功。

| 模式 | 最终写入 |
|---|---|
| `authoring` | 使用 `createItem`（`POST /v1/workspaces/{ws}/items`）创建 Ontology，然后使用 `POST .../updateDefinition` 持久化实体类型、关系和绑定。预览过的定义树并不等于已保存的定义树。 |
| `consumption` | 无——此模式为只读 |

在报告任务完成之前，请确认终端调用已成功返回；如果参考文档中记录了回读步骤，请回读该产物，以证明更改已生效。

## 共享基础要求（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云／非公有云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前先阅读 |
| 身份验证操作步骤 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中恰好选择一种模式。
- 在该模式下执行第一条命令之前，必须将完整读取 `references/<mode>.md` 作为第一次工具调用。仅用一次完整读取将其从头读到尾：不要重新打开，不要再次使用 grep 搜索，也不要分页读取。你已经获得了其中的内容。
- 对加载的所有其他文件采用相同的仅阅读一次规则，包括嵌套的 `references/<mode>/*.md` 子参考文档和共享的 `common/*.md` 文件：只打开实际需要的文件，每个文件仅从头到尾阅读一次，绝不使用 grep 搜索或重新打开已经加载的文件。
- 通过列出并筛选来解析工作区和项目 ID，绝不能猜测 GUID。
- 当请求跨越模式边界时，明确宣布模式切换。
- 将参考文档视为操作说明，而非交付物。阅读后，应针对实时工作区运行文档中记录的命令，并报告真实结果。仅引用参考文档中的内容而不执行操作，无法满足请求。

### 优先

- 选择能够满足请求的最窄范围模式。
- 只阅读恰好一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在此之前明确说明。
- 在第一次响应中报告所选模式，以便用户在需要时进行纠正。

### 避免

- 仅依据此分派器采取行动——它有意省略了具体操作细节。
- 使用参考文档摘要作答，而不是实际执行操作。
- 重新读取或重新使用 grep 搜索已经加载的参考文档；这会浪费轮次和令牌。
- 在只读模式下修改任何内容。
- 对于此系列技能已涵盖的工作，不要加载其他技能（参见关键说明 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| “Sales 本体中存在哪些实体类型，它们是如何绑定的？” | `consumption` | [references/consumption.md](references/consumption.md) |
| “创建一个本体项，其中包含绑定到湖仓的 Customer 和 Order 实体类型。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “基于本体解析这个问题，并展示图遍历过程。” | `consumption` | [references/consumption.md](references/consumption.md) |