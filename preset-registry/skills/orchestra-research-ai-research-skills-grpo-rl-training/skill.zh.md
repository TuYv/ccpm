---
name: grpo-rl-training
description: Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Post-Training, Reinforcement Learning, GRPO, TRL, RLHF, Reward Modeling, Reasoning, DPO, PPO, Structured Output]
dependencies: [transformers>=4.47.0, trl>=0.14.0, datasets>=3.2.0, peft>=0.14.0, torch]
---
# 使用 TRL 进行 GRPO/RL 训练

使用 Transformer Reinforcement Learning (TRL) 库实现 Group Relative Policy Optimization (GRPO) 的专家级指南。本技能提供经过实战检验的模式、关键洞见以及生产就绪的工作流，用于通过自定义奖励函数微调语言模型。

## 何时使用本技能

当你需要执行以下操作时，请使用 GRPO 训练：
- **强制采用特定的输出格式**（例如 XML 标签、JSON、结构化推理）
- **教授可验证的任务**，并使用客观的正确性指标（数学、编程、事实核查）
- **通过奖励思维链模式来提升推理能力**
- **在没有带标签偏好数据的情况下，使模型与特定领域的行为保持一致**
- **同时优化多个目标**（格式 + 正确性 + 风格）

**请勿将 GRPO 用于：**
- 简单的监督微调任务（请改用 SFT）
- 没有明确奖励信号的任务
- 已经拥有高质量偏好对的情况（请改用 DPO/PPO）

---

## 核心概念

### 1. GRPO 算法基础

**关键机制：**
- 为每个提示词生成**多个补全结果**（组大小：4-16）
- 使用奖励函数比较每组内的补全结果
- 更新策略，使相对于组内其他响应获得更高奖励的响应更受青睐

**与 PPO 的关键区别：**
- 无需单独的奖励模型
- 样本效率更高（通过组内比较进行学习）
- 实现和调试更加简单

**数学直觉：**
```
For each prompt p:
  1. Generate N completions: {c₁, c₂, ..., cₙ}
  2. Compute rewards: {r₁, r₂, ..., rₙ}
  3. Learn to increase probability of high-reward completions
     relative to low-reward ones in the same group
```

### 2. 奖励函数设计理念

**黄金法则：**
1. **组合多个奖励函数** - 每个函数负责一个方面（格式、正确性、风格）
2. **适当缩放奖励** - 权重越高 = 信号越强
3. **使用增量奖励** - 对部分符合要求的结果给予部分奖励
4. **独立测试奖励** - 单独调试每个奖励函数

**奖励函数类型：**

| 类型 | 使用场景 | 示例权重 |
|------|----------|----------------|
| **正确性** | 可验证的任务（数学、代码） | 2.0（最高） |
| **格式** | 强制执行严格结构 | 0.5-1.0 |
| **长度** | 鼓励详尽或简洁 | 0.1-0.5 |
| **风格** | 惩罚不需要的模式 | -0.5 到 0.5 |

---

## 实现工作流

### 第 1 步：数据集准备

**关键要求：**
- 提示词采用聊天格式（包含 'role' 和 'content' 的 dicts 列表）
- 包含系统提示词以设定预期
- 对于可验证的任务，将真实答案作为附加列包含在内

**结构示例：**
```python
from datasets import load_dataset, Dataset

SYSTEM_PROMPT = """
Respond in the following format:
<reasoning>
[Your step-by-step thinking]
</reasoning>
<answer>
[Final answer]
</answer>
"""

def prepare_dataset(raw_data):
    """
    Transform raw data into GRPO-compatible format.

    Returns: Dataset with columns:
    - 'prompt': List[Dict] with role/content (system + user messages)
    - 'answer': str (ground truth, optional but recommended)
    """
    return raw_data.map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': extract_answer(x['raw_answer'])
    })
```

**专业提示：**
- 对于复杂格式，在系统提示词中使用单样本或少样本示例
- 保持提示词简洁（max_prompt_length: 256-512 tokens）
- 训练前验证数据质量（垃圾进 = 垃圾出）

### 第 2 步：奖励函数实现

