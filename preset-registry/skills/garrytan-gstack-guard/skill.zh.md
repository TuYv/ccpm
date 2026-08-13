---
name: guard
version: 0.1.0
description: "Full safety mode: destructive command warnings + directory-scoped edits. (gstack)"
triggers:
  - full safety mode
  - guard against mistakes
  - maximum safety
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash $HOME/.claude/skills/gstack/careful/bin/check-careful.sh"
          statusMessage: "Checking for destructive commands..."
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
<!-- 来自 SKILL.md.tmpl 的自动生成内容 — 请勿直接编辑 -->
<!-- 重新生成方式：bun run gen:skill-docs -->


## 何时调用此 skill

将 `/careful`（在执行 `rm -rf`、`DROP TABLE`、`force-push` 等前发出警告）与 `/freeze`（限制在指定目录外无法编辑）结合起来。用于在触碰生产环境或调试在线系统时实现最高安全性。用户要求“guard mode”、“full safety”、“lock it down”或“maximum safety”时使用。

# /guard — 完全安全模式

同时激活危险命令告警和目录作用域编辑限制。
这是 `/careful` 与 `/freeze` 的单一组合命令。

**依赖说明：** 本 skill 引用了同级目录下 `/careful` 和 `/freeze` 的 hook 脚本。两者都必须已安装（它们会由 gstack 设置脚本一并安装）。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"guard","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 设置

向用户询问要限制编辑到哪个目录。使用 AskUserQuestion：

- 问题：“Guard mode：应将编辑限制在哪个目录？危险命令告警始终开启。所选路径外的文件将禁止编辑。”
- 文本输入（非多选）——用户输入一个路径。

用户提供目录路径后：

1. 将其解析为绝对路径：
```bash
FREEZE_DIR=$(cd "<user-provided-path>" 2>/dev/null && pwd)
echo "$FREEZE_DIR"
```

2. 确保以斜杠结尾并保存到冻结状态文件：
```bash
FREEZE_DIR="${FREEZE_DIR%/}/"
eval "$(~/.claude/skills/gstack/bin/gstack-paths)"
STATE_DIR="$GSTACK_STATE_ROOT"
mkdir -p "$STATE_DIR"
echo "$FREEZE_DIR" > "$STATE_DIR/freeze-dir.txt"
echo "Freeze boundary set: $FREEZE_DIR"
```

告知用户：
- “**Guard mode active.** Two protections are now running:”
- “1. **Destructive command warnings** — rm -rf、DROP TABLE、force-push 等在执行前会发出警告（可覆盖）”
- “2. **Edit boundary** — 文件编辑已限制在 `<path>/`。该目录外的编辑将被阻止。”
- “To remove the edit boundary, run `/unfreeze`. To deactivate everything, end the session.”

## 受保护范围

详见 `/careful` 获取完整的危险命令模式及安全例外列表。
详见 `/freeze` 了解编辑边界执行机制。
