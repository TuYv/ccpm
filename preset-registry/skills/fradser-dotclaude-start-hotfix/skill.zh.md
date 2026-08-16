---
name: start-hotfix
allowed-tools: ["Bash(git:*)", "Read", "Write"]
description: Begins a hotfix for a production issue using git-flow. This skill should be used when the user asks to "start a hotfix", "create hotfix branch", "fix a critical bug", "git flow hotfix start", or wants to begin a hotfix. Accepts either an explicit version or a natural-language description of the fix.
model: haiku
argument-hint: "[version or description]"
user-invocable: true
disable-model-invocation: true
---
## 工作流执行

**启动一个通用代理**，执行 start-hotfix 工作流。

遵循 `../../references/gitflow-start-pipeline.md` 中的流水线：
- **工作流类型**：`hotfix`
- **参数**：`$ARGUMENTS`