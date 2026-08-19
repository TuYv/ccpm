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

全面协助进行 pytorch-fsdp 开发，内容根据官方文档生成。

## 使用此 Skill 的时机

应在以下情况下触发此 skill：
- 使用 pytorch-fsdp
- 询问 pytorch-fsdp 的功能或 API
- 实现 pytorch-fsdp 解决方案
- 调试 pytorch-fsdp 代码
- 学习 pytorch-fsdp 最佳实践

## 快速参考

### 常见模式

**模式 1：** 通用 Join 上下文管理器# 创建于：2025 年 6 月 6 日 | 最后更新于：2025 年 6 月 6 日 通用 Join 上下文管理器支持在输入不均衡的情况下进行分布式训练。本页面介绍相关类的 API：Join、Joinable 和 JoinHook。有关教程，请参阅《使用 Join 上下文管理器处理不均衡输入的分布式训练》。 class torch.distributed.algorithms.Join(joinables, enable=True, throw_on_early_termination=False, **kwargs)[source]# 此类定义了通用 Join 上下文管理器，该管理器允许在某个进程加入后调用自定义钩子。这些钩子应模拟尚未加入进程的集体通信，以防止挂起和报错，并确保算法正确性。有关钩子定义的详细信息，请参阅 JoinHook。警告 此上下文管理器要求每个参与的 Joinable 在其自身的每次迭代集体通信之前调用方法 notify_join_context()，以确保正确性。警告 此上下文管理器要求 JoinHook 对象中的所有 process_group 属性都相同。如果存在多个 JoinHook 对象，则使用第一个对象的 device。process group 和 device 信息用于通过 all-reduce 检查是否存在尚未加入的进程，并在启用 throw_on_early_termination 时通知进程抛出异常，这两种操作都使用 all-reduce。参数 joinables (List[Joinable]) – 参与的 Joinable 列表；其钩子按照给定顺序进行迭代。 enable (bool) – 启用不均衡输入检测的标志；设置为 False 将禁用上下文管理器的功能，只有在用户确定输入不会不均衡时才应这样设置（默认值：True）。 throw_on_early_termination (bool) – 控制在检测到输入不均衡时是否抛出异常的标志（默认值：False）。示例：>>> import os >>> import torch >>> import torch.distributed as dist >>> import torch.multiprocessing as mp >>> import torch.nn.parallel.DistributedDataParallel as DDP >>> import torch.distributed.optim.ZeroRedundancyOptimizer as ZeRO >>> from torch.distributed.algorithms.join import Join >>> >>> # On each spawned worker >>> def worker(rank): >>> dist.init_process_group("nccl", rank=rank, world_size=2) >>> model = DDP(torch.nn.Linear(1, 1).to(rank), device_ids=[rank]) >>> optim = ZeRO(model.parameters(), torch.optim.Adam, lr=0.01) >>> # Rank 1 gets one more input than rank 0 >>> inputs = [torch.tensor([1.]).to(rank) for _ in range(10 + rank)] >>> with Join([model, optim]): >>> for input in inputs: >>> loss = model(input).sum() >>> loss.backward() >>> optim.step() >>> # All ranks reach here without hanging/erroring static notify_join_context(joinable)[source]# 通知 Join 上下文管理器，调用进程尚未加入。然后，如果 throw_on_early_termination=True，则检查是否检测到输入不均衡（即某个进程已经加入），如果是，则抛出异常。此方法应由 Joinable 对象在其每次迭代的集体通信之前调用。例如，在 DistributedDataParallel 的 forward pass 开始处调用此方法。传入上下文管理器的第一个 Joinable 对象会执行此方法中的集体通信，对于其他对象而言，此方法为空操作。参数 joinable (Joinable) – 调用此方法的 Joinable 对象。返回值 如果 joinable 是传入上下文管理器的第一个对象，则返回一个用于 all-reduce 的异步 work handle，以通知上下文管理器该进程尚未加入；否则返回 None。 class torch.distributed.algorithms.Joinable[source]# 此类定义了可加入类的抽象基类。继承自 Joinable 的可加入类应实现 join_hook()，该方法返回一个 JoinHook 实例；此外还应实现 join_device() 和 join_process_group()，分别返回 device 和 process group 信息。 abstract property join_device: device# 返回用于执行 Join 上下文管理器所需集体通信的 device。 abstract join_hook(**kwargs)[source]# 为给定的 Joinable 返回一个 JoinHook 实例。参数 kwargs (dict) – 包含用于在运行时修改 join hook 行为的关键字参数的字典；共享同一 Join 上下文管理器的所有 Joinable 实例都会被传入相同的 kwargs 值。返回类型 JoinHook abstract property join_process_group: Any# 返回 Join 上下文管理器本身所需集体通信使用的 process group。 class torch.distributed.algorithms.JoinHook[source]# 此类定义了一个 join hook，为 Join 上下文管理器提供两个入口点。入口点：主钩子（当存在尚未加入的进程时会被重复调用）和后置钩子（所有进程都加入后调用一次）。要为通用 Join 上下文管理器实现 join hook，请定义一个继承自 JoinHook 的类，并根据需要重写 main_hook() 和 post_hook()。 main_hook()[source]# 当存在尚未加入的进程时调用此钩子，以模拟训练迭代中的集体通信。训练迭代，即一次 forward pass、backward pass 和 optimizer step。 post_hook(is_last_joiner)[source]# 在所有进程都加入后调用此钩子。该钩子会额外接收一个布尔参数 is_last_joiner，用于指示该 rank 是否是最后加入的进程之一。参数 is_last_joiner (bool) – 如果该 rank 是最后加入的进程之一，则为 True；否则为 False。

