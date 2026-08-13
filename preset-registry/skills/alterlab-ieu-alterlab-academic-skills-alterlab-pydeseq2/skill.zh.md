---
name: alterlab-pydeseq2
description: Run differential gene expression analysis on bulk RNA-seq count matrices with PyDESeq2, the Python port of DESeq2 — size-factor normalization, dispersion estimation, Wald tests, FDR (Benjamini-Hochberg) correction, and volcano/MA plots. Use when identifying differentially expressed genes between conditions from raw bulk RNA-seq counts. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# PyDESeq2

## 概述

PyDESeq2 是 DESeq2 的 Python 实现，用于对批量 RNA-seq 数据进行差异表达分析。它支持从数据加载到结果解释的完整工作流，包括单因素和多因素设计、带多重检验校正的 Wald 检验、可选的 apeGLM 收缩，以及与 pandas 和 AnnData 的集成。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 分析批量 RNA-seq 计数数据以进行差异表达分析
- 比较不同实验条件之间的基因表达（例如处理组与对照组）
- 执行考虑批次效应或协变量的多因素设计
- 将基于 R 的 DESeq2 工作流转换为 Python
- 将差异表达分析集成到基于 Python 的流水线中
- 用户提及“DESeq2”“差异表达”“RNA-seq 分析”或“PyDESeq2”

## 安装与要求

```bash
uv pip install "pydeseq2>=0.5,<0.6"
```

**系统要求（pydeseq2 0.5.x）：** Python ≥3.11；numpy ≥2.0、pandas ≥2.2、scipy ≥1.12、scikit-learn ≥1.4、anndata ≥0.11、formulaic ≥1.0.2（用于解析 `~` 设计公式）、matplotlib ≥3.9。这些包会作为依赖项自动安装。

**API 注意事项（0.4+）：** 并行性通过 `inference` 对象配置，而不是使用单独的 `n_cpus=` 关键字参数：

```python
from pydeseq2.default_inference import DefaultInference
inference = DefaultInference(n_cpus=8)
dds = DeseqDataSet(counts=counts_df, metadata=metadata, design="~condition", inference=inference)
ds = DeseqStats(dds, contrast=["condition", "treated", "control"], inference=inference)
```

## 核心工作流

1. **准备数据** — 将计数数据加载为**样本 × 基因**格式（如果加载的数据为基因 × 样本格式，则使用 `.T` 进行转置）；过滤低计数基因（例如总读段数 < 10）；删除元数据缺失的样本。
2. **指定设计** — 使用 Wilkinson 公式（`"~condition"`、`"~batch + condition"`）；将调整变量放在目标变量之前。
3. **拟合** — `DeseqDataSet(...).deseq2()` 会运行完整流水线（大小因子 → 离散度 → LFC → Cook's 异常值）。
4. **检验** — `DeseqStats(dds, contrast=[var, test, ref]).summary()`；读取 `results_df`。
5. **（可选）收缩** — 使用 `ds.lfc_shrink()`，仅用于可视化和排序；p 值保持未收缩状态。
6. **解释/导出** — 按 `padj < 0.05` 进行筛选，绘制火山图/MA 图，保存 CSV/pickle。

最小代码框架：
```python
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

dds = DeseqDataSet(counts=counts_df, metadata=metadata, design="~condition")
dds.deseq2()
ds = DeseqStats(dds, contrast=["condition", "treated", "control"])
ds.summary()
significant = ds.results_df[ds.results_df.padj < 0.05]
```

## 命令行脚本

此 Skill 包含一个用于标准分析的完整独立脚本：

```bash
python scripts/run_deseq2_analysis.py \
  --counts counts.csv \
  --metadata metadata.csv \
  --design "~batch + condition" \
  --contrast condition treated control \
  --output results/ \
  --min-counts 10 --alpha 0.05 --n-cpus 4 --plots
```

它负责数据加载/验证、基因和样本过滤、完整的 DESeq2 流程、使用可自定义参数进行统计检验、结果导出（CSV、pickle），以及可选的火山图/MA 图绘制。如需批量处理多个数据集，请引导用户参阅 `scripts/run_deseq2_analysis.py`。

## 路由指南

- **运行标准分析（加载 → 拟合 → 检验 → 导出），或采用任何特定设计（双组、多重比较、批次、协变量）** → `references/pipeline_steps.md`。
- **解读结果、对基因进行排序、绘制火山图/MA 图或查看质量指标** → `references/interpretation_and_plots.md`。
- **遇到错误**（索引不匹配、全零计数、"not full rank"、没有显著基因）→ 查看 `references/interpretation_and_plots.md` 中的故障排除部分。
- **需要确切的类/方法参数或对象属性** → `references/api_reference.md`。
- **复杂实验设计或深入的工作流程** → `references/workflow_guide.md`。

## 重要提醒

1. **数据方向很重要：** 计数数据通常以基因 × 样本的形式加载，但需要转换为样本 × 基因——如有需要，请使用 `.T` 进行转置。
2. **样本过滤：** 分析前移除元数据缺失的样本。
3. **基因过滤：** 去除低计数基因（例如，总读取数 < 10）以提高统计功效。
4. **设计公式顺序：** 调整变量应放在目标变量之前（`"~batch + condition"`）。
5. **LFC 收缩时机：** 在检验后进行收缩，且仅用于可视化/排序——p 值仍保持未收缩状态。
6. **显著性：** 使用 `padj < 0.05`（Benjamini-Hochberg FDR），而不是原始 p 值。
7. **对比格式：** `[variable, test_level, reference_level]`。
8. **保存中间结果：** 使用 pickle 保存 DeseqDataSet，以避免重新运行耗时的拟合过程。

## 参考文档索引

- **`references/pipeline_steps.md`** — 快速入门、包含完整代码的六个流程步骤（数据准备、设计、拟合、检验、收缩、导出），以及四种常见实验设计。
- **`references/interpretation_and_plots.md`** — 显著基因的过滤/排序、质量指标、火山图和 MA 图，以及故障排除指南。
- **`references/api_reference.md`** — 完整的 PyDESeq2 类/方法/参数和数据结构文档。
- **`references/workflow_guide.md`** — 深入的完整工作流程、数据加载模式、多因素设计和最佳实践。

## 其他资源

- **官方文档：** https://pydeseq2.readthedocs.io
- **GitHub 仓库：** https://github.com/owkin/PyDESeq2
- **论文：** Muzellec et al. (2023) Bioinformatics, DOI: 10.1093/bioinformatics/btad547
- **原始 DESeq2（R）：** Love et al. (2014) Genome Biology, DOI: 10.1186/s13059-014-0550-8