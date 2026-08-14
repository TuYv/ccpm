---
name: model-merging
description: Merge multiple fine-tuned models using mergekit to combine capabilities without retraining. Use when creating specialized models by blending domain-specific expertise (math + coding + chat), improving performance beyond single models, or experimenting rapidly with model variants. Covers SLERP, TIES-Merging, DARE, Task Arithmetic, linear merging, and production deployment strategies.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Emerging Techniques, Model Merging, Mergekit, SLERP, TIES, DARE, Task Arithmetic, Model Fusion, No Retraining, Multi-Capability, Arcee AI]
dependencies: [mergekit, transformers, torch]
---
# 模型合并：组合预训练模型

## 何时使用此技能

当你需要执行以下操作时，请使用模型合并：
- **组合能力**：无需重新训练即可整合多个微调模型的能力
- **创建专用模型**：融合特定领域的专业能力（数学 + 编程 + 对话）
- **提升性能**：超越单一模型（基准测试成绩通常可提高 5-10%）
- **降低训练成本**：无需 GPU，合并可在 CPU 上运行
- **快速实验**：只需几分钟而非数天即可创建新的模型变体
- **保留多种技能**：在不发生灾难性遗忘的情况下进行合并

**成功案例**：Marcoro14-7B-slerp（2024 年 2 月 Open LLM Leaderboard 榜首），许多 HuggingFace 顶尖模型都使用了模型合并

**工具**：mergekit（Arcee AI）、LazyMergekit、Model Soup

## 安装

```bash
# Install mergekit
git clone https://github.com/arcee-ai/mergekit.git
cd mergekit
pip install -e .

# Or via pip
pip install mergekit

# Optional: Transformer library
pip install transformers torch
```

## 快速入门

### 简单线性合并

```yaml
# config.yml - Merge two models with equal weights
merge_method: linear
models:
  - model: mistralai/Mistral-7B-v0.1
    parameters:
      weight: 0.5
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      weight: 0.5
dtype: bfloat16
```

```bash
# Run merge
mergekit-yaml config.yml ./merged-model --cuda

# Use merged model
python -m transformers.models.auto --model_name_or_path ./merged-model
```

### SLERP 合并（最适合 2 个模型）

```yaml
# config.yml - Spherical interpolation
merge_method: slerp
slices:
  - sources:
      - model: mistralai/Mistral-7B-v0.1
        layer_range: [0, 32]
      - model: teknium/OpenHermes-2.5-Mistral-7B
        layer_range: [0, 32]
parameters:
  t: 0.5  # Interpolation factor (0=model1, 1=model2)
dtype: bfloat16
```

## 核心概念

### 1. 合并方法

**线性合并（Model Soup）**
- 对参数进行简单的加权平均
- 速度快，适用于相似模型
- 可以合并 2 个或更多模型

```python
merged_weights = w1 * model1_weights + w2 * model2_weights + w3 * model3_weights
# where w1 + w2 + w3 = 1
```

**SLERP（球面线性插值）**
- 沿权重空间中的球面进行插值
- 保持权重向量的模长
- 最适合合并 2 个模型
- 比线性合并更平滑

```python
# SLERP formula
merged = (sin((1-t)*θ) / sin(θ)) * model1 + (sin(t*θ) / sin(θ)) * model2
# where θ = arccos(dot(model1, model2))
# t ∈ [0, 1]
```

**任务算术**
- 提取“任务向量”（微调模型 - 基础模型）
- 组合任务向量并添加到基础模型
- 适合合并多个专用模型

```python
# Task vector
task_vector = finetuned_model - base_model

# Merge multiple task vectors
merged = base_model + α₁*task_vector₁ + α₂*task_vector₂
```

**TIES-Merging**
- 任务算术 + 稀疏化
- 解决参数中的符号冲突
- 最适合合并多个任务专用模型

**DARE（Drop And REscale）**
- 随机丢弃微调参数
- 对剩余参数进行重新缩放
- 减少冗余并保持性能

### 2. 配置结构

```yaml
# Basic structure
merge_method: <method>  # linear, slerp, ties, dare_ties, task_arithmetic
base_model: <path>      # Optional: base model for task arithmetic

models:
  - model: <path/to/model1>
    parameters:
      weight: <float>   # Merge weight
      density: <float>  # For TIES/DARE

  - model: <path/to/model2>
    parameters:
      weight: <float>

parameters:
  # Method-specific parameters

dtype: <dtype>  # bfloat16, float16, float32

# Optional
slices:  # Layer-wise merging
tokenizer:  # Tokenizer configuration
```

