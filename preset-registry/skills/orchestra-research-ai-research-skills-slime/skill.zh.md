---
name: slime-rl-training
description: Provides guidance for LLM post-training with RL using slime, a Megatron+SGLang framework. Use when training GLM models, implementing custom data generation workflows, or needing tight Megatron-LM integration for RL scaling.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Reinforcement Learning, Megatron-LM, SGLang, GRPO, Post-Training, GLM]
dependencies: [sglang-router>=0.2.3, ray, torch>=2.0.0, transformers>=4.40.0]
---
# slime：用于 RL 扩展的 LLM 后训练框架

slime 是清华大学 THUDM 团队开发的 LLM 后训练框架，为 GLM-4.5、GLM-4.6 和 GLM-4.7 提供支持。它将用于训练的 Megatron-LM 与用于高吞吐量 rollout 生成的 SGLang 连接起来。

## 何时使用 slime

**在以下情况下选择 slime：**
- 需要使用 SGLang 推理的 Megatron-LM 原生训练
- 需要具有灵活数据缓冲区的自定义数据生成工作流
- 需要训练 GLM、Qwen3、DeepSeek V3 或 Llama 3 模型
- 需要具备生产级支持（Z.ai）的研究级框架

**在以下情况下考虑其他替代方案：**
- 需要企业级稳定性功能 → 使用 **miles**
- 希望灵活切换后端 → 使用 **verl**
- 需要 PyTorch 原生抽象 → 使用 **torchforge**

## 主要特性

- **训练**：支持完整并行能力（TP、PP、DP、SP）的 Megatron-LM
- **Rollout**：基于 SGLang 并配备路由器的高吞吐量生成
- **数据缓冲区**：灵活的提示词管理和样本存储
- **模型**：GLM-4.x、Qwen3、DeepSeek V3/R1、Llama 3

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Data Buffer                          │
│ - Prompt initialization and management                  │
│ - Custom data generation and filtering                  │
│ - Rollout sample storage                                │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
┌─────────────▼───────────┐ ┌─────────────▼───────────────┐
│ Training (Megatron-LM)  │ │ Rollout (SGLang + Router)   │
│ - Actor model training  │ │ - Response generation       │
│ - Critic (optional)     │ │ - Reward/verifier output    │
│ - Weight sync to rollout│ │ - Multi-turn support        │
└─────────────────────────┘ └─────────────────────────────┘
```

## 安装

```bash
# Recommended: Docker
docker pull slimerl/slime:latest
docker run --rm --gpus all --ipc=host --shm-size=16g \
  -it slimerl/slime:latest /bin/bash

# Inside container
cd /root/slime && pip install -e . --no-deps
```

### 从源码安装

```bash
git clone https://github.com/THUDM/slime.git
cd slime
pip install -r requirements.txt
pip install -e .
```

## 快速开始：GRPO 训练

```bash
# Source model configuration
source scripts/models/qwen3-4B.sh

# Launch training
python train.py \
    --actor-num-nodes 1 \
    --actor-num-gpus-per-node 4 \
    --rollout-num-gpus 4 \
    --advantage-estimator grpo \
    --use-kl-loss --kl-loss-coef 0.001 \
    --rollout-batch-size 32 \
    --n-samples-per-prompt 8 \
    --global-batch-size 256 \
    --num-rollout 3000 \
    --prompt-data /path/to/data.jsonl \
    ${MODEL_ARGS[@]} ${CKPT_ARGS[@]}
```

---

## 工作流 1：标准 GRPO 训练

使用此工作流训练采用组相对优势的推理模型。

### 前置条件检查清单
- [ ] Docker 环境，或已安装 Megatron-LM + SGLang
- [ ] 模型检查点（HuggingFace 或 Megatron 格式）
- [ ] JSONL 格式的训练数据

### 步骤 1：准备数据

```python
# data.jsonl format
{"prompt": "What is 2 + 2?", "label": "4"}
{"prompt": "Solve: 3x = 12", "label": "x = 4"}
```

或使用聊天格式：
```python
{
    "prompt": [
        {"role": "system", "content": "You are a math tutor."},
        {"role": "user", "content": "What is 15 + 27?"}
    ],
    "label": "42"
}
```

### 步骤 2：配置模型

选择一个预配置的模型脚本：

```bash
# List available models
ls scripts/models/
# glm4-9B.sh, qwen3-4B.sh, qwen3-30B-A3B.sh, deepseek-v3.sh, llama3-8B.sh, ...

