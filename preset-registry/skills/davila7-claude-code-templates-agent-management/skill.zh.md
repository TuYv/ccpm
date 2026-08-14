---
name: agent-management
description: Create, manage, and orchestrate AI agents using the AI Maestro CLI. Use when the user asks to "create agent", "list agents", "delete agent", "hibernate agent", "wake agent", "install plugin", "show agent", "restart agent", or any agent lifecycle management task.
---
# AI Maestro 智能体管理

通过统一的 CLI 创建、管理和编排多个 AI 智能体。涵盖完整的智能体生命周期：创建、休眠、唤醒、重命名、导出/导入以及插件管理。属于 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 前置条件

需要在本地运行 [AI Maestro](https://github.com/23blocks-OS/ai-maestro)，并安装 tmux 3.0 或更高版本。

```bash
# Install the CLI
git clone https://github.com/23blocks-OS/ai-maestro-plugins.git
cd ai-maestro-plugins && ./install-agent-cli.sh
```

## 核心命令

### 智能体生命周期

| 命令 | 描述 |
|---------|-------------|
| `aimaestro-agent.sh list` | 列出所有智能体及其状态 |
| `aimaestro-agent.sh show <agent>` | 显示智能体的详细信息 |
| `aimaestro-agent.sh create <name> --dir <path>` | 创建新智能体 |
| `aimaestro-agent.sh update <agent> --task "..."` | 更新任务/标签 |
| `aimaestro-agent.sh delete <agent> --confirm` | 删除智能体 |
| `aimaestro-agent.sh rename <old> <new>` | 重命名智能体 |
| `aimaestro-agent.sh hibernate <agent>` | 保存状态并释放资源 |
| `aimaestro-agent.sh wake <agent>` | 恢复已休眠的智能体 |
| `aimaestro-agent.sh restart <agent>` | 先休眠再唤醒 |

### 插件管理

| 命令 | 描述 |
|---------|-------------|
| `aimaestro-agent.sh plugin install <agent> <plugin>` | 安装插件 |
| `aimaestro-agent.sh plugin uninstall <agent> <plugin>` | 移除插件 |
| `aimaestro-agent.sh plugin list <agent>` | 列出已安装的插件 |
| `aimaestro-agent.sh plugin marketplace add <agent> <source>` | 添加插件市场 |

### 导出/导入

| 命令 | 描述 |
|---------|-------------|
| `aimaestro-agent.sh export <agent>` | 导出智能体配置 |
| `aimaestro-agent.sh import <file>` | 从文件导入智能体 |

## 使用示例

```bash
# Create a backend API agent
aimaestro-agent.sh create backend-api \
  --dir ~/projects/backend \
  --task "Build REST API with TypeScript" \
  --tags "api,typescript"

# End of day -- save resources
aimaestro-agent.sh hibernate frontend-ui
aimaestro-agent.sh hibernate data-processor

# Resume next morning
aimaestro-agent.sh wake frontend-ui --attach

# Install a plugin on an agent
aimaestro-agent.sh plugin install backend-api my-plugin

# Backup before risky changes
aimaestro-agent.sh export backend-api -o backup.json
```

## 智能体状态

| 状态 | 含义 |
|--------|---------|
| `online` | 正在 tmux 会话中运行 |
| `offline` | 已注册，但没有活动会话 |
| `hibernated` | 状态已保存，会话已终止 |

## 完整的 AI Maestro 体验

此技能是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台的一部分，该平台为 AI 智能体编排提供 **6 项技能**：消息传递、记忆、文档、图谱、规划和智能体管理。