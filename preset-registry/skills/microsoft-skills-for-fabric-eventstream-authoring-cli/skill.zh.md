---
name: eventstream-authoring-cli
description: >
  Create, wire, and publish Fabric Eventstream real-time streaming topologies via
  the Items REST API. Build definitions with 25 source types (Event Hubs, IoT Hub,
  CDC, Kafka, SampleData), 8 operators (Filter, Aggregate, GroupBy, Join,
  ManageFields, Union, Expand, SQL), 4 destinations (Lakehouse, Eventhouse,
  Activator, Custom Endpoint), DefaultStream/DerivedStream routing. **Invoke this
  skill** to: (1) author Eventstream topology, (2) add Event Hub source, (3) add
  filter operator, (4) add CDC source with Debezium flattening, (5) wire
  destinations, (6) modify/delete Eventstream definitions. Invoke before making
  topology changes. Triggers: "create eventstream", "deploy eventstream",
  "eventstream topology", "add source to eventstream", "add event hub source",
  "add filter operator", "eventstream filter", "eventstream destination",
  "CDC source", "eventstream operator", "eventstream definition",
  "update eventstream", "wire eventstream", "real-time ingestion pipeline",
  "eventstream topology deployment".
---
> **更新检查 — 每个会话仅一次（必需）**
> 本会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程的 package.json 版本。
> - 如果本会话之前已经执行过该检查，请跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. Eventstream ≠ Eventhouse。Eventstream 是实时事件引入和路由管道。对于 KQL 数据库操作，请使用 `eventhouse-authoring-cli` 或 `eventhouse-consumption-cli`。

