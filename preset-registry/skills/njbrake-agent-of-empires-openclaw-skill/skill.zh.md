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

使用 `aoe` 在 tmux 中创建、管理和监控 AI 编码代理会话（Claude Code、Codex、OpenCode 等）。对于代理管理，优先使用 `aoe`，而不是直接使用 `tmux` 命令。

## 使用此技能的场景

- 在项目目录中启动一个或多个 AI 编码代理
- 监控代理进度（等待中 vs 运行中 vs 空闲）
- 捕获代理输出以供审查
- 将代理组织到组或配置文件中
- 设置基于并行 worktree 的开发

不要将此技能用于与编码代理无关的一般 tmux 窗口/窗格管理。

## 核心概念

- **Session**：在 tmux 会话中运行的代理进程。每个会话都有一个 ID、标题、工具（例如 `claude`）和项目路径。
- **Group**：用于组织会话的命名文件夹（支持使用 `/` 嵌套，例如 `backend/api`）。
- **Profile**：拥有独立会话和配置的独立工作区。全局使用 `-p <name>`，或设置 `AGENT_OF_EMPIRES_PROFILE`。
- **Status**：可取以下值之一：`running`、`waiting`、`idle`、`stopped`、`error`、`starting`、`unknown`。

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

**JSON output shape** (`aoe list --json`):
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

当 `command` 为空时会被省略；只有基于 worktree 的会话才会显示 `worktree`。`state` 的值为 `live`、`archived` 或 `trashed`；`trashed_at` 和 `archived_at` 独立设置，移入回收站不会改变 `archived_at`，因此一个先归档后移入回收站的会话会同时包含这两个键，并报告为 `trashed`。这两个时间戳都不是持久的，但它们的清除方式不同：`archived_at` 会被 `aoe session unarchive`、`aoe session favorite` 以及任何唤醒会话的操作清除（`aoe send`，以及发送唤醒消息时的 `aoe session restart`）；`trashed_at` 只有通过 `aoe session restore` 才会被清除。应根据 `state` 做判断，而不是缓存时间戳。移入回收站的会话仍会保留在列表中，并保留其标题，因此在将某行视为活动会话之前，请先检查 `state`。`list --json` 不包含实时状态；请使用 `aoe status --json` 或 `aoe session capture --json` 获取该状态。

`snoozed_until` 和 `pinned_at` 补足了 REST API 暴露的四个状态时间戳：只要会话被固定到 Web 侧边栏中，就会出现 `pinned_at`；而 `snoozed_until` 仅在 snooze 仍处于活动状态时出现（这是 API 自身的门控机制），因此已过期的截止时间会省略该键，而不是标示一个已经结束的 snooze。两者都独立于 `state`，既没有任何一个标记的行也不会出现这两个键。`snoozed_until` 也很容易被清除，比其他同类字段更频繁：唤醒会话（`aoe send`）、归档、收藏、取消 snooze 或固定操作，都会在下一次读取时移除它，因此应将缺少该键视为当前没有活动的 snooze，而不是列表缺项。

### 会话生命周期

```bash
aoe session start <id-or-title>
aoe session stop <id-or-title>
aoe session restart <id-or-title>
aoe session attach <id-or-title>   # 交互式附加
```

### 检查会话

```bash
# 显示会话元数据
aoe session show <id-or-title> --json

# 捕获 tmux 窗格内容（监控的关键）
aoe session capture <id-or-title> --json
aoe session capture <id-or-title> -n 100 --strip-ansi
aoe session capture <id-or-title>   # 纯文本，适合通过管道传递

# 快速状态摘要
aoe status --json
aoe status -q   # 仅显示等待数量（用于脚本）
```

**JSON 输出格式**（`aoe session capture --json`）：
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

**JSON 输出格式**（`aoe session show --json`）：
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

`state` 可以是 `live`、`archived` 或 `trashed`，与 `aoe list --json` 使用的词汇相同；`trashed_at` 和 `archived_at` 独立设置，而移入回收站会有意保留 `archived_at`，因此已归档后又移入回收站的会话会同时携带这两个键，并报告为 `trashed`。这两个时间戳都不是持久的，且清除方式并不相同：`archived_at` 会被 `aoe session unarchive`、`aoe session favorite` 以及任何会唤醒会话的操作清除；这意味着当 `session.restart_wake_message` 设置为非空字符串时，`aoe send` 和 `aoe session restart` 发送唤醒消息后也会清除它（当 `session.restart_wake_message` 设置为空字符串时，不会发送唤醒消息，归档状态会在重启后保留）。`trashed_at` 仅由 `aoe session restore` 清除。应读取当前的 `state`，而不是缓存时间戳；`status` 是窗格的实时状态，不携带该信息，因为已归档的会话仍可能处于运行状态。

这里同样适用与 `aoe list --json` 中相同的两个键：只要会话被固定到 Web 侧边栏中，就会出现 `pinned_at`；`snoozed_until` 仅在 snooze 仍处于活动状态时出现。

**JSON 输出格式**（`aoe status --json`）：
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

当从 aoe 管理的 tmux 会话中调用时，可以省略 identifier：

```bash
aoe session show          # auto-detects current session
aoe session capture       # auto-detects current session
aoe session current --json
```

### 重命名和组织

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

### Worktree

```bash
aoe worktree list
aoe worktree info <id-or-title>
aoe worktree cleanup -f
```

### 移除会话

```bash
aoe remove <id-or-title>
aoe remove <id-or-title> --delete-worktree --force
```

## 工作流模式

### 单个 agent

```bash
aoe add /path/to/repo -t "feature X" -l
# ... wait ...
aoe session capture "feature X" --json
```

### 并行 worktree agent

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

### 捕获和审查

```bash
for id in $(aoe list --json | jq -r '.[].id'); do
  echo "=== $id ==="
  aoe session capture "$id" -n 100 --strip-ansi
  echo
done
```

### 通过 TUI 执行组操作

组主要通过 `aoe` TUI 进行管理（不带参数运行 `aoe`）。TUI 支持对组执行批量启动、停止和重启。对于脚本化工作流，请使用上面的 CLI 命令。