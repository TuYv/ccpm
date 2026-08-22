---
name: git-worktrees
description: Use when working on multiple branches simultaneously, context switching without stashing, reviewing PRs while developing, testing in isolation, or comparing implementations across branches - provides git worktree commands and workflow patterns for parallel development with multiple working directories.
---
# Git 工作树

## 概述

Git 工作树支持在不同目录中同时检出多个分支，且所有目录共享同一个仓库。应创建工作树，而不是暂存更改或单独克隆仓库。

**核心原则：** 每个活跃分支使用一个工作树。通过切换目录而非切换分支来切换上下文。

## 核心概念

| 概念 | 描述 |
|---------|-------------|
| **主工作树** | 通过 `git clone` 或 `git init` 创建的原始工作目录 |
| **链接工作树** | 使用 `git worktree add` 创建的其他目录 |
| **共享 `.git`** | 所有工作树共享同一个 Git 对象数据库（无重复数据） |
| **分支锁定** | 每个分支同一时间只能在一个工作树中检出 |
| **工作树元数据** | `.git/worktrees/` 中用于跟踪链接工作树的管理文件 |

## 快速参考

| 任务 | 命令 |
|------|---------|
| 创建工作树（现有分支） | `git worktree add <path> <branch>` |
| 创建工作树（新分支） | `git worktree add -b <branch> <path>` |
| 从引用创建工作树（新分支） | `git worktree add -b <branch> <path> <start>` |
| 创建分离头指针工作树 | `git worktree add --detach <path> <commit>` |
| 列出所有工作树 | `git worktree list` |
| 删除工作树 | `git worktree remove <path>` |
| 强制删除工作树 | `git worktree remove --force <path>` |
| 移动工作树 | `git worktree move <old> <new>` |
| 锁定工作树 | `git worktree lock <path>` |
| 解锁工作树 | `git worktree unlock <path>` |
| 清理失效的工作树 | `git worktree prune` |
| 修复工作树链接 | `git worktree repair` |
| 比较工作树之间的文件 | `diff ../worktree-a/file ../worktree-b/file` |
| 从另一个分支获取单个文件 | `git checkout <branch> -- <path>` |
| 获取文件的部分更改 | `git checkout -p <branch> -- <path>` |
| 挑选提交 | `git cherry-pick <commit>` |
| 挑选提交但不创建提交 | `git cherry-pick --no-commit <commit>` |
| 合并但不自动创建提交 | `git merge --no-commit <branch>` |

## 基本命令

### 创建工作树

```bash
# Create worktree with existing branch
git worktree add ../feature-x feature-x

# Create worktree with new branch from current HEAD
git worktree add -b new-feature ../new-feature

# Create worktree with new branch from specific commit
git worktree add -b hotfix-123 ../hotfix origin/main

# Create worktree tracking remote branch
git worktree add --track -b feature ../feature origin/feature

# Create worktree with detached HEAD (for experiments)
git worktree add --detach ../experiment HEAD~5
```

### 列出工作树

```bash
# Simple list
git worktree list

# Verbose output with additional details
git worktree list -v

# Machine-readable format (for scripting)
git worktree list --porcelain
```

**输出示例：**

```
/home/user/project           abc1234 [main]
/home/user/project-feature   def5678 [feature-x]
/home/user/project-hotfix    ghi9012 [hotfix-123]
```

### 删除工作树

```bash
# Remove worktree (working directory must be clean)
git worktree remove ../feature-x

# Force remove (discards uncommitted changes)
git worktree remove --force ../feature-x
```

### 移动工作树

```bash
# Relocate worktree to new path
git worktree move ../old-path ../new-path
```

### 锁定/解锁工作树

```bash
# Lock worktree (prevents pruning if on removable storage)
git worktree lock ../feature-x
git worktree lock --reason "On USB drive" ../feature-x

# Unlock worktree
git worktree unlock ../feature-x
```

### 清理失效的工作树

```bash
# Remove stale worktree metadata (after manual directory deletion)
git worktree prune

# Dry-run to see what would be pruned
git worktree prune --dry-run

# Verbose output
git worktree prune -v
```

### 修复工作树

```bash
# Repair worktree links after moving directories manually
git worktree repair

# Repair specific worktree
git worktree repair ../feature-x
```

## 工作流模式

### 模式 1：并行处理功能开发与热修复

在功能开发进行期间修复错误：

```bash
# Create worktree for hotfix from main
git worktree add -b hotfix-456 ../project-hotfix origin/main

# Switch to hotfix directory, fix, commit, push
cd ../project-hotfix
git add . && git commit -m "fix: resolve critical bug #456"
git push origin hotfix-456

# Return to feature work
cd ../project

# Clean up when done
git worktree remove ../project-hotfix
```

### 模式 2：在工作期间审查 PR

在不影响当前工作的情况下审查 PR：

```bash
# Fetch PR branch and create worktree
git fetch origin pull/123/head:pr-123
git worktree add ../project-review pr-123

# Review: run tests, inspect code
cd ../project-review

# Return to work, then clean up
cd ../project
git worktree remove ../project-review
git branch -d pr-123
```

### 模式 3：比较不同实现

