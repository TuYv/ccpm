---
name: moe-training
description: Train Mixture of Experts (MoE) models using DeepSpeed or HuggingFace. Use when training large-scale models with limited compute (5× cost reduction vs dense models), implementing sparse architectures like Mixtral 8x7B or DeepSeek-V3, or scaling model capacity without proportional compute increase. Covers MoE architectures, routing mechanisms, load balancing, expert parallelism, and inference optimization.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Emerging Techniques, MoE, Mixture Of Experts, Sparse Models, DeepSpeed, Expert Parallelism, Mixtral, DeepSeek, Routing, Load Balancing, Efficient Training]
dependencies: [deepspeed, transformers, torch, accelerate]
---
# MoE 训练：混合专家模型

## 何时使用此技能

当你需要执行以下任务时，请使用 MoE 训练：
- 在计算资源有限的情况下**训练更大的模型**（与稠密模型相比，成本降低 5 倍）
- **扩展模型容量**，而无需按比例增加计算量
- 在相同计算预算下，**获得比稠密模型更好的性能**
- 针对不同领域、任务或语言**训练专用专家**
- 通过稀疏激活**降低推理延迟**（Mixtral 中仅激活 13B/47B 参数）
- **实现 SOTA 模型**，例如 Mixtral 8x7B、DeepSeek-V3、Switch Transformers

**知名 MoE 模型**：Mixtral 8x7B（Mistral AI）、DeepSeek-V3、Switch Transformers（Google）、GLaM（Google）、NLLB-MoE（Meta）

## 安装

```bash
# DeepSpeed with MoE support
pip install deepspeed>=0.6.0

# Megatron-DeepSpeed for large-scale training
git clone https://github.com/microsoft/Megatron-DeepSpeed
cd Megatron-DeepSpeed
pip install -r requirements.txt

# Alternative: HuggingFace Transformers
pip install transformers accelerate
```

## 快速开始

### 基础 MoE 架构

```python
import torch
import torch.nn as nn

class MoELayer(nn.Module):
    """Sparse Mixture of Experts layer."""

    def __init__(self, hidden_size, num_experts=8, top_k=2):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k

        # Expert networks (FFN)
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(hidden_size, 4 * hidden_size),
                nn.GELU(),
                nn.Linear(4 * hidden_size, hidden_size)
            )
            for _ in range(num_experts)
        ])

        # Gating network (router)
        self.gate = nn.Linear(hidden_size, num_experts)

    def forward(self, x):
        # x shape: (batch_size, seq_len, hidden_size)
        batch_size, seq_len, hidden_size = x.shape

        # Flatten for routing
        x_flat = x.view(-1, hidden_size)  # (batch_size * seq_len, hidden_size)

        # Compute gate scores
        gate_logits = self.gate(x_flat)  # (batch_size * seq_len, num_experts)

        # Top-k routing
        gate_scores = torch.softmax(gate_logits, dim=-1)
        topk_scores, topk_indices = torch.topk(gate_scores, self.top_k, dim=-1)

        # Normalize top-k scores
        topk_scores = topk_scores / topk_scores.sum(dim=-1, keepdim=True)

        # Dispatch and combine expert outputs
        output = torch.zeros_like(x_flat)

        for i in range(self.top_k):
            expert_idx = topk_indices[:, i]
            expert_scores = topk_scores[:, i].unsqueeze(-1)

            # Route tokens to experts
            for expert_id in range(self.num_experts):
                mask = (expert_idx == expert_id)
                if mask.any():
                    expert_input = x_flat[mask]
                    expert_output = self.experts[expert_id](expert_input)
                    output[mask] += expert_scores[mask] * expert_output

        # Reshape back
        return output.view(batch_size, seq_len, hidden_size)
```

### DeepSpeed MoE 训练

```bash
# Training script with MoE
deepspeed pretrain_gpt_moe.py \
  --num-layers 24 \
  --hidden-size 1024 \
  --num-attention-heads 16 \
  --seq-length 2048 \
  --max-position-embeddings 2048 \
  --micro-batch-size 4 \
  --global-batch-size 256 \
  --train-iters 500000 \
  --lr 0.0001 \
  --min-lr 0.00001 \
  --lr-decay-style cosine \
  --num-experts 128 \
  --moe-expert-parallel-size 4 \
  --moe-loss-coeff 0.01 \
  --moe-train-capacity-factor 1.25 \
  --moe-eval-capacity-factor 2.0 \
  --fp16 \
  --deepspeed_config ds_config.json
```

