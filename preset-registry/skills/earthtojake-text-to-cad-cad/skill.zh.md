---
name: cad
description: Create, modify, inspect, and validate parametric CAD parts and assemblies authored as cadgen model scripts. Use for natural-language CAD specs, reference images, 2D technical drawings, STEP/STP generation or direct inspection, Python CAD source, source-level joints, selector references, geometry facts, measurements, mating deltas, snapshots, and STL/3MF/native GLB outputs from CAD geometry. Also covers project structure for multi-part CAD work - src/ for model scripts and shared code, format folders (STEP/, DXF/, STL/) for raw outputs, naming, and commit policy for projects with several @step/@dxf model scripts and imported source files; use it when starting a CAD project with more than a couple of models, when asked how to organize CAD code and artifacts, or when growing a flat folder of models into a project.
---
# CAD 生成、检查与验证

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
使用已安装的本地 skill 文件作为运行时事实来源；仓库链接仅用于来源追溯和发布审查。

## 设置

此 skill 的命令是 `cadgen` distribution 的轻量入口，后者包含 Python 构建运行时及其执行的 JavaScript。安装一次即可：

```bash
python -m pip install -r requirements.txt
```

渲染还需要浏览器，pip 无法提供该浏览器：

```bash
python -m playwright install chromium
```

## 用途

根据自然语言需求创建或修改参数化 CAD 模型，构建经过验证的 STEP/STP（或网格）输出，检查几何体引用，并返回经过检查的输出。STEP 是 CAD 几何体的默认输出格式，也是检查工具读取的格式；STL、3MF 和原生 GLB 是模型在其旁边声明的网格输出格式，或者在零件仅用于打印时作为替代输出。对于装配体，当零件之间存在功能性装配关系时，优先使用 `cadgen.assembly.AssemblyHelper`，配合源代码级的 build123d joints、命名的配合基准和原生标签。

STEP 工作流有两种入口：从 build123d 模型脚本构建（从头设计或修改生成的模型时的默认方式），或者直接导入现有的 STEP/STP 文件（不存在脚本，或用户明确指定 STEP 文件时）。两种方式都会以相同的方式进行检查、创建快照和导出。

## 使用此 skill 的场景

当用户请求 CAD 文件、STEP/STP 文件、build123d 源代码、选择器引用（例如 `#o1.2.f1`）、机械零件、装配体、外壳、支架、夹具、孔、沉头孔、埋头孔、槽、腔、凸台、支柱、加强筋、圆角、倒角、抽壳、源代码级 joints、配合或测量时，使用此 skill。当用户提供零件的参考图像或二维工程图，要求复现零件或从中获取设计意图时，也使用此 skill。

当用户请求从 CAD 几何体输出 STL、3MF 或原生 GLB 时，也使用此 skill；详情请加载 `supported-exports.md`。对于二维 DXF 图纸，使用 `$dxf` skill；当 DXF 是从三维零件投影生成时，本 skill 负责零件，而 `$dxf` 负责图纸。

不要将此 skill 用于仅渲染概念艺术、CAM 刀具路径、工程认证、FEA 结论、建筑 BIM 或徒手插图，除非用户同时需要 CAD 几何体。

## 默认假设

除非用户另有指定，否则使用以下默认值。这些是首轮建模默认值，不代表可制造性、公差或认证声明：

- 单位：毫米。
- 原点：遵循 `references/positioning.md` 中针对零件类型的默认设置；若没有更合适的设置，则将主零件或装配体居中。
- 基准平面：XY。
- 向上/拉伸轴：正 Z。
- 输出几何体：闭合的正体积实体，除非用户请求曲面或构造几何体。
- STEP 结构：一个有效实体、实体的 compound，或带标签的装配体 compound。
- 装配体结构：固定根零件、零件局部坐标系、命名的配合基准、在适用时由 build123d joints 支持的 `AssemblyHelper` 关系、显式生成的放置，以及详细的原生标签。
- 未指定时，小型塑料外壳壁厚：2.0-3.0 mm。
- 装饰性圆角：在局部几何体允许的情况下为 1.0-3.0 mm。
- M3/M4/M5 普通间隙孔：3.4/4.5/5.5 mm，除非请求其他标准。

