---
name: agent-manager-skill
description: "Manage multiple local CLI agents via tmux sessions (start/stop/monitor/assign) with cron-friendly scheduling."
risk: critical
source: community
date_added: "2026-02-27"
---
# Agent Manager 技能

## 使用场景
在以下情况下使用此技能：

- 并行运行多个本地 CLI 代理（使用独立的 tmux 会话）
- 启动/停止代理并跟踪其日志
- 为代理分配任务并监控输出
- 安排定期代理工作（cron）

## 前提条件

在你的工作区安装 `agent-manager-skill`：

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
- 代理在 `agents/` 目录下配置（示例见仓库）。

## 限制
- 仅在任务与上述描述范围明确匹配时使用此技能。
- 不要将输出视为对特定环境验证、测试或专家审查的替代。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止并请求澄清。
