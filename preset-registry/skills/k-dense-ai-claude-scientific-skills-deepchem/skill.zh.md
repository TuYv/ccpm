---
name: deepchem
description: Molecular ML with diverse featurizers and pre-built datasets. Use for property prediction (ADMET, toxicity) with traditional ML or GNNs when you want extensive featurization options and MoleculeNet benchmarks. Best for quick experiments with pre-trained models, diverse molecular representations. For graph-first PyTorch workflows use torchdrug; for benchmark datasets use pytdc.
license: MIT license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python 3.7–3.11 (PyPI 2.8.0 caps at <3.12). Install PyTorch, TensorFlow, or JAX before the matching deepchem extra. RDKit is a core dependency.
metadata:
  version: "1.4"
  skill-author: K-Dense Inc.
---
# DeepChem

## 概述

DeepChem 是一个综合性的 Python 库，用于将机器学习应用于化学、材料科学和生物学。通过专用神经网络、分子特征化方法和预训练模型，实现分子性质预测、药物发现、材料设计和生物分子分析。

**版本说明：**示例面向 **deepchem 2.8.0**（PyPI 稳定版，2024 年 4 月）。需要 **Python 3.7–3.11**（PyPI 上为 `<3.12`）。核心工具（加载器、特征化器、MoleculeNet）无需深度学习后端即可使用；GNN 和 Transformer 模型需要匹配的额外依赖（`torch`、`tensorflow` 或 `jax`）。使用 GPU 构建版本时，请先安装后端框架。

## 何时使用此技能

应在以下情况下使用此技能：
- 加载和处理分子数据（SMILES 字符串、SDF 文件、蛋白质序列）
- 预测分子性质（溶解度、毒性、结合亲和力、ADMET 性质）
- 在化学/生物数据集上训练模型
- 使用 MoleculeNet 基准数据集（Tox21、BBBP、Delaney 等）
- 将分子转换为适用于机器学习的特征（指纹、图表示、描述符）
- 为分子实现图神经网络（GCN、GAT、MPNN、AttentiveFP）
- 使用预训练模型进行迁移学习（ChemBERTa、GROVER、MolFormer）
- 预测晶体/材料性质（带隙、形成能）
- 分析蛋白质或 DNA 序列

## 核心能力

八个能力领域及其可运行的代码示例位于
[references/core_capabilities.md](references/core_capabilities.md)：

1. **分子数据加载与处理** — 加载器、`NumpyDataset` / `DiskDataset`。
2. **分子特征化** — 圆形指纹、图卷积和描述符。
3. **数据划分** — 随机、骨架、分层和 Butina 划分器，以及为何
   骨架划分是分子的可靠默认选择。
4. **模型选择与训练** — 模型家族及其拟合方法。
5. **MoleculeNet 基准测试** — 加载标准数据集及其已发布的数据划分。
6. **迁移学习** — 预训练和微调。
7. **模型评估** — 适用于回归和分类任务的指标。
8. **进行预测** — 将训练好的模型应用于新分子。

三个端到端工作流位于
[references/typical_workflows.md](references/typical_workflows.md)。

## 示例脚本

此技能在 `scripts/` 目录中包含三个可用于生产环境的脚本：

### 1. `predict_solubility.py`
训练和评估溶解度预测模型。适用于 Delaney 基准测试或自定义 CSV 数据。

```bash
# Use Delaney benchmark
python scripts/predict_solubility.py

# Use custom data
python scripts/predict_solubility.py \
    --data my_data.csv \
    --smiles-col smiles \
    --target-col solubility \
    --predict "CCO" "c1ccccc1"
```

### 2. `graph_neural_network.py`
在分子数据上训练各种图神经网络架构。

```bash
# Train GCN on Tox21
python scripts/graph_neural_network.py --model gcn --dataset tox21

# Train AttentiveFP on custom data
python scripts/graph_neural_network.py \
    --model attentivefp \
    --data molecules.csv \
    --task-type regression \
    --targets activity \
    --epochs 100
```

### 3. `transfer_learning.py`
在分子性质预测任务上微调预训练模型（ChemBERTa、GROVER、MolFormer）。

```bash
# Fine-tune ChemBERTa on BBBP
python scripts/transfer_learning.py --model chemberta --dataset bbbp

# Fine-tune GROVER on custom data
python scripts/transfer_learning.py \
    --model grover \
    --data small_dataset.csv \
    --target activity \
    --task-type classification \
    --epochs 20
```

## 常见模式与最佳实践

### 模式 1：始终对分子使用骨架划分
```python
# GOOD: Prevents data leakage
splitter = dc.splits.ScaffoldSplitter()
train, test = splitter.train_test_split(dataset)

# BAD: Similar molecules in train and test
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)
```

### 模式 2：归一化特征和目标值
```python
transformers = [
    dc.trans.NormalizationTransformer(
        transform_y=True,  # Also normalize target values
        dataset=train
    )
]
for transformer in transformers:
    train = transformer.transform(train)
    test = transformer.transform(test)
```

