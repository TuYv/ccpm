---
name: alterlab-scanpy
description: Run the standard single-cell RNA-seq analysis pipeline with Scanpy on AnnData — QC filtering, normalization, dimensionality reduction (PCA, UMAP, t-SNE), Leiden/Louvain clustering, marker/differential expression, PAGA trajectories, and plotting. Use when analyzing scRNA-seq data through clustering, cell-type annotation, DE, or pseudotime workflows; for building or reading the .h5ad data structure itself (layers, obs/var, concatenation, backed mode) prefer alterlab-anndata instead, and for RNA velocity from spliced/unspliced counts prefer alterlab-scvelo instead. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Scanpy：单细胞分析

## 概述

Scanpy 是一个基于 AnnData 构建的、可扩展的 Python 单细胞 RNA-seq 数据分析工具包。此技能适用于完整的单细胞分析工作流，包括质量控制、标准化、降维、聚类、标记基因鉴定、可视化和轨迹分析。

## 何时使用此技能

此技能适用于：
- 分析单细胞 RNA-seq 数据（.h5ad、10X、CSV 格式）
- 对 scRNA-seq 数据集执行质量控制
- 创建 UMAP、t-SNE 或 PCA 可视化
- 识别细胞簇并查找标记基因
- 根据基因表达注释细胞类型
- 执行轨迹推断或伪时间分析
- 生成出版质量的单细胞图表

## 快速开始

### 基本导入和设置

```python
import scanpy as sc
import pandas as pd
import numpy as np

# Configure settings
sc.settings.verbosity = 3
sc.settings.set_figure_params(dpi=80, facecolor='white')
sc.settings.figdir = './figures/'
```

### 加载数据

```python
# From 10X Genomics
adata = sc.read_10x_mtx('path/to/data/')
adata = sc.read_10x_h5('path/to/data.h5')

# From h5ad (AnnData format)
adata = sc.read_h5ad('path/to/data.h5ad')

# From CSV
adata = sc.read_csv('path/to/data.csv')
```

### 了解 AnnData 结构

AnnData 对象是 scanpy 中的核心数据结构：

```python
adata.X          # Expression matrix (cells × genes)
adata.obs        # Cell metadata (DataFrame)
adata.var        # Gene metadata (DataFrame)
adata.uns        # Unstructured annotations (dict)
adata.obsm       # Multi-dimensional cell data (PCA, UMAP)
adata.raw        # Raw data backup

# Access cell and gene names
adata.obs_names  # Cell barcodes
adata.var_names  # Gene names
```

## 标准分析工作流

### 1. 质量控制

识别并过滤低质量细胞和基因：

```python
# Identify mitochondrial genes
adata.var['mt'] = adata.var_names.str.startswith('MT-')

# Calculate QC metrics
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)

# Visualize QC metrics
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],
             jitter=0.4, multi_panel=True)

# Filter cells and genes
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata = adata[adata.obs.pct_counts_mt < 5, :]  # Remove high MT% cells
```

**使用 QC 脚本进行自动化分析：**
```bash
python scripts/qc_analysis.py input_file.h5ad --output filtered.h5ad
```

### 2. 标准化和预处理

```python
# Normalize to 10,000 counts per cell
sc.pp.normalize_total(adata, target_sum=1e4)

# Log-transform
sc.pp.log1p(adata)

# Save raw counts for later
adata.raw = adata

# Identify highly variable genes
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.pl.highly_variable_genes(adata)

# Subset to highly variable genes
adata = adata[:, adata.var.highly_variable]

# Regress out unwanted variation
sc.pp.regress_out(adata, ['total_counts', 'pct_counts_mt'])

# Scale data
sc.pp.scale(adata, max_value=10)
```

### 3. 降维

```python
# PCA
sc.tl.pca(adata, svd_solver='arpack')
sc.pl.pca_variance_ratio(adata, log=True)  # Check elbow plot

# Compute neighborhood graph
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)

# UMAP for visualization
sc.tl.umap(adata)
sc.pl.umap(adata, color='leiden')

# Alternative: t-SNE
sc.tl.tsne(adata)
```

