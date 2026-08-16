---
name: careful
version: 0.1.0
description: Safety guardrails for destructive commands. (gstack)
triggers:
  - be careful
  - warn before destructive
  - safety mode
allowed-tools:
  - Bash
  - Read
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash $HOME/.claude/skills/gstack/careful/bin/check-careful.sh"
          statusMessage: "Checking for destructive commands..."
---
<!-- 由 SKILL.md.tmpl 自动生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

在执行 rm -rf、DROP TABLE、
强制推送、git reset --hard、kubectl delete 及类似破坏性操作前发出警告。
用户可以覆盖每项警告。适用于操作生产环境、调试线上系统
或在共享环境中工作时。当用户要求“be careful”“safety mode”
“prod mode”或“careful mode”时使用。

# /careful — 破坏性命令防护措施

安全模式现已**启用**。每条 bash 命令在运行前都会接受破坏性
模式检查。如果检测到破坏性命令，你将收到警告，并可以选择继续或取消。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"careful","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 受保护的操作

| 模式 | 示例 | 风险 |
|---------|---------|------|
| `rm -rf` / `rm -r` / `rm --recursive` | `rm -rf /var/data` | 递归删除 |
| `DROP TABLE` / `DROP DATABASE` | `DROP TABLE users;` | 数据丢失 |
| `TRUNCATE` | `TRUNCATE orders;` | 数据丢失 |
| `git push --force` / `-f` | `git push -f origin main` | 重写历史记录 |
| `git reset --hard` | `git reset --hard HEAD~3` | 丢失未提交的工作 |
| `git checkout .` / `git restore .` | `git checkout .` | 丢失未提交的工作 |
| `kubectl delete` | `kubectl delete pod` | 影响生产环境 |
| `docker rm -f` / `docker system prune` | `docker system prune -a` | 丢失容器/镜像 |

## 安全例外

以下模式无需警告即可执行：
- `rm -rf node_modules` / `.next` / `dist` / `__pycache__` / `.cache` / `build` / `.turbo` / `coverage`

## 工作原理

该钩子从工具输入 JSON 中读取命令，根据上述
模式进行检查；如果发现匹配项，则返回一个包含
`permissionDecision: "ask"` 和警告原因的 `hookSpecificOutput` 载荷（该
决定必须嵌套在 `hookSpecificOutput` 下——Claude Code 会忽略顶层的
`permissionDecision`）。你始终可以覆盖警告并继续执行。

要停用此模式，请结束当前对话或开始新对话。钩子的作用域仅限当前会话。