### 模式 3：先从简单方法开始，再逐步扩展
1. 从 Random Forest + CircularFingerprint 开始（快速基线）
2. 如果 RF 表现良好，尝试 XGBoost/LightGBM
3. 如果拥有 >5K 个样本，转向深度学习（MultitaskRegressor）
4. 如果拥有 >10K 个样本，尝试 GNN
5. 对小型数据集或新颖骨架使用迁移学习

### 模式 4：处理不平衡数据
```python
# Option 1: Balancing transformer
transformer = dc.trans.BalancingTransformer(dataset=train)
train = transformer.transform(train)

# Option 2: Use balanced metrics
metric = dc.metrics.Metric(dc.metrics.balanced_accuracy_score)
```

### 模式 5：避免内存问题
```python
# Use DiskDataset for large datasets
dataset = dc.data.DiskDataset.from_numpy(X, y, w, ids)

# Use smaller batch sizes
model = dc.models.GCNModel(batch_size=32)  # Instead of 128
```

## 常见陷阱

### 问题 1：药物发现中的数据泄漏
**问题**：使用随机划分会使相似分子同时出现在训练集和测试集中。
**解决方案**：对分子数据集始终使用 `ScaffoldSplitter`。

### 问题 2：GNN 的表现不如指纹特征
**问题**：图神经网络的表现比简单指纹特征更差。
**解决方案**：
- 确保数据集足够大（通常 >10K 个样本）
- 增加训练轮数（50-100）
- 尝试不同架构（使用 AttentiveFP、DMPNN 替代 GCN）
- 使用预训练模型（GROVER）

### 问题 3：小型数据集上的过拟合
**问题**：模型记住了训练数据。
**解决方案**：
- 使用更强的正则化（将 dropout 增加到 0.5）
- 使用更简单的模型（使用 Random Forest 替代深度学习）
- 应用迁移学习（ChemBERTa、GROVER）
- 收集更多数据

### 问题 4：导入错误
**问题**：出现 `No module named 'torch'` / `No module named 'tensorflow'` 警告，或模型类导入失败。
**解决方案**：DeepChem 采用惰性加载——安装与模型匹配的后端，然后添加相应的 extra：
```bash
uv pip install deepchem              # loaders, featurizers, MoleculeNet only
uv pip install 'deepchem[torch]'       # GCN, GAT, AttentiveFP, HuggingFaceModel, GroverModel
uv pip install 'deepchem[tensorflow]'  # legacy Keras models
uv pip install 'deepchem[jax]'         # Haiku/JAX models
```
使用 GPU 时，请在安装 extra **之前**安装具有正确 CUDA 构建的 PyTorch 或 TensorFlow。在 zsh 中请为 extra 加引号：`'deepchem[torch]'`。

**Conda + PyTorch 用户：**如果 `import deepchem` 因 `undefined symbol: iJIT_NotifyEvent` 失败，请将 MKL 固定在 2025 以下（`conda install "mkl<2025"`）——PyTorch wheels 可能与 MKL 2025.0.0 不兼容。

## 参考文档

此技能包含全面的参考文档：

### `references/api_reference.md`
完整的 API 文档，包括：
- 所有数据加载器及其使用场景
- 数据集类以及各自的适用时机
- 包含选择指南的完整特征化器目录
- 按类别组织的模型目录（50+ 个模型）
- MoleculeNet 数据集说明
- 指标和评估函数
- 常见代码模式

**何时参考**：当你需要具体的 API 细节、参数名称，或想探索可用选项时，请搜索此文件。

### `references/workflows.md`
八个详细的端到端工作流：
1. 基于 SMILES 的分子性质预测
2. 使用 MoleculeNet 基准测试
3. 超参数优化
4. 使用预训练模型进行迁移学习
5. 使用 GAN 进行分子生成
6. 材料性质预测
7. 蛋白质序列分析
8. 自定义模型集成

**何时参考**：将这些工作流作为实现完整解决方案的模板。

## 安装

核心包（数据加载器、特征化器、MoleculeNet、scikit-learn 包装器）：

```bash
uv pip install deepchem
```

添加与你的模型后端匹配的额外依赖（对于 GPU 构建，请先安装 PyTorch/TensorFlow/JAX）：

```bash
uv pip install 'deepchem[torch]'       # GNNs, TorchModel, HuggingFaceModel, GroverModel
uv pip install 'deepchem[tensorflow]'  # Keras/TensorFlow models
uv pip install 'deepchem[jax]'         # JAX/Haiku models
uv pip install 'deepchem[dqc]'         # Differentiable quantum chemistry (torch + xitorch)
```

夜间构建版本：`uv pip install --pre deepchem`（使用 `--pre` 时同样适用这些额外依赖）。

有关每个模型类的可选依赖项，请参阅[安装指南](https://deepchem.readthedocs.io/en/latest/get_started/installation.html)和[软性要求](https://deepchem.readthedocs.io/en/latest/requirements.html)。

## 其他资源

- 官方文档：https://deepchem.readthedocs.io/
- GitHub 仓库：https://github.com/deepchem/deepchem
- 教程：https://deepchem.readthedocs.io/en/latest/get_started/tutorials.html
- 论文："MoleculeNet: A Benchmark for Molecular Machine Learning"