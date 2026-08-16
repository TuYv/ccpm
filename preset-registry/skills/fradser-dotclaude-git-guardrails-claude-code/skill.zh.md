---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code.
---
# 设置 Git 防护措施

设置一个 PreToolUse 钩子，在 Claude 执行危险的 git 命令之前将其拦截并阻止。

## 会阻止哪些命令

- `git push`（所有变体，包括 `--force`）
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

命令被阻止时，Claude 会看到一条消息，告知其无权使用这些命令。

## 步骤

### 1. 询问安装范围

询问用户：仅为**当前项目**（`.claude/settings.json`）安装，还是为**所有项目**（`~/.claude/settings.json`）安装？

### 2. 复制钩子脚本

随附的脚本位于：[scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

根据安装范围，将其复制到目标位置：

- **项目**：`.claude/hooks/block-dangerous-git.sh`
- **全局**：`~/.claude/hooks/block-dangerous-git.sh`

使用 `chmod +x` 使其可执行。

### 3. 将钩子添加到设置中

添加到相应的设置文件：

**项目**（`.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**全局**（`~/.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

如果设置文件已存在，请将该钩子合并到现有的 `hooks.PreToolUse` 数组中——不要覆盖其他设置。

### 4. 询问是否需要自定义

询问用户是否要在阻止列表中添加或移除任何匹配模式。相应地编辑复制后的脚本。

### 5. 验证

运行快速测试：

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

应以代码 2 退出，并向 stderr 输出一条 BLOCKED 消息。