该片段长度超过单次响应可容纳范围，无法在不删减内容的前提下完整翻译。请将原文拆分为较小片段后发送。

```
torch.distributed
```

**模式 3：** 初始化# 在调用任何其他方法之前，需要使用 torch.distributed.init_process_group() 或 torch.distributed.device_mesh.init_device_mesh() 函数初始化该包。两者都会阻塞，直到所有进程均已加入。警告 初始化不是线程安全的。应从单个线程执行进程组创建，以防止跨 rank 的 ‘UUID’ 分配不一致，并避免初始化期间可能导致挂起的竞争条件。torch.distributed.is_available()[source]# 如果分布式包可用，则返回 True。否则，torch.distributed 不会暴露任何其他 API。目前，torch.distributed 在 Linux、MacOS 和 Windows 上可用。从源码构建 PyTorch 时，请设置 USE_DISTRIBUTED=1 以启用它。目前，Linux 和 Windows 的默认值为 USE_DISTRIBUTED=1，MacOS 的默认值为 USE_DISTRIBUTED=0。返回类型 bool torch.distributed.init_process_group(backend=None, init_method=None, timeout=None, world_size=-1, rank=-1, store=None, group_name='', pg_options=None, device_id=None)[source]# 初始化默认分布式进程组。这也会初始化分布式包。初始化进程组主要有 2 种方式：显式指定 store、rank 和 world_size。指定 init_method（一个 URL 字符串），该字符串指示在何处以及如何发现对等节点。可以选择指定 rank 和 world_size，或者在 URL 中编码所有必需参数并省略它们。若两者都未指定，则假定 init_method 为 “env://”。参数 backend (str or Backend, optional) – 要使用的后端。根据构建时配置，有效值包括 mpi、gloo、nccl、ucc、xccl，或由第三方插件注册的后端。自 2.6 起，若未提供 backend，c10d 将使用为 device_id 关键字参数所指示的设备类型注册的后端（如果已提供）。当前已知的默认注册为：cuda 使用 nccl，cpu 使用 gloo，xpu 使用 xccl。若 backend 和 device_id 都未提供，c10d 将检测运行时机器上的加速器，并使用为该检测到的加速器（或 cpu）注册的后端。此字段可以给定为小写字符串（例如，"gloo"），也可以通过 Backend 属性访问（例如，Backend.GLOO）。如果每台机器使用多个进程且使用 nccl 后端，每个进程必须对其使用的每个 GPU 具有独占访问权，因为进程之间共享 GPU 可能导致死锁或 NCCL 无效使用。ucc 后端处于实验阶段。可以使用 get_default_backend_for_device() 查询设备的默认后端。init_method (str, optional) – 指定如何初始化进程组的 URL。如果未指定 init_method 或 store，默认值为 “env://”。与 store 互斥。world_size (int, optional) – 参与作业的进程数量。如果指定了 store，则必需。rank (int, optional) – 当前进程的 rank（应为介于 0 和 world_size-1 之间的数字）。如果指定了 store，则必需。store (Store, optional) – 所有 worker 均可访问的键/值存储，用于交换连接/地址信息。与 init_method 互斥。timeout (timedelta, optional) – 针对进程组执行的操作的超时时间。NCCL 的默认值为 10 分钟，其他后端为 30 分钟。超过此时间后，集合通信将被异步中止，进程将崩溃。这样做是因为 CUDA 执行是异步的，继续执行用户代码已不再安全，因为失败的异步 NCCL 操作可能导致后续 CUDA 操作在损坏的数据上运行。当设置 TORCH_NCCL_BLOCKING_WAIT 时，进程将阻塞并等待此超时时间。group_name (str, optional, deprecated) – 组名称。此参数将被忽略 pg_options (ProcessGroupOptions, optional) – 进程组选项，指定在构造特定进程组期间需要传入哪些附加选项。截至目前，我们唯一支持的选项是用于 nccl 后端的 ProcessGroupNCCL.Options，可以指定 is_high_priority_stream，以便 nccl 后端在有计算内核等待时选用高优先级 cuda 流。有关可配置 nccl 的其他可用选项，请参阅 https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-t device_id (torch.device | int, optional) – 此进程将使用的单个特定设备，可实现特定于后端的优化。目前这仅对 NCCL 有两项影响：通信器会立即形成（立即调用 ncclCommInit*，而非通常的延迟调用），并且子组会在可能时使用 ncclCommSplit，以避免不必要的组创建开销。若希望尽早获知 NCCL 初始化错误，也可以使用此字段。若提供 int，API 假定将使用编译时的加速器类型。注意 要启用 backend == Backend.MPI，需要在支持 MPI 的系统上从源码构建 PyTorch。注意 多后端支持处于实验阶段。目前，当未指定后端时，将同时创建 gloo 和 nccl 后端。gloo 后端将用于带有 CPU 张量的集合通信，nccl 后端将用于带有 CUDA 张量的集合通信。可以通过传入格式为 “<device_type>:<backend_name>,<device_type>:<backend_name>” 的字符串来指定自定义后端，例如 “cpu:gloo,cuda:custom_backend”。torch.distributed.device_mesh.init_device_mesh(device_type, mesh_shape, *, mesh_dim_names=None, backend_override=None)[source]# 基于 device_type、mesh_shape 和 mesh_dim_names 参数初始化一个 DeviceMesh。这会创建具有 n 维数组布局的 DeviceMesh，其中 n 是 mesh_shape 的长度。如果提供 mesh_dim_names，则每个维度标记为 mesh_dim_names[i]。注意 init_device_mesh 遵循 SPMD 编程模型，这意味着同一个 PyTorch Python 程序会在集群中的所有进程/rank 上运行。确保 mesh_shape（描述设备布局的 n 维数组的维度）在所有 rank 上完全相同。不一致的 mesh_shape 可能导致挂起。注意 如果未找到进程组，init_device_mesh 将在后台初始化分布式通信所需的分布式进程组。参数 device_type (str) – mesh 的设备类型。目前支持：“cpu”、“cuda/cuda-like”、“xpu”。不允许传入带有 GPU 索引的设备类型，例如 “cuda:0”。mesh_shape (Tuple[int]) – 一个元组，用于定义描述设备布局的多维数组的维度。mesh_dim_names (Tuple[str], optional) – 一个 mesh 维度名称元组，用于分配给描述设备布局的多维数组的每个维度。其长度必须与 mesh_shape 的长度匹配。mesh_dim_names 中的每个字符串必须唯一。backend_override (Dict[int | str, tuple[str, Options] | str | Options], optional) – 为将针对每个 mesh 维度创建的部分或全部 ProcessGroup 提供覆盖设置。每个键可以是维度的索引，也可以是其名称（如果提供了 mesh_dim_names）。每个值可以是一个包含后端名称及其选项的元组，也可以仅包含这两个组件之一（在这种情况下，另一个将设置为其默认值）。返回 表示设备布局的 DeviceMesh 对象。返回类型 DeviceMesh 示例： >>> from torch.distributed.device_mesh import init_device_mesh >>> >>> mesh_1d = init_device_mesh("cuda", mesh_shape=(8,)) >>> mesh_2d = init_device_mesh("cuda", mesh_shape=(2, 8), mesh_dim_names=("dp", "tp")) torch.distributed.is_initialized()[source]# 检查默认进程组是否已初始化。返回类型 bool torch.distributed.is_mpi_available()[source]# 检查 MPI 后端是否可用。返回类型 bool torch.distributed.is_nccl_available()[source]# 检查 NCCL 后端是否可用。返回类型 bool torch.distributed.is_gloo_available()[source]# 检查 Gloo 后端是否可用。返回类型 bool torch.distributed.distributed_c10d.is_xccl_available()[source]# 检查 XCCL 后端是否可用。返回类型 bool torch.distributed.is_torchelastic_launched()[source]# 检查此进程是否通过 torch.distributed.elastic（又称 torchelastic）启动。使用 TORCHELASTIC_RUN_ID 环境变量的存在作为代理，以确定当前进程是否通过 torchelastic 启动。这是合理的代理，因为 TORCHELASTIC_RUN_ID 映射到 rendezvous id，而该值始终为非空值，用于指示对等节点发现用途的作业 id。返回类型 bool torch.distributed.get_default_backend_for_device(device)[source]# 返回给定设备的默认后端。参数 device (Union[str, torch.device]) – 要获取默认后端的设备。返回 给定设备的默认后端，以小写字符串形式返回。返回类型 str 当前支持三种初始化方法：TCP 初始化# 使用 TCP 进行初始化有两种方式，二者都需要一个可从所有进程访问的网络地址以及所需的 world_size。第一种方式要求指定属于 rank 0 进程的地址。此初始化方法要求所有进程均手动指定 rank。请注意，最新的分布式包不再支持多播地址。group_name 同样已弃用。import torch.distributed as dist # 使用其中一台机器的地址 dist.init_process_group(backend, init_method='tcp://10.1.1.20:23456', rank=args.rank, world_size=4) 共享文件系统初始化# 另一种初始化方法使用在组内所有机器之间共享且可见的文件系统，以及所需的 world_size。URL 应以 file:// 开头，并包含共享文件系统中一个不存在文件的路径（该目录必须存在）。如果该文件不存在，文件系统初始化会自动创建它，但不会删除该文件。因此，你有责任确保在同一文件路径/名称上下一次调用 init_process_group() 前清理该文件。请注意，最新的分布式包不再支持自动 rank 分配，group_name 同样已弃用。警告 此方法假定文件系统支持使用 fcntl 的锁定机制，大多数本地系统和 NFS 均支持它。警告 此方法将始终创建该文件，并尽最大努力在程序结束时清理和删除该文件。换言之，为了使初始化成功，每次使用文件初始化方法进行初始化都需要一个全新的空文件。如果再次使用前一次初始化所用且恰好未被清理的同一文件，这属于非预期行为，通常会导致死锁和失败。因此，尽管此方法会尽最大努力清理该文件，但如果自动删除失败，你有责任确保在训练结束时删除该文件，以防下次再次复用同一文件。如果你计划在相同文件名上多次调用 init_process_group()，这一点尤其重要。换言之，如果文件未被删除/清理，而你再次对该文件调用 init_process_group()，则预期会发生失败。这里的经验法则是：每次调用 init_process_group() 时，确保该文件不存在或为空。import torch.distributed as dist # 应始终指定 rank dist.init_process_group(backend, init_method='file:///mnt/nfs/sharedfile', world_size=4, rank=args.rank) 环境变量初始化# 此方法将从环境变量读取配置，从而允许完全自定义信息的获取方式。需要设置的变量如下：MASTER_PORT - 必需；必须是 rank 0 所在机器上的空闲端口 MASTER_ADDR - 必需（rank 0 除外）；rank 0 节点的地址 WORLD_SIZE - 必需；可在此处设置，也可在调用初始化函数时设置 RANK - 必需；可在此处设置，也可在调用初始化函数时设置 rank 0 所在机器将用于建立所有连接。这是默认方法，这意味着无需指定 init_method（或者可以为 env://）。改进初始化时间# TORCH_GLOO_LAZY_INIT - 按需建立连接，而不是使用完整网格；对于非 all2all 操作，这可以显著缩短初始化时间。

