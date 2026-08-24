---
name: awq-quantization
description: Activation-aware weight quantization for 4-bit LLM compression with 3x speedup and minimal accuracy loss. Use when deploying large models (7B-70B) on limited GPU memory, when you need faster inference than GPTQ with better accuracy preservation, or for instruction-tuned and multimodal models. MLSys 2024 Best Paper Award winner.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Optimization, AWQ, Quantization, 4-Bit, Activation-Aware, Memory Optimization, Fast Inference, vLLM Integration, Marlin Kernels]
dependencies: [autoawq, transformers>=4.45.0, torch>=2.0.0]
---
# AWQ（激活感知权重量化）

一种 4 位量化方法，根据激活模式保留显著权重，在精度损失极小的情况下实现 3 倍加速。

## 何时使用 AWQ

**在以下情况下使用 AWQ：**
- 需要精度损失 <5% 的 4 位量化
- 部署指令微调模型或聊天模型（AWQ 的泛化能力更好）
- 希望推理速度比 FP16 提升约 2.5-3 倍
- 使用 vLLM 进行生产环境服务
- 拥有支持 Marlin 内核的 Ampere+ GPU（A100、H100、RTX 40xx）

**在以下情况下改用 GPTQ：**
- 需要最大程度的生态系统兼容性（支持 GPTQ 的工具更多）
- 专门使用 ExLlamaV2 后端
- 使用不支持 Marlin 的较旧 GPU

**在以下情况下改用 bitsandbytes：**
- 需要零校准开销（即时量化）
- 希望使用 QLoRA 进行微调
- 偏好更简单的集成方式

## 快速开始

### 安装

```bash
# Default (Triton kernels)
pip install autoawq

# With optimized CUDA kernels + Flash Attention
pip install autoawq[kernels]

# Intel CPU/XPU optimization
pip install autoawq[cpu]
```

**要求**：Python 3.8+、CUDA 11.8+、Compute Capability 7.5+

### 加载预量化模型

```python
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_name = "TheBloke/Mistral-7B-Instruct-v0.2-AWQ"

model = AutoAWQForCausalLM.from_quantized(
    model_name,
    fuse_layers=True  # Enable fused attention for speed
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Generate
inputs = tokenizer("Explain quantum computing", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### 量化自己的模型

```python
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_path = "mistralai/Mistral-7B-Instruct-v0.2"

# Load model and tokenizer
model = AutoAWQForCausalLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Quantization config
quant_config = {
    "zero_point": True,      # Use zero-point quantization
    "q_group_size": 128,     # Group size (128 recommended)
    "w_bit": 4,              # 4-bit weights
    "version": "GEMM"        # GEMM for batch, GEMV for single-token
}

# Quantize (uses pileval dataset by default)
model.quantize(tokenizer, quant_config=quant_config)

# Save
model.save_quantized("mistral-7b-awq")
tokenizer.save_pretrained("mistral-7b-awq")
```

**耗时**：7B 模型约 10-15 分钟，70B 模型约 1 小时。

## AWQ 与 GPTQ 与 bitsandbytes 的对比

| 特性 | AWQ | GPTQ | bitsandbytes |
|---------|-----|------|--------------|
| **加速比（4 位）** | ~2.5-3x | ~2x | ~1.5x |
| **精度损失** | <5% | ~5-10% | ~5-15% |
| **校准** | 极少（128-1K tokens） | 更广泛 | 无 |
| **过拟合风险** | 低 | 较高 | N/A |
| **最适合** | 生产环境推理 | GPU 推理 | 轻松集成 |
| **vLLM 支持** | 原生支持 | 是 | 有限 |

**关键洞察**：AWQ 假设并非所有权重都同等重要。它会保护由激活模式识别出的约 1% 显著权重，从而在不产生混合精度开销的情况下减少量化误差。

## 内核后端

### GEMM（默认，批量推理）

```python
quant_config = {
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4,
    "version": "GEMM"  # Best for batch sizes > 1
}
```

### GEMV（单令牌生成）

```python
quant_config = {
    "version": "GEMV"  # 20% faster for batch_size=1
}
```

**限制**：仅支持批量大小为 1，不适合较长的上下文。

### Marlin（Ampere 及更新架构的 GPU）

```python
from transformers import AwqConfig, AutoModelForCausalLM

config = AwqConfig(
    bits=4,
    version="marlin"  # 2x faster on A100/H100
)

