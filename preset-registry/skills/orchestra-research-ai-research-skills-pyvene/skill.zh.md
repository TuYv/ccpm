---
name: pyvene-interventions
description: Provides guidance for performing causal interventions on PyTorch models using pyvene's declarative intervention framework. Use when conducting causal tracing, activation patching, interchange intervention training, or testing causal hypotheses about model behavior.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Causal Intervention, pyvene, Activation Patching, Causal Tracing, Interpretability]
dependencies: [pyvene>=0.1.8, torch>=2.0.0, transformers>=4.30.0]
---
# pyvene：面向神经网络的因果干预

pyvene 是 Stanford NLP 用于对 PyTorch 模型执行因果干预的库。它提供了一个声明式、基于字典的框架，用于激活修补、因果追踪和交换干预训练，使干预实验可复现、可共享。

**GitHub**：[stanfordnlp/pyvene](https://github.com/stanfordnlp/pyvene)（840+ stars）  
**论文**：[pyvene: A Library for Understanding and Improving PyTorch Models via Interventions](https://aclanthology.org/2024.naacl-demo.16)（NAACL 2024）

## 何时使用 pyvene

**在需要执行以下操作时使用 pyvene：**
- 执行因果追踪（ROME 风格的定位）
- 运行激活修补实验
- 开展交换干预训练（IIT）
- 检验有关模型组件的因果假设
- 通过 HuggingFace 共享或复现干预实验
- 使用任意 PyTorch 架构（不限于 Transformer）

**在以下情况下考虑替代方案：**
- 需要进行探索性激活分析 → 使用 **TransformerLens**
- 希望训练或分析 SAE → 使用 **SAELens**
- 需要在超大规模模型上进行远程执行 → 使用 **nnsight**
- 希望获得更底层的控制能力 → 使用 **nnsight**

## 安装

```bash
pip install pyvene
```

标准导入方式：
```python
import pyvene as pv
```

## 核心概念

### IntervenableModel

为任意 PyTorch 模型封装干预能力的主要类：

```python
import pyvene as pv
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load base model
model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Define intervention configuration
config = pv.IntervenableConfig(
    representations=[
        pv.RepresentationConfig(
            layer=8,
            component="block_output",
            intervention_type=pv.VanillaIntervention,
        )
    ]
)

# Create intervenable model
intervenable = pv.IntervenableModel(config, model)
```

### 干预类型

| 类型 | 描述 | 使用场景 |
|------|-------------|----------|
| `VanillaIntervention` | 在不同运行之间交换激活值 | 激活修补 |
| `AdditionIntervention` | 将激活值添加到基础运行中 | 引导、消融 |
| `SubtractionIntervention` | 减去激活值 | 消融 |
| `ZeroIntervention` | 将激活值清零 | 组件失活 |
| `RotatedSpaceIntervention` | DAS 可训练干预 | 因果发现 |
| `CollectIntervention` | 收集激活值 | 探测、分析 |

### 组件目标

```python
# Available components to intervene on
components = [
    "block_input",      # Input to transformer block
    "block_output",     # Output of transformer block
    "mlp_input",        # Input to MLP
    "mlp_output",       # Output of MLP
    "mlp_activation",   # MLP hidden activations
    "attention_input",  # Input to attention
    "attention_output", # Output of attention
    "attention_value_output",  # Attention value vectors
    "query_output",     # Query vectors
    "key_output",       # Key vectors
    "value_output",     # Value vectors
    "head_attention_value_output",  # Per-head values
]
```

## 工作流 1：因果追踪（ROME 风格）

通过破坏输入并恢复激活，定位事实关联的存储位置。

### 分步说明

```python
import pyvene as pv
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained("gpt2-xl")
tokenizer = AutoTokenizer.from_pretrained("gpt2-xl")

# 1. Define clean and corrupted inputs
clean_prompt = "The Space Needle is in downtown"
corrupted_prompt = "The ##### ###### ## ## ########"  # Noise

clean_tokens = tokenizer(clean_prompt, return_tensors="pt")
corrupted_tokens = tokenizer(corrupted_prompt, return_tensors="pt")

# 2. Get clean activations (source)
with torch.no_grad():
    clean_outputs = model(**clean_tokens, output_hidden_states=True)
    clean_states = clean_outputs.hidden_states

# 3. Define restoration intervention
def run_causal_trace(layer, position):
    """Restore clean activation at specific layer and position."""
    config = pv.IntervenableConfig(
        representations=[
            pv.RepresentationConfig(
                layer=layer,
                component="block_output",
                intervention_type=pv.VanillaIntervention,
                unit="pos",
                max_number_of_units=1,
            )
        ]
    )

    intervenable = pv.IntervenableModel(config, model)

    # Run with intervention
    _, patched_outputs = intervenable(
        base=corrupted_tokens,
        sources=[clean_tokens],
        unit_locations={"sources->base": ([[[position]]], [[[position]]])},
        output_original_output=True,
    )

    # Return probability of correct token
    probs = torch.softmax(patched_outputs.logits[0, -1], dim=-1)
    seattle_token = tokenizer.encode(" Seattle")[0]
    return probs[seattle_token].item()

# 4. Sweep over layers and positions
n_layers = model.config.n_layer
seq_len = clean_tokens["input_ids"].shape[1]

results = torch.zeros(n_layers, seq_len)
for layer in range(n_layers):
    for pos in range(seq_len):
        results[layer, pos] = run_causal_trace(layer, pos)

# 5. Visualize (layer x position heatmap)
# High values indicate causal importance
```

### 检查清单
- [ ] 准备包含目标事实关联的干净提示词
- [ ] 创建破坏后的版本（噪声或反事实）
- [ ] 为每个（层、位置）定义干预配置
- [ ] 运行修补扫描
- [ ] 在热力图中识别因果热点

## 工作流 2：用于回路分析的激活修补

测试哪些组件是实现特定行为所必需的。

### 分步说明

```python
import pyvene as pv
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# IOI task setup
clean_prompt = "When John and Mary went to the store, Mary gave a bottle to"
corrupted_prompt = "When John and Mary went to the store, John gave a bottle to"

clean_tokens = tokenizer(clean_prompt, return_tensors="pt")
corrupted_tokens = tokenizer(corrupted_prompt, return_tensors="pt")

john_token = tokenizer.encode(" John")[0]
mary_token = tokenizer.encode(" Mary")[0]

def logit_diff(logits):
    """IO - S logit difference."""
    return logits[0, -1, john_token] - logits[0, -1, mary_token]

# Patch attention output at each layer
def patch_attention(layer):
    config = pv.IntervenableConfig(
        representations=[
            pv.RepresentationConfig(
                layer=layer,
                component="attention_output",
                intervention_type=pv.VanillaIntervention,
            )
        ]
    )

    intervenable = pv.IntervenableModel(config, model)

    _, patched_outputs = intervenable(
        base=corrupted_tokens,
        sources=[clean_tokens],
    )

    return logit_diff(patched_outputs.logits).item()

# Find which layers matter
results = []
for layer in range(model.config.n_layer):
    diff = patch_attention(layer)
    results.append(diff)
    print(f"Layer {layer}: logit diff = {diff:.3f}")
```

## 工作流 3：交换干预训练（IIT）

训练干预以发现因果结构。

### 分步说明

```python
import pyvene as pv
from transformers import AutoModelForCausalLM
import torch

model = AutoModelForCausalLM.from_pretrained("gpt2")

# 1. Define trainable intervention
config = pv.IntervenableConfig(
    representations=[
        pv.RepresentationConfig(
            layer=6,
            component="block_output",
            intervention_type=pv.RotatedSpaceIntervention,  # Trainable
            low_rank_dimension=64,  # Learn 64-dim subspace
        )
    ]
)

intervenable = pv.IntervenableModel(config, model)

# 2. Set up training
optimizer = torch.optim.Adam(
    intervenable.get_trainable_parameters(),
    lr=1e-4
)

# 3. Training loop (simplified)
for base_input, source_input, target_output in dataloader:
    optimizer.zero_grad()

    _, outputs = intervenable(
        base=base_input,
        sources=[source_input],
    )

    loss = criterion(outputs.logits, target_output)
    loss.backward()
    optimizer.step()

# 4. Analyze learned intervention
# The rotation matrix reveals causal subspace
rotation = intervenable.interventions["layer.6.block_output"][0].rotate_layer
```

### DAS（分布式对齐搜索）

```python
# Low-rank rotation finds interpretable subspaces
config = pv.IntervenableConfig(
    representations=[
        pv.RepresentationConfig(
            layer=8,
            component="block_output",
            intervention_type=pv.LowRankRotatedSpaceIntervention,
            low_rank_dimension=1,  # Find 1D causal direction
        )
    ]
)
```

## 工作流 4：模型引导（诚实的 LLaMA）

在生成过程中引导模型行为。

```python
import pyvene as pv
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Load pre-trained steering intervention
intervenable = pv.IntervenableModel.load(
    "zhengxuanzenwu/intervenable_honest_llama2_chat_7B",
    model=model,
)

# Generate with steering
prompt = "Is the earth flat?"
inputs = tokenizer(prompt, return_tensors="pt")

# Intervention applied during generation
outputs = intervenable.generate(
    inputs,
    max_new_tokens=100,
    do_sample=False,
)

print(tokenizer.decode(outputs[0]))
```

## 保存和共享干预

```python
# Save locally
intervenable.save("./my_intervention")

# Load from local
intervenable = pv.IntervenableModel.load(
    "./my_intervention",
    model=model,
)

# Share on HuggingFace
intervenable.save_intervention("username/my-intervention")

# Load from HuggingFace
intervenable = pv.IntervenableModel.load(
    "username/my-intervention",
    model=model,
)
```

## 常见问题及解决方案

### 问题：干预位置错误
```python
# WRONG: Incorrect component name
config = pv.RepresentationConfig(
    component="mlp",  # Not valid!
)

# RIGHT: Use exact component name
config = pv.RepresentationConfig(
    component="mlp_output",  # Valid
)
```

### 问题：维度不匹配
```python
# Ensure source and base have compatible shapes
# For position-specific interventions:
config = pv.RepresentationConfig(
    unit="pos",
    max_number_of_units=1,  # Intervene on single position
)

# Specify locations explicitly
intervenable(
    base=base_tokens,
    sources=[source_tokens],
    unit_locations={"sources->base": ([[[5]]], [[[5]]])},  # Position 5
)
```

### 问题：大型模型的内存占用
```python
# Use gradient checkpointing
model.gradient_checkpointing_enable()

# Or intervene on fewer components
config = pv.IntervenableConfig(
    representations=[
        pv.RepresentationConfig(
            layer=8,  # Single layer instead of all
            component="block_output",
        )
    ]
)
```

### 问题：LoRA 集成
```python
# pyvene v0.1.8+ supports LoRAs as interventions
config = pv.RepresentationConfig(
    intervention_type=pv.LoRAIntervention,
    low_rank_dimension=16,
)
```

## 关键类参考

| 类 | 用途 |
|-------|---------|
| `IntervenableModel` | 用于干预的主要包装器 |
| `IntervenableConfig` | 配置容器 |
| `RepresentationConfig` | 单个干预规范 |
| `VanillaIntervention` | 激活值交换 |
| `RotatedSpaceIntervention` | 可训练的 DAS 干预 |
| `CollectIntervention` | 激活值收集 |

## 支持的模型

pyvene 可与任何 PyTorch 模型配合使用。已在以下模型上测试：
- GPT-2（所有规模）
- LLaMA / LLaMA-2
- Pythia
- Mistral / Mixtral
- OPT
- BLIP（视觉语言）
- ESM（蛋白质模型）
- Mamba（状态空间）

## 参考文档

有关详细的 API 文档、教程和高级用法，请参阅 `references/` 文件夹：

| 文件 | 内容 |
|------|----------|
| [references/README.md](references/README.md) | 概述和快速入门指南 |
| [references/api.md](references/api.md) | IntervenableModel、干预类型和配置的完整 API 参考 |
| [references/tutorials.md](references/tutorials.md) | 因果追踪、激活值修补和 DAS 的分步教程 |

## 外部资源

### 教程
- [pyvene 101](https://stanfordnlp.github.io/pyvene/tutorials/pyvene_101.html)
- [因果追踪教程](https://stanfordnlp.github.io/pyvene/tutorials/advanced_tutorials/Causal_Tracing.html)
- [IOI 回路复现](https://stanfordnlp.github.io/pyvene/tutorials/advanced_tutorials/IOI_Replication.html)
- [DAS 简介](https://stanfordnlp.github.io/pyvene/tutorials/advanced_tutorials/DAS_Main_Introduction.html)

### 论文
- [在 GPT 中定位和编辑事实关联](https://arxiv.org/abs/2202.05262) - Meng 等（2022）
- [推理时干预](https://arxiv.org/abs/2306.03341) - Li 等（2023）
- [真实场景中的可解释性](https://arxiv.org/abs/2211.00593) - Wang 等（2022）

### 官方文档
- [官方文档](https://stanfordnlp.github.io/pyvene/)
- [API 参考](https://stanfordnlp.github.io/pyvene/api/)

## 与其他工具的比较

| 功能 | pyvene | TransformerLens | nnsight |
|---------|--------|-----------------|---------|
| 声明式配置 | 是 | 否 | 否 |
| HuggingFace 共享 | 是 | 否 | 否 |
| 可训练干预 | 是 | 有限支持 | 是 |
| 任意 PyTorch 模型 | 是 | 仅限 Transformer | 是 |
| 远程执行 | 否 | 否 | 是（NDIF） |