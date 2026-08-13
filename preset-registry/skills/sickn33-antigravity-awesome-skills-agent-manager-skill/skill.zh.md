---
name: agent-manager-skill
description: "Manage multiple local CLI agents via tmux sessions (start/stop/monitor/assign) with cron-friendly scheduling."
risk: critical
source: community
date_added: "2026-02-27"
---
# 代理管理器技能

## 何时使用
当你需要执行以下操作时使用此技能：

- 并行运行多个本地 CLI 代理（独立的 tmux 会话）
- 启动/停止代理并查看其日志尾部
- 向代理分配任务并监控输出
- 安排定期的代理工作（cron）

## 先决条件

在你的工作区安装 `agent-manager-skill`：

```bash
git clone https://github.com/fractalmind-ai/agent-manager-skill.git
```

## 常见命令

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
- 代理在 `agents/` 目录下配置（示例见仓库）。

## 限制
- 仅在任务明确符合上述范围时使用该技能。
- 不要将输出作为替代环境特定验证、测试或专家评审的替代品。
- 若缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
