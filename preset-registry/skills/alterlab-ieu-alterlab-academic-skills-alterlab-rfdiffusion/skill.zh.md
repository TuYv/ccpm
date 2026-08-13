---
name: alterlab-rfdiffusion
description: Generate de-novo protein backbones with RFdiffusion (Watson 2023) — a diffusion model for unconditional monomer generation, motif scaffolding, binder design against a target, and symmetric oligomers. Use when generating a new protein backbone from scratch, scaffolding a functional motif into a fold, designing a binder backbone to a target surface, or building symmetric assemblies; RFdiffusion produces the STRUCTURE, then alterlab-proteinmpnn designs its sequence and alterlab-alphafold validates it. For sequence design of an existing backbone prefer alterlab-proteinmpnn (or alterlab-ligandmpnn with a ligand); to fold a known sequence prefer alterlab-alphafold; for generative multimodal design prefer alterlab-esm. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs RFdiffusion (`RosettaCommons/RFdiffusion`, PyTorch + SE(3)-transformer) under `uv run python` via `run_inference.py`. Requires a CUDA GPU for practical generation; model weights download once and cache (several GB; no account). Outputs backbone PDBs (no sequence) — pair with alterlab-proteinmpnn then alterlab-alphafold. Dispatch runs via alterlab-remote-compute."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# RFdiffusion（从头生成骨架）

## 概述

**RFdiffusion**（Watson 等，*Nature* 2023；`RosettaCommons/RFdiffusion`）是一种**生成蛋白质骨架**的扩散模型——生成的是新的三维结构，而非序列。它支持无条件生成、**基序支架化**（围绕固定的功能基序构建折叠）、**结合蛋白设计**（生成能够结合目标表面的骨架）以及**对称**组装体。它是从头设计流程的起始结构生成步骤；随后由 `alterlab-proteinmpnn` 为骨架设计序列，并由 `alterlab-alphafold` 进行验证。

## 何时使用此 Skill

当用户希望执行以下操作时，请使用此 Skill：
- 从头**生成**全新的蛋白质骨架（无条件生成）。
- 将功能基序（例如结合环／催化几何构型）**支架化**到新的折叠中。
- 针对给定目标蛋白质表面／热点设计**结合蛋白**骨架。
- 构建作为骨架的**对称**寡聚体（环状／二面体）。

### 不会触发的场景

| 场景 | 应改用 |
|----------|-------------|
| 为现有骨架设计**序列** | `alterlab-proteinmpnn` |
| 在存在配体／金属的情况下设计口袋序列 | `alterlab-ligandmpnn` |
| 将已知序列**折叠**为结构 | `alterlab-alphafold` |
| 生成式多模态（序列+结构）设计 | `alterlab-esm` |

## 核心能力

### 1. 无条件生成

```bash
# RosettaCommons/RFdiffusion — run_inference.py drives generation (Hydra config).
# It lives in the repo's scripts directory; TODO(verify) config keys/version.
python run_inference.py \
  'contigmap.contigs=[100-100]' \
  inference.output_prefix=out/uncond \
  inference.num_designs=10
```

`contigmap.contigs` 指定要构建的内容（此处为一个由 100 个残基组成的单体）。输出不含序列的骨架 PDB。

### 2. 基序支架化

固定一个功能基序（来自输入 PDB 的残基），并让 RFdiffusion 在其周围构建提供支撑的折叠——这是将结合／催化几何构型移植到全新稳定支架中的方法。Contig 语法将固定基序范围与生成片段混合使用（请针对你使用的版本 `TODO(verify)` 确认确切的 contig 语法）。

### 3. 结合蛋白设计

提供目标结构和热点残基；RFdiffusion 会生成与该表面对接的结合蛋白骨架。随后进行序列设计（`alterlab-proteinmpnn`）和界面验证性重新折叠（`alterlab-alphafold`，读取 ipTM）。

### 4. 完整的设计 → 折叠 → 评分循环

1. 在此处使用 RFdiffusion **生成**骨架。
2. 使用 `alterlab-proteinmpnn` **设计**序列（如果存在配体，则使用 `alterlab-ligandmpnn`）。
3. 使用 `alterlab-alphafold` 重新折叠并**评分**，仅保留自洽的设计。

需要大量 GPU 资源——通过 `alterlab-remote-compute` 调度生成任务和折叠批量任务。

## 资源

- `references/rfdiffusion_usage.md` — 安装／版本固定、contig 语法、基序／结合蛋白／对称性配置以及循环集成。按需加载。

AlterLab Academic Skills 套件的一部分。