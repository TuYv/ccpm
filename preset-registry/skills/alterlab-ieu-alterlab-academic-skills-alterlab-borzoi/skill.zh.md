---
name: alterlab-borzoi
description: Predict genome-wide functional genomics tracks from DNA sequence with Borzoi (Linder 2025) — a sequence-to-function model outputting RNA-seq, CAGE, ATAC, and ChIP coverage across long context, used to score non-coding and regulatory variant effects. Use when predicting functional tracks from a DNA sequence, scoring a non-coding/regulatory variant's effect on expression or chromatin, or doing in-silico mutagenesis of a locus. To LOOK UP a variant's population frequency prefer alterlab-gnomad; for its clinical significance prefer alterlab-clinvar; for protein-structure effects prefer alterlab-alphafold; for single-cell foundation models prefer alterlab-scgpt. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs Borzoi (`calico/borzoi`; install per repo — TODO(verify) exact pin) under `uv run python`. Model weights download once and cache; a CUDA GPU is recommended (the model takes long DNA context and is heavy on CPU). Inputs are DNA sequences (FASTA / genome coordinates + a reference); outputs are multi-track coverage arrays. Dispatch large scans via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Borzoi（序列 → 功能）

## 概述

**Borzoi**（Linder et al. 2025；`calico/borzoi`）是一种**序列到功能**的深度学习
模型：给定一个涵盖较长基因组上下文的 DNA 序列，它可以预测**全基因组功能
轨道**——包括多种检测方法/组织中的 RNA-seq、CAGE、ATAC-seq 和 ChIP 覆盖度。其主要
用途是**非编码变异效应评分**：将参考等位基因和替代等位基因分别输入
模型，并比较预测轨道，以估算调控变异对表达
或染色质的影响。

它根据序列**预测**功能，而不是*查询*已知变异。若要获取变异的
群体频率，请使用 `alterlab-gnomad`；若要获取临床意义，请使用 `alterlab-clinvar`。

## 何时使用此 Skill

当用户希望执行以下操作时，请使用此 Skill：
- 根据 DNA 序列或基因组位点预测**功能轨道**（RNA-seq/CAGE/ATAC/ChIP）。
- 对**非编码/调控变异**的预测效应（参考与替代）进行评分。
- 运行**计算机模拟诱变**，以找出调控元件中的驱动碱基。
- 根据预测的功能影响确定候选调控变异的优先级。

### 不触发的场景

| 场景 | 改用 |
|----------|-------------|
| 查询变异的**群体频率** | `alterlab-gnomad` |
| 查询变异的**临床意义** | `alterlab-clinvar` |
| 预测**蛋白质结构**/编码效应 | `alterlab-alphafold` |
| 单细胞基础模型任务 | `alterlab-scgpt` |
| 根据测序读段执行标准变异检测 | `alterlab-nf-core-sarek`（或相关的流水线 Skill） |

## 核心能力

### 1. 根据序列预测轨道

```python
# calico/borzoi — API sketch; TODO(verify) against installed borzoi
# 1) extract the reference sequence window around a locus
# 2) run the model to get multi-track predicted coverage
# (see references/borzoi_usage.md for the exact model-loading + predict calls)
```

提供一个基因组窗口（坐标 + 参考基因组，或 FASTA）；模型将返回其各个输出轨道上的预测
覆盖度。

### 2. 非编码变异效应评分

核心工作流：为一个变异构建**参考**和**替代**序列，分别预测
轨道，并量化差异（例如 SAD/SED 风格的评分），以估算该
变异的调控效应。根据预测变化的幅度确定候选变异的优先级。

### 3. 计算机模拟诱变

系统性地改变调控元件中的碱基，并读取预测轨道的差值，以
定位具有重要功能的位置（基序/驱动因子发现）。

### 4. GPU 和任务分派

Borzoi 使用较长的上下文，对 GPU 资源需求较高；全基因组或多变异扫描应
通过 `alterlab-remote-compute` 分派（提交 → 轮询 → 获取结果）。

## 资源

- `references/borzoi_usage.md` — 安装/版本固定、序列提取、预测调用、
  参考/替代变异评分、计算机模拟诱变以及 Enformer 的技术沿革。按需加载。

AlterLab Academic Skills 套件的一部分。