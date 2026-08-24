---
name: nanogpt
description: Educational GPT implementation in ~300 lines. Reproduces GPT-2 (124M) on OpenWebText. Clean, hackable code for learning transformers. By Andrej Karpathy. Perfect for understanding GPT architecture from scratch. Train on Shakespeare (CPU) or OpenWebText (multi-GPU).
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Model Architecture, NanoGPT, GPT-2, Educational, Andrej Karpathy, Transformer, Minimalist, From Scratch, Training]
dependencies: [torch, transformers, datasets, tiktoken, wandb]
---
# nanoGPT - 极简 GPT 训练

## 快速开始

nanoGPT 是一种简化的 GPT 实现，专为学习和实验而设计。

**安装**：
```bash
pip install torch numpy transformers datasets tiktoken wandb tqdm
```

**在莎士比亚作品上训练**（适合 CPU）：
```bash
# Prepare data
python data/shakespeare_char/prepare.py

# Train (5 minutes on CPU)
python train.py config/train_shakespeare_char.py

# Generate text
python sample.py --out_dir=out-shakespeare-char
```

**输出**：
```
ROMEO:
What say'st thou? Shall I speak, and be a man?

JULIET:
I am afeard, and yet I'll speak; for thou art
One that hath been a man, and yet I know not
What thou art.
```

## 常见工作流

### 工作流 1：字符级莎士比亚文本

**完整训练流程**：
```bash
# Step 1: Prepare data (creates train.bin, val.bin)
python data/shakespeare_char/prepare.py

# Step 2: Train small model
python train.py config/train_shakespeare_char.py

# Step 3: Generate text
python sample.py --out_dir=out-shakespeare-char
```

**配置**（`config/train_shakespeare_char.py`）：
```python
# Model config
n_layer = 6          # 6 transformer layers
n_head = 6           # 6 attention heads
n_embd = 384         # 384-dim embeddings
block_size = 256     # 256 char context

# Training config
batch_size = 64
learning_rate = 1e-3
max_iters = 5000
eval_interval = 500

# Hardware
device = 'cpu'  # Or 'cuda'
compile = False # Set True for PyTorch 2.0
```

**训练时间**：约 5 分钟（CPU），约 1 分钟（GPU）

### 工作流 2：复现 GPT-2（124M）

**在 OpenWebText 上进行多 GPU 训练**：
```bash
# Step 1: Prepare OpenWebText (takes ~1 hour)
python data/openwebtext/prepare.py

# Step 2: Train GPT-2 124M with DDP (8 GPUs)
torchrun --standalone --nproc_per_node=8 \
  train.py config/train_gpt2.py

# Step 3: Sample from trained model
python sample.py --out_dir=out
```

**配置**（`config/train_gpt2.py`）：
```python
# GPT-2 (124M) architecture
n_layer = 12
n_head = 12
n_embd = 768
block_size = 1024
dropout = 0.0

# Training
batch_size = 12
gradient_accumulation_steps = 5 * 8  # Total batch ~0.5M tokens
learning_rate = 6e-4
max_iters = 600000
lr_decay_iters = 600000

# System
compile = True  # PyTorch 2.0
```

**训练时间**：约 4 天（8× A100）

### 工作流 3：微调预训练 GPT-2

**从 OpenAI 检查点开始**：
```python
# In train.py or config
init_from = 'gpt2'  # Options: gpt2, gpt2-medium, gpt2-large, gpt2-xl

# Model loads OpenAI weights automatically
python train.py config/finetune_shakespeare.py
```

**配置示例**（`config/finetune_shakespeare.py`）：
```python
# Start from GPT-2
init_from = 'gpt2'

# Dataset
dataset = 'shakespeare_char'
batch_size = 1
block_size = 1024

# Fine-tuning
learning_rate = 3e-5  # Lower LR for fine-tuning
max_iters = 2000
warmup_iters = 100

# Regularization
weight_decay = 1e-1
```

