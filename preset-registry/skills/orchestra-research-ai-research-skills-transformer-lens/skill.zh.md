---
name: transformer-lens-interpretability
description: Provides guidance for mechanistic interpretability research using TransformerLens to inspect and manipulate transformer internals via HookPoints and activation caching. Use when reverse-engineering model algorithms, studying attention patterns, or performing activation patching experiments.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Mechanistic Interpretability, TransformerLens, Activation Patching, Circuit Analysis]
dependencies: [transformer-lens>=2.0.0, torch>=2.0.0]
---
# TransformerLens：Transformer 的机制可解释性

TransformerLens 是 GPT 风格语言模型机制可解释性研究的事实标准库。它由 Neel Nanda 创建，并由 Bryce Meyer 维护，通过在每个激活上设置 HookPoints，为检查和操纵模型内部状态提供了简洁的接口。

**GitHub**：[TransformerLensOrg/TransformerLens](https://github.com/TransformerLensOrg/TransformerLens)（2,900+ stars）

## 何时使用 TransformerLens

**在以下情况下使用 TransformerLens：**
- 逆向工程训练过程中学习到的算法
- 执行激活修补 / 因果追踪实验
- 研究注意力模式和信息流
- 分析电路（例如 induction heads、IOI circuit）
- 缓存和检查中间激活
- 应用直接 logit 归因

**在以下情况下考虑替代方案：**
- 需要处理非 Transformer 架构 → 使用 **nnsight** 或 **pyvene**
- 希望训练/分析稀疏自编码器 → 使用 **SAELens**
- 需要在大规模模型上进行远程执行 → 使用带 NDIF 的 **nnsight**
- 希望使用更高层次的因果干预抽象 → 使用 **pyvene**

## 安装

```bash
pip install transformer-lens
```

开发版本：
```bash
pip install git+https://github.com/TransformerLensOrg/TransformerLens
```

## 核心概念

### HookedTransformer

用于封装 Transformer 模型的主要类，会在每个激活上设置 HookPoints：

```python
from transformer_lens import HookedTransformer

# Load a model
model = HookedTransformer.from_pretrained("gpt2-small")

# For gated models (LLaMA, Mistral)
import os
os.environ["HF_TOKEN"] = "your_token"
model = HookedTransformer.from_pretrained("meta-llama/Llama-2-7b-hf")
```

### 支持的模型（50+）

| Family | Models |
|--------|--------|
| GPT-2 | gpt2, gpt2-medium, gpt2-large, gpt2-xl |
| LLaMA | llama-7b, llama-13b, llama-2-7b, llama-2-13b |
| EleutherAI | pythia-70m to pythia-12b, gpt-neo, gpt-j-6b |
| Mistral | mistral-7b, mixtral-8x7b |
| Others | phi, qwen, opt, gemma |

### 激活缓存

运行模型并缓存所有中间激活：

```python
# Get all activations
tokens = model.to_tokens("The Eiffel Tower is in")
logits, cache = model.run_with_cache(tokens)

# Access specific activations
residual = cache["resid_post", 5]  # Layer 5 residual stream
attn_pattern = cache["pattern", 3]  # Layer 3 attention pattern
mlp_out = cache["mlp_out", 7]  # Layer 7 MLP output

# Filter which activations to cache (saves memory)
logits, cache = model.run_with_cache(
    tokens,
    names_filter=lambda name: "resid_post" in name
)
```

### ActivationCache 键

| Key Pattern | Shape | Description |
|-------------|-------|-------------|
| `resid_pre, layer` | [batch, pos, d_model] | 注意力之前的残差 |
| `resid_mid, layer` | [batch, pos, d_model] | 注意力之后的残差 |
| `resid_post, layer` | [batch, pos, d_model] | MLP 之后的残差 |
| `attn_out, layer` | [batch, pos, d_model] | 注意力输出 |
| `mlp_out, layer` | [batch, pos, d_model] | MLP 输出 |
| `pattern, layer` | [batch, head, q_pos, k_pos] | 注意力模式（softmax 之后） |
| `q, layer` | [batch, pos, head, d_head] | Query 向量 |
| `k, layer` | [batch, pos, head, d_head] | Key 向量 |
| `v, layer` | [batch, pos, head, d_head] | Value 向量 |

## 工作流 1：激活修补（因果追踪）

通过将干净运行中的激活修补到损坏运行中，识别哪些激活会对模型输出产生因果影响。

### 分步说明

```python
from transformer_lens import HookedTransformer, patching
import torch

model = HookedTransformer.from_pretrained("gpt2-small")

# 1. Define clean and corrupted prompts
clean_prompt = "The Eiffel Tower is in the city of"
corrupted_prompt = "The Colosseum is in the city of"

clean_tokens = model.to_tokens(clean_prompt)
corrupted_tokens = model.to_tokens(corrupted_prompt)

# 2. Get clean activations
_, clean_cache = model.run_with_cache(clean_tokens)

# 3. Define metric (e.g., logit difference)
paris_token = model.to_single_token(" Paris")
rome_token = model.to_single_token(" Rome")

def metric(logits):
    return logits[0, -1, paris_token] - logits[0, -1, rome_token]

# 4. Patch each position and layer
results = torch.zeros(model.cfg.n_layers, clean_tokens.shape[1])

for layer in range(model.cfg.n_layers):
    for pos in range(clean_tokens.shape[1]):
        def patch_hook(activation, hook):
            activation[0, pos] = clean_cache[hook.name][0, pos]
            return activation

        patched_logits = model.run_with_hooks(
            corrupted_tokens,
            fwd_hooks=[(f"blocks.{layer}.hook_resid_post", patch_hook)]
        )
        results[layer, pos] = metric(patched_logits)

# 5. Visualize results (layer x position heatmap)
```

### 检查清单
- [ ] 定义差异最小的干净输入和损坏输入
- [ ] 选择能够体现行为差异的指标
- [ ] 缓存干净激活
- [ ] 系统地修补每个（层、位置）组合
- [ ] 将结果可视化为热力图
- [ ] 识别因果热点

## 工作流 2：回路分析（间接对象识别）

复现 "Interpretability in the Wild" 中的 IOI 回路发现过程。

### 分步说明

```python
from transformer_lens import HookedTransformer
import torch

model = HookedTransformer.from_pretrained("gpt2-small")

# IOI task: "When John and Mary went to the store, Mary gave a bottle to"
# Model should predict "John" (indirect object)

prompt = "When John and Mary went to the store, Mary gave a bottle to"
tokens = model.to_tokens(prompt)

# 1. Get baseline logits
logits, cache = model.run_with_cache(tokens)

john_token = model.to_single_token(" John")
mary_token = model.to_single_token(" Mary")

# 2. Compute logit difference (IO - S)
logit_diff = logits[0, -1, john_token] - logits[0, -1, mary_token]
print(f"Logit difference: {logit_diff.item():.3f}")

# 3. Direct logit attribution by head
def get_head_contribution(layer, head):
    # Project head output to logits
    head_out = cache["z", layer][0, :, head, :]  # [pos, d_head]
    W_O = model.W_O[layer, head]  # [d_head, d_model]
    W_U = model.W_U  # [d_model, vocab]

    # Head contribution to logits at final position
    contribution = head_out[-1] @ W_O @ W_U
    return contribution[john_token] - contribution[mary_token]

# 4. Map all heads
head_contributions = torch.zeros(model.cfg.n_layers, model.cfg.n_heads)
for layer in range(model.cfg.n_layers):
    for head in range(model.cfg.n_heads):
        head_contributions[layer, head] = get_head_contribution(layer, head)

# 5. Identify top contributing heads (name movers, backup name movers)
```

### 检查清单
- [ ] 使用清晰的 IO/S token 设置任务
- [ ] 计算基线 logit 差值
- [ ] 按注意力头分解贡献
- [ ] 识别关键电路组件（name movers、S-inhibition、induction）
- [ ] 通过消融实验进行验证

## 工作流 3：Induction Head 检测

查找实现 [A][B]...[A] → [B] 模式的 induction head。

```python
from transformer_lens import HookedTransformer
import torch

model = HookedTransformer.from_pretrained("gpt2-small")

# Create repeated sequence: [A][B][A] should predict [B]
repeated_tokens = torch.tensor([[1000, 2000, 1000]])  # Arbitrary tokens

_, cache = model.run_with_cache(repeated_tokens)

# Induction heads attend from final [A] back to first [B]
# Check attention from position 2 to position 1
induction_scores = torch.zeros(model.cfg.n_layers, model.cfg.n_heads)

for layer in range(model.cfg.n_layers):
    pattern = cache["pattern", layer][0]  # [head, q_pos, k_pos]
    # Attention from pos 2 to pos 1
    induction_scores[layer] = pattern[:, 2, 1]

# Heads with high scores are induction heads
top_heads = torch.topk(induction_scores.flatten(), k=5)
```

## 常见问题与解决方案

### 问题：调试后 Hooks 仍然存在
```python
# WRONG: Old hooks remain active
model.run_with_hooks(tokens, fwd_hooks=[...])  # Debug, add new hooks
model.run_with_hooks(tokens, fwd_hooks=[...])  # Old hooks still there!

# RIGHT: Always reset hooks
model.reset_hooks()
model.run_with_hooks(tokens, fwd_hooks=[...])
```

### 问题：分词陷阱
```python
# WRONG: Assuming consistent tokenization
model.to_tokens("Tim")  # Single token
model.to_tokens("Neel")  # Becomes "Ne" + "el" (two tokens!)

# RIGHT: Check tokenization explicitly
tokens = model.to_tokens("Neel", prepend_bos=False)
print(model.to_str_tokens(tokens))  # ['Ne', 'el']
```

### 问题：分析中忽略了 LayerNorm
```python
# WRONG: Ignoring LayerNorm
pre_activation = residual @ model.W_in[layer]

# RIGHT: Include LayerNorm
ln_scale = model.blocks[layer].ln2.w
ln_out = model.blocks[layer].ln2(residual)
pre_activation = ln_out @ model.W_in[layer]
```

### 问题：大型模型导致内存爆炸
```python
# Use selective caching
logits, cache = model.run_with_cache(
    tokens,
    names_filter=lambda n: "resid_post" in n or "pattern" in n,
    device="cpu"  # Cache on CPU
)
```

## 关键类参考

| 类 | 用途 |
|-------|---------|
| `HookedTransformer` | 带有 Hooks 的主要模型封装器 |
| `ActivationCache` | 类字典形式的激活缓存 |
| `HookedTransformerConfig` | 模型配置 |
| `FactoredMatrix` | 高效的分解矩阵运算 |

## 与 SAELens 集成

TransformerLens 可与 SAELens 集成，用于稀疏自编码器分析：

```python
from transformer_lens import HookedTransformer
from sae_lens import SAE

model = HookedTransformer.from_pretrained("gpt2-small")
sae = SAE.from_pretrained("gpt2-small-res-jb", "blocks.8.hook_resid_pre")

# Run with SAE
tokens = model.to_tokens("Hello world")
_, cache = model.run_with_cache(tokens)
sae_acts = sae.encode(cache["resid_pre", 8])
```

## 参考文档

有关详细的 API 文档、教程和高级用法，请参阅 `references/` 文件夹：

| 文件 | 内容 |
|------|----------|
| [references/README.md](references/README.md) | 概览和快速入门指南 |
| [references/api.md](references/api.md) | HookedTransformer、ActivationCache、HookPoints 的完整 API 参考 |
| [references/tutorials.md](references/tutorials.md) | 关于激活修补、电路分析和 logit lens 的分步教程 |

## 外部资源

### 教程
- [主演示 Notebook](https://transformerlensorg.github.io/TransformerLens/generated/demos/Main_Demo.html)
- [激活修补演示](https://colab.research.google.com/github/TransformerLensOrg/TransformerLens/blob/main/demos/Activation_Patching_in_TL_Demo.ipynb)
- [ARENA 机械可解释性课程](https://arena-foundation.github.io/ARENA/) - 200 多小时的教程

### 论文
- [Transformer 电路的数学框架](https://transformer-circuits.pub/2021/framework/index.html)
- [上下文学习与归纳头](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html)
- [野外的可解释性（IOI）](https://arxiv.org/abs/2211.00593)

### 官方文档
- [官方文档](https://transformerlensorg.github.io/TransformerLens/)
- [模型属性表](https://transformerlensorg.github.io/TransformerLens/generated/model_properties_table.html)
- [Neel Nanda 的术语表](https://www.neelnanda.io/mechanistic-interpretability/glossary)

## 版本说明

- **v2.0**：移除了 HookedSAE（已移至 SAELens）
- **v3.0 (alpha)**：用于加载任意 nn.Module 的 TransformerBridge