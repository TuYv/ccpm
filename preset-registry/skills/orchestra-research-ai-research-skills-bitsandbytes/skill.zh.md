---
name: quantizing-models-bitsandbytes
description: Quantizes LLMs to 8-bit or 4-bit for 50-75% memory reduction with minimal accuracy loss. Use when GPU memory is limited, need to fit larger models, or want faster inference. Supports INT8, NF4, FP4 formats, QLoRA training, and 8-bit optimizers. Works with HuggingFace Transformers.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Optimization, Bitsandbytes, Quantization, 8-Bit, 4-Bit, Memory Optimization, QLoRA, NF4, INT8, HuggingFace, Efficient Inference]
dependencies: [bitsandbytes, transformers, accelerate, torch]
---
# bitsandbytes - LLM 量化

## 快速开始

bitsandbytes 可将 LLM 的内存占用减少 50%（8 位）或 75%（4 位），且准确率损失低于 1%。

**安装**：
```bash
pip install bitsandbytes transformers accelerate
```

**8 位量化**（内存占用减少 50%）：
```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

config = BitsAndBytesConfig(load_in_8bit=True)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=config,
    device_map="auto"
)

# Memory: 14GB → 7GB
```

**4 位量化**（内存占用减少 75%）：
```python
config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=config,
    device_map="auto"
)

# Memory: 14GB → 3.5GB
```

## 常见工作流

### 工作流 1：在有限的 GPU 内存中加载大型模型

复制此检查清单：

```
Quantization Loading:
- [ ] Step 1: Calculate memory requirements
- [ ] Step 2: Choose quantization level (4-bit or 8-bit)
- [ ] Step 3: Configure quantization
- [ ] Step 4: Load and verify model
```

**步骤 1：计算内存需求**

估算模型内存：
```
FP16 memory (GB) = Parameters × 2 bytes / 1e9
INT8 memory (GB) = Parameters × 1 byte / 1e9
INT4 memory (GB) = Parameters × 0.5 bytes / 1e9

Example (Llama 2 7B):
FP16: 7B × 2 / 1e9 = 14 GB
INT8: 7B × 1 / 1e9 = 7 GB
INT4: 7B × 0.5 / 1e9 = 3.5 GB
```

**步骤 2：选择量化级别**

| GPU 显存 | 模型大小 | 推荐配置 |
|----------|------------|-------------|
| 8 GB | 3B | 4 位 |
| 12 GB | 7B | 4 位 |
| 16 GB | 7B | 8 位或 4 位 |
| 24 GB | 13B | 8 位或 70B 4 位 |
| 40+ GB | 70B | 8 位 |

**步骤 3：配置量化**

对于 8 位（准确率更高）：
```python
from transformers import BitsAndBytesConfig
import torch

config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0,  # Outlier threshold
    llm_int8_has_fp16_weight=False
)
```

对于 4 位（最大限度节省内存）：
```python
config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,  # Compute in FP16
    bnb_4bit_quant_type="nf4",  # NormalFloat4 (recommended)
    bnb_4bit_use_double_quant=True  # Nested quantization
)
```

**步骤 4：加载并验证模型**

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=config,
    device_map="auto",  # Automatic device placement
    torch_dtype=torch.float16
)

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-13b-hf")

# Test inference
inputs = tokenizer("Hello, how are you?", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_length=50)
print(tokenizer.decode(outputs[0]))

# Check memory
import torch
print(f"Memory allocated: {torch.cuda.memory_allocated()/1e9:.2f}GB")
```

### 工作流 2：使用 QLoRA 进行微调（4 位训练）

QLoRA 支持在消费级 GPU 上对大型模型进行微调。

复制此检查清单：

```
QLoRA Fine-tuning:
- [ ] Step 1: Install dependencies
- [ ] Step 2: Configure 4-bit base model
- [ ] Step 3: Add LoRA adapters
- [ ] Step 4: Train with standard Trainer
```

**步骤 1：安装依赖项**

```bash
pip install bitsandbytes transformers peft accelerate datasets
```

**步骤 2：配置 4 位基础模型**

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)
```

**步骤 3：添加 LoRA 适配器**

```python
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# Prepare model for training
model = prepare_model_for_kbit_training(model)

# Configure LoRA
lora_config = LoraConfig(
    r=16,  # LoRA rank
    lora_alpha=32,  # LoRA alpha
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# Add LoRA adapters
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 4.2M || all params: 6.7B || trainable%: 0.06%
```

**步骤 4：使用标准 Trainer 进行训练**

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./qlora-output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    tokenizer=tokenizer
)

trainer.train()

