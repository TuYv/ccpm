---
name: rwkv-architecture
description: RNN+Transformer hybrid with O(n) inference. Linear time, infinite context, no KV cache. Train like GPT (parallel), infer like RNN (sequential). Linux Foundation AI project. Production at Windows, Office, NeMo. RWKV-7 (March 2025). Models up to 14B parameters.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [RWKV, Model Architecture, RNN, Transformer Hybrid, Linear Complexity, Infinite Context, Efficient Inference, Linux Foundation, Alternative Architecture]
dependencies: [rwkv, torch, transformers]
---
# RWKV - 接收加权键值（Receptance Weighted Key Value）

## 快速开始

RWKV（RwaKuv）将 Transformer 的可并行性（训练）与 RNN 的高效率（推理）相结合。

**安装**：
```bash
# Install PyTorch
pip install torch --upgrade --extra-index-url https://download.pytorch.org/whl/cu121

# Install dependencies
pip install pytorch-lightning==1.9.5 deepspeed wandb ninja --upgrade

# Install RWKV
pip install rwkv
```

**基本用法**（GPT 模式 + RNN 模式）：
```python
import os
from rwkv.model import RWKV

os.environ["RWKV_JIT_ON"] = '1'
os.environ["RWKV_CUDA_ON"] = '1'  # Use CUDA kernel for speed

# Load model
model = RWKV(
    model='/path/to/RWKV-4-Pile-1B5-20220903-8040',
    strategy='cuda fp16'
)

# GPT mode (parallel processing)
out, state = model.forward([187, 510, 1563, 310, 247], None)
print(out.detach().cpu().numpy())  # Logits

# RNN mode (sequential processing, same result)
out, state = model.forward([187, 510], None)  # First 2 tokens
out, state = model.forward([1563], state)      # Next token
out, state = model.forward([310, 247], state)  # Last tokens
print(out.detach().cpu().numpy())  # Same logits as above!
```

## 常见工作流

### 工作流 1：文本生成（流式）

**高效的逐 token 生成**：
```python
from rwkv.model import RWKV
from rwkv.utils import PIPELINE

model = RWKV(model='RWKV-4-Pile-14B-20230313-ctx8192-test1050', strategy='cuda fp16')
pipeline = PIPELINE(model, "20B_tokenizer.json")

# Initial prompt
prompt = "The future of AI is"
state = None

# Generate token by token
for token in prompt:
    out, state = pipeline.model.forward(pipeline.encode(token), state)

# Continue generation
for _ in range(100):
    out, state = pipeline.model.forward(None, state)
    token = pipeline.sample_logits(out)
    print(pipeline.decode(token), end='', flush=True)
```

**关键优势**：每个 token 的内存占用恒定（无需不断增长的 KV 缓存）

### 工作流 2：长上下文处理（无限上下文）

**处理百万 token 的序列**：
```python
model = RWKV(model='RWKV-4-Pile-14B', strategy='cuda fp16')

# Process very long document
state = None
long_document = load_document()  # e.g., 1M tokens

# Stream through entire document
for chunk in chunks(long_document, chunk_size=1024):
    out, state = model.forward(chunk, state)

# State now contains information from entire 1M token document
# Memory usage: O(1) (constant, not O(n)!)
```

### 工作流 3：微调 RWKV

**标准微调工作流**：
```python
# Training script
import pytorch_lightning as pl
from rwkv.model import RWKV
from rwkv.trainer import RWKVTrainer

# Configure model
config = {
    'n_layer': 24,
    'n_embd': 1024,
    'vocab_size': 50277,
    'ctx_len': 1024
}

# Setup trainer
trainer = pl.Trainer(
    accelerator='gpu',
    devices=8,
    precision='bf16',
    strategy='deepspeed_stage_2',
    max_epochs=1
)

# Train
model = RWKV(config)
trainer.fit(model, train_dataloader)
```

### 工作流 4：RWKV 与 Transformer 对比

