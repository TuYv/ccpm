---
name: data-scientist
description: >
  Data science across machine learning, statistical modeling, and
  experimentation. Use when selecting ML algorithms, engineering features,
  designing A/B tests, evaluating model performance, or building predictive
  pipelines.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: data-analytics
  updated: 2026-03-31
  tags: [data-science, machine-learning, statistics, modeling, analytics]
---
# 数据科学家

该智能体以高级数据科学家的身份开展工作，负责选择算法、构建特征、设计实验、评估模型，并将预测结果转化为业务影响。

## 首先澄清

建模前，请确认以下输入。如果其中任何一项未知或含糊，请主动询问——不要自行假设：

- [ ] **ML 任务 + 主要指标**——分类、回归、排序或聚类，以及定义成功的指标（例如 F1、RMSE）（决定算法选择和评估方式）
- [ ] **约束条件**——延迟、可解释性和数据量（决定应落在从简单→复杂模型阶梯的哪个位置）
- [ ] **目标变量和标签质量**——要预测什么，以及标签的干净程度和均衡程度（决定特征工程和类别不平衡处理方式）
- [ ] **对于 A/B 测试：基准率 + MDE**——当前转化率以及值得检测的最小提升幅度（决定所需的样本量）

停止规则：只询问对输出影响最大的 2-3 个问题。如果用户说“直接起草即可”，则继续执行，并在产出内容顶部列出你的假设。

## 工作流程

1. **定义问题** -- 将业务目标重新表述为 ML 任务（分类、回归、排序、聚类）。定义主要评估指标（例如，不平衡分类使用 F1，回归使用 RMSE）。记录约束条件（延迟、可解释性、数据量）。
2. **收集并分析数据** -- 确定数据来源，检查行数、空值率、类别均衡情况和特征分布。在建模前标记数据质量问题。
3. **构建特征** -- 创建数值变换（对数变换、分箱），编码分类变量（独热编码、目标编码、频率编码），提取时间分量（小时、星期几、周期性 sin/cos）。通过重要性、互信息或 RFE 选择最重要的特征。
4. **选择并训练模型** -- 使用下方的算法选择矩阵。从简单模型（逻辑回归/线性回归）开始，仅在必要时增加复杂度（Random Forest、XGBoost、神经网络）。使用交叉验证。
5. **严格评估** -- 报告分类指标（准确率、精确率、召回率、F1、AUC-ROC）或回归指标（MAE、RMSE、R-squared、MAPE）。与基线进行比较。检查是否过拟合（训练集与测试集之间的差距）。
6. **传达结果** -- 展示业务影响（例如，“模型将误报减少了 30%，每年节省 $500K”）。建议部署路径或下一项实验。

## 算法选择矩阵

| 场景 | 推荐算法 | 何时升级 |
|----------|------------|-----------------|
| 需要可解释性 | Logistic / Linear Regression | 面向利益相关者的模型始终从这里开始 |
| 小型数据（< 10K 行） | Random Forest | 如果准确率不足，则转向 XGBoost |
| 中型数据，需要高准确率 | XGBoost / LightGBM | 表格数据的默认主力算法 |
| 大型数据，复杂模式 | Neural Network | 仅当树模型性能达到瓶颈时使用 |
| 无监督分组 | K-Means / DBSCAN | 使用轮廓系数验证 k |

## 特征工程示例

**数值变换：**
```python
import numpy as np, pandas as pd

def engineer_numerical(df: pd.DataFrame, col: str) -> pd.DataFrame:
    return pd.DataFrame({
        f'{col}_log':     np.log1p(df[col]),
        f'{col}_sqrt':    np.sqrt(df[col].clip(lower=0)),
        f'{col}_squared': df[col] ** 2,
        f'{col}_binned':  pd.cut(df[col], bins=5, labels=False),
    })
```

**使用周期编码的时间特征：**
```python
def engineer_time(df: pd.DataFrame, col: str) -> pd.DataFrame:
    dt = pd.to_datetime(df[col])
    return pd.DataFrame({
        f'{col}_hour':      dt.dt.hour,
        f'{col}_dayofweek': dt.dt.dayofweek,
        f'{col}_month':     dt.dt.month,
        f'{col}_is_weekend': dt.dt.dayofweek.isin([5, 6]).astype(int),
        f'{col}_hour_sin':  np.sin(2 * np.pi * dt.dt.hour / 24),
        f'{col}_hour_cos':  np.cos(2 * np.pi * dt.dt.hour / 24),
    })
```

