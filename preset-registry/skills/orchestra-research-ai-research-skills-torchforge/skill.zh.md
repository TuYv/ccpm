---
name: torchforge-rl-training
description: Provides guidance for PyTorch-native agentic RL using torchforge, Meta's library separating infra from algorithms. Use when you want clean RL abstractions, easy algorithm experimentation, or scalable training with Monarch and TorchTitan.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Reinforcement Learning, PyTorch, GRPO, SFT, Monarch, TorchTitan, Meta]
dependencies: [torch>=2.9.0, torchtitan>=0.2.0, vllm, monarch]
---
# torchforge：PyTorch 原生智能体 RL 库

torchforge 是 Meta 的 PyTorch 原生 RL 库，将基础设施相关工作与算法相关工作分离开来。它通过自动处理分布式训练、推理和权重同步，让你能够专注于算法，从而实现快速的 RL 研究。

## 何时使用 torchforge

**在以下情况下选择 torchforge：**
- 需要在 RL 算法与基础设施之间实现清晰分离
- 需要 PyTorch 原生抽象（不依赖 Ray）
- 需要便捷地进行算法实验（GRPO、DAPO、SAPO 约 100 行代码即可实现）
- 需要借助 Monarch actor 系统进行可扩展训练
- 需要与 TorchTitan 集成以实现模型并行

**在以下情况下考虑其他方案：**
- 需要生产环境级别的稳定性 → 使用 **miles** 或 **verl**
- 希望使用 Megatron 原生训练 → 使用 **slime**
- torchforge 仍处于实验阶段，API 可能会发生变化

## 主要特性

- **算法隔离**：实现 RL 算法时无需接触基础设施
- **可扩展性**：借助 Monarch，从单个 GPU 扩展到数千个 GPU
- **现代技术栈**：TorchTitan（训练）、vLLM（推理）、TorchStore（同步）
- **损失函数**：内置 GRPO、DAPO、CISPO、GSPO、SAPO

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│ Application Layer (Your Code)                           │
│ - Define reward models, loss functions, sampling        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Forge API Layer                                         │
│ - Episode, Group dataclasses                           │
│ - Service interfaces (async/await)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Distributed Services (Monarch)                          │
│ ├── Trainer (TorchTitan FSDP)                          │
│ ├── Generator (vLLM inference)                          │
│ ├── Reference Model (frozen KL baseline)               │
│ └── Reward Actors (compute rewards)                    │
└─────────────────────────────────────────────────────────┘
```

## 安装

```bash
# Create environment
conda create -n forge python=3.12
conda activate forge

# Install (handles PyTorch nightly + dependencies)
./scripts/install.sh

# Verify
python -c "import torch, forge, vllm; print('OK')"
```

### ROCm 安装

```bash
./scripts/install_rocm.sh
```

## 快速开始

### SFT 训练（2 个及以上 GPU）

```bash
python -m apps.sft.main --config apps/sft/llama3_8b.yaml
```

### GRPO 训练（3 个及以上 GPU）

```bash
python -m apps.grpo.main --config apps/grpo/qwen3_1_7b.yaml
```

---

## 工作流 1：用于数学推理的 GRPO 训练

使用此工作流训练基于组相对优势的推理模型。

### 前置条件检查清单
- [ ] 3 个及以上 GPU（GPU0：trainer，GPU1：ref_model，GPU2：generator）
- [ ] 来自 HuggingFace Hub 的模型
- [ ] 训练数据集（GSM8K、MATH 等）

### 步骤 1：创建配置

```yaml
# config/grpo_math.yaml
model: "Qwen/Qwen2.5-7B-Instruct"

dataset:
  path: "openai/gsm8k"
  split: "train"
  streaming: true

training:
  batch_size: 4
  learning_rate: 1e-6
  seq_len: 4096
  dtype: bfloat16
  gradient_accumulation_steps: 4

grpo:
  n_samples: 8           # Responses per prompt
  clip_low: 0.2
  clip_high: 0.28
  beta: 0.1              # KL penalty coefficient
  temperature: 0.7

services:
  generator:
    procs: 1
    num_replicas: 1
    with_gpus: true
  trainer:
    procs: 1
    num_replicas: 1
    with_gpus: true
  ref_model:
    procs: 1
    num_replicas: 1
    with_gpus: true
```

### 步骤 2：定义奖励函数

```python
# rewards.py
# Reward functions are in forge.data.rewards
from forge.data.rewards import MathReward, ThinkingReward
import re

# Or define your own reward function
class CustomMathReward:
    def __call__(self, prompt: str, response: str, target: str) -> float:
        # Extract answer from response
        match = re.search(r'\\boxed{([^}]+)}', response)
        if not match:
            return 0.0

        answer = match.group(1).strip()
        return 1.0 if answer == target else 0.0
```

### 步骤 3：启动训练

```bash
python -m apps.grpo.main --config config/grpo_math.yaml
```

### 步骤 4：监控进度
- [ ] 检查 W&B 仪表板中的损失曲线
- [ ] 确认熵正在下降（策略变得更加确定）
- [ ] 监控 KL 散度（应保持有界）

---

## 工作流 2：自定义损失函数

使用此工作流实现新的 RL 算法。

### 步骤 1：创建损失类

```python
# src/forge/losses/custom_loss.py
import torch
import torch.nn as nn

