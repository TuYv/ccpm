---
name: managing-git
description: Manages Git workflows including branching, commits, and pull requests. Use when working with Git, creating commits, opening PRs, managing branches, resolving conflicts, or when asked about version control best practices.
---
# 管理 Git

### 何时加载

- **触发条件**：分支策略、提交工作流、拉取请求、合并冲突、版本控制问题
- **跳过条件**：不涉及 git 操作的任务

## 功能开发工作流

复制此检查清单并跟踪进度：

```
Feature Development Progress:
- [ ] Step 1: Create feature branch from main
- [ ] Step 2: Make changes with atomic commits
- [ ] Step 3: Rebase on latest main
- [ ] Step 4: Push and create PR
- [ ] Step 5: Address review feedback
- [ ] Step 6: Merge after approval
```

## 分支策略

### GitHub Flow（推荐用于大多数项目）

```
main ──●────●────●────●────●── (always deployable)
        \          /
feature  └──●──●──┘
```

- `main` 始终可部署
- 从 main 创建功能分支
- PR + 审查 + 合并
- 合并后部署

### Git Flow（适用于基于发布的项目）

```
main     ──●─────────────●────── (releases only)
            \           /
release      └────●────┘
                 /
develop  ──●──●────●──●──●──
            \     /
feature      └──●┘
```

## 提交约定

### Conventional Commits 格式

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 类型

| 类型       | 说明                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | 新功能                                         |
| `fix`      | 缺陷修复                                             |
| `docs`     | 仅文档变更                                  |
| `style`    | 格式调整，不涉及逻辑变更                         |
| `refactor` | 既不修复缺陷也不添加功能的代码变更 |
| `perf`     | 性能改进                             |
| `test`     | 添加/更新测试                               |
| `chore`    | 构建流程、依赖项                         |
| `ci`       | CI 配置                                    |

### 示例

```bash
feat(auth): add OAuth2 login support

Implements Google and GitHub OAuth providers.
Closes #123

BREAKING CHANGE: Session tokens now expire after 24h
```

```bash
fix(api): handle null response from payment gateway

Previously caused 500 error when gateway returned null.
Now returns appropriate error message to user.
```

## 分支命名

```
<type>/<ticket-id>-<short-description>

# Examples
feature/AUTH-123-oauth-login
fix/BUG-456-null-pointer
chore/TECH-789-upgrade-deps
```

## 拉取请求工作流

创建 PR 时复制此检查清单：

```
PR Checklist:
- [ ] Code follows project conventions
- [ ] Tests added/updated for changes
- [ ] All tests pass locally
- [ ] No merge conflicts with main
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced
- [ ] PR description explains the "why"
```

### PR 模板

```markdown
## Summary

[Brief description of changes]

## Changes

- [Change 1]
- [Change 2]

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] E2E tests pass

## Screenshots (if UI changes)

[Before/After screenshots]
```

### PR 大小指南

| 大小 | 变更行数 | 审查指南 |
| ---- | ------------- | ----------------- |
| XS   | < 50          | 快速审查 |
| S    | 50-200        | 标准审查 |
| M    | 200-500       | 全面审查 |
| L    | 500+          | 尽可能拆分 |

## 常用 Git 命令

### 日常工作流程

```bash
# Start new feature
git checkout main
git pull
git checkout -b feature/TICKET-123-description

# Commit changes
git add -p  # Stage interactively
git commit -m "feat: description"

# Keep up with main
git fetch origin main
git rebase origin/main

# Push and create PR
git push -u origin HEAD
```

### 修正错误

```bash
# Amend last commit (before push)
git commit --amend

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a pushed commit
git revert <commit-hash>

# Interactive rebase to clean up
git rebase -i HEAD~3
```

### 高级操作

```bash
# Cherry-pick specific commit
git cherry-pick <commit-hash>

# Find which commit broke something
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>

# Stash with message
git stash push -m "WIP: feature description"
git stash list
git stash pop
```

## 提交验证

推送前，请验证提交：

```
Commit Validation:
- [ ] Each commit has a clear, descriptive message
- [ ] Commit type matches the change (feat, fix, etc.)
- [ ] No WIP or temporary commits
- [ ] No secrets or credentials committed
- [ ] Changes are atomic (one logical change per commit)
```

如果验证失败，请在推送前使用 `git rebase -i` 清理提交历史。