```
torch.distributed.init_process_group()
```

**模式 4：** 示例：

```
>>> from torch.distributed.device_mesh import init_device_mesh
>>>
>>> mesh_1d = init_device_mesh("cuda", mesh_shape=(8,))
>>> mesh_2d = init_device_mesh("cuda", mesh_shape=(2, 8), mesh_dim_names=("dp", "tp"))
```

**模式 5：** 组# 默认情况下，集合通信操作在默认组（也称为 world）上执行，并要求所有进程都进入分布式函数调用。不过，某些工作负载可以受益于更细粒度的通信。这正是分布式组发挥作用的场景。可以使用 new_group() 函数创建新组，其中可以包含所有进程的任意子集。它会返回一个不透明的组句柄，可作为所有集合通信操作的 group 参数（集合通信操作是按照某些众所周知的编程模式交换信息的分布式函数）。torch.distributed.new_group(ranks=None, timeout=None, backend=None, pg_options=None, use_local_synchronization=False, group_desc=None, device_id=None)[source]# 创建一个新的分布式组。此函数要求主组中的所有进程（即属于该分布式作业的所有进程）都进入此函数，即使它们不会成为该组的成员。此外，所有进程都应以相同顺序创建组。警告 安全的并发使用：当使用具有 NCCL 后端的多个进程组时，用户必须确保各个 rank 上集合通信操作的执行顺序全局一致。如果进程内的多个线程发起集合通信操作，则必须进行显式同步以确保顺序一致。使用 torch.distributed 通信 API 的异步变体时，会返回一个 work 对象，通信内核会在单独的 CUDA 流上排队，从而实现通信与计算重叠。一旦在某个进程组上发起一个或多个异步操作，在使用另一个进程组之前，必须通过调用 work.wait() 将其与其他 cuda 流同步。有关更多详细信息，请参阅[并发使用多个 NCCL 通信器](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently)。参数 ranks (list[int]) – 组成员的 rank 列表。如果为 None，将设置为所有 rank。默认值为 None。timeout (timedelta, optional) – 有关详细信息和默认值，请参阅 init_process_group。backend (str or Backend, optional) – 要使用的后端。根据构建时配置，有效值为 gloo 和 nccl。默认情况下，使用与全局组相同的后端。此字段应以小写字符串形式提供（例如，"gloo"），也可以通过 Backend 属性访问（例如，Backend.GLOO）。如果传入 None，将使用与默认进程组对应的后端。默认值为 None。pg_options (ProcessGroupOptions, optional) – 进程组选项，用于指定构建特定进程组时需要传入哪些额外选项。即，对于 nccl 后端，可以指定 is_high_priority_stream，以便进程组能够选择高优先级 cuda 流。有关其他可用于配置 nccl 的选项，请参阅 https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-tuse_local_synchronization (bool, optional)：在进程组创建结束时执行组本地屏障。这一点不同之处在于，非成员 rank 无需调用 API，也不会加入该屏障。group_desc (str, optional) – 用于描述进程组的字符串。device_id (torch.device, optional) – 将此进程“绑定”到的单个特定设备；如果提供此字段，new_group 调用将尝试立即为该设备初始化通信后端。返回值：可传递给集合通信调用的分布式组句柄；如果该 rank 不属于 ranks，则返回 GroupMember.NON_GROUP_MEMBER。注意：use_local_synchronization 不适用于 MPI。注意：尽管在较大的集群和较小的进程组中，use_local_synchronization=True 可以显著加快速度，但必须谨慎使用，因为它改变了集群行为，非成员 rank 不会加入 group barrier()。注意：当每个 rank 创建多个重叠的进程组时，use_local_synchronization=True 可能导致死锁。为避免这种情况，请确保所有 rank 遵循相同的全局创建顺序。torch.distributed.get_group_rank(group, global_rank)[source]# 将全局 rank 转换为组 rank。global_rank 必须属于 group，否则会引发 RuntimeError。参数 group (ProcessGroup) – 用于查找相对 rank 的 ProcessGroup。global_rank (int) – 要查询的全局 rank。返回值：global_rank 相对于 group 的组 rank 返回类型 int 注意：在默认进程组上调用此函数会返回其自身。torch.distributed.get_global_rank(group, group_rank)[source]# 将组 rank 转换为全局 rank。group_rank 必须属于 group，否则会引发 RuntimeError。参数 group (ProcessGroup) – 用于查找全局 rank 的 ProcessGroup。group_rank (int) – 要查询的组 rank。返回值：group_rank 相对于 group 的全局 rank 返回类型 int 注意：在默认进程组上调用此函数会返回其自身。torch.distributed.get_process_group_ranks(group)[source]# 获取与 group 关联的所有 rank。参数 group (Optional[ProcessGroup]) – 用于获取所有 rank 的 ProcessGroup。如果为 None，将使用默认进程组。返回值：按组 rank 排序的全局 rank 列表。返回类型 list[int]