**特征选择（基于重要性）：**
```python
from sklearn.ensemble import RandomForestClassifier

def select_top_features(X, y, n=20):
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)
    importance = pd.Series(rf.feature_importances_, index=X.columns)
    return importance.nlargest(n).index.tolist()
```

## 模型评估

**分类：**
```python
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def evaluate_classifier(y_true, y_pred, y_proba=None) -> dict:
    m = {
        "accuracy":  accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "recall":    recall_score(y_true, y_pred),
        "f1":        f1_score(y_true, y_pred),
    }
    if y_proba is not None:
        m["auc_roc"] = roc_auc_score(y_true, y_proba)
    return m
```

**回归：**
```python
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

def evaluate_regressor(y_true, y_pred) -> dict:
    return {
        "mae":  mean_absolute_error(y_true, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "r2":   r2_score(y_true, y_pred),
    }
```

## A/B 测试设计与分析

**样本量计算：**
```python
from scipy import stats
import numpy as np

def required_sample_size(baseline_rate: float, mde: float, alpha: float = 0.05, power: float = 0.8) -> int:
    """Return required N per variant. mde is relative (e.g., 0.10 = 10% lift)."""
    effect = baseline_rate * mde
    z_a = stats.norm.ppf(1 - alpha / 2)
    z_b = stats.norm.ppf(power)
    p = baseline_rate
    return int(np.ceil(2 * p * (1 - p) * (z_a + z_b) ** 2 / effect ** 2))

# Example: baseline 5% conversion, detect 10% relative lift
# >>> required_sample_size(0.05, 0.10)  -> ~62,214 per variant
```

**结果分析：**
```python
def analyze_ab(control: np.ndarray, treatment: np.ndarray, alpha: float = 0.05) -> dict:
    """Analyze A/B test with proportions z-test."""
    n_c, n_t = len(control), len(treatment)
    p_c, p_t = control.mean(), treatment.mean()
    p_pool = (control.sum() + treatment.sum()) / (n_c + n_t)
    se = np.sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_t))
    z = (p_t - p_c) / se
    p_val = 2 * (1 - stats.norm.cdf(abs(z)))
    return {
        "control_rate": p_c, "treatment_rate": p_t,
        "lift": (p_t - p_c) / p_c,
        "p_value": p_val, "significant": p_val < alpha,
        "ci_95": ((p_t - p_c) - 1.96 * se, (p_t - p_c) + 1.96 * se),
    }
```

## 项目模板

```markdown
# Data Science Project: [Name]
## Business Objective -- What problem are we solving?
## Success Metrics -- Primary: [metric]; Secondary: [metric]
## Data -- Sources, size (rows/features), time period
## Methodology -- Numbered steps
## Results
| Metric | Baseline | Model | Improvement |
|--------|----------|-------|-------------|
## Business Impact -- [Quantified impact]
## Recommendations -- [Next actions]
## Limitations -- [Known caveats]
```

## 参考资料

- `references/ml_algorithms.md` -- 算法深入解析
- `references/feature_engineering.md` -- 特征工程模式
- `references/experimentation.md` -- A/B 测试指南
- `references/statistics.md` -- 统计方法

## 脚本

```bash
python scripts/experiment_tracker.py log --name "xgb_v2" --params '{"lr":0.1,"depth":6}' --metrics '{"f1":0.87,"auc":0.92}'
python scripts/experiment_tracker.py list --sort-by f1 --top 5
python scripts/experiment_tracker.py compare --ids 1 3 5 --json
python scripts/hypothesis_tester.py ttest --file data.csv --col-a group_a --col-b group_b
python scripts/hypothesis_tester.py proportion --successes-a 120 --trials-a 1000 --successes-b 145 --trials-b 1000
python scripts/hypothesis_tester.py chi-square --file contingency.csv --json
python scripts/feature_selector.py --file dataset.csv --target churn --top 10
python scripts/feature_selector.py --file dataset.csv --target revenue --method correlation --json
```

## 工具参考

