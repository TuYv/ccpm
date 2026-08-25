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

`aoe` 可在 tmux 中创建、管理和监控 AI 编程代理会话（Claude Code、Codex、OpenCode 及其他工具）。每个会话都是一个代理进程，具有 ID、标题、工具、项目路径和实时状态。凡是涉及编程代理的工作，都应使用 `aoe` 而不是直接使用 `tmux` 命令：它可以跟踪状态、捕获输出、管理用于并行分支的 git worktree，并将会话组织到组和配置文件中。

## 使用场景

- 在项目目录中启动一个或多个 AI 编程代理。
- 监控代理进度（等待中、运行中或空闲）。
- 捕获代理输出以供审查。
- 将代理组织到组或配置文件中。
- 设置基于并行 worktree 的开发环境。

**不要用于：** 与编程代理无关的一般 tmux 窗口/窗格管理。

## 要求

`aoe` 和 `tmux` 二进制文件必须位于 `PATH` 中，并且命令通过 shell 运行。请从 https://github.com/agent-of-empires/agent-of-empires 安装 aoe。

## 核心概念

- **会话**：运行在 tmux 会话中的代理进程。每个会话都有 ID、标题、工具（例如 `claude`）和项目路径。
- **组**：用于组织会话的命名文件夹（支持使用 `/` 嵌套，例如 `backend/api`）。
- **配置文件**：拥有独立会话和配置的独立工作区。全局使用 `-p <name>`，或设置 `AGENT_OF_EMPIRES_PROFILE`。
- **状态**：以下状态之一：`running`、`waiting`、`idle`、`stopped`、`error`、`starting`、`unknown`。

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

当 `command` 为空时会省略该字段；只有对于基于 worktree 的会话才会出现 `worktree`。`state` 的值为 `live`、`archived` 或 `trashed`；`trashed_at` 和 `archived_at` 分别独立设置，移入回收站不会更改 `archived_at`，因此归档后再移入回收站的会话会同时包含这两个键，并报告为 `trashed`。这两个时间戳都不是持久性的，但它们的清除方式不同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除（`aoe send`，以及发送唤醒消息时的 `aoe session restart`）；`trashed_at` 只有通过 `aoe session restore` 才会清除。应根据 `state` 判断，而不要缓存时间戳。移入回收站的会话仍会保留在列表中，并保留其标题，因此在将某行视为活动会话之前，请先检查 `state`。`list --json` 不包含实时状态：请使用 `aoe status --json` 或 `aoe session capture --json` 获取实时状态。

`snoozed_until` 和 `pinned_at` 共同构成 REST API 暴露的四个状态时间戳中的另外两个：只要会话被固定到 Web 侧边栏中，就会出现 `pinned_at`；而 `snoozed_until` 仅在暂停仍处于活动状态时出现（这是 API 自身的门控机制），因此过期的截止时间会省略该键，而不是显示一个已经结束的暂停状态。这两个字段都独立于 `state`，既没有这两个标记的行也不会出现其中任何一个键。`snoozed_until` 也更容易被清除，比其他同类字段更频繁：唤醒会话（`aoe send`）、归档、添加收藏、取消暂停或固定会话，都会使其在下一次读取时被移除，因此应将缺少该键视为当前没有活动暂停，而不是列表缺失。

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

`parent_session_id` 仅对子会话包含。`state` 的取值为 `live`、`archived` 或 `trashed`，与 `aoe list --json` 使用的词汇相同；`trashed_at` 和 `archived_at` 独立设置，而移入垃圾箱会特意保留 `archived_at`，因此一个先归档后移入垃圾箱的会话会同时携带这两个键，并报告为 `trashed`。这两个时间戳都不是持久状态，且清除方式也不相同：`archived_at` 会由 `aoe session unarchive`、`aoe session favorite` 以及任何会唤醒会话的操作清除，这意味着在发送唤醒消息时，`aoe send` 和 `aoe session restart` 都会清除它（当 `session.restart_wake_message` 被设置为空字符串时，不会发送唤醒消息，归档状态也会在重启后保留）。`trashed_at` 仅由 `aoe session restore` 清除。应读取当前的 `state`，而不是缓存时间戳；`status` 是窗格的实时状态，不携带该时间戳，因为已归档的会话仍可能处于运行状态。

这里适用的仍是与 `aoe list --json` 中相同的两个键：只要会话被固定到 Web 侧边栏中，就会出现 `pinned_at`；`snoozed_until` 仅在暂停仍处于活动状态时出现。

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

当从 aoe 管理的 tmux 会话中调用时，可以省略标识符：

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

## Worktree

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

### 并行 Worktree 代理

```bash
aoe add . -t "issue-100" -w fix/issue-100 -l
aoe add . -t "issue-101" -w fix/issue-101 -l
aoe add . -t "issue-102" -w fix/issue-102 -l
aoe status --json   # check all at once
```

### 监控循环

轮询所有会话，直到没有会话处于运行中或等待中：

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

1. **以为 `aoe list --json` 会携带实时状态。** 它不会。其字段是静态会话元数据（`path`、`group`、`tool`、`command` 等）。如需获取状态，请调用 `aoe status --json` 或 `aoe session capture --json`。
2. **使用原始 `tmux` 启动或停止代理。** 这样会绕过 aoe 的跟踪机制，导致会话的状态和元数据过时。始终使用 `aoe session start/stop/restart`。
3. **忘记使用 `-l`/`--launch`。** `aoe add` 会创建会话，但除非传入 `-l`，否则不会启动会话。
4. **在错误的配置文件下运行。** 会话受配置文件作用域限制；编写脚本时请使用 `-p <name>` 或设置 `AGENT_OF_EMPIRES_PROFILE`，并使用 `aoe list --all` 查看全部内容。

## 验证清单

- [ ] `aoe` 和 `tmux` 位于 `PATH` 中。
- [ ] `aoe add` 之后已执行启动操作（`-l`）或显式执行 `aoe session start`。
- [ ] JSON 解析读取的是 `path`/`group`（而不是 `project_path`/`group_path`），并且从 `aoe status`/`aoe session capture` 获取状态，而不是从 `aoe list` 获取。
- [ ] 脚本化轮询会在 `running` 和 `waiting` 均达到 0 时退出。