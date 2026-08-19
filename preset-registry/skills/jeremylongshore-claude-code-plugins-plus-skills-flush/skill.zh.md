---
name: flush
description: |
  Use when the user wants to manually flush a deferred-commit queue from a prior or interrupted chain. Reads .hyperflow/commits-queue/manifest.json, fast-forwards the staging branch onto the user's branch, deletes staging, clears the queue. Recovery interface when a chain crashed before its Step 4 auto-flush ran.
  Trigger with /hyperflow:flush, "flush pending commits", "flush queue", "apply staged commits", "where are my commits".
allowed-tools: Read, Bash(git:*), Bash(ls:*), Bash(cat:*), Bash(rm:*), Bash(bash:*), Bash(scripts/*:*)
argument-hint: "[--dry-run]"
version: 4.12.7
license: MIT
compatibility: Designed for Claude Code
tags: [git, deferred-commits, recovery, lifecycle]
---
# Flush

手动刷新在使用 `commit-when=end` 运行的链中延迟提交的队列。通常，`/hyperflow:dispatch` 会在其第 4 步收尾时调用 `scripts/flush-commits.sh`；此 skill 用于处理链在自动刷新运行前被中断（崩溃、终止、上下文丢失）的情况。

## 子命令

| 子命令 | 描述 |
|---|---|
| (无参数) | 运行 `scripts/flush-commits.sh <project-root>` —— 将 staging 快进合并到用户分支，删除 staging，清空队列 |
| `--dry-run` | 显示将要刷新的内容但不实际执行。按顺序列出队列中的提交。 |

## 刷新的内容

`.hyperflow/commits-queue/manifest.json` 跟踪链的 `user_branch`、`staging_branch`（始终为 `hyperflow/staging-<chain-id>`）以及包含 SHA 和消息的待处理提交列表。刷新通过 `git merge --ff-only` 重放这些提交，因此：

- 所有 N 个提交都会进入用户分支，并保留原始 SHA
- 顺序按时间先后排列（入队时间顺序）
- 保留原始提交消息
- 保留原始文件到消息的映射（每个提交只修改其子任务修改过的文件）

## 无法快进合并时的处理

如果用户分支与 staging 发生了分叉（例如，用户在链运行期间手动提交到了同一分支），`git merge --ff-only` 会拒绝执行。该 skill 会显示错误，并提供两个恢复选项：

1. `git rebase hyperflow/staging-<chain-id>` —— 将 staging 提交重放到用户的新提交之上
2. `git cherry-pick <staging-base>..hyperflow/staging-<chain-id>` —— 有选择地挑选提交

staging 分支会保留，以便用户手动处理。队列清单也会保留，因此用户解决分叉后，未来可以再次运行 `/hyperflow:flush` 进行重试。

## 流程

1. 检查 `.hyperflow/commits-queue/manifest.json` 是否存在。如果不存在，则打印 `No queue to flush.` 并停止。
2. 运行 `bash $PLUGIN_ROOT/scripts/flush-commits.sh $PROJECT_ROOT [--dry-run]`。
3. 原样打印脚本的输出。

## 概述

`/hyperflow:flush` 是面向用户的延迟提交刷新机制入口。大多数用户从不需要显式调用它——`/hyperflow:dispatch` 的第 4 步收尾会自动运行相同的脚本。此 skill 用于恢复：如果链使用 `commit-when=end` 运行并在收尾前崩溃，队列会持久化在磁盘上，用户之后可以将其刷新。

## 前置条件

- `.hyperflow/commits-queue/manifest.json` 来自之前一次使用 `commit-when=end` 运行的链。
- Git 仓库位于一个可以检出清单中 `user_branch` 字段所指定分支的状态。
- 插件安装中提供 `scripts/flush-commits.sh`。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| 不存在清单文件 | 打印 `No queue to flush.` 并以状态码 0 退出。 |
| staging 分支缺失（手动删除或重命名） | 打印警告；清除过期清单。以状态码 0 退出。 |
| 无法快进合并（用户分支发生分叉） | 显示 git 错误及恢复建议（rebase / cherry-pick）。保留 staging 分支和清单，以便手动处理。以非零状态码退出。 |
| 用户位于清单中 `user_branch` 以外的分支 | 自动检出清单中的 `user_branch`；如果检出失败，则显示错误。 |

## 示例

### 刷出前进行试运行

```
/hyperflow:flush --dry-run

flush-commits (DRY RUN): would fast-forward 7 commits from hyperflow/staging-2026-05-17-1430 onto feat/auth-refactor
abc1234 feat(auth): T7 wire login handler
def5678 feat(auth): T6 add session middleware
…
```

### 崩溃后恢复

```
You: /hyperflow:flush

flush-commits: flushed 7 commits onto feat/auth-refactor
abc1234 feat(auth): T7 wire login handler
…
```

## 资源

- [`scripts/flush-commits.sh`](../../scripts/flush-commits.sh) — 实际的刷出机制。
- [`scripts/queue-commit.sh`](../../scripts/queue-commit.sh) — 链式执行期间由调度调用的队列写入端。
- [DOCTRINE.md 第 8 层](../hyperflow/DOCTRINE.md#layer-8-git-workflow) — `commit-when` 时机规则。