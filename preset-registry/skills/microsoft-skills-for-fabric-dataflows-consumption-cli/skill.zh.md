---
name: dataflows-consumption-cli
description: >
  Monitor, inspect, and query saved Fabric Dataflows Gen2 with read-only CLI.
  List dataflows, decode mashup.pq/queryMetadata.json/.platform, inspect parameters,
  refresh status, job history, staging, and destinations, or run saved/ad-hoc
  read-only executeQuery requests and parse Arrow. Handle explicit
  requests to mutate through the Dataflows consumption or read-only path by
  refusing the write; offer `dataflows-authoring-cli` only after separate
  confirmation. For candidate M before persistence or connection configuration, use
  `dataflows-authoring-cli`. Triggers: "list dataflows", "inspect dataflow",
  "decode dataflow definition", "dataflow parameters", "refresh history",
  "last refresh status", "dataflow job history", "execute dataflow query",
  "executeQuery saved query", "executeQuery fetch rows", "ad-hoc dataflow
  query", "parse Arrow response", "Arrow IPC", "dataflow staging analysis",
  "use Dataflows consumption path to delete", "Dataflows read-only mutation
  refusal", "separate Dataflows authoring handoff".
---
> **更新检查 — 每个会话仅一次（强制）**
> 在会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本次会话中之前已经执行过该检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要按名称查找数据流：列出工作区中的所有数据流，并在客户端按 `displayName` 筛选——不存在服务端名称筛选器
> 3. `getDefinition` 是 **POST**，而不是 GET——即使它执行的是数据读取操作

> **范围边界 — 只读（强制）**
> 此技能**严格只读**。你**绝不能**创建、更新或删除
> 数据流或其定义——这意味着**不得**执行 `Delete Dataflow`、**不得**
> 执行 `Create Dataflow`、**不得**执行 `updateDefinition`，也**不得**执行任何其他会引发变更或破坏性操作的
> 调用（例如，针对数据流执行 `az rest --method delete/put/patch`，或者执行会
> 创建/覆盖内容的 POST）。仅允许执行下文明确记录的读取端
> `getDefinition` 和 `executeQuery` POST 操作。
> 如果用户要求删除、创建、修改或持久化数据流，必须**在最终响应中明确
> 拒绝此变更操作**，并仅将
> `dataflows-authoring-cli` 作为未来的交接对象提及。不要调用该技能，
> 不要为写入操作进行准备性发现，也不要在同一轮中继续写入工作流。
> 只有在用户明确确认一个单独的创作请求后，才能开始变更操作。

