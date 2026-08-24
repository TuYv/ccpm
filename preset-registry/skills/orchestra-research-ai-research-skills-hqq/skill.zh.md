---
name: hqq-quantization
description: Half-Quadratic Quantization for LLMs without calibration data. Use when quantizing models to 4/3/2-bit precision without needing calibration datasets, for fast quantization workflows, or when deploying with vLLM or HuggingFace Transformers.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Quantization, HQQ, Optimization, Memory Efficiency, Inference, Model Compression]
dependencies: [hqq>=0.2.0, torch>=2.0.0]
---
# HQQ - 半二次量化

快速、无需校准的权重量化，支持 8/4/3/2/1 位精度以及多种优化后端。

## 何时使用 HQQ

**在以下情况下使用 HQQ：**
- 在没有校准数据的情况下量化模型（无需数据集）
- 需要快速量化（几分钟，而 GPTQ/AWQ 需要数小时）
- 使用 vLLM 或 HuggingFace Transformers 进行部署
- 使用 LoRA/PEFT 微调量化模型
- 尝试极低位量化（2 位、1 位）

**主要优势：**
- **无需校准**：无需样本数据，即可立即量化任何模型
- **多种后端**：支持 PyTorch、ATEN、TorchAO、Marlin、BitBlas，以实现优化推理
- **灵活精度**：支持 8/4/3/2/1 位以及可配置的分组大小
- **框架集成**：原生支持 HuggingFace 和 vLLM
- **兼容 PEFT**：使用 LoRA 微调量化模型

**以下情况请改用其他方案：**
- **AWQ**：需要基于校准的准确率和生产环境服务
- **GPTQ**：有可用的校准数据，并要求最高准确率
- **bitsandbytes**：需要不依赖自定义后端的简单 8 位/4 位量化
- **llama.cpp/GGUF**：用于 CPU 推理或 Apple Silicon 部署

## 快速开始

### 安装

```bash
pip install hqq

# With specific backend
pip install hqq[torch]      # PyTorch backend
pip install hqq[torchao]    # TorchAO int4 backend
pip install hqq[bitblas]    # BitBlas backend
pip install hqq[marlin]     # Marlin backend
```

### 基本量化

```python
from hqq.core.quantize import BaseQuantizeConfig, HQQLinear
import torch.nn as nn

# Configure quantization
config = BaseQuantizeConfig(
    nbits=4,           # 4-bit quantization
    group_size=64,     # Group size for quantization
    axis=1             # Quantize along output dimension
)

# Quantize a linear layer
linear = nn.Linear(4096, 4096)
hqq_linear = HQQLinear(linear, config)

# Use normally
output = hqq_linear(input_tensor)
```

### 使用 HuggingFace 量化完整模型

```python
from transformers import AutoModelForCausalLM, HqqConfig

# Configure HQQ
quantization_config = HqqConfig(
    nbits=4,
    group_size=64,
    axis=1
)

# Load and quantize
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=quantization_config,
    device_map="auto"
)

# Model is quantized and ready to use
```

## 核心概念

### 量化配置

HQQ 使用 `BaseQuantizeConfig` 定义量化参数：

```python
from hqq.core.quantize import BaseQuantizeConfig

# Standard 4-bit config
config_4bit = BaseQuantizeConfig(
    nbits=4,           # Bits per weight (1-8)
    group_size=64,     # Weights per quantization group
    axis=1             # 0=input dim, 1=output dim
)

# Aggressive 2-bit config
config_2bit = BaseQuantizeConfig(
    nbits=2,
    group_size=16,     # Smaller groups for low-bit
    axis=1
)

# Mixed precision per layer type
layer_configs = {
    "self_attn.q_proj": BaseQuantizeConfig(nbits=4, group_size=64),
    "self_attn.k_proj": BaseQuantizeConfig(nbits=4, group_size=64),
    "self_attn.v_proj": BaseQuantizeConfig(nbits=4, group_size=64),
    "mlp.gate_proj": BaseQuantizeConfig(nbits=2, group_size=32),
    "mlp.up_proj": BaseQuantizeConfig(nbits=2, group_size=32),
    "mlp.down_proj": BaseQuantizeConfig(nbits=4, group_size=64),
}
```

### HQQLinear 层

用于替代 `nn.Linear` 的核心量化层：

```python
from hqq.core.quantize import HQQLinear
import torch

# Create quantized layer
linear = torch.nn.Linear(4096, 4096)
hqq_layer = HQQLinear(linear, config)

# Access quantized weights
W_q = hqq_layer.W_q           # Quantized weights
scale = hqq_layer.scale       # Scale factors
zero = hqq_layer.zero         # Zero points

# Dequantize for inspection
W_dequant = hqq_layer.dequantize()
```

### 后端

HQQ 支持针对不同硬件的多种推理后端：

```python
from hqq.core.quantize import HQQLinear

# Available backends
backends = [
    "pytorch",          # Pure PyTorch (default)
    "pytorch_compile",  # torch.compile optimized
    "aten",            # Custom CUDA kernels
    "torchao_int4",    # TorchAO int4 matmul
    "gemlite",         # GemLite CUDA kernels
    "bitblas",         # BitBlas optimized
    "marlin",          # Marlin 4-bit kernels
]

# Set backend globally
HQQLinear.set_backend("torchao_int4")

# Or per layer
hqq_layer.set_backend("marlin")
```

**后端选择指南：**
| 后端 | 最适合 | 要求 |
|---------|----------|--------------|
| pytorch | 兼容性 | 任意 GPU |
| pytorch_compile | 中等程度的加速 | torch>=2.0 |
| aten | 良好的均衡表现 | CUDA GPU |
| torchao_int4 | 4 位推理 | 已安装 torchao |
| marlin | 最大化 4 位推理速度 | Ampere+ GPU |
| bitblas | 灵活的位宽 | 已安装 bitblas |