仅当缺失信息会导致模型无法实现、对适配至关重要、涉及安全关键问题或受合规要求约束时，才提出一个聚焦的澄清问题。否则请明确说明假设后继续。

## 工具和路径

命令界面（随软件包安装的 `cadgen` 控制台脚本）：

```bash
python <model>.py            # its __main__ calls the model, which builds it
cadgen step build IN OUT     # re-emit an existing STEP as a new one, with kinematics
cadgen stl build ...         # one door per mesh format; `3mf` and `glb` are the others
cadgen step inspect ...      # refs, measure, align, frame, diff
cadgen step snapshot ...     # PNG visual review packets, for STEP
cadgen stl snapshot ...      # the same, for a mesh file; `3mf` and `glb` again
cadgen store why <model>.py  # why the model is stale or current, clause by clause
cadgen daemon status         # the warm workers and the jobs they are running
```

**脚本要运行；命令处理文档。** `python model.py` 是唯一的
源入口：它会写入模型声明的每个输出，并且（仅当模型声明了运动学、动画或网格导出时）写入其 sidecar。上述每条命令都接收一个 `.step`/`.stl`/`.dxf` 文件，而传入 `.py` 的命令则表示这一点。一个入口只会针对文档提出一个问题：存储中是否存在对应此文件字节内容的树？如果存在，它就读取该树；如果不存在，它会将这些字节作为池中的一个任务编译成树，无论文件是生成的还是导入的。**入口永远不会拒绝文档，也永远不会运行脚本。**文档是否落后于其脚本是模型的职责（`cadgen store why`），而不是入口的职责。

使用当前项目的 Python 解释器；将示例中的 `python` 视为解释器占位符。每个操作动词都是一个 `cadgen` 子命令（`python -m cadgen.cli <verb>` 是与 PATH 无关的等价形式）。使用 `cadgen <verb> --help` 获取当前完整接口；参考文档展示推荐的工作流，而不是每个标志。按照 `requirements.txt` 安装；`cadgen doctor <skill-dir>` 会验证已安装的 cadgen 是否与此 skill 固定的版本匹配（安装版本不匹配时，文档会静默漂移）。

目标路径从命令的当前工作目录解析，而不是从 skill 目录解析。从拥有这些构件的工作区运行命令，并传入相对于 cwd 的目标路径，以避免项目 CAD 文件意外解析到 skill 目录下。

CAD 引用是相对于目标文件的 `#...` 选择器标记，例如 `#o1.2` 或 `#o1.2.f1`。使用 CAD CLI 时，将 STEP/CAD 文件作为单独的目标参数传入。

## 一个模型

生成没有 CLI。模型是一个普通的 Python 脚本：包含一个无参数的装饰函数，并在 `__main__` 中通过调用该函数构建模型：

```python
from cadgen import build123d as bd
from cadgen import step

WIDTH = 10.0


@step                      # or @step(out="../STEP/bracket.step") to relocate the output
def bracket():
    return bd.Box(WIDTH, 10, 10)


if __name__ == "__main__":
    bracket()
```

以下规则均由装饰器或构建过程强制执行：

