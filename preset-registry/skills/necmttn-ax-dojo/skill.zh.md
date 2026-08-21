---
name: dojo
description: Surplus-quota training loop over the ax graph - the agent burns the remaining 5h/7d plan-quota window on self-improvement: locking pending verdicts, filling briefs, backtesting routing classes, minting proposals, running worktree experiments, and drafting upstream issue reports. Triggers when the user says "/dojo", "enter the dojo", "dojo time", "train overnight", "burn my surplus quota", "dream mode" (legacy name), or invokes /loop /dojo. Requires ax (axctl) on PATH and the local SurrealDB running. Do NOT auto-trigger on unrelated work or when the user merely mentions quotas.
---
# ax:dojo - 通宵训练循环

你正在进入一个受预算限制的自我改进循环。核心是
`ax dojo agenda --json`；你只是轻量级驱动程序。规范：
docs/superpowers/specs/2026-06-13-ax-dojo-design.md（位于 Necmttn/ax 仓库中）。

## 入口

1. 运行 `ax dojo agenda --json`。如果因连接错误而失败，请告知用户
   运行 `ax doctor`，然后停止。
2. 如果 `budget.has_surplus` 为 false：报告预算范围并停止，除非
   用户使用 `--force` 重新调用（之后每一轮都传入 `--force`）。
3. 在 Claude Code 上：立即进入循环模式——调用 `/loop` 技能，并将
   `/dojo` 用作重复提示词（动态模式、自定节奏）。每次唤醒都会
   从头重新运行此技能；这是预期且正确的行为。
   在 Codex 上（无 /loop）：将其作为一个长回合运行——在满足下方某个
   停止条件之前，不要结束该回合。

## 单轮流程

1. `ax dojo agenda --json` -> 议程。
2. 停止条件（写入报告，然后停止）：
   - `budget.has_surplus` 为 false
   - 当前时间 >= `budget.deadline`
   - `items` 为空
3. 否则：取 `items[0]`，按照下方对应的操作手册执行，然后返回步骤 1。
   已完成的工作会自行清除：该项目会从下一次议程中消失，
   因为底层系统已经记录了它（裁定已锁定、简报已处理、
   提案已创建）。如果同一项目连续 2 轮未被处理仍然存在，
   请跳过它，并在报告中注明原因。

## 按类型划分的操作手册

- **verdict_pending** - 使用 `ax improve verdict <id>` 查看建议的
  裁定和检查点证据；只有在证据支持时，才使用 `--set <verdict>`
  进行确认。在锁定 no_longer_needed 之前，要区分“模式已解决”和“产物
  从未触发”。
- **brief_unfilled** - 打开 `.ax/tasks/*.md` 简报，按照其中的要求
  修改目标文件，然后运行其中指定的协调器（`ax skills lint` /
  `ax improve lint`）。
- **routing_backtest** - 对判断标记的路由类别：根据分派历史
  （`ax dispatches --candidates`）回测该模式，检查误报风险，然后运行
  `ax routing tune --apply=<ids> --days=<window>`，或在报告中写明理由
  并拒绝。
- **proposal_mint** - 运行 `ax improve recommend`；接受有充分依据的提案
  （`ax improve accept <id>`），以便为下一轮生成简报。
- **experiment** - 重型项目。只能在全新的工作树中操作
  （`git worktree add .claude/worktrees/dojo-<slug> -b dojo/<slug>`）。
  复现反复修改模式，尝试修复方案/钩子/技能，并收集证据。
  如果无法在本次预算内完成：将其整理为 docs/superpowers/goals/ 下的
  目标文件（目标 + 检查点索引 + 门禁条件），以便下一次 dojo 会话
  继续执行。输出 = 一个改进提案；只有合并该提案才会激活任何内容。
  绝不要合并，绝不要修改 main。