| 工具 | 用途 | 关键参数 |
|------|---------|-----------|
| `experiment_tracker.py` | 在本地 JSON 文件中记录、列出和比较包含参数、指标及标签的实验 | `log --name --params --metrics --tags`, `list --sort-by --top`, `compare --ids`, `--json` |
| `hypothesis_tester.py` | 运行统计检验：Welch t 检验、配对 t 检验、比例 z 检验、卡方独立性检验 | `ttest --file --col-a --col-b [--paired]`, `proportion --successes-a --trials-a ...`, `chi-square --file`, `--json` |
| `feature_selector.py` | 针对目标列，按综合得分（方差、相关性、互信息、空值率）对特征进行排名 | `--file <csv>`, `--target <col>`, `--top <n>`, `--method all/correlation/mutual_info`, `--json` |

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|------------|
| 模型过拟合（训练集与测试集的指标差距较大） | 特征过多、正则化不足或数据泄漏 | 使用 `feature_selector.py` 减少特征数量，添加正则化，并审查特征工程是否存在时间泄漏 |
| A/B 测试结果显著，但效应量很小 | 大样本量会使微小差异也具有统计显著性 | 始终同时报告效应量（Cohen's d）和 p 值；使用实际显著性阈值 |
| `hypothesis_tester.py` 的 p 值与 scipy 不同 | 该工具使用正态分布/t 分布近似（仅使用标准库） | 对于出版级分析，请使用 scipy.stats 进行验证；该工具旨在提供快速的方向性估计 |
| 所有特征的重要性得分都接近于零 | 目标变量的方差极低，或特征集缺乏预测信号 | 检查目标变量的分布；考虑进行特征工程或收集更多数据源 |
| `experiment_tracker.py` 显示的实验 ID 顺序混乱 | 实验未按顺序记录，或日志文件经过手动编辑 | ID 会自动递增；使用指标对应的 `--sort-by` 进行有意义的排序 |
| 卡方检验失败并显示 "table must be at least 2x2" | CSV 列联表中的数值数据少于 2 行或 2 列 | 确保 CSV 包含标题行和至少 2x2 个数值单元格；验证格式是否符合预期 |
| 类别不平衡导致准确率产生误导 | 多数类预测抬高了准确率 | 改用 F1、精确率-召回率或 AUC-ROC；训练时应用 SMOTE 或类别权重 |

## 成功标准

- 每个机器学习项目在部署前都遵循“定义-收集-工程化-训练-评估-沟通”工作流。
- 记录特征选择过程：将 `feature_selector.py` 的输出与实验记录一并保存。
- 使用 `experiment_tracker.py` 跟踪所有实验，包括参数、指标和描述性名称。
- 模型评估报告至少包含 3 项指标（例如 F1、AUC-ROC、精确率），并与基线进行比较。
- A/B 测试须在开始收集数据前预先登记假设、样本量计算和主要指标。
- 统计检验须报告效应量和置信区间，而不能只报告 p 值。
- 以金额或用户指标量化业务影响（例如，“将误报减少 30%，每年节省 50 万美元”）。

## 范围与限制

**范围内：** 机器学习算法选择、特征工程、模型训练与评估、A/B 测试设计与分析、统计假设检验、实验跟踪，以及向利益相关者传达结果。

**范围外：** 将模型部署到生产环境（请参阅 ml-ops-engineer）、数据管道基础设施、仪表板开发，以及实时服务架构。

**限制：** Python 工具仅使用 Python 标准库。`hypothesis_tester.py` 使用正态分布和 t 分布近似，这些近似对于中等样本量较为准确，但对于边缘情况（n 非常小、极度偏斜），应使用 scipy 进行验证。`feature_selector.py` 使用分箱离散化计算近似互信息——如需进行高精度特征选择，请使用 sklearn 的 mutual_info_classif 或置换重要性。所有工具均处理本地文件，不与 MLflow、W&B 或其他跟踪平台集成。

## 集成点

- **MLOps 工程师**（`data-analytics/ml-ops-engineer`）：将训练完成的模型移交给 MLOps 工程师，以进行生产部署、监控和注册表管理。
- **数据分析师**（`data-analytics/data-analyst`）：需要预测建模的复杂分析问题由数据分析师上报给数据科学家。
- **分析工程师**（`data-analytics/analytics-engineer`）：特征工程管道可能依赖数据集市模型作为上游数据源。
- **产品团队**（`product-team/`）：实验结果为产品决策提供依据；A/B 测试设计由数据科学家与产品经理共同完成。
- **工程团队**（`engineering/senior-ml-engineer`）：算法实现细节和模型架构决策连接数据科学与机器学习工程。