### 4. 聚类

```python
# Leiden clustering (recommended). Pass flavor='igraph' (the future default) +
# n_iterations=2 — the bare call emits a FutureWarning and uses the slow backend.
sc.tl.leiden(adata, resolution=0.5, flavor='igraph', n_iterations=2)
sc.pl.umap(adata, color='leiden', legend_loc='on data')

# Try multiple resolutions to find optimal granularity
for res in [0.3, 0.5, 0.8, 1.0]:
    sc.tl.leiden(adata, resolution=res, flavor='igraph', n_iterations=2,
                 key_added=f'leiden_{res}')
```

### 5. 标记基因鉴定

```python
# Find marker genes for each cluster
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')

# Visualize results
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False)
sc.pl.rank_genes_groups_heatmap(adata, n_genes=10)
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5)

# Get results as DataFrame
markers = sc.get.rank_genes_groups_df(adata, group='0')
```

### 6. 细胞类型注释

```python
# Define marker genes for known cell types
marker_genes = ['CD3D', 'CD14', 'MS4A1', 'NKG7', 'FCGR3A']

# Visualize markers
sc.pl.umap(adata, color=marker_genes, use_raw=True)
sc.pl.dotplot(adata, var_names=marker_genes, groupby='leiden')

# Manual annotation
cluster_to_celltype = {
    '0': 'CD4 T cells',
    '1': 'CD14+ Monocytes',
    '2': 'B cells',
    '3': 'CD8 T cells',
}
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_to_celltype)

# Visualize annotated types
sc.pl.umap(adata, color='cell_type', legend_loc='on data')
```

### 7. 保存结果

```python
# Save processed data
adata.write('results/processed_data.h5ad')

# Export metadata
adata.obs.to_csv('results/cell_metadata.csv')
adata.var.to_csv('results/gene_metadata.csv')
```

## 常见任务

### 创建出版级图表

```python
# Set high-quality defaults
sc.settings.set_figure_params(dpi=300, frameon=False, figsize=(5, 5))
sc.settings.file_format_figs = 'pdf'

# UMAP with custom styling
sc.pl.umap(adata, color='cell_type',
           palette='Set2',
           legend_loc='on data',
           legend_fontsize=12,
           legend_fontoutline=2,
           frameon=False,
           save='_publication.pdf')

# Heatmap of marker genes
sc.pl.heatmap(adata, var_names=genes, groupby='cell_type',
              swap_axes=True, show_gene_labels=True,
              save='_markers.pdf')

# Dot plot
sc.pl.dotplot(adata, var_names=genes, groupby='cell_type',
              save='_dotplot.pdf')
```

有关全面的可视化示例，请参阅 `references/plotting_guide.md`。

### 轨迹推断

```python
# PAGA (Partition-based graph abstraction)
sc.tl.paga(adata, groups='leiden')
sc.pl.paga(adata, color='leiden')

# Diffusion pseudotime
adata.uns['iroot'] = np.flatnonzero(adata.obs['leiden'] == '0')[0]
sc.tl.dpt(adata)
sc.pl.umap(adata, color='dpt_pseudotime')
```

### 条件间差异表达

```python
# Compare treated vs control within cell types
adata_subset = adata[adata.obs['cell_type'] == 'T cells']
sc.tl.rank_genes_groups(adata_subset, groupby='condition',
                         groups=['treated'], reference='control')
sc.pl.rank_genes_groups(adata_subset, groups=['treated'])
```

### 基因集评分

```python
# Score cells for gene set expression
gene_set = ['CD3D', 'CD3E', 'CD3G']
sc.tl.score_genes(adata, gene_set, score_name='T_cell_score')
sc.pl.umap(adata, color='T_cell_score')
```

### 批次校正

```python
# ComBat batch correction
sc.pp.combat(adata, key='batch')

# Alternative: use Harmony or scVI (separate packages)
```

## 需要调整的关键参数

### 质量控制
- `min_genes`：每个细胞的最少基因数（通常为 200-500）
- `min_cells`：每个基因的最少细胞数（通常为 3-10）
- `pct_counts_mt`：线粒体比例阈值（通常为 5-20%）

