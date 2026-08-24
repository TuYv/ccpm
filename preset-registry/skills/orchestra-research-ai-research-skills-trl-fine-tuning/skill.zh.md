---
name: fine-tuning-with-trl
description: Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training. Use when need RLHF, align model with preferences, or train from human feedback. Works with HuggingFace Transformers.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Post-Training, TRL, Reinforcement Learning, Fine-Tuning, SFT, DPO, PPO, GRPO, RLHF, Preference Alignment, HuggingFace]
dependencies: [trl, transformers, datasets, peft, accelerate, torch]
---
# TRL - Transformer 强化学习

## 快速开始

TRL 提供用于根据人类偏好对语言模型进行对齐的后训练方法。

**安装**：
```bash
pip install trl transformers datasets peft accelerate
```

**监督微调**（指令微调）：
```python
from trl import SFTTrainer

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B",
    train_dataset=dataset,  # Prompt-completion pairs
)
trainer.train()
```

**DPO**（根据偏好进行对齐）：
```python
from trl import DPOTrainer, DPOConfig

config = DPOConfig(output_dir="model-dpo", beta=0.1)
trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=preference_dataset,  # chosen/rejected pairs
    processing_class=tokenizer
)
trainer.train()
```

## 常见工作流

### 工作流 1：完整 RLHF 流程（SFT → 奖励模型 → PPO）

从基础模型到与人类偏好对齐的模型的完整流程。

复制此检查清单：

```
RLHF Training:
- [ ] Step 1: Supervised fine-tuning (SFT)
- [ ] Step 2: Train reward model
- [ ] Step 3: PPO reinforcement learning
- [ ] Step 4: Evaluate aligned model
```

**步骤 1：监督微调**

使用指令遵循数据训练基础模型：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

# Load model
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B")

# Load instruction dataset
dataset = load_dataset("trl-lib/Capybara", split="train")

# Configure training
training_args = SFTConfig(
    output_dir="Qwen2.5-0.5B-SFT",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=2e-5,
    logging_steps=10,
    save_strategy="epoch"
)

# Train
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer
)
trainer.train()
trainer.save_model()
```

**步骤 2：训练奖励模型**

训练模型以预测人类偏好：

```python
from transformers import AutoModelForSequenceClassification
from trl import RewardTrainer, RewardConfig

# Load SFT model as base
model = AutoModelForSequenceClassification.from_pretrained(
    "Qwen2.5-0.5B-SFT",
    num_labels=1  # Single reward score
)
tokenizer = AutoTokenizer.from_pretrained("Qwen2.5-0.5B-SFT")

# Load preference data (chosen/rejected pairs)
dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train")

# Configure training
training_args = RewardConfig(
    output_dir="Qwen2.5-0.5B-Reward",
    per_device_train_batch_size=2,
    num_train_epochs=1,
    learning_rate=1e-5
)

# Train reward model
trainer = RewardTrainer(
    model=model,
    args=training_args,
    processing_class=tokenizer,
    train_dataset=dataset
)
trainer.train()
trainer.save_model()
```

**步骤 3：PPO 强化学习**

使用奖励模型优化策略：

```bash
python -m trl.scripts.ppo \
    --model_name_or_path Qwen2.5-0.5B-SFT \
    --reward_model_path Qwen2.5-0.5B-Reward \
    --dataset_name trl-internal-testing/descriptiveness-sentiment-trl-style \
    --output_dir Qwen2.5-0.5B-PPO \
    --learning_rate 3e-6 \
    --per_device_train_batch_size 64 \
    --total_episodes 10000
```

**步骤 4：评估**

```python
from transformers import pipeline

# Load aligned model
generator = pipeline("text-generation", model="Qwen2.5-0.5B-PPO")

# Test
prompt = "Explain quantum computing to a 10-year-old"
output = generator(prompt, max_length=200)[0]["generated_text"]
print(output)
```

### 工作流 2：使用 DPO 进行简单的偏好对齐

无需奖励模型即可根据偏好对模型进行对齐。

复制此检查清单：

```
DPO Training:
- [ ] Step 1: Prepare preference dataset
- [ ] Step 2: Configure DPO
- [ ] Step 3: Train with DPOTrainer
- [ ] Step 4: Evaluate alignment
```

**步骤 1：准备偏好数据集**

数据集格式：
```json
{
  "prompt": "What is the capital of France?",
  "chosen": "The capital of France is Paris.",
  "rejected": "I don't know."
}
```

加载数据集：
```python
from datasets import load_dataset

dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train")
# Or load your own
# dataset = load_dataset("json", data_files="preferences.json")
```

**步骤 2：配置 DPO**

```python
from trl import DPOConfig

config = DPOConfig(
    output_dir="Qwen2.5-0.5B-DPO",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=5e-7,
    beta=0.1,  # KL penalty strength
    max_prompt_length=512,
    max_length=1024,
    logging_steps=10
)
```

**步骤 3：使用 DPOTrainer 进行训练**

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import DPOTrainer

model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")

trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    processing_class=tokenizer
)

trainer.train()
trainer.save_model()
```

**CLI 替代方案**：
```bash
trl dpo \
    --model_name_or_path Qwen/Qwen2.5-0.5B-Instruct \
    --dataset_name argilla/Capybara-Preferences \
    --output_dir Qwen2.5-0.5B-DPO \
    --per_device_train_batch_size 4 \
    --learning_rate 5e-7 \
    --beta 0.1
```

### 工作流 3：使用 GRPO 进行高效内存的在线 RL

使用最少的内存进行强化学习训练。

复制此检查清单：

```
GRPO Training:
- [ ] Step 1: Define reward function
- [ ] Step 2: Configure GRPO
- [ ] Step 3: Train with GRPOTrainer
```

**步骤 1：定义奖励函数**