**模板结构：**
```python
def reward_function_name(
    prompts,        # List[List[Dict]]: Original prompts
    completions,    # List[List[Dict]]: Model generations
    answer=None,    # Optional: Ground truth from dataset
    **kwargs        # Additional dataset columns
) -> list[float]:
    """
    Evaluate completions and return rewards.

    Returns: List of floats (one per completion)
    """
    # Extract completion text
    responses = [comp[0]['content'] for comp in completions]

    # Compute rewards
    rewards = []
    for response in responses:
        score = compute_score(response)
        rewards.append(score)

    return rewards
```

**示例 1：正确性奖励（数学/编程）**
```python
def correctness_reward(prompts, completions, answer, **kwargs):
    """Reward correct answers with high score."""
    responses = [comp[0]['content'] for comp in completions]
    extracted = [extract_final_answer(r) for r in responses]
    return [2.0 if ans == gt else 0.0
            for ans, gt in zip(extracted, answer)]
```

**示例 2：格式奖励（结构化输出）**
```python
import re

def format_reward(completions, **kwargs):
    """Reward XML-like structured format."""
    pattern = r'<reasoning>.*?</reasoning>\s*<answer>.*?</answer>'
    responses = [comp[0]['content'] for comp in completions]
    return [1.0 if re.search(pattern, r, re.DOTALL) else 0.0
            for r in responses]
```

**示例 3：增量格式奖励（部分得分）**
```python
def incremental_format_reward(completions, **kwargs):
    """Award partial credit for format compliance."""
    responses = [comp[0]['content'] for comp in completions]
    rewards = []

    for r in responses:
        score = 0.0
        if '<reasoning>' in r:
            score += 0.25
        if '</reasoning>' in r:
            score += 0.25
        if '<answer>' in r:
            score += 0.25
        if '</answer>' in r:
            score += 0.25
        # Penalize extra text after closing tag
        if r.count('</answer>') == 1:
            extra_text = r.split('</answer>')[-1].strip()
            score -= len(extra_text) * 0.001
        rewards.append(score)

    return rewards
```

**关键洞见：**
结合 3-5 个奖励函数以实现稳健训练。相比顺序，信号的多样性更重要。

### 第 3 步：训练配置

**内存优化配置（小型 GPU）**
```python
from trl import GRPOConfig

training_args = GRPOConfig(
    output_dir="outputs/grpo-model",

    # Learning rate
    learning_rate=5e-6,          # Lower = more stable
    adam_beta1=0.9,
    adam_beta2=0.99,
    weight_decay=0.1,
    warmup_ratio=0.1,
    lr_scheduler_type='cosine',

    # Batch settings
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,  # Effective batch = 4

    # GRPO-specific
    num_generations=8,            # Group size: 8-16 recommended
    max_prompt_length=256,
    max_completion_length=512,

    # Training duration
    num_train_epochs=1,
    max_steps=None,               # Or set fixed steps (e.g., 500)

    # Optimization
    bf16=True,                    # Faster on A100/H100
    optim="adamw_8bit",          # Memory-efficient optimizer
    max_grad_norm=0.1,

    # Logging
    logging_steps=1,
    save_steps=100,
    report_to="wandb",            # Or "none" for no logging
)
```

**高性能配置（大型 GPU）**
```python
training_args = GRPOConfig(
    output_dir="outputs/grpo-model",
    learning_rate=1e-5,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    num_generations=16,           # Larger groups = better signal
    max_prompt_length=512,
    max_completion_length=1024,
    num_train_epochs=1,
    bf16=True,
    use_vllm=True,                # Fast generation with vLLM
    logging_steps=10,
)
```

**关键超参数：**

| 参数 | 影响 | 调优建议 |
|-----------|--------|---------------|
| `num_generations` | 用于比较的组大小 | 从 8 开始，如果 GPU 允许则增加到 16 |
| `learning_rate` | 收敛速度/稳定性 | 5e-6（稳妥），1e-5（更快、风险更高） |
| `max_completion_length` | 输出详细程度 | 根据任务进行调整（推理任务使用 512，简短回答使用 256） |
| `gradient_accumulation_steps` | 有效批次大小 | 如果 GPU 显存有限，则增大该值 |

