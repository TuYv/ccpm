---
name: alterlab-torchdrug
description: Builds PyTorch-native graph neural networks with TorchDrug for molecules and proteins, exposing custom GNN architectures, task/dataset abstractions, molecular generation, retrosynthesis planning, and knowledge-graph reasoning. Use when developing custom graph model layers, predicting protein properties from sequence or structure, or building retrosynthesis and drug-repurposing pipelines; for ready-made featurizers, MoleculeNet benchmarks, and pre-trained models with less code prefer alterlab-deepchem. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs locally, no API key or account required. TorchDrug 0.2.1 requires Python >=3.7,<3.11 (use `uv venv --python 3.10`)."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# TorchDrug

## 概述

TorchDrug 是一个全面的、基于 PyTorch 的药物发现与分子科学机器学习工具箱。它可将图神经网络、预训练模型和任务定义应用于分子、蛋白质及生物知识图谱，涵盖分子性质预测、蛋白质建模、知识图谱推理、分子生成和逆合成规划，并提供 40 多个精选数据集和 20 多种模型架构。

## 何时使用此 Skill

处理以下内容时，应使用此 Skill：

**数据类型：**
- SMILES 字符串或分子结构
- 蛋白质序列或三维结构（PDB 文件）
- 化学反应和逆合成
- 生物医学知识图谱
- 药物发现数据集

**任务：**
- 预测分子性质（溶解度、毒性、活性）
- 蛋白质功能或结构预测
- 药物-靶点结合预测
- 生成新的分子结构
- 规划化学合成路线
- 生物医学知识库中的链接预测
- 使用科学数据训练图神经网络

**库与集成：**
- TorchDrug 是主要使用的库
- 通常与 RDKit 一起用于化学信息学
- 与 PyTorch 和 PyTorch Lightning 兼容
- 针对蛋白质任务与 AlphaFold 和 ESM 集成

## 入门指南

### 安装

```bash
# TorchDrug 0.2.1 (last release, Jul 2023) requires Python >=3.7,<3.11 and
# torch >=1.8. It will NOT solve on Python 3.11+ — pin an older interpreter:
uv venv --python 3.10
uv pip install torchdrug==0.2.1 torch
```

注意事项：
- 如果求解器遇到困难，请先安装 `torch`；TorchDrug 会基于已安装的 torch 构建图操作。
- TorchDrug 自带 `data.DataLoader`、`data.Graph` 和 `core.Engine`——请使用这些组件，而不是直接使用对应的 PyTorch 组件（参见下方循环）。
- 截至 2025 年，该项目已无人维护；对于新的 Python/torch 技术栈，请考虑使用 `alterlab-torch-geometric` 或 `alterlab-deepchem`。当你明确需要 TorchDrug 的任务/数据集抽象时，请使用此 Skill。

### 快速示例

