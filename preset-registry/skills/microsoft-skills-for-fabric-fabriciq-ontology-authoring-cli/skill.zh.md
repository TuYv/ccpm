---
name: fabriciq-ontology-authoring-cli
description: 'Create and evolve Fabric IQ Ontology (preview) items from CLI — define entity types, properties (including timeseries), relationship types, and bind them to OneLake lakehouse tables (static + timeseries) or Eventhouse / KQL database tables (timeseries only). Uses the Fabric item-definition REST API (Create Item / Update Item Definition) with `InlineBase64` parts. Use to create a Fabric Ontology item; add or alter entity types, properties, or keys; add timeseries properties and bindings; bind an entity type to a lakehouse or Eventhouse table; add relationship types and contextualizations; or script ontology deployment from source. Triggers: "create fabric ontology", "add ontology entity type", "bind entity type to lakehouse", "bind entity type to eventhouse", "ontology timeseries binding", "add ontology relationship type", "ontology contextualization", "fabric iq ontology authoring", "update ontology definition"'
---
> **更新检查 — 每个会话仅执行一次（必需）**
> 在会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能（例如 `/fabric-skills:check-updates`）。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：读取本地 `package.json` 版本，然后通过 `git fetch origin main --quiet && git show origin/main:package.json`（或 GitHub API）与远程版本进行比较。如果远程版本较新，请显示变更日志和更新说明。
> - 如果本次会话之前已经执行过此检查，则跳过。

> **关键说明**
> 1. Ontology 目前处于**预览版**。项类型值为 `Ontology`。功能和传输格式可能会发生变化；在生产环境中使用前，请根据当前文档进行验证。
> 2. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区并使用 JMESPath 筛选。
> 3. 要根据工作区 ID、项类型（`Ontology`）和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项并使用 JMESPath 筛选。
> 4. 创作关系类型需要本体中已存在的**两个不同实体类型**。`source.entityTypeId` 和 `target.entityTypeId` 的值是**你分配的实体类型 ID**，而不是项 ID。
> 5. 数据绑定通过 `workspaceId`、`itemId`、`sourceTableName` 以及（对于湖仓源）`sourceSchema` 引用源表。Lakehouse（`LakehouseTable`）源携带湖仓项 ID；Eventhouse（`KustoTable`）源携带 **Eventhouse 项 ID**，以及 `clusterUri` 和 `databaseName`。源端的键列必须与实体类型的键属性匹配。Eventhouse 源仅支持 `TimeSeries`；静态（`NonTimeSeries`）绑定必须来自湖仓。

# fabriciq-ontology-authoring-cli — 通过 CLI 创作 Fabric Ontology

## 目录

