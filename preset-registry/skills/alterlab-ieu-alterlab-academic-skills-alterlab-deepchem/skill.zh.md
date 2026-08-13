---
name: alterlab-deepchem
description: Runs molecular machine learning with DeepChem — diverse featurizers, pre-built MoleculeNet benchmark datasets, and pre-trained models (ChemBERTa, GROVER) for property prediction (ADMET, toxicity, solubility) via traditional ML or graph neural networks. Use when running end-to-end molecular ML experiments that need MoleculeNet benchmarks, scaffold splitting, or ready-made models with minimal setup; for building custom PyTorch graph architectures prefer alterlab-torchdrug, and for standalone molecule-to-feature-vector generation prefer alterlab-molfeat. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# DeepChem

## 概述

DeepChem 是一个综合性的 Python 库，用于将机器学习应用于化学、材料科学和生物学领域。通过专用神经网络、分子特征化方法和预训练模型，可实现分子性质预测、药物发现、材料设计和生物分子分析。

## 何时使用此 Skill

此 Skill 适用于以下情况：
- 加载和处理分子数据（SMILES 字符串、SDF 文件、蛋白质序列）
- 预测分子性质（溶解度、毒性、结合亲和力、ADMET 性质）
- 在化学/生物学数据集上训练模型
- 使用 MoleculeNet 基准数据集（Tox21、BBBP、Delaney 等）
- 将分子转换为可供机器学习使用的特征（指纹、图表示、描述符）
- 为分子实现图神经网络（GCN、GAT、MPNN、AttentiveFP）
- 使用预训练模型（ChemBERTa、GROVER、MolFormer）进行迁移学习
- 预测晶体/材料性质（带隙、形成能）
- 分析蛋白质或 DNA 序列

## 核心能力

### 1. 分子数据加载与处理

DeepChem 为多种化学数据格式提供了专用加载器：

```python
import deepchem as dc

# Load CSV with SMILES
featurizer = dc.feat.CircularFingerprint(radius=2, size=2048)
loader = dc.data.CSVLoader(
    tasks=['solubility', 'toxicity'],
    feature_field='smiles',
    featurizer=featurizer
)
dataset = loader.create_dataset('molecules.csv')

# Load SDF files
loader = dc.data.SDFLoader(tasks=['activity'], featurizer=featurizer)
dataset = loader.create_dataset('compounds.sdf')

# Load protein sequences
loader = dc.data.FASTALoader()
dataset = loader.create_dataset('proteins.fasta')
```

**主要加载器**：
- `CSVLoader`：包含分子标识符的表格数据
- `SDFLoader`：分子结构文件
- `FASTALoader`：蛋白质/DNA 序列
- `ImageLoader`：分子图像
- `JsonLoader`：JSON 格式的数据集

### 2. 分子特征化

将分子转换为供机器学习模型使用的数值表示。

#### 特征化器选择决策树

```
Is the model a graph neural network?
├─ YES → Use graph featurizers
│   ├─ Standard GNN → MolGraphConvFeaturizer
│   ├─ Message passing → DMPNNFeaturizer
│   └─ Pretrained → GroverFeaturizer
│
└─ NO → What type of model?
    ├─ Traditional ML (RF, XGBoost, SVM)
    │   ├─ Fast baseline → CircularFingerprint (ECFP)
    │   ├─ Interpretable → RDKitDescriptors
    │   └─ Maximum coverage → MordredDescriptors
    │
    ├─ Deep learning (non-graph)
    │   ├─ Dense networks → CircularFingerprint
    │   └─ CNN → SmilesToImage
    │
    ├─ Sequence models (LSTM, Transformer)
    │   └─ SmilesToSeq
    │
    └─ 3D structure analysis
        └─ CoulombMatrix
```

#### 特征化示例

```python
# Fingerprints (for traditional ML)
fp = dc.feat.CircularFingerprint(radius=2, size=2048)

# Descriptors (for interpretable models)
desc = dc.feat.RDKitDescriptors()

# Graph features (for GNNs)
graph_feat = dc.feat.MolGraphConvFeaturizer()

# Apply featurization
features = fp.featurize(['CCO', 'c1ccccc1'])
```

**选择指南**：
- **小型数据集（<1K）**：CircularFingerprint 或 RDKitDescriptors
- **中型数据集（1K-100K）**：CircularFingerprint 或图特征化器
- **大型数据集（>100K）**：图特征化器（MolGraphConvFeaturizer、DMPNNFeaturizer）
- **迁移学习**：预训练模型特征化器（GroverFeaturizer）

有关特征化器的完整文档，请参阅 `references/api_reference.md`。

### 3. 数据划分

**重要**：对于药物发现任务，请使用 `ScaffoldSplitter`，以防止相似分子结构同时出现在训练集和测试集中而导致数据泄漏。

