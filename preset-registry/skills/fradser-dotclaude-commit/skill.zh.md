---
name: commit
description: Creates clean, conventional git commits using standard git. Use when the user asks to "commit", "git commit", "create commit", or wants to commit staged or unstaged changes.
user-invocable: true
argument-hint: "[optional commit message or instructions]"
allowed-tools: ["bash"]
---
# 提交技能（标准 Git）

使用标准 `git` 命令创建整洁、原子化的 Conventional Commits。

## 工作流程

1. **检查状态和差异**：
   ```bash
   git status --porcelain
   git diff --staged
   git diff
   ```
2. **暂存文件**：
   显式暂存相关的已修改或未跟踪文件：
   ```bash
   git add <file1> <file2> ...
   ```
3. **拟定 Conventional Commit 消息**：
   遵循规范：`<type>(<optional scope>): <short description>`
   类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`。
4. **提交**：
   执行标准 `git commit`：
   ```bash
   git commit -m "<type>(<scope>): <summary>"
   ```
   如果需要或被要求添加共同作者尾注，请遵循 `../../references/coauthor-attribution.md`。