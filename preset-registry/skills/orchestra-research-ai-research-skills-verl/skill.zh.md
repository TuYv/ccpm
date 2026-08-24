---
name: verl-rl-training
description: Provides guidance for training LLMs with reinforcement learning using verl (Volcano Engine RL). Use when implementing RLHF, GRPO, PPO, or other RL algorithms for LLM post-training at scale with flexible infrastructure backends.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Reinforcement Learning, RLHF, GRPO, PPO, Post-Training, Distributed Training]
dependencies: [verl>=0.3.0, torch>=2.0.0, ray>=2.41.0, vllm>=0.8.2, transformers>=4.40.0]
---
# verl：面向 LLM 的火山引擎强化学习

verl 是字节跳动 Seed 团队推出的灵活、高效且适用于生产环境的大语言模型 RL 训练库。它实现了 HybridFlow 框架（EuroSys 2025），并为 Doubao-1.5-pro 等模型提供支持，使其在数学基准测试中达到 O1 级别的性能。

## 适用场景

**在以下情况下选择 verl：**
- 需要大规模、适用于生产环境的 RL 训练（已测试支持最高 671B 参数）
- 需要灵活切换后端（FSDP ↔ Megatron-LM ↔ vLLM ↔ SGLang）
- 需要支持多种 RL 算法（PPO、GRPO、RLOO、REINFORCE++、DAPO）
- 需要支持工具调用的多轮 rollout，以构建智能体工作流
- 需要进行视觉语言模型 RL 训练

**在以下情况下考虑其他方案：**
- 需要原生 Megatron 训练 → 使用 **slime** 或 **miles**
- 希望使用基于 PyTorch 原生抽象和 Monarch 的方案 → 使用 **torchforge**
- 只需要简单的 SFT/DPO → 使用 **TRL** 或 **Axolotl**

## 主要特性

- **训练后端**：FSDP、FSDP2、Megatron-LM
- **Rollout 引擎**：vLLM、SGLang、HuggingFace Transformers
- **算法**：PPO、GRPO、DAPO、RLOO、ReMax、REINFORCE++、SPIN、SPPO
- **模型**：Qwen-3、Llama-3.1、DeepSeek、Gemma-2（0.5B 至 671B）
- **高级功能**：LoRA RL、序列并行、专家并行、多轮工具调用

## 安装

```bash
# Option 1: pip install
pip install verl[vllm]  # or verl[sglang] for SGLang backend

# Option 2: Docker (recommended for production)
docker pull verlai/verl:vllm011.latest

# Option 3: From source
git clone https://github.com/volcengine/verl.git
cd verl && pip install -e .[vllm,math]
```

## 快速开始：GRPO 训练

```bash
python3 -m verl.trainer.main_ppo \
    algorithm.adv_estimator=grpo \
    data.train_files=~/data/gsm8k/train.parquet \
    actor_rollout_ref.model.path=Qwen/Qwen2.5-7B \
    actor_rollout_ref.rollout.n=8 \
    actor_rollout_ref.actor.use_kl_loss=True \
    trainer.n_gpus_per_node=8
```

## 核心架构

verl 使用 **HybridFlow** 编程模型，将控制流与计算分离：

```
┌─────────────────────────────────────────────────────────┐
│ Single-Process Controller (Ray)                         │
│ - Orchestrates: rollout → reward → train → sync        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Multi-Process Workers                                   │
│ ├── ActorRolloutRefWorker (policy + generation)        │
│ ├── CriticWorker (value estimation, PPO only)          │
│ └── RewardManager (model-based or rule-based rewards)  │
└─────────────────────────────────────────────────────────┘
```

---

## 工作流 1：使用 GRPO 进行数学推理

使用此工作流在 GSM8K 或 MATH 等数学任务上训练推理模型。

### 前置条件检查清单
- [ ] 配备至少 8 张 GPU 的 GPU 集群（推荐 H100）
- [ ] 使用 parquet 格式的数据集，并包含 `prompt` 和 `reward_model` 列
- [ ] 来自 HuggingFace Hub 的基础模型

### 步骤 1：准备数据集

```python
import pandas as pd

data = [
    {
        "prompt": [{"role": "user", "content": "What is 15 + 27?"}],
        "reward_model": {"ground_truth": "42"}
    },
    # ... more examples
]
df = pd.DataFrame(data)
df.to_parquet("train.parquet")
```

### 步骤 2：定义奖励函数

```python
# reward_function.py
import re

def compute_reward(responses, ground_truths):
    rewards = []
    for response, gt in zip(responses, ground_truths):
        # Extract answer from response
        match = re.search(r'\\boxed{([^}]+)}', response)
        if match and match.group(1).strip() == gt.strip():
            rewards.append(1.0)
        else:
            rewards.append(0.0)
    return rewards
```

### 步骤 3：创建训练配置

```yaml
# config/grpo_math.yaml
algorithm:
  adv_estimator: grpo
  gamma: 1.0
  lam: 1.0

data:
  train_files: /path/to/train.parquet
  val_files: /path/to/val.parquet
  train_batch_size: 256
  max_prompt_length: 512
  max_response_length: 2048

actor_rollout_ref:
  model:
    path: Qwen/Qwen2.5-7B-Instruct
  actor:
    use_kl_loss: true
    kl_loss_coef: 0.001
    ppo_mini_batch_size: 64
  rollout:
    name: vllm
    n: 8  # samples per prompt
    temperature: 0.7
    top_p: 0.95

trainer:
  total_epochs: 3
  n_gpus_per_node: 8
  save_freq: 100
```

### 步骤 4：启动训练

```bash
python3 -m verl.trainer.main_ppo \
    --config-path config \
    --config-name grpo_math \
    trainer.experiment_name=grpo_math_qwen7b
```

