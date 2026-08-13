---
name: alterlab-ligandmpnn
description: Design protein sequences around bound ligands, metals, and nucleic acids with LigandMPNN (Dauparas 2023) — inverse folding that conditions on non-protein context, so binding-pocket and metal-site residues are chosen to fit the actual ligand. Use when designing a small-molecule or metal binding pocket, redesigning residues that contact a ligand/ion/nucleic acid, or doing enzyme active-site design where the substrate matters. For backbone sequence design with NO ligand/metal context prefer alterlab-proteinmpnn; to GENERATE a backbone or scaffold a functional site prefer alterlab-rfdiffusion; to validate a design by refolding prefer alterlab-alphafold; to co-fold or dock the ligand prefer alterlab-boltz or alterlab-diffdock. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs LigandMPNN (`dauparas/LigandMPNN`, PyTorch) under `uv run python` via its `run.py`. Model checkpoints download once (small; no account). CPU works for typical sizes; a GPU only speeds large batches. Input is a structure containing the protein PLUS the ligand/metal/nucleic-acid atoms (e.g. a PDB with the HETATM records)."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# LigandMPNN（配体感知的序列设计）

## 概述

**LigandMPNN**（Dauparas 等，2023；`dauparas/LigandMPNN`）扩展了 ProteinMPNN 的逆向
折叠能力，使其能够**以非蛋白质环境为条件**——包括小分子配体、金属离子和
核酸。由于模型能够*看到*配体/金属原子，因此，它为**结合口袋**或**金属位点**
设计的残基会与实际结合的对象互补，而普通 ProteinMPNN（仅使用蛋白质原子）
无法做到这一点。

当设计目标是**与配体或离子接触的位点**时，应使用此技能。如果要对不存在任何
结合环境的骨架进行序列设计，请使用 `alterlab-proteinmpnn`。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- 设计**小分子结合口袋**，使残基与配体相匹配。
- 在离子环境中设计**金属配位位点**（例如 Zn/Fe）。
- 重新设计**与配体、离子或核酸接触**的残基。
- 进行**酶活性位点**设计，其中底物/辅因子应指导残基选择。

### 不会触发的场景

| 场景 | 改用 |
|----------|-------------|
| 为**没有**配体/金属环境的骨架进行序列设计 | `alterlab-proteinmpnn` |
| **生成**骨架或为功能基序搭建支架 | `alterlab-rfdiffusion` |
| 通过重新折叠验证设计 | `alterlab-alphafold` |
| 从头开始将蛋白质与配体共同折叠 | `alterlab-boltz` |
| 将配体对接到固定口袋中（预测构象，而非序列） | `alterlab-diffdock` |

## 核心能力

### 1. 配体感知的口袋设计

```bash
# dauparas/LigandMPNN CLI — TODO(verify) flags/checkpoint names against your checkout
python run.py \
  --model_type ligand_mpnn \
  --pdb_path complex_with_ligand.pdb \
  --out_folder out/ \
  --number_of_batches 8
```

输入 PDB 必须包含配体/金属原子（HETATM）。LigandMPNN 会设计与该环境相匹配的
口袋残基；请提供固定位置/重新设计规范，以便仅针对该位点进行设计。

### 2. 金属位点和核酸环境

在结构中提供配位离子或核酸链，使模型能够以其为条件——这对于金属酶和
DNA/RNA 结合设计至关重要。

### 3. 聚焦位点的重新设计

将设计范围限制为配体周围一定壳层内的残基（重新设计口袋，同时保留支架），
这类似于 ProteinMPNN 的固定位置工作流。请验证你的版本所使用的确切参数名称
（`TODO(verify)`）。

### 4. 在设计流程中

当功能位点涉及配体时，LigandMPNN 负责提供**序列**设计步骤：使用
`alterlab-rfdiffusion` 搭建支架或生成位点，在此处设计口袋序列，然后通过重新折叠
（`alterlab-alphafold`）进行验证；如果需要预测构象/亲和力，则使用
`alterlab-boltz` 进行共同折叠，或使用 `alterlab-diffdock` 进行对接。

## 资源

- `references/ligandmpnn_usage.md` — 安装/版本固定、模型类型、HETATM/环境输入、
  位点限制设计以及流程集成。按需加载。

AlterLab Academic Skills 套件的一部分。