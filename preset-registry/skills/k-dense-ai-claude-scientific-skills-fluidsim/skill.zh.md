---
name: fluidsim
description: Plan, configure, inspect, restart, and analyze bounded FluidSim computational-fluid-dynamics simulations with explicit numerical-validity and HPC safety checks. Use for FluidSim solver selection, parameter review, FFT/MPI setup, output diagnostics, or restart compatibility.
license: MIT
compatibility: Bundled CLIs require Python 3.11+ and use the standard library; HDF5/netCDF4 metadata tools lazily use h5py when available. Simulation examples target fluidsim 0.9.0, fluidfft 0.4.5, and pyFFTW 0.15.1. MPI/native FFT use requires a site-compatible MPI implementation, development headers, FFTW/PFFT/P3DFFT libraries, compilers, and an approved scheduler workflow. No GPU backend is assumed.
allowed-tools: Read Write Bash Glob Python
metadata:
  version: "1.1"
  skill-author: "K-Dense Inc."
  last-reviewed: "2026-07-23"
---
# FluidSim

使用 FluidSim 0.9.0 作为 Python 定义数值求解器的框架，尤其适用于
周期性笛卡尔伪谱 CFD。上游 FluidSim 采用 CeCILL-2.1；MIT
前置许可证仅适用于此 skill。

此 skill **不会**将已完成的运行、稳定的时间步长、平滑的图像
或程序正常退出视为数值收敛或物理有效性的证据。

## Required workflow

1. 说明方程、单位或无量纲化方式、几何形状、边界条件、
   初始条件、强迫、观测量和验收标准。
2. 选择经过验证的求解器，并检查其生成的默认参数。
3. 创建严格的 JSON 计划，明确 CPU、RAM、磁盘、墙钟时间、输出文件、
   时间步长、CFL、分辨率和去混叠范围。
4. 运行随附的验证器和资源估算器。
5. 生成并审查 dry-run 脚本。除非使用明确的 config-ID 确认执行，否则该脚本不会执行任何操作。
6. 运行一次极小规模的串行试运行。检查预算、散度/约束、
   频谱尾部、CFL/时间步长历史以及输出增长情况。
7. 独立细化网格和时间步长。检查守恒/预算残差以及观测量的敏感性。
8. 仅在此之后准备特定站点的 MPI 作业。绝不自动提交或启动 MPI。
9. 保留 config、脚本、`uv.lock`、包/平台/后端版本、日志、
   输出清单、校验和以及重启沿袭记录。

如果缺少物理假设、单位、边界条件、强迫语义、
分辨率标准、资源限制或验收标准，则停止。

## Version and installation

截至 2026-07-23 验证结果：

- PyPI 最新稳定版本：`fluidsim==0.9.0`（2025-12-04）。
- 包元数据要求 Python `>=3.11`，并列出 Python 3.11–3.14。
- 创建伪谱参数需要 FluidFFT；在冒烟测试中可以导入裸 `fluidsim`，
  但在安装 `fft` extra 之前，`ns2d.create_default_params()` 执行失败。
- 此处测试的当前配套版本：`fluidfft==0.4.5` 和
  `pyFFTW==0.15.1`。

优先使用项目锁定文件：

```bash
uv init --python 3.11
uv add "fluidsim[fft]==0.9.0" "fluidfft==0.4.5" "pyFFTW==0.15.1"
uv lock
uv sync --frozen
```

对于隔离的一次性环境：

```bash
uv venv --python 3.11
uv pip install "fluidsim[fft]==0.9.0" "fluidfft==0.4.5" "pyFFTW==0.15.1"
```

项目锁定文件是可复现性记录；仅直接固定版本并不能冻结
所有传递依赖构件。不要在不兼容的平台或 MPI ABI 之间复用锁定文件。

MPI 是可选的原生组件：

```bash
uv add "mpi4py==4.1.2" "fluidfft-mpi-with-fftw==0.0.1" "fluidfft-fftwmpi==0.0.1"
uv lock
```

这些包仍然需要兼容的 MPI 运行时和 FFTW 开发库。
可选的原生插件包括：

- `fluidfft-fftw==0.0.1`：串行
  `fft2d.with_fftw1d`、`fft2d.with_fftw2d`、`fft3d.with_fftw3d`。
