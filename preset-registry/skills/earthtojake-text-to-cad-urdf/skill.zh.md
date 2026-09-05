---
name: urdf
description: URDF robot description authoring and validation. Use when creating, editing, inspecting, validating, or debugging `.urdf` files, robot links, joints, limits, inertials, visual/collision geometry, mesh references, frame conventions, or robot-description artifacts. Use the SRDF skill for MoveIt2 semantic groups and IK/path-planning semantics; use the CAD skill for STEP/STL/3MF/DXF/GLB outputs.
---
# URDF

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。  
使用已安装的本地 skill 文件作为运行时事实来源；仓库链接仅用于来源追溯和发布审查。

将此 skill 用于 URDF 机器人描述输出。将 URDF 工作视为受约束的运动学建模，而不只是编写 XML。主要正确性风险包括坐标系放置、关节轴语义、单位一致性、网格缩放和惯性数据。

## 设置

此 skill 的命令是 `cadgen` distribution 的轻量入口，后者包含 Python 构建运行时及其执行的 JavaScript。安装一次即可：

```bash
python -m pip install -r requirements.txt
```

渲染还需要浏览器，pip 无法提供：

```bash
python -m playwright install chromium
```

## 核心规则

1. `.urdf` 文件是事实来源。直接编写和编辑 URDF XML；不要为其构建 Python 生成管线。不存在 `gen_urdf()` 契约。
2. 在写入或更改 URDF XML 之前，建立机器人的坐标系、关节、几何体、单位和假设清单，并将其作为注释块嵌入 `.urdf` 文件顶部。参见 `references/design-ledger.md`。
3. 严格使用 URDF 坐标系语义。关节原点、链接坐标系、关节轴以及 visual/collision/inertial 原点使用不同的参考坐标系。参见 `references/frame-semantics.md`。
4. 不要从含糊的描述中推断空间变换、网格单位、左右手性、轴或关节符号。应使用 CAD 变换、标注尺寸的图纸、测量值、现有源数据或明确记录的假设。
5. 绝不要凭手工填写作为计算结果的数值，例如惯性张量、质心、跨多个链接的单位换算和镜像变换。应通过计算获得：对基本体使用闭式公式，或使用一次性辅助脚本计算网格派生值。参见 `references/inertials.md`。
6. 对于物理链接，当目标使用者需要时，应分别建模 `inertial`、`visual` 和 `collision`。仅用于坐标系的链接可以有意省略质量和几何体。
7. 在报告完成之前，必须使用 `cadgen urdf validate` 验证每个创建或修改的 `.urdf`。参见 `references/validation.md`。
8. 允许并鼓励使用辅助脚本进行计算，但它们是脚手架，而不是制品的事实来源。对于复杂或真正参数化的模型，可以将模型专用的辅助脚本保存在相关源代码旁边（例如 STEP 生成器源文件），并在清单中注明；这是可选的，签入的 `.urdf` 仍是规范文件。

## CAD Viewer 交接

完成会创建或修改 `.urdf` 的 URDF 工作后，如果已安装该 skill，必须始终将明确的文件路径交给 `$cad-viewer`。如果 `$cad-viewer` 尚未运行，它必须启动 CAD Viewer，并返回相关创建或更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，应报告该情况，不得静默省略交接。

## 工作流

1. 确定目标 `.urdf` 文件及其使用者：RViz、robot_state_publisher、Gazebo/Ignition、MoveIt、真实机器人驱动程序或其他模拟器。
2. 在编辑 frame、origin、axis、mesh scale、limits 或 inertials 之前，先阅读或创建设计台账。将台账作为注释块保留在 `.urdf` 本身中。
3. 如果 link 引用了网格，先准备网格资源：每个 link 使用一个网格，并由所属 CAD/网格工作流以该 link 的 frame 导出。参见 `references/meshes.md`。
4. 直接编写或编辑 URDF XML，并遵循 `references/authoring-contract.md` 中关于结构、排序和命名的规定。
5. 计算惯性参数和其他派生数值，绝不要猜测。参见 `references/inertials.md`。
6. 使用 `cadgen urdf validate` 进行验证；修复发现的问题并重复验证，直到验证通过。
7. 执行 `references/validation.md` 中的验证流程：在可用时先使用外部工具（`check_urdf`），然后检查每个关节并在查看器中进行审查。
8. 报告剩余假设、未经检查的空间数据以及验证缺口。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果系统中没有可直接使用的 `python`，则替换为 `python3`、项目虚拟环境中的解释器或已配置的解释器路径。验证器仅使用 Python 标准库。

验证器的形式如下：

```bash
cadgen urdf validate path/to/robot.urdf
cadgen urdf validate path/to/robot.urdf --strict
cadgen urdf validate path/to/robot.urdf --json
cadgen urdf validate path/to/robot.urdf --packages robot_description=/path/to/pkg
cadgen urdf snapshot path/to/robot.urdf review.png
```

验证器会在一次运行中收集所有发现的问题（严重性、代码、XML 路径），涵盖 XML 结构、树拓扑、关节语义（limits、mimic、dynamics）、几何体、网格引用、材质、惯性物理属性以及拼写错误的元素，并打印摘要。一次运行只验证一个文件：`--strict` 会将警告视为失败；`--json` 会输出机器可读的发现文档；`--packages NAME=PATH` 会解析 `package://` 网格 URI，并针对多个根路径重复执行。目标文件验证失败时，命令以非零状态退出。相对目标路径以当前工作目录为基准解析；请在拥有这些文件的工作区中运行。

验证是防护措施，而不是空间正确性的证明：URDF 即使通过所有结构检查，也可能将关节放置在错误的位置。设计台账和查看器检查流程正是为此而存在。

## 快照工具

`cadgen urdf snapshot` 使用所有渲染类 skill 共用的 CLI 和无头浏览器运行时，将机器人渲染为 PNG 静态图，因此快照与 CAD Viewer 显示的内容一致。

```bash
cadgen urdf snapshot path/to/robot.urdf review.png
```

它只接受 `.urdf` 文件。使用 `--joint-values` 设置机器人的姿态，格式为 `{joint: degrees}` JSON；未指定的关节保持静止姿态（数据包中的 `"jointValues"` 作业字段含义相同）。机器人以米为单位编写，并会根据机器人场景的比例自动调整取景。

主题设置统一位于 `--theme` 下，与查看器的 Theme 选项卡保持一致。默认主题是 `snapshot`，即 Workbench Light，并移除了地面网格、原点轴和阴影，因为在静态图像中它们会被看作几何体。此处没有 `--display`：显示设置（模式、裁剪、爆炸视图、边线）属于 CAD 拓扑设置，而机器人不包含这些设置。

链接网格是相对于描述文件解析的，因此必须存在：未 hydration 的 Git LFS 指针会失败，并显示“No link mesh loaded for robot”。请先运行
`git lfs checkout <mesh dir>`。

语法为 `cadgen urdf snapshot TARGET [OUT] [flags]`，所有格式入口都使用相同的语法。使用 `cadgen urdf snapshot --help` 查看当前完整接口；机器人无法执行的 flags 不会出现在其中，而不是被拒绝。

## 参考资料

- 编写约定（结构、顺序、标准骨架）：`references/authoring-contract.md`
- 设计记录：`references/design-ledger.md`
- 坐标系语义：`references/frame-semantics.md`
- 网格准备与引用：`references/meshes.md`
- 惯性参数（公式、脚本、合理性检查）：`references/inertials.md`
- URDF 编辑工作流：`references/urdf-workflow.md`
- 验证与核验流程：`references/validation.md`