```python
import torch
from torchdrug import data, datasets, models, tasks

# Load molecular dataset
dataset = datasets.BBBP("~/molecule-datasets/")
train_set, valid_set, test_set = dataset.split()

# Define GNN model
model = models.GIN(
    input_dim=dataset.node_feature_dim,
    hidden_dims=[256, 256, 256],
    edge_input_dim=dataset.edge_feature_dim,
    batch_norm=True,
    readout="mean"
)

# Create property prediction task
task = tasks.PropertyPrediction(
    model,
    task=dataset.tasks,
    criterion="bce",
    metric=["auroc", "auprc"]
)

# Train with a native PyTorch loop.
# NOTE: use torchdrug.data.DataLoader (NOT torch.utils.data.DataLoader) — its
# default graph_collate packs data.Graph objects; the stock PyTorch collate cannot.
optimizer = torch.optim.Adam(task.parameters(), lr=1e-3)
train_loader = data.DataLoader(train_set, batch_size=32, shuffle=True)

for epoch in range(100):
    for batch in train_loader:
        # task.forward returns (loss, metric), not a bare tensor.
        loss, metric = task(batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

对于标准（非自定义）路径，`core.Engine(task, train_set, valid_set, test_set, optimizer, batch_size=...)` 会封装此循环，并处理批处理和设备管理。当你需要完全控制训练步骤时，请使用上面的手动循环。

## 核心能力

### 1. 分子性质预测

根据分子结构预测其化学、物理和生物性质。

**使用场景：**
- 类药性和 ADMET 性质
- 毒性筛选
- 量子化学性质
- 结合亲和力预测

**关键组件：**
- 20 多个分子数据集（BBBP、HIV、Tox21、QM9 等）
- GNN 模型（GIN、GAT、SchNet）
- PropertyPrediction 和 MultipleBinaryClassification 任务

**参考：** 有关以下内容，请参阅 `references/molecular_property_prediction.md`：
- 完整的数据集目录
- 模型选择指南
- 训练工作流和最佳实践
- 特征工程详情

### 2. 蛋白质建模

处理蛋白质序列、结构和性质。

**使用场景：**
- 酶功能预测
- 蛋白质稳定性和溶解性
- 亚细胞定位
- 蛋白质-蛋白质相互作用
- 结构预测

**关键组件：**
- 15 多个蛋白质数据集（EnzymeCommission、GeneOntology、PDBBind 等）
- 序列模型（ESM、ProteinBERT、ProteinLSTM）
- 结构模型（GearNet、SchNet）
- 适用于不同预测层级的多种任务类型

**参考：** 有关以下内容，请参阅 `references/protein_modeling.md`：
- 蛋白质专用数据集
- 序列模型与结构模型的对比
- 预训练策略
- 与 AlphaFold 和 ESM 的集成

### 3. 知识图谱推理

预测生物知识图谱中缺失的链接和关系。

**使用场景：**
- 药物重定位
- 疾病机制发现
- 基因-疾病关联
- 生物医学多跳推理

**关键组件：**
- 通用知识图谱（FB15k、WN18）和生物医学知识图谱（Hetionet）
- 嵌入模型（TransE、RotatE、ComplEx）
- KnowledgeGraphCompletion 任务

**参考：** 有关以下内容，请参阅 `references/knowledge_graphs.md`：
- 知识图谱数据集（包括拥有 4.5 万个生物医学实体的 Hetionet）
- 嵌入模型比较
- 评估指标和协议
- 生物医学应用

### 4. 分子生成

生成具有所需性质的新型分子结构。

**使用场景：**
- 从头药物设计
- 先导化合物优化
- 化学空间探索
- 性质引导的生成

**关键组件：**
- 自回归生成
- GCPN（基于策略的生成）
- GraphAutoregressiveFlow
- 性质优化工作流

**参考：** 有关以下内容，请参阅 `references/molecular_generation.md`：
- 生成策略（无条件、条件式、基于骨架）
- 多目标优化
- 验证和过滤
- 与性质预测的集成

### 5. 逆合成

预测从目标分子到起始材料的合成路线。

**使用场景：**
- 合成规划
- 路线优化
- 合成可及性评估
- 多步规划

**关键组件：**
- USPTO-50k 反应数据集
- CenterIdentification（反应中心预测）
- SynthonCompletion（反应物预测）
- 端到端 Retrosynthesis 流水线

**参考：** 有关以下内容，请参阅 `references/retrosynthesis.md`：
- 任务分解（中心 ID → 合成子补全）
- 多步合成规划
- 商业可用性检查
- 与其他逆合成工具集成

### 6. 图神经网络模型

针对不同数据类型和任务的 GNN 架构完整目录。

**可用模型：**
- 通用 GNN：GCN、GAT、GIN、RGCN、MPNN
- 具备 3D 感知能力的模型：SchNet、GearNet
- 蛋白质专用模型：ESM、ProteinBERT、GearNet
- 知识图谱模型：TransE、RotatE、ComplEx、SimplE
- 生成式模型：GraphAutoregressiveFlow

**参考：** 有关以下内容，请参阅 `references/models_architectures.md`：
- 详细的模型说明
- 按任务和数据集分类的模型选择指南
- 架构对比
- 实现技巧

### 7. 数据集

40 多个精选数据集，涵盖化学、生物学和知识图谱。

**类别：**
- 分子属性（药物发现、量子化学）
- 蛋白质属性（功能、结构、相互作用）
- 知识图谱（通用和生物医学）
- 逆合成反应

**参考：** 有关以下内容，请参阅 `references/datasets.md`：
- 包含规模和任务信息的完整数据集目录
- 数据集选择指南
- 加载和预处理
- 划分策略（随机、骨架）

## 常见工作流

### 工作流 1：分子属性预测

**场景：** 预测候选药物的血脑屏障穿透能力。

**步骤：**
1. 加载数据集：`datasets.BBBP()`
2. 选择模型：对分子图使用 GIN
3. 定义任务：使用二分类的 `PropertyPrediction`
4. 使用骨架划分进行训练，以获得符合实际情况的评估结果
5. 使用 AUROC 和 AUPRC 进行评估

**导航：** `references/molecular_property_prediction.md` → 数据集选择 → 模型选择 → 训练

### 工作流 2：蛋白质功能预测

**场景：** 根据序列预测酶功能。

**步骤：**
1. 加载数据集：`datasets.EnzymeCommission()`
2. 选择模型：ESM（预训练）或 GearNet（包含结构信息）
3. 定义任务：使用多分类的 `PropertyPrediction`
4. 微调预训练模型或从头开始训练
5. 使用准确率和各类别指标进行评估

**导航：** `references/protein_modeling.md` → 模型选择（序列与结构）→ 预训练策略

### 工作流 3：通过知识图谱进行药物重定位

**场景：** 在 Hetionet 中寻找新的疾病治疗方案。

**步骤：**
1. 加载数据集：`datasets.Hetionet()`
2. 选择模型：RotatE 或 ComplEx
3. 定义任务：`KnowledgeGraphCompletion`
4. 使用负采样进行训练
5. 查询“Compound-treats-Disease”预测结果
6. 根据合理性和作用机制进行筛选

**导航：** `references/knowledge_graphs.md` → Hetionet 数据集 → 模型选择 → 生物医学应用

### 工作流 4：从头生成分子

**场景：** 生成针对靶标结合进行优化的类药分子。

**步骤：**
1. 使用活性数据训练属性预测器
2. 选择生成方法：使用 GCPN 进行基于强化学习的优化
3. 定义结合亲和力、类药性和可合成性的奖励函数
4. 在属性约束下生成候选分子
5. 验证化学合理性，并按类药性进行筛选
6. 按多目标评分进行排序

**导航：** `references/molecular_generation.md` → 条件生成 → 多目标优化

### 工作流 5：逆合成规划

**场景：** 为目标分子规划合成路线。

**步骤：**
1. 加载数据集：`datasets.USPTO50k()`
2. 训练反应中心识别模型（RGCN）
3. 训练合成子补全模型（GIN）
4. 组合成端到端逆合成流水线
5. 递归应用以进行多步规划
6. 检查构建模块的商业可用性

**导航：** `references/retrosynthesis.md` → 任务类型 → 多步规划

## 集成模式

### 与 RDKit 集成

在 TorchDrug 分子与 RDKit 之间进行转换：
```python
from torchdrug import data
from rdkit import Chem

