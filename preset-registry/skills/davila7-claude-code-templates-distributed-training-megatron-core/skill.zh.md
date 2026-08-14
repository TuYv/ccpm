---
name: training-llms-megatron
description: Trains large language models (2B-462B parameters) using NVIDIA Megatron-Core with advanced parallelism strategies. Use when training models >1B parameters, need maximum GPU efficiency (47% MFU on H100), or require tensor/pipeline/sequence/context/expert parallelism. Production-ready framework used for Nemotron, LLaMA, DeepSeek.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Megatron-Core, Large-Scale Training, NVIDIA, Tensor Parallelism, Pipeline Parallelism, Model Parallelism, H100, Distributed Training, Production]
dependencies: [megatron-core, torch, apex, transformer-engine]
---
# Megatron-Core - 大规模 LLM 训练

## 快速开始

Megatron-Core 通过先进的并行策略，在 H100 GPU 上以最高 47% 的模型 FLOP 利用率训练参数规模从 2B 到 462B 的 LLM。

**安装**：
```bash
# Docker (recommended)
docker run --gpus all -it --rm nvcr.io/nvidia/pytorch:25.04-py3

# Or pip
pip install megatron-core
```

**简单的分布式训练**：
```bash
# Train with 2 GPUs using data parallelism
torchrun --nproc_per_node=2 examples/run_simple_mcore_train_loop.py

# Or LLaMA-3 8B training
./examples/llama/train_llama3_8b_fp8.sh
```

## 常见工作流

### 工作流 1：使用 3D 并行训练 LLaMA 风格模型

复制此检查清单：

```
LLaMA Training Setup:
- [ ] Step 1: Choose parallelism configuration
- [ ] Step 2: Configure training hyperparameters
- [ ] Step 3: Launch distributed training
- [ ] Step 4: Monitor performance metrics
```

**步骤 1：选择并行配置**

模型大小决定并行策略：

| 模型大小 | GPU 数量 | 张量并行 | 流水线并行 | 数据并行 | 上下文并行 |
|------------|------|-----------------|-------------------|---------------|------------------|
| 7B | 8 | 1 | 1 | 8 | 1 |
| 13B | 8 | 2 | 1 | 4 | 1 |
| 70B | 64 | 4 | 4 | 4 | 1 |
| 405B | 128 | 8 | 8 | 2 | 2 |

**步骤 2：配置训练超参数**

```bash
#!/bin/bash
# train_llama_70b.sh

GPUS_PER_NODE=8
NNODES=8  # 64 GPUs total
TP=4      # Tensor parallel
PP=4      # Pipeline parallel
CP=1      # Context parallel

# LLaMA 70B configuration
MODEL_SIZE=70  # Billion parameters
HIDDEN_SIZE=8192
NUM_LAYERS=80
NUM_HEADS=64
SEQ_LENGTH=4096

# Training hyperparameters
MICRO_BATCH=1
GLOBAL_BATCH=1024
LR=3e-4

torchrun \
  --nproc_per_node=$GPUS_PER_NODE \
  --nnodes=$NNODES \
  pretrain_gpt.py \
  --tensor-model-parallel-size $TP \
  --pipeline-model-parallel-size $PP \
  --context-parallel-size $CP \
  --sequence-parallel \
  --num-layers $NUM_LAYERS \
  --hidden-size $HIDDEN_SIZE \
  --num-attention-heads $NUM_HEADS \
  --seq-length $SEQ_LENGTH \
  --max-position-embeddings $SEQ_LENGTH \
  --micro-batch-size $MICRO_BATCH \
  --global-batch-size $GLOBAL_BATCH \
  --lr $LR \
  --train-iters 100000 \
  --lr-decay-style cosine \
  --lr-warmup-iters 2000 \
  --weight-decay 0.1 \
  --clip-grad 1.0 \
  --bf16 \
  --use-mcore-models \
  --transformer-impl transformer_engine \
  --data-path /path/to/data \
  --vocab-file /path/to/vocab.json \
  --merge-file /path/to/merges.txt
```

