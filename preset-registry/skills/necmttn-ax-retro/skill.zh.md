---
name: retro
description: Guided experiment-loop retrospective over the ax agent-experience graph. Walks the user through their open proposals (accept-with-scaffold or reject), pending verdicts (confirm the suggested verdict or override), and recent harness-hook effectiveness signal. Triggers when the user says "let's do an ax retro", "ax retrospective", "review my ax proposals", "triage proposals", "experiment loop status", "lock pending verdicts", "hook effectiveness review", "intervention review", "self-improvement session", or invokes /ax:retro. Reads/writes via the local `ax improve` and `ax hooks` CLIs. Do NOT auto-trigger on unrelated work.
---
# ax:retro - 引导式实验循环会话

闭合自我改进循环。Claude 负责协调 `ax improve …` 命令；用户逐行做出决定。

假定 `ax`（axctl）已位于 PATH 中。如果 `ax improve list` 执行失败，请提示用户查看 `docs/development.md#setup`（DuckDB dylib 设置——无需守护进程），然后停止。

## 触发时机

仅在出现明确触发语时触发：
- “我们来做一次 ax 复盘” / “ax 回顾” / “复盘时间”
- “审查我的 ax 提案” / “筛选提案”
- “我的实验循环状态如何” / “锁定待定结论”
- “钩子有效性审查” / “干预审查”
- “自我改进会话”
- `/ax:retro` 斜杠命令（如果插件市场发布了该命令）

不要因笼统的“看看我最近的工作”而触发——这可能会将无关上下文带入循环。

## 默认设置

- 钩子信号的时间窗口：最近 7 天。如果证据不足，则扩大到 30 天。
- 不要静默应用更改。每一行的接受、拒绝或结论都必须得到用户明确确认。
- 复盘主要是只读操作。技能脚手架和结论锁定是仅有的副作用。

## 工作流程

### 第 0 步——清空待处理的会话复盘

在处理提案队列之前，检查先前会话是否仍欠缺复盘。这是“配额套利”路径——利用闲置的 Opus 预算消化积压任务，使实验循环在下次运行时能够获得信号。

1. 运行：

   ```bash
   ax retro pending --since=7 --idle-min=30 --json
   ```

   返回最近 7 天内尚无 `reviewed` 图边，并且看起来已经结束的会话（具有明确的 `ended_at`，或最后一轮已空闲超过 30 分钟）。如果列表为空，则跳至第 1 步。

2. 向用户展示该列表，每个会话占一行（项目 · 轮数 · 模型 · 原因）。询问：

   > 有 N 个会话待复盘。要我并行派遣
   > retro-reviewer 子代理处理全部会话，还是选择一个
   > 子集？

3. 用户选择 `all` 或 `<subset>` 后：为每个选定的会话生成一份简报：

   ```bash
   ax retro brief --session=<session_id>
   ```

   这会写入 `.ax/tasks/retro/<key>.md`，其中包含 frontmatter（转录路径、建议模型、轮数等）以及说明审查者应执行哪些操作的正文。

4. 为每份简报并行派遣一个 `retro-reviewer` 子代理。在提示词中传入各自的简报路径；由子代理的 frontmatter 固定使用 `model: opus`（如果每个会话的 `suggested_model` 不同，并且用户要求节省资源，则按会话覆盖）。

   如果无法解析 `retro-reviewer` 子代理类型（未安装，或当前使用的工具不是 Claude Code），则根据简报中要求的输出说明，直接以内联方式读取并审查简报，而不是放弃处理积压任务。

5. 等待所有子代理完成。汇总结果：已生成的复盘数量、推荐的提案数量、模型适配建议。以简短摘要的形式呈现。用户无需逐行批准复盘内容的生成——子代理已经写入了这些内容。用户需要在第 2 步中对由此产生的提案做出决定。

6. 现在，每个已清空的会话都存在 `reviewed` 边，因此重新运行 `ax retro pending` 时显示的行数应当减少。

如果用户拒绝步骤 0，则继续执行。待办项会保留——下次复盘时再处理。

### 步骤 1 - 快照

静默运行（尽可能并行）：

```bash
ax improve list --status=open --json
ax improve list --status=accepted --json
ax improve verdict --json
ax retro list --since=7 --json         # cluster-derived friction summary
ax hooks summary --since=7 --tail=20   # optional; tolerate failure
```

