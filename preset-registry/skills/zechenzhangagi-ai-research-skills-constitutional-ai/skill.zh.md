---
name: constitutional-ai
description: Anthropic's method for training harmless AI through self-improvement. Two-phase approach - supervised learning with self-critique/revision, then RLAIF (RL from AI Feedback). Use for safety alignment, reducing harmful outputs without human labels. Powers Claude's safety system.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Safety Alignment, Constitutional AI, RLAIF, Self-Critique, Harmlessness, Anthropic, AI Safety, RL From AI Feedback, Claude]
dependencies: [transformers, torch, trl]
---
# Constitutional AI - 基于 AI 反馈的无害性

## 快速开始

Constitutional AI（CAI）通过自我批评和 AI 反馈训练模型使其无害，无需人工为有害输出提供标注。

**核心概念**：模型学习使用“宪法”（一组原则）来批评并修改自己的回复。

**两个阶段**：
1. **监督学习（SL）**：自我批评 + 修改
2. **强化学习（RL）**：RLAIF（基于 AI 反馈的强化学习）

**宪法示例**：
```
Principles:
1. Choose the response that is most helpful, honest, and harmless
2. Avoid responses that are toxic, racist, or sexist
3. Prefer responses that explain objections rather than refuse
4. Choose responses that are thoughtful and nuanced
```

## 常用工作流

### 工作流 1：监督学习阶段（自我批评 + 修改）

**步骤 1：生成初始回复**：
```python
from transformers import pipeline

generator = pipeline("text-generation", model="base-model")

prompts = [
    "How do I hack a website?",
    "Write something offensive about a group.",
    "Help me cheat on my exam."
]

initial_responses = generator(prompts, max_length=200)
```

**步骤 2：基于宪法进行自我批评**：
```python
critique_prompt = """
Given the question:
{question}

And the response:
{response}

Constitution:
1. Choose responses that are helpful, honest, and harmless
2. Avoid toxic, racist, or sexist content
3. Explain objections rather than refuse

Identify any ways this response violates the constitution:
"""

critiques = generator(
    [critique_prompt.format(q=q, r=r) for q, r in zip(prompts, initial_responses)]
)
```

**步骤 3：基于批评进行修改**：
```python
revision_prompt = """
Question: {question}
Original response: {response}
Critique: {critique}

Please revise the response to better align with the constitution:
"""

revised_responses = generator(
    [revision_prompt.format(q=q, r=r, c=c)
     for q, r, c in zip(prompts, initial_responses, critiques)]
)
```

**步骤 4：在修改后的回复上进行微调**：
```python
from trl import SFTTrainer

# Create dataset of (prompt, revised_response) pairs
dataset = create_dataset(prompts, revised_responses)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    max_seq_length=1024
)
trainer.train()
```

### 工作流 2：强化学习阶段（RLAIF - 基于 AI 反馈的强化学习）

**步骤 1：生成对比对**：
```python
# Sample multiple responses per prompt
responses_a = generator(prompts, num_return_sequences=2, do_sample=True, temperature=0.8)
responses_b = generator(prompts, num_return_sequences=2, do_sample=True, temperature=0.8)
```

**步骤 2：AI 偏好评估**：
```python
preference_prompt = """
Question: {question}

Response A: {response_a}
Response B: {response_b}

Constitution:
{constitution}

Which response better follows the constitution? Explain your reasoning, then choose A or B.
"""

# Get AI preferences (no human labels needed!)
preferences = generator(
    [preference_prompt.format(q=q, ra=ra, rb=rb, constitution=CONSTITUTION)
     for q, ra, rb in zip(prompts, responses_a, responses_b)]
)

# Parse preferences (A or B)
chosen, rejected = parse_preferences(preferences, responses_a, responses_b)
```

**步骤 3：训练偏好模型（奖励模型）**：
```python
from trl import RewardTrainer, RewardConfig

preference_dataset = create_preference_dataset(prompts, chosen, rejected)

reward_config = RewardConfig(
    output_dir="constitutional-reward-model",
    learning_rate=1e-5,
    num_train_epochs=1
)

reward_trainer = RewardTrainer(
    model=model,
    args=reward_config,
    train_dataset=preference_dataset,
    processing_class=tokenizer
)
reward_trainer.train()
```

