---
name: azmon-mirroredcatalogs-operations-cli
description: "Brings Azure Monitor, Application Insights, and Log Analytics telemetry into Fabric as Eventhouse external delta tables and correlates it with business data. Use to onboard observability data, judge whether latency or availability affected revenue, or build a Real-Time dashboard and Operations Agent over it."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: azmon-mirroredcatalogs-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=azmon-mirroredcatalogs-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头 — 但仍须添加。

# azmon-mirroredcatalogs-operations-cli

端到端指导用户完成以下操作：(1) 将 Azure Monitor / Application Insights /
Log Analytics 可观测性数据接入 Microsoft Fabric，作为 Mirrored Catalog
(AzMon) 项；(2) 通过将可观测性信号与业务数据（预订、订单、
客户、航班、支付、收入、租户、帐户、订阅、使用情况 KPI、SLA/可用性 KPI）相关联，
将这些遥测数据转化为**业务影响洞察**，最终生成可直接粘贴的
**Operations Agent** 指令。

这是一个**自包含的 Skills-for-Fabric 包**。它不依赖任何 MCP 服务器或工具控制器
作为执行机制。产品/API 知识、支持的流程、防护措施和建模规则位于此文件及
`references/*.md` 中。

## 前置知识

运行此技能之前，请阅读共享的常规指南：

