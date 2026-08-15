---
name: sdf
description: SDFormat/SDF model and world authoring, validation, and simulator handoff. Use for `.sdf` files, SDFormat XML, models, worlds, links, joints, poses, frames, inertials, visual/collision geometry, mesh URIs, sensors, lights, physics, plugins, includes, Gazebo, static SDF review, or simulator-specific metadata. Do not use for signed-distance-field geometry.
---
# SDF

来源：由 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) 维护。
请以已安装的本地技能文件作为运行时的事实来源；仓库链接仅用于来源追溯和发布审查。

当交付物为 SDFormat 文档时，请使用此技能。SDFormat 用于描述模拟器和世界的行为：模型、世界、坐标系、位姿、连杆、关节、惯性参数、视觉元素、碰撞体、传感器、灯光、物理系统、插件、包含项以及模拟器元数据。

此技能用于 **SDFormat**，而不是有符号距离场几何。

`.sdf` 文件是事实来源：直接编写和编辑 XML。不存在 `gen_sdf()` 约定。

## 核心规则

1. 直接编写 `.sdf` XML，并在报告完成之前使用 `scripts/validate` 验证每个创建或修改的文件。
2. 编辑前确定目标使用方：Gazebo/libsdformat 版本、其他模拟器、仅用于可视化的工具、模型包或世界交付。
3. 确定文档类型：模型级 SDF、世界级 SDF 或世界中的模型。对于可复用的机器人/对象导出，优先使用模型级 SDF。
4. 除非目标明确要求使用其他单位，否则使用 SI 单位：米、千克、秒、弧度。
5. 对于新输出，优先使用 `version="1.12"`，除非目标使用方对版本有限制。
6. 在编写位姿、坐标系、关节轴、网格缩放、惯性参数、传感器或插件之前，先建立设计台账，并将其作为注释块保留在 `.sdf` 顶部。使用 `references/design-ledger.md` 和 `references/llm-guardrails.md`。
7. 对每个非简单位姿和轴显式编写 `relative_to` / `expressed_in`。隐式坐标系默认值是 SDF 最常见的失败原因。请参阅 `references/frame-semantics.md`。
8. 不要仅根据视觉印象推断空间变换。应根据上游源数据、图纸、模拟器文档、测量值或明确的假设推导位姿、轴、缩放比例、质量、惯性和坐标系名称。切勿凭空手写计算结果——应使用公式或一次性辅助脚本（用于惯性张量、单位换算）。
9. 当机器人已有 URDF 时，应从中派生 SDF，而不是重新编写几何体；请参阅 `references/interoperability.md`。
10. 在编辑引用上游几何体、网格、机器人描述、渲染、拓扑或包资源的 SDF 之前，先使用这些资源所属的工作流重新生成它们。
11. 编写完成后，运行可用的检查：内置验证、可选的 `gz sdf --check`、模拟器加载、关节运动以及插件/传感器启动。
12. 报告所作假设、跳过的检查、尚未解决的资源路径以及特定于目标的兼容性风险。

## 适用范围

此技能用于 SDFormat 输出。不要将其用于有符号距离场建模、原始几何体生成、规划语义，也不要用它掩盖不正确的上游机器人/源数据，除非任务明确仅面向模拟器。

## CAD Viewer 交接

完成任何创建或修改 `.sdf` 的 SDF 工作后，如果已安装 `$cad-viewer`，则必须始终将明确的文件路径交给 `$cad-viewer`。如果 CAD Viewer 尚未运行，`$cad-viewer` 必须启动它，并返回相关已创建或已更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，则应报告这一情况，而不是悄然省略交接。

## 工作流程

