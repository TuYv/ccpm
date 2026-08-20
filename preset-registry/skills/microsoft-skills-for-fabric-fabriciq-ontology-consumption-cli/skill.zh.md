---
name: fabriciq-ontology-consumption-cli
description: >
  Explore Fabric IQ Ontology (preview) items (read-only) from the CLI to ground an agent before it
  queries data. Explore, describe, and summarize what an ontology exposes — its entity types, keys,
  relationships, and the bindings that map each concept onto a lakehouse or Eventhouse source — then
  route the underlying data query to the matching per-datasource consumption skill
  (eventhouse-consumption-cli, spark-consumption-cli, sqldw-consumption-cli). Read-only discovery via
  Get Item Definition; never writes to or alters an ontology. Use to explore or summarize an ontology,
  describe its schema and data lineage, build agent grounding context, or run an ontology-backed
  query over the source records.
  Triggers: "query fabric ontology", "explore fabric ontology", "list ontology entities",
  "enumerate ontology entity types", "describe ontology", "ontology grounding context",
  "ground query with ontology", "query ontology entity data", "fabric iq ontology consumption",
  "ontology-backed query", "ontology entity bindings"
---
> **更新检查 — 每个会话仅一次（必需）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能（例如 `/fabric-skills:check-updates`）。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：读取本地 `package.json` 版本，然后通过 `git fetch origin main --quiet && git show origin/main:package.json`（或 GitHub API）与远程版本进行比较。如果远程版本更新，请显示变更日志和更新说明。
> - 如果本次会话中先前已执行过该检查，则跳过。

