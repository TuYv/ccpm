---
name: agency-os
description: |
  Notion-as-source-of-truth dispatch board for running your work like an AI agency.
  One Tasks database is the source of truth; tasks flow Suggestion through
  Discussion, To-Do, In Progress, and Done with subtasks, recurring cadences,
  dependencies, and template subtrees. Batch execution fans approved To-Do rows
  out to parallel agents with per-task model selection. Use when capturing chat
  to Notion, running the To-Do queue, suggesting, approving, or discussing tasks,
  or coordinating multi-task batches. Trigger with "/agency-os" subcommands or
  natural-language variants ("add a suggestion: …", "let's discuss X",
  "run the queue").
allowed-tools: Read, Write, Edit, Bash(python3:*), Bash(npx:*), Glob, Grep
version: 0.2.0
author: ratamaha-git <ratamaha@automatelab.tech>
license: MIT
compatibility: Designed for Claude Code; requires the Notion MCP server (@notionhq/notion-mcp-server) and a Notion workspace with a Tasks database
tags: [ai-agency, notion, orchestration, mcp, dispatch, parallel-execution]
---
# agency-os

以 Notion 作为事实来源的调度看板。一个 Tasks 数据库、一个 Hub 页面、每个 Corpus 一个页面，以及分别用于 General Guidance 和 Resources 的页面。该 skill 通过 Notion MCP（`mcp__*__notion-*` 工具）修改 Notion；只有 `references/notion-pointers.json` 会提交到 git。

**Skill 命名决策：**该 skill 命名为 `agency-os`（与仓库保持一致）。所有命令均为 `/agency-os <cmd>`。这是唯一的插件入口点；不存在 `agency-os/notion` 子命名空间。若将此插件与其他插件一同嵌入，请使用 `agency-os` 作为命令前缀以避免冲突。

## 概述

agency-os 将单个 Notion 数据库转变为用于 AI 工作的多状态调度看板。该模型刻意保持精简：

- **一个 Tasks 数据库**是状态、优先级、模型选择和归属关系的事实来源。不存在并行的看板工具。
- **一个 Hub 页面**保存每个任务都会查阅的 General Guidance、Resources 和 Corpus 指针。
- **任务经过五个状态流转**：Suggestion → Discussion → To-Do → In Progress → Done。每次转换时的去重门控可防止意外重复执行。
- **`run`** 会将已批准的 To-Do 行分发给并行 agent。每个任务都携带自己的模型选择（Haiku 用于低成本扇出，Sonnet 用于默认场景，Opus 用于高难度推理），并遵循已声明的依赖关系。

该 skill 在磁盘上是**无状态的**——唯一提交的产物是 `references/notion-pointers.json`（数据库/页面 ID）。所有运行时状态均存储在 Notion 中。

有关完整架构（状态流转、同步协议、工作区结构、指针/缓存格式），请参阅 [`references/architecture.md`](references/architecture.md)。

## 前置条件

- **已安装 Notion MCP 服务器**：
  `npx -y @notionhq/notion-mcp-server`（在 `.mcp.json` 中声明）
- 对你的工作区具有读写访问权限的 **Notion 集成令牌**（`NOTION_TOKEN`）。将 `.env` 添加到 `.gitignore`——绝不要提交该令牌。
- 包含该 skill 所需列的 **Notion Tasks 数据库**（有关 schema，请参阅 `references/architecture.md` §“Workspace structure”）。`/agency-os init` 命令可为你搭建此结构。
- 用于可选 `scripts/query-tasks.py` 辅助工具的 **Python 3**。

首次设置：

```bash
ccpi install agency-os
# then in Claude Code:
/agency-os init --harness=basic --haiku=cost-tier --sonnet=default --opus=hard-reasoning
```

## 使用说明

该 skill 是 Notion 之上的 CLI 界面。提供三种使用模式：

