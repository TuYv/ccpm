---
name: ralph-specum-design
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-design`, or explicitly asks Ralph Specum in Codex to run the design phase.
metadata:
  surface: helper
  action: design
---
# Ralph Specum Design

你是一名**协调者，而非架构师**——将全部工作委托给 `architect-reviewer` 子代理。

从 `SKILL.md` 所在目录向上解析两级父目录，据此从本已加载的技能推导出 `RALPH_CODEX_PLUGIN_ROOT`。切勿从项目工作目录推导。

## 契约

- 通过显式路径、确切名称或 `.current-spec` 解析当前活跃的规格
- 必须存在 `requirements.md`
- 仅合并状态字段
- 保持 Ralph 磁盘契约不变

## 行动

1. 解析当前活跃的规格。如果不存在，则停止。
2. 必须存在 `requirements.md`。存在时读取 `research.md`，同时读取 `.progress.md` 和当前状态。
3. 通过 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/phase_gate.py"` 运行 `phase_gate.py mode`，附带 `STATE` 以及确切的 `--quick`、确切的 `--interactive`，或不带任何标志。拒绝两者同时使用、`-q`、各种变体以及自然语言替代形式。
4. 在交互模式下，开始设计前必须获得当前 `requirements.md` 的制品批准。确切的快速模式则携带已验证的制品继续。
5. 在生成之前，使用已解析的 `basePath` 运行原型记录选择：
   ```bash
   python3 "$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py" select-downstream --base-path "$BASE_PATH" --state "$BASE_PATH/.ralph-state.json"
   ```
6. 仅纳入选择器返回的受影响、有效、`gateApproved: true` 且未被取代的记录。排除畸形、已取代、已跳过、失败、无结论、已取消以及普通模式下被排除的记录。
7. 当选择报告存在影响设计的 `activePrototypes` 阻塞项时，在生成之前停止。指明该活跃 ID，并通过 `$ralph-specum-prototype` 路由恢复。
8. 当选择报告存在影响设计的过期需求、研究、设计或任务索引时，停止。路由到最早的过期阶段。仅当选择器报告与活跃原型、过期制品、过期任务索引或已批准的转移路径均无依赖时，才允许已证实无关的工作。
9. 在生成之前，通过合并 `awaitingApproval: false` 清除任何先前的批准门。
10. 当 `research.md` 存在时，要求针对目标加最终研究执行技能发现第 2 轮。当其不存在时，要求仅针对目标执行第 1 轮。当状态缺少相应修订时，运行适用的轮次。选择显式命名的技能，并记录被宿主遮蔽的重复项。
11. 在交互模式和快速模式下，加载 `"$RALPH_CODEX_PLUGIN_ROOT/skills/interview-framework-codex/SKILL.md"`、其必需的算法与领域建模参考资料，以及所有已选定的领域契约。在交互模式下，对重大的架构选择、稳定接口、兼容性或迁移决策以及运营风险，使用其聚焦式头脑风暴方法。查证仓库事实和既有约定，而不是提问。
12. 在交互模式下，要求显式的 `approve and delegate`；在确切的快速模式下，记录 `bypassed_quick`。在两种模式下，创建子代理之前都要以当前已加载的清单标识运行 `phase_gate.py check-delegation`。在设计编写者派发之前应用共享的硬转换不变量。任一模式下 `check-delegation` 失败都会在阶段转换、子代理派发或目标制品写入之前终止本次调用；普通模式失败后，下一次显式调用会创建全新的清单/访谈标识，且不会创建替代性的快速旁路。确切的 `--quick` 委托失败后，下一次显式调用会重新运行发现，记录全新的 `phaseSkillLoad` 和访谈标识，且不会复用已终止的 `bypassed_quick` 访谈或其发现修订。只有匹配的、进行中的 `collecting` 或 `awaiting_confirmation` 访谈可以恢复。
13. **委托** `architect-reviewer` 子代理进行设计生成。传入绝对辅助脚本路径、状态路径、标识元组、唯一的队友派发标识、逐字清单、需求、研究、已选定的原型证据、干净的阻塞/过期门结果以及访谈上下文。子代理重新加载并记录清单，以该唯一标识通过 `check-agent-write`，并写入 `design.md`。不要自己编写 design.md。
14. 读取子代理的输出并验证其存在。
15. 合并状态，设为 `phase: "design"` 和 `awaitingApproval: true`（当确切的 `--quick` 生效时则为 `false`）。
16. 更新 `.progress.md`，写入设计决策、开放风险、集成契约、技能发现以及下一步。
17. 如果启用了规格提交，则仅提交规格制品。

### 停止行为

- **不带 `--quick`**：在此停止。展示走查摘要和批准提示。不要继续进入任务。等待用户显式批准并请求下一阶段。
- **带确切的 `--quick`**：记录快速旁路并直接继续进入任务。

## 输出形态

结果应涵盖架构、接口、数据流、文件变更、技术决策、错误处理和测试策略。

## 回应交接

- 写入 `design.md` 之后，指明 `design.md` 并简要总结设计。
- 当归一化的 `quickMode` 为 false 时，以恰好一个显式的选择提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to tasks`
- 将 `continue to tasks` 视为对 `design.md` 的批准。
- 带确切的 `--quick` 时，不显示此提示；各门通过后直接继续进入任务。
- 在制品评审期间，`apply the changes` 会立即通过一次新的唯一派发委托已记录的反馈，重新展示该制品，并停留在这一批准门。仅在没有待处理反馈时，才提出一个聚焦的变更问题。仅起控制作用的 `continue`、`proceed` 和 `go ahead` 不批准任何内容。
