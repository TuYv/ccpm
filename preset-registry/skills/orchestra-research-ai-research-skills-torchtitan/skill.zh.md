---
name: distributed-llm-pretraining-torchtitan
description: Provides PyTorch-native distributed LLM pretraining using torchtitan with 4D parallelism (FSDP2, TP, PP, CP). Use when pretraining Llama 3.1, DeepSeek V3, or custom models at scale from 8 to 512+ GPUs with Float8, torch.compile, and distributed checkpointing.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Model Architecture, Distributed Training, TorchTitan, FSDP2, Tensor Parallel, Pipeline Parallel, Context Parallel, Float8, Llama, Pretraining]
dependencies: [torch>=2.6.0, torchtitan>=0.2.0, torchao>=0.5.0]
---
# TorchTitan - PyTorch 原生分布式 LLM 预训练

## 快速开始

TorchTitan 是 PyTorch 官方的大规模 LLM 预训练平台，支持可组合的 4D 并行（FSDP2、TP、PP、CP），在 H100 GPU 上相比基线实现了 65% 以上的加速。

**安装**：
```bash
# From PyPI (stable)
pip install torchtitan

# From source (latest features, requires PyTorch nightly)
git clone https://github.com/pytorch/torchtitan
cd torchtitan
pip install -r requirements.txt
```

**下载分词器**：
```bash
# Get HF token from https://huggingface.co/settings/tokens
python scripts/download_hf_assets.py --repo_id meta-llama/Llama-3.1-8B --assets tokenizer --hf_token=...
```

**在 8 个 GPU 上开始训练**：
```bash
CONFIG_FILE="./torchtitan/models/llama3/train_configs/llama3_8b.toml" ./run_train.sh
```

## 常见工作流

### 工作流 1：在单节点上预训练 Llama 3.1 8B

复制此检查清单：

```
Single Node Pretraining:
- [ ] Step 1: Download tokenizer
- [ ] Step 2: Configure training
- [ ] Step 3: Launch training
- [ ] Step 4: Monitor and checkpoint
```

**步骤 1：下载分词器**

```bash
python scripts/download_hf_assets.py \
  --repo_id meta-llama/Llama-3.1-8B \
  --assets tokenizer \
  --hf_token=YOUR_HF_TOKEN
```

**步骤 2：配置训练**

编辑或创建一个 TOML 配置文件：

```toml
# llama3_8b_custom.toml
[job]
dump_folder = "./outputs"
description = "Llama 3.1 8B training"

[model]
name = "llama3"
flavor = "8B"
hf_assets_path = "./assets/hf/Llama-3.1-8B"

[optimizer]
name = "AdamW"
lr = 3e-4

[lr_scheduler]
warmup_steps = 200

[training]
local_batch_size = 2
seq_len = 8192
max_norm = 1.0
steps = 1000
dataset = "c4"

[parallelism]
data_parallel_shard_degree = -1  # Use all GPUs for FSDP

[activation_checkpoint]
mode = "selective"
selective_ac_option = "op"

[checkpoint]
enable = true
folder = "checkpoint"
interval = 500
```

**步骤 3：启动训练**

```bash
# 8 GPUs on single node
CONFIG_FILE="./llama3_8b_custom.toml" ./run_train.sh

# Or explicitly with torchrun
torchrun --nproc_per_node=8 \
  -m torchtitan.train \
  --job.config_file ./llama3_8b_custom.toml
```

**步骤 4：监控并创建检查点**

TensorBoard 日志保存到 `./outputs/tb/`：
```bash
tensorboard --logdir ./outputs/tb
```

### 工作流 2：使用 SLURM 进行多节点训练

```
Multi-Node Training:
- [ ] Step 1: Configure parallelism for scale
- [ ] Step 2: Set up SLURM script
- [ ] Step 3: Submit job
- [ ] Step 4: Resume from checkpoint
```

**步骤 1：配置可扩展的并行策略**

在 256 个 GPU（32 个节点）上训练 70B 模型：
```toml
[parallelism]
data_parallel_shard_degree = 32  # FSDP across 32 ranks
tensor_parallel_degree = 8        # TP within node
pipeline_parallel_degree = 1      # No PP for 70B
context_parallel_degree = 1       # Increase for long sequences
```

**步骤 2：设置 SLURM 脚本**

```bash
#!/bin/bash
#SBATCH --job-name=llama70b
#SBATCH --nodes=32
#SBATCH --ntasks-per-node=8
#SBATCH --gpus-per-node=8

srun torchrun \
  --nnodes=32 \
  --nproc_per_node=8 \
  --rdzv_backend=c10d \
  --rdzv_endpoint=$MASTER_ADDR:$MASTER_PORT \
  -m torchtitan.train \
  --job.config_file ./llama3_70b.toml
```

**步骤 3：提交作业**

```bash
sbatch multinode_trainer.slurm
```

**步骤 4：从检查点恢复**

如果配置的文件夹中存在检查点，训练会自动恢复。

### 工作流 3：为 H100 启用 Float8 训练

Float8 可在 H100 GPU 上提速 30-50%。

```
Float8 Training:
- [ ] Step 1: Install torchao
- [ ] Step 2: Configure Float8
- [ ] Step 3: Launch with compile
```

**步骤 1：安装 torchao**

```bash
USE_CPP=0 pip install git+https://github.com/pytorch/ao.git
```

**步骤 2：配置 Float8**

