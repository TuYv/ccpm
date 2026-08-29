---
name: fabriciq-ontology-cli
description: "Manages Fabric IQ Ontology items, including entity and relationship types, data bindings, and definition updates, plus schema, lineage, grounding, and graph-walk exploration. Use for ontology modelling and traversal. For natural-language questions over a Power BI report use fabriciq."
---
> **遥测 — 强制要求。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: fabriciq-ontology-cli`（`az rest`：`--headers "x-ms-fabric-skill=fabriciq-ontology-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——也必须补上。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **Skill 消歧**：Ontology 项目本身使用 `fabriciq-ontology-cli`。针对 Power BI 报表和仪表板的自然语言问题使用 `fabriciq`；针对语义模型的 DAX 使用 `semantic-model-cli`。

# Fabric IQ Ontology -- CLI 技能

此技能专门负责 Fabric IQ Ontology 项：实体和关系类型、绑定、定义、沿袭、语义落地和图遍历。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后在执行任何命令之前，使用文件读取工具完整阅读对应的 `references/<mode>.md` 文件。该文件包含端点、负载结构、模板和注意事项；未阅读该文件就执行操作会产生错误的负载和错误的结果。

## 模式选择

| 模式 | 当请求……时使用 | 示例触发词 | 首先阅读此文件 |
|---|---|---|---|
| `authoring` | 创建或更新 Ontology 项、实体/关系类型或数据绑定，以及预览/确认定义更改 | 创建 ontology 项、绑定实体类型、添加关系类型、更新 ontology 定义 | [references/authoring.md](references/authoring.md) |
| `consumption` | 探索现有 ontology：架构、实体类型、绑定、沿袭、语义落地提取、图遍历、摘要 | 实体类型、ground query、ontology 沿袭、遍历图、汇总 ontology | [references/consumption.md](references/consumption.md) |

### 模式边界规则

`consumption` 是只读探索。任何定义写入都必须通过 authoring 模式的预览并确认流程完成——绝不能从 consumption 请求中调用 `updateDefinition`。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理相应部分之前阅读每个参考文件。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，而不是自行猜测。

## 终止写入操作——不得跳过的步骤

阅读参考文件并规划更改并不等于完成任务。每个会修改状态的模式都会以一次状态变更调用结束。如果未发出该调用，则任何内容都不会被持久化——请明确说明这一点，而不是报告成功。

| 模式 | 终止写入操作 |
|---|---|
| `authoring` | 使用 `createItem`（`POST /v1/workspaces/{ws}/items`）创建 Ontology，然后使用 `POST .../updateDefinition` 持久化实体类型、关系和绑定。预览的定义树并未保存。 |
| `consumption` | 无——此模式为只读 |

在报告任务完成之前，确认终端调用已成功返回；如果参考文档要求回读，则回读该产物，以证明更改已生效。

## 共享必备内容（所有模式）

首先解析工作区和项目；所有模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** —— 在解析任何工作区或项目 id 之前必须阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 环境 URL | [COMMON-CORE.md](../../common/COMMON-CORE.md#environment-urls) | 主权云 / 非公共云主机 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前必须阅读 |
| 身份验证方案 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 常见问题与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行其他任何操作之前，从上表中恰好选择一种模式。
- 在执行该模式的第一条命令之前，先完整阅读 `references/<mode>.md`，并将其作为你的**第一次工具调用**。一次性完整读取：不要重新打开，不要再次 grep，也不要分段翻阅。读取后即视为已掌握。
- 对加载的每个其他文件也遵循只读一次原则，包括嵌套的 `references/<mode>/*.md` 子参考文档和共享的 `common/*.md` 文件：只打开实际需要的文件，每个文件完整读取一次，绝不要对已加载的文件再次 grep 或重新打开。
- 通过列出并筛选来解析工作区和项目 id，绝不要猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付成果。阅读后，针对实时工作区运行其中记录的命令，并报告真实结果。只引用参考文档内容而不执行命令，并不能回答请求。

### 建议

- 选择能够满足请求的最窄模式。
- 确切读取**一个**模式参考文档。只有当请求确实跨越多个模式时才加载第二个，并在加载前说明这一点。
- 在第一条回复中报告你选择的模式，以便用户进行纠正。

### 避免

- 仅依据此调度器执行操作——它有意省略了具体的操作细节。
- 用参考文档摘要作答，而不是执行其中的操作。
- 重新读取或再次 grep 已加载的参考文档；这会浪费轮次和令牌。
- 在只读模式下执行任何变更操作。
- 为该系列工作加载其他 skill（参见 CRITICAL NOTES 3）。

## 示例

| 用户请求 | 模式 | 要阅读的参考文档 |
|---|---|---|
| "Sales 本体中存在哪些实体类型？它们是如何绑定的？" | `consumption` | [references/consumption.md](references/consumption.md) |
| "创建一个本体项，将 Customer 和 Order 实体类型绑定到 lakehouse。" | `authoring` | [references/authoring.md](references/authoring.md) |
| "针对本体对这个问题进行 grounding，并展示图遍历过程。" | `consumption` | [references/consumption.md](references/consumption.md) |