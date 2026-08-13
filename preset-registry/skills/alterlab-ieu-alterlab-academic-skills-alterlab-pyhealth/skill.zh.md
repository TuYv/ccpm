---
name: alterlab-pyhealth
description: Develops, tests, and deploys clinical machine learning models with the PyHealth healthcare AI toolkit. Use when working with electronic health records (EHR), clinical prediction tasks (mortality, readmission, drug recommendation), medical coding systems (ICD, NDC, ATC), physiological signals (EEG, ECG), healthcare datasets (MIMIC-III/IV, eICU, OMOP), or implementing deep learning models for healthcare (RETAIN, SafeDrug, Transformer, GNN). Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*)
compatibility: "Self-contained — runs under `uv run python` with PyHealth 2.0.1 installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.1.1"
---
# PyHealth：医疗健康 AI 工具包

## 概述

PyHealth 是一个面向医疗健康 AI 的综合性 Python 库，为临床机器学习提供专用工具、模型和数据集。在开发医疗健康预测模型、处理临床数据、使用医疗编码系统或在医疗健康场景中部署 AI 解决方案时，请使用此技能。

> **版本注意事项（请先阅读）。** 此技能面向 **PyHealth 2.x**（固定使用 `pyhealth==2.0.1`）。2.0 版本的重写对 API 进行了更改，而更广泛的网络资料（以及 2024 年之前的教程）常常对此存在错误描述：
> - **任务是需要实例化的类**，例如 `MortalityPredictionMIMIC4()`、`DrugRecommendationMIMIC3()`——*而不是*旧版蛇形命名的 `mortality_prediction_mimic4_fn` 函数。请将实例传递给 `dataset.set_task(task)`。
> - **数据集需要显式提供 `tables=[...]`** 列表（例如 `tables=["diagnoses_icd", "procedures_icd", "prescriptions"]`）。
> - **模型除了需要 `feature_keys=` 和 `mode=` 之外，还需要 `label_key=`**。EHR 任务常用的特征键包括 `"conditions"`、`"procedures"`、`"drugs"`。
> - **指标名称没有 `_score` 后缀**：`pr_auc`、`roc_auc`、`f1`；多标签/药物推荐任务使用 `*_samples` 系列（`jaccard_samples`、`f1_samples`、`pr_auc_samples`、`ddi`）。请将 `metrics=[...]` 传递给 **`Trainer` 构造函数**，并将 `monitor=` 设置为其中一个名称。
> - 2.0.1 要求使用 **Python 3.12 或 3.13**（`>=3.12,<3.14`）。
> 如果不确定类名或参数名，请检查当前源代码，而不要依赖较旧的代码片段。

## 何时使用此技能

在以下情况下调用此技能：

- **使用医疗健康数据集**：MIMIC-III、MIMIC-IV、eICU、OMOP、睡眠 EEG 数据、医学影像
- **临床预测任务**：死亡率预测、医院再入院预测、住院时长预测、药物推荐
- **医疗编码**：在 ICD-9/10、NDC、RxNorm、ATC 编码系统之间进行转换
- **处理临床数据**：序列事件、生理信号、临床文本、医学影像
- **实现医疗健康模型**：用于 EHR 的 RETAIN、SafeDrug、GAMENet、StageNet、Transformer
- **评估临床模型**：公平性指标、校准、可解释性、不确定性量化

## 核心能力

PyHealth 采用针对医疗健康 AI 优化的模块化五阶段流水线：

1. **数据加载**：通过标准化接口访问 10 多个医疗健康数据集
2. **任务定义**：应用 20 多个预定义的临床预测任务，或创建自定义任务
3. **模型选择**：从 33 多个模型中进行选择（基线模型、深度学习模型、医疗健康专用模型）
4. **训练**：使用自动检查点保存、监控和评估进行训练
5. **部署**：针对临床使用进行校准、解释和验证

PyHealth 2.x 使用基于 **polars** 的数据层，能够快速且高效地处理大型 EHR 表，并节省内存。

## 快速入门工作流

