---
name: hdinsight-migration
description: >
  Port Azure HDInsight Spark clusters and Hive workloads to Microsoft Fabric.
  Replaces legacy HiveContext and standalone SparkContext constructors with
  the pre-instantiated SparkSession. Converts WASB and ABFS storage paths to OneLake
  abfss URLs via Shortcuts. Transforms Hive DDL (STORED AS ORC, external tables) to
  Delta Lake schemas inside Fabric Lakehouse. Maps Oozie workflow actions — spark, hive,
  shell, sqoop, coordinator — to Fabric Pipeline activities and schedule triggers.
  Introduces notebookutils for file and credential operations previously handled via
  subprocess or HDFS client calls. Use when the user wants to:
  (1) retire an HDInsight cluster and move to Fabric,
  (2) convert WASB paths or Hive DDL,
  (3) replace Oozie coordinators with Fabric Pipelines.
  Triggers: "migrate from hdinsight", "hdi to fabric", "hivecontext sparksession fabric",
  "wasb to onelake", "hive ddl to delta", "oozie to fabric pipelines",
  "migrate an oozie action", "hive metastore lakehouse", "hdinsight spark migration".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: hdinsight-migration`（`az rest`：`--headers "x-ms-fabric-skill=hdinsight-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍须添加。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选
> 3. HDInsight 没有与 `mssparkutils` 或 `dbutils` 等效的功能 — `notebookutils` 是正在引入的全新功能
> 4. `HiveContext` 和 `SQLContext` 是旧版 Spark 1.x/2.x API — Fabric 仅使用 Spark 3.x `SparkSession`
> 5. `wasb://` 路径已弃用，并且需要存储帐户密钥或 SAS — 请替换为 OneLake 快捷方式
> 6. Fabric 无法直接读取 `hdfs://` 或为其创建快捷方式。其 Pipeline HDFS 连接器仅支持匿名身份验证；请先将 Kerberos 数据源导出或桥接到受支持的存储。

# HDInsight → Microsoft Fabric 迁移

## 前置知识

执行迁移任务前，请阅读以下配套文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook 部署、Lakehouse 创建、Spark 作业执行

有关 Notebook 和 Lakehouse 的创建，请参阅 [spark-cli](../spark-cli/SKILL.md)。
有关 Fabric Warehouse DDL/DML 编写，请参阅 [sqldw-cli](../sqldw-cli/SKILL.md)。

---

## 目录