1. 找到目标 `.sdf` 及其使用方。
2. 阅读或创建设计账本注释块。
3. 在编辑任何 `<pose>`、`<frame>`、关节轴、`relative_to`、`expressed_in`、嵌套作用域、传感器坐标系或插件坐标系之前，阅读 `references/frame-semantics.md`。
4. 参照 `references/examples.md` 中的完整示例直接编写 XML。
5. 使用 `scripts/validate` 验证明确指定的目标；将内置验证视为防护措施，而非模拟器验证依据。
6. 在可用时运行目标使用方的冒烟测试（`references/smoke-tests.md`）。
7. 将文件交给 `$cad-viewer`。静态渲染不会执行 SDF 插件，也不会读取文件中定义的运动元数据。
8. 报告已运行的检查、已跳过的检查以及所作假设。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果裸命令 `python` 不可用，请替换为 `python3`、项目虚拟环境解释器或已配置的解释器路径。验证器仅使用 Python 标准库。

```bash
python scripts/validate path/to/model.sdf
python scripts/validate path/to/a.sdf path/to/b.sdf
python scripts/validate path/to/model.sdf --strict
```

验证器会检查文档结构、名称作用域、位姿/坐标系图、关节、几何体、网格 URI、惯性属性、传感器和插件，并输出每个文件的检查结果及汇总。`--strict` 会将警告视为失败。如果任何目标验证失败，程序将以非零状态码退出。

可选的外部检查：

```bash
python scripts/validate path/to/model.sdf --gz-check auto
python scripts/validate path/to/model.sdf --gz-check required
python scripts/validate path/to/model.sdf --gz-check never
```

`gz sdf --check` 是可选的目标使用方验证。除非明确要求，否则在其不可用时应报告为已跳过。

## 必需的报告格式

完成 SDF 任务时，请包含一份简洁的报告：

```text
Validated: path/to/model.sdf
Checks run:
- bundled SDF validation: passed
- gz sdf --check: skipped, gz not installed
- simulator load: skipped, target simulator unavailable
- viewer handoff: `$cad-viewer` link returned
Assumptions:
- Assumed mesh units are meters.
- Assumed lidar frame is coincident with lidar_link.
Risks:
- Camera plugin filename was not verified in the target simulator environment.
```

## 快照工具

`scripts/snapshot` 使用所有渲染技能所共用的同一套 CLI 和无头浏览器运行时，将机器人渲染为 PNG 静态图或环绕 GIF，因此快照与 CAD Viewer 中显示的内容一致。

```bash
python scripts/snapshot --input path/to/robot.sdf --output review.png
python scripts/snapshot --input path/to/robot.sdf --output turntable.gif --mode orbit
```

它仅接受 `.sdf`。应通过任务字段 `"jointValues"`（从关节名称映射到角度值，默认使用静止位姿）设置机器人位姿，而不是使用仅适用于 STEP 的 `--params`；机器人以米为单位建模，并会自动按机器人场景比例进行取景。

主题设置统一位于 `--theme` 下，与查看器的 Theme 选项卡对应。默认主题为 `snapshot`，即移除了地面网格、原点坐标轴和阴影的 Workbench Light，因为在静态图像中，这些元素看起来会像几何体。不存在 `--display`：显示设置（模式、裁剪、爆炸视图、边线）属于 CAD 拓扑设置，而机器人不包含 CAD 拓扑。

连杆网格的解析路径相对于描述文件，因此这些网格必须存在：未水合的 Git LFS 指针会导致 `"No link mesh loaded for robot"` 错误。请先运行
`git lfs checkout <mesh dir>`。

使用 `python scripts/snapshot --help` 查看当前完整的命令接口。

## 参考资料

- SDF 工作流：`references/sdf-workflow.md`
- 完整示例（黄金骨架）：`references/examples.md`
- LLM 防护规则：`references/llm-guardrails.md`
- 设计台账：`references/design-ledger.md`
- 坐标系语义：`references/frame-semantics.md`
- 验证范围：`references/validation.md`
- 冒烟测试：`references/smoke-tests.md`
- 互操作性说明（从 URDF 派生的 SDF、网格、Gazebo）：`references/interoperability.md`