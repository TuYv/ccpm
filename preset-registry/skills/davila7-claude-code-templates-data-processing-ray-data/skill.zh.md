---
name: ray-data
description: Scalable data processing for ML workloads. Streaming execution across CPU/GPU, supports Parquet/CSV/JSON/images. Integrates with Ray Train, PyTorch, TensorFlow. Scales from single machine to 100s of nodes. Use for batch inference, data preprocessing, multi-modal data loading, or distributed ETL pipelines.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Data Processing, Ray Data, Distributed Computing, ML Pipelines, Batch Inference, ETL, Scalable, Ray, PyTorch, TensorFlow]
dependencies: [ray[data], pyarrow, pandas]
---
# Ray Data - 可扩展的机器学习数据处理

面向机器学习和 AI 工作负载的分布式数据处理库。

## 何时使用 Ray Data

**在以下情况下使用 Ray Data：**
- 处理用于机器学习训练的大型数据集（>100GB）
- 需要在集群中进行分布式数据预处理
- 构建批量推理流水线
- 加载多模态数据（图像、音频、视频）
- 将数据处理从笔记本电脑扩展到集群

**主要特性**：
- **流式执行**：处理大于内存容量的数据
- **GPU 支持**：使用 GPU 加速转换
- **框架集成**：PyTorch、TensorFlow、HuggingFace
- **多模态**：图像、Parquet、CSV、JSON、音频、视频

**以下情况改用替代方案**：
- **Pandas**：在单台机器上处理小型数据（<1GB）
- **Dask**：表格数据、类 SQL 操作
- **Spark**：企业级 ETL、SQL 查询

## 快速开始

### 安装

```bash
pip install -U 'ray[data]'
```

### 加载和转换数据

```python
import ray

# Read Parquet files
ds = ray.data.read_parquet("s3://bucket/data/*.parquet")

# Transform data (lazy execution)
ds = ds.map_batches(lambda batch: {"processed": batch["text"].str.lower()})

# Consume data
for batch in ds.iter_batches(batch_size=100):
    print(batch)
```

### 与 Ray Train 集成

```python
import ray
from ray.train import ScalingConfig
from ray.train.torch import TorchTrainer

# Create dataset
train_ds = ray.data.read_parquet("s3://bucket/train/*.parquet")

def train_func(config):
    # Access dataset in training
    train_ds = ray.train.get_dataset_shard("train")

    for epoch in range(10):
        for batch in train_ds.iter_batches(batch_size=32):
            # Train on batch
            pass

# Train with Ray
trainer = TorchTrainer(
    train_func,
    datasets={"train": train_ds},
    scaling_config=ScalingConfig(num_workers=4, use_gpu=True)
)
trainer.fit()
```

## 读取数据

### 从云存储读取

```python
import ray

# Parquet (recommended for ML)
ds = ray.data.read_parquet("s3://bucket/data/*.parquet")

# CSV
ds = ray.data.read_csv("s3://bucket/data/*.csv")

# JSON
ds = ray.data.read_json("gs://bucket/data/*.json")

# Images
ds = ray.data.read_images("s3://bucket/images/")
```

### 从 Python 对象读取

```python
# From list
ds = ray.data.from_items([{"id": i, "value": i * 2} for i in range(1000)])

# From range
ds = ray.data.range(1000000)  # Synthetic data

# From pandas
import pandas as pd
df = pd.DataFrame({"col1": [1, 2, 3], "col2": [4, 5, 6]})
ds = ray.data.from_pandas(df)
```

## 转换

### 批量映射（向量化）

```python
# Batch transformation (fast)
def process_batch(batch):
    batch["doubled"] = batch["value"] * 2
    return batch

ds = ds.map_batches(process_batch, batch_size=1000)
```

### 行转换

```python
# Row-by-row (slower)
def process_row(row):
    row["squared"] = row["value"] ** 2
    return row

ds = ds.map(process_row)
```

### 过滤

```python
# Filter rows
ds = ds.filter(lambda row: row["value"] > 100)
```

### 分组和聚合