- **装饰器只负责声明；调用才会构建。** 导入模型模块绝不会触发构建；没有 `if __name__ == "__main__": <model>()` 的文件也绝不会构建——始终以这种方式结束脚本。`python bracket.py` 会在脚本旁写入 `bracket.step`，并将模型的结果写入存储；未发生变化的模型会快速空操作。`--force` 只会重新构建此模型。
- **模型不接受任何参数**，其函数也不带参数调用。参数化几何应放在模型使用给定值调用的普通工厂函数中（`def _bracket(width, thickness): ...`）；另一种配置应放在另一个文件中作为另一个模型，这就像两个零件编号对应两个零件。
- **返回值必须是裸的 build123d `Shape`**——可以是实体、复合体或带标签的装配复合体。绝不能是字典，也不能是路径。
- **输出内容完全由装饰器声明。** `@step` 会写入 `.step`；叠加在其上的 `@stl`/`@threemf`/`@glb` 会写入网格。**不要求 STEP**：只有 `@stl`（或 `@glb`、`@threemf`）而没有 `@step` 的函数，也是一个具有相同树、记录、构建和空操作行为的完整模型；其输出是网格，不会写入 `.step`，也不会写入旁车文件。打印专用零件和渲染资产应使用这种方式。参见 `references/supported-exports.md`。
- **装饰器参数绝不会改变几何体。** 它们决定文件写入位置（`out=`）、写入方式（`mesh_tolerance=`、`mesh_angular_tolerance=`）以及旁车文件声明的内容（`kinematics=`）。几何体就是返回值，仅此而已：放置子项的 `Compound` 会被打包为多个出现项，单个实体会作为一个组件，`part`/`assembly` 则从树中读取。不存在 `kind=`，也不存在烘焙点——已摆放或配置不同的导出内容属于作者定义的几何体，或属于另一个模型。
- **只有严格必要时才写入旁车文件。** 只有模型声明了 `kinematics=` 时才会写入 `<name>.step.json`；未声明任何内容的模型不会有旁车文件，而重建时如果移除了该声明，则会删除残留文件。模型对其输出所做的声明保存在其记录中，而不是几何文件旁边的文件中。
- **通常每个文件放置一个模型。** 模型的身份由其文件和函数共同确定（`plate.py::plate`）；只包含一个模型的文件仅由其路径确定。一个文件**可以**包含多个模型（一个小型变体系列）：每个模型都有自己的记录、输出和任务（单独的模型写入 `<file>.step`；共享同一文件的模型写入 `<function>.step`），但它们共享该文件的闭包，因此编辑其中一个模型会触发全部模型重建——这也是建议每个文件放置一个模型的原因。
- **组合就是一次调用。** 导入同级模型，并在函数体中调用它（`from arm import arm` … `arm()`）；它会返回子模型的几何体。`references/step-generation.md` 中包含完整的组合契约。
- **`from cadgen import build123d as bd`** 是规范导入方式——它是对 build123d 的延迟、透明再导出（名称和行为相同），因此新鲜度检查和热工作进程交接会在付出内核导入开销之前运行。直接使用 `import build123d` 也可以，但每次重新运行都会额外耗时约 2.5 秒。
- 每次运行的标志通过脚本的 argv 传入：`--force`、`--json`、`--verbose`、`--mesh-tolerance`、`--mesh-angular-tolerance`。

## 组合、新鲜度与构建

基础要点；`references/step-generation.md` 包含代码和边界情况。

- **子项是你调用的模型。** 父项的主体导入同级模型并调用它们；每次调用都会返回该子项的几何体（若已过期则构建，若仍为最新则从存储中加载），父项的结果会 LINKS 到子项的结果——仅存储一次，由每个父项共享。使用 `Pos/Rot/Location * child` 或 `child.moved(loc)` 放置子项；绝不要使用 `child.located(loc)`（它会深度复制几何体，因此父项拥有的是副本而不是链接）。
- **每次构建都是并行的。** 子项调用会提交该子项的构建并立即返回；同级子项在各自的工作进程上构建，而主体继续执行；父项会在首次读取几何体时等待——通常是在结束的 `bd.Compound(children=[...])`。无需配置，无需注解。
- **构建之间绝不会互相等待或取消。** 同一模型的两次运行都会执行；存储会保留其源文件与当前文件匹配的结果，因此磁盘最终保留较新的源文件对应的结果。父项构建期间编辑子项，父项仍会基于其固定的子项版本完成构建。
- **重建的零件不会更新使用它的装配体。** 依赖关系是拉取式的：重建父项（`python assembly.py`）以获取子项的更改。若子项编辑后生成的几何体相同，父项仍保持最新。
- **重建跟踪的内容——模型按结果、常量按值、函数按文件。** 导入模型函数会按其结果跟踪该模型；导入模块级字面量（`from plate import WIDTH`）会跟踪其值；从文件导入其他任何内容（辅助函数、`bd.` 对象）都会使整个文件成为你模型的源文件，因此对它的任何编辑都会触发你的模型重建。共享常量可以放在模型文件中，也可以放在 `lib/` 中。
- **环境不是输入。** 模型和 `lib/` 代码不从 `os.environ`、工作目录、当前时间或随机源获取参数：门控机制按哈希跟踪源文件、按值跟踪常量、按结果跟踪子项，且无法看到这些内容——通过它们改变几何体的值，会使过期结果被判定为最新。一个配置是一个工厂参数；另一个配置是另一个模型。
- **镜像零件是它自己的模型。** STEP 无法表达反射，因此右侧零件应是一个独立的模型文件，以 `mirror=True` 调用相同的工厂（或镜像工厂的结果），而不是镜像子项。
- **`read_step` 文件是输入，不是模型。** 替换该文件会使读取器过期。要使导入的零件成为一等对象，请将其封装：
  `@step def servo(): return read_step(...)`。
