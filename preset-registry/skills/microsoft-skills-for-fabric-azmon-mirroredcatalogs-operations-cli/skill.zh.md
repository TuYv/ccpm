---
name: azmon-mirroredcatalogs-operations-cli
description: "Onboard Azure Monitor / Application Insights observability data into Microsoft Fabric and guide business-impact insights by correlating telemetry with business data, Eventhouse external delta tables, verified schemas, an optional Real-Time (KQL) dashboard, and opt-in Operations Agent instructions. Triggers: onboard Azure Monitor into Fabric, correlate App Insights telemetry with business data, build a Real-Time KQL dashboard over telemetry, build an Operations Agent for business-impact alerting, determine if availability or latency impacted bookings orders or revenue, connect a Log Analytics workspace to Fabric."
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: azmon-mirroredcatalogs-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=azmon-mirroredcatalogs-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍必须添加。

# azmon-mirroredcatalogs-operations-cli

端到端指导用户：(1) 将 Azure Monitor / Application Insights /
Log Analytics 可观测性数据作为镜像目录
(AzMon) 项加入 Microsoft Fabric；以及 (2) 通过将可观测性信号与业务数据（预订、订单、
客户、航班、付款、收入、租户、账户、订阅、使用量
KPI、SLA/可用性 KPI）相关联，将这些遥测数据转化为**业务影响洞察**，最终生成可直接粘贴的
**Operations Agent**
指令。

这是一个**自包含的 Skills-for-Fabric 包**。它**不**依赖任何
MCP 服务器或工具控制器作为执行机制。产品/API
知识、支持的流程、防护规则和建模规则均包含在本文件和
`references/*.md` 中。

## 前置知识

运行此技能之前，请阅读共享的通用指南：

