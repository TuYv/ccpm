---
name: alterlab-scgpt
description: Apply the scGPT single-cell foundation model (Cui 2024) to annotate and embed cells — zero-shot and fine-tuned cell-type annotation, gene/cell embeddings, batch integration, and gene-regulatory / perturbation inference from AnnData. Use when annotating cell types with a pretrained foundation model, generating scGPT embeddings, integrating batches with a transformer, or running zero-shot single-cell inference on an h5ad. For probabilistic latent models (scVI/scANVI) prefer alterlab-scvi-tools; for the standard QC→cluster→UMAP→DE pipeline prefer alterlab-scanpy; for the AnnData data structure itself prefer alterlab-anndata; for protein language models prefer alterlab-esm. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs the scGPT model (`bowang-lab/scGPT`; install `scgpt` — TODO(verify) exact pin) under `uv run python`. Pretrained checkpoints download once and cache (GB-scale); a CUDA GPU is strongly recommended (CPU is impractical for large datasets). Input/output is AnnData (`.h5ad`) in the scverse ecosystem. Dispatch heavy fine-tuning via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# scGPT（单细胞基础模型）

## 概述

**scGPT**（Cui 等，*Nature Methods* 2024；`bowang-lab/scGPT`）是一种在数千万个细胞上预训练的 transformer **基础
模型**。它提供**零样本**及微调后的**细胞类型注释**、**基因和细胞嵌入**、**批次整合**以及
基因调控／扰动推断——所有操作均基于 **AnnData**（`.h5ad`）对象。

与现有单细胞技能相比，它的独特定位是：scGPT 采用*预训练 transformer* 路线。
如需概率潜变量模型，请使用 `alterlab-scvi-tools`；如需传统的
Scanpy 分析流水线，请使用 `alterlab-scanpy`；scGPT 可与二者形成互补。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- 使用预训练基础模型（零样本或微调）**注释细胞类型**。
- 为细胞或基因生成 **scGPT 嵌入**。
- 使用 transformer 的表示进行**批次整合**。
- 在不从头训练的情况下，对新数据集运行**零样本**推断／迁移。

### 不触发此技能的情况

| 场景 | 改用 |
|----------|-------------|
| 概率整合／潜变量模型（scVI、scANVI） | `alterlab-scvi-tools` |
| 标准 QC → 聚类 → UMAP → 差异表达 | `alterlab-scanpy` |
| 读取／写入／整理 `.h5ad` 数据结构本身 | `alterlab-anndata` |
| RNA 速率 | `alterlab-scvelo` |
| 蛋白质（非单细胞）语言模型 | `alterlab-esm` |

## 核心能力

### 1. 零样本细胞嵌入与注释

```python
# bowang-lab/scGPT — API sketch; TODO(verify) against installed scgpt
import scanpy as sc
adata = sc.read_h5ad("cells.h5ad")
# Load a pretrained scGPT checkpoint, embed cells, map to reference cell types.
# (see references/scgpt_usage.md for the exact embed/annotate calls)
```

零样本模式无需训练，即可将新数据集映射到 scGPT 学到的空间中，从而快速初步判定
细胞身份。在带标签的参考数据上进行微调，可提高特定
组织中的准确率。

### 2. 用于下游分析的嵌入

生成细胞嵌入（用于聚类／可视化）或基因嵌入（用于
基因网络／相似性分析）。将嵌入送回 Scanpy 的邻居图／UMAP 工作流。

### 3. 批次整合

使用模型表示整合不同批次／供体；其作用与
基于 scVI 的整合类似，但采用的是预训练 transformer 范式。

### 4. GPU 与任务分派

对于实际规模的数据集，scGPT 需要 GPU；微调的计算负担较重。通过 `alterlab-remote-compute`
分派微调／大规模推断任务（提交 → 轮询 → 获取结果）。保持 AnnData I/O
与 `alterlab-anndata` 一致。

## 资源

- `references/scgpt_usage.md` — 安装／版本锁定、检查点、嵌入／注释／微调调用、
  scverse 集成以及范式对比。按需加载。

AlterLab Academic Skills 套件的一部分。