# SMILES → TorchDrug molecule
smiles = "CCO"
mol = data.Molecule.from_smiles(smiles)

# TorchDrug → RDKit
rdkit_mol = mol.to_molecule()

# RDKit → TorchDrug
rdkit_mol = Chem.MolFromSmiles(smiles)
mol = data.Molecule.from_molecule(rdkit_mol)
```

### 与 AlphaFold/ESM 集成

使用预测的结构：
```python
from torchdrug import data, layers
from torchdrug.layers import geometry

# Load AlphaFold predicted structure
protein = data.Protein.from_pdb("AF-P12345-F1-model_v4.pdb")

# Build a residue-level graph with sequential + spatial edges
graph_construction_model = layers.GraphConstruction(
    node_layers=[geometry.AlphaCarbonNode()],
    edge_layers=[
        geometry.SpatialEdge(radius=10.0, min_distance=5),
        geometry.SequentialEdge(max_distance=2),
    ],
    edge_feature="gearnet",
)
# GraphConstruction operates on a packed protein batch, not a bare Protein.
graph = graph_construction_model(data.Protein.pack([protein]))
```

### 与 PyTorch Lightning 集成

封装任务以使用 Lightning 进行训练：
```python
import pytorch_lightning as pl

class LightningTask(pl.LightningModule):
    def __init__(self, torchdrug_task):
        super().__init__()
        self.task = torchdrug_task

    def training_step(self, batch, batch_idx):
        return self.task(batch)

    def validation_step(self, batch, batch_idx):
        pred = self.task.predict(batch)
        target = self.task.target(batch)
        return {"pred": pred, "target": target}

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)
```

## 技术细节

如需深入了解 TorchDrug 的架构：

**核心概念：** 请参阅 `references/core_concepts.md`，其中包括：
- 架构理念（模块化、可配置）
- 数据结构（Graph、Molecule、Protein、PackedGraph）
- 模型接口和前向函数签名
- 任务接口（predict、target、forward、evaluate）
- 训练工作流和最佳实践
- 损失函数和指标
- 常见问题和调试

## 快速参考速查表

**选择数据集：**
- 分子属性 → `references/datasets.md` → 分子部分
- 蛋白质任务 → `references/datasets.md` → 蛋白质部分
- 知识图谱 → `references/datasets.md` → 知识图谱部分

**选择模型：**
- 分子 → `references/models_architectures.md` → GNN 部分 → GIN/GAT/SchNet
- 蛋白质（序列）→ `references/models_architectures.md` → 蛋白质部分 → ESM
- 蛋白质（结构）→ `references/models_architectures.md` → 蛋白质部分 → GearNet
- 知识图谱 → `references/models_architectures.md` → KG 部分 → RotatE/ComplEx

**常见任务：**
- 属性预测 → `references/molecular_property_prediction.md` 或 `references/protein_modeling.md`
- 生成 → `references/molecular_generation.md`
- 逆合成 → `references/retrosynthesis.md`
- 知识图谱推理 → `references/knowledge_graphs.md`

**了解架构：**
- 数据结构 → `references/core_concepts.md` → 数据结构
- 模型设计 → `references/core_concepts.md` → 模型接口
- 任务设计 → `references/core_concepts.md` → 任务接口

## 常见问题排查

**问题：维度不匹配错误**
→ 检查 `model.input_dim` 是否与 `dataset.node_feature_dim` 匹配
→ 参见 `references/core_concepts.md` → 基本属性

**问题：分子任务表现不佳**
→ 使用骨架划分，而不是随机划分
→ 尝试使用 GIN 代替 GCN
→ 参见 `references/molecular_property_prediction.md` → 最佳实践

**问题：蛋白质模型无法学习**
→ 对于序列任务，使用预训练的 ESM
→ 对于结构模型，检查边的构建
→ 参见 `references/protein_modeling.md` → 训练工作流

**问题：处理大型图时出现内存错误**
→ 减小批次大小
→ 使用梯度累积
→ 参见 `references/core_concepts.md` → 内存效率

**问题：生成的分子无效**
→ 添加有效性约束
→ 使用 RDKit 验证进行后处理
→ 参见 `references/molecular_generation.md` → 验证与筛选

## 资源

**官方文档：** https://torchdrug.ai/docs/
**GitHub：** https://github.com/DeepGraphLearning/torchdrug
**论文：** TorchDrug：一个强大而灵活的药物发现机器学习平台

## 总结

根据你的任务，前往相应的参考文件：

1. **分子属性预测** → `molecular_property_prediction.md`
2. **蛋白质建模** → `protein_modeling.md`
3. **知识图谱** → `knowledge_graphs.md`
4. **分子生成** → `molecular_generation.md`
5. **逆合成** → `retrosynthesis.md`
6. **模型选择** → `models_architectures.md`
7. **数据集选择** → `datasets.md`
8. **技术细节** → `core_concepts.md`

每个参考文件都通过示例、最佳实践和常见用例全面介绍了其对应领域。