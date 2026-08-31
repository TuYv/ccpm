---
name: qwen-code-claw
description: Use Qwen Code as a Code Agent for code understanding, project
  generation, features, bug fixes, refactoring, and various programming tasks
---
# Qwen Code Claw

## 使用此技能的时机

在以下情况下使用此技能：

- 了解代码库或询问有关源代码的问题
- 生成新项目或添加新功能
- 审查代码库中的拉取请求
- 修复 bug 或重构现有代码
- 执行各种编程任务，例如代码审查、测试、文档
  生成等
- 与其他工具和智能体协作，以完成复杂的开发任务

## 安装

```bash
npm install -g @qwen-code/qwen-code
```

对于需要正常复用会话的场景，优先使用全局安装，而不是 `npx`。

## 身份验证

检查是否已经配置身份验证：

```bash
qwen auth status
```

如果已完成身份验证，则跳过本节。如果尚未完成身份验证，请检查是否存在
`BAILIAN_CODING_PLAN_API_KEY` 环境变量：

```bash
echo $BAILIAN_CODING_PLAN_API_KEY
```

**如果 `BAILIAN_CODING_PLAN_API_KEY` 存在**，则直接进行身份验证：

```bash
qwen auth coding-plan --region china --key $BAILIAN_CODING_PLAN_API_KEY
```

**如果环境变量不存在**，请中断操作，并提示用户通过 `qwen-oauth` 或 `coding-plan` 完成身份验证：

```bash
qwen auth
```

或者在启动 Qwen Code 后通过 `/auth` 配置自定义 API。

## ACPX 集成

始终使用 `acpx` 通过 Agent Client Protocol
(ACP) 运行 Qwen Code，而不是抓取 PTY 会话。

使用 acpx：

1.  **全局安装 acpx**（推荐），或使用 npx：

```bash
npm install -g acpx@latest
```

或者不安装：

```bash
npx acpx@latest
```

2.  **安装 acpx 技能**以获取完整参考：

```bash
npx acpx@latest --skill install acpx
```

