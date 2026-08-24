---
name: openrlhf-training
description: High-performance RLHF framework with Ray+vLLM acceleration. Use for PPO, GRPO, RLOO, DPO training of large models (7B-70B+). Built on Ray, vLLM, ZeRO-3. 2× faster than DeepSpeedChat with distributed architecture and GPU resource sharing.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Post-Training, OpenRLHF, RLHF, PPO, GRPO, RLOO, DPO, Ray, vLLM, Distributed Training, Large Models, ZeRO-3]
dependencies: [openrlhf, ray, vllm, torch, transformers, deepspeed]
---
# OpenRLHF - 高性能 RLHF 训练

## 快速开始

OpenRLHF 是一个基于 Ray 的 RLHF 框架，针对采用 vLLM 推理加速的分布式训练进行了优化。

**安装**：
```bash
# Launch Docker container
docker run --runtime=nvidia -it --rm --shm-size="10g" --cap-add=SYS_ADMIN \
  -v $PWD:/openrlhf nvcr.io/nvidia/pytorch:25.02-py3 bash

# Uninstall conflicts
sudo pip uninstall xgboost transformer_engine flash_attn pynvml -y

# Install OpenRLHF with vLLM
pip install openrlhf[vllm]
```

**PPO 训练**（混合引擎）：
```bash
ray start --head --node-ip-address 0.0.0.0 --num-gpus 8

ray job submit --address="http://127.0.0.1:8265" \
  --runtime-env-json='{"working_dir": "/openrlhf"}' \
  -- python3 -m openrlhf.cli.train_ppo_ray \
  --ref_num_nodes 1 --ref_num_gpus_per_node 8 \
  --reward_num_nodes 1 --reward_num_gpus_per_node 8 \
  --critic_num_nodes 1 --critic_num_gpus_per_node 8 \
  --actor_num_nodes 1 --actor_num_gpus_per_node 8 \
  --vllm_num_engines 4 --vllm_tensor_parallel_size 2 \
  --colocate_all_models \
  --vllm_gpu_memory_utilization 0.5 \
  --pretrain OpenRLHF/Llama-3-8b-sft-mixture \
  --reward_pretrain OpenRLHF/Llama-3-8b-rm-700k \
  --save_path ./output/llama3-8b-rlhf \
  --micro_train_batch_size 8 --train_batch_size 128 \
  --micro_rollout_batch_size 16 --rollout_batch_size 1024 \
  --max_epochs 1 --prompt_max_len 1024 --generate_max_len 1024 \
  --zero_stage 3 --bf16 \
  --actor_learning_rate 5e-7 --critic_learning_rate 9e-6 \
  --init_kl_coef 0.01 --normalize_reward \
  --gradient_checkpointing --packing_samples \
  --vllm_enable_sleep --deepspeed_enable_sleep
```

**GRPO 训练**（组归一化策略优化）：
```bash
# Same command as PPO, but add:
--advantage_estimator group_norm
```

## 常见工作流

### 工作流 1：完整的 RLHF 流程（SFT → 奖励模型 → PPO）

**步骤 1：训练奖励模型**（DPO）：
```bash
deepspeed --module openrlhf.cli.train_rm \
  --save_path ./output/llama3-8b-rm \
  --save_steps -1 --logging_steps 1 \
  --eval_steps -1 --train_batch_size 256 \
  --micro_train_batch_size 1 --pretrain meta-llama/Meta-Llama-3-8B \
  --bf16 --max_epochs 1 --max_len 8192 \
  --zero_stage 3 --learning_rate 9e-6 \
  --dataset OpenRLHF/preference_dataset_mixture2_and_safe_pku \
  --apply_chat_template --chosen_key chosen \
  --rejected_key rejected --flash_attn --gradient_checkpointing
```

**步骤 2：PPO 训练**：
```bash
ray start --head --node-ip-address 0.0.0.0 --num-gpus 8

ray job submit --address="http://127.0.0.1:8265" \
  -- python3 -m openrlhf.cli.train_ppo_ray \
  --ref_num_nodes 1 --ref_num_gpus_per_node 8 \
  --reward_num_nodes 1 --reward_num_gpus_per_node 8 \
  --critic_num_nodes 1 --critic_num_gpus_per_node 8 \
  --actor_num_nodes 1 --actor_num_gpus_per_node 8 \
  --vllm_num_engines 4 --vllm_tensor_parallel_size 2 \
  --colocate_all_models \
  --pretrain OpenRLHF/Llama-3-8b-sft-mixture \
  --reward_pretrain ./output/llama3-8b-rm \
  --save_path ./output/llama3-8b-ppo \
  --micro_train_batch_size 8 --train_batch_size 128 \
  --micro_rollout_batch_size 16 --rollout_batch_size 1024 \
  --max_epochs 1 --prompt_max_len 1024 --generate_max_len 1024 \
  --zero_stage 3 --bf16 \
  --actor_learning_rate 5e-7 --critic_learning_rate 9e-6 \
  --init_kl_coef 0.01 --normalize_reward \
  --vllm_enable_sleep --deepspeed_enable_sleep
```

### 工作流 2：GRPO 训练（无需评论模型）

相比 PPO 更节省内存的替代方案：

