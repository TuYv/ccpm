---
name: implementing-llms-litgpt
description: Implements and trains LLMs using Lightning AI's LitGPT with 20+ pretrained architectures (Llama, Gemma, Phi, Qwen, Mistral). Use when need clean model implementations, educational understanding of architectures, or production fine-tuning with LoRA/QLoRA. Single-file implementations, no abstraction layers.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Model Architecture, LitGPT, Lightning AI, LLM Implementation, LoRA, QLoRA, Fine-Tuning, Llama, Gemma, Phi, Mistral, Educational]
dependencies: [litgpt, torch, transformers]
---
# LitGPT - 简洁的 LLM 实现

## 快速开始

LitGPT 提供 20 多种预训练 LLM 实现，代码简洁易读，并配有可用于生产环境的训练工作流。

**安装**：
```bash
pip install 'litgpt[extra]'
```

**加载并使用任意模型**：
```python
from litgpt import LLM

# Load pretrained model
llm = LLM.load("microsoft/phi-2")

# Generate text
result = llm.generate(
    "What is the capital of France?",
    max_new_tokens=50,
    temperature=0.7
)
print(result)
```

**列出可用模型**：
```bash
litgpt download list
```

## 常用工作流

### 工作流 1：在自定义数据集上进行微调

复制此检查清单：

```
Fine-Tuning Setup:
- [ ] Step 1: Download pretrained model
- [ ] Step 2: Prepare dataset
- [ ] Step 3: Configure training
- [ ] Step 4: Run fine-tuning
```

**第 1 步：下载预训练模型**

```bash
# Download Llama 3 8B
litgpt download meta-llama/Meta-Llama-3-8B

# Download Phi-2 (smaller, faster)
litgpt download microsoft/phi-2

# Download Gemma 2B
litgpt download google/gemma-2b
```

模型会保存到 `checkpoints/` 目录。

**第 2 步：准备数据集**

LitGPT 支持多种格式：

**Alpaca 格式**（指令-响应）：
```json
[
  {
    "instruction": "What is the capital of France?",
    "input": "",
    "output": "The capital of France is Paris."
  },
  {
    "instruction": "Translate to Spanish: Hello, how are you?",
    "input": "",
    "output": "Hola, ¿cómo estás?"
  }
]
```

保存为 `data/my_dataset.json`。

**第 3 步：配置训练**

```bash
# Full fine-tuning (requires 40GB+ GPU for 7B models)
litgpt finetune \
  meta-llama/Meta-Llama-3-8B \
  --data JSON \
  --data.json_path data/my_dataset.json \
  --train.max_steps 1000 \
  --train.learning_rate 2e-5 \
  --train.micro_batch_size 1 \
  --train.global_batch_size 16

# LoRA fine-tuning (efficient, 16GB GPU)
litgpt finetune_lora \
  microsoft/phi-2 \
  --data JSON \
  --data.json_path data/my_dataset.json \
  --lora_r 16 \
  --lora_alpha 32 \
  --lora_dropout 0.05 \
  --train.max_steps 1000 \
  --train.learning_rate 1e-4
```

**第 4 步：运行微调**

训练检查点会自动保存到 `out/finetune/`。

监控训练：
```bash
# View logs
tail -f out/finetune/logs.txt

# TensorBoard (if using --train.logger_name tensorboard)
tensorboard --logdir out/finetune/lightning_logs
```

### 工作流 2：在单个 GPU 上进行 LoRA 微调

最节省显存的选项。

```
LoRA Training:
- [ ] Step 1: Choose base model
- [ ] Step 2: Configure LoRA parameters
- [ ] Step 3: Train with LoRA
- [ ] Step 4: Merge LoRA weights (optional)
```

**第 1 步：选择基础模型**

对于显存有限的 GPU（12-16GB）：
- **Phi-2**（2.7B）- 质量与规模之间的最佳平衡
- **Llama 3 1B** - 规模最小、速度最快
- **Gemma 2B** - 推理能力良好

**第 2 步：配置 LoRA 参数**