`ax retro list` 现在会反映三种模式类型：
- **工具故障**（技能形式）→ `Pre-<Tool> guard` 提案
- **纠正压力**（指导形式）→ 以 `CLAUDE.md` 为目标的“减少反复出现的用户纠正”提案
- **摩擦类型**（技能形式，每种类型一个）→ `Address recurring <kind> friction` 提案

如果出现上述任何一种，请提及它们，以便用户知道要在步骤 2 中进行分流处理。

计算以下数量：开放提案（按形式分类）、`locked_verdict IS NONE` 的已接受实验、自上次锁定以来到期的检查点。然后用 2-4 行向用户展示，例如：

> 7 个开放提案（3 个技能，4 个指导）。2 个已接受的实验正在等待裁定。过去 7 天的 Hook 活动：142 次调用，3 个阻断错误。要先分流提案、锁定待处理的裁定，还是浏览 Hook 信号？

如果提案和裁定队列都为空：告知用户当前没有待办事项，并建议使用 `ax ingest --derive-only` 刷新证据。

### 步骤 2 - 分流开放提案

按 `frequency` 降序排列开放提案。依次对每个提案执行以下操作：

1. 运行 `ax improve show <dedupe_sig> --json`（或复用步骤 1 中的行）。

2. 用 3-5 行展示。以下是技能提案的示例：

   > **模式变更护栏**（技能 · 频率=9 · 置信度=高）
   > 假设：模式编辑通常会在约 14 天内出现在连续修复中。
   > 触发条件：修复提交涉及模式文件。
   > 行为：编辑前运行模式 lint，并执行一次读/写冒烟测试。

3. 询问用户：**接受**、**拒绝**或**跳过**。

4. 分支：
   - **接受** → 运行 `ax improve accept <dedupe_sig>`。
     告知用户 SKILL.md 脚手架生成在何处。
     询问：*“要现在完善脚手架生成的 SKILL.md 吗？”*
     如果是：读取该文件、提出编辑建议并将其写回。
   - **拒绝** → 请求提供简短原因（≤80 个字符）。
     运行 `ax improve reject <dedupe_sig> --reason "<reason>"`。
   - **跳过** → 不运行命令。继续处理下一个；该提案保持开放，留待下次复盘。

循环结束后进行总结：*“已接受 3 个，已拒绝 1 个，已跳过 2 个。”*

### 步骤 3 - 裁定审查

对于最新检查点尚未锁定（`locked_verdict IS NONE`）的每个实验，按时间从早到晚依次处理：

1. 运行 `ax improve verdict <dedupe_sig>` 获取实验和检查点历史记录。

2. 用 2-3 行展示最近的检查点：

   > **模式变更护栏**——t+30 检查点
   > 窗口期内有 12 次机会，其中 8 次得到处理（66%）。建议：**`adopted`**。

3. 请用户确认建议的裁定，或进行覆盖：
   - `adopted`（产物确实发挥了作用）
   - `ignored`（用户编写了它，但从未调用）
   - `regressed`（它让情况变得更糟）
   - `partial`（信号混合）
   - `no_longer_needed`（模式已自行消失；触发器不再触发）

4. 运行 `ax improve verdict <dedupe_sig> --set <verdict>` 将其锁定。

### 步骤 4 - Hook 有效性检查（可选）

仅当用户要求审查 hook，或者步骤 1 发现 ≥3 个
阻断错误时才运行。简单处理——此部分为只读。

1. 如果尚未显示，则展示 `ax hooks summary --since=7 --tail=20` 中最常见的 hook。

2. 如果某个 hook 持续阻断，请询问：*"要检查最近的一次
   调用吗？"* 然后运行
   `ax hooks invocations --command="<hook>" --tail=5` 并呈现结果。

3. 对已知反馈案例进行回测：

   ```bash
   ax hooks cases enforce-worktree --tail=50 --window=3
   ```

   将每个回测结果视为一种案例类型。报告通过/失败/
   无法确定的数量。

4. 解释：
   - 阻断型 hook 错误并不一定是坏事。如果接下来几次
     agent 操作表现出行为已得到纠正，那么它就是有用的纠正
     信号。
   - 成功执行的 hook 也不一定有用。应关注后续
     行为变化。
   - 如果 `hook_progress` 之后没有最终的成功/阻断事件，则属于
     遥测缺口，除非它与可见行为相关联。
   - 相比模型判断，应优先采用确定性回测。
   - 要根据反复出现的失败编写新的防护规则：运行 `ax hooks init`，在 `~/.ax/hooks/` 中编写一个 `defineHook` hook，使用 `ax hooks backtest` 针对历史记录进行回测，然后运行 `ax hooks install --providers=claude,codex`。

