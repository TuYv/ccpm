---
name: git-advanced-workflows
description: Master advanced Git workflows including rebasing, cherry-picking, bisect, worktrees, and reflog to maintain clean history and recover from any situation. Use when managing complex Git histories, collaborating on feature branches, or troubleshooting repository issues.
---
# Git 高级工作流

掌握高级 Git 技巧，以保持干净的历史记录、高效协作，并自信地从任何情况中恢复。

## 何时使用此技能

- 合并前清理提交历史
- 跨分支应用特定提交
- 查找引入 bug 的提交
- 同时处理多个功能
- 从 Git 误操作或丢失的提交中恢复
- 管理复杂的分支工作流
- 准备干净的 PR 以供审查
- 同步已分叉的分支

## 核心概念

### 1. 交互式变基（Interactive Rebase）

交互式变基是编辑 Git 历史的瑞士军刀。

**常用操作：**

- `pick`：保持提交原样
- `reword`：修改提交信息
- `edit`：修改提交内容
- `squash`：与上一个提交合并
- `fixup`：类似 squash，但会丢弃提交信息
- `drop`：完全移除提交

**基本用法：**

```bash
# Rebase last 5 commits
git rebase -i HEAD~5

# Rebase all commits on current branch
git rebase -i $(git merge-base HEAD main)

# Rebase onto specific commit
git rebase -i abc123
```

### 2. 拣选提交（Cherry-Picking）

将一个分支上的特定提交应用到另一个分支，而无需合并整个分支。

```bash
# Cherry-pick single commit
git cherry-pick abc123

# Cherry-pick range of commits (exclusive start)
git cherry-pick abc123..def456

# Cherry-pick without committing (stage changes only)
git cherry-pick -n abc123

# Cherry-pick and edit commit message
git cherry-pick -e abc123
```

### 3. 二分查找（Git Bisect）

在提交历史中进行二分查找，以找出引入 bug 的提交。

```bash
# Start bisect
git bisect start

# Mark current commit as bad
git bisect bad

# Mark known good commit
git bisect good v1.0.0

# Git will checkout middle commit - test it
# Then mark as good or bad
git bisect good  # or: git bisect bad

# Continue until bug found
# When done
git bisect reset
```

**自动化 Bisect：**

```bash
# Use script to test automatically
git bisect start HEAD v1.0.0
git bisect run ./test.sh

# test.sh should exit 0 for good, 1-127 (except 125) for bad
```

### 4. 工作树（Worktrees）

无需 stash 或切换分支，即可同时在多个分支上工作。

```bash
# List existing worktrees
git worktree list

# Add new worktree for feature branch
git worktree add ../project-feature feature/new-feature

# Add worktree and create new branch
git worktree add -b bugfix/urgent ../project-hotfix main

# Remove worktree
git worktree remove ../project-feature

# Prune stale worktrees
git worktree prune
```

### 5. 引用日志（Reflog）

你的安全网——追踪所有 ref 的变动，甚至包括已被删除的提交。

```bash
# View reflog
git reflog

# View reflog for specific branch
git reflog show feature/branch

# Restore deleted commit
git reflog
# Find commit hash
git checkout abc123
git branch recovered-branch

# Restore deleted branch
git reflog
git branch deleted-branch abc123
```

## 详细模式与实战示例

详细的模式文档位于 `references/details.md`。当上方的导航层级不够用时，请阅读该文件。

## 最佳实践

1. **始终使用 --force-with-lease**：比 --force 更安全，可防止覆盖他人的工作
2. **仅对本地提交进行变基**：不要变基已推送并共享的提交
3. **编写描述性的提交信息**：未来的你会感谢现在的你
4. **原子提交**：每个提交应只包含一个逻辑变更
5. **强推之前先测试**：确保重写历史没有破坏任何内容
6. **牢记 Reflog**：记住 reflog 是你为期 90 天的安全网
7. **高风险操作前先建分支**：在进行复杂变基之前创建备份分支

```bash
# Safe force push
git push --force-with-lease origin feature/branch

# Create backup before risky operation
git branch backup-branch
git rebase -i main
# If something goes wrong
git reset --hard backup-branch
```

## 常见陷阱

- **对公共分支进行变基**：会给协作者造成历史冲突
- **未使用 lease 的强推**：可能覆盖队友的工作
- **变基时丢失工作**：仔细解决冲突，变基后进行测试
- **忘记清理工作树**：孤立的工作树会占用磁盘空间
- **实验前未备份**：始终创建安全分支
- **在脏工作目录上执行 bisect**：先提交或 stash，再进行 bisect

## 恢复命令

```bash
# Abort operations in progress
git rebase --abort
git merge --abort
git cherry-pick --abort
git bisect reset

# Restore file to version from specific commit
git restore --source=abc123 path/to/file

# Undo last commit but keep changes
git reset --soft HEAD^

# Undo last commit and discard changes
git reset --hard HEAD^

# Recover deleted branch (within 90 days)
git reflog
git branch recovered-branch abc123
```