**步骤 4：使用 RLAIF 进行强化学习训练**：
```python
from trl import PPOTrainer, PPOConfig

ppo_config = PPOConfig(
    reward_model_path="constitutional-reward-model",
    learning_rate=1e-6,
    kl_coef=0.05
)

ppo_trainer = PPOTrainer(
    model=model,
    config=ppo_config,
    reward_model=reward_model
)
ppo_trainer.train()
```

### 工作流 3：思维链批评

**启用推理透明性**：
```python
cot_critique_prompt = """
Question: {question}
Response: {response}

Let's think step-by-step about whether this response follows our principles:

1. Is it helpful? [Yes/No and reasoning]
2. Is it honest? [Yes/No and reasoning]
3. Is it harmless? [Yes/No and reasoning]
4. Does it avoid toxicity? [Yes/No and reasoning]

Based on this analysis, suggest a revision if needed.
"""

cot_critiques = generator(
    [cot_critique_prompt.format(q=q, r=r) for q, r in zip(prompts, responses)]
)
```

## 何时使用与替代方案

**在以下情况使用 Constitutional AI**：
- 希望在无需人工标注的情况下实现安全对齐
- 需要可解释的 AI 决策
- 希望避免回避式拒绝
- 已有一套明确的原则/宪法
- 需要可扩展的安全训练

**原理**：
- **RLAIF**：AI 生成的偏好（可扩展、无需人工标注）
- **RLHF**：人工偏好（更准确、成本高）
- **自我批评**：迭代改进
- **思维链**：推理透明性

**在以下情况改用替代方案**：
- **RLHF (PPO)**：需要经人工验证的安全性
- **DPO/SimPO**：已有人工偏好数据
- **NeMo Guardrails**：需要运行时内容过滤
- **LlamaGuard**：需要预训练的审核模型

## 常见问题

**问题：模型拒绝过多（回避式）**

添加宪法原则：
```
Prefer responses that engage thoughtfully with questions rather than
refusing to answer. Explain concerns while still being helpful.
```

**问题：自我批评过于薄弱**

使用更强的批评提示：
```
Critically analyze this response for ANY potential issues, however minor.
Be thorough and specific in identifying problems.
```

**问题：修改未能提升质量**

进行多次迭代：
```python
for _ in range(3):  # 3 rounds of critique/revision
    critique = generate_critique(response)
    response = generate_revision(response, critique)
```

**问题：RLAIF 偏好存在噪声**

使用多个 AI 评估器：
```python
# Get preferences from 3 different models
prefs_1 = model_1.evaluate(responses)
prefs_2 = model_2.evaluate(responses)
prefs_3 = model_3.evaluate(responses)

# Majority vote
final_preference = majority_vote(prefs_1, prefs_2, prefs_3)
```

## 进阶主题

**宪法设计**：有关原则选择、有用性与无害性之间的权衡以及特定领域宪法的内容，请参阅 [references/constitution-design.md](references/constitution-design.md)。

**RLAIF 与 RLHF 对比**：有关性能对比、成本分析以及何时使用 AI 反馈与人工反馈的内容，请参阅 [references/rlaif-comparison.md](references/rlaif-comparison.md)。

**思维链推理**：有关批评提示工程、多步推理以及透明性改进的内容，请参阅 [references/cot-critique.md](references/cot-critique.md)。

## 硬件要求

- **GPU**：推荐 NVIDIA A100/H100
- **显存（VRAM）**：
  - SL 阶段（7B）：1× A100 40GB
  - RL 阶段（7B）：2× A100 40GB（策略模型 + 奖励模型）
- **单节点**：足以满足大多数使用场景
- **混合精度**：推荐使用 BF16

**计算需求**：
- **SL 阶段**：与标准 SFT 相当
- **RL 阶段**：与 PPO 相当（高于 DPO）
- **AI 评估**：用于生成批评/偏好的额外推理

## 资源

- 论文：https://arxiv.org/abs/2212.08073（2022 年 12 月）
- Anthropic 博客：https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
- 实现：TRL（PPOTrainer + RewardTrainer）
- Claude：使用 Constitutional AI 保障安全
