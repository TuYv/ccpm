---
name: alterlab-scvi-tools
description: Train deep generative models for single-cell omics with scvi-tools — probabilistic batch correction and integration (scVI), reference-mapping transfer learning (scArches), differential expression with uncertainty, and multimodal models (totalVI for CITE-seq, MultiVI for multiome). Use when correcting batch effects, integrating multimodal data, or doing advanced probabilistic single-cell modeling — for standard analysis pipelines use scanpy. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# scvi-tools

## 概述

scvi-tools 是一个用于单细胞基因组学概率模型的综合性 Python 框架。它基于 PyTorch 和 PyTorch Lightning 构建，提供使用变分推断的深度生成模型，用于分析多种单细胞数据模态。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 分析单细胞 RNA-seq 数据（降维、批次校正、整合）
- 处理单细胞 ATAC-seq 或染色质可及性数据
- 整合多模态数据（CITE-seq、multiome、配对/非配对数据集）
- 分析空间转录组数据（反卷积、空间映射）
- 对单细胞数据执行差异表达分析
- 执行细胞类型注释或迁移学习任务
- 处理特定的单细胞模态（甲基化、细胞术、RNA 速率）
- 为单细胞分析构建自定义概率模型

## 核心能力

scvi-tools 提供按数据模态组织的模型：

### 1. 单细胞 RNA-seq 分析
用于表达分析、批次校正和整合的核心模型。详见 `references/models-scrna-seq.md`：
- **scVI**：无监督降维和批次校正
- **scANVI**：半监督细胞类型注释和整合
- **AUTOZI**：零膨胀检测和建模
- **VeloVI**：RNA 速率分析
- **contrastiveVI**：扰动效应分离

### 2. 染色质可及性（ATAC-seq）
用于分析单细胞染色质数据的模型。详见 `references/models-atac-seq.md`：
- **PeakVI**：基于峰的 ATAC-seq 分析和整合
- **PoissonVI**：定量片段计数建模
- **scBasset**：结合基序分析的深度学习方法

### 3. 多模态与多组学整合
对多种数据类型进行联合分析。详见 `references/models-multimodal.md`：
- **totalVI**：CITE-seq 蛋白质与 RNA 联合建模
- **MultiVI**：配对和非配对多组学整合
- **MrVI**：多分辨率跨样本分析

### 4. 空间转录组学
空间分辨转录组分析。详见 `references/models-spatial.md`：
- **DestVI**：多分辨率空间反卷积
- **Stereoscope**：细胞类型反卷积
- **Tangram**：空间映射和整合
- **scVIVA**：细胞与环境关系分析

### 5. 特殊模态
其他专门的分析工具。详见 `references/models-specialized.md`：
- **MethylVI/MethylANVI**：单细胞甲基化分析
- **CytoVI**：流式/质谱细胞术批次校正
- **Solo**：双细胞检测
- **CellAssign**：基于标记物的细胞类型注释

## 典型工作流

所有 scvi-tools 模型都遵循一致的 API 模式：

```python
# 1. Load and preprocess data (AnnData format)
import scvi
import scanpy as sc

adata = scvi.data.heart_cell_atlas_subsampled()
sc.pp.filter_genes(adata, min_counts=3)
sc.pp.highly_variable_genes(adata, n_top_genes=1200)

# 2. Register data with model (specify layers, covariates)
scvi.model.SCVI.setup_anndata(
    adata,
    layer="counts",  # Use raw counts, not log-normalized
    batch_key="batch",
    categorical_covariate_keys=["donor"],
    continuous_covariate_keys=["percent_mito"]
)

# 3. Create and train model
model = scvi.model.SCVI(adata)
model.train()

# 4. Extract latent representations and normalized values
latent = model.get_latent_representation()
normalized = model.get_normalized_expression(library_size=1e4)

# 5. Store in AnnData for downstream analysis
adata.obsm["X_scVI"] = latent
adata.layers["scvi_normalized"] = normalized

# 6. Downstream analysis with scanpy
sc.pp.neighbors(adata, use_rep="X_scVI")
sc.tl.umap(adata)
sc.tl.leiden(adata)
```

**核心设计原则：**
- **需要原始计数**：模型需要未经归一化的计数数据才能实现最佳性能
- **统一 API**：所有模型均采用一致的接口（设置 → 训练 → 提取）
- **以 AnnData 为中心**：与 scanpy 生态系统无缝集成
- **GPU 加速**：自动利用可用的 GPU
- **批次校正**：通过注册协变量来处理技术变异

## 常见分析任务

### 差异表达
使用学习到的生成模型进行概率差异表达分析：

```python
de_results = model.differential_expression(
    groupby="cell_type",
    group1="TypeA",
    group2="TypeB",
    mode="change",  # composite hypothesis testing with an effect-size threshold
    delta=0.25,     # minimum |LFC| to count as a real change
)

# Significance lives in proba_de (posterior prob. of DE), NOT a p-value.
# In "change" mode this is the posterior prob. that |LFC| > delta.
sig = de_results[de_results["proba_de"] > 0.95]
```

有关完整的输出模式和解读，请参阅 `references/differential-expression.md`。

### 模型持久化
保存和加载已训练的模型：

```python
# Save model
model.save("./model_directory", overwrite=True)

# Load model
model = scvi.model.SCVI.load("./model_directory", adata=adata)
```

### 批次校正与整合
跨批次或研究整合数据集：

```python
# Register batch information
scvi.model.SCVI.setup_anndata(adata, batch_key="study")

# Model automatically learns batch-corrected representations
model = scvi.model.SCVI(adata)
model.train()
latent = model.get_latent_representation()  # Batch-corrected
```

## 理论基础

scvi-tools 建立在以下基础之上：
- **变分推断**：通过近似后验分布实现可扩展的贝叶斯推断
- **深度生成模型**：学习复杂数据分布的 VAE 架构
- **摊销推断**：使用共享神经网络实现跨细胞的高效学习
- **概率建模**：以规范的方法进行不确定性量化和统计检验

有关数学框架的详细背景，请参阅 `references/theoretical-foundations.md`。

## 其他资源

- **工作流**：`references/workflows.md` 包含常见工作流、最佳实践、超参数调优和 GPU 优化
- **模型参考文档**：`references/` 目录中提供了每个模型类别的详细文档
- **官方文档**：https://docs.scvi-tools.org/en/stable/
- **教程**：https://docs.scvi-tools.org/en/stable/tutorials/index.html
- **API 参考文档**：https://docs.scvi-tools.org/en/stable/api/index.html

## 安装

```bash
uv pip install scvi-tools
# For GPU support
uv pip install scvi-tools[cuda]
```

## 最佳实践

1. **使用原始计数**：始终向模型提供未经归一化的计数数据
2. **过滤基因**：在分析前移除低计数基因（例如 `min_counts=3`）
3. **注册协变量**：在 `setup_anndata` 中包含已知的技术因素（批次、供体等）
4. **特征选择**：使用高变基因以提高性能
5. **保存模型**：始终保存已训练的模型，以避免重新训练
6. **使用 GPU**：为大型数据集启用 GPU 加速（`accelerator="gpu"`）
7. **Scanpy 集成**：将输出存储在 AnnData 对象中，以供下游分析

