---
name: alterlab-pytdc
description: Loads Therapeutics Data Commons (TDC, PyTDC) AI-ready drug-discovery datasets and benchmarks — ADME, toxicity, drug-target interaction (DTI), scaffold splits, and molecular oracles for therapeutic ML and pharmacological prediction. Use when fetching a standardized benchmark dataset, applying scaffold or cold-split evaluation, or sourcing labeled molecules for ADMET, toxicity, or DTI modeling. Sources data, splits, and oracles only — defer molecular featurization (ECFP/fingerprints), model training, and transformers to a molecular-ML skill (e.g. deepchem). Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# PyTDC（治疗学数据共享平台）

## 概述

PyTDC 是一个开放科学平台，为药物发现与开发提供可直接用于 AI 的数据集和基准。该平台提供覆盖整个治疗药物研发流程的精选数据集，并配有标准化评估指标和具有实际意义的数据划分方式。这些数据集分为三类：单实例预测（分子/蛋白质属性）、多实例预测（药物-靶点相互作用、DDI）和生成（分子生成、逆合成）。

## 何时使用此技能

此技能适用于以下情况：
- 使用药物发现或治疗学机器学习数据集
- 在标准化制药任务上对机器学习模型进行基准测试
- 预测分子属性（ADME、毒性、生物活性）
- 预测药物-靶点或药物-药物相互作用
- 生成具有所需属性的新型分子
- 访问具有适当训练集/测试集划分（骨架划分、冷启动划分）的精选数据集
- 使用分子预言机进行属性优化

## 安装与设置

使用 pip 安装 PyTDC：

```bash
uv pip install PyTDC
```

升级到最新版本：

```bash
uv pip install PyTDC --upgrade
```

核心依赖项（自动安装）：
- numpy、pandas、tqdm、seaborn、scikit_learn、fuzzywuzzy

特定功能所需的其他软件包会在需要时自动安装。

## 快速入门

访问任意 TDC 数据集的基本模式均遵循以下结构：

```python
from tdc.<problem> import <Task>
data = <Task>(name='<Dataset>')
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])
df = data.get_data(format='df')
```

其中：
- `<problem>`：`single_pred`、`multi_pred` 或 `generation` 之一
- `<Task>`：具体任务类别（例如 ADME、DTI、MolGen）
- `<Dataset>`：该任务中的数据集名称

**示例 - 加载 ADME 数据：**

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')
split = data.get_split(method='scaffold')
# Returns dict with 'train', 'valid', 'test' DataFrames
```

## 单实例预测任务

单实例预测是指预测单个生物医学实体（分子、蛋白质等）的属性。

### 可用任务类别

#### 1. ADME（吸收、分布、代谢、排泄）

预测药物分子的药代动力学属性。

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')  # Intestinal permeability
# Other datasets: HIA_Hou, Bioavailability_Ma, Lipophilicity_AstraZeneca, etc.
```

**常见 ADME 数据集：**
- Caco2 - 肠道通透性
- HIA - 人体肠道吸收
- Bioavailability - 口服生物利用度
- Lipophilicity - 辛醇-水分配系数
- Solubility - 水溶解度
- BBB - 血脑屏障渗透性
- CYP - 细胞色素 P450 代谢

#### 2. 毒性（Tox）

预测化合物的毒性和不良反应。

```python
from tdc.single_pred import Tox
data = Tox(name='hERG')  # Cardiotoxicity
# Other datasets: AMES, DILI, Carcinogens_Lagunin, etc.
```

**常见毒性数据集：**
- hERG - 心脏毒性
- AMES - 致突变性
- DILI - 药物性肝损伤
- Carcinogens - 致癌性
- ClinTox - 临床试验毒性

#### 3. HTS（高通量筛选）

基于筛选数据的生物活性预测。

```python
from tdc.single_pred import HTS
data = HTS(name='SARSCoV2_Vitro_Touret')
```

#### 4. QM（量子力学）

分子的量子力学性质。

```python
from tdc.single_pred import QM
data = QM(name='QM7')
```

#### 5. 其他单实例预测任务

- **Yields**：化学反应产率预测
- **Epitope**：生物制剂的表位预测
- **Develop**：开发阶段预测
- **CRISPROutcome**：基因编辑结果预测

### 数据格式

单实例预测数据集通常返回包含以下列的 DataFrame：
- `Drug_ID` 或 `Compound_ID`：唯一标识符
- `Drug` 或 `X`：SMILES 字符串或分子表示
- `Y`：目标标签（连续值或二元值）

## 多实例预测任务

多实例预测涉及对多个生物医学实体之间相互作用的性质进行预测。

### 可用任务类别

#### 1. DTI（药物-靶点相互作用）

预测药物与蛋白质靶点之间的结合亲和力。