```python
from pyhealth.datasets import MIMIC4Dataset, split_by_patient, get_dataloader
from pyhealth.tasks import MortalityPredictionMIMIC4
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer

# 1. Load dataset (declare the tables you need) and set the task (a class instance)
dataset = MIMIC4Dataset(
    root="/path/to/data",
    tables=["diagnoses_icd", "procedures_icd", "prescriptions"],
)
sample_dataset = dataset.set_task(MortalityPredictionMIMIC4())

# 2. Split data by patient (no leakage across splits)
train, val, test = split_by_patient(sample_dataset, [0.7, 0.1, 0.2])

# 3. Create data loaders
train_loader = get_dataloader(train, batch_size=64, shuffle=True)
val_loader = get_dataloader(val, batch_size=64, shuffle=False)
test_loader = get_dataloader(test, batch_size=64, shuffle=False)

# 4. Initialize and train (feature_keys + label_key + mode all required)
model = Transformer(
    dataset=sample_dataset,
    feature_keys=["conditions", "procedures", "drugs"],
    label_key="mortality",
    mode="binary",
    embedding_dim=128,
)

trainer = Trainer(model=model, metrics=["pr_auc", "roc_auc", "f1"])  # device auto-detected
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    monitor="pr_auc",            # AUPRC — robust for the rare-mortality class
    monitor_criterion="max",
)

# 5. Evaluate (uses the metrics passed to the Trainer)
results = trainer.evaluate(test_loader)
```

## 详细文档

此技能包含按功能组织的全面参考文档。请根据需要阅读特定的参考文件：

### 1. 数据集与数据结构

**文件**：`references/datasets.md`

**适合在以下情况阅读：**
- 加载医疗健康数据集（MIMIC、eICU、OMOP、睡眠 EEG 等）
- 理解 Event、Patient、Visit 数据结构
- 处理不同的数据类型（EHR、信号、图像、文本）
- 拆分训练集、验证集和测试集
- 使用 SampleDataset 进行特定任务的格式化

**关键主题：**
- 核心数据结构（Event、Patient、Visit）
- 10 多个可用数据集（EHR、生理信号、影像、文本）
- 数据加载与迭代
- 训练集/验证集/测试集拆分策略
- 大型数据集的性能优化

### 2. 医学编码转换

**文件**：`references/medical_coding.md`

**适合在以下情况阅读：**
- 在不同医学编码系统之间进行转换
- 使用诊断编码（ICD-9-CM、ICD-10-CM、CCS）
- 处理药物编码（NDC、RxNorm、ATC）
- 标准化手术与操作编码（ICD-9-PROC、ICD-10-PROC）
- 将编码归入临床类别
- 处理分层药物分类

**关键主题：**
- 用于系统内查询的 InnerMap
- 用于跨系统转换的 CrossMap
- 支持的编码系统（ICD、NDC、ATC、CCS、RxNorm）
- 编码标准化与层级遍历
- 按治疗类别进行药物分类
- 与数据集集成

### 3. 临床预测任务

**文件**：`references/tasks.md`

**适合在以下情况阅读：**
- 定义临床预测目标
- 使用预定义任务（死亡率、再入院、药物推荐）
- 处理基于 EHR、信号、影像或文本的任务
- 创建自定义预测任务
- 为模型设置输入/输出模式
- 应用特定于任务的筛选逻辑

**关键主题：**
- 20 多个预定义临床任务
- EHR 任务（死亡率、再入院、住院时长、药物推荐）
- 信号任务（睡眠分期、EEG 分析、癫痫发作检测）
- 影像任务（COVID-19 胸部 X 光片分类）
- 文本任务（医学编码、专科分类）
- 自定义任务创建模式

### 4. 模型与架构

**文件**：`references/models.md`

**适合在以下情况阅读：**
- 为临床预测选择模型
- 理解模型架构与能力
- 在通用模型与医疗健康专用模型之间进行选择
- 实现可解释模型（RETAIN、AdaCare）
- 处理药物推荐（SafeDrug、GAMENet）
- 在医疗健康领域使用图神经网络
- 配置模型超参数

**关键主题：**
- 33 多个可用模型
- 通用模型：逻辑回归、MLP、CNN、RNN、Transformer、GNN
- 医疗健康专用模型：RETAIN、SafeDrug、GAMENet、StageNet、AdaCare
- 根据任务类型和数据类型选择模型
- 可解释性考量
- 计算要求
- 超参数调优指南

### 5. 数据预处理

**文件**：`references/preprocessing.md`

