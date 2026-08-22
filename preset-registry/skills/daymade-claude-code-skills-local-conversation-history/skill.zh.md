---
name: local-conversation-history
description: >-
  Lists recent local Claude Code, OpenAI Codex, and Kimi CLI conversations for
  a workspace in one read-only command. For Claude Code, the default inventory
  combines every active config home with every long-term archive registered in
  ~/.claude/history-sources.json, de-duplicates session IDs, and orders or
  filters by internal JSONL timestamps rather than file mtime. Produces readable
  Markdown or JSON with titles, timezone-qualified timestamps, provenance,
  session IDs, and archive/test markers while excluding internal sub-agent noise
  by default; Codex raw-rollout fallback and Kimi CLI state.json/wire parsing
  also compute internal record bounds without mtime. Use when the user asks to
  list, show, or browse recent local chats, task history, or session IDs across
  Claude Code, Codex, and Kimi CLI (kimi-code). Do not use for
  keyword/full-event search, deleted-file recovery, or resuming work.
argument-hint: "[workspace-path]"
---
# 本地对话历史

列出项目范围内的本地历史记录，无需临时拼凑 `rg`、`stat`、`jq` 或 SQLite 管道。随附脚本会在单个进程中完成提供方与归档发现、模式内省、筛选、去重、标题提取、按内部时间排序及渲染。

## 完整性不变量

对于常规的 Claude Code 清单，来源集合不可分割：

1. 自动发现的活动主目录（`~/.claude`、配置文件主目录以及当前的 `CLAUDE_CONFIG_DIR`），以及
2. 在 `~/.claude/history-sources.json` 中注册的每个归档。

除非输出显示已搜索注册的归档，否则不要声称某个 Claude 对话不存在。所需归档不可用属于严重的配置错误，不能以此为由返回不完整的结果。显式指定 `--claude-home` 是一种诊断范围覆盖，会有意绕过注册表；绝不要将其用于完整性声明。

## 对请求进行路由

- 列出/查看最近的/显示/浏览本地对话：运行随附脚本一次。
- 仅限一个提供方：传递 `--source claude`、`--source codex` 或 `--source kimi`（Kimi CLI，也称 kimi-code）。
- 指向非默认的 Kimi CLI 主目录：传递 `--kimi-home <dir>`；解析顺序为 `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。
- 包含某个目录下的子工作区：传递 `--recursive`。
- 列出所有工作区：传递 `--all-projects`；省略 `--cwd`。
- 包含已归档的 Codex 线程或已归档的 Kimi CLI 会话：传递 `--include-archived`。
- 按对话日期进行限制：传递 `--from-date` 和/或 `--to-date`。
- 仅在明确要求时包含内部代理或明显的冒烟测试提示词：传递 `--include-subagents` 或 `--include-automated`。
- 在完整转录中搜索、恢复已删除的文件或分析工具调用：改用 `daymade-claude-code:claude-code-history-files-finder` 技能。
- 使用 `daymade-claude-code:continue-claude-work` 重建并继续 Claude Code 会话；对于 Codex 线程，使用 `daymade-claude-code:continue-codex-work`。

## 仅运行一条清单命令

相对于此 SKILL.md 解析 `scripts/list_local_history.py`。不要在机器上搜索该脚本，也不要以内联方式重新实现其逻辑。

在 macOS 或 Linux 上，如果脚本具有可执行权限，则直接执行；否则使用 Python 3。在 Windows 上，使用 `py` 或 `python`：

```text
<skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
py <skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
```

当用户使用中文时，选择 `--language zh`。如果用户未提供路径，请显式传递 shell 的当前工作目录。在 Windows 命令示例中使用正斜杠，同时允许实际的 `--cwd` 值使用平台原生路径格式。

预期输出已经是可直接展示的 Markdown：

```markdown
# Local conversation history
Scope: `<workspace>`

## Claude Code — 3 conversations
| Updated | Title | Session ID | Source | Flags |
|---|---|---|---|---|
| 2026-01-15 10:30 +00:00 | Review authentication flow | `019...` | active:main, archive:long-term | — |
```

直接返回该输出，最多附带一条简短说明。不要仅仅为了复述结果而运行后续的
`find`、`rg`、`stat` 或数据库调用。

## 保持证据边界

将该命令视为清单工具，而非对话记录导出工具：

- 保持脚本只读。它绝不会恢复、重命名、归档、删除或修复对话。
- 仅报告标题；除非用户之后要求查看特定会话，否则不要粘贴原始 JSONL 或完整提示词。
- 保留每个已显示时间戳中的明确时区偏移量。
- 对于 Claude Code，将整个 JSONL 中有效的顶层 `timestamp` 值的最小值和最大值视为会话时间范围。绝不要用文件 mtime 代替：复制或迁移归档会改变 mtime，但不会改变对话时间。
- 对于 Codex，优先使用状态数据库内部的创建/更新时间字段。如果数据库不可用，则根据内部顶层事件时间戳以及 `session_meta.payload.timestamp` 计算 rollout 时间范围；绝不要使用 rollout mtime 或数据库文件 mtime 作为时间顺序依据。
- 对于 Kimi CLI，优先使用 `state.json` 的 `createdAt`/`updatedAt`（Unix 纪元毫秒数）。如果缺少 `state.json` 或其中没有这些字段，则根据内部 wire `time` 字段（以及元数据记录中的 `created_at`，同样以毫秒为单位）计算时间范围；绝不要使用文件 mtime 作为时间顺序依据。
- 仅含日期的筛选条件表示对应本地日历日的全天。日期时间筛选条件必须包含 `Z` 或明确的 UTC 偏移量。启用日期筛选时，没有内部时间戳的会话将被排除，并显示明确警告。
- 完全按输出内容保留提供商标签和会话 ID。
- 应原样说明脚本给出的警告，不要静默隐藏缺失、不可读或不受支持的存储。
- 不要声称其中包含 Claude Desktop 原生聊天。此处的 Claude 来源是 Claude Code 历史记录；Codex 涵盖本地 Codex CLI/Desktop 线程存储；Kimi CLI 涵盖本地 kimi-code 会话存储，而非 Kimi Web 产品。

## 处理来源配置和故障

该脚本支持 `CLAUDE_CONFIG_DIR`、`CODEX_HOME` 和 `KIMI_HOME`。只需在 `~/.claude/history-sources.json` 中注册一次持久化 Claude 归档，之后默认命令每次运行时都会搜索这些归档。使用 `--history-sources <file>` 测试其他注册表。仅当用户明确要求精确的单一存储诊断范围时，才使用 `--claude-home <dir>`、`--codex-home <dir>` 或 `--kimi-home <dir>`。

如果没有显示任何对话，请使用同一命令已经输出的诊断信息。仅当需要诊断格式或路径时，才阅读
[references/storage_and_portability.md](references/storage_and_portability.md)；
其中记录了来源注册表、被检查的存储、内部时间策略、Windows 路径规范化以及已知边界。

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、`claude-code-history-files-finder`、`continue-claude-work` 和 `continue-codex-work` 共享代码的唯一事实来源（SSOT）。由于 `sync_core.py` 会将该包复制到各自的 `scripts/_core/` 中，因此这四个技能在安装时仍保持自包含。绝不要直接编辑捆绑的 `_core` 副本。

更改共享代码后，请同步并验证全部四个包，然后运行此技能的标准库回归测试套件：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```

该测试套件会构建相互隔离的 Claude 和 Codex 测试夹具，其中包括 SQLite 和原始 JSONL 路径，因此它绝不会依赖维护者的个人对话内容。开发触发用例位于 `evals/evals.json` 中。