---
name: alterlab-chai
description: Predict biomolecular complexes with Chai-1, an open AlphaFold3-style model that folds multi-entity assemblies (proteins, ligands, nucleic acids) from a single typed FASTA — strong on antibody–antigen and protein–ligand complexes, with optional MSA and restraint inputs. Use when predicting an antibody–antigen complex, folding a mixed protein/ligand/nucleic-acid assembly described in one FASTA, or generating a complex with experimental restraints. For binding-affinity prediction or a ligand-focused co-fold prefer alterlab-boltz; for protein-only or protein–protein folding prefer alterlab-alphafold; to dock into a fixed receptor prefer alterlab-diffdock. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs the Chai-1 model (`chaidiscovery/chai-lab`; install the `chai_lab` package — TODO(verify) exact pin) under `uv run python`. Requires a CUDA GPU; weights download once and cache (several GB). Input is a single FASTA with typed records (protein/ligand/RNA/DNA); MSAs and restraints are optional. Dispatch heavy runs via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Chai-1（开放式复合物预测）

## 概述

**Chai-1**（Chai Discovery 2024；`chaidiscovery/chai-lab`）是一个开源的 AlphaFold3 风格模型，
可根据一个**带类型标注的 FASTA** 预测由蛋白质、小分子配体和核酸共同组成的
**多实体生物分子复合物**。它尤其适用于**抗体–抗原**和蛋白质–配体复合物，
可以在使用或不使用 MSA 的情况下运行，并支持通过**约束条件**引导预测。

相较于其他文件夹，它的独特定位是：使用一个 FASTA 描述一个*混合组装体*，尤其适合
抗体–抗原复合物。对于明确需要预测**结合亲和力**的配体共折叠任务，请使用 `alterlab-boltz`；
对于单独的蛋白质，请使用 `alterlab-alphafold`。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- 预测**抗体–抗原**复合物结构。
- 对在一个 FASTA 中描述的**混合组装体**（蛋白质 + 配体 + 核酸）进行折叠。
- 在**使用或不使用 MSA** 的情况下运行复合物预测，并可选择使用约束条件进行引导。
- 获取带有各实体置信度的开源 AlphaFold3 风格复合物预测结果。

### 不触发此技能的情况

| 场景 | 改用 |
|----------|-------------|
| 预测蛋白质–配体的**结合亲和力** | `alterlab-boltz` |
| 仅蛋白质或蛋白质–蛋白质折叠 | `alterlab-alphafold` |
| 将配体对接至**固定的**受体结构 | `alterlab-diffdock` |
| 查询实验测定的复合物结构 | `alterlab-pdb` |
| 设计抗体/界面序列 | `alterlab-proteinmpnn` / `alterlab-ligandmpnn` |

## 核心能力

### 1. 单 FASTA 多实体输入

Chai-1 读取一个 FASTA，其中的记录按实体类型进行标注。以下是蛋白质 + 配体的示例：

```text
>protein|antibody-Fv
EVQ...SS
>protein|antigen
MKT...GG
>ligand|cofactor
CC(=O)Oc1ccccc1C(=O)O
```

```bash
# CLI form (verify against installed chai-lab — TODO(verify))
chai-lab fold input.fasta out/
```

标头中的类型标签（`protein`、`ligand`、`rna`、`dna`）会告诉 Chai 如何处理每条记录；
请根据已安装的版本确认准确的标头/类型语法。

### 2. 抗体–抗原复合物

常见用例是：对抗体 Fv/Fab 与其抗原进行折叠，并查看**界面
置信度**（各模型得分/界面得分），以判断预测的表位/互补位
接触是否可信。如果掌握部分表位信息，请使用约束条件。

### 3. MSA 和约束条件

- **MSA 可选** — Chai-1 可以使用单序列或 MSA 运行；MSA 通常能够提高
  准确性，但会增加时间成本。对于敏感序列，应披露是否使用了托管的 MSA 服务。
- **约束条件** — 提供接触/口袋约束条件，使预测偏向已知的
  生物学信息。请根据版本 `TODO(verify)` 约束文件的格式。

### 4. 置信度和 GPU 调度

查看各实体的置信度和界面得分以选择模型。Chai-1 需要 CUDA GPU，
并会在首次运行时缓存权重；可通过 `alterlab-remote-compute` 批量执行预测（例如，针对同一抗原预测一组抗体）
（提交 → 轮询 → 收集 `out/`）。

## 资源

- `references/chai_usage.md` — 安装/版本固定、FASTA 类型标签语法、MSA/约束选项、
  输出以及文件夹选择指南。按需加载。

AlterLab Academic Skills 套件的一部分。