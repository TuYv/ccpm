---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
---
# 使用 Git Worktrees

## 概述

确保工作在隔离的工作区中进行。优先使用平台原生的 worktree 工具。仅在没有原生工具可用时才回退到手动 git worktree。

**核心原则：**先检测现有的隔离环境。然后使用原生工具。最后回退到 git。永远不要与宿主环境对抗。

**开始时声明：**“我正在使用 using-git-worktrees 技能来设置一个隔离的工作区。”

## 步骤 0：检测现有隔离环境

**在创建任何东西之前，先检查你是否已经处于一个隔离的工作区中。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**子模块防护：**在 git 子模块内部，`GIT_DIR != GIT_COMMON` 同样成立。在得出“已经处于 worktree 中”的结论之前，请先确认你不在子模块中：

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不是子模块）：**你已经处于一个链接式 worktree 中。跳到步骤 2（项目设置）。不要再创建另一个 worktree。

按分支状态报告：
- 在分支上：“已处于隔离工作区中，路径为 `<path>`，分支为 `<name>`。”
- 分离 HEAD：“已处于隔离工作区中，路径为 `<path>`（分离 HEAD，由外部管理）。完成时需要创建分支。”

**如果 `GIT_DIR == GIT_COMMON`（或处于子模块中）：**你处于一个普通的仓库检出中。

用户是否已在你的指令中表明了 worktree 偏好？如果没有，在创建 worktree 之前先征求同意：

> “你希望我设置一个隔离的 worktree 吗？它可以保护你当前的分支免受改动。”

遵循任何已声明的既有偏好，无需再次询问。如果用户拒绝，就地工作并跳到步骤 2。

## 步骤 1：创建隔离工作区

**你有两种机制。按此顺序尝试。**

### 1a. 原生 Worktree 工具（首选）

用户已要求使用隔离工作区（步骤 0 的同意）。你是否已经有创建 worktree 的方法？它可能是一个名称类似于 `EnterWorktree`、`WorktreeCreate` 的工具，一个 `/worktree` 命令，或一个 `--worktree` 标志。如果有，使用它并跳到步骤 2。

原生工具会自动处理目录放置、分支创建和清理。在拥有原生工具的情况下使用 `git worktree add` 会产生宿主环境无法看到或管理的幻影状态。

仅当你没有可用的原生 worktree 工具时，才继续执行步骤 1b。

### 1b. Git Worktree 回退方案

**仅当步骤 1a 不适用时才使用此方法**——即你没有可用的原生 worktree 工具。使用 git 手动创建 worktree。

#### 目录选择

遵循以下优先顺序。明确的用户偏好永远优先于观察到的文件系统状态。

1. **检查你的指令中是否声明了 worktree 目录偏好。**如果用户已经指定，直接使用，无需询问。

2. **检查是否已存在项目本地的 worktree 目录：**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   如果找到，使用它。如果两者都存在，以 `.worktrees` 为准。

3. **如果没有其他可用指引**，默认使用项目根目录下的 `.worktrees/`。

#### 安全验证（仅限项目本地目录）

**创建 worktree 之前，必须验证该目录已被忽略：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果未被忽略：**添加到 .gitignore，提交该更改，然后继续。

**为何关键：**防止意外将 worktree 内容提交到仓库中。

#### 创建 Worktree

```bash
# Determine path based on chosen location
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**沙箱回退：**如果 `git worktree add` 因权限错误（沙箱拒绝）而失败，告知用户沙箱阻止了 worktree 的创建，你将改为在当前目录中工作。然后就地运行设置和基线测试。

## 步骤 2：项目设置

自动检测并运行适当的设置：

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

## 步骤 3：验证干净的基线

运行测试以确保工作区以干净状态开始：

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**报告失败情况，询问是继续还是排查。

**如果测试通过：**报告就绪。

### 报告

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## 快速参考

| 情况 | 操作 |
|-----------|--------|
| 已在链接式 worktree 中 | 跳过创建（步骤 0） |
| 处于子模块中 | 按普通仓库处理（步骤 0 防护） |
| 有可用的原生 worktree 工具 | 使用它（步骤 1a） |
| 没有原生工具 | Git worktree 回退方案（步骤 1b） |
| `.worktrees/` 存在 | 使用它（验证已忽略） |
| `worktrees/` 存在 | 使用它（验证已忽略） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 检查指令文件，然后默认使用 `.worktrees/` |
| 目录未被忽略 | 添加到 .gitignore 并提交 |
| 创建时出现权限错误 | 沙箱回退，就地工作 |
| 基线测试失败 | 报告失败并询问 |
| 没有 package.json/Cargo.toml | 跳过依赖安装 |

## 常见错误

### 与宿主环境对抗

- **问题：**在平台已提供隔离的情况下使用 `git worktree add`
- **解决：**步骤 0 检测现有的隔离环境。步骤 1a 交由原生工具处理。

### 跳过检测

- **问题：**在现有 worktree 内部创建嵌套 worktree
- **解决：**在创建任何东西之前，始终先运行步骤 0

### 跳过忽略验证

- **问题：**worktree 内容被跟踪，污染 git status
- **解决：**创建项目本地 worktree 之前，始终使用 `git check-ignore`

### 臆断目录位置

- **问题：**造成不一致，违反项目约定
- **解决：**遵循优先级：明确指令 > 现有项目本地目录 > 默认值

### 在测试失败的情况下继续

- **问题：**无法区分新引入的缺陷与既有问题
- **解决：**报告失败，获得明确许可后再继续

## 危险信号

**绝不：**
- 在步骤 0 检测到现有隔离环境时创建 worktree
- 在拥有原生 worktree 工具（如 `EnterWorktree`）时使用 `git worktree add`。这是头号错误——如果你有它，就用它。
- 跳过步骤 1a，直接执行步骤 1b 的 git 命令
- 在未验证目录已被忽略的情况下创建 worktree（项目本地）
- 跳过基线测试验证
- 在未询问的情况下带着失败的测试继续

**始终：**
- 首先运行步骤 0 检测
- 优先使用原生工具而非 git 回退方案
- 遵循目录优先级：明确指令 > 现有项目本地目录 > 默认值
- 对项目本地目录验证其已被忽略
- 自动检测并运行项目设置
- 验证干净的测试基线
