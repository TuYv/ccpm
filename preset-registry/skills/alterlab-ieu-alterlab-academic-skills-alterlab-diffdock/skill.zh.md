---
name: alterlab-diffdock
description: Predicts protein-ligand binding poses with DiffDock diffusion-based molecular docking from PDB structures and SMILES, producing pose confidence scores for virtual screening and structure-based drug design. Use when docking ligands into a protein, generating binding poses, or screening compounds against a target; not for binding affinity prediction. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Requires a local DiffDock checkout (gcorso/DiffDock via conda or Docker) and a GPU for practical use; no API key or account. The skill's helper scripts (scripts/) run standalone under python/uv."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# DiffDock：基于扩散模型的分子对接

## 概述

DiffDock 是一种基于扩散模型的分子对接深度学习工具，可预测小分子配体与蛋白质靶标结合的三维构象。它代表了计算对接领域的最先进水平，对于基于结构的药物发现和化学生物学至关重要。

**核心能力：**
- 使用深度学习高精度预测配体结合构象
- 支持蛋白质结构（PDB 文件）或序列（通过 ESMFold）
- 处理单个复合物或批量虚拟筛选任务
- 生成置信度分数以评估预测的可靠性
- 处理多种配体输入格式（SMILES、SDF、MOL2）

**关键区别：**DiffDock 预测的是**结合构象**（三维结构）和**置信度**（预测确定性），而非结合亲和力（ΔG、Kd）。进行亲和力评估时，务必与评分函数（GNINA、MM/GBSA）结合使用。

## 何时使用此 Skill

应在以下情况下使用此 Skill：

- “将此配体与蛋白质进行对接”或“预测结合构象”
- “运行分子对接”或“执行蛋白质-配体对接”
- “虚拟筛选”或“筛选化合物库”
- “这个分子在哪里结合？”或“预测结合位点”
- 基于结构的药物设计或先导化合物优化任务
- 涉及 PDB 文件和 SMILES 字符串或配体结构的任务
- 对多组蛋白质-配体对进行批量对接

## 安装和环境设置

### 检查环境状态

在继续执行 DiffDock 任务之前，请验证环境设置：

```bash
# Use the provided setup checker
python scripts/setup_check.py
```

此脚本会验证 Python 版本、支持 CUDA 的 PyTorch、PyTorch Geometric、RDKit、ESM 及其他依赖项。

### 安装选项

**选项 1：Conda（推荐）**
```bash
git clone https://github.com/gcorso/DiffDock.git
cd DiffDock
conda env create --file environment.yml
conda activate diffdock
```

**选项 2：Docker**
```bash
docker pull rbgcsail/diffdock
docker run -it --gpus all --entrypoint /bin/bash rbgcsail/diffdock
micromamba activate diffdock
```

**重要说明：**
- 强烈建议使用 GPU（速度比 CPU 快 10-100 倍）
- 首次运行时会预计算 SO(2)/SO(3) 查找表（约需 2-5 分钟）
- 如果模型检查点（约 500MB）不存在，则会自动下载

## 核心工作流

### 工作流 1：单个蛋白质-配体对接

**使用场景：**将一个配体与一个蛋白质靶标进行对接

**输入要求：**
- 蛋白质：PDB 文件或氨基酸序列
- 配体：SMILES 字符串或结构文件（SDF/MOL2）

**命令：**
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_path protein.pdb \
  --ligand "CC(=O)Oc1ccccc1C(=O)O" \
  --out_dir results/single_docking/
```

**替代方式（蛋白质序列）：**
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_sequence "MSKGEELFTGVVPILVELDGDVNGHKF..." \
  --ligand ligand.sdf \
  --out_dir results/sequence_docking/
```

**输出结构：**DiffDock 会为每个复合物写入一个子目录（即使仅运行单个任务也是如此），并将置信度嵌入每个构象的文件名中：
```
results/single_docking/
└── complex_0/
    ├── rank1.sdf                   # Top pose (no score in name)
    ├── rank1_confidence-0.42.sdf   # Same pose, confidence in filename
    ├── rank2_confidence-1.10.sdf   # 2nd-ranked pose
    ├── ...
    └── rank10_confidence-3.05.sdf  # 10th pose (default: 10 samples)
```
不存在单独的 `confidence_scores.txt`；置信度值即为 `confidenceN.NN` 后缀。构象按置信度降序排列（`rank1` = 最佳）。

