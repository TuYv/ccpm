---
name: aoe
description: Manage AI coding agent sessions via Agent of Empires (aoe)
metadata:
  openclaw:
    requires:
      bins:
        - aoe
        - tmux
    homepage: https://github.com/agent-of-empires/agent-of-empires
---
# Agent of Empires (aoe) 技能

使用 `aoe` 在 tmux 中创建、管理和监控 AI 编码代理会话（Claude Code、Codex、OpenCode 等）。管理代理时，优先使用 `aoe`，而不是直接使用 `tmux` 命令。

## 何时使用此技能

- 在项目目录中启动一个或多个 AI 编码代理
- 监控代理进度（等待、运行或空闲）
- 捕获代理输出以供审查
- 将代理组织到组或配置文件中
- 设置基于并行 worktree 的开发环境

不要将此技能用于与编码代理无关的常规 tmux 窗口/窗格管理。

## 核心概念

- **会话**：在 tmux 会话中运行的代理进程。每个会话都有一个 ID、标题、工具（例如 `claude`）和项目路径。
- **组**：用于组织会话的命名文件夹（支持使用 `/` 嵌套，例如 `backend/api`）。
- **配置文件**：拥有自身会话和配置的独立工作区。全局使用 `-p <name>`，或设置 `AGENT_OF_EMPIRES_PROFILE`。
- **状态**：`running`、`waiting`、`idle`、`stopped`、`error`、`starting`、`unknown` 之一。

## 命令参考

### 添加会话

```bash
# Add a session for the current directory
aoe add . -t "my feature"

# Add with group, launch immediately
aoe add /path/to/repo -t "API work" -g backend -l

# Add with specific tool
aoe add . -t "codex session" -c codex

# Add in a git worktree (parallel branch)
aoe add . -t "fix-123" -w fix/issue-123 -l

# Add in Docker sandbox
aoe add . -t "sandboxed" -s -l

# Add as sub-session of another
aoe add . -t "sub task" -P <parent-id>

# Enable YOLO mode (skip permission prompts)
aoe add . -t "yolo" -y -l
```

### 列出会话

```bash
# Human-readable list
aoe list

# JSON output for parsing
aoe list --json

# List across all profiles
aoe list --all

# Skip trashed and archived rows (default is every persisted session)
aoe list --json --state=live
```

**JSON 输出结构**（`aoe list --json`）：
```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "my feature",
    "path": "/home/user/project",
    "group": "backend",
    "tool": "claude",
    "command": "claude",
    "profile": "default",
    "state": "live",
    "created_at": "2025-01-01T00:00:00Z",
    "workspace_repos": []
  }
]
```

当为空时，会省略 `command`；`worktree` 仅出现在由 worktree 支持的会话中。`state` 的值为 `live`、`archived` 或 `trashed`；`trashed_at` 和 `archived_at` 独立设置，并且移入回收站不会影响 `archived_at`，因此，一个先归档后移入回收站的会话会同时包含这两个键，并报告为 `trashed`。两个时间戳都不是持久的，但其清除方式不同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除（包括 `aoe send`，以及发送唤醒消息时的 `aoe session restart`），而 `trashed_at` 只能由 `aoe session restore` 清除。应根据 `state` 进行判断，而不是缓存时间戳。移入回收站的会话会保留在列表中并保留其标题，因此，在将某一行视为活动会话之前，请检查 `state`。`list --json` 不包含实时状态；请使用 `aoe status --json` 或 `aoe session capture --json` 获取该状态。

### 会话生命周期

```bash
aoe session start <id-or-title>
aoe session stop <id-or-title>
aoe session restart <id-or-title>
aoe session attach <id-or-title>   # interactive attach
```

### 检查会话

```bash
# Show session metadata
aoe session show <id-or-title> --json

# Capture tmux pane content (key for monitoring)
aoe session capture <id-or-title> --json
aoe session capture <id-or-title> -n 100 --strip-ansi
aoe session capture <id-or-title>   # plain text, good for piping

# Quick status summary
aoe status --json
aoe status -q   # just the waiting count (for scripting)
```

