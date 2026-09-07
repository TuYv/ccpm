---
name: spark-environment-setup
description: Set up a working ML training/inference environment on NVIDIA DGX Spark (GB10, aarch64, CUDA 13). Use when installing PyTorch/Unsloth/TRL/vLLM on DGX Spark, hitting libcudart or wheel-ABI errors on aarch64, or choosing between NGC containers and bare pip installs.
---
# Spark 环境搭建

DGX Spark 搭载 GB10 Grace Blackwell 芯片：aarch64 CPU、SM121 GPU、128GB 统一内存、CUDA 13。与标准的 x86 CUDA 12 机器相比，这是一个更窄、更年轻的平台，因此软件包选择和 ABI 匹配比平时更加关键——aarch64 + CUDA 13 的 wheel 生态仍在补全之中。

## 何时使用本技能

- 为训练或推理搭建一台全新的 Spark 机器。
- 遇到提及 `libcudart` 的导入错误、缺失符号，或“安装成功却无法加载”的 wheel。
- 框架安装（PyTorch、Unsloth、TRL、vLLM、xformers）失败、卡住或静默回退到 CPU。
- 决定使用 NGC 容器还是裸 pip。
- 在操作系统重装或基础镜像更新后恢复原本可用的环境，需要从头重新验证。

以上每一种情况的通用解决思路都相同：让容器/wheel 组合与 CUDA 13 和 SM121 相匹配，不要跟 ABI 较劲。

## 容器优先规则

先给出快速决策，细节见下文：

- 标准训练/推理工作 → NGC PyTorch 容器。
- 以 Unsloth 为核心的微调 → Unsloth 容器（它自带已针对该路径验证过的、锁定版本的 Triton/xformers/transformers 组合）。
- 两者都不合适（自定义系统软件包、本地 IDE 解释器）→ 裸 pip，按后文的确切顺序执行。

默认使用容器。通用工作以 `nvcr.io/nvidia/pytorch:25.09-py3` 作为基础——这是已确认能在此硬件上运行的最新 tag；如果本地有更新的受认可 tag，就拉取它，而不是死守 `25.11-py3`。NGC 的 tag 是带日期的，所以直接运行即可：

```bash
docker run --runtime=nvidia --gpus all -it --rm \
  nvcr.io/nvidia/pytorch:25.09-py3
```

相比之下，`unsloth/unsloth:dgxspark-latest` 是一个*移动* tag——在将其用于任何需要可复现的场景之前，先解析并固定其 digest；裸 tag 仅作为发现步骤，不是默认调用方式。完整的 pull-inspect-pin 序列、参数缘由以及 `finetuning/` 运行目录的卷挂载：`references/container-workflow.md`。将裸 pip 视为例外情况。

容器优先的原因在于版本锁定，而非便利性。Triton、xformers 和 transformers 的版本与 GB10 的 SM121 目标及 CUDA 13 之间的交互非常严格；容器将它们全部锁定在一起，对齐到已在此硬件上验证过的组合。裸 pip 则把这个解析工作留给你自己，让你一次一个导入报错地去踩。

当确实需要裸 pip 时，请逐字按顺序执行 NVIDIA playbook 的安装序列：

```bash
pip install "transformers==5.13.1" "peft==0.19.1" "hf_transfer==0.1.9" "datasets==4.3.0" "trl==1.8.0"
pip install --no-deps "unsloth==2026.7.2" "unsloth_zoo==2026.7.2" "bitsandbytes==0.49.2"
pip install -U "torchao==0.17.0"
```

第二条命令的 `--no-deps` 参数不是可选项——让 pip 在 aarch64 上重新解析 Unsloth 的依赖树，是引入不兼容的 torch 或 triton 构建的常见途径。第三行同样不可省略：NGC 基础镜像捆绑的 `torchao` 对于当前 `peft` 的 LoRA 挂载路径来说太旧了（`ImportError: ... torchao ... only versions above 0.16.0 are supported`）——这是硬性阻断，不是警告。上面每一个 `==` 版本锁定都至关重要，均取自 `references/stack-matrix.md` 中带日期的已知可用版本矩阵（其 `Last verified` 日期决定信息是否过时）——不锁定版本的安装会解析到当前 PyPI 上远超该 Unsloth 发行版支持范围的版本。

当新的受认可版本发布时，拉取新的 tag。只有当项目需要叠加额外的系统软件包时，才基于上述两个基础镜像之一在本地重建——而不是为了“升级”镜像已经锁定的某个组件。两条路径的详情：`references/container-workflow.md`。