并排比较不同分支中的代码：

```bash
# Create worktrees for different versions
git worktree add ../project-v1 v1.0.0
git worktree add ../project-v2 v2.0.0

# Diff, compare, or run both simultaneously
diff ../project-v1/src/module.js ../project-v2/src/module.js

# Clean up
git worktree remove ../project-v1
git worktree remove ../project-v2
```

### 模式 4：长时间运行的任务

在隔离环境中运行测试或构建，同时继续进行开发：

```bash
# Create worktree for CI-like testing
git worktree add ../project-test main

# Start long-running tests in background
cd ../project-test && npm test &

# Continue development in main worktree
cd ../project
```

### 模式 5：稳定的参考版本

维护一个干净的 main 检出副本以供参考：

```bash
# Create permanent worktree for main branch
git worktree add ../project-main main

# Lock to prevent accidental removal
git worktree lock --reason "Reference checkout" ../project-main
```

### 模式 6：从多个功能分支中选择性合并

合并多个功能分支中的特定更改：

```bash
# Create worktrees for each feature to review
git worktree add ../project-feature-1 feature-1
git worktree add ../project-feature-2 feature-2

# Review changes in each worktree
diff ../project/src/module.js ../project-feature-1/src/module.js
diff ../project/src/module.js ../project-feature-2/src/module.js

# From main worktree, selectively take changes
cd ../project
git checkout feature-1 -- src/moduleA.js src/utils.js
git checkout feature-2 -- src/moduleB.js
git commit -m "feat: combine selected changes from feature branches"

# Or cherry-pick specific commits
git cherry-pick abc1234  # from feature-1
git cherry-pick def5678  # from feature-2

# Clean up
git worktree remove ../project-feature-1
git worktree remove ../project-feature-2
```

## 比较和合并工作树之间的更改

由于所有工作树共享同一个 Git 仓库，因此你可以在它们之间比较文件、拣选提交以及选择性地合并更改。

### 比较和审查文件更改

由于工作树本质上只是目录，因此你可以直接比较文件：

```bash
# Compare specific file between worktrees
diff ../project-main/src/app.js ../project-feature/src/app.js

# Use git diff to compare branches (works from any worktree)
git diff main..feature-branch -- src/app.js

# Visual diff with your preferred tool
code --diff ../project-main/src/app.js ../project-feature/src/app.js

# Compare entire directories
diff -r ../project-v1/src ../project-v2/src
```

### 仅合并工作树中的一个文件

你可以使用 `git checkout`，有选择地从另一个分支获取单个文件：

```bash
# In your current branch, get a specific file from another branch
git checkout feature-branch -- path/to/file.js

# Or get it from a specific commit
git checkout abc1234 -- path/to/file.js

# Get multiple specific files
git checkout feature-branch -- src/module.js src/utils.js
```

对于**部分文件更改**（仅限特定的更改块/行）：

```bash
# Interactive patch mode - select which changes to take
git checkout -p feature-branch -- path/to/file.js
```

系统会提示你使用以下选项，逐一接受或拒绝每个更改块：
- `y` - 应用此更改块
- `n` - 跳过此更改块
- `s` - 拆分为更小的更改块
- `e` - 手动编辑此更改块

### 从工作树中拣选提交

拣选以提交为单位进行。由于所有工作树共享同一个仓库，因此你可以拣选任何提交：

```bash
# Find the commit hash (from any worktree or git log)
git log feature-branch --oneline

# Cherry-pick specific commit into your current branch
git cherry-pick abc1234

# Cherry-pick multiple commits
git cherry-pick abc1234 def5678

# Cherry-pick a range of commits
git cherry-pick abc1234^..def5678

# Cherry-pick without committing (stage changes only)
git cherry-pick --no-commit abc1234
```

### 合并多个工作树中的更改

你可以合并或拣选多个分支中的更改：

```bash
# Merge multiple branches sequentially
git merge feature-1
git merge feature-2

# Or use octopus merge for multiple branches at once
git merge feature-1 feature-2 feature-3

# Cherry-pick commits from multiple branches
git cherry-pick abc1234  # from feature-1
git cherry-pick def5678  # from feature-2
```

### 选择性合并——选择要包含的更改

#### 选项 1：选择性检出文件

```bash
# Get specific files from different branches
git checkout feature-1 -- src/moduleA.js
git checkout feature-2 -- src/moduleB.js
git commit -m "Merge selected files from feature branches"
```

#### 选项 2：交互式补丁选择

```bash
# Select specific hunks from a file
git checkout -p feature-1 -- src/shared.js
```

#### 选项 3：拣选并选择性暂存

```bash
# Apply changes without committing
git cherry-pick --no-commit abc1234

# Unstage what you don't want
git reset HEAD -- unwanted-file.js
git checkout -- unwanted-file.js

# Commit only what you kept
git commit -m "Selected changes from feature-1"
```

#### 选项 4：通过手动选择进行合并

```bash
# Start merge but don't auto-commit
git merge --no-commit feature-1

# Review and modify staged changes
git status
git reset HEAD -- file-to-exclude.js
git checkout -- file-to-exclude.js

# Commit your selection
git commit -m "Merge selected changes from feature-1"
```