- `fluidfft-mpi-with-fftw==0.0.1`：MPI
  `fft2d.mpi_with_fftw1d`、`fft3d.mpi_with_fftw1d`。
- `fluidfft-fftwmpi==0.0.1`：启用 MPI 的 FFTW
  `fft2d.mpi_with_fftwmpi2d`、`fft3d.mpi_with_fftwmpi3d`。
- `fluidfft-p3dfft==0.0.1`：`fft3d.mpi_with_p3dfft`；需要 P3DFFT。
- FluidFFT 还声明了 PFFT 和 P3DFFT extras；请针对目标集群
  审查并固定其原生软件栈版本。

FluidFFT 的文档历来会介绍 cuFFT，但 FluidFFT 0.4.5 在其包元数据中没有声明 CUDA extra 或已安装的 GPU 插件，其 CUDA 安装页面也尚未完成。不要声称具有 GPU 加速功能，也不要将无关的 CUDA wheel 安装为 FluidSim 后端。应将 GPU 工作视为需要单独验证的源代码级实验性集成。

有关系统依赖、MPI ABI、HDF5-MPI、后端发现和验证，请参见[安装](references/installation.md)。

## API 快照

使用直接的、带版本的导入：

```python
from fluidsim.solvers.ns2d.solver import Simul

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 32
params.oper.Lx = params.oper.Ly = 2 * 3.141592653589793
params.oper.coef_dealiasing = 2 / 3
params.time_stepping.USE_CFL = True
params.time_stepping.cfl_coef = 0.5
params.time_stepping.deltat0 = 0.001
params.time_stepping.deltat_max = 0.01
params.time_stepping.t_end = 0.1
params.time_stepping.max_elapsed = "00:05:00"
params.init_fields.type = "noise"
params.init_fields.noise.velo_max = 0.01
params.output.HAS_TO_SAVE = False
params.output.ONLINE_PLOT_OK = False
```

重要的 0.9 修正：

- CFL 字段：使用 `params.time_stepping.cfl_coef`，而不是 `CFL`。
- 时间相关的强迫：
  使用 `params.forcing.tcrandom.time_correlation`，而不是扁平的
  `tcrandom_time_correlation`。
- NS2D 的默认初始类型包括 `constant`、`noise`、`jet`、`dipole`、
  `from_file`、`from_simul` 和 `in_script`；不要为每个求解器臆造一个通用列表。
- 输出状态文件默认为 `state_phys_t*.nc`；谱使用
  `spectra1D.h5`/`spectra2D.h5`；标量平均值则根据求解器的不同，使用
  `spatial_means.txt` 或 JSON-lines。
- `params.output.sub_directory` 是相对于 `FLUIDSIM_PATH` 的路径。

`ParamContainer` 会拒绝未声明的属性。始终从所选的 `Simul` 类生成默认参数，并在修改值之前检查这些参数。请参见[参数](references/parameters.md)。

## 求解器

主要的笛卡尔 CFD 键名和导入方式：

```python
from fluidsim.solvers.ns2d.solver import Simul       # ns2d
from fluidsim.solvers.ns2d.bouss.solver import Simul # ns2d.bouss
from fluidsim.solvers.ns2d.strat.solver import Simul # ns2d.strat
from fluidsim.solvers.ns3d.solver import Simul       # ns3d
from fluidsim.solvers.ns3d.bouss.solver import Simul # ns3d.bouss
from fluidsim.solvers.ns3d.strat.solver import Simul # ns3d.strat
```

0.9 注册表还包括 `plate2d`、`sw1l` 变体、`waves2d`、一维模型、
零维模型、球面求解器和框架适配器。在注册表中可用，并不意味着某个求解器适合某个科学问题。请在求解器源代码中核实方程、变量、几何形状、边界条件和诊断项。请参见[求解器](references/solvers.md)。

## 强迫与时间推进

强迫取决于具体求解器。当前规范化的随机示例如下：

```python
params.forcing.enable = True
params.forcing.type = "tcrandom"
params.forcing.forcing_rate = 1.0
params.forcing.nkmin_forcing = 4
params.forcing.nkmax_forcing = 5
params.forcing.tcrandom.time_correlation = "based_on_forcing_rate"
```

记录受迫变量、归一化定义、波数带、随机种子/状态、注入目标以及测得的注入量。FluidSim 0.9 会保存用于重启的状态参数；0.8.6 修复了时间相关强迫的重启行为。

