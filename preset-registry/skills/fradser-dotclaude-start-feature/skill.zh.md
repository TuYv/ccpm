---
name: start-feature
allowed-tools: ["Bash(git:*)"]
description: Starts working on a new feature branch using git-flow. This skill should be used when the user asks to "start a feature", "create feature branch", "begin new feature", "git flow feature start", or wants to start a new feature. Accepts either a branch name or a natural-language description.
model: haiku
argument-hint: "[feature-name or description]"
user-invocable: true
disable-model-invocation: true
---
## 工作流执行

**启动一个通用代理**来执行 start-feature 工作流。

遵循 `../../references/gitflow-start-pipeline.md` 中的流水线：
- **工作流类型**：`feature`
- **参数**：`$ARGUMENTS`