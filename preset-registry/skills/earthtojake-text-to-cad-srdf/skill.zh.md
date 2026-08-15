---
name: srdf
description: MoveIt2 SRDF authoring, validation, and planning-semantics workflow. Use when creating, editing, inspecting, or validating `.srdf` files, MoveIt planning groups, virtual joints, passive joints, end effectors, group states, disabled collisions, URDF-paired planning semantics, or SRDF handoff for live review. Use the URDF skill for robot structure, the SDF skill for simulator descriptions, and the cad-viewer skill for rendering, live review links, and optional MoveIt2 controls.
---
# SRDF

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请将已安装的本地技能文件作为运行时的事实来源；仓库链接仅用于追溯来源和版本审查。

此技能用于在现有有效 URDF 的基础上创建 MoveIt 语义机器人描述。SRDF 定义规划语义；它不定义机器人的物理结构。`.srdf` 文件是事实来源：直接编写和编辑 XML。不存在 `gen_srdf()` 契约。

SRDF 的正确性是一个**规划语义**问题。常见的失败并非 XML 无效，而是看似合理的 SRDF 为 MoveIt 提供了错误的规划组、错误的工具链接、错误的默认状态、不安全的禁用碰撞矩阵或错误的关节单位。由于语言模型不擅长空间和运动学推理，应根据 URDF 拓扑、MoveIt Setup Assistant 输出、采样碰撞分析或明确的用户数据来确定规划组、末端执行器、组状态和禁用碰撞。不要仅根据视觉主题推断这些内容——也不要凭记忆输入任何链接或关节名称：应先提取 URDF 的链接/关节表，再从中复制名称。

## 格式边界

- **URDF** 负责机器人的物理结构：链接、关节、几何体、惯性属性、限制、模仿关节、传动装置和机器人状态发布。
- **SRDF** 负责 MoveIt 语义：虚拟关节、被动关节、规划组、组状态、末端执行器和禁用碰撞对。
- **SDF** 负责仿真器/世界语义：物理、传感器、灯光、插件、世界和仿真专用元数据。

不要在 SRDF 中放置几何体、惯性属性、关节原点、链接位姿、网格引用、物理关节限制、传动装置或 `ros2_control` 接口。

## CAD Viewer 交接

完成创建或修改 `.srdf` 的 SRDF 工作后，如果已安装 `$cad-viewer`，则必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回相关已创建或已更新文件的链接；仅当用户需要交互式 IK 或路径规划审查时，才在交接中加入可选的 MoveIt2 控件。如果 `$cad-viewer` 不可用或启动失败，应报告这一情况，而不是悄无声息地省略交接。

## 必需工作流程

1. **从有效的 URDF 开始。** 首先使用 `$urdf` 编写或修复 URDF，并对其进行验证。SRDF 通过同目录存放和机器人名称与该 URDF 配对，SRDF 中的每个名称都必须存在于 URDF 中。
2. **提取 URDF 表。** 在编写任何 SRDF XML 之前，列出 URDF 的机器人名称、链接和关节（包括类型、父级、子级、限制、模仿标志）。只能从此表中复制名称；切勿凭记忆输入。请参阅 `references/srdf-workflow.md`。
3. **确定规划任务。** 记录目标是机械臂 IK、夹爪控制、移动底盘规划、双臂规划、工具使用还是本地冒烟测试。
4. **创建或更新规划台账。** 在编写 XML 之前使用 `references/planning-ledger.md`；在 `.srdf` 中以注释块形式保留一份精简副本。
5. **通过同目录存放与 URDF 配对。** 将 `.srdf` 保存在其 `.urdf` 所在的同一文件夹中，并使用相同的 `<robot name>`——这是唯一的关联机制。验证器、查看器和 MoveIt2 服务器都会扫描该文件夹，查找机器人名称匹配的 URDF 来解析配对；每个文件夹中，每个机器人名称必须恰好对应一个 URDF。没有任何元数据元素用于关联这些文件。请参阅 `references/authoring-contract.md`。
6. **审慎定义虚拟关节和被动关节。** 根据机器人模型的需要使用它们。
7. **根据 URDF 拓扑定义规划组。** 对于串联机械臂，当基座/末端在 URDF 树中形成真实的父级到子级路径时，优先使用链组（验证器会对此进行验证）。仅在经过审慎考虑时使用关节/链接/子组定义。
8. **在明确组成员关系后定义末端执行器。** 避免末端执行器组与其父组重叠。记录实际的目标/TCP 链接。
9. **使用 URDF 原生单位定义组状态。** 旋转关节和连续关节的值使用弧度；移动关节的值使用米。不要在 SRDF 中存储角度值。值必须位于 URDF 限制范围内，并且不得设置固定关节或模仿关节。
10. **根据证据生成禁用碰撞。** 使用从 URDF 关节表推导出的邻接关系、MoveIt Setup Assistant 采样结果或用户明确提供的碰撞矩阵。不要凭空创建大范围的禁用列表。请参阅 `references/disabled-collisions.md`。
11. **使用 `scripts/validate` 验证每个已创建或已修改的 `.srdf`**；它会针对配对的 URDF 交叉验证所有名称、链、状态和碰撞对。修复发现的问题并重新验证，直至全部通过。
12. **在条件允许时运行 MoveIt 冒烟测试。** 直接使用 MoveIt Setup Assistant 或项目的 MoveIt 启动配置。
13. **报告假设和跳过的检查。** 包括未完成的验证、缺失的 MoveIt 环境、通过人工推理确定的禁用碰撞，以及推断出的目标链接。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果无法使用裸命令 `python`，请替换为 `python3`、项目虚拟环境中的解释器或已配置的解释器路径。验证器仅使用 Python 标准库。

