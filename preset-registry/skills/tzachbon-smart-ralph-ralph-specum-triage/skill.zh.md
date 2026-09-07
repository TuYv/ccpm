---
name: ralph-specum-triage
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-triage`, or explicitly asks Ralph Specum in Codex to triage a large effort into multiple specs.
metadata:
  surface: helper
  action: triage
---
# Ralph Specum 分诊

你是一名**协调者，而非分诊分析师**——将分解工作委托给 `triage-analyst` 子代理。

## 契约

- Epic 数据存放在 `specs/_epics/<epic-name>/` 之下
- 在 `specs/.current-epic` 中跟踪活跃的 epic
- 不要对含义模糊的 epic 或 spec 名称进行猜测
- 分诊产出面向多个 spec 的计划，但不实现它们

## 操作

1. 在路由之前，解析精确的 `--quick` 和精确的 `--interactive` 标记。拒绝二者同时出现、`-q`、各种变体以及自然语言替代形式。
2. 检查 `specs/.current-epic`。如果存在活跃 epic，则加载其 `.epic-state.json` 作为 `STATE`，并在任何可能的提问之前先规范化模式。使用精确 `--quick` 时，不加提示地恢复匹配的活跃 epic；显式指定的不同 epic 必须包含其目标。在交互模式下，总结状态，并提供恢复、查看详情或新建 epic 的选项。
3. 在构造任何路径之前，将解析出的 epic 名称与 `^[a-z0-9]+(-[a-z0-9]+)*$` 进行校验。拒绝无效名称。如果 `specs/_epics/<epic-name>/.epic-state.json` 已存在，则复用并恢复它，不替换状态或进度。如果目录存在但没有有效的状态，则停止并要求换用其他名称，或进行经用户显式授权的重置。只有不存在的目录才可以被初始化。
4. 只解析或创建 epic 目录、`.progress.md` 和 `.epic-state.json`。通过 JSON 编码器（如 `jq --arg`）序列化名称和目标。对每个 phase 为 `triage` 的阶段门控命令，都将 `.epic-state.json` 用作 `STATE`。对每个写入器，都将 `.epic-state.json` 用作 `STATE`。此后不再要求 `.ralph-state.json`。在获得批准之前，不创建任何 `research.md`、`epic.md` 或生成的 `plan.md`。
5. 对于新 epic，使用解析出的精确模式标志运行 `scripts/phase_gate.py mode STATE`，然后在技能发现之前注册 `specs/.current-epic`。精确 quick 模式不提出任何设置问题；缺少必需的名称或目标即为输入错误。
6. 根据显式输入和配置解析输出目的地。在精确 quick 模式下，以本地 Spec 文件作为确定性默认值，不提出任何问题。仅当目的地仍不明确时，交互模式才可以提出一个关于目的地的管理性问题；该回答永远不满足访谈门控。
7. 确保针对 epic 目标存在技能发现 pass 1。收集插件、项目 `.agents/skills`、项目 `.claude/skills` 以及当前 harness catalog 条目。选择被显式命名的技能，并记录被遮蔽的重复项。
8. 在交互模式和 quick 模式下，都加载 `skills/interview-framework-codex/SKILL.md`、其必需的算法与领域建模参考，以及每一个已选定的领域契约。在交互模式下，针对关键分解边界、稳定的跨 spec 契约、依赖选择和排序风险，遵循该算法。不提出任何关于存储、命名、分支或可自行发现内容的问题。
9. 在交互模式下，要求显式的 `approve and delegate`；在精确 quick 模式下，记录 `bypassed_quick`。在两种模式下，对每个产出制品的子代理，都以 phase `triage` 和当前已加载 manifest 的身份运行 `phase_gate.py check-delegation`。在每个分诊制品写入器之前，应用共享的硬转换不变式。任一模式下 `check-delegation` 失败，都会在阶段转换、子代理派发或目标制品写入之前停止本次调用；在普通模式失败后，只有下一次显式调用才会创建全新的 manifest/访谈身份。在精确 `--quick` 委托失败后，下一次显式调用会重新运行发现流程，记录新的 `phaseSkillLoad` 与访谈身份，并且不复用已终结的 `bypassed_quick` 访谈或其发现修订版本。只有匹配且处于进行中状态的 `collecting` 或 `awaiting_confirmation` 访谈才可以恢复。精确 `--quick` 保留其现有的提问与批准旁路，以及发现、manifest、委托和写入器检查。
10. 只读探索子代理可以检查接缝、约束和既有边界，但不写入任何 epic 制品。
11. 保持既有的 epic-state、只读探索和多写入器流程，以及每个子代理的数据包、身份元组和回执行为不变。按需使用相互独立的唯一门控写入器派发：
   - 一个负责 `research.md` 的分诊研究写入器
   - 一个负责 `epic.md` 和生成的 spec `plan.md` 文件的分诊计划写入器
   - 一个负责每次制品评审修订的全新修订写入器
   将门控辅助程序的绝对路径、epic 状态路径、身份元组、唯一的队友派发身份以及原样的 `phaseSkillLoad` manifest 传递给每个写入器。每个写入器都记录其 manifest 加载，并在首次写入文件系统制品之前以其唯一身份通过 `check-agent-write`。
12. 协调者不组装、格式化或修订制品内容。校验门控写入器的输出，并将每个 spec 及其状态、依赖项和门控回执持久化到 `.epic-state.json` 中。
13. 保持 `specs/.current-epic` 设置为活跃 epic 的名称。
14. 展示下一个未被阻塞的 spec，并路由回 `$ralph-specum-start` 以逐个执行各 spec。

## 输出形态

结果应当清楚表明：
- 每个 spec 中包含什么
- 哪些 spec 现在即可开始
- 哪些 spec 因依赖而被阻塞
- 哪些契约必须在各 spec 之间保持稳定

## 停止行为

- **不带 `--quick` 时**：在此停止。显示 epic 摘要和批准提示。在用户显式批准或要求修改之前，不要继续进入下一个 spec。
- **带精确 `--quick` 时**：记录 quick 旁路，并直接继续到第一个未被阻塞的 spec。

## 响应交接

- 写入 `epic.md` 之后，指明 `epic.md` 并简要总结 epic 计划。
- 当规范化后的 `quickMode` 为 false 时，以恰好一个显式的选择提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to the next spec`
- 将 `continue to the next spec` 视为对 `epic.md` 的批准。
- 使用精确 `--quick` 时，不显示此提示；在各门控成功后直接继续到第一个未被阻塞的 spec。
- 在制品评审期间，`apply the changes` 会立即将已记录的反馈交由一个全新的唯一门控修订写入器处理，重新显示制品，并停留在该批准门控处。仅在没有待处理反馈时，才提出一个聚焦的变更问题。仅作为控制性用语的 `continue`、`proceed` 和 `go ahead` 不批准任何内容。
