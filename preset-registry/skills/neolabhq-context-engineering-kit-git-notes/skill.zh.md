---
name: git-notes
description: Use when adding metadata to commits without changing history, tracking review status, test results, code quality annotations, or supplementing commit messages post-hoc - provides git notes commands and patterns for attaching non-invasive metadata to Git objects.
---
# Git Notes

## 概述

Git notes 可将元数据附加到提交（或任何 Git 对象），而无需修改对象本身。Notes 单独存储，并与提交消息一同显示。

**核心原则：** 在提交创建后为其添加信息，无需重写历史记录。

## 核心概念

| 概念 | 说明 |
|---------|-------------|
| **Notes ref** | 存储位置，默认为 `refs/notes/commits` |
| **非侵入式** | Notes 永远不会修改原始对象的 SHA |
| **命名空间** | 使用 `--ref` 区分不同的 note 类别 |
| **显示** | Notes 会出现在 `git log` 和 `git show` 的输出中 |

## 快速参考

| 任务 | 命令 |
|------|---------|
| 添加 note | `git notes add -m "message" <sha>` |
| 查看 note | `git notes show <sha>` |
| 追加内容 | `git notes append -m "message" <sha>` |
| 编辑 | `git notes edit <sha>` |
| 删除 | `git notes remove <sha>` |
| 使用命名空间 | `git notes --ref=<name> <command>` |
| 推送 notes | `git push origin refs/notes/<name>` |
| 获取 notes | `git fetch origin refs/notes/<name>:refs/notes/<name>` |
| 在日志中显示 | `git log --notes=<name>` |

完整的命令参考请参阅 `references/commands.md`。

## 基本模式

### 代码审查跟踪

```bash
# Mark reviewed
git notes --ref=reviews add -m "Reviewed-by: Alice <alice@example.com>" abc1234

# View review status
git log --notes=reviews --oneline
```

### 共享 Notes

```bash
# Push to remote
git push origin refs/notes/reviews

# Fetch from remote
git fetch origin refs/notes/reviews:refs/notes/reviews
```

### 在变基过程中保留 Notes

```bash
git config notes.rewrite.rebase true
git config notes.rewriteMode concatenate
```

## 常见错误

| 错误 | 修复方法 |
|---------|-----|
| Notes 未显示在日志中 | 指定 ref：`git log --notes=reviews`，或配置 `notes.displayRef` |
| Notes 在变基后丢失 | 启用：`git config notes.rewrite.rebase true` |
| Notes 未出现在远程仓库中 | 显式推送：`git push origin refs/notes/commits` |
| 出现 "Note already exists" 错误 | 使用 `-f` 覆盖，或使用 `append` 追加 |

## 最佳实践

| 实践 | 理由 |
|----------|-----------|
| 使用命名空间 | 按用途区分 notes（审查、测试、审计） |
| 明确指定 refs | 对非默认 notes 始终指定 `--ref` |
| 显式推送 notes | 在团队指南中记录共享流程 |
| 使用 append 而不是 add -f | 在持续累积内容时保留 note 历史记录 |
| 配置重写保留机制 | 在变基前运行 `git config notes.rewrite.rebase true` |

# Git Notes 命令参考

所有 git notes 命令及选项的完整参考。

## 基本操作

### 添加 Note

```bash
# Add note to current HEAD
git notes add -m "Reviewed by Alice"

# Add note to specific commit
git notes add -m "Tested on Linux" abc1234

# Add note from file
git notes add -F review-comments.txt abc1234

# Add note interactively (opens editor)
git notes add abc1234

# Overwrite existing note
git notes add -f -m "Updated review status" abc1234

# Add empty note
git notes add --allow-empty abc1234
```

### 查看备注

```bash
# Show note for HEAD
git notes show

# Show note for specific commit
git notes show abc1234

# View commit with notes in log
git log --show-notes
git show abc1234

# List all notes
git notes list

# List note for specific object
git notes list abc1234
```

**包含备注的输出示例：**

```
commit abc1234def567890
Author: Developer <dev@example.com>
Date:   Mon Jan 15 10:00:00 2024 +0000

    feat: implement user authentication

Notes:
    Reviewed by Alice
    Tested-by: CI Bot <ci@example.com>
```

### 追加备注

```bash
# Append to existing note (creates if doesn't exist)
git notes append -m "Additional review comment" abc1234

# Append from file
git notes append -F more-comments.txt abc1234

# Append multiple messages
git notes append -m "Comment 1" -m "Comment 2" abc1234
```

### 编辑备注

```bash
# Edit note interactively (opens editor)
git notes edit abc1234

# Edit note for HEAD
git notes edit
```

### 删除备注

```bash
# Remove note from HEAD
git notes remove

# Remove note from specific commit
git notes remove abc1234

# Remove notes from multiple commits
git notes remove abc1234 def5678 ghi9012

# Ignore missing notes (no error if note doesn't exist)
git notes remove --ignore-missing abc1234

# Remove notes via stdin (bulk removal)
echo "abc1234" | git notes remove --stdin
```

### 复制备注

