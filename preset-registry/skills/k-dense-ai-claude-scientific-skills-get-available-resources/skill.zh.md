---
name: get-available-resources
description: Detect host inventory and effective CPU, memory, disk, scheduler, container, and accelerator limits when a user asks for resource-aware planning or before a clearly resource-sensitive local workload. Produces a redacted JSON snapshot and conservative planning helpers without stress tests or assuming visible host hardware is usable.
license: MIT
compatibility: Python 3.11+ on Linux, macOS, or Windows; standard library by default, optional psutil 7.2.2; accelerator and scheduler CLIs are optional read-only probes.
metadata:
  version: "1.2"
  skill-author: K-Dense Inc.
---
# 获取可用资源

构建一份关于**当前进程**可用资源的保守概况。  
将主机清单、进程亲和性、cgroup/容器限制、调度器分配以及加速器运行时可用性分开处理。

## 安全约定

遵循以下规则：

- 仅在用户请求检测或特定工作负载需要进行资源规划时运行检测。不要为每个科学任务持久化指纹。
- 默认使用 stdout。仅当用户选择了明确的通用本地文件名时才进行持久化。
- 不要运行压力测试、基准测试、大规模分配、写入探测、设备重置、驱动安装或时钟/电源更改。
- 不要转储环境。仅读取检测器实现中指定的 Slurm 和加速器变量。
- 不要报告主机名、绝对路径、cgroup 路径、作业 ID、设备 UUID、PCI 地址或可见性变量的原始值。
- 将缺失的观测视为未知。绝不要将未知转换为不受限制。
- 绝不要推断在调度器分配或容器内可见的主机 CPU、内存池或 GPU 是可用的。

捆绑的检测器仅使用固定的可执行文件/参数元组，不使用 shell，采用较短的超时时间，限制 stdout/stderr，并对部分失败发出警告。

## 快速开始

在此 skill 目录中运行。

### 临时 stdout 快照

```bash
python scripts/detect_resources.py
```

该命令仅向 stdout 输出 JSON。仅当普通 shell 权限可接受时才重定向输出。

### 明确的私有文件

```bash
python scripts/detect_resources.py --output resource-snapshot.json
```

明确指定的输出仅限当前目录中的一个 `.json` 文件，使用私有权限，拒绝符号链接和路径遍历；除非提供 `--force`，否则拒绝覆盖文件。

### 可选的 psutil 增强

标准库检测器无需安装即可工作。若要获得更广泛的跨平台物理核心、亲和性、可用内存、交换空间和磁盘覆盖信息：

```bash
uv pip install "psutil==7.2.2"
```

导入采用延迟方式。导入 psutil 失败会成为警告，而不是致命错误。

### 跳过管理工具探测

```bash
python scripts/detect_resources.py --skip-accelerators
```

当不希望产生加速器发现延迟时使用此选项。检测器仍会概括允许列表中的可见性变量是否存在及其状态，但不会返回它们的值。

## 必需的解读方式

### CPU

将以下内容视为不同的事实：

- `cpu.host.logical`：系统可见的调度单元。
- `cpu.host.physical`：物理拓扑，或 null；绝不能从逻辑核心数推断。
- `cpu.process.affinity_logical`：受支持时，当前亲和性集合的大小。
- `cpu.cgroup_v2.cpuset_logical`：有效 cgroup cpuset 的大小。
- `cpu.cgroup_v2.quota_cores`：有限的 `cpu.max` 容量，可能为小数。
- `scheduler.allocation.cpu_per_process`：范围明确时，对 Slurm 每任务分配的有界解释。
- `cpu.effective.capacity_cores`：观测到的正数限制中的最小值。
- `cpu.effective.worker_ceiling`：CPU 进程工作线程数的保守下限。

配额 1.5 表示 CPU 时间容量，而不是 1.5 个物理核心。亲和性和
cpusets 限制放置位置；配额限制带宽。

### 内存

请将以下各项分开：

- 主机总内存/可用内存；
- 当前 cgroup 使用量、硬性 `memory.max` 以及剩余的层级容量；
- `memory.high`，它是压力/限流边界，而不是硬性上限；
- 调度器内存分配及其作用范围；以及
- 保守的有效硬限制和可用内存估算。

在 Apple silicon 上，`memory.model` 是 `unified_cpu_gpu`。不要将集成 GPU
内存加到 RAM 中，也不要将其描述为独立的 VRAM。

### 加速器

每个设备都是一个后端**候选项**：

- NVIDIA GPU → CUDA 候选项；
- AMD GPU → ROCm 候选项；
- Apple 集成 GPU → Metal 候选项。

管理查询可见性并不能证明以下任何一项：

1. 调度器/容器权限；
2. 设备节点访问权限；
3. 驱动程序/运行时兼容性；
4. 框架包兼容性；或
5. 算子/数据类型支持。