### 工作流 2：批量处理多个复合物

**使用场景：** 将多个配体对接到蛋白质、开展虚拟筛选

**步骤 1：准备批处理 CSV**

使用提供的脚本创建或验证批处理输入：

```bash
# Create template
python scripts/prepare_batch_csv.py --create --output batch_input.csv

# Validate existing CSV
python scripts/prepare_batch_csv.py my_input.csv --validate
```

**CSV 格式：**
```csv
complex_name,protein_path,ligand_description,protein_sequence
complex1,protein1.pdb,CC(=O)Oc1ccccc1C(=O)O,
complex2,,COc1ccc(C#N)cc1,MSKGEELFT...
complex3,protein3.pdb,ligand3.sdf,
```

**必需列：**
- `complex_name`：唯一标识符
- `protein_path`：PDB 文件路径（如果使用序列，请留空）
- `ligand_description`：SMILES 字符串或配体文件路径
- `protein_sequence`：氨基酸序列（如果使用 PDB，请留空）

**步骤 2：运行批量对接**

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv batch_input.csv \
  --out_dir results/batch/ \
  --batch_size 10
```

**对于大规模虚拟筛选（>100 个化合物）：**

预先计算蛋白质嵌入以加快处理速度：
```bash
# Pre-compute embeddings
python datasets/esm_embedding_preparation.py \
  --protein_ligand_csv screening_input.csv \
  --out_file protein_embeddings.pt

# Run with pre-computed embeddings
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv screening_input.csv \
  --esm_embeddings_path protein_embeddings.pt \
  --out_dir results/screening/
```

### 工作流 3：分析结果

对接完成后，分析置信度分数并对预测结果进行排名：

```bash
# Analyze all results
python scripts/analyze_results.py results/batch/

# Show top 5 per complex
python scripts/analyze_results.py results/batch/ --top 5

# Filter by confidence threshold
python scripts/analyze_results.py results/batch/ --threshold 0.0

# Export to CSV
python scripts/analyze_results.py results/batch/ --export summary.csv

# Show top 20 predictions across all complexes
python scripts/analyze_results.py results/batch/ --best 20
```

分析脚本会：
- 解析所有预测结果的置信度分数
- 将结果分类为高（>0）、中等（-1.5 到 0）或低（<-1.5）
- 对单个复合物内及所有复合物间的预测结果进行排名
- 生成统计摘要
- 将结果导出为 CSV，以供下游分析

## 置信度分数解读

**理解分数：**

| 分数范围 | 置信度级别 | 解读 |
|------------|------------------|----------------|
| **> 0** | 高 | 预测可靠，可能较为准确 |
| **-1.5 到 0** | 中等 | 预测合理，需要仔细验证 |
| **< -1.5** | 低 | 预测不确定，需要验证 |

**关键注意事项：**
1. **置信度 ≠ 亲和力**：高置信度表示模型对结构的确定程度高，而**不**表示结合能力强
2. **具体情况很重要**：针对以下情况调整预期：
   - 大配体（>500 Da）：预期置信度较低
   - 多条蛋白质链：可能降低置信度
   - 新型蛋白质家族：模型表现可能较差
3. **多个样本**：查看排名前 3-5 的预测结果，寻找共识

**有关详细指导：** 使用 Read 工具阅读 `references/confidence_and_limitations.md`

## 参数自定义

### 使用自定义配置

为特定用例创建自定义配置：

```bash
# Copy template
cp assets/custom_inference_config.yaml my_config.yaml

# Edit parameters (see template for presets)
# Then run with custom config
python -m inference \
  --config my_config.yaml \
  --protein_ligand_csv input.csv \
  --out_dir results/
