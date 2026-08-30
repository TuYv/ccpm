---
name: pipeline-migration
description: "Migrates Synapse Data Factory pipelines to Fabric Data Factory, turning linked services into Fabric connections, inlining datasets into activities, converting global parameters to Variable Libraries, and mapping SynapseNotebook to TridentNotebook. Use for pipeline JSON. For Synapse Spark notebook code use synapse-migration."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: pipeline-migration`（`az rest`：`--headers "x-ms-fabric-skill=pipeline-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头 — 但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 过滤
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 过滤
> 3. Fabric 没有“Dataset”项目类型 — 所有数据集属性都**内联**到活动的 `typeProperties` 中
> 4. 链接服务映射到 Fabric **连接** — 在管道活动 JSON 中，活动的 `linkedService` 块上的 `referenceName` 使用 Fabric 连接的**显示名称**（而不是连接 GUID）；连接 GUID 仅用于 Fabric REST API 调用
> 5. Notebook 活动从 `SynapseNotebook` 变为 `TridentNotebook`，并通过 **GUID** 而不是名称引用 Notebook
> 6. Synapse 全局参数在 Fabric 中变为 **Variable Library** 项目，引用方式为 `@pipeline().libraryVariables.<name>`。Variable Library 的 `Number` 类型无法在管道中使用 — 为了确保运行时兼容性，Synapse 的 `Float`/`Double` 会映射为 `String`
> 7. Fabric 中不存在 `Validation` 活动类型 — 必须将其重写为 `GetMetadata` + `IfCondition`
> 8. **触发器有意不包含在此 skill 中** — 迁移后请在 Fabric 中手动重新创建计划
> 9. SSIS 包执行、仅 SHIR 支持的连接器以及 Databricks 活动均处于**搁置状态** — 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md)

# Synapse Pipelines → Microsoft Fabric Data Factory 迁移

## 前置知识

这些配套文档提供了一般的 Fabric REST 模式。**不要预先阅读它们** — 仅当某个特定阶段需要的模式未在此 skill 的资源文件中涵盖时，才参考相应文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — 一般 Fabric REST API 模式、身份验证和令牌受众、使用 JMESPath 发现项目
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest` / `az login` CLI 模式、身份验证配方、管道运行/计划操作
- [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md) — `DataPipeline` 和 `VariableLibrary` 项目定义结构（pipeline-content.json、variables.json）
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Fabric Notebook 项目创建（当 Fabric 中尚不存在 Notebook 项目时需要）

> 对于迁移中 Notebook 这一侧（即管道活动调用的 Notebook），请使用配套的 **synapse-migration** skill 来迁移 Notebook 内容本身。

---

## 目录

| 主题 | 参考 |
|---|---|
| **迁移前评估**（首先运行） | [pipeline-assessment.md](resources/pipeline-assessment.md) |
| **迁移编排器** | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| API 驱动的迁移工作流 | [§ API 驱动的迁移工作流](#api-driven-migration-workflow) |
| 活动类型映射 | [activity-mapping.md](resources/activity-mapping.md) |
| **Notebook 活动迁移**（主要重点） | [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 链接服务 → 连接 | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 数据集内联 | [dataset-inlining.md](resources/dataset-inlining.md) |
| 全局参数 → Variable Library | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 管道陷阱与搁置的活动 | [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| 验证与测试 | [validation-testing.md](resources/validation-testing.md) |
| 迁移报告 | [migration-report.md](resources/migration-report.md) |

### 上下文加载指南

> **重要——只加载你需要的内容。** 不要预先读取所有资源文件。

| 时机 | 读取此文件 |
|---|---|
| 用户在迁移前请求评估、范围或计划 | [pipeline-assessment.md](resources/pipeline-assessment.md) |
| 用户请求迁移完整的 pipeline 工作区 | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| 用户询问 activity 类型映射或不支持的 activity | [activity-mapping.md](resources/activity-mapping.md) |
| 用户有 SynapseNotebook activities（最常见） | [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 用户询问 linked services 或 connections | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 用户询问使用 datasets 的 Copy、Lookup 或 GetMetadata | [dataset-inlining.md](resources/dataset-inlining.md) |
| 用户有需要转换的全局参数 | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 用户遇到 SSIS、SHIR、Databricks 或其他阻碍 | [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| 迁移后的验证 | [validation-testing.md](resources/validation-testing.md) |
| 生成迁移摘要 | [migration-report.md](resources/migration-report.md) |

---

## API 驱动的迁移工作流

### 身份验证

| 目标 | Token 受众 |
|---|---|
| Synapse Data Plane（pipelines、datasets、linked services） | `https://dev.azuresynapse.net` |
| Synapse ARM（global parameters、workspace properties） | `https://management.azure.com` |
| Fabric REST API（创建 pipelines、connections、Variable Libraries） | `https://api.fabric.microsoft.com` |