#### 选项 5：使用 git restore（Git 2.23+）

```bash
# Restore specific file from another branch
git restore --source=feature-branch -- path/to/file.js

# Interactive restore with patch selection
git restore -p --source=feature-branch -- path/to/file.js
```

## 目录结构约定

以可预测的方式组织工作树：

```
~/projects/
  myproject/              # Main worktree (main/master branch)
  myproject-feature-x/    # Feature branch worktree
  myproject-hotfix/       # Hotfix worktree
  myproject-review/       # Temporary PR review worktree
```

**命名约定：** `<project>-<purpose>` 或 `<project>-<branch>`

## 最佳实践

| 实践 | 原因 |
|----------|-----------|
| **使用同级目录** | 将工作树与主项目保持在同一级别，便于导航 |
| **按用途命名** | `project-review` 比 `project-pr-123` 更清晰 |
| **及时清理** | 完成后移除工作树，以免造成混淆 |
| **锁定远程工作树** | 如果工作树位于网络或 USB 存储设备上，防止其被修剪 |
| **使用 `--detach` 进行实验** | 避免创建用完即弃的分支 |
| **移除前提交** | 在执行 `git worktree remove` 前，始终先提交或暂存更改 |

## 常见问题及解决方案

### 问题："Branch is already checked out"

**原因：** 尝试检出已在另一个工作树中处于活动状态的分支。

**解决方案：**

```bash
# Find where the branch is checked out
git worktree list

# Either work in that worktree or remove it first
git worktree remove ../other-worktree
```

### 问题：手动删除后工作树残留

**原因：** 未使用 `git worktree remove` 就删除了工作树目录。

**解决方案：**

```bash
# Clean up stale metadata
git worktree prune
```

### 问题：手动移动了工作树

**原因：** 未使用 `git worktree move` 就移动了工作树目录。

**解决方案：**

```bash
# Repair the worktree links
git worktree repair
# Or specify the new path
git worktree repair /new/path/to/worktree
```

### 问题：工作树位于已移除的驱动器上

**原因：** 工作树位于已不再连接的可移动存储设备上。

**解决方案：**

```bash
# If temporary, lock it to prevent pruning
git worktree lock ../usb-worktree

# If permanent, prune it
git worktree prune
```

## 常见错误

| 错误 | 修复方法 |
|---------|-----|
| 使用 `rm -rf` 删除工作树 | 始终使用 `git worktree remove`，如有需要，再执行 `git worktree prune` |
| 忘记分支已被工作树锁定 | 遇到检出错误时，运行 `git worktree list` |
| 未清理临时工作树 | 任务完成后立即移除工作树 |
| 在嵌套位置创建工作树 | 使用同级目录（`../project-feature`），而非子目录 |
| 手动移动工作树目录 | 使用 `git worktree move`，或在移动后运行 `git worktree repair` |

## Agent 工作流集成

要隔离并行 Agent 任务：

```bash
# Create worktree for isolated task
git worktree add -b task-123 ../project-task-123
cd ../project-task-123
# Make changes, run tests, return
cd ../project
```

要在分离 HEAD 状态下安全地进行实验：

```bash
# Create detached worktree (no branch to clean up)
git worktree add --detach ../project-experiment
cd ../project-experiment
# Experiment, then discard or commit to new branch
git worktree remove --force ../project-experiment
```

## 验证清单

使用 worktree 之前：

- [ ] 理解一个分支只能在一个 worktree 中被检出
- [ ] 知道将在何处创建 worktree（使用同级目录）
- [ ] 为临时 worktree 规划清理策略

创建 worktree 时：

- [ ] 使用描述性的目录名称
- [ ] 验证分支尚未在其他位置被检出
- [ ] 考虑为实验使用 `--detach`

移除 worktree 时：

- [ ] 提交或暂存所有未提交的更改
- [ ] 使用 `git worktree remove`，而不是 `rm -rf`
- [ ] 如果目录被手动删除，运行 `git worktree prune`

--- 

# 如何比较 Worktree

用于比较 Git worktree 之间的文件和目录的工作流，帮助用户了解不同分支或 worktree 中代码的差异。

## 说明

关键：严格按照以下步骤操作：

1. **当前状态检查**：运行 `git worktree list`，显示所有现有 worktree 及其位置

2. **解析用户输入**：对提供的每个参数进行分类：
   - **无参数**：交互模式——询问用户要比较什么
   - **`--stat`**：显示差异的汇总统计信息（更改的文件、插入和删除）
   - **Worktree 路径**：与 `git worktree list` 中某个 worktree 根目录匹配的路径
   - **分支名称**：与某个 worktree 中的分支匹配的名称
   - **文件/目录路径**：当前 worktree 中要比较的路径

3. **确定比较目标**（要比较的 worktree）：
   a. 如果用户提供了 worktree 路径：将其用作比较目标
   b. 如果用户指定了分支名称：从 `git worktree list` 中查找这些分支对应的 worktree
   c. 如果除当前 worktree 外只存在一个 worktree：使用当前 worktree 和另一个 worktree 作为比较目标
   d. 如果存在多个 worktree 且未指定任何一个：列出 worktree 并询问用户要比较哪些
   e. 如果不存在其他 worktree：提议使用 `git diff` 与某个分支进行比较

