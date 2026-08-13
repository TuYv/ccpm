---
name: alterlab-anndata
description: Build, slice, concatenate, read, and write AnnData annotated data matrices (obs, var, X, layers, obsm, uns) — the scverse data STRUCTURE, not an analysis pipeline. Use when creating or wrangling .h5ad/zarr files, managing cell and gene annotations, concatenating batches, or handling layers/obsm/backed-mode; for the QC, normalization, clustering, UMAP, and differential-expression analysis pipeline prefer alterlab-scanpy instead, and for RNA velocity from spliced/unspliced layers prefer alterlab-scvelo instead. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs under `uv run python` with `anndata` (>=0.11) installed in the project env; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# AnnData

## 概述

AnnData 是一个用于处理带注释数据矩阵的 Python 包，可将实验测量值（X）与观测元数据（obs）、变量元数据（var）以及多维注释（obsm、varm、obsp、varp、uns）一同存储。它最初通过 Scanpy 为单细胞基因组学而设计，如今已成为一个通用框架，适用于任何需要高效存储、操作和分析的带注释数据。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 创建、读取或写入 AnnData 对象
- 使用 h5ad、zarr 或其他基因组学数据格式
- 执行单细胞 RNA-seq 分析
- 使用稀疏矩阵或后备模式管理大型数据集
- 拼接多个数据集或实验批次
- 对带注释数据进行取子集、筛选或转换
- 与 scanpy、scvi-tools 或其他 scverse 生态系统工具集成

## 安装

```bash
uv pip install anndata          # 0.11+ (the API namespaces below assume >= 0.11)

# Optional extra for Dask-backed lazy reads (ad.experimental.read_lazy)
uv pip install 'anndata[dask]'
```

## 快速开始

### 创建 AnnData 对象
```python
import anndata as ad
import numpy as np
import pandas as pd

# Minimal creation
X = np.random.rand(100, 2000)  # 100 cells × 2000 genes
adata = ad.AnnData(X)

# With metadata
obs = pd.DataFrame({
    'cell_type': ['T cell', 'B cell'] * 50,
    'sample': ['A', 'B'] * 50
}, index=[f'cell_{i}' for i in range(100)])

var = pd.DataFrame({
    'gene_name': [f'Gene_{i}' for i in range(2000)]
}, index=[f'ENSG{i:05d}' for i in range(2000)])

adata = ad.AnnData(X=X, obs=obs, var=var)
```

### 读取数据
```python
import scanpy as sc  # 10x readers live in scanpy, not anndata

# Read h5ad file
adata = ad.read_h5ad('data.h5ad')

# Read with backed mode (for large files)
adata = ad.read_h5ad('large_data.h5ad', backed='r')

# Read other formats (these live under ad.io as of anndata 0.11)
adata = ad.io.read_csv('data.csv')
adata = ad.io.read_loom('data.loom')
adata = sc.read_10x_h5('filtered_feature_bc_matrix.h5')
```

> **API 命名空间（anndata >= 0.11）**：所有格式的读取器和写入器均已移至
> `anndata.io` 模块（`ad.io.read_csv`、`ad.io.read_mtx`、`ad.io.read_loom`、
> `ad.io.read_elem` 等）。顶层的 `ad.read_csv` 风格别名仍然可用，
> 但会发出 `DeprecationWarning`。**例外情况**：`ad.read_h5ad`、`ad.read_zarr`、
> `adata.write_h5ad` 和 `adata.write_zarr` 仍保留在顶层，并且不会发出警告。
>
> **10x 读取器**（`read_10x_h5`、`read_10x_mtx`）位于 **scanpy**
>（`sc.read_10x_h5`）中，而不在 anndata 中——此 Skill 将分析专用的 I/O 交由 scanpy 处理。

### 写入数据
```python
# Write h5ad file
adata.write_h5ad('output.h5ad')

# Write with compression
adata.write_h5ad('output.h5ad', compression='gzip')

# Write other formats
adata.write_zarr('output.zarr')
adata.write_csvs('output_dir/')
```

### 基本操作
```python
# Subset by conditions
t_cells = adata[adata.obs['cell_type'] == 'T cell']

# Subset by indices
subset = adata[0:50, 0:100]

# Add metadata
adata.obs['quality_score'] = np.random.rand(adata.n_obs)
adata.var['highly_variable'] = np.random.rand(adata.n_vars) > 0.8

# Access dimensions
print(f"{adata.n_obs} observations × {adata.n_vars} variables")
```

