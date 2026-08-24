---
name: pytorch-fsdp2
description: Adds PyTorch FSDP2 (fully_shard) to training scripts with correct init, sharding, mixed precision/offload config, and distributed checkpointing. Use when models exceed single-GPU memory or when you need DTensor-based sharding with DeviceMesh.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [PyTorch, FSDP2, Fully Sharded Data Parallel, Distributed Training, DTensor, Device Mesh, Sharded Checkpointing, Mixed Precision, Offload, Torch Distributed]
dependencies: [torch]
---
# 技能：在训练脚本中正确使用 PyTorch FSDP2（`fully_shard`）

本技能指导编码智能体如何将 **PyTorch FSDP2 添加到训练循环**中，并正确完成初始化、分片、混合精度/卸载配置和检查点保存。

> PyTorch 中的 FSDP2 主要通过 `torch.distributed.fsdp.fully_shard` 以及它就地添加到模块中的 `FSDPModule` 方法提供。参见：`references/pytorch_fully_shard_api.md`、`references/pytorch_fsdp2_tutorial.md`。

---

## 何时使用本技能

在以下情况下使用 FSDP2：
- 你的模型**无法装入**单个 GPU（参数 + 梯度 + 优化器状态）。
- 相比 FSDP1，你希望采用一种基于 eager 模式的分片方法，实现**基于 DTensor 的逐参数分片**（更易检查、分片状态字典更简单）。  
- 你之后可能会使用 **DeviceMesh** 将 DP 与**张量并行**组合。

在以下情况下应避免使用（或谨慎使用）：
- 你需要检查点在不同 PyTorch 版本之间严格向后兼容（DCP 对此有所警告）。
- 你被迫使用不包含 FSDP2 技术栈的旧版 PyTorch。

## 替代方案（当 FSDP2 不是最佳选择时）

- **DistributedDataParallel (DDP)**：当你需要经典的分布式数据并行训练时，使用标准的数据并行包装器。
- **FullyShardedDataParallel (FSDP1)**：使用原始 FSDP 包装器，在数据并行工作进程之间对参数进行分片。

参考：`references/pytorch_ddp_notes.md`、`references/pytorch_fsdp1_api.md`。

---

## 智能体必须遵守的约定

1. **使用 `torchrun` 启动**，并为每个进程设置 CUDA 设备（通常通过 `LOCAL_RANK`）。  
2. **自底向上应用 `fully_shard()`**，即先对各子模块（例如 Transformer 块）进行分片，再对根模块进行分片。  
3. **调用 `model(input)`**，而不是 `model.forward(input)`，以确保 FSDP2 钩子正常运行（除非你显式调用 `unshard()` 或注册前向方法）。  
4. **在分片之后创建优化器**，并确保它基于 **DTensor 参数**（执行 `fully_shard` 之后）构建。  
5. **使用分布式检查点（DCP）**或分布式状态字典辅助函数保存检查点；不要直接使用 `torch.save(model.state_dict())`，除非你有意将张量收集为完整张量。

（以上每条规则都直接在官方 API 文档/教程中进行了说明；参见参考资料。）

---

## 分步操作流程

### 0) 版本与环境健全性检查
- 优先使用较新的稳定版 PyTorch，其文档中的 FSDP2 和 DCP 内容应为近期更新。
- 使用 `torchrun --nproc_per_node <gpus_per_node> ...`，并确保 `RANK`、`WORLD_SIZE`、`LOCAL_RANK` 可见。

参考：`references/pytorch_fsdp2_tutorial.md`（启动命令和设置）、`references/pytorch_fully_shard_api.md`（用户约定）。

---

### 1) 初始化分布式环境并设置设备
最简且正确的模式：
- `dist.init_process_group(backend="nccl")`
- `torch.cuda.set_device(int(os.environ["LOCAL_RANK"]))`
- 可选：创建 `DeviceMesh` 来描述数据并行组

参考：`references/pytorch_device_mesh_tutorial.md`（DeviceMesh 存在的原因及其管理进程组的方式）。

---

### 2) 在 meta 设备上构建模型（推荐用于超大模型）
对于大型模型，先在 `meta` 上初始化，应用分片，然后在 GPU 上实体化权重：
- `with torch.device("meta"): model = ...`
- 对子模块应用 `fully_shard(...)`，然后应用 `fully_shard(model)`
- `model.to_empty(device="cuda")`
- `model.reset_parameters()`（或你的初始化例程）

