---
name: cellxgene-census
description: Query the CZ CELLxGENE Census programmatically for versioned public single-cell and spatial transcriptomics data. Use when you need population-scale cell metadata, gene expression slices, Census summary counts, source H5AD URIs/downloads, embeddings, spatial Census data, or reference atlas comparisons across organisms, tissues, diseases, assays, and cell types. For analyzing your own local single-cell data use scanpy, anndata, or scvi-tools.
allowed-tools: Read Write Edit Bash
license: MIT
compatibility: Requires Python >=3.10,<3.13. Examples target cellxgene-census 1.17.x and the 2025-11-08 stable LTS Census; spatial workflows need the spatial extra and TileDB-SOMA >=1.15.5. No authentication is required for public Census data.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# CZ CELLxGENE Census

## 概述

CZ CELLxGENE Census 提供了对 CZ CELLxGENE Discover 中标准化单细胞和空间转录组学数据的全面、有版本管理的集合进行程序化访问的能力。此 skill 支持高效查询和分析公开的 Census 版本，而无需先下载完整数据集。

Census 包括：
- **超过 2.17 亿个细胞**，以及 **超过 1.25 亿个唯一细胞**，对应 2025-11-08 稳定 LTS 版本
- **1,845 个数据集**，对应 2025-11-08 稳定 LTS 版本
- 当前 schema 中包含 **人、小鼠、绒猴、恒河猴和黑猩猩** 数据
- **标准化元数据**（细胞类型、组织、疾病、供体）
- **原始基因表达**矩阵，以及源 H5AD 查找/下载辅助工具
- **预先计算的汇总计数、嵌入和空间数据**
- 与 AnnData、Scanpy、TileDB-SOMA、TileDB-SOMA-ML 及其他分析工具的**集成**

## 何时使用此 Skill

在以下情况下应使用此 skill：
- 按细胞类型、组织或疾病查询单细胞表达数据
- 探索可用的单细胞数据集和元数据
- 在单细胞数据上训练机器学习模型
- 执行大规模跨数据集分析
- 将 Census 数据与 scanpy 或其他分析框架集成
- 计算数百万个细胞的统计信息
- 访问预先计算的嵌入或模型预测结果

## 安装和设置

安装 Census API：
```bash
uv pip install "cellxgene-census==1.17.*"
```

对于空间工作流：
```bash
uv pip install "cellxgene-census[spatial]==1.17.*" "spatialdata[extra]>=0.2.5"
```

对于使用 PyTorch 训练模型，请使用 TileDB-SOMA-ML。旧的 `cellxgene_census.experimental.ml` 加载器已弃用：

```bash
uv pip install "cellxgene-census==1.17.*" tiledbsoma-ml
```

## 核心工作流模式

[references/core_workflow_patterns.md](references/core_workflow_patterns.md) 中提供了八种模式及其代码：

1. **打开 Census** — 始终固定 `census_version`，使分析保持可复现。
2. **探索 Census 信息** — 可用数据集、细胞计数和汇总表。
3. **查询表达数据** — 以 `AnnData` 的形式处理小到中等规模的数据。
4. **大规模查询** — 当数据切片无法放入内存时，执行内存外处理。
5. **使用 PyTorch 进行机器学习** — Census 数据加载器。
6. **空间 Census 数据** — 访问空间检测数据。
7. **与 Scanpy 集成** — 将 Census 数据切片交给标准 Scanpy 工作流。
8. **多数据集集成** — 合并数据集并处理批次效应。

## 核心概念和最佳实践

### 始终筛选主数据
除非是在分析重复数据，否则始终在查询中包含 `is_primary_data == True`，以避免重复计算细胞：
```python
obs_value_filter="cell_type == 'B cell' and is_primary_data == True"
```

### 指定 Census 版本以确保可复现性
在生产分析中始终指定 Census 版本：
```python
census = cellxgene_census.open_soma(census_version="2025-11-08")
```

### 加载前估算查询规模
对于大型查询，首先检查细胞数量，以避免内存问题：
```python
# Get cell count
metadata = cellxgene_census.get_obs(
    census, "homo_sapiens",
    value_filter="tissue_general == 'brain' and is_primary_data == True",
    column_names=["soma_joinid"]
)
n_cells = len(metadata)
print(f"Query will return {n_cells:,} cells")

# If too large (>100k), use out-of-core processing
```

### 使用 tissue_general 进行更宽泛的分组
`tissue_general` 字段提供了比 `tissue` 更粗粒度的类别，适用于跨组织分析：
```python
# Broader grouping
obs_value_filter="tissue_general == 'immune system'"

# Specific tissue
obs_value_filter="tissue == 'peripheral blood mononuclear cell'"
```

### 仅选择所需列
通过仅指定所需的元数据列来最大限度地减少数据传输：
```python
obs_column_names=["cell_type", "tissue_general", "disease"]  # Not all columns
```

### 检查基因特异性查询中的数据集存在情况
分析特定基因时，验证哪些数据集测量了这些基因：
```python
presence = cellxgene_census.get_presence_matrix(
    census,
    "homo_sapiens",
    var_value_filter="feature_name in ['CD4', 'CD8A']"
)
```

