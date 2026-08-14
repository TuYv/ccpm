---
name: bm-setup
description: Set up Basic Memory for Codex at user or project level by mapping a Basic Memory project and seeding schemas.
---
# Codex 的 Basic Memory 基础设置

设置当前仓库，使 Codex 能够通过 Basic Memory 了解上下文，并将工作检查点回存其中。访谈应保持简短，但在选择数据写入位置之前必须始终询问用户。

## 前置条件

更改文件前，确认 Basic Memory 可访问：

1. 优先使用 MCP：调用 `list_memory_projects`。
2. 如果 MCP 工具不可用，运行 `basic-memory --version` 或 `bm --version`。
3. 如果两者均不可用，则停止操作，并告知用户安装 Basic Memory 并连接 MCP 服务器。该插件内置一个 `.mcp.json`，用于启动 `uvx basic-memory mcp`。
4. 在访谈前列出可用项目。可用时，包括云端/本地来源、工作区、限定名称和项目 ID。

## 访谈

要求用户选择项目映射。不要根据仓库、默认项目、当前目录或之前的本地状态推断写入目标。

- 配置级别：用户级 `~/.codex/basic-memory.json` 或项目级 `.codex/basic-memory.json`。明确询问，并默认推荐用户级。项目设置会逐项覆盖用户设置。
- 存储模式：云端、本地或混合。优先采用用户明确指定的模式，而非任何 CLI 默认值。
- `focus`：代码/开发、研究、写作、规划或混合。
- `sessionProfile`：`coding` 或 `general`。对于代码/开发，推荐 `coding`。对于混合用途，询问此仓库是否应捕获 Git 和拉取请求上下文。不要仅仅因为当前目录是 Git 检出目录就推断应使用 `coding`。
- `primaryProject`：现有的 Basic Memory 项目，或要创建的新项目。
- `secondaryProjects`：可选的只读项目，用于会话开始时提供上下文。
- `teamProjects`：可选的共享目标，供 `bm-share` 使用。
- `captureFolder`：默认为 `codex/<repo-dir>`，从 Git 顶层目录派生。仅当用户想要显式覆盖时才询问。
- `rememberFolder`：默认为 `codex/remember`。
- `placementConventions`：一条简短说明，用于规定决策、任务和研究笔记应存放的位置。决策默认存放到 `codex/decisions`，以便 Codex 编写的记忆内容都位于同一目录树下。
- `checkpointOnCompact`：压缩后的 SessionStart 是否要求 Codex 运行 `bm-checkpoint`。默认为 `true`；显式设置 JSON 布尔值 `false` 可选择退出。
- `captureEvents`：是否在本地钩子收件箱中记录生命周期事件信封。默认为 `true`；显式设置 JSON 布尔值 `false` 可选择退出。
- MCP 审批：要求用户从以下两种模式中准确选择一种：
  1. 保留 Codex 的默认审批行为。这不需要更改 Codex 配置。
  2. 预先批准 Basic Memory MCP 服务器中符合条件的工具。这只会为 Basic Memory 设置 `default_tools_approval_mode = "approve"`。
  不要提供按工具或仅写入的信任配置。说明服务器信任会改变 Codex 的审批交互体验，但不会授予 Basic Memory 对任何新工作区、项目或文件的访问权限。对于声明了破坏性注解的工具，包括 Basic Memory 的写入、编辑和删除工具，Codex 仍然需要审批。

对于 `coding` 会话配置，请确认当前目录位于 Git 仓库内。从当前 GitHub 仓库或 origin 远程仓库中解析出稳定的 `repository` 标识符（例如 `owner/name`），将其展示给用户并请求确认。当远程仓库缺失或存在歧义时，不要猜测。说明编码检查点会在 Basic Memory 中存储结构化的仓库、分支、SHA、工作目录以及可选的拉取请求元数据。

在询问之前说明捕获功能的权衡：启用捕获后会添加本地事件轨迹，这些事件会保持在队列中，直到 `bm hook flush` 将其归档到本地。
它绝不会创建知识图谱笔记，也不会写入团队项目。默认启用；显式的 JSON 布尔值 `false` 会将其禁用，而格式错误的值会按关闭状态处理。

如果存在重名，请显示限定名称，并询问用户要使用哪一个。对于云项目，优先使用限定项目名称或项目 ID。未经确认，绝不要在云端与本地变体之间做出选择。

对于新项目或空项目，建议采用轻量级约定，而不是创建空文件夹。对于现有项目，请先检查 `list_directory` 和一些笔记，再总结实际采用的约定。

## 应用

确认方案后，将共享设置写入选定的用户级或项目级文件：

```json
{
  "basicMemory": {
    "primaryProject": "<project-ref>",
    "secondaryProjects": [],
    "projectMode": "cloud",
    "teamProjects": {},
    "focus": "<focus>",
    "sessionProfile": "<general-or-coding>",
    "rememberFolder": "codex/remember",
    "recallTimeframe": "7d",
    "checkpointOnCompact": true,
    "captureEvents": true,
    "placementConventions": "Put decisions in codex/decisions/ and work checkpoints in codex/<repo-dir>/."
  }
}
```

