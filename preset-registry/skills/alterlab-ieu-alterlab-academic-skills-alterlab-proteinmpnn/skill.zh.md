---
name: alterlab-proteinmpnn
description: Design protein sequences for a fixed backbone with ProteinMPNN (Dauparas 2022) — message-passing inverse folding that outputs sequences predicted to fold to a given structure, with fixed positions, tied/symmetric chains, amino-acid bias, and a soluble-model variant. Use when inverse-folding a backbone PDB into sequences, redesigning selected positions, imposing symmetry across chains, or generating the sequence step of a design→fold→score loop. For pocket/interface design WITH a bound ligand, metal, or nucleic acid prefer alterlab-ligandmpnn; to GENERATE a new backbone prefer alterlab-rfdiffusion; to refold and validate a design prefer alterlab-alphafold; for generative multimodal design prefer alterlab-esm. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs `protein_mpnn_run.py` from `dauparas/ProteinMPNN` (PyTorch) under `uv run python`. The model is small — it runs on CPU and does not require a GPU (a GPU only speeds large batches). Network weights ship with the repo (no download/account). Input is a backbone PDB; output is a FASTA of designed sequences with scores."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# ProteinMPNN（固定骨架序列设计）

## 概述

**ProteinMPNN**（Dauparas 等，*Science* 2022；`dauparas/ProteinMPNN`）用于解决
**逆折叠**问题：给定一个蛋白质**骨架**（没有序列或使用占位序列的三维结构），它可以设计出
**预计能够折叠成该骨架的氨基酸序列**。它速度快、鲁棒性强、可在 CPU 上运行，是骨架生成
（`alterlab-rfdiffusion`）与结构验证（`alterlab-alphafold`）之间标准的“序列”步骤。

## 何时使用此 Skill

当用户希望执行以下操作时，请使用此 Skill：
- 将骨架 PDB **逆折叠**为一个或多个候选序列。
- 仅**重新设计**选定位置，同时固定其余位置（部分设计）。
- 通过绑定残基/链来强制满足**对称性**，使同源寡聚体获得相同序列。
- 调整氨基酸组成的偏好（例如避免半胱氨酸），或使用**可溶性**模型。
- 完成**设计 → 折叠 → 评分**循环中的序列步骤。

### 不会触发的场景

| 场景 | 改用 |
|----------|-------------|
| 在存在配体、金属或核酸的情况下设计口袋/界面 | `alterlab-ligandmpnn` |
| **生成**新骨架（没有起始结构） | `alterlab-rfdiffusion` |
| 重新折叠设计序列以进行检查（验证） | `alterlab-alphafold` |
| 生成式多模态（序列+结构+功能）设计 | `alterlab-esm` |

## 核心能力

### 1. 基础逆折叠

```bash
# Parse the PDB, then design sequences (dauparas/ProteinMPNN CLI — TODO(verify) flags/version).
# The parser lives in the repo's helper_scripts directory; run it by name:
python parse_multiple_chains.py --input_path=pdbs/ --output_path=parsed.jsonl
python protein_mpnn_run.py \
  --jsonl_path parsed.jsonl --out_folder out/ \
  --num_seq_per_target 8 --sampling_temp "0.1"
```

较低的 `--sampling_temp`（例如 0.1）会生成较为保守、置信度较高的设计；较高的温度则会增加
多样性。输出 FASTA 的标头中包含模型**评分**（越低越好）和序列恢复率。

### 2. 固定位置和链

提供固定位置规范（由辅助脚本生成的 JSONL），以便在重新设计其余位置时保留催化残基/已知
残基；同时提供链规范，以便仅设计部分链。请根据你检出的版本核实辅助脚本的确切名称
（`TODO(verify)`）。

### 3. 对称性/绑定位置

绑定不同链上的位置，使同源寡聚体获得一个对称应用的序列——这对于对称的
`alterlab-rfdiffusion` 输出至关重要。

### 4. 设计 → 折叠 → 评分循环

标准的从头设计流程：

1. 使用 `alterlab-rfdiffusion` **生成**骨架。
2. 在此处使用 ProteinMPNN 为其**设计**序列，并为每个骨架采样多个序列。
3. 使用 `alterlab-alphafold` 重新折叠每个序列并进行**评分**，仅接受自洽的设计
   （以高 pLDDT、低 PAE 返回目标骨架）。

## 资源

- `references/proteinmpnn_usage.md` — 安装/版本固定、辅助脚本输入（固定位置、
  绑定链、偏置）、可溶性模型、温度指导和循环集成。按需加载。

AlterLab 学术技能套件的一部分。