添加到你的 TOML 配置中：
```toml
[model]
converters = ["quantize.linear.float8"]

[quantize.linear.float8]
enable_fsdp_float8_all_gather = true
precompute_float8_dynamic_scale_for_fsdp = true
filter_fqns = ["output"]  # Exclude output layer

[compile]
enable = true
components = ["model", "loss"]
```

**步骤 3：使用编译启动**

```bash
CONFIG_FILE="./llama3_8b.toml" ./run_train.sh \
  --model.converters="quantize.linear.float8" \
  --quantize.linear.float8.enable_fsdp_float8_all_gather \
  --compile.enable
```

### 工作流 4：面向 405B 模型的 4D 并行

```
4D Parallelism (FSDP + TP + PP + CP):
- [ ] Step 1: Create seed checkpoint
- [ ] Step 2: Configure 4D parallelism
- [ ] Step 3: Launch on 512 GPUs
```

**步骤 1：创建种子检查点**

要在各个 PP 阶段之间实现一致的初始化：
```bash
NGPU=1 CONFIG_FILE=./llama3_405b.toml ./run_train.sh \
  --checkpoint.enable \
  --checkpoint.create_seed_checkpoint \
  --parallelism.data_parallel_shard_degree 1 \
  --parallelism.tensor_parallel_degree 1 \
  --parallelism.pipeline_parallel_degree 1
```

**步骤 2：配置 4D 并行**

```toml
[parallelism]
data_parallel_shard_degree = 8   # FSDP
tensor_parallel_degree = 8       # TP within node
pipeline_parallel_degree = 8     # PP across nodes
context_parallel_degree = 1      # CP for long sequences

[training]
local_batch_size = 32
seq_len = 8192
```

**步骤 3：在 512 个 GPU 上启动**

```bash
# 64 nodes x 8 GPUs = 512 GPUs
srun torchrun --nnodes=64 --nproc_per_node=8 \
  -m torchtitan.train \
  --job.config_file ./llama3_405b.toml
```

## 何时使用 TorchTitan 以及替代方案

**在以下情况下使用 TorchTitan：**
- 从头开始预训练 LLM（8B 到 405B+）
- 需要不依赖第三方依赖的 PyTorch 原生解决方案
- 需要可组合的 4D 并行（FSDP2、TP、PP、CP）
- 在支持 Float8 的 H100 上训练
- 希望检查点能够与 torchtune/HuggingFace 互操作

**在以下情况下使用替代方案：**
- **Megatron-LM**：面向仅使用 NVIDIA 的部署，可获得最高性能
- **DeepSpeed**：更广泛的 ZeRO 优化生态，支持推理
- **Axolotl/TRL**：用于微调而非预训练
- **LitGPT**：用于教学和较小规模的训练

## 常见问题

**问题：大型模型显存不足**

启用激活检查点并减小批次大小：
```toml
[activation_checkpoint]
mode = "full"  # Instead of "selective"

[training]
local_batch_size = 1
```

或者使用梯度累积：
```toml
[training]
local_batch_size = 1
global_batch_size = 32  # Accumulates gradients
```

**问题：异步 collective 导致 TP 内存占用过高**

设置环境变量：
```bash
export TORCH_NCCL_AVOID_RECORD_STREAMS=1
```

**问题：Float8 训练没有提速**

Float8 仅适用于较大的 GEMM。过滤掉较小的层：
```toml
[quantize.linear.float8]
filter_fqns = ["attention.wk", "attention.wv", "output", "auto_filter_small_kn"]
```

**问题：更改并行策略后检查点加载失败**

使用 DCP 的重分片功能：
```bash
# Convert sharded checkpoint to single file
python -m torch.distributed.checkpoint.format_utils \
  dcp_to_torch checkpoint/step-1000 checkpoint.pt
```

**问题：流水线并行初始化**

首先创建种子检查点（参见工作流 4，第 1 步）。

## 支持的模型

| 模型 | 规模 | 状态 |
|-------|-------|--------|
| Llama 3.1 | 8B、70B、405B | 生产级 |
| Llama 4 | 各种规模 | 实验性 |
| DeepSeek V3 | 16B、236B、671B（MoE） | 实验性 |
| GPT-OSS | 20B、120B（MoE） | 实验性 |
| Qwen 3 | 各种规模 | 实验性 |
| Flux | Diffusion | 实验性 |

## 性能基准（H100）

| 模型 | GPU 数量 | 并行策略 | TPS/GPU | 技术 |
|-------|------|-------------|---------|------------|
| Llama 8B | 8 | FSDP | 5,762 | 基线 |
| Llama 8B | 8 | FSDP+compile+FP8 | 8,532 | +48% |
| Llama 70B | 256 | FSDP+TP+AsyncTP | 876 | 2D 并行 |
| Llama 405B | 512 | FSDP+TP+PP | 128 | 3D 并行 |

## 高级主题

**FSDP2 配置**：详细的 FSDP2 与 FSDP1 对比以及 ZeRO 等价方案，请参见 [references/fsdp.md](references/fsdp.md)。

**Float8 训练**：张量级与行级缩放方案，请参见 [references/float8.md](references/float8.md)。

**检查点**：有关 HuggingFace 转换和异步检查点，请参见 [references/checkpoint.md](references/checkpoint.md)。

**添加自定义模型**：有关 TrainSpec 协议，请参见 [references/custom-models.md](references/custom-models.md)。

## 资源

- GitHub：https://github.com/pytorch/torchtitan
- 论文：https://arxiv.org/abs/2410.06511
- ICLR 2025：https://iclr.cc/virtual/2025/poster/29620
- PyTorch 论坛：https://discuss.pytorch.org/c/distributed/torchtitan/44