---
name: agent-launcher-orchestrator
description: Use when a user wants to build, launch, grade, or schedule a Claude Managed Agent (CMA) in their own Anthropic account — "build me an agent", "launch this as a managed agent", "run this on a schedule", "grade my agent against a rubric", "set up a nightly worker". Reads the per-session goal (./my-agent/goal.json), routes deterministically to one of five phase sub-skills (interview → stage-launch → grade-iterate → run-without-you → wrap-up) via goal_router.py, and compiles the goal+phase into an execution shape (single-pass workflow / bounded grade→iterate loop / recurring cron deployment loop) via loop_compiler.py. Forks context so heavy intake (build sheets, payloads, eval cases) stays out of the parent thread. All launches are emitted as BYOK curl the user runs with their own key; no tool makes API calls. Inspired by anthropics/launch-your-agent (Apache-2.0). Distinct from engineering/agent-harness (generic domain loop) and engineering/write-a-skill (authors Claude Code skills, not CMAs).
context: fork
version: 2.11.2
author: Alireza Rezvani
license: MIT
tags: [claude-managed-agents, cma, agent, launch, orchestrator, session-goal, loop, workflow, cron, outcome, byok]
compatible_tools: [claude-code, codex-cli, cursor, antigravity, opencode, gemini-cli]
---
# agent-launcher — 领域编排器

每个会话都以一个**目标**开始——为一个 CMA 设定的一句话目标。此编排器
读取该目标，将其路由到正确的阶段，并将目标编译为一个**循环或工作流**。
繁重的接收工作留在分叉上下文中；父上下文只接收摘要。

灵感来自 Anthropic 的 `launch-your-agent` 参考 skill（Apache-2.0）。这是一个
独立的重新实现；CMA 语义来自
[`../../references/cma-primitives.md`](../../references/cma-primitives.md)。

## 主线：会话目标

状态位于 `./my-agent/goal.json`（用户的文件夹）中。使用
`goal_state.py`（init / set / status / advance）管理它——它同时为 `/cs:goal`
命令和可选的 `SessionStart` hook 提供支持。目标的 `phase` 选择通道；
phase + recurrence 选择循环形状。

## 路由（确定性）

运行路由器，然后根据其退出代码执行操作：

```bash
python3 scripts/goal_router.py --out-dir ./my-agent
# exit 0 ROUTE  -> fork to the named phase sub-skill
# exit 3 ASK    -> ask the one printed forcing question, then re-route
# exit 4 REFUSE -> goal too vague; get one sentence, then re-route
```

| 通道（阶段） | 子 skill | 循环/工作流 |
|---|---|---|
| interview | `interview` | 单次工作流 |
| stage-launch | `stage-launch` | 单次工作流 |
| grade-iterate | `grade-iterate` | **有界的评分→迭代循环** |
| run-without-you | `run-without-you` | **重复执行的 cron 部署循环** |
| wrap-up | `wrap-up` | — |

## 编译循环

```bash
python3 scripts/loop_compiler.py \
  --out-dir ./my-agent --max-iterations 5 --cron "0 9 * * *" --timezone Europe/Berlin --nest-outcome
```

`loop_compiler.py` 会生成 `plan.v1`：`single-pass`、`grade-iterate`（始终带有
1..20 范围内的 `max_iterations` 上限），或 `cron-loop`（可选择在每次触发时
嵌套自评分结果）。参见 [`../../references/loops-and-workflows.md`](../../references/loops-and-workflows.md)。

## 预检门槛（硬性拒绝）

1. **未设置目标。** 如果 `goal.json` 不存在，先运行
   `goal_state.py init --goal "..."`。编排器不会猜测目标。
2. **目标过于模糊。** 路由器退出代码为 4——在路由前获取一句命名这项工作的
   句子。绝不根据少于 3 个词的目标进行路由。
3. **绝不进行 API 调用。** 输出 BYOK curl；由用户使用其自己的
   `$ANTHROPIC_API_KEY` 运行。此插件中的脚本不会接触网络。
4. **绝不打印密钥。** 启动脚本从环境中读取密钥。

## 交接契约

路由后，将以下内容传递给子 skill：目标字符串、`agent_name`、
`out_dir`（`./my-agent`）以及编译好的 `plan.v1`。子 skill 返回后，
`goal_state.py advance` 会推进阶段，父上下文将获得一份不超过 100 个词的摘要
（已完成的阶段、产物路径、循环形状、一个下一步）。

## 强制问题库（一次询问一个；提供建议 + 引用）

1. **“这个 agent 应该端到端完成哪一项工作？”**——*建议：*最经常重复的单项任务。
   *引用：*interview-to-config.md（六个接收槽位）。拒绝路由一个包含两项工作的目标；
   将其拆分到两个 `./my-agent-*/` 文件夹中。
2. **“是什么启动它——你询问它、一个事件，还是一个计划？”**——*建议：*
   v0 使用按需启动，Phase-4 再升级为计划启动。*引用：*loops-and-workflows.md。
3. **“你会如何评判一次成功的运行？”**——*建议：*制定 3–5 条以输出为依据的评分标准。
   *引用：*cma-primitives.md（结果；必须有评分标准）。
4. **“真实集成已准备就绪，还是要在 v0 中进行模拟？”**——*建议：*使用符合 schema
   的自定义工具进行模拟；在 v1 中接入 MCP server。*引用：*interview-to-config.md。
5. **“第 10 次运行应该比第 1 次运行更智能吗？”**——*建议：*仅在答案为“是”时附加
   memory store；否则跳过。*引用：*cma-primitives.md（memory 限制 + 注入风险）。

## 工具

- `scripts/goal_state.py` — 负责管理 `goal.json`（init/set/status/advance）。
- `scripts/goal_router.py` — goal → lane（退出码 0 表示路由 / 3 表示询问 / 4 表示拒绝）。
- `scripts/loop_compiler.py` — goal+phase → `plan.v1` 执行结构。