参考：`references/pytorch_fsdp2_tutorial.md`（迁移指南明确展示了此流程）。

---

### 3) 自底向上应用 `fully_shard()`（包装策略 = “按需应用”）
**不要**只对最顶层模块调用 `fully_shard`。

类 Transformer 模型的推荐分片模式：
- 遍历模块，`if isinstance(m, TransformerBlock): fully_shard(m, ...)`
- 然后执行 `fully_shard(model, ...)`

原因：
- `fully_shard` 会形成“参数组”以提升集合通信效率，并排除已被先前调用分组的参数。自底向上应用可以实现更好的重叠，并降低峰值内存占用。

参考：`references/pytorch_fully_shard_api.md`（自底向上要求及其原因）。

---

### 4) 配置 `reshard_after_forward` 以权衡内存与性能
默认行为：
- `None` 对非根模块表示 `True`，对根模块表示 `False`（是一个不错的默认设置）。

经验法则：
- 如果受内存限制：保留默认设置，或对多个块强制设置为 `True`。
- 如果受吞吐量限制且内存充足：可以考虑让参数在更长时间内保持未分片状态（根模块通常为 `False`）。
- 高级用法：如果存在有意义的整除关系，可使用 `int` 在前向传播后重新分片到更小的网格（例如节点内网格）。

参考：`references/pytorch_fully_shard_api.md`（完整语义）。

---

### 5) 混合精度与卸载（可选但常用）
FSDP2 使用：
- `mp_policy=MixedPrecisionPolicy(param_dtype=..., reduce_dtype=..., output_dtype=..., cast_forward_inputs=...)`
- 如果需要 CPU 卸载，则使用 `offload_policy=CPUOffloadPolicy()`

经验法则：
- 在 H100/A100 级别的 GPU 上，先从 BF16 参数和归约开始（前提是其数值稳定性适合你的模型）。
- 使 `reduce_dtype` 与你的梯度归约预期保持一致。
- 如果使用 CPU 卸载，请为 PCIe/NVLink 流量和运行时开销预留资源。

参考：`references/pytorch_fully_shard_api.md`（MixedPrecisionPolicy / OffloadPolicy 类）。

---

### 6) 优化器、梯度裁剪与累积
- 在分片**之后**创建优化器，使其持有 DTensor 参数。
- 如果需要梯度累积 / no_sync：
  - 使用 FSDP2 机制（`set_requires_gradient_sync`），而不是 FSDP1 的 `no_sync()`。

梯度裁剪：
- 使用 FSDP2 教程中展示的方法（“Gradient Clipping and Optimizer with DTensor”），因为参数和梯度都是 DTensor。

参考：`references/pytorch_fsdp2_tutorial.md`。

---

### 7) 检查点：优先使用 DCP 或分布式状态字典辅助工具
推荐两种方法：

**A) 分布式检查点（DCP）——最佳默认选择**
- DCP 从多个 rank 并行保存/加载，并支持加载时重新分片。
- DCP 会生成**多个文件**（通常每个 rank 至少一个），并采用“原地”操作。

**B) 分布式状态字典辅助函数**
- 使用带有 `StateDictOptions(full_state_dict=True, cpu_offload=True, broadcast_from_rank0=True, ...)` 的 `get_model_state_dict` / `set_model_state_dict`
- 对于优化器：`get_optimizer_state_dict` / `set_optimizer_state_dict`

避免：
- 使用普通的 `torch.save` 保存 DTensor 状态字典，除非你有意使用 `DTensor.full_tensor()` 进行转换，并谨慎管理内存。

参考资料：
- `references/pytorch_dcp_overview.md`（DCP 的行为和注意事项）
- `references/pytorch_dcp_recipe.md` 和 `references/pytorch_dcp_async_recipe.md`（端到端用法）
- `references/pytorch_fsdp2_tutorial.md`（DTensor 与 DCP 状态字典流程的对比）
- `references/pytorch_examples_fsdp2.md`（可正常运行的检查点脚本）

---

## 工作流检查清单（方便复制粘贴）

