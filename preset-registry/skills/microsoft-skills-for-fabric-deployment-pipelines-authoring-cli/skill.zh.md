---
name: deployment-pipelines-authoring-cli
description: >
  Automate Microsoft Fabric deployment pipelines (ALM promotion across dev/test/prod stages) via the
  Fabric core REST API from agentic CLI environments. Use when the user wants to: (1) create or update a
  deployment pipeline and its stages, (2) assign or unassign a workspace to a stage, (3) deploy content
  from one stage to the next (forward or backward) including selective item deploys, (4) track a deployment
  as a long-running operation, (5) manage deployment pipeline role assignments. Triggers:
  "create deployment pipeline", "deploy to test stage", "promote workspace to production",
  "assign workspace to deployment pipeline stage", "deploy stage content", "check deployment status",
  "list deployment pipeline operations", "Fabric ALM promote dev to prod",
  "what permissions/roles are required to assign a workspace or deploy stage content".
---
> **遥测 — 强制要求。** 每个对 `api.fabric.microsoft.com` 的调用都必须携带
> `x-ms-fabric-skill: deployment-pipelines-authoring-cli`（`az rest`：`--headers "x-ms-fabric-skill=deployment-pipelines-authoring-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍必须添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 进行筛选
> 3. 要查找部署管道或阶段 ID：列出部署管道（然后列出阶段），并使用 JMESPath 按 `displayName` 进行筛选——绝不要猜测 ID。

# Fabric 部署管道创作 — CLI 技能

使用**部署管道**自动执行 Fabric 应用程序生命周期管理（ALM）：通过 Fabric 核心控制平面
REST API，在各阶段之间（通常为开发 → 测试 → 生产）提升 Fabric 内容。此技能涵盖管道/阶段生命周期、工作区分配以及
阶段间部署（长时间运行的操作）。

## 先决知识

请先阅读以下配套文档——此技能假定你已了解其中的模式，且**不会**重复说明：

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求**——通过列表查询 + JMESPath 按名称解析工作区/项 ID |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 令牌受众必须为 `https://api.fabric.microsoft.com`；受众错误 = 401 |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`** |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 分页、LRO 轮询和速率限制模式 |
| 长时间运行的操作（LRO） | [COMMON-CLI.md § 长时间运行的操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) | **部署是一项 LRO**——轮询 `/v1/operations/{id}`，直到操作进入终止状态 |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | 主权云/政府云使用不同的主机 |
| 支持的项类型 | [references/supported-item-types.md](references/supported-item-types.md) | 部署可复制的项类型动态列表（按类别划分并标注预览状态）——根据**微软官方文档**（事实来源）进行核对；不要猜测 |
| 比较两个项定义的差异（节省令牌） | [references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py) | 此本地工具会解码两个 `getDefinition` 有效负载，规范化自动重新绑定的字段，并且**仅输出差异**——将差异（而不是完整定义）提供给模型。`python references/scripts/diff_item_definitions.py source.json target.json`（退出码 `0`=相同，`1`=已更改） |

此技能新增：**如何从智能体终端调用 deployment-pipelines REST 接口**。

## 概念

- 一个**部署管道**包含 **2–10 个有序阶段**（`order` 从 0 开始）。每个阶段最多只能分配**一个工作区**，且一个工作区最多只能分配给一个阶段。
- **部署**会将受支持的项目内容从**源阶段**复制到**相邻的目标阶段**。
  正向部署（dev→test→prod）适用于任意相邻阶段。**反向**部署（例如 prod→test）目前**仅在目标阶段为空**（未分配工作区）时受支持——不能在已有工作区的阶段上执行反向部署。
