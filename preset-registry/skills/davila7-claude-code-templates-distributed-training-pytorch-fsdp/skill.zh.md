---
name: pytorch-fsdp
description: Expert guidance for Fully Sharded Data Parallel training with PyTorch FSDP - parameter sharding, mixed precision, CPU offloading, FSDP2
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Distributed Training, PyTorch, FSDP, Data Parallel, Sharding, Mixed Precision, CPU Offloading, FSDP2, Large-Scale Training]
dependencies: [torch>=2.0, transformers]
---
# Pytorch-Fsdp Skill

面向 pytorch-fsdp 开发的综合助手，基于官方文档生成。

## 何时使用此技能

当出现以下情况时应触发此技能：
- 使用 pytorch-fsdp
- 询问 pytorch-fsdp 的特性或 API
- 实现 pytorch-fsdp 方案
- 调试 pytorch-fsdp 代码
- 学习 pytorch-fsdp 最佳实践

## 快速参考

### 常见模式

**模式 1：** 通用 Join 上下文管理器# 创建于：2025 年 6 月 6 日 | 最近更新：2025 年 6 月 6 日  
本通用 Join 上下文管理器支持不均匀输入的分布式训练。此页面概述相关类的 API：`Join`、`Joinable` 和 `JoinHook`。若要查看教程，请参见使用 Join 上下文管理器进行非均匀输入的分布式训练。  

`class torch.distributed.algorithms.Join(joinables, enable=True, throw_on_early_termination=False, **kwargs)[source]#`  
此类定义了通用 Join 上下文管理器，允许在某个进程加入后调用自定义钩子。应调用这些钩子来“遮蔽”未加入进程的集合通信，从而防止卡住和报错，并确保算法正确性。关于钩子定义的详细信息，请参见 `JoinHook`。  
警告：上下文管理器要求每个参与的 `Joinable` 在自身每次迭代的集合通信之前调用 `notify_join_context()`，以确保正确性。  
警告：该上下文管理器要求所有 `JoinHook` 对象中的 `process_group` 属性一致。如果存在多个 `JoinHook` 对象，则使用第一个对象的设备。该 `process group` 和设备信息用于检查未加入的进程，并在启用 `throw_on_early_termination` 时通知进程抛出异常，这两者都使用 `all-reduce`。  
参数  
- `joinables` (`List[Joinable]`) — 参与的 `Joinable` 列表；其钩子按给定顺序遍历。  
- `enable` (`bool`) — 启用非均匀输入检测的标志；设为 `False` 将禁用上下文管理器功能，仅应在用户明确知道输入不不均匀时设置（默认：`True`）。  
- `throw_on_early_termination` (`bool`) — 控制是否在检测到非均匀输入时抛出异常的标志（默认：`False`）。  

示例：
>>> import os
>>> import torch
>>> import torch.distributed as dist
>>> import torch.multiprocessing as mp
>>> import torch.nn.parallel.DistributedDataParallel as DDP
>>> import torch.distributed.optim.ZeroRedundancyOptimizer as ZeRO
>>> from torch.distributed.algorithms.join import Join
>>> 
>>> # On each spawned worker
>>> def worker(rank):
>>>     dist.init_process_group("nccl", rank=rank, world_size=2)
>>>     model = DDP(torch.nn.Linear(1, 1).to(rank), device_ids=[rank])
>>>     optim = ZeRO(model.parameters(), torch.optim.Adam, lr=0.01)
>>>     # Rank 1 gets one more input than rank 0
>>>     inputs = [torch.tensor([1.]).to(rank) for _ in range(10 + rank)]
>>>     with Join([model, optim]):
>>>         for input in inputs:
>>>             loss = model(input).sum()
>>>             loss.backward()
>>>             optim.step()
>>> # All ranks reach here without hanging/erroring

`static notify_join_context(joinable)[source]#`  
通知调用进程尚未加入 join 上下文管理器。然后，如果 `throw_on_early_termination=True`，检查是否检测到非均匀输入（即某个进程已先行加入），如是则抛出异常。此方法应在 `Joinable` 对象自身每次迭代集合通信之前调用。例如，在 `DistributedDataParallel` 中应在前向传播开始时调用。只有传入上下文管理器的第一个 `Joinable` 对象会在此方法中执行集合通信，其余对象对此方法无实质作用。  
参数  
- `joinable` (`Joinable`) — 调用此方法的 `Joinable` 对象。  
返回  
- 返回一个异步工作句柄，对应将“该进程尚未加入”通知给上下文管理器的 `all-reduce`；如果 `joinable` 是首个传入对象。其他情况返回 `None`。

`class torch.distributed.algorithms.Joinable[source]#`  
此类定义了 joinable 类的抽象基类。joinable 类（继承自 `Joinable`）应实现 `join_hook()`，它返回一个 `JoinHook` 实例，此外还需实现 `join_device()` 和 `join_process_group()`，分别返回设备和进程组信息。  
`abstract property join_device: device`  
返回执行 join 上下文管理器所需集合通信的设备。  
`abstract join_hook(**kwargs)[source]`  
为给定 `Joinable` 返回一个 `JoinHook` 实例。  
参数  
- `kwargs` (`dict`) — 一个包含在运行时修改 join 钩子行为的关键字参数字典；同一 join 上下文中的所有 `Joinable` 实例共享同一个 `kwargs` 值。  
返回类型  
- `JoinHook`  
`abstract property join_process_group: Any`  
返回 join 上下文管理器自身所需集合通信的进程组。  

`class torch.distributed.algorithms.JoinHook[source]#`  
此类定义一个 join 钩子，为 join 上下文管理器提供两个入口点。入口点包括：一个主钩子，在存在未加入进程时会重复调用；以及一个后置钩子，在所有进程都已加入后调用。要为通用 join 上下文管理器实现 join 钩子，请定义继承自 `JoinHook` 的类，并按需重写 `main_hook()` 和 `post_hook()`。  
`main_hook()[source]#`  
在存在未加入进程时调用该钩子，以“遮蔽”一次训练迭代中的集合通信。训练迭代即一次前向传播、反向传播和优化器步骤。  
`post_hook(is_last_joiner)[source]#`  
在所有进程加入后调用该钩子。它会额外接收 `is_last_joiner` 布尔参数，表示该 rank 是否是最后加入的进程之一。  
参数  
- `is_last_joiner` (`bool`) — 如果 rank 是最后加入者之一则为 `True`，否则为 `False`。  

```
Join
```

**模式 2：** 分布式通信包 - `torch.distributed`  
# 创建于：2017 年 7 月 12 日 | 最近更新：2025 年 9 月 4 日  

注：请参阅 PyTorch 分布式概览，了解分布式训练相关特性简介。  

#### 后端  
`torch.distributed` 支持四种内置后端，每种都具有不同能力。下表显示各后端可在 CPU 或 GPU 上使用的函数。对于 NCCL，GPU 指 CUDA GPU；对于 XCCL 指 XPU GPU。MPI 仅当构建 PyTorch 的实现支持时才支持 CUDA。  

| Backend | gloo | mpi | nccl | xccl |
| --- | --- | --- | --- | --- |
| Device CPU | ✓ | ✘ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| recv | ✓ | ✘ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| broadcast | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| all_reduce | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| reduce | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| all_gather | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| gather | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| scatter | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| reduce_scatter | ✓ | ✓ | ✘ | ✘ | ✘ | ✓ | ✘ | ✓ |
| all_to_all | ✓ | ✓ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |
| barrier | ✓ | ✘ | ✓ | ? | ✘ | ✓ | ✘ | ✓ |

带有 PyTorch 的后端  
PyTorch 分布式包支持 Linux（稳定）、MacOS（稳定）和 Windows（原型）。在 Linux 上，默认会内置并包含 Gloo 和 NCCL 后端（仅当构建时启用 CUDA 时才包含 NCCL）。MPI 是可选后端，仅能在从源码构建 PyTorch 时包含（例如，在已安装 MPI 的主机上构建 PyTorch）。  

注：从 PyTorch v1.8 起，Windows 支持所有集合通信后端，除了 NCCL。  
如果 `init_process_group()` 的 `init_method` 参数指向文件，它必须遵循以下模式：  
- 本地文件系统：`init_method="file:///d:/tmp/some_file"`  
- 共享文件系统：`init_method="file://////{machine_name}/{share_folder_name}/some_file"`  
- 与 Linux 平台一致，您也可以通过设置环境变量 `MASTER_ADDR` 和 `MASTER_PORT` 启用 `TcpStore`。  

应使用哪个后端？  
过去常被问到“该用哪个后端？”。经验法则：  
- 对于 CUDA GPU 的分布式训练，请使用 NCCL。  
- 对于 XPU GPU 的分布式训练，请使用 XCCL。  
- 对于 CPU 的分布式训练，请使用 Gloo。  

GPU 主机使用 InfiniBand 互连：用 NCCL，因为它是目前唯一支持 InfiniBand 和 GPUDirect 的后端。  
GPU 主机使用以太网互连：用 NCCL，因为它当前在分布式 GPU 训练上性能最好，尤其是在单节点多进程或多节点分布式训练场景中。如果 NCCL 遇到问题，请使用 Gloo 作为备用（注意 Gloo 在 GPU 上通常比 NCCL 慢）。  

CPU 主机使用 InfiniBand 互连：如果 InfiniBand 已启用 IP over IB，请使用 Gloo；否则请使用 MPI。我们计划在后续版本中为 Gloo 添加 InfiniBand 支持。  
CPU 主机使用以太网互连：使用 Gloo，除非你有明确理由使用 MPI。  

#### 常见环境变量

##### 选择网络接口  
默认情况下，NCCL 和 Gloo 后端都会尝试寻找合适的网络接口。若自动检测到的接口不正确，可使用以下环境变量覆盖（适用于对应后端）：
- `NCCL_SOCKET_IFNAME`，例如：`export NCCL_SOCKET_IFNAME=eth0`  
- `GLOO_SOCKET_IFNAME`，例如：`export GLOO_SOCKET_IFNAME=eth0`  

如果你使用 Gloo 后端，可以通过逗号分隔指定多个接口，例如：`export GLOO_SOCKET_IFNAME=eth0,eth1,eth2,eth3`。后端将按轮询方式在这些接口之间分发操作。所有进程必须在此变量中指定相同数量的接口。  

##### 其他 NCCL 环境变量  
调试——在 NCCL 失败时，你可以设置 `NCCL_DEBUG=INFO` 打印明确的警告消息以及 NCCL 初始化的基本信息。你还可以使用 `NCCL_DEBUG_SUBSYS` 查看某一方面的更多细节。例如，`NCCL_DEBUG_SUBSYS=COLL` 会打印集合调用日志，在排查死锁时很有帮助，尤其是由集合类型或消息大小不匹配导致的。  
若出现拓扑检测失败，可设置 `NCCL_DEBUG_SUBSYS=GRAPH` 检查详细检测结果；如未来需要 NCCL 团队进一步协助，可将结果作为参考保存。  
性能调优——NCCL 会基于其拓扑检测自动调优，以减少用户手动调参。某些基于套接字的系统中，用户仍可尝试调优 `NCCL_SOCKET_NTHREADS` 和 `NCCL_NSOCKS_PERTHREAD` 以提高套接字网络带宽。这两个环境变量已为部分云服务商（如 AWS 或 GCP）预先调优。完整 NCCL 环境变量列表请参考 NVIDIA NCCL 官方文档。  
你还可使用 `torch.distributed.ProcessGroupNCCL.NCCLConfig` 与 `torch.distributed.ProcessGroupNCCL.Options` 进一步调优 NCCL 通信器。可在解释器中使用 `help` 查看更多细节（例如 `help(torch.distributed.ProcessGroupNCCL.NCCLConfig)`）。  

#### 基础  
`torch.distributed` 包为运行在一个或多个机器上的多个计算节点上提供了 PyTorch 支持和通信原语。`torch.nn.parallel.DistributedDataParallel()` 在此功能基础上构建，为任意 PyTorch 模型提供同步式分布式训练封装。这不同于 `torch.multiprocessing` 和 `torch.nn.DataParallel()` 提供的并行方式，因为它支持多个网络连接的机器，并且用户必须为每个进程显式启动主训练脚本的独立副本。  
在单机同步场景下，`torch.distributed` 或 `torch.nn.parallel.DistributedDataParallel()` 封装相较于其他数据并行方式仍有优势，包括 `torch.nn.DataParallel()`：
- 每个进程都维护自己的优化器，并在每次迭代执行完整优化步骤。虽然这看似冗余，但由于梯度已在进程间汇总并平均，因此每个进程的梯度相同；这意味着不需要参数广播步骤，从而减少跨节点张量传输时间。  
- 每个进程都有独立的 Python 解释器，避免单一 Python 进程同时驱动多个执行线程、模型副本或 GPU 所带来的额外解释器开销和“GIL 抖动”。对于大量使用 Python 运行时的模型（包括循环层或许多小组件的模型）这一点尤为关键。  

#### 初始化  
在调用任何其他方法前，需要先通过 `torch.distributed.init_process_group()` 或 `torch.distributed.device_mesh.init_device_mesh()` 初始化包。两者都会阻塞，直到所有进程加入。  
警告：初始化不是线程安全的。应从单线程执行进程组创建，以防不同 rank 间 `UUID` 分配不一致，并避免初始化竞争导致卡住。  