### 工作流 4：自定义数据集

**在你自己的文本上训练**：
```python
# data/custom/prepare.py
import numpy as np

# Load your data
with open('my_data.txt', 'r') as f:
    text = f.read()

# Create character mappings
chars = sorted(list(set(text)))
stoi = {ch: i for i, ch in enumerate(chars)}
itos = {i: ch for i, ch in enumerate(chars)}

# Tokenize
data = np.array([stoi[ch] for ch in text], dtype=np.uint16)

# Split train/val
n = len(data)
train_data = data[:int(n*0.9)]
val_data = data[int(n*0.9):]

# Save
train_data.tofile('data/custom/train.bin')
val_data.tofile('data/custom/val.bin')
```

**训练**：
```bash
python data/custom/prepare.py
python train.py --dataset=custom
```

## 何时使用以及何时选择替代方案

**适合使用 nanoGPT 的情况**：
- 学习 GPT 的工作原理
- 试验 Transformer 变体
- 用于教学/教育
- 快速原型开发
- 计算资源有限（可在 CPU 上运行）

**简洁性优势**：
- **约 300 行**：整个模型都在 `model.py` 中
- **约 300 行**：训练循环位于 `train.py` 中
- **易于改造**：修改起来很容易
- **无抽象层**：纯 PyTorch

**以下情况应改用替代方案**：
- **HuggingFace Transformers**：生产环境使用，支持众多模型
- **Megatron-LM**：大规模分布式训练
- **LitGPT**：支持更多架构，可用于生产环境
- **PyTorch Lightning**：需要高级框架

## 常见问题

**问题：CUDA 内存不足**

减小批次大小或上下文长度：
```python
batch_size = 1  # Reduce from 12
block_size = 512  # Reduce from 1024
gradient_accumulation_steps = 40  # Increase to maintain effective batch
```

**问题：训练速度太慢**

启用编译（PyTorch 2.0+）：
```python
compile = True  # 2× speedup
```

使用混合精度：
```python
dtype = 'bfloat16'  # Or 'float16'
```

**问题：生成质量不佳**

延长训练时间：
```python
max_iters = 10000  # Increase from 5000
```

降低温度：
```python
# In sample.py
temperature = 0.7  # Lower from 1.0
top_k = 200       # Add top-k sampling
```

**问题：无法加载 GPT-2 权重**

安装 transformers：
```bash
pip install transformers
```

检查模型名称：
```python
init_from = 'gpt2'  # Valid: gpt2, gpt2-medium, gpt2-large, gpt2-xl
```

## 高级主题

**模型架构**：参阅 [references/architecture.md](references/architecture.md)，其中以简单易懂的方式说明了 GPT 块结构、多头注意力和 MLP 层。

**训练循环**：参阅 [references/training.md](references/training.md)，了解学习率调度、梯度累积和分布式数据并行设置。

**数据准备**：参阅 [references/data.md](references/data.md)，了解分词策略（字符级与 BPE）和二进制格式的详细信息。

## 硬件要求

- **Shakespeare（字符级）**：
  - CPU：5 分钟
  - GPU（T4）：1 分钟
  - VRAM：<1GB

- **GPT-2（124M）**：
  - 1× A100：约 1 周
  - 8× A100：约 4 天
  - VRAM：每块 GPU 约 16GB

- **GPT-2 Medium（350M）**：
  - 8× A100：约 2 周
  - VRAM：每块 GPU 约 40GB

**性能**：
- 使用 `compile=True`：速度提升 2 倍
- 使用 `dtype=bfloat16`：内存占用减少 50%

## 资源

- GitHub：https://github.com/karpathy/nanoGPT ⭐ 48,000+
- 视频：Andrej Karpathy 的《Let's build GPT》
- 论文：《Attention is All You Need》（Vaswani 等）
- OpenWebText：https://huggingface.co/datasets/Skylion007/openwebtext
- 教育用途：最适合用于从零开始理解 Transformer