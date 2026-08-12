---
name: dmux-workflows
description: Multi-agent orchestration using dmux (tmux pane manager for AI agents). Patterns for parallel agent workflows across Claude Code, Codex, OpenCode, and other harnesses. Use when running multiple agent sessions in parallel or coordinating multi-agent development workflows.
---
# dmux 工作流

使用 dmux（面向智能体工具框架的 tmux 窗格管理器）编排并行 AI 智能体会话。

## 何时启用

- 并行运行多个智能体会话
- 协调 Claude Code、Codex 和其他工具框架之间的工作
- 适合通过分治并行处理的复杂任务
- 用户提到“并行运行”“拆分这项工作”“使用 dmux”或“多智能体”

## 什么是 dmux

dmux 是一款基于 tmux 的编排工具，用于管理 AI 智能体窗格：
- 按 `n` 创建一个带有提示词的新窗格
- 按 `m` 将窗格输出合并回主会话
- 支持：Claude Code、Codex、OpenCode、Cline、Gemini、Qwen

**安装：** `npm install -g dmux`，或参阅 [github.com/standardagents/dmux](https://github.com/standardagents/dmux)

## 快速开始

```bash
# Start dmux session
dmux

# Create agent panes (press 'n' in dmux, then type prompt)
# Pane 1: "Implement the auth middleware in src/auth/"
# Pane 2: "Write tests for the user service"
# Pane 3: "Update API documentation"

# Each pane runs its own agent session
# Press 'm' to merge results back
```

## 工作流模式

### 模式 1：研究 + 实现

将研究和实现拆分为并行任务：

```
Pane 1 (Research): "Research best practices for rate limiting in Node.js.
  Check current libraries, compare approaches, and write findings to
  /tmp/rate-limit-research.md"

Pane 2 (Implement): "Implement rate limiting middleware for our Express API.
  Start with a basic token bucket, we'll refine after research completes."

# After Pane 1 completes, merge findings into Pane 2's context
```

### 模式 2：多文件功能开发

在相互独立的文件之间并行开展工作：

```
Pane 1: "Create the database schema and migrations for the billing feature"
Pane 2: "Build the billing API endpoints in src/api/billing/"
Pane 3: "Create the billing dashboard UI components"

# Merge all, then do integration in main pane
```

### 模式 3：测试 + 修复循环

在一个窗格中运行测试，在另一个窗格中进行修复：

```
Pane 1 (Watcher): "Run the test suite in watch mode. When tests fail,
  summarize the failures."

Pane 2 (Fixer): "Fix failing tests based on the error output from pane 1"
```

### 模式 4：跨工具框架

针对不同任务使用不同的 AI 工具：

```
Pane 1 (Claude Code): "Review the security of the auth module"
Pane 2 (Codex): "Refactor the utility functions for performance"
Pane 3 (Claude Code): "Write E2E tests for the checkout flow"
```

### 模式 5：代码审查流水线

从多个视角并行进行审查：

```
Pane 1: "Review src/api/ for security vulnerabilities"
Pane 2: "Review src/api/ for performance issues"
Pane 3: "Review src/api/ for test coverage gaps"

# Merge all reviews into a single report
```

## 最佳实践

1. **仅处理独立任务。** 不要并行处理依赖彼此输出的任务。
2. **明确边界。** 每个窗格应处理不同的文件或关注点。
3. **有策略地合并。** 合并前审查窗格输出，以避免冲突。
4. **使用 git worktrees。** 对于容易发生文件冲突的工作，为每个窗格使用独立的 worktree。
5. **注意资源使用。** 每个窗格都会消耗 API token——将窗格总数控制在 5-6 个以内。

## Git Worktree 集成

对于会修改重叠文件的任务：

```bash
# Create worktrees for isolation
git worktree add ../feature-auth feat/auth
git worktree add ../feature-billing feat/billing

# Run agents in separate worktrees
# Pane 1: cd ../feature-auth && claude
# Pane 2: cd ../feature-billing && claude

# Merge branches when done
git merge feat/auth
git merge feat/billing
```

## 辅助工具

| 工具 | 功能 | 使用场景 |
|------|-------------|-------------|
| **dmux** | 面向智能体的 tmux 窗格管理 | 并行智能体会话 |
| **Superset** | 支持 10 个以上并行智能体的终端 IDE | 大规模编排 |
| **Claude Code Task 工具** | 在进程内生成子智能体 | 单个会话内的程序化并行 |
| **Codex 多智能体** | 内置智能体角色 | Codex 专用的并行工作 |

## 故障排除

- **窗格无响应：** 检查智能体会话是否正在等待输入。使用 `m` 读取输出。
- **合并冲突：** 使用 git worktree 隔离每个窗格中的文件更改。
- **Token 使用量过高：** 减少并行窗格的数量。每个窗格都是一个完整的智能体会话。
- **找不到 tmux：** 使用 `brew install tmux`（macOS）或 `apt install tmux`（Linux）进行安装。