还有一项预检：官方 DGX Spark playbook 以前发布过有问题的版本。在将某个配方原样照搬用于长时间运行之前，请先查看 `github.com/NVIDIA/dgx-spark-playbooks` 上的近期 issue（以及 `references/stack-matrix.md` 中的其他资源）。

## ABI 规则

Spark 上最常见的单一故障就是 CUDA 12/13 ABI 不匹配：针对 `libcudart.so.12` 构建的 wheel 被加载到只有 `libcudart.so.13` 的系统上。安装通常会成功；故障会在稍后显现为缺失符号错误，或者一个并不明显指向 CUDA 的段错误。

修复方法：从 `download.pytorch.org/whl/cu130`（带 cu130 标记的 aarch64 构建）拉取 wheel，或使用上面某个容器——它们已自带匹配的构建。在追查提到 CUDA 符号的堆栈跟踪之前，先检查已安装的 wheel 是针对哪个 CUDA tag 构建的：

```bash
python3 -c "import torch; print(torch.version.cuda)"
```

如果输出不以 `13` 开头，ABI 不匹配就是要首先修复的问题。NGC 容器构建（例如 `nvcr.io/nvidia/pytorch:25.09-py3`）在内部针对 CUDA 13 构建 torch，不带 `+cu130` wheel 标记——在那里 `pip show torch` 不会显示 `cu130`，仅凭这一点并不构成故障。

典型症状：

- 引用某个 CUDA 运行时函数的 `ImportError: undefined symbol`。
- 第一次调用 `.cuda()` 时出现段错误，没有有用的回溯。
- wheel 安装得很干净，却在导入时失败——pip 的解析器只检查版本约束，不检查 CUDA ABI。
- 两个“完全相同”的环境表现不同——通常其中一个装的是 cu130 wheel，另一个残留着 cu121/cu124。

无论症状如何，修复方法都是一样的：让 wheel 的 CUDA tag 与系统匹配，或者使用已经做到这一点的容器。

## 组件速查表

以下是最可能遇到的组件的精简状态。包含 wheel URL、构建参数、sm_121 与 sm_121a 的区别以及带日期的已知可用版本矩阵的完整表格：`references/stack-matrix.md`。

| 组件 | 状态 |
|---|---|
| PyTorch | ✅ 官方 cu130 aarch64 wheel |
| bitsandbytes | ✅ 开箱即用 |
| Triton | ✅ 需要设置 `TRITON_PTXAS_PATH` 参数 |
| flash-attn | ❌ 跳过 pip 构建；NGC 自带可用的版本——见 `spark-training-gotchas` G2 |
| xformers | 仅支持源码构建（`TORCH_CUDA_ARCH_LIST=12.1`） |
| vLLM | 仅限 nightly wheel |
| TransformerEngine / NVFP4 train | 仅限容器 |

其余组件——Unsloth、Axolotl、TRL、PEFT——都能通过上面的容器优先路径干净安装。LLaMA-Factory 和 NeMo 在 Spark 上很脆弱；请先查看上游 issue。

## 验证命令

在运行任何开销大的任务之前，先确认环境确实能看到 GPU：

```python
import torch
print(torch.cuda.is_available(), torch.version.cuda)
```

这个调用返回两个值；确切的输出格式为一行 `<bool> <cuda-version>`：

```text
True 13.0
```

如果它打印的是 `False`，不要直接跳到重装 wheel——ABI 不匹配只是多个可能原因之一：

| 假设 | 快速检查 |
|---|---|
| 运行时/参数 | `nvidia-smi` 在容器内同样失败 |
| 设备可见性 | `echo $CUDA_VISIBLE_DEVICES` |
| 权限 | `ls -l /dev/nvidia*` |
| CUDA 初始化状态 | 进程卡死；换全新的 shell/容器重试 |
| ABI 不匹配（常见元凶） | `torch.version.cuda` 不是 `13.x` |

先检查 `nvidia-smi`——如果它没有显示 GPU，那就是前三种情况之一，而不是 ABI。只有在确认 ABI 之后才重装 wheel。各假设的详情：`references/stack-matrix.md`。请在容器启动后立即运行，且要在安装项目专属软件包之前。

再一项检查：如果训练开始后 Triton 内核编译失败，请设置 `TRITON_PTXAS_PATH=/usr/local/cuda/bin/ptxas` 后重试——完整的变通方案列表见 `references/stack-matrix.md`。

## 后续步骤

已验证的环境只是起点。另见：`spark-training-gotchas` 用于训练前的故障预检，`spark-memory-thermal-ops` 用于长时间训练期间的统一内存 OOM 和热节流问题。
