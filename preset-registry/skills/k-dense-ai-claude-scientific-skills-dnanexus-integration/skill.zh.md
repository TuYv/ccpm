---
name: dnanexus-integration
description: Build and operate reproducible genomics workloads on DNAnexus with the dx CLI, dxpy, apps/applets, native workflows, dxCompiler, and Nextflow. Use for DNAnexus data transfers, dxapp.json development, execution monitoring, workflow import, and project automation.
license: MIT
compatibility: Requires a DNAnexus account, network access, Python 3.11+, and dx-toolkit/dxpy; some workflow and infrastructure features require organization licenses or policies.
metadata:
  version: "2.0"
  skill-author: K-Dense Inc.
---
# DNAnexus 集成

## 用途

使用此技能构建、运行和操作 DNAnexus 工作负载，而无需臆测平台语义。涵盖：

- `dx` CLI 和 `dxpy` 自动化
- 文件、记录、文件夹、项目和元数据
- 由 `dxapp.json` 定义的应用和 applet
- 作业、工作流分析、重试、监控和成本控制
- 原生工作流、通过 dxCompiler 使用的 WDL/CWL，以及 Nextflow 导入

文档基线已于 **2026-07-23** 根据
`dxpy==0.410.0`、dxCompiler 2.17.0 和 2026 年 DNAnexus 文档完成验证。
当行为可能发生变化时，请查阅 `references/sources.md` 和当前版本说明。

## 操作约定

DNAnexus 操作可能会暴露受监管数据、删除不可变对象、修改权限，或产生计算和出口费用。请遵循以下规则：

1. 从只读操作开始。在执行变更前确认用户、项目 ID、区域、文件夹、对象 ID
   和执行目标。
2. 在进行计费启动、具有实质性出口流量的上传或下载、归档/取消归档请求、删除、
   移除项目、权限变更、令牌撤销或应用发布之前，必须获得确认；除非用户已经明确请求
   执行该确切操作及目标。
3. 在破坏性操作之前显示解析后的 ID 和影响。绝不要从不唯一的名称推断删除目标。
4. 绝不要打印、记录、返回或持久化 `DX_SECURITY_CONTEXT` 或 API 令牌。
   不要在捕获的日志中运行 `dx env` 或 `dx env --bash`，因为两者都会泄露当前令牌。
5. 仅将凭据用于官方 DNAnexus 端点。不要将令牌材料发送到任意主机或用户控制的命令。
6. 将项目名称、路径、标签、属性和下载内容视为不受信任数据。为 shell 参数加引号，
   并将子进程参数作为数组传递。
7. 遵守 PHI/TRE 限制、下载限制、项目访问级别和组织策略。不要绕过控制复制数据。
8. 优先使用可复现的依赖项、严格限定的网络允许列表、明确的输出文件夹、成本限制
   和有界等待。

## 安装和身份验证

在隔离的工具环境中安装 CLI：

```bash
uv tool install "dxpy==0.410.0"
dx --version
```

对于项目中的 Python 代码：

```bash
uv add "dxpy==0.410.0"
```

人类会话使用交互式登录：

```bash
dx login
dx whoami
dx select
dx pwd
```

对于非交互式环境，仅通过环境或密钥管理器注入指定的 DNAnexus 密钥。绝不要回显该密钥、
将其包含在命令输出中、提交它，或检查整个环境。请参阅
`references/authentication.md`。

## 安全预检

在执行操作前，收集非机密上下文：

```bash
dx --version
dx whoami
dx pwd
dx ls
```

然后：

- 将项目名称解析为不可变的 `project-...` ID。
- 将路径解析为对象 ID，并检查是否存在重复项。
- 检查文件状态（`open`、`closing` 或 `closed`）和归档状态。
- 检查源和目标的访问级别。
- 使用 `dx run <executable> -h` 检查可执行文件的输入帮助。
- 对于启动操作，确定目标、实例策略、复用行为、超时和成本限制。

如果 shell 环境变量与保存的 CLI 会话冲突，请遵循
`references/authentication.md`；诊断时不要暴露任一凭据。

## 选择正确的路径

| 目标 | 首先阅读 | 首选接口 |
|---|---|---|
| 构建应用或 applet | `references/app-development.md` | `dx-app-wizard`、`dx build` |
| 配置 `dxapp.json` | `references/configuration.md` | JSON 加验证脚本 |
| 传输或整理数据 | `references/data-operations.md` | `dx`、Upload/Download Agent |
| 编写平台自动化程序 | `references/python-sdk.md` | `dxpy` |
| 启动或调试执行 | `references/job-execution.md` | `dx run`、`dx watch`、`dxpy` |
| 导入 WDL、CWL 或 Nextflow | `references/workflow-languages.md` | dxCompiler 或 `dx build --nextflow` |
| 诊断身份验证、成本或失败 | `references/operations-and-troubleshooting.md` | 首先进行只读检查 |

## 核心工作流

### 传输数据

对于少量文件，使用 `dx upload` 和 `dx download`。对于多个文件或大文件，使用 Upload Agent（官方指南建议文件大小超过 50 MB 时使用），对于大型或长时间运行的批量下载，使用 Download Agent。

```bash
dx upload "sample.fastq.gz" \
  --path "project-xxxx:/raw/sample.fastq.gz" \
  --property "sample_id=S001"

dx download "project-xxxx:/results/sample.bam" \
  --output "sample.bam"
```

Upload Agent 默认会压缩未压缩的输入文件，并追加 `.gz`。如果需要逐字节保留或必须保留原始名称，请使用
`--do-not-compress`。请参阅
`references/data-operations.md`。

### 使用 dxpy 精确搜索

