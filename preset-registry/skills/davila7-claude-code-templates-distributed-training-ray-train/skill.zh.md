---
name: ray-train
description: Distributed training orchestration across clusters. Scales PyTorch/TensorFlow/HuggingFace from laptop to 1000s of nodes. Built-in hyperparameter tuning with Ray Tune, fault tolerance, elastic scaling. Use when training massive models across multiple machines or running distributed hyperparameter sweeps.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Ray Train, Distributed Training, Orchestration, Ray, Hyperparameter Tuning, Fault Tolerance, Elastic Scaling, Multi-Node, PyTorch, TensorFlow]
dependencies: ["ray[train]", torch, transformers]
---
# Ray Train - 分布式训练编排

## 快速入门

Ray Train 只需极少的代码改动，即可将机器学习训练从单 GPU 扩展到多节点集群。

**安装**：
```bash
pip install -U "ray[train]"
```

**基础 PyTorch 训练**（单节点）：

```python
import ray
from ray import train
from ray.train import ScalingConfig
from ray.train.torch import TorchTrainer
import torch
import torch.nn as nn

# Define training function
def train_func(config):
    # Your normal PyTorch code
    model = nn.Linear(10, 1)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

    # Prepare for distributed (Ray handles device placement)
    model = train.torch.prepare_model(model)

    for epoch in range(10):
        # Your training loop
        output = model(torch.randn(32, 10))
        loss = output.sum()
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        # Report metrics (logged automatically)
        train.report({"loss": loss.item(), "epoch": epoch})

# Run distributed training
trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(
        num_workers=4,  # 4 GPUs/workers
        use_gpu=True
    )
)

result = trainer.fit()
print(f"Final loss: {result.metrics['loss']}")
```

**就是这么简单！** Ray 会处理：
- 分布式协调
- GPU 分配
- 容错
- 检查点保存
- 指标聚合

## 常见工作流

### 工作流 1：扩展现有 PyTorch 代码

**原始单 GPU 代码**：
```python
model = MyModel().cuda()
optimizer = torch.optim.Adam(model.parameters())

for epoch in range(epochs):
    for batch in dataloader:
        loss = model(batch)
        loss.backward()
        optimizer.step()
```

**Ray Train 版本**（可扩展至多 GPU/多节点）：
```python
from ray.train.torch import TorchTrainer
from ray import train

def train_func(config):
    model = MyModel()
    optimizer = torch.optim.Adam(model.parameters())

    # Prepare for distributed (automatic device placement)
    model = train.torch.prepare_model(model)
    dataloader = train.torch.prepare_data_loader(dataloader)

    for epoch in range(epochs):
        for batch in dataloader:
            loss = model(batch)
            loss.backward()
            optimizer.step()

            # Report metrics
            train.report({"loss": loss.item()})

# Scale to 8 GPUs
trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(num_workers=8, use_gpu=True)
)
trainer.fit()
```

**优势**：同一套代码可在 1 个 GPU 或 1000 个 GPU 上运行

### 工作流 2：HuggingFace Transformers 集成

```python
from ray.train.huggingface import TransformersTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments

def train_func(config):
    # Load model and tokenizer
    model = AutoModelForCausalLM.from_pretrained("gpt2")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")

    # Training arguments (HuggingFace API)
    training_args = TrainingArguments(
        output_dir="./output",
        num_train_epochs=3,
        per_device_train_batch_size=8,
        learning_rate=2e-5,
    )

    # Ray automatically handles distributed training
    from transformers import Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
    )

    trainer.train()

# Scale to multi-node (2 nodes × 8 GPUs = 16 workers)
trainer = TransformersTrainer(
    train_func,
    scaling_config=ScalingConfig(
        num_workers=16,
        use_gpu=True,
        resources_per_worker={"GPU": 1}
    )
)

result = trainer.fit()
```

### 工作流 3：使用 Ray Tune 进行超参数调优

```python
from ray import tune
from ray.train.torch import TorchTrainer
from ray.tune.schedulers import ASHAScheduler

def train_func(config):
    # Use hyperparameters from config
    lr = config["lr"]
    batch_size = config["batch_size"]

    model = MyModel()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    model = train.torch.prepare_model(model)

    for epoch in range(10):
        # Training loop
        loss = train_epoch(model, optimizer, batch_size)
        train.report({"loss": loss, "epoch": epoch})

# Define search space
param_space = {
    "lr": tune.loguniform(1e-5, 1e-2),
    "batch_size": tune.choice([16, 32, 64, 128])
}

# Run 20 trials with early stopping
tuner = tune.Tuner(
    TorchTrainer(
        train_func,
        scaling_config=ScalingConfig(num_workers=4, use_gpu=True)
    ),
    param_space=param_space,
    tune_config=tune.TuneConfig(
        num_samples=20,
        scheduler=ASHAScheduler(metric="loss", mode="min")
    )
)

results = tuner.fit()
best = results.get_best_result(metric="loss", mode="min")
print(f"Best hyperparameters: {best.config}")
```

**结果**：在集群中进行分布式超参数搜索

### 工作流 4：检查点与容错

