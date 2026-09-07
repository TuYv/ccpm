---
name: mamba-architecture
description: State-space model with O(n) complexity vs Transformers' O(n²). 5× faster inference, million-token sequences, no KV cache. Selective SSM with hardware-aware design. Mamba-1 (d_state=16) and Mamba-2 (d_state=128, multi-head). Models 130M-2.8B on HuggingFace.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Model Architecture, Mamba, State Space Models, SSM, Linear Complexity, Long Context, Efficient Inference, Hardware-Aware, Alternative To Transformers]
dependencies: [mamba-ssm, torch, transformers, causal-conv1d]
---
# Mamba - 选择性状态空间模型

## 快速开始

Mamba 是一种状态空间模型架构，在序列建模中实现了 O(n) 线性复杂度。

**安装**：
```bash
# Install causal-conv1d (optional, for efficiency)
pip install causal-conv1d>=1.4.0

# Install Mamba
pip install mamba-ssm
# Or both together
pip install mamba-ssm[causal-conv1d]
```

**前置条件**：Linux、NVIDIA GPU、PyTorch 1.12+、CUDA 11.6+

**基本用法**（Mamba 块）：
```python
import torch
from mamba_ssm import Mamba

batch, length, dim = 2, 64, 16
x = torch.randn(batch, length, dim).to("cuda")

model = Mamba(
    d_model=dim,      # Model dimension
    d_state=16,       # SSM state dimension
    d_conv=4,         # Conv1d kernel size
    expand=2          # Expansion factor
).to("cuda")

y = model(x)  # O(n) complexity!
assert y.shape == x.shape
```

## 常见工作流

### 工作流 1：使用 Mamba-2 的语言模型

**带文本生成的完整语言模型**：
```python
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel
from mamba_ssm.models.config_mamba import MambaConfig
import torch

# Configure Mamba-2 LM
config = MambaConfig(
    d_model=1024,           # Hidden dimension
    n_layer=24,             # Number of layers
    vocab_size=50277,       # Vocabulary size
    ssm_cfg=dict(
        layer="Mamba2",     # Use Mamba-2
        d_state=128,        # Larger state for Mamba-2
        headdim=64,         # Head dimension
        ngroups=1           # Number of groups
    )
)

model = MambaLMHeadModel(config, device="cuda", dtype=torch.float16)

# Generate text
input_ids = torch.randint(0, 1000, (1, 20), device="cuda", dtype=torch.long)
output = model.generate(
    input_ids=input_ids,
    max_length=100,
    temperature=0.7,
    top_p=0.9
)
```

### 工作流 2：使用预训练的 Mamba 模型

**从 HuggingFace 加载**：
```python
from transformers import AutoTokenizer
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel

# Load pretrained model
model_name = "state-spaces/mamba-2.8b"
tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-neox-20b")  # Use compatible tokenizer
model = MambaLMHeadModel.from_pretrained(model_name, device="cuda", dtype=torch.float16)

# Generate
prompt = "The future of AI is"
input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to("cuda")
output_ids = model.generate(
    input_ids=input_ids,
    max_length=200,
    temperature=0.7,
    top_p=0.9,
    repetition_penalty=1.2
)
generated_text = tokenizer.decode(output_ids[0])
print(generated_text)
```

**可用模型**：
- `state-spaces/mamba-130m`
- `state-spaces/mamba-370m`
- `state-spaces/mamba-790m`
- `state-spaces/mamba-1.4b`
- `state-spaces/mamba-2.8b`

### 工作流 3：Mamba-1 与 Mamba-2 对比

**Mamba-1**（状态较小）：
```python
from mamba_ssm import Mamba

model = Mamba(
    d_model=256,
    d_state=16,      # Smaller state dimension
    d_conv=4,
    expand=2
).to("cuda")
```

**Mamba-2**（多头，状态更大）：
```python
from mamba_ssm import Mamba2

model = Mamba2(
    d_model=256,
    d_state=128,     # Larger state dimension
    d_conv=4,
    expand=2,
    headdim=64,      # Head dimension for multi-head
    ngroups=1        # Parallel groups
).to("cuda")
```