**JSON 输出结构**（`aoe session capture --json`）：
```json
{
  "id": "a1b2c3d4-...",
  "title": "my feature",
  "status": "waiting",
  "tool": "claude",
  "content": "... pane text ...",
  "lines": 50
}
```

**JSON 输出结构**（`aoe session show --json`）：
```json
{
  "id": "a1b2c3d4-...",
  "title": "my feature",
  "path": "/home/user/project",
  "group": "backend",
  "tool": "claude",
  "command": "claude",
  "status": "running",
  "state": "live",
  "profile": "default"
}
```

`state` 的值为 `live`、`archived` 或 `trashed`，与 `aoe list --json` 使用的词汇相同；`trashed_at` 和 `archived_at` 是独立设置的，并且将会话移入回收站时会有意保留 `archived_at`，因此先归档再移入回收站的会话会同时带有这两个键，并报告为 `trashed`。两个时间戳都不是持久的，且其清除方式也不相同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除，这意味着 `aoe send` 和 `aoe session restart` 在发送唤醒消息时都会清除它（如果将 `session.restart_wake_message` 设置为空字符串，则不会发送唤醒消息，归档状态也会在重启后保留）。`trashed_at` 只能由 `aoe session restore` 清除。应读取当前的 `state`，而不是缓存时间戳；`status` 表示窗格的实时状态，并不包含会话状态，因为已归档的会话仍可能处于运行状态。

**JSON 输出结构**（`aoe status --json`）：
```json
{
  "waiting": 1,
  "running": 2,
  "idle": 1,
  "stopped": 1,
  "error": 0,
  "total": 5
}
```

### 自动检测（在 tmux 窗格内）

从 aoe 管理的 tmux 会话中调用时，可以省略标识符：

```bash
aoe session show          # auto-detects current session
aoe session capture       # auto-detects current session
aoe session current --json
```

### 重命名和整理

```bash
aoe session rename <id> -t "new title"
aoe session rename <id> -g "new/group"

aoe group create mygroup
aoe group move <id-or-title> mygroup
aoe group list --json
aoe group delete mygroup --force
```

### 配置文件

```bash
aoe profile list
aoe profile create staging
aoe profile delete staging
aoe profile default staging   # set default
aoe -p staging list            # use inline
```

### 工作树

```bash
aoe worktree list
aoe worktree info <id-or-title>
aoe worktree cleanup -f
```

### 删除会话

```bash
aoe remove <id-or-title>
aoe remove <id-or-title> --delete-worktree --force
```

## 工作流模式

### 单个代理

```bash
aoe add /path/to/repo -t "feature X" -l
# ... wait ...
aoe session capture "feature X" --json
```

### 并行工作树代理

```bash
aoe add . -t "issue-100" -w fix/issue-100 -l
aoe add . -t "issue-101" -w fix/issue-101 -l
aoe add . -t "issue-102" -w fix/issue-102 -l
aoe status --json   # check all at once
```

### 监控循环

轮询所有会话，直到没有会话正在运行：

```bash
while true; do
  status=$(aoe status --json)
  waiting=$(echo "$status" | jq '.waiting')
  running=$(echo "$status" | jq '.running')
  if [ "$running" -eq 0 ] && [ "$waiting" -eq 0 ]; then
    echo "All agents finished"
    break
  fi
  echo "Running: $running, Waiting: $waiting"
  sleep 30
done
```

### 捕获并审查

```bash
for id in $(aoe list --json | jq -r '.[].id'); do
  echo "=== $id ==="
  aoe session capture "$id" -n 100 --strip-ansi
  echo
done
```

### 通过 TUI 执行组操作

组主要通过 `aoe` TUI 进行管理（不带参数运行 `aoe`）。TUI 支持对组进行批量启动、停止和重启。对于脚本化工作流，请使用上述 CLI 命令。