```python
# Scaffold splitting (recommended for molecules)
splitter = dc.splits.ScaffoldSplitter()
train, valid, test = splitter.train_valid_test_split(
    dataset,
    frac_train=0.8,
    frac_valid=0.1,
    frac_test=0.1
)

# Random splitting (for non-molecular data)
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)

# Stratified splitting (for imbalanced classification)
splitter = dc.splits.RandomStratifiedSplitter()
train, test = splitter.train_test_split(dataset)
```

**可用的划分器**：
- `ScaffoldSplitter`：按分子骨架划分（防止数据泄漏）
- `ButinaSplitter`：基于聚类的分子划分
- `MaxMinSplitter`：最大化数据集之间的多样性
- `RandomSplitter`：随机划分
- `RandomStratifiedSplitter`：保留类别分布

### 4. 模型选择与训练

#### 模型快速选择指南

| 数据集大小 | 任务 | 推荐模型 | 特征化器 |
|-------------|------|-------------------|------------|
| < 1K 个样本 | 任意 | SklearnModel（RandomForest） | CircularFingerprint |
| 1K-100K | 分类/回归 | GBDTModel 或 MultitaskRegressor | CircularFingerprint |
| > 100K | 分子性质 | GCNModel、AttentiveFPModel、DMPNNModel | MolGraphConvFeaturizer |
| 任意（优先小型数据集） | 迁移学习 | ChemBERTa、GROVER、MolFormer | 模型专用 |
| 晶体结构 | 材料性质 | CGCNNModel、MEGNetModel | 基于结构 |
| 蛋白质序列 | 蛋白质性质 | ProtBERT | 基于序列 |

#### 示例：传统机器学习
```python
from sklearn.ensemble import RandomForestRegressor

# Wrap scikit-learn model
sklearn_model = RandomForestRegressor(n_estimators=100)
model = dc.models.SklearnModel(model=sklearn_model)
model.fit(train)
```

#### 示例：深度学习
```python
# Multitask regressor (for fingerprints)
model = dc.models.MultitaskRegressor(
    n_tasks=2,
    n_features=2048,
    layer_sizes=[1000, 500],
    dropouts=0.25,
    learning_rate=0.001
)
model.fit(train, nb_epoch=50)
```

#### 示例：图神经网络
```python
# Graph Convolutional Network
model = dc.models.GCNModel(
    n_tasks=1,
    mode='regression',
    batch_size=128,
    learning_rate=0.001
)
model.fit(train, nb_epoch=50)

# Graph Attention Network
model = dc.models.GATModel(n_tasks=1, mode='classification')
model.fit(train, nb_epoch=50)

# Attentive Fingerprint
model = dc.models.AttentiveFPModel(n_tasks=1, mode='regression')
model.fit(train, nb_epoch=50)
```

### 5. MoleculeNet 基准测试

快速访问 30 多个经过整理的基准数据集，并使用标准化的训练集/验证集/测试集划分：

```python
# Load benchmark dataset
tasks, datasets, transformers = dc.molnet.load_tox21(
    featurizer='GraphConv',  # or 'ECFP', 'Weave', 'Raw'
    splitter='scaffold',     # or 'random', 'stratified'
    reload=False
)
train, valid, test = datasets

# Train and evaluate
model = dc.models.GCNModel(n_tasks=len(tasks), mode='classification')
model.fit(train, nb_epoch=50)

metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
test_score = model.evaluate(test, [metric])
```

**常用数据集**：
- **分类**：`load_tox21()`、`load_bbbp()`、`load_hiv()`、`load_clintox()`
- **回归**：`load_delaney()`、`load_freesolv()`、`load_lipo()`
- **量子属性**：`load_qm7()`、`load_qm8()`、`load_qm9()`
- **材料**：`load_perovskite()`、`load_bandgap()`、`load_mp_formation_energy()`

完整的数据集列表请参阅 `references/api_reference.md`。

### 6. 迁移学习

利用预训练模型提高性能，尤其适用于小型数据集：

```python
# ChemBERTa (RoBERTa pretrained on SMILES) — use DeepChem's Chemberta wrapper
model = dc.models.Chemberta(
    task='classification',
    tokenizer_path='seyonec/PubChem10M_SMILES_BPE_60k',
    n_tasks=1,
    learning_rate=2e-5  # passed via **kwargs to TorchModel
)
model.fit(train, nb_epoch=10)

# GROVER (graph transformer pretrained on 10M molecules)
model = dc.models.GroverModel(
    task='regression',
    n_tasks=1
)
model.fit(train, nb_epoch=20)
```

**适合使用迁移学习的情况**：
- 小型数据集（少于 1000 个样本）
- 新型分子骨架
- 计算资源有限
- 需要快速构建原型

使用 `scripts/transfer_learning.py` 脚本完成引导式迁移学习工作流。

### 7. 模型评估