**适合在以下情况阅读：**
- 为模型预处理临床数据
- 处理序列事件和时间序列数据
- 处理生理信号（EEG、ECG）
- 对实验室检验值和生命体征进行归一化
- 为不同任务类型准备标签
- 构建特征词表
- 处理缺失数据和异常值

**关键主题：**
- 15 种以上的处理器类型
- 序列处理（填充、截断）
- 信号处理（滤波、分段）
- 特征提取和编码
- 标签处理器（二分类、多分类、多标签、回归）
- 文本和图像预处理
- 常见预处理工作流

### 6. 训练与评估

**文件**：`references/training_evaluation.md`

**在以下情况阅读：**
- 使用 Trainer 类训练模型
- 评估模型性能
- 计算临床指标
- 评估不同人口统计群体之间的模型公平性
- 校准预测以提高可靠性
- 量化预测不确定性
- 解释模型预测
- 为模型的临床部署做准备

**关键主题：**
- Trainer 类（训练、评估、推理）
- 二分类、多分类、多标签和回归任务的指标
- 用于偏差评估的公平性指标
- 校准方法（Platt 缩放、温度缩放）
- 不确定性量化（保形预测、MC dropout）
- 可解释性工具（注意力可视化、SHAP、通过 `pyhealth.interpret.methods.CheferRelevance` 实现的 Chefer 相关性）
- 完整的训练流水线示例

## 安装

```bash
uv pip install "pyhealth==2.0.1"
```

**要求（PyHealth 2.0.1）：**
- Python **3.12 或 3.13**（`>=3.12,<3.14`）— 请注意，此计算机上 `uv` 默认使用的 Python 版本是 3.14，*不在*支持范围内；进行 PyHealth 相关工作时，请使用 `uv venv --python 3.13` 创建环境。
- PyTorch（作为依赖项引入）
- NumPy、pandas、polars、scikit-learn

## 常见使用场景

### 使用场景 1：ICU 死亡率预测

**目标**：预测重症监护病房患者的死亡风险

**方法：**
1. 加载 MIMIC-IV 数据集 → 阅读 `references/datasets.md`
2. 应用死亡率预测任务 → 阅读 `references/tasks.md`
3. 选择可解释模型（RETAIN）→ 阅读 `references/models.md`
4. 训练并评估 → 阅读 `references/training_evaluation.md`
5. 解释预测结果以供临床使用 → 阅读 `references/training_evaluation.md`

### 使用场景 2：安全用药推荐

**目标**：在避免药物相互作用的同时推荐药物

**方法：**
1. 加载 EHR 数据集（MIMIC-IV 或 OMOP）→ 阅读 `references/datasets.md`
2. 应用药物推荐任务 → 阅读 `references/tasks.md`
3. 使用带有 DDI 约束的 SafeDrug 模型 → 阅读 `references/models.md`
4. 预处理药物编码 → 阅读 `references/medical_coding.md`
5. 使用多标签指标进行评估 → 阅读 `references/training_evaluation.md`

### 使用场景 3：再入院预测

**目标**：识别存在 30 天内再入院风险的患者

**方法：**
1. 加载多中心 EHR 数据（eICU 或 OMOP）→ 阅读 `references/datasets.md`
2. 应用再入院预测任务 → 阅读 `references/tasks.md`
3. 在预处理中处理类别不平衡问题 → 阅读 `references/preprocessing.md`
4. 训练 Transformer 模型 → 阅读 `references/models.md`
5. 校准预测并评估公平性 → 阅读 `references/training_evaluation.md`

### 使用场景 4：睡眠障碍诊断

**目标**：根据 EEG 信号对睡眠阶段进行分类

**方法：**
1. 加载睡眠 EEG 数据集（SleepEDF、SHHS）→ 阅读 `references/datasets.md`
2. 应用睡眠分期任务 → 阅读 `references/tasks.md`
3. 预处理 EEG 信号（滤波、分段）→ 阅读 `references/preprocessing.md`
4. 训练 CNN 或 RNN 模型 → 阅读 `references/models.md`
5. 评估各阶段的性能 → 阅读 `references/training_evaluation.md`

### 用例 5：医学编码转换

**目标**：统一不同编码系统中的诊断

**方法：**
1. 阅读 `references/medical_coding.md` 以获取全面指导
2. 使用 CrossMap 在 ICD-9、ICD-10、CCS 之间进行转换
3. 将编码划分为具有临床意义的类别
4. 与数据集处理流程集成