```bash
ray job submit --address="http://127.0.0.1:8265" \
  -- python3 -m openrlhf.cli.train_ppo_ray \
  --advantage_estimator group_norm \
  --ref_num_nodes 1 --ref_num_gpus_per_node 8 \
  --reward_num_nodes 1 --reward_num_gpus_per_node 8 \
  --actor_num_nodes 1 --actor_num_gpus_per_node 8 \
  --vllm_num_engines 4 --vllm_tensor_parallel_size 2 \
  --colocate_all_models \
  --pretrain OpenRLHF/Llama-3-8b-sft-mixture \
  --reward_pretrain OpenRLHF/Llama-3-8b-rm-700k \
  --save_path ./output/llama3-8b-grpo \
  --micro_train_batch_size 8 --train_batch_size 128 \
  --micro_rollout_batch_size 16 --rollout_batch_size 1024 \
  --max_epochs 1 --bf16 \
  --actor_learning_rate 5e-7 \
  --init_kl_coef 0.01 --use_kl_loss --kl_estimator k3 \
  --normalize_reward --no_advantage_std_norm
```

**GRPO 关键参数**：
- `--advantage_estimator group_norm` - 启用 GRPO
- `--use_kl_loss` - 使用 GRPO 论文中的 KL 损失
- `--kl_estimator k3` - 损失函数（k2 ≈ k1）
- `--no_advantage_std_norm` - 禁用标准差归一化

### 工作流 3：DPO 训练（偏好优化）

无需奖励模型的更简单替代方案：

```bash
deepspeed --module openrlhf.cli.train_dpo \
  --save_path ./output/llama3-8b-dpo \
  --save_steps -1 --logging_steps 1 \
  --eval_steps -1 --train_batch_size 256 \
  --micro_train_batch_size 2 --pretrain meta-llama/Meta-Llama-3-8B \
  --bf16 --max_epochs 1 --max_len 8192 \
  --zero_stage 3 --learning_rate 5e-7 --beta 0.1 \
  --dataset OpenRLHF/preference_dataset_mixture2_and_safe_pku \
  --apply_chat_template --chosen_key chosen \
  --rejected_key rejected --flash_attn --gradient_checkpointing
```

## 何时使用及替代方案

**以下情况使用 OpenRLHF**：
- 使用 RL 训练大型模型（7B-70B+）
- 需要 vLLM 推理加速
- 希望使用基于 Ray 的分布式架构
- 拥有多节点 GPU 集群
- 需要在一个框架中使用 PPO/GRPO/RLOO/DPO

**算法选择**：
- **PPO**：控制能力最强，最适合复杂奖励
- **GRPO**：内存效率高，无需评论模型
- **RLOO**：采用逐 token KL 的改进版 PPO
- **REINFORCE++**：比 GRPO 更稳定，比 PPO 更快
- **DPO**：最简单，无需奖励模型

**以下情况改用替代方案**：
- **TRL**：单节点训练，API 更简单
- **veRL**：字节跳动面向 671B 模型的框架
- **DeepSpeedChat**：与 DeepSpeed 生态系统集成

## 常见问题

**问题：大型模型导致 GPU 内存不足**

禁用模型共置：
```bash
# Remove --colocate_all_models flag
# Allocate separate GPUs for each model
--actor_num_gpus_per_node 8 \
--critic_num_gpus_per_node 8 \
--reward_num_gpus_per_node 8 \
--ref_num_gpus_per_node 8
```

**问题：DeepSpeed GPU 索引超出范围**

设置环境变量：
```bash
export RAY_EXPERIMENTAL_NOSET_CUDA_VISIBLE_DEVICES=1
```

**问题：训练不稳定**

使用混合引擎代替异步模式：
```bash
--colocate_all_models \
--vllm_enable_sleep \
--deepspeed_enable_sleep
```

调整 KL 系数：
```bash
--init_kl_coef 0.05  # Increase from 0.01
```

**问题：PPO 期间生成速度缓慢**

启用 vLLM 加速：
```bash
--vllm_num_engines 4 \
--vllm_tensor_parallel_size 2 \
--vllm_gpu_memory_utilization 0.5
```

## 高级主题

**混合引擎 GPU 共享**：有关 vLLM 休眠模式、DeepSpeed 休眠模式和最佳节点分配，请参阅 [references/hybrid-engine.md](references/hybrid-engine.md)。

**算法比较**：有关 PPO、GRPO、RLOO 与 REINFORCE++ 的基准测试和超参数，请参阅 [references/algorithm-comparison.md](references/algorithm-comparison.md)。

**多节点设置**：有关 Ray 集群配置和容错，请参阅 [references/multi-node-training.md](references/multi-node-training.md)。

**自定义奖励函数**：有关强化微调和智能体 RLHF，请参阅 [references/custom-rewards.md](references/custom-rewards.md)。

## 硬件要求

- **GPU**：推荐使用 NVIDIA A100/H100
- **VRAM**：
  - 7B 模型：8× A100 40GB（混合引擎）
  - 70B 模型：48× A100 80GB（vLLM:Actor:Critic = 1:1:1）
- **多节点**：推荐使用配备 InfiniBand 的 Ray 集群
- **Docker**：NVIDIA PyTorch 容器 25.02+

**性能**：
- 比 DeepSpeedChat 快 2 倍
- vLLM 推理加速
- 混合引擎可最大限度减少 GPU 空闲时间

## 资源

- 文档：https://github.com/OpenRLHF/OpenRLHF
- 论文：https://arxiv.org/abs/2405.11143
- 示例：https://github.com/OpenRLHF/OpenRLHF/tree/main/examples
- Discord：社区支持