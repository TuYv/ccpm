---
name: local-conversation-history
description: >-
  Lists recent local Claude Code, OpenAI Codex, and Kimi CLI conversations for
  a workspace in one read-only command. Claude inventory combines active config
  homes with every archive registered in ~/.claude/history-sources.json,
  de-duplicates IDs, and uses internal timestamps instead of file mtime. Marks
  every in-scope Codex session whose canonical per-thread advisory lock is held,
  appending hits outside the recent limit; this proves lock state, not holder
  identity or liveness, and no marker does not prove “stopped.” Outputs
  Markdown or JSON with titles, timezone-qualified timestamps, provenance,
  session IDs, runtime/archive markers, and visible diagnostics while excluding
  internal sub-agents by default. Use when the user asks to list or browse local
  chats, task history, or session IDs across Claude Code, Codex, and Kimi CLI
  (kimi-code), or asks which Codex session locks are held or may still be in
  use. Do not use for keyword/full-event search, deleted-file recovery, or
  resuming work.
argument-hint: "[workspace-path]"
---
# 本地对话历史

列出项目范围内的本地历史记录，无需临时拼凑 `rg`、`stat`、`jq` 或 SQLite 管道。随附脚本会在一个进程中完成提供方和归档发现、模式内省、筛选、去重、标题提取、按内部时间排序、仅观察处于持有状态的 Codex 写入锁，以及结果渲染。

## 调用工具前先确定任务

将用户意图作为路由依据；仅有“history”一词并不意味着要进行清单盘点。

| 用户意图 | 路由 |
|---|---|
| 列出最近的对话、标题、日期、会话 ID，或处于持有状态的 Codex 写入锁 | 运行一次此技能随附的清单脚本 |
| 查找曾出现某个主题、操作、引文、文件或工具结果的对话——包括“我记得我们做过 X”“找到那次旧聊天”或“我们以前讨论过 Y 吗？” | 直接调用 `daymade-claude-code:claude-code-history-files-finder`；不要先运行最近记录清单 |
| 继续处理已确定会话中的工作 | 调用相应的 `daymade-claude-code:continue-claude-work` 或 `daymade-claude-code:continue-codex-work` 技能 |

主题线索的优先级高于清单措辞。例如，“查找我们关于 DINO 的历史对话记录”属于全文搜索，即使其中提到了“对话记录”。

路由内容搜索时，保留用户范围中尚未明确的部分：

- 如果提供方未知，或者用户说的是“我们的历史记录”，则要求查找器覆盖 Claude、Codex 和 Kimi CLI；仅有 Claude 的结果不足以支持“不存在”的结论。
- 如果项目未知，则要求查找器搜索所有项目，而不是猜测当前工作区。
- 在将新命中视为历史证据之前，排除当前会话；用户的查询和代理的搜索命令都会记录在当前转录中，否则会匹配到自身。

让查找器自行负责其具体命令、查询扩展、来源诊断和结果解读。此技能只负责决定是进行清单盘点还是搜索。

## 完整性不变量

对于常规 Claude Code 清单，来源集合不可拆分：

1. 自动发现的活跃主目录（`~/.claude`、配置文件主目录以及当前的 `CLAUDE_CONFIG_DIR`），以及
2. 在 `~/.claude/history-sources.json` 中注册的每个归档。

除非输出表明已搜索注册的归档，否则不要声称某个 Claude 对话不存在。所需归档不可用属于严重配置错误，不能以此为由返回不完整的结果。显式指定 `--claude-home` 是用于诊断的范围覆盖，会有意绕过注册表；绝不能用它来作出完整性声明。

## 路由请求

- 列出/查看/显示/浏览本地对话：运行一次随附脚本。
- 对可能仍在使用的 Codex 会话进行初步排查：使用自动添加的 `writer-lock file held` 标记。该命令会探测每个被纳入的 Codex 行，并将任何正命中追加到最近记录行数限制之外。命中仅能证明在快照期间有某个进程持有 Codex 的规范顾问锁；它无法识别该进程，也无法证明会话仍在运行。没有标记的行也无法证明会话已停止。
- 了解已标记的 Codex 会话正在做什么：将其准确的会话 ID 传递给 `daymade-claude-code:continue-codex-work`。标题、最近时间戳或处于持有状态的写入锁标记只能标识线程锁，无法标识其持有者、当前任务或进度。
- 限定为一个提供方：传递 `--source claude`、`--source codex` 或 `--source kimi`（Kimi CLI，也称 kimi-code）。
- 指向非默认的 Kimi CLI 主目录：传递 `--kimi-home <dir>`；解析顺序为 `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。
- 包含某个目录下的子工作区：传递 `--recursive`。
- 列出所有工作区：传递 `--all-projects`；省略 `--cwd`。
- 包含已归档的 Codex 线程或已归档的 Kimi CLI 会话：传递 `--include-archived`。
- 按对话日期进行限制：传递 `--from-date` 和/或 `--to-date`。
- 仅在明确要求时包含内部代理或明显的冒烟测试提示词：传递 `--include-subagents` 或 `--include-automated`。
- 搜索完整转录内容、恢复已删除文件或分析工具调用：改用 `daymade-claude-code:claude-code-history-files-finder` 技能。
- 使用 `daymade-claude-code:continue-claude-work` 重建并继续 Claude Code 会话；对于 Codex 线程，使用 `daymade-claude-code:continue-codex-work`。

## 仅运行一条清单命令

相对于此 SKILL.md 解析 `scripts/list_local_history.py`。不要在机器上搜索该脚本，也不要在内联代码中重新实现其逻辑。

在 macOS 或 Linux 上，如果脚本具有可执行权限位，则直接执行该脚本；否则使用 Python 3。在 Windows 上，使用 `py` 或 `python`：

```text
<skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
py <skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
```

当用户使用中文时，选择 `--language zh`。如果用户未提供路径，请显式传入 shell 的当前工作目录。在 Windows 命令示例中使用正斜杠，同时允许实际的 `--cwd` 值使用平台的原生路径格式。

预期输出已经是可直接展示的 Markdown：

```markdown
# Local conversation history
Scope: `<workspace>`