`torch.distributed.is_available()[source]#`  
返回 `True` 则说明分布式包可用；否则 `torch.distributed` 不再暴露其他 API。当前 `torch.distributed` 在 Linux、MacOS 和 Windows 上可用。源码构建时可通过设置 `USE_DISTRIBUTED=1` 启用。当前默认值为 Linux 和 Windows 上 `USE_DISTRIBUTED=1`，MacOS 上为 `USE_DISTRIBUTED=0`。  
返回类型：`bool`  

`torch.distributed.init_process_group(backend=None, init_method=None, timeout=None, world_size=-1, rank=-1, store=None, group_name='', pg_options=None, device_id=None)[source]#`  
初始化默认分布式进程组，并同时初始化分布式包。  
共有两种主要方式来初始化进程组：  
1. 显式指定 `store`、`rank` 和 `world_size`。  
2. 指定 `init_method`（URL 字符串）以指明如何发现节点。可选指定 `rank` 和 `world_size`，或将所有必需参数都编码在 URL 中并省略。  
如果两者都未指定，则 `init_method` 默认为 `"env://"`。  

参数  
- `backend` (`str` 或 `Backend`，可选) — 使用的后端。根据构建时配置，有效值包括 `mpi`、`gloo`、`nccl`、`ucc`、`xccl` 或第三方插件注册的后端。自 2.6 起，如果未提供 `backend`，`c10d` 将使用通过 `device_id` 关键字参数指示的设备类型已注册的后端（若提供）。当前默认注册为：`nccl`（cuda）、`gloo`（cpu）、`xccl`（xpu）。如果既未提供 `backend` 也未提供 `device_id`，`c10d` 将检测运行时机器上的加速器并使用为该加速器（或 CPU）注册的后端。  
该字段可用小写字符串给出（例如 `"gloo"`），也可通过 `Backend` 属性访问（例如 `Backend.GLOO`）。  
若在每台机器上使用多个进程并使用 nccl 后端，每个进程必须独占其使用的每块 GPU，进程间共享 GPU 可能导致死锁或 NCCL 使用无效。  
`ucc` 后端是实验性的。可通过 `get_default_backend_for_device()` 查询某设备的默认后端。  
- `init_method` (`str`，可选) — 指定如何初始化进程组的 URL。若既未指定 `init_method` 也未指定 `store`，则默认为 `"env://"`。与 `store` 互斥。  
- `world_size` (`int`，可选) — 作业中参与的进程数。若指定 `store`，则必需。  
- `rank` (`int`，可选) — 当前进程 rank（应在 `0` 到 `world_size-1` 之间）。若指定 `store`，则必需。  
- `store` (`Store`，可选) — 供所有 worker 访问的键值存储，用于交换连接/地址信息。与 `init_method` 互斥。  
- `timeout` (`timedelta`，可选) — 对进程组执行的操作的超时。默认值：NCCL 为 10 分钟，其它后端为 30 分钟。到期后集合通信将异步中止并导致进程崩溃。原因在于 CUDA 执行是异步的，继续执行用户代码不安全，因为失败的异步 NCCL 操作可能导致后续 CUDA 操作在损坏的数据上执行。若设置 `TORCH_NCCL_BLOCKING_WAIT`，进程将阻塞等待该超时。  
- `group_name` (`str`，可选，已弃用) — 组名。此参数已被忽略。  
- `pg_options` (`ProcessGroupOptions`，可选) — 进程组选项，指定在构建特定进程组时需传入的附加选项。当前仅支持 NCCL 后端的 `ProcessGroupNCCL.Options`，可以设置 `is_high_priority_stream`，使 `nccl` 后端在存在等待执行内核时可选择高优先级 CUDA 流。  
有关配置 NCCL 的其他可用选项，请参见：`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-t`  
- `device_id` (`torch.device` | `int`，可选) — 当前进程将使用的单个特定设备，以便进行后端特定优化。目前在 NCCL 下仅有两个效果：  
  1) 通信器会立即建立（立即调用 `ncclCommInit*`，而非默认懒加载）；  
  2) 子组将尽量使用 `ncclCommSplit`，避免组创建不必要开销。  
若想尽早获知 NCCL 初始化错误，也可使用该字段。若提供整数，API 假设使用编译时的加速器类型。  
注：要启用 `backend == Backend.MPI`，PyTorch 必须在支持 MPI 的系统上从源码构建。  
注：支持多个后端仍属实验性。当前若未指定后端，将创建 `gloo` 与 `nccl` 两种后端。CPU 张量集合通信使用 gloo 后端，CUDA 张量集合通信使用 nccl 后端。  
也可通过形如 `"<device_type>:<backend_name>,<device_type>:<backend_name>"` 的字符串指定自定义后端，例如 `"cpu:gloo,cuda:custom_backend"`。  

`torch.distributed.device_mesh.init_device_mesh(device_type, mesh_shape, *, mesh_dim_names=None, backend_override=None)[source]#`  
基于 `device_type`、`mesh_shape` 和 `mesh_dim_names` 参数初始化 `DeviceMesh`。这将创建一个 n 维数组布局的 `DeviceMesh`，其中 `n` 为 `mesh_shape` 的长度。若提供 `mesh_dim_names`，则每个维度标记为 `mesh_dim_names[i]`。  
`init_device_mesh` 遵循 SPMD 编程模型，即集群中所有进程/rank 运行相同的 PyTorch Python 程序。请确保 `mesh_shape`（描述设备布局的 n 维数组维度）在所有 rank 上完全一致。`mesh_shape` 不一致可能导致卡住。  
注：如果未发现进程组，`init_device_mesh` 将在后台初始化分布式进程组。  

参数  
- `device_type` (`str`) — 网格的设备类型，当前支持：`"cpu"`, `"cuda/cuda-like"`, `"xpu"`。不允许传入带 GPU 索引的设备类型，如 `"cuda:0"`。  
- `mesh_shape` (`Tuple[int]`) — 描述设备布局的多维数组维度元组。  
- `mesh_dim_names` (`Tuple[str]`，可选) — 一个长度与 `mesh_shape` 相同的元组，用于给设备布局数组每个维度命名。  
- `backend_override` (`Dict[int | str, tuple[str, Options] | str | Options]`，可选) — 覆盖将为每个网格维度创建的部分或全部 `ProcessGroup`。每个键可为维度索引或其名称（若提供 `mesh_dim_names`）；每个值可为 `(backend 名称, options)` 元组，也可只给其中之一（缺失项使用默认值）。  
返回  
- 一个表示设备布局的 `DeviceMesh` 对象。  
返回类型  
- `DeviceMesh`  

示例：
>>> from torch.distributed.device_mesh import init_device_mesh
>>> 
>>> mesh_1d = init_device_mesh("cuda", mesh_shape=(8,))
>>> mesh_2d = init_device_mesh("cuda", mesh_shape=(2, 8), mesh_dim_names=("dp", "tp"))

`torch.distributed.is_initialized()[source]#`  
检查默认进程组是否已初始化。  
返回类型：`bool`  

`torch.distributed.is_mpi_available()[source]#`  
检查 MPI 后端是否可用。  
返回类型：`bool`  

`torch.distributed.is_nccl_available()[source]#`  
检查 NCCL 后端是否可用。  
返回类型：`bool`  

`torch.distributed.is_gloo_available()[source]#`  
检查 Gloo 后端是否可用。  
返回类型：`bool`  

`torch.distributed.distributed_c10d.is_xccl_available()[source]#`  
检查 XCCL 后端是否可用。  
返回类型：`bool`  

`torch.distributed.is_torchelastic_launched()[source]#`  
检查此进程是否通过 `torch.distributed.elastic`（即 torchelastic）启动。该环境变量 `TORCHELASTIC_RUN_ID` 的存在用于推断当前进程是否由 torchelastic 启动。该推断合理，因为 `TORCHELASTIC_RUN_ID` 映射到 rendezvous id，其在对等发现目的下始终为非空值表示作业 id。  
返回类型：`bool`  

`torch.distributed.get_default_backend_for_device(device)[source]#`  
返回给定设备的默认后端。  
参数  
- `device` (`Union[str, torch.device]`) — 要获取默认后端的设备。  
返回  
- 给定设备的默认后端（小写字符串）。  
返回类型：`str`  

当前支持三种初始化方法：

#### TCP 初始化  
共有两种使用 TCP 初始化方法，都需要可从所有进程访问的网络地址和所需 `world_size`。第一种方式要求指定属于 `rank 0` 进程的地址。该方式要求所有进程手工指定 rank。注意：最新分布式包不再支持多播地址。`group_name` 也已弃用。  

```python
import torch.distributed as dist
# Use address of one of the machines
dist.init_process_group(backend, init_method='tcp://10.1.1.20:23456', rank=args.rank, world_size=4)
```

#### 共享文件系统初始化  
另一种初始化方式使用对组内所有机器可见的共享文件系统，并提供所需 `world_size`。URL 应以 `file://` 开头，包含共享文件系统上现有目录中的不存在文件路径。文件系统初始化会在文件不存在时自动创建该文件，但不会删除该文件，因此在同一文件路径上再次调用 `init_process_group()` 前必须自行清理。  
注意：最新分布式包不再支持自动 rank 分配，`group_name` 也已弃用。  

警告：此方法假设文件系统支持 `fcntl` 锁定——大多数本地系统和 NFS 均支持。  
警告：该方法总会创建文件并尽最大努力在程序结束时清理并删除该文件。换言之，每次使用文件初始化都需要一个全新的空文件。若复用前一次未清理的文件，行为异常且常导致死锁和失败。  
因此，即便此方法会尽力清理文件，若自动删除失败，你仍需负责在训练结束后移除该文件，以避免下次再次使用。特别是若你计划对同一文件名多次调用 `init_process_group()`。  
经验法则：每次调用 `init_process_group()` 时，确保目标文件不存在或为空。  

```python
import torch.distributed as dist
# rank should always be specified
dist.init_process_group(backend, init_method='file:///mnt/nfs/sharedfile', world_size=4, rank=args.rank)
```

#### 环境变量初始化  
该方法从环境变量读取配置，允许自定义获取信息的方式。需设置的变量为：  
- `MASTER_PORT`（必填）：在 rank 0 机器上必须是空闲端口  
- `MASTER_ADDR`（必填，rank 0 除外）：rank 0 节点地址  
- `WORLD_SIZE`（必填）：可在此设置，或在初始化函数调用中设置  
- `RANK`（必填）：可在此设置，或在初始化函数调用中设置  

rank 0 机器将用于建立所有连接。这是默认方法，因此无需指定 `init_method`（或可设为 `env://`）。  

#### 提升初始化速度  
`TORCH_GLOO_LAZY_INIT`：按需建立连接而非完整网状连接，可显著提升非 all2all 操作的初始化速度。  

#### 初始化后  
`torch.distributed.init_process_group()` 运行后，可使用以下函数。可通过 `torch.distributed.is_initialized()` 检查是否已初始化。  

`class torch.distributed.Backend(name)[source]#`  
后端的类枚举风格定义。可用后端：`GLOO`、`NCCL`、`UCC`、`MPI`、`XCCL` 及其他已注册后端。此类的值是小写字符串，如 `"gloo"`。可通过属性访问，如 `Backend.NCCL`。该类可直接调用以解析字符串，例如 `Backend(backend_str)` 会检查有效性，若有效则返回解析后的小写字符串；也接受大写字符串，例如 `Backend("GLOO")` 返回 `"gloo"`。  
注：`Backend.UNDEFINED` 仍然存在，但仅用作某些字段的初始值。用户不应直接使用，也不应假定其存在。  

`classmethod register_backend(name, func, extended_api=False, devices=None)[source]#`  
使用给定名称和实例化函数注册新后端。此类方法用于第三方 ProcessGroup 扩展注册新后端。  
参数  
- `name` (`str`) — ProcessGroup 扩展的后端名，应与 `init_process_group()` 中的名称一致。  
- `func` (`function`) — 实例化后端的处理函数。该函数应在后端扩展中实现，接收 `store`、`rank`、`world_size`、`timeout` 四个参数。  
- `extended_api` (`bool`，可选) — 后端是否支持扩展参数结构。默认 `False`。若为 `True`，后端将获得 `c10d::DistributedBackendOptions` 的实例及后端实现定义的进程组选项对象。  
- `devices` (`str` 或 `list[str]`，可选) — 后端支持的设备类型，如 `"cpu"`、`"cuda"` 等。若为 `None`，默认支持 `"cpu"` 和 `"cuda"`。  
注：第三方后端支持为实验性，可能会变更。  

`torch.distributed.get_backend(group=None)[source]#`  
返回指定进程组的后端。  
参数  
- `group` (`ProcessGroup`，可选) — 要操作的进程组。默认使用主进程组。若指定其他组，调用进程必须是该组成员。  
返回  
- 给定进程组的后端（小写字符串）。  
返回类型  
- `Backend`  

`torch.distributed.get_rank(group=None)[source]#`  
返回所提供组中当前进程的 rank。  
参数  
- `group` (`ProcessGroup`，可选) — 要操作的进程组；为 `None` 时使用默认进程组。  
返回  
- 进程组中的 rank；若不属于该组则返回 `-1`。  
返回类型  
- `int`  