- [身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition)
- [身份验证方案](../../common/COMMON-CLI.md#authentication-recipes)

## 触发短语

- 将 Azure Monitor 数据接入 Fabric
- 在 Fabric 中创建 Azure Monitor 项
- 将 Application Insights 连接到 Fabric
- 将 App Insights 遥测数据与业务数据相关联
- 将我的 LA 工作区接入 Fabric
- 将 Log Analytics 工作区接入 Fabric
- 连接 Log Analytics 工作区
- 了解服务可用性是否影响了预订
- 了解延迟是否影响了转化
- 将异常与收入或订单相关联
- 为 Azure Monitor 业务影响创建 Operations Agent
- 根据 Log Analytics 数据创建业务影响洞察

## 何时使用此技能（以及相关技能）

`azmon-mirroredcatalogs-operations-cli` 用于将 Azure Monitor /
Application Insights / Log Analytics 遥测数据接入 Microsoft Fabric
（`mirroredCatalogs` endpoint），将这些遥测数据与业务数据相关联，并
生成 Operations Agent 指令。对于与 Azure Monitor 接入无关的一般 Eventhouse / KQL
查询，请使用 `eventhouse-cli` 消费模式；对于创作 Eventhouse 项和数据库，请使用其创作模式。

## 参考索引

在相应阶段需要产品/API 详细信息时阅读以下内容。不要将它们完整粘贴到
用户响应中 — 它们是供你（代理）使用的指南。

| 参考资料 | 用途 |
|-----------|-----------|
| [references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md) | 支持的流程与仅限 UI 的流程；连接器模式；Fabric 项/代理界面 |
| [references/workspace-identity-connection-reference.md](references/workspace-identity-connection-reference.md) | 模式 B 工作区标识连接：预配/检测标识、用户授予的 LA RBAC、WorkspaceIdentity 连接 |
| [references/workspace-discovery-policy-reference.md](references/workspace-discovery-policy-reference.md) | 阶段 3 Fabric 工作区发现顺序、解释、用户提供的解析方式、作为最后手段的阻止 |
| [references/oauth-connection-reference.md](references/oauth-connection-reference.md) | 模式 B OAuth 连接：只读检测顺序、重用规则、UI 引导的创建步骤 |
| [references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md) | Mirrored Catalog 项 CRUD、定义、发现、监视、刷新 |
| [references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md) | Eventhouse/KQL、OneLake 快捷方式、可查询性要求 |
| [references/operations-agent-reference.md](references/operations-agent-reference.md) | Operations Agent 指令模板、验证、故障排除 |
| [references/telemetry-table-reference.md](references/telemetry-table-reference.md) | App Insights / OpenTelemetry / 自定义安全遥测表及其业务含义 |
| [references/app-insights-dynamic-fields-reference.md](references/app-insights-dynamic-fields-reference.md) | 动态字段（Properties/CustomDimensions）和隐藏的业务键 |
| [references/dashboard-reference.md](references/dashboard-reference.md) | Real-Time (KQL) Dashboard 创建/更新机制；通用磁贴模式 |
| [references/business-analysis-workflow.md](references/business-analysis-workflow.md) | 业务分析部分的完整详细信息 — 阶段 13–17（包括关联模式和建模附录）；在阶段 12 交接时加载 |

## 保密性与范围防护

- 不得向用户暴露 Azure Log Analytics 后端 API。
- 不得向用户暴露 Fabric / DMTS / Gateway 连接内部信息或内部端点。
- 不得请求或披露令牌、OAuth 重定向代码、OAuth nonce 值、Cookie、机密信息或内部实现细节。
- 在面向用户的流程中，任何地方都不得提及 MCP、MCP 服务器或 MCP 连接性/故障排除。本 Skill 是自包含的。
- 不得将未记录的、通过浏览器检查获得的或内部连接器 API 呈现为受支持的公共 API。
- 不得声称可以通过公共 API 创建 OAuth Azure Monitor 连接器 — OAuth 连接器创建**仅可通过 UI 引导完成**。
- 不得捏造工作区名称、表名称、架构、项 ID、连接 ID 或查询结果。只能使用实际发现/查询返回的值；否则应使用明确标注的占位符。
- 不得预先要求用户提供 JOIN 逻辑、KQL、分箱或阈值。
- 如果请求涉及 SQL / Data Warehouse 或 Lakehouse 摄取、仓库性能或一般 Fabric DW 最佳实践，且与 Azure Monitor / Application Insights / Log Analytics 接入无关，则应说明该请求**不在此 Azure Monitor Skill 的范围内**，并将用户引导至适当的仓库 Skill；不得对此采取行动、运行查询或创建资源。

### 与领域无关的规则

此 Skill 或其引用中任何位置出现的业务实体 — bookings、orders、customers、flights、revenue、tenants、payments 以及类似实体 — **仅为示例**。Skill **不得**从这些示例推断用户的业务领域。用户实际使用的业务实体**必须**从真实的 Fabric 数据（Eventhouse / KQL 数据库 / Warehouse / Lakehouse / shortcuts）中发现，并在使用前与用户确认。

明确来说：

- **示例仅用于说明。** 此 Skill 及其引用中的每个业务实体名称（例如 bookings、orders、customers、revenue、flights、tenants、payments）都是非规范性示例，不代表必须存在或预期存在的实体。
- **Skill 与业务领域无关。** 它适用于任何业务领域，且不预设任何领域。
- **Skill 不得根据说明性示例、碰巧类似于示例的表名或列名，或任何先前上下文，推断或假定用户的业务领域。**
- **必须从用户的实际数据中发现业务实体**；在发现并确认之前，**必须**将其泛称为*业务实体*、*业务数据集*、*业务 KPI* 或*业务结果*，而不得使用任何假定的特定领域名称。

## 执行能力策略

Skill 是一个分阶段的引导式工作流。

实际执行取决于当前环境中可用的能力。

仅允许针对 OAuth Azure Monitor 连接器创建提供门户引导式说明。

Skill **不得**将整个接入流程切换为门户引导式说明，作为通用的后备方案。

对于所有非 OAuth 阶段，Skill **必须**首先尝试发现当前环境中是否存在受支持的执行路径。

受支持的执行路径可能包括：

- Fabric REST API
- Azure REST API
- Fabric Actions
- Azure CLI
- Azure Resource Graph
- 通过经过身份验证的 `az rest --method get` 对
  `https://api.fabric.microsoft.com/...` 执行的 Fabric REST **只读**发现
  （仅限发现/只读操作）
- 代理可用的其他有文档记录的受支持功能

**Log Analytics REST API 参考（面向代理）。** 当 Skill 需要执行或验证 Azure Log Analytics 操作时，可以查阅官方的 [Log Analytics REST API](https://learn.microsoft.com/en-us/rest/api/loganalytics/) 参考，以确定受支持的 Log Analytics 管理、工作区、表、引入和查询 API。这仅是面向代理的指导，不会放宽上述保密规则。

这些执行路径彼此独立，**不得**混为一谈：

1. **Kusto / KQL 数据平面执行** — 遥测查询；可选，并且在禁用时**不得**使用。
2. **Azure ARM 控制平面发现** — 资源/元数据枚举。
3. **Fabric REST 控制平面发现** — 已公开的 Fabric REST / Fabric Actions 功能。
4. **任意 shell / CLI 执行** — 不在范围内（参见范围外约束）。
5. **通过经过身份验证的 `az rest --method get` 执行的 Fabric REST 只读发现** —
   一项范围狭窄且获准的例外，**仅**用于对
   `https://api.fabric.microsoft.com/...` 执行 Fabric 发现/读取操作。它仅允许 GET 操作，绝不会创建、更新、删除或修改任何内容，也绝不会暴露令牌、机密、身份验证标头或敏感负载。这**不是**通用 shell/CLI 访问。

仅 MCP 不可用**并不**意味着执行功能不可用。

任何单一执行路径不可用，**并不**会自动意味着该功能不可用。在声明某项功能不可用之前，Skill **必须**评估上述**所有**受支持的执行路径，并确认其中没有任何路径可用。只有在评估完每一条受支持的执行路径后，才能报告功能不可用。

如果不存在任何受支持的执行路径，Skill **必须**：

1. 停止。
2. 指出缺失的功能。
3. 解释为什么需要该功能。
4. 指出哪个阶段受阻。
5. 等待用户确认。

Skill **不得**：

- 用门户指导替代验证。
- 用门户指导替代 Mirrored Catalog 创建。
- 用门户指导替代发现、监控、刷新、快捷方式创建、架构验证或 Operations Agent 创建。
- 在执行功能不可用时声称操作已完成。


## 门户指导政策

Skill **应**优先选择自动化执行路径，而不是基于 UI 的指导：

- Fabric REST API
- Azure REST API
- Fabric Actions
- Azure CLI
- 其他受支持的自动化机制

在提供基于 UI 的指导之前，Skill **必须**：

1. 评估可用的执行路径。
2. 在存在可用路径时尝试使用受支持的执行路径。
3. 解释评估了哪些执行路径。
4. 解释为什么无法使用这些路径。

只有在完成上述步骤后，Skill 才可以提供 UI 引导式指导。

OAuth Azure Monitor 连接器创建仍然是明确支持的 UI 引导式场景，不需要进行上述评估。


## 严格分阶段工作流控制器（强制执行）

Skill **必须**作为严格的分阶段工作流控制器运行。

### 阶段

1. 意图和范围
2. Log Analytics 工作区选择
3. Fabric 工作区选择
4. 身份选择和验证
5. 连接解析
6. AzMon / Mirrored Catalog 项目创建或复用
7. **业务洞察捕获**（此处可选；可以推迟 — 在架构验证（阶段 12）之前**必须**捕获/确认意图）
8. Azure Monitor 表发现
9. Eventhouse / KQL 数据库**目标**选择（默认自动终结点与特定/新建 Eventhouse 之间进行选择）
10. 外部 Delta 表注册规划
11. 外部 Delta 表注册
12. 架构和数据验证
13. 业务数据发现和评分
14. 关联规划
15. 可选仪表板建议和创建
16. Operations Agent 指令生成（可选 — 受门控：仅当用户需要代理时）
17. 可选 Operations Agent 创建 / 验证

### 执行规则

- Skill **必须**跟踪并强制执行当前阶段。
- Skill **不得**跳过阶段。
- Skill **不得**在当前阶段完成之前进入下一阶段。

### 阶段可见性（每次面向用户的响应中均为必需）

每次响应都必须以以下结构开头，并使用**普通聊天文本**（不得使用代码块）：

- **当前阶段：** <阶段名称>
- **我发现的内容：** <简短摘要>
- **下一步：** <一项明确操作>

然后以邀请用户在继续之前进行确认的句子结尾（例如：
*“等待您的确认以继续。”*）。

如果当前阶段不明确 → **停止**并询问用户从哪里继续。

### 强制停止行为

在呈现任何需要确认的步骤后：

- **停止。**
- **等待**用户明确确认。
- 不得自动继续。

### 确认门控（在以下操作之前必须获得明确确认）

- 为流程选择身份（阶段 4）— 建议使用 Service Principal，但在验证之前**等待**用户选择。
- 创建或复用任何会修改 Fabric 的资源。
- 预配 Fabric 工作区身份并为其分配 Log Analytics 角色（阶段 5，模式 B 工作区身份选项）— 在每次写入操作之前**等待**。
- 选择 Eventhouse 目标（特定的现有 Eventhouse 或新建 Eventhouse）。
- 在所选 / 新建 Eventhouse 中创建快捷方式 — 明确展示目标 Eventhouse 以及将要创建的确切内容。
- 从架构验证（阶段 12）进入关联规划（阶段 14）。
- 创建或修改仪表板（先提出建议并**等待**批准）。
- 完全构建 Operations Agent（阶段 16）— 在生成任何指令之前，明确询问用户是否需要代理。如果用户不需要，则跳过阶段 16–17；流程可以在仪表板之后结束。
- 在尚未确认关联模型的情况下生成最终 Operations Agent 指令。
- 创建或修改 Operations Agent。

### 阶段防护措施

- 外部 Delta 表注册规划（阶段 10）MUST 在架构验证或联接逻辑之前进行。如果过早尝试架构或联接 → STOP 并返回阶段 10。
- 外部 Delta 表注册（阶段 11）MUST 在架构验证之前完成。
- 架构验证（阶段 12）MUST 在关联规划（阶段 14）之前完成。
- 如果无法通过已注册的外部 Delta 表在 Eventhouse 中查询数据 → STOP → 返回阶段 10/11。
- 在确认外部表可查询之前，MUST NOT 开始关联规划。
- 业务洞察捕获（阶段 7）MAY 提前回答，也可以 **deferred**，以便用户先探索其数据，但必须在**架构验证（阶段 12）**和关联规划之前捕获/确认意图（已提供意图，或已明确选择某个建议方向）。绝不要假设意图。

### 范围外约束

该 Skill MUST NOT 运行任意 shell/CLI/az/PowerShell 命令、执行网络调试、调查服务器连接性或执行基础设施故障排除。除非这些操作明确属于当前阶段，否则均属于范围外。

**狭义例外 — Fabric REST 只读发现。** 该 Skill MAY 使用经过身份验证的 `az rest --method get` 调用，仅用于 Fabric REST 只读发现，并且必须同时满足以下所有条件：

- 端点为 `https://api.fabric.microsoft.com/...`。
- HTTP 方法仅为 **GET**。
- 操作仅限于发现/只读操作。
- 不创建、更新、删除或修改任何内容（不得通过 CLI 操作 Fabric 项、快捷方式、镜像目录项或连接器）。
- 不暴露任何令牌、密钥、原始身份验证标头或敏感负载。
- 该 Skill 明确说明所使用的能力路径。

此例外不允许任意 shell/CLI 执行、非 GET 的 `az rest` 调用，或在已禁用时使用 Kusto / KQL 数据平面。

**狭义例外 — Fabric 工作区标识预配 + LA 角色分配（仅限模式 B）。** 在模式 B 工作区标识选项中，该 Skill MAY 使用经过身份验证的 `az` 调用来检测/预配工作区标识，并在调用者获得许可时为其分配 Log Analytics 角色，但仅限于：

- `GET https://api.fabric.microsoft.com/v1/workspaces/{id}`（检测），以及
- `POST https://api.fabric.microsoft.com/v1/workspaces/{id}/provisionIdentity`（预配）及其长时间运行操作的 GET 轮询，以及
- 在 Log Analytics 工作区范围内执行 `az role assignment list`（检查）和 `az role assignment create`，以向该标识授予 **Owner**，但前提是调用者在该范围内拥有 `Microsoft.Authorization/roleAssignments/write` 权限。

每次写入操作都必须经过确认门控（阶段 5），且仅涉及工作区标识及其 LA 角色（不涉及其他内容），不得暴露令牌/密钥/身份验证标头，并且该 Skill 必须说明所使用的能力路径。如果调用者缺少角色分配权限，该 Skill MUST NOT 强行执行分配——而应指示用户/管理员改为运行该分配操作。这不允许任何其他非 GET 的 `az rest` 调用，也不允许更广泛地使用 `az`。

### 响应风格（强制）

表现得像**引导式产品体验**，而不是后端调试工具。

- 使用简洁、适合业务场景的语言。
- 除非用户明确要求且该 API 有文档支持，否则绝不要展示内部实现步骤（CLI、REST、令牌、API 调用）。
- 绝不要在面向用户的输出中暴露内部限制（“公共 API 限制”“不支持 CredentialType”“无头 OAuth 失败”）。
- 绝不要索要机密信息、OAuth 代码、Cookie、重定向 URL、令牌或 nonce 值。
- 总结调查结果。除非用户明确要求，否则不要在面向用户的输出中暴露端点试验、API 探测、OpenAPI / schema 探索、重试调查或低层调试细节。
- 每个阶段结束后：提供简短总结，询问明确确认，**停止并等待**。

---

## 阶段 1 — 意图和范围

确认用户想要什么：将可观测性数据引入 Fabric、探索业务洞察，还是两者都要。用通俗语言记录他们已经提到的任何工作区名称或业务结果——但此时不要推动关联分析。

## 阶段 2 — Log Analytics 工作区选择

Application Insights 遥测数据通过其后端 Log Analytics 工作区进行查询（基于工作区的 Application Insights）。帮助用户选择正确的 Log Analytics / Application Insights 后端工作区。

- 如果用户没有提供工作区，询问订阅，然后提供受支持工作区的简洁列表（名称 + 资源组 + 位置）。
  绝不要暴露原始 API 响应。
- 当订阅中有许多工作区时，优先使用不区分大小写的名称筛选，而不是列出所有工作区。

### 未找到完全匹配名称时的回退流程（必需）

当用户指定了工作区名称但不存在**完全匹配**项时，Skill **不得**失败。相反：

1. 如果用户尚未提供订阅，询问订阅（不要猜测）。
2. 提供相似的工作区（名称中**包含**该词，或属于不区分大小写的近似匹配/部分匹配）。如果较窄的筛选没有返回结果，则扩大搜索范围。
3. 将候选项以简洁的编号列表呈现（名称 + 资源组 + 位置），然后**停止并等待**用户选择。
4. 如果只找到一个相似工作区，仍须在继续之前进行确认。
5. 如果没有找到任何工作区，明确说明，并询问其他订阅或搜索词。

绝不要编造工作区名称或 GUID——只能提供实际发现的工作区。

## 阶段 3 — Fabric 工作区选择

帮助用户选择目标 Fabric 工作区（显示名称 + id）。在适用时使用不区分大小写的子字符串筛选。此处为只读操作；不会创建任何内容。绝不要暴露原始 API 响应或令牌。

### Fabric 工作区发现与能力解析策略（必需）

Fabric 工作区**不是** Azure Resource Manager 资源，因此缺少自动枚举路径**并不意味着**不存在 Fabric 工作区。**绝不要提前终止工作流**：如果自动发现失败，询问用户提供 Fabric 工作区的**名称**、**ID** 或 **URL**，并在可用能力范围内进行验证，然后继续。绝不要自动选择工作区，绝不要编造工作区或验证结果；只有在所有发现机制和所有用户提供的解析路径都已耗尽后，才能将阶段 3 标记为 BLOCKED。

遵循
[references/workspace-discovery-policy-reference.md](references/workspace-discovery-policy-reference.md)
中的完整发现顺序、解释规则以及由 UI 引导的最终兜底边界。

## 阶段 4 — 身份选择与验证

### 身份选择（必须首先执行 — 等待用户）

验证**必须**针对实际执行该流程的**身份**进行，因此必须在任何验证检查**之前**选择身份，而不能推迟到阶段 5。不要静默复用 `az` 当前恰好登录的身份。

展示以下选项并停止 — 使用**普通聊天文本**提问（纯编号列表，不要使用代码块）：

我应该使用哪个身份来完成此次引导？

1. **服务主体（推荐）** — 自动化、无需交互；最适合可重复运行和 CI。需要租户 id、应用程序/客户端 id，以及安全提供的机密或证书。
2. **你的用户帐户（交互式登录）** — 如果你希望以自己的身份运行，或者无法使用服务主体。

邀请用户回复 **1** 或 **2**；并说明推荐使用服务主体。

- **推荐使用服务主体**，但由用户自行选择。如果用户要求以自己的身份登录，则允许交互式用户登录，并以该用户身份继续。
- 选择后，确认实际生效的身份（例如 `az account show`），确保验证针对正确的主体运行。如果实际身份与所选身份不匹配，则停止并先解决登录问题，再执行验证。
- 继续使用所选身份：阶段 5 的连接解析以及之后所有修改 Fabric 的操作都必须使用同一身份。

### 针对所选身份进行验证

在进行任何创建操作之前，验证以下事项（针对该身份）：

- 工作区存在。
- **所选身份**拥有所需的 Log Analytics 访问权限。
- **所选身份**拥有足够的 Fabric 工作区权限来执行操作（对于服务主体，还必须启用租户设置 *"Service principals can use Fabric APIs"*）。
- 提前说明：后续的连接检测/复用要求所选身份在 Azure Monitor 连接上拥有**某个角色**（拥有 **User** 角色即可；不要求 **Owner**），以便在此处发现权限缺口，而不是等到阶段 5 才发现。
- 对于阶段 5 中的 Mode B **工作区身份**连接选项，所选身份必须是工作区 **Admin**（配置工作区身份时必需）。当调用方在 LA 范围上拥有角色分配权限（**Owner** / **User Access Administrator**）时，Skill 可以自行分配该身份的 Log Analytics 角色；否则应指导用户完成分配。必须提前说明这两种情况。

如果验证失败，请以用户能够理解的方式总结哪些检查已通过/失败，解释缺少的能力，并提供以下选项：尝试另一个工作区、授予缺失的权限，或切换身份。请参阅
`references/azmon-fabric-api-reference.md`，了解支持的范围规则。

### 验证能力发现（必须执行）

在声明验证能力不可用之前，Skill **必须**确定环境是否提供以下任一能力：

- Fabric REST APIs
- Azure REST APIs
- Fabric Actions
- Azure CLI
- Azure Resource Graph

MCP 可用性只是可能的执行路径之一。

只有在评估所有受支持的执行路径并确认没有任何可用路径后，Skill 才**必须**报告验证能力不可用。

在声明验证能力不可用之前，Skill **必须**：

1. 确定是否存在其他受支持的执行路径。
2. 使用当前环境中所有可用的受支持机制，尝试发现能力。
3. 只有在评估完所有受支持的机制且确认没有任何机制可用后，Skill 才可以声明该能力不可用。

## 阶段 5 — 连接解析

支持两种连接模式。**优先使用服务主体（模式 A）**——即自动化、非交互式路径——作为默认方式。仅当服务主体不可用或用户明确请求时，才回退到 **OAuth（模式 B）**。保持两种模式**相互独立**。绝不要通过服务主体逻辑处理 OAuth，也绝不要通过 OAuth / 交互式登录逻辑处理服务主体。权威连接器规则，以及**准确记录的连接 API 端点和请求负载结构**（List / Get / Create Connection + List Supported Connection Types），请参阅
[references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md)。使用其中记录的结构——**不要**猜测连接负载，也不要去查找通用文档。当 Azure Monitor 连接器的准确 `type` / `creationMethod` / `parameters` 未知时，应从 `supportedConnectionTypes` 端点解析，而不是自行假设。

### 模式选择（必须遵循的顺序）

身份已在**阶段 4（身份选择）**中选定并完成验证。此处使用该身份——除非用户更改身份，否则不要再次提示。将所选身份映射到其连接模式：

1. **服务主体 → 模式 A。** 如果同一 Log Analytics 工作区中已存在匹配的服务主体连接器，则复用该连接器。否则，当所需的服务主体输入可用时（租户 id、应用程序/客户端 id，以及通过安全方式提供的机密/证书引用），自动创建或复用服务主体连接器——无需 UI 步骤。
2. **用户 / 交互式 → 模式 B。** 当用户选择以自己的身份登录、服务主体不可用或租户不允许使用服务主体时使用。在模式 B 中，首先提示用户选择连接身份验证方法——交互式 OAuth 或工作区身份（请参阅下面的“模式 B — 选择连接身份验证”）——然后路由到相应的子分支。

### 连接可见性注意事项（适用于两种模式）

要能够被**发现**，连接必须至少有一个角色分配给调用身份——无论该身份是**服务主体**（模式 A）还是**用户**（模式 B）。任何已分配的角色都会使连接出现在列表中并可被复用；**User** 角色足以用于检测和复用，只有在**管理 / 修改 / 删除**连接时才需要 **Owner**。如果调用者在某个连接上**没有任何角色**，API 将不会返回该连接——这是**设计如此**，而不是失败。

因此，如果搜索**未找到**任何匹配的连接，Skill **不得**立即得出该连接不存在的结论。它**必须首先考虑**该连接可能确实存在，只是由于当前身份在该连接上没有任何角色，因此对当前身份而言是**不可见的**，并且：

- 说明对于**当前身份**未找到匹配的连接，并指出这可能意味着以下任一情况：(a) 不存在此类连接；或 (b) 存在此类连接，但调用方 Service Principal / 用户在该连接上**没有任何角色**。
- 建议在现有的 Azure Monitor 连接上为 Service Principal 或用户分配**一个角色**（针对同一个 Log Analytics 工作区）——分配 **User** 角色即可满足检测和复用的要求——然后重新运行检测。（如果为 Service Principal 授予较低权限的角色后仍然无法看到该连接，请参阅
  [references/azmon-fabric-api-reference.md](references/azmon-fabric-api-reference.md) 中关于 Service Principal 的说明。）
- 只有在说明了这种权限可能性之后，Skill 才可以继续创建新连接器（Mode A）或遵循 OAuth 一次性创建指南（Mode B）。

绝不得伪造连接，或在没有真实列表匹配项的情况下声称某个连接存在。

### 门户指导边界

门户指导**仅**允许用于创建 OAuth Azure Monitor 连接器。

以下操作**不允许**使用门户指导作为备用方案：

- LAW 验证
- Fabric 工作区验证
- 连接检测
- 连接复用
- Service Principal 连接器创建
- Mirrored Catalog 项创建
- 发现
- 监控
- 刷新
- Eventhouse 快捷方式创建
- 架构验证
- Operations Agent 创建

如果缺少执行这些操作的能力，Skill **必须**停止并指出缺少的能力。

### Mode A — Service Principal（自动创建或复用，默认模式）

将此模式表述为**“使用 Service Principal 连接”**——自动化的非交互式路径（无需用户登录，也无需 UI 步骤）。这是首选的默认模式；应在 OAuth 之前尝试此模式。

- **幂等创建或复用**：如果针对同一个 Log Analytics 工作区，已经存在匹配的 Azure Monitor Service Principal 连接器（相同的数据源路径 + Service Principal 凭据类型），则复用该连接器——绝不创建重复连接器。
- 每次运行只创建**一个**连接器。
- 在此模式下，**绝不**复用非 Service-Principal 连接器（例如 OAuth 连接器）。
- **绝不**要求用户将客户端密钥粘贴到聊天中。密钥只能来自**环境变量或 Key Vault 引用**，不得回显、记录、暴露或包含在生成的说明中。
- 如果缺少必需的 Service Principal 输入，请仅通过存在性检查说明**缺少的内容**（租户 ID、应用程序/客户端 ID，以及安全提供的密钥引用）——绝不要在聊天中请求密钥值。只有在无法提供 Service Principal 输入时，才回退到 OAuth（Mode B）。

自动化边界：基础设施（连接器创建或复用、镜像项创建）由自动化完成；**业务决策**（Eventhouse/KQL DB 选择、快捷方式创建）始终需要用户明确确认。

### 模式 B — 选择连接身份验证方式（必需提示）

当所选身份为 User / interactive（模式 B）时，可以通过两种方式创建连接。在检测或创建任何内容之前，先以**普通聊天文本（纯编号列表，不要使用代码块）**呈现以下选项，然后停止并等待用户回答：

我应如何对 Azure Monitor 连接进行身份验证？

1. **交互式登录（OAuth）** — 你在 Fabric → Manage
   Connections 中登录一次；连接使用你的组织帐户。
2. **工作区身份（无机密）** — 使用 Fabric 自动管理的工作区身份作为凭据；你需要授予它对 Log
   Analytics 工作区的访问权限。不需要处理任何机密。

将请求路由到下面匹配的子分支 — **1 → 模式 B（OAuth）**，**2 → 模式 B
（工作区身份）**。严格保持这两个分支彼此独立。如果用户没有偏好，说明工作区身份可以避免交互式登录和机密处理，但必须等待用户选择 — 绝不能自动选择。

### 模式 B — OAuth（仅限 UI 引导，备用方式）

当用户选择上面的选项 1 时使用此子分支，也就是说，仅当 Service
Principal（模式 A）不可用或用户明确请求 OAuth 时使用。OAuth 连接的**创建**仅限通过 UI 引导（Fabric → Manage Connections）完成 — Skill 绝不会通过 API 创建连接；它只会以只读方式**检测并复用**现有连接，并且仅当 Log Analytics 工作区完全匹配时才会复用。

遵循 [references/oauth-connection-reference.md](references/oauth-connection-reference.md) 中规定的完整检测顺序、复用规则和面向用户的措辞。
严格保持此分支与模式 A 彼此独立。

### 模式 B — 工作区身份（无机密）

当用户选择上面的选项 2 时使用此子分支。使用 Fabric 自动管理的**工作区身份**作为连接凭据（无机密）。如果需要，此流程会预配该身份，确保其拥有足够的 Log Analytics 角色 — **当调用方获得许可时自动分配，否则指导用户完成分配** — 然后创建连接。

遵循 [references/workspace-identity-connection-reference.md](references/workspace-identity-connection-reference.md) 中规定的完整顺序、端点、门控条件和负载。
关键门控条件：预配身份需要确认（调用方必须是工作区 **Admin**）；当调用方拥有角色分配权限时，Skill 会分配 LA 角色（否则 Skill 会进行指导并等待确认）— 两项写入操作都需要确认；然后使用 `WorkspaceIdentity` 凭据类型创建连接。严格保持此分支与模式 A 彼此独立。

## 阶段 6 — AzMon / 镜像目录项的创建或复用

在目标 Fabric 工作区中创建 Azure Monitor **镜像目录**项，或复用现有的匹配项。这是会修改 Fabric 的操作 → 必须先确认。受支持的镜像目录操作（项 CRUD、定义、发现、监控、刷新）记录在
[references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md) 中。

### 服务主体项目创建（重要——优先复用；已观察到的回退行为）

根据 Microsoft Learn，**Create Mirrored Catalog** API 将 **service principals
and managed identities** 列为支持创建操作的身份，因此，服务主体创建**有文档明确支持**，并非绝对的平台限制。

> **已观察到的回退行为。** 尽管如此，一些服务主体运行仍然发现，在仅应用程序令牌下，项目**创建**会被拒绝（底层项目创建路径可能以**代表用户**的方式运行）。应将此视为已观察到的租户行为，而非有文档规定的规则，并保持符合文档的默认行为：尝试在服务主体下创建，只有在创建调用确实**被拒绝或不可用**时，才回退到用户（委托）/ UI 上下文。

项目存在后，获取、列出、**更新**、发现、监控、刷新和快捷方式操作均可在仅应用程序的服务主体令牌下正常运行。

因此，在服务主体下运行时，Skill **必须**：

- **优先复用**——复用服务主体能够查看和操作的现有 Azure Monitor Mirrored Catalog 项目（及其现有连接）。这是首选路径：基于已创建的项目和连接继续操作，而不是创建新项目。之后，服务主体即可正常**更新**和操作该项目。
- 如果不存在可复用的项目，**尝试在服务主体下创建项目**（创建 API 的文档明确支持服务主体/托管标识）。只有当该创建操作**被拒绝或不可用**时（即上述已观察到的回退情况），才在用户上下文中创建项目——可以通过 **Fabric UI**，也可以通过**用户（委托）登录**——并且最好基于现有项目和连接进行初始化。项目存在后，服务主体即可在该项目上恢复自动化流程（更新、发现、监控、刷新、快捷方式）。
- 如果创建实际发生在用户/UI 上下文中，绝不得声称该项目是由服务主体创建的。

项目存在后，下游 Mirrored Catalog 操作（更新、发现、监控、刷新）仍可供服务主体使用。

### 通过 scope 选择表（选择项目镜像哪些表）

项目不会接收任意的表名列表——它通过定义中的命名空间层级路径 **`scope`** 进行镜像，而该 scope **必须**是 List Scopes 发现 API 返回的 **`Selectable`** 值。若要仅定位到用户所需的表：

- 调用 **List Scopes** 并为项目选择一个 `Selectable` scope。如果用户已经知道目标表，请选择能够覆盖这些表的**最窄 `Selectable` scope**。如果目前还没有明确意图（用户希望先进行探索），则创建时使用**更宽泛的 scope**，并在明确意图后，通过更新项目定义，酌情将 scope 重新限定得更窄。只能使用实际返回的 scope 值——绝不得捏造 scope 或表名。
- 如果可用的最窄 `Selectable` scope **仍然比请求的集合更宽**，项目还会镜像该 scope 下额外的同级表——镜像无法排除单个同级表。必须明确说明这一点，并在创建前获得明确确认。
- 对于现有/复用的项目，在假定其符合请求之前，先读取其当前定义中的 scope；不要捏造定义字段。

### 默认镜像集（必需的起点）

除非用户另有指定，**默认要镜像的表集合**是同时满足以下条件的所有表：这些表 (a)
出现在真实的 **List Scopes / Discovery** 输出中，并且 (b)
匹配以下名称前缀之一（不区分大小写；兼容 `_CL`
自定义表后缀）：

- `App*` — Application Insights 表
- `OTel*` — OpenTelemetry 原生表（例如 `OTelLogs`）
- `XD*` — 自定义的安全相关日志表

然后在创建之前**询问用户是否需要添加其他表**（确认闸门——展示解析后的集合并等待）。

- 仅针对**真实发现的表**匹配前缀——绝不臆造表。
  如果某个前缀没有匹配到任何表，则静默忽略。
- 将默认集合解析为能够涵盖所有匹配表的**最窄单一 `Selectable` 作用域**。如果该作用域还会额外拉取
  默认集合之外的**同级表**，则**明确列出**这些额外表，说明无法单独排除同级表，并在创建之前获得确认。一旦获得确认，这些额外表就是**预期结果**——在第 8 阶段的相等性检查中不应视为失败。
- 添加用户请求的表可能会扩大所选作用域——重新解析并再次披露。
- 如果 `App*` / `OTel*` / `XD*` 中**没有任何一个**匹配到已发现的表，则改为展示所有/有代表性的已发现表（先探索），让用户选择。
- **`XD*` 安全表**只有在工作区通过第 4 阶段验证（受支持且已验证的工作区）后才会被考虑；不受支持的工作区阻止操作优先，绝不能使用表选择来绕过该阻止。
- **复用时：**读取现有项目当前的作用域，并将其镜像表集合与默认集合进行比较。如果未完全覆盖，则提出**重新设置作用域**（更新项目定义），以添加缺失的 `App*`/`OTel*`/`XD*` 表，并披露任何额外的同级表——绝不静默地重新设置作用域；必须先获得确认。

已确认的集合（默认集合 + 已确认的同级表 + 用户添加的任何表）将成为第 8 阶段请求集合与镜像集合相等性检查中的**预期集合**。

### 首次镜像延迟（披露——必需）

对于**首次镜像的工作区**，应提前告知用户：项目创建后，镜像表及其数据通常需要**大约 5 分钟**才能完成物化并可供查询。在此之前，发现/查询可能返回空结果或不完整结果——这是**预期现象**，不是错误。在此时间窗口内不要断定表缺失：应验证镜像/刷新状态，等待后重新检查，再得出结论。

项目创建或复用后，如果用户已经有目标，可以选择立即捕获业务意图
（第 7 阶段）；否则继续进行表发现和探索，并在架构验证之前捕获意图（第 12 阶段）。

## 第 7 阶段 — 业务洞察捕获（此处可选；可延后）

如果用户已经有业务问题，现在就捕获该问题，以便根据它指导表发现
（第 8 阶段）和 Eventhouse 评分（第 9 阶段）。如果没有，
此阶段此时**可以暂缓**——用户可以先探索其数据
（第 8–11 阶段），之后再提供意图。无论如何，在架构验证（第 12 阶段）和关联分析（第 14 阶段）之前，意图都是**必需的**；提前捕获意图只是为了优化流程，使发现过程更有针对性。

在捕获意图时，请使用业务语言提问，例如：

- 服务可用性问题是否影响了预订？
- 请求延迟是否降低了客户转化率？
- 异常是否影响了收入或订单？
- 依赖项故障是否影响了特定客户、租户、区域或航班？
- 事件是否影响了 SLA、使用量或客户活动？
- 流量下降是否与使用量 KPI 下降相关？

### 强制要求

在满足以下任一条件之前，Skill **不得**继续执行架构验证（Stage 12）或业务
**关联**（Stage 14）：

- (a) 用户提供了业务意图，或
- (b) 用户明确选择了建议的方向。

意图可以在此处提供，也可以在探索之后提供，但在 Stage 12 之前必须存在。绝不
得假设意图。

### 备用方案（用户不确定 / 表述模糊 / 没有完全匹配项时）

建议 3–5 个方向，每个方向都应按照**可观测性信号 → 业务影响**的形式表述，并请用户选择其中一个：

1. 可用性故障 → 预订完成率影响。
2. 请求延迟 → 转化率或结账量下降。
3. 异常 → 失败订单或面临风险的收入。
4. 依赖项故障 → 客户 / 租户 / 区域影响。
5. 流量下降 → 使用量 KPI 下降。

### 重要区别

尽早捕获意图是**允许但可选的**——但在架构验证（Stage 12）之前必须存在。无论哪种
情况，Skill **都不得**立即生成关联逻辑。只有在快捷方式存在、架构已验证、数据可查询、
动态字段已检查、连接候选项已验证且数据新鲜度已检查之后，才能生成关联逻辑
（Stages 10–14）。

## Stage 8 — Azure Monitor 表发现

浏览候选的 Azure Monitor / Application Insights 表。**如果已捕获业务目标
（Stage 7），**则筛选与其相关的表。**如果尚未有意图（先探索），**则展示所有已发现的表或
具有代表性的已发现表，供用户浏览。只能使用实际发现的范围/表值——绝不捏造表名。使用
[references/telemetry-table-reference.md](references/telemetry-table-reference.md)
以业务术语解释每个表的含义，以及哪些表最适合所述目标（或在探索时说明每个表所提供的内容）。

### 发现 API 备用策略（必需）

**首选**发现机制是 Mirrored Catalog Discovery APIs。如果发现结果看起来不完整，切勿立即
断定缺少表，或切换到其他元数据路径。首先：

1. 验证镜像状态。
2. 验证刷新 / 同步状态。
3. 验证发现范围。
4. 重试发现。

只有完成这些检查后，Skill 才可以评估其他元数据路径。请参阅
[references/mirrored-catalog-reference.md](references/mirrored-catalog-reference.md)。

### 请求集合与镜像集合的相等性检查（请求了特定表集合后必需）

一旦存在**请求的表集合**，就适用此检查——无论该集合是在一开始指定的，还是在之后
捕获意图时指定的。当默认镜像集合（Stage 6）或用户调整后的集合生效时，该集合就是本次
检查中的**请求集合**；根据最窄公共范围规则披露并确认的任何同级表都属于**预期内容**
（应与所选范围的预期内容进行比较，而不是与一个简单的表列表进行比较——不要将已确认的
同级表报告为失败）。当用户请求了特定的表集合时，验证该项是否**恰好**镜像该集合——
使用相等性，而不是子集（“我的表已存在”并不足够）。将实际镜像的表集合（来自 Discovery /
Monitoring）与**请求集合**进行比较，并报告结果：

- **存在额外表** → 所选范围比请求的范围更宽泛。报告这些额外表；如果存在更窄的 `Selectable` 范围，则提供重新限定范围的选项；否则说明源仅公开了更宽泛的范围，因此这些额外表无法避免。
- **缺少请求的表** → 镜像可能尚未完成物化。核实镜像/刷新状态，运行 **刷新/同步**，等待后再重新检查 — 不要过早断定这些表不存在。
- **完全匹配** → 确认并继续。

切勿臆造镜像表集合；只能根据真实的 Discovery /
Monitoring 结果列举。

## 阶段 9 — Eventhouse / KQL 数据库目标选择

询问用户哪个 Eventhouse 应承载 LA 表快捷方式。将以下选项作为**普通聊天文本（而不是代码块）**展示，并要求明确确认：

- **A — 某个特定的现有 Eventhouse**（例如，已经存放了希望与之进行关联的业务数据的 Eventhouse）。Skill 会在**该 Eventhouse 中**创建 LA 表快捷方式，将遥测数据与业务数据置于同一位置。
- **B — 新建 Eventhouse。**Skill 会创建该 Eventhouse 及 LA 表快捷方式；其初始为空。

这两个选项都可写入，并支持 Operations Agent 路径（可以承载
`IncidentBins` 物化）。

运行 **Eventhouse Recommendation Mode** 以辅助选择 — 发现可用的 Eventhouse，检查其内容（表、快捷方式、KQL 数据库），并根据相关业务表、相关遥测表、现有快捷方式、可查询表、KQL 数据库可用性和数据新鲜度为每个 Eventhouse 评分。**当用户的目标是将遥测数据与现有业务数据进行关联时，推荐选项 A**（将数据置于同一位置）；否则，新建 Eventhouse 是一个干净的起点。
以普通聊天文本的形式展示：

- **推荐目标：** <A ‹EventhouseName› | B 新建>
- **原因：** <原因>
- **备选方案：** <列表>

Skill **不得自动选择**。展示推荐结果，准确说明将创建的内容，并要求明确确认。请参阅
[references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md)。

## 阶段 10 — 外部 Delta 表注册规划

在进行任何架构验证或连接逻辑之前，为已解析的表集合规划将其注册为**外部 Delta 表**，目标为**所选/新建的 Eventhouse** — 在规划标题中注明目标 Eventhouse — 。展示规划并**停止以等待确认**。

关键规则（详见快捷方式参考文档）：

- KQL 数据库中的可查询性来自将每个表注册为指向镜像项 OneLake
  `Tables/dbo/<Table>` 路径的**外部 Delta 表** — **不是**来自 Core Shortcuts API（该 API 只创建链接）。通过 `external_table('<name>')` 进行查询。
- 对每个表进行规划：确切名称、OneLake `Tables/dbo/<Table>` 路径、目标 KQL 数据库，以及将从该表的 Delta 日志读取架构。

### 查询加速策略 — 外部 Delta 表（必须 — 始终为 `true`）

查询加速是**外部 Delta 表上的策略**（通过
`.alter external table … policy query_acceleration` 设置），**不是快捷方式对象属性**。每个注册的外部 Delta 表都必须启用**加速（`true`）** — 不可选。规划表中需包含 `Acceleration Enabled (always Yes)` 列；如果环境不支持该功能，必须明确说明，而不是在未设置该策略的情况下进行注册。完整策略请参阅
[references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md#external-delta-table-query-acceleration-policy-must--always-true)。

## 阶段 11 — 外部 Delta 表注册

仅在获得明确确认后，才将每个表注册为目标 KQL 数据库中的**外部 Delta 表**（报告所使用的数据库）：从其 Delta 日志读取表架构，将 Delta 类型映射为 Eventhouse 类型，然后通过 `POST {clusterUri}/v1/rest/mgmt` 运行 `.create external table
['<Table>'] (<cols>) kind=delta ( h@'<OneLake Tables/dbo/<Table> path>;impersonate' )`。随后使用 `.show external tables` +
`external_table('<Table>') | take 1` 进行验证。Core Shortcuts API **不是**实现可查询性的必需项（它只会创建链接）。如果某个表不可查询 → 停止并返回规划 / 注册阶段。有关架构读取、类型映射和命令模板，请参阅
[references/eventhouse-shortcuts-reference.md](references/eventhouse-shortcuts-reference.md)。

注册任何外部 delta 表时，**始终启用查询加速策略 (`true`)**，具体参见
[查询加速策略](references/eventhouse-shortcuts-reference.md#external-delta-table-query-acceleration-policy-must--always-true)，
并报告最终状态（预期：已启用）。

## 阶段 12 — 架构和数据验证（关联分析前的必需步骤）

切勿基于假设或截图构建关联逻辑。在提出任何连接、分箱或阈值之前，必须针对**实际的** KQL 数据库进行验证。业务意图**必须**已经在此阶段之前完成记录 / 确认——如果在阶段 7 延后，则现在使用阶段 7 的问题 / 备用方案完成记录，然后再继续，因为下方的遥测源选择会根据目标相关性进行评分。切勿假设意图。

### 前置条件

1. Eventhouse / KQL 数据库中已有可用的运营遥测表。
2. 业务表位于同一数据库中，或可通过快捷方式查询。
3. 表是**可查询的**，而不只是显示在 OneLake 中。
4. 已通过 `getschema` 获取架构。
5. 已检查并采样动态字段。
6. 已从顶层列和动态列中提取候选连接键。
7. 已通过**非零**匹配结果验证连接键（当提议直接连接时）。
8. 已验证数据新鲜度。
9. 时间窗口已与真实数据范围对齐。
10. 已根据真实数据确认相关分类值（当规则依赖这些值时）。

### 步骤

> **查询约定。** 镜像的遥测表是**外部表**——通过 `external_table('<name>')` 查询（它们不会出现在 `.show tables` 中）；Eventhouse 中的**托管表**使用其裸名称。

1. **获取真实架构。** 对于每个表：
   `external_table('<TableName>') | getschema | project ColumnName, ColumnType`。
   使用权威的列名称 / 类型——不要使用根据截图或表名猜测的名称。
2. **检查并采样动态字段。** 业务连接键通常嵌套在动态列中（`Properties`、`CustomDimensions`、`Details`、`Measurements`、`Payload`、`Context`）。采样行并检查键。请参阅
   [references/app-insights-dynamic-fields-reference.md](references/app-insights-dynamic-fields-reference.md)。
3. **提取候选业务标识符**，使用明确的 KQL
   (`tostring(Properties.BookingId)`，并通过 `coalesce` 提供大小写回退方案)。
4. **根据真实数据验证连接键。** 证明候选键可以连接——运行连接并确认非零匹配结果：

```kusto
   external_table('AppEvents')
   | extend BookingId = tostring(Properties.BookingId)
   | where isnotempty(BookingId)
   | join kind=inner (Bookings | project BookingId = tostring(BookingId)) on BookingId
   | summarize MatchedRows=count(), DistinctBookings=dcount(BookingId)
   ```

   非零 → **直接连接，高置信度**。零 → 键错误或数据不存在
   重叠；查找真实的键。
5. **检查新鲜度并对齐时间窗口。**
   `external_table('<TableName>') | summarize Rows=count(), MinTime=min(TimeGenerated), MaxTime=max(TimeGenerated)`。
   不要假设使用 `ago(1h)`；应使用覆盖实际数据范围的时间窗口，并以用户能够理解的方式
   进行说明。
6. **确认规则中使用的分类值**
   (`external_table('<Table>') | summarize count() by <field>`)，以确保影响规则
   使用真实的类别。

### 遥测源选择框架（必需）

遥测源选择 MUST **以数据为依据**。在选择关联模型之前，Skill MUST 检查发现的
**所有**候选遥测源（例如 AppEvents、AppExceptions、AppRequests、AppDependencies、AppTraces、AppPageViews、
AppBrowserTimings、AvailabilityResults 以及存在的任何其他遥测源）——
而不只是其中一个。

为每个候选遥测源按照以下指标评分：

1. 已发现的业务标识符。
2. 动态字段的丰富程度。
3. 直接连接的置信度。
4. 已验证的匹配数量。
5. 业务流程上下文。
6. 与所选业务目标的相关性。

选择得分最高的遥测源。Skill MUST NOT 自动优先选择
AppExceptions，也 MUST NOT 自动优先选择 AppEvents —— 获胜者应当是根据真实数据
进行评分后得分最高的源。

### 退出条件（强制）

在进入阶段 14 之前，以下条件 MUST 全部满足：已通过 `getschema` 获取架构；在使用直接
连接时，连接键已通过非零匹配进行验证；已验证新鲜度并对齐时间窗口；已确认相关的分类值。如果任一条件失败 → **停止**，
不要继续。

### 交接（强制）

提供一份简洁的摘要（已验证的连接键、匹配结果、业务影响（如有）、数据时间窗口）。然后询问：“是否要基于此已验证模型继续进行业务分析（影响建模、仪表板，以及可选的 Operations Agent）？”**硬停止**并等待。确认后，继续执行
[references/business-analysis-workflow.md](references/business-analysis-workflow.md) 中定义的阶段 13–17。

## 阶段 13–17 —— 面向业务的分析（在参考文档中定义）

面向业务的分析部分（业务数据发现/评分、关联规划、可选的实时 KQL 仪表板，以及可选的、经过门控的 Operations Agent）由
[references/business-analysis-workflow.md](references/business-analysis-workflow.md)
（含附录 A–B）权威定义，并且仅在用户于阶段 12
交接处选择加入后加载。选择加入后，**不要凭记忆执行** —— 打开该文件，并严格按照其中的
阶段 13–17 执行；控制器仍会跟踪并强制执行这些阶段、它们的顺序、硬停止和确认门控（包括先仪表板后 Agent，以及阶段 16 中的“我们是否真的需要 Agent？”门控）。

## 故障排除（面向用户）

- **“未生成操作手册”/无法计算某个字段** → 说明指令只是从概念上描述了字段。添加明确的 KQL 物化查询，为每个字段添加 KQL 定义，确保警报规则引用实际的输出列，添加动态字段提取，并明确连接键/标识符。不要只是改写 prose。
- **启动成功但没有收到 Teams 警报** → 可能是没有数据匹配该规则。切换到 POC/debug 阈值；说明可能没有数据匹配。没有证据时，不要暗示平台故障。

## 必须 / 优先 / 避免

### 必须
- 强制执行各阶段、硬停止和确认门控。
- 严格区分 OAuth（UI 引导式）和 Service Principal（自动创建或复用）。
- 在创建之前验证权限。
- 在关联之前验证架构、动态字段、连接匹配情况和数据新鲜度。
- 在 Operations Agent 指令中提供明确的 KQL。

### 优先
- 在连接解析方面，优先使用 Service Principal（自动化），仅在 Service Principal 不可用时回退到 OAuth（UI 引导式）。
- 优先使用直接连接，而不是基于时间窗口的关联。
- 使用实际发现的值，而不是任何猜测的值。
- 使用业务语言进行确认，而不是提出技术问题。

### 避免
- 不要在面向用户的流程中依赖或提及 MCP。
- 不要将内部/未公开的 API 作为受支持的 API 提供。
- 不要声称可以通过公共 API 创建 OAuth 连接器。
- 不要捏造工作区、表、架构、ID 或查询结果。
- 不要索要机密、OAuth 代码、令牌、Cookie 或 nonce。
- 仅存在基于时间窗口的关联时，不要声称存在因果关系。

## 示例

### 示例 1 — 接入 Azure Monitor 可观测性数据，然后检查业务影响
**用户：**“在我的 `Observability` 工作区中接入 Azure Monitor / Log Analytics 可观测性数据（其中包含我们的 Application Insights 表）到 Fabric，然后告诉我上周的延迟峰值是否影响了结账转化率。”

**Skill 行为：**运行分阶段工作流——确认目标工作区，并检查接入前提条件（可访问的 Azure Monitor / Log Analytics 源或连接）；如果缺少任何前提条件，则停止并明确列出缺失项。可观测性数据（包括 Application Insights 遥测表）接入并可查询后，在工作区中发现实际的业务数据集，使用发现的键将延迟信号与转化 KPI 进行关联，并报告具体的业务影响结论（如果所需数据不可用，则报告错误）。它绝不会捏造工作区名称、表或查询结果，也绝不会暴露令牌或连接内部信息。

### 示例 2 — 超出范围的创作请求
**用户：**“创建一个新的 Spark notebook，并构建一个 Delta 表管道来加载我的业务数据集。”

**Skill 行为：**拒绝超出范围的创作请求，不在 Fabric 中创建任何内容，并引导用户转到 `spark-cli` 中适当的创作模式，而不是接管该任务。