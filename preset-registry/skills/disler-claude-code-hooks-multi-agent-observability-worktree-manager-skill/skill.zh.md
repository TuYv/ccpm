---
name: worktree-manager-skill
description: Comprehensive git worktree management. Use when the user wants to create, remove, list, or manage worktrees. Handles all worktree operations including creation, deletion, and status checking.
allowed-tools: SlashCommand, Bash, Read, Write, Edit, Glob, Grep
---
# Worktree 管理器技能

为并行开发环境提供完整的 worktree 生命周期管理，包括隔离的端口、数据库和配置。

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：
- **创建**用于并行开发的新 worktree
- **移除**现有 worktree
- **列出**所有 worktree 及其状态
- **检查**worktree 配置或状态
- **管理**多个并行开发环境

**以下情况请勿使用此技能：**
- 用户要求使用特定的子代理或委派给某项技能
- 用户希望直接手动使用 git 命令
- 任务与 worktree 管理无关

## 操作概览

此技能管理三项核心 worktree 操作：

| 操作 | 命令 | 使用场景 |
|-----------|---------|-------------|
| **创建** | `/create_worktree` | 用户需要新的并行环境 |
| **列出** | `/list_worktrees` | 用户希望查看现有 worktree |
| **移除** | `/remove_worktree` | 用户希望删除 worktree |

## 决策树：应使用哪个命令

### 1. 用户希望创建 worktree
**关键词：** 创建、新建、设置、制作、构建、启动、初始化
**操作：** 使用 `/create_worktree <branch-name> [port-offset]`

### 2. 用户希望列出 worktree
**关键词：** 列出、显示、展示、什么、哪个、状态、检查、查看
**操作：** 使用 `/list_worktrees`

### 3. 用户希望移除 worktree
**关键词：** 移除、删除、清理、销毁、停止、终止、结束
**操作：** 使用 `/remove_worktree <branch-name>`

## 快速开始

有关分步操作说明，请参阅 [OPERATIONS.md](OPERATIONS.md)。

有关详细示例和使用模式，请参阅 [EXAMPLES.md](EXAMPLES.md)。

有关故障排除和常见问题，请参阅 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。

有关技术细节和快速参考，请参阅 [REFERENCE.md](REFERENCE.md)。

## 重要说明

### 请勿尝试：
- 使用 git 命令手动创建 worktree
- 手动配置端口或环境文件
- 使用 bash 直接移除目录
- 手动管理 worktree 进程

### 始终使用斜杠命令，因为它们会：
- 自动处理所有配置
- 确保端口唯一
- 验证操作
- 提供全面的错误处理
- 在移除时正确清理