因此 `runtime_usable_devices` 仍保持为 null，并且每个设备都标记为
`runtime_compatibility: not_tested`。可见性/分配数量是上限，而不是保证值。

### 磁盘

`capacity_bytes`、文件系统 `free_bytes`、用户可用块以及非写入权限检查是
不同的概念。文件系统配额或项目配额仍可能更加严格。绝对工作路径始终会被
脱敏。

### 调度器和容器

Slurm 变量描述分配范围，但具体强制执行取决于站点配置，例如任务亲和性或
cgroups。应优先使用亲和性和 cgroup 观测结果作为强制执行的证据。

容器标记用于识别上下文；cgroup 控制项用于识别限制。没有有限 cgroup 值的
容器仍可能看到主机清单，而非 root cgroup 也不会自动被标记为容器。

有关详细的平台规则，请参阅
[`references/resource_semantics.md`](references/resource_semantics.md)。

## 规划工作负载

规划器使用经过验证的快照，并且不执行任何工作：

```bash
python scripts/plan_workload.py resource-snapshot.json \
  --workload cpu \
  --tasks 100 \
  --memory-per-worker-mib 2048
```

可选控制项：

- `--workers N`：显式上限。
- `--reserve-memory-mib N`：在工作进程预算之外保留的内存。
- `--workload cpu|mixed|io`：选择有界的工作进程启发式规则。
- `--accelerator none|any|cuda|rocm|metal`：请求候选后端决策，但不声称其可用。
- `--output plan.json`：显式的私有本地输出；默认输出到 stdout。

对于 CPU 或混合工作，同时使用 `suggested_workers` 和
`threads_per_worker`。进程工作进程数乘以 BLAS/OpenMP 原生线程数可能会使
分配资源过度订阅。

I/O 规划允许有界的超额订阅（最大值为 32），但会将其标记为启发式规则。只应
对真正具有代表性的工作负载进行基准测试，并保持在调度器/容器限制范围内。

## 验证或比较快照

验证：

```bash
python scripts/snapshot_tools.py validate resource-snapshot.json
```

忽略 `observed_at`，比较资源状态：

```bash
python scripts/snapshot_tools.py diff before.json after.json
```

使用 `--include-volatile` 可包含时间戳。输入必须是常规的、非符号链接的 JSON 文件，大小不得超过 1 MiB。差异输出有界。

架构和 null/zero 的含义记录在
[`references/snapshot_schema.md`](references/snapshot_schema.md) 中。

## 可选的加速器诊断计划

生成计划，但不执行任何诊断：

```bash
python scripts/accelerator_diagnostics.py resource-snapshot.json \
  --backend auto
```

结果包含固定的只读管理查询参数列表，以及针对可见性、权限和运行时兼容性的独立门控。仅在实际执行工作负载的确切环境中运行框架官方的可用性检查。不要自动安装或修改驱动程序。

## 部分失败与来源信息

一次探测失败不得抹除成功的观测结果。请检查：

- `completeness`；
- 带有稳定代码且已排序的 `warnings`；
- 已排序的 `provenance` 来源/状态记录；以及
- null 字段。

子进程 stderr 和原始异常文本不会复制到快照中，因为其中可能包含标识符或路径。

## 平台说明

- **Linux：** 仅读取有界的 `/proc` 和 cgroup v2 文件。会考虑祖先进程的 CPU 和内存限制。
- **macOS：** 使用固定的 `sysctl` 键，以及有界的 `system_profiler SPDisplaysDataType -json` 查询。Apple silicon 使用统一内存。
- **Windows：** 可选的 psutil 会改进物理核心数、CPU 亲和性、可用内存和交换空间的观测。处理器组范围可能导致主机计数与进程计数不同。
- **Slurm：** 读取分配变量的允许列表。绝不会输出作业、节点、提交主机、GPU-ID 或路径值。
- **NVIDIA/AMD：** 管理 CLI 为可选项。缺失属于正常情况；超时、截断、解析失败和运行时不确定性仍会明确记录。

## 随附文件

- `scripts/detect_resources.py` — 脱敏快照收集器。
- `scripts/plan_workload.py` — 确定性的工作线程/内存规划器。
- `scripts/snapshot_tools.py` — 架构验证器和有界结构化差异工具。
- `scripts/accelerator_diagnostics.py` — 不执行操作的只读诊断计划工具。
- `tests/get-available-resources/` 仓库根目录中的网络隔离 Linux、macOS、Windows、cgroup、Slurm 和加速器用例。
- `references/resource_semantics.md` — 解释和平台详细信息。
- `references/snapshot_schema.md` — 架构 1.1 契约。
- `references/sources.md` — 带日期的官方来源台账。

官方文档已于 **2026-07-23** 更新；在更改语义或依赖项固定版本之前，请查阅
[`references/sources.md`](references/sources.md)。