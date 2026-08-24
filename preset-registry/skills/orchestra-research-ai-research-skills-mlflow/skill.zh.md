---
name: mlflow
description: Track ML experiments, manage model registry with versioning, deploy models to production, and reproduce experiments with MLflow - framework-agnostic ML lifecycle platform
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [MLOps, MLflow, Experiment Tracking, Model Registry, ML Lifecycle, Deployment, Model Versioning, PyTorch, TensorFlow, Scikit-Learn, HuggingFace]
dependencies: [mlflow, sqlalchemy, boto3]
---
# MLflow：机器学习生命周期管理平台

## 何时使用此技能

当你需要执行以下操作时，请使用 MLflow：
- **跟踪机器学习实验**，包括参数、指标和产物
- **管理模型注册表**，包括版本控制和阶段转换
- **将模型部署**到各种平台（本地、云端、服务系统）
- **通过项目配置复现实验**
- **比较模型版本**和性能指标
- **通过团队工作流协作**开展机器学习项目
- **集成**任意机器学习框架（与框架无关）

**用户**：20,000+ 家组织 | **GitHub 星标**：23k+ | **许可证**：Apache 2.0

## 安装

```bash
# Install MLflow
pip install mlflow

# Install with extras
pip install mlflow[extras]  # Includes SQLAlchemy, boto3, etc.

# Start MLflow UI
mlflow ui

# Access at http://localhost:5000
```

## 快速入门

### 基本跟踪

```python
import mlflow

# Start a run
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("batch_size", 32)

    # Your training code
    model = train_model()

    # Log metrics
    mlflow.log_metric("train_loss", 0.15)
    mlflow.log_metric("val_accuracy", 0.92)

    # Log model
    mlflow.sklearn.log_model(model, "model")
```

### 自动日志记录（自动跟踪）

```python
import mlflow
from sklearn.ensemble import RandomForestClassifier

# Enable autologging
mlflow.autolog()

# Train (automatically logged)
model = RandomForestClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

# Metrics, parameters, and model logged automatically!
```

## 核心概念

### 1. 实验和运行

**实验**：相关运行的逻辑容器  
**运行**：机器学习代码的一次执行（参数、指标、产物）

```python
import mlflow

# Create/set experiment
mlflow.set_experiment("my-experiment")

# Start a run
with mlflow.start_run(run_name="baseline-model"):
    # Log params
    mlflow.log_param("model", "ResNet50")
    mlflow.log_param("epochs", 10)

    # Train
    model = train()

    # Log metrics
    mlflow.log_metric("accuracy", 0.95)

    # Log model
    mlflow.pytorch.log_model(model, "model")

# Run ID is automatically generated
print(f"Run ID: {mlflow.active_run().info.run_id}")
```

### 2. 记录参数

```python
with mlflow.start_run():
    # Single parameter
    mlflow.log_param("learning_rate", 0.001)

    # Multiple parameters
    mlflow.log_params({
        "batch_size": 32,
        "epochs": 50,
        "optimizer": "Adam",
        "dropout": 0.2
    })

    # Nested parameters (as dict)
    config = {
        "model": {
            "architecture": "ResNet50",
            "pretrained": True
        },
        "training": {
            "lr": 0.001,
            "weight_decay": 1e-4
        }
    }

    # Log as JSON string or individual params
    for key, value in config.items():
        mlflow.log_param(key, str(value))
```

### 3. 记录指标

```python
with mlflow.start_run():
    # Training loop
    for epoch in range(NUM_EPOCHS):
        train_loss = train_epoch()
        val_loss = validate()

        # Log metrics at each step
        mlflow.log_metric("train_loss", train_loss, step=epoch)
        mlflow.log_metric("val_loss", val_loss, step=epoch)

        # Log multiple metrics
        mlflow.log_metrics({
            "train_accuracy": train_acc,
            "val_accuracy": val_acc
        }, step=epoch)

    # Log final metrics (no step)
    mlflow.log_metric("final_accuracy", final_acc)
```

### 4. 记录制品

```python
with mlflow.start_run():
    # Log file
    model.save('model.pkl')
    mlflow.log_artifact('model.pkl')

    # Log directory
    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/loss_curve.png')
    mlflow.log_artifacts('plots')

    # Log text
    with open('config.txt', 'w') as f:
        f.write(str(config))
    mlflow.log_artifact('config.txt')

    # Log dict as JSON
    mlflow.log_dict({'config': config}, 'config.json')
```

### 5. 记录模型

```python
# PyTorch
import mlflow.pytorch

with mlflow.start_run():
    model = train_pytorch_model()
    mlflow.pytorch.log_model(model, "model")

# Scikit-learn
import mlflow.sklearn

with mlflow.start_run():
    model = train_sklearn_model()
    mlflow.sklearn.log_model(model, "model")

# Keras/TensorFlow
import mlflow.keras

with mlflow.start_run():
    model = train_keras_model()
    mlflow.keras.log_model(model, "model")

# HuggingFace Transformers
import mlflow.transformers

with mlflow.start_run():
    mlflow.transformers.log_model(
        transformers_model={
            "model": model,
            "tokenizer": tokenizer
        },
        artifact_path="model"
    )
```

