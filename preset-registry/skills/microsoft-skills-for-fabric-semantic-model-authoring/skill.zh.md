---
name: semantic-model-authoring
description: "Manages Power BI semantic models, including tables, columns, measures, relationships, DAX authoring and tuning, Import, DirectQuery and Direct Lake designs, sources, connections, permissions, refresh, and deployment. Load this skill before acting on a semantic model, unless it is part of publishing a PBIP project, which powerbi-report-management owns. For natural-language data questions use fabriciq; for visuals use powerbi-report-authoring."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: semantic-model-authoring`（`az rest`：`--headers "x-ms-fabric-skill=semantic-model-authoring"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数 — 仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 过滤
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 过滤
> 3. 选择每项操作所使用的工具时，始终考虑[工具选择优先级](#tool-selection-priority)。如果 MCP 可用并已连接到目标模型，不要默认使用 TMDL 编辑或 `az rest`。

# Power BI 语义模型创作 — CLI 技能

## 工作流选择器

使用此决策树，根据用户意图转到正确的工作流：

| 用户想要……                                                                | 工作流                                                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 从头开始创建语义模型                                                        | [创建新的语义模型](#workflow-create-new-semantic-model)                            |
| 检查或发现模型元数据（表、列、度量值、关系）                                  | [发现语义模型元数据](#workflow-discover-semantic-model-metadata)                    |
| 添加/编辑语义模型对象（例如度量值、表、列、关系）                             | [修改现有模型](#workflow-modify-an-existing-model)                                |
| 编写或重构 DAX 代码                                                         | [修改现有模型](#workflow-modify-an-existing-model)                                |
| 提升 DAX 查询或度量值的性能                                                  | [优化 DAX 性能](#workflow-optimize-dax-performance)                               |
| 根据最佳实践分析语义模型                                                     | [分析最佳实践](#workflow-analyze-best-practices)                                  |
| 准备用于 AI 使用的语义模型（Copilot / Data Agents）                          | [语义模型 AI 就绪性](#workflow-semantic-model-ai-readiness)                        |
| 将模型部署到 Fabric 工作区                                                   | [部署到 Fabric](#workflow-deploy-to-fabric)                                        |
| 刷新语义模型                                                                 | [刷新语义模型](#workflow-refresh-semantic-model)                                   |
| 配置数据源、参数或权限                                                       | [在 Fabric 中管理语义模型](#workflow-manage-semantic-model-in-fabric)              |
| 将语义模型绑定到 Fabric 连接（或解除绑定）                                   | [将语义模型绑定到连接](#workflow-bind-semantic-model-to-a-connection)               |
| 将语义模型定义导出为 PBIP / 获取语义模型定义                                 | [导出为 PBIP](#workflow-export-to-pbip)                                            |

## 目录

当工作流步骤需要时，按需加载这些参考资料。不要一次性全部加载。

| 主题                             | 参考资料                                                                          | 加载时机                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 建模最佳实践                     | [建模指南](./references/modeling-guidelines.md)                                    | 创建或编辑任何模型之前                                                                    |
| 命名约定                         | [命名约定](./references/naming-conventions.md)                                     | 为表、列、度量值命名或重命名时                                                             |
| Direct Lake 建模                 | [Direct Lake 指南](./references/direct-lake-guidelines.md)                         | 模型连接到 OneLake 时                                                                     |
| TMDL 编辑                        | [TMDL 指南](./references/tmdl-guidelines.md)                                       | 生成或编辑任何 TMDL 文件之前                                                              |
| PBIP 项目                        | [PBIP](./references/pbip.md)                                                       | 使用 PBIP 文件夹时                                                                         |
| DAX 语言                         | [DAX 指南](./references/dax-guidelines.md)                                         | 编写或审查任何 DAX 代码时                                                                  |
| 元数据发现（DAX INFO 函数）      | [元数据发现](./references/metadata-discovery.md)                                  | 通过 DAX INFO 函数发现模型元数据时（请参阅[工作流：发现语义模型元数据](#workflow-discover-semantic-model-metadata)） |
| DAX 性能决策指南                 | [DAX 性能决策指南](./references/dax-perf-decision-guide.md)                        | 优化 DAX 时从这里开始                                                                       |
| DAX 性能模式目录                 | [DAX 性能模式](./references/dax-perf-patterns.md)                                  | 决策指南确定候选模式后按需加载                                                               |
| 语义模型 AI 就绪性               | [语义模型 AI 就绪性](./references/semantic-model-ai-readiness.md)                  | 为 Copilot 或数据代理准备模型时                                                             |
| 语义模型 REST API                | [语义模型 REST API](./references/semantic-model-rest-api.md)                       | 使用 `az rest` 进行 TMDL CRUD、刷新、参数、权限或属性检索时                                 |
| 连接绑定                         | [连接绑定](./references/connection-binding.md)                                      | 将语义模型绑定到 Fabric 数据连接（网关、云、VNet、自动或无）或解除绑定时                   |
| 查找工作区/项目                  | [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | 解析工作区/项目 ID 时                                                                      |
| Fabric 控制平面 API              | [COMMON-CLI.md](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)   | 使用 `az rest` 模式、LRO、分页时                                                            |
| 身份验证                         | [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes)                 | 使用 `az login` 进行身份验证时                                                             |
| 身份验证与令牌获取               | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | audience 错误会导致 401；遇到任何身份验证问题前阅读                                         |
| 核心控制平面 REST API            | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式                                                           |
| 定义封装                         | [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md#semanticmodel)    | 构建 TMDL 定义负载时                                                                        |
| 示例                             | [示例](#examples)                                                                  | 参考端到端演练。                                                                          |

---

## 工具选择优先级

优先级顺序（从高到低）：

1. **第 1 层 — 已注册 `powerbi-modeling-mcp` MCP** -> 使用 MCP 对模型执行创作（新建或编辑）操作，无论模型来源是 Power BI Desktop、Fabric 工作区还是本地 PBIP 文件夹。MCP 是编辑语义模型最可靠、功能最完整的方式，可立即对实时模型生效，并且不会造成 TMDL 不同步的风险。

   **重要：** 如果有动态搜索工具可用（例如 `tool_search_tool_regex`），请搜索匹配 `powerbi-modeling-mcp` 模式的可用 MCP 服务器。

   **这同时包括写入和读取/检查操作。**
   - 要检查或验证更改 -> 使用相应的 MCP 操作（List / Get）。
   - **反模式：** 当 MCP 已连接时，打开、`view`、`glob` 或以其他方式读取 TMDL 文件（`*.tmdl`）。MCP 加载的模型才是事实来源 - 磁盘上的 TMDL 已经过时。唯一的例外是用户明确要求处理 TMDL 文件。

2. **第 2 层 — 未注册 MCP + PBIP 文件夹或 Fabric 工作区** -> 直接编辑 TMDL 文件。加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md) 和 [pbip.md](./references/pbip.md)。当来源是 Fabric 工作区时，使用 `az rest` 对 TMDL 执行往返操作（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）：`getDefinition` -> 在本地编辑 TMDL -> `updateDefinition`。

**回退方案 — 上述条件均不满足（例如，没有 PBIP 且没有 MCP 的 Power BI Desktop）** -> 停止。代理无法在此配置下创作模型。指示用户执行以下任一操作：(a) 安装并注册 `powerbi-modeling-mcp` MCP 服务器，或 (b) 将 PBIX 另存为 PBIP 项目，然后重新启动工作流。

> **以下所有工作流均与工具无关。** 工作流步骤描述的是*意图*（连接、创建、编辑、保存、部署、刷新）。执行每个步骤所使用的工具由此处决定。始终选择当前环境中可用的最高优先级工具；当更高优先级的选项可用时，不要混用工具。某些工作流会**覆盖**此默认优先级；在默认使用第 1 层之前，务必先检查工作流自身的工具选择规则。

### 连接到语义模型

语义模型可能位于三个位置。根据[工具选择优先级](#tool-selection-priority)确定连接方式：

- **Power BI Desktop**：定位正在运行的 Power BI Desktop 实例，并连接到其本地模型。
- **Fabric 工作区**：首先按照[查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)模式，通过列出工作区并根据名称解析工作区 ID，然后列出该工作区中类型为 `SemanticModel` 的项目，并根据名称解析模型 ID。然后连接到模型（实时连接），或导出其 TMDL 定义以便本地编辑。
- **PBIP 项目**：连接到 `[Name].SemanticModel/definition` 文件夹。加载 [pbip.md](./references/pbip.md) 以了解 PBIP 文件夹结构 - 只加载包含 TMDL 代码的 `[Name].SemanticModel/definition` 文件夹。

### 将更改保存到语义模型

更改如何持久化取决于模型所在的位置，以及正在使用哪个工具层级（参见[工具选择优先级](#tool-selection-priority)）：

**实时连接（第 1 层 - 针对 Desktop 或 Fabric 工作区的 MCP）：**

- 更改会在每个操作针对实时模型执行时立即应用。不需要显式的保存步骤。
- **PBIP 项目（通过 MCP 实时连接）**：在会话结束时，将模型序列化回 `[Name].SemanticModel/definition` 文件夹。如果 PBIP 文件夹尚不存在，请先按照[导出到 PBIP](#workflow-export-to-pbip) 创建完整结构。

**本地 TMDL 编辑（第 2 层 - 直接编辑文件或 `az rest` 往返）：**

- **PBIP 项目**：更改已在编辑过程中写入 TMDL 文件。不需要额外的保存步骤。
- **Fabric 工作区**：更改是在从服务导出的本地 TMDL 文件中完成的。重新部署模型（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md) 以了解 `updateDefinition` 流程），将更改推送回工作区。

---

## 工作流：创建新的语义模型

**适用情形：** 用户要求从头开始创建新的语义模型。

步骤：

1. **收集需求** - 与用户沟通，直到双方对以下内容达成共识：模型的用途、数据源连接详细信息和架构，以及关键业务实体/事实。**如果没有数据源信息，请停止并使用 `ask_user`。不要猜测或编造。**
2. **确定存储模式** - 数据源是 Fabric OneLake -> **Direct Lake**；否则默认为 **Import**。只有在用户明确要求时才使用 **DirectQuery**。
3. **设计星型架构** - 确定事实表和维度表，以及关系键。
   - 如果事实表包含日期字段，则创建单独的日期维度表，并通过关系将其连接到事实表。如果未明确要求，请使用 PowerQuery/M 分区，而不是 DAX 计算表。
4. **加载适用的指南** - **强制要求：在构建任何对象之前加载 [modeling-guidelines.md](./references/modeling-guidelines.md)（包括下面的第 1 层 MCP 路径）；如果使用 Direct Lake，还要加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)。不要凭记忆构建。**
5. **构建** - 遵循[工具选择优先级](#tool-selection-priority)：**如果有可用的建模 MCP，优先使用它构建整个模型；否则使用 TMDL 代码编辑路径。** 创建一个空数据库（兼容性级别 1702+），然后对每个表按照[修改现有模型](#workflow-modify-an-existing-model)中的执行顺序操作（分区 -> 列 -> 关系 -> 度量值）。存储模式具体要求：
   - **Import / DirectQuery** - 为数据源创建 M 参数（`Server`、`Database`、...），并在分区 M 代码中引用这些参数；确保列具有正确的 `dataType` 和 `sourceColumn` 映射。
   - **Direct Lake** - 使用 `AzureStorage.DataLake` 连接器为 Direct Lake 连接创建共享命名表达式；使用 `EntityPartitionSource`，并以 `directLake` 模式映射到湖屋表列。

> **一次性完成整个模型，然后部署一次。** 在部署前添加所有表、列、关系和度量值——不要部署不完整的模型后再编辑并重新部署。在 MCP 路径中，从头到尾都将模型保留在会话中。
6. **部署或保存** - Fabric 工作区可用 -> [部署到 Fabric](#workflow-deploy-to-fabric)；否则 -> [导出为 PBIP](#workflow-export-to-pbip)。请参阅[保存对语义模型的更改](#saving-changes-to-a-semantic-model)。通过构建模型时使用的同一路径进行部署。
7. **验证** - 运行[验证清单](#validation-checklist)。

---

## 工作流：发现语义模型元数据

**适用情况：** 用户要求检查、列出或发现模型的结构——表、列、度量值、关系、层次结构、分区、角色或存储内部结构。其他工作流（[修改现有模型](#workflow-modify-an-existing-model)、[分析最佳实践](#workflow-analyze-best-practices)、[语义模型 AI 就绪性](#workflow-semantic-model-ai-readiness)）也会在编辑前使用此工作流清点模型。

> **范围：** 此工作流仅涵盖**元数据**发现。要回答针对模型的自然语言/数据问题，请改用 `FabricIQ` skill。

选择一种发现方法（按优先级从高到低排列）：

1. **`powerbi-modeling-mcp` TOM 检查（List / Get）** - 当 `powerbi-modeling-mcp` 已注册并连接到具有**写入权限**的目标模型时，这是默认方法。它直接返回结构化对象模型，并且会与待处理的编辑保持同步，因此在创作期间优先使用此方法。

2. **DAX `INFO` 函数** - 查询模型的 `INFO.VIEW.*` / `INFO.*` 元数据行集。**强制要求：在编写或运行任何 `INFO` 函数 DAX 之前，必须先加载 [metadata-discovery.md](./references/metadata-discovery.md)**。不要凭记忆编写 `INFO` 查询；请加载参考文档并使用其中的模式。**在满足以下任一条件时，优先使用此方法：**
   - **你没有模型的写入权限。** `powerbi-modeling-mcp` 操作要求写入权限；如果具有读取或生成权限，请使用 `INFO` 函数。
   - **`powerbi-modeling-mcp` 未注册或在当前环境中不可用。**
 
   通过以下工具之一执行 `INFO` 函数 DAX（按优先级从高到低排列）：
   - **FabricIQ `ExecuteQuery`** - 只需要模型的**读取**权限。加载 `FabricIQ` skill 以了解工件发现（`DiscoverArtifacts`）和执行机制。
   - **`powerbi-modeling-mcp` `dax_query_operations`** - 需要**写入**权限。当建模 MCP 已连接并具有写入权限时使用此方法。

> **不要使用 FabricIQ `GetSemanticModelSchema` 进行创作元数据发现**——这是一个数据使用工具，可能返回过时的元数据并遗漏最近的编辑。即使 FabricIQ 可用，也始终使用 `INFO` 函数（通过 `ExecuteQuery`）；它们查询的是实时模型。

从较小范围开始：先运行范围估算查询和 `INFO.VIEW.*` 查询，然后仅投影/筛选出与任务相关的对象（请参阅 [metadata-discovery.md](./references/metadata-discovery.md)）。

---

## 工作流：修改现有模型

**适用场景：** 用户要求添加/编辑/删除度量值、表、列、关系，编写 DAX 代码，使用 UDF 重构，或直接编辑 TMDL。

步骤：

1. **连接并发现** - 按照[连接到语义模型](#connecting-to-a-semantic-model)和[发现语义模型元数据](#workflow-discover-semantic-model-metadata)进行操作。列出表、关系和现有度量值，并确定存储模式（它决定适用哪些指南）。
2. **加载适用指南** - 始终加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；如果是 Direct Lake，则加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)；直接编辑 TMDL 时加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md)；进行任何 DAX 更改时加载 [dax-guidelines.md](./references/dax-guidelines.md)（包括 UDF 重构）。
3. **规划更改** - 准确确定要添加、修改或删除的内容。检查命名冲突和重复项。
4. **按正确顺序执行**：
   - **添加表** - 分区 -> 列 -> 关系 -> 度量值。
   - **添加关系** - 确保两端都存在键列，且数据类型匹配；
   - **添加度量值** - 验证所引用的列/表是否存在；
5. **保存并验证** - 按照[保存对语义模型的更改](#saving-changes-to-a-semantic-model)和[验证检查清单](#validation-checklist)进行操作。

---

## 工作流：优化 DAX 性能

**适用场景：** 用户要求提升 DAX 查询性能、诊断运行缓慢的度量值，或优化计算。

> **硬性要求：** 需要支持跟踪的客户端（首选 MCP））

首先加载 [dax-perf-decision-guide.md](./references/dax-perf-decision-guide.md)，并遵循其中定义的框架。仅在应用候选优化模式时加载 [dax-perf-patterns.md](./references/dax-perf-patterns.md)。该框架包括：

1. 用于对优化工作量进行分类的分层模型
2. 用于识别瓶颈的跟踪诊断
3. 包含候选优化技术的模式目录，用于测试和验证

---

## 工作流：分析最佳实践

**适用场景：** 用户要求根据最佳实践审查、审核或分析语义模型。

步骤：

1. **连接并盘点** - 按照[连接到语义模型](#connecting-to-a-semantic-model)和[发现语义模型元数据](#workflow-discover-semantic-model-metadata)进行操作。记录所有表、列、关系、度量值和存储模式。
2. **加载适用指南** - 始终加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；如果是 Direct Lake，则加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)；评估命名时加载 [naming-conventions.md](./references/naming-conventions.md)；评估 DAX 时加载 [dax-guidelines.md](./references/dax-guidelines.md)。
3. **评估** - 根据已加载的指南，将模型与以下方面进行比较（星型架构、命名、关系基数和交叉筛选、带有 `formatString` 的显式度量值、列数据类型和 `sourceColumn`、隐藏的 FK 列、计算列与度量值之间的选择、Direct Lake 约束等）。
4. **按严重性分组呈现发现**（关键、建议、可选）。对于每一项，说明违反的规则和建议的修复方案。等待用户批准。
5. **应用已批准的修复** - 通过[修改现有模型](#workflow-modify-an-existing-model)进行。
6. **保存并验证** - 按照[保存对语义模型的更改](#saving-changes-to-a-semantic-model)和[验证检查清单](#validation-checklist)进行操作。

---

## 工作流：语义模型 AI 就绪

**适用场景：** 用户要求让语义模型准备好用于 Microsoft Fabric Copilot、Power BI Data Agent 或任何对话式 BI 体验。触发条件包括“Copilot readiness”“AI readiness”“Prep for AI”“prepare model for Copilot”。

开始前加载 [semantic-model-ai-readiness.md](./references/semantic-model-ai-readiness.md)。

步骤：

1. **确认范围并收集上下文** - 通过 `ask_user`，根据 *When to Apply* 部分确认使用模式（仅报表 / 对话式 BI / 两者兼有）以及模型稳定性。收集业务上下文（业务流程、关键指标、常见的自然语言问题、术语）。不得臆造。
2. **连接并盘点** - 根据 [Connecting to a Semantic Model](#connecting-to-a-semantic-model) 执行。记录模型内容和源位置（PBIP / Fabric 工作区 / 仅 Desktop）。
3. **评估并分流** - 按顺序检查 [Readiness Checklist](./references/semantic-model-ai-readiness.md#readiness-checklist)；对于每个缺口，根据 [Editing Capability](./references/semantic-model-ai-readiness.md#editing-capability) 对修复方式进行分类（agent 可编辑的 TOM 元数据，或用户在 Power BI“Prep data for AI”UI 中配置的 AI 专用构件）。
4. **按严重性分组呈现发现结果**，并为每项标注处理方式（agent-applicable 或 user-action-required）。等待批准。
5. **应用已批准的更改** - 根据 [Modify an Existing Model](#workflow-modify-an-existing-model) 应用 TOM 元数据修复；对于 AI instructions、AI Data Schema 和 Verified Answers，指导用户在 Power BI“Prep data for AI”UI 中进行配置；仅当用户同意时，才根据就绪性参考文档提供建议；对于仅 Desktop 的 PBIX -> 指导用户操作。
6. **保存、验证并建议进行实时测试** - 根据 [Saving Changes to a Semantic Model](#saving-changes-to-a-semantic-model) 和 [Validation Checklist](#validation-checklist) 执行；建议用户在 Copilot 或 Data Agent 中测试具有代表性的自然语言提示，并持续迭代。

---

## 工作流：导出到 PBIP

**适用场景：** 用户要求将语义模型导出或保存到 PBIP 项目文件夹，或者没有可用于部署的 Fabric 工作区（例如，在内存中构建模型之后）。

> **重要事实：** 导出模型只会生成 TMDL 定义文件。它不会创建外围的 PBIP 文件夹结构（Report 文件夹、`definition.pbism`、`definition.pbir`、`.pbip` 入口点）。agent 必须先搭建这些结构，然后才能导出，否则结果无法在 Power BI Desktop 中打开。

开始前加载 [pbip.md](./references/pbip.md)，并遵循其中定义的 PBIP 文件夹结构。

步骤：

1. **确定目标** - 通过 `ask_user` 获取目标文件夹路径和语义模型名称。如果只提供了文件夹，则使用模型的数据库名称作为语义模型文件夹名称。
2. **搭建 PBIP 结构** - 根据 [pbip.md](./references/pbip.md)，确保 `<Name>.SemanticModel/`（包含 `definition/` 和 `definition.pbism`）、`<Name>.Report/`（包含 `definition/` 和使用 `byPath` 引用的 `definition.pbir`）以及 `<Name>.pbip` 存在。创建任何缺失的部分。
3. **将 TMDL 导出到** `<Name>.SemanticModel/definition/`，根据 [Tool Selection Priority](#tool-selection-priority) 执行：
   - **Tier 1 (MCP)** - 对实时模型使用 MCP 导出/保存操作。
   - **Tier 2 (Fabric workspace, no MCP)** - 调用 `getDefinition`（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)），并写入返回的各个部分。
   - **磁盘上已有本地 TMDL 文件** - 将其复制或移动到 `definition/` 文件夹中。
4. **验证** - 确认 `definition/` 文件夹至少包含 `model.tmdl` 和表的 `.tmdl` 文件；确认 `definition.pbism`、`<Name>.Report/definition.pbir`（其中包含指向 `../<Name>.SemanticModel` 的正确 `byPath`）以及 `<Name>.pbip` 存在，并且彼此引用正确。

---

## 工作流：部署到 Fabric

**适用情形：** 用户要求将语义模型部署或发布到 Fabric 工作区。

> **硬性规则——此工作流优先于默认的 [工具选择优先级](#tool-selection-priority)。** 不要仅仅因为 MCP 可用就默认使用 MCP。部署路径由模型的**来源**决定，而不是由已连接的工具决定。如果模型来源是磁盘上的 PBIP/TMDL 文件，则**必须**使用 Fabric REST API，即使当前存在活动的 MCP 会话也是如此。

决策树（必须严格选择一个——按从上到下的顺序，匹配第一项后停止）：

1. **磁盘上是否存在需要部署的 PBIP / TMDL 文件？**
   -> **是——使用 Fabric REST API。** 使用 `az rest` 调用 `createItemWithDefinition`（新模型）或 `updateDefinition`（现有模型）。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)。
   - 原因：直接通过 Fabric API 部署 TMDL 文件更加可靠、速度更快，并且避免仅为了将模型再次推送出去而不必要地将其加载到 MCP 中。
   - **不要**先在 MCP 中打开 PBIP，再通过 MCP 进行部署。这是此工作流中明确禁止的反模式。
2. **模型是否已经加载到活动的 MCP 会话中**（例如，刚刚在内存中构建完成，或当前正通过 MCP 进行编辑），**且没有涉及 PBIP/TMDL 文件？**
   -> 使用 MCP 工具，以目标工作区和语义模型名称进行部署。
3. **模型是否存在于 Power BI Desktop 中，且没有保存为 PBIP？**
   -> 如果 MCP 已连接到 Desktop，则使用 MCP Deploy。如果 MCP 不可用，则指示用户先保存为 PBIP，然后从第 1 步重新开始此工作流。

通过列出工作区中类型为 `SemanticModel` 的项目，验证部署是否成功。

> **只能部署一次；部署操作不是幂等的。** 重试部署会创建一个名称相同的*第二个*模型，之后部署会失败，并显示 `There are multiple datasets named '<name>'`。如果遇到此错误，**不要**盲目重试：列出工作区中的语义模型，**删除所有名称相同的重复模型**，然后在干净状态下仅部署一次。如果部署的模型可能已经存在，请在执行这唯一一次部署**之前**删除所有名称相同的现有模型。

---

## 工作流：刷新语义模型

**适用情形：** 用户要求刷新语义模型中的数据。

只有在针对 Desktop 或 Fabric Service 中的活动模型进行操作时，才能执行刷新。如果正在处理本地 TMDL 文件，则必须先部署模型。

根据 [工具选择优先级](#tool-selection-priority) 触发刷新：

- **Power BI Desktop**：仅限第 1 层（MCP）——使用 MCP Refresh 操作。
- **Fabric Service**：使用第 1 层（MCP Refresh 操作），或回退到 Power BI Enhanced Refresh API（加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）。

如果刷新因凭据错误而失败，**立即停止**，并指示用户在 Power BI Service 中手动配置数据源连接。不要尝试以编程方式重试或绕过凭据错误。

---

## 工作流：在 Fabric 中管理语义模型

**适用场景：**用户请求在 Fabric Service 中配置语义模型的数据源、更新参数或管理权限。

> **硬性规则——此工作流会覆盖默认的[工具选择优先级](#tool-selection-priority)。**不要默认使用 MCP（第 1 层），优先使用 `az rest` 和 REST API。

### 数据源和参数

通过 Power BI REST API 获取/更新数据源和参数。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md#4-data-sources--parameters-power-bi-datasets-api)。

### 权限

通过 Power BI REST API 列出/授予/更新数据集用户权限。加载 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md#5-permissions-power-bi-datasets-api)。

### 连接绑定

加载 [connection-binding.md](./references/connection-binding.md) 并遵循其中的说明。该参考文档涵盖前置条件、`bindConnection` 端点、发现 -> 匹配 -> 绑定 -> 验证步骤、所有 `connectivityType` 值、解除绑定模式以及故障排除。

关键规则（完整细节请参阅参考文档）：

- 使用 Fabric **Bind Semantic Model Connection** REST API（取代旧版 Power BI `BindToGateway`）。
- **每个数据源引用发送一个绑定请求**——该 API 不支持批量绑定。
- 通过 `List Item Connections` 发现模型的数据源引用，然后将 `connectionDetails` 与 `List Connections` 的结果进行匹配，以找到目标 `id`。如果不存在匹配项，则先创建连接。
- 通过重新列出项目连接并触发刷新进行验证。

---

## 验证清单

在创建或修改模型后运行：

**始终执行（适用于 PBIP、Desktop 和 Fabric Service）：**

1. **检查 PBIP 结构**——如果模型来源于 PBIP 文件夹，请确保文件夹结构和文件均正确（请参阅 [pbip.md](./references/pbip.md)）。
2. **根据建模指南进行验证**——针对 [modeling-guidelines.md](./references/modeling-guidelines.md) 重新检查每项更改（对于 Direct Lake 模型，还要检查 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md)）。

**仅在连接到 Analysis Services 数据库时执行（Power BI Desktop 或 Fabric Service）：**

3. **测试新度量值**——对于每个新度量值，运行一个简单的 DAX 查询，以验证其返回预期结果（例如，`EVALUATE { [Measure Name] }`）。仅处理本地 TMDL/PBIP 文件时跳过此步骤。
4. **测试表刷新**——创建新表时，触发刷新以验证分区、数据源表达式和列映射是否正确。刷新失败通常表示 `sourceColumn` 名称不匹配、M 表达式无效或 Direct Lake 实体引用不正确。仅处理本地 TMDL/PBIP 文件时跳过此步骤。

如果任何检查失败，请修复问题并重新运行验证。

---

## 必须/优先/避免

### 必须

- **在开始前了解数据源架构**——在设计或修改模型前，分析源表、列和数据类型。
- **遵循建模指南**——在创建或编辑任何模型之前加载 [modeling-guidelines.md](./references/modeling-guidelines.md)；应用星型架构设计、命名约定以及列/度量值规则。
- **遵循[工具选择优先级](#tool-selection-priority)**——始终选择当前环境中可用的最高优先级工具层级；当更高优先级的选项可用时，不要混用不同层级。

### 优先选择

- **优先使用星型模式，而不是雪花模式或平面表** - 使用带有单列关系键的反规范化维度
- **与现有模型模式保持一致** - 编辑现有模型时，应匹配其命名约定和结构，而不是强行引入新的约定
- **优先使用 TMDL 格式，而不是 TMSL** - 基于文本、便于 diff，是 Fabric 的首选格式
- **更改后进行验证** - 使用 [工作流：发现语义模型元数据](#workflow-discover-semantic-model-metadata) 确认对象已正确写入。

### 避免

- **硬编码工作区/项目 ID** - 通过 API 动态解析
- **MCP 已连接时读取 TMDL 文件** - Tier 1 MCP 会话处于活动状态时，对 `*.tmdl` 使用 `view`/`glob` 属于反模式（参见 [工具选择优先级](#tool-selection-priority)）。
- **MCP 已注册时手动编写 TMDL 文件** - 使用 `create`/`edit`/文件写入工具搭建 `model.tmdl`、`database.tmdl`、`relationships.tmdl` 或 `tables/*.tmdl` 属于 Tier 1 反模式，即使是全新模型也一样。应通过 MCP 工具构建并导出。

### 禁止

- **管理 RLS/OLS 角色成员身份** - 不要提议使用 REST 调用、`az rest` URL、MCP 操作或 TMDL 更改来向安全角色添加/移除用户或组。拒绝此范围外的请求，并将用户引导至 Power BI 门户。

---

## 示例

> **范围说明** — 示例使用 `az rest` 进行发现，以解析 ID 并发现 Fabric 元数据（参见 [COMMON-CLI.md § 查找 Fabric 中的工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)）。语义模型定义的编写遵循 [工具选择优先级](#tool-selection-priority)：如果可用，则使用 Tier 1 MCP `powerbi-modeling-mcp`；否则使用 Tier 2，通过 `getDefinition` / `updateDefinition` 编辑 TMDL。

### 示例 1：修改现有语义模型

**提示**：“为工作区 **Marketing** 中语义模型 **Sales** 的所有可聚合列创建基础度量值。”

**Agent 响应** - 遵循[工作流：修改现有模型](#workflow-modify-an-existing-model)。

1. **通过 `az rest` 发现 ID**。
2. **连接到模型**，具体参见[连接到语义模型](#connecting-to-a-semantic-model)和[工具选择优先级](#tool-selection-priority)。注册了 `powerbi-modeling-mcp` 后，直接通过 MCP 连接到 Fabric 工作区模型（Tier 1）。否则回退到 Tier 2（`getDefinition` -> 在本地编辑 TMDL）。
3. **检查并规划** - 通过当前活动的工具层级列出表和列；识别可聚合列（数值列、非外键、非隐藏的代理 ID），并根据 [modeling-guidelines.md](./references/modeling-guidelines.md) 和 [naming-conventions.md](./references/naming-conventions.md)，为每列决定使用 `SUM` / `AVERAGE` / `MIN` / `MAX`。编写 DAX 前加载 [dax-guidelines.md](./references/dax-guidelines.md)。
4. **添加度量值**，遵循[工作流：修改现有模型](#workflow-modify-an-existing-model)。
   - **Tier 1（MCP）**：为每个新度量值调用工具 `create`，并提供 `expression`、`formatString` 和目标表。不要手动编写 TMDL。
   - **Tier 2（无 MCP）**：直接编辑表的 `.tmdl` 文件，并通过 `updateDefinition` REST API 往返更新。
5. **保存并验证**，遵循[保存语义模型的更改](#saving-changes-to-a-semantic-model)。

---

### 示例 2：从 Fabric Lakehouse 创建新的语义模型

**提示词**：“在工作区 **Marketing** 中创建一个新的 Power BI 语义模型，使用同一工作区中的 **SalesLakehouse** 作为数据源。”

**代理响应**——遵循[工作流：创建新的语义模型](#workflow-create-new-semantic-model)。

1. 通过 `az rest` **发现工作区和 Lakehouse ID**。
2. **发现 Lakehouse 架构**——通过 Lakehouse OneLake API 或 Lakehouse 的 SQL Endpoint 列出表和列。记录表名、列名和数据类型——这些信息将用于驱动语义模型表、列定义和分区元数据。
3. 根据[工具选择优先级](#tool-selection-priority)**选择工具层级**：完整构建优先使用 Tier 1（`powerbi-modeling-mcp`）。仅当未注册 MCP 时，才使用 Tier 2（先搭建 PBIP/TMDL 脚手架，然后部署）。
4. 按照[工作流：创建新的语义模型](#workflow-create-new-semantic-model)**构建模型**——数据源为 OneLake，因此存储模式为 **Direct Lake**（加载 [direct-lake-guidelines.md](./references/direct-lake-guidelines.md) 和 [modeling-guidelines.md](./references/modeling-guidelines.md)）。基于 Lakehouse 表设计星型架构，然后：
   - 创建空数据库。
   - 为 Lakehouse 连接创建一个共享的命名表达式。
   - 对于每个表：添加 `EntityPartitionSource`（模式为 `directLake`）-> 将列映射到 Lakehouse 列 -> 添加关系 -> 添加度量值。
5. 按照[工作流：部署到 Fabric](#workflow-deploy-to-fabric)**进行部署**：
6. 按照[验证清单](#validation-checklist)**进行验证**——确认模型显示在工作区中，并触发初始刷新，以验证 Direct Lake 列映射是否能够正确解析。

---

### 示例 3：将语义模型绑定到 Fabric 连接

**提示词**：“将工作区 **Marketing** 中的语义模型 **Sales** 绑定到 **sql-prod** 连接。”

**代理响应**——遵循[工作流：在 Fabric 中管理语义模型 § 连接绑定](#connection-binding)。**不使用 MCP**——此工作流覆盖[工具选择优先级](#tool-selection-priority)，仅使用 REST。

1. 通过 `az rest` **发现工作区和模型 ID**。
2. 通过匹配服务器名称在 Fabric 中**发现目标连接**：

   ```bash
   SERVER="sql-prod"
   CONN_ID=$(az rest --method get --resource "https://api.fabric.microsoft.com" \
     --url "https://api.fabric.microsoft.com/v1/connections" \
     --query "value[?connectionDetails.path | contains(@, '$SERVER')] | [0].id" -o tsv)
   ```

   如果没有匹配的连接，**停止**并根据 [connection-binding.md](./references/connection-binding.md) 指示用户先创建连接。
3. 根据[工作流：在 Fabric 中管理语义模型 § 连接绑定](#connection-binding)**执行绑定**——加载 [connection-binding.md](./references/connection-binding.md)，并遵循发现 -> 匹配 -> 绑定 -> 验证流程：
   - 列出模型的数据源引用（`List Item Connections`）。
   - 对于每个 `connectionDetails` 与 `$CONN_ID` 匹配的引用，调用 Fabric `bindConnection` 终结点；**每个数据源引用发送一个请求**（不进行批量绑定）。
4. **进行验证**——重新列出项目连接以确认绑定，并根据[工作流：刷新语义模型](#workflow-refresh-semantic-model)提示用户触发刷新。凭据错误 -> 停止，并根据 TROUBLESHOOTING 指引用户前往 Service 门户。

---

## 故障排除

| 症状                              | 修复                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| MCP 连接失败                      | 回退到 TMDL 编辑（参见工具选择优先级）。告知用户已执行回退。                                                         |
| TMDL 验证错误                     | 阅读错误详细信息，修复语法，然后重新验证。加载 [tmdl-guidelines.md](./references/tmdl-guidelines.md)。               |
| `403 Forbidden` / `identity None` | 用户需要 Contributor+ 角色——立即停止。不要重试。                                                                  |
| `401 Unauthorized`                | 修正一次 `--resource` audience（参见 [semantic-model-rest-api.md](./references/semantic-model-rest-api.md)）。如果 audience 正确后仍然持续出现，则表示缺少权限——停止并告知用户。不要循环重试。 |
| `202 Accepted` 但没有结果         | 轮询 LRO 直至完成。                                                                                                   |
| updateDefinition 后缺少部件       | 必须包含所有部件——已修改的和未修改的。                                                                               |
| 刷新凭据错误                      | 引导用户在 Service 门户中进行配置。不要重试。                                                                        |
| 度量值中的 DAX 错误               | 检查列/表名称引用（区分大小写）。确认被引用的对象存在。                                                             |
| 部署失败                          | 检查工作区权限、模型兼容性级别以及 Direct Lake 表达式源引用。                                                       |
| 缺少数据源                        | 确认 M 参数或命名表达式已正确定义。                                                                                   |