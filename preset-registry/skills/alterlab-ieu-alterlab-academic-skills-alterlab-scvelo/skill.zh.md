---
name: alterlab-scvelo
description: Run RNA velocity analysis with scVelo on single-cell RNA-seq data — estimate cell-state transitions from spliced/unspliced mRNA dynamics, infer trajectory direction, compute latent time, and identify driver genes. Use when adding directionality to trajectories or studying differentiation dynamics from spliced/unspliced layers (velocyto/STARsolo output); for the general QC, clustering, UMAP, and differential-expression analysis pipeline prefer alterlab-scanpy instead, and for .h5ad data-structure I/O and layer wrangling prefer alterlab-anndata instead. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# scVelo — RNA Velocity 分析

## 概述

scVelo 是用于分析单细胞 RNA-seq 数据中 RNA velocity 的主流 Python 软件包。它通过对 mRNA 剪接动力学进行建模来推断细胞状态转换——利用未剪接 RNA（pre-mRNA）与已剪接 RNA（成熟 mRNA）的丰度比值，判断每个细胞中的基因正在上调还是下调。借助这种方法，无需时间序列数据即可重建发育轨迹并识别细胞命运决定。

**安装：** `uv pip install "scvelo==0.3.4"`（截至 2025 年年中为最新版本）。注意：scVelo 的依赖项声明了无上限的 `numpy>=1.17`，但该技术栈在 **numpy 2.x** 下会出错——如果在导入或绘图时遇到难以理解的 `np.float_`/dtype 错误，请固定使用 `numpy<2`（例如 `numpy==1.26.4`）。pandas 2.x 可在 0.3.x 上正常使用。

**关键资源：**
- 文档：https://scvelo.readthedocs.io/
- GitHub：https://github.com/theislab/scvelo
- 论文：Bergen 等人（2020），Nature Biotechnology。PMID：32747759

## 何时使用此 Skill

在以下情形中使用 scVelo：

- **从快照数据推断轨迹**：确定细胞正在向哪个方向分化
- **细胞命运预测**：识别祖细胞及其下游命运
- **驱动基因识别**：找出其动态变化最能解释观测轨迹的基因
- **发育生物学**：对造血、神经发生和上皮-间充质转化进行建模
- **潜在时间估计**：沿着从剪接动力学推导出的伪时间对细胞进行排序
- **作为 Scanpy 的补充**：向 UMAP 嵌入添加方向信息

## 前提条件

scVelo 需要同时包含**未剪接**和**已剪接** RNA 的计数矩阵。可通过以下方式生成：
1. 使用 `lamanno` 模式的 **STARsolo** 或 **kallisto|bustools**
2. **velocyto** CLI：`velocyto run10x` / `velocyto run`
3. 提供已剪接/未剪接输出的 **alevin-fry** / **simpleaf**

数据存储在 `AnnData` 对象中，其中包含 `layers["spliced"]` 和 `layers["unspliced"]`。

## 标准 RNA Velocity 工作流

### 1. 设置和数据加载

```python
import scvelo as scv
import scanpy as sc
import numpy as np
import matplotlib.pyplot as plt

# Configure settings
scv.settings.verbosity = 3       # Show computation steps
scv.settings.presenter_view = True
scv.settings.set_figure_params('scvelo')

# Load data (AnnData with spliced/unspliced layers)
# Option A: Load from loom (velocyto output)
adata = scv.read("cellranger_output.loom", cache=True)

# Option B: Merge velocyto loom with Scanpy-processed AnnData
adata_processed = sc.read_h5ad("processed.h5ad")  # Has UMAP, clusters
adata_velocity = scv.read("velocyto.loom")
adata = scv.utils.merge(adata_processed, adata_velocity)

# Verify layers
print(adata)
# obs × var: N × G
# layers: 'spliced', 'unspliced' (required)
# obsm['X_umap'] (required for visualization)
```

### 2. 预处理