`torch.distributed.get_world_size(group=None)[source]#`  
返回当前进程组中的进程数。  
参数  
- `group` (`ProcessGroup`，可选) — 要操作的进程组；为 `None` 时使用默认进程组。  
返回  
- 进程组的 world size；若不属于该组则返回 `-1`。  
返回类型  
- `int`  

### 关闭  
重要的是在退出时调用 `destroy_process_group()` 清理资源。最简单的方式是在通信不再需要、通常接近主函数结尾时，对默认组参数 `group=None` 调用一次 `destroy_process_group()`，销毁每个进程组和后端。  
该调用应由每个训练进程执行一次，而非外层 launcher 进程。  
如果在超时窗口内并非所有 rank 在某进程组中都调用了 `destroy_process_group()`，尤其当应用存在多个进程组（例如 N-D 并行）时，退出时可能发生卡住。原因是 `ProcessGroupNCCL` 的析构函数会调用 `ncclCommAbort`，该调用必须集体执行，但 Python 垃圾回收时调用 `ProcessGroupNCCL` 析构函数顺序不确定。  
调用 `destroy_process_group()` 可确保 `ncclCommAbort` 在各 rank 间以一致顺序触发，并避免在析构中调用 `ncclCommAbort`。  

### 重新初始化  
`destroy_process_group` 也可用于销毁单个进程组。一个使用场景是容错训练，其中某个进程组可能被销毁并在运行时重新初始化。此时，在调用 `destroy` 后、重新初始化前，必须通过 `torch.distributed` 原语以外的某种方式同步训练进程。  
由于同步困难，此行为当前不受支持/未测试，且已知为问题。若此用例对你有阻塞影响，请提 GitHub issue 或 RFC。  

### 组（Groups）  
默认情况下，集合通信作用于默认组（亦称 world），并要求所有进程都进入分布式函数调用。然而某些工作负载可受益于更细粒度通信，因此需要分布式组。  
可以使用 `new_group()` 创建新组，成员可为任意进程子集。它返回一个不透明组句柄，可作为 `group` 参数传给所有集合通信。  

`torch.distributed.new_group(ranks=None, timeout=None, backend=None, pg_options=None, use_local_synchronization=False, group_desc=None, device_id=None)[source]#`  
创建新的分布式组。即使某些进程不属于该组，主组（即分布式作业的全部进程）中的所有进程都必须进入此函数。此外，各进程必须以相同顺序创建组。  
警告：并发安全使用。当使用 NCCL 后端的多个进程组时，用户必须确保各 rank 上集合通信的执行顺序在全局上一致。如果进程内多个线程发起集合通信，需要显式同步以保证顺序一致。  
当使用 `torch.distributed` 通信 API 的异步变体时，会返回 `work` 对象，并将通信内核排入独立 CUDA 流以实现通信与计算重叠。若某进程组上发起一个或多个异步操作后，必须在使用其他进程组前通过 `work.wait()` 与其他 CUDA 流同步。  
有关更多细节请参见《Using multiple NCCL communicators concurrently》：  
`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently`  

参数  
- `ranks` (`list[int]`) — 组成员 rank 列表；若为 `None`，设为全部 rank。默认 `None`。  
- `timeout` (`timedelta`，可选) — 见 `init_process_group` 的说明和默认值。  
- `backend` (`str` 或 `Backend`，可选) — 使用的后端。根据构建时配置，有效值为 `gloo` 和 `nccl`。默认使用与全局组相同的后端。该字段使用小写字符串给出（例如 `"gloo"`），可通过 `Backend` 属性访问（例如 `Backend.GLOO`）。若传入 `None`，则使用默认进程组对应后端。默认 `None`。  
- `pg_options` (`ProcessGroupOptions`，可选) — 进程组选项，指定在构建特定进程组时需传入的附加参数。例如 NCCL 后端可设置 `is_high_priority_stream` 以使进程组可选取高优先级 CUDA 流。关于配置 NCCL 的其他可选项，请参见：  
`https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-tuse_local_synchronization`  
- `use_local_synchronization` (`bool`，可选) — 在进程组创建结束时执行组内屏障。不同之处在于非成员 rank 无需调用 API，也不加入该屏障。  
- `group_desc` (`str`, 可选) — 用于描述进程组的字符串。  
- `device_id` (`torch.device`, 可选) — 一个“绑定”此进程的单一特定设备。若提供该字段，`new_group` 会尝试立即为该设备初始化通信后端。  

返回  
- 可传给集合通信调用的进程组句柄；若当前 rank 不在 `ranks` 中，则返回 `GroupMember.NON_GROUP_MEMBER`。  

注：`use_local_synchronization` 与 MPI 不兼容。  
注：`use_local_synchronization=True` 在大集群和小进程组场景可显著加速，但由于非成员 rank 不加入组屏障，需谨慎使用。  
注：`use_local_synchronization=True` 在每个 rank 创建多个重叠进程组时可能导致死锁。避免方式是确保所有 rank 遵循相同的全局创建顺序。  

`torch.distributed.get_group_rank(group, global_rank)[source]#`  
将全局 rank 转为组内 rank。`global_rank` 必须属于该组，否则抛出 `RuntimeError`。  
参数  
- `group` (`ProcessGroup`) — 查找相对 rank 的进程组。  
- `global_rank` (`int`) — 要查询的全局 rank。  
返回  
- `global_rank` 相对该组的组 rank。  
返回类型  
- `int`  

注：在默认进程组上调用此函数返回的是恒等映射。  

`torch.distributed.get_global_rank(group, group_rank)[source]#`  
将组内 rank 转为全局 rank。`group_rank` 必须属于该组，否则抛出 `RuntimeError`。  
参数  
- `group` (`ProcessGroup`) — 查找全局 rank 的进程组。  
- `group_rank` (`int`) — 要查询的组内 rank。  
返回  
- `group_rank` 在该组内对应的全局 rank。  
返回类型  
- `int`  

注：在默认进程组上调用此函数返回恒等映射。  

`torch.distributed.get_process_group_ranks(group)[source]#`  
获取与该组关联的所有 rank。  
参数  
- `group` (`Optional[ProcessGroup]`) — 要获取 rank 的进程组；为 `None` 时使用默认进程组。  
返回  
- 按组内 rank 顺序排列的全局 rank 列表。  
返回类型  
- `list[int]`  

### DeviceMesh  
`DeviceMesh` 是更高级的抽象，用于管理进程组（或 NCCL 通信器）。它可以帮助用户轻松创建跨节点和节点内进程组，无需手工设置各子组 rank 布局，并便于管理这些分布式进程组。`init_device_mesh()` 可用于创建新的 `DeviceMesh`，以网格形状描述设备拓扑。  

`class torch.distributed.device_mesh.DeviceMesh(device_type, mesh, *, mesh_dim_names=None, backend_override=None, _init_backend=True)[source]#`  
`DeviceMesh` 表示一个设备网格，设备布局可表示为 n 维数组，其中 n 维数组每个值是默认进程组 rank 的全局 id。`DeviceMesh` 可用于跨集群设置 n 维设备连接，并管理 n 维并行所需的 `ProcessGroups`。各维度上的通信可分别进行。  
`DeviceMesh` 会尊重用户已选择的设备（即在初始化前调用了 `torch.cuda.set_device` 的设备），并在未预先设置时为当前进程选择/设置设备。注意：手工设置设备应发生在 `DeviceMesh` 初始化之前。  
`DeviceMesh` 也可与 DTensor API 配合，作为上下文管理器使用。  

注：`DeviceMesh` 遵循 SPMD 模型，即集群中所有进程/rank 运行相同 Python 程序。因此，用户应确保网格数组（描述设备布局）在所有 rank 上一致。布局不一致将导致静默卡住。  

参数  
- `device_type` (`str`) — 网格设备类型，当前支持：`"cpu"`、`"cuda/cuda-like"`。  
- `mesh` (`ndarray`) — 多维数组或整数张量，描述设备布局，其中 ID 是默认进程组的全局 id。  
返回  
- 表示设备布局的 `DeviceMesh` 对象。  
返回类型  
- `DeviceMesh`  

以下程序以 SPMD 方式在每个进程/rank 上运行。本例有 2 个主机、每主机 4 块 GPU。网格第一维缩减会跨列（0,4）…与（3,7）聚合，第二维缩减会跨行（0,1,2,3）与（4,5,6,7）聚合。  

示例：  
>>> from torch.distributed.device_mesh import DeviceMesh
>>> 
>>> # Initialize device mesh as (2, 4) to represent the topology
>>> # of cross-host(dim 0), and within-host (dim 1).
>>> mesh = DeviceMesh(device_type="cuda", mesh=[[0, 1, 2, 3],[4, 5, 6, 7]])

`static from_group(group, device_type, mesh=None, *, mesh_dim_names=None)[source]#`  
从现有 `ProcessGroup` 或现有 `ProcessGroup` 列表构造 `DeviceMesh`。构造后的网格维度数等于传入的组数量。例如，若只传入一个进程组，得到 1D 网格；若传入两个进程组，得到 2D 网格。若多于一个组，`mesh` 与 `mesh_dim_names` 为必需。传入的进程组顺序决定网格拓扑，例如第一个进程组对应 `DeviceMesh` 的第 0 维。  
传入的网格张量维度必须与进程组数量一致，且维度顺序必须与进程组顺序一致。  

参数  
- `group` (`ProcessGroup` 或 `list[ProcessGroup]`) — 现有进程组或其列表。  
- `device_type` (`str`) — 网格设备类型，当前支持：`"cpu"`、`"cuda/cuda-like"`。不允许带 GPU 索引的类型（如 `"cuda:0"`）。  
- `mesh` (`torch.Tensor` 或 `ArrayLike`，可选) — 多维数组或整数张量，描述设备布局，元素为默认进程组全局 id。默认 `None`。  
- `mesh_dim_names` (`tuple[str]`, 可选) — 每个设备布局维度的名称元组。其长度须与 `mesh_shape` 长度匹配，每个名称唯一。默认 `None`。  
返回  
- 表示设备布局的 `DeviceMesh` 对象。  
返回类型  
- `DeviceMesh`  

`get_all_groups()[source]#`  
返回所有网格维度的 `ProcessGroup` 列表。  
返回  
- `ProcessGroup` 对象列表。  
返回类型  
- `list[torch.distributed.distributed_c10d.ProcessGroup]`  

`get_coordinate()[source]#`  
返回该 rank 相对于网格所有维度的相对索引。若该 rank 不在网格中，返回 `None`。  
返回类型  
- `Optional[list[int]]`  

`get_group(mesh_dim=None)[source]#`  
返回由 `mesh_dim` 指定的单个 `ProcessGroup`；若未指定 `mesh_dim` 且网格为 1 维，则返回网格中的唯一进程组。  
参数  
- `mesh_dim` (`str/python:int`, 可选) — 可为网格维度名称或索引；默认 `None`。  
返回  
- 一个 `ProcessGroup` 对象。  
返回类型  
- `ProcessGroup`  

`get_local_rank(mesh_dim=None)[source]#`  
返回给定 `mesh_dim` 的局部 rank。  
参数  
- `mesh_dim` (`str/python:int`, 可选) — 可为网格维度名称或索引；默认 `None`。  
返回  
- 整数类型的局部 rank。  
返回类型  
- `int`  

以下程序以 SPMD 方式在每个进程/rank 上运行：2 台主机每台 4 块 GPU。  
对 `mesh_2d` 调用 `get_local_rank(mesh_dim=0)`：在 rank 0,1,2,3 上返回 0；在 rank 4,5,6,7 上返回 1。  
对 `get_local_rank(mesh_dim=1)`：在 rank 0,4 返回 0；在 rank 1,5 返回 1；在 rank 2,6 返回 2；在 rank 3,7 返回 3。  

示例：
>>> from torch.distributed.device_mesh import DeviceMesh
>>> 
>>> # Initialize device mesh as (2, 4) to represent the topology
>>> # of cross-host(dim 0), and within-host (dim 1).
>>> mesh = DeviceMesh(device_type="cuda", mesh=[[0, 1, 2, 3],[4, 5, 6, 7]])

`get_rank()[source]#`  
返回当前全局 rank。  
返回类型  
- `int`  

### 点对点通信  

`torch.distributed.send(tensor, dst=None, group=None, tag=0, group_dst=None)[source]#`  
同步发送一个张量。  
警告：`NCCL` 后端不支持 `tag`。  

参数  
- `tensor` (`Tensor`) — 要发送的张量。  
- `dst` (`int`) — 全局进程组中的目标 rank（不受 `group` 参数影响）。  
- `group` (`ProcessGroup`, 可选) — 工作的进程组；为 `None` 使用默认进程组。  
- `tag` (`int`, 可选) — 与远端 `recv` 匹配的标签。  
- `group_dst` (`int`, 可选) — 组内目的 rank。不能同时指定 `dst` 和 `group_dst`。  

`torch.distributed.recv(tensor, src=None, group=None, tag=0, group_src=None)[source]#`  
同步接收张量。  
警告：`NCCL` 后端不支持 `tag`。  

