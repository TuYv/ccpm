---
name: dataflows-save-as-authoring-cli
description: >
  Copy, clone, duplicate, rebind, and execute Gen1 dataflow save-as upgrade operations via CLI
  (az rest / curl) against Power BI REST and Fabric REST APIs. Covers Gen1 to Gen2.1 upgrade save-as,
  cross-workspace Gen1-to-Gen2.1 copy flows, connection rebinding, output changes, readiness snapshots,
  and SaveAsNativeArtifact execution. Use when the user wants to: (1) discover Gen1 dataflows,
  (2) assess save-as readiness, (3) upgrade Gen1 into Gen2.1, (4) create a Gen2.1 copy from a Gen1 dataflow
  in another workspace, (5) rebind connections or validate saved data. For creating/editing Gen2 dataflows from scratch,
  previewing candidate M, binding ordinary authoring connections, or copying Gen2 dataflows, use `dataflows-authoring-cli`.
  Triggers: "save Gen1 dataflow", "upgrade dataflow", "Gen1 Gen2 readiness", "Gen1 Gen2 save-as",
  "saveAsNativeArtifact", "copy Gen1 dataflow", "duplicate Gen1 dataflow", "clone Gen1 dataflow",
  "rebind Gen1 dataflow connections".
---
> **更新检查 — 每个会话仅一次（强制）**
> 本技能在一个会话中首次使用时，必须先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话此前已执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

> **代际边界 — 强制停止（强制）**
> 本技能仅执行从 Gen1 到 Gen2.1 的另存为操作。对于源为 Gen2，或尚未确定源代际的执行
> 请求，应说明目前没有可用的公开另存为或原地升级端点，并在调用 API 前
> 停止。这不会阻止以发现 Gen1 候选项并对其进行分类为目的的
> 只读就绪情况扫描。
> 不要将“选择最接近的端点并继续”理解为允许
> 导出定义并创建副本，不要自动调用创作技能，
> 也不要修改任何内容。应要求用户澄清
> 预期结果，并明确批准任何单独记录的
> 替代方案。

# dataflows-save-as-authoring-cli — 通过 CLI 实现 Dataflow 从 Gen1 → Gen2.1 的另存为 CI/CD

一个另存为配套技能，使用就绪情况评估和受控执行，根据 Power BI Gen1 数据流创建升级后的 Gen2.1 副本。

> 目前无法对您的数据流执行原地迁移。我们可以使用另存为创建升级后的 Gen2.1 副本，同时保留原始 Gen1 数据流。