## 核心概念

### 1. MoE 架构

**关键组件：**
- **专家**：多个专门化的 FFN 网络（通常为 8-128 个）
- **路由器/门控**：通过学习来选择要使用哪些专家的网络
- **Top-k 路由**：每个 token 仅激活 k 个专家（k=1 或 k=2）
- **负载均衡**：确保各专家得到均衡利用

```
Input Token
    ↓
Router (Gate Network)
    ↓
Top-k Expert Selection (e.g., 2 out of 8)
    ↓
Expert 1 (weight: 0.6) + Expert 5 (weight: 0.4)
    ↓
Weighted Combination
    ↓
Output
```

### 2. 路由机制

**Top-1 路由（Switch Transformer）：**
```python
# Simplest routing: one expert per token
gate_logits = router(x)  # (batch, seq_len, num_experts)
expert_idx = torch.argmax(gate_logits, dim=-1)  # Hard routing
```

**Top-2 路由（Mixtral）：**
```python
# Top-2: two experts per token
gate_scores = torch.softmax(router(x), dim=-1)
top2_scores, top2_indices = torch.topk(gate_scores, k=2, dim=-1)

# Normalize scores
top2_scores = top2_scores / top2_scores.sum(dim=-1, keepdim=True)

# Combine expert outputs
output = (top2_scores[:, :, 0:1] * expert_outputs[top2_indices[:, :, 0]] +
          top2_scores[:, :, 1:2] * expert_outputs[top2_indices[:, :, 1]])
```

**专家选择路由：**
```python
# Experts choose top-k tokens (instead of tokens choosing experts)
# Guarantees perfect load balancing
expert_scores = router(x).transpose(-1, -2)  # (batch, num_experts, seq_len)
topk_tokens = torch.topk(expert_scores, k=capacity_per_expert, dim=-1)
```

### 3. 负载均衡

**辅助损失：**
```python
def load_balancing_loss(gate_logits, expert_indices, num_experts):
    """Encourage uniform expert usage."""
    # Fraction of tokens routed to each expert
    expert_counts = torch.bincount(expert_indices.flatten(), minlength=num_experts)
    expert_fraction = expert_counts.float() / expert_indices.numel()

    # Gate probability for each expert (average across tokens)
    gate_probs = torch.softmax(gate_logits, dim=-1).mean(dim=0)

    # Auxiliary loss: encourage alignment
    aux_loss = num_experts * (expert_fraction * gate_probs).sum()

    return aux_loss

# Add to main loss
total_loss = language_model_loss + 0.01 * load_balancing_loss(...)
```

**路由器 Z-Loss（稳定性）：**
```python
def router_z_loss(logits):
    """Encourage router to have lower entropy (more decisive)."""
    z_loss = torch.logsumexp(logits, dim=-1).pow(2).mean()
    return z_loss

total_loss = lm_loss + 0.01 * aux_loss + 0.001 * router_z_loss(gate_logits)
```

### 4. 专家并行

```python
# DeepSpeed configuration
{
  "train_batch_size": 256,
  "fp16": {"enabled": true},
  "moe": {
    "enabled": true,
    "num_experts": 128,
    "expert_parallel_size": 8,  # Distribute 128 experts across 8 GPUs
    "capacity_factor": 1.25,    # Expert capacity = tokens_per_batch * capacity_factor / num_experts
    "drop_tokens": true,        # Drop tokens exceeding capacity
    "use_residual": false
  }
}
```

## 训练配置

### DeepSpeed MoE 配置

