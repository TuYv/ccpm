---
name: alterlab-molfeat
description: Featurizes molecules for machine learning with molfeat (100+ featurizers) — ECFP/MACCS/MAP4 fingerprints, RDKit and Mordred physicochemical descriptors, and pretrained embeddings (ChemBERTa, ChemGPT, GIN) exposed as scikit-learn transformers that convert SMILES into feature vectors. Use when turning molecules into ML-ready feature matrices for QSAR/QSPR or virtual screening, or benchmarking fingerprint against descriptor and embedding representations; for training models and MoleculeNet benchmarks on those features prefer alterlab-deepchem, and for low-level fingerprint or descriptor primitives prefer alterlab-rdkit. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Molfeat - 分子特征化中心

## 概述

Molfeat 是一个全面的 Python 分子特征化库，统一提供 100 多种预训练嵌入和手工设计的特征化器。它可将化学结构（SMILES 字符串或 RDKit 分子）转换为数值表示，用于 QSAR 建模、虚拟筛选、相似性搜索和深度学习应用等机器学习任务。其特性包括快速并行处理、与 scikit-learn 兼容的转换器，以及内置缓存。

## 何时使用此 Skill

在处理以下任务时，应使用此 Skill：
- **分子机器学习**：构建 QSAR/QSPR 模型、预测性质
- **虚拟筛选**：根据生物活性对化合物库进行排序
- **相似性搜索**：查找结构相似的分子
- **化学空间分析**：聚类、可视化、降维
- **深度学习**：使用分子数据训练神经网络
- **特征化流水线**：将 SMILES 转换为可供机器学习使用的表示
- **化学信息学**：任何需要提取分子特征的任务

## 安装

```bash
uv pip install molfeat

# With all optional dependencies
uv pip install "molfeat[all]"
```

**用于特定特征化器的可选依赖项：**
- `molfeat[dgl]` - GNN 模型（GIN 变体）
- `molfeat[graphormer]` - Graphormer 模型
- `molfeat[transformer]` - ChemBERTa、ChemGPT、MolT5
- `molfeat[fcd]` - FCD 描述符
- `molfeat[map4]` - MAP4 指纹

## 核心概念

Molfeat 将特征化功能组织为三个层次化的类：

### 1. 计算器（`molfeat.calc`）

将单个分子转换为特征向量的可调用对象。接受 RDKit `Chem.Mol` 对象或 SMILES 字符串。

**计算器适用于：**
- 单分子特征化
- 自定义处理循环
- 直接计算特征

**示例：**
```python
from molfeat.calc import FPCalculator

calc = FPCalculator("ecfp", radius=3, fpSize=2048)
features = calc("CCO")  # Returns numpy array (2048,)
```

### 2. 转换器（`molfeat.trans`）

与 scikit-learn 兼容的转换器，封装计算器以通过并行化进行批量处理。

**转换器适用于：**
- 对分子数据集进行批量特征化
- 与 scikit-learn 流水线集成
- 并行处理（自动利用 CPU）

**示例：**
```python
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator

transformer = MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)
features = transformer(smiles_list)  # Parallel processing
```

### 3. 预训练转换器（`molfeat.trans.pretrained`）

面向深度学习模型的专用转换器，支持批量推理和缓存。

**预训练转换器适用于：**
- 最先进的分子嵌入
- 从大型化学数据集进行迁移学习
- 深度学习特征提取

**示例：**
```python
from molfeat.trans.pretrained import PretrainedMolTransformer

transformer = PretrainedMolTransformer("ChemBERTa-77M-MLM", n_jobs=-1)
embeddings = transformer(smiles_list)  # Deep learning embeddings
```

## 快速入门工作流

### 基础特征化