```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')
split = data.get_split()
# Cold-drug split (test set has only unseen drugs):
cold = data.get_split(method='cold_split', column_name='Drug')
```

**可用数据集：**
- BindingDB_Kd - 解离常数（52,284 个配对）
- BindingDB_IC50 - 半数最大抑制浓度（991,486 个配对）
- BindingDB_Ki - 抑制常数（375,032 个配对）
- DAVIS、KIBA - 激酶结合数据集

**数据格式：** Drug_ID、Target_ID、Drug（SMILES）、Target（序列）、Y（结合亲和力）

#### 2. DDI（药物-药物相互作用）

预测药物对之间的相互作用。

```python
from tdc.multi_pred import DDI
data = DDI(name='DrugBank')
split = data.get_split()
```

该任务是预测相互作用类型的多分类任务。数据集包含由 1,706 种药物构成的 191,808 个 DDI 配对。

#### 3. PPI（蛋白质-蛋白质相互作用）

预测蛋白质-蛋白质相互作用。

```python
from tdc.multi_pred import PPI
data = PPI(name='HuRI')
```

#### 4. 其他多实例预测任务

- **GDA**：基因-疾病关联
- **DrugRes**：耐药性预测
- **DrugSyn**：药物协同作用预测
- **PeptideMHC**：肽-MHC 结合
- **AntibodyAff**：抗体亲和力预测
- **MTI**：miRNA-靶点相互作用
- **Catalyst**：催化剂预测
- **TrialOutcome**：临床试验结果预测

## 生成任务

生成任务涉及创建具有所需性质的新型生物医学实体。

### 1. 分子生成（MolGen）

生成具有理想化学性质的多样化新型分子。

```python
from tdc.generation import MolGen
data = MolGen(name='ChEMBL_V29')
split = data.get_split()
```

与预言机结合使用，以针对特定性质进行优化：

```python
from tdc import Oracle
oracle = Oracle(name='GSK3B')
score = oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')  # Evaluate SMILES
```

有关所有可用的预言机函数，请参阅 `references/oracles.md`。

### 2. 逆合成（RetroSyn）

预测合成目标分子所需的反应物。

```python
from tdc.generation import RetroSyn
data = RetroSyn(name='USPTO')
split = data.get_split()
```

该数据集包含来自 USPTO 数据库的 1,939,253 个反应。

### 3. 配对分子生成

生成分子对（例如前药-药物对）。

```python
from tdc.generation import PairMolGen
data = PairMolGen(name='Prodrug')
```

有关详细的预言机文档和分子生成工作流，请参阅 `references/oracles.md` 和 `scripts/molecular_generation.py`。

## 基准组

基准组提供经过整理的相关数据集集合，用于系统化的模型评估。

### ADMET 基准组

```python
from tdc.benchmark_group import admet_group
group = admet_group(path='data/')

predictions_list = []
for seed in [1, 2, 3, 4, 5]:
    benchmark = group.get('Caco2_Wang')
    name = benchmark['name']
    # train_val is split into train/valid per seed; test is FIXED across seeds.
    train_val, test = benchmark['train_val'], benchmark['test']
    train, valid = group.get_train_valid_split(
        benchmark=name, split_type='default', seed=seed
    )
    # Train model here, then predict on `test`
    predictions = {name: model.predict(test)}  # dict keyed by benchmark name
    predictions_list.append(predictions)

# Evaluate across the 5 seeds → {'caco2_wang': [mean, std]}
results = group.evaluate_many(predictions_list)
```

请注意其结构：`group.get(name)` 返回一个包含 `name`、`train_val`、`test` 键的字典（而不是以种子为键的字典）。每个种子的训练集/验证集划分来自 `group.get_train_valid_split(...)`；`test` 集保持固定。每个种子的预测结果都放入一个以基准名称为键的字典中；将这些字典收集到一个列表中，并传递给 `group.evaluate_many(...)`。（仅针对单种子提交字典使用 `group.evaluate(predictions)`。）

**ADMET 组包含 22 个数据集**，涵盖吸收、分布、代谢、排泄和毒性。

### 其他基准组

可用的基准组包括以下方面的数据集集合：
- ADMET 属性
- 药物-靶点相互作用
- 药物组合预测
- 以及更专业的治疗任务

有关基准评估工作流，请参阅 `scripts/benchmark_evaluation.py`。

## 数据函数

TDC 提供全面的数据处理实用工具，分为四类。

### 1. 数据集划分

使用不同策略获取训练集/验证集/测试集分区：

```python
# Scaffold split (default for most tasks)
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])

# Random split
split = data.get_split(method='random', seed=42, frac=[0.8, 0.1, 0.1])

# Cold split (for DTI/DDI tasks) — pick the held-out entity via column_name
split = data.get_split(method='cold_split', column_name='Drug', seed=1)    # Unseen drugs in test
split = data.get_split(method='cold_split', column_name='Target', seed=1)  # Unseen targets in test
# Pass a list to hold out multiple entities: column_name=['Drug', 'Target']
```

