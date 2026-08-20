---
name: eventstream-consumption-cli
description: >
  List, inspect, and monitor Fabric Eventstream real-time ingestion pipelines via
  the Items REST API. Discover Eventstreams across workspaces, decode base64 graph
  topologies tracing event flow from source through operators to destination nodes.
  Validate connection IDs, wiring, retention policies (1-90 days), and throughput
  levels. Retrieve Custom Endpoint Kafka credentials via Topology API. **Invoke
  this skill** to: (1) list Eventstreams, (2) inspect Eventstream topology showing
  sources and destinations, (3) validate Eventstream configurations, (4) check
  Eventstream retention policy and throughput level, (5) get connection strings.
  Triggers: "list eventstreams", "inspect eventstream",
  "describe eventstream topology", "eventstream operator nodes",
  "eventstream sources and destinations", "eventstream health",
  "eventstream status", "eventstream configuration", "eventstream retention",
  "eventstream throughput level", "eventstream connection string",
  "custom endpoint credentials", "check eventstream".
---
> **更新检查 — 每个会话仅一次（强制）**
> 每个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话之前已执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. Eventstream ≠ Eventhouse。Eventstream 是实时事件引入和路由管道。对于 KQL 查询，请使用 `eventhouse-consumption-cli`。

# Eventstream 使用 — CLI 技能

## 目录

