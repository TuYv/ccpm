---
name: activator-consumption-cli
description: >
  Inspect existing alerts, notifications, and automated actions in Fabric via
  read-only REST calls using `az rest` CLI. **Invoke this skill** whenever
  the user wants to:
  (1) list existing alerts in a workspace,
  (2) inspect how an alert or notification is configured,
  (3) read and decode an Activator/Reflex definition (ReflexEntities.json),
  (4) list rules, sources, and actions behind an alert,
  (5) understand why an alert fires or what action it takes.
  **Invoke this skill before answering questions** about an Activator/Reflex item
  in a Fabric workspace — the listing, lookup, and decoding workflows are part of
  this skill, not preamble to it.
  Triggers: "show my alerts", "what alerts do I have", "show me all activators", "inspect this alert",
  "show me the rule", "show me the action", "show me the source",
  "get reflex definition", "list activators", "list alerts",
  "list reflex items", "show activator items", "activator details",
  "find activator named", "inspect Power BI source",
  "metric definition behind this alert"
---
> **更新检查 — 每个会话仅一次（强制）**
> 在会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能（例如 `/fabric-skills:check-updates`）。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：读取本地 `package.json` 版本，然后通过 `git fetch origin main --quiet && git show origin/main:package.json`（或 GitHub API）与远程版本进行比较。如果远程版本较新，请显示变更日志和更新说明。
> - 如果本会话早些时候已经执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# activator-consumption-cli — 通过 CLI 进行只读 Activator 探索

## 目录

