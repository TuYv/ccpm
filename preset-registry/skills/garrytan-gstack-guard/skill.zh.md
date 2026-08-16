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
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此技能

结合了 /careful（在执行 rm -rf、DROP TABLE、强制推送等操作前发出警告）与
/freeze（阻止对指定目录之外的内容进行编辑）。在操作生产环境或调试线上系统时，
使用此技能可获得最高级别的安全保障。当用户要求启用“guard mode”、
“full safety”、“lock it down”或“maximum safety”时使用。

# /guard — 全面安全模式

同时启用破坏性命令警告和限定目录范围的编辑限制。
这是将 `/careful` + `/freeze` 合并到单个命令中的组合模式。

**依赖说明：** 此技能会引用同级 `/careful`
和 `/freeze` 技能目录中的钩子脚本。两者都必须已安装（gstack 设置脚本会同时安装它们）。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"guard","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 设置

询问用户要将编辑限制在哪个目录中。使用 AskUserQuestion：

- 问题：“守护模式：应将编辑限制在哪个目录中？破坏性命令警告将始终启用。对所选路径之外文件的编辑将被阻止。”
- 文本输入（非多项选择）——用户输入一个路径。

用户提供目录路径后：

1. 将其解析为绝对路径：
```bash
FREEZE_DIR=$(cd "<user-provided-path>" 2>/dev/null && pwd)
echo "$FREEZE_DIR"
```

2. 确保路径末尾带有斜杠，并将其保存到冻结状态文件中：
```bash
FREEZE_DIR="${FREEZE_DIR%/}/"
eval "$(~/.claude/skills/gstack/bin/gstack-paths)"
STATE_DIR="$GSTACK_STATE_ROOT"
mkdir -p "$STATE_DIR"
echo "$FREEZE_DIR" > "$STATE_DIR/freeze-dir.txt"
echo "Freeze boundary set: $FREEZE_DIR"
```

告知用户：
- “**守护模式已启用。** 现在有两项保护正在运行：”
- “1. **破坏性命令防护** —— rm -rf、DROP TABLE、强制推送等命令在执行前会发出警告（可覆盖）；灾难性形式（递归删除 / 或 ~、强制推送到默认分支）将被强制拒绝”
- “2. **编辑边界** —— 文件编辑仅限于 `<path>/`。对该目录之外内容的编辑将被阻止。”
- “要移除编辑边界，请运行 `/unfreeze`。要停用所有保护，请结束会话。”

## 受保护的内容

有关破坏性命令模式和安全例外的完整列表，请参阅 `/careful`。
有关编辑边界强制执行方式的信息，请参阅 `/freeze`。