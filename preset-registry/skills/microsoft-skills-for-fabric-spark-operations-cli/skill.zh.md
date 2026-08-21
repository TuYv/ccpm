---
name: spark-operations-cli
description: >
  Diagnose failed Spark jobs, unhealthy Livy sessions,
  and performance bottlenecks in Microsoft Fabric via read-only CLI triage.
  Use ONLY for FAILED/unhealthy runs; running a notebook and reporting its success status is
  `spark-authoring-cli`.
  Use when the user wants to: (1) diagnose why a Spark job, notebook run, or Lakehouse job failed,
  (2) triage stuck or dead Livy sessions, (3) identify OOM, shuffle spill, or data skew,
  (4) retrieve driver/executor logs or Spark Advisor findings,
  (5) copy event logs and start a local Spark History Server,
  (6) diagnose Spark activities in a failed pipeline run.
  Triggers: "diagnose my failed notebook", "why did my spark job fail",
  "triage spark failure", "diagnose pipeline run failure", "why did my pipeline fail",
  "livy session stuck in starting", "spark executor OOM",
  "check spark advisor findings", "shuffle spill diagnosis",
  "why did my lakehouse job fail", "diagnose lakehouse table load",
  "data skew diagnosis", "open spark history server locally", "spark job triage".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: spark-operations-cli`（`az rest`：`--headers "x-ms-fabric-skill=spark-operations-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项——但仍必须添加。

> **更新检查 — 每个会话一次（强制要求）**
> 在一个会话中首次使用此技能时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程 package.json 的版本。
> - 如果本会话早些时候已经执行过该检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **技能区分**：`spark-operations-cli` 用于对现有作业和会话进行**只读分诊与诊断**。如需创建笔记本、运行新作业或进行 Spark 开发，请使用 `spark-authoring-cli`。如需进行交互式 PySpark 分析和创建 Livy 会话，请使用 `spark-consumption-cli`。

# Spark 运维 — CLI 技能

此技能使用 Fabric REST API 和 CLI 工具（`az rest`）诊断 Microsoft Fabric Spark 作业故障、Livy 会话运行状况和性能瓶颈。所有诊断操作均为只读；会话清理（例如停止僵尸会话）需要用户明确确认。如需进行 Spark 开发和笔记本创作，请使用 `spark-authoring-cli`。如需进行交互式 PySpark 分析，请使用 `spark-consumption-cli`。

## 目录

目录按用途分组。在对当前故障进行分诊时，请从**诊断工作流**开始；前面的章节是基础参考资料。

### 1. Fabric 基础（概念）

