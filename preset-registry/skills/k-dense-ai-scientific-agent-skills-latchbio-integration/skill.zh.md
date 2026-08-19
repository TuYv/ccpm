---
name: latchbio-integration
description: Build, register, debug, and operate bioinformatics workflows on Latch using the Python SDK, CLI, Latch Data and Registry, Nextflow, Snakemake, programmatic execution, and Latch MCP. Use when authoring or deploying Latch workflows, configuring resources or interfaces, moving data, integrating Registry, or launching and monitoring runs.
license: MIT
allowed-tools: Read Write Edit Bash
compatibility: Requires network access and a Latch account. The current stable SDK requires Python 3.9+; Python 3.12 is recommended. Uses uv for installation. Docker is needed for local image builds, while remote registration is the CLI default.
metadata:
  version: "2.0"
  skill-author: K-Dense Inc.
---
# LatchBio 集成

## 当前基线

此 skill 面向 **Latch SDK 2.76.8**，该版本于 2026 年 7 月 10 日发布。软件包
元数据支持 Python 3.9–3.12，并声明支持 Python 3.9 及更高版本。

当指南与 SDK 存在不一致时，应以已安装的软件包及其变更日志为准。部分 Latch 指南仍保留
较旧的 Python 版本范围或特定于兼容性的预发布版本固定，尤其是 Snakemake v2 教程。
在未检查版本要求之前，切勿混用不同版本路线中的命令或导入。

## 使用时机

使用此 skill 来：

- 创建或维护 Python SDK 工作流和任务图
- 打包并注册 Python、Nextflow 或 Snakemake 流水线
- 配置任务的 CPU、内存、存储、GPU、缓存、重试和超时
- 通过 `LPath`、`LatchFile`、`LatchDir` 或 CLI 使用 Latch Data
- 读取或更新 Latch Registry 项目、表和记录
- 设计工作流表单、启动计划、样本表、消息和结果链接
- 使用 `latch register --staging` 和 `latch develop` 暂存并调试工作流镜像
- 通过 Python 或 Latch MCP 启动并监控工作流
- 发现并使用可直接运行的 Latch 工作流

## 路由到正确的参考文档

只阅读任务所需的参考文档：

| 需求 | 参考文档 |
|---|---|
| Python 工作流、任务、映射、条件、缓存 | `references/workflow-creation.md` |
| `LPath`、旧版文件类型、Latch URL、数据 CLI | `references/data-management.md` |
| Registry 读取、事务、样本表 | `references/registry.md` |
| CPU、内存、存储、GPU、动态资源 | `references/resource-configuration.md` |
| Nextflow 和 Snakemake 打包 | `references/nextflow-snakemake.md` |
| 元数据、表单、启动计划、消息、自动化 | `references/ui-and-automation.md` |
| 注册、开发、执行、监控 | `references/operations-and-debugging.md` |
| 可直接使用的工作流和 `latch.verified` | `references/verified-workflows.md` |
| 远程 MCP 设置和工具工作流 | `references/latch-mcp.md` |

在依赖某个符号之前，请针对目标 SDK 版本运行
`scripts/inspect_latch_sdk.py`。它只执行本地导入，不进行身份验证或网络请求。

## 安装和身份验证

如需可复现的环境：

```bash
uv venv --python 3.12
source .venv/bin/activate
uv pip install "latch==2.76.8"
```

在 Windows 上，使用 WSL 运行文档所述的 Linux 工作流工具。

请通过受支持的 OAuth 流程进行身份验证；不要手动读取、打印、复制或
解析 `~/.latch/token`：

```bash
latch login
latch workspace
```

当已知工作区的数字 ID 时，可以以非交互方式选择工作区：

```bash
latch workspace --id 12345
```

`latch login` 凭据用于 SDK 和 CLI。Latch MCP 使用独立的
OAuth 授权，其凭据不能复用于常规 SDK 访问。

## 快速路径

创建并远程注册维护中的 subprocess 模板：

```bash
latch init covid-wf --template subprocess
latch register --yes --open covid-wf
```

远程镜像构建是默认方式。仅当本地 Docker 守护进程可用且确实需要进行本地构建时，才使用 `--no-remote`。

## 最简 Python 工作流

保持工作流主体的声明式特征：调用任务并返回其 promise。
在任务内部执行计算和副作用操作。

