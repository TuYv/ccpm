---
name: agent-harness
description: "Turn any domain folder of skills into a bounded agentic loop: compile a goal into a verifiable task plan, execute tasks with the domain's own tools, verify every task with machine-run checks, retry with caps, escalate to a human when budgets exhaust, and refuse to close until everything is verified or explicitly waived. Use when you want an agent or subagent to pick up a goal and drive it to a verified close across one of this repo's 18 domains ('run this goal through the engineering harness', 'set up an agentic loop for marketing work', 'make the finance domain self-verifying'). NOT for authoring Claude Code Workflow-tool .js scripts (workflow-builder), N-agent tournaments on one task (agenthub), single-file metric optimization (autoresearch-agent), or discovering published loop recipes (loop-library)."
---
# 智能体执行框架

你是执行框架的操作者，而不是英雄。决定工作何时完成的是循环，而不是你的乐观判断。你的职责是：将目标编译为带有检查的任务，一次执行一个任务，让控制器裁定验证结果，并在状态机指示停止时停止。

## 契约

```
GOAL → goal_compiler → PLAN → loop_controller: [execute → verify]* → CLOSE
                                     ↑______retry (≤ max_attempts, changed approach)
                                     └── ESCALATE on exhausted budgets — never fake success
```

共有三层，全部使用 JSON：按领域提交的**清单**（存在哪些技能、工具和检查）、针对每个目标的**计划**（包含哪些任务、哪些验证以及“完成”的定义），以及针对每次运行的**状态文件**（唯一事实来源；新会话仅凭此文件即可恢复执行）。

## 快速开始

```bash
# 0. Pick the domain manifest (18 committed under assets/harnesses/, e.g. engineering-team.json)
ls assets/harnesses/

# 1. Compile the goal (refuses vague goals with exit 3 + forcing questions)
python3 scripts/goal_compiler.py \
  --goal "audit the payments service and design an SLO with an error budget" \
  --manifest assets/harnesses/engineering.json --out plan.json

# 2. Initialize the loop state
python3 scripts/loop_controller.py init --plan plan.json --state .agent-harness/state.json

# 3. Drive the loop — repeat until directive is "close" or "escalate"
python3 scripts/loop_controller.py next --state .agent-harness/state.json
#    → {"action": "execute", "task": "T1", ...}: open the task's skill (SKILL.md at
#      skill_path), do the work with its tools, then:
python3 scripts/loop_controller.py record --state .agent-harness/state.json \
  --task T1 --phase execute --exit-code 0
#    → the controller runs the task's checks ITSELF (subprocess, timeout, evidence log):
python3 scripts/loop_controller.py verify --state .agent-harness/state.json --task T1 --cwd <repo-root>

# 4. Close — refused (exit 4) while any task is unverified and unwaived
python3 scripts/loop_controller.py close --state .agent-harness/state.json
```

技能发生变化后，重新生成清单（差异稳定、可由 CI 检查）：

```bash
python3 scripts/harness_manifest_builder.py --domain engineering-team \
  --repo-root <repo-root> --out-dir assets/harnesses --no-timestamp
```

## 硬性规则

1. **绝不自行裁定验证结果。** `verify` 通过子进程运行检查；如果执行通过的 `record --phase verify` 未带 `--evidence`，则会被拒绝（退出码 6）。你无权声明某项任务已通过验证。
2. **绝不修改用于评判你的门禁。** 检查命令来自清单/计划。为了让检查通过而编辑检查本身，属于奖励劫持型失败模式（参见 [references/verification_discipline.md](references/verification_discipline.md)）——这与 autoresearch-agent 的锁定评估器遵循相同的不变量。
3. **一次只执行一个任务，写入操作必须串行化。** 可以并行执行读取和评判，但绝不能让两个任务同时写入同一产物（[references/agentic_loop_canon.md](references/agentic_loop_canon.md)）。
4. **重试意味着改变方法。** 相同命令 + 相同输入 = 相同失败。重试指令会明确说明这一点；请遵守。
5. **预算是终止状态，而不是建议。** `max_attempts_per_task` → 已升级（退出码 2）；`max_loop_iterations` → 升级（退出码 5）。预算耗尽绝不能被报告为成功——只能由人工豁免（`close --waive T3 --reason "..."`），不能由你豁免。
6. **新鲜上下文优于冗长上下文。** 每条 `next` 指令都必须能由一个仅读取计划和状态文件的新会话执行。对于长期运行的目标，应让每次迭代都作为独立会话，基于持久化状态运行。
7. **状态存放在 `.agent-harness/` 中**——绝不能存放在 `.agenthub/`、`.autoresearch/` 或 `docs/TC/` 中（这些目录属于同级技能）。
8. **计划和状态文件是信任边界。** `verify` 会通过 shell 执行每项任务的检查命令；只对由你或 `goal_compiler.py` 生成的计划/状态文件运行此执行框架，绝不能对来自不可信输入的文件运行（参见 [references/verification_discipline.md](references/verification_discipline.md)）。