> **关键说明**
> 1. Ontology 目前处于**预览版**。项类型值为 `Ontology`。传输格式和限制可能会发生变化；在生产环境中使用前，请根据当前文档进行验证。
> 2. 此技能为**只读**。它绝不会调用 `createItem` 或 `updateDefinition`。如需更改架构，请委托给 **`fabriciq-ontology-authoring-cli`**。
> 3. 此技能**不会**直接查询源数据。它会枚举本体的基础上下文，然后将实际数据读取**委托**给与绑定源类型相匹配的各数据源使用技能（请参阅[查询路由](#query-routing)）。
> 4. 投影（本体实体之上的语义查询层）**尚未正式发布**。在其发布之前，所有数据查询都将针对**源**表（`LakehouseTable` 或 `KustoTable`）运行，并使用绑定的 `propertyBindings[]` 中声明的列。
> 5. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区并使用 JMESPath 筛选。
> 6. 要根据工作区 ID 和项名称查找本体项 ID：列出该工作区中所有类型为 `Ontology` 的项，并使用 JMESPath 筛选。

# fabriciq-ontology-consumption-cli — 通过 CLI 使用 Fabric Ontology

## 目录

| 任务                                             | 参考                                                                                                                    | 说明                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 在 Fabric 中查找工作区和项           | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)  | **必需** — 枚举前解析工作区/项 ID     |
| Fabric 拓扑和关键概念                   | [COMMON-CORE.md § Fabric 拓扑和关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts)                 | 工作区 → 项层次结构                                        |
| 身份验证和令牌获取               | [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition)         | 将 `https://api.fabric.microsoft.com` 受众用于控制平面 |
| 核心控制平面 REST API                     | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis)                    | 获取项定义                                               |
| 长时间运行的操作（LRO）                    | [COMMON-CORE.md § 长时间运行的操作（LRO）](../../common/COMMON-CORE.md#long-running-operations-lro)                    | `getDefinition` 返回一个 LRO                                    |
| 速率限制和节流                       | [COMMON-CORE.md § 速率限制和节流](../../common/COMMON-CORE.md#rate-limiting--throttling)                         |                                                                   |
| 身份验证方法                           | [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)                                  | `az login`；令牌获取                                     |
| 通过 `az rest` 使用 Fabric 控制平面 API           | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)      | **始终**传递 `--resource https://api.fabric.microsoft.com`     |
| 长时间运行的操作（LRO）模式            | [COMMON-CLI.md § 长时间运行的操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)      | 轮询 `operations/{x-ms-operation-id}`，直至状态为 `Succeeded`          |
| 注意事项和故障排除（CLI 特定）         | [COMMON-CLI.md § 注意事项和故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | 令牌受众、shell 转义                                    |
| 定义信封（parts、payloadType）         | [ITEM-DEFINITIONS-CORE.md § 定义信封](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope)                  | `InlineBase64` 部件模式 — 本体返回此结构    |
| 本体定义树                         | [ONTOLOGY-AUTHORING-CORE.md § 定义树](../fabriciq-ontology-authoring-cli/references/ONTOLOGY-AUTHORING-CORE.md#definition-tree)                      | 需要解码的部件的权威文件/文件夹布局         |
| EntityType 和 EntityTypeProperty 架构           | [ONTOLOGY-AUTHORING-CORE.md § EntityType 文件](../fabriciq-ontology-authoring-cli/references/ONTOLOGY-AUTHORING-CORE.md#entitytype-file--entitytypesiddefinitionjson) | `valueType` 目录、键/显示名称约定                 |
| DataBinding 架构和源类型映射         | [ONTOLOGY-AUTHORING-CORE.md § DataBinding 文件](../fabriciq-ontology-authoring-cli/references/ONTOLOGY-AUTHORING-CORE.md#databinding-file--entitytypesiddatabindingsguidjson) | `LakehouseTable` 与 `KustoTable`；`propertyBindings[]` 结构       |
| RelationshipType 和上下文化             | [ONTOLOGY-AUTHORING-CORE.md § RelationshipType 文件](../fabriciq-ontology-authoring-cli/references/ONTOLOGY-AUTHORING-CORE.md#relationshiptype-file--relationshiptypesiddefinitionjson) | 源/目标和链接表约定                            |
| 连接基础知识（EH 源查询）      | [EVENTHOUSE-CONSUMPTION-CORE.md § 连接基础知识](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#connection-fundamentals) | `KustoTable` 绑定的群集 URI 和数据库发现              |
| 性能最佳实践（EH 源查询）   | [EVENTHOUSE-CONSUMPTION-CORE.md § 性能最佳实践](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#performance-best-practices) | 时间筛选器、`has` 与 `contains`                                 |
| Spark 使用模式（Lakehouse 源）   | [SPARK-CONSUMPTION-CORE.md](../../common/SPARK-CONSUMPTION-CORE.md)                                                          | 对于 `LakehouseTable` 绑定，委托读取                      |
| SQL 使用模式（SQL 终结点/DW）     | [SQLDW-CONSUMPTION-CORE.md](../../common/SQLDW-CONSUMPTION-CORE.md)                                                          | 用于 `LakehouseTable` SQL 终结点读取和 Warehouse 读取       |
| 本体使用概念                                | [SKILL.md § 本体使用概念](#ontology-consumption-concepts)                                                   | 实体/关系/绑定/基础上下文               |
| 工具栈                                       | [SKILL.md § 工具栈](#tool-stack)                                                                                         |                                                                   |
| 连接                                       | [SKILL.md § 连接](#connection)                                                                                         | 发现工作区、本体 ID；获取项定义              |
| 使用范围                                | [SKILL.md § 使用范围](#consumption-scope)                                                                           | 此技能执行/不执行的操作                                |
| 基础上下文提取（深入参考）    | [grounding-extraction.md](references/grounding-extraction.md)                                                                | 解码部件 → 面向代理的基础 JSON                          |
| 查询路由（深入参考）                   | [routing.md](references/routing.md)                                                                                          | 绑定类型 → 各数据源技能和查询结构                 |
| 实际示例                                  | [examples.md](references/examples.md)                                                                                        | 端到端 bash 方法（枚举 → 路由 → 查询）               |
| 图遍历（从锚点开始的 N 跳邻域）     | [graph-walks.md](references/graph-walks.md)                                                                                  | 锚点实体 + 跳数预算 → 组合式内联读取，无需脚本    |
| 快速响应规范                       | [SKILL.md § 快速响应规范](#snappy-response-discipline)                                                         | 内联优先；仅在有状态或可重新运行时使用脚本            |
| 必须/优先/避免/故障排除          | [SKILL.md § 必须/优先/避免/故障排除](#must--prefer--avoid--troubleshooting)                                  | LLM 决策规则                                                |
| 代理式工作流                                | [SKILL.md § 代理式工作流](#agentic-workflows)                                                                           | 先获取基础上下文、再查询的循环；可感知架构的查询生成             |
| 代理集成说明                          | [SKILL.md § 代理集成说明](#agent-integration-notes)                                                               | 此技能如何与创作技能/各数据源技能组合    |

---

## 本体使用概念

Fabric Ontology 项在项定义中以 **JSON 文件树**的形式承载其架构（结构与创作时相同）。`Get Item Definition` 返回以 base64 编码的有效负载形式提供的各个部分；使用流程始终为：**获取 → 解码 → 解析 → 定位 → 委派**。

| 概念 | 定义部分 | 它向代理提供的信息 |
|---|---|---|
| 实体类型 | `EntityTypes/{entityTypeId}/definition.json` | 逻辑类型名称、键属性（`entityIdParts`）、显示名称属性、静态 `properties[]`、`timeseriesProperties[]`、值类型目录 |
| 数据绑定 | `EntityTypes/{entityTypeId}/DataBindings/{guid}.json` | 支撑此实体类型的物理表、源种类（`LakehouseTable` / `KustoTable`）、`dataBindingType`（`NonTimeSeries` / `TimeSeries`）、列到属性的映射，以及对于时序数据的时间戳列 |
| 关系类型 | `RelationshipTypes/{relTypeId}/definition.json` | 两种实体类型（源/目标）之间的链接；名称；基数提示 |
| 上下文化 | `RelationshipTypes/{relTypeId}/Contextualizations/{guid}.json` | 哪个 Lakehouse 链接表保存用于实现该关系的（源键、目标键）对 |

**定位上下文** = 该树经过扁平化、可供代理直接使用的投影：一份 LLM 可以读取的 JSON 摘要，用于决定*要查询哪个实体类型*、*哪个列保存键*、*要访问哪个表*以及*要调用哪个使用技能*。完整结构和提取方法：[grounding-extraction.md](references/grounding-extraction.md)。

属性 `valueType` 允许的值（精确）：`String`、`Boolean`、`DateTime`、`Object`、`BigInt`、`Double`。整数为 `BigInt`（而不是 `Int64`）；GUID 建模为 `String`。有关完整的源列 → `valueType` 映射，请参阅 [ONTOLOGY-AUTHORING-CORE.md § EntityTypeProperty](../fabriciq-ontology-authoring-cli/references/ONTOLOGY-AUTHORING-CORE.md#entitytypeproperty)。

---

## 工具栈

本体使用采用与其他所有 CLI 技能相同的 Fabric 控制平面工具栈——有关规范列表（安装命令、先决条件检查、base64 辅助工具、JSON 工具），请参阅 [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale)；有关 `az login` 和令牌获取，请参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)。

各数据源的读取操作会被委派——使用此技能进行枚举时，**不**需要安装 Kusto、Spark 或 SQL CLI 工具。仅当你还要在同一会话中调用下游使用技能时，才需要这些工具。

---

## 连接

本体使用以 Fabric 控制平面为目标。你需要提供 **workspace ID** 和 **ontology item ID**；其他所有信息（实体类型、绑定、源表、群集 URI）都会通过解码定义来恢复。

- 登录并获取 Fabric 控制平面令牌 → [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)（始终使用 `--resource https://api.fabric.microsoft.com`）。
- 根据 `displayName` 解析 workspace ID，并通过按 `displayName` 筛选 `GET /v1/workspaces/{WS_ID}/items?type=Ontology` 的结果来解析 ontology item ID → [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)（涵盖分页和 JMESPath 筛选）。
- 通用 `az rest` 调用模板 → [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)。

### 获取定义（Ontology-preview LRO 注意事项）

`Get Item Definition` 支持长时间运行操作。根据租户/SKU，POST 请求可能以内联方式返回定义信封（`200 OK`），**也可能**返回 `202 Accepted` 并带有 `x-ms-operation-id` 标头；对于 202 情况，请轮询 `https://api.fabric.microsoft.com/v1/operations/{operationId}` 直至状态变为 `Succeeded`，然后 GET `…/operations/{operationId}/result` 以接收 `parts[]` 数组。通用 LRO 流程（捕获 `x-ms-operation-id`、轮询、获取结果）请参阅 [COMMON-CLI.md § 长时间运行操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)。

> **Ontology-preview 注意事项——优先轮询 `operations/{id}` 端点，而不是使用 `Location` 标头。** 公共 Fabric LRO 约定支持这两种方式，但据观察，在此 Ontology LRO 上，`Location` 标头会重定向到 `*.analysis.windows.net` 主机；使用 Fabric 受众令牌轮询该地址并不稳定（间歇性出现 `401/403`）。请改为轮询 Fabric 主机上的 `https://api.fabric.microsoft.com/v1/operations/{operationId}`。如果必须跟随 `Location`，请使用该 URL 所要求的受众。如果轮询返回任何非 2xx 响应，**请读取操作的 `.error` 并停止——绝不要盲目重试 POST**。

此技能的完整获取和解码流程（LRO 捕获 + 部件解码 + 树重建，以及 Bash + PowerShell + Python 辅助工具）位于 [grounding-extraction.md § 获取和解码](references/grounding-extraction.md#fetch-and-decode-an-ontology-definition)。同级的 `fabriciq-ontology-authoring-cli` 在其 [LRO 标头捕获部分](../fabriciq-ontology-authoring-cli/SKILL.md#lro-header-capture-with-az-rest)记录了相同的重定向主机解决方法——如果修改其中一处，请确保两处保持同步。

### 源数据连接（委托）

数据查询本身（KQL / Spark SQL / T-SQL）使用由同级消费技能负责的连接模式：

- **Eventhouse**（`KustoTable` 绑定）→ [EVENTHOUSE-CONSUMPTION-CORE.md § 连接基础](../../common/EVENTHOUSE-CONSUMPTION-CORE.md#connection-fundamentals) + `eventhouse-consumption-cli`
- **Lakehouse**（`LakehouseTable` 绑定）→ `sqldw-consumption-cli`（默认，SQL 分析端点）或 `spark-consumption-cli`（仅当用户明确希望进行 PySpark / DataFrame 工作时）
- **Warehouse 绑定** → ❓ 当前共享本体架构中未记录（仅有 `LakehouseTable` 和 `KustoTable`）；如果遇到此类绑定，请向用户说明，而不是默认为 `sqldw-consumption-cli`

委托方所需的 `clusterUri`、`databaseName`、`workspaceId` 和 `itemId` 都已包含在解码后的绑定有效负载中——**不要**通过项 API 重新发现它们。

---

## 消费范围

| 操作 | 此技能 | 委托给 |
|---|---|---|
| 枚举实体类型、属性、键和显示名称 | ✅ | — |
| 枚举绑定（源类型、目标项、属性映射、时间戳） | ✅ | — |
| 枚举关系和上下文化 | ✅ | — |
| 生成面向 LLM 的基础 JSON | ✅ | — |
| 解码完整定义树以进行差异比较/审查 | ✅ | — |
| 查询 Eventhouse 中由本体支持的**数据** | 路由 | `eventhouse-consumption-cli` |
| 通过 SQL 端点查询 Lakehouse 中由本体支持的**数据**（默认） | 路由 | `sqldw-consumption-cli` |
| 通过 Spark 查询 Lakehouse 中由本体支持的**数据**（仅限明确要求使用 Spark） | 路由 | `spark-consumption-cli` |
| 查询 Warehouse 中由本体支持的**数据** | 向用户说明（❓ 共享架构中没有绑定结构） | — |
| 创建/更改/重新绑定实体类型/关系 | ❌ | `fabriciq-ontology-authoring-cli` |
| 刷新本体的索引状态 | ❌ | 不在预览版 CLI 范围内 |

> 在投影功能发布之前，所有数据读取都是**源查询**——它们使用 `propertyBindings[]` 中列出的列，针对物理 `LakehouseTable` 或 `KustoTable` 运行。需要投影的语义功能（推断联接、派生度量值）**无法**通过此技能使用；请向用户说明这一点，并继续执行源级筛选。

---

## 基础上下文

深入操作指南 + 完整 JSON 结构：[grounding-extraction.md § 基础信息提取](references/grounding-extraction.md)。快速索引：

| 主题 | 参考资料 |
|---|---|
| 获取 + LRO + 解码各部分 | [grounding-extraction.md § 获取并解码](references/grounding-extraction.md#fetch-and-decode-an-ontology-definition) |
| 在内存中重建定义树 | [grounding-extraction.md § 树重建](references/grounding-extraction.md#tree-reconstruction) |
| 生成基础信息 JSON 摘要（实体 + 绑定 + 关系） | [grounding-extraction.md § 基础信息摘要架构](references/grounding-extraction.md#grounding-summary-schema) |
| 比较两个本体版本的差异 | [grounding-extraction.md § 比较两个本体](references/grounding-extraction.md#diff-two-ontologies) |

**基础信息 JSON 约定**——权威结构位于 [grounding-extraction.md § 基础信息摘要架构](references/grounding-extraction.md#grounding-summary-schema)。路由决策会读取每个绑定中的以下字段：

- `source.kind` (`LakehouseTable` | `KustoTable`)——选择委派技能系列。
- `source.workspaceId` + `source.itemId`——**从绑定中读取，而不是从本体中读取**（允许跨工作区绑定）。
- `source.sourceSchema` + `source.sourceTableName`——仅 Lakehouse 包含架构。
- `source.clusterUri` + `source.databaseName`——仅 Kusto 使用。
- `dataBindingType` (`NonTimeSeries` | `TimeSeries`) + `timestampColumnName`——时序路由所必需。
- `propertyBindings[].sourceColumnName`——本体属性到物理列的重映射；必须在构造任何查询之前应用。
- `relationshipTypes[].contextualizations[].sourceKeyRefBindings[]` / `targetKeyRefBindings[]`——**数组**；允许使用复合键。应基于**所有**条目进行联接。

将此 JSON 的精简子集（而不是原始 base64 `definition.parts[]`）交给下游技能。

---

## 查询路由

深入操作指南 + 各技能调用模板：[routing.md](references/routing.md)。快速决策表：

| 绑定源类型 | `dataBindingType` | 委派技能（默认 / 备选） | 查询形式 |
|---|---|---|---|
| `LakehouseTable` | `NonTimeSeries` | `sqldw-consumption-cli`（默认，SQL 终结点）——仅当用户明确需要 PySpark / DataFrames 时使用 `spark-consumption-cli` | `SELECT <propertyColumns> FROM <schema>.<sourceTableName> WHERE <keyColumn> = <value>` |
| `LakehouseTable` | `TimeSeries` | `sqldw-consumption-cli`（默认）——需要仅限 Spark 的功能时使用 `spark-consumption-cli` | `SELECT ..., <timestampColumn> FROM <schema>.<sourceTableName> WHERE <keyColumn> = <v> AND <timestampColumn> >= DATEADD(hour,-1,SYSUTCDATETIME())` |
| `KustoTable` | `TimeSeries` | `eventhouse-consumption-cli` | `<sourceTableName> \| where <keyColumn> == "<v>" \| where <timestampColumn> > ago(1h) \| project <propertyColumns>` |
| `KustoTable` | `NonTimeSeries` | **无效**——预览版禁止此组合 | 拒绝请求，并告知用户本体绑定有误 |
| 任意关系上下文化 | — | `sqldw-consumption-cli`（默认；链接表位于 Lakehouse 中，使用 T-SQL 进行联接更简洁）——`spark-consumption-cli` 为备选 | `SELECT <targetKeyColumns> FROM <linkTable> WHERE <sourceKeyColumns> = <source-values>`，然后在后续调用中联接目标端绑定 |

**移交时的调用约定** — 此技能会解析源元数据，并**使用目标方言构造查询**，然后将两者移交给委托技能。委托技能（同级技能）负责实际的连接与执行。

- **Eventhouse 委托技能** → 已解析的连接信息（`clusterUri`、`databaseName`）+ **已构造的 KQL 文本**，其目标为 `sourceTableName`，并包含 `timestampColumnName` 筛选器和键谓词。
- **SQL 终结点委托技能**（Lakehouse 的默认选项）→ 已解析的连接信息（`workspaceId`、`itemId`、`sourceSchema`）+ **已构造的 T-SQL 文本**。
- **Spark 委托技能**（Lakehouse 的备选选项）→ 相同的已解析连接信息 + **已构造的 Spark SQL 文本** — 使用 Spark 原生时间函数（`current_timestamp() - INTERVAL 1 HOUR`）；**不要**向 Spark 输出 T-SQL 的 `DATEADD` / `SYSUTCDATETIME`。
- **始终**在构造的查询文本中，将本体属性名称转换为 `propertyBindings[].sourceColumnName`。委托技能只能看到物理列，不会解析本体标识符。
- **始终**传递复合的 `sourceKeyRefBindings[]` / `targetKeyRefBindings[]` — 应基于**每个**元素进行联接，而不只是第一个。

> 由于投影尚未正式发布（请参阅关键说明 #4），在构造委托查询之前，始终通过 `propertyBindings[]` 将用户提到的**本体属性名称**转换回**物理源列名称**。不要将本体属性名称传递给同级技能 — 它不会解析这些名称。

---

## 必须 / 建议 / 避免 / 故障排除

### 必须

- **路由至此技能之前，要求提供明确的本体上下文** — 提示必须提及“本体”，或通过 ID/名称引用某个本体项。没有本体上下文的通用“Fabric IQ”或报表/数据集提示**不属于**本体任务；应将其转交给匹配的数据技能（例如，Power BI 报表应使用 `powerbi-consumption-cli`）。这样可以避免因共用“Fabric IQ”品牌而过度触发此技能。
- **路由含糊的提示之前先要求澄清** — 如果用户要求“向我显示飞机读数”，而多个实体类型都绑定到类似飞机的表，请询问要使用哪个实体类型/绑定。静默猜测会产生错误的数据。
- **获取定义之前先解析 `WS_ID` 和 `ONT_ID`** — 硬编码 GUID 是最常见的失败原因之一。
- **对 `getDefinition` 遵循 LRO 模式** — 返回带有 `x-ms-operation-id` 的 `202` 属于正常情况；不要将其视为成功。轮询 `operations/{operationId}`，直到状态为 `Succeeded`，然后 GET `…/operations/{operationId}/result`。优先使用 `operations/{operationId}`，而不是直接轮询 `Location`（使用 Fabric 受众令牌时，analysis.windows.net 重定向可能不稳定）；如果跟随 `Location`，请使用该 URL 所要求的受众。轮询返回 Failed/非 2xx 时，请读取 `.error` 并停止 — 切勿盲目重试。
- **回答之前解码所有相关部分** — 切勿基于缓存的不完整本体视图作答。自上次读取以来，调用方可能已经添加或更改了实体类型。
- **在生成任何 KQL / Spark SQL / T-SQL 之前，通过 `propertyBindings[]` 将本体属性名称转换为源列名称**。同级消费技能只能看到物理列。
- **遵循绑定类型** — `TimeSeries` 要求对 `timestampColumnName` 应用时间筛选器。省略该筛选器将导致全表扫描，并且经常会被下游技能拒绝。
- **为每个绑定保留 `workspaceId` + `itemId`** — 本体绑定引用的源项可能位于与本体自身**不同的工作区**中；不要假定它们位于同一位置。
- **发出元数据调用之前先查阅内存中的基础数据** — 一旦会话已解码基础 JSON，之后的每次遍历/查询都应**从基础数据中**读取源列名称、链接表名称、项 GUID、`clusterUri` 和 `databaseName`，而不是重新执行 `list items` / `get eventhouse` 往返调用。重复获取已有的元数据是调用次数膨胀的首要原因。
- **在源 URL 中使用 GUID，而不是友好名称** — 许多租户启用了 `FriendlyNameSupportDisabled`，这会导致 OneLake DFS / Fabric REST URL 静默拒绝 `MyLakehouse.Lakehouse` 之类的名称。始终从基础数据中提取 GUID，并将其替换到 URL 中。

### 推荐

- 对于任何包含 `|`、`"` 或换行符的下游 KQL / SQL 负载，**使用带有 `--body @file.json` 的 `az rest`**。内联 `--body` 会因 shell 转义而出错——参见 [EVENTHOUSE-CONSUMPTION-CORE.md](../../common/EVENTHOUSE-CONSUMPTION-CORE.md)。
- 将上下文交给另一个智能体时，优先使用**基础化摘要 JSON**（参见上方架构），而不是原始 `definition.json` 转储。
- 首次读取任何实体的数据时，使用 **`take 100` / `TOP 100`**，然后再细化查询。
- 对于只读消费工作，优先使用**内联 `az rest` / `curl`，而不是 Python 脚本**——图遍历、单实体查找和临时扇出读取应在 shell 中组合为不超过约 15 次 REST 调用。仅当工作是**有状态的**（信封组装、ID 映射、用户希望可重新运行的 LRO）时才使用脚本。参见[快速响应规范](#snappy-response-discipline)和 [graph-walks.md](references/graph-walks.md)。
- **在单次会话的生命周期内缓存已解码的定义**——本体定义比源数据小几个数量级，并且很少在任务进行期间发生变化。如果用户提到创作活动，请重新获取。
- **仅对绑定的源列使用 `project` / `SELECT`**，而不是完整的物理表——本体绑定意味着存在明确的列白名单。

### 避免

- **使用本体属性名称查询源表**——这些名称不存在于物理架构中。始终通过 `propertyBindings[]` 进行映射。
- 在读取 `TimeSeries` / `KustoTable` 时，**遗漏 `where <timestampColumn> > ago(...)`**——对流式表进行全表扫描是查询失败的首要原因。
- **在一次委托调用中跨数据源类型进行联接**——如果关系的两端位于不同的源类型中，委托无法表达该联接。请分别获取两端的数据，然后在智能体中进行联接。
- 通过此技能**修改本体**——将所有架构变更转交给 `fabriciq-ontology-authoring-cli`。
- **将原始 base64 部分传递给下游技能/模型**——始终先解码并重塑为基础化 JSON。
- **静默忽略未知的部分路径**——新的预览版本可能会添加新的部分类型；可以记录后继续处理，但应将新的部分名称告知用户。

### 故障排除

| 症状 | 修复方法 |
|---|---|
| `az rest` 返回 `401 Unauthorized` | 执行 `az login`；确认控制平面调用中包含 `--resource "https://api.fabric.microsoft.com"`（委托时也要使用匹配的下游受众——EH 使用 `https://kusto.kusto.windows.net`）。 |
| `getDefinition` 返回 202 且没有正文 | 这是预期行为——遵循 LRO 模式；捕获 `x-ms-operation-id`，并轮询 `operations/{operationId}` 直至状态为 `Succeeded`，然后 GET `…/operations/{operationId}/result`。优先使用 `operations/{operationId}`；如果轮询 `Location`，请使用该 URL 所需的受众（使用 Fabric 受众令牌时，analysis.windows.net 重定向可能会失败）。 |
| 对 `getDefinition` 的调用返回 `403 Forbidden` | 本体要求具有 **Contributor** 或**本体项的 Reader** 权限，同时还需拥有工作区访问权限。请请求分配角色。 |
| `definition.parts[]` 为空 | 该项已创建，但尚未添加任何实体类型。告知用户，并建议先运行 `fabriciq-ontology-authoring-cli`。 |
| 下游 KQL 返回 0 行，但源表中存在数据 | 检查绑定中 `sourceTableName` 的大小写，并确认绑定中的 `clusterUri` / `databaseName` 与实时群集匹配。大小写不匹配会导致静默返回空结果。 |
| `SELECT <propertyName>` 失败并显示 `"invalid column"` | 你传入的是本体属性名称，而不是源列名称。请通过 `propertyBindings[].sourceColumnName` 重新映射。 |
| 关系遍历返回的行数出乎意料地少 | 上下文化的 `sourceTableName`（Lakehouse 链接表）可能为空或已过时；在归咎于本体之前，先通过 `sqldw-consumption-cli` 进行检查。 |
| 绑定与实时 Eventhouse 之间的 `itemId` / `clusterUri` 不匹配 | 支撑的 Eventhouse 已被重新创建；本体需要进行创作更新。请转交给 `fabriciq-ontology-authoring-cli`。 |
| Base64 解码产生二进制乱码 | 部分负载不是 `InlineBase64`；请检查 `payloadType`。如果它是 `VsixPackage` 或未知类型，请跳过并发出警告。 |

---

## 代理式工作流

### 快速响应规范

使用操作是只读的，并且应该让人*感觉*迅速。默认模式是在 shell 中进行**内联组合**，而不是使用 Python 包装器。在考虑使用脚本之前，请先检查以下清单：

| 情况 | 内联（`az rest` / `curl`） | Python / shell 脚本 |
|---|:-:|:-:|
| 单实体查找 | ✅ | ❌ |
| 时间序列窗口读取 | ✅ | ❌ |
| 图遍历，跳数 ≤ 2（参见 [graph-walks.md](references/graph-walks.md)） | ✅ | ❌ |
| 跨数据源关系遍历（LH 键 → KQL 扇出） | ✅ | ❌ |
| Grounding JSON 提取（一次性） | ✅ | ❌ |
| 用户希望重新运行的 LRO `getDefinition` 轮询循环 | ➖ | ✅ |
| 本体创作/变更（35 部分信封、ID 交叉引用） | ❌ | ✅（移交给 `fabriciq-ontology-authoring-cli`） |
| 带重试和检查点的长期播种/批量加载 | ❌ | ✅ |

**内联优先原则**

1. **组合，而不是编写脚本。** 每个 REST 调用都应独立具备意义；使用 `&&` / `|` / `jq` 进行串联，而不是将其包装在 `.py` 中。
2. **并行执行扇出。** 独立读取（关联表查询、按实体类型执行的 IN 列表读取）应通过 `&` 和 `wait` 执行，而不是使用顺序 `for` 循环。
3. **每组只进行一次往返。** 使用 `WHERE id IN (...)`，而不是执行 N×`WHERE id = '...'`。
4. **在会话期间缓存 Grounding JSON**——它不会随查询而改变，重复获取会使每次遍历的延迟翻倍。
5. **尽早流式输出。** 锚点行和第一组邻居一返回就展示；不要等到完整遍历完成后才呈现结果。
6. **除非用户要求，否则不要编写脚本。** 如果用户说“保存下来以后使用”或“每晚重新运行”，*这时*才将其封装为脚本。否则，应将工作保留为可在聊天中重放的 shell 命令。

如果某项任务开始看起来需要超过约 20 次 REST 调用、超过 2 跳，或需要在调用之间保持持久状态，请在编写脚本之前向用户说明这一点——这通常意味着应该缩小问题范围，而不是将其自动化。

### “先 Grounding，再查询”流程

当用户要求通过本体视角查询数据时：

```text
Step 1 → Resolve WS_ID + ONT_ID (list workspaces, list items type=Ontology)
Step 2 → getDefinition (LRO) → decode all parts → reconstruct tree
Step 3 → Build grounding JSON (entities, properties, bindings, relationships)
Step 4 → Disambiguate with the user if multiple entity types / bindings could satisfy the intent
Step 5 → For the chosen entity type + binding:
           a. Remap ontology property names → source column names
           b. Compose the source query (KQL / Spark SQL / T-SQL)
           c. Hand off to the matching sibling consumption skill with minimal fields
Step 6 → Post-process results back into ontology-property naming for the user (optional but helpful)
```

### 感知架构的查询生成

完成 Grounding 后，应使用 `propertyBindings[]` 中记录的物理列生成查询，绝不要使用本体名称：

```text
Entity type "Aircraft" with binding:
  source kind = KustoTable
  sourceTableName = "AircraftReadings"
  timestampColumnName = "PreciseTimestamp"
  propertyBindings: { AltitudeFt → SourceColumn "Temp_C", TailNumber → SourceColumn "AssetId" }

User intent: "show altitude excursions on aircraft N42ZA in the last hour"

Generated KQL (delegated to eventhouse-consumption-cli):
  AircraftReadings
  | where AssetId == "N42ZA"
  | where PreciseTimestamp > ago(1h)
  | project PreciseTimestamp, Temp_C
  | where Temp_C > 80
```

### 关系遍历

```text
Relationship "operates" (Airline → Aircraft)
Contextualization: LakehouseTable "HubAircraftAssignment" with (AirlineId, TailNumber) columns
  AND two entity-type bindings (Airline on LakehouseTable "Airlines", Aircraft on KustoTable "AircraftReadings")

User intent: "which aircraft does Airline 'ZA' operate and what's their latest reading?"

Step 1: sqldw-consumption-cli → SELECT TailNumber FROM HubAircraftAssignment WHERE AirlineId = 'ZA'
Step 2: eventhouse-consumption-cli → AircraftReadings | where AssetId in (<TankIds>) | summarize arg_max(PreciseTimestamp, *) by AssetId
Step 3: Merge results in the agent; present with ontology-level column names.
```

完整的端到端 bash 操作流程（枚举 → 具化 → 路由 → 查询）位于 [examples.md](references/examples.md)。对于“显示与 X 相关的所有内容”这类提示，请直接参阅 [graph-walks.md](references/graph-walks.md) 中的 N 跳遍历。

### 图遍历（从锚点开始的 N 跳遍历）

当用户给出一个实例（“Panel7”“aircraft N42ZA”“customer 1234”）并询问*它的邻域*（而非单个列）时，请使用专门的**图遍历**模式，而不是为每个问题临时设计操作流程。

```text
Anchor → relationships touching anchor (from grounding JSON, in-memory)
       → linking-table reads (parallel, one per relationship)
       → IN-list reads of neighbor entities (one per EntityType)
       → optional KustoTable telemetry sweep (one per EntityType with TS binding)
```

当 hop=1 时，通常需要不超过 10 次往返调用，并可保持内联处理。完整算法、扇出模板、跳数预算以及一个完整的 Panel7 示例位于 [graph-walks.md](references/graph-walks.md)。

---

## 示例

端到端完整示例（枚举本体 → 构建具化 JSON → 将源表查询路由到正确的同级消费技能 → 跨 Lakehouse + Eventhouse 遍历关系）位于 [examples.md](references/examples.md)。从锚点实例开始的 N 跳邻域遍历（Panel7 风格）位于 [graph-walks.md](references/graph-walks.md)。完整的获取和解码脚本位于 [grounding-extraction.md](references/grounding-extraction.md)。各绑定类型的调用模板位于 [routing.md](references/routing.md)。

---

## 智能体集成说明

- 此技能对本体项是**只读的**。所有创作操作（创建、更改、重新绑定、重命名）均属于 **`fabriciq-ontology-authoring-cli`** 的职责，请委派给它。
- 此技能**本身不执行数据查询**。它生成具化上下文和路由决策；实际的源查询在你委派到的各数据源消费技能中运行。
- 支持的下游技能（预览版）：**`eventhouse-consumption-cli`**、**`spark-consumption-cli`**、**`sqldw-consumption-cli`**。目前尚不存在独立的图消费技能——如果用户请求基于关系的图结构查询，请说明这一限制，并回退到通过 Lakehouse / SQL 对每条边执行联接。
- 编排器智能体应向此技能传递**工作区名称 / ID** 和**本体显示名称 / ID**；该技能将返回具化 JSON，编排器可在后续委派调用中复用它，而无需重新获取定义。
- 如果在会话中途发现可能发生了创作活动（例如，用户运行 `fabriciq-ontology-authoring-cli` 后又回来进行查询），请**重新运行具化流程**——缓存的定义已过期。
- 如果用户环境中配置了 **Fabric KQL MCP server**，它可以在 Eventhouse 委派环节替代 `az rest`。仓库默认的 `mcp-setup/mcp-config-template.json` **不会**注册名为 `fabric-kql` 的服务器，因此不要假定该名称存在。无论哪种方式，它都**不**涵盖本体控制平面调用，因此获取 / 具化步骤仍使用 `az rest`。