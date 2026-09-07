---
name: open-tag-admin
description: Admin/control console for an Open Tag Slack tag-in workflow backed by MFS. Use to set up a new Open Tag bot from scratch, check what is currently running (backend, permitted MFS scopes, Slack channel), change settings, add or remove data sources, switch the CLI agent backend (claude -p / codex exec), invite or move the bot in Slack, run preflight checks, and troubleshoot thread context, retrieval, or task execution.
---
# Open Tag (admin)

本技能是 Open Tag 部署的**控制台**。无论是首次设置还是日常运维都
可使用它：检查运行中的机器人、更换后端或允许的 scope、添加新的数据源、
把机器人迁移到另一个 Slack 频道，或者对某次运行进行调试。

保持架构的通用性：

- **Brain（大脑）**：所选的 CLI agent 后端 —— `claude -p` (Claude Code) 或
  `codex exec` (Codex)。
- **Memory（记忆）**：由 MFS 索引、经操作者授权的上下文，例如 Slack 历史、
  代码仓库、文档、issue、数据库或对象存储。
- **Tools（工具）**：用于外部读取/搜索的 MFS 连接器，以及后端在工作区内
  被允许使用的任何显式工具。

面向用户的流程如下：

1. 配置 MFS 数据源及允许的 scope。
2. 配置一个启用 Socket Mode 的 Slack 应用，并把它邀请到一个沙箱频道。
3. 启动 Open Tag 桥接程序。
4. 切换到 Slack，在某个消息串（thread）中提及机器人。
5. 让桥接程序带上消息串上下文和限定 scope 的 MFS 辅助脚本，调用所选后端，
   以获取被许可的外部上下文。

本技能不直接调用模型 API。模型访问、工具访问和写入权限均来自所选的
CLI agent 后端。

## 前置条件

Open Tag 只是构建在**一台正在运行的 MFS 服务器和至少一个已索引数据源**
之上的一层薄封装。在进行任何 Slack 相关工作之前，先确认以下各项：

1. **MFS 服务器已安装并正在运行。** `uv tool install mfs-server`，然后
   `mfs-server run`（绑定 `127.0.0.1:13619`）。用
   `curl -s 127.0.0.1:13619/healthz` 检查。
2. **至少一个数据源已被索引。** Open Tag 只*消费*已索引的 scope 作为
   Memory —— 它自己不配置连接器。添加数据源请使用 **mfs-ingest** 技能
   （Codex：`$mfs-ingest`）；参见下文的“添加数据源”。

若缺少其中任何一项，`opentag_doctor.py` 都会快速失败（fail fast）并给出提示。

## 机器人命名约定

Slack 中的显示名称就是你对 Slack 应用的命名 —— Open Tag 的代码无论如何
都会剥离提及（mention）部分。推荐采用如下约定，使其读起来就像官方的
`@Claude` 标签一样：

| 后端 | 建议的 Slack 应用名 | 在 Slack 中 |
|---|---|---|
| `claude` | **OpenClaude** | `@OpenClaude <task>` |
| `codex` | **OpenCodex** | `@OpenCodex <task>` |

创建 Slack 应用时（第 3 步）请按此约定命名。如果希望启动摘要打印
不同的标签，可设置 `OPENTAG_BOT_NAME`。

## 安装流程

1. 满足上文的**前置条件**（MFS 正在运行 + 至少一个已索引数据源）。
2. 阅读 `references/slack-adapter.md` 并遵循其中的端到端检查清单。
3. 确认或创建一个私有的或以其他方式隔离的 Slack 频道。
4. 按上述约定创建或复用一个 Slack 应用，启用 Socket Mode，订阅
   `app_mention`，添加所需的 bot scope，安装到工作区，并把机器人邀请
   到该频道。
5. 配置 MFS 记忆数据源，并把 `MFS_ALLOWED_SCOPES` 设为运行时 agent
   可使用的确切数据源根路径。
6. 显式选择 `OPENTAG_BACKEND`：`claude` 或 `codex`。
7. 运行 `python scripts/opentag_doctor.py --channel-id <channel-id>`，
   修复所有未通过的检查。
8. 使用
   `uv run --with slack-bolt python scripts/slack_socket_agent.py --backend <backend>`
   启动桥接程序。它会打印一份“当前已上线内容”的摘要 —— 阅读该摘要，
   然后用一个贴近实际的委派任务验证消息串上下文、许可上下文的检索以及
   任务执行。

## 添加数据源

Open Tag 可触及的范围就是 MFS 已索引的内容加上你在 `MFS_ALLOWED_SCOPES`
中列出的内容。添加数据源请使用 **mfs-ingest** 技能 —— 它负责处理凭据并
写入连接器配置；Open Tag 绝不重复做这些事。

有代表性的数据源（每个只需执行一次 `mfs add <uri> --config <toml>`，
再将其根路径加入 `MFS_ALLOWED_SCOPES`）：

- **本地代码仓库 / 文档**：`mfs add /path/to/repo` → `file://local/path/to/repo`
- **Slack 历史**：`slack://team-memory`（自有 token + 频道允许列表）
- **GitHub（代码 + issue）**：`github://your-org/your-repo`
- **Linear（issue）**：`linear://your-workspace`
- **Postgres 行数据**：`postgres://prod`

MFS 支持 20 多种连接器（数据库、对象存储、缺陷跟踪系统、聊天工具、网页）。
完整列表及各连接器的凭据要求，请引导用户查看 **mfs-ingest** 技能和
`docs/connectors/`。这种 Memory 的广度 —— 包括原始数据层，全部自托管 ——
是 Open Tag 相对托管式 tag 机器人的主要优势；它**不会**添加托管式的
治理、审计或审批流程。

## 各 Python 脚本的职责

保持这些 Python 脚本作为确定性的胶水层：

- `slack_socket_agent.py`：接收 Slack 的 `app_mention`，读取消息串，发布进度，
  调用后端，并发布最终回答。
- `opentag_agent.py`：构建非交互式 prompt 并调用所选的 CLI 后端。
- `mfs_search.py` 和 `mfs_cat.py`：以限定 scope 的搜索和读取方式调用
  MFS HTTP API。
- `opentag_memory.py`：维护可选的本地种子笔记，并在 MFS 中对其重建索引，
  以支持确定性演示。
- `opentag_doctor.py`：对环境变量、Slack 机器人访问权限、MFS 可达性、
  允许的 scope 以及后端可用性做预检。

Shell 脚本也可以封装这些命令，但在 Slack Web API 调用、JSON 处理、临时
文件、子进程超时以及跨 agent 的后端选择方面，Python 不那么容易出错。

## 运行时契约

Slack 桥接程序在每次被提及时都会调用一个全新的 CLI agent。该运行时
agent 必须遵循 `references/runtime-agent.md`。运行时行为请保留在该文档中，
而不是写进本管理技能。

消息串上下文属于短期状态。持久化上下文应来自被许可的 MFS scope，例如
已索引的 Slack 历史、代码仓库、文档、issue、数据库、对象存储，或可选的
本地种子笔记。可选辅助工具的文件结构参见 `references/memory.md`。

切勿将真实的工作区名称、频道 ID、用户 ID、本地绝对路径或客户/项目细节
硬编码进本技能。在文档和环境变量示例中一律使用占位符。

## 参考文档

- 在配置或运行 Slack 时阅读 `references/slack-adapter.md`。
- 在更改后端选择或命令调用方式时阅读 `references/backends.md`。
- 在更改每次提及的行为时阅读 `references/runtime-agent.md`。
- 仅在使用可选的本地种子笔记时阅读 `references/memory.md`。
