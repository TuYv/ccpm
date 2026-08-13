---
name: git-commit-helper
description: Generate conventional commit messages automatically. Use when user runs git commit, stages changes, or asks for commit message help. Analyzes git diff to create clear, descriptive conventional commit messages. Triggers on git commit, staged changes, commit message requests.
allowed-tools: Bash, Read
---
# Git 提交助手 Skill

根据你的 git diff 生成约定式提交消息。

## 何时激活

- ✅ 未提供消息的 `git commit`
- ✅ 用户询问“我的提交消息应该写什么？”
- ✅ 存在已暂存的更改
- ✅ 用户提到提交或约定式提交
- ✅ 创建提交之前

## 我会生成什么

### 约定式提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型：**
- `feat`：新功能
- `fix`：错误修复
- `docs`：文档更改
- `style`：代码样式（格式调整，无逻辑更改）
- `refactor`：代码重构
- `perf`：性能改进
- `test`：添加或修复测试
- `build`：构建系统更改
- `ci`：CI/CD 更改
- `chore`：维护任务

## 示例

### 添加功能

```bash
# You staged:
git add auth.service.ts login.component.tsx

# I analyze diff and suggest:
feat(auth): add JWT-based user authentication

- Implement login/logout functionality
- Add token management service
- Include auth guards for protected routes
- Add unit tests for auth service

Closes #42
```

### 错误修复

```bash
# You staged:
git add UserList.tsx

# I suggest:
fix(components): resolve memory leak in UserList

Fixed subscription not being cleaned up in useEffect,
causing memory leak when component unmounts.

Closes #156
```

### 破坏性更改

```bash
# You staged:
git add api/users.ts

# I suggest:
feat(api): update user API response format

Changed response structure to include metadata
for better pagination and filtering support.

BREAKING CHANGE: User API now returns { data, metadata }
instead of direct array. Update client code accordingly.
```

### 文档更新

```bash
# You staged:
git add README.md docs/api.md

# I suggest:
docs: update API documentation with authentication examples

- Add authentication flow diagrams
- Include cURL examples for protected endpoints
- Document error responses
```

## 分析流程

### 第 1 步：检查已暂存的更改
```bash
git diff --staged --name-only
git diff --staged
```

### 第 2 步：对更改进行分类
- 新文件 → feat
- 修改的文件 → fix、refactor 或 feat
- 删除的文件 → chore 或 refactor
- 测试文件 → test
- 文档 → docs

### 第 3 步：分析内容
- 更改了什么？
- 为什么要进行更改？
- 有什么影响？
- 是否存在破坏性更改？

### 第 4 步：生成消息

**主题行：**
- 最多 50 个字符
- 使用祈使语气（使用“add”而非“added”）
- 结尾不加句号
- 类型之后使用小写字母

**正文：**
- 解释改了什么以及为什么改，而不是如何改
- 每行不超过 72 个字符
- 多项更改使用项目符号

**页脚：**
- 破坏性更改：`BREAKING CHANGE: description`
- Issue 引用：`Closes #123`、`Fixes #456`

## 消息组成部分

### 类型选择

```yaml
feat: New functionality
  - New components, features, capabilities

fix: Bug fixes
  - Resolving issues, fixing bugs

refactor: Code improvements
  - No functional changes, better code structure

perf: Performance
  - Speed improvements, optimization

docs: Documentation
  - README, comments, guides

test: Testing
  - Adding or fixing tests

style: Formatting
  - Code style, linting, formatting

chore: Maintenance
  - Dependencies, build config, tooling
```

### 作用域选择

常见作用域：
- 组件名称：`feat(UserCard): ...`
- 模块：`fix(auth): ...`
- 包：`chore(api): ...`
- 区域：`docs(readme): ...`

### 主题指南

✅ 好的示例：
- `add user authentication`
- `fix memory leak in component`
- `update API documentation`

