---
name: mlv-operations-cli
description: >
  Manage refresh schedules, selected-lineage execution definitions, and job execution for existing
  Microsoft Fabric Materialized Lake Views (MLVs) via REST APIs. Configure, update, and delete
  schedules and execution definitions; trigger on-demand refreshes; monitor job status; and cancel
  running jobs. Use `spark-authoring-cli` to author MLV definitions. Discovery, visual lineage,
  and data quality metrics require the Lakehouse UI.
  Triggers: "schedule MLV refresh", "manage MLV refresh schedule", "trigger MLV refresh",
  "MLV job status", "cancel MLV refresh", "monitor MLV refresh",
  "recurring MLV refresh", "daily MLV refresh".
---
> **遥测——强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: mlv-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=mlv-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中虽未包含，但仍须添加。

> **更新检查——每个会话一次（强制要求）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话早些时候已经执行过该检查，则跳过。

> **关键说明**
> 1. 要通过工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要通过工作区 ID 和 Lakehouse 名称查找 Lakehouse 详细信息（包括其 ID）：列出该工作区中的所有 Lakehouse，然后使用 JMESPath 进行筛选
> 3. **MLV 发现能力缺口**：目前没有可列出 Lakehouse 中 MLV 的公共 REST API。对于计划的 CRUD、触发和状态操作，只需要工作区 ID 和 Lakehouse ID。要刷新部分沿袭关系，请先创建或复用一个 MLV 执行定义，并在 `executionData` 中传入其 `mlvExecutionDefinitionId`。

# MLV 操作——CLI 技能

## 术语映射

Fabric 中有**三种**物化视图概念。请根据上下文加以区分：

| 用户上下文 | 用户表述 | 实际含义 | 转至 |
|-------------|-----------|----------------|----------|
| Spark / Lakehouse | “materialized view” | **物化湖视图（MLV）** | 此技能（`mlv-operations-cli`） |
| Spark / Lakehouse | “materialized lake view” | MLV | 此技能 |
| Spark / Lakehouse | “spark materialized view” | MLV | 此技能 |
| Spark / Lakehouse | “MV”或“MLV” | MLV | 此技能 |
| Spark / Lakehouse | “CREATE MATERIALIZED LAKE VIEW” | MLV DDL（创作） | `spark-authoring-cli` |
| Spark / Lakehouse | “schedule my materialized view” | MLV 计划 | 此技能 |
| Spark / Lakehouse | “refresh my views” | MLV 按需刷新 | 此技能 |
| **KQL / Eventhouse** | “materialized view” | **KQL 物化视图** | `eventhouse-cli` |
| **SQL DW / Warehouse** | “materialized view” | **Fabric 不支持** | 说明其不受支持 |

**消歧规则**：如果用户提到 Lakehouse、Notebook、Spark、Delta 或 MLV → 指的是**物化湖视图**（使用此技能）。如果用户提到 KQL、Eventhouse 或 Kusto → 指的是 KQL 物化视图（使用其他技能）。如果用户提到 Warehouse 或 SQL DW → 说明其不受支持。

**默认规则**：如果上下文不明确（未提及 Lakehouse、Spark、KQL 或 Warehouse），请先询问用户：“你使用的是 Lakehouse（物化湖视图）还是 Eventhouse（KQL 物化视图）？”，然后再继续。

使用 Fabric REST API 管理 MLV 刷新计划、执行定义和监控。此技能为计划、子集刷新配置和监控操作提供**公共 API 支持（预览版）**，从而实现 MLV 刷新工作流的自动化。

## 此技能可以做什么

### ✅ 完全支持（14 个 REST API）

1. **计划管理**（按湖仓管理——默认刷新整个 MLV 沿袭关系）
   - 创建刷新计划（Cron 间隔、每日、每周、每月）
   - 列出湖仓的计划
   - 按 ID 获取计划详细信息
   - 更新现有计划（更改频率、启用状态）
   - 删除计划
   - 附加 `executionData.mlvExecutionDefinitionId`，以刷新沿袭关系的一个子集

2. **作业执行**
   - 触发按需刷新（立即执行）
   - 列出作业运行历史记录并进行筛选
   - 获取作业状态和进度
   - 取消正在运行的作业
   - 附加 `executionData.mlvExecutionDefinitionId`，以按需刷新沿袭关系的一个子集

