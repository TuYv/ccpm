---
name: spark-optimization
description: Optimize Apache Spark jobs with partitioning, caching, shuffle optimization, and memory tuning. Use when improving Spark performance, debugging slow jobs, or scaling data processing pipelines.
---
# Apache Spark 优化

用于优化 Apache Spark 作业的生产实践模式，涵盖分区策略、内存管理、shuffle 优化以及性能调优。

## 何时使用此技能

- 优化运行缓慢的 Spark 作业
- 调优内存与 executor 配置
- 实现高效的分区策略
- 排查 Spark 性能问题
- 为大规模数据集扩展 Spark 管道
- 减少 shuffle 和数据倾斜

## 核心概念

### 1. Spark 执行模型

```
Driver Program
    ↓
Job (triggered by action)
    ↓
Stages (separated by shuffles)
    ↓
Tasks (one per partition)
```

### 2. 关键性能因素

| 因素              | 影响                  | 解决方案                       |
| ----------------- | --------------------- | ----------------------------- |
| **Shuffle**       | 网络 I/O、磁盘 I/O    | 尽量减少宽转换                 |
| **数据倾斜**      | 任务耗时不均          | 加盐、广播 join                |
| **序列化**        | CPU 开销              | 使用 Kryo、列式格式            |
| **内存**          | GC 压力、溢写         | 调优 executor 内存             |
| **分区**          | 并行度                | 合理设置分区大小               |

## 快速开始

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

# Create optimized Spark session
spark = (SparkSession.builder
    .appName("OptimizedJob")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.adaptive.skewJoin.enabled", "true")
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
    .config("spark.sql.shuffle.partitions", "200")
    .getOrCreate())

# Read with optimized settings
df = (spark.read
    .format("parquet")
    .option("mergeSchema", "false")
    .load("s3://bucket/data/"))

# Efficient transformations
result = (df
    .filter(F.col("date") >= "2024-01-01")
    .select("id", "amount", "category")
    .groupBy("category")
    .agg(F.sum("amount").alias("total")))

result.write.mode("overwrite").parquet("s3://bucket/output/")
```

## 详细模式与示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

### 推荐做法

- **启用 AQE** - 自适应查询执行可处理许多问题
- **使用 Parquet/Delta** - 支持压缩的列式格式
- **广播小表** - 小规模 join 避免 shuffle
- **监控 Spark UI** - 检查数据倾斜、溢写、GC 情况
- **合理设置分区大小** - 每个分区 128MB - 256MB

### 避免做法

- **不要 collect 大量数据** - 保持数据分布式存储
- **不要不必要地使用 UDF** - 优先使用内置函数
- **不要过度缓存** - 内存是有限的
- **不要忽视数据倾斜** - 它会主导作业的运行时间
- **不要用 `.count()` 判断数据是否存在** - 使用 `.take(1)` 或 `.isEmpty()`
