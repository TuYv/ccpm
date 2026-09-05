---
name: sdf
description: SDFormat/SDF model and world authoring, validation, and simulator handoff. Use for `.sdf` files, SDFormat XML, models, worlds, links, joints, poses, frames, inertials, visual/collision geometry, mesh URIs, sensors, lights, physics, plugins, includes, Gazebo, static SDF review, or simulator-specific metadata. Do not use for signed-distance-field geometry.
---
# SDF

来源：维护于 [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)。
使用已安装的本地 skill 文件作为运行时事实来源；
repository 链接仅用于来源追溯和发布审查。

当交付物是 SDFormat 文档时使用此 skill。SDFormat 描述模拟器和世界行为：模型、世界、坐标系、位姿、链接、关节、惯性参数、视觉、碰撞、传感器、灯光、物理、插件、包含项以及模拟器元数据。

此 skill 用于 **SDFormat**，而不是有符号距离场几何体。

`.sdf` 文件是事实来源：直接编写和编辑 XML。不存在 `gen_sdf()` 合约。

## 设置

此 skill 的命令是对 `cadgen` distribution 的薄封装，后者包含 Python 构建运行时及其执行的 JavaScript。安装一次即可：

```bash
python -m pip install -r requirements.txt
```

渲染还需要浏览器，而 pip 无法提供浏览器：

```bash
python -m playwright install chromium
```

## 核心规则

1. 直接编写 `.sdf` XML，并在报告完成之前，使用 `cadgen sdf validate` 验证每个新建或修改的文件。
2. 在编辑之前确定目标使用者：Gazebo/libsdformat 版本、其他模拟器、仅用于可视化的工具、模型包，还是世界交接。
3. 确定文档类型：模型级 SDF、世界级 SDF，或模型嵌入世界。对于可复用的机器人/对象导出，优先使用模型级 SDF。
4. 使用 SI 单位，除非目标明确要求其他单位：米、千克、秒、弧度。
5. 对于新输出，优先使用 `version="1.12"`，除非目标使用者对版本有约束。
6. 在编写位姿、坐标系、关节轴、网格缩放、惯性参数、传感器或插件之前，先建立设计记录，并将其作为注释块保留在 `.sdf` 顶部。使用 `references/design-ledger.md` 和 `references/llm-guardrails.md`。
7. 为每个非平凡位姿和轴显式写出 `relative_to` / `expressed_in`。隐式坐标系默认值是 SDF 最常见的失败原因。参见 `references/frame-semantics.md`。
8. 不要仅凭视觉印象推断空间变换。应根据上游源数据、图纸、模拟器文档、测量值或明确的假设推导位姿、轴、缩放、质量、惯性和坐标系名称。绝不要手写计算所得的数值，应使用公式或一次性辅助脚本（惯性张量、单位换算）。
9. 当机器人已经拥有 URDF 时，应从 URDF 推导 SDF，而不是重新编写几何体；参见 `references/interoperability.md`。
10. 在编辑引用这些资源的 SDF 之前，应通过其所属工作流重新生成上游几何体、网格、机器人描述、渲染、拓扑或包资源。
11. 编写完成后，运行可用的检查：内置验证、可选的 `gz sdf --check`、模拟器加载、关节运动以及插件/传感器启动。
12. 报告假设、跳过的检查、未解决的资源路径以及特定目标的兼容性风险。

## 范围

将此 skill 用于 SDFormat 输出。不要将其用于有符号距离场建模、原始几何体生成、规划语义，或掩盖不正确的上游机器人/源数据，除非任务明确仅限于模拟器。

## CAD Viewer 交接

完成会创建或修改 `.sdf` 的 SDF 工作后，只要安装了该技能，就必须始终将明确的文件路径交给 `$cad-viewer`。如果 `$cad-viewer` 尚未运行，它必须启动 CAD Viewer，并返回相关已创建或已更新文件的链接；如果 `$cad-viewer` 不可用或启动失败，必须报告该情况，而不能静默省略交接。

## 工作流