### 步骤 5 - 收尾

输出一段摘要：
- 数量：已接受 / 已拒绝 / 已跳过 / 已锁定 verdict。
- 仍需完善的所有已搭建 SKILL.md 文件。
- 建议下次进行复盘的时间。计算方式：在已接受但未锁定的
  experiment 中取最早的 `experiment.created_at + 7d`，
  格式为“建议下次复盘时间为 YYYY-MM-DD”。

然后询问用户是否要提交已搭建的 skill 文件和
proposal 状态变更（DB 位于本地，但 SKILL.md 文件存储在磁盘上，
可能需要纳入版本控制）。

## 如何跟踪反馈

复盘本身会产生 experiment 循环已能捕获的持久化信号：

- **按形式统计的接受率**——会话结束后，根据
  `proposal.status` 推导。如果 skill 形式的接受率为 80%，但 guidance 的
  拒绝率为 80%，则说明 derive-proposals 阶段对错误形式的生成
  过于激进。将其作为观察结果指出。
- **拒绝原因**——`proposal.reject_reason` 是一个自由文本语料库。
  会话结束后运行：

  ```bash
  ax improve list --status=rejected --json | jq '.[].reject_reason'
  ```

  查找重复出现的短语（“duplicate of existing hook”）。当某种
  模式出现时，derive-proposals 阶段应针对该模式进行去重
  ——告知用户。
- **意外的 verdict**——当用户覆盖建议的 verdict 时，
  记录下来。反复覆盖意味着 verdict 计算存在偏差。

这些是观察结果，而非操作。在收尾时报告；不要
写入 insight 表。

## Claude 调用的 CLI 参考

```bash
ax improve list [--form=skill|subagent|hook|guidance|automation] \
                [--status=open|accepted|rejected|superseded|all] [--json]
ax improve show <dedupe_sig> [--json]
ax improve accept <dedupe_sig> [--force]
ax improve reject <dedupe_sig> --reason "<text>"
ax improve verdict [<dedupe_sig>] [--set <verdict>] [--json]
ax improve checkpoint [--force]
ax improve reset --yes                     # destructive; only when user requests

ax retro pending [--since=N] [--idle-min=N] [--json]   # Step 0 backlog
ax retro brief --session=<id> [--out-dir=<path>] [--json]
ax retro emit --session=<id> [--source=<src>] [--from-file=<json>]
ax retro list [--since=N] [--limit=N] [--json]

ax hooks summary [--since=N] [--tail=N]
ax hooks invocations [--command="<name>"] [--tail=N]
ax hooks cases <case-name> [--tail=N] [--window=N]
```

在 `accept` 中使用 `--force` 会覆盖现有的 SKILL.md 脚手架。仅当
用户明确要求时使用。

`reset --yes` 会清除所有提案/实验/检查点状态。在本次会话中，未经用户明确确认
绝不要运行。

## 失败模式

- `ax improve list` 返回空结果 → 运行一次 `ax ingest --derive-only`，
  然后重试。如果仍为空，则确实缺乏证据；请告知用户。
- `ax improve accept` 报告 `scaffold_exists` → 询问用户是要使用
  `--force`，还是放弃。
- `ax improve verdict --set` 报告 `verdict_locked` → 该实验
  已经定案；显示已锁定的值，然后继续。
- `ax hooks summary` 未返回任何内容 → 使用 `--since=30` 重试；如果
  仍为空，则钩子遥测流水线处于空闲状态，将其列为待办事项。
- 读取/查询错误 → 告知用户检查 `docs/development.md#setup`
  (`AX_DUCKDB_DYLIB`)。

## 反模式

- 不要直接输出原始 JSON。应以摘要形式呈现。
- 不要在批处理中为每个未处理的提案运行 `ax improve accept`；用户
  必须逐行确认。
- 不要直接写入 `~/.claude/skills/`。应由 CLI 处理。
- 不要提议在复盘过程中删除已搭建脚手架的 SKILL.md；那是
  一项单独的清理任务。
- 不要根据钩子分析结果自动实施实验。只提供建议；
  由用户决定并提交。