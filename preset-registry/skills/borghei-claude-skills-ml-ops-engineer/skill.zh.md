---
name: ml-ops-engineer
description: >
  MLOps across model deployment, ML pipelines, monitoring, and feature stores.
  Use when deploying models to production, building training pipelines, setting
  up drift detection, configuring feature stores, or automating ML CI/CD
  workflows.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: data-analytics
  updated: 2026-03-31
  tags: [mlops, deployment, pipelines, monitoring, feature-store]
---
# MLOps 工程师

该智能体以高级 MLOps 工程师的身份开展工作，负责将模型部署到生产环境、编排训练流水线、监控模型健康状况、管理特征存储，以及实现机器学习 CI/CD 自动化。

## 首先澄清

部署前，请确认以下输入。如果有任何一项未知或含糊不清，请提问——不要自行假设：

- [ ] **服务模式 + 延迟 SLA** — 实时（FastAPI/K8s）还是批处理，以及 P99 目标（这将决定整个部署架构）
- [ ] **当前 MLOps 成熟度** — 手动、流水线、CI/CD 还是完整 MLOps（用于识别应优先弥补的最具影响力的差距）
- [ ] **模型制品 + 注册表/基础设施** — 框架、存储位置和目标平台（MLflow、K8s）（这将决定服务和注册表配置）
- [ ] **监控阈值** — 漂移和准确率下降限制，以及检查频率（这将决定告警规则和漂移检测）

停止规则：只询问对输出影响最大的 2-3 个问题。如果用户说“直接起草即可”，则继续执行，并在制品顶部列出你的假设。

## 工作流程

1. **评估 ML 成熟度** -- 确定当前级别（手动 notebook、自动化流水线或完整 CI/CD）。识别应优先弥补的最具影响力的差距。
2. **构建或扩展训练流水线** -- 定义 fetch-data、validate、preprocess、train、evaluate 阶段。使用 Kubeflow、Airflow 或同类工具。以准确率阈值（例如 > 0.85）作为部署准入条件。
3. **部署模型以提供服务** -- 根据延迟要求选择实时服务（FastAPI + K8s）或批处理（Spark/Parquet）。配置健康检查、自动扩缩容和资源限制。
4. **注册到模型注册表** -- 在 MLflow 中记录参数、指标和制品。将胜出的版本转换到 Production 阶段；归档之前的版本。
5. **接入监控** -- 设置延迟（P50/P95/P99）、错误率、预测分布和特征漂移仪表板。配置告警阈值。
6. **端到端验证** -- 对服务端点运行冒烟测试。确认监控仪表板已填充数据。验证回滚流程可正常运行。

## MLOps 成熟度模型

| 级别 | 能力 | 关键信号 |
|-------|-------------|------------|
| 0 - 手动 | Jupyter notebook、手动部署 | 模型没有版本控制 |
| 1 - 流水线 | 自动化训练、模型版本化 | 已使用 MLflow 跟踪 |
| 2 - CI/CD | 持续训练、自动化测试 | 特征存储已投入运行 |
| 3 - 完整 MLOps | 根据漂移自动重新训练、A/B 测试 | 由 SLA 保障的监控 |

## 实时服务示例

```python
# model_server.py -- FastAPI model serving
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow.pyfunc, time

app = FastAPI()
model = mlflow.pyfunc.load_model("models:/fraud_detector/Production")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    model_version: str
    latency_ms: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    start = time.time()
    try:
        pred = model.predict([req.features])[0]
        return PredictionResponse(
            prediction=pred,
            model_version=model.metadata.run_id,
            latency_ms=(time.time() - start) * 1000,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}
```

## Kubernetes 部署

```yaml
# k8s/model-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-server
spec:
  replicas: 3
  selector:
    matchLabels: {app: model-server}
  template:
    metadata:
      labels: {app: model-server}
    spec:
      containers:
      - name: model-server
        image: gcr.io/project/model-server:v1.2.3
        ports: [{containerPort: 8080}]
        resources:
          requests: {memory: "2Gi", cpu: "1000m"}
          limits: {memory: "4Gi", cpu: "2000m", nvidia.com/gpu: 1}
        env:
        - {name: MODEL_URI, value: "s3://models/production/v1.2.3"}
        readinessProbe:
          httpGet: {path: /health, port: 8080}
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: model-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: model-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: {type: Utilization, averageUtilization: 70}
```

## 漂移检测

