---
name: pipeline-migration
description: >
  Migrate Synapse Data Factory pipeline artifacts to Microsoft Fabric Data Factory.
  Handles: linked services → Fabric connections, dataset definitions inlined into
  pipeline activities, global parameters → Variable Libraries, SynapseNotebook
  activities → TridentNotebook. SSIS, SHIR-only, and Databricks activities are parked.
  Use when: (1) migrating Synapse pipelines to Fabric Data Factory,
  (2) converting SynapseNotebook activities to TridentNotebook,
  (3) translating linked services to Fabric connections,
  (4) converting global parameters to Fabric Variable Libraries,
  (5) inlining dataset definitions into Fabric pipeline activities.
  Triggers: "synapse pipeline to fabric", "data factory pipeline migration",
  "tridentnotebook pipeline activity", "global parameters to variable library",
  "linked service to fabric connection", "inline dataset fabric pipeline",
  "pipeline migration from synapse".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: pipeline-migration`（`az rest`：`--headers "x-ms-fabric-skill=pipeline-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. Fabric 中不存在“Dataset”项目类型——所有数据集属性都**内联**到活动的 `typeProperties` 中
> 4. 链接服务映射为 Fabric **连接**——在管道活动 JSON 中，活动的 `linkedService` 块上的 `referenceName` 使用 Fabric 连接的**显示名称**（而不是连接 GUID）；连接 GUID 仅用于 Fabric REST API 调用
> 5. Notebook 活动从 `SynapseNotebook` 更改为 `TridentNotebook`，并通过 **GUID** 而不是名称引用 Notebook
> 6. Synapse 全局参数将成为 Fabric 中的**变量库**项目，并以 `@pipeline().libraryVariables.<name>` 的形式引用。变量库的 `Number` 类型无法在管道中使用——为保证运行时兼容性，Synapse 的 `Float`/`Double` 会映射为 `String`
> 7. Fabric 中不存在 `Validation` 活动类型——必须将其改写为 `GetMetadata` + `IfCondition`
> 8. **此 Skill 特意不包含触发器**——迁移后请在 Fabric 中手动重新创建计划
> 9. SSIS 包执行、SHIR 专属连接器和 Databricks 活动均已**暂缓处理**——请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md)

# Synapse Pipelines → Microsoft Fabric Data Factory 迁移

## 前置知识

以下配套文档提供通用 Fabric REST 模式。**不要预先阅读它们**——仅当特定阶段需要本 Skill 资源文件中尚未涵盖的模式时再进行参考：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — 通用 Fabric REST API 模式、身份验证和令牌受众，以及通过 JMESPath 发现项目
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest` / `az login` CLI 模式、身份验证方案，以及管道运行/计划操作
- [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md) — `DataPipeline` 和 `VariableLibrary` 项目定义结构（pipeline-content.json、variables.json）
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — 创建 Fabric Notebook 项目（当 Fabric 中尚不存在 Notebook 项目时需要）

> 对于迁移中的 Notebook 部分（即管道活动调用的 Notebook），请使用配套的 **synapse-migration** Skill 迁移 Notebook 内容本身。

---

## 目录

| 主题 | 参考资料 |
|---|---|
| **迁移前评估**（首先运行） | [pipeline-assessment.md](resources/pipeline-assessment.md) |
| **迁移编排器** | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| API 驱动的迁移工作流 | [§ API 驱动的迁移工作流](#api-driven-migration-workflow) |
| 活动类型映射 | [activity-mapping.md](resources/activity-mapping.md) |
| **Notebook 活动迁移**（主要重点） | [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 链接服务 → 连接 | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 数据集内联 | [dataset-inlining.md](resources/dataset-inlining.md) |
| 全局参数 → 变量库 | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 管道注意事项与暂缓处理的活动 | [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| 验证与测试 | [validation-testing.md](resources/validation-testing.md) |
| 迁移报告 | [migration-report.md](resources/migration-report.md) |

### 上下文加载指南

> **重要 — 仅加载你需要的内容。**不要预先读取所有资源文件。

| 情况 | 读取此文件 |
|---|---|
| 用户要求在迁移**之前**进行评估、确定范围或制定计划 | [pipeline-assessment.md](resources/pipeline-assessment.md) |
| 用户要求迁移完整的管道工作区 | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| 用户询问活动类型映射或不受支持的活动 | [activity-mapping.md](resources/activity-mapping.md) |
| 用户有 SynapseNotebook 活动（最常见） | [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 用户询问链接服务或连接 | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 用户询问使用数据集的 Copy、Lookup 或 GetMetadata | [dataset-inlining.md](resources/dataset-inlining.md) |
| 用户有需要转换的全局参数 | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 用户遇到 SSIS、SHIR、Databricks 或其他阻碍因素 | [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| 迁移后验证 | [validation-testing.md](resources/validation-testing.md) |
| 生成迁移摘要 | [migration-report.md](resources/migration-report.md) |

---

## API 驱动的迁移工作流

### 身份验证

| 目标 | 令牌受众 |
|---|---|
| Synapse 数据平面（管道、数据集、链接服务） | `https://dev.azuresynapse.net` |
| Synapse ARM（全局参数、工作区属性） | `https://management.azure.com` |
| Fabric REST API（创建管道、连接、Variable Library） | `https://api.fabric.microsoft.com` |

