---
name: activator-authoring-cli
description: >
  Author Fabric Activator rules and Reflex items through Fabric REST API and `az rest`.
  Invoke for write intents: create or delete items; add or update rule definitions;
  configure thresholds, filters, Teams/email notifications, Fabric item actions, and
  Eventhouse/Eventstream/Real-Time Hub/DTB/Ontology/Power BI sources. Pure GET/explain prompts
  belong to `activator-consumption-cli`. Clarification for missing sources, thresholds,
  recipients, and action targets happens inside this skill.
  After another data skill finds a timely operational signal such as a spike, failure,
  anomaly, SLA risk, or capacity constraint, proactively ask whether the user wants an
  alert for future occurrences.
  Triggers: "create an alert", "create an activator", "create a reflex",
  "create an activator item", "create an alert item",
  "notify me when", "let me know when",
  "take action when", "send me an email when", "send a teams message when",
  "run a pipeline when", "update an alert", "delete an alert", "activator rule"
---
> **更新检查 — 每个会话仅一次（强制）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能（例如 `/fabric-skills:check-updates`）。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：读取本地 `package.json` 版本，然后通过 `git fetch origin main --quiet && git show origin/main:package.json`（或 GitHub API）与远程版本进行比较。如果远程版本较新，请显示变更日志和更新说明。
> - 如果本次会话中之前已执行过此检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# activator-authoring-cli — 通过 CLI 创作 Activator 项目和规则

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* [解析工作区/项目 ID 时需要] |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401 |
| 身份验证操作方法 | [COMMON-CLI.md § 身份验证操作方法](../../common/COMMON-CLI.md#authentication-recipes) | 使用通用文档中共享的 `az login` / 令牌指南 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 列出工作区、列出项目、创建项目 |
| 长时间运行的操作 (LRO) | [COMMON-CORE.md § 长时间运行的操作 (LRO)](../../common/COMMON-CORE.md#long-running-operations-lro) | 创建、getDefinition、updateDefinition 可能返回 202 |
| Fabric 项目定义 | [ITEM-DEFINITIONS-CORE.md § 定义封装](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope) | Base64 编码的部件结构 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传入 `--resource https://api.fabric.microsoft.com`** |
| LRO 模式 | [COMMON-CLI.md § 长时间运行的操作 (LRO) 模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | 轮询 202 响应 |
| 实体类型、源和视图 | [source-types.md](references/source-types.md) | 实体封装、源实体和 `timeSeriesView-v1` 变体 |
| Eventstream 源 | [eventstream-source.md](references/eventstream-source.md) | 推送源工作流：先创建 Eventstream 接收器，然后扩展发现的 Activator 实体 |
| KQL 源 | [kql-source.md](references/kql-source.md) | KQL 源架构、时间轴支持和设计指南 |
| Digital Twin Builder / 本体源 | [dtb-source.md](references/dtb-source.md) | DTB / 本体源架构、JSON 字符串查询有效负载、快照与时间轴指南 |
| 实时中心源 | [real-time-hub-source.md](references/real-time-hub-source.md) | 实时中心源架构、工作区事件类型 |
| Power BI 源 | [powerbi-source.md](references/powerbi-source.md) | `powerBiSource-v1`、存储的查询有效负载、`DatasetMetric`、筛选器、持久化和 ALM 回读限制 |
| 规则条件 | [rule-conditions.md](references/rule-conditions.md) | 规则模板结构、检测条件、聚合、时间窗口、发生次数选项和扩充 |
| 操作类型 | [action-types.md](references/action-types.md) | TeamsMessage、EmailMessage、FabricItemInvocation 操作架构 |

---

## 工具栈
| 工具 | 用途 |
|---|---|
| **az CLI** | Fabric 身份验证和 REST API 令牌获取 |
| **curl** | 通过共享的 `fabric_lro` 辅助函数发起可感知响应头的 Fabric REST 调用 |
| **jq** | JSON 筛选和已解码定义检查 |
| **python** | **构建 ReflexEntities.json 时必须使用**——`json.dumps()` 能正确处理嵌套字符串化。PowerShell 的 `ConvertTo-Json` 会破坏嵌套 JSON 字符串。 |

> ⚠️ **关键：始终使用 Python（而非 PowerShell）构建 ReflexEntities.json 负载和 API 请求正文。**

### Python 模式

```python
import json, base64, uuid

# Stringify template → JSON string for definition.instance
instance_string = json.dumps(template_dict, separators=(',', ':'))

# Encode entities and write updateDefinition request body
payload_b64 = base64.b64encode(json.dumps(entities).encode('utf-8')).decode('utf-8')
body = json.dumps({"definition": {"parts": [{"path": "ReflexEntities.json", "payload": payload_b64, "payloadType": "InlineBase64"}]}})
with open('update-body.json', 'w', encoding='utf-8') as f:
    f.write(body)
# Then: az rest --method POST --url "...updateDefinition" --resource "https://api.fabric.microsoft.com" --body @update-body.json

# Decode a getDefinition response
response = json.loads(api_output)
for part in response['definition']['parts']:
    if part['path'] == 'ReflexEntities.json':
        entities = json.loads(base64.b64decode(part['payload']).decode('utf-8'))

# Generate GUIDs for uniqueIdentifier and step id fields
entity_id = str(uuid.uuid4())
```

---

## 连接

请遵循 [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes)中的共享身份验证指南。按照 [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)解析工作区 ID 和项目 ID。以下示例假定 `WS_ID` 和 `REFLEX_ID` 已经解析完成。

---

## 项目 CRUD

请使用 [COMMON-CLI.md § 项目 CRUD 操作](../../common/COMMON-CLI.md#item-crud-operations)中的共享机制。Activator 使用 `reflexes` 端点，而不是通用的 `items` 端点：

| 操作 | 端点 | 方法 | 作用域 | 备注 |
|---|---|---|---|---|
| 创建 | `/v1/workspaces/{workspaceId}/reflexes` | POST | `Reflex.ReadWrite.All` 或 `Item.ReadWrite.All` | 可能返回 202 LRO——使用 COMMON-CLI 中的 `fabric_lro` |
| 更新元数据 | `/v1/workspaces/{workspaceId}/reflexes/{reflexId}` | PATCH | `Reflex.ReadWrite.All` 或 `Item.ReadWrite.All` | 遵循 COMMON-CLI 元数据更新模式 |
| 删除 | `/v1/workspaces/{workspaceId}/reflexes/{reflexId}` | DELETE | `Reflex.ReadWrite.All` 或 `Item.ReadWrite.All` | 添加 `?hardDelete=true` 以永久删除 |
| `getDefinition` | `/v1/workspaces/{workspaceId}/reflexes/{reflexId}/getDefinition` | POST | `Reflex.ReadWrite.All` 或 `Item.ReadWrite.All` | 需要空正文；可能返回 202 LRO——使用 `fabric_lro` |
| `updateDefinition` | `/v1/workspaces/{workspaceId}/reflexes/{reflexId}/updateDefinition` | POST | `Reflex.ReadWrite.All` 或 `Item.ReadWrite.All` | 使用 Python 构建 `update-body.json`，然后遵循 COMMON-CLI updateDefinition 模式 |

---

## 通过定义管理规则

规则通过 `getDefinition` 和 `updateDefinition` 进行管理。有效负载为 `ReflexEntities.json`，它是一个经过 Base64 编码的实体对象 JSON 数组。工作流：**获取 → 解码 → 修改 → 重新编码 → 更新**。

### 获取定义

> `getDefinition` 是一个 **POST**（而不是 GET），需要 **ReadWrite** 作用域，并且可能返回 **202 LRO**。请使用 [COMMON-CLI.md § 长时间运行操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)中的 `fabric_lro` 辅助程序，以便在解码之前通过 `Location` 标头轮询 202 响应。

```bash
DEFINITION=$(fabric_lro POST \
  "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}/getDefinition" \
  '{}')

echo "$DEFINITION" \
  | jq '.definition.parts[] | select(.path=="ReflexEntities.json") | .payload' -r \
  | base64 -d | jq .
```

### 更新定义

> **必须使用 Python** 构建 `update-body.json`（请参阅 [Python 模式](#python-patterns)），然后使用 COMMON-CLI updateDefinition 模式将其上传至 `/v1/workspaces/{workspaceId}/reflexes/{reflexId}/updateDefinition`。

### ReflexEntities.json — 组装过程

按顺序构建实体的 JSON 数组。每个实体的 `uniqueIdentifier` 都需要一个全新的 GUID。对于此技能中手动编写的拉取源流，请使用 templateVersion `1.2.4`。对于由 Eventstream 接收器创建的流，请保留已解码 Activator 定义中现有的模板版本；这些回读结果可以使用 `1.1`。

**步骤 1 — 容器**（必须正好 1 个）：
- 类型：`container-v1`。使用与源图匹配的容器有效负载类型：KQL 源使用 `kqlQueries`，Real-Time Hub 工作区订阅使用 `rthSubscriptions`，Power BI 源使用区分大小写且完全一致的 `pbiMetrics`，Eventstream 流则使用回读结果中已有的服务创建类型。
- 所有其他实体都通过 `parentContainer.targetUniqueIdentifier` 引用此实体

**步骤 2 — 数据源**（必须正好 1 个，选择正确的类型）：
- 有关受支持的源工作流，请参阅 [eventstream-source.md](references/eventstream-source.md)、[kql-source.md](references/kql-source.md)、[dtb-source.md](references/dtb-source.md)、[real-time-hub-source.md](references/real-time-hub-source.md) 或 [powerbi-source.md](references/powerbi-source.md)
- 对于手动编写的拉取源，将 `parentContainer.targetUniqueIdentifier` → 容器 GUID
- 对于 `eventstreamSource-v1`：**不要**一开始就手动编写该源。首先创建或更新带有 `Activator` 目标的 Eventstream，然后读取 Activator 定义，并从自动创建的 `eventstreamSource-v1` + SourceEvent 实体继续操作。在公开回读结果中，这些由接收器创建的实体可能没有显式的 `parentContainer`。
- 对于 `kqlSource-v1`：KQL 查询应返回所有数据（**不要**预先筛选条件——让规则来处理）。必须包含 `eventhouseItem`、`metadata` 和 `queryParameters`。对于 Fabric Eventhouse/KQL DB 源，使用 `eventhouseItem: { itemId, workspaceId, itemType: "KustoDatabase" }`。对于外部 ADX/Kusto 源，使用 `eventhouseItem: { clusterHostName, databaseName }`。**在创建 Activator 之前，先直接对目标源运行 KQL，并确认返回的列、时间戳字段和行结构均正确。****只要查询结果中存在合理的时间戳列，就应使用 `eventTimeSettings` 以及 `DURATION_START`/`DURATION_END` queryParameters，并在 KQL 中使用 `declare query_parameters(startTime:datetime, endTime:datetime);` 声明这些参数。**仅当底层数据没有合理的时间戳列且每一行都表示当前状态时，才使用快照模式（`queryParameters: []`、无 `eventTimeSettings`、无时间筛选）。请参阅 [kql-source.md](references/kql-source.md)。
- 对于 `digitalTwinBuilderSource-v1`：使用 DTB / Ontology `connection` 项引用 `{ itemId, workspaceId, itemType }`，其中 `itemType` 为 `DigitalTwinBuilder` 或 `Ontology`。`query.queryString` 必须是 JSON 字符串有效负载，而不是 KQL。**在创建 Activator 之前，先直接运行 DTB / Ontology 查询，并确认返回的列、键字段和时间戳字段均正确。**当返回的行中包含合理的时间戳字段时，优先使用 `eventTimeSettings` 以及 `DURATION_START`/`DURATION_END` 查询参数；与 KQL 不同，这些持续时间参数会作为 DTB 端点 URL 查询参数应用，而不是在查询正文中引用。请参阅 [dtb-source.md](references/dtb-source.md)。
- 对于 `powerBiSource-v1`：基于限定范围的报表/页面/视觉对象以及语义模型元数据，以确定性方式构建源。其父容器必须使用完全一致的 `payload.type: "pbiMetrics"`。将源查询有效负载作为 JSON 文本存储在 `query.queryString` 中，并在 `metricDefinition` 中存储匹配的 `DatasetMetric`。使用 `updateDefinition` 进行持久化，要求显式 HTTP `200`（或 LRO 最终成功），并在出现任何导入错误时停止。请参阅 [powerbi-source.md](references/powerbi-source.md)。

**第 3 步 — SourceEvent 视图**（恰好 1 个）：
- 类型：`timeSeriesView-v1`，definition.type：`"Event"`，实例：通过 `entityId` 引用 Source 的 SourceEvent 模板
- 对于手动编写的拉取源流，将 `parentContainer` → Container GUID
- 对于由 Eventstream 接收器创建的流，复用回读时自动创建的 SourceEvent，而不是再创建一个

**第 4 步 — 根据触发器类型选择实体图**

- **对于 `AttributeTrigger` 规则**（阈值、范围、文本匹配、布尔检查、聚合）：
  - 创建一个 **Object** 视图
  - 如果必须将事件映射到对象实例，可以选择创建 **SplitEvent**
  - 创建 **IdentityPartAttribute** 和所有必需的 **BasicEventAttribute** 实体
  - 随后，规则在 `ScalarSelectStep` 中引用这些值属性

- **对于 `EventTrigger` 规则**（针对每个事件触发、心跳、事件字段状态/变化）：
  - 使用最小实体图：**Container → Source → SourceEvent → Rule**（+ 可选的 `fabricItemAction-v1`）
  - 除非场景确实需要基于属性的建模，否则**不要创建 Object、SplitEvent、IdentityPartAttribute 或 BasicEventAttribute 实体**
  - `FieldsDefaultsStep` 必须包含一个 `EventSelector` 行，其中嵌套的 `EventReference.entityId` 指向 SourceEvent 实体。顶层 `EventReference` 行无效。
  - EventTrigger 直接在 `FieldsDefaultsStep` / `EventDetectStep` 中读取原始事件字段

**第 5 步 — Rule**（每个警报 1 个）：
- 类型：`timeSeriesView-v1`，definition.type：`"Rule"`
- 为方便用户理解，**始终添加 `"description": "Created by: skills-for-fabric"`**
- 实例：规则模板（参见 [rule-conditions.md](references/rule-conditions.md)）
  - `AttributeTrigger`（v1.2.4）：ScalarSelectStep → ScalarDetectStep → (DimensionalFilterStep)* → ActStep
  - `EventTrigger`（v1.2.4）：FieldsDefaultsStep → (EventDetectStep)+ → (DimensionalFilterStep)* → ActStep
- `instance` **必须是 JSON 字符串**（使用 `json.dumps()`）
- `instance.steps[]` 中的每个模板步骤都需要一个 `id` GUID。缺少步骤 ID 可能会产生无效的表达式图，因为后端转换器使用步骤 ID 作为输出节点 ID。
- 对于 `AttributeTrigger`，设置 `parentObject` → Object，并设置 `parentContainer` → Container
- 对于 `EventTrigger`，设置 `parentContainer` → Container，并省略 `parentObject`，除非设计明确要求使用它
- 默认使用 `settings: { "shouldRun": true, "shouldApplyRuleOnUpdate": false }`，以便新创建的规则以**已启动/正在运行**状态开始
- 仅当用户明确要求规则处于停止状态，或者特定的安全验证/评估工作流需要禁用规则以避免副作用时，才设置 `shouldRun: false`
- 对于包含动态内容的 `TeamsMessage` 操作，保留有效回读结果中特定于字段的引用结构：`headline` / `optionalMessage` 中的内联混合内容片段使用 `AttributeReference`，并将 `type` 设为 `"complex"`；而结构化的 `additionalInformation` 条目使用 `NameReferencePair` + `AttributeReference` / `EventFieldReference`，并将 `type` 设为 `"complexReference"`、将 `name` 设为 `"reference"`

规则实体示例：
```python
{
    "uniqueIdentifier": "<rule-guid>",
    "payload": {
        "name": "My Rule Name",
        "description": "Created by: skills-for-fabric",  # Required for user clarity
        "parentObject": {"targetUniqueIdentifier": "<object-guid>"},
        "parentContainer": {"targetUniqueIdentifier": "<container-guid>"},
        "definition": {
            "type": "Rule",
            "instance": stringify_instance(rule_template),
            "settings": {"shouldRun": True, "shouldApplyRuleOnUpdate": False}
        }
    },
    "type": "timeSeriesView-v1"
}
```

**步骤 6 — Fabric 项操作**（仅适用于 `FabricItemInvocation`）：
- 类型：`fabricItemAction-v1` — 每当规则调用 Fabric 项（例如 Pipeline、Notebook、Spark 作业定义、Dataflow 或 UDF / Function Set）时，请使用此独立操作实体
- 在规则的 `FabricItemBinding` 中，将 `fabricJobConnectionDocumentId` 设置为独立的 `fabricItemAction-v1.uniqueIdentifier`
- 有关各目标的架构以及 UDF 特有的注意事项（`itemType` 与回读值 `FunctionSet`、`subitemId`、规范的 `parameterType` 映射、动态参数结构），请参阅 [action-types.md](references/action-types.md)

### 引用完整性预检

在每次执行 `updateDefinition` 之前，请验证将要发送的确切实体数组：

1. 构建 `ReflexEntities.json` 中所有顶层 `uniqueIdentifier` 的集合。
2. 确认每个 `parentContainer.targetUniqueIdentifier`、`parentObject.targetUniqueIdentifier`、`SourceReference.entityId`、`EventReference.entityId`、`AttributeReference.entityId` 和 `fabricJobConnectionDocumentId` 都能够解析到同一数组中的实体（或者解析到最新解码回读中未更改且已包含在重新编码数组中的实体）。
3. 确认每个引用都指向预期的实体类型：容器指向 `container-v1`；当模板需要视图时，源/事件/属性/规则/对象引用指向 `timeSeriesView-v1`；源引用指向源实体；Fabric 项操作绑定指向 `fabricItemAction-v1`。
4. 如果缺少任何引用，请根据最新的 `getDefinition` 输出重建实体图，并且不要调用 `updateDefinition`。

出现 `FailedToResolveEntity` 且提示 `DocumentType timeSeriesView not found`，意味着某个规则、属性、拆分事件或事件引用指向了提交的定义中不存在的 `timeSeriesView-v1` GUID。应将其视为需要在重试前修复的实体连接错误，而不是暂时性的后端故障。

### 实体连接摘要

```text
Container ← everything references this via parentContainer
    │
    ├── Source ← parentContainer → Container
    │
    ├── SourceEvent ← parentContainer → Container
    │        │         instance references Source by entityId
    │        │
    │        ├── EventTrigger Rule ← parentContainer → Container
    │        │       minimal event-only path; reads raw event fields directly
    │        │
    │        └── Object ← parentContainer → Container
    │              │
    │              ├── (SplitEvent) ← OPTIONAL, parentObject → Object, parentContainer → Container
    │              │       instance references SourceEvent by entityId
    │              │       maps events to objects via FieldIdMapping
    │              │
    │              ├── Identity Attr ← parentObject → Object, parentContainer → Container
    │              │
    │              ├── Value Attr(s) ← parentObject → Object, parentContainer → Container
    │              │       instance references SourceEvent (or SplitEvent if used) by entityId
    │              │
    │              └── AttributeTrigger Rule ← parentObject → Object, parentContainer → Container
    │                      instance references Value Attr by entityId in ScalarSelectStep
    │
    └── (FabricItemAction) ← parentContainer → Container (for any FabricItemInvocation action: Pipeline, Notebook, Spark job, Dataflow, or UDF / Function Set)
```

### 关键：`definition.instance` 是 JSON 字符串

`timeSeriesView-v1` 实体的 `definition` 中的 `instance` 是一个 **JSON 编码的字符串**，而不是嵌套对象。始终将规则模板封装在完整的实体信封中。

**❌ 错误 — 原始模板对象（将失败）：**

```json
{
  "templateId": "AttributeTrigger",
  "templateVersion": "1.2.4",
  "steps": [...]
}
```

**✅ 正确 — 包含字符串化 instance 的实体信封：**

```json
{
  "uniqueIdentifier": "<new-guid>",
  "payload": {
    "name": "My Rule Name",
    "parentObject": { "targetUniqueIdentifier": "<object-guid>" },
      "parentContainer": { "targetUniqueIdentifier": "<container-guid>" },
      "definition": {
        "type": "Rule",
        "instance": "{\"templateId\":\"AttributeTrigger\",\"templateVersion\":\"1.2.4\",\"steps\":[...]}",
        "settings": { "shouldRun": true, "shouldApplyRuleOnUpdate": false }
      }
    },
    "type": "timeSeriesView-v1"
}
```

使用 `json.dumps()` 进行字符串化。**不要使用 PowerShell 的 `ConvertTo-Json`。**

### 两种规则模板类型

| 模板 | 使用场景 | 步骤 |
|----------|-------------|-------|
| `AttributeTrigger` | 监控属性值（数字、文本、布尔值） | ScalarSelectStep → ScalarDetectStep → (DimensionalFilterStep)* → ActStep |
| `EventTrigger` | 在事件发生时触发（状态、变化、心跳） | FieldsDefaultsStep → (EventDetectStep)+ → (DimensionalFilterStep)* → ActStep |

> **EventTrigger** 没有 ScalarSelectStep/ScalarDetectStep。直接针对事件执行操作时使用。它通过 EventDetectStep 支持状态、变化和心跳检测。

---

## 源验证关卡

在编写引用信号（测量值、字段或事件属性）的**任何**规则之前，请确认该源是真实的。只有在以下三项检查全部通过后，请求的源才算是**真实**的：

1. 仅在**请求的**工作区中**解析**该源——不要搜索或替换为其他工作区。
2. **验证**请求的信号列/字段是否存在于该源上（KQL 表/列、Eventstream 字段、Real-Time Hub 事件属性或 DTB / Ontology 属性）。
3. **观察**至少一个携带该信号的代表性行/事件/样本——运行 KQL / DTB 查询或检查流，并确认它确实返回数据。

将**仅有架构**、**零行**、**不发出数据**或**已过时**的证据视为**源数据缺失**，而不是真实的源。当源缺失时，**停止并询问**由哪个源和哪些字段提供该信号（以及任何缺失的阈值、接收者或操作详细信息）。不要创建 Reflex，也不要对任何现有 Activator / Eventstream 调用 `updateDefinition` 来强行适配请求，并明确说明**未创建或更新任何 Activator / Reflex / Eventstream**。唯一的例外是用户明确指示你针对未来的 / 尚未发出数据的源进行编写。

---

## 必须 / 建议 / 避免

### 必须执行

- **编写前确认源是真实的**——遵循[源验证关卡](#source-validation-gate)：解析请求工作区中的源，验证请求的信号列/字段，并在编写前观察至少一个代表性行/事件/样本。仅有架构、零行、不发出数据或已过时的证据都属于**源数据缺失**——**停止并询问**由哪个源和哪些字段提供该信号（以及任何缺失的阈值、接收者或操作详细信息），并说明未创建或更新任何 Activator/Reflex/Eventstream，而不是编写规则。如果用户明确指示针对未来的 / 尚未发出数据的源进行编写，请说明这一假设并继续，但不要声称已观察到该源。
- 将 `az rest` 与 **`--resource https://api.fabric.microsoft.com` 一起使用**——否则令牌受众不正确
- 对 `getDefinition` **始终发送 `--body '{}'`**——它是一个 POST 请求，省略正文可能导致 411 错误
- 调用 `updateDefinition` 时，**始终对 `ReflexEntities.json` 有效负载进行 Base64 编码**
- **始终对 `timeSeriesView-v1` 实体中的 `definition.instance` 字段执行 JSON.stringify**——它必须是字符串，而不是嵌套对象。**始终将规则模板封装在完整的实体信封中**（参见上面的 ❌/✅ 示例）——绝不要输出没有实体包装器的原始模板对象
- **始终使用正确的模板类型**——`AttributeTrigger` 用于基于值的条件（包含 ScalarSelectStep + ScalarDetectStep），`EventTrigger` 用于基于事件的触发（包含 FieldsDefaultsStep + EventDetectStep，不包含 ScalarDetectStep）
- **始终使用规范的 EventTrigger 选择器**——`FieldsDefaultsStep.rows` 包含带有嵌套复杂 `EventReference` 的 `EventSelector`（`kind: Event`）；绝不要将 `EventReference` 直接放入 `rows`
- 添加实体时，**始终为 `uniqueIdentifier` 使用新的 GUID**——重复的 GUID 会导致损坏
- 更改 `uniqueIdentifier` 时，**始终更新所有交叉引用**——其他实体通过 `targetUniqueIdentifier` 引用它
- 在执行 `updateDefinition` 之前，**始终运行引用完整性预检**——有效负载中的每个 `targetUniqueIdentifier`、`entityId` 和 `fabricJobConnectionDocumentId` 都必须解析到提交的 `ReflexEntities.json` 中包含的实体
- **处理 LRO 响应**——`create`、`getDefinition` 和 `updateDefinition` 可能返回 202；轮询 `Location` 标头

### 推荐

- **读取-修改-写入**，而不是完整替换——获取当前定义，修改实体数组，然后更新
- **软删除**，而不是硬删除，除非确实需要永久移除
- 通过工作区列表 + JMESPath **动态发现 ID**，而不是硬编码 GUID
- 对于大多数警报，优先使用**基于状态转换的警报条件**，而不是稳态条件——优先选择 `NumberBecomes`、`NumberEntersOrLeavesRange`、`LogicalBecomes` 等检测器或显式变化条件，即使用户使用的是“is greater than”“is below”或“is outside the range”这类随意的状态式表述。应将普通的警报措辞理解为“当它越过边界进入该状态时通知我”，以避免条件持续为真时重复通知
- 仅当用户明确要求值保持触发状态期间重复触发时，才使用 `IsGreaterThan`、`IsLessThan` 或 `IsOutsideRange` 等**稳态条件**，例如“notify me every time it is greater than 30”“fire on every evaluation while it is above 30”，或者下游出现次数/窗口模式确实依赖这种语义时

### 避免

- **硬编码工作区或项目 ID**——始终动态解析
- **忘记 `.platform` 部分**——仅在使用 `?updateMetadata=true` 时，才将其包含在 `updateDefinition` 中
- 在列表端点上使用不带筛选条件的 **SELECT ***——对于大型工作区，应使用分页
- **修改带有加密敏感度标签的项目定义**——`getDefinition` 会被阻止
- **在 KQL 查询中预先筛选条件**——从 KQL 返回所有数据，并让 Activator 规则步骤处理阈值、文本条件和维度筛选。KQL 是数据源，而不是规则引擎
- **在 PowerShell `az rest --body` 中内联 JSON**——PowerShell 会破坏引号和特殊字符。始终使用 `[System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))` 将 JSON 写入临时文件，并通过 `--body @$path` 传递
- **删除后重复使用显示名称**——软删除的项目会保留其名称数分钟。请使用唯一名称，或先执行硬删除
- **将请求强行套用到不相关的现有项目上**——当没有任何源通过[源验证门槛](#source-validation-gate)（缺失、仅有架构、零行、不发出数据或数据陈旧）时，不要为了满足请求而创建 Reflex，也不要对不相关的现有 Activator / Eventstream 调用 `updateDefinition`；应先询问缺失的数据源
- **只读式列出或检查**——对于“show me all Activators”“list Activators”“show the rules”“inspect this alert”或“decode the definition”之类的提示，请使用 [activator-consumption-cli](../activator-consumption-cli/SKILL.md)。仅当用户要求创建、更新、删除、配置或更改某些内容时，才应运行此创作技能。

---

## 示例

按照[组装流程](#reflexentitiesjson--assembly-procedure)构建定义。完整的实体架构请参阅参考文档：[source-types.md](references/source-types.md)、[rule-conditions.md](references/rule-conditions.md)、[action-types.md](references/action-types.md)。

---

## 代理集成说明

- 此技能使用 Fabric Items API（`/reflexes`）进行 CRUD 操作，并使用 Definition API 进行规则管理
- 无需其他数据平面协议——所有操作均通过面向 Fabric API 受众的 `az rest` 完成
- 如果只需**读取** Activator 项目和规则而不修改它们，请改用 [activator-consumption-cli](../activator-consumption-cli/SKILL.md) 技能