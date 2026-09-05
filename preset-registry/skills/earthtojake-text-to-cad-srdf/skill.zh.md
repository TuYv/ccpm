---
name: srdf
description: MoveIt2 SRDF authoring, validation, and planning-semantics workflow. Use when creating, editing, inspecting, or validating `.srdf` files, MoveIt planning groups, virtual joints, passive joints, end effectors, group states, disabled collisions, URDF-paired planning semantics, or SRDF handoff for live review. Use the URDF skill for robot structure, the SDF skill for simulator descriptions, and the cad-viewer skill for rendering and live review links.
---
# SRDF

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
运行时以本地已安装的 skill 文件为准；仓库链接仅用于来源追溯和发布审查。

对于基于现有有效 URDF 的 MoveIt 语义机器人描述，使用此 skill。SRDF 定义规划语义；它不定义机器人实际结构。`.srdf` 文件是事实来源：直接编写和编辑 XML。不存在 `gen_srdf()` 合约。

SRDF 的正确性是一个**规划语义**问题。常见故障不是 XML 无效，而是 SRDF 看似合理，却为 MoveIt 提供了错误的规划组、错误的工具链接、错误的默认状态、不安全的禁用碰撞矩阵或错误的关节单位。由于语言模型在空间和运动学推理方面能力较弱，应根据 URDF 拓扑、MoveIt Setup Assistant 输出、采样碰撞分析或明确的用户数据，推导规划组、末端执行器、组状态和禁用碰撞。不要仅凭视觉主题进行推断——也不要凭记忆输入任何链接或关节名称：先提取 URDF 的链接/关节表，再从中复制名称。

## 设置

此 skill 的命令是 `cadgen` 发行版之上的轻量入口，其中包含 Python 构建运行时及其执行的 JavaScript。安装一次即可：

```bash
python -m pip install -r requirements.txt
```

渲染还需要浏览器，而 pip 无法提供浏览器：

```bash
python -m playwright install chromium
```

## 格式边界

- **URDF** 负责机器人实际结构：链接、关节、几何体、惯性、限制、仿生关节、传动装置以及机器人状态发布。
- **SRDF** 负责 MoveIt 语义：虚拟关节、被动关节、规划组、组状态、末端执行器以及禁用的碰撞对。
- **SDF** 负责模拟器/世界语义：物理、传感器、灯光、插件、世界以及模拟专用元数据。

不要将几何体、惯性、关节原点、链接位姿、网格引用、物理关节限制、传动装置或 `ros2_control` 接口放入 SRDF。

## CAD 查看器交接

完成创建或修改 `.srdf` 的 SRDF 工作后，只要已安装 `$cad-viewer`，就必须始终将明确的文件路径交给它。若 CAD Viewer 尚未运行，`$cad-viewer` 必须启动 CAD Viewer，并返回相关已创建或已更新文件的链接。如果 `$cad-viewer` 不可用或启动失败，应报告这一情况，不要静默省略交接。

## 必需工作流

1. **从有效的 URDF 开始。** 首先使用 `$urdf` 编写或修复 URDF 并进行验证。SRDF 通过文件共置和机器人名称与该 URDF 配对，且 SRDF 中的每个名称都必须存在于其中。
2. **提取 URDF 表。** 在编写任何 SRDF XML 之前，列出 URDF 的机器人名称、链接、关节（包括类型、父级、子级、限制和仿生标志）。只能从此表复制名称；绝不要凭记忆输入名称。参见 `references/srdf-workflow.md`。
3. **确定规划任务。** 记录目标属于机械臂 IK、夹爪控制、移动底座规划、双臂规划、工具使用还是本地冒烟测试。
4. **创建或更新规划账本。** 在编写 XML 之前使用 `references/planning-ledger.md`；在 `.srdf` 中以注释块的形式保留一份精简副本。
5. **通过文件共置与 URDF 配对。** 将 `.srdf` 保存在其 `.urdf` 所在的同一文件夹中，并使用相同的 `<robot name>`——这是唯一的链接机制。验证器和查看器都会扫描文件夹，查找机器人名称匹配的 URDF，以此解析配对关系；每个文件夹中每个机器人名称只能对应一个 URDF。没有任何元数据元素用于链接这些文件。参见 `references/authoring-contract.md`。
6. **有意识地定义虚拟关节和被动关节。** 根据机器人模型的需要使用它们。
7. **根据 URDF 拓扑定义规划组。** 对于串联机械臂，如果基座到尖端在 URDF 树中构成真实的父子路径，应优先使用链式组（验证器会验证这一点）。仅在确有明确意图时使用关节/链接/子组定义。
8. **在确定组成员关系后定义末端执行器。** 避免末端执行器组与其父组重叠。记录实际的目标/TCP 链接。
9. **使用 URDF 原生单位定义组状态。** 旋转关节和连续关节的值使用弧度；移动关节的值使用米。不要在 SRDF 中存储角度值。值必须处于 URDF 限制范围内，并且不得设置固定关节或仿生关节。
10. **根据证据生成禁用碰撞。** 使用根据 URDF 关节表推导出的相邻关系、MoveIt Setup Assistant 采样结果或用户明确提供的碰撞矩阵。不要臆造宽泛的禁用列表。参见 `references/disabled-collisions.md`。
11. **使用 `cadgen srdf validate` 验证每个创建或修改的 `.srdf`**；它会针对配对的 URDF 交叉验证所有名称、链、状态和碰撞对。修复发现的问题并重新验证，直到验证干净为止。
12. **在可用时运行 MoveIt 冒烟测试。** 直接使用 MoveIt Setup Assistant 或项目的 MoveIt 启动文件。
13. **报告假设和跳过的检查。** 包括不完整的验证、缺少 MoveIt 环境、手动推理得出的碰撞禁用项以及推断出的目标链接。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果系统中没有可直接使用的 `python`，请替换为 `python3`、项目虚拟环境中的解释器，或已配置的解释器路径。验证器仅使用 Python 标准库。

