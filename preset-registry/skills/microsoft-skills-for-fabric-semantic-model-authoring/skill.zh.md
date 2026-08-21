---
name: semantic-model-authoring
description: >  
  Author and inspect Power BI semantic models and their metadata: list tables, columns, measures, relationships; create, edit, deploy, refresh, and manage models; optimize DAX; build Import, DirectQuery, and Direct Lake models; configure data sources, permissions, connections; and prepare for AI/Copilot.
  Load this skill before acting on any semantic model authoring, metadata, or read-only inspection request: it picks the correct tool and method for the environment and permissions.
  Authoring-scoped: does not answer natural-language or data questions about a model's data.
  Does NOT author report visuals, manage workspaces, or manage RLS/OLS roles.
  Triggers: "create or edit a semantic model", "create or edit a DAX measure", "discover semantic model metadata", "list tables, columns, or measures in a semantic model", "refresh semantic model", "deploy semantic model to Fabric",  "prepare semantic model for AI/Copilot", "set semantic model permissions".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: semantic-model-authoring`（`az rest`：`--headers "x-ms-fabric-skill=semantic-model-authoring"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. 在选择每项操作所使用的工具时，始终考虑[工具选择优先级](#tool-selection-priority)。如果 MCP 可用且已连接到目标模型，请勿默认使用 TMDL 编辑或 `az rest`。

# Power BI 语义模型创作 — CLI 技能

## 工作流选择器

根据用户意图，使用此决策树选择正确的工作流：

| 用户希望执行的操作……                                                            | 工作流                                                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 从头创建语义模型                                                                | [创建新语义模型](#workflow-create-new-semantic-model)                                |
| 检查或发现模型元数据（表、列、度量值、关系）                                    | [发现语义模型元数据](#workflow-discover-semantic-model-metadata)                     |
| 添加/编辑语义模型对象（例如度量值、表、列、关系）                               | [修改现有模型](#workflow-modify-an-existing-model)                                   |
| 编写或重构 DAX 代码                                                             | [修改现有模型](#workflow-modify-an-existing-model)                                   |
| 提升 DAX 查询或度量值的性能                                                     | [优化 DAX 性能](#workflow-optimize-dax-performance)                                  |
| 按照最佳实践分析语义模型                                                        | [分析最佳实践](#workflow-analyze-best-practices)                                     |
| 为 AI 使用场景（Copilot / Data Agents）准备语义模型                             | [语义模型 AI 就绪](#workflow-semantic-model-ai-readiness)                            |
| 将模型部署到 Fabric 工作区                                                      | [部署到 Fabric](#workflow-deploy-to-fabric)                                          |
| 刷新语义模型                                                                    | [刷新语义模型](#workflow-refresh-semantic-model)                                     |
| 配置数据源、参数或权限                                                          | [在 Fabric 中管理语义模型](#workflow-manage-semantic-model-in-fabric)                |
| 将语义模型绑定到 Fabric 连接（或解除绑定）                                      | [将语义模型绑定到连接](#workflow-bind-semantic-model-to-a-connection)                |
| 将语义模型定义导出/获取为 PBIP                                                  | [导出到 PBIP](#workflow-export-to-pbip)                                               |

## 目录

当工作流步骤需要这些参考资料时再按需加载。不要一次性全部加载。

| 主题                            | 参考资料                                                                          | 加载时机                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 建模最佳实践          | [modeling-guidelines.md](./references/modeling-guidelines.md)                      | 创建或编辑任何模型之前                                                        |
| 命名约定               | [naming-conventions.md](./references/naming-conventions.md)                        | 命名或重命名表、列、度量值时                                           |
| Direct Lake 建模             | [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)                | 模型连接到 OneLake 时                                                              |
| TMDL 编辑                     | [tmdl-guidelines.md](./references/tmdl-guidelines.md)                              | 生成或编辑任何 TMDL 文件之前                                                  |
| PBIP 项目                    | [pbip.md](./references/pbip.md)                                                    | 使用 PBIP 文件夹时                                                              |
| DAX 语言                     | [dax-guidelines.md](./references/dax-guidelines.md)                                | 编写或审查任何 DAX 代码时                                                      |
| 元数据发现（DAX INFO 函数） | [metadata-discovery.md](./references/metadata-discovery.md)                 | 通过 DAX INFO 函数发现模型元数据时（请参阅[工作流：发现语义模型元数据](#workflow-discover-semantic-model-metadata)） |
| DAX 性能决策指南   | [dax-perf-decision-guide.md](./references/dax-perf-decision-guide.md)              | 优化 DAX 时从这里开始                                                             |
| DAX 性能模式目录  | [dax-perf-patterns.md](./references/dax-perf-patterns.md)                          | 决策指南确定候选模式后按需加载                       |
| 语义模型 AI 就绪性                | [semantic-model-ai-readiness.md](./references/semantic-model-ai-readiness.md)                          | 为 Copilot 或 Data Agents 准备模型时                                           |
| 语义模型 REST API          | [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)              | 使用 `az rest` 执行 TMDL CRUD、刷新、参数、权限或属性检索时 |
| 连接绑定               | [connection-binding.md](./references/connection-binding.md)                        | 将语义模型绑定到 Fabric 数据连接或解除绑定时（网关、云、VNet、自动、无） |
| 查找工作区/项目         | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | 解析工作区/项目 ID 时                                                           |
| Fabric 控制平面 API         | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)   | 使用 `az rest` 模式、LRO、分页时                                              |
| 身份验证                   | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes)                 | 使用 `az login` 进行身份验证时                                                         |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包含分页、LRO 轮询和速率限制模式 |
| 定义封装              | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#semanticmodel)    | 构建 TMDL 定义有效负载时                                                      |
| 示例                         | [示例](#examples)                                                              | 参考端到端演练。 |

---

## 工具选择优先级

优先级顺序（从高到低）：

1. **第 1 层级 — 已注册 `powerbi-modeling-mcp` MCP** -> 对来自任何来源的模型执行创作（新建或编辑）操作时，均使用 MCP：Power BI Desktop、Fabric 工作区或本地 PBIP 文件夹。MCP 是编辑语义模型最可靠且功能最完整的方式，可立即作用于实时模型，并且不存在 TMDL 不同步的风险。

   **重要提示：** 如果动态搜索工具可用（例如 `tool_search_tool_regex`），请搜索与模式 `powerbi-modeling-mcp` 匹配的可用 MCP 服务器。

   **这既包括写入，也包括读取/检查。**
   - 若要检查或验证更改 -> 使用相应的 MCP 操作（List / Get）。
   - **反面模式：** 在 MCP 已连接时，打开、使用 `view` 查看、使用 `glob` 匹配或以其他方式读取 TMDL 文件（`*.tmdl`）。MCP 中已加载的模型才是事实来源——磁盘上的 TMDL 已过时。唯一的例外是用户明确要求处理 TMDL 文件时。

2. **第 2 层级 — 未注册 MCP + PBIP 文件夹或 Fabric 工作区** -> 直接编辑 TMDL 文件。加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md) 和 [pbip.md](./references/pbip.md)。当来源为 Fabric 工作区时，使用 `az rest` 对 TMDL 进行往返处理（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）：`getDefinition` -> 在本地编辑 TMDL -> `updateDefinition`。

**回退方案 — 上述条件均不具备（例如，Power BI Desktop 没有 PBIP 且没有 MCP）** -> 停止。在此配置下，代理无法创作模型。请用户选择以下任一方式：(a) 安装并注册 `powerbi-modeling-mcp` MCP 服务器；或 (b) 将 PBIX 另存为 PBIP 项目，然后重新启动工作流。

> **以下所有工作流均与工具无关。** 工作流步骤描述的是*意图*（连接、创建、编辑、保存、部署、刷新）。执行每个步骤所使用的工具由此处的规则决定。始终选择当前环境中可用的最高优先级工具；当更高优先级的选项可用时，不要混用工具。某些工作流会覆盖此默认优先级，因此在默认采用第 1 层级之前，务必检查工作流自身的工具选择规则。

### 连接到语义模型

语义模型可以位于三个位置。按照[工具选择优先级](#tool-selection-priority)确定连接方式：

- **Power BI Desktop**：找到正在运行的 Power BI Desktop 实例，并连接到其本地模型。
- **Fabric 工作区**：首先，使用[查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)模式查找工作区和语义模型：列出工作区，以通过名称确定工作区 ID；然后列出该工作区中类型为 `SemanticModel` 的项目，以通过名称确定模型 ID。随后连接到模型（实时），或导出其 TMDL 定义以便在本地编辑。
- **PBIP 项目**：连接到 `[Name].SemanticModel/definition` 文件夹。加载 [pbip.md](./references/pbip.md) 以了解 PBIP 文件夹结构——仅加载包含 TMDL 代码的 `[Name].SemanticModel/definition` 文件夹。

### 保存对语义模型的更改

更改的持久化方式取决于模型所在的位置，以及当前使用的工具层级（依据[工具选择优先级](#tool-selection-priority)）：

**实时连接（第 1 层级——通过 MCP 连接到 Desktop 或 Fabric 工作区）：**

- 针对实时模型执行每项操作时，更改会立即应用。无需执行显式保存步骤。
- **PBIP 项目（通过 MCP 实时连接）**：在会话结束时，将模型序列化回 `[Name].SemanticModel/definition` 文件夹。如果 PBIP 文件夹尚不存在，请先按照[导出到 PBIP](#workflow-export-to-pbip)创建完整结构。

**本地 TMDL 编辑（第 2 层级——直接编辑文件或通过 `az rest` 往返处理）：**

- **PBIP 项目**：编辑期间，更改已写入 TMDL 文件。无需执行额外的保存步骤。
- **Fabric 工作区**：更改是在从服务导出的本地 TMDL 文件中完成的。重新部署模型（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md) 以了解 `updateDefinition` 流程），将更改推送回工作区。

---

## 工作流：新建语义模型

**适用情形：** 用户要求从头创建新的语义模型。

步骤：

1. **收集需求**——与用户沟通，直到双方对以下内容达成共识：模型用途、数据源连接详细信息及架构，以及关键业务实体/事实。**如果没有数据源信息，请停止并使用 `ask_user`。不要猜测或捏造。**
2. **确定存储模式**——如果数据源是 Fabric OneLake，则使用 **Direct Lake**；否则默认使用 **Import**。仅当用户明确要求时才使用 **DirectQuery**。
3. **设计星型架构**——识别事实表、维度表和关系键。
   - 如果事实表包含日期字段，请创建单独的日期维度表，并通过关系将其连接到事实表。除非用户明确要求，否则请使用 PowerQuery/M 分区，而不是 DAX 计算表。
4. **加载适用的指南**——**强制要求：在构建任何对象之前，必须加载 [modeling-guidelines.md](./references/modeling-guidelines.md)**（包括下述第 1 层级 MCP 路径）；如果使用 Direct Lake，还需加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)。不要凭记忆构建。
5. **构建**——遵循[工具选择优先级](#tool-selection-priority)：**如果建模 MCP 可用，优先使用它构建整个模型；否则使用 TMDL 代码编辑路径。**创建一个空数据库（兼容级别为 1702 或更高），然后对每个表遵循[修改现有模型](#workflow-modify-an-existing-model)中的执行顺序（分区 -> 列 -> 关系 -> 度量值）。各存储模式的具体要求：
   - **Import / DirectQuery**——为数据源创建 M 参数（`Server`、`Database`、...），并在分区 M 代码中引用这些参数；确保列上的 `dataType` 和 `sourceColumn` 映射正确。
   - **Direct Lake**——使用 `AzureStorage.DataLake` 连接器为 Direct Lake 连接创建共享命名表达式；使用采用 `directLake` 模式的 `EntityPartitionSource`，并将其映射到 Lakehouse 表的列。

> **一次性构建完整模型，然后仅部署一次。** 在部署前添加所有表、列、关系和度量值——不要部署不完整的模型后再编辑并重新部署。使用 MCP 路径时，应在整个端到端流程中将模型保留在会话内。
6. **部署或保存**——有可用的 Fabric 工作区 -> [部署到 Fabric](#workflow-deploy-to-fabric)；否则 -> [导出到 PBIP](#workflow-export-to-pbip)。请参阅[保存语义模型的更改](#saving-changes-to-a-semantic-model)。使用与构建模型时相同的路径进行部署。
7. **验证**——执行[验证清单](#validation-checklist)。

---

## 工作流：发现语义模型元数据

**适用场景：** 用户要求检查、列出或发现模型的结构——表、列、度量值、关系、层次结构、分区、角色或存储内部结构。其他工作流（[修改](#workflow-modify-an-existing-model)、[分析最佳实践](#workflow-analyze-best-practices)、[AI 就绪性](#workflow-semantic-model-ai-readiness)）也会在编辑前使用此工作流清点模型。

> **范围：** 此工作流仅涵盖**元数据**发现。若要根据模型回答自然语言/数据问题，请改用 `FabricIQ` 技能。

选择一种发现方法（按优先级从高到低排列）：

1. **`powerbi-modeling-mcp` TOM 检查（列出/获取）**——当 `powerbi-modeling-mcp` 已注册，并以**写入权限**连接到目标模型时，这是默认方法。它会直接返回结构化对象模型，并与待处理的编辑保持同步，因此在创作期间应优先使用。

2. **DAX `INFO` 函数**——查询模型的 `INFO.VIEW.*` / `INFO.*` 元数据行集。**强制要求：在编写或运行任何使用 `INFO` 函数的 DAX 之前，必须先加载 [metadata-discovery.md](./references/metadata-discovery.md)**。不要凭记忆编写 `INFO` 查询；请加载参考文档并使用其中的模式。**出现以下任一情况时，应优先使用此方法：**
   - **你没有模型的写入权限。** `powerbi-modeling-mcp` 操作需要写入权限；只有读取或生成权限时，请使用 `INFO` 函数。
   - **当前环境中未注册或无法使用 `powerbi-modeling-mcp`。**
 
   通过以下工具之一执行使用 `INFO` 函数的 DAX（按优先级从高到低排列）：
   - **FabricIQ `ExecuteQuery`**——仅需要模型的**读取**权限。加载 `FabricIQ` 技能，以使用构件发现（`DiscoverArtifacts`）和执行机制。
   - **`powerbi-modeling-mcp` `dax_query_operations`**——需要**写入**权限。当建模 MCP 已经以写入权限连接时，请使用此方法。

> **不要使用 FabricIQ `GetSemanticModelSchema` 进行创作元数据发现**——它是一种数据使用工具，可能返回过时的元数据并遗漏最近的编辑。即使 FabricIQ 可用，也始终应使用 `INFO` 函数（通过 `ExecuteQuery`）；这些函数会查询实时模型。

先从小范围开始：首先运行范围估算查询和 `INFO.VIEW.*` 查询，然后仅投影/筛选与任务相关的对象（请参阅 [metadata-discovery.md](./references/metadata-discovery.md)）。

---

## 工作流：修改现有模型

**适用情形：** 用户要求添加/编辑/删除度量值、表、列、关系，编写 DAX 代码，使用 UDF 进行重构，或直接编辑 TMDL。

步骤：

1. **连接并发现** - 按照[连接到语义模型](#connecting-to-a-semantic-model)和[发现语义模型元数据](#workflow-discover-semantic-model-metadata)中的说明操作。列出表、关系和现有度量值，并确定存储模式（它决定适用哪些准则）。
2. **加载适用的准则** - 始终加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；如果是 Direct Lake，则加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)；直接编辑 TMDL 时，加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md)；进行任何 DAX 更改时，加载 [dax-guidelines.md](./references/dax-guidelines.md)（包括 UDF 重构）。
3. **规划更改** - 准确确定要添加、修改或删除的内容。检查命名冲突和重复项。
4. **按正确顺序执行**：
   - **添加表** - 分区 -> 列 -> 关系 -> 度量值。
   - **添加关系** - 确保两端的键列均已存在且数据类型匹配；
   - **添加度量值** - 验证所引用的列/表是否存在；
5. **保存并验证** - 按照[保存对语义模型的更改](#saving-changes-to-a-semantic-model)和[验证清单](#validation-checklist)中的说明操作。

---

## 工作流：优化 DAX 性能

**适用情形：** 用户要求提高 DAX 查询性能、诊断运行缓慢的度量值或优化计算。

> **硬性要求：** 需要支持跟踪的客户端（首选 MCP）

首先加载 [dax-perf-decision-guide.md](./references/dax-perf-decision-guide.md)，并遵循其中定义的框架。仅在应用候选优化模式时加载 [dax-perf-patterns.md](./references/dax-perf-patterns.md)。该框架包括：

1. 用于划分优化工作量类别的分层模型
2. 用于识别瓶颈的跟踪诊断
3. 包含待测试和验证的候选优化技术的模式目录

---

## 工作流：分析最佳实践

**适用情形：** 用户要求根据最佳实践审查、审核或分析语义模型。

步骤：

1. **连接并盘点** - 按照[连接到语义模型](#connecting-to-a-semantic-model)和[发现语义模型元数据](#workflow-discover-semantic-model-metadata)中的说明操作。获取所有表、列、关系、度量值和存储模式。
2. **加载适用的准则** - 始终加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；如果是 Direct Lake，则加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)；评估命名时，加载 [naming-conventions.md](./references/naming-conventions.md)；评估 DAX 时，加载 [dax-guidelines.md](./references/dax-guidelines.md)。
3. **评估** - 根据已加载的准则检查模型（星型架构、命名、关系基数和交叉筛选、带有 `formatString` 的显式度量值、列数据类型和 `sourceColumn`、隐藏的 FK 列、计算列与度量值的选择、Direct Lake 约束等）。
4. **呈现发现的问题**，并按严重程度（严重、建议、可选）分组。对每一项说明违反的规则和建议的修复方案。等待用户批准。
5. **应用获批的修复** - 通过[修改现有模型](#workflow-modify-an-existing-model)执行。
6. **保存并验证** - 按照[保存对语义模型的更改](#saving-changes-to-a-semantic-model)和[验证清单](#validation-checklist)中的说明操作。

---

## 工作流：语义模型 AI 就绪

**适用情形：** 用户要求使语义模型适用于 Microsoft Fabric Copilot、Power BI Data Agent 或任何对话式 BI 体验。触发语句包括“Copilot 就绪”“AI 就绪”“为 AI 做准备”“为 Copilot 准备模型”。

开始前加载 [semantic-model-ai-readiness.md](./references/semantic-model-ai-readiness.md)。

步骤：

1. **确认范围并收集上下文** - 通过 `ask_user`，根据*适用时机*部分确认使用模式（仅报表/对话式 BI/两者）和模型稳定性。收集业务上下文（流程、关键指标、常见自然语言问题、术语）。不要虚构。
2. **连接并盘点** - 按照[连接到语义模型](#connecting-to-a-semantic-model)进行操作。记录模型内容和源位置（PBIP / Fabric 工作区 / 仅限 Desktop）。
3. **评估并分流** - 按顺序完成[就绪检查清单](./references/semantic-model-ai-readiness.md#readiness-checklist)；对于每个缺口，根据[编辑能力](./references/semantic-model-ai-readiness.md#editing-capability)对修复方式进行分类（代理可编辑的 TOM 元数据与用户在 Power BI“Prep data for AI”UI 中配置的 AI 专用构件）。
4. **呈现发现的问题**，按严重性分组，并为每项标注处理方式（代理可执行或需要用户操作）。等待批准。
5. **应用已批准的更改** - 通过[修改现有模型](#workflow-modify-an-existing-model)应用 TOM 元数据修复；对于 AI 指令、AI Data Schema 和 Verified Answers，指导用户在 Power BI“Prep data for AI”UI 中进行配置，并且仅在用户同意的情况下，依据就绪参考文档提供建议；对于仅限 Desktop 的 PBIX，向用户提供操作指导。
6. **保存、验证并建议进行实时测试** - 按照[将更改保存到语义模型](#saving-changes-to-a-semantic-model)和[验证检查清单](#validation-checklist)进行操作；建议用户在 Copilot 或 Data Agent 中测试具有代表性的自然语言提示，并进行迭代。

---

## 工作流：导出到 PBIP

**适用情形：** 用户要求将语义模型导出或保存到 PBIP 项目文件夹，或者没有可用于部署的 Fabric 工作区（例如，在内存中构建模型之后）。

> **关键事实：** 导出模型只会生成 TMDL 定义文件。它不会创建外围的 PBIP 文件夹结构（Report 文件夹、`definition.pbism`、`definition.pbir`、`.pbip` 入口点）。代理必须在导出前搭建这些结构，否则生成的结果无法在 Power BI Desktop 中打开。

开始前加载 [pbip.md](./references/pbip.md)，并遵循其中定义的 PBIP 文件夹结构。

步骤：

1. **确定目标** - 通过 `ask_user` 获取目标文件夹路径和语义模型名称。如果只提供了文件夹，则使用模型的数据库名称作为语义模型文件夹名称。
2. **搭建 PBIP 结构** - 按照 [pbip.md](./references/pbip.md)，确保 `<Name>.SemanticModel/`（包含 `definition/` 和 `definition.pbism`）、`<Name>.Report/`（包含 `definition/` 和使用 `byPath` 引用的 `definition.pbir`）以及 `<Name>.pbip` 均存在。创建任何缺失的部分。
3. **导出 TMDL** 到 `<Name>.SemanticModel/definition/`，并遵循[工具选择优先级](#tool-selection-priority)：
   - **第 1 级（MCP）** - 对实时模型使用 MCP 导出/保存操作。
   - **第 2 级（Fabric 工作区，无 MCP）** - 调用 `getDefinition`（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）并写入返回的各个部分。
   - **本地磁盘上已有 TMDL 文件** - 将其复制或移动到 `definition/` 文件夹中。
4. **验证** - 确认 `definition/` 文件夹至少包含 `model.tmdl` 和表 `.tmdl` 文件；确认 `definition.pbism`、`<Name>.Report/definition.pbir`（包含指向 `../<Name>.SemanticModel` 的正确 `byPath`）以及 `<Name>.pbip` 均存在并正确地相互引用。

---

## 工作流：部署到 Fabric

**适用情形：** 用户要求将语义模型部署或发布到 Fabric 工作区。

> **硬性规则——此工作流的优先级高于默认的[工具选择优先级](#tool-selection-priority)。** 不要仅仅因为 MCP 可用就默认使用它。部署路径由**模型的来源**决定，而不是由连接了哪些工具决定。如果来源是磁盘上的 PBIP/TMDL 文件，那么即使 MCP 会话处于活动状态，也**必须**使用 Fabric REST API。

决策树（只能选择一项——按从上到下的顺序，第一个匹配项优先）：

1. **磁盘上是否有需要部署的 PBIP / TMDL 文件？**
   -> **是——使用 Fabric REST API。** 使用 `createItemWithDefinition`（新模型）或 `updateDefinition`（现有模型）调用 `az rest`。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)。
   - 理由：通过 Fabric API 直接部署 TMDL 文件更加可靠、快速，并且避免仅为了将模型重新推送出去而不必要地将其加载到 MCP 中。
   - **不要**先在 MCP 中打开 PBIP，然后再通过 MCP 部署。这是此工作流中明确禁止的反模式。
2. **模型是否已经加载到实时 MCP 会话中**（例如，刚刚在内存中构建，或者当前正在通过 MCP 编辑），**且不涉及 PBIP/TMDL 文件？**
   -> 使用 MCP 工具进行部署，并指定目标工作区和语义模型名称。
3. **模型是否存在于 Power BI Desktop 中，但尚未保存 PBIP？**
   -> 如果 MCP 已连接到 Desktop，则使用 MCP Deploy。如果 MCP 不可用，请指导用户先另存为 PBIP，然后从步骤 1 重新开始此工作流。

通过列出工作区中类型为 `SemanticModel` 的项目，验证部署是否成功。

> **只部署一次；部署操作不具备幂等性。** 重试部署会创建名称相同的*第二个*模型，随后部署将失败并显示 `There are multiple datasets named '<name>'`。如果遇到该错误，不要盲目重试：列出工作区的语义模型，**删除具有该名称的所有重复项**，然后在清理后的状态下部署一次。如果要部署的模型可能已经存在，请在执行单次部署*之前*删除现有的同名模型。

---

## 工作流：刷新语义模型

**适用情形：** 用户要求刷新语义模型中的数据。

只有在 Desktop 或 Fabric Service 中操作实时模型时才能刷新。如果使用本地 TMDL 文件，请先部署模型。

按照[工具选择优先级](#tool-selection-priority)触发刷新：

- **Power BI Desktop**：仅限第 1 层（MCP）——使用 MCP Refresh 操作。
- **Fabric Service**：使用第 1 层（MCP Refresh 操作），或回退到 Power BI Enhanced Refresh API（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）。

如果刷新因凭据错误而失败，请**立即停止**，并指导用户在 Power BI Service 中手动配置数据源连接。不要尝试以编程方式重试或规避凭据错误。

---

## 工作流：在 Fabric 中管理语义模型

**适用场景：** 用户要求在 Fabric 服务中为语义模型配置数据源、更新参数或管理权限。

> **硬性规则——此工作流优先于默认的[工具选择优先级](#tool-selection-priority)。** 不要默认使用 MCP（第 1 层），应优先使用 `az rest` 和 REST API。

### 数据源和参数

通过 Power BI REST API 获取或更新数据源和参数。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md#4-data-sources--parameters-power-bi-datasets-api)。

### 权限

通过 Power BI REST API 列出、授予或更新数据集用户权限。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md#5-permissions-power-bi-datasets-api)。

### 连接绑定

加载 [connection-binding.md](./references/connection-binding.md) 并遵循其中的说明。该参考文档涵盖了先决条件、`bindConnection` 端点、发现 -> 匹配 -> 绑定 -> 验证步骤、所有 `connectivityType` 值、解除绑定模式以及故障排除。

关键规则（完整详情请参阅参考文档）：

- 使用 Fabric **绑定语义模型连接** REST API（取代旧版 Power BI `BindToGateway`）。
- **每个数据源引用发送一个绑定请求**——该 API 不支持批量绑定。
- 通过 `List Item Connections` 发现模型的数据源引用，然后将 `connectionDetails` 与 `List Connections` 的结果进行匹配，以查找目标 `id`。如果不存在匹配项，请先创建连接。
- 通过重新列出项连接并触发刷新来进行验证。

---

## 验证清单

在创建或修改任何模型后运行：

**始终执行（适用于 PBIP、Desktop 和 Fabric 服务）：**

1. **检查 PBIP 结构**——如果模型来自 PBIP 文件夹，请确保文件夹结构和文件正确（请参阅 [pbip.md](./references/pbip.md)）。
2. **对照建模准则进行验证**——根据 [modeling-guidelines.md](./references/modeling-guidelines.md) 重新检查每项更改（对于 Direct Lake 模型，还应对照 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)）。

**仅当连接到 Analysis Services 数据库（Power BI Desktop 或 Fabric 服务）时执行：**

3. **测试新度量值**——对于每个新度量值，运行简单的 DAX 查询，验证其是否返回预期结果（例如 `EVALUATE { [Measure Name] }`）。仅处理本地 TMDL/PBIP 文件时，跳过此步骤。
4. **测试表刷新**——创建新表后，触发刷新以验证分区、数据源表达式和列映射是否正确。刷新失败通常表示 `sourceColumn` 名称不匹配、M 表达式无效或 Direct Lake 实体引用不正确。仅处理本地 TMDL/PBIP 文件时，跳过此步骤。

如果任何检查失败，请修复问题并重新运行验证。

---

## 必须/优先/避免

### 必须

- **开始前了解数据源架构**——在设计或修改模型之前，分析源表、列和数据类型。
- **遵循建模准则**——在创建或编辑任何模型之前加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；应用星型架构设计、命名约定以及列和度量值规则
- **遵循[工具选择优先级](#tool-selection-priority)**——始终选择当前环境中可用的最高优先级工具层；当更高优先级的选项可用时，不要混用不同层级的工具

### 优先选择

- **优先采用星型架构，而非雪花型架构或平面表** - 使用以单列关系键关联的非规范化维度
- **与现有模型模式保持一致** - 编辑现有模型时，应遵循其命名约定和结构，而不是强行引入新的约定和结构
- **优先采用 TMDL 格式，而非 TMSL** - 基于文本、便于差异比较，并且是 Fabric 的首选格式
- **更改后进行验证** - 使用[工作流：发现语义模型元数据](#workflow-discover-semantic-model-metadata)确认对象已成功写入。

### 避免

- **硬编码工作区/项目 ID** - 通过 API 动态解析
- **已连接 MCP 时读取 TMDL 文件** - 当第 1 层级 MCP 会话处于活动状态时，对 `*.tmdl` 使用 `view`/`glob` 是一种反模式（请参阅[工具选择优先级](#tool-selection-priority)）。
- **已注册 MCP 时手工编写 TMDL 文件** - 使用 `create`/`edit`/文件写入工具搭建 `model.tmdl`、`database.tmdl`、`relationships.tmdl` 或 `tables/*.tmdl` 属于第 1 层级反模式，新建模型时也不例外。应通过 MCP 工具构建并导出。

### 禁止

- **管理 RLS/OLS 角色成员资格** - 不要建议使用 REST 调用、`az rest` URL、MCP 操作或 TMDL 更改来向安全角色添加用户或组，或从中移除用户或组。应拒绝此类请求，因为它不在此处的范围内，并引导用户前往 Power BI 门户。

---

## 示例

> **范围说明** — 示例使用 `az rest` 进行发现，以解析 ID 并发现 Fabric 元数据（请参阅 [COMMON-CLI.md § 查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)）。语义模型定义的创作应遵循[工具选择优先级](#tool-selection-priority)：可用时使用第 1 层级 MCP `powerbi-modeling-mcp`，否则使用第 2 层级，通过 `getDefinition` / `updateDefinition` 编辑 TMDL。

### 示例 1：修改现有语义模型

**提示词**：“为 **Marketing** 工作区中的 **Sales** 语义模型内所有可聚合列创建基础度量值。”

**代理响应** - 遵循[工作流：修改现有模型](#workflow-modify-an-existing-model)。

1. **发现 ID**：通过 `az rest`。
2. **连接到模型**：按照[连接到语义模型](#connecting-to-a-semantic-model)和[工具选择优先级](#tool-selection-priority)进行操作。若已注册 `powerbi-modeling-mcp`，则直接通过 MCP 连接到 Fabric 工作区模型（第 1 层级）。否则，回退到第 2 层级（`getDefinition` -> 在本地编辑 TMDL）。
3. **检查并规划** - 通过当前使用的工具层级列出表和列；识别可聚合列（数值列、非外键、非隐藏的代理 ID），并按照 [modeling-guidelines.md](./references/modeling-guidelines.md) 和 [naming-conventions.md](./references/naming-conventions.md) 为每一列确定使用 `SUM` / `AVERAGE` / `MIN` / `MAX`。编写 DAX 之前，请先加载 [dax-guidelines.md](./references/dax-guidelines.md)。
4. **添加度量值**：按照[工作流：修改现有模型](#workflow-modify-an-existing-model)进行操作。
   - **第 1 层级（MCP）**：为每个新度量值调用工具的创建功能，并指定 `expression`、`formatString` 和目标表。不要手工编写 TMDL。
   - **第 2 层级（无 MCP）**：直接编辑表的 `.tmdl` 文件，并通过 `updateDefinition` REST API 完成往返更新。
5. **保存并验证**：按照[保存语义模型更改](#saving-changes-to-a-semantic-model)进行操作。

---

### 示例 2：从 Fabric Lakehouse 创建新的语义模型

**提示词**：“在工作区 **Marketing** 中创建一个新的 Power BI 语义模型，并使用同一工作区中的 **SalesLakehouse** 作为数据源。”

**代理响应**——遵循[工作流：创建新的语义模型](#workflow-create-new-semantic-model)。

1. **发现工作区和 Lakehouse ID**，通过 `az rest` 完成。
2. **发现 Lakehouse 架构**——通过 Lakehouse OneLake API 或 Lakehouse 的 SQL Endpoint 列出表和列。获取表名、列名和数据类型——这些信息将决定语义模型中的表、列定义和分区元数据。
3. 根据[工具选择优先级](#tool-selection-priority)**选择工具层级**：优先使用第 1 层（`powerbi-modeling-mcp`）完成整个构建。仅当 MCP 未注册时，才使用第 2 层（搭建 PBIP/TMDL 脚手架后再部署）。
4. 按照[工作流：创建新的语义模型](#workflow-create-new-semantic-model)**构建模型**——数据源是 OneLake，因此存储模式为 **Direct Lake**（加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md) 和 [modeling-guidelines.md](./references/modeling-guidelines.md)）。根据 Lakehouse 表设计星型架构，然后：
   - 创建空数据库。
   - 为 Lakehouse 连接创建一个共享命名表达式。
   - 对于每个表：添加 `EntityPartitionSource`（模式为 `directLake`）-> 映射到 Lakehouse 列的列 -> 关系 -> 度量值。
5. 按照[工作流：部署到 Fabric](#workflow-deploy-to-fabric)**部署**：
6. 按照[验证清单](#validation-checklist)**验证**——确认模型出现在工作区中，并触发初始刷新，以验证 Direct Lake 列映射是否能够正确解析。

---

### 示例 3：将语义模型绑定到 Fabric 连接

**提示词**：“将工作区 **Marketing** 中的语义模型 **Sales** 绑定到 **sql-prod** 连接。”

**代理响应**——遵循[工作流：在 Fabric 中管理语义模型 § 连接绑定](#connection-binding)。**不使用 MCP**——此工作流会覆盖[工具选择优先级](#tool-selection-priority)，并且仅使用 REST。

1. **发现工作区和模型 ID**，通过 `az rest` 完成。
2. 通过匹配服务器名称，在 Fabric 中**发现目标连接**：

   ```bash
   SERVER="sql-prod"
   CONN_ID=$(az rest --method get --resource "https://api.fabric.microsoft.com" \
     --url "https://api.fabric.microsoft.com/v1/connections" \
     --query "value[?connectionDetails.path | contains(@, '$SERVER')] | [0].id" -o tsv)
   ```

   如果没有匹配的连接，请**停止**并指示用户先按照 [connection-binding.md](./references/connection-binding.md) 创建一个连接。
3. 按照[工作流：在 Fabric 中管理语义模型 § 连接绑定](#connection-binding)**执行绑定**——加载 [connection-binding.md](./references/connection-binding.md)，并遵循发现 -> 匹配 -> 绑定 -> 验证流程：
   - 列出模型的数据源引用（`List Item Connections`）。
   - 对于 `connectionDetails` 与 `$CONN_ID` 匹配的每个引用，调用 Fabric `bindConnection` 端点，**每个数据源引用发送一个请求**（不进行批量绑定）。
4. **验证**——重新列出项目连接以确认绑定，并提示用户按照[工作流：刷新语义模型](#workflow-refresh-semantic-model)触发刷新。出现凭据错误 -> 停止并引导用户前往 Service 门户（按照 TROUBLESHOOTING 中的说明）。

---

## 故障排除

| 症状                                 | 解决方法                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| MCP 连接失败                         | 回退到 TMDL 编辑（参见工具选择优先级）。告知用户已执行回退。                                                         |
| TMDL 验证错误                        | 阅读错误详情，修复语法，然后重新验证。加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md)。                   |
| `403 Forbidden` / `identity None`    | 用户需要 Contributor+ 角色——立即停止。不要重试。                                                                     |
| `401 Unauthorized`                   | 更正一次 `--resource` 的受众（参见 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）。如果受众正确后问题仍然存在，则说明缺少权限——停止操作并告知用户。不要循环重试。 |
| `202 Accepted` 但没有结果            | 轮询 LRO，直至完成。                                                                                                  |
| updateDefinition 后缺少部分内容      | 必须包含所有部分——已修改和未修改的部分。                                                                              |
| 刷新凭据错误                         | 引导用户在 Service 门户中进行配置。不要重试。                                                                         |
| 度量值中存在 DAX 错误                | 检查列名/表名引用（区分大小写）。验证引用的对象是否存在。                                                             |
| 部署失败                             | 检查工作区权限、模型兼容性级别以及 Direct Lake 表达式源引用。                                                         |
| 缺少数据源                           | 验证 M 参数或命名表达式是否正确定义。                                                                                 |