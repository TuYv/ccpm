---
name: freeze
version: 0.1.0
description: Restrict file edits to a specific directory for the session. (gstack)
triggers:
  - freeze edits to directory
  - lock editing scope
  - restrict file changes
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Edit"
      hooks:
        - type: command
          command: "bash $HOME/.claude/skills/gstack/freeze/bin/check-freeze.sh"
          statusMessage: "Checking freeze boundary..."
    - matcher: "Write"
      hooks:
        - type: command
          command: "bash $HOME/.claude/skills/gstack/freeze/bin/check-freeze.sh"
          statusMessage: "Checking freeze boundary..."
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## 何时调用此技能

阻止对允许路径外的 `Edit` 和 `Write`。在调试时用于防止意外“修复”无关代码，或希望将改动范围限制到某个模块时。  
当被要求“freeze”、“restrict edits”、“only edit this folder”或“lock down edits”时使用。

# /freeze — 限制编辑到一个目录

将文件编辑锁定到特定目录。任何针对允许路径外文件的 `Edit` 或 `Write` 操作都将被**阻止**（不仅仅是警告）。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"freeze","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 设置

询问用户要将编辑限制在哪个目录。使用 `AskUserQuestion`：

- 问题：`Which directory should I restrict edits to? Files outside this path will be blocked from editing.`
- 文本输入（非多选）——用户输入一个路径。

用户提供目录路径后：

1. 将其解析为绝对路径：
```bash
FREEZE_DIR=$(cd "<user-provided-path>" 2>/dev/null && pwd)
echo "$FREEZE_DIR"
```

2. 确保有尾随 `/` 并保存到冻结状态文件：
```bash
FREEZE_DIR="${FREEZE_DIR%/}/"
eval "$(~/.claude/skills/gstack/bin/gstack-paths)"
STATE_DIR="$GSTACK_STATE_ROOT"
mkdir -p "$STATE_DIR"
echo "$FREEZE_DIR" > "$STATE_DIR/freeze-dir.txt"
echo "Freeze boundary set: $FREEZE_DIR"
```

告知用户：`Edits are now restricted to <path>/. Any Edit or Write outside this directory will be blocked. To change the boundary, run /freeze again. To remove it, run /unfreeze or end the session.`

## 工作原理

该 hook 从 `Edit`/`Write` 工具输入的 JSON 中读取 `file_path`，然后检查该路径是否以冻结目录开头。如果不是，则返回 `permissionDecision: "deny"` 以阻止该操作。

冻结边界通过状态文件在会话期间持久化。hook 脚本在每次 `Edit`/`Write` 调用时都会读取它。

## 说明

- 冻结目录上的尾随 `/` 可防止 `/src` 匹配 `/src-old`
- Freeze 仅适用于 `Edit` 和 `Write` 工具——`Read`、`Bash`、`Glob`、`Grep` 不受影响
- 这可防止意外编辑，而非安全边界——`sed` 等 `Bash` 命令仍可修改边界外的文件
- 要停用，请运行 `/unfreeze` 或结束会话