```bash
litgpt finetune_lora \
  microsoft/phi-2 \
  --data JSON \
  --data.json_path data/my_dataset.json \
  --lora_r 16 \          # LoRA rank (8-64, higher=more capacity)
  --lora_alpha 32 \      # LoRA scaling (typically 2×r)
  --lora_dropout 0.05 \  # Prevent overfitting
  --lora_query true \    # Apply LoRA to query projection
  --lora_key false \     # Usually not needed
  --lora_value true \    # Apply LoRA to value projection
  --lora_projection true \  # Apply LoRA to output projection
  --lora_mlp false \     # Usually not needed
  --lora_head false      # Usually not needed
```

LoRA 秩指南：
- `r=8`：轻量级，2-4MB 适配器
- `r=16`：标准配置，质量良好
- `r=32`：高容量，适用于复杂任务
- `r=64`：最高质量，适配器大小增加至 4 倍

**第 3 步：使用 LoRA 训练**

```bash
litgpt finetune_lora \
  microsoft/phi-2 \
  --data JSON \
  --data.json_path data/my_dataset.json \
  --lora_r 16 \
  --train.epochs 3 \
  --train.learning_rate 1e-4 \
  --train.micro_batch_size 4 \
  --train.global_batch_size 32 \
  --out_dir out/phi2-lora

# Memory usage: ~8-12GB for Phi-2 with LoRA
```

**第 4 步：合并 LoRA 权重**（可选）

将 LoRA 适配器合并到基础模型中以进行部署：

```bash
litgpt merge_lora \
  out/phi2-lora/final \
  --out_dir out/phi2-merged
```

现在使用合并后的模型：
```python
from litgpt import LLM
llm = LLM.load("out/phi2-merged")
```

### 工作流 3：从头开始预训练

使用你的领域数据训练新模型。

```
Pretraining:
- [ ] Step 1: Prepare pretraining dataset
- [ ] Step 2: Configure model architecture
- [ ] Step 3: Set up multi-GPU training
- [ ] Step 4: Launch pretraining
```

**第 1 步：准备预训练数据集**

LitGPT 需要分词后的数据。使用 `prepare_dataset.py`：

```bash
python scripts/prepare_dataset.py \
  --source_path data/my_corpus.txt \
  --checkpoint_dir checkpoints/tokenizer \
  --destination_path data/pretrain \
  --split train,val
```

**第 2 步：配置模型架构**

编辑配置文件或使用现有配置：

```python
# config/pythia-160m.yaml
model_name: pythia-160m
block_size: 2048
vocab_size: 50304
n_layer: 12
n_head: 12
n_embd: 768
rotary_percentage: 0.25
parallel_residual: true
bias: true
```

**第 3 步：设置多 GPU 训练**

```bash
# Single GPU
litgpt pretrain \
  --config config/pythia-160m.yaml \
  --data.data_dir data/pretrain \
  --train.max_tokens 10_000_000_000

# Multi-GPU with FSDP
litgpt pretrain \
  --config config/pythia-1b.yaml \
  --data.data_dir data/pretrain \
  --devices 8 \
  --train.max_tokens 100_000_000_000
```

**第 4 步：启动预训练**

在集群上进行大规模预训练：

```bash
# Using SLURM
sbatch --nodes=8 --gpus-per-node=8 \
  pretrain_script.sh

# pretrain_script.sh content:
litgpt pretrain \
  --config config/pythia-1b.yaml \
  --data.data_dir /shared/data/pretrain \
  --devices 8 \
  --num_nodes 8 \
  --train.global_batch_size 512 \
  --train.max_tokens 300_000_000_000
```

### 工作流 4：转换并部署模型

导出 LitGPT 模型以用于生产环境。

```
Model Deployment:
- [ ] Step 1: Test inference locally
- [ ] Step 2: Quantize model (optional)
- [ ] Step 3: Convert to GGUF (for llama.cpp)
- [ ] Step 4: Deploy with API
```

**第 1 步：在本地测试推理**

```python
from litgpt import LLM

llm = LLM.load("out/phi2-lora/final")

# Single generation
print(llm.generate("What is machine learning?"))

# Streaming
for token in llm.generate("Explain quantum computing", stream=True):
    print(token, end="", flush=True)

# Batch inference
prompts = ["Hello", "Goodbye", "Thank you"]
results = [llm.generate(p) for p in prompts]
```

**步骤 2：量化模型**（可选）

在尽可能减少质量损失的情况下缩小模型体积：