# Eventstream 创作 — CLI 技能

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必需** — *首先阅读链接* [根据名称查找工作区 ID，或根据名称、项目类型和工作区 ID 查找项目 ID 时需要] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助工具 |
| 注意事项与故障排除（CLI 特有） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特有）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、Shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| Eventstream 资源模型 | [EVENTSTREAM-AUTHORING-CORE.md § Eventstream 资源模型](../../common/EVENTSTREAM-AUTHORING-CORE.md#eventstream-resource-model) | **首先阅读** — 包含源、运算符、流和目标的基于图的拓扑 |
| 源配置 | [EVENTSTREAM-AUTHORING-CORE.md § 源配置](../../common/EVENTSTREAM-AUTHORING-CORE.md#source-configuration) | API 支持的 25 种源类型及各源属性 |
| 转换运算符 | [EVENTSTREAM-AUTHORING-CORE.md § 转换运算符](../../common/EVENTSTREAM-AUTHORING-CORE.md#transformation-operators) | 8 种运算符类型：Filter、Aggregate、GroupBy、Join、ManageFields、Union、Expand、SQL |
| 目标配置 | [EVENTSTREAM-AUTHORING-CORE.md § 目标配置](../../common/EVENTSTREAM-AUTHORING-CORE.md#destination-configuration) | API 支持的 4 种目标类型及节点架构 |
| 流类型 | [EVENTSTREAM-AUTHORING-CORE.md § 流类型](../../common/EVENTSTREAM-AUTHORING-CORE.md#stream-types) | DefaultStream（自动）和 DerivedStream（由运算符生成） |
| Eventstream 生命周期（REST API） | [EVENTSTREAM-AUTHORING-CORE.md § Eventstream 生命周期（REST API）](../../common/EVENTSTREAM-AUTHORING-CORE.md#eventstream-lifecycle-rest-api) | CRUD + 定义端点 |
| 项目定义与部署 | [EVENTSTREAM-AUTHORING-CORE.md § 项目定义与部署](../../common/EVENTSTREAM-AUTHORING-CORE.md#item-definitions-and-deployment) | eventstream.json 的 Base64 编码模式 |
| 注意事项与限制 | [EVENTSTREAM-AUTHORING-CORE.md § 注意事项与限制](../../common/EVENTSTREAM-AUTHORING-CORE.md#gotchas-and-limitations) | 最多 11 个自定义端点、Base64 编码、命名约束 |
| 创建 Eventstream | [SKILL.md § 创建 Eventstream](#create-an-eventstream) | |
| 部署完整拓扑 | [SKILL.md § 部署完整拓扑](#deploy-full-topology) | 端到端：构建拓扑 JSON → Base64 编码 → 提交定义 |
| 更新 Eventstream 拓扑 | [SKILL.md § 更新 Eventstream 拓扑](#update-eventstream-topology) | |
| 删除 Eventstream | [SKILL.md § 删除 Eventstream](#delete-an-eventstream) | |
| 注意事项、规则、故障排除 | [SKILL.md § 注意事项、规则、故障排除](#gotchas-rules-troubleshooting) | **必须执行 / 避免 / 优先选择** 检查清单 |

---

## 创建 Eventstream

创建一个空的 Eventstream 项，然后通过定义 API 为其配置源、目标和运算符。

### 第 1 步：创建项

```bash
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body '{"displayName": "my-eventstream", "description": "IoT sensor pipeline"}'
```

将返回的 `id` 保存为 `EVENTSTREAM_ID`。

### 第 2 步：构建拓扑

使用源、流、运算符和目标构建 `eventstream.json` 拓扑。每个节点都通过 `inputNodes` 引用其上游节点。

建议以编程方式构建 JSON，以避免序列化错误。关键规则：
- 拓扑必须恰好包含一个 DefaultStream——所有源都通过 `inputNodes` 输入其中
- 运算符通过 `inputNodes[].name` 引用其输入
- DerivedStreams 的属性中必须包含 `inputSerialization`
- 目标引用其输入流或运算符

### 第 3 步：部署定义

对拓扑 JSON 进行 Base64 编码，并通过定义 API 提交。有关完整的有效负载结构，请参阅[项定义与部署](../../common/EVENTSTREAM-AUTHORING-CORE.md#item-definitions-and-deployment)。

---

## 部署完整拓扑

要通过单次 API 调用部署包含拓扑的完整 Eventstream，请使用“使用定义创建项”端点：

```bash
# 1. Build eventstream.json content (topology)
TOPOLOGY_JSON='{"compatibilityLevel":"1.1","sources":[...],"streams":[...],"operators":[...],"destinations":[...]}'

# 2. Build eventstreamProperties.json (optional — controls retention and throughput)
PROPERTIES_JSON='{"retentionTimeInDays":1,"eventThroughputLevel":"Low"}'

# 3. Base64-encode both (no line wraps)
TOPOLOGY_B64=$(echo -n "$TOPOLOGY_JSON" | base64 -w 0)
PROPERTIES_B64=$(echo -n "$PROPERTIES_JSON" | base64 -w 0)

# 4. Submit via Items API
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/items" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body "{
    \"displayName\": \"my-eventstream\",
    \"type\": \"Eventstream\",
    \"definition\": {
      \"parts\": [
        {
          \"path\": \"eventstream.json\",
          \"payload\": \"${TOPOLOGY_B64}\",
          \"payloadType\": \"InlineBase64\"
        },
        {
          \"path\": \"eventstreamProperties.json\",
          \"payload\": \"${PROPERTIES_B64}\",
          \"payloadType\": \"InlineBase64\"
        }
      ]
    }
  }"
```

> **注意：** 如果省略 `eventstreamProperties.json`，API 将应用默认值：`retentionTimeInDays: 1`、`eventThroughputLevel: "Low"`。若要控制保留期（1–90 天）和吞吐量，请显式包含该文件。

> 在 Windows (PowerShell) 上，请使用 `[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))` 进行 Base64 编码。

---

## 更新 Eventstream 拓扑

1. **获取当前定义**：`POST /v1/workspaces/{wsId}/eventstreams/{esId}/getDefinition`
2. **解码** base64 编码的 `eventstream.json` 有效负载
3. **修改**拓扑（添加/删除/更新节点）
4. **重新编码**为 base64
5. **提交**：`POST /v1/workspaces/{wsId}/eventstreams/{esId}/updateDefinition`

> **API 注意事项**：Eventstream Definition API 使用带操作动词的 `POST`（`getDefinition`、`updateDefinition`），而不是对 `/definition` 资源使用 `GET`/`PUT`。这遵循 Fabric Items Definition 模式。请参阅[官方文档](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/api-get-eventstream-definition)。

对于长时间运行的操作，Update Definition API 会返回 `202 Accepted`。轮询 `Location` 标头中的 URL，直至操作完成。

### 添加筛选运算符

> **⚠️ 关键**：筛选运算符条件中的 `column` 和 `value` 使用**嵌套对象**，而不是裸字符串。使用 `"column": "temperature"` 而不是下面所示的对象形式，将导致 API 静默拒绝请求。

```json
{
  "name": "FilterHighTemp",
  "type": "Filter",
  "inputNodes": [{"name": "my-stream"}],
  "properties": {
    "conditions": [{
      "column": {
        "node": null,
        "columnName": "temperature",
        "columnPath": null,
        "expressionType": "ColumnReference"
      },
      "operatorType": "GreaterThan",
      "value": {
        "dataType": "Float",
        "value": "30.0",
        "expressionType": "Literal"
      }
    }]
  }
}
```

**所有运算符条件字段的必需结构：**
- `column` → 包含 `{node, columnName, columnPath, expressionType: "ColumnReference"}` 的对象
- `value` → 包含 `{dataType, value, expressionType: "Literal"}` 的对象
- `operatorType` → 字符串：`Equals`、`NotEquals`、`GreaterThan`、`GreaterThanOrEquals`、`LessThan`、`LessThanOrEquals`、`Contains`、`DoesNotContain`、`StartsWith`、`DoesNotStartWith`、`EndsWith`、`DoesNotEndWith`、`IsEmpty`、`IsNull`、`IsNotNull`、`IsNotNullOrEmpty`
- `dataType` → `BigInt`、`Float`、`Nvarchar(max)`、`DateTime`、`Bit`

同样的嵌套对象模式适用于**所有**引用列的运算符（Filter、Aggregate、GroupBy、Join、ManageFields）。

---

## 删除 Eventstream

```bash
az rest --method DELETE \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}" \
  --resource "https://api.fabric.microsoft.com"
```

成功时返回 `200 OK`。

---

## 易错点、规则与故障排除

### 必须执行

- 提交定义前，**始终对** `eventstream.json` 有效负载**进行 base64 编码**
- 调用 `az rest` 时，**始终传递 `--resource https://api.fabric.microsoft.com`**
- **始终使用 JMESPath 筛选**将工作区名称解析为 ID，并将项名称解析为 ID
- 对运算符的列/值引用，**始终使用嵌套对象**——使用 `"column": {"columnName": "x", "expressionType": "ColumnReference", ...}`，绝不能使用 `"column": "x"`（API 会静默拒绝裸字符串）
- **每个拓扑只能有一个 DefaultStream**——所有源都连接到该流（API 会拒绝多个 DefaultStream）
- **轮询 LRO 响应**——Update Definition 会返回带有 `Location` 标头的 `202 Accepted`

### 推荐

- 以编程方式构建拓扑 JSON，而不是手动拼接字符串
- 使用 `SampleData` 源类型进行测试和原型设计
- 显式设置 `retentionTimeInDays`，而不是依赖默认值
- 在源配置中引用云连接之前，先验证连接
- 使用 DerivedStreams，使运算符输出可在 Real-Time Hub 中使用

### 避免

- **不要**在定义负载中使用原始 JSON——必须对其进行 base64 编码
- **不要**在 Eventstream 显示名称中使用下划线或点号（会导致 SQL 运算符失效）
- **不要**在**用户定义的**拓扑节点名称（源、运算符、DerivedStreams、目标）中使用连字符、下划线、点号或空格——仅允许使用字母数字组成的 PascalCase（例如，使用 `FilterTemperature`，而不是 `filter-temperature` 或 `filter_temperature`）。例外：DefaultStream 名称由平台以 `{eventstreamName}-stream` 的形式自动生成，其中可能包含连字符——不要重命名
- **不要**让 CustomEndpoint 源与 CustomEndpoint/Eventhouse 直接引入目标的合计数量超过 11 个
- **不要**混淆 Eventstream 和 Eventhouse——它们是不同的 Fabric 工作负载
- **不要**对工作区或项目 ID 进行硬编码——始终通过 API 发现它们

---

## 示例

> **平台说明**——示例使用 PowerShell。始终通过
> `[IO.File]::WriteAllText()`（无 BOM）将 JSON 正文写入临时文件，并将
> `--body "@$file"` 传递给 `az rest`，而不是使用内联的 `--body "..."`，因为
> `cmd.exe` 可能会破坏其内容。将 `-Compress` 与 `ConvertTo-Json` 一起使用，以避免
> 换行问题。唯一可以安全内联的例外是用于空正文的 `--body '{}'`。

### 示例 1：创建带有源的 Eventstream

**提示词**：“在我的 dev 工作区中创建一个名为 SensorIngestion 的 Eventstream，并添加一个示例数据源。”

```powershell
# 1. Discover workspace ID
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='dev'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'dev' not found" }

# 2. Create empty Eventstream
$esBody = @{ displayName = "SensorIngestion"; description = "IoT sensor pipeline" } | ConvertTo-Json -Compress
$bodyFile = Join-Path ([IO.Path]::GetTempPath()) "es_create.json"
[IO.File]::WriteAllText($bodyFile, $esBody, [System.Text.UTF8Encoding]::new($false))
$created = az rest --method post `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams" `
  --resource "https://api.fabric.microsoft.com" `
  --headers "Content-Type=application/json" `
  --body "@$bodyFile" | ConvertFrom-Json

# 3. Get the created Eventstream ID from response
$esId = $created.id
if (-not $esId) { throw "Eventstream creation did not return an ID" }

# 4. Build topology — DefaultStream uses inputNodes (not parentName)
$topology = @{
    compatibilityLevel = "1.0"
    sources = @(@{
        name = "SampleSource"
        type = "SampleData"
        properties = @{ type = "Bicycles" }
    })
    streams = @(@{
        name = "SensorIngestion-stream"
        type = "DefaultStream"
        properties = @{}
        inputNodes = @(@{ name = "SampleSource" })
    })
    operators = @()
    destinations = @()
}
$topologyJson = $topology | ConvertTo-Json -Depth 10 -Compress
$topologyB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($topologyJson))

# 5. Deploy definition
$defBody = @{
    definition = @{
        parts = @(@{
            path = "eventstream.json"
            payload = $topologyB64
            payloadType = "InlineBase64"
        })
    }
} | ConvertTo-Json -Depth 5 -Compress
$defFile = Join-Path ([IO.Path]::GetTempPath()) "es_def.json"
[IO.File]::WriteAllText($defFile, $defBody, [System.Text.UTF8Encoding]::new($false))
# updateDefinition returns 202 Accepted (LRO). Use Invoke-WebRequest to capture headers.
$token = (az account get-access-token --resource "https://api.fabric.microsoft.com" --query accessToken -o tsv)
$ps5 = @{}; if ($PSVersionTable.PSVersion.Major -lt 6) { $ps5.UseBasicParsing = $true }
$response = Invoke-WebRequest @ps5 -Method Post `
  -Uri "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/updateDefinition" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json; charset=utf-8" `
  -Body (Get-Content $defFile -Raw -Encoding UTF8)

if ($response.StatusCode -eq 202) {
    $location = $response.Headers['Location']
    if ($location -is [array]) { $location = $location[0] }
    if (-not $location) { throw "LRO response missing Location header" }
    $ra = $response.Headers['Retry-After']
    if ($ra -is [array]) { $ra = $ra[0] }
    $retryAfter = if ($ra) { [int]$ra } else { 5 }
    $succeeded = $false
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds $retryAfter
        $poll = Invoke-RestMethod -Uri $location -Headers @{ Authorization = "Bearer $token" }
        if ($poll.status -eq 'Succeeded') { $succeeded = $true; Write-Host "Update succeeded"; break }
        elseif ($poll.status -in @('Failed', 'Cancelled')) {
            throw "updateDefinition LRO $($poll.status): $($poll.error.message)"
        }
    }
    if (-not $succeeded) { throw "updateDefinition LRO timed out" }
}
```

### 示例 2：使用 DerivedStream 添加筛选运算符

**提示词**：“向我的 SensorIngestion Eventstream 添加一个筛选器，仅保留 No_Bikes > 5 的事件，并将筛选后的输出公开为 DerivedStream。”

> **重要提示**：仅添加 Filter 运算符节点并不会重定向 DefaultStream。
> 要使筛选后的输出可供使用，请通过 `inputNodes` 将 DerivedStream（或目标）
> 连接到筛选器的输出。

```powershell
# 1. Discover workspace + Eventstream IDs
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='dev'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'dev' not found" }

$esId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='SensorIngestion'] | [0].id" -o tsv)
if (-not $esId) { throw "Eventstream 'SensorIngestion' not found" }

# 2. Get current definition (handles LRO via Location header)
$token = (az account get-access-token --resource "https://api.fabric.microsoft.com" --query accessToken -o tsv)
$ps5 = @{}; if ($PSVersionTable.PSVersion.Major -lt 6) { $ps5.UseBasicParsing = $true }
$response = Invoke-WebRequest @ps5 -Method Post `
  -Uri "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/getDefinition" `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{}'

if ($response.StatusCode -eq 202) {
    $location = $response.Headers['Location']
    if ($location -is [array]) { $location = $location[0] }
    if (-not $location) { throw "LRO response missing Location header" }
    $ra = $response.Headers['Retry-After']
    if ($ra -is [array]) { $ra = $ra[0] }
    $retryAfter = if ($ra) { [int]$ra } else { 5 }
    $def = $null
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds $retryAfter
        $poll = Invoke-RestMethod -Uri $location -Headers @{ Authorization = "Bearer $token" }
        if ($poll.status -eq 'Succeeded') {
            $def = Invoke-RestMethod -Uri "$location/result" `
              -Headers @{ Authorization = "Bearer $token" }
            break
        } elseif ($poll.status -in @('Failed', 'Cancelled')) {
            throw "getDefinition LRO $($poll.status): $($poll.error.message)"
        }
    }
    if (-not $def -or -not $def.definition) { throw "getDefinition LRO timed out (last status: $(if ($poll) { $poll.status } else { 'unknown' }))" }
} else {
    $def = $response.Content | ConvertFrom-Json
}

# 3. Decode existing topology
$esPart = $def.definition.parts | Where-Object { $_.path -eq 'eventstream.json' } | Select-Object -First 1
if (-not $esPart) { throw "eventstream.json part not found in definition" }
$topology = [Text.Encoding]::UTF8.GetString(
  [Convert]::FromBase64String($esPart.payload)) | ConvertFrom-Json

# 4. Add Filter operator (PascalCase name — no underscores or hyphens)
#    Column: expressionType + columnName; Value: expressionType + dataType + value
$filter = @{
    name = "FilterLowBikes"
    type = "Filter"
    inputNodes = @(@{ name = "SensorIngestion-stream" })
    properties = @{
        conditions = @(@{
            operatorType = "GreaterThan"
            column = @{
                expressionType = "ColumnReference"
                node = $null
                columnName = "No_Bikes"
                columnPath = $null
            }
            value = @{
                expressionType = "Literal"
                dataType = "BigInt"
                value = "5"
            }
        })
    }
}
$existingOps = @($topology.operators | Where-Object { $_ -ne $null })
$topology.operators = $existingOps + @($filter)

# 5. Add DerivedStream wired to filter output (makes filtered data available)
$derivedStream = @{
    name = "FilteredOutput"
    type = "DerivedStream"
    properties = @{
        inputSerialization = @{ type = "Json"; properties = @{ encoding = "UTF8" } }
    }
    inputNodes = @(@{ name = "FilterLowBikes" })
}
$existingStreams = @($topology.streams | Where-Object { $_ -ne $null })
$topology.streams = $existingStreams + @($derivedStream)

# 6. Re-encode and update
$topologyJson = $topology | ConvertTo-Json -Depth 10 -Compress
$topologyB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($topologyJson))
$esPart.payload = $topologyB64

$defBody = @{ definition = @{ parts = $def.definition.parts } } | ConvertTo-Json -Depth 5 -Compress
$defFile = Join-Path ([IO.Path]::GetTempPath()) "es_def.json"
[IO.File]::WriteAllText($defFile, $defBody, [System.Text.UTF8Encoding]::new($false))
# updateDefinition returns 202 Accepted (LRO). Use Invoke-WebRequest to capture headers.
$ps5 = @{}; if ($PSVersionTable.PSVersion.Major -lt 6) { $ps5.UseBasicParsing = $true }
$response = Invoke-WebRequest @ps5 -Method Post `
  -Uri "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/updateDefinition" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json; charset=utf-8" `
  -Body (Get-Content $defFile -Raw -Encoding UTF8)

if ($response.StatusCode -eq 202) {
    $location = $response.Headers['Location']
    if ($location -is [array]) { $location = $location[0] }
    if (-not $location) { throw "LRO response missing Location header" }
    $ra = $response.Headers['Retry-After']
    if ($ra -is [array]) { $ra = $ra[0] }
    $retryAfter = if ($ra) { [int]$ra } else { 5 }
    $succeeded = $false
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds $retryAfter
        $poll = Invoke-RestMethod -Uri $location -Headers @{ Authorization = "Bearer $token" }
        if ($poll.status -eq 'Succeeded') { $succeeded = $true; Write-Host "Update succeeded"; break }
        elseif ($poll.status -in @('Failed', 'Cancelled')) {
            throw "updateDefinition LRO $($poll.status): $($poll.error.message)"
        }
    }
    if (-not $succeeded) { throw "updateDefinition LRO timed out" }
}
```

### 示例 3：部署完整拓扑（使用内联定义创建）

**提示词**：“创建一个名为 EventPipeline 的完整 Eventstream，其中包含一个 Custom Endpoint 源、一个用于筛选高价值事件的筛选器，以及一个用于输出筛选结果的 DerivedStream。”

> **注意**：此示例使用 Fabric Items API（`POST /items`），通过单次调用创建 Eventstream 及其
> 定义，而不是先创建再更新。

```powershell
# 1. Discover workspace ID
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='dev'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'dev' not found" }

# 2. Build complete topology with filter + DerivedStream
$topology = @{
    compatibilityLevel = "1.0"
    sources = @(@{
        name = "CustomSource"
        type = "CustomEndpoint"
        properties = @{}
    })
    streams = @(
        @{
            name = "EventPipeline-stream"
            type = "DefaultStream"
            properties = @{}
            inputNodes = @(@{ name = "CustomSource" })
        }
        @{
            name = "FilteredEvents"
            type = "DerivedStream"
            properties = @{
                inputSerialization = @{ type = "Json"; properties = @{ encoding = "UTF8" } }
            }
            inputNodes = @(@{ name = "FilterPremium" })
        }
    )
    operators = @(@{
        name = "FilterPremium"
        type = "Filter"
        inputNodes = @(@{ name = "EventPipeline-stream" })
        properties = @{
            conditions = @(@{
                operatorType = "GreaterThan"
                column = @{
                    expressionType = "ColumnReference"
                        node = $null
                        columnName = "Amount"
                        columnPath = $null
                    }
                value = @{
                    expressionType = "Literal"
                    dataType = "BigInt"
                    value = "100"
                }
            })
        }
    })
    destinations = @()
}

# 3. Create with inline definition (single API call)
$topologyJson = $topology | ConvertTo-Json -Depth 10 -Compress
$topologyB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($topologyJson))

$body = @{
    displayName = "EventPipeline"
    type = "Eventstream"
    definition = @{
        parts = @(@{
            path = "eventstream.json"
            payload = $topologyB64
            payloadType = "InlineBase64"
        })
    }
} | ConvertTo-Json -Depth 5 -Compress
$bodyFile = Join-Path ([IO.Path]::GetTempPath()) "es_create_full.json"
[IO.File]::WriteAllText($bodyFile, $body, [System.Text.UTF8Encoding]::new($false))

# Create-with-definition returns 202 Accepted (LRO). Use Invoke-WebRequest to capture headers.
$token = (az account get-access-token --resource "https://api.fabric.microsoft.com" --query accessToken -o tsv)
$ps5 = @{}; if ($PSVersionTable.PSVersion.Major -lt 6) { $ps5.UseBasicParsing = $true }
$response = Invoke-WebRequest @ps5 -Method Post `
  -Uri "https://api.fabric.microsoft.com/v1/workspaces/$wsId/items" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json; charset=utf-8" `
  -Body (Get-Content $bodyFile -Raw -Encoding UTF8)

if ($response.StatusCode -eq 202) {
    $location = $response.Headers['Location']
    if ($location -is [array]) { $location = $location[0] }
    if (-not $location) { throw "LRO response missing Location header" }
    $ra = $response.Headers['Retry-After']
    if ($ra -is [array]) { $ra = $ra[0] }
    $retryAfter = if ($ra) { [int]$ra } else { 10 }
    $succeeded = $false
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds $retryAfter
        $poll = Invoke-RestMethod -Uri $location -Headers @{ Authorization = "Bearer $token" }
        if ($poll.status -eq 'Succeeded') { $succeeded = $true; Write-Host "Create succeeded"; break }
        elseif ($poll.status -in @('Failed', 'Cancelled')) {
            throw "Create LRO $($poll.status): $($poll.error.message)"
        }
    }
    if (-not $succeeded) { throw "Create LRO timed out" }
} else {
    Write-Host "Created: $(($response.Content | ConvertFrom-Json).displayName)"
}
```

### 示例 4：删除事件流

**提示词**：“从我的 dev 工作区中删除 SensorIngestion 事件流。”

```powershell
# 1. Discover workspace + Eventstream IDs
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='dev'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'dev' not found" }

$esId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='SensorIngestion'] | [0].id" -o tsv)
if (-not $esId) { throw "Eventstream 'SensorIngestion' not found" }

# 2. Delete
az rest --method delete `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId" `
  --resource "https://api.fabric.microsoft.com"
```