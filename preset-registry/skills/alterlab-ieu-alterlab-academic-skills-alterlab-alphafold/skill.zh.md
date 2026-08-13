---
name: alterlab-alphafold
description: Predict protein 3D structures with AlphaFold2 via ColabFold — MMseqs2-accelerated MSAs, monomer and AlphaFold2-Multimer complex folding, and confidence-based validation (pLDDT, pTM/ipTM, PAE). Use when folding a protein sequence or complex from FASTA, generating a predicted structure with confidence metrics, ranking models, or checking self-consistency of a design. For co-folding a protein WITH a small-molecule ligand or predicting binding affinity prefer alterlab-boltz; for antibody–antigen or one-FASTA multi-entity complexes prefer alterlab-chai; to LOOK UP an already-computed structure prefer alterlab-alphafold-db; for ESM embeddings or inverse folding prefer alterlab-esm. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs via ColabFold (`colabfold_batch`; install `colabfold[alphafold]` — TODO(verify) exact pin) under `uv run python`. Requires a CUDA GPU for folding (JAX/CUDA); the MSA step uses the hosted MMseqs2 API by default or a local database. AF2 network weights are downloaded once and cached (~several GB). Dispatch heavy runs via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# AlphaFold（通过 ColabFold）

## 概述

使用 **AlphaFold2** 根据蛋白质的氨基酸序列预测其三维结构，并通过 **ColabFold**（Mirdita 等，*Nature Methods* 2022）运行。ColabFold 使用快速的 **MMseqs2** API 替代了 AlphaFold 缓慢的遗传数据库 MSA 搜索，使得在单张 GPU 上进行折叠预测成为切实可行的方案。它既支持单链（单体），也可通过 **AlphaFold2-Multimer**（Evans 等，2021）处理复合物，并报告逐残基和逐界面的**置信度指标**，让你能够判断预测结果中的哪些部分值得信赖。

此技能会实际**运行**折叠预测，并返回结构和置信度。如果想在不运行任何计算的情况下，为已知 UniProt 条目获取一个*已经计算完成的* AlphaFold 预测，请改用 `alterlab-alphafold-db`。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- 将蛋白质序列（FASTA）折叠为预测的三维结构（PDB/mmCIF）。
- 预测蛋白质**复合物**（AF2-Multimer）并对界面进行评分（ipTM）。
- 对多个模型进行排名，并读取置信度指标（pLDDT、pTM、PAE）以判断可靠性。
- 通过重新折叠设计序列并检查其与目标之间的自洽性，验证该序列。

### 不会触发的场景

| 场景 | 改用 |
|----------|-------------|
| 将蛋白质与**配体**（SMILES/CCD）共同折叠，或预测结合亲和力 | `alterlab-boltz` |
| 通过一个 FASTA 预测抗体–抗原或任意多实体复合物 | `alterlab-chai` |
| 根据 UniProt id 查找**预计算的** AlphaFold 模型 | `alterlab-alphafold-db` |
| ESM 嵌入、逆折叠、生成式设计 | `alterlab-esm` |
| 将配体对接到现有结构中 | `alterlab-diffdock` |
| 从头生成骨架 | `alterlab-rfdiffusion` |

## 核心能力

### 1. 单体折叠

```bash
# One sequence per FASTA record; MSAs via the hosted MMseqs2 API (--msa-mode)
colabfold_batch input.fasta out/ --num-models 5 --num-recycle 3
```

每条记录的输出包括：经过排名的 `*_relaxed_rank_001_*.pdb`、包含 `plddt`/`pae` 的 JSON，以及覆盖度/pLDDT 图。`TODO(verify)` 请根据已安装的 ColabFold 核实确切的标志名称。

### 2. 复合物折叠（AF2-Multimer）

在一条 FASTA 记录中使用冒号连接各条链，以折叠复合物：

```text
>my_complex
MKT...AAA:MSE...GGG
```

```bash
colabfold_batch complex.fasta out/ --model-type alphafold2_multimer_v3
```

请读取 **ipTM**（界面置信度）和链间 **PAE** 区块，以判断预测界面是否有意义，而不能只看链内 pLDDT。

### 3. 置信度和验证

| 指标 | 含义 |
|--------|-------|
| **pLDDT**（0–100，逐残基） | 局部置信度；<50 = 可能无序/不可靠 |
| **pTM** | 全局折叠置信度 |
| **ipTM** | 界面置信度（复合物）——判断结合时最重要的数值 |
| **PAE** | 残基对之间的预期位置误差；非对角线区域数值较低 = 相对取向可信 |

**自洽性检查**（验证设计）：折叠候选序列，然后将其与预期骨架进行比较（例如 TM-score / RMSD）。如果一个设计能够以较高的 pLDDT 和较低的 PAE 重新折叠回其目标结构，则该设计具有自洽性——这是 design→fold→score 循环中的标准验收关卡（参见 `alterlab-proteinmpnn`、`alterlab-rfdiffusion`）。

### 4. 在 GPU 上运行

折叠需要 CUDA GPU。对于快速单体预测之外的任何任务，请通过
`alterlab-remote-compute`（SLURM 或托管 GPU 提供商）分派：提交 `colabfold_batch`，轮询
直至完成，然后收集 `out/`。

## 资源

- `references/colabfold_usage.md` — 安装/版本固定、MSA 模式（API 与本地数据库）、模板、
  松弛、批处理/数组任务运行，以及完整的指标解读。按需加载。

AlterLab Academic Skills 套件的一部分。