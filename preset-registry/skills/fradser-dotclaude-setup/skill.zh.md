---
name: setup
description: Initializes git-agent for a repository — generates commit scopes from git history and .gitignore via AI. Use when the user asks to "configure git", "setup git", "set commit scopes", "update gitignore", "create gitignore", or needs project-specific Git settings.
user-invocable: true
argument-hint: "[scope|gitignore]"
model: haiku
allowed-tools: ["Bash(git-agent:*)", "Bash(git:*)", "Bash(ls:*)", "Bash(find:*)", "Read", "Write", "Edit", "AskUserQuestion"]
---
关键要求：
- 在运行 `git-agent init --gitignore` 之前，始终保留自定义 `.gitignore` 规则。
- 遇到身份验证错误（401）时，在同一个 `git-agent init` 命令末尾追加 `--free` 并重试。

1. 检查 `git config user.name` 和 `git config user.email`；如果任一项缺失，使用 `AskUserQuestion` 工具向用户收集。
2. 解析 `$ARGUMENTS` 以确定模式：
   - 为空 → 同时运行作用域和 gitignore 生成
   - `scope` → 仅运行作用域生成
   - `gitignore` → 仅运行 .gitignore 生成
3. 如果运行 gitignore 生成且 `.gitignore` 已存在：
   - 读取当前文件
   - 识别不属于标准 git-agent 生成块的行（即不在 `# --- git-agent ---` 标记之间的任何内容，或不属于常见自动生成模式的内容）
   - 保存这些自定义规则
4. 使用适当的标志运行 `git-agent init`：
   - 两者：`git-agent init --scope --gitignore --force`
   - 仅作用域：`git-agent init --scope --force`
   - 仅 Gitignore：`git-agent init --gitignore --force`
5. 遇到身份验证错误（401）时，在同一个命令末尾追加 `--free` 并重试。
6. 如果在步骤 3 中保存了自定义 `.gitignore` 规则，将其追加回文件并显示 `git diff .gitignore`。

CLI 参考文档：`${CLAUDE_PLUGIN_ROOT}/references/cli.md`