---
name: gptq
description: Post-training 4-bit quantization for LLMs with minimal accuracy loss. Use for deploying large models (70B, 405B) on consumer GPUs, when you need 4× memory reduction with <2% perplexity degradation, or for faster inference (3-4× speedup) vs FP16. Integrates with transformers and PEFT for QLoRA fine-tuning.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Optimization, GPTQ, Quantization, 4-Bit, Post-Training, Memory Optimization, Consumer GPUs, Fast Inference, QLoRA, Group-Wise Quantization]
dependencies: [auto-gptq, transformers, optimum, peft]
---
# GPTQ（生成式预训练 Transformer 量化）

一种训练后量化方法，使用分组量化将大语言模型压缩至 4 位，同时将精度损失降至最低。

## 何时使用 GPTQ

**在以下情况下使用 GPTQ：**
- 需要在有限的 GPU 显存中运行大型模型（70B+）
- 希望将内存占用减少至四分之一，同时精度损失低于 2%
- 在消费级 GPU（RTX 4090、3090）上部署
- 需要更快的推理速度（相比 FP16 加速 3-4 倍）

**在以下情况下改用 AWQ：**
- 需要略高的精度（损失低于 1%）
- 拥有较新的 GPU（Ampere、Ada）
- 希望支持 Marlin 内核（在某些 GPU 上速度提升 2 倍）

**在以下情况下改用 bitsandbytes：**
- 需要与 transformers 简单集成
- 希望使用 8 位量化（压缩程度较低，质量更好）
- 不需要预量化模型文件

## 快速开始

### 安装

```bash
# Install AutoGPTQ
pip install auto-gptq

# With Triton (Linux only, faster)
pip install auto-gptq[triton]

# With CUDA extensions (faster)
pip install auto-gptq --no-build-isolation

# Full installation
pip install auto-gptq transformers accelerate
```

### 加载预量化模型

```python
from transformers import AutoTokenizer
from auto_gptq import AutoGPTQForCausalLM

# Load quantized model from HuggingFace
model_name = "TheBloke/Llama-2-7B-Chat-GPTQ"

model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device="cuda:0",
    use_triton=False  # Set True on Linux for speed
)

tokenizer = AutoTokenizer.from_pretrained(model_name)

# Generate
prompt = "Explain quantum computing"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda:0")
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0]))
```

### 量化你自己的模型

```python
from transformers import AutoTokenizer
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from datasets import load_dataset

# Load model
model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Quantization config
quantize_config = BaseQuantizeConfig(
    bits=4,              # 4-bit quantization
    group_size=128,      # Group size (recommended: 128)
    desc_act=False,      # Activation order (False for CUDA kernel)
    damp_percent=0.01    # Dampening factor
)

# Load model for quantization
model = AutoGPTQForCausalLM.from_pretrained(
    model_name,
    quantize_config=quantize_config
)

# Prepare calibration data
dataset = load_dataset("c4", split="train", streaming=True)
calibration_data = [
    tokenizer(example["text"])["input_ids"][:512]
    for example in dataset.take(128)
]

# Quantize
model.quantize(calibration_data)

# Save quantized model
model.save_quantized("llama-2-7b-gptq")
tokenizer.save_pretrained("llama-2-7b-gptq")

# Push to HuggingFace
model.push_to_hub("username/llama-2-7b-gptq")
```

## 分组量化

**GPTQ 的工作原理**：
1. **权重分组**：将每个权重矩阵划分为若干组（通常每组包含 128 个元素）
2. **按组量化**：每个组都有自己的缩放因子和零点
3. **最小化误差**：使用 Hessian 信息最小化量化误差
4. **结果**：获得精度接近 FP16 的 4 位权重

**分组大小的权衡**：

| 分组大小 | 模型大小 | 准确率 | 速度 | 建议 |
|------------|------------|----------|-------|----------------|
| -1（每列） | 最小 | 最佳 | 最慢 | 仅用于研究 |
| 32 | 较小 | 较好 | 较慢 | 需要高准确率 |
| **128** | 中等 | 良好 | **快** | **推荐的默认值** |
| 256 | 较大 | 较低 | 较快 | 速度至关重要 |
| 1024 | 最大 | 最低 | 最快 | 不推荐 |