❌ 不好的示例：
- `added user authentication`（过去时）
- `fixes bug`（过于模糊）
- `Update API docs.`（末尾有句号）

## 进阶示例

### 多项更改

```bash
# Multiple files in auth feature
feat(auth): implement complete authentication system

- Add JWT token generation and validation
- Implement password hashing with bcrypt
- Create login/logout API endpoints
- Add auth middleware for protected routes
- Include refresh token functionality

Closes #42, #43, #44
```

### 重构

```bash
# Code restructuring
refactor(api): extract database logic into repository pattern

Moved database queries from controllers to repository classes
for better separation of concerns and testability.

No functional changes or API modifications.
```

### 性能改进

```bash
# Optimization
perf(queries): optimize user data fetching

- Implement query batching to eliminate N+1 queries
- Add database indices on frequently queried columns
- Cache user profile data with 5-minute TTL

Performance improvement: 80ms → 12ms average response time
```

## Git 集成

### Pre-commit 钩子

我可以很好地配合 pre-commit 钩子工作：

```bash
#!/bin/sh
# .git/hooks/prepare-commit-msg

# If no commit message provided, trigger skill
if [ -z "$2" ]; then
  # Skill suggests message based on staged changes
  echo "# Suggested commit message (edit as needed)" > "$1"
fi
```

### 修改提交

```bash
# Poor initial message
git commit -m "fix stuff"

# Amend with better message
# I suggest improved message based on changes
git commit --amend
```

## 沙箱兼容性

**无需沙箱即可运行：** ✅ 是
**可在沙箱中运行：** ✅ 是

**以下情况可能需要网络访问：**
- 从 GitHub API 获取议题详情
- 检查议题编号是否有效

**沙箱配置（可选）：**
```json
{
  "network": {
    "allowedDomains": [
      "api.github.com"
    ]
  }
}
```

## 自定义

### 自定义提交类型

编辑 SKILL.md 以添加公司特有的类型：

```yaml
deploy: Deployment
migrate: Database migrations
hotfix: Production hotfixes
```

### 自定义作用域

训练该技能识别你的项目结构：

```yaml
Common scopes: auth, api, ui, database, admin, mobile
```

### 消息模板

为你的团队自定义消息格式：

```bash
# Standard format
feat(scope): subject

# Your custom format
[JIRA-123] feat(scope): subject
```

## 编写优质消息的技巧

1. **具体明确**：使用 "fix login button"，而不是 "fix bug"
2. **使用祈使语气**：使用 "add"，而不是 "added" 或 "adds"
3. **包含上下文**：说明为什么需要此项更改
4. **引用议题**：始终包含议题编号
5. **破坏性更改**：始终在页脚中标明

## 常见模式

### 前端更改
```
feat(ui): add responsive navigation menu
fix(components): resolve prop validation warning
style(css): update button hover effects
```

### 后端变更
```
feat(api): add user pagination endpoint
fix(database): resolve connection pool exhaustion
perf(queries): add database indices for user lookups
```

### 基础设施变更
```
ci: add automated deployment pipeline
build: update dependencies to latest versions
chore(docker): optimize container image size
```

## 相关工具

- **code-reviewer skill**：提交前审查代码
- **@docs-writer 子代理**：根据提交生成变更日志
- **/review 命令**：提交前代码审查

## 集成

### 与 code-reviewer 集成

```bash
# 1. Write code
# 2. code-reviewer flags issues
# 3. Fix issues
# 4. Stage changes
# 5. I generate commit message
git commit  # Uses my suggested message
```

### 与 /review 命令集成

```bash
# 1. Make changes
/review --scope staged  # Review before commit
# 2. Address findings
# 3. Stage final changes
# 4. I generate commit message
git commit
```

## 了解更多

- [约定式提交](https://www.conventionalcommits.org/)
- [Git 最佳实践](../../standards/git-workflows/)
- [自定义指南](../../TEMPLATES.md)