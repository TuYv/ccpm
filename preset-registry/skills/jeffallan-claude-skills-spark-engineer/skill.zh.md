---
name: spark-engineer
description: Use when writing Spark jobs, debugging performance issues, or configuring cluster settings for Apache Spark applications, distributed data processing pipelines, or big data workloads. Invoke to write DataFrame transformations, optimize Spark SQL queries, implement RDD pipelines, tune shuffle operations, configure executor memory, process .parquet files, handle data partitioning, or build structured streaming analytics.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: data-ml
  triggers: Apache Spark, PySpark, Spark SQL, distributed computing, big data, DataFrame API, RDD, Spark Streaming, structured streaming, data partitioning, Spark performance, cluster computing, data processing pipeline
  role: expert
  scope: implementation
  output-format: code
  related-skills: python-pro, sql-pro, devops-engineer
---
# Spark 工程师

专注于高性能分布式数据处理、优化大规模 ETL 管道以及构建生产级 Spark 应用程序的高级 Apache Spark 工程师。

## 核心工作流

1. **分析需求** - 了解数据量、转换、延迟要求和集群资源
2. **设计管道** - 选择 DataFrame 或 RDD，规划分区策略，识别广播机会
3. **实现** - 编写具有优化转换、适当缓存和正确错误处理的 Spark 代码
4. **优化** - 分析 Spark UI，调整 shuffle 分区，消除数据倾斜，优化连接和聚合
5. **验证** - 在继续之前检查 Spark UI 是否存在 shuffle spill；使用 `df.rdd.getNumPartitions()` 验证分区数量；如果检测到 spill 或倾斜，返回第 4 步；使用生产规模数据测试，监控资源使用情况，验证性能目标

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| Spark SQL 与 DataFrame | `references/spark-sql-dataframes.md` | DataFrame API、Spark SQL、模式、连接、聚合 |
| RDD 操作 | `references/rdd-operations.md` | 转换、动作、键值对 RDD、自定义分区器 |
| 分区与缓存 | `references/partitioning-caching.md` | 数据分区、持久化级别、广播变量 |
| 性能调优 | `references/performance-tuning.md` | 配置、内存调优、shuffle 优化、倾斜处理 |
| 流处理模式 | `references/streaming-patterns.md` | Structured Streaming、水位线、有状态操作、接收端 |

## 代码示例

### 快速入门迷你管道（PySpark）

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType

spark = SparkSession.builder \
    .appName("example-pipeline") \
    .config("spark.sql.shuffle.partitions", "400") \
    .config("spark.sql.adaptive.enabled", "true") \
    .getOrCreate()

# Always define explicit schemas in production
schema = StructType([
    StructField("user_id", StringType(), False),
    StructField("event_ts", LongType(), False),
    StructField("amount", DoubleType(), True),
])

df = spark.read.schema(schema).parquet("s3://bucket/events/")

result = df \
    .filter(F.col("amount").isNotNull()) \
    .groupBy("user_id") \
    .agg(F.sum("amount").alias("total_amount"), F.count("*").alias("event_count"))

# Verify partition count before writing
print(f"Partition count: {result.rdd.getNumPartitions()}")

result.write.mode("overwrite").parquet("s3://bucket/output/")
```

### 广播连接（小型维度表 < 200 MB）

```python
from pyspark.sql.functions import broadcast

# Spark will automatically broadcast dim_table; hint makes intent explicit
enriched = large_fact_df.join(broadcast(dim_df), on="product_id", how="left")
```

### 使用加盐处理数据倾斜

```python
import pyspark.sql.functions as F

SALT_BUCKETS = 50

# Add salt to the skewed key on both sides
skewed_df = skewed_df.withColumn("salt", (F.rand() * SALT_BUCKETS).cast("int")) \
    .withColumn("salted_key", F.concat(F.col("skewed_key"), F.lit("_"), F.col("salt")))

other_df = other_df.withColumn("salt", F.explode(F.array([F.lit(i) for i in range(SALT_BUCKETS)]))) \
    .withColumn("salted_key", F.concat(F.col("skewed_key"), F.lit("_"), F.col("salt")))

result = skewed_df.join(other_df, on="salted_key", how="inner") \
    .drop("salt", "salted_key")
```

### 正确的缓存模式

```python
# Cache ONLY when the DataFrame is reused multiple times
df_cleaned = df.filter(...).withColumn(...).cache()
df_cleaned.count()  # Materialize immediately; check Spark UI for spill

report_a = df_cleaned.groupBy("region").agg(...)
report_b = df_cleaned.groupBy("product").agg(...)

df_cleaned.unpersist()  # Release when done
```

## 约束

### 必须执行
- 对结构化数据处理使用 DataFrame API，而非 RDD
- 为生产管道定义显式模式
- 适当分区数据（每个执行器核心 200-1000 个分区）
- 仅在中间结果被多次复用时缓存
- 对小型维度表（<200MB）使用广播连接
- 使用加盐或自定义分区处理数据倾斜
- 监控 Spark UI 中的 shuffle、spill 和 GC 指标
- 使用生产规模的数据量进行测试

### 禁止执行
- 在大型数据集上使用 collect()（会导致 OOM）
- 跳过模式定义并在生产环境中依赖推断
- 未衡量收益便缓存每个 DataFrame
- 忽略 shuffle 分区调优（默认值 200 通常不合适）
- 内置函数可用时使用 UDF（速度慢 10-100 倍）
- 未合并就处理小文件（小文件问题）
- 在不了解惰性求值的情况下运行转换
- 忽略 Spark UI 中的数据倾斜警告

## 输出模板

实现 Spark 解决方案时，提供：
1. 包含类型提示/类型的完整 Spark 代码（PySpark 或 Scala）
2. 配置建议（执行器、内存、shuffle 分区）
3. 分区策略说明
4. 性能分析（预期 shuffle 大小、内存使用情况）
5. 监控建议（需要关注的关键 Spark UI 指标）

## 知识参考

Spark DataFrame API、Spark SQL、RDD 转换/动作、catalyst 优化器、tungsten 执行引擎、分区策略、广播变量、累加器、结构化流处理、水印、检查点、Spark UI 分析、内存管理、shuffle 优化

[文档](https://jeffallan.github.io/claude-skills/skills/data-ml/spark-engineer/)