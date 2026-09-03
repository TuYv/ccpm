---
name: commit-push-pr
description: Full git workflow - creates branch, commits, pushes, and creates or updates a PR with summary and test plan.
user_invocable: true
allowed-tools:
  - Bash(git checkout --branch:*)
  - Bash(git checkout -b:*)
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git push:*)
  - Bash(git commit:*)
  - Bash(gh pr create:*)
  - Bash(gh pr edit:*)
  - Bash(gh pr view:*)
  - Bash(gh pr merge:*)
---
# 提交、推送并创建 PR

## 上下文

先收集以下上下文信息：
- `git status`
- `git diff HEAD`
- `git branch --show-current`
- `git diff main...HEAD`（或默认分支）
- `gh pr view --json number 2>/dev/null || true`

## Git 安全协议

- 绝不更新 git 配置
- 绝不运行破坏性/不可逆的 git 命令（如 push --force、hard reset 等），除非用户明确要求
- 绝不跳过钩子（--no-verify、--no-gpg-sign 等），除非用户明确要求
- 绝不向 main/master 强制推送；如果用户提出该要求，需向其发出警告
- 不要提交可能包含机密信息的文件（.env、credentials.json 等）
- 绝不使用带 -i 标志的 git 命令（如 git rebase -i 或 git add -i），因为这类命令需要交互式输入，而交互式输入不受支持

## 任务

分析将要包含在拉取请求中的全部变更——查看 `git diff main...HEAD` 中的所有提交，而不只是最新一次提交。

根据变更内容：

### 1. 创建分支（如果当前在 main/master 上）
使用 `username/feature-name` 格式：
```
git checkout -b username/descriptive-feature-name
```

### 2. 创建单个提交
提交信息使用 heredoc 语法：
```
git commit -m "$(cat <<'EOF'
Commit message here.
EOF
)"
```
- 遵循仓库的提交信息风格（查看 `git log --oneline -10`）
- 关注“为什么”，而不是“做了什么”
- 保持简洁（1-2 句话）

### 3. 推送分支
```
git push -u origin HEAD
```

### 4. 创建或更新 PR
检查是否已存在 PR（根据上面 `gh pr view` 的输出）。

**如果 PR 已存在**——更新它：
```
gh pr edit --title "Short title" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
- [ ] Test item 1
- [ ] Test item 2
EOF
)"
```

**如果没有 PR**——创建一个：
```
gh pr create --title "Short, descriptive title" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
- [ ] Test item 1
- [ ] Test item 2
EOF
)"
```

**规则：**
- PR 标题应保持在 70 个字符以内。详细信息请写在正文中。
- Summary 应为 1-3 个要点，说明改动了什么以及为什么
- Test plan 应为验证步骤的核对清单

### 5. 返回 PR URL

在一条消息中使用多个工具调用完成上述所有步骤。完成后返回 PR URL。