```python
# Group by column
ds = ds.groupby("category").count()

# Custom aggregation
ds = ds.groupby("category").map_groups(lambda group: {"sum": group["value"].sum()})
```

## GPU 加速转换

```python
# Use GPU for preprocessing
def preprocess_images_gpu(batch):
    import torch
    images = torch.tensor(batch["image"]).cuda()
    # GPU preprocessing
    processed = images * 255
    return {"processed": processed.cpu().numpy()}

ds = ds.map_batches(
    preprocess_images_gpu,
    batch_size=64,
    num_gpus=1  # Request GPU
)
```

## 写入数据

```python
# Write to Parquet
ds.write_parquet("s3://bucket/output/")

# Write to CSV
ds.write_csv("output/")

# Write to JSON
ds.write_json("output/")
```

## 性能优化

### 重新分区

```python
# Control parallelism
ds = ds.repartition(100)  # 100 blocks for 100-core cluster
```

### 批大小调优

```python
# Larger batches = faster vectorized ops
ds.map_batches(process_fn, batch_size=10000)  # vs batch_size=100
```

### 流式执行

```python
# Process data larger than memory
ds = ray.data.read_parquet("s3://huge-dataset/")
for batch in ds.iter_batches(batch_size=1000):
    process(batch)  # Streamed, not loaded to memory
```

## 常见模式

### 批量推理

```python
import ray

# Load model
def load_model():
    # Load once per worker
    return MyModel()

# Inference function
class BatchInference:
    def __init__(self):
        self.model = load_model()

    def __call__(self, batch):
        predictions = self.model(batch["input"])
        return {"prediction": predictions}

# Run distributed inference
ds = ray.data.read_parquet("s3://data/")
predictions = ds.map_batches(BatchInference, batch_size=32, num_gpus=1)
predictions.write_parquet("s3://output/")
```

### 数据预处理流水线

```python
# Multi-step pipeline
ds = (
    ray.data.read_parquet("s3://raw/")
    .map_batches(clean_data)
    .map_batches(tokenize)
    .map_batches(augment)
    .write_parquet("s3://processed/")
)
```

## 与机器学习框架集成

### PyTorch

```python
# Convert to PyTorch
torch_ds = ds.to_torch(label_column="label", batch_size=32)

for batch in torch_ds:
    # batch is dict with tensors
    inputs, labels = batch["features"], batch["label"]
```

### TensorFlow

```python
# Convert to TensorFlow
tf_ds = ds.to_tf(feature_columns=["image"], label_column="label", batch_size=32)

for features, labels in tf_ds:
    # Train model
    pass
```

## 支持的数据格式

| 格式 | 读取 | 写入 | 使用场景 |
|--------|------|-------|----------|
| Parquet | ✅ | ✅ | 机器学习数据（推荐） |
| CSV | ✅ | ✅ | 表格数据 |
| JSON | ✅ | ✅ | 半结构化数据 |
| 图像 | ✅ | ❌ | 计算机视觉 |
| NumPy | ✅ | ✅ | 数组 |
| Pandas | ✅ | ❌ | DataFrame |

## 性能基准

**扩展能力**（处理 100GB 数据）：
- 1 个节点（16 核）：约 30 分钟
- 4 个节点（64 核）：约 8 分钟
- 16 个节点（256 核）：约 2 分钟

**GPU 加速**（图像预处理）：
- 仅使用 CPU：1,000 张图像/秒
- 1 个 GPU：5,000 张图像/秒
- 4 个 GPU：18,000 张图像/秒

## 使用场景

**生产部署**：
- **Pinterest**：用于模型训练的最后一公里数据处理
- **ByteDance**：扩展多模态大语言模型的离线推理
- **Spotify**：用于批量推理的机器学习平台

## 参考资料

- **[转换指南](references/transformations.md)** - Map、filter、groupby 操作
- **[集成指南](references/integration.md)** - Ray Train、PyTorch、TensorFlow

## 资源

- **文档**：https://docs.ray.io/en/latest/data/data.html
- **GitHub**：https://github.com/ray-project/ray ⭐ 36,000+
- **版本**：Ray 2.40.0+
- **示例**：https://docs.ray.io/en/latest/data/examples/overview.html