---
name: experiment-tracking-swanlab
description: Provides guidance for experiment tracking with SwanLab. Use when you need open-source run tracking, local or self-hosted dashboards, and lightweight media logging for ML workflows.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [MLOps, SwanLab, Experiment Tracking, Open Source, Visualization, PyTorch, Transformers, PyTorch Lightning, Fastai, Self-Hosted]
dependencies: [swanlab>=0.7.11, pillow>=9.0.0, soundfile>=0.12.0]
---
# SwanLab：开源实验跟踪

## 何时使用此技能

在以下情况下使用 SwanLab：
- **跟踪机器学习实验**，记录指标、配置、标签和描述
- **可视化训练过程**，展示标量图表和已记录的媒体
- **比较运行结果**，涵盖不同随机种子、检查点和超参数
- **在本地或自托管环境中工作**，无需依赖托管式 SaaS
- **集成** PyTorch、Transformers、PyTorch Lightning 或 Fastai

**部署方式**：云端、本地或自托管 | **媒体类型**：图像、音频、文本、GIF、点云、分子 | **集成**：PyTorch、Transformers、PyTorch Lightning、Fastai

## 安装

```bash
# Install SwanLab plus the media dependencies used in this skill
pip install "swanlab>=0.7.11" "pillow>=9.0.0" "soundfile>=0.12.0"

# Add local dashboard support for mode="local" and swanlab watch
pip install "swanlab[dashboard]>=0.7.11"

# Optional framework integrations
pip install transformers pytorch-lightning fastai

# Login for cloud or self-hosted usage
swanlab login
```

`pillow` 和 `soundfile` 是此技能中图像和音频示例所使用的媒体依赖项。`swanlab[dashboard]` 会添加 `mode="local"` 和 `swanlab watch` 所需的本地仪表板依赖项。

## 快速开始

### 基本实验跟踪

```python
import swanlab

run = swanlab.init(
    project="my-project",
    experiment_name="baseline",
    config={
        "learning_rate": 1e-3,
        "epochs": 10,
        "batch_size": 32,
        "model": "resnet18",
    },
)

for epoch in range(run.config.epochs):
    train_loss = train_epoch()
    val_loss = validate()

    swanlab.log(
        {
            "train/loss": train_loss,
            "val/loss": val_loss,
            "epoch": epoch,
        }
    )

run.finish()
```

### 使用 PyTorch

```python
import torch
import torch.nn as nn
import torch.optim as optim
import swanlab

run = swanlab.init(
    project="pytorch-demo",
    experiment_name="mnist-mlp",
    config={
        "learning_rate": 1e-3,
        "batch_size": 64,
        "epochs": 10,
        "hidden_size": 128,
    },
)

model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(28 * 28, run.config.hidden_size),
    nn.ReLU(),
    nn.Linear(run.config.hidden_size, 10),
)
optimizer = optim.Adam(model.parameters(), lr=run.config.learning_rate)
criterion = nn.CrossEntropyLoss()

for epoch in range(run.config.epochs):
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        optimizer.zero_grad()
        logits = model(data)
        loss = criterion(logits, target)
        loss.backward()
        optimizer.step()

        if batch_idx % 100 == 0:
            swanlab.log(
                {
                    "train/loss": loss.item(),
                    "train/epoch": epoch,
                    "train/batch": batch_idx,
                }
            )

run.finish()
```

## 核心概念

### 1. 项目与实验

**项目**：相关实验的集合  
**实验**：一次训练或评估流程的单次执行

```python
import swanlab

run = swanlab.init(
    project="image-classification",
    experiment_name="resnet18-seed42",
    description="Baseline run on ImageNet subset",
    tags=["baseline", "resnet18"],
    config={
        "model": "resnet18",
        "seed": 42,
        "batch_size": 64,
        "learning_rate": 3e-4,
    },
)

print(run.id)
print(run.config.learning_rate)
```

### 2. 配置跟踪

```python
config = {
    "model": "resnet18",
    "seed": 42,
    "batch_size": 64,
    "learning_rate": 3e-4,
    "epochs": 20,
}

run = swanlab.init(project="my-project", config=config)

learning_rate = run.config.learning_rate
batch_size = run.config.batch_size
```

### 3. 指标记录

```python
# Log scalars
swanlab.log({"loss": 0.42, "accuracy": 0.91})

# Log multiple metrics
swanlab.log(
    {
        "train/loss": train_loss,
        "train/accuracy": train_acc,
        "val/loss": val_loss,
        "val/accuracy": val_acc,
        "lr": current_lr,
        "epoch": epoch,
    }
)

# Log with custom step
swanlab.log({"loss": loss}, step=global_step)
```

### 4. 媒体和图表记录