- **项目配对（自动绑定）。** 在部署过程中，Fabric 会记录**源项目与其在目标阶段中的克隆项目之间的连接**；后续部署通过此配对确定要覆盖的目标项目，并确保相关项目（例如报表及其语义模型）保持绑定。**没有用于_设置_配对的 REST API**——配对会自动维护——但你可以通过 `List stage items` 返回的 `sourceItemId` / `targetItemId` 字段**查看**当前配对。有关唯一受支持的修复方法，请参阅下方的*修复损坏的项目配对*工作流。
- 部署是一项**异步长时间运行操作（LRO）**：API 返回包含操作 ID 的 `202 Accepted`；你需要轮询直至操作完成。
- **部署规则**和**参数规则**（例如为每个阶段重新指向数据源）在 Fabric **门户 UI** 中配置——**没有用于创建规则的 REST API**。不要声称存在此类 API。
- 部署只会复制**受支持的项目类型**；不受支持的项目会被跳过（不会报错）。受支持的类型集合会随时间变化——请参阅 [references/supported-item-types.md](references/supported-item-types.md)。
- **没有“发生了哪些变化”/比较 REST API**。`List stage items` 返回项目的**标识 + 配对信息**（`itemId`、`itemDisplayName`、`itemType`、`sourceItemId`、`targetItemId`、`lastDeploymentTime`），但**不返回变更状态**；此外，`lastDeploymentTime` 表示上次**部署**时间，而**不是**上次编辑时间，因此不能作为可靠的变更信号。若要仅部署发生变更的项目，你必须**自行比较两个阶段**并构建 `items` 列表（请参阅下方的*仅部署发生变更的项目*工作流）。门户中的“Compare”视图在服务器端实现，未通过 API 公开。

## 必须/优先/避免

### 必须执行
- 在进行任何修改操作之前，通过列表查询 + JMESPath 按名称解析管道、阶段和工作区的 **ID**。绝不要编造 GUID。
- 使用正确的基础 URL：`https://api.fabric.microsoft.com/v1/deploymentPipelines`，并获取受众为 `https://api.fabric.microsoft.com` 的令牌。
- 将 **Deploy Stage Content** 视为 LRO：收到 `202` 后，获取操作 ID，并轮询 `/v1/operations/{operationId}`，直到状态为 `Succeeded`/`Failed`，然后输出结果。
- 当**目标阶段未分配工作区**时，在部署请求体中包含 `createdWorkspaceDetails`（名称，以及需要时的 `capacityId`），否则部署会失败。
- 在执行破坏性操作（删除管道、取消分配工作区、在 prod 上进行反向部署）之前，向用户确认其意图。
- 在进行修改操作之前，验证调用方是否具有**所需权限**（请参阅下方的*所需权限*）：每项管道操作均需具备管道 **Admin** 权限，分配/部署还需具备相应的**工作区**角色。遇到 `401`/`403` 时，应提供清晰且可操作的消息，而不是盲目重试。

### 推荐
- 当用户指定了特定项时，通过 `items` 数组（`{ sourceItemId, itemType }`）进行选择性部署；省略 `items` 则部署**所有**受支持的项。
- 每次部署都提供易于理解的 `note`——但要知道它是**只写的**：API 接受该字段，但从不将其返回（它仅显示在门户 UI 中）。如需以编程方式保留审计记录，还应在外部记录部署操作（CI/CD 日志或 Git 提交消息）。
- 部署前使用 `List Deployment Pipeline Stage Items` 预览将要移动的内容。
- 编写幂等脚本：创建管道、阶段或分配之前，先检查它是否已存在。

### 避免
- 虚构“创建部署规则”或“参数规则”的 REST 调用——这些操作目前只能通过 UI 完成。
- 在**正在进行部署**时分配工作区（分配调用会失败），或将工作区分配给已经配对的阶段/工作区。
- 在主权云中硬编码 `api.fabric.microsoft.com`——应从环境配置中解析主机。
- 在未先确认 Fabric 管理员已允许服务主体创建部署管道的情况下使用服务主体。
- **在不进行规范化的情况下，对原始 `getDefinition` 输出进行哈希处理以检测更改。**部署会在目标中**自动重新绑定**嵌入的引用（管道的 `notebookId`/`workspaceId`、报表→模型 ID、Direct Lake 服务器/数据库），因此，即使未进行任何编辑，配对目标的定义也可能合理地不同于源定义——简单的哈希处理会错误地报告**“已更改”**。比较前应移除这些绑定字段或对其进行规范化。
- **通过将每个项的定义全部转储到代理的上下文中来进行差异比较。**完整的两阶段内容差异比较可能需要调用数十次 `getDefinition`，并产生超过 100 KB 的内容——应在脚本中执行比较（[references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py)），并且仅呈现最终的更改列表；对于已更改的项，**仅将生成的差异**转发给模型，绝不要转发两个完整定义。
- 在未先警告用户的情况下，通过取消分配工作区来修复损坏的配对，因为取消分配会**永久删除该阶段的部署历史记录以及已配置的部署/参数规则**——取消分配前，始终询问该阶段是否存在规则（参见*修复损坏的项配对*）。

## REST API 参考

基址：`https://api.fabric.microsoft.com/v1`。委派范围**因操作而异**——按照最小权限原则配置服务主体：

