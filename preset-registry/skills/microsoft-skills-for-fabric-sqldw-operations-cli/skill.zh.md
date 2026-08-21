---
name: sqldw-operations-cli
description: >
  Analyze Fabric Data Warehouse performance via the MCP execute_query tool and queryinsights views.
  Diagnose slow queries, SQL pool pressure, cache coldness, and recommend clustering keys.
  Triggers: "DW slow query analysis", "slowest queries warehouse",
  "queryinsights long running", "warehouse CPU resource consumers",
  "SQL pool pressure window", "pressure events warehouse",
  "DW cache warmth cold start", "cache warmth analysis",
  "warehouse cluster key recommendation", "cluster tables performance",
  "DW performance baseline comparison", "performance degraded warehouse",
  "warehouse user query patterns", "queryinsights diagnostics",
  "DW optimization MCP".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: sqldw-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=sqldw-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍须添加。

> **更新检查 — 每个会话一次（强制要求）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话此前已执行过检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中此类型的所有项，然后使用 JMESPath 进行筛选

# SQL DW 性能与诊断 — CLI 技能

此技能通过 **`fabric-sqlendpoint-execute_query` MCP 工具**和内置的 **`queryinsights`** 视图，为 Microsoft Fabric 数据仓库提供性能分析、深度诊断和优化指导。所有查询均为只读。

## 先决条件

有关通过 `az rest` 发现工作区/项的信息，请参阅 [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest)。有关旧版 `sqlcmd` 的参考信息（仅作为回退方案），请参阅 [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access)。