```python
import numpy as np
import swanlab

# Image
image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
swanlab.log({"examples/image": swanlab.Image(image, caption="Augmented sample")})

# Audio
wave = np.sin(np.linspace(0, 8 * np.pi, 16000)).astype("float32")
swanlab.log({"examples/audio": swanlab.Audio(wave, sample_rate=16000)})

# Text
swanlab.log({"examples/text": swanlab.Text("Training notes for this run.")})

# GIF video
swanlab.log({"examples/video": swanlab.Video("predictions.gif", caption="Validation rollout")})

# Point cloud
points = np.random.rand(128, 3).astype("float32")
swanlab.log({"examples/point_cloud": swanlab.Object3D(points, caption="Point cloud sample")})

# Molecule
swanlab.log({"examples/molecule": swanlab.Molecule.from_smiles("CCO", caption="Ethanol")})
```

```python
# Custom chart with swanlab.echarts
line = swanlab.echarts.Line()
line.add_xaxis(["epoch-1", "epoch-2", "epoch-3"])
line.add_yaxis("train/loss", [0.92, 0.61, 0.44])
line.set_global_opts(
    title_opts=swanlab.echarts.options.TitleOpts(title="Training Loss")
)

swanlab.log({"charts/loss_curve": line})
```

更多图表和媒体模式请参阅 [references/visualization.md](references/visualization.md)。

### 5. 本地和自托管工作流

```python
import os
import swanlab

# Self-hosted or cloud login
swanlab.login(
    api_key=os.environ["SWANLAB_API_KEY"],
    host="http://your-server:5092",
)

# Local-only logging
run = swanlab.init(
    project="offline-demo",
    mode="local",
    logdir="./swanlog",
)

swanlab.log({"loss": 0.35, "epoch": 1})
run.finish()
```

```bash
# View local logs
swanlab watch -l ./swanlog

# Sync local logs later
swanlab sync ./swanlog
```

## 集成示例

### HuggingFace Transformers

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=8,
    evaluation_strategy="epoch",
    logging_steps=50,
    report_to="swanlab",
    run_name="bert-finetune",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)

trainer.train()
```

有关基于回调的设置和其他框架模式，请参阅 [references/integrations.md](references/integrations.md)。

### PyTorch Lightning

```python
import pytorch_lightning as pl
from swanlab.integration.pytorch_lightning import SwanLabLogger

swanlab_logger = SwanLabLogger(
    project="lightning-demo",
    experiment_name="mnist-classifier",
    config={"batch_size": 64, "max_epochs": 10},
)

trainer = pl.Trainer(
    logger=swanlab_logger,
    max_epochs=10,
    accelerator="auto",
)

trainer.fit(model, train_loader, val_loader)
```

### Fastai

```python
from fastai.vision.all import accuracy, resnet34, vision_learner
from swanlab.integration.fastai import SwanLabCallback

learn = vision_learner(dls, resnet34, metrics=accuracy)
learn.fit(
    5,
    cbs=[
        SwanLabCallback(
            project="fastai-demo",
            experiment_name="pets-classification",
            config={"arch": "resnet34", "epochs": 5},
        )
    ],
)
```

有关更完整的框架示例，请参阅 [references/integrations.md](references/integrations.md)。

## 最佳实践

### 1. 使用稳定的指标名称

```python
# Good: grouped metric namespaces
swanlab.log({
    "train/loss": train_loss,
    "train/accuracy": train_acc,
    "val/loss": val_loss,
    "val/accuracy": val_acc,
})

# Avoid mixing flat and grouped names for the same metric family
```

### 2. 尽早初始化，并一次性捕获配置

```python
run = swanlab.init(
    project="image-classification",
    experiment_name="resnet18-baseline",
    config={
        "model": "resnet18",
        "learning_rate": 3e-4,
        "batch_size": 64,
        "seed": 42,
    },
)
```

### 3. 在本地保存检查点

```python
import torch
import swanlab

checkpoint_path = "checkpoints/best.pth"
torch.save(model.state_dict(), checkpoint_path)

swanlab.log(
    {
        "best/val_accuracy": best_val_accuracy,
        "artifacts/checkpoint_path": swanlab.Text(checkpoint_path),
    }
)
```

### 4. 对于离线优先的工作流，使用本地模式

```python
run = swanlab.init(project="offline-demo", mode="local", logdir="./swanlog")
# ... training code ...
run.finish()

# Inspect later with: swanlab watch -l ./swanlog
```

### 5. 将高级模式放在参考文档中

- 使用 [references/visualization.md](references/visualization.md) 了解高级图表和媒体模式
- 使用 [references/integrations.md](references/integrations.md) 了解基于回调和特定框架的集成详情

## 资源

- [官方文档（中文）](https://docs.swanlab.cn)
- [官方文档（英文）](https://docs.swanlab.cn/en)
- [GitHub 仓库](https://github.com/SwanHubX/SwanLab)
- [自托管仓库](https://github.com/SwanHubX/self-hosted)

## 另请参阅

- [references/integrations.md](references/integrations.md) - 特定框架示例
- [references/visualization.md](references/visualization.md) - 图表和媒体记录模式