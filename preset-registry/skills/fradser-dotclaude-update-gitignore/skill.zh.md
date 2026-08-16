---
name: update-gitignore
description: Creates or updates a .gitignore file using git-agent AI generation. This skill should be used when the user asks to "update gitignore", "create gitignore", "add ignore rules", or needs to initialize ignore rules for a project.
user-invocable: true
argument-hint: [additional-technologies]
model: haiku
allowed-tools: ["Bash(git-agent:*)", "Bash(git:*)", "Read", "Write", "Edit"]
---
1. 保留现有 .gitignore 中的自定义规则
2. `git-agent init --gitignore --force`
3. 遇到身份验证错误 (401) 时，使用 `--free` 重试
4. 重新添加保留的自定义规则
5. 显示差异

CLI 参考：`${CLAUDE_PLUGIN_ROOT}/references/cli.md`