| 操作 | 所需的委派范围 |
|---|---|
| 列出/获取（管道、阶段、阶段项、操作） | `Pipeline.Read.All` **或** `Pipeline.ReadWrite.All` |
| 创建/更新/删除管道，更新阶段 | `Pipeline.ReadWrite.All` |
| 分配/取消分配工作区 | `Pipeline.ReadWrite.All` **和** `Workspace.ReadWrite.All` |
| **部署阶段内容** | **`Pipeline.Deploy`** |

部署使用其独立的 `Pipeline.Deploy` 范围——仅具有 `Pipeline.ReadWrite.All` 范围的应用在调用 `POST .../deploy` 时会收到 **403**。

| 操作 | 方法 + 路径 |
|---|---|
| 列出管道 | `GET /deploymentPipelines` |
| 创建管道 | `POST /deploymentPipelines` |
| 获取/更新/删除管道 | `GET|PATCH|DELETE /deploymentPipelines/{id}` |
| 列出/获取阶段 | `GET /deploymentPipelines/{id}/stages[/{stageId}]` |
| 更新阶段 | `PATCH /deploymentPipelines/{id}/stages/{stageId}` |
| 列出阶段项 | `GET /deploymentPipelines/{id}/stages/{stageId}/items` |
| 将工作区分配给阶段 | `POST /deploymentPipelines/{id}/stages/{stageId}/assignWorkspace` |
| 取消分配阶段的工作区 | `POST /deploymentPipelines/{id}/stages/{stageId}/unassignWorkspace` |
| **部署阶段内容（LRO）** | `POST /deploymentPipelines/{id}/deploy` |
| 列出操作（最近不超过 20 个） | `GET /deploymentPipelines/{id}/operations` |
| 获取操作（包括执行计划） | `GET /deploymentPipelines/{id}/operations/{operationId}` |
| 角色分配 | `GET|POST|DELETE /deploymentPipelines/{id}/roleAssignments[/{principalId}]` |

### 请求正文结构（指导）

- **创建**：`{ "displayName", "description"?, "stages": [ { "displayName", "description"?, "isPublic" } ] }` — 2–10 个阶段。
- **分配工作区**：`{ "workspaceId" }`。
- **部署**：`{ "sourceStageId", "targetStageId", "items"?: [ { "sourceItemId", "itemType" } ], "note"?, "options"?: { "allowCrossRegionDeployment": false }, "createdWorkspaceDetails"?: { "name", "capacityId"? } }`。

## 所需权限

部署管道操作由**两套**相互独立的权限系统管理：你在**管道**上的角色（管道自身的 `roleAssignments`），以及你在所涉及的每个**工作区**上的角色。通常需要**同时具备两者**。部署管道需要 Fabric 容量/订阅，管道创建者将成为管道的 **Admin**。

| 操作 | 管道角色 | 工作区角色 |
|---|---|---|
| 创建管道 | —（创建后成为 **Admin**） | Fabric 工作区的 **Admin**（功能访问的先决条件） |
| 获取/列出管道、阶段、项目、操作 | **Admin**（共享访问权限） | — |
| 更新/删除管道；管理 `roleAssignments` | **Admin** | — |
| 将工作区**分配到阶段/从阶段取消分配** | **Admin** | 被分配或取消分配的工作区的 **Admin** |
| **部署**阶段内容 | **Admin** | 在源阶段和目标阶段工作区上均至少为 **Contributor/Member**（如果目标项目需要，则须具备更高角色） |
| 部署到**空的**目标阶段（创建工作区） | **Admin** | 将新工作区置于容量中所需的容量分配权限；执行部署的用户将成为新创建工作区的**唯一 Admin**，并成为克隆语义模型的所有者 |

注意：
- 共享管道会授予管道 **Admin** 角色——对于这些操作，不存在权限更低的“仅查看”管道写入角色。
- 只有当 Fabric 管理员启用了*服务主体可以创建部署管道*时，**服务主体**才能调用这些 API（且该服务主体须具备上述相同的管道和工作区角色）。
- 遇到 `403` 时，应在消息中区分是*缺少管道角色*还是*缺少工作区角色*，以便用户知道需要申请哪种访问权限。



**创建管道** → POST 显示名称和有序阶段；获取返回的阶段 ID（部署操作是在这些阶段 ID 之间执行的）。

