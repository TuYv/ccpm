---
name: start-release
allowed-tools: ["Bash(git:*)", "Read", "Write"]
description: Begins a new version release using git-flow. This skill should be used when the user asks to "start a release", "create release branch", "prepare a release", "git flow release start", or wants to begin a new version release. Accepts either an explicit version or a natural-language description of the release.
model: haiku
argument-hint: "[version or description]"
user-invocable: true
disable-model-invocation: true
---
## 工作流执行

**启动一个通用代理**来执行 start-release 工作流。

遵循 `../../references/gitflow-start-pipeline.md` 中的流水线：
- **工作流类型**：`release`
- **参数**：`$ARGUMENTS`