```python
# Filter and normalize (follows Scanpy conventions)
scv.pp.filter_and_normalize(
    adata,
    min_shared_counts=20,   # Minimum counts in spliced+unspliced
    n_top_genes=2000        # Top highly variable genes
)

# Compute first and second order moments (means and variances).
# scv.pp.moments runs PCA + a kNN graph internally if they're absent, so
# you do NOT need a separate sc.pp.neighbors call here. Calling moments with
# n_pcs/n_neighbors and ALSO running sc.pp.neighbors first just recomputes the
# graph with possibly mismatched params — let moments own it on a fresh object.
scv.pp.moments(
    adata,
    n_pcs=30,
    n_neighbors=30
)
```

### 3. 速度估计——随机模型

随机模型速度快，适合用于探索性分析：

```python
# Stochastic velocity (faster, less accurate)
scv.tl.velocity(adata, mode='stochastic')
scv.tl.velocity_graph(adata)

# Visualize
scv.pl.velocity_embedding_stream(
    adata,
    basis='umap',
    color='leiden',
    title="RNA Velocity (Stochastic)"
)
```

### 4. 速度估计——动力学模型（推荐）

动力学模型拟合完整的剪接动力学，因此更加准确：

```python
# Recover dynamics (computationally intensive; ~10-30 min for 10K cells)
scv.tl.recover_dynamics(adata, n_jobs=4)

# Compute velocity from dynamical model
scv.tl.velocity(adata, mode='dynamical')
scv.tl.velocity_graph(adata)
```

### 5. 潜在时间

动力学模型支持计算共享的潜在时间（伪时间）：

```python
# Compute latent time
scv.tl.latent_time(adata)

# Visualize latent time on UMAP
scv.pl.scatter(
    adata,
    color='latent_time',
    color_map='gnuplot',
    size=80,
    title='Latent time'
)

# Identify top genes ordered by latent time
top_genes = adata.var['fit_likelihood'].sort_values(ascending=False).index[:300]
scv.pl.heatmap(
    adata,
    var_names=top_genes,
    sortby='latent_time',
    col_color='leiden',
    n_convolve=100
)
```

### 6. 驱动基因分析

```python
# Identify genes with highest velocity fit
scv.tl.rank_velocity_genes(adata, groupby='leiden', min_corr=0.3)
df = scv.DataFrame(adata.uns['rank_velocity_genes']['names'])
print(df.head(10))

# Speed and coherence
scv.tl.velocity_confidence(adata)
scv.pl.scatter(
    adata,
    c=['velocity_length', 'velocity_confidence'],
    cmap='coolwarm',
    perc=[5, 95]
)

# Phase portraits for specific genes
scv.pl.velocity(adata, ['Cpe', 'Gnao1', 'Ins2'],
               ncols=3, figsize=(16, 4))
```

### 7. 速度箭头与伪时间

```python
# Arrow plot on UMAP
scv.pl.velocity_embedding(
    adata,
    arrow_length=3,
    arrow_size=2,
    color='leiden',
    basis='umap'
)

# Stream plot (cleaner visualization)
scv.pl.velocity_embedding_stream(
    adata,
    basis='umap',
    color='leiden',
    smooth=0.8,
    min_mass=4
)

# Velocity pseudotime (alternative to latent time)
scv.tl.velocity_pseudotime(adata)
scv.pl.scatter(adata, color='velocity_pseudotime', cmap='gnuplot')
```

### 8. PAGA 轨迹图

```python
# PAGA graph with velocity-informed transitions
scv.tl.paga(adata, groups='leiden')
df = scv.get_df(adata, 'paga/transitions_confidence', precision=2).T
df.style.background_gradient(cmap='Blues').format('{:.2g}')

# Plot PAGA with velocity
scv.pl.paga(
    adata,
    basis='umap',
    size=50,
    alpha=0.1,
    min_edge_width=2,
    node_size_scale=1.5
)
```

## 完整工作流脚本

