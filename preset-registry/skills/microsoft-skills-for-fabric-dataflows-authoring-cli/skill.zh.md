---
name: dataflows-authoring-cli
description: >
  Create, update, delete, and refresh Fabric Dataflows Gen2 with write-side CLI
  via Fabric APIs. Build mashup.pq and queryMetadata.json,
  preview candidate M with executeQuery/customMashupDocument, bind connections,
  and configure output destinations. For saved
  query execution or refresh-status reads, use `dataflows-consumption-cli`. If
  a request explicitly insists on the Dataflows consumption or read-only path
  for a mutation, do not route here; let consumption refuse before any
  separately confirmed authoring handoff. Triggers: "create dataflow", "update
  dataflow", "delete dataflow", "trigger dataflow refresh", "preview Power
  Query M", "preview before save", "customMashupDocument", "create Fabric data
  source connection", "create SQL Server source REST", "POST /v1/connections",
  "supportedConnectionTypes", "passwordReference", "bind
  connection", "dataflow output destination", "dataflow write to lakehouse",
  "dataflow write to warehouse", "dataflow write to ADX", "DataDestinations
  annotation".
---
> **更新检查 — 每个会话仅一次（必需）**
> 本会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话之前已经执行过此检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

> **变更前需求门禁（必需）**
> 在执行任何变更之前，确认用户已充分表达所请求操作的意图。
> 对于创建或更新请求，明确源、查询/架构和
> 转换、目标行为以及刷新行为（包括明确选择不设目标或不刷新）。如果请求较为笼统，
> 例如“设置我进行报表所需的 Dataflow”，请提出结构化的
> 澄清问题，并在执行变更前停止。不要根据
> 不相关的工作区项目推断需求，也不要凭猜测创建源、连接或
> Dataflow。

# dataflows-authoring-cli — 通过 CLI 创作 Dataflows Gen2

## 目录

**此技能（`SKILL.md`）**