| 任务 | 参考 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* [工作区/项目 ID 解析需要] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | |
| 长时间运行的操作 (LRO) | [COMMON-CORE.md § 长时间运行的操作 (LRO)](../../common/COMMON-CORE.md#long-running-operations-lro) | `getDefinition` 可能返回 202 |
| 速率限制与节流 | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling) | |
| Fabric 项目定义 | [ITEM-DEFINITIONS-CORE.md § 定义信封](../../common/ITEM-DEFINITIONS-CORE.md#definition-envelope) | Base64 有效负载结构 |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`** |
| LRO 模式 | [COMMON-CLI.md § 长时间运行的操作 (LRO) 模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | |
| 分页模式 | [COMMON-CLI.md § 分页模式](../../common/COMMON-CLI.md#pagination-pattern) | |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) | |
| 连接 | [SKILL.md § 连接](#connection) | |
| 列出 Activator 项目 | [SKILL.md § 列出 Activator 项目](#listing-activator-items) | |
| 检查单个 Activator | [SKILL.md § 检查单个 Activator](#inspecting-a-single-activator) | |
| 读取定义 | [SKILL.md § 读取定义](#reading-the-definition) | |
| 探索规则、源和操作 | [SKILL.md § 探索规则、源和操作](#exploring-rules-sources-and-actions) | |
| 检查 Power BI 源 | [SKILL.md § 检查 Power BI 源](#inspecting-power-bi-sources) | `powerBiSource-v1`、存储的查询 JSON、`metricDefinition`、报表/模型沿袭关系 |
| 必须 / 首选 / 避免 | [SKILL.md § 必须 / 首选 / 避免](#must--prefer--avoid) | |
| 示例 | [SKILL.md § 示例](#examples) | |

---

## 工具栈

| 工具 | 用途 | 安装 |
|---|---|---|
| **az cli** | 调用 Fabric REST API，以读取 Activator 项及其定义 | `winget install Microsoft.AzureCLI` |
| **jq** | JSON 处理、Base64 解码和定义检查 | `winget install jqlang.jq` |

---

## 连接

使用 [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes)中的共享身份验证指南。按照 [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)解析工作区 ID 和项目 ID。以下示例假定 `WS_ID` 和 `REFLEX_ID` 已解析。

---

## 列出 Activator 项

### 列出工作区中的所有 Activator

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '.value[] | {id, displayName, description}'
```

所需作用域：`Workspace.Read.All` 或 `Workspace.ReadWrite.All`

### 分页列出

对于包含大量项目的工作区，请使用每个响应中返回的 `continuationUri` 继续获取：

```bash
NEXT_URL="https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes"
while [ -n "$NEXT_URL" ]; do
  RESPONSE=$(az rest --method GET \
    --url "$NEXT_URL" \
    --resource "https://api.fabric.microsoft.com")
  echo "$RESPONSE" | jq '.value[] | {id, displayName, description}'
  NEXT_URL=$(echo "$RESPONSE" | jq -r '.continuationUri // empty')
done
```

### 按文件夹筛选

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes?recursive=true&rootFolderId=${FOLDER_ID}" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '.value[] | {id, displayName}'
```

---

## 检查单个 Activator

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '{id, displayName, description, type, workspaceId}'
```

---

## 读取定义

> `getDefinition` 是 **POST**（而非 GET）操作，即使仅进行只读检查，也需要 **ReadWrite** 作用域（`Reflex.ReadWrite.All` 或 `Item.ReadWrite.All`），并且可能返回 **202 LRO**。请使用 [COMMON-CLI.md § 长时间运行的操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)中的 `fabric_lro` 辅助程序，以便在解码之前，通过 `Location` 标头轮询 202 响应。

### 解码完整定义

```bash
DEFINITION=$(fabric_lro POST \
  "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}/getDefinition" \
  '{}')

echo "$DEFINITION" \
  | jq '.definition.parts[] | select(.path=="ReflexEntities.json") | .payload' -r \
  | base64 -d | jq .
```

### 将定义保存到文件

```bash
DEFINITION=$(fabric_lro POST \
  "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}/getDefinition" \
  '{}')

echo "$DEFINITION" \
  | jq '.definition.parts[] | select(.path=="ReflexEntities.json") | .payload' -r \
  | base64 -d | jq . > reflex-entities.json
```

---

## 探索规则、源和操作

获得解码后的 `ReflexEntities.json` 后，使用 `jq` 提取特定组件。

### 列出所有实体类型

```bash
cat reflex-entities.json | jq '[.[] | .type] | sort | group_by(.) | map({type: .[0], count: length})'
```

### 列出数据源

```bash
cat reflex-entities.json | jq '.[] | select(.type | endswith("Source-v1")) | {name: .payload.name, type: .type, id: .uniqueIdentifier}'
```

### 列出规则

```bash
cat reflex-entities.json | jq '.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Rule") | {name: .payload.name, id: .uniqueIdentifier, shouldRun: .payload.definition.settings.shouldRun}'
```

### 列出对象及其属性

```bash
# Objects
cat reflex-entities.json | jq '.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Object") | {name: .payload.name, id: .uniqueIdentifier}'

# Attributes for a specific object
OBJECT_ID="<object-guid>"
cat reflex-entities.json | jq --arg oid "$OBJECT_ID" '.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Attribute" and .payload.parentObject.targetUniqueIdentifier == $oid) | {name: .payload.name, id: .uniqueIdentifier}'
```

### 检查规则的条件

```bash
RULE_ID="<rule-guid>"
cat reflex-entities.json \
  | jq --arg rid "$RULE_ID" '.[] | select(.uniqueIdentifier == $rid) | .payload.definition.instance' -r \
  | jq '.steps[] | {step: .name, rows: [.rows[] | .kind]}'
```

### 列出操作（Fabric 项操作）

```bash
cat reflex-entities.json | jq '.[] | select(.type == "fabricItemAction-v1") | {name: .payload.name, itemType: .payload.fabricItem.itemType, itemId: .payload.fabricItem.itemId}'
```

### 摘要视图

获取 Activator 配置的概要：

```bash
cat reflex-entities.json | jq '{
  containers: [.[] | select(.type == "container-v1") | .payload.name],
  sources: [.[] | select(.type | endswith("Source-v1")) | {name: .payload.name, type: .type}],
  objects: [.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Object") | .payload.name],
  rules: [.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Rule") | {name: .payload.name, active: .payload.definition.settings.shouldRun}],
  actions: [.[] | select(.type == "fabricItemAction-v1") | {name: .payload.name, type: .payload.fabricItem.itemType}]
}'
```

---

## 检查 Power BI 源

由 Power BI 支持的 Activator 源使用 `powerBiSource-v1`。该源的父级
`container-v1` 必须使用大小写完全匹配的 `payload.type: "pbiMetrics"`。
源的 `query.queryString` 是采用 JSON 字符串形式的 Power BI 源查询有效负载，
而 `metricDefinition` 描述相同的语义模型指标、
维度、筛选器和报表视觉对象沿袭关系。Activator API 不接受
`query.queryString` 中的语义模型查询文本。

> **当前公共 API 限制：** 目前无法依赖由 Power BI 支持的 Activator 定义
> 进行公共 ALM 回读。如果已禁用 PBI ALM 导出，`getDefinition` 可能会
> 拒绝已成功导入的项目。请保留原始响应和请求/相关性 ID，并说明
> 无法执行检查；不要仅仅因为无法导出定义，就声称持久化失败或
> 源不存在。

标记缺少父容器或容器类型不是 `pbiMetrics` 的情况。
特别是，`powerBiQueries` 是无效的。

### 解析存储的查询和指标定义

```bash
jq -r '.[] | select(.type == "powerBiSource-v1")
  | .payload.query.queryString' reflex-entities.json | jq .
```

`metricDefinition` 可以是 JSON 字符串，也可以是对象。在解释指标之前，
需要解析这两种形式：

```python
import json
from pathlib import Path

entities = json.loads(Path("reflex-entities.json").read_text(encoding="utf-8"))
for entity in entities:
    if entity.get("type") != "powerBiSource-v1":
        continue
    payload = entity["payload"]
    metric = payload.get("metricDefinition")
    if isinstance(metric, str):
        metric = json.loads(metric)
    print(json.dumps({
        "sourceName": payload.get("name"),
        "datasetId": payload.get("datasetId") or payload.get("metadata", {}).get("datasetId"),
        "reportId": payload.get("reportId") or payload.get("metadata", {}).get("reportId"),
        "pageId": payload.get("pageId") or payload.get("metadata", {}).get("pageId"),
        "visualId": payload.get("visualId") or payload.get("metadata", {}).get("visualId"),
        "measureName": payload.get("measureName") or payload.get("metadata", {}).get("measureName"),
        "dimensionValue": payload.get("dimensionValue"),
        "metricDefinition": metric,
    }, indent=2))
```

持久化的 Power BI 源查询应省略 `top`。

### 一致性检查

指出以下任何问题：

- 由于 PBI ALM 导出已禁用，`getDefinition` 被阻止。应报告此限制，而不是编造源详细信息。
- `query.queryString` 或 `metricDefinition` 不是可解析的 JSON。
- 缺少父容器，或者父容器不是严格匹配的 `pbiMetrics`。
- `metricDefinition.type` 不是 `DatasetMetric`。
- 源的 `datasetId`、查询的 `provider.datasetId` 和
  `metricDefinition.definition.datasetId` 不一致。
- 持久化的查询包含 `top`。
- 个性化源具有 `dimensionValue`，但查询筛选器或 `metricDefinition.definition.filter` 中不存在相同的值。
- `metricDefinition.definition.filter` 使用 `BasicFilter`，而不是
  语义查询的 `Version` / `From` / `Where` 约定。
- 缺少报表、页面、视觉对象或度量值的沿袭信息。

---

## 必须 / 建议 / 避免

### 必须执行

- 将 `az rest` 与 **`--resource https://api.fabric.microsoft.com` 配合使用**
- 对 `getDefinition` **始终发送 `--body '{}'`**——它是一个 POST 请求，省略请求正文可能会导致 411 错误
- **处理 LRO 响应**——`getDefinition` 可能返回 202；应轮询 `Location` 标头
- 检查之前对 `ReflexEntities.json` 有效负载进行 **Base64 解码**——API 响应中的该有效负载采用 Base64 编码
- 对规则实体中的 `definition.instance` 字段进行 **JSON 解析**——它是一个经过 JSON 编码的字符串，而不是嵌套对象
- **对于 Power BI 源，在解释指标、维度或筛选器之前，对 `query.queryString` 和 `metricDefinition` 均进行 JSON 解析**

### 建议

- **优先提供摘要视图** — 在深入了解各个实体之前，先向用户提供高层概览
- **定义较大时保存到文件** — 只需解码一次，然后在本地使用 `jq` 探索
- **动态发现 ID** — 通过工作区和项目列表以及 JMESPath 筛选来解析 ID
- **分页列出** — 适用于包含大量 Activator 项目的工作区
- **报告 Power BI 沿袭关系** — 在可用时包含数据集/报表/页面/视觉对象/度量值元数据
- **标记 Power BI 筛选器不一致问题** — 特别是缺少个性化维度值的情况

### 避免

- **硬编码工作区或项目 ID** — 始终动态解析
- **对 `getDefinition` 使用 GET** — 它是 POST 端点；GET 将返回 405
- **尝试读取带有加密敏感度标签的项目定义** — 此操作将被阻止
- **修改数据** — 这是一项只读 Skill；写入操作请使用 [activator-authoring-cli](../activator-authoring-cli/SKILL.md)
- **将 Power BI 源查询视为语义模型查询文本** — 它们是以 JSON 字符串形式存储的源负载

---

## 示例

### 列出所有 Activator 并显示其规则

```bash
# Step 1: List activators
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes" \
  --resource "https://api.fabric.microsoft.com" \
  | jq '.value[] | {id, displayName}'

# Step 2: For a specific activator, get and decode its definition
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body '{}' \
  | jq '.definition.parts[] | select(.path=="ReflexEntities.json") | .payload' -r \
  | base64 -d \
  | jq '.[] | select(.type == "timeSeriesView-v1" and .payload.definition.type == "Rule") | {name: .payload.name, active: .payload.definition.settings.shouldRun}'
```

### 检查特定规则的完整配置

```bash
# Decode definition and extract rule details
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/reflexes/${REFLEX_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --headers "Content-Type=application/json" \
  --body '{}' \
  | jq '.definition.parts[] | select(.path=="ReflexEntities.json") | .payload' -r \
  | base64 -d \
  | jq '.[] | select(.payload.name == "Too hot for medicine") | .payload.definition.instance' -r \
  | jq '.steps[] | {step: .name, details: .rows}'
```

---

## 查询激活历史记录

激活历史记录（规则触发的时间）无法通过公共 REST API 获取。可以通过 **Activator MCP 服务器**使用 `get_activations_for_rule` 工具来访问。

### 前提条件

连接 Activator MCP 端点之前，请参考 [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes)中的共享身份验证指南。

```bash
pip install mcp httpx azure-identity aiohttp
```

### 工作流

1. 使用公共 API **列出规则**（getDefinition → 解码 → 筛选 Rule 实体），以获取规则的 `uniqueIdentifier`
2. **连接到 Activator MCP 服务器**，并使用规则 ID 调用 `get_activations_for_rule`

### MCP 服务器连接

Activator MCP 端点位于：
```
https://api.fabric.microsoft.com/v1/mcp/workspaces/{workspaceId}/reflexes/{activatorId}
```

请遵循 [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) 中共享的 Fabric API 身份验证指南。MCP 客户端应依赖标准 Azure 身份流，且不得硬编码令牌。

### 调用 `get_activations_for_rule`

使用 MCP `streamable_http_client` 进行连接，然后调用该工具：

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

# After connecting and initializing the session:
result = await session.call_tool(
    "get_activations_for_rule",
    {
        "getActivationsParams": {
            "workspaceId": "<workspace-id>",
            "artifactId": "<activator-id>",
            "ruleId": "<rule-uniqueIdentifier>",
        }
    },
)
```

响应包含 `totalCount` 和 `activations` 数组，其中包含规则每次触发的详细信息。

### 可用的 MCP 工具

| 工具 | 用途 |
|------|---------|
| `list_rules` | 列出 Activator 中的规则（作为公共 API 解码的替代方式） |
| `get_activations_for_rule` | 获取特定规则的激活历史记录 |

---

## Agent 集成说明

- 此 Skill 使用 Fabric Items API（`/reflexes`）进行列表查询，并使用 `getDefinition` 进行检查
- 检查项和规则时不需要额外的数据平面协议——全部使用 `az rest` 和 Fabric API 受众
- 即使是只读访问，`getDefinition` 也需要 **ReadWrite** 作用域——这是已知的 API 要求
- **激活历史记录**需要 MCP 服务器连接（无法通过公共 REST API 获取）
- 如需**创建或修改** Activator 项和规则，请使用 [activator-authoring-cli](../activator-authoring-cli/SKILL.md) Skill