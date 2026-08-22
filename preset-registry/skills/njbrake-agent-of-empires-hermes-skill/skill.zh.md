---
name: aoe
description: Use when launching, monitoring, or controlling AI coding agents (Claude Code, Codex, OpenCode, etc.) in tmux via Agent of Empires (aoe). Covers creating sessions, capturing agent output, running parallel worktree agents, and organizing work into groups and profiles. Prefer aoe over raw tmux for agent management.
version: 1.0.0
author: njbrake (Agent of Empires)
license: MIT
metadata:
  hermes:
    tags: [coding-agents, tmux, orchestration, sessions, worktrees, automation]
    related_skills: [subagent-driven-development]
---
# Agent of Empires (aoe)

## 概述

`aoe` 在 tmux 中创建、管理和监控 AI 编码代理会话（Claude Code、Codex、OpenCode 等）。每个会话都是一个代理进程，具有 ID、标题、工具、项目路径和实时状态。只要工作与编码代理有关，就应使用 `aoe`，而不是直接使用 `tmux` 命令：它可以跟踪状态、捕获输出、管理用于并行分支的 git worktree，并将会话组织到组和配置文件中。

## 使用场景

- 在项目目录中启动一个或多个 AI 编码代理。
- 监控代理进度（等待、运行或空闲）。
- 捕获代理输出以供审查。
- 将代理组织到组或配置文件中。
- 设置基于并行 worktree 的开发环境。

**不要用于：**与编码代理无关的常规 tmux 窗口/窗格管理。

## 要求

`aoe` 和 `tmux` 二进制文件必须位于 `PATH` 中，并且命令需通过 shell 运行。从 https://github.com/agent-of-empires/agent-of-empires 安装 aoe。

## 核心概念

- **会话**：在 tmux 会话中运行的代理进程。每个会话都有 ID、标题、工具（例如 `claude`）和项目路径。
- **组**：用于组织会话的命名文件夹（支持使用 `/` 嵌套，例如 `backend/api`）。
- **配置文件**：具有独立会话和配置的单独工作区。全局使用 `-p <name>`，或设置 `AGENT_OF_EMPIRES_PROFILE`。
- **状态**：`running`、`waiting`、`idle`、`stopped`、`error`、`starting`、`unknown` 之一。

## 添加会话

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

## 列出会话

```bash
aoe list              # human-readable
aoe list --json       # JSON for parsing
aoe list --all        # across all profiles
aoe list --json --state=live   # skip trashed and archived rows
```

**JSON 结构**（`aoe list --json`）：
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

当为空时，`command` 会被省略；`worktree` 仅出现在由 worktree 支持的会话中。`state` 为 `live`、`archived` 或 `trashed`；`trashed_at` 和 `archived_at` 独立设置，并且移入回收站不会影响 `archived_at`，因此先归档再移入回收站的会话会同时包含这两个键，并报告为 `trashed`。这两个时间戳都不是持久的，但它们的清除方式不同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除（`aoe send`，以及发送唤醒消息时的 `aoe session restart`），而 `trashed_at` 仅由 `aoe session restore` 清除。应根据 `state` 进行判断，而不是缓存时间戳。移入回收站的会话仍会保留在列表中并保留其标题，因此在将某一行视为实时会话之前，请检查 `state`。`list --json` 不包含实时状态：请使用 `aoe status --json` 或 `aoe session capture --json` 获取该信息。

## 会话生命周期

```bash
aoe session start <id-or-title>
aoe session stop <id-or-title>
aoe session restart <id-or-title>
aoe session attach <id-or-title>   # interactive attach
```

## 检查会话

```bash
# Session metadata
aoe session show <id-or-title> --json

# Capture tmux pane content (key for monitoring)
aoe session capture <id-or-title> --json
aoe session capture <id-or-title> -n 100 --strip-ansi
aoe session capture <id-or-title>   # plain text, good for piping

# Quick status summary
aoe status --json
aoe status -q   # just the waiting count (for scripting)
```

**JSON 结构**（`aoe session capture --json`）：
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

**JSON 结构**（`aoe session show --json`）：
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

`parent_session_id` 仅包含在子会话中。`state` 的值为 `live`、`archived` 或 `trashed`，与 `aoe list --json` 使用的词汇相同；`trashed_at` 和 `archived_at` 独立设置，并且移入回收站时会有意保留 `archived_at`，因此，先归档再移入回收站的会话会同时包含这两个键，并报告为 `trashed`。两个时间戳都不是持久化的，且清除方式不同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除，这意味着 `aoe send` 和 `aoe session restart` 在发送唤醒消息时也会清除它（当 `session.restart_wake_message` 设置为空字符串时，不会发送唤醒消息，归档状态会在重启后保留）。`trashed_at` 只能由 `aoe session restore` 清除。应读取当前的 `state`，而不是缓存时间戳；`status` 表示窗格的实时状态，不包含会话状态，因为已归档的会话仍可能处于运行中。

**JSON 结构**（`aoe status --json`）：
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

## 重命名和组织

```bash
aoe session rename <id> -t "new title"
aoe session rename <id> -g "new/group"

aoe group create mygroup
aoe group move <id-or-title> mygroup
aoe group list --json
aoe group delete mygroup --force
```

## 配置文件

```bash
aoe profile list
aoe profile create staging
aoe profile delete staging
aoe profile default staging   # set default
aoe -p staging list           # use inline
```

## 工作树

```bash
aoe worktree list
aoe worktree info <id-or-title>
aoe worktree cleanup -f
```

## 移除会话

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

轮询所有会话，直到没有会话处于运行或等待状态：

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

## 常见陷阱

1. **期望 `aoe list --json` 提供实时状态。** 它并不提供。其字段是静态会话元数据（`path`、`group`、`tool`、`command` 等）。如需获取状态，请调用 `aoe status --json` 或 `aoe session capture --json`。
2. **使用原始 `tmux` 命令启动或停止代理。** 这会绕过 aoe 的跟踪机制，导致会话状态和元数据过时。请始终使用 `aoe session start/stop/restart`。
3. **忘记添加 `-l`/`--launch`。** `aoe add` 会创建会话，但除非传入 `-l`，否则不会启动会话。
4. **在错误的配置文件中运行。** 会话的作用域限定于配置文件；编写脚本时请使用 `-p <name>` 或设置 `AGENT_OF_EMPIRES_PROFILE`，并使用 `aoe list --all` 查看所有内容。

## 验证清单

- [ ] `aoe` 和 `tmux` 位于 `PATH` 中。
- [ ] 执行 `aoe add` 后使用了启动选项（`-l`），或显式执行了 `aoe session start`。
- [ ] JSON 解析读取 `path`/`group`（而不是 `project_path`/`group_path`），并从 `aoe status`/`aoe session capture` 而非 `aoe list` 获取状态。
- [ ] 脚本化轮询会在 `running` 和 `waiting` 均变为 0 时退出。