## 自动记录

自动记录常用框架的指标、参数和模型。

### 启用自动记录

```python
import mlflow

# Enable for all supported frameworks
mlflow.autolog()

# Or enable for specific framework
mlflow.sklearn.autolog()
mlflow.pytorch.autolog()
mlflow.keras.autolog()
mlflow.xgboost.autolog()
```

### 在 Scikit-learn 中使用自动记录

```python
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Enable autologging
mlflow.sklearn.autolog()

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train (automatically logs params, metrics, model)
with mlflow.start_run():
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    # Metrics like accuracy, f1_score logged automatically
    # Model logged automatically
    # Training duration logged
```

### 在 PyTorch Lightning 中使用自动记录

```python
import mlflow
import pytorch_lightning as pl

# Enable autologging
mlflow.pytorch.autolog()

# Train
with mlflow.start_run():
    trainer = pl.Trainer(max_epochs=10)
    trainer.fit(model, datamodule=dm)

    # Hyperparameters logged
    # Training metrics logged
    # Best model checkpoint logged
```

## 模型注册表

通过版本控制和阶段转换管理模型生命周期。

### 注册模型

```python
import mlflow

# Log and register model
with mlflow.start_run():
    model = train_model()

    # Log model
    mlflow.sklearn.log_model(
        model,
        "model",
        registered_model_name="my-classifier"  # Register immediately
    )

# Or register later
run_id = "abc123"
model_uri = f"runs:/{run_id}/model"
mlflow.register_model(model_uri, "my-classifier")
```

### 模型阶段

在不同阶段之间转换模型：**None** → **Staging** → **Production** → **Archived**

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Promote to staging
client.transition_model_version_stage(
    name="my-classifier",
    version=3,
    stage="Staging"
)

# Promote to production
client.transition_model_version_stage(
    name="my-classifier",
    version=3,
    stage="Production",
    archive_existing_versions=True  # Archive old production versions
)

# Archive model
client.transition_model_version_stage(
    name="my-classifier",
    version=2,
    stage="Archived"
)
```

### 从注册表加载模型

```python
import mlflow.pyfunc

# Load latest production model
model = mlflow.pyfunc.load_model("models:/my-classifier/Production")

# Load specific version
model = mlflow.pyfunc.load_model("models:/my-classifier/3")

# Load from staging
model = mlflow.pyfunc.load_model("models:/my-classifier/Staging")

# Use model
predictions = model.predict(X_test)
```

### 模型版本管理

```python
client = MlflowClient()

# List all versions
versions = client.search_model_versions("name='my-classifier'")

for v in versions:
    print(f"Version {v.version}: {v.current_stage}")

# Get latest version by stage
latest_prod = client.get_latest_versions("my-classifier", stages=["Production"])
latest_staging = client.get_latest_versions("my-classifier", stages=["Staging"])

# Get model version details
version_info = client.get_model_version(name="my-classifier", version="3")
print(f"Run ID: {version_info.run_id}")
print(f"Stage: {version_info.current_stage}")
print(f"Tags: {version_info.tags}")
```

### 模型注解

```python
client = MlflowClient()

# Add description
client.update_model_version(
    name="my-classifier",
    version="3",
    description="ResNet50 classifier trained on 1M images with 95% accuracy"
)

# Add tags
client.set_model_version_tag(
    name="my-classifier",
    version="3",
    key="validation_status",
    value="approved"
)

client.set_model_version_tag(
    name="my-classifier",
    version="3",
    key="deployed_date",
    value="2025-01-15"
)
```

## 搜索运行记录

以编程方式查找运行记录。

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Search all runs in experiment
experiment_id = client.get_experiment_by_name("my-experiment").experiment_id
runs = client.search_runs(
    experiment_ids=[experiment_id],
    filter_string="metrics.accuracy > 0.9",
    order_by=["metrics.accuracy DESC"],
    max_results=10
)

for run in runs:
    print(f"Run ID: {run.info.run_id}")
    print(f"Accuracy: {run.data.metrics['accuracy']}")
    print(f"Params: {run.data.params}")

# Search with complex filters
runs = client.search_runs(
    experiment_ids=[experiment_id],
    filter_string="""
        metrics.accuracy > 0.9 AND
        params.model = 'ResNet50' AND
        tags.dataset = 'ImageNet'
    """,
    order_by=["metrics.f1_score DESC"]
)
```

## 集成示例

### PyTorch

```python
import mlflow
import torch
import torch.nn as nn

# Enable autologging
mlflow.pytorch.autolog()

with mlflow.start_run():
    # Log config
    config = {
        "lr": 0.001,
        "epochs": 10,
        "batch_size": 32
    }
    mlflow.log_params(config)

    # Train
    model = create_model()
    optimizer = torch.optim.Adam(model.parameters(), lr=config["lr"])

    for epoch in range(config["epochs"]):
        train_loss = train_epoch(model, optimizer, train_loader)
        val_loss, val_acc = validate(model, val_loader)

        # Log metrics
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_loss": val_loss,
            "val_accuracy": val_acc
        }, step=epoch)

    # Log model
    mlflow.pytorch.log_model(model, "model")
```