```python
import datamol as dm
from molfeat.calc import FPCalculator
from molfeat.trans import MoleculeTransformer

# Load molecular data
smiles = ["CCO", "CC(=O)O", "c1ccccc1", "CC(C)O"]

# Create calculator and transformer
calc = FPCalculator("ecfp", radius=3)
transformer = MoleculeTransformer(calc, n_jobs=-1)

# Featurize molecules
features = transformer(smiles)
print(f"Shape: {features.shape}")  # (4, 2048)
```

### 保存和加载配置

```python
# Save featurizer configuration for reproducibility
transformer.to_state_yaml_file("featurizer_config.yml")

# Reload exact configuration
loaded = MoleculeTransformer.from_state_yaml_file("featurizer_config.yml")
```

### 妥善处理错误

```python
# Process dataset with potentially invalid SMILES
transformer = MoleculeTransformer(
    calc,
    n_jobs=-1,
    ignore_errors=True,  # Continue on failures
    verbose=True          # Log error details
)

features = transformer(smiles_with_errors)
# Returns None for failed molecules
```

## 选择合适的特征化器

### 用于传统机器学习（RF、SVM、XGBoost）

**从指纹开始：**
```python
# ECFP - Most popular, general-purpose
FPCalculator("ecfp", radius=3, fpSize=2048)

# MACCS - Fast, good for scaffold hopping
FPCalculator("maccs")

# MAP4 - Efficient for large-scale screening
FPCalculator("map4")
```

**用于可解释模型：**
```python
# RDKit 2D descriptors (200+ named properties)
from molfeat.calc import RDKitDescriptors2D
RDKitDescriptors2D()

# Mordred (1800+ comprehensive descriptors)
from molfeat.calc import MordredDescriptors
MordredDescriptors()
```

**组合多个特征化器：**
```python
from molfeat.trans import FeatConcat

concat = FeatConcat([
    FPCalculator("maccs"),      # 167 dimensions
    FPCalculator("ecfp")         # 2048 dimensions
])  # Result: 2215-dimensional combined features
```

### 用于深度学习

**基于 Transformer 的嵌入：**
```python
# ChemBERTa - Pre-trained on 77M PubChem compounds
PretrainedMolTransformer("ChemBERTa-77M-MLM")

# ChemGPT - Autoregressive language model
PretrainedMolTransformer("ChemGPT-1.2B")
```

**图神经网络：**
```python
# GIN models with different pre-training objectives
PretrainedMolTransformer("gin-supervised-masking")
PretrainedMolTransformer("gin-supervised-infomax")

# Graphormer for quantum chemistry
PretrainedMolTransformer("Graphormer-pcqm4mv2")
```

### 用于相似性搜索

```python
# ECFP - General purpose, most widely used
FPCalculator("ecfp")

# MACCS - Fast, scaffold-based similarity
FPCalculator("maccs")

# MAP4 - Efficient for large databases
FPCalculator("map4")

# USR/USRCAT - 3D shape similarity
from molfeat.calc import USRDescriptors
USRDescriptors()
```

### 用于基于药效团的方法

```python
# FCFP - Functional group based
FPCalculator("fcfp")

# CATS - Pharmacophore pair distributions
from molfeat.calc import CATSCalculator
CATSCalculator(mode="2D")

# Gobbi - Explicit pharmacophore features
FPCalculator("gobbi2D")
```

## 常见工作流与高级模式

端到端方案（QSAR 模型构建、虚拟筛选、相似性搜索、scikit-learn 流水线集成、特征化器比较）、ModelStore 探索以及高级用法（自定义预处理、分块批处理、缓存计算成本高昂的嵌入）已移至其他文档，以保持本文简洁。

可直接复制使用的完整工作流和高级模式方案：请参阅 `references/workflows_and_patterns.md`。其他可运行示例（PyTorch 训练、网格搜索、3D 构象）位于 `references/examples.md`。

## 性能技巧

