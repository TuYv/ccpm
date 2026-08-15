---
name: cad
description: Create, modify, inspect, and validate STEP-first parametric CAD parts and assemblies. Use for natural-language CAD specs, reference images, 2D technical drawings, STEP/STP generation or direct inspection, Python CAD source, source-level joints, selector references, geometry facts, measurements, mating deltas, snapshots, and secondary STL/3MF/native GLB outputs from CAD geometry.
---
# CAD 生成、检查与验证

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请将已安装的本地技能文件作为运行时的事实依据；仓库链接仅用于来源追溯和版本审核。

## 目的

根据自然语言需求创建或修改参数化 CAD 模型，生成经过验证的 STEP/STP 工件，检查几何体引用，并返回经检查的输出。将 STEP 视为主要 CAD 工件。将 STL、3MF 和原生 GLB 视为从 STEP 优先流程分支出的次要导出工作流。对于装配体，当零件之间存在功能性装配关系时，优先使用 `cadgen.assembly.AssemblyHelper`，并配合源码级 build123d 接头、具名配合基准和原生标签。

进入 STEP 工作流有两种方式：从 build123d Python 源码生成（从头设计或修改已生成模型时的默认方式），或直接导入现有 STEP/STP 文件（不存在生成器或用户明确指定 STEP 文件时）。两种方式都会生成相同的可检查工件。

## 何时使用此技能

当用户请求 CAD 文件、STEP/STP 文件、build123d 源码、`#o1.2.f1` 等选择器引用、机械零件、装配体、外壳、支架、夹具、孔、沉孔、埋头孔、槽、凹腔、凸台、支撑柱、加强筋、圆角、倒角、壳体、源码级接头、配合或测量时，请使用此技能。当用户提供零件的参考图像或二维技术图纸，希望复刻零件或从中提取设计意图时，也应使用此技能。

当用户请求从 CAD 几何体输出 STL、3MF 或原生 GLB 时，也请使用此技能。请将这些工作流保持为次要流程，并加载 `supported-exports.md` 以了解详细信息。对于二维 DXF 图纸，请使用 `$dxf` 技能；当 DXF 是从三维零件投影生成时，本技能负责 STEP 几何体，而 `$dxf` 负责图纸。

请勿将此技能用于仅渲染的概念艺术、CAM 刀具路径、工程认证、FEA 结论、建筑 BIM 或手绘插图，除非用户同时需要 CAD 几何体。

## 默认假设

除非用户另有指定，否则请使用以下默认值。这些是首轮建模默认值，并不代表对可制造性、公差或认证作出声明：

- 单位：毫米。
- 原点：遵循 `references/positioning.md` 中针对相应零件类型的默认设置；如果没有更合适的位置，则使用主要零件或装配体的中心。
- 基准平面：XY。
- 向上/拉伸轴：正 Z 轴。
- 输出几何体：除非用户请求曲面或构造几何体，否则使用闭合的正体积实体。
- STEP 结构：一个有效实体、实体复合体或带标签的装配复合体。
- 装配体结构：固定的根零件、零件局部坐标系、具名配合基准、适用时由 build123d 接头支持的 `AssemblyHelper` 关系、显式生成的位置变换，以及详细的原生标签。
- 小型塑料外壳壁厚：未指定时为 2.0-3.0 mm。
- 装饰性圆角：在局部几何条件允许时为 1.0-3.0 mm。
- M3/M4/M5 普通间隙孔：除非要求采用其他标准，否则分别为 3.4/4.5/5.5 mm。

仅当缺失的信息会导致模型无法实现、影响装配适配、涉及安全关键问题或受合规要求约束时，才提出一个聚焦的澄清问题。否则，请在明确说明假设的前提下继续执行。

## 工具和路径

在 CAD skill 目录中，启动器的形式如下：

```bash
python scripts/gen ...       # render GLB/topology packages from gen_step() Python sources
python scripts/export ...    # STL/3MF/GLB mesh files from Python sources or imported STEP
python scripts/inspect ...   # refs, measure, align, frame, diff
python scripts/snapshot ...  # PNG/GIF visual review packets
python scripts/artifact ...  # debug one on-demand render-package build (imported STEP)
```

使用当前项目中处于激活状态的 Python 解释器；将示例中的 `python` 视为解释器占位符。使用 `python scripts/<tool> --help` 查看完整的当前命令接口；参考文档展示的是推荐工作流，并未涵盖所有标志。