```bash
# 8-bit quantization (50% size reduction)
litgpt convert_lit_checkpoint \
  out/phi2-lora/final \
  --dtype bfloat16 \
  --quantize bnb.nf4

# 4-bit quantization (75% size reduction)
litgpt convert_lit_checkpoint \
  out/phi2-lora/final \
  --quantize bnb.nf4-dq  # Double quantization
```

**步骤 3：转换为 GGUF**（用于 llama.cpp）

```bash
python scripts/convert_lit_checkpoint.py \
  --checkpoint_path out/phi2-lora/final \
  --output_path models/phi2.gguf \
  --model_name microsoft/phi-2
```

**步骤 4：通过 API 部署**

```python
from fastapi import FastAPI
from litgpt import LLM

app = FastAPI()
llm = LLM.load("out/phi2-lora/final")

@app.post("/generate")
def generate(prompt: str, max_tokens: int = 100):
    result = llm.generate(
        prompt,
        max_new_tokens=max_tokens,
        temperature=0.7
    )
    return {"response": result}

# Run: uvicorn api:app --host 0.0.0.0 --port 8000
```

## 何时使用 LitGPT，何时使用替代方案

**以下情况使用 LitGPT：**
- 想要理解 LLM 架构（代码简洁、易读）
- 需要生产就绪的训练方案
- 用于教学或研究
- 对新的模型构想进行原型开发
- Lightning 生态系统用户

**以下情况改用替代方案：**
- **Axolotl/TRL**：更多微调功能、YAML 配置
- **Megatron-Core**：为超过 70B 的模型提供最高性能
- **HuggingFace Transformers**：最广泛的模型支持
- **vLLM**：仅用于推理（不支持训练）

## 常见问题

**问题：微调期间内存不足**

使用 LoRA 代替全量微调：
```bash
# Instead of litgpt finetune (requires 40GB+)
litgpt finetune_lora  # Only needs 12-16GB
```

或者启用梯度检查点：
```bash
litgpt finetune_lora \
  ... \
  --train.gradient_accumulation_iters 4  # Accumulate gradients
```

**问题：训练速度太慢**

启用 Flash Attention（内置功能，会在兼容硬件上自动启用）：
```python
# Already enabled by default on Ampere+ GPUs (A100, RTX 30/40 series)
# No configuration needed
```

使用更小的微批次并进行梯度累积：
```bash
--train.micro_batch_size 1 \
--train.global_batch_size 32 \
--train.gradient_accumulation_iters 32  # Effective batch=32
```

**问题：模型无法加载**

检查模型名称：
```bash
# List all available models
litgpt download list

# Download if not exists
litgpt download meta-llama/Meta-Llama-3-8B
```

验证检查点目录：
```bash
ls checkpoints/
# Should see: meta-llama/Meta-Llama-3-8B/
```

**问题：LoRA 适配器过大**

降低 LoRA 秩：
```bash
--lora_r 8  # Instead of 16 or 32
```

将 LoRA 应用于更少的层：
```bash
--lora_query true \
--lora_value true \
--lora_projection false \  # Disable this
--lora_mlp false  # And this
```

## 高级主题

**支持的架构**：有关 20 多个模型系列及其规模和功能的完整列表，请参阅 [references/supported-models.md](references/supported-models.md)。

**训练方案**：有关经过验证的预训练和微调超参数配置，请参阅 [references/training-recipes.md](references/training-recipes.md)。

**FSDP 配置**：有关使用完全分片数据并行进行多 GPU 训练的信息，请参阅 [references/distributed-training.md](references/distributed-training.md)。

**自定义架构**：有关以 LitGPT 风格实现新模型架构的信息，请参阅 [references/custom-models.md](references/custom-models.md)。

## 硬件要求

- **GPU**：NVIDIA（CUDA 11.8+）、AMD（ROCm）、Apple Silicon（MPS）
- **内存**：
  - 推理（Phi-2）：6GB
  - LoRA 微调（7B）：16GB
  - 全量微调（7B）：40GB+
  - 预训练（1B）：24GB
- **存储空间**：每个模型 5-50GB（取决于模型大小）

## 资源

- GitHub：https://github.com/Lightning-AI/litgpt
- 文档：https://lightning.ai/docs/litgpt
- 教程：https://lightning.ai/docs/litgpt/tutorials
- 模型库：20 多种预训练架构（Llama、Gemma、Phi、Qwen、Mistral、Mixtral、Falcon 等）