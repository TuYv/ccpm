---
name: ralph-specum-research
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-research`, or explicitly asks Ralph Specum in Codex to run the research phase.
metadata:
  surface: helper
  action: research
---
# Ralph Specum Research

你是一名**协调者，而非研究者** -- 将全部工作委派给 `research-analyst` 子代理。

从本已加载的技能中派生 `RALPH_CODEX_PLUGIN_ROOT`，方法是从 `SKILL.md` 所在目录向上解析两级父目录。绝不要从项目工作目录派生它。

## 契约

- 通过显式路径、精确名称或 `.current-spec` 解析当前活跃的 spec
- 当存在 `.claude/ralph-specum.local.md` 时予以尊重
- 默认的 specs 根目录是 `./specs`
- 保持 Ralph 的规范文件名
- 仅合并状态字段

## 行动

1. 解析当前活跃的 spec。如果不存在，则停止并告知用户先启动一个 spec。
2. 读取目标、`.progress.md`、当前状态、已建立索引的代码库上下文、相关 spec，以及 epic 上下文（若存在）。
3. 通过 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/phase_gate.py"` 运行 `phase_gate.py mode`，附带 `STATE`，并使用精确的 `--quick`、精确的 `--interactive`，或不带任何标志。拒绝同时传两者、`-q`、其他变体以及自然语言形式的替代。
4. 当状态缺少可用的修订时，运行第一轮技能发现。选择被明确命名的技能，并记录被 harness 遮蔽的重复项。
5. 在交互模式和快速模式下，都加载 `"$RALPH_CODEX_PLUGIN_ROOT/skills/interview-framework-codex/SKILL.md"`、其必需的算法与领域建模参考，以及所有已选定的领域契约。在交互模式下，使用其聚焦式头脑风暴方法来处理关键证据范围、决策阈值和重大未知项。检查源码可用性、代码事实和既有模式，而不是提问。
6. 在交互模式下，要求显式的 `approve and delegate`；在精确快速模式下，记录 `bypassed_quick`。在两种模式下，创建子代理之前，都要以当前已加载的 manifest 的标识运行 `phase_gate.py check-delegation`。在派发研究写入者之前，应用共享的硬转换不变式。任一模式下 `check-delegation` 失败，都会在阶段转换、子代理派发或目标产物写入之前终止本次调用；在正常模式下失败后，只有下一次显式调用才会创建全新的 manifest/interview 身份。在精确 `--quick` 委派失败后，下一次显式调用会重新运行发现，记录全新的 `phaseSkillLoad` 和 interview 身份，并且不复用已终态为 `bypassed_quick` 的 interview 或其发现修订。只有处于进行中且匹配的 `collecting` 或 `awaiting_confirmation` interview 才可恢复。精确 `--quick` 保留其既有的问题与审批旁路，以及发现、manifest、委派和写入者检查。
7. 将研究生成**委派**给 `research-analyst` 子代理。保持既有的子代理数据包、身份元组和回执行为不变：传入 gate 助手的绝对路径、状态路径、完整身份元组、唯一的队友派发身份、逐字不变的技能 manifest、目标、上下文和 interview 结果。子代理重新加载并记录 manifest，以该唯一身份通过 `check-agent-write`，并写入 `research.md`。不要亲自写 research.md。
8. 读取子代理的输出并验证其存在。
9. 合并状态，附带 `phase: "research"` 和 `awaitingApproval: true`（或在精确 `--quick` 生效时为 `false`）。
10. 更新 `.progress.md`，写入研究摘要、阻塞项、经验教训、下一步、技能发现，以及（在相关时）验证工具方面的笔记。
11. 如果启用了 spec 提交，则只提交 spec 产物。
12. 在正常模式下，当用户选择 `continue to prototype` 时，将 `research.md` 视为已批准，并使用同一解析出的基础路径路由到 `$ralph-specum-prototype --suggested --return-phase requirements`。让该技能自行负责原型行为及其返回交接。

### 停止行为

- **不带 `--quick`**：停止于此。展示走查摘要和审批提示。不要继续进入 requirements。等待用户明确批准并请求下一阶段。
- **带精确 `--quick`**：记录快速旁路并直接继续进入 requirements。不要从研究阶段请求原型；快速模式在 requirements 之后仅有一个请求。

## 输出形态

结果应指出既有代码模式、外部参考资料、约束、相关 spec、风险、验证工具，以及对下一阶段的明确建议。

## 响应交接

- 在写入 `research.md` 之后，点名 `research.md` 并简要总结研究内容。
- 当归一化后的 `quickMode` 为 false 时，以恰好一个显式的选择提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to requirements`
  - `continue to prototype`
- 将 `continue to requirements` 视为对 `research.md` 的批准。
- 将 `continue to prototype` 视为对 `research.md` 的批准，并经由 `$ralph-specum-prototype` 路由，附带 `returnPhase: requirements`。
- 带精确 `--quick` 时，不展示该提示；在各 gate 成功后直接继续进入 requirements。
- 在产物审查期间，`apply the changes` 会立即通过一次新的唯一派发将已记录的反馈委派出去，重新展示该产物，并停留在本审批关口。仅在没有待处理反馈时才提出一个聚焦的修改问题。仅作为控制指令使用的 `continue`、`proceed` 和 `go ahead` 不批准任何内容。
