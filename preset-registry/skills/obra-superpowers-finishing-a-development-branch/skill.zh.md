---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work
---
# 完成开发分支

## 概览

**核心原则：** 验证测试 → 检测环境 → 展示选项 → 执行选择 → 清理。

**开始时公告：** "我正在使用 finishing-a-development-branch skill 来完成这项工作。"

## 步骤 1：验证测试

运行项目的完整测试套件（`npm test` / `cargo test` / `pytest` / `go test ./...`）。

**如果测试失败**，报告失败情况并停止——菜单在测试通过后才出现：

```
Tests failing (<N> failures). Must fix before completing:

[Show failures]
```

**如果测试通过：** 继续执行步骤 2。

## 步骤 2：检测环境

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
# Capture now, while still inside the workspace — Step 5 changes directory
# before cleanup (Step 6) needs this value
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

这决定了要显示哪个菜单以及清理方式：

| 状态 | 菜单 | 清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 3 个选项 | 无需清理工作树 |
| `GIT_DIR != GIT_COMMON`，有名分支 | 标准 3 个选项 | 基于来源（见第 6 步） |
| `GIT_DIR != GIT_COMMON`，分离 HEAD | 缩减的 2 个选项（无合并）| 外部管理——保持原位 |

## 步骤 3：确定基础分支

基础分支是这次工作从哪里分叉出来的——通常在计划中、对话中或分支的上游中命名。如果尚未明确，提问：
"This branch split from <your best guess> - is that correct?"
确认后再合并：合并到错误的基础分支会导致很高的回滚成本。

## 步骤 4：展示选项

**普通仓库和有名分支工作树——仅展示以下 3 个选项：**

```txt
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)

Which option?
```

**分离 HEAD——仅展示以下 2 个选项：**

```txt
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)

Which option?
```

请按原样展示菜单——简洁明了，每个选项都来自上方列表。只有在你的
人类协作者明确要求时才会丢弃工作（见下文“如果你的协作者要求丢弃工作”）。等待他们的回复；集成决策由他们来做。

## 步骤 5：执行选择

### 选项 1：本地合并

```bash
# Get main repo root for CWD safety
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge first — verify success before removing anything
git checkout <base-branch>
git pull
git merge <feature-branch>

# Verify tests on merged result
<test command>
```

如果合并结果测试失败：停止，保留工作树和分支在原位并进行排查——尚未推送任何内容，因此该合并是本地可恢复的。

一旦合并结果通过：先清理工作树（步骤 6），然后删除分支：

```bash
git branch -d <feature-branch>
```

### 选项 2：推送并创建 PR

```bash
git push -u origin <feature-branch>
# From a detached HEAD, name the new branch on the remote:
# git push origin HEAD:refs/heads/<new-branch>
```

然后使用平台工具在 <base-branch> 上创建 pull/merge request——如果可用则使用其 CLI，或使用你推送时平台通常给出的创建 URL——并按仓库的 PR 模板和约定（如果有）进行操作，再将 URL 报告给你的协作者。

保留工作树——你的协作者会在该工作树内处理 PR 反馈。

### 选项 3：保持原状

报告： "Keeping branch <name>. Worktree preserved at <path>."

### 如果你的协作者要求丢弃工作

该路径只在你收到明确“丢弃工作”请求后才出现。先确认：

```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

等待该精确确认词。确认后执行：

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后清理工作树（步骤 6）并强制删除分支：

```bash
git branch -D <feature-branch>
```

## 步骤 6：清理工作区

**适用于选项 1 和已确认丢弃。** 选项 2 和 3 始终保留工作树。两个调用方都已切换到主仓库根目录——工作树移除必须在工作树外执行——并使用第 2 步中在该目录切换之前捕获的 `GIT_DIR`/`GIT_COMMON`/`WORKTREE_PATH` 值。

**如果 `GIT_DIR == GIT_COMMON`：** 普通仓库，无工作树可清理。完成。

**如果 `WORKTREE_PATH` 位于 `.worktrees/` 或 `worktrees/` 下：** Superpowers 创建了该工作树——我们负责清理：

```bash
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**如果移除被拒绝**（`contains modified or untracked files`）：该工作树包含其他地方不存在的文件——未提交的计划、笔记或草稿内容。不要自行使用 `--force`。告诉你的协作者当前风险并询问：

```bash
git -C "$WORKTREE_PATH" status --porcelain -uall
```

```bash
Worktree removal refused — these files were never committed:

<file list>

1. Commit them to <branch> before cleanup
2. Move them into <main repo root>
3. Delete them (unrecoverable)

Which?
```

执行对应选择后，再移除工作树。

**否则：** 主机环境拥有该工作区——保留不变。如果你的平台提供工作区退出工具，请使用该工具。

## 快速参考

| 选项 | 合并 | 推送 | 保留工作树 | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持原状 | - | - | 是 | - |
| 丢弃（仅限明确请求） | - | - | - | 是（强制） |

## 常见借口与现实

| 借口 | 现实 |
|--------|---------|
| "Tests passed earlier this session" | 在将要集成的树上运行测试。通过一次运行只能证明该树是通过的。 |
| "They obviously want it merged" | 集成由你的协作者决定。展示菜单并等待。 |
| "They seem done with this feature — I'll offer to discard it" | 菜单按原样展示。仅当你的协作者明确提出时才丢弃。 |
| "'Yeah, get rid of it' counts as confirmation" | 仅输入单词 `discard` 才授权删除。 |
| "The PR is up, so the worktree is clutter now" | PR 反馈会在该工作树内修复。在代码落地前，工作树保留。 |
| "This other worktree looks stale — I'll clean it too" | 只清理 `.worktrees/` 或 `worktrees/` 下的工作树。其他全部属于主机。 |
| "Removal refused — `--force` is just finishing the cleanup" | 拒绝意味着文件仅存在于该工作树中。使用 `--force` 会永久销毁它们。先告知协作者并征得确认。 |
| "The merged-result failure is probably flaky" | 合并后失败会中止整个流程。分支和工作树保持原位以便排查。 |
| "The base branch is obviously main" | 确认分叉点或先提问。合并到错误的基础分支代价很高。 |
| "The push was rejected — force-push will fix it" | 推送被拒绝说明远端有更新。需要排查；只有在协作者明确要求时才执行 force-push。 |