**可用的划分策略：**
- `random`：随机打乱
- `scaffold`：基于骨架的划分（Bemis-Murcko，用于保证化学多样性）
- `cold_split`：用于 DTI/DDI 任务——将 `column_name` 设置为希望在测试集中未出现过的实体（`'Drug'`、`'Target'` 或列表）
- `combination`：用于药物组合数据集

### 2. 模型评估

使用标准化指标进行评估：

```python
from tdc import Evaluator

# For binary classification
evaluator = Evaluator(name='ROC-AUC')
score = evaluator(y_true, y_pred)

# For regression
evaluator = Evaluator(name='RMSE')
score = evaluator(y_true, y_pred)
```

**可用指标：** ROC-AUC、PR-AUC、F1、Accuracy、RMSE、MAE、R2、Spearman、Pearson 等。

### 3. 数据处理

TDC 提供 11 个关键处理工具：

```python
from tdc.chem_utils import MolConvert

# Molecule format conversion
converter = MolConvert(src='SMILES', dst='PyG')
pyg_graph = converter('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

**处理工具包括：**
- 分子格式转换（SMILES、SELFIES、PyG、DGL、ECFP 等）
- 分子过滤器（PAINS、类药性）
- 标签二值化和单位转换
- 数据平衡（过采样/欠采样）
- 配对数据的负采样
- 图转换
- 实体检索（CID 转 SMILES、UniProt 转序列）

如需完整的工具文档，请参阅 `references/utilities.md`。

### 4. 分子生成预言机

TDC 为分子优化提供 17 个以上的预言机函数：

```python
from tdc import Oracle

# Single oracle
oracle = Oracle(name='DRD2')
score = oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')

# Multiple oracles
oracle = Oracle(name='JNK3')
scores = oracle(['SMILES1', 'SMILES2', 'SMILES3'])
```

如需完整的预言机文档，请参阅 `references/oracles.md`。

## 高级功能

### 检索可用数据集

```python
from tdc.utils import retrieve_dataset_names

# Get all ADME datasets
adme_datasets = retrieve_dataset_names('ADME')

# Get all DTI datasets
dti_datasets = retrieve_dataset_names('DTI')
```

### 标签转换

```python
from tdc.utils import get_label_map
label_map = get_label_map(name='DrugBank', task='DDI')

# Unit/log conversion is done via methods ON the dataset object, not a standalone import:
data = DTI(name='DAVIS')
data.convert_to_log(form='binding')   # e.g. Kd (nM) -> pKd; convert_from_log() reverses it
```

### 数据库查询

```python
from tdc.utils import cid2smiles, uniprot2seq

# Convert PubChem CID to SMILES
smiles = cid2smiles(2244)

# Convert UniProt ID to amino acid sequence
sequence = uniprot2seq('P12345')
```

## 常见工作流

### 工作流 1：训练单个预测模型

完整示例请参阅 `scripts/load_and_split_data.py`：

```python
from tdc.single_pred import ADME
from tdc import Evaluator

# Load data
data = ADME(name='Caco2_Wang')
split = data.get_split(method='scaffold', seed=42)

train, valid, test = split['train'], split['valid'], split['test']

# Train model (user implements)
# model.fit(train['Drug'], train['Y'])

# Evaluate
evaluator = Evaluator(name='MAE')
# score = evaluator(test['Y'], predictions)
```

### 工作流 2：基准评估

有关使用多个随机种子和规范评估协议的完整示例，请参阅 `scripts/benchmark_evaluation.py`。

### 工作流 3：使用预言机进行分子生成

有关使用预言机函数进行目标导向生成的示例，请参阅 `scripts/molecular_generation.py`。

## 资源

此技能包含适用于常见 TDC 工作流的配套资源：

### scripts/

- `load_and_split_data.py`：使用各种策略加载和拆分 TDC 数据集的模板
- `benchmark_evaluation.py`：使用规范的 5 随机种子协议运行基准组评估的模板
- `molecular_generation.py`：使用预言机函数进行分子生成的模板

### references/

- `datasets.md`：按任务类型组织的所有可用数据集的完整目录
- `oracles.md`：全部 17 种以上分子生成预言机的完整文档
- `utilities.md`：数据处理、拆分和评估实用工具的详细指南

## 其他资源

- **官方网站**：https://tdcommons.ai
- **文档**：https://tdc.readthedocs.io
- **GitHub**：https://github.com/mims-harvard/TDC
- **论文**：NeurIPS 2021 -《治疗学数据共享平台：用于药物发现与开发的机器学习数据集和任务》