### 归一化
- `target_sum`：每个细胞的目标计数（默认为 1e4）

### 特征选择
- `n_top_genes`：高变基因（HVG）的数量（通常为 2000-3000）
- `min_mean`、`max_mean`、`min_disp`：HVG 选择参数

### 降维
- `n_pcs`：主成分数量（查看方差比图）
- `n_neighbors`：邻居数量（通常为 10-30）

### 聚类
- `resolution`：聚类粒度（0.4-1.2，值越高，聚类数越多）

## 常见陷阱与最佳实践

1. **始终保存原始计数**：在过滤基因前设置 `adata.raw = adata`
2. **仔细检查质量控制图**：根据数据集质量调整阈值
3. **使用带有 `flavor='igraph'` 的 Leiden**：这是未来的默认选项，并且比 Louvain 或旧版 `leidenalg` 后端快得多——使用 `pip`/`uv` 安装 `igraph` 包（scanpy 未捆绑该包）
4. **尝试多种聚类分辨率**：找到最佳粒度
5. **验证细胞类型注释**：使用多个标记基因
6. **在基因表达图中使用 `use_raw=True`**：显示原始计数
7. **检查 PCA 方差比**：确定最佳 PC 数量
8. **保存中间结果**：长流程可能会在中途失败

## 捆绑资源

### scripts/qc_analysis.py
自动化质量控制脚本，用于计算指标、生成图表并过滤数据：

```bash
python scripts/qc_analysis.py input.h5ad --output filtered.h5ad \
    --mt-threshold 5 --min-genes 200 --min-cells 3
```

### references/standard_workflow.md
完整的分步工作流程，包含以下内容的详细说明和代码示例：
- 数据加载与设置
- 带可视化的质量控制
- 归一化与缩放
- 特征选择
- 降维（PCA、UMAP、t-SNE）
- 聚类（Leiden、Louvain）
- 标记基因识别
- 细胞类型注释
- 轨迹推断
- 差异表达

从头开始执行完整分析时，请阅读此参考资料。

### references/api_reference.md
按模块组织的 scanpy 函数快速参考指南：
- 数据读写（`sc.read_*`、`adata.write_*`）
- 预处理（`sc.pp.*`）
- 工具（`sc.tl.*`）
- 绘图（`sc.pl.*`）
- AnnData 结构与操作
- 设置与实用工具

使用此文档可快速查找函数签名和常用参数。

### references/plotting_guide.md
全面的可视化指南，包括：
- 质量控制图
- 降维可视化
- 聚类可视化
- 标记基因图（热图、点图、小提琴图）
- 轨迹和伪时间图
- 出版级自定义
- 多面板图
- 调色板和样式

创建出版级图表时，请查阅此文档。

### assets/analysis_template.py
完整的分析模板，提供从数据加载到细胞类型注释的完整工作流。对于新的分析，请复制并自定义此模板：

```bash
cp assets/analysis_template.py my_analysis.py
# Edit parameters and run
python my_analysis.py
```

该模板包含所有标准步骤，并提供可配置参数和实用注释。

## 其他资源

- **Scanpy 官方文档**：https://scanpy.readthedocs.io/
- **Scanpy 教程**：https://scanpy-tutorials.readthedocs.io/
- **scverse 生态系统**：https://scverse.org/（相关工具：squidpy、scvi-tools、cellrank）
- **最佳实践**：Luecken & Theis（2019）《单细胞 RNA-seq 当前最佳实践》

## 高效分析技巧

1. **从模板开始**：使用 `assets/analysis_template.py` 作为起点
2. **首先运行 QC 脚本**：使用 `scripts/qc_analysis.py` 进行初始过滤
3. **按需查阅参考资料**：将工作流和 API 参考资料加载到上下文中
4. **迭代调整聚类**：尝试多种分辨率和可视化方法
5. **进行生物学验证**：检查标记基因是否与预期细胞类型相符
6. **记录参数**：记录 QC 阈值和分析设置
7. **保存检查点**：在关键步骤写出中间结果