| 任务 | 参考资料 | 备注 |
|---|---|---|
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) ||
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) ||
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；遇到任何身份验证问题前请先阅读 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) ||
| 分页 | [COMMON-CORE.md § 分页](../../common/COMMON-CORE.md#pagination) ||
| 长时间运行的操作（LRO） | [COMMON-CORE.md § 长时间运行的操作（LRO）](../../common/COMMON-CORE.md#long-running-operations-lro) ||
| 速率限制与节流 | [COMMON-CORE.md § 速率限制与节流](../../common/COMMON-CORE.md#rate-limiting--throttling) ||
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) ||
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) ||
| 常见陷阱与故障排除 | [COMMON-CORE.md § 常见陷阱与故障排除](../../common/COMMON-CORE.md#gotchas--troubleshooting) ||
| 最佳实践 | [COMMON-CORE.md § 最佳实践](../../common/COMMON-CORE.md#best-practices) ||

### 2. CLI 设置与身份验证

| 任务 | 参考 | 备注 |
|---|---|---|
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 在 Fabric 中查找工作区和项 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **必需** — *请先阅读链接* [用于按名称查找工作区 ID，或按名称、项类型和工作区 ID 查找项 ID] |
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程和令牌获取 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 az rest 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource https://api.fabric.microsoft.com`**，否则 `az rest` 会失败 |
| 分页模式 | [COMMON-CLI.md § 分页模式](../../common/COMMON-CLI.md#pagination-pattern) ||
| 长时间运行操作（LRO）模式 | [COMMON-CLI.md § 长时间运行操作（LRO）模式](../../common/COMMON-CLI.md#long-running-operations-lro-pattern) ||
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) | `az rest` 受众、shell 转义、令牌过期 |
| 快速参考：`az rest` 模板 | [COMMON-CLI.md § 快速参考：az rest 模板](../../common/COMMON-CLI.md#az-rest-template) ||
| 快速参考：令牌受众 / CLI 工具矩阵 | [COMMON-CLI.md § 快速参考：令牌受众 ↔ CLI 工具矩阵](../../common/COMMON-CLI.md#token-audience--cli-tool-matrix) | 每项服务应使用的 `--resource` 和工具 |

### 3. Spark 会话、Notebook 与作业（背景）

| 任务 | 参考 | 备注 |
|---|---|---|
| Livy 会话管理 | [SPARK-CONSUMPTION-CORE.md § Livy 会话管理](../../common/SPARK-CONSUMPTION-CORE.md#livy-session-management) | 会话创建、状态、生命周期、终止 |
| 交互式数据探索 | [SPARK-CONSUMPTION-CORE.md § 交互式数据探索](../../common/SPARK-CONSUMPTION-CORE.md#interactive-data-exploration) | 语句执行、输出检索、数据发现 |
| Notebook 执行与作业管理 | [SPARK-AUTHORING-CORE.md § Notebook 执行与作业管理](../../common/SPARK-AUTHORING-CORE.md#notebook-execution--job-management) ||

### 4. Spark 监控 API（主要分类诊断界面）

| 任务 | 参考 | 备注 |
|---|---|---|
| Spark 监控 API 概述 | [SPARK-MONITORING-CORE.md § 概述](../../common/SPARK-MONITORING-CORE.md#overview) | GA 监控 API — 无需活动会话 |
| 工作区与项级会话列表 | [SPARK-MONITORING-CORE.md § 工作区与项级会话列表](../../common/SPARK-MONITORING-CORE.md#workspace-and-item-level-session-listing) | 列出工作区中的 Spark 应用并进行筛选 |
| Spark Advisor API | [SPARK-MONITORING-CORE.md § Spark Advisor API](../../common/SPARK-MONITORING-CORE.md#spark-advisor-api) | **关键** — 自动检测数据倾斜、任务错误并提供建议 |
| 开源 Spark History Server API | [SPARK-MONITORING-CORE.md § 开源 Spark History Server API](../../common/SPARK-MONITORING-CORE.md#open-source-spark-history-server-apis) | 通过 REST 获取作业、阶段、执行器和 SQL 查询 |
| 驱动程序和执行器日志 API | [SPARK-MONITORING-CORE.md § 驱动程序和执行器日志 API](../../common/SPARK-MONITORING-CORE.md#driver-and-executor-log-apis) | 无需活动会话即可直接检索日志 |
| Livy 日志 API | [SPARK-MONITORING-CORE.md § Livy 日志 API](../../common/SPARK-MONITORING-CORE.md#livy-log-api) | 使用字节偏移量分页的会话级日志 |
| 资源使用情况 API | [SPARK-MONITORING-CORE.md § 资源使用情况 API](../../common/SPARK-MONITORING-CORE.md#resource-usage-api) | vCore 时间线、空闲/运行中核心、效率指标 |
| 监控诊断工作流 | [SPARK-MONITORING-CORE.md § 使用监控 API 的诊断工作流](../../common/SPARK-MONITORING-CORE.md#diagnostic-workflow-using-monitoring-apis) | 使用监控 API 进行逐步分类诊断 |

### 5. 诊断工作流（主动排查时从这里开始）

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 自动化诊断工作流（完整） | [automated-diagnostic-workflow.md](references/automated-diagnostic-workflow.md) | 步骤 1–7：解析 → 按状态分流 → 故障/性能/资源/健康状况 → 报告。包括步骤 1b 的过期数据回退机制和报告模板 |
| 诊断层级 | [diagnostic-workflow.md § 诊断层级](references/diagnostic-workflow.md#diagnostic-tiers) | 第 1 层（在线 REST）与第 2 层（本地 SHS） |
| 关键诊断模式 | [diagnostic-workflow.md § 关键诊断模式](references/diagnostic-workflow.md#key-diagnostic-patterns) | 症状 → 首要检查项 → 可能原因查询 |
| 严重程度阈值 | [diagnostic-workflow.md § 严重程度阈值](references/diagnostic-workflow.md#severity-thresholds) | 用于对发现的问题进行分类的指标阈值 |
| 手动 CLI 操作方法 | [diagnostic-workflow.md § 手动 CLI 操作方法](references/diagnostic-workflow.md#manual-cli-recipes) | 供手动使用的临时诊断命令 |
| 流水线运行诊断 | [pipeline-diagnosis.md](references/pipeline-diagnosis.md) | 诊断一次流水线运行中的所有 Spark 活动（步骤 P1–P6） |

### 6. 作业故障诊断

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 故障排查工作流 | [job-diagnostics.md § 故障排查工作流](references/job-diagnostics.md#failure-triage-workflow) | 用于诊断故障的分步决策树 |
| 作业故障分类 | [job-diagnostics.md § 故障分类](references/job-diagnostics.md#failure-classification) | OOM、shuffle、超时、依赖项和配置错误 |
| 通过 REST 读取 Spark 日志 | [job-diagnostics.md § 通过 REST 读取 Spark 日志](references/job-diagnostics.md#reading-spark-logs-via-rest) | 从 Livy 检索 driver/executor 日志 |
| 作业实例历史记录 | [job-diagnostics.md § 作业实例历史记录](references/job-diagnostics.md#job-instance-history) | 查询近期运行记录、比较持续时间、检测性能回退 |

### 7. Livy 会话健康状况

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 会话健康状况评估 | [session-health.md § Livy 会话生命周期](references/session-health.md#livy-session-lifecycle) | 会话状态、状态转换和预期持续时间 |
| 空闲和僵尸会话检测 | [session-health.md § 空闲和僵尸会话检测](references/session-health.md#idle-and-zombie-session-detection) | 查找并清理泄漏的会话 |
| 会话资源监控 | [session-health.md § 会话资源监控](references/session-health.md#session-resource-monitoring) | 通过 Livy 监控内存和 executor 使用情况 |
| 会话恢复模式 | [session-health.md § 会话恢复模式](references/session-health.md#session-recovery-patterns) | 重启策略和会话替换 |

### 8. 性能诊断

| 任务 | 参考资料 | 说明 |
|---|---|---|
| 性能反模式 | [performance-patterns.md § 反模式](references/performance-patterns.md#anti-patterns) | spill、shuffle、数据倾斜、小文件和 collect 误用 |
| Stage 和 Task 分析 | [performance-patterns.md § Stage 和 Task 分析](references/performance-patterns.md#stage-and-task-analysis) | 通过 REST 读取 Spark UI 指标 |
| 优化方法 | [performance-patterns.md § 优化方法](references/performance-patterns.md#optimization-recipes) | 分区调优、广播 join 和缓存 |
| 容量和资源诊断 | [performance-patterns.md § 容量和资源诊断](references/performance-patterns.md#capacity-and-resource-diagnostics) | CU 消耗和限流检测 |

### 9. 离线/深度分析工具

| 任务 | 参考资料 | 说明 |
|---|---|---|
| JobInsight 事件日志复制 | [jobinsight-api.md § LogUtils.copyEventLog](references/jobinsight-api.md#logutilscopyeventlog) | 将事件日志从 Fabric 复制到 OneLake，以便进行离线分析 |
| 本地 Spark History Server | [spark-history-server.md § Overview](references/spark-history-server.md#overview) | 启动本地 SHS，以使用完整的 Spark UI（DAG、任务、SQL 计划） |

---

## 必须/建议/避免

### 必须执行

- 尝试修复之前，始终先获取作业/会话状态
- 使用 [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) 中的工作区和项目发现方式——切勿硬编码 ID
- 提交诊断语句之前，检查 Livy 会话状态
- 遵循[故障分类工作流](references/job-diagnostics.md#failure-triage-workflow)进行系统化诊断
- 读取原始日志之前，始终先检查 Spark Advisor API——它通常能立即识别根本原因
- 尝试基于 Livy 的诊断之前，先使用监控 API（无需活动会话）
- 以 10–30 秒的间隔轮询作业/会话状态；诊断在 30 分钟后超时
- 始终在诊断输出中包含 Notebook 快照 URL——它的保留时间最长，并支持在 Fabric UI 中进行单元格级检查

### 建议

- 在判定为回归问题之前，查询作业实例历史记录以建立基线
- 重用现有的空闲会话执行诊断查询，而不是创建新会话
- 当作业运行缓慢时，先检查容量利用率，再归咎于 Spark 代码
- 使用带 JMESPath 筛选的 `az rest`，从大型 API 响应中提取特定字段
- 对于倾斜、任务错误和超时检测，优先使用 Spark Advisor API，而不是手动解析日志
- 在建议扩容之前，使用 Resource Usage API 的 `coreEfficiency` 指标量化集群利用率
- 在深入分析之前，比较作业实例历史记录（最近 5 次运行）以检测回归
- 对于 MLV 刷新调度、监控或运行历史记录，请使用 [mlv-operations-cli](../mlv-operations-cli/SKILL.md)。对于底层 Spark 作业故障（OOM、倾斜、shuffle 溢出）的诊断，请继续使用此技能——MLV 刷新以 Spark 作业的形式执行，其日志可通过相同的监控 API 访问。
- **MLV 故障分类**——诊断失败的 MLV 刷新时，请先对错误进行分类，再深入分析：

  | 错误模式 | 类别 | 诊断路径 |
  |--------------|----------|----------------|
  | `MLV_SPARK_SESSION_REQUEST_SUBMISSION_FAILED` | 基础设施 | 容量已暂停/不可用，或 Spark 池配置错误。首先检查容量状态。 |
  | `MLV_SELECTED_NOT_FOUND` | 配置 | MLV 表已被删除/重命名。通过 `SHOW MATERIALIZED LAKE VIEWS IN schema` 验证该表是否存在。 |
  | `OutOfMemoryError` / `SparkOutOfMemory` | 资源 | 源数据增长已超出集群容量。检查 Spark Advisor 是否存在内存压力。 |
  | `ShuffleBlockFetchFailed` / 数据倾斜 | 性能 | 数据分布不均。使用 Resource Usage API 识别倾斜分区。 |
  | `DeltaTableVersionNotFound` | 依赖项 | 源表已执行清理，低于保留期限阈值。延长 `delta.logRetentionDuration`。 |
  | `ConstraintViolationException` / `ON MISMATCH` | 数据质量 | DQ 约束丢弃了行或导致行处理失败。检查上游源数据质量。 |
  | 超时（运行超过 24 小时） | 规模 | 血缘关系规模过大，无法在单次运行中完成。将其拆分为跨多个 Lakehouse 的较小血缘关系组。 |

### 避免

- 未检查会话是否有活动语句就终止会话
- 为每个诊断查询创建新会话（应复用空闲会话）
- 未检查 Livy 的实际内存指标就认定发生了 OOM
- 在诊断脚本中硬编码工作区或项 ID
- 未先通过 Admin API 检查容量限制就诊断性能问题
- 向处于 `busy` 状态的会话提交诊断语句

---

## 示例

### 示例 1：诊断失败的 Notebook

用户提示：*"为什么工作区 Production 中的 Notebook ETL_Daily 失败了？"*

智能体工作流：
1. 解析工作区 → `workspaceId`，项 → `itemId`（Notebook）
2. 列出最近的 Livy 会话，自动选择处于 Failed 状态的会话
3. 查询 Spark Advisor → 发现执行器上出现 `TaskError: OutOfMemoryError`
4. 查询 `/stages` → 确认存在数据倾斜（第 5 阶段的最大值/中位数比率为 12 倍）
5. 提供包含 HIGH 级别发现和修复建议的报告

### 示例 2：排查卡住的 Livy 会话

用户提示：*"我的 Livy 会话 abc-1234 卡在 starting 状态"*

智能体工作流：
1. 直接使用会话 ID，查询会话状态
2. 列出工作区中的所有会话 → 检测到 8 个并发会话（容量压力）
3. 检查 Livy 日志 → 没有错误，只是在排队
4. 报告：容量争用，建议等待或取消空闲会话

### 示例 3：确定 Pipeline 失败的根本原因

用户提示：*"诊断工作区 Analytics 中的 Pipeline 运行 5678"*

智能体工作流：
1. 解析 Pipeline，针对运行 5678 调用 `queryActivityRuns`
2. 发现 2 个 Notebook 活动：一个 Succeeded，一个 Failed
3. 从失败的活动中提取 `output.result.error.{ename, evalue, traceback}`
4. 构造 Notebook Snapshot URL，以便在单元格级别进行检查
5. 提供错误详情、快照链接和修复建议

---

## 快速开始

### 环境设置

应用 [COMMON-CLI.md](../../common/COMMON-CLI.md#authentication-recipes) 中的环境检测，以设置：
- `$FABRIC_API_BASE` 和 `$FABRIC_RESOURCE_SCOPE`
- 用于 Livy 操作的 `$FABRIC_API_URL` 和 `$LIVY_API_PATH`

**身份验证**：使用 [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) 中的令牌获取方式。

---

## 自动化诊断工作流

当用户提供简单提示时（例如，*"诊断我的 Notebook ETL_Pipeline"*、*"Spark 应用程序 abc-123 出了什么问题"*、*"检查工作区 Production 是否存在问题"*），请遵循以下**快速路径**摘要。有关完整过程、边缘情况（过期数据、仅限 Pipeline 的会话）、报告模板和保留期详情，请参阅 [references/automated-diagnostic-workflow.md](references/automated-diagnostic-workflow.md)。

### 入口点（用户提供的内容）

| 用户提供 | 智能体解析 |
|---|---|
| 工作区名称 | → `workspaceId`（通过工作区列表和名称筛选器） |
| Notebook / SJD / Lakehouse 名称 | → `itemId`（通过项列表和名称/类型筛选器） |
| Pipeline 名称 + 运行 ID | → 子 Spark 活动 → 请参阅 [pipeline-diagnosis.md](references/pipeline-diagnosis.md) |
| Livy 会话 ID 或 Spark 应用程序 ID | → 直接使用 |
| 未提供具体信息 | → 询问工作区名称和项名称 |

### 项目类型 API 路径

| 项目类型 | Livy 会话路径 | 作业实例路径 |
|---|---|---|
| Notebook | `/notebooks/{id}/livySessions` | `/items/{id}/jobs/instances` |
| Spark 作业定义 | `/sparkJobDefinitions/{id}/livySessions` | `/items/{id}/jobs/instances` |
| Lakehouse | `/lakehouses/{id}/livySessions` | `/lakehouses/{id}/jobs/instances` |

所有会话 API 路径均遵循：`$FABRIC_API_URL/workspaces/$workspaceId/<itemTypePath>/$itemId/livySessions/$livyId/applications/$appId/<endpoint>` — 请参阅 [SPARK-MONITORING-CORE.md](../../common/SPARK-MONITORING-CORE.md)。

### 步骤概览

| 步骤 | 执行时机 | 操作 | 自动标记规则 |
|---|---|---|---|
| **1. 解析与发现** | 始终 | 解析工作区 → 项目 → 列出最近的 Livy 会话；若结果明确则自动选择，否则提示用户 | — |
| **1b. 回退** | 会话返回 404 / Spark Monitoring 数据已过期 | 尝试 `queryActivityRuns`（管道）→ 作业实例 `failureReason` → 构造 Notebook 快照 URL | 请参阅[参考文档 § 步骤 1b](references/automated-diagnostic-workflow.md#step-1b--fallback-session-not-found--data-expired) |
| **2. 按状态分流** | 步骤 1 之后 | `Failed` → 3+4+5 · `Succeeded`/`InProgress` → 4+5 · `Cancelled` → 日志+3 · `idle`/`busy`/`starting` → 6 · `dead`/`killed`/`error` → 3+6 | — |
| **3. 故障分析** | Failed / Cancelled / dead | 按顺序查询：Spark Advisor → 驱动程序 stderr → 作业实例 → 执行器日志 → Livy 日志 → 资源使用情况。根本原因明确后停止。 | 与 [job-diagnostics.md § 快速参考表](references/job-diagnostics.md#quick-reference-table)进行匹配 |
| **4. 性能** | 始终（1b 路径除外） | `/stages`、`/allexecutors` | 倾斜 `max/median > 3×` · 溢写 `diskBytesSpilled > 0` · GC `jvmGcTime/executorRunTime > 20%` · shuffle `> 1 GB` · 任务 `< 100ms` |
| **5. 资源利用率** | 始终（1b 路径除外） | `/resourceUsage` | `coreEfficiency < 0.3` → HIGH · `idleTime/duration > 0.4` → MEDIUM |
| **6. 会话健康状况** | 空闲/僵尸检查 | `GET /workspaces/$workspaceId/spark/livySessions` | `idle` + 无最近语句 → 僵尸会话 · `starting` 超出预期时长 → 容量问题 |
| **7. 汇总报告** | 最后 | 按严重程度排序的发现项表格 + Notebook 快照链接 + 建议的修复措施 | 有关模板，请参阅[参考文档 § 步骤 7](references/automated-diagnostic-workflow.md#step-7--compile--present-report) |

> **关键原则**：始终首先检查 **Spark Advisor** — 它是预先计算的，无需解析日志即可识别大多数根本原因。管道运行可通过 `queryActivityRuns` 获取最丰富的错误数据（`ename`、`evalue`、`traceback`、单元格/行）— 请参阅 [pipeline-diagnosis.md](references/pipeline-diagnosis.md)。

> **数据保留警告**：Spark Monitoring API 数据（日志、阶段、Advisor）通常会在会话结束后的**几分钟到几小时内**过期。请及时诊断故障。如果 API 返回 404，请跳转到[参考文档](references/automated-diagnostic-workflow.md#step-1b--fallback-session-not-found--data-expired)中的步骤 1b。

> **第 2 级升级处理**：对于数据截断、HTTP 408/504 或 DAG/SQL 计划可视化需求，建议使用[离线 Spark History Server 工作流](references/spark-history-server.md)。