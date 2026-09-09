---
name: onelake-catalog-govern-cli
description: "Governs Microsoft Fabric OneLake catalog health, protection, and trust through Fabric Admin, Core, and Power BI REST APIs. Use for tenant or owner-scoped audits and guarded remediation of domains, workspace assignment, capacity, labels, tags, descriptions, refresh, and item identity. Catalog item discovery belongs to search-consumption-cli."
---
> **Telemetry — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: onelake-catalog-govern-cli`（`az rest`：`--headers "x-ms-fabric-skill=onelake-catalog-govern-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数，但仍需添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选

# OneLake Catalog Govern — CLI（模式调度器）

一个技能覆盖整个 OneLake Catalog **Govern** 系列。治理角色的详细信息位于四个按需加载的**模式参考文档**中。此顶层文件仅用于完成以下三件事：

1. **选择模式**（见下表）。
2. **明确安全边界和不可逆写入闸门**，确保它们不会在较大的参考文档中被弱化（见[不可逆操作](#step-2--irreversible-operations--must-do-gates-read-before-any-write)）。
3. **仅加载一个模式参考文档**并遵循其中的说明。

## 必须/优先/避免

### 必须执行

- 在任何修复操作之前，先针对调用者的权限层级执行审计单元。
- 在每次破坏性、不可逆或广泛写入之前，应用第 2 步中的特定于操作的确认闸门。
- 使用所选流程中记录的确切 Fabric Admin、Core、Power BI 或 Graph API 接口；不要将 `401` 或 `403` 视为绕过 RBAC 的许可。
- 对每项治理统计说明范围、排除项、分页完整性和新鲜度限制。

### 优先执行

- 对数据所有者操作，优先使用权限最小化的 Core 或 Power BI API，而不是要求租户管理员权限。
- 将发现结果报告为证据、后果、建议操作、优先级和工作量，而不是返回库存转储。
- 在批量分配或标记之前，先处理所有权和访问范围修复。

### 避免

- 不要在审计模式下修改租户。
- 不要为背书、DLP 策略、管理员项目删除或第三方项目身份分配臆造写入 API。
- 不要将异步 `202` 响应报告为成功完成。

## 第 1 步 — 选择模式

**两个轴 → 2×2 网格。** 层级（可以访问的 API 接口）× 操作（审计与修复）。每个单元涵盖 Govern 的三个支柱（健康 / 保护 / 信任）。

|  | **审计**（只读） | **修复**（写入） |
|---|---|---|
| **Fabric 管理员** — `/v1/admin/*`，**仅限 Fabric 租户管理员** | `admin-audit` | `admin-remediate` |
| **数据所有者 / 运营管理员** — Core API + 工作区/域/容量管理员，无租户管理员权限 | `dataowner-audit` | `dataowner-remediate` |

| 模式 | 加载此参考文档 | 角色 / 权限层级 | 范围 | 读取 | 写入 |
|---|---|---|---|---|---|
| **admin-audit** | [references/admin-audit.md](references/admin-audit.md) | **Fabric 租户管理员**（`/v1/admin/*`） | 整个租户 | ✅ | ❌ |
| **admin-remediate** | [references/admin-remediate.md](references/admin-remediate.md) | **仅限 Fabric 租户管理员** — 每个 `/v1/admin/*` 写入操作都要求 Fabric 管理员角色；**域管理员和容量管理员不符合要求** | 整个租户 | ✅ | ✅ |
| **dataowner-audit** | [references/dataowner-audit.md](references/dataowner-audit.md) | **非管理员**工作区或域所有者（仅限 Core API） | 调用者管理的工作区（根据请求扩大到可访问的工作区） | ✅ | ❌ |
| **dataowner-remediate** | [references/dataowner-remediate.md](references/dataowner-remediate.md) | **同时也是域 / 工作区 / 容量管理员的数据所有者** — Core 和 Power BI API 写入，无租户管理员权限 | 调用者拥有相应角色的对象 | ✅ | ✅（自助服务） |

### 路由规则

- **从审计模式开始。** 在确认当前状态之前，绝不要修复。除非调用者的权限发生变化，否则在**同一层级**内执行 审计 → 修复。
- **按调用者可访问的 API 表面选择层级**，而不是按职位头衔：需要 `/v1/admin/*` 的 **Fabric tenant admin** → `admin-*` 单元；通过 workspace/domain/capacity 角色操作的数据所有者 → `dataowner-*` 单元。
- **"Fix / assign / apply / create / delete"** → **remediate** 单元。租户范围写入（create/delete domain、bulk domain assignment、domain roles、bulk labels、certification）→ `admin-remediate`。单个 workspace 的 `assignToDomain` 或 `assignToCapacity`、应用 tags、设置 descriptions、refresh，以及 item identity → `dataowner-remediate`（这些需要对象范围角色，而不是租户管理员）。
- 读/写拆分是一条**安全边界**：即使提示要求写入，审计模式也不得修改租户。如果你处于审计模式，而用户要求写入，请明确切换到匹配的修复模式，不要临时编写写入操作。

> **Tier = API surface, not role title.** `admin-*` 模式调用 `/v1/admin/*`，并要求具备 **Fabric tenant administrator** 角色（Fabric admin / Power Platform admin / M365 global admin）——**domain、capacity 和 workspace admins 不符合条件**，即使是针对他们自己的 domain。`dataowner-*` 模式使用 Core/Power BI APIs，范围限定在调用者已对特定对象持有的角色内。因此，一个不是 Fabric tenant admin 的 domain/WS/capacity admin 完全处于 `dataowner-*` 单元中；他们**只有在被单独授予 Fabric tenant admin 角色时**才会进入 `admin-*`。角色是模式内部的**范围分支**；只有不同的 **API surface** 才能构成单独模式的理由。

> ⚠️ **已知 Fabric 缺口 — 作用域治理没有非管理员 API。** 如果 **domain admin** 或 **workspace admin** 不是 Fabric tenant admin，则当前**没有 API 路径**可访问其作用域内的治理状态：`/v1/admin/*` 会拒绝他们（它需要租户 Fabric admin 角色——参见 [Assign Domain Workspaces](https://learn.microsoft.com/en-us/rest/api/fabric/admin/domains/assign-domain-workspaces-by-ids#permissions) 权限说明），而 Core API **没有**端点可以列出某个 domain 中的 workspaces，或返回 domain 的治理状态。`dataowner-audit` 只能报告调用者可直接访问的 workspaces，而不是“我的整个 domain”。如果 domain/WS admin 请求其作用域内的治理详情，请**先明确说明此限制**，不要将他们路由到会返回 401/403 的 `admin-*` 模式。

## Step 2 — 不可逆操作 — 必须执行的门禁（任何写入前阅读）

> ⚠️ **为什么这里也放置此内容，而不只放在模式参考中。** 这些是终止性、
> 难以撤销的操作。当这样的指令作为一行夹在大型参考文件的几十行内容中时，
> 它会被读到但被静默跳过。这里在自动加载的调度器正文中重复它，
> 这样门禁会在写入**之前**触发，而不是之后。
> 完整流程仍保留在修复模式参考中（[admin-remediate.md](references/admin-remediate.md)、[dataowner-remediate.md](references/dataowner-remediate.md)）；这是检查清单，而不是替代品。

在以**任一**补救模式执行以下任何操作之前，门禁**必须**通过。**模式**列显示哪个单元格负责该操作：

| 不可逆 / 终止性操作 | 模式 | 必须首先触发的门禁 |
|---|---|---|
| **删除域**（`DELETE /v1/admin/domains/{id}`） | admin | 检查子域（`parentDomainId`）以及该域和每个子域的已分配工作区数量。如果任何工作区会变成孤立状态，停止操作，并获取明确的用户确认，列出受影响的域/工作区。REST API **没有**级联阻止机制，此检查由你负责。参见 [domain-crud.md § 删除域](references/admin-remediate/domain-crud.md#deleting-a-domain--the-portal-vs-api-safety-gap)。 |
| **删除标签**定义 | admin | 先报告有多少项带有该标签，因为删除操作会在所有位置解除该标签，且**无法撤销**。 |
| **批量将工作区分配给域** | admin | 检查每个目标当前的 `domainId`，并在**静默覆盖**现有分配之前发出警告。先对目标列表执行试运行。 |
| **从域角色中移除主体** | admin | 确认此操作不会使域变成**无所有者**状态；列出要移除的主体。 |
| **批量更改敏感度标签** | admin | 执行试运行：显示确切的受影响项列表以及更改前后的标签，并获取确认。**不支持服务主体 / 托管标识**，调用将失败。 |
| **写入租户设置**（例如启用认证） | admin | 读取并显示当前值，然后显示拟设置的值，因为其影响范围覆盖整个租户。 |
| **将一个工作区分配给域 / 取消其分配** | dataowner | 移动操作属于**重新分配**：确认当前的 `domainId`，并列出它将要离开的域。需要域贡献者权限和工作区 Admin 权限；失败时说明缺少哪一项。 |
| **重新分配项所有权**（项身份、预览） | dataowner | 仅分配给**调用者**；需要对该项及其子项拥有 Write 权限。确认预期的身份。 |
| **将工作区分配给容量** | dataowner | 需要工作区 Admin 权限以及容量 Contributor/Admin 权限。异步返回 `202`，**不要仅凭 202 就报告成功**；应轮询直到达到终止状态。 |

> **不要承诺不存在写入 API 的补救措施。** 租户管理员无法通过写入接口执行背书、DLP 策略和项*删除*。对于这些情况，请生成一份列出能够采取行动的人员的联系人列表，参见 [references/admin-remediate/no-write-api-escalation.md § 将发现的问题转交给能够修复它的人](references/admin-remediate/no-write-api-escalation.md#route-a-finding-to-someone-who-can-fix-it-escalation-lists)。

## 第 3 步 — 加载参考资料并继续

仅加载与第 1 步匹配的一个模式参考资料，并从头到尾遵循它。共享背景和每个叶子流程都在此处编入索引，因此每个文件距离此调度器都只有一跳。参考资料是叶子节点：加载一个参考资料后，当需要其他流程时返回此索引。

### 共享治理参考资料

- [治理支柱](references/govern-pillars.md) — 三大支柱、“良好”状态的标准以及报告约定
- [治理数据源](references/govern-data-sources.md) — 已验证的 API 字段覆盖范围、产品盲点以及报告约定
- [治理角色](references/govern-roles.md) — 权限层级、域/工作区角色以及洞察刷新延迟
- [目录概念](references/catalog-concepts.md) — 实体模型，以及由 API 支持的术语与概念性术语
- `../../common/COMMON-CORE.md` — 仓库级 Fabric REST 模式、身份验证和分页
- `../../common/COMMON-CLI.md` — 仓库级 CLI 实现（`az rest`、分页、身份验证方案）

### 模式分发器

- [管理员审计](references/admin-audit.md) — 租户范围内的只读治理评估
- [管理员审计范围](references/admin-audit-scope.md) — 可治理分母、排除项和已知盲点
- [管理员审计评估](references/admin-audit-assessment.md) — 端到端评估工作流、优先级排序和交付物约定
- [管理员修正](references/admin-remediate.md) — 通过管理员 API 执行租户范围内的受控写入
- [数据所有者审计](references/dataowner-audit.md) — 通过核心 API 进行调用方范围内的只读检查
- [数据所有者修正](references/dataowner-remediate.md) — 通过核心 API 和 Power BI API 执行最小权限写入

### 管理员审计流程

- [域健康状况](references/admin-audit/health-domains.md) — 分配、所有权、参与者范围和元数据
- [工作区健康状况](references/admin-audit/health-workspaces.md) — 空闲/不活跃工作区以及管理员关键人员风险
- [容量健康状况](references/admin-audit/health-capacity.md) — 容量状态、所有权和域对齐
- [项目清单](references/admin-audit/item-inventory.md) — 管理员与扫描程序清单及字段覆盖范围
- [项目健康状况](references/admin-audit/health-item.md) — 所有权、陈旧状态和刷新状态
- [保护覆盖范围](references/admin-audit/protect-labels-dlp.md) — 敏感度标签和 DLP 可见性
- [信任治理](references/admin-audit/trust-curation.md) — 描述、认可和标签覆盖范围

### 管理员修正流程

- [域生命周期](references/admin-remediate/domain-crud.md) — 创建、更新和安全删除域
- [工作区分配](references/admin-remediate/domain-assign-workspaces.md) — 选择并试运行批量分配方法
- [域角色](references/admin-remediate/domain-roles.md) — 分配管理员和参与者
- [标签](references/admin-remediate/tags.md) — 管理租户标签定义
- [项目敏感度标签](references/admin-remediate/item-sensitivity-label.md) — 受控批量标签更改
- [域默认标签](references/admin-remediate/domain-default-label.md) — 防止产生新的未标记积压项
- [信任修正](references/admin-remediate/trust-curate.md) — 认证启用和委派操作
- [无写入权限升级](references/admin-remediate/no-write-api-escalation.md) — 识别缺失的 API 以及可执行操作的指定负责人

### 数据所有者流程

- [数据所有者工作区健康状况](references/dataowner-audit/health-workspaces.md) — 调用方范围内的空闲和不活跃工作区检查

## 示例

```text
审计我们租户的 OneLake 目录治理状况，并对发现项进行优先级排序。
```

```text
我管理的哪些工作区未分配到域？
```

```text
显示将这些工作区分配到 Finance 域的试运行结果，包括当前分配情况。
```

```text
查找租户范围内未标记的项目，并说明哪些修正需要租户管理员，哪些需要数据所有者。
```