4. **确定要比较的内容**（worktree 中的文件/目录）：
   a. 如果用户指定了文件或目录路径：比较所有这些路径
   b. 如果未给出具体路径：询问用户：
      - “比较整个 worktree？”或
      - “比较特定文件/目录？（输入路径）”

5. **执行比较**：

   **比较 worktree 之间的特定文件：**

   ```bash
   diff <worktree1>/<path> <worktree2>/<path>
   # Or for unified diff format:
   diff -u <worktree1>/<path> <worktree2>/<path>
   ```

   **比较 worktree 之间的目录：**

```bash
   diff -r <worktree1>/<directory> <worktree2>/<directory>
   # Or for summary only:
   diff -rq <worktree1>/<directory> <worktree2>/<directory>
   ```

   **对于分支级比较（使用 git diff）：**

   ```bash
   git diff <branch1>..<branch2> -- <path>
   # Or for stat summary:
   git diff --stat <branch1>..<branch2>
   ```

   **与当前工作目录进行比较：**

   ```bash
   diff <current-file> <other-worktree>/<file>
   ```

6. **设置结果格式并展示结果**：
   - 显示清晰的标题，说明正在比较的内容
   - 对于较大的差异，主动询问是否先显示摘要
   - 突出显示重大变更（新增文件、已删除文件、已重命名文件）
   - 提供每个 worktree 所含分支的相关上下文

## 比较模式

| 模式 | 描述 | 命令模式 |
|------|-------------|-----------------|
| **文件差异** | 比较 worktree 之间的单个文件 | `diff -u <wt1>/file <wt2>/file` |
| **目录差异** | 递归比较目录 | `diff -r <wt1>/dir <wt2>/dir` |
| **仅摘要** | 显示哪些文件存在差异（不显示内容） | `diff -rq <wt1>/ <wt2>/` |
| **Git 差异** | 使用 git 的 diff（基于分支） | `git diff branch1..branch2 -- path` |
| **统计视图** | 显示变更统计信息 | `git diff --stat branch1..branch2` |

## Worktree 检测

该命令使用 `git worktree list` 查找 worktree：

```
/home/user/project           abc1234 [main]
/home/user/project-feature   def5678 [feature-x]
/home/user/project-hotfix    ghi9012 [hotfix-123]
```

该命令从此输出中提取：

- **路径**：worktree 目录的绝对路径
- **分支**：方括号中的分支名称（在用户指定分支名称时使用）

## 示例

**比较 worktree 之间的特定文件：**

```bash
> /worktrees compare src/app.js
# Prompts to select which worktree to compare with
# Shows diff of src/app.js between current and selected worktree
```

**在两个特定 worktree 之间进行比较：**

```bash
> /worktrees compare ../project-main ../project-feature src/module.js
# Compares src/module.js between the two specified worktrees
```

**比较多个文件/目录：**

```bash
> /worktrees compare src/app.js src/utils/ package.json
# Shows diffs for all three paths between worktrees
```

**比较整个目录：**

```bash
> /worktrees compare src/
# Shows all differences in src/ directory between worktrees
```

**获取摘要统计信息：**

```bash
> /worktrees compare --stat
# Shows which files differ and line counts
```

**交互模式：**

```bash
> /worktrees compare
# Lists available worktrees
# Asks which to compare
# Asks for specific paths or entire worktree
```

**通过分支名称与分支 worktree 进行比较：**

```bash
> /worktrees compare feature-x
# Finds worktree for feature-x branch and compares
```

**比较分支 worktree 之间的特定路径：**

```bash
> /worktrees compare main feature-x src/ tests/
# Compares src/ and tests/ directories between main and feature-x worktrees
```

## 输出格式

**文件比较标头：**

```
Comparing: src/app.js
  From: /home/user/project (main)
  To:   /home/user/project-feature (feature-x)
---
[diff output]
```

**摘要输出：**

```
Worktree Comparison Summary
===========================
From: /home/user/project (main)
To:   /home/user/project-feature (feature-x)

Files only in main:
  - src/deprecated.js

Files only in feature-x:
  + src/new-feature.js
  + src/new-feature.test.js

Files that differ:
  ~ src/app.js
  ~ src/utils/helpers.js
  ~ package.json

Statistics:
  3 files changed
  2 files added
  1 file removed
```

## 常见工作流

### 审查功能变更

```bash
# See what changed in a feature branch
> /worktrees compare --stat
> /worktrees compare src/components/
```

### 比较实现方式

```bash
# Compare how two features implemented similar functionality
> /worktrees compare ../project-feature-1 ../project-feature-2 src/auth/
```

### 快速检查文件

```bash
# Check if a specific file differs
> /worktrees compare package.json
```

### 合并前审查

```bash
# Review all changes before merging (compare src and tests together)
> /worktrees compare --stat
> /worktrees compare src/ tests/
# Both src/ and tests/ directories will be compared
```

## 重要说明