class CustomLoss(nn.Module):
    def __init__(self, clip_range: float = 0.2, beta: float = 0.1):
        super().__init__()
        self.clip_range = clip_range
        self.beta = beta

    def forward(
        self,
        logprobs: torch.Tensor,
        ref_logprobs: torch.Tensor,
        advantages: torch.Tensor,
        padding_mask: torch.Tensor,
    ) -> torch.Tensor:
        # Compute importance ratio
        ratio = torch.exp(logprobs - ref_logprobs)

        # Clipped policy gradient
        clipped_ratio = torch.clamp(
            ratio,
            1 - self.clip_range,
            1 + self.clip_range
        )
        pg_loss = -torch.min(ratio * advantages, clipped_ratio * advantages)

        # KL penalty
        kl = ref_logprobs - logprobs

        # Apply mask and aggregate
        masked_loss = (pg_loss + self.beta * kl) * padding_mask
        loss = masked_loss.sum() / padding_mask.sum()

        return loss
```

### 步骤 2：集成到应用中

```python
# apps/custom/main.py
from forge.losses.custom_loss import CustomLoss

loss_fn = CustomLoss(clip_range=0.2, beta=0.1)

# In training loop
loss = loss_fn(
    logprobs=logprobs,
    ref_logprobs=ref_logprobs,
    advantages=advantages,
    padding_mask=padding_mask,
)
```

---

## 工作流 3：多 GPU 分布式训练

使用此工作流扩展到多个 GPU 或节点。

### 分布式配置

```yaml
# config/distributed.yaml
model: "meta-llama/Meta-Llama-3.1-8B-Instruct"

parallelism:
  tensor_parallel_degree: 2    # Split model across GPUs
  pipeline_parallel_degree: 1
  data_parallel_shard_degree: 2

services:
  generator:
    procs: 2                   # 2 processes for TP=2
    num_replicas: 1
    with_gpus: true
  trainer:
    procs: 2
    num_replicas: 1
    with_gpus: true
```

### 使用 SLURM 启动

```bash
# Submit job
sbatch --nodes=2 --gpus-per-node=8 run_grpo.sh
```

### 在本地启动（多 GPU）

```bash
# 8 GPU setup
python -m apps.grpo.main \
    --config config/distributed.yaml \
    --trainer.procs 4 \
    --generator.procs 4
```

---

## 核心 API 参考

### 训练批次格式

torchforge 使用基于字典的批次进行训练：

```python
# inputs: list of dicts with torch.Tensor values
inputs = [{"tokens": torch.Tensor}]

# targets: list of dicts with training signals
targets = [{
    "response": torch.Tensor,
    "ref_logprobs": torch.Tensor,
    "advantages": torch.Tensor,
    "padding_mask": torch.Tensor
}]

# train_step returns loss as float
loss = trainer.train_step(inputs, targets)
```

### Completion

由 vLLM 生成的输出：

```python
@dataclass
class Completion:
    text: str              # Generated text
    token_ids: list[int]   # Token IDs
    logprobs: list[float]  # Log probabilities
    metadata: dict         # Custom metadata
```

---

## 内置损失函数

### 损失函数

损失函数位于 `forge.losses` 模块中：

```python
from forge.losses import SimpleGRPOLoss, ReinforceLoss

# SimpleGRPOLoss for GRPO training
loss_fn = SimpleGRPOLoss(beta=0.1)

# Forward pass
loss = loss_fn(
    logprobs=logprobs,
    ref_logprobs=ref_logprobs,
    advantages=advantages,
    padding_mask=padding_mask
)
```

### ReinforceLoss

```python
from forge.losses.reinforce_loss import ReinforceLoss

# With optional importance ratio clipping
loss_fn = ReinforceLoss(clip_ratio=0.2)
```

---

## 常见问题和解决方案

### 问题：GPU 数量不足

**症状**：“Insufficient GPU resources”错误

**解决方案**：
```yaml
# Reduce service requirements
services:
  generator:
    procs: 1
    with_gpus: true
  trainer:
    procs: 1
    with_gpus: true
  # Remove ref_model (uses generator weights)
```

或者对 reference model 使用 CPU：
```yaml
ref_model:
  with_gpus: false
```

### 问题：生成期间 OOM

**症状**：vLLM 中出现 CUDA OOM

**解决方案**：
```yaml
# Reduce batch size
grpo:
  n_samples: 4  # Reduce from 8

# Or reduce sequence length
training:
  seq_len: 2048
```

### 问题：权重同步缓慢

**症状**：训练和生成之间出现长时间暂停

**解决方案**：
```bash
# Enable RDMA (if available)
export TORCHSTORE_USE_RDMA=1

# Or reduce sync frequency
training:
  sync_interval: 10  # Sync every 10 steps
```

### 问题：策略崩溃

**症状**：熵降至零，奖励不再提升

**解决方案**:
```yaml
# Increase KL penalty
grpo:
  beta: 0.2  # Increase from 0.1

# Or add entropy bonus
training:
  entropy_coef: 0.01
```

---

## 资源

- **文档**: https://meta-pytorch.org/torchforge
- **GitHub**: https://github.com/meta-pytorch/torchforge
- **Discord**: https://discord.gg/YsTYBh6PD9
- **TorchTitan**: https://github.com/pytorch/torchtitan
- **Monarch**: https://github.com/meta-pytorch/monarch