### 第 4 步：模型设置与训练

**标准设置（Transformers）**
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig
from trl import GRPOTrainer

# Load model
model_name = "Qwen/Qwen2.5-1.5B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    attn_implementation="flash_attention_2",  # 2-3x faster
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Optional: LoRA for parameter-efficient training
peft_config = LoraConfig(
    r=16,                         # Rank (higher = more capacity)
    lora_alpha=32,               # Scaling factor (typically 2*r)
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    task_type="CAUSAL_LM",
    lora_dropout=0.05,
)

# Initialize trainer
trainer = GRPOTrainer(
    model=model,
    processing_class=tokenizer,
    reward_funcs=[
        incremental_format_reward,
        format_reward,
        correctness_reward,
    ],
    args=training_args,
    train_dataset=dataset,
    peft_config=peft_config,      # Remove for full fine-tuning
)

# Train
trainer.train()

# Save
trainer.save_model("final_model")
```

**Unsloth 设置（速度提升 2～3 倍）**
```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="google/gemma-3-1b-it",
    max_seq_length=1024,
    load_in_4bit=True,
    fast_inference=True,
    max_lora_rank=32,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=32,
    use_gradient_checkpointing="unsloth",
)

# Rest is identical to standard setup
trainer = GRPOTrainer(model=model, ...)
trainer.train()
```

---

## 关键训练要点

### 1. 损失变化规律（预期模式）
- **损失从接近 0 开始，并在训练期间逐渐增大**
- 这是正确的——损失衡量的是相对于初始策略的 KL 散度
- 模型正在学习（偏离原始行为以优化奖励）
- 应监控奖励指标而不是损失，以评估训练进展

### 2. 奖励跟踪
需要关注的关键指标：
- `reward`：所有补全结果的平均值
- `reward_std`：组内多样性（应保持 > 0）
- `kl`：相对于参考模型的 KL 散度（应适度增长）

**健康的训练模式：**
```
Step   Reward    Reward_Std   KL
100    0.5       0.3          0.02
200    0.8       0.25         0.05
300    1.2       0.2          0.08  ← Good progression
400    1.5       0.15         0.12
```

**警示信号：**
- 奖励标准差 → 0（模型坍缩为单一响应）
- KL 急剧增大（> 0.5）（偏离过大，应降低学习率）
- 奖励停滞（奖励函数过于严苛或模型容量存在问题）

### 3. 常见陷阱与解决方案

| 问题 | 症状 | 解决方案 |
|---------|---------|----------|
| **模式坍缩** | 所有补全结果都相同 | 增大 `num_generations`，添加多样性惩罚 |
| **没有学习效果** | 奖励值无变化 | 检查奖励函数逻辑，提高学习率 |
| **OOM 错误** | GPU 内存超限 | 减小 `num_generations`，启用梯度检查点 |
| **训练缓慢** | < 1 it/s | 启用 `use_vllm=True`，使用 Unsloth，缩短序列长度 |
| **格式被忽略** | 模型不遵循指定结构 | 提高格式奖励权重，添加增量奖励 |

---

## 高级模式

### 1. 多阶段训练
对于复杂任务，分阶段进行训练：

```python
# Stage 1: Format compliance (epochs=1)
trainer_stage1 = GRPOTrainer(
    model=model,
    reward_funcs=[incremental_format_reward, format_reward],
    ...
)
trainer_stage1.train()

# Stage 2: Correctness (epochs=1)
trainer_stage2 = GRPOTrainer(
    model=model,
    reward_funcs=[format_reward, correctness_reward],
    ...
)
trainer_stage2.train()
```

### 2. 自适应奖励缩放
```python
class AdaptiveReward:
    def __init__(self, base_reward_func, initial_weight=1.0):
        self.func = base_reward_func
        self.weight = initial_weight

    def __call__(self, *args, **kwargs):
        rewards = self.func(*args, **kwargs)
        return [r * self.weight for r in rewards]

    def adjust_weight(self, success_rate):
        """Increase weight if model struggling, decrease if succeeding."""
        if success_rate < 0.3:
            self.weight *= 1.2
        elif success_rate > 0.8:
            self.weight *= 0.9
