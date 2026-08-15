---
name: git-commit
description: >
  Structured git commit messages following Conventional Commits format
  for Go projects. Generates well-scoped, atomic commits with clear descriptions.
  Use when committing changes, writing commit messages, preparing PRs,
  or reviewing commit history quality.
  Trigger examples: "commit these changes", "create commit", "commit message",
  "prepare PR", "squash commits".
  Do NOT use for changelog generation (use changelog-generator) or
  code review (use go-code-review).
license: MIT
metadata:
  version: "1.0.0"
---
# Git 提交规范

提交记录讲述了代码库的演进故事。一份良好的提交历史比任何数量的文档都更有价值——因为它始终保持最新。

## 1. 约定式提交格式

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 类型：

| 类型 | 使用场景 |
|---|---|
| `feat` | 新功能（对应语义化版本中的 MINOR） |
| `fix` | 缺陷修复（对应语义化版本中的 PATCH） |
| `refactor` | 既不修复缺陷也不添加功能的代码变更 |
| `perf` | 性能改进 |
| `test` | 添加或修正测试 |
| `docs` | 仅文档变更 |
| `chore` | 构建流程、工具、依赖项 |
| `ci` | CI/CD 配置变更 |
| `style` | 格式、空白字符（不是 CSS——指代码格式） |

### 作用域：

使用软件包名称或模块区域：

```text
feat(auth): add JWT refresh token rotation
fix(store/postgres): handle connection pool exhaustion
refactor(service): extract validation into dedicated package
test(handler): add table-driven tests for user endpoints
chore(deps): bump go.uber.org/zap to v1.27.0
```

### 破坏性变更：

```text
feat(api)!: change pagination from offset to cursor-based

BREAKING CHANGE: The `offset` and `limit` query parameters are replaced
by `cursor` and `page_size`. All existing clients must migrate.
```

## 2. 提交消息规则

### 主题行：
- 使用祈使语气："add feature"，而不是 "added feature" 或 "adds feature"
- 类型前缀之后使用小写字母
- 末尾不加句号
- 最多 72 个字符
- 必须描述改了什么，而不是如何修改

### 正文（需要时）：
- 主题与正文之间留一个空行
- 解释为什么需要进行此变更
- 从高层次说明有哪些不同
- 每行不超过 72 个字符

### 页脚：
- 引用议题：`Fixes #123`、`Closes #456`、`Refs #789`
- 共同作者：`Co-authored-by: Name <email>`
- 破坏性变更：`BREAKING CHANGE: description`

## 3. 示例

### 简单变更：

```text
fix(handler): return 404 instead of 500 for missing user
```

### 包含正文：

```text
refactor(service): replace manual SQL with sqlx named queries

The raw SQL string concatenation for dynamic WHERE clauses was
error-prone and difficult to maintain. sqlx named queries provide
the same flexibility with automatic parameter binding.

No behavior change — all existing tests pass.
```

### 破坏性变更：

```text
feat(config)!: migrate from YAML to environment variables

BREAKING CHANGE: Configuration is now loaded from environment
variables instead of config.yaml. See README.md for the full
list of supported variables.

Closes #234
```

### 依赖项更新：

```text
chore(deps): upgrade pgx to v5.5.0

Picks up connection pool improvements and fixes for
COPY protocol handling. See release notes:
https://github.com/jackc/pgx/releases/tag/v5.5.0
```

## 4. 原子提交

每次提交都应当是一个逻辑变更，并且：
- 可以独立编译（`go build ./...` 通过）
- 测试通过（`go test ./...` 通过）
- 可以独立回滚，而不会破坏其他变更

### 拆分大型变更：

```text
# ❌ Bad — one commit doing everything
feat(user): add user management with CRUD, validation, auth, and tests

# ✅ Good — atomic, reviewable commits
feat(domain): add User entity and validation rules
feat(store): implement PostgreSQL user repository
feat(service): add user service with create and get operations
feat(handler): add REST endpoints for user management
test(service): add table-driven tests for user creation
docs(api): document user endpoints in OpenAPI spec
```

## 5. 提交前验证

提交前，运行：

```bash
# Format and lint
goimports -w .
golangci-lint run

# Build
go build ./...

# Test
go test -race ./...

# Tidy modules
go mod tidy
```

如果任何步骤失败，请先修复再提交。绝不要提交损坏的代码并声称
“稍后会修复”——你不会的。

## 6. 提交流程

```bash
# Stage specific files (not git add .)
git add internal/service/user.go
git add internal/service/user_test.go

# Review staged changes
git diff --staged

# Commit with message
git commit -m "feat(service): add user creation with email validation"

# Or use editor for longer messages
git commit  # opens $EDITOR
```

### 创建 PR 前进行交互式变基：

```bash
# Clean up commit history before opening PR
git rebase -i main

# Squash fixup commits
# Reword unclear messages
# Reorder for logical flow
```

## 7. 不应提交的内容

- 生成的文件（`*.pb.go`，除非必需；`mocks/`）
- IDE 配置（`.idea/`、`.vscode/`——请使用全局 gitignore）
- 操作系统文件（`.DS_Store`、`Thumbs.db`）
- 二进制文件和构建产物
- 包含机密信息的 `.env` 文件
- `vendor/`（除非项目策略明确要求）