---
name: variable-library-cli
description: "Manages Fabric Variable Library items, including definitions, libraryVariables and valueSets overrides. Covers which consumers can reference a variable and with what syntax -- pipelines, notebooks via notebookutils variableLibrary, Dataflow Gen2, Copy Jobs, shortcuts, UDFs and Plan items -- the active value set per workspace or deployment stage, and Git serialization for CI/CD."
---
> **Telemetry — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: variable-library-cli`（`az rest`：`--headers "x-ms-fabric-skill=variable-library-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但无论如何都要添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选。
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选。
> 3. Variable Library 有两个平面：Git 中的定义文件，以及工作区中的活动值集项目状态。不要将活动值集视为 Git 编辑。定义平面是 `authoring`；项目状态平面是 `operations`。
> 4. Variable Library 定义请求必须完全省略 `format` 字段。不要发送 `format: null`。
> 5. **技能消歧**：所有 Variable Library 相关事项都使用 `variable-library-cli`，包括使用者引用中属于 Variable Library 的部分。使用者项目本身的深度创作应使用其他技能：管道使用 `pipeline-migration`，笔记本使用 `spark-cli`，Dataflow Gen2 使用 `dataflows-cli`，Git 生命周期使用 `git-integration-operations-cli`，部署管道机制使用 `deployment-pipelines-authoring-cli`。
> 6. 对于信息不完整的创建请求，应在创建前进行澄清。如果“设置 / 创建 Variable Library”的请求没有指定变量、变量类型、默认值和值集，请提出澄清问题，或在创建任何内容之前提供结构化选项。不要凭空编造配置并在未确认意图的情况下悄然创建项目。（具体且完整的请求无需确认。）
> 7. 生成读取 Boolean Variable Library 值的使用者代码（笔记本、UDF）时，应使用 `str(value).lower() == "true"` 进行防御性强制转换。绝不要对字符串使用 `bool(value)`：在 Python 中，所有非空字符串（包括 `"false"`）都是真值，因此 `bool("false")` 始终为 `True`。
> 8. 不要写入值等于变量默认值的值集覆盖值。覆盖值会固定该值：一旦写入，之后对默认值的编辑将不再传递到该值集，因此冗余覆盖会在不知不觉中使该值集退出继承。省略该覆盖值，让值集继承默认值。仅在值确实不同时进行覆盖。

# Fabric Variable Library -- CLI 技能

此技能专门负责 Fabric Variable Library 项目：定义和值集、使用者引用中属于 VL 的部分、活动值集项目状态，以及 Variable Library CI/CD 行为。

它是一个**模式分发器**，不包含任何操作流程。请从下表中选择与请求匹配的模式，然后使用文件读取工具**完整阅读对应的 `references/<mode>.md` 文件，再执行任何命令**。该文件包含端点、负载格式、模板和注意事项；未阅读该文件就执行操作会导致负载和结果错误。

每个会话只读取一次。已经读取过的文件会保留在上下文中，因此后续轮次不要重新读取。

## 模式选择

| 模式 | 在请求……时使用 | 示例触发词 | 首先读取 |
|---|---|---|---|
| `authoring` | 创建或更改库定义：变量、默认值、类型、值集覆盖文件、`settings.json` | create variable library, add a variable, valueSets, variableOverrides, valueSetsOrder, updateDefinition | [references/authoring.md](references/authoring.md) |
| `consumption` | 将变量接入使用者项，或解释使用者如何解析变量 | libraryVariables, notebookutils variableLibrary, pipeline expression, Dataflow Gen2 / copy job / shortcut / UDF / Plan reference | [references/consumption.md](references/consumption.md) |
| `operations` | 读取或切换活动值集，或涉及阶段、Git 序列化和部署 | active value set, activeValueSetName, promote to prod, per-stage values, Git diff, fabric-cicd | [references/operations.md](references/operations.md) |

### 模式边界规则

根据**所属平面**而不是词汇进行分类。提到值集的请求，在更改覆盖*文件*时属于 `authoring`，在更改工作区中活动的值集时属于 `operations`。创建 `valueSets/prod.json` 属于 `authoring`；让生产工作区指向它属于 `operations`。

`consumption` 仅涵盖引用一侧的变量库部分。编写使用者项自身的定义属于该项对应的 skill（关键注意事项 5）。

如果请求确实跨越多个模式，请一次处理一个模式，并在开始处理该部分之前读取相应的参考文档。如果阅读此表后模式仍然不明确，请提出一个简短的澄清问题，而不是自行猜测。

## 终端写入 —— 不得跳过的步骤

读取参考文档并规划更改**并不等于**完成任务。每个会修改状态的模式都必须以一次状态变更调用结束。如果没有发出该调用，就不会持久化任何内容——应明确说明这一点，而不是报告成功。