```python
# Define metrics
classification_metrics = [
    dc.metrics.Metric(dc.metrics.roc_auc_score, name='ROC-AUC'),
    dc.metrics.Metric(dc.metrics.accuracy_score, name='Accuracy'),
    dc.metrics.Metric(dc.metrics.f1_score, name='F1')
]

regression_metrics = [
    dc.metrics.Metric(dc.metrics.r2_score, name='R²'),
    dc.metrics.Metric(dc.metrics.mean_absolute_error, name='MAE'),
    dc.metrics.Metric(dc.metrics.root_mean_squared_error, name='RMSE')
]

# Evaluate
train_scores = model.evaluate(train, classification_metrics)
test_scores = model.evaluate(test, classification_metrics)
```

### 8. 进行预测

```python
# Predict on test set
predictions = model.predict(test)

# Predict on new molecules
new_smiles = ['CCO', 'c1ccccc1', 'CC(C)O']
new_features = featurizer.featurize(new_smiles)
new_dataset = dc.data.NumpyDataset(X=new_features)

# Pass the training transformers to predict() to undo y-normalization
# so predictions come back in the original units. (Don't .transform()
# the X-only dataset — those transformers act on y, not the features.)
predictions = model.predict(new_dataset, transformers=transformers)
```

## 典型工作流

提供了三个可直接运行的端到端方案：
- **工作流 A — 快速基准评估**：加载 MoleculeNet 基准数据集、训练 GNN 并进行评分。
- **工作流 B — 自定义数据预测**：对 CSV 进行特征化、按骨架划分、归一化、训练和评估。
- **工作流 C — 小型数据集上的迁移学习**：使用原始 SMILES 对预训练模型进行微调。

A/B/C 的完整可运行代码：请参阅 `references/end_to_end_recipes.md`。有关八个更深入的工作流（分子生成、材料科学、蛋白质分析、自定义模型集成、超参数搜索）：请参阅 `references/workflows.md`。

## 示例脚本

此技能在 `scripts/` 目录中包含三个可用于生产环境的脚本：

### 1. `predict_solubility.py`
训练和评估溶解度预测模型。适用于 Delaney 基准数据集或自定义 CSV 数据。

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
针对分子性质预测任务微调预训练模型（ChemBERTa、GROVER）。

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

## 常见模式、最佳实践和陷阱

核心习惯：始终按骨架划分分子数据以防止数据泄漏；对特征和目标进行归一化；在扩展到深度网络和 GNN 之前，先从简单方法（随机森林 + `CircularFingerprint`）开始；使用 `BalancingTransformer` 或平衡指标处理不平衡数据；并使用较小批次的 `DiskDataset` 以避免内存问题。反复出现的故障模式——数据泄漏、GNN 表现不如指纹方法、小型数据集上的过拟合以及导入错误——都有具体的修复方法。

完整的模式方案（含代码）和陷阱到修复方法目录：请参阅 `references/best_practices.md`。

## 参考文档

此技能包含全面的参考文档：

### `references/api_reference.md`
完整的 API 文档，包括：
- 所有数据加载器及其使用场景
- 数据集类以及各自的适用情形
- 完整的特征化器目录及选择指南
- 按类别组织的模型目录（50 多个模型）
- MoleculeNet 数据集说明
- 指标和评估函数
- 常见代码模式

**何时查阅**：当你需要具体的 API 详细信息、参数名称，或希望探索可用选项时，请搜索此文件。

### `references/workflows.md`
八个详细的端到端工作流：
1. 根据 SMILES 预测分子性质
2. 使用 MoleculeNet 基准
3. 超参数优化
4. 使用预训练模型进行迁移学习
5. 使用 GAN 生成分子
6. 材料性质预测
7. 蛋白质序列分析
8. 自定义模型集成

**何时参考**：将这些工作流用作实现完整解决方案的模板。

### `references/end_to_end_recipes.md`
三个快速端到端方案（基准评估、自定义数据预测、迁移学习），包含完整的可运行代码。

**何时参考**：选择其中一个，作为构建完整流水线的起始框架。

### `references/best_practices.md`
最佳实践模式（数据拆分、归一化、模型渐进、类别平衡、内存）以及从常见问题到修复方法的故障排除目录。

**何时参考**：在调试性能不佳的问题或选择建模策略时查阅。

## 安装说明

基本安装：
```bash
uv pip install deepchem
```

对于 PyTorch 模型（GCN、GAT 等）：
```bash
uv pip install deepchem[torch]
```

安装所有功能：
```bash
uv pip install deepchem[all]
```

如果出现导入错误，用户可能需要安装特定依赖项。请查阅 DeepChem 文档以获取详细的安装说明。

## 其他资源

- 官方文档：https://deepchem.readthedocs.io/
- GitHub 仓库：https://github.com/deepchem/deepchem
- 教程：https://deepchem.readthedocs.io/en/latest/get_started/tutorials.html
- 论文："MoleculeNet：分子机器学习基准"

AlterLab Academic Skills 套件的一部分。