| 主题 | 参考 |
|---|---|
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| SparkSession 和 Context API 变更 | [§ SparkSession API 变更](#sparksession--context-api-changes) |
| WASB / ABFS → OneLake 路径迁移 | [path-migration.md](resources/path-migration.md) |
| Hive DDL → Delta Lake / Lakehouse 架构 | [hive-to-delta.md](resources/hive-to-delta.md) |
| Oozie → Fabric Pipeline | [§ Oozie → Fabric Pipeline](#oozie--fabric-pipelines) |
| `notebookutils` 简介 | [§ notebookutils 简介](#introducing-notebookutils) |
| 迁移前后代码模式 | [code-patterns.md](resources/code-patterns.md) |
| Spark 配置差异 | [§ Spark 配置差异](#spark-configuration-differences) |
| 必须 / 建议 / 避免 | [§ 必须 / 建议 / 避免](#must--prefer--avoid) |
| 身份验证和令牌获取 | [COMMON-CORE.md § 身份验证](../../common/COMMON-CORE.md#authentication--token-acquisition) |
| Lakehouse 管理 | [SPARK-AUTHORING-CORE.md § Lakehouse 管理](../../common/SPARK-AUTHORING-CORE.md#lakehouse-management) |

---

## 迁移工作负载映射

| HDInsight 组件 | Fabric 目标 | 说明 |
|---|---|---|
| **Spark 群集**（Notebook、脚本） | Fabric Spark（Lakehouse / Notebook / SJD） | 无持久化群集 — Starter Pool 或 Custom Pool 提供按需 Spark |
| **Hive / HiveServer2** | **Lakehouse SQL Endpoint** + Lakehouse 架构 | Delta Lake 取代 Hive Metastore；架构提供等效的命名空间 |
| **HBase** | **Fabric Warehouse** 或 **Azure Cosmos DB**（独立于 Fabric） | HBase 在 Fabric 中没有直接的等效项 — 请评估工作负载访问模式 |
| **Oozie 工作流** | **Fabric Data Pipeline** | 将 Oozie 操作映射到 Fabric 活动；请参阅 [§ Oozie → Fabric Pipeline](#oozie--fabric-pipelines) |
| **YARN Resource Manager** | **Fabric Spark 监控**（Spark UI、Monitoring Hub） | 无 YARN — Fabric 自动管理计算资源 |
| **Ambari** | **Fabric Monitoring Hub** + **Admin Portal** | 群集运行状况、容量和作业监控 |
| **WASB / ABFS 存储** | **OneLake 快捷方式** → `abfss://workspace@onelake.dfs.fabric.microsoft.com/` | 请参阅 [path-migration.md](resources/path-migration.md) |
| **Ranger 策略** | **Fabric 工作区角色** + **OneLake 数据访问角色** | 将 Ranger 行/列筛选器映射到 Lakehouse 行级安全性 |
| **Livy REST 服务器** | **Fabric Livy API** | 兼容的端点 — 请参阅 SPARK-AUTHORING-CORE.md |

---

## SparkSession 与 Context API 变更

HDInsight Spark 群集通常使用旧版 Spark 1.x / 2.x API 风格。请将所有这些 API 替换为统一的 `SparkSession`：

| 旧版 HDInsight 模式 | Fabric Spark 3.x 替代方案 |
|---|---|
| `from pyspark import SparkContext; sc = SparkContext()` | 不需要——使用 `sc = spark.sparkContext`（已预先实例化） |
| `from pyspark.sql import HiveContext; hc = HiveContext(sc)` | 不需要——`spark` 会话通过 Delta 架构提供与 Hive 兼容的 SQL 支持 |
| `from pyspark.sql import SQLContext; sqlc = SQLContext(sc)` | 不需要——直接使用 `spark.sql(...)` |
| `SparkSession.builder.enableHiveSupport().getOrCreate()` | 在 Fabric 中不需要——`spark` 已预先创建并可直接使用 |
| `sc.textFile("wasb://container@account.blob.core.windows.net/path")` | `spark.read.text("abfss://workspace@onelake.dfs.fabric.microsoft.com/lh.Lakehouse/Files/path")` |
| `sqlContext.sql("CREATE TABLE ... STORED AS ORC")` | 有关对应的 Delta DDL，请参阅 [hive-to-delta.md](resources/hive-to-delta.md) |

> 在 Fabric 笔记本中，`spark`（SparkSession）和 `sc`（SparkContext）均已**预先实例化**——请勿在迁移后的笔记本顶部调用 `SparkContext()` 或 `SparkSession.builder...getOrCreate()`。

---

## Oozie → Fabric 管道

将 Oozie 工作流操作映射到 Fabric 数据管道活动：

| Oozie 操作类型 | Fabric 管道活动 | 说明 |
|---|---|---|
| `<spark>` 操作 | **笔记本活动**或 **Spark 作业定义活动** | 通过笔记本单元格参数或 SJD 参数传递参数 |
| `<hive>` 操作 | 针对 Lakehouse SQL 终结点的**脚本活动**（SQL） | 将 HiveQL 转换为 Spark SQL 或 Delta SQL |
| `<shell>` 操作 | **Azure Functions 活动**或 **Web 活动** | 必须重构 shell 脚本；Fabric 管道不支持直接执行 shell |
| `<java>` 操作 | **Azure Batch 活动**（外部），或重构为 PySpark | 必须重写 Java MapReduce 作业 |
| `<sqoop>` 操作 | **复制数据活动**（Fabric 数据工厂连接器） | Sqoop 导入/导出映射为以 JDBC 作为源/接收器的 Fabric 复制数据活动 |
| `<coordinator>`（基于时间的计划） | **管道计划触发器** | 在管道触发器中设置重复周期；支持类似 cron 的表达式 |
| `<coordinator>`（数据触发） | **存储事件触发器** | 在 OneLake 文件到达时触发 |

> 映射管道活动后，**委托给 `spark-cli`** 创建笔记本和 SJD。

---

## 引入 `notebookutils`

HDInsight Spark 没有与 `mssparkutils` 或 `dbutils` 等效的内置实用工具框架。迁移到 Fabric 时，请引入 `notebookutils` 以执行常见操作：

| 操作 | 旧版 HDInsight 方法 | `notebookutils` 等效方法 |
|---|---|---|
| 列出文件 | `dbutils`（不适用）/ HDFS CLI | `notebookutils.fs.ls("abfss://...")` |
| 复制文件 | HDFS API / `shutil` | `notebookutils.fs.cp(src, dest)` |
| 读取机密 | Azure Key Vault REST 调用 | `notebookutils.credentials.getSecret(keyVaultUrl, secretName)` |
| 获取笔记本上下文 | 不可用 | `notebookutils.runtime.context`——返回工作区 ID、笔记本 ID 等 |
| 运行子笔记本 | 不可用 | `notebookutils.notebook.run("notebook_name", timeout, {"param": "value"})` |
| 退出笔记本并返回值 | `sys.exit()` | `notebookutils.notebook.exit("value")` |
| 挂载存储 | `spark-defaults.conf` 中的 WASB 配置 | OneLake 快捷方式（无需在运行时挂载） |

---

## Spark 配置差异

| HDInsight 概念 | Fabric Spark 对应项 | 迁移操作 |
|---|---|---|
| `spark-defaults.conf`（集群范围） | Fabric **Spark 工作区设置** + **环境**项 | 将配置属性迁移到环境，或在笔记本中使用 `%%configure` |
| `%%configure` 魔法命令 | `%%configure` 魔法命令——**完全相同** | 无需更改 |
| YARN 队列/资源分配 | **Fabric Spark 池**节点大小和自动缩放设置 | 将队列 SLA 映射到自定义池配置 |
| Ambari 服务配置（HDFS、YARN 调优） | 不适用——Fabric 负责管理基础设施 | 移除；重点关注应用程序级 Spark 配置 |
| HDI Spark 版本（例如 Spark 2.4） | Fabric Runtime 1.3 = Spark 3.5（最新版本） | 测试已弃用 API 的移除情况（例如 `HiveContext`、RDD 风格的 ML） |
| Conda 环境/`bootstrap.sh` | 包含自定义库的 **Fabric 环境**项 | 在 Fabric 环境中重新创建 conda/pip 依赖项 |
| `hive-site.xml`（元存储连接） | 不需要——在 Fabric 中，Delta Lake 就是元存储 | 移除元存储配置；使用 Lakehouse 架构进行命名空间组织 |

---

## 必须 / 建议 / 避免

### 必须执行
- **将所有 `wasb://` / `wasbs://` 路径替换为 OneLake `abfss://` 路径或 OneLake 快捷方式**——`wasb://` 需要存储帐户密钥，而这并非 Fabric 首选的身份验证模型
- **替换 `HiveContext`、`SQLContext` 和独立的 `SparkContext()`**——使用 Fabric 笔记本中预先实例化的 `spark` 会话
- **将 Hive DDL 迁移**（`STORED AS ORC`、`LOCATION`、`TBLPROPERTIES`）为 Delta Lake DDL——参见 [hive-to-delta.md](resources/hive-to-delta.md)
- **引入 `notebookutils`**，用于文件系统操作、机密检索和子笔记本编排，以取代 HDInsight 中使用的自定义脚本或直接 API 调用
- **将 Oozie XML 工作流替换为 Fabric 数据管道**——参见 [§ Oozie → Fabric 管道](#oozie--fabric-pipelines)
- **使库管理方式与 Fabric 环境保持一致**——对于生产工作负载，移除 `bootstrap.sh`、conda 环境和运行时 `%pip install` 模式
- **将 `hdfs://` 视为仅限源集群使用**——将数据导出或引入 ADLS Gen2 或 OneLake；不要声称网关能为 Fabric 仅支持 Anonymous 的 HDFS 连接器增加 Kerberos 支持

### 建议
- **优先使用 OneLake 快捷方式，而不是复制数据**——将现有 ADLS Gen2 容器挂载为快捷方式，以避免迁移期间重新引入数据
- **对所有从 Hive ORC/Parquet 迁移的表使用 Delta Lake**——ACID 保证、时间旅行和架构强制执行可提高数据质量
- **使用 Fabric 入门池进行初始迁移验证**——无需配置池，会话启动速度快
- **使用 Lakehouse 架构**（数据库命名空间）组织迁移后的 Hive 数据库——在单个 Lakehouse 中为每个 Hive 数据库使用一个架构
- **使用奖牌架构**重构迁移期间的数据层——使青铜层/白银层/黄金层与原始 Hive → 已验证 Delta → 服务黄金层模式保持一致

### 避免
- **不要在 Fabric 笔记本中使用 `SparkContext()` 或 `HiveContext()` 构造函数**——它们会与预先实例化的 `spark` 会话冲突并引发错误
- **不要使用 `hive-site.xml` 或外部 Hive 元存储配置**——Fabric 基于 Delta Lake 的 Lakehouse 就是元存储
- **不要假定 YARN 队列映射可以直接转换为 Fabric 池**——应根据 Fabric Spark 池 SLA 重新设计资源分配
- **不要尝试直接在 Fabric 中运行 Oozie shell 操作或 Java MapReduce 作业**——必须对其进行重构（参见 [§ Oozie → Fabric 管道](#oozie--fabric-pipelines)）
- **不要在生产笔记本中使用 `%sh` 魔法命令执行文件系统操作**——使用 `notebookutils.fs.*`，以实现可移植性并支持基于 OneLake 令牌的身份验证

---

## 示例

完整的前后对比示例请参阅 [code-patterns.md](resources/code-patterns.md)。主要快速参考：

**旧版上下文 → Fabric 预实例化会话**

```python
# HDInsight (remove entirely)
from pyspark.sql import HiveContext
hc = HiveContext(sc)

# Fabric — use pre-instantiated spark directly
df = spark.sql("SELECT * FROM sales.fact_orders")
```

**WASB 路径 → OneLake 路径（创建快捷方式后）**

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