| 模式 | 终端写入 |
|---|---|
| `authoring` | 对于新建库，调用 `POST /v1/workspaces/{ws}/items` 并使用 `type: "VariableLibrary"`；对于持久化编辑，调用 `POST /v1/workspaces/{ws}/items/{id}/updateDefinition`。两者都发送 base64 定义部分，并且必须省略 `format`。在本地构建 JSON 不会写入任何内容。 |
| `consumption` | 由该项对应的 skill 负责的使用者项自身更新调用。此 skill 的交付内容是应放入其中的正确引用契约。 |
| `operations` | 使用 `{"properties":{"activeValueSetName":"<name>"}}` 调用 `PATCH /v1/workspaces/{ws}/variableLibraries/{id}`。这是项状态；它不会编辑 `settings.json`、`variables.json` 或 `valueSets/*.json`，也不会出现在 Git diff 中。 |

在报告任务完成之前，确认终端调用返回成功，并重新读取构件以证明更改已生效。对于 `operations`，使用 `GET /variableLibraries/{id}` 重新读取：通用的 `/items/{id}` 会省略 `properties`，因此不会显示活动值集。

## 所有模式的共享要点

首先解析工作区和项目；每种模式都依赖于此。

| 任务 | 参考文档 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必须**——在解析任何工作区或项目 id 之前阅读 |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 项目类型、工作区、容量 |
| 身份验证与令牌获取 | [COMMON-CORE.md](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前先阅读 |
| 身份验证方案 | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 使用 `az rest` 调用 Fabric REST | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | 此 skill 的主要访问方式 |
| 核心控制平面 REST API | [COMMON-CORE.md](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 长时间运行的操作（LRO） | [COMMON-CLI.md](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | 创建和定义 API 可能返回 202 |
| VariableLibrary 项目定义 | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#variablelibrary) | 规范的部件路径和字段名称 |
| 常见问题与故障排除 | [COMMON-CLI.md](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` audience、Shell 转义、令牌过期 |

## 规则

### 必须

- 在执行其他任何操作之前，从上表中准确选择一种模式。
- 在执行该模式的第一个命令之前，先完整阅读 `references/<mode>.md`，并将其作为你的**第一次工具调用**。一次性完整读取，且只读取一次：不要重新打开，不要再次 grep，也不要分段读取。你已经拥有该内容。
- 通过列出并筛选工作区和项目来解析其 id，绝不要猜测 GUID。
- 当请求跨越边界时，明确宣布模式切换。
- 将参考文档视为操作指令，而不是交付成果。阅读后，针对实际工作区运行其中记录的命令，并报告真实结果。
- 使用规范的部件名称 `variables.json`、`settings.json` 和 `valueSets/<name>.json`，使用 `value` 表示默认值，使用 `variableOverrides` 表示值集覆盖值。
- 生成用户要求的每一项产物，使用用户指定的名称，即使发现结果为“无”，也要保留其标题。

### 建议

- 选择能够满足请求的最窄模式。
- 只阅读一个模式参考文档。仅当请求确实跨越多个模式时才加载第二个，并在加载前说明这一点。
- 在第一条回复中报告你选择的模式，以便用户进行更正。
- 使用 Python 或 `jq` 生成 JSON 请求体，以确保 base64 负载为有效的 UTF-8，且引号稳定。
- 对于完整的部署自动化，建议使用 `fabric-cicd`，而不是在此处手动实现。

### 避免

- 仅依据此调度器采取行动——它有意省略了操作细节。
- 将值集覆盖项转换为字符串。每个 `variableOverrides[].value` 都必须使用变量的原生 JSON 类型；即使 REST 文档将该字段列为 `String`，转换为字符串的布尔值或数字仍会因 `InvalidContent (InvalidValueOrTypeMismatch)` 而被拒绝。
- 在 Variable Library 定义中使用 `defaultValue`、`values` 或 `format`。
- Fabric `fab` CLI 命令语法。该命令确实存在，但此处未验证 Variable Library 命令的具体形式。
- 深入编写使用者项目定义（关键说明 5）。
- 重新读取或重新搜索已经加载过的参考资料；这会消耗轮次和令牌。

## 示例

| 用户请求 | 模式 | 要读取的参考资料 |
|---|---|---|
| “创建一个包含开发环境和生产环境值集的 Variable Library。” | `authoring` | [references/authoring.md](references/authoring.md) |
| “将 target_path 变量接入我的摄取管道。” | `consumption` | [references/consumption.md](references/consumption.md) |
| “部署后，将生产环境工作区指向生产环境值集。” | `operations` | [references/operations.md](references/operations.md) |
| “为什么我的 Git diff 没有显示值集切换？” | `operations` | [references/operations.md](references/operations.md) |
| “添加一个布尔标志变量，然后从笔记本中读取它。” | `authoring`，然后 `consumption` | 两者，一次一个 |