3. **MLV 执行定义**
   - 为选定的 MLV、选定的上游湖仓、刷新模式和 Spark 环境创建可复用的执行定义
   - 列出执行定义
   - 获取执行定义详细信息
   - 修补执行定义（部分更新；省略的字段会保留现有值）
   - 删除执行定义；关联的计划会由 API 移除

4. **安全性与用户体验**
   - 创建计划或触发刷新前进行人工确认
   - 为复杂的多 MLV 操作制定分步计划
   - 通过实用建议进行迭代式错误处理
   - 执行前预览计划的影响

### ❌ 不支持（需要使用 UI——没有 REST API）

- **MLV 发现**：无法列出湖仓中的 MLV（API 返回 404）
- **可视化沿袭关系检查**：无法直接获取门户中的依赖关系图
- **数据质量指标**：无法检索 DQ 指标（API 返回 404）
- **架构验证**：无法检查是否已启用架构（缺少相应属性）

**解决方法**：用户显式提供湖仓 ID 和 MLV 表名称。使用 Fabric Lakehouse UI 执行发现任务，然后将选定的 MLV 名称和选定的上游湖仓编码到 MLV 执行定义中。

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 规则——请先阅读并始终遵循 | [SKILL.md § Must](#must) | **必须阅读**——此技能的 6 条规则 |
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § Finding Workspaces and Items in Fabric](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必读**——*请先阅读链接* [用于按名称查找工作区 ID，或按名称、项目类型和工作区 ID 查找项目 ID] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric Topology & Key Concepts](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § Environment URLs](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证与令牌获取 | [COMMON-CORE.md § Authentication & Token Acquisition](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 作业计划 | [COMMON-CLI.md § Job Scheduling](../../common/COMMON-CLI.md#job-scheduling) | URL 为 `/jobs/{jobType}/schedules`；必须提供 `endDateTime` |
| 作业执行 | [COMMON-CLI.md § Job Execution](../../common/COMMON-CLI.md#job-execution) ||
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § Fabric Control-Plane API via az rest](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`**，否则 `az rest` 会失败 |
| 分页模式 | [COMMON-CLI.md § Pagination Pattern](../../common/COMMON-CLI.md#pagination-pattern) ||
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § Gotchas & Troubleshooting (CLI-Specific)](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |
| 快速参考：`az rest` 模板 | [COMMON-CLI.md § Quick Reference: az rest Template](../../common/COMMON-CLI.md#quick-reference-az-rest-template) ||
| MLV 公共 API 参考资料 | [MS Learn：使用公共 API 管理 Fabric 物化湖视图](https://learn.microsoft.com/en-us/fabric/data-engineering/materialized-lake-views/materialized-lake-views-public-api) | 关于计划、按需刷新、作业实例和 MLV 执行定义的官方文档 |

> **评估模式**：当用户提示中包含“I pre-approve”或“proceed without confirmation”时，
> 跳过人在回路确认环节并直接执行。这支持自动化测试。

## 必须

### 1. 人在回路确认

**执行任何操作之前，先显示预览并请求确认：**

- **创建计划**：显示计划类型、间隔/时间、湖仓 ID、开始/结束时间，以及完整血缘或执行定义范围
- **创建执行定义**：显示选定的 MLV、选定的上游湖仓、刷新模式和 Spark 环境
- **触发刷新**：显示湖仓 ID，以及此次刷新针对完整血缘还是指定的执行定义子集
- **删除计划**：显示计划 ID 并确认删除
- **删除执行定义**：显示定义 ID，并警告关联的计划也会被移除

**确认选项**：
- `Allow` — 执行此次单项操作
- `Decline` — 跳过此次操作
- `Allow in this thread` — 自动允许当前对话中的所有操作

**示例**：
```
I'm about to create a refresh schedule:

  Lakehouse ID: abc-123-def
  Type: Daily
  Time: 02:00 UTC
  Start: 2026-06-20
  End: 2027-06-20
  Scope: Full MLV lineage (default)

Proceed? [Allow / Decline / Allow in this thread]
```

### 2. 严格按照文档使用 REST API

**基础 URL**：`https://api.fabric.microsoft.com/v1`

**重要**：计划、按需触发、执行定义和历史记录列表端点的作用域均为**工作区 + 湖仓**。按需触发会返回一个**项目作用域**的 `Location` URL，用于状态轮询和取消。默认情况下，计划或按需运行会刷新**整个 MLV 血缘**。若要刷新选定的 MLV 或选定的上游湖仓，请创建 MLV 执行定义，并在 `executionData` 中传入其 `mlvExecutionDefinitionId`。

**计划端点：**
- `POST   /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules` — 创建计划
- `GET    /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules` — 列出计划
- `GET    /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules/{id}` — 获取计划
- `PATCH  /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules/{id}` — 更新计划
- `DELETE /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules/{id}` — 删除计划

**作业实例端点：**
- `POST   /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/instances` — 触发按需刷新（可选 `executionData`；返回 202 + 包含作业 ID 的 Location 标头）
- `GET    /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/instances` — 列出作业历史记录
- `GET    /workspaces/{workspaceId}/items/{lakehouseId}/jobs/instances/{jobInstanceId}` — 从触发操作返回的 `Location` 获取作业状态
- `POST   /workspaces/{workspaceId}/items/{lakehouseId}/jobs/instances/{jobInstanceId}/cancel` — 取消正在运行的作业

**MLV 执行定义端点：**
- `POST   /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions` — 创建选定血缘的执行定义
- `GET    /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions` — 列出执行定义
- `GET    /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions/{mlvExecutionDefinitionId}` — 获取执行定义
- `PATCH  /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions/{mlvExecutionDefinitionId}` — 部分更新执行定义
- `DELETE /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions/{mlvExecutionDefinitionId}` — 删除执行定义及所有关联的计划

**作业类型不匹配陷阱**：作业历史记录可能会将已计划的 MLV 运行显示为 `jobType: "MaterializedLakeViews"`，但公共作业计划程序路径使用 `refreshMaterializedLakeViews`。**不要**将历史记录中的值复制到 `POST /workspaces/{workspaceId}/items/{lakehouseId}/jobs/instances?jobType=MaterializedLakeViews` 中；该项级调用会返回 `InvalidJobType`。

**另请参阅**：[MS Learn：MLV 后台作业](https://learn.microsoft.com/en-us/rest/api/fabric/lakehouse/background-jobs/create-refresh-materialized-lake-views-schedule)

### 3. 身份验证

所有计划操作（创建/更新/删除、触发、状态查询、取消）均支持**用户身份**（`az login`）和**服务主体/托管标识**。需要具有**工作区参与者或管理员角色**。

### 4. Lakehouse 计划限制和执行定义作用域

[预览版 REST 计划程序](https://learn.microsoft.com/en-us/rest/api/fabric/lakehouse/background-jobs/create-refresh-materialized-lake-views-schedule#limitations)支持 Lakehouse 作用域的刷新计划。一个 Lakehouse 最多可以有 **20 个计划**，并且一条 MLV 血缘只能有**一个活动刷新计划**。如果用户请求针对子集制定计划，请创建一个包含所选 MLV/上游 Lakehouse 的 **MLV 执行定义**，并在计划或按需 `executionData` 中传递其 `mlvExecutionDefinitionId`。执行定义用于限定刷新范围；它们无法绕过计划程序的限制。

### 5. MLV 发现 — 用户必须提供名称

`GET /materializedLakeViews` 返回 404。请预先向用户询问 Lakehouse ID 和表名。

### 6. 运行历史诊断工作流

当用户询问“为什么我的刷新失败了？”或“显示运行历史记录”时，请遵循以下顺序：

1. **列出最近的运行**：`GET /instances` — 返回包含状态、开始/结束时间的作业实例
2. **显示运行摘要**：显示包含运行 ID、状态、开始/结束时间和持续时间的表格
3. **选择失败的运行**：如果有多个，请询问用户要调查哪一个
4. **读取错误代码**：从失败的实例中提取 `failureReason.errorCode` 和 `failureReason.message`
5. **建议后续步骤**：根据错误代码：
   - `MLV_SPARK_SESSION_REQUEST_SUBMISSION_FAILED` → 检查容量可用性和 Spark 池配置
   - `MLV_SELECTED_NOT_FOUND` → MLV 表已被删除或重命名，请验证其是否存在
   - 其他 Spark 错误 → 转交给 `spark-operations-cli`，以诊断 OOM、数据倾斜和 shuffle 溢写问题
6. **各视图详细信息**：API 仅返回血缘级状态。各视图状态（哪些具体 MLV 失败）可在 UI 的“最近运行”页面中查看 — 请引导用户前往该页面查看视图级明细

**运行状态**（来自 API）：`NotStarted`、`InProgress`、`Completed`、`Failed`、`Cancelled`、`Deduped`

> **注意**：运行历史记录的保留期限可能有限。如果较早的运行记录缺失，请查看 Lakehouse UI 中的“最近运行”页面。

## 推荐

- **使用 Lakehouse 计划执行定期刷新** — 对于交互式工作流，引导用户前往 **Lakehouse → 具体化湖视图 → 管理 → 计划**。仅当用户需要以编程方式实现自动化或 CI/CD 时，才使用 REST API。
- **使用 Daily/Weekly 类型**实现精确的每日时刻调度（例如，“每天凌晨 2 点”）
- **仅将带有 interval 的 Cron 类型**用于每天多次的刷新频率（例如，“每 60 分钟”）
- **分步规划** — 明确意图、提出计划、展示预览，并在获得批准后执行
- **迭代式错误处理** — 失败时，说明出错原因并提出可操作的修复建议
- 每个计划中都应包含**明确的时区**（`localTimeZoneId`）
- **根据扩展沿袭关系进行跨 Lakehouse 调度** — 当 MLV 跨越多个 Lakehouse 时，从下游 Lakehouse 的沿袭关系视图进行调度。扩展沿袭关系会按照依赖顺序自动刷新上游依赖项。应优先采用这种方式，而不是分别在每个 Lakehouse 上创建单独的计划。

## 避免

- **在没有执行定义的情况下声称可按表调度** — 默认刷新完整沿袭关系；若要刷新选定的子集，则需要已保存的执行定义
- **Cron 字符串表达式**（例如，`0 2 * * *`）— API 使用结构化类型，而不是 Cron 字符串
- **假设按需刷新返回 JSON 响应** — 它仅返回带有 Location 标头中作业 ID 的 202 响应
- **静默失败** — 始终说明错误
- **通过 Notebook 或管道进行调度** — MLV 定期刷新应使用 Lakehouse 计划。SQL `REFRESH ... FULL` 仅用于一次性的手动故障排除。

## 计划负载结构

### 创建计划（POST /schedules）

**端点**：`POST /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules`

```json
{
  "enabled": true,
  "configuration": {
    "type": "Cron",
    "interval": 60,
    "startDateTime": "2026-06-20T00:00:00",
    "endDateTime": "2027-06-20T23:59:59",
    "localTimeZoneId": "UTC"
  }
}
```

**沿袭关系子集计划**：当用户只想刷新执行定义中包含的 MLV/上游 Lakehouse 时，请包含 `executionData`：
```json
{
  "enabled": true,
  "configuration": {
    "type": "Cron",
    "interval": 60,
    "startDateTime": "2026-06-20T00:00:00",
    "endDateTime": "2027-06-20T23:59:59",
    "localTimeZoneId": "UTC"
  },
  "executionData": {
    "mlvExecutionDefinitionId": "<mlvExecutionDefinitionId>"
  }
}
```

**关键字段：**
- `enabled`：设为 `true` 可在创建时启用计划
- `type`：可选值为 `"Cron"`、`"Daily"`、`"Weekly"`、`"Monthly"`
- `interval`：（仅限 Cron）刷新间隔，以分钟为单位（例如，`60` = 每小时，`120` = 每 2 小时）
- `times`：（Daily/Weekly/Monthly）采用 `"HH:MM"` 格式的时间数组，例如 `["02:00"]`
- `weekdays`：（仅限 Weekly）例如 `["Monday", "Wednesday", "Friday"]` — 使用 PascalCase 格式的星期名称
- `recurrence`：（仅限 Monthly）重复间隔，例如 `1`（每月）
- `occurrence`：（仅限 Monthly）例如 `{"occurrenceType": "DayOfMonth", "dayOfMonth": 1}`
- `localTimeZoneId`：Windows 时区名称 — `"UTC"`、`"Central Standard Time"`、`"India Standard Time"` 等
- `startDateTime`：计划开始生效的时间（ISO 8601 本地时间；时区由 `localTimeZoneId` 提供）
- `endDateTime`：**必填** — 计划到期的时间
- `executionData.mlvExecutionDefinitionId`：可选；仅刷新该执行定义中包含的选定沿袭关系

**每日示例**（“每天凌晨 2 点”的首选方式）：
```json
{ "enabled": true, "configuration": { "type": "Daily", "times": ["02:00"], "startDateTime": "2026-06-20T00:00:00", "endDateTime": "2027-06-20T23:59:59", "localTimeZoneId": "UTC" } }
```

**每周示例**（每周一和周五早上 6 点）：
```json
{ "enabled": true, "configuration": { "type": "Weekly", "times": ["06:00"], "weekdays": ["Monday", "Friday"], "startDateTime": "2026-06-20T00:00:00", "endDateTime": "2027-06-20T23:59:59", "localTimeZoneId": "UTC" } }
```

**每月示例**（每月 1 日午夜）：
```json
{ "enabled": true, "configuration": { "type": "Monthly", "recurrence": 1, "occurrence": {"occurrenceType": "DayOfMonth", "dayOfMonth": 1}, "times": ["00:00"], "startDateTime": "2026-06-20T00:00:00", "endDateTime": "2027-06-20T23:59:59", "localTimeZoneId": "UTC" } }
```

> **警告**：对于 Monthly，请勿使用 `"days": [1, 15]`，否则会返回 `400 InvalidConfiguration`。请使用如上所示的 `recurrence` + `occurrence`。

### 更新计划（PATCH /schedules/{id}）

**端点**：`PATCH /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules/{id}`

```json
{
  "enabled": true,
  "configuration": {
    "type": "Cron",
    "interval": 120,
    "startDateTime": "2026-06-20T00:00:00",
    "endDateTime": "2027-06-20T23:59:59",
    "localTimeZoneId": "UTC"
  }
}
```

**注意**：更新 API 要求同时提供 `enabled` 和**完整的** `configuration`（完全替换，而非部分修补）。请始终发送所有字段。

## MLV 执行定义

当用户希望刷新**特定 MLV**、包含**选定的上游湖仓**、固定使用某个 **Spark 环境**，或独立于默认的全链路刷新选择一种**刷新模式**时，请使用执行定义。

### 创建 MLV 执行定义

**端点**：`POST /workspaces/{workspaceId}/lakehouses/{lakehouseId}/mlvexecutiondefinitions`

```json
{
  "displayName": "Gold Chain - Sales",
  "description": "Nightly refresh for selected gold-layer MLVs",
  "settings": {
    "environment": {
      "referenceType": "ById",
      "itemId": "<environmentId>",
      "workspaceId": "<environmentWorkspaceId>"
    },
    "refreshMode": "Optimal"
  },
  "currentLakehouseExecutionContext": {
    "mode": "Selected",
    "selectedMlvs": [
      "dbo.gold_sales_summary",
      "dbo.gold_sales_daily"
    ]
  },
  "extendedLineageExecutionContext": {
    "mode": "All"
  }
}
```

**执行上下文模式：**
- `currentLakehouseExecutionContext.mode`：`"All"` 或 `"Selected"`；当值为 `"Selected"` 时，请通过 `selectedMlvs` 提供完全限定的 MLV 名称。
- `extendedLineageExecutionContext.mode`：`"All"` 或 `"Selected"`；当值为 `"Selected"` 时，请提供包含 `referenceType`、`itemId` 和 `workspaceId` 的 `selectedLakehouses` 对象。
- `settings.refreshMode`：`"Optimal"` 或 `"Full"`。
- `settings.environment`：可选的按 ID 引用的 Spark 环境。

**更新语义**：`PATCH /mlvexecutiondefinitions/{id}` 是部分更新。只有提供的字段会发生更改；省略的字段将保留其现有值。这与计划 PATCH 不同，后者要求提供 `enabled` 和完整的 `configuration`。

**删除语义**：`DELETE /mlvexecutiondefinitions/{id}` 还会移除与该执行定义关联的计划。删除前应发出警告。

## 触发按需刷新（POST /instances）

**端点**：`POST /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/instances`

**请求正文**：完整血缘刷新无需请求正文。按依赖顺序刷新整个 MLV 血缘。

**子集刷新正文**：
```json
{
  "executionData": {
    "mlvExecutionDefinitionId": "<mlvExecutionDefinitionId>"
  }
}
```

**不要将作业历史记录用作触发契约**：近期运行记录中可能会列出 `jobType: "MaterializedLakeViews"`，但该值只是历史记录/状态标签。对于按需刷新，请始终调用此 Lakehouse 范围的端点。将此历史记录标签复用于通用项作业 API（`POST /workspaces/{workspaceId}/items/{lakehouseId}/jobs/instances?jobType=MaterializedLakeViews`）会导致已知的 `InvalidJobType` 失败，无法继续。

触发响应会返回一个项范围的 `Location` URL（`/items/{lakehouseId}/jobs/instances/{jobInstanceId}`）。请直接使用该 URL 进行轮询和取消。文档中也将 Lakehouse 范围的 GET（`/lakehouses/{lakehouseId}/jobs/instances/{jobInstanceId}`）列为替代方案，它会返回同一个实例，但当前服务不会在 `Location` 标头中返回这种形式。

**响应**：`202 Accepted` — 作业实例 ID 位于 `Location` 响应标头中：
```
Location: https://api.fabric.microsoft.com/v1/workspaces/{wsId}/items/{lakehouseId}/jobs/instances/{jobInstanceId}
Retry-After: 60
```

**轮询状态**：使用 `Location` 标头中的 URL（或其 Lakehouse 范围的等效 URL）：
```
GET /workspaces/{workspaceId}/items/{lakehouseId}/jobs/instances/{jobInstanceId}
```

**作业实例状态值：**

| 状态 | 含义 |
|--------|---------|
| `NotStarted` | 作业已排队，但尚未开始 |
| `InProgress` | 作业正在运行 |
| `Completed` | 作业已成功完成 |
| `Failed` | 作业失败（检查 `failureReason`） |
| `Cancelled` | 作业已被用户取消 |
| `Deduped` | 由于另一个刷新已在进行中，因此已跳过 |

**注意**：根据 MS Learn，通过公共 `GET /lakehouses/{id}/jobs/refreshMaterializedLakeViews/instances` 返回的作业实例使用 `jobType: "RefreshMaterializedLakeViews"`。在实际测试中，某些项级历史记录界面曾返回 `jobType: "MaterializedLakeViews"`；诊断旧版历史记录时，请筛选这两个值，但绝不要将 `MaterializedLakeViews` 用作按需触发的 `jobType`。

**状态显示限制**：作业实例状态反映的是 Monitor hub 状态，可能与 MLV 运行历史记录 UI 不同。例如，MLV 运行历史记录中的 **已跳过** 状态在 Monitor hub API 中可能显示为 **已取消**。

**计划设置**（可通过 UI 或 API 配置的其他选项）：
- **最佳刷新**（默认：开启）— Fabric 会自动为每个 MLV 选择增量刷新或完整刷新
- **扩展血缘** — 通过单个计划，按依赖顺序刷新跨多个 Lakehouse 的链路

## 工作流示例

### 工作流 1：安排夜间刷新

**用户提示**：“安排 `CustomerVoice` 湖仓中的 `sales_monthly` MLV 每天凌晨 2 点刷新”

**智能体步骤**：
1. 通过 `GET /workspaces` + JMESPath 查找“CustomerVoice”的工作区 ID
2. 通过 `GET /workspaces/{id}/lakehouses` + JMESPath 查找湖仓 ID
3. 明确范围：“你希望使用默认的完整沿袭关系计划，还是应仅为 `sales_monthly` 创建一个 MLV 执行定义？”
4. 如果用户选择子集范围，则创建一个执行定义，其中 `currentLakehouseExecutionContext.mode = "Selected"` 且 `selectedMlvs = ["dbo.sales_monthly"]`（或用户实际使用的完全限定 MLV 名称），然后在计划的 `executionData` 中包含其 `mlvExecutionDefinitionId`。
5. 显示预览：
   ```
   Creating schedule:
     Lakehouse: CustomerVoice (ID: xyz-456-ghi)
     Scope: Full lineage OR execution definition <id>
     Type: Daily, Time: 02:00 UTC
     Start: Now
     End: 1 year from now
   
   Proceed? [Allow / Decline]
   ```
6. 用户选择“Allow”后：POST 计划有效负载，并返回计划 ID
7. 报告：“计划已创建（ID：sched-789）。范围：完整沿袭关系或执行定义 <id>。”

### 工作流 2：触发立即刷新

**用户提示**：“立即刷新湖仓 `xyz-456-ghi` 中的 `inventory_daily` MLV”

**智能体步骤**：
1. 确认湖仓 ID 有效（GET /lakehouses/{id}）
2. 明确范围并显示预览：
   ```
   Triggering on-demand refresh:
     Lakehouse ID: xyz-456-ghi
     Scope: Full lineage OR execution definition <id>
   
   Do you want the default full-lineage refresh, or only `inventory_daily` through an execution definition? Proceed? [Allow / Decline]
   ```
3. 如果用户选择子集，则为 `inventory_daily` 创建或复用一个执行定义，并在 `executionData` 中发送其 ID；否则，不带请求正文 POST `/instances`。从 Location 标头中获取作业 ID。
4. 使用 `Location` 标头中返回的项范围 URL 或其已记录的湖仓范围等效端点 `GET /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/instances/{jobId}` 进行轮询，并显示进度。
5. 报告：“✅ 刷新已在 2 分 34 秒内完成”或“❌ 刷新失败：[错误消息]”

### 工作流 3：用户请求按 MLV 单独安排计划（说明限制）

**用户提示**：“安排 `bronze_sales`、`silver_sales`、`gold_sales` 分别在凌晨 2 点、3 点、4 点刷新”

**智能体步骤**：
1. 说明限制：
   ```
   These views are a dependency chain, so schedule them as one lineage refresh
   rather than at separate times. Lakehouse scheduling refreshes dependencies in
   the required order.

   Options:
     1. Single Daily schedule at 2 AM (refreshes all 3 in order)
     2. If the MLVs are independent, create separate execution definitions and
        schedules within the lakehouse's 20-schedule limit
     3. If they're in separate lakehouses, create one schedule per lakehouse
   
   Which would you prefer?
   ```
2. 如果用户选择选项 1：创建一个每日计划，并设置 `"times": ["02:00"]`
3. 如果用户选择选项 2：确认这些 MLV 相互独立，然后创建执行定义和计划
4. 如果用户选择选项 3：确认每个湖仓的 ID，然后创建计划

### 工作流 4：列出和删除计划

**用户提示**：“显示我的计划，如果它已过期就将其删除”

**代理步骤**：
1. 询问用户工作区和 Lakehouse（无法全局列出计划）
2. `GET /workspaces/{wsId}/lakehouses/{lhId}/jobs/refreshMaterializedLakeViews/schedules`
3. 解析响应（每个沿袭通常有 1 个计划），显示详细信息：
   ```
   Active schedule on lakehouse 'CustomerVoice':
     - ID: sched-111 (created 2025-10-15, type: Daily, time: 02:00)
   
   Delete this schedule? [Allow / Decline]
   ```
4. 用户选择“允许”后：DELETE /schedules/{id}，并进行确认
5. 报告：“✅ 计划已删除”

## 常见错误与修复方法

### 错误：`400 Bad Request` — 间隔无效

**消息**：`"The interval '0' is invalid. Interval must be between 1 and 5270400 (10 years in minutes)."`

**修复方法**：
```
Interval must be a valid number of minutes between 1 and 5,270,400 (10 years).

Common intervals:
  60 = hourly
  1440 = daily (24 hours)
  10080 = weekly (7 days)

Would you like me to adjust the interval to a valid value?
```

### 错误：`409 Conflict` — 计划已存在

**消息**：`"A schedule already exists for this lakehouse"`

**修复方法**：
```
A schedule is already active for this lakehouse. Options:
  1. Update existing schedule (change interval/time)
  2. Delete and recreate (replaces schedule)
  3. Leave as-is (no change)

Which would you prefer?
```

### 错误：`404 Not Found` — Lakehouse ID 无效

**消息**：`"Lakehouse 'wrong-id-123' not found in workspace 'abc-456'"`

**修复方法**：
```
The lakehouse ID you provided doesn't exist. Let me list available lakehouses:

[Call GET /workspaces/{id}/lakehouses, show table]

Which lakehouse should I use?
```

### 错误：`403 Forbidden` — 权限被拒绝

**消息**：`"User does not have permission to create schedules in this workspace"`

**修复方法**：
```
You need Workspace Contributor or Admin role to create schedules.

Current permissions: Viewer (read-only)
Required: Contributor or Admin

Contact your workspace admin to request elevated permissions.
```

## 用户提示

### 1. 查找您的 Lakehouse ID

**选项 A：通过 REST API**
```bash
az rest --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/lakehouses" \
  --method GET
```

从响应中提取您的 Lakehouse 的 `id`。

**选项 B：通过 Fabric UI**
1. 在 Fabric 门户中打开 Lakehouse
2. 单击“设置”（齿轮图标）
3. 从属性中复制“Lakehouse ID”

### 2. 常见计划配置

| 需求 | 类型 | 关键字段 |
|------|------|-----------|
| 每小时 | Cron | `"interval": 60` |
| 每天凌晨 2 点 | Daily | `"times": ["02:00"]` |
| 工作日早上 6 点 | Weekly | `"times": ["06:00"], "weekdays": ["Monday","Friday"]` |
| 每月 1 日 | Monthly | `"recurrence": 1, "occurrence": {"occurrenceType": "DayOfMonth", "dayOfMonth": 1}` |

### 3. 监控作业历史记录

列出最近的刷新作业（按照 [COMMON-CLI.md § 快速参考：az rest 模板](../../common/COMMON-CLI.md#quick-reference-az-rest-template)进行身份验证）：
```bash
# See COMMON-CLI.md for authentication setup
az rest --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/instances" \
  --method GET
```

> **注意**：列出实例 API 不支持 OData 查询参数（`$top`、`$orderby`、`$filter`）。请在检索后于客户端对结果进行排序和筛选。使用 `continuationToken` 进行分页。

### 4. 时区注意事项

**默认设置**：除非另有指定，否则计划使用 UTC。

**最佳实践**：始终明确指定时区，以避免混淆：
```json
{
  "configuration": {
    "localTimeZoneId": "Central Standard Time"
  }
}
```

有效时区：Windows 时区名称（例如 `"Central Standard Time"`、`"Pacific Standard Time"`、`"India Standard Time"`）。请使用 [Windows 默认时区](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones)注册表。

## 相关技能

- **spark-authoring-cli**：在 Fabric Notebook 中创建 MLV（创作端）
- **check-updates**：验证技能包是否为最新版本（每个会话运行一次）

## 限制与未来路线图

### 当前限制（截至 2026-06-18）

| 功能 | 状态 | 解决方法 |
|---------|--------|------------|
| 列出湖仓中的 MLV | ❌ API 返回 404 | 用户手动提供表名 |
| 刷新选定的 MLV／部分血缘 | ✅ 使用 MLV 执行定义 | 创建 `/mlvexecutiondefinitions`，然后传递 `executionData.mlvExecutionDefinitionId` |
| 获取可视化血缘图 | ❌ 无公共图 API | 使用 Fabric 湖仓 UI |
| 检查数据质量指标 | ❌ API 返回 404 | 使用 Fabric 湖仓 UI |
| 验证架构支持 | ❌ 缺少属性 | 如果 MLV 正常工作，则假定已启用架构 |

### 当前可用功能（公共 MLV API 覆盖范围（预览版））

- ✅ 创建／列出／更新／删除计划（5 个 API）
- ✅ 触发／监控／取消刷新作业（4 个 API）
- ✅ 创建／列出／获取／更新／删除 MLV 执行定义（5 个 API）
- ✅ 通过 `executionData.mlvExecutionDefinitionId` 执行完整血缘或选定血缘刷新
- ✅ 刷新工作流的完全自动化
- ✅ 人在回路的安全确认
- ✅ 迭代式错误处理

### 计划功能（REST API 发布后）

- **MLV 发现**：自动列出湖仓中的 MLV
- **可视化血缘追踪**：显示依赖关系图
- **数据质量**：以编程方式获取 DQ 指标
- **架构验证**：检查 `enableSchemas` 属性

**代理设计具备向前兼容性**：当 API 可用时，可以添加发现功能，而无需更改计划逻辑。

## 结论

此技能使用公共 REST API，为 MLV 刷新计划、执行定义和监控提供**经过验证的自动化能力**。虽然目前 MLV 发现和可视化血缘检查仍需要通过 UI 变通实现，但计划、选定血缘执行定义和作业执行均可按文档所述正常工作。

**设计理念**（受 Databricks 数据工程代理启发）：
- 通过人在回路的确认来确保安全
- 为复杂任务提供分步规划
- 提供有用建议的迭代式错误处理
- 坦诚说明限制（不提供推测性的解决方法）

**后续步骤**：使用此技能自动执行 MLV 刷新工作流。当发现 API 发布后，我们将扩展此技能，以消除手动输入湖仓 ID 和表名的需要。