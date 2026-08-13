---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
---
# 使用 Git Worktrees

## 概览

确保操作在隔离的工作区中进行。优先使用你平台的原生 worktree 工具。只有在没有原生工具可用时，才回退到手动 git worktree。

**核心原则：**先检测现有隔离环境。然后使用原生工具。再回退到 git。不要与 harness 对抗。

**开始时声明：** “我正在使用 using-git-worktrees skill 来设置一个隔离工作区。”

## 第 0 步：检测现有隔离

**在创建任何内容之前，先检查你是否已经处于隔离工作区。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**子模块保护：** `GIT_DIR != GIT_COMMON` 在 git 子模块内同样为真。在得出“已在 worktree”结论前，请先确认你不在子模块中：

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不是子模块）：** 你已经在一个已关联的 worktree 中。跳到第 2 步（项目设置）。不要再创建另一个 worktree。

按分支状态汇报：
- 位于分支时：`Already in isolated workspace at <path> on branch <name>.`
- Detached HEAD：`Already in isolated workspace at <path> (detached HEAD, externally managed). Branch creation needed at finish time.`

**如果 `GIT_DIR == GIT_COMMON`（或在子模块中）：** 你处于普通仓库检出状态。

用户是否已在你的指令中说明了他们的 worktree 偏好？如果没有，创建 worktree 前应先征得同意：

> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

如已有既定偏好，请直接遵循，不再询问。若用户拒绝同意，就在原位工作并跳到第 2 步。

## 第 1 步：创建隔离工作区

**你有两种机制。按此顺序尝试。**

### 1a. 原生 Worktree 工具（优先）

用户已请求使用隔离工作区（第 0 步同意）。你是否已有创建 worktree 的方式？可能是名为 `EnterWorktree`、`WorktreeCreate` 的工具、`/worktree` 命令，或 `--worktree` 参数。如果有，使用它并跳到第 2 步。

原生工具会自动处理目录放置、分支创建和清理。若在有原生工具时使用 `git worktree add`，会创建你们 harness 无法看到或管理的“幽灵状态”。

仅在你没有可用的原生 worktree 工具时，才继续第 1b 步。

### 1b. Git Worktree 回退

**仅当第 1a 不适用**——即你没有可用的原生 worktree 工具。使用 git 手动创建 worktree。

#### 目录选择

按以下优先级执行。显式用户偏好始终高于已观察到的文件系统状态。

1. **检查你的指令是否有声明的 worktree 目录偏好。** 如果用户已指定，直接使用该目录，不再询问。

2. **检查是否存在项目本地的 worktree 目录：**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   如果找到则使用。若两者都存在，优先使用 `.worktrees`。

3. **若无其他指引**，默认使用项目根目录下的 `.worktrees/`。

#### 安全校验（仅项目本地目录）

**必须在创建 worktree前确认目录已被忽略：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果未被忽略：** 将其加入 .gitignore，然后提交该修改，再继续。

**为何关键：** 防止意外将 worktree 内容提交到仓库。

#### 创建 Worktree

```bash
# Determine path based on chosen location
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**沙箱回退：** 如果 `git worktree add` 因权限错误（沙箱拒绝）失败，请告知用户沙箱阻止了 worktree 创建，你将改为在当前目录中工作。随后在原地执行设置和基线测试。

## 第 2 步：项目设置

自动检测并运行合适的设置：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## 第 3 步：验证干净基线

运行测试以确保工作区初始状态干净：

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：** 汇报失败原因，询问是否继续或进行排查。

**如果测试通过：** 汇报已就绪。

### 汇报

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## 快速参考

| 情况 | 操作 |
|-----------|--------|
| 已在 linked worktree 中 | 跳过创建（第 0 步） |
| 在子模块中 | 按普通仓库处理（第 0 步保护） |
| 有原生 worktree 工具可用 | 使用它（第 1a 步） |
| 无原生工具 | 使用 git worktree 回退（第 1b 步） |
| `.worktrees/` 存在 | 使用它（确认已忽略） |
| `worktrees/` 存在 | 使用它（确认已忽略） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 先检查指令文件，再默认 `.worktrees/` |
| 目录未被忽略 | 加入 .gitignore 并提交 |
| 创建时出现权限错误 | 沙箱回退，在原地工作 |
| 基线测试失败 | 报告失败并询问 |
| 无 package.json/Cargo.toml | 跳过依赖安装 |

## 常见辩解

| 借口 | 现实 |
|--------|---------|
| “我显然不在 worktree 里，不需要检查” | 先执行第 0 步。Harness 创建的隔离环境和子模块都会误导肉眼观察；检测命令才能明确判断。 |
| “`git worktree add` 比寻找原生工具更快” | 原生工具（如 `EnterWorktree`）负责目录放置、分支和清理。绕过它是最大的错误之一——它会创建你的 harness 看不见也管理不了的“幽灵状态”。 |
| “worktree 目录肯定已经被忽略了” | 运行 `git check-ignore`。未被忽略的 worktree 目录会将整个目录树提交到仓库。 |
| “任何目录名都可以” | 显式指令优先于现有项目本地目录，项目本地目录又优先于默认的 `.worktrees/`。 |
| “工作区是全新的——基线测试可以等会儿再做” | 脏基线会让后续每个失败都变得模糊。现在就运行测试；是否继续到失败后由你的人工合作方决定。 |
