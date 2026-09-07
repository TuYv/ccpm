---
name: ralph-specum-requirements
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-requirements`, or explicitly asks Ralph Specum in Codex to run the requirements phase.
metadata:
  surface: helper
  action: requirements
---
# Ralph Specum Requirements

你是**协调者，而非产品经理**——将全部工作都委派给 `product-manager` 子代理。

从 `SKILL.md` 所在目录向上解析两级父目录，以此从当前已加载的技能推导出 `RALPH_CODEX_PLUGIN_ROOT`。切勿从项目工作目录推导。

## 契约

- 通过显式路径、精确名称或 `.current-spec` 解析当前活动规范
- 要求规范目录必须存在
- 仅合并状态字段
- 保持 Ralph 磁盘契约不变

## 操作

1. 解析当前活动规范。如果不存在，则停止。
2. 读取 `research.md`（如果存在）、`.progress.md` 以及当前状态。
3. 通过 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/phase_gate.py"` 运行 `phase_gate.py mode`，传入 `STATE`，并使用精确的 `--quick`、精确的 `--interactive` 或不带任何标志。拒绝同时使用两者、`-q`、各类变体以及自然语言替代形式。
4. 当 `research.md` 存在时，在交互模式下要求对其工件进行审批；精确的快速模式则使用已验证的文件继续。当其不存在时，记录没有上游研究工件，且不要求前置工件审批。
5. 当 `research.md` 存在时，要求针对目标及最终研究执行技能发现第 2 轮。当其不存在时，要求仅针对目标执行第 1 轮。当状态缺少相应修订时，运行适用的轮次。选择明确命名的技能，并记录被 harness 遮蔽的重复技能。
6. 在交互模式和快速模式下，均需加载 `"$RALPH_CODEX_PLUGIN_ROOT/skills/interview-framework-codex/SKILL.md"`、其所需的算法和领域建模参考资料，以及所有选定的领域契约。在交互模式下，对关键用户成果、范围排除项、验收阈值以及重要的非功能需求使用其聚焦式头脑风暴方法。检查现有行为和术语，而不是询问。
7. 生成之前，通过合并 `awaitingApproval: false` 清除任何既有的审批门。
8. 在交互模式下，要求显式的 `approve and delegate`；在精确的快速模式下，记录 `bypassed_quick`。在两种模式下，创建子代理之前都要以当前已加载 manifest 的身份运行 `phase_gate.py check-delegation`。在派发需求编写者之前，应用共享的硬转换不变量。任一模式下 `check-delegation` 失败都会在阶段转换、子代理派发或目标工件写入之前终止本次调用；普通模式失败后，下一次显式调用会创建全新的 manifest/访谈身份，并且不会创建备用的快速绕过。在精确 `--quick` 委派失败后，下一次显式调用会重新运行发现，记录全新的 `phaseSkillLoad` 和访谈身份，并且不会复用已终结的 `bypassed_quick` 访谈或其发现修订。只有匹配的、进行中的 `collecting` 或 `awaiting_confirmation` 访谈才可恢复。
9. 将需求生成**委派**给 `product-manager` 子代理。传入绝对辅助脚本路径、状态路径、身份元组、唯一的队友派发身份、逐字的 manifest、研究上下文、目标以及访谈结果。子代理会重新加载并记录 manifest，以该唯一身份通过 `check-agent-write`，并写入 `requirements.md`。切勿自行编写 requirements.md。
10. 读取子代理的输出并验证其存在。
11. 合并状态，设置 `phase: "requirements"` 和 `awaitingApproval: true`（当精确 `--quick` 生效时则为 `false`）。
12. 更新 `.progress.md`，写入已批准的研究上下文、用户决策、阻塞项、下一步、技能发现，以及任何必须延续的史诗约束。
13. 如果启用了规范提交，则仅提交规范工件。
14. 仅在普通模式下，当用户选择 `continue to prototype` 时，将 `requirements.md` 视为已批准，并使用相同的已解析基础路径路由到 `$ralph-specum-prototype --suggested --return-phase design`。让该技能掌管原型行为及其返回交接。

### 快速原型门

在快速模式下完成需求验证与评审之后：

1. 选择阻碍设计的最旧原型。如果没有原型阻碍设计，则从 `research.md` 和 `requirements.md` 中选择风险最高的、有依据且可证伪的问题；当不存在合适的问题时，让原型协调者记录一个跳过的结果。
2. 发出恰好一次请求：`$ralph-specum-prototype --quick --return-phase design`。
3. 将该请求视为 `requestAttempt: 1`。使其与 `builderExecutionAttempt` 保持分开；重复复用、被取代、冲突解决、跳过和锁定失败都会消耗该请求，而不会增加一次构建器执行。
4. 全权负责每一项捕获、冲突、判定、重试、清理和交接决策。不向用户提出任何问题，并保留与此无关的进行中原型。
5. 每个结果之后都继续进入设计。恢复时将已完成的请求视为那一次请求，绝不第二次调用原型技能。

### 停止行为

- **不带 `--quick`**：在此停止。显示走查摘要和审批提示。不要继续进入设计。等待用户明确批准并请求下一阶段。
- **带精确 `--quick`**：运行一次快速原型门，然后无论结果如何都直接继续进入设计。

## 输出结构

结果应包含用户故事、验收标准、功能需求、非功能需求、依赖项、排除项和成功标准。

## 响应交接

- 写入 `requirements.md` 之后，指明 `requirements.md` 并简要总结需求。
- 当归一化后的 `quickMode` 为 false 时，以恰好一个显式的选择提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to design`
  - `continue to prototype`
- 将 `continue to design` 视为对 `requirements.md` 的批准。
- 将 `continue to prototype` 视为对 `requirements.md` 的批准，并经由 `$ralph-specum-prototype` 以 `returnPhase: design` 进行路由。
- 使用精确 `--quick` 时，不显示此提示；在阶段门和单次快速原型门请求完成后直接继续进入设计。
- 在工件评审期间，`apply the changes` 会立即通过一次新的唯一派发来委派已记录的反馈，重新显示该工件，并停留在此审批门。仅在没有待处理反馈时，才提出一个聚焦的变更问题。仅起控制作用的 `continue`、`proceed` 和 `go ahead` 不批准任何内容。