> 使用 `az account get-access-token --resource <audience> --query accessToken -o tsv` 获取令牌。

### Synapse Data-Plane API 参考

| 操作 | Endpoint |
|---|---|
| 列出所有 pipelines | `GET https://{ws}.dev.azuresynapse.net/pipelines?api-version=2020-12-01` |
| 获取 pipeline 定义 | `GET https://{ws}.dev.azuresynapse.net/pipelines/{name}?api-version=2020-12-01` |
| 列出所有 datasets | `GET https://{ws}.dev.azuresynapse.net/datasets?api-version=2020-12-01` |
| 获取 dataset 定义 | `GET https://{ws}.dev.azuresynapse.net/datasets/{name}?api-version=2020-12-01` |
| 列出所有 linked services | `GET https://{ws}.dev.azuresynapse.net/linkedservices?api-version=2020-12-01` |
| 获取 linked service | `GET https://{ws}.dev.azuresynapse.net/linkedservices/{name}?api-version=2020-12-01` |
| 获取 workspace（全局参数） | `GET https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Synapse/workspaces/{ws}?api-version=2021-06-01` |

### Fabric API 参考

| 操作 | Endpoint |
|---|---|
| 列出 connections | `GET https://api.fabric.microsoft.com/v1/connections` |
| 创建 connection | `POST https://api.fabric.microsoft.com/v1/connections` |
| 创建 pipeline item | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items` |
| 更新 pipeline 定义 | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items/{id}/updateDefinition` |
| 获取 pipeline 定义 | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items/{id}/getDefinition` |
| 创建 Variable Library | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items` (type: `VariableLibrary`) |
| 列出工作区中的 notebooks | `GET https://api.fabric.microsoft.com/v1/workspaces/{wsId}/notebooks` |

---

## 评估模式（可选但推荐）

在 Fabric 中创建任何项目之前，先运行**管道评估**，以了解范围、复杂性和阻碍因素。评估是只读的——它只查询 Synapse API，并生成一份 markdown 报告。

**Copilot 工作流 — 无需 Python 脚本文件：**
1. 询问用户：*"您的 Synapse 工作区名称是什么？"*
2. 通过 `az account show` 和 `az synapse workspace show` 自动发现订阅 ID 和资源组
3. 在终端中以内联方式运行评估代码
4. 直接在聊天中打印完整的报告输出

| 使用时机 | 操作 |
|---|---|
| 用户希望在做出迁移承诺之前了解迁移范围 | 询问工作区名称 → 加载 [管道评估](resources/pipeline-assessment.md) → 内联运行 |
| 用户询问“哪些内容会迁移，哪些不会迁移？” | 运行评估，并呈现执行摘要部分 |
| 用户请求迁移计划或范围界定文档 | 运行评估，并在聊天中打印报告 |
| 用户已经决定迁移 | 跳过评估 — 直接进入下方的迁移阶段 |

> 如需同时将报告保存到磁盘，请将 `output_path=f"pipeline-assessment-{SYNAPSE_WS}.md"` 传递给 `generate_assessment_report()`。它生成的 `PipelineAssessment` 对象可直接供 [管道编排器](resources/pipeline-orchestrator.md) 中的迁移脚本使用。

---

## 迁移模式（内联 — 无需脚本文件）

Copilot 直接从终端执行迁移。无需保存或手动运行 Python 文件。

**向用户询问：**
1. Synapse 工作区名称（如果已运行评估，则复用该名称）
2. Fabric 工作区名称
3. 要迁移的管道 — 指定名称，或使用 `*` 表示全部
4. 可选的名称后缀，用于追加到 Fabric 中的每个管道名称后（例如 `_migrated`）— 留空则保留原名称

**其余信息均自动发现：**
- 通过 `az account show` + `az synapse workspace show` 获取订阅 ID 和资源组
- 通过按显示名称筛选 `GET /v1/workspaces` 获取 Fabric 工作区 ID
- 通过 `GET /v1/workspaces/{wsId}/notebooks` 获取 Fabric 中的笔记本 GUID（`SynapseNotebook → TridentNotebook` 所必需）
- 通过 `GET /v1/connections` 获取 Fabric 中的连接名称（当数据集引用链接服务时）