model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Mistral-7B-AWQ",
    quantization_config=config
)
```

**要求**：计算能力 8.0+（A100、H100、RTX 40xx）

### ExLlamaV2（兼容 AMD）

```python
config = AwqConfig(
    bits=4,
    version="exllama"  # Faster prefill, AMD GPU support
)
```

## HuggingFace Transformers 集成

### 直接加载

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/zephyr-7B-alpha-AWQ",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("TheBloke/zephyr-7B-alpha-AWQ")
```

### 融合模块（推荐）

```python
from transformers import AwqConfig, AutoModelForCausalLM

config = AwqConfig(
    bits=4,
    fuse_max_seq_len=512,  # Max sequence length for fusing
    do_fuse=True           # Enable fused attention/MLP
)

model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Mistral-7B-OpenOrca-AWQ",
    quantization_config=config
)
```

**注意**：融合模块不能与 FlashAttention2 结合使用。

## vLLM 集成

```python
from vllm import LLM, SamplingParams

# vLLM auto-detects AWQ models
llm = LLM(
    model="TheBloke/Llama-2-7B-AWQ",
    quantization="awq",
    dtype="half"
)

sampling = SamplingParams(temperature=0.7, max_tokens=200)
outputs = llm.generate(["Explain AI"], sampling)
```

## 性能基准测试

### 显存占用降低

| 模型 | FP16 | AWQ 4 位 | 降低倍数 |
|-------|------|-----------|-----------|
| Mistral 7B | 14 GB | 5.5 GB | 2.5x |
| Llama 2-13B | 26 GB | 10 GB | 2.6x |
| Llama 2-70B | 140 GB | 35 GB | 4x |

### 推理速度（RTX 4090）

| 模型 | 预填充（tok/s） | 解码（tok/s） | 显存 |
|-------|-----------------|----------------|--------|
| Mistral 7B GEMM | 3,897 | 114 | 5.55 GB |
| TinyLlama 1B GEMV | 5,179 | 431 | 2.10 GB |
| Llama 2-13B GEMM | 2,279 | 74 | 10.28 GB |

### 准确度（困惑度）

| 模型 | FP16 | AWQ 4 位 | 性能下降 |
|-------|------|-----------|-------------|
| Llama 3 8B | 8.20 | 8.48 | +3.4% |
| Mistral 7B | 5.25 | 5.42 | +3.2% |
| Qwen2 72B | 4.85 | 4.95 | +2.1% |

## 自定义校准数据

```python
# Use custom dataset for domain-specific models
model.quantize(
    tokenizer,
    quant_config=quant_config,
    calib_data="wikitext",       # Or custom list of strings
    max_calib_samples=256,       # More samples = better accuracy
    max_calib_seq_len=512        # Sequence length
)

# Or provide your own samples
calib_samples = [
    "Your domain-specific text here...",
    "More examples from your use case...",
]
model.quantize(tokenizer, quant_config=quant_config, calib_data=calib_samples)
```

## 多 GPU 部署

```python
model = AutoAWQForCausalLM.from_quantized(
    "TheBloke/Llama-2-70B-AWQ",
    device_map="auto",  # Auto-split across GPUs
    max_memory={0: "40GB", 1: "40GB"}
)
```

## 支持的模型

支持 35 种以上的架构，包括：
- **Llama 系列**：Llama 2/3、Code Llama、Mistral、Mixtral
- **Qwen**：Qwen、Qwen2、Qwen2.5-VL
- **其他**：Falcon、MPT、Phi、Yi、DeepSeek、Gemma
- **多模态**：LLaVA、LLaVA-Next、Qwen2-VL

## 常见问题

**量化期间出现 CUDA OOM**：
```python
# Reduce batch size
model.quantize(tokenizer, quant_config=quant_config, max_calib_samples=64)
```

**推理速度慢**：
```python
# Enable fused layers
model = AutoAWQForCausalLM.from_quantized(model_name, fuse_layers=True)
```

**AMD GPU 支持**：
```python
# Use ExLlama backend
config = AwqConfig(bits=4, version="exllama")
```

## 弃用通知

AutoAWQ 已被正式弃用。对于新项目，请考虑：
- **vLLM llm-compressor**：https://github.com/vllm-project/llm-compressor
- **MLX-LM**：适用于搭载 Apple Silicon 的 Mac 设备

现有的量化模型仍可继续使用。

## 参考资料

- **论文**：AWQ：激活感知权重量化（arXiv:2306.00978）- MLSys 2024 最佳论文
- **GitHub**：https://github.com/casper-hansen/AutoAWQ
- **MIT Han Lab**：https://github.com/mit-han-lab/llm-awq
- **模型**：https://huggingface.co/models?library=awq