> 使用 `az account get-access-token --resource <audience> --query accessToken -o tsv` 获取令牌。

### Synapse 数据平面 API 参考

| 操作 | 端点 |
|---|---|
| 列出所有管道 | `GET https://{ws}.dev.azuresynapse.net/pipelines?api-version=2020-12-01` |
| 获取管道定义 | `GET https://{ws}.dev.azuresynapse.net/pipelines/{name}?api-version=2020-12-01` |
| 列出所有数据集 | `GET https://{ws}.dev.azuresynapse.net/datasets?api-version=2020-12-01` |
| 获取数据集定义 | `GET https://{ws}.dev.azuresynapse.net/datasets/{name}?api-version=2020-12-01` |
| 列出所有链接服务 | `GET https://{ws}.dev.azuresynapse.net/linkedservices?api-version=2020-12-01` |
| 获取链接服务 | `GET https://{ws}.dev.azuresynapse.net/linkedservices/{name}?api-version=2020-12-01` |
| 获取工作区（全局参数） | `GET https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Synapse/workspaces/{ws}?api-version=2021-06-01` |

### Fabric API 参考

| 操作 | 端点 |
|---|---|
| 列出连接 | `GET https://api.fabric.microsoft.com/v1/connections` |
| 创建连接 | `POST https://api.fabric.microsoft.com/v1/connections` |
| 创建管道项 | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items` |
| 更新管道定义 | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items/{id}/updateDefinition` |
| 获取管道定义 | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items/{id}/getDefinition` |
| 创建 Variable Library | `POST https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items`（类型：`VariableLibrary`） |
| 列出工作区中的笔记本 | `GET https://api.fabric.microsoft.com/v1/workspaces/{wsId}/notebooks` |

---

## 评估模式（可选但推荐）

在 Fabric 中创建任何项之前，请先运行**管道评估**，以了解范围、复杂度和阻碍因素。评估是只读操作——它仅查询 Synapse API，并生成 Markdown 报告。

**Copilot 工作流——无需 Python 脚本文件：**
1. 询问用户：*"你的 Synapse 工作区名称是什么？"*
2. 通过 `az account show` 和 `az synapse workspace show` 自动发现订阅 ID 和资源组
3. 直接从终端以内联方式运行评估代码
4. 直接在聊天中输出完整报告

| 使用场景 | 操作 |
|---|---|
| 用户希望在做出迁移决定之前了解迁移范围 | 询问工作区名称 → 加载 [pipeline-assessment.md](resources/pipeline-assessment.md) → 内联运行 |
| 用户询问“哪些内容可以迁移，哪些不能？” | 运行评估，展示“执行摘要”部分 |
| 用户请求迁移计划或范围界定文档 | 运行评估，在聊天中输出报告 |
| 用户已经决定迁移 | 跳过评估——直接进入下方的迁移阶段 |

