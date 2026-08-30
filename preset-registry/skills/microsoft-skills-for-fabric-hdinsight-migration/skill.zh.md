---
name: hdinsight-migration
description: "Ports HDInsight Spark and Hive workloads to Fabric, converting HiveContext and SparkContext to SparkSession, WASB and ABFS paths to OneLake shortcuts, Hive DDL to Delta tables in a Lakehouse, and Oozie coordinators and actions to pipeline activities and triggers. Use when the source workload is HDInsight."
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: hdinsight-migration`（`az rest`：`--headers "x-ms-fabric-skill=hdinsight-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. HDInsight 没有等效的 `mssparkutils` 或 `dbutils`——`notebookutils` 是正在引入的新能力
> 4. `HiveContext` 和 `SQLContext` 是 Spark 1.x/2.x 中的旧版 API——Fabric 专门使用 Spark 3.x 的 `SparkSession`
> 5. `wasb://` 路径已弃用，并且需要存储帐户密钥或 SAS——请替换为 OneLake 快捷方式
> 6. Fabric 无法直接读取或创建 `hdfs://` 的快捷方式。其 Pipeline HDFS 连接器仅支持匿名身份验证；请先将 Kerberos 源导出或桥接到受支持的存储。

# HDInsight → Microsoft Fabric 迁移

## 前置知识

在执行迁移任务之前，请阅读以下配套文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项目发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook 部署、Lakehouse 创建、Spark 作业执行

有关 Notebook 和 Lakehouse 创建，请参阅 [spark-cli](../spark-cli/SKILL.md)。
有关 Fabric Warehouse DDL/DML 编写，请参阅 [sqldw-cli](../sqldw-cli/SKILL.md)。

---

## 目录