## Codex — 3 conversations
Runtime: `writer-lock file held` proves lock contention, not holder identity; an unmarked row is not evidence that a session stopped.
| Updated | Title | Session ID | Flags |
|---|---|---|---|
| 2026-01-15 10:30 +00:00 | Review authentication flow | `019...` | writer-lock file held |
```

直接返回该输出，最多附加一条简短说明。不要仅仅为了复述结果而继续运行 `find`、`rg`、`stat` 或数据库调用。当用户询问一个带标记的 Codex 线程正在做什么时，获准使用的后续操作是针对该确切 ID 的 `daymade-claude-code:continue-codex-work`，而不是根据进程名称或 cwd 进行猜测。

## 保持证据边界

将该命令视为清单盘点，而不是对话记录导出：

- 保持脚本只读。它绝不会恢复、重命名、归档、删除或修复对话。
- 仅报告标题；除非用户随后要求查看特定会话，否则不要粘贴原始 JSONL 或完整提示词。
- 保留每个已显示时间戳中的显式时区偏移量。
- 对于 Claude Code，将整个 JSONL 中有效的顶层 `timestamp` 值的最小值和最大值视为会话时间范围。绝不要用文件 mtime 替代：复制或迁移归档会改变 mtime，但不会改变对话时间。
- 对于 Codex，优先使用状态数据库的内部 created/updated 字段。如果数据库不可用，则根据内部顶层事件时间戳以及 `session_meta.payload.timestamp` 计算 rollout 时间范围；绝不要使用 rollout mtime 或数据库文件 mtime 作为时间顺序依据。
- 将 `writer-lock file held` 仅视为以下事实的证据：在快照期间，某个进程持有该线程对应的规范建议锁。它不能识别该进程，也不能证明存在打开的 UI、正在执行的代理、持续进行的工具调用、业务进展、仓库权限或项目租约。每个范围内的 Codex 行都会被探测；`--limit` 范围之外的命中结果会被追加。绝不要把缺少标记反向解读为“非活动”。
- 对于 Kimi CLI，优先使用 `state.json` 的 `createdAt`/`updatedAt`（epoch 毫秒）。如果缺少 `state.json` 或其中没有这些字段，则根据内部 wire `time` 字段（加上元数据记录的 `created_at`，同样为毫秒）计算时间范围；绝不要使用文件 mtime 作为时间顺序依据。
- 仅含日期的筛选条件表示整个本地日历日。日期时间筛选条件必须包含 `Z` 或显式 UTC 偏移量。启用日期筛选时，缺少内部时间戳的会话会被排除，并显示明确警告。
- 完全按照打印结果保留提供商标签和会话 ID。
- 显示脚本输出的警告，不要静默隐藏缺失、不可读或不受支持的存储。
- 不要声称其中包含 Claude Desktop 原生聊天。这里的 Claude 来源是 Claude Code 历史记录；Codex 涵盖本地 Codex CLI/Desktop 线程存储；Kimi CLI 涵盖本地 kimi-code 会话存储，而不是 Kimi Web 产品。

## 处理源配置和故障

该脚本遵循 `CLAUDE_CONFIG_DIR`、`CODEX_HOME` 和 `KIMI_HOME`。只需在 `~/.claude/history-sources.json` 中注册一次持久化的 Claude 归档；之后默认命令会在每次运行时搜索这些归档。使用 `--history-sources <file>` 测试其他注册表。仅当用户明确要求精确限定在单一存储的诊断范围时，才使用 `--claude-home <dir>`、`--codex-home <dir>` 或 `--kimi-home <dir>`。

如果没有显示任何对话，请使用同一命令已输出的诊断信息。当需要诊断格式、路径或写入器锁定观察结果时，请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)；其中记录了源注册表、已检查的存储、内部时间策略、锁语义、Windows 路径规范化以及已知边界。

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、`claude-code-history-files-finder`、`continue-claude-work` 和 `continue-codex-work` 共享的代码唯一事实来源（SSOT）。由于 `sync_core.py` 会将该包复制到各自的 `scripts/_core/` 中，因此这四个技能在安装时仍然是自包含的。切勿直接编辑捆绑的 `_core` 副本。

更改共享代码后，请同步并验证全部四个捆绑包，然后运行此技能的标准库回归测试套件：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```

该测试套件会构建隔离的 Claude 和 Codex 固件，包括 SQLite 和原始 JSONL 路径，因此绝不会依赖维护者的个人对话内容。开发触发用例位于 `evals/evals.json` 中。