```python
from latch import small_task, workflow


@small_task
def reverse_complement(sequence: str) -> str:
    table = str.maketrans("ACGTacgt", "TGCAtgca")
    return sequence.translate(table)[::-1]


@workflow
def reverse_complement_workflow(sequence: str) -> str:
    """Return the reverse complement of a DNA sequence."""
    return reverse_complement(sequence=sequence)
```

当生成的界面需要自定义标签、分区、验证规则、样品表或文档链接时，使用 `@workflow(metadata)`。使用 `LatchFile` 或
`LatchDir` 实现任务输入的自动暂存和输出上传；使用 `LPath` 执行命令式远程路径操作。

## 推荐的开发生命周期

1. **检查兼容性**
   - 确认已安装的 SDK 和 Python 版本。
   - 确定项目属于 Python、Nextflow、旧版 Snakemake 标志路径，还是单独固定版本的 Snakemake v2 教程轨道。

2. **定义类型化接口**
   - 为每个工作流和任务的输入与输出添加类型注解。
   - 确保模块导入时不执行网络调用、数据变更和密钥获取。将 `workflow_reference` 等已记录的例外情况隔离开来；该对象会在其装饰器求值时解析活动工作区。
   - 对结构化参数使用数据类和枚举。

3. **配置元数据和资源**
   - 确保元数据参数键与工作流签名匹配。
   - 从具名任务装饰器开始，仅当测得的需求足以证明其合理性时才使用 `custom_task`。

4. **在执行镜像中验证**

   全新的 Nextflow 和 Snakemake 项目必须在暂存前生成与版本兼容的 Python 入口点。在 SDK 2.76.8 中，暂存分支不会从 `--nf-script` 或 `--snakefile` 生成入口点。

   ```bash
   latch register --staging .
   latch develop .
   ```

   修改 Dockerfile 或依赖项后，重新运行暂存注册。
   在开发容器内进行的编辑不会同步回本地。

5. **有意识地进行注册**

   ```bash
   latch register --yes --open .
   ```

   有用的控制选项：

   ```bash
   latch register --workspace-id 12345 .
   latch register --mark-as-release .
   latch register --workflow-module wf.custom_entrypoint .
   ```

   重复注册会以状态码 `2` 退出；这与构建失败不同。

6. **仅在审查成本和参数后启动**
   - 交互式操作优先使用控制台或 Latch MCP。
   - Python 自动化优先使用 `latch_cli.services.launch.launch_v2`。
   - 不要将已弃用的 `latch launch` CLI 用作新的集成模式。

7. **监控并验证**
   - 检查终端状态、任务日志、结果链接和科学输出。
   - 将编排成功视为必要条件，但不要认为它足以完成科学验证。

## 操作安全

- 在启动付费计算，尤其是 GPU 或大型批处理运行之前，先请求确认。
- 在执行 `LPath.rmr`、`latch rmr`、Registry 删除或覆盖共享目标之前，先请求确认。
- 切勿记录机密、SDK 令牌、签名 URL 或机密值。
- 仅在任务内部调用 `get_secret()`，返回值只能用于其预期服务，且绝不能将其作为工作流输出返回。
- 不要将不受信任的字符串传递给 shell 命令。优先使用带参数列表的 `subprocess.run(..., check=True)`。
- 为发布版本固定 SDK 和工作流依赖。只有在查看变更日志并重新运行 staging 测试后，才能升级。
- 将生成的文件视为生成产物：应自定义文档中说明的扩展文件，而不是编辑 CLI 将覆盖的输出文件。

## 检查已安装的 SDK

在此 skill 目录中：

```bash
uv run --no-project --python 3.12 --with "latch==2.76.8" \
  python scripts/inspect_latch_sdk.py
```

使用 JSON 输出进行自动化比较：

```bash
uv run --no-project --python 3.12 --with "latch==2.76.8" \
  python scripts/inspect_latch_sdk.py --json
```

## 权威来源

- 文档索引：https://wiki.latch.bio/llms.txt
- 工作流和 SDK 指南：https://wiki.latch.bio/workflows/overview
- SDK API 参考：https://wiki.latch.bio/reference/sdk
- PyPI 软件包：https://pypi.org/project/latch/
- SDK 2.76.8 发布源代码：https://github.com/latchbio/latch/tree/0faa9dcd8186444ac008f50adf95d43f0fa30e06
- SDK 变更日志：https://github.com/latchbio/latch/blob/0faa9dcd8186444ac008f50adf95d43f0fa30e06/CHANGELOG.md
- Latch Console：https://console.latch.bio