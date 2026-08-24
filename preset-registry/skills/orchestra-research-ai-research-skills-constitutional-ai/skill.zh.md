---
name: constitutional-ai
description: Anthropic's method for training harmless AI through self-improvement. Two-phase approach - supervised learning with self-critique/revision, then RLAIF (RL from AI Feedback). Use for safety alignment, reducing harmful outputs without human labels. Powers Claude's safety system.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Safety Alignment, Constitutional AI, RLAIF, Self-Critique, Harmlessness, Anthropic, AI Safety, RL From AI Feedback, Claude]
dependencies: [transformers, torch, trl]
---
# Constitutional AI——基于 AI 反馈实现无害化

## 快速开始

Constitutional AI（CAI）通过自我批判和 AI 反馈来训练模型实现无害化，无需对有害输出进行人工标注。

**核心概念**：模型使用一套“宪法”（一组原则）来学习批判并修正自己的回答。

**两个阶段**：
1. **监督学习（SL）**：自我批判 + 修正
2. **强化学习（RL）**：RLAIF（基于 AI 反馈的强化学习）

**宪法示例**：
```
Principles:
1. Choose the response that is most helpful, honest, and harmless
2. Avoid responses that are toxic, racist, or sexist
3. Prefer responses that explain objections rather than refuse
4. Choose responses that are thoughtful and nuanced
```

## 常见工作流

### 工作流 1：监督学习阶段（自我批判 + 修正）

**第 1 步：生成初始回答**：
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

**第 2 步：依据宪法进行自我批判**：
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

**第 3 步：根据批判进行修正**：
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

**第 4 步：使用修正后的回答进行微调**：
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

### 工作流 2：RL 阶段（RLAIF——基于 AI 反馈的强化学习）

**第 1 步：生成比较对**：
```python
# Sample multiple responses per prompt
responses_a = generator(prompts, num_return_sequences=2, do_sample=True, temperature=0.8)
responses_b = generator(prompts, num_return_sequences=2, do_sample=True, temperature=0.8)
```

**第 2 步：AI 偏好评估**：
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

### 工作流 3：思维链批判

**启用推理透明度**：
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

## 何时使用以及何时选择替代方案

**在以下情况下使用 Constitutional AI**：
- 希望在没有人工标签的情况下实现安全对齐
- 需要可解释的 AI 决策
- 希望避免回避式拒绝
- 拥有一套明确的原则/宪法
- 需要可扩展的安全训练

**原则**：
- **RLAIF**：AI 生成的偏好（可扩展，无需人工标签）
- **RLHF**：人类偏好（更准确，但成本高）
- **自我批判**：迭代改进
- **思维链**：推理透明度

**改用以下替代方案**：
- **RLHF (PPO)**：需要经人工验证的安全性
- **DPO/SimPO**：拥有人类偏好数据
- **NeMo Guardrails**：需要运行时内容过滤
- **LlamaGuard**：需要预训练的审核模型

## 常见问题

**问题：模型拒绝过多（回避）**

添加宪法原则：
```
Prefer responses that engage thoughtfully with questions rather than
refusing to answer. Explain concerns while still being helpful.
```

**问题：自我批判力度不足**

使用更有力的批判提示词：
```
Critically analyze this response for ANY potential issues, however minor.
Be thorough and specific in identifying problems.
```

**问题：修订未能提高质量**

进行多轮迭代：
```python
for _ in range(3):  # 3 rounds of critique/revision
    critique = generate_critique(response)
    response = generate_revision(response, critique)
```

**问题：RLAIF 偏好数据噪声较大**

使用多个 AI 评估器：
```python
# Get preferences from 3 different models
prefs_1 = model_1.evaluate(responses)
prefs_2 = model_2.evaluate(responses)
prefs_3 = model_3.evaluate(responses)

# Majority vote
final_preference = majority_vote(prefs_1, prefs_2, prefs_3)
```

## 高级主题

**宪法设计**：有关原则选择、有用性与无害性之间的权衡，以及特定领域的宪法，请参阅 [references/constitution-design.md](references/constitution-design.md)。

**RLAIF 与 RLHF**：有关性能比较、成本分析，以及何时使用 AI 反馈或人类反馈，请参阅 [references/rlaif-comparison.md](references/rlaif-comparison.md)。

**思维链推理**：有关批判提示工程、多步推理和透明度改进，请参阅 [references/cot-critique.md](references/cot-critique.md)。

## 硬件要求

- **GPU**：推荐使用 NVIDIA A100/H100
- **VRAM**：
  - SL 阶段（7B）：1× A100 40GB
  - RL 阶段（7B）：2× A100 40GB（策略模型 + 奖励模型）
- **单节点**：足以满足大多数使用场景
- **混合精度**：推荐使用 BF16

**计算要求**：
- **SL 阶段**：与标准 SFT 类似
- **RL 阶段**：与 PPO 类似（高于 DPO）
- **AI 评估**：生成批判意见/偏好需要额外的推理计算

## 资源

- 论文：https://arxiv.org/abs/2212.08073（2022 年 12 月）
- Anthropic 博客：https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
- 实现：TRL（PPOTrainer + RewardTrainer）
- Claude：使用 Constitutional AI 来保障安全性