## 合并方法指南

### 线性合并

**最适合**：简单的模型组合、等权重合并

```yaml
merge_method: linear
models:
  - model: WizardLM/WizardMath-7B-V1.1
    parameters:
      weight: 0.4
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      weight: 0.3
  - model: NousResearch/Nous-Hermes-2-Mistral-7B-DPO
    parameters:
      weight: 0.3
dtype: bfloat16
```

### SLERP 合并

**最适合**：两个模型、平滑插值

```yaml
merge_method: slerp
slices:
  - sources:
      - model: mistralai/Mistral-7B-v0.1
        layer_range: [0, 32]
      - model: teknium/OpenHermes-2.5-Mistral-7B
        layer_range: [0, 32]
parameters:
  t: 0.5  # 0.0 = first model, 1.0 = second model
dtype: bfloat16
```

**特定层 SLERP：**

```yaml
merge_method: slerp
slices:
  - sources:
      - model: model_a
        layer_range: [0, 32]
      - model: model_b
        layer_range: [0, 32]
parameters:
  t:
    - filter: self_attn    # Attention layers
      value: 0.3
    - filter: mlp          # MLP layers
      value: 0.7
    - value: 0.5           # Default for other layers
dtype: bfloat16
```

### 任务算术

**最适合**：组合专业技能

```yaml
merge_method: task_arithmetic
base_model: mistralai/Mistral-7B-v0.1
models:
  - model: WizardLM/WizardMath-7B-V1.1  # Math
    parameters:
      weight: 0.5
  - model: teknium/OpenHermes-2.5-Mistral-7B  # Chat
    parameters:
      weight: 0.3
  - model: ajibawa-2023/Code-Mistral-7B  # Code
    parameters:
      weight: 0.2
dtype: bfloat16
```

### TIES 合并

**最适合**：合并多个模型、解决冲突

```yaml
merge_method: ties
base_model: mistralai/Mistral-7B-v0.1
models:
  - model: WizardLM/WizardMath-7B-V1.1
    parameters:
      density: 0.5  # Keep top 50% of parameters
      weight: 1.0
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      density: 0.5
      weight: 1.0
  - model: NousResearch/Nous-Hermes-2-Mistral-7B-DPO
    parameters:
      density: 0.5
      weight: 1.0
parameters:
  normalize: true
dtype: bfloat16
```

### DARE 合并

**最适合**：减少冗余

```yaml
merge_method: dare_ties
base_model: mistralai/Mistral-7B-v0.1
models:
  - model: WizardLM/WizardMath-7B-V1.1
    parameters:
      density: 0.5    # Drop 50% of deltas
      weight: 0.6
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      density: 0.5
      weight: 0.4
parameters:
  int8_mask: true  # Use int8 for masks (saves memory)
dtype: bfloat16
```

## 高级模式

### 分层合并

```yaml
# Different models for different layers
merge_method: passthrough
slices:
  - sources:
      - model: mistralai/Mistral-7B-v0.1
        layer_range: [0, 16]   # First half
  - sources:
      - model: teknium/OpenHermes-2.5-Mistral-7B
        layer_range: [16, 32]  # Second half
dtype: bfloat16
```

### 从合并模型构建 MoE

```yaml
# Create Mixture of Experts
merge_method: moe
base_model: mistralai/Mistral-7B-v0.1
experts:
  - source_model: WizardLM/WizardMath-7B-V1.1
    positive_prompts:
      - "math"
      - "calculate"
  - source_model: teknium/OpenHermes-2.5-Mistral-7B
    positive_prompts:
      - "chat"
      - "conversation"
  - source_model: ajibawa-2023/Code-Mistral-7B
    positive_prompts:
      - "code"
      - "python"
dtype: bfloat16
```

### 分词器合并

```yaml
merge_method: linear
models:
  - model: mistralai/Mistral-7B-v0.1
  - model: custom/specialized-model

tokenizer:
  source: "union"  # Combine vocabularies from both models
  tokens:
    <|special_token|>:
      source: "custom/specialized-model"
```

## 最佳实践

### 1. 模型兼容性

```python
# ✅ Good: Same architecture
models = [
    "mistralai/Mistral-7B-v0.1",
    "teknium/OpenHermes-2.5-Mistral-7B",  # Both Mistral 7B
]

# ❌ Bad: Different architectures
models = [
    "meta-llama/Llama-2-7b-hf",  # Llama
    "mistralai/Mistral-7B-v0.1",  # Mistral (incompatible!)
]
```

