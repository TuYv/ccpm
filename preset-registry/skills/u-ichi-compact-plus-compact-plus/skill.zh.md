---
name: compact-plus
description: |
  Save the current Claude Code or Codex session state to a temporary state file before running /compact.
  MANDATORY TRIGGERS: /compact-plus, compact-plus, compact plus, compaction plus handoff, pre-compact state save.
  DO NOT TRIGGER: post-compact recovery, ordinary progress updates, plan creation, or casual context-usage discussion.
codex_description: |
  Save compact-plus working state for the current Codex thread. Use before /compact only; do not use for normal progress updates or post-compact recovery.
strict_procedure: true
argument-hint: "[recovery notes]"
allowed-tools: Bash, Read, Write, Edit, Grep
---
# compact-plus

在 Claude Code 和 Codex 中，当 `/compact` 运行时，PreCompact 钩子会自动保存压缩前的状态文件。本技能是一个用于生成更丰富恢复笔记的手动备用方案。

在执行 `/compact` 之前，将压缩摘要无法可靠保留的工作状态保存到特定于运行时的状态目录中。

## 严格流程画像

- 严格程度：strict-procedure。交付物为状态文件内容和完成回执。
- 硬性关卡：如果无法检测到会话 id，不要创建猜测的状态文件名。停止并报告会话 id 检测失败。
- 强制机制：先确定目标路径，然后回读已保存的文件，并验证所需标题确实存在。
- 完成回执：报告状态文件路径、主要已保存项、未验证项，以及运行 `/compact` 的指示。

## 流程

1. 获取会话 id。
   - 在 Claude Code 中使用 `$CLAUDE_CODE_SESSION_ID`。
   - 否则在 Codex 中使用 `$CODEX_THREAD_ID`。
   - `$CODEX_COMPANION_SESSION_ID` 是最终的兼容性回退方案。
   - 如果无法检测到，则不要创建状态文件。报告准备工作不完整，因为会话 id 不可用。
2. 设置目标位置。
   - Claude Code：`${TMPDIR:-/tmp}/claude-compact-state/${SESSION_ID}.md`。
   - Codex：`${TMPDIR:-/tmp}/codex-compact-state/${SESSION_ID}.md`。
3. 检查 TaskList、活跃计划文件、tmux-bridge 状态以及当前正在编辑的文件。
   - 如果存在活跃计划文件，读取 `~/.claude/plans/` 下的相关活跃计划文件。
   - 如果未使用 tmux-bridge，记录 `Not used`。
4. 按以下确切顺序将这些标题保存到状态文件中。

```markdown
# Compact Prep State
## Active Plan
## Current Phase
## TaskList Summary
## Session Decisions
## Constraints and Blockers
## Worker Topology
## Skills Invoked
## Editing Files
## Failed Attempts
## Recovery Notes
```

5. 保存后回读状态文件，并验证上述每个标题都存在。
6. 告知用户：`Preparation complete. Please run /compact.`

## 要保存的内容

- 活跃计划文件路径以及当前阶段或步骤。
- 进行中的任务列表和相关笔记。
- 会话期间做出的决策、用户选择，以及被否决的备选方案及其理由。
- 约束、阻碍因素和未完成的验证。
- Worker 拓扑。使用 tmux-bridge 时，记录窗格、角色和职责。
- 会话早期调用的技能和斜杠命令。这是调用记录，并不能证明该技能或命令当前处于活动状态。
- 正在编辑的文件，以及关于未保存或未验证工作的笔记。
- 不应重复的失败尝试、工具错误和被否决的做法。
- 供压缩后代理使用的恢复笔记。

## 完成回执

完成后包含以下内容：

- 状态文件路径。
- 主要已保存项。
- 未验证项及其原因。
- `Preparation complete. Please run /compact.`