- **参数检测**：该命令通过将参数与 `git worktree list` 的输出进行比较，自动检测参数类型：
  - 与工作树根目录匹配的路径 → 视为要比较的工作树
  - 与工作树中分支匹配的名称 → 视为要比较的工作树
  - 其他路径 → 视为要在工作树之间比较的文件/目录

- **多个路径**：提供多个文件/目录路径时，将在所选工作树之间比较其中的所有路径（而不仅仅是第一个）。

- **工作树路径**：指定工作树时，请使用完整路径或相对于当前目录的路径（例如 `../project-feature`）

- **分支与工作树**：如果指定分支名称，该命令会查找检出了该分支的工作树。如果该分支没有对应的工作树，则会建议改用 `git diff`。

- **大型差异**：对于大型目录，该命令会先询问是否显示摘要，然后再显示完整的差异输出。

- **二进制文件**：系统会检测二进制文件，并报告“二进制文件不同”，但不会显示实际差异。

- **文件权限**：如果文件权限不同，差异输出也会显示文件权限的变更。

- **无工作树**：如果不存在其他工作树，该命令会说明如何创建工作树，并提供改用 `git diff` 比较分支的选项。

## 与创建工作树功能集成

先使用 `/worktrees create` 设置用于比较的工作树：

```bash
# Create worktrees for comparison
> /worktrees create feature-x, main
# Created: ../project-feature-x and ../project-main

# Now compare
> /worktrees compare src/
```

## 故障排除

**“未找到其他工作树”**

- 先使用 `/worktrees create <branch>` 创建工作树
- 或使用 `git diff` 在没有工作树的情况下仅比较分支

**“未找到分支对应的工作树”**

- 该分支可能尚未创建工作树
- 运行 `git worktree list` 查看可用的工作树
- 使用 `/worktrees create <branch>` 创建工作树

**“工作树中不存在该路径”**

- 指定的文件/目录可能不存在于其中一个工作树中
- 这可能表示该文件已在某个分支中添加或删除
- 该命令将在比较输出中报告此情况

---

# 如何创建工作树

创建并设置用于并行开发的 git 工作树的工作流，可自动检测并安装项目依赖项。

## 操作说明

关键要求：严格按照以下步骤操作：

1. **检查当前状态**：运行 `git worktree list` 显示现有工作树，并运行 `git status` 验证仓库状态是否干净（不存在可能导致问题的未提交更改）

2. **获取最新的远程分支**：运行 `git fetch --all`，确保本地已获取所有远程分支的信息

3. **解析用户输入**：确定用户想要创建的内容：
   - `<name>`：使用自动检测的类型前缀创建工作树
   - `--list`：仅显示现有工作树，然后退出
   - 无输入：以交互方式询问用户名称

4. **根据名称自动检测分支类型**：检查第一个单词是否为已知分支类型。如果是，则将其用作前缀，并将其余部分用作名称。如果不是，则默认使用 `feature/`。

   **已知类型：** `feature`、`feat`、`fix`、`bug`、`bugfix`、`hotfix`、`release`、`docs`、`test`、`refactor`、`chore`、`spike`、`experiment`、`review`

   **示例：**
   - `refactor auth system` → `refactor/auth-system`
   - `fix login bug` → `fix/login-bug`
   - `auth system` → `feature/auth-system`（默认）
   - `hotfix critical error` → `hotfix/critical-error`

   **名称规范化：** 将空格转换为连字符，转换为小写，并移除连字符和下划线以外的特殊字符

5. **对于要创建的每个工作树**：
   a. **构造分支名称**：根据检测到的类型和规范化后的名称构建完整分支名称：
      - `<prefix>/<normalized-name>`（例如 `feature/auth-system`）

   b. **解析分支**：确定分支存在于本地、远程，还是需要创建：
      - 如果分支存在于本地：`git worktree add ../<project>-<name> <branch>`
      - 如果分支存在于远程（origin/<branch>）：`git worktree add --track -b <branch> ../<project>-<name> origin/<branch>`
      - 如果分支不存在：询问用户基础分支（默认为当前分支或 main/master），然后运行 `git worktree add -b <branch> ../<project>-<name> <base>`

   c. **路径约定**：使用符合 `../<project-name>-<name>` 模式的同级目录
      - 从当前目录中提取项目名称
      - 使用规范化后的名称（而不是带前缀的完整分支名称）
      - 示例：`feature/auth-system` → `../myproject-auth-system`

   d. **创建工作树**：执行适当的 git worktree add 命令

   e. **依赖项检测**：检查新工作树中的依赖项文件，并确定是否需要进行设置：
      - `package.json` -> Node.js 项目（npm/yarn/pnpm/bun）
      - `requirements.txt` 或 `pyproject.toml` 或 `setup.py` -> Python 项目
      - `Cargo.toml` -> Rust 项目
      - `go.mod` -> Go 项目
      - `Gemfile` -> Ruby 项目
      - `composer.json` -> PHP 项目

f. **包管理器检测**（适用于 Node.js 项目）：
      - `bun.lockb` -> 使用 `bun install`
      - `pnpm-lock.yaml` -> 使用 `pnpm install`
      - `yarn.lock` -> 使用 `yarn install`
      - `package-lock.json` 或默认情况 -> 使用 `npm install`

   g. **自动设置**：自动运行依赖安装：
      - cd 到工作树并运行检测到的安装命令
      - 报告进度："正在使用 [package manager] 安装依赖..."
      - 如果安装失败，报告错误，但继续显示工作树创建摘要

