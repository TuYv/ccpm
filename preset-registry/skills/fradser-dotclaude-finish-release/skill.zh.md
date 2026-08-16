---
name: finish-release
allowed-tools: ["Bash(git:*)", "Bash(gh:*)", "Read", "Write"]
description: Finalizes a release and merges it into main and develop with a tag using git-flow, then prunes stale branches and worktrees. This skill should be used when the user asks to "finish a release", "merge release branch", "complete release", "git flow release finish", or wants to finalize a release.
model: haiku
argument-hint: "[version]"
user-invocable: true
disable-model-invocation: true
---
## 工作流执行

**启动一个通用代理**来执行完成发布工作流。

遵循 `../../references/gitflow-finish-pipeline.md` 中的流水线：
- **工作流类型**：`release`
- **参数**：`$ARGUMENTS`