**快照输入。** 此 skill 的快照功能可渲染 `.step`/`.step.py`、`.stp`、`.3mf`、`.glb` 和 `.stl`。隐式模型和机器人描述由 `implicit-cad` 以及 `urdf`/`srdf`/`sdf` skill 渲染；CLI 会拒绝这些输入，而不是渲染本不应由其渲染的内容。

**主题和显示。** 主题设置统一归于一个 `--theme`，显示设置统一归于一个 `--display`——对应查看器的两个选项卡，各使用一个选项。默认主题为 `snapshot`：Workbench Light，并移除了地面网格和原点坐标轴，因为在静态图像中，它们看起来更像几何体，而不是方向参照。传入 `--theme workbench-light` 可使用查看器自身的外观。投影是所有格式都会遵循的主题特性，因此快照的取景方式与视口一致。

**流。** stdout 承载结果；stderr 承载进度、计时和失败信息。每个工具都会在 stdout 上返回内容——`gen` 会为每个目标输出一行 `<outcome> <package path>`——因此，使用 `2>/dev/null` 会留下可解析的内容，而使用 `>/dev/null` 会留下可读的日志。stdout 上的 JSON 始终是紧凑格式；可通过管道传给 `jq .` 以便阅读。两者绝不会交错，因此，使用 `2>/dev/null` 会留下干净且可解析的结果，而使用 `>/dev/null` 会留下可读的日志。对于机器可读输出：`gen`、`export` 和 `snapshot` 接受 `--json`；`inspect` 已默认输出 JSON，并接受 `--format text` 以输出说明性文本。`--verbose` 会在 stderr 上添加各阶段的计时信息（以及完整的回溯信息）。输出量不会随模型大小增长——包含 600 个实例的装配体与单个零件一样，都只会记录十几行日志。

**失败时**会输出异常，以及位于*你自己的生成器*中的调用帧，而不是运行时内部的调用帧：

```text
[scripts/gen] FAILED: ValueError: bad radius
[scripts/gen]   models/step/parts/widget.step.py:9 in gen_step
[scripts/gen]       return _profile(radius)
[scripts/gen] re-run with --verbose for the full traceback
```

**当同一模型正在并发构建时，当前构建会等待该构建完成**，而不是与之竞态执行，并会在 stderr 上说明情况（`waiting for another run to finish building ...`），等待期间会重复输出该信息。传入 `--lock-timeout SECONDS` 可改为在超时后放弃，并报告 `{"ok":true,"contended":true}`。使用 `--json` 时，每个目标的 `outcome` 为 `built`、`current`、`skipped-peer`（另一个进程已完成，且其软件包为最新）或 `contended`（另一个进程仍在构建，而本次运行选择不再等待）。

目标路径从命令的当前工作目录解析，而不是从 skill 目录解析。请在拥有相关产物的工作区中运行命令，并传入相对于当前工作目录的目标路径，以免项目 CAD 文件被意外解析到 skill 目录下。除非用户明确要求，否则请将 STEP 输出文件及其 Python 生成器放在同一目录中，并使用相同的基本文件名。

CAD 引用是目标局部范围内的 `#...` 选择器令牌，例如 `#o1.2` 或 `#o1.2.f1`。使用 CAD CLI 时，请将 STEP/CAD 文件作为单独的目标参数传入。

## 必需工作流

根据任务调整工作深度：简单零件只需简短的说明和少量由规格驱动的检查；装配体和对配合有严格要求的工作则需要完整的位置与对齐验证。