**步骤 3：启动分布式训练**

```bash
# Single node (8 GPUs)
bash train_llama_70b.sh

# Multi-node with SLURM
sbatch --nodes=8 --gpus-per-node=8 train_llama_70b.sh
```

**步骤 4：监控性能指标**

需要跟踪的关键指标：
```
Model FLOP Utilization (MFU): Target >40% on H100
Throughput: Tokens/sec/GPU
Memory usage: <80GB per GPU for 70B model
Loss: Should decrease steadily
```

### 工作流 2：配置混合专家（MoE）训练

适用于 Mixtral 等稀疏 MoE 模型。

```
MoE Training:
- [ ] Step 1: Configure expert parallelism
- [ ] Step 2: Set MoE hyperparameters
- [ ] Step 3: Launch training with EP
```

**步骤 1：配置专家并行**

```bash
# Mixtral 8x7B example
TENSOR_PARALLEL=2
PIPELINE_PARALLEL=1
EXPERT_PARALLEL=4  # Split 8 experts across 4 GPUs
DATA_PARALLEL=4

TOTAL_GPUS=$((TENSOR_PARALLEL * PIPELINE_PARALLEL * EXPERT_PARALLEL * DATA_PARALLEL))
# = 2 * 1 * 4 * 4 = 32 GPUs
```

**步骤 2：设置 MoE 超参数**

```bash
torchrun \
  --nproc_per_node=8 \
  pretrain_gpt.py \
  --tensor-model-parallel-size 2 \
  --pipeline-model-parallel-size 1 \
  --expert-model-parallel-size 4 \
  --num-experts 8 \
  --moe-router-topk 2 \
  --moe-router-load-balancing-type aux_loss \
  --moe-aux-loss-coeff 0.01 \
  --hidden-size 4096 \
  --num-layers 32 \
  --num-attention-heads 32 \
  --seq-length 4096 \
  --max-position-embeddings 4096 \
  --bf16 \
  --use-mcore-models \
  --transformer-impl transformer_engine \
  --data-path /path/to/data \
  --vocab-file /path/to/vocab.json \
  --merge-file /path/to/merges.txt
```

**步骤 3：使用 EP 启动训练**

专家并行将不同的专家分布到各个 GPU 上，在保持容量的同时减少内存占用。

```
Memory without EP: 8 experts × 7B = 56GB per GPU
Memory with EP=4: 2 experts × 7B = 14GB per GPU
Savings: 75% memory reduction
```

### 工作流 3：优化以获得最大吞吐量

在 H100 上实现 47% 的 MFU。

```
Performance Optimization:
- [ ] Step 1: Enable Flash Attention
- [ ] Step 2: Use FP8 precision (H100)
- [ ] Step 3: Optimize micro-batch size
- [ ] Step 4: Tune parallelism degrees
```

**步骤 1：启用优化**

```bash
--use-mcore-models  # Use Megatron Core models
--transformer-impl transformer_engine  # Use Transformer Engine
--sequence-parallel  # Reduce activation memory (use with TP)
```

**步骤 2：使用 FP8 精度（仅限 H100）**

```bash
--fp8-hybrid  # FP8 mixed precision training
# Transformer Engine handles FP8 automatically
```

结果：在 H100 上，相比 BF16 可获得 1.5-2 倍加速。

**步骤 3：优化微批次大小**

找出内存所能容纳的最大微批次：

```bash
# Start with 1, increase until OOM
for MBS in 1 2 4 8; do
  echo "Testing micro-batch-size=$MBS"
  torchrun ... --micro-batch-size $MBS
done
```

典型值：
- 7B 模型：4-8
- 70B 模型：1-2
- 405B 模型：1

**步骤 4：调整并行度**

经验法则：
```
Tensor Parallel: Use ≤8 (limited by NVLink within node)
Pipeline Parallel: Use for >70B models
Context Parallel: Use for sequences >8K tokens
Data Parallel: Fill remaining GPUs
```