- **`cadgen store why <model>.py`** 是新鲜度之门：它会逐项打印门控机制的判断结果（记录、闭包文件、常量、每个子项已固定与当前的树、树对象、声明的输出）。当模型是否重建与你的预期不符时，就使用它。

**工作进程。** 默认启用预热守护进程：每个模型获得一个持久工作进程（当模型在已构建期间再次被请求时，会获得第二个、一个*额外的*工作进程）；备用工作进程待命，因此新模型无需承担导入开销；空闲工作进程会在十分钟后解绑。运行中的构建限制为每个核心一个（`CADGEN_JOBS` 可覆盖）；等待其子项的父项不占用槽位。`CADGEN_DAEMON=0` 使用为该次运行生成的临时工作进程——仍然并行，仍使用同一存储——这是测试和调试时使用的模式。`cadgen daemon status` 会列出工作进程、备用进程以及正在运行/排队的作业。

**调试说明。** 不要在某个模型的 daemon 构建正在进行时，交替使用 `CADGEN_DAEMON=0` 和该模型的 daemon 运行（两者未经过 broker 协调；各自发布其构建结果，而发布规则会保留更新的源）。**一个项目，一个存储。** 在另一个 `CADGEN_CACHE_DIR` 下进行的构建（临时存储、测试）会重写相同的输出文件；第一个存储中的记录随后会看到其未写入的输出字节，因此其门控会报告模型过期（`output changed: …`），并且每个父级都会报告 `child stale: …` —— 这没有问题，只是两个存储的状态不一致，下一次在任一存储下构建都会使其稳定下来。**保持模块体低成本。** 每次重新运行时都会导入模型文件，并且发生在门控之前：如果在模块级别调用 `read_step`（在导入时从供应商 STEP 文件计算布局），那么即使模型是最新的，每次也都会付出内核和解析的开销 —— 请在模型体内或其调用的函数中调用 `read_step`；此类运行中打印的 `hint:` 会指出导入位置。**重置时从最小范围开始：** `python model.py --force` 立即重建一个模型；`cadgen store forget <model.py>` 删除该模型的记录，使其在*下一次*运行时重建（子项不受影响）；`cadgen store forget <file.step>` 删除该文件字节对应的树条目，使下一次 open 或 door 调用重新编译它；`cadgen store gc` 清理不可达对象；**清空存储（`rm -rf
~/.cache/cadgen`，或 `$CADGEN_CACHE_DIR`）始终是安全的** —— 所有模型都会被视为过期并重建，并且不会触碰任何项目文件。门控没有 cadgen 版本条件，因此由存在 bug 的 cadgen 构建的模型在修复后仍会保持最新：请对受影响的模型（或链接了它们的父级）执行 `forget`，或者清空存储。

**存储**（`~/.cache/cadgen`，可由 `CADGEN_CACHE_DIR` 覆盖）包含 `objects/` —— 不可变、按内容寻址的组件和树 —— 以及 `index/` —— 门控读取的每模型记录、操作记忆和网格账本。它只包含派生结果。完整契约位于已安装 `cadgen` 软件包中的 `STORE.md`。

