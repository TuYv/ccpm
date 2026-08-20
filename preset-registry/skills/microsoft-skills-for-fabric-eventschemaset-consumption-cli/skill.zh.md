---
name: eventschemaset-consumption-cli
description: >
  List, inspect, and describe Microsoft Fabric Event Schema Sets — the centralized
  catalogs of event types and message schemas — via the Fabric Items REST API using
  `az rest` and `jq`. Enumerate Event Schema Sets in a workspace, read item
  properties (sensitivity label, tags), and retrieve then
  base64-decode the item definition to summarize its `eventTypes` and `schemas`.
  Use when the user wants to: (1) list or search Event Schema Sets in a workspace,
  (2) inspect an Event Schema Set's properties, (3) decode a definition to enumerate
  its event types and message schemas, (4) verify schema formats and versions.
  Read-only; no authoring skill exists yet, so for writes use the Fabric Event
  Schema Set authoring REST APIs, and for the Eventstream ingestion pipeline use
  `eventstream-cli`.
  Triggers: "list Event Schema Sets", "show event schema sets", "inspect an event schema set",
  "describe an event schema set", "decode event schema set definition",
  "enumerate event types and schemas in an event schema set".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: eventschemaset-consumption-cli`（`az rest`：`--headers "x-ms-fabric-skill=eventschemaset-consumption-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍须添加。

> **更新检查 — 每个会话一次（强制要求）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能（例如 `/fabric-skills:check-updates`）。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：读取本地 `package.json` 版本，然后通过 `git fetch origin main --quiet && git show origin/main:package.json`（或 GitHub API）与远程版本进行比较。如果远程版本较新，请显示变更日志和更新说明。
> - 如果本会话此前已执行过检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选
> 3. Eventstream ≠ EventSchemaSet。Eventstream 是实时事件引入和路由管道。若要创作或检查 Eventstream，请使用 `eventstream-cli`。
> 4. Eventhouse ≠ EventSchemaSet。Eventhouse 是一个工作区项（容器），其中包含一个或多个 KQL 数据库，用于存储和分析大量流式/事件数据。若要执行 KQL 数据库操作，请使用 `eventhouse-cli`。

# 事件架构集使用 — CLI 技能

