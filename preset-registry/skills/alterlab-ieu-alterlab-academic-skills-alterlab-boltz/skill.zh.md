---
name: alterlab-boltz
description: Co-fold biomolecular complexes with Boltz-2, an open AlphaFold3-style model — predict protein + ligand (SMILES/CCD), protein + nucleic-acid, and multi-chain structures in one pass, with binding-affinity prediction. Use when folding a protein together with a small-molecule ligand, predicting a holo (ligand-bound) complex or its binding affinity, or co-folding protein–DNA/RNA assemblies. For protein-only or protein–protein folding without ligands prefer alterlab-alphafold; for antibody–antigen complexes prefer alterlab-chai; to dock a ligand into a FIXED receptor structure prefer alterlab-diffdock; to look up an existing structure prefer alterlab-pdb. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs the Boltz-2 model (`jwohlwend/boltz`; install the `boltz` package — TODO(verify) exact pin) under `uv run python`. Requires a CUDA GPU; model weights download once and cache (several GB). Inputs are a FASTA or a YAML spec listing chains + ligands (SMILES/CCD). Dispatch heavy runs via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Boltz-2（开放的 AlphaFold3 风格共折叠）

## 概述

**Boltz-2**（Passaro、Wohlwend 等，2025；`jwohlwend/boltz`）是 AlphaFold3 系列中一个开放且可商用的生物分子结构模型：它可以在单次预测中对蛋白质与小分子**配体**、核酸及多条链进行**共折叠**，还可预测**结合亲和力**——这些是 AlphaFold2/ColabFold 不具备的能力。当研究对象是*包含配体或其他分子类型的复合物*，而非单独的蛋白质时，请使用它。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- 将蛋白质与**小分子配体**（SMILES 或 CCD 代码）进行共折叠，得到全酶复合物。
- 在获得共折叠构象的同时预测**结合亲和力**。
- 一次性折叠**蛋白质–核酸**或多实体组装体。
- 无需专有访问权限即可获得开放的 AlphaFold3 风格预测。

### 不适用的情况

| 场景 | 改用 |
|----------|-------------|
| 仅蛋白质或蛋白质–蛋白质折叠，不含配体 | `alterlab-alphafold` |
| 抗体–抗原复合物／常规的单 FASTA 多实体复合物 | `alterlab-chai` |
| 将配体对接到**现有的固定**受体结构中 | `alterlab-diffdock` |
| 获取实验测定的结构 | `alterlab-pdb` |
| 围绕配体设计结合口袋序列 | `alterlab-ligandmpnn` |

## 核心能力

### 1. 蛋白质 + 配体共折叠

使用 YAML 规范描述复合物（链 + 以 SMILES 或 CCD 表示的配体），然后进行预测：

```yaml
# complex.yaml (schema — TODO(verify) against installed boltz)
version: 1
sequences:
  - protein: { id: A, sequence: "MKT...GGG" }
  - ligand:  { id: L, smiles: "CC(=O)Oc1ccccc1C(=O)O" }
```

```bash
boltz predict complex.yaml --out_dir out/ --use_msa_server
```

输出共折叠结构（蛋白质 + 已放置的配体）以及每个模型的置信度。
`--use_msa_server` 会从托管服务获取蛋白质 MSA（对于敏感序列应披露这一点）；也可以改为提供本地 MSA。

### 2. 结合亲和力预测

Boltz-2 可以在预测构象的同时，为蛋白质–配体对预测结合亲和力值——这对于虚拟筛选中的初筛／排序非常有用。应将预测的亲和力视为一种*排序*信号，而不是实测常数；请通过实验或对照实测数据（`alterlab-bindingdb`）确认命中结果。每个版本的确切亲和力输出标志／字段需 `TODO(verify)`。

### 3. 置信度和验证

读取每个模型的置信度（对于界面，还应读取模型的界面评分），以决定应信任哪个构象。特别是对于配体构象，应进行合理性检查，确认配体位于合理的口袋中，并且该位点周围蛋白质的置信度较高。当受体结构已知且固定时，可使用 `alterlab-diffdock` 对替代对接结果进行交叉核验。

### 4. 在 GPU 上运行

Boltz-2 需要 CUDA GPU，并会一次性下载权重。可通过 `alterlab-remote-compute` 进行批量预测（例如，针对同一个靶点预测一系列配体）：提交 → 轮询 → 收取 `out/`。

## 资源

- `references/boltz_usage.md` — 安装/版本固定、YAML/FASTA 输入模式、MSA 选项、
  亲和力输出和多实体示例。按需加载。

AlterLab Academic Skills 套件的一部分。