```

### 需要调整的关键参数

**采样密度：**
- `samples_per_complex: 10` → 对于困难案例，增加到 20-40
- 样本越多 = 覆盖范围越广，但运行时间越长

**推理步数：**
- `inference_steps: 20` → 增加到 25-30 以获得更高的准确度
- 步数越多 = 可能获得更好的质量，但速度更慢

**温度参数（控制多样性）：**
- `temp_sampling_tor: 7.04` → 对于柔性配体，增加到 8-10
- `temp_sampling_tor: 7.04` → 对于刚性配体，降低到 5-6
- 温度越高 = 姿态越多样

**模板中提供的预设：**
1. 高准确度：更多样本和步数，更低温度
2. 快速筛选：样本更少，速度更快
3. 柔性配体：提高扭转温度
4. 刚性配体：降低扭转温度

**有关完整的参数参考：** 使用 Read 工具阅读 `references/parameters_reference.md`

## 高级技术

### 集成对接（蛋白质柔性）

对于已知具有柔性的蛋白质，针对多个构象进行对接：

```python
# Create ensemble CSV
import pandas as pd

conformations = ["conf1.pdb", "conf2.pdb", "conf3.pdb"]
ligand = "CC(=O)Oc1ccccc1C(=O)O"

data = {
    "complex_name": [f"ensemble_{i}" for i in range(len(conformations))],
    "protein_path": conformations,
    "ligand_description": [ligand] * len(conformations),
    "protein_sequence": [""] * len(conformations)
}

pd.DataFrame(data).to_csv("ensemble_input.csv", index=False)
```

使用增加的采样数量运行对接：
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv ensemble_input.csv \
  --samples_per_complex 20 \
  --out_dir results/ensemble/
```

### 与评分函数集成

DiffDock 生成姿态；将其与其他工具结合以评估亲和力：

**GNINA（快速神经网络评分）：**
```bash
for pose in results/*.sdf; do
    gnina -r protein.pdb -l "$pose" --score_only
done
```

**MM/GBSA（更准确，但更慢）：**
在能量最小化后使用 AmberTools MMPBSA.py 或 gmx_MMPBSA

**自由能计算（最准确）：**
使用 OpenMM + OpenFE 或 GROMACS 进行 FEP/TI 计算

**推荐工作流程：**
1. DiffDock → 生成带置信度分数的姿态
2. 目视检查 → 检查结构合理性
3. GNINA 或 MM/GBSA → 根据亲和力重新评分和排序
4. 实验验证 → 生化测定

## 局限性和适用范围

**DiffDock 适用于：**
- 小分子配体（通常为 100-1000 Da）
- 类药有机化合物
- 小肽（<20 个残基）
- 单链或多链蛋白质

**DiffDock 不适用于：**
- 大型生物分子（蛋白质-蛋白质对接）→ 使用 DiffDock-PP 或 AlphaFold-Multimer
- 大型肽（>20 个残基）→ 使用其他方法
- 共价对接 → 使用专门的共价对接工具
- 结合亲和力预测 → 与评分函数结合使用
- 膜蛋白 → 未针对其进行专门训练，请谨慎使用

**有关完整的局限性说明：** 使用 Read 工具阅读 `references/confidence_and_limitations.md`

## 故障排除

### 常见问题

**问题：所有预测的置信度分数都很低**
- 原因：配体较大或不常见、结合位点不明确、蛋白质具有柔性
- 解决方案：增加 `samples_per_complex`（20-40）、尝试集成对接、验证蛋白质结构

**问题：内存不足错误**
- 原因：GPU 内存不足以支持当前批次大小
- 解决方案：减小 `--batch_size 2`，或每次处理更少的复合物

**问题：性能缓慢**
- 原因：使用 CPU 而非 GPU 运行
- 解决方案：使用 `python -c "import torch; print(torch.cuda.is_available())"` 验证 CUDA，并使用 GPU

**问题：结合构象不合理**
- 原因：蛋白质预处理不佳、配体过大、结合位点错误
- 解决方案：检查蛋白质是否缺少残基、移除距离较远的水分子，并考虑指定结合位点

**问题："Module not found" 错误**
- 原因：缺少依赖项或使用了错误的环境
- 解决方案：运行 `python scripts/setup_check.py` 进行诊断

### 性能优化