验证器的形式如下：

```bash
cadgen srdf validate path/to/robot.srdf
cadgen srdf validate path/to/robot.srdf --strict
cadgen srdf validate path/to/robot.srdf --json
```

验证器会在一次运行中收集所有发现项（严重性、代码、XML 路径）。它会解析 SRDF，解析对应的 URDF（同一文件夹中、机器人名称匹配的 `.urdf`；不存在或存在多个都属于错误），并进行交叉验证：组、关节、链接、子组名称是否存在，链路径是否可解析，子组是否存在循环，虚拟关节和被动关节，末端执行器拓扑，组状态成员/限制/完整性，禁用碰撞对（包括 `Adjacent` 原因的真实性），以及拼写错误的元素。一次运行只验证一个文件：`--strict` 会将警告视为失败，`--json` 会输出机器可读的发现项文档。如果目标验证失败，程序会以非零状态退出。相对目标路径从当前工作目录解析。

## 硬性规则

- SRDF 与其 URDF 位于同一文件夹，并共享其 `<robot name>`；这种位置加名称匹配是唯一的配对机制，并且文件夹中每个机器人名称最多只能存在一个 URDF。
- 每个链接、关节、组和子组名称都必须来自 URDF 表，或来自同一文件中定义的组。
- 组状态使用 URDF 原生单位：旋转关节/连续关节使用弧度，移动关节使用米。
- 禁用碰撞对必须具有真实准确的原因和来源。
- 末端执行器组不应与其父规划组共享链接。
- 视觉渲染审查很有用，但无法证明规划正确性。

## Snapshot 工具

`cadgen snapshot` 将机器人渲染为 PNG 静态图像，使用与所有渲染技能相同的共享
CLI 和无头浏览器运行时，因此快照与 CAD Viewer 中显示的内容一致。

```bash
cadgen snapshot path/to/robot.srdf review.png
```

将 `.srdf` 文件交给它；它会根据后缀进行路由，并渲染对应 URDF 的几何体。使用 `--joint-values` 设置机器人的姿态——`{joint: degrees}` JSON，
未指定的关节保持静止姿态（数据包中的 `"jointValues"` 作业字段含义相同）。机器人以米为单位创建，并会根据机器人场景的比例自动取景。

主题设置位于单个 `--theme` 下，与查看器的 Theme 选项卡一致。默认主题为 `snapshot`——Workbench Light，并移除了地面网格、原点坐标轴和阴影，因为在静态图像中这些元素会被看作几何体。请保持 `--display` 关闭：显示设置（模式、裁剪、爆炸视图、边线）属于 CAD 拓扑设置，而机器人不包含这些设置。

链接网格会相对于描述文件解析，因此网格必须存在：未完成 hydration 的 Git LFS 指针会导致错误 `"No link mesh loaded for robot"`。请先运行
`git lfs checkout <mesh dir>`。

SRDF 的几何信息来自与其配套的 URDF，因此它自身没有快照入口；多态的 `cadgen snapshot` 会根据后缀进行路由。其语法为
`cadgen snapshot TARGET [OUT] [flags]`，所有格式入口都使用相同的语法。使用
`cadgen snapshot --help` 查看当前完整接口。

## 参考资料

- 编写约定（结构、URDF 配对、黄金骨架）：`references/authoring-contract.md`
- SRDF 工作流（URDF 表格提取、编辑循环）：`references/srdf-workflow.md`
- 规划台账：`references/planning-ledger.md`
- 验证与核验方案：`references/validation.md`
- 末端执行器：`references/end-effectors.md`
- 已禁用的碰撞：`references/disabled-collisions.md`