| 任务                                           | 参考                                                                                                                                              | 说明                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 在 Fabric 中查找工作区和项         | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)                            | **必需** — 创作前解析工作区/项 ID                  |
| Fabric 拓扑与关键概念                 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts)                                           | 工作区 → 项层次结构                                                   |
| 身份验证与令牌获取             | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition)                                   | 对控制平面使用 `https://api.fabric.microsoft.com` 受众            |
| 核心控制平面 REST API                   | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis)                                              | 创建项、获取/更新项定义                                      |
| 长时间运行的操作（LRO）                  | [COMMON-CORE.md § 长时间运行的操作（LRO）](../../common/COMMON-CORE.md#long-running-operations-lro)                                              | 创建/更新项会返回 LRO                                            |
| 速率限制与节流                     | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling)                                                   |                                                                              |
| 身份验证操作指南                         | [COMMON-CLI.md § 身份验证操作指南](../../common/COMMON-CLI.md#authentication-recipes)                                                            | `az login`；令牌获取                                                |
| 通过 `az rest` 使用 Fabric 控制平面 API         | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)                                | **始终**传递 `--resource https://api.fabric.microsoft.com`                |
| 长时间运行的操作（LRO）模式          | [COMMON-CLI.md § 长时间运行的操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)                                | 对于 Ontology 创建/更新，请在 Fabric 主机上轮询 `/v1/operations/{x-ms-operation-id}` — 请参阅 [LRO 标头捕获](#lro-header-capture-with-az-rest) |
| 注意事项与故障排除（CLI 特定）       | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific)                           | 令牌受众、shell 转义                                               |
| `az rest` 模板                             | [COMMON-CLI.md § `az rest` 模板](../../common/COMMON-CLI.md#az-rest-template)                                                                      |                                                                              |
| 定义信封（parts、payloadType）       | [ITEM-DEFINITIONS-CORE.md § 定义信封](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope)                                            | 用于 Ontology 的 `InlineBase64` parts 模式                               |
| Ontology 定义参考                  | [ONTOLOGY-AUTHORING-CORE.md § 定义树](references/ONTOLOGY-AUTHORING-CORE.md#definition-tree)                                                | Ontology 项的权威文件/文件夹布局                       |
| EntityType 与 EntityTypeProperty 架构         | [ONTOLOGY-AUTHORING-CORE.md § EntityType 文件](references/ONTOLOGY-AUTHORING-CORE.md#entitytype-file--entitytypesiddefinitionjson)                   | 允许的 `valueType` 值、键约束、名称正则表达式                      |
| DataBinding 架构与源类型映射       | [ONTOLOGY-AUTHORING-CORE.md § DataBinding 文件](references/ONTOLOGY-AUTHORING-CORE.md#databinding-file--entitytypesiddatabindingsguidjson)           | Lakehouse 和 Eventhouse 结构；值类型映射；绑定规则             |
| RelationshipType 与 Contextualization 架构    | [ONTOLOGY-AUTHORING-CORE.md § RelationshipType 文件](references/ONTOLOGY-AUTHORING-CORE.md#relationshiptype-file--relationshiptypesiddefinitionjson) | 源/目标约束、链接表要求                           |
| Ontology 概念                              | [SKILL.md § Ontology 项概念](#ontology-item-concepts)                                                                                           | 实体类型、属性、绑定、关系类型                       |
| 工具栈                                     | [SKILL.md § 工具栈](#tool-stack)                                                                                                                   |                                                                              |
| 连接                                     | [SKILL.md § 连接](#connection)                                                                                                                   | 发现工作区、湖仓和 Ontology ID                                  |
| 创作范围                                | [SKILL.md § 创作范围](#authoring-scope)                                                                                                         | 支持的操作概览                                             |
| 创作机制（完整参考）           | [authoring-mechanics.md](references/authoring-mechanics.md)                                                                                            | 信封、ID、创建、实体类型、绑定、关系、更新、验证 |
| 完整示例                                | [examples.md](references/examples.md)                                                                                                                  | 端到端 bash 操作指南（创建 → 绑定 → 关系 → 时间序列）          |
| 预览并确认（LRO 写入前必需） | [preview-and-confirm.md](references/preview-and-confirm.md)                                                                                            | ASCII 方案（全新创建）/变更集差异（现有环境）                   |
| 脚本模板                               | [definition-script-templates.md](references/definition-script-templates.md)                                                                            | Bash / PowerShell 获取-修改-发送脚手架                                |
| 必须 / 建议 / 避免 / 故障排除        | [SKILL.md § 必须 / 建议 / 避免 / 故障排除](#must--prefer--avoid--troubleshooting)                                                            | LLM 决策规则                                                           |
| 智能体工作流                              | [SKILL.md § 智能体工作流](#agentic-workflows)                                                                                                     | 先探索后创作、脚本生成                              |
| 智能体集成说明                        | [SKILL.md § 智能体集成说明](#agent-integration-notes)                                                                                         | 此技能如何与智能体/其他技能组合                           |

---

## 本体项概念

Fabric 本体项在项定义中以 **JSON 文件树** 的形式创作。每个文件都作为一个部件包含在创建/更新定义信封的 `parts[]` 数组中（payloadType 为 `InlineBase64`）。

| 概念 | 定义文件路径 | 用途 |
|---|---|---|
| 本体信封 | `definition.json` | 空的 `{}`；必需 |
| 平台元数据 | `.platform` | `{ "metadata": { "type": "Ontology", "displayName": "<name>" } }` |
| 实体类型 | `EntityTypes/{entityTypeId}/definition.json` | 名称、命名空间、键、显示名称属性、properties[]、timeseriesProperties[] |
| 实体类型数据绑定 | `EntityTypes/{entityTypeId}/DataBindings/{guid}.json` | 将湖仓 **或事件仓** 表映射到属性；`dataBindingType` = `NonTimeSeries` 或 `TimeSeries`。仅当类型为 `TimeSeries` 时，才允许使用事件仓（`KustoTable`）源 |
| 实体类型文档 | `EntityTypes/{entityTypeId}/Documents/{name}.json` | 可选的文档链接 |
| 实体类型概览 | `EntityTypes/{entityTypeId}/Overviews/definition.json` | 可选的小组件布局 |
| 实体类型资源链接 | `EntityTypes/{entityTypeId}/ResourceLinks/definition.json` | 可选的 Power BI/项链接 |
| 关系类型 | `RelationshipTypes/{relTypeId}/definition.json` | 源实体类型 ID 和目标实体类型 ID、名称 |
| 关系上下文化 | `RelationshipTypes/{relTypeId}/Contextualizations/{guid}.json` | 将源键和目标键绑定到湖仓表 |

属性 `valueType` 允许使用的值（精确匹配）为：`String`、`Boolean`、`DateTime`、`Object`、`BigInt`、`Double`。整数应使用 `BigInt`，**而不是** `Int64`；不存在 `Guid` 值类型（应将 GUID 建模为 `String`）。时序绑定需要一个时间戳列（源类型为 `datetime` / `date` / `timestamp`），以及一个带有 `timestampColumnName` 的 `TimeSeries` 绑定。有关完整的源列到 `valueType` 映射，请参阅 [ONTOLOGY-AUTHORING-CORE.md § EntityTypeProperty](references/ONTOLOGY-AUTHORING-CORE.md#entitytypeproperty)。

> **⚠️ 在单个实体类型中，属性名称在 `properties[]` 和 `timeseriesProperties[]` 两者之间必须唯一**。如果湖仓表和事件仓表都包含同名列（例如 `tenant_id`），则**必须**重命名其中一个本体属性，以避免冲突。绑定中的 `sourceColumnName` 仍可指向原始列——只有本体属性的 `name` 必须唯一。例如，可将静态属性保留为 `TenantId`，并将时序属性命名为 `TsTenantId`。
>
> **⚠️ 不同实体类型中具有相同 `name` 的属性必须具有相同的 `valueType`**——本体会在整个定义中强制实施名称级别的类型一致性。如果 `SerialNum` 在一个实体类型上为 `String`，则不能在另一个实体类型上为 `BigInt`。应在所有位置使用相同的 `valueType`，或使用前缀加以区分（例如 `SerialNumStr` 与 `SerialNumInt`）。
>
> **⚠️ 部件路径必须始终使用正斜杠**（`EntityTypes/{id}/definition.json`），绝不能使用反斜杠。在 Windows 上，PowerShell 路径连接运算符（`Join-Path`、`\`）会生成反斜杠，导致 Fabric API 以 `ALMOperationBadRequest` 拒绝请求。始终使用 `/` 通过字符串插值构建部件路径。

---

## 工具栈

本体创作使用与其他所有 CLI 技能相同的 Fabric 控制平面工具栈——有关规范列表（安装命令、先决条件检查、base64 辅助工具、JSON 工具），请参阅 [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale)；有关 `az login` 和令牌获取，请参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)。

以下本体专用工具指南仅涵盖会影响 `createItem` / `updateDefinition` 有效负载的注意事项。

> **⚠️ PowerShell `ConvertTo-Json` 警告**：PowerShell 的 `ConvertTo-Json` 可能会静默地重新排列键，并以不同于 JSON `null` 的方式序列化 `$null`，从而可能导致 `updateDefinition` 出现 `ALMOperationImportFailed` 错误。为避免此问题：
>
> 1. **始终使用 `[System.IO.File]::WriteAllText`** 并配合 `[System.Text.UTF8Encoding]::new($false)` 写入 JSON 文件——`Out-File` 和 `Set-Content` 会添加 BOM，从而损坏有效负载。
> 2. 尽可能**使用 `jq` 构建 JSON**，而不是使用 `ConvertTo-Json`——`jq -nc` 可生成确定性的紧凑 JSON，且不会受到 PowerShell 序列化特性的影响：
>    ```powershell
>    $json = '{}' | jq -nc --arg id "$ET_ID" --arg name "Site" '{id:$id,name:$name}'
>    ```
> 3. 发送前**验证** JSON：`Get-Content envelope.json | jq .`——如果 `jq` 执行失败，则表示有效负载格式有误。
> 4. 对 `ConvertTo-Json` **使用 `-Depth 10`**——默认深度为 2，会静默截断嵌套对象。

> **⚠️ 避免对 `InlineBase64` 部件使用 `certutil -encode`。** 它的输出包含换行以及页眉/页脚，必须经过后处理才能使用。在 Windows 上，请改用 PowerShell 的 `[Convert]::ToBase64String([IO.File]::ReadAllBytes($path))`。

---

## 连接

本体创作以 Fabric 控制平面为目标。在编写定义之前，你需要：`WS_ID`（工作区）、`LH_ID`（用于静态绑定和 Lakehouse 时序绑定的 Lakehouse 项目 ID），以及——对于由 Eventhouse 支持的时序绑定——Eventhouse 项目 ID、KQL 群集 URI 和 KQL 数据库名称。

- 登录并获取 Fabric 控制平面令牌 → [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)（始终使用 `--resource https://api.fabric.microsoft.com`）。
- 按 `displayName` 解析工作区、文件夹、Lakehouse 和本体项目 ID → [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)（涵盖分页和 JMESPath 筛选）。
- 通用 `az rest` 调用模板 → [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)。

下面介绍本体特有的解析注意事项（文件夹 GUID 与门户数字 ID 的区别、Eventhouse ID 字段映射、绑定的架构发现，以及在预览重定向主机上捕获 LRO 标头）。

### 文件夹（本体特有的注意事项）

本体创建有效负载中的 `folderId` 字段需要的是**文件夹 GUID**，而不是门户 URL 中显示的数字 `subfolderId`。传入门户数字会失败并返回 `400 InvalidParameter … cannot convert "<numeric>" to Guid … Path 'folderId'`。请通过列出 `GET /v1/workspaces/{WS_ID}/folders`（参见 [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)）来解析 GUID，并按 `displayName` 进行筛选。

### Eventhouse / KQL 数据库（用于 TimeSeries 绑定）

由 Eventhouse 支持的本体 `TimeSeries` 绑定要求在 `KustoTable` 数据绑定有效负载中包含三个字段——这些字段来自 `GET /v1/workspaces/{WS_ID}/kqlDatabases` 返回的 KQL 数据库记录：

| KustoTable 绑定字段 | KQL 数据库记录中的源字段 |
|---|---|
| `itemId`        | `properties.parentEventhouseItemId` — **Eventhouse 项 ID，而不是 KQL 数据库自身的 `id`** |
| `clusterUri`    | `properties.queryServiceUri` |
| `databaseName`  | `displayName`（使用 API 返回的规范大小写形式） |

> **Eventhouse 表只能支持 `TimeSeries` 绑定。**实体类型的静态（`NonTimeSeries`）绑定仍必须来自托管 Lakehouse 表。

> **常见错误**：将 KQL 数据库自身的 `id` 作为 `KustoTable.itemId` 传递。请使用同一记录中的 `parentEventhouseItemId`。

有关通用的 `kqlDatabases` 列表调用（分页 + 按 `displayName` 进行 JMESPath 筛选），请参阅 [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)。

### 架构发现

在编写绑定之前，请先发现源表架构，以便映射正确的列名。**请使用配套技能进行架构发现**——它们比原始 REST 调用更快、更可靠。

- **Lakehouse 表** → 转交给 `sqldw-consumption-cli` 技能，并针对 Lakehouse SQL 终结点查询 `INFORMATION_SCHEMA.COLUMNS`（一次查询即可返回所有表和列）。如果不可用，则回退到 Fabric Tables REST API，并结合使用 OneLake Table API 获取 Iceberg 元数据。
- **Eventhouse / KQL 表** → 转交给 `eventhouse-consumption-cli` 技能，并运行 `.show database schema as json`（在单个响应中返回每个表和列）。对于单个表，请使用 `.show table <name> schema as json`。

使用此处返回的列类型填写每个 `EntityTypeProperty` 的 `valueType`——请参阅 [ONTOLOGY-AUTHORING-CORE.md § EntityTypeProperty](references/ONTOLOGY-AUTHORING-CORE.md#entitytypeproperty) 中的源列 → `valueType` 映射。

### 使用 `az rest` 捕获 LRO 标头

默认情况下，`az rest` 不会公开响应标头。`createItem` 和 `updateDefinition` 都会返回带有 `x-ms-operation-id` 标头（以及 `Location` 标头）的 **202 Accepted**。请使用 `--verbose` 并解析 stderr 以捕获操作 ID：

> **对于本体创建/更新，优先使用 `x-ms-operation-id` 进行轮询，而不是使用原始 `Location` 标头。**公共 [Fabric LRO 约定](https://learn.microsoft.com/en-us/rest/api/fabric/articles/long-running-operation) 支持通过 `Location` 标头或 `https://api.fabric.microsoft.com/v1/operations/{operationId}`（来自 `x-ms-operation-id`）进行轮询。在**当前的本体预览行为**中，观察到的 `Location` 值指向 `analysis.windows.net` 重定向主机（例如 `https://df-…-redirect.analysis.windows.net/v1/operations/{id}`），而不是 `api.fabric.microsoft.com`；使用 `az rest --resource https://api.fabric.microsoft.com` 轮询该 URL 会针对错误的受众重新进行身份验证，并以 401/403 失败——这会隐藏 LRO 状态/错误，并导致盲目重试循环。因此，请捕获 `x-ms-operation-id`，并轮询 `https://api.fabric.microsoft.com/v1/operations/{operationId}`（Fabric 主机、Fabric 令牌）。如果确实要跟随 `Location`，请使用该 URL 所要求的受众。

```bash
# Bash — capture x-ms-operation-id from az rest --verbose stderr
OP_ID=$(az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/items" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body @envelope.json --verbose 2>&1 \
  | grep -oiP "(?<=x-ms-operation-id': ')[^']+")

# Poll the Fabric operations endpoint (stays on api.fabric.microsoft.com)
while :; do
  OP=$(az rest --method GET \
    --url "https://api.fabric.microsoft.com/v1/operations/${OP_ID}" \
    --resource "https://api.fabric.microsoft.com")
  STATUS=$(printf '%s' "$OP" | jq -r .status)
  case "$STATUS" in
    Succeeded) break ;;
    Failed|Cancelled)
      # Read the error and FIX the payload — never blind-retry the same body.
      printf '%s' "$OP" | jq -r '.error | "\(.errorCode // .code): \(.message)"' >&2
      exit 1 ;;
    *) sleep 5 ;;
  esac
done
```

```powershell
# PowerShell — capture x-ms-operation-id from az rest --verbose stderr
$result = az rest --method POST `
  --resource "https://api.fabric.microsoft.com" `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/items" `
  --headers "Content-Type=application/json" `
  --body "@envelope.json" --verbose 2>&1
$opId = ($result | Select-String -Pattern "x-ms-operation-id': '([^']+)'" |
  ForEach-Object { $_.Matches[0].Groups[1].Value })

# Poll the Fabric operations endpoint (stays on api.fabric.microsoft.com)
do {
  Start-Sleep -Seconds 5
  $op = az rest --method GET `
    --url "https://api.fabric.microsoft.com/v1/operations/$opId" `
    --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json
} while ($op.status -notin 'Succeeded','Failed','Cancelled')
if ($op.status -ne 'Succeeded') {
  # Read .error and FIX the payload — never blind-retry the same body.
  throw "createItem LRO $($op.status): $($op.error.errorCode) $($op.error.message)"
}
```

> **重要提示**：`createItem` 返回 202，且**没有响应正文**——`az rest` 以代码 0 退出且不输出任何内容。这是正常现象。操作达到 `Succeeded` 状态后，列出项目以获取新项目 ID。如果 `status` 为 `Failed`，`error` 字段会指出原因（例如实体类型部分格式错误）——请修复负载并提交更正后的请求，而不是重新发送相同的正文。

---

## 创作范围

| 操作 | Fabric REST 调用 | 涉及的定义部分 |
|---|---|---|
| 创建空本体 | `POST /v1/workspaces/{ws}/items`，其中 `type=Ontology` | `.platform`、`definition.json` |
| 添加/修改实体类型 | `POST /v1/workspaces/{ws}/items/{id}/updateDefinition` | `EntityTypes/{id}/definition.json` |
| 将实体类型绑定到表（非时序） | `updateDefinition` | `EntityTypes/{id}/DataBindings/{guid}.json`，使用 `NonTimeSeries` |
| 将实体类型绑定到表（时序） | `updateDefinition` | `EntityTypes/{id}/DataBindings/{guid}.json`，使用 `TimeSeries` + `timestampColumnName` |
| 添加关系类型 | `updateDefinition` | `RelationshipTypes/{id}/definition.json` |
| 绑定关系（上下文化） | `updateDefinition` | `RelationshipTypes/{id}/Contextualizations/{guid}.json` |
| 删除实体/关系 | `updateDefinition`，从 parts 中省略相应路径 | — |
| 重命名本体 | `updateDefinition`，其中 `updateMetadata=true` 并包含新的 `.platform` | `.platform` |

> **更新项定义会替换所包含部件的完整树。** 请始终通过 `Get Item Definition` 获取当前定义，在本地修改部件，然后重新发送完整的所需集合。

---

## 编写参考

每项操作的完整 JSON 结构、字段约定和验证方法请参阅 [authoring-mechanics.md](references/authoring-mechanics.md)。完整的端到端 Bash 示例请参阅 [examples.md](references/examples.md)。可使用以下各节作为快速索引：

| 主题 | 参考 |
|---|---|
| 定义信封（`parts[]`、`InlineBase64`、base64 辅助函数） | [authoring-mechanics.md § 定义信封](references/authoring-mechanics.md#definition-envelope-for-ontology) |
| ID 生成（64 位整数、GUID、`name → id` 映射） | [authoring-mechanics.md § ID 生成模式](references/authoring-mechanics.md#id-generation-pattern) |
| 创建空本体 | [authoring-mechanics.md § 创建本体项](references/authoring-mechanics.md#create-the-ontology-item) |
| 添加实体类型 | [authoring-mechanics.md § 添加实体类型](references/authoring-mechanics.md#add-an-entity-type) |
| 绑定到 lakehouse / eventhouse | [authoring-mechanics.md § 绑定实体类型](references/authoring-mechanics.md#bind-an-entity-type-to-a-lakehouse-or-eventhouse-table) |
| 关系类型 + 上下文化 | [authoring-mechanics.md § 添加关系类型](references/authoring-mechanics.md#add-a-relationship-type) |
| 应用定义更新（获取 → 修改 → 发送） | [authoring-mechanics.md § 应用定义更新](references/authoring-mechanics.md#apply-a-definition-update) |
| 验证和检查 | [authoring-mechanics.md § 验证和检查](references/authoring-mechanics.md#verify-and-inspect) |
| 完整的 Bash / PowerShell 脚手架 | [definition-script-templates.md](references/definition-script-templates.md) |

**编写时需牢记的核心不变量（完整细节请参阅参考文件）：**

- 信封结构：`{ "displayName", "type": "Ontology", "definition": { "parts": [ { "path", "payload", "payloadType": "InlineBase64" } ] } }`；`definition.json` 的内容就是 `{}`；`.platform` 包含 `metadata.type: "Ontology"` + `displayName`。
- ID：实体 / 关系 / 属性 ID 是**正 64 位整数**，数据绑定 / 上下文化 ID 是 **GUID**。将 `name → id` 映射持久化到源代码管理中；绝不要将同一个 ID 复用于不同的概念。

**ID 映射模板** — 将其与部署脚本一起持久化（JSON 或 YAML）：

```json
{
  "ontologyName": "SkillTest_Fleet",
  "entityTypes": {
    "Site":      { "id": "1048860412765431174", "properties": { "SiteId": "1428056703884423742", "SiteName": "4251708967918658190" } },
    "Equipment": { "id": "3332700945676096991", "properties": { "EquipmentId": "4585483423451989345" } }
  },
  "relationshipTypes": {
    "EquipmentAtSite": { "id": "4242053467032157032" }
  },
  "bindings": {
    "Site_static":      "25e3a44a-b62a-40e3-a64a-a43caaa92d19",
    "Equipment_static": "5dc4cadd-3700-4c96-bb1e-41e4c909ae4d"
  }
}
```
- 绑定：`NonTimeSeries` **仅适用于 lakehouse**，且每个实体类型最多只能有一个；在同一实体类型上进行任何 `TimeSeries` 绑定**之前**，必须先存在一个 `NonTimeSeries` 绑定；`TimeSeries` 可以绑定到 lakehouse 或 Eventhouse；对于 `KustoTable`，`itemId` 是 **Eventhouse 项 ID**（而不是 KQL 数据库 ID）。
- 关系：`source.entityTypeId` 和 `target.entityTypeId` 必须不同，并且必须引用部件树中存在的实体类型。
- 更新会整体替换所包含的部件 — **始终**先获取当前定义，在本地修改，然后发送。

---

## 必须 / 建议 / 避免 / 故障排除

### 必须

- **路由到此处之前，必须要求提供明确的本体上下文** — 提示词必须要求创建或更改“本体”（或引用某个本体项）。没有本体上下文的通用“Fabric IQ”提示词不属于本体创作任务；应将其交由匹配的技能处理。这样可避免共享的“Fabric IQ”品牌过度触发此技能。
- **对于含糊的提示词，必须先澄清再操作** — 绝不能推断架构或绑定。如果用户说“为航空公司数据创建一个本体”，但没有指定实体类型、实体键或湖仓表，应询问需要哪些实体、哪些键以及哪些湖仓表。不可逆的副作用（替换本体定义）需要用户明确表达意图。
- **在编写任何绑定之前解析 `WS_ID` 和源项 ID** — 硬编码 GUID 是排名前三的故障原因之一。湖仓绑定需要湖仓的 `itemId`；事件仓绑定需要事件仓的 `itemId`、群集 URI 和数据库名称。
- **任何更新前都要获取当前定义** — `updateDefinition` 会整体替换所包含的部分。与过时的本地状态合并会悄无声息地丢弃近期更改。应处理 `getDefinition` 返回的 LRO 202（轮询并通过操作的 `result` 端点获取结果）。
- **持久化 `name → id` 映射**，包括实体类型、关系类型和属性，并将其与技能使用方的仓库一起纳入源代码管理。每次运行时重新生成 ID 会造成重复并破坏引用。
- **在实体类型上添加任何时间序列绑定之前，先添加静态 (`NonTimeSeries`) 绑定** — 每种实体类型最多支持一个静态绑定，而时间序列绑定要求静态键属性已经填充。
- **只能绑定到托管湖仓表** — 不支持外部表、已启用 OneLake 安全性的湖仓，以及已启用列映射的 Delta 表。
- **确保每个实体类型中的属性名称在 `properties[]` 和 `timeseriesProperties[]` 之间唯一**。当湖仓表和 Eventhouse 表包含同名列（例如 `tenant_id`、`device_id`）时，应重命名本体时间序列属性（例如 `TsTenantId`），同时让 `sourceColumnName` 继续指向原始列。属性名称重复会导致 `ALMOperationImportFailed`。
- **观察结果（预览版）：将实体键 (`entityIdParts`) 限制为 `valueType` 为 `String` 或 `BigInt` 的属性** — 根据当前预览版行为，其他值类型尚不能被接受为键。此限制未记录在公开的 Microsoft Learn 中；在依赖它之前，请针对你的租户进行验证。
- **在所有部分路径中使用正斜杠** — `EntityTypes/{id}/definition.json`，绝不能使用 `EntityTypes\{id}\definition.json`。在 Windows 上，`Join-Path` 和 `\` 会生成 Fabric API 拒绝的反斜杠路径。请使用字符串插值构建路径：`"EntityTypes/$ET_ID/definition.json"`。
- **验证权限** — 创作至少需要工作区的 `Contributor` 权限。
- **在信封的 `type` 和 `.platform` 元数据中，都将项类型设为 `Ontology`**（而不是 `OntologyPreview` 或类似类型）。
- **在每次 LRO 写入之前呈现“预览并确认”关卡** — 呈现 ASCII 提案（全新创建）或与 `getDefinition` 相比的变更集差异（现有项目修改），并在调用 `createItem` 或 `updateDefinition` 之前获得用户明确的 `yes`。请参阅 [preview-and-confirm.md](references/preview-and-confirm.md)。除 `yes` 之外的任何回复都意味着停止并修改；绝不能只应用部分更改。

### 推荐

- **在磁盘上构建定义树**（每个逻辑部分对应一个 JSON 文件，并镜像 `EntityTypes/{id}/...` 布局），仅在发送前对每个文件进行 base64 编码。这样可确保差异易于审查。
- **在接入时从现有且确认可用的本体的 `getDefinition` 转储开始**，然后再进行修改。
- **静态绑定优先使用 Lakehouse；时序数据使用 Eventhouse** — OneLake（Lakehouse）是 `NonTimeSeries` 绑定唯一受支持的数据源。对于 `TimeSeries` 绑定中的大规模遥测数据，请使用 Eventhouse（`KustoTable`）；如果团队倾向于只使用一种数据源类型，也可以将数据镜像或创建快捷方式至 Lakehouse 表。
- **幂等部署脚本** — 使用未发生变化的输入重新运行脚本时，应生成未发生变化的本体。
- **涉及多个实体类型或环境时，使用脚本化工作流而不是 UI**。
- **在上游数据写入后触发手动图模型刷新** — 在刷新本体之前，绑定数据源中的新行不会显示在预览体验中。

### 避免

- **生成单体式 `.ps1` 或 `.sh` 脚本文件** — 应直接在 shell 中执行命令。大型生成脚本容易引入转义错误和 PowerShell 解析错误，并且在某一行失败时难以调试。使用 `jq -nc` 构建 JSON，将其写入临时文件，然后通过 `az rest --body @file` 传递。
- **手动编辑 base64 负载** — 始终先解码，再编辑 JSON，最后重新编码。
- **将某个属性、实体或关系 ID 复用于不同的概念**。
- **依赖本体范围之外的关系名称唯一性** — 目前观察到的行为是，关系名称在一个本体内似乎必须唯一；请预先收集所需关系名称的完整集合，以便必要时使用前缀消除歧义。应与使用方确认命名冲突，而不是自行猜测。
- **在 `.platform` 或任何其他部分中嵌入机密、SAS 令牌或用户令牌**。
- **在源实体类型和目标实体类型出现在部件列表中之前创建关系类型**。
- **将 `Object` / JSON 属性视为完全可查询** — 目前观察到的行为是，绑定到 `Object` 属性的嵌套 JSON 会呈现为不透明负载，无法像标量一样寻址。对于嵌套负载，请将原始数据保留在 Eventhouse 中，并仅绑定可寻址的标量字段。在向下游使用方承诺特定查询结构之前，请通过 `getDefinition` 往返验证。
- **依赖“通过省略来删除”** — 观察到未包含在 `updateDefinition` 请求体中的部件会被移除，但此技能应告知用户该操作具有破坏性，并在生成会丢弃部件的信封之前进行确认。

### 故障排除

| 症状 | 可能原因 | 修复方法 |
|---|---|---|
| 创建时出现 `400 Bad Request` — “无效的项目类型” | 项目类型字符串错误 | 在 `.platform` 中使用 `"type": "Ontology"` 和 `metadata.type: Ontology` |
| 使用 `type: Ontology` 调用 createItem 时出现 `400 InvalidItemType` | 租户或工作区未启用 Fabric IQ Ontology（预览版） | 向用户说明此问题 — **不要**重试。必须在租户级别注册本体预览版。 |
| 创建时出现 `400 InvalidParameter` — `Error converting value "<number>" to … Guid … Path 'folderId'` | 传入了门户 URL 中的数字 `subfolderId`，而不是文件夹 GUID | 通过 `GET /v1/workspaces/{WS_ID}/folders` 解析文件夹 GUID（参见“连接”§“文件夹”），然后传入该 GUID |
| 属性出现 `400` — “无效的值类型” | 使用 `Int64` / `Guid` / `Float` 作为 `valueType` | 允许的值仅为 `String`、`Boolean`、`DateTime`、`Object`、`BigInt`、`Double` |
| 实体类型或属性出现 `400` — “无效的标识符” | 名称违反正则表达式 | 匹配 `^[a-zA-Z][a-zA-Z0-9_-]{0,127}$`；为保持可移植性，建议遵循门户更严格的 1–26 个字符规则 |
| `400` — “源和目标必须不同” | 关系的两端指向同一个实体类型 | 选择不同的源实体类型和目标实体类型 |
| `400` — “未找到引用的属性” | `targetPropertyId` 与实体类型中的任何属性都不匹配 | 检查 ID；确保该属性已在同一次更新中添加 |
| `400` — “时序绑定需要已有的静态绑定” | 在实体类型的静态绑定之前添加了时序绑定 | 先添加包含键属性的 `NonTimeSeries` 绑定，然后再添加 `TimeSeries` 绑定 |
| `400` — 键列问题 | 键属性的 `valueType` 不是 `String` 或 `BigInt` | 将该属性改为 `String` / `BigInt`，或选择其他键 |
| 绑定时出现 `404` | `workspaceId` / `itemId` 错误，或源项目已被删除 | 通过 `list items` / `list lakehouses` / `list eventhouses` 重新解析 ID |
| 绑定已接受，但未显示任何实例 | 数据源是外部表、使用列映射的 Delta 表，或已启用 OneLake 安全性 | 将表重建为不使用列映射的托管 Delta 表；移除 Lakehouse 上的 OneLake 安全性 |
| 绑定后实例为空 | `propertyBindings` 中的列名与源列不匹配 | 检查源架构，并修正 `sourceColumnName` / `sourceSchema` |
| 上游新行未显示 | 未执行刷新 | 对本体项目触发手动图模型刷新 |
| 时序小组件未显示数据 | 未设置 `timestampColumnName`，或时间戳列不是受支持的日期/时间类型 | 在 TimeSeries 绑定中设置 `timestampColumnName`；确保列类型为 `datetime` / `date` / `timestamp` |
| `getDefinition` 返回 `200` 或 `202` | 支持 LRO 的响应（可能是内联信封或操作 ID） | 如果为 `202`，轮询操作直至 `Succeeded`，然后执行 `GET https://api.fabric.microsoft.com/v1/operations/{operationId}/result`；如果为 `200`，直接解析返回的信封 — 参见 [LRO 标头捕获](#lro-header-capture-with-az-rest) |
| LRO 轮询返回 `401`/`403`，或 `Location` 标头的主机为 `*.analysis.windows.net` | 创建/更新操作的 `Location` 重定向到 Analysis Services 主机；使用 `az rest --resource https://api.fabric.microsoft.com` 对其进行轮询时，会针对错误的受众重新进行身份验证 | 在 Fabric 主机上轮询 `https://api.fabric.microsoft.com/v1/operations/{x-ms-operation-id}`，而不是跟随 `Location` URL — 参见 [LRO 标头捕获](#lro-header-capture-with-az-rest)。轮询失败时，不要盲目重试创建操作 |
| `updateDefinition` 出现 `Conflict` | 与门户中的编辑操作并发冲突 | 重新获取定义、重新应用修改，然后再次发送 |
| `updateDefinition` 出现 `ALMOperationImportFailed` | JSON 负载格式错误 — 通常由 PowerShell `ConvertTo-Json` 序列化特性引起（`$null` 与 `null`、键重新排序、文件中存在 BOM） | 使用 `jq -nc` 而不是 `ConvertTo-Json` 构建 JSON；使用 `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` 写入文件以避免 BOM；发送前使用 `jq .` 进行验证 — 参见 [工具栈 § PowerShell 警告](#tool-stack) |
| `createItem` 或 `updateDefinition` 出现 `ALMOperationImportFailed` — 属性名称重复 | 同一实体类型的 `properties[]` 和 `timeseriesProperties[]` 中出现了相同的属性名称 | 两个数组中的属性名称必须保持唯一。如果 Lakehouse 表和 Eventhouse 表共享某个列名，请重命名时序本体属性（例如 `TenantId` → `TsTenantId`）— 绑定的 `sourceColumnName` 仍可引用原始列 |
| `ALMOperationImportFailed` — “属性 ‘X’ 的值类型存在冲突” | 相同的属性 `name` 出现在两个不同的实体类型中，但其 `valueType` 值不同（例如一个为 `String`，另一个为 `BigInt`） | 属性名称在整个本体中必须唯一 — 如果两个实体类型共享同一个属性名称，则两者必须使用相同的 `valueType`。使用前缀消除歧义（例如 `SerialNumStr` 与 `SerialNumInt`），或统一类型 |
| `ALMOperationBadRequest` — “目录名称……对 EntityType 无效” | 部件 `path` 使用反斜杠（`EntityTypes\\{id}\\definition.json`），而不是正斜杠 | 部件路径始终使用正斜杠：`EntityTypes/{id}/definition.json`。在 Windows 上，不要对部件路径使用 `Join-Path` 或 `\` — 应使用包含 `/` 的字符串插值 |
| `createItem` 返回退出代码 0，但无输出 | 正常现象 — `createItem` 返回无响应体的 `202 Accepted`；`az rest` 将其视为成功 | 在 LRO 完成后列出项目，以获取新项目 ID；使用 `--verbose` 捕获用于 LRO 轮询的 `x-ms-operation-id` 标头 |
| `createItem` 出现 `409 ItemDisplayNameAlreadyInUse` | 工作区中已存在具有相同 `displayName` 的本体 | 先列出现有本体；删除或重命名现有本体，或选择其他名称 |
| `definition.json` 负载导致导入错误 | base64 负载中存在额外空白、BOM 或换行符 | `definition.json` 必须严格为 `{}` — 其 base64 为 `e30=`。在 Windows 上，使用带有 `UTF8Encoding($false)` 的 `[System.IO.File]::WriteAllText`，确保不包含 BOM |

---

## 智能体工作流

> **⚠️ 请勿生成单体式 `.ps1` / `.sh` 脚本文件。** 应将每个步骤作为独立命令直接在 shell 中执行。生成大型脚本文件会引入难以调试的转义错误、解析错误和属性访问问题。应改为：
> - 直接在终端中运行 `az rest`、`jq` 和 PowerShell 命令
> - 使用 `jq -nc` 逐步构建 JSON 负载，并通过变量进行传递
> - 将最终信封写入临时文件，然后通过 `az rest --body @file` 传递
> - 如果某个步骤失败，请修复后重新运行——不要重新生成整个脚本

### 编写前的探索

> **全新构建与存量更新的执行策略：**
>
> - **全新构建（新本体）**：通过一次 `createItem` 调用构建**完整**定义——实体类型、绑定、关系、上下文化和时间序列，并将所有部分放入同一个信封中。这样速度更快，也能避免中间状态。`createItem` 负载接受完整的 `definition.parts[]` 数组，而不只是 `.platform` 和 `definition.json`。
> - **存量更新（更新现有本体）**：**增量**执行——获取当前定义、进行修改并发送。每次执行 `updateDefinition` 后，都使用 `getDefinition` 进行验证，以便尽早发现错误。如果中途失败，之前的进度仍会保留。

#### 并行发现架构

当本体绑定到**多个数据源**（Lakehouse 表和 Eventhouse 表）时，应并行而非顺序地发现架构。启动多个并发运行的独立发现任务：

```text
┌─────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR (this skill)                                       │
│                                                                   │
│  Step 0 → Resolve workspace, folder, lakehouse ID, eventhouse ID │
│                                                                   │
│  Step 1 → Fan out schema discovery (parallel):                   │
│     ┌──────────────────────────┐  ┌────────────────────────────┐ │
│     │ TASK A: Lakehouse schemas │  │ TASK B: Eventhouse schemas │ │
│     │ sqldw-consumption-cli     │  │ eventhouse-consumption-cli │ │
│     │ or INFORMATION_SCHEMA     │  │ or .show database schema   │ │
│     │ → all tables + columns    │  │ → all tables + columns     │ │
│     └──────────┬───────────────┘  └──────────┬─────────────────┘ │
│                │                              │                   │
│  Step 2 → Merge schemas ◄────────────────────┘                   │
│     - Match entity tables (lakehouse) to telemetry (eventhouse)  │
│     - Detect property name collisions across sources             │
│     - Detect property type conflicts across entity types         │
│     - Rename collisions (e.g., TenantId → TsTenantId)           │
│                                                                   │
│  Step 3 → Propose model → PREVIEW & CONFIRM                     │
│                                                                   │
│  Step 4 → Build full envelope → createItem (single call)         │
└─────────────────────────────────────────────────────────────────┘
```

**如何扇出**（特定于智能体）：
- **GitHub Copilot CLI / Claude Code**：启动两个后台 `task` 智能体——一个用于湖仓（`sqldw-consumption-cli` 或 `INFORMATION_SCHEMA.COLUMNS` 查询），另一个用于事件屋（`.show database schema as json`）。两者完成后读取其结果。
- **单线程环境**：依次运行两个发现查询——每个查询都只需一次调用，因此开销很小。

合并步骤（步骤 2）是发现大多数编写错误的环节——对属性名称去重、统一各实体间的 `valueType`，并为与静态属性冲突的时序属性添加前缀。

#### 详细步骤流程

```text
Step 0 → Is the request specific? Are the entity types, keys, and lakehouse tables named?
         → NO  → Ask: "Which entity types? What is the key of each? Which lakehouse table binds to each?
                  Any timeseries properties? Any relationships and their link tables?"
                  STOP — do not proceed until the user answers.
         → YES → Continue.
Step 1 → Resolve IDs: workspace, folder, lakehouse, eventhouse     [COMMON-CLI.md]
Step 2 → Discover source schemas (parallel where possible):
           a. Lakehouse: invoke `sqldw-consumption-cli` or query INFORMATION_SCHEMA.COLUMNS
           b. Eventhouse: invoke `eventhouse-consumption-cli` or run `.show database schema as json`
Step 3 → Merge schemas: detect property name collisions + type conflicts; rename as needed
Step 4 → If ontology exists: getDefinition → decode parts              (capture current IDs)
         Else: plan `createItem` with the FULL definition (all parts in one call).
Step 5 → For each entity type:
           a. Generate/reuse 64-bit IDs for entity + properties
           b. Build EntityTypes/{id}/definition.json
           c. Build one or two DataBindings/{guid}.json files
Step 6 → For each relationship:
           a. Confirm both entity types exist in Step 5 output
           b. Generate/reuse relationship type ID
           c. Build RelationshipTypes/{id}/definition.json
           d. Build RelationshipTypes/{id}/Contextualizations/{guid}.json
Step 7 → Base64-encode all parts; assemble envelope
Step 8 → **PREVIEW & CONFIRM** — render proposal (greenfield) or change-set diff (brownfield)
         and obtain explicit `yes` from the user. See [preview-and-confirm.md](references/preview-and-confirm.md).
         Do not proceed on anything other than `yes`.
Step 9 → createItem OR updateDefinition (LRO)
Step 10 → Poll LRO until Succeeded; getDefinition; verify IDs and bindings; persist post-write snapshot for next-run diff
```

### 脚本生成工作流

```text
Step 1 → Capture user intent (entity types, keys, properties, relationships, source tables)
Step 2 → Save intent as a YAML/JSON spec in the consumer's repo — single source of truth
Step 3 → Generate: (a) the ID map, (b) per-file JSON parts, (c) the composite envelope
Step 4 → **PREVIEW & CONFIRM** — render proposal/diff and require explicit `yes`
         (see [preview-and-confirm.md](references/preview-and-confirm.md)). The textual
         diff against the last-applied envelope snapshot feeds the brownfield change-set.
Step 5 → Apply via az rest --body @envelope.json (createItem or updateDefinition)
Step 6 → Poll LRO; on success, commit the envelope snapshot + ID map
```

---

## 示例

端到端的完整示例（创建空本体 → 添加实体类型和非时序绑定 → 添加关系类型和上下文化 → 添加时序属性和 Eventhouse 绑定）位于 [examples.md](references/examples.md)。完整的获取-修改-发送 Bash 和 PowerShell 脚本位于 [definition-script-templates.md](references/definition-script-templates.md)。


---

## 智能体集成说明

- 此技能侧重于创作。请与消费技能（例如 Fabric Graph 查询技能）配合使用，以端到端验证本体。
- 当本体绑定到多种源类型时，**并行执行架构发现**：
  - 为湖仓架构启动一个后台 `sqldw-consumption-cli` 任务（`INFORMATION_SCHEMA.COLUMNS`）——通过一次查询返回所有表和列。
  - 为 Eventhouse 架构启动一个后台 `eventhouse-consumption-cli` 任务（`.show database schema as json`）——通过一次调用返回所有表和列。
  - 两者并发运行。待两者都完成后合并结果，然后构建本体模型。
- **合并步骤至关重要**——完成发现后，对 `properties[]` 和 `timeseriesProperties[]` 中的属性名称进行去重，统一不同实体类型中同名属性的 `valueType`，并在构建信封之前为冲突项添加前缀。
- 在编排跨越本体、Eventhouse 和湖仓的多步骤客户工作流时，应通过智能体（例如 `FabricDataEngineer`）进行路由，而不是直接串联技能。
- 可以合理假设的上游依赖项：湖仓表已存在，并且包含用户所描述的键列。如果不满足此条件，调用方应先调用湖仓创作技能。