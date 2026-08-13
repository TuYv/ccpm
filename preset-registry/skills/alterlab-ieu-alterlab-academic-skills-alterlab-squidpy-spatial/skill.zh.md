---
name: alterlab-squidpy-spatial
description: "Analyzes spatial transcriptomics with squidpy (1.8.x) on AnnData and SpatialData objects, routing platforms correctly: Visium spots use spatial_neighbors(coord_type='grid') and pair with deconvolution, while Xenium/MERFISH single-cell data use coord_type='generic'/Delaunay neighbors and spatialdata-io readers (xenium, visium_hd, merscope). Runs sq.gr.spatial_neighbors, nhood_enrichment, co_occurrence, spatial_autocorr (Moran's I for spatially variable genes), ripley, and ligrec. Use when the user wants spatial transcriptomics, squidpy, Visium/Xenium/MERFISH analysis, neighborhood enrichment, co-occurrence, or spatially variable genes; QC/clustering uses alterlab-scanpy and spot deconvolution (destVI/Tangram) uses alterlab-scvi-tools. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with squidpy (1.8.x, needs spatialdata>=0.7.1, scanpy>=1.9.3, anndata>=0.9, Python>=3.11) installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Squidpy：空间转录组学

Squidpy 是用于空间分辨组学的 scverse 工具包，构建于 AnnData 和
SpatialData 之上。它能够回答非空间 scRNA-seq 流程无法回答的问题：*哪些
细胞类型彼此相邻*（邻域富集）、*细胞类型对如何随距离共同出现*
（共现）、*哪些基因在组织空间中发生变化*（Moran's I / 空间变异基因），
以及*哪些配体-受体信号传导具有合理性*（ligrec）。此技能负责空间分析；
非空间 QC/聚类交由 `alterlab-scanpy`，斑点解卷积交由
`alterlab-scvi-tools`。

## 何时使用此技能

当请求涉及以下内容时使用：
- 对 **Visium、Visium HD、Xenium、MERFISH/MERSCOPE 或 CosMx** 数据进行
  空间转录组学 / 空间分辨组学分析。
- 构建**空间邻居图**并运行**邻域富集**、**共现**、**相互作用矩阵**、
  **Ripley 统计量**或**中心性得分**。
- 通过 Moran's I（`spatial_autocorr`）或 Sepal 寻找**空间变异基因**。
- 空间背景下的**配体-受体**分析（`ligrec`）。
- 将平台输出读取到 AnnData/SpatialData 中，并为相应平台选择正确的
  `coord_type`。

### 不会触发的情况

| 请求 | 转至 |
|---------|----------|
| 非空间 scRNA-seq QC、归一化、PCA/UMAP、Leiden 聚类、标记基因 | `alterlab-scanpy` |
| 斑点**解卷积** / 将细胞类型映射到 Visium 斑点（destVI、Tangram）、概率批次校正/整合 | `alterlab-scvi-tools`（参见其 `references/models-spatial.md`） |
| 构建/切片/拼接 `.h5ad` AnnData 对象、处理 layer 和 obsm（不进行空间分析） | `alterlab-anndata` |
| RNA 速度 / 轨迹动力学 | `alterlab-scvelo` |
| 从计数矩阵进行 Bulk RNA-seq **差异表达**分析 | `alterlab-pydeseq2` |
| 原始 FASTQ → 表达矩阵（读段比对/定量） | `alterlab-rnaseq-quant` |
| 对特征表进行多样性 / 生态学统计 | `alterlab-scikit-bio` |

如果用户需要*完整*流程（“对我的 Xenium 数据进行聚类，然后找出哪些
细胞类型彼此相邻”），请先在 `alterlab-scanpy` 下运行 scanpy 聚类步骤，
然后返回此处进行空间图构建和富集分析。

## 唯一关键的决策：平台 → coord_type

Squidpy 的空间图取决于测量几何结构。错误设置 `coord_type`
会在不发出警告的情况下生成毫无意义的图。（以下所有参数行为均来自
squidpy 1.8 的 `sq.gr.spatial_neighbors` API。）

| 平台 | 分辨率 | 构建方式 | 搭配使用 |
|----------|-----------|---------|-----------|
| **Visium** | 斑点（多细胞、六边形网格） | `coord_type="grid"`, `n_neighs=6`, `n_rings=1..2` | 解卷积 → `alterlab-scvi-tools` |
| **Visium HD** | 2/8/16 µm 分箱（方形网格） | `coord_type="grid"`（方形晶格） | 预先选择分箱方式 |
| **Xenium / MERFISH / CosMx** | 单细胞 | `coord_type="generic"`, `delaunay=True`（或 `n_neighs=k`） | 直接进行细胞类型分析 |

- `coord_type=None` 仅当 `adata.uns` 中存在 `spatial` 且
  `n_neighs=6`（Visium 特征）时，才会自动选择 `"grid"`；否则会回退到 `"generic"`。**请显式设置
  `coord_type`**，而不要依赖自动检测。
- `delaunay=True` 仅在 `coord_type="generic"` 时使用；它基于
  Delaunay 三角剖分而不是 k 近邻空间点来构建图。`n_rings` 仅用于
  `coord_type="grid"`。