1. **使用并行化**：设置 `n_jobs=-1` 以利用所有 CPU 核心
2. **批处理**：一次处理多个分子，而不是使用循环
3. **选择合适的特征化器**：指纹的速度快于深度学习模型
4. **缓存预训练模型**：利用内置缓存以供重复使用
5. **使用 float32**：在精度允许的情况下设置 `dtype=np.float32`
6. **高效处理错误**：对于大型数据集，使用 `ignore_errors=True`

## 常用特征化器参考

**常用特征化器快速参考：**

| 特征化器 | 类型 | 维度 | 速度 | 用例 |
|------------|------|------------|-------|----------|
| `ecfp` | 指纹 | 2048 | 快 | 通用 |
| `maccs` | 指纹 | 167 | 非常快 | 骨架相似性 |
| `desc2D` | 描述符 | 200+ | 快 | 可解释模型 |
| `mordred` | 描述符 | 1800+ | 中等 | 综合特征 |
| `map4` | 指纹 | 1024 | 快 | 大规模筛选 |
| `ChemBERTa-77M-MLM` | 深度学习 | 768 | 慢* | 迁移学习 |
| `gin-supervised-masking` | GNN | 可变 | 慢* | 基于图的模型 |

*首次运行较慢；后续运行可受益于缓存

## 资源

此技能包含全面的参考文档：

### references/api_reference.md
完整的 API 文档，涵盖：
- `molfeat.calc` - 所有计算器类和参数
- `molfeat.trans` - 转换器类和方法
- `molfeat.store` - ModelStore 用法
- 常见模式和集成示例
- 性能优化技巧

**何时加载：** 在实现特定计算器、了解转换器参数或与 scikit-learn/PyTorch 集成时参考。

### references/available_featurizers.md
按类别组织的全部 100 多种特征化器的综合目录：
- 基于 Transformer 的语言模型（ChemBERTa、ChemGPT）
- 图神经网络（GIN、Graphormer）
- 分子描述符（RDKit、Mordred）
- 指纹（ECFP、MACCS、MAP4 以及其他 15 种以上）
- 药效团描述符（CATS、Gobbi）
- 形状描述符（USR、ElectroShape）
- 基于骨架的描述符

**何时加载：** 在为特定任务选择最佳特征化器、探索可用选项或了解特征化器特性时参考。

**搜索提示：** 使用 grep 查找特定类型的特征化器：
```bash
grep -i "chembert" references/available_featurizers.md
grep -i "pharmacophore" references/available_featurizers.md
```

### references/examples.md
常见场景的实用代码示例：
- 安装和快速入门
- 计算器和转换器示例
- 预训练模型的使用
- Scikit-learn 和 PyTorch 集成
- 虚拟筛选工作流
- QSAR 模型构建
- 相似性搜索
- 故障排除和最佳实践

**何时加载：** 在实现特定工作流、排查问题或学习 molfeat 模式时参考。

## 故障排除

### 无效分子
启用错误处理以跳过无效的 SMILES：
```python
transformer = MoleculeTransformer(
    calc,
    ignore_errors=True,
    verbose=True
)
```

### 大型数据集的内存问题
对于包含超过 100K 个分子的数据集，请分块处理或使用流式处理方法。

### 预训练模型依赖项
某些模型需要额外的软件包。安装特定的可选依赖：
```bash
uv pip install "molfeat[transformer]"  # For ChemBERTa/ChemGPT
uv pip install "molfeat[dgl]"          # For GIN models
```

### 可复现性
保存准确的配置并记录版本：
```python
transformer.to_state_yaml_file("config.yml")
import molfeat
print(f"molfeat version: {molfeat.__version__}")
```

## 其他资源

- **官方文档**：https://molfeat-docs.datamol.io/
- **GitHub 仓库**：https://github.com/datamol-io/molfeat
- **PyPI 软件包**：https://pypi.org/project/molfeat/
- **教程**：https://portal.valencelabs.com/datamol/post/types-of-featurizers-b1e8HHrbFMkbun6