| 主题 | 参考 |
|---|---|
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| SparkSession 和 Context API 变更 | [§ SparkSession API 变更](#sparksession--context-api-changes) |
| WASB / ABFS → OneLake 路径迁移 | [path-migration.md](resources/path-migration.md) |
| Hive DDL → Delta Lake / Lakehouse 架构 | [hive-to-delta.md](resources/hive-to-delta.md) |
| Oozie → Fabric Pipelines | [§ Oozie → Fabric Pipelines](#oozie--fabric-pipelines) |
| 引入 `notebookutils` | [§ 引入 notebookutils](#introducing-notebookutils) |
| 迁移前后代码模式 | [code-patterns.md](resources/code-patterns.md) |
| Spark 配置差异 | [§ Spark 配置差异](#spark-configuration-differences) |
| 必须 / 优先 / 避免 | [§ 必须 / 优先 / 避免](#must--prefer--avoid) |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition) |
| Lakehouse 管理 | [SPARK-AUTHORING-CORE.md § Lakehouse 管理](../../common/SPARK-AUTHORING-CORE.md#lakehouse-management) |

---

## 迁移工作负载映射

| HDInsight 组件 | Fabric 目标 | 备注 |
|---|---|---|
| **Spark 群集**（Notebook、脚本） | Fabric Spark（Lakehouse / Notebook / SJD） | 没有持久化群集——Starter Pool 或 Custom Pool 按需提供 Spark |
| **Hive / HiveServer2** | **Lakehouse SQL Endpoint** + Lakehouse 架构 | Delta Lake 替代 Hive metastore；架构提供等效的命名空间 |
| **HBase** | **Fabric Warehouse** 或 **Azure Cosmos DB**（与 Fabric 分开） | HBase 没有直接对应的 Fabric 等效项——请评估工作负载访问模式 |
| **Oozie 工作流** | **Fabric Data Pipelines** | 将 Oozie 操作映射到 Fabric 活动；请参阅 [§ Oozie → Fabric Pipelines](#oozie--fabric-pipelines) |
| **YARN Resource Manager** | **Fabric Spark 监视**（Spark UI、Monitoring Hub） | 没有 YARN——Fabric 自动管理计算 |
| **Ambari** | **Fabric Monitoring Hub** + **Admin Portal** | 群集运行状况、容量和作业监视 |
| **WASB / ABFS 存储** | **OneLake Shortcuts** → `abfss://workspace@onelake.dfs.fabric.microsoft.com/` | 请参阅 [path-migration.md](resources/path-migration.md) |
| **Ranger 策略** | **Fabric 工作区角色** + **OneLake 数据访问角色** | 将 Ranger 行/列筛选器映射到 Lakehouse 行级安全性 |
| **Livy REST 服务器** | **Fabric Livy API** | 兼容的终结点——请参阅 SPARK-AUTHORING-CORE.md |

---

## SparkSession 与 Context API 变更

HDInsight Spark 集群通常使用旧版 Spark 1.x / 2.x API 风格。将所有这些替换为统一的 `SparkSession`：

| 旧版 HDInsight 模式 | Fabric Spark 3.x 替代方案 |
|---|---|
| `from pyspark import SparkContext; sc = SparkContext()` | 无需使用 — `sc = spark.sparkContext`（预先实例化） |
| `from pyspark.sql import HiveContext; hc = HiveContext(sc)` | 无需使用 — `spark` 会通过 Delta schema 提供兼容 Hive 的 SQL 支持 |
| `from pyspark.sql import SQLContext; sqlc = SQLContext(sc)` | 无需使用 — 直接使用 `spark.sql(...)` |
| `SparkSession.builder.enableHiveSupport().getOrCreate()` | Fabric 中无需使用 — `spark` 已预先构建并可用 |
| `sc.textFile("wasb://container@account.blob.core.windows.net/path")` | `spark.read.text("abfss://workspace@onelake.dfs.fabric.microsoft.com/lh.Lakehouse/Files/path")` |
| `sqlContext.sql("CREATE TABLE ... STORED AS ORC")` | 有关 Delta DDL 等效写法，请参阅 [hive-to-delta.md](resources/hive-to-delta.md) |

> 在 Fabric notebook 中，`spark`（SparkSession）和 `sc`（SparkContext）均已**预先实例化** — 不要在迁移后的 notebook 顶部调用 `SparkContext()` 或 `SparkSession.builder...getOrCreate()`。

---

## Oozie → Fabric Pipelines

将 Oozie 工作流操作映射到 Fabric Data Pipeline 活动：

| Oozie 操作类型 | Fabric Pipeline 活动 | 备注 |
|---|---|---|
| `<spark>` action | **Notebook activity** 或 **Spark Job Definition activity** | 通过 notebook 单元格参数或 SJD 参数传递参数 |
| `<hive>` action | 针对 Lakehouse SQL Endpoint 的 **Script activity**（SQL） | 将 HiveQL 转换为 Spark SQL 或 Delta SQL |
| `<shell>` action | **Azure Function activity** 或 **Web activity** | 必须重构 Shell 脚本；Fabric Pipelines 不支持直接执行 Shell |
| `<java>` action | **Azure Batch activity**（外部）或重构为 PySpark | 必须重写 Java MapReduce 作业 |
| `<sqoop>` action | **Copy Data activity**（Fabric Data Factory connector） | Sqoop 导入/导出可映射为使用 JDBC source/sink 的 Fabric Copy Data |
| `<coordinator>`（基于时间的计划） | **Pipeline schedule trigger** | 在 pipeline trigger 中设置重复周期；支持类似 cron 的表达式 |
| `<coordinator>`（数据触发） | **Storage Event trigger** | 在 OneLake 文件到达时触发 |

> 在完成 pipeline 活动映射后，**委托给 `spark-cli`** 创建 notebook 和 SJD。

---

## 引入 `notebookutils`

HDInsight Spark 没有内置的实用工具框架，无法等同于 `mssparkutils` 或 `dbutils`。迁移到 Fabric 时，引入 `notebookutils` 以执行常见操作：

| 操作 | 旧版 HDInsight 方法 | `notebookutils` 等效方案 |
|---|---|---|
| 列出文件 | `dbutils`（不适用）/ HDFS CLI | `notebookutils.fs.ls("abfss://...")` |
| 复制文件 | HDFS API / `shutil` | `notebookutils.fs.cp(src, dest)` |
| 读取机密 | Azure Key Vault REST 调用 | `notebookutils.credentials.getSecret(keyVaultUrl, secretName)` |
| 获取 notebook 上下文 | 不可用 | `notebookutils.runtime.context` — 返回 workspace ID、notebook ID 等 |
| 运行子 notebook | 不可用 | `notebookutils.notebook.run("notebook_name", timeout, {"param": "value"})` |
| 以值退出 notebook | `sys.exit()` | `notebookutils.notebook.exit("value")` |
| 挂载存储 | `spark-defaults.conf` 中的 WASB 配置 | OneLake Shortcut（无需运行时挂载） |

---

## Spark 配置差异

| HDInsight 概念 | Fabric Spark 等效项 | 迁移操作 |
|---|---|---|
| `spark-defaults.conf`（整个群集范围） | Fabric **Spark 工作区设置** + **Environment** 项 | 将配置属性移至 Environment，或在笔记本中使用 `%%configure` |
| `%%configure` 魔法命令 | `%%configure` 魔法命令 — **完全相同** | 无需更改 |
| YARN 队列 / 资源分配 | **Fabric Spark 池**节点大小和自动缩放设置 | 将队列 SLA 映射到 Custom Pool 配置 |
| Ambari 服务配置（HDFS、YARN 调优） | 不适用 — Fabric 管理基础设施 | 移除；专注于应用级 Spark 配置 |
| HDI Spark 版本（例如 Spark 2.4） | Fabric Runtime 1.3 = Spark 3.5（最新） | 测试已弃用 API 的移除情况（例如 `HiveContext`、RDD 风格的 ML） |
| Conda 环境 / `bootstrap.sh` | 包含自定义库的 **Fabric Environment** 项 | 在 Fabric Environment 中重新创建 conda/pip 依赖项 |
| `hive-site.xml`（元存储连接） | 不需要 — Delta Lake 在 Fabric 中就是元存储 | 移除元存储配置；使用 Lakehouse 架构组织命名空间 |

---

## 必须 / 优先 / 避免

### 必须执行
- **将所有 `wasb://` / `wasbs://` 路径替换为** OneLake `abfss://` 路径或 OneLake Shortcuts — `wasb://` 需要存储帐户密钥，而这不是 Fabric 首选的身份验证模型
- **替换 `HiveContext`、`SQLContext` 和独立的 `SparkContext()`** — 在 Fabric 笔记本中使用预实例化的 `spark` 会话
- **将 Hive DDL**（`STORED AS ORC`、`LOCATION`、`TBLPROPERTIES`）迁移到 Delta Lake DDL — 请参阅 [hive-to-delta.md](resources/hive-to-delta.md)
- **在 HDInsight 使用自定义脚本或直接 API 调用的场景中，引入 `notebookutils`**，用于文件系统操作、机密检索和子笔记本编排
- **将 Oozie XML 工作流替换为 Fabric 数据管道** — 请参阅 [§ Oozie → Fabric 管道](#oozie--fabric-pipelines)
- **使库管理与 Fabric Environments 保持一致** — 对生产工作负载移除 `bootstrap.sh`、conda 环境和运行时 `%pip install` 模式
- **将 `hdfs://` 视为仅限源群集使用** — 将数据导出或引入 ADLS Gen2 或 OneLake；不要声称网关可以为 Fabric 的仅 Anonymous HDFS 连接器添加 Kerberos 支持

### 优先执行
- **优先使用 OneLake Shortcuts，而不是复制数据** — 将现有 ADLS Gen2 容器挂载为快捷方式，以避免迁移期间重新引入数据
- **对从 Hive ORC/Parquet 迁移的所有表使用** Delta Lake — ACID 保证、时间旅行和架构强制有助于提高数据质量
- **使用 Fabric Starter Pool 进行初始迁移验证** — 无需池配置开销，且会话启动速度快
- **使用 Lakehouse 架构（数据库命名空间）组织迁移的 Hive 数据库** — 在单个 Lakehouse 中为每个 Hive 数据库创建一个架构
- **使用 Medallion 架构在迁移期间重构迁移后的数据层** — 使 Bronze/Silver/Gold 与原始 Hive → 已验证 Delta → 服务 Gold 模式保持一致

### 避免执行
- **不要在 Fabric 笔记本中使用 `SparkContext()` 或 `HiveContext()` 构造函数** — 它们会与预实例化的 `spark` 会话冲突并引发错误
- **不要使用 `hive-site.xml` 或外部 Hive 元存储配置** — Fabric 基于 Delta Lake 的 Lakehouse 就是元存储
- **不要假设 YARN 队列映射可以转换为 Fabric 池** — 应根据 Fabric Spark 池 SLA 重新设计资源分配
- **不要尝试直接在 Fabric 中运行 Oozie shell 操作或 Java MapReduce 作业** — 必须对其进行重构（请参阅 [§ Oozie → Fabric 管道](#oozie--fabric-pipelines)）
- **不要在生产笔记本中使用 `%sh` 魔法命令执行文件系统操作** — 使用 `notebookutils.fs.*` 以实现可移植性和基于 OneLake 令牌的身份验证

---

## 示例

完整的迁移前后示例请参见 [code-patterns.md](resources/code-patterns.md)。以下是关键快速参考：

**Legacy context → Fabric pre-instantiated session**

```python
# HDInsight (remove entirely)
from pyspark.sql import HiveContext
hc = HiveContext(sc)

# Fabric — use pre-instantiated spark directly
df = spark.sql("SELECT * FROM sales.fact_orders")
```

**WASB path → OneLake path (after shortcut creation)**

```python
# HDInsight
df = spark.read.parquet("wasb://raw@myaccount.blob.core.windows.net/orders/")

# Fabric
df = spark.read.parquet("Files/raw/orders/")
```

**Hive DDL → Delta DDL**

```sql
-- HDInsight
CREATE TABLE sales_db.fact_orders (...) STORED AS ORC LOCATION 'wasb://...';

-- Fabric
CREATE SCHEMA IF NOT EXISTS sales_db;
CREATE TABLE sales_db.fact_orders (...) USING DELTA;
```