在 128 个 H100 上运行 405B 模型的示例：
```
TP=8 (1 node)
PP=8 (across nodes)
CP=2 (long sequences)
DP=1
Total = 8 × 8 × 2 × 1 = 128 GPUs
```

## 何时使用及何时选择替代方案

**在以下情况下使用 Megatron-Core：**
- 训练参数量 >10B 的模型
- 需要最高效率（目标 MFU >40%）
- 使用 NVIDIA GPU（A100、H100）
- 进行大规模生产训练
- 希望对并行策略进行细粒度控制

**在以下情况下改用替代方案：**
- **PyTorch FSDP**：参数量 <70B 的模型、更简单的 API、PyTorch 原生支持
- **DeepSpeed**：设置更简单，适合参数量 <100B 的模型
- **HuggingFace Accelerate**：用于原型设计、工作流更简单
- **LitGPT**：用于教学、单文件实现

## 常见问题

**问题：GPU 利用率低（MFU <30%）**

原因：
1. 微批次过小
2. 并行开销过大
3. 未使用 Flash Attention

解决方法：
```bash
# Increase micro-batch
--micro-batch-size 4  # Was 1

# Enable optimizations
--use-flash-attn
--sequence-parallel

# Reduce TP if >8
--tensor-model-parallel-size 4  # Was 16
```

**问题：内存不足**

通过以下方式减少内存占用：
```bash
--tensor-model-parallel-size 2  # Split model across GPUs
--recompute-granularity full  # Gradient checkpointing
--recompute-method block  # Checkpoint transformer blocks
--recompute-num-layers 1  # Checkpoint every layer
```

或使用 CPU/NVMe 卸载：
```bash
--cpu-optimizer  # Offload optimizer to CPU
--cpu-optimizer-type ADAM  # CPU Adam variant
```

**问题：训练速度低于预期**

检查：
1. **网络瓶颈**：确保已启用 InfiniBand/NVLink
2. **流水线气泡**：使用交错式流水线调度
   ```bash
   --num-layers-per-virtual-pipeline-stage 2
   ```
3. **数据加载**：使用快速数据加载器
   ```bash
   --dataloader-type cyclic
   ```

**问题：损失发散**

稳定训练：
```bash
--lr-warmup-iters 2000  # Longer warmup
--clip-grad 1.0  # Gradient clipping
--init-method-std 0.006  # Smaller init
--attention-dropout 0.0  # No dropout in attention
--hidden-dropout 0.0  # No dropout in FFN
```

## 高级主题

**并行策略**：有关 TP/PP/DP/CP/EP 的详细比较、性能分析以及各自适用场景，请参阅 [references/parallelism-guide.md](references/parallelism-guide.md)。

**性能基准测试**：有关不同模型规模和 GPU 配置下的 MFU 数据，请参阅 [references/benchmarks.md](references/benchmarks.md)。

**生产配置**：有关 LLaMA 3 405B、Nemotron-4 340B 和 DeepSeek-V3 671B 的实际配置，请参阅 [references/production-examples.md](references/production-examples.md)。

**训练方案**：有关 GPT/LLaMA/Mixtral 架构的完整超参数配置，请参阅 [references/training-recipes.md](references/training-recipes.md)。

## 硬件要求

- **GPU**：NVIDIA Ampere+（A100、H100、B200）
  - Turing 可以运行，但速度较慢
  - FP8 需要 Hopper/Ada/Blackwell
- **网络**：多节点需要 InfiniBand 或 400Gb+ 以太网
- **每个 GPU 的内存**：
  - 7B 模型：40GB+
  - 70B 模型：80GB（使用 TP=4）
  - 405B 模型：80GB（使用 TP=8、PP=8）
- **存储**：用于检查点的高速 NVMe（70B+ 模型需要 1TB+）

## 资源

- 文档：https://docs.nvidia.com/megatron-core/
- GitHub：https://github.com/NVIDIA/Megatron-LM
- 论文：
  - "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism" (2019)
  - "Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM" (2021)
- NeMo Framework：https://docs.nvidia.com/nemo-framework/（基于 Megatron-Core 构建）