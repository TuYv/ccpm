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

在执行 rm -rf、DROP TABLE、
强制推送、git reset --hard、kubectl delete 以及类似的破坏性操作之前发出警告。
用户可以覆盖每个警告。在操作生产环境、调试线上系统
或在共享环境中工作时使用。当用户要求“be careful”“safety mode”、
“prod mode”或“careful mode”时使用。

# /careful — 破坏性命令防护机制

安全模式现已**启用**。每条 bash 命令在运行前都会接受破坏性
模式检查。如果检测到破坏性命令，你会收到警告，
并可以选择继续或取消。

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

该钩子从工具输入 JSON 中读取命令，依据上述
模式进行检查；如果发现匹配项，则返回包含
`permissionDecision: "ask"` 和警告原因的 `hookSpecificOutput` 载荷（该
决策必须嵌套在 `hookSpecificOutput` 下——Claude Code 会忽略顶层的
`permissionDecision`）。你始终可以覆盖 MEDIUM 警告并
继续执行。

## HIGH 级别（硬性拒绝）

两种灾难性命令形式会被**拒绝**，而不是询问：对
`/`、`~` 或 `$HOME` 本身执行 `rm -r`/`-R`，以及强制推送到仓库的**默认分支**。仅限 SIMPLE
命令（不得包含 `;`、`&&`、`||`、`|`、换行符）——复合命令形式会
降级为 MEDIUM 询问；`--force-with-lease` 永远不会被归为 HIGH。这是一种尽力而为的
建议性硬停止机制，而不是策略边界：其绕过方式是结束当前
主动启用且作用域限定于会话的 /careful 会话。

## 项目模式（只能添加）

可在
`~/.gstack/careful-patterns.txt`（全局）或
`~/.gstack/projects/<slug>/careful-patterns.txt`（每个项目）中添加警告规则——每行一个 POSIX ERE，允许使用 `#` 注释。
这些规则会在内置规则族之后进行检查，因此配置只能添加规则，绝不能禁止
基线警告。无效的正则表达式行会被跳过。

如需停用，请结束对话或开始一个新对话。钩子的作用域限定于会话。