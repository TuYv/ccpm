---
name: speculative-decoding
description: Accelerate LLM inference using speculative decoding, Medusa multiple heads, and lookahead decoding techniques. Use when optimizing inference speed (1.5-3.6× speedup), reducing latency for real-time applications, or deploying models with limited compute. Covers draft models, tree-based attention, Jacobi iteration, parallel token generation, and production deployment strategies.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Emerging Techniques, Speculative Decoding, Medusa, Lookahead Decoding, Fast Inference, Draft Models, Tree Attention, Parallel Generation, Latency Reduction, Inference Optimization]
dependencies: [transformers, torch]
---
# 推测解码：加速 LLM 推理

## 何时使用此技能

当你需要以下功能时，请使用推测解码：
- **加速推理** 1.5-3.6 倍，且不损失质量
- **降低实时应用的延迟**（聊天机器人、代码生成）
- **优化高并发服务的吞吐量**
- **在有限硬件上高效部署**
- **在不改变模型架构的情况下加快生成速度**

**关键技术**：草稿模型推测解码、Medusa（多头）、前瞻解码（Jacobi 迭代）

**论文**：Medusa（arXiv 2401.10774）、前瞻解码（ICML 2024）、推测解码综述（ACL 2024）

## 安装

```bash
# Standard speculative decoding (transformers)
pip install transformers accelerate

# Medusa (multiple decoding heads)
git clone https://github.com/FasterDecoding/Medusa
cd Medusa
pip install -e .

# Lookahead Decoding
git clone https://github.com/hao-ai-lab/LookaheadDecoding
cd LookaheadDecoding
pip install -e .

# Optional: vLLM with speculative decoding
pip install vllm
```

## 快速开始

### 基础推测解码（草稿模型）

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load target model (large, slow)
target_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    device_map="auto",
    torch_dtype=torch.float16
)

# Load draft model (small, fast)
draft_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    device_map="auto",
    torch_dtype=torch.float16
)

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-70b-hf")

# Generate with speculative decoding
prompt = "Explain quantum computing in simple terms:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

