---
name: bm-setup
description: Set up Basic Memory for Codex at user or project level by mapping a Basic Memory project and seeding schemas.
---
# Codex 的 Basic Memory 基础设置

设置当前仓库，使 Codex 能够从 Basic Memory 获取上下文，并将工作检查点写回其中。保持问询简短，但在选择数据写入位置之前务必先询问用户。

## 前置条件

在修改文件之前，确认 Basic Memory 可访问：

1. 优先使用 MCP：调用 `list_memory_projects`。
2. 如果 MCP 工具不可用，则运行 `basic-memory --version` 或 `bm --version`。
3. 如果两者都不可用，则停止操作，并告知用户安装 Basic Memory 并连接 MCP 服务器。该插件包含一个用于启动
   `uvx --prerelease=allow basic-memory mcp` 的 `.mcp.json`。
4. 在问询之前列出可用项目。尽可能包含云端/本地来源、工作区、限定名称和项目 id。

## 问询

请用户选择项目映射。不要根据仓库、默认项目、当前目录或之前的本地状态推断写入目标。

- config level：用户级 `~/.codex/basic-memory.json` 或项目级
  `.codex/basic-memory.json`。明确询问用户，并默认推荐用户级配置。项目设置会逐项覆盖用户设置。
- storage mode：cloud、local 或 mixed。优先采用用户明确指定的模式，而不是任何 CLI 默认值。
- `focus`：code/dev、research、writing、planning 或 mixed。
- `sessionProfile`：`coding` 或 `general`。对于 code/dev，建议使用 `coding`。对于 mixed，询问用户该仓库是否应记录 Git 和拉取请求上下文。不要仅仅因为当前目录是 Git
  checkout 就推断应使用 `coding`。
- `primaryProject`：一个现有的 Basic Memory 项目，或要创建的新项目。
- `secondaryProjects`：可选的只读项目，用于会话开始时提供上下文。
- `teamProjects`：可选的 `bm-share` 共享目标。
- `captureFolder`：默认为 `codex/<repo-dir>`，根据 Git 顶层目录推导。只有当用户想要显式覆盖时才询问。
- `rememberFolder`：默认为 `codex/remember`。
- `placementConventions`：简要说明决策、任务和研究笔记应存放的位置。默认将决策存放到
  `codex/decisions`，使 Codex 编写的记忆保持在同一目录树下。
- `checkpointOnCompact`：压缩后，SessionStart 是否要求 Codex 运行 `bm-checkpoint`。默认为
  `true`；显式的 JSON 布尔值 `false` 表示选择退出。
- `captureEvents`：是否在本地钩子收件箱中记录生命周期事件信封。默认为
  `true`；显式的 JSON 布尔值 `false` 表示选择退出。
- MCP 审批：要求用户在以下两种模式中**准确选择一种**：
  1. 保持 Codex 的默认审批行为。无需修改 Codex 配置。
  2. 预先批准来自 Basic Memory MCP 服务器的符合条件的工具。这只会针对 Basic Memory
     设置 `default_tools_approval_mode = "approve"`。
  不要提供按工具或仅写入工具的信任配置。说明服务器信任设置会改变 Codex 的审批体验，但不会授予 Basic Memory 访问任何新的工作区、项目或文件的权限。对于声明了破坏性注解的工具（包括 Basic Memory 的写入、编辑和删除工具），Codex 仍然需要审批。

对于 `coding` 会话配置，验证当前目录位于 Git
仓库内。根据当前 GitHub 仓库或 origin 远程仓库解析出稳定的
`repository` 标识符，例如 `owner/name`，向用户显示该标识符并请求确认。
当远程仓库缺失或存在歧义时，不要进行猜测。说明 coding 检查点会在 Basic Memory
中存储结构化的仓库、分支、SHA、工作目录以及可选的拉取请求元数据。

在请求确认前说明捕获功能的权衡：启用捕获后会添加本地事件轨迹，该轨迹会一直排队，直到
`bm hook flush` 将其归档到本地。
它绝不会创建知识图谱笔记，也不会写入团队项目。默认启用；显式 JSON 布尔值
`false` 会禁用该功能，格式错误的值则安全地关闭该功能。

如果存在重名项目，显示限定名称并询问用户要使用哪一个。
对于云端项目，优先使用限定项目名称或项目 id。
未经确认，绝不要在云端和本地版本之间自行选择。

对于新项目或空项目，建议采用简洁的约定，而不是创建空文件夹。
对于现有项目，在总结实际约定之前，检查 `list_directory` 和几篇笔记。

## 应用

确认计划后，将共享设置写入选定的用户级或项目级文件：

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