# Source your model
source scripts/models/qwen3-4B.sh
```

### 步骤 3：启动训练

```bash
python train.py \
    --actor-num-nodes 1 \
    --actor-num-gpus-per-node 8 \
    --rollout-num-gpus 8 \
    --advantage-estimator grpo \
    --use-kl-loss \
    --kl-loss-coef 0.001 \
    --prompt-data /path/to/train.jsonl \
    --input-key prompt \
    --label-key label \
    --apply-chat-template \
    --rollout-batch-size 32 \
    --n-samples-per-prompt 8 \
    --global-batch-size 256 \
    --num-rollout 3000 \
    --save-interval 100 \
    --eval-interval 50 \
    ${MODEL_ARGS[@]}
```

### 步骤 4：监控训练
- [ ] 检查 TensorBoard：`tensorboard --logdir outputs/`
- [ ] 确认奖励曲线正在上升
- [ ] 监控各节点上的 GPU 利用率

---

## 工作流 2：异步训练

使用异步模式，通过重叠执行 rollout 和训练来提高吞吐量。

### 适用异步模式的情况
- 生成时间较长的大型模型
- 同步模式下 GPU 空闲时间较长
- 有足够的内存用于缓冲

### 启动异步训练

```bash
python train_async.py \
    --actor-num-nodes 1 \
    --actor-num-gpus-per-node 8 \
    --rollout-num-gpus 8 \
    --advantage-estimator grpo \
    --async-buffer-size 4 \
    --prompt-data /path/to/train.jsonl \
    ${MODEL_ARGS[@]}
```

### 异步模式专用参数

```bash
--async-buffer-size 4        # Number of rollouts to buffer
--update-weights-interval 2  # Sync weights every N rollouts
```

---

## 工作流 3：多轮智能体训练

在训练需要使用工具或进行多步推理的智能体时，使用此工作流。

### 前置条件
- [ ] 用于多轮逻辑的自定义 generate 函数
- [ ] 工具/环境接口

### 步骤 1：定义自定义 Generate 函数

```python
# custom_generate.py
async def custom_generate(args, samples, evaluation=False):
    """Multi-turn generation with tool calling."""
    for sample in samples:
        conversation = sample.prompt

        for turn in range(args.max_turns):
            # Generate response
            response = await generate_single(conversation)

            # Check for tool call
            tool_call = extract_tool_call(response)
            if tool_call:
                tool_result = execute_tool(tool_call)
                conversation.append({"role": "assistant", "content": response})
                conversation.append({"role": "tool", "content": tool_result})
            else:
                break

        sample.response = response
        sample.reward = compute_reward(sample)

    return samples
```

### 步骤 2：使用自定义函数启动

```bash
python train.py \
    --custom-generate-function-path custom_generate.py \
    --max-turns 5 \
    --prompt-data /path/to/agent_data.jsonl \
    ${MODEL_ARGS[@]}
```

完整的多轮搜索示例请参见 `examples/search-r1/`。

---

## 配置参考

### 三类参数

slime 使用三类参数：

**1. Megatron 参数**（直接传递）：
```bash
--tensor-model-parallel-size 2
--pipeline-model-parallel-size 1
--num-layers 32
--hidden-size 4096
```

**2. SGLang 参数**（以 `--sglang-` 为前缀）：
```bash
--sglang-mem-fraction-static 0.8
--sglang-context-length 8192
--sglang-log-level INFO
```

**3. slime 参数**：
```bash
# Resource allocation
--actor-num-nodes 1
--actor-num-gpus-per-node 8
--rollout-num-gpus 8
--colocate  # Share GPUs between training/inference

# Data
--prompt-data /path/to/data.jsonl
--input-key prompt
--label-key label