> 如需同时将报告保存到磁盘，请向 `generate_assessment_report()` 传入 `output_path=f"pipeline-assessment-{SYNAPSE_WS}.md"`。它生成的 `PipelineAssessment` 对象可直接供 [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) 中的迁移脚本使用。

---

## 迁移模式（内联——无需脚本文件）

Copilot 直接从终端执行迁移。无需保存或手动运行任何 Python 文件。

**向用户询问：**
1. Synapse 工作区名称（如果已运行评估，则复用该名称）
2. Fabric 工作区名称
3. 要迁移哪些管道——指定名称，或使用 `*` 表示全部
4. 要追加到 Fabric 中每个管道名称后的可选后缀（例如 `_migrated`）——留空则保留原始名称

**其他所有信息均会自动发现：**
- 通过 `az account show` + `az synapse workspace show` 获取订阅 ID 和资源组
- 通过按显示名称筛选 `GET /v1/workspaces` 获取 Fabric 工作区 ID
- 通过 `GET /v1/workspaces/{wsId}/notebooks` 获取 Fabric 中的 Notebook GUID（`SynapseNotebook → TridentNotebook` 所必需）
- 通过 `GET /v1/connections` 获取 Fabric 中的连接名称（当数据集引用链接服务时）

**可完全自动以内联方式完成的操作：**
- ✅ `SynapseNotebook` → `TridentNotebook`——重命名类型、查找 GUID、移除 `sparkPool`/`sessionConfiguration`，并将超时时间修正为最多 12 小时
- ✅ 所有兼容的活动类型——仅对属性进行少量调整后直接传递
- ✅ 将数据集内联到活动的 `typeProperties` 中
- ✅ 将全局参数表达式重写为 `@pipeline().libraryVariables.<name>`
- ✅ 组装管道 JSON，并通过 REST 部署到 Fabric

**Copilot 会在开始前执行检查——如果出现以下情况，将暂停并报告：**
- `SynapseNotebook` 活动引用的 Notebook 尚不存在于 Fabric 工作区中
- 数据集活动引用的链接服务缺少对应的 Fabric 连接

> 加载 [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) 以获取完整的内联运行程序。

---

## 迁移阶段（按顺序执行）