## 流、进度与失败

**流。** stdout 携带结果；stderr 携带进度、计时信息和失败信息。模型运行会在 stdout 上打印 `<outcome> <document path>`（`built`、`current`，或者在同一模型的并发构建先完成时打印 `skipped-peer`），并且两个流绝不会交错，因此 `2>/dev/null` 会留下干净、可解析的结果，而 `>/dev/null` 会留下可读的日志。stdout 上的 JSON 始终是紧凑格式；通过 `jq .` 管道处理即可阅读。对于机器可读的输出：模型运行、`build` doors（`step`、`stl`、`3mf`、`glb`）和 `snapshot` 都接受 `--json`；`inspect` 已经输出 JSON，并接受 `--format text` 以输出说明文字。模型运行的 `--json` 行包含 `outcome`、`document` 和 `tree`（结果的哈希值）。`--verbose` 会在 stderr 上增加阶段计时（以及完整的 traceback）。输出量不会随模型大小增长。

**构建树。** 在终端上，stderr 会随着模型体的子调用逐步显示图 —— 一个刷新的区块，每个模型依次显示 `submitted`、`queued`、`building · <phase> n/total`、`current` 或 `✓ <time>`，已完成的子树会折叠为一行。使用 `--json` 或在非 TTY 环境中时，stderr 会改为每次模型状态转换输出一行 JSON（`model`、`parent`、`state`、`phase`、`progress`、`elapsed`），取代图形显示；stdout 上的结果行最后输出。发布后，根节点会再次运行一次门控；如果发生了变化，会提示 `already stale: <child> changed during the build; rerun`。

**从模型报告进度。** 长时间构建的大部分耗时都在模型主体中。导入 reporter — 它会绑定到当前正在运行的构建，没有构建时则不执行任何操作：

```python
from cadgen import report, track, step

@step
def housing():
    report("bearing housing")                              # name the current phase
    for rib in track(ribs, label=lambda r: r.name):        # count through a work list
        ...
```

`track()` 会在某个项目的工作完成（DONE）后推进计数，并标记当前正在处理的项目，因此读者会看到“已完成 3 项，当前处理 engines”。该阶段会显示在构建树中模型对应的行上，并通过守护进程的作业记录，在 CAD Viewer 中显示为写入该作业文档的 `compiling · <phase>`，无论作业由谁启动。如果没有此功能，多分钟的装配过程在其最长阶段期间将不会提供任何信息。

**失败信息**会打印异常以及*你自己的模型中的调用栈*，而不是运行时的调用栈：

```text
[cadgen] FAILED: ValueError: bad radius
[cadgen]   src/widget.py:9 in bracket
[cadgen]       return _profile(radius)
[cadgen] re-run with --verbose for the full traceback
```

失败的子任务会在父任务中首次读取其几何体的位置抛出异常，指出调用名称，并携带子任务工作进程的输出。

## 快照

**快照输入。** 一种格式，一个入口，并且使用与 `build` 相同的 `TARGET [OUT]` 语法。`cadgen step snapshot` 只渲染 `.step`/`.stp` 文档 — 不接受其他内容（模型脚本会按名称被拒绝：请运行 `python <model>.py`，然后对它写出的 STEP 执行 snapshot）。网格文件使用各自的入口：`cadgen stl snapshot`、`cadgen 3mf snapshot`、`cadgen glb snapshot`。网格没有 CAD 拓扑，因此仅适用于 STEP 的选项（`--focus`/`--hide`、`--display`、`--kinematics`、`--animation`/`--time`、`--mode section`）根本不会出现在这些命令中 — 请查看 `--help`，入口会告诉你它支持哪些功能。机器人描述属于 `urdf`/`srdf`/`sdf` 技能。每个入口都会拒绝不属于自身格式的输入，并指出可接受它的入口。

```bash
cadgen step snapshot STEP/bracket.step tmp/review.png
cadgen stl snapshot  STL/bracket.stl   tmp/mesh.png
```

**快照输出。** 你指定的路径就是实际输出路径：

