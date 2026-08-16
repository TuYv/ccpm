---
name: cell-architecture
description: >-
  Reference and active migration guide for Sentry's cell architecture. Explains what cells and
  localities are and why they're different, how requests reach cells via Synapse API routing,
  ingestion routing, and the control silo gateway, and how to safely query cross-cell data without
  silently missing results. The migration section covers how to do migration work: draining the
  URL_NAME_TO_ACTION registry in test_urls.py to zero (with a recipe for each action type),
  rolling deploy safety and the two-phase pattern required by independent sentry/getsentry deploys,
  and the region -> cell rename including what not to rename (DB columns, AWS refs, uptime regions,
  billing address). Also documents known issues with proposed fixes: integration TeamLinkageView
  routing, Jira cross-cell fan-out, and relocation endpoint routing.
---
> **状态**：正在进行迁移。迁移完成后，应删除迁移相关章节，仅保留稳定的架构参考。

# 单元

## 单元与地域

这是架构中的两个不同层次。

**单元**——一个自包含的 Sentry 部署，负责一部分组织。每个单元
都在隔离网络中运行自己的完整技术栈——Getsentry、Snuba、Seer、Relay、Kafka、Symbolicator 等——
单元之间不进行直接通信。`OrganizationMapping.cell_name`
记录组织所在的单元。有关单元如何与外部世界通信，请参阅[进入单元的路径](#paths-into-a-cell)。

**地域**——一个具名的单元集合，表示数据驻留区域（面向
多租户客户，例如“us”“de”）或单个客户的专用部署
（例如 `s4s2`）。多租户客户在创建组织时选择地域；
单租户地域以私有方式预配，客户无法自行选择。每个地域
都映射到一个子域名（`us.sentry.io`、`de.sentry.io` 或 `s4s2.sentry.io`）。

> **注意**：“region”是“cell”的旧称。代码库正在积极迁移。
> 详情请参阅[当前迁移](#active-migration)。

## 进入单元的路径

请求或数据可通过三种高层路径到达单元。

### 1. 地域 API — `{locality}.sentry.io`

Synapse（[getsentry/synapse](https://github.com/getsentry/synapse)）使用其从 control 的
`OrganizationMapping` 缓存的**组织到单元映射**，将每个请求路由到地域内
正确的 getsentry 单元。

```
us.sentry.io   ->  Synapse (API proxy)  ->  US cell(s)
de.sentry.io   ->  Synapse (API proxy)  ->  DE cell(s)
s4s2.sentry.io ->  S4S2 cell (single cell, no Synapse)
```

为了让 Synapse 能够路由请求，URL 必须包含 `organization_id_or_slug`。规范
形式为 `/api/0/organizations/<organization_id_or_slug>/...`——`getsentry/tests/getsentry/test_urls.py`
会强制执行此规则，并使任何不符合要求的 `@cell_silo_endpoint` 无法通过 CI。

为组织范围内的资源生成 URL 时，请使用 `org.locality.to_url(path)`——它会在
SaaS、自托管、单租户和开发部署中派生出正确的地域 URL：

```python
url = org.locality.to_url(f"/organizations/{org.slug}/issues/{issue.id}/")
```

对于仅含单个单元的地域，Synapse 是可选的直通层。

### 2. 数据摄取 — `ingest.{locality}.sentry.io`

一个独立的 Synapse 部署使用其从 control 缓存的**公钥到单元映射**，将每个摄取请求路由到正确的单元。Synapse 返回的项目配置直接包含该单元的 Relay URL，高流量 Relay 部署会使用此 URL 绕过 Synapse，以处理后续的高流量提交。

```
Standard:    ingest.us.sentry.io  ->  Synapse (ingest-router)  ->  cell's Relay
High-volume: ingest.us.sentry.io  ────────────────────────────->  cell's Relay
```

DSN 主机各不相同——旧版格式不包含地域或组织信息——因此 ingest-router 始终根据公钥进行路由，因为无论采用何种 DSN 格式，每个请求都包含公钥。

`o{org_id}.ingest.{locality}` 子域名还承担第二项路由用途：用户反馈嵌入式组件（`sentry-error-page-embed`）会向 `sentry.io` 发送请求，并将项目的 DSN 作为查询参数。由于该 URL 中没有组织 slug，API 网关无法按常规方式进行路由——它会改为从 DSN 主机名中解析 locality。如果 DSN 是以不含 locality 的旧格式签发的，网关将无法确定 cell，导致该组织的嵌入式组件无提示地失效。

对于单 cell locality，ingest-router 是可选的直通层。

### 3. 控制 silo — `sentry.io`

`sentry.io` 是 getsentry 的控制 silo 部署。控制 silo 通过三种机制与 cell 通信：

**API 网关**（`ApiGatewayMiddleware` -> `apigateway.py`）——同步代理到达 `sentry.io`、但实际归属于某个 cell 的组织范围 API 请求：

- 路径中包含组织 slug/id，通过 `get_cell_for_organization()` 解析 cell
- 错误嵌入组件（`sentry-error-page-embed`）-> 从 DSN 子域名解析 locality
- `REGION_PINNED_URL_NAMES` 代理到 monolith cell（最初的美国 cell）。像 `/api/0/issues/{id}/` 这样的旧版端点没有组织 slug，因此网关无法动态解析 cell；它们始终路由到美国 cell，并且对于其他 cell 中的 issue 将返回 404

**集成 webhook 转发**（`IntegrationControlMiddleware` -> `BaseRequestParser`）——入站 webhook 到达控制 silo，后者通过 `OrganizationIntegration`、`organization_mapping_service` 识别目标 cell，然后使用以下三种策略之一进行投递：

- **`WebhookPayload` 异步队列**（默认；GitHub 和大多数提供商）——为每个目标 cell 创建一条记录，立即返回 202；后台 worker 负责投递和重试
- **立即 ACK + 异步 Celery 任务**（Slack、Discord）——立即返回 ACK，触发一个调用 cell 的任务，并通过提供商的回调 URL 转发实际响应
- **仅限控制 silo**（设置流程、链接/取消链接、事件质询）——不转发到 cell

**RPC**——同步跨 silo 调用。每项服务都位于某个 silo 本地；另一方通过远程方式调用该服务。有关创建或修改 RPC 服务的信息 -> **hybrid-cloud-rpc** skill。

## 跨 Cell 数据访问

> **开发/Monolith 模式**：在本地开发环境中，所有数据都位于单个 DB 中，因此跨 cell
> bug 在本地**不可见**——它们只会在 silo 化的 staging 或生产环境中暴露。

一个用户可以属于不同 cell 中的组织。在单个 cell 内运行时，任何通过跨 cell 关系（成员关系、团队分配或类似关系）筛选组织范围数据的查询，都会无提示地返回**不完整的结果**：它只能看到位于该 cell 中的组织。

```python
# Looks correct, silently wrong in multi-cell — misses orgs in other cells:
Organization.objects.get_for_user_ids({user_id})
Project.objects.filter(teams__organizationmember__user_id=user_id)
```

### 可用基础设施

- **`OrganizationMemberMapping`**（控制 silo）——包含所有 cell 中每位成员的 `(user_id, organization_id, role, invite_status)`。这是规范的 user->org 索引；应从这里开始。
- **`OrganizationMapping`**（控制 silo）——将 `organization_id` 映射到 `cell_name`
- **`organization_service.get_organization_by_id()`**——获取组织详细信息；自动路由到正确的 cell
- **`find_cells_for_user(user_id)`**——返回包含该用户所属组织的 cell 名称（当你需要向多个 cell 扇出请求但不需要成员关系数据时使用；内部调用 `OrganizationMemberMapping`）

### 解析模式

| 模式                            | 使用场景                                                                                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **控制索引 + RPC 扇出**         | 要求实时准确；每个用户对应的组织数量适中。使用 `OrganizationMemberMapping` 获取组织 ID，然后对每个组织调用 `organization_service` RPC（或通过 `OrganizationMapping` 按 cell 批处理）。             |
| **反规范化到控制 silo**         | 高 QPS、分页列表、可接受最终一致性。通过 outbox 将所需字段复制到 `@control_silo_model`——只需一次本地查询，无需 RPC。请参阅 **hybrid-cloud-outboxes** skill。                                         |
| **API 网关扇出**                | 仅用作临时权宜之计——会破坏分页，延迟取决于最慢的 cell。                                                                                                                                             |

## 在本地运行 Cell-Routing 代理

```bash
devservices up --mode cell-routing            # brings up synapse + deps
SENTRY_CELL_ROUTING=1 sentry devserver --client-hostname=dev.getsentry.net # or devservices serve
```

只有 cell 范围内的 API XHR（`/api/0/organizations/{slug}/*`）会跨到 `:13000` 上的 Synapse；UI HTML 和控制 API 仍由 `:8000` 上的 sentry devserver 处理。该环境变量用于控制 `src/sentry/conf/server.py` 中的一个代码块，此代码块会将 `system.region-api-url-template` 设置为 Synapse 端口，并启用 `system:multi-region`。前端从 bootstrap blob 中读取 `regionUrl`，并根据 `static/app/api.tsx:715` 将 cell XHR 路由到该地址。

### 发送测试 envelope

`bin/send-cell-test-event.py` 用于测试摄取路径：它从本地开发数据库解析 DSN，并通过边缘 relay（`:7899`）发送 envelope，后者会将其转发到 relay-cell -> Kafka -> Sentry。

```bash
bin/send-cell-test-event.py                       # internal project (id 1)
PROJECT_ID=42 bin/send-cell-test-event.py         # different project
TARGET=127.0.0.1:7900 bin/send-cell-test-event.py # straight to relay-cell, bypass edge
```

使用 `docker logs -f sentry-relay-edge-1` 观察其路由过程。

## 正在进行的迁移

> 迁移完成后删除本节。

使用 `TODO(cells)` 跟踪延期的迁移工作，以便能够搜索到这些工作：

```python
# TODO(cells): rename metric to "cell.foo" once getsentry dashboards are updated
metrics.incr("region.foo", tags=metric_tags)
```

### 迁移指南

#### Cell 端点 URL 形式

公共 `@cell_silo_endpoint` URL 必须包含 `organization_id_or_slug`，以便 Synapse 能够对其进行路由——请参阅 [进入 Cell 的路径](#paths-into-a-cell)。`getsentry/tests/getsentry/test_urls.py` 会在 CI 中强制执行此要求；如果不符合规范的 URL 没有已注册的计划，检查就会失败。

**目标是将 `URL_NAME_TO_ACTION` 中的条目清零。** 每个条目都代表一个不符合规范的端点，并带有说明所需处理方式的标签。修复某个条目后，请将其从映射中删除。不应添加新的不符合规范的条目。

使用 `@internal_cell_silo_endpoint` 装饰的端点无需接受此项检查。

**各操作及其修复方式：**

- `TO_BE_REPLACED_WITH_ORG_SCOPED_VARIANT` — 将 `organization_id_or_slug` 添加到 URL 路径中，以便 Synapse 能够对其进行路由
- `TO_BE_REPLACED_WITH_CELL_SCOPED_VARIANT` — `_admin` 仅限员工使用的端点；通过添加单元 ID 参数将其限定到某个单元（模式：`^api/0/_admin/cells/(?P<cell_id>[^/]+)/`）
- `TO_BE_CONTROL_ONLY` — 将端点迁移至 `@control_silo_endpoint`
- `TO_BE_INTERNAL_ONLY` — 改为 `@internal_cell_silo_endpoint`；这样可使其免受路由要求的约束
- `TO_BE_STANDARDIZED` — 修复 URL 拼写错误或约定不一致问题（例如缺少组织 slug 支持、路径未遵循现有约定）
- `TO_BE_SELF_HOSTED_ONLY` — 将其移至自托管防护之后，使其无法在 SaaS 单元中访问
- `TO_BE_DEPRECATED` — 该端点将被移除。在进行任何修改之前：在 getsentry GitHub 组织中搜索 URL 名称和路径，以查找所有调用方。然后，在端点仍处于使用状态时添加 `X-Sentry-Deprecation-Date` 响应头（参见 `sentry/api/helpers/deprecation.py` 中的 `_add_deprecation_headers`）。完全移除时：将其从 `src/sentry/api/urls.py`、视图文件、`URL_NAME_TO_ACTION` 中删除；如果是公共端点，还要从 `src/sentry/apidocs/` 中删除。
- `TO_BE_DELETED` - 并非公共端点，可立即移除，无需弃用流程
- `TO_BE_BROKEN` — 已知已损坏且没有负责人；无限期推迟（只进行重新定位，不要添加条目）
- `TO_BE_INVESTIGATED_ECOSYSTEM_TEAM` — 推迟到生态系统团队确定正确的修复方式之后

#### 滚动部署安全性

**绝不要假设部署是原子的。**需要考虑两个相互独立的部署边界：

1. **Sentry 滚动部署** — 在滚动更新期间，新旧 sentry Pod 会同时运行。对
   线上传输格式、RPC 方法签名、数据库模式或序列化字段的任何更改，都必须确保
   旧 Pod 能够安全接收来自新 Pod 的内容，反之亦然。

2. **Sentry <-> getsentry** — sentry 和 getsentry 始终独立部署，并且
   部署时间各不相同。sentry 导出且由 getsentry 导入的任何内容（类、函数、
   常量、装饰器）都必须继续能够通过旧名称导入，直到 getsentry
   部署了相应更新。将旧名称保留为别名；绝不要在单次部署中直接进行硬重命名。

任何破坏性更改都必须采用**两个阶段**：

**阶段 1** — 部署向后兼容的代码：在保留旧名称/字段/格式的同时添加新的名称/字段/格式。
每个服务的新旧版本都能够处理这两种形式。

**阶段 2** — 部署清理代码：在 sentry 和 getsentry 均已使用新代码后，
移除旧名称/字段/格式。

这适用于：

- 由 sentry 导出并由 getsentry 导入的 Python 符号（将旧名称保留为别名）
- RPC 请求/响应字段（添加、移除或重命名）
- 数据库列：新列必须可为空或具有默认值；不要在停止写入某列的同一次部署中删除该列；在**重命名 Python 字段**时，设置 `db_column="old_name"`，以完全避免数据库模式迁移——数据库列保持不变，因此在滚动部署期间是安全的
- API 响应结构变更
- 写入发件箱、队列或缓存且可能由旧代码读取的任何数据
- **Taskworker/Celery 任务名称和 kwargs** — `name=` 字符串会被序列化到 Kafka/代理中；正在传输的任务携带旧任务名称和旧 kwarg 名称。在过渡期间继续注册旧名称（通过 `@instrumented_task` 上的 `alias=`，或保留旧任务作为直接调用新函数的垫片）。在队列排空后，通过后续部署将其移除。

#### region -> cell 重命名

代码库正在积极将术语从“region”迁移为“cell”。

**新代码不得使用“region”表示“cell”或“locality”**——这适用于所有 Python
符号、变量名、函数名、类名、注释、日志键和文档字符串。

**重命名前，请先确定代码所指的概念：**

- 如果它指的是拥有一部分组织的单个部署单元 -> **cell**
  (`cell_name`、`get_cell_for_organization`、`CellSiloClient` 等)
- 如果它指的是命名的 cell 集合/数据驻留区域（`"us"`、`"de"`）-> **locality**
  (`locality`、`org.locality`、`Locality` 等)

现有的大多数 `region` 用法都可一一对应到 `cell`，但有些用法（尤其是代码处理
`"us"` / `"de"` 子域路由或面向客户的区域选择时）对应的是 `locality`。重命名前请
检查上下文。

**请勿重命名：**

- `db_column="region_name"`——为保持向后兼容，数据库架构保持不变；只更改 Python 属性名
- AWS/云相关引用（`aws-lambda.host-region` 等），例如 AWS 集成中的引用
- Uptime region——探针/检查位置，这是与 cell 和 locality 不同的独立概念
- getsentry 中客户账单的 `region`——用于税务等用途的邮政地址州/省，与 cell 基础设施无关

**重命名时须谨慎**——sentry 和 getsentry 按不同的时间表独立部署，因此在迁移期间，新旧名称必须同时可用：

- **指标**（`metrics.incr("region.*")`）——仪表板和告警会引用指标名称；在 getsentry 仪表板更新前，同时发出新旧两个名称，之后再移除旧名称。
- **运行时选项**（`options.get("hybridcloud.regionsiloclient.*")`）——这些值通过 getsentry 中的 `sentry-options-automator` 在生产环境中设置；在旧键旁注册新键，迁移 getsentry 配置，然后在后续部署中移除旧键
- **设置**——这些设置在 getsentry 和运维代码库中配置，也会通过设置文件和环境变量进行配置；务必极其谨慎，以免错误的重命名破坏生产环境。请遵循两阶段模式。

### 已知问题

以下是存在问题的具体区域，以及问题描述和建议的修复方案。每个条目解决后将其移除。

#### 集成视图和 Cell 路由

`TeamLinkageView`（link-team、unlink-team）存在两个问题：它使用包含 `integration_id` 而不是组织 slug 的签名 URL，导致 Synapse 无法对其进行路由；同时它还会查询 `OrganizationMember.get_for_integration()`（cell-silo），因此无论如何都只能看到当前 locality 中的组织。

**修复方案**：

1. `@control_silo_view`——使 URL 无需 Synapse 即可访问
2. 将 `OrganizationMember.get_for_integration()` 替换为 `OrganizationMemberMapping` + `integration_service.get_organization_integrations()`，以支持跨 cell 成员关系
3. 通过 RPC 在正确的 cell 中获取 `Team` 并写入 `ExternalActor`——需要新增 RPC 方法（参见 **hybrid-cloud-rpc** skill）

`IdentityLinkageView` 已经使用 `@control_silo_view`，无需迁移。

#### Jira Issue 详情的跨 Cell 扇出

Jira 侧边栏面板（“Sentry -> Linked Issues”）通过 `is_cell_restricted = True` 阻止多 Cell 安装，而不是进行正确修复。描述符指向 `JiraSentryIssueDetailsView`（`@cell_silo_view`），该视图仅查询单个 Cell 的数据库。`JiraSentryIssueDetailsControlView`（`@control_silo_view`）已存在于 `/extensions/jira/issue-details/{issue.key}/`，并具备正确的 `find_cells_for_orgs` 扇出机制——修复方法是让描述符指向该 URL，并移除 `is_cell_restricted`。

#### Relocation 端点路由

所有 Relocation 端点都是不含组织 slug 的 `@cell_silo_endpoint`——`/relocations/`、`/publickeys/relocations/`，以及基于 UUID 的管理端点（`/relocations/{uuid}/abort/` 等）——因此 Synapse 无法在多 Cell locality 中路由其中任何端点。可能的修复方案：基于 UUID 的端点通过 Control Silo 执行 `uuid -> cell` 查找；列表和公钥端点则遵循组织创建模式（选择 locality -> Control 选择一个 Cell）。该问题将作为 Monarch 项目（在 Cell 之间迁移组织）的一部分进行处理。