省略 `captureFolder` 即可使用 `codex/<repo-dir>`；仅在显式覆盖时才持久化该字段。如果选定的文件已存在，请保留不相关的键。如果用户选择了云端、本地或混合路由，请包含 `projectMode`。始终将 `checkpointOnCompact` 和 `captureEvents` 持久化为 JSON 布尔值。这些文件特意仅供 Codex 使用；不要写入 `.claude/settings.json`。

对于用户级编码设置，请从共享用户文件中省略 `sessionProfile`，并将编码配置和已确认的仓库标识符都保存在项目文件中，以确保它们不会影响其他仓库：

```json
{
  "basicMemory": {
    "sessionProfile": "coding",
    "repository": "owner/name"
  }
}
```

对于项目级设置，请将 `repository` 添加到同一项目文件中的共享设置里。

请在选定文件中显式持久化 `sessionProfile`，但用户级编码设置除外；在这种情况下，它应与 `repository` 一起保存在项目文件中。仅当配置为 `coding` 且用户确认后，才持久化 `repository`。缺少仓库标识符的编码设置是不完整的，因为 `coding_session` 模式要求提供可查询的 Git 标识字段。

### 应用 MCP 审批选项

审批选项应保存在 `~/.codex/config.toml` 中，而不是
`.codex/basic-memory.json`。

如果用户保留 Codex 的默认审批行为，请勿更改
`~/.codex/config.toml`。

如果用户选择预先批准符合条件的 Basic Memory 工具，请检查现有的 Codex 配置，并确定当前启用的是哪个 Basic Memory 服务器条目：

- 对于市场插件，请使用：

  ```toml
  [plugins."codex@basic-memory".mcp_servers.basic-memory]
  default_tools_approval_mode = "approve"
  ```

- 对于独立的 MCP 服务器，请将该设置添加到其现有表中：

  ```toml
  [mcp_servers.basic-memory]
  default_tools_approval_mode = "approve"
  ```

如果两个条目都存在，且无法确定当前启用的路由，请询问用户 Codex 应使用哪一个。不要在未告知用户的情况下同时设置两者。在编辑用户级 Codex 配置之前，先展示具体的更改内容并获得明确确认。保留所有无关的 TOML 键，且绝不要创建重复的表。如果无法安全地编辑该文件，请提供确切适用的片段，将其作为待完成的设置步骤。

此服务器范围的设置可以减少符合条件的工具所触发的提示，同时不会削弱 Codex 的全局审批策略。它无法取消 Codex 对声明了破坏性注解的 MCP 工具所要求的强制审批，因此 Basic Memory 的写入、编辑和删除操作仍可能触发提示。不要设置 `approval_policy = "never"`，也不要更改沙箱设置。告知用户在配置更改后启动一个新的 Codex 线程。组织的托管策略可能会实施额外审批。

## 初始化 Schema

从 `<plugin-root>/schemas/` 读取 schema 文件。此 skill 位于
`<plugin-root>/skills/bm-setup/SKILL.md`，因此 schemas 目录位于其上两级。

如果所选 `primaryProject` 中尚不存在与所选配置文件相关的会话 schema，请将其初始化到该项目中：

- `sessionProfile: coding` 对应 `coding-session.md`
- `sessionProfile: general` 对应 `codex-session.md`

然后为这两种配置文件初始化以下 schema：

- `decision.md`
- `task.md`

这些 schema 涵盖 Codex 直接写入的笔记。生命周期封装不是笔记：`bm hook flush` 会在本地归档该操作轨迹，因此无需初始化投影会话或工具账本 schema。

使用 `write_note`，并指定 `directory="schemas"`、`note_type="schema"`，将 schema frontmatter 作为 metadata，将 Markdown 正文作为 content。不要将 YAML frontmatter 粘贴到 content 中。

初始化 schema 之前，请再次说明确切的目标项目；如果该项目不同于用户所选的主项目，或者路由存在歧义，请请求确认。

## 验证

结束之前，请证明映射能够正常工作：

- 在主项目中搜索 `type=schema`，页面大小设为 10。对于 coding 设置，确认存在 `Coding Session` schema。
- 如果配置了共享项目，请在其中一个共享项目中搜索未关闭的决策。
- 运行 `basic-memory hook status --harness codex --project-dir <repo-root>`（必要时使用 `bm` 或 `uvx basic-memory`）。确认它能找到此仓库的设置，并报告所选项目、会话配置文件、仓库，以及预期的检查点提示和捕获状态。
  其收件箱计数在各个 harness 之间共享。
- 如果任何检查出错，请先修复项目引用或 hook 启动器，然后再结束。

最后说明项目映射、架构是已填充还是已跳过、检查点提示、捕获选项、MCP 审批模式、共享收件箱状态以及验证结果。

告知用户，插件钩子在运行前需要在 Codex 中经过审查和信任。