| 章节 | 说明 |
|---|---|
| [工具栈](#tool-stack) | `az` + `jq` + `base64` + `curl` |
| [连接](#connection) | 发现工作区/Dataflow ID |
| [智能体工作流](#agentic-workflows) | **从这里开始。** A：端到端创建；B：修改现有项；C：预览循环 |
| [必须执行 / 避免 / 首选](#must-do) | 创作规则 |
| [故障排除](#troubleshooting) | 症状 → 修复方法表 |
| [示例](#examples) | 可运行的 bash + PowerShell 操作步骤 |
| [输出预期](#output-expectations) | 响应规范 |

**参考资料**（位于 [`references/`](references/) 中）

| 文件 | 何时阅读 |
|---|---|
| [authoring-cli-quickref.md](references/authoring-cli-quickref.md) | 单行操作步骤、状态枚举、base64 辅助工具、连接绑定快速模式 |
| [authoring-script-templates.md](references/authoring-script-templates.md) | 完整的 bash + PowerShell 模板；端到端冒烟测试；LRO 轮询模式 |
| [connection-management.md](references/connection-management.md) | 列出/创建/检查连接；`supportedConnectionTypes`；解析 `ClusterId`；ID 格式速查表 |
| [connectors.md](references/connectors.md) | M 端源连接器：实时验证的函数清单、Lakehouse 深层导航、`Web.Page` / `Web.BrowserContents` 的网关作用域，以及 `Html.Table` / `Csv.Document` / `Json.Document` 模式 |
| [m-language.md](references/m-language.md) | Dataflow Gen2 的 M 语言语义：`try` 记录结构、列转换中的逐单元格错误封装、行上下文与子表上下文中的 `each` 作用域、可选字段访问 `[?]` / `Record.FieldOrDefault`、带引号的标识符、沙盒中禁用的符号（`File.Contents`） |
| [mashup-preview.md](references/mashup-preview.md) | `executeQuery` 约定：引导分支、自动包装规则、严格避免无边界预览 |
| [output-destinations.md](references/output-destinations.md) | 输出目标模式：Lakehouse Table、Lakehouse Files、Warehouse、ADX、Azure SQL。`DataDestinations` 注释、隐藏查询、`loadEnabled` 规则、连接限制 |

**通用参考文档**（位于 [`../../common/`](../../common/) 中）

| 文件 | 何时阅读 |
|---|---|
| [COMMON-CLI.md](../../common/COMMON-CLI.md) | `az login`、令牌获取、`az rest`、分页、LRO 轮询、CLI 注意事项。**§ 在 Fabric 中查找工作区和项目是必读内容。** |
| [COMMON-CORE.md](../../common/COMMON-CORE.md) | Fabric 拓扑、环境 URL、身份验证、核心 REST API 功能面 |
| [ITEM-DEFINITIONS-CORE.md](../../common/ITEM-DEFINITIONS-CORE.md) | 定义封装；各项目类型的有效负载约定 |
| [DATAFLOWS-AUTHORING-CORE.md](../../common/DATAFLOWS-AUTHORING-CORE.md) | 创作能力矩阵；由 3 个部分组成的定义结构；M 结构；连接模型；ALM / Git 集成 |

**同类技能**

| 技能 | 用途 |
|---|---|
| [dataflows-consumption-cli](../dataflows-consumption-cli/SKILL.md) | 执行持久化查询；无持久化意图的临时只读 `customMashupDocument`；Arrow → CSV/pandas 转换；刷新状态/历史记录。 |

---

## 工具栈

| 工具 | 角色 | 安装 |
|---|---|---|
| `az` CLI | **主要工具**：身份验证（`az login`）、REST API 调用（`az rest`）、令牌获取。 | 大多数开发环境中已预安装 |
| `jq` | 解析和操作 JSON 响应及定义有效负载。 | 已预安装或极易安装 |
| `base64` | 为 REST API 编码/解码定义部分。 | bash 内置 / PowerShell 中的 `[Convert]::ToBase64String()` |
| `curl` | 需要对原始 HTTP 进行控制时，作为 `az rest` 的替代方案。 | 已预安装 |
| `uuidgen` | 构建新的数据流定义（工作流 A）时，为 `queryId` 和 `logicalId` 生成每个查询/平台对应的 GUID。 | Linux/macOS 上已预安装；Windows 上使用 PowerShell `[guid]::NewGuid().Guid` 或通过 WSL 运行 |

> **智能体检查** — 首次操作前，请验证 `az`、`jq` 和 `curl` 是否可用。仅工作流 A（创建）需要 `uuidgen`。
> 有关安装和身份验证设置，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。

---

## 连接

### 发现工作区和数据流 ID

按照 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的“在 Fabric 中查找工作区和项目”：

```bash
# List workspaces — find workspace ID by name
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --query "value[?displayName=='MyWorkspace'].id" --output tsv

# List dataflows in workspace — find dataflow ID by name
WS_ID="<workspaceId>"
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/dataflows" \
  --query "value[?displayName=='MyDataflow'].id" --output tsv
```

### 可复用的连接变量

```bash
WS_ID="<workspaceId>"
DF_ID="<dataflowId>"
API="https://api.fabric.microsoft.com/v1"
RESOURCE="https://api.fabric.microsoft.com"
```

---

## 智能体工作流

以下三个工作流涵盖典型的创作任务：

- **[A. 端到端创建新数据流](#a-create-a-new-dataflow-end-to-end)** — 发现/创建连接、创建数据流、保存 M + 绑定、验证，并可选择刷新。
- **[B. 修改现有数据流](#b-modify-an-existing-dataflow)** — 读取-修改-写入定义；采用规范的“发现 → 制定 → 执行 → 验证”循环。
- **[C. 预览驱动的创作循环](#c-preview-driven-authoring-loop)** — 先通过 `executeQuery` 迭代候选 M，再通过 `updateDefinition` 将其持久化。
- **[D. 输出目标](#d-output-destination)** — 通过 `DataDestinations` 注释将查询结果写入 Lakehouse（表/文件）、Warehouse、ADX 或 Azure SQL。完整参考：[output-destinations.md](references/output-destinations.md)。

### A. 端到端创建新数据流

当**数据流尚不存在**时使用此流程。涵盖完整的理想路径：发现或创建连接、创建数据流外壳、通过一次 `updateDefinition` 保存 M + 绑定、验证，以及可选的刷新。

**步骤：**

1. **列出现有连接**，并按 `connectionDetails.type` 和目标 URL/主机进行筛选——如果存在匹配项则复用（`GET /v1/connections` + JMESPath）。
2. **如果没有匹配项，则创建连接。**首先调用 `GET /v1/connections/supportedConnectionTypes` 以发现必需参数和支持的凭据类型，然后调用 `POST /v1/connections`（同步返回 201）。请求体结构和凭据架构：[connection-management.md](references/connection-management.md)。
3. **解析复合绑定所需的 `ClusterId`。**调用 `GET https://api.powerbi.com/v2.0/myorg/me/gatewayClusterDatasources`，使用 `--query "value[?id=='$CONN_ID'] | [0].clusterId"`，受众为 `--resource "https://analysis.windows.net/powerbi/api"`（末尾没有斜杠）。按 ID 查询的路由会针对云连接返回 `PowerBIEntityNotFound`。新创建的连接可能需要几秒钟才会出现——结果为空时进行重试。详情：[connection-management.md § 解析 ClusterId](references/connection-management.md#resolving-clusterid-power-bi-v2)。
4. **创建数据流外壳。**使用 `{"displayName":"<displayName>"}` 调用 `POST /v1/workspaces/{ws}/dataflows`，同步返回 201。创建时 `definition` 字段是可选的，可以在下一步中设置。如果改为在此创建 POST 中提供完整的 `definition`（全部三个部分），则该调用就是持久化入口——在摘要中将 `POST /v1/workspaces/{ws}/dataflows`（而不是 `updateDefinition`）列为持久化路径。
5. **通过一次调用保存 M + 连接绑定。**调用 `POST /v1/workspaces/{ws}/dataflows/{df}/updateDefinition?updateMetadata=true`，并提供三个部分：`mashup.pq`（真实的 `Web.Contents` / `Sql.Database` / …）、`queryMetadata.json`（已填充 `connections[]`；每个 `connectionId` 都是字符串化的复合对象 `{"ClusterId":"…","DatasourceId":"…"}`）以及 `.platform`。通常同步返回 200；对于较大的请求体，可能返回 202 + LRO `Location`——两种情况都要处理。
6. **验证绑定是否已持久化。**再次调用 `getDefinition`，解码 `queryMetadata.json`，并确认 `connections[]` 保持完整。**不要**使用 `GET /items/{id}/connections` 进行验证——该端点反映的是刷新后物化的状态，而不是持久化的定义，即使绑定成功也会返回 0。请参阅[避免事项](#avoid)。
   **受保护的仅预览回退方案：**如果由于 Power BI v2 `gatewayClusterDatasources` 返回 401/403/Unauthorized，或重试后仍无法看到 `ClusterId`，导致无法继续进行连接绑定，请不要在创建数据流之前停止。创建外壳，持久化已保存的查询定义但不要声称存在有效的源绑定，仅使用 `QueryName` 为每个已保存的查询调用 `executeQuery`，呈现 Arrow 流中的确切凭据或绑定错误，不要伪造图表数据，也不要刷新。
7. **（建议）提议以 ASCII 图表形式预览输出。**询问用户：*"你希望我在首次刷新前以图表形式预览数据吗？"*。在此创建流程中，定义已在步骤 5 中保存，因此此处的图表预览是一个**在通过刷新进行物化之前的保存后验证关卡**，而不是保存前步骤。（如果你希望在首次 `updateDefinition` **之前**验证*候选* M——例如迭代调整 M，或为需要凭据的源进行引导绑定，以便 `executeQuery` 能够看到它——请使用持久化前的[预览驱动创作循环](#c-preview-driven-authoring-loop)；图表渲染方式完全相同，唯一的区别是其相对于保存操作的顺序。）如果用户接受，则为每个实体调用 `executeQuery`，解析 Arrow IPC 流，通过 `references/charts/line_chart.py` / `references/charts/bar_chart.py` 渲染折线图（时间序列）或水平条形图（类别），并在继续之前请求用户确认。详情：[mashup-preview.md § ASCII 图表预览](references/mashup-preview.md#ascii-chart-preview-optional)。如果用户拒绝，则直接进入步骤 8。
8. **（可选）触发刷新**以进行物化。调用 `POST .../jobs/instances?jobType=Refresh`，请求体为 `{"executionData":{"executeOption":"ApplyChangesIfNeeded"}}`。**在任何定义更改后的首次刷新中，都必须使用 `ApplyChangesIfNeeded`**——如果不使用，Fabric 将刷新之前已应用的定义。轮询 LRO，直到 `status` 为 `Completed`（刷新枚举值）或 `Failed`/`Cancelled`。

```bash
# Concise skeleton — full runnable bash is Example 1 below.
# PowerShell + LRO-polled variants: references/authoring-script-templates.md

WS_ID="<workspaceId>"; URL="<source-url>"
RES="https://api.fabric.microsoft.com"; API="$RES/v1"
PBI="https://analysis.windows.net/powerbi/api"

# 1. List existing & try reuse
CONN_ID=$(az rest --method get --resource "$RES" --url "$API/connections" \
  --query "value[?connectionDetails.type=='Web' && connectionDetails.path=='$URL'] | [0].id" -o tsv)

# 2. Create connection if missing — see connection-management.md for full body
# 3. List+filter for ClusterId
CLUSTER_ID=$(az rest --method get --resource "$PBI" \
  --url "https://api.powerbi.com/v2.0/myorg/me/gatewayClusterDatasources" \
  --query "value[?id=='$CONN_ID'] | [0].clusterId" -o tsv)

# 4. Empty dataflow shell — sync 201
SHELL_BODY=$(mktemp --suffix=.json 2>/dev/null || mktemp)
printf '{"displayName":"my-df"}' > "$SHELL_BODY"
DF_ID=$(az rest --method post --resource "$RES" \
  --url "$API/workspaces/$WS_ID/dataflows" \
  --headers "Content-Type=application/json" \
  --body "@$SHELL_BODY" --query id -o tsv)
rm -f "$SHELL_BODY"

# 5. One-shot updateDefinition with real M + connections[] (sync 200 typical)
#    Body assembly (mashup.pq + queryMetadata.json + .platform, base64-encoded;
#    queryMetadata.json.connections[].connectionId = composite ClusterId/DatasourceId):
#    see Example 1 below.

# 6. Verify via getDefinition (NOT GET /items/{id}/connections — see AVOID)
# 7. (optional) executeQuery — Workflow C
# 8. (optional) Refresh with executeOption=ApplyChangesIfNeeded — Example 2
```

> **一次调用与两步绑定并保存。** 步骤 4-5 可以通过一次调用完成（默认方式；可节省一次 HTTP 往返），也可以拆分为一次用于引导绑定的 `updateDefinition`，随后再执行一次包含完整 M 的 `updateDefinition`。两种方式都可行——请参阅 [PREFER](#prefer)。

### B. 修改现有数据流

当数据流已存在时，请使用此工作流。采用标准的“发现 → 构建 → 执行 → 验证”循环。如果数据流尚不存在，请改为参阅[工作流 A](#a-create-a-new-dataflow-end-to-end)。

1. **发现** — 列出工作区、列出数据流，调用 `getDefinition`（解码 `mashup.pq` 和 `queryMetadata.json`）。通过 `GET /v1/connections/{id}` 验证所有 `connections[]` 条目。
2. **构建** — 修改 M，重新编码各部分，并确保引用的每个 `connectionId` 都存在于调用方的连接存储中。
3. **执行** — 使用**全部 3 个部分**调用 `POST .../updateDefinition?updateMetadata=true`（完整替换）。可选择触发刷新。
4. **验证** — 再次调用 `getDefinition` 以确认更改；轮询刷新 LRO；如果刷新失败，最多进行**一次** `executeQuery` 隔离尝试，以定位可修复的 M/数据源问题。遇到终止性/不可重试的故障（`isRetriable: false`、工作区范围的 `UnknownException`）时，应返回原始错误并**停止**，而不是重新触发。

```bash
# Concise skeleton — full templates: references/authoring-script-templates.md
# Acquire $TOKEN per common/COMMON-CLI.md § Token-in-Variable Pattern (resource = $RESOURCE).
RESOURCE="https://api.fabric.microsoft.com"; API="$RESOURCE/v1"

# 1. Discover — getDefinition (handles 200 sync and 202 + LRO via curl)
HDR=$(mktemp); BODY=$(mktemp)
CODE=$(curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Length: 0" \
  "$API/workspaces/$WS_ID/dataflows/$DF_ID/getDefinition" \
  -D "$HDR" -o "$BODY" -w "%{http_code}")
if [ "$CODE" = "202" ]; then
  LOC=$(tr -d '\r' < "$HDR" | grep -i "^location:" | awk '{print $2}')
  RETRY=$(tr -d '\r' < "$HDR" | grep -i "^retry-after:" | awk '{print $2}'); RETRY=${RETRY:-5}
  while :; do
    sleep "$RETRY"
    OP=$(az rest --method get --resource "$RESOURCE" --url "$LOC")
    case "$(echo "$OP" | jq -r '.status // empty')" in
      Succeeded) RESULT=$(az rest --method get --resource "$RESOURCE" --url "${LOC%/}/result"); break ;;
      Failed|Cancelled) echo "ERROR: getDefinition $(echo "$OP" | jq -r '.status')" >&2; exit 1 ;;
    esac
  done
else
  RESULT=$(cat "$BODY")
fi
rm -f "$HDR" "$BODY"

# Validate bound connections (connectionId is a composite JSON string — iterate safely)
QUERY_META=$(echo "$RESULT" | jq -r '.definition.parts[] | select(.path=="queryMetadata.json") | .payload' | base64 -d)
echo "$QUERY_META" | jq -c '.connections[]?' | while IFS= read -r conn; do
  RAW=$(echo "$conn" | jq -r '.connectionId')
  DATASOURCE_ID=$(echo "$RAW" | jq -r '.DatasourceId? // empty' 2>/dev/null)
  [ -z "$DATASOURCE_ID" ] && DATASOURCE_ID="$RAW"
  # GET /v1/connections/$DATASOURCE_ID to confirm access
done

# 2-3. Formulate & Execute — see Example 3
# 4. Verify — trigger refresh via curl (az rest cannot capture Location header).
#    Full LRO polling: references/authoring-script-templates.md.
```

### C. 预览驱动的创作循环（保存前执行 executeQuery — 参见 [mashup-preview.md](references/mashup-preview.md#preview-driven-authoring-loop)）

当更改涉及 Power Query M（新查询、编辑后的混搭、新数据源、更改后的参数）时，应在持久化之前，使用数据流绑定的连接预览候选 `customMashupDocument`。这样可以在创作阶段捕获语法、架构和凭据错误。完整的有序步骤、引导分支、自动包装规则、严格避免无边界预览、ASCII 图表预览和 Apache Arrow 处理方式，请参见：[mashup-preview.md § 预览驱动的创作循环](references/mashup-preview.md#preview-driven-authoring-loop)。

> **意图区分。** 此工作流用于*保存前*意图。若要执行**已保存的**查询（仅 `QueryName`），或运行无持久化意图的**临时只读** `customMashupDocument`，请使用 [`dataflows-consumption-cli`](../dataflows-consumption-cli/SKILL.md#query-evaluation)。`mashup-preview.md` 是这两种意图共用的 API 参考文档。

仅在进行纯元数据编辑（显示名称、计划、`loadEnabled` 切换）时，或代理记录了明确的跳过原因（引导、成本过高、具有副作用的数据源）时，才跳过预览。

### D. 输出目标

当数据流应将**查询结果写入外部存储**（Lakehouse 表、Lakehouse 文件、Warehouse、ADX、Azure SQL）时，请使用此工作流。它通过 `DataDestinations` 注解和隐藏的目标查询扩展了工作流 A。包含完整示例的完整参考文档：[output-destinations.md](references/output-destinations.md)。

**关键要求：**

1. **源查询**带有 `[DataDestinations = {[...]}]` 注解，按名称引用目标查询。
2. **隐藏的目标查询**（后缀为 `_DataDestination`）使用空值安全的 `?[Data]?`（表）或 `?[Content]?`（文件）运算符导航到目标存储。
3. **queryMetadata.json** 必须在目标查询上设置 `"loadEnabled": false`——否则刷新会失败。在总结中使用原样部件名称说明这一点（例如，“在 `queryMetadata.json` 中的目标查询上设置 `loadEnabled: false`”）。
4. 对于通过 API 创建的数据流，**始终使用 `IsNewTarget = true`**，即使表已存在也是如此。
5. **绑定适当的连接**（Lakehouse：类型 `"Lakehouse"`；Warehouse：类型 `"Warehouse"`；ADX：类型 `"AzureDataExplorer"`；Azure SQL：类型 `"Sql"`），并使用由 `ClusterId`/`DatasourceId` 组成的复合 ID。
6. **首次刷新必须使用 `ApplyChangesIfNeeded`**，以发布草稿并协调注解。
7. **所有源列都必须具有类型**——所有目标类型都会拒绝 `Any` 类型的列。
8. **在书面总结中写明定义部件的名称。** 由于 CLI 记录会截断较长的命令正文，最终总结（使用说明性文字，而不只是 shell 命令）必须使用原样路径写明三个定义部件——`mashup.pq`、`queryMetadata.json` 和 `.platform`——以确保部件名称保留在回答中（例如，“通过 `updateDefinition` 保存了 `mashup.pq` + `queryMetadata.json` + `.platform`”）。不要将 `queryMetadata.json` 缩写为“查询元数据”，也不要缩写内部字段 `queriesMetadata`。

**支持的目标：**

| 目标 | 连接种类 | 目标查询函数 | 备注 |
|---|---|---|---|
| Lakehouse 表 | `Lakehouse` | `Lakehouse.Contents(...)` | 路径：`"Lakehouse"` |
| Lakehouse 文件 | `Lakehouse` | `Lakehouse.Contents(...)` | `TypeSettings = [Kind = "File"]`、`?[Content]?` |
| Warehouse | `Warehouse` | `Fabric.Warehouse(...)` | 路径：`"Warehouse"`，Schema/Item 导航 |
| Azure Data Explorer | `AzureDataExplorer` | `AzureDataExplorer.Contents(...)` | 路径必须与连接完全匹配（注意末尾斜杠！） |
| Azure SQL | `Sql` | `Sql.Database(...)` | 路径：`"server;database"` |

**最少步骤：** 创建数据流 → 查找/创建连接 → 解析 ClusterId → 保存带有 OD 注释的定义 → 验证 → 刷新。

```bash
# Skeleton — full PowerShell recipe: references/output-destinations.md § Complete Example
WS_ID="<workspaceId>"; LH_ID="<lakehouseId>"; RES="https://api.fabric.microsoft.com"

# M pattern (two queries):
# 1. Source with [DataDestinations] annotation
# 2. Hidden _DataDestination query with ?[Data]? null-safe navigation
# queryMetadata: source loadEnabled=true, destination loadEnabled=false + isHidden=true
# Refresh: {"executionData":{"executeOption":"ApplyChangesIfNeeded"}}
```

---

## 注意事项、规则与故障排除

有关完整的创作注意事项，请参阅 [DATAFLOWS-AUTHORING-CORE.md](../../common/DATAFLOWS-AUTHORING-CORE.md) 中的“注意事项与故障排除”。
有关 CLI 特有的问题，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的“注意事项与故障排除（CLI 特有）”。
有关连接发现，请参阅 [authoring-cli-quickref.md § 连接发现与验证](references/authoring-cli-quickref.md#connection-discovery-and-validation)。

### 必须执行

- **在新数据流首次刷新前，主动询问是否预览每个实体** — 创建外壳并通过 `updateDefinition` 绑定连接（这会持久化定义）后，询问用户是否希望在通过刷新将其具体化之前查看预览图表。在[预览驱动循环](#c-preview-driven-authoring-loop)中，预览则先于持久化 `updateDefinition`。如果用户接受，请遵循 [mashup-preview.md § ASCII 图表预览](references/mashup-preview.md#ascii-chart-preview-optional)。仅当进行纯元数据编辑（显示名称、计划）或代理记录了明确的跳过原因时，才可跳过。
- **先执行 `az login`** — 所有 `az rest` 调用都使用活动会话。没有会话 → 401。
- **对 Fabric API 使用 `--resource "https://api.fabric.microsoft.com"`。** 对于 Power BI v2（`gatewayClusterDatasources`），使用 `--resource "https://analysis.windows.net/powerbi/api"`，并且**不要带末尾斜杠** — 带斜杠的形式会导致 `AADSTS500011 invalid_resource`。
- **对定义的全部 3 个部分进行 Base64 编码** — `mashup.pq` + `queryMetadata.json` + `.platform`，每个部分均使用 `payloadType: "InlineBase64"`。`updateDefinition` 是完全替换；仅发送 1 个或 2 个部分会在不提示的情况下丢弃查询。
- **同时处理同步和异步响应。** `POST /dataflows`、`updateDefinition` 和 `getDefinition` 通常返回同步响应（200/201），但对于较大的正文，也可能返回 202 + LRO `Location` — 两种情况都要处理。请参阅 [authoring-script-templates.md § Fabric LRO 轮询模式](references/authoring-script-templates.md#fabric-lro-polling-pattern)。
- **在 `queryMetadata.json` 中设置 `formatVersion: "202502"`，并包含与 `displayName` 匹配的顶层 `name`** — 缺少其中任何一项都会导致保存时失败或显示名称状态过期。
- **`loadEnabled` 是选择退出，而非选择加入。** Fabric 默认会将每个查询自动加载到暂存 Lakehouse；仅对不希望写入的辅助查询设置 `loadEnabled: false`。注意：通过 `getDefinition` 往返读取时，`loadEnabled: true` 也会从 `queryMetadata.json` 中被移除（因为它是默认值）— 回读时不存在该字段**不是**错误。详情：[DATAFLOWS-AUTHORING-CORE.md § loadEnabled 语义](../../common/DATAFLOWS-AUTHORING-CORE.md)。
- **根据上下文使用正确的 ID 格式。** REST `/v1/connections` 操作采用来自 `connection.id` 的**纯 GUID**；`queryMetadata.json connections[].connectionId` 采用**字符串化复合值** `{"ClusterId":"…","DatasourceId":"…"}`。请参阅 [connection-management.md § 连接 ID 格式速查表](references/connection-management.md#connection-id-format-cheat-sheet)。
- **通过列表+筛选解析 `ClusterId`。** 使用 `GET .../gatewayClusterDatasources`，并通过 `value[?id=='$CONN_ID']` 进行筛选。按 ID 查询的路由会对云连接返回 `PowerBIEntityNotFound`；新创建的连接可能需要等待 5-15 秒后重试。请参阅 [connection-management.md § 解析 ClusterId](references/connection-management.md#resolving-clusterid-power-bi-v2)。
- **`executeQuery` 正文使用顶层 `QueryName` 字段**（PascalCase 是规范形式；字段名本身在传输时不区分大小写 — 小写 `queryName` 也会被求值）。值必须指定持久化 M 或所提供 `customMashupDocument` 中的一个 `shared` 成员。`{"queries":[…]}` 数组形式**始终**会失败并返回 `DataflowExecuteQueryError: Invalid query name`；错误的查询名称会返回 `QueryNotFound`。完整约定：[mashup-preview.md § 请求正文](references/mashup-preview.md)。
- **使用准确且区分大小写的 API 名称。** 端点是 `executeQuery`（单数，绝不能使用 `executeQueries`），请求正文字段是 `customMashupDocument`（绝不能使用 `mashupDocument`，也绝不能进行 Base64 编码 — 它是纯 UTF-8 M 字符串）。同一 M 正文会成为保存后的 `mashup.pq` 部分，并作为 `customMashupDocument` 被引用。词汇表：[mashup-preview.md § 词汇](references/mashup-preview.md#vocabulary----name-the-things-you-send)。
- **任何 `updateDefinition` 后的首次刷新都必须使用 `executeOption: "ApplyChangesIfNeeded"`。** 正文：`{"executionData":{"executeOption":"ApplyChangesIfNeeded"}}`。如果不这样做，Fabric 会刷新之前已应用的定义。
- **将终止状态的刷新失败视为停止条件 — 不要陷入调试循环。** 当刷新/LRO 作业达到终止状态 `Failed`/`Cancelled`，或后端错误包含 `isRetriable: false`（或工作区范围的 `UnknownException`）时，逐字报告原始错误并**停止**。这些是代理无法通过重试修复的后端/基础设施结果 — 不要重新触发刷新、持续轮询或展开长时间调查。最多进行**一次** `executeQuery` 隔离尝试，以定位可修复的 M/源原因；如果没有发现定义端问题，则结束操作并呈现错误。
- **在 `POST /v1/connections` 前调用 `GET /v1/connections/supportedConnectionTypes`** -- 绝不要猜测参数名称或凭据类型；它们会因连接器、租户和时间而异。向用户总结某个连接器所需的参数或 `credentialType` 集合时，请使用准确且区分大小写的端点路径 `GET /v1/connections/supportedConnectionTypes`。即使只是单纯查询（“连接器 X 支持哪些参数/credentialType？”），这也同样适用：针对该租户实时运行 `GET /v1/connections/supportedConnectionTypes`。随附的 `connection-management.md` 参考文档可用于了解响应结构，但不能替代特定于租户且区分大小写的值，因为这些值会因连接器和时间而异。
- **刷新前验证引用的连接。** 对于 `queryMetadata.json` 中的每个 `connectionId`，调用 `GET /v1/connections/{id}`（使用从复合值中提取的纯 GUID）。刷新时出现含义不明的 `EntityUserFailure`，通常是由于连接缺失或无法访问。请参阅 [connection-management.md](references/connection-management.md)。
- **预览需要凭据的 M 之前，先引导绑定连接。** 初始创建负载中的 `connections[]` 数组对 `executeQuery` **尚不可见**；必须先通过至少一次 `updateDefinition` 将其持久化。详情：[mashup-preview.md § 引导分支](references/mashup-preview.md#bootstrap-branch--new-dataflow--new-credentialed-source)。
- **在 `customMashupDocument` 中发送完整的 `section Section1; ...` 文档** — `executeQuery` 不会自动包装原始表达式。请参阅 [mashup-preview.md § customMashupDocument 格式](references/mashup-preview.md#custommashupdocument-format)。
- **在 `updateDefinition` 前通过 `executeQuery` 预览候选 M** — 除非更改仅涉及元数据，或代理记录了明确的跳过原因。将预览成功视为“M 可求值”；将接下来的刷新视为真正的继续/停止判定点。
- **通过 `--body "@<file>"` 传递 JSON 正文，而非内联传递。** 将其写入 `$env:TEMP\<name>.json`（PowerShell，通过 `[IO.File]::WriteAllText` 使用 UTF-8 **无 BOM**）或 `/tmp/<name>.json`（bash）。内联 `--body "<json>"` 在 bash 中不可靠，在 Windows 上则无法正常工作，因为 `cmd.exe` 的参数解析器会破坏嵌入的引号。请参阅 [authoring-script-templates.md § PowerShell — 使用定义创建数据流](references/authoring-script-templates.md#powershell--create-dataflow-with-definition)。
- **对于无人值守刷新，优先使用 `WorkspaceIdentity` / `ServicePrincipal` 凭据。** `OAuth2` + `singleSignOnType: None` 可用于交互式 `executeQuery`，但在租户条件访问下进行服务上下文刷新时并不可靠。通过 `supportedConnectionTypes` 检查支持的类型。

### 避免

- **在未向用户提供预览的情况下实例化新数据流（首次刷新）** — 用户无法仅通过阅读代码来验证 M 代码是否符合其意图。在首次刷新之前，始终应主动提出以 ASCII 图表形式预览每个实体的输出（在预览驱动的循环中，也应在持久化 `updateDefinition` 之前提供预览）。用户可以拒绝，但始终都应提供这一选项。
- **向 `definition` 添加 `format` 属性** — Items API 仅使用 `parts[]`；`"format": "json"` 会返回 `400 InvalidDefinitionFormat`。
- **硬编码工作区/数据流 GUID** — 通过 REST API 发现（参见 Connection 章节）。
- **使用 `GET /v1/workspaces/{ws}/items/{itemId}/connections` 验证刚刚绑定的数据流。** 它反映的是刷新后实例化的状态，**而不是**持久化的定义，并且在成功绑定后会返回 0。应通过 `getDefinition` 进行验证，并解码 `queryMetadata.json.connections[]`。
- **假设 `updateDefinition` / `POST /dataflows` 始终是 LRO。** 典型响应是同步的（200/201）；应处理这两种响应形式 — 参见上方的“必须执行”部分。
- **请求 PBI v2 令牌时使用末尾带斜杠的资源地址**（`--resource "https://analysis.windows.net/powerbi/api/"`）— 会因 `AADSTS500011 invalid_resource` 而失败。请使用不带末尾斜杠的形式。
- **对云连接使用按 ID 获取的 `gatewayClusterDatasources/{id}`** — 会返回 `PowerBIEntityNotFound`。请使用列表加筛选的方式（参见上方的“必须执行”部分）。
- **为 `executeQuery` 使用 `{"queries":[…]}` 数组请求正文格式** — 无论内部字段采用何种大小写，始终都会返回 `400 DataflowExecuteQueryError: Invalid query name`。请使用顶层 `QueryName`（或 `queryName` — 该字段不区分大小写）；每次调用只选择一个查询。
- **使用 `GET` 调用 `getDefinition`** — 它是 POST 端点；`GET` 会返回 405。
- **手动构造操作 URL** — 始终遵循 202 响应中的 `Location` 标头。
- **重复的 `displayName` 值** — 虽然不会被强制禁止，但会造成混淆。
- **按显示名称绑定连接** — 连接 ID 才是事实依据；名称可能会发生变化。
- **假设所有用户都能访问所有连接。** 可见性是**按调用方区分的**：对于无权访问的调用方，`GET /v1/connections/{id}` 可能返回 403/404。`GET /v1/connections` 返回空结果并不能证明连接不存在。
- **在没有 `supportedConnectionTypes` 的情况下手工编写连接请求正文** — 靠猜测会导致 `400 InvalidConnectionDetails` / `400 InvalidCredentialDetails`。
- **在生成的示例或已提交的脚本中使用明文凭据** — 切勿呈现或提交明文凭据值。在生成的连接请求正文中，仅显示 `passwordReference` / `keyReference` / `tokenReference` / `servicePrincipalSecretReference`。
- **将本地网关连接请求正文模板化为明文形式** — `OnPremisesGateway` 要求使用各网关成员的 RSA 加密凭据。
- **将已发布的单源数据流原地转换为多源数据流** — 绑定会漂移到不一致状态；应新建数据流并停用旧数据流。
- **通过 `updateDefinition` 持久化未经预览的候选 M 代码** — `executeQuery` 比先执行 `updateDefinition`、再通过调试刷新来排查问题的循环快得多。参见 [mashup-preview.md](references/mashup-preview.md)。
- **针对生产数据量级的数据源执行无界预览** — `executeQuery` 会返回完整的求值数据集。请在仅用于预览的文档中注入 `Table.FirstN` / `TOP N` / 日期谓词，并在保存前移除。参见 [mashup-preview.md § 严格避免](references/mashup-preview.md#hard-avoid-unbounded-production-volume-preview)。
- **混淆 `executeQuery` 与 `EvaluateQuery`。** `EvaluateQuery` 要求事先成功刷新；`executeQuery` + `customMashupDocument` 则不需要。在创作预览循环中使用 `executeQuery`。
- **在 Windows/PowerShell 上使用内联 `--body`** — `cmd.exe` 会破坏引号；始终使用 `--body "@$env:TEMP\<name>.json"`。

### 优先选择

- **使用一次性 `updateDefinition` 携带实际的 M + `connections[]`**，而不是先引导绑定再保存——这样可减少一次 HTTP 往返；两者在功能上等效。对于教学式分步演示，或引导阶段的 M 需要与生产环境的 M 不同时，请使用两步形式（例如 [mashup-preview.md](references/mashup-preview.md#bootstrap-branch--new-dataflow--new-credentialed-source) 中的引导分支）。
- **优先使用 `az rest`，而不是原始 `curl`**——它会自动处理令牌获取和刷新。仅在需要捕获响应头时（例如 202 LRO 的 `Location`）才回退到 `curl`——`az rest` 无法做到这一点。
- **先执行 `getDefinition`，再执行 `updateDefinition`**——读取-修改-写入可防止意外丢失数据；`updateDefinition` 是完整替换。
- **在 `updateDefinition` 上使用 `?updateMetadata=true`**——确保应用 `.platform` 更改（显示名称）。
- **使用 `jq` 操作 JSON**——以编程方式构建定义负载。
- **在作业执行中使用 `"Automatic"` 作为参数类型**——让引擎根据定义进行推断。
- **使用环境变量（`WS_ID`、`DF_ID`、`API`、`RESOURCE`）**，以便复用脚本。
- **批量验证连接**——刷新前，一次性循环遍历 `queryMetadata.json connections[]` 并调用 `GET /v1/connections/{id}`；还可选择调用 `POST /v1/connections/{id}/testConnection`，以发现凭据轮换问题。
- **提交新数据流前提供预览图表**——将示例数据渲染为 ASCII 图表，以便用户验证输出形状和值。

### 故障排除

| 症状 | 修复方法 |
|---|---|
| 401 Unauthorized | 验证 `az login` 是否仍处于有效状态；检查 `--resource "https://api.fabric.microsoft.com"`（对于 PBI v2，则为 `https://analysis.windows.net/powerbi/api`，**末尾不要带斜杠**）。 |
| 对 `getDefinition` 调用出现 405 Method Not Allowed | 使用 POST，而不是 GET。 |
| `updateDefinition` 悄无声息地丢弃查询 | 发送全部 3 个部分（`mashup.pq`、`queryMetadata.json`、`.platform`）。 |
| `executeQuery` → 400 `DataflowExecuteQueryError: Invalid query name` | 请求正文使用了 `{"queries":[…]}` 数组结构——这种形式始终会失败。改用顶层 `{"QueryName":"<shared>"}`（PascalCase 是规范写法；在线路传输时，该字段不区分大小写）。 |
| `executeQuery` → 400 `DataflowExecuteQueryError: ErrorCode: QueryNotFound` | `QueryName` 的值与持久化 M 或提供的 `customMashupDocument` 中任何 `shared` 成员都不匹配。通过 `getDefinition` → 解码 `mashup.pq` 来列出查询。 |
| 成功绑定后，`GET /items/{id}/connections` 返回 0 | 该端点反映的是刷新后实体化的状态，而不是定义。通过 `getDefinition` → 解码 `queryMetadata.json.connections[]` 进行验证。 |
| 从 `gatewayClusterDatasources/{id}` 获取 `ClusterId` 时出现 404 / `PowerBIEntityNotFound` | 按 ID 路由无法解析云连接。请使用列表并筛选：`GET .../gatewayClusterDatasources --query "value[?id=='$CONN_ID'] \| [0].clusterId"`，受众为 `https://analysis.windows.net/powerbi/api`（无斜杠）。新创建的连接可能需要 5-15 秒才会出现——请重试。请参阅 [connection-management.md § 解析 ClusterId](references/connection-management.md#resolving-clusterid-power-bi-v2)。 |
| `updateDefinition` 后首次运行刷新失败（数据陈旧、更改缺失） | 每次更改定义后的首次刷新，请求正文都必须包含 `{"executionData":{"executeOption":"ApplyChangesIfNeeded"}}`。 |
| 刷新失败并显示 "Connection not found" | 从 `queryMetadata.json` 中提取 `connectionId`（复合值），解析 `DatasourceId`，并通过 `GET /v1/connections/{id}` 确认。 |
| `updateDefinition` 后缺少 `connections[]` | 读取-修改-写入操作根据不包含绑定的快照重建了 `queryMetadata.json`。重新绑定，并在刷新前再次执行 `updateDefinition`。 |
| 创建并绑定后，刷新报告 "connection not found" | `queryMetadata.json` 中的 ID 格式错误。REST `id` 是普通 GUID；`connectionId` 是字符串化的复合值 `{"ClusterId":"…","DatasourceId":"…"}`。 |
| `formatVersion` 不匹配错误 | 在 `queryMetadata.json` 中设置 `formatVersion: "202502"`。 |
| 未启用快速复制 | 在 `mashup.pq` 中的 `section` 之前添加 `[StagingDefinition = [Kind = "FastCopy"]]`。 |
| LRO 轮询返回 404 | 使用 `Location` 响应头中的 URL——不要手动构造操作 URL。 |
| 429 Too Many Requests | 遵循 `Retry-After`；使用指数退避。 |
| Base64 解码产生乱码 | 去除末尾换行符；使用 `base64 -w0`（Linux）。 |
| Windows 上内联 `--body "<json>"` 返回 400 / 空正文 | `cmd.exe` 参数解析器在启动 `az.exe` 时会破坏引号。写入 `$env:TEMP\body.json`（UTF-8，无 BOM），并传递 `--body "@$env:TEMP\body.json"`。请参阅 [authoring-script-templates.md § PowerShell — 使用定义创建数据流](references/authoring-script-templates.md#powershell--create-dataflow-with-definition)。 |
| 刷新失败，显示 `EntityUserFailure` / "Something went wrong" 且没有详细信息 | (1) 确认创建后调用了 `updateDefinition`；(2) 检查凭据类型——在租户条件访问策略下，`OAuth2`+`singleSignOnType: None` 经常导致无人值守刷新失败；优先使用 `WorkspaceIdentity`/`ServicePrincipal`；(3) 对数据流执行 `executeQuery`，以隔离 M+数据源问题；(4) `GET https://api.powerbi.com/v1.0/myorg/groups/{ws}/dataflows/{df}/transactions`（PBI v1.0）有时会返回更丰富的实体级错误。 |

---

## 示例

> **平台说明** — 以下示例使用 bash。在 Windows / PowerShell 上，bash 模式（`MASHUP='...'` heredoc、`echo -n | base64 -w0`、`tr -d '\r' | grep -i location | awk`）会带来实际的转义难题和刷新模式不稳定问题。下文两个最容易遇到问题的示例（创建和刷新）中提供了 **PowerShell 变体**的链接。有关完整的 PowerShell 模板（创建、刷新、验证连接、绑定连接、创建云连接），请参阅：[authoring-script-templates.md § PowerShell](references/authoring-script-templates.md)。在 PowerShell 上，建议使用 `--body "@$env:TEMP\body.json"`，并通过 `[IO.File]::WriteAllText($path, $body, [System.Text.UTF8Encoding]::new($false))` 写入正文，而不要使用 `Out-File`（它会在 Windows PowerShell 5.1 中写入 UTF-8 BOM，导致 `az.exe` 无法解析正文），也不要使用内联的 `--body "{...}"`（它会被 `cmd.exe` 破坏）。

### 示例 1：从头创建 Dataflow Gen2

**提示词**：“创建一个新的 Dataflow Gen2，通过 Web 连接器读取公共 CSV，并对其进行验证。”

**智能体响应** — [工作流 A](#a-create-a-new-dataflow-end-to-end) 的可运行 bash 实现。PowerShell 变体：[authoring-script-templates.md § 端到端冒烟测试](references/authoring-script-templates.md#end-to-end-smoke-test)。

```bash
# Prereqs: az login, jq, base64, uuidgen. Workspace must support Dataflow Gen2.
WS_ID="<workspaceId>"
DF_NAME="my-titanic-df"
CONN_NAME="my-titanic-web-conn"
URL="https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
RES="https://api.fabric.microsoft.com"; API="$RES/v1"
PBI="https://analysis.windows.net/powerbi/api"   # NO trailing slash

# Step 1: List existing connections, try to reuse by name.
CONN_ID=$(az rest --method get --resource "$RES" --url "$API/connections" \
  --query "value[?displayName=='$CONN_NAME'] | [0].id" -o tsv)

# Step 2: Create if missing (Web + Anonymous; see connection-management.md for other shapes).
if [ -z "$CONN_ID" ] || [ "$CONN_ID" = "null" ]; then
  BODY_FILE=$(mktemp --suffix=.json 2>/dev/null || mktemp)  # GNU + BSD/macOS compatible
  cat > "$BODY_FILE" <<EOF
{
  "displayName": "$CONN_NAME",
  "connectivityType": "ShareableCloud",
  "connectionDetails": {
    "type": "Web", "creationMethod": "Web",
    "parameters": [{"name": "url", "dataType": "Text", "value": "$URL"}]
  },
  "privacyLevel": "Organizational",
  "credentialDetails": {
    "singleSignOnType": "None", "connectionEncryption": "NotEncrypted",
    "skipTestConnection": false,
    "credentials": {"credentialType": "Anonymous"}
  }
}
EOF
  CONN_ID=$(az rest --method post --resource "$RES" --url "$API/connections" \
    --headers "Content-Type=application/json" --body "@$BODY_FILE" --query id -o tsv)
  rm -f "$BODY_FILE"
fi

# Step 3: Resolve ClusterId via list+filter; retry — PBI v2 lags by 5-15s on new conns.
for i in 1 2 3 4 5 6 7 8; do
  CLUSTER_ID=$(az rest --method get --resource "$PBI" \
    --url "https://api.powerbi.com/v2.0/myorg/me/gatewayClusterDatasources" \
    --query "value[?id=='$CONN_ID'] | [0].clusterId" -o tsv 2>/dev/null)
  [ -n "$CLUSTER_ID" ] && [ "$CLUSTER_ID" != "null" ] && break
  sleep $((i*3))
done
# Fail-fast: an empty ClusterId silently corrupts the composite connectionId and the
# resulting updateDefinition / refresh failures are hard to debug. Stop here instead.
if [ -z "$CLUSTER_ID" ] || [ "$CLUSTER_ID" = "null" ]; then
  echo "FAIL: ClusterId not resolved for $CONN_ID after retries. Verify the connection is visible at PBI v2 (api.powerbi.com/v2.0/myorg/me/gatewayClusterDatasources)." >&2
  exit 1
fi

# Step 4: Create empty dataflow shell (sync 201).
SHELL_BODY=$(mktemp --suffix=.json 2>/dev/null || mktemp)
printf '{"displayName":"%s"}' "$DF_NAME" > "$SHELL_BODY"
DF_ID=$(az rest --method post --resource "$RES" \
  --url "$API/workspaces/$WS_ID/dataflows" \
  --headers "Content-Type=application/json" \
  --body "@$SHELL_BODY" --query id -o tsv)
rm -f "$SHELL_BODY"

# Step 5: One-shot updateDefinition — real M + composite-bound connections[] + .platform.
MASHUP='section Section1;
shared Titanic = let
    Source = Csv.Document(Web.Contents("'"$URL"'"), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
in Headers;'

COMPOSITE_ID="{\"ClusterId\":\"$CLUSTER_ID\",\"DatasourceId\":\"$CONN_ID\"}"
QUERY_META=$(jq -n --arg name "$DF_NAME" --arg cid "$COMPOSITE_ID" --arg url "$URL" --arg qid "$(uuidgen)" '{
  formatVersion: "202502",
  name: $name,
  queriesMetadata: { Titanic: { queryId: $qid, queryName: "Titanic" } },
  connections: [ { connectionId: $cid, kind: "Web", path: $url } ]
}')
PLATFORM=$(jq -n --arg name "$DF_NAME" --arg lid "$(uuidgen)" '{
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
  metadata: { type: "Dataflow", displayName: $name },
  config: { version: "2.0", logicalId: $lid }
}')

MASHUP_B64=$(echo -n "$MASHUP" | base64 -w0)
META_B64=$(echo -n "$QUERY_META" | base64 -w0)
PLAT_B64=$(echo -n "$PLATFORM" | base64 -w0)

BODY_FILE=$(mktemp --suffix=.json 2>/dev/null || mktemp)  # GNU + BSD/macOS compatible
cat > "$BODY_FILE" <<EOF
{"definition":{"parts":[
  {"path":"mashup.pq",          "payload":"${MASHUP_B64}", "payloadType":"InlineBase64"},
  {"path":"queryMetadata.json", "payload":"${META_B64}",   "payloadType":"InlineBase64"},
  {"path":".platform",          "payload":"${PLAT_B64}",   "payloadType":"InlineBase64"}
]}}
EOF
az rest --method post --resource "$RES" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/updateDefinition?updateMetadata=true" \
  --headers "Content-Type=application/json" --body "@$BODY_FILE"
rm -f "$BODY_FILE"

# Step 6: Verify connections[] persisted via getDefinition (NOT /items/{id}/connections).
# Assumes the sync 200 fast-path (typical, ~1s). If the call ever returns 202 LRO,
# az rest can't expose the Location header — switch to the curl + poll pattern from
# Example 3 / authoring-script-templates.md and decode the polled 200 body instead.
PERSISTED=$(az rest --method post --resource "$RES" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/getDefinition" \
  --headers "Content-Length=0" \
  | jq -r '.definition.parts[] | select(.path=="queryMetadata.json") | .payload' | base64 -d \
  | jq -r '.connections | length')
[ "${PERSISTED:-0}" -gt 0 ] && echo "OK: connections[] persisted." || { echo "FAIL: bind missing (or getDefinition returned a 202 LRO body — see note above)." >&2; exit 1; }

# Step 7 (optional): Validate the M evaluates — top-level QueryName, PascalCase.
EQ_BODY=$(mktemp --suffix=.json 2>/dev/null || mktemp)
printf '{"QueryName":"Titanic"}' > "$EQ_BODY"
az rest --method post --resource "$RES" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/executeQuery" \
  --headers "Content-Type=application/json" \
  --body "@$EQ_BODY" --output-file /tmp/titanic.arrow
rm -f "$EQ_BODY"
# Apache Arrow stream — embedded {"Error":"..."} means failure even on HTTP 200.
grep -q '"Error":"' /tmp/titanic.arrow && { echo "executeQuery surfaced an error." >&2; exit 1; }

# Step 8 (optional): Trigger refresh with ApplyChangesIfNeeded on first run — see Example 2.
```

### 示例 2：触发刷新作业

**提示词**：“触发此数据流的刷新，并轮询直至完成。”

**代理响应**：

```bash
# Trigger refresh (returns 202 + Location header for polling).
# jobType MUST be "Refresh"; "Pipeline" returns 400 InvalidJobType.
# On the first refresh after any updateDefinition, body MUST include executeOption=ApplyChangesIfNeeded
# (otherwise Fabric refreshes the previously-applied definition).
# Acquire $TOKEN per common/COMMON-CLI.md § Token-in-Variable Pattern (resource = https://api.fabric.microsoft.com).
LOCATION=$(curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"executionData":{"executeOption":"ApplyChangesIfNeeded"}}' \
  "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/jobs/instances?jobType=Refresh" \
  -o /dev/null -D - | tr -d '\r' | grep -i "^location:" | awk '{print $2}')

# Poll while the status is non-terminal. Fabric refresh job status enum:
#   NotStarted / InProgress   -> non-terminal, keep polling
#   Completed                 -> success
#   Failed / Cancelled        -> terminal backend outcome (fatal-stop)
#   Deduped                   -> another refresh is already running; this trigger was skipped (NOT success)
# Treat ONLY NotStarted/InProgress as non-terminal and break on anything else, so a newly-added
# terminal status surfaces immediately instead of waiting out MAX_POLLS (the contract notes more
# status values may be added over time). MAX_POLLS bounds the wait if the job never terminates.
ATTEMPT=0; MAX_POLLS="${MAX_POLLS:-60}"
while [ "$ATTEMPT" -lt "$MAX_POLLS" ]; do
  STATUS=$(az rest --method get --url "$LOCATION" \
    --resource "https://api.fabric.microsoft.com" --query "status" -o tsv)
  echo "Status: $STATUS"
  case "$STATUS" in NotStarted|InProgress) ;; *) break ;; esac
  sleep 10; ATTEMPT=$((ATTEMPT + 1))
done
case "$STATUS" in
  Completed) : ;;  # success (exit 0)
  Deduped)
    # Concurrency, not success: another refresh is already running and this trigger was skipped.
    # Monitor the in-flight instance instead of re-triggering. Exit non-zero so automation does not
    # mistake a skipped trigger for a completed refresh.
    echo "Refresh deduplicated — another instance is already running; monitor that instance instead of re-triggering."
    exit 2 ;;
  NotStarted|InProgress)
    # Max-poll bound reached before any terminal status — a polling timeout, NOT a terminal outcome.
    # Surface the raw job instance and stop; do not assume success.
    echo "Polling stopped after ${MAX_POLLS} attempts with non-terminal status '$STATUS' (max-poll timeout, not a terminal outcome)."
    az rest --method get --url "$LOCATION" --resource "https://api.fabric.microsoft.com"
    exit 1 ;;
  *)  # Failed / Cancelled (or any other terminal status): a terminal backend outcome — not something
      # to debug-loop. Surface the job's raw error (the job-instance body's .failureReason, an
      # ErrorResponse with .errorCode / .isRetriable / .message) and STOP. Do NOT re-trigger or keep
      # polling when .failureReason.isRetriable=false or the error is workspace-wide.
      az rest --method get --url "$LOCATION" --resource "https://api.fabric.microsoft.com"
      exit 1 ;;
esac
```

**PowerShell 变体**（`Invoke-WebRequest` 原生公开响应标头；避免使用 `tr | grep | awk` 管道）：

```powershell
# Notes:
# - $Resp.Headers["Location"] returns string or string[] depending on PS version — never
#   use .Location[0] (returns first character on Windows PS 5.1 plain-string case).
# - Wrap Invoke-WebRequest in try/catch on 5.1 (-SkipHttpErrorCheck is PS 7+).
# - Fabric refresh job status enum: NotStarted / InProgress (non-terminal); Completed (success);
#   Failed / Cancelled (fatal); Deduped (another refresh already running — NOT success). Treat only
#   NotStarted/InProgress as non-terminal and break on anything else, bounded by a max-poll count, so
#   a newly-added terminal status surfaces immediately instead of waiting out $MaxPolls.
#   This is distinct from the LRO operation enum (Running / Succeeded / Failed / Cancelled).
#   Refresh "success" = "Completed", not "Succeeded".
# Acquire $Token per common/COMMON-CLI.md § Token-in-Variable Pattern (resource = https://api.fabric.microsoft.com).
try {
  $Resp = Invoke-WebRequest -Method POST -UseBasicParsing `
    -Uri "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/dataflows/$DF_ID/jobs/instances?jobType=Refresh" `
    -Headers @{ Authorization = "Bearer $Token"; "Content-Type" = "application/json" } `
    -Body '{"executionData":{"executeOption":"ApplyChangesIfNeeded"}}'
} catch {
  Write-Error "Refresh trigger failed: $($_.Exception.Message)"; exit 1
}
$Location = $Resp.Headers["Location"]
if ($Location -is [array]) { $Location = $Location[0] }

$Attempt = 0; $MaxPolls = 60
do {
  $Status = az rest --method get --url $Location `
    --resource "https://api.fabric.microsoft.com" --query "status" -o tsv
  Write-Host "Status: $Status"
  if ($Status -notin 'NotStarted','InProgress') { break }
  Start-Sleep -Seconds 10; $Attempt++
} while ($Attempt -lt $MaxPolls)
if ($Status -in 'NotStarted','InProgress') {
  # Max-poll bound reached before any terminal status — a polling timeout, NOT a terminal outcome.
  Write-Host "Polling stopped after $MaxPolls attempts with non-terminal status '$Status' (max-poll timeout, not a terminal outcome)."
  az rest --method get --url $Location --resource "https://api.fabric.microsoft.com"
  exit 1
}
switch ($Status) {
  'Completed' { }  # success (exit 0)
  'Deduped' {
    # Concurrency, not success: another refresh is already running and this trigger was skipped.
    # Exit non-zero so callers don't treat a skipped trigger as a completed refresh.
    Write-Host "Refresh deduplicated — another instance is already running; monitor that instance instead of re-triggering."
    exit 2
  }
  default {
    # Failed / Cancelled (or any other terminal status): a terminal backend outcome — surface the job's
    # raw error (the job-instance body's .failureReason: .errorCode / .isRetriable / .message) and STOP;
    # do not re-trigger or debug-loop when failureReason.isRetriable=false or the error is workspace-wide.
    az rest --method get --url $Location --resource "https://api.fabric.microsoft.com"
    Write-Error "Refresh terminated '$Status' (not Completed)"; exit 1
  }
}
```

### 示例 3：修改现有数据流的定义

**提示词**：“使用修改后的查询更新现有数据流的 mashup。”

**智能体响应** — 读取-修改-写入循环。在典型情况下，`getDefinition` 会同步返回 200；此模板也处理 202 + LRO 分支。

```bash
RESOURCE="https://api.fabric.microsoft.com"
# Acquire $TOKEN per common/COMMON-CLI.md § Token-in-Variable Pattern (resource = $RESOURCE).

# 1. Read current definition (sync 200 or 202 LRO — handle both).
HDR=$(mktemp); BODY=$(mktemp)
CODE=$(curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Length: 0" \
  "$RESOURCE/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/getDefinition" \
  -D "$HDR" -o "$BODY" -w "%{http_code}")
if [ "$CODE" = "202" ]; then
  LOC=$(tr -d '\r' < "$HDR" | grep -i "^location:" | awk '{print $2}')
  RETRY=$(tr -d '\r' < "$HDR" | grep -i "^retry-after:" | awk '{print $2}'); RETRY=${RETRY:-5}
  while :; do
    sleep "$RETRY"
    OP=$(az rest --method get --resource "$RESOURCE" --url "$LOC")
    case "$(echo "$OP" | jq -r '.status // empty')" in
      Succeeded) DEF=$(az rest --method get --resource "$RESOURCE" --url "${LOC%/}/result"); break ;;
      Failed|Cancelled) echo "ERROR: getDefinition $(echo "$OP" | jq -r '.status')" >&2; exit 1 ;;
    esac
  done
else
  DEF=$(cat "$BODY")
fi
rm -f "$HDR" "$BODY"

# 2. Decode each part, modify mashup.pq, re-encode all 3.
MASHUP=$(echo "$DEF" | jq -r '.definition.parts[] | select(.path=="mashup.pq")          | .payload' | base64 -d)
META=$(  echo "$DEF" | jq -r '.definition.parts[] | select(.path=="queryMetadata.json") | .payload' | base64 -d)
PLAT=$(  echo "$DEF" | jq -r '.definition.parts[] | select(.path==".platform")          | .payload' | base64 -d)

NEW_MASHUP=$(echo "$MASHUP" | sed 's/old-pattern/new-pattern/')   # edit M here

MASHUP_B64=$(echo -n "$NEW_MASHUP" | base64 -w0)
META_B64=$(echo -n "$META"        | base64 -w0)
PLAT_B64=$(echo -n "$PLAT"        | base64 -w0)

# 3. Build the updateDefinition body in a temp file (full replacement — all 3 parts).
BODY_FILE=$(mktemp --suffix=.json 2>/dev/null || mktemp)  # GNU + BSD/macOS compatible
cat > "$BODY_FILE" <<EOF
{"definition":{"parts":[
  {"path":"mashup.pq",          "payload":"${MASHUP_B64}", "payloadType":"InlineBase64"},
  {"path":"queryMetadata.json", "payload":"${META_B64}",   "payloadType":"InlineBase64"},
  {"path":".platform",          "payload":"${PLAT_B64}",   "payloadType":"InlineBase64"}
]}}
EOF
az rest --method post --resource "$RESOURCE" \
  --url "$RESOURCE/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/updateDefinition?updateMetadata=true" \
  --headers "Content-Type=application/json" --body "@$BODY_FILE"
rm -f "$BODY_FILE"
```

> 要绑定新连接？示例 1（步骤 1-5）是规范的绑定并保存流程。仅绑定的演练说明位于 [authoring-cli-quickref.md § 连接绑定快速模式](references/authoring-cli-quickref.md#connection-binding-quick-patterns)和 [authoring-script-templates.md § 连接绑定模板](references/authoring-script-templates.md#connection-binding-templates)。

---

## 输出要求

当此技能完成任务时，代理应返回：

| 字段 | 约定 |
|---|---|
| **详细程度** | 简明总结（3–10 行），说明创建或修改了哪些内容。 |
| **默认格式** | 状态报告使用 Markdown；单资源响应使用带围栏的 JSON 代码块；列表响应使用 Markdown 表格。 |
| **副作用披露** | 明确报告已创建、修改或删除的 ID，以及目标工作区 ID。绝不能在没有 ID 的情况下暗示操作成功。当你保存或替换了数据流定义时，请在正文中列出所写入的部分——`mashup.pq`、`queryMetadata.json`、`.platform`——因为较长的命令正文会在记录中被截断，否则这些部分的名称将会丢失。还要说明实际使用的持久化路径：通过该端点保存定义时使用 `updateDefinition`；在创建时提供定义时，使用创建调用 `POST /v1/workspaces/{ws}/dataflows`。如果定义是通过创建 POST 持久化的，不要声称使用了 `updateDefinition`。 |
| **验证** | 在宣布完成之前，重新 `GET` 受影响的资源（数据流、连接、作业实例），并展示其状态（例如 `provisionState`、`status`、`Completed`）。 |
| **错误呈现** | 如果任何步骤返回非 2xx 状态、LRO `Failed`/`Cancelled`，或 Arrow 流 `{"Error":"..."}`，请逐字传递原始错误并停止。终态刷新结果为 `Failed`/`Cancelled`、后端错误包含 `isRetriable: false`，或工作区范围的 `UnknownException`，均属于**致命停止**条件——报告该错误并结束；不要重新触发、重新轮询或进入长时间的调试循环。 |
| **预览渲染（工作流 C）** | 在 `executeQuery` 之后，在聊天中将结果的 head(10) 渲染为 Markdown 表格，并与保存的 Arrow 文件一同展示——即使嵌入式错误检查已通过也要如此。这样可以捕获嵌入式错误检测器无法发现的静默成功缺陷（过滤器删除了所有行、列错误、差一错误、类型转换错误）。代码片段和抑制规则：[dataflows-consumption-cli § 示例 5b](../dataflows-consumption-cli/SKILL.md#example-5b-render-query-results-as-a-markdown-table)。 |
| **API 名称** | 当回答引用 API 端点或请求正文字段时，请使用其精确且区分大小写的名称（`executeQuery`、`customMashupDocument`、`QueryName`、`mashup.pq`、`queryMetadata.json`、`GET /v1/connections/supportedConnectionTypes`），而不要使用意译或复数形式。 |