## 目录

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *先阅读链接* |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制 |
| 工具选择依据 | [COMMON-CLI.md § 工具选择](../../common/COMMON-CLI.md#tool-selection-rationale) | |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § az rest](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`** |
| 注意事项与故障排除（CLI） | [COMMON-CLI.md § 注意事项](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | 令牌受众／工具矩阵 |
| 数据流定义结构 | [DATAFLOWS-AUTHORING-CORE.md § 定义](../../common/DATAFLOWS-AUTHORING-CORE.md#dataflow-definition-structure) | Gen2 CI/CD 的三部分格式 |
| 使用能力矩阵 | [DATAFLOWS-CONSUMPTION-CORE.md § 能力](../../common/DATAFLOWS-CONSUMPTION-CORE.md#consumption-capability-matrix) | 只读发现模式 |
| 升级 CLI 快速参考 | [upgrade-cli-quickref.md](references/upgrade-cli-quickref.md) | 用于扫描和另存为的所有 `az rest` 单行命令 |
| 风险评估指南 | [risk-assessment-guide.md](references/risk-assessment-guide.md) | 风险信号检测逻辑与 API 调用 |

---

## 工具栈

| 工具 | 作用 | 安装方式 |
|---|---|---|
| `az` CLI | **主要工具**：身份验证（`az login`），通过 REST API 调用（`az rest`）Fabric 和 Power BI API。 | 已预装在大多数开发环境中 |
| `jq` | 解析和筛选 JSON 响应（数据流列表、风险信号提取）。 | 已预装或可轻松安装 |
| `base64` | 解码数据流定义以供检查。 | bash 内置；PowerShell 中可使用 `[Convert]::ToBase64String()` |

> **代理检查** — 首次操作前进行验证：
> ```bash
> az --version 2>/dev/null || echo "INSTALL: https://aka.ms/install-azure-cli"
> jq --version 2>/dev/null || echo "INSTALL: apt-get install jq OR brew install jq"
> ```

---

## 身份验证和 API 受众

此技能使用**两个不同的 API 受众**。使用错误的受众将返回 401。

| API | 受众（`--resource`） | 用途 |
|---|---|---|
| **Fabric Items API** | `https://api.fabric.microsoft.com` | 列出 Gen2 数据流（Fabric 原生）、工作区发现 |
| **Power BI REST API** | `https://analysis.windows.net/powerbi/api` | Gen1 数据流发现、`saveAsNativeArtifact`、数据源、上游数据流、Admin API 扫描 |

```bash
# Fabric Items API — list Gen2 dataflows in a workspace
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/dataflows"

# Power BI REST API — list all dataflows (Gen1 + Gen2) in a workspace
az rest --method get \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/groups/$WS_ID/dataflows"

# Power BI Admin API — list all dataflows tenant-wide (requires admin role)
az rest --method get \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/admin/dataflows"
```

---

## 阶段 1 — 认知与就绪情况

> **目标**：“我是否应该使用另存为？创建 Gen2.1 副本后会发生什么？”

### 代理式工作流：发现 → 评估 → 分类 → 报告

对每次另存为评估，都应遵循以下顺序：

1. **发现** — 扫描工作区以清点所有数据流，并识别 Gen1 和 Gen2
2. **评估** — 对每个 Gen1 数据流检查七个风险信号
3. **分类** — 分配就绪类别：✅ 安全 / ⚠️ 需要手动跟进 / ❌ 已阻止
4. **报告** — 输出另存为就绪情况快照（Markdown 表格 + JSON）

### 步骤 1：发现 — 识别 Gen1 数据流

Power BI REST API 会为每个数据流返回一个 `generation` 属性（值为 `1` 或 `2`）。这是**首选的**检测方法——每个工作区只需调用一次 API。

#### 非管理员路径（按工作区）

```bash
WS_ID="<workspaceId>"
RESOURCE_PBI="https://analysis.windows.net/powerbi/api"

# List all dataflows — the `generation` property distinguishes Gen1 from Gen2
ALL_DATAFLOWS=$(az rest --method get \
  --resource "$RESOURCE_PBI" \
  --url "https://api.powerbi.com/v1.0/myorg/groups/$WS_ID/dataflows" \
  --query "value[].{id:objectId, name:name, generation:generation, modelUrl:modelUrl, configuredBy:configuredBy}" -o json)

# Filter Gen1 dataflows
echo "$ALL_DATAFLOWS" | jq '[.[] | select(.generation == 1)]'

# Filter Gen2 dataflows
echo "$ALL_DATAFLOWS" | jq '[.[] | select(.generation == 2)]'
```

> **提示**：指向 `dfs.core.windows.net` 的 `modelUrl` 还表示使用了 BYOSA（客户管理的存储）——这是“另存为”操作的阻碍因素。

#### 管理员路径（租户范围）

需要 **Fabric 管理员**角色，或具有 `Tenant.Read.All` 作用域的服务主体。速率限制为每小时 200 个请求。

```bash
RESOURCE_PBI="https://analysis.windows.net/powerbi/api"

# List ALL dataflows in the tenant
ADMIN_DATAFLOWS=$(az rest --method get \
  --resource "$RESOURCE_PBI" \
  --url "https://api.powerbi.com/v1.0/myorg/admin/dataflows" \
  --query "value[].{id:objectId, name:name, workspaceId:workspaceId, modelUrl:modelUrl, configuredBy:configuredBy}" \
  -o json)

# Filter Gen1 dataflows — those with a modelUrl indicate CDM/Gen1 storage
# Note: Admin API may not expose the `generation` property; use modelUrl as fallback
echo "$ADMIN_DATAFLOWS" | jq '[.[] | select(.modelUrl != null and .modelUrl != "")]'
```

> **注意**：对于大型租户，管理员 API 支持使用 `$filter`、`$top` 和 `$skip` 进行分页。

### 第 2 步：评估——检查风险信号

对于找到的每个 Gen1 数据流，评估七个风险信号。有关详细的 API 调用，请参阅[风险评估指南](references/risk-assessment-guide.md)。

| # | 风险信号 | 检测方法 | 影响 |
|---|---|---|---|
| 1 | **增量刷新** | 检查数据流定义中的增量刷新策略配置 | ⚠️ 计划迁移后处于禁用状态；必须重新启用并验证 |
| 2 | **BYOSA / 自定义 ADLS Gen2 存储** | 检查 `modelUrl`——是否指向客户存储帐户（而非 Power BI 托管的存储） | ❌ 数据会保留在旧存储中；Gen2 CI/CD 使用 Fabric 托管的存储 |
| 3 | **Power Automate / API 触发器** | 检查是否存在引用 Gen1 数据流 ID 的外部编排 | ⚠️ 所有集成都必须更新为新的 Gen2 项目 ID |
| 4 | **下游管道依赖项** | 检查 Fabric 管道中的数据流活动引用 | ⚠️ 管道活动通过 ID 引用数据流；必须重新绑定 |
| 5 | **链接实体/计算实体** | 检查数据流定义中对其他数据流的实体引用 | ⚠️/❌ 如果未先保存源数据流，跨数据流引用可能会失效 |
| 6 | **DirectQuery 连接** | 检查定义中的数据源类型 | ❌ Gen2 CI/CD 数据流不支持 DirectQuery |
| 7 | **调用者不是所有者/角色权限不足** | 将 `configuredBy` 与 `az account show --query user.name -o tsv` 的结果进行比较——或尝试调用并捕获 `DataflowUnauthorizedError` | ❌ `saveAsNativeArtifact` 要求调用者是数据流的**所有者**，或在源工作区中拥有**参与者/管理员**权限；不具备所有权的查看者/成员无法执行“另存为”操作 |

### 第 3 步：分类——就绪类别

| 类别 | 标准 | 操作 |
|---|---|---|
| ✅ **安全** | 未检测到风险信号 | 使用 `saveAsNativeArtifact` 创建 Gen2.1“另存为”副本 |
| ⚠️ **需要手动跟进** | 存在风险信号 1、3、4 或 5（非阻塞） | 执行“另存为”，然后修复标记的问题 |
| ❌ **受阻** | 存在风险信号 2、6 或 7（阻塞） | 在解决阻碍因素之前无法执行“另存为” |

> **提示 — 另存为之前检测所有权**：数据流列表响应中的 `configuredBy` 字段包含所有者的电子邮件地址。将其与当前登录的用户（`az account show --query user.name -o tsv`）进行比较。如果二者不匹配，且你的工作区角色低于参与者，请将该数据流标记为 ❌ 已阻止（信号 7），并上报给所有者。

### 步骤 4：报告 — 另存为就绪状态快照

#### Markdown 输出（终端）

```
## Save-As Readiness Snapshot
| Workspace | Dataflow | Type | Readiness | Risk Signals | Recommendation |
|---|---|---|---|---|---|
| Sales Analytics | SalesETL | Gen1 | ✅ Safe | None | Save as Gen2.1 copy now |
| Sales Analytics | CustomerLoad | Gen1 | ⚠️ Manual | Incremental refresh, Pipeline dep | Save as Gen2.1 copy, then re-enable schedule & update pipeline |
| Finance | FinanceDaily | Gen1 | ❌ Blocked | BYOSA storage | Resolve storage dependency first |
```

#### JSON 输出（自动化）

```json
{
  "snapshotDate": "2025-04-13T10:00:00Z",
  "summary": { "total": 3, "safe": 1, "manual": 1, "blocked": 1 },
  "dataflows": [
    {
      "workspaceName": "Sales Analytics",
      "workspaceId": "...",
      "dataflowName": "SalesETL",
      "dataflowId": "...",
      "type": "Gen1",
      "readiness": "safe",
      "riskSignals": [],
      "recommendation": "Save as Gen2.1 copy now",
      "saveAsPath": "saveAsNativeArtifact"
    }
  ]
}
```

> 将 JSON 保存到文件：通过管道传递给 `jq '.' > readiness-snapshot.json`

---

## 使用防护措施执行

> **目标**：调用另存为操作并安全地捕获结果。

### Gen1 → Gen2.1 CI/CD：`saveAsNativeArtifact` API

```
POST https://api.powerbi.com/v1.0/myorg/groups/{groupId}/dataflows/{gen1DataflowId}/saveAsNativeArtifact
```

这是一个 **预览版 API**。它会创建一个**新的 Gen2.1 CI/CD 项目副本**，同时保留原始 Gen1 数据流。

```bash
WS_ID="<workspaceId>"
GEN1_ID="<gen1DataflowId>"

# Write body to a temp file — az rest wraps inline --body in an envelope
# on some platforms, causing "saveAsRequest is a required parameter" errors.
cat > /tmp/save-as-body.json <<'EOF'
{
  "displayName": "MyDataflow_Gen2CICD",
  "description": "Saved as Gen2.1 copy from Gen1",
  "includeSchedule": true,
  "targetWorkspaceId": "<targetWorkspaceId>"
}
EOF

az rest --method post \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/groups/$WS_ID/dataflows/$GEN1_ID/saveAsNativeArtifact" \
  --headers "Content-Type=application/json" \
  --body @/tmp/save-as-body.json
```

> **注意 — 内联请求正文**：通过 `--body '{...}'` 内联传递 JSON 可能导致 `az rest` 将有效负载包装在额外的信封结构中，从而引发 `"saveAsRequest is a required parameter"` 错误。对此端点，请始终使用**基于文件的请求正文**（`--body @file.json`）。

> **注意 — Windows `az.cmd`**：在 Windows 上，从 `saveAsNativeArtifact` 调用中省略 `-o json`——通过 `az.cmd` 路由时，此标志会引发 `"A value that is not valid (json) was specified for the outputFormat parameter"` 错误。捕获不带 `-o json` 的输出，并在 PowerShell 中使用 `ConvertFrom-Json` 解析，或在 bash 中通过管道传递给 `jq`。

> **注意——非幂等（重试时会产生重复项目）**：`saveAsNativeArtifact` 每次调用都会创建一个**新项目**。如果批处理被中断后重新运行，目标工作区中将出现多个副本。为了确保重试安全：(1) 调用前检查具有预期名称的 Gen2 项目是否已存在，或者 (2) 在 `displayName` 中包含时间戳，并将每次运行视为不同的项目。

> **注意——所有者权限**：你必须是**数据流所有者**，或者在源工作区中拥有**参与者/管理员**权限，才能调用 `saveAsNativeArtifact`。如果你只是查看者，或者是不拥有该数据流的工作区成员，API 将返回 `DataflowUnauthorizedError`。请让数据流所有者或工作区管理员对这些数据流执行另存为操作。

**请求参数：**

| 参数 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `displayName` | string (max 200) | 否 | 新项目的名称。如果省略，则自动生成并添加 `_copy1` 后缀 |
| `description` | string (max 4000) | 否 | 说明。如果省略，则从源复制 |
| `includeSchedule` | boolean | 否 | 复制刷新计划，并将其置于**禁用**状态 |
| `targetWorkspaceId` | string (uuid) | 否 | 目标工作区。如果省略，则使用同一工作区 |

**响应**：`200 OK`，包含 `SaveAsNativeDataflowResponse`：
- `artifactMetadata` — 新 Gen2 CI/CD 项目的完整元数据（包括 `objectId`、`provisionState`）
- `errors[]` — 非致命警告代码（即使出现这些警告，另存为操作仍会成功）：
  - `FailedToCopySchedule` — 无法复制计划
  - `SetDataflowOriginFailed` — 未设置来源跟踪
  - `ConnectionsUpdateFailed` — 无法将连接字符串更新为 Fabric 格式

### Gen2 → Gen2 CI/CD：原地升级

> **尚不可用**——此 API 当前尚未在公共接口中提供。端点发布后，此 Skill 将会更新。请勿尝试调用不存在的端点。

## 另存为后验证清单

另存为后、清理任何 Gen1 内容之前，请执行以下检查：

- 确认 `artifactMetadata.provisionState` 达到 `Active`。
- 检查 `SaveAsNativeDataflowResponse` 中的 `errors[]`，并为每个警告创建后续任务。
- 确认新项目存在于目标工作区中，并具有预期的名称/说明。
- 验证依赖的编排项（管道、流、API 调用方）已更新为使用新的项目 ID。
- 仅在用户明确批准后触发刷新。

---

## 必须/建议/避免

### 必须执行

- **始终向 `az rest` 传递 `--resource`**——根据上面的 API 表使用正确的受众。受众错误 = 无提示的 401。
- **对 Power BI REST API 的 POST 调用始终包含 `--headers "Content-Type=application/json"`**。
- **为 `saveAsNativeArtifact` 使用基于文件的请求正文**——传递 `--body @file.json`，而不是内联 JSON。内联 `--body '{...}'` 可能导致 `az rest` 将有效负载包装在额外的信封中，从而产生 `"saveAsRequest is a required parameter"` 错误。
- **在 Windows 上调用 `saveAsNativeArtifact` 时省略 `-o json`**——改为在 PowerShell 中使用 `ConvertFrom-Json`，或通过管道传递给 `jq`。通过 `az.cmd` 路由时，`-o json` 标志会失败并出现 `"A value that is not valid (json)"` 错误。
- **另存为之前，确认你是数据流所有者或参与者**——对于仅为工作区成员或查看者的非所有者，`saveAsNativeArtifact` 会返回 `DataflowUnauthorizedError`。
- **重试前检查现有 Gen2 项目**——`saveAsNativeArtifact` 不是幂等操作；中断的批处理运行在重试时会创建重复副本。调用前确认目标名称不存在，或者为每次运行使用带有唯一时间戳的 `displayName`。
- **另存为之前进行扫描**——执行前始终运行就绪情况扫描。
- **没有用户明确同意时绝不刷新**——为安全起见，Gen2 CI/CD 项目计划创建时处于禁用状态。
- **检查 saveAsNativeArtifact 响应中的 `errors[]`**——另存为操作可能成功，但同时伴有非致命警告。
- **另存为后验证 `provisionState` 为 `Active`**——轮询项目元数据，直到其达到终止状态。
- **保留原始 Gen1 数据流**——`saveAsNativeArtifact` 会保留 Gen1 数据流。另存为后验证通过之前，请勿将其删除。

### 推荐

- **使用 Admin API 扫描整个租户** — 对于大型租户，这比逐个工作区扫描更高效。
- **使用 JSON 输出实现自动化** — Markdown 用于人工审查，JSON 用于脚本编写及 CI/CD 集成。
- **按拓扑顺序执行另存为** — 先保存上游数据流（包含链接实体），再保存下游使用方。
- **就绪性优先执行** — 执行另存为之前，不要跳过就绪性评估。
- **使用 `generation` 属性检测 Gen1** — Power BI REST API 会针对每个数据流返回 `generation: 1` 或 `generation: 2`。应优先使用这种单次 API 调用方式，而不是进行跨 API 比较。
- **将 `modelUrl` 检查作为辅助信号** — 如果数据流的 `modelUrl` 指向 `dfs.core.windows.net`，则该数据流是使用客户存储的 Gen1 数据流（BYOSA 阻塞项）。

### 避免

- **保存被阻塞（❌）的数据流** — 应先解决 BYOSA 存储和 DirectQuery 问题。
- **未经审查就批量执行另存为** — 保存多个数据流之前，务必审查就绪性快照。
- **对工作区/数据流 ID 进行硬编码** — 应通过 REST API 动态解析。
- **忽略非致命错误** — `FailedToCopySchedule`、`ConnectionsUpdateFailed` 等错误需要进行人工跟进。
- **调用 Gen2→Gen2 CI/CD 原位另存为 API** — 该 API 目前尚不存在。不要编造端点。
- **未经用户明确同意就删除 Gen1 项目** — 除非用户明确批准删除，否则绝不要删除 Gen1 数据流，即使另存为后的验证已确认数据完整性也不例外。
- **在 Windows 上对 `saveAsNativeArtifact` 使用 `-o json`** — 省略该标志；捕获原始输出并显式解析。
- **在未进行幂等性检查的情况下重新运行批量另存为脚本** — 始终验证目标项目是否已存在，以避免在工作区中创建重复副本。

---

## 示例

### 示例 1：完整的阶段 1 — 单个工作区的就绪性扫描

**提示词**：“扫描我的 Sales 工作区中的 Gen1 数据流，并向我展示就绪性快照”

**代理响应**：

```bash
# Step 1 — Resolve workspace ID
WS_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --query "value[?displayName=='Sales'].id" -o tsv)

# Step 2 — List all dataflows with generation property
ALL_DFS=$(az rest --method get \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/groups/$WS_ID/dataflows" -o json)

# Step 3 — Filter Gen1 dataflows by generation property
GEN1_DFS=$(echo "$ALL_DFS" | jq '[.value[] | select(.generation == 1) |
  {id: .objectId, name: .name, generation: .generation, modelUrl: .modelUrl}]')

echo "Gen1 dataflows found: $(echo $GEN1_DFS | jq length)"
echo "$GEN1_DFS" | jq '.'
```

### 示例 2：将 Gen1 数据流另存为 Gen2.1

**提示词**：“迁移或升级我的 Sales 工作区中的 SalesETL Gen1 数据流”

**代理响应**：

```bash
WS_ID="<workspaceId>"
GEN1_ID="<gen1DataflowId>"

# Write body to file (avoids az rest envelope wrapping)
cat > /tmp/save-as-body.json <<'EOF'
{"displayName": "SalesETL_Gen2CICD", "includeSchedule": true}
EOF

# Execute save-as
RESPONSE=$(az rest --method post \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/groups/$WS_ID/dataflows/$GEN1_ID/saveAsNativeArtifact" \
  --headers "Content-Type=application/json" \
  --body @/tmp/save-as-body.json)

# Check result
echo "$RESPONSE" | jq '{
  newId: .artifactMetadata.objectId,
  state: .artifactMetadata.provisionState,
  errors: .errors
}'
```

### 示例 3：租户范围的管理员扫描

**提示词**：“显示整个租户中的所有 Gen1 数据流”

**智能体响应**：

```bash
# Requires Fabric administrator role
ALL_DFS=$(az rest --method get \
  --resource "https://analysis.windows.net/powerbi/api" \
  --url "https://api.powerbi.com/v1.0/myorg/admin/dataflows" -o json)

# Gen1 dataflows have a modelUrl
echo "$ALL_DFS" | jq '[.value[] | select(.modelUrl != null and .modelUrl != "") |
  {id: .objectId, name: .name, workspace: .workspaceId, 
   owner: .configuredBy, storage: .modelUrl}]'
```