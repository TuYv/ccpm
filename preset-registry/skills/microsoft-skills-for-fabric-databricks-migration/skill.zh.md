---
name: databricks-migration
description: >
  Port Databricks notebooks and jobs to Microsoft Fabric. Provides an exhaustive dbutils
  to notebookutils substitution table: fs operations (runtime mounts or OneLake Shortcuts),
  secret scope to Key Vault URL conversion, notebook run and exit, widget replacement with
  parameter-tagged cells, and library install replacement with Fabric Environments.
  Covers Unity Catalog three-level namespace reduction to Lakehouse two-level schemas,
  DBFS path conversion to OneLake, Databricks Jobs to Spark Job Definitions, MLflow
  tracking URI removal, and Photon to Native Execution Engine substitution. Use when the
  user wants to: (1) replace dbutils with notebookutils, (2) collapse Unity Catalog
  namespaces to Lakehouse schemas, (3) convert Databricks Jobs or Delta Live Tables.
  Triggers: "migrate from databricks", "databricks to fabric", "dbutils to notebookutils",
  "dbutils fabric", "unity catalog migration", "dbfs to onelake",
  "databricks notebook migration", "delta live tables fabric", "photon native execution".
---
> **遥测 — 强制要求。** 每个对 `api.fabric.microsoft.com` 的调用都必须携带
> `x-ms-fabric-skill: databricks-migration`（`az rest`：`--headers "x-ms-fabric-skill=databricks-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍必须添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项的详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选
> 3. `dbutils.widgets` 在 Fabric 中**没有直接等效项**——请使用笔记本参数（单元格标记 `parameters`）；`notebookutils.runtime.context` 是执行元数据，而不是参数存储。如果展示上下文字段，请使用文档中规定的名称，例如 `currentWorkspaceId`、`currentWorkspaceName`、`currentNotebookId`、`currentNotebookName`、`isForPipeline` 和 `isForInteractive`；`activityId` 是 Livy 作业 ID
> 4. `dbutils.library`（运行时库安装）**没有等效项**——请使用 Fabric 环境实现可重现的库管理
> 5. Unity Catalog 使用三级命名空间（`catalog.schema.table`）；Fabric Lakehouse 使用二级命名空间（命名 Lakehouse 中的 `schema.table`）
> 6. 对于信息不充分的工作区级迁移，在推荐 Fabric 拓扑之前，应针对资产清单、工作负载拓扑、安全性、数据位置和运行时约束提出有针对性的问题
> 7. 已完成的 Fabric 迁移不得在双运行时分支或 `try/except` 保护中保留可执行的 `dbutils.*` 调用——应彻底替换这些调用和 Databricks 路径

# Databricks → Microsoft Fabric 迁移

## 前置知识

执行迁移任务前，请阅读以下配套文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — 笔记本部署、Lakehouse 创建、Spark 作业执行

有关笔记本和 Lakehouse 创建，请参阅 [spark-cli](../spark-cli/SKILL.md)。
有关 Fabric Warehouse DDL/DML 编写，请参阅 [sqldw-cli](../sqldw-cli/SKILL.md)。

---

## 目录

| 主题 | 参考 |
|---|---|
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| 完整的 `dbutils` → `notebookutils` 映射 | [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| Unity Catalog → Fabric Lakehouse 架构 | [catalog-migration.md](resources/catalog-migration.md) |
| 迁移前后代码模式 | [code-patterns.md](resources/code-patterns.md) |
| 集群配置 → Fabric Spark 池 | [§ 集群配置 → Fabric Spark 池](#cluster-config--fabric-spark-pools) |
| Databricks 作业 → Spark 作业定义 | [§ Databricks 作业 → Spark 作业定义](#databricks-jobs--spark-job-definitions) |
| Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式 | [§ Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式](#delta-sharing--fabric-external-data-sharing-and-onelake-shortcuts) |
| MLflow → Fabric ML 实验 | [§ MLflow → Fabric ML 实验](#mlflow--fabric-ml-experiments) |
| 必须 / 建议 / 避免 | [§ 必须 / 建议 / 避免](#must--prefer--avoid) |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition) |
| Lakehouse 管理 | [SPARK-AUTHORING-CORE.md § Lakehouse 管理](../../common/SPARK-AUTHORING-CORE.md#lakehouse-management) |
| 笔记本管理 | [SPARK-AUTHORING-CORE.md § 笔记本管理](../../common/SPARK-AUTHORING-CORE.md#notebook-management) |

---

## 迁移工作负载映射

| Databricks 组件 | Fabric 目标 | 备注 |
|---|---|---|
| **通用集群**（notebooks、REPL） | Fabric Notebook（Starter Pool 或 Custom Pool） | 无持久化集群——Fabric 会在会话启动时预配计算资源 |
| **作业集群**（自动化作业） | **Spark Job Definition (SJD)** | SJD 与在作业集群上运行的 Databricks Jobs 一一对应 |
| **Unity Catalog** | **Fabric Lakehouse**（每个命名空间对应一个 schema） | 请参阅 [catalog-migration.md](resources/catalog-migration.md) |
| **Databricks Repos**（由 Git 支持的 notebooks） | **Fabric Git Integration** | 将工作区连接到 Azure DevOps 或 GitHub；notebooks 会保持同步 |
| **Delta Live Tables (DLT)** | **Fabric Notebooks** + **Data Pipelines** | 没有 DLT 等效项——将 DLT 数据集重写为参数化 notebook 单元格，并使用 pipeline 进行编排 |
| **Databricks SQL Warehouses** | **Fabric Warehouse** 或 **Lakehouse SQL Endpoint** | SQL warehouse 会话 → Warehouse（用于写入）或 SQL Endpoint（用于只读） |
| **MLflow Tracking** | **Fabric ML Experiments** | Fabric 支持 MLflow SDK——请参阅 [§ MLflow](#mlflow--fabric-ml-experiments) |
| **Delta Sharing** | **OneLake Shortcuts** + **Fabric 外部数据共享** | 请参阅 [§ Delta Sharing → Fabric 外部数据共享和 OneLake Shortcuts](#delta-sharing--fabric-external-data-sharing-and-onelake-shortcuts) |
| **Databricks Feature Store** | **Fabric Feature Store**（预览版） | 概念上直接对应；API 不同 |
| **dbutils**（所有子模块） | **`notebookutils`**（大多数子模块） | 有关完整映射，请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |

---

## `dbutils` → `notebookutils` 快速参考

完整的并排 API 表位于 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md)。主要映射如下：

| `dbutils` 调用 | `notebookutils` 等效项 | 兼容性说明 |
|---|---|---|
| `dbutils.fs.ls(path)` | `notebookutils.fs.ls(path)` | **可直接替换** |
| `dbutils.fs.cp(src, dest)` | `notebookutils.fs.cp(src, dest)` | **可直接替换** |
| `dbutils.fs.mv(src, dest)` | `notebookutils.fs.mv(src, dest, create_path, overwrite=False)` | ⚠️ 签名不同——请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| `dbutils.fs.rm(path, recurse)` | `notebookutils.fs.rm(path, recurse)` | **可直接替换** |
| `dbutils.fs.mkdirs(path)` | `notebookutils.fs.mkdirs(path)` | **可直接替换** |
| `dbutils.fs.put(path, contents)` | `notebookutils.fs.put(path, contents)` | **可直接替换** |
| `dbutils.fs.head(path, maxBytes)` | `notebookutils.fs.head(path, max_bytes)` | ⚠️ 默认值不同——Python/Scala 为 100 KB，R 为 64 KB。请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) |
| `dbutils.fs.mount(...)` | `notebookutils.fs.mount(source, mountPoint, extraConfigs=None)` | ✅ **支持**——Microsoft Entra（默认）、`accountKey` 或 `sasToken` 身份验证。对于跨工作区或持久共享，建议优先使用 **OneLake Shortcuts** |
| `dbutils.secrets.get(scope, key)` | `notebookutils.credentials.getSecret(keyVaultUrl, secretName)` | scope → Key Vault URL；key → secret 名称 |
| `dbutils.notebook.run(path, timeout, args)` | `notebookutils.notebook.run(name, timeout, args)` | `path` → notebook `name`（相对于工作区） |
| `dbutils.notebook.exit(value)` | `notebookutils.notebook.exit(value)` | **可直接替换** |
| `dbutils.widgets.get(name)` | 请参阅 [§ Widgets 迁移](#widgets-migration) | 无直接等效项 |
| `dbutils.library.install(...)` | **运行时不可用**——请使用 **Fabric Environments** | `dbutils.library.restartPython()` → `notebookutils.session.restartPython()` |
| `dbutils.data.summarize(df)` | `display(df.summary())` | 使用 `display()` 或 pandas `describe()` |

### 小组件迁移

`dbutils.widgets` 在 Fabric 中没有直接对应项。请改用以下模式：

| 使用场景 | Fabric 模式 |
|---|---|
| 从父笔记本传递参数 | 将子笔记本中的某个单元格标记为**参数单元格**（笔记本 UI：单元格的“...”菜单 →“标记为参数单元格”）。父笔记本调用 `notebookutils.notebook.run("child", arguments={"param": "value"})`——运行时，引擎会在参数单元格下方插入一个新单元格，以覆盖默认值 |
| 由管道驱动的参数化 | 使用相同的参数单元格机制；Fabric Pipeline 笔记本活动通过其**基础参数**设置提供覆盖值 |
| 集中式跨笔记本配置 | 使用 `notebookutils.variableLibrary.getLibrary("<name>")` 从变量库项中读取值（部署管道会为每个阶段激活正确的值集） |
| 笔记本中的交互式选择 | 使用带输入单元格的 `display()`、IPython 小组件（仅限 Python）或 Fabric Data Activator |

> 注意：`notebookutils.runtime.context` **不会**公开参数值。它用于提供执行元数据（工作区/笔记本/活动/用户 ID、管道与交互模式标志等）。请参阅 [dbutils-to-notebookutils.md § 运行时上下文](resources/dbutils-to-notebookutils.md#runtime-context)。

---

## 集群配置 → Fabric Spark 池

| Databricks 集群概念 | Fabric Spark 对应项 | 说明 |
|---|---|---|
| 通用集群（交互式） | **入门池** | 自动预配；无需配置；非常适合笔记本 |
| 作业集群（供作业单次使用） | 附加到 SJD 的**自定义池**（或入门池） | 在 Fabric 容量设置中配置节点大小和自动缩放 |
| 节点类型（例如 `Standard_DS3_v2`） | **Fabric 节点大小**（小型/中型/大型/超大型/特大型） | 按 vCore/内存比率映射 |
| 自动缩放最小/最大工作节点数 | 自定义池的**最小/最大节点**设置 | 可在工作区 Spark 设置中使用 |
| 集群设置中的 `spark.conf` | **Fabric 环境** Spark 属性 | 移至环境项；附加到工作区或笔记本 |
| `init_scripts`（集群初始化） | **Fabric 环境**安装脚本 | 并非完全等效——仅支持安装库 |
| Databricks Runtime 版本 | **Fabric Runtime**（1.1 = Spark 3.3，1.2 = Spark 3.4，1.3 = Spark 3.5） | 选择匹配的 Spark 版本；测试已弃用的 API |
| Photon 加速器 | **Fabric 原生执行引擎（NEE）** | 在工作区 Spark 设置中启用；提供与 Photon 类似的向量化执行 |

---

## Databricks Jobs → Spark 作业定义

| Databricks Jobs 概念 | Fabric SJD 对应项 | 说明 |
|---|---|---|
| 包含单个笔记本任务的作业 | 引用笔记本的 **SJD** | 附加默认 Lakehouse；通过 SJD 参数传递参数 |
| 多任务作业（任务 DAG） | 编排多个 SJD/笔记本的 **Fabric Data Pipeline** | 管道活动映射到作业任务；依赖项 = 活动依赖项 |
| 作业计划（cron） | **管道计划触发器** | Cron 表达式 → 管道中的重复触发器 |
| 作业参数 | **SJD 默认参数**或**笔记本单元格参数** | 笔记本中的参数单元格会在运行时注入 |
| 每个任务的作业集群 | **附加到 SJD 的池** | 每个 SJD 都可以独立指定其 Spark 池 |
| Databricks Workflows | **Fabric Data Pipelines** | 支持条件、循环和失败分支的完整 DAG 编排 |

> **将 SJD 创建和笔记本部署委托给 `spark-cli`**。

---

## Delta Sharing → Fabric 外部数据共享和 OneLake 快捷方式

| Databricks Delta Sharing 模式 | Fabric 等效方案 |
|---|---|
| 提供方发布 Delta 共享 | 对于跨租户 Fabric 数据，使用 Fabric **外部数据共享**；或者为 Delta 数据所在的 ADLS Gen2 创建 OneLake 快捷方式 |
| 接收方读取共享数据 | 将外部数据共享接受到 Lakehouse 中（Fabric 会创建一个只读 OneLake 快捷方式），或者为可访问的 ADLS Gen2 数据创建直接的 **OneLake 快捷方式** |
| 组织内跨工作区表共享 | 指向另一个工作区 Lakehouse 表的 **OneLake 快捷方式**——无需复制数据 |
| 跨租户共享 | Fabric **外部数据共享**——通过接收方租户中的快捷方式提供实时、只读、原地访问 |

生成迁移工作负载映射时，应包含两种路径：对于可访问的 ADLS 或同租户 OneLake 数据，使用直接 OneLake 快捷方式；对于原生跨租户接收方共享，使用 Fabric 外部数据共享。

---

## MLflow → Fabric ML 实验

Fabric ML 实验基于 MLflow SDK 构建——大多数代码都可以直接移植：

| Databricks MLflow 模式 | Fabric 等效方案 | 迁移操作 |
|---|---|---|
| `mlflow.set_tracking_uri("databricks")` | 移除——Fabric 会自动进行跟踪 | 在 Fabric 笔记本中删除此行 |
| `mlflow.set_experiment("/path/exp")` | `mlflow.set_experiment("experiment_name")` | 仅使用名称（而非路径）；Fabric 会创建实验项 |
| `mlflow.log_metric(...)` | `mlflow.log_metric(...)`——**完全相同** | 无需更改 |
| `mlflow.log_artifact(...)` | `mlflow.log_artifact(...)`——**完全相同** | 无需更改 |
| `mlflow.autolog()` | `mlflow.autolog()`——**完全相同** | 无需更改 |
| `mlflow.register_model(...)` | `mlflow.register_model(...)`——**完全相同** | Fabric ML 中提供模型注册表 |
| Databricks 模型服务 | **Azure ML 在线终结点**或 **Fabric Data Activator** | Fabric 目前尚无直接的模型服务——请使用 Azure ML |

---

## 必须 / 首选 / 避免

### 必须执行
- **在规划工作区拓扑之前先进行清点**——对于未提供工作负载清单、依赖项、安全要求、数据位置或运行时约束的工作区级请求，应先提出有针对性的澄清问题并给出条件化选项，然后再选择 Fabric 设计
- **替换所有 `dbutils.*` 调用**，使用 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) 中的映射——Fabric 笔记本不支持 `dbutils`
- **将 `dbutils.fs.mount()` 迁移到 `notebookutils.fs.mount()`**（✅ 支持——默认使用 Microsoft Entra，或使用来自 Key Vault 的 `accountKey` / `sasToken`）。对于跨工作区或持久共享，首选 **OneLake 快捷方式**。始终在 `try/finally` 中将 `mount()` 与 `unmount()` 配对使用——Fabric 挂载不会在会话结束时自动释放
- **将 `dbutils.secrets.get(scope, key)` 替换为 `notebookutils.credentials.getSecret(keyVaultUrl, secretName)`**——机密范围映射到 Azure Key Vault URL
- **重新设计基于小组件的参数传递**，改用笔记本**参数单元格**（单元格的“...”菜单 → “Mark cell as parameters”）；使用 `notebookutils.variableLibrary` 集中管理跨笔记本配置。`notebookutils.runtime.context` **不会**公开参数值
- **将 `dbutils.library.install*()` 替换为 Fabric 环境**——生产环境不支持运行时安装库。`dbutils.library.restartPython()` 映射到 `notebookutils.session.restartPython()`（仅限 Python / PySpark）
- **调整 Unity Catalog 三级命名空间**（`catalog.schema.table`）以适配 Fabric 二级命名空间（Lakehouse 中的 `schema.table`）——请参阅 [catalog-migration.md](resources/catalog-migration.md)
- **将 Databricks 群集初始化脚本映射到 Fabric 环境**——群集级库安装必须迁移到环境项

### 推荐
- 使用 **Fabric Native Execution Engine (NEE)** 作为 Photon 的对应方案——在工作区 Spark 设置中启用，以便在 Delta Lake 上进行向量化执行
- 对于 ADLS Gen2 中已存在的 Delta 表，优先使用 **OneLake Shortcuts** 而不是复制数据——直接指向数据，无需重新摄取
- 使用 **Fabric Git Integration** 替代 Databricks Repos——将工作区连接到 ADO 或 GitHub，以便对笔记本进行版本控制
- 使用 **Fabric ML Experiments** 实现与 MLflow 的直接延续——跟踪代码只需极少改动（移除 `set_tracking_uri`）
- 在重构迁移后的 Databricks 目录时采用**奖牌架构**——将 `bronze`、`silver`、`gold` Unity Catalog 架构对应到独立的 Fabric Lakehouse
- 使用 **Starter Pool** 迁移交互式笔记本工作流——消除集群启动时间，而这曾是 Databricks 作业集群中的常见痛点

### 避免
- 当缺少源清单和迁移约束时，**不要规定一刀切的工作区拓扑**
- 在 Fabric 笔记本中，**不要导入 `dbutils` 或尝试执行 `dbutils = ...` 赋值**——导入尝试会因 `ModuleNotFoundError` 而失败，而未解析的 `dbutils` 引用会引发 `NameError`；始终使用 `notebookutils`
- **不要将 `dbutils.*` 调用保留在运行时检测防护逻辑之后**（`try/except`、`if IS_DATABRICKS`）——应直接使用 `notebookutils` 和 Fabric 路径替换这些调用及 Databricks 路径
- **不要假设 Unity Catalog 治理策略会自动转移**——必须在 Fabric 中使用工作区角色和 Lakehouse 权限重新配置 RBAC、行级安全性和列掩码
- **不要在生产 Fabric 笔记本运行时使用 `%pip install`**——应使用 Fabric Environments 实现稳定且版本化的库管理
- **不要尝试逐字移植 Delta Live Tables (DLT) 管道**——Fabric 中没有与 DLT 对应的功能；应将其重写为由 Fabric Pipelines 编排的参数化笔记本
- **不要依赖 Databricks 特有的 Spark 配置**（例如 `spark.databricks.*`）——这些配置是专有的，在 Fabric 中会被静默忽略或引发错误
- **不要使用 DBFS 路径**（`dbfs:/...`）——Fabric 中不存在 DBFS；所有路径都必须使用 OneLake `abfss://` 路径或 Lakehouse 相对路径

---

## 示例

有关完整映射，请参阅 [dbutils-to-notebookutils.md](resources/dbutils-to-notebookutils.md) 和 [code-patterns.md](resources/code-patterns.md)。关键快速参考如下：

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

**Unity Catalog 命名空间 → Lakehouse 架构**

```python
# Databricks
df = spark.read.table("prod.silver.customers")

# Fabric (catalog dropped; Lakehouse context provides it)
df = spark.read.table("silver.customers")
```