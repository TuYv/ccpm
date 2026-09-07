---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---
# 完成开发分支

## 概述

通过呈现清晰的选项并处理所选的工作流，指导开发工作的收尾。

**核心原则：**验证测试 → 检测环境 → 呈现选项 → 执行选择 → 清理。

**开始时声明：**“我正在使用 finishing-a-development-branch 技能来完成这项工作。”

## 流程

### 第 1 步：验证测试

**在呈现选项之前，先验证测试通过：**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

停止。不要继续第 2 步。

**如果测试通过：**继续第 2 步。

### 第 2 步：检测环境

**在呈现选项之前，先确定工作区状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这将决定显示哪个菜单以及清理方式：

| 状态 | 菜单 | 清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 4 个选项 | 无需清理工作树 |
| `GIT_DIR != GIT_COMMON`，具名分支 | 标准 4 个选项 | 基于来源判断（见第 6 步） |
| `GIT_DIR != GIT_COMMON`，分离 HEAD | 精简为 3 个选项（无合并） | 无需清理（由外部管理） |

### 第 3 步：确定基础分支

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者询问：“这个分支是从 main 分出来的——对吗？”

### 第 4 步：呈现选项

**普通仓库和具名分支工作树——准确呈现以下 4 个选项：**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**分离 HEAD——准确呈现以下 3 个选项：**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**不要添加解释**——保持选项简洁。

### 第 5 步：执行选择

#### 选项 1：本地合并

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

# Only after merge succeeds: cleanup worktree (Step 6), then delete branch
```

然后：清理工作树（第 6 步），再删除分支：

```bash
git branch -d <feature-branch>
```

#### 选项 2：推送并创建 PR

```bash
# Push branch
git push -u origin <feature-branch>
```

**切勿清理工作树**——用户需要它继续存在，以便根据 PR 反馈进行迭代。

#### 选项 3：保持原样

报告：“保留分支 <name>。工作树保留在 <path>。”

**不要清理工作树。**

#### 选项 4：丢弃

**先确认：**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

等待确切的确认。

如果确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后：清理工作树（第 6 步），再强制删除分支：
```bash
git branch -D <feature-branch>
```

### 第 6 步：清理工作区

**仅对选项 1 和 4 执行。**选项 2 和 3 始终保留工作树。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：**普通仓库，没有需要清理的工作树。完成。

**如果工作树路径位于 `.worktrees/` 或 `worktrees/` 下：**这个工作树由 Superpowers 创建——清理工作由我们负责。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**否则：**此工作区由宿主环境（harness）拥有。切勿移除它。如果你的平台提供了退出工作区的工具，请使用它。否则，将工作区保留在原处。

## 快速参考

| 选项 | 合并 | 推送 | 保留工作树 | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持原样 | - | - | 是 | - |
| 4. 丢弃 | - | - | - | 是（强制） |

## 常见错误

**跳过测试验证**
- **问题：**合并损坏的代码，创建失败的 PR
- **解决：**在提供选项之前始终验证测试

**开放式问题**
- **问题：**“接下来我该做什么？”含义模糊
- **解决：**准确呈现 4 个结构化选项（分离 HEAD 时为 3 个）

**为选项 2 清理工作树**
- **问题：**移除了用户迭代 PR 所需的工作树
- **解决：**仅对选项 1 和 4 进行清理

**在移除工作树之前删除分支**
- **问题：**`git branch -d` 失败，因为工作树仍在引用该分支
- **解决：**先合并，再移除工作树，然后删除分支

**在工作树内部运行 git worktree remove**
- **问题：**当 CWD 位于被移除的工作树内部时，命令会静默失败
- **解决：**在 `git worktree remove` 之前始终 `cd` 到主仓库根目录

**清理 harness 所拥有的工作树**
- **问题：**移除 harness 创建的工作树会导致幽灵状态
- **解决：**只清理位于 `.worktrees/` 或 `worktrees/` 下的工作树

**丢弃前不加确认**
- **问题：**意外删除工作成果
- **解决：**要求用户键入 "discard" 进行确认

## 危险信号

**绝不：**
- 在测试失败的情况下继续
- 未对合并结果验证测试就合并
- 未经确认就删除工作成果
- 未经明确要求就强制推送
- 在确认合并成功之前移除工作树
- 清理并非由你创建的工作树（来源检查）
- 从工作树内部运行 `git worktree remove`

**始终：**
- 在提供选项之前验证测试
- 在呈现菜单之前检测环境
- 准确呈现 4 个选项（分离 HEAD 时为 3 个）
- 为选项 4 获取用户键入的确认
- 仅对选项 1 和 4 清理工作树
- 在移除工作树之前 `cd` 到主仓库根目录
- 在移除之后运行 `git worktree prune`
