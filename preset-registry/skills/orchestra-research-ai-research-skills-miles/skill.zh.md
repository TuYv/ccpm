---
name: miles-rl-training
description: Provides guidance for enterprise-grade RL training using miles, a production-ready fork of slime. Use when training large MoE models with FP8/INT4, needing train-inference alignment, or requiring speculative RL for maximum throughput.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Reinforcement Learning, MoE, FP8, INT4, Enterprise, SGLang, Megatron-LM]
dependencies: [sglang-router>=0.2.3, ray, torch>=2.0.0, transformers>=4.40.0]
---
# miles：面向大规模模型训练的企业级 RL

miles 是一个高性能、企业就绪的 RL 框架，针对大规模模型后训练进行了优化。它是 slime 面向生产环境的分支，解决了 MoE 训练稳定性、低精度训练以及训练-推理对齐方面的关键挑战。

## 何时使用 miles

**在以下情况中选择 miles：**
- 训练 1TB 以上的 MoE 模型（DeepSeek V3、Qwen3-MoE）
- 进行 FP8 或 INT4 量化感知训练
- 需要逐比特一致的训练-推理对齐
- 使用推测式 RL 实现最大吞吐量
- 需要具备企业支持的生产级稳定性

**在以下情况中考虑其他方案：**
- 需要研究级原始版本 → 使用 **slime**
- 需要灵活切换后端 → 使用 **verl**
- 需要 PyTorch 原生抽象 → 使用 **torchforge**

## 主要特性

### 低精度训练
- **统一 FP8**：推理和训练全流程均采用 FP8
- **INT4 QAT**：在单机显存（H200）上运行 1TB 模型
- **Rollout Routing Replay (R3)**：为 MoE 实现逐比特一致的专家对齐

### 性能优化
- **推测式 RL**：使用在线 SFT 草稿模型，将 rollout 速度提升 25% 以上
- **零拷贝权重同步**：通过 CUDA IPC 实现零拷贝映射
- **部分 Rollout**：复用尚未完成的轨迹

### 训练-推理对齐
- **TIS/MIS**：使用截断/掩码重要性采样进行离策略校正
- **内核级优化**：集成 FlashAttention-3、DeepGEMM

## 安装

```bash
# Recommended: Docker
docker pull radixark/miles:latest
docker run --rm --gpus all --ipc=host --shm-size=16g \
  -it radixark/miles:latest /bin/bash

# From source
git clone https://github.com/radixark/miles.git
cd miles
pip install -r requirements.txt
pip install -e .
```

## 快速开始

miles 继承了 slime 的配置系统。基础训练：

```bash
python train.py \
    --advantage-estimator grpo \
    --model-name qwen3-30b-a3b \
    --hf-checkpoint /path/to/qwen3-30b-a3b-hf \
    --rollout-batch-size 512 \
    --n-samples-per-prompt 8
```

---

## 工作流 1：大型 MoE 训练

使用此工作流训练 DeepSeek V3 或 Qwen3-MoE 等大型 MoE 模型。

### 前置条件检查清单
- [ ] 支持 FP8 的 H100/H200 GPU
- [ ] MoE 模型（DeepSeek V3、Qwen3-MoE）
- [ ] 包含 miles 的 Docker 环境

### 第 1 步：环境设置

```bash
# FP8 block scaling (recommended for stability)
export NVTE_FP8_BLOCK_SCALING_FP32_SCALES=1
export CUDA_DEVICE_MAX_CONNECTIONS=1
```

### 第 2 步：配置训练

```bash
python train.py \
    --actor-num-gpus-per-node 8 \
    --rollout-num-gpus 8 \
    --hf-checkpoint /path/to/deepseek-v3 \
    --advantage-estimator grpo \
    --tensor-model-parallel-size 8 \
    --expert-model-parallel-size 4 \
    --prompt-data /path/to/data.jsonl \
    --num-rollout 3000
```

### 验证检查清单
- [ ] 模型加载无错误
- [ ] 路由决策保持一致
- [ ] 损失值中不存在 NaN/Inf

---

## 工作流 2：推测式 RL 训练

使用此工作流，通过 EAGLE 推测解码实现最大的 rollout 吞吐量。

### 推测式 RL 的工作原理

1. 小型草稿模型生成候选 token
2. 目标模型并行进行验证
3. 通过在线 SFT 更新草稿模型，以跟踪策略

### 第 1 步：启用推测式解码

miles 通过 SGLang 支持 EAGLE 推测式解码：

```bash
python train.py \
    --actor-num-gpus-per-node 8 \
    --hf-checkpoint /path/to/target-model \
    --sglang-speculative-algorithm EAGLE \
    --sglang-speculative-num-steps 3 \
    --sglang-speculative-eagle-topk 1 \
    --sglang-speculative-num-draft-tokens 4 \
    --sglang-speculative-draft-model-path /path/to/draft-model \
    --advantage-estimator grpo \
    --prompt-data /path/to/data.jsonl
```

### 第 2 步：启用在线 MTP 训练（可选）

如需在训练期间对草稿模型进行在线 SFT：

```bash
--mtp-num-layers 1 \
--enable-mtp-training \
--mtp-loss-scaling-factor 0.2
```