**将工作区分配到阶段** → 按名称解析阶段 ID 和工作区 ID，确认两者均未被分配，然后 POST `assignWorkspace`。需要同时拥有管道和工作区的管理员权限。

**部署内容** → 解析源阶段和目标阶段 ID，可选择预览阶段项目，POST `deploy`（所有项目或选定的 `items` 列表）并附上 `note`，然后轮询返回的操作直至完成，并报告已移动的项目。

**仅部署已更改的项目** → 不存在 diff/compare API，因此需要自行计算差异。`List stage items` 仅提供标识和配对信息（不含时间戳和更改状态），因此更改检测需要比较**项目定义**：
1. 解析源和目标**阶段** ID，以及分别分配给它们的工作区。
2. 列出**两个**阶段中的项目（`GET .../stages/{stageId}/items`）——每个源项目行都包含 `sourceItemId`（以 `itemId` 的形式）及其配对的 `targetItemId`（缺失 = **新增/未配对**）。还要列出目标阶段，以查找**已删除**的项目（存在于目标中，但没有任何源项目与之配对）。通过 `targetItemId` 配对；仅当不存在管道配对关系时，才回退到 `(itemType, displayName)`（名称匹配无法检测重命名）。
3. **过滤掉由系统管理的子项目**——每个 Lakehouse/Warehouse 都会自动创建一个 `SQLEndpoint`，不应对其单独进行差异比较或部署；它会跟随其父项目。
4. 对每个已配对项目进行分类：
   - **新增**（无 `targetItemId`）→ 部署。
   - **已更改** → 分别在**两个**阶段上调用 `POST .../items/{id}/getDefinition`，然后比较差异。对两个响应运行 [references/scripts/diff_item_definitions.py](references/scripts/diff_item_definitions.py)：它会解码每个部分，自动**规范化**自动重新绑定的字段（管道 `notebookId`/`workspaceId`、报表模型 ID、Direct Lake 服务器/数据库），并且只输出存在差异的部分（退出码 `1` = 已更改，`0` = 相同）——因此无需自行实现哈希，也不会将未经编辑的项目误判为已更改。请注意，`getDefinition` 的约定因类型而异：
     `Notebook`/`SemanticModel`/`Report` 属于 **LRO**（`202` → 轮询 → `GET .../result`）；
     `DataPipeline` 会同步返回 **`200`**。
   - **没有可用 `getDefinition` 差异比较功能**的类型：`Warehouse` **没有**项目定义 API，而 `Lakehouse` / `Environment` 虽然*确实*提供 `getDefinition`，但其定义仅包含结构/元数据（不包含表数据或大多数内容编辑）——因此对于这三种类型，只根据**是否存在**进行差异比较，并且仅在项目为新增或用户指出内容已更改时，才将其视为已更改。
   - 无法证明两者相同时，将项目视为**已更改**（安全默认值）。
5. 在**脚本中**执行比较（并行处理相互独立的 `getDefinition` 调用；它们占据了绝大部分延迟），并且仅呈现计算得出的更改列表。若要让模型判断项目中*具体更改了什么*，应仅转发**输出的差异**（`diff_item_definitions.py` 的输出），而不是两个完整定义——规范化后的差异通常只有几行，而原始有效载荷会超过 100 KB。
6. 筛选出**受支持的项目类型**（参见参考资料），向用户显示更改列表并请求确认，然后使用 `{ sourceItemId, itemType }` 数组和 `note` POST 一次**选择性** `deploy`，并轮询直至完成。

> 删除操作**不会**通过选择性的 `items` 部署传播——从源阶段移除的项不会因选择性部署而
> 从目标阶段移除。请使用**完整**部署（省略 `items`）来传播删除操作，
> 或手动删除目标项，并在升级前向用户说明这一点。

**修复损坏的项配对** → 配对（Fabric 维护的源↔目标连接，也称为自动绑定）
**无法通过任何 REST API 进行设置**。当跨阶段本应配对的两个项并未配对时——具体表现可能是
部署时创建了重复项而非覆盖原有项、自动绑定/依赖项失败，或者用户报告了此问题——
**唯一受支持的修复方法是取消分配受影响阶段的工作区，然后重新分配该工作区**，
这会强制 Fabric 在下次部署时重建配对。此操作具有破坏性：
1. **首先警告用户。** 取消分配工作区会**永久删除该阶段的部署历史记录以及
   所有已配置的部署规则/参数规则**——重新分配工作区也无法恢复这些内容。