参数  
- `tensor` (`Tensor`) — 用于存放接收数据的张量。  
- `src` (`int`, 可选) — 全局进程组中的源 rank（不受 `group` 参数影响）。未指定则可接收任一进程。  
- `group` (`ProcessGroup`, 可选) — 工作的进程组；为 `None` 使用默认进程组。  
- `tag` (`int`, 可选) — 与远端 `send` 匹配的标签。  
- `group_src` (`int`, 可选) — 组内源 rank。不能同时指定 `src` 与 `group_src`。  
返回  
- 发送方 rank；若不在组内返回 `-1`。  
返回类型  
- `int`  

`isend()` 与 `irecv()` 调用时返回分布式请求对象。通常该对象类型未指定且不应手动创建，但保证支持两个方法：  
- `is_completed()`：若操作完成返回 `True`。  
- `wait()`：阻塞进程直到操作完成。  
当 `is_completed()` 返回 `True` 时，该状态是稳定的。  

`torch.distributed.isend(tensor, dst=None, group=None, tag=0, group_dst=None)[source]#`  
异步发送张量。  
警告：在请求完成前修改张量将导致未定义行为。  
警告：`NCCL` 后端不支持 `tag`。  
与 `send`（阻塞）不同，`isend` 允许 `src == dst`，即向自己发送。  

参数  
- `tensor` (`Tensor`) — 要发送的张量。  
- `dst` (`int`) — 全局进程组中的目标 rank（不受 `group` 参数影响）。  
- `group` (`ProcessGroup`, 可选) — 工作的进程组；为 `None` 使用默认进程组。  
- `tag` (`int`, 可选) — 与远端 `recv` 匹配的标签。  
- `group_dst` (`int`, 可选) — 组内目标 rank。不能同时指定 `dst` 与 `group_dst`。  
返回  
- 分布式请求对象；若不在组内则返回 `None`。  
返回类型  
- `Optional[Work]`  

`torch.distributed.irecv(tensor, src=None, group=None, tag=0, group_src=None)[source]#`  
异步接收张量。  
警告：`NCCL` 后端不支持 `tag`。  
与 `recv`（阻塞）不同，`irecv` 允许 `src == dst`，即从自己接收。  

参数  
- `tensor` (`Tensor`) — 接收数据填充张量。  
- `src` (`int`, 可选) — 全局进程组中的源 rank（不受 `group` 参数影响）。未指定时可从任意进程接收。  
- `group` (`ProcessGroup`, 可选) — 工作的进程组；为 `None` 使用默认进程组。  
- `tag` (`int`, 可选) — 与远端 `send` 匹配的标签。  
- `group_src` (`int`, 可选) — 组内源 rank。不能同时指定 `src` 与 `group_src`。  
返回  
- 分布式请求对象；若不在组内则返回 `None`。  
返回类型  
- `Optional[Work]`  

`torch.distributed.send_object_list(object_list, dst=None, group=None, device=None, group_dst=None, use_batch=False)[source]#`  
同步发送 `object_list` 中可 picklable 的对象。与 `send()` 类似，但可传入 Python 对象。注意：`object_list` 中所有对象必须可 picklable。  
参数  
- `object_list` (`List[Any]`) — 待发送的输入对象列表。每个对象必须可 picklable。  
- `dst` (`int`) — 目标 rank。基于全局进程组（不受 `group` 影响）。  
- `group` (`Optional[ProcessGroup]`) — 工作的进程组；为 `None` 使用默认进程组。默认 `None`。  
- `device` (`torch.device`, 可选) — 若不为 `None`，对象会被序列化并转换为张量，移动到该设备再发送。  
- `group_dst` (`int`, 可选) — 组内目标 rank。`dst` 与 `group_dst` 二选一。  
- `use_batch` (`bool`, 可选) — 若为 `True`，使用批量 p2p 操作替代普通 send，从而避免初始化 2-rank 通信器并使用现有完整组通信器。详见 `batch_isend_irecv` 用法和假设。默认 `False`。  
返回  
- `None`  

注：对基于 NCCL 的进程组，内部张量表示必须在通信前移动到 GPU 设备。此时使用的设备由 `torch.cuda.current_device()` 决定，并由用户通过 `torch.cuda.set_device()` 确保每个 rank 有独立 GPU。  
警告：对象集合操作具有严重的性能与可扩展性限制。详见 Object collectives。  
警告：`send_object_list()` 隐式使用 `pickle`，而 `pickle` 被认为不安全。可构造恶意 pickle 数据，在反序列化时执行任意代码。请只对可信数据调用。  
警告：使用 GPU 张量调用 `send_object_list()` 支持不完善且效率低下，因为会发生 GPU->CPU 转移（张量会被 pickle）。请考虑改用 `send()`。  

示例：
::>>> # Note: Process group initialization omitted on each rank.
>>> import torch.distributed as dist
>>> # Assumes backend is not NCCL
>>> device = torch.device("cpu")
>>> if dist.get_rank() == 0:
>>>     # Assumes world_size of 2.
>>>     objects = ["foo", 12, {1: 2}] # any picklable object
>>>     dist.send_object_list(objects, dst=1, device=device)
>>> else:
>>>     objects = [None, None, None]
>>>     dist.recv_object_list(objects, src=0, device=device)
>>> objects
['foo', 12, {1: 2}]

`torch.distributed.recv_object_list(object_list, src=None, group=None, device=None, group_src=None, use_batch=False)[source]#`  
同步接收 `object_list` 中的可 picklable 对象。与 `recv()` 类似，但可接收 Python 对象。  
参数  
- `object_list` (`List[Any]`) — 接收目标对象列表。  
- `src` (`int`, 可选) — 全局进程组中的源 rank；不受 `group` 影响。若为 `None`，则从任意 rank 接收。  
- `group` (`Optional[ProcessGroup]`) — 工作的进程组；为 `None` 使用默认进程组。  
- `device` (`torch.device`, 可选) — 若不为 `None`，在该设备上接收。  
- `group_src` (`int`, 可选) — 组内源 rank。不能同时指定 `src` 与 `group_src`。  
- `use_batch` (`bool`, 可选) — 若为 `True`，使用批量 p2p 操作替代普通发送。详见 `batch_isend_irecv`。  
返回  
- 发送方 rank；如果 rank 不在组内返回 -1。  
- 若 rank 在组内，`object_list` 将包含来自 `src` 的发送对象。  

注：对基于 NCCL 的进程组，内部张量表示必须在通信前移入 GPU 设备，使用的设备为 `torch.cuda.current_device()`；用户需确保每个 rank 有独立 GPU，通常通过 `torch.cuda.set_device()`。  
警告：对象集合同样受限于安全与性能问题，详见 Object collectives。  
警告：`recv_object_list()` 隐式使用 `pickle`，可能执行任意代码。仅信任数据来源才可调用。  
警告：使用 GPU 张量时并不理想且低效，因为会发生 GPU->CPU 拷贝。请考虑改用 `recv()`。  

示例：
::>>> # Note: Process group initialization omitted on each rank.
>>> import torch.distributed as dist
>>> # Assumes backend is not NCCL
>>> device = torch.device("cpu")
>>> if dist.get_rank() == 0:
>>>     # Assumes world_size of 2.
>>>     objects = ["foo", 12, {1: 2}] # any picklable object
>>>     dist.send_object_list(objects, dst=1, device=device)
>>> else:
>>>     objects = [None, None, None]
>>>     dist.recv_object_list(objects, src=0, device=device)
>>> objects
['foo', 12, {1: 2}]

`torch.distributed.batch_isend_irecv(p2p_op_list)[source]#`  
异步发送或接收一批张量并返回请求列表。  
`p2p_op_list`（`list[torch.distributed.distributed_c10d.P2POp]`）—— point-to-point 操作列表（每个操作类型为 `torch.distributed.P2POp`）。`isend`/`irecv` 的顺序必须与远端对应顺序一致。  
返回  
- 对 `op_list` 中各操作调用返回的分布式请求对象列表。  
返回类型  
- `list[torch.distributed.distributed_c10d.Work]`  

示例：
>>> send_tensor = torch.arange(2, dtype=torch.float32) + 2 * rank
>>> recv_tensor = torch.randn(2, dtype=torch.float32)
>>> send_op = dist.P2POp(dist.isend, send_tensor, (rank + 1) % world_size)
>>> recv_op = dist.P2POp(
...     dist.irecv, recv_tensor, (rank - 1 + world_size) % world_size
... )
>>> reqs = batch_isend_irecv([send_op, recv_op])
>>> for req in reqs:
>>>     req.wait()
>>> recv_tensor
tensor([2, 3])  # Rank 0
tensor([0, 1])  # Rank 1

注：当该 API 与 NCCL PG 后端配合使用时，用户必须先设置 `torch.cuda.set_device` 当前设备，否则会出现意外卡住。  
此外，若该 API 是 `dist.P2POp` 中的首个集合通信调用，则该组内所有 rank 必须参与该调用；否则行为未定义。若非首个集合调用，则允许只涉及组部分 rank 的批量 P2P。  

`class torch.distributed.P2POp(op, tensor, peer=None, group=None, tag=0, group_peer=None)[source]#`  
用于为 `batch_isend_irecv` 构建点对点操作的类。该类构建 P2P 操作类型、通信缓冲区、peer rank、进程组与 tag。该类实例会传给 `batch_isend_irecv` 进行点对点通信。  
参数  
- `op` (`Callable`) — 用于向对端进程发送或接收数据的函数。类型为 `torch.distributed.isend` 或 `torch.distributed.irecv`。  
- `tensor` (`Tensor`) — 要发送或接收的张量。  
- `peer` (`int`, 可选) — 目标或源 rank。  
- `group` (`ProcessGroup`, 可选) — 工作的进程组；为 `None` 时使用默认组。  
- `tag` (`int`, 可选) — 与 send/recv 匹配的标签。  
- `group_peer` (`int`, 可选) — 目标或源 rank。  

### 同步和异步集合操作  
每个集合操作函数支持以下两种运行模式，取决于传入 `async_op` 的设置：

- 同步操作：默认模式（`async_op=False`）。函数返回时可保证集合操作已执行。  
  对于 CUDA 操作，不能保证 CUDA 操作已完成，因为 CUDA 操作异步执行；但 CPU 集合通信后续使用输出的函数调用行为符合预期。对于 CUDA 集合通信，在同一 CUDA 流上的后续调用行为符合预期。  
  当使用不同流时，用户必须负责同步。CUDA 语义细节参见 CUDA Semantics。文中脚本示例展示了 CPU 与 CUDA 下语义差异。  
- 异步操作：`async_op=True`。集合操作函数返回分布式请求对象。通常无需手动创建，且该对象支持两种方法：  
  - `is_completed()`：CPU 集合完成返回 `True`；CUDA 操作则在操作成功入队到 CUDA 流且输出可在默认流使用后返回 `True`（无需额外同步）。  
  - `wait()`：CPU 集合会阻塞直到操作完成；CUDA 集合会阻塞当前活跃 CUDA 流直至操作完成（不阻塞 CPU）。  
  - `get_future()`：返回 `torch._C.Future` 对象。NCCL 支持，GLOO 与 MPI 大部分操作也支持（点对点如 send/recv 除外）。  
  注意：随着 Futures 与 API 的持续统一，`get_future()` 将来可能冗余。  

示例：以下代码可作为 CUDA 集合操作语义参考。它展示了在不同 CUDA 流上使用集合输出时显式同步的必要性：  
```python
# Code runs on each rank.
dist.init_process_group("nccl", rank=rank, world_size=2)
output = torch.tensor([rank]).cuda(rank)
s = torch.cuda.Stream()
handle = dist.all_reduce(output, async_op=True)
# Wait ensures the operation is enqueued, but not necessarily complete.
handle.wait()
# Using result on non-default stream.
with torch.cuda.stream(s):
    s.wait_stream(torch.cuda.default_stream())
    output.add_(100)
if rank == 0:
    # if the explicit call to wait_stream was omitted, the output below will be
    # non-deterministically 1 or 101, depending on whether the allreduce overwrote
    # the value after the add completed.
    print(output)
```

### 集合函数

`torch.distributed.broadcast(tensor, src=None, group=None, async_op=False, group_src=None)[source]#`  
将张量广播到整个组。参与该集合通信的所有进程中，张量元素个数必须一致。  
参数  
- `tensor` (`Tensor`) — 如果 `src` 是当前进程的 rank，则为发送数据；否则为接收后保存数据。  
- `src` (`int`) — 全局进程组中的源 rank。  
- `group` (`ProcessGroup`, 可选) — 进程组；为 `None` 时使用默认组。  
- `async_op` (`bool`, 可选) — 是否为异步操作。  
- `group_src` (`int`, 可选) — 组内源 rank。不能同时指定 `group_src` 与 `src`。  
返回  
- 若 `async_op=True`，返回异步工作句柄；若未异步或不在组内则返回 `None`。  

`torch.distributed.broadcast_object_list(object_list, src=None, group=None, device=None, group_src=None)[source]#`  
广播 `object_list` 中可 picklable 对象到整个组。与 `broadcast()` 类似，但可传入 Python 对象。  
参数  
- `object_list` (`List[Any]`) — 待广播的输入对象列表，每个对象必须可 picklable。  
- `src` (`int`) — 广播该对象列表的源 rank（全局进程组）。  
- `group` (`Optional[ProcessGroup]`) — 进程组；为 `None` 则使用默认组。  
- `device` (`torch.device`, 可选) — 不为 `None` 时会序列化对象并转成张量，再移动到设备后广播。  
- `group_src` (`int`, 可选) — 组内源 rank。不得同时指定 `group_src` 与 `src`。  
返回  
- `None`。若 rank 属于该组，`object_list` 将包含来自 `src` 的广播对象。  