# Training loop
--num-rollout 3000
--rollout-batch-size 32
--n-samples-per-prompt 8
--global-batch-size 256

# Algorithm
--advantage-estimator grpo  # or: gspo, ppo, reinforce_plus_plus
--use-kl-loss
--kl-loss-coef 0.001
```

### 关键约束

```
rollout_batch_size × n_samples_per_prompt = global_batch_size × num_steps_per_rollout
```

示例：32 × 8 = 256 × 1

---

## 数据缓冲区系统

slime 的数据缓冲区支持灵活的数据管理：

### 基本数据源

```python
class RolloutDataSource:
    def get_samples(self, num_samples):
        """Fetch prompts from dataset."""
        return self.dataset.sample(num_samples)

    def add_samples(self, samples):
        """Called after generation (no-op by default)."""
        pass
```

### 带缓冲区的数据源（离策略）

```python
class RolloutDataSourceWithBuffer(RolloutDataSource):
    def __init__(self):
        self.buffer = []

    def add_samples(self, samples):
        """Store generated samples for reuse."""
        self.buffer.extend(samples)

    def buffer_filter(self, args, buffer, num_samples):
        """Custom selection logic (prioritized, stratified, etc.)."""
        return select_best(buffer, num_samples)
```

---

## 常见问题与解决方案

### 问题：SGLang 引擎崩溃

**症状**：推理引擎在训练过程中途退出

**解决方案**：
```bash
# Enable fault tolerance
--use-fault-tolerance

# Increase memory allocation
--sglang-mem-fraction-static 0.85

# Reduce batch size
--rollout-batch-size 16
```

### 问题：权重同步超时

**症状**：rollout 完成后训练卡住

**解决方案**：
```bash
# Increase sync interval
--update-weights-interval 5

# Use colocated mode (no network transfer)
--colocate
```

### 问题：训练期间内存不足

**症状**：反向传播过程中出现 CUDA OOM

**解决方案**：
```bash
# Enable gradient checkpointing
--recompute-activations

# Reduce micro-batch size
--micro-batch-size 1

# Enable sequence parallelism
--sequence-parallel
```

### 问题：数据加载缓慢

**症状**：获取数据期间 GPU 处于空闲状态

**解决方案**：
```bash
# 增加数据工作进程
--num-data-workers 4

# 使用流式数据集
--streaming-data
```

---

## 支持的模型

| 模型系列 | 配置 |
|--------------|----------------|
| GLM | GLM-4.5, GLM-4.6, GLM-4.7, GLM-Z1-9B |
| Qwen | Qwen3 (4B, 8B, 30B-A3B), Qwen3-MoE, Qwen2.5 |
| DeepSeek | V3, V3.1, R1 |
| Llama | Llama 3 (8B, 70B) |
| 其他 | Kimi K2, Moonlight-16B |

每个模型都在 `scripts/models/` 中提供了预配置脚本。

---

## 高级主题

### 共置模式

在训练和推理之间共享 GPU，以减少内存占用：

```bash
python train.py \
    --colocate \
    --actor-num-gpus-per-node 8 \
    --sglang-mem-fraction-static 0.4 \
    ${MODEL_ARGS[@]}
```

### 自定义奖励模型

```python
# custom_rm.py
class CustomRewardModel:
    def __init__(self, model_path):
        self.model = load_model(model_path)

    def compute_reward(self, prompts, responses):
        inputs = self.tokenize(prompts, responses)
        scores = self.model(inputs)
        return scores.tolist()
```

```bash
--custom-rm-path custom_rm.py
```

### 评估多任务

```bash
--eval-prompt-data aime /path/to/aime.jsonl \
--eval-prompt-data gsm8k /path/to/gsm8k.jsonl \
--n-samples-per-eval-prompt 16
```

---

## 资源

- **文档**：https://thudm.github.io/slime/
- **GitHub**：https://github.com/THUDM/slime
- **博客**：https://lmsys.org/blog/2025-07-09-slime/
- **示例**：参见 `examples/` 目录，其中包含 14 个以上的完整示例