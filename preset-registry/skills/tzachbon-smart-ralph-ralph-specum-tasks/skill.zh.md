---
name: ralph-specum-tasks
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-tasks`, or explicitly asks Ralph Specum in Codex to run the tasks phase.
metadata:
  surface: helper
  action: tasks
---
# Ralph Specum 任务

你是一个**协调者，而非任务规划者**——把所有（ALL）工作都委托给 `task-planner` 子代理。

从本已加载的技能派生 `RALPH_CODEX_PLUGIN_ROOT`：从 `SKILL.md` 所在目录向上解析两级父目录。绝不要从项目工作目录派生它。

## 契约

- 通过显式路径、确切名称或 `.current-spec` 解析当前活动的规格
- 要求具备 `requirements.md` 和 `design.md`
- 只合并状态字段
- 保持 Ralph 磁盘契约不变

## 动作

1. 解析当前活动的规格。如果不存在，则停止。
2. 要求具备 `requirements.md` 和 `design.md`。读取 `research.md`（当其存在时）、`.progress.md` 以及当前状态。
3. 通过 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/phase_gate.py"` 运行 `phase_gate.py mode`，传入 `STATE`，并使用精确的 `--quick`、精确的 `--interactive`，或不加任何标志。拒绝二者同时使用、`-q`、各种变体以及自然语言替代形式。
4. 在交互模式下，开始任务之前必须先获得对当前 `design.md` 的工件批准。精确的快速模式使用已通过验证的工件继续。
5. 在生成之前，用已解析的 `basePath` 运行原型记录选择：
   ```bash
   python3 "$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py" select-downstream --base-path "$BASE_PATH" --state "$BASE_PATH/.ralph-state.json"
   ```
6. 只纳入选择器返回的受影响、有效、`gateApproved: true`、未被取代的记录。排除畸形、已被取代、被跳过、失败、无结论、已取消以及在普通模式下被排除的记录。
7. 当选择报告存在针对任务的 `activePrototypes` 阻塞项时，在生成之前停止。指明活动的 ID，并通过 `$ralph-specum-prototype` 路由恢复操作。当选择器报告没有任务依赖时，允许已证明无关的原型。
8. 当选择报告 `design.md` 已过时、任务索引已过时，或设计所依赖的某个上游工件已过时，则停止。路由到最早过时的阶段，不要基于过时的设计进行规划。
9. 在生成之前，通过合并 `awaitingApproval: false` 清除任何先前的批准闸门。
10. 遵循状态中的 `granularity`。允许 `--tasks-size fine|coarse` 覆盖它。把任务粒度调整当作管理操作，而不是访谈问题。在精确的快速模式下，未设置的粒度默认为 `fine`。
11. 当 `research.md` 存在时，要求针对目标加上最终研究成果执行技能发现第 2 轮。当其不存在时，要求仅针对目标执行第 1 轮。当状态缺少相应轮次的版本号时，运行适用的轮次。选择被明确命名的技能，并记录被 harness 遮蔽的重复项。
12. 在交互模式和快速模式下，都加载 `"$RALPH_CODEX_PLUGIN_ROOT/skills/interview-framework-codex/SKILL.md"` 及其必需的算法和领域建模参考，以及所有已选定的领域契约。在交互模式下，遵循该算法处理关键交付切片、依赖顺序、上线风险和验证阈值。检查命令、文件布局和现有测试工具，而不是提问。
13. 在交互模式下，要求明确的 `approve and delegate`；在精确的快速模式下，记录 `bypassed_quick`。在两种模式下，创建子代理之前都要以当前已加载清单的身份运行 `phase_gate.py check-delegation`。在派发 task-planner 之前应用共享的硬转换不变量。任一模式下 `check-delegation` 失败都会在阶段转换、子代理派发或目标工件写入之前终止本次调用；普通模式失败后，下一次显式调用会创建全新的清单/访谈身份，且不会创建替代的快速旁路。在精确的 `--quick` 委托失败后，下一次显式调用会重新运行发现，记录全新的 `phaseSkillLoad` 和访谈身份，并且不会复用已终结的 `bypassed_quick` 访谈或其发现版本。只有匹配的、进行中的 `collecting` 或 `awaiting_confirmation` 访谈可以恢复。
14. **将**任务规划委托给 `task-planner` 子代理。传递绝对的帮助脚本路径、状态路径、身份元组、唯一的队友派发身份、逐字的清单、需求、设计、研究、选定的原型证据、干净的阻塞项/过时闸门结果以及访谈上下文。子代理重新加载并记录清单，以该唯一身份通过 `check-agent-write`，并写入 `tasks.md`。不要（NOT）自己写 tasks.md。
15. 读取子代理的输出并验证其存在。
16. 统计任务数量并合并状态，包含以下字段：
   - `phase: "tasks"`
   - `awaitingApproval: true`（或在 `--quick` 生效时为 `false`）
   - `taskIndex: first incomplete or totalTasks`
   - `totalTasks: counted tasks`
17. 更新 `.progress.md`，写入阶段分解、下一个里程碑、阻塞项、下一步、所选粒度、技能发现以及验证策略。
18. 如果启用了规格提交，则只提交规格工件。

### 停止行为

- **不带 `--quick`**：在此停止（STOP HERE）。展示走查摘要和批准提示。不要（NOT）继续进入实现。等待用户明确批准并请求下一阶段。
- **带精确的 `--quick`**：记录快速旁路，进行审查，然后直接继续进入实现。

## 输出形态

使用原子任务，包含精确的文件目标、明确的成功标准、验证命令和提交信息。保持 POC 优先的顺序。当端到端验证属于计划的一部分时，支持用于安全并行工作的 `[P]` 标记、`[VERIFY]` 检查点以及 VE 任务。

## 响应交接

- 写入 `tasks.md` 之后，指名 `tasks.md` 并简要总结任务计划。
- 当归一化后的 `quickMode` 为 false 时，以恰好一个明确的选择提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to implementation`
- 将 `continue to implementation` 视为对 `tasks.md` 的批准。
- 带精确的 `--quick` 时，不显示此提示；在闸门全部通过后直接继续进入实现。
- 在工件审查期间，`apply the changes` 会立即通过一次新的唯一派发委托已记录的反馈，重新展示该工件，并停留在这一批准闸门。仅在没有待处理反馈时才提出一个聚焦的变更问题。仅作控制用途的 `continue`、`proceed` 和 `go ahead` 不批准任何内容。