6. **摘要**：显示已创建工作树的摘要：
   - 工作树路径
   - 分支名称（包含前缀的完整名称）
   - 设置状态（依赖安装成功或失败）
   - 快速导航命令：`cd <worktree-path>`

## 工作树路径约定

工作树会创建为同级目录，以便保持组织有序：

```
~/projects/
  myproject/                # Main worktree (current directory)
  myproject-add-auth/       # Feature branch worktree (feature/add-auth)
  myproject-critical-bug/   # Hotfix worktree (hotfix/critical-bug)
  myproject-pr-456/         # PR review worktree (review/pr-456)
```

**命名规则：**

- 模式：`<project-name>-<name>`（使用名称部分，而非完整分支名称）
- 分支名称：`<type-prefix>/<name>`（例如 `feature/add-auth`）
- 为保持简洁，目录名称仅使用 `<name>` 部分

## 示例

**功能工作树（默认）：**

```bash
> /worktrees create auth system
# Branch: feature/auth-system
# Creates: ../myproject-auth-system
```

**修复工作树：**

```bash
> /worktrees create fix login error
# Branch: fix/login-error
# Creates: ../myproject-login-error
```

**重构工作树：**

```bash
> /worktrees create refactor api layer
# Branch: refactor/api-layer
# Creates: ../myproject-api-layer
```

**热修复工作树：**

```bash
> /worktrees create hotfix critical bug
# Branch: hotfix/critical-bug
# Creates: ../myproject-critical-bug
```

**列出现有工作树：**

```bash
> /worktrees list
# Shows: git worktree list output
```

## 设置检测示例

**使用 pnpm 的 Node.js 项目：**

```
Detected Node.js project with pnpm-lock.yaml
Installing dependencies with pnpm...
✓ Dependencies installed successfully
```

**Python 项目：**

```
Detected Python project with requirements.txt
Installing dependencies with pip...
✓ Dependencies installed successfully
```

**Rust 项目：**

```
Detected Rust project with Cargo.toml
Building project with cargo...
✓ Project built successfully
```

## 常见工作流

### 快速创建功能分支

```bash
> /worktrees create new dashboard
# Branch: feature/new-dashboard
# Creates worktree, installs dependencies, ready to code
```

### 在功能开发期间进行热修复

```bash
# In main worktree, working on feature
> /worktrees create hotfix critical bug
# Branch: hotfix/critical-bug
# Creates separate worktree from main/master
# Fix bug in hotfix worktree
# Return to feature work when done
```

### 无需暂存更改即可审查 PR

```bash
> /worktrees create review pr 123
# Branch: review/pr-123
# Creates worktree for reviewing PR
# Can run tests, inspect code
# Delete when review complete
```

### 实验或技术验证

```bash
> /worktrees create spike new architecture
# Branch: spike/new-architecture
# Creates isolated worktree for experimentation
# Discard or merge based on results
```

## 重要说明

- **分支锁定**：每个分支同一时间只能在一个工作树中检出。如果某个分支已被检出，该命令会告知你它所在的工作树。

- **共享 .git**：所有工作树共享同一个 Git 对象数据库。在任何工作树中提交的更改对其他所有工作树都可见。

- **干净的工作目录**：该命令会检查是否存在未提交的更改，并在存在时发出警告，因为在干净状态下创建工作树最为安全。

- **同级目录**：工作树始终创建为同级目录（使用 `../`），以保持工作区井然有序。切勿在主仓库内部创建工作树。

- **自动安装依赖项**：该命令会自动检测项目类型和包管理器，然后无需提示便运行相应的安装命令。

- **远程跟踪**：对于远程分支，创建工作树时会正确设置跟踪关系（`--track` 标志），确保拉取和推送操作正常工作。

## 清理

工作树使用完毕后，请使用正确的移除命令：

```bash
git worktree remove ../myproject-add-auth
```

对于存在未提交更改的工作树：

```bash
git worktree remove --force ../myproject-add-auth
```

切勿使用 `rm -rf` 删除工作树——始终使用 `git worktree remove`。

## 故障排除

**“分支已被检出”**

- 运行 `git worktree list`，查看该分支在哪个工作树中被检出
- 在该工作树中工作，或先将其移除

**“无法创建工作树——路径已存在”**

- 目标目录已存在
- 将其移除，或选择其他工作树路径

**“依赖项安装失败”**

- 手动进入工作树：`cd ../myproject-<name>`
- 直接运行安装命令，查看完整的错误输出
- 常见原因：缺少系统依赖项、网络问题、锁文件损坏

**“检测到错误的类型”**

- 如果第一个单词是已知类型，则将其用作分支类型
- 如需强制指定类型，请以以下任一类型开头：`fix`、`hotfix`、`docs`、`test`、`refactor`、`chore`、`spike`、`review`
- 当第一个单词不是已知类型时，默认类型为 `feature/`

---

# 如何合并工作树