## 加载数据（根据平台选择读取器）

```python
import squidpy as sq
import scanpy as sc

# Visium (legacy spot data) — squidpy's own reader, returns AnnData
adata = sq.read.visium("path/to/visium_outs/")

# Vizgen MERSCOPE / Nanostring CosMx via squidpy readers
adata = sq.read.vizgen("path/to/merscope/", counts_file="cell_by_gene.csv",
                       meta_file="cell_metadata.csv")
adata = sq.read.nanostring("path/to/cosmx/", counts_file="exprMat_file.csv",
                           meta_file="metadata_file.csv", fov_file="fov_positions.csv")
```

对于 **Xenium 和 Visium HD**，请使用 **`spatialdata-io`** 读取器（squidpy 没有
`sq.read.xenium`），并在 `SpatialData` 对象上操作：

```python
from spatialdata_io import xenium, visium_hd, merscope
sdata = xenium("path/to/xenium_outs/")        # 10x Xenium
sdata = visium_hd("path/to/visium_hd_outs/")  # 10x Visium HD
sdata = merscope("path/to/merscope/")         # Vizgen MERSCOPE
```

`spatialdata-io` 读取器名称已根据 spatialdata-io 稳定版 API 进行核验。
Squidpy 1.8 可直接接受 SpatialData 对象；有关 SpatialData ↔ AnnData（表）流程，请参阅
`references/spatialdata_io.md`。

## 标准空间分析工作流

质控、归一化、HVG、PCA、邻居图、Leiden 和 `sc.tl.umap` 都是 **scanpy**
步骤——请通过 `alterlab-scanpy` 运行。获得聚类/细胞类型标签后，
在此处执行空间分析部分。

```python
import squidpy as sq

# 1. Build the spatial neighbor graph (choose coord_type per the table above)
sq.gr.spatial_neighbors(adata, coord_type="generic", delaunay=True)   # Xenium/MERFISH
# sq.gr.spatial_neighbors(adata, coord_type="grid", n_neighs=6)       # Visium

# 2. Neighborhood enrichment: which cluster pairs are spatially adjacent?
sq.gr.nhood_enrichment(adata, cluster_key="leiden")
sq.pl.nhood_enrichment(adata, cluster_key="leiden")

# 3. Co-occurrence across distance
sq.gr.co_occurrence(adata, cluster_key="leiden")
sq.pl.co_occurrence(adata, cluster_key="leiden", clusters="0")

# 4. Spatially variable genes via Moran's I
sq.gr.spatial_autocorr(adata, mode="moran")
svgs = adata.uns["moranI"].head(20)   # ranked by Moran's I

# 5. Ligand-receptor interaction (Omnipath-backed)
sq.gr.ligrec(adata, cluster_key="leiden")
```

其他图统计方法包括：`sq.gr.interaction_matrix`、`sq.gr.centrality_scores`、
`sq.gr.ripley`（相对于 CSR 的聚集/离散）以及 `sq.gr.sepal`（另一种
空间变异基因检验）。使用 `sq.pl.spatial_scatter`
（空间点/点）或 `sq.pl.spatial_segment`（分割后的细胞）可视化组织。对于
H&E/IF 图像特征，`sq.im` 模块（`process`、`segment`、`calculate_image_features`）
在 `ImageContainer` 上运行。

**辅助脚本** — 通过一次调用构建图并运行核心统计分析：

```bash
uv run python skills/bioinformatics/alterlab-squidpy-spatial/scripts/spatial_neighborhood.py \
    clustered.h5ad --platform xenium --cluster-key leiden --out spatial_report.json
```

请参阅 `scripts/spatial_neighborhood.py --help`。它根据
`--platform` 选择 `coord_type`，运行 `spatial_neighbors`、`nhood_enrichment`、`co_occurrence` 和
`spatial_autocorr`，并写入一份 JSON 摘要（空间变异最显著的基因 + 
富集 z 分数矩阵）以及更新后的 `.h5ad`。

## 深入参考资料

- `references/platform_routing.md` — 完整的平台→`coord_type` 决策表、
  `n_neighs`/`n_rings`/`delaunay` 参数语义，以及各平台的注意事项。
- `references/analysis_recipes.md` — 每个 `sq.gr` / `sq.pl`
  函数的可直接复制粘贴方案，包括关键参数以及如何解读输出。
- `references/spatialdata_io.md` — 将 Xenium / Visium HD / MERSCOPE 读入
  SpatialData，并获取 squidpy 操作的 AnnData `table`。

## 报告前自检

- 是否已将 `coord_type` 设置为与平台匹配（Visium 使用网格，单细胞使用
  通用坐标）？错误的图会使所有下游统计结果失效。
- 聚类/QC 是否在 `alterlab-scanpy` 下运行（此技能假定标签已存在）？
- 对于 Visium spot 数据，是否已明确指出：在进行细胞类型层面的推断之前，需要执行
  **去卷积**（`alterlab-scvi-tools`）——spot 包含多个细胞？
- 报告 `nhood_enrichment` z 分数时，是否包含置换检验的上下文，而不是将其作为原始
  计数？

AlterLab Academic Skills 套件的一部分。