- **专门针对新钩子** - 通过 @ax/hooks-sdk 编写，然后运行以下两个
  验证器，并将它们的输出嵌入提案：
  1. `ax hooks backtest <file> --json` → 捕获的案例（收益侧）：would-block/
     would-warn 比率、误报数量、带有证据的案例。
  2. `ax hooks bench <file> --json` → 基于真实 bun 启动的单次触发 p50/p95、
     根据 tool_call 历史估算的每日触发次数、已安装链的预算与 --budget-ms
     默认值 250 的对比（成本侧）。
  当每日成本（每日触发次数 × p95）或已安装链的预算超支超过回测所展示的
  收益时，拒绝该钩子。两份账目都必须出现在提案中；仅有任意一份都不充分。
- **spar** - 仅当使用 --spar 调用且可支配预算 >= 30% 时出现。
  一个任务、一个变量、进行评分。具体流程：
  1. 选择一个已落地的任务：`ax sessions here --days=30`——通过 `ax sessions near <sha>` 或 `git log` 记录其提交 sha。
  2. `ax dojo spar-plan <sha>`——捕获基线（提示词 + 成本/轮次/反复修改），并写入 `~/.ax/dojo/spar/<id>.md`；该命令会输出接下来要运行的确切 `git worktree add` 命令。
  3. 阅读 `~/.ax/dojo/spar/<id>.md` 中的简报；运行输出的 `git worktree add .claude/worktrees/dojo-spar-<id> -b dojo/spar-<id> <parentSha>` 命令，将工作树固定在父 SHA。
  4. 仅应用变量部分中的一个变更（启用/禁用技能、启用/禁用钩子、修改提示词、思考级别或模型覆盖）——不得进行复合变更。
  5. 在该工作树中完成任务；让其自然结束。
  6. `ax dojo spar-score <id>`——从工作树 cwd 自动发现变体会话；如果存在多个会话，也可传入 `--variant-session=<id>`。将回执写入 `~/.ax/dojo/spar/<id>-report.md`。
  7. 将回执附加到 dojo 报告。将多次运行的活动记录为 docs/superpowers/goals/ 下的目标文件，以便下一次会话继续执行。
- **explore** - 自由调查，采用回顾元分析风格：通过 `ax recall` /
  `ax sessions churn` 追查某个直觉，并将任何确有其事的发现
  转化为提案或发件箱草稿。
- **上游发现（任意一轮）** - 训练期间发现的 ax 缺陷或改进项
  （类型为 `upstream_draft` 的项目也按同一规则处理）：
  运行 `ax dojo draft --title=<title> --kind=bug|improvement`，将其暂存到
  `~/.ax/dojo/outbox/<slug>.md`（由该命令写入完整的议题草稿：标题、正文、
  复现步骤、会话引用）。绝不要从 dojo 发布——
  用户会在早上审核并发布（ax-repo 技能 / gh）。

## 退出——晨间报告

运行 `ax dojo report --since=<loop-start-iso> --notes-file=<lap-notes-path>`，以写入 `~/.ax/dojo/reports/<YYYY-MM-DD>.md`。该命令会收集预算额度、每轮项目日志（来自轮次笔记文件）、已创建的提案、已锁定的裁决，以及等待审核的发件箱草稿——请向其传入循环开始时记录的 ISO 时间戳，以及追加笔记所用的暂存文件。然后告知用户报告路径，以及等待其审核的最重要的 3 项内容。

对于上游发现（训练期间发现的 ax bug 或改进项），请在报告步骤之前使用 `ax dojo draft --title=<title> --kind=bug|improvement` 将其暂存——切勿直接发布。草稿会保存到 `~/.ax/dojo/outbox/<slug>.md`；用户将在早晨通过 ax-repo skill / gh 进行审核并发布。

## 严格约束

- 仅使用 worktree；绝不在 main 上写入；绝不合并任何内容
- 提案是唯一的激活路径
- 仅限发件箱；任何内容都不得离开本机
- 即使正在处理某个项目，也要遵守截止时间：设置检查点、生成报告、停止