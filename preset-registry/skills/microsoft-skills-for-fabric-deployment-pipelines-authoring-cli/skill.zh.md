---
name: deployment-pipelines-authoring-cli
description: "Manages Fabric deployment pipelines for ALM promotion across dev, test, and prod stages, including stage creation, workspace assignment, selective forward or backward deploys, operation polling, stage role assignments, and the pipeline and workspace permissions each action requires. For Git sync use git-integration-operations-cli."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: deployment-pipelines-authoring-cli`（`az rest`：`--headers "x-ms-fabric-skill=deployment-pipelines-authoring-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数——但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. 要查找部署管道或阶段 ID：列出部署管道（然后列出阶段），并使用 JMESPath 按 `displayName` 进行筛选——绝不要猜测 ID。

# Fabric 部署管道编写 — CLI 技能

使用**部署管道**自动执行 Fabric 应用程序生命周期管理（ALM）：通过 Fabric 核心控制平面
REST API 在各个阶段之间（通常为开发 → 测试 → 生产）提升 Fabric
内容。此技能涵盖管道/阶段生命周期、工作区分配，以及阶段到阶段的部署
（长时间运行的操作）。

## 前置知识

请先阅读以下配套文档——此技能假定你已了解其中的模式，且不会重复介绍：

| 任务 | 参考 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § Finding Workspaces and Items in Fabric](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——通过列表 + JMESPath 按名称解析工作区/项目 ID |
| 身份验证与令牌获取 | [COMMON-CORE.md § Authentication & Token Acquisition](../../common/COMMON-CORE.md#authentication--token-acquisition) | 令牌受众必须为 `https://api.fabric.microsoft.com`；受众错误会导致 401 |
| 身份验证方案 | [COMMON-CLI.md § Authentication Recipes](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § Fabric Control-Plane API via az rest](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`** |
| 核心控制平面 REST API | [COMMON-CORE.md § Core Control-Plane REST APIs](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询、速率限制模式 |
| 长时间运行的操作（LRO） | [COMMON-CLI.md § Long-Running Operations (LRO) Pattern](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | **部署是一个 LRO**——轮询 `/v1/operations/{id}` 直到进入终止状态 |
| 环境 URL | [COMMON-CORE.md § Environment URLs](../../common/COMMON-CORE.md#environment-urls) | 主权云/政府云使用不同的主机 |
| 支持的项目类型 | [references/supported-item-types.md](references/supported-item-types.md) | 部署可以复制的项目类型列表（按类别列出，并带有预览标记），该列表会持续更新——请根据**官方 Microsoft 文档**（事实来源）进行核对；不要猜测 |
| 对比两个项目定义（节省令牌） | [references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py) | 用于解码两个 `getDefinition` payload、规范化自动重新绑定字段并仅输出**差异**的本地工具——将差异（而不是完整定义）提供给模型。`python references/scripts/diff_item_definitions.py source.json target.json`（退出码 `0`=相同，`1`=已更改） |

此 skill 补充了：**如何通过代理终端驱动 deployment-pipelines REST 接口**。

## 概念

- **部署管道**包含 **2–10 个有序阶段**（`order` 从 0 开始）。每个阶段最多可以有**一个已分配的工作区**，而一个工作区最多只能分配给一个阶段。
- **部署**会将受支持的项目内容从**源阶段**复制到**相邻的目标阶段**。正向部署（dev→test→prod）可以在任意相邻阶段之间进行。**反向**部署（例如 prod→test）目前**仅在目标阶段为空时**受支持（未分配工作区）——不能将内容反向部署到已有工作区的阶段上。
- **项目配对（自动绑定）**。在部署期间，Fabric 会记录源项目与其在目标阶段中的克隆之间的**连接**；后续部署会依据此配对确定要覆盖的目标项目，相关项目（例如报表及其语义模型）也会因此保持绑定。没有用于**设置**配对的 REST API——配对会自动维护——但你可以通过 `List stage items` 返回的 `sourceItemId` / `targetItemId` 字段查看当前配对。请参阅下面的*修复损坏的项目配对*工作流，这是唯一受支持的修复方式。
- 部署是**异步长时间运行操作（LRO）**：API 返回带有操作 ID 的 `202 Accepted`；你需要轮询操作完成情况。
- **部署规则**和**参数规则**（例如按阶段重新指向数据源）在 Fabric **门户 UI** 中配置——没有用于创建规则的 REST API。不要声称存在此类 API。
- 部署只会复制**受支持的项目类型**；不受支持的项目会被跳过（不会报错）。受支持的项目类型集合会随时间变化——请参阅 [references/supported-item-types.md](references/supported-item-types.md)。
- 没有“发生了哪些更改”/比较 REST API。`List stage items` 返回项目**标识 + 配对**（`itemId`、`itemDisplayName`、`itemType`、`sourceItemId`、`targetItemId`、`lastDeploymentTime`）——但**不包含更改状态**，而且 `lastDeploymentTime` 是上次**部署**时间，不是上次编辑时间，因此不能作为可靠的更改信号。若要仅部署已更改的项目，必须自行**比较两个阶段的差异**并构建 `items` 列表（请参阅下面的*仅部署已更改的项目*工作流）。门户的“比较”视图在服务器端实现，未通过 API 暴露。

## 必须/优先/避免

### 必须执行
- 在任何变更调用之前，通过 list + JMESPath 按名称解析管道、阶段和工作区的**ID**。绝不要伪造 GUID。
- 使用正确的基础 URL：`https://api.fabric.microsoft.com/v1/deploymentPipelines`，并获取面向 `https://api.fabric.microsoft.com` audience 的令牌。
- 将 **Deploy Stage Content** 视为 LRO：收到 `202` 时，捕获操作 ID，并轮询 `/v1/operations/{operationId}`，直到状态为 `Succeeded`/`Failed`，然后呈现结果。
- 当**目标阶段没有已分配的工作区**时，在部署请求正文中包含 `createdWorkspaceDetails`（名称，以及在需要时提供 `capacityId`），否则部署会失败。
- 在执行删除管道、取消分配工作区、覆盖 prod 的反向部署等破坏性操作之前，先向用户确认其意图。
- 在进行变更调用之前，确认调用者拥有**所需权限**（请参阅下面的*所需权限*）：每项管道操作都需要管道 **Admin** 权限，而分配/部署还需要相应的**工作区**角色。对于 `401`/`403`，应提供清晰且可执行的消息，而不是盲目重试。

### **建议**
- 当用户指定了特定项目时，通过 `items` 数组（`{ sourceItemId, itemType }`）进行选择性部署；省略 `items` 则部署**所有**受支持的项目。
- 每次部署都提供人类可读的 `note` — 但请注意它是**只写的**：API 接受该字段，但从不返回它（它只会显示在门户 UI 中）。如需以编程方式保留审计记录，还应在外部记录部署信息（CI/CD 日志或 Git 提交消息）。
- 部署前使用 `List Deployment Pipeline Stage Items` 预览将要移动的内容。
- 编写幂等脚本：创建 pipeline/stage/assignment 前，先检查其是否已经存在。

### **避免**
- 臆造“创建部署规则”或“参数规则”的 REST 调用 — 目前这些仅支持 UI 操作。
- 在**活动部署**期间分配 workspace（分配调用会失败），也不要将 workspace 分配给已经配对的 stage/workspace。
- 在主权云中硬编码 `api.fabric.microsoft.com` — 应从环境配置中解析主机。
- 在确认 Fabric 管理员已启用服务主体创建部署管道之前，不要使用服务主体。
- **不进行规范化就直接对原始 `getDefinition` 输出进行哈希，以检测更改。** 部署会在目标中**自动重新绑定**
  嵌入式引用（pipeline `notebookId`/`workspaceId`、report→model id、Direct Lake
  server/db），因此即使没有任何编辑，已配对目标的定义也会与源定义合法地不同 — 朴素哈希会报告**错误的“已更改”**。比较前应移除或规范化这些绑定字段。
- **不要通过将每个项目的完整定义转储到代理上下文中来进行差异比较。** 完整的两阶段内容差异比较可能需要数十次 `getDefinition` 调用并产生超过 100 KB 的内容 — 应在脚本中执行比较
  （[references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py)），只展示最终生成的更改列表；对于已更改的项目，只将输出的差异转发给模型，绝不要转发两份完整定义。
- 在**事先未警告用户**解除 workspace 分配会**永久删除该 stage 的部署历史以及其已配置的部署/参数规则**的情况下，不要通过解除 workspace 分配来修复损坏的配对 — 解除分配前始终询问该 stage 是否存在规则（参见*修复损坏的项目配对*）。

## REST API 参考

基础地址：`https://api.fabric.microsoft.com/v1`。委派范围按**操作划分** — 应遵循最小权限原则为服务主体配置权限：

| 操作 | 所需委派范围 |
|---|---|
| 列出 / 获取（pipelines、stages、stage items、operations） | `Pipeline.Read.All` **或** `Pipeline.ReadWrite.All` |
| 创建 / 更新 / 删除 pipeline，更新 stage | `Pipeline.ReadWrite.All` |
| 分配 / 解除分配 workspace | `Pipeline.ReadWrite.All` **和** `Workspace.ReadWrite.All` |
| **部署 stage 内容** | **`Pipeline.Deploy`** |

部署使用独立的 `Pipeline.Deploy` 范围 — 仅配置了 `Pipeline.ReadWrite.All` 范围的应用在调用 `POST .../deploy` 时会收到 **403**。

| 操作 | 方法 + 路径 |
|---|---|
| 列出 pipelines | `GET /deploymentPipelines` |
| 创建 pipeline | `POST /deploymentPipelines` |
| 获取 / 更新 / 删除 pipeline | `GET|PATCH|DELETE /deploymentPipelines/{id}` |
| 列出 / 获取 stages | `GET /deploymentPipelines/{id}/stages[/{stageId}]` |
| 更新 stage | `PATCH /deploymentPipelines/{id}/stages/{stageId}` |
| 列出 stage 项目 | `GET /deploymentPipelines/{id}/stages/{stageId}/items` |
| 将 workspace 分配给 stage | `POST /deploymentPipelines/{id}/stages/{stageId}/assignWorkspace` |
| 从 stage 解除 workspace 分配 | `POST /deploymentPipelines/{id}/stages/{stageId}/unassignWorkspace` |
| **部署 stage 内容（LRO）** | `POST /deploymentPipelines/{id}/deploy` |
| 列出操作（最近 ≤20 条） | `GET /deploymentPipelines/{id}/operations` |
| 获取操作（包含执行计划） | `GET /deploymentPipelines/{id}/operations/{operationId}` |
| 角色分配 | `GET|POST|DELETE /deploymentPipelines/{id}/roleAssignments[/{principalId}]` |

### 请求体形状（指导）

- **创建**：`{ "displayName", "description"?, "stages": [ { "displayName", "description"?, "isPublic" } ] }` — 2–10 个阶段。
- **分配工作区**：`{ "workspaceId" }`。
- **部署**：`{ "sourceStageId", "targetStageId", "items"?: [ { "sourceItemId", "itemType" } ], "note"?, "options"?: { "allowCrossRegionDeployment": false }, "createdWorkspaceDetails"?: { "name", "capacityId"? } }`。

## 所需权限

部署管道操作受**两个**相互独立的权限系统控制：你在**管道**上的角色（管道自身的 `roleAssignments`）以及你在每个相关**工作区**上的角色。通常你需要**同时具备两者**。部署管道需要 Fabric 容量/订阅，且管道创建者会成为管道的 **Admin**。

| 操作 | 管道角色 | 工作区角色 |
|---|---|---|
| 创建管道 | —（创建时成为 **Admin**） | Fabric 工作区的 **Admin**（功能访问前提） |
| 获取/列出管道、阶段、项、操作 | **Admin**（共享访问） | — |
| 更新/删除管道；管理 `roleAssignments` | **Admin** | — |
| **将工作区分配给阶段/取消分配** | **Admin** | 被分配/取消分配的工作区的 **Admin** |
| **部署**阶段内容 | **Admin** | 源阶段和目标阶段工作区均至少需要 **Contributor/Member**（如果目标项需要更高角色，则需要更高角色） |
| 部署到**空的**目标阶段（创建工作区） | **Admin** | 将新工作区置于某个容量上的容量分配权限；执行部署的用户会成为新创建工作区的**唯一 Admin**以及克隆语义模型的所有者 |

注意：
- 共享管道会授予管道 **Admin** 角色——对于这些操作，不存在更低级别的“仅查看者”管道写入角色。
- **服务主体**只有在 Fabric 管理员启用了 *service principals can create deployment pipelines* 的情况下才能调用这些 API（并且该 SP 也必须持有上述相同的管道和工作区角色）。
- 遇到 `403` 时，应在消息中区分是*缺少管道角色*还是*缺少工作区角色*，以便用户知道应申请哪种访问权限。



**创建管道** → POST 显示名称和有序阶段；记录返回的阶段 ID（部署时将在这些阶段之间进行）。

**将工作区分配给阶段** → 按名称解析阶段 ID 和工作区 ID，验证两者均未被分配，然后 POST `assignWorkspace`。要求对管道和工作区都具有管理员权限。

**部署内容** → 解析源/目标阶段 ID，可选择预览阶段项，POST `deploy`（全部项或选定的 `items` 列表）并附带 `note`，然后轮询返回的操作直至完成，并报告哪些项已移动。

**仅部署已更改的项** → 没有 diff/compare API，因此需要自行计算增量。`List stage items` 仅提供标识和配对信息（没有时间戳，也没有变更状态），因此变更检测意味着比较**项定义**：
1. 解析源阶段和目标**阶段** ID，以及分别分配给它们的工作区。
2. 列出**两个**阶段中的项（`GET .../stages/{stageId}/items`）——每个源项行都携带 `sourceItemId`（作为 `itemId`）及其配对的 `targetItemId`（缺失表示**新项/未配对**）。同时列出目标阶段，以查找**已删除**的项（存在于目标中，但没有任何源项与之配对）。通过 `targetItemId` 配对；仅当不存在管道配对时，才回退到 `(itemType, displayName)`（按名称匹配无法检测重命名）。
3. **过滤掉系统管理的子项**——每个 Lakehouse/Warehouse 都会自动创建一个 `SQLEndpoint`，不应单独对其进行 diff 或部署；它会跟随其父项。
4. 对每个已配对的项进行分类：
   - **新项**（没有 `targetItemId`）→ 部署。
   - **已更改** → 在两个阶段上分别通过 `POST .../items/{id}/getDefinition` 检测，然后执行 diff。在两个响应上运行 [references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py)：该脚本会解码每个部分，**为你规范化**自动重新绑定的字段（管道 `notebookId`/`workspaceId`、报表模型 ID、Direct Lake 服务器/数据库），并仅打印存在差异的部分（退出 `1` = 已更改，`0` = 相同）——这样你不必手动编写哈希逻辑，也不会在未编辑的项上产生误报。请注意，`getDefinition` 合约因类型而异：`Notebook`/`SemanticModel`/`Report` 是 **LRO**（`202` → 轮询 → `GET .../result`）；`DataPipeline` 则同步返回 **`200`**。
   - 没有可用 `getDefinition` diff 的类型：`Warehouse` **没有**项定义 API，而 `Lakehouse` / `Environment` **确实**提供 `getDefinition`，但其定义仅捕获结构/元数据（不包括表数据或大多数内容编辑）——因此对于这三者，按**存在性**进行 diff，并且仅在新建或用户指出内容已更改时将其视为已更改。
   - 无法证明相等时，将项视为**已更改**（安全默认值）。
5. 在**脚本中**执行比较（将独立的 `getDefinition` 调用并行化；它们是延迟的主要来源），并仅输出计算出的变更列表。为了让模型推理项中**发生了什么变化**，仅转发生成的 diff（`diff_item_definitions.py` 输出），不要转发两个完整定义——规范化后的 diff 通常只有几行，而原始负载可能超过 100 KB。
6. 过滤为**受支持的项类型**（请参阅 references），向用户显示变更列表，获得确认，然后使用 `{ sourceItemId, itemType }` 数组和 `note` POST 一个**选择性** `deploy`，并轮询直至完成。

> 删除操作**不会通过选择性 `items` 部署传播**——从源阶段移除的项不会因选择性部署而从目标阶段移除。要传播删除操作，请使用**完整**部署（省略 `items`），
> 或手动删除目标项，并在提升之前向用户警告这一点。

**修复损坏的项配对** → 配对（Fabric 维护的源↔目标连接，也称为 autobinding）
**无法通过任何 REST API 设置**。当跨阶段本应配对的两个项未配对时——这可能表现为部署复制项而不是覆盖项、自动绑定/依赖项失败，或用户报告此问题——**唯一受支持的修复方法是取消分配受影响阶段的工作区，然后重新分配该工作区**，
这会强制 Fabric 在下一次部署时重新建立配对。这一操作具有破坏性：
1. **首先警告用户。** 取消分配工作区会**永久删除该阶段的部署历史记录以及所有已配置的部署/参数规则**——重新分配后无法恢复这些内容。
2. **询问该阶段是否存在规则。** 由于规则仅能通过 UI 操作（没有 REST API 可用于读取或重新创建规则），请在取消分配之前明确询问用户该阶段是否配置了部署/参数规则。
   如果存在，请让用户记录这些规则（或之后在门户中重新创建），并获得其明确确认后再继续。
3. 仅在获得确认后，执行 `POST .../stages/{stageId}/unassignWorkspace`，然后使用相同的 `workspaceId` 执行
   `POST .../stages/{stageId}/assignWorkspace`，并重新运行部署，以重新建立配对。

**跟踪 / 审计** → 使用 `List operations` 查看最近的历史记录；使用 `Get operation` 检查特定部署的执行计划和逐项状态。

### 部署操作注意事项和常见错误

- **每个管道一次只能执行一个部署。** 管道一次只运行一个操作；在某个操作正在进行时启动另一个操作会失败，并返回 **`WorkspaceMigrationOperationInProgress` (HTTP 400)**。在开始下一阶段的提升之前，始终轮询当前操作，直到其进入终止状态（这也是活动部署期间 *assign*
  工作区调用失败的原因）。
- **分配工作区后的首次部署可能会失败，并返回 `Alm_InvalidRequest_WorkloadUnavailable`。** 新分配的工作区需要约 **60–120 秒**，以便工作负载服务（Lakehouse、Notebook 等）完成初始化。
  可通过在首次部署前等待来缓解此问题，或者先部署 Power BI 项（`SemanticModel`、`Report`），短暂延迟后再部署 Fabric 原生项（`Lakehouse`、`Notebook`）；遇到此错误时重试。工作负载预热后，后续部署通常可靠。
- **操作 ID 会在 `x-ms-operation-id` 响应标头中返回**（与 `Location` 一起），而不是出现在
  `202` 响应正文中。`az rest` 无法干净地显示响应标头——为了在自动化中可靠地捕获标头，请使用 `curl -i`（或 Python `requests`）发起部署并解析该标头，然后使用 `az rest` 轮询
  `/v1/operations/{operationId}`。
- **部署复制的是定义，而不是数据。** 只有项的元数据/定义会被提升；不会复制表数据、查询结果和缓存。部署后请在目标阶段触发刷新/加载。
- **每个部署请求最多包含 300 个项。** 选择性部署（或完整部署）最多可部署 **300 个项**；对于规模更大的提升，请拆分为多次部署调用。

## 示例

### 创建三阶段管道
Deployment-pipeline `displayName` 在**整个租户范围内唯一**——如果名称已被使用，创建操作将失败，并返回 `Alm_InvalidRequest_DuplicateAlmPipelineName`（HTTP 400，"pipeline name ... is already in use"）。要使创建操作可以重复运行，请先删除具有该名称的任何现有管道，然后再创建。将 JSON 正文写入文件，并通过 `--body @file.json` 传递——在 Windows/PowerShell 上，内联的多行 `--body '{...}'` 会被篡改为空正文（`az` 是 `az.cmd`），API 会因此拒绝该请求，并返回 `InvalidInput: Unexpected end when reading JSON`。
```bash
# Idempotent: delete an existing "Sales Analytics ALM" if present, then create.
EXISTING=$(az rest --method GET --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines" \
  --query "value[?displayName=='Sales Analytics ALM'].id | [0]" --output tsv)
if [ -n "$EXISTING" ]; then
  az rest --method DELETE --resource https://api.fabric.microsoft.com \
    --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$EXISTING"
fi

cat > /tmp/create-pipeline.json << 'EOF'
{
  "displayName": "Sales Analytics ALM",
  "description": "Dev/Test/Prod promotion for Sales Analytics",
  "stages": [
    { "displayName": "Development", "isPublic": false },
    { "displayName": "Test",        "isPublic": false },
    { "displayName": "Production",  "isPublic": true }
  ]
}
EOF
az rest --method POST \
  --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines" \
  --headers "Content-Type=application/json" \
  --body @/tmp/create-pipeline.json
```

### 将工作区分配给 Development 阶段
```bash
# $PIPELINE_ID and $DEV_STAGE_ID resolved via list + JMESPath; $WS_ID resolved from workspace name.
az rest --method POST \
  --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$PIPELINE_ID/stages/$DEV_STAGE_ID/assignWorkspace" \
  --headers "Content-Type=application/json" \
  --body "{ \"workspaceId\": \"$WS_ID\" }"
```

### 部署所有项目 dev → test 并等待 LRO
```bash
# Kick off the deployment (returns 202 + an operation id header).
az rest --method POST \
  --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$PIPELINE_ID/deploy" \
  --headers "Content-Type=application/json" \
  --body "{ \"sourceStageId\": \"$DEV_STAGE_ID\", \"targetStageId\": \"$TEST_STAGE_ID\", \"note\": \"Promote validated dev build\" }" \
  --verbose
# Then poll /v1/operations/{operationId} until state is Succeeded or Failed
# (see COMMON-CLI § Long-Running Operations pattern).
```

### 仅部署选定的项目
```bash
az rest --method POST \
  --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$PIPELINE_ID/deploy" \
  --headers "Content-Type=application/json" \
  --body '{
    "sourceStageId": "'"$TEST_STAGE_ID"'",
    "targetStageId": "'"$PROD_STAGE_ID"'",
    "items": [
      { "sourceItemId": "'"$MODEL_ID"'", "itemType": "SemanticModel" },
      { "sourceItemId": "'"$REPORT_ID"'", "itemType": "Report" }
    ],
    "note": "Promote reviewed model + report to production"
  }'
```

### 仅部署发生更改的项目（先计算差异）
```bash
# 1. List paired items for BOTH stages. Each source row carries itemId (= sourceItemId)
#    and its paired targetItemId (absent = new/unpaired). There is NO timestamp or
#    change-status field, so "changed" must be detected from item definitions.
az rest --method GET --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$PIPELINE_ID/stages/$SOURCE_STAGE_ID/items" \
  > source-items.json

# 2. NEW items = unpaired (no targetItemId). Exclude system-managed SQLEndpoint children.
NEW=$(jq '[.value[]
  | select(.itemType != "SQLEndpoint")
  | select(has("targetItemId") | not)
  | { sourceItemId: .itemId, itemType: .itemType }]' source-items.json)

# 3. CHANGED items (paired): fetch getDefinition from BOTH stages, then diff with
#    references/scripts/diff_item_definitions.py. It decodes each part, NORMALIZES the
#    auto-rebound fields (notebookId/workspaceId in pipelines, model id in reports,
#    server/db in Direct Lake models) and prints ONLY the differing parts. Notebook/
#    SemanticModel/Report are LRO (202 -> poll -> /result); DataPipeline returns 200 sync.
#    Parallelize the independent getDefinition calls. Per paired definition-backed item:
#      getDefinition SOURCE_WS id            > src.json
#      getDefinition TARGET_WS targetItemId  > tgt.json
#      python references/scripts/diff_item_definitions.py src.json tgt.json > diff.json
#      # exit 1 = changed -> add { sourceItemId, itemType } to $ITEMS; exit 0 = unchanged.
#      # Forward diff.json (NOT src.json/tgt.json) to the model to explain the change.
#    Merge NEW + CHANGED into $ITEMS. When equality can't be proven, include the item.

# 4. Selective deploy of just the changed set.
az rest --method POST --resource https://api.fabric.microsoft.com \
  --url "https://api.fabric.microsoft.com/v1/deploymentPipelines/$PIPELINE_ID/deploy" \
  --headers "Content-Type: application/json" \
  --body "$(jq -n --arg s "$SOURCE_STAGE_ID" --arg t "$TARGET_STAGE_ID" --argjson items "$ITEMS" \
    '{ sourceStageId: $s, targetStageId: $t, items: $items, note: "Deploy only changed items" }')"
# Then poll /v1/operations/{operationId} until terminal.
# NOTE: a selective deploy does NOT propagate deletions — use a full deploy (omit items) for those.
```

### 提示/响应

**用户：**“将我的 Sales 开发工作区提升到 Test 阶段，并在完成后告诉我。”

**助手（行为）：**
1. 列出部署管道 → 筛选出其 Development 阶段持有 Sales 开发工作区的管道；获取 `sourceStageId`（Development）和 `targetStageId`（Test）。
2. 确认 Test 阶段已分配工作区（或要求提供名称和容量以创建工作区）。
3. 使用 `note` POST `deploy`，收到 `202`，提取操作 ID。
4. 轮询 `/v1/operations/{operationId}` 直到操作结束，然后报告成功以及已部署项目列表（或失败原因）。