**主要区别**：
- **状态大小**：Mamba-1（d_state=16）vs Mamba-2（d_state=128）
- **架构**：Mamba-2 采用多头结构
- **归一化**：Mamba-2 使用 RMSNorm
- **分布式**：Mamba-2 支持张量并行

### 工作流 4：与 Transformers 的基准测试对比

**生成速度对比**：
```bash
# Benchmark Mamba
python benchmarks/benchmark_generation_mamba_simple.py \
  --model-name "state-spaces/mamba-2.8b" \
  --prompt "The future of machine learning is" \
  --topp 0.9 --temperature 0.7 --repetition-penalty 1.2

# Benchmark Transformer
python benchmarks/benchmark_generation_mamba_simple.py \
  --model-name "EleutherAI/pythia-2.8b" \
  --prompt "The future of machine learning is" \
  --topp 0.9 --temperature 0.7 --repetition-penalty 1.2
```

**预期结果**：
- **Mamba**：推理速度快 5 倍
- **内存**：无需 KV 缓存
- **扩展性**：随序列长度线性扩展

## 何时使用及替代方案

**在以下情况下使用 Mamba**：
- 需要长序列（100K+ token）
- 希望推理速度比 Transformers 更快
- 内存受限（无 KV 缓存）
- 构建流式应用
- 线性扩展很重要

**优势**：
- **O(n) 复杂度**：线性 vs 二次方
- **推理快 5 倍**：无注意力开销
- **无 KV 缓存**：内存占用更低
- **百万 token 序列**：硬件高效
- **流式处理**：每 token 内存恒定

**以下情况请改用替代方案**：
- **Transformers**：需要业界最佳性能、算力充足
- **RWKV**：想要 RNN+Transformer 混合架构
- **RetNet**：需要基于 retention 的架构
- **Hyena**：想要基于卷积的方法

## 常见问题

**问题：CUDA 显存不足**

减小 batch size 或使用梯度检查点：
```python
model = MambaLMHeadModel(config, device="cuda", dtype=torch.float16)
model.gradient_checkpointing_enable()  # Enable checkpointing
```

**问题：安装缓慢**

安装二进制 wheel 包（而非源码）：
```bash
pip install mamba-ssm --no-build-isolation
```

**问题：缺少 causal-conv1d**

单独安装：
```bash
pip install causal-conv1d>=1.4.0
```

**问题：无法从 HuggingFace 加载模型**

使用 `MambaLMHeadModel.from_pretrained`（而非 `AutoModel`）：
```python
from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel
model = MambaLMHeadModel.from_pretrained("state-spaces/mamba-2.8b")
```

## 进阶主题

**选择性 SSM**：有关数学表述、状态空间方程，以及选择性如何实现 O(n) 复杂度，请参阅 [references/selective-ssm.md](references/selective-ssm.md)。

**Mamba-2 架构**：有关多头结构、张量并行和分布式训练设置，请参阅 [references/mamba2-details.md](references/mamba2-details.md)。

**性能优化**：有关硬件感知设计、CUDA kernel 和内存效率技术，请参阅 [references/performance.md](references/performance.md)。

## 硬件要求

- **GPU**：支持 CUDA 11.6+ 的 NVIDIA GPU
- **显存**：
  - 130M 模型：2GB
  - 370M 模型：4GB
  - 790M 模型：8GB
  - 1.4B 模型：14GB
  - 2.8B 模型：28GB（FP16）
- **推理**：比 Transformers 快 5 倍
- **内存**：无 KV 缓存（低于 Transformers）

**性能**（vs Transformers）：
- **速度**：推理快 5 倍
- **内存**：少 50%（无 KV 缓存）
- **扩展性**：线性 vs 二次方

## 资源

- 论文（Mamba-1）：https://arxiv.org/abs/2312.00752（2023 年 12 月）
- 论文（Mamba-2）：https://arxiv.org/abs/2405.21060（2024 年 5 月）
- GitHub：https://github.com/state-spaces/mamba ⭐ 13,000+
- 模型：https://huggingface.co/state-spaces
- 文档：仓库 README 和 wiki
