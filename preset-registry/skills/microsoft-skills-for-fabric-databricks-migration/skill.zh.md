---
name: databricks-migration
description: "Ports existing Databricks notebooks and jobs to Fabric, covering dbutils to notebookutils, secret scopes to Key Vault, DBFS to OneLake, Unity Catalog mapping to schema-enabled Lakehouses, Jobs and Delta Live Tables to Spark Job Definitions and Pipelines, and Photon to the Native Execution Engine. Use whenever Databricks code has to be converted. For Fabric notebook code that is not being migrated, use spark-cli."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: databricks-migration`（`az rest`：`--headers "x-ms-fabric-skill=databricks-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍必须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. `dbutils.widgets` 在 Fabric 中**没有直接等价物**——请使用笔记本参数（单元格标签 `parameters`）；`notebookutils.runtime.context` 是执行元数据，而不是参数存储。如果展示上下文字段，请使用已记录的名称，例如 `currentWorkspaceId`、`currentWorkspaceName`、`currentNotebookId`、`currentNotebookName`、`isForPipeline` 和 `isForInteractive`；`activityId` 是 Livy 作业 ID
> 4. `dbutils.library`（运行时库安装）**没有等价物**——请使用 Fabric Environments 进行可复现的库管理
> 5. 默认将每个 Unity Catalog catalog 映射到一个启用架构的 Lakehouse。这会保留源 `schema.table` 层次结构，其中 Lakehouse 表示 catalog；仅当有意将多个 catalog 合并到一个 Lakehouse 中时才会发生冲突
> 6. 对于范围未明确的工作区级迁移，在推荐 Fabric 拓扑之前，应针对资产清单、工作负载拓扑、安全性、数据位置和运行时约束提出聚焦问题
> 7. 已完成的 Fabric 迁移不得在双运行时分支或 `try/except` 防护中保留可执行的 `dbutils.*` 调用——应直接替换这些调用和 Databricks 路径

# Databricks → Microsoft Fabric 迁移

## 前置知识

在执行迁移任务之前，请阅读以下配套文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项目发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — 笔记本部署、Lakehouse 创建、Spark 作业执行

有关笔记本和 Lakehouse 的创建，请参阅 [spark-cli](../spark-cli/SKILL.md)。
有关 Fabric Warehouse DDL/DML 编写，请参阅 [sqldw-cli](../sqldw-cli/SKILL.md)。

---

## 目录

