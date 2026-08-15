---
name: commit-and-push
description: Creates clean conventional git commits using standard git and pushes changes to the remote repository. Use when the user asks to "commit and push", "push changes", or complete a commit followed by git push.
user-invocable: true
argument-hint: "[optional commit message or instructions]"
allowed-tools: ["bash"]
---
# 提交并推送技能（标准 Git）

使用标准 `git` 命令创建整洁、原子化的约定式提交，并将其推送到 origin。

## 工作流程

1. **检查状态和差异**：
   ```bash
   git status --porcelain
   git diff --staged
   git diff
   ```
2. **暂存文件**：
   ```bash
   git add <file1> <file2> ...
   ```
3. **提交**：
   编写约定式提交消息并提交：
   ```bash
   git commit -m "<type>(<scope>): <summary>"
   ```
4. **推送**：
   检测当前分支并推送：
   ```bash
   BRANCH=$(git branch --show-current)
   git push origin "$BRANCH"
   ```
   如果是首次推送新分支，请添加 `-u`：
   ```bash
   git push -u origin "$BRANCH"
   ```