```python
# monitoring/drift_detector.py
import numpy as np
from scipy import stats
from dataclasses import dataclass

@dataclass
class DriftResult:
    feature: str
    drift_score: float
    is_drifted: bool
    p_value: float

def detect_drift(reference: np.ndarray, current: np.ndarray, threshold: float = 0.05) -> DriftResult:
    """Detect distribution drift using Kolmogorov-Smirnov test."""
    statistic, p_value = stats.ks_2samp(reference, current)
    return DriftResult(feature="", drift_score=statistic, is_drifted=p_value < threshold, p_value=p_value)

def monitor_all_features(reference: dict, current: dict, threshold: float = 0.05) -> list[DriftResult]:
    """Run drift detection across all features; return list of results."""
    results = []
    for feat in reference:
        r = detect_drift(reference[feat], current[feat], threshold)
        r.feature = feat
        results.append(r)
    return results
```

## 告警规则

```python
ALERT_RULES = {
    "latency_p99":    {"threshold": 200,  "severity": "warning",  "msg": "P99 latency exceeded 200 ms"},
    "error_rate":     {"threshold": 0.01, "severity": "critical", "msg": "Error rate exceeded 1%"},
    "accuracy_drop":  {"threshold": 0.05, "severity": "critical", "msg": "Accuracy dropped > 5%"},
    "drift_score":    {"threshold": 0.15, "severity": "warning",  "msg": "Feature drift detected"},
}
```

## 特征存储（Feast）

```python
# features/customer_features.py
from feast import Entity, Feature, FeatureView, FileSource, ValueType
from datetime import timedelta

customer = Entity(name="customer_id", value_type=ValueType.INT64)

customer_stats = FeatureView(
    name="customer_stats",
    entities=["customer_id"],
    ttl=timedelta(days=1),
    features=[
        Feature(name="total_purchases",       dtype=ValueType.FLOAT),
        Feature(name="avg_order_value",        dtype=ValueType.FLOAT),
        Feature(name="days_since_last_order",  dtype=ValueType.INT32),
        Feature(name="lifetime_value",         dtype=ValueType.FLOAT),
    ],
    online=True,
    source=FileSource(
        path="gs://features/customer_stats.parquet",
        timestamp_field="event_timestamp",
    ),
)
```

**服务时在线检索：**
```python
from feast import FeatureStore
store = FeatureStore(repo_path=".")
features = store.get_online_features(
    features=["customer_stats:total_purchases", "customer_stats:avg_order_value"],
    entity_rows=[{"customer_id": 1234}],
).to_dict()
```

## 实验跟踪（MLflow）

```python
import mlflow

mlflow.set_tracking_uri("http://mlflow.company.com")
mlflow.set_experiment("fraud_detection")

with mlflow.start_run(run_name="xgboost_v2"):
    mlflow.log_params({"n_estimators": 100, "max_depth": 6, "learning_rate": 0.1})
    model = train_model(X_train, y_train)
    mlflow.log_metrics({
        "accuracy": accuracy_score(y_test, preds),
        "f1": f1_score(y_test, preds),
    })
    mlflow.sklearn.log_model(model, "model", registered_model_name="fraud_detector")
```

有关扩展的流水线示例（Kubeflow、Airflow DAG、完整的 CI/CD 工作流），请参阅 `REFERENCE.md`。

## 参考资料

- `REFERENCE.md` -- 扩展模式：Kubeflow 流水线、Airflow DAG、CI/CD 工作流、模型注册表操作
- `references/deployment_patterns.md` -- 模型部署策略
- `references/monitoring_guide.md` -- 机器学习监控最佳实践
- `references/feature_store.md` -- 特征存储模式
- `references/pipeline_design.md` -- 机器学习流水线架构

## 脚本

```bash
python scripts/model_registry.py register --name fraud_detector --version v2.3 --metrics '{"f1":0.91,"auc":0.95}' --params '{"n_estimators":200}'
python scripts/model_registry.py promote --name fraud_detector --version v2.3 --stage production
python scripts/model_registry.py list --stage production --json
python scripts/model_registry.py compare --name fraud_detector --versions v2.2 v2.3
python scripts/drift_detector.py --reference train_data.csv --current prod_data.csv
python scripts/drift_detector.py --reference baseline.csv --current latest.csv --threshold 0.1 --json
python scripts/pipeline_validator.py --pipeline pipeline.json --strict
python scripts/pipeline_validator.py --pipeline pipeline.json --json
```

## 工具参考