```json
{
  "train_batch_size": 256,
  "gradient_accumulation_steps": 1,
  "optimizer": {
    "type": "Adam",
    "params": {
      "lr": 0.0001,
      "betas": [0.9, 0.999],
      "eps": 1e-8
    }
  },
  "fp16": {
    "enabled": true,
    "loss_scale": 0,
    "initial_scale_power": 16
  },
  "moe": {
    "enabled": true,
    "num_experts": 128,
    "expert_parallel_size": 8,
    "moe_loss_coeff": 0.01,
    "train_capacity_factor": 1.25,
    "eval_capacity_factor": 2.0,
    "min_capacity": 4,
    "drop_tokens": true,
    "use_residual": false,
    "use_tutel": false
  },
  "zero_optimization": {
    "stage": 1
  }
}
```

### 训练脚本

```bash
#!/bin/bash

# Mixtral-style MoE training
deepspeed --num_gpus 8 pretrain_moe.py \
  --model-parallel-size 1 \
  --num-layers 32 \
  --hidden-size 4096 \
  --num-attention-heads 32 \
  --seq-length 2048 \
  --max-position-embeddings 4096 \
  --micro-batch-size 2 \
  --global-batch-size 256 \
  --train-iters 500000 \
  --save-interval 5000 \
  --eval-interval 1000 \
  --eval-iters 100 \
  --lr 0.0001 \
  --min-lr 0.00001 \
  --lr-decay-style cosine \
  --lr-warmup-iters 2000 \
  --clip-grad 1.0 \
  --weight-decay 0.1 \
  --num-experts 8 \
  --moe-expert-parallel-size 4 \
  --moe-loss-coeff 0.01 \
  --moe-train-capacity-factor 1.25 \
  --moe-eval-capacity-factor 2.0 \
  --disable-moe-token-dropping \
  --fp16 \
  --deepspeed \
  --deepspeed_config ds_config_moe.json \
  --data-path /path/to/data \
  --vocab-file /path/to/vocab.json \
  --merge-file /path/to/merges.txt
```

## 高级模式

### Mixtral 8x7B 架构

```python
class MixtralMoEBlock(nn.Module):
    """Mixtral-style MoE block with 8 experts, top-2 routing."""

    def __init__(self, config):
        super().__init__()
        self.hidden_dim = config.hidden_size
        self.ffn_dim = config.intermediate_size
        self.num_experts = config.num_local_experts  # 8
        self.top_k = config.num_experts_per_tok       # 2

        # 8 expert FFNs
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(self.hidden_dim, self.ffn_dim, bias=False),
                nn.SiLU(),
                nn.Linear(self.ffn_dim, self.hidden_dim, bias=False)
            )
            for _ in range(self.num_experts)
        ])

        # Router
        self.gate = nn.Linear(self.hidden_dim, self.num_experts, bias=False)

    def forward(self, hidden_states):
        batch_size, sequence_length, hidden_dim = hidden_states.shape

        # Flatten
        hidden_states = hidden_states.view(-1, hidden_dim)

        # Router logits
        router_logits = self.gate(hidden_states)  # (batch * seq_len, num_experts)

        # Softmax and top-2
        routing_weights = torch.softmax(router_logits, dim=1)
        routing_weights, selected_experts = torch.topk(routing_weights, self.top_k, dim=-1)

        # Normalize routing weights
        routing_weights /= routing_weights.sum(dim=-1, keepdim=True)

        # Initialize output
        final_hidden_states = torch.zeros_like(hidden_states)

        # Route to experts
        for expert_idx in range(self.num_experts):
            expert_layer = self.experts[expert_idx]
            idx, top_x = torch.where(selected_experts == expert_idx)

            if idx.shape[0] == 0:
                continue

            # Current expert tokens
            current_hidden_states = hidden_states[idx]

            # Expert forward
            current_hidden_states = expert_layer(current_hidden_states)

            # Weighted by routing scores
            current_hidden_states *= routing_weights[idx, top_x, None]

            # Accumulate
            final_hidden_states.index_add_(0, idx, current_hidden_states)

        # Reshape
        return final_hidden_states.view(batch_size, sequence_length, hidden_dim)
```

### PR-MoE（Pyramid-Residual-MoE）

