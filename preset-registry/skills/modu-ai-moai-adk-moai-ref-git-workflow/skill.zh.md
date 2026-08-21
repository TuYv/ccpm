---
name: moai-ref-git-workflow
description: >
  Git workflow patterns, branch strategies, conventional commits, and PR templates
  reference for git operations. Agent-extending skill that amplifies manager-git
  expertise with production-grade git workflow patterns.
  NOT for: code implementation, testing, architecture design, documentation content.

when_to_use: >
  Use for git workflow reference: branch strategies, conventional commits,
  PR templates, merge and rebase flows, and commit/branch/release
  conventions. Amplifies manager-git expertise with production-grade git
  workflow patterns.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "workflow"
  status: "active"
  updated: "2026-03-30"
  tags: "git, branch, commit, pr, workflow, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# Git 工作流参考

## 目标 Agent

`manager-git` - 将这些模式直接应用于 git 操作、分支管理和 PR 创建。

## 分支策略模式

### GitHub Flow（大多数项目的默认选择）

```
main ─────────────────────────────────────────
  └── feat/SPEC-XXX-description ──── PR ──→ merge
```

规则：
- `main` 始终处于可部署状态
- 从 `main` 创建功能分支
- 所有合并都必须通过 PR
- 合并后删除分支

### GitFlow（复杂的发布周期）

```
main ──────────────────────────────────────────
  └── develop ─────────────────────────────────
        ├── feature/SPEC-XXX ──── PR ──→ develop
        └── release/v1.2.0 ────── PR ──→ main + develop
```

### 基于主干的开发（高度依赖 CI/CD）

```
main ──────────────────────────────────────────
  └── short-lived branch (< 1 day) ──→ merge
```

## 分支命名约定

| 模式 | 示例 | 使用场景 |
|---------|---------|----------|
| `feat/SPEC-{ID}-{slug}` | `feat/SPEC-AUTH-001-jwt-auth` | 新功能 |
| `fix/SPEC-{ID}-{slug}` | `fix/SPEC-BUG-042-null-check` | Bug 修复 |
| `refactor/{slug}` | `refactor/extract-auth-middleware` | 重构 |
| `docs/{slug}` | `docs/api-reference-update` | 文档 |
| `chore/{slug}` | `chore/upgrade-dependencies` | 维护 |

## Conventional Commits 参考

| 类型 | 使用时机 | 示例 |
|------|------|---------|
| `feat` | 新功能 | `feat(auth): add JWT refresh token flow` |
| `fix` | Bug 修复 | `fix(api): handle null user in profile endpoint` |
| `refactor` | 代码重构 | `refactor(db): extract query builder` |
| `test` | 测试变更 | `test(auth): add login edge case tests` |
| `docs` | 文档 | `docs(api): update endpoint descriptions` |
| `chore` | 维护 | `chore(deps): upgrade Go to 1.23` |
| `perf` | 性能优化 | `perf(query): add index for user lookup` |
| `style` | 格式调整 | `style: apply gofmt formatting` |
| `ci` | CI/CD 变更 | `ci: add GitHub Actions workflow` |
| `revert` | 撤销提交 | `revert: undo feat(auth) commit abc123` |

### 提交消息结构

```
<type>(<scope>): <description>    # max 72 chars

[optional body]                    # what and why, not how

[optional footer]                  # Breaking changes, issue refs
BREAKING CHANGE: <description>
Refs: #123, SPEC-AUTH-001
```

## Pull Request 模板

```markdown
## Summary
- [1-3 bullet points describing what this PR does]

## Changes
- [ ] File 1: description of change
- [ ] File 2: description of change

## Test Plan
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## SPEC Reference
- SPEC-{ID}: {title}

## Checklist
- [ ] Tests pass (`go test ./...`)
- [ ] Linting pass (`golangci-lint run`)
- [ ] No secrets committed
- [ ] Documentation updated if needed
```

## 合并策略选择

| 策略 | 使用时机 | 命令 |
|----------|------|---------|
| Squash 合并 | 功能分支（保持历史整洁） | `gh pr merge --squash` |
| 合并提交 | 发布分支（保留历史） | `gh pr merge --merge` |
| Rebase | 少量且整洁的提交 | `gh pr merge --rebase` |

同步阶段 PR 自动合并所使用的方法由 `git_strategy.<mode>.merge_method` 配置值（`squash` | `merge` | `rebase`；默认为 `squash`）决定，而不是硬编码。同步代理会从当前模式配置中解析该值，并生成匹配的 `gh pr merge --<merge_method>` 命令。

## Git 安全规则

| 操作 | 风险 | 规则 |
|--------|------|------|
| `git push --force` | 覆盖远程内容 | 绝不在 main/master 上使用，必须先询问用户 |
| `git reset --hard` | 丢失本地更改 | 必须先与用户确认 |
| `git checkout .` | 丢弃更改 | 必须先与用户确认 |
| `git branch -D` | 删除分支 | 仅在确认合并后使用 |
| `--no-verify` | 跳过钩子 | 除非用户明确要求，否则绝不使用 |
| `git rebase -i` | 交互式（不受支持） | 绝不使用（需要交互式输入） |

## 提交中的上下文记忆

在提交消息中嵌入决策上下文，以便未来会话保持连续性：

```
feat(auth): implement JWT refresh token rotation

Decision: Chose rotation over sliding window for security
Pattern: Middleware chain: RateLimit -> Auth -> Authz -> Handler
Gotcha: Token blacklist requires Redis, not just in-memory cache

Refs: SPEC-AUTH-001
```

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会在合并前整理提交消息” | 在压力下进行交互式变基很容易出错。从一开始就编写整洁的提交。 |
| “在我的功能分支上强制推送没问题” | 协作者或 CI 可能已拉取该分支。强制推送会破坏他们的引用。请使用 --force-with-lease。 |
| “这个提交太小，不需要遵循约定格式” | 变更日志生成器、bisect 和 blame 都依赖一致的提交格式。每个提交都很重要。 |
| “我会直接推送到 main，这只是个小修复” | 直接推送会绕过代码审查和 CI。即使是小修复也可能破坏生产环境。 |
| “合并提交很混乱，我总是使用 squash” | Squash 会丢失各个提交的上下文。合并提交会保留开发过程，便于将来调试。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 提交消息未遵循约定格式（type(scope): description）
- 强制推送到 main 或共享发布分支
- 在 CI 未通过的情况下合并 PR
- 分支名称未表明 feature、fix 或 SPEC 引用
- 在已提交文件中发现合并冲突标记

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 所有提交消息均遵循约定格式（显示 git log --oneline）
- [ ] 分支名称遵循约定（feature/、fix/、chore/ 前缀）
- [ ] 未强制推送到 main 或受保护分支（检查 reflog 或 CI）
- [ ] PR 在合并前已通过 CI 检查
- [ ] 已提交文件中没有合并冲突标记（使用 grep 搜索 <<<<<<<）
- [ ] 适用时，在提交消息或 PR 描述中引用了 SPEC-ID

<!-- moai:evolvable-end -->