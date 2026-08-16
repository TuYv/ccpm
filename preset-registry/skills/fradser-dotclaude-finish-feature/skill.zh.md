---
name: finish-feature
allowed-tools: ["Bash(git:*)", "Read", "Write"]
description: Finalizes and merges a feature branch into develop using git-flow, then prunes stale branches and worktrees. This skill should be used when the user asks to "finish a feature", "merge feature branch", "complete feature", "git flow feature finish", or wants to finalize a feature branch.
model: haiku
argument-hint: "[feature-name]"
user-invocable: true
disable-model-invocation: true
---
## 工作流执行

**启动一个通用代理**来执行 finish-feature 工作流。

遵循 `../../references/gitflow-finish-pipeline.md` 中的流水线：
- **工作流类型**：`feature`
- **参数**：`$ARGUMENTS`