> **⚠️ SQL 执行替代规则：** 对于 SQL 数据平面执行，此技能取代 COMMON-CLI 中的 SQL/TDS 指导。除非明确使用旧版 CLI 回退方案，否则请使用 MCP `fabric-sqlendpoint-execute_query`（请参阅[工具栈](#tool-stack)）。

**监控特定要求：**
- **工作区角色**：目标工作区的管理员或成员（访问 `queryinsights` 视图所必需）
- **仓库必须存在**，且近期有查询活动（`queryinsights` 视图保留 30 天的数据；数据最多延迟 15 分钟显示）

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制要求** — *请先阅读链接* [根据名称查找工作区 ID，或根据名称、项类型和工作区 ID 查找项 ID 时需要] |
| Fabric 拓扑和关键概念 | [COMMON-CORE.md § Fabric 拓扑和关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括分页、LRO 轮询和速率限制模式 |
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) ||
| 陷阱、最佳实践和故障排除（平台） | [COMMON-CORE.md § 陷阱、最佳实践和故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) ||
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括分页和 LRO 辅助程序 |
| SQL / TDS 数据平面访问 | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) | 旧版 `sqlcmd` 参考资料（MCP 为主要方式 — 请参阅工具栈） |
| 陷阱和故障排除（CLI 特定） | [COMMON-CLI.md § 陷阱和故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板 + 令牌受众/工具矩阵 |
| 连接基础 | [SQLDW-CONSUMPTION-CORE.md § 连接基础](../../common/SQLDW-CONSUMPTION-CORE.md#connection-fundamentals) | TDS、端口 1433、仅限 Entra、不支持 MARS |
| 监控和诊断 | [SQLDW-CONSUMPTION-CORE.md § 监控和诊断](../../common/SQLDW-CONSUMPTION-CORE.md#monitoring-and-diagnostics) | 查询标签；DMV（实时）+ `queryinsights.*`（30 天历史记录） |
| 性能：最佳实践和故障排除 | [SQLDW-CONSUMPTION-CORE.md § 性能：最佳实践和故障排除](../../common/SQLDW-CONSUMPTION-CORE.md#performance-best-practices-and-troubleshooting) | 统计信息、缓存、聚类、查询技巧 |
| 陷阱和故障排除（使用） | [SQLDW-CONSUMPTION-CORE.md § 陷阱和故障排除参考](../../common/SQLDW-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference) | 18 个带有原因和解决方法的编号问题 |
| 数据引入（仅限 DW） | [SQLDW-AUTHORING-CORE.md § 数据引入（仅限 DW）](../../common/SQLDW-AUTHORING-CORE.md#data-ingestion-dw-only) | COPY INTO、OPENROWSET、方法比较 |
| 查询参考 | [query-reference.md](references/query-reference.md) | 用于所有分析的 T-SQL 查询、参数和示例输出 |
| 复合方案 | [COMMON-CLI.md § 复合方案](../../common/COMMON-CLI.md#composite-recipes) ||
| 项类型功能矩阵 | [SQLDW-CONSUMPTION-CORE.md § 项类型功能矩阵](../../common/SQLDW-CONSUMPTION-CORE.md#item-type-capability-matrix) | 仅限仓库 — SQLEP 上不提供 `queryinsights` |
| 先决条件 | [SKILL.md § 先决条件](#prerequisites) | 工具、身份验证、工作区角色 |
| 工具栈 | [SKILL.md § 工具栈](#tool-stack) ||
| 连接 | [SKILL.md § 连接](#connection) ||
| 性能分析 | [SKILL.md § 性能分析](#performance-analysis) | 长时间运行的查询、资源消耗方、用户洞察、基线 |
| 深度诊断 | [SKILL.md § 深度诊断](#deep-diagnostics) | 压力时段、缓存预热程度、聚类键 |
| Fabric DW 约束 | [SKILL.md § Fabric DW 约束](#fabric-dw-constraints) | **绝不推荐不受支持的功能** |
| 最佳实践 | [SKILL.md § 最佳实践](#best-practices) | 监控特定指导 |
| 代理式工作流 | [SKILL.md § 代理式工作流](#agentic-workflows) | 常见调查模式 |
| 陷阱、规则和故障排除 | [SKILL.md § 陷阱、规则和故障排除](#gotchas-rules-troubleshooting) | **必须执行 / 避免 / 优先采用** 检查清单 |
| 示例 | [SKILL.md § 示例](#examples) | 提示词/响应对 |

---

## 工具栈

有关安装和设置，请参阅[先决条件](#prerequisites)。

| 工具 | 作用 |
|---|---|
| `fabric-sqlendpoint-execute_query` MCP 工具 | **主要工具**：针对 Fabric SQL Endpoint 执行监控 T-SQL 查询。身份验证由 MCP 协议处理。 |
| `az` CLI | 获取令牌，以及通过 Fabric REST 发现工作区/项 |
| `jq` | 解析来自 `az rest` 的 JSON |

> **重要提示 — MCP 与 sqlcmd：**
> 此 Skill 使用 `fabric-sqlendpoint-execute_query` MCP 工具执行所有 T-SQL。请**勿**使用 COMMON-CLI 的 SQL/TDS/sqlcmd 章节执行查询。

> **代理预检** — 在首次操作前验证：
> 1. 确认工具列表中存在 `fabric-sqlendpoint-execute_query` 工具。此工具由 `fabric-sqlendpoint` MCP 服务器提供；该服务器可通过安装 Fabric Skills **插件**（最终用户使用的方式）进行注册，也可通过此存储库的 `.mcp.json` 进行注册 — 其他 MCP 客户端可以通过其自身配置注册该服务器。
> 2. 如果未找到匹配的工具，用户必须注册 Fabric SQL Endpoint MCP 服务器。
>    - **全局 URL**：`https://api.fabric.microsoft.com/v1/mcp/dataPlane/sqlEndpoint`
>    - **项范围 URL**：`https://api.fabric.microsoft.com/v1/mcp/dataPlane/workspaces/{workspaceId}/items/{itemId}/sqlEndpoint`

### MCP 工具签名

```text
fabric-sqlendpoint-execute_query(workspaceId, itemId, query)
```

> **工具名称可能不同：** `execute_query` 是逻辑操作。根据服务器的
> 注册方式，工具列表中的具体工具名称可能带有前缀（例如
> `fabric-sqlendpoint-execute_query` 或 `sqlendpoint-global-execute_query`）。请调用工具列表中
> 显示的具体名称，并始终传入 `workspaceId`、`itemId` 和 `query`。

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `workspaceId` | string (UUID) | 包含目标 Warehouse 的工作区 GUID |
| `itemId` | string (UUID) | Warehouse 项的 GUID |
| `query` | string | T-SQL 查询文本（单个批次 — 不含 `GO` 分隔符） |

**返回：** 包含表格结果和元数据文本的 CSV 资源（RFC 4180）。

**限制：** 最多 10,000 行 | 超时时间 300 秒 | 速率限制为每分钟 20 个请求 _（观测到的默认值，并非已记录的契约 — 服务可能会更改这些值；请根据实际的 429/超时/截断响应进行验证）_

---

## 连接

### 查找 workspaceId 和 itemId

调用 `fabric-sqlendpoint-execute_query` 需要工作区 GUID 和 Warehouse GUID：

```bash
# 1. Find workspace ID by name (capture into WS_ID for the next call)
WS_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --query "value[?displayName=='MyWorkspace'].id" --output tsv)
echo "Workspace ID: $WS_ID"

# 2. Find warehouse item ID by name
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/warehouses" \
  --query "value[?displayName=='MyWarehouse'].id" --output tsv
```

### 执行监控查询

```text
fabric-sqlendpoint-execute_query(
  workspaceId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  itemId: "11111111-2222-3333-4444-555555555555",
  query: "SELECT TOP 5 * FROM queryinsights.long_running_queries ORDER BY last_run_total_elapsed_time_ms DESC"
)
```

**无需额外的连接设置** — 身份验证由 MCP 协议透明处理。

---

## 性能分析

所有 SQL 查询、参数、返回字段和响应格式均位于 [query-reference.md](references/query-reference.md) 中。

### 长时间运行查询摘要

从 `queryinsights.long_running_queries` 中查找最慢的查询。有关 SQL 和格式，请参阅 [query-reference.md § 长时间运行查询摘要](references/query-reference.md#long-running-queries-summary)。

### 资源消耗最高的查询

从 `queryinsights.exec_requests_history` 中查找 CPU 和存储资源消耗较高的查询。有关 SQL、阈值和格式，请参阅 [query-reference.md § 资源消耗最高的查询](references/query-reference.md#top-resource-consumers)。

**建议阈值：**
- 远程扫描 > 1,000 MB → 检查数据布局，考虑使用聚类
- CPU > 5,000,000 ms → 检查查询逻辑
- 已用时间 > 300,000 ms → 检查联接、筛选器和统计信息
- 参考：[性能指南](https://learn.microsoft.com/fabric/data-warehouse/guidelines-warehouse-performance)

### 主要用户洞察

分析用户活动和查询模式。有关 SQL 和分类逻辑，请参阅 [query-reference.md § 主要用户洞察](references/query-reference.md#top-users-insights)。

### 对比近期数据与基线

通过将近期时间窗口与历史基线进行比较，检测性能回退。有关 SQL 和格式，请参阅 [query-reference.md § 对比近期数据与基线](references/query-reference.md#compare-recent-vs-baseline)。

### 近期查询

检索最近执行的查询。有关 SQL，请参阅 [query-reference.md § 近期查询](references/query-reference.md#recent-queries)。

### 搜索查询模式

按表名、列或关键字搜索历史查询模式。有关 SQL，请参阅 [query-reference.md § 搜索查询模式](references/query-reference.md#search-query-patterns)。

---

## 深度诊断

所有用于诊断的 SQL 查询均位于 [query-reference.md](references/query-reference.md) 中。

### 分析长时间运行查询的执行计划

有关 SQL，请参阅 [query-reference.md § 长时间运行查询分析](references/query-reference.md#long-running-query-analysis)。

**分析指南** — 检查慢查询时，请注意：
- `data_scanned_remote_storage_mb` 较高 → 数据布局存在问题（运行 OPTIMIZE，考虑使用聚类）
- `allocated_cpu_time_ms` 相对于已用时间较高 → CPU 密集型（简化联接，减少列数）
- 已用时间较长但 CPU 使用率较低 → 正在等待资源（检查资源压力时间窗口）

### 分析资源压力时间窗口内的查询

使用 `queryinsights.sql_pool_insights` 识别 SQL 池资源压力事件，并将其与这些时间窗口内运行的最重查询相关联。有关两步式 SQL，请参阅 [query-reference.md § 资源压力时间窗口分析](references/query-reference.md#pressure-window-analysis)。

**用法：** 步骤 1 返回包含 `window_start` 和 `window_end` 时间戳的压力窗口。将这些实际时间戳值代入步骤 2 的 WHERE 子句，以查找重叠的查询。

**全局建议** — 基于汇总压力分析：
- 如果 SELECT 池的压力更大 → 读取密集型工作负载，建议使用缓存和列裁剪
- 如果 NONSELECT 池的压力更大 → 写入密集型工作负载，建议使用批处理和 COPY INTO
- 如果总压力 > 60 分钟 → 建议扩展容量或错开工作负载

### 分析查询缓存预热程度

有关 SQL，请参阅 [query-reference.md § 缓存预热程度分析](references/query-reference.md#cache-warmth-analysis)。

**分类逻辑** — 对于每次执行，计算 `total_mb = remote + memory + disk`：
- `result_cache_hit = 1` → **已缓存**
- `remote_mb / total_mb > 0.8` → **冷缓存**（>80% 来自远程存储）
- `(memory_mb + disk_mb) / total_mb > 0.8` → **热缓存**（>80% 来自缓存）

**建议：**
- 超过 50% 的运行属于冷缓存 → 启用结果集缓存：`ALTER DATABASE SET RESULT_SET_CACHING ON;`
- 始终处于冷缓存的模式 → 检查是否存在 `GETDATE()`/`GETUTCDATE()` 或导致缓存键失效的易变函数

### 推荐群集键

有关 SQL，请参阅 [query-reference.md § 群集键建议](references/query-reference.md#cluster-key-recommendations)。

**关键规则：**
- 只有 `WHERE` 谓词能受益于群集 — 等值 `JOIN ON` 条件**不能**
- 优先选择中高基数列（具有许多不同值）
- 最多使用 4 个群集列
- 使用带有 `WITH (CLUSTER BY (...))` 的 CTAS — 不支持 `ALTER TABLE`

**应用群集** — 有关 CTAS 创建、使用 `sp_rename` 交换表以及验证 SQL，请参阅 [query-reference.md § 群集键建议](references/query-reference.md#cluster-key-recommendations)。

> **注意：** Fabric 不支持 `ALTER TABLE SET DATA_CLUSTERING_KEY` 或 `RENAME OBJECT`。交换表时，始终使用带有 `WITH (CLUSTER BY (...))` 的 CTAS 和 `sp_rename`。

---

## Fabric DW 约束

**绝不要推荐 Fabric 数据仓库不支持的功能。** 提出优化建议之前，请务必查阅此列表。

| 请勿推荐 | 原因 | 替代建议 |
|------------------|-----|-------------------|
| 非聚集索引 | 不支持 | V-Order、列裁剪、谓词下推 |
| 物化视图 | 不支持 | 标准视图或结果集缓存 |
| 索引提示 (FORCESEEK/FORCESCAN) | 不支持 | 简化查询结构 |
| 多列统计信息 | 不支持 | 对关键列使用单列统计信息 |
| `ALTER TABLE SET DATA_CLUSTERING_KEY` | 不支持 | 使用带有 `WITH (CLUSTER BY (...))` 的 CTAS |
| `RENAME OBJECT` | 不支持 | `EXEC sp_rename 'schema.old', 'new'` |
| 更改隔离级别 | 仅支持快照隔离 | Fabric 仅使用快照隔离 |
| CREATE USER | 不支持 | 通过 Fabric 工作区管理用户 |
| 触发器 | 不支持 | 使用应用程序逻辑或 Fabric 管道 |
| 递归 CTE | 不支持 | 使用迭代方法 |
| “启用查询见解”设置 | 查询见解始终处于启用状态 — 不存在此设置 | 如果访问遭拒，用户需要 Admin 或 Member 工作区角色 |

---

## 智能体工作流

### 工作流 1：“为什么我的仓库运行缓慢？”

1. **检查压力事件** → 运行压力时间窗口分析查询（过去 24 小时）
2. **查找负载最重的查询** → 运行资源消耗最高的查询（过去 1 小时）
3. **分析慢查询** → 运行长时间运行查询分析
4. **检查缓存行为** → 运行缓存预热度分析（过去 24 小时）
5. **提供聚类建议** → 运行聚类键建议查询

### 工作流 2：“性能是否有所下降？”

1. **与基线比较** → 运行近期数据与基线比较（1 小时与 7 天）
2. **识别新的慢查询** → 运行长时间运行查询摘要（前 5 个）
3. **检查用户模式** → 运行主要用户洞察（过去 24 小时）

### 工作流 3：“优化我的仓库”

1. **查看最佳实践** → 参阅 [SQLDW-CONSUMPTION-CORE.md § 性能：最佳实践和故障排除](../../common/SQLDW-CONSUMPTION-CORE.md#performance-best-practices-and-troubleshooting)
2. **查找优化目标** → 运行资源消耗最高的查询（过去 24 小时）
3. **提供聚类建议** → 运行聚类键建议查询
4. **分析冷启动查询** → 运行缓存预热度分析

### 工作流 4：“人们正在运行什么？”

1. **近期活动** → 运行近期查询（前 10 个）
2. **用户模式** → 运行主要用户洞察（过去 24 小时）
3. **搜索特定模式** → 使用搜索词运行查询模式搜索

---

## 最佳实践

有关全面的 Fabric DW 最佳实践，请参阅 [SQLDW-CONSUMPTION-CORE.md § 性能：最佳实践和故障排除](../../common/SQLDW-CONSUMPTION-CORE.md#performance-best-practices-and-troubleshooting)和 [Fabric 指南](https://learn.microsoft.com/fabric/data-warehouse/guidelines-warehouse-performance)。

**监控特定的最佳实践：**

- **先从整体入手，再深入分析** — 在进行深度诊断之前，先查看长时间运行查询摘要和基线比较
- **使用压力时间窗口分析**进行根因分析，而不是猜测瓶颈所在
- **为所有智能体查询添加标签**，使用 `OPTION (LABEL = 'AGENTCLI_MONITOR_...')`，以便在 Query Insights 中进行跟踪
- **优先选择中高基数列**作为聚类键 — 低基数列对文件跳过的帮助有限
- **使用 `WHERE` 谓词**识别聚类键候选项 — 等值 `JOIN ON` 条件无法从聚类中获益
- **在 CTAS 后始终验证聚类**，方法是查询 `sys.index_columns.data_clustering_ordinal`
- **在断定查询本身速度较慢之前，先检查冷缓存与热缓存** — 首次执行可能是冷启动
- **调整时间窗口**（`DATEADD` 参数）以匹配用户的调查范围 — 不要默认使用任意时间窗口

---

## 注意事项、规则和故障排除

有关通用 CLI 注意事项（连接、身份验证、Shell 转义），请参阅 [COMMON-CLI.md § 注意事项与故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific)。
有关 T-SQL/平台注意事项，请参阅 [SQLDW-CONSUMPTION-CORE.md § 注意事项和故障排除参考](../../common/SQLDW-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference)。

### 必须执行
- 在推荐优化措施之前，始终检查 [Fabric DW 约束](#fabric-dw-constraints)
- 推荐聚类时，应指导用户通过 CTAS 使用 `WITH (CLUSTER BY (...))`，而不是使用 ALTER TABLE
- 报告查询的实际输出，不要捏造或假设结果
- 使用 `OPTION (LABEL = 'AGENTCLI_MONITOR_...')` **为查询添加标签**，以便通过 Query Insights 进行跟踪
- 在首次操作之前，**验证 `fabric-sqlendpoint-execute_query` MCP 工具是否可用**

### 建议执行
- 先从高层级查询（长时间运行查询摘要、基线比较）开始，再深入进行诊断
- 使用压力窗口分析进行根因分析，而不是猜测瓶颈
- 结合[智能体工作流](#agentic-workflows)中的多个查询，以进行全面调查
- 根据用户的请求调整时间窗口（`DATEADD` 参数）
- 将相关的诊断查询整合为更少的调用，以遵守速率限制

### 避免
- 推荐 Fabric 不支持的功能（非聚集索引、物化视图、索引提示、触发器）
- 暗示 Query Insights 需要“启用”或“开启”——`queryinsights` 视图始终可用；权限错误表示工作区角色权限不足（需要管理员或成员角色）
- 在未确认 workspaceId 和 itemId 的情况下运行监控查询
- 在未运行诊断查询的情况下猜测性能问题的根因
- 在监控查询中使用 `SELECT *`——始终选择具体列
- 在查询中使用 `GO` 分隔符或 sqlcmd 元命令（MCP 工具仅接受单个批次）
- 使用不带 `TOP N` 的无界查询——适用 10,000 行限制

### 故障排除（监控专用）

有关通用连接/身份验证问题的故障排除，请参阅 [COMMON-CLI.md § 常见问题与故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific)。

| 症状 | 原因 | 修复方法 |
|---|---|---|
| `Invalid object name 'queryinsights...'` | 新仓库创建时间不足 2 分钟 | 等待约 2 分钟 |
| `queryinsights.*` 出现权限错误 | 工作区角色权限不足 | 需要管理员或成员角色 |
| queryinsights 视图中无数据 | 最近没有查询活动，或存在不足 15 分钟的延迟 | 查询完成后等待 15 分钟 |
| 数据存在但未返回任何行 | RLS 筛选 | 检查 `USER_NAME()`，验证 RLS 策略 |
| `fabric-sqlendpoint-execute_query` 工具不可用 | MCP 服务器未注册 | 用户必须添加 Fabric SQL Endpoint MCP 服务器 |
| HTTP 429 速率限制 | 1 分钟内调用次数过多 | 等待 60 秒；整合查询 |
| 查询超时（300 秒） | 诊断过于复杂 | 使用更严格的 DATEADD 缩小时间窗口 |

---

## 示例

### 查找慢查询

**用户：**“我的仓库中哪些查询最慢？”

**智能体：**通过 `fabric-sqlendpoint-execute_query` 运行长时间查询摘要：

```text
fabric-sqlendpoint-execute_query(workspaceId, itemId,
  "SELECT TOP 5
      left(last_run_command, 80) AS query_preview,
      number_of_runs,
      last_run_total_elapsed_time_ms,
      median_total_elapsed_time_ms
   FROM queryinsights.long_running_queries
   ORDER BY median_total_elapsed_time_ms DESC")
```

> 最慢的 5 个查询是：
> 1. `SELECT * FROM FactSales JOIN DimCustomer...` — 运行了 12 次，最近一次耗时 45,200 ms（中位数为 38,500 ms）
> 2. `SELECT region, SUM(amount)...` — 运行了 8 次，最近一次耗时 32,100 ms（中位数为 29,000 ms）
> ...

### 诊断性能下降

**用户：**“我的仓库是否比上周更慢？”

**代理：**运行基线比较查询并给出：

> **性能比较（最近 1 小时与 7 天基线）：**
> - 已用时间：平均 2,450 ms → 平均 4,100 ms（+67.3%）
> - CPU 消耗：1,200 ms → 2,800 ms（+133.3%）
> - 扫描数据量：450 MB → 480 MB（+6.7%）
>
> 检测到显著的性能回退。让我检查压力事件并分析负载最高的查询……

然后继续运行压力窗口和资源消耗者查询。

### 获取聚类建议

**用户：**“哪些表应该进行聚类，应使用哪些列？”

**代理：**运行聚类键建议查询并给出：

> **建议的聚类键：**
> | 表 | 建议的列 | 行数 | 扫描总量（MB） |
> |-------|-------------------|-----------|-----------------|
> | dbo.FactSales | SaleDate, Region | 50M | 12,500 MB |
> | dbo.FactInventory | ProductID, WarehouseID | 12M | 3,200 MB |
>
> 要应用聚类，请使用 CTAS：
> ```sql
> CREATE TABLE dbo.FactSales_clustered
> WITH (CLUSTER BY (SaleDate, Region))
> AS SELECT * FROM dbo.FactSales;
> ```