| 阶段 | 源 | 目标 | 资源 |
|---|---|---|---|
| 阶段 0 | Synapse 笔记本（由管道活动引用） | Fabric 笔记本 | **synapse-migration** 技能 |
| 阶段 1 | Synapse 全局参数 | Fabric 变量库 | [global-parameters-to-variable-library.md](resources/global-parameters-to-variable-library.md) |
| 阶段 2 | Synapse 链接服务 | Fabric 连接 | [linked-service-to-connection.md](resources/linked-service-to-connection.md) |
| 阶段 3 | Synapse 数据集 | 内联到活动中 | [dataset-inlining.md](resources/dataset-inlining.md) |
| 阶段 4 | Synapse 管道活动 | Fabric 管道活动 | [activity-mapping.md](resources/activity-mapping.md) + [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| 阶段 5 | 组装后的管道 JSON | Fabric DataPipeline 项 | [pipeline-orchestrator.md](resources/pipeline-orchestrator.md) |
| 最终阶段 | — | 验证 | [validation-testing.md](resources/validation-testing.md) |

> **阶段 0 必须先于阶段 4**：必须先获得 Fabric 笔记本 GUID，才能编写 TridentNotebook 活动。
> **阶段 2 必须先于阶段 3**：必须先存在连接名称，才能在内联数据集中引用它们。

---

## 活动类型快速参考

完整的映射表、前后对比示例以及暂缓迁移决策均位于 [activity-mapping.md](resources/activity-mapping.md)。

| Synapse 活动 | Fabric 等效活动 | 状态 |
|---|---|---|
| `SynapseNotebook` | `TridentNotebook` | ✅ 已迁移 — 请参阅 [notebook-activity-migration.md](resources/notebook-activity-migration.md) |
| `Copy` | `Copy` | ✅ 已迁移 — 数据集已内联 |
| `Lookup` | `Lookup` | ✅ 已迁移 — 数据集已内联 |
| `GetMetadata` | `GetMetadata` | ✅ 已迁移 — 数据集已内联 |
| `Validation` | `GetMetadata` + `IfCondition` | ✅ 已迁移 — 拆分为 2 个活动 |
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
| `Script` | `Script` | ✅ 兼容 — 更新连接引用 |
| `Delete` | `Delete` | ✅ 已迁移 — 数据集已内联 |
| `Filter` | `Filter` | ✅ 兼容 |
| `SparkJobDefinition`（Synapse SJD） | `SparkJobDefinition` | ✅ 更新 GUID 引用 |
| `HDInsightSpark` | `TridentNotebook` 或 `SparkJobDefinition` | ⚠️ 需要重写 |
| `AzureMLBatchExecution` | `WebActivity` | ⚠️ 重写为 REST 调用 |
| `AzureFunctionActivity` | `WebActivity` | ⚠️ 需要重写 — 使用函数 URL + 密钥 |
| `DatabricksNotebook` | ⛔ 暂缓迁移 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `DatabricksSparkJar` | ⛔ 暂缓迁移 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `DatabricksSparkPython` | ⛔ 暂缓迁移 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `ExecuteSSISPackage` | ⛔ 暂缓迁移 | 请参阅 [pipeline-gotchas.md](resources/pipeline-gotchas.md) |
| `AzureBatch` | ⛔ 暂缓迁移 | Fabric 中无等效项 |
| `Custom` | ⛔ 暂缓迁移 | Fabric 中无等效项 |

---

## 必须 / 推荐 / 避免

### 必须执行
- **先迁移笔记本，再迁移管道** — Fabric TridentNotebook 活动需要使用笔记本 GUID，而不是名称。请先使用 **synapse-migration** 技能
- **先创建 Fabric 连接，再构建管道 JSON** — Synapse 中的链接服务名称在 Fabric 中会变为连接引用；在内联数据集之前，需要先获得连接名称
- **内联所有数据集定义** — Fabric Data Factory 没有 Dataset 项类型；所有 `inputs`/`outputs` 数据集属性都必须嵌入每个活动中
- **将 `@pipeline().globalParameters.<name>` 替换为 `@pipeline().libraryVariables.<name>`** — 请在创建变量库后进行替换
- **将 Validation 活动替换为 `GetMetadata` + `IfCondition` 组合** — Fabric 中不存在 `Validation` 活动类型
- **从迁移后的笔记本活动中移除 `sparkPool` 和 `sessionConfiguration`** — 池选择和会话配置应在附加到笔记本的 Fabric Environment 中设置

### 推荐
- **为开发/测试/生产环境使用带值集的变量库** — 使用具有环境特定值集的 `@pipeline().libraryVariables.<name>`，而不是使用管道级参数来完成环境升级
- **在 TridentNotebook 活动中优先使用参数化的 `notebookParameters`，而不是硬编码值** — 这与 Synapse 参数化笔记本模式一致
- **在运行完整的迁移后管道之前，逐个测试笔记本活动** — 笔记本 GUID 是最常见的故障来源
- **在适用情况下，为 Copy 活动使用 OneLake Lakehouse 源/接收器** — 对于已位于 OneLake 中的数据，这样可以避免使用外部连接

### 避免
- **不要在 `TridentNotebook` 活动中按名称引用笔记本** — 请使用 Fabric 工作区笔记本列表中的 GUID
- **不要迁移 Synapse 触发器** — 此技能不会迁移它们；请在验证管道后在 Fabric 中重新创建计划
- **在阅读 [pipeline-gotchas.md](resources/pipeline-gotchas.md) 之前，不要尝试迁移 SSIS、Databricks 或 AzureBatch 活动** — 这些活动需要人工干预
- **不要在管道 JSON 中硬编码工作区/项 GUID** — 请使用变量库条目或管道参数，以便无需编辑管道 JSON 即可升级环境
- **迁移后不要使用 `@pipeline().globalParameters` 语法** — Fabric 中不存在此表达式路径；所有迁移后的全局参数都必须通过 `@pipeline().libraryVariables` 访问

---

## 迁移注意事项 — 快速参考

完整的故障排除指南位于 [pipeline-gotchas.md](resources/pipeline-gotchas.md)。

| # | 标志 ID | 问题 | 严重性 | 解决方案摘要 |
|---|---|---|---|---|
| PG1 | `NOTEBOOK_GUID_NOT_FOUND` | 构建 TridentNotebook 活动时，笔记本尚未迁移到 Fabric | 高 | 先运行 synapse-migration 技能；从 `GET /v1/workspaces/{wsId}/notebooks` 获取 GUID |
| PG2 | `DATASET_NOT_INLINED` | 活动仍引用命名数据集（在 Fabric 中无效） | 高 | 应用 dataset-inlining.md 中的模式，将数据集属性嵌入活动源/接收器中 |
| PG3 | `GLOBAL_PARAM_EXPRESSION` | 迁移后的管道中仍保留 `@pipeline().globalParameters.<name>` 表达式 | 高 | 创建变量库后，将其替换为 `@pipeline().libraryVariables.<name>` |
| PG4 | `VALIDATION_ACTIVITY_UNSUPPORTED` | 管道 JSON 中仍保留 `Validation` 活动类型 | 高 | 将其重写为 `GetMetadata` + `IfCondition` — 请参阅 activity-mapping.md |
| PG5 | `SHIR_CONNECTOR_PARKED` | 活动使用由自承载集成运行时支持的链接服务 | 中 | 必须在 Fabric 中设置本地数据网关；请参阅 pipeline-gotchas.md |
| PG6 | `SSIS_ACTIVITY_PARKED` | 无法迁移 `ExecuteSSISPackage` 活动 | 高 | 暂缓处理 — Fabric 中没有等效项；替代方案请参阅 pipeline-gotchas.md |
| PG7 | `DATABRICKS_ACTIVITY_PARKED` | Databricks 活动类型没有 Fabric 原生等效项 | 高 | 暂缓处理 — 可通过 WebActivity 调用 Databricks REST API 作为变通方案；请参阅 pipeline-gotchas.md |
| PG8 | `SPARKPOOL_REF_ORPHANED` | TridentNotebook 活动中仍保留 `sparkPool` / `targetBigDataPool` 引用 | 中 | 移除 `sparkPool` 和 `sessionConfiguration` 块；池配置应在 Fabric Environment 中设置 |
| PG9 | `EXECUTE_PIPELINE_NO_WORKSPACE` | `ExecutePipeline` 活动缺少所引用管道的 `workspaceId` | 中 | 将 `workspaceId` 添加到 `typeProperties`；即使子管道位于同一工作区，也必须提供该字段 — 省略它会导致运行时失败 |
| PG10 | `LINKED_SERVICE_NO_CONNECTION` | 链接服务没有匹配的 Fabric 连接 | 高 | 手动或通过 API 创建连接；更新内联数据集中的连接引用 |

---

## 迁移后：下一步

管道迁移完成后，请转交给以下配套技能和工具继续处理：

| 任务 | 技能 / 工具 |
|---|---|
| 迁移笔记本内容（mssparkutils → notebookutils、链接服务） | **synapse-migration** 技能 |
| 调度已迁移的管道 | [COMMON-CLI.md § 作业调度](../../common/COMMON-CLI.md) |
| 监视管道运行 | Fabric 工作区 → Monitor 中心 |
| 构建新的 Fabric 管道 | 请参阅 [ITEM-DEFINITIONS-CORE.md § DataPipeline](../../common/ITEM-DEFINITIONS-CORE.md) |
| 在管道运行后探索已迁移的 Lakehouse 数据 | `spark-cli` 或 `sqldw-cli` 技能 |

---

## 示例

**SynapseNotebook → TridentNotebook 活动（迁移前/后）**

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

**数据集内联：复制活动 — 数据集引用 → 连接显示名称**

Synapse 数据集 `InputBlobDataset`（将被内联并移除）：
```json
{
  "type": "AzureBlob",
  "linkedServiceName": {"referenceName": "AzureBlobLinkedService"},
  "typeProperties": {"folderPath": "input/", "fileName": "data.csv"}
}
```

Synapse 复制活动（迁移前 — 按名称引用数据集）：
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