**为获得最佳结果：**
1. 使用 GPU（实际使用时必不可少）
2. 对重复使用的蛋白质预先计算 ESM 嵌入
3. 将多个复合物一起批量处理
4. 从默认参数开始，然后根据需要进行调优
5. 验证蛋白质结构（补全缺失的残基）
6. 对配体使用规范 SMILES

## 图形用户界面

如需交互式使用，请启动 Web 界面：

```bash
python app/main.py
# Navigate to http://localhost:7860
```

或者无需安装，直接使用在线演示：
- https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web

## 资源

### 辅助脚本（`scripts/`）

**`prepare_batch_csv.py`**：创建并验证批量输入 CSV 文件
- 创建包含示例条目的模板
- 验证文件路径和 SMILES 字符串
- 检查必需列和格式问题

**`analyze_results.py`**：分析置信度分数并对预测结果进行排名
- 解析单次或批量运行的结果
- 生成统计摘要
- 导出为 CSV 以供下游分析
- 识别各复合物中的最佳预测结果

**`setup_check.py`**：验证 DiffDock 环境配置
- 检查 Python 版本和依赖项
- 验证 PyTorch 和 CUDA 的可用性
- 测试 RDKit 和 PyTorch Geometric 的安装
- 根据需要提供安装说明

### 参考文档（`references/`）

**`parameters_reference.md`**：完整的参数文档
- 所有命令行选项和配置参数
- 默认值和可接受范围
- 用于控制多样性的温度参数
- 模型检查点位置和版本标志

当用户需要以下内容时，请阅读此文件：
- 详细的参数说明
- 针对特定系统的微调指导
- 其他采样策略

**`confidence_and_limitations.md`**：置信度分数解读和工具局限性
- 置信度分数的详细解读
- 何时可以信任预测结果
- DiffDock 的适用范围和局限性
- 与互补工具的集成
- 排查预测质量问题

当用户需要以下内容时，请阅读此文件：
- 获取置信度分数解读方面的帮助
- 了解何时不应使用 DiffDock
- 获取与其他工具结合使用的指导
- 验证策略

**`workflows_examples.md`**：全面的工作流示例
- 详细的安装说明
- 所有工作流的分步示例
- 高级集成模式
- 排查常见问题
- 最佳实践和优化技巧

当用户需要以下内容时，请阅读此文件：
- 包含代码的完整工作流示例
- 与 GNINA、OpenMM 或其他工具集成
- 虚拟筛选工作流
- 集成对接流程

### 资源文件（`assets/`）

**`batch_template.csv`**：批处理模板
- 包含必需列且预先设置好格式的 CSV
- 展示不同输入类型的示例条目
- 可直接使用实际数据进行自定义

**`custom_inference_config.yaml`**：配置模板
- 包含所有参数注释的 YAML
- 针对常见使用场景的四种预设配置
- 解释每个参数的详细注释
- 可直接自定义和使用

## 最佳实践

1. 在开始大型任务之前，**始终使用 `setup_check.py` 验证环境**
2. 使用 `prepare_batch_csv.py` **验证批处理 CSV**，以便尽早发现错误
3. **从默认设置开始**，然后根据特定系统的需求调整参数
4. **生成多个样本**（10-40 个），以获得稳健的预测结果
5. 在下游分析之前，对排名靠前的构象进行**可视化检查**
6. **结合评分函数**进行亲和力评估
7. **使用置信度分数**进行初步排序，而不是作为最终决策依据
8. 针对虚拟筛选任务**预先计算嵌入**
9. **记录所用参数**，以确保可复现性
10. 尽可能通过实验**验证结果**

## 引用

使用 DiffDock 时，请引用适当的论文：

**DiffDock-L（当前默认模型）：**
```
Corso et al. (2024) "Deep Confident Steps to New Pockets: Strategies for Docking Generalization"
ICLR 2024, arXiv:2402.18396
```

**原始 DiffDock：**
```
Corso et al. (2023) "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking"
ICLR 2023, arXiv:2210.01776
```

## 其他资源

- **GitHub 仓库**：https://github.com/gcorso/DiffDock
- **在线演示**：https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web
- **DiffDock-L 论文**：https://arxiv.org/abs/2402.18396
- **原始论文**：https://arxiv.org/abs/2210.01776