- [身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition)
- [身份验证操作方法](../../common/COMMON-CLI.md#authentication-recipes)

## 触发短语

- 将 Azure Monitor 数据加入 Fabric
- 在 Fabric 中创建 Azure Monitor 项
- 将 Application Insights 连接到 Fabric
- 将 App Insights 遥测数据与业务数据相关联
- 将我的 LA 工作区加入 Fabric
- 将 Log Analytics 工作区加入 Fabric
- 将 Log Analytics 工作区连接到 Fabric
- 了解服务可用性是否影响了预订
- 了解延迟是否影响了转化
- 将异常与收入或订单相关联
- 为 Azure Monitor 业务影响构建 Operations Agent
- 从 Log Analytics 数据中创建业务影响洞察

## 何时使用此技能（以及相关技能）

`azmon-mirroredcatalogs-operations-cli` 用于将 Azure Monitor /
Application Insights / Log Analytics 遥测数据加入 Microsoft Fabric
（mirroredCatalogs 端点）、将这些遥测数据与业务数据相关联，以及
生成 Operations Agent 指令。对于与 Azure Monitor 加入无关的常规 Eventhouse / KQL 查询，
请使用 `eventhouse-cli` 使用模式；
对于创作 Eventhouse 项和数据库，请使用其创作模式。

## 参考资料索引

当相应阶段需要产品/API 详细信息时，请阅读以下资料。不要将其
完整粘贴到用户响应中——它们是为你（智能体）提供的指导。

| 参考资料 | 用途 |
|-----------|-----------|
| [references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md) | 支持的流程与仅 UI 支持的流程；连接器模式；Fabric 项/智能体界面 |
| [references/workspace-identity-connection-reference.md](references/workspace-identity-connection-reference.md) | 模式 B 工作区标识连接：预配/检测标识、用户授予的 LA RBAC、WorkspaceIdentity 连接 |
| [references/workspace-discovery-policy-reference.md](references/workspace-discovery-policy-reference.md) | 阶段 3 Fabric 工作区发现顺序、解读、用户提供的解决方案、仅将阻止作为最后手段 |
| [references/oauth-connection-reference.md](references/oauth-connection-reference.md) | 模式 B OAuth 连接：只读检测顺序、复用规则、UI 引导式创建步骤 |
| [references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md) | 镜像目录项 CRUD、定义、发现、监控、刷新 |
| [references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md) | Eventhouse/KQL、OneLake 快捷方式、可查询性要求 |
| [references/operations-agent-reference.md](references/operations-agent-reference.md) | Operations Agent 指令模板、验证、故障排除 |
| [references/telemetry-table-reference.md](references/telemetry-table-reference.md) | App Insights / OpenTelemetry / 自定义安全遥测表及其业务含义 |
| [references/app-insights-dynamic-fields-reference.md](references/app-insights-dynamic-fields-reference.md) | 动态字段（Properties/CustomDimensions）和隐藏的业务键 |
| [references/dashboard-reference.md](references/dashboard-reference.md) | 实时 (KQL) 仪表板创建/更新机制；通用磁贴模式 |
| [references/business-analysis-workflow.md](references/business-analysis-workflow.md) | 业务分析部分的完整详情——阶段 13–17（包括相关性模式和建模附录）；在阶段 12 移交时加载 |

## 保密与范围护栏

- 不得向用户暴露 Azure Log Analytics 后端 API。
- 不得向用户暴露 Fabric / DMTS / Gateway 连接内部机制或内部
  端点。
- 不得请求或披露令牌、OAuth 重定向代码、OAuth nonce 值、
  Cookie、密钥或内部实现细节。
- 不得在面向用户的流程中的任何位置提及 MCP、MCP 服务器或 MCP 连接/故障排除。
  此 Skill 是自包含的。
- 不得将未记录的 / 通过浏览器检查发现的 / 内部连接器 API 作为
  受支持的公共 API。
- 不得声称可通过公共 API 创建 OAuth Azure Monitor 连接器
  ——OAuth 连接器创建**只能通过 UI 引导完成**。
- 不得捏造工作区名称、表名、架构、项 ID、连接
  ID 或查询结果。仅使用实际发现/查询返回的值；否则应使用
  明确标记的占位符。
- 不得预先要求用户提供 JOIN 逻辑、KQL、分箱或阈值。
- 如果请求涉及 SQL / Data Warehouse 或 Lakehouse 摄取、数据仓库
  性能，或与 Azure Monitor / Application Insights / Log Analytics
  接入**无关**的常规 Fabric DW 最佳实践，请说明该请求**不属于**
  此 Azure Monitor Skill 的范围，并将用户引导至适当的数据仓库
  Skill；不得对其执行操作、运行查询或创建资源。

### 领域无关规则

此 Skill 或其参考资料中任何位置提及的业务实体——预订、
订单、客户、航班、收入、租户、付款及类似实体——
**仅为示例**。Skill 不得根据这些示例推断用户的业务领域。
必须从真实的 Fabric 数据（Eventhouse / KQL database / Warehouse / Lakehouse / shortcuts）
中发现用户实际的业务实体，并在使用前与用户确认。

具体而言：

- **示例仅用于说明。** 此 Skill 及其参考资料中的每个业务实体名称
  （例如预订、订单、客户、收入、航班、租户、付款）
  都是非规范性示例，而非必需或预期的实体。
- **此 Skill 与领域无关。** 它适用于任何业务领域，且不预设任何领域。
- **Skill 不得推断或假设用户的业务领域**，无论依据是
  说明性示例、恰好与某个示例相似的表名或列名，
  还是任何先前上下文。
- **必须从用户的实际数据中发现业务实体**，并且在发现和确认之前，
  必须使用通用称谓——如*业务实体*、*业务数据集*、*业务 KPI*
  或*业务成果*——而不是任何假定的领域特定名称。

## 执行能力策略

此 Skill 是一个分阶段引导式工作流。

实际执行取决于当前环境中可用的能力。

仅允许针对 OAuth Azure Monitor 连接器创建提供门户引导式说明。

Skill 不得将整个接入流程切换为门户引导式说明，作为通用的后备方案。

对于所有非 OAuth 阶段，Skill 必须首先尝试发现当前环境中是否存在受支持的执行路径。

受支持的执行路径可能包括：

- Fabric REST APIs
- Azure REST APIs
- Fabric Actions
- Azure CLI
- Azure Resource Graph
- 通过已认证的 `az rest --method get` 对 Fabric REST 进行**只读**发现，
  目标为 `https://api.fabric.microsoft.com/...`（仅限发现/只读）
- 代理可用的其他有文档记录的受支持能力

**Log Analytics REST API 参考（面向代理）。** 当 Skill 需要执行或验证 Azure Log Analytics 操作时，可以查阅官方 [Log Analytics REST APIs](https://learn.microsoft.com/en-us/rest/api/loganalytics/) 参考文档，以确定受支持的 Log Analytics 管理、工作区、表、引入和查询 API。此内容仅作为面向代理的指导，不会放宽上述保密规则。

这些执行路径彼此不同，绝不能混为一谈：

1. **Kusto / KQL 数据平面执行** — 遥测查询；可选，并且在禁用时绝不能
   使用。
2. **Azure ARM 控制平面发现** — 资源/元数据枚举。
3. **Fabric REST 控制平面发现** — 已公开的 Fabric REST / Fabric
   Actions 能力。
4. **任意 shell / CLI 执行** — 不在范围内（请参阅范围外
   约束）。
5. **通过已认证的 `az rest --method get` 进行 Fabric REST 只读发现** —
   一项范围有限的允许例外，仅用于针对
   `https://api.fabric.microsoft.com/...` 的 Fabric 发现/读取。它仅限 GET，绝不会创建、
   更新、删除或修改任何内容，也绝不会暴露令牌、机密、
   身份验证标头或敏感载荷。这不属于通用 shell/CLI 访问。

仅 MCP 不可用并不意味着执行能力不可用。

任何单一执行路径不可用，都不自动意味着该
能力不可用。在声明某项能力不可用之前，Skill
必须评估上面列出的所有受支持执行路径，并确认没有任何路径
可用。只有在评估完每一条受支持的
执行路径后，才能报告能力不可用。

如果不存在受支持的执行路径，Skill 必须：

1. 停止。
2. 指明缺失的能力。
3. 解释为什么需要该能力。
4. 指明被阻塞的阶段。
5. 等待用户确认。

Skill 绝不能：

- 使用门户指导替代验证。
- 使用门户指导替代 Mirrored Catalog 创建。
- 使用门户指导替代发现、监控、刷新、快捷方式创建、架构验证或 Operations Agent 创建。
- 在执行能力不可用时声称某项操作已完成。


## 门户指导策略

Skill 应优先选择自动化执行路径，而不是 UI 指导说明：

- Fabric REST APIs
- Azure REST APIs
- Fabric Actions
- Azure CLI
- 其他受支持的自动化机制

在提供 UI 指导说明之前，Skill 必须：

1. 评估可用的执行路径。
2. 在有可用执行路径时尝试受支持的执行路径。
3. 说明评估了哪些执行路径。
4. 说明为什么无法使用这些执行路径。

只有完成这些步骤后，Skill 才可以提供 UI 引导式指导。

创建 OAuth Azure Monitor 连接器仍是明确支持的 UI 引导式场景，
无需进行上述评估。


## 严格的分阶段工作流控制器（强制执行）

Skill 必须作为严格的分阶段工作流控制器运行。

### 阶段

1. 意图和范围
2. Log Analytics 工作区选择
3. Fabric 工作区选择
4. 身份选择和验证
5. 连接解析
6. 创建或复用 AzMon / Mirrored Catalog 项
7. **业务洞察捕获**（此处可选；可以推迟——必须在架构验证（阶段 12）
   之前捕获/确认意图）
8. Azure Monitor 表发现
9. Eventhouse / KQL 数据库**目标**选择（默认自动终结点，或
   特定/新建 Eventhouse）
10. 外部 Delta 表注册规划
11. 外部 Delta 表注册
12. 架构和数据验证
13. 业务数据发现和评分
14. 关联规划
15. 可选的仪表板建议和创建
16. Operations Agent 指令生成（可选——受门控：仅当用户
    需要代理时）
17. 可选的 Operations Agent 创建/验证

### 执行规则

- Skill 必须跟踪并强制执行当前阶段。
- Skill 不得跳过任何阶段。
- Skill 在完成当前阶段之前不得进入下一阶段。

### 阶段可见性（每次面向用户的响应中均为必需）

每次响应都必须以以下结构开头，并使用**普通聊天文本（不是
代码块）**：

- **当前阶段：** <stage name>
- **我的发现：** <short summary>
- **下一步：** <one clear action>

然后以一行邀请用户确认后再继续的文字结尾（例如
*“正在等待你的确认以继续。”*）。

如果当前阶段不明确 → **停止**并询问用户要从哪里继续。

### 强制停止行为

在呈现任何需要确认的步骤后：

- **停止。**
- **等待**用户明确确认。
- 不要自动继续。

### 确认门控（在以下操作之前必须获得明确确认）

- 为流程选择身份（阶段 4）——建议使用服务主体，
  但在验证前必须等待用户选择。
- 创建或复用任何会修改 Fabric 的资源。
- 预配 Fabric 工作区身份并为其分配 Log Analytics
  角色（阶段 5，模式 B 的工作区身份选项）——每次写入前都必须等待确认。
- 选择 Eventhouse 目标（特定的现有 Eventhouse 或新建的 Eventhouse）。
- 在选定/新建的 Eventhouse 中创建快捷方式——明确展示目标
  Eventhouse 以及将要创建的确切内容。
- 从架构验证（阶段 12）进入关联规划
  （阶段 14）。
- 创建或修改仪表板（先提出建议并等待
  批准）。
- 构建任何 Operations Agent（阶段 16）——在生成任何指令之前，明确询问
  用户是否需要代理。如果不需要，则跳过
  阶段 16–17；流程可以在仪表板之后结束。
- 如果关联模型尚未确认，则生成最终的 Operations Agent 指令。
- 创建或修改 Operations Agent。

### 阶段护栏

- 外部 Delta 表注册规划（阶段 10）必须在架构验证或联接逻辑之前进行。如果提前尝试架构验证/联接 → 停止并返回阶段 10。
- 外部 Delta 表注册（阶段 11）必须在架构验证之前完成。
- 架构验证（阶段 12）必须在关联规划（阶段 14）之前完成。
- 如果无法通过已注册的外部 Delta 表在 Eventhouse 中查询数据 → 停止 → 返回阶段 10/11。
- 在确认外部表可查询之前，绝不能开始关联规划。
- 业务洞察采集（阶段 7）可以提前回答，也可以**推迟**，以便用户先探索其数据，但在架构验证（阶段 12）和关联规划之前，必须采集/确认意图（已提供意图，或者明确选择了建议的方向）。绝不能假定意图。

### 范围外约束

除非明确属于当前阶段，否则该技能绝不能运行任意 shell/CLI/az/PowerShell 命令、执行网络调试、调查服务器连接问题或执行基础设施故障排除。这些操作不在范围内。

**有限例外 — Fabric REST 只读发现。** 仅当以下所有条件均满足时，该技能才可以使用经过身份验证的 `az rest --method get` 调用进行 Fabric REST 只读发现：

- 端点为 `https://api.fabric.microsoft.com/...`。
- HTTP 方法只能是 **GET**。
- 操作仅限于发现/只读。
- 不得创建、更新、删除或修改任何内容（不得通过 CLI 操作 Fabric 项、快捷方式、镜像目录项或连接器）。
- 不得暴露令牌、机密、原始身份验证标头或敏感有效负载。
- 该技能明确说明所使用的功能路径。

此例外不允许执行任意 shell/CLI 命令、非 GET 的 `az rest` 调用，也不允许在 Kusto / KQL 数据平面被禁用时使用该数据平面。

**有限例外 — Fabric 工作区标识预配 + LA 角色分配（仅限模式 B）。** 在模式 B 的工作区标识选项中，该技能可以使用经过身份验证的 `az` 调用来检测/预配工作区标识，并在调用方具有相应权限时分配其 Log Analytics 角色，但仅限于：

- `GET https://api.fabric.microsoft.com/v1/workspaces/{id}`（检测），以及
- `POST https://api.fabric.microsoft.com/v1/workspaces/{id}/provisionIdentity`（预配）及其长时间运行操作的 GET 轮询，以及
- `az role assignment list`（检查）和 Log Analytics 工作区范围内的 `az role assignment create`，用于向该标识授予 **Owner**，但仅限调用方在该范围内拥有 `Microsoft.Authorization/roleAssignments/write` 权限时。

每次写入操作都必须经过确认门控（阶段 5），且只能涉及工作区标识及其 LA 角色（不得涉及其他任何内容），不得暴露令牌/机密/身份验证标头，并且该技能需说明所使用的功能路径。如果调用方缺少角色分配权限，该技能绝不能强行执行，而应指导用户/管理员改为运行该分配操作。此例外不允许任何其他非 GET 的 `az rest` 调用，也不允许更广泛地使用 `az`。

### 响应风格（强制）

应提供**引导式产品体验**，而不是像后端调试器一样行事。

- 使用简洁、易于商务用户理解的语言。
- 除非用户明确要求，且相关 API 已有文档并受支持，否则绝不展示内部实现步骤（CLI、REST、令牌、API 调用）。
- 绝不在面向用户的输出中暴露内部限制（“公共 API 限制”“不支持 CredentialType”“无头 OAuth 失败”）。
- 绝不索取密钥、OAuth 代码、Cookie、重定向 URL、令牌或 nonce 值。
- 总结调查结果。除非用户明确要求，否则不要在面向用户的输出中暴露端点实验、API 探测、OpenAPI / 架构探索、重试调查或底层调试细节。
- 每个阶段结束后：提供简短总结，请求用户明确确认，然后停止并等待。

---

## 阶段 1 — 意图和范围

确认用户的目标：将可观测性数据接入 Fabric、探索业务洞察，还是两者兼有。以通俗语言记录用户已经提及的任何工作区名称或业务成果，但暂时不要推进关联分析。

## 阶段 2 — Log Analytics 工作区选择

Application Insights 遥测数据通过其后端 Log Analytics 工作区（基于工作区的 Application Insights）进行查询。帮助用户选择正确的 Log Analytics / Application Insights 后端工作区。

- 如果用户未提供工作区，请询问订阅，然后提供简明的受支持工作区列表（名称 + 资源组 + 位置）。绝不暴露原始 API 响应。
- 当订阅中有许多工作区时，优先使用不区分大小写的名称筛选，而不是列出所有工作区。

### 未找到完全匹配名称时的回退方案（必需）

当用户指定了一个工作区，但不存在**完全**匹配项时，Skill 不得失败。应改为：

1. 如果用户尚未提供订阅，请询问订阅（不要猜测）。
2. 提供相似的工作区（名称中**包含**该词，或存在不区分大小写的近似/部分匹配）。如果范围较窄的筛选未返回结果，请扩大搜索范围。
3. 以简洁的编号列表展示候选项（名称 + 资源组 + 位置），然后停止并等待用户选择。
4. 即使只找到一个相似工作区，仍须先确认再继续。
5. 如果未找到任何结果，请明确说明，并要求用户提供其他订阅或搜索词。

绝不虚构工作区名称或 GUID，只能提供实际发现的工作区。

## 阶段 3 — Fabric 工作区选择

帮助用户选择目标 Fabric 工作区（显示名称 + id）。适当时使用不区分大小写的子字符串筛选。此阶段为只读操作，不会创建任何内容。绝不暴露原始 API 响应或令牌。

### Fabric 工作区发现与能力解析策略（必需）

Fabric 工作区**不是** Azure Resource Manager 资源，因此，缺少自动枚举路径并不意味着 Fabric 工作区不存在。**绝不提前终止工作流**：如果自动发现失败，请用户提供 Fabric 工作区的**名称**、**ID**或 **URL**，在可用能力允许的范围内进行验证，然后继续。绝不自动选择工作区，绝不虚构工作区或验证结果；只有在所有发现机制和所有由用户提供的解析路径均已尝试但仍无法解决后，才能将阶段 3 标记为 BLOCKED。

请遵循
[references/workspace-discovery-policy-reference.md](references/workspace-discovery-policy-reference.md)
中的完整发现顺序、解释规则，以及以 UI 引导作为最后手段的边界要求。

## 阶段 4 — 身份选择与验证

### 身份选择（必须首先执行 — 等待用户回复）

验证必须针对**将实际执行该流程的身份**运行，因此必须在进行任何验证检查**之前**选择身份，而不能推迟到阶段 5。不要直接沿用 `az` 当前碰巧登录的身份。

向用户提供以下选项后停止 — 使用**普通聊天文本（纯编号列表，而非代码块）**询问：

此次引导应使用哪个身份？

1. **Service Principal（推荐）** — 自动化、非交互式；最适合可重复运行和 CI。需要 tenant id、app/client id，以及通过安全方式提供的 secret/certificate。
2. **你的用户账户（交互式登录）** — 如果你更希望以自己的身份运行，或者没有可用的 Service Principal。

请用户回复 **1** 或 **2**；并说明推荐使用 Service Principal。

- **推荐使用 Service Principal**，但由用户自行选择。如果用户要求以自己的身份登录，则允许进行交互式用户登录，并继续以该用户身份执行。
- 用户作出选择后，确认实际生效的身份（例如通过 `az account show`），以确保验证针对正确的主体运行。如果实际身份与所选身份不匹配，请停止并先解决登录问题，再进行验证。
- 在后续流程中始终沿用所选身份：阶段 5 的连接解析以及之后所有修改 Fabric 的操作，都使用同一身份。

### 针对所选身份进行验证

在进行任何创建操作之前，请针对**该身份**验证以下事项：

- 工作区存在。
- **所选身份**拥有所需的 Log Analytics 访问权限。
- **所选身份**拥有足够的 Fabric 工作区操作权限（对于 Service Principal，还必须启用租户设置 *“Service principals can use Fabric APIs”*）。
- 尽早说明，后续进行连接检测/复用时，所选身份需要在 Azure Monitor 连接上拥有**某个角色**（**User** 角色即可；不要求为 **Owner**），以便在此阶段而不是到阶段 5 才发现权限缺口。
- 对于模式 B 的**工作区身份**连接选项（阶段 5），所选身份必须是工作区 **Admin**（配置工作区身份所必需）。当调用方在 LA 作用域拥有角色分配权限（**Owner** / **User Access Administrator**）时，Skill 可以自行分配该身份的 Log Analytics 角色；否则，应指导用户完成该操作。请尽早说明这两种情况。

如果验证失败，请用用户易于理解的方式概述哪些检查已通过、哪些检查未通过，说明缺少的能力，并提供以下选项：尝试其他工作区、授予缺少的权限，或切换身份。有关受支持作用域的规则，请参阅
`references/azmon-fabric-api-reference.md`。

### 验证能力发现（必须执行）

在声明验证能力不可用之前，Skill 必须确定环境是否提供以下任一能力：

- Fabric REST API
- Azure REST API
- Fabric Actions
- Azure CLI
- Azure Resource Graph

MCP 可用性只是其中一种可能的执行路径。

只有在评估所有受支持的执行路径并确认均不可用后，Skill 才能报告验证能力不可用。

在声明验证能力不可用之前，Skill 必须：

1. 确定是否存在其他受支持的执行路径。
2. 使用当前环境中所有可用的受支持机制尝试发现能力。
3. 只有在评估所有受支持的机制并确认均不可用后，Skill 才可以声明该能力不可用。

## 阶段 5 — 连接解析

支持两种连接模式。默认**优先使用服务主体（模式 A）**，即自动化、非交互式路径。仅当服务主体不可用或用户明确要求时，才回退到 **OAuth（模式 B）**。两种模式必须**保持分离**。绝不能通过服务主体逻辑处理 OAuth，也绝不能通过 OAuth／交互式登录逻辑处理服务主体。有关权威的连接器规则**以及有明确文档说明的确切连接 API 端点和有效负载结构**（列出／获取／创建连接 + 列出支持的连接类型），请参阅
[references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md)。
请使用这些文档中规定的结构——**不要**猜测连接有效负载，也不要去搜索通用文档。当 Azure Monitor 连接器的确切 `type`／`creationMethod`／`parameters` 未知时，应通过 `supportedConnectionTypes` 端点解析，而不是进行假设。

### 模式选择（必需顺序）

身份已在**阶段 4（身份选择）**中选定并验证。在此处使用该身份——除非用户更改身份，否则不要再次询问。将所选身份映射到相应的连接模式：

1. **服务主体 → 模式 A。**如果已存在与同一 Log Analytics 工作区匹配的服务主体连接器，则复用该连接器。否则，当必需的服务主体输入可用时（租户 ID、应用／客户端 ID，以及以安全方式提供的机密／证书引用），自动创建或复用服务主体连接器——无需 UI 步骤。
2. **用户／交互式 → 模式 B。**当用户选择以自己的身份登录、服务主体不可用或租户不允许使用服务主体时，使用此模式。在模式 B 中，首先提示用户选择连接身份验证方法——交互式 OAuth 或工作区身份（请参阅下文的“模式 B — 选择连接身份验证”）——然后转入相应的子分支。

### 连接可见性注意事项（适用于两种模式）

要使连接**可被发现**，必须为调用身份至少分配一个该连接上的角色——无论该身份是**服务主体**（模式 A）还是**用户**（模式 B）。分配任何角色都可以使连接出现在列表中并可被复用；**User** 角色足以用于检测和复用，只有在**管理／修改／删除**连接时才需要 **Owner** 角色。如果调用方在某个连接上**没有任何角色**，API 将**不会**返回该连接——这是**设计使然**，并非故障。

因此，如果搜索**没有**找到匹配的连接，Skill **不得**立即断定该连接不存在。它必须先考虑以下可能性：该连接可能确实存在，但**对当前身份不可见，因为该身份在此连接上没有任何角色**，并且：

- 说明**对于当前身份**未找到匹配的连接，并指出这可能意味着：(a) 不存在此类连接；或者 (b) 此类连接确实存在，但调用方服务主体或用户在该连接上**没有任何角色**。
- 建议为服务主体或用户分配现有 Azure Monitor 连接（对应同一 Log Analytics 工作区）上的**一个角色**——**用户**角色足以用于检测和复用——然后重新运行检测。（如果为服务主体授予较低级别的角色后仍然无法看到该连接，请参阅
  [references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md)
  中的服务主体说明。）
- 只有在说明这种权限方面的可能性之后，Skill 才可以继续创建新连接器（模式 A），或提供 OAuth 一次性创建指导（模式 B）。

绝不虚构连接，也不得在没有实际列表匹配结果的情况下声称连接存在。

### 门户指导的边界

仅允许针对 OAuth Azure Monitor 连接器创建提供门户操作指导。

对于以下操作，不允许将门户指导作为备用方案：

- LAW 验证
- Fabric 工作区验证
- 连接检测
- 连接复用
- 服务主体连接器创建
- 镜像目录项创建
- 发现
- 监控
- 刷新
- Eventhouse 快捷方式创建
- 架构验证
- Operations Agent 创建

如果不具备执行这些操作的能力，Skill **必须**停止并指出缺失的能力。

### 模式 A — 服务主体（自动创建或复用，默认）

将此方式表述为**“使用服务主体进行连接”**——这是一条自动化的非交互式路径（无需用户登录，也无需 UI 操作）。这是**首选**默认方式；应先于 OAuth 尝试此方式。

- **幂等创建或复用**：如果已存在与同一 Log Analytics 工作区匹配的 Azure Monitor 服务主体连接器（相同的数据源路径 + 服务主体凭据类型），则复用该连接器——绝不创建重复连接器。
- 每次运行仅创建**一个**连接器。
- 在此模式下，**绝不**复用非服务主体连接器（例如 OAuth 连接器）。
- **绝不**要求用户将客户端机密粘贴到聊天中。机密只能来自**环境变量或 Key Vault 引用**，且绝不回显、记录、暴露或包含在生成的说明中。
- 如果缺少必需的服务主体输入，请仅通过存在性检查说明缺少的**内容**（租户 ID、应用/客户端 ID，以及以安全方式提供的机密引用）——绝不要求用户在聊天中提供机密值。只有在无法提供服务主体输入时，才回退到 OAuth（模式 B）。

自动化边界：基础设施操作（连接器创建或复用、镜像项创建）是自动化的；**业务决策**（Eventhouse/KQL DB 选择、快捷方式创建）始终需要用户明确确认。

### 模式 B — 选择连接身份验证方式（必须提示）

当所选身份为用户/交互式身份（模式 B）时，可以通过两种方式创建连接。在检测或创建任何内容之前，请以**普通聊天文本（纯编号列表，而非代码块）**呈现以下选项，然后停止并等待用户回答：

应如何对 Azure Monitor 连接进行身份验证？

1. **交互式登录 (OAuth)** — 你需要在 Fabric → Manage Connections 中登录一次；该连接使用你的组织帐户。
2. **工作区标识（无机密）** — 使用 Fabric 自动管理的工作区标识作为凭据；你需要授予该标识访问 Log Analytics 工作区的权限。无需处理任何机密。

根据选择进入下方对应的子分支 — **1 → 模式 B (OAuth)**，**2 → 模式 B
（工作区标识）**。务必将二者严格分开。如果用户没有偏好，请说明工作区标识可以避免交互式登录和机密处理，但必须等待用户选择 — 切勿自动选择。

### 模式 B — OAuth（仅限 UI 引导，后备方案）

当用户选择上述选项 1 时使用此子分支，即仅当服务主体（模式 A）不可用或用户明确要求 OAuth 时使用。OAuth 连接的**创建**只能通过 UI 引导完成（Fabric → Manage Connections）— Skill 绝不通过 API 创建该连接；它仅以只读方式**检测并复用**现有连接，并且仅当 Log Analytics 工作区完全匹配时才会复用。

请遵循 [references/oauth-connection-reference.md](references/oauth-connection-reference.md) 中完整的检测顺序、复用规则和面向用户的措辞。务必与模式 A 严格分开。

### 模式 B — 工作区标识（无机密）

当用户选择上述选项 2 时使用此子分支。使用 Fabric 自动管理的**工作区标识**作为连接凭据（无机密）。此流程会在需要时预配标识，确保其具有足够的 Log Analytics 角色 — **当调用方具备权限时自动为其分配，否则向用户提供操作说明** — 然后创建连接。

请遵循 [references/workspace-identity-connection-reference.md](references/workspace-identity-connection-reference.md) 中完整的流程、端点、门控条件和有效负载。关键门控条件：预配标识需要确认（调用方必须是工作区 **Admin**）；当调用方具有角色分配权限时，由 Skill 分配 LA 角色（否则 Skill 会提供操作说明并等待确认）— 这两项写入操作都需要确认；然后使用 `WorkspaceIdentity` 凭据类型创建连接。务必与模式 A 严格分开。

## 阶段 6 — 创建或复用 AzMon / Mirrored Catalog 项

在目标 Fabric 工作区中创建 Azure Monitor **Mirrored Catalog** 项，或复用现有的匹配项。这是一项会修改 Fabric 的操作 → 必须先确认。支持的 Mirrored Catalog 操作（项 CRUD、定义、发现、监控、刷新）记录在 [references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md) 中。

### 服务主体创建项（重要——优先复用；已观察到的回退方案）

根据 Microsoft Learn，**创建镜像目录** API 将**服务主体和托管标识**列为支持创建操作的标识，因此，使用服务主体创建项**有文档明确支持**，并非绝对的平台限制。

> **已观察到的回退情况。** 尽管如此，某些服务主体运行中仍出现过使用仅限应用的令牌时项**创建**遭拒的情况（底层项创建路径可能会**代表**已登录用户运行）。应将此视为**已观察到的**租户行为，而不是文档中规定的规则，并保持符合文档的默认行为：先尝试使用 SP 创建，仅当创建调用确实**被拒绝或不可用**时，才回退到用户（委托）/ UI 上下文。

项存在后，获取、列出、**更新**、发现、监视、刷新和快捷方式操作均可使用仅限应用的 SP 令牌执行。

因此，在服务主体下运行时，Skill 必须：

- **优先复用**——复用 SP 能够查看和操作的现有 Azure Monitor 镜像目录项（及其现有连接）。这是首选路径：基于已创建的项和连接进行构建，而不是新建项。随后，SP 可以正常**更新**和操作该项。
- 如果不存在可复用的项，**尝试使用 SP 创建项**（创建 API 的文档说明支持 SP/托管标识）。仅当该创建操作**被拒绝或不可用**（即上述已观察到的回退情况）时，才**在用户上下文中创建项**——通过 **Fabric UI** 或通过**用户（委托）登录**——最好以现有项和连接为基础进行初始化。项存在后，服务主体便可在该项上恢复自动化流程（更新、发现、监视、刷新、快捷方式）。
- 如果创建操作实际是在用户/UI 上下文中完成的，绝不能声称该项是由 SP 创建的。

项存在后，下游镜像目录操作（更新、发现、监视、刷新）仍可由服务主体执行。

### 通过 scope 选择表（选择该项镜像哪些表）

该项不接受自由格式的表名列表——它通过 **`scope`**（定义中的命名空间层级路径）进行镜像，并且该 scope 必须是**列出 Scope** 发现 API 返回的 **`Selectable`** 值。若要仅以用户所需的表为目标：

- 调用**列出 Scope** 并为该项选择一个 `Selectable` scope。如果用户已经知道目标表，请选择能够覆盖这些表的**最窄 `Selectable` scope**。如果尚未确定意图（用户希望先探索），请使用**较宽的 scope** 创建，并可在捕获到意图后，通过更新项定义，选择性地将 **scope 重新设为**较窄范围。只能使用实际返回的 scope 值——绝不能虚构 scope 或表名。
- 如果可用的最窄 `Selectable` scope 比请求的范围**更宽**，该项**还会镜像该 scope 下额外的同级表**——镜像无法排除单个同级表。创建前应明确说明这一点并获得明确确认。
- 对于现有/复用的项，在假定其符合请求之前，应读取其当前定义中的 scope；不要虚构定义字段。

### 默认镜像集（必须作为起点）

除非用户另有指定，否则，**要镜像的默认表集合**是满足以下两个条件的
所有表：(a) 出现在真实的**列出范围 / 发现**输出中，并且 (b)
匹配以下名称前缀之一（不区分大小写；允许使用 `_CL`
自定义表后缀）：

- `App*` — Application Insights 表
- `OTel*` — OpenTelemetry 原生表（例如 `OTelLogs`）
- `XD*` — 自定义的安全相关日志表

然后，在创建之前，**询问用户是否还需要其他表**
（确认关卡——展示解析后的集合并等待）。

- 仅针对**实际发现的表**匹配前缀——绝不虚构表。
  如果某个前缀未匹配到任何表，则直接忽略。
- 将默认集合解析到能够覆盖所有匹配表的**最窄单个 `Selectable`
  范围**。如果该范围还会纳入默认集合之外的**额外同级表**，
  则**明确列出这些额外表**，说明无法单独排除同级表，并在创建前获得确认。确认后，
  这些额外表即为**预期表**——在阶段 8 的相等性检查中，它们不属于失败。
- 添加用户请求的表可能会扩大所选范围——需要重新解析并
  重新披露。
- 如果 `App*` / `OTel*` / `XD*` 均未匹配到任何已发现的表，则回退为
  展示全部/有代表性的已发现表（先探索），并让用户
  选择。
- 只有在工作区通过阶段 4 的验证后（即工作区受支持且已验证），才考虑
  **`XD*` 安全表**；不受支持的工作区阻止条件具有更高优先级，且绝不能
  使用表选择来绕过该条件。
- **复用时：**读取现有项的当前范围，并将其镜像集合
  与默认集合进行比较。如果未完全覆盖，则提议通过**重新设定范围**（更新
  项定义）来添加缺失的 `App*`/`OTel*`/`XD*` 表，并披露任何
  额外同级表——绝不能静默地重新设定范围；必须先确认。

确认后的集合（默认表 + 已确认的同级表 + 用户添加的任何表）将成为
阶段 8 请求表与已镜像表相等性检查的**预期集合**。

### 首次镜像延迟（必须披露）

对于**首次镜像的工作区**，应预先告知用户：创建项后，镜像的
表和数据通常需要**大约 5 分钟**才能实体化并可供
查询。在此之前，发现/查询可能返回空结果或部分结果——这是**预期行为**，
而不是错误。在此时间窗口内，不要断言表缺失：应验证镜像/刷新状态、等待，
然后重新检查，再得出结论。

创建或复用该项后，如果用户已有目标，可以选择此时记录业务意图
（阶段 7）；否则，继续进行表发现和探索，并在架构验证（阶段 12）之前
记录意图。

## 阶段 7 — 业务洞察采集（此处可选；可推迟）

如果用户已经有业务问题，现在就记录下来，以便以此指导表发现
（阶段 8）和 Eventhouse 评分（阶段 9）。如果没有，
此阶段**目前是可选的**——用户可以先探索其数据
（阶段 8–11），之后再提供意图。无论哪种情况，在
架构验证（阶段 12）和关联分析（阶段 14）之前，意图都是**必须提供的**；提前采集
只是一种有助于聚焦发现过程的优化。

在捕获意图时，请使用业务语言提问，例如：

- 服务可用性问题是否影响了预订？
- 请求延迟是否降低了客户转化率？
- 异常是否影响了收入或订单？
- 依赖项故障是否影响了特定客户、租户、区域或
  航班？
- 事件是否影响了 SLA、使用量或客户活动？
- 流量下降是否与使用量 KPI 恶化相关？

### 强制要求

如果不满足以下任一条件，Skill **不得**继续进行架构验证（阶段 12）或业务
**关联分析**（阶段 14）：

- (a) 用户提供了业务意图，或者
- (b) 用户从建议的方向中做出了明确选择。

意图可以在此处提供，也可以在探索后提供，但在
阶段 12 之前**必须**明确意图。绝不能臆测意图。

### 回退方案（当用户不确定 / 表述模糊 / 没有完全匹配项时）

建议 3–5 个方向，每个方向均采用**可观测性信号 → 业务
影响**的形式，并请用户选择一个：

1. 可用性故障 → 对预订完成率的影响。
2. 请求延迟 → 转化率或结账量下降。
3. 异常 → 订单失败或面临风险的收入。
4. 依赖项故障 → 对客户 / 租户 / 区域的影响。
5. 流量下降 → 使用量 KPI 恶化。

### 重要区别

允许提前捕获意图，但这**不是必需的**——不过在架构
验证（阶段 12）之前**必须**明确意图。无论采用哪种方式，Skill 此时都**不得**生成关联逻辑。
只有在快捷方式已存在、架构已验证、数据可查询、动态字段已检查、候选联接项已验证且
数据新鲜度已检查后，才能生成关联逻辑（阶段 10–14）。

## 阶段 8 — Azure Monitor 表发现

浏览候选 Azure Monitor / Application Insights 表。**如果已捕获业务目标
（阶段 7），**则筛选与该目标相关的表。**如果尚无意图
（先探索），**则展示所有已发现的表或具有代表性的已发现表，以便用户
浏览。只能使用实际发现的范围/表值——绝不能虚构
表名。使用
[references/telemetry-table-reference.md](references/telemetry-table-reference.md)
以业务术语解释每个表的含义，以及哪些表最适合既定目标（或者在探索时说明
每个表能提供什么）。

### 发现 API 回退策略（必需）

**主要**发现机制是 Mirrored Catalog Discovery APIs。如果
发现结果似乎不完整，不要立即断定缺少表，也不要
切换到其他元数据路径。首先：

1. 验证镜像状态。
2. 验证刷新 / 同步状态。
3. 验证发现范围。
4. 重试发现。

只有完成这些检查后，Skill 才可以评估其他元数据路径。请参阅
[references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md)。

### 请求集与镜像集的集合相等性检查（一旦请求了特定表集，即为必需）

一旦存在**请求的表集**，此检查即适用——无论该表集是在开始时指定，
还是在之后捕获意图后指定。当采用**默认镜像集**（阶段 6）
或用户调整后的集合时，该集合即为此次
检查的**请求集**；而根据最窄公共范围规则披露并确认的所有同级表均为
**预期项**（应与所选范围的预期内容比较，
而不是仅与表列表比较——不要将已确认的同级表报告为失败项）。当
用户请求了一组特定
表时，请验证该项镜像的
**恰好**是该集合——应使用**相等关系，而不是子集关系**（仅确认“我的表都存在”并
不足够）。将**实际镜像的**表集（来自 Discovery / Monitoring）
与**请求的**集合进行比较，并报告结果：

- **存在额外表** → 所选范围比请求的范围更广。报告这些额外表；如果存在更窄的 `Selectable` 范围，则询问是否要重新确定范围；否则，说明源仅公开了更广的范围，因此无法避免这些额外表。
- **缺少请求的表** → 镜像可能尚未具体化。验证镜像/刷新状态，运行一次**刷新/同步**，等待，然后重新检查——不要过早地宣告这些表不存在。
- **完全匹配** → 确认并继续。

绝不要虚构镜像表集合；只能根据真实的发现/监控结果枚举该集合。

## 阶段 9 — Eventhouse / KQL 数据库目标选择

询问用户哪个 Eventhouse 应托管 LA 表快捷方式。以**普通聊天文本（而非代码块）**形式提供以下选项，并要求明确确认：

- **A — 某个特定的现有 Eventhouse**（例如，已包含你希望用于关联的业务数据的 Eventhouse）。Skill 会在**该 Eventhouse 中**创建 LA 表快捷方式，使遥测数据与业务数据共置。
- **B — 新 Eventhouse。** Skill 会创建该 Eventhouse 和 LA 表快捷方式；初始为空。

两个选项均可写入，并且都支持 Operations Agent 路径（它们可以托管 `IncidentBins` 具体化）。

运行 **Eventhouse 推荐模式**以辅助选择——发现可用的 Eventhouse，检查其内容（表、快捷方式、KQL 数据库），并根据相关业务表、相关遥测表、现有快捷方式、可查询表、KQL 数据库可用性和数据新鲜度为每个 Eventhouse 评分。**当用户的目标是将遥测数据与现有业务数据关联时，推荐选项 A**（共置）；否则，新 Eventhouse 是一个干净的起点。以普通聊天文本形式呈现：

- **推荐目标：** <A ‹EventhouseName› | B new>
- **原因：** <why>
- **替代方案：** <list>

Skill 不得自动选择。提供推荐，准确说明将创建哪些内容，并要求明确确认。请参阅 [references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md)。

## 阶段 10 — 外部 Delta 表注册规划

在进行任何架构验证或联接逻辑处理**之前**，为已解析的表集合规划到**所选/新建 Eventhouse** 中的**外部 Delta 表注册**——在计划标题中写明目标 Eventhouse 的名称。呈现计划并停止，等待确认。

关键规则（详情请参阅快捷方式参考文档）：

- KQL 数据库中的可查询性来自将每个表注册为指向镜像项 OneLake `Tables/dbo/<Table>` 路径的**外部 Delta 表**，而**不是**来自 Core Shortcuts API（后者仅创建链接）。通过 `external_table('<name>')` 进行查询。
- 针对每个表规划：确切名称、OneLake `Tables/dbo/<Table>` 路径、目标 KQL 数据库，以及从表的 Delta 日志中读取架构。

### 查询加速策略 — 外部 Delta 表（必须 — 始终为 `true`）

查询加速是**外部 Delta 表上的策略**（通过 `.alter external table … policy query_acceleration` 设置），**不是**快捷方式对象的属性。每个已注册的外部 Delta 表都必须**启用加速（`true`）**——不可选。计划表中应包含 `Acceleration Enabled (always Yes)` 列；如果环境不支持，请明确指出，而不是在不应用该策略的情况下注册。完整策略请参阅 [references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md#external-delta-table-query-acceleration-policy-must--always-true)。

## 阶段 11 — 外部 Delta 表注册

仅在获得明确确认后，才将每个表注册为目标 KQL 数据库中的 **外部 Delta
表**（报告具体数据库）：从表的 Delta 日志中读取其架构，将 Delta → Eventhouse 类型进行映射，并通过
`POST {clusterUri}/v1/rest/mgmt` 运行 `.create external table
['<Table>'] (<cols>) kind=delta ( h@'<OneLake Tables/dbo/<Table> path>;impersonate' )`。
然后使用 `.show external tables` +
`external_table('<Table>') | take 1` 进行验证。查询能力**不**需要 Core Shortcuts API
（该 API 仅创建链接）。如果某个表无法查询 → 停止并
返回规划/注册阶段。有关架构读取、类型映射和命令模板，请参阅
[references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md)。

注册任何外部 Delta 表时，**始终启用查询加速
策略（`true`）**，具体参见
[查询加速策略](references/eventhouse-shortcuts-reference.md#external-delta-table-query-acceleration-policy-must--always-true)，
并报告最终状态（预期：已启用）。

## 阶段 12 — 架构和数据验证（执行关联前必须完成）

绝不能基于假设或截图构建关联逻辑。在提出任何
联接、分箱或阈值之前，请针对**实际的** KQL 数据库进行验证。在此阶段之前
必须已经获取/确认业务意图——如果在阶段 7 中推迟了此操作，
请在继续之前立即获取业务意图（使用阶段 7 中的问题/后备方案），
因为下面的遥测源选择将根据与目标的相关性进行评分。
绝不能假设业务意图。

### 前提条件

1. Eventhouse/KQL 数据库中存在可用的操作遥测表。
2. 业务表存在于同一数据库中，或可通过快捷方式查询。
3. 表是**可查询的**，而不仅仅是在 OneLake 中可见。
4. 已通过 `getschema` 获取架构。
5. 已检查动态字段并对其进行采样。
6. 已从顶层列和动态列中提取候选联接键。
7. 已使用**非零**匹配结果验证联接键（当提出直接联接时）。
8. 已验证数据新鲜度。
9. 时间窗口已与实际数据范围对齐。
10. 如果规则依赖相关分类值，则已根据实际数据确认这些值。

### 步骤

> **查询约定。** 镜像遥测表是**外部表**——请通过
> `external_table('<name>')` 查询这些表（它们不会出现在 `.show tables` 中）；
> Eventhouse 中的**托管**业务表则直接使用其
> 名称。

1. **检索实际架构。** 对于每个表：
   `external_table('<TableName>') | getschema | project ColumnName, ColumnType`。
   使用权威的列名/类型，而不是根据截图或
   表名猜测的名称。
2. **检查动态字段并进行采样。** 业务联接键通常嵌套在
   动态列（`Properties`、`CustomDimensions`、`Details`、`Measurements`、
   `Payload`、`Context`）中。对行进行采样并检查键。请参阅
   [references/app-insights-dynamic-fields-reference.md](references/app-insights-dynamic-fields-reference.md)。
3. 使用显式 KQL **提取候选业务标识符**
   （`tostring(Properties.BookingId)`，并通过 `coalesce` 处理大小写形式的回退）。
4. **针对实际数据验证联接键。** 证明候选键能够联接——运行
   联接并确认匹配结果非零：

```kusto
   external_table('AppEvents')
   | extend BookingId = tostring(Properties.BookingId)
   | where isnotempty(BookingId)
   | join kind=inner (Bookings | project BookingId = tostring(BookingId)) on BookingId
   | summarize MatchedRows=count(), DistinctBookings=dcount(BookingId)
   ```

   非零 → **直接联接，置信度高**。为零 → 键有误或数据不存在重叠；请找出真正的键。
5. **检查数据新鲜度并对齐时间窗口。**
   `external_table('<TableName>') | summarize Rows=count(), MinTime=min(TimeGenerated), MaxTime=max(TimeGenerated)`。
   不要想当然地使用 `ago(1h)`；应使用覆盖实际数据范围的时间窗口，并以用户能够理解的方式进行说明。
6. **确认规则使用的分类值**
   （`external_table('<Table>') | summarize count() by <field>`），以确保影响规则使用真实的类别。

### 遥测源选择框架（必需）

遥测源选择必须**由数据驱动**。在选择关联模型之前，Skill 必须检查发现的所有候选遥测源（例如 AppEvents、AppExceptions、AppRequests、AppDependencies、AppTraces、AppPageViews、AppBrowserTimings、AvailabilityResults，以及存在的任何其他遥测源），而不只是其中一个。

根据以下维度对每个候选遥测源进行评分：

1. 发现的业务标识符。
2. 动态字段的丰富程度。
3. 直接联接的置信度。
4. 经验证的匹配数量。
5. 业务流程上下文。
6. 与所选业务目标的相关性。

选择得分最高的遥测源。Skill 不得自动优先选择 AppExceptions，也不得自动优先选择 AppEvents——应以真实数据为依据，选择得分最高的遥测源。

### 退出条件（强制）

在进入阶段 14 之前，必须满足以下所有条件：已通过 `getschema` 获取架构；联接键已经过验证且存在非零匹配（使用直接联接时）；已验证数据新鲜度并对齐时间窗口；已确认相关分类值。如果任何一项失败 → 停止，不得继续。

### 交接（强制）

提供简明摘要（已验证的联接键、匹配结果、业务影响〔如有〕、数据时间窗口）。然后询问：“是否要基于此已验证的模型继续进行业务分析（影响建模、仪表板，以及可选的 Operations Agent）？”必须停止并等待。确认后，按照 [references/business-analysis-workflow.md](references/business-analysis-workflow.md) 中的定义继续执行阶段 13–17。

## 阶段 13–17——面向业务的分析（在参考文档中定义）

面向业务的分析部分（业务数据发现/评分、关联规划、可选的实时 KQL 仪表板，以及可选且受门控控制的 Operations Agent）在 [references/business-analysis-workflow.md](references/business-analysis-workflow.md)（含附录 A–B）中进行了权威定义，并且仅当用户在阶段 12 的交接点选择加入时才加载。用户选择加入后，**不要凭记忆操作**——打开该文件并严格按照阶段 13–17 执行；控制器仍会跟踪并强制执行这些阶段、阶段顺序、强制停止点和确认门控（包括先创建仪表板再创建代理，以及阶段 16 的“我们是否真的需要代理？”门控）。

## 故障排除（面向用户）

- **“未生成 playbook”/无法计算某个字段** → 说明仅从概念上描述了字段。请添加明确的 KQL 物化查询，添加逐字段的 KQL 定义，确保警报规则引用实际的输出列，添加动态字段提取，并明确联接键/标识符。不要只是改写文字说明。
- **启动成功但未收到 Teams 警报** → 可能没有数据与规则匹配。切换到 POC/调试阈值；说明可能没有匹配到数据。在没有证据的情况下，不要暗示平台发生故障。

## 必须 / 建议 / 避免

### 必须
- 强制执行各阶段、硬性停止条件和确认关卡。
- 将 OAuth（UI 引导）与服务主体（自动创建或复用）严格分开。
- 创建前验证权限。
- 在执行关联前验证架构、动态字段、联接匹配情况和数据新鲜度。
- 在 Operations Agent 指令中提供明确的 KQL。

### 建议
- 解析连接时，优先使用服务主体（自动化），而不是 OAuth（UI 引导）；仅当服务主体不可用时才回退到 OAuth。
- 优先使用直接联接，而不是时间窗口关联。
- 优先使用实际发现的值，而不是任何猜测值。
- 优先使用业务语言进行确认，而不是提出技术问题。

### 避免
- 不要在面向用户的流程中依赖或提及 MCP。
- 不要将内部/未记录的 API 描述为受支持的 API。
- 不要声称可以通过公共 API 创建 OAuth 连接器。
- 不要捏造工作区、表、架构、ID 或查询结果。
- 不要索要密钥、OAuth 代码、令牌、Cookie 或 nonce。
- 如果仅存在时间窗口关联，不要声称存在因果关系。

## 示例

### 示例 1 — 接入 Azure Monitor 可观测性数据，然后检查业务影响
**用户：**“在我的 `Observability` 工作区中，将我们的 Azure Monitor / Log Analytics 可观测性数据（其中包含 Application Insights 表）接入 Fabric，然后告诉我上周的延迟峰值是否影响了结账转化率。”

**技能行为：**运行分阶段工作流——确认目标工作区并检查接入先决条件（可访问的 Azure Monitor / Log Analytics 数据源或连接）；如果缺少任何先决条件，则停止并明确列出缺失项。可观测性数据（包括 Application Insights 遥测表）接入并可查询后，发现工作区中的真实业务数据集，使用发现的键将延迟信号与转化 KPI 进行关联，并报告具体的业务影响结论（如果所需数据不可用，则报告错误）。绝不捏造工作区名称、表或查询结果，也绝不暴露令牌或连接内部信息。

### 示例 2 — 超出范围的创作请求
**用户：**“创建一个新的 Spark notebook，并构建一个 Delta 表管道来加载我的业务数据集。”

**技能行为：**拒绝超出范围的创作请求，不在 Fabric 中创建任何内容，并引导用户前往 `spark-cli` 中相应的创作模式，而不是接管该任务。