### 2. 权重选择

```yaml
# ✅ Good: Weights sum to 1.0
models:
  - model: model_a
    parameters:
      weight: 0.6
  - model: model_b
    parameters:
      weight: 0.4  # 0.6 + 0.4 = 1.0

# ⚠️  Acceptable: Weights don't sum to 1 (for task arithmetic)
models:
  - model: model_a
    parameters:
      weight: 0.8
  - model: model_b
    parameters:
      weight: 0.8  # May boost performance
```

### 3. 方法选择

```python
# Choose merge method based on use case:

# 2 models, smooth blend → SLERP
merge_method = "slerp"

# 3+ models, simple average → Linear
merge_method = "linear"

# Multiple task-specific models → Task Arithmetic or TIES
merge_method = "ties"

# Want to reduce redundancy → DARE
merge_method = "dare_ties"
```

### 4. 密度调优（TIES/DARE）

```yaml
# Start conservative (keep more parameters)
parameters:
  density: 0.8  # Keep 80%

# If performance good, increase sparsity
parameters:
  density: 0.5  # Keep 50%

# If performance degrades, reduce sparsity
parameters:
  density: 0.9  # Keep 90%
```

### 5. 特定层合并

```yaml
# Preserve base model's beginning and end
merge_method: passthrough
slices:
  - sources:
      - model: base_model
        layer_range: [0, 2]     # Keep first layers
  - sources:
      - model: merged_middle    # Merge middle layers
        layer_range: [2, 30]
  - sources:
      - model: base_model
        layer_range: [30, 32]   # Keep last layers
```

## 评估与测试

### 对合并模型进行基准测试

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load merged model
model = AutoModelForCausalLM.from_pretrained("./merged-model")
tokenizer = AutoTokenizer.from_pretrained("./merged-model")

# Test on various tasks
test_prompts = {
    "math": "Calculate: 25 * 17 =",
    "code": "Write a Python function to reverse a string:",
    "chat": "What is the capital of France?",
}

for task, prompt in test_prompts.items():
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=100)
    print(f"{task}: {tokenizer.decode(outputs[0])}")
```

### 常用基准测试

- **Open LLM Leaderboard**：通用能力
- **MT-Bench**：多轮对话
- **MMLU**：多任务准确率
- **HumanEval**：代码生成
- **GSM8K**：数学推理

## 生产部署

### 保存并上传

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load merged model
model = AutoModelForCausalLM.from_pretrained("./merged-model")
tokenizer = AutoTokenizer.from_pretrained("./merged-model")

# Upload to HuggingFace Hub
model.push_to_hub("username/my-merged-model")
tokenizer.push_to_hub("username/my-merged-model")
```

### 量化合并后的模型

```bash
# Quantize with GGUF
python convert.py ./merged-model --outtype f16 --outfile merged-model.gguf

# Quantize with GPTQ
python quantize_gptq.py ./merged-model --bits 4 --group_size 128
```

## 常见陷阱

### ❌ 陷阱 1：合并不兼容的模型

```yaml
# Wrong: Different architectures
models:
  - model: meta-llama/Llama-2-7b  # Llama architecture
  - model: mistralai/Mistral-7B   # Mistral architecture
```

**修复方法**：仅合并架构相同的模型

### ❌ 陷阱 2：某个模型的权重过高

```yaml
# Suboptimal: One model dominates
models:
  - model: model_a
    parameters:
      weight: 0.95  # Too high
  - model: model_b
    parameters:
      weight: 0.05  # Too low
```

**修复方法**：使用更均衡的权重（范围为 0.3-0.7）

### ❌ 陷阱 3：未进行评估

```bash
# Wrong: Merge and deploy without testing
mergekit-yaml config.yml ./merged-model
# Deploy immediately (risky!)
```

**修复方法**：部署前始终进行基准测试

## 资源

- **mergekit GitHub**：https://github.com/arcee-ai/mergekit
- **HuggingFace 教程**：https://huggingface.co/blog/mlabonne/merge-models
- **LazyMergekit**：自动化合并笔记本
- **TIES 论文**：https://arxiv.org/abs/2306.01708
- **DARE 论文**：https://arxiv.org/abs/2311.03099

## 另请参阅

- `references/methods.md` - 深入了解合并算法
- `references/examples.md` - 实际应用中的合并配置
- `references/evaluation.md` - 基准测试与测试策略