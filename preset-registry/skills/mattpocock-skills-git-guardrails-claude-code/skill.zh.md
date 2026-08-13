---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code.
---
# 设置 Git 防护栏

设置一个 `PreToolUse` 钩子，在 Claude 执行这些命令之前拦截并阻止危险的 `git` 命令。

## 被拦截的内容

- `git push`（包括所有变体，如 `--force`）
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

当命令被拦截时，Claude 会看到一条提示，说明其无权访问这些命令。

## 步骤

### 1. 确认范围

询问用户：仅为**本项目**安装（`.claude/settings.json`）还是**所有项目**安装（`~/.claude/settings.json`）？

### 2. 复制钩子脚本

捆绑脚本位于：[scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

根据范围将其复制到目标位置：

- **项目级**：`.claude/hooks/block-dangerous-git.sh`
- **全局**：`~/.claude/hooks/block-dangerous-git.sh`

使用 `chmod +x` 赋予可执行权限。

### 3. 将钩子添加到设置中

将其添加到相应的设置文件中：

**项目级**（`.claude/settings.json`）：

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

如果设置文件已存在，请将钩子合并到现有的 `hooks.PreToolUse` 数组中，不要覆盖其他设置。

### 4. 确认是否自定义

询问用户是否希望在拦截列表中新增或移除某些模式，并按需编辑已复制的脚本。

### 5. 验证

运行快速测试：

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

应返回退出码 `2`，并在 `stderr` 中打印 `BLOCKED` 消息。