**示例**：
```
Weight matrix: [1024, 4096] = 4.2M elements

Group size = 128:
- Groups: 4.2M / 128 = 32,768 groups
- Each group: own 4-bit scale + zero-point
- Result: Better granularity → better accuracy
```

## 量化配置

### 标准 4 位（推荐）

```python
from auto_gptq import BaseQuantizeConfig

config = BaseQuantizeConfig(
    bits=4,              # 4-bit quantization
    group_size=128,      # Standard group size
    desc_act=False,      # Faster CUDA kernel
    damp_percent=0.01    # Dampening factor
)
```

**性能**：
- 内存：减少 4 倍（70B 模型：140GB → 35GB）
- 准确率：困惑度增加约 1.5%
- 速度：比 FP16 快 3-4 倍

### 高准确率（使用较大分组的 3 位量化）

```python
config = BaseQuantizeConfig(
    bits=3,              # 3-bit (more compression)
    group_size=128,      # Keep standard group size
    desc_act=True,       # Better accuracy (slower)
    damp_percent=0.01
)
```

**权衡**：
- 内存：减少 5 倍
- 准确率：困惑度增加约 3%
- 速度：快 5 倍（但准确率较低）

### 最高准确率（使用小分组的 4 位量化）

```python
config = BaseQuantizeConfig(
    bits=4,
    group_size=32,       # Smaller groups (better accuracy)
    desc_act=True,       # Activation reordering
    damp_percent=0.005   # Lower dampening
)
```

**权衡**：
- 内存：减少 3.5 倍（略大）
- 准确率：困惑度增加约 0.8%（最佳）
- 速度：快 2-3 倍（内核开销）

## 内核后端

### ExLlamaV2（默认、最快）

```python
model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device="cuda:0",
    use_exllama=True,      # Use ExLlamaV2
    exllama_config={"version": 2}
)
```

**性能**：比 Triton 快 1.5-2 倍

### Marlin（Ampere+ GPU）

```python
# Quantize with Marlin format
config = BaseQuantizeConfig(
    bits=4,
    group_size=128,
    desc_act=False  # Required for Marlin
)

model.quantize(calibration_data, use_marlin=True)

# Load with Marlin
model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device="cuda:0",
    use_marlin=True  # 2× faster on A100/H100
)
```

**要求**：
- NVIDIA Ampere 或更新架构（A100、H100、RTX 40xx）
- 计算能力 ≥ 8.0

### Triton（仅限 Linux）

```python
model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device="cuda:0",
    use_triton=True  # Linux only
)
```

**性能**：比 CUDA 后端快 1.2-1.5 倍

## 与 transformers 集成

### 直接使用 transformers

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load quantized model (transformers auto-detects GPTQ)
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-13B-Chat-GPTQ",
    device_map="auto",
    trust_remote_code=False
)

tokenizer = AutoTokenizer.from_pretrained("TheBloke/Llama-2-13B-Chat-GPTQ")

# Use like any transformers model
inputs = tokenizer("Hello", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100)
```

### QLoRA 微调（GPTQ + LoRA）

```python
from transformers import AutoModelForCausalLM
from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model

# Load GPTQ model
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-7B-GPTQ",
    device_map="auto"
)

# Prepare for LoRA training
model = prepare_model_for_kbit_training(model)

# LoRA config
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# Add LoRA adapters
model = get_peft_model(model, lora_config)

