---
name: agent-manager-skill
description: Manage multiple local CLI agents via tmux sessions (start/stop/monitor/assign) with cron-friendly scheduling.
---
# Agent Manager 技能

## 何时使用

当你需要执行以下操作时，请使用此技能：

- 并行运行多个本地 CLI 智能体（位于独立的 tmux 会话中）
- 启动/停止智能体并持续查看其日志
- 为智能体分配任务并监控输出
- 调度周期性智能体工作（cron）

## 前置条件

在你的工作区中安装 `agent-manager-skill`：

```bash
git clone https://github.com/fractalmind-ai/agent-manager-skill.git
```

## 常用命令

```bash
python3 agent-manager/scripts/main.py doctor
python3 agent-manager/scripts/main.py list
python3 agent-manager/scripts/main.py start EMP_0001
python3 agent-manager/scripts/main.py monitor EMP_0001 --follow
python3 agent-manager/scripts/main.py assign EMP_0002 <<'EOF'
Follow teams/fractalmind-ai-maintenance.md Workflow
EOF
```

## 注意事项

- 需要 `tmux` 和 `python3`。
- 智能体配置位于 `agents/` 目录下（示例请参阅该仓库）。