省略 `captureFolder` 以使用 `codex/<repo-dir>`；仅在显式覆盖时持久化该字段。
如果选定的文件已存在，保留无关的键。用户选择云端、本地或混合路由时，包含
`projectMode`。始终将
`checkpointOnCompact` 和 `captureEvents` 持久化为 JSON 布尔值。

这些文件专用于 Codex；不要写入 `.claude/settings.json`。

对于用户级 coding 设置，从共享用户文件中省略 `sessionProfile`，并将 coding 配置和已确认的仓库标识符都保存在项目文件中，以免其中任何一项影响其他仓库：

```json
{
  "basicMemory": {
    "sessionProfile": "coding",
    "repository": "owner/name"
  }
}
```

对于项目级设置，将 `repository` 添加到同一项目文件中的共享设置里。

在选定的文件中显式持久化 `sessionProfile`，但用户级 coding 设置除外；在这种情况下，
它应与 `repository` 一起放在项目文件中。仅对 `coding` 配置持久化 `repository`，并且必须在用户确认后执行。由于 `coding_session`
架构要求可查询的 Git 身份字段，因此没有仓库标识符的 coding 设置是不完整的。

### 应用 MCP 批准选择

批准选择应写入 `~/.codex/config.toml`，而不是
`.codex/basic-memory.json`。

如果用户保留 Codex 的默认批准行为，请勿更改
`~/.codex/config.toml`。

如果用户选择预先批准符合条件的 Basic Memory 工具，请检查现有的
Codex 配置，并确定哪个 Basic Memory 服务器条目处于活动状态：

- 对于 marketplace 插件，使用：

  ```toml
  [plugins."codex@basic-memory".mcp_servers.basic-memory]
  default_tools_approval_mode = "approve"
  ```

- 对于独立 MCP 服务器，将设置添加到其现有表中：

  ```toml
  [mcp_servers.basic-memory]
  default_tools_approval_mode = "approve"
  ```

如果两个条目都存在且无法确定活动路由，请询问用户 Codex 应使用哪一个。不要在未告知的情况下同时设置两者。在编辑用户级 Codex 配置之前，显示确切的变更内容并获得明确确认。保留所有无关的 TOML 键，绝不要创建重复的表。如果无法安全编辑文件，请将确切的适用片段作为待完成的设置步骤提供。

此服务器级设置会减少符合条件的工具所触发的提示，但不会削弱 Codex 的全局批准策略。对于声明了破坏性注解的 MCP 工具，它无法抑制 Codex 强制要求的批准，因此 Basic Memory 的写入、编辑和删除操作仍可能触发提示。不要设置 `approval_policy = "never"`，也不要更改沙箱设置。告知用户配置更改后启动新的 Codex 线程。受管理的组织策略可能会要求额外的批准。

## 初始化 Schema

从 `<plugin-root>/schemas/` 读取 schema 文件。此 skill 位于
`<plugin-root>/skills/bm-setup/SKILL.md`，因此 schemas 位于上两级目录。

如果所选配置文件对应的会话 schema 尚不存在，请将其初始化到选定的
`primaryProject` 中：

- `coding-session.md`，用于 `sessionProfile: coding`
- `codex-session.md`，用于 `sessionProfile: general`

然后为两种配置文件都初始化以下 schemas：

- `decision.md`
- `task.md`

这些 schemas 涵盖 Codex 直接写入的笔记。生命周期信封不是笔记：
`bm hook flush` 会在本地归档该操作跟踪，因此无需初始化投影的会话或工具记录 schema。

使用 `write_note`，并设置 `directory="schemas"`、将 schema frontmatter 作为元数据，以及将 Markdown 正文作为内容。不要将 YAML frontmatter 粘贴到内容中。

初始化 schemas 之前，重述确切的目标项目；如果该项目与用户选定的主项目不同，或者路由存在歧义，请请求确认。

## 验证

结束前，证明映射正常工作：

- 使用页面大小 10，在主项目中搜索 `type=schema`。对于 coding
  配置，确认存在 `Coding Session` schema。
- 如果配置了共享项目，在其中一个共享项目中搜索未完成的决策。
- 运行 `basic-memory hook status --harness codex --project-dir <repo-root>`（必要时使用
  `bm` 或 `uvx --prerelease=allow basic-memory`）。确认它找到此仓库的设置，并报告所选项目、会话配置文件、仓库以及预期的检查点提示和捕获状态。
  其收件箱计数在各 harness 之间共享。
- 如果任何检查出错，请在结束前修复项目引用或 hook 启动器。

最后给出项目映射、已初始化或跳过的架构、检查点提示、捕获选项、MCP 批准模式、共享收件箱状态以及验证结果。  
告知用户，在 Codex 中运行插件钩子之前，需要先对其进行审查并信任。