### 工作流 A：将 FSDP2 改造集成到现有训练脚本中
- [ ] 使用 `torchrun` 启动并初始化进程组。
- [ ] 根据 `LOCAL_RANK` 设置 CUDA 设备；如果需要多维并行，请创建 `DeviceMesh`。
- [ ] 构建模型（必要时使用 `meta`），自底向上应用 `fully_shard`，然后调用 `fully_shard(model)`。
- [ ] 在分片后创建优化器，使其能够捕获 DTensor 参数。
- [ ] 使用 `model(inputs)` 以确保钩子运行；使用 `set_requires_gradient_sync` 进行梯度累积。
- [ ] 通过 `torch.distributed.checkpoint` 辅助函数添加 DCP 保存/加载功能。

参考资料：`references/pytorch_fsdp2_tutorial.md`、`references/pytorch_fully_shard_api.md`、`references/pytorch_device_mesh_tutorial.md`、`references/pytorch_dcp_recipe.md`。

### 工作流 B：添加 DCP 保存/加载功能（最简模式）
- [ ] 将状态包装在 `Stateful` 中，或通过 `get_state_dict` 组装状态。
- [ ] 从所有 rank 调用 `dcp.save(...)`，保存到共享路径。
- [ ] 调用 `dcp.load(...)`，并使用 `set_state_dict` 恢复状态。
- [ ] 加载到不同 mesh 时，验证所有关于重新分片的假设。

参考资料：`references/pytorch_dcp_recipe.md`。

## 调试检查清单（智能体应首先检查的内容）

1. **所有 rank 是否位于不同的 GPU 上？**  
   如果不是，请检查 `torch.cuda.set_device(LOCAL_RANK)` 和你的 `torchrun` 标志。
2. **是否意外直接调用了 `forward()`？**  
   使用 `model(input)`，或显式调用 `unshard()` / 注册前向传播。
3. **是否自底向上应用了 `fully_shard()`？**  
   如果只对根模块进行了分片，则内存占用和性能预计会更差，并且可能引起混淆。
4. **优化器是否在正确的时机创建？**  
   必须在分片*之后*基于 DTensor 参数构建。
5. **检查点路径是否一致？**  
   - 如果使用 DCP，请勿与临时拼凑的 `torch.save` 混用，除非你了解其中的转换过程。
   - 请留意 DCP 的 PyTorch 版本兼容性警告。

---

## 常见问题及修复方法

- **前向钩子未运行** → 调用 `model(inputs)`（或显式调用 `unshard()`），而不是 `model.forward(...)`。
- **优化器获取的是非 DTensor 参数** → 在所有 `fully_shard` 调用完成后创建优化器。
- **只有根模块被分片** → 先对各子模块自底向上应用 `fully_shard`，然后再对根模块应用。
- **前向传播后内存占用激增** → 为更多模块设置 `reshard_after_forward=True`。
- **梯度累积不同步** → 使用 `set_requires_gradient_sync`，而不是 FSDP1 的 `no_sync()`。

参考：`references/pytorch_fully_shard_api.md`、`references/pytorch_fsdp2_tutorial.md`。

---

## 最小参考实现大纲（便于智能体使用）

编码智能体应实现包含以下标记区块的脚本：

- `init_distributed()`：初始化进程组，设置设备
- `build_model_meta()`：在 meta 设备上创建模型，应用 `fully_shard`，实例化权重
- `build_optimizer()`：在分片后创建优化器
- `train_step()`：使用 `model(inputs)` 和支持 DTensor 的模式执行前向传播、反向传播和参数更新
- `checkpoint_save/load()`：使用 DCP 或分布式状态字典辅助函数

具体示例位于 `references/pytorch_examples_fsdp2.md` 和官方教程参考文档中。

---

## 参考资料
- `references/pytorch_fsdp2_tutorial.md`
- `references/pytorch_fully_shard_api.md`
- `references/pytorch_ddp_notes.md`
- `references/pytorch_fsdp1_api.md`
- `references/pytorch_device_mesh_tutorial.md`
- `references/pytorch_tp_tutorial.md`
- `references/pytorch_dcp_overview.md`
- `references/pytorch_dcp_recipe.md`
- `references/pytorch_dcp_async_recipe.md`
- `references/pytorch_examples_fsdp2.md`
- `references/torchtitan_fsdp_notes.md`（可选，生产环境说明）
- `references/ray_train_fsdp2_example.md`（可选，集成示例）