注：对基于 NCCL 的进程组，内部张量表示必须在通信前移动到 GPU 设备；该设备由 `torch.cuda.current_device()` 提供，用户需确保每个进程都具有独立 GPU。  
注意：此 API 与 `broadcast()` 略有不同，因为它不返回 `async_op` 句柄，因此是阻塞调用。  
警告：对象集合有严重性能和扩展性限制，详见 Object collectives。  
警告：`broadcast_object_list()` 隐式使用 `pickle`，可能导致反序列化执行任意代码，仅对可信数据调用。  
警告：对 GPU 张量使用 `broadcast_object_list()` 不理想且低效，因为会发生 GPU->CPU 传输（张量需被 pickle）。请考虑改用 `broadcast()`。  

示例：
::>>> # Note: Process group initialization omitted on each rank.
>>> import torch.distributed as dist
>>> if dist.get_rank() == 0:
>>>     # Assumes world_size of 3.
>>>     objects = ["foo", 12, {1: 2}] # any picklable object
>>> else:
>>>     objects = [None, None, None]
>>> # Assumes backend is not NCCL
>>> device = torch.device("cpu")
>>> dist.broadcast_object_list(objects, src=0, device=device)
>>> objects
['foo', 12, {1: 2}]

`torch.distributed.all_reduce(tensor, op=<RedOpType.SUM: 0>, group=None, async_op=False)[source]#`  
在所有机器间归并张量数据，使所有进程最终都得到相同结果。调用后张量在所有进程上逐位一致。支持复数张量。  
参数  
- `tensor` (`Tensor`) — 集合通信的输入与输出；该函数原位执行。  
- `op`（可选）— `torch.distributed.ReduceOp` 中的一个值，指定逐元素归并操作。  
- `group` (`ProcessGroup`, 可选) — 进程组；默认值为默认组。  
- `async_op` (`bool`, 可选) — 是否异步。  
返回  
- 若 `async_op=True`，返回异步工作句柄；否则或不在组内则为 `None`。  

示例省略（含 `torch.int64`、`torch.cfloat`）略同原文，保留原代码与输出不变。  

`torch.distributed.reduce(tensor, dst=None, op=<RedOpType.SUM: 0>, group=None, async_op=False, group_dst=None)[source]#`  
归并张量数据到所有机器。仅目标 rank 的进程接收最终结果。  
参数  
- `tensor` (`Tensor`) — 集合通信输入与输出；原位执行。  
- `dst` (`int`) — 全局进程组上的目标 rank。  
- `op`（可选）— 指定逐元素归并操作。  
- `group` (`ProcessGroup`, 可选) — 工作进程组；默认默认组。  
- `async_op` (`bool`, 可选) — 是否异步。  
- `group_dst` (`int`, 可选) — 组内目标 rank。只能指定其一。  

返回  
- 若异步则返回工作句柄，否则或不在组内返回 `None`。  

`torch.distributed.all_gather(tensor_list, tensor, group=None, async_op=False)[source]#`  
将各进程张量收集到列表中。支持复数与不均匀尺寸张量。  
参数  
- `tensor_list` (`list[Tensor]`) — 输出列表，需包含正确尺寸张量。  
- `tensor` (`Tensor`) — 从当前进程广播的张量。  
- `group` (`ProcessGroup`, 可选) — 进程组。  
- `async_op` (`bool`, 可选) — 是否异步。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

示例省略（与原文示例及输出保持不变）。  

`torch.distributed.all_gather_into_tensor(output_tensor, input_tensor, group=None, async_op=False)[source]#`  
从所有 rank 收集张量并放入单一输出张量。要求所有进程输入张量大小一致。  
参数  
- `output_tensor` (`Tensor`) — 用于接收所有 rank 张量元素的输出张量，必须符合以下之一：  
  1) 按主维度拼接所有输入张量；  
  2) 按主维度堆叠所有输入张量。  
- `input_tensor` (`Tensor`) — 来自当前 rank 的待收集张量；不同于 `all_gather` API，本 API 要求各 rank 输入张量大小一致。  
- `group` (`ProcessGroup`, 可选) — 工作进程组；默认默认组。  
- `async_op` (`bool`, 可选) — 是否异步。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

示例：  
（示例与原文一致，代码与数值输出保持不变）  

`torch.distributed.all_gather_object(object_list, obj, group=None)[source]#`  
将可 picklable 对象从全部进程收集到列表。与 `all_gather()` 类似，但可传入 Python 对象。  
参数  
- `object_list` (`list[Any]`) — 输出列表，大小应等于该集合通信组大小。  
- `obj` (`Any`) — 当前进程要广播的可 picklable 对象。  
- `group` (`ProcessGroup`, 可选) — 进程组；默认默认组。  
返回  
- `None`。若调用 rank 属于该组，输出将写入 `object_list`。  

注：此 API 与 `all_gather()` 不同，不支持 `async_op`，因此是阻塞调用。  
注：NCCL 基础进程组中，内部张量表示必须先移动到 GPU。  
警告：对象集合存在性能与扩展性限制。详见 Object collectives。  
警告：`all_gather_object()` 使用 `pickle`，仅对可信数据调用。  
警告：GPU 张量情况下会发生 GPU->CPU 转移且低效，建议使用 `all_gather()`。  

示例：  
（示例与原文一致，保持代码和结果不变）  

`torch.distributed.gather(tensor, gather_list=None, dst=None, group=None, async_op=False, group_dst=None)[source]#`  
在单个进程收集张量列表。需要所有进程张量大小一致。  
参数  
- `tensor` (`Tensor`) — 输入张量。  
- `gather_list` (`list[Tensor]`, 可选) — 用于保存收集结果的同尺寸张量列表（默认 `None`，在目标 rank 上必须提供）。  
- `dst` (`int`, 可选) — 全局进程组中的目标 rank（若 `dst` 与 `group_dst` 均为 `None`，默认全局 rank 0）。  
- `group` (`ProcessGroup`, 可选) — 进程组。  
- `async_op` (`bool`, 可选) — 是否异步。  
- `group_dst` (`int`, 可选) — 组内目标 rank。不能同时指定 `dst` 与 `group_dst`。  
返回  
- `async_op=True` 时返回异步工作句柄；否则或不在组内返回 `None`。  

`torch.distributed.gather_object(obj, object_gather_list=None, dst=None, group=None, group_dst=None)[source]#`  
从全组收集可 picklable 对象到单进程。与 `gather()` 类似，但可传对象。  
参数  
- `obj` (`Any`) — 输入对象，必须可 picklable。  
- `object_gather_list` (`list[Any]`) — 输出列表。目标 rank 上应与组大小一致并将填充输出，非目标 rank 必须为 `None`。  
- `dst` (`int`, 可选) — 全局进程组目标 rank；默认全局 rank 0。  
- `group` (`Optional[ProcessGroup]`, 可选) — 进程组；默认默认组。  
- `group_dst` (`int`, 可选) — 组内目标 rank。不能同时指定 `dst` 与 `group_dst`。  
返回  
- `None`。目标 rank 的 `object_gather_list` 将包含集合结果。  

注：与 `gather` 相比，此 API 不支持 `async_op`。  
警告：对象集合限制见 Object collectives。  
警告：`gather_object()` 使用 `pickle`，仅信任输入数据。  
警告：GPU 张量路径不理想。  

示例：  
（示例与原文一致，保持原始代码与结果）  

`torch.distributed.scatter(tensor, scatter_list=None, src=None, group=None, async_op=False, group_src=None)[source]#`  
将张量列表散射到组内所有进程。每个进程接收且仅接收一个张量。支持复数张量。  
参数  
- `tensor` (`Tensor`) — 输出张量。  
- `scatter_list` (`list[Tensor]`) — 待散射张量列表（默认 `None`，源 rank 必须提供）。  
- `src` (`int`, 可选) — 全局进程组源 rank，默认全局 rank 0。  
- `group` (`ProcessGroup`, 可选) — 进程组。  
- `async_op` (`bool`, 可选) — 是否异步。  
- `group_src` (`int`, 可选) — 组内源 rank，不得与 `src` 同时指定。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

示例（与原文一致）：  
（代码与输出保持不变）  

`torch.distributed.scatter_object_list(scatter_object_output_list, scatter_object_input_list=None, src=None, group=None, group_src=None)[source]#`  
将 `scatter_object_input_list` 中可 picklable 对象散射到全组。与 `scatter()` 类似，但可传入 Python 对象。每个 rank 上收到的对象存放在 `scatter_object_output_list` 的第一个位置。  
参数  
- `scatter_object_output_list` (`List[Any]`) — 非空列表，第一项将保存散射到该 rank 的对象。  
- `scatter_object_input_list` (`List[Any]`, 可选) — 要散射的输入对象列表。每项必须可 picklable。仅源 rank 上对象生效，非源 rank 可为 `None`。  
- `src` (`int`) — 散射源 rank；默认全局 rank 0。  
- `group` (`Optional[ProcessGroup]`, 可选) — 进程组。  
- `group_src` (`int`, 可选) — 组内源 rank，不能与 `src` 同时指定。  
返回  
- `None`。若 rank 在组内，`scatter_object_output_list` 首项为该 rank 的散射对象。  

注：与 `scatter` 的差异是本 API 无 `async_op`，是阻塞调用。  
警告：对象集合相关限制与安全性同前述。  

示例（与原文一致）：  
（代码与输出保持不变）  

`torch.distributed.reduce_scatter(output, input_list, op=<RedOpType.SUM: 0>, group=None, async_op=False)[source]#`  
先归并再将结果分散到组内所有进程。  
参数  
- `output` (`Tensor`) — 输出张量。  
- `input_list` (`list[Tensor]`) — 待归并和分散的张量列表。  
- `op`（可选）— 归并操作。  
- `group` (`ProcessGroup`, 可选)。  
- `async_op` (`bool`, 可选)。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

`torch.distributed.reduce_scatter_tensor(output, input, op=<RedOpType.SUM: 0>, group=None, async_op=False)[source]#`  
先归并再将结果分散到组内所有 rank。  
参数  
- `output` (`Tensor`) — 输出张量，各 rank 大小一致。  
- `input` (`Tensor`) — 输入张量，大小应为输出张量大小乘以 world size。可以是  
  1) 输出张量按主维度拼接；或  
  2) 按主维度堆叠。  
- `group` (`ProcessGroup`, 可选)。  
- `async_op` (`bool`, 可选)。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

示例（与原文一致）  

`torch.distributed.all_to_all_single(output, input, output_split_sizes=None, input_split_sizes=None, group=None, async_op=False)[source]#`  
将输入张量切分后散射到组内所有进程。随后将接收的张量按 rank 拼接为单一输出张量。支持复数张量。  
参数  
- `output` (`Tensor`) — 聚合后输出张量。  
- `input` (`Tensor`) — 待散射输入张量。  
- `output_split_sizes` — （列表[int]，可选）：输出拆分大小；若为 `None` 或空，则 `output` 的主维度必须可被 world size 整除。  
- `input_split_sizes` — （列表[int]，可选）：输入拆分大小；若为 `None` 或空，则 `input` 的主维度必须可被 world size 整除。  
- `group` (`ProcessGroup`, 可选)。  
- `async_op` (`bool`, 可选)。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

警告：`all_to_all_single` 为实验性，可能变更。  

示例（包含均匀与不均匀拆分、复数张量）与原文一致。  

`torch.distributed.all_to_all(output_tensor_list, input_tensor_list, group=None, async_op=False)[source]#`  
将输入张量列表散射到组内并返回收集后的输出列表。支持复数张量。  
参数  
- `output_tensor_list` (`list[Tensor]`) — 每个 rank 的输出张量列表。  
- `input_tensor_list` (`list[Tensor]`) — 每个 rank 的输入张量列表。  
- `group` (`ProcessGroup`, 可选)。  
- `async_op` (`bool`, 可选)。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

警告：`all_to_all` 为实验性，可能变更。  

示例（与原文一致）  

`torch.distributed.barrier(group=None, async_op=False, device_ids=None)[source]#`  
同步所有进程。若 `async_op=False`，该集合会阻塞进程直到全组进入此函数；或若异步返回句柄，需对句柄调用 `wait()`。  
参数  
- `group` (`ProcessGroup`, 可选) — 进程组。  
- `async_op` (`bool`, 可选) — 是否异步。  
- `device_ids` (`[int]`, 可选) — 设备/GPU id 列表，通常只需一个。  
返回  
- 若异步则返回工作句柄；否则或不在组内返回 `None`。  

注意：`ProcessGroupNCCL` 现在会阻塞 CPU 线程直至 barrier 完成。  
注意：`ProcessGroupNCCL` 将 barrier 实现为长度为 1 的张量 `all_reduce`。设备选择按以下顺序：  
1) `barrier` 的 `device_ids` 非空时的第一项；  
2) `init_process_group` 提供的设备；  
3) 若已执行过带张量输入的集合通信，则使用该进程组首次使用的设备；  
4) 默认使用 `global rank mod local device count`。  