帮助用户将 Git 工作树中的更改合并到当前分支的工作流，支持从简单的文件检出到选择性拣选提交等多种合并策略。

## 说明

关键要求：严格按照以下步骤操作：

1. **检查当前状态**：运行 `git worktree list` 显示所有现有工作树，并运行 `git status` 验证工作目录状态

2. **解析用户输入**：确定用户想要执行的合并操作：
   - **`--interactive` 或无参数**：引导式交互模式
   - **文件/目录路径**：从工作树合并特定文件或目录
   - **提交名称**：拣选特定提交
   - **分支名称**：从该分支的工作树进行合并
   - **`--from <worktree>`**：显式指定源工作树
   - **`--patch` 或 `-p`**：使用交互式补丁选择模式

3. **确定源工作树/分支**：
   a. 如果用户指定了 `--from <worktree>`：直接使用该工作树路径
   b. 如果用户指定了分支名称：从 `git worktree list` 中查找该分支对应的工作树
   c. 如果仅存在一个其他工作树：询问用户是否确认将其用作源
   d. 如果存在多个工作树：显示列表，并询问用户要从哪个工作树合并
   e. 如果不存在其他工作树：说明情况，并提议改用基于分支的合并

4. **确定合并策略**：根据用户的需求提供选项：

   **策略 A：选择性检出文件**（适用于特定文件/目录）
   - 最适合：从另一个分支获取完整文件
   - 命令：`git checkout <branch> -- <path>`

   **策略 B：交互式补丁选择**（适用于文件的部分变更）
   - 最适合：从文件中选择特定的变更块/行
   - 命令：`git checkout -p <branch> -- <path>`
   - 针对每个变更块提示用户：y（应用）、n（跳过）、s（拆分）、e（编辑）

   **策略 C：通过选择性暂存执行 Cherry-Pick**（适用于特定提交）
   - 最适合：应用某个提交，但排除其中的一些变更
   - 步骤：
     1. `git cherry-pick --no-commit <commit>`
     2. 检查已暂存的变更
     3. 使用 `git reset HEAD -- <unwanted-files>` 取消暂存
     4. 使用 `git checkout -- <unwanted-files>` 丢弃变更
     5. `git commit -m "message"`

   **策略 D：手动合并并处理冲突**（适用于复杂合并）
   - 最适合：在掌控冲突解决过程的情况下执行完整分支合并
   - 步骤：
     1. `git merge --no-commit <branch>`
     2. 检查所有变更
     3. 选择性暂存/取消暂存文件
     4. 解决冲突（如果有）
     5. `git commit -m "message"`

   **策略 E：多工作树选择性合并**（合并来自多个源的内容）
   - 最适合：从不同工作树获取不同文件
   - 步骤：
     1. `git checkout <branch1> -- <path1>`
     2. `git checkout <branch2> -- <path2>`
     3. `git commit -m "Merge selected files from multiple branches"`

5. **执行所选策略**：
   - 如果用户希望先检查，执行合并前比较（建议先使用 `/worktrees compare`）
   - 执行所选策略对应的 git 命令
   - 处理出现的任何冲突
   - 在最终提交之前确认变更

6. **合并后摘要**：显示合并了哪些内容：
   - 已更改/添加/删除的文件
   - 源工作树/分支
   - 使用的合并策略

7. **清理提示**：成功合并后，询问：
   - “是否要移除任何工作树以清理本地状态？”
   - 如果是：列出工作树，并询问要移除哪些工作树
   - 对选定的工作树执行 `git worktree remove <path>`
   - 如有需要，提醒用户执行 `git worktree prune`

## 合并策略参考

| 策略 | 适用场景 | 命令模式 |
|----------|----------|-----------------|
| **选择性检出文件** | 需要另一个分支中的完整文件 | `git checkout <branch> -- <path>` |
| **交互式补丁** | 需要文件中的特定变更 | `git checkout -p <branch> -- <path>` |
| **选择性 Cherry-Pick** | 需要某个提交，但不需要其中的所有变更 | `git cherry-pick --no-commit` + 选择性暂存 |
| **手动合并** | 需要在可控情况下执行完整分支合并 | `git merge --no-commit` + 选择性暂存 |
| **多源合并** | 合并来自多个分支的文件 | 多次执行 `git checkout <branch> -- <path>` |

## 示例

**从工作树合并单个文件：**
```bash
> /worktrees merge src/app.js --from ../project-feature
# Prompts for merge strategy
# Executes: git checkout feature-branch -- src/app.js
```

**交互式补丁选择：**
```bash
> /worktrees merge src/utils.js --patch
# Lists available worktrees to select from
# Runs: git checkout -p feature-branch -- src/utils.js
# User selects hunks interactively (y/n/s/e)
```

**挑选特定提交：**
```bash
> /worktrees merge abc1234
# Detects commit hash
# Asks: Apply entire commit or selective?
# If selective: git cherry-pick --no-commit abc1234
# Then guides through unstaging unwanted changes
```

**完整引导模式：**
```bash
> /worktrees merge
# Lists all worktrees
# Asks what to merge (files, commits, or branches)
# Guides through appropriate strategy
# Offers cleanup at end
```