## 核心功能

### 1. 数据结构

了解 AnnData 对象的结构，包括 X、obs、var、layers、obsm、varm、obsp、varp、uns 和 raw 组件。

**参见**：`references/data_structure.md`，其中包含以下内容的全面信息：
- 核心组件（X、obs、var、layers、obsm、varm、obsp、varp、uns、raw）
- 从各种数据源创建 AnnData 对象
- 访问和操作数据组件
- 内存高效实践

### 2. 输入/输出操作

以多种格式读取和写入数据，并支持压缩、后备模式和云存储。

**参见**：`references/io_operations.md`，了解以下内容的详细信息：
- 原生格式（h5ad、zarr）
- 其他格式（CSV、MTX、Loom、10X、Excel）
- 用于大型数据集的后备模式
- 远程数据访问
- 格式转换
- 性能优化

常用命令：
```python
# Read/write h5ad
adata = ad.read_h5ad('data.h5ad', backed='r')
adata.write_h5ad('output.h5ad', compression='gzip')

# Read 10X data (10x readers live in scanpy, not anndata)
import scanpy as sc
adata = sc.read_10x_h5('filtered_feature_bc_matrix.h5')

# Read MTX format (.mtx is variables x observations; transpose so cells are rows)
adata = ad.io.read_mtx('matrix.mtx').T
```

### 3. 拼接

沿观测或变量维度组合多个 AnnData 对象，并支持灵活的连接策略。

**参见**：`references/concatenation.md`，其中全面涵盖：
- 基本拼接（axis=0 表示观测，axis=1 表示变量）
- 连接类型（inner、outer）
- 合并策略（same、unique、first、only）
- 使用标签追踪数据来源
- 惰性拼接（AnnCollection）
- 面向大型数据集的磁盘拼接

常用命令：
```python
# Concatenate observations (combine samples)
adata = ad.concat(
    [adata1, adata2, adata3],
    axis=0,
    join='inner',
    label='batch',
    keys=['batch1', 'batch2', 'batch3']
)

# Concatenate variables (combine modalities)
adata = ad.concat([adata_rna, adata_protein], axis=1)

# Lazy concatenation
from anndata.experimental import AnnCollection
collection = AnnCollection(
    ['data1.h5ad', 'data2.h5ad'],
    join_obs='outer',
    label='dataset'
)
```

### 4. 数据操作

高效地转换、取子集、筛选和重组数据。

**参见**：`references/manipulation.md`，了解以下内容的详细指导：
- 取子集（按索引、名称、布尔掩码、元数据条件）
- 转置
- 复制（完整副本与视图）
- 重命名（观测、变量、类别）
- 类型转换（字符串转分类类型、稀疏格式与密集格式之间的转换）
- 添加/删除数据组件
- 重新排序
- 质量控制筛选

常用命令：
```python
# Subset by metadata
filtered = adata[adata.obs['quality_score'] > 0.8]
hv_genes = adata[:, adata.var['highly_variable']]

# Transpose
adata_T = adata.T

# Copy vs view
view = adata[0:100, :]  # View (lightweight reference)
copy = adata[0:100, :].copy()  # Independent copy

# Convert strings to categoricals
adata.strings_to_categoricals()
```

### 5. 最佳实践

遵循内存效率、性能和可复现性方面的推荐模式。

**参见**：`references/best_practices.md`，其中包含以下方面的指南：
- 内存管理（稀疏矩阵、分类数据、后备模式）
- 视图与副本
- 数据存储优化
- 性能优化
- 原始数据的处理
- 元数据管理
- 可复现性
- 错误处理
- 与其他工具集成
- 常见陷阱及解决方案

关键建议：
```python
# Use sparse matrices for sparse data
from scipy.sparse import csr_matrix
adata.X = csr_matrix(adata.X)

# Convert strings to categoricals
adata.strings_to_categoricals()

# Use backed mode for large files
adata = ad.read_h5ad('large.h5ad', backed='r')

# Store raw before filtering
adata.raw = adata.copy()
adata = adata[:, adata.var['highly_variable']]
```

## 与 Scverse 生态系统集成

AnnData 是 scverse 生态系统的基础数据结构：