### HuggingFace Transformers

```python
import mlflow
from transformers import Trainer, TrainingArguments

# Enable autologging
mlflow.transformers.autolog()

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True
)

# Start MLflow run
with mlflow.start_run():
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset
    )

    # Train (automatically logged)
    trainer.train()

    # Log final model to registry
    mlflow.transformers.log_model(
        transformers_model={
            "model": trainer.model,
            "tokenizer": tokenizer
        },
        artifact_path="model",
        registered_model_name="hf-classifier"
    )
```

### XGBoost

```python
import mlflow
import xgboost as xgb

# Enable autologging
mlflow.xgboost.autolog()

with mlflow.start_run():
    dtrain = xgb.DMatrix(X_train, label=y_train)
    dval = xgb.DMatrix(X_val, label=y_val)

    params = {
        'max_depth': 6,
        'learning_rate': 0.1,
        'objective': 'binary:logistic',
        'eval_metric': ['logloss', 'auc']
    }

    # Train (automatically logged)
    model = xgb.train(
        params,
        dtrain,
        num_boost_round=100,
        evals=[(dtrain, 'train'), (dval, 'val')],
        early_stopping_rounds=10
    )

    # Model and metrics logged automatically
```

## 最佳实践

### 1. 使用实验进行组织

```python
# ✅ Good: Separate experiments for different tasks
mlflow.set_experiment("sentiment-analysis")
mlflow.set_experiment("image-classification")
mlflow.set_experiment("recommendation-system")

# ❌ Bad: Everything in one experiment
mlflow.set_experiment("all-models")
```

### 2. 使用描述性的运行名称

```python
# ✅ Good: Descriptive names
with mlflow.start_run(run_name="resnet50-imagenet-lr0.001-bs32"):
    train()

# ❌ Bad: No name (auto-generated UUID)
with mlflow.start_run():
    train()
```

### 3. 记录全面的元数据

```python
with mlflow.start_run():
    # Log hyperparameters
    mlflow.log_params({
        "learning_rate": 0.001,
        "batch_size": 32,
        "epochs": 50
    })

    # Log system info
    mlflow.set_tags({
        "dataset": "ImageNet",
        "framework": "PyTorch 2.0",
        "gpu": "A100",
        "git_commit": get_git_commit()
    })

    # Log data info
    mlflow.log_param("train_samples", len(train_dataset))
    mlflow.log_param("val_samples", len(val_dataset))
```

### 4. 跟踪模型血缘

```python
# Link runs to understand lineage
with mlflow.start_run(run_name="preprocessing"):
    data = preprocess()
    mlflow.log_artifact("data.csv")
    preprocessing_run_id = mlflow.active_run().info.run_id

with mlflow.start_run(run_name="training"):
    # Reference parent run
    mlflow.set_tag("preprocessing_run_id", preprocessing_run_id)
    model = train(data)
```

### 5. 使用模型注册表进行部署

```python
# ✅ Good: Use registry for production
model_uri = "models:/my-classifier/Production"
model = mlflow.pyfunc.load_model(model_uri)

# ❌ Bad: Hard-code run IDs
model_uri = "runs:/abc123/model"
model = mlflow.pyfunc.load_model(model_uri)
```

## 部署

### 在本地提供模型服务

```bash
# Serve registered model
mlflow models serve -m "models:/my-classifier/Production" -p 5001

# Serve from run
mlflow models serve -m "runs:/<RUN_ID>/model" -p 5001

# Test endpoint
curl http://127.0.0.1:5001/invocations -H 'Content-Type: application/json' -d '{
  "inputs": [[1.0, 2.0, 3.0, 4.0]]
}'
```

### 部署到云端

```bash
# Deploy to AWS SageMaker
mlflow sagemaker deploy -m "models:/my-classifier/Production" --region-name us-west-2

# Deploy to Azure ML
mlflow azureml deploy -m "models:/my-classifier/Production"
```

## 配置

### 跟踪服务器

```bash
# Start tracking server with backend store
mlflow server \
  --backend-store-uri postgresql://user:password@localhost/mlflow \
  --default-artifact-root s3://my-bucket/mlflow \
  --host 0.0.0.0 \
  --port 5000
```

### 客户端配置

```python
import mlflow

# Set tracking URI
mlflow.set_tracking_uri("http://localhost:5000")

# Or use environment variable
# export MLFLOW_TRACKING_URI=http://localhost:5000
```

## 资源

- **文档**：https://mlflow.org/docs/latest
- **GitHub**：https://github.com/mlflow/mlflow（23k+ stars）
- **示例**：https://github.com/mlflow/mlflow/tree/master/examples
- **社区**：https://mlflow.org/community

## 另请参阅

- `references/tracking.md` - 综合跟踪指南
- `references/model-registry.md` - 模型生命周期管理
- `references/deployment.md` - 生产环境部署模式