> **预览版**：Fabric **EventSchemaSet** 项及其 REST 操作（列出、获取、获取定义）目前处于**预览版**阶段——其行为、响应结构和可用性可能会发生变化。
>
> **身份验证（所有操作）**：Microsoft Learn 文档指出，每项事件架构集 REST 操作（列出、获取、获取定义）都仅支持**委托（用户）身份**，不支持服务主体和托管身份。实际使用中，由于该项处于**预览版**阶段，使用服务主体/托管身份进行访问可能会成功，且具体情况**取决于租户**。建议优先使用 `az login` 以用户身份登录（不要使用 `--service-principal`，也不要使用托管身份上下文）。如果必须使用服务主体或托管身份，而调用失败并返回 **401/403**，请改用委托用户身份。

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — *请先阅读链接* [按名称查找工作区 ID，或按名称、项类型和工作区 ID 查找项 ID 时需要] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| 易错点、最佳实践与故障排除 | [COMMON-CORE.md § 易错点、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助程序 |
| 易错点与故障排除（CLI 特定） | [COMMON-CLI.md § 易错点与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| 列出事件架构集 | [SKILL.md § 列出事件架构集](#list-event-schema-sets) | |
| 获取事件架构集（属性） | [SKILL.md § 获取事件架构集（属性）](#get-event-schema-set-properties) | |
| 获取事件架构集定义 | [SKILL.md § 获取事件架构集定义](#get-event-schema-set-definition) | 解码 base64 定义 → 汇总 eventTypes 和 schemas |
| 验证事件架构集配置 | [SKILL.md § 验证事件架构集配置](#validate-event-schema-set-configuration) | |
| 必须 / 建议 / 避免 | [SKILL.md § 必须 / 建议 / 避免](#must--prefer--avoid) | **必须执行 / 避免 / 建议**核对清单 |
| 示例 | [SKILL.md § 示例](#examples) | 提示词 → 命令流程对（列出、检查、解码定义、获取架构版本、列出业务事件） |
| 代理集成说明 | [SKILL.md § 代理集成说明](#agent-integration-notes) | |

---

## 工具栈

| 工具 | 用途 |
|---|---|
| **az cli** | 通过 `az rest` 进行 REST 调用；Fabric 控制平面发现 |
| **jq** | JSON 处理和输出格式化 |
| **curl** | `fabric_lro` 在轮询返回 `202 Accepted` 的长时间运行操作时必需（用于捕获 `Location` 标头） |

有关安装和身份验证设置，请参阅 [COMMON-CLI.md](../../common/COMMON-CLI.md)。

---

## 列出事件架构集

### 列出工作区中的所有事件架构集

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventSchemaSets" \
  --resource "https://api.fabric.microsoft.com"
```

返回一个包含项目 `value` 数组的 JSON 对象。使用 JMESPath 按事件架构集的
**显示名称**进行筛选（将 `ITEM_NAME` 设置为你要查找的名称，而不是 URL 中的
`eventSchemaSets` 集合路径段）：

```bash
ITEM_NAME="my-event-schema-set"
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventSchemaSets" \
  --resource "https://api.fabric.microsoft.com" \
  --query "value[?displayName=='${ITEM_NAME}']"
```

### 获取事件架构集（属性）

使用
[获取事件架构集](https://learn.microsoft.com/en-us/rest/api/fabric/eventschemaset/items/get-event-schema-set)
操作返回单个事件架构集的属性（只读，范围为 `Item.Read.All` 或 `Item.ReadWrite.All`）：

```bash
az rest --method GET \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}" \
  --resource "https://api.fabric.microsoft.com"
```

响应返回项目元数据：

| 字段 | 说明 |
|---|---|
| `id` | 项目 ID（GUID） |
| `displayName` | 项目显示名称 |
| `description` | 项目说明 |
| `type` | 始终为 `EventSchemaSet` |
| `workspaceId` | 所属工作区 ID |
| `folderId` | 文件夹 ID（如果项目位于文件夹中） |
| `properties.oneLakeRootPath` | 事件架构集根目录的 OneLake 路径 |
| `sensitivityLabel.id` | 已应用的敏感度标签 ID（如果有） |
| `tags` | 已应用标签的列表（`id`、`displayName`） |

向用户报告时，请汇总显示名称、说明、`properties.oneLakeRootPath` 和
敏感度标签。要读取架构内容（`eventTypes` / `schemas`），请使用下方的
[获取事件架构集定义](#get-event-schema-set-definition)。

---

## 获取事件架构集定义

使用
[获取事件架构集定义](https://learn.microsoft.com/en-us/rest/api/fabric/eventschemaset/items/get-event-schema-set-definition)
操作检索所选事件架构集的完整定义。该定义包含一个架构部件（根据定义文章命名为 `EventSchemaSetDefinition.json`；API 可能返回版本化名称，例如 `EventSchemaSetV1.json`）以及一个
`.platform` 元数据部件。架构部件的 `payload` 是经过 base64 编码的 JSON，用于描述项目的
`eventTypes` 和 `schemas`。

> 规范：[EventSchemaSet 定义](https://learn.microsoft.com/en-us/rest/api/fabric/articles/item-management/definitions/eventschemaset-definition)
>
> **范围**：`getDefinition` 需要 `Item.ReadWrite.All`（工作区读写权限），
> 即使它只读取定义也是如此。（List 和 Get 需要读取权限。）
>
> **身份**：Microsoft Learn 将 `getDefinition`（与 List 和 Get 相同）记录为仅支持
> **委托（用户）身份**，不支持服务主体和托管身份。实际上，这是**预览版**行为，服务主体/托管身份
> 是否能够成功访问取决于租户（请参阅顶层的身份说明）。优先使用
> 委托用户；使用 SP/MI 时如果出现 **401/403**，请回退到 `az login`。

#### 步骤 1：检索定义

`getDefinition` 是 Event Schema Set 端点上的 **POST**（而非 GET）操作。它支持可选的
`?format={format}` 查询参数。始终发送显式的空 JSON 正文（`--body '{}'`）——
不带正文的 POST 可能返回 `411 Length Required`。

以下示例假定收到常见的**同步 `200 OK`** 响应，其正文即为定义。`getDefinition` 也可能返回
**`202 Accepted`** 长时间运行操作和**空正文**——定义*不在* 202 响应中，因此直接将其通过管道传给 `jq`
不会产生任何结果。请显式处理异步路径（参见下文的 **如果 `getDefinition` 返回 `202 Accepted`**）。

```bash
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --body '{}'
```

#### 步骤 2：解码定义部分

提取架构部分（除 `.platform` 之外的所有内容），并对其 `payload` 进行 base64 解码：

```bash
# Using jq + base64 (Linux; on macOS use base64 -D instead of -d)
az rest --method POST \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}/getDefinition" \
  --resource "https://api.fabric.microsoft.com" \
  --body '{}' \
  | jq -r '.definition.parts[] | select(.path != ".platform") | .payload' \
  | base64 -d | jq .
```

```powershell
# PowerShell (Windows)
$def = az rest --method POST `
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WORKSPACE_ID/eventSchemaSets/$ITEM_ID/getDefinition" `
  --resource "https://api.fabric.microsoft.com" `
  --body '{}' | ConvertFrom-Json
$payload = ($def.definition.parts | Where-Object { $_.path -ne '.platform' }).payload
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload)) | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### 如果 `getDefinition` 返回 `202 Accepted`（异步）

`az rest` 仅显示响应**正文**，不显示响应头，因此在收到 `202` 时，仅使用 `az rest` 无法看到
`Location` 响应头中的操作 URL。这是标准的 Fabric 长时间运行操作（LRO）模式：捕获 `Location`，轮询直至
`Succeeded`（遵循 `Retry-After`），然后对操作**结果**执行 `GET`，并按上述方式解码其各个部分。请使用
可复用的 `fabric_lro` 辅助函数——参见 [COMMON-CLI.md § 长时间运行操作](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)
——而不是在此处自行实现令牌捕获和轮询循环。

对于同步的 `200 OK`，请跳过此步骤，并按上述方式直接解码 POST 响应。

#### 步骤 3：汇总定义

解码后的架构部分包含两个顶层集合（两者均为可选）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `eventTypes` | `EventType[]` | 用于在源、Eventstream 和目标项之间进行通信的事件元数据 |
| `schemas` | `Schema[]` | 用于表示存储在目录中的消息的格式 |

每个 **EventType** 都公开以下字段：`id`（必需）、`description`、`eventTypeCategory`
（`EventType` 或 `BusinessEventType`）、`format`（必需）、`envelopeMetadata`、`schemaUrl`、
`schemaFormat`、`schema`、`protocol` 和 `protocolOptions`。`schemaUrl` 与 `schema` 互斥。

每个 **Schema** 都会公开：`id`（必需）、`description`、`format`（必需，例如 `JsonSchema`）
以及 `versions`（该架构的各个迭代版本）。

向用户报告时，请列举事件类型（id、category、format，以及它们携带的是内联 `schema` 还是 `schemaUrl`）和架构（id、format 和版本数量）。

---

## 验证事件架构集配置

解码定义后（参见[获取事件架构集定义](#get-event-schema-set-definition)），
使用解析后的结构回答有关事件架构集配置方式的只读验证问题。
此操作仅用于检查——绝不会修改项目。

- **每个事件类型的内联 `schema` 与 `schemaUrl`** — 对于每个事件类型，`schema`（嵌入式架构文档）和
  `schemaUrl`（指向外部托管架构的指针）**互斥**。
  针对每个 `eventType` 报告它携带的是哪一个。两者都是**可选的**，因此事件类型
  **两者均未携带**也是有效的（以中性方式报告）；只有事件类型**同时携带两者**时才是无效的。
- **架构格式和版本** — 对于 `schemas` 下的每个条目，报告其 `format`（例如
  `JsonSchema`）和 `versions` 的数量。使用这些信息确认目录是否采用一致的
  格式，并找出版本数为零或异常多的架构。
- **类别构成** — 汇总 `eventTypeCategory` 的分布情况（`EventType` 与
  `BusinessEventType`），以便用户确认目录是否符合其预期用途。

```bash
# Given the decoded definition JSON in $DEF (see Get Event Schema Set Definition),
# list each event type and whether it uses an inline schema or a schemaUrl:
echo "$DEF" | jq -r '(.eventTypes // [])[]
  | "\(.id): \(.eventTypeCategory) [\(.format)] -> "
    + (if (.schema != null and .schemaUrl != null) then "BOTH schema and schemaUrl (invalid)" elif .schema != null then "inline schema" elif .schemaUrl != null then "schemaUrl=\(.schemaUrl)" else "no inline schema or schemaUrl" end)'

# Summarize schema formats and version counts:
echo "$DEF" | jq -r '(.schemas // [])[] | "\(.id): \(.format), \(.versions | length) version(s)"'
```

将检查结果报告为简短的逐事件类型摘要，以及架构格式/版本汇总。如果
工作区不包含任何事件架构集，请报告未找到任何事件架构集（这不是错误）。

---

## 必须 / 优先 / 避免

### 必须

- **在进行任何列举或检查之前，先拒绝写入请求** — 如果用户要求
  **创建、添加、更新、修改、重命名或删除**事件架构集或事件
  类型/架构，请明确说明此技能为**只读（仅供使用）**，无法
  执行写入操作，然后引导其使用 Fabric **事件架构集创作 REST API**。
  不得先列举或检查项目，即使目标不存在也不得继续。
- 使用 `az rest` 调用时，**始终传递 `--resource https://api.fabric.microsoft.com`**
- **始终使用 JMESPath 筛选**来解析工作区名称 → ID 和项目名称 → ID
- **处理分页** — 检查列表响应中的 `continuationUri`/`continuationToken`
- **轮询 LRO 响应** — 长时间运行的调用可能返回 `202 Accepted`

### 建议

- 使用 `jq`（bash）或 `ConvertFrom-Json`（PowerShell）进行解析
- 在向用户报告之前，将输出解码并整理为易于阅读的摘要

### 避免

- 不要硬编码工作区或项 ID——始终通过 API 查找它们
- 不要使用此读取技能修改事件架构集或事件架构——目前尚无专用的创作技能，因此写入操作请使用 Fabric Event Schema Set 创作 REST API

---

## 示例

### 示例 1——列出工作区中的事件架构集

**提示：**“列出我的 `Analytics` 工作区中的所有事件架构集。”

**流程：**
1. 通过 `GET /v1/workspaces` + JMESPath 将工作区名称解析为 ID（请参阅目录中的 *在 Fabric 中查找工作区和项* 参考资料）。
2. `GET /v1/workspaces/${WORKSPACE_ID}/eventSchemaSets`.
3. 报告每个项的 `displayName` 和 `id`（通过 `continuationToken` 处理分页）。

### 示例 2——检查事件架构集的属性

**提示：**“显示 `Analytics` 中 `orders-catalog` 事件架构集的 OneLake 路径和敏感度标签。”

**流程：**
1. 解析工作区 ID，然后通过按 `displayName=='orders-catalog'` 筛选列表来解析项 ID。
2. `GET /v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}`.
3. 汇总 `displayName`、`description`、`properties.oneLakeRootPath` 和 `sensitivityLabel.id`。

### 示例 3——解码定义并汇总事件类型和架构

**提示：**“解码 `orders-catalog` 事件架构集的定义，并告诉我它的事件类型和架构。”

**流程：**
1. 解析工作区 ID 和项 ID（同上）。
2. `POST /v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}/getDefinition`（发送空的 `{}` 请求体；如果返回 `202`，则轮询 `Location` 标头）。
3. 选择架构部分（`.path != ".platform"`），对其 `payload` 进行 base64 解码，然后解析 JSON。
4. 枚举 `eventTypes`（id、category、format、内联 `schema` 与 `schemaUrl`）和 `schemas`（id、format、版本数量）。

### 示例 4——获取架构的特定版本

**提示：**“获取 `Analytics` 中 `orders-catalog` 事件架构集内架构 `BicycleSchema` 的版本 `v2`。”

用户提供**事件架构集名称**、**架构 id** 和**版本 id**。每个版本都是一个对象，具有必需且稳定的字符串 `id`（例如 `v1`、`v2`）——应按该 `id` 选择版本，而不是按数组位置选择。

**流程：**
1. 解析工作区 ID，然后通过按 `displayName` 筛选列表来解析事件架构集项 ID。如果没有匹配项，请报告未找到该事件架构集并停止。
2. `POST /v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}/getDefinition`（发送空的 `{}` 请求体；如果返回 `202`，则轮询 `Location` 标头），选择架构部分（`.path != ".platform"`），对其 `payload` 进行 base64 解码，然后解析 JSON。
3. 在 `schemas` 中查找 `id` 等于所请求架构 id 的条目（使用空值安全访问——`schemas` 可能不存在）。如果没有匹配的架构，请报告未找到所请求的 id，列出可用的架构 id，然后停止。
4. 在该架构的 `versions` 数组中（以空值安全的方式），查找 `id` 与所请求版本 id 匹配的版本——例如 `(.versions // [])[] | select(.id == $versionId)`。如果没有版本具有该 `id`，不要静默选择其他版本。告知用户未找到所请求的版本 id，列出可用的版本 id，并询问他们是希望：
   - 使用**最新**版本（最后一个条目，`(.versions // [])[-1]`），
   - 使用他们指定的**其他**版本 id，或
   - **中止**。
   仅在用户做出选择后继续（并重新验证其新选择）。如果该架构根本没有任何版本，请报告这一情况并停止。
5. 报告所选版本的 `id`、`format` 和 `schema` 文档。此操作为只读——绝不要修改该项。

### 示例 5 — 列出业务事件（与常规事件对比）

**提示词：**“列出 `Analytics` 中 `orders-catalog` 事件架构集里的所有业务事件。”

业务事件**并非**一个单独的集合，而是 `eventTypes` 中 `eventTypeCategory` 为 `BusinessEventType` 的条目。常规事件是指 `eventTypeCategory` 设置为 `EventType` **或缺少该字段**（该字段为可选字段）的事件。

**流程：**
1. 解析工作区 ID 和事件架构集项 ID（同上）。
2. `POST /v1/workspaces/${WORKSPACE_ID}/eventSchemaSets/${ITEM_ID}/getDefinition`（发送空的 `{}` 正文；如果返回 `202`，则轮询 `Location` 标头），选择架构部分（`.path != ".platform"`），对其 `payload` 进行 base64 解码，并将 JSON 解析到 `$DEF` 中。
3. 按类别筛选 `eventTypes` 数组（使用空值安全访问，因为 `eventTypes` 可能不存在）：
   - **业务事件：** `echo "$DEF" | jq -r '(.eventTypes // [])[] | select(.eventTypeCategory == "BusinessEventType") | .id'`
   - **常规事件**（对称操作）：将谓词替换为 `select((.eventTypeCategory // "EventType") != "BusinessEventType")`。
4. 报告每个匹配事件的 `id`、`format`，以及它是否包含内联 `schema` 或 `schemaUrl`。如果没有匹配项，则报告该架构集没有业务事件（这不属于错误）。仅限读取——绝不要修改该项。

---

## 代理集成说明

- 此 Skill **仅限读取**——它不会创建、更改或删除项。
- 对于创作操作，目前尚无专用的创作 Skill——请直接使用 Fabric 事件架构集创作 REST API。
- 对于跨工作负载编排，请委托给 **FabricDataEngineer** 代理。