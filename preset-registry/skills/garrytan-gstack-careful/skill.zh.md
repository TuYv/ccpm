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
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此技能

在执行 `rm -rf`、`DROP TABLE`、`force-push`、`git reset --hard`、`kubectl delete` 等类似破坏性操作前发出警告。
用户可以覆盖每条警告。在触及生产环境、调试在线系统或在共享环境中工作时使用。若被要求“be careful”、“safety mode”、“prod mode”或“careful mode”时也应使用。

# /careful — 破坏性命令防护栏

安全模式现已**激活**。每条 bash 命令都会在运行前检查是否包含破坏性模式。若检测到破坏性命令，你会收到警告并可选择继续执行或取消。

```bash
mkdir -p ~/.gstack/analytics
echo '{"skill":"careful","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
```

## 保护范围

| Pattern | Example | Risk |
|---------|---------|------|
| `rm -rf` / `rm -r` / `rm --recursive` | `rm -rf /var/data` | 递归删除 |
| `DROP TABLE` / `DROP DATABASE` | `DROP TABLE users;` | 数据丢失 |
| `TRUNCATE` | `TRUNCATE orders;` | 数据丢失 |
| `git push --force` / `-f` | `git push -f origin main` | 历史重写 |
| `git reset --hard` | `git reset --hard HEAD~3` | 未提交工作丢失 |
| `git checkout .` / `git restore .` | `git checkout .` | 未提交工作丢失 |
| `kubectl delete` | `kubectl delete pod` | 生产环境影响 |
| `docker rm -f` / `docker system prune` | `docker system prune -a` | 容器/镜像丢失 |

## 安全例外

这些模式不提示警告：
- `rm -rf node_modules` / `.next` / `dist` / `__pycache__` / `.cache` / `build` / `.turbo` / `coverage`

## 工作原理

该钩子从工具输入 JSON 中读取命令，并与上述模式进行比对；若命中则返回 `permissionDecision: "ask"` 及警告信息。你始终可以覆盖该警告并继续执行。

要停用，请结束当前对话或开启新对话。钩子按会话范围生效。