```python
import scvelo as scv
import scanpy as sc

def run_rna_velocity(adata, n_top_genes=2000, mode='dynamical', n_jobs=4):
    """
    Complete RNA velocity workflow.

    Args:
        adata: AnnData with 'spliced' and 'unspliced' layers, UMAP in obsm
        n_top_genes: Number of top HVGs for velocity
        mode: 'stochastic' (fast) or 'dynamical' (accurate)
        n_jobs: Parallel jobs for dynamical model

    Returns:
        Processed AnnData with velocity information
    """
    scv.settings.verbosity = 2

    # 1. Preprocessing
    scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=n_top_genes)

    if 'neighbors' not in adata.uns:
        sc.pp.neighbors(adata, n_neighbors=30)

    scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

    # 2. Velocity estimation
    if mode == 'dynamical':
        scv.tl.recover_dynamics(adata, n_jobs=n_jobs)

    scv.tl.velocity(adata, mode=mode)
    scv.tl.velocity_graph(adata)

    # 3. Downstream analyses
    if mode == 'dynamical':
        scv.tl.latent_time(adata)
        scv.tl.rank_velocity_genes(adata, groupby='leiden', min_corr=0.3)

    scv.tl.velocity_confidence(adata)
    scv.tl.velocity_pseudotime(adata)

    return adata
```

## AnnData 中的关键输出字段

运行工作流后，会添加以下字段：

| 位置 | 键 | 描述 |
|----------|-----|-------------|
| `adata.layers` | `velocity` | 每个细胞中每个基因的 RNA 速度 |
| `adata.layers` | `fit_t` | 每个细胞中每个基因的拟合潜在时间 |
| `adata.obsm` | `velocity_umap` | UMAP 上的二维速度向量 |
| `adata.obs` | `velocity_pseudotime` | 根据速度计算的伪时间 |
| `adata.obs` | `latent_time` | 动力学模型计算的潜在时间 |
| `adata.obs` | `velocity_length` | 每个细胞的速度大小 |
| `adata.obs` | `velocity_confidence` | 每个细胞的置信度得分 |
| `adata.var` | `fit_likelihood` | 基因层面的模型拟合质量 |
| `adata.var` | `fit_alpha` | 转录速率 |
| `adata.var` | `fit_beta` | 剪接速率 |
| `adata.var` | `fit_gamma` | 降解速率 |
| `adata.uns` | `velocity_graph` | 细胞间转移概率矩阵 |

## 速度模型比较

| 模型 | 速度 | 准确度 | 适用场景 |
|-------|-------|----------|-------------|
| `stochastic` | 快 | 中等 | 探索性分析；大型数据集 |
| `deterministic` | 中等 | 中等 | 简单的线性动力学 |
| `dynamical` | 慢 | 高 | 发表级分析；识别驱动基因 |

## 最佳实践

- **从随机模式开始**进行探索；最终分析时切换到动力学模式
- **需要对未剪接读段有良好的覆盖**：短读段（< 100 bp）可能无法覆盖内含子
- **至少 2,000 个细胞**：细胞数量较少时，RNA 速度的噪声较大
- **速度应具有一致性**：箭头应符合已知的生物学规律；随机分布表明可能存在问题
- **k-NN 带宽很重要**：邻居过少 → 速度噪声大；邻居过多 → 过度平滑
- **合理性检查**：根细胞（祖细胞）的标记基因应具有较高的未剪接/已剪接比例
- **动力学模型需要不同的动力学状态**：最适合具有明确分化过程的数据

## 故障排除

| 问题 | 解决方案 |
|---------|---------|
| 缺少未剪接层 | 重新运行 velocyto，或使用带有 `--soloFeatures Gene Velocyto` 的 STARsolo |
| 速度基因非常少 | 降低 `min_shared_counts`；检查测序深度 |
| 箭头看起来随机 | 尝试不同的 `n_neighbors` 或速度模型 |
| 使用动力学模型时出现内存错误 | 设置 `n_jobs=1`；减小 `n_top_genes` |
| 所有位置的速度均为负值 | 检查已剪接层和未剪接层是否互换 |

## 其他资源

- **scVelo 文档**：https://scvelo.readthedocs.io/
- **教程笔记本**：https://scvelo.readthedocs.io/en/stable/VelocityBasics.html
- **GitHub**：https://github.com/theislab/scvelo
- **论文**：Bergen V et al. (2020) Nature Biotechnology. PMID: 32747759
- **velocyto**（预处理）：http://velocyto.org/
- **CellRank**（命运预测，扩展 scVelo）：https://cellrank.readthedocs.io/
- **dynamo**（代谢标记替代方案）：https://dynamo-release.readthedocs.io/