```python
from ray import train
from ray.train import Checkpoint

def train_func(config):
    model = MyModel()
    optimizer = torch.optim.Adam(model.parameters())

    # Try to resume from checkpoint
    checkpoint = train.get_checkpoint()
    if checkpoint:
        with checkpoint.as_directory() as checkpoint_dir:
            state = torch.load(f"{checkpoint_dir}/model.pt")
            model.load_state_dict(state["model"])
            optimizer.load_state_dict(state["optimizer"])
            start_epoch = state["epoch"]
    else:
        start_epoch = 0

    model = train.torch.prepare_model(model)

    for epoch in range(start_epoch, 100):
        loss = train_epoch(model, optimizer)

        # Save checkpoint every 10 epochs
        if epoch % 10 == 0:
            checkpoint = Checkpoint.from_directory(
                train.get_context().get_trial_dir()
            )
            torch.save({
                "model": model.state_dict(),
                "optimizer": optimizer.state_dict(),
                "epoch": epoch
            }, checkpoint.path / "model.pt")

            train.report({"loss": loss}, checkpoint=checkpoint)

trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(num_workers=8, use_gpu=True)
)

# Automatically resumes from checkpoint if training fails
result = trainer.fit()
```

### 工作流 5：多节点训练

```python
from ray.train import ScalingConfig

# Connect to Ray cluster
ray.init(address="auto")  # Or ray.init("ray://head-node:10001")

# Train across 4 nodes × 8 GPUs = 32 workers
trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(
        num_workers=32,
        use_gpu=True,
        resources_per_worker={"GPU": 1, "CPU": 4},
        placement_strategy="SPREAD"  # Spread across nodes
    )
)

result = trainer.fit()
```

**启动 Ray 集群**：
```bash
# On head node
ray start --head --port=6379

# On worker nodes
ray start --address=<head-node-ip>:6379
```

## 何时使用及何时选择替代方案

**适合使用 Ray Train 的情况**：
- 跨多台机器训练（多节点）
- 需要进行大规模超参数调优
- 需要容错能力（自动重启失败的工作进程）
- 弹性伸缩（在训练期间添加/移除节点）
- 需要统一框架（同一套代码适用于 PyTorch/TF/HF）

**主要优势**：
- **多节点编排**：最简单的多节点配置方式
- **Ray Tune 集成**：一流的超参数调优
- **容错能力**：自动从故障中恢复
- **弹性伸缩**：无需重启即可添加/移除节点
- **框架无关**：PyTorch、TensorFlow、HuggingFace、XGBoost

**应改用替代方案的情况**：
- **Accelerate**：单节点多 GPU，更简单
- **PyTorch Lightning**：高级抽象和回调机制
- **DeepSpeed**：性能最大化，但配置复杂
- **原生 DDP**：控制能力最强，开销最低

## 常见问题

**问题：Ray 集群无法连接**

检查 Ray 状态：
```bash
ray status

# Should show:
# - Nodes: 4
# - GPUs: 32
# - Workers: Ready
```

如果未连接：
```bash
# Restart head node
ray stop
ray start --head --port=6379 --dashboard-host=0.0.0.0

# Restart worker nodes
ray stop
ray start --address=<head-ip>:6379
```

**问题：内存不足**

减少工作进程数量或使用梯度累积：
```python
scaling_config=ScalingConfig(
    num_workers=4,  # Reduce from 8
    use_gpu=True
)

# In train_func, accumulate gradients
for i, batch in enumerate(dataloader):
    loss = model(batch) / accumulation_steps
    loss.backward()

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

**问题：训练速度慢**

检查数据加载是否为瓶颈：
```python
import time

def train_func(config):
    for epoch in range(epochs):
        start = time.time()
        for batch in dataloader:
            data_time = time.time() - start
            # Train...
            start = time.time()
            print(f"Data loading: {data_time:.3f}s")
```

如果数据加载速度慢，请增加工作进程数量：
```python
dataloader = DataLoader(dataset, num_workers=8)
```

## 高级主题

**多节点配置**：有关在 AWS、GCP、Kubernetes 和 SLURM 上部署 Ray 集群的信息，请参阅 [references/multi-node.md](references/multi-node.md)。

**超参数调优**：有关 Ray Tune 集成、搜索算法（Optuna、HyperOpt）和基于种群的训练，请参阅 [references/hyperparameter-tuning.md](references/hyperparameter-tuning.md)。

**自定义训练循环**：有关 Ray Train 的高级用法、自定义后端以及与其他框架的集成，请参阅 [references/custom-loops.md](references/custom-loops.md)。

## 硬件要求

- **单节点**：1 个或更多 GPU（或 CPU）
- **多节点**：2 台或更多具备网络连接的机器
- **云平台**：AWS、GCP、Azure（Ray 自动伸缩）
- **本地部署**：Kubernetes、SLURM 集群

**支持的加速器**：
- NVIDIA GPU（CUDA）
- AMD GPU（ROCm）
- TPU（Google Cloud）
- CPU

## 资源

- 文档：https://docs.ray.io/en/latest/train/train.html
- GitHub：https://github.com/ray-project/ray ⭐ 36,000+
- 版本：2.40.0+
- 示例：https://docs.ray.io/en/latest/train/examples.html
- Slack：https://forms.gle/9TSdDYUgxYs8SA9e8
- 使用者：OpenAI、Uber、Spotify、Shopify、Instacart