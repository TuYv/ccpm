---
name: dask
description: Distributed computing for larger-than-RAM pandas/NumPy workflows. Use when you need to scale existing pandas/NumPy code beyond memory or across clusters. Best for parallel file processing, distributed ML, integration with existing pandas code. For out-of-core analytics on single machine use vaex; for in-memory speed use polars.
allowed-tools: Read Write Edit Bash
license: BSD-3-Clause license
compatibility: Requires Python 3.10+ and dask 2025.1+. DataFrame workflows need pandas 2+ and PyArrow 16+. Cloud paths (s3://, gcs://) need s3fs or gcsfs. Cluster deployment uses dask.distributed (included with dask[complete]).
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# Dask

## 概述

Dask 是一个用于并行和分布式计算的 Python 库，支持以下三项关键能力：
- **超出内存容量的数据执行**：在单台机器上处理超过可用 RAM 容量的数据
- **并行处理**：利用多个核心提升计算速度
- **分布式计算**：支持跨多台机器处理 TB 级数据集

Dask 可从笔记本电脑（处理约 100 GiB）扩展到集群（处理约 100 TiB），同时保留熟悉的 Python API。

**当前上游版本：** dask **2026.3.0**（PyPI，2026 年 3 月）。文档：[docs.dask.org](https://docs.dask.org/en/stable/)。自 **2025.1.0** 起，基于表达式且支持查询规划的 DataFrame API 是唯一实现——不要单独安装 `dask-expr`，也不要设置 `dataframe.query-planning: False`。

## 快速开始

### 安装

```bash
uv pip install "dask>=2025.1"
```

对于使用 distributed 调度器和仪表板的典型 pandas/NumPy 工作流：

```bash
uv pip install "dask[complete]"
```

远程对象存储（S3、GCS、Azure）：

```bash
uv pip install s3fs    # s3:// paths
uv pip install gcsfs   # gs:// paths
```

需要 **Python 3.10+**（2024.12 起不再支持 3.9）。DataFrame I/O 需要 **PyArrow 16+**（截至 dask 2026.1.2）。

## 何时使用此 Skill

以下情况应使用此 skill：
- 处理超过可用 RAM 容量的数据集
- 将 pandas 或 NumPy 操作扩展到更大的数据集
- 并行化计算以提升性能
- 高效处理多个文件（CSV、Parquet、JSON、文本日志）
- 构建具有任务依赖关系的自定义并行工作流
- 跨多个核心或多台机器分发工作负载

## 核心能力

Dask 提供五个主要组件，分别适用于不同的使用场景：

### 1. DataFrames - 并行 Pandas 操作

**用途**：通过并行处理，将 pandas 操作扩展到更大的数据集。

**适用场景**：
- 表格数据超过可用 RAM 容量
- 需要同时处理多个 CSV/Parquet 文件
- Pandas 操作速度较慢，需要并行化
- 将 pandas 原型扩展到生产环境

**参考文档**：有关 Dask DataFrames 的完整指南，请参阅 `references/dataframes.md`，其中包括：
- 读取数据（单个文件、多个文件、glob 模式）
- 常见操作（筛选、groupby、连接、聚合）
- 使用 `map_partitions` 执行自定义操作
- 性能优化建议
- 常见模式（ETL、时间序列、多文件处理）

**快速示例**：
```python
import dask.dataframe as dd

# Read multiple files as single DataFrame
ddf = dd.read_csv('data/2024-*.csv')

# Operations are lazy until compute()
filtered = ddf[ddf['value'] > 100]
result = filtered.groupby('category').mean().compute()
```

**要点**：
- 操作默认是惰性的（构建任务图），直到调用 `.compute()`
- 使用 `map_partitions` 执行高效的自定义操作
- 处理来自其他来源的结构化数据时，尽早转换为 DataFrame

### 2. Arrays - 并行 NumPy 操作

**用途**：使用分块算法将 NumPy 的能力扩展到大于内存容量的数据集。

**使用时机**：
- 数组超过可用 RAM
- 需要对 NumPy 操作进行并行化
- 处理科学数据集（HDF5、Zarr、NetCDF）
- 需要并行线性代数或数组操作

**参考文档**：如需全面了解 Dask Arrays，请参阅 `references/arrays.md`，其中包括：
- 创建数组（从 NumPy、随机数据、磁盘读取）
- 分块策略与优化
- 常见操作（算术运算、归约、线性代数）
- 使用 `map_blocks` 执行自定义操作
- 与 HDF5、Zarr 和 XArray 集成

**快速示例**：
```python
import dask.array as da

# Create large array with chunks
x = da.random.random((100000, 100000), chunks=(10000, 10000))

# Operations are lazy
y = x + 100
z = y.mean(axis=0)

# Compute result
result = z.compute()
```

**要点**：
- 分块大小至关重要（目标是每个分块约 100 MB）
- 操作会并行处理各个分块
- 在需要时重新分块，以提高操作效率
- 对于 Dask 不支持的操作，使用 `map_blocks`

### 3. Bags - 非结构化数据的并行处理

**用途**：使用函数式操作处理非结构化或半结构化数据（文本、JSON、日志）。

**使用时机**：
- 处理文本文件、日志或 JSON 记录
- 在结构化分析之前进行数据清理和 ETL
- 处理无法适配数组/数据框格式的 Python 对象
- 需要节省内存的流式处理

**参考文档**：如需全面了解 Dask Bags，请参阅 `references/bags.md`，其中包括：
- 读取文本和 JSON 文件
- 函数式操作（map、filter、fold、groupby）
- 转换为 DataFrame
- 常见模式（日志分析、JSON 处理、文本处理）
- 性能注意事项

**快速示例**：
```python
import dask.bag as db
import json

# Read and parse JSON files
bag = db.read_text('logs/*.json').map(json.loads)

# Filter and transform
valid = bag.filter(lambda x: x['status'] == 'valid')
processed = valid.map(lambda x: {'id': x['id'], 'value': x['value']})

# Convert to DataFrame for analysis
ddf = processed.to_dataframe()
```

**要点**：
- 用于初始数据清理，然后转换为 DataFrame/Array
- 使用 `foldby` 代替 `groupby`，以获得更好的性能
- 操作采用流式处理且节省内存
- 转换为结构化格式（DataFrame），以执行复杂操作

### 4. Futures - 基于任务的并行化

**用途**：以细粒度控制任务执行和依赖关系的方式构建自定义并行工作流。

**使用时机**：
- 构建动态变化的工作流
- 需要立即执行任务（而非惰性执行）
- 计算依赖运行时条件
- 实现自定义并行算法
- 需要有状态计算

**参考文档**：如需全面了解 Dask Futures，请参阅 `references/futures.md`，其中包括：
- 设置 distributed client
- 提交任务并使用 futures
- 任务依赖关系与数据移动
- 高级协调机制（queues、locks、events、actors）
- 常见模式（参数扫描、动态任务、迭代算法）

**快速示例**：
```python
from dask.distributed import Client

client = Client()  # Create local cluster

# Submit tasks (executes immediately)
def process(x):
    return x ** 2

futures = client.map(process, range(100))

# Gather results
results = client.gather(futures)

client.close()
```

**关键要点**：
- 需要 distributed client（即使只使用单台机器）
- 提交任务后会立即执行
- 预先分发大型数据，以避免重复传输
- 每个任务的开销约为 1ms（不适合数百万个极小任务）
- 对于有状态工作流，使用 actors

### 5. 调度器 - 执行后端

**用途**：控制 Dask 任务的执行方式和位置（线程、进程、分布式）。

**选择调度器的时机**：
- **线程**（默认）：NumPy/Pandas 操作、释放 GIL 的库、能够受益于共享内存的场景
- **进程**：纯 Python 代码、文本处理、受 GIL 限制的操作
- **同步**：使用 pdb 调试、性能分析、理解错误
- **分布式**：需要仪表板、多机器集群或高级功能

**参考文档**：如需全面了解 Dask 调度器，请参阅 `references/schedulers.md`，其中包括：
- 详细的调度器说明及其特性
- 配置方法（全局、上下文管理器、按计算任务）
- 性能考量和开销
- 常见模式和故障排除
- 用于实现最佳性能的线程配置

**快速示例**：
```python
import dask
import dask.dataframe as dd

# Use threads for DataFrame (default, good for numeric)
ddf = dd.read_csv('data.csv')
result1 = ddf.mean().compute()  # Uses threads

# Use processes for Python-heavy work
import dask.bag as db
bag = db.read_text('logs/*.txt')
result2 = bag.map(python_function).compute(scheduler='processes')

# Use synchronous for debugging
dask.config.set(scheduler='synchronous')
result3 = problematic_computation.compute()  # Can use pdb

# Use distributed for monitoring and scaling
from dask.distributed import Client
client = Client()
result4 = computation.compute()  # Uses distributed with dashboard
```

**关键要点**：
- 线程：开销最低（约 10 µs/任务），最适合数值计算
- 进程：避免 GIL 限制（约 10 ms/任务），最适合 Python 计算
- 分布式：提供监控仪表板（约 1 ms/任务），可扩展到集群
- 可以针对每次计算或全局切换调度器

## 最佳实践

如需全面了解性能优化指导、内存管理策略以及应避免的常见问题，请参阅 `references/best-practices.md`。关键原则包括：

### 从更简单的解决方案开始
在使用 Dask 之前，可以先探索：
- 更好的算法
- 高效的文件格式（使用 Parquet 替代 CSV）
- 编译型代码（Numba、Cython）
- 数据采样

### 关键性能规则

**1. 不要先在本地加载数据，再交给 Dask**
```python
# Wrong: Loads all data in memory first
import pandas as pd
df = pd.read_csv('large.csv')
ddf = dd.from_pandas(df, npartitions=10)

# Correct: Let Dask handle loading
import dask.dataframe as dd
ddf = dd.read_csv('large.csv')
```

**2. 避免重复调用 `compute()`**
```python
# Wrong: Each compute is separate
for item in items:
    result = dask_computation(item).compute()

# Correct: Single compute for all
computations = [dask_computation(item) for item in items]
results = dask.compute(*computations)
```

**3. 不要构建过大的任务图**
- 如果任务数量达到数百万，增大分块大小
- 使用 `map_partitions`/`map_blocks` 合并操作
- 检查任务图大小：`len(ddf.__dask_graph__())`

**4. 选择合适的分块大小**
- 目标：每个分块约 100 MB（或者工作节点内存中每个核心对应 10 个分块）
- 过大：内存溢出
- 过小：调度开销

**5. 使用 Dashboard**
```python
from dask.distributed import Client
client = Client()
print(client.dashboard_link)  # Monitor performance, identify bottlenecks
```

## 常见工作流模式

### ETL 管道
```python
import dask.dataframe as dd

# Extract: Read data
ddf = dd.read_csv('raw_data/*.csv')

# Transform: Clean and process
ddf = ddf[ddf['status'] == 'valid']
ddf['amount'] = ddf['amount'].astype('float64')
ddf = ddf.dropna(subset=['important_col'])

# Load: Aggregate and save
summary = ddf.groupby('category').agg({'amount': ['sum', 'mean']})
summary.to_parquet('output/summary.parquet')
```

### 从非结构化数据到结构化数据的管道
```python
import dask.bag as db
import json

# Start with Bag for unstructured data
bag = db.read_text('logs/*.json').map(json.loads)
bag = bag.filter(lambda x: x['status'] == 'valid')

# Convert to DataFrame for structured analysis
ddf = bag.to_dataframe()
result = ddf.groupby('category').mean().compute()
```

### 大规模数组计算
```python
import dask.array as da

# Load or create large array
x = da.from_zarr('large_dataset.zarr')

# Process in chunks
normalized = (x - x.mean()) / x.std()

# Save result (use mode= for overwrite; zarr_array_kwargs for compression)
da.to_zarr(normalized, 'normalized.zarr', mode='w')
```

### 自定义并行工作流
```python
from dask.distributed import Client

client = Client()

# Scatter large dataset once
data = client.scatter(large_dataset)

# Process in parallel with dependencies
futures = []
for param in parameters:
    future = client.submit(process, data, param)
    futures.append(future)

# Gather results
results = client.gather(futures)
```

## 选择合适的组件

使用此决策指南选择适当的 Dask 组件：

**数据类型**：
- 表格数据 → **DataFrames**
- 数值数组 → **Arrays**
- 文本/JSON/日志 → **Bags**（然后转换为 DataFrame）
- 自定义 Python 对象 → **Bags** 或 **Futures**

**操作类型**：
- 标准 pandas 操作 → **DataFrames**
- 标准 NumPy 操作 → **Arrays**
- 自定义并行任务 → **Futures**
- 文本处理/ETL → **Bags**

**控制级别**：
- 高级、自动化 → **DataFrames/Arrays**
- 低级、手动 → **Futures**

**工作流类型**：
- 静态计算图 → **DataFrames/Arrays/Bags**
- 动态、不断演进 → **Futures**

## 集成注意事项

### 文件格式
- **高效**：Parquet、HDF5、Zarr（列式、压缩、适合并行）
- **兼容但较慢**：CSV（仅用于初始数据导入）
- **用于数组**：HDF5、Zarr、NetCDF

### 集合之间的转换
```python
# Bag → DataFrame
ddf = bag.to_dataframe()

# DataFrame → Array (for numeric data)
arr = ddf.to_dask_array(lengths=True)

# Array → DataFrame
ddf = dd.from_dask_array(arr, columns=['col1', 'col2'])
```

### 与其他库配合使用
- **XArray**：为带标签的维度封装 Dask 数组（地理空间、成像）
- **Dask-ML**：使用与 scikit-learn 兼容的 API 进行机器学习
- **Distributed**：高级集群管理和监控

## 调试与开发

### 迭代式开发工作流

1. **使用同步调度器在小数据上进行测试**：
```python
dask.config.set(scheduler='synchronous')
result = computation.compute()  # Can use pdb, easy debugging
```

2. **在样本上使用线程进行验证**：
```python
sample = ddf.head(1000)  # Small sample
# Test logic, then scale to full dataset
```

3. **使用 distributed 进行扩展并监控**：
```python
from dask.distributed import Client
client = Client()
print(client.dashboard_link)  # Monitor performance
result = computation.compute()
```

### 常见问题

**内存错误**：
- 减小分块大小
- 有策略地使用 `persist()`，并在完成后删除
- 检查自定义函数中的内存泄漏

**启动缓慢**：
- 任务图过大（增大分块大小）
- 使用 `map_partitions` 或 `map_blocks` 减少任务数量

**并行化效果不佳**：
- 分块过大（增加分区数量）
- 使用线程执行 Python 代码（切换到进程）
- 数据依赖阻碍并行处理

## 参考文件

所有参考文档文件都可以根据需要读取，以获取详细信息：

- `references/dataframes.md` - 完整的 Dask DataFrame 指南
- `references/arrays.md` - 完整的 Dask Array 指南
- `references/bags.md` - 完整的 Dask Bag 指南
- `references/futures.md` - 完整的 Dask Futures 和分布式计算指南
- `references/schedulers.md` - 完整的调度器选择和配置指南
- `references/best-practices.md` - 全面的性能优化和故障排除指南

当用户需要了解此处提供的快速指导之外的特定 Dask 组件、操作或模式的详细信息时，加载这些文件。