`torch.distributed.monitored_barrier(group=None, timeout=None, wait_all_ranks=False)[source]#`  
与 `torch.distributed.barrier` 类似，但支持可配置超时，并可报告未在该超时内通过 barrier 的 rank。  
对非零 rank，该函数会阻塞，直到处理来自 rank 0 的 send/recv。rank 0 会阻塞直到处理完其他所有 rank 的 send/recv，并报告未按时响应的 rank。  
若某 rank 没有到达 `monitored_barrier`（例如死锁），则所有 rank 都会在该函数中失败。该集合会阻塞组内所有进程直到全部成功退出，因此在调试和主机侧同步场景很有用；但会带来性能影响，仅用于调试或确需 host 侧全同步的场景。  
参数  
- `group` (`ProcessGroup`, 可选) — 进程组。  
- `timeout` (`datetime.timedelta`, 可选) — 超时；为 `None` 则使用默认进程组超时。  
- `wait_all_ranks` (`bool`, 可选) — 是否收集所有失败 rank。默认 `False` 时，rank 0 遇到首个失败 rank 即快速失败；置为 `True` 时会收集所有失败 rank 并在错误中报告。  
返回  
- `None`。  

示例：  
（原文示例保持不变）  

`class torch.distributed.Work#`  
`Work` 对象表示 PyTorch 分布式包中挂起异步操作的句柄。它由非阻塞集合操作返回（如 `dist.all_reduce(tensor, async_op=True)`）。  

`block_current_stream(self: torch._C._distributed_c10d.Work) → None#`  
阻塞当前活动 CUDA 流直到操作完成。对 GPU 集合而言等同于同步；对通过 Gloo 等 CPU 发起的集合，此方法会阻塞 CUDA 流直到完成。此方法在任何情况下均立即返回。要检查是否成功应异步检查 `Work` 结果。  

`boxed(self: torch._C._distributed_c10d.Work) → object#`  
`exception(self: torch._C._distributed_c10d.Work) → std::__exception_ptr::exception_ptr#`  
`get_future(self: torch._C._distributed_c10d.Work) → torch.Future#`  
返回与该 `Work` 完成关联的 `torch.futures.Future`。例如：`fut = process_group.allreduce(tensors).get_future()`。  
示例：  
（原文示例保留不变）

`Warning get_future API supports NCCL, and partially GLOO and MPI backends (no support for peer-to-peer operations like send/recv) and will return a torch.futures.Future.`  
如上示例，`allreduce` 工作在 NCCL 上使用 GPU 执行；`fut.wait()` 返回时会与 PyTorch 当前设备流同步相应 NCCL 流，确保支持异步 CUDA 执行，并不必等待 GPU 上整个操作完成。  
`CUDAFuture` 不支持 `TORCH_NCCL_BLOCKING_WAIT` 标志或 NCCL 的 barrier。若回调函数通过 `fut.then()` 添加，将在 WorkNCCL 的 NCCL 流与 `ProcessGroupNCCL` 的专用回调流同步后，在回调流上内联调用。`fut.then()` 返回另一个 `CUDAFuture`，包含回调返回值与记录回调流的 CUDAEvent。  
对于 CPU 工作，`fut.done()` 返回 `true` 表示完成，`value()` 可取张量；  
对于 GPU 工作，`fut.done()` 返回 `true` 只表示已入队；  
对于混合 CPU-GPU 工作（例如使用 GLOO 发送 GPU 张量），`fut.done()` 返回 `true` 表示张量已到达各节点，但不保证已在各 GPU 上同步（与 GPU 工作类似）。  

`get_future_result(self: torch._C._distributed_c10d.Work) → torch.Future#`  
返回 `WorkResult` 枚举类型整数的 `torch.futures.Future`。  
示例：`fut = process_group.allreduce(tensor).get_future_result()`；`fut.wait()` 会阻塞等待完成并返回 `WorkResult`；`fut.then(call_back_func)` 可在完成时回调。  

`is_completed(self: torch._C._distributed_c10d.Work) → bool#`  
`is_success(self: torch._C._distributed_c10d.Work) → bool#`  
`result(self: torch._C._distributed_c10d.Work) → list[torch.Tensor]#`  
`source_rank(self: torch._C._distributed_c10d.Work) → int#`  
`synchronize(self: torch._C._distributed_c10d.Work) → None#`  
`static unbox(arg0: object) → torch._C._distributed_c10d.Work#`  
`wait(self: torch._C._distributed_c10d.Work, timeout: datetime.timedelta = datetime.timedelta(0)) → bool#`  
返回 `true/false`。示例：  
:: try:work.wait(timeout) except:# some handling  

警告：通常不需要设置超时。`wait()` 与 `synchronize()` 类似：让当前流在 NCCL 工作完成时阻塞。若设置超时，则会阻塞 CPU 线程，直到 NCCL 工作完成或超时；超时将抛异常。  

`class torch.distributed.ReduceOp#`  
可用归并操作枚举：`SUM`, `PRODUCT`, `MIN`, `MAX`, `BAND`, `BOR`, `BXOR`, `PREMUL_SUM`。  
`BAND`、`BOR`、`BXOR` 在 NCCL 后端下不可用。  
`AVG` 在求和前按 world size 平均，仅 NCCL 后端可用，且仅 NCCL 2.10 及以上版本。  
`PREMUL_SUM` 在归并前先对输入做局部标量乘法，仅 NCCL 后端可用，且仅 NCCL 2.11 及以上版本。`PREMUL_SUM` 应使用 `torch.distributed._make_nccl_premul_sum`。  
此外 `MAX`、`MIN`、`PRODUCT` 不支持复数张量。  
该类值可通过 `ReduceOp.SUM` 等属性访问，用于 `reduce()` 等操作；本类不支持 `__members__` 属性。  

`class torch.distributed.reduce_op#`  
已弃用的归并操作枚举，值为 `SUM`, `PRODUCT`, `MIN`, `MAX`。建议改用 `ReduceOp`。  

### 分布式键值存储  
分布式包自带键值存储，可在进程组内共享信息，也可在 `torch.distributed.init_process_group()` 中作为替代 `init_method` 的初始化方式。  
可选类型为：`TCPStore`、`FileStore`、`HashStore`。  

`class torch.distributed.Store#`  
`Torch.distributed` 提供的所有 store 的基类。  

（以下 `add`、`append`、`check`、`clone`、`compare_set`、`delete_key`、`get`、`has_extended_api`、`multi_get`、`multi_set`、`num_keys`、`queue_len`、`queue_pop`、`queue_push`、`set`、`set_timeout`、`timeout` 属性、`wait` 重载等）  
说明文字按原样保留 API 名称与参数名，仅翻译为中文。  
`torch.distributed.Store` 的这些方法用于设置、读取、检查、比较设置、删除、等待与队列操作；示例与参数说明与原文一致，保留原命令与输出。  
注意：`delete_key` 仅 `TCPStore` 与 `HashStore` 支持，`FileStore` 调用会抛异常。  

`class torch.distributed.TCPStore#`  
基于 TCP 的分布式键值存储实现。服务端存储保存数据，客户端通过 TCP 连接执行 `set`、`get` 等操作。必须始终有一个服务端实例初始化，客户端等待服务端建立连接。  
参数与示例保持不变（`host_name`, `port`, `world_size`, `is_master`, `timeout`, `wait_for_workers`, `multi_tenant`, `master_listen_fd`, `use_libuv` 等）。  
`__init__` 说明和 `host`、`libuvBackend`、`port` 属性同原文。  

`class torch.distributed.HashStore#`  
基于哈希表的线程安全实现，可在同一进程内不同线程使用，不可跨进程。示例保留。  

`class torch.distributed.FileStore#`  
基于文件的存储实现。参数与示例保留。  

`property path`  
返回 FileStore 使用的路径。  

`class torch.distributed.PrefixStore#`  
对 `TCPStore`、`FileStore`、`HashStore` 任一进行包装，在每个 key 前加前缀。  
参数、构造与 `underlying_store` 属性说明与原文一致。  

### 集合通信性能分析  
可使用 `torch.profiler`（推荐）或 `torch.autograd.profiler` 对这里提及的集合通信与点对点通信 API 做 profiling。所有现成后端（gloo、nccl、mpi）均支持，在追踪中会按预期渲染。  
Profiling 代码与文档参考与原文一致。  

### 多 GPU 集合函数  
警告：多 GPU 函数（每个 CPU 线程多个 GPU）已弃用。当前 PyTorch Distributed 首选编程模型是“一线程一设备”，本文档 API 即为示例。若你是后端开发者并希望支持每线程多设备，请联系 PyTorch Distributed 维护者。  

### 对象集合（Object collectives）  
警告：对象集合有多项限制。请在使用前评估适用性。  
对象集合为一组类似集合的操作，可作用于任意可 pickle 的 Python 对象。其实现大致过程为：  
1) 将输入对象转为 pickle（原始字节）；  
2) 将该字节张量尺寸通过一次集合通信发送给对端；  
3) 分配足够大小的张量执行真正通信；  
4) 将原始数据反序列化回 Python 对象。  

对象集合可能出现意外的性能或内存特征，导致长时间运行或 OOM，应谨慎使用。常见问题包括：  
- 非对称 pickle/unpickle 时间：对象越多/越大，pickle 越慢。对于扇入（如 `gather_object`），接收 rank 反序列化对象次数多于发送端，可能导致发送端后续集体超时。  
- 通信效率低下：张量应优先通过常规集合 API 发送，不建议对象集合；即使可行，序列化与反序列化（CPU 同步及非 CPU 张量设备到主机拷贝）会带来开销。  
- 设备行为异常：若 pickle 的 tensor 在 `cuda:3`，反序列化后无论所在进程是哪个都会得到 `cuda:3` 上的张量；常规张量集合则保持本地设备。反序列化时可能触发首次 CUDA 上下文创建导致 GPU 内存浪费。可将对象列表转为 CPU 张量后再参与对象集合。  

### 第三方后端  
除了内建 `GLOO/MPI/NCCL`，PyTorch distributed 也支持运行时注册第三方后端。开发第三方后端可参考 C++ 扩展示例与 `test/cpp_extensions/cpp_c10d_extension.cpp`。  
第三方后端能力由自身实现决定。新后端从 `c10d::ProcessGroup` 派生，并在导入时通过 `torch.distributed.Backend.register_backend()` 注册后端名与实例化接口。  
警告：第三方后端支持仍属实验性，可能变化。  

### 启动工具  
`torch.distributed` 在 `torch.distributed.launch` 提供训练启动工具。此辅助程序用于在每节点启动多进程进行分布式训练。`torch.distributed.launch` 是一个模块，可在每个训练节点上启动多个进程。  
警告：此模块即将弃用，推荐改用 `torchrun`。  
该工具可用于单机分布式训练（每节点一个或多个进程）。可用于 CPU 或 GPU 训练；若用于 GPU，每个分布式进程对应单个 GPU。  
对多机训练也可用此方法。  

用法：  
- 单机多进程：
`python -m torch.distributed.launch --nproc-per-node=NUM_GPUS_YOU_HAVE YOUR_TRAINING_SCRIPT.py (--arg1 --arg2 --arg3 ...)`  
- 多机多进程（两节点示例）：  
Node 1:
`python -m torch.distributed.launch --nproc-per-node=NUM_GPUS_YOU_HAVE --nnodes=2 --node-rank=0 --master-addr="192.168.1.1" --master-port=1234 YOUR_TRAINING_SCRIPT.py (...)`  
Node 2:
`python -m torch.distributed.launch --nproc-per-node=NUM_GPUS_YOU_HAVE --nnodes=2 --node-rank=1 --master-addr="192.168.1.1" --master-port=1234 YOUR_TRAINING_SCRIPT.py (...)`  

可通过 `python -m torch.distributed.launch --help` 查看可选参数。  
重要提醒：  
1) 该工具及单机/多机 GPU 多进程训练在最佳性能下依赖 NCCL，因此 GPU 训练推荐 NCCL。  
2) 你的训练程序必须解析 `--local-rank=LOCAL_PROCESS_RANK`（模块会提供）。若使用 GPU，应确保代码只运行在该本地 rank 对应 GPU。可用：  
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--local-rank", "--local_rank", type=int)
args = parser.parse_args()
```
并将设备设置为本地 rank：  
```python
torch.cuda.set_device(args.local_rank)
# 或
with torch.cuda.device(args.local_rank):
    ...
```
3.0.0: launcher 会向脚本传递 `--local-rank=<rank>`。从 2.0.0 起推荐短横线形式以兼容；出于兼容性，仍可能需要同时支持两者。若只提供 `--local_rank`，会报错 `error: unrecognized arguments: –local-rank=<rank>`。只支持 2.0.0+ 的训练代码可仅处理 `--local-rank`。  
3) 训练程序应在开始处调用分布式后端初始化；强烈推荐 `init_method=env://`。  
4) 可使用常规分布式 API，也可使用 `torch.nn.parallel.DistributedDataParallel()`。若使用 GPU 且使用 DDP，请按以下方式配置：  
```python
model = torch.nn.parallel.DistributedDataParallel(model, device_ids=[args.local_rank], output_device=args.local_rank)
```
请确保 `device_ids` 仅包含当前进程使用的那一个 GPU，一般为 `args.local_rank`，`output_device` 也应设置为该值。  
5) 另一种传递 local_rank 的方式是通过环境变量 `LOCAL_RANK`（当使用 `--use-env=True` 时）。此时模块不会传 `--local-rank`。需改用 `os.environ['LOCAL_RANK']`。  
警告：`local_rank` 不是全局唯一，只在单机内唯一。不要用它决定是否写共享文件系统。  