1. **直接调用命令**——`/agency-os <cmd> [args]`。完整参考请参阅 [`references/commands.md`](references/commands.md)，其中包含 19 个命令（`init`、`scaffold`、`suggest`、`discuss`、`log`、`add-subtask`、`approve`、`start`、`refresh`、`run`、`done`、`kill`、`next`、`status`、`list`、`show`、`update`、`move`，以及 `launch` 别名）。

2. **自然语言驱动**——该 skill 会将对话式聊天转换为相应命令。示例参见 [`references/natural-language.md`](references/natural-language.md)。

3. **批量执行** — `/agency-os run [--go]` 会根据每个任务的模型选择，将整个待办队列分发给并行代理。规范流程见下方的 `## 示例`。

状态流程受到强制约束 — 你不能跳过任何阶段。每个命令都会执行同步预检，以确保你本地看到的 Notion 视图是最新的（参见 `references/architecture.md` § “同步 — 每个命令执行预检”）。

起草任何面向用户的文案（README、博客文章、发布页面）时，必须先应用 [`references/positioning.md`](references/positioning.md) 中的定位简报，然后再开始写作。

## 输出

每个命令都会向聊天返回：

- **结果行** — `✅ <操作>` 或 `⚠️ <原因>`（单行，便于快速浏览）
- **受影响的任务 ID 和标题** — 每个被修改的任务及其新状态
- **下一步操作提示** — 操作员通常接下来会运行的命令

批量 `run` 还会输出：

- 按任务列出的通过/失败表格
- 模型总消耗估算（Haiku/Sonnet/Opus 调用次数）
- 无法启动任务的未解决依赖项提示

## 错误处理

该技能在五种定义明确的情况下会以关闭方式失败（完整详情见 `references/architecture.md` § “状态流程 — 去重门”）：

| 条件 | 行为 |
|---|---|
| Notion API 认证失败 | 停止，输出 "NOTION_TOKEN missing or invalid"，以状态码 1 退出 |
| 数据库/页面 ID 偏移（指针已过期） | 停止，输出 "Run `/agency-os refresh`"，以状态码 1 退出 |
| 违反状态流程（例如在 Suggestion 上执行 `approve`） | 停止，并引用所需的前置步骤 |
| 在 `run` 期间检测到依赖循环 | 停止，列出循环，以状态码 1 退出 |
| 任务缺少必需的模型选择 | 停止，输出 "Run `/agency-os update <id> --model <tier>`" |

该技能绝不会静默修正 Notion 中的状态 — 每项修复都必须由操作员运行显式命令完成。

## 示例

将聊天中的洞见记录为 Suggestion：

```text
User: add a suggestion: refactor the auth flow to use the new token cache
Skill: → /agency-os suggest "refactor the auth flow to use the new token cache"
       ✅ Created Suggestion #t-2026-05-23-001 in corpus "platform"
       Next: /agency-os discuss t-2026-05-23-001
```

批准并运行一个批次：

```text
User: approve t-2026-05-23-{001..003} then run the queue
Skill: ✅ Approved 3 tasks → To-Do
       /agency-os run --go
       → fanning to 3 parallel agents...
       ✅ Done: 2 | ⚠️ Blocked on deps: 1 | Total spend: ~$0.04
```

更多示例和完整命令目录见 [`references/commands.md`](references/commands.md)。

## 资源

- **插件源代码**: <https://github.com/ratamaha-git/agency-os>
- **发布文章**: <https://automatelab.tech/agency-os-launch/>
- **`references/architecture.md`** — 状态流程、同步协议、工作区架构
- **`references/commands.md`** — 完整 CLI 参考（19 个命令）
- **`references/natural-language.md`** — 聊天到命令的转换表
- **`references/positioning.md`** — 面向用户文案的规范简报
- **`references/general-guidance.md`** — 应用于每个任务的共享操作原则
- **`references/notion-pointers.json`** — 指针文件脚手架（数据库/页面 ID）
- **`references/task-page-template.md`** — 新任务的 Notion 页面模板
- **`references/corpus-template.md`** — Corpus 的 Notion 页面模板
- **`references/config-template.json`** — 默认的按任务模型路由
- **`scripts/query-tasks.py`** — 用于离线检查的可选 Python 辅助工具