```

### 3. 自定义数据集集成
```python
def load_custom_knowledge_base(csv_path):
    """Example: School communication platform docs."""
    import pandas as pd
    df = pd.read_csv(csv_path)

    dataset = Dataset.from_pandas(df).map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': CUSTOM_SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': x['expert_answer']
    })
    return dataset
```

---

## 部署与推理

### 保存并合并 LoRA
```python
# Merge LoRA adapters into base model
if hasattr(trainer.model, 'merge_and_unload'):
    merged_model = trainer.model.merge_and_unload()
    merged_model.save_pretrained("production_model")
    tokenizer.save_pretrained("production_model")
```

### 推理示例
```python
from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="production_model",
    tokenizer=tokenizer
)

result = generator(
    [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': "What is 15 + 27?"}
    ],
    max_new_tokens=256,
    do_sample=True,
    temperature=0.7,
    top_p=0.9
)
print(result[0]['generated_text'])
```

---

## 最佳实践检查清单

**训练前：**
- [ ] 验证数据集格式（prompts 为 List[Dict]）
- [ ] 在样本数据上测试奖励函数
- [ ] 根据数据计算预期的 max_prompt_length
- [ ] 根据 GPU 显存选择合适的 num_generations
- [ ] 设置日志记录（推荐使用 wandb）

**训练期间：**
- [ ] 监控奖励变化（应当上升）
- [ ] 检查 reward_std（应保持 > 0.1）
- [ ] 留意 OOM 错误（必要时减小批次大小）
- [ ] 每 50-100 步对生成结果进行采样
- [ ] 在留出集上验证格式合规性

**训练后：**
- [ ] 如果使用 PEFT，则合并 LoRA 权重
- [ ] 使用多样化的 prompts 进行测试
- [ ] 与基线模型进行比较
- [ ] 记录奖励权重和超参数
- [ ] 保存可复现性配置

---

## 故障排除指南

### 调试工作流
1. **隔离奖励函数** - 分别独立测试每个函数
2. **检查数据分布** - 确保 prompts 具有多样性
3. **降低复杂度** - 从单个奖励开始，然后逐步添加
4. **监控生成结果** - 每 N 步打印一次样本
5. **验证提取逻辑** - 确保答案解析正常工作

### 快速修复
```python
# Debug reward function
def debug_reward(completions, **kwargs):
    responses = [comp[0]['content'] for comp in completions]
    for i, r in enumerate(responses[:2]):  # Print first 2
        print(f"Response {i}: {r[:200]}...")
    return [1.0] * len(responses)  # Dummy rewards

# Test without training
trainer = GRPOTrainer(..., reward_funcs=[debug_reward])
trainer.generate_completions(dataset[:1])  # Generate without updating
```

---

## 参考资料与资源

**官方文档：**
- TRL GRPO Trainer：https://huggingface.co/docs/trl/grpo_trainer
- DeepSeek R1 论文：https://arxiv.org/abs/2501.12948
- Unsloth 文档：https://docs.unsloth.ai/

**示例仓库：**
- Open R1 实现：https://github.com/huggingface/open-r1
- TRL 示例：https://github.com/huggingface/trl/tree/main/examples

**推荐阅读：**
- 用于智能体指令的渐进式披露模式
- 强化学习中的奖励塑形（Ng 等）
- LoRA 论文（Hu 等，2021）

---

## 智能体使用说明

加载此技能时：

1. **阅读整个文件**，然后再实现 GRPO 训练
2. **从最简单的奖励函数开始**（例如，基于长度的奖励函数），以验证设置
3. **使用** `templates/` 目录中的模板作为起点
4. **参考** `examples/` 中针对特定任务的实现
5. **按顺序执行工作流**（不要跳过步骤）
6. **逐步调试** - 每次添加一个奖励函数

**重要提醒：**
- 始终使用多个奖励函数（3-5 个为最佳）
- 监控奖励指标，而非损失
- 在训练前测试奖励函数
- 从小规模开始（`num_generations=4`），然后逐步扩大
- 频繁保存检查点（每 100 步一次）

本技能面向**专家级实现**。初学者应先从监督微调入手，再尝试 GRPO。