（该提示在 pytorch/pytorch#12042 有反例说明）。  

### Spawn 工具  
`torch.multiprocessing` 提供 `torch.multiprocessing.spawn()`。该函数可用于启动多进程，方式为给定函数并派生 N 个子进程，可用于多进程分布式训练。参考 PyTorch ImageNet 示例。注意此函数要求 Python 3.4+。  

## 调试 torch.distributed 应用  

分布式应用调试可能因难以理解的卡顿、崩溃或跨 rank 行为不一致而复杂。`torch.distributed` 提供了一组自助调试工具。  

### Python Breakpoint  
在分布式环境中使用 Python 调试器不便，`pdb` 常难直接使用。PyTorch 提供 `torch.distributed.breakpoint` 封装，简化流程。它会：
- 仅在用户指定的一个 rank 附着调试器；
- 使用 `torch.distributed.barrier()` 让其余 rank 停止，待被调试 rank `continue` 后释放；
- 将子进程 stdin 重定向到终端。  
在所有 rank 上调用 `torch.distributed.breakpoint(rank)` 即可使用。  

### Monitored Barrier  
从 v1.10 起，`torch.distributed.monitored_barrier()` 可替代 `torch.distributed.barrier()`，当部分 rank 崩溃（例如没有都调用 barrier）时会返回更多信息。  
其实现使用 host-side send/recv 形式确认，允许 rank 0 报告超时未确认的 rank。  
示例函数中 rank 1 不调用 `monitored_barrier()` 可触发错误：  
`RuntimeError: Rank 1 failed to pass monitoredBarrier in 2000 ms`  
（原始示例与环境、异常信息保持不变）。  

### TORCH_DISTRIBUTED_DEBUG  
设置环境变量 `TORCH_DISTRIBUTED_DEBUG` 可配合 `TORCH_CPP_LOG_LEVEL` 输出额外日志并检查集合同步。可选值 `OFF`（默认）、`INFO`、`DETAIL`。  
`DETAIL` 最详细，可能影响性能，仅用于调试。  
`INFO` 在 DDP 初始化时额外日志；`DETAIL` 还会输出选择性迭代的运行时统计（如 forward/backward 时间、通信时间等）。  

示例程序、`TORCH_DISTRIBUTED_DEBUG=INFO` 与 `DETAIL` 的初始化/运行日志与原文一致，保持不变。  

`TORCH_DISTRIBUTED_DEBUG=INFO` 还会增强 DDP 的未使用参数崩溃日志。若模型存在前向未用参数，建议 `find_unused_parameters=True`。在计算损失时应使用全部 `forward` 输出；否则会报类似参数未参与反向的错误，并列出未参与梯度的参数。  

`TORCH_DISTRIBUTED_DEBUG=DETAIL` 会对每次集合调用进行一致性和同步检查：  
- 通过 `torch.distributed.monitored_barrier()` 确保所有 rank 完成挂起集合；  
- 检查集体调用匹配性和张量形状一致。  
若不一致，不会僵死而是抛出详细错误。  

`torch.distributed.set_debug_level()`、`set_debug_level_from_env()`、`get_debug_level()` 提供运行期细粒度控制。  
`TORCH_DISTRIBUTED_DEBUG=DETAIL` 可与 `TORCH_SHOW_CPP_STACKTRACES=1` 联用，打印完整调用栈。该检查适用于所有使用 `init_process_group()` 与 `new_group()` 创建 process group 的 c10d 集合调用。  

### 日志  
除显式调试（`monitored_barrier`、`TORCH_DISTRIBUTED_DEBUG`) 外，`torch.distributed` 的底层 C++ 库也输出不同级别日志。对理解分布式训练执行状态、排查网络连接故障有帮助。日志级别矩阵如下（保持原文含义）：  

`TORCH_CPP_LOG_LEVEL` 与 `TORCH_DISTRIBUTED_DEBUG` -> 实际日志级别：  
- ERROR / ignored / ERROR  
- WARNING / ignored / WARNING  
- INFO / ignored / Info  
- INFO / INFO / Debug  
- INFO / DETAIL / Trace (a.k.a. All)  

分布式组件抛出的异常来自 `RuntimeError` 派生：  
- `torch.distributed.DistError`：所有分布式异常基类型。  
- `torch.distributed.DistBackendError`：后端特定错误（如 NCCL 不支持某 GPU）。  
- `torch.distributed.DistNetworkError`：网络层错误（如连接被对端重置）。  
- `torch.distributed.DistStoreError`：Store 错误（如 TCPStore 超时）。  

对应 class 定义与原文一致。  

若为单节点训练，在脚本中交互式断点可使用：  
`torch.distributed.breakpoint(rank=0, skip=0, timeout_s=3600)[source]#`  
在单个 rank 上设置断点，其余 rank 会等待。  
参数  
- `rank`（`int`）— 要中断的 rank，默认 0。  
- `skip`（`int`）— 跳过前 `skip` 次断点调用，默认 0。

```
torch.distributed
```

**模式 3：** 初始化# 该包在调用任何其他方法前需要先使用 `torch.distributed.init_process_group()` 或 `torch.distributed.device_mesh.init_device_mesh()` 进行初始化。两者都会阻塞，直到所有进程加入。  
警告 初始化不是线程安全的。进程组创建应在单个线程中执行，以防不同 rank 之间出现不一致的 `UUID` 分配，并避免初始化期间的竞争条件导致挂起。  

torch.distributed.is_available()[source]# 如果分布式包可用则返回 `True`。否则，`torch.distributed` 不会公开任何其他 API。当前，`torch.distributed` 在 Linux、MacOS 和 Windows 上可用。构建 PyTorch 时设置 `USE_DISTRIBUTED=1` 可启用它。当前默认值为 Linux 和 Windows 的 `USE_DISTRIBUTED=1`，MacOS 的 `USE_DISTRIBUTED=0`。返回类型 `bool`  

torch.distributed.init_process_group(backend=None, init_method=None, timeout=None, world_size=-1, rank=-1, store=None, group_name='', pg_options=None, device_id=None)[source]# 初始化默认的分布式进程组。这也会初始化分布式包。主要有两种方式初始化进程组：显式指定 `store`、`rank` 和 `world_size`。指定 `init_method`（一个 URL 字符串），用于指示如何发现对等节点。可选地指定 `rank` 和 `world_size`，或将所需参数全部编码在 URL 中并省略它们。若两者都未指定，则 `init_method` 默认为 “env://”。  
参数  
backend (str 或 Backend，可选) – 要使用的后端。根据构建时配置，合法值包括 `mpi`、`gloo`、`nccl`、`ucc`、`xccl` 或由第三方插件注册的后端。自 2.6 起，如果未提供 `backend`，`c10d` 将使用由 `device_id` 关键字参数指示的设备类型所注册的后端（如果提供了该参数）。当前已知的默认注册如下：`cuda` 对应 `nccl`，`cpu` 对应 `gloo`，`xpu` 对应 `xccl`。如果既未提供 `backend` 也未提供 `device_id`，`c10d` 将检测运行机器上的加速器，并使用该检测到的加速器（或 `cpu`）所注册的后端。该字段可传入小写字符串（例如 `"gloo"`），也可通过 `Backend` 属性访问（例如 `Backend.GLOO`）。  
如果在每台机器上使用多个进程并采用 `nccl` 后端，则每个进程必须独占它使用的每个 GPU，因为在进程之间共享 GPU 可能导致死锁或 NCCL 非法使用。`ucc` 后端为实验性。可通过 `get_default_backend_for_device()` 查询设备的默认后端。  
init_method (str，可选) – 用于初始化进程组的 URL。若未指定 `init_method` 或 `store`，默认值为 “env://”。与 `store` 互斥。  
world_size (int，可选) – 作业中参与的进程数。若指定了 `store`，则必填。  
rank (int，可选) – 当前进程的 rank（应为 0 到 `world_size-1` 之间的数字）。若指定了 `store`，则必填。  
store (Store，可选) – 所有工作节点可访问的键值存储，用于交换连接/地址信息。与 `init_method` 互斥。  
timeout (timedelta，可选) – 针对进程组执行操作的超时时间。`NCCL` 的默认值为 10 分钟，其他后端为 30 分钟。达到该时长后，集合通信将被异步中止，并使进程崩溃。之所以这样做，是因为 CUDA 执行是异步的，继续执行用户代码不再安全，因为失败的异步 NCCL 操作可能导致后续 CUDA 操作基于损坏的数据运行。若设置了 `TORCH_NCCL_BLOCKING_WAIT`，进程将阻塞并等待该超时。  
group_name (str，可选，已弃用) – 组名。该参数被忽略。  
pg_options (ProcessGroupOptions，可选) – 进程组选项，用于在构建特定进程组时传递需要的附加配置。目前我们唯一支持的选项是 `nccl` 后端的 `ProcessGroupNCCL.Options`，可指定 `is_high_priority_stream`，以便在存在等待计算核时让 `nccl` 后端可选取高优先级 `cuda` 流。有关配置 `nccl` 的其他可用选项，请参见 https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-t  
device_id (torch.device | int，可选) – 当前进程将工作的单个、特定设备，可启用后端特定优化。当前仅在 `NCCL` 下有两个影响：通信器会立即创建（立即调用 `ncclCommInit*`，而不是正常的懒调用）并且子组会在可能时使用 `ncclCommSplit` 以避免不必要的组创建开销。如果你想更早获知 `NCCL` 初始化错误，也可以使用该字段。若提供 `int`，API 假设将使用编译时确定的加速器类型。  
注意：要启用 `backend == Backend.MPI`，PyTorch 需要在支持 MPI 的系统上从源码构建。  
注意：多后端支持为实验性特性。当前在未指定后端时，会创建 `gloo` 和 `nccl` 两个后端。`gloo` 后端将用于 `CPU` 张量的集合通信，`nccl` 后端将用于 `CUDA` 张量的集合通信。可通过传入形如 `"<device_type>:<backend_name>,<device_type>:<backend_name>"` 的字符串来指定自定义后端，例如 `"cpu:gloo,cuda:custom_backend"`。  

torch.distributed.device_mesh.init_device_mesh(device_type, mesh_shape, *, mesh_dim_names=None, backend_override=None)[source]# 根据 `device_type`、`mesh_shape` 和 `mesh_dim_names` 参数初始化一个 `DeviceMesh`。这将创建一个具有 `n` 维数组布局的 `DeviceMesh`，其中 `n` 为 `mesh_shape` 的长度。如果提供了 `mesh_dim_names`，则每个维度标注为 `mesh_dim_names[i]`。注意 `init_device_mesh` 遵循 SPMD 编程模型，即同一份 PyTorch Python 程序在集群中的所有进程/rank 上运行。请确保所有 rank 上的 `mesh_shape`（描述设备布局的 n 维数组维度）一致。`mesh_shape` 不一致可能导致挂起。  
注意：如果未发现进程组，`init_device_mesh` 将在后台初始化分布式进程组/通信所需的进程组。  
参数  
device_type (str) – 网格的设备类型。当前支持：“cpu”、“cuda/cuda-like”、“xpu”。不允许传入带 GPU 索引的设备类型，如 “cuda:0”。  
mesh_shape (Tuple[int]) – 定义描述设备布局的多维数组维度的元组。  
mesh_dim_names (Tuple[str], 可选) – 一个用于给描述设备布局多维数组每个维度赋名的元组。其长度必须与 `mesh_shape` 的长度一致。`mesh_dim_names` 中的每个字符串必须唯一。  
backend_override (Dict[int | str, tuple[str, Options] | str | Options], 可选) – 覆盖将为每个网格维度创建的部分或全部 `ProcessGroup`。每个键可以是维度索引或其名称（若提供了 `mesh_dim_names`）。每个值可以是包含后端名称及其选项的元组，也可以仅包含这两者之一（此时另一项将使用默认值）。  
返回 一个表示设备布局的 `DeviceMesh` 对象。返回类型 `DeviceMesh`  

示例:  
`>>> from torch.distributed.device_mesh import init_device_mesh`  
`>>>`  
`>>> mesh_1d = init_device_mesh("cuda", mesh_shape=(8,))`  
`>>> mesh_2d = init_device_mesh("cuda", mesh_shape=(2, 8), mesh_dim_names=("dp", "tp"))`  

torch.distributed.is_initialized()[source]# 检查默认进程组是否已初始化。返回类型 `bool`  

torch.distributed.is_mpi_available()[source]# 检查 `MPI` 后端是否可用。返回类型 `bool`  

torch.distributed.is_nccl_available()[source]# 检查 `NCCL` 后端是否可用。返回类型 `bool`  

torch.distributed.is_gloo_available()[source]# 检查 `Gloo` 后端是否可用。返回类型 `bool`  

torch.distributed.distributed_c10d.is_xccl_available()[source]# 检查 `XCCL` 后端是否可用。返回类型 `bool`  