2. **询问该阶段是否存在规则。** 由于规则只能通过 UI 管理（没有 REST API 可以读取或重新创建规则），
   因此在取消分配之前，应明确询问用户该阶段是否配置了部署规则/参数规则。
   如果已配置，请让用户记录这些规则（或之后在门户中重新创建），并获得
   用户继续操作的明确确认。
3. 仅在获得确认后，调用 `POST .../stages/{stageId}/unassignWorkspace`，然后使用相同的
   `workspaceId` 调用 `POST .../stages/{stageId}/assignWorkspace`，并重新运行部署，以便
   重新建立配对。

**跟踪/审计** → 使用 `List operations` 查看近期历史记录；使用 `Get operation` 检查特定部署的执行计划和
各项状态。

### 部署操作注意事项与常见错误

- **每个管道一次只能执行一个部署。** 一个管道同一时间只能运行一项操作；如果在一项操作
  正在进行时启动另一项操作，将会失败并返回 **`WorkspaceMigrationOperationInProgress` (HTTP 400)**。启动下一次阶段升级之前，务必轮询当前
  操作，直至其进入终止状态（这也是为什么在部署进行期间调用工作区*分配*
  接口会失败）。
- **分配工作区后的首次部署可能会失败并返回 `Alm_InvalidRequest_WorkloadUnavailable`。** 新分配的
  工作区需要 **约 60–120 秒**来初始化工作负载服务（Lakehouse、Notebook 等）。
  可通过以下方式缓解：在首次部署前等待一段时间；或者先部署 Power BI 项（`SemanticModel`、`Report`），
  短暂延迟后再部署 Fabric 原生项（`Lakehouse`、`Notebook`）；出现此错误时进行重试。工作负载预热后，
  后续部署将会稳定运行。
- **操作 ID 会在 `x-ms-operation-id` 响应标头中返回**（与 `Location` 一同返回），而不是在
  `202` 响应正文中。`az rest` 无法清晰地呈现响应标头——为了在自动化流程中可靠地捕获标头，
  请使用 `curl -i`（或 Python `requests`）发起部署并解析标头，然后使用 `az rest` 轮询
  `/v1/operations/{operationId}`。
- **部署复制的是定义，而不是数据。** 只有项的元数据/定义会被升级；表数据、查询
  结果和缓存不会被升级。部署后，请在目标阶段触发刷新/加载。
- **每个部署请求最多包含 300 个项。** 选择性（或完整）部署的上限为**已部署 300 个项**；
  对于规模更大的升级，请拆分为多次部署调用。

## 示例

### 创建一个三阶段管道
部署管道的 `displayName` 在**整个租户中必须唯一**——如果创建时使用的名称已被占用，操作将失败并返回 `Alm_InvalidRequest_DuplicateAlmPipelineName`（HTTP 400，"pipeline name ... is already in use"）。为了让创建操作可以重复运行，请先删除具有该名称的任何现有管道，然后再创建。将 JSON 请求正文写入文件，并使用 `--body @file.json` 传递——在 Windows/PowerShell 上（`az` 是 `az.cmd`），内联多行 `--body '{...}'` 会被破坏为空请求正文，API 将以 `InvalidInput: Unexpected end when reading JSON` 拒绝该请求。
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

### 将所有项从 dev 部署到 test，并等待 LRO 完成
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

### 仅部署选定的项
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

### 仅部署发生更改的项（先计算差异）
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
  --headers "Content-Type=application/json" \
  --body "$(jq -n --arg s "$SOURCE_STAGE_ID" --arg t "$TARGET_STAGE_ID" --argjson items "$ITEMS" \
    '{ sourceStageId: $s, targetStageId: $t, items: $items, note: "Deploy only changed items" }')"
# Then poll /v1/operations/{operationId} until terminal.
# NOTE: a selective deploy does NOT propagate deletions — use a full deploy (omit items) for those.
```

### 提示词/响应

**用户：**“将我的 Sales 开发工作区提升到测试阶段，并在完成后通知我。”

**助手（行为）：**
1. 列出部署管道 → 筛选出其开发阶段包含 Sales 开发工作区的管道；获取 `sourceStageId`（开发）和 `targetStageId`（测试）。
2. 确认测试阶段已分配工作区（否则询问名称和容量，以便创建一个）。
3. 使用 `note` POST `deploy`，收到 `202` 后提取操作 ID。
4. 轮询 `/v1/operations/{operationId}` 直至操作进入终止状态，然后报告成功以及已部署项的列表（或失败原因）。