### 两步工作流：先探索，再查询
首先探索元数据以了解可用数据，然后查询表达量：
```python
# Step 1: Explore what's available
metadata = cellxgene_census.get_obs(
    census, "homo_sapiens",
    value_filter="disease == 'COVID-19' and is_primary_data == True",
    column_names=["cell_type", "tissue_general"]
)
print(metadata.value_counts())

# Step 2: Query based on findings
adata = cellxgene_census.get_anndata(
    census=census,
    organism="Homo sapiens",
    obs_value_filter="disease == 'COVID-19' and cell_type == 'T cell' and is_primary_data == True",
)
```

## 可用的元数据字段

### 细胞元数据（obs）
用于筛选的关键字段：
- `cell_type`、`cell_type_ontology_term_id`
- `tissue`、`tissue_general`、`tissue_ontology_term_id`
- `disease`、`disease_ontology_term_id`
- `assay`、`assay_ontology_term_id`
- `donor_id`、`sex`、`self_reported_ethnicity`
- `development_stage`、`development_stage_ontology_term_id`
- `dataset_id`
- `is_primary_data`（布尔值：True = 唯一细胞）

当前架构包含人类和小鼠之外的生物体集合。使用 `list(census["census_data"].keys())` 确认所选版本中可用的生物体。

### 基因元数据（var）
- `feature_id`（Ensembl 基因 ID，例如 `"ENSG00000161798"`）
- `feature_name`（基因符号，例如 `"FOXP2"`）
- `feature_type`
- `feature_length`（基因长度，单位为碱基对）
- `nnz`、`n_measured_obs`（可用性汇总信息，可用于检查稀疏性和覆盖范围）

## 参考文档

此 skill 包含详细的参考文档：

### references/census_schema.md
全面介绍以下内容：
- Census 数据结构和组织方式
- 所有可用的元数据字段
- 值筛选语法和运算符
- SOMA 对象类型
- 数据纳入标准

**阅读时机：** 当你需要详细的 schema 信息、完整的元数据字段列表或复杂的筛选语法时。

### references/common_patterns.md
以下主题的示例和模式：
- 探索性查询（仅元数据）
- 中小型查询（AnnData）
- 大型查询（内存外处理）
- PyTorch 集成
- Spatial Census 访问模式
- Scanpy 集成工作流
- 多数据集集成
- 最佳实践和常见陷阱

**阅读时机：** 当你实现特定的查询模式、查找代码示例或排查常见问题时。

## 常见用例

### 用例 1：探索组织中的细胞类型
```python
with cellxgene_census.open_soma() as census:
    cells = cellxgene_census.get_obs(
        census, "homo_sapiens",
        value_filter="tissue_general == 'lung' and is_primary_data == True",
        column_names=["cell_type"]
    )
    print(cells["cell_type"].value_counts())
```

### 用例 2：查询标志基因表达
```python
with cellxgene_census.open_soma() as census:
    adata = cellxgene_census.get_anndata(
        census=census,
        organism="Homo sapiens",
        var_value_filter="feature_name in ['CD4', 'CD8A', 'CD19']",
        obs_value_filter="cell_type in ['T cell', 'B cell'] and is_primary_data == True",
    )
```

### 用例 3：训练细胞类型分类器
```python
import tiledbsoma as soma
from tiledbsoma_ml import ExperimentDataset, experiment_dataloader

with cellxgene_census.open_soma() as census:
    experiment = census["census_data"]["homo_sapiens"]
    with experiment.axis_query(
        measurement_name="RNA",
        obs_query=soma.AxisQuery(value_filter="is_primary_data == True"),
    ) as query:
        dataset = ExperimentDataset(
            query=query,
            layer_name="raw",
            obs_column_names=["cell_type"],
            batch_size=128,
            shuffle=True,
        )
        dataloader = experiment_dataloader(dataset)

        for X, obs in dataloader:
            labels = obs["cell_type"]
            # Training logic
            pass
```

### 用例 4：跨组织分析
```python
with cellxgene_census.open_soma() as census:
    adata = cellxgene_census.get_anndata(
        census=census,
        organism="Homo sapiens",
        obs_value_filter="cell_type == 'macrophage' and tissue_general in ['lung', 'liver', 'brain'] and is_primary_data == True",
    )

    # Analyze macrophage differences across tissues
    sc.tl.rank_genes_groups(adata, groupby="tissue_general")
```

## 故障排除

### 查询返回的细胞过多
- 添加更具体的筛选条件以缩小范围
- 使用 `tissue` 代替 `tissue_general` 以实现更细粒度的筛选
- 如果已知具体的 `dataset_id`，则按其进行筛选
- 对于大型查询，切换到内存外处理

### 内存错误
- 使用更严格的筛选条件缩小查询范围
- 使用 `var_value_filter` 选择更少的基因
- 使用 `axis_query()` 进行内存外处理
- 分批处理数据

### 结果中存在重复细胞
- 始终在筛选条件中包含 `is_primary_data == True`
- 检查是否确实需要跨多个数据集进行查询

### 未找到基因
- 验证基因名称拼写（区分大小写）
- 使用 Ensembl ID，并使用 `feature_id` 而非 `feature_name`
- 检查数据集存在性矩阵，确认是否测量了该基因
- 某些基因可能在 Census 构建期间被过滤

### 版本不一致
- 始终显式指定 `census_version`
- 在所有分析中使用相同版本
- 查看发行说明，了解特定版本的变更