# Transformers 4.36+ supports assisted generation
outputs = target_model.generate(
    **inputs,
    assistant_model=draft_model,  # Enable speculative decoding
    max_new_tokens=256,
    do_sample=True,
    temperature=0.7,
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
```

### Medusa（多解码头）

```python
from medusa.model.medusa_model import MedusaModel

# Load Medusa-enhanced model
model = MedusaModel.from_pretrained(
    "FasterDecoding/medusa-vicuna-7b-v1.3",  # Pre-trained with Medusa heads
    torch_dtype=torch.float16,
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained("FasterDecoding/medusa-vicuna-7b-v1.3")

# Generate with Medusa (2-3× speedup)
prompt = "Write a Python function to calculate fibonacci numbers:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

outputs = model.medusa_generate(
    **inputs,
    max_new_tokens=256,
    temperature=0.7,
    posterior_threshold=0.09,  # Acceptance threshold
    posterior_alpha=0.3,       # Tree construction parameter
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### 前瞻解码（Jacobi 迭代）

```python
from lookahead.lookahead_decoding import LookaheadDecoding

# Load model
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Initialize lookahead decoding
lookahead = LookaheadDecoding(
    model=model,
    tokenizer=tokenizer,
    window_size=15,    # Lookahead window (W)
    ngram_size=5,      # N-gram size (N)
    guess_size=5       # Number of parallel guesses
)

# Generate (1.5-2.3× speedup)
prompt = "Implement quicksort in Python:"
output = lookahead.generate(prompt, max_new_tokens=256)
print(output)
```

## 核心概念

### 1. 推测解码（草稿模型）

**思路**：使用小型草稿模型生成候选 token，再由大型目标模型并行验证。

**算法**：
1. 草稿模型以推测方式生成 K 个 token
2. 目标模型并行评估全部 K 个 token（单次前向传播）
3. 接受草稿模型与目标模型意见一致的 token
4. 在首次出现分歧时拒绝该 token，并从该处继续

```python
def speculative_decode(target_model, draft_model, prompt, K=4):
    """Speculative decoding algorithm."""
    # 1. Generate K draft tokens
    draft_tokens = draft_model.generate(prompt, max_new_tokens=K)

    # 2. Target model evaluates all K tokens in one forward pass
    target_logits = target_model(draft_tokens)  # Parallel!

    # 3. Accept/reject based on probability match
    accepted = []
    for i in range(K):
        p_draft = softmax(draft_model.logits[i])
        p_target = softmax(target_logits[i])

        # Acceptance probability
        if random.random() < min(1, p_target[draft_tokens[i]] / p_draft[draft_tokens[i]]):
            accepted.append(draft_tokens[i])
        else:
            break  # Reject, resample from target

    return accepted
```

**性能**：
- 使用优质草稿模型时可实现 1.5-2× 加速
- 质量零损失（在数学上等价于目标模型）
- 当草稿模型比目标模型小 5-10× 时效果最佳

### 2. Medusa（多解码头）

**来源**：arXiv 2401.10774 (2024)

**创新点**：为现有模型添加多个预测头，无需单独的草稿模型即可预测未来 token。

**架构**：
```
Input → Base LLM (frozen) → Hidden State
                                ├→ Head 1 (predicts token t+1)
                                ├→ Head 2 (predicts token t+2)
                                ├→ Head 3 (predicts token t+3)
                                └→ Head 4 (predicts token t+4)
```

**训练**：
- **Medusa-1**：冻结基础 LLM，仅训练预测头
  - 2.2× 加速，无损
- **Medusa-2**：联合微调基础 LLM 和预测头
  - 2.3-3.6× 加速，质量更好

**基于树的注意力**：
```python
# Medusa constructs tree of candidates
# Example: Predict 2 steps ahead with top-2 per step

#         Root
#        /    \
#      T1a    T1b  (Step 1: 2 candidates)
#     /  \    / \
#  T2a  T2b T2c T2d  (Step 2: 4 candidates total)

# Single forward pass evaluates entire tree!
```

**优势**：
- 无需单独的草稿模型
- 训练量极少（仅训练预测头）
- 与任何 LLM 兼容

### 3. 前瞻解码（雅可比迭代）

**来源**：ICML 2024

**核心思路**：将自回归解码重新表述为求解方程组，并使用雅可比迭代进行并行求解。

**数学表述**：
```
Traditional:  y_t = f(x, y_1, ..., y_{t-1})  (sequential)
Jacobi:       y_t^{(k+1)} = f(x, y_1^{(k)}, ..., y_{t-1}^{(k)})  (parallel)
```

**两个分支**：

1. **前瞻分支**：并行生成 n-gram
   - 窗口大小 W：向前预测多少步
   - N-gram 大小 N：使用多少个过去的 token

2. **验证分支**：验证有潜力的 n-gram
   - 将 n-gram 与生成的 token 进行匹配
   - 如果第一个 token 匹配，则接受

```python
class LookaheadDecoding:
    def __init__(self, model, window_size=15, ngram_size=5):
        self.model = model
        self.W = window_size  # Lookahead window
        self.N = ngram_size   # N-gram size

    def generate_step(self, tokens):
        # Lookahead branch: Generate W × N candidates
        candidates = {}
        for w in range(1, self.W + 1):
            for n in range(1, self.N + 1):
                # Generate n-gram starting at position w
                ngram = self.generate_ngram(tokens, start=w, length=n)
                candidates[(w, n)] = ngram

        # Verification branch: Find matching n-grams
        verified = []
        for ngram in candidates.values():
            if ngram[0] == tokens[-1]:  # First token matches last input
                if self.verify(tokens, ngram):
                    verified.append(ngram)

        # Accept longest verified n-gram
        return max(verified, key=len) if verified else [self.model.generate_next(tokens)]
```

**性能**：
- 加速比：1.5-2.3×（代码生成场景最高可达 3.6×）
- 无需草稿模型或训练
- 可直接用于任何模型

## 方法比较

| 方法 | 加速比 | 是否需要训练 | 草稿模型 | 质量损失 |
|--------|---------|-----------------|-------------|--------------|
| **草稿模型推测解码** | 1.5-2× | 否 | 是（外部） | 无 |
| **Medusa** | 2-3.6× | 少量（仅预测头） | 否（内置预测头） | 无 |
| **Lookahead** | 1.5-2.3× | 无 | 否 | 无 |
| **朴素批处理** | 1.2-1.5× | 否 | 否 | 无 |

## 高级模式

### 训练 Medusa 预测头

```python
from medusa.model.medusa_model import MedusaModel
from medusa.model.kv_cache import initialize_past_key_values
import torch.nn as nn

# 1. Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "lmsys/vicuna-7b-v1.3",
    torch_dtype=torch.float16
)

# 2. Add Medusa heads
num_heads = 4
medusa_heads = nn.ModuleList([
    nn.Linear(base_model.config.hidden_size, base_model.config.vocab_size, bias=False)
    for _ in range(num_heads)
])

# 3. Training loop (freeze base model for Medusa-1)
for param in base_model.parameters():
    param.requires_grad = False  # Freeze base

optimizer = torch.optim.Adam(medusa_heads.parameters(), lr=1e-3)

for batch in dataloader:
    # Forward pass
    hidden_states = base_model(**batch, output_hidden_states=True).hidden_states[-1]

    # Predict future tokens with each head
    loss = 0
    for i, head in enumerate(medusa_heads):
        logits = head(hidden_states)
        # Target: tokens shifted by (i+1) positions
        target = batch['input_ids'][:, i+1:]
        loss += F.cross_entropy(logits[:, :-i-1], target)

    # Backward
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

### 混合模式：推测解码 + Medusa

```python
# Use Medusa as draft model for speculative decoding
draft_medusa = MedusaModel.from_pretrained("medusa-vicuna-7b")
target_model = AutoModelForCausalLM.from_pretrained("vicuna-33b")

# Draft generates multiple candidates with Medusa
draft_tokens = draft_medusa.medusa_generate(prompt, max_new_tokens=5)

# Target verifies in single forward pass
outputs = target_model.generate(
    prompt,
    assistant_model=draft_medusa,  # Use Medusa as draft
    max_new_tokens=256
)

# Combines benefits: Medusa speed + large model quality
```

### 最优草稿模型选择

```python
def select_draft_model(target_model_size, target):
    """Select optimal draft model for speculative decoding."""
    # Rule: Draft should be 5-10× smaller
    if target_model_size == "70B":
        return "7B"  # 10× smaller
    elif target_model_size == "33B":
        return "7B"  # 5× smaller
    elif target_model_size == "13B":
        return "1B"  # 13× smaller
    else:
        return None  # Target too small, use Medusa/Lookahead instead

# Example
draft = select_draft_model("70B", target_model)
# Returns "7B" → Use Llama-2-7b as draft for Llama-2-70b
```

## 最佳实践

### 1. 选择合适的方法

```python
# New deployment → Medusa (best overall speedup, no draft model)
if deploying_new_model:
    use_method = "Medusa"

# Existing deployment with small model available → Draft speculative
elif have_small_version_of_model:
    use_method = "Draft Model Speculative"

# Want zero training/setup → Lookahead
elif want_plug_and_play:
    use_method = "Lookahead Decoding"
```

### 2. 超参数调优

**草稿模型推测解码**：
```python
# K = number of speculative tokens
K = 4  # Good default
K = 2  # Conservative (higher acceptance)
K = 8  # Aggressive (lower acceptance, but more when accepted)

# Rule: Larger K → more speedup IF draft model is good
```

**Medusa**：
```python
# Posterior threshold (acceptance confidence)
posterior_threshold = 0.09  # Standard (from paper)
posterior_threshold = 0.05  # More conservative (slower, higher quality)
posterior_threshold = 0.15  # More aggressive (faster, may degrade quality)

# Tree depth (how many steps ahead)
medusa_choices = [[0], [0, 0], [0, 1], [0, 0, 0]]  # Depth 3 (standard)
```

**Lookahead**：
```python
# Window size W (lookahead distance)
# N-gram size N (context for generation)

# 7B model (more resources)
W, N = 15, 5

# 13B model (moderate)
W, N = 10, 5

# 33B+ model (limited resources)
W, N = 7, 5
```

### 3. 生产环境部署

```python
# vLLM with speculative decoding
from vllm import LLM, SamplingParams

# Initialize with draft model
llm = LLM(
    model="meta-llama/Llama-2-70b-hf",
    speculative_model="meta-llama/Llama-2-7b-hf",  # Draft model
    num_speculative_tokens=5,
    use_v2_block_manager=True,
)

# Generate
prompts = ["Tell me about AI:", "Explain quantum physics:"]
sampling_params = SamplingParams(temperature=0.7, max_tokens=256)

outputs = llm.generate(prompts, sampling_params)
for output in outputs:
    print(output.outputs[0].text)
```

## 资源

- **Medusa 论文**：https://arxiv.org/abs/2401.10774
- **Medusa GitHub**：https://github.com/FasterDecoding/Medusa
- **Lookahead 解码（ICML 2024）**：https://lmsys.org/blog/2023-11-21-lookahead-decoding/
- **Lookahead GitHub**：https://github.com/hao-ai-lab/LookaheadDecoding
- **推测解码综述（ACL 2024）**：https://aclanthology.org/2024.findings-acl.456.pdf
- **综合综述**：https://arxiv.org/abs/2401.07851

## 另请参阅

- `references/draft_model.md` - 草稿模型的选择与训练
- `references/medusa.md` - Medusa 架构与训练
- `references/lookahead.md` - Lookahead 解码的实现细节