### 用例 6：临床文本转 ICD 编码

**目标**：根据临床记录自动分配 ICD 编码

**方法：**
1. 加载包含临床文本的 MIMIC-III → 阅读 `references/datasets.md`
2. 应用 ICD 编码任务 → 阅读 `references/tasks.md`
3. 预处理临床文本 → 阅读 `references/preprocessing.md`
4. 使用 TransformersModel（ClinicalBERT）→ 阅读 `references/models.md`
5. 使用多标签指标进行评估 → 阅读 `references/training_evaluation.md`

## 最佳实践

### 数据处理

1. **始终按患者划分**：确保同一患者不会出现在多个数据划分中，以防止数据泄漏
   ```python
   from pyhealth.datasets import split_by_patient
   train, val, test = split_by_patient(dataset, [0.7, 0.1, 0.2])
   ```

2. **检查数据集统计信息**：在建模前了解数据
   ```python
   print(dataset.stats())  # Patients, visits, events, code distributions
   ```

3. **使用适当的预处理方法**：根据数据类型选择相应的处理器（参见 `references/preprocessing.md`）

### 模型开发

1. **从基线开始**：使用简单模型建立基线性能
   - 对二分类/多分类任务使用逻辑回归
   - 使用 MLP 作为初始深度学习基线

2. **选择适合任务的模型**：
   - 需要可解释性 → RETAIN、AdaCare
   - 药物推荐 → SafeDrug、GAMENet
   - 长序列 → Transformer
   - 图关系 → GNN

3. **监控验证指标**：使用适合任务的指标，并处理类别不平衡问题。PyHealth 指标字符串（传递给 `Trainer(metrics=[...])` / `monitor=`）：
   - 二分类：`roc_auc`、`pr_auc`（对于稀有事件，优先使用 `pr_auc`）、`f1`、`accuracy`
   - 多分类：`f1_macro`、`f1_weighted`、`accuracy`、`cohen_kappa`
   - 多标签/药物推荐：`jaccard_samples`、`f1_samples`、`pr_auc_samples`、`ddi`
   - 回归：`mae`、`mse`、`r2`

### 临床部署

1. **校准预测结果**：确保概率可靠（参见 `references/training_evaluation.md`）

2. **评估公平性**：在不同人口统计群体中进行评估，以检测偏差

3. **量化不确定性**：为预测结果提供置信度估计

4. **解释预测结果**：使用注意力权重、SHAP 或 Chefer 相关性来建立临床信任

5. **全面验证**：使用来自不同时间段或不同站点的留出测试集

## 局限性与注意事项

### 数据要求

- **大型数据集**：深度学习模型需要充足的数据（数千名患者）
- **数据质量**：缺失数据和编码错误会影响性能
- **时间一致性**：必要时，确保训练集/测试集的划分遵循时间顺序

### 临床验证

- **外部验证**：使用来自不同医院/系统的数据进行测试
- **前瞻性评估**：部署前在真实临床环境中进行验证
- **临床审查**：由临床医生审查预测结果和解释
- **伦理考量**：妥善处理隐私（HIPAA/GDPR）、公平性和安全问题

### 计算资源

- **建议使用 GPU**：以高效训练深度学习模型
- **内存要求**：大型数据集可能需要 16GB 以上的 RAM
- **存储空间**：医疗数据集的大小可能达到数十至数百 GB

## 故障排除

### 常见问题

**数据集出现 ImportError**：
- 确保已下载数据集文件且路径正确
- 检查 PyHealth 版本兼容性

**内存不足**：
- 减小批次大小
- 减小序列长度（`max_seq_length`）
- 使用梯度累积
- 分块处理数据

**性能不佳**：
- 检查类别不平衡问题并使用适当的指标（`pr_auc` 与 `roc_auc`）
- 验证预处理过程（归一化、缺失数据处理）
- 增加模型容量或训练轮数
- 检查训练集/测试集划分中是否存在数据泄漏

**训练缓慢**：
- 使用 GPU（`device="cuda"`）
- 增大批次大小（如果内存允许）
- 减小序列长度
- 使用更高效的模型（CNN 与 Transformer）

### 获取帮助

