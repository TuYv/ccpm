---
name: commit
description: Create a single well-crafted git commit from current changes. Analyzes diff, follows repo's commit style, and writes a concise "why not what" message.
user_invocable: true
allowed-tools:
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git commit:*)
---
# Git Commit

## 上下文

在提交之前，先收集以下上下文信息：
- 当前 git 状态：`git status`
- 当前 git 差异（已暂存和未暂存）：`git diff HEAD`
- 当前分支：`git branch --show-current`
- 最近的提交记录：`git log --oneline -10`

## Git 安全协议

- 绝不更新 git 配置
- 绝不跳过钩子（--no-verify、--no-gpg-sign 等），除非用户明确要求
- 重要：始终创建新的提交。除非用户明确要求，绝不使用 git commit --amend
- 不要提交可能包含敏感信息（secrets）的文件（.env、credentials.json 等）。如果用户明确要求提交此类文件，应向用户发出警告
- 如果没有可提交的变更（即没有未跟踪文件，也没有任何修改），不要创建空提交
- 绝不使用带 -i 标志的 git 命令（如 git rebase -i 或 git add -i），因为这些命令需要交互式输入，而此处不支持交互式输入

## 任务

根据这些变更，创建一个单独的 git 提交：

1. 分析所有已暂存的变更并起草提交信息：
   - 查看最近的提交记录，以遵循该仓库的提交信息风格
   - 概括变更的性质（新功能、增强、bug 修复、重构、测试、文档等）
   - 确保提交信息准确反映变更及其目的（即 "add" 表示全新功能，"update" 表示对现有功能的增强，"fix" 表示 bug 修复等）
   - 起草一条简洁（1-2 句话）的提交信息，重点说明“为什么改”而非“改了什么”

2. 暂存相关文件，并使用 HEREDOC 语法创建提交：
```
git commit -m "$(cat <<'EOF'
Commit message here.
EOF
)"
```

在单条消息中完成暂存并创建提交。不要执行任何其他操作。