```bash
cadgen step snapshot STEP/bracket.step tmp/review.png
# then Read tmp/review.png
```

`OUT` 会完全按照给定内容写入（相对路径以当前工作目录为基准），渲染前会清除该路径，渲染完成后以原子方式写入 — 因此迭代时可以重复使用同一个名称；需要比较时，请为每次迭代命名（`tmp/before.png`、`tmp/after.png`），并将文件缺失视为失败信号：路径上永远不会残留旧图像而被误认为输出。目录（`tmp/`）属于不指定具体文件名的情况，系统会在其中生成一个带时间戳的名称，并将其打印在 `saved snapshot:` 行中。JSON 数据包中的每个输出也遵循相同规则。

**主题和显示。** 主题设置统一放在一个 `--theme` 下，显示设置统一放在一个 `--display` 下 — 对应查看器中的两个选项卡，每个选项卡使用一个选项。默认主题为 `snapshot`：使用 Workbench Light，并移除地面网格和原点轴，因为在静态图像中它们看起来像几何体，而不是方向参考。传入 `--theme workbench-light` 可使用查看器自身的外观。投影是所有格式都会遵循的主题属性，因此快照的取景方式与视口保持一致。

## 必需工作流

根据任务调整深度：简单部件需要简短说明和少量基于规格的检查；装配体和对配合要求严格的工作则需要完整的位置与对齐验证。

1. **对任务分类。** 新建部件、新建装配体、源文件修改、直接 STEP/STP 检查、参考选择、测量/对齐检查、快照审查，或网格输出请求。
2. **仅加载所需的参考资料。** 使用以下触发条件，而不是读取完整的参考资料集。
3. **编写自然语言 CAD 简报。** 从所有提供的输入中提取尺寸、单位、坐标约定、特征意图、输出路径、假设和验证目标，包括 prose、参考图像和技术图纸。使用 `references/cad-brief.md`。
4. **检查指定的可购买组件。** 当装配体包含指定名称的现成执行器、舵机、电机、电子板、连接器或其他可购买组件时，在创建简化占位几何体之前搜索 `$step-parts`。如果找不到完全匹配的组件，记录此次未找到的结果，然后使用有文档说明的包围体。
5. **先规划再编码。** 在编辑之前定义常量和工厂参数、意图标签、源路径、预期包围盒，以及任何配合/定位基准。
6. **编辑源文件，而不是生成的产物。** 使用一个带有一个装饰函数的普通 `.py` 模型脚本进行建模（共享代码放在普通辅助模块中；参见 `references/step-generation.md`）。当模型脚本已存在时，运行 IT，绝不要手动编辑其导出的 STEP。对于没有脚本的导入 STEP/STP 文件，直接交给 `cadgen step inspect`、`step snapshot` 和网格相关流程，这些命令会按需编译所需内容。
7. **构建明确的目标。** 直接运行每个模型脚本（`python <model>.py`）；不要扫描目录。父级在调用子级时会构建子级，因此运行根级脚本即可完成整个构建。可以在模型上声明 `@stl`/`@threemf`/`@glb` 输出，或者运行 `cadgen stl|3mf|glb build` 来生成一次性网格文件。对于多模型项目结构，请阅读 `references/project-layout.md`。
8. **进行几何验证。** 运行 `cadgen step inspect refs <step-or-cad-target> --facts --planes --positioning` 作为基线，然后使用有针对性的 `measure`、`align`、`frame` 或 `diff` 检查，验证用户规格中明确要求的尺寸和关系。运行 `cadgen step inspect validate <step-or-cad-target>` 检查几何健全性：`refs --facts` 会报告计数和边界，而其 `ok` 字段只涵盖参考解析；开放壳体和反转实体都能通过该检查。
9. **对主要 STEP 进行快照，快照验证是强制性的。** 创建或明显更新 STEP/STP 部件或装配体后，始终对其运行 `cadgen step snapshot` 并审查输出；通过确定性检查并不是跳过该步骤的理由。唯一可跳过的情况记录在 `references/snapshot-review.md` 中（没有可见几何发生变化，或不存在有效产物）；跳过时必须报告原因。纯网格模型应使用其格式对应的快照流程进行审查。
10. **修复并重新运行。** 如果检查失败，修改负责该问题的最小源代码部分，重新构建，并重新运行失败的验证。