1. 定位目标 `.sdf` 及其使用者。
2. 读取或创建设计台账注释块。
3. 在编辑任何 `<pose>`、`<frame>`、关节轴、`relative_to`、`expressed_in`、嵌套作用域、传感器坐标系或插件坐标系之前，读取 `references/frame-semantics.md`。
4. 直接编写 XML，并遵循 `references/examples.md` 中的完整示例。
5. 使用 `cadgen sdf validate` 验证明确的目标文件；将捆绑验证视为防护措施，而不是模拟器证明。
6. 在可用时运行目标使用者的冒烟测试（`references/smoke-tests.md`）。
7. 将文件交给 `$cad-viewer`。静态渲染不会执行 SDF 插件，也不会读取文件中定义的运动元数据。
8. 报告已运行的检查、跳过的检查以及假设。

## 命令

使用项目或工作区的 Python 环境运行。将示例中的 `python` 视为解释器占位符；如果裸 `python` 不可用，则替换为 `python3`、项目虚拟环境解释器或已配置的解释器路径。验证器仅使用 Python 标准库。

```bash
cadgen sdf validate path/to/model.sdf
cadgen sdf validate path/to/model.sdf --strict
cadgen sdf validate path/to/model.sdf --json
cadgen sdf snapshot path/to/model.sdf review.png
```

验证器会检查文档结构、名称作用域、位姿/坐标系图、关节、几何体、网格 URI、惯性、传感器和插件，并打印其检查结果及摘要。一次运行只验证一个文件：`--strict` 会将警告视为失败，`--json` 会输出机器可读的检查结果文档。如果目标验证失败，程序将以非零状态退出。

可选的外部检查：

```bash
cadgen sdf validate path/to/model.sdf --gz-check auto
cadgen sdf validate path/to/model.sdf --gz-check required
cadgen sdf validate path/to/model.sdf --gz-check never
```

`gz sdf --check` 是可选的目标使用者验证。如果不可用，除非明确要求，否则应报告为已跳过。

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

`cadgen sdf snapshot` 将机器人渲染为 PNG 静态图，使用与每个渲染技能相同的共享 CLI 和无头浏览器运行时，因此快照与 CAD Viewer 显示的内容一致。

```bash
cadgen sdf snapshot path/to/robot.sdf review.png
```

它只接受 `.sdf`（一种格式入口，使用与其他入口相同的 `TARGET [OUT]` 语法）。使用 `--joint-values` 设置机器人的姿态——传入 `{joint: degrees}` JSON，
未指定的关节保持静止姿态（数据包中的 `"jointValues"` 作业字段含义相同）。机器人以米为单位编写，并会自动按照机器人场景的比例进行取景。

主题设置统一位于一个 `--theme` 下，与查看器的 Theme 选项卡保持一致。默认主题为 `snapshot`——Workbench Light，并移除地面网格、原点轴和阴影，因为在静态图像中这些元素会被看作几何体。没有 `--display`：显示设置（模式、裁剪、爆炸视图、边线）属于 CAD 拓扑设置，而机器人不包含这些设置。

链接网格会相对于描述文件解析，因此必须存在：未水合的 Git LFS 指针会失败，并显示 "No link mesh loaded for robot"。请先运行
`git lfs checkout <mesh dir>`。

语法为 `cadgen sdf snapshot TARGET [OUT] [flags]`，与每个格式入口使用的语法相同。使用 `cadgen sdf snapshot --help` 查看当前完整接口——机器人无法使用的标志不会出现在其中，而不是被它拒绝。

## 参考资料

- SDF 工作流：`references/sdf-workflow.md`
- 完整示例（黄金骨架）：`references/examples.md`
- LLM 防护规则：`references/llm-guardrails.md`
- 设计记录：`references/design-ledger.md`
- 坐标系语义：`references/frame-semantics.md`
- 验证范围：`references/validation.md`
- 冒烟测试：`references/smoke-tests.md`
- 互操作性说明（源自 URDF 的 SDF、网格、Gazebo）：`references/interoperability.md`