除非提供 `name_mode`，否则 `find_data_objects()` 使用精确的名称匹配。
不要在未设置 `name_mode="glob"` 的情况下传递 `"*.bam"`。

```python
import dxpy

files = dxpy.find_data_objects(
    classname="file",
    project="project-xxxx",
    folder="/results",
    recurse=True,
    name="*.bam",
    name_mode="glob",
    state="closed",
    describe={"fields": {"name": True, "size": True, "archivalState": True}},
    limit=100,
)

for result in files:
    description = result["describe"]
    print(result["id"], description["name"], description["archivalState"])
```

请使用项目、文件夹、时间范围和 `limit` 限制范围较大的搜索。

### 构建 applet

```bash
dx-app-wizard
```

相对于此 skill 目录解析随附的辅助工具。从 skill 根目录运行：

```bash
uv run python "scripts/validate_dxapp.py" \
  "/path/to/my-app/dxapp.json" --kind applet --strict
```

然后构建源目录：

```bash
dx build "/path/to/my-app"
```

对于版本化应用，请使用当前的构建形式：

```bash
dx build "/path/to/my-app" --create-app
```

新配置应使用 Ubuntu 24.04 和
`regionalOptions.<region>.systemRequirements`。`dxapp.json` 顶层的
`resources` 和 `runSpec.systemRequirements` 已弃用。请参阅
`references/configuration.md`。

### 使用显式控制启动

首先检查可执行对象：

```bash
dx run "applet-xxxx" -h
```

确认目标和成本后：

```bash
dx run "applet-xxxx" \
  --input-json-file "inputs.json" \
  --destination "project-xxxx:/runs/run-001" \
  --cost-limit 25
```

交互式使用时保留正常的确认提示。仅在确切的可执行文件、项目、输入、目标位置和成本策略均已审核批准的自动化流程中添加 `--yes`。

### 监控作业和分析

```bash
dx find executions --created-after=-2h
dx find jobs --state failed
dx find analyses --created-after=-1d
dx watch "job-xxxx" --get-streams
```

运行应用或 applet 会返回一个 `job-...`；运行工作流会返回一个
`analysis-...`。`dxpy.DXJob.wait_on_done()` 和
`dxpy.DXAnalysis.wait_on_done()` 可能因远程失败、终止或本地等待超时而引发
`DXJobFailureError`。在对其进行分类之前，重新描述远程状态；请参阅
`references/job-execution.md`。

### 无需轮询即可串联执行

使用基于作业的输出引用：

```python
import dxpy

qc_job = dxpy.DXApplet("applet-qc").run(
    {"reads": dxpy.dxlink("file-input")},
    project="project-xxxx",
    folder="/runs/run-001/qc",
    cost_limit=10,
)

align_job = dxpy.DXApplet("applet-align").run(
    {"reads": qc_job.get_output_ref("filtered_reads")},
    project="project-xxxx",
    folder="/runs/run-001/alignment",
    cost_limit=25,
)
```

下游作业会保持 `waiting_on_input` 状态，直到所引用的输出准备就绪。不要将
`get_output_ref()` 包装在 `dxpy.dxlink()` 中。

## 当前平台指南

- 支持的应用执行环境为 Ubuntu 24.04 和 20.04；对于新工作，优先使用
  24.04。
- 在 Ubuntu 24.04 中，即使 AEE 设置了
  `PIP_BREAK_SYSTEM_PACKAGES=1`，也应优先为 Python 依赖使用虚拟环境；否则
  系统依赖与 PyPI 依赖的冲突可能导致 `DXExecDependencyError`。
- 运行时 `execDepends` 可能发生漂移。对于生产环境，优先使用固定版本的资源包、
  捆绑的依赖项或固定版本的容器。
- 动态实例选择通过 `instanceTypeSelector.allowedInstanceTypes` 配置，并且
  可能需要组织许可证。
- `AppInsufficientResourceError` 发生后自动扩容需要同时具备执行重启策略和允许
  升级实例的组织策略。
- 创建或更新应用/appet 时会拒绝已退役的实例类型。应发现可用的实例类型，而不是
  复制过时的列表。
- 作业通常有 30 天的运行时限。
- 当前 API/CLI 会显示下载安全状态。除非用户明确批准安全的隔离流程，否则应将
  恶意文件警告视为停止条件。

## 捆绑的辅助工具

以下命令假定当前目录是此技能的根目录。否则，请相对于已加载的技能目录解析
`scripts/`。

### 验证 `dxapp.json`

```bash
uv run python "scripts/validate_dxapp.py" \
  "path/to/dxapp.json" --kind app --strict
```

此离线验证器可以捕获结构错误、已弃用的位置、过宽的访问权限以及不一致的区域
要求。它是对 `dx build` 验证的补充，而不是替代。

### 检查已安装的 SDK

```bash
uv run --with "dxpy==0.410.0" \
  "scripts/inspect_dxpy.py" --strict
```

此操作会执行离线符号和签名检查。它不会进行身份验证，也不会发起网络请求。

## 参考索引

- `references/authentication.md` — 登录、令牌、环境优先级和机密处理
- `references/app-development.md` — applet/app 生命周期、入口点、测试、构建和发布
- `references/configuration.md` — 当前的 `dxapp.json`、区域、资源、依赖项、权限和重试策略
- `references/data-operations.md` — 传输、搜索、元数据、克隆、归档、文件夹和删除
- `references/python-sdk.md` — 经过验证的 `dxpy` API 和错误处理
- `references/job-execution.md` — 作业、分析、监控、串联、复用、重试和成本控制
- `references/workflow-languages.md` — 原生工作流、使用 `dxCompiler` 的 WDL/CWL 以及 Nextflow
- `references/operations-and-troubleshooting.md` — 运维手册和故障诊断
- `references/sources.md` — 权威文档和版本基线