torch.distributed.is_torchelastic_launched()[source]# 检查该进程是否通过 `torch.distributed.elastic`（即 `torchelastic`）启动。会以 `TORCHELASTIC_RUN_ID` 环境变量是否存在作为代理，判断当前进程是否由 `torchelastic` 启动。此变量可作为合理代理，因为 `TORCHELASTIC_RUN_ID` 映射到 rendezvous id，它始终是非空值，表示用于对等节点发现目的的作业 ID。返回类型 `bool`  

torch.distributed.get_default_backend_for_device(device)[source]# 返回给定设备的默认后端。  
参数 device (Union[str, torch.device]) – 要查询默认后端的设备。  
返回 给定设备的默认后端（小写字符串）。返回类型 `str`  

目前支持三种初始化方法：TCP 初始化# 使用 TCP 初始化有两种方式，均要求可从所有进程访问的网络地址以及期望的 `world_size`。第一种方式需要指定一个属于 rank 0 进程的地址。该方式要求所有进程手动指定 rank。请注意，在最新的分布式包中，不再支持多播地址。`group_name` 也已弃用。  

```python
import torch.distributed as dist
# Use address of one of the machines
dist.init_process_group(backend, init_method='tcp://10.1.1.20:23456', rank=args.rank, world_size=4)
```

共享文件系统初始化# 另一种初始化方法依赖于一个所有机器都可见并共享的文件系统，以及期望的 `world_size`。URL 应以 `file://` 开头，并包含共享文件系统上现有目录中的一个不存在文件路径。文件系统初始化若文件不存在会自动创建该文件，但不会删除它。因此，需你自行确保在同一路径名上再次调用 `init_process_group()` 前清理该文件。请注意，在最新的分布式包中，自动 rank 分配不再支持，`group_name` 也已弃用。  
警告：该方法假设文件系统支持使用 `fcntl` 的锁机制——大多数本地系统和 NFS 都支持。  
警告：该方法始终会创建该文件，并尽最大努力在程序结束时清理并删除该文件。换言之，每次使用文件初始化方法进行初始化时，都需要一个全新的空文件才能成功。如果重复使用上一次初始化留下的文件（未清理），将会出现异常行为，且常常导致死锁和失败。因此，即使该方法会尽力清理文件，如果自动删除失败，也由你负责在训练结束时删除该文件，以防在下次再次初始化时文件被复用。这在你计划对同一文件名多次调用 `init_process_group()` 时尤其重要。换言之，如果文件未删除/清理，并且你再次对该文件调用 `init_process_group()`，则预期会出现失败。经验法则是：每次调用 `init_process_group()` 时，确保该文件不存在或为空。  

```python
import torch.distributed as dist
# rank should always be specified
dist.init_process_group(backend, init_method='file:///mnt/nfs/sharedfile', world_size=4, rank=args.rank)
```

环境变量初始化# 该方法将从环境变量读取配置，允许你完全自定义如何获取信息。需设置的变量有：  
`MASTER_PORT` - 必需；必须是 rank 0 节点上一个空闲端口  
`MASTER_ADDR` - 必需（rank 0 可省略）；rank 0 节点的地址  
`WORLD_SIZE` - 必需；可在此设置，也可在初始化调用中设置  
`RANK` - 必需；可在此设置，也可在初始化调用中设置  
rank 0 的机器将用于建立所有连接。这是默认方法，即 `init_method` 不必指定（或可设为 `env://`）。  

初始化耗时优化# `TORCH_GLOO_LAZY_INIT` - 按需建立连接，而不是使用完整网状连接，这可以显著改善非 all2all 操作的初始化时间。

`torch.distributed.init_process_group()`

**Pattern 4:** Example:

```python
>>> from torch.distributed.device_mesh import init_device_mesh
>>>
>>> mesh_1d = init_device_mesh("cuda", mesh_shape=(8,))
>>> mesh_2d = init_device_mesh("cuda", mesh_shape=(2, 8), mesh_dim_names=("dp", "tp"))
```

**Pattern 5:** Groups# 默认情况下，collectives 在默认组（也称为 world）上运行，并要求所有进程进入分布式函数调用。然而，某些负载场景可以从更细粒度的通信中受益。此时分布式组便发挥作用。可以使用 `new_group()` 创建新的组，并可包含全部进程的任意子集。它返回一个不透明的组句柄，可作为 `group` 参数传递给所有 collective（collective 是用于按特定常见编程模式交换信息的分布式函数）。

`torch.distributed.new_group(ranks=None, timeout=None, backend=None, pg_options=None, use_local_synchronization=False, group_desc=None, device_id=None)[source]# Create a new distributed group. This function requires that all processes in the main group (i.e. all processes that are part of the distributed job) enter this function, even if they are not going to be members of the group. Additionally, groups should be created in the same order in all processes. Warning Safe concurrent usage: When using multiple process groups with the NCCL backend, the user must ensure a globally consistent execution order of collectives across ranks. If multiple threads within a process issue collectives, explicit synchronization is necessary to ensure consistent ordering. When using async variants of torch.distributed communication APIs, a work object is returned and the communication kernel is enqueued on a separate CUDA stream, allowing overlap of communication and computation. Once one or more async ops have been issued on one process group, they must be synchronized with other cuda streams by calling work.wait() before using another process group. See Using multiple NCCL communicators concurrently <https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently> for more details.`

Parameters
`ranks` (`list[int]`) – 组成员的 rank 列表。如果为 `None`，则会设为全部 rank。默认值为 `None`。  
`timeout` (`timedelta`, optional) – 详见 `init_process_group` 的文档和默认值。  
`backend` (`str` 或 `Backend`, optional) – 要使用的后端。根据构建时配置，有效值为 `gloo` 和 `nccl`。默认使用与全局组相同的后端。该字段应使用小写字符串（如 `"gloo"`），也可通过 `Backend` 属性访问（如 `Backend.GLOO`）。如果传入 `None`，将使用默认进程组对应的后端。默认值为 `None`。  
`pg_options` (`ProcessGroupOptions`, optional) – 进程组选项，指定在构建特定进程组时需要传入的其他设置。即对于 `nccl` 后端，可以指定 `is_high_priority_stream`，使进程组可选用高优先级 `cuda` 流。有关配置 `nccl` 的其他可用选项，请参见 <https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-tuse_local_synchronization>。  
`use_local_synchronization` (`bool`, optional): 在进程组创建结束时执行组内 barrier。与之不同的是，非成员 rank 无需调用该 API，也不会加入 barrier。  
`group_desc` (`str`, optional) – 用于描述该进程组的字符串。  
`device_id` (`torch.device`, optional) – 要将该进程“绑定”到的单个特定设备。如果提供该字段，`new_group` 调用将尝试为该设备立即初始化通信后端。  
返回 一个可传递给 collective 调用的分布式组句柄；如果 rank 不属于 `ranks`，则返回 `GroupMember.NON_GROUP_MEMBER`。  
`N.B.` `use_local_synchronization` 不支持 `MPI`。  
`N.B.` 当 `use_local_synchronization=True` 与大规模集群和小型进程组配合时可显著更快，但需注意它会改变集群行为，因为非成员 rank 不会加入 `group` 的 `barrier()`。  
`N.B.` 当 `use_local_synchronization=True` 时，如果每个 rank 创建多个重叠的进程组，可能会导致死锁。为避免该问题，请确保所有 rank 遵循同样的全局创建顺序。  
`torch.distributed.get_group_rank(group, global_rank)[source]# Translate a global rank into a group rank. global_rank must be part of group otherwise this raises RuntimeError.`  
Parameters `group` (`ProcessGroup`) – 要查找相对 rank 的 `ProcessGroup`。  
`global_rank` (`int`) – 要查询的全局 rank。  
返回 `group` 中相对于 group 的 global rank。返回类型 `int`。  
`N.B.` 在默认进程组上调用该函数返回恒等映射。  
`torch.distributed.get_global_rank(group, group_rank)[source]# Translate a group rank into a global rank. group_rank must be part of group otherwise this raises RuntimeError.`  
Parameters `group` (`ProcessGroup`) – 要从中查找全局 rank 的 `ProcessGroup`。  
`group_rank` (`int`) – 要查询的组内 rank。  
返回 `group` 中相对于 group 的全局 rank。返回类型 `int`。  
`N.B.` 在默认进程组上调用该函数返回恒等映射。  
`torch.distributed.get_process_group_ranks(group)[source]# Get all ranks associated with group.`  
Parameters `group` (`Optional[ProcessGroup]`) – 要获取所有 rank 的 `ProcessGroup`。如果为 `None`，将使用默认进程组。  
返回 按组内 rank 排序的全局 rank 列表。返回类型 `list[int]`。

`new_group()`

**Pattern 6:** 警告 安全并发使用：当在 NCCL 后端下使用多个进程组时，用户必须确保各 rank 之间 collective 的执行顺序在全局上保持一致。如果一个进程内有多个线程发起 collective，必须显式同步以保证顺序一致。使用 `torch.distributed` 通信 API 的异步变体时，会返回一个 `work` 对象，并将通信内核入队到独立的 CUDA 流，以便通信与计算重叠。一旦在某个进程组上发出了一个或多个异步操作，在使用另一个进程组前，必须通过调用 `work.wait()` 与其他 CUDA 流同步。更多细节见 Using multiple NCCL communicators concurrently <https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently>。

`NCCL`

**Pattern 7:** Note 如果您将 `DistributedDataParallel` 与 `Distributed RPC Framework` 结合使用，则应始终使用 `torch.distributed.autograd.backward()` 来计算梯度，并使用 `torch.distributed.optim.DistributedOptimizer` 来优化参数。  
Example:

```python
>>> import torch.distributed.autograd as dist_autograd
>>> from torch.nn.parallel import DistributedDataParallel as DDP
>>> import torch
>>> from torch import optim
>>> from torch.distributed.optim import DistributedOptimizer
>>> import torch.distributed.rpc as rpc
>>> from torch.distributed.rpc import RRef
>>>
>>> t1 = torch.rand((3, 3), requires_grad=True)
>>> t2 = torch.rand((3, 3), requires_grad=True)
>>> rref = rpc.remote("worker1", torch.add, args=(t1, t2))
>>> ddp_model = DDP(my_model)
>>>
>>> # Setup optimizer
>>> optimizer_params = [rref]
>>> for param in ddp_model.parameters():
>>>     optimizer_params.append(RRef(param))
>>>
>>> dist_optim = DistributedOptimizer(
>>>     optim.SGD,
>>>     optimizer_params,
>>>     lr=0.05,
>>> )
>>>
>>> with dist_autograd.context() as context_id:
>>>     pred = ddp_model(rref.to_here())
>>>     loss = loss_func(pred, target)
>>>     dist_autograd.backward(context_id, [loss])
>>>     dist_optim.step(context_id)
```

`torch.distributed.autograd.backward()`

**Pattern 8:** `static_graph` (`bool`) – 当设为 `True` 时，`DDP` 会知道训练图是静态的。静态图表示：1) 所有使用和未使用的参数集合在整个训练循环中不会变化；在此情况下，用户将 `find_unused_parameters = True` 与否不再重要。2) 图的训练方式在整个训练循环中不会变化（即不存在依赖迭代次数的控制流）。当 `static_graph` 设为 `True` 时，`DDP` 将支持过去不支持的场景：1) `reentrant` backwards。2) 多次 activation checkpointing。3) 模型存在未使用参数时的 activation checkpointing。4) 存在在 forward 函数外部的模型参数。5) 当存在未使用参数时可能带来性能提升，因为 `static_graph` 设为 `True` 时，`DDP` 不会在每次迭代中搜索图以检测未使用参数。要检查是否可以将 `static_graph` 设为 `True`，一种方法是在上一次模型训练结束时检查 `ddp` 的日志数据；如果 `ddp_logging_data.get("can_set_static_graph") == True`，通常也可将 `static_graph = True`。  
Example:
```python
>>> model_DDP = torch.nn.parallel.DistributedDataParallel(model)
>>> # Training loop
>>> ...
>>> ddp_logging_data = model_DDP._get_ddp_logging_data()
>>> static_graph = ddp_logging_data.get("can_set_static_graph")
```

True

## 参考文件

该技能在 `references/` 中包含了完整文档：

- **other.md** - 其他文档

需要详细信息时使用 `view` 读取特定的参考文件。

## 使用此技能

### 入门指南
从 `getting_started` 或 `tutorials` 参考文件开始，了解基础概念。

### 特定功能
使用相应类别的参考文件（如 `api`、`guides` 等）获取详细信息。

### 代码示例
上方的快速参考部分包含从官方文档提取的常见模式。

## 资源

### references/
从官方来源提取的整理文档。这些文件包含：
- 详细说明
- 带语言标注的代码示例
- 指向原始文档的链接
- 用于快速导航的目录

### scripts/
在此处添加用于常见自动化任务的辅助脚本。

### assets/
在此处添加模板、样板代码或示例项目。

## 说明

- 该技能是从官方文档自动生成的
- 参考文件保留了源文档的结构和示例
- 代码示例包含语言检测，以便更好地进行语法高亮
- 快速参考模式提取自文档中的常见用法示例

## 更新

若要使用更新后的文档刷新此技能：
1. 使用相同配置重新运行抓取器
2. 技能将使用最新信息重新构建