### Scanpy（单细胞分析）
AnnData 是 scanpy 的原生对象——构建或加载后，可直接将其传入。
预处理、降维、聚类和绘图
（`sc.pp.normalize_total`、`sc.pp.highly_variable_genes`、`sc.pp.pca`、
`sc.pp.neighbors`、`sc.tl.umap`、`sc.tl.leiden`、`sc.pl.*`）是 **scanpy
的职责，而不是 anndata 的职责**——应将分析工作流交由 scanpy 处理。
```python
import scanpy as sc

sc.pp.filter_cells(adata, min_genes=200)  # scanpy mutates the AnnData in place
# ... continue the analysis pipeline in scanpy
```

### Muon（多模态数据）
```python
import muon as mu

# Combine RNA and protein data
mdata = mu.MuData({'rna': adata_rna, 'protein': adata_protein})
```

### PyTorch 集成
```python
from anndata.experimental import AnnLoader

# Create DataLoader for deep learning (also accepts an AnnCollection)
dataloader = AnnLoader(adata, batch_size=128, shuffle=True)

for batch in dataloader:
    X = batch["X"]      # dict-style access; tensors, not attributes
    labels = batch["obs"]["cell_type"]
    # Train model
```

## 常见工作流

### 单细胞数据生命周期（由 anndata 负责的部分）
加载数据、在 `obs`/`var` 上计算简单的 QC 指标、创建 `raw` 快照、进行子集筛选并写入数据。
normalize/log1p/HVG/cluster 步骤属于 scanpy——应交由 scanpy 处理。
```python
import anndata as ad
import scanpy as sc

# 1. Load (10x readers live in scanpy)
adata = sc.read_10x_h5('filtered_feature_bc_matrix.h5')

# 2. Quick QC metrics on obs/var, then mask-subset (pure anndata wrangling)
adata.obs['n_genes'] = (adata.X > 0).sum(axis=1)
adata.obs['n_counts'] = adata.X.sum(axis=1)
adata = adata[(adata.obs['n_genes'] > 200) & (adata.obs['n_counts'] < 50000)].copy()

# 3. Snapshot raw before any gene filtering
adata.raw = adata.copy()

# 4. Hand off normalization / HVG / clustering to scanpy, then come back:
#    sc.pp.normalize_total / sc.pp.log1p / sc.pp.highly_variable_genes / ...
adata = adata[:, adata.var['highly_variable']].copy()  # subset is anndata's job

# 5. Save processed data
adata.write_h5ad('processed.h5ad', compression='gzip')
```

### 批次整合（先拼接，再进行校正）
```python
# Load and concatenate batches with source labels — this is anndata's job
adatas = [ad.read_h5ad(p) for p in ['batch1.h5ad', 'batch2.h5ad', 'batch3.h5ad']]
adata = ad.concat(
    adatas,
    label='batch',
    keys=['batch1', 'batch2', 'batch3'],
    join='inner',
)

# Batch correction and downstream analysis (combat / pca / neighbors / umap)
# are scanpy territory — pass `adata` to scanpy from here.
```

### 处理大型数据集
```python
# Open in backed mode
adata = ad.read_h5ad('100GB_dataset.h5ad', backed='r')

# Filter based on metadata (no data loading)
high_quality = adata[adata.obs['quality_score'] > 0.8]

# Load filtered subset
adata_subset = high_quality.to_memory()

# Process subset
process(adata_subset)

# Or process in chunks
chunk_size = 1000
for i in range(0, adata.n_obs, chunk_size):
    chunk = adata[i:i+chunk_size, :].to_memory()
    process(chunk)
```

## 故障排除

### 内存不足错误
使用 backed 模式或转换为稀疏矩阵：
```python
# Backed mode
adata = ad.read_h5ad('file.h5ad', backed='r')

# Sparse matrices
from scipy.sparse import csr_matrix
adata.X = csr_matrix(adata.X)
```

### 文件读取缓慢
使用压缩和适当的格式：
```python
# Optimize for storage
adata.strings_to_categoricals()
adata.write_h5ad('file.h5ad', compression='gzip')

# Use Zarr for cloud storage
adata.write_zarr('file.zarr', chunks=(1000, 1000))
```

### 索引对齐问题
始终按索引对齐外部数据：
```python
# Wrong
adata.obs['new_col'] = external_data['values']

# Correct
adata.obs['new_col'] = external_data.set_index('cell_id').loc[adata.obs_names, 'values']
```

## 其他资源

- **官方文档**：https://anndata.readthedocs.io/
- **Scanpy 教程**：https://scanpy.readthedocs.io/
- **Scverse 生态系统**：https://scverse.org/
- **GitHub 仓库**：https://github.com/scverse/anndata