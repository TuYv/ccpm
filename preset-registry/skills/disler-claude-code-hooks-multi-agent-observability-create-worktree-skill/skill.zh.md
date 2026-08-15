---
name: create-worktree-skill
description: Use when the user explicitly asks for a SKILL to create a worktree. If the user does not mention "skill" or explicitly request skill invocation, do NOT trigger this. Only use when user says things like "use a skill to create a worktree" or "invoke the worktree skill". Creates isolated git worktrees with parallel-running configuration.
allowed-tools: SlashCommand, Bash, Read, Write, Edit, Glob, Grep
---
# Worktree 创建技能

此技能可用于创建配置完整的 git worktree，为并行开发提供相互隔离的端口、数据库和配置。

## 何时使用此技能

在以下情况下使用此技能：
- 用户要求创建 git worktree
- 用户希望搭建并行开发环境
- 用户需要同时运行多个实例
- 用户提到要同时处理多个分支
- 用户希望获得隔离的测试环境

## 说明

### 第 1 步：理解请求

从用户的请求中提取：
- **分支名称**（必需）：用于创建 worktree 的 git 分支
  - 如果未提供分支名称，请停止操作并要求用户提供分支名称
- **端口偏移量**（可选）：自定义端口偏移量（如未提供，则自动计算）

### 第 2 步：调用斜杠命令

使用 SlashCommand 工具运行：

```
/create_worktree_prompt <branch-name> [port-offset]
```

**示例：**
- `/create_worktree_prompt feature-auth` - 创建使用自动计算端口的 worktree
- `/create_worktree_prompt fix-bug 2` - 创建端口偏移量为 2 的 worktree（端口为 4020、5193）

### 第 3 步：分享结果

`/create_worktree_prompt` 命令将：
- 在 `trees/<branch-name>` 中创建 git worktree
- 配置隔离端口（自动递增以避免冲突）
- 使用正确的配置设置环境文件
- 安装服务端和客户端的依赖项
- 自动启动两个服务
- 提供访问 URL 和管理说明

与用户分享命令输出，并重点说明：
- 仪表盘的访问 URL
- 正在使用的端口
- 如何停止/重启 worktree
- 稍后如何将其移除

## 示例

### 示例 1：创建简单的 worktree

**用户：**“为 feature-dashboard 分支创建一个 worktree”

**你的回复：**使用 SlashCommand 运行 `/create_worktree_prompt feature-dashboard`

### 示例 2：使用指定端口偏移量的 worktree

**用户：**“在 hotfix-security 分支上搭建一个端口偏移量为 5 的并行环境”

**你的回复：**使用 SlashCommand 运行 `/create_worktree_prompt hotfix-security 5`

### 示例 3：多个 worktree

**用户：**“我需要为以下分支创建 worktree：feature-a、feature-b 和 feature-c”

**你的回复：**
1. 使用 SlashCommand 运行 `/create_worktree_prompt feature-a`
2. 使用 SlashCommand 运行 `/create_worktree_prompt feature-b`
3. 使用 SlashCommand 运行 `/create_worktree_prompt feature-c`

每个 worktree 都会自动获得唯一的端口（4010/5183、4020/5193、4030/5203）。

## 相关功能

- 创建的 worktree 将使用隔离的端口、数据库和配置自动运行
- 每个 worktree 都完全独立，可以与其他 worktree 同时运行

## 故障排除

如果命令执行失败，常见问题包括：
- 分支名称已被某个 worktree 使用
- 端口正在使用中（命令会自动终止占用它们的进程）
- 缺少依赖项（请确保已安装 bun）
- Git worktree 错误（请先处理未提交的更改）

该斜杠命令会提供详细的错误消息和建议。