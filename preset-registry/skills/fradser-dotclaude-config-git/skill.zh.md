---
name: config-git
description: Configures git setup for user identity and project conventions. This skill should be used when the user asks to "configure git", "setup git", "set commit scopes", or needs project-specific Git settings.
user-invocable: true
model: haiku
allowed-tools: ["Bash(git-agent:*)", "Bash(git:*)", "Bash(ls:*)", "Bash(find:*)", "Read", "Write", "AskUserQuestion"]
---
1. 验证 `git config user.name` 和 `user.email`；如果缺失则提示
2. `git-agent init --scope --force`
3. 从 `.git-agent/config.yml` 读取作用域，并验证命名：
   - 单个单词：保持原样
   - 多个单词：缩写为各单词的首字母（例如，`multi-word` -> `mw`）
4. 使用验证后的作用域，基于 `${CLAUDE_PLUGIN_ROOT}/examples/git.local.md` 创建 `.claude/git.local.md`

CLI 参考：`${CLAUDE_PLUGIN_ROOT}/references/cli.md`