# Fine-tune (memory efficient!)
# 70B model trainable on single A100 80GB
```

## 性能基准测试

### 内存占用降低

| 模型 | FP16 | GPTQ 4 位 | 降幅 |
|-------|------|------------|-----------|
| Llama 2-7B | 14 GB | 3.5 GB | 4× |
| Llama 2-13B | 26 GB | 6.5 GB | 4× |
| Llama 2-70B | 140 GB | 35 GB | 4× |
| Llama 3-405B | 810 GB | 203 GB | 4× |

**可以实现**：
- 在单张 A100 80GB 上运行 70B（FP16 需要 2× A100）
- 在 3× A100 80GB 上运行 405B（FP16 需要 11× A100）
- 在 RTX 4090 24GB 上运行 13B（FP16 会出现 OOM）

### 推理速度（Llama 2-7B，A100）

| 精度 | 词元/秒 | 相比 FP16 |
|-----------|------------|---------|
| FP16 | 25 tok/s | 1× |
| GPTQ 4 位（CUDA） | 85 tok/s | 3.4× |
| GPTQ 4 位（ExLlama） | 105 tok/s | 4.2× |
| GPTQ 4 位（Marlin） | 120 tok/s | 4.8× |

### 准确率（WikiText-2 上的困惑度）

| 模型 | FP16 | GPTQ 4 位（g=128） | 性能下降 |
|-------|------|---------------------|-------------|
| Llama 2-7B | 5.47 | 5.55 | +1.5% |
| Llama 2-13B | 4.88 | 4.95 | +1.4% |
| Llama 2-70B | 3.32 | 3.38 | +1.8% |

**出色的质量保持能力**——性能下降不到 2%！

## 常见模式

### 多 GPU 部署

```python
# Automatic device mapping
model = AutoGPTQForCausalLM.from_quantized(
    "TheBloke/Llama-2-70B-GPTQ",
    device_map="auto",  # Automatically split across GPUs
    max_memory={0: "40GB", 1: "40GB"}  # Limit per GPU
)

# Manual device mapping
device_map = {
    "model.embed_tokens": 0,
    "model.layers.0-39": 0,  # First 40 layers on GPU 0
    "model.layers.40-79": 1,  # Last 40 layers on GPU 1
    "model.norm": 1,
    "lm_head": 1
}

model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device_map=device_map
)
```

### CPU 卸载

```python
# Offload some layers to CPU (for very large models)
model = AutoGPTQForCausalLM.from_quantized(
    "TheBloke/Llama-2-405B-GPTQ",
    device_map="auto",
    max_memory={
        0: "80GB",  # GPU 0
        1: "80GB",  # GPU 1
        2: "80GB",  # GPU 2
        "cpu": "200GB"  # Offload overflow to CPU
    }
)
```

### 批量推理

```python
# Process multiple prompts efficiently
prompts = [
    "Explain AI",
    "Explain ML",
    "Explain DL"
]

inputs = tokenizer(prompts, return_tensors="pt", padding=True).to("cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    pad_token_id=tokenizer.eos_token_id
)

for i, output in enumerate(outputs):
    print(f"Prompt {i}: {tokenizer.decode(output)}")
```

## 查找预量化模型

**HuggingFace 上的 TheBloke**：
- https://huggingface.co/TheBloke
- 1000 多个 GPTQ 格式的模型
- 多种分组大小（32、128）
- 同时提供 CUDA 和 Marlin 格式

**搜索**：
```bash
# Find GPTQ models on HuggingFace
https://huggingface.co/models?library=gptq
```

**下载**：
```python
from auto_gptq import AutoGPTQForCausalLM

# Automatically downloads from HuggingFace
model = AutoGPTQForCausalLM.from_quantized(
    "TheBloke/Llama-2-70B-Chat-GPTQ",
    device="cuda:0"
)
```

## 支持的模型

- **LLaMA 系列**：Llama 2、Llama 3、Code Llama
- **Mistral**：Mistral 7B、Mixtral 8x7B、8x22B
- **Qwen**：Qwen、Qwen2、QwQ
- **DeepSeek**：V2、V3
- **Phi**：Phi-2、Phi-3
- **Yi、Falcon、BLOOM、OPT**
- HuggingFace 上的 **100 多个模型**

## 参考文档

- **[校准指南](references/calibration.md)** - 数据集选择、量化流程、质量优化
- **[集成指南](references/integration.md)** - Transformers、PEFT、vLLM、TensorRT-LLM
- **[故障排除](references/troubleshooting.md)** - 常见问题、性能优化

## 资源

- **GitHub**：https://github.com/AutoGPTQ/AutoGPTQ
- **论文**：GPTQ：精确的训练后量化（arXiv:2210.17323）
- **模型**：https://huggingface.co/models?library=gptq
- **Discord**：https://discord.gg/autogptq