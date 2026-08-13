---
name: alterlab-cellxgene
description: Query the CZ CELLxGENE Census (61M+ cells) programmatically via cellxgene-census and TileDB-SOMA, slicing expression by tissue, disease, or cell type and returning AnnData. Use when pulling reference single-cell RNA-seq data from the largest curated public atlas, running population-scale queries, or benchmarking your data against a reference — for analyzing your own dataset use scanpy or scvi-tools. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# CZ CELLxGENE Census

## 概述

CZ CELLxGENE Census 提供对 CZ CELLxGENE Discover 中标准化单细胞基因组学数据的程序化、版本化访问。它包含 **6100 多万个细胞**（人类和小鼠），以及标准化元数据（细胞类型、组织、疾病、供体）、原始基因表达矩阵、预计算嵌入，并可与 PyTorch、scanpy 和其他分析工具集成。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 按细胞类型、组织或疾病查询单细胞表达数据
- 探索可用的单细胞数据集和元数据
- 使用单细胞数据训练机器学习模型
- 执行大规模跨数据集分析
- 将 Census 数据与 scanpy 或其他分析框架集成
- 对数百万个细胞计算统计数据
- 访问预计算嵌入或模型预测结果

如果要分析**您自己的**数据集（而非参考图谱），请改用 scanpy 或 scvi-tools。

## 安装

```bash
uv pip install cellxgene-census
# For PyTorch ML workflows (loaders moved out of cellxgene-census):
uv pip install tiledbsoma-ml
```

## 核心工作流

1. **打开 Census**：使用上下文管理器；固定 `census_version` 以确保可复现性。
2. **首先探索元数据**（`get_obs` / 数据集摘要）以了解可用内容——始终使用 `is_primary_data == True` 进行筛选，以避免重复细胞。
3. **估算查询大小**，然后再加载表达数据。少于 10 万个细胞 → 使用 `get_anndata()`（内存中）；规模更大 → 使用 `axis_query()` 进行核外迭代。
4. **查询表达数据**：使用 `obs_value_filter`（细胞）和 `var_value_filter`（基因）；仅选择所需的 `obs_column_names`。
5. **下游处理**：将返回的 AnnData 交给 scanpy，或将批次流式传入 PyTorch 数据加载器以进行机器学习。

最小框架：
```python
import cellxgene_census

with cellxgene_census.open_soma(census_version="2023-07-25") as census:
    adata = cellxgene_census.get_anndata(
        census=census,
        organism="Homo sapiens",
        obs_value_filter="cell_type == 'B cell' and tissue_general == 'lung' and is_primary_data == True",
    )
```

## 路由指南

- **小型/中型查询（可装入内存）** → `get_anndata()`。请参阅 `references/querying_expression.md`。
- **查询规模超出内存容量** → 使用 `axis_query()` 进行分块迭代和增量统计。请参阅 `references/querying_expression.md`。
- **训练机器学习模型** → 使用 `tiledbsoma_ml` PyTorch 数据加载器 / `ExperimentDataset`。请参阅 `references/ml_and_scanpy.md`。
- **标准 scanpy 分析 / 多组织整合** → 请参阅 `references/ml_and_scanpy.md`。
- **需要完整架构、所有元数据字段或筛选语法详细信息** → `references/census_schema.md`。

## 参考索引

- **`references/querying_expression.md`** — 打开 Census、探索元数据、使用 `get_anndata()` 执行小型/中型查询，以及使用 `axis_query()` 和增量统计执行大型核外处理。
- **`references/ml_and_scanpy.md`** — `tiledbsoma_ml` PyTorch 数据加载器 / `ExperimentDataset` 训练测试拆分、scanpy 集成、多数据集/组织整合（`anndata.concat`），以及四个完整用例。
- **`references/best_practices_and_troubleshooting.md`** — 主数据筛选、版本固定、查询大小估算、`tissue_general` 与 `tissue` 的区别、存在矩阵、完整的 obs/var 元数据字段列表，以及故障排除指南。
- **`references/census_schema.md`** — Census 数据结构、所有元数据字段、值筛选语法/运算符、SOMA 对象类型，以及数据纳入标准。
- **`references/common_patterns.md`** — 核心方法之外的额外内容：增量（Welford）核外方差计算、本体术语筛选、批处理扫描，以及常见陷阱列表。