```bash
# Copy note from one commit to another
git notes copy abc1234 def5678

# Copy note to HEAD
git notes copy abc1234

# Force overwrite destination note
git notes copy -f abc1234 def5678

# Bulk copy via stdin (useful with rebase/cherry-pick)
echo "abc1234 def5678" | git notes copy --stdin
```

### 清理备注

```bash
# Remove notes for objects that no longer exist
git notes prune

# Dry-run to see what would be pruned
git notes prune -n

# Verbose output
git notes prune -v
```

### 获取备注引用

```bash
# Show current notes ref being used
git notes get-ref
```

## 使用多个命名空间

可以将备注组织到不同的命名空间（引用）中，以用于不同目的。

### 指定备注引用

```bash
# Add note to specific namespace
git notes --ref=refs/notes/reviews add -m "Approved" abc1234

# Shorthand (refs/notes/ prefix is assumed)
git notes --ref=reviews add -m "Approved" abc1234

# View notes from specific namespace
git notes --ref=reviews show abc1234

# List notes in namespace
git notes --ref=reviews list
```

### 环境变量

```bash
# Set default notes ref for session
export GIT_NOTES_REF=refs/notes/reviews
git notes add -m "Approved"

# View notes from environment ref
git notes show abc1234
```

### 显示多个命名空间

```bash
# Show specific notes namespace in log
git log --notes=reviews

# Show multiple namespaces
git log --notes=reviews --notes=testing

# Show all notes
git log --notes='*'

# Disable notes display
git log --no-notes
```

## 合并备注

当多个引用或不同来源中存在备注时，可以将它们合并。

### 合并备注引用

```bash
# Merge notes from another ref into current
git notes merge refs/notes/other

# Merge with strategy
git notes merge -s union refs/notes/other
git notes merge -s ours refs/notes/other
git notes merge -s theirs refs/notes/other
git notes merge -s cat_sort_uniq refs/notes/other

# Quiet merge
git notes merge -q refs/notes/other

# Verbose merge
git notes merge -v refs/notes/other
```

### 合并策略

| 策略 | 行为 |
|----------|----------|
| `manual` | 交互式解决冲突（默认） |
| `ours` | 发生冲突时保留本地注释 |
| `theirs` | 发生冲突时保留远程注释 |
| `union` | 拼接双方的注释 |
| `cat_sort_uniq` | 拼接并按行排序，然后删除重复项 |

### 解决合并冲突

```bash
# After merge conflict with manual strategy
# Resolve conflicts in .git/NOTES_MERGE_WORKTREE/

# Commit resolved merge
git notes merge --commit

# Abort merge
git notes merge --abort
```

## 配置选项

### Git 配置

```bash
# Set default notes ref
git config notes.displayRef refs/notes/reviews

# Display multiple notes refs
git config --add notes.displayRef refs/notes/testing

# Set merge strategy for notes
git config notes.mergeStrategy union

# Set merge strategy for specific namespace
git config notes.reviews.mergeStrategy theirs

# Preserve notes during rebase
git config notes.rewrite.rebase true

# Preserve notes during amend
git config notes.rewrite.amend true

# Set rewrite mode
git config notes.rewriteMode concatenate
```

### .gitconfig 示例

```gitconfig
[notes]
    displayRef = refs/notes/reviews
    displayRef = refs/notes/testing
    mergeStrategy = union

[notes "reviews"]
    mergeStrategy = theirs

[notes.rewrite]
    rebase = true
    amend = true
```

## 工作流示例

### 代码审查跟踪

```bash
# Mark commit as reviewed
git notes --ref=reviews add -m "Reviewed-by: Alice <alice@example.com>" abc1234

# Add review comments
git notes --ref=reviews append -m "Consider extracting helper function" abc1234

# View review status
git log --notes=reviews --oneline

# Mark as approved
git notes --ref=reviews add -f -m "APPROVED by Alice" abc1234
```

### 测试结果注释

```bash
# Record test pass
git notes --ref=testing add -m "Tests passed: 2024-01-15
Platform: Linux x64
Coverage: 85%" abc1234

# Record test failure
git notes --ref=testing add -m "FAILED: Integration tests
See: https://ci.example.com/build/123" def5678

# View test status across commits
git log --notes=testing --oneline
```

### 审计跟踪

```bash
# Add audit note
git notes --ref=audit add -m "Security review: PASSED
Reviewer: Security Team
Date: 2024-01-15
Ticket: SEC-456" abc1234

# Query audit status
git log --notes=audit --grep="Security review"
```

### 共享注释

```bash
# Push notes to remote
git push origin refs/notes/reviews

# Fetch notes from remote
git fetch origin refs/notes/reviews:refs/notes/reviews

# Push all notes refs
git push origin 'refs/notes/*'

# Fetch all notes refs
git fetch origin 'refs/notes/*:refs/notes/*'
```

### 批量操作

```bash
# Add notes to all commits by author in date range
git log --format="%H" --author="Alice" --since="2024-01-01" | \
  while read sha; do
    git notes add -m "Author verified" "$sha"
  done

# Remove notes from range of commits
git log --format="%H" HEAD~10..HEAD | xargs git notes remove --ignore-missing
```