3.  **阅读 acpx 技能参考**，了解每个命令、标志和工作流模式：
    详情请参阅下方的 [ACPX 参考](#acpx-reference) 部分

4.  **如需包含所有选项和示例的完整 CLI 参考**：
    https://raw.githubusercontent.com/openclaw/acpx/main/docs/CLI.md

从现在起，当需要委派工作给 Qwen Code 时，请使用 `acpx`，而不是
启动原始终端会话。例如：

```bash
npx acpx@latest qwen "fix the failing tests"
npx acpx@latest qwen "refactor the auth module"
npx acpx@latest qwen exec "one-shot: summarize this repo"
```

> **提示：** 通常应使用 `--approve-all` 标志，以防止任务中断。

## 实用工作流

### 持久化仓库助手

```bash
acpx qwen 'inspect failing tests and propose a fix plan'
acpx qwen 'apply the smallest safe fix and run tests'
```

### 一次性脚本步骤

```bash
acpx qwen exec 'summarize repo purpose in 3 lines'
```

### 并行命名流

```bash
acpx qwen -s backend 'fix API pagination bug'
acpx qwen -s docs 'draft changelog entry for release'
```

### 无需等待即可排队后续任务

```bash
acpx qwen 'run full test suite and investigate failures'
acpx qwen --no-wait 'after tests, summarize root causes and next steps'
```

### 用于编排的机器可读输出

```bash
acpx --format json qwen 'review current branch changes' > events.ndjson
```

### 允许模式下的全仓库审查

```bash
acpx --cwd ~/repos/my-project --approve-all qwen -s pr-123 \
  'review PR #123 for regressions and propose minimal patch'
```

## 审批模式

- `--approve-all`：不显示交互式提示
- `--approve-reads`（默认）：自动批准读取/搜索操作，写入操作时提示
- `--deny-all`：拒绝所有权限请求

如果每个权限请求都被拒绝/取消，且没有任何请求获批，`acpx`
将以权限被拒绝的状态退出。

## 最佳实践

1.  使用**命名会话**来组织不同类型的开发任务
2.  对于长时间运行的任务，使用 `--no-wait` 以避免阻塞
3.  对于非交互式批处理操作，使用 `--approve-all`
4.  对于自动化和脚本集成，使用 `--format json`
5.  使用 `--cwd` 管理多个项目之间的上下文

## QwenCode 参考

### CLI 命令

| 命令        | 描述                 |
| ----------- | -------------------- |
| `/help`     | 显示可用命令         |
| `/clear`    | 清除对话历史         |
| `/compress` | 压缩历史记录以节省令牌 |
| `/stats`    | 显示会话信息         |
| `/auth`     | 配置身份验证         |
| `/exit`     | 退出 Qwen Code       |

完整参考：`docs/users/features/commands.md`。

### 配置

配置文件（优先级从高到低）：CLI 参数 > 环境变量 > 系统 > 项目
（`.qwen/settings.json`）> 用户（`~/.qwen/settings.json`）> 默认值。格式：
支持环境变量插值的 JSONC。

主要设置：

| 设置                         | 描述                                      |
| ---------------------------- | ----------------------------------------- |
| `model.name`                 | 要使用的模型（例如 `qwen-max`）           |
| `tools.approvalMode`         | `plan` / `default` / `auto_edit` / `yolo` |
| `permissions.allow/ask/deny` | 工具权限规则                              |
| `mcpServers.*`               | MCP 服务器配置                            |

完整参考：`docs/users/configuration/settings.md`。

### 身份验证

支持 Alibaba Cloud Coding Plan、OpenAI 兼容的 API 密钥以及 Qwen OAuth
（免费层已于 2026-04-15 停止）。

完整参考：`docs/users/configuration/auth.md`。

### 模型提供商

通过设置中的 `modelProviders` 或环境变量
（`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`）配置自定义模型提供商。

完整参考：`docs/users/configuration/model-providers.md`。

### 主要功能

- 审批模式：控制工具执行权限。
  参见 `docs/users/features/approval-mode.md`。
- MCP：模型上下文协议服务器集成。
  参见 `docs/users/features/mcp.md`。
- 技能：通过 `/skill` 使用可复用的技能系统。
  参见 `docs/users/features/skills.md`。
- 子代理：将任务委派给专门的代理。
  参见 `docs/users/features/sub-agents.md`。
- 沙箱：安全的代码执行环境。
  参见 `docs/users/features/sandbox.md`。
- 无头模式：非交互式或 CI 模式。
  参见 `docs/users/features/headless.md`。

## ACPX 参考

### 内置 Agent 注册表

已知的 agent 名称会解析为命令：

- `qwen` → `qwen --acp`

### 命令语法

```bash
# Default (prompt mode, persistent session)
acpx [global options] [prompt text...]
acpx [global options] prompt [options] [prompt text...]

# One-shot execution
acpx [global options] exec [options] [prompt text...]

# Session management
acpx [global options] cancel [-s <name>]
acpx [global options] set-mode <mode> [-s <name>]
acpx [global options] set <key> <value> [-s <name>]
acpx [global options] status [-s <name>]
acpx [global options] sessions [
  list | new [--name <name>] | close [name] | show [name] |
  history [name] [--limit <count>]
]
acpx [global options] config [show | init]

# With explicit agent
acpx [global options] <agent> [options] [prompt text...]
acpx [global options] <agent> prompt [options] [prompt text...]
acpx [global options] <agent> exec [options] [prompt text...]
```

> **注意：** 如果省略 prompt text 且通过管道传入 stdin，`acpx` 会从 stdin
> 读取 prompt。

### 全局选项

- `--agent <command>`：原始 ACP agent 命令回退选项。
- `--cwd <directory>`：会话工作目录。
- `--approve-all`：自动批准所有请求。
- `--approve-reads`：自动批准读取/搜索操作，写入操作需要提示确认。
- `--deny-all`：拒绝所有请求。
- `--format <format>`：输出格式，可选 `text`、`json` 或 `quiet`。
- `--timeout <seconds>`：最大等待时间。
- `--ttl <seconds>`：队列所有者的空闲 TTL。
- `--verbose`：将详细的 ACP/调试日志输出到 stderr。

在适用的情况下，各标志互斥。