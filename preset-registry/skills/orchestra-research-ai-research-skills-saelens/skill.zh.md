---
name: sparse-autoencoder-training
description: Provides guidance for training and analyzing Sparse Autoencoders (SAEs) using SAELens to decompose neural network activations into interpretable features. Use when discovering interpretable features, analyzing superposition, or studying monosemantic representations in language models.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Sparse Autoencoders, SAE, Mechanistic Interpretability, Feature Discovery, Superposition]
dependencies: [sae-lens>=6.0.0, transformer-lens>=2.0.0, torch>=2.0.0]
---
# SAELens：用于机制可解释性的稀疏自编码器

SAELens 是用于训练和分析稀疏自编码器（SAE）的主要库——这是一种将多义神经网络激活分解为稀疏、可解释特征的技术。其研究基础源自 Anthropic 关于单义性的开创性研究。

**GitHub**：[jbloomAus/SAELens](https://github.com/jbloomAus/SAELens)（1,100+ stars）

## 问题：多义性与叠加

神经网络中的单个神经元具有**多义性**——它们会在多个语义上不同的上下文中被激活。这是因为模型使用**叠加**来表示数量多于神经元数量的特征，从而使可解释性变得困难。

**SAE 通过以下方式解决这一问题**：将稠密激活分解为稀疏、单义的特征——对于任何给定输入，通常只有少量特征会被激活，并且每个特征都对应一个可解释的概念。

## 何时使用 SAELens

**在以下情况下使用 SAELens：**
- 从模型激活中发现可解释特征
- 理解模型学到了哪些概念
- 研究叠加和特征几何
- 执行基于特征的引导或消融
- 分析与安全相关的特征（欺骗、偏见、有害内容）

**在以下情况下考虑替代方案：**
- 需要基础的激活分析 → 直接使用 **TransformerLens**
- 希望进行因果干预实验 → 使用 **pyvene** 或 **TransformerLens**
- 需要生产环境中的引导 → 考虑直接进行激活工程

## 安装

```bash
pip install sae-lens
```

要求：Python 3.10+、transformer-lens>=2.0.0

## 核心概念

### SAE 学到的内容

SAE 通过一个稀疏瓶颈来重建模型激活：

```
Input Activation → Encoder → Sparse Features → Decoder → Reconstructed Activation
    (d_model)       ↓        (d_sae >> d_model)    ↓         (d_model)
                 sparsity                      reconstruction
                 penalty                          loss
```

**损失函数**：`MSE(original, reconstructed) + L1_coefficient × L1(features)`

### 关键验证（Anthropic 研究）

在《Towards Monosemanticity》中，人工评估者发现 **70% 的 SAE 特征确实具有可解释性**。发现的特征包括：
- DNA 序列、法律语言、HTTP 请求
- 希伯来语文本、营养陈述、代码语法
- 情感、命名实体、语法结构

## 工作流 1：加载和分析预训练 SAE

### 分步操作

```python
from transformer_lens import HookedTransformer
from sae_lens import SAE

# 1. Load model and pre-trained SAE
model = HookedTransformer.from_pretrained("gpt2-small", device="cuda")
sae, cfg_dict, sparsity = SAE.from_pretrained(
    release="gpt2-small-res-jb",
    sae_id="blocks.8.hook_resid_pre",
    device="cuda"
)

# 2. Get model activations
tokens = model.to_tokens("The capital of France is Paris")
_, cache = model.run_with_cache(tokens)
activations = cache["resid_pre", 8]  # [batch, pos, d_model]

# 3. Encode to SAE features
sae_features = sae.encode(activations)  # [batch, pos, d_sae]
print(f"Active features: {(sae_features > 0).sum()}")

# 4. Find top features for each position
for pos in range(tokens.shape[1]):
    top_features = sae_features[0, pos].topk(5)
    token = model.to_str_tokens(tokens[0, pos:pos+1])[0]
    print(f"Token '{token}': features {top_features.indices.tolist()}")

# 5. Reconstruct activations
reconstructed = sae.decode(sae_features)
reconstruction_error = (activations - reconstructed).norm()
```

### 可用的预训练 SAEs

| Release | Model | Layers |
|---------|-------|--------|
| `gpt2-small-res-jb` | GPT-2 Small | 多个残差流 |
| `gemma-2b-res` | Gemma 2B | 残差流 |
| HuggingFace 上的各种模型 | 搜索标签 `saelens` | 各种 |

### 检查清单
- [ ] 使用 TransformerLens 加载模型
- [ ] 为目标层加载匹配的 SAE
- [ ] 将激活编码为稀疏特征
- [ ] 识别每个 token 激活程度最高的特征
- [ ] 验证重构质量

## 工作流 2：训练自定义 SAE

### 分步指南

```python
from sae_lens import SAE, LanguageModelSAERunnerConfig, SAETrainingRunner

# 1. Configure training
cfg = LanguageModelSAERunnerConfig(
    # Model
    model_name="gpt2-small",
    hook_name="blocks.8.hook_resid_pre",
    hook_layer=8,
    d_in=768,  # Model dimension

    # SAE architecture
    architecture="standard",  # or "gated", "topk"
    d_sae=768 * 8,  # Expansion factor of 8
    activation_fn="relu",

    # Training
    lr=4e-4,
    l1_coefficient=8e-5,  # Sparsity penalty
    l1_warm_up_steps=1000,
    train_batch_size_tokens=4096,
    training_tokens=100_000_000,

    # Data
    dataset_path="monology/pile-uncopyrighted",
    context_size=128,

    # Logging
    log_to_wandb=True,
    wandb_project="sae-training",

    # Checkpointing
    checkpoint_path="checkpoints",
    n_checkpoints=5,
)

# 2. Train
trainer = SAETrainingRunner(cfg)
sae = trainer.run()

# 3. Evaluate
print(f"L0 (avg active features): {trainer.metrics['l0']}")
print(f"CE Loss Recovered: {trainer.metrics['ce_loss_score']}")
```

### 关键超参数

| Parameter | Typical Value | Effect |
|-----------|---------------|--------|
| `d_sae` | 4-16× d_model | 更多特征，更高容量 |
| `l1_coefficient` | 5e-5 to 1e-4 | 值越高 = 越稀疏，但准确性越低 |
| `lr` | 1e-4 to 1e-3 | 标准优化器学习率 |
| `l1_warm_up_steps` | 500-2000 | 防止特征过早死亡 |

### 评估指标

| Metric | Target | Meaning |
|--------|--------|---------|
| **L0** | 50-200 | 每个 token 的平均激活特征数 |
| **CE Loss Score** | 80-95% | 相对于原始模型恢复的交叉熵 |
| **Dead Features** | <5% | 从未激活的特征 |
| **Explained Variance** | >90% | 重构质量 |

### 检查清单
- [ ] 选择目标层和 hook 点
- [ ] 设置扩展因子（d_sae = 4-16× d_model）
- [ ] 调整 L1 系数以获得所需的稀疏性
- [ ] 启用 L1 预热以防止特征死亡
- [ ] 在训练期间监控指标（W&B）
- [ ] 验证 L0 和 CE 损失恢复率
- [ ] 检查死亡特征比例

## 工作流 3：特征分析与引导

### 分析单个特征

```python
from transformer_lens import HookedTransformer
from sae_lens import SAE
import torch

model = HookedTransformer.from_pretrained("gpt2-small", device="cuda")
sae, _, _ = SAE.from_pretrained(
    release="gpt2-small-res-jb",
    sae_id="blocks.8.hook_resid_pre",
    device="cuda"
)

# Find what activates a specific feature
feature_idx = 1234
test_texts = [
    "The scientist conducted an experiment",
    "I love chocolate cake",
    "The code compiles successfully",
    "Paris is beautiful in spring",
]

for text in test_texts:
    tokens = model.to_tokens(text)
    _, cache = model.run_with_cache(tokens)
    features = sae.encode(cache["resid_pre", 8])
    activation = features[0, :, feature_idx].max().item()
    print(f"{activation:.3f}: {text}")
```

### 特征引导

```python
def steer_with_feature(model, sae, prompt, feature_idx, strength=5.0):
    """Add SAE feature direction to residual stream."""
    tokens = model.to_tokens(prompt)

    # Get feature direction from decoder
    feature_direction = sae.W_dec[feature_idx]  # [d_model]

    def steering_hook(activation, hook):
        # Add scaled feature direction at all positions
        activation += strength * feature_direction
        return activation

    # Generate with steering
    output = model.generate(
        tokens,
        max_new_tokens=50,
        fwd_hooks=[("blocks.8.hook_resid_pre", steering_hook)]
    )
    return model.to_string(output[0])
```

### 特征归因

```python
# Which features most affect a specific output?
tokens = model.to_tokens("The capital of France is")
_, cache = model.run_with_cache(tokens)

# Get features at final position
features = sae.encode(cache["resid_pre", 8])[0, -1]  # [d_sae]

# Get logit attribution per feature
# Feature contribution = feature_activation × decoder_weight × unembedding
W_dec = sae.W_dec  # [d_sae, d_model]
W_U = model.W_U    # [d_model, vocab]

# Contribution to "Paris" logit
paris_token = model.to_single_token(" Paris")
feature_contributions = features * (W_dec @ W_U[:, paris_token])

top_features = feature_contributions.topk(10)
print("Top features for 'Paris' prediction:")
for idx, val in zip(top_features.indices, top_features.values):
    print(f"  Feature {idx.item()}: {val.item():.3f}")
```

## 常见问题与解决方案

### 问题：死亡特征比例较高
```python
# WRONG: No warm-up, features die early
cfg = LanguageModelSAERunnerConfig(
    l1_coefficient=1e-4,
    l1_warm_up_steps=0,  # Bad!
)

# RIGHT: Warm-up L1 penalty
cfg = LanguageModelSAERunnerConfig(
    l1_coefficient=8e-5,
    l1_warm_up_steps=1000,  # Gradually increase
    use_ghost_grads=True,   # Revive dead features
)
```

### 问题：重构效果较差（CE 恢复率较低）
```python
# Reduce sparsity penalty
cfg = LanguageModelSAERunnerConfig(
    l1_coefficient=5e-5,  # Lower = better reconstruction
    d_sae=768 * 16,       # More capacity
)
```

### 问题：特征无法解释
```python
# Increase sparsity (higher L1)
cfg = LanguageModelSAERunnerConfig(
    l1_coefficient=1e-4,  # Higher = sparser, more interpretable
)
# Or use TopK architecture
cfg = LanguageModelSAERunnerConfig(
    architecture="topk",
    activation_fn_kwargs={"k": 50},  # Exactly 50 active features
)
```

### 问题：训练期间出现内存错误
```python
cfg = LanguageModelSAERunnerConfig(
    train_batch_size_tokens=2048,  # Reduce batch size
    store_batch_size_prompts=4,    # Fewer prompts in buffer
    n_batches_in_buffer=8,         # Smaller activation buffer
)
```

## 与 Neuronpedia 集成

在 [neuronpedia.org](https://neuronpedia.org) 浏览预训练的 SAE 特征：

```python
# Features are indexed by SAE ID
# Example: gpt2-small layer 8 feature 1234
# → neuronpedia.org/gpt2-small/8-res-jb/1234
```

## 关键类参考

| 类 | 用途 |
|-------|---------|
| `SAE` | 稀疏自编码器模型 |
| `LanguageModelSAERunnerConfig` | 训练配置 |
| `SAETrainingRunner` | 训练循环管理器 |
| `ActivationsStore` | 激活值收集与批处理 |
| `HookedSAETransformer` | TransformerLens + SAE 集成 |

## 参考文档

有关详细的 API 文档、教程和高级用法，请参阅 `references/` 文件夹：

| 文件 | 内容 |
|------|----------|
| [references/README.md](references/README.md) | 概览和快速入门指南 |
| [references/api.md](references/api.md) | SAE、TrainingSAE 和配置的完整 API 参考 |
| [references/tutorials.md](references/tutorials.md) | 训练、分析和引导的分步教程 |

## 外部资源

### 教程
- [基本加载与分析](https://github.com/jbloomAus/SAELens/blob/main/tutorials/basic_loading_and_analysing.ipynb)
- [训练稀疏自编码器](https://github.com/jbloomAus/SAELens/blob/main/tutorials/training_a_sparse_autoencoder.ipynb)
- [ARENA SAE 课程](https://www.lesswrong.com/posts/LnHowHgmrMbWtpkxx/intro-to-superposition-and-sparse-autoencoders-colab)

### 论文
- [迈向单义性](https://transformer-circuits.pub/2023/monosemantic-features) - Anthropic（2023）
- [单义性的扩展](https://transformer-circuits.pub/2024/scaling-monosemanticity/) - Anthropic（2024）
- [稀疏自编码器发现高度可解释的特征](https://arxiv.org/abs/2309.08600) - Cunningham 等人（ICLR 2024）

### 官方文档
- [SAELens 文档](https://jbloomaus.github.io/SAELens/)
- [Neuronpedia](https://neuronpedia.org) - 特征浏览器

## SAE 架构

| 架构 | 描述 | 使用场景 |
|--------------|-------------|----------|
| **Standard** | ReLU + L1 惩罚 | 通用 |
| **Gated** | 学习得到的门控机制 | 更好的稀疏性控制 |
| **TopK** | 恰好激活 K 个特征 | 一致的稀疏性 |

```python
# TopK SAE (exactly 50 features active)
cfg = LanguageModelSAERunnerConfig(
    architecture="topk",
    activation_fn="topk",
    activation_fn_kwargs={"k": 50},
)
```