```
new_group()
```

**模式 6：** 警告 安全的并发使用：当使用带有 NCCL 后端的多个进程组时，用户必须确保各个 rank 上的集合通信执行顺序在全局范围内保持一致。如果一个进程中的多个线程发起集合通信，则需要显式同步以确保顺序一致。使用 torch.distributed 通信 API 的异步变体时，会返回一个工作对象，并且通信内核会被加入到单独的 CUDA 流中，从而允许通信与计算重叠。一旦在一个进程组上发起了一个或多个异步操作，在使用另一个进程组之前，必须通过调用 work.wait() 将它们与其他 cuda 流同步。有关更多详细信息，请参阅 Using multiple NCCL communicators concurrently <https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently>。

```
NCCL
```

**模式 7：** 注意 如果将 DistributedDataParallel 与 Distributed RPC Framework 结合使用，应始终使用 torch.distributed.autograd.backward() 计算梯度，并使用 torch.distributed.optim.DistributedOptimizer 优化参数。示例：>>> import torch.distributed.autograd as dist_autograd >>> from torch.nn.parallel import DistributedDataParallel as DDP >>> import torch >>> from torch import optim >>> from torch.distributed.optim import DistributedOptimizer >>> import torch.distributed.rpc as rpc >>> from torch.distributed.rpc import RRef >>> >>> t1 = torch.rand((3, 3), requires_grad=True) >>> t2 = torch.rand((3, 3), requires_grad=True) >>> rref = rpc.remote("worker1", torch.add, args=(t1, t2)) >>> ddp_model = DDP(my_model) >>> >>> # Setup optimizer >>> optimizer_params = [rref] >>> for param in ddp_model.parameters(): >>> optimizer_params.append(RRef(param)) >>> >>> dist_optim = DistributedOptimizer( >>> optim.SGD, >>> optimizer_params, >>> lr=0.05, >>> ) >>> >>> with dist_autograd.context() as context_id: >>> pred = ddp_model(rref.to_here()) >>> loss = loss_func(pred, target) >>> dist_autograd.backward(context_id, [loss]) >>> dist_optim.step(context_id)