**存在冲突的目录合并：**
```bash
> /worktrees merge src/components/ --from ../project-refactor
# Strategy D: Manual merge with conflicts
# git merge --no-commit refactor-branch
# Helps resolve any conflicts
# Reviews and commits selected changes
```

## 交互式补丁模式指南

使用 `--patch` 或策略 B 时，用户会看到针对每个变更块的提示：

```
@@ -10,6 +10,8 @@ function processData(input) {
   const result = transform(input);
+  // Added validation
+  if (!isValid(result)) throw new Error('Invalid');
   return result;
 }
Apply this hunk? [y,n,q,a,d,s,e,?]
```

| 按键 | 操作 |
|-----|--------|
| `y` | 应用此变更块 |
| `n` | 跳过此变更块 |
| `q` | 退出（不应用此变更块及剩余变更块） |
| `a` | 应用此变更块及所有剩余变更块 |
| `d` | 不应用此文件中的此变更块及剩余变更块 |
| `s` | 拆分为更小的变更块 |
| `e` | 手动编辑变更块 |
| `?` | 显示帮助 |

## 选择性挑选提交工作流

对于策略 C（通过选择性暂存来挑选提交）：

```bash
# 1. Apply commit without committing
git cherry-pick --no-commit abc1234

# 2. Check what was staged
git status

# 3. Unstage files you don't want
git reset HEAD -- path/to/unwanted.js

# 4. Discard changes to those files
git checkout -- path/to/unwanted.js

# 5. Commit the remaining changes
git commit -m "Cherry-pick selected changes from abc1234"
```

## 多工作树合并工作流

对于策略 E（从多个工作树合并）：

```bash
# Get files from different branches
git checkout feature-auth -- src/auth/login.js src/auth/session.js
git checkout feature-api -- src/api/endpoints.js
git checkout feature-ui -- src/components/Header.js

# Review all changes
git status
git diff --cached

# Commit combined changes
git commit -m "feat: combine auth, API, and UI improvements from feature branches"
```

## 常见工作流

### 获取功能文件而不进行完整合并
```bash
> /worktrees merge src/new-feature.js --from ../project-feature
# Gets just the file, not the entire branch
```

### 从热修复分支获取部分错误修复
```bash
> /worktrees merge --patch src/utils.js --from ../project-hotfix
# Select only the specific bug fix hunks, not all changes
```

### 合并多个 PR 的更改
```bash
> /worktrees merge --interactive
# Select specific files from PR-1 worktree
# Select other files from PR-2 worktree
# Combine into single coherent commit
```

### 合并前审查
```bash
# First review what will be merged
> /worktrees compare src/module.js
# Then merge with confidence
> /worktrees merge src/module.js --from ../project-feature
```

## 重要说明

- **工作目录状态**：合并前务必确保工作目录干净。未提交的更改可能会导致冲突。

- **合并前审查**：考虑在合并前使用 `/worktrees compare`，以了解将应用哪些更改。

- **冲突解决**：如果合并期间发生冲突，该命令将帮助你在提交前识别并解决冲突。

- **不提交标志**：大多数策略使用 `--no-commit`，让你可以控制最终的提交消息和所包含的内容。

- **共享仓库**：所有工作树共享同一个 Git 对象数据库，因此在任意工作树中创建的提交都可以立即从其他任何工作树中进行 cherry-pick。

- **分支锁定**：请记住，一个分支同一时间只能在一个工作树中被检出。执行合并操作时，请使用分支名称，而不是创建重复的工作树。

## 合并后清理

合并后，可以考虑清理不再需要的工作树：

```bash
# List worktrees
git worktree list

# Remove specific worktree (clean state required)
git worktree remove ../project-feature

# Force remove (discards uncommitted changes)
git worktree remove --force ../project-feature

# Clean up stale worktree references
git worktree prune
```

每次成功合并后，该命令都会提示你进行清理，以帮助保持工作区整洁。

## 故障排除

**“无法合并：工作目录存在未提交的更改”**
- 首先提交或暂存当前更改
- 或者在合并前使用 `git stash`，合并后使用 `git stash pop`

**“<file> 中存在合并冲突”**
- 该命令将显示发生冲突的文件
- 打开文件并解决冲突（查找 `<<<<<<<` 标记）
- 使用 `git add <file>` 暂存已解决冲突的文件
- 使用 `git commit` 继续

**执行 cherry-pick 时“找不到提交”**
- 确保提交哈希正确
- 在任意工作树中运行 `git log <branch>` 以查找提交
- 提交在所有工作树之间共享

**“无法检出：工作树中已存在该文件”**
- 文件存在本地修改
- 首先提交、暂存或丢弃本地更改
- 然后重试合并操作

**“找不到工作树对应的分支”**
- 指定的工作树可能已被移除
- 运行 `git worktree list` 查看当前工作树
- 使用 `git worktree prune` 清理过时的引用

## 与其他命令集成

**合并前审查：**
```bash
> /worktrees compare src/
> /worktrees merge src/specific-file.js
```

**创建工作树、合并并清理：**
```bash
> /worktrees create feature-branch
> /worktrees compare src/
> /worktrees merge src/module.js --from ../project-feature-branch
# After merge, cleanup is offered automatically
```