**可通过内联方式完全自动化的内容：**
- ✅ `SynapseNotebook` → `TridentNotebook` — 重命名类型、查找 GUID、移除 `sparkPool`/`sessionConfiguration`、将超时修正为最长 12 小时
- ✅ 所有兼容的活动类型 — 直接传递，仅进行少量属性调整
- ✅ 将数据集内联到活动的 `typeProperties` 中
- ✅ 将全局参数表达式重写为 `@pipeline().libraryVariables.<name>`
- ✅ 组装管道 JSON 并通过 REST 部署到 Fabric

**Copilot 在开始前会检查以下内容 — 如果发现问题，将暂停并报告：**
- `SynapseNotebook` 活动引用的笔记本尚不存在于 Fabric 工作区中
- 引用链接服务的数据集活动缺少 Fabric 连接

> 加载 [管道编排器](resources/pipeline-orchestrator.md) 以获取完整的内联运行器。

---

## 迁移阶段（按顺序执行）

| 阶段 | 源 | 目标 | 资源 |
|---|---|---|---|
| 阶段 0 | Synapse notebooks（由 pipeline activities 引用） | Fabric Notebooks | **synapse-migration** skill |
| 阶段 1 | Synapse global parameters | Fabric Variable Library | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 阶段 2 | Synapse linked services | Fabric Connections | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 阶段 3 | Synapse datasets | 内联到 activities 中 | [dataset-inlining.md](resources/dataset-inlining.md) |
| 阶段 4 | Synapse pipeline activities | Fabric pipeline activities | [activity-mapping.md](resources/activity-mapping.md) + [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 阶段 5 | 已组装的 pipeline JSON | Fabric DataPipeline item | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| 最终阶段 | — | 验证 | [validation-testing.md](resources/validation-testing.md) |

> **阶段 0 必须先于阶段 4 执行**：在编写 TridentNotebook activities 之前，需要先获取 Fabric Notebook GUID。
> **阶段 2 必须先于阶段 3 执行**：只有先存在 Connection 名称，才能在内联的 datasets 中引用它们。

---

## Activity 类型快速参考

完整的映射表、迁移前后示例以及搁置决策请参阅 [activity-mapping.md](resources/activity-mapping.md)。

| Synapse Activity | Fabric 等效项 | 状态 |
|---|---|---|
| `SynapseNotebook` | `TridentNotebook` | ✅ 已迁移 — 请参阅 [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| `Copy` | `Copy` | ✅ 已迁移 — datasets 已内联 |
| `Lookup` | `Lookup` | ✅ 已迁移 — datasets 已内联 |
| `GetMetadata` | `GetMetadata` | ✅ 已迁移 — datasets 已内联 |
| `Validation` | `GetMetadata` + `IfCondition` | ✅ 已迁移 — 拆分为 2 个 activities |
| `ForEach` | `ForEach` | ✅ 兼容 |
| `IfCondition` | `IfCondition` | ✅ 兼容 |
| `Switch` | `Switch` | ✅ 兼容 |
| `Until` | `Until` | ✅ 兼容 |
| `Wait` | `Wait` | ✅ 兼容 |
| `Fail` | `Fail` | ✅ 兼容 |
| `SetVariable` | `SetVariable` | ✅ 兼容 |
| `AppendVariable` | `AppendVariable` | ✅ 兼容 |
| `ExecutePipeline` | `ExecutePipeline` | ✅ 兼容 — 添加 `workspaceId` |
| `WebActivity` | `WebActivity` | ✅ 兼容 |
| `Script` | `Script` | ✅ 兼容 — 更新 connection 引用 |
| `Delete` | `Delete` | ✅ 已迁移 — datasets 已内联 |
| `Filter` | `Filter` | ✅ 兼容 |
| `SparkJobDefinition`（Synapse SJD） | `SparkJobDefinition` | ✅ 更新 GUID 引用 |
| `HDInsightSpark` | `TridentNotebook` 或 `SparkJobDefinition` | ⚠️ 需要重写 |
| `AzureMLBatchExecution` | `WebActivity` | ⚠️ 重写为 REST 调用 |
| `AzureFunctionActivity` | `WebActivity` | ⚠️ 需要重写 — 使用 function URL + key |
| `DatabricksNotebook` | ⛔ 已搁置 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `DatabricksSparkJar` | ⛔ 已搁置 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `DatabricksSparkPython` | ⛔ 已搁置 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `ExecuteSSISPackage` | ⛔ 已搁置 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `AzureBatch` | ⛔ 已搁置 | 没有 Fabric 等效项 |
| `Custom` | ⛔ 已搁置 | 没有 Fabric 等效项 |

---

## 必须 / 优先 / 避免

### 必须执行
- **先迁移 notebooks，再迁移 pipelines** — Fabric TridentNotebook activities 需要 notebook GUID，而不是名称。请先使用 **synapse-migration** skill
- **在构建 pipeline JSON 之前创建 Fabric Connections** — Synapse 中的 linked service 名称会成为 Fabric 中的 connection references；在内联 datasets 之前需要先获取 connection 名称
- **内联所有 dataset 定义** — Fabric Data Factory 没有 Dataset item type；所有 `inputs`/`outputs` dataset properties 都必须嵌入每个 activity 中
- **创建 Variable Library 后，将 `@pipeline().globalParameters.<name>` 替换为 `@pipeline().libraryVariables.<name>`**
- **将 Validation activities 替换为 `GetMetadata` + `IfCondition` 组合** — `Validation` 在 Fabric 中不是有效的 activity type
- **从迁移后的 notebook activities 中移除 `sparkPool` 和 `sessionConfiguration`** — pool 选择和 session 配置属于附加到 notebook 的 Fabric Environment

### 优先执行
- 对于 dev/test/prod 环境，**优先使用带有 Value Sets 的 Variable Library** — 使用 `@pipeline().libraryVariables.<name>` 和特定于环境的 Value Sets，而不是 pipeline-level parameters，以实现环境提升
- 在 TridentNotebook activities 中，**优先使用参数化的 `notebookParameters`**，而不是硬编码值 — 这与 Synapse 参数化 notebook 模式保持一致
- **在运行完整的迁移后 pipeline 之前，逐个测试 notebook activities** — notebook GUID 是最常见的失败来源
- 在适用情况下，Copy activities **优先使用 OneLake Lakehouse sources/sinks** — 对于已位于 OneLake 中的数据，这样无需外部 connections

### 避免
- **不要在 `TridentNotebook` activities 中通过名称引用 notebooks** — 使用 Fabric workspace notebook list 中的 GUID
- **不要迁移 Synapse triggers** — 此 skill 不会迁移它们；验证 pipeline 后，在 Fabric 中重新创建 schedules
- **在阅读 [pipeline-gotchas.md](resources/pipeline-gotchas.md) 之前，不要尝试迁移 SSIS、Databricks 或 AzureBatch activities** — 这些需要手动干预
- **不要在 pipeline JSON 中硬编码 workspace/item GUIDs** — 使用 Variable Library entries 或 pipeline parameters，这样无需编辑 pipeline JSON 即可提升环境
- **迁移后不要使用 `@pipeline().globalParameters`** 语法 — 此 expression path 在 Fabric 中不存在；所有迁移后的 global parameters 都必须通过 `@pipeline().libraryVariables` 访问

---

## 迁移陷阱 — 快速参考

完整的故障排查指南位于 [pipeline-gotchas.md](resources/pipeline-gotchas.md)。

| # | Flag ID | 问题 | 严重性 | 解决方案摘要 |
|---|---|---|---|---|
| PG1 | `NOTEBOOK_GUID_NOT_FOUND` | 构建 TridentNotebook activity 时，notebook 尚未迁移到 Fabric | 高 | 先运行 synapse-migration skill；从 `GET /v1/workspaces/{wsId}/notebooks` 获取 GUID |
| PG2 | `DATASET_NOT_INLINED` | Activity 仍引用命名 dataset（在 Fabric 中无效） | 高 | 应用 dataset-inlining.md 中的模式，将 dataset properties 嵌入 activity source/sink |
| PG3 | `GLOBAL_PARAM_EXPRESSION` | 迁移后的 pipeline 中仍保留 `@pipeline().globalParameters.<name>` expression | 高 | 创建 Variable Library 后，替换为 `@pipeline().libraryVariables.<name>` |
| PG4 | `VALIDATION_ACTIVITY_UNSUPPORTED` | pipeline JSON 中仍保留 `Validation` activity type | 高 | 重写为 `GetMetadata` + `IfCondition` — 参见 activity-mapping.md |
| PG5 | `SHIR_CONNECTOR_PARKED` | Activity 使用由 Self-Hosted Integration Runtime 支持的 linked service | 中 | 必须在 Fabric 中设置 on-premises data gateway；参见 pipeline-gotchas.md |
| PG6 | `SSIS_ACTIVITY_PARKED` | `ExecuteSSISPackage` activity 无法迁移 | 高 | 暂不处理 — 没有 Fabric 等效项；替代方案参见 pipeline-gotchas.md |
| PG7 | `DATABRICKS_ACTIVITY_PARKED` | Databricks activity type 没有 Fabric 原生等效项 | 高 | 暂不处理 — 使用 Databricks REST API 搭配 WebActivity 作为变通方案；参见 pipeline-gotchas.md |
| PG8 | `SPARKPOOL_REF_ORPHANED` | TridentNotebook activity 中仍保留 `sparkPool` / `targetBigDataPool` 引用 | 中 | 移除 `sparkPool` 和 `sessionConfiguration` blocks；pool 配置属于 Fabric Environment |
| PG9 | `EXECUTE_PIPELINE_NO_WORKSPACE` | 引用的 pipeline 的 `ExecutePipeline` activity 缺少 `workspaceId` | 中 | 将 `workspaceId` 添加到 `typeProperties`；即使是同一 workspace 中的 child pipelines 也必须提供 — 省略会导致运行时失败 |
| PG10 | `LINKED_SERVICE_NO_CONNECTION` | Linked service 没有匹配的 Fabric Connection | 高 | 手动或通过 API 创建 connection；更新内联 dataset 中的 connection reference |

---

## 迁移后：接下来做什么

管道迁移完成后，交由以下配套 skill 和工具处理：

| 任务 | Skill / Tool |
|---|---|
| 迁移 notebook 内容（mssparkutils → notebookutils、链接服务） | **synapse-migration** skill |
| 为已迁移的管道设置计划 | [COMMON-CLI.md § 作业计划](../../common/COMMON-CLI.md) |
| 监视管道运行 | Fabric 工作区 → Monitor hub |
| 构建新的 Fabric 管道 | 参考 [ITEM-DEFINITIONS-CORE.md § DataPipeline](../../common/ITEM-DEFINITIONS-CORE.md) |
| 在管道运行后浏览已迁移的 Lakehouse 数据 | `spark-cli` 或 `sqldw-cli` skill |

---

## 示例

**SynapseNotebook → TridentNotebook activity（迁移前/后）**

```json
{
  "name": "Run_Notebook",
  "type": "SynapseNotebook",
  "typeProperties": {
    "notebook": {"referenceName": "MyNotebook", "type": "NotebookReference"},
    "sparkPool": {"referenceName": "BigPool", "type": "BigDataPoolReference"}
  }
}
```

迁移后（GUID 来自 `GET /v1/workspaces/{wsId}/notebooks`）：

```json
{
  "name": "Run_Notebook",
  "type": "TridentNotebook",
  "typeProperties": {
    "notebookId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "workspaceId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
  }
}
```

**全局参数表达式重写**

```text
Before (Synapse):  @pipeline().globalParameters.batchDate
After (Fabric):    @pipeline().libraryVariables.batchDate
```

**内联数据集：Copy activity — 数据集引用 → 连接显示名称**

Synapse 数据集 `InputBlobDataset`（将被内联并移除）：
```json
{
  "type": "AzureBlob",
  "linkedServiceName": {"referenceName": "AzureBlobLinkedService"},
  "typeProperties": {"folderPath": "input/", "fileName": "data.csv"}
}
```

Synapse Copy activity（迁移前 — 按名称引用数据集）：
```json
{
  "name": "CopyData", "type": "Copy",
  "inputs": [{"referenceName": "InputBlobDataset", "type": "DatasetReference"}],
  "typeProperties": {"source": {"type": "BlobSource"}, "sink": {"type": "BlobSink"}}
}
```

迁移后（`AzureBlobLinkedService` 的连接显示名称为 `My ADLS Connection`）：
```json
{
  "name": "CopyData", "type": "Copy",
  "typeProperties": {
    "source": {"type": "BlobSource", "storeSettings": {"type": "AzureBlobStorageReadSettings"}},
    "sink":   {"type": "BlobSink",   "storeSettings": {"type": "AzureBlobStorageWriteSettings"}}
  },
  "linkedService": {"referenceName": "My ADLS Connection", "type": "LinkedServiceReference"}
}
```

有关完整的迁移前/后示例，请参阅 [activity-mapping.md](resources/activity-mapping.md) 和 [notebook-activity-migration.md](resources/notebook-activity-migration.md)。