# dataflows-consumption-cli — 通过 CLI 使用 Dataflows Gen2

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) ||
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) ||
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助工具 |
| 作业执行（CLI） | [COMMON-CLI.md § 作业执行](../../common/COMMON-CLI.md#job-execution) ||
| 注意事项与故障排除（CLI 特有） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特有）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| 使用能力矩阵 | [DATAFLOWS-CONSUMPTION-CORE.md § 使用能力矩阵](../../common/DATAFLOWS-CONSUMPTION-CORE.md#consumption-capability-matrix) | **请先阅读** — 展示可用的操作 |
| REST API 接口（使用） | [DATAFLOWS-CONSUMPTION-CORE.md § REST API 接口](../../common/DATAFLOWS-CONSUMPTION-CORE.md#rest-api-surface-consumption) | 列出、获取、参数、getDefinition、作业 |
| 数据流定义探索 | [DATAFLOWS-CONSUMPTION-CORE.md § 数据流定义探索](../../common/DATAFLOWS-CONSUMPTION-CORE.md#dataflow-definition-exploration) | 解码 mashup.pq、queryMetadata.json、.platform |
| 参数发现与分析 | [DATAFLOWS-CONSUMPTION-CORE.md § 参数发现与分析](../../common/DATAFLOWS-CONSUMPTION-CORE.md#parameter-discovery-and-analysis) | 类型、格式、M 代码模式 |
| 刷新与作业监控 | [DATAFLOWS-CONSUMPTION-CORE.md § 刷新与作业监控](../../common/DATAFLOWS-CONSUMPTION-CORE.md#refresh-and-job-monitoring) | LRO 模式、作业实例、轮询最佳实践 |
| 代理式探索模式 | [DATAFLOWS-CONSUMPTION-CORE.md § 代理式探索模式（“与我的数据流聊天”）](../../common/DATAFLOWS-CONSUMPTION-CORE.md#agentic-exploration-pattern-chat-with-my-dataflows) | 6 步发现序列 |
| 安全与权限模型 | [DATAFLOWS-CONSUMPTION-CORE.md § 安全与权限模型](../../common/DATAFLOWS-CONSUMPTION-CORE.md#security-and-permissions-model) | 按操作划分的权限矩阵 |
| 常见错误 | [DATAFLOWS-CONSUMPTION-CORE.md § 常见错误](../../common/DATAFLOWS-CONSUMPTION-CORE.md#common-errors) | 错误代码及解决方案 |
| 注意事项与故障排除参考 | [DATAFLOWS-CONSUMPTION-CORE.md § 注意事项与故障排除](../../common/DATAFLOWS-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference) | 12 个带有原因和解决方案的编号问题 |
| 快速参考单行命令 | [consumption-cli-quickref.md](references/consumption-cli-quickref.md) | 适用于所有使用操作的 `az rest` 单行命令 |
| 发现模式 | [discovery-queries.md](references/discovery-queries.md) | 定义解码、参数提取、连接分析 |
| 脚本模板 | [script-templates.md](references/script-templates.md) | 可复制粘贴的 bash 和 PowerShell 模板 |
| 预览数据可视化 | [chart-visualization.md](references/chart-visualization.md) | 将 `executeQuery` 结果呈现为 ASCII 折线图/条形图/饼图（无依赖） |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) ||
| 连接 | [SKILL.md § 连接](#connection) ||
| 代理式探索（“与我的数据流聊天”） | [SKILL.md § 代理式探索](#agentic-exploration-chat-with-my-dataflows) | 数据流探索请**从这里开始** |
| 查询执行 | [SKILL.md § 查询求值](#query-evaluation) | 执行单个查询；响应为 Apache Arrow 二进制格式 |

---

## 工具栈

| 工具 | 作用 | 安装方式 |
|---|---|---|
| `az` CLI | **主要工具**：身份验证（`az login`），通过 `az rest` 调用 Fabric REST API | 在大多数开发环境中已预安装 |
| `curl` | 用于 REST 调用的备用 HTTP 客户端 | 已预安装 |
| `jq` | 解析 JSON 响应、提取字段、格式化输出 | 已预安装或易于安装 |
| `base64` | 解码 base64 格式的定义部分 | bash 内置；PowerShell 使用 `[Convert]::FromBase64String` |
| `bash`/`pwsh` | 执行脚本 | 已预安装 |

> **智能体检查** — 首次操作前进行验证：
> ```bash
> az account show >/dev/null 2>&1 || echo "RUN: az login"
> command -v jq >/dev/null 2>&1 || echo "INSTALL: apt-get install jq OR brew install jq"
> ```

---

## 连接

### 解析工作区 ID 和数据流 ID

按照 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的“在 Fabric 中查找工作区和项目”：

```bash
# Find workspace ID by name
WS_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --query "value[?displayName=='My Workspace'].id" --output tsv)

# Find dataflow ID by name within workspace
DF_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/dataflows" \
  --query "value[?displayName=='Sales Data Pipeline'].id" --output tsv)
```

### 可复用的连接变量

```bash
# Set once at script top
WS_ID="<workspaceId>"
DF_ID="<dataflowId>"
API="https://api.fabric.microsoft.com/v1"
AZ="az rest --resource https://api.fabric.microsoft.com"
```

---

## 智能体式探索（“与我的数据流对话”）

### 发现序列

按顺序运行以下命令，以全面探索工作区中的数据流。有关扩展模式，请参阅 [references/discovery-queries.md](references/discovery-queries.md)。

```bash
# 1. List workspaces → find target
az rest --method get --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces" --query "value[].{name:displayName, id:id}" -o table

# 2. List dataflows → enumerate all
az rest --method get --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces/$WS_ID/dataflows" \
  --query "value[].{name:displayName, id:id, desc:description}" -o table

# 3. Get dataflow properties
az rest --method get --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID"

# 4. Discover parameters
#    Note: the /parameters endpoint returns DataflowNotParametricError (an HTTP 4xx)
#    for a non-parametric dataflow (no Power Query parameters). Treat that as
#    "this dataflow has no parameters" and report it plainly — do NOT surface the
#    raw error. Optionally confirm by checking mashup.pq for `IsParameterQuery`.
az rest --method get --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/parameters" \
  --query "value[].{name:name, type:type, required:isRequired, default:defaultValue}" -o table

# 5. Get definition → decode mashup.pq
RESPONSE=$(az rest --method post --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/getDefinition")
echo "$RESPONSE" | jq -r '.definition.parts[] | select(.path=="mashup.pq") | .payload' | base64 --decode

# 6. Check job history
az rest --method get --resource "https://api.fabric.microsoft.com" \
  --url "$API/workspaces/$WS_ID/dataflows/$DF_ID/jobs/instances" \
  --query "value[].{status:status, type:invokeType, start:startTimeUtc, end:endTimeUtc, error:failureReason}" -o table
```

### 智能体工作流

1. **发现** → 执行步骤 1–3，列出并识别数据流。
2. **参数** → 执行步骤 4，了解输入和默认值。
3. **定义** → 执行步骤 5，检查 M 查询、连接和暂存配置。
4. **监控** → 执行步骤 6，查看刷新历史记录和错误模式。
5. **迭代** → 深入查看特定查询或连接详情。
6. **呈现** → 汇总发现或生成可复用脚本（请参阅 [script-templates.md](references/script-templates.md)）。

---

## 注意事项、规则与故障排除

有关完整的平台注意事项，请参阅 [DATAFLOWS-CONSUMPTION-CORE.md](../../common/DATAFLOWS-CONSUMPTION-CORE.md) 中的注意事项和故障排除参考，以及 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的注意事项与故障排除（CLI 专用）。

### 必须执行

- **始终先执行 `az login`** — `az rest` 使用当前活动会话。没有会话 → 会出现含义不明的失败。
- **始终使用 `--resource "https://api.fabric.microsoft.com"`** — 受众错误 = 401。
- **处理分页** — 使用 `continuationToken` 重复发送请求，直到该字段不存在或为 null。
- **处理 `getDefinition` 的 LRO** — 可能返回带有 `Location` 标头的 `202 Accepted`；轮询直至完成。
- **检查前先解码 base64** — 定义的各部分采用 base64 编码。
- **对 `getDefinition` 使用 POST** — 它不是 GET 端点。

### 避免

- **硬编码 GUID** — 始终通过先列出再筛选的模式进行发现。
- **假设 `getDefinition` 是 GET** — 它是 POST（常见错误）。
- **忽略分页** — 列表端点可能返回不完整的结果。
- **过于频繁地轮询** — 遇到 429 时，请遵循 `Retry-After` 标头。
- **期望使用 Viewer 角色调用 `getDefinition`** — 需要 Read+Write（Contributor+）。

### 优先采用

- **优先使用 `az rest`，而不是原始 `curl`** — 可自动处理身份验证。
- **先列出再筛选的模式** — 数据流不支持服务端名称筛选。
- **对作业轮询使用指数退避** — 5 秒 → 10 秒 → 20 秒 → 上限 30 秒。
- **使用 `jq` 解析响应** — 比 shell 字符串操作更简洁。
- **使用 JMESPath `--query`** — 直接在 `az rest` 中进行简单字段提取。
- **使用环境变量**（`WS_ID`、`DF_ID`、`API`）以便复用脚本。

### 故障排除

| 症状 | 原因 | 解决方法 |
|---|---|---|
| `401 Unauthorized` | 令牌已过期或受众错误 | 执行 `az login`；确保使用 `--resource "https://api.fabric.microsoft.com"` |
| `getDefinition` 出现 `403 Forbidden` | Viewer 角色（只读） | 需要 Contributor 或更高角色（Read+Write） |
| `404 Not Found` | 工作区或数据流 ID 错误 | 通过 List Dataflows API 重新发现 |
| `getDefinition` 返回 `202` | 定义较大或服务器负载较高 | 轮询 `Location` 标头中的 URL，直到操作完成 |
| `/parameters` 出现 `DataflowNotParametricError`（4xx） | 数据流没有 Power Query 参数（非参数化） | 这是预期情况 — 报告“此数据流没有参数”；不要显示原始错误。可以选择通过 mashup.pq 中的 `IsParameterQuery` 进行确认 |
| `queryMetadata.json` 中的 `connections` 数组为空或不存在 | 查询使用内联/字面量源（例如 `#table()`），因此没有可绑定的外部连接 | 这是预期情况 — 报告“没有外部数据源连接（内联源）”；不要虚构绑定 |
| Base64 解码后显示乱码 | 编码内容中存在 BOM | 解码时移除 UTF-8 BOM（`\xEF\xBB\xBF`） |
| `429 TooManyRequests` | 受到速率限制 | 遵循 `Retry-After` 标头；实现指数退避 |
| 列表中出现重复结果 | 重复使用了过期的 continuationToken | 始终使用最近一次响应中的令牌 |
| `OperationNotSupportedForItem` | 项目类型错误 | 通过 Get Item 验证项目类型是否为 `Dataflow` |

---

## 示例

### 示例 1：列出工作区中的所有数据流

**提示词**：“列出此工作区中的所有数据流。”

**代理响应**：

```bash
az rest --method get \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows" \
  --resource "https://api.fabric.microsoft.com" \
  --query "value[].{Name:displayName, Id:id, Type:type}" -o table
```

### 示例 2：解码数据流定义

**提示词**：“显示此数据流中的 Power Query M 代码。”

**代理响应**：

```bash
# Step 1: Request definition (POST returns 202 with Location header).
# az rest cannot expose response headers, so capture Location via curl + az-acquired token.
TOKEN=$(az account get-access-token --resource "https://api.fabric.microsoft.com" --query accessToken -o tsv)
LOCATION=$(curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Length: 0" \
  "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/getDefinition" \
  -o /dev/null -D - | tr -d '\r' | grep -i "^location:" | awk '{print $2}')

# Step 2: Poll until definition is ready
DEF=$(az rest --method get --url "${LOCATION}" \
  --resource "https://api.fabric.microsoft.com")

# Step 3: Decode mashup.pq to see the Power Query M code
echo "$DEF" | python3 -c "
import json, base64, sys
parts = json.load(sys.stdin)['definition']['parts']
for p in parts:
    if p['path'] == 'mashup.pq':
        print(base64.b64decode(p['payload']).decode('utf-8'))
"
```

### 示例 3：检查刷新作业历史记录

**提示词**：“显示此数据流最近的刷新历史记录。”

**代理响应**：

```bash
# Get recent job instances for a dataflow
az rest --method get \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/jobs/instances?limit=5" \
  --resource "https://api.fabric.microsoft.com" \
  --query "value[].{Status:status, Start:startTimeUtc, End:endTimeUtc, Id:id}" -o table
```

### 示例 4：从定义中发现参数

**提示词**：“此数据流接受哪些参数？”

**代理响应**：

```bash
# After decoding the definition (see Example 2), extract parameters:
echo "$DEF" | python3 -c "
import json, base64, sys
parts = json.load(sys.stdin)['definition']['parts']
for p in parts:
    if p['path'] == 'queryMetadata.json':
        meta = json.loads(base64.b64decode(p['payload']).decode('utf-8'))
        for qname, qmeta in meta.get('queriesMetadata', {}).items():
            if qmeta.get('queryGroupId') == 'parameters' or 'IsParameterQuery' in str(qmeta):
                print(f'Parameter: {qname}')
"
```

---

## 查询求值

执行数据流中的单个查询并检查结果。**响应是原始 Apache Arrow IPC 流**，其 `Content-Type: application/vnd.apache.arrow.stream`——**不是** JSON 封装。有效流的前四个字节是 IPC 延续标记 `ff ff ff ff`。使用 `pyarrow.ipc.open_stream()` 进行解析。

> **传输格式**：`executeQuery` 返回原始 Apache Arrow IPC 字节流（`Content-Type: application/vnd.apache.arrow.stream`）——**不是 JSON**。不要尝试使用 `jq` 解析它——其中没有可供提取的 JSON 封装。使用 `--output-file` 保存这些字节，并将其作为 Arrow 进行解析（请参阅示例 5–7）。

> **失败时也会返回 HTTP 200**：即使底层数据源查询失败（Kusto SEM0100、T-SQL 语法错误、缺少列等），`executeQuery` 仍会返回 `200 OK` 和 `application/vnd.apache.arrow.stream`。错误会以 `{"Error":"..."}` 的形式嵌入流的 `PQ Arrow Metadata` 部分中——有关检测器代码片段，请参阅 [dataflows-authoring-cli § mashup-preview.md → 检测 Arrow 正文中的失败](../dataflows-authoring-cli/references/mashup-preview.md#detecting-failures-inside-the-arrow-body)。仅检查 HTTP 状态会将失败误判为成功。

> **意图区分（`executeQuery` 的规范参考文档为 [mashup-preview.md](../dataflows-authoring-cli/references/mashup-preview.md)）**：同一个 `executeQuery` 端点服务于两种不同的意图。本技能涵盖**使用**意图：
> - **(a) 执行持久化查询**——请求正文仅包含 `{"QueryName":"<saved-shared>"}`（不含 `customMashupDocument`）。
> - **(b) 临时只读 `customMashupDocument`**——预览候选的 `section Section1; ...` 文档，且**无意**通过 `updateDefinition` 将其持久化（示例 7）。
>
> 如果你打算**持久化** M，请使用 [`dataflows-authoring-cli` § 工作流 C（预览驱动的创作循环）](../dataflows-authoring-cli/SKILL.md#c-preview-driven-authoring-loop-pre-save-executequery--see-mashup-previewmd)——其中增加了引导绑定规则（为使用凭据的新数据流解决“先有鸡还是先有蛋”的连接绑定问题）、自动包装规则、严禁无界预览的规定，以及预览后的持久化步骤。

> **自动包装注意事项**：Fabric REST API 要求 `customMashupDocument` 是一个**完整的 `section Section1; ... shared X = ...;` 文档**。原始 `let ... in ...` 表达式**不会**在服务器端自动包装——请发送完整的 section 文档，并确保请求字段 `QueryName` 与其中声明的某个 `shared` 成员匹配。

> **正文结构**：发送一个顶层包含 `QueryName` 的**扁平对象**（字段名称在传输时不区分大小写；规范形式为 PascalCase）。无论内部字段采用何种大小写，`{"queries":[{...}]}` 数组结构始终会返回 `400 DataflowExecuteQueryError: Invalid query name`。错误的 `QueryName` 值会返回 `QueryNotFound`（不同的错误代码）。请参阅 [dataflows-authoring-cli § mashup-preview.md → 请求正文](../dataflows-authoring-cli/references/mashup-preview.md#custommashupdocument-format)。

> **重量级持久化查询的 `TimedOut` 恢复方法**：如果持久化的 `shared <Q>` 成员计算开销过大，超出了服务器端的 `executeQuery` 时间预算（观察到约为 90 秒；表现为 `400 DataflowExecuteQueryError` → `InternalErrorCode: EvaluationError, Message: Evaluation result error code: TimedOut`），请**不要**使用相同的正文重试——其结果是确定性的。应改为重新发送请求，将 `customMashupDocument` 设置为完整的持久化 `mashup.pq`（通过示例 2 解码），并在末尾追加探测查询 `shared __PreviewCap = Table.FirstN(<Q>, 10);`，同时设置 `QueryName: "__PreviewCap"`。对于大多数连接器（Kusto、SQL、OData、Web 表），该条数限制都会下推，因此数据源仅返回样本。请参阅 [dataflows-authoring-cli § mashup-preview.md → 已观察到的 `InternalErrorCode` 值](../dataflows-authoring-cli/references/mashup-preview.md#b-non-200-with-errorresponse-json-envelope)。

### 前提条件

- 数据流必须存在（通过上面的示例 1 验证）
- 查询名称必须存在于数据流中（通过示例 2 在 mashup.pq 中验证）
- 用户必须对数据流拥有 **参与者角色或更高权限**（读写）
- **可选**：查询参数和自定义 M 代码修改

### 示例 5：执行查询并保存结果

**提示词**：“执行此数据流中的 SalesData 查询并保存结果。”

**代理响应**：

```bash
# Step 1: Identify the query to execute (must be a `shared` member of the dataflow's mashup)
QUERY_NAME="SalesData"  # Replace with your query name

# Step 2: Build the request body. To execute the persisted query as-is, send ONLY
#   QueryName — omit customMashupDocument. (Do NOT pass a self-referential
#   `shared X = let Source = #shared[X] in Source` — that recurses on itself
#   inside the candidate document.) For custom M, see Example 7.
jq -n --arg q "$QUERY_NAME" '{QueryName: $q}' > req.json

# Step 3: Execute the query (raw Apache Arrow IPC stream is written directly to disk)
az rest --method post \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/executeQuery" \
  --resource "https://api.fabric.microsoft.com" \
  --body "@req.json" \
  --output-file "${QUERY_NAME}_results.arrow"

# Step 4: Check for embedded source errors (HTTP 200 does NOT mean success)
if grep -q '"Error":"' "${QUERY_NAME}_results.arrow"; then
  echo "Query execution failed (embedded in Arrow body):"
  python3 -c "import re,sys; raw=open(sys.argv[1],'rb').read().decode('utf-8','replace'); m=re.search(r'\\{\"Error\":\"[^\"]+\"\\}', raw); print(m.group(0) if m else '(marker present, JSON not parsed)')" "${QUERY_NAME}_results.arrow"
  exit 1
fi

echo "Query results saved to ${QUERY_NAME}_results.arrow"
```

> **为什么使用 `--output-file`？** 如果不使用它，`az rest` 会将原始字节转储到标准输出，并显示警告 `Not a json response, outputting to stdout. For binary data suggest use "--output-file" to write to a file`。对 `executeQuery` 始终传递 `--output-file`，以便完整捕获 Arrow IPC 流。早期文档中的 `jq -r '.data' | base64 --decode` 模式**不适用于 `az rest`**——没有可供提取的 JSON 封装。

### 示例 5b：将查询结果呈现为 Markdown 表格

**提示词**：“向我显示这些结果的前 10 行。”

**代理响应**——读取已保存的 Arrow 文件，并在聊天中将 `head(N)` 呈现为 Markdown 表格。**每次执行 `executeQuery` 后都应执行此操作**（默认 `N=10`）。可视化预览可以捕获嵌入式错误检测器遗漏的*静默成功*问题：筛选器删除了所有行、引用了错误的列、使用了错误的类型转换、筛选存在差一错误、联接键拼写错误。

```bash
N=${N:-10}; ARROW_FILE="${QUERY_NAME}_results.arrow"
python3 - <<EOF
import json, sys, pyarrow as pa, pyarrow.ipc as ipc

with open("$ARROW_FILE", "rb") as f:
    try:
        reader = ipc.open_stream(f)
    except pa.lib.ArrowInvalid:
        f.seek(0); reader = ipc.open_file(f)
    # Surface any embedded engine error before rendering (mirrors mashup-preview.md § Error handling — A)
    for v in (reader.schema.metadata or {}).values():
        s = v.decode("utf-8", errors="replace")
        if '"Error"' in s:
            try:
                msg = json.loads(s)["Error"]
            except (ValueError, KeyError):
                msg = s[:200]
            sys.exit(f"Preview failed: {msg}")
    table = reader.read_all()

rows, cols = table.num_rows, table.num_columns
print(f"**{rows} rows × {cols} columns** · {', '.join(table.schema.names)}\n")
if rows == 0:
    sys.exit(0)

# Slice at the Arrow level before converting — avoids materialising the whole result.
df = table.slice(0, $N).to_pandas().copy()
# Truncate long string cells so the chat table stays readable.
for c in df.select_dtypes(include=["object", "string"]).columns:
    df[c] = df[c].astype(str).str.slice(0, 50)
try:
    print(df.to_markdown(index=False))           # requires the `tabulate` package
except ImportError:
    print(df.to_string(index=False))             # fallback: fixed-width text
EOF
```

> **可选依赖项**：`pandas.DataFrame.to_markdown()` 需要 `tabulate` 包——请通过你所在环境的标准 Python 工具一次性安装它，安装方式与示例 6 中安装 `pyarrow` / `pandas` 的方式相同。如果缺少 `tabulate`，该代码片段会回退到使用固定宽度的 `to_string()`，因此仍然可以正常渲染。

> **何时跳过渲染**：默认渲染 `head(N)`。仅在以下情况下跳过：(a) 用户明确要求获取不带预览的原始 Arrow 文件；(b) 结果行数超过约 1000——在这种情况下，仍应渲染 `head(N)`，并添加一行说明总行数；或 (c) 结果正被直接流式传输到另一个将直接使用该 Arrow 文件的工具。在其他所有情况下，都应**渲染**——仅保存文件并不能让用户在聊天中看到其内容。

### 示例 6：将 Arrow 结果转换为 CSV

**提示词**：“将我的 Arrow 查询结果转换为 CSV，以便我可以在 Excel 中打开它们。”

**智能体响应**：

> **先决条件（一次性客户端设置）**：此示例使用 `pyarrow` 解码 Arrow IPC 流，并使用 `pandas` 写入 CSV。请通过你所在环境的标准 Python 工具一次性安装它们。这些是本地客户端依赖项，**不**属于 Fabric 配方的一部分。

```bash
python3 <<EOF
import pyarrow as pa
import pandas as pd
import sys

ARROW_FILE = "${QUERY_NAME}_results.arrow"
CSV_FILE = "${QUERY_NAME}_results.csv"

# Open the Arrow IPC stream directly (raw on the wire, no envelope)
with open(ARROW_FILE, "rb") as f:
    reader = pa.ipc.open_stream(f)

    # Defensive: surface any error embedded in the stream's PQ Arrow Metadata
    md = reader.schema.metadata or {}
    for k, v in md.items():
        s = v.decode("utf-8", errors="replace")
        if '"Error"' in s:
            print(f"Preview failed: {s}", file=sys.stderr)
            sys.exit(1)

    table = reader.read_all()

# Convert to pandas and export as CSV
df = table.to_pandas()
df.to_csv(CSV_FILE, index=False)

print(f"Converted {len(df)} rows to CSV")
print("Columns:", list(df.columns))
EOF
```

### 示例 7：使用自定义 M 代码进行查询

**提示词**：“针对该数据流运行一次性的临时 M 查询，不要保存它。”

> **意图**：执行临时的**只读**操作。`customMashupDocument` **不会**被持久化。如果你打算通过 `updateDefinition` 保存 M，请改用 [`dataflows-authoring-cli` § 工作流 C](../dataflows-authoring-cli/SKILL.md#c-preview-driven-authoring-loop-pre-save-executequery--see-mashup-previewmd)——它增加了引导绑定、自动包装和预览后持久化规则。

**智能体响应**：

```bash
# Execute a query with custom M code (e.g., filter, aggregate, transform).
# The customMashupDocument must be a complete `section` document; az rest does NOT auto-wrap raw expressions.
CUSTOM_M='section Section1;

shared CustomQuery = let
    Source = Table.FromRecords({[id=1, name="Alice"], [id=2, name="Bob"]}),
    Filtered = Table.SelectRows(Source, each [id] > 0)
in
    Filtered;'

jq -n --arg m "$CUSTOM_M" '{QueryName: "CustomQuery", customMashupDocument: $m}' > req.json

az rest --method post \
  --url "https://api.fabric.microsoft.com/v1/workspaces/${WS_ID}/dataflows/${DF_ID}/executeQuery" \
  --resource "https://api.fabric.microsoft.com" \
  --body "@req.json" \
  --output-file custom_results.arrow

# Always check for embedded errors before treating the file as a success
if grep -q '"Error":"' custom_results.arrow; then
    echo "Custom query failed; inspect custom_results.arrow for the embedded {\"Error\":...} block."
    exit 1
fi
```

---

## 输出预期

当此技能完成任务时，代理应返回：

| 字段 | 约定 |
|---|---|
| **详细程度** | 状态使用简洁摘要（3–10 行）；列表/检查响应使用 Markdown 表格。 |
| **默认格式** | `list` 类查询使用 Markdown 表格；单个资源响应使用带围栏的 JSON 代码块；原始解码后的 `mashup.pq` 使用带围栏的 ` ```m ` 代码块。对于 `executeQuery`：将完整的 Arrow 流保存到文件，**并且**在聊天中将 `head(N)`（默认 `N=10`）渲染为 Markdown 表格——请参阅[示例 5b](#example-5b-render-query-results-as-a-markdown-table)。仅在用户明确要求、`rows > 1000`（渲染前若干行并附上总数说明）或结果正被流式传输到另一个工具时禁止渲染。 |
| **副作用披露** | 这是一个**只读**技能——绝不暗示会进行修改，并且应**拒绝**任何创建/更新/删除请求（将其转交给 `dataflows-authoring-cli`）。 |
| **验证** | 在响应中包含源 URL（例如 `az rest --url` 的值），以便用户复现该调用。 |
| **错误呈现** | 如果 `executeQuery` 返回的 Arrow 中嵌入了 `{"Error":"..."}`，请逐字呈现该错误，不要将部分结果作为成功结果展示。 |