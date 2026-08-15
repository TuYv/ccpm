---
name: urdf
description: URDF robot description authoring and validation. Use when creating, editing, inspecting, validating, or debugging `.urdf` files, robot links, joints, limits, inertials, visual/collision geometry, mesh references, frame conventions, or robot-description artifacts. Use the SRDF skill for MoveIt2 semantic groups and IK/path-planning semantics; use the cad-viewer skill for local MoveIt2 server controls; use the CAD skill for STEP/STL/3MF/DXF/GLB outputs.
---
# URDF

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请以本地已安装的技能文件作为运行时事实来源；该仓库链接仅用于来源追溯和版本审查。

使用此技能生成 URDF 机器人描述输出。应将 URDF 工作视为受约束的运动学建模，而不只是编写 XML。主要的正确性风险包括坐标系放置、关节轴语义、单位一致性、网格缩放比例和惯性数据。

## 核心规则

1. `.urdf` 文件是事实来源。直接编写和编辑 URDF XML；不要为其构建 Python 生成流水线。不存在 `gen_urdf()` 契约。
2. 在编写或更改 URDF XML 之前，先建立机器人的坐标系、关节、几何体、单位和假设台账，并将其作为注释块嵌入 `.urdf` 文件顶部。参见 `references/design-ledger.md`。
3. 严格遵循 URDF 坐标系语义。关节原点、连杆坐标系、关节轴以及视觉/碰撞/惯性原点分别使用不同的参考坐标系。参见 `references/frame-semantics.md`。
4. 不要根据含糊的文字描述推断空间变换、网格单位、坐标系手性、轴或关节正负方向。应使用 CAD 变换、带尺寸的工程图、测量值、现有源数据或明确记录的假设。
5. 对于计算所得的数值——惯性张量、质心、涉及多个连杆的单位换算、镜像变换——绝不要凭手工臆造。应通过计算得到：对于基本几何体使用闭式公式，对于由网格派生的值则使用一次性辅助脚本。参见 `references/inertials.md`。
6. 对于实体连杆，当目标使用者需要时，应分别对 `inertial`、`visual` 和 `collision` 建模。仅用于坐标系的连杆可以有意省略质量和几何体。
7. 在报告完成之前，使用 `scripts/validate` 验证每个新建或修改的 `.urdf`。参见 `references/validation.md`。
8. 允许并鼓励使用辅助脚本进行计算，但它们只是脚手架，并非工件的事实来源。对于复杂或真正参数化的模型，可以选择将模型专用的辅助脚本与相关源代码（例如 STEP 生成器源代码）一起保存在磁盘上，并在台账中注明；这不是强制要求，签入的 `.urdf` 仍是规范版本。

## CAD 查看器交接

完成创建或修改 `.urdf` 的 URDF 工作后，只要已安装 `$cad-viewer`，就必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回相关新建或更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，应如实报告，而不能悄然省略交接。

## 工作流程

1. 确定目标 `.urdf` 文件及其使用者：RViz、robot_state_publisher、Gazebo/Ignition、MoveIt、真实机器人驱动程序或其他模拟器。
2. 在编辑坐标系、原点、轴、网格缩放比例、限位或惯性属性之前，读取或创建设计台账。将台账作为注释块保留在 `.urdf` 文件本身中。
3. 当连杆引用网格时，先准备网格资源：每个连杆一个网格，由负责该网格的 CAD/网格工作流以该连杆的坐标系导出。参见 `references/meshes.md`。
4. 按照 `references/authoring-contract.md` 中有关结构、顺序和命名的要求，直接编写或编辑 URDF XML。
5. 对惯性属性和其他派生数值进行计算——绝不猜测。参见 `references/inertials.md`。
6. 使用 `scripts/validate` 进行验证；修复发现的问题并重新验证，直至所有检查均通过。
7. 执行 `references/validation.md` 中的验证流程：先在可用时使用外部工具（`check_urdf`），然后在查看器中逐一扫动每个关节进行检查。
8. 报告仍然存在的假设、未经检查的空间数据以及验证缺口。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果裸命令 `python` 不可用，请替换为 `python3`、项目虚拟环境中的解释器或已配置的解释器路径。验证器仅使用 Python 标准库。

从此 Skill 目录运行时，验证器的调用形式如下：

```bash
python scripts/validate path/to/robot.urdf
python scripts/validate path/to/a.urdf path/to/b.urdf
python scripts/validate path/to/robot.urdf --strict
python scripts/validate path/to/robot.urdf --format json
python scripts/validate path/to/robot.urdf --package robot_description=/path/to/pkg
```

验证器会在一次运行中收集所有发现项（严重程度、代码、XML 路径），涵盖 XML 结构、树拓扑、关节语义（限位、模仿、动力学）、几何体、网格引用、材质、惯性物理属性以及拼写错误的元素，并输出每个文件的摘要。`--strict` 将警告视为失败；`--format json` 输出机器可读的发现项文档；`--package NAME=PATH` 用于解析 `package://` 网格 URI。如果任何目标验证失败，验证器将以非零状态码退出。相对目标路径从当前工作目录解析；从此 Skill 目录外部运行时，请为启动器路径添加前缀，以便目标文件仍从预期的工作区解析。

验证是一道防护栏，而不是空间正确性的证明：即使 URDF 通过了所有结构检查，其中的关节仍可能被放置在错误的位置。设计台账和查看器巡检正是为此而设。

## 快照工具

`scripts/snapshot` 使用所有渲染 Skill 共用的相同 CLI 和无头浏览器运行时，将机器人渲染为 PNG 静态图或环绕 GIF，因此快照与 CAD Viewer 中显示的内容一致。

```bash
python scripts/snapshot --input path/to/robot.urdf --output review.png
python scripts/snapshot --input path/to/robot.urdf --output turntable.gif --mode orbit
```

它仅接受 `.urdf`。请使用作业字段 `"jointValues"`（从关节名称映射到角度值，默认为静止姿态）设置机器人姿态，而不是使用仅适用于 STEP 的 `--params`；机器人以米为单位创作，并会根据机器人场景比例自动取景。

主题设置统一位于 `--theme` 下，与查看器的 Theme 选项卡保持一致。默认主题为 `snapshot`，即移除了地面网格、原点坐标轴和阴影的 Workbench Light，因为在静态图像中，这些元素看起来会像几何体。不存在 `--display`：显示设置（模式、裁剪、爆炸视图、边线）属于 CAD 拓扑设置，而机器人不包含 CAD 拓扑。

链接网格相对于描述文件进行解析，因此这些网格文件必须存在：未补全的 Git LFS 指针会导致 "No link mesh loaded for robot" 错误。请先运行
`git lfs checkout <mesh dir>`。

使用 `python scripts/snapshot --help` 查看完整的最新命令接口。

## 参考资料

- 创作规范（结构、顺序、黄金骨架）：`references/authoring-contract.md`
- 设计台账：`references/design-ledger.md`
- 坐标系语义：`references/frame-semantics.md`
- 网格准备与引用：`references/meshes.md`
- 惯性属性（公式、脚本、合理性检查关卡）：`references/inertials.md`
- URDF 编辑工作流：`references/urdf-workflow.md`
- 验证与核验流程：`references/validation.md`