**注意**：在线 MTP 训练需要包含 MTP 权重的 torch dist checkpoint。从 HuggingFace 转换 checkpoint 时，请添加 `--mtp-num-layers 1`。

### 预期加速效果

- **标准 rollout**：基准
- **推测式 RL**：rollout 速度提升 25-40%
- **结合部分 rollout**：吞吐量额外提升 10-15%

---

## 配置参考

miles 继承 slime 的所有参数。完整列表请参阅 [slime API 参考](../slime/references/api-reference.md)。

### 集群资源（来自 slime）

```bash
--actor-num-nodes 1
--actor-num-gpus-per-node 8
--rollout-num-gpus 8
--rollout-num-gpus-per-engine 2
--colocate
```

### Megatron 并行策略（来自 slime）

```bash
--tensor-model-parallel-size 8
--pipeline-model-parallel-size 2
--expert-model-parallel-size 4    # MoE expert parallelism
```

### 推测式解码（miles 特有）

```bash
--sglang-speculative-algorithm EAGLE
--sglang-speculative-num-steps 3
--sglang-speculative-eagle-topk 1
--sglang-speculative-num-draft-tokens 4
--sglang-enable-draft-weights-cpu-backup
--sglang-speculative-draft-model-path /your/draft/model/path
```

### 在线 MTP 训练（miles 特有）

```bash
--mtp-num-layers 1
--enable-mtp-training
--mtp-loss-scaling-factor 0.2
```

---

## 主要功能（概念）

miles 中记录了以下功能，但具体 CLI 标志可能有所不同。请查阅 miles 仓库以获取最新配置。

### 统一 FP8 流水线

端到端 FP8 采样和训练，消除由量化引起的不一致问题，避免 MoE 模型中的 RL 崩溃。

### Rollout 路由重放（R3）

在 SGLang 推理期间记录专家路由决策，并在 Megatron 训练期间重放这些决策，以实现专家级的逐比特对齐。

**R3 的工作原理**：
1. 在 SGLang 推理期间记录专家路由决策
2. 路由决策存储在 `sample.rollout_routed_experts` 中
3. 在 Megatron 训练期间重放路由，而不是重新计算
4. 确保训练与推理选择完全相同的专家

### INT4 量化感知训练

支持在单机上部署 1TB 以上的模型（例如，在 H200 上）。

**INT4 的显存节省效果**：

| 模型规模 | BF16 显存 | INT4 显存 | 降幅 |
|------------|-----------|-----------|-----------|
| 70B | 140GB | 45GB | 3.1x |
| 235B | 470GB | 150GB | 3.1x |
| 671B | 1.3TB | 420GB | 3.1x |

### 训练与推理对齐

miles 通过以下技术实现训练与推理之间“恰好为 0 的 KL 散度”：
- Flash Attention 3
- DeepGEMM
- 来自 Thinking Machines Lab 的批次无关内核
- `torch.compile` 集成

---

## 示例数据结构

miles 使用与 slime 相同的 `Sample` 数据类，并通过 `rollout_routed_experts` 字段实现 MoE 路由重放：

```python
@dataclass
class Sample:
    prompt: str | list[dict]
    tokens: list[int]
    response: str
    reward: float | dict
    loss_mask: list[int]
    status: Status
    metadata: dict
    rollout_log_probs: list[float]
    rollout_routed_experts: list[list[int]]  # MoE routing for R3
```

完整的 Sample 定义请参阅 [slime API 参考](../slime/references/api-reference.md)。

---

## 常见问题及解决方案

### 问题：FP8 训练崩溃

**症状**：损失爆炸、出现 NaN 值

**解决方案**：
- 使用块缩放：`export NVTE_FP8_BLOCK_SCALING_FP32_SCALES=1`
- 降低学习率：`--lr 5e-7`
- 确保训练和推理之间的 MoE 路由保持一致

### 问题：推测草稿漂移

**症状**：接受率随时间降低

**解决方案**：
- 启用在线 MTP 训练，使草稿模型保持对齐
- 减少推测步数：`--sglang-speculative-num-steps 2`
- 使用 CPU 备份：`--sglang-enable-draft-weights-cpu-backup`

### 问题：训练与推理不匹配

**症状**：策略发散、奖励崩溃

**解决方案**：
- 使用 TIS 进行离策略校正：`--use-tis --tis-threshold 0.9`
- 验证 SGLang 与 Megatron 之间的对数概率是否匹配
- 为 MoE 模型启用 R3

---

## 支持的模型

| 系列 | 模型 | MoE 支持 |
|--------|--------|-------------|
| DeepSeek | R1, V3, V3.2 | 完全支持 |
| Qwen | 2, 2.5, 3（包括 MoE） | 完全支持 |
| Llama | 3, 3.1, 3.3, 4 | 仅支持稠密模型 |
| Gemma | 2, 3, 3N | 仅支持稠密模型 |
| GLM | 4.5, 4.6, 4.7 | 仅支持稠密模型 |
| MiniMax | M2, M2.1 | 完全支持 |

---

## 资源

- **GitHub**：https://github.com/radixark/miles
- **介绍博客**：https://lmsys.org/blog/2025-11-19-miles/
- **Slime（上游项目）**：https://github.com/THUDM/slime
- **SGLang**：https://github.com/sgl-project/sglang