## HuggingFace 集成

### 加载预量化模型

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load HQQ-quantized model from Hub
model = AutoModelForCausalLM.from_pretrained(
    "mobiuslabsgmbh/Llama-3.1-8B-HQQ-4bit",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Use normally
inputs = tokenizer("Hello, world!", return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=50)
```

### 量化并保存

```python
from transformers import AutoModelForCausalLM, HqqConfig

# Quantize
config = HqqConfig(nbits=4, group_size=64)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=config,
    device_map="auto"
)

# Save quantized model
model.save_pretrained("./llama-8b-hqq-4bit")

# Push to Hub
model.push_to_hub("my-org/Llama-3.1-8B-HQQ-4bit")
```

### 混合精度量化

```python
from transformers import AutoModelForCausalLM, HqqConfig

# Different precision per layer type
config = HqqConfig(
    nbits=4,
    group_size=64,
    # Attention layers: higher precision
    # MLP layers: lower precision for memory savings
    dynamic_config={
        "attn": {"nbits": 4, "group_size": 64},
        "mlp": {"nbits": 2, "group_size": 32}
    }
)
```

## vLLM 集成

### 使用 vLLM 提供 HQQ 模型服务

```python
from vllm import LLM, SamplingParams

# Load HQQ-quantized model
llm = LLM(
    model="mobiuslabsgmbh/Llama-3.1-8B-HQQ-4bit",
    quantization="hqq",
    dtype="float16"
)

# Generate
sampling_params = SamplingParams(temperature=0.7, max_tokens=100)
outputs = llm.generate(["What is machine learning?"], sampling_params)
```

### 使用自定义 HQQ 配置的 vLLM

```python
from vllm import LLM

llm = LLM(
    model="meta-llama/Llama-3.1-8B",
    quantization="hqq",
    quantization_config={
        "nbits": 4,
        "group_size": 64
    }
)
```

## PEFT/LoRA 微调

### 微调量化模型

```python
from transformers import AutoModelForCausalLM, HqqConfig
from peft import LoraConfig, get_peft_model

# Load quantized model
quant_config = HqqConfig(nbits=4, group_size=64)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=quant_config,
    device_map="auto"
)

# Apply LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)

# Train normally with Trainer or custom loop
```

### QLoRA 风格训练

```python
from transformers import TrainingArguments, Trainer

training_args = TrainingArguments(
    output_dir="./hqq-lora-output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=3,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    data_collator=data_collator
)

trainer.train()
```

## 量化工作流

### 工作流 1：快速压缩模型

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, HqqConfig

# 1. Configure quantization
config = HqqConfig(nbits=4, group_size=64)

# 2. Load and quantize (no calibration needed!)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=config,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# 3. Verify quality
prompt = "The capital of France is"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=20)
print(tokenizer.decode(outputs[0]))

# 4. Save
model.save_pretrained("./llama-8b-hqq")
tokenizer.save_pretrained("./llama-8b-hqq")
```

### 工作流 2：优化推理速度

```python
from hqq.core.quantize import HQQLinear
from transformers import AutoModelForCausalLM, HqqConfig

# 1. Quantize with optimal backend
config = HqqConfig(nbits=4, group_size=64)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=config,
    device_map="auto"
)

# 2. Set fast backend
HQQLinear.set_backend("marlin")  # or "torchao_int4"

# 3. Compile for additional speedup
import torch
model = torch.compile(model)

# 4. Benchmark
import time
inputs = tokenizer("Hello", return_tensors="pt").to(model.device)
start = time.time()
for _ in range(10):
    model.generate(**inputs, max_new_tokens=100)
print(f"Avg time: {(time.time() - start) / 10:.2f}s")
```

## 最佳实践

1. **从 4 位开始**：对大多数模型而言，这是质量与大小之间的最佳权衡
2. **使用 group_size=64**：可实现良好平衡；进行极限量化时可使用更小的值
3. **明智地选择后端**：在 Ampere 及更新架构上进行 4 位量化时使用 Marlin，需要灵活性时使用 TorchAO
4. **验证质量**：量化后务必测试生成质量
5. **混合精度**：注意力层保持较高精度，对 MLP 进行更高程度的压缩
6. **PEFT 训练**：使用 LoRA r=16-32 可获得良好的微调效果

## 常见问题

**量化过程中内存不足：**
```python
# Quantize layer-by-layer
from hqq.models.hf.base import AutoHQQHFModel

model = AutoHQQHFModel.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=config,
    device_map="sequential"  # Load layers sequentially
)
```

**推理速度慢：**
```python
# Switch to optimized backend
from hqq.core.quantize import HQQLinear
HQQLinear.set_backend("marlin")  # Requires Ampere+ GPU

# Or compile
model = torch.compile(model, mode="reduce-overhead")
```

**2 位量化时质量较差：**
```python
# Use smaller group size
config = BaseQuantizeConfig(
    nbits=2,
    group_size=16,  # Smaller groups help at low bits
    axis=1
)
```

## 参考资料

- **[高级用法](references/advanced-usage.md)** - 自定义后端、混合精度、优化
- **[故障排除](references/troubleshooting.md)** - 常见问题、调试、基准测试

## 资源

- **代码仓库**：https://github.com/mobiusml/hqq
- **论文**：半二次量化
- **HuggingFace 模型**：https://huggingface.co/mobiuslabsgmbh
- **版本**：0.2.0+
- **许可证**：Apache 2.0