```python
def reward_function(completions, **kwargs):
    """
    Compute rewards for completions.

    Args:
        completions: List of generated texts

    Returns:
        List of reward scores (floats)
    """
    rewards = []
    for completion in completions:
        # Example: reward based on length and unique words
        score = len(completion.split())  # Favor longer responses
        score += len(set(completion.lower().split()))  # Reward unique words
        rewards.append(score)
    return rewards
```

或者使用奖励模型：
```python
from transformers import pipeline

reward_model = pipeline("text-classification", model="reward-model-path")

def reward_from_model(completions, prompts, **kwargs):
    # Combine prompt + completion
    full_texts = [p + c for p, c in zip(prompts, completions)]
    # Get reward scores
    results = reward_model(full_texts)
    return [r["score"] for r in results]
```

**步骤 2：配置 GRPO**

```python
from trl import GRPOConfig

config = GRPOConfig(
    output_dir="Qwen2-GRPO",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=1e-5,
    num_generations=4,  # Generate 4 completions per prompt
    max_new_tokens=128
)
```

**步骤 3：使用 GRPOTrainer 进行训练**

```python
from datasets import load_dataset
from trl import GRPOTrainer

# Load prompt-only dataset
dataset = load_dataset("trl-lib/tldr", split="train")

trainer = GRPOTrainer(
    model="Qwen/Qwen2-0.5B-Instruct",
    reward_funcs=reward_function,  # Your reward function
    args=config,
    train_dataset=dataset
)

trainer.train()
```

**CLI**：
```bash
trl grpo \
    --model_name_or_path Qwen/Qwen2-0.5B-Instruct \
    --dataset_name trl-lib/tldr \
    --output_dir Qwen2-GRPO \
    --num_generations 4
```

## 何时使用 TRL，何时选择替代方案

**在以下情况下使用 TRL：**
- 需要使模型与人类偏好保持一致
- 拥有偏好数据（chosen/rejected 对）
- 希望使用强化学习（PPO、GRPO）
- 需要训练奖励模型
- 正在进行 RLHF（完整流程）

**方法选择：**
- **SFT**：拥有提示词-补全对，希望实现基本的指令遵循
- **DPO**：拥有偏好数据，希望进行简单的对齐（不需要奖励模型）
- **PPO**：拥有奖励模型，需要对强化学习进行最大程度的控制
- **GRPO**：受内存限制，希望进行在线强化学习
- **奖励模型**：正在构建 RLHF 流程，需要对生成结果进行评分

**改用以下替代方案：**
- **HuggingFace Trainer**：不使用强化学习的基础微调
- **Axolotl**：基于 YAML 的训练配置
- **LitGPT**：用于学习，进行最小化微调
- **Unsloth**：快速 LoRA 训练

## 常见问题

**问题：DPO 训练期间出现 OOM**

减小批量大小和序列长度：
```python
config = DPOConfig(
    per_device_train_batch_size=1,  # Reduce from 4
    max_length=512,  # Reduce from 1024
    gradient_accumulation_steps=8  # Maintain effective batch
)
```

或者使用梯度检查点：
```python
model.gradient_checkpointing_enable()
```

**问题：对齐质量较差**

调整 beta 参数：
```python
# Higher beta = more conservative (stays closer to reference)
config = DPOConfig(beta=0.5)  # Default 0.1

# Lower beta = more aggressive alignment
config = DPOConfig(beta=0.01)
```

**问题：奖励模型没有学到东西**

检查损失类型和学习率：
```python
config = RewardConfig(
    learning_rate=1e-5,  # Try different LR
    num_train_epochs=3  # Train longer
)
```

确保偏好数据集中的优胜样本明确：
```python
# Verify dataset
print(dataset[0])
# Should have clear chosen > rejected
```

**问题：PPO 训练不稳定**

调整 KL 系数：
```python
config = PPOConfig(
    kl_coef=0.1,  # Increase from 0.05
    cliprange=0.1  # Reduce from 0.2
)
```

## 高级主题

**SFT 训练指南**：请参阅 [references/sft-training.md](references/sft-training.md)，了解数据集格式、聊天模板、打包策略和多 GPU 训练。

**DPO 变体**：请参阅 [references/dpo-variants.md](references/dpo-variants.md)，了解 IPO、cDPO、RPO 和其他 DPO 损失函数及推荐的超参数。

**奖励建模**：有关结果奖励与过程奖励、Bradley-Terry 损失以及奖励模型评估，请参阅 [references/reward-modeling.md](references/reward-modeling.md)。

**在线 RL 方法**：有关 PPO、GRPO、RLOO 和 OnlineDPO 及其详细配置，请参阅 [references/online-rl.md](references/online-rl.md)。

## 硬件要求

- **GPU**：NVIDIA（需要 CUDA）
- **显存**：取决于模型和方法
  - SFT 7B：16GB（使用 LoRA）
  - DPO 7B：24GB（存储参考模型）
  - PPO 7B：40GB（策略模型 + 奖励模型）
  - GRPO 7B：24GB（更加节省显存）
- **多 GPU**：通过 `accelerate` 支持
- **混合精度**：推荐使用 BF16（A100/H100）

**显存优化**：
- 对所有方法使用 LoRA/QLoRA
- 启用梯度检查点
- 使用更小的批量大小，并结合梯度累积

## 资源

- 文档：https://huggingface.co/docs/trl/
- GitHub：https://github.com/huggingface/trl
- 论文：
  - “训练语言模型通过人类反馈遵循指令”（InstructGPT，2022）
  - “直接偏好优化：你的语言模型其实是一个隐藏的奖励模型”（DPO，2023）
  - “组相对策略优化”（GRPO，2024）
- 示例：https://github.com/huggingface/trl/tree/main/examples/scripts