## 交接

完成创建或修改 `.step`、`.stp`、`.stl`、`.3mf` 或原生 `.glb` 构件的 CAD 工作后，必须始终将明确的文件路径传递给 `$cad-viewer`（如果已安装该 skill）。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回相关已创建或更新文件的链接；在最终响应中包含这些实时查看器链接。如果 `$cad-viewer` 不可用或启动失败，必须报告这一情况，并依靠 CLI 检查和快照，而不能默默跳过交接。此规则适用于该 skill 中的每种工作流，包括网格输出。

生成验证快照时，必须在最终响应中包含已保存的 PNG 快照。如果不适用快照，或快照生成失败，说明原因，并报告仍然执行的确定性验证。

## 不可妥协的要求

- 模型脚本是事实来源。所有写入的文件，包括 STEP/STP、STL、3MF、GLB 和 sidecar，都是派生输出；始终编辑并重新运行脚本，绝不要直接编辑输出文件。如果模型声明了 STEP，则 STEP 是需要检查并生成快照的构件。
- 使用命名常量、封闭实体、详细的原生 build123d 标签，以及由源代码控制的几何意图。
- 在源代码中编写装配定位。`references/positioning.md` 是 `AssemblyHelper`、build123d joints、显式 `Location` 变换和对齐验证的权威依据。
- 不要使用 `git status`、`git diff` 或大型导出 STEP/STP、GLB、STL 或 3MF 构件的文件大小变化作为 CAD 对比依据。应改为比较源代码变更、`cadgen step inspect` 摘要或快照；仅在记录事项时使用路径受限的 git status。
- 只报告实际运行过的检查，或工具输出直接支持的检查。

## 渐进式参考资料

仅在满足触发条件时加载以下文件：

- `references/cad-brief.md` — 将 prose、参考图像和技术图纸转换为 CAD brief。
- `references/build123d-modeling.md` — build123d 建模模式、拓扑、选择器、特征和标签。
- `references/step-generation.md` — 完整的模型契约：组合（链接的子项、`read_step` 输入）、重建所跟踪的内容、镜像零件、工厂、daemon 和 workers、导入的 STEP/STP 文件，以及构建后的步骤。
- `references/inspection-and-validation.md` — 验证顺序、selector refs、facts、平面、测量、对齐、diff、frame 和验证报告。
- `references/snapshot-review.md` — 强制快照策略、数据包大小、目标视图，以及将视觉发现转换为几何检查。
- `references/positioning.md` — 零件局部基准面和原点、装配变换、build123d joints、CLI 对齐验证和定位报告。
- `references/kinematics.md` — 对 STEP 模型进行关节运动、姿态设置或动画：装饰器上的类型化 mates（`kinematics=` — mates、couplings、pose presets、export-at-pose），以及文档旁边的渲染模块（`<name>.step.js`：编排契约，由查看器加载，不被任何构建读取）。
- `references/supported-exports.md` — STL/3MF/原生 GLB 输出：声明的导出项、仅网格模型，以及 `cadgen stl|3mf|glb build` 构建入口。
- `references/repair-loop.md` — 诊断和修复流程。
- `references/project-layout.md` — 对于多于几个零散模型的项目的项目结构：用于模型脚本和共享代码的 `src/`、用于原始输出的格式目录（`STEP/`、`DXF/`、`STL/`）、命名和提交策略；`references/project-template.md` 是可复制的示例。对于包含多个模型的项目，或用户询问如何组织 CAD 代码和构件时阅读这些文件。
- `references/migrations.md` — 工具与你认为正确的模型之间存在不一致：识别基于较旧 cadgen 编写的项目，以及迁移指南所在的位置。

最终响应应包含生成的文件、返回的 `$cad-viewer` 查看器链接、验证快照、实际执行的验证、假设和注意事项。使用 `references/inspection-and-validation.md` 作为报告结构。