## 强制性问题（编译前询问；每轮一个，并提供推荐答案）

| # | 问题 | 推荐答案 | 原因（规范依据） |
|---|---|---|---|
| 1 | 哪一个可观察结果意味着完成？ | 一个有名称的产物 + 一条针对该产物运行并以状态码 0 退出的命令 | 验证者定律：优先投资于可验证性 |
| 2 | 应使用哪个领域执行框架？ | 选择其技能所指向的交付物对应的领域；如果涉及两个领域，则依次运行两个循环 | 编排器-工作器模式：范围明确的目标优于巨型目标 |
| 3 | 哪些内容绝对不能更改？ | 列出不可触碰的路径；将它们写入目标文本，以便编译器的计划继承这些限制 | 边界是子代理规范的一部分 |
| 4 | 谁负责审查升级事项，需要多快完成？ | 指定一名人员；升级事项按设计会阻塞循环 | 需要审批是一种终止状态，而不是麻烦 |
| 5 | 迭代预算是多少？ | 默认 12 次循环迭代 / 每项任务 3 次尝试；仅在有明确理由时提高 | 上限是运行时错误，不是建议（OpenAI SDK `max_turns`） |

## 退出代码（以机械方式据此分支）

| 代码 | 工具 | 含义 |
|---|---|---|
| 0 | all | 正常 / 已发出指令 |
| 2 | loop_controller | 需要升级——必须由人员审查证据日志 |
| 3 | goal_compiler | 目标过于模糊——回答强制性问题，然后重新编译 |
| 4 | goal_compiler / loop_controller | 没有匹配的技能 / 拒绝关闭（存在未验证任务） |
| 5 | loop_controller | 已达到全局迭代上限 |
| 6 | loop_controller | 无效转换（在已验证任务上记录、缺少证据、任务未知） |

## 可验证的成功标准

- `python3 scripts/harness_manifest_builder.py --sample`、`scripts/goal_compiler.py --sample`
  和 `scripts/loop_controller.py --sample` 均以状态码 0 退出。
- 模糊目标（`--goal "make it better"`）以状态码 3 退出并输出强制性问题。
- 对包含未验证任务的状态执行 `loop_controller.py close` 时，以状态码 4 退出。
- `loop_controller.py --sample` 中的演示循环展示一次验证失败会消耗一次尝试，
  并且循环只有在出现带证据的验证通过后才会关闭。

## 相关技能

- **workflow-builder**：为 Claude Code 的 Workflow
  工具编写确定性的 `.js` 脚本。不适用于从目标到关闭的循环状态（本技能）。
- **agenthub**：让 N 个并行代理在 git worktree 中针对同一项任务展开竞争。可在需要竞争性尝试的
  执行框架任务*内部*使用。
- **autoresearch-agent**：针对锁定的评估器优化单个文件的指标。
  当任务的 done_when 为“指标有所提升”时使用。
- **tc-tracker**：按代码变更记录生命周期。用于变更记录管理；执行框架
  状态文件按目标记录，而不是按变更记录。
- **loop-library**：以对话方式发现/审计已发布的循环方案。本技能负责
  以可执行方式强制实施该词汇体系。
- **ship-gate / self-eval / spec-driven-workflow**：作为关闭时检查项接入任务的
  `verification[]`。

有关三层架构、复用映射以及如何提升领域执行框架质量的信息，请参阅
[references/domain_harness_design.md](references/domain_harness_design.md)。