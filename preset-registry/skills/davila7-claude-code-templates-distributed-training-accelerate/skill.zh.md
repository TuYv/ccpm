---
name: huggingface-accelerate
description: Simplest distributed training API. 4 lines to add distributed support to any PyTorch script. Unified API for DeepSpeed/FSDP/Megatron/DDP. Automatic device placement, mixed precision (FP16/BF16/FP8). Interactive config, single launch command. HuggingFace ecosystem standard.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Distributed Training, HuggingFace, Accelerate, DeepSpeed, FSDP, Mixed Precision, PyTorch, DDP, Unified API, Simple]
dependencies: [accelerate, torch, transformers]
---
# HuggingFace Accelerate - 统一分布式训练

## 快速开始

Accelerate 将分布式训练简化为 4 行代码。

**安装**：
```bash
pip install accelerate
```

**转换 PyTorch 脚本**（4 行）：
```python
import torch
+ from accelerate import Accelerator

+ accelerator = Accelerator()

  model = torch.nn.Transformer()
  optimizer = torch.optim.Adam(model.parameters())
  dataloader = torch.utils.data.DataLoader(dataset)

+ model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)

  for batch in dataloader:
      optimizer.zero_grad()
      loss = model(batch)
-     loss.backward()
+     accelerator.backward(loss)
      optimizer.step()
```

**运行**（单条命令）：
```bash
accelerate launch train.py
```

## 常见工作流

### 工作流 1：从单 GPU 扩展到多 GPU

**原始脚本**：
```python
# train.py
import torch

model = torch.nn.Linear(10, 2).to('cuda')
optimizer = torch.optim.Adam(model.parameters())
dataloader = torch.utils.data.DataLoader(dataset, batch_size=32)

for epoch in range(10):
    for batch in dataloader:
        batch = batch.to('cuda')
        optimizer.zero_grad()
        loss = model(batch).mean()
        loss.backward()
        optimizer.step()
```

**使用 Accelerate**（添加 4 行）：
```python
# train.py
import torch
from accelerate import Accelerator  # +1

accelerator = Accelerator()  # +2

model = torch.nn.Linear(10, 2)
optimizer = torch.optim.Adam(model.parameters())
dataloader = torch.utils.data.DataLoader(dataset, batch_size=32)

model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)  # +3

for epoch in range(10):
    for batch in dataloader:
        # No .to('cuda') needed - automatic!
        optimizer.zero_grad()
        loss = model(batch).mean()
        accelerator.backward(loss)  # +4
        optimizer.step()
```

**配置**（交互式）：
```bash
accelerate config
```

**问题**：
- 使用哪种机器？（单 GPU/多 GPU/TPU/CPU）
- 使用多少台机器？（1）
- 是否使用混合精度？（no/fp16/bf16/fp8）
- 是否使用 DeepSpeed？（no/yes）

**启动**（适用于任何配置）：
```bash
# Single GPU
accelerate launch train.py

# Multi-GPU (8 GPUs)
accelerate launch --multi_gpu --num_processes 8 train.py

# Multi-node
accelerate launch --multi_gpu --num_processes 16 \
  --num_machines 2 --machine_rank 0 \
  --main_process_ip $MASTER_ADDR \
  train.py
```

### 工作流 2：混合精度训练

**启用 FP16/BF16**：
```python
from accelerate import Accelerator

# FP16 (with gradient scaling)
accelerator = Accelerator(mixed_precision='fp16')

# BF16 (no scaling, more stable)
accelerator = Accelerator(mixed_precision='bf16')

# FP8 (H100+)
accelerator = Accelerator(mixed_precision='fp8')

model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)

# Everything else is automatic!
for batch in dataloader:
    with accelerator.autocast():  # Optional, done automatically
        loss = model(batch)
    accelerator.backward(loss)
```

### 工作流 3：DeepSpeed ZeRO 集成

**启用 DeepSpeed ZeRO-2**：
```python
from accelerate import Accelerator

accelerator = Accelerator(
    mixed_precision='bf16',
    deepspeed_plugin={
        "zero_stage": 2,  # ZeRO-2
        "offload_optimizer": False,
        "gradient_accumulation_steps": 4
    }
)

# Same code as before!
model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)
```

**或通过配置启用**：
```bash
accelerate config
# Select: DeepSpeed → ZeRO-2
```