可用的伪谱方案包括 Euler/RK2 相移变体、`RK2_trapezoid` 和 `RK4`。指定的阶数并不能证明精度。请检查 CFL、快波/扩散极限、`deltat_max` 以及时间步长细化。参见[高级功能](references/advanced_features.md)。

## 输出、加载和重启

对于只读分析：

```python
from fluidsim import load_sim_for_plot

sim = load_sim_for_plot("run-directory", hide_stdout=True)
sim.output.spatial_means.plot()
sim.output.spectra.plot1d()
sim.output.phys_fields.plot(time=1.0)
```

`load_sim_for_plot` 使用粗粒度算子，并禁用保存/在线绘图。
对于带状态的对象：

```python
from fluidsim import load_state_phys_file

sim = load_state_phys_file("run-directory", t_approx="last")
```

对于受控重启，优先使用 `load_for_restart`，或先运行
`fluidsim-restart --only-check`。不要对不受信任的文本使用
`--modify-params`：上游 CLI 会执行提供给该选项的 Python 代码。此技能的
生成器永远不会生成该选项。请验证求解器、网格/计算域、状态变量、版本、
强迫状态、校验和、目标时间、输出目标位置以及资源限制。
分辨率更改需要使用经过专门审查的工作流，而不是静默编辑网格。
参见[模拟工作流](references/simulation_workflow.md)和
[输出分析](references/output_analysis.md)。

## 科学验收门槛

在解释结果之前，必须具备：

- 明确的量纲单位或完整的无量纲化映射。
- 正确的方程、周期几何/边界条件、初始状态、强迫以及诊断量定义。
- 分辨率和去混叠证据：谱/尾部、已解析梯度以及适用于求解器的小尺度判据。
- 时间步长证据：CFL 历史、最快波和耗散极限，以及更小时间步长的对比。
- 守恒和收支检查，包括强迫、耗散、传递和残差。
- 对报告的观测量进行网格/时间细化，并给出不确定性或敏感性。
- 在适当情况下，与解析解、构造解、基准结果或独立复现的结果进行比较。
- 完整的来源记录和重启谱系。

绝不能仅凭参数值或图表，就将一次运行标记为“DNS”“已收敛”“已验证”“稳态”或“物理上正确”。

## 捆绑的本地工具

所有工具都会输出严格的 JSON，拒绝 URL/路径遍历/符号链接，强制执行硬性限制，
不使用网络或子进程，也永远不会启动模拟：

```bash
python3 scripts/solver_config_validator.py --example
python3 scripts/solver_config_validator.py --config config.json
python3 scripts/grid_resource_estimator.py --config config.json
python3 scripts/simulation_dry_run.py --config config.json --output run.py
python3 scripts/output_inventory.py --path run-directory
python3 scripts/budget_summary.py --path run-directory
python3 scripts/restart_compatibility.py --source state.nc --target-config config.json
```

HDF5 工具会按需要求 `h5py`，检查有界元数据/超切片，
并且绝不会跟随外部链接或加载完整的字段数组。

## 参考资料

- [安装与 FFT/MPI 后端](references/installation.md)
- [求解器注册与选择](references/solvers.md)
- [模拟、试运行与重启工作流](references/simulation_workflow.md)
- [已验证的参数范围](references/parameters.md)
- [输出、绘图与预算分析](references/output_analysis.md)
- [强迫、算子、MPI 与迁移](references/advanced_features.md)

## 有日期的上游依据

已于 2026-07-23 对照以下内容进行验证：
[PyPI 0.9.0](https://pypi.org/project/fluidsim/)、
[FluidSim 0.9 文档](https://fluidsim.readthedocs.io/en/latest/)、
[发行说明](https://fluidsim.readthedocs.io/en/latest/changes.html)、
[官方源码镜像](https://github.com/fluiddyn/fluidsim)、
[FluidFFT 0.4.5 文档](https://fluidfft.readthedocs.io/en/latest/)，以及
主要的 FluidSim ([DOI 10.5334/jors.239](https://doi.org/10.5334/jors.239))
和 FluidFFT ([DOI 10.5334/jors.238](https://doi.org/10.5334/jors.238))
论文。API 相关声明使用官方文档/源码；参考资料中的方法/性能声明仅适用于所引用的主要论文及其基准测试设置。