```
torch.distributed.autograd.backward()
```

**模式 8：** static_graph (bool) – 设为 True 时，DDP 会知道训练图是静态的。静态图意味着：1) 在整个训练循环期间，已使用和未使用参数的集合不会发生变化；在这种情况下，用户是否设置 find_unused_parameters = True 都无关紧要。2) 在整个训练循环期间，图的训练方式不会改变（意味着不存在依赖于迭代次数的控制流）。当 static_graph 设为 True 时，DDP 将支持过去无法支持的情况：1) 可重入反向传播。2) 多次进行激活检查点。3) 当模型具有未使用参数时进行激活检查点。4) 存在位于 forward 函数之外的模型参数。5) 当存在未使用参数时，可能提升性能，因为在 static_graph 设为 True 时，DDP 不会在每次迭代中搜索图以检测未使用参数。要检查是否可以将 static_graph 设为 True，一种方法是在之前模型训练结束时检查 ddp 日志数据；如果 ddp_logging_data.get("can_set_static_graph") == True，大多数情况下也可以设置 static_graph = True。示例::>>> model_DDP = torch.nn.parallel.DistributedDataParallel(model) >>> # Training loop >>> ... >>> ddp_logging_data = model_DDP._get_ddp_logging_data() >>> static_graph = ddp_logging_data.get("can_set_static_graph")

```
True
```

## 参考文件

此技能在 `references/` 中包含全面的文档：

- **other.md** - 其他文档

当需要详细信息时，使用 `view` 读取特定的参考文件。

## 使用此技能

### 面向初学者
从 getting_started 或 tutorials 参考文件开始，了解基础概念。

### 面向特定功能
使用相应的分类参考文件（api、guides 等）获取详细信息。

### 面向代码示例
上方的快速参考部分包含从官方文档中提取的常见模式。

## 资源

### references/
从官方来源提取并整理的文档。这些文件包含：
- 详细说明
- 带语言标注的代码示例
- 原始文档链接
- 用于快速导航的目录

### scripts/
在此处添加用于常见自动化任务的辅助脚本。

### assets/
在此处添加模板、样板代码或示例项目。

## 注意事项

- 此技能由官方文档自动生成
- 参考文件保留了源文档的结构和示例
- 代码示例包含语言检测，以获得更好的语法高亮效果
- 快速参考模式从文档中的常见使用示例提取

## 更新

要使用更新后的文档刷新此技能：
1. 使用相同的配置重新运行抓取工具
2. 此技能将使用最新信息重新构建