- **文档**：https://pyhealth.readthedocs.io/
- **GitHub Issues**：https://github.com/sunlabuiuc/PyHealth/issues
- **示例/笔记本**：https://github.com/sunlabuiuc/PyHealth/tree/master/examples

## 示例：完整工作流

```python
# Complete mortality prediction pipeline
from pyhealth.datasets import MIMIC4Dataset, split_by_patient, get_dataloader
from pyhealth.tasks import MortalityPredictionMIMIC4
from pyhealth.models import RETAIN
from pyhealth.trainer import Trainer

# 1. Load dataset (declare the tables the task needs)
print("Loading MIMIC-IV dataset...")
dataset = MIMIC4Dataset(
    root="/data/mimic4",
    tables=["diagnoses_icd", "procedures_icd", "prescriptions"],
)
print(dataset.stats())

# 2. Define task (instantiate the task class)
print("Setting mortality prediction task...")
sample_dataset = dataset.set_task(MortalityPredictionMIMIC4())
print(f"Generated {len(sample_dataset)} samples")

# 3. Split data (by patient to prevent leakage)
print("Splitting data...")
train_ds, val_ds, test_ds = split_by_patient(
    sample_dataset, ratios=[0.7, 0.1, 0.2], seed=42
)

# 4. Create data loaders
train_loader = get_dataloader(train_ds, batch_size=64, shuffle=True)
val_loader = get_dataloader(val_ds, batch_size=64)
test_loader = get_dataloader(test_ds, batch_size=64)

# 5. Initialize interpretable model (label_key is required)
print("Initializing RETAIN model...")
model = RETAIN(
    dataset=sample_dataset,
    feature_keys=["conditions", "procedures", "drugs"],
    label_key="mortality",
    mode="binary",
    embedding_dim=128,
)

# 6. Train model
print("Training model...")
import torch
trainer = Trainer(
    model=model,
    metrics=["accuracy", "pr_auc", "roc_auc", "f1"],
)
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    optimizer_class=torch.optim.Adam,
    optimizer_params={"lr": 1e-3, "weight_decay": 1e-5},
    monitor="pr_auc",          # Use AUPRC for the imbalanced (rare-mortality) outcome
    monitor_criterion="max",
)

# 7. Evaluate on test set (uses the metrics passed to the Trainer)
print("Evaluating on test set...")
test_results = trainer.evaluate(test_loader)

print("\nTest Results:")
for metric, value in test_results.items():
    print(f"  {metric}: {value:.4f}")

# 8. Get predictions for analysis.
# inference() returns (y_true, y_prob, loss) by default; requesting extras
# extends the tuple to (y_true, y_prob, loss, additional_outputs, patient_ids).
y_true, y_prob, loss, extra, patient_ids = trainer.inference(
    test_loader,
    additional_outputs=["attention_weights"],
    return_patient_ids=True,
)

# 9. Flag the highest-risk patient
positive_prob = y_prob if y_prob.ndim == 1 else y_prob[..., -1]
high_risk_idx = int(positive_prob.argmax())
print(f"\nHighest-risk patient: {patient_ids[high_risk_idx]}")
print(f"Risk score: {float(positive_prob[high_risk_idx]):.3f}")

# 10. Feature-level interpretation via Chefer relevance (works on attention models)
from pyhealth.interpret.methods import CheferRelevance
relevance = CheferRelevance(model)
one = get_dataloader(test, batch_size=1, shuffle=False)
scores = relevance.get_relevance_matrix(**next(iter(one)))
for feature_key, rel in scores.items():
    print(f"{feature_key}: top tokens -> {rel[0].topk(5).indices.tolist()}")

# 11. Save the trained model
trainer.save("./models/mortality_retain_final.pt")
print("\nModel saved successfully!")
```

## 资源

有关各组件的详细信息，请参阅 `references/` 目录中的综合参考文件：

- **datasets.md**：数据结构、加载和拆分（4,500 字）
- **medical_coding.md**：代码转换和标准化（3,800 字）
- **tasks.md**：临床预测任务和自定义任务创建（4,200 字）
- **models.md**：模型架构和选择指南（5,100 字）
- **preprocessing.md**：数据处理器和预处理工作流（4,600 字）
- **training_evaluation.md**：训练、指标、校准、可解释性（5,900 字）

**综合文档总计**：模块化参考文件共约 28,000 字。