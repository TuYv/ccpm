---
name: sqldb-operations-cli
description: >
  Diagnose SQL database in Fabric performance over TDS using Query Store, DMVs,
  sys.dm_db_resource_stats, and Extended Events on the OLTP endpoint. Identifies the top
  resource-consuming, slowest, or most expensive queries and handles query-performance
  ranking, blocking-chain, missing-index, and plan-regression diagnostics. For routine data
  queries use the sqldb-consumption-cli skill; for schema changes use the sqldb-authoring-cli skill.
  Triggers: "query store slow query analysis sqldb top queries",
  "top resource-consuming queries from query store sqldb",
  "slowest queries sql database in Fabric query store",
  "most expensive queries sqldb query store",
  "sql database in Fabric blocked sessions head blocker chain sqlcmd",
  "sqldb missing index recommendation",
  "sqldb regressed plan instability sqlcmd",
  "sqldb extended events trace".
---
> **更新检查 — 每个会话仅一次（强制）**
> 在一个会话中首次使用此 skill 时，请先运行 **check-updates** skill，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` skill。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 版本。
> - 如果本会话之前已执行过该检查，则跳过。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# Fabric 中的 SQL 数据库 — 操作与诊断 CLI Skill

通过 TDS 对 **Fabric 中的 SQL 数据库**进行深度性能诊断，涵盖查询存储、DMV、`sys.dm_db_resource_stats` 和扩展事件。所有分析查询均为只读；可选创建的 XE 会话将在调查结束时删除。

## 前提条件

- 工具和身份验证：请参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)和[§ SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access)。
- 权限：访问 DMV 需要 `VIEW DATABASE STATE`；创建 XE 会话需要 `ALTER ANY EVENT SESSION`。
- 连接到 **SQL 数据库（OLTP）终结点** — SQL 分析终结点不提供查询存储/DMV。

## 目录

| 主题 | 参考资料 |
|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) — **请先阅读** |
| SQL / TDS 数据平面访问（sqlcmd、身份验证） | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) |
| CLI 注意事项（受众、转义、过期） | [COMMON-CLI.md § 注意事项与故障排除](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) |
| 终结点选择（使用 OLTP） | [SQLDB-CONSUMPTION-CORE.md § 终结点选择](../../common/SQLDB-CONSUMPTION-CORE.md#endpoint-selection) |
| 性能与监视基础 | [SQLDB-CONSUMPTION-CORE.md § 性能与监视](../../common/SQLDB-CONSUMPTION-CORE.md#performance-and-monitoring) |
| 限制参考（不受支持的功能、DMV） | [SQLDB-AUTHORING-CORE.md § 限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference) |
| 镜像注意事项 | [SQLDB-AUTHORING-CORE.md § 镜像注意事项](../../common/SQLDB-AUTHORING-CORE.md#mirroring-considerations) |
| **所有诊断 T-SQL** | [references/query-reference.md](references/query-reference.md) |
| **调查工作流** | [SKILL.md § 调查工作流](#investigation-workflows) |
| **示例** | [references/examples.md](references/examples.md) |

有关 Fabric 拓扑、容量和平台身份验证基础知识，请参阅 [COMMON-CORE.md](../../common/COMMON-CORE.md)。

---

## 连接

诊断针对 **SQL 数据库（OLTP）终结点**运行。有关终结点发现、身份验证以及使用已安装的 `sqlcmd` 进行连接的指导，请使用 [COMMON-CLI.md](../../common/COMMON-CLI.md) 中的共享 CLI 说明，而不要在此处内联设置说明。调查期间不要执行其中的工具安装步骤。

首先使用已安装的 `sqlcmd`，并且最多只尝试连接一次。如果该工具不存在，或其 Entra 身份验证模式失败，请勿在调查期间安装或升级工具。如果当前 PowerShell 运行时已公开 `System.Data.SqlClient.SqlConnection`（通常为 Windows PowerShell 5.1），则最多使用该提供程序进行一次后备连接尝试，使用 `https://database.windows.net/` 的访问令牌，并运行相同的只读 T-SQL。如果该提供程序不可用，请报告没有兼容的预安装 TDS 客户端可用。如果连接失败，请显示相应错误。无论哪种情况，都应停止操作，而不是安装工具。

连接后，请使用下面的诊断工作流以及 [query-reference.md](references/query-reference.md) 中完整的 T-SQL 目录。