| 主题 | 参考 |
|---|---|
| **迁移编排器** | [migration-orchestrator.md](resources/migration-orchestrator.md) |
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| 完整的 `dbutils` → `notebookutils` 映射 | [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| Unity Catalog → Fabric Lakehouse 架构 | [catalog-migration.md](resources/catalog-migration.md) |
| 迁移前/迁移后代码模式 | [code-patterns.md](resources/code-patterns.md) |
| 集群配置 → Fabric Spark 池 | [§ 集群配置 → Fabric Spark 池](#cluster-config--fabric-spark-pools) |
| Databricks 作业 → Spark 作业定义 | [§ Databricks 作业 → Spark 作业定义](#databricks-jobs--spark-job-definitions) |
| Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式 | [§ Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式](#delta-sharing--fabric-external-data-sharing-and-onelake-shortcuts) |
| MLflow → Fabric ML 实验 | [§ MLflow → Fabric ML 实验](#mlflow--fabric-ml-experiments) |
| 迁移后验证与测试 | [validation-testing.md](resources/validation-testing.md) |
| 迁移注意事项与故障排除 | [migration-gotchas.md](resources/migration-gotchas.md) |
| 多笔记本迁移协议 | [§ 多笔记本迁移协议](#multi-notebook-migration-protocol) |
| 故障报告 | [§ 故障报告](#failure-reporting) |
| 必须 / 优先 / 避免 | [§ 必须 / 优先 / 避免](#must--prefer--avoid) |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition) |
| Lakehouse 管理 | [SPARK-AUTHORING-CORE.md § Lakehouse 管理](../../common/SPARK-AUTHORING-CORE.md#lakehouse-management) |
| 笔记本管理 | [SPARK-AUTHORING-CORE.md § 笔记本管理](../../common/SPARK-AUTHORING-CORE.md#notebook-management) |

### 上下文加载指南

> **重要——仅加载所需内容。** 不要预先读取所有资源文件。请读取与当前执行阶段对应的特定文件：

| 何时 | 读取此文件 |
|---|---|
| 用户要求迁移工作区（完整编排） | [migration-orchestrator.md](resources/migration-orchestrator.md) |
| 应用代码转换（dbutils、命名空间、路径） | [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) + [code-patterns.md](resources/code-patterns.md) |
| 解决 Unity Catalog 命名空间冲突 | [catalog-migration.md](resources/catalog-migration.md) |
| 迁移后验证 | [validation-testing.md](resources/validation-testing.md) |
| 排查故障或已知问题 | [migration-gotchas.md](resources/migration-gotchas.md) |

---

## 迁移工作负载映射

| Databricks 组件 | Fabric 目标 | 严重性 | 备注 |
|---|---|---|---|
| **通用计算集群**（notebooks、REPL） | Fabric Notebook（Starter Pool 或 Custom Pool） | 信息 | 没有持久化集群——Fabric 会在会话启动时预配计算资源 |
| **作业集群**（自动化作业） | **Spark Job Definition (SJD)** | 信息 | SJD 与使用作业集群的 Databricks Jobs 一一对应 |
| **Unity Catalog** | **Fabric Lakehouse**（启用架构，每个目录一个） | 信息 | 启用架构的 Lakehouse 会保留 `schema.table`；默认的每个目录一个 Lakehouse 不会发生冲突——请参阅 [catalog-migration.md](resources/catalog-migration.md) |
| **Databricks Repos**（由 Git 支持的 notebooks） | **Fabric Git Integration** | 信息 | 将工作区连接到 Azure DevOps 或 GitHub；notebooks 会同步 |
| **Delta Live Tables (DLT)** | **Fabric Notebooks** + **Data Pipelines** | 阻断项 | 没有 DLT 的等效功能——将 DLT 数据集重写为带参数的 notebook 单元格，并通过管道进行编排 |
| **Databricks SQL Warehouses** | **Fabric Warehouse** 或 **Lakehouse SQL Endpoint** | 信息 | SQL warehouse 会话 → Warehouse（用于写入）或 SQL Endpoint（仅用于读取） |
| **MLflow Tracking** | **Fabric ML Experiments** | 信息 | Fabric 支持 MLflow SDK——请参阅 [§ MLflow](#mlflow--fabric-ml-experiments) |
| **Delta Sharing** | **OneLake Shortcuts** + **Fabric external data sharing** | 警告 | 请参阅 [§ Delta Sharing → Fabric External Data Sharing and OneLake Shortcuts](#delta-sharing--fabric-external-data-sharing-and-onelake-shortcuts) |
| **Databricks Feature Store** | **Lakehouse/Delta 表上的特征工程** + MLflow | 警告 | Fabric 没有可直接替代的托管 Feature Store；请在 Lakehouse 中将特征表重新创建为 Delta 表，并通过 notebooks/MLflow 管理特征。在确定方案前，请确认当前 Fabric 特征存储的路线图 |
| **dbutils**（所有子模块） | **`notebookutils`**（大多数子模块） | 信息 | 完整映射请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| **Scala notebooks** | Fabric Notebook（Spark/Scala） | 警告 | 支持 Scala；将单元格魔法 `%scala` 替换为 `%%spark`，并重写 Databricks 特有的 API/库 |
| **R notebooks** | Fabric Notebook（SparkR） | 警告 | 支持 SparkR；将单元格魔法 `%r` 替换为 `%%sparkr`，验证软件包是否可用，并重写 Databricks 特有的 API |

### 严重性定义

| 级别 | 含义 | 操作 |
|---|---|---|
| **阻断项** | 无法在 Fabric 中运行，除非重新设计或由用户作出决策 | 停止 — 呈现给用户，要求解决 |
| **警告** | 可以迁移，但需要验证或架构决策 | 迁移并添加审查标记 |
| **信息** | 可直接替换级别的变更 | 自动迁移 |

---

## `dbutils` → `notebookutils` 快速参考

完整的并列 API 表请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md)。主要映射如下：

| `dbutils` 调用 | `notebookutils` 等效调用 | 兼容性说明 |
|---|---|---|
| `dbutils.fs.ls(path)` | `notebookutils.fs.ls(path)` | **直接替换** |
| `dbutils.fs.cp(src, dest)` | `notebookutils.fs.cp(src, dest)` | **直接替换** |
| `dbutils.fs.mv(src, dest)` | `notebookutils.fs.mv(src, dest, create_path, overwrite=False)` | ⚠️ 签名不同 — 请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| `dbutils.fs.rm(path, recurse)` | `notebookutils.fs.rm(path, recurse)` | **直接替换** |
| `dbutils.fs.mkdirs(path)` | `notebookutils.fs.mkdirs(path)` | **直接替换** |
| `dbutils.fs.put(path, contents)` | `notebookutils.fs.put(path, contents)` | **直接替换** |
| `dbutils.fs.head(path, maxBytes)` | `notebookutils.fs.head(path, max_bytes)` | ⚠️ 默认值不同 — Python/Scala 为 100 KB，R 为 64 KB。请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| `dbutils.fs.mount(...)` | `notebookutils.fs.mount(source, mountPoint, extraConfigs=None)` | ✅ **支持** — 支持 Microsoft Entra（默认）、`accountKey` 或 `sasToken` 身份验证。对于跨工作区 / 持久共享，优先使用 **OneLake Shortcuts** |
| `dbutils.secrets.get(scope, key)` | `notebookutils.credentials.getSecret(keyVaultUrl, secretName)` | 将 scope 映射到 Key Vault URL；将 key 映射到 secret name |
| `dbutils.notebook.run(path, timeout, args)` | `notebookutils.notebook.run(name, timeout, args)` | 将 `path` 映射到 notebook `name`（相对于工作区） |
| `dbutils.notebook.exit(value)` | `notebookutils.notebook.exit(value)` | **直接替换** |
| `dbutils.widgets.get(name)` | 请参阅 [§ 小组件迁移](#widgets-migration) | 没有直接等效项 |
| `dbutils.library.install(...)` | **运行时不可用** — 使用 **Fabric Environments** | `dbutils.library.restartPython()` → `notebookutils.session.restartPython()` |
| `dbutils.data.summarize(df)` | `display(df.summary())` | 使用 `display()` 或 pandas `describe()` |

### 小组件迁移

`dbutils.widgets` 在 Fabric 中没有直接等效项。请改用以下模式：

| 使用场景 | Fabric 模式 |
|---|---|
| 从父 notebook 传递参数 | 将子 notebook 中的一个单元格标记为 **parameters cell**（notebook UI：单元格“...”菜单 → “Mark cell as parameters”）。父 notebook 调用 `notebookutils.notebook.run("child", arguments={"param": "value"})` — 运行时，引擎会在 parameters cell 下方插入一个新单元格，以覆盖默认值 |
| Pipeline 驱动的参数化 | 使用相同的 parameters-cell 机制；Fabric Pipeline notebook activity 通过其 **Base parameters** 设置提供覆盖值 |
| 集中式跨 notebook 配置 | 使用 `notebookutils.variableLibrary.getLibrary("<name>")` 从 Variable Library 项中读取值（deployment pipelines 会在每个阶段激活相应的值集） |
| notebook 中的交互式选择 | 使用带有输入单元格的 `display()`、IPython widgets（仅限 Python）或 Fabric Data Activator |

> 注意：`notebookutils.runtime.context` **不会公开参数值**。它用于执行元数据（工作区/笔记本/活动/用户 ID、管道与交互式执行标志等）。请参阅 [dbutils-to-notebookutils.md § 运行时上下文](resources/dbutils-to-notebookutils.md#runtime-context)。

---

## 集群配置 → Fabric Spark 池

| Databricks 集群概念 | Fabric Spark 等效项 | 备注 |
|---|---|---|
| 全能集群（交互式） | **Starter Pool** | 自动预配；无需配置；非常适合笔记本 |
| 作业集群（供作业一次性使用） | 附加到 SJD 的 **Custom Pool**（或 Starter Pool） | 在 Fabric 容量设置中配置节点大小和自动缩放 |
| 节点类型（例如 `Standard_DS3_v2`） | **Fabric 节点大小**（Small/Medium/Large/X-Large/XX-Large） | 按 vCore/内存比例进行映射 |
| 自动缩放最小/最大工作节点数 | Custom Pool 的**最小/最大节点**设置 | 可在工作区 Spark 设置中使用 |
| 集群设置中的 `spark.conf` | **Fabric Environment** Spark 属性 | 移至 Environment 项；附加到工作区或笔记本 |
| `init_scripts`（集群初始化） | **Fabric Environment** 安装脚本 | 并不完全等效——仅支持库安装 |
| Databricks Runtime 版本 | **Fabric Runtime**（1.1 = Spark 3.3，1.2 = Spark 3.4，1.3 = Spark 3.5） | 选择匹配的 Spark 版本；测试已弃用的 API |
| Photon 加速器 | **Fabric Native Execution Engine (NEE)** | 在工作区 Spark 设置中启用；提供类似 Photon 的向量化执行 |

---

## Databricks 作业 → Spark 作业定义

| Databricks 作业概念 | Fabric SJD 等效项 | 备注 |
|---|---|---|
| 包含单个笔记本任务的作业 | 引用笔记本的 **SJD** | 附加默认 Lakehouse；通过 SJD 参数传递参数 |
| 多任务作业（任务 DAG） | 用于编排多个 SJD/笔记本的 **Fabric Data Pipeline** | 管道活动映射到作业任务；依赖关系 = 活动依赖关系 |
| 作业计划（cron） | **管道计划触发器** | Cron 表达式 → 管道中的重复触发器 |
| 作业参数 | **SJD 默认参数**或**笔记本单元格参数** | 笔记本中的参数单元格会在运行时注入 |
| 每个任务的作业集群 | **附加到 SJD 的池** | 每个 SJD 都可以独立指定其 Spark 池 |
| Databricks Workflows | **Fabric Data Pipelines** | 支持条件、循环和失败分支的完整 DAG 编排 |

> **委托给 `spark-cli`** 完成 SJD 创建和笔记本部署。

---

## Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式

| Databricks Delta Sharing 模式 | Fabric 等效项 |
|---|---|
| 提供方发布 Delta 共享 | 对跨租户 Fabric 数据使用 Fabric **外部数据共享**，或创建指向 Delta 数据所在 ADLS Gen2 的 OneLake 快捷方式 |
| 接收方读取共享数据 | 将外部数据共享接受到 Lakehouse 中（Fabric 会创建只读 OneLake 快捷方式），或直接创建指向可访问 ADLS Gen2 数据的 **OneLake 快捷方式** |
| 组织内跨工作区共享表 | 指向另一个工作区 Lakehouse 表的 **OneLake 快捷方式**——无需复制数据 |
| 跨租户共享 | Fabric **外部数据共享**——通过接收方租户中的快捷方式，以实时、只读且原地的方式访问 |

在生成迁移工作负载映射时，同时包含两种路径：针对可访问的 ADLS 或同租户 OneLake 数据，使用直接的 OneLake Shortcuts；针对原生跨租户接收方共享，使用 Fabric 外部数据共享。

---

## MLflow → Fabric ML 实验

Fabric ML 实验基于 MLflow SDK 构建——大多数代码都可以直接移植：

| Databricks MLflow 模式 | Fabric 等效项 | 迁移操作 |
|---|---|---|
| `mlflow.set_tracking_uri("databricks")` | 删除 — Fabric 会自动进行跟踪 | 在 Fabric 笔记本中删除此行 |
| `mlflow.set_experiment("/path/exp")` | `mlflow.set_experiment("experiment_name")` | 仅使用名称（不要使用路径）；Fabric 会创建 Experiment 项 |
| `mlflow.log_metric(...)` | `mlflow.log_metric(...)` — **完全相同** | 无需更改 |
| `mlflow.log_artifact(...)` | `mlflow.log_artifact(...)` — **完全相同** | 无需更改 |
| `mlflow.autolog()` | `mlflow.autolog()` — **完全相同** | 无需更改 |
| `mlflow.register_model(...)` | `mlflow.register_model(...)` — **完全相同** | Fabric ML 提供模型注册表 |
| Databricks 模型服务 | **Azure ML Online Endpoints** 或 **Fabric Data Activator** | Fabric 目前尚无直接的模型服务功能 — 使用 Azure ML |

---

## 必须 / 优先 / 避免

### 必须执行
- **在确定工作区拓扑前进行清点** — 对于省略了工作负载清单、依赖项、安全要求、数据位置或运行时约束的工作区级请求，先提出有针对性的澄清问题，并在选择 Fabric 设计之前给出有条件的选项
- 根据 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) 中的映射**替换所有 `dbutils.*` 调用** — Fabric 笔记本不提供 `dbutils`
- **将 `dbutils.fs.mount()` 迁移为 `notebookutils.fs.mount()`**（✅ 支持 — 默认使用 Microsoft Entra，也可以使用来自 Key Vault 的 `accountKey` / `sasToken`）。对于跨工作区或持久化共享，优先使用 **OneLake Shortcuts**。始终在 `try/finally` 中将 `mount()` 与 `unmount()` 配对使用 — Fabric 挂载不会在会话结束时自动释放
- **将 `dbutils.secrets.get(scope, key)` 替换为** `notebookutils.credentials.getSecret(keyVaultUrl, secretName)` — 机密范围映射到 Azure Key Vault URL
- **重新设计基于小组件的参数传递**，使用笔记本的**参数单元格**（单元格“...”菜单 → “Mark cell as parameters”）；使用 `notebookutils.variableLibrary` 集中管理跨笔记本配置。`notebookutils.runtime.context` **不会**公开参数值
- **将 `dbutils.library.install*()` 替换为** Fabric **Environments** — 生产环境不支持运行时库安装。`dbutils.library.restartPython()` 映射为 `notebookutils.session.restartPython()`（仅适用于 Python / PySpark）
- **有意地映射 Unity Catalog 命名空间** — 默认每个 catalog 使用一个启用架构的 Lakehouse，以保留 `schema.table`；仅在将多个 catalog 合并到一个 Lakehouse 时，才要求用户批准命名策略。请参阅 [catalog-migration.md](resources/catalog-migration.md)
- **将 Databricks 集群初始化脚本映射到 Fabric Environments** — 集群级库安装必须迁移到 Environment 项中

### 优先采用
- **Fabric Native Execution Engine (NEE)** 作为 Photon 的等效方案——在工作区 Spark 设置中启用，以便在 Delta Lake 上执行向量化
- 对于 ADLS Gen2 中已存在的 Delta 表，优先使用 **OneLake Shortcuts**，而不是复制数据——直接指向数据，无需重新摄取
- 使用 **Fabric Git Integration** 替代 Databricks Repos——将工作区连接到 ADO 或 GitHub，以实现 notebook 版本控制
- 使用 **Fabric ML Experiments** 实现 MLflow 的直接延续——跟踪代码只需进行最少的更改（移除 `set_tracking_uri`）
- 在重构迁移的 Databricks catalogs 时采用 **Medallion architecture**——将 `bronze`、`silver`、`gold` Unity Catalog schemas 对齐到不同的 Fabric Lakehouses
- 迁移交互式 notebook 工作流时使用 **Starter Pool**——消除 Databricks job clusters 中常见的集群启动时间问题

### 避免采用
- **当缺少源环境清单和迁移约束时，不要规定一种适用于所有情况的工作区拓扑**
- **不要在 Fabric notebooks 中导入 `dbutils` 或尝试执行 `dbutils = ...` 赋值**——导入尝试会失败并产生 `ModuleNotFoundError`，而未解析的 `dbutils` 引用会产生 `NameError`；始终使用 `notebookutils`
- **不要将 `dbutils.*` 调用保留在运行时检测守卫中**（`try/except`、`if IS_DATABRICKS`）——直接将这些调用和 Databricks 路径替换为 `notebookutils` 和 Fabric 路径
- **不要假设 Unity Catalog 治理策略会自动迁移**——必须在 Fabric 中使用工作区角色和 Lakehouse 权限重新配置 RBAC、行级安全性和列掩码
- **不要在生产 Fabric notebooks 中运行时使用 `%pip install`**——使用 Fabric Environments 进行稳定且有版本控制的库管理
- **不要尝试逐字迁移 Delta Live Tables (DLT) pipelines**——DLT 没有对应的 Fabric 方案；应将其重写为由 Fabric Pipelines 编排的参数化 notebooks
- **不要依赖 Databricks 专用的 Spark 配置**（例如 `spark.databricks.*`）——这些配置是专有配置，在 Fabric 中会被静默忽略或引发错误
- **不要使用 DBFS 路径**（`dbfs:/...`）——Fabric 中不存在 DBFS；所有路径都必须使用 OneLake `abfss://` 或相对于 Lakehouse 的路径

---

## 多 Notebook 迁移协议

对于包含 >3 个 notebooks 或单个 notebook >5KB 的工作区，请**一次处理一个 notebook**（枚举 → 导出 → 转换 → 汇总 → 部署 → 发布），以避免上下文溢出。通过状态生命周期跟踪每个 notebook（`inventory` → `analyzed` → `converted` → `deployed` → `validated`，或 `failed`）。

> 完整协议、状态定义以及每个 notebook 的汇总架构：[migration-orchestrator.md § Phase 2](resources/migration-orchestrator.md#phase-2-notebook-migration)。

---

## 失败报告

当迁移无法完成时（权限失败、无法解决的 Blockers，例如 DLT 或操作系统级 init scripts、没有用户选择策略的命名空间冲突，或反复发生的 API 失败），应生成**结构化失败报告**——不得静默放弃。报告应记录 `phase_reached`、`blockers[]`（item / pattern / reason / recommendation）、`partial_success` 计数以及 `next_steps`。

> 完整的报告架构和停止条件：[migration-orchestrator.md § Failure Reporting](resources/migration-orchestrator.md#failure-reporting)。

---

## 示例

完整映射请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) 和 [code-patterns.md](resources/code-patterns.md)。以下是关键的快速参考：

**`dbutils.fs` → `notebookutils.fs`**

```python
# Databricks
dbutils.fs.ls("/mnt/bronze/orders/")
dbutils.fs.cp("/mnt/raw/file.csv", "/mnt/archive/file.csv")

# Fabric (replace DBFS/mount paths with OneLake relative paths)
notebookutils.fs.ls("Files/bronze/orders/")
notebookutils.fs.cp("Files/raw/file.csv", "Files/archive/file.csv")
```

**`dbutils.secrets` → `notebookutils.credentials`**

```python
# Databricks
pwd = dbutils.secrets.get(scope="prod", key="db-password")

# Fabric (scope → Key Vault URL, key → secret name)
pwd = notebookutils.credentials.getSecret("https://myvault.vault.azure.net/", "db-password")
```

**Unity Catalog namespace → Lakehouse schema**

```python
# Databricks
df = spark.read.table("prod.silver.customers")

# Fabric (ProdLakehouse represents the source catalog and is attached as context)
df = spark.read.table("silver.customers")
```