**deepspeed_config.json**：
```json
{
    "fp16": {"enabled": false},
    "bf16": {"enabled": true},
    "zero_optimization": {
        "stage": 2,
        "offload_optimizer": {"device": "cpu"},
        "allgather_bucket_size": 5e8,
        "reduce_bucket_size": 5e8
    }
}
```

**启动**：
```bash
accelerate launch --config_file deepspeed_config.json train.py
```

### 工作流 4：FSDP（完全分片数据并行）

**启用 FSDP**：
```python
from accelerate import Accelerator, FullyShardedDataParallelPlugin

fsdp_plugin = FullyShardedDataParallelPlugin(
    sharding_strategy="FULL_SHARD",  # ZeRO-3 equivalent
    auto_wrap_policy="TRANSFORMER_AUTO_WRAP",
    cpu_offload=False
)

accelerator = Accelerator(
    mixed_precision='bf16',
    fsdp_plugin=fsdp_plugin
)

model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)
```

**或通过配置启用**：
```bash
accelerate config
# Select: FSDP → Full Shard → No CPU Offload
```

### 工作流 5：梯度累积

**累积梯度**：
```python
from accelerate import Accelerator

accelerator = Accelerator(gradient_accumulation_steps=4)

model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)

for batch in dataloader:
    with accelerator.accumulate(model):  # Handles accumulation
        optimizer.zero_grad()
        loss = model(batch)
        accelerator.backward(loss)
        optimizer.step()
```

**有效批次大小**：`batch_size * num_gpus * gradient_accumulation_steps`

## 何时使用及替代方案

**适合使用 Accelerate 的情况**：
- 希望以最简单的方式进行分布式训练
- 需要一套适用于任何硬件的脚本
- 使用 HuggingFace 生态系统
- 希望具备灵活性（DDP/DeepSpeed/FSDP/Megatron）
- 需要快速构建原型

**主要优势**：
- **4 行代码**：只需极少的代码改动
- **统一 API**：同一套代码适用于 DDP、DeepSpeed、FSDP 和 Megatron
- **自动化**：自动处理设备放置、混合精度和分片
- **交互式配置**：无需手动设置启动器
- **统一启动方式**：适用于所有环境

**以下情况改用替代方案**：
- **PyTorch Lightning**：需要回调和高级抽象
- **Ray Train**：需要多节点编排和超参数调优
- **DeepSpeed**：需要直接控制 API 和使用高级功能
- **原生 DDP**：需要最大程度的控制和最少的抽象

## 常见问题

**问题：设备放置错误**

不要手动移动到设备：
```python
# WRONG
batch = batch.to('cuda')

# CORRECT
# Accelerate handles it automatically after prepare()
```

**问题：梯度累积不起作用**

使用上下文管理器：
```python
# CORRECT
with accelerator.accumulate(model):
    optimizer.zero_grad()
    accelerator.backward(loss)
    optimizer.step()
```

**问题：分布式环境中的检查点保存**

使用 accelerator 方法：
```python
# Save only on main process
if accelerator.is_main_process:
    accelerator.save_state('checkpoint/')

# Load on all processes
accelerator.load_state('checkpoint/')
```

**问题：使用 FSDP 时结果不同**

确保使用相同的随机种子：
```python
from accelerate.utils import set_seed
set_seed(42)
```

## 高级主题

**Megatron 集成**：有关张量并行、流水线并行和序列并行的设置，请参阅 [references/megatron-integration.md](references/megatron-integration.md)。

**自定义插件**：有关创建自定义分布式插件和高级配置，请参阅 [references/custom-plugins.md](references/custom-plugins.md)。

**性能调优**：有关性能分析、内存优化和最佳实践，请参阅 [references/performance.md](references/performance.md)。

## 硬件要求

- **CPU**：可运行（较慢）
- **单 GPU**：可运行
- **多 GPU**：DDP（默认）、DeepSpeed 或 FSDP
- **多节点**：DDP、DeepSpeed、FSDP、Megatron
- **TPU**：支持
- **Apple MPS**：支持

**启动器要求**：
- **DDP**：`torch.distributed.run`（内置）
- **DeepSpeed**：`deepspeed`（pip install deepspeed）
- **FSDP**：PyTorch 1.12+（内置）
- **Megatron**：自定义设置

## 资源

- 文档：https://huggingface.co/docs/accelerate
- GitHub：https://github.com/huggingface/accelerate
- 版本：1.11.0+
- 教程："加速你的脚本"
- 示例：https://github.com/huggingface/accelerate/tree/main/examples
- 使用方：HuggingFace Transformers、TRL、PEFT、所有 HF 库