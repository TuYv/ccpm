---
name: simpo-training
description: Simple Preference Optimization for LLM alignment. Reference-free alternative to DPO with better performance (+6.4 points on AlpacaEval 2.0). No reference model needed, more efficient than DPO. Use for preference alignment when want simpler, faster training than DPO/PPO.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Post-Training, SimPO, Preference Optimization, Alignment, DPO Alternative, Reference-Free, LLM Alignment, Efficient Training]
dependencies: [torch, transformers, datasets, trl, accelerate]
---
# SimPO - Simple偏好优化

## 快速开始

SimPO 是一种无需参考模型的偏好优化方法，不需要参考模型即可超越 DPO 的性能。

**安装**：
```bash
# Create environment
conda create -n simpo python=3.10 && conda activate simpo

# Install PyTorch 2.2.2
# Visit: https://pytorch.org/get-started/locally/

# Install alignment-handbook
git clone https://github.com/huggingface/alignment-handbook.git
cd alignment-handbook
python -m pip install .

# Install Flash Attention 2
python -m pip install flash-attn --no-build-isolation
```

**训练**（Mistral 7B）：
```bash
ACCELERATE_LOG_LEVEL=info accelerate launch \
  --config_file accelerate_configs/deepspeed_zero3.yaml \
  scripts/run_simpo.py \
  training_configs/mistral-7b-base-simpo.yaml
```

## 常见工作流

### 工作流 1：从基础模型开始训练（Mistral 7B）

**配置**（`mistral-7b-base-simpo.yaml`）：
```yaml
# Model
model_name_or_path: mistralai/Mistral-7B-v0.1
torch_dtype: bfloat16

# Dataset
dataset_mixer:
  HuggingFaceH4/ultrafeedback_binarized: 1.0
dataset_splits:
  - train_prefs
  - test_prefs

# SimPO hyperparameters
beta: 2.0                  # Reward scaling (2.0-10.0)
gamma_beta_ratio: 0.5       # Target margin (0-1)
loss_type: sigmoid          # sigmoid or hinge
sft_weight: 0.0             # Optional SFT regularization

# Training
learning_rate: 5e-7         # Critical: 3e-7 to 1e-6
num_train_epochs: 1
per_device_train_batch_size: 1
gradient_accumulation_steps: 8

# Output
output_dir: ./outputs/mistral-7b-simpo
```

**启动训练**：
```bash
accelerate launch --config_file accelerate_configs/deepspeed_zero3.yaml \
  scripts/run_simpo.py training_configs/mistral-7b-base-simpo.yaml
```

### 工作流 2：微调 instruct 模型（Llama 3 8B）

**配置**（`llama3-8b-instruct-simpo.yaml`）：
```yaml
model_name_or_path: meta-llama/Meta-Llama-3-8B-Instruct

dataset_mixer:
  argilla/ultrafeedback-binarized-preferences-cleaned: 1.0

beta: 2.5
gamma_beta_ratio: 0.5
learning_rate: 5e-7
sft_weight: 0.1             # Add SFT loss to preserve capabilities

num_train_epochs: 1
per_device_train_batch_size: 2
gradient_accumulation_steps: 4
output_dir: ./outputs/llama3-8b-simpo
```

**启动**：
```bash
accelerate launch --config_file accelerate_configs/deepspeed_zero3.yaml \
  scripts/run_simpo.py training_configs/llama3-8b-instruct-simpo.yaml
```

### 工作流 3：推理密集型任务（更低的 LR）

**用于数学/代码任务**：
```yaml
model_name_or_path: deepseek-ai/deepseek-math-7b-base

dataset_mixer:
  argilla/distilabel-math-preference-dpo: 1.0

beta: 5.0                   # Higher for stronger signal
gamma_beta_ratio: 0.7       # Larger margin
learning_rate: 3e-7         # Lower LR for reasoning
sft_weight: 0.0

num_train_epochs: 1
per_device_train_batch_size: 1
gradient_accumulation_steps: 16
```

## 何时使用 SimPO 与替代方案

**以下情况使用 SimPO**：
- 希望训练比 DPO 更简单（无需参考模型）
- 拥有偏好数据（chosen/rejected 对）
- 需要比 DPO 更好的性能
- 计算资源有限
- 单节点训练即可满足需求

**算法选择**：
- **SimPO**：最简单、性能最佳、无需参考模型
- **DPO**：需要参考模型基线，更保守
- **PPO**：控制程度最高，需要奖励模型，配置复杂
- **GRPO**：内存高效的强化学习，无需 critic

**以下情况改用替代方案**：
- **OpenRLHF**：多节点分布式训练、PPO/GRPO
- **TRL**：需要在一个框架中使用多种方法
- **DPO**：成熟的基线对比方案

## 常见问题

**问题：损失发散**

降低学习率：
```yaml
learning_rate: 3e-7  # Reduce from 5e-7
```

降低 beta：
```yaml
beta: 1.0  # Reduce from 2.0
```

**问题：模型遗忘已有能力**

添加 SFT 正则化：
```yaml
sft_weight: 0.1  # Add SFT loss component
```

**问题：偏好区分度不佳**

增大 beta 和间隔：
```yaml
beta: 5.0            # Increase from 2.0
gamma_beta_ratio: 0.8  # Increase from 0.5
```

**问题：训练过程中出现 OOM**

减小批次大小：
```yaml
per_device_train_batch_size: 1
gradient_accumulation_steps: 16  # Maintain effective batch
```

启用梯度检查点：
```yaml
gradient_checkpointing: true
```

## 进阶主题

**损失函数**：关于 sigmoid 损失与 hinge 损失的对比、数学公式以及各自的适用场景，请参阅 [references/loss-functions.md](references/loss-functions.md)。

**超参数调优**：关于 beta、gamma、学习率的选择指南以及针对不同模型规模的建议，请参阅 [references/hyperparameters.md](references/hyperparameters.md)。

**数据集准备**：关于偏好数据格式、质量过滤以及自定义数据集创建，请参阅 [references/datasets.md](references/datasets.md)。

## 硬件要求

- **GPU**：建议使用 NVIDIA A100/H100
- **显存**：
  - 7B 模型：1× A100 40GB（DeepSpeed ZeRO-3）
  - 8B 模型：2× A100 40GB
  - 70B 模型：8× A100 80GB
- **单节点**：DeepSpeed ZeRO-3 即可满足
- **混合精度**：建议使用 BF16

**内存优化**：
- DeepSpeed ZeRO-3（默认配置）
- 梯度检查点
- Flash Attention 2

## 资源

- 论文：https://arxiv.org/abs/2405.14734 （NeurIPS 2024）
- GitHub：https://github.com/princeton-nlp/SimPO
- 模型：https://huggingface.co/princeton-nlp
- Alignment Handbook：https://github.com/huggingface/alignment-handbook