| 工具 | 用途 | 关键标志 |
|------|---------|-----------|
| `model_registry.py` | 注册、提升、列出和比较包含指标、参数及生命周期阶段的模型版本 | `register --name --version --metrics --params`, `promote --stage`, `list`, `compare --versions`, `--json` |
| `drift_detector.py` | 使用 KS 统计量、PSI 和卡方检验检测参考数据集与当前数据集之间的数据/模型漂移 | `--reference <csv>`, `--current <csv>`, `--columns`, `--threshold`, `--json` |
| `pipeline_validator.py` | 验证机器学习流水线定义的完整性、阶段顺序、评估关卡和回滚配置 | `--pipeline <json>`, `--strict`, `--json` |

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|------------|
| 模型延迟超过 P99 SLA（> 200 ms） | 模型过大、输入预处理速度慢，或 Pod 资源配置不足 | 对服务端点进行性能分析；考虑模型蒸馏、输入缓存，或提高 CPU/内存限制 |
| `drift_detector.py` 将所有特征标记为已漂移 | 阈值过低，或参考数据来自与预期不同的时间段 | 提高阈值（尝试 0.15-0.2），或使用更具代表性的时间窗口重新生成参考数据集 |
| 流水线在评估关卡失败 | 模型准确率降至配置的阈值以下 | 检查上游是否存在数据质量问题；使用 `drift_detector.py` 比较特征分布；使用新数据重新训练 |
| 模型注册表显示 "already registered" 错误 | 完全相同的名称与版本组合之前已注册 | 使用新的版本字符串（例如 v2.3.1），如果旧条目用于测试，也可以将其删除 |
| Kubernetes Pod 上的模型服务器陷入崩溃循环 | 模型大小超过内存限制导致 OOM 终止，或健康检查超时时间过短 | 提高 `resources.limits.memory`；对于大型模型，延长就绪探针的 `initialDelaySeconds` |
| 特征存储返回过期特征 | 物化作业失败，或作业运行时间超出 TTL 窗口 | 检查物化日志；重新运行 `materialize_features`；考虑缩短 TTL 或添加新鲜度警报 |
| `pipeline_validator.py` 报告 STAGE_ORDER 错误 | 流水线阶段的定义不符合预期顺序（数据 -> 转换 -> 训练 -> 评估 -> 部署） | 重新排列阶段以遵循规范顺序；验证器要求数据阶段位于训练阶段之前 |

## 成功标准

- 所有生产模型在承载流量之前，均已在模型注册表中完成注册，并包含版本、指标和参数。
- 漂移检测按计划周期运行（至少每周一次），并在 PSI > 0.2 或 KS > 0.15 时发出警报。
- ML 流水线在部署前运行 `pipeline_validator.py --strict` 时以零错误通过。
- 模型服务延迟保持在 SLA 范围内：P50 < 50 ms、P95 < 100 ms、P99 < 200 ms。
- 每次将模型提升到生产环境时，都会自动归档之前的生产版本。
- 在零停机的情况下，于 5 分钟内完成回滚到上一个模型版本。
- 流水线阶段包含评估门禁，当准确率低于定义的阈值时阻止部署。

## 范围与限制

**范围内：** 模型部署（实时和批处理）、ML 流水线编排、模型注册表管理、漂移检测（数据漂移、概念漂移、预测漂移）、特征存储模式、监控与告警、Kubernetes 部署配置，以及 ML 的 CI/CD。

**范围外：** 模型架构设计和算法选择（参见 data-scientist）、原始数据摄取流水线、BI 仪表板开发，以及业务战略。

**限制：** Python 工具仅使用 Python 标准库。`drift_detector.py` 使用适用于大多数分布的近似方法计算 KS 统计量和 PSI，但不支持多变量漂移检测，也不支持 Evidently/Alibi Detect 集成。`model_registry.py` 将状态存储在本地 JSON 文件中——在生产环境中使用时，请与 MLflow Model Registry 或类似平台集成。`pipeline_validator.py` 会验证结构和约定，但不会执行流水线阶段。

## 集成点

- **数据科学家**（`data-analytics/data-scientist`）：接收包含实验元数据的已训练模型；将获胜实验提升到注册表中以供部署。
- **分析工程师**（`data-analytics/analytics-engineer`）：特征工程流水线可能依赖 dbt 数据集市模型；模式变更会触发流水线重新验证。
- **工程**（`engineering/senior-ml-engineer`）：协作优化模型架构，以满足服务约束（延迟、内存、GPU）。
- **基础设施**（`engineering/`）：与平台工程团队共同管理 Kubernetes 配置、自动扩缩容策略和 CI/CD 工作流。
- **商业智能**（`data-analytics/business-intelligence`）：模型预测可能会提供给 BI 仪表板；监控指标会呈现在运营仪表板中。