```bash
# DeepSpeed PR-MoE: 3x better parameter efficiency
deepspeed pretrain_gpt_moe.py \
  --num-layers 24 \
  --hidden-size 1024 \
  --num-attention-heads 16 \
  --num-experts "[128, 64, 32, 16]" \
  --mlp-type residual \
  --moe-expert-parallel-size 4 \
  --moe-loss-coeff 0.01 \
  --fp16
```

## 最佳实践

### 1. 专家数量选择

```python
# Rule of thumb: More experts = more capacity, but diminishing returns
# Typical configurations:
# - Small models (1B-7B): 8-16 experts
# - Medium models (7B-30B): 8-64 experts
# - Large models (30B+): 64-256 experts

# Example: Mixtral 8x7B
# Total params: 47B (8 experts × 7B each)
# Active params: 13B (2 experts × 7B, top-2 routing)
# Efficiency: 47B capacity with 13B compute
```

### 2. 容量因子调优

```python
# Capacity = (tokens_per_batch / num_experts) * capacity_factor

# Training: Lower capacity (faster, drops some tokens)
train_capacity_factor = 1.25  # 25% buffer

# Evaluation: Higher capacity (no dropping)
eval_capacity_factor = 2.0    # 100% buffer

# Formula:
expert_capacity = int((seq_len * batch_size / num_experts) * capacity_factor)
```

### 3. 学习率指南

```python
# MoE models need lower LR than dense models
# - Dense model: lr = 6e-4
# - MoE model: lr = 1e-4 (3-6× lower)

# Also extend decay schedule
dense_lr_decay_iters = 300000
moe_lr_decay_iters = 500000  # 1.5-2× longer
```

### 4. 损失系数调优

```python
# Start with standard values
moe_loss_coeff = 0.01    # Auxiliary loss (load balancing)
router_z_loss_coeff = 0.001  # Router entropy (stability)

# If load imbalance persists, increase aux loss
if max_expert_usage / min_expert_usage > 2.0:
    moe_loss_coeff = 0.1  # Stronger load balancing

# If training unstable, increase z-loss
if grad_norm > 10.0:
    router_z_loss_coeff = 0.01
```

### 5. 避免常见误区

```python
# ❌ Bad: Using same LR as dense model
optimizer = Adam(model.parameters(), lr=6e-4)

# ✅ Good: Lower LR for MoE
optimizer = Adam([
    {'params': model.non_moe_params, 'lr': 6e-4},
    {'params': model.moe_params, 'lr': 1e-4}
])

# ❌ Bad: No load balancing
loss = lm_loss

# ✅ Good: Add auxiliary loss
loss = lm_loss + 0.01 * aux_loss + 0.001 * z_loss

# ❌ Bad: Too many experts for small dataset
num_experts = 128  # Overfitting risk

# ✅ Good: Match experts to data diversity
num_experts = 8  # Better for small datasets
```

## 推理优化

### 稀疏推理

```python
# Only activate top-k experts (huge memory savings)
@torch.no_grad()
def moe_inference(x, model, top_k=2):
    """Sparse MoE inference: only load k experts."""
    # Router
    gate_logits = model.gate(x)
    topk_scores, topk_indices = torch.topk(
        torch.softmax(gate_logits, dim=-1),
        k=top_k,
        dim=-1
    )

    # Load and run only top-k experts
    output = torch.zeros_like(x)
    for i in range(top_k):
        expert_idx = topk_indices[:, i]
        # Load expert from disk/offload if needed
        expert = model.load_expert(expert_idx)
        output += topk_scores[:, i:i+1] * expert(x)

    return output
```

## 资源

- **DeepSpeed MoE 教程**：https://www.deepspeed.ai/tutorials/mixture-of-experts-nlg/
- **Mixtral 论文**：https://arxiv.org/abs/2401.04088
- **Switch Transformers**：https://arxiv.org/abs/2101.03961
- **HuggingFace MoE 指南**：https://huggingface.co/blog/moe
- **NVIDIA MoE 博客**：https://developer.nvidia.com/blog/applying-mixture-of-experts-in-llm-architectures/

## 另请参阅

- `references/architectures.md` - MoE 模型架构（Mixtral、Switch、DeepSeek-V3）
- `references/training.md` - 高级训练技术与优化
- `references/inference.md` - 生产环境部署与服务模式