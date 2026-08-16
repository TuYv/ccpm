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
<!-- 从 SKILL.md.tmpl 自动生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此 skill

阻止在允许路径之外执行 Edit 和 Write。适用于调试时防止意外“修复”无关代码，或希望将更改范围限定在某个模块时。
当用户要求“冻结”“限制编辑”“仅编辑此文件夹”或“锁定编辑范围”时使用。

# /freeze — 将编辑限制在一个目录内

将文件编辑操作限定在特定目录内。任何以允许路径之外的文件为目标的 Edit 或 Write 操作都会被**阻止**（而不仅仅是警告）。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"freeze","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 设置

询问用户要将编辑限制在哪个目录。使用 AskUserQuestion：

- 问题：“要将编辑限制在哪个目录？对此路径之外的文件进行编辑将被阻止。”
- 文本输入（非多项选择）— 用户输入一个路径。

用户提供目录路径后：

1. 将其解析为绝对路径：
```bash
FREEZE_DIR=$(cd "<user-provided-path>" 2>/dev/null && pwd)
echo "$FREEZE_DIR"
```

2. 确保末尾包含斜杠，并保存到冻结状态文件：
```bash
FREEZE_DIR="${FREEZE_DIR%/}/"
eval "$(~/.claude/skills/gstack/bin/gstack-paths)"
STATE_DIR="$GSTACK_STATE_ROOT"
mkdir -p "$STATE_DIR"
echo "$FREEZE_DIR" > "$STATE_DIR/freeze-dir.txt"
echo "Freeze boundary set: $FREEZE_DIR"
```

告诉用户：“编辑现已限制在 `<path>/` 内。此目录之外的任何 Edit 或 Write 操作都将被阻止。要更改边界，请再次运行 `/freeze`。要移除该限制，请运行 `/unfreeze` 或结束会话。”

## 工作原理

该 hook 从 Edit/Write 工具的输入 JSON 中读取 `file_path`（使用与 /careful 共享的真实 JSON 提取器——只有一份副本，由两个 hook 共同引用），然后检查该路径是否以冻结目录开头。如果不是，则返回一个包含 `permissionDecision: "deny"` 的 `hookSpecificOutput` 负载，以阻止该操作（嵌套在 `hookSpecificOutput` 下——Claude Code 会忽略顶层的 `permissionDecision`）。

其策略为失败时关闭：如果 hook 无法解析工具负载，则会拒绝，而不是允许——一个在失败时开放的边界不能算作边界。如果负载可以解析但没有 `file_path`（即非文件工具），则允许执行。符号链接会解析到其最终组件，因此，如果边界内的符号链接指向边界外，则会根据其目标进行检查。

冻结边界通过状态文件在会话期间持续生效。hook 脚本会在每次调用 Edit/Write 时读取该文件。支持包含空格的边界路径。

## 注意事项

- 冻结目录末尾的 `/` 可防止 `/src` 匹配 `/src-old`
- 冻结仅适用于 Edit 和 Write 工具——Read、Bash、Glob、Grep 不受影响
- 这用于防止意外编辑，并非安全边界——`sed` 等 Bash 命令仍然可以修改边界之外的文件
- 要停用，请运行 `/unfreeze` 或结束对话