**内存对比**（100 万 token 序列）：
```python
# Transformer (GPT)
# Memory: O(n²) for attention
# KV cache: 1M × hidden_dim × n_layers × 2 (keys + values)
# Example: 1M × 4096 × 24 × 2 = ~400GB (impractical!)

# RWKV
# Memory: O(1) per token
# State: hidden_dim × n_layers = 4096 × 24 = ~400KB
# 1,000,000× more efficient!
```

**速度对比**（推理）：
```python
# Transformer: O(n) per token (quadratic overall)
# First token: 1 computation
# Second token: 2 computations
# ...
# 1000th token: 1000 computations

# RWKV: O(1) per token (linear overall)
# Every token: 1 computation
# 1000th token: 1 computation (same as first!)
```

## 何时使用与替代方案

**在以下情况下使用 RWKV**：
- 需要超长上下文（10 万 token 以上）
- 希望内存占用恒定
- 构建流式应用
- 需要 RNN 的效率同时兼具 Transformer 的性能
- 内存受限的部署环境

**关键优势**：
- **线性时间**：O(n) 对比 Transformer 的 O(n²)
- **无 KV 缓存**：每个 token 的内存占用恒定
- **无限上下文**：没有固定窗口限制
- **可并行训练**：如同 GPT
- **顺序推理**：如同 RNN

**在以下情况下改用替代方案**：
- **Transformers**：需要绝对最佳的性能，且算力充足
- **Mamba**：想要状态空间模型
- **RetNet**：需要保留（retention）机制
- **Hyena**：想要基于卷积的方法

## 常见问题

**问题：训练期间内存不足**

使用梯度检查点和 DeepSpeed：
```python
trainer = pl.Trainer(
    strategy='deepspeed_stage_3',  # Full ZeRO-3
    precision='bf16'
)
```

**问题：推理速度慢**

启用 CUDA 内核：
```python
os.environ["RWKV_CUDA_ON"] = '1'
```

**问题：模型无法加载**

检查模型路径和策略：
```python
model = RWKV(
    model='/absolute/path/to/model.pth',
    strategy='cuda fp16'  # Or 'cpu fp32' for CPU
)
```

**问题：RNN 模式下的状态管理**

在 forward 调用之间务必传递 state：
```python
# WRONG: State lost
out1, _ = model.forward(tokens1, None)
out2, _ = model.forward(tokens2, None)  # No context from tokens1!

# CORRECT: State preserved
out1, state = model.forward(tokens1, None)
out2, state = model.forward(tokens2, state)  # Has context from tokens1
```

## 进阶主题

**时间混合与通道混合**：关于 WKV 运算、时间衰减机制和接收门控，请参阅 [references/architecture-details.md](references/architecture-details.md)。

**状态管理**：关于 att_x_prev、att_kv、ffn_x_prev 状态以及数值稳定性方面的考量，请参阅 [references/state-management.md](references/state-management.md)。

**RWKV-7 改进**：关于最新的架构改进（2025 年 3 月）和多模态能力，请参阅 [references/rwkv7.md](references/rwkv7.md)。

## 硬件要求

- **GPU**：NVIDIA（CUDA 11.6+）或 CPU
- **显存**（FP16）：
  - 169M 模型：1GB
  - 430M 模型：2GB
  - 1.5B 模型：4GB
  - 3B 模型：8GB
  - 7B 模型：16GB
  - 14B 模型：32GB
- **推理**：每个 token 的内存占用为 O(1)
- **训练**：可像 GPT 一样并行化

**性能**（对比 Transformers）：
- **速度**：训练相近，推理更快
- **内存**：长序列场景下减少 1000 倍
- **扩展性**：线性对比二次方

## 资源

- 论文（RWKV）：https://arxiv.org/abs/2305.13048（2023 年 5 月）
- 论文（RWKV-7）：https://arxiv.org/abs/2503.14456（2025 年 3 月）
- GitHub：https://github.com/BlinkDL/RWKV-LM ⭐ 12,000+
- 文档：https://wiki.rwkv.com/
- 模型：https://huggingface.co/BlinkDL
- Linux Foundation AI：官方项目
- 生产应用：Microsoft Windows、Office 集成、NeMo 支持
