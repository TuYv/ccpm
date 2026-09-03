---
name: coding-agent
description: 'Delegate coding tasks to external coding agents (Claude Code, Codex, Pi, OpenCode) via shell. Use when: (1) building new features or apps in a separate project, (2) reviewing PRs, (3) refactoring large codebases, (4) iterative coding that needs file exploration. NOT for: simple one-liner fixes (just edit directly), reading code (use read/file tools), or work inside the SwarmClaw workspace itself.'
metadata:
  {
    "openclaw": { "emoji": "🧩", "requires": { "anyBins": ["claude", "codex", "opencode", "pi"] } },
  }
---
# 编码代理

通过 shell 工具将编码任务委托给外部编码代理。

## 代理执行模式

### Claude Code（推荐）

使用 `--print --permission-mode bypassPermissions` 进行非交互式执行：

```bash
cd /path/to/project && claude --permission-mode bypassPermissions --print 'Your task here'
```

如需后台执行，请使用 shell 工具的后台模式。

**切勿对 Claude Code 使用 PTY 模式** —— `--print` 模式可保留完整的工具访问权限，并避免交互式确认对话框。

### Codex

Codex 需要 git 仓库和 PTY 模式：

```bash
# Quick one-shot (auto-approves changes)
cd /path/to/project && codex exec --full-auto 'Build a dark mode toggle'

# Codex refuses to run outside a git directory. For scratch work:
SCRATCH=$(mktemp -d) && cd $SCRATCH && git init && codex exec "Your prompt"
```

### Pi Coding Agent

```bash
# Install: npm install -g @mariozechner/pi-coding-agent
cd /path/to/project && pi 'Your task'

# Non-interactive mode
pi -p 'Summarize src/'

# Different provider/model
pi --provider openai --model gpt-4o-mini -p 'Your task'
```

### OpenCode

```bash
cd /path/to/project && opencode run 'Your task'
```

## PR 审查

克隆到临时文件夹或使用 git worktree —— 切勿在 SwarmClaw 项目目录中审查 PR：

```bash
# Clone to temp for safe review
REVIEW_DIR=$(mktemp -d)
git clone https://github.com/user/repo.git $REVIEW_DIR
cd $REVIEW_DIR && gh pr checkout 130
codex review --base origin/main

# Or use git worktree
git worktree add /tmp/pr-130-review pr-130-branch
cd /tmp/pr-130-review && codex review --base main
```

## 并行修复问题

使用 git worktree 并行修复多个问题：

```bash
# Create worktrees
git worktree add -b fix/issue-78 /tmp/issue-78 main
git worktree add -b fix/issue-99 /tmp/issue-99 main

# Launch agents (use background shell execution)
cd /tmp/issue-78 && codex --yolo 'Fix issue #78: <description>. Commit when done.'
cd /tmp/issue-99 && codex --yolo 'Fix issue #99: <description>. Commit when done.'

# Create PRs after
cd /tmp/issue-78 && git push -u origin fix/issue-78
gh pr create --repo user/repo --head fix/issue-78 --title "fix: ..." --body "..."

# Cleanup
git worktree remove /tmp/issue-78
git worktree remove /tmp/issue-99
```

## 规则

1. **为每个代理使用正确的执行模式**：Claude Code 使用 `--print`（无 PTY）；Codex/Pi/OpenCode 可能需要交互式终端。
2. **尊重工具选择** —— 如果用户要求使用 Codex，就使用 Codex。不要悄悄更换代理。
3. **保持耐心** —— 不要因为会话看起来慢就终止它们。
4. **监控进度** —— 定期检查输出，但不要干扰。
5. **切勿在 SwarmClaw 项目目录内运行编码代理** —— 请使用单独的项目目录或临时文件夹。

## 进度更新

在后台启动编码代理时：

- 启动时发送一条简短的消息（正在运行什么、在哪里运行）。
- 仅在有变化时更新（里程碑、错误、完成）。
- 如果终止了某个会话，请立即说明并解释原因。