---

## 诊断领域

所有 SQL 均位于 [query-reference.md](references/query-reference.md) 中。分步编排流程请参阅下面的[调查工作流](#investigation-workflows)。

### 性能调查
- **波动查询检测**（[SQL](references/query-reference.md#volatile-query-detection-coefficient-of-variation)）— CV% > 100 = 阻塞、计划回归或参数嗅探。对于间歇性变慢，应将其作为**第一**步。
- **等待类别分析**（[SQL](references/query-reference.md#wait-category-analysis)）— 锁与 CPU、IO、内存之间的对比；按照根因决策树进行操作。
- **资源消耗最高的查询**（[SQL](references/query-reference.md#top-resource-consuming-queries--by-duration-last-hour)）— 按持续时间 / IO / CPU 排序。
- **最近发生回归的查询**（[SQL](references/query-reference.md#recently-regressed-queries)）— 过去一小时与此前 24 小时的对比。
- **多计划查询**（[SQL](references/query-reference.md#multi-plan-queries-plan-instability)）— 支持 `sys.sp_query_store_force_plan`，但应谨慎使用；自动优化可能会随着时间推移进行修正。

### 压力诊断
- **CPU 压力**（[SQL](references/query-reference.md#cpu-pressure-investigation)）— 10 分钟内 `avg_cpu_percent ≥ 80` = 持续高压；`non_cpu_to_cpu_ratio > 5` = 正在等待资源，而非受 CPU 限制。
- **IO 压力**（[SQL](references/query-reference.md#io-pressure-investigation)）— `avg_data_io_percent ≥ 80`（数据）；`avg_log_write_percent ≥ 80`（日志，通常由未批处理的 DML 导致）。
- **资源趋势**（[SQL](references/query-reference.md#resource-usage-overview)）— `sys.dm_db_resource_stats` 仅保留 **1 小时**内以 15 秒为间隔的样本；如需更长的时间窗口，请持久化这些数据或使用 Query Store。

### 阻塞诊断
> 默认启用优化锁定，因此不会发生传统的锁升级。大多数阻塞源于长时间运行的事务、应用程序端保持的事务或热点行争用。
- **实时阻塞**（[SQL](references/query-reference.md#live-blocking)）— 被阻塞的会话、首要阻塞者、阻塞链。如果首要阻塞者**处于空闲状态且 `open_transaction_count > 0`** → 应用程序正保持一个打开的事务；请修复客户端代码。
- **间歇性阻塞**（[SQL](references/query-reference.md#blocking--setup-extended-events-session)）— XE 会话的创建 / 读取 / 清理。**仅使用 `ON DATABASE`**（不要使用 `ON SERVER`）；使用 `ring_buffer` 目标。始终执行清理。

### 索引和统计信息健康状况
- **自动优化**（[SQL](references/query-reference.md#auto-tuning-recommendations-check-first)）— **始终先检查此项**；引擎会自动创建/删除索引。
- **DMV 缺失索引**（[SQL](references/query-reference.md#dmv-missing-index-recommendations)）— 仅当自动优化没有待处理项时检查。按 `index_advantage = user_seeks * avg_total_user_cost * (avg_user_impact * 0.01)` 排序。DMV 统计信息会在重启时重置。
- **统计信息陈旧度**（[SQL](references/query-reference.md#statistics-staleness-check)）— 默认值：`≥ 100,000 rows` 且修改比例 `≥ 10%`。
- **表访问模式**（[SQL](references/query-reference.md#table-access-patterns)）— 找出适合作为索引优化/反规范化候选项的热点表。

---

## 调查工作流

分步编排。每个步骤都链接到 [query-reference.md](references/query-reference.md) 中的对应查询。

### 工作流 1：“为什么 Fabric 中的 SQL 数据库运行缓慢？”
1. [资源使用情况概览](references/query-reference.md#resource-usage-overview)（过去 30 分钟）— 确认资源压力。
2. 如果 CPU/IO 压力持续存在 → [CPU 压力](references/query-reference.md#cpu-pressure-investigation)或 [IO 压力](references/query-reference.md#io-pressure-investigation)。
3. [易变查询检测](references/query-reference.md#volatile-query-detection-coefficient-of-variation)。
4. [等待类别分析](references/query-reference.md#wait-category-analysis)；按照根本原因决策树进行排查。
5. 如果以锁等待为主 → 工作流 3（阻塞）。如果以 CPU/IO 为主 → [资源消耗最高的查询](references/query-reference.md#top-resource-consuming-queries--by-duration-last-hour)和[多计划查询](references/query-reference.md#multi-plan-queries-plan-instability)。

### 工作流 2：“最近性能是否有所下降？”
1. [最近发生性能回退的查询](references/query-reference.md#recently-regressed-queries)（1 小时与 24 小时对比）。
2. 对于每个发生性能回退的查询 → 使用[多计划查询](references/query-reference.md#multi-plan-queries-plan-instability)检测计划变更。
3. 使用[资源使用情况概览](references/query-reference.md#resource-usage-overview)检查是否出现新的资源压力。
4. [自动优化建议](references/query-reference.md#auto-tuning-recommendations-check-first) — 最近的建议可能表明工作负载发生了变化。

### 工作流 3：“诊断阻塞”
1. [实时阻塞](references/query-reference.md#live-blocking)（被阻塞的会话、首要阻塞者、阻塞链）。
2. 如果发现阻塞 → 检查首要阻塞者的 `open_transaction_count`、SQL 文本和 `program_name`。
3. 如果首要阻塞者**处于空闲状态且 `open_transaction_count > 0`** → 存在应用程序缺陷；修复客户端代码（未提交的事务）。
4. 如果阻塞间歇性发生（没有实时行）→ [设置 XE 会话](references/query-reference.md#blocking--setup-extended-events-session)，等待一段时间，然后[读取 XE 数据](references/query-reference.md#read-xe-session-data)并[清理](references/query-reference.md#clean-up-xe-session)。
5. 解决模式：缩小事务范围；针对热点行争用使用 RCSI；检查是否因缺少索引而导致扫描。

### 工作流 4：“我应该添加索引吗？”
1. **首先**查看[自动优化建议](references/query-reference.md#auto-tuning-recommendations-check-first)。
2. 如果没有待处理的建议 → [DMV 缺失索引建议](references/query-reference.md#dmv-missing-index-recommendations)。
3. 对于特定表 → [特定表的缺失索引](references/query-reference.md#missing-indexes-for-a-specific-table)。
4. [统计信息过时检查](references/query-reference.md#statistics-staleness-check)——过时的统计信息可能产生虚假的“缺失索引”症状。

### 工作流 5：“资源消耗基线”
1. [资源使用情况概览](references/query-reference.md#resource-usage-overview)（过去 30 分钟）。
2. 按 CPU 查看[资源消耗最高的查询](references/query-reference.md#top-resource-consuming-queries--by-duration-last-hour)（过去 24 小时）。
3. [表访问模式](references/query-reference.md#table-access-patterns)——识别热点表。

---

## Fabric SQL 数据库约束（绝不要建议）

不受支持功能的完整列表：[SQLDB-AUTHORING-CORE.md § 限制参考](../../common/SQLDB-AUTHORING-CORE.md#limitations-reference)。对运维至关重要的项目：

| 不要建议 | 原因 | 替代建议 |
|---|---|---|
| 服务器范围的 DMV（`sys.dm_os_*`、`sys.configurations`） | 未公开 | `sys.dm_db_resource_stats`、查询存储视图 |
| 使用 `EXECUTE AS` 进行安全测试 | 不受支持 | 使用实际用户身份进行连接 |
| `CREATE EVENT SESSION ... ON SERVER`、以文件为目标的 XE | 仅支持数据库范围 | 使用 `... ON DATABASE` 和 `ring_buffer` 目标 |
| 跟踪标志 / `DBCC TRACEON` | 不受支持 | 重新设计查询，或使用查询存储提示 |
| 手动调整锁升级 | 优化锁定机制消除了锁升级 | 解决根本原因（长事务、热点行） |
| 使用 SQL 分析终结点进行诊断 | 其中不存在 DMV/查询存储 | 连接到 SQL 数据库（OLTP）终结点 |
| 激进使用 `sp_query_store_force_plan` | 会掩盖根本原因 | 首先修复统计信息/参数嗅探问题；仅将强制计划作为权宜之计 |

---

## 最佳实践

有关使用基础，请参阅 [SQLDB-CONSUMPTION-CORE.md § 性能和监控](../../common/SQLDB-CONSUMPTION-CORE.md#performance-and-monitoring)。

- **首先检测波动**——可快速缩小间歇性性能下降问题的范围。
- **使用 OLTP 终结点**——分析终结点没有查询存储/DMV。
- **信任自动优化**——只有当建议在具有代表性的时段内一直处于待处理状态后，才进行覆盖。
- **始终在调查结束时清理 XE 会话**。
- **调整 `DATEADD` 回溯时间窗口**，使其符合用户的调查范围。
- 如果需要超过 1 小时的历史记录，请**持久化 `sys.dm_db_resource_stats`**。
- **一段时间内 CV% 较高** → 需要进行结构性修复（RCSI、参数化、索引策略），而不是强制执行计划。

---

## 注意事项、规则和故障排除

CLI/身份验证问题：[COMMON-CLI.md § 注意事项](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific)。平台问题：[SQLDB-CONSUMPTION-CORE.md § 注意事项](../../common/SQLDB-CONSUMPTION-CORE.md#gotchas-and-troubleshooting-reference)。

### 必须执行
- 在推荐优化措施之前，先检查[约束](#fabric-sql-db-constraints-never-recommend)。
- 连接到 **SQL 数据库 (OLTP) 终结点**——绝不能连接到分析终结点。
- 对于间歇性性能下降，首先运行**波动检测**。
- 在建议手动创建索引之前，检查**自动优化**。
- 完成后**清理 XE 会话**。
- 报告实际查询输出——不得捏造。

### 建议执行
- 先从高级信号（资源趋势、波动检测）入手，然后再深入分析单个查询。
- 使用**等待类别**决策树，在阻塞、CPU、IO 或内存分析路径之间进行选择。
- 通过[调查工作流](#investigation-workflows)组合查询，以开展端到端调查。
- 使用 `-i file.sql` 执行 XE 会话创建代码块（here-doc 存在可移植性问题）。
- 在使用 CLI 查询的同时，使用 SQL 数据库的**性能仪表板**（Fabric 门户）获取可视化上下文。
- 在多语句脚本顶部设置 `SET NOCOUNT ON;`，以保持 CSV 输出整洁。

### 避免
- 推荐 Fabric 不支持的功能（CDC、Always Encrypted、内存中功能、账本、服务器作用域 DMV、文件目标 XE）。
- 在 **SQL 分析终结点**上运行诊断。
- 在调查期间安装或升级 SQL 客户端工具。
- 未先检查自动优化就手动创建索引。
- 调查结束后仍让 XE 会话保持运行。
- 通过 `sp_query_store_force_plan` 强制执行计划，而不是修复根本原因。
- 推荐锁升级优化（优化锁定机制消除了锁升级）。

### 故障排除

| 症状 | 原因 | 修复方法 |
|---|---|---|
| `Invalid object name 'sys.query_store_*'` | 正在查询分析终结点 | 连接到 OLTP 终结点 |
| 波动检测未返回任何行 | 回溯时间过短/近期无活动 | 将 `DATEADD(MINUTE, -60, ...)` 扩展为 `-1440` |
| `sys.dm_db_resource_stats` 为空 | 回溯时间超过 1 小时保留期限 | 缩短时间窗口；或使用 Query Store |
| DMV 权限错误 | 缺少 `VIEW DATABASE STATE` | `GRANT VIEW DATABASE STATE TO [user@tenant.com]` |
| `CREATE EVENT SESSION` 权限错误 | 缺少 `ALTER ANY EVENT SESSION` | `GRANT ALTER ANY EVENT SESSION TO [user@tenant.com]` |
| XE 会话未捕获任何内容 | LIKE 筛选条件过窄/会话处于 `STOP` 状态 | 检查 `sys.dm_xe_database_sessions.state`；放宽筛选条件 |
| 多计划查询没有明显的问题计划 | 参数嗅探 | `OPTION (RECOMPILE)` 或 `OPTIMIZE FOR` 提示 |

---

## 示例

完整的提示词/响应模式请参阅 [references/examples.md](references/examples.md)，其中涵盖：
- **诊断间歇性性能下降**——波动查询检测 → 等待分析
- **诊断实时阻塞**——存在空闲开放事务的首要阻塞者
- **推荐索引**——自动优化检查 → DMV 排名 → DDL 建议