| 任务 | 参考 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* [用于根据名称查找工作区 ID，或根据项目名称、项目类型和工作区 ID 查找项目 ID] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证操作方法 | [COMMON-CLI.md § 身份验证操作方法](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助工具 |
| 注意事项与故障排除（CLI 专用） | [COMMON-CLI.md § 注意事项与故障排除（CLI 专用）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| 列出和发现 Eventstream | [EVENTSTREAM-CONSUMPTION-CORE.md § 列出和发现 Eventstream](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#listing-and-discovering-eventstreams) | 跨工作区列出、获取和搜索 |
| 检查 Eventstream 拓扑 | [EVENTSTREAM-CONSUMPTION-CORE.md § 检查 Eventstream 拓扑](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#inspecting-eventstream-topology) | 解码 base64 定义 → 跟踪图流 |
| 监控 Eventstream 运行状况 | [EVENTSTREAM-CONSUMPTION-CORE.md § 监控 Eventstream 运行状况](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#monitoring-eventstream-health) | 保留期和吞吐量检查 |
| 源和目标状态 | [EVENTSTREAM-CONSUMPTION-CORE.md § 源和目标状态](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#source-and-destination-status) | 源和目标的验证检查清单 |
| 与下游分析集成 | [EVENTSTREAM-CONSUMPTION-CORE.md § 与下游分析集成](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#integration-with-downstream-analytics) | Eventhouse、Lakehouse、Activator、Real-Time Hub |
| 注意事项和故障排除参考 | [EVENTSTREAM-CONSUMPTION-CORE.md § 注意事项和故障排除参考](../../common/EVENTSTREAM-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference) | 10 个常见问题及其原因和修复方法 |
| 列出 Eventstream | [SKILL.md § 列出 Eventstream](#list-eventstreams) | |
| 检查 Eventstream 拓扑 | [SKILL.md § 检查 Eventstream 拓扑](#inspect-eventstream-topology) | 解码并探索关系图 |
| 获取自定义终结点连接字符串 | [SKILL.md § 获取自定义终结点连接字符串](#get-custom-endpoint-connection-string) | 通过 Topology API 获取 Kafka/EH 连接 |
| 验证 Eventstream 配置 | [SKILL.md § 验证 Eventstream 配置](#validate-eventstream-configuration) | |
| 注意事项、规则和故障排除 | [SKILL.md § 注意事项、规则和故障排除](#gotchas-rules-troubleshooting) | **必须执行 / 避免 / 优先选择** 检查清单 |

---

## 列出 Eventstream

### 列出工作区中的所有 Eventstream

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams" \
  --resource "https://api.fabric.microsoft.com"
```

返回 Eventstream 项数组。使用 JMESPath 按名称筛选：

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams" \
  --resource "https://api.fabric.microsoft.com" \
  --query "value[?displayName=='my-eventstream']"
```

### 获取 Eventstream 详细信息

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}" \
  --resource "https://api.fabric.microsoft.com"
```

---

## 检查 Eventstream 拓扑

> **提示**：Topology API（`GET .../eventstreams/{id}/topology`）无需进行 base64 解码即可返回运行时状态、错误信息和节点 ID。对于运维检查（运行状况检查、连接检索），应优先使用该 API。当需要获取完整的创作时图结构以修改拓扑时，请使用 `POST .../getDefinition`（见下文）。

检索 Eventstream 定义并对其进行解码，以检查完整的图拓扑。

### 步骤 1：获取定义

> **API 说明**：Eventstream Definition API 使用 `POST .../getDefinition`，而不是 `GET .../definition`。这遵循 Fabric Items Definition 模式。请参阅[官方文档](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/api-get-eventstream-definition)。

```bash
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --body '{}'
```

### 步骤 2：解码拓扑

提取 `eventstream.json` 部分的 `payload` 字段，并对其进行 base64 解码：

```bash
# Using jq + base64 (Linux; on macOS use base64 -D instead of -d)
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --body '{}' \
  | jq -r '.definition.parts[] | select(.path=="eventstream.json") | .payload' \
  | base64 -d | jq .
```

```powershell
# PowerShell (Windows)
$def = az rest --method POST `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WORKSPACE_ID/eventstreams/$EVENTSTREAM_ID/getDefinition" `
  --resource "https://api.fabric.microsoft.com" `
  --body '{}' | ConvertFrom-Json
$payload = ($def.definition.parts | Where-Object { $_.path -eq 'eventstream.json' }).payload
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload)) | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 步骤 3：汇总拓扑

解码后，统计并列出每种节点类型：

| 指标 | 已解码 JSON 中的路径 |
|--------|---------------------|
| 源 | `.sources[] \| .name, .type` |
| 目标 | `.destinations[] \| .name, .type` |
| 运算符 | `.operators[] \| .name, .type` |
| 流 | `.streams[] \| .name, .type` |

---

## 获取自定义终结点连接字符串

对于自定义终结点源，`POST .../getDefinition` 终结点会返回**空属性**。要检索 Kafka/Event Hub 连接信息，请使用 **Topology API** 的 `/connection` 终结点。

> **重要提示**：此终结点需要 `Eventstream.ReadWrite.All` 权限范围（不能只有读取权限）。

### 第 1 步：获取拓扑以查找源 ID

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}/topology" \
  --resource "https://api.fabric.microsoft.com"
```

在响应中找到自定义终结点源节点，并提取其 `id`：

```bash
# Extract the sourceId for a Custom Endpoint source (use name filter if multiple exist)
SOURCE_ID=$(az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}/topology" \
  --resource "https://api.fabric.microsoft.com" \
  | jq -r '[.sources[] | select(.type=="CustomEndpoint")] | if length == 0 then error("No Custom Endpoint sources found in this Eventstream") elif length > 1 then error("Multiple Custom Endpoint sources found — filter by .name") else .[0].id end') \
  || { echo "Failed to resolve Custom Endpoint source ID"; exit 1; }

if [ -z "$SOURCE_ID" ]; then echo "SOURCE_ID is empty — check topology output"; exit 1; fi
```

```powershell
# PowerShell — extract sourceId for Custom Endpoint (fails clearly if multiple exist)
$topology = az rest --method GET `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WORKSPACE_ID/eventstreams/$EVENTSTREAM_ID/topology" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json
$customSources = @($topology.sources | Where-Object { $_.type -eq 'CustomEndpoint' })
if ($customSources.Count -eq 0) { throw "No Custom Endpoint sources found in this Eventstream" }
if ($customSources.Count -gt 1) { throw "Multiple Custom Endpoint sources found. Filter by name: $($customSources.name -join ', ')" }
$sourceId = $customSources[0].id
```

### 第 2 步：获取连接详细信息

> ⚠️ **安全提示**：此终结点会返回访问密钥和连接字符串。调用前应获得用户的明确确认。除非用户明确要求在安全的上下文中提供机密值，否则应从任何显示的输出中隐去 `primaryKey`、`secondaryKey`、`primaryConnectionString` 和 `secondaryConnectionString`。避免记录原始凭据；请安全存储并根据需要轮换凭据。

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventstreams/${EVENTSTREAM_ID}/sources/${SOURCE_ID}/connection" \
  --resource "https://api.fabric.microsoft.com"
```

```powershell
az rest --method GET `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WORKSPACE_ID/eventstreams/$EVENTSTREAM_ID/sources/$sourceId/connection" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json
```

### 预期响应

```json
{
  "fullyQualifiedNamespace": "namespace.servicebus.windows.net",
  "eventHubName": "es_<guid>",
  "accessKeys": {
    "primaryKey": "...",
    "secondaryKey": "...",
    "primaryConnectionString": "Endpoint=sb://namespace.servicebus.windows.net/;...",
    "secondaryConnectionString": "..."
  }
}
```

### Kafka Producer 配置

使用响应来配置 Kafka producer：

| 设置 | 值 |
|---------|-------|
| `bootstrap_servers` | `{fullyQualifiedNamespace}:9093` |
| `topic` | `{eventHubName}` |
| `security_protocol` | `SASL_SSL` |
| `sasl_mechanism` | `PLAIN` |
| `sasl_plain_username` | `$ConnectionString`（固定字面量，而非变量） |
| `sasl_plain_password` | `{primaryConnectionString}` |

> **限制**：`/connection` 端点仅支持 Custom Endpoint 源（返回 Kafka/Event Hub 凭据）。其他源类型（Event Hub、IoT Hub 等）会将其连接配置（例如 `dataConnectionId`、`consumerGroup`）直接存储在解码后的定义属性中。

---

## 验证 Eventstream 配置

检查解码后的 Eventstream 拓扑的关键配置：

### 源验证清单

| 检查项 | 方法 |
|-------|-----|
| API 支持源类型 | 与 25 个已知类型枚举进行比较 |
| 云连接存在 | 验证 `dataConnectionId` GUID 能否解析 |
| 已设置使用者组 | Event Hub、IoT Hub、Kafka 源必须设置 |
| 序列化与源匹配 | `inputSerialization.type` = `Json`、`Csv` 或 `Avro` |

### 目标验证清单

| 检查项 | 方法 |
|-------|-----|
| 目标类型有效 | 必须为 `Lakehouse`、`Eventhouse`、`Activator` 或 `CustomEndpoint` |
| 目标项可访问 | 验证 `workspaceId` + `itemId` 能否通过 GET 解析 |
| 输入已连接 | `inputNodes` 数组不得为空 |
| Eventhouse 直接引入 | 已设置 `connectionName` 和 `mappingRuleName` |

### EventstreamProperties 验证

解码 `eventstreamProperties.json` 并检查：
- `retentionTimeInDays` 是否在 1–90 范围内
- `eventThroughputLevel` 是否为 `Low`、`Medium` 或 `High`

---

## 注意事项、规则和故障排除

### 必须执行

- 使用 `az rest` 调用时，**始终传递 `--resource https://api.fabric.microsoft.com`**
- **始终使用 JMESPath 筛选**来解析工作区名称 → ID 和项名称 → ID
- 检查拓扑之前，**始终对定义 payload 进行 base64 解码**（Topology API 无需执行此操作，因为它会直接返回 JSON）
- **对于 Custom Endpoint 连接详细信息，请使用 Topology API**——`POST .../getDefinition` 返回空属性；调用 `GET .../topology` 获取 sourceId，然后调用 `GET .../sources/{sourceId}/connection`
- **定义端点应使用 POST**——`POST .../getDefinition`（而不是 GET）、`POST .../updateDefinition`（而不是 PUT）。请参阅[官方文档](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/api-get-eventstream-definition)。
- **处理分页**——检查列表响应中是否存在 `continuationUri`
- **轮询 LRO 响应**——Get Definition 可能返回 `202 Accepted`

### 建议

- 将拓扑 JSON 解码为结构化输出，以生成易读的摘要
- 使用 `jq`（bash）或 `ConvertFrom-Json`（PowerShell）进行解析
- 在向用户报告问题之前验证配置
- 将目标与下游 skill（eventhouse、sqldw、spark）进行交叉引用

### 避免

- 不要混淆 Eventstream 和 Eventhouse——它们是不同的 Fabric 工作负载
- 不要硬编码工作区或项目 ID——始终通过 API 发现它们
- 不要假定所有源类型都会出现在 API 枚举中——预览版源仅存在于 UI 中
- 不要使用此消费技能修改 Eventstream 拓扑——请使用 `eventstream-authoring-cli` 执行写入操作
- 不要尝试通过 Eventstream API 查询事件数据——请使用下游技能（eventhouse-consumption-cli、sqldw-consumption-cli）查询已落地的数据

---

## 示例

> **平台说明**——示例使用 PowerShell。始终通过 `[IO.File]::WriteAllText()`（无 BOM）将 JSON 正文写入
> 临时文件，并将 `--body "@$file"` 传递给 `az rest`，不要使用内联的 `--body "..."`，因为
> `cmd.exe` 可能会将其破坏。使用带 `-Compress` 的 `ConvertTo-Json` 以避免
> 换行问题。唯一安全的内联例外是将 `--body '{}'` 用于空正文。
> 对于大型工作区，请检查列表响应中是否存在 `continuationUri`，以处理
> 分页。

### 示例 1：列出工作区中的所有 Eventstream

**提示词**：“列出我的 analytics 工作区中的所有 Eventstream，并显示其名称和 ID。”

```powershell
# 1. Discover workspace ID
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='analytics'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'analytics' not found" }

# 2. List Eventstreams (handles pagination)
$allItems = @()
$resp = az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json
$allItems += $resp.value
while ($resp.continuationUri) {
    $resp = az rest --method get `
      --url $resp.continuationUri `
      --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json
    $allItems += $resp.value
}
$allItems | Select-Object displayName, id, description | Format-Table
```

### 示例 2：检查 Eventstream 拓扑

**提示词**：“向我展示 SensorIngestion Eventstream 的拓扑——包括所有源、运算符和目标。”

```powershell
# 1. Discover workspace + Eventstream IDs
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='analytics'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'analytics' not found" }

$esId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='SensorIngestion'] | [0].id" -o tsv)
if (-not $esId) { throw "Eventstream 'SensorIngestion' not found" }

# 2. Get topology (returns JSON directly — no base64 decoding needed)
$topo = az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/topology" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json

# 3. Summarize nodes (filter nulls from arrays)
Write-Host "Sources:"
@($topo.sources | Where-Object { $_ -ne $null }) | ForEach-Object {
    Write-Host "  - $($_.name) (type: $($_.type), id: $($_.id))"
}
Write-Host "Operators:"
@($topo.operators | Where-Object { $_ -ne $null }) | ForEach-Object {
    Write-Host "  - $($_.name) (type: $($_.type))"
}
Write-Host "Destinations:"
@($topo.destinations | Where-Object { $_ -ne $null }) | ForEach-Object {
    Write-Host "  - $($_.name) (type: $($_.type))"
}
Write-Host "Streams:"
@($topo.streams | Where-Object { $_ -ne $null }) | ForEach-Object {
    Write-Host "  - $($_.name) (type: $($_.type))"
}
```

### 示例 3：检查保留期和吞吐量设置

**提示词**：“我的 SensorIngestion Eventstream 的保留期和吞吐量设置是什么？”

> **注意**：保留期和吞吐量设置存储在定义的 `eventstreamProperties.json`
> 部分中（而不是 `eventstream.json`）。如果缺少此部分，Eventstream
> 将使用平台默认值。

```powershell
# 1. Discover workspace + Eventstream IDs
$wsId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='analytics'] | [0].id" -o tsv)
if (-not $wsId) { throw "Workspace 'analytics' not found" }

$esId = (az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/items?type=Eventstream" `
  --resource "https://api.fabric.microsoft.com" `
  --query "value[?displayName=='SensorIngestion'] | [0].id" -o tsv)
if (-not $esId) { throw "Eventstream 'SensorIngestion' not found" }

# 2. Get definition (handles LRO via Location header)
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

# 3. Decode eventstreamProperties.json part (holds retention + throughput)
$propsPart = $def.definition.parts | Where-Object { $_.path -eq 'eventstreamProperties.json' } | Select-Object -First 1
if ($propsPart) {
    $props = [Text.Encoding]::UTF8.GetString(
      [Convert]::FromBase64String($propsPart.payload)) | ConvertFrom-Json
    Write-Host "Retention: $($props.retentionTimeInDays) days"
    Write-Host "Throughput Level: $($props.eventThroughputLevel)"
} else {
    # Fall back to topology-level properties (older format)
    $esPart = $def.definition.parts | Where-Object { $_.path -eq 'eventstream.json' } | Select-Object -First 1
    if (-not $esPart) { throw "eventstream.json part not found in definition" }
    $topology = [Text.Encoding]::UTF8.GetString(
      [Convert]::FromBase64String($esPart.payload)) | ConvertFrom-Json
    if ($topology.properties.retentionTimeInDays) {
        Write-Host "Retention: $($topology.properties.retentionTimeInDays) days"
    } else {
        Write-Host "Retention: (platform default — not explicitly configured)"
    }
    if ($topology.properties.eventThroughputLevel) {
        Write-Host "Throughput Level: $($topology.properties.eventThroughputLevel)"
    } else {
        Write-Host "Throughput Level: (platform default — not explicitly configured)"
    }
}
```

### 示例 4：获取自定义终结点连接元数据

**提示词**：“获取我的 SensorIngestion 事件流中自定义终结点源的 Kafka 连接元数据。”

> **安全性**：连接终结点会返回访问密钥。调用前应先获得用户确认，并避免记录原始凭据。

```powershell
# 1. Discover workspace + Eventstream IDs (omitted for brevity)

# 2. Get topology to find Custom Endpoint source ID
$topo = az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/topology" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json

$ceSource = @($topo.sources | Where-Object { $_.type -eq 'CustomEndpoint' }) | Select-Object -First 1
if (-not $ceSource) { throw "No CustomEndpoint source found in this Eventstream" }
$sourceId = $ceSource.id

# 3. Get connection metadata
$conn = az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/sources/$sourceId/connection" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json

Write-Host "Fully Qualified Namespace: $($conn.fullyQualifiedNamespace)"
Write-Host "Event Hub Name:            $($conn.eventHubName)"
Write-Host "Kafka Bootstrap Server:    $($conn.fullyQualifiedNamespace):9093"
```

### 示例 5：验证事件流配置

**提示词**：“检查我的 SensorIngestion 事件流是否存在任何配置问题。”

```powershell
# 1. Discover workspace + Eventstream IDs (omitted for brevity)

# 2. Get topology
$topo = az rest --method get `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$wsId/eventstreams/$esId/topology" `
  --resource "https://api.fabric.microsoft.com" | ConvertFrom-Json

# 3. Validate sources
@($topo.sources | Where-Object { $_ -ne $null }) | ForEach-Object {
    $src = $_
    Write-Host "Source: $($src.name) (type: $($src.type))"
    if ($src.properties.dataConnectionId) {
        Write-Host "  Cloud connection: $($src.properties.dataConnectionId)"
    }
    if ($src.type -in @('AzureEventHub','AzureEventHubExtended','AzureIoTHub','ConfluentCloud','ApacheKafka','AmazonMSKKafka') -and
        -not $src.properties.consumerGroupName) {
        Write-Host "  WARNING: No consumer group set (required for $($src.type))"
    }
}

# 4. Validate destinations
@($topo.destinations | Where-Object { $_ -ne $null }) | ForEach-Object {
    $dst = $_
    Write-Host "Destination: $($dst.name) (type: $($dst.type))"
    if (-not $dst.inputNodes -or $dst.inputNodes.Count -eq 0) {
        Write-Host "  WARNING: No input wired — destination will receive no events"
    }
    if ($dst.type -eq 'Eventhouse' -and -not $dst.properties.tableName) {
        Write-Host "  WARNING: No target table configured"
    }
    if ($dst.type -eq 'Eventhouse' -and $dst.properties.dataIngestionMode -eq 'DirectIngestion') {
        if (-not $dst.properties.connectionName -or -not $dst.properties.mappingRuleName) {
            Write-Host "  WARNING: DirectIngestion requires connectionName and mappingRuleName"
        }
    }
}

# 5. Check node count limits
$ceCount = @($topo.sources | Where-Object { $_.type -eq 'CustomEndpoint' }).Count +
           @($topo.destinations | Where-Object { $_.type -eq 'CustomEndpoint' }).Count +
           @($topo.destinations | Where-Object { $_.type -eq 'Eventhouse' -and
             $_.properties.dataIngestionMode -eq 'DirectIngestion' }).Count
Write-Host "CustomEndpoint + DI count: $ceCount / 11 limit"
if ($ceCount -gt 11) {
    Write-Host "WARNING: Exceeds limit of 11 CustomEndpoint + DirectIngestion nodes"
}
```