1. **对任务进行分类。** 新建零件、新建装配体、修改源文件、直接检查 STEP/STP、选择引用、测量/对齐检查、快照审查，或请求辅助输出。
2. **仅加载所需的参考资料。** 使用下方触发条件，而不是读取整个参考资料集。
3. **编写自然语言 CAD 说明。** 从所有提供的输入中提取尺寸、单位、坐标约定、特征意图、输出路径、假设和验证目标——包括文字说明、参考图像和技术图纸。使用 `references/cad-brief.md`。
4. **检查有明确名称的可采购组件。** 当装配体中包含有明确名称的现成执行器、舵机、电机、电子板、连接器或其他可采购组件时，请先搜索 `$step-parts`，再创建简化的占位几何体。如果未找到完全匹配的组件，请记录未匹配结果，然后使用有文档说明的包络体。
5. **编码前先规划。** 在编辑前定义参数、意图标签、源路径、预期包围盒，以及所有配合/定位基准。
6. **编辑源文件，而不是生成的产物。** 使用包含 `gen_step()` 的 build123d Python 代码，并将可构建的入口生成器命名为 `<name>.step.py`（辅助/库模块仍使用 `<name>.py`；参见 `references/step-generation.md`）。存在 Python 生成器时，请对生成器运行 `scripts/gen`，绝不要对其导出的 STEP 文件运行。导入的 STEP/STP 文件（没有生成器）无需构建步骤：检查、快照和 CAD Viewer 会按需生成其渲染产物，并且 `scripts/export` 可直接接受这些文件。
7. **生成明确的目标。** 仅对明确指定的生成器目标运行 `scripts/gen`；不要对整个目录执行生成。当用户需要 `.step` 文件本身时，请添加 `--write`；当用户需要 STL/3MF/GLB 网格文件时，请使用 `scripts/export`。
8. **进行几何验证。** 以运行 `scripts/inspect refs <step-or-cad-target> --facts --planes --positioning` 作为基线，然后使用有针对性的 `measure`、`align`、`frame` 或 `diff` 检查，验证用户规格中要求的尺寸和关系。运行 `scripts/inspect validate <step-or-cad-target>` 以检查几何有效性：`refs --facts` 会报告数量和边界，其 `ok` 字段仅表示引用解析是否成功——开放壳体和反向实体都能通过该检查。
9. **为主要 STEP 创建快照——快照验证是强制要求。** 创建或以可见方式更新主要 STEP/STP 零件或装配体后，始终对其运行 CAD `scripts/snapshot` 并审查输出；确定性检查通过并不是跳过此步骤的理由。仅可在 `references/snapshot-review.md` 中记录的情况下跳过（可见几何体未发生变化，或不存在有效产物）；跳过时请报告原因。
10. **修复并重新运行。** 如果检查失败，请修改导致问题的最小源代码片段，重新生成，并再次运行失败的验证。

## 交接

完成创建或修改 `.step`、`.stp`、`.stl`、`.3mf` 或原生 `.glb` 工件的 CAD 工作后，如果已安装 `$cad-viewer`，必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回指向相关已创建或已更新文件的链接；请在最终回复中包含这些实时查看器链接。如果 `$cad-viewer` 不可用或启动失败，请报告该情况，并改用 CLI 检查和快照，而不是不作说明地省略交接。此规则适用于本技能中的所有工作流，包括次要的 STL/3MF/GLB 输出。

生成验证快照时，请在最终回复中包含已保存的 PNG/GIF 快照。如果不适用快照或快照生成失败，请说明原因，并报告仍然执行了的确定性验证。

## 不可妥协的要求

- 将 STEP 保持为经过验证的主要 CAD 工件。生成的 STEP/STP、STL、3MF、GLB/拓扑输出及渲染附属文件均为派生工件；除非用户另有明确要求，否则 STL/3MF 属于次要工件。
- 使用命名参数、闭合实体、详尽的原生 build123d 标签，以及纳入源代码控制的几何设计意图。
- 在源代码中定义装配定位。对于 `AssemblyHelper`、build123d 关节、显式 `Location` 变换和对齐验证，以 `references/positioning.md` 为权威依据。
- 不要使用 `git status`、`git diff` 或文件大小变化来比较大型导出的 STEP/STP、GLB/拓扑、STL 或 3MF 工件。应改为比较源代码更改、`scripts/inspect` 摘要、快照或生成的拓扑输出；仅将限定路径的 git 状态用于记录管理。
- 只报告实际运行过的检查，或工具输出直接支持的检查。

## 渐进式参考资料

仅在满足相应触发条件时加载以下文件：

- `references/cad-brief.md` — 将文字描述、参考图像和技术图纸转换为 CAD 简要说明。
- `references/build123d-modeling.md` — build123d 建模模式、拓扑、选择器、特征和标签。
- `references/step-generation.md` — 从 Python 源代码生成 STEP、直接导入 STEP/STP，以及生成后的步骤。
- `references/inspection-and-validation.md` — 验证顺序、选择器引用、事实、平面、测量、对齐、差异、坐标系和验证报告。
- `references/snapshot-review.md` — 强制快照策略、材料包规模、针对性视图，以及将视觉发现转换为几何检查。
- `references/positioning.md` — 零件局部基准和原点、装配变换、build123d 关节、CLI 对齐验证和定位报告。
- `references/parameters.md` — 参数化或动画化 STEP 模型：源参数、通过 gen_step params 声明的 JS 参数/动画附属文件、查看器控件和动画设计。
- `references/supported-exports.md` — 通过 `scripts/export` 执行 STL/3MF/原生 GLB 网格导出的工作流。
- `references/repair-loop.md` — 诊断和修复流程。

最终回复应包括生成的文件、返回的 `$cad-viewer` 查看器链接、验证快照、实际运行的验证、假设和注意事项。报告结构请使用 `references/inspection-and-validation.md`。