在此技能目录中，验证器的调用形式如下：

```bash
python scripts/validate path/to/robot.srdf
python scripts/validate path/to/a.srdf path/to/b.srdf
python scripts/validate path/to/robot.srdf --strict
python scripts/validate path/to/robot.srdf --format json
```

验证器会在一次运行中收集所有发现项（严重级别、代码、XML 路径）。它会解析 SRDF，解析与之配对的 URDF（位于同一文件夹中且机器人名称匹配的 `.urdf`；没有或存在多个均为错误），并交叉验证：组/关节/连杆/子组名称是否存在、链路径是否可解析、子组循环、虚拟/被动关节、末端执行器拓扑、组状态的成员关系/限位/完整性、禁用碰撞对（包括 Adjacent 原因的真实性），以及拼写错误的元素。`--strict` 会将警告视为失败；`--format json` 会输出机器可读的发现项文档。任何目标验证失败时，它都会以非零状态退出。相对目标路径从当前工作目录解析。

## 硬性规则

- SRDF 与其 URDF 位于同一文件夹中，并具有相同的 `<robot name>`；这种同目录加名称匹配是唯一的配对机制，并且文件夹中每个机器人名称必须恰好对应一个 URDF。
- 每个连杆、关节、组和子组的名称都必须来自 URDF 表或同一文件中定义的组。
- 组状态使用 URDF 原生单位：旋转/连续关节使用弧度，移动关节使用米。
- 禁用碰撞对需要真实的原因和来源依据。
- 末端执行器组不应与其父规划组共享连杆。
- `$cad-viewer` 负责提供可选的本地 `moveit2_server` 指引，以进行交互式规划审查。
- 可视化渲染审查很有用，但无法证明规划的正确性。

## 快照工具

`scripts/snapshot` 可将机器人渲染为 PNG 静态图或环绕 GIF，并使用所有渲染技能共用的相同
CLI 和无头浏览器运行时，因此快照与
CAD Viewer 中显示的内容一致。

```bash
python scripts/snapshot --input path/to/robot.srdf --output review.png
python scripts/snapshot --input path/to/robot.srdf --output turntable.gif --mode orbit
```

它仅接受 `.srdf`。请使用任务字段 `"jointValues"`（从关节名称映射到
角度值，默认使用静止姿态）而非 `--params` 来设置机器人姿态，后者仅适用于 STEP；机器人
以米为单位创建，并会根据机器人场景比例自动取景。

主题设置统一位于一个 `--theme` 下，与查看器的 Theme 选项卡对应。默认
主题为 `snapshot`——即移除了地面网格、原点坐标轴和阴影的 Workbench Light，
因为在静态图像中，这些元素看起来会像几何体。不存在 `--display`：显示
设置（模式、裁剪、爆炸、边线）属于 CAD 拓扑设置，而机器人不携带任何此类设置。

连杆网格相对于描述文件进行解析，因此这些网格必须存在：未水合的 Git LFS 指针会导致失败，并显示“No link mesh loaded for robot”。请先运行
`git lfs checkout <mesh dir>`。

使用 `python scripts/snapshot --help` 查看当前完整的命令接口。

## 参考资料

- 编写约定（结构、URDF 配对、黄金骨架）：`references/authoring-contract.md`
- SRDF 工作流（URDF 表格提取、编辑循环）：`references/srdf-workflow.md`
- 规划台账：`references/planning-ledger.md`
- 验证与核验流程：`references/validation.md`
- 末端执行器：`references/end-effectors.md`
- 已禁用的碰撞：`references/disabled-collisions.md`

对于本地 MoveIt2 控制，请使用 `$cad-viewer`；在该技能中，阅读 `references/moveit2-server.md`。