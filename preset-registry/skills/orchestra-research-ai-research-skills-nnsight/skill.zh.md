---
name: nnsight-remote-interpretability
description: Provides guidance for interpreting and manipulating neural network internals using nnsight with optional NDIF remote execution. Use when needing to run interpretability experiments on massive models (70B+) without local GPU resources, or when working with any PyTorch architecture.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [nnsight, NDIF, Remote Execution, Mechanistic Interpretability, Model Internals]
dependencies: [nnsight>=0.5.0, torch>=2.0.0]
---
# nnsight：透明访问神经网络内部机制

nnsight (/ɛn.saɪt/) 使研究人员能够解释和操控任何 PyTorch 模型的内部机制，其独特能力是可以通过 NDIF 使用同一份代码，在本地的小型模型或远程的超大模型（70B+）上运行。

**GitHub**：[ndif-team/nnsight](https://github.com/ndif-team/nnsight)（730+ stars）
**论文**：[NNsight and NDIF: Democratizing Access to Foundation Model Internals](https://arxiv.org/abs/2407.14561)（ICLR 2025）

## 核心价值主张

**一次编写，随处运行**：同一份可解释性代码既可在本地 GPT-2 上运行，也可在远程 Llama-3.1-405B 上运行。只需切换 `remote=True`。

```python
# Local execution (small model)
with model.trace("Hello world"):
    hidden = model.transformer.h[5].output[0].save()

# Remote execution (massive model) - same code!
with model.trace("Hello world", remote=True):
    hidden = model.model.layers[40].output[0].save()
```

## 何时使用 nnsight

**当你需要执行以下操作时，请使用 nnsight：**
- 在规模过大、无法使用本地 GPU 运行的模型（70B、405B）上开展可解释性实验
- 使用任意 PyTorch 架构（transformers、Mamba、自定义模型）
- 执行多 token 生成干预
- 在不同提示词之间共享激活值
- 无需重新实现即可访问完整的模型内部机制

**在以下情况下可考虑其他选择：**
- 你希望不同模型具有一致的 API → 使用 **TransformerLens**
- 你需要声明式、可共享的干预 → 使用 **pyvene**
- 你正在训练 SAE → 使用 **SAELens**
- 你只在本地使用小型模型 → **TransformerLens** 可能更简单

## 安装

```bash
# Basic installation
pip install nnsight

# For vLLM support
pip install "nnsight[vllm]"
```

如需使用远程 NDIF 执行，请在 [login.ndif.us](https://login.ndif.us) 注册以获取 API 密钥。

## 核心概念

### LanguageModel 包装器

```python
from nnsight import LanguageModel

# Load model (uses HuggingFace under the hood)
model = LanguageModel("openai-community/gpt2", device_map="auto")

# For larger models
model = LanguageModel("meta-llama/Llama-3.1-8B", device_map="auto")
```

### 跟踪上下文

`trace` 上下文管理器支持延迟执行——操作会被收集到一个计算图中：

```python
from nnsight import LanguageModel

model = LanguageModel("gpt2", device_map="auto")

with model.trace("The Eiffel Tower is in") as tracer:
    # Access any module's output
    hidden_states = model.transformer.h[5].output[0].save()

    # Access attention patterns
    attn = model.transformer.h[5].attn.attn_dropout.input[0][0].save()

    # Modify activations
    model.transformer.h[8].output[0][:] = 0  # Zero out layer 8

    # Get final output
    logits = model.output.save()

# After context exits, access saved values
print(hidden_states.shape)  # [batch, seq, hidden]
```

### 代理对象

在 `trace` 内部，访问模块时会返回用于记录操作的 Proxy 对象：

```python
with model.trace("Hello"):
    # These are all Proxy objects - operations are deferred
    h5_out = model.transformer.h[5].output[0]  # Proxy
    h5_mean = h5_out.mean(dim=-1)              # Proxy
    h5_saved = h5_mean.save()                   # Save for later access
```

## 工作流 1：激活分析

### 分步说明

```python
from nnsight import LanguageModel
import torch

model = LanguageModel("gpt2", device_map="auto")

prompt = "The capital of France is"

with model.trace(prompt) as tracer:
    # 1. Collect activations from multiple layers
    layer_outputs = []
    for i in range(12):  # GPT-2 has 12 layers
        layer_out = model.transformer.h[i].output[0].save()
        layer_outputs.append(layer_out)

    # 2. Get attention patterns
    attn_patterns = []
    for i in range(12):
        # Access attention weights (after softmax)
        attn = model.transformer.h[i].attn.attn_dropout.input[0][0].save()
        attn_patterns.append(attn)

    # 3. Get final logits
    logits = model.output.save()

# 4. Analyze outside context
for i, layer_out in enumerate(layer_outputs):
    print(f"Layer {i} output shape: {layer_out.shape}")
    print(f"Layer {i} norm: {layer_out.norm().item():.3f}")

# 5. Find top predictions
probs = torch.softmax(logits[0, -1], dim=-1)
top_tokens = probs.topk(5)
for token, prob in zip(top_tokens.indices, top_tokens.values):
    print(f"{model.tokenizer.decode(token)}: {prob.item():.3f}")
```

### 检查清单
- [ ] 使用 LanguageModel 包装器加载模型
- [ ] 在 trace 上下文中执行操作
- [ ] 对需要在上下文结束后使用的值调用 `.save()`
- [ ] 在上下文外访问已保存的值
- [ ] 使用 `.shape`、`.norm()` 等进行分析

## 工作流 2：激活修补

### 分步说明

```python
from nnsight import LanguageModel
import torch

model = LanguageModel("gpt2", device_map="auto")

clean_prompt = "The Eiffel Tower is in"
corrupted_prompt = "The Colosseum is in"

# 1. Get clean activations
with model.trace(clean_prompt) as tracer:
    clean_hidden = model.transformer.h[8].output[0].save()

# 2. Patch clean into corrupted run
with model.trace(corrupted_prompt) as tracer:
    # Replace layer 8 output with clean activations
    model.transformer.h[8].output[0][:] = clean_hidden

    patched_logits = model.output.save()

# 3. Compare predictions
paris_token = model.tokenizer.encode(" Paris")[0]
rome_token = model.tokenizer.encode(" Rome")[0]

patched_probs = torch.softmax(patched_logits[0, -1], dim=-1)
print(f"Paris prob: {patched_probs[paris_token].item():.3f}")
print(f"Rome prob: {patched_probs[rome_token].item():.3f}")
```

### 系统化修补扫描

```python
def patch_layer_position(layer, position, clean_cache, corrupted_prompt):
    """Patch single layer/position from clean to corrupted."""
    with model.trace(corrupted_prompt) as tracer:
        # Get current activation
        current = model.transformer.h[layer].output[0]

        # Patch only specific position
        current[:, position, :] = clean_cache[layer][:, position, :]

        logits = model.output.save()

    return logits

# Sweep over all layers and positions
results = torch.zeros(12, seq_len)
for layer in range(12):
    for pos in range(seq_len):
        logits = patch_layer_position(layer, pos, clean_hidden, corrupted)
        results[layer, pos] = compute_metric(logits)
```

## 工作流 3：使用 NDIF 进行远程执行

无需本地 GPU，即可在超大规模模型上运行相同的实验。

### 分步说明

```python
from nnsight import LanguageModel

# 1. Load large model (will run remotely)
model = LanguageModel("meta-llama/Llama-3.1-70B")

# 2. Same code, just add remote=True
with model.trace("The meaning of life is", remote=True) as tracer:
    # Access internals of 70B model!
    layer_40_out = model.model.layers[40].output[0].save()
    logits = model.output.save()

# 3. Results returned from NDIF
print(f"Layer 40 shape: {layer_40_out.shape}")

# 4. Generation with interventions
with model.trace(remote=True) as tracer:
    with tracer.invoke("What is 2+2?"):
        # Intervene during generation
        model.model.layers[20].output[0][:, -1, :] *= 1.5

    output = model.generate(max_new_tokens=50)
```

### NDIF 设置

1. 在 [login.ndif.us](https://login.ndif.us) 注册
2. 获取 API 密钥
3. 设置环境变量或将其传递给 nnsight：

```python
import os
os.environ["NDIF_API_KEY"] = "your_key"

# Or configure directly
from nnsight import CONFIG
CONFIG.API_KEY = "your_key"
```

### NDIF 上可用的模型

- Llama-3.1-8B、70B、405B
- DeepSeek-R1 模型
- 各种开放权重模型（请查看 [ndif.us](https://ndif.us) 获取当前列表）

## 工作流 4：跨提示词共享激活值

在单次追踪中，在不同输入之间共享激活值。

```python
from nnsight import LanguageModel

model = LanguageModel("gpt2", device_map="auto")

with model.trace() as tracer:
    # First prompt
    with tracer.invoke("The cat sat on the"):
        cat_hidden = model.transformer.h[6].output[0].save()

    # Second prompt - inject cat's activations
    with tracer.invoke("The dog ran through the"):
        # Replace with cat's activations at layer 6
        model.transformer.h[6].output[0][:] = cat_hidden
        dog_with_cat = model.output.save()

# The dog prompt now has cat's internal representations
```

## 工作流 5：基于梯度的分析

在反向传播过程中访问梯度。

```python
from nnsight import LanguageModel
import torch

model = LanguageModel("gpt2", device_map="auto")

with model.trace("The quick brown fox") as tracer:
    # Save activations and enable gradient
    hidden = model.transformer.h[5].output[0].save()
    hidden.retain_grad()

    logits = model.output

    # Compute loss on specific token
    target_token = model.tokenizer.encode(" jumps")[0]
    loss = -logits[0, -1, target_token]

    # Backward pass
    loss.backward()

# Access gradients
grad = hidden.grad
print(f"Gradient shape: {grad.shape}")
print(f"Gradient norm: {grad.norm().item():.3f}")
```

**注意**：vLLM 或远程执行不支持访问梯度。

## 常见问题及解决方案

### 问题：不同模型的模块路径不同
```python
# GPT-2 structure
model.transformer.h[5].output[0]

# LLaMA structure
model.model.layers[5].output[0]

# Solution: Check model structure
print(model._model)  # See actual module names
```

### 问题：忘记保存
```python
# WRONG: Value not accessible outside trace
with model.trace("Hello"):
    hidden = model.transformer.h[5].output[0]  # Not saved!

print(hidden)  # Error or wrong value

# RIGHT: Call .save()
with model.trace("Hello"):
    hidden = model.transformer.h[5].output[0].save()

print(hidden)  # Works!
```

### 问题：远程执行超时
```python
# For long operations, increase timeout
with model.trace("prompt", remote=True, timeout=300) as tracer:
    # Long operation...
```

### 问题：保存大量激活值时的内存占用
```python
# Only save what you need
with model.trace("prompt"):
    # Don't save everything
    for i in range(100):
        model.transformer.h[i].output[0].save()  # Memory heavy!

    # Better: save specific layers
    key_layers = [0, 5, 11]
    for i in key_layers:
        model.transformer.h[i].output[0].save()
```

### 问题：vLLM 的梯度限制
```python
# vLLM doesn't support gradients
# Use standard execution for gradient analysis
model = LanguageModel("gpt2", device_map="auto")  # Not vLLM
```

## 核心 API 参考

| 方法/属性 | 用途 |
|-----------------|---------|
| `model.trace(prompt, remote=False)` | 启动追踪上下文 |
| `proxy.save()` | 保存值，以便在追踪结束后访问 |
| `proxy[:]` | 对代理进行切片/索引（通过赋值实施修补） |
| `tracer.invoke(prompt)` | 在追踪中添加提示词 |
| `model.generate(...)` | 通过干预进行生成 |
| `model.output` | 最终模型输出 logits |
| `model._model` | 底层 HuggingFace 模型 |

## 与其他工具的比较

| 特性 | nnsight | TransformerLens | pyvene |
|---------|---------|-----------------|--------|
| 支持任意架构 | 是 | 仅限 Transformers | 是 |
| 远程执行 | 是（NDIF） | 否 | 否 |
| 一致的 API | 否 | 是 | 是 |
| 延迟执行 | 是 | 否 | 否 |
| 原生支持 HuggingFace | 是 | 重新实现 | 是 |
| 可共享配置 | 否 | 否 | 是 |

## 参考文档

有关详细的 API 文档、教程和高级用法，请参阅 `references/` 文件夹：

| 文件 | 内容 |
|------|----------|
| [references/README.md](references/README.md) | 概览和快速入门指南 |
| [references/api.md](references/api.md) | LanguageModel、追踪和代理对象的完整 API 参考 |
| [references/tutorials.md](references/tutorials.md) | 本地和远程可解释性的分步教程 |

## 外部资源

### 教程
- [入门指南](https://nnsight.net/start/)
- [功能概览](https://nnsight.net/features/)
- [远程执行](https://nnsight.net/notebooks/features/remote_execution/)
- [应用教程](https://nnsight.net/applied_tutorials/)

### 官方文档
- [官方文档](https://nnsight.net/documentation/)
- [NDIF 信息](https://ndif.us/)
- [社区论坛](https://discuss.ndif.us/)

### 论文
- [NNsight 和 NDIF 论文](https://arxiv.org/abs/2407.14561) - Fiotto-Kaufman et al. (ICLR 2025)

## 架构支持

nnsight 适用于任何 PyTorch 模型：
- **Transformers**：GPT-2、LLaMA、Mistral 等。
- **状态空间模型**：Mamba
- **视觉模型**：ViT、CLIP
- **自定义架构**：任何 nn.Module

关键在于了解模块结构，以便访问正确的组件。