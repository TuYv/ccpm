---
name: variable-library-cli
description: >
  Create, wire and operate Microsoft Fabric Variable Library items via Fabric REST API, az rest, curl, and jq. Use when the user wants to: (1) create or update a VariableLibrary definition, variables, settings.json, or valueSets/*.json overrides, (2) wire a Variable Library variable reference into a pipeline, notebook, Dataflow Gen2, copy job, shortcut, UDF, or Plan consumer, (3) read or set the active value set as item state per workspace or deployment stage, or (4) explain Variable Library CI/CD and Git serialization behavior. Triggers: "create variable library", "variable library value set", "active value set", "libraryVariables", "notebookutils variableLibrary", "VariableLibrary definition", "valueSets", "Fabric Variable Library CI/CD".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: variable-library-cli`（`az rest`：`--headers "x-ms-fabric-skill=variable-library-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 调用和重试。代码片段中省略了该标头，但无论如何都必须添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选。
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选。
> 3. 变量库有两个平面：Git 中的定义文件，以及工作区中的活动值集项状态。不要将活动值集视为 Git 编辑。定义平面是 `authoring`；项状态平面是 `operations`。
> 4. 变量库定义请求必须完全省略 `format` 字段。不要发送 `format: null`。
> 5. **技能消歧**：所有变量库相关事项都使用 `variable-library-cli`，包括使用方引用中变量库一侧的操作。对使用方项本身进行深入创作则属于其他技能：管道使用 `pipeline-migration`，笔记本使用 `spark-authoring-cli`，Dataflow Gen2 使用 `dataflows-cli`，Git 生命周期使用 `git-integration-operations-cli`，部署管道机制使用 `deployment-pipelines-authoring-cli`。
> 6. 对于信息不完整的请求，应先澄清再创建。如果“设置/创建变量库”的请求未指定变量、变量类型、默认值和值集，请先提出澄清问题或给出结构化选项，然后再创建任何内容。不要捏造配置并在未确认意图的情况下擅自创建该项。（具体且信息完整的请求无需确认。）
> 7. 生成用于读取布尔型变量库值的使用方代码（笔记本、UDF）时，应使用 `str(value).lower() == "true"` 进行防御性强制转换。切勿对字符串使用 `bool(value)`：在 Python 中，每个非空字符串（包括 `"false"`）都是真值，因此 `bool("false")` 始终为 `True`。
> 8. 不要写入值与变量默认值相同的值集覆盖。覆盖会固定该值：一旦写入，之后对默认值的编辑将不再传递到该值集，因此冗余覆盖会在无提示的情况下使该值集退出继承。应省略覆盖，让值集继承默认值。仅在值确实不同时才进行覆盖。

# Fabric 变量库 -- CLI 技能

此技能统一负责 Fabric 变量库项：定义和值集、使用方引用中的变量库部分、活动值集项状态，以及变量库的 CI/CD 行为。

它是一个**模式分派器**，不包含任何操作步骤。请从下表中选择与请求匹配的模式，然后在发出任何命令之前，**使用文件读取工具从头到尾阅读对应的 `references/<mode>.md` 文件**。该文件包含端点、有效负载结构、模板和易错点；不阅读就执行操作会导致有效负载错误和结果错误。

每个会话只需读取一次。已经读取过的文件会保留在上下文中，因此不要在后续轮次中重复读取。

## 模式选择

| 模式 | 在请求符合以下情况时使用…… | 触发示例 | 首先阅读此文档 |
|---|---|---|---|
| `authoring` | 创建或更改库定义：变量、默认值、类型、值集覆盖文件、`settings.json` | 创建变量库、添加变量、valueSets、variableOverrides、valueSetsOrder、updateDefinition | [references/authoring.md](references/authoring.md) |
| `consumption` | 将变量接入消费项，或说明消费项如何解析变量 | libraryVariables、notebookutils variableLibrary、pipeline expression、Dataflow Gen2 / copy job / shortcut / UDF / Plan reference | [references/consumption.md](references/consumption.md) |
| `operations` | 读取或切换活动值集，或涉及阶段、Git 序列化和部署 | active value set、activeValueSetName、promote to prod、per-stage values、Git diff、fabric-cicd | [references/operations.md](references/operations.md) |

### 模式边界规则

应按**平面**分类，而不是按词汇分类。当请求更改覆盖*文件*时，即使其中提到了值集，也属于 `authoring`；当请求更改工作区中处于活动状态的值集时，则属于 `operations`。创建 `valueSets/prod.json` 属于 `authoring`；让生产工作区指向该值集则属于 `operations`。

`consumption` 仅涵盖引用中变量库一侧的内容。编写消费项自身的定义属于该消费项的技能（关键说明 5）。

如果请求确实跨越多个模式，请逐个处理，并在开始相应部分之前阅读对应的参考文档。如果阅读此表后仍无法确定模式，请提出一个简短的澄清问题，而不要猜测。

## 终端写入——绝不能跳过的步骤

阅读参考文档并规划更改并不意味着任务已经完成。每个会修改状态的模式都以一次状态变更调用结束。如果你没有发出该调用，就没有持久化任何内容——请明确说明这一点，而不要报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 对于新库，调用 `POST /v1/workspaces/{ws}/items` 并指定 `type: "VariableLibrary"`；对于持久化编辑，则调用 `POST /v1/workspaces/{ws}/items/{id}/updateDefinition`。两者都发送 base64 定义部件，并且必须省略 `format`。仅在本地构建 JSON 不会写入任何内容。 |
| `consumption` | 消费项自身的更新调用，由该消费项的技能负责。此技能的交付内容是应放入其中的正确引用契约。 |
| `operations` | 调用 `PATCH /v1/workspaces/{ws}/variableLibraries/{id}`，请求体为 `{"properties":{"activeValueSetName":"<name>"}}`。这是项状态：它不会编辑 `settings.json`、`variables.json` 或 `valueSets/*.json`，也不会出现在 Git 差异中。 |

在报告任务完成之前，请确认终端调用已成功返回，并回读构件以证明更改已经生效。对于 `operations`，请使用 `GET /variableLibraries/{id}` 回读：通用的 `/items/{id}` 会省略 `properties`，因此不会显示活动值集。

## 共享基础要求（所有模式）

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必读** -- 在解析任何工作区或项目 ID 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前阅读 |
| 身份验证操作方法 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric REST | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | 此 Skill 的主要访问方式 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 长时间运行的操作（LRO） | [COMMON-CLI.md](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | 创建和定义 API 可能返回 202 |
| VariableLibrary 项目定义 | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#variablelibrary) | 规范的部件路径和字段名称 |
| 注意事项与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行任何其他操作之前，从上表中选择且仅选择一种模式。
- 在该模式的第一条命令之前，将完整阅读 `references/<mode>.md` 作为第一次工具调用。一次性完整阅读且只读一次：不要重新打开，不要再次对其执行 grep，也不要分页阅读。你已经拥有其内容。
- 通过列出并筛选来解析工作区和项目 ID，绝不要猜测 GUID。
- 当请求跨越模式边界时，明确声明模式切换。
- 将参考资料视为操作说明，而不是交付成果。阅读后，针对实时工作区运行文档中的命令，并报告真实结果。
- 使用规范的部件名称 `variables.json`、`settings.json` 和 `valueSets/<name>.json`，其中默认值使用 `value`，值集覆盖使用 `variableOverrides`。
- 生成用户要求的每一项产物，使用用户指定的名称，并且即使发现结果为“无”，也要保留其标题。

### 优先

- 选择能够满足请求的最窄模式。
- 只阅读一个模式参考资料。仅当请求确实跨越多种模式时才加载第二个，并在加载前明确说明。
- 在第一次响应中报告你选择的模式，以便用户纠正。
- 使用 Python 或 `jq` 生成 JSON 正文，以确保 base64 负载是有效的 UTF-8，并保持稳定的引号处理。
- 对于完整的部署自动化，建议使用 `fabric-cicd`，而不是在此处自行构建。

### 避免

- 仅依据此调度文档执行操作——它有意省略了具体操作细节。
- 将值集覆盖项字符串化。每个 `variableOverrides[].value` 都必须使用变量的原生 JSON 类型；字符串化的布尔值或数字会被拒绝，并返回 `InvalidContent (InvalidValueOrTypeMismatch)`，尽管 REST 文档将该字段列为 `String`。
- 在变量库定义中使用 `defaultValue`、`values` 或 `format`。
- Fabric `fab` CLI 命令语法。它确实存在，但此处尚未验证变量库的命令形式。
- 深度编写使用方项目定义（关键说明 5）。
- 重新读取或重新 grep 已加载的参考文档；这会消耗交互轮次和令牌。

## 示例

| 用户请求 | 模式 | 要读取的参考文档 |
|---|---|---|
| “创建一个包含 dev 和 prod 值集的变量库。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “将 target_path 变量接入我的引入管道。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “部署后，将 prod 工作区指向 prod 值集。” | `operations` | [references/operations.md](references/operations.md) |
| “为什么我的 Git 差异中没有显示值集切换？” | `operations` | [references/operations.md](references/operations.md) |
| “添加一个 Boolean 标志变量，然后从 notebook 中读取它。” | `authoring`，然后是 `consumption` | 两者，每次读取一个 |