# Save LoRA adapters (only ~20MB)
model.save_pretrained("./qlora-adapters")
```

### 工作流 3：用于内存高效训练的 8 位优化器

使用 8 位 Adam/AdamW，将优化器的内存占用减少 75%。

```
8-bit Optimizer Setup:
- [ ] Step 1: Replace standard optimizer
- [ ] Step 2: Configure training
- [ ] Step 3: Monitor memory savings
```

**步骤 1：替换标准优化器**

```python
import bitsandbytes as bnb
from transformers import Trainer, TrainingArguments

# Instead of torch.optim.AdamW
model = AutoModelForCausalLM.from_pretrained("model-name")

training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=8,
    optim="paged_adamw_8bit",  # 8-bit optimizer
    learning_rate=5e-5
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

trainer.train()
```

**手动使用优化器**：
```python
import bitsandbytes as bnb

optimizer = bnb.optim.AdamW8bit(
    model.parameters(),
    lr=1e-4,
    betas=(0.9, 0.999),
    eps=1e-8
)

# Training loop
for batch in dataloader:
    loss = model(**batch).loss
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
```

**第 2 步：配置训练**

比较内存占用：
```
Standard AdamW optimizer memory = model_params × 8 bytes (states)
8-bit AdamW memory = model_params × 2 bytes
Savings = 75% optimizer memory

Example (Llama 2 7B):
Standard: 7B × 8 = 56 GB
8-bit: 7B × 2 = 14 GB
Savings: 42 GB
```

**第 3 步：监控内存节省情况**

```python
import torch

before = torch.cuda.memory_allocated()

# Training step
optimizer.step()

after = torch.cuda.memory_allocated()
print(f"Memory used: {(after-before)/1e9:.2f}GB")
```

## 何时使用及替代方案

**以下情况使用 bitsandbytes：**
- GPU 内存有限（需要容纳更大的模型）
- 使用 QLoRA 进行训练（在单个 GPU 上微调 70B 模型）
- 仅进行推理（内存占用减少 50-75%）
- 使用 HuggingFace Transformers
- 可接受 0-2% 的准确率下降

**以下情况改用替代方案：**
- **GPTQ/AWQ**：生产环境服务（推理速度比 bitsandbytes 更快）
- **GGUF**：CPU 推理（llama.cpp）
- **FP8**：H100 GPU（硬件 FP8 速度更快）
- **全精度**：准确率至关重要，且内存不受限制

## 常见问题

**问题：加载过程中出现 CUDA 错误**

安装与 CUDA 版本匹配的版本：
```bash
# Check CUDA version
nvcc --version

# Install matching bitsandbytes
pip install bitsandbytes --no-cache-dir
```

**问题：模型加载缓慢**

对大型模型使用 CPU 卸载：
```python
model = AutoModelForCausalLM.from_pretrained(
    "model-name",
    quantization_config=config,
    device_map="auto",
    max_memory={0: "20GB", "cpu": "30GB"}  # Offload to CPU
)
```

**问题：准确率低于预期**

尝试使用 8 位而不是 4 位：
```python
config = BitsAndBytesConfig(load_in_8bit=True)
# 8-bit has <0.5% accuracy loss vs 1-2% for 4-bit
```

或者使用带双重量化的 NF4：
```python
config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",  # Better than fp4
    bnb_4bit_use_double_quant=True  # Extra accuracy
)
```

**问题：即使使用 4 位仍然出现 OOM**

启用 CPU 卸载：
```python
model = AutoModelForCausalLM.from_pretrained(
    "model-name",
    quantization_config=config,
    device_map="auto",
    offload_folder="offload",  # Disk offload
    offload_state_dict=True
)
```

## 高级主题

**QLoRA 训练指南**：有关完整的微调工作流、超参数调优和多 GPU 训练，请参阅 [references/qlora-training.md](references/qlora-training.md)。

**量化格式**：有关 INT8、NF4、FP4 的比较、双重量化和自定义量化配置，请参阅 [references/quantization-formats.md](references/quantization-formats.md)。

**内存优化**：有关 CPU 卸载策略、梯度检查点和内存分析，请参阅 [references/memory-optimization.md](references/memory-optimization.md)。

## 硬件要求

- **GPU**：计算能力为 7.0+ 的 NVIDIA GPU（Turing、Ampere、Hopper）
- **VRAM**：取决于模型和量化方式
  - 4 位 Llama 2 7B：4GB
  - 4 位 Llama 2 13B：8GB
  - 4 位 Llama 2 70B：24GB
- **CUDA**：11.1+（推荐 12.0+）
- **PyTorch**：2.0+

**支持的平台**：NVIDIA GPU（主要支持）、AMD ROCm、Intel GPU（实验性支持）

## 资源

- GitHub：https://github.com/bitsandbytes-foundation/bitsandbytes
- HuggingFace 文档：https://huggingface.co/docs/transformers/quantization/bitsandbytes
- QLoRA 论文：“QLoRA：量化大语言模型的高效微调”（2023）
- LLM.int8() 论文：“LLM.int8()：面向大规模 Transformer 的 8 位矩阵乘法”（2022）