### 步骤 5：监控和验证
- [ ] 检查 WandB/TensorBoard 中的损失曲线
- [ ] 验证奖励是否随着步数增加
- [ ] 在留出的测试集上运行评估

---

## 工作流 2：使用 Critic 模型的 PPO

当你需要基于价值的优势估计（GAE）时，使用此工作流。

### 与 GRPO 的主要差异
- 需要单独的 critic 模型
- 使用广义优势估计（GAE）
- 更适合具有稠密奖励的任务

### 配置

```yaml
algorithm:
  adv_estimator: gae  # Use GAE instead of GRPO
  gamma: 0.99
  lam: 0.95

critic:
  model:
    path: Qwen/Qwen2.5-7B-Instruct  # Can be same or different from actor
  ppo_mini_batch_size: 64

actor_rollout_ref:
  actor:
    use_kl_loss: true
    kl_loss_coef: 0.02
    clip_ratio: 0.2  # PPO clipping
```

### 使用 Critic 启动

```bash
python3 -m verl.trainer.main_ppo \
    algorithm.adv_estimator=gae \
    critic.model.path=Qwen/Qwen2.5-7B-Instruct \
    trainer.n_gpus_per_node=8
```

---

## 工作流 3：使用 Megatron 进行大规模训练

对于参数量超过 70B 的模型，或当你需要专家并行时，使用此工作流。

### 先决条件
- [ ] 安装 Megatron-LM bridge：`pip install mbridge`
- [ ] 将模型转换为 Megatron 格式
- [ ] 配置带有 NVLink/InfiniBand 的多节点集群

### 70B+ 模型的配置

```yaml
actor_rollout_ref:
  model:
    path: /path/to/megatron/checkpoint
    backend: megatron
  actor:
    strategy: megatron
    tensor_model_parallel_size: 8
    pipeline_model_parallel_size: 2
  rollout:
    name: vllm
    tensor_parallel_size: 8
```

### 启动多节点

```bash
# On head node
ray start --head --port=6379

# On worker nodes
ray start --address='head_ip:6379'

# Launch training
python3 -m verl.trainer.main_ppo \
    trainer.nnodes=4 \
    trainer.n_gpus_per_node=8
```

---

## 配置参考

### 算法选择

| 算法 | `adv_estimator` | 使用场景 |
|-----------|-----------------|----------|
| GRPO | `grpo` | 无 Critic、数学/推理 |
| PPO/GAE | `gae` | 密集奖励、价值估计 |
| REINFORCE++ | `reinforce_plus_plus` | 方差缩减 |
| RLOO | `rloo` | 留一法基线 |
| ReMax | `remax` | 最大奖励基线 |
| OPO | `opo` | 最优策略优化 |

### 关键参数

```yaml
# Rollout parameters
actor_rollout_ref.rollout.n: 8              # Samples per prompt
actor_rollout_ref.rollout.temperature: 0.7  # Sampling temperature
actor_rollout_ref.rollout.top_p: 0.95       # Nucleus sampling

# Training parameters
actor_rollout_ref.actor.lr: 1e-6            # Learning rate
actor_rollout_ref.actor.ppo_mini_batch_size: 64
actor_rollout_ref.actor.clip_ratio: 0.2     # PPO clip range

# KL control
actor_rollout_ref.actor.use_kl_loss: true
actor_rollout_ref.actor.kl_loss_coef: 0.001
algorithm.kl_ctrl.target_kl: 0.1            # For adaptive KL control
```

---

## 常见问题与解决方案

### 问题：Rollout 期间 OOM

**症状**：生成阶段 CUDA 内存不足

**解决方案**：
```yaml
# Reduce batch size
actor_rollout_ref.rollout.log_prob_micro_batch_size: 4

# Enable gradient checkpointing
actor_rollout_ref.model.enable_gradient_checkpointing: true

# Use FSDP2 with CPU offloading
actor_rollout_ref.actor.strategy: fsdp2
actor_rollout_ref.actor.fsdp_config.offload_policy: true
```

### 问题：训练不稳定

**症状**：损失峰值、奖励崩溃

**解决方案**：
```yaml
# Reduce learning rate
actor_rollout_ref.actor.lr: 5e-7

# Increase KL penalty
actor_rollout_ref.actor.kl_loss_coef: 0.01

# Enable gradient clipping
actor_rollout_ref.actor.max_grad_norm: 1.0
```

### 问题：权重同步缓慢

**症状**：Rollout 与训练之间长时间暂停

**解决方案**：
```bash
# Use FSDP2 for faster resharding
actor_rollout_ref.actor.strategy=fsdp2

# Enable async weight transfer
trainer.async_weight_update=true
```

### 问题：vLLM 版本不匹配

**症状**：导入错误或生成失败

**解决方案**：使用兼容的版本：
```bash
pip install vllm>=0.8.5,<=0.12.0
# Avoid vLLM 0.7.x (known bugs)
```

---

## 高级主题

### 多轮工具调用

有关使用工具的智能体工作流，请参阅 [references/multi-turn.md](references/multi-turn.md)。

### 视觉语言模型

```yaml
actor_rollout_ref:
  model:
    path: Qwen/Qwen2.5-VL-7B-Instruct
  rollout:
    name: vllm
    enable_vision: true
```

### LoRA 训练

```yaml
actor_rollout_ref:
  actor:
    lora:
      enabled: true
      r: 16
      alpha: 32
      target_modules: ["q_proj", "v_proj"]
```

---

## 资源

- **文档**：https://verl.readthedocs.io/
- **论文**：https://arxiv.org/abs/2409.19256
- **GitHub